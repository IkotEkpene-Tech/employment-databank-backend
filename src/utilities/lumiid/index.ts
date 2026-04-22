import axios from "axios";
import { errorUtilities } from "..";
import configurations from "../../configurations";
import { AccessCodes } from "../../models/accessCodes/accessCodesModel";
import { formatNigerianPhone } from "../utils";

export interface NINVerificationResult {
  nin: string;
  firstname: string;
  lastname: string;
  middlename: string;
  phone: string;
  gender: string;
  birthdate: string;
  photo: string;
  residence: {
    address1: string;
    town: string;
    lga: string;
    state: string;
  };
}

const verifyNIN = errorUtilities.withServiceErrorHandling(
  async (nin: string, phoneNumber:string, accessCode:string): Promise<NINVerificationResult> => {
    const response = await axios.post(
      `${configurations.LUMIID_BASE_URL}/v1/ng/nin-basic/`,
      { nin },
      {
        headers: {
          Authorization: `Bearer ${configurations.LUMIID_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

     await AccessCodes.increment("usageCount", {
      by: 1,
      where: {
        phoneNumber: formatNigerianPhone(phoneNumber.trim()),
        code: accessCode.trim(),
      },
    });

    if (!data.success) {
      throw errorUtilities.createError(
        data.message || "NIN verification failed, check NIN and try again",
        400,
      );
    }
    return data.data;
  },
);

export default verifyNIN;