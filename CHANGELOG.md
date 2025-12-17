# Changelog

## [0.2.2](///compare/v0.2.1...v0.2.2) (2025-12-16)

### Bug Fixes

* **ci:** remove release loop check to rely on skip-ci or idempotent release 9fbafac

## [0.2.1](///compare/v0.2.0...v0.2.1) (2025-12-16)

## [0.2.0](///compare/v0.1.4...v0.2.0) (2025-12-11)

### Features

* **ci:** implement chained release pipeline with separate infra and app workflows ed655fe
* **infra:** split CI/CD service accounts and pipelines 56fe2d2

### Bug Fixes

* **ci:** restrict app-deploy trigger to push events only dbae215

## [0.1.4](///compare/v0.1.3...v0.1.4) (2025-12-10)

### Bug Fixes

* **infra:** format main.tf to pass linting 0f93280

## [0.1.3](///compare/v0.1.2...v0.1.3) (2025-12-09)

### Bug Fixes

* **ci:** setup docker buildx for caching support 87eb589

## [0.1.2](///compare/v0.1.1...v0.1.2) (2025-12-09)

### Bug Fixes

* **ci:** explicitly trigger deploy workflow after release 14c4993
* **ci:** remove pull_request trigger to avoid duplicate runs ada4151

## [0.1.1](///compare/v0.1.0...v0.1.1) (2025-12-09)

### Bug Fixes

* **ci:** enable manual trigger for deploy workflow 5da8fbb

## 0.1.0 (2025-12-09)

### Features

* Add ESLint configuration and Playwright test setup 10912f5
* add test for 'View All Events' button conditional rendering 0367d09
* **ci:** setup automated release workflow with release-it c4a230a
* **frontend:** migrate from Vite to Next.js 14 3c89db8
* **frontend:** migrate from Vite to Next.js 14 e9c6937
* Implement Event Management System with BDD workflow dfacb9b
* implement events api with bdd and unit tests 269b514
* Implement image transition animation on Hero component e78eda2
* Implement Mode A stabilization with Vitest component tests 241f634
* **infra:** configure Cloud Run for Next.js frontend and refactor backend service a419be5
* **infra:** configure Cloud Run for Next.js frontend, refactor backend, and add Terraform tests 815f5f2
* **infra:** setup GCS backend for Terraform state 70ecb7e
* initialize backend workspace and optimize monorepo dependencies ba815dc
* Initialize portfolio project with Vite and React 132dfbb
* Integrate Cucumber.js for BDD test execution and ensure all tests pass a81efac
* integrate frontend event management with backend api 3751d9f
* Limit event display to 3 items and add 'View All' button 1bbae2d
* setup husky, commitlint, and release-it ccf5751
* Update agent persona and test configurations 12f3fe5
* Update footer location to Taiwan Taipei fe9c205

### Bug Fixes

* **ci:** update release token in GitHub Actions workflow 92498ed
* **deps:** update package-lock.json to sync with workspace name change 0acd849
* ensure all e2e tests run in pre-push hook b7f79e7
* **infra:** remove legacy firestore resources and assertions f0bf4df
* make e2e smoke tests robust for parallel execution cc8b9ae
* resolve DEP0190 deprecation warning in BDD hooks bffa5df
* restore and stabilize bdd test execution b9343da
* **test:** resolve cucumber config and update project settings bf0f825
* update e2e config and smoke tests for backend integration c645a26
* Update email contact and adjust section IDs for accessibility ed02771
* Update email contact and adjust section IDs for accessibility a0507f9
* update pre-push hook to reflect unified e2e test script 65501bf
