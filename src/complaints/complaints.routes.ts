import express from "express";
import Joi from "joi";
import multer from "multer";
import validate from "../configurations/validate";
import submitComplaint from "./controllers/submit-complaint";

const router = express.Router();

const noFileUpload = multer().none();

const phoneRegex = /^0[0-9]{10}$/;
const fullNameRegex = /^\s*\S+\s+\S+.*$/;

const complaintValidationSchema = Joi.object({
  nin: Joi.string()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
      "string.pattern.base": "NIN must be exactly 11 digits",
      "any.required": "NIN is required",
    }),

  fullName: Joi.string()
    .trim()
    .min(5)
    .max(150)
    .pattern(fullNameRegex)
    .required()
    .messages({
      "string.min": "Full name must be at least 5 characters",
      "string.max": "Full name must not exceed 150 characters",
      "string.pattern.base": "Please enter at least first name and surname",
      "any.required": "Full name is required",
    }),

  phoneNumber: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base":
      "Enter a valid phone number (11 digits starting with 0)",
    "any.required": "Phone number is required",
  }),

  errorEncountered: Joi.string().trim().max(255).optional().allow("", null),

  description: Joi.string().trim().min(10).max(5000).required().messages({
    "string.min": "Description must be at least 10 characters",
    "any.required": "Description is required",
  }),

  currentPage: Joi.string().uri().required().messages({
    "string.uri": "Current page must be a valid URL",
    "any.required": "Current page is required",
  }),

  submittedAt: Joi.date().iso().optional(),
});

router.post(
  "/submit",
  noFileUpload,
  validate(complaintValidationSchema),
  submitComplaint,
);

export default router;
