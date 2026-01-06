---
apply: on-demand
name: repo-review
description: "提供系統化的專案全面檢視流程，協助識別程式碼品質、安全性、測試覆蓋率及文件完整性等方面的改進空間，確保專案符合最佳實踐與規範標準。"
trigger: "當使用者說「檢視 repo」、「檢查專案」、「audit」、「review codebase」或需要全面檢查專案狀態時"
---

# Repo Review - 專案全面檢視

## 目的
系統化地檢視整個專案，識別需要修改、調整或改善的地方，確保專案符合最佳實踐與規範標準。

---

## 前置條件

1. ✅ 本地代碼是最新的（已執行 `git pull`）
2. ✅ 沒有未提交的變更（或已儲存變更）
3. ✅ 已了解專案的核心規範（`.aiassistant/rules/core.md`）

---

## 檢視流程

```
1. 專案結構檢視
   ↓
2. 程式碼品質檢查
   ↓
3. 測試覆蓋率分析
   ↓
4. 安全性掃描
   ↓
5. 文件完整性檢查
   ↓
6. 依賴項審查
   ↓
7. 生成檢視報告
```

---

## 執行步驟

### Step 1: 專案結構檢視

**執行動作：**
檢查專案結構是否合理、一致，並符合架構設計。

#### 1.1 檔案組織檢查

**檢查項目：**
```bash
# 檢查目錄結構
tree -L 3 -I 'node_modules|dist|.next|coverage'

# 檢查是否有不應該存在的檔案
find . -name "*.log" -o -name "*.tmp" -o -name ".DS_Store"

# 檢查是否有未被 .gitignore 的檔案
git status --ignored
```

**檢查清單：**
- [ ] 目錄結構清晰且有邏輯分層
- [ ] 沒有孤立的檔案（未被使用的檔案）
- [ ] 命名規範一致（kebab-case/camelCase/PascalCase）
- [ ] 沒有臨時檔案或系統檔案（`.DS_Store`, `*.log`, `*.tmp`）
- [ ] `.gitignore` 正確配置

**常見問題：**
- 測試檔案與源碼檔案混在一起
- 配置檔案散落在不同位置
- 未使用的舊檔案未刪除
- 檔案命名不一致

---

#### 1.2 模組依賴關係檢查

**檢查項目：**
```bash
# 使用工具檢查循環依賴（需安裝 madge）
npx madge --circular --extensions ts,tsx ./src

# 檢查 import 路徑是否合理
grep -r "import.*\.\./\.\./\.\." src/
```

**檢查清單：**
- [ ] 沒有循環依賴
- [ ] Import 路徑不超過 3 層 `../../..`
- [ ] 使用 path alias（如 `@/` 取代相對路徑）
- [ ] 模組之間的依賴方向正確（高層依賴低層）

**常見問題：**
- 循環依賴導致難以維護
- 過深的相對路徑 `../../../../utils/`
- 跨層級的不當依賴

---

### Step 2: 程式碼品質檢查

**執行動作：**
執行靜態分析工具，檢查程式碼品質問題。

#### 2.1 TypeScript 類型檢查

```bash
# 執行 TypeScript 編譯檢查
npm run type-check
# 或
npx tsc --noEmit --pretty

# 檢查是否有 any 類型
grep -r ":\s*any" src/ --include="*.ts" --include="*.tsx"

# 檢查是否有不安全的型別轉換
grep -r "\sas\s" src/ --include="*.ts" --include="*.tsx"

# 檢查是否有非空斷言
grep -r "!" src/ --include="*.ts" --include="*.tsx" | grep -v "!=="
```

**檢查清單：**
- [ ] 沒有 TypeScript 編譯錯誤
- [ ] 沒有使用 `any` 類型
- [ ] 最小化使用 `as` 型別轉換
- [ ] 非空斷言 `!` 使用合理
- [ ] 使用嚴格模式（`strict: true`）

---

#### 2.2 ESLint 檢查

```bash
# 執行 ESLint
npm run lint

# 查看具體的錯誤數量與類型
npm run lint -- --format json > lint-report.json

# 檢查是否有被忽略的規則
grep -r "eslint-disable" src/
```

