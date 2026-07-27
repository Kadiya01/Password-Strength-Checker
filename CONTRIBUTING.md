# Contributing to SentinelPass

Thank you for your interest in contributing to SentinelPass! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/Password-Strength-Checker.git
   cd Password-Strength-Checker
   ```
3. **Install** dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. **Configure** environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
5. **Initialize** database:
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
6. **Create** a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New feature | `feature/password-breach-check` |
| `fix/` | Bug fix | `fix/login-redirect-loop` |
| `docs/` | Documentation | `docs/api-examples` |
| `refactor/` | Code restructuring | `refactor/auth-middleware` |
| `test/` | Adding tests | `test/password-generator` |
| `chore/` | Maintenance | `chore/dependency-update` |

### Making Changes

1. **Follow existing code conventions** (see `docs/DEVELOPER_GUIDE.md`).
2. **Write tests** for new functionality.
3. **Keep changes focused** — one feature or fix per PR.
4. **Update documentation** if your change affects the API or user-facing behavior.

### Commit Messages

Use clear, descriptive commit messages:

```
<type>: <short description>

<optional body>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat: add password breach check via Have I Been Pwned API
fix: resolve token refresh race condition
docs: update API endpoint documentation
test: add integration tests for password generator
```

### Running Tests

```bash
# Backend
cd server && npm test

# Frontend
cd client && npx vitest run

# Lint
cd server && npm run lint
cd client && npm run lint
```

All tests must pass and lint must be clean before submitting a PR.

## Pull Request Process

1. **Update** your fork with the latest upstream changes.
2. **Run** the full test suite locally.
3. **Push** your branch to your fork.
4. **Open** a Pull Request against `main`.
5. **Fill out** the PR template completely.
6. **Link** any related issues.

### PR Requirements

- [ ] All CI checks pass (lint, typecheck, tests, build)
- [ ] New functionality includes tests
- [ ] No `console.log` statements
- [ ] No `any` types without justification
- [ ] API changes are documented
- [ ] Database changes include migration files

## Code Style

### TypeScript

- Strict mode enabled
- No `any` types
- Explicit return types on exported functions
- Use `interface` for object shapes

### React

- Functional components only
- Use hooks for state and side effects
- Props interfaces defined in the same file or in `types/`

### CSS

- Use Tailwind CSS utility classes
- No inline styles (except dynamic values)
- Follow the existing design system

## Reporting Issues

### Bug Reports

Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS information
5. Screenshots if applicable

### Feature Requests

Include:
1. Problem statement
2. Proposed solution
3. Alternatives considered
4. Additional context

## Code of Conduct

- Be respectful and inclusive.
- Focus on constructive feedback.
- Assume good intentions.
- Help newcomers feel welcome.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
