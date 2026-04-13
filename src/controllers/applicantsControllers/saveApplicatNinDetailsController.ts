import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import submitApplicationService from "../../services/applicantServices/applicantSubmission";
import saveApplicantNinDataService from "../../services/applicantServices/saveApplicantNin";

const saveApplicantNinDetailsController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const {
        firstname,
        surname,
        middlename,
        phoneNumber,
        birthdate,
        photo,
        nin,
        accessCode,
      } = request.body;

      const savedNinDetails = await saveApplicantNinDataService(
        firstname,
        surname,
        middlename,
        phoneNumber,
        birthdate,
        photo,
        nin,
        accessCode,
      );

      return responseUtilities.responseHandler(
        response,
        savedNinDetails.message,
        savedNinDetails.statusCode,
        savedNinDetails.data,
      );
    },
  );

export default saveApplicantNinDetailsController;
