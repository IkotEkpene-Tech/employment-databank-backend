import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import employmentAccessStatusService from "../services/status.service";

const status = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await employmentAccessStatusService(request.user!.id);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default status;
