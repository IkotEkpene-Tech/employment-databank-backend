import { Ward } from "../Ward";
import { Village } from "../Village";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";

export const getAllWardsService = errorUtilities.withServiceErrorHandling(
  async () => {
    const allWards = await Ward.findAll({
      raw: true,
      attributes: ["id", "name"],
    });
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "All wards fetched successfully",
      allWards,
    );
  },
);

export const getAllWardsAndVillagesService =
  errorUtilities.withServiceErrorHandling(async () => {
    const allWards = await Ward.findAll({
      attributes: ["id", "name"],
      include: [
        { model: Village, as: "villages", attributes: ["id", "name"] },
      ],
    });
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "All wards and villages fetched successfully",
      allWards,
    );
  });
