import { v4 } from "uuid";
import { StatusCodes } from "../../constants";
import Applicants from "../../models/applicants/applicantModel";
import { errorUtilities } from "../../utilities";
import { uploadFile } from "../../utilities/cloudinary/uploads";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone, toTitleCase } from "../../utilities/utils";
import Ward from "../../models/wards/wardModel";
import { generateApplicantId } from "../../helpers/shortCodeHelpers";
import { hashForLookup } from "../../utilities/encryption/encryption";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import { registrationCompletedTemplate } from "../../emailTemplates/registrationCompleted";
import { queueEmail } from "../../utilities/emailServices/emailQueue";

const submitApplicationService = errorUtilities.withServiceErrorHandling(
  async (
    applicantPayload: any,
    certificateFile?: Express.Multer.File,
    certificateOfOriginFile?: Express.Multer.File,
  ) => {
    const {
      firstName,
      surname,
      otherName,
      email,
      phoneNumber,
      ward,
      village,
      nin,
      vin,
      hasEducation,
      highestQualification,
      vocationalSkill,
      otherSkill,
      gender,
      dateOfBirth,
      skillAcquisition,
      otherSkillAcquisition,
      villageHeadName,
      villageHeadPhone,
      discipline,
      otherDiscipline,
      accessCode,
    } = applicantPayload;

    const ninHash = hashForLookup(nin);
    const vinHash = hashForLookup(vin);

    // ── Duplicate checks + ward lookup ──────────────────────────────────────
    const [
      existingPhone,
      existingWard,
      existingNin,
      existingVin,
      existingApplicantCode,
    ]: any = await Promise.all([
      Applicants.findOne({
        where: { phoneNumber: formatNigerianPhone(phoneNumber) },
        attributes: ["id", "phoneNumber"],
      }),
      Ward.findOne({ where: { id: ward }, attributes: ["id", "name"] }),
      Applicants.findOne({
        where: { ninHash },
        attributes: ["id", "ninHash"],
      }),
      Applicants.findOne({
        where: { vinHash },
        attributes: ["id", "vinHash"],
      }),
      AccessCodes.findOne({
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber),
          code: accessCode,
        },
      }),
    ]);

    // if (existingNin) {
    //   throw errorUtilities.createError(
    //     "NIN already registered",
    //     StatusCodes.BAD_REQUEST,
    //   );
    // }

    if (existingVin) {
      throw errorUtilities.createError(
        "VIN already registered",
        StatusCodes.BAD_REQUEST,
      );
    }

    // if (existingPhone) {
    //   throw errorUtilities.createError(
    //     "Phone Number already registered",
    //     StatusCodes.BAD_REQUEST,
    //   );
    // }

    if (email && email.trim() !== "") {
      const existingEmail = await Applicants.findOne({
        where: { email: email.trim().toLowerCase() },
        attributes: ["id", "email"],
      });
      if (existingEmail) {
        throw errorUtilities.createError(
          "Email already registered",
          StatusCodes.BAD_REQUEST,
        );
      }
    }

    if (!existingWard) {
      throw errorUtilities.createError(
        "Ward not found, please refresh page and try again",
        StatusCodes.NOT_FOUND,
      );
    }

    // ── Upload files in parallel ─────────────────────────────────────────────
    // certificateOfOrigin is required on the frontend; we guard here too.
    if (!certificateOfOriginFile) {
      throw errorUtilities.createError(
        "Certificate of Origin is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const [certificateUrl, certificateOfOriginUrl] = await Promise.all([
      certificateFile ? uploadFile(certificateFile) : Promise.resolve(null),
      uploadFile(certificateOfOriginFile),
    ]);

    if (!certificateOfOriginUrl) {
      throw errorUtilities.createError(
        "Certificate of Origin upload failed, please try again",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    if (certificateFile && !certificateUrl) {
      throw errorUtilities.createError(
        "Certificate upload failed, please try again",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    if (!existingApplicantCode) {
      throw errorUtilities.createError(
        "Check Access Code and Try Again. If error persists, contact admin",
        StatusCodes.NOT_FOUND,
      );
    }

    // ── Create applicant record ──────────────────────────────────────────────
    const applicantId = await generateApplicantId(existingWard.name, village);

    const [day, month, year] = dateOfBirth.split("-");
    const formattedDate: any = `${year}-${month}-${day}`;

    const createApplicantPayload = await Applicants.update(
      {
        id: v4(),
        firstName: toTitleCase(firstName),
        surname: toTitleCase(surname),
        otherName: otherName || null,
        email: email ? email.trim().toLowerCase() : null,
        phoneNumber: formatNigerianPhone(phoneNumber),
        ward: existingWard.name,
        village,
        nin: nin.trim(),
        vin: vin.trim(),
        ninHash,
        vinHash,
        hasEducation,
        discipline: discipline || null,
        otherDiscipline: toTitleCase(otherDiscipline) || null,
        highestQualification: highestQualification || null,
        vocationalSkill,
        applicantId,
        otherSkill: toTitleCase(otherSkill) || null,
        gender,
        dateOfBirth: formattedDate,
        skillAcquisition: skillAcquisition || null,
        otherSkillAcquisition: toTitleCase(otherSkillAcquisition) || null,
        villageHeadName: toTitleCase(villageHeadName),
        villageHeadPhone: formatNigerianPhone(villageHeadPhone),
        certificateOfOrigin: certificateOfOriginUrl,
        certificateUrl: certificateUrl || null,
      },
      {
        where: { ninHash, phoneNumber: formatNigerianPhone(phoneNumber) },
      },
    );

    const template = registrationCompletedTemplate(
      applicantId,
      `${firstName} ${surname}`,
    );

    queueEmail({
      to: email,
      subject: template.subject,
      htmlbody: template.htmlBody,
    });

    await AccessCodes.update(
      { isConsumed: true },
      {
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber),
          code: accessCode,
        },
      },
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Registration submitted successfully",
      createApplicantPayload,
    );
  },
);

export default submitApplicationService;
