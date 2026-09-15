import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import paymentStatusService from "../services/payment-status.service";

const paymentStatus = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { reference } = request.query as { reference?: string };

    if (!reference) {
      throw errorUtilities.createError(
        "reference query parameter is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const result = await paymentStatusService(request.user!.id, reference);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default paymentStatus;
