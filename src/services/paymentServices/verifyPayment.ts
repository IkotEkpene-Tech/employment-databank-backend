import { Request } from "express";
import axios from "axios";
import crypto from "crypto";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { StatusCodes } from "../../constants";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import configurations from "../../configurations";
import { formatNigerianPhone } from "../../utilities/utils";
import Transactions from "../../models/transactions";
import randomstring from "randomstring";
import { paymentSuccessfulTemplate } from "../../emailTemplates/paymentSuccessful";
import { queueEmail } from "../../utilities/emailServices/emailQueue";
import { accessCodeGeneratedTemplate } from "../../emailTemplates/accessCodeGenerated";

const generateCode = (): string => {
  return randomstring.generate({ length: 12, charset: "numeric" });
};

const verifyPaymentService = errorUtilities.withServiceErrorHandling(
  async (reference: string, request: Request) => {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${configurations.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const { status, metadata } = response.data.data;

    if (status !== "success") {
      await Transactions.update({ status: "failed" }, { where: { reference } });
      throw errorUtilities.createError(
        "Payment was not successful",
        StatusCodes.BAD_REQUEST,
      );
    }

    const { phoneNumber, email } = metadata;

    await Transactions.update(
      { status: "success" },
      { where: { reference, phoneNumber: formatNigerianPhone(phoneNumber) } },
    );

    await AccessCodes.destroy({
      where: { phoneNumber: formatNigerianPhone(phoneNumber) },
    });

    const expiresAt = new Date();

    expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
    expiresAt.setUTCHours(0, 0, 0, 0);

    const accessCode: any = await AccessCodes.create({
      code: generateCode(),
      phoneNumber: formatNigerianPhone(phoneNumber),
      email,
      expiresAt,
    });

    const paymentEmailTemplate = paymentSuccessfulTemplate(reference);

    const accessCodeEmailTemplate = accessCodeGeneratedTemplate(
      accessCode.code,
    );

    queueEmail({
      to: email,
      subject: paymentEmailTemplate.subject,
      htmlbody: paymentEmailTemplate.htmlBody,
    });

    queueEmail({
      to: email,
      subject: accessCodeEmailTemplate.subject,
      htmlbody: accessCodeEmailTemplate.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Payment verified. Access code created.",
      {
        code: accessCode.code,
        expiresAt: accessCode.expiresAt,
        phoneNumber,
        accessCode,
      },
    );
  },
);

export default verifyPaymentService;
