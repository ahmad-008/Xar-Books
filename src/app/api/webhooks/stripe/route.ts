import { handle } from "@/server/utils/http";
import { stripeWebhook } from "@/server/controllers/webhook.controller";

export const POST = handle(stripeWebhook);
