# Cloud Provider Selection for Infrastructure as Code (IaC) and Commercial Operations

* Status: Proposed
* Date: 2025-12-04
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
The project is transitioning from a hobby portfolio to a potential commercial platform that will handle ticket sales and payments. This introduces critical requirements:
1.  **Infrastructure as Code (IaC)**: The infrastructure must be defined in code (Terraform) to ensure reproducibility, stability, and disaster recovery.
2.  **Payment Reliability**: The system must reliably handle payment webhooks (e.g., from Stripe/ECPay) without timeouts caused by "cold starts" or deep sleep modes found in free tier PaaS offerings.
3.  **Cost Efficiency**: While not necessarily $0, the solution must be cost-effective for a startup with unpredictable initial traffic. We aim to avoid high fixed monthly costs.

## Decision Drivers
*   **IaC Maturity**: Support for Terraform.
*   **Cost Model**: "Scale to Zero" capabilities vs. fixed monthly provisioning costs.
*   **Architecture Fit**: Compatibility with the existing NestJS (Monolith/API) architecture without requiring significant code rewrites.
*   **Reliability**: High availability and fast response times for webhook processing.

## Considered Options

### Option 1: GCP (Google Cloud Platform) - Cloud Run
*   **Architecture**: Serverless Container (Standard Docker container).
*   **IaC**: Excellent Terraform support (`google` provider).
*   **Cost**: True "Scale to Zero". You pay only when requests are processed. Generous free tier (2 million requests/month).
*   **Pros**: No code changes required (standard NestJS); Fast cold starts; 100% integration with Firebase for frontend.
*   **Cons**: Cloud SQL is expensive (min ~$50/mo), requiring a hybrid approach with external DBs (e.g., Neon) for cost savings.

### Option 2: AWS (Amazon Web Services) - Lambda
*   **Architecture**: Function-as-a-Service (FaaS).
*   **IaC**: Industry standard Terraform support (`aws` provider).
*   **Cost**: Extremely cheap for low traffic (Scale to Zero).
*   **Pros**: Massive ecosystem; granular billing.
*   **Cons**: **High Complexity**. Requires adapting NestJS to run in a Lambda environment (using `@vendia/serverless-express`), introducing "vendor lock-in" and coupling code to the infrastructure. Cold starts can be slower than containers.

### Option 3: AWS (Amazon Web Services) - App Runner
*   **Architecture**: Managed Container Service (similar to Cloud Run).
*   **IaC**: Good Terraform support.
*   **Cost**: **No Scale to Zero**. Minimum provisioned instance cost is ~$5-10/month even with no traffic.
*   **Pros**: Easy to set up; standard container support.
*   **Cons**: Fixed monthly cost makes it less attractive for early-stage startups compared to Cloud Run.

### Option 4: Azure - Container Apps
*   **Architecture**: Serverless Container (based on Kubernetes/KEDA).
*   **IaC**: Good Terraform support (`azurerm`), though Azure promotes Bicep.
*   **Cost**: Supports Scale to Zero (first 180k vCPU-seconds free).
*   **Pros**: Azure SQL Database has a very cheap basic tier (~$5/mo), solving the database cost issue better than GCP.
*   **Cons**: Terraform configuration for Azure can be more verbose/complex than GCP. Container Apps cold starts historically trailed behind Cloud Run (though improving).

## Comparison Matrix

| Feature | GCP (Cloud Run) | AWS (Lambda) | AWS (App Runner) | Azure (Container Apps) |
| :--- | :--- | :--- | :--- | :--- |
| **IaC (Terraform)** | ⭐⭐⭐⭐⭐ (Clean) | ⭐⭐⭐⭐⭐ (Complex) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **NestJS Fit** | ⭐⭐⭐⭐⭐ (Native) | ⭐⭐⭐ (Requires Adapter) | ⭐⭐⭐⭐⭐ (Native) | ⭐⭐⭐⭐⭐ (Native) |
| **Scale to Zero** | ✅ Yes ($0 min) | ✅ Yes ($0 min) | ❌ No (~$5-10 min) | ✅ Yes ($0 min) |
| **Payment Reliability** | ⭐⭐⭐⭐⭐ (Fast wake) | ⭐⭐⭐⭐ (Risk of timeout) | ⭐⭐⭐⭐⭐ (Always on) | ⭐⭐⭐⭐ |
| **Database Cost** | ❌ High (Cloud SQL) | ❌ High (RDS) | ❌ High (RDS) | ✅ Low (Azure SQL) |

## Decision Outcome
(Pending User Decision)

## Recommendation
**GCP Cloud Run** is recommended because it offers the best balance of **Standardization (Docker)**, **Cost ($0 min)**, and **IaC Simplicity**. The database cost issue can be mitigated by using a specialized serverless database provider (Neon/Supabase) instead of managed Cloud SQL.
