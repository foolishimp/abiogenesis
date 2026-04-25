# T-038 Refactor GTL/ABG Constitutional Design Monoliths Into Constituent Authority Surfaces

- id: T-038
- title: Refactor GTL/ABG constitutional design monoliths into constituent authority surfaces
- type: bug
- ticket_category: ordinary
- status: completed
- goal: authority-surface-integrity
- change_intent: remove the rival constitutional authority created by monolithic GTL/ABG design files and relocate their live law into the correct requirement and design layers
- change_class: requirement_reprice
- re_entry_point: requirements
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- affected_boundary: `specification/`, `specification/requirements/{gtl,abg}/`, `build_tenants/common/design/`, tenant design indexes
- intake_source: operator review of `specification/ABG_3_CONSTITUTIONAL_DESIGN.md` authority conflict

## Context

`specification/ABG_3_CONSTITUTIONAL_DESIGN.md` and
`specification/GTL_3_CONSTITUTIONAL_DESIGN.md` were introduced in commit
`8ff8b61` on 2026-04-05 as monolithic constitutional design files.

That shape conflicts with the current shared method:

- `specification/requirements/` is the live requirement authority.
- Requirements define constitutional `WHAT`.
- Design defines downstream `HOW`.
- ADRs and design records implement requirements; they are not a second
  requirement surface.

The current files invert that direction. ABG requirement families currently
derive from `ABG_3_CONSTITUTIONAL_DESIGN.md`, and several live scenario and
design indexes treat the monoliths as governing constitutional authority.

This must be repaired as an authority migration, not by continuing ad hoc edits.

## Authority Migration Declaration

- old_truth_path:
  - `specification/ABG_3_CONSTITUTIONAL_DESIGN.md`
  - `specification/GTL_3_CONSTITUTIONAL_DESIGN.md`
- new_requirement_truth_path:
  - `specification/requirements/abg/REQ-R-ABG3-*.md`
  - `specification/requirements/gtl/REQ-L-GTL3-*.md`
- new_shared_design_path:
  - `build_tenants/common/design/module_decomp.md`
  - `build_tenants/common/design/modules/M01-gtl-core.yml`
  - `build_tenants/common/design/modules/M02-work-publication.yml`
  - `build_tenants/common/design/modules/M03-engine-kernel.yml`
- new_tenant_design_path:
  - `build_tenants/abiogenesis/python/design/**`
  - `build_tenants/abiogenesis/typescript/design/**`
- compatibility_policy: old monolith paths may remain temporarily only as
  superseded compatibility stubs or indexes. They must not claim active
  constitutional authority.

## Required Adjudication

Each statement in the two monolith files must be classified before removal:

- `requirement`: move into the relevant `REQ-*` family.
- `shared_design`: move into common module decomposition or common module specs.
- `tenant_design`: move into the relevant tenant design surface or ADR.
- `scenario_or_proof`: move into scenario/testcase authority surfaces.
- `historical_or_commentary`: move to comments or design history, or delete if
  version control already preserves it.
- `duplicate`: delete after confirming equivalent live authority exists.
- `orphan`: either reprice into a live requirement or explicitly drop.

## Acceptance

- `specification/requirements/abg/` and `specification/requirements/gtl/` carry
  the live GTL/ABG constitutional obligations.
- No live requirement file derives from either monolithic design file.
- Live scenarios derive from requirements and product/intent authority, not from
  the monolithic design files.
- Shared module ownership for GTL and ABG is represented in common design
  module surfaces, not in `specification/` monoliths.
- Tenant design indexes reference requirement families and common design
  surfaces as governing authority.
- `ABG_3_CONSTITUTIONAL_DESIGN.md` and `GTL_3_CONSTITUTIONAL_DESIGN.md` are
  either deleted or replaced with short `Superseded` stubs that point to the
  constituent requirement and design surfaces.
- Any unique law discovered only in the monoliths is either moved to the correct
  live surface or explicitly recorded as dropped with rationale.
- Completed historical tickets may retain historical references, but active and
  backlog tickets must not treat the monoliths as live authority.

## Non-Closure Conditions

- Either monolith still claims to be "the constitution" or "constitutional
  authority" for GTL or ABG.
- Any live requirement family still derives from either monolith.
- Any live scenario or design index still uses either monolith as upstream
  constitutional authority.
- A unique runtime, language, event, projection, policy, or boundary obligation
  remains only inside a monolith.
- The refactor only renames or shortens the monoliths without repairing
  downstream references.
- The old files remain as active design surfaces with normative content.

## Proof Surface

- `rg -n "ABG_3_CONSTITUTIONAL_DESIGN|GTL_3_CONSTITUTIONAL_DESIGN" specification build_tenants .ai-workspace/tickets/backlog .ai-workspace/tickets/active`
- `rg -n "This document is the .*constitution|constitutional authority" specification`
- `git diff --check`
- Manual review of the monolith-to-requirement classification map.

## Closure Evidence

- `specification/ABG_3_CONSTITUTIONAL_DESIGN.md` and `specification/GTL_3_CONSTITUTIONAL_DESIGN.md` are now short `Superseded` historical locators.
- GTL and ABG requirement family headers no longer derive from the monoliths.
- Scenario headers now derive from method, intent, product, and requirement-family authority.
- Common and tenant design indexes now reference requirement families and common design module surfaces.
- Unique law found during adjudication was moved into `REQ-L-GTL3-LANGUAGE`, `REQ-R-ABG3-EVENTS`, `REQ-R-ABG3-INTERPRET`, and `M03-engine-kernel.yml`.
- Manual classification map: `.ai-workspace/comments/codex/20260425T023631Z_T038_gtl_abg_monolith_refactor_report.md`.
- Proof commands run on 2026-04-25: exact monolith-name search has no live spec/design matches; authority-claim search has no matches in `specification/`; `git diff --check` passed.

## Notes

The working tree already contains partial draft edits from the intake
discussion. Those edits are not closure evidence. This ticket must either adopt
them through the classification and proof process above or replace them with a
cleaner migration.
