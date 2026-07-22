import { Router } from "express";
import authRoutes from "./auth.routes";
import passwordRoutes from "./password.routes";
import dashboardRoutes from "./dashboard.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/password", passwordRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);

export { router as routes };
