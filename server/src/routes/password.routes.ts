import { Router } from "express";
import { passwordController } from "@/controllers/password.controller";
import { validate } from "@/middleware/validate.middleware";
import { authenticate } from "@/middleware/authenticate.middleware";
import { passwordCheckRateLimiter, passwordGenerateRateLimiter } from "@/middleware/rateLimit.middleware";
import { checkStrengthSchema, generateSchema, generatePassphraseSchema } from "@/validators/password.validator";

const router = Router();

/**
 * @swagger
 * /password/check-strength:
 *   post:
 *     tags: [Password]
 *     summary: Check password strength
 *     description: Analyze a password and return its strength score, label, details, and recommendations. If authenticated, the result is logged.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckStrengthRequest'
 *     responses:
 *       200:
 *         description: Password strength analyzed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StrengthResult'
 *       400:
 *         description: Validation failed
 *       429:
 *         description: Too many requests
 */
router.post("/check-strength", passwordCheckRateLimiter, validate(checkStrengthSchema), passwordController.checkStrength);

/**
 * @swagger
 * /password/generate:
 *   post:
 *     tags: [Password]
 *     summary: Generate a secure password
 *     description: Generate a cryptographically secure password with customizable character sets, length, and ambiguous character exclusion. Each generated password is validated against the Password Intelligence Engine and must achieve a minimum "Strong" rating.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateRequest'
 *     responses:
 *       200:
 *         description: Password generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GeneratePasswordResponse'
 *       400:
 *         description: Validation failed or invalid policy
 *       422:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post("/generate", passwordGenerateRateLimiter, validate(generateSchema), passwordController.generate);

/**
 * @swagger
 * /password/generate-passphrase:
 *   post:
 *     tags: [Password]
 *     summary: Generate a secure passphrase
 *     description: Generate a cryptographically secure passphrase using randomly selected words from a curated word list. Supports configurable word count (4-8) and separator options. Uses crypto.randomInt() for word selection.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePassphraseRequest'
 *     responses:
 *       200:
 *         description: Passphrase generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GeneratePassphraseResponse'
 *       400:
 *         description: Validation failed or invalid policy
 *       422:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post(
  "/generate-passphrase",
  passwordGenerateRateLimiter,
  validate(generatePassphraseSchema),
  passwordController.generatePassphrase
);

/**
 * @swagger
 * /password/history:
 *   get:
 *     tags: [Password]
 *     summary: Get password check history
 *     description: Retrieve paginated history of password strength checks for the authenticated user.
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
 *     responses:
 *       200:
 *         description: Password history retrieved
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
 *                             type: object
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Authentication required
 */
router.get("/history", authenticate, passwordController.getHistory);

export default router;
