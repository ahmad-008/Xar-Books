import { handle } from "@/server/utils/http";
import { register } from "@/server/controllers/auth.controller";

export const POST = handle(register);
