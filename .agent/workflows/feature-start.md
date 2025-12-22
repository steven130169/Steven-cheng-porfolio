---
description: Start a new feature in a dedicated git worktree
---

1. Define the Feature Name
   ```bash
   # User: What is the name of the feature? (e.g. event-ticketing)
   export FEATURE_NAME=$1
   ```

2. Create a clean Git Worktree (Sibling Directory)
// turbo
   ```bash
   # Get the repo root name
   REPO_NAME=$(basename $(git rev-parse --show-toplevel))
   # Define worktree path (sibling directory)
   WORKTREE_PATH="../${REPO_NAME}-${FEATURE_NAME}"
   
   echo "Creating worktree at ${WORKTREE_PATH}..."
   
   # Create worktree and new branch
   git worktree add -b feature/${FEATURE_NAME} ${WORKTREE_PATH} main
   ```

3. Initialize the new workspace
   User, I have created a dedicated environment for `feature/${FEATURE_NAME}` at:
   `${WORKTREE_PATH}`
   
   **ACTION REQUIRED**:
   Please **open a new IDE window** for that directory.
   
   (This ensures I can work on the new feature without interfering with your current `main` branch or other agents.)
