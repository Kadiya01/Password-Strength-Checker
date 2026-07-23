import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Password Strength Checker API",
      version: "1.0.0",
      description:
        "Enterprise-grade Password Strength Checker with Secure Password Generation and Authentication System. " +
        "Implements NIST SP 800-63B standards and OWASP credential handling guidelines.",
      contact: {
        name: "API Support",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "username", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            username: { type: "string", minLength: 3, maxLength: 30, example: "johndoe" },
            password: { type: "string", minLength: 8, maxLength: 128, example: "SecureP@ss123" },
            firstName: { type: "string", maxLength: 50, example: "John" },
            lastName: { type: "string", maxLength: 50, example: "Doe" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "SecureP@ss123" },
            rememberMe: { type: "boolean", default: false },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                username: { type: "string" },
                firstName: { type: "string", nullable: true },
                lastName: { type: "string", nullable: true },
                role: { type: "string", enum: ["USER", "ADMIN"] },
              },
            },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        CheckStrengthRequest: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string", example: "MyP@ssw0rd!" },
          },
        },
        StrengthResult: {
          type: "object",
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100, example: 92 },
            strength: { type: "string", enum: ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"], example: "Strong" },
            entropy: { type: "number", example: 78.3 },
            crackTime: { type: "string", example: "Estimated 540 years" },
            passphrase: { type: "boolean", example: false },
            checks: {
              type: "object",
              properties: {
                length: { type: "boolean" },
                uppercase: { type: "boolean" },
                lowercase: { type: "boolean" },
                numbers: { type: "boolean" },
                symbols: { type: "boolean" },
                dictionary: { type: "boolean" },
                keyboardPattern: { type: "boolean" },
                sequence: { type: "boolean" },
                repeated: { type: "boolean" },
              },
            },
            suggestions: { type: "array", items: { type: "string" } },
          },
        },
        GenerateRequest: {
          type: "object",
          properties: {
            length: { type: "integer", minimum: 8, maximum: 128, default: 16 },
            includeUppercase: { type: "boolean", default: true },
            includeLowercase: { type: "boolean", default: true },
            includeNumbers: { type: "boolean", default: true },
            includeSymbols: { type: "boolean", default: true },
            excludeAmbiguous: { type: "boolean", default: false },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            username: { type: "string" },
            firstName: { type: "string", nullable: true },
            lastName: { type: "string", nullable: true },
            role: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        DashboardStatistics: {
          type: "object",
          properties: {
            totalPasswordsChecked: { type: "integer" },
            averageStrength: { type: "number" },
            strengthDistribution: {
              type: "object",
              properties: {
                weak: { type: "integer" },
                fair: { type: "integer" },
                strong: { type: "integer" },
                veryStrong: { type: "integer" },
              },
            },
            recentActivity: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  ipAddress: { type: "string" },
                  success: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
            securityScore: { type: "number" },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: { type: "string", example: "abc123..." },
            newPassword: { type: "string", minLength: 8, example: "NewSecureP@ss1" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export default swaggerOptions;
