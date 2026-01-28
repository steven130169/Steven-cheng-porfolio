# Event Ticketing Reservations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 實作活動票務預約系統,支援票券軟鎖定(soft lock)、庫存管理、過期釋放和支付整合

**Architecture:** 
- 新增 `reservations` 資料表儲存預約狀態(15分鐘過期時間)
- 建立 reservation service 處理預約邏輯、庫存扣減和併發控制
- 實作 pessimistic locking 防止超賣
- 整合現有 orders 表作為支付完成後的最終記錄

**Tech Stack:** 
- Drizzle ORM 0.45.1 (PostgreSQL schema + transactions)
- Zod 4.3.5 (input validation)
- Next.js 16 App Router (API routes)
- Vitest 4.0.15 (unit tests with TDD)
- Playwright-BDD (E2E tests)

---

## Phase 1: Database Schema & Migrations

### Task 1.1: 新增 reservations 資料表 schema

**Files:**
- Modify: `frontend/src/server/db/schema.ts`

**Step 1: 撰寫失敗的單元測試**

建立測試檔案 `frontend/src/server/db/__tests__/schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { reservations } from '@/server/db/schema';
import { pgTable } from 'drizzle-orm/pg-core';

describe('reservations schema', () => {
  it('should define reservations table with required columns', () => {
    expect(reservations).toBeDefined();
    expect(reservations).toBeInstanceOf(Function); // pgTable returns a table constructor
  });

  it('should have correct column structure', () => {
    const columns = reservations._.columns;
    
    expect(columns.id).toBeDefined();
    expect(columns.eventId).toBeDefined();
    expect(columns.ticketTypeId).toBeDefined();
    expect(columns.quantity).toBeDefined();
    expect(columns.customerEmail).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.expiresAt).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/db/__tests__/schema.test.ts
```

預期輸出: `FAIL - reservations is not exported`

**Step 3: 實作最小程式碼使測試通過**

在 `frontend/src/server/db/schema.ts` 新增:

```typescript
export const reservations = pgTable('reservations', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    ticketTypeId: integer('ticket_type_id').notNull().references(() => ticketTypes.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    check('check_quantity', sql.raw(`${table.quantity.name} > 0`)),
    check('check_status', sql.raw(`${table.status.name} IN ('ACTIVE', 'CONSUMED', 'EXPIRED')`)),
]);
```

同時在 schema exports 中加入:

```typescript
export const schema = {
    events,
    ticketTypes,
    orders,
    reservations,
} as const;
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/db/__tests__/schema.test.ts
```

預期輸出: `PASS`

**Step 5: 檢查問題並格式化**

```typescript
// 使用 JetBrains MCP
mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/server/db/schema.ts',
    errorsOnly: false
});

mcp__jetbrains__reformat_file({
    path: 'frontend/src/server/db/schema.ts'
});
```

**Step 6: Commit**

```bash
git add frontend/src/server/db/schema.ts frontend/src/server/db/__tests__/schema.test.ts
git commit -m "feat(db): add reservations table schema with status and expiry"
```

---

### Task 1.2: 產生並執行 database migration

**Files:**
- Create: `frontend/drizzle/migrations/XXXX_add_reservations_table.sql` (由 drizzle-kit 自動產生)

**Step 1: 產生 migration 檔案**

```bash
cd frontend && npm run db:generate
```

預期輸出: 新檔案在 `frontend/drizzle/migrations/` 包含 CREATE TABLE reservations 的 SQL

**Step 2: 執行 migration (開發環境)**

```bash
cd frontend && npm run db:push
```

預期輸出: `✓ Database schema pushed successfully`

**Step 3: Commit migration 檔案**

```bash
git add frontend/drizzle/migrations/
git commit -m "chore(db): add migration for reservations table"
```

---

## Phase 2: Reservation Service (Core Business Logic)

### Task 2.1: 建立 reservation validator

**Files:**
- Create: `frontend/src/server/validators/reservation.schema.ts`
- Create: `frontend/src/server/validators/__tests__/reservation.schema.test.ts`

**Step 1: 撰寫失敗的驗證測試**

`frontend/src/server/validators/__tests__/reservation.schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createReservationSchema } from '../reservation.schema';

describe('createReservationSchema', () => {
  it('should validate valid reservation input', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 2,
      customerEmail: 'test@example.com',
    };
    
    expect(() => createReservationSchema.parse(input)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 2,
      customerEmail: 'invalid-email',
    };
    
    expect(() => createReservationSchema.parse(input)).toThrow();
  });

  it('should reject quantity <= 0', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 0,
      customerEmail: 'test@example.com',
    };
    
    expect(() => createReservationSchema.parse(input)).toThrow();
  });

  it('should reject quantity > 10', () => {
    const input = {
      eventId: 1,
      ticketTypeId: 1,
      quantity: 11,
      customerEmail: 'test@example.com',
    };
    
    expect(() => createReservationSchema.parse(input)).toThrow();
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/validators/__tests__/reservation.schema.test.ts
```

