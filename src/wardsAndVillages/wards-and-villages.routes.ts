import express from "express";
import Joi from "joi";
import validate from "../configurations/validate";
import getAllWards from "./controllers/get-all-wards";
import getAllWardsVillages from "./controllers/get-all-wards-villages";
import addWard from "./controllers/add-ward";
import addVillagesToWard from "./controllers/add-villages-to-ward";

const router = express.Router();

const wardSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Ward name must be at least 2 characters",
    "string.max": "Ward name must not exceed 100 characters",
    "any.required": "Ward name is required",
  }),
  code: Joi.string().trim().uppercase().min(2).max(20).required().messages({
    "string.min": "Ward code must be at least 2 characters",
    "string.max": "Ward code must not exceed 20 characters",
    "any.required": "Ward code is required",
  }),
  lga: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "LGA must be at least 2 characters",
    "string.max": "LGA must not exceed 100 characters",
    "any.required": "LGA is required",
  }),
});

const addWardValidation = Joi.alternatives()
  .try(
    wardSchema,
    Joi.array().items(wardSchema).min(1).max(50).messages({
      "array.min": "At least one ward must be provided",
      "array.max": "Cannot add more than 50 wards at once",
    }),
  )
  .required()
  .messages({
    "alternatives.match": "Payload must be a ward object or an array of wards",
  });

const villageEntrySchema = Joi.object({
  wardId: Joi.string().uuid().required().messages({
    "string.uuid": "Ward ID must be a valid UUID",
    "any.required": "Ward ID is required",
  }),
  villages: Joi.array()
    .items(
      Joi.string().trim().min(1).max(255).required().messages({
        "string.min": "Village name must be at least 1 character",
        "string.max": "Village name must not exceed 255 characters",
        "any.required": "Village name is required",
      }),
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one village must be provided",
      "array.max": "Cannot add more than 100 villages per ward in a single request",
      "any.required": "Villages array is required",
    }),
});

const addVillagesToWardValidation = Joi.object({
  data: Joi.array()
    .items(villageEntrySchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one ward entry must be provided",
      "array.max": "Cannot process more than 50 wards at once",
      "any.required": "Data payload is required",
    }),
});

router.get("/all-wards", getAllWards);
router.get("/all-wards-villages", getAllWardsVillages);
router.post("/add-wards", validate(addWardValidation), addWard);
router.post(
  "/add-ward-villages",
  validate(addVillagesToWardValidation),
  addVillagesToWard,
);

export default router;
