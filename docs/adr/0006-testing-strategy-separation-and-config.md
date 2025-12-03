# 6. Testing Strategy Separation and Cucumber Configuration

Date: 2025-12-03

## Status

Accepted

## Context

The project currently utilizes both **Cucumber (BDD)** and **Playwright (Native)** for End-to-End (E2E) testing. Without a clear distinction in responsibilities, this dual setup can lead to test duplication, ambiguous maintenance boundaries, and inefficient execution.

Additionally, we encountered configuration issues with `cucumber.js` regarding ECMAScript Modules (ESM) vs. CommonJS resolution when running tests via `ts-node`.

## Decision

### 1. Separation of Testing Responsibilities

We will adopt a "Dual-Track" testing strategy:

*   **BDD (Cucumber/Gherkin)**:
    *   **Focus**: Business Acceptance, User Journeys, and Living Documentation.
    *   **Scope**: "Happy paths" of user stories, critical business rules, and acceptance criteria.
    *   **Format**: `.feature` files using Given/When/Then syntax.
    *   **Goal**: Validate that we are "building the right thing".

*   **Playwright Native (`.spec.ts`)**:
    *   **Focus**: Engineering Health, Smoke Testing, and Technical Verification.
    *   **Scope**: Smoke tests (app load, navigation), UI/UX interaction details, edge cases, and visual regression.
    *   **Format**: TypeScript `.spec.ts` files.
    *   **Goal**: Validate that we are "building the thing right" (system stability).

### 2. Cucumber Configuration Format

We will use **`cucumber.json`** instead of `cucumber.js` for configuring Cucumber-js.

*   **Reason**: To avoid complexity and conflicts arising from Node.js module resolution (ESM vs CJS) when the project relies on `ts-node`. A static JSON file is more robust and sufficient for our configuration needs (paths, imports, loaders).
*   **Location**: The configuration file shall reside in the specific workspace (e.g., `e2e/cucumber.json`) to support IDE integration and monorepo structure.

## Consequences

*   **Pros**:
    *   Clearer intent for each test type.
    *   Reduced duplication of test logic.
    *   Better collaboration with non-technical stakeholders via BDD.
    *   Simplified and more stable configuration for the test runner.
*   **Cons**:
    *   Requires discipline to maintain two separate testing contexts.
    *   Developers must decide where a new test belongs based on the defined criteria.
