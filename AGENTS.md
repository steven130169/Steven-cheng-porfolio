# Steven Cheng Guidelines
我目前熟悉的程式語言是 typescript，是一位8年經驗的後端工程師。使用的開發框架是 NestJS，但我想要透過NextJS來建構我的個人網站。
所以很多 NextJS 的內容，我是不了解的，需要你教我。

# Project Guidelines

## Project Overview
這是一個個人網站，需要呈現有部落格功能與活動售票的功能，因為我未來要成為職業講師與顧問，需要建立個人品牌。

## Tech Stack
- **Fullstack**: Next.js / React
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
1. Requirements Analysis follows this skill`.aiassistant/workflows/.md`.
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
