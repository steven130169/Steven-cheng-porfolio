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

## Tool Usage & JetBrains MCP Integration

This project **mandates JetBrains MCP tools** for all file operations, code analysis, and refactoring tasks. These tools leverage the IDE's indexing and static analysis engine, providing superior performance and accuracy compared to CLI commands.

### Core Principles

1. **Always use JetBrains MCP first** - Only fall back to Claude Code built-in tools or CLI when MCP tools are unavailable
2. **Never use CLI for file operations** - Violates Claude Code best practices and wastes resources
3. **Leverage IDE intelligence** - MCP tools understand code semantics, not just text patterns

### Tool Priority Matrix

| Task | Priority 1 (Use First) | Priority 2 (Fallback) | Never Use |
|------|----------------------|---------------------|-----------|
| **List directory structure** | `mcp__jetbrains__list_directory_tree` | - | `tree`, `ls -R` |
| **Find files by pattern** | `mcp__jetbrains__find_files_by_glob` | `Glob` | `find` |
| **Find files by name** | `mcp__jetbrains__find_files_by_name_keyword` | - | `find`, `ls` |
| **Read file content** | `mcp__jetbrains__get_file_text_by_path` | `Read` | `cat`, `head`, `tail` |
| **Create new file** | `mcp__jetbrains__create_new_file` | `Write` | `echo >`, `cat <<EOF` |
| **Replace text** | `mcp__jetbrains__replace_text_in_file` | `Edit` | `sed`, `awk` |
| **Rename symbols** | `mcp__jetbrains__rename_refactoring` | - | `replace_text_in_file`, `sed` |
| **Search code** | `mcp__jetbrains__search_in_files_by_text` | `Grep` | `grep`, `rg` |
| **Search by regex** | `mcp__jetbrains__search_in_files_by_regex` | `Grep` | `grep -E`, `rg` |
| **Get symbol info** | `mcp__jetbrains__get_symbol_info` | - | Manual documentation lookup |
| **Check file problems** | `mcp__jetbrains__get_file_problems` | - | `tsc`, `eslint` directly |
| **Format code** | `mcp__jetbrains__reformat_file` | - | `prettier`, `eslint --fix` |

### When to Use Each Tool

#### Project Navigation
```typescript
// ✅ CORRECT: Explore directory structure
mcp__jetbrains__list_directory_tree({
    directoryPath: 'frontend/src/server',
    maxDepth: 3,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Find files by pattern
mcp__jetbrains__find_files_by_glob({
    globPattern: '**/__tests__/**/*.test.ts',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Find files by name (ultra-fast, uses IDE index)
mcp__jetbrains__find_files_by_name_keyword({
    nameKeyword: 'order',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ❌ WRONG: Using CLI
Bash({ command: 'tree frontend/src/server' });
Bash({ command: 'find . -name "*.test.ts"' });
```

#### File Operations
```typescript
// ✅ CORRECT: Read file with truncation control
mcp__jetbrains__get_file_text_by_path({
    pathInProject: 'frontend/src/server/services/order.ts',
    maxLinesCount: 100,
    truncateMode: 'MIDDLE',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Create new file with safety
mcp__jetbrains__create_new_file({
    pathInProject: 'frontend/src/server/services/payment.ts',
    text: 'export function processPayment() { ... }',
    overwrite: false,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ❌ WRONG: Using CLI
Bash({ command: 'cat frontend/src/server/services/order.ts' });
Bash({ command: 'echo "export function..." > payment.ts' });
```

#### Code Modification

**Text Modification vs Code Refactoring**:

| Operation Type | Tool | Use Cases |
|---------------|------|-----------|
| **Text-only changes** | `replace_text_in_file` | Log messages, comments, JSDoc, string literals |
| **Code refactoring** | `rename_refactoring` | Variable names, function names, class names |

```typescript
// ✅ CORRECT: Text modification (comments, strings)
mcp__jetbrains__replace_text_in_file({
    pathInProject: 'frontend/src/server/services/order.ts',
    oldText: 'console.log("Order created")',
    newText: 'console.log("Order created successfully")',
    replaceAll: true,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Symbol refactoring (updates ALL references across project)
mcp__jetbrains__rename_refactoring({
    pathInProject: 'frontend/src/server/services/order.ts',
    symbolName: 'processOrder',
    newName: 'createOrder',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ❌ WRONG: Using replace_text for code symbols (misses cross-file references)
mcp__jetbrains__replace_text_in_file({
    pathInProject: 'frontend/src/server/services/order.ts',
    oldText: 'processOrder',
    newText: 'createOrder',
    replaceAll: true  // Only replaces in ONE file, breaks code!
});
```

#### Code Search & Analysis
```typescript
// ✅ CORRECT: Search using IDE index (10x faster)
mcp__jetbrains__search_in_files_by_text({
    searchText: 'createOrder',
    caseSensitive: true,
    fileMask: '*.ts',
    directoryToSearch: 'frontend/src',
    maxUsageCount: 50,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Regex search with context highlighting
mcp__jetbrains__search_in_files_by_regex({
    regexPattern: 'function\\s+\\w+Order',
    caseSensitive: false,
    fileMask: '*.ts',
    maxUsageCount: 100,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Get symbol documentation (like Cmd+J in IDE)
mcp__jetbrains__get_symbol_info({
    filePath: 'frontend/src/server/services/order.ts',
    line: 42,
    column: 10,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ❌ WRONG: Using CLI grep
Bash({ command: 'grep -r "createOrder" frontend/src' });
```

#### Code Quality & Refactoring
```typescript
// ✅ CORRECT: Check file problems (errors + warnings)
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/server/services/order.ts',
    errorsOnly: false,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ✅ CORRECT: Format file according to project style
mcp__jetbrains__reformat_file({
    path: 'frontend/src/server/services/order.ts',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ❌ WRONG: Running formatters directly
Bash({ command: 'prettier --write frontend/src/server/services/order.ts' });
Bash({ command: 'eslint --fix frontend/src/server/services/order.ts' });
```

### Project-Specific Configuration

**Project Path**: Always include in MCP tool calls:
```typescript
projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
```

**Workspace Awareness**:
- This is an NPM Workspaces monorepo
- File paths are relative to project root
- Main workspaces: `frontend/`, `e2e/`

### Performance Guidelines

**JetBrains MCP Performance Advantages**:
- `find_files_by_name_keyword`: ~50ms (IDE index) vs ~500ms (CLI find)
- `search_in_files_by_text`: ~100ms (IDE index) vs ~800ms (grep)
- Automatic exclusion of `node_modules/`, `.git/`, `.next/` (no manual filtering needed)

### Common Workflows

**Refactoring Loop** (TDD Refactor Phase):
```typescript
// 1. Check problems
const problems = await mcp__jetbrains__get_file_problems(file, false);

// 2. Fix issues (repeat until clean)
while (problems.problems.length > 0) {
    // Fix each problem...
    problems = await mcp__jetbrains__get_file_problems(file, false);
}

// 3. Rename symbols if needed
await mcp__jetbrains__rename_refactoring(file, 'oldName', 'newName');

// 4. Format code
await mcp__jetbrains__reformat_file(file);

// 5. Verify with ESLint
Bash({ command: 'npm run lint -w frontend' });
```

**Symbol Exploration**:
```typescript
// 1. Search for symbol usage
const usage = await mcp__jetbrains__search_in_files_by_text({
    searchText: 'createOrder',
    fileMask: '*.ts',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// 2. Get detailed documentation
const info = await mcp__jetbrains__get_symbol_info({
    filePath: 'frontend/src/server/services/order.ts',
    line: 42,
    column: 10,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

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
