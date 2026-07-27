import { CorsOptions } from "cors";
import { config } from "./index";

const allowedOrigins = config.NODE_ENV === "production"
  ? [config.CLIENT_URL]
  : [config.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"];

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  exposedHeaders: ["Set-Cookie", "X-Request-ID"],
  maxAge: 86400,
};
