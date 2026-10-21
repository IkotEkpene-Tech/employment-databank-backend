import { literal, Op } from "sequelize";
import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { hashForLookup } from "../../configurations/encryption";
import { compareSecret } from "../../auth/auth.helpers";
import { toTitleCase } from "../../configurations/utils";
import verifyNIN, { NinProviderError } from "../../configurations/nin-provider";

const CONFIRMED_STATUSES = [
  ApplicationStatus.NinVerified,
  ApplicationStatus.InProgress,
  ApplicationStatus.Submitted,
];

/** Provider result held between POST /verify and POST /confirm. */
export interface CachedNinVerification {
  firstName?: string | undefined;
  surname?: string | undefined;
  otherName?: string | undefined;
  dob?: string | undefined; // ISO YYYY-MM-DD
  gender?: string | undefined;
  photo?: string | undefined;
}

/** Shared by verify.service.ts and confirm.service.ts: throws unless this
 * user is holding a live, unexpired access code. Codes belong to the
 * account (email), not to a NIN. */
export const assertLiveAccessCode = async (
  userId: string,
  accessCode: string,
): Promise<User> => {
  const user = await User.findByPk(userId);

  const invalidError = errorUtilities.createError(
    "Invalid access code",
    StatusCodes.UNAUTHORIZED,
  );

  if (!user) throw invalidError;

  const accessCodeHash = user.get("accessCodeHash") as string | null;
  if (!accessCodeHash) throw invalidError;

  const expiresAt = user.get("accessCodeExpiresAt") as Date | null;
  if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) {
    throw errorUtilities.createError(
      "Your access code has expired. Please pay again for a new one.",
      StatusCodes.BAD_REQUEST,
    );
  }
  if (!(await compareSecret(accessCode, accessCodeHash))) {
    throw invalidError;
  }
  return user;
};

export const trialsRemaining = (user: User): number =>
  Math.max(
    (user.get("accessCodeMaxTrials") as number) -
      (user.get("accessCodeTrialsUsed") as number),
    0,
  );

export const isAlreadyConfirmedForNin = (user: User, nin: string): boolean => {
  const ninHash = hashForLookup(nin);
  return (
    CONFIRMED_STATUSES.includes(
      user.get("applicationStatus") as ApplicationStatus,
    ) && user.get("ninHash") === ninHash
  );
};

export const readNinCache = (
  user: User,
  nin: string,
): CachedNinVerification | null => {
  const raw = user.get("ninVerificationData") as string | null;
  if (!raw || user.get("ninVerificationHash") !== hashForLookup(nin)) {
    return null;
  }
  try {
    return JSON.parse(raw) as CachedNinVerification;
  } catch {
    return null;
  }
};

// Atomic: the WHERE clause is what stops two concurrent requests from
// both spending the last trial.
const reserveTrial = async (userId: string): Promise<boolean> => {
  const [affected] = await User.update(
    { accessCodeTrialsUsed: literal('"accessCodeTrialsUsed" + 1') as any },
    {
      where: {
        id: userId,
        accessCodeTrialsUsed: { [Op.lt]: literal('"accessCodeMaxTrials"') },
      },
    },
  );
  return affected > 0;
};

const refundTrial = async (userId: string) => {
  await User.update(
    {
      accessCodeTrialsUsed: literal(
        'GREATEST("accessCodeTrialsUsed" - 1, 0)',
      ) as any,
    },
    { where: { id: userId } },
  );
};

const verifyEmploymentAccessService = errorUtilities.withServiceErrorHandling(
  async (userId: string, nin: string, accessCode: string) => {
    const user = await assertLiveAccessCode(userId, accessCode);
    const ninHash = hashForLookup(nin);

    if (isAlreadyConfirmedForNin(user, nin)) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "NIN already confirmed",
        {
          firstName: user.get("firstName"),
          surname: user.get("surname"),
          otherName: user.get("otherName") ?? undefined,
          dob: user.get("dateOfBirth"),
          gender: user.get("gender"),
          photo: user.get("photo") ?? undefined,
          alreadyConfirmed: true,
          trialsRemaining: trialsRemaining(user),
          maxTrials: user.get("accessCodeMaxTrials"),
        },
      );
    }

    if (
      CONFIRMED_STATUSES.includes(
        user.get("applicationStatus") as ApplicationStatus,
      ) &&
      user.get("ninHash")
    ) {
      throw errorUtilities.createError(
        "A different NIN has already been confirmed on this account. Please enter that NIN.",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Checked before spending money on a provider lookup.
    const conflict = await User.findOne({ where: { ninHash } });
    if (conflict && conflict.get("id") !== userId) {
      throw errorUtilities.createError(
        "This NIN has already been used for an application on another account",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Same NIN already looked up on this code: serve it from the cache —
    // free, and it doesn't burn a trial.
    const cached = readNinCache(user, nin);
    if (cached) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "NIN verified",
        {
          ...cached,
          alreadyConfirmed: false,
          trialsRemaining: trialsRemaining(user),
          maxTrials: user.get("accessCodeMaxTrials"),
        },
      );
    }

    if (!(await reserveTrial(userId))) {
      throw errorUtilities.createError(
        "You have used all your NIN verification attempts on this access code. Please pay for a new access code to continue.",
        StatusCodes.FORBIDDEN,
      );
    }

    let ninData;
    try {
      ninData = await verifyNIN(nin.trim());
    } catch (error: any) {
      const counted = error instanceof NinProviderError && error.countsAsTrial;
      // Only a real answer from LumiID costs a trial. Anything else — our
      // network, their outage, unexpected crash — gives it back.
      if (!counted) await refundTrial(userId);

      const updated = await User.findByPk(userId);
      const left = updated ? trialsRemaining(updated) : 0;
      const message =
        error instanceof NinProviderError
          ? counted
            ? `${error.message} You have ${left} attempt${left === 1 ? "" : "s"} left.`
            : error.message
          : "Could not verify your NIN right now. This did not use up one of your attempts — please try again.";
      throw errorUtilities.createError(
        message,
        error instanceof NinProviderError ? error.statusCode : 502,
        { trialsRemaining: left },
      );
    }

    // Match the casing confirm.service.ts will actually save, so what the
    // user is asked to approve here is exactly what ends up on their profile.
    const result: CachedNinVerification = {
      firstName: toTitleCase(ninData.firstname) ?? undefined,
      surname: toTitleCase(ninData.lastname) ?? undefined,
      otherName: toTitleCase(ninData.middlename) ?? undefined,
      dob: ninData.birthdate || undefined,
      gender: ninData.gender ? ninData.gender.trim().toLowerCase() : undefined,
      photo: ninData.photo || undefined,
    };

    user.set("ninVerificationHash", ninHash);
    user.set("ninVerificationData", JSON.stringify(result));
    await user.save({ fields: ["ninVerificationHash", "ninVerificationData"] });

    const fresh = await User.findByPk(userId);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "NIN verified",
      {
        ...result,
        alreadyConfirmed: false,
        trialsRemaining: fresh ? trialsRemaining(fresh) : 0,
        maxTrials: user.get("accessCodeMaxTrials"),
      },
    );
  },
);

export default verifyEmploymentAccessService;
