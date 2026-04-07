import { v4 } from "uuid";
import { Transaction } from "sequelize";
import { ApplicantIdCounter } from "../models/idCounter/idCounterModel";
import { shortCodes } from "../utilities/data/shortCodes";
import { ApplicantIdCounterAttributes } from "../types/applicantModelTypes";

const getWardKey = (wardName: string): string => {
  const number = wardName.toString().replace(/\D/g, "");
  return `ward${number}` as string;
};

const getVillageCode = (wardName: string, villageName: string): string => {
  const wardKey = getWardKey(wardName);
  const villages = shortCodes[wardKey];

  if (!villages) {
    throw new Error(`Ward "${wardName}" not found in shortcodes`);
  }

  const match = villages.find(
    (v: any) => v.village.toUpperCase() === villageName.toUpperCase(),
  );

  if (!match) {
    throw new Error(`Village "${villageName}" not found in ${wardKey}`);
  }

  return match.code;
};

/**
 * Generates a unique applicant ID in the format:
 * IK-WARD05-IOE-00001
 *
 * @param wardName   - e.g. "WARD 5" | "ward5" | "5"
 * @param villageName - e.g. "IKOT OBONG EDONG"
 * @param transaction - optional Sequelize transaction
 */
const generateApplicantId = async (
  wardName: string,
  villageName: string,
  transaction?: Transaction,
): Promise<string> => {
  const lgaCode = "IK";
  const wardNumber = wardName.toString().replace(/\D/g, "").padStart(2, "0");
  const wardSegment = `WARD${wardNumber}`;
  const villageCode = getVillageCode(wardName, villageName);
  const prefix = `${lgaCode}-${wardSegment}-${villageCode}`;
  const tx = transaction ?? null;

  try {
    let counter: ApplicantIdCounterAttributes | any =
      await ApplicantIdCounter.findOne({ where: { prefix } });
    let nextNumber: number;

    if (!counter) {
      await ApplicantIdCounter.create(
        { id: v4(), prefix, lastNumber: 1 },
        { transaction: tx },
      );
      nextNumber = 1;
    } else {
      nextNumber = counter.lastNumber + 1;
      await ApplicantIdCounter.update(
        { lastNumber: nextNumber },
        { where: { prefix }, transaction: tx },
      );
    }

    const formattedNumber = nextNumber.toString().padStart(5, "0");
    return `${prefix}-${formattedNumber}`;
  } catch (error) {
    console.error("Error generating applicant ID:", error);
    throw new Error(
      `Failed to generate applicant ID for ward "${wardName}", village "${villageName}": ${error}`,
    );
  }
};

export { generateApplicantId, getVillageCode, getWardKey };

export default { generateApplicantId };
