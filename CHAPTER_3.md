# CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN

## 3.1 Introduction

This chapter presents a detailed analysis and design of the Password Strength Checker with Secure Password Generation and Authentication System. The chapter begins with a requirements analysis that identifies the functional and non-functional requirements of the system. It then presents the system architecture, detailing the frontend and backend component structures, the layered service architecture, and the data flow between components. The database design is presented through the entity-relationship model and schema definitions. Component-level design is described for each major subsystem, including the Password Intelligence Engine, the Generator Engine, the Authentication subsystem, and the Dashboard subsystem. Security architecture, algorithm design, and the testing strategy are also discussed.

## 3.2 System Analysis

### 3.2.1 Requirements Gathering

The requirements for this system were gathered through the following methods:

1. **Literature Review**: Analysis of existing password strength checkers (zxcvbn, browser-based meters, commercial password managers) to identify feature gaps and limitations.
2. **Standards Analysis**: Review of NIST SP 800-63B guidelines and OWASP credential handling best practices to identify compliance requirements.
3. **Security Threat Modeling**: Consideration of common attack vectors including brute-force attacks, dictionary attacks, credential stuffing, and session hijacking to inform security requirements.
4. **User Scenario Analysis**: Identification of primary user workflows — password strength checking, password generation, registration and authentication, and dashboard monitoring.

### 3.2.2 Functional Requirements

The functional requirements are organized by subsystem.

**Authentication Subsystem:**

| ID | Requirement | Priority |
|---|---|---|
| FR-A01 | The system shall allow users to register with email, username, and password | High |
| FR-A02 | The system shall authenticate users via email and password credentials | High |
| FR-A03 | The system shall issue JWT access tokens (15-minute expiry) and refresh tokens (7-day expiry) upon successful authentication | High |
| FR-A04 | The system shall support token refresh using HTTP-only cookies | High |
| FR-A05 | The system shall support token rotation (invalidate old refresh tokens on refresh) | Medium |
| FR-A06 | The system shall allow authenticated users to change their password | Medium |
| FR-A07 | The system shall support password reset via email token | Low |
| FR-A08 | The system shall support email verification | Low |
| FR-A09 | The system shall log all authentication events (login success, login failure, logout, password change) | High |
| FR-A10 | The system shall lock accounts after 5 consecutive failed login attempts for 15 minutes | High |

**Password Strength Checker Subsystem:**

| ID | Requirement | Priority |
|---|---|---|
| FR-P01 | The system shall calculate Shannon entropy of submitted passwords | High |
| FR-P02 | The system shall check passwords against a dictionary of common passwords (600+ entries) | High |
| FR-P03 | The system shall detect leetspeak substitutions and normalize them for dictionary matching | High |
| FR-P04 | The system shall detect QWERTY keyboard patterns (e.g., "qwerty", "asdfgh") | High |
| FR-P05 | The system shall detect sequential character patterns (e.g., "abc", "123", "aaa") | High |
| FR-P06 | The system shall detect repeated substrings within passwords | Medium |
| FR-P07 | The system shall compute a strength score on a 0–100 scale | High |
| FR-P08 | The system shall assign a strength label based on the score (Very Weak, Weak, Fair, Strong, Very Strong) | High |
| FR-P09 | The system shall estimate crack times for three attacker profiles (online throttled, offline GPU, supercomputer) | High |
| FR-P10 | The system shall generate human-readable improvement suggestions based on detected weaknesses | Medium |
| FR-P11 | The system shall log password check results for authenticated users | Medium |

**Password Generator Subsystem:**

| ID | Requirement | Priority |
|---|---|---|
| FR-G01 | The system shall generate cryptographically secure random passwords of configurable length (8–64 characters) | High |
| FR-G02 | The system shall support configurable inclusion/exclusion of uppercase, lowercase, digits, and symbols | High |
| FR-G03 | The system shall support exclusion of ambiguous characters (O, 0, I, l, 1, |, {, }, [, ]) | Medium |
| FR-G04 | The system shall validate generated passwords through the strength checker, rejecting passwords below a minimum threshold | Medium |
| FR-G05 | The system shall generate passphrases from a 2,048-word list with configurable word count (4–8 words) | Medium |
| FR-G06 | The system shall support configurable passphrase separators (space, hyphen, underscore, random digit, random symbol) | Low |

**Dashboard Subsystem:**

| ID | Requirement | Priority |
|---|---|---|
| FR-D01 | The system shall display total password checks count, average strength, average entropy, and security score | High |
| FR-D02 | The system shall display strength distribution as a chart (Very Weak to Very Strong) | High |
| FR-D03 | The system shall display recent login activity with IP addresses and user agents | High |
| FR-D04 | The system shall display historical password check records with filtering and pagination | Medium |
| FR-D05 | The system shall support CSV export of password check history | Low |
| FR-D06 | The system shall display password analytics trends over time | Low |

**User Profile Subsystem:**

