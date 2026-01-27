# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Steven Cheng's personal portfolio website, expanding into a full-featured Blog and Event Ticketing platform. The
architecture uses a **Next.js Monolith** pattern – a single Next.js application serving as both frontend and backend,
deployed as a unified service on GCP Cloud Run.

**Key Architectural Pattern**: Unlike microservices, all business logic, API routes, and UI components live in the same
Next.js application (`frontend/`). The presentation layer is in `frontend/src/app/` (App Router pages and API routes),
while server-side business logic resides in `frontend/src/server/`.

## Monorepo Structure

This project uses **NPM Workspaces**. Commands often need workspace targeting:

```bash
npm run dev -w frontend          # Run dev server in frontend workspace
npm run test:unit -w frontend    # Run unit tests in frontend workspace
npm run test:bdd -w e2e          # Run BDD tests in e2e workspace
```

**Workspaces:**

- `frontend/` - Next.js Monolith (App Router, TypeScript, React 19)
- `e2e/` - Playwright and Cucumber tests

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

## Tool Usage & MCP Integration

**YOU MUST use JetBrains MCP Server (22 tools) and Wallaby MCP Server for ALL interactions with the codebase.** These
are not optional preferences — they are mandatory. Only fall back to Claude Code built-in tools or CLI when MCP tools
are confirmed unavailable (tool calls return errors).

### Core Principles

