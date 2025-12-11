# Separate Infrastructure and Application CI/CD Pipelines

* Status: Accepted
* Date: 2025-12-10
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
The project is a Monorepo containing both Infrastructure as Code (`infra/`) and Application Code (`frontend/`). 
Initially, the deployment strategy relied on a single high-privilege Service Account to handle everything. This poses security risks and operational inefficiencies:
1.  **Security**: A compromise of the Application Deployment pipeline could grant full control over the entire GCP project (including IAM, Networking, and State Storage).
2.  **Coupling**: Mixing Infrastructure changes (e.g., enabling APIs, creating Buckets) with Application deployments (e.g., updating a container image) slows down the feedback loop.
3.  **Risk**: Running `terraform apply` for every application deployment increases the chance of accidental infrastructure drift or destruction.

## Decision Drivers
*   **Least Privilege Principle**: The entity deploying the application should only have permissions to deploy the application, not modify the network or IAM.
*   **Separation of Concerns**: Infrastructure lifecycle is distinct from Application lifecycle.
*   **Safety**: Minimize the "Blast Radius" of a compromised CI/CD pipeline.

## Decision Outcome
We have decided to **Decouple the CI/CD Pipelines** and **Split the IAM Identities** for Infrastructure and Application operations.

### 1. IAM Identity Split
We will create and use distinct Google Cloud Service Accounts (SAs) for different responsibilities:

*   **Runtime Service Account (`portfolio-frontend-runtime`)**:
    *   **Role**: The identity the Cloud Run application uses *at runtime*.
    *   **Permissions**: `roles/secretmanager.secretAccessor` (to access DB URLs), and other strictly minimal runtime needs.
    *   **Restriction**: Cannot change infrastructure.

*   **App Deployer Service Account (`portfolio-app-deployer`)**:
    *   **Role**: The identity used by GitHub Actions to build and deploy the application.
    *   **Permissions**: 
        *   `roles/artifactregistry.writer` (Push Docker images).
        *   `roles/run.developer` (Deploy new revisions).
        *   `roles/iam.serviceAccountUser` (Act as the Runtime SA).
    *   **Restriction**: Cannot create/delete Databases, change IAM policies, or modify high-level infrastructure.

*   **Infra Admin Service Account (Existing/Separate)**:
    *   **Role**: The identity used for Terraform operations on the `infra/` directory.
    *   **Permissions**: `roles/owner` or `roles/editor` (Broad access to provision resources).

### 2. Pipeline Strategy

*   **Infrastructure Pipeline (Infra-CI)**:
    *   **Trigger**: Changes in `infra/**`.
    *   **Tasks**: `terraform fmt`, `terraform validate`, `terraform test`, and `terraform apply` (manual or automated).
    *   **Identity**: Infra Admin SA.

*   **Application Pipeline (App-CI)**:
    *   **Trigger**: Changes in `frontend/**` or `main` branch.
    *   **Tasks**: Lint, Test, Build Docker Image, Push to Registry, Deploy to Cloud Run.
    *   **Identity**: App Deployer SA.

## Implementation Details
*   **Terraform (`infra/main.tf`)**: 
    *   Define `google_service_account` resources for Runtime and App Deployer.
    *   Define specific IAM bindings (`google_project_iam_member`, `google_artifact_registry_repository_iam_member`) to enforce least privilege.
*   **GitHub Actions**:
    *   Workflows should authenticate using Workload Identity Federation (WIF) or distinct JSON Keys (migrating away from a single shared key).
    *   The `deploy.yml` workflow should utilize the `portfolio-app-deployer` identity.

## Consequences
*   **Positive**: Significant reduction in security risk. If the GitHub Actions `deploy` job is compromised, the attacker cannot delete the database or lock out administrators.
*   **Positive**: Clearer audit logs in GCP (distinguishing between automated deployments and infrastructure changes).
*   **Negative**: Increased complexity in IAM management and Terraform configuration.
*   **Negative**: Requires careful coordination when the Application needs *new* infrastructure (e.g., a new Bucket) - this must be provisioned by the Infra pipeline *before* the App pipeline runs.
