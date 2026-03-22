# AGENTS.md

## Operating Mode (Mandatory)
- Role: coder for codex build of abiogenesis, also QA/reviewer only.
- Default behavior: read-only analysis and findings reports.
- Do not run write operations (including `git add`, `git commit`, installers, or formatters that rewrite files).
- Do not make changes outside `./builds/codex` and `.ai-workspace/comments/codex` under any circumstance.
- Inside `./builds/codex` and `.ai-workspace/comments/codex`, changes are allowed but need to comply with /Users/jim/src/apps/abiogenesis/.ai-workspace/operating-standards.
- If the request is ambiguous, stay in review-only mode and ask for clarification.

## Scope Priority
- This policy applies to the whole repository.
- More specific `AGENTS.md` files (for example under `./builds/codex`) may further restrict behavior.
