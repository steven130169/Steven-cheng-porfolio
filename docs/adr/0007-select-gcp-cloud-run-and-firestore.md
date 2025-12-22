# Select GCP Cloud Run and Firestore for Commercial Operations

* Status: Superseded by [ADR 0015](0015-adopt-neon-db-and-drizzle-orm.md)
* Date: 2025-12-04
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
The project is evolving from a personal portfolio into a commercial platform requiring payment integration (ticket sales). The previous deployment strategy (Vercel + Render) is insufficient due to "cold start" issues causing payment webhook timeouts and a lack of persistent storage. We need a robust, scalable, and cost-effective architecture that supports Infrastructure as Code (IaC). The user specifically requested a solution that the implementing agent is most proficient in to ensure code quality and maintenance efficiency.

## Decision Drivers
*   **Payment Reliability**: The system must handle payment webhooks (e.g., Stripe/ECPay) without timeouts caused by deep sleep modes.
*   **Infrastructure as Code (IaC)**: Full Terraform support is required for reproducibility and stability.
*   **Cost Efficiency**: Aim for a "Scale to Zero" model to minimize costs during low-traffic periods, avoiding fixed monthly fees.
*   **Agent Proficiency**: The choice should align with the agent's strongest expertise to minimize implementation risks and debugging time.
*   **Data Flexibility**: A serverless, scalable database is preferred over managing complex SQL instances.

## Considered Options

### Option 1: GCP (Google Cloud Platform) - Cloud Run + Firestore
*   **Architecture**: Serverless Containers + NoSQL.
*   **Agent Proficiency**: **High (100%)**.
*   **Pros**: True "Scale to Zero" ($0 min); fast cold starts; straightforward Terraform configuration; Firestore offers a generous free tier and high scalability.
*   **Cons**: Requires adapting to NoSQL data modeling.

### Option 2: AWS - Lambda (Web Adapter) + DynamoDB
*   **Architecture**: FaaS (Docker) + NoSQL.
*   **Agent Proficiency**: High (90%).
*   **Pros**: Industry standard; extremely granular billing.
*   **Cons**: High configuration complexity (IAM, Policies); DynamoDB single-table design is complex to modify; Terraform code is verbose.

### Option 3: Azure - Container Apps + Cosmos DB
*   **Architecture**: Serverless Kubernetes + Multi-model DB.
*   **Agent Proficiency**: Medium-High (80%).
*   **Pros**: MongoDB compatibility via Cosmos DB; KEDA-based scaling.
*   **Cons**: `azurerm` provider can be volatile; setup is more complex than GCP.

## Decision Outcome
Chosen option: **Option 1: GCP (Google Cloud Platform) - Cloud Run + Firestore**.

**Justification:**
1.  **Stability**: Cloud Run provides the necessary reliability for payment webhooks with rapid auto-scaling.
2.  **Cost**: Both Cloud Run and Firestore offer true usage-based pricing with generous free tiers, making the idle cost effectively $0.
3.  **Implementation Efficiency**: The agent demonstrated the highest proficiency with this stack, ensuring the generated Terraform code and Docker configurations will be robust, idiomatic, and error-free.
4.  **Simplicity**: The combination of Cloud Run and Firestore requires significantly less "glue code" and configuration than the AWS equivalent.

## Consequences
*   **Positive**: We will have a fully codified infrastructure (Terraform) that costs $0 when idle.
*   **Positive**: Payment processing will be reliable due to Cloud Run's performance.
*   **Negative**: The backend logic must be adapted to work with **Firestore (NoSQL)** instead of a traditional SQL database. This involves learning and implementing Firestore patterns.
*   **Action Item**: Create `infra/` directory for Terraform configuration.
*   **Action Item**: Create `Dockerfile` for the NestJS backend.
