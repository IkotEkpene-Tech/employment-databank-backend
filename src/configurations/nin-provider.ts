import axios from "axios";
import moment from "moment";
import configurations from ".";

export interface NINVerificationResult {
  nin: string;
  firstname: string;
  lastname: string;
  middlename: string;
  phone: string;
  gender: string;
  /** ISO date (YYYY-MM-DD), normalized from whatever format the provider sent. */
  birthdate: string;
  /** data:image/...;base64 URL of the NIN photo, when the provider returns one. */
  photo: string;
  address: string;
  stateOfOrigin: string;
}

/**
 * Thrown for any failed provider call. `countsAsTrial` is true only when
 * LumiID actually answered with a verdict (e.g. invalid NIN) — that lookup
 * was billed. It is false for anything on our side or LumiID's side (network
 * failure, 5xx, auth/balance/rate-limit problems, "service unavailable"),
 * which the user must not be charged a trial for.
 */
export class NinProviderError extends Error {
  statusCode: number;
  countsAsTrial: boolean;

  constructor(message: string, statusCode: number, countsAsTrial: boolean) {
    super(message);
    this.statusCode = statusCode;
    this.countsAsTrial = countsAsTrial;
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  NIN_NOT_FOUND:
    "NIN not found. Please ensure your 11-digit NIN is correct and try again.",
  INVALID_NIN: "The NIN provided is invalid. Please check and try again.",
};

// Provider/infra-side failure codes: never billed, never a user mistake.
const UNBILLED_CODES = new Set([
  "SERVICE_UNAVAILABLE",
  "INTERNAL_ERROR",
  "SERVER_ERROR",
  "TIMEOUT",
  "RATE_LIMITED",
  "INSUFFICIENT_BALANCE",
  "UNAUTHORIZED",
  "FORBIDDEN",
]);
// 4xx statuses that mean *we* are misconfigured/throttled, not that the NIN was bad.
const UNBILLED_STATUSES = new Set([401, 402, 403, 408, 429]);

const UNAVAILABLE_MESSAGE =
  "NIN verification is temporarily unavailable. This did not use up one of your attempts — please try again shortly.";

const str = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const toIsoDate = (raw: unknown): string => {
  const value = str(raw);
  if (!value) return "";
  const parsed = moment(
    value,
    ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"],
    true,
  );
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

// LumiID has returned both flat-lowercase (firstname) and snake_case
// (first_name) field names across endpoints/versions — accept either.
const normalize = (nin: string, d: Record<string, any>): NINVerificationResult => ({
  nin: str(d.nin) || nin,
  firstname: str(d.firstname ?? d.first_name),
  lastname: str(d.lastname ?? d.last_name),
  middlename: str(d.middlename ?? d.middle_name),
  phone: str(d.phone ?? d.phone_number),
  gender: str(d.gender),
  birthdate: toIsoDate(d.birthdate ?? d.date_of_birth),
  photo: str(d.photo),
  address: str(d.address ?? d.residence?.address1),
  stateOfOrigin: str(d.state_of_origin ?? d.residence?.state),
});

const fail = (body: any, status: number): NinProviderError => {
  const code: string | undefined = body?.error?.code ?? body?.code;
  const unbilled =
    UNBILLED_STATUSES.has(status) ||
    status >= 500 ||
    (code !== undefined && UNBILLED_CODES.has(code));

  if (unbilled) return new NinProviderError(UNAVAILABLE_MESSAGE, 503, false);

  const message =
    (code && FRIENDLY_MESSAGES[code]) ||
    body?.error?.message ||
    body?.message ||
    "NIN verification failed. Please check your NIN and try again.";
  return new NinProviderError(message, 400, true);
};

/** Calls LumiID once for a single NIN. See NinProviderError for billing semantics. */
const verifyNIN = async (nin: string): Promise<NINVerificationResult> => {
  let response;
  try {
    response = await axios.post(
      `${configurations.LUMIID_BASE_URL}/v1/ng/nin-basic/`,
      { nin },
      {
        headers: {
          Authorization: `Bearer ${configurations.LUMIID_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30_000,
      },
    );
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw fail(error.response.data, error.response.status);
    }
    // No response at all (network error / timeout): nothing was billed.
    throw new NinProviderError(UNAVAILABLE_MESSAGE, 503, false);
  }

  const body = response.data;
  if (!body?.success) throw fail(body, response.status);

  if (!body.data || typeof body.data !== "object") {
    // "success" with no usable payload: treat as a provider fault.
    throw new NinProviderError(UNAVAILABLE_MESSAGE, 503, false);
  }

  const result = normalize(nin, body.data);
  if (!result.firstname && !result.lastname) {
    throw new NinProviderError(UNAVAILABLE_MESSAGE, 503, false);
  }
  return result;
};

export default verifyNIN;
