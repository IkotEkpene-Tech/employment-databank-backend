import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import submitApplicationService from "../../services/applicantServices/applicantSubmission";
import checkApplicantService from "../../services/applicantServices/retrieveApplicant";

const checkApplicantController = errorUtilities.withControllerErrorHandling(
  async (
    request: Request,
    response: Response,
  ) => {
    const { phoneNumber } = request.body;

    const { isFetchFull } = request.query;

    const checkApplicant = await checkApplicantService(phoneNumber, isFetchFull);

    return responseUtilities.responseHandler(
      response,
      checkApplicant.message,
      checkApplicant.statusCode,
      checkApplicant.data,
    );
  },
);

export default checkApplicantController;
