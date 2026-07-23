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

/**
 * @swagger
 * /dashboard/security-score:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get security score
 *     description: Retrieve detailed security score with factors and recommendations.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security score retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SecurityScore'
 *       401:
 *         description: Authentication required
 */
router.get("/security-score", authenticate, dashboardController.getSecurityScore);

/**
 * @swagger
 * /dashboard/login-history:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get login history
 *     description: Retrieve paginated login history with optional date filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from date (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter to date (ISO 8601)
 *     responses:
 *       200:
 *         description: Login history retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/LoginActivity'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Authentication required
 */
router.get("/login-history", authenticate, dashboardController.getLoginHistory);

/**
 * @swagger
 * /dashboard/security-events:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get security events
 *     description: Retrieve paginated security events with optional event type filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *     responses:
 *       200:
 *         description: Security events retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SecurityEventRecord'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Authentication required
 */
router.get("/security-events", authenticate, dashboardController.getSecurityEvents);

/**
 * @swagger
 * /dashboard/activity-timeline:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get activity timeline
 *     description: Retrieve combined activity timeline from logins, password checks, and security events.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [login, password_check, security_event]
 *         description: Filter by activity type
 *     responses:
 *       200:
 *         description: Activity timeline retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ActivityTimelineItem'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Authentication required
 */
router.get("/activity-timeline", authenticate, dashboardController.getActivityTimeline);

/**
 * @swagger
 * /dashboard/password-analytics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get password analytics
 *     description: Retrieve detailed password analytics including trends and patterns.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password analytics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PasswordAnalytics'
 *       401:
 *         description: Authentication required
 */
router.get("/password-analytics", authenticate, dashboardController.getPasswordAnalytics);

/**
 * @swagger
 * /dashboard/chart-data:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get chart data
 *     description: Retrieve chart-ready data for visualization including strength distribution and activity heatmap.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chart data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PasswordChart'
 *       401:
 *         description: Authentication required
 */
router.get("/chart-data", authenticate, dashboardController.getChartData);

/**
 * @swagger
 * /dashboard/generation-stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get password generation stats
 *     description: Retrieve statistics about generated passwords.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password generation stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PasswordGenerationStats'
 *       401:
 *         description: Authentication required
 */
router.get("/generation-stats", authenticate, dashboardController.getPasswordGenerationStats);

/**
 * @swagger
 * /dashboard/export:
 *   get:
 *     tags: [Dashboard]
 *     summary: Export data
 *     description: Export dashboard data as CSV or JSON file.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [password_logs, login_history, security_events]
 *           default: password_logs
 *         description: Type of data to export
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from date (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter to date (ISO 8601)
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: string
 *       401:
 *         description: Authentication required
 */
router.get("/export", authenticate, dashboardController.exportData);

export default router;
