import express from "express";
import multer from "multer";
import submitApplicationsController from "../../controllers/applicantsControllers/addApplicantController";
import {
  applicantValidationSchema,
  inputValidator,
} from "../../validations/joi/joi.validations";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/submit-application",
  upload.single("certificate"),
  inputValidator(applicantValidationSchema),
  submitApplicationsController,
);

export default router;
