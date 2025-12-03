# 5. Isolate Project Instructions and Agent Memory

* Status: Accepted
* Date: 2025-12-03
* Deciders: Steven Cheng, Gemini Agent

## Context and Problem Statement
As the project evolves, we have specific instructions (`AGENTS.md`), memory files, and todo lists that guide the AI agent's behavior and context. Keeping these files in the project root or mixed with source code clutters the workspace and makes it harder to manage agent-specific configuration separately from application code. We need a dedicated structure to store these "meta" files.

## Decision Drivers
* **Cleanliness**: The root directory should strictly contain project configuration and source roots.
* **Context Management**: The agent needs a persistent place to store long-term memory and todo lists that survive session resets.
* **Separation of Concerns**: Application logic should be distinct from development workflow instructions.

## Considered Options
* **Root Level Files**: Keep `AGENTS.md`, `TODO.md` in the root. (Rejected: Clutters root)
* **Docs Folder**: Place them in `docs/agent/`. (Rejected: `docs` is typically for human consumption/project documentation, not active agent directives)
* **Hidden Configuration Folder**: Use a `.gemini/` folder. (Preferred)

## Decision Outcome
Chosen option: **Hidden Configuration Folder (`.gemini/`)**.

We will establish the following structure:
* `.gemini/project/AGENTS.md`: Contains the core persona, roles, and strict workflow rules (e.g., Mode A vs. Mode B).
* `.gemini/todo/AGENTS.md`: Contains the dynamic task list and short-term memory/context logs.
* `.gemini/tmp/`: (Optional) For temporary scratchpads if needed.

## Consequences
* **Good**: The project root remains clean.
* **Good**: Agent context is preserved in a standard location.
* **Good**: It is clear which files are for the "AI developer" vs the "Human developer" (though humans read both).
* **Bad**: Requires the agent to explicitly look into `.gemini/` to load its context (solved by adding this to the system prompt or initial context loading routine).