預期輸出: `FAIL - Cannot find module '../reservation.schema'`

**Step 3: 實作 validator**

`frontend/src/server/validators/reservation.schema.ts`:

```typescript
import { z } from 'zod';

export const createReservationSchema = z.object({
  eventId: z.number().int().positive(),
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  customerEmail: z.string().email(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/validators/__tests__/reservation.schema.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/validators/reservation.schema.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/validators/reservation.schema.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/validators/reservation.schema.ts frontend/src/server/validators/__tests__/reservation.schema.test.ts
git commit -m "feat(validators): add reservation input validation schema"
```

---

### Task 2.2: 實作 reservation service - createReservation

**Files:**
- Create: `frontend/src/server/services/reservation.ts`
- Create: `frontend/src/server/services/__tests__/reservation.test.ts`

**Step 1: 撰寫失敗的單元測試 - Happy Path**

`frontend/src/server/services/__tests__/reservation.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createReservation } from '../reservation';
import { db } from '@/server/db';
import { events, ticketTypes, reservations } from '@/server/db/schema';

describe('createReservation', () => {
  let testEventId: number;
  let testTicketTypeId: number;

  beforeEach(async () => {
    // Seed test data
    const [event] = await db.insert(events).values({
      title: 'Test Event',
      slug: 'test-event',
      status: 'PUBLISHED',
      totalCapacity: 10,
    }).returning();
    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypes).values({
      eventId: testEventId,
      name: 'Early Bird',
      price: 100,
      allocation: 10,
      enabled: true,
    }).returning();
    testTicketTypeId = ticketType.id;
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(reservations);
    await db.delete(ticketTypes);
    await db.delete(events);
  });

  it('should create reservation with 15-minute expiry', async () => {
    const input = {
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'test@example.com',
    };

    const reservation = await createReservation(input);

    expect(reservation.id).toBeDefined();
    expect(reservation.quantity).toBe(2);
    expect(reservation.status).toBe('ACTIVE');
    expect(reservation.customerEmail).toBe('test@example.com');

    // Verify 15-minute expiry
    const now = new Date();
    const expectedExpiry = new Date(now.getTime() + 15 * 60 * 1000);
    const diff = Math.abs(reservation.expiresAt.getTime() - expectedExpiry.getTime());
    expect(diff).toBeLessThan(1000); // Within 1 second tolerance
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `FAIL - Cannot find module '../reservation'`

**Step 3: 實作最小程式碼 - createReservation**

`frontend/src/server/services/reservation.ts`:

```typescript
import { db } from '@/server/db';
import { reservations } from '@/server/db/schema';
import { createReservationSchema, type CreateReservationInput } from '@/server/validators/reservation.schema';

const RESERVATION_EXPIRY_MINUTES = 15;

export async function createReservation(input: CreateReservationInput) {
  const validatedData = createReservationSchema.parse(input);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);

  const [reservation] = await db
    .insert(reservations)
    .values({
      eventId: validatedData.eventId,
      ticketTypeId: validatedData.ticketTypeId,
      quantity: validatedData.quantity,
      customerEmail: validatedData.customerEmail,
      status: 'ACTIVE',
      expiresAt,
    })
    .returning();

  return reservation;
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/services/reservation.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/reservation.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/services/reservation.ts frontend/src/server/services/__tests__/reservation.test.ts
git commit -m "feat(reservation): add createReservation with 15-minute expiry"
```

---

### Task 2.3: 實作庫存檢查與扣減邏輯

**Files:**
- Modify: `frontend/src/server/services/reservation.ts`
- Modify: `frontend/src/server/services/__tests__/reservation.test.ts`

**Step 1: 撰寫失敗的測試 - 庫存不足拒絕**

在 `frontend/src/server/services/__tests__/reservation.test.ts` 新增:

```typescript
it('should reject reservation when insufficient inventory', async () => {
  // Create 9 existing reservations (only 1 left)
  for (let i = 0; i < 9; i++) {
    await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 1,
      customerEmail: `user${i}@example.com`,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  }

  const input = {
    eventId: testEventId,
    ticketTypeId: testTicketTypeId,
    quantity: 2,
    customerEmail: 'test@example.com',
  };

  await expect(createReservation(input)).rejects.toThrow('Insufficient Inventory');
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `FAIL - Expected error not thrown`

**Step 3: 實作庫存檢查邏輯**

在 `frontend/src/server/services/reservation.ts` 新增 helper function:

```typescript
import { eq, and, sql } from 'drizzle-orm';
import { ticketTypes } from '@/server/db/schema';

async function getAvailableInventory(eventId: number, ticketTypeId: number): Promise<number> {
  // Get ticket type allocation
  const [ticketType] = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.id, ticketTypeId))
    .limit(1);

  if (!ticketType) {
    throw new Error('Ticket type not found');
  }

  // Get event total capacity
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    throw new Error('Event not found');
  }

  // Calculate reserved quantity (ACTIVE reservations only)
  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${reservations.quantity}), 0)` })
    .from(reservations)
    .where(
      and(
        eq(reservations.eventId, eventId),
        eq(reservations.status, 'ACTIVE')
      )
    );

  const totalReserved = Number(result.total);

  // Available = MIN(ticket allocation, event capacity) - reserved
  const capacity = ticketType.allocation ?? event.totalCapacity;
  return Math.max(0, capacity - totalReserved);
}
```

修改 `createReservation` 加入檢查:

```typescript
export async function createReservation(input: CreateReservationInput) {
  const validatedData = createReservationSchema.parse(input);

  // Check inventory availability
  const available = await getAvailableInventory(validatedData.eventId, validatedData.ticketTypeId);
  if (available < validatedData.quantity) {
    throw new Error('Insufficient Inventory');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);

  const [reservation] = await db
    .insert(reservations)
    .values({
      eventId: validatedData.eventId,
      ticketTypeId: validatedData.ticketTypeId,
      quantity: validatedData.quantity,
      customerEmail: validatedData.customerEmail,
      status: 'ACTIVE',
      expiresAt,
    })
    .returning();

  return reservation;
}
```

需要 import events:

```typescript
import { events, ticketTypes, reservations } from '@/server/db/schema';
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/services/reservation.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/reservation.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/services/reservation.ts frontend/src/server/services/__tests__/reservation.test.ts
git commit -m "feat(reservation): add inventory check to prevent overselling"
```

---

### Task 2.4: 實作 pessimistic locking 防止併發超賣

**Files:**
- Modify: `frontend/src/server/services/reservation.ts`
- Modify: `frontend/src/server/services/__tests__/reservation.test.ts`

**Step 1: 撰寫失敗的併發測試**

在 `frontend/src/server/services/__tests__/reservation.test.ts` 新增:

```typescript
it('should prevent concurrent reservations from overselling (race condition)', async () => {
  // Only 1 ticket available
  await db.insert(reservations).values({
    eventId: testEventId,
    ticketTypeId: testTicketTypeId,
    quantity: 9,
    customerEmail: 'existing@example.com',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const input1 = {
    eventId: testEventId,
    ticketTypeId: testTicketTypeId,
    quantity: 1,
    customerEmail: 'userA@example.com',
  };

  const input2 = {
    eventId: testEventId,
    ticketTypeId: testTicketTypeId,
    quantity: 1,
    customerEmail: 'userB@example.com',
  };

  // Simulate concurrent requests
  const results = await Promise.allSettled([
    createReservation(input1),
    createReservation(input2),
  ]);

  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');

  expect(successes.length).toBe(1);
  expect(failures.length).toBe(1);
  
  if (failures[0].status === 'rejected') {
    expect(failures[0].reason.message).toContain('Insufficient Inventory');
  }
});
```

**Step 2: 執行測試確認失敗 (可能會不穩定通過/失敗)**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `FAIL` (有時會因為 timing 而通過,但我們需要確保 100% 可靠)

**Step 3: 實作 transaction + row-level locking**

修改 `createReservation` 使用 transaction:

```typescript
export async function createReservation(input: CreateReservationInput) {
  const validatedData = createReservationSchema.parse(input);

  return await db.transaction(async (tx) => {
    // Lock the ticket type row to prevent race conditions
    const [ticketType] = await tx
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, validatedData.ticketTypeId))
      .for('update') // Pessimistic lock
      .limit(1);

    if (!ticketType) {
      throw new Error('Ticket type not found');
    }

    // Get event
    const [event] = await tx
      .select()
      .from(events)
      .where(eq(events.eventId, validatedData.eventId))
      .limit(1);

    if (!event) {
      throw new Error('Event not found');
    }

    // Calculate available inventory within transaction
    const [result] = await tx
      .select({ total: sql<number>`COALESCE(SUM(${reservations.quantity}), 0)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.eventId, validatedData.eventId),
          eq(reservations.status, 'ACTIVE')
        )
      );

    const totalReserved = Number(result.total);
    const capacity = ticketType.allocation ?? event.totalCapacity;
    const available = Math.max(0, capacity - totalReserved);

    if (available < validatedData.quantity) {
      throw new Error('Insufficient Inventory');
    }

    // Create reservation
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);

    const [reservation] = await tx
      .insert(reservations)
      .values({
        eventId: validatedData.eventId,
        ticketTypeId: validatedData.ticketTypeId,
        quantity: validatedData.quantity,
        customerEmail: validatedData.customerEmail,
        status: 'ACTIVE',
        expiresAt,
      })
      .returning();

    return reservation;
  });
}
```

移除獨立的 `getAvailableInventory` function (邏輯已整合進 transaction)。

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `PASS` (所有測試包含併發測試)

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/services/reservation.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/reservation.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/services/reservation.ts frontend/src/server/services/__tests__/reservation.test.ts
git commit -m "feat(reservation): add pessimistic locking to prevent race conditions"
```

---

### Task 2.5: 實作 getReservationById 和 markReservationConsumed

**Files:**
- Modify: `frontend/src/server/services/reservation.ts`
- Modify: `frontend/src/server/services/__tests__/reservation.test.ts`

**Step 1: 撰寫失敗的測試**

在 `frontend/src/server/services/__tests__/reservation.test.ts` 新增:

```typescript
describe('getReservationById', () => {
  it('should return reservation by id', async () => {
    const [reservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }).returning();

    const result = await getReservationById(reservation.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(reservation.id);
    expect(result?.status).toBe('ACTIVE');
  });

  it('should return null when reservation not found', async () => {
    const result = await getReservationById(99999);
    expect(result).toBeNull();
  });
});

describe('markReservationConsumed', () => {
  it('should mark reservation as consumed', async () => {
    const [reservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }).returning();

    const updated = await markReservationConsumed(reservation.id);

    expect(updated.status).toBe('CONSUMED');
  });

  it('should throw error when reservation not found', async () => {
    await expect(markReservationConsumed(99999)).rejects.toThrow('Reservation not found');
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `FAIL - getReservationById is not defined`

**Step 3: 實作 functions**

在 `frontend/src/server/services/reservation.ts` 新增:

```typescript
export async function getReservationById(reservationId: number) {
  const [reservation] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);

  return reservation ?? null;
}

export async function markReservationConsumed(reservationId: number) {
  const [reservation] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  const [updated] = await db
    .update(reservations)
    .set({ status: 'CONSUMED' })
    .where(eq(reservations.id, reservationId))
    .returning();

  return updated;
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/services/reservation.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/reservation.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/services/reservation.ts frontend/src/server/services/__tests__/reservation.test.ts
git commit -m "feat(reservation): add getReservationById and markReservationConsumed"
```

---

## Phase 3: API Routes

### Task 3.1: 建立 POST /api/reservations API route

**Files:**
- Create: `frontend/src/app/api/reservations/route.ts`
- Create: `frontend/src/app/api/reservations/__tests__/route.test.ts`

**Step 1: 撰寫失敗的 API 測試**

`frontend/src/app/api/reservations/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { db } from '@/server/db';
import { events, ticketTypes, reservations } from '@/server/db/schema';
import { NextRequest } from 'next/server';

describe('POST /api/reservations', () => {
  let testEventId: number;
  let testTicketTypeId: number;

  beforeEach(async () => {
    const [event] = await db.insert(events).values({
      title: 'Test Event',
      slug: 'test-event',
      status: 'PUBLISHED',
      totalCapacity: 10,
    }).returning();
    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypes).values({
      eventId: testEventId,
      name: 'Early Bird',
      price: 100,
      allocation: 10,
      enabled: true,
    }).returning();
    testTicketTypeId = ticketType.id;
  });

  afterEach(async () => {
    await db.delete(reservations);
    await db.delete(ticketTypes);
    await db.delete(events);
  });

  it('should create reservation and return 201', async () => {
    const request = new NextRequest('http://localhost:3000/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: testEventId,
        ticketTypeId: testTicketTypeId,
        quantity: 2,
        customerEmail: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.quantity).toBe(2);
    expect(data.status).toBe('ACTIVE');
  });

  it('should return 400 when insufficient inventory', async () => {
    await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 10,
      customerEmail: 'existing@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const request = new NextRequest('http://localhost:3000/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: testEventId,
        ticketTypeId: testTicketTypeId,
        quantity: 1,
        customerEmail: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Insufficient Inventory');
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/app/api/reservations/__tests__/route.test.ts
```

預期輸出: `FAIL - Cannot find module '../route'`

**Step 3: 實作 API route**

`frontend/src/app/api/reservations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createReservation } from '@/server/services/reservation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reservation = await createReservation(body);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'Insufficient Inventory') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/app/api/reservations/__tests__/route.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/app/api/reservations/route.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/app/api/reservations/route.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/app/api/reservations/
git commit -m "feat(api): add POST /api/reservations endpoint"
```

---

### Task 3.2: 建立 GET /api/reservations/[id] API route

**Files:**
- Create: `frontend/src/app/api/reservations/[id]/route.ts`
- Create: `frontend/src/app/api/reservations/[id]/__tests__/route.test.ts`

**Step 1: 撰寫失敗的測試**

`frontend/src/app/api/reservations/[id]/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '../route';
import { db } from '@/server/db';
import { events, ticketTypes, reservations } from '@/server/db/schema';
import { NextRequest } from 'next/server';

describe('GET /api/reservations/[id]', () => {
  let testEventId: number;
  let testTicketTypeId: number;
  let testReservationId: number;

  beforeEach(async () => {
    const [event] = await db.insert(events).values({
      title: 'Test Event',
      slug: 'test-event',
      status: 'PUBLISHED',
      totalCapacity: 10,
    }).returning();
    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypes).values({
      eventId: testEventId,
      name: 'Early Bird',
      price: 100,
      allocation: 10,
      enabled: true,
    }).returning();
    testTicketTypeId = ticketType.id;

    const [reservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }).returning();
    testReservationId = reservation.id;
  });

  afterEach(async () => {
    await db.delete(reservations);
    await db.delete(ticketTypes);
    await db.delete(events);
  });

  it('should return reservation by id', async () => {
    const request = new NextRequest(`http://localhost:3000/api/reservations/${testReservationId}`);
    const response = await GET(request, { params: { id: String(testReservationId) } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(testReservationId);
    expect(data.status).toBe('ACTIVE');
  });

  it('should return 404 when reservation not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/reservations/99999');
    const response = await GET(request, { params: { id: '99999' } });

    expect(response.status).toBe(404);
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/app/api/reservations/[id]/__tests__/route.test.ts
```

預期輸出: `FAIL - Cannot find module '../route'`

**Step 3: 實作 API route**

`frontend/src/app/api/reservations/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getReservationById } from '@/server/services/reservation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = Number.parseInt(params.id, 10);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    const reservation = await getReservationById(reservationId);

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/app/api/reservations/[id]/__tests__/route.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/app/api/reservations/[id]/route.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/app/api/reservations/[id]/route.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/app/api/reservations/[id]/
git commit -m "feat(api): add GET /api/reservations/[id] endpoint"
```

---

## Phase 4: BDD Step Definitions

### Task 4.1: 實作 event-ticketing.steps.ts - Reservation Steps

**Files:**
- Modify: `e2e/tests/bdd-steps/event-ticketing.steps.ts`

**Step 1: 撰寫 reservation 相關 step definitions**

修改 `e2e/tests/bdd-steps/event-ticketing.steps.ts` 中的 stub functions:

```typescript
// Add to World context
interface ReservationData {
  id: number;
  quantity: number;
  status: string;
  expiresAt: string;
}

let lastReservation: ReservationData | null = null;
let lastError: string | null = null;

// --- Reservation ---
When(
  'I request a reservation for {int} {string} tickets for {string}',
  async (qty: number, ticketTypeName: string, eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;
    
    if (!event) {
      throw new Error('No event available for reservation');
    }

    const ticketType = event.ticketTypes?.find(tt => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type ${ticketTypeName} not found`);
    }

    try {
      const response = await page.request.post('/api/reservations', {
        data: {
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity: qty,
          customerEmail: 'test@example.com',
        },
      });

      if (response.ok()) {
        lastReservation = await response.json();
        lastError = null;
      } else {
        const errorData = await response.json();
        lastError = errorData.error;
        lastReservation = null;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      lastReservation = null;
    }
  }
);

Then('the reservation should be created', async () => {
  expect(lastReservation).toBeTruthy();
  expect(lastReservation?.id).toBeDefined();
  expect(lastReservation?.status).toBe('ACTIVE');
});

Then('the reservation should expire in {int} minutes', async (minutes: number) => {
  expect(lastReservation).toBeTruthy();
  
  if (lastReservation) {
    const expiresAt = new Date(lastReservation.expiresAt);
    const now = new Date();
    const diff = (expiresAt.getTime() - now.getTime()) / 1000 / 60; // minutes
    
    expect(diff).toBeGreaterThan(minutes - 1);
    expect(diff).toBeLessThanOrEqual(minutes);
  }
});

Then('the request should be rejected with error {string}', async (errorMessage: string) => {
  expect(lastError).toBeTruthy();
  expect(lastError).toContain(errorMessage);
});
```

**Step 2: 執行 BDD 測試確認相關 scenarios 通過**

```bash
npm run test:bdd -- --grep "Reserve tickets at checkout"
npm run test:bdd -- --grep "Reject reservation when requested quantity exceeds availability"
```

預期輸出: `PASS` for both scenarios

**Step 3: Commit**

```bash
git add e2e/tests/bdd-steps/event-ticketing.steps.ts
git commit -m "feat(bdd): implement reservation step definitions"
```

---

## Phase 5: Reservation Expiry (Background Job Simulation)

### Task 5.1: 實作 expireReservations service function

**Files:**
- Modify: `frontend/src/server/services/reservation.ts`
- Modify: `frontend/src/server/services/__tests__/reservation.test.ts`

**Step 1: 撰寫失敗的測試**

在 `frontend/src/server/services/__tests__/reservation.test.ts` 新增:

```typescript
describe('expireReservations', () => {
  it('should mark expired reservations as EXPIRED', async () => {
    // Create reservation that expired 1 minute ago
    const [expiredReservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'expired@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
    }).returning();

    // Create reservation that expires in 10 minutes (should not be touched)
    const [activeReservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 1,
      customerEmail: 'active@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    }).returning();

    await expireReservations();

    // Check expired reservation is marked EXPIRED
    const expired = await getReservationById(expiredReservation.id);
    expect(expired?.status).toBe('EXPIRED');

    // Check active reservation is still ACTIVE
    const active = await getReservationById(activeReservation.id);
    expect(active?.status).toBe('ACTIVE');
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `FAIL - expireReservations is not defined`

**Step 3: 實作 expireReservations**

在 `frontend/src/server/services/reservation.ts` 新增:

```typescript
import { lt } from 'drizzle-orm';

export async function expireReservations() {
  const now = new Date();

  await db
    .update(reservations)
    .set({ status: 'EXPIRED' })
    .where(
      and(
        eq(reservations.status, 'ACTIVE'),
        lt(reservations.expiresAt, now)
      )
    );
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/reservation.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/services/reservation.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/reservation.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/services/reservation.ts frontend/src/server/services/__tests__/reservation.test.ts
git commit -m "feat(reservation): add expireReservations to release inventory"
```

---

### Task 5.2: 建立 API endpoint 觸發過期清理 (Cron Job Entry Point)

**Files:**
- Create: `frontend/src/app/api/cron/expire-reservations/route.ts`

**Step 1: 實作 cron endpoint (無需單元測試,因為只是 service wrapper)**

`frontend/src/app/api/cron/expire-reservations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { expireReservations } from '@/server/services/reservation';

/**
 * Cron endpoint to expire reservations
 * Should be called periodically (e.g., every 1 minute) by Cloud Scheduler or similar
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: verify cron secret header for security
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await expireReservations();

    return NextResponse.json({ message: 'Reservations expired successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error expiring reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/app/api/cron/expire-reservations/route.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/app/api/cron/expire-reservations/route.ts', errorsOnly: false });
```

**Step 3: Commit**

```bash
git add frontend/src/app/api/cron/expire-reservations/
git commit -m "feat(api): add cron endpoint for expiring reservations"
```

---

## Phase 6: Integration with Orders (Payment Success)

### Task 6.1: 修改 orders schema 加入 reservationId FK

**Files:**
- Modify: `frontend/src/server/db/schema.ts`

**Step 1: 撰寫失敗的測試**

在 `frontend/src/server/db/__tests__/schema.test.ts` 新增:

```typescript
describe('orders schema', () => {
  it('should have reservationId foreign key', () => {
    const columns = orders._.columns;
    expect(columns.reservationId).toBeDefined();
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/db/__tests__/schema.test.ts
```

預期輸出: `FAIL - reservationId is not defined`

**Step 3: 修改 orders schema**

在 `frontend/src/server/db/schema.ts` 的 `orders` table 加入:

```typescript
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    reservationId: integer('reservation_id').references(() => reservations.id, { onDelete: 'set null' }),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    totalAmount: integer('total_amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/db/__tests__/schema.test.ts
```

預期輸出: `PASS`

**Step 5: 產生並推送 migration**

```bash
cd frontend && npm run db:generate
cd frontend && npm run db:push
```

**Step 6: Commit**

```bash
git add frontend/src/server/db/schema.ts frontend/src/server/db/__tests__/schema.test.ts frontend/drizzle/migrations/
git commit -m "feat(db): add reservationId FK to orders table"
```

---

### Task 6.2: 建立 order service - createOrderFromReservation

**Files:**
- Create: `frontend/src/server/services/order.ts`
- Create: `frontend/src/server/services/__tests__/order.test.ts`

**Step 1: 撰寫失敗的測試**

`frontend/src/server/services/__tests__/order.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createOrderFromReservation } from '../order';
import { db } from '@/server/db';
import { events, ticketTypes, reservations, orders } from '@/server/db/schema';

describe('createOrderFromReservation', () => {
  let testEventId: number;
  let testTicketTypeId: number;
  let testReservationId: number;

  beforeEach(async () => {
    const [event] = await db.insert(events).values({
      title: 'Test Event',
      slug: 'test-event',
      status: 'PUBLISHED',
      totalCapacity: 10,
    }).returning();
    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypes).values({
      eventId: testEventId,
      name: 'Early Bird',
      price: 100,
      allocation: 10,
      enabled: true,
    }).returning();
    testTicketTypeId = ticketType.id;

    const [reservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }).returning();
    testReservationId = reservation.id;
  });

  afterEach(async () => {
    await db.delete(orders);
    await db.delete(reservations);
    await db.delete(ticketTypes);
    await db.delete(events);
  });

  it('should create order and mark reservation as consumed', async () => {
    const order = await createOrderFromReservation(testReservationId);

    expect(order.id).toBeDefined();
    expect(order.reservationId).toBe(testReservationId);
    expect(order.status).toBe('PAID');
    expect(order.totalAmount).toBe(200); // 2 tickets * 100 price
    expect(order.customerEmail).toBe('test@example.com');

    // Verify reservation is marked consumed
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, testReservationId))
      .limit(1);

    expect(reservation.status).toBe('CONSUMED');
  });

  it('should throw error when reservation not found', async () => {
    await expect(createOrderFromReservation(99999)).rejects.toThrow('Reservation not found');
  });

  it('should throw error when reservation is not ACTIVE', async () => {
    await db
      .update(reservations)
      .set({ status: 'EXPIRED' })
      .where(eq(reservations.id, testReservationId));

    await expect(createOrderFromReservation(testReservationId)).rejects.toThrow('Reservation is not active');
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/order.test.ts
```

預期輸出: `FAIL - Cannot find module '../order'`

**Step 3: 實作 createOrderFromReservation**

`frontend/src/server/services/order.ts`:

```typescript
import { db } from '@/server/db';
import { orders, reservations, ticketTypes } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { markReservationConsumed } from './reservation';

export async function createOrderFromReservation(reservationId: number) {
  return await db.transaction(async (tx) => {
    // Get reservation
    const [reservation] = await tx
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'ACTIVE') {
      throw new Error('Reservation is not active');
    }

    // Get ticket type to calculate total amount
    const [ticketType] = await tx
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, reservation.ticketTypeId))
      .limit(1);

    if (!ticketType) {
      throw new Error('Ticket type not found');
    }

    const totalAmount = ticketType.price * reservation.quantity;

    // Create order
    const [order] = await tx
      .insert(orders)
      .values({
        reservationId: reservationId,
        customerEmail: reservation.customerEmail,
        status: 'PAID',
        totalAmount,
      })
      .returning();

    // Mark reservation as consumed
    await tx
      .update(reservations)
      .set({ status: 'CONSUMED' })
      .where(eq(reservations.id, reservationId));

    return order;
  });
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/server/services/__tests__/order.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/server/services/order.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/server/services/order.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/server/services/order.ts frontend/src/server/services/__tests__/order.test.ts
git commit -m "feat(order): add createOrderFromReservation for payment success"
```

---

### Task 6.3: 建立 POST /api/orders API endpoint

**Files:**
- Create: `frontend/src/app/api/orders/route.ts`
- Create: `frontend/src/app/api/orders/__tests__/route.test.ts`

**Step 1: 撰寫失敗的測試**

`frontend/src/app/api/orders/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { db } from '@/server/db';
import { events, ticketTypes, reservations, orders } from '@/server/db/schema';
import { NextRequest } from 'next/server';

describe('POST /api/orders', () => {
  let testEventId: number;
  let testTicketTypeId: number;
  let testReservationId: number;

  beforeEach(async () => {
    const [event] = await db.insert(events).values({
      title: 'Test Event',
      slug: 'test-event',
      status: 'PUBLISHED',
      totalCapacity: 10,
    }).returning();
    testEventId = event.id;

    const [ticketType] = await db.insert(ticketTypes).values({
      eventId: testEventId,
      name: 'Early Bird',
      price: 100,
      allocation: 10,
      enabled: true,
    }).returning();
    testTicketTypeId = ticketType.id;

    const [reservation] = await db.insert(reservations).values({
      eventId: testEventId,
      ticketTypeId: testTicketTypeId,
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }).returning();
    testReservationId = reservation.id;
  });

  afterEach(async () => {
    await db.delete(orders);
    await db.delete(reservations);
    await db.delete(ticketTypes);
    await db.delete(events);
  });

  it('should create order from reservation', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        reservationId: testReservationId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.status).toBe('PAID');
    expect(data.totalAmount).toBe(200);
  });

  it('should return 404 when reservation not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        reservationId: 99999,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
  });
});
```

**Step 2: 執行測試確認失敗**

```bash
cd frontend && npm run test:unit -- src/app/api/orders/__tests__/route.test.ts
```

預期輸出: `FAIL - Cannot find module '../route'`

**Step 3: 實作 API route**

`frontend/src/app/api/orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createOrderFromReservation } from '@/server/services/order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId } = body;

    if (!reservationId) {
      return NextResponse.json({ error: 'reservationId is required' }, { status: 400 });
    }

    const order = await createOrderFromReservation(Number(reservationId));

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Reservation not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === 'Reservation is not active') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 4: 執行測試確認通過**

```bash
cd frontend && npm run test:unit -- src/app/api/orders/__tests__/route.test.ts
```

預期輸出: `PASS`

**Step 5: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/app/api/orders/route.ts' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/app/api/orders/route.ts', errorsOnly: false });
```

**Step 6: Commit**

```bash
git add frontend/src/app/api/orders/
git commit -m "feat(api): add POST /api/orders endpoint for payment success"
```

---

## Phase 7: Final Integration & BDD Verification

### Task 7.1: 完成所有 BDD step definitions

**Files:**
- Modify: `e2e/tests/bdd-steps/event-ticketing.steps.ts`

**Step 1: 實作剩餘的 stub functions**

修改所有標記為 `// Stub` 的 functions:

```typescript
Given(
  'there are {int} active {string} reservations for {string}',
  async (count: number, ticketTypeName: string, eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;
    
    if (!event) {
      throw new Error('No event available');
    }

    const ticketType = event.ticketTypes?.find(tt => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type ${ticketTypeName} not found`);
    }

    // Create multiple reservations
    for (let i = 0; i < count; i++) {
      await page.request.post('/api/reservations', {
        data: {
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity: 1,
          customerEmail: `user${i}@example.com`,
        },
      });
    }
  }
);

When(
  'User A requests a reservation for {int} {string} ticket for {string}',
  async (qty: number, ticketTypeName: string, eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;
    
    if (!event) {
      throw new Error('No event available');
    }

    const ticketType = event.ticketTypes?.find(tt => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type ${ticketTypeName} not found`);
    }

    // Store for concurrent test
    pageFixture.concurrentRequest1 = page.request.post('/api/reservations', {
      data: {
        eventId: event.id,
        ticketTypeId: ticketType.id,
        quantity: qty,
        customerEmail: 'userA@example.com',
      },
    });
  }
);

When(
  'User B requests a reservation for {int} {string} ticket for {string} at the same time',
  async (qty: number, ticketTypeName: string, eventTitle: string) => {
    const page = pageFixture.page;
    const event = pageFixture.createdEvent;
    
    if (!event) {
      throw new Error('No event available');
    }

    const ticketType = event.ticketTypes?.find(tt => tt.name === ticketTypeName);
    if (!ticketType) {
      throw new Error(`Ticket type ${ticketTypeName} not found`);
    }

    pageFixture.concurrentRequest2 = page.request.post('/api/reservations', {
      data: {
        eventId: event.id,
        ticketTypeId: ticketType.id,
        quantity: qty,
        customerEmail: 'userB@example.com',
      },
    });

    // Wait for both requests to complete
    const [response1, response2] = await Promise.all([
      pageFixture.concurrentRequest1,
      pageFixture.concurrentRequest2,
    ]);

    pageFixture.concurrentResults = [response1, response2];
  }
);

Then('only one reservation request should succeed', async () => {
  const results = pageFixture.concurrentResults;
  expect(results).toBeDefined();
  expect(results?.length).toBe(2);

  const successes = results?.filter(r => r.ok()).length || 0;
  expect(successes).toBe(1);
});

When('my payment succeeds for the reservation', async () => {
  const page = pageFixture.page;
  
  if (!lastReservation) {
    throw new Error('No active reservation');
  }

  const response = await page.request.post('/api/orders', {
    data: {
      reservationId: lastReservation.id,
    },
  });

  expect(response.ok()).toBeTruthy();
  pageFixture.lastOrder = await response.json();
});

Then('an order should be created for {string}', async (eventTitle: string) => {
  expect(pageFixture.lastOrder).toBeDefined();
  expect(pageFixture.lastOrder?.id).toBeDefined();
});

Then('the order status should be {string}', async (status: string) => {
  expect(pageFixture.lastOrder?.status).toBe(status);
});

Then('the reservation should be marked as consumed', async () => {
  const page = pageFixture.page;
  
  if (!lastReservation) {
    throw new Error('No reservation to check');
  }

  const response = await page.request.get(`/api/reservations/${lastReservation.id}`);
  const reservation = await response.json();

  expect(reservation.status).toBe('CONSUMED');
});
```

在 `pageFixture` interface 加入:

```typescript
interface PageFixture {
  page: Page;
  createdEvent?: any;
  lastOrder?: any;
  concurrentRequest1?: Promise<any>;
  concurrentRequest2?: Promise<any>;
  concurrentResults?: any[];
}
```

**Step 2: 執行所有 BDD tests**

```bash
npm run test:bdd
```

預期輸出: 所有 scenarios 應該 PASS (除了尚未實作的 UI scenarios)

**Step 3: Commit**

```bash
git add e2e/tests/bdd-steps/event-ticketing.steps.ts
git commit -m "feat(bdd): complete all reservation and order step definitions"
```

---

### Task 7.2: 執行完整測試套件

**Step 1: 執行所有單元測試**

```bash
cd frontend && npm run test:unit
```

預期輸出: `All tests passed`

**Step 2: 執行 BDD tests**

```bash
npm run test:bdd
```

預期輸出: 所有已實作的 scenarios PASS

**Step 3: 執行 build 驗證 TypeScript**

```bash
npm run build -w frontend
```

預期輸出: `✓ Compiled successfully`

**Step 4: 最終 commit**

```bash
git add .
git commit -m "chore: verify all tests pass for event ticketing reservations"
```

---

## Summary

**實作完成的功能:**

1. ✅ Reservations 資料表與 schema
2. ✅ Reservation service (create, get, expire, mark consumed)
3. ✅ Inventory management with pessimistic locking
4. ✅ API endpoints (POST /api/reservations, GET /api/reservations/[id])
5. ✅ Order creation from reservation (POST /api/orders)
6. ✅ Expiry cron job endpoint
7. ✅ BDD step definitions for E2E verification

**測試覆蓋率:**

- Unit tests: reservation.test.ts, order.test.ts, schema.test.ts
- API tests: route.test.ts files
- BDD tests: event-ticketing.feature scenarios

**下一步建議:**

- 實作前端 UI (reservation form, checkout page)
- 整合支付閘道 (Stripe/ECPay)
- 設定 GCP Cloud Scheduler 定期呼叫 expire-reservations endpoint
- 加入 email notification (reservation created, payment success)
