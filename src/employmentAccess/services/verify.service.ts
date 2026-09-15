import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { hashForLookup } from "../../configurations/encryption";
import { compareSecret } from "../../auth/auth.helpers";
import verifyNIN from "../../configurations/nin-provider";
import bcrypt from "bcryptjs";

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

  console.log("assertLiveAccessCode1", { userId, nin, accessCode, user });

  const invalidError = errorUtilities.createError(
    "Invalid NIN or access code",
    StatusCodes.UNAUTHORIZED,
  );

  if (!user) throw invalidError;

  const ninHash = hashForLookup(nin);
  const accessCodeNinHash = user.get("accessCodeNinHash") as string | null;
  const accessCodeHash = user.get("accessCodeHash") as string | null;

  console.log("assertLiveAccessCode21", {
    ninHash,
    accessCodeNinHash,
    accessCodeHash,
  });

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

  console.log("assertLiveAccessCode27", await bcrypt.compare(accessCode, accessCodeHash));

  if (!(await compareSecret(accessCode, accessCodeHash))) {
    throw invalidError;
  }

   console.log("assertLiveAccessCode2745", {
    user});
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

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "NIN verified",
      {
        firstName: ninData.firstname,
        surname: ninData.lastname,
        otherName: ninData.middlename ?? undefined,
        dob: ninData.birthdate,
        gender: ninData.gender,
        alreadyConfirmed: false,
      },
    );
  },
);

export default verifyEmploymentAccessService;
