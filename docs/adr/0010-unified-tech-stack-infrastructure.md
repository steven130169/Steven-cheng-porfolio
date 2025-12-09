# Unified Tech Stack & Infrastructure Strategy (Next.js Monolith)

* Status: Accepted
* Date: 2025-12-07 (Updated)
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The project requires a scalable platform for a Portfolio, Blog, and Event Ticketing system. 
Initially, a split architecture (Next.js Frontend + NestJS Backend) was chosen. However, maintaining two separate services, two Dockerfiles, and handling API proxying adds unnecessary complexity for a single-developer project. The user desires "Maximum Development Speed" and "Low Maintenance". 
A key concern with moving to a Next.js Monolith is the potential for "Spaghetti Code" due to the lack of strict architectural patterns found in NestJS.

## Decision Drivers
*   **Development Velocity**: Need to iterate quickly without context switching between frontend and backend repos.
*   **Simplicity**: Single deployment pipeline, single Dockerfile.
*   **Type Safety**: Easier to share types between client and server in a single codebase.
*   **Interactivity**: Rich UI requirements (TipTap editor, Ticketing) favor a React-centric approach.
*   **Maintainability**: Must avoid the "unstructured mess" common in large Next.js apps.

## Considered Options

### Option 1: Next.js (Client) + NestJS (API) [Previous Choice]
*   **Pros**: Strong separation of concerns, strict backend architecture (DI, Modules).
*   **Cons**: Double boilerplate, CORS/Proxy issues, duplicated DTOs, higher cloud cost (2 services).
*   **Outcome**: **Discarded**. The overhead outweighs the benefits for this scale.

### Option 2: NestJS + Handlebars (SSR)
*   **Pros**: Very simple mentally.
*   **Cons**: Poor support for modern interactive UIs (React components like TipTap).
*   **Outcome**: **Discarded**.

### Option 3: Next.js Monolith (Full Stack) [Selected]
*   **Pros**: Unified codebase, Server Actions, direct DB access in Server Components, zero-latency data fetching.
*   **Cons**: Risk of poor code structure if not managed.
*   **Outcome**: **Selected**, with strict architectural guidelines.

## Decision Outcome
Chosen option: **Option 3: Next.js Monolith**.

**Architecture Pattern**: To mitigate the "messy code" risk, we will adopt a **Modular Service Layer** pattern within Next.js, mimicking NestJS structure:

```
frontend/src/
├── app/                    # Presentation Layer (Next.js Routing & UI)
│   ├── api/                # REST Endpoints (if needed)
│   └── (pages)/            # React Server/Client Components
├── server/                 # Business Logic Layer (The "Backend")
│   ├── db/                 # Database Connection (Firestore)
│   ├── modules/            # Domain Modules
│   │   ├── events/
│   │   │   ├── events.service.ts      # Logic & Validation
│   │   │   ├── events.repository.ts   # DB Access
│   │   │   └── events.types.ts        # DTOs
│   │   └── blog/
│   └── utils/
```

**Golden Rules**:
1.  **Separation**: `app/` components NEVER import `firestore` directly. They MUST call `server/modules/*/service`.
2.  **Services**: Pure TypeScript classes/functions containing business logic.
3.  **Repositories**: Handle direct DB queries.
4.  **Server Actions**: Used as the primary way to invoke Services from Client Components.

## Consequences
*   **Good, because**: Deployment is simplified to a single Cloud Run service.
*   **Good, because**: Latency is reduced (no internal HTTP calls between front/back).
*   **Good, because**: We rely on strict folder structure instead of framework boilerplate to maintain order.
*   **Bad, because**: We lose NestJS's built-in Dependency Injection and Decorators (e.g., `@Cron`, `@WebSocketGateway`). We must implement these manually if needed.