import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import submitApplicationService from "../services/submit-application.service";

const submitApplication = errorUtilities.withControllerErrorHandling(
  async (
    request: Request & {
      files?: { [fieldname: string]: Express.Multer.File[] };
    },
    response: Response,
  ) => {
    const payload = request.body;
    const files = request.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const certificate = files?.certificate?.[0];
    const certificateOfOrigin = files?.certificateOfOrigin?.[0];

    await submitApplicationService(
      request.user!.id,
      payload,
      certificate,
      certificateOfOrigin,
    );

    return response.status(204).send();
  },
);

export default submitApplication;
