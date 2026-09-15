import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import verifyEmailOtpService from "../services/verify-email-otp.service";

const verifyEmailOtp = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { email, otp } = request.body;

    await verifyEmailOtpService(email, otp);

    return response.status(204).send();
  },
);

export default verifyEmailOtp;
