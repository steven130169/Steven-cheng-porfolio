# JetBrains MCP Tools 使用參考

## 概述

JetBrains MCP 提供程式碼品質檢查、格式化、重構等功能，整合 IDE 的智能分析能力。

---

## 核心工具

### 1. get_file_problems(filePath, errorsOnly)

**用途**: 取得檔案的問題（errors 和 warnings）

**使用時機**:

- Refactor Phase - 檢查程式碼品質
- 修復 TypeScript 錯誤
- 識別潛在問題

**參數**:

- `filePath`: 檔案路徑（相對於專案根目錄）
- `errorsOnly`: 是否只顯示 errors（true = 只顯示 errors, false = 顯示 errors + warnings）

**範例**:

```typescript
const result = await mcp__jetbrains__get_file_problems(
    'frontend/src/server/services/order.ts',
    false  // 顯示 errors 和 warnings
);
```

**輸出範例**:

```json
{
  "problems": [
    {
      "severity": "ERROR",
      "message": "Type 'string | undefined' is not assignable to type 'string'",
      "line": 42,
      "column": 10,
      "file": "frontend/src/server/services/order.ts"
    },
    {
      "severity": "WARNING",
      "message": "Variable 'mockData' is declared but never used",
      "line": 15,
      "column": 7,
      "file": "frontend/src/server/services/order.ts"
    }
  ]
}
```

---

### 2. reformat_file(path)

**用途**: 格式化檔案（縮排、空格、換行、import 順序等）

**使用時機**:

- Refactor Phase - 格式化所有修改的檔案
- Commit 前確保格式一致

**參數**:

- `path`: 檔案路徑（相對於專案根目錄）

**範例**:

```typescript
await mcp__jetbrains__reformat_file(
    'frontend/src/server/services/order.ts'
);
```

**格式化內容**:

- Indentation（縮排）
- Whitespace（空格）
- Line breaks（換行）
- Import statements（Import 順序）
- Code style（程式碼風格）

**注意**: 格式化後可能產生新的 git diff，這是正常的。

---

### 3. rename_refactoring(pathInProject, symbolName, newName)

**用途**: 重命名變數/函數/類別，自動更新所有 references

**使用時機**:

- Refactor Phase - 改善命名
- 提升程式碼可讀性

**參數**:

- `pathInProject`: 檔案路徑（相對於專案根目錄）
- `symbolName`: 舊名稱
- `newName`: 新名稱

**範例**:

```typescript
await mcp__jetbrains__rename_refactoring(
    'frontend/src/server/services/order.ts',
    'processOrder',  // 舊名稱
    'createOrder'    // 新名稱
);
```

**好處**:

- 自動更新所有 references（跨檔案）
- 保持一致性
- 避免手動 find/replace 遺漏
- 安全重構（不會破壞程式碼）

---

### 4. get_symbol_info(filePath, line, column)

**用途**: 取得 function/變數的說明文件（Quick Documentation）

**使用時機**:

- 確認 function 參數
- 檢查 function 回傳值
- 理解 API 使用方式

**參數**:

- `filePath`: 檔案路徑（相對於專案根目錄）
- `line`: 行號（1-based）
- `column`: 列號（1-based）

**範例**:

```typescript
const result = await mcp__jetbrains__get_symbol_info(
    'frontend/src/server/services/order.ts',
    42,
    10
);
```

**輸出範例**:

```json
{
  "documentation": "Creates a new order with the given data.\n\n@param data - Order data including eventId, tickets, and customer\n@returns Promise<Order> - Created order with orderId and status",
  "signature": "function createOrder(data: OrderData): Promise<Order>",
  "type": "function"
}
```

---

### 5. get_run_configurations()

**用途**: 取得專案的 run configurations

**使用時機**:

- 啟動 Wallaby
- 執行其他 run configurations

**範例**:

```typescript
const result = await mcp__jetbrains__get_run_configurations();
```

**輸出範例**:

```json
{
  "configurations": [
    {
      "name": "wallaby",
      "type": "node",
      "command": "node wallaby.js"
    },
    {
      "name": "dev",
      "type": "npm",
      "command": "npm run dev"
    }
  ]
}
```

---

### 6. execute_run_configuration(configurationName)

**用途**: 執行指定的 run configuration

**使用時機**:

- 啟動 Wallaby
- 執行開發伺服器
- 執行自訂 scripts

**參數**:

- `configurationName`: Configuration 名稱

**範例**:

```typescript
await mcp__jetbrains__execute_run_configuration('wallaby');
```

**輸出**:

```
Wallaby started successfully
```

---

## 常見使用流程

### 流程 1: 重構迴圈（完整）

```typescript
// 1. 取得異動檔案
const modifiedFiles = execSync('git status --short')
    .toString()
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.substring(3));  // 去除 git status 前綴

// 2. 處理新增檔案
for (const file of modifiedFiles) {
    if (file.startsWith('??')) {
        execSync(`git add ${file.substring(3)}`);
    }
}

// 3. 檢查問題
for (const file of modifiedFiles) {
    const problems = await mcp__jetbrains__get_file_problems(file, false);

    if (problems.problems.length > 0) {
        console.log(`${file} 有 ${problems.problems.length} 個問題`);
        // 修復問題...
    }
}

// 4. 格式化
for (const file of modifiedFiles) {
    await mcp__jetbrains__reformat_file(file);
}

// 5. ESLint
execSync('npm run lint -w frontend');

// 6. 驗證測試
const allTests = await mcp__wallaby__wallaby_allTests();
const passingCount = allTests.tests.filter(t => t.status === 'passing').length;

if (passingCount === allTests.tests.length) {
    console.log('✅ 重構完成');
} else {
    console.log('❌ 測試失敗，回到步驟 1');
}
```

