import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { getAllWardsAndVillagesService } from "../services/get-all-wards-villages.service";

const getAllWardsVillages = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const result = await getAllWardsAndVillagesService();

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default getAllWardsVillages;
