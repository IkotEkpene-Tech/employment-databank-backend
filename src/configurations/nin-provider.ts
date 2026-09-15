import axios from "axios";
import configurations from ".";

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

/**
 * Calls the LumiID NIN-verification provider for a single NIN.
 * Throws a friendly, operational-style error (message + statusCode) on any
 * provider-side rejection (not found / invalid / unavailable).
 */
const verifyNIN = async (nin: string): Promise<NINVerificationResult> => {
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
      const error: any = new Error(
        data.message || "NIN verification failed, check NIN and try again",
      );
      error.statusCode = 400;
      throw error;
    }

    return data.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const lumiidError = error.response.data;

      const errorMessages: Record<string, string> = {
        NIN_NOT_FOUND:
          "NIN not found. Please ensure your 11-digit NIN is correct and try again.",
        INVALID_NIN: "The NIN provided is invalid. Please check and try again.",
        SERVICE_UNAVAILABLE:
          "NIN verification service is temporarily unavailable. Please try again later.",
      };

      const friendlyMessage =
        errorMessages[lumiidError?.code] ||
        lumiidError?.message ||
        "NIN verification failed. Please check your NIN and try again.";

      const friendlyError: any = new Error(friendlyMessage);
      friendlyError.statusCode = 400;
      throw friendlyError;
    }
    throw error;
  }
};

export default verifyNIN;
