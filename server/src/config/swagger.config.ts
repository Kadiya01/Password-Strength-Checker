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
            length: {
              type: "integer",
              minimum: 8,
              maximum: 64,
              default: 16,
              description: "Password length (8-64 characters)",
            },
            includeUppercase: { type: "boolean", default: true, description: "Include uppercase letters (A-Z)" },
            includeLowercase: { type: "boolean", default: true, description: "Include lowercase letters (a-z)" },
            includeNumbers: { type: "boolean", default: true, description: "Include numbers (0-9)" },
            includeSymbols: { type: "boolean", default: true, description: "Include symbols (!@#$%^&*)" },
            excludeAmbiguous: { type: "boolean", default: false, description: "Exclude ambiguous characters (O, 0, I, l, 1, |)" },
          },
        },
        GeneratePasswordResponse: {
          type: "object",
          properties: {
            password: { type: "string", example: "F@9jLm#2PwXk7nQ$" },
            entropy: { type: "number", example: 126.4, description: "Shannon entropy in bits" },
            strength: { type: "string", enum: ["Strong", "Excellent"], example: "Excellent", description: "Password strength label (minimum Strong)" },
            crackTime: { type: "string", example: "Estimated Millions of years", description: "Estimated time to crack" },
            score: { type: "integer", minimum: 0, maximum: 100, example: 98, description: "Password strength score (0-100)" },
            strengthResult: {
              $ref: "#/components/schemas/StrengthResult",
              description: "Full strength analysis details",
            },
          },
        },
        GeneratePassphraseRequest: {
          type: "object",
          properties: {
            words: {
              type: "integer",
              minimum: 4,
              maximum: 8,
              default: 5,
              description: "Number of words in the passphrase (4-8)",
            },
            separator: {
              type: "string",
              enum: [" ", "-", "_", "number", "symbol"],
              default: "-",
              description: "Word separator: ' ' (space), '-' (hyphen), '_' (underscore), 'number' (random digit), 'symbol' (random symbol)",
            },
          },
        },
        GeneratePassphraseResponse: {
          type: "object",
          properties: {
            passphrase: { type: "string", example: "correct-horse-battery-staple-lake" },
            entropy: { type: "number", example: 92.8, description: "Shannon entropy in bits" },
            strength: { type: "string", example: "Strong", description: "Passphrase strength label" },
            crackTime: { type: "string", example: "Estimated Millions of years", description: "Estimated time to crack" },
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
              $ref: "#/components/schemas/StrengthDistribution",
            },
            recentActivity: {
              type: "array",
              items: {
                $ref: "#/components/schemas/LoginActivity",
              },
            },
            securityScore: { type: "number" },
          },
        },
        StrengthDistribution: {
          type: "object",
          properties: {
            weak: { type: "integer" },
            fair: { type: "integer" },
            strong: { type: "integer" },
            veryStrong: { type: "integer" },
          },
        },
        LoginActivity: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            ipAddress: { type: "string" },
            userAgent: { type: "string" },
            success: { type: "boolean" },
            failureReason: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        SecurityScore: {
          type: "object",
          properties: {
            overall: { type: "integer", minimum: 0, maximum: 100 },
            factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "integer" },
                  weight: { type: "number" },
                  description: { type: "string" },
                },
              },
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        PasswordAnalytics: {
          type: "object",
          properties: {
            totalChecked: { type: "integer" },
            averageStrength: { type: "number" },
            averageEntropy: { type: "number" },
            distribution: {
              $ref: "#/components/schemas/StrengthDistribution",
            },
            trendOverTime: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", format: "date" },
                  count: { type: "integer" },
                  averageScore: { type: "integer" },
                },
              },
            },
            topPatterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  count: { type: "integer" },
                  percentage: { type: "integer" },
                },
              },
            },
          },
        },
        SecurityEventRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            eventType: { type: "string" },
            ipAddress: { type: "string" },
            userAgent: { type: "string" },
            metadata: { type: "object", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ActivityTimelineItem: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            type: { type: "string", enum: ["login", "password_check", "security_event", "registration"] },
            description: { type: "string" },
            ipAddress: { type: "string", nullable: true },
            success: { type: "boolean", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PasswordChart: {
          type: "object",
          properties: {
            strengthDistribution: {
              $ref: "#/components/schemas/ChartData",
            },
            strengthOverTime: {
              $ref: "#/components/schemas/ChartData",
            },
            activityHeatmap: {
              type: "object",
              properties: {
                hours: { type: "array", items: { type: "integer" } },
                days: { type: "array", items: { type: "string" } },
                data: { type: "array", items: { type: "array", items: { type: "integer" } } },
              },
            },
          },
        },
        ChartData: {
          type: "object",
          properties: {
            labels: { type: "array", items: { type: "string" } },
            datasets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  data: { type: "array", items: { type: "number" } },
                  backgroundColor: { type: "array", items: { type: "string" } },
                  borderColor: { type: "array", items: { type: "string" } },
                  borderWidth: { type: "integer" },
                },
              },
            },
          },
        },
        PasswordGenerationStats: {
          type: "object",
          properties: {
            totalGenerated: { type: "integer" },
            averageScore: { type: "integer" },
            averageEntropy: { type: "number" },
            strengthBreakdown: {
              $ref: "#/components/schemas/StrengthDistribution",
            },
            recentGenerations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  score: { type: "integer" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
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
