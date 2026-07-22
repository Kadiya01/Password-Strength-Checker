import { Router } from "express";
import { userController } from "@/controllers/user.controller";
import { validate } from "@/middleware/validate.middleware";
import { authenticate } from "@/middleware/authenticate.middleware";
import { updateProfileSchema } from "@/validators/user.validator";

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get("/profile", authenticate, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [User]
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile information. Partial updates are supported.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 example: John
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Email or username already in use
 */
router.put("/profile", authenticate, validate(updateProfileSchema), userController.updateProfile);

export default router;