| ID | Requirement | Priority |
|---|---|---|
| FR-U01 | The system shall allow authenticated users to view their profile information | High |
| FR-U02 | The system shall allow authenticated users to update their profile (name, email, username) | Medium |

### 3.2.3 Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-01 | All passwords must be hashed with bcrypt (minimum 12 rounds) before storage | Security |
| NFR-02 | All API request bodies must be limited to 10 KB | Security |
| NFR-03 | Rate limiting must be applied to all endpoints (global: 100/15min, auth: 5/15min, check: 30/min, generate: 20/min) | Security |
| NFR-04 | All HTTP responses must include security headers via Helmet.js | Security |
| NFR-05 | CORS must restrict access to the configured client origin only | Security |
| NFR-06 | The API shall respond to successful requests within 500ms under normal load | Performance |
| NFR-07 | The system shall handle at least 100 concurrent API requests without degradation | Performance |
| NFR-08 | The frontend shall display loading states during API calls and gracefully handle network errors | Usability |
| NFR-09 | The frontend shall be responsive and function on mobile, tablet, and desktop viewports | Usability |
| NFR-10 | The system shall maintain 90%+ unit test coverage for backend services | Maintainability |
| NFR-11 | The database schema must support soft deletion of user accounts | Maintainability |

## 3.3 System Architecture

### 3.3.1 High-Level Architecture

The system follows a client-server architecture with three tiers:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Client Tier     │────▶│  Application Tier │────▶│   Data Tier      │
│  React SPA        │     │  Express Backend  │     │  PostgreSQL 16   │
│  (Port 443/5173)  │     │  (Port 3000)      │     │  (Port 5432)     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

1. **Client Tier**: A single-page application built with React 19 and TypeScript, deployed via Nginx static file serving. The client communicates with the backend exclusively through RESTful API calls over HTTPS.

2. **Application Tier**: An Express.js server written in TypeScript, organized into a layered architecture (Routes → Middleware → Controllers → Services → Repositories). The server handles authentication, password analysis, password generation, dashboard data aggregation, and data export.

3. **Data Tier**: A PostgreSQL 16 database accessed exclusively through Prisma ORM. The database stores user accounts, password logs, login history, security events, and password reset tokens.

### 3.3.2 Layered Backend Architecture

The backend follows a strict layered architecture with unidirectional dependencies:

```
┌─────────────────────────────────────────────────────────────┐
│                         Routes                              │
│  (HTTP method + path → middleware chain → controller)       │
├─────────────────────────────────────────────────────────────┤
│                       Middleware                             │
│  (authenticate → authorize → validate → rate limit)         │
├─────────────────────────────────────────────────────────────┤
│                      Controllers                             │
│  (parse request → call service → format response)           │
├─────────────────────────────────────────────────────────────┤
│                       Services                               │
│  (business logic: password analysis, generation, auth)      │
├─────────────────────────────────────────────────────────────┤
│                     Repositories                             │
│  (data access via Prisma ORM)                               │
├─────────────────────────────────────────────────────────────┤
│                   PostgreSQL (via Prisma)                    │
└─────────────────────────────────────────────────────────────┘
```

**Routes**: Route definitions map HTTP methods and URL paths to middleware chains and controller methods. Routes are organized by feature domain:

| Route Module | Base Path | Endpoints |
|---|---|---|
| `auth.routes.ts` | `/api/auth` | 9 endpoints (register, login, logout, refresh, forgot-password, reset-password, change-password, verify-email, me) |
| `password.routes.ts` | `/api/password` | 4 endpoints (check-strength, generate, generate-passphrase, history) |
| `user.routes.ts` | `/api/users` | 2 endpoints (get-profile, update-profile) |
| `dashboard.routes.ts` | `/api/dashboard` | 9 endpoints (statistics, security-score, login-history, security-events, activity-timeline, password-analytics, chart-data, generation-stats, export) |

**Middleware Pipeline**: The middleware stack is applied in a specific order with different scopes:

1. **Application-level** (all requests): request ID assignment, Helmet security headers, CORS, global rate limiter, compression, JSON body parsing (10 KB limit), cookie parsing, HTTP logging.
2. **Route-level** (per-endpoint): authentication (JWT verification), authorization (role check), input validation (express-validator schemas), feature-specific rate limiting.

**Controllers**: Controllers are responsible for extracting request parameters, delegating to services, and formatting HTTP responses. Each controller class groups related endpoint handlers:

- `AuthController`: register, login, logout, refreshToken, forgotPassword, resetPassword, changePassword, verifyEmail, getMe
- `PasswordController`: checkStrength, generate, generatePassphrase, getHistory
- `UserController`: getProfile, updateProfile
- `DashboardController`: getStatistics, getSecurityScore, getLoginHistory, getSecurityEvents, getActivityTimeline, getPasswordAnalytics, getChartData, getPasswordGenerationStats, exportData

