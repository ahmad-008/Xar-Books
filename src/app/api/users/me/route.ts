import { updateProfile } from "@/server/controllers/user.controller";
import {handle} from "@/server/utils/http";


export const PATCH = handle(updateProfile);