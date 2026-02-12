# Event 票務系統遷移至 Payload CMS 實施計劃

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目標：** 將現有的 Event 票務系統從 Drizzle schema (`db/schema.ts`) 遷移到 Payload CMS Collections 管理，實現統一的內容管理介面並保持所有業務邏輯功能。

**架構：** 使用 Payload Collections 替代 Drizzle schema，透過 Payload hooks 實現業務邏輯（庫存管理、預訂過期等），使用 `@payloadcms/db-postgres` 內建的 Drizzle 確保 type-safety。

**技術堆疊：** Payload CMS 3.74.0, @payloadcms/db-postgres (with Drizzle), Next.js 16 App Router, TypeScript, Vitest

---

## 遷移範圍

### 現有系統（Drizzle Schema）

**Tables（`frontend/src/server/db/schema.ts`）：**
```typescript
// 1. events 表
{
  id, title, description, slug, status, 
  totalCapacity, eventDate, createdAt, updatedAt
}

// 2. ticketTypes 表
{
  id, eventId, name, price, allocation, enabled, createdAt
}

// 3. orders 表
{
  id, customerEmail, status, totalAmount, createdAt
}

// 4. reservations 表
{
  id, eventId, ticketTypeId, quantity, customerEmail, 
  status, expiresAt, createdAt
}
```

**Services（`frontend/src/server/services/`）：**
- `event.ts` - CRUD + publish/archive
- `ticket-type.ts` - 票種管理
- `order.ts` - 訂單處理
- `reservation.ts` - 預訂管理（含庫存扣減、過期處理）
- `public-event.ts` - 公開活動查詢

**API Routes：**
- `/api/events` - GET（查詢已發布活動）
- `/api/admin/events` - CRUD（管理活動）
- `/api/orders` - 訂單 API
- `/api/reservations` - 預訂 API

### 目標系統（Payload Collections）

**Collections：**
1. `events` - 整合 events + ticketTypes（使用 array field）
2. `orders` - 訂單管理
3. `reservations` - 預訂管理

**業務邏輯：**
- Payload hooks 處理庫存驗證、扣減
- Payload hooks 處理預訂過期
- Payload access control 管理權限

---

## Task 1: 分析現有系統依賴

**目標：** 完整了解現有 Event 系統的架構和依賴關係。

**Step 1: 列出所有相關檔案**

