import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import { requestLoginOtpService } from "../services/login-otp.service";

const loginRequestOtp = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { email } = request.body;

    await requestLoginOtpService(email);

    return response.status(204).send();
  },
);

export default loginRequestOtp;
