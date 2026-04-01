import { v4 } from "uuid";
import { StatusCodes } from "../../constants";
import Applicants from "../../models/applicants/applicantModel";
import { errorUtilities } from "../../utilities";
import { uploadFile } from "../../utilities/cloudinary/uploads";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone } from "../../utilities/utils";
import Ward from "../../models/wards/wardModel";
import { generateApplicantId } from "../../helpers/shortCodeHelpers";
import { hashForLookup } from "../../utilities/encryption/encryption";

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
    } = applicantPayload;

    const ninHash = hashForLookup(nin);
    const vinHash = hashForLookup(vin);

    // ── Duplicate checks + ward lookup ──────────────────────────────────────
    const [existingPhone, existingWard, existingNin, existingVin]: any =
      await Promise.all([
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
      ]);

    if (existingPhone) {
      throw errorUtilities.createError(
        "Phone Number already registered",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (email && email.trim() !== "") {
      const existingEmail = await Applicants.findOne({
        where: { email },
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

    if (existingNin) {
      throw errorUtilities.createError(
        "NIN already registered",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (existingVin) {
      throw errorUtilities.createError(
        "VIN already registered",
        StatusCodes.BAD_REQUEST,
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

    // ── Create applicant record ──────────────────────────────────────────────
    const applicantId = await generateApplicantId(existingWard.name, village);

    const createApplicantPayload = (
      await Applicants.create({
        id: v4(),
        firstName,
        surname,
        otherName: otherName || null,
        email: email || null,
        phoneNumber: formatNigerianPhone(phoneNumber),
        ward: existingWard.name,
        village,
        nin,
        vin,
        ninHash,
        vinHash,
        hasEducation,
        highestQualification: highestQualification || null,
        vocationalSkill,
        applicantId,
        otherSkill: otherSkill || null,
        gender,
        dateOfBirth,
        skillAcquisition: skillAcquisition || null,
        otherSkillAcquisition: otherSkillAcquisition || null,
        villageHeadName,
        villageHeadPhone,
        certificateOfOrigin: certificateOfOriginUrl,
        certificateUrl: certificateUrl || null,
      })
    ).get({ plain: true });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Registration submitted successfully",
      createApplicantPayload,
    );
  },
);

export default submitApplicationService;
