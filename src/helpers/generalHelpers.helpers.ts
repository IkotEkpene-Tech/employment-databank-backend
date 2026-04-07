import brcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

function generateNumericOtp(length: number = 6): string {
  const max = 10 ** length;
  const otp = crypto.randomInt(0, max).toString();
  return otp.padStart(length, "0");
}

const hashData = async (data: string): Promise<string> => {
  const salt = await brcrypt.genSalt(5);
  const dataHash = await brcrypt.hash(data, salt);
  return dataHash;
};

function generateAlphaNumericOtp(length: number = 6): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let otp = "";

  for (let i = 0; i < length; i++) {
    const byte = bytes.at(i) ?? 0;
    otp += chars[byte % chars.length];
  }

  return otp;
}

const validatePassword = async (
  password: string,
  userPassword: string,
): Promise<boolean> => {
  return await brcrypt.compare(password, userPassword);
};

const generateTokens = (
  payload: Record<string, any>,
  expiresIn: any = "15h",
): string => {
  return jwt.sign(payload, `${process.env.APP_SECRET}`, {
    expiresIn: expiresIn,
  });
};

export default {
  generateNumericOtp,
  generateAlphaNumericOtp,
  hashData,
  validatePassword,
  generateTokens,
};
