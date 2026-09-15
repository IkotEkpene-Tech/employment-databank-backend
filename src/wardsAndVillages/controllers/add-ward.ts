import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import addWardService from "../services/add-ward.service";

const addWard = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const wardDetails = request.body;

    const result = await addWardService(wardDetails);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default addWard;
