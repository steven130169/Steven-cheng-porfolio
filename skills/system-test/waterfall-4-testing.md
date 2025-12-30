---
description: Waterfall Phase 4 - Testing (測試驗收)
---

# Phase 4: Testing

## Prerequisite: Phase 3 實作已完成

1. Run All Tests
   // turbo
   ```bash
   npm run test
   ```

2. Run E2E Tests
   // turbo
   ```bash
   npm run test:e2e
   ```

3. Verify Coverage
   確認所有需求都有對應的測試覆蓋。

4. Bug Fixing
   如果測試失敗：
   - 回到 Phase 3 修復 Bug
   - **不可修改需求或設計**

5. Review Gate
   User, 所有測試通過。
   **您必須明確說「測試通過」才能進入 Phase 5 (部署)。**
