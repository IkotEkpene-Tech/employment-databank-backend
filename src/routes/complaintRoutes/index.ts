// routes/complaintRoutes.ts
import express from "express";
import {
  complaintValidationSchema,
  inputValidator,
} from "../../validations/joi/joi.validations";
import createComplaintController from "../../controllers/complaint/createComplaintController";

const router = express.Router();

router.post(
  "/submit",
  inputValidator(complaintValidationSchema),
  createComplaintController,
);

export default router;
