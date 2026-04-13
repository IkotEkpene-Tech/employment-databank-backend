// controllers/paymentControllers/webhookController.ts
import { Request, Response } from "express";
import crypto from "crypto";
import configurations from "../../configurations";
import verifyPaymentService from "../../services/paymentServices/verifyPayment";

const webhookController = async (request: Request, response: Response): Promise<any> => {
  const rawBody = request.body instanceof Buffer 
    ? request.body.toString("utf8")
    : JSON.stringify(request.body);

  const hash = crypto
    .createHmac("sha512", configurations.PAYSTACK_SECRET_KEY!)
    .update(rawBody)  // 👈 use raw string, not JSON.stringify(buffer)
    .digest("hex");

  if (hash !== request.headers["x-paystack-signature"]) {
    return response.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(rawBody);  // 👈 parse it yourself after verification
  const { event, data } = payload;

  if (event === "charge.success") {
    await verifyPaymentService(data.reference);
  }

  return response.sendStatus(200);
};

export default webhookController;
