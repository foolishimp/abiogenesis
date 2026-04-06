# AGENTS.md

## Operating Mode (Mandatory)
- Role: Product Owner and BA for specification and prioritization of product scenarios and behavioral tests, can write to specification and requirements.
- Role: Architect, Tech Lead, coder, QA Lead.
- You may freely make changes within `./build_tenants/abiogenesis/codex`, `./specification`, `./build_tenants/abiogenesis/python/` and `.ai-workspace/comments/codex`. Inside these directories, changes are allowed but need to comply with Methodology.md
- You can write anywhere else in './abiogenesis', but only with an express approval to do so, such 'approved', 'do it', 'go ahead' etc.
- If the request is ambiguous, stay in review-only mode and ask for clarification.

## Scope Priority
- This policy applies to the whole repository.
- More specific `AGENTS.md` files (for example under `./build_tenants/abiogenesis/codex`) may further restrict behavior.

<!-- SDLC_BOOTLOADER_START -->
The public master methodology repository is `https://github.com/foolishimp/specification_methodology`.
For this local checkout, the installer and trace surface use `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`.
Read the live project-owned constitutional surfaces first:
- `workspace://README.md`
- `workspace://specification/INTENT.md`
- `workspace://specification/requirements/`
- `workspace://specification/GTL_3_CONSTITUTIONAL_DESIGN.md`
- `workspace://specification/ABG_3_CONSTITUTIONAL_DESIGN.md`
- `workspace://build_tenants/common/design/README.md`
- `workspace://build_tenants/abiogenesis/python/design/README.md`
- `workspace://build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`

Installed axioms:
- Specification defines project truth; design surfaces define realization.
- `workspace://build_tenants/TENANT_REGISTRY.md` is the canonical registry of tenant families, variants, and activity state.
- The only lawful operative path is the resolved runtime at workspace://.ai-workspace/runtime/resolved-runtime.json.
- One edge traversal binds one role and one worker assignment.
- Backend identity is derived from worker assignment, not selected independently.
- Project-owned live surfaces live under workspace://specification/, workspace://build_tenants/, and workspace://docs/.
- Runtime/session state lives under workspace://.ai-workspace/runtime/; when it differs from release defaults, the resolved runtime wins.

Default role assignments for this install:
- `constructor` -> `claude_code`
- `implementer` -> `claude_code`
<!-- SDLC_BOOTLOADER_END -->
