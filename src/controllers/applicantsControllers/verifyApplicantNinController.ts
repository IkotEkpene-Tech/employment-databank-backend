import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import checkApplicantService from "../../services/applicantServices/retrieveApplicant";
import verifyApplicantAndNinService from "../../services/applicantServices/verifyUserAndNin";

const verifyApplicantNinController = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { phoneNumber, accessCode, nin } = request.body;

    const verifyApplicant = await verifyApplicantAndNinService(
      phoneNumber,
      accessCode,
      nin,
    );

    return responseUtilities.responseHandler(
      response,
      verifyApplicant.message,
      verifyApplicant.statusCode,
      verifyApplicant.data,
    );
  },
);

export default verifyApplicantNinController;
