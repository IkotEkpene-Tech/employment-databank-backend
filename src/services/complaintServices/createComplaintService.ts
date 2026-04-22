import { v4 } from "uuid";
import { StatusCodes } from "../../constants";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone } from "../../utilities/utils";
import Complaint from "../../models/complaint/complaintModel";

const createComplaintService = errorUtilities.withServiceErrorHandling(
  async (
    nin: string,
    fullName: string,
    phoneNumber: string,
    description: string,
    currentPage: string,
    errorEncountered?: string,
  ) => {
    const complaint = await Complaint.create({
      id: v4(),
      nin,
      fullName,
      phoneNumber: formatNigerianPhone(phoneNumber),
      errorEncountered: errorEncountered?.trim() || null,
      description,
      currentPage,
      status: "pending",
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Complaint submitted successfully",
      complaint,
    );
  },
);

export default createComplaintService;