import { User } from "../User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import configurations from "../../configurations";
import { queueEmail } from "../../configurations/email-queue";
import { generateUrlToken, hashSecret, hashToken } from "../auth.helpers";
import { passwordResetRequestedTemplate } from "../emailTemplates/passwordResetRequested";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const forgotPasswordService = errorUtilities.withServiceErrorHandling(
  async (email: string) => {
    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    // Always respond the same way regardless of whether the account exists —
    // this is the one endpoint worth being enumeration-safe about.
    if (user && user.get("emailVerified")) {
      const token = generateUrlToken();
      user.set("passwordResetTokenHash", hashToken(token));
      user.set(
        "passwordResetTokenExpiresAt",
        new Date(Date.now() + RESET_TOKEN_TTL_MS),
      );
      await user.save();

      const resetUrl = `${configurations.FRONTEND_URL}/reset-password?token=${token}`;
      const template = passwordResetRequestedTemplate(resetUrl);

      await queueEmail({
        to: user.get("email"),
        subject: template.subject,
        htmlbody: template.htmlBody,
      });
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "If an account exists for this email, a reset link has been sent",
    );
  },
);

export const resetPasswordService = errorUtilities.withServiceErrorHandling(
  async (token: string, password: string) => {
    const user = await User.findOne({
      where: { passwordResetTokenHash: hashToken(token) },
    });

    const expiresAt = user?.get("passwordResetTokenExpiresAt") as
      | Date
      | null
      | undefined;

    if (!user || !expiresAt || new Date(expiresAt).getTime() < Date.now()) {
      throw errorUtilities.createError(
        "This reset link is invalid or has expired",
        StatusCodes.BAD_REQUEST,
      );
    }

    user.set("passwordHash", await hashSecret(password));
    user.set("passwordResetTokenHash", null);
    user.set("passwordResetTokenExpiresAt", null);
    await user.save();

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Password reset successfully",
    );
  },
);
