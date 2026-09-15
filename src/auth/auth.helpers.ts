import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "./User";

const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/** Generates a random, non-sequential 8-character alphanumeric access code. */
export const generateAccessCode = (length = 8): string => {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ACCESS_CODE_CHARS[(bytes.at(i) ?? 0) % ACCESS_CODE_CHARS.length];
  }
  return code;
};

/** Generates a high-entropy, URL-safe token for emailed links (resubmit-nin, password reset). */
export const generateUrlToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const hashSecret = async (value: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(value, salt);
};

export const compareSecret = async (
  value: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(value, hash);
};

export const maskNin = (nin: string): string => {
  return `${"*".repeat(Math.max(nin.length - 4, 0))}${nin.slice(-4)}`;
};

/** Generates a numeric one-time password (email verification, login OTP). */
export const generateNumericOtp = (length = 6): string => {
  const max = 10 ** length;
  const otp = crypto.randomInt(0, max).toString();
  return otp.padStart(length, "0");
};

export const serializeUser = (user: User) => {
  const json: any = user.toJSON();
  return {
    id: json.id,
    email: json.email,
    phone: json.phoneNumber,
    emailVerified: json.emailVerified,
    applicationStatus: json.applicationStatus,
    firstName: json.firstName ?? undefined,
    surname: json.surname ?? undefined,
    otherName: json.otherName ?? undefined,
    dob: json.dateOfBirth ?? undefined,
    gender: json.gender ?? undefined,
    ninLast4: json.nin ? String(json.nin).slice(-4) : undefined,
  };
};
