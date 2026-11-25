import { handle } from "@/server/utils/http";
import { getUsers } from "@/server/controllers/admin.controller";

export const GET = handle(getUsers);