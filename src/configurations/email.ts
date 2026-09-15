import configurations from ".";
import { Resend } from "resend";

const resend = new Resend(configurations.RESEND_API_KEY!);

export async function sendEmail(payload: any): Promise<void> {
  const { error } = await resend.emails.send({
    from: configurations.MAIL_FROM_ADDRESS,
    to: payload.to,
    subject: payload.subject,
    html: payload.htmlbody || payload.htmlBody,
  });
  if (error) {
    console.log("Email Error====>", error);
  }
}
