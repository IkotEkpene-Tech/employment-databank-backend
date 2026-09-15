import { User } from "../User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import jwtUtilities from "../../configurations/jwt";
import { queueEmail } from "../../configurations/email-queue";
import { generateNumericOtp, hashToken, serializeUser } from "../auth.helpers";
import { loginOtpTemplate } from "../emailTemplates/loginOtp";

const LOGIN_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_TOKEN_TTL = "7d";

export const requestLoginOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string) => {
    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.get("emailVerified")) {
      throw errorUtilities.createError(
        "No account found for this email",
        StatusCodes.NOT_FOUND,
      );
    }

    const otp = generateNumericOtp();
    user.set("loginOtpHash", hashToken(otp));
    user.set("loginOtpExpiresAt", new Date(Date.now() + LOGIN_OTP_TTL_MS));
    await user.save();

    const template = loginOtpTemplate(otp);

    await queueEmail({
      to: user.get("email"),
      subject: template.subject,
      htmlbody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Login code sent",
    );
  },
);

export const verifyLoginOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string, otp: string) => {
    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    const invalidError = errorUtilities.createError(
      "Invalid or expired login code",
      StatusCodes.UNAUTHORIZED,
    );

    if (!user || !user.get("emailVerified")) throw invalidError;

    const otpHash = user.get("loginOtpHash") as string | null;
    const expiresAt = user.get("loginOtpExpiresAt") as Date | null;

    if (
      !otpHash ||
      !expiresAt ||
      new Date(expiresAt).getTime() < Date.now() ||
      hashToken(otp) !== otpHash
    ) {
      throw invalidError;
    }

    user.set("loginOtpHash", null);
    user.set("loginOtpExpiresAt", null);
    await user.save();

    const token = jwtUtilities.signToken(
      { sub: user.get("id") as string },
      SESSION_TOKEN_TTL,
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Login successful",
      { token, user: serializeUser(user) },
    );
  },
);
