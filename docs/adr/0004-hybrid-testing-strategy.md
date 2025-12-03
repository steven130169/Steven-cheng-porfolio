# 4. Hybrid Testing Strategy (Vitest for Frontend, Jest for Backend)

* Status: Accepted
* Date: 2025-12-03
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
In our Monorepo, we have a React Frontend (using Vite) and a NestJS Backend. We need to decide on a testing strategy. Should we unify the test runner (e.g., use Vitest for everything) or use the default tools for each framework?

## Decision Drivers
* **Frontend**: Vite projects work best with Vitest (same config, fast watch mode, ESM support).
* **Backend**: NestJS projects generate code configured for Jest by default.
* **E2E**: Need a tool that tests the application as a black box.

## Considered Options
* **Unified Vitest**: Migrate NestJS to use Vitest.
* **Unified Jest**: Migrate Vite/React to use Jest.
* **Hybrid Strategy**: Use Vitest for Frontend, Jest for Backend, Playwright for E2E.

## Decision Outcome
Chosen option: "Hybrid Strategy", because:
1.  **Frontend**: Vitest is the native choice for Vite. Using Jest with Vite requires complex configuration/transforms (Babel/ts-jest) which slows down tests.
2.  **Backend**: NestJS comes with Jest pre-configured. Migrating to Vitest is possible but requires changing the standard NestJS templates and might break some NestJS testing utilities that rely on Jest globals.
3.  **E2E**: Playwright + Cucumber is chosen for behavior-driven end-to-end testing at the root level.

## Consequences
* Good, because we use the "best tool for the job" in each workspace.
* Good, because we avoid fighting against framework defaults (NestJS+Jest, Vite+Vitest).
* Bad, because we have two different unit test runners to maintain (though their APIs are compatible).
* Bad, because developers need to know both `vitest` and `jest` commands (mitigated by npm scripts aliases).