**Services**: Services encapsulate business logic. The service layer is divided into:

- **Core Services**: AuthService, UserService, PasswordService, TokenService, HashService, EmailService, DashboardService, AnalyticsService, ReportExportService
- **Password Intelligence Sub-Services**: password-strength.service (orchestrator), entropy-calculator.service, dictionary-checker.service, leetspeak-detector.service, keyboard-pattern-detector.service, sequence-detector.service, pattern-detector.service, scoring-engine.service, crack-time-estimator.service, suggestion.service, report-formatter.service
- **Generator Sub-Services**: password-generator.service, passphrase-generator.service, character-pool-builder.service, policy-validator.service, password-validator.service, generator-entropy.service, response-formatter.service

**Repositories**: Repositories abstract database access using Prisma ORM:

- `AuthRepository`: user creation, credential lookup, refresh token management, reset token management
- `UserRepository`: profile read and update, soft delete
- `PasswordRepository`: password check logging, history retrieval, aggregate statistics
- `DashboardRepository`: aggregate queries across multiple tables for dashboard metrics

### 3.3.3 Frontend Architecture

The frontend follows a component-based architecture with the following layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Pages (9)                               │
│  (Landing, Login, Register, Dashboard, Checker, Generator,  │
│   History, Profile, Settings)                               │
├─────────────────────────────────────────────────────────────┤
│                   Components (15)                            │
│  (Layout: AppLayout, AuthLayout, Footer)                    │
│  (UI: Button, Card, Badge, Input, PasswordInput, Toast...)  │
│  (Forms: LoginForm, RegisterForm, ProfileForm)              │
│  (Password: PasswordGeneratorForm)                          │
├─────────────────────────────────────────────────────────────┤
│                     Custom Hooks (7)                         │
│  (useDebounce, usePasswordStrength, usePasswordHistory,     │
│   usePasswordGenerator, useDashboard, useLogin, useLogout)  │
├─────────────────────────────────────────────────────────────┤
│                  Services / API Layer (5)                    │
│  (api.ts, authService, passwordService, userService,        │
│   dashboardService + Axios interceptors)                    │
├─────────────────────────────────────────────────────────────┤
│                     State Management                         │
│  (Zustand: authStore, uiStore; TanStack Query: server state)│
└─────────────────────────────────────────────────────────────┘
```

**Routing**: The application uses React Router v7 with lazy-loaded pages and guard components:
- `AuthGuard`: Redirects unauthenticated users to `/login`
- `GuestGuard`: Redirects authenticated users to `/dashboard`

| Route | Page | Guard |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | LoginPage | GuestGuard |
| `/register` | RegisterPage | GuestGuard |
| `/dashboard` | DashboardPage | AuthGuard |
| `/password-checker` | StrengthCheckerPage | AuthGuard |
| `/password-generator` | PasswordGeneratorPage | AuthGuard |
| `/history` | HistoryPage | AuthGuard |
| `/profile` | ProfilePage | AuthGuard |
| `/settings` | SettingsPage | AuthGuard |

**Data Flow**: The frontend data flow follows a unidirectional pattern:

1. User interaction triggers a React component event
2. A custom hook calls the appropriate service function
3. The service function makes an HTTP request through the Axios instance
4. The Axios interceptor attaches the JWT access token (if authenticated)
5. The API response is processed and returned to the component via the hook
6. The component re-renders with the new data
7. Server state is cached by TanStack Query for subsequent requests

### 3.3.4 Deployment Architecture

The system is containerized using Docker with multi-stage builds:

```
┌────────────────────────────────────────────────────────────┐
│                    Docker Compose                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Nginx        │  │  Express     │  │  PostgreSQL  │      │
│  │  (React SPA)  │◀▶│  API Server  │◀▶│  Database    │      │
│  │  Port 80      │  │  Port 3000   │  │  Port 5432   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────┘
```

- **Frontend Dockerfile**: Multi-stage — Stage 1 builds the React application with Vite; Stage 2 serves the built assets via Nginx with compression, caching headers, and reverse proxy configuration.
- **Backend Dockerfile**: Multi-stage — Stage 1 compiles TypeScript; Stage 2 runs the compiled JavaScript with the production dependencies only.
- **Docker Compose**: Orchestrates all three services with shared network, volume-mounted PostgreSQL data, and environment variable injection via `.env`.

## 3.4 Database Design

### 3.4.1 Entity-Relationship Model

The database consists of six related models:

```
┌──────────┐       ┌──────────┐
│   Role   │       │   User   │
├──────────┤       ├──────────┤
│ id (PK)  │◀──────│ id (PK)  │
│ name     │   1:N │ email    │
│          │       │ username │
│          │       │ password │
│          │       │ roleId   │
│          │       │ isActive │
│          │       │ isLocked │
│          │       │ ...      │
└──────────┘       └────┬─────┘
                        │
           ┌────────────┼──────────────────┐
           │            │                  │
           ▼            ▼                  ▼
   ┌────────────┐ ┌────────────┐ ┌──────────────────┐
   │PasswordLog │ │LoginHistory│ │ SecurityEvent    │
   ├────────────┤ ├────────────┤ ├──────────────────┤
   │ id (PK)    │ │ id (PK)    │ │ id (PK)          │
   │ userId (FK)│ │ userId (FK)│ │ userId (FK)      │
   │ strength   │ │ ipAddress  │ │ eventType        │
   │ entropy    │ │ userAgent  │ │ ipAddress        │
   │ checks     │ │ success    │ │ userAgent        │
   │ ...        │ │ failureRsn │ │ metadata (JSON)  │
   └────────────┘ └────────────┘ └──────────────────┘

