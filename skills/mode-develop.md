---
---
description: Start Mode B - Development (TDD: Red-Green-Refactor)
---

1. Context & Architecture Check
   User, I am entering **Mode B (Development)**.
   Checking `docs/adr` for relevant architectural decisions...

2. BDD Specification (Phase 1)
   User, please describe the feature. I will convert it into a Gherkin `.feature` file.
   *Wait for user input...*

3. Test Strategy Selection (Phase 2)
   I will select the appropriate test level (Unit vs Integration vs E2E).

4. TDD Loop (Phase 3)
   1. **RED**: Write failing test.
   2. **GREEN**: Write minimal code.
   3. **REFACTOR**: Clean up.
   
   I will run the tests frequently:
   // turbo
   ```bash
   npm run test
   ```
