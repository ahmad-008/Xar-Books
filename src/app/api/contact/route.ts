import { handle } from "@/server/utils/http";
import { sendContactMessage } from "@/server/controllers/contact.controller";

export const POST = handle(sendContactMessage);
