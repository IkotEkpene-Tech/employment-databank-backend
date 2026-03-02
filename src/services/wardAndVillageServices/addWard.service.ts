import { Op } from "sequelize";
import Ward from "../../models/wards/wardModel";
import { errorUtilities } from "../../utilities";
import { performTransaction } from "../../middlewares/databaseTransactions.middleware";
import { StatusCodes } from "../../constants";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { v4 } from "uuid";

type WardPayload = {
  name: string;
  code: string;
  lga: string;
};

const addWardService = errorUtilities.withServiceErrorHandling(
  async (wardPayload: WardPayload | WardPayload[]) => {
    let wards: any[] = Array.isArray(wardPayload) ? wardPayload : [wardPayload];

    wards = wards.map((ward) => ({
      ...ward,
      id: v4(),
    }));

    const names = wards.map((singleWard) => singleWard.name);
    const codes = wards.map((singleWard) => singleWard.code);
    const lgas = wards.map((singleWard) => singleWard.lga);

    let createdWards: any[] = [];

    await performTransaction([
      async (transaction) => {
        const [existingName, existingCode]: any = await Promise.all([
          Ward.findOne({
            where: {
              name: { [Op.in]: names },
              lga: { [Op.in]: lgas },
            },
            attributes: ["id", "name", "lga"],
            transaction,
          }),
          Ward.findOne({
            where: {
              code: { [Op.in]: codes },
              lga: { [Op.in]: lgas },
            },
            attributes: ["id", "code", "lga"],
            transaction,
          }),
        ]);

        if (existingName) {
          throw errorUtilities.createError(
            `WARD WITH NAME '${existingName.name}' ALREADY EXISTS IN LGA '${existingName.lga}'`,
            StatusCodes.NOT_FOUND,
          );
        }

        if (existingCode) {
          throw errorUtilities.createError(
            `WARD WITH CODE '${existingCode.code}' ALREADY EXISTS IN LGA '${existingCode.lga}'`,
            StatusCodes.NOT_FOUND,
          );
        }

        createdWards = await Ward.bulkCreate(wards, {
          transaction,
          returning: true,
        });
      },
    ]);

    if (createdWards.length) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.CREATED,
        "Wards Created Successfully",
        createdWards,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Unable to create ward(s), please try again",
    );
  },
);

export default addWardService;
