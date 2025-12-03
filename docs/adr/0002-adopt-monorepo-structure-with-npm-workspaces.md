# 2. Adopt Monorepo Structure with NPM Workspaces

* Status: Accepted
* Date: 2025-12-03
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
We initially had a single Frontend project. We decided to add a Backend service. We needed a way to manage both projects in a single repository to facilitate code sharing (types, configs), unified versioning, and streamlined CI/CD, without the complexity of separate repositories.

## Decision Drivers
* Need to manage multiple related projects (Frontend, Backend).
* Desire to share development dependencies (ESLint, Prettier, TypeScript configs).
* Need for a lightweight solution without heavy tooling (like Nx or Turborepo) initially.

## Considered Options
* Separate repositories (Polyrepo).
* Monorepo with Lerna.
* Monorepo with Nx / Turborepo.
* Monorepo with native NPM Workspaces.

## Decision Outcome
Chosen option: "Monorepo with native NPM Workspaces", because:
1.  It is built into NPM, requiring no external tools.
2.  It sufficiently handles dependency hoisting to the root `node_modules`.
3.  It allows us to run commands in specific workspaces (`npm run script -w workspace`).
4.  It is simple enough for our current scale but allows migration to Nx/Turbo later if needed.

## Consequences
* Good, because we save disk space by deduplicating dependencies.
* Good, because we can enforce consistent tooling versions across Frontend and Backend.
* Bad, because `package.json` scripts become slightly more complex (need `-w` flags).
* Bad, because we need to be careful about "phantom dependencies" (accessing hoisted packages not explicitly declared).
