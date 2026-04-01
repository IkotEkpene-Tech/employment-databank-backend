import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const inputValidator = (schema: Joi.Schema): any => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const { error, value } = schema.validate(request.body, {
        abortEarly: false, // Show all errors, not just the first one
        stripUnknown: true, // Remove unknown fields
      });

      console.log("Validation result:", { value });

      if (error) {
        const errorMessages = error.details.map((detail) =>
          detail.message.replace(/["\\]/g, ""),
        );
        throw new Error(`${errorMessages[0]}`);
      }

      request.body = value;
      return next();
    } catch (err: any) {
      console.error("Validation error:", err);
      return response.status(500).json({
        status: "error",
        message: "Internal Server Error during validation",
      });
    }
  };
};

const wardSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "Ward name must be a string",
    "string.min": "Ward name must be at least 2 characters",
    "string.max": "Ward name must not exceed 100 characters",
    "any.required": "Ward name is required",
  }),
  code: Joi.string().trim().uppercase().min(2).max(20).required().messages({
    "string.base": "Ward code must be a string",
    "string.min": "Ward code must be at least 2 characters",
    "string.max": "Ward code must not exceed 20 characters",
    "any.required": "Ward code is required",
  }),
  lga: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "LGA must be a string",
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
    "string.base": "Ward ID must be a string",
    "string.uuid": "Ward ID must be a valid UUID",
    "any.required": "Ward ID is required",
  }),
  villages: Joi.array()
    .items(
      Joi.string().trim().min(1).max(255).required().messages({
        "string.base": "Village name must be a string",
        "string.min": "Village name must be at least 1 character",
        "string.max": "Village name must not exceed 255 characters",
        "any.required": "Village name is required",
      }),
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.base": "Villages must be an array",
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
      "array.base": "Data must be an array",
      "array.min": "At least one ward entry must be provided",
      "array.max": "Cannot process more than 50 wards at once",
      "any.required": "Data payload is required",
    }),
});

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
  postBsc = "pst-bsc",
}

enum genderEnum {
  male = "male",
  female = "female",
}

const applicantValidationSchema = Joi.object({
  // ── Identity fields (from NIN verification) ──────────────────────────────
  nin: Joi.string().trim().length(11).required().messages({
    "string.base": "NIN must be a string",
    "string.empty": "NIN is required",
    "string.length": "NIN must be exactly 11 digits",
    "any.required": "NIN is required",
  }),

  vin: Joi.string().trim().min(19).required().messages({
    "string.base": "VIN must be a string",
    "string.empty": "Voter Identification Number (VIN) is required",
    "string.min": "VIN must be at least 19 characters",
    "any.required": "Voter Identification Number (VIN) is required",
  }),

  gender: Joi.string()
    .valid(...Object.values(genderEnum))
    .required()
    .messages({
      "string.base": "Gender must be a string",
      "string.empty": "Please select your gender",
      "any.only": "Gender must be either 'male' or 'female'",
      "any.required": "Please select your gender",
    }),

  // dateOfBirth is sent as a string from the frontend (e.g. "14 Mar 1995")
  dateOfBirth: Joi.string().trim().required().messages({
    "string.base": "Date of birth must be a string",
    "string.empty": "Date of birth is required",
    "any.required": "Date of birth is required",
  }),

  // ── Personal info ─────────────────────────────────────────────────────────
  surname: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "Surname must be a string",
    "string.empty": "Surname is required",
    "string.min": "Surname must be at least 2 characters",
    "string.max": "Surname must not exceed 100 characters",
    "any.required": "Surname is required",
  }),

  firstName: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "First name must be a string",
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name must not exceed 100 characters",
    "any.required": "First name is required",
  }),

  otherName: Joi.string().trim().max(100).optional().allow("", null).messages({
    "string.base": "Other name must be a string",
    "string.max": "Other name must not exceed 100 characters",
  }),

  phoneNumber: Joi.string().pattern(phoneRegex).required().messages({
    "string.base": "Phone number must be a string",
    "string.empty": "Phone number is required",
    "string.pattern.base": "Enter a valid phone number (11 digits starting with 0)",
    "any.required": "Phone number is required",
  }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow("", null)
    .messages({
      "string.base": "Email must be a string",
      "string.email": "Enter a valid email address",
    }),

  // ── Location ──────────────────────────────────────────────────────────────
  ward: Joi.string().trim().required().messages({
    "string.base": "Ward must be a string",
    "string.empty": "Please select your ward",
    "any.required": "Please select your ward",
  }),

  village: Joi.string().trim().required().messages({
    "string.base": "Village must be a string",
    "string.empty": "Please select your village",
    "any.required": "Please select your village",
  }),

  // ── Education ─────────────────────────────────────────────────────────────
  hasEducation: Joi.string()
    .valid(...Object.values(hasEducationEnum))
    .required()
    .messages({
      "string.base": "Education status must be a string",
      "string.empty": "Please indicate your education status",
      "any.only": "Education status must be either 'yes' or 'no'",
      "any.required": "Please indicate your education status",
    }),

  highestQualification: Joi.string()
    .valid(...Object.values(highestQualificationEnum))
    .when("hasEducation", {
      is: "yes",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    })
    .messages({
      "string.base": "Highest qualification must be a string",
      "string.empty": "Please select your highest qualification",
      "any.only": "Invalid qualification selected",
      "any.required": "Please select your highest qualification",
    }),

  // certificate file is handled by multer — not in body
  certificate: Joi.any().optional(),

  // ── Skills ────────────────────────────────────────────────────────────────
  vocationalSkill: Joi.string().trim().required().messages({
    "string.base": "Skill must be a string",
    "string.empty": "Please select a skill",
    "any.required": "Please select a skill",
  }),

  otherSkill: Joi.string()
    .trim()
    .max(200)
    .when("vocationalSkill", {
      is: "Other",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    })
    .messages({
      "string.base": "Other skill must be a string",
      "string.empty": "Please specify your skill",
      "string.max": "Other skill must not exceed 200 characters",
      "any.required": "Please specify your skill",
    }),

  skillAcquisition: Joi.string().trim().optional().allow("", null).messages({
    "string.base": "Skill acquisition must be a string",
    "string.max": "Skill acquisition must not exceed 200 characters",
  }),

  otherSkillAcquisition: Joi.string()
    .trim()
    .max(200)
    .when("skillAcquisition", {
      is: "Other",
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    })
    .messages({
      "string.base": "Other skill acquisition must be a string",
      "string.empty": "Please specify the skill you want to learn",
      "string.max": "Must not exceed 200 characters",
      "any.required": "Please specify the skill you want to learn",
    }),

  // ── Village authority ─────────────────────────────────────────────────────
  villageHeadName: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "Village head name must be a string",
    "string.empty": "Village head name is required",
    "string.min": "Village head name must be at least 2 characters",
    "string.max": "Village head name must not exceed 100 characters",
    "any.required": "Village head name is required",
  }),

  villageHeadPhone: Joi.string().pattern(phoneRegex).required().messages({
    "string.base": "Village head phone number must be a string",
    "string.empty": "Village head phone number is required",
    "string.pattern.base": "Enter a valid phone number (11 digits starting with 0)",
    "any.required": "Village head phone number is required",
  }),

  // certificateOfOrigin file is handled by multer — not in body
  certificateOfOrigin: Joi.any().optional(),
}).strict();

export {
  inputValidator,
  wardSchema,
  addWardValidation,
  addVillagesToWardValidation,
  applicantValidationSchema,
};