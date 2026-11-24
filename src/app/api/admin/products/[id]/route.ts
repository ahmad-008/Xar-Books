import {handle}from "@/server/utils/http";
import { removeProduct } from "@/server/controllers/admin.controller";

export const DELETE = handle(removeProduct);