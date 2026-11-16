import { handle } from "@/server/utils/http";
import { resendVerification } from "@/server/controllers/auth.controller";

export const POST = handle(resendVerification);
