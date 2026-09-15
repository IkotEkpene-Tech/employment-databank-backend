import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const validate = (schema: Joi.Schema): any => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> => {
    const { error, value } = schema.validate(request.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) =>
        detail.message.replace(/["\\]/g, ""),
      );
      return response.status(400).json({
        status: "error",
        message: errorMessages[0],
      });
    }

    request.body = value;
    return next();
  };
};

export default validate;