1. **YOU MUST use JetBrains MCP first** for all file operations, code analysis, refactoring, building, and execution
2. **YOU MUST use Wallaby MCP for test verification** —
   See [Wallaby MCP Test Verification](#wallaby-mcp-test-verification) section below
3. **YOU MUST use `get_project_dependencies` and `get_project_modules` to explore the codebase** — Do NOT rely on
   full-text search (`Grep`, `search_in_files_by_text`) to understand project structure, architecture, or module
   relationships
4. **Never use CLI for file operations** — No `cat`, `head`, `tail`, `sed`, `awk`, `find`, `tree`, `grep`, `rg`
5. **Leverage IDE intelligence** — MCP tools understand code semantics, not just text patterns

### Complete JetBrains MCP Tool Inventory (22 Tools)

All 23 tools are listed below by category. **YOU MUST** be familiar with and use the appropriate tool for each task.

#### Category 1: Project Understanding & Exploration (EXPLORE FIRST)

> **CRITICAL:** When you need to understand the codebase, **start with these structural exploration tools**, NOT
> full-text search. Full-text search (`search_in_files_by_text`, `Grep`) finds occurrences of strings — it does NOT help
> you understand architecture, dependencies, or module boundaries.

| # | Tool                                       | Purpose                                   | When to Use                                                                                  |
|---|--------------------------------------------|-------------------------------------------|----------------------------------------------------------------------------------------------|
| 1 | `mcp__jetbrains__get_project_dependencies` | List all project dependencies (libraries) | **FIRST STEP** when exploring a new codebase or understanding what libraries are available   |
| 2 | `mcp__jetbrains__get_project_modules`      | List all modules with their types         | **FIRST STEP** when understanding project structure, workspace layout, and module boundaries |
| 3 | `mcp__jetbrains__get_repositories`         | List all VCS roots                        | Understanding multi-repo structure                                                           |
| 4 | `mcp__jetbrains__list_directory_tree`      | Directory tree (like `tree`)              | Exploring folder structure at any depth                                                      |

```typescript
// ✅ CORRECT: Understanding the codebase (do this FIRST)
// Step 1: What modules exist?
mcp__jetbrains__get_project_modules({
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// Step 2: What dependencies are installed?
mcp__jetbrains__get_project_dependencies({
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// Step 3: Explore directory structure
mcp__jetbrains__list_directory_tree({
    directoryPath: 'frontend/src/server',
    maxDepth: 3,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// ❌ WRONG: Using grep/search to "understand" the codebase
Grep({pattern: 'import.*from', path: 'frontend/src'});  // This finds strings, not structure
Bash({command: 'tree frontend/src'});
```

#### Category 2: File Discovery

| # | Tool                                         | Purpose                                              | When to Use                                           |
|---|----------------------------------------------|------------------------------------------------------|-------------------------------------------------------|
| 5 | `mcp__jetbrains__find_files_by_name_keyword` | Find files by name substring (IDE index, ultra-fast) | **Preferred** — when you know part of the filename    |
| 6 | `mcp__jetbrains__find_files_by_glob`         | Find files by glob pattern                           | When you need pattern matching (e.g., `**/*.test.ts`) |

```typescript
// ✅ CORRECT
mcp__jetbrains__find_files_by_name_keyword({nameKeyword: 'order', projectPath: '...'});
mcp__jetbrains__find_files_by_glob({globPattern: '**/__tests__/**/*.test.ts', projectPath: '...'});

// ❌ WRONG
Bash({command: 'find . -name "*.test.ts"'});
Glob({pattern: '**/*.test.ts'});  // Only as fallback
```

#### Category 3: File Reading & Writing

| #  | Tool                                    | Purpose                                   | When to Use                                         |
|----|-----------------------------------------|-------------------------------------------|-----------------------------------------------------|
| 7  | `mcp__jetbrains__get_file_text_by_path` | Read file content with truncation control | Reading any source file                             |
| 8  | `mcp__jetbrains__create_new_file`       | Create new file (with parent dirs)        | Creating new source/test files                      |
| 9  | `mcp__jetbrains__replace_text_in_file`  | Find and replace text in file             | Text-only changes (comments, strings, log messages) |
| 10 | `mcp__jetbrains__open_file_in_editor`   | Open file in IDE editor                   | Directing developer's attention to a file           |

```typescript
// ✅ CORRECT
mcp__jetbrains__get_file_text_by_path({pathInProject: 'frontend/src/server/services/event.ts', projectPath: '...'});
mcp__jetbrains__create_new_file({
    pathInProject: 'frontend/src/server/services/payment.ts',
    text: '...',
    projectPath: '...'
});

// ❌ WRONG
Read({file_path: '/Users/.../event.ts'});  // Only as fallback
Bash({command: 'cat frontend/src/server/services/event.ts'});
```

#### Category 4: Code Intelligence & Refactoring

| #  | Tool                                       | Purpose                                      | When to Use                                                          |
|----|--------------------------------------------|----------------------------------------------|----------------------------------------------------------------------|
| 11 | `mcp__jetbrains__get_symbol_info`          | Symbol documentation, type info, declaration | Understanding what a function/variable does, finding its declaration |
| 12 | `mcp__jetbrains__rename_refactoring`       | Rename symbol across entire project          | Renaming variables, functions, classes (updates ALL references)      |
| 13 | `mcp__jetbrains__search_in_files_by_text`  | Text search using IDE index                  | Finding specific usages of a known symbol/string                     |
| 14 | `mcp__jetbrains__search_in_files_by_regex` | Regex search using IDE index                 | Finding patterns in code                                             |

```typescript
// ✅ CORRECT: Understanding a symbol
mcp__jetbrains__get_symbol_info({
    filePath: 'frontend/src/server/services/event.ts',
    line: 10, column: 20,
    projectPath: '...'
});

// ✅ CORRECT: Renaming (updates ALL references across project)
mcp__jetbrains__rename_refactoring({
    pathInProject: 'frontend/src/server/services/event.ts',
    symbolName: 'processOrder', newName: 'createOrder',
    projectPath: '...'
});

// ❌ WRONG: Using replace_text for code symbols (misses cross-file references)
mcp__jetbrains__replace_text_in_file({oldText: 'processOrder', newText: 'createOrder', replaceAll: true});
```

#### Category 5: Code Quality & Building

| #  | Tool                                | Purpose                              | When to Use                                          |
|----|-------------------------------------|--------------------------------------|------------------------------------------------------|
| 15 | `mcp__jetbrains__get_file_problems` | Run IDE inspections on a file        | After editing a file — check for errors and warnings |
| 16 | `mcp__jetbrains__reformat_file`     | Format file per project code style   | After editing — apply consistent formatting          |
| 17 | `mcp__jetbrains__build_project`     | Trigger project build, return errors | After edits — validate compilation and type checking |

```typescript
// ✅ CORRECT: Post-edit validation workflow
// 1. Check problems
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/server/services/event.ts',
    errorsOnly: false,
    projectPath: '...'
});
// 2. Format
mcp__jetbrains__reformat_file({path: 'frontend/src/server/services/event.ts', projectPath: '...'});
// 3. Build to verify types
mcp__jetbrains__build_project({projectPath: '...'});

// ❌ WRONG
Bash({command: 'prettier --write ...'});
Bash({command: 'eslint --fix ...'});
Bash({command: 'npm run build -w frontend'});  // Only as fallback
```

**Post-edit Rule**: After editing any file, run `get_file_problems` with `errorsOnly: false` on that file and YOU MUST fix ALL reported errors and warnings before proceeding.

#### Category 6: Execution & Run Configurations

| #  | Tool                                        | Purpose                           | When to Use                                                     |
|----|---------------------------------------------|-----------------------------------|-----------------------------------------------------------------|
| 18 | `mcp__jetbrains__get_run_configurations`    | List all IDE run configurations   | Discovering available run/debug configs                         |
| 19 | `mcp__jetbrains__execute_run_configuration` | Execute a specific run config     | Running tasks defined in IDE (dev server, specific tests, etc.) |
| 20 | `mcp__jetbrains__execute_terminal_command`  | Run shell command in IDE terminal | When no other MCP tool fits and CLI is truly needed             |

```typescript
// ✅ CORRECT: Use run configurations when available
mcp__jetbrains__get_run_configurations({projectPath: '...'});
mcp__jetbrains__execute_run_configuration({configurationName: 'dev', projectPath: '...'});

// For CLI-only operations (git, npm scripts without IDE config)
mcp__jetbrains__execute_terminal_command({command: 'npm run lint -w frontend', projectPath: '...'});
```

#### Category 7: Jupyter Notebooks

| #  | Tool                              | Purpose                          | When to Use                   |
|----|-----------------------------------|----------------------------------|-------------------------------|
| 21 | `mcp__jetbrains__runNotebookCell` | Execute Jupyter notebook cell(s) | Running notebook cells in IDE |

#### Category 8: System

| #  | Tool                                | Purpose                   | When to Use                                    |
|----|-------------------------------------|---------------------------|------------------------------------------------|
| 22 | `mcp__jetbrains__permission_prompt` | Handle permission prompts | When tool execution requires user confirmation |

### Tool Priority Matrix (Quick Reference)

| Task                             | Priority 1 (YOU MUST Use)                          | Priority 2 (Fallback)        | Never Use                        |
|----------------------------------|----------------------------------------------------|------------------------------|----------------------------------|
| **Understand project structure** | `get_project_modules` + `get_project_dependencies` | `list_directory_tree`        | `Grep`, `grep`, full-text search |
| **List directory structure**     | `list_directory_tree`                              | -                            | `tree`, `ls -R`                  |
| **Find files by name**           | `find_files_by_name_keyword`                       | `find_files_by_glob`, `Glob` | `find`, `ls`                     |
| **Read file content**            | `get_file_text_by_path`                            | `Read`                       | `cat`, `head`, `tail`            |
| **Create new file**              | `create_new_file`                                  | `Write`                      | `echo >`, `cat <<EOF`            |
| **Replace text**                 | `replace_text_in_file`                             | `Edit`                       | `sed`, `awk`                     |
| **Rename symbols**               | `rename_refactoring`                               | -                            | `replace_text_in_file`, `sed`    |
| **Search code**                  | `search_in_files_by_text`                          | `Grep`                       | `grep`, `rg`                     |
| **Search by regex**              | `search_in_files_by_regex`                         | `Grep`                       | `grep -E`, `rg`                  |
| **Get symbol info**              | `get_symbol_info`                                  | -                            | Manual lookup                    |
| **Check file problems**          | `get_file_problems`                                | -                            | `tsc`, `eslint`                  |
| **Format code**                  | `reformat_file`                                    | -                            | `prettier`, `eslint --fix`       |
| **Build project**                | `build_project`                                    | `Bash(npm run build)`        | -                                |
| **Run/verify unit tests**        | `mcp__wallaby__wallaby_*`                          | -                            | `npm run test:unit`, `vitest`    |
| **Debug test values**            | `mcp__wallaby__wallaby_runtimeValues`              | -                            | `console.log`                    |
| **Check test coverage**          | `mcp__wallaby__wallaby_coveredLinesForFile`        | -                            | `vitest --coverage`              |

### Codebase Exploration Workflow (YOU MUST Follow)

When entering a new session or exploring unfamiliar parts of the codebase:

```
Step 1: get_project_modules        → Understand workspace/module layout
Step 2: get_project_dependencies   → Know what libraries are available
Step 3: get_repositories           → Understand VCS structure
Step 4: list_directory_tree        → Drill into specific directories
Step 5: get_file_text_by_path      → Read specific files of interest
Step 6: get_symbol_info            → Understand specific symbols/APIs
```

**Antipattern:** Do NOT jump straight to `search_in_files_by_text` or `Grep` to understand what the codebase does.
These tools find string matches — they do not explain architecture, module boundaries, or dependency relationships.

### Project-Specific Configuration

**Project Path** — Always included in ALL MCP tool calls:

```typescript
projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
```

**Workspace Awareness**:

- This is an NPM Workspaces monorepo
- File paths are relative to the project root
- Main workspaces: `frontend/`, `e2e/`

### Common Workflows

**Refactoring Loop** (TDD Refactor Phase):

```typescript
// 1. Check problems
mcp__jetbrains__get_file_problems({filePath: file, errorsOnly: false, projectPath: '...'});
// 2. Fix issues (repeat until clean)
// 3. Rename symbols if needed
mcp__jetbrains__rename_refactoring({
    pathInProject: file,
    symbolName: 'oldName',
    newName: 'newName',
    projectPath: '...'
});
// 4. Format code
mcp__jetbrains__reformat_file({path: file, projectPath: '...'});
// 5. Build to verify
mcp__jetbrains__build_project({projectPath: '...'});
// 6. Verify tests pass (use Wallaby MCP)
mcp__wallaby__wallaby_failingTests();
```

**Symbol Exploration**:

```typescript
// 1. Get symbol info (type, docs, declaration)
mcp__jetbrains__get_symbol_info({filePath: file, line: 42, column: 10, projectPath: '...'});
// 2. Find all usages
mcp__jetbrains__search_in_files_by_text({searchText: 'createOrder', fileMask: '*.ts', projectPath: '...'});
```

## Wallaby MCP Test Verification

This project **mandates Wallaby MCP tools** for all test execution and verification during development. Wallaby provides
instant, continuous test feedback through the IDE — **never run tests via CLI** (`npm run test:unit`, `vitest`,
`cd frontend && npm run test:unit`) when Wallaby MCP is available.

### Ensuring Wallaby Is Running (YOU MUST)

Before using any `mcp__wallaby__wallaby_*` tool, **YOU MUST** confirm Wallaby is running. If a Wallaby MCP tool call
returns an error (e.g., connection refused, not available), follow this mandatory startup sequence:

```typescript
// Step 1: Find the Wallaby run configuration
mcp__jetbrains__get_run_configurations({
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
// Look for a configuration with "Wallaby" in its name

// Step 2: Start Wallaby via the run configuration
mcp__jetbrains__execute_run_configuration({
    configurationName: '<Wallaby config name from Step 1>',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

// Step 3: Retry the Wallaby MCP tool call
mcp__wallaby__wallaby_failingTests();
```

**DO NOT** skip Wallaby and fall back to CLI tests (`npm run test:unit`) without first attempting to start Wallaby
through the above steps. CLI is only acceptable after confirming Wallaby cannot be started.

### Why Wallaby MCP Over CLI

| Aspect          | Wallaby MCP                           | CLI (`npm run test:unit`) |
|-----------------|---------------------------------------|---------------------------|
| **Speed**       | Instant (only re-runs affected tests) | Full suite every time     |
| **Feedback**    | Per-line coverage + runtime values    | Terminal output only      |
| **Context**     | Knows which tests cover which lines   | No mapping                |
| **Integration** | IDE inline annotations                | Separate terminal window  |

### Mandatory Wallaby MCP Tools

| Task                             | Wallaby MCP Tool                                   | Never Use                                    |
|----------------------------------|----------------------------------------------------|----------------------------------------------|
| **Check all failing tests**      | `mcp__wallaby__wallaby_failingTests`               | `npm run test:unit`, `vitest`                |
| **Check all tests status**       | `mcp__wallaby__wallaby_allTests`                   | `npm run test:unit -- --reporter=verbose`    |
| **Get failing tests for a file** | `mcp__wallaby__wallaby_failingTestsForFile`        | `vitest run <file>`                          |
| **Get all tests for a file**     | `mcp__wallaby__wallaby_allTestsForFile`            | `cd frontend && npm run test:unit -- <file>` |
| **Get tests at specific line**   | `mcp__wallaby__wallaby_allTestsForFileAndLine`     | Manual search                                |
| **Get failing tests at line**    | `mcp__wallaby__wallaby_failingTestsForFileAndLine` | Manual search                                |
| **Get test by ID**               | `mcp__wallaby__wallaby_testById`                   | -                                            |
| **Get runtime values**           | `mcp__wallaby__wallaby_runtimeValues`              | `console.log` debugging                      |
| **Get runtime values by test**   | `mcp__wallaby__wallaby_runtimeValuesByTest`        | `console.log` debugging                      |
| **Check code coverage**          | `mcp__wallaby__wallaby_coveredLinesForFile`        | `vitest --coverage`                          |
| **Check test coverage**          | `mcp__wallaby__wallaby_coveredLinesForTest`        | -                                            |
| **Update snapshots**             | `mcp__wallaby__wallaby_updateTestSnapshots`        | `vitest -u`                                  |
| **Update file snapshots**        | `mcp__wallaby__wallaby_updateFileSnapshots`        | `vitest -u <file>`                           |
| **Update all snapshots**         | `mcp__wallaby__wallaby_updateProjectSnapshots`     | `vitest -u`                                  |

### TDD Workflow with Wallaby MCP

During the Red-Green-Refactor cycle, use Wallaby MCP at every phase:

#### Red Phase (Write failing test)

```typescript
// 1. Write the failing test in the test file

// 2. Verify the test fails (MUST use Wallaby, NOT CLI)
mcp__wallaby__wallaby_failingTestsForFile({
    file: 'frontend/src/server/services/__tests__/event.test.ts'
});

// 3. Confirm the specific test is in the failing list
// Look for your new test name in the response
```

#### Green Phase (Make test pass)

```typescript
// 1. Write minimal implementation

// 2. Verify the test passes (MUST use Wallaby, NOT CLI)
mcp__wallaby__wallaby_failingTestsForFile({
    file: 'frontend/src/server/services/__tests__/event.test.ts'
});
// Expected: your test should NO LONGER appear in failing tests

// 3. Alternatively, check all tests for the file
mcp__wallaby__wallaby_allTestsForFile({
    file: 'frontend/src/server/services/__tests__/event.test.ts'
});
// Expected: all tests show as passing
```

#### Refactor Phase (Improve code)

```typescript
// 1. Refactor the code

// 2. Verify no regressions (MUST use Wallaby, NOT CLI)
mcp__wallaby__wallaby_failingTests();
// Expected: no failing tests in entire project

// 3. Check coverage hasn't dropped
mcp__wallaby__wallaby_coveredLinesForFile({
    file: 'frontend/src/server/services/event.ts'
});
```

#### Debugging with Runtime Values

```typescript
// Instead of adding console.log, use Wallaby runtime values:
mcp__wallaby__wallaby_runtimeValues({
    file: 'frontend/src/server/services/event.ts',
    line: 42,
    lineContent: '    const totalAllocated = existingAllocated + (input.allocation || 0);',
    expression: 'totalAllocated'
});

// For a specific test:
mcp__wallaby__wallaby_runtimeValuesByTest({
    file: 'frontend/src/server/services/event.ts',
    line: 42,
    expression: 'totalAllocated',
    testId: '<test-id-from-previous-wallaby-call>'
});
```

### Pre-Commit Verification

Before every `git commit`, **always** run:

```typescript
// ✅ CORRECT: Use Wallaby to verify all tests pass
mcp__wallaby__wallaby_failingTests();
// Expected: empty failing tests list

// ❌ WRONG: Running CLI tests
Bash({command: 'cd frontend && npm run test:unit'});
```

### When CLI Test Execution Is Acceptable

CLI test commands (`npm run test:unit`, `npm run test:bdd`, `npm run test:e2e`) are **only** acceptable in these
situations:

- **CI/CD pipelines** (no IDE available)
- **BDD/E2E tests** (Wallaby covers unit tests only; Playwright/Cucumber tests still use CLI)
- **Wallaby MCP is confirmed unavailable** (tool calls return errors)

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
- **Never** use Owner/Editor roles – follow the Principle of Least Privilege (PoLP)
- **Never** make Cloud Storage buckets public (allUsers/allAuthenticatedUsers)
- **Never** hardcode GCP Project ID or region - inject via environment variables
- **Never** use `:latest` tags in production - use versioned tags or SHA hashes
- **Never** perform "ClickOps" (manual GCP Console changes) – all infrastructure changes via Terraform

### Testing Rules

- **Never** make real network requests in unit tests (mock all HTTP calls)
- **Never** test React internal state in integration tests (test behavior, not implementation)
- **Never** delete failing tests to bypass pre-commit hooks
- **Never** use production data in E2E tests
- **Never** edit pre-commit and pre-push hooks

### CI/CD

- **Never** bypass CI checks before merging to the main branch
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
- No period at the end of the description
- Use imperative mood (add, change, fix – not added, changed, fixed)
- Max header length: 100 characters

**Examples**:

```
feat(events): add ticket inventory tracking
fix(auth): resolve login redirect loop
docs(readme): update database migration notes
```

## Deployment Architecture

**GCP Infrastructure** (managed via Terraform in `infra/`):

- **Cloud Run**: Serverless deployment of containerized Next.js app (port 3000)
- **Artifact Registry**: Docker image storage
- **Secret Manager**: Stores DATABASE_URL for Neon PostgreSQL
- **Workload Identity Federation**: Secure GitHub Actions → GCP authentication (no static Service Account keys)

**Next.js Configuration**: `output: "standalone"` for optimized Docker builds

