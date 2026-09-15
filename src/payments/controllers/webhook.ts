import { Request, Response } from "express";
import crypto from "crypto";
import configurations from "../../configurations";
import processPaymentService from "../../employmentAccess/services/process-payment.service";

const webhook = async (request: Request, response: Response): Promise<any> => {
  const rawBody =
    request.body instanceof Buffer
      ? request.body.toString("utf8")
      : JSON.stringify(request.body);

  const hash = crypto
    .createHmac("sha512", configurations.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (hash !== request.headers["x-paystack-signature"]) {
    return response.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(rawBody);
  const { event, data } = payload;

  if (event === "charge.success") {
    try {
      await processPaymentService(data.reference);
    } catch (error) {
      // Never let a downstream failure cause Paystack to keep retrying an
      // already-received webhook.
      console.error("[payments/webhook] processing error:", error);
    }
  }

  return response.sendStatus(200);
};

export default webhook;
