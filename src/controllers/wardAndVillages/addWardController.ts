import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import addWardService from "../../services/wardAndVillageServices/addWard.service";

const addWardController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const wardDetails = request.body;

    const createWard = await addWardService(wardDetails);

    return responseUtilities.responseHandler(
      response,
      createWard.message,
      createWard.statusCode,
      createWard.data,
    );
  },
);

export default addWardController;
