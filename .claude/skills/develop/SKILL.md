---
apply: on-demand
name: develop
trigger: "當使用者說「開始開發」、「進入開發模式」或已完成 feature-start 準備進入實作階段時"
description: "引導使用者遵循 TDD 流程進行功能開發，確保每個功能都有完整的測試覆蓋，並符合專案的程式碼品質標準。"
---

# Develop Mode - 開發模式

## 目的
遵循 TDD（Test-Driven Development）流程，確保每個功能都有完整的測試覆蓋，並符合專案的程式碼品質標準。

---

## 前置條件

1. ✅ 已完成 Feature Start 流程
2. ✅ 功能分支已建立
3. ✅ TODO 清單已建立（`docs/todos/<feature-name>.md`）
4. ✅ Gherkin feature 檔案已建立（如適用）

---

## 開發流程（TDD Cycle）

### Red-Green-Refactor 循環

```
┌─────────────────────────────────────────┐
│  RED: 撰寫失敗的測試                      │
│  ↓                                       │
│  GREEN: 撰寫最少的程式碼讓測試通過         │
│  ↓                                       │
│  REFACTOR: 重構程式碼，保持測試通過        │
│  ↓                                       │
│  回到 RED（下一個測試案例）                │
└─────────────────────────────────────────┘
```

---

## 執行步驟

### Step 1: Red - 撰寫測試（Test First）

**執行動作：**
1. 從 TODO 清單中選擇一個待開發的功能點
2. 撰寫測試案例（先寫測試，不寫實作）
3. 執行測試，確認測試**失敗**（Red）

**測試類型優先順序：**
1. **Unit Tests** - 測試單一函式或類別
2. **Integration Tests** - 測試多個模組的整合
3. **E2E Tests** - 測試完整的使用者流程

**範例：**
```typescript
// frontend/src/services/blog.service.spec.ts
describe('BlogService', () => {
  it('should create a new blog post', async () => {
    const service = new BlogService();
    const post = await service.createPost({
      title: 'Test Post',
      content: 'Test Content'
    });

    expect(post.id).toBeDefined();
    expect(post.title).toBe('Test Post');
  });
});
```

**檢查清單：**
- [ ] 測試案例已撰寫
- [ ] 測試描述清楚（describe/it 語意明確）
- [ ] 測試執行後顯示為**失敗**（Red）
- [ ] 測試失敗原因符合預期（因為功能尚未實作）

**執行測試指令：**
**✨ 優先使用 Wallaby.js（智能測試執行）：**

Wallaby.js 提供即時測試回饋，自動偵測程式碼變更並執行相關測試。

```bash
# 啟動 Wallaby.js（推薦）
# Wallaby 會自動執行測試並在 IDE 中顯示即時結果
# 使用 MCP 工具查詢 Wallaby 狀態和結果
```

**備選：使用 Vitest CLI（手動測試執行）：**
```bash
# 執行所有 Unit Tests
npm test

# 執行特定檔案
npm test -- blog.service.spec.ts

# Watch mode（檔案變更時自動重新執行）
npm test -- --watch
```

**何時使用 Wallaby vs Vitest CLI：**
- **優先使用 Wallaby**：日常開發、TDD 循環、需要即時回饋
- **使用 Vitest CLI**：CI/CD 環境、需要完整測試報告、Wallaby 不可用時

---

### Step 2: Green - 實作功能（Make it Work）

**執行動作：**
1. 撰寫**最少量**的程式碼，讓測試通過
2. 不需要考慮優化或完美的設計
3. 執行測試，確認測試**通過**（Green）

**實作原則：**
- 只寫足夠讓測試通過的程式碼
- 遵循 `.aiassistant/rules/core.md` 的規範
- 避免過度設計（YAGNI - You Aren't Gonna Need It）

**範例：**
```typescript
// frontend/src/services/blog.service.ts
export class BlogService {
  async createPost(data: { title: string; content: string }) {
    // 最簡單的實作，讓測試通過
    return {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      createdAt: new Date()
    };
  }
}
```

**檢查清單：**
- [ ] 程式碼已實作
- [ ] 測試執行後顯示為**通過**（Green）
- [ ] 沒有使用 `any` 類型
- [ ] 沒有使用不安全的型別轉換 `as`
- [ ] 所有異步操作都有 `await` 或 `.catch()`

---

### Step 3: Refactor - 重構程式碼（Make it Right）

**執行動作：**
1. 重構程式碼，改善設計與可讀性
2. 移除重複的程式碼（DRY - Don't Repeat Yourself）
3. 執行測試，確保測試**仍然通過**

**重構檢查項目：**
- [ ] 移除重複的程式碼
- [ ] 改善變數與函式命名
- [ ] 簡化複雜的邏輯
- [ ] 確保符合 SOLID 原則
- [ ] 測試仍然全部通過

