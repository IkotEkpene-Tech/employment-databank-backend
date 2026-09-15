import { Request, Response } from "express";
import configurations from "../../configurations";
import processPaymentService from "../services/process-payment.service";

/**
 * Paystack redirects the user's browser here (the `callback_url` passed to
 * /transaction/initialize) once they finish paying on Paystack's hosted
 * checkout page — no Authorization header is available on this request.
 * Verifies the payment (idempotent, safe even if the webhook already beat it
 * here) and hands the browser back to the frontend, which fetches the real
 * outcome — and the access code, revealed once — via the authenticated
 * GET /employment-access/payment-status?reference= endpoint.
 */
const callback = async (request: Request, response: Response): Promise<any> => {
  const reference = (request.query.reference ?? request.query.trxref) as
    | string
    | undefined;

  if (!reference) {
    return response.redirect(
      `${configurations.FRONTEND_URL}/apply/payment-status?error=missing_reference`,
    );
  }

  try {
    await processPaymentService(reference);
  } catch (error) {
    console.error("[employment-access/payment/callback] verification error:", error);
    // fall through — the frontend resolves the real status itself.
  }

  return response.redirect(
    `${configurations.FRONTEND_URL}/apply/payment-status?reference=${encodeURIComponent(reference)}`,
  );
};

export default callback;
