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

// const verifyNIN = errorUtilities.withServiceErrorHandling(
//   async (
//     nin: string,
//     phoneNumber: string,
//     accessCode: string,
//   ): Promise<NINVerificationResult> => {
//     const response = await axios.post(
//       `${configurations.LUMIID_BASE_URL}/v1/ng/nin-basic/`,
//       { nin },
//       {
//         headers: {
//           Authorization: `Bearer ${configurations.LUMIID_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     const data = response.data;

//     await AccessCodes.increment("usageCount", {
//       by: 1,
//       where: {
//         phoneNumber: formatNigerianPhone(phoneNumber.trim()),
//         code: accessCode.trim(),
//       },
//     });

//     if (!data.success) {
//       throw errorUtilities.createError(
//         data.message || "NIN verification failed, check NIN and try again",
//         400,
//       );
//     }
//     return data.data;
//   },
// );

const verifyNIN = errorUtilities.withServiceErrorHandling(
  async (
    nin: string,
    phoneNumber: string,
    accessCode: string,
  ): Promise<NINVerificationResult> => {
    try {
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

      if (!data.success) {
        throw errorUtilities.createError(
          data.message || "NIN verification failed, check NIN and try again",
          400,
        );
      }

      await AccessCodes.increment("usageCount", {
        by: 1,
        where: {
          phoneNumber: formatNigerianPhone(phoneNumber.trim()),
          code: accessCode.trim(),
        },
      });

      return data.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const lumiidError = error.response.data;
        const CLIENT_ERROR_CODES = ["NIN_NOT_FOUND", "INVALID_NIN"];

        const errorMessages: Record<string, string> = {
          NIN_NOT_FOUND:
            "NIN not found. Please ensure your 11-digit NIN is correct and try again. Please note that your access code is being used up each time you verify your NIN.",
          INVALID_NIN:
            "The NIN provided is invalid. Please check and try again. Please note that your access code is being used up each time you verify your NIN.",
          SERVICE_UNAVAILABLE:
            "NIN verification service is temporarily unavailable. Please try again later.",
        };

        const friendlyMessage =
          errorMessages[lumiidError?.code] ||
          lumiidError?.message ||
          "NIN verification failed. Please check your NIN and try again.";

        if (CLIENT_ERROR_CODES.includes(lumiidError?.code)) {
          await AccessCodes.increment("usageCount", {
            by: 1,
            where: {
              phoneNumber: formatNigerianPhone(phoneNumber.trim()),
              code: accessCode.trim(),
            },
          });
        }

        throw errorUtilities.createError(friendlyMessage, 400);
      }
      throw error;
    }
  },
);

export default verifyNIN;
