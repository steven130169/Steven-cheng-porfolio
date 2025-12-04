# Establish Implementation Strategy for GCP Infrastructure

* Status: Accepted
* Date: 2025-12-04
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
Following the decision to adopt GCP Cloud Run and Firestore (ADR 0007), we need to define the specific technical implementation details for Infrastructure as Code (IaC), Containerization, and Application Integration. This ensures that the implementation aligns with modern best practices, security standards, and the project's "Code Stabilization" goals.

## Decision Drivers
*   **Maintainability**: Infrastructure code must be readable, modular, and version-controlled.
*   **Security**: Docker images must be minimal and secure (non-root). Database access must be strictly controlled via IAM.
*   **Reliability**: The infrastructure provisioning process must be verifiable (Testable IaC).
*   **Compatibility**: The NestJS application must seamlessly integrate with Firestore and the Cloud Run environment.

## Technical Decisions

### 1. Containerization Strategy (Docker)
*   **Base Image**: `node:20-alpine` for minimal footprint.
*   **Build Process**: Multi-stage build (`development` -> `build` -> `production`).
*   **Security**: Run as non-root user (`USER node`).
*   **Optimization**: Use `npm ci` for deterministic builds.
*   **Entrypoint**: `dist/main.js`.

### 2. Infrastructure as Code (Terraform)
*   **Provider Version**: `google` provider >= v6.0.0 to support Cloud Run v2 and latest IAM changes.
*   **Resource Selection**:
    *   `google_cloud_run_v2_service`: For the backend application. Note: Using `env` as a Set (not List) per v6 changes.
    *   `google_firestore_database`: For the NoSQL database (Native Mode).
    *   `google_artifact_registry_repository`: For storing private Docker images.
*   **Project Structure**:
    *   `infra/versions.tf`: Provider locking.
    *   `infra/variables.tf`: Environment abstraction.
    *   `infra/main.tf`: Core resource definitions.
    *   `infra/outputs.tf`: Service URLs and identifiers.

### 3. Backend Integration (NestJS + Firestore)
*   **Dependency**: `@google-cloud/firestore`.
*   **Pattern**:
    *   Replace in-memory `private events: Event[]` with Firestore Collection references.
    *   Use `auto-generated IDs` for document creation.
    *   Implement `Converter` pattern (if necessary) to map Firestore Documents to TypeScript interfaces.
*   **Configuration**:
    *   Local Dev: Connect to Firestore Emulator or a dev project via Application Default Credentials (ADC).
    *   Production: Auto-authenticate via Cloud Run Service Account (Identity Federation).

## Consequences
*   **Positive**: The infrastructure is fully defined in code, enabling "GitOps" workflows in the future.
*   **Positive**: Docker images are optimized for production performance and security.
*   **Positive**: The application logic is decoupled from the infrastructure but integrated via standard environment variables (`FIRESTORE_DB_NAME`, `GCP_PROJECT_ID`).
*   **Risk**: Local development now requires GCP credentials or emulators, increasing setup complexity slightly compared to in-memory storage.
