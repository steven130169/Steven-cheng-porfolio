---
description: Start Mode A - Stabilization (Lock behavior with tests)
---

1. Context Loading
   User, I am entering **Mode A (Stabilization)**.
   I will read the `README.md` and relevant ADRs to understand the architecture.
   Please provide the POC code or point me to the file you want to stabilize.

2. Static Analysis & Dependencies
   I will scan the code to identify external dependencies (DB, AWS, APIs) that need mocking.

3. Generate Characterization Tests
   // turbo
   ```bash
   # Create a test file if not exists (placeholder)
   echo "Creating test skeleton..."
   ```
   I will now generate `.spec.ts` files using Vitest/Jest.
   **Goal**: All Green. Lock current behavior. No refactoring.

4. User Notification
   User, "Safety Net" is being established. I will not change logic until tests pass.
