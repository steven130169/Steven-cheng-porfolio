# PGlite Service Tests Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all Drizzle mock chains in service unit tests with PGlite (in-process PostgreSQL), eliminating coupling to Drizzle's internal API while preserving test behavior.

**Motivation:** Current tests mock `db.select().from().where()` chains, coupling tests to Drizzle's query builder internals. Refactoring the DB layer or switching drivers would break all tests. PGlite lets tests run against real PostgreSQL without an external server.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| DB swapping | Lightweight `vi.mock` (module replacement) | Production code (`db/index.ts`) untouched. `vi.mock` only replaces which db instance is returned, not behavior. This is DI, not mocking. |
| Test isolation | New PGlite instance per test file | `vi.mock` async factory creates a fresh PGlite per file. No shared state between files. |
| Schema setup | `pushSchema` from `drizzle-kit/api` | Reads `schema.ts` directly. No raw SQL, no migration files. Single source of truth. |
| Data cleanup | `beforeEach` with `TRUNCATE CASCADE` | Clears all tables between tests within the same file. |
| Scope | 3 existing service test files only | `event.test.ts` (14 tests), `ticket-type.test.ts` (7 tests), `public-event.test.ts` (2 tests). Component tests (`*.spec.tsx`) unchanged. |

---

## Architecture

```
Test file starts (own vitest worker)
  -> vi.mock('@/server/db') factory runs:
       -> new PGlite() (in-memory)
       -> drizzle(client) creates Drizzle instance
       -> pushSchema(schema, db) creates tables
       -> returns { db } (real PGlite-backed Drizzle)
  -> Service imports resolve to PGlite db
  -> beforeEach: TRUNCATE all tables
  -> Each test: seed data -> call service -> assert
  -> File ends: PGlite instance garbage collected
```

**What changes:**
- Test files: remove mock chains, use seed + assert pattern
- New helper: `createTestDb()` shared across test files

**What stays the same:**
- `db/index.ts` (production code untouched)
- All service implementations (`event.ts`, `ticket-type.ts`, `public-event.ts`)
- All API route handlers
- All component tests (`*.spec.tsx`)
- DB schema (`schema.ts`)

---

## Key Files Reference

- **Test helper (new):** `frontend/src/server/db/__tests__/test-db.ts`
- **Service tests (rewrite):** `frontend/src/server/services/__tests__/event.test.ts`
- **Service tests (rewrite):** `frontend/src/server/services/__tests__/ticket-type.test.ts`
- **Service tests (rewrite):** `frontend/src/server/services/__tests__/public-event.test.ts`
- **DB module (unchanged):** `frontend/src/server/db/index.ts`
- **Schema (unchanged):** `frontend/src/server/db/schema.ts`

---

## Task 1: Install PGlite dependency

**Files:**
- Modify: `frontend/package.json`

**Steps:**

1. Install `@electric-sql/pglite` as a dev dependency in the frontend workspace:

```bash
npm install -D @electric-sql/pglite -w frontend
```

2. Verify `drizzle-kit` is already installed (needed for `drizzle-kit/api`). If not:

```bash
npm install -D drizzle-kit -w frontend
```

3. Commit:

```bash
git add frontend/package.json package-lock.json
git commit -m "build(deps): add @electric-sql/pglite for service test infrastructure"
```

---

## Task 2: Create shared test helper

**Files:**
- Create: `frontend/src/server/db/__tests__/test-db.ts`

**Step 1: Create the helper**

```typescript
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { pushSchema } from 'drizzle-kit/api';
import * as schema from '../schema';

export async function createTestDb() {
    const client = new PGlite();
    const db = drizzle(client, { schema });

    const { apply } = await pushSchema(schema, db as any);
    await apply();

    return { db };
}
```

**Step 2: Verify it works**

Write a minimal smoke test or import it from an existing test to confirm PGlite + pushSchema works.

**Step 3: Commit**

```bash
git add frontend/src/server/db/__tests__/test-db.ts
git commit -m "test(infra): add PGlite test database helper with pushSchema"
```

---

## Task 3: Migrate public-event.test.ts (simplest, 2 tests)

Start with the simplest file to validate the pattern before tackling larger files.

**Files:**
- Rewrite: `frontend/src/server/services/__tests__/public-event.test.ts`

**Step 1: Rewrite the test file**

Replace the entire file. Key changes:
- Remove `vi.mock('@/server/db', () => ({ db: { select: vi.fn() } }))`
- Remove all `eslint-disable` comments
- Remove all mock chain construction
- Add `vi.mock` with PGlite factory
- Add `beforeEach` truncation
- Each test seeds real data via `db.insert()` then calls the service

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/server/db', async () => {
    const { createTestDb } = await import('../../db/__tests__/test-db');
    return createTestDb();
});

import { db } from '@/server/db';
import { events } from '@/server/db/schema';
import { sql } from 'drizzle-orm';
import { getPublishedEvents } from '../public-event';

