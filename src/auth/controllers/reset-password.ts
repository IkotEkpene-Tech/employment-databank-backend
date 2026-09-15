import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import { resetPasswordService } from "../services/password-reset.service";

const resetPassword = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { token, password } = request.body;

    await resetPasswordService(token, password);

    return response.status(204).send();
  },
);

export default resetPassword;
