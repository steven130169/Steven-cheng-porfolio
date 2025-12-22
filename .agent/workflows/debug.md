---
description: Debugging Protocol (Reproduction -> Fix -> Verify)
---

# Debugging Protocol

1. Context Gathering
   User, 請貼上錯誤訊息 (Error Logs) 或描述 Bug 的行為。
   
   I will analyze:
   - Error Stack Trace
   - Recent Changes (git diff)
   - Relevant Code files

2. Reproduction (Create Safety Net)
   **Rule**: 絕對禁止盲目修復 (Blind Fix)。
   
   I will attempt to reproduce the issue:
   - 找出現有的失敗測試
   - 或 撰寫一個新的測試案例 (Reproduction Script) 來重現該 Bug

   // turbo
   ```bash
   npm run test
   ```

3. Root Cause Analysis
   I will analyze *why* it failed.
   - Check logic
   - Check dependencies
   - Check environment

4. Apply Fix
   I will apply the fix to the code.

5. Verification
   // turbo
   ```bash
   npm run test
   ```
   **Gate**: 必須從 Red (Fail) 變為 Green (Pass)。
   
   If still failing, return to Step 3.

6. Regression Check
   確保沒有破壞其他功能。
   // turbo
   ```bash
   npm run test:e2e
   ```

7. Closure
   User, Bug 已修復。
   - 根本原因：(解釋原因)
   - 修復方式：(解釋解法)
