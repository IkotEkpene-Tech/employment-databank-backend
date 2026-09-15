import { Transaction } from "../../payments/Transaction";
import { fetchTransactionStatus } from "../../payments/services/paystack";
import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { queueEmail } from "../../configurations/email-queue";
import { generateAccessCode, hashSecret, maskNin } from "../../auth/auth.helpers";
import { paymentSuccessfulTemplate } from "../emailTemplates/paymentSuccessful";
import { accessCodeGeneratedTemplate } from "../emailTemplates/accessCodeGenerated";

const ACCESS_CODE_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

/**
 * Verifies a Paystack transaction and, on first success, issues the
 * employment-access code. Idempotent: safe to call from the webhook, the
 * browser callback redirect, and payment-status polling — it no-ops once the
 * transaction is no longer "pending".
 */
const processPaymentService = errorUtilities.withServiceErrorHandling(
  async (reference: string) => {
    const transaction = await Transaction.findOne({ where: { reference } });

    if (!transaction) {
      throw errorUtilities.createError(
        "Transaction not found",
        StatusCodes.NOT_FOUND,
      );
    }

    if (transaction.get("status") !== "pending") {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Transaction already processed",
        { status: transaction.get("status"), reference },
      );
    }

    const { status } = await fetchTransactionStatus(reference);

    if (status !== "success") {
      await transaction.update({ status: "failed" });
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Payment was not successful",
        { status: "failed", reference },
      );
    }

    await transaction.update({ status: "success" });

    const userId = transaction.get("registrationId") as string | null;
    const user = userId ? await User.findByPk(userId) : null;

    if (user) {
      const email = user.get("email") as string;

      const paymentTemplate = paymentSuccessfulTemplate(reference);
      await queueEmail({
        to: email,
        subject: paymentTemplate.subject,
        htmlbody: paymentTemplate.htmlBody,
      });

      const code = generateAccessCode();
      user.set("accessCodeHash", await hashSecret(code));
      user.set("accessCodePlaintext", code);
      user.set(
        "accessCodeExpiresAt",
        new Date(Date.now() + ACCESS_CODE_TTL_MS),
      );
      user.set("applicationStatus", ApplicationStatus.AccessIssued);
      await user.save();

      const nin = user.get("accessCodeNin") as string | null;
      const codeTemplate = accessCodeGeneratedTemplate(
        code,
        nin ? maskNin(nin) : "----",
      );
      await queueEmail({
        to: email,
        subject: codeTemplate.subject,
        htmlbody: codeTemplate.htmlBody,
      });
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Payment verified",
      { status: "success", reference },
    );
  },
);

export default processPaymentService;
