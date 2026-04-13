import { StatusCodes } from "../../constants";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import Applicants from "../../models/applicants/applicantModel";
import { errorUtilities } from "../../utilities";
import { findByNin } from "../../utilities/data/sampleNin";
import { hashForLookup } from "../../utilities/encryption/encryption";
import verifyNIN from "../../utilities/lumiid";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone, isExpiredTodayUTC } from "../../utilities/utils";

const verifyApplicantAndNinService = errorUtilities.withServiceErrorHandling(
  async (phoneNumber: string, accessCode: string, nin: string) => {
    const projection = [
      "id",
      "phoneNumber",
      "code",
      "usageCount",
      "expiresAt",
      "maxUsage",
      "isConsumed",
    ];

    const ninHash = hashForLookup(nin);
    const [existingApplicantCode, checkApplicant]: any = await Promise.all([
      AccessCodes.findOne({
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber),
          code: accessCode,
        },
        attributes: projection,
      }),
      Applicants.findOne({
        where: { ninHash },
        attributes: [
          "id",
          "ninHash",
          "dateOfBirth",
          "surname",
          "firstName",
          "otherName",
          "phoneNumber",
        ],
      }),
    ]);

    if (!existingApplicantCode) {
      throw errorUtilities.createError(
        "Check Access Code and Try Again. If error persists, contact admin",
        StatusCodes.NOT_FOUND,
      );
    }

    if (existingApplicantCode.usageCount === existingApplicantCode.maxUsage) {
      throw errorUtilities.createError(
        `This code has been used up to ${existingApplicantCode.maxUsage} times, please pay for a new code`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (existingApplicantCode.isConsumed) {
      throw errorUtilities.createError(
        `Applicant with this code and phone number has already completed registration. Thank you.`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (isExpiredTodayUTC(existingApplicantCode.expiresAt)) {
      throw errorUtilities.createError(
        `This code has expired, please pay for a new code`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (checkApplicant) {
      await AccessCodes.increment("usageCount", {
        by: 1,
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber),
          code: accessCode,
        },
      });

      const applicantData = checkApplicant.toJSON() as Record<string, any>;
      delete applicantData.ninHash;
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Applicant Found",
        applicantData,
      );
    }

    // const ninData = await verifyNIN(nin);

    const ninData = findByNin(nin);

    if (!ninData.found) {
      throw errorUtilities.createError(
        "NIN not found. Please check the NIN and try again.",
        StatusCodes.NOT_FOUND,
      );
    }

    const returnPayload = {
      firstname: ninData.data?.firstname,
      surname: ninData.data?.surname,
      middlename: ninData.data?.middlename,
      phone: ninData.data?.phone,
      gender: ninData.data?.gender,
      birthdate: ninData.data?.birthdate,
      photo: ninData.data?.photo,
      nin,
    };

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Applicant Found",
      returnPayload,
    );
  },
);

export default verifyApplicantAndNinService;
