import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import initializePaystackPaymentService from "../../services/paymentServices/initializePayment";

const intializePaymentController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { phoneNumber, email, isNotNew } = request.body;

    const checkApplicant = await initializePaystackPaymentService(
      phoneNumber,
      email,
      request,
      isNotNew,
    );

    return responseUtilities.responseHandler(
      response,
      checkApplicant.message,
      checkApplicant.statusCode,
      checkApplicant.data,
    );
  },
);

export default intializePaymentController;
