import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import submitApplicationService from "../../services/applicantServices/applicantSubmission";

const submitApplicationsController = errorUtilities.withControllerErrorHandling(
  async (
    request: Request & { files?: { [fieldname: string]: Express.Multer.File[] } },
    response: Response,
  ) => {
    const payload = request.body;
    const files = request.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    const certificate = files?.certificate?.[0];
    const certificateOfOrigin = files?.certificateOfOrigin?.[0];

    const submitApplication = await submitApplicationService(
      payload,
      certificate,
      certificateOfOrigin,
    );

    return responseUtilities.responseHandler(
      response,
      submitApplication.message,
      submitApplication.statusCode,
      submitApplication.data,
    );
  },
);

export default submitApplicationsController;