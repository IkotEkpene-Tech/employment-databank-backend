import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import initiatePaymentService from "../services/initiate-payment.service";

const initiatePayment = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { nin } = request.body;

    const result = await initiatePaymentService(request.user!.id, nin);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default initiatePayment;
