---
apply: on-demand
name: debug
trigger: "當使用者說「除錯」、「Debug」、「出現錯誤」或需要診斷與修復問題時"
description: "提供系統化的除錯流程與步驟，協助診斷、識別並修復程式碼中的問題，確保修復後不會引入新的問題。"
---

# Debug Mode - 除錯模式

## 目的
系統化地診斷、識別、修復問題，並確保修復後不會引入新的問題。

---

## 前置條件

1. ✅ 已確認問題發生的環境（本地、測試、生產）
2. ✅ 已收集基本的錯誤資訊（錯誤訊息、堆疊追蹤）
3. ✅ 已嘗試重現問題

---

## 除錯流程

```
1. 問題識別與重現
   ↓
2. 資訊收集與分析
   ↓
3. 假設與驗證
   ↓
4. 問題修復
   ↓
5. 測試驗證
   ↓
6. 提交修復
```

---

## 執行步驟

### Step 1: 問題識別與重現

**執行動作：**
1. 明確描述問題（What、When、Where）
2. 確認問題的嚴重程度
3. 嘗試在本地環境重現問題

**問題描述範本：**
```markdown
## 問題描述
- **What**: 發生了什麼問題？
- **When**: 什麼時候發生？（特定操作、時間點）
- **Where**: 在哪個環境？（本地、測試、生產）
- **Who**: 影響哪些使用者？（所有人、特定使用者）
- **Expected**: 預期的行為是什麼？
- **Actual**: 實際發生的行為是什麼？
```

**嚴重程度分類：**
- **P0 (Critical)** - 生產環境崩潰、資料遺失、安全漏洞
- **P1 (High)** - 核心功能無法使用、影響大量使用者
- **P2 (Medium)** - 部分功能異常、影響少數使用者
- **P3 (Low)** - UI 問題、小 bug、優化建議

**檢查清單：**
- [ ] 問題已明確描述
- [ ] 嚴重程度已評估
- [ ] 問題可在本地重現（或有明確的重現步驟）

---

### Step 2: 資訊收集與分析

**執行動作：**
收集所有相關的錯誤資訊、日誌、環境資訊。

#### 2.1 錯誤訊息收集

**瀏覽器錯誤（Frontend）：**
```bash
# 開啟 Browser DevTools
# - Console: 查看 JavaScript 錯誤
# - Network: 查看 API 請求失敗
# - Application: 查看 localStorage/sessionStorage
```

**應用程式日誌（Backend/Cloud Run）：**
```bash
# 查看 Cloud Run 日誌
gcloud run services logs read portfolio-frontend \
  --region=asia-east1 \
  --limit=100

# 過濾特定時間範圍
gcloud run services logs read portfolio-frontend \
  --region=asia-east1 \
  --filter="timestamp>=\"2025-01-01T00:00:00Z\""

# 過濾錯誤等級
gcloud run services logs read portfolio-frontend \
  --region=asia-east1 \
  --filter="severity>=ERROR"
```

**本地開發日誌：**
```bash
# 查看開發伺服器日誌
npm run dev

# 查看測試執行日誌
npm test -- --verbose
```

#### 2.2 環境資訊收集

```bash
# Node.js 版本
node --version

# npm 版本
npm --version

# 檢查已安裝的套件版本
npm list <package-name>

# 檢查環境變數
env | grep -E 'NODE|DATABASE|GCP'
```

#### 2.3 程式碼分析

**檢查最近的變更：**
```bash
# 查看最近的 commits
git log --oneline -10

# 查看特定檔案的變更歷史
git log --oneline -- <file-path>

# 比較與上一個穩定版本的差異
git diff <stable-tag>..HEAD
```

**檢查相關程式碼：**
- [ ] 識別錯誤發生的檔案與行數
- [ ] 查看相關的函式/類別
- [ ] 檢查最近的程式碼變更

**檢查清單：**
- [ ] 錯誤訊息已收集
- [ ] 日誌已檢查
- [ ] 環境資訊已確認
- [ ] 相關程式碼已識別

---

### Step 3: 假設與驗證

**執行動作：**
基於收集的資訊，提出假設並逐一驗證。

**常見問題類型與假設：**

#### 3.1 前端問題

**問題類型：**
- UI 顯示異常
- API 請求失敗
- 狀態管理錯誤
- 路由問題

**假設範例：**
```markdown
1. API 回應格式不符合預期
   → 檢查 API response schema
   → 驗證：查看 Network tab 的 response

2. React state 更新時機錯誤
   → 檢查 useEffect 依賴項
   → 驗證：添加 console.log 追蹤 state 變化

3. 環境變數未正確載入
   → 檢查 .env 檔案
   → 驗證：console.log(process.env.NEXT_PUBLIC_*)
```

**除錯工具：**
```typescript
// 使用 React DevTools
// 安裝: https://react.dev/learn/react-developer-tools

// 使用 console.log 除錯
console.log('Debug:', { variable1, variable2 });

// 使用 debugger 斷點
debugger;

// 使用 Chrome DevTools 設置條件斷點
```

#### 3.2 後端/API 問題

