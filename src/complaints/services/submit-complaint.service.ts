import { v4 } from "uuid";
import { Complaint } from "../Complaint";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { formatNigerianPhone } from "../../configurations/utils";
import { queueEmail } from "../../configurations/email-queue";
import configurations from "../../configurations";
import { complaintReceivedTemplate } from "../emailTemplates/complaintReceived";

const submitComplaintService = errorUtilities.withServiceErrorHandling(
  async (
    nin: string,
    fullName: string,
    phoneNumber: string,
    description: string,
    currentPage: string,
    submittedAt?: string,
    errorEncountered?: string,
  ) => {
    await Complaint.create({
      id: v4(),
      nin,
      fullName,
      phoneNumber: formatNigerianPhone(phoneNumber),
      errorEncountered: errorEncountered?.trim() || null,
      description,
      currentPage,
      submittedAt: submittedAt ? new Date(submittedAt) : null,
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

    await queueEmail({
      to: configurations.ADMIN_EMAIL,
      subject: template.subject,
      htmlbody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Complaint submitted successfully",
    );
  },
);

export default submitComplaintService;
