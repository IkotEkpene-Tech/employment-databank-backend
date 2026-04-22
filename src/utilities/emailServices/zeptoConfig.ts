import { SendMailClient } from "zeptomail";
import configurations from "../../configurations";

const url = "api.zeptomail.com/";
const token = configurations.ZEPTOMAIL_TOKEN!;

export const zeptoClient = new SendMailClient({ url, token });