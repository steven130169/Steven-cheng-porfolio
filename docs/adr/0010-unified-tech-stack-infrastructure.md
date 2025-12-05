# Unified Tech Stack & Infrastructure Strategy (GCP + NoSQL)

* Status: Accepted
* Date: 2025-12-06
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The project aims to build a scalable platform encompassing a Blog, Event Ticketing, and CRM. The previous architecture (Vite CSR) lacked SEO capabilities. The user requires a unified, maintainable stack deployed on Google Cloud Platform (GCP) with a strict preference for NoSQL (Firestore) to minimize database maintenance overhead and cost.

## Decision Drivers
*   **SEO**: Essential for public-facing pages. Requires Server-Side Rendering (SSR).
*   **Operational Simplicity**: Single cloud provider (GCP) and single language (TypeScript).
*   **Database Constraints**: Strong preference for **Firestore** (NoSQL) over SQL databases to avoid management/cost of Cloud SQL.
*   **Deployment**: Preference for **Cloud Run** (Serverless Container) for both frontend and backend.

## Considered Options
*   **Option 1 (Chosen)**: **Next.js (SSR)** + **NestJS (API)** + **Firestore**. All on GCP Cloud Run.
*   **Option 2**: Next.js (Vercel) + NestJS (GCP) + Firestore.
*   **Option 3**: Next.js (GCP) + NestJS (GCP) + Cloud SQL (Postgres).

## Decision Outcome
Chosen option: **Option 1**.

**Reasoning**:
1.  **Next.js**: Provides the necessary SSR capabilities for SEO.
2.  **GCP Cloud Run**: Allows "Scale to Zero" for both frontend and backend, minimizing costs while keeping networking simplified (all within GCP).
3.  **Firestore**: Aligns with the user's preference for a serverless, low-maintenance database.
4.  **Separation of Concerns**:
    *   **Next.js**: Responsible for View Layer, SEO, and Client Interactivity.
    *   **NestJS**: Responsible for Business Logic, Data Validation, and Security.

## Consequences
*   **Good, because**: Unified DevOps pipeline (Docker -> Cloud Run).
*   **Good, because**: Minimal fixed costs (Pay-as-you-go).
*   **Bad, because**: Requires managing Docker optimization for Next.js manually (vs. Vercel's zero-config).
*   **Bad, because**: Complex business logic (like relational data) must be carefully modeled for NoSQL (Firestore).
