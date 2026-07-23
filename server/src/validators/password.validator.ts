import { body } from "express-validator";

export const checkStrengthSchema = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ max: 128 })
    .withMessage("Password must be at most 128 characters"),
];

export const generateSchema = [
  body("length")
    .optional()
    .isInt({ min: 8, max: 64 })
    .withMessage("Length must be between 8 and 64"),
  body("includeUppercase")
    .optional()
    .isBoolean()
    .withMessage("includeUppercase must be a boolean")
    .toBoolean(),
  body("includeLowercase")
    .optional()
    .isBoolean()
    .withMessage("includeLowercase must be a boolean")
    .toBoolean(),
  body("includeNumbers")
    .optional()
    .isBoolean()
    .withMessage("includeNumbers must be a boolean")
    .toBoolean(),
  body("includeSymbols")
    .optional()
    .isBoolean()
    .withMessage("includeSymbols must be a boolean")
    .toBoolean(),
  body("excludeAmbiguous")
    .optional()
    .isBoolean()
    .withMessage("excludeAmbiguous must be a boolean")
    .toBoolean(),
];

export const generatePassphraseSchema = [
  body("words")
    .optional()
    .isInt({ min: 4, max: 8 })
    .withMessage("Word count must be between 4 and 8"),
  body("separator")
    .optional()
    .isString()
    .withMessage("Separator must be a string")
    .isIn([" ", "-", "_", "number", "symbol"])
    .withMessage("Separator must be one of: ' ' (space), '-' (hyphen), '_' (underscore), 'number', 'symbol'"),
];
