// services/paymentServices/initializePayment.ts
import axios from "axios";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { StatusCodes } from "../../constants";
import configurations from "../../configurations";
import Transactions from "../../models/transactions";
import { v4 } from "uuid";
import { formatNigerianPhone } from "../../utilities/utils";
import { transactionCreatedTemplate } from "../../emailTemplates/transactionCreated";
import { queueEmail } from "../../utilities/emailServices/emailQueue";
import Applicants from "../../models/applicants/applicantModel";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import { AccessDeniedError } from "sequelize";

const initializePaystackPaymentService =
  errorUtilities.withServiceErrorHandling(
    async (
      phoneNumber: string,
      email: string,
      request: Request,
      isNotNew?: boolean,
    ) => {
      if (isNotNew) {
        const [checkNotNewAccessEmail, checkNotNewApplicantEmail]: any =
          await Promise.all([
            await AccessCodes.findOne({
              where: {
                phoneNumber: formatNigerianPhone(phoneNumber),
                email: email.trim(),
              },
              attributes: ["id", "email", "phoneNumber"],
              raw: true,
            }),
            Applicants.findOne({
              where: {
                phoneNumber: formatNigerianPhone(phoneNumber),
                email: email.trim(),
              },
              attributes: ["id", "email", "phoneNumber"],
              raw: true,
            }),
          ]);
        if (!checkNotNewAccessEmail && !checkNotNewApplicantEmail) {
          throw errorUtilities.createError(
            "The user is not found, please check the email again.",
            StatusCodes.NOT_FOUND,
          );
        }
      } else if (!isNotNew) {
        const [checkAccessCodeEmail, checkApplicantEmail]: any =
          await Promise.all([
            await AccessCodes.findOne({
              where: { email: email.trim() },
              attributes: ["id", "email"],
              raw: true,
            }),
            Applicants.findOne({
              where: { email: email.trim() },
              attributes: ["id", "email"],
              raw: true,
            }),
            ,
          ]);

        if (checkAccessCodeEmail || checkApplicantEmail) {
          throw errorUtilities.createError(
            "The email is already in use, please use another email address.",
            StatusCodes.BAD_REQUEST,
          );
        }
      }

      const amount = 50000; // amount in kobo

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount,
          metadata: {
            phoneNumber: formatNigerianPhone(phoneNumber),
            email,
          },
          callback_url: configurations.PAYSTACK_CALLBACK_URL,
        },
        {
          headers: {
            Authorization: `Bearer ${configurations.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { authorization_url, reference } = response.data.data;

      await Transactions.create({
        id: v4(),
        phoneNumber: formatNigerianPhone(phoneNumber),
        email,
        reference,
        amount: 500,
        status: "pending",
      });

      const template = transactionCreatedTemplate(reference);

      queueEmail({
        to: email,
        subject: template.subject,
        htmlbody: template.htmlBody,
      });

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Payment initialized",
        { authorization_url, reference },
      );
    },
  );

export default initializePaystackPaymentService;
