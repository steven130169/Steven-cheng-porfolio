# Blog Content Management Strategy (Custom Firestore CMS)

* Status: Accepted
* Date: 2025-12-06
* Deciders: Steven Cheng, Context 7 Agent

## Context and Problem Statement
The user wants to publish blog posts to the platform. Requirements include "Instant Publishing" (no CI/CD wait times) and a user-friendly writing experience (Admin UI). Traditional Git-based MDX approaches require redeployment for every typo fix, which is too slow. External Headless CMSs like Strapi require SQL databases, violating the project's Firestore-only constraint.

Additionally, we need to select a robust Rich Text Editor component for the Admin UI that offers a modern writing experience (like Notion/Medium) and flexibility for custom extensions (e.g., image uploads to GCS).

## Decision Drivers
*   **Publishing Speed**: Updates should be live immediately via API.
*   **Database Constraint**: Must use **Firestore**.
*   **Maintenance**: Avoid managing separate infrastructure (like a dedicated Strapi server).
*   **User Experience**: Needs a graphical interface (Admin UI) for writing, not just VS Code.
*   **Editor Flexibility**: The editor component must support custom image handling and extensive styling control.

## Considered Options

### CMS Architecture
*   **Option 1 (Chosen)**: **Custom Firestore CMS**.
*   **Option 2**: Next.js + MDX (Git-based).
*   **Option 3**: Strapi (Self-hosted).

### Editor UI Component
*   **Option A (Chosen)**: **TipTap** (Headless ProseMirror wrapper).
*   **Option B**: MDXEditor.
*   **Option C**: React-Markdown-Editor-Lite.

## Decision Outcome
Chosen option: **Option 1 (Custom CMS)** with **Option A (TipTap)**.

**Reasoning**:
1.  **Instant Updates**: By fetching content from Firestore API at runtime (SSR), changes appear immediately.
2.  **Unified Stack**: The "CMS" is just another module in our NestJS monolith (`BlogModule`) and a page in our Next.js app (`/admin/blog`). No extra servers to maintain.
3.  **TipTap Superiority**: TipTap provides a headless, framework-agnostic (perfect for React) foundation. It allows us to build a bespoke editor UI that matches our design system, supports drag-and-drop image uploads (integrated with our backend), and offers a "Notion-like" experience.

## Detailed Design
*   **Data**: `posts` collection in Firestore (`title`, `slug`, `content`, `publishedAt`, `tags`).
*   **Backend**: NestJS CRUD API.
*   **Frontend (Public)**: Next.js SSR pages (`/blog/[slug]`) fetching data from NestJS.
*   **Frontend (Admin)**: Protected route (`/admin/blog`) implementing **TipTap** for the writing interface.

## Consequences
*   **Good, because**: Zero extra cloud cost.
*   **Good, because**: Highly customizable Admin UI using TipTap.
*   **Bad, because**: We must build the editor UI (toolbar, floating menu) and image upload logic ourselves using TipTap APIs.