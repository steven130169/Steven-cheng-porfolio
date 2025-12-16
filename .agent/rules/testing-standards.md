---
trigger: model_decision
glob: "**/*.test.ts,**/*.spec.ts,**/*.feature"
description: Testing Standards (Unit, Integration, E2E)
---

# Testing Standards & Patterns

## 1. 單元測試 (Unit Testing) - Vitest

* **原則**: 一個 `it` 只驗證一個行為，描述需清晰
* **AAA 模式**:
    ```typescript
    it('應該正確套用百分比折扣', () => {
      // Arrange
      const input = { price: 100, discount: 0.2 };
      // Act
      const result = calculateTotal(input);
      // Assert
      expect(result).toBe(80);
    });
    ```
* **邊界測試**: 必須覆蓋 null, undefined, 0, 負數, 超大數值

---

## 2. 整合測試 (Integration) - React Testing Library

* **核心原則**: Test Behavior, Not Implementation
* **查詢優先級**:
    1. ✅ `getByRole` (最優先)
    2. ✅ `getByLabelText` (表單)
    3. ✅ `getByText` (文字)
    4. ⚠️ `getByTestId` (最後手段)
* **非同步**: 使用 `waitFor` 或 `findBy*`，禁止 sleep

---

## 3. E2E 測試 - Playwright

* **配置**: `fullyParallel: true`
* **資料隔離**: 每個測試必須獨立
* **等待機制**:
    * ❌ 禁止: `waitForTimeout(3000)`
    * ✅ 必須: `waitForSelector()` 或 `toBeVisible()`

---

## 4. 測試權責劃分 (參閱 ADR 0006)

* **BDD (.feature)**: 業務驗收、User Story
* **Playwright (.spec.ts)**: 工程健康、Smoke Test
* **Rule**: 避免重複。BDD 已測的路徑不需再測
