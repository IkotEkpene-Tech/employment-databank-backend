import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { hashForLookup } from "../../configurations/encryption";
import { serializeUser } from "../../auth/auth.helpers";
import {
  assertLiveAccessCode,
  isAlreadyConfirmedForNin,
  readNinCache,
} from "./verify.service";

/**
 * Saves the NIN + identity details that POST /verify already fetched from
 * the provider. Deliberately makes NO provider call of its own — one lookup
 * per trial, never two.
 */
const confirmEmploymentAccessService = errorUtilities.withServiceErrorHandling(
  async (userId: string, nin: string, accessCode: string) => {
    const user = await assertLiveAccessCode(userId, accessCode);

    if (isAlreadyConfirmedForNin(user, nin)) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "NIN already confirmed",
        serializeUser(user),
      );
    }

    const ninHash = hashForLookup(nin);

    const conflict = await User.findOne({ where: { ninHash } });
    if (conflict && conflict.get("id") !== userId) {
      throw errorUtilities.createError(
        "This NIN has already been confirmed on another account",
        StatusCodes.BAD_REQUEST,
      );
    }

    const verified = readNinCache(user, nin);
    if (!verified) {
      throw errorUtilities.createError(
        "Please verify this NIN before confirming it",
        StatusCodes.BAD_REQUEST,
      );
    }

    user.set("nin", nin.trim());
    user.set("ninHash", ninHash);
    user.set("firstName", verified.firstName ?? (user.get("firstName") as string | null));
    user.set("surname", verified.surname ?? (user.get("surname") as string | null));
    user.set("otherName", verified.otherName ?? (user.get("otherName") as string | null));
    user.set("gender", verified.gender ?? (user.get("gender") as string | null));
    if (verified.dob) user.set("dateOfBirth", verified.dob as any);
    if (verified.photo) user.set("photo", verified.photo);
    user.set("ninVerificationHash", null);
    user.set("ninVerificationData", null);
    user.set("applicationStatus", ApplicationStatus.NinVerified);
    await user.save();

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "NIN confirmed",
      serializeUser(user),
    );
  },
);

export default confirmEmploymentAccessService;
