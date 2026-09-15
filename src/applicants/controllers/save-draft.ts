import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import { saveDraftService } from "../services/draft.service";

const saveDraft = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { values, step } = request.body;

    await saveDraftService(request.user!.id, values, step);

    return response.status(204).send();
  },
);

export default saveDraft;
