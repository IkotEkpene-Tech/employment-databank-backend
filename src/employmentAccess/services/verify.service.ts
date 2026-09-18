import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { hashForLookup } from "../../configurations/encryption";
import { compareSecret } from "../../auth/auth.helpers";
import { toTitleCase } from "../../configurations/utils";
import verifyNIN from "../../configurations/nin-provider";

const CONFIRMED_STATUSES = [
  ApplicationStatus.NinVerified,
  ApplicationStatus.InProgress,
  ApplicationStatus.Submitted,
];

/** Shared by verify.service.ts and confirm.service.ts: throws unless this
 * user is holding a live, unexpired access code issued for exactly this NIN. */
export const assertLiveAccessCode = async (
  userId: string,
  nin: string,
  accessCode: string,
): Promise<User> => {
  const user = await User.findByPk(userId);

  const invalidError = errorUtilities.createError(
    "Invalid NIN or access code",
    StatusCodes.UNAUTHORIZED,
  );

  if (!user) throw invalidError;

  const ninHash = hashForLookup(nin);
  const accessCodeNinHash = user.get("accessCodeNinHash") as string | null;
  const accessCodeHash = user.get("accessCodeHash") as string | null;

  if (!accessCodeHash || !accessCodeNinHash || accessCodeNinHash !== ninHash) {
    throw invalidError;
  }

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

export const isAlreadyConfirmedForNin = (user: User, nin: string): boolean => {
  const ninHash = hashForLookup(nin);
  return (
    CONFIRMED_STATUSES.includes(
      user.get("applicationStatus") as ApplicationStatus,
    ) && user.get("ninHash") === ninHash
  );
};

const verifyEmploymentAccessService = errorUtilities.withServiceErrorHandling(
  async (userId: string, nin: string, accessCode: string) => {
    const user = await assertLiveAccessCode(userId, nin, accessCode);

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
          alreadyConfirmed: true,
        },
      );
    }

    const ninData = await verifyNIN(nin.trim());

    // Match the casing confirm.service.ts will actually save, so what the
    // user is asked to approve here is exactly what ends up on their profile.
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "NIN verified",
      {
        firstName: toTitleCase(ninData.firstname) ?? undefined,
        surname: toTitleCase(ninData.lastname) ?? undefined,
        otherName: toTitleCase(ninData.middlename) ?? undefined,
        dob: ninData.birthdate,
        gender: ninData.gender ? ninData.gender.trim().toLowerCase() : undefined,
        alreadyConfirmed: false,
      },
    );
  },
);

export default verifyEmploymentAccessService;
