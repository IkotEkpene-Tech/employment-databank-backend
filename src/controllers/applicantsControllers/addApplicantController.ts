import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import multer from "multer";
import submitApplicationService from "../../services/applicantServices/applicantSubmission";

const submitApplicationsController = errorUtilities.withControllerErrorHandling(
  async (
    request: Request & { file?: Express.Multer.File },
    response: Response,
  ) => {
    const payload = request.body;

    const { file } = request;

    const submitApplication = await submitApplicationService(payload, file);

    return responseUtilities.responseHandler(
      response,
      submitApplication.message,
      submitApplication.statusCode,
      submitApplication.data,
    );
  },
);

export default submitApplicationsController;
