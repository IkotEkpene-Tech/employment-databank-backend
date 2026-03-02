import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import {
  getAllWardsAndVillagesService,
  getAllWardsService,
} from "../../services/wardAndVillageServices/getAllWards.service";

const getAllWardsController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const allWards = await getAllWardsService();

    return responseUtilities.responseHandler(
      response,
      allWards.message,
      allWards.statusCode,
      allWards.data,
    );
  },
);

const getAllWardsAndVillagesControllers =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const allWards = await getAllWardsAndVillagesService();

      return responseUtilities.responseHandler(
        response,
        allWards.message,
        allWards.statusCode,
        allWards.data,
      );
    },
  );

export { getAllWardsController, getAllWardsAndVillagesControllers };
