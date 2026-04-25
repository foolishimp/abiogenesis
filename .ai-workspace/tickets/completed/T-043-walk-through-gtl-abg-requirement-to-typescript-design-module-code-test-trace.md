# T-043 Walk Through GTL/ABG Requirement To TypeScript Design/Module/Code/Test Trace

- id: T-043
- title: Walk through GTL/ABG requirement to TypeScript design/module/code/test trace
- type: spike
- ticket_category: ordinary
- status: completed
- goal: typescript-rc-authority-closure
- change_intent: produce an end-to-end trace walkthrough from active GTL/ABG requirements through scenarios, common modules, TypeScript design, TypeScript code, and TypeScript tests before further RC repair work proceeds
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies: T-039
- affected_boundary: `specification/requirements/`, `specification/scenarios/`, `build_tenants/common/design/`, `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/`, `build_tenants/abiogenesis/typescript/test_env/`
- intake_source: operator review after asking whether current trace can prove `req -> design -> module -> TS`
- target_truth: one admitted walkthrough report classifies every GTL/ABG requirement family across scenario, common module, TypeScript design, code, and test evidence before downstream repair tickets open
- superseded_truth: downstream repair tickets could proceed from audit-only findings without walking scenario/test/code evidence or checking for missing requirements first
- closure_law: this ticket closes only when the walkthrough report names each trace link, names every missing requirement/design/code/test gap, produces a missing-requirement register even if empty, and confirms or reprices successor tickets before they open
- evaluation_criteria:
  - every active `REQ-L-GTL3-*` and `REQ-R-ABG3-*` family is walked
  - all eight scenario bundles are mapped to TypeScript test surfaces or missing tests
  - current backlog tickets are confirmed, narrowed, or repriced
  - the missing-requirement register exists even if empty
- non_closure_conditions:
  - implementation tests are treated as authority without upstream trace
  - scenario bundles are ignored
  - missing requirement work is folded silently into a design or implementation ticket
  - successor ticket scope remains ambiguous
- proof_surface:
  - `.ai-workspace/comments/codex/<walkthrough-report>.md`
  - `rg` proof across common design, TypeScript design, code, and tests
  - scenario-to-test mapping table
  - missing-requirement register
  - successor ticket list
  - `git diff --check`

## Method Sequence

This ticket is the middle gate in the sequence:

1. `audit`: `T-039` identified current trace coverage and likely gaps.
2. `walkthrough`: this ticket walks the authority graph end to end.
3. `missing requirement`: any missing constitutional truth discovered by the
   walkthrough is repriced into requirement tickets before downstream design or
   implementation repair proceeds.

## Context

`T-039` established that the TypeScript line has a usable trace scaffold, but
not full ABG trace closure.

Before implementing `T-041`, `T-042`, `T-035`, or `B-030-TS`, the project needs
one explicit walkthrough that follows the live authority graph end to end and
checks whether the missing link is actually a missing requirement, not merely a
missing design or test.

The walkthrough is not a code fix. It is an audit/proof surface that says what
is already traceable, what is missing, and which successor ticket owns each
missing link.

## Walkthrough Path

For each active GTL and ABG requirement family, walk:

1. requirement family
2. scenario/testcase authority
3. common module ownership
4. TypeScript tenant design surface
5. TypeScript module/code ownership
6. TypeScript unit/UAT/sandbox/live test evidence
7. gap, if any
8. successor ticket, if any

## Acceptance

- Produce a walkthrough report under `.ai-workspace/comments/codex/`.
- The report covers every active `REQ-L-GTL3-*` and `REQ-R-ABG3-*` family.
- The report explicitly maps the eight scenario bundles in
  `specification/scenarios/` to TypeScript test surfaces or missing tests.
- The report distinguishes:
  - missing requirement authority
  - missing scenario/testcase authority
  - missing common module ownership
  - missing TypeScript design
  - missing TypeScript code
  - missing TypeScript unit test
  - missing TypeScript UAT/sandbox/live proof
- The report states whether each current backlog item is still correctly
  scoped after the walkthrough:
  - `T-041`
  - `T-042`
  - `T-035`
  - `B-030-TS`
- For every missing or weak requirement, the report must name:
  - proposed requirement family or new requirement file
  - why existing requirement authority is insufficient
  - affected scenario bundles
  - downstream design tickets blocked by the missing requirement
- Any newly discovered missing link gets a successor ticket rather than being
  silently folded into an existing ticket.

## Non-Closure Conditions

- The walkthrough treats implementation tests as authority without tracing them
  back to requirements and scenario authority.
- The walkthrough only reviews ABG gaps and skips GTL trace.
- The walkthrough only reviews design and skips TypeScript code/test evidence.
- A requirement is marked closed without naming the concrete design, code, and
  test surfaces that prove it.
- Scenario bundles are ignored or treated as commentary rather than testcase
  authority.
- A design or implementation ticket proceeds while its governing requirement is
  missing, ambiguous, or only implied by tests.

## Proof Surface

- Walkthrough report under `.ai-workspace/comments/codex/`.
- `rg` proof for requirement IDs across common design, TypeScript design,
  TypeScript code, and TypeScript tests.
- Scenario-to-test mapping table.
- Missing-requirement register, even if empty.
- Successor ticket list for any missing trace links.
- `git diff --check`.

## Closure Evidence

- Walkthrough report:
  `.ai-workspace/comments/codex/20260424T172930Z_T043_gtl_abg_requirement_to_typescript_trace_walkthrough.md`
- Missing requirement register: empty.
- Successor tickets confirmed:
  - `T-041` remains the design-only ordinary ticket for replay-derived
    graph-function iteration and aggregate projection.
  - `T-042` remains the design-only ordinary ticket for retry/repair and
    leaf-task governance.
  - `T-035` remains the upstream taxonomy reprice for runtime-unavailable,
    capability-missing, and true runtime-failure classes.
  - `B-030-TS` remains downstream of `T-035` for complete callable `start` and
    stop taxonomy over canonical public-control truth.
- No new requirement ticket is required before downstream design work opens.
