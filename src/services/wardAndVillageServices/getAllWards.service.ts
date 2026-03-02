import Ward from "../../models/wards/wardModel";
import { errorUtilities } from "../../utilities";
import { StatusCodes } from "../../constants";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import Village from "../../models/villages/villageModel";

const getAllWardsService = errorUtilities.withServiceErrorHandling(async () => {
  const allWards = await Ward.findAll({
    raw: true,
    attributes: ["id", "name"],
  });
  return responseUtilities.handleServicesResponse(
    StatusCodes.OK,
    "All wards fetched successfully",
    allWards,
  );
});

const getAllWardsAndVillagesService = errorUtilities.withServiceErrorHandling(
  async () => {
    const allWards = await Ward.findAll({
      attributes: ["id", "name"],
      include: [{ model: Village, as: "villages" }],
    });
    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "All wards and villages fetched successfully",
      allWards,
    );
  },
);

export { getAllWardsService, getAllWardsAndVillagesService };
