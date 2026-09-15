import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import verifyEmploymentAccessService from "../services/verify.service";

const verify = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { nin, accessCode } = request.body;

    const result = await verifyEmploymentAccessService(
      request.user!.id,
      nin,
      accessCode,
    );

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default verify;