---

### 流程 2: 重命名重構

```typescript
// 1. 決定要重命名的 symbol
const oldName = 'processOrder';
const newName = 'createOrder';

// 2. 執行 rename refactoring
await mcp__jetbrains__rename_refactoring(
    'frontend/src/server/services/order.ts',
    oldName,
    newName
);

// 3. 驗證測試仍通過
const allTests = await mcp__wallaby__wallaby_allTests();
```

---

### 流程 3: 檢查並修復檔案問題

```typescript
// 1. 檢查檔案問題
const problems = await mcp__jetbrains__get_file_problems(
    'frontend/src/server/services/order.ts',
    false
);

// 2. 分類問題
const errors = problems.problems.filter(p => p.severity === 'ERROR');
const warnings = problems.problems.filter(p => p.severity === 'WARNING');

console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);

// 3. 逐一修復
for (const error of errors) {
    console.log(`Line ${error.line}: ${error.message}`);
    // 根據錯誤訊息修復...
}

// 4. 重新檢查
const updatedProblems = await mcp__jetbrains__get_file_problems(
    'frontend/src/server/services/order.ts',
    false
);

if (updatedProblems.problems.length === 0) {
    console.log('✅ 所有問題已修復');
}
```

---

### 流程 4: 啟動 Wallaby

```typescript
// 1. 取得 run configurations
const configs = await mcp__jetbrains__get_run_configurations();

// 2. 尋找 wallaby configuration
const wallabyConfig = configs.configurations.find(c => c.name === 'wallaby');

if (!wallabyConfig) {
    console.error('找不到 wallaby configuration');
    return;
}

// 3. 執行 Wallaby
await mcp__jetbrains__execute_run_configuration('wallaby');

// 4. 等待啟動
await new Promise(resolve => setTimeout(resolve, 10000));

// 5. 驗證運作
const allTests = await mcp__wallaby__wallaby_allTests();
console.log(`Wallaby 已啟動，共 ${allTests.tests.length} 個測試`);
```

---

## 最佳實踐

### 1. 先檢查問題，再格式化

```typescript
// ✅ Good: 先修復問題，再格式化
const problems = await mcp__jetbrains__get_file_problems(file, false);
// 修復問題...
await mcp__jetbrains__reformat_file(file);
```

```typescript
// ❌ Bad: 先格式化，可能掩蓋問題
await mcp__jetbrains__reformat_file(file);
const problems = await mcp__jetbrains__get_file_problems(file, false);
```

### 2. 使用 rename_refactoring 而非 find/replace

```typescript
// ✅ Good: 使用 IDE 重構
await mcp__jetbrains__rename_refactoring(
    'frontend/src/server/services/order.ts',
    'oldName',
    'newName'
);

// ❌ Bad: 手動 find/replace（容易遺漏）
// 手動在所有檔案中搜尋並替換...
```

### 3. 定期檢查程式碼品質

```typescript
// 在 Refactor Phase 反覆執行
const problems = await mcp__jetbrains__get_file_problems(file, false);

while (problems.problems.length > 0) {
    // 修復問題
    // 重新檢查
    problems = await mcp__jetbrains__get_file_problems(file, false);
}
```

---

## 常見問題類型與修復

### Type Errors

**問題**:

```
Type 'string | undefined' is not assignable to type 'string'
```

**修復**:

```typescript
// ❌ Before
function getEmail(customer: Customer | undefined): string {
    return customer.email;  // Error
}

// ✅ After (使用 Optional Chaining)
function getEmail(customer: Customer | undefined): string | undefined {
    return customer?.email;
}
```

---

### Unused Variables

**問題**:

```
'mockData' is declared but never used
```

**修復**:

```typescript
// ❌ Before
const mockData = {...};  // 未使用

// ✅ After (移除)
// 直接刪除未使用的變數
```

---

### Missing Return Type

**問題**:

```
Function lacks return type annotation
```

**修復**:

```text
// ❌ Before
function calculateTotal(tickets) {
    return tickets.reduce(...);
}

// ✅ After
function calculateTotal(tickets: Ticket[]): number {
    return tickets.reduce(...);
}
```

---

## 故障排除

### Q: get_file_problems() 回傳空陣列但仍有錯誤

**原因**: IDE 尚未完成檔案分析

**解決**:

1. 等待 5 秒
2. 重新執行 `get_file_problems()`
3. 確保 IDE 已開啟專案

### Q: reformat_file() 沒有效果

**原因**: IDE 格式化設定問題

**解決**:

1. 檢查 IDE 格式化設定
2. 確保檔案類型正確（.ts, .tsx）
3. 手動在 IDE 中測試格式化功能

### Q: rename_refactoring() 失敗

**原因**: Symbol 不存在或有多個同名 symbol

**解決**:

1. 確認 symbol 名稱正確
2. 確認 symbol 在指定檔案中存在
3. 如果有多個同名，手動重構
