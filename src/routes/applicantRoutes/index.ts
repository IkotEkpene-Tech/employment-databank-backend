import express from "express";
import multer from "multer";
import submitApplicationsController from "../../controllers/applicantsControllers/addApplicantController";
import {
  applicantNinVerificationSchema,
  applicantRetrievalValidationSchema,
  applicantValidationSchema,
  inputValidator,
  saveApplicantNinDataValidationSchema,
} from "../../validations/joi/joi.validations";
import checkApplicantController from "../../controllers/applicantsControllers/checkApplicantController";
import { limiter } from "../../utilities/utils";
import verifyApplicantNinController from "../../controllers/applicantsControllers/verifyApplicantNinController";
import saveApplicantNinDetailsController from "../../controllers/applicantsControllers/saveApplicatNinDetailsController";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/submit-application",
  limiter,
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "certificateOfOrigin", maxCount: 1 },
  ]),
  inputValidator(applicantValidationSchema),
  submitApplicationsController,
);

router.post(
  "/retrieve-applicant",
  inputValidator(applicantRetrievalValidationSchema),
  checkApplicantController,
);

router.post(
  "/verify-nin",
  inputValidator(applicantNinVerificationSchema),
  verifyApplicantNinController,
);

router.post(
  "/save-nin-details",
  inputValidator(saveApplicantNinDataValidationSchema),
  saveApplicantNinDetailsController,
);

export default router;