┌──────────────────┐
│PasswordResetToken│
├──────────────────┤
│ id (PK)          │
│ userId (FK)      │
│ token (unique)   │
│ expiresAt        │
│ used             │
└──────────────────┘
```

### 3.4.2 Schema Design

**Role Model**: Stores user roles for authorization.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, default: `gen_random_uuid()` |
| name | Enum (USER, ADMIN) | Unique, not null |
| description | VARCHAR(255) | Nullable |
| createdAt | TIMESTAMP | Default: `now()` |
| updatedAt | TIMESTAMP | Auto-updated |

**User Model**: Stores user account information with security fields.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, default: `gen_random_uuid()` |
| email | VARCHAR(255) | Unique, not null |
| username | VARCHAR(50) | Unique, not null |
| passwordHash | VARCHAR(255) | Not null |
| firstName | VARCHAR(100) | Nullable |
| lastName | VARCHAR(100) | Nullable |
| roleId | UUID | Foreign Key → Role.id, not null |
| isActive | BOOLEAN | Default: true |
| isLocked | BOOLEAN | Default: false |
| failedAttempts | INTEGER | Default: 0 |
| lockUntil | TIMESTAMP | Nullable |
| lastLoginAt | TIMESTAMP | Nullable |
| refreshToken | TEXT | Nullable |
| refreshTokenExpAt | TIMESTAMP | Nullable |
| isEmailVerified | BOOLEAN | Default: false |
| emailVerificationToken | VARCHAR(255) | Nullable |
| emailVerificationExpires | TIMESTAMP | Nullable |
| deletedAt | TIMESTAMP | Nullable (soft delete) |
| createdAt | TIMESTAMP | Default: `now()` |
| updatedAt | TIMESTAMP | Auto-updated |

**Indexes**: `email` (unique), `username` (unique), `roleId` (FK), composite on `[isActive, isLocked]`, composite on `[createdAt, id]` for pagination.

**PasswordLog Model**: Stores password check results.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id, not null |
| strengthScore | INTEGER | Not null (0–100) |
| strengthLabel | VARCHAR(20) | Not null |
| hasUppercase | BOOLEAN | Not null |
| hasLowercase | BOOLEAN | Not null |
| hasNumbers | BOOLEAN | Not null |
| hasSymbols | BOOLEAN | Not null |
| entropy | DOUBLE PRECISION | Not null |
| createdAt | TIMESTAMP | Default: `now()` |

**Indexes**: `userId` (FK), `createdAt`, composite on `[userId, createdAt]`.

**LoginHistory Model**: Tracks authentication attempts.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id, not null |
| ipAddress | VARCHAR(45) | Not null |
| userAgent | TEXT | Not null |
| success | BOOLEAN | Not null |
| failureReason | VARCHAR(100) | Nullable |
| createdAt | TIMESTAMP | Default: `now()` |

**Indexes**: `userId` (FK), `createdAt`, composite on `[userId, createdAt]`.

**SecurityEvent Model**: Logs security-related events.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id, not null |
| eventType | VARCHAR(50) | Not null |
| ipAddress | VARCHAR(45) | Not null |
| userAgent | TEXT | Not null |
| metadata | JSON | Nullable |
| createdAt | TIMESTAMP | Default: `now()` |

**Indexes**: `userId` (FK), `createdAt`, composite on `[userId, createdAt]`.

**PasswordResetToken Model**: Manages password reset flows.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key → User.id, not null |
| token | VARCHAR(255) | Unique, not null |
| expiresAt | TIMESTAMP | Not null |
| used | BOOLEAN | Default: false |
| createdAt | TIMESTAMP | Default: `now()` |

## 3.5 Component Design

### 3.5.1 Password Intelligence Engine

The Password Intelligence Engine is the core analytical subsystem. It is composed of 11 modular services, each responsible for a specific aspect of password analysis:

```
Password Input
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│              password-strength.service.ts                    │
│                 (Orchestrator)                               │
│  Coordinates all sub-services and assembles the final result │
└──────┬──────┬──────┬──────┬──────┬──────┬───────────────────┘
       │      │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼      ▼
   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌──────────┐
   │Entr.│ │Dict.│ │Leet.│ │Keyb.│ │Seq. │ │Pattern   │
   │Calc.│ │Check│ │Det. │ │Det. │ │Det. │ │Det.      │
   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └──────────┘
                                      │
      ┌───────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────┐
