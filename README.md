# Steven Cheng Portfolio

This repository hosts the source code for Steven Cheng's personal portfolio website. It is a full-stack application structured as a monorepo, leveraging modern web technologies and a robust testing strategy.

## 🏗 Architecture & Tech Stack

The project follows a **Monorepo** structure managed by **NPM Workspaces**, dividing the application into distinct domains:

### Frontend (`/frontend`)
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Language**: TypeScript
- **Testing**: Vitest & React Testing Library

### Backend (`/backend`)
- **Framework**: [NestJS 11](https://nestjs.com/)
- **Language**: TypeScript
- **Testing**: Jest
- **Infrastructure**: Designed for deployment on **GCP Cloud Run** with **Firestore** (see `docs/adr/`).

### E2E & BDD (`/e2e`)
- **Framework**: [Playwright](https://playwright.dev/)
- **BDD**: [Cucumber](https://cucumber.io/) (via `playwright-bdd`)
- **Strategy**: Hybrid testing approach combining engineering health checks (Playwright specs) and business acceptance criteria (Gherkin features).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- NPM (v7+ for workspaces support)

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
- **Frontend**: http://localhost:5173 (default Vite port)
- **Backend**: http://localhost:3000 (default NestJS port)

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
├── frontend/           # React/Vite Frontend Application
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

For detailed architectural decisions, please refer to the `docs/adr/` directory.

## 📝 License

[UNLICENSED] - Private Portfolio Project.