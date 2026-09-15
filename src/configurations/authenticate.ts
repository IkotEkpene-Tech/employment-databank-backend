import { Request, Response, NextFunction } from "express";
import jwtUtilities, { TokenPayload } from "./jwt";
import errorUtilities from "./error-handler";
import { StatusCodes } from "./statusCodes";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const authenticate = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response, next: NextFunction) => {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw errorUtilities.createError(
        "Please login again",
        StatusCodes.UNAUTHORIZED,
      );
    }

    const token = authorizationHeader.split(" ")[1];

    if (!token) {
      throw errorUtilities.createError(
        "Please login again",
        StatusCodes.UNAUTHORIZED,
      );
    }

    let payload: TokenPayload;
    try {
      payload = jwtUtilities.verifyToken(token);
    } catch (error) {
      throw errorUtilities.createError(
        "Session expired or invalid, please login again",
        StatusCodes.UNAUTHORIZED,
      );
    }

    if (!payload.sub || payload.purpose) {
      // reject temp/purpose-scoped tokens (e.g. the set-password token) here
      throw errorUtilities.createError(
        "Session expired or invalid, please login again",
        StatusCodes.UNAUTHORIZED,
      );
    }

    request.user = { id: payload.sub };

    return next();
  },
);

export default authenticate;
