---
description: Infrastructure Deployment (Terraform)
---

# Infrastructure Deployment

## Prerequisite: Phase 2 設計已批准

1. Review ADR Documents
   // turbo
   ```bash
   ls docs/adr/
   ```
   確認基礎設施變更符合架構決策。

2. TDD for Infrastructure Changes
   - 如有新的 Terraform 模組，撰寫對應的測試
   - 確保變更不會破壞現有資源
   - 使用 `terraform validate` 驗證語法
   - 使用 `terraform test` 執行單元測試

   // turbo
   ```bash
   cd infra && terraform validate && terraform test
   ```

3. Terraform Plan (Preview Only)
   ```bash
   cd infra && terraform plan
   ```
   
   User, 請審閱 Terraform Plan 輸出：
   - 新增的資源 (綠色 +)
   - 修改的資源 (黃色 ~)
   - 刪除的資源 (紅色 -)
   
   ⚠️ **此步驟不執行 Apply**，Apply 由 CI/CD (`infra-deploy.yml`) 處理。

4. Review Gate
   **您必須明確說「Infra Plan 批准」才能進行 Commit。**

5. Commit & Push
   ```bash
   git add infra/
   git commit -m "infra: [describe changes]"
   git push
   ```
   
   CI/CD 將自動執行：
   - `terraform plan` (PR 階段)
   - `terraform apply` (Merge 後)

6. Complete
   User, 🎉 Infra 變更已推送！
   請至 GitHub Actions 確認 `infra-deploy.yml` 執行結果。