# T-040 Delete Retired GTL/ABG Monolith Stubs After TypeScript Authority Audit

- id: T-040
- title: Delete retired GTL/ABG monolith stubs after TypeScript authority audit
- type: chore
- ticket_category: ordinary
- status: completed
- goal: authority-surface-integrity
- change_intent: remove the temporary superseded GTL/ABG monolith locator files once the repaired requirement/design graph no longer depends on them
- change_class: requirement_reprice
- re_entry_point: requirements
- triaged_at: 2026-04-25
- priority: medium
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies: T-039
- affected_boundary: `specification/`, active/backlog ticket references, design authority references
- intake_source: operator clarification that SPEC_METHOD should converge back to one live surface after audit

## Context

`T-038` replaced the retired GTL/ABG monoliths with short `Superseded` stubs so
the TypeScript authority audit could prove no live surface still depended on
them.

That compatibility state is temporary.

Under the one-surface SPEC_METHOD authority rule, the old files should be
deleted once `T-039` proves the live graph derives from intent, product,
requirements, common design, and tenant design surfaces.

## Scope

- Delete `specification/ABG_3_CONSTITUTIONAL_DESIGN.md`.
- Delete `specification/GTL_3_CONSTITUTIONAL_DESIGN.md`.
- Remove any remaining active/backlog or live design references that treat the
  old files as locators or authority.
- Keep completed historical tickets and comments as history only.

## Acceptance

- `T-039` is completed or otherwise produces explicit evidence that no live
  requirement, scenario, common design, tenant design, active ticket, or backlog
  ticket depends on the retired stubs.
- Both retired stub files are deleted from `specification/`.
- No live authority surface derives from, links to, or names the retired files.
- Any remaining exact-name references are historical only and outside live
  authority surfaces.

## Non-Closure Conditions

- `T-039` still finds a live TypeScript design dependency on either retired
  stub.
- Either retired stub file remains in `specification/`.
- Any active requirement, scenario, common design, tenant design index, active
  ticket, or backlog ticket uses the retired files as authority or compatibility
  locators.

## Proof Surface

- `rg -n "ABG_3_CONSTITUTIONAL_DESIGN|GTL_3_CONSTITUTIONAL_DESIGN" specification build_tenants .ai-workspace/tickets/backlog .ai-workspace/tickets/active`
- `test ! -e specification/ABG_3_CONSTITUTIONAL_DESIGN.md`
- `test ! -e specification/GTL_3_CONSTITUTIONAL_DESIGN.md`
- `git diff --check`

## Closure Evidence

- `T-039` completed and found no live TypeScript design dependency on the
  temporary superseded stubs.
- Repo bootstrap/source-of-truth pointers in `AGENTS.md` and `README.md` now
  point at intent, product, requirement families, and common design surfaces.
- The two retired stub files were deleted from `specification/`.
- Proof commands passed on 2026-04-25: no live exact-name references in
  README/AGENTS/specification/build_tenants/active/backlog surfaces, both files
  are absent, and `git diff --check` passed.
