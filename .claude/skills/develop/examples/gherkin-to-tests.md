# Gherkin → 測試計畫完整範例

## Gherkin Scenario

```gherkin
# e2e/specs/event-ticketing.feature
Feature: 活動票務系統
   作為 活動參與者
   我想要 購買活動票券
   以便 參加我感興趣的活動

   Scenario: 使用者可以購買活動票券
      Given 活動 "2024 音樂節" 有 10 張一般票可售，每張 1000 元
      And 我是一個已註冊的使用者
      When 我購買 2 張一般票
      Then 訂單狀態應該為 "pending"
      And 訂單總金額應該為 2000 元
      And 活動庫存應該剩餘 8 張
      And 我應該收到訂單確認 email
```

---

## Step 1: 業務邏輯分解

### Given（前置條件）分析

```
Given 活動 "2024 音樂節" 有 10 張一般票可售，每張 1000 元
```

**需要設定的資料**:
1. 建立活動記錄（events table）
   - id: 'event-123'
   - title: '2024 音樂節'

2. 建立票種記錄（ticket_types table）
   - id: 'ticket-1'
   - eventId: 'event-123'
   - name: '一般票'
   - price: 1000
   - inventory: 10

```
And 我是一個已註冊的使用者
```

**需要的資料**:
- customer: { email: 'test@example.com', name: '測試用戶' }

---

### When（執行動作）分析

```
When 我購買 2 張一般票
```

**需要呼叫的 function**:
```typescript
await createOrder({
  eventId: 'event-123',
  tickets: [
    { ticketTypeId: 'ticket-1', quantity: 2 }
  ],
  customer: {
    email: 'test@example.com',
    name: '測試用戶'
  }
});
```

**涉及的系統模組**:
- Order Service (frontend/src/server/services/order.ts)
- Database Operations (frontend/src/server/db/queries.ts)
- Payment Service (frontend/src/server/services/payment.ts)
- Email Service (frontend/src/server/services/email.ts)

---

### Then（預期結果）分析

```
Then 訂單狀態應該為 "pending"
```
**驗證**: `result.status === 'pending'`

```
And 訂單總金額應該為 2000 元
```
**驗證**: `result.totalAmount === 2000`

```
And 活動庫存應該剩餘 8 張
```
**驗證**: 資料庫中 ticket_types.inventory = 8

```
And 我應該收到訂單確認 email
```
**驗證**: `email.send()` 被呼叫，參數包含 orderId

---

## Step 2: 識別測試檔案

### Service Layer 測試
**檔案**: `frontend/src/server/services/__tests__/order.test.ts`

**測試範圍**:
- 訂單建立邏輯
- 庫存驗證
- 總金額計算
- 支付整合
- Email 發送

---

### Database Layer 測試（可選）
**檔案**: `frontend/src/server/db/__tests__/queries.test.ts`

**測試範圍**:
- 訂單資料插入
- 庫存更新
- Transaction 處理

---

### API Route 測試（E2E）
**檔案**: `frontend/src/app/api/orders/__tests__/route.test.ts`

**測試範圍**:
- HTTP 請求處理
- 輸入驗證
- 回應格式

---

## Step 3: 規劃測試案例

### 測試檔案: frontend/src/server/services/__tests__/order.test.ts

#### 測試案例 1: 成功建立訂單（Happy Path）

**測試描述**: 當購買票券時，應該建立訂單並返回 order ID

**Input**:
```typescript
const input = {
  eventId: 'event-123',
  tickets: [{ ticketTypeId: 'ticket-1', quantity: 2 }],
  customer: { email: 'test@example.com', name: '測試用戶' }
}
```

**Expected Output**:
```typescript
const output = {
   orderId: 'order-456',  // UUID
   status: 'pending',
   totalAmount: 2000,
   createdAt: Date
}
```

**Mocks**:
```typescript
// Database operations
vi.mocked(db.getTicketTypes).mockResolvedValue([
  { id: 'ticket-1', eventId: 'event-123', price: 1000, inventory: 10 }
]);

vi.mocked(db.insertOrder).mockResolvedValue({
  id: 'order-456'
});

vi.mocked(db.updateInventory).mockResolvedValue(undefined);

// Payment service
vi.mocked(payment.createPaymentIntent).mockResolvedValue({
  id: 'pi_789',
  status: 'succeeded'
});

// Email service
vi.mocked(email.sendOrderConfirmation).mockResolvedValue(undefined);
```

**Assertions**:
```typescript
expect(result.orderId).toBeDefined();
expect(result.status).toBe('pending');
expect(result.totalAmount).toBe(2000);

// Verify database calls
expect(db.insertOrder).toHaveBeenCalledWith({
  eventId: 'event-123',
  customerEmail: 'test@example.com',
  totalAmount: 2000,
  status: 'pending'
});

expect(db.updateInventory).toHaveBeenCalledWith('ticket-1', -2);

// Verify payment call
expect(payment.createPaymentIntent).toHaveBeenCalledWith({
  amount: 2000,
  currency: 'twd',
  metadata: { orderId: 'order-456' }
});

// Verify email call
expect(email.sendOrderConfirmation).toHaveBeenCalledWith({
  to: 'test@example.com',
  orderId: 'order-456',
  totalAmount: 2000
});
```

---

#### 測試案例 2: 庫存不足時拋出錯誤

**測試描述**: 當購買數量超過庫存時，應該拋出錯誤並不建立訂單

**Input**:
```typescript
const input = {
   eventId: 'event-123',
   tickets: [{ticketTypeId: 'ticket-1', quantity: 100}],  // 超過庫存
   customer: {email: 'test@example.com', name: '測試用戶'}
}
```

**Expected Output**:
```typescript
throw new Error('庫存不足')
```

**Mocks**:
```typescript
vi.mocked(db.getTicketTypes).mockResolvedValue([
  { id: 'ticket-1', eventId: 'event-123', price: 1000, inventory: 10 }  // 庫存只有 10
]);
```

**Assertions**:
```typescript
await expect(createOrder({ ... })).rejects.toThrow('庫存不足');

// Verify no order was created
expect(db.insertOrder).not.toHaveBeenCalled();
expect(payment.createPaymentIntent).not.toHaveBeenCalled();
```

---

#### 測試案例 3: 支付失敗時回滾訂單

**測試描述**: 當支付失敗時，應該刪除已建立的訂單

**Input**: 同測試案例 1

**Expected Output**:
```typescript
throw new Error('支付失敗')
```

**Mocks**:
```typescript
vi.mocked(db.getTicketTypes).mockResolvedValue([
  { id: 'ticket-1', price: 1000, inventory: 10 }
]);

vi.mocked(db.insertOrder).mockResolvedValue({
  id: 'order-456'
});

// Payment fails
vi.mocked(payment.createPaymentIntent).mockRejectedValue(
  new Error('支付失敗')
);

vi.mocked(db.deleteOrder).mockResolvedValue(undefined);
```

**Assertions**:
```typescript
await expect(createOrder({ ... })).rejects.toThrow('支付失敗');

// Verify order was deleted (rollback)
expect(db.deleteOrder).toHaveBeenCalledWith('order-456');

// Verify email was not sent
expect(email.sendOrderConfirmation).not.toHaveBeenCalled();
```

---

#### 測試案例 4: 票種不存在時拋出錯誤

**測試描述**: 當票種 ID 無效時，應該拋出錯誤

**Input**:
```typescript
const input ={
  eventId: 'event-123',
  tickets: [{ ticketTypeId: 'invalid-ticket', quantity: 2 }],
  customer: { email: 'test@example.com', name: '測試用戶' }
}
```

**Expected Output**:
```typescript
throw new Error('票種不存在')
```

**Mocks**:
```typescript
vi.mocked(db.getTicketTypes).mockResolvedValue([
  { id: 'ticket-1', price: 1000, inventory: 10 }  // 不包含 'invalid-ticket'
]);
```

**Assertions**:
```typescript
await expect(createOrder({ ... })).rejects.toThrow('票種不存在');
```

---

#### 測試案例 5: 計算總金額正確（多種票型）

**測試描述**: 當購買多種票型時，應該正確計算總金額

**Input**:
```typescript
const input ={
  eventId: 'event-123',
  tickets: [
    { ticketTypeId: 'ticket-1', quantity: 2 },  // 一般票 1000 * 2 = 2000
    { ticketTypeId: 'ticket-2', quantity: 1 }   // VIP票 2000 * 1 = 2000
  ],
  customer: { email: 'test@example.com', name: '測試用戶' }
}
```

**Expected Output**:
```typescript
const output ={
  orderId: 'order-456',
  status: 'pending',
  totalAmount: 4000  // 2000 + 2000
}
```

**Mocks**:
```typescript
vi.mocked(db.getTicketTypes).mockResolvedValue([
  { id: 'ticket-1', price: 1000, inventory: 10 },
  { id: 'ticket-2', price: 2000, inventory: 5 }
]);
```

**Assertions**:
```typescript
expect(result.totalAmount).toBe(4000);
```

---

## Step 4: 實作順序

### Phase 1: 核心功能（測試案例 1）
1. Red Phase: 寫測試案例 1
2. Green Phase: 實作基本的 createOrder function
3. Refactor Phase: 重構程式碼

### Phase 2: 錯誤處理（測試案例 2, 4）
1. Red Phase: 寫測試案例 2（庫存驗證）
2. Green Phase: 加入庫存驗證邏輯
3. Red Phase: 寫測試案例 4（票種驗證）
4. Green Phase: 加入票種驗證邏輯
5. Refactor Phase: 重構驗證邏輯

### Phase 3: Transaction 處理（測試案例 3）
1. Red Phase: 寫測試案例 3（支付失敗回滾）
2. Green Phase: 加入 try-catch 和回滾邏輯
3. Refactor Phase: 重構錯誤處理

### Phase 4: 進階功能（測試案例 5）
1. Red Phase: 寫測試案例 5（多票型計算）
2. Green Phase: 確保計算邏輯支援多票型
3. Refactor Phase: 最終重構

---

## Step 5: 完整測試程式碼範例

```typescript
// frontend/src/server/services/__tests__/order.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder } from '../order';
import * as db from '~/server/db';
import * as payment from '../payment';
import * as email from '../email';

vi.mock('~/server/db');
vi.mock('../payment');
vi.mock('../email');

describe('createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create order successfully', async () => {
    // Arrange
    vi.mocked(db.getTicketTypes).mockResolvedValue([
      { id: 'ticket-1', price: 1000, inventory: 10 }
    ]);
    vi.mocked(db.insertOrder).mockResolvedValue({ id: 'order-456' });
    vi.mocked(db.updateInventory).mockResolvedValue(undefined);
    vi.mocked(payment.createPaymentIntent).mockResolvedValue({
      id: 'pi_789',
      status: 'succeeded'
    });
    vi.mocked(email.sendOrderConfirmation).mockResolvedValue(undefined);

    // Act
    const result = await createOrder({
      eventId: 'event-123',
      tickets: [{ ticketTypeId: 'ticket-1', quantity: 2 }],
      customer: { email: 'test@example.com', name: '測試用戶' }
    });

    // Assert
    expect(result.orderId).toBe('order-456');
    expect(result.status).toBe('pending');
    expect(result.totalAmount).toBe(2000);
  });

  it('should throw error when inventory insufficient', async () => {
    // Arrange
    vi.mocked(db.getTicketTypes).mockResolvedValue([
      { id: 'ticket-1', price: 1000, inventory: 10 }
    ]);

    // Act & Assert
    await expect(
      createOrder({
        eventId: 'event-123',
        tickets: [{ ticketTypeId: 'ticket-1', quantity: 100 }],
        customer: { email: 'test@example.com', name: '測試用戶' }
      })
    ).rejects.toThrow('庫存不足');

    // Verify no order created
    expect(db.insertOrder).not.toHaveBeenCalled();
  });

  // ... 其他測試案例
});
```

---

## 完成指標

- ✅ 所有測試案例都已規劃
- ✅ Input/Output 都已定義
- ✅ Mocks 都已識別
- ✅ 實作順序已確定
- ✅ 已提交給人類審查並確認