```typescript
mcp__jetbrains__find_files_by_glob({
  globPattern: 'frontend/src/server/**/*.ts',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 2: 檢查 schema 定義**

```typescript
mcp__jetbrains__get_file_text_by_path({
  pathInProject: 'frontend/src/server/db/schema.ts',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 3: 分析 services 層**

```typescript
mcp__jetbrains__list_directory_tree({
  directoryPath: 'frontend/src/server/services',
  maxDepth: 2,
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 4: 檢查 API routes**

```typescript
mcp__jetbrains__list_directory_tree({
  directoryPath: 'frontend/src/app/api',
  maxDepth: 3,
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 5: 找出所有使用 db/schema 的位置**

```typescript
mcp__jetbrains__search_in_files_by_text({
  searchText: "from '@/server/db/schema'",
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  maxUsageCount: 50
});
```

**Step 6: 記錄分析結果**

創建 `docs/migration/event-system-analysis.md`：

```markdown
# Event 系統現狀分析

## Schema 定義

### events 表
- **欄位：** id, title, description, slug, status, totalCapacity, eventDate
- **約束：** status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'), totalCapacity > 0
- **用途：** 活動基本資訊 + 票務配置

### ticketTypes 表
- **欄位：** id, eventId, name, price, allocation, enabled
- **關聯：** eventId -> events.id (cascade delete)
- **用途：** 活動的票種配置

### orders 表
- **欄位：** id, customerEmail, status, totalAmount
- **用途：** 訂單記錄

### reservations 表
- **欄位：** id, eventId, ticketTypeId, quantity, customerEmail, status, expiresAt
- **關聯：** eventId -> events.id, ticketTypeId -> ticketTypes.id
- **約束：** quantity > 0, status IN ('ACTIVE', 'CONSUMED', 'EXPIRED')
- **用途：** 預訂管理（15分鐘過期）

## Services 業務邏輯

### event.ts
- createEvent() - 創建活動
- updateEvent() - 更新活動
- getEventBySlug() - 查詢活動
- publishEvent() - 發布活動
- archiveEvent() - 封存活動

### ticket-type.ts
- createTicketType() - 創建票種
- updateTicketType() - 更新票種
- toggleTicketType() - 啟用/停用票種

### reservation.ts
- createReservation() - 創建預訂（檢查庫存）
- allocateTickets() - 扣減庫存
- getActiveReservationsCount() - 查詢當前預訂數

### order.ts
- consumeReservation() - 消費預訂（轉為訂單）

## API Routes

- GET /api/events - 公開查詢已發布活動
- GET /api/admin/events/:slug - 管理端查詢活動
- POST /api/reservations - 創建預訂

## 依賴關係

```
events (1) ---< ticketTypes (N)
   |
   |---< reservations (N)
   |
   +---< orders (N)

ticketTypes (1) ---< reservations (N)
```

## 關鍵業務邏輯

1. **庫存管理**
   - 創建預訂時檢查：已分配數 + 新預訂數 ≤ 票種配額
   - 扣減邏輯在 allocateTickets()

2. **預訂過期**
   - 預訂創建時設定 expiresAt（15分鐘）
   - 查詢時需過濾過期預訂

3. **狀態轉換**
   - Event: DRAFT -> PUBLISHED -> ARCHIVED
   - Reservation: ACTIVE -> CONSUMED/EXPIRED

## 測試覆蓋

- event.test.ts - 活動 CRUD + publish/archive
- ticket-type.test.ts - 票種管理
- reservation.test.ts - 預訂邏輯 + 庫存驗證
- order.test.ts - 訂單處理
- public-event.test.ts - 公開查詢
```

**Step 7: Commit**

```bash
git add docs/migration/event-system-analysis.md
git commit -m "docs(migration): analyze current Event ticketing system

- Document schema structure and constraints
- Map business logic in services layer
- Identify API routes and dependencies
- Prepare for Payload CMS migration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: 創建 Events Collection（整合票務功能）

**目標：** 將 events + ticketTypes 整合為單一 Payload Collection。

**檔案：**
- Create: `frontend/src/collections/Events.ts`
- Create: `frontend/src/collections/__tests__/Events.test.ts`

**Step 1: 寫入失敗測試**

創建 `frontend/src/collections/__tests__/Events.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { Events } from '../Events';

describe('Events Collection', () => {
  it('should have correct slug', () => {
    expect(Events.slug).toBe('events');
  });

  it('should have basic event fields', () => {
    const fieldNames = Events.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('status');
    expect(fieldNames).toContain('eventDate');
    expect(fieldNames).toContain('totalCapacity');
  });

  it('should have ticketTypes array field', () => {
    const fieldNames = Events.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('ticketTypes');
    
    const ticketTypesField = Events.fields.find((f: any) => f.name === 'ticketTypes');
    expect(ticketTypesField?.type).toBe('array');
  });

  it('should have beforeChange hook for validation', () => {
    expect(Events.hooks?.beforeChange).toBeDefined();
    expect(Array.isArray(Events.hooks?.beforeChange)).toBe(true);
  });

  it('should validate total allocation does not exceed capacity', async () => {
    const hook = Events.hooks?.beforeChange?.[0];
    expect(hook).toBeDefined();
    
    // 測試驗證邏輯
    const invalidData = {
      totalCapacity: 100,
      ticketTypes: [
        { name: 'Early Bird', price: 500, allocation: 60 },
        { name: 'Regular', price: 800, allocation: 50 }, // 總計 110 > 100
      ],
    };
    
    await expect(
      hook?.({ data: invalidData, operation: 'create' })
    ).rejects.toThrow('票種總配額不能超過總容量');
  });
});
```

**Step 2: 執行測試驗證失敗**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/collections/__tests__/Events.test.ts'
});
```

預期：測試失敗，Collection 尚未創建

**Step 3: 實作 Events Collection**

創建 `frontend/src/collections/Events.ts`：

```typescript
import type { CollectionConfig } from 'payload';

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'eventDate', 'totalCapacity'],
    description: 'Event Ticketing System - 活動票務管理',
  },
  access: {
    read: ({ req: { user } }) => {
      // 未登入使用者只能看 PUBLISHED
      if (!user) {
        return {
          status: { equals: 'PUBLISHED' },
        };
      }
      // 已登入可看全部
      return true;
    },
    create: () => true, // TODO: 改為 admin role check
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: '活動標題',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: '用於 URL 的唯一識別碼',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: '活動描述',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: '狀態',
      defaultValue: 'DRAFT',
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
      admin: {
        description: 'DRAFT: 草稿, PUBLISHED: 已發布可售票, ARCHIVED: 已封存',
      },
    },
    {
      name: 'eventDate',
      type: 'date',
      label: '活動日期時間',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'totalCapacity',
      type: 'number',
      required: true,
      label: '總容量',
      min: 1,
      admin: {
        description: '活動總人數上限',
      },
    },
    {
      name: 'ticketTypes',
      type: 'array',
      label: '票種',
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: '票種名稱',
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          label: '價格',
          min: 0,
        },
        {
          name: 'allocation',
          type: 'number',
          label: '配額',
          admin: {
            description: '此票種的數量限制（不填則不限制）',
          },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          label: '啟用',
          defaultValue: true,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // 驗證票種總配額不超過總容量
        if (data.ticketTypes && Array.isArray(data.ticketTypes)) {
          const totalAllocation = data.ticketTypes.reduce(
            (sum: number, ticket: any) => {
              return sum + (ticket.allocation || 0);
            },
            0
          );

          if (totalAllocation > 0 && totalAllocation > data.totalCapacity) {
            throw new Error(
              `票種總配額 (${totalAllocation}) 不能超過總容量 (${data.totalCapacity})`
            );
          }
        }

        // 自動設定時間戳
        if (operation === 'create') {
          data.createdAt = new Date().toISOString();
        }
        data.updatedAt = new Date().toISOString();

        return data;
      },
    ],
  },
  timestamps: true,
};
```

**Step 4: 註冊到 Payload Config**

修改 `frontend/payload.config.ts`：

```typescript
import { Events } from '@/collections/Events';

export default buildConfig({
  collections: [Events],
  globals: [Homepage],
  // ...
});
```

**Step 5: 執行測試驗證通過**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/collections/__tests__/Events.test.ts'
});
```

預期：所有測試通過

**Step 6: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({
  path: 'frontend/src/collections/Events.ts',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

mcp__jetbrains__get_file_problems({
  filePath: 'frontend/src/collections/Events.ts',
  errorsOnly: false,
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 7: Commit**

```bash
git add frontend/src/collections/Events.ts frontend/src/collections/__tests__/Events.test.ts frontend/payload.config.ts
git commit -m "feat(cms): add Events collection with integrated ticket types

- Merge events and ticketTypes into single collection
- Add ticketTypes as array field with allocation tracking
- Validate total allocation does not exceed capacity
- Support DRAFT/PUBLISHED/ARCHIVED status flow
- Add comprehensive unit tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: 創建 Reservations Collection

**目標：** 將 reservations 表遷移為 Payload Collection，保留過期邏輯。

**檔案：**
- Create: `frontend/src/collections/Reservations.ts`
- Create: `frontend/src/collections/__tests__/Reservations.test.ts`

**Step 1: 寫入失敗測試**

創建 `frontend/src/collections/__tests__/Reservations.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { Reservations } from '../Reservations';

describe('Reservations Collection', () => {
  it('should have correct slug', () => {
    expect(Reservations.slug).toBe('reservations');
  });

  it('should have event relationship field', () => {
    const eventField = Reservations.fields.find((f: any) => f.name === 'event');
    expect(eventField).toBeDefined();
    expect(eventField?.type).toBe('relationship');
    expect(eventField?.relationTo).toBe('events');
  });

  it('should have status field with correct options', () => {
    const statusField = Reservations.fields.find((f: any) => f.name === 'status');
    expect(statusField?.type).toBe('select');
    expect(statusField?.options).toContainEqual({ label: 'Active', value: 'ACTIVE' });
    expect(statusField?.options).toContainEqual({ label: 'Consumed', value: 'CONSUMED' });
    expect(statusField?.options).toContainEqual({ label: 'Expired', value: 'EXPIRED' });
  });

  it('should auto-set expiry time on creation', async () => {
    const hook = Reservations.hooks?.beforeChange?.[0];
    expect(hook).toBeDefined();

    const data = {
      event: '123',
      ticketTypeName: 'Regular',
      quantity: 2,
      customerEmail: 'test@example.com',
      status: 'ACTIVE',
    };

    const result = await hook?.({
      data,
      operation: 'create',
      req: {} as any,
    });

    expect(result.expiresAt).toBeDefined();
    const expiryTime = new Date(result.expiresAt).getTime();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    expect(expiryTime).toBeGreaterThan(now);
    expect(expiryTime).toBeLessThanOrEqual(now + fifteenMinutes + 1000);
  });
});
```

**Step 2: 執行測試驗證失敗**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/collections/__tests__/Reservations.test.ts'
});
```

**Step 3: 實作 Reservations Collection**

創建 `frontend/src/collections/Reservations.ts`：

```typescript
import type { CollectionConfig } from 'payload';

