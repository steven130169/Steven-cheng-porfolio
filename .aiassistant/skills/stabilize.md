---
apply: on-demand
trigger: "當使用者說「穩定化」、「進入穩定化模式」或已完成功能開發準備進行整合測試時"
---

# Stabilize Mode - 穩定化模式

## 目的
確保功能在整合環境中穩定運作，所有測試通過，程式碼品質符合標準，準備進入 Code Review 與部署階段。

---

## 前置條件

1. ✅ 已完成 Develop Mode
2. ✅ 所有單元測試已通過
3. ✅ 功能核心邏輯已實作完成
4. ✅ TODO 清單中的開發任務已完成

---

## 執行步驟

### Step 1: 執行完整測試套件

**執行動作：**
執行所有測試，確保沒有任何測試失敗或被忽略。

```bash
# 1. 執行所有測試（包含 unit、e2e、bdd）
npm test

# 2. 單獨執行 E2E 測試
npm run test:e2e

# 3. 單獨執行 BDD 測試
npm run test:bdd

# 4. 單獨執行前端單元測試
npm run test:frontend:unit
```

**測試覆蓋率標準：**
- **整體覆蓋率**：≥ 80%
- **新增程式碼覆蓋率**：≥ 90%
- **關鍵路徑覆蓋率**：100%

**檢查清單：**
- [ ] 所有單元測試通過（0 failed）
- [ ] 所有 E2E 測試通過（0 failed）
- [ ] 所有 BDD 測試通過（0 failed）
- [ ] 測試覆蓋率達標
- [ ] 沒有被 skip 或 todo 的測試案例

**如果測試失敗：**
1. 識別失敗的測試案例
2. 分析失敗原因（邏輯錯誤、整合問題、測試案例錯誤）
3. 修復問題
4. 重新執行測試
5. 更新 TODO 清單

---

### Step 2: 程式碼品質檢查

**執行動作：**
執行所有程式碼品質檢查工具，確保符合專案標準。

```bash
# ESLint 檢查
npm run lint
```

**檢查清單：**
- [ ] 沒有 TypeScript 類型錯誤
- [ ] 沒有 ESLint 錯誤或警告
- [ ] 沒有未使用的 import 或變數
- [ ] 沒有循環依賴

---

### Step 3: 安全與規範審查

**執行動作：**
依照 `.aiassistant/rules/core.md` 進行安全審查。

**🔒 安全檢查清單：**
- [ ] 沒有硬編碼的 API 金鑰或敏感資訊
- [ ] 沒有在 Log 中輸出 PII（個人識別資訊）
- [ ] 沒有 SQL/Shell Injection 風險（不串接字串組合指令）
- [ ] 使用環境變數管理配置
- [ ] 沒有導入已停止維護的第三方套件
- [ ] 沒有將敏感檔案加入 Git（檢查 .gitignore）

**📋 開發規範檢查：**
- [ ] 沒有使用 `any` 類型
- [ ] 沒有使用不安全的型別轉換 `as`
- [ ] 沒有使用非空斷言 `!`（除非邏輯上絕對存在）
- [ ] 所有異步操作都有 `await` 或 `.catch()`
- [ ] 使用 Type Guards 或 Schema 驗證（Zod/Valibot）

**🧪 測試規範檢查：**
- [ ] 單元測試不發起真實網絡請求（使用 Mock/Stub）
- [ ] E2E 測試不使用生產環境數據
- [ ] 測試案例具有獨立性（不依賴執行順序）

**執行指令：**
```bash
# 檢查是否有敏感資訊（可選）
git diff main --name-only | xargs grep -i "api[_-]key\|secret\|password" || echo "No sensitive data found"

# 檢查依賴安全性
npm audit

# 修復可修復的安全問題
npm audit fix
```

---

### Step 4: 整合測試與問題修復

**執行動作：**
在本地環境執行完整的應用程式，手動測試核心功能。

```bash
# 啟動開發伺服器
npm run dev

# 在另一個終端機執行 E2E 測試
npm run test:e2e
```

**手動測試檢查項目：**
- [ ] 新功能在 UI 上正常顯示與運作
- [ ] 現有功能沒有被破壞（Regression Test）
- [ ] API 回應格式正確
- [ ] 錯誤處理機制正常運作
- [ ] 載入效能可接受

**常見問題排查：**
1. **整合問題** - 模組之間的介面不匹配
2. **狀態管理問題** - React state 或全域狀態管理錯誤
3. **非同步問題** - Race condition 或未處理的 Promise
4. **環境差異** - 本地與測試環境的配置不同

**修復流程：**
1. 識別問題並記錄
2. 撰寫測試重現問題（如果沒有測試）
3. 修復問題
4. 驗證測試通過
5. 提交修復（commit message 使用 `fix:` type）

---

### Step 5: 文件更新

**執行動作：**
更新相關文件，確保文件與程式碼同步。

**需要更新的文件：**
- [ ] API 文件（如適用）
- [ ] README.md（如有重大功能新增）
- [ ] ADR（如有架構決策）
- [ ] `docs/todos/<feature-name>.md` - 標記所有任務完成

**注意：**
- `CHANGELOG.md` 由 `release-it` 套件自動產生，無需手動更新

**檢查清單：**
- [ ] 相關文件已更新
- [ ] TODO 清單所有任務已標記完成
- [ ] 文件內容清楚且正確

---

### Step 6: 準備 Code Review

**執行動作：**
整理程式碼變更，準備提交 Pull Request。

```bash
# 1. 確認所有變更都已提交
git status

# 2. 檢視與 main 分支的差異
git diff main...HEAD

# 3. 整理 commit history（如需要）
git rebase -i main

# 4. 推送到遠端
git push origin <branch-name>
```

**Self Code Review 檢查清單：**
- [ ] Commit history 清晰且有意義
- [ ] 沒有包含無關的檔案變更
- [ ] 沒有包含 debug 用的 console.log
- [ ] 沒有包含註解掉的程式碼
- [ ] 程式碼可讀性良好
- [ ] 函式與變數命名清楚

**Pre-PR 檢查：**
```bash
# 確保所有測試通過
npm test

# 確保程式碼品質通過
npm run lint
```

---

## 完成條件

- ✅ 所有測試通過（unit/e2e/bdd）
- ✅ 測試覆蓋率達標（≥80%）
- ✅ 程式碼品質檢查通過
- ✅ 安全與規範審查通過
- ✅ 手動測試確認功能正常
- ✅ 文件已更新
- ✅ 準備好進行 Code Review

---

## 下一步

完成 Stabilize Mode 後：
1. **建立 Pull Request** - 提交 PR 進行 Code Review
2. **等待 CI/CD** - 確保 CI pipeline 通過
3. **進入 Deploy Mode** - 準備部署到測試或生產環境

---

## 故障排除

### 測試失敗
```bash
# 執行單一測試檔案進行除錯
npm test -- <file-path> --verbose

# 使用 watch mode 快速迭代
npm test -- --watch
```

### 型別錯誤
```bash
# 顯示詳細的型別錯誤資訊
npx tsc --noEmit --pretty

# 檢查特定檔案
npx tsc --noEmit <file-path>
```

### E2E 測試失敗
```bash
# 使用 headed mode 觀察測試執行
npm run test:e2e -- --headed

# 產生測試報告
npm run test:e2e -- --reporter=html
```

---

## 參考資料

- 專案最高指導原則：`.aiassistant/rules/core.md`
- TODO 清單：`docs/todos/<feature-name>.md`
- 測試標準：專案的測試配置檔案
- CI/CD 流程：`.github/workflows/`
