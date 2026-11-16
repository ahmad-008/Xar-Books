import { handle } from "@/server/utils/http";
import { forgotPassword } from "@/server/controllers/auth.controller";

export const POST = handle(forgotPassword);
