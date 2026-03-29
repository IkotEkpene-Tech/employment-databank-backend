import { v4 } from "uuid";
import { StatusCodes } from "../../constants";
import Applicants from "../../models/applicants/applicantModel";
import { errorUtilities } from "../../utilities";
import { uploadFile } from "../../utilities/cloudinary/uploads";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone } from "../../utilities/utils";
import Ward from "../../models/wards/wardModel";
import { generateApplicantId } from "../../helpers/shortCodeHelpers";

const submitApplicationService = errorUtilities.withServiceErrorHandling(
  async (applicantPayload: any, file?: any) => {
    const {
      firstName,
      surname,
      otherName,
      email,
      phoneNumber,
      ward,
      village,
      hasEducation,
      highestQualification,
      vocationalSkill,
      otherSkill,
      villageHeadName,
      villageHeadPhone,
    } = applicantPayload;

    const [existingPhone, existingWard]: any = await Promise.all([
      Applicants.findOne({
        where: { phoneNumber: formatNigerianPhone(phoneNumber) },
        attributes: ["id", "phoneNumber"],
      }),
      Ward.findOne({ where: { id: ward }, attributes: ["id", "name"] }),
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

    let certificateUrl: any = null;

    if (file) {
      const fileUrl = await uploadFile(file);

      if (!fileUrl) {
        throw errorUtilities.createError(
          "File upload failed, please try process again",
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
      certificateUrl = fileUrl;
    }

    const applicantId = await generateApplicantId(existingWard.name, village)

    const createApplicantPayload = (
      await Applicants.create({
        id: v4(),
        firstName,
        surname,
        otherName,
        email,
        phoneNumber: formatNigerianPhone(phoneNumber),
        ward: existingWard?.name,
        village,
        hasEducation,
        highestQualification,
        vocationalSkill,
        applicantId,
        otherSkill,
        villageHeadName,
        villageHeadPhone,
        certificateUrl,
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