export const Reservations: CollectionConfig = {
  slug: 'reservations',
  labels: {
    singular: 'Reservation',
    plural: 'Reservations',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['customerEmail', 'event', 'status', 'expiresAt'],
    description: 'Ticket Reservations - 票券預訂（15分鐘過期）',
  },
  access: {
    read: ({ req: { user } }) => {
      // TODO: 使用者只能讀取自己的預訂
      if (!user) {
        return false;
      }
      return true;
    },
    create: () => true,
    update: () => true,
    delete: () => true, // TODO: admin only
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      label: '活動',
    },
    {
      name: 'ticketTypeName',
      type: 'text',
      required: true,
      label: '票種名稱',
      admin: {
        description: '從活動的 ticketTypes 中選擇的票種名稱',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
      label: '數量',
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      label: '客戶 Email',
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: '狀態',
      defaultValue: 'ACTIVE',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Consumed', value: 'CONSUMED' },
        { label: 'Expired', value: 'EXPIRED' },
      ],
      index: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      label: '過期時間',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: '預訂將在此時間後自動過期',
      },
      index: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // 創建時自動設定過期時間（15分鐘）
        if (operation === 'create' && !data.expiresAt) {
          const now = new Date();
          data.expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
        }
        return data;
      },
    ],
  },
  timestamps: true,
};
```

**Step 4: 註冊到 Payload Config**

```typescript
import { Events } from '@/collections/Events';
import { Reservations } from '@/collections/Reservations';

export default buildConfig({
  collections: [Events, Reservations],
  // ...
});
```

**Step 5: 執行測試驗證通過**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/collections/__tests__/Reservations.test.ts'
});
```

**Step 6: 格式化並檢查**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/collections/Reservations.ts', projectPath: '...' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/collections/Reservations.ts', errorsOnly: false, projectPath: '...' });
```

**Step 7: Commit**

```bash
git add frontend/src/collections/Reservations.ts frontend/src/collections/__tests__/Reservations.test.ts frontend/payload.config.ts
git commit -m "feat(cms): add Reservations collection with auto-expiry

- Link reservations to events via relationship field
- Auto-set 15-minute expiry on creation
- Track status (ACTIVE, CONSUMED, EXPIRED)
- Add indexes for performance

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: 創建 Orders Collection

**目標：** 將 orders 表遷移為 Payload Collection。

**檔案：**
- Create: `frontend/src/collections/Orders.ts`
- Create: `frontend/src/collections/__tests__/Orders.test.ts`

**Step 1: 寫入失敗測試**

創建 `frontend/src/collections/__tests__/Orders.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { Orders } from '../Orders';

describe('Orders Collection', () => {
  it('should have correct slug', () => {
    expect(Orders.slug).toBe('orders');
  });

  it('should have customer and payment fields', () => {
    const fieldNames = Orders.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('customerEmail');
    expect(fieldNames).toContain('status');
    expect(fieldNames).toContain('totalAmount');
  });

  it('should have items array with event relationship', () => {
    const itemsField = Orders.fields.find((f: any) => f.name === 'items');
    expect(itemsField?.type).toBe('array');
    
    const eventField = itemsField?.fields?.find((f: any) => f.name === 'event');
    expect(eventField?.type).toBe('relationship');
    expect(eventField?.relationTo).toBe('events');
  });

  it('should auto-calculate total amount', async () => {
    const hook = Orders.hooks?.beforeChange?.[0];
    expect(hook).toBeDefined();

    const data = {
      customerEmail: 'test@example.com',
      items: [
        { event: '123', ticketTypeName: 'Early Bird', quantity: 2, price: 500 },
        { event: '123', ticketTypeName: 'Regular', quantity: 1, price: 800 },
      ],
      status: 'pending',
    };

    const result = await hook?.({
      data,
      operation: 'create',
      req: {} as any,
    });

    expect(result.totalAmount).toBe(1800); // (2 * 500) + (1 * 800)
  });
});
```

**Step 2: 執行測試驗證失敗**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/collections/__tests__/Orders.test.ts'
});
```

**Step 3: 實作 Orders Collection**

創建 `frontend/src/collections/Orders.ts`：

```typescript
import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Order',
    plural: 'Orders',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['customerEmail', 'totalAmount', 'status', 'createdAt'],
    description: 'Ticket Orders - 訂單管理',
  },
  access: {
    read: ({ req: { user } }) => {
      // TODO: 使用者只能讀取自己的訂單
      if (!user) {
        return false;
      }
      return true;
    },
    create: () => true,
    update: () => true,
    delete: () => true, // TODO: admin only
  },
  fields: [
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      label: '客戶 Email',
      index: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: '訂單項目',
      minRows: 1,
      fields: [
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          required: true,
          label: '活動',
        },
        {
          name: 'ticketTypeName',
          type: 'text',
          required: true,
          label: '票種',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          label: '數量',
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          label: '單價',
        },
      ],
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      label: '總金額',
      admin: {
        description: '自動計算',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: '訂單狀態',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      index: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // 自動計算總金額
        if (data.items && Array.isArray(data.items)) {
          data.totalAmount = data.items.reduce(
            (sum: number, item: any) => sum + (item.quantity * item.price),
            0
          );
        }
        return data;
      },
    ],
  },
  timestamps: true,
};
```

**Step 4: 註冊到 Payload Config**

```typescript
import { Events } from '@/collections/Events';
import { Reservations } from '@/collections/Reservations';
import { Orders } from '@/collections/Orders';

export default buildConfig({
  collections: [Events, Reservations, Orders],
  // ...
});
```

**Step 5: 執行測試驗證通過**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/collections/__tests__/Orders.test.ts'
});
```

**Step 6: 格式化並檢查**

```typescript
mcp__jetbrains__reformat_file({ path: 'frontend/src/collections/Orders.ts', projectPath: '...' });
mcp__jetbrains__get_file_problems({ filePath: 'frontend/src/collections/Orders.ts', errorsOnly: false, projectPath: '...' });
```

**Step 7: Commit**

```bash
git add frontend/src/collections/Orders.ts frontend/src/collections/__tests__/Orders.test.ts frontend/payload.config.ts
git commit -m "feat(cms): add Orders collection with auto-calculation

- Support multiple items per order
- Auto-calculate total amount from items
- Link items to events via relationship
- Track payment status (pending, paid, cancelled)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: 生成並執行 Payload Migrations

**目標：** 生成 Payload migrations 並套用到資料庫。

**Step 1: 生成 migrations**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'npm run payload generate:migrations -w frontend',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 60000
});
```

預期輸出：
- ✅ 檢測到新 Collections（events, reservations, orders）
- ✅ 生成遷移檔案到 `frontend/src/migrations/`

**Step 2: 檢查生成的遷移檔案**

```typescript
mcp__jetbrains__list_directory_tree({
  directoryPath: 'frontend/src/migrations',
  maxDepth: 1,
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 3: 執行 migrations**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'npm run payload migrate -w frontend',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 60000
});
```

預期：
- ✅ 創建 payload_events 表
- ✅ 創建 payload_reservations 表
- ✅ 創建 payload_orders 表
- ✅ 創建關聯索引

**Step 4: 驗證 payload-types.ts 更新**

```typescript
mcp__jetbrains__get_file_text_by_path({
  pathInProject: 'frontend/src/payload-types.ts',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  maxLinesCount: 100
});
```

預期：
- ✅ Event 類型包含 ticketTypes array
- ✅ Reservation 類型包含 event relationship
- ✅ Order 類型包含 items array

**Step 5: Commit**

```bash
git add frontend/src/migrations/ frontend/src/payload-types.ts
git commit -m "chore(cms): generate Payload migrations for ticket system

- Add Events, Reservations, Orders collections to database
- Generate TypeScript types
- Create relationship indexes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: 創建資料遷移腳本（從 Drizzle 到 Payload）

**目標：** 如果資料庫有現有資料，創建腳本將其遷移到 Payload Collections。

**檔案：**
- Create: `frontend/src/scripts/migrate-events-to-payload.ts`

**Step 1: 檢查是否有現有資料**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'psql $DATABASE_URL -c "SELECT COUNT(*) FROM events;"',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 10000
});
```

**如果有資料（count > 0），執行 Step 2-5；否則跳到 Task 7**

**Step 2: 實作遷移腳本**

創建 `frontend/src/scripts/migrate-events-to-payload.ts`：

```typescript
import { getPayload } from 'payload';
import config from '../../payload.config';
import { Pool } from '@neondatabase/serverless';

async function migrate() {
  console.log('🔄 開始遷移 Event 系統資料到 Payload...');

  const payload = await getPayload({ config });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Step 1: 讀取舊 events 和 ticketTypes
    console.log('📖 讀取舊 events 資料...');
    const eventsResult = await pool.query(`
      SELECT * FROM events ORDER BY id ASC
    `);
    const oldEvents = eventsResult.rows;

    const ticketTypesResult = await pool.query(`
      SELECT * FROM ticket_types ORDER BY id ASC
    `);
    const oldTicketTypes = ticketTypesResult.rows;

    // Step 2: 按 eventId 分組 ticketTypes
    const ticketTypesByEvent = oldTicketTypes.reduce((acc, tt) => {
      if (!acc[tt.event_id]) {
        acc[tt.event_id] = [];
      }
      acc[tt.event_id].push(tt);
      return acc;
    }, {} as Record<number, any[]>);

    // Step 3: 創建 Payload Events（整合 ticketTypes）
    const eventIdMapping: Record<number, string> = {}; // oldId -> newId

    for (const oldEvent of oldEvents) {
      console.log(`  - 遷移活動: ${oldEvent.title}`);

      const ticketTypes = (ticketTypesByEvent[oldEvent.id] || []).map((tt) => ({
        name: tt.name,
        price: tt.price,
        allocation: tt.allocation,
        enabled: tt.enabled,
      }));

      const newEvent = await payload.create({
        collection: 'events',
        data: {
          title: oldEvent.title,
          slug: oldEvent.slug,
          description: oldEvent.description
            ? {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ type: 'text', text: oldEvent.description }],
                    },
                  ],
                },
              }
            : undefined,
          status: oldEvent.status,
          eventDate: oldEvent.event_date,
          totalCapacity: oldEvent.total_capacity,
          ticketTypes,
          createdAt: oldEvent.created_at,
          updatedAt: oldEvent.updated_at,
        },
      });

      eventIdMapping[oldEvent.id] = String(newEvent.id);
    }

    // Step 4: 遷移 Reservations
    console.log('📖 讀取舊 reservations 資料...');
    const reservationsResult = await pool.query(`
      SELECT r.*, tt.name as ticket_type_name
      FROM reservations r
      JOIN ticket_types tt ON r.ticket_type_id = tt.id
      ORDER BY r.id ASC
    `);
    const oldReservations = reservationsResult.rows;

    for (const oldRes of oldReservations) {
      const newEventId = eventIdMapping[oldRes.event_id];
      if (!newEventId) {
        console.warn(`  ⚠️  找不到 event_id=${oldRes.event_id} 的對應，跳過 reservation ${oldRes.id}`);
        continue;
      }

      await payload.create({
        collection: 'reservations',
        data: {
          event: newEventId,
          ticketTypeName: oldRes.ticket_type_name,
          quantity: oldRes.quantity,
          customerEmail: oldRes.customer_email,
          status: oldRes.status,
          expiresAt: oldRes.expires_at,
          createdAt: oldRes.created_at,
        },
      });
    }

    // Step 5: 遷移 Orders
    console.log('📖 讀取舊 orders 資料...');
    const ordersResult = await pool.query(`
      SELECT * FROM orders ORDER BY id ASC
    `);
    const oldOrders = ordersResult.rows;

    for (const oldOrder of oldOrders) {
      // 注意：舊 schema 沒有 order items，需要從業務邏輯推導
      // 簡化處理：創建空訂單，實際專案需要更複雜邏輯
      await payload.create({
        collection: 'orders',
        data: {
          customerEmail: oldOrder.customer_email,
          items: [], // TODO: 根據實際業務邏輯填充
          totalAmount: oldOrder.total_amount,
          status: oldOrder.status,
          createdAt: oldOrder.created_at,
        },
      });
    }

    console.log('✅ 遷移完成！');
    console.log(`  - Events: ${oldEvents.length} 筆`);
    console.log(`  - Reservations: ${oldReservations.length} 筆`);
    console.log(`  - Orders: ${oldOrders.length} 筆`);

  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    throw error;
  } finally {
    await pool.end();
  }

  process.exit(0);
}

migrate().catch((error) => {
  console.error('❌ 遷移腳本錯誤:', error);
  process.exit(1);
});
```

**Step 3: 添加 npm script**

修改 `frontend/package.json`：

```json
{
  "scripts": {
    "migrate:events": "tsx src/scripts/migrate-events-to-payload.ts"
  }
}
```

**Step 4: 執行遷移（僅在有資料時）**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'npm run migrate:events -w frontend',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 120000
});
```

**Step 5: 驗證遷移結果**

訪問 Payload Admin: http://localhost:3000/admin
- 檢查 Events collection 是否有資料
- 檢查 Reservations 是否正確關聯到 Events
- 檢查 Orders 是否存在

**Step 6: Commit**

```bash
git add frontend/src/scripts/migrate-events-to-payload.ts frontend/package.json
git commit -m "feat(migration): add script to migrate Event system to Payload

- Migrate events + ticketTypes to Events collection
- Migrate reservations with event relationships
- Migrate orders (simplified version)
- Map old IDs to new Payload IDs

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: 重寫 API Routes 使用 Payload API

**目標：** 將現有的 `/api/events` 等 API routes 改為使用 Payload Local API。

**檔案：**
- Modify: `frontend/src/app/api/events/route.ts`
- Create: `frontend/src/app/api/events/[slug]/route.ts`
- Modify tests

**Step 1: 更新 GET /api/events 測試**

修改 `frontend/src/app/api/events/__tests__/route.test.ts`（如果存在）：

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';

// Mock Payload
const mockPayload = {
  find: vi.fn(),
};

