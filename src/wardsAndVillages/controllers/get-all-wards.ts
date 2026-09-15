import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { getAllWardsService } from "../services/get-all-wards-villages.service";

const getAllWards = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await getAllWardsService();

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default getAllWards;
