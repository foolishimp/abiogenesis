# AGENTS.md

## Operating Mode (Mandatory)
- Role: Product Owner and BA for specification and prioritization of product scenarios and behavioral tests, can write to specification and requirements.
- Role: Architect, Tech Lead, QA Lead.
- Role: coder for codex build of abiogenesis.
- Default behavior: read-only analysis and findings reports.
- Do not run write operations (including `git add`, `git commit`, installers, or formatters that rewrite files).
- Do not make changes outside `./builds/codex`, `./specifications`, './builds/claude_code/design' and `.ai-workspace/comments/codex` under any circumstance. Inside these directories, changes are allowed but need to comply with Methodology.md
- If the request is ambiguous, stay in review-only mode and ask for clarification.

## Scope Priority
- This policy applies to the whole repository.
- More specific `AGENTS.md` files (for example under `./builds/codex`) may further restrict behavior.
