# SentinelPass - Password Strength Checker & Secure Generation Frontend

SentinelPass is a premium, enterprise-grade web application built to evaluate, generate, and monitor credential security. Modeled on NIST SP 800-63B standards and OWASP credential handling guidelines, the system ensures user credentials remain secure against advanced threat profiles.

## Technical Architecture Stack

- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, custom glassmorphism patterns, HSL dark/light themes
- **Routing**: React Router DOM (with route auth guards, lazy loading, and suspense skeletons)
- **Forms**: React Hook Form, Zod schema validations (with live checklists)
- **State Management**: TanStack Query (React Query) & Zustand (with persistent stores)
- **Animations**: Framer Motion (for page transitions, tab toggles, and sliders)
- **Icons**: Lucide React
- **Visualizations**: Interactive SVG Gauge & Distribution charts (built natively for perfect accessibility and zero compiler dependency issues)

## Features Included

1. **Security-Centric Landing Page**: Premium cybersecurity themes, live statistics counter widgets, detailed FAQs, and benefits listings.
2. **Interactive Password Strength Checker**: Logs entropy variables (bits), character breakdowns, passphrase alerts, and estimated brute-force crack times (Online, Offline GPU, and Supercomputers).
3. **Secure Password Generator**: Supports customizable length parameters (8-64), character exclusions, and a readable Passphrase Mode.
4. **Interactive Security Dashboard**: Gauge widgets, security status checks, login session audits, and horizontal distribution bars.
5. **Session Auditing**: Session logs showing browser agents and IP addresses.
6. **Data Logs & Export**: Historical table of checked passwords with CSV file export capabilities and text filtering.
7. **Offline Synchronized Mocking**: All services fallback automatically to dynamic calculations if the API server is unreachable, persisting histories in local storage.

## Installation & Running Locally

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Install Client Dependencies

Navigate to the `client` directory and install the necessary npm packages:

```bash
cd client
npm install
```

### 2. Run the Development Server

Start the Vite hot-reloading dev server:

```bash
npm run dev
```

The web client will load at `http://localhost:5173`.

### 3. Build for Production

Compile typescript files and bundle the client assets for distribution:

```bash
npm run build
```

Production builds are compiled to the `client/dist` directory.
