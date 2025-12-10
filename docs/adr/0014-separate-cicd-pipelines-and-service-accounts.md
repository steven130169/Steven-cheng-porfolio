# Separate CI/CD Pipelines and Service Accounts Strategy

* Status: Accepted
* Date: 2025-12-09
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
Currently, the project uses a single `deploy.yml` workflow for both Infrastructure (Terraform) and Application (Docker/Next.js) deployment. This requires a single Service Account (SA) with excessive permissions ("God Mode") to handle everything from IAM management to Docker pushing. This violates the Principle of Least Privilege. 
Additionally, the Service Account naming (`portfolio-frontend-sa`) is ambiguous regarding its role (Runtime vs. Deployer).

## Decision Drivers
*   **Security**: Implement Least Privilege. The App Deployer should not be able to modify IAM or delete databases.
*   **Clarity**: Distinct Service Accounts for distinct roles (Runtime, App Deploy, Infra Deploy).
*   **Decoupling**: App deployment should not force a Terraform Apply check every time, and vice versa.

## Decision Outcome
We will split the CI/CD pipeline and restructure Service Accounts.

### 1. Service Account Architecture (3-Tier)

| Role | SA Name (ID) | Managed By | Permissions | Secret Name |
| :--- | :--- | :--- | :--- | :--- |
| **Infra Deployer** | `portfolio-infra-deployer` (or existing Admin SA) | **Manual** | `Project IAM Admin`, `Editor`, `Secret Admin` | `GCP_INFRA_DEPLOYER_KEY` |
| **App Deployer** | `portfolio-app-deployer` | **Terraform** | `Artifact Registry Writer`, `Cloud Run Developer`, `Service Account User` | `GCP_APP_DEPLOYER_KEY` |
| **Runtime Identity** | `portfolio-frontend-runtime` | **Terraform** | `Secret Manager Secret Accessor` (for DB URL), `Logging Writer` | N/A (Bound to Cloud Run) |

*Note: The existing `portfolio-frontend-sa` will be renamed/replaced by `portfolio-frontend-runtime`.*

### 2. Pipeline Architecture

*   **`infra-deploy.yml`**:
    *   **Trigger**: `push` to `main` (paths: `infra/**`) OR `workflow_dispatch` (triggered by Release).
    *   **Identity**: Uses `GCP_INFRA_DEPLOYER_KEY`.
    *   **Action**: `terraform apply`.
    *   **Responsibility**: Provision SAs, IAM, DB, Registry, and Cloud Run Service shell.

*   **`app-deploy.yml`**:
    *   **Trigger**: `workflow_dispatch` (triggered by Release) OR `push` to `main` (paths: `frontend/**`).
    *   **Identity**: Uses `GCP_APP_DEPLOYER_KEY`.
    *   **Action**: `docker build`, `docker push`, `gcloud run deploy`.
    *   **Responsibility**: Update the running code.

### 3. Transition Strategy (Terraform Lifecycle)
To prevent Terraform (Infra Pipeline) from reverting the Image Tag updated by `gcloud` (App Pipeline), we must configure `lifecycle { ignore_changes = [client, client_version, template[0].containers[0].image] }` in `infra/main.tf`.

## Consequences
*   **Good, because**: Security is significantly improved. A compromised App Deployer key cannot destroy infrastructure.
*   **Good, because**: Pipelines are faster and decoupled.
*   **Bad, because**: Requires generating and managing multiple keys/secrets.
*   **Bad, because**: Renaming the Runtime SA will cause a recreation of the SA resource.
