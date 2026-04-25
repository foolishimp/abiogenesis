# T-039 Audit TypeScript Design Coverage Against Repaired GTL/ABG Requirement Authority

- id: T-039
- title: Audit TypeScript design coverage against repaired GTL/ABG requirement authority
- type: spike
- ticket_category: ordinary
- status: completed
- goal: typescript-rc-authority-closure
- change_intent: identify which active GTL and ABG requirements lack sufficient TypeScript design ownership after the monolithic constitutional design files are dissolved
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies: T-038
- affected_boundary: `specification/requirements/{gtl,abg}/`, `build_tenants/common/design/`, `build_tenants/abiogenesis/typescript/design/`
- intake_source: operator direction after identifying TypeScript iterate gap and monolithic GTL/ABG authority defect

## Context

The TypeScript line currently has at least one known design gap:

- ABG execution of a published `GraphFunction` is not yet designed as an
  internal replay-derived iterate engine over the callable graph boundary.

That is probably not the only gap.

After `T-038` repairs the source authority so requirements no longer derive
from monolithic GTL/ABG design files, the TypeScript design line must be
audited requirement-by-requirement.

The audit must not ask whether TypeScript has code that appears to work. It
must ask whether every active requirement has sufficient TypeScript design
ownership and whether that design can derive conformant implementation and
proof.

## Scope

Audit these inputs:

- `specification/requirements/gtl/REQ-L-GTL3-*.md`
- `specification/requirements/abg/REQ-R-ABG3-*.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/*.yml`
- `build_tenants/abiogenesis/typescript/design/**`

The audit should include, at minimum:

- GTL M01/M02 language and publication design coverage
- ABG M03 engine-kernel design coverage
- M04 public/app/bootstrap design coverage
- M05 qualification and sandbox/live proof design coverage where it claims to
  prove requirement truth
- known iterate / graph-function program execution gap
- any missing design for replay-derived progression, result assessment
  feedback, GraphCall lifecycle, continuation, projection, policy, binding,
  transport, and failure taxonomy

## Acceptance

- Produce a requirement-to-TypeScript-design coverage matrix or report.
- Each active requirement family is classified as one of:
  - `covered`
  - `partially_covered`
  - `missing_design`
  - `explicitly_deferred`
  - `not_applicable_to_typescript_line`
- For every `partially_covered` or `missing_design` item, name:
  - missing design surface
  - affected module boundary
  - downstream implementation/proof risk
  - recommended re-entry point
  - whether a successor ticket is required
- The known iterate gap is included but not allowed to absorb the whole audit.
- TypeScript design surfaces that cite superseded monolithic GTL/ABG files are
  identified and repriced to cite repaired requirement/common-design authority.
- The audit distinguishes:
  - missing requirement truth
  - missing shared design
  - missing TypeScript tenant design
  - missing implementation
  - missing proof
- Successor tickets are created for concrete repair work rather than folding
  repairs into the audit without triage.
- The audit explicitly determines whether the temporary superseded monolith
  stubs can be deleted under one-surface SPEC_METHOD authority. If no live
  dependency remains, `T-040` is unblocked.

## Non-Closure Conditions

- The audit treats existing TypeScript tests as design authority.
- The audit only reports the iterate gap and does not walk the active
  requirement families.
- The audit relies on the retired GTL/ABG monolith stubs as live authority
  after `T-038`.
- A requirement is marked covered without a concrete TypeScript design surface
  or explicit common-design adoption path.
- Missing implementation is conflated with missing design.

## Proof Surface

- Coverage report under `.ai-workspace/comments/codex/` or a ratified design
  audit surface if the findings are immediately adopted.
- `rg` proof that TypeScript governing design references repaired requirement
  and common-design authority rather than the monolithic files.
- Successor ticket list for concrete TypeScript design or implementation gaps.
- Decision on `T-040` deletion readiness for the temporary superseded
  monolith stubs.

## Closure Evidence

- Coverage report: `.ai-workspace/comments/codex/20260425T024955Z_T039_typescript_gtl_abg_requirement_design_coverage_audit.md`
- Successor tickets:
  - `T-041-design-typescript-m03-replay-derived-graph-function-iteration-and-aggregate-projection.md`
  - `T-042-design-typescript-m03-generic-retry-repair-and-leaf-task-governance.md`
  - existing `T-035-reprice-typescript-m03-m04-failure-taxonomy-to-distinguish-runtime-unavailable-capability-missing-and-runtime-failure.md`
  - existing `B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md`
- `T-040` deletion readiness: unblocked. The audit found no live TypeScript
  design dependency on the temporary superseded stubs.