**問題類型：**
- API 回應錯誤
- 資料庫查詢失敗
- 認證/授權問題
- 第三方服務整合問題

**假設範例：**
```markdown
1. 資料庫連線失敗
   → 檢查 DATABASE_URL 環境變數
   → 驗證：測試資料庫連線

2. API endpoint 路由錯誤
   → 檢查 Next.js API routes 配置
   → 驗證：查看路由定義

3. 權限不足
   → 檢查 Service Account 權限
   → 驗證：查看 GCP IAM 設定
```

**除錯工具：**
```bash
# 測試 API endpoint
curl -X GET http://localhost:3000/api/test

# 使用 Postman/Insomnia 測試 API

# 檢查資料庫連線
# (根據專案實際使用的資料庫工具)
```

#### 3.3 測試問題

**問題類型：**
- 單元測試失敗
- E2E 測試不穩定
- BDD 測試 step definitions 錯誤

**假設範例：**
```markdown
1. 測試資料不一致
   → 檢查 test setup/teardown
   → 驗證：確保每個測試獨立運行

2. 非同步操作未完成
   → 檢查是否正確使用 await
   → 驗證：增加 timeout 時間測試

3. Mock 設定錯誤
   → 檢查 mock 回傳值
   → 驗證：console.log mock 物件
```

**除錯工具：**
```bash
# 執行單一測試檔案
npm test -- <file-path>

# 使用 headed mode 除錯 E2E
npm run test:e2e -- --headed

# 使用 debug mode
npm run test:e2e -- --debug
```

#### 3.4 部署問題

**問題類型：**
- Docker build 失敗
- Cloud Run 部署失敗
- 環境變數未正確設定
- Terraform apply 失敗

**假設範例：**
```markdown
1. Docker build 階段失敗
   → 檢查 Dockerfile 語法
   → 驗證：本地執行 docker build

2. 環境變數缺失
   → 檢查 Cloud Run 環境變數設定
   → 驗證：查看 GCP Console

3. Service Account 權限不足
   → 檢查 IAM roles
   → 驗證：查看 Terraform 配置
```

**檢查清單：**
- [ ] 至少提出 2-3 個假設
- [ ] 每個假設都有明確的驗證方法
- [ ] 依照可能性排序假設

---

### Step 4: 問題修復

**執行動作：**
1. 根據驗證結果定位問題根因
2. 撰寫測試重現問題（TDD 方法）
3. 實作修復
4. 確保修復不引入新問題

**修復流程（TDD）：**
```
1. 撰寫失敗的測試（重現 bug）
   ↓
2. 修復程式碼讓測試通過
   ↓
3. 重構與優化
   ↓
4. 執行所有測試確保沒有 regression
```

**範例：修復 API 錯誤**
```text
// Step 1: 撰寫測試重現問題
describe('BlogService', () => {
  it('should handle null title gracefully', async () => {
    const service = new BlogService();
    const post = await service.createPost({
      title: null, // 重現問題
      content: 'Test Content'
    });

    expect(post.title).toBe(''); // 預期行為
  });
});

// Step 2: 修復程式碼
export class BlogService {
  async createPost(data: { title: string | null; content: string }) {
    return {
      id: crypto.randomUUID(),
      title: data.title ?? '', // 修復：處理 null
      content: data.content,
      createdAt: new Date()
    };
  }
}
```

**檢查清單：**
- [ ] 問題根因已識別
- [ ] 測試已撰寫（重現問題）
- [ ] 修復已實作
- [ ] 測試通過
- [ ] 程式碼已重構（如需要）

---

### Step 5: 測試驗證

**執行動作：**
執行完整的測試套件，確保修復有效且沒有引入新問題。

```bash
# 1. 執行所有測試
npm test

# 2. 執行 E2E 測試
npm run test:e2e

# 3. 執行 BDD 測試
npm run test:bdd

# 4. 執行 lint 檢查
npm run lint

# 5. 本地手動測試
npm run dev
```

**驗證檢查項目：**
- [ ] 原始問題已解決
- [ ] 所有單元測試通過
- [ ] 所有 E2E 測試通過
- [ ] 所有 BDD 測試通過
- [ ] 沒有 ESLint 錯誤
- [ ] 沒有引入新的問題（regression test）
- [ ] 本地手動測試確認功能正常

**Regression Testing（回歸測試）：**
- 確認修復沒有破壞現有功能
- 執行完整的測試套件
- 測試相關的功能模組

---

### Step 6: 提交修復

**執行動作：**
提交修復並更新相關文件。

**Commit Message 格式：**
```bash
# 使用 fix: type
git add .
git commit -m "fix: resolve null pointer in blog service

- Add null check for title field
- Add test case for null title handling
- Update BlogService to handle edge cases

Fixes #123"
```

**更新文件：**
```bash
# 如果是已知問題，更新 TODO
# docs/todos/<feature-name>.md

# 如果需要，添加除錯紀錄
# 記錄問題、根因、解決方案
```

**檢查清單：**
- [ ] Commit message 符合 Conventional Commits
- [ ] Commit message 包含問題描述與解決方案
- [ ] 相關 Issue 已關聯（Fixes #123）
- [ ] 文件已更新（如需要）

