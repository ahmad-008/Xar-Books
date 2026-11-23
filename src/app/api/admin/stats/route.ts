import { handle } from "@/server/utils/http";
import {getStats} from "@/server/controllers/admin.controller";

export const GET = handle(getStats);