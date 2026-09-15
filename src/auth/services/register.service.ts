import { v4 } from "uuid";
import { User } from "../User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { formatNigerianPhone } from "../../configurations/utils";
import { queueEmail } from "../../configurations/email-queue";
import { generateNumericOtp, hashSecret, hashToken, serializeUser } from "../auth.helpers";
import { emailVerificationOtpTemplate } from "../emailTemplates/emailVerificationOtp";

const EMAIL_OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes

const registerService = errorUtilities.withServiceErrorHandling(
  async (email: string, password: string, phone: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = formatNigerianPhone(phone);

    const existing = await User.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      throw errorUtilities.createError(
        "An account with this email already exists",
        StatusCodes.BAD_REQUEST,
      );
    }

    const otp = generateNumericOtp();

    const user = await User.create({
      id: v4(),
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      passwordHash: await hashSecret(password),
      emailVerified: false,
      emailOtpHash: hashToken(otp),
      emailOtpExpiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MS),
    } as any);

    const template = emailVerificationOtpTemplate(otp);

    await queueEmail({
      to: normalizedEmail,
      subject: template.subject,
      htmlbody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Account created, verification code sent",
      serializeUser(user),
    );
  },
);

export default registerService;
