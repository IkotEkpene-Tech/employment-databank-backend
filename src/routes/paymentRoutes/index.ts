import express from "express";
import intializePaymentController from "../../controllers/payment/intializePaymentController";
import verifyPaymentController from "../../controllers/payment/verifyPaymentController";
import webhookController from "../../controllers/payment/webHookController";
import { limiter } from "../../utilities/utils";
import {
  applicantRetrievalValidationSchema,
  inputValidator,
} from "../../validations/joi/joi.validations";

const router = express.Router();

router.post(
  "/initialize",
  limiter,
  inputValidator(applicantRetrievalValidationSchema),
  intializePaymentController,
);
router.get("/callback", verifyPaymentController);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookController,
);

export default router;
