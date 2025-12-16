---
description: Waterfall Phase 2 - System Design (系統設計)
---

# Phase 2: System Design

## Prerequisite: Phase 1 需求分析已完成並批准

1. Review Requirements
   // turbo
   ```bash
   cat specs/requirements.md
   ```

2. Review Existing ADRs
   // turbo
   ```bash
   ls docs/adr/
   ```
   **ADR 守則**：
   - 🔍 **查閱**：設計前必須先了解過去的決策。
   - 🛡️ **不刪除**：絕對禁止刪除或覆寫舊的 ADR 檔案。
   - 🔗 **連結**：若要推翻舊決策（例如 MySQL -> PostgreSQL），必須建立**新 ADR**，並在文中 Reference 舊 ADR（例如 "Supersedes: ADR-0001"）。

3. Create Design Document / New ADR
   I will create an ADR or design document based on requirements.
   
   If creating a new ADR:
   ```bash
   # 複製 Template (如果不使用 Template 則直接建立)
   cp docs/adr/TEMPLATE.md docs/adr/xxxx-new-decision.md
   ```
   **內容包含**：
   - Architecture overview
   - Data model / Schema
   - API contracts
   - Component breakdown
   - **References** (如果有推翻舊決策)

4. Complete Gherkin Scenarios (Given/When/Then)
   I will add detailed steps to `.feature` files:
   
   ```gherkin
   Scenario: Create a new blog post
     Given I am logged in as admin
     When I fill in the title "My First Post"
     ...
   ```

5. Review Gate
   User, 請審閱：
   - 設計文件 / 新增的 ADR
   - `e2e/features/*.feature` (完整 Given/When/Then)
   
   **您必須明確說「設計批准」才能進入 Phase 3 (實作)。**
   ⚠️ 進入下一階段後，設計將被凍結。