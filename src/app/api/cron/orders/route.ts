import {handle} from "@/server/utils/http";
import { runOrderJobs } from "@/server/controllers/cron.controller";

export const GET = handle(runOrderJobs);