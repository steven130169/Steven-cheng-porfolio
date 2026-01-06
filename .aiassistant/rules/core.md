---
apply: always
---

# Core Rules

## 0. Meta-Rules & Conflict Resolution

1. **Supreme Law**: 本檔案 (`core.md`) 是專案的最高指導原則 (Constitution)。
2. **Conflict Resolution**: 若任何步驟指示與本檔案發生衝突，**一律以本檔案的規則為準**。

---

## 1. 絕對邊界 (Boundaries)

### 🔒 安全

* **Never** 在 Git repo 中提交任何真實的金鑰、.env 檔案或敏感憑證
* **Never** 在 Log 中輸出使用者的私人敏感資料
* **Never** 串接字串來組合 SQL 或 Shell 指令，防止 Injection Attack
* **Never** 在 Log 或 Error Message 中包含使用者的 PII (個人識別資訊)，例如 Email、電話或身分證字號
* **Never** 導入已停止維護的第三套件
* **Never** 在客戶端 (Frontend) 存放 API 金鑰，若必須存放，需確認該金鑰已在 GCP 端設定嚴格的 API Restrictions (如 Domain
  限制)。

### 開發規範

* **Never** 使用 `any` 類型來繞過 TypeScript 錯誤。
* **Never** 允許循環依賴或忽略 ESLint 的錯誤警告。
* **Never** 使用非空斷言 (!)，除非能證明該值在邏輯上絕對存在，否則應使用 Optional Chaining (?.) 或明確的錯誤處理。
* **Never** 在異步函式中忽略 await 或未處理 Promise.catch()，避免產生懸掛的非同步操作 (Dangling Promises)。
* **Never** 使用 as (Type Assertion) 進行不安全的型別轉換，優先使用 Type Guards 或 Zod/Valibot 等 Schema 驗證。

### GCP 雲端架構

* **Never** 將服務帳戶金鑰 (Service Account Key JSON) 儲存在程式碼庫或 Docker 鏡像中。
* **Never** 使用 Owner 或 Editor 等過大權限的角色給服務帳戶，必須遵循 最低權限原則 (PoLP)。
* **Never** 將 Cloud Storage Bucket 權限設置為 allUsers 或 allAuthenticatedUsers (公開存取)，除非該 Bucket 是專門的靜態資源池。
* **Never** 硬編碼 GCP Project ID 或區域資訊；所有基礎設施關聯資訊應由環境變數注入。

### 🧪 測試品質

* **Never** 在單元測試中發起真實的網絡請求。
* **Never** 在 Integration Test 中測試 React 的內部 state。
* **Never** 刪除失敗的測試來讓 pre-commit 通過。
* **Never** 在 E2E 測試中使用真實的生產環境數據。

### ⚠️ 破壞性操作

* **Never** 在未經人工確認下執行 `drop table`、`rm -rf` 或資料庫清除腳本。
* **Never** 擅自修改 `.gitignore` 等環境保護檔案。

### DevOps流程（CI&CD Automation

* **Never** 在生產環境中使用 :latest 標籤的容器鏡像；必須使用具備可追溯性的版本號 (Tag) 或 SHA 雜湊。
* **Never** 繞過 CI 檢查直接合併代碼至 main 或 master 分支。
* **Never** 進行 "ClickOps"（手動在 GCP Console 修改設定）；所有生產環境的變動必須透過 IaC (Terraform/Config Connector) 執行。
* **Never** 在自動化腳本中使用含有敏感資訊的 echo 或 print 指令，避免金鑰出現在 CI/CD 的執行日誌 (Logs) 中。

### Git commit 規範 
* **Must** 按照 @commitlint/config-conventional
```text
type-enum
condition: type is found in value

rule: always

level: error

value

[
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test'
];
echo "foo: some message" # fails
echo "fix: some message" # passes
type-case
description: type is in case value
rule: always
level: error
value
'lowerCase'
echo "FIX: some message" # fails
echo "fix: some message" # passes
type-empty
condition: type is empty
rule: never
level: error
echo ": some message" # fails
echo "fix: some message" # passes
subject-case
condition: subject is in one of the cases ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
rule: never
level: error
echo "fix(SCOPE): Some message" # fails
echo "fix(SCOPE): Some Message" # fails
echo "fix(SCOPE): SomeMessage" # fails
echo "fix(SCOPE): SOMEMESSAGE" # fails
echo "fix(scope): some message" # passes
echo "fix(scope): some Message" # passes
subject-empty
condition: subject is empty
rule: never
level: error
echo "fix:" # fails
echo "fix: some message" # passes
subject-full-stop
condition: subject ends with value
rule: never
level: error
value
'.'
echo "fix: some message." # fails
echo "fix: some message" # passes
header-max-length
condition: header has value or less characters
rule: always
level: error
value
100
echo "fix: some message that is way too long and breaks the line max-length by several characters" # fails
echo "fix: some message" # passes
footer-leading-blank
condition: footer should have a leading blank line
rule: always
level: warning
echo "fix: some message
BREAKING CHANGE: It will be significant" # warning

echo "fix: some message

BREAKING CHANGE: It will be significant" # passes
footer-max-line-length
condition: footer each line has value or less characters
rule: always
level: error
value
100
echo "fix: some message

BREAKING CHANGE: footer with multiple lines
has a message that is way too long and will break the line rule 'line-max-length' by several characters" # fails

echo "fix: some message

BREAKING CHANGE: footer with multiple lines
but still no line is too long" # passes
body-leading-blank
condition: body should have a leading blank line
rule: always
level: warning
echo "fix: some message
body" # warning

echo "fix: some message

body" # passes
body-max-line-length
condition: body each line has value or less characters
rule: always
level: error
value
100
echo "fix: some message

body with multiple lines
has a message that is way too long and will break the line rule 'line-max-length' by several characters" # fails

echo "fix: some message

body with multiple lines
but still no line is too long" # passes
```

