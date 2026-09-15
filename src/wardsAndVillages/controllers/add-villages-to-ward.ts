import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import addVillagesToWardService from "../services/add-villages-to-ward.service";

const addVillagesToWard = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const payload = request.body;

    const result = await addVillagesToWardService(payload);

    return responseUtilities.responseHandler(
      response,
      result.message,
      result.statusCode,
      result.data,
    );
  },
);

export default addVillagesToWard;
