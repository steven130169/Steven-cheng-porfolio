---
description: Waterfall Phase 5 - Deployment (部署交付)
---

# Phase 5: Deployment

## Prerequisite: Phase 4 測試已全部通過

1. Pre-deployment Checklist
   - [ ] All tests pass
   - [ ] Code reviewed
   - [ ] Documentation updated
   - [ ] CHANGELOG updated

2. Build Production
   // turbo
   ```bash
   npm run build
   ```

3. Deploy
   User, 準備部署到哪個環境？
   - Staging (測試環境)
   - Production (正式環境)

4. Post-deployment Verification
   確認部署成功：
   - 健康檢查 (Health Check)
   - 冒煙測試 (Smoke Test)

5. Release Complete
   User, 🎉 **發布完成！**
   - 更新 CHANGELOG
   - 標記 Git Tag
   - 通知相關人員
