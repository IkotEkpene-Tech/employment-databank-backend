import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import { deleteDraftService } from "../services/draft.service";

const deleteDraft = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    await deleteDraftService(request.user!.id);

    return response.status(204).send();
  },
);

export default deleteDraft;
