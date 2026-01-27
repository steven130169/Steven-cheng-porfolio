# Publish Event Service Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract publish event business logic from `frontend/src/app/api/admin/events/[id]/publish/route.ts` into a dedicated service function with full TDD coverage, completing the admin-event-management feature.

**Architecture:** Create a `publishEvent` service function in the existing `frontend/src/server/services/event.ts` module (alongside `createDraftEvent` and `updateEvent`). The service validates prerequisites (event exists, has enabled ticket types, is not already published) and updates the event status. The API route becomes a thin HTTP adapter delegating to the service. Input validation uses existing Zod schemas where applicable.

**Tech Stack:** TypeScript, Drizzle ORM (PostgreSQL), Vitest, PGlite (test DB), Zod

---

## Gherkin Scenarios Covered

From `e2e/specs/admin-event-management.feature`:

```gherkin
Scenario: Prevent publishing when no enabled ticket types exist
  Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
  And the event has no enabled ticket types
  When I publish the event "Tech Conf 2025"
  Then the request should be rejected with error "At least one enabled ticket type is required"
  And the event "Tech Conf 2025" should remain in status "DRAFT"

Scenario: Publish an event when prerequisites are met
  Given an event "Tech Conf 2025" exists with status "DRAFT" and total capacity 10
  And the event has an enabled ticket type "Early Bird" with price 100 and allocation 10
  When I publish the event "Tech Conf 2025"
  Then the event "Tech Conf 2025" should have status "PUBLISHED"
```

## Context: Existing Code Patterns

### Test file pattern (from `event.test.ts`)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/server/db', async () => {
    const { createTestDb } = await import('../../db/__tests__/test-db');
    return createTestDb();
});

import { db } from '@/server/db';
import { events, ticketTypes } from '@/server/db/schema';
import { sql } from 'drizzle-orm';
```

### Service function pattern (from `event.ts`)
- Import `db` from `@/server/db`
- Import tables from `@/server/db/schema`
- Import Drizzle operators (`eq`, `and`, etc.)
- Throw `Error` with descriptive messages for business rule violations
- Return the domain object directly

### Current publish route logic (to be extracted)
The file `frontend/src/app/api/admin/events/[id]/publish/route.ts` contains inline `canPublishEvent` function and direct DB calls. This logic must move to the service layer.

---

## Task 1: Write failing test — publish a DRAFT event with enabled ticket types

**Files:**
- Modify: `frontend/src/server/services/__tests__/event.test.ts`

**Step 1: Write the failing test**

Add to the bottom of `event.test.ts`, after the `updateEvent` describe block:

```typescript
describe('publishEvent', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE events, ticket_types, orders CASCADE`);
    });

    it('should publish a DRAFT event with enabled ticket types', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 10,
            enabled: true,
        });

        const result = await publishEvent(event.id);

        expect(result.status).toBe('PUBLISHED');
        expect(result.id).toBe(event.id);
    });
});
```

Also update the import at the top of the file:

```typescript
import { createDraftEvent, updateEvent, publishEvent } from '../event';
```

**Step 2: Verify test fails**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`
Expected: FAIL — `publishEvent` is not exported from `../event`

---

## Task 2: Implement minimal `publishEvent` service to pass the first test

**Files:**
- Modify: `frontend/src/server/services/event.ts`

**Step 1: Add the `publishEvent` function**

Add at the bottom of `event.ts`:

```typescript
export async function publishEvent(eventId: number) {
    // 1. Verify event exists
    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!event) {
        throw new Error('Event not found');
    }

    // 2. Check at least one enabled ticket type exists
    const enabledTicketTypes = await db
        .select()
        .from(ticketTypes)
        .where(and(
            eq(ticketTypes.eventId, eventId),
            eq(ticketTypes.enabled, true)
        ));

    if (enabledTicketTypes.length === 0) {
        throw new Error('At least one enabled ticket type is required');
    }

    // 3. Update status to PUBLISHED
    const [updatedEvent] = await db
        .update(events)
        .set({
            status: 'PUBLISHED',
            updatedAt: new Date(),
        })
        .where(eq(events.id, eventId))
        .returning();

    return updatedEvent;
}
```

**Step 2: Verify test passes**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`
Expected: all tests PASS, including the new `publishEvent` test

**Step 3: Commit**

```bash
git add frontend/src/server/services/event.ts frontend/src/server/services/__tests__/event.test.ts
git commit -m "feat(events): add publishEvent service with happy path test"
```

---

## Task 3: Write failing test — reject publishing when no enabled ticket types exist

**Files:**
- Modify: `frontend/src/server/services/__tests__/event.test.ts`

**Step 1: Write the failing test**

Add inside the `publishEvent` describe block:

```typescript
    it('should reject publishing when no enabled ticket types exist', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        await expect(
            publishEvent(event.id)
        ).rejects.toThrow('At least one enabled ticket type is required');
    });
```

**Step 2: Verify test passes (already covered by implementation)**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`
Expected: PASS — the implementation already handles this case

> Note: This test should pass immediately since the implementation from Task 2 already includes the validation. This is expected — we're adding the test for coverage, not driving new code.

**Step 3: Commit**

```bash
git add frontend/src/server/services/__tests__/event.test.ts
git commit -m "test(events): add publishEvent rejection test for no enabled ticket types"
```

---

## Task 4: Write failing test — reject publishing when event not found

**Files:**
- Modify: `frontend/src/server/services/__tests__/event.test.ts`

**Step 1: Write the failing test**

Add inside the `publishEvent` describe block:

```typescript
    it('should reject publishing when event not found', async () => {
        await expect(
            publishEvent(999)
        ).rejects.toThrow('Event not found');
    });
```

**Step 2: Verify test passes (already covered by implementation)**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/server/services/__tests__/event.test.ts
git commit -m "test(events): add publishEvent rejection test for event not found"
```

---

## Task 5: Write failing test — return already published event without error

**Files:**
- Modify: `frontend/src/server/services/__tests__/event.test.ts`

**Step 1: Write the failing test**

Add inside the `publishEvent` describe block:

```typescript
    it('should return already published event without error', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'PUBLISHED',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 10,
            enabled: true,
        });

        const result = await publishEvent(event.id);

        expect(result.status).toBe('PUBLISHED');
        expect(result.id).toBe(event.id);
    });
```

**Step 2: Verify test fails or passes**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`

This test may pass with the current implementation (it updates to PUBLISHED even if already PUBLISHED, which is idempotent). If it passes, proceed to commit. If it fails, add early return logic.

**Step 3: If test fails — add idempotency guard**

In `publishEvent` in `event.ts`, after the event exists check, add:

```typescript
    // Already published — return as-is (idempotent)
    if (event.status === 'PUBLISHED') {
        return event;
    }
```

**Step 4: Verify test passes**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/server/services/event.ts frontend/src/server/services/__tests__/event.test.ts
git commit -m "feat(events): handle idempotent publish for already-published events"
```

---

## Task 6: Write failing test — only count enabled ticket types (disabled should not satisfy prerequisite)

**Files:**
- Modify: `frontend/src/server/services/__tests__/event.test.ts`

**Step 1: Write the failing test**

Add inside the `publishEvent` describe block:

```typescript
    it('should reject publishing when all ticket types are disabled', async () => {
        const [event] = await db.insert(events).values({
            title: 'Tech Conf 2025',
            slug: 'tech-conf-2025',
            status: 'DRAFT',
            totalCapacity: 10,
        }).returning();

        await db.insert(ticketTypes).values({
            eventId: event.id,
            name: 'Early Bird',
            price: 100,
            allocation: 10,
            enabled: false,
        });

        await expect(
            publishEvent(event.id)
        ).rejects.toThrow('At least one enabled ticket type is required');
    });
```

**Step 2: Verify test passes (already handled by WHERE clause)**

