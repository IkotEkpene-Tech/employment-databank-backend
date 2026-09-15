import express from "express";
import Joi from "joi";
import validate from "../configurations/validate";
import authenticate from "../configurations/authenticate";
import { limiter } from "../configurations/rate-limit";

import register from "./controllers/register";
import verifyEmailOtp from "./controllers/verify-email-otp";
import resendEmailOtp from "./controllers/resend-email-otp";
import login from "./controllers/login";
import loginRequestOtp from "./controllers/login-request-otp";
import loginVerifyOtp from "./controllers/login-verify-otp";
import forgotPassword from "./controllers/forgot-password";
import resetPassword from "./controllers/reset-password";
import me from "./controllers/me";
import logout from "./controllers/logout";

const router = express.Router();

const phoneRegex = /^0[0-9]{10}$/;
const emailSchema = Joi.string().email().trim().lowercase().required();
const otpSchema = Joi.string().trim().length(6).pattern(/^\d{6}$/).required().messages({
  "string.length": "Code must be exactly 6 digits",
  "string.pattern.base": "Code must be exactly 6 digits",
});
const passwordSchema = Joi.string().min(8).max(128).required().messages({
  "string.min": "Password must be at least 8 characters",
  "any.required": "Password is required",
});

const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  phone: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base":
      "Enter a valid phone number (11 digits starting with 0)",
  }),
});

const verifyEmailOtpSchema = Joi.object({
  email: emailSchema,
  otp: otpSchema,
});

const resendEmailOtpSchema = Joi.object({
  email: emailSchema,
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
});

const loginRequestOtpSchema = Joi.object({
  email: emailSchema,
});

const loginVerifyOtpSchema = Joi.object({
  email: emailSchema,
  otp: otpSchema,
});

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: passwordSchema,
});

router.post("/register", limiter, validate(registerSchema), register);
router.post(
  "/verify-email-otp",
  limiter,
  validate(verifyEmailOtpSchema),
  verifyEmailOtp,
);
router.post(
  "/resend-email-otp",
  limiter,
  validate(resendEmailOtpSchema),
  resendEmailOtp,
);
router.post("/login", limiter, validate(loginSchema), login);
router.post(
  "/login/request-otp",
  limiter,
  validate(loginRequestOtpSchema),
  loginRequestOtp,
);
router.post(
  "/login/verify-otp",
  limiter,
  validate(loginVerifyOtpSchema),
  loginVerifyOtp,
);
router.post(
  "/forgot-password",
  limiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
