import axios from "axios";
import { errorUtilities } from "..";
import configurations from "../../configurations";

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
  async (nin: string): Promise<NINVerificationResult> => {
    const response = await axios.post(
      `${configurations.LUMIID_BASE_URL}/api/v1/ng/nin-basic/`,
      { id_number: nin },
      {
        headers: {
          Authorization: `Bearer ${configurations.LUMIID_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

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