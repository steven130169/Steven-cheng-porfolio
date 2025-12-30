---
name: Requirements Analysis Strategic Level
---
1. Create Requirements Document
   ```bash
   mkdir -p docs/requirements
   touch docs/requirements/vision.md
   ```
2. Document Product Vision
   I will create/update `docs/requirements/vision.md` with my answers to the following questions:
   - What problem does this product solve?
   - Why should we build this product?
   - What are the key features of this product?

---
name: Requirements Analysis Tactical Level
---
1. Read product vision
   I will read `docs/requirements/vision.md` to understand the problem that this product solves.
2. Create Epic Backlog
   3. I will 
      ```bash
      ls docs/requirements/
      touch docs/requirements/PRODUCT_VISION.md
      ```
      I will create a list of requirements in `docs/specs/requirements.md` with the following format:
      ```markdown
      - [ ] As a [persona],
2. Create Product Backlog
   I will create a list of requirements in `docs/specs/requirements.md` with the following format:
   ```markdown
   - [ ] As a [persona], I [want to], [so that] 

4. Create Gherkin Feature Files (框架)
   ```bash
   mkdir -p e2e/features
   ```
   I will create `.feature` files with:
   - Feature description (As a... I want... So that...)
   - Scenario titles only (不含 Given/When/Then 細節)
   
   範例：
   ```gherkin
   Feature: Blog CMS
     As a blogger
     I want to create posts
     
     Scenario: Create a new blog post
     Scenario: Publish a draft post
   ```

5. Review Gate
   User, 請審閱：
   - `docs/specs/requirements.md`
   - `e2e/features/*.feature` (Scenario 標題)
   
   **您必須明確說「需求批准」才能進入 Phase 2 (系統設計)。**
   ⚠️ 進入下一階段後，需求將被凍結。
