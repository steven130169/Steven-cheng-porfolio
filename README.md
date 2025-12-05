# Steven Cheng Portfolio

This repository hosts the source code for Steven Cheng's personal portfolio website, expanding into a full-featured Blog and Event Ticketing platform. It is a full-stack application structured as a monorepo, leveraging modern web technologies and a robust testing strategy.

## 🏗 Architecture & Tech Stack

The project follows a **Monorepo** structure managed by **NPM Workspaces**, dividing the application into distinct domains. 

**Key Architecture Decision**: We utilize a unified **Google Cloud Platform (GCP)** stack with **Next.js (SSR)** and **NestJS**, both running on **Cloud Run** and backed by **Firestore**.

### Frontend (`/frontend` -> migrating to Next.js)
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Rendering**: Server-Side Rendering (SSR) for SEO.
- **Deployment**: Dockerized on **GCP Cloud Run**.
- **Language**: TypeScript

### Backend (`/backend`)
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL).
- **Key Modules**: 
  - **Events**: Custom ticketing engine (Inventory, Orders).
  - **Blog**: Custom Headless CMS for instant publishing.
  - **CRM**: Lightweight customer relationship management.
- **Language**: TypeScript
- **Testing**: Jest

### E2E & BDD (`/e2e`)
- **Framework**: [Playwright](https://playwright.dev/)
- **BDD**: [Cucumber](https://cucumber.io/) (via `playwright-bdd`)
- **Strategy**: Hybrid testing approach combining engineering health checks (Playwright specs) and business acceptance criteria (Gherkin features).

---

## 🧠 Architecture Decision Records (ADR)

We maintain a comprehensive history of all architectural decisions in `docs/adr`. This log helps understanding the "Why" behind our technical choices.

| ID | Title | Status | Date |
| :--- | :--- | :--- | :--- |
| [ADR-0001](docs/adr/0001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | 2025-12-05 |
| [ADR-0002](docs/adr/0002-adopt-monorepo-structure-with-npm-workspaces.md) | Adopt Monorepo Structure with NPM Workspaces | Accepted | 2025-12-05 |
| [ADR-0003](docs/adr/0003-use-nestjs-for-backend-service.md) | Use NestJS for Backend Service | Accepted | 2025-12-05 |
| [ADR-0004](docs/adr/0004-hybrid-testing-strategy.md) | Hybrid Testing Strategy (Unit, E2E, BDD) | Accepted | 2025-12-05 |
| [ADR-0005](docs/adr/0005-isolate-project-instructions.md) | Isolate Project Instructions (.gemini folder) | Accepted | 2025-12-05 |
| [ADR-0006](docs/adr/0006-testing-strategy-separation-and-config.md) | Testing Strategy Separation and Config | Accepted | 2025-12-05 |
| [ADR-0007](docs/adr/0007-select-gcp-cloud-run-and-firestore.md) | Select GCP Cloud Run and Firestore | Accepted | 2025-12-05 |
| [ADR-0008](docs/adr/0008-establish-implementation-strategy-gcp.md) | Establish Implementation Strategy (GCP) | Accepted | 2025-12-05 |
| [ADR-0009](docs/adr/0009-adopt-github-actions-and-safe-git-flow.md) | Adopt GitHub Actions and Safe Git Flow | Accepted | 2025-12-05 |
| [ADR-0010](docs/adr/0010-unified-tech-stack-infrastructure.md) | **Unified Tech Stack & Infrastructure (GCP + NoSQL)** | Accepted | 2025-12-06 |
| [ADR-0011](docs/adr/0011-integrate-crm-marketing-module.md) | **Integrate Lightweight CRM & Marketing Module** | Accepted | 2025-12-06 |
| [ADR-0012](docs/adr/0012-event-ticketing-commerce-strategy.md) | **Event Ticketing & Commerce Engine Strategy** | Accepted | 2025-12-06 |
| [ADR-0013](docs/adr/0013-blog-content-management-strategy.md) | **Blog Content Management Strategy (Custom CMS)** | Accepted | 2025-12-06 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- NPM (v7+ for workspaces support)
- Google Cloud SDK (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Steven-cheng-porfolio
   ```

2. Install dependencies (installs all workspace dependencies):
   ```bash
   npm install
   ```

### Development

To start both the **Frontend** and **Backend** servers concurrently:

```bash
npm run dev
```
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:3001 (NestJS) *(Port may vary based on config)*

You can also run them individually:
- `npm run start:frontend`
- `npm run start:backend`

---

## 🧪 Testing Strategy

We adhere to a strict **Test Behavior, Not Implementation** philosophy.

| Test Type | Command | Description |
| :--- | :--- | :--- |
| **All Tests** | `npm run test` | Runs Unit, E2E, and BDD tests sequentially. |
| **Frontend Unit** | `npm run test:frontend:unit` | Vitest tests for UI components and logic. |
| **Backend Unit** | `npm run test:backend:unit` | Jest tests for API services and controllers. |
| **E2E (Smoke)** | `npm run test:e2e` | Playwright spec files for system stability & smoke tests. |
| **BDD (Features)** | `npm run test:bdd` | Cucumber feature files for business acceptance. |

---

## 📂 Project Structure

```
Steven-cheng-porfolio/
├── backend/            # NestJS Backend Application
├── frontend/           # Next.js Frontend Application (Migrating)
├── e2e/                # Playwright & Cucumber Tests
├── docs/
│   └── adr/            # Architecture Decision Records
├── .gemini/            # Agent memories & context
└── package.json        # Root workspace configuration
```

## 🤝 Workflow & Contribution

This project utilizes an AI-assisted workflow emphasizing **Stability** and **TDD**.

- **Stabilization Mode**: When integrating new POC code, we prioritize "Safety Nets" (Characterization Tests) over immediate refactoring.
- **Development Mode**: New features follow a **Red-Green-Refactor** loop, starting with BDD specifications (`.feature` files).

## 📝 License

[UNLICENSED] - Private Portfolio Project.
