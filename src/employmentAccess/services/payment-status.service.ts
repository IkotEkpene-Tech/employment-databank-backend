import { Transaction } from "../../payments/Transaction";
import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import processPaymentService from "./process-payment.service";

const paymentStatusService = errorUtilities.withServiceErrorHandling(
  async (userId: string, reference: string) => {
    let transaction = await Transaction.findOne({ where: { reference } });

    if (!transaction || transaction.get("registrationId") !== userId) {
      throw errorUtilities.createError(
        "No matching payment found for this reference",
        StatusCodes.NOT_FOUND,
      );
    }

    // Give the webhook a chance to have already handled it; if not, resolve
    // it right now instead of leaving the frontend polling a "pending" that
    // never moves.
    if (transaction.get("status") === "pending") {
      await processPaymentService(reference);
      transaction = await Transaction.findOne({ where: { reference } });
    }

    if (!transaction || transaction.get("status") === "failed") {
      return responseUtilities.handleServicesResponse(StatusCodes.OK, "Payment failed", {
        status: "failed",
        reason: "Payment was not successful",
      });
    }

    if (transaction.get("status") === "pending") {
      return responseUtilities.handleServicesResponse(StatusCodes.OK, "Payment pending", {
        status: "pending",
      });
    }

    const user = await User.findByPk(userId);

    if (!user || user.get("applicationStatus") !== ApplicationStatus.AccessIssued) {
      // Paid, but the access code isn't ready yet (shouldn't normally
      // happen given process-payment is synchronous, but covered defensively).
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Payment processing",
        { status: "processing" },
      );
    }

    const plaintext = user.get("accessCodePlaintext") as string | null;
    const nin = user.get("accessCodeNin") as string | null;

    if (plaintext) {
      // Reveal exactly once.
      user.set("accessCodePlaintext", null);
      await user.save();
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Access code issued",
      {
        status: "code_issued",
        accessCode: plaintext ?? undefined,
        nin: nin ?? undefined,
      },
    );
  },
);

export default paymentStatusService;
