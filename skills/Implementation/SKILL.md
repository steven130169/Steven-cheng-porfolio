---
description: Implementation (實作)
---

# Implementation
## 
1. Review Requirements and get user stories
   ```bash
   ls docs/requirements/
   ```
2. create and update gherkin files
   ```bash
   ls e2e/specs/
   ```

3. Implementation Rules
   **嚴格禁止**：
   - ❌ 修改需求文件
   - ❌ 修改設計文件
   - ❌ 新增設計外的功能
   
   **必須遵守**：
   - ✅ 按照設計文件實作
   - ✅ 遵循 TDD (先寫測試)
   - ✅ 每個功能都要有對應的測試

4. Implement BDD Step Definitions
   為 `.feature` 檔案建立可執行的 Step Definitions：
   ```bash
   ls e2e/features/*.feature
   ```
   
   建立對應的 step 檔案：
   ```typescript
   // e2e/steps/blog.steps.ts
   import { Given, When, Then } from '@cucumber/cucumber';
   
   Given('I am logged in as admin', async () => {
     // Implementation
   });
   
   When('I fill in the title {string}', async (title: string) => {
     // Implementation
   });
   ```

5. Implement Business Logic
   按照設計文件實作核心功能代碼。

6. Unit Tests
   // turbo
   ```bash
   npm run test
   ```

7. Review Gate
   User, 實作階段完成。
   - [ ] BDD Step Definitions 已建立
   - [ ] 業務邏輯已實作
   - [ ] 單元測試通過
   
   **您必須明確說「實作完成」才能進入 Phase 4 (測試)。**
