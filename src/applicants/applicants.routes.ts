import express from "express";
import Joi from "joi";
import validate from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import { upload } from "../configurations/upload";
import { limiter } from "../configurations/rate-limit";
import getMe from "./controllers/get-me";
import getDraft from "./controllers/get-draft";
import saveDraft from "./controllers/save-draft";
import deleteDraft from "./controllers/delete-draft";
import submitApplication from "./controllers/submit-application";
import getApplication from "./controllers/get-application";

const router = express.Router();

router.use(authenticate);

const phoneRegex = /^0[0-9]{10}$/;

enum hasEducationEnum {
  yes = "yes",
  no = "no",
}

enum highestQualificationEnum {
  primary = "primary",
  ssce = "ssce",
  ond = "ond",
  hnd = "hnd",
  bsc = "bsc",
  postBsc = "post-bsc",
}

enum genderEnum {
  male = "male",
  female = "female",
}

const saveDraftSchema = Joi.object({
  values: Joi.object().unknown(true).required(),
  step: Joi.number().integer().min(0).required(),
});

const submitApplicationSchema = Joi.object({
  surname: Joi.string().trim().min(2).max(100).required(),
  firstName: Joi.string().trim().min(2).max(100).required(),
  otherName: Joi.string().trim().max(100).optional().allow("", null),
  gender: Joi.string()
    .valid(...Object.values(genderEnum))
    .required(),
  vin: Joi.string().trim().min(19).required().messages({
    "string.min": "VIN must be at least 19 characters",
  }),
  ward: Joi.string().trim().required(),
  village: Joi.string().trim().required(),
  hasEducation: Joi.string()
    .valid(...Object.values(hasEducationEnum))
    .required(),
  highestQualification: Joi.string()
    .valid(...Object.values(highestQualificationEnum))
    .when("hasEducation", {
      is: "yes",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    }),
  discipline: Joi.string()
    .trim()
    .when("hasEducation", {
      is: "yes",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    }),
  otherDiscipline: Joi.string()
    .trim()
    .max(200)
    .when("discipline", {
      is: "Other",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    }),
  certificate: Joi.any().optional(),
  vocationalSkill: Joi.string().trim().required(),
  otherSkill: Joi.string()
    .trim()
    .max(200)
    .when("vocationalSkill", {
      is: "Other",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    }),
  skillAcquisition: Joi.string().trim().optional().allow("", null),
  otherSkillAcquisition: Joi.string()
    .trim()
    .max(200)
    .when("skillAcquisition", {
      is: "Other",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    }),
  villageHeadName: Joi.string().trim().min(2).max(100).required(),
  villageHeadPhone: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base": "Enter a valid phone number (11 digits starting with 0)",
  }),
  certificateOfOrigin: Joi.any().optional(),
}).unknown(true);

router.get("/me", getMe);
router.get("/application", getApplication);
router.get("/registration-draft", getDraft);
router.put("/registration-draft", validate(saveDraftSchema), saveDraft);
router.delete("/registration-draft", deleteDraft);
router.post(
  "/submit-application",
  limiter,
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "certificateOfOrigin", maxCount: 1 },
  ]),
  validate(submitApplicationSchema),
  submitApplication,
);

export default router;
