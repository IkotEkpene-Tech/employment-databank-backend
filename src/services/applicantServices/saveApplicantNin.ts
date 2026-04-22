import { v4 } from "uuid";
import { StatusCodes } from "../../constants";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import Applicants from "../../models/applicants/applicantModel";
import { errorUtilities } from "../../utilities";
import { hashForLookup } from "../../utilities/encryption/encryption";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone, isExpiredTodayUTC } from "../../utilities/utils";

const saveApplicantNinDataService = errorUtilities.withServiceErrorHandling(
  async (
    firstname: string,
    surname: string,
    middlename: string,
    phoneNumber: string,
    birthdate: any,
    photo: string,
    nin: string,
    accessCode: string,
    email:string
  ) => {
    const projection = [
      "id",
      "phoneNumber",
      "code",
      "usageCount",
      "expiresAt",
      "maxUsage",
      "isConsumed",
      "email"
    ];

    const ninHash = hashForLookup(nin);

    let applicantData: any;

    const [existingApplicantCode, checkApplicant]: any = await Promise.all([
      AccessCodes.findOne({
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber),
          code: accessCode,
        },
        attributes: projection,
        raw:true
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
          "photo",
          "nin",
          "accessCode",
          "email",
        ],
      }),
    ]);

    if (!existingApplicantCode) {
      throw errorUtilities.createError(
        "Check Access Code and Try Again. If error persists, contact admin",
        StatusCodes.NOT_FOUND,
      );
    }

    // if (existingApplicantCode.usageCount === existingApplicantCode.maxUsage) {
    //   throw errorUtilities.createError(
    //     `This code has been used up to ${existingApplicantCode.maxUsage} times, please pay for a new code`,
    //     StatusCodes.BAD_REQUEST,
    //   );
    // }

    // if (existingApplicantCode.isConsumed) {
    //   throw errorUtilities.createError(
    //     `Applicant with this code and phone number has already completed registration. Thank you.`,
    //     StatusCodes.BAD_REQUEST,
    //   );
    // }

    // if (isExpiredTodayUTC(existingApplicantCode.expiresAt)) {
    //   throw errorUtilities.createError(
    //     `This code has expired, please pay for a new code`,
    //     StatusCodes.BAD_REQUEST,
    //   );
    // }

    if (checkApplicant) {
      applicantData = checkApplicant;
      delete applicantData.dataValues.ninHash;
      delete applicantData.dataValues.nin;
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Nin already exists. Returning existing applicant data.",
        applicantData,
      );
    }
    const [day, month, year] = birthdate.split("-");
    const formattedDate:any = `${year}-${month}-${day}`;

    applicantData = await Applicants.create({
      id: v4(),
      ninHash,
      dateOfBirth: formattedDate,
      surname,
      firstName: firstname,
      otherName: middlename ?? null,
      phoneNumber: formatNigerianPhone(phoneNumber),
      photo,
      nin,
      accessCode,
      email: email ?? existingApplicantCode.email
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.CREATED,
      "Applicant created successfully",
      applicantData,
    );
  },
);

export default saveApplicantNinDataService;
