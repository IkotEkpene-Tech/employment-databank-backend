import { User } from "../User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { hashToken } from "../auth.helpers";

const verifyEmailOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string, otp: string) => {
    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      throw errorUtilities.createError(
        "No account found for this email",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (user.get("emailVerified")) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.NO_CONTENT,
        "Email already verified",
      );
    }

    const otpHash = user.get("emailOtpHash") as string | null;
    const expiresAt = user.get("emailOtpExpiresAt") as Date | null;

    console.log("verify",{
      nowIso: new Date().toISOString(),
      expiresAtIso: expiresAt ? new Date(expiresAt).toISOString() : null,
      diffMinutes: expiresAt
        ? (new Date(expiresAt).getTime() - Date.now()) / 60000
        : null,
    });

    if (!otpHash || !expiresAt) {
      throw errorUtilities.createError(
        "No verification code was requested for this account",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (new Date(expiresAt).getTime() < Date.now()) {
      throw errorUtilities.createError(
        "Verification code has expired",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (hashToken(otp) !== otpHash) {
      throw errorUtilities.createError(
        "Incorrect verification code",
        StatusCodes.BAD_REQUEST,
      );
    }

    user.set("emailVerified", true);
    user.set("emailOtpHash", null);
    user.set("emailOtpExpiresAt", null);
    await user.save();

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Email verified successfully",
    );
  },
);

export default verifyEmailOtpService;