**常見重構模式：**
- 提取函式（Extract Function）
- 提取變數（Extract Variable）
- 移除魔術數字（Replace Magic Number with Constant）
- 簡化條件式（Simplify Conditional）

---

### Step 4: 更新 TODO 清單

**執行動作：**
1. 標記已完成的任務為 `[x]`
2. 提交程式碼（遵循 Conventional Commits）
3. 繼續下一個測試案例（回到 Step 1）

**Commit Message 規範（@commitlint/config-conventional）：**

格式：`<type>[optional scope]: <description>`

**允許的 type：**
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文件更新
- `style`: 程式碼格式調整（不影響功能）
- `refactor`: 重構（不是新功能也不是 bug 修復）
- `perf`: 效能優化
- `test`: 測試相關
- `build`: 建置系統或外部依賴變更
- `ci`: CI 配置檔案或腳本變更
- `chore`: 其他不影響 src 或 test 的變更
- `revert`: 回復先前的 commit

**範例：**
```bash
# feat: 新功能
git add .
git commit -m "feat: add blog post creation service"

# test: 測試
git commit -m "test: add unit tests for blog service"

# refactor: 重構
git commit -m "refactor: simplify blog post creation logic"

# fix: 修復 bug
git commit -m "fix: resolve null pointer in blog service"

# feat with scope: 帶範圍的新功能
git commit -m "feat(blog): add post publishing feature"

# breaking change: 重大變更（加入 ! 或 BREAKING CHANGE）
git commit -m "feat!: change blog API response structure"
```

**規則：**
- type 必須是小寫
- description 必須是小寫開頭
- description 不能以句號結尾
- 使用祈使句（如：add、change、fix，而非 added、changed、fixed）

**檢查清單：**
- [ ] TODO 清單已更新
- [ ] 程式碼已提交（commit message 符合規範）
- [ ] 所有測試通過
- [ ] 沒有 TypeScript 編譯錯誤

---

## 程式碼品質檢查

在開發過程中，持續確認以下項目：

### 🔒 安全規範（參考 core.md）
- [ ] 不在程式碼中硬編碼 API 金鑰或敏感資訊
- [ ] 不在 Log 中輸出 PII（個人識別資訊）
- [ ] 防止 SQL/Shell Injection（不串接字串組合指令）
- [ ] 使用環境變數注入配置資訊

### 🧪 測試品質
- [ ] 單元測試不發起真實網絡請求（使用 Mock）
- [ ] 測試案例具有獨立性（不依賴執行順序）
- [ ] 測試覆蓋率達到合理水平（建議 >80%）

### ✅ TypeScript 規範
- [ ] 不使用 `any` 類型
- [ ] 不使用 `as` 進行不安全的型別轉換
- [ ] 不使用非空斷言 `!`（除非邏輯上絕對存在）
- [ ] 使用 Type Guards 或 Schema 驗證（Zod/Valibot）

### 🎯 程式碼風格
- [ ] 遵循專案的 ESLint 規則
- [ ] 沒有循環依賴
- [ ] 函式保持簡短（建議 <50 行）
- [ ] 使用有意義的變數與函式命名

---

## 執行指令參考

### 測試相關

**✨ 優先使用 Wallaby.js：**
```bash
# 透過 MCP 工具與 Wallaby.js 互動
# Wallaby 提供即時測試執行、覆蓋率視覺化、智能測試選擇
# 自動偵測檔案變更並執行相關測試
```

**Vitest CLI（傳統方式）：**
```bash
# 執行所有測試
npm test

# 執行特定檔案的測試
npm test -- <file-path>

# Watch mode（自動重新執行測試）
npm test -- --watch

# 測試覆蓋率報告
npm test -- --coverage

# E2E 測試
npm run test:e2e
```

### 程式碼檢查
```bash
# TypeScript 類型檢查
npm run type-check

# ESLint 檢查
npm run lint

# 自動修復 ESLint 錯誤
npm run lint:fix

# 格式化程式碼
npm run format
```

---

## 完成條件

單一功能點開發完成的標準：
- ✅ 測試已撰寫且通過
- ✅ 功能已實作
- ✅ 程式碼已重構
- ✅ TODO 清單已更新
- ✅ 程式碼已提交
- ✅ 符合所有程式碼品質標準

---

## 下一步

當所有開發任務完成後，進入 **Stabilize Mode**（穩定化模式）：
- 執行完整的測試套件
- 執行 E2E 測試
- 修復整合問題
- 準備 Code Review

---

## 參考資料

- 專案最高指導原則：`.aiassistant/rules/core.md`
- TODO 清單：`docs/todos/<feature-name>.md`
- TDD 最佳實踐：Red-Green-Refactor
- Commit 規範：Conventional Commits
