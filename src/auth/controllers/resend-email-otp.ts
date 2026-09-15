import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import resendEmailOtpService from "../services/resend-email-otp.service";

const resendEmailOtp = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const { email } = request.body;

    await resendEmailOtpService(email);

    return response.status(204).send();
  },
);

export default resendEmailOtp;
