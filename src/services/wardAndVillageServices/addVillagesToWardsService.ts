import { Op } from "sequelize";
import { database } from "../../configurations/database";
import Village from "../../models/villages/villageModel";
import Ward from "../../models/wards/wardModel";
import { errorUtilities } from "../../utilities";
import { performTransaction } from "../../middlewares/databaseTransactions.middleware";
import { StatusCodes } from "../../constants";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { v4 } from "uuid";

type Payload = {
  data: {
    wardId: string;
    villages: string[];
  }[];
};

const addVillagesToWardService = errorUtilities.withServiceErrorHandling(
  async (payload: Payload) => {
    const { data } = payload;

    const villagesToCreate: Array<{
      id?: string;
      name: string;
      wardId: string;
    }> = [];

    const wardIds = [...new Set(data.map(item => item.wardId))];

    let createdVillages: any[] = [];

    await performTransaction([
      async (transaction) => {
        // Verify all wards exist
        const existingWards = await Ward.findAll({
          where: {
            id: { [Op.in]: wardIds },
          },
          attributes: ["id"],
          transaction,
        });

        const existingWardIds = existingWards.map((ward: any) => ward.id);

        const invalidWard = wardIds.find(id => !existingWardIds.includes(id));
        if (invalidWard) {
          throw errorUtilities.createError(
            `WARD WITH ID '${invalidWard}' DOES NOT EXIST`,
            StatusCodes.NOT_FOUND
          );
        }

        // Prepare villages to create with UUIDs
        for (const entry of data) {
          const { wardId, villages } = entry;

          if (!Array.isArray(villages) || villages.length === 0) continue;

          for (const villageName of villages) {
            villagesToCreate.push({
              id: v4(),
              name: villageName.trim().toUpperCase(),
              wardId,
            });
          }
        }

        // Remove duplicates within the same payload
        const uniqueVillagesMap = new Map();
        for (const v of villagesToCreate) {
          const key = `${v.name}-${v.wardId}`;
          if (!uniqueVillagesMap.has(key)) {
            uniqueVillagesMap.set(key, v);
          }
        }

        const uniqueVillages = Array.from(uniqueVillagesMap.values());

        // Check for existing villages
        const existingVillages = await Village.findAll({
          where: {
            [Op.or]: uniqueVillages.map(v => ({
              name: v.name,
              wardId: v.wardId,
            })),
          },
          attributes: ["name", "wardId"],
          transaction,
        });

        const existingSet = new Set(
          existingVillages.map((village: any) => `${village.name}-${village.wardId}`)
        );

        const finalVillages = uniqueVillages.filter(
          v => !existingSet.has(`${v.name}-${v.wardId}`)
        );

        if (finalVillages.length === 0) {
          throw errorUtilities.createError(
            "ALL VILLAGES ALREADY EXIST IN THE SPECIFIED WARDS",
            StatusCodes.CONFLICT
          );
        }

        createdVillages = await Village.bulkCreate(finalVillages, {
          transaction,
          returning: true,
        });
      },
    ]);

    if (createdVillages.length) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.CREATED,
        "Villages Added Successfully",
        {
          totalInserted: createdVillages.length,
          skippedDuplicates: villagesToCreate.length - createdVillages.length,
          data: createdVillages,
        }
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Unable to add village(s), please try again"
    );
  }
);

export default addVillagesToWardService;