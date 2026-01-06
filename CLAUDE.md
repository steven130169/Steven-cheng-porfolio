# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Steven Cheng's personal portfolio website, expanding into a full-featured Blog and Event Ticketing platform. The architecture uses a **Next.js Monolith** pattern - a single Next.js application serving as both frontend and backend, deployed as a unified service on GCP Cloud Run.

**Key Architectural Pattern**: Unlike microservices, all business logic, API routes, and UI components live in the same Next.js application (`frontend/`). The presentation layer is in `frontend/src/app/` (App Router pages and API routes), while server-side business logic resides in `frontend/src/server/`.

## Monorepo Structure

This project uses **NPM Workspaces**. Commands often need workspace targeting:

```bash
npm run dev -w frontend          # Run dev server in frontend workspace
npm run test:unit -w frontend    # Run unit tests in frontend workspace
npm run test:bdd -w e2e          # Run BDD tests in e2e workspace
```

**Workspaces:**
- `frontend/` - Next.js Monolith (App Router, TypeScript, React 19)
- `e2e/` - Playwright + Cucumber tests

## Tech Stack

**Current Stack** (as of v0.6.1):
- **Framework**: Next.js 16.0.7 with App Router
- **Runtime**: Node.js >=24.0.0 (enforced in package.json)
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM 0.45.1
  - **Note**: README.md mentions Firestore, but the project has migrated to PostgreSQL
- **Testing**: Vitest 4.0.15 (unit), Playwright 1.57.0 (E2E), Cucumber via playwright-bdd (BDD)
- **Styling**: Tailwind CSS 4
- **Deployment**: Docker on GCP Cloud Run with standalone output

**Database Schema** (`frontend/src/server/db/schema.ts`):
- `events` - Event listings (id, title, description, slug, timestamps)
- `ticket_types` - Ticket inventory per event (eventId FK, name, price, inventory)
- `orders` - Customer orders (customerEmail, status, totalAmount)

## Development Commands

### Start Development Server
```bash
npm run dev                      # Starts Next.js at http://localhost:3000
npm run start:frontend           # Alternative command
```

### Testing (Three-Tier Strategy)
```bash
npm run test                     # Runs ALL tests sequentially (unit → e2e → bdd)
npm run test:frontend:unit       # Vitest unit tests only
npm run test:e2e                 # Playwright E2E smoke tests
npm run test:bdd                 # Cucumber BDD feature tests
```

**Testing Philosophy**: "Test Behavior, Not Implementation"
- Unit tests use jsdom environment with React Testing Library
- E2E tests run against http://localhost:3000 with auto-started frontend
- BDD tests use Gherkin syntax for business acceptance criteria

**Running Specific Tests**:
```bash
cd frontend && npm run test:unit -- <file-path>           # Single unit test file
cd frontend && npm run test:unit -- --watch               # Watch mode
npm run test:e2e -- --headed                              # E2E with visible browser
npm run test:e2e -- --ui                                  # Playwright UI mode
```

### Build & Quality Checks
```bash
npm run build -w frontend        # Next.js production build (also type checks)
npm run lint -w frontend         # ESLint
```

**Type Checking**: Run `npm run build` - Next.js build performs TypeScript compilation, catching type errors.

## Critical Development Constraints

These constraints are enforced from `.aiassistant/rules/core.md` (the project constitution):

### Security Boundaries
- **Never** commit API keys, .env files, or credentials to Git
- **Never** output PII (Personal Identifiable Information) in logs or error messages
- **Never** concatenate strings for SQL or Shell commands (SQL Injection prevention)
- **Never** hardcode API keys in frontend code
- **Never** import abandoned third-party packages

### TypeScript Strictness
- **Never** use `any` type to bypass TypeScript errors
- **Never** use non-null assertion (`!`) - use Optional Chaining (`?.`) instead
- **Never** use unsafe type assertions (`as`) - use Type Guards or schema validation (Zod/Valibot)
- **Never** ignore `await` or leave Promises unhandled (no dangling Promises)
- **Never** allow circular dependencies or ignore ESLint warnings

### GCP Infrastructure Constraints
- **Never** store Service Account Key JSON in code or Docker images
- **Never** use Owner/Editor roles - follow Principle of Least Privilege (PoLP)
- **Never** make Cloud Storage buckets public (allUsers/allAuthenticatedUsers)
- **Never** hardcode GCP Project ID or region - inject via environment variables
- **Never** use `:latest` tags in production - use versioned tags or SHA hashes
- **Never** perform "ClickOps" (manual GCP Console changes) - all infrastructure changes via Terraform

### Testing Rules
- **Never** make real network requests in unit tests (mock all HTTP calls)
- **Never** test React internal state in integration tests (test behavior, not implementation)
- **Never** delete failing tests to bypass pre-commit hooks
- **Never** use production data in E2E tests

### CI/CD
- **Never** bypass CI checks before merging to main branch
- All infrastructure changes must go through IaC (Terraform)

## Git Commit Conventions

This project enforces **Conventional Commits** via commitlint:

**Format**: `<type>(<scope>): <description>`

**Allowed types** (must be lowercase):
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code formatting (no functional change)
- `refactor` - Code refactor without bug fix or feature
- `perf` - Performance optimization
- `test` - Test additions/updates
- `build` - Build system changes
- `ci` - CI/CD configuration
- `chore` - Other changes (maintenance)
- `revert` - Revert previous commit

**Rules**:
- Type must be lowercase
- Description must be lowercase
- No period at end of description
- Use imperative mood (add, change, fix - not added, changed, fixed)
- Max header length: 100 characters

**Examples**:
```
feat(events): add ticket inventory tracking
fix(auth): resolve login redirect loop
docs(readme): update database migration notes
```

## Architecture Decision Records (ADR)

All major architectural decisions are documented in `docs/adr/`. Review these to understand the "why" behind technical choices:
- ADR-0002: Monorepo structure with NPM Workspaces
- ADR-0004: Hybrid testing strategy (Unit, E2E, BDD)
- ADR-0007: GCP Cloud Run and Firestore selection (now migrated to PostgreSQL)
- ADR-0010: Unified Next.js Monolith architecture
- ADR-0012: Event Ticketing & Commerce Engine strategy

## Deployment Architecture

**GCP Infrastructure** (managed via Terraform in `infra/`):
- **Cloud Run**: Serverless deployment of containerized Next.js app (port 3000)
- **Artifact Registry**: Docker image storage
- **Secret Manager**: Stores DATABASE_URL for Neon PostgreSQL
- **Workload Identity Federation**: Secure GitHub Actions → GCP authentication (no static Service Account keys)

**Next.js Configuration**: `output: "standalone"` for optimized Docker builds

## TDD Workflow

This project follows a **Red-Green-Refactor** cycle:
1. **Red**: Write failing test first (BDD features or unit tests)
2. **Green**: Implement minimum code to pass the test
3. **Refactor**: Improve code while keeping tests green

**Workflow Modes** (via `.claude/skills/`):
- `/feature-start` - Requirements confirmation, technical design, branch creation
- `/develop` - TDD implementation with Red-Green-Refactor loop
- `/stabilize` - Feature completion, integration testing, pre-review checks
- `/debug` - Systematic debugging and issue resolution
- `/repo-review` - Comprehensive code quality and security review
