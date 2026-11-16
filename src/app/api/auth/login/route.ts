import { handle } from "@/server/utils/http";
import { login } from "@/server/controllers/auth.controller";

export const POST = handle(login);