describe('getPublishedEvents', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should return only published events', async () => {
        await db.insert(events).values({
            title: 'Published Event',
            slug: 'published-event',
            status: 'PUBLISHED',
            totalCapacity: 100,
        });
        await db.insert(events).values({
            title: 'Draft Event',
            slug: 'draft-event',
            status: 'DRAFT',
            totalCapacity: 50,
        });

        const result = await getPublishedEvents();

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Published Event');
        expect(result[0].status).toBe('PUBLISHED');
    });

    it('should return empty array when no published events exist', async () => {
        await db.insert(events).values({
            title: 'Draft Event',
            slug: 'draft-event',
            status: 'DRAFT',
            totalCapacity: 50,
        });

        const result = await getPublishedEvents();

        expect(result).toHaveLength(0);
    });
});
```

**Step 2: Run and verify with Wallaby**

Use `mcp__wallaby__wallaby_allTestsForFile` to confirm both tests pass.

**Step 3: Commit**

```bash
git add frontend/src/server/services/__tests__/public-event.test.ts
git commit -m "test(events): migrate public-event tests from mock to PGlite"
```

---

## Task 4: Migrate event.test.ts (14 tests)

**Files:**
- Rewrite: `frontend/src/server/services/__tests__/event.test.ts`

**Step 1: Rewrite the test file**

Key pattern changes:
- Remove all mock chain boilerplate (mockSelectChain, mockInsertChain, mockUpdateChain, etc.)
- Remove `vi.mocked(db.select).mockReturnValueOnce(...)` chains
- Each test seeds data via real DB operations:
  - `createDraftEvent` tests: just call the function (it creates via real DB)
  - `updateEvent` tests: first create an event via `db.insert()`, then call `updateEvent()`
  - Tests that check allocation validation: insert event + ticket types first

Example pattern for updateEvent tests:

```typescript
it('should update totalCapacity for DRAFT event', async () => {
    // Seed: create a real event
    const [event] = await db.insert(events).values({
        title: 'Tech Conf 2025',
        slug: 'tech-conf-2025',
        status: 'DRAFT',
        totalCapacity: 10,
    }).returning();

    // Act
    const result = await updateEvent(event.id, { totalCapacity: 30 });

    // Assert
    expect(result.totalCapacity).toBe(30);
    expect(result.status).toBe('DRAFT');
});
```

**Step 2: Run and verify with Wallaby**

Use `mcp__wallaby__wallaby_allTestsForFile` to confirm all 14 tests pass.

**Step 3: Commit**

```bash
git add frontend/src/server/services/__tests__/event.test.ts
git commit -m "test(events): migrate event service tests from mock to PGlite"
```

---

## Task 5: Migrate ticket-type.test.ts (7 tests)

**Files:**
- Rewrite: `frontend/src/server/services/__tests__/ticket-type.test.ts`

**Step 1: Rewrite the test file**

Key pattern changes:
- Remove all mock chain boilerplate
- Each test creates a real event first (FK dependency), then calls `createTicketType()`
- Allocation validation tests become more meaningful: real DB enforces constraints

Example pattern:

```typescript
it('should reject when allocation exceeds remaining capacity', async () => {
    // Seed: event with capacity 10 + existing ticket type with allocation 8
    const [event] = await db.insert(events).values({
        title: 'Tech Conf',
        slug: 'tech-conf',
        status: 'DRAFT',
        totalCapacity: 10,
    }).returning();

    await db.insert(ticketTypes).values({
        eventId: event.id,
        name: 'Early Bird',
        price: 100,
        allocation: 8,
        enabled: true,
    });

    // Act + Assert: adding allocation 5 exceeds capacity 10
    await expect(
        createTicketType({
            eventId: event.id,
            name: 'VIP',
            price: 300,
            allocation: 5,
            enabled: true,
        })
    ).rejects.toThrow('Allocations exceed total capacity');
});
```

**Step 2: Run and verify with Wallaby**

Use `mcp__wallaby__wallaby_allTestsForFile` to confirm all 7 tests pass.

**Step 3: Commit**

```bash
git add frontend/src/server/services/__tests__/ticket-type.test.ts
git commit -m "test(events): migrate ticket-type service tests from mock to PGlite"
```

---

## Task 6: Final verification and cleanup

**Step 1: Run all unit tests via Wallaby**

```typescript
mcp__wallaby__wallaby_failingTests();
// Expected: 0 failing tests, 34 total
```

**Step 2: Check file problems on all modified files**

```typescript
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/__tests__/event.test.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/__tests__/ticket-type.test.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/__tests__/public-event.test.ts' });
```

**Step 3: Build check**

```typescript
mcp__jetbrains__build_project();
```

**Step 4: Verify no eslint-disable comments remain in test files**

Search for `eslint-disable` in the 3 test files. Expected: none.

**Step 5: Commit if any cleanup needed**

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| DB in tests | Mocked Drizzle query chains | Real PGlite PostgreSQL |
| Mock boilerplate | ~200 lines across 3 files | 0 (4-line `vi.mock` per file for DI only) |
| `eslint-disable` | 9 comments (3 per file) | 0 |
| `any` type usage | Extensive (mock chains) | 1 (`pushSchema` parameter) |
| Schema coupling | Tests coupled to Drizzle's `.from().where()` chain API | Tests coupled to service's public API only |
| Refactoring safety | Changing DB layer breaks all tests | Changing DB layer: only update `db/index.ts` |
| Test count | 34 (23 service + 11 component) | 34 (unchanged) |
| New dependencies | - | `@electric-sql/pglite` (dev) |
| Production code changes | - | None |