│              scoring-engine.service.ts                       │
│  Computes final score (0–100), assigns strength label,      │
│  calculates penalties for detected weaknesses               │
└──────┬──────────────────────┬───────────────────────────────┘
       │                      │
       ▼                      ▼
┌───────────────┐   ┌─────────────────────────────────────────┐
│Crack-Time     │   │  suggestion.service.ts                  │
│Estimator      │   │  Generates human-readable               │
│               │   │  improvement recommendations            │
└───────────────┘   └─────────────────────────────────────────┘
       │                      │
       └──────────┬───────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              report-formatter.service.ts                    │
│  Assembles the final PasswordAnalysisResult object          │
└─────────────────────────────────────────────────────────────┘
```

**Entropy Calculator** (`entropy-calculator.service.ts`):
- Detects the character pool based on character categories present
- Computes pool size as the sum of detected character set sizes (lowercase 26, uppercase 26, digits 10, symbols 33, Unicode 128)
- Calculates Shannon entropy: *E = L × log₂(P)*
- Returns entropy value in bits and the detected pool size

**Dictionary Checker** (`dictionary-checker.service.ts`):
- Maintains a `Set<string>` of 600+ common and breached passwords
- Checks the input password for exact match
- Checks stripped variants (removing leading/trailing digits)
- Checks prefixed and suffixed digit variants
- Returns a `DictionaryCheckResult` indicating whether a match was found and the matched entry

**Leetspeak Detector** (`leetspeak-detector.service.ts`):
- Maintains a character mapping of leet substitutions (e.g., `@`→a, `4`→a, `3`→e, `$`→s, `1`→l, `0`→o, `5`→s, `7`→t, `!`→i, `+`→t)
- Normalizes the input password by replacing leet characters with their plaintext equivalents
- Returns the normalized string and a boolean indicating whether leetspeak was detected

**Keyboard Pattern Detector** (`keyboard-pattern-detector.service.ts`):
- Pre-computes all QWERTY keyboard row patterns (top row: `qwertyuiop`, middle row: `asdfghjkl`, bottom row: `zxcvbnm`)
- Generates all contiguous substrings of length 3+ for each row
- Checks the input password (and its reversed form) against the cached substring set
- Returns detected patterns and their positions

**Sequence Detector** (`sequence-detector.service.ts`):
- Detects sequential character patterns: ascending alphabetic ("abc"), descending alphabetic ("cba"), ascending numeric ("123"), descending numeric ("321")
- Detects repeated characters ("aaaaaa")
- Detects repeated substrings ("abcabcabc")
- Detects common date patterns
- Returns a `SequenceCheckResult` with detected sequence types

**Pattern Detector** (`pattern-detector.service.ts`):
- Combines keyboard pattern detection and sequence detection
- Returns a unified `PatternCheckResult` with all detected patterns

**Scoring Engine** (`scoring-engine.service.ts`):
- Calculates the base score from password length (2.5 points per character, maximum 30 points)
- Adds diversity bonus (up to 20 points for multiple character categories)
- Adds entropy contribution (entropy / 4, maximum 25 points)
- Adds passphrase bonus (5–15 points based on detected word count)
- Applies penalties: dictionary match (−50 points), keyboard pattern (−20), sequence pattern (−15), repeated characters (−10)
- Clamps the final score to the range 0–100
- Assigns a strength label based on score thresholds:
  - 0–24: Very Weak
  - 25–49: Weak
  - 50–74: Fair
  - 75–89: Strong
  - 90–100: Very Strong

**Crack Time Estimator** (`crack-time-estimator.service.ts`):
- Maps entropy values to crack time categories:
  - < 25 bits: "Instantly"
  - 25–34: "Minutes to hours"
  - 35–49: "Days to months"
  - 50–64: "Years"
  - 65–79: "Centuries"
  - 80–99: "Millennia"
  - ≥ 100: "Heat death of the universe"
- Also computes time-to-crack for three attacker profiles:
  - Online throttled: 100 guesses/second
  - Offline GPU: 10 billion guesses/second
  - Supercomputer: 100 trillion guesses/second

**Suggestion Service** (`suggestion.service.ts`):
- Generates human-readable recommendations based on detected weaknesses
- Checks for minimum length, missing character categories, dictionary matches, pattern detections, and repeated characters
- Returns an array of suggestion strings

### 3.5.2 Generator Engine

The Generator Engine provides cryptographically secure password and passphrase generation:

**Character Pool Builder** (`character-pool-builder.service.ts`):
- Defines character sets: uppercase (26), lowercase (26), digits (10), symbols (32)
- Supports exclusion of ambiguous characters: O, 0, I, l, 1, |, {, }, [, ]
- Builds the character pool as an array based on user configuration
- Returns the pool array with labels describing the selected sets

**Password Generator** (`password-generator.service.ts`):
- Uses `crypto.randomBytes()` from the Node.js crypto module for cryptographically secure randomness
- Generates a password of the specified length by selecting characters uniformly from the built pool
- Implements retry logic (up to 50 attempts) to ensure at least one character from each required set is included
- Falls back to guaranteed placement if retries are exhausted
- Returns the generated password string

**Passphrase Generator** (`passphrase-generator.service.ts`):
- Uses `crypto.randomInt()` to select words from a predefined 2,048-word list
- Supports configurable word count (4–8 words)
- Supports separator options: space, hyphen, underscore, random digit, random symbol
- Returns the generated passphrase string

**Policy Validator** (`policy-validator.service.ts`):
- Validates generation options:
  - Length must be between 8 and 64 characters
  - At least one character set must be selected
  - Word count must be between 4 and 8
- Returns validation errors if constraints are violated

**Password Validator** (`password-validator.service.ts`):
- After generation, passes the password through the Password Intelligence Engine
- Verifies that the generated password meets a minimum score threshold (default: 75, "Strong")
- Returns validation result with score, entropy, and crack time

### 3.5.3 Authentication Component

The authentication subsystem implements a JWT-based authentication flow with refresh token rotation:

**Registration Flow**:
1. Client sends `POST /api/auth/register` with email, username, password, and profile details
2. Server validates input against express-validator schema
3. Server checks for duplicate email and username
4. Server hashes the password with bcrypt (12 rounds)
5. Server creates a new User record and assigns the USER role
6. Server generates JWT access token (15-min expiry) and refresh token (7-day expiry with jti)
7. Server sets refresh token as HTTP-only cookie
8. Server logs a REGISTER security event
9. Server returns the access token and user profile

**Login Flow**:
1. Client sends `POST /api/auth/login` with email and password
2. Server validates input, applies auth rate limiter (5 requests per 15 minutes)
3. Server checks account lockout status (unlocks if lock duration has expired)
4. Server retrieves user by email and compares password hash with bcrypt
5. On failure: increment failed attempts counter, lock account if threshold (5) reached, log LOGIN_FAILURE event
6. On success: reset failed attempts counter, update lastLoginAt, generate tokens, log LOGIN_SUCCESS event
7. Server returns access token and user profile

**Token Refresh Flow**:
1. Client sends `POST /api/auth/refresh-token` with the refresh token from the HTTP-only cookie
2. Server verifies the refresh token signature and expiry
3. Server validates the jti (JWT ID) claim against stored records
4. Server invalidates the old refresh token
5. Server generates new access and refresh tokens
6. Server sets the new refresh token as HTTP-only cookie
7. Server returns the new access token

**Account Lockout Mechanism**:
- File: `security/accountLockout.ts`
- Tracks failed login attempts via the `failedAttempts` field on the User model
- Locks the account when `failedAttempts >= MAX_LOGIN_ATTEMPTS` (configurable, default 5)
- Sets `lockUntil` timestamp = current time + `LOCKOUT_DURATION_MS` (configurable, default 15 minutes)
- Automatic unlock: `isAccountLocked()` checks whether `lockUntil` has passed and clears the lock if so
- Atomic increments using Prisma transactions to prevent race conditions

### 3.5.4 Dashboard Component

The dashboard subsystem aggregates data across multiple database tables to provide visual analytics:

**Dashboard Service** (`dashboard.service.ts`):
- `getStatistics()`: Returns total passwords checked, average strength score, average entropy, strength distribution counts, recent login activity, and overall security score
- `getSecurityScore()`: Computes a security score (0–100) based on multiple factors including password strength distribution, account security settings, login success rate, and recent security events
- `getLoginHistory()`: Returns paginated login attempts with IP address, user agent, success status, and failure reason
- `getSecurityEvents()`: Returns paginated security events filtered by type
- `getActivityTimeline()`: Returns a merged timeline of password checks, login events, and security events, paginated
- `getPasswordAnalytics()`: Returns strength distribution, trend over time, and top patterns

**Analytics Service** (`analytics.service.ts`):
- `getChartData()`: Builds structured chart data objects for the frontend, including strength distribution labels/datasets, strength-over-time series, and activity heatmap data (24 hours × 7 days)
- `getPasswordGenerationStats()`: Returns aggregate statistics on generated passwords

## 3.6 Security Design

### 3.6.1 Authentication and Authorization

The security model implements four layers of access control:

1. **Authentication** (`authenticate.middleware.ts`):
   - Extracts JWT from the `Authorization: Bearer <token>` header
   - Verifies the token using HS256 algorithm with the configured secret
   - Validates token expiry, issuer, and audience claims
   - Attaches decoded payload (`{ id, email, role }`) to `req.user`

2. **Authorization** (`authorize.middleware.ts`):
   - Factory function that accepts allowed role names
   - Checks `req.user.role` against the allowed roles
   - Returns 403 Forbidden if the user's role is not authorized
   - Currently supports USER and ADMIN roles

3. **Token Hierarchy**:
   - Access token: 15-minute expiry, stored in memory (Zustand store), sent via Authorization header
   - Refresh token: 7-day expiry (30-day with rememberMe), stored as HTTP-only cookie, used only for token refresh
   - Token rotation: each refresh invalidates the previous refresh token to prevent token reuse

### 3.6.2 Account Lockout

The account lockout mechanism provides brute-force protection for the login endpoint:

- **Threshold**: Configurable via `MAX_LOGIN_ATTEMPTS` environment variable (default: 5)
- **Duration**: Configurable via `LOCKOUT_DURATION_MS` environment variable (default: 15 minutes, 900,000 ms)
- **Implementation**: Atomic increment of `failedAttempts` counter; lock is triggered when counter reaches threshold
- **Automatic Clearing**: The `isAccountLocked()` function checks if `lockUntil` has passed and automatically clears the lock and resets the counter
- **Error Resilience**: `handleFailedLogin()` catches database errors silently to prevent timing side-channel attacks

### 3.6.3 Rate Limiting

Rate limiting is implemented using `express-rate-limit` with four tiers:

| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| Global | 15 minutes | 100 | All API routes |
| Auth | 15 minutes | 5 | register, login, refresh-token, forgot-password, reset-password |
| Password Check | 1 minute | 30 | check-strength |
| Password Generate | 1 minute | 20 | generate, generate-passphrase |

Rate limiters are disabled in test mode to prevent interference with integration tests.

### 3.6.4 Input Validation

Input validation is implemented at two layers:

1. **Frontend**: Zod schemas validate form inputs before submission, providing immediate user feedback
2. **Backend**: express-validator chains validate all request bodies and query parameters:
   - Email: format validation, length limits
   - Password: minimum length enforcement, complexity verification
   - Username: alphanumeric validation, length limits
   - First/last name: `.escape()` for XSS prevention
   - Body size: limited to 10KB via `express.json({ limit: "10kb" })`

### 3.6.5 Security Headers

Security headers are set via Helmet.js middleware:

| Header | Value | Purpose |
|---|---|---|
| Content-Security-Policy | Restricted | Prevents XSS and data injection |
| Strict-Transport-Security | max-age=31536000 | Enforces HTTPS |
| X-Content-Type-Options | nosniff | Prevents MIME type sniffing |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-XSS-Protection | 0 | Disables legacy XSS filter (replaced by CSP) |

Additional security measures include:
- CORS: Origin-restricted to the configured `CLIENT_URL` in production
- Cookie flags: `httpOnly`, `sameSite: "strict"`, `secure` (in production)
- CSV injection prevention: Formula-trigger characters (`=`, `+`, `-`, `@`) escaped in exported CSV files
- Request ID: Every response includes an `x-request-id` header for request tracing

## 3.7 Algorithm Design

### 3.7.1 Entropy Calculation Algorithm

The entropy calculation follows the Shannon entropy formula adapted for password analysis:

```
Algorithm: CalculateEntropy
Input: password (string)
Output: entropy (bits), poolSize (integer)