**檢查清單：**
- [ ] 沒有 ESLint 錯誤
- [ ] ESLint 警告數量在可接受範圍（<10）
- [ ] 沒有濫用 `eslint-disable` 註解
- [ ] ESLint 規則配置合理

**常見問題：**
- 大量使用 `// eslint-disable-next-line`
- 未修復的 ESLint 錯誤累積
- ESLint 規則過於寬鬆

---

#### 2.3 程式碼複雜度檢查

**檢查項目：**
```bash
# 使用工具檢查程式碼複雜度（可選）
# 需要安裝 complexity-report 或類似工具

# 手動檢查超長函式
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20

# 檢查超長檔案
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | sort -rn | head -10
```

**檢查清單：**
- [ ] 單一函式不超過 50 行（建議）
- [ ] 單一檔案不超過 300 行（建議）
- [ ] 沒有過深的巢狀結構（建議 <4 層）
- [ ] 函式參數不超過 5 個

**常見問題：**
- 函式過長，難以理解與測試
- 檔案過大，職責不清
- 巢狀過深的 if/else 或 callback

---

### Step 3: 測試覆蓋率分析

**執行動作：**
分析測試覆蓋率，識別未測試的程式碼區域。

```bash
# 執行測試覆蓋率分析
npm test -- --coverage

# 生成 HTML 報告
npm test -- --coverage --coverageReporters=html

# 檢查特定目錄的覆蓋率
npm test -- --coverage --collectCoverageFrom="src/services/**/*.ts"
```

**檢查清單：**
- [ ] 整體測試覆蓋率 ≥ 80%
- [ ] 核心業務邏輯覆蓋率 ≥ 90%
- [ ] 所有 API endpoints 有測試
- [ ] 關鍵使用者流程有 E2E 測試
- [ ] 測試案例描述清楚（describe/it 語意明確）

**分析項目：**
- **Statements Coverage** - 語句覆蓋率
- **Branches Coverage** - 分支覆蓋率
- **Functions Coverage** - 函式覆蓋率
- **Lines Coverage** - 行覆蓋率

**需要補充測試的區域：**
- 覆蓋率 < 80% 的檔案
- 錯誤處理邏輯（error handling）
- 邊界條件（edge cases）
- 異常情境（異步失敗、網路錯誤等）

---

### Step 4: 安全性掃描

**執行動作：**
掃描已知的安全漏洞與不安全的程式碼模式。

#### 4.1 依賴項漏洞掃描

```bash
# npm audit（檢查依賴項漏洞）
npm audit

# 查看詳細報告
npm audit --json

# 自動修復可修復的漏洞
npm audit fix

# 強制修復（可能導致 breaking changes）
npm audit fix --force
```

**檢查清單：**
- [ ] 沒有 High/Critical 級別的漏洞
- [ ] 依賴項都是最新的穩定版本
- [ ] 沒有使用已棄用的套件

---

#### 4.2 敏感資訊檢查

```bash
# 檢查是否有硬編碼的 API Key
grep -rE "(api[_-]?key|apikey|api[_-]?secret)" src/ --include="*.ts" --include="*.tsx"

# 檢查是否有硬編碼的密碼
grep -rE "(password|passwd|pwd)\s*=\s*['\"]" src/ --include="*.ts" --include="*.tsx"

# 檢查是否有 token 或 secret
grep -rE "(token|secret|credential)\s*=\s*['\"]" src/ --include="*.ts" --include="*.tsx"

# 檢查 .env 是否被正確忽略
git ls-files | grep -E "\.env$|\.env\."
```

**檢查清單：**
- [ ] 沒有硬編碼的 API Key 或 Secret
- [ ] `.env` 檔案已被 `.gitignore`
- [ ] 沒有在 Log 中輸出敏感資訊
- [ ] 環境變數使用正確（`process.env.*`）

**常見問題：**
- API Key 硬編碼在程式碼中
- `.env` 檔案被提交到 Git
- 密碼或 token 出現在日誌中

---

#### 4.3 不安全的程式碼模式檢查

```bash
# 檢查是否有 eval 或 Function 建構子（Code Injection 風險）
grep -r "eval(" src/
grep -r "new Function(" src/

# 檢查是否有不安全的 innerHTML（XSS 風險）
grep -r "innerHTML" src/

# 檢查是否有字串串接的 SQL 查詢（SQL Injection 風險）
grep -rE "SELECT.*\+.*FROM" src/
grep -rE "INSERT.*\+.*INTO" src/
```

