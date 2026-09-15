import { v4 } from "uuid";
import { User, ApplicationStatus } from "../../auth/User";
import { Transaction } from "../../payments/Transaction";
import { initializeTransaction } from "../../payments/services/paystack";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import configurations from "../../configurations";
import { hashForLookup } from "../../configurations/encryption";
import { queueEmail } from "../../configurations/email-queue";
import { transactionCreatedTemplate } from "../emailTemplates/transactionCreated";

const AMOUNT_KOBO = 50000; // ₦500

const initiatePaymentService = errorUtilities.withServiceErrorHandling(
  async (userId: string, nin: string) => {
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

    const ninHash = hashForLookup(nin);

    // Another account has already had this NIN confirmed — one NIN can't
    // fund two employment applications.
    const confirmedElsewhere = await User.findOne({
      where: { ninHash },
    });
    if (confirmedElsewhere && confirmedElsewhere.get("id") !== userId) {
      throw errorUtilities.createError(
        "This NIN has already been used for an application on another account",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Already holding a live, unexpired code for this exact NIN — no need
    // to pay again.
    const existingExpiry = user.get("accessCodeExpiresAt") as Date | null;
    if (
      user.get("applicationStatus") === ApplicationStatus.AccessIssued &&
      user.get("accessCodeNinHash") === ninHash &&
      existingExpiry &&
      new Date(existingExpiry).getTime() > Date.now()
    ) {
      throw errorUtilities.createError(
        "You already have a valid access code for this NIN — check your payment status or your email",
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

    user.set("accessCodeNinHash", ninHash);
    user.set("accessCodeNin", nin.trim());
    user.set("applicationStatus", ApplicationStatus.AccessPending);
    await user.save();

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