1. Initialize poolSize = 0
2. Define character sets and their sizes:
   - lowercase: "a-z", size = 26
   - uppercase: "A-Z", size = 26
   - digits: "0-9", size = 10
   - symbols: "!@#$...", size = 33
3. For each character set:
   If password contains any character from the set:
      poolSize += set.size
4. If poolSize == 0:
   poolSize = 95 (full ASCII printable set)
5. entropy = password.length * log2(poolSize)
6. Return (entropy, poolSize)
```

### 3.7.2 Scoring Algorithm

The scoring engine computes a weighted score from multiple factors:

```
Algorithm: CalculateScore
Input: password, entropy, dictionaryResult, patternResult
Output: score (0–100), label (string)

1. Initialize score = 0
2. Length contribution:
   score += min(30, password.length × 2.5)
3. Diversity bonus:
   Count character categories present (uppercase, lowercase, digits, symbols)
   score += count × 5
4. Entropy contribution:
   score += min(25, entropy / 4)
5. Passphrase bonus:
   If password contains 4+ words from the passphrase word list:
      score += min(15, wordCount × 3)
6. Penalties:
   If dictionary match found: score -= 50
   If keyboard pattern detected: score -= 20
   If sequence detected: score -= 15
   If repeated characters detected: score -= 10
7. Clamp: score = max(0, min(100, score))
8. Label assignment:
   If score < 25: label = "Very Weak"
   Else if score < 50: label = "Weak"
   Else if score < 75: label = "Fair"
   Else if score < 90: label = "Strong"
   Else: label = "Very Strong"
