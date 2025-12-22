# Event Ticketing & Commerce Engine Strategy

* Status: Accepted
* Date: 2025-12-06
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The platform needs to sell event tickets. This requires handling complex commerce logic: inventory management (preventing overselling), order state transitions (Pending -> Paid -> Fulfilled), and payment gateway integration (ECPay/Stripe). The user considered using **Vendure** (a Headless Commerce framework) but decided against it due to its dependency on SQL databases, which conflicts with the project's Firestore-only constraint.

## Decision Drivers
*   **Data Integrity**: Must prevent "overselling" of tickets during high-traffic periods.
*   **Architecture Constraint**: Must use **Firestore** (NoSQL).
*   **Functionality**: Needs standard commerce features (Cart, Checkout, Order History) without the overhead of a full-blown E-commerce framework.

## Considered Options
*   **Option 1 (Chosen)**: **Custom "Vendure-Lite" Engine in NestJS**.
*   **Option 2**: Vendure (Headless Commerce) deployed on Cloud Run (Requires SQL).
*   **Option 3**: Shopify/Eventbrite integration (External SaaS).

## Decision Outcome
Chosen option: **Option 1**.

**Reasoning**:
1.  **Vendure Inspiration**: We will adopt Vendure's proven domain models (`ProductVariant` for tickets, `OrderState` machine) but implement them in NestJS to run on Firestore.
2.  **PostgreSQL Transactions**: We will use SQL's ACID transactions (via Neon DB) to handle the critical "Inventory Check & Lock" logic, ensuring data consistency. (Modified per [ADR 0015](0015-adopt-neon-db-and-drizzle-orm.md))
3.  **Cost & Control**: Avoids monthly SaaS fees (Shopify) and SQL database costs (Vendure).

## Detailed Design
*   **Inventory**: Implemented via a `TicketInventoryService` using Firestore Transactions.
*   **Order State**: A State Machine pattern (using `xstate` or custom class) to strictly control order flow (`AddingItems` -> `ArrangingPayment` -> `PaymentAuthorized` -> `Completed`).
*   **Payments**: Webhook-based integration where the Backend verifies signatures before finalizing orders.

## Consequences
*   **Good, because**: Full control over the checkout flow.
*   **Good, because**: Seamless integration with our custom CRM (ADR 0011).
*   **Bad, because**: High initial development effort to build the commerce engine from scratch.