---

## 常見問題與解決方案

### 問題 1: "Module not found" 錯誤

**診斷步驟：**
```bash
# 檢查套件是否已安裝
npm list <package-name>

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 檢查 import 路徑是否正確
```

**常見原因：**
- 套件未安裝
- import 路徑錯誤
- TypeScript path mapping 配置錯誤

---

### 問題 2: TypeScript 類型錯誤

**診斷步驟：**
```bash
# 查看詳細的類型錯誤
npx tsc --noEmit --pretty

# 檢查特定檔案
npx tsc --noEmit <file-path>
```

**常見原因：**
- 型別定義缺失
- 使用不安全的型別轉換
- 第三方套件型別定義過時

**解決方案：**
```typescript
// 使用 Type Guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 使用 Schema 驗證（Zod）
import { z } from 'zod';
const schema = z.object({ title: z.string() });
```

---

### 問題 3: 測試不穩定（Flaky Tests）

**診斷步驟：**
```bash
# 多次執行測試確認
npm test -- --watch

# 檢查測試是否依賴執行順序
npm test -- --maxWorkers=1
```

**常見原因：**
- 測試之間共用狀態
- 非同步操作未正確等待
- 測試依賴外部服務

**解決方案：**
```typescript
// 使用 beforeEach/afterEach 清理狀態
beforeEach(() => {
  // 重置狀態
});

// 確保異步操作完成
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

// 使用 Mock 替代外部服務
vi.mock('./api-client');
```

---

### 問題 4: E2E 測試逾時

**診斷步驟：**
```bash
# 使用 headed mode 觀察
npm run test:e2e -- --headed

# 增加 timeout
npm run test:e2e -- --timeout=60000
```

**常見原因：**
- 應用程式載入緩慢
- Selector 錯誤
- 頁面跳轉未完成

**解決方案：**
```typescript
// 使用明確的等待
await page.waitForSelector('[data-testid="blog-list"]');

// 等待網路請求完成
await page.waitForLoadState('networkidle');

// 使用更穩定的 selector
const button = page.getByRole('button', { name: 'Submit' });
```

---

### 問題 5: Cloud Run 部署後無法訪問

**診斷步驟：**
```bash
# 查看 Cloud Run 日誌
gcloud run services logs read portfolio-frontend \
  --region=asia-east1 \
  --limit=100

# 檢查服務狀態
gcloud run services describe portfolio-frontend \
  --region=asia-east1
```

**常見原因：**
- 環境變數未正確設定
- Service Account 權限不足
- 應用程式啟動失敗
- Port 配置錯誤

**解決方案：**
- 檢查 Cloud Run 環境變數
- 驗證 IAM 權限
- 檢查應用程式日誌
- 確認 Dockerfile 的 PORT 設定

---

## 除錯最佳實踐

### ✅ 良好的除錯習慣

1. **系統化方法** - 遵循除錯流程，不要隨機嘗試
2. **記錄過程** - 記錄嘗試過的假設與結果
3. **一次改變一個變數** - 避免同時修改多處
4. **撰寫測試** - 用測試重現問題
5. **尋求協助** - 適時請教團隊成員

### ❌ 應避免的除錯習慣

1. **猜測性修改** - 沒有假設就隨機修改程式碼
2. **忽略錯誤訊息** - 沒有仔細閱讀錯誤訊息
3. **跳過測試** - 修復後沒有執行測試驗證
4. **保留 debug 程式碼** - 提交時包含 console.log 或 debugger
5. **重複相同嘗試** - 一直嘗試已經失敗的方法

---

## 除錯工具清單

### 前端除錯
- **Chrome DevTools** – Console、Network、Sources、React DevTools
- **React DevTools** - Component tree、Props、State
- **Redux DevTools** - State management debugging（如使用 Redux）

### 後端除錯
- **Node.js Debugger** – VS Code built-in debugger
- **Log 分析** - Cloud Run logs、GCP Logs Explorer
- **Postman/Insomnia** - API 測試

### 測試除錯
- **Playwright Inspector** - `npm run test:e2e -- --debug`
- **Playwright UI Mode** - `npm run test:e2e -- --ui`
- **Test Coverage Report** – 識別未測試的程式碼

### 基礎設施除錯
- **Terraform Plan** - 預覽基礎設施變更
- **GCP Console** - 查看資源狀態與日誌
- **gcloud CLI** - 命令列操作與查詢

---

## 完成條件

- ✅ 問題已明確識別與重現
- ✅ 問題根因已找到
- ✅ 修復已實作並通過測試
- ✅ 沒有引入新問題（regression test 通過）
- ✅ 修復已提交（commit message 符合規範）
- ✅ 相關文件已更新

---

## 參考資料

- 專案最高指導原則：`.aiassistant/rules/core.md`
- 測試標準：專案的測試配置檔案
- GCP 日誌：https://console.cloud.google.com/logs
- Playwright 文件：https://playwright.dev/docs/debug
- Chrome DevTools：https://developer.chrome.com/docs/devtools
