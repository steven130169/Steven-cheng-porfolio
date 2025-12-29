# Project Guidelines

## Project Overview
This is Steven Cheng's Portfolio and Event Ticketing monorepo. It consists of a frontend application and end-to-end (E2E) tests.

## Tech Stack
- **Frontend**: Next.js / React
- **E2E Testing**: Playwright, Cucumber (BDD)
- **Infrastructure**: Terraform (GCP)
- **Language**: TypeScript
- **Runtime**: Node.js >= 24.0.0

## Core Principles
1. **Constitution**: `.aiassistant/rules/core.md` is the supreme law of the project.
2. **Safety Net First**: Prioritize building a test protection net before adding new features.
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how it's written.
4. **ADR First**: Document architectural decisions in `docs/adr/` before implementation.
5. **Red-Green-Refactor**: Follow TDD/BDD practices.
6. **No Fake Passes**: Never delete or ignore failed tests to bypass checks.
7. **Clean Types**: Avoid using `any` in TypeScript.

## Communication
- **Primary Language**: Traditional Chinese (Taiwan) / 繁體中文（台灣）.
- **Tone**: Professional, technical, and collaborative (Refactoring Partner).

## Development Workflow
1. Requirements Analysis.
2. System Design (ADRs & Gherkin Specs).
3. Implementation (BDD Steps -> Coding & Unit Tests).
4. Testing (E2E / BDD).
5. Deployment (CI/CD).

## Repository Structure
- `frontend/`: Next.js application.
- `e2e/`: Playwright and Cucumber tests.
- `infra/`: Terraform configurations.
- `docs/`: ADRs, specs, and general documentation.
- `scripts/`: Utility scripts.
