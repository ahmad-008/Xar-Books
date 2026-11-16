import { handle } from "@/server/utils/http";
import { logout } from "@/server/controllers/auth.controller";

export const POST = handle(logout);
