import { Op } from "sequelize";
import { User, ApplicationStatus } from "../../auth/User";
import { RegistrationDraft } from "../../auth/RegistrationDraft";
import { Ward } from "../../wardsAndVillages/Ward";
import { Village } from "../../wardsAndVillages/Village";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { uploadFile } from "../../configurations/upload";
import { toTitleCase, formatNigerianPhone } from "../../configurations/utils";
import { hashForLookup } from "../../configurations/encryption";
import { queueEmail } from "../../configurations/email-queue";
import { generateApplicantId } from "../helpers/applicant-id.helpers";
import { registrationCompletedTemplate } from "../emailTemplates/registrationCompleted";

const submitApplicationService = errorUtilities.withServiceErrorHandling(
  async (
    userId: string,
    applicantPayload: any,
    certificateFile?: Express.Multer.File,
    certificateOfOriginFile?: Express.Multer.File,
  ) => {
    const {
      surname,
      firstName,
      otherName,
      gender,
      vin,
      ward,
      village,
      hasEducation,
      highestQualification,
      discipline,
      otherDiscipline,
      vocationalSkill,
      otherSkill,
      skillAcquisition,
      otherSkillAcquisition,
      villageHeadName,
      villageHeadPhone,
    } = applicantPayload;

    const user = await User.findByPk(userId);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    if (user.get("applicationStatus") === ApplicationStatus.Submitted) {
      throw errorUtilities.createError(
        "Your application has already been submitted",
        StatusCodes.BAD_REQUEST,
      );
    }

    const vinHash = hashForLookup(vin);

    const [existingWard, existingVin] = await Promise.all([
      Ward.findOne({ where: { id: ward }, attributes: ["id", "name"] }),
      User.findOne({
        where: { vinHash, id: { [Op.ne]: userId } },
        attributes: ["id"],
      }),
    ]);

    if (!existingWard) {
      throw errorUtilities.createError(
        "Ward not found, please refresh page and try again",
        StatusCodes.NOT_FOUND,
      );
    }

    if (existingVin) {
      throw errorUtilities.createError(
        "VIN already registered",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Village is submitted as free text, not an id (unlike ward) — resolve
    // it case-insensitively against the canonical record so "Ikot Obong
    // Edong" and "IKOT OBONG EDONG" don't end up stored as two different
    // strings, and so what we store always matches the seeded village name.
    const existingVillage = await Village.findOne({
      where: {
        wardId: existingWard.get("id") as string,
        name: { [Op.iLike]: village.trim() },
      },
      attributes: ["id", "name"],
    });

    if (!existingVillage) {
      throw errorUtilities.createError(
        "Village not found, please refresh page and try again",
        StatusCodes.NOT_FOUND,
      );
    }

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

    const applicantId = await generateApplicantId(
      existingWard.get("name") as string,
      existingVillage.get("name") as string,
    );

    user.set({
      firstName: toTitleCase(firstName) ?? user.get("firstName"),
      surname: toTitleCase(surname) ?? user.get("surname"),
      otherName: toTitleCase(otherName),
      gender: gender ? String(gender).trim().toLowerCase() : user.get("gender"),
      ward: existingWard.get("name"),
      village: existingVillage.get("name"),
      vin: vin.trim(),
      vinHash,
      hasEducation,
      discipline: toTitleCase(discipline),
      otherDiscipline: toTitleCase(otherDiscipline),
      highestQualification: highestQualification || null,
      vocationalSkill: toTitleCase(vocationalSkill),
      applicantId,
      otherSkill: toTitleCase(otherSkill),
      skillAcquisition: toTitleCase(skillAcquisition),
      otherSkillAcquisition: toTitleCase(otherSkillAcquisition),
      villageHeadName: toTitleCase(villageHeadName),
      villageHeadPhone: formatNigerianPhone(villageHeadPhone),
      certificateOfOrigin: certificateOfOriginUrl,
      certificateUrl: certificateUrl || null,
      applicationStatus: ApplicationStatus.Submitted,
      submittedAt: new Date(),
    } as any);
    await user.save();

    await RegistrationDraft.destroy({ where: { userId } });

    const template = registrationCompletedTemplate(
      applicantId,
      `${user.get("firstName")} ${user.get("surname")}`,
    );

    await queueEmail({
      to: user.get("email"),
      subject: template.subject,
      htmlbody: template.htmlBody,
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Application submitted successfully",
    );
  },
);

export default submitApplicationService;
