# Phase 1: 規劃階段詳細指引

## 目標
分析 Gherkin scenario，規劃所有需要的單元測試案例。

## 前置條件
- Feature branch 已建立（透過 `/feature-start`）
- Gherkin 檔案已存在於 `e2e/specs/`

## 執行步驟

### 1. 列出所有 Gherkin 檔案
```bash
ls e2e/specs/*.feature
```

### 2. 讀取目標 Scenario
選擇未完成的 scenario（標記 `# TODO` 或未實作）

範例:
```gherkin
# e2e/specs/event-ticketing.feature
Feature: 活動票務系統

  Scenario: 使用者可以購買活動票券
    Given 活動 "2024 音樂節" 有 10 張一般票可售
    When 使用者購買 2 張一般票
    Then 訂單狀態為 "pending"
    And 庫存剩餘 8 張
```

### 3. 進入 Plan Mode 分析
```
/plan
```

在 plan mode 中，進行以下分析：

#### 3.1 業務邏輯分解
- **Given** (前置條件) → 需要設定什麼資料？
  - 建立活動記錄
  - 設定票種和庫存

- **When** (執行動作) → 需要呼叫哪個 function？
  - `createOrder({ eventId, tickets, customer })`

- **Then** (預期結果) → 需要驗證什麼？
  - Order status 為 "pending"
  - 庫存正確扣減

#### 3.2 識別測試檔案
根據業務邏輯，識別需要測試的檔案：
- Service layer: `frontend/src/server/services/order.ts`
- Repository layer: `frontend/src/server/db/queries.ts`
- API route: `frontend/src/app/api/orders/route.ts`

#### 3.3 規劃測試案例
為每個測試檔案規劃測試案例：

**檔案**: `frontend/src/server/services/__tests__/order.test.ts`

1. **測試案例**: 成功建立訂單
   - **描述**: 當購買票券時，應該建立訂單並返回 order ID
   - **Input**:
     ```typescript
     const order ={
       eventId: 'event-123',
       tickets: [{ ticketTypeId: 'ticket-1', quantity: 2 }],
       customer: { email: 'test@example.com', name: '測試' }
     }
     ```
   - **Expected Output**:
     ```typescript
     const expectedOrder ={
       orderId: 'order-456',
       status: 'pending'
     }
     ```
   - **Mocks**:
     - `db.getTicketTypes()` → 回傳 `[{ id: 'ticket-1', price: 1000, inventory: 10 }]`
     - `db.insertOrder()` → 回傳 `{ id: 'order-456' }`
     - `payment.createPaymentIntent()` → 回傳 `{ id: 'pi_789' }`

2. **測試案例**: 庫存不足時拋出錯誤
   - **描述**: 當購買數量超過庫存時，應該拋出錯誤
   - **Input**:
     ```typescript
     {
       tickets: [{ ticketTypeId: 'ticket-1', quantity: 100 }]
     }
     ```
   - **Expected Output**:
     ```typescript
     throw new Error('庫存不足')
     ```
   - **Mocks**:
     - `db.getTicketTypes()` → 回傳 `[{ id: 'ticket-1', inventory: 10 }]`

3. **測試案例**: 支付失敗時回滾訂單
   - **描述**: 當支付失敗時，應該刪除已建立的訂單
   - **Input**: 同測試案例 1
   - **Expected Output**: 拋出支付錯誤
   - **Mocks**:
     - `db.getTicketTypes()` → 正常
     - `db.insertOrder()` → 正常
     - `payment.createPaymentIntent()` → 拋出錯誤
   - **驗證**: `db.deleteOrder()` 被呼叫

### 4. 輸出計畫
將分析結果輸出為結構化格式：

```markdown
## Gherkin Scenario: 使用者可以購買活動票券

### 測試檔案: frontend/src/server/services/__tests__/order.test.ts

#### 測試案例 1: 成功建立訂單
- **Input**: { eventId, tickets: [{ ticketTypeId, quantity: 2 }], customer }
- **Expected**: { orderId, status: 'pending' }
- **Mocks**: db.getTicketTypes, db.insertOrder, payment.createPaymentIntent

#### 測試案例 2: 庫存不足時拋出錯誤
- **Input**: { tickets: [{ quantity: 100 }] }
- **Expected**: throw Error('庫存不足')
- **Mocks**: db.getTicketTypes → inventory: 10

#### 測試案例 3: 支付失敗時回滾訂單
- **Input**: 同測試案例 1
- **Expected**: throw PaymentError
- **Verify**: db.deleteOrder called

### 實作順序
1. 測試案例 1（Happy path）
2. 測試案例 2（Error handling – 業務邏輯）
3. 測試案例 3（Error handling – 外部依賴）
```

### 5. 提交給人類審查
在 plan mode 中，將計畫輸出給用戶：
- 詢問是否需要調整測試案例
- 確認 mocks 是否合理
- 確認測試順序是否正確

### 6. 用戶確認後，退出 Plan Mode
```
/exitplan
```

## 常見問題

### Q: 如何決定測試案例的順序？
A: 優先順序如下：
1. Happy path（成功案例）
2. 業務邏輯 edge cases
3. 外部依賴失敗處理

### Q: 如何決定需要哪些 mocks？
A: 識別所有外部依賴：
- Database operations
- API calls
- Payment services
- Email services

### Q: 是否需要為每個 function 都寫測試？
A: 根據 Gherkin scenario 的需求決定，不要過度測試：
- ✅ 測試業務邏輯
- ✅ 測試錯誤處理
- ❌ 不測試 framework 本身（Next.js, Drizzle ORM）
