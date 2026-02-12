# Event 系統現狀分析

> 本文檔記錄現有 Event 票務系統的架構和依賴關係,為遷移至 Payload CMS 提供基礎。

## Schema 定義

### events 表

- **欄位:** id, title, description, slug, status, totalCapacity, eventDate, createdAt, updatedAt
- **約束:**
    - status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')
    - totalCapacity > 0
    - slug 唯一索引
- **用途:** 活動基本資訊 + 票務配置
- **業務規則:**
    - DRAFT 狀態可修改容量(但不能小於已分配數)
    - PUBLISHED 狀態只能增加容量,不能減少
    - slug 自動從 title 生成(使用 slugify)

### ticketTypes 表

- **欄位:** id, eventId, name, price, allocation, enabled, createdAt
- **關聯:** eventId -> events.id (cascade delete)
- **用途:** 活動的票種配置
- **業務規則:**
    - allocation 為 null 表示不限制此票種數量
    - enabled = false 表示停售但不刪除
    - 發布活動時必須至少有一個 enabled 票種

### orders 表

- **欄位:** id, customerEmail, status, totalAmount, createdAt
- **用途:** 訂單記錄
- **業務規則:**
    - totalAmount 從 ticketType.price * quantity 計算
    - status: 'pending' | 'paid' | 'cancelled'

### reservations 表

- **欄位:** id, eventId, ticketTypeId, quantity, customerEmail, status, expiresAt, createdAt
- **關聯:**
    - eventId -> events.id (cascade delete)
    - ticketTypeId -> ticketTypes.id (cascade delete)
- **約束:**
    - quantity > 0
    - status IN ('ACTIVE', 'CONSUMED', 'EXPIRED')
- **用途:** 預訂管理(15分鐘過期)
- **業務規則:**
    - expiresAt = createdAt + 15 分鐘
    - 創建預訂時使用 pessimistic lock(FOR UPDATE)防止超賣
    - 庫存檢查邏輯: available = capacity - SUM(ACTIVE reservations)

## Services 業務邏輯

### event.ts

**核心函數:**

- `createDraftEvent()` - 創建草稿活動,自動生成唯一 slug
- `updateEvent()` - 更新活動,包含容量驗證邏輯
- `publishEvent()` - 發布活動(需至少一個 enabled 票種)
- `validateAndGenerateSlug()` - slug 唯一性驗證
- `validateCapacityUpdate()` - 容量更新驗證(DRAFT vs PUBLISHED 不同規則)

**關鍵業務邏輯:**

- PUBLISHED 活動不能減少容量
- DRAFT 活動容量不能小於已分配票種總數
- slug 衝突檢查需排除當前活動(更新時)

### ticket-type.ts

**核心函數:**

- `createTicketType()` - 創建票種
- `updateTicketType()` - 更新票種(價格、配額)
- `toggleTicketType()` - 啟用/停用票種
- `getTotalAllocated()` - 計算活動的票種總配額

**關鍵業務邏輯:**

- 配額總和不能超過活動總容量

### reservation.ts

**核心函數:**

- `createReservation()` - 創建預訂(含庫存檢查 + pessimistic lock)
- `getReservationById()` - 查詢預訂
- `markReservationConsumed()` - 標記預訂為已消費

**關鍵業務邏輯:**

- **庫存管理:** 使用 FOR UPDATE 鎖定 ticketType row 防止 race condition
- **容量計算:**
  ```typescript
  totalReserved = SUM(reservations.quantity WHERE status='ACTIVE')
  capacity = ticketType.allocation ?? event.totalCapacity
  available = MAX(0, capacity - totalReserved)
  ```
- **過期時間:** expiresAt = now + 15 分鐘

### order.ts

**核心函數:**

- `createOrderFromReservation()` - 從預訂創建訂單

**關鍵業務邏輯:**

- 驗證預訂狀態(必須是 ACTIVE)
- 驗證未過期(expiresAt > now)
- 計算總金額(ticketType.price * quantity)
- 標記預訂為 CONSUMED

### public-event.ts

**核心函數:**

- `getPublishedEvents()` - 查詢已發布活動(公開 API)

**關鍵業務邏輯:**

- 只返回 status='PUBLISHED' 的活動

## API Routes

### 公開 API

- `GET /api/events` - 查詢已發布活動
- `POST /api/reservations` - 創建預訂
- `POST /api/orders` - 創建訂單

### 管理 API

- `GET /api/admin/events/:slug` - 查詢活動詳情
- `POST /api/admin/events` - 創建活動
- `PATCH /api/admin/events/:id` - 更新活動
- `POST /api/admin/events/:id/publish` - 發布活動

## 依賴關係圖

```
events (1) ---< ticketTypes (N)
   |
   |---< reservations (N)
   |
   +---< orders (N)

ticketTypes (1) ---< reservations (N)

reservations (1) ---> orders (1) [via createOrderFromReservation]
```

## 使用 db/schema 的檔案清單

**Services 層(8 個檔案):**

- `frontend/src/server/services/event.ts` - events, ticketTypes
- `frontend/src/server/services/ticket-type.ts` - events, ticketTypes
- `frontend/src/server/services/reservation.ts` - events, ticketTypes, reservations
- `frontend/src/server/services/order.ts` - orders, reservations, ticketTypes
- `frontend/src/server/services/public-event.ts` - events

**Tests(7 個檔案):**

- `frontend/src/server/services/__tests__/event.test.ts`
- `frontend/src/server/services/__tests__/ticket-type.test.ts`
- `frontend/src/server/services/__tests__/reservation.test.ts`
- `frontend/src/server/services/__tests__/order.test.ts`
- `frontend/src/server/services/__tests__/public-event.test.ts`
- `frontend/src/app/api/reservations/__tests__/route.test.ts`
- `frontend/src/app/api/reservations/[id]/__tests__/route.test.ts`

**Schema Tests:**

- `frontend/src/server/db/__tests__/schema.test.ts`

## 關鍵業務邏輯總結

### 1. 庫存管理(防超賣)

- 使用資料庫 pessimistic lock (`FOR UPDATE`)
- 計算公式: `available = capacity - SUM(ACTIVE reservations)`
- Transaction 內完成:檢查庫存 -> 創建預訂

### 2. 預訂過期

- 創建時設定 `expiresAt = now + 15 分鐘`
- 查詢時過濾過期預訂(狀態為 ACTIVE 但 expiresAt < now)
- 轉訂單時驗證未過期

### 3. 狀態轉換

- **Event:** DRAFT -> PUBLISHED -> ARCHIVED
    - DRAFT: 可自由修改
    - PUBLISHED: 只能增加容量
    - ARCHIVED: 不可修改

- **Reservation:** ACTIVE -> CONSUMED/EXPIRED
    - ACTIVE: 有效預訂
    - CONSUMED: 已轉訂單
    - EXPIRED: 超時失效

### 4. 容量限制

- **全局容量:** event.totalCapacity
- **票種配額:** ticketType.allocation (可為 null = 不限制)
- **驗證規則:**
    - 票種總配額 ≤ 活動總容量
    - PUBLISHED 活動不能減少容量

## 測試覆蓋

### Unit Tests

- `event.test.ts` - 活動 CRUD + publish 邏輯
- `ticket-type.test.ts` - 票種管理 + 配額驗證
- `reservation.test.ts` - 預訂邏輯 + 庫存驗證 + 過期處理
- `order.test.ts` - 訂單處理 + 預訂消費
- `public-event.test.ts` - 公開查詢

### API Tests

- `api/reservations/route.test.ts` - POST /api/reservations
- `api/reservations/[id]/route.test.ts` - GET /api/reservations/:id

## 遷移注意事項

### 需保留的業務邏輯

1. **庫存檢查** - Payload hooks 中實現
2. **過期邏輯** - beforeChange hook 設定 expiresAt
3. **狀態驗證** - field validation + hooks
4. **容量限制** - beforeChange hook 驗證票種總配額

### 需調整的部分

1. **關聯關係** - ticketTypes 改為 Events.ticketTypes array field
2. **查詢邏輯** - 改用 Payload Local API
3. **Transaction** - 評估 Payload hooks 內的 transaction 支援

### 測試策略

1. 先遷移 Collections,寫單元測試
2. 再遷移 Services 層,保持測試通過
3. 最後更新 API routes,執行 E2E 測試
