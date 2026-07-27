# SentinelPass - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating an Account](#creating-an-account)
3. [Logging In](#logging-in)
4. [Password Strength Checker](#password-strength-checker)
5. [Secure Password Generator](#secure-password-generator)
6. [Dashboard](#dashboard)
7. [Password History](#password-history)
8. [Account Settings](#account-settings)
9. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

SentinelPass is a password security platform that helps you evaluate password strength and generate secure passwords. You can use the strength checker without an account, but registration unlocks the full feature set including history tracking and the security dashboard.

### System Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies enabled (required for authentication)

### Accessing the Application

| Environment | URL |
|---|---|
| Production | https://password-strength-checker-phi-murex.vercel.app |
| Local Development | http://localhost:5173 |

---

## Creating an Account

1. Click **Sign Up** on the navigation bar.
2. Fill in the registration form:
   - **Email**: A valid email address (used for account verification and password resets).
   - **Username**: 3-30 characters, alphanumeric and underscores.
   - **Password**: Must meet minimum strength requirements (8+ characters).
   - **First Name** and **Last Name** (optional).
3. Click **Create Account**.
4. You will be redirected to the login page.

### Password Requirements

| Rule | Requirement |
|---|---|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Strength level | At least "Weak" to register |

---

## Logging In

1. Click **Login** on the navigation bar.
2. Enter your email and password.
3. Optionally, check **Remember Me** to stay logged in for 30 days.
4. Click **Sign In**.

### Account Lockout

After **5 failed login attempts**, your account will be locked for **15 minutes**. This is an automatic security measure. Wait for the lockout period to expire and try again.

### Forgot Password

1. Click **Forgot Password?** on the login page.
2. Enter your registered email address.
3. Check your email for a password reset link.
4. Click the link and set a new password.

---

## Password Strength Checker

The password strength checker analyzes passwords using entropy calculations, pattern detection, and dictionary checks.

### How to Use

1. Navigate to the **Password Checker** page from the navigation bar.
2. Type or paste a password into the input field.
3. The strength analysis updates in real time as you type.

### Understanding the Results

#### Strength Levels

| Level | Score Range | Description |
|---|---|---|
| **Very Weak** | 0-19 | Easily cracked in seconds |
| **Weak** | 20-39 | Cracked in minutes to hours |
| **Fair** | 40-59 | Moderate protection, hours to days |
| **Strong** | 60-79 | Good protection, days to months |
| **Very Strong** | 80-100 | Excellent protection, years to centuries |

#### Analysis Components

- **Entropy Score**: Measures randomness in bits. Higher entropy means a stronger password.
- **Character Breakdown**: Shows the mix of uppercase, lowercase, numbers, and symbols.
- **Crack Time Estimates**: Three attacker profiles:
  - **Online Attack**: Slow, rate-limited attempts (e.g., web login forms).
  - **Offline GPU Attack**: Fast, parallel attempts using graphics cards.
  - **Supercomputer**: State-of-the-art brute force.
- **Pattern Detection**: Identifies keyboard patterns (e.g., `qwerty`), sequences (e.g., `abc123`), and repeated characters.
- **Suggestions**: Actionable tips to improve the password.

### Logged-In Features

When logged in, your password checks are saved to your history (the actual password is **never stored**). You can view trends and export your history from the Dashboard.

---

## Secure Password Generator

Generate cryptographically secure passwords or readable passphrases.

### Random Password

1. Navigate to the **Password Generator** page.
2. Configure options:
   - **Length**: 8-64 characters (default: 16).
   - **Uppercase letters** (A-Z): Toggle on/off.
   - **Lowercase letters** (a-z): Toggle on/off.
   - **Numbers** (0-9): Toggle on/off.
   - **Symbols** (!@#$...): Toggle on/off.
3. Click **Generate**.
4. Click the **Copy** icon to copy the password to your clipboard.

### Passphrase

1. Switch to the **Passphrase** tab.
2. Configure:
   - **Number of words**: 3-8 (default: 4).
   - **Separator**: Choose between `-`, `.`, `_`, or space.
   - **Capitalize**: Uppercase the first letter of each word.
   - **Include number**: Add a random digit.
3. Click **Generate**.
4. Passphrases combine high entropy with readability (e.g., `correct-horse-battery-staple`).

### Entropy Display

After generation, the password strength is displayed below the generated password, including estimated crack times.

---

## Dashboard

The interactive security dashboard provides an overview of your password security posture.

### Accessing the Dashboard

Click **Dashboard** in the navigation bar (requires login).

### Dashboard Sections

#### Security Score Gauge

A radial gauge showing your overall security score (0-100), calculated from:
- Average password strength of recent checks
- Account security status
- Password diversity

#### Strength Distribution

A bar chart showing how many of your checked passwords fall into each strength level (Very Weak through Very Strong).

#### Recent Activity

A table of your most recent password strength checks, showing:
- Date and time
- Strength label
- Entropy score

#### Security Status

A checklist of security indicators:
- Account is active
- No failed login attempts
- Email verified
- Strong password in use

#### Login History

A table of your recent login attempts showing:
- Date and time
- IP address
- Browser/OS (from user agent)
- Success or failure status

### CSV Export

Click **Export CSV** to download your password check history as a spreadsheet-compatible file.

---

## Password History

View all past password strength checks.

1. Navigate to **History** from the navigation bar.
2. Browse the table of past checks.
3. Use the **search bar** to filter by password label or strength.
4. Click **Export** to download as CSV.

---

## Account Settings

### Update Profile

1. Click your username in the navigation bar.
2. Select **Profile**.
3. Update your first name, last name, or username.
4. Click **Save Changes**.

### Change Password

1. Go to **Profile**.
2. Enter your current password and new password.
3. Click **Update Password**.

### Logout

Click **Logout** in the navigation bar. This invalidates your session and clears the refresh token cookie.

---

## Frequently Asked Questions

### Is my password stored when I check its strength?

**No.** When not logged in, passwords are never stored. When logged in, only the strength analysis results (score, label, entropy, character flags) are saved - never the password itself.

### What makes a password "Very Strong"?

A very strong password typically has:
- 16+ characters
- A mix of uppercase, lowercase, numbers, and symbols
- No dictionary words or common patterns
- High entropy (80+ bits)

### Why was my account locked?

After 5 consecutive failed login attempts, the system automatically locks the account for 15 minutes as a brute-force protection measure. Wait 15 minutes and try again, or reset your password.

### Can I use the password checker without an account?

Yes. The password strength checker and generator are accessible without registration. However, history tracking and the dashboard require an account.

### What is a passphrase?

A passphrase is a sequence of random words separated by a delimiter (e.g., `correct-horse-battery-staple`). Passphrases are both strong (high entropy) and easy to remember.

### Is the password generator truly random?

Yes. The generator uses Node.js `crypto.randomBytes()`, which provides cryptographically secure randomness suitable for security-critical applications.

### Does the system check against leaked passwords?

Not yet. Future versions will integrate with the Have I Been Pwned API to check passwords against known breach databases.

### What browsers are supported?

SentinelPass supports all modern browsers: Chrome 90+, Firefox 90+, Safari 15+, and Edge 90+.
