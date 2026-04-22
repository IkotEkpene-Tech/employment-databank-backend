import { Request, Response } from "express";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import createComplaintService from "../../services/complaintServices/createComplaintService";

const createComplaintController =
  errorUtilities.withControllerErrorHandling(
    async (request: Request, response: Response) => {
      const {
        nin,
        fullName,
        phoneNumber,
        description,
        currentPage,
        errorEncountered,
      } = request.body;

      const complaintResponse = await createComplaintService(
        nin,
        fullName,
        phoneNumber,
        description,
        currentPage,
        errorEncountered,
      );

      return responseUtilities.responseHandler(
        response,
        complaintResponse.message,
        complaintResponse.statusCode,
        complaintResponse.data,
      );
    },
  );

export default createComplaintController;