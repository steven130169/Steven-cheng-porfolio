# Fix Neon Database Driver for Transaction Support

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將 database driver 從 `drizzle-orm/neon-http` 切換到 `drizzle-orm/neon-serverless` 以支援 PostgreSQL transactions

**Architecture:**
目前使用 `neon-http` driver，這是一個輕量級 HTTP-based driver，不支援 transactions。我們的預約系統需要 pessimistic locking 來防止併發超賣，必須使用支援 transactions 的 `neon-serverless` driver。兩者都使用 `@neondatabase/serverless` 底層套件，只需要改變 Drizzle ORM 的 import。

**Tech Stack:**
- Drizzle ORM 0.45.1
- @neondatabase/serverless 1.0.2 (already installed)
- Next.js 16 (App Router)

**問題根源:**
BDD E2E 測試失敗,錯誤訊息 `"No transactions support in neon-http driver"`。所有使用 `db.transaction()` 的功能都會失敗,包括:
- `createReservation` (frontend/src/server/services/reservation.ts:17)
- `createOrderFromReservation` (frontend/src/server/services/order.ts:17)

---

## Task 1: 修改 production database connection

**Files:**
- Modify: `frontend/src/server/db/index.ts`

**Step 1: 讀取當前檔案**

```typescript
// Current content
mcp__jetbrains__get_file_text_by_path({
    pathInProject: 'frontend/src/server/db/index.ts',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 2: 替換 driver import**

將:
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
```

替換為:
```typescript
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

**Step 3: 使用 JetBrains MCP 執行替換**

```typescript
mcp__jetbrains__replace_text_in_file({
    pathInProject: 'frontend/src/server/db/index.ts',
    oldText: `import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);`,
    newText: `import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);`,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 4: 格式化並檢查問題**

```typescript
mcp__jetbrains__reformat_file({
    path: 'frontend/src/server/db/index.ts',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});

mcp__jetbrains__get_file_problems({
    filePath: 'frontend/src/server/db/index.ts',
    errorsOnly: false,
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

預期: 無錯誤

**Step 5: 驗證單元測試仍然通過**

```typescript
mcp__wallaby__wallaby_failingTests();
```

預期: 無失敗測試 (單元測試使用 test-db 而非此檔案)

**Step 6: Commit**

```bash
git add frontend/src/server/db/index.ts
git commit -m "fix(db): switch to neon-serverless driver for transaction support"
```

---

## Task 2: 驗證 transactions 正常運作

**Files:**
- Read: `frontend/src/server/services/reservation.ts`
- Read: `frontend/src/server/services/order.ts`

**Step 1: 驗證所有單元測試通過**

```typescript
mcp__wallaby__wallaby_allTests();
```

預期: 所有測試通過 (69 個測試)

**Step 2: 手動測試 transaction 功能**

啟動開發伺服器:
```bash
npm run dev -w frontend
```

使用 curl 測試預約建立 (需要真實的 DATABASE_URL):
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "ticketTypeId": 1,
    "quantity": 2,
    "customerEmail": "test@example.com"
  }'
```

預期: 201 Created (如果有真實資料) 或 400 Bad Request (如果 eventId 不存在)
不應該出現 "No transactions support" 錯誤

**Step 3: 執行 BDD E2E 測試 (optional)**

```typescript
mcp__jetbrains__execute_run_configuration({configurationName: 'Cucumer All Tests', projectPath: '...'});  // Runs to check all cucumber feature tests
```

預期:
- 如果 E2E test DATABASE_URL 使用 Neon: 應該通過
- 如果 E2E test DATABASE_URL 使用本地 PGLite: 可能仍會失敗 (PGLite 有其他限制)


---

## Task 3: 更新文件

**Files:**
- Modify: `CLAUDE.md`

**Step 1: 讀取 CLAUDE.md 中關於 database 的部分**

```typescript
mcp__jetbrains__search_in_files_by_text({
    searchText: 'Neon',
    fileMask: '*.md',
    projectPath: '/Users/stevencheng/codebase/Steven-cheng-porfolio'
});
```

**Step 2: 在 Tech Stack 區段新增說明**

尋找 `**Database**: Neon Serverless PostgreSQL` 相關描述,確認是否需要更新說明:

```markdown
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM 0.45.1
    - **Driver**: `drizzle-orm/neon-serverless` (支援 transactions)
    - **Note**: 使用 `Pool` connection 而非 `neon()` HTTP client 以支援 pessimistic locking
```

如果 CLAUDE.md 中沒有明確提到 driver,則不需要修改 (當前實作細節已足夠)。

**Step 3: Commit (如果有修改)**

```bash
git add CLAUDE.md
git commit -m "docs: clarify neon-serverless driver usage"
```

---

## Task 4: Clean up and verify

**Step 1: 執行完整的 pre-commit 檢查**

```bash
git add -A
git status
```

確認沒有未預期的變更。

**Step 2: 執行所有單元測試**

```typescript
mcp__wallaby__wallaby_failingTests();
```

預期: 無失敗測試

**Step 3: 執行前端 build**

```bash
npm run build -w frontend
```

預期: Build 成功

**Step 4: Final commit (如果有遺漏的變更)**

```bash
git add -A
git commit -m "chore: finalize neon-serverless migration"
```

---

## 驗證清單

完成後,確認以下項目:

- ✅ `frontend/src/server/db/index.ts` 使用 `drizzle-orm/neon-serverless`
- ✅ 所有單元測試通過 (69 tests)
- ✅ TypeScript 編譯無錯誤
- ✅ ESLint 無錯誤
- ✅ Terraform 測試通過
- ✅ Git 歷史乾淨 (使用 conventional commits)

## 後續工作 (不在此計畫範圍)

- BDD E2E 測試環境配置 (可能需要真實 Neon database 而非 PGLite)
- Connection pooling 優化 (production 環境可能需要調整 pool size)
- Graceful shutdown 處理 (確保 pool.end() 被呼叫)

---

## 估計時間

- Task 1: 5 分鐘 (修改 driver import)
- Task 2: 10 分鐘 (驗證功能)
- Task 3: 5 分鐘 (更新文件)
- Task 4: 5 分鐘 (最終驗證)

**總計**: ~25 分鐘