import { handle } from "@/server/utils/http";
import { updateAvatar } from "@/server/controllers/user.controller";

export const POST = handle(updateAvatar);