**檢查清單：**
- [ ] 沒有使用 `eval()` 或 `new Function()`
- [ ] 沒有不安全的 `innerHTML`（使用 `textContent` 或框架的安全方法）
- [ ] 沒有字串串接組成的 SQL 查詢（使用 ORM 或 Prepared Statements）
- [ ] 沒有字串串接組成的 Shell 指令

---

### Step 5: 文件完整性檢查

**執行動作：**
檢查專案文件是否完整、準確、最新。

#### 5.1 必要文件檢查

**檢查清單：**
- [ ] `README.md` 存在且內容完整
- [ ] `README.md` 包含專案說明、安裝步驟、使用方式
- [ ] `CHANGELOG.md` 或 release notes 存在（如適用）
- [ ] `docs/` 目錄結構清晰
- [ ] API 文件完整（如有 API）
- [ ] 架構決策記錄（ADR）完整（`docs/adrs/`）

---

#### 5.2 程式碼註解檢查

```bash
# 檢查是否有 TODO 註解未處理
grep -rn "TODO" src/

# 檢查是否有 FIXME 註解未處理
grep -rn "FIXME" src/

# 檢查是否有註解掉的程式碼
grep -rE "^\s*//.*;" src/ | head -20
```

**檢查清單：**
- [ ] TODO/FIXME 註解都有對應的 Issue
- [ ] 沒有大量被註解掉的程式碼（應該刪除）
- [ ] 複雜邏輯有清楚的註解說明
- [ ] 公開 API 有 JSDoc 註解

**常見問題：**
- 大量過期的 TODO 註解
- 被註解掉的舊程式碼未刪除
- 缺少必要的註解說明

---

### Step 6: 依賴項審查

**執行動作：**
審查專案依賴項是否合理、必要、最新。

```bash
# 查看所有依賴項
npm list --depth=0

# 檢查是否有未使用的依賴
npx depcheck

# 檢查套件的更新狀態
npm outdated

# 查看套件大小（可選）
npx npm-bundle-size <package-name>
```

**檢查清單：**
- [ ] 沒有未使用的依賴項
- [ ] 依賴項版本合理（不要過舊或過新的 beta 版）
- [ ] `dependencies` 和 `devDependencies` 分類正確
- [ ] 沒有重複的依賴項（相同功能的不同套件）
- [ ] 核心依賴項有考慮 bundle size

**常見問題：**
- 安裝了但從未使用的套件
- 套件版本過舊，缺少安全更新
- 多個套件做相同的事情（如 moment + date-fns）
- 開發依賴誤放在生產依賴中

---

### Step 7: 生成檢視報告

**執行動作：**
彙整所有檢查結果，生成一份完整的檢視報告。

