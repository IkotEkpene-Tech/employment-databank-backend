import { StatusCodes } from "../../constants";
import AccessCodes from "../../models/accessCodes/accessCodesModel";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { formatNigerianPhone } from "../../utilities/utils";

const checkApplicantService = errorUtilities.withServiceErrorHandling(
  async (phoneNumber: string, isFetchFull: any) => {
    const projection = ["id", "phoneNumber"];

    const fetchFull = isFetchFull === "true";

    if (fetchFull) {
      projection.push("code", "phoneNumber", "usageCount", "expiresAt", "maxUsage");
    }
    const exisitingApplicant = await AccessCodes.findOne({
      where: { phoneNumber: formatNigerianPhone(phoneNumber) },
      attributes: projection,
    });
    if (!exisitingApplicant) {
      throw errorUtilities.createError(
        "Applicant not found",
        StatusCodes.NOT_FOUND,
      );
    } else {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Applicant Found",
        exisitingApplicant,
      );
    }
  },
);

export default checkApplicantService;
