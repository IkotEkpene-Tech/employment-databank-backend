import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";

const getApplicationService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    if (user.get("applicationStatus") !== ApplicationStatus.Submitted) {
      throw errorUtilities.createError(
        "No submitted application found for this account",
        StatusCodes.BAD_REQUEST,
      );
    }

    const json: any = user.toJSON();

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Submitted application fetched",
      {
        applicantId: json.applicantId,
        firstName: json.firstName,
        surname: json.surname,
        otherName: json.otherName ?? undefined,
        gender: json.gender,
        dob: json.dateOfBirth,
        ninLast4: json.nin ? String(json.nin).slice(-4) : undefined,
        vin: json.vin,
        ward: json.ward,
        village: json.village,
        hasEducation: json.hasEducation,
        highestQualification: json.highestQualification ?? undefined,
        discipline: json.discipline ?? undefined,
        otherDiscipline: json.otherDiscipline ?? undefined,
        vocationalSkill: json.vocationalSkill,
        otherSkill: json.otherSkill ?? undefined,
        skillAcquisition: json.skillAcquisition ?? undefined,
        otherSkillAcquisition: json.otherSkillAcquisition ?? undefined,
        villageHeadName: json.villageHeadName,
        villageHeadPhone: json.villageHeadPhone,
        certificateUrl: json.certificateUrl ?? undefined,
        certificateOfOriginUrl: json.certificateOfOrigin ?? undefined,
        submittedAt: json.submittedAt ?? undefined,
      },
    );
  },
);

export default getApplicationService;
