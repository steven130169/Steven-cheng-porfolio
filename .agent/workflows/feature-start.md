---
description: Start a new feature branch with standard conventions
---

1. Switch to the main branch
   ```bash
   git checkout main
   ```

2. Pull the latest changes
// turbo
   ```bash
   git pull
   ```

3. Create the new feature branch
   ```bash
   # User: What is the name of the feature? (e.g. blog-cms)
   git checkout -b feature/$1
   ```

4. Context Loading
   User, I have switched to the new branch `feature/$1`. 
   I will now read the `.agent/rules/AGENTS.md` to ensure I follow all coding standards and workflows.
   
   Please confirm: What is the specific goal of this feature?
