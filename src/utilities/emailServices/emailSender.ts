import configurations from "../../configurations";
// import { zeptoClient } from "./zeptoConfig";
import { Resend } from "resend";

const resend = new Resend(configurations.RESEND_API_KEY!);

// export interface EmailPayload {
//   to: { email: string; name: string };
//   subject: string;
//   htmlbody: string;
//   textbody?: string;
// }

export async function sendEmail(payload: any): Promise<void> {
  // console.log('clear', payload)
 const { data, error } = await resend.emails.send({
    from: configurations.MAIL_FROM_ADDRESS,
    to: payload.to,
    subject: payload.subject,
    html: payload.htmlbody || payload.htmlBody,
  });
  // console.log('t', data, error)
  if(error){
    console.log('Email Error====>', error)
  }
}
