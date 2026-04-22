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
      "email",
    ];

    const ninHash = hashForLookup(nin);

    const [existingApplicantCode, checkApplicant]: any = await Promise.all([
      AccessCodes.findOne({
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber.trim()),
          code: accessCode.trim(),
        },
        attributes: projection,
        raw:true,
      }),
      Applicants.findOne({
        where: { phoneNumber: formatNigerianPhone(phoneNumber.trim()) },
        attributes: [
          "id",
          "ninHash",
          "dateOfBirth",
          "surname",
          "firstName",
          "otherName",
          "phoneNumber",
          "accessCode",
          "nin",
          "gender",
          "photo",
          "email",
        ],
      }),
    ]);

    if (!existingApplicantCode) {
      throw errorUtilities.createError(
        "Check Access Code and Try Again. If error persists, please make a complaint to admin",
        StatusCodes.NOT_FOUND,
      );
    }
    if (existingApplicantCode.isConsumed) {
      throw errorUtilities.createError(
        `Applicant with this code and phone number has already completed registration. Please check your email for more information and wait for further instructions. If you did not receive an email, please make a complaint to admin. Thank you.`,
        StatusCodes.BAD_REQUEST,
      );
    }
    if (isExpiredTodayUTC(existingApplicantCode.expiresAt)) {
      throw errorUtilities.createError(
        `This code has expired, please pay for a new code`,
        StatusCodes.BAD_REQUEST,
      );
    }
    if (existingApplicantCode.usageCount === existingApplicantCode.maxUsage) {
      throw errorUtilities.createError(
        `This code has been used up to ${existingApplicantCode.maxUsage} times, please pay for a new code`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (checkApplicant) {
      if (checkApplicant.ninHash !== ninHash) {
        throw errorUtilities.createError(
          "NIN does not match the phone number provided. Please check the NIN and try again.",
          StatusCodes.BAD_REQUEST,
        );
      }
      const newApplicantData = checkApplicant.toJSON() as Record<string, any>;
      delete newApplicantData.ninHash;
      const applicantData = {
        firstname: newApplicantData.firstName,
        surname: newApplicantData.surname,
        middlename: newApplicantData.otherName,
        phone: newApplicantData.phoneNumber,
        gender: newApplicantData.gender,
        birthdate: newApplicantData.dateOfBirth,
        email: newApplicantData.email,
        // photo: newApplicantData.photo,
        nin,
      };
      await AccessCodes.increment("usageCount", {
        by: 1,
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber.trim()),
          code: accessCode.trim(),
        },
      });
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Applicant Found",
        applicantData,
      );
    }

    const ninData = await verifyNIN(nin.trim(), phoneNumber, accessCode);

    // const ninData = findByNin(nin);

    // if (!ninData.found) {
    //   throw errorUtilities.createError(
    //     "NIN not found. Please check the NIN and try again.",
    //     StatusCodes.NOT_FOUND,
    //   );
    // }

    const returnPayload = {
      firstname: ninData?.firstname,
      surname: ninData?.lastname,
      middlename: ninData?.middlename,
      phone: ninData?.phone,
      gender: ninData?.gender,
      birthdate: ninData?.birthdate,
      email:existingApplicantCode.email,
      // photo: ninData?.photo,
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
