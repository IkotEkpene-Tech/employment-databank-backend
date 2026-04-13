import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import verifyPaymentService from "../../services/paymentServices/verifyPayment";
import configurations from "../../configurations";

const verifyPaymentController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const reference = request.query.reference as string;

    if (!reference) {
      return response.redirect(
        `${configurations.FRONTEND_URL}/payment-failed?reason=missing_reference`,
      );
    }

    try {
      const paymentVerification = await verifyPaymentService(reference);
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
