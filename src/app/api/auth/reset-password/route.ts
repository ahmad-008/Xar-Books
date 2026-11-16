import { handle } from "@/server/utils/http";
import { resetPassword } from "@/server/controllers/auth.controller";

export const POST = handle(resetPassword);