**報告格式範本：**
```markdown
# Repo Review Report

**檢視日期：** YYYY-MM-DD
**檢視範圍：** 整個專案
**檢視者：** [Your Name / AI Assistant]

---

## 📊 總體評估

- **專案結構：** ✅ 良好 / ⚠️ 需改善 / ❌ 有問題
- **程式碼品質：** ✅ 良好 / ⚠️ 需改善 / ❌ 有問題
- **測試覆蓋率：** XX%（目標：≥80%）
- **安全性：** ✅ 良好 / ⚠️ 需改善 / ❌ 有問題
- **文件完整性：** ✅ 良好 / ⚠️ 需改善 / ❌ 有問題
- **依賴項狀態：** ✅ 良好 / ⚠️ 需改善 / ❌ 有問題

---

## 🔍 詳細發現

### 1. 專案結構
**問題：**
- [ ] 問題 1 描述
- [ ] 問題 2 描述

**建議：**
- [ ] 建議 1
- [ ] 建議 2

---

### 2. 程式碼品質
**問題：**
- [ ] TypeScript 錯誤：X 個
- [ ] ESLint 錯誤：X 個
- [ ] 超長函式：X 個

**建議：**
- [ ] 修復 TypeScript 錯誤
- [ ] 重構超長函式

---

### 3. 測試覆蓋率
**當前覆蓋率：** XX%

**未覆蓋的區域：**
- [ ] `src/services/xxx.ts` - XX% 覆蓋率
- [ ] `src/utils/xxx.ts` - XX% 覆蓋率

**建議：**
- [ ] 補充單元測試
- [ ] 增加 E2E 測試

---

### 4. 安全性
**漏洞數量：**
- High: X
- Medium: X
- Low: X

**問題：**
- [ ] 依賴項漏洞
- [ ] 敏感資訊洩漏風險

**建議：**
- [ ] 執行 `npm audit fix`
- [ ] 檢查敏感資訊處理

---

### 5. 文件完整性
**缺失的文件：**
- [ ] 文件 1
- [ ] 文件 2

**建議：**
- [ ] 補充缺失的文件
- [ ] 更新過期的文件

---

### 6. 依賴項審查
**未使用的依賴：**
- [ ] package-1
- [ ] package-2

**過時的依賴：**
- [ ] package-3 (current: v1.0.0, latest: v2.0.0)

**建議：**
- [ ] 移除未使用的依賴
- [ ] 更新過時的依賴

---

## 🎯 優先處理項目（按優先順序）

1. **P0 (Critical - 必須立即處理):**
   - [ ] 修復 High/Critical 安全漏洞
   - [ ] 修復導致功能失效的錯誤

2. **P1 (High - 本週內處理):**
   - [ ] 修復 TypeScript/ESLint 錯誤
   - [ ] 補充核心功能的測試

3. **P2 (Medium - 兩週內處理):**
   - [ ] 重構複雜的程式碼
   - [ ] 補充文件

4. **P3 (Low - 有時間處理):**
   - [ ] 優化程式碼風格
   - [ ] 更新非關鍵依賴項

---

## ✅ 後續行動計畫

- [ ] 建立 Issues 追蹤問題
- [ ] 分配處理責任
- [ ] 設定完成期限
- [ ] 定期回顧進度

---

## 📚 參考資料

- 專案規範：`.aiassistant/rules/core.md`
- 測試標準：專案測試配置
- 安全標準：專案安全政策
```

**報告儲存位置：**
```bash
# 建立報告目錄（如不存在）
mkdir -p docs/reviews

# 儲存報告
docs/reviews/repo-review-YYYY-MM-DD.md
```

---

## 完成條件

- ✅ 所有 7 個步驟已完成
- ✅ 檢視報告已生成
- ✅ 問題清單已整理
- ✅ 優先順序已排序
- ✅ 後續行動計畫已制定

---

## 常見發現與解決方案

### 發現 1: 循環依賴
**解決方案：**
- 使用依賴注入（Dependency Injection）
- 提取共用邏輯到獨立模組
- 重新設計模組邊界

---

### 發現 2: 測試覆蓋率不足
**解決方案：**
- 優先補充核心業務邏輯測試
- 使用測試覆蓋率報告識別未測試區域
- 設定 CI 要求最低覆蓋率閾值

---

### 發現 3: 依賴項漏洞
**解決方案：**
```bash
# 自動修復
npm audit fix

# 手動更新特定套件
npm update <package-name>

# 如無法自動修復，查看替代方案
npm audit
```

---

### 發現 4: 程式碼風格不一致
**解決方案：**
- 配置 ESLint 與 Prettier
- 執行自動格式化
- 在 CI 中強制檢查

---

### 發現 5: 文件過期
**解決方案：**
- 建立文件維護流程
- 在 PR 中要求更新相關文件
- 定期審查文件準確性

---

## 最佳實踐

### ✅ 定期檢視

- **每週：** 快速檢查（測試、Lint、安全掃描）
- **每月：** 完整檢視（包含依賴項、文件）
- **每季：** 深度審查（包含架構、效能）

---

### ✅ 自動化檢查

將檢查整合到 CI/CD 流程：
```yaml
# .github/workflows/quality-check.yml
name: Quality Check
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm audit
```

---

### ✅ 持續改善

- 追蹤改善進度
- 設定可量化的目標（如覆蓋率、錯誤數量）
- 定期回顧與調整標準

---

## 參考資料

- 專案最高指導原則：`.aiassistant/rules/core.md`
- 測試標準：專案測試配置
- 程式碼風格：`.eslintrc.js`, `.prettierrc`
- 安全政策：專案安全文件（如有）
- CI/CD 配置：`.github/workflows/`