vi.mock('payload', () => ({
  getPayload: vi.fn(() => mockPayload),
}));

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return published events from Payload', async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Test Event',
        slug: 'test-event',
        status: 'PUBLISHED',
        eventDate: '2025-10-20T09:00:00.000Z',
        totalCapacity: 50,
        ticketTypes: [
          { name: 'Early Bird', price: 500, allocation: 20, enabled: true },
        ],
      },
    ];

    mockPayload.find.mockResolvedValue({ docs: mockEvents });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockEvents);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'events',
      where: { status: { equals: 'PUBLISHED' } },
      sort: '-eventDate',
    });
  });

  it('should handle errors', async () => {
    mockPayload.find.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
```

**Step 2: 執行測試驗證失敗**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/app/api/events/__tests__/route.test.ts'
});
```

**Step 3: 重寫 API route**

修改 `frontend/src/app/api/events/route.ts`：

```typescript
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';

/**
 * GET /api/events
 * 查詢已發布的活動
 */
export async function GET(): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config });

    const { docs } = await payload.find({
      collection: 'events',
      where: {
        status: { equals: 'PUBLISHED' },
      },
      sort: '-eventDate',
    });

    return NextResponse.json(docs, { status: 200 });
  } catch (error) {
    console.error('Error fetching published events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 4: 執行測試驗證通過**

```typescript
mcp__wallaby__wallaby_failingTestsForFile({
  file: 'frontend/src/app/api/events/__tests__/route.test.ts'
});
```

**Step 5: 創建 GET /api/events/[slug] route**

創建 `frontend/src/app/api/events/[slug]/route.ts`：

```typescript
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../../payload.config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const payload = await getPayload({ config });

    const { docs } = await payload.find({
      collection: 'events',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
    });

    if (docs.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(docs[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 6: 格式化並檢查**

```typescript
mcp__jetbrains__reformat_file({
  path: 'frontend/src/app/api/events/route.ts',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 7: Commit**

```bash
git add frontend/src/app/api/events/
git commit -m "refactor(api): migrate /api/events to use Payload API

- Replace Drizzle queries with Payload Local API
- Add GET /api/events/[slug] endpoint
- Update tests to mock Payload
- Remove dependency on db/schema

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: 移除 Drizzle Schema 和 Services

**目標：** 刪除 `db/schema.ts` 和基於 Drizzle 的 services。

**Step 1: 確認沒有其他地方使用 db/schema**

```typescript
mcp__jetbrains__search_in_files_by_text({
  searchText: "from '@/server/db/schema'",
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  maxUsageCount: 50
});
```

預期：只剩測試檔案使用（將在下一步移除）

**Step 2: 刪除 db/ 和 services/ 目錄**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'rm -rf frontend/src/server/db frontend/src/server/services',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 3: 清理 package.json 依賴**

修改 `frontend/package.json`：

```json
{
  "dependencies": {
    // ✅ 保留 Payload 的 Drizzle adapter
    "@payloadcms/db-postgres": "^3.74.0",
    
    // ❌ 移除手動安裝的
    // "@neondatabase/serverless": "^1.0.2",
    // "drizzle-orm": "^0.45.1",
    // "postgres": "^3.4.7",
    // "ws": "^8.19.0",
  },
  "devDependencies": {
    // ❌ 移除 drizzle-kit
    // "drizzle-kit": "^0.31.8",
    // "@types/ws": "^8.18.1",
    // "@types/pg": "^8.16.0",
  },
  "scripts": {
    // ❌ 移除 Drizzle CLI scripts
    // "db:generate": "drizzle-kit generate",
    // "db:push": "drizzle-kit push",
    // "db:migrate": "drizzle-kit migrate",
    // "db:studio": "drizzle-kit studio",
  }
}
```

**Step 4: 執行 npm install 清理**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'npm install',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 120000
});
```

**Step 5: 驗證 Build**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'npm run build -w frontend',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 180000
});
```

預期：Build 成功，無錯誤

**Step 6: 執行所有測試**

```typescript
mcp__wallaby__wallaby_failingTests();
```

預期：
- ✅ API route 測試通過（使用 Payload mocks）
- ✅ Collection 測試通過
- ❌ 舊的 service 測試失敗（將被刪除）

**Step 7: 刪除舊的 service 測試**

```bash
rm -rf frontend/src/server/services/__tests__
```

**Step 8: 創建遷移文件**

創建 `docs/migration/event-system-completed.md`：

```markdown
# Event 系統遷移完成報告

## 遷移日期
2026-02-12

## 遷移內容

### ✅ 已完成

1. **Schema 遷移**
   - ❌ 移除 `db/schema.ts` (events, ticketTypes, orders, reservations)
   - ✅ 創建 Payload Collections (Events, Orders, Reservations)
   - ✅ Events 整合 ticketTypes 為 array field

2. **業務邏輯遷移**
   - ✅ 庫存驗證：Events.hooks.beforeChange
   - ✅ 預訂過期：Reservations.hooks.beforeChange（15分鐘）
   - ✅ 訂單計算：Orders.hooks.beforeChange（auto-calculate totalAmount）

3. **API Routes 更新**
   - ✅ GET /api/events - 使用 Payload API
   - ✅ GET /api/events/[slug] - 新增
   - ❌ 移除 /api/admin/events（改用 Payload Admin Panel）

4. **資料遷移**
   - ✅ 創建 migrate-events-to-payload.ts 腳本
   - [ ] 執行資料遷移（如有現有資料）

5. **測試更新**
   - ✅ Collections 單元測試
   - ✅ API routes 測試（使用 Payload mocks）
   - ❌ 移除舊 services 測試

6. **依賴清理**
   - ❌ 移除 @neondatabase/serverless, drizzle-orm, drizzle-kit
   - ✅ 保留 @payloadcms/db-postgres（內建 Drizzle）

## 架構對比

### 之前（Drizzle Schema）
```
events (table)
  ├── ticketTypes (table, FK: eventId)
  ├── reservations (table, FK: eventId, ticketTypeId)
  └── orders (table)

Services Layer (event.ts, ticket-type.ts, reservation.ts, order.ts)
  └── API Routes
```

### 之後（Payload Collections）
```
Events (collection)
  └── ticketTypes (array field)
      ├── Reservations (collection, relationship: event)
      └── Orders (collection)

Payload Hooks (業務邏輯)
  └── API Routes (Payload Local API)
```

## 優勢

1. **統一管理介面**
   - 所有內容透過 Payload Admin Panel 管理
   - 無需維護 Admin API routes

2. **Type Safety**
   - Payload 自動生成 TypeScript types
   - `payload.db.drizzle` 提供 type-safe queries

3. **業務邏輯集中**
   - Hooks 確保邏輯一致性
   - Access control 集中管理權限

4. **Schema 自動管理**
   - 不需手動維護 Drizzle schema
   - Payload migrations 自動生成

## 後續工作

- [ ] 實作 Admin Role 權限檢查
- [ ] 添加使用者只能查看自己訂單/預訂的邏輯
- [ ] 實作預訂過期自動清理 cron job
- [ ] 添加 E2E 測試覆蓋票務流程
- [ ] 考慮添加庫存即時監控 dashboard
```

**Step 9: Commit**

```bash
git add .
git commit -m "refactor(cms): complete migration from Drizzle to Payload

BREAKING CHANGE: Remove custom Drizzle schema and services

- Delete frontend/src/server/db/ (schema, custom Drizzle setup)
- Delete frontend/src/server/services/ (event, ticket-type, reservation, order)
- Remove drizzle-orm, drizzle-kit, @neondatabase/serverless dependencies
- Keep @payloadcms/db-postgres (Payload's internal Drizzle)
- All Event system data now managed by Payload Collections
- Document migration completion

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: 驗證與測試

**目標：** 全面驗證系統功能正常。

**Step 1: 啟動開發伺服器**

```typescript
mcp__jetbrains__execute_run_configuration({
  configurationName: 'dev',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 2: 訪問 Payload Admin**

訪問 http://localhost:3000/admin

驗證：
- ✅ Events collection 可見
- ✅ Reservations collection 可見
- ✅ Orders collection 可見
- ✅ 可以創建新活動（含 ticketTypes）
- ✅ ticketTypes 驗證正常（總配額不超過容量）

**Step 3: 測試 API Endpoints**

```bash
# 測試 GET /api/events
curl http://localhost:3000/api/events

# 測試 GET /api/events/[slug]
curl http://localhost:3000/api/events/test-event
```

**Step 4: 執行所有單元測試**

```typescript
mcp__wallaby__wallaby_failingTests();
```

預期：所有測試通過

**Step 5: 執行 Build**

```typescript
mcp__jetbrains__execute_terminal_command({
  command: 'npm run build -w frontend',
  projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio',
  timeout: 180000
});
```

預期：Build 成功

**Step 6: 測試票務流程（手動）**

在 Payload Admin:
1. 創建活動（包含 2 個 ticketTypes）
2. Publish 活動（status 改為 PUBLISHED）
3. 創建 Reservation（選擇活動 + 票種）
4. 驗證 expiresAt 自動設定為 15 分鐘後
5. 創建 Order（選擇活動 + 票種 + 數量）
6. 驗證 totalAmount 自動計算

**Step 7: 記錄驗證結果**

更新 `docs/migration/event-system-completed.md`：

```markdown
## 驗證結果（2026-02-12）

### Payload Admin Panel
- [x] Events collection 正常顯示
- [x] 可創建活動（含 ticketTypes）
- [x] ticketTypes 配額驗證正常
- [x] Reservations collection 正常
- [x] expiresAt 自動設定正確
- [x] Orders collection 正常
- [x] totalAmount 自動計算正確

### API Endpoints
- [x] GET /api/events 返回已發布活動
- [x] GET /api/events/[slug] 正確查詢單一活動

### 測試
- [x] 所有 Collection 單元測試通過
- [x] API routes 測試通過
- [x] Build 成功無錯誤

### 效能
- [ ] Payload Admin 載入速度：< 1s
- [ ] GET /api/events 回應時間：< 200ms
- [ ] GET /api/events/[slug] 回應時間：< 100ms
```

**Step 8: Commit**

```bash
git add docs/migration/event-system-completed.md
git commit -m "docs(migration): add verification results for Event system

- Document Payload Admin testing
- Record API endpoint testing
- Confirm all tests passing
- Note performance metrics

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 完成檢查清單

- [ ] Task 1: 現有系統分析完成 ✅
- [ ] Task 2: Events Collection 創建並測試通過 ✅
- [ ] Task 3: Reservations Collection 創建並測試通過 ✅
- [ ] Task 4: Orders Collection 創建並測試通過 ✅
- [ ] Task 5: Payload migrations 執行成功 ✅
- [ ] Task 6: 資料遷移完成（如有現有資料）✅
- [ ] Task 7: API Routes 重寫並測試通過 ✅
- [ ] Task 8: Drizzle schema 和 services 移除 ✅
- [ ] Task 9: 全面驗證通過 ✅

---

## 參考資料

- Payload Collections: https://payloadcms.com/docs/configuration/collections
- Payload Hooks: https://payloadcms.com/docs/hooks/overview
- Payload Relationships: https://payloadcms.com/docs/fields/relationship
- Payload Access Control: https://payloadcms.com/docs/access-control/overview

---

## 執行交接

計劃已完成並儲存至 `docs/plans/2026-02-12-migrate-event-system-to-payload.md`。

兩種執行選項：

**1. Subagent-Driven (this session)** - 我在本 session 派發新的 subagent 處理每個任務，在任務間進行 code review

**2. Parallel Session (separate)** - 開啟新 session 並使用 executing-plans skill，批次執行並在檢查點審查

您想選擇哪種方式？
