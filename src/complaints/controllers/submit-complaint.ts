import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import submitComplaintService from "../services/submit-complaint.service";

const submitComplaint = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const {
      nin,
      fullName,
      phoneNumber,
      description,
      currentPage,
      submittedAt,
      errorEncountered,
    } = request.body;

    await submitComplaintService(
      nin,
      fullName,
      phoneNumber,
      description,
      currentPage,
      submittedAt,
      errorEncountered,
    );

    return response.status(204).send();
  },
);

export default submitComplaint;