Use Wallaby MCP: `wallaby_failingTestsForFile` on `event.test.ts`
Expected: PASS — the query already filters by `enabled: true`

**Step 3: Commit**

```bash
git add frontend/src/server/services/__tests__/event.test.ts
git commit -m "test(events): verify disabled ticket types don't satisfy publish prerequisite"
```

---

## Task 7: Refactor publish route to delegate to service

**Files:**
- Modify: `frontend/src/app/api/admin/events/[id]/publish/route.ts`

**Step 1: Refactor the route**

Replace the entire content of `route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { publishEvent } from '@/server/services/event';

/**
 * POST /api/admin/events/:id/publish
 * Publish an event (change status from DRAFT to PUBLISHED)
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const eventId = Number.parseInt(id, 10);

        if (Number.isNaN(eventId)) {
            return NextResponse.json(
                { error: 'Invalid event ID' },
                { status: 400 }
            );
        }

        const event = await publishEvent(eventId);

        return NextResponse.json(
            {
                id: event.id,
                status: event.status,
                publishedAt: event.updatedAt,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Event not found') {
                return NextResponse.json(
                    { error: error.message },
                    { status: 404 }
                );
            }

            if (error.message === 'At least one enabled ticket type is required') {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
        }

        console.error('Error publishing event:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

**Step 2: Run `get_file_problems` to check for errors/warnings**

Use JetBrains MCP: `get_file_problems` with `errorsOnly: false` on the route file.
Fix ALL reported errors and warnings.

**Step 3: Reformat the file**

Use JetBrains MCP: `reformat_file` on the route file.

**Step 4: Verify all tests still pass (no regressions)**

Use Wallaby MCP: `wallaby_failingTests`
Expected: zero failing tests

**Step 5: Commit**

```bash
git add frontend/src/app/api/admin/events/[id]/publish/route.ts
git commit -m "refactor(events): delegate publish route to publishEvent service"
```

---

## Task 8: Final verification and cleanup

**Files:**
- Check: `frontend/src/server/services/event.ts`
- Check: `frontend/src/server/services/__tests__/event.test.ts`
- Check: `frontend/src/app/api/admin/events/[id]/publish/route.ts`

**Step 1: Run `get_file_problems` on all modified files**

Use JetBrains MCP: `get_file_problems` with `errorsOnly: false` on:
- `frontend/src/server/services/event.ts`
- `frontend/src/server/services/__tests__/event.test.ts`
- `frontend/src/app/api/admin/events/[id]/publish/route.ts`

Fix ALL reported errors and warnings.

**Step 2: Reformat all modified files**

Use JetBrains MCP: `reformat_file` on each file.

**Step 3: Verify all project tests pass**

Use Wallaby MCP: `wallaby_failingTests`
Expected: zero failing tests, coverage >= 92%

**Step 4: Check coverage on the service file**

Use Wallaby MCP: `wallaby_coveredLinesForFile` on `frontend/src/server/services/event.ts`
Expected: new `publishEvent` lines should be covered

**Step 5: Build project to verify types**

Use JetBrains MCP: `build_project`
Expected: no type errors

---

## Summary

| Task | Description | Type |
|------|-------------|------|
| 1 | Write failing test: publish DRAFT event with enabled ticket types | Red |
| 2 | Implement `publishEvent` service + verify test passes | Green |
| 3 | Add test: reject when no enabled ticket types | Test coverage |
| 4 | Add test: reject when event not found | Test coverage |
| 5 | Add test: idempotent publish for already-published event | Red/Green |
| 6 | Add test: disabled ticket types don't satisfy prerequisite | Test coverage |
| 7 | Refactor publish route to delegate to service | Refactor |
| 8 | Final verification, formatting, build | Quality gate |

**Total new tests:** 5 (inside `publishEvent` describe block)
**Files modified:** 3 (`event.ts`, `event.test.ts`, `publish/route.ts`)
**Files created:** 0
