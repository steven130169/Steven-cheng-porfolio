---
name: system-design
description: Waterfall Phase 2 - System Design (系統設計)
---

# Phase 2: System Design

## Prerequisite: Phase 1 需求分析已完成並批准

1. Review Requirements
   // turbo
   ```bash
   # 找到本專案的需求規格檔（依 repo 而定）
   # 例：docs/specs/*requirements*.md 或 docs/specs/*.md
   ls docs/specs/ || true

   # 或用關鍵字搜尋（例如 ticketing/requirements）
   rg -n "requirements|user stories|acceptance criteria" docs || true

   # 最後再開啟/檢視你要當作 Phase 2 基準的需求文件
   # cat <REQUIREMENTS_SPEC_PATH>
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
   # 複製 Template 
   cp docs/adr/TEMPLATE.md docs/adr/xxxx-new-decision.md
   ```
   **內容包含**：
   - Architecture overview
   - Data model / Schema
   - API contracts
   - Component breakdown
   - **References** (如果有推翻舊決策)

5. Review Gate
   User, 請審閱：
   - 設計文件 / 新增的 ADR

   **您必須明確說「設計批准」才能進入 Phase 3 (實作)。**
   ⚠️ 進入下一階段後，設計將被凍結。
