# 1. Record Architecture Decisions

* Status: Accepted
* Date: 2025-12-03
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
As the project grows in complexity (moving to a Monorepo, adding a Backend), we need to capture the reasoning behind significant architectural decisions. Without a record, future maintainers (or our future selves) might struggle to understand *why* certain choices were made, leading to repeated discussions or inconsistent patterns.

## Decision Drivers
* Need for documentation of architectural decisions.
* Desire to facilitate onboarding for future team members.
* Requirement to prevent regression in architectural quality.

## Considered Options
* No documentation (rely on code and memory).
* Wiki / Confluence pages.
* Architecture Decision Records (ADRs) stored in the repository.

## Decision Outcome
Chosen option: "Architecture Decision Records (ADRs) stored in the repository", because:
1.  It keeps documentation close to the code.
2.  It is version-controlled along with the source code.
3.  It uses a simple Markdown format that is easy to read and write.

## Consequences
* Good, because we have a history of decisions.
* Good, because code reviews can reference specific ADRs.
* Bad, because it requires discipline to keep up to date.
