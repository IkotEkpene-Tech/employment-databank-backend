import { User } from "../User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import jwtUtilities from "../../configurations/jwt";
import {
  compareSecret,
  generateNumericOtp,
  hashToken,
  serializeUser,
} from "../auth.helpers";
import { emailVerificationOtpTemplate } from "../emailTemplates/emailVerificationOtp";
import { queueEmail } from "../../configurations/email-queue";

const SESSION_TOKEN_TTL = "7d";
const EMAIL_OTP_TTL_MS = 15 * 60 * 1000;

const loginService = errorUtilities.withServiceErrorHandling(
  async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      where: { email: normalizedEmail },
    });

    const invalidError = errorUtilities.createError(
      "Invalid email or password",
      StatusCodes.UNAUTHORIZED,
    );

    const passwordHash = user?.get("passwordHash") as string | null | undefined;

    if (!user || !passwordHash) {
      throw invalidError;
    }

    if (!user.get("emailVerified")) {
      const otp = generateNumericOtp();
      user.set("emailOtpHash", hashToken(otp));
      user.set("emailOtpExpiresAt", new Date(Date.now() + EMAIL_OTP_TTL_MS));
      await user.save();

      const template = emailVerificationOtpTemplate(otp);

      await queueEmail({
        to: normalizedEmail,
        subject: template.subject,
        htmlbody: template.htmlBody,
      });
      
      throw errorUtilities.createError(
        "Please verify your email before logging in",
        StatusCodes.FORBIDDEN,
      );
    }

    if (!(await compareSecret(password, passwordHash))) {
      throw invalidError;
    }

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

export default loginService;
