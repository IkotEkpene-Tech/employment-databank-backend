import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import { forgotPasswordService } from "../services/password-reset.service";

const forgotPassword = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { email } = request.body;

    await forgotPasswordService(email);

    return response.status(204).send();
  },
);

export default forgotPassword;
