import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import addVillagesToWardService from "../../services/wardAndVillageServices/addVillagesToWardsService";

const addVillageToWardController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const payload = request.body;

    const addedVillagesData = await addVillagesToWardService(payload);

    return responseUtilities.responseHandler(
      response,
      addedVillagesData.message,
      addedVillagesData.statusCode,
      addedVillagesData.data,
    );
  },
);

export default addVillageToWardController;
