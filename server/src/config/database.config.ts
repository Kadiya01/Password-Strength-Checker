import { PrismaClient } from "@prisma/client";
import { config } from "./index";

const prisma = new PrismaClient({
  log: config.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
