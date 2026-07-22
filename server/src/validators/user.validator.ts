import { body } from "express-validator";

export const updateProfileSchema = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must be at most 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be at most 50 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 255 })
    .withMessage("Email must be at most 255 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
];
