# ADR 0009: Adopt GitHub Actions and Safe Git Flow Strategy

## Status
Accepted

## Context
The project is currently developed by a single senior architect (User) assisted by an AI agent (Gemini).
1.  **Infrastructure**: The project is a Monorepo (Frontend/Backend/E2E) targeted for GCP.
2.  **Team Topology**: Single developer + AI Agent.
3.  **Safety Concerns**: The user requires protection against the AI agent making unauthorized or breaking changes to the `main` branch.
4.  **Requirements**:
    *   Automated CI/CD pipelines.
    *   Automated `CHANGELOG.md` generation.
    *   A simple yet disciplined Git Flow.

## Decision

We will adopt **GitHub Actions** as our CI/CD platform and implement a **Protected Feature Branch Workflow** (Simplified GitHub Flow).

### 1. CI/CD Tool: GitHub Actions
*   **Reasoning**: Native integration, free tier sufficiency, monorepo support (via `paths`), and secure integration with GCP (Workload Identity Federation).

### 2. Git Flow Strategy: "Protected Feature Branches" (Single Main Branch)
To ensure safety, stability, and simplicity for a single-developer team, we will adopt a **Trunk-Based Development** approach (Single Main Branch strategy). We will **NOT** use long-lived `develop` or `release` branches.

*   **`main` Branch (The Trunk)**:
    *   **Role**: The single source of truth. It must always be deployable.
    *   **Protection Rule**: Direct pushes are **FORBIDDEN** (even for the Admin/AI).
    *   **Update Method**: Only via Pull Requests (PRs).
    *   **CI Requirement**: PRs must pass all Status Checks (Lint, Test, Build) before merging.

*   **Feature Branches (`feat/*`, `fix/*`, `chore/*`)**:
    *   **Role**: Short-lived development workspaces.
    *   **Workflow**:
        1.  Agent/User checks out a new branch from `main` (e.g., `feat/add-login`).
        2.  Development and Commits happen here.
        3.  Push to origin.
        4.  Open a **Pull Request (PR)** directly to `main`.
        5.  Once merged, the feature branch is deleted.

*   **The "Human-in-the-Loop" Gate**:
    *   The AI can commit to feature branches and open PRs.
    *   **Only the User** reviews and clicks the "Merge" button on GitHub.
    *   This effectively neutralizes the risk of the AI "randomly pushing" to production.

### 3. Automated Changelog & Versioning
*   **Tool**: `release-it` (already installed) with `conventional-changelog`.
*   **Commit Convention**: We strictly follow **Conventional Commits** (e.g., `feat: ...`, `fix: ...`).
    *   `feat`: Minor version bump (1.1.0).
    *   `fix`: Patch version bump (1.0.1).
    *   `BREAKING CHANGE`: Major version bump (2.0.0).
*   **Workflow**:
    *   When a PR merges to `main`, a specific GitHub Action (or manual dispatch) triggers `npm run release`.
    *   This updates `package.json`, generates `CHANGELOG.md`, tags the commit, and pushes back to the repo.

## Consequences
1.  **Setup Required**: We must configure "Branch Protection Rules" in the GitHub Repository settings immediately.
2.  **Discipline**: All commit messages must follow the conventional format (The Agent is instructed to enforce this).
3.  **Safety**: The `main` branch is safe from accidental breakage or rogue AI commits.
4.  **Visibility**: Every change is documented via PRs and the Changelog.

## Implementation Plan
1.  Create `.github/workflows/ci.yml` (CI pipeline).
2.  User manually configures Branch Protection on GitHub.
3.  Create `.github/workflows/release.yml` (Automated release/changelog).