9. Return (score, label)
```

### 3.7.3 Pattern Detection Algorithms

**Keyboard Pattern Detection**:
```
Algorithm: DetectKeyboardPatterns
Input: password (string)
Output: patterns (array of {pattern, position})

1. Define QWERTY rows:
   - row1 = "qwertyuiop"
   - row2 = "asdfghjkl"
   - row3 = "zxcvbnm"
2. Generate all contiguous substrings of length ≥ 3 for each row
   and their reverses
3. For each substring in the generated set:
   If substring exists in password (case-insensitive):
      Add {pattern: substring, position: index} to results
4. Return results
```

**Sequence Detection**:
```
Algorithm: DetectSequences
Input: password (string)
Output: sequenceTypes (array)

1. Define sequences:
   - alpha_asc = "abcdefghijklmnopqrstuvwxyz"
   - alpha_desc = reverse(alpha_asc)
   - num_asc = "0123456789"
   - num_desc = reverse(num_asc)
2. For each sequence in [alpha_asc, alpha_desc, num_asc, num_desc]:
   If any substring of length ≥ 3 from password matches
   a substring in sequence:
      Add sequence type to results
3. Check for repeated characters (same character 3+ times consecutively)
4. Check for repeated substrings (same substring appears 2+ times)
5. Return detected sequence types
```

## 3.8 Testing Strategy

The testing strategy is organized into three tiers:

### 3.8.1 Unit Testing

- **Framework**: Jest (backend), Vitest (frontend)
- **Scope**: Individual services, middleware, utilities, and components in isolation
- **Backend Tests (429 tests, 33 suites)**:
  - Password services (10 test files): entropy calculation, dictionary checker, leetspeak detector, keyboard pattern detector, pattern detector, scoring engine, sequence detector, suggestion service, crack time estimator, password strength orchestrator
  - Generator services (6 test files): character pool builder, generator entropy, password generator, passphrase generator, password validator, policy validator
  - Core services (5 test files): auth service, user service, token service, hash service, email service
  - Middleware (3 test files): authenticate, authorize, error handler
  - Security (2 test files): account lockout, security events
  - Utilities (1 test file): API error classes
- **Frontend Tests (70 tests, 10 suites)**:
  - Component tests: Button rendering and interaction, Toast notifications, AuthGuard routing
  - Service tests: auth service API calls, password service API calls and client-side analysis
  - Store tests: auth store state management and persistence
  - Utility tests: cn (class name merger), formatters (date, strength colors), validators (Zod schemas)
  - Integration test: authentication flow (session refresh, redirect behavior)

### 3.8.2 Integration Testing

- **Framework**: Jest + Supertest
- **Scope**: Full HTTP request-response lifecycle including middleware pipeline, validation, and error handling
- **Test Files (6)**:
  - Auth integration: full registration, login, token refresh, logout, and protected endpoint flows
  - Password integration: strength check, history retrieval
  - Password generator integration: password and passphrase generation endpoints
  - Dashboard integration: statistics, analytics, and export endpoints
  - Health check: system health endpoint
  - Validation: input validation rules for all endpoints

### 3.8.3 Load Testing

- **Framework**: k6 (Grafana)
- **Scope**: Performance under concurrent load for critical endpoints
- **Scripts (8)**:
  - Auth load: ramp from 10 to 100 virtual users on register/login/refresh endpoints
  - Password check: ramp from 10 to 200 VUs on check-strength endpoint
  - Password generate: ramp from 10 to 100 VUs on generate endpoints
  - Dashboard load: ramp from 5 to 50 VUs on dashboard endpoints
  - Stress test: ramp from 10 to 2,000 VUs to identify breaking points
  - Spike test: sudden jump from 20 to 500 VUs and back to 20
  - Endurance test: sustained 50 VUs for 10 minutes to identify memory leaks
  - Config: shared configuration for all scripts

## 3.9 Summary

This chapter presented a comprehensive analysis and design of the Password Strength Checker with Secure Password Generation and Authentication System. The requirements analysis identified 22 functional requirements organized across four subsystems (authentication, password checking, password generation, dashboard) and 11 non-functional requirements spanning security, performance, usability, and maintainability.

The system architecture was described at three levels: the high-level three-tier architecture (client, application, data), the layered backend architecture (routes, middleware, controllers, services, repositories), and the frontend component architecture (pages, components, hooks, services, state management).

The database design presented six related models with detailed column specifications, indexes, and relationships. Component-level design described the internal structure of the Password Intelligence Engine (11 sub-services), the Generator Engine (7 sub-services), the Authentication subsystem with JWT rotation and account lockout, and the Dashboard subsystem with data aggregation and analytics.

Security design covered five dimensions: authentication/authorization, account lockout, rate limiting, input validation, and security headers. Algorithm design presented pseudocode for entropy calculation, scoring, keyboard pattern detection, and sequence detection. The testing strategy described three tiers of testing with quantitative targets: 429+ unit tests, 6 integration test files, and 8 load testing scripts.
