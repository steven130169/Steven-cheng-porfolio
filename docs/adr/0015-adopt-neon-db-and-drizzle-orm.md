# ADR 0015: Adopt Neon DB and Drizzle ORM

* Status: Accepted (Supersedes ADR 0007, 0008, 0010, 0012)
* Date: 2025-12-23
* Deciders: Steven Cheng, Antigravity Agent

## Context and Problem Statement
Previous architectural decisions (ADR 0007, 0010) shifted the project toward Firestore (NoSQL) to simplify GCP deployment and leverage serverless benefits. However, business requirements for the Event Ticketing engine—specifically complex inventory management, order state transitions, and relational data between Customers and Orders—are better served by a relational database with strong ACID transaction support.

The user has clarified that the Firestore decision was previously superseded by a move to **Neon DB (PostgreSQL)**.

## Decision Drivers
*   **Transactional Integrity**: Need for robust SQL transactions to prevent ticket overselling (Race Conditions).
*   **Relational Data Modeling**: Better mapping for CRM (Customers <-> Orders) and Ecommerce domains.
*   **Developer Experience**: Drizzle ORM provides a Type-safe, SQL-like experience that aligns with the "Code Stabilization" goal.
*   **Serverless Compatibility**: Neon DB provides a serverless PostgreSQL solution that scales to zero, matching the project's cost-efficiency goal.

## Considered Options
*   **Option 1: Neon DB + Drizzle ORM (Selected)**
*   **Option 2: GCP Firestore (Superseded)**
*   **Option 3: Cloud SQL (High fixed cost)**

## Decision Outcome
Chosen option: **Option 1: Neon DB + Drizzle ORM**.

**Justification:**
1.  **SQL Power**: Provides full PostgreSQL features for complex queries and transactions.
2.  **Type Safety**: Drizzle ORM offers best-in-class TypeScript integration without the overhead of heavy ORMs like TypeORM or Sequelize.
3.  **Cost**: Neon's usage-based pricing maintains the "$0 when idle" target.

## Implementation Details
1.  **Connection**: Use `DATABASE_URL` stored in Secret Manager.
2.  **ORM**: Drizzle ORM for schema definition and migrations.
3.  **Monolith Integration**: The `server/db` layer in the Next.js monolith will be updated to export a Drizzle client instance.

## Consequences
*   **Good**: Easier implementation of Ticketing and CRM logic using SQL joins and transactions.
*   **Good**: Stronger data consistency guarantees.
*   **Bad**: Requires SQL schema migrations (via Drizzle Kit).
*   **Update**: ADR 0007, 0008, 0010, and 0012 are now officially superseded regarding their database implementation sections.
