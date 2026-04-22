import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import verifyPaymentService from "../../services/paymentServices/verifyPayment";
import configurations from "../../configurations";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import Transactions from "../../models/transactions";
import { formatNigerianPhone } from "../../utilities/utils";

// const verifyPaymentController = errorUtilities.withControllerErrorHandling(
//   async (request: Request, response: Response) => {
//     const reference = request.query.reference as string;

//     if (!reference) {
//       return response.redirect(
//         `${configurations.FRONTEND_URL}/payment-failed?reason=missing_reference`,
//       );
//     }

//     try {
//       const paymentVerification = await verifyPaymentService(reference, request);
//       return response.redirect(
//         `${configurations.FRONTEND_URL}/payment-success?code=${paymentVerification.data.code}&phone=${encodeURIComponent(paymentVerification.data.phoneNumber)}`,
//       );
//     } catch (error: any) {
//       return response.redirect(
//         `${configurations.FRONTEND_URL}/payment-failed?reason=${encodeURIComponent(error.message)}&reference=${reference}`,
//       );
//     }
//   },
// );

const verifyPaymentController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const reference = request.query.reference as string;

    if (!reference) {
      return response.redirect(
        `${configurations.FRONTEND_URL}/payment-failed?reason=missing_reference`,
      );
    }

    try {
      // Check if already processed by the webhook
      const existingTransaction: any = await Transactions.findOne({
        where: { reference },
      });

      if (existingTransaction?.status === "success") {
        // Webhook already handled it, just fetch the access code
        const accessCode: any = await AccessCodes.findOne({
          where: {
            phoneNumber: formatNigerianPhone(existingTransaction.phoneNumber),
          },
          raw: true,
        });

        return response.redirect(
          `${configurations.FRONTEND_URL}/payment-success?code=${accessCode?.code}&phone=${encodeURIComponent(existingTransaction.phoneNumber)}`,
        );
      }

      // Webhook hasn't fired yet, verify manually
      const paymentVerification = await verifyPaymentService(
        reference,
        request,
      );

      return response.redirect(
        `${configurations.FRONTEND_URL}/payment-success?code=${paymentVerification.data.code}&phone=${encodeURIComponent(paymentVerification.data.phoneNumber)}`,
      );
    } catch (error: any) {
      return response.redirect(
        `${configurations.FRONTEND_URL}/payment-failed?reason=${encodeURIComponent(error.message)}&reference=${reference}`,
      );
    }
  },
);

export default verifyPaymentController;
