import { User } from "../User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { queueEmail } from "../../configurations/email-queue";
import { generateNumericOtp, hashToken } from "../auth.helpers";
import { emailVerificationOtpTemplate } from "../emailTemplates/emailVerificationOtp";

const EMAIL_OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes

const resendEmailOtpService = errorUtilities.withServiceErrorHandling(
  async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      throw errorUtilities.createError(
        "No account found for this email",
        StatusCodes.NOT_FOUND,
      );
    }

    if (user.get("emailVerified")) {
      throw errorUtilities.createError(
        "This email is already verified",
        StatusCodes.BAD_REQUEST,
      );
    }

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

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Verification code resent",
    );
  },
);

export default resendEmailOtpService;
