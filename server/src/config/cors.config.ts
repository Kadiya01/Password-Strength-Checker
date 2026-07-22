import { CorsOptions } from "cors";
import { config } from "./index";

export const corsConfig: CorsOptions = {
  origin: config.NODE_ENV === "production" ? config.CLIENT_URL : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};
