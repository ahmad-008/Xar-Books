import { handle } from "@/server/utils/http";
import { verifyEmail } from "@/server/controllers/auth.controller";

export const POST = handle(verifyEmail);
