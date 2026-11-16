import { handle } from "@/server/utils/http";
import { getMe } from "@/server/controllers/auth.controller";

export const GET = handle(getMe);
