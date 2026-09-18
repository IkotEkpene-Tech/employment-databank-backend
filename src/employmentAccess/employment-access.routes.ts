import express from "express";
import Joi from "joi";
import validate from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import { limiter } from "../configurations/rate-limit";
import initiatePayment from "./controllers/initiate-payment";
import callback from "./controllers/callback";
import paymentStatus from "./controllers/payment-status";
import status from "./controllers/status";
import verify from "./controllers/verify";
import confirm from "./controllers/confirm";

const router = express.Router();

const ninSchema = Joi.string()
  .trim()
  .length(11)
  .pattern(/^\d{11}$/)
  .required()
  .messages({
    "string.length": "NIN must be exactly 11 digits",
    "string.pattern.base": "NIN must be exactly 11 digits",
  });

const accessCodeSchema = Joi.string().trim().length(8).required().messages({
  "string.length": "Access code must be exactly 8 characters",
});

const initiatePaymentSchema = Joi.object({ nin: ninSchema });

const verifySchema = Joi.object({
  nin: ninSchema,
  accessCode: accessCodeSchema,
});

// Paystack's redirect has no Authorization header — this must stay public.
router.get("/payment/callback", callback);

router.post(
  "/initiate-payment",
  authenticate,
  limiter,
  validate(initiatePaymentSchema),
  initiatePayment,
);
router.get("/payment-status", authenticate, paymentStatus);
router.get("/status", authenticate, status);
router.post("/verify", authenticate, validate(verifySchema), verify);
router.post("/confirm", authenticate, validate(verifySchema), confirm);

export default router;
