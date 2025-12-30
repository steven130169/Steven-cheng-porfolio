# ADR 0016: Event Ticketing System Design (MVP)

* Status: Proposed
* Date: 2025-12-23
* Deciders: Steven Cheng

## Context
We have an approved requirements spec for the Event Ticketing System:
- `docs/specs/event-ticketing-requirements.md`

Existing architectural decisions include:
- **ADR 0003 / 0017**: Backend uses **Next.js Fullstack** (Server Actions/API Routes) instead of NestJS.
- **ADR 0015**: Data store uses **Neon (PostgreSQL)** with **Drizzle ORM**.
- **ADR 0018**: Payment provider is **PayUni** (Taiwan).
- **ADR 0007 / 0010 / 0012**: Prior Firestore-related details are superseded by ADR 0015.

This ADR defines the MVP system design: architecture, schema, Server Actions, component breakdown, and how we will enforce inventory correctness (no overselling) using reservations.

## Decision
Implement the Event Ticketing System using **Next.js Fullstack** (App Router, Server Actions) backed by Neon Postgres.

Key invariants:
1. **Single event total capacity X** caps the total number of sold + reserved tickets across all ticket types.
2. **Optional per-ticket-type allocation** caps a ticket type but does not reserve capacity.
3. **Reserve first, pay later**: an `ACTIVE` Reservation is created at checkout start and expires after 15 minutes.
4. **Orders are created only after payment succeeds**.

## Architecture Overview

### Runtime components
- **Frontend & Backend (Next.js)**
  - Admin UI: create event, configure capacity, add/edit ticket types, publish.
  - Customer UI: browse events, select ticket type, reserve, pay.
  - **Server Actions**: used for mutations (create event, reserve ticket, etc.).
  - **API Routes**: used for webhooks (e.g., Stripe) and potentially public APIs.

- **Database (Neon Postgres)**
  - Stores events, ticket types, reservations, orders.

### Logical breakdown (Next.js Server Actions)
- `actions/events.ts`
  - create/update/publish events
- `actions/ticket-types.ts`
  - CRUD ticket types, validate allocation rules
- `actions/reservations.ts`
  - create reservation, compute availability
- `actions/orders.ts`
  - create order after payment success, state transitions
- `actions/payments.ts`
  - create payment session/intention (PayUni), handle webhooks
- (Optional) `AdminAuthModule`
  - single-admin auth guard

## Data Model / Schema (Postgres)

### Tables

#### `events`
- `id` uuid pk
- `title` text not null
- `description` text null
- `start_date` timestamptz not null
- `end_date` timestamptz null
- `timezone` text null
- `status` text not null check in ('DRAFT','PUBLISHED')
- `total_capacity` int not null check (total_capacity >= 0)
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

#### `ticket_types`
- `id` uuid pk
- `event_id` uuid not null fk -> events(id)
- `name` text not null
- `price` numeric not null
- `allocation` int null check (allocation >= 0)
- `is_enabled` boolean not null default true
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- `(event_id)`

#### `reservations`
- `id` uuid pk
- `event_id` uuid not null fk -> events(id)
- `ticket_type_id` uuid not null fk -> ticket_types(id)
- `quantity` int not null check (quantity > 0)
- `status` text not null check in ('ACTIVE','EXPIRED','CONSUMED')
- `expires_at` timestamptz not null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- `(event_id, status, expires_at)`
- `(ticket_type_id, status, expires_at)`

#### `orders`
- `id` uuid pk
- `event_id` uuid not null fk -> events(id)
- `status` text not null check in ('PAID','COMPLETED')
- `total_quantity` int not null check (total_quantity > 0)
- `total_amount` numeric not null
- `payment_provider` text null
- `payment_reference` text null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- `(event_id)`
- `(payment_reference)`

#### `order_items`
- `id` uuid pk
- `order_id` uuid not null fk -> orders(id)
- `ticket_type_id` uuid not null fk -> ticket_types(id)
- `quantity` int not null check (quantity > 0)
- `unit_price` numeric not null
- `line_total` numeric not null

Indexes:
- `(order_id)`

### Constraints (MVP)
- Allocation-sum rule is enforced at the **application layer** when saving ticket types:
  - `sum(defined allocations) <= events.total_capacity`.
- Overselling prevention is enforced by reservation creation inside a DB transaction.

## Availability & Reservation Rules

### Availability computation
- `event_remaining = X - (completed_orders_all_types + active_reservations_all_types)`
- If ticket type has allocation:
  - `ticket_type_remaining = allocation - (completed_orders_for_type + active_reservations_for_type)`
  - `available = min(event_remaining, ticket_type_remaining)`
- If ticket type has no allocation:
  - `available = event_remaining`

### Reservation creation (critical section)
Operation: `POST /events/:eventId/ticket-types/:ticketTypeId/reservations`

In a single DB transaction:
1. Mark expired reservations as EXPIRED (or treat them as non-active via `expires_at >= now()` filtering).
2. Compute `event_remaining`.
3. Compute `available` for the requested ticket type.
4. If requested quantity > available, return 409 "Insufficient Inventory".
5. Insert reservation with `status=ACTIVE` and `expires_at = now() + 15 minutes`.

### Order creation after payment success
Triggered by payment provider callback/webhook.

In a single DB transaction:
1. Re-validate reservation is still `ACTIVE` and `expires_at >= now()`.
2. Insert `orders` + `order_items`.
3. Mark reservation(s) as `CONSUMED`.
4. Return/finalize.

## API Contracts (MVP)

### Admin APIs
- `POST /admin/events`
  - body: `{ title, startDate, endDate?, timezone?, description?, totalCapacity }`
  - response: `{ eventId }`

- `PUT /admin/events/:eventId`
- `PUT /admin/events/:eventId/publish`

- `POST /admin/events/:eventId/ticket-types`
  - body: `{ name, price, allocation?, isEnabled }`

- `PUT /admin/events/:eventId/ticket-types/:ticketTypeId`

### Customer APIs
- `GET /events` (published only)
- `GET /events/:eventId` (includes enabled ticket types + availability)

- `POST /events/:eventId/ticket-types/:ticketTypeId/reservations`
  - body: `{ quantity }`
  - response: `{ reservationId, expiresAt }`

### Payment APIs
- `POST /payments/reservations/:reservationId/session`
  - Creates PayUni payment session

- `POST /webhooks/payuni`
  - Verifies PayUni signature
  - On success: creates order + consumes reservation

## Component Breakdown
- UI pages:
  - `/admin/events/new`
  - `/admin/events/:eventId/edit`
  - `/admin/events/:eventId/tickets`
  - `/events` (browse)
  - `/events/:eventId` (choose ticket type)
  - `/checkout/:reservationId` (pay)

## References
- ADR 0003: `docs/adr/0003-use-nestjs-for-backend-service.md`
- ADR 0015: `docs/adr/0015-adopt-neon-db-and-drizzle-orm.md`
- Requirements: `docs/specs/event-ticketing-requirements.md`


