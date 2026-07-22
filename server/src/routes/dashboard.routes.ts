import { Router } from "express";
import { dashboardController } from "@/controllers/dashboard.controller";
import { authenticate } from "@/middleware/authenticate.middleware";

const router = Router();

/**
 * @swagger
 * /dashboard/statistics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     description: Retrieve aggregated statistics including password check counts, strength distribution, recent activity, and security score.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardStatistics'
 *       401:
 *         description: Authentication required
 */
router.get("/statistics", authenticate, dashboardController.getStatistics);

export default router;
