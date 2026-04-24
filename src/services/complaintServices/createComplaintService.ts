import { v4 } from "uuid";
import { StatusCodes } from "../../constants";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone } from "../../utilities/utils";
import Complaint from "../../models/complaint/complaintModel";
import { complaintReceivedTemplate } from "../../emailTemplates/complainReceivedTemplate";
import { queueEmail } from "../../utilities/emailServices/emailQueue";
import configurations from "../../configurations";

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

     const template = complaintReceivedTemplate(
      fullName,
      formatNigerianPhone(phoneNumber),
      nin,
      description,
      currentPage,
      errorEncountered,
    );

    queueEmail({
      to: configurations.ADMIN_EMAIL,
      subject: template.subject,
      htmlBody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Complaint submitted successfully",
      complaint,
    );
  },
);

export default createComplaintService;