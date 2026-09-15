import jwt from "jsonwebtoken";
import configurations from ".";

export interface TokenPayload {
  sub: string;
  purpose?: "set-password";
  [key: string]: any;
}

const getSecret = (): string => {
  if (!configurations.APP_SECRET) {
    throw new Error("APP_SECRET is not configured");
  }
  return configurations.APP_SECRET;
};

const signToken = (payload: TokenPayload, expiresIn: string | number): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: expiresIn as any });
};

const verifyToken = <T extends object = TokenPayload>(token: string): T => {
  return jwt.verify(token, getSecret()) as T;
};

export default {
  signToken,
  verifyToken,
};
