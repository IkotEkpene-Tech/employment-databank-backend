import { v4 } from "uuid";
import { User, ApplicationStatus } from "../../auth/User";
import { Transaction } from "../../payments/Transaction";
import { initializeTransaction } from "../../payments/services/paystack";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import configurations from "../../configurations";
import { queueEmail } from "../../configurations/email-queue";
import { trialsRemaining } from "./verify.service";
import { transactionCreatedTemplate } from "../emailTemplates/transactionCreated";

const AMOUNT_KOBO = 10000; // ₦500

const initiatePaymentService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    if (user.get("applicationStatus") === ApplicationStatus.Submitted) {
      throw errorUtilities.createError(
        "Your application has already been submitted",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Already holding a live code with trials left — no need to pay again.
    // (Expired, or all trials used: paying again issues a fresh code.)
    const existingExpiry = user.get("accessCodeExpiresAt") as Date | null;
    const hasLiveCode =
      Boolean(user.get("accessCodeHash")) &&
      existingExpiry &&
      new Date(existingExpiry).getTime() > Date.now();
    if (hasLiveCode && trialsRemaining(user) > 0) {
      throw errorUtilities.createError(
        "You already have a valid access code with attempts remaining — check your email or your dashboard",
        StatusCodes.BAD_REQUEST,
      );
    }

    const email = user.get("email") as string;

    const { authorizationUrl, reference } = await initializeTransaction({
      email,
      amountKobo: AMOUNT_KOBO,
      metadata: { userId },
      callbackUrl: configurations.PAYSTACK_CALLBACK_URL,
    });

    await Transaction.create({
      id: v4(),
      registrationId: userId,
      phoneNumber: user.get("phoneNumber") as string,
      email,
      reference,
      amount: 500,
      status: "pending",
    });

    // Someone already past NIN confirmation (resuming after an expired
    // code) keeps their status — regressing it would force a second
    // provider lookup for a NIN we already hold.
    if (!user.get("ninHash")) {
      user.set("applicationStatus", ApplicationStatus.AccessPending);
      await user.save();
    }

    const template = transactionCreatedTemplate(reference);

    await queueEmail({
      to: email,
      subject: template.subject,
      htmlbody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Payment initialized",
      { authorizationUrl, reference },
    );
  },
);

export default initiatePaymentService;
