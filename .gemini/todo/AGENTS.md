## Gemini Added Memories

- User is deciding between Express and NestJS for the backend stack and has asked for a comparison of their pros and cons. (完成 - 決策已記錄於 ADR 0003)
- User chose NestJS for the backend stack. (完成 - 決策已記錄於 ADR 0003)
- User is now asking for a comparison of Monorepo vs. Side-by-side project structures. (完成 - 決策已記錄於 ADR 0002)
- User chose Option A (public API, no authentication) for the API contract. (完成 - Events API 已實作並通過測試)
- User is ready to proceed to the implementation phase. (進行中 - 已完成 Events 模組實作)
- User paused the project restructuring to discuss dependency management. (完成 - NPM Workspaces 已確定)
- User is asking if dependencies can be shared between frontend and backend with the current "modified side-by-side" structure plan. (完成 - NPM Workspaces 已確定)
- User agreed to use NPM Workspaces for dependency management. (完成 - 決策已記錄於 ADR 0002)
- User is asking how to adjust testing strategies (Unit, E2E, BDD) for both frontend and backend in this new Monorepo structure. (完成 - 決策已記錄於 ADR 0004)
- User wants to isolate project-specific instructions. (完成 - 決策已記錄於 ADR 0005)
- User wants to organize these files in separate folders while ensuring the agent can still read them. (完成 - 決策已記錄於 ADR 0005)
- 已新增 ADR 檔案並 Push 到遠端倉庫。(完成)
- 已將 ADR 文件撰寫準則新增至 `project/AGENTS.md`。(完成)
- 已將記憶儲存準則新增至 `project/AGENTS.md`。(完成)
- 已完成 Events API 的後端實作 (`GET`, `POST`)。(完成)
- 已完成 Frontend Event 組件與後端 API 的串接。(完成)
- 已建立並固化 BDD 與 E2E 測試流程，支援數據隔離與並行執行。(完成)
- 已優化開發體驗，新增 `npm run dev` 與修復 IDE 整合配置。(完成)
- 已生成專案 `README.md`。(完成)
- 已根據使用者要求，提交 `README.md`、更新後的 ADRs 與基礎設施檔案。(完成)
- User agreed to use GitHub Actions for CI/CD and a "Protected Feature Branch" Git Flow strategy (Single Main Branch). (完成 - 決策已記錄於 ADR 0009)
- 已更新 ADR 0009 以明確說明採用 "Single Main Branch" 策略。(完成)
- 已確立整體架構：Next.js (GCP Cloud Run) + Custom NestJS (GCP Cloud Run) + Firestore + 自建 CMS 模組 (Firestore-backed) (完成 - 決策已記錄於 ADR 0010)
- 已完成前端遷移：Vite -> Next.js 14 (App Router)，包含所有組件、測試與 E2E 配置。(完成)
- 已完成 Node.js 版本限制與 Dockerfile 更新至 Node 24 (完成)
- 已完成 Terraform Infra 配置更新與測試 (完成)
- 已完成 Next.js Monolith 架構轉換 (移除 backend，更新所有相關文件與配置)。(完成)
- 已完成整合 Neon DB 與 Drizzle ORM 配置 (完成)

## 待辦事項 (下次會從這裡繼續)

- **Terraform 遠端狀態管理 (GCS)**
  - [ ] **使用者行動**: 創建 GCS Bucket 來存放 Terraform State (例如：`gs://<GCP_PROJECT_ID>-tfstate`)。
    - 使用指令 `gcloud storage buckets create gs://<YOUR_PROJECT_ID>-tfstate --location=<YOUR_REGION>`。
  - [ ] **Agent 行動**: 修改 `infra/main.tf`，配置 `backend "gcs" {}`。
  - [ ] **使用者行動**: 執行 `terraform init -migrate-state` 將本地 State 上傳到 GCS。

- **CI/CD Pipeline 完善**
  - [ ] 更新 `.github/workflows/ci.yml`，包含 Next.js 的 Build 與 Lint。
  - [ ] 創建 `.github/workflows/deploy.yml`，實現 Next.js 到 Cloud Run 的自動部署。
  - [ ] 將 `terraform test -chdir=infra` (Terraform Test) 整合到 CI/CD。

- **Blog CMS 模組開發** (參考 ADR 0013)
  - [ ] 設計 Postgres Schema (Blog Post)。
  - [ ] 在 `frontend/src/server/modules/blog` 中，建立 `blog.service.ts` 和 `blog.repository.ts`。
  - [ ] 在 Next.js 前端開發 `/blog` 頁面顯示文章。
  - [ ] 在 Next.js 前端開發 `/admin/blog` 頁面，提供文章編輯功能 (使用 **TipTap**)。

- **售票系統模組開發** (參考 ADR 0012)
  - [ ] 設計 Postgres Schema (Events, Tickets, Orders)。
  - [ ] 在 `frontend/src/server/modules/events` 中，建立 `events.service.ts` 和 `events.repository.ts`。
  - [ ] 實作庫存管理 (Inventory Management) - 使用 SQL Transaction。
  - [ ] 實作訂單狀態機 (Order State Machine)。
  - [ ] 整合第三方支付 (ECPay/Stripe) 流程。
  - [ ] 開發 Next.js 前端頁面，提供選票、結帳功能。

- **CRM 模組開發** (參考 ADR 0011)
  - [ ] 設計 Postgres Schema (Customers)。
  - [ ] 在 `frontend/src/server/modules/crm` 中，建立 `crm.service.ts`。
  - [ ] 實作「購票自動歸戶」邏輯。
  - [ ] 實作 Admin UI 裡的「會員列表」與「標籤管理」。

- **電子報模組 (Optional)**
  - [ ] 設計 Postgres Schema (Newsletters)。
  - [ ] 在 `frontend/src/server/modules/newsletter` 中，建立 `newsletter.service.ts`。
  - [ ] 整合 Email 發送服務 (例如 SendGrid)。

- **修復 BDD 測試基礎設施** (Technical Debt)
  - [x] 診斷 `npm run test:bdd` 在 `hooks.ts` 中無法啟動 Next.js 伺服器的根本原因。
  - [x] 實作可靠的伺服器啟動和等待機制（例如使用 `wait-on` 套件）。
  - [x] 重新啟用 `npm run test:bdd` 腳本。
  - [x] 更新 `.husky/pre-push` 確保 BDD 測試在推送前運行。