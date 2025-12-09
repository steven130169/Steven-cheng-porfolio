# Unified Tech Stack & Infrastructure Strategy (Next.js Monolith)

* Status: Accepted
* Date: 2025-12-08 (Updated)
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The project requires a scalable platform for a Portfolio, Blog, and Event Ticketing system. 
Initially, a split architecture (Next.js Frontend + NestJS Backend) was chosen. However, maintaining two separate services adds unnecessary complexity. The user desires "Maximum Development Speed" and "Low Maintenance". 
Also, the database choice was revisited. While Firestore (NoSQL) is cheap, it lacks relational capabilities needed for complex ticketing logic. The user found **Neon (Serverless Postgres)** which offers pay-as-you-go pricing and full SQL support.

## Decision Drivers
*   **Development Velocity**: Need to iterate quickly without context switching.
*   **Simplicity**: Single deployment pipeline.
*   **Relational Data**: Ticketing systems (Inventory, Orders, Users) benefit greatly from SQL ACID transactions and relations.
*   **Cost**: Must be pay-as-you-go (Serverless).

## Considered Options

### Architecture
*   **Option 1**: Next.js + NestJS (Discarded).
*   **Option 2**: Next.js Monolith (Selected).

### Database
*   **Option A**: Firestore (NoSQL)
    *   Pros: Easy to start, JSON-like.
    *   Cons: No joins, complex inventory locking.
*   **Option B**: **Neon (Serverless Postgres)** (Selected)
    *   Pros: Full SQL, Scale-to-Zero, Branching, standard ORM support.
    *   Cons: Connection pooling needed (but Neon handles this well).

## Decision Outcome
Chosen option: **Next.js Monolith + Neon (Postgres)**.

**Architecture Pattern**:
```
frontend/src/
├── app/                    # Presentation Layer
├── server/                 # Business Logic Layer
│   ├── db/                 # Drizzle ORM / Prisma Setup
│   │   └── schema.ts       # DB Schema
│   ├── modules/            # Domain Modules
```

**Golden Rules**:
1.  **Separation**: `app/` components NEVER import DB directly. They MUST call `server/modules/*/service`.
2.  **ORM**: Use **Drizzle ORM** (or Prisma) for type-safe DB access.
3.  **Server Actions**: Used as the primary way to invoke Services from Client Components.

## Consequences
*   **Good, because**: We get the power of SQL without the fixed cost of Cloud SQL.
*   **Good, because**: Relational data modeling is more natural for this domain.
*   **Bad, because**: We need to manage DB migrations (`drizzle-kit push` or `prisma migrate`).
