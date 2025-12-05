# Blog Content Management Strategy (Custom Firestore CMS)

* Status: Accepted
* Date: 2025-12-06
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The user wants to publish blog posts to the platform. Requirements include "Instant Publishing" (no CI/CD wait times) and a user-friendly writing experience (Admin UI). Traditional Git-based MDX approaches require redeployment for every typo fix, which is too slow. External Headless CMSs like Strapi require SQL databases, violating the project's Firestore-only constraint.

## Decision Drivers
*   **Publishing Speed**: Updates should be live immediately via API.
*   **Database Constraint**: Must use **Firestore**.
*   **Maintenance**: Avoid managing separate infrastructure (like a dedicated Strapi server).
*   **User Experience**: Needs a graphical interface (Admin UI) for writing, not just VS Code.

## Considered Options
*   **Option 1 (Chosen)**: **Custom Firestore CMS**.
*   **Option 2**: Next.js + MDX (Git-based).
*   **Option 3**: Strapi (Self-hosted).

## Decision Outcome
Chosen option: **Option 1**.

**Reasoning**:
1.  **Instant Updates**: By fetching content from Firestore API at runtime (SSR), changes appear immediately.
2.  **Unified Stack**: The "CMS" is just another module in our NestJS monolith (`BlogModule`) and a page in our Next.js app (`/admin/blog`). No extra servers to maintain.
3.  **Firestore Fit**: Blog posts (document-based data) map perfectly to Firestore's document model.

## Detailed Design
*   **Data**: `posts` collection in Firestore (`title`, `slug`, `content`, `publishedAt`, `tags`).
*   **Backend**: NestJS CRUD API.
*   **Frontend (Public)**: Next.js SSR pages (`/blog/[slug]`) fetching data from NestJS.
*   **Frontend (Admin)**: Protected route (`/admin/blog`) with a Rich Text Editor (e.g., Tiptap or simple Markdown editor) for creating/editing posts.

## Consequences
*   **Good, because**: Zero extra cloud cost.
*   **Good, because**: Highly customizable Admin UI.
*   **Bad, because**: We must build the editor UI and image upload logic ourselves.
