---
id: T-151
title: Declare segment-scoped evaluation redispatch substrate
type: feature
ticket_category: ordinary
status: completed
proof_status: passed
goal: make ABG able to admit, project, fold, and redispatch a declared evaluation segment or segment-dimension cell inside one graph-vector traversal without forcing downstream products to rerun the whole edge or create a local outcome decider
change_class: requirement_reprice
change_intent: Add a generic segment-scoped evaluation address to the GTL/ABG evaluation and iteration substrate while keeping segment meaning product-owned and subordinate to the existing graph-vector traversal boundary.
re_entry_point: requirements
created_at: 2026-06-07
updated_at: 2026-06-07
completed_at: 2026-06-07
owning_repo: abiogenesis
governance_scope: STDO Method
priority: medium
build_tenant: typescript
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_SAGA_FRONTIER_DERIVATION.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-192-factor-evaluation-contract-into-segment-dimension-grid.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/claude/20260606T164334Z_REVIEW_T-192-evaluation-grid-code-review.md
related_tickets:
  - T-141
  - T-145
  - T-149
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-192-factor-evaluation-contract-into-segment-dimension-grid.md
affected_boundary:
  requirements:
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
    - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_SAGA_FRONTIER_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration_state_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/graph_span_reentry.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t151_segment_scoped_evaluation_redispatch.test.mjs
downstream_proving_domain:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-192-factor-evaluation-contract-into-segment-dimension-grid.md
  - future odd_sdlc scalable evaluation follow-up
target_truth: ABG can address evaluation findings, assurance rows, and redispatch targets at a declared segment or segment-dimension scope inside one graph-vector traversal. The segment scope is subordinate to graph call, frame, vector, composition, and declared product topology; it is not a new public GTL topology object, not a bare graph-vector target, and not a product-specific ontology imported into ABG. Scoped findings remain evaluator facts. ABG admits them, projects scoped rows, folds them through the existing T-149 iteration outcome algebra, and may select localized redispatch for the failed scope while preserving sibling scoped facts unless authority, input, or re-entry lineage invalidates them.
superseded_truth: Redispatch is addressable only by `GraphReentryPoint` plus `targetVectorIndex`, and evaluation findings carry no admitted segment or dimension address. Downstream products that need n-segment evaluation must either rerun the whole edge or create a product-local grid outcome decider.
closure_law: This ticket closes only when requirements define generic scoped evaluation addressability, design declares the carrier/admission/projection shape, TypeScript findings and iteration rows carry admitted scope refs without product vocabulary, the T-149 outcome fold can return a redispatch target for a scoped evaluation failure without adding a new outcome constructor, and focused proof demonstrates an n>1 evaluation grid where one failed segment-dimension scope redispatches without invalidating admitted sibling scopes.
non_closure_conditions:
  - segment scope is encoded in `targetVectorIndex`, prompt text, diagnostic strings, or product-local naming convention instead of an admitted scope carrier
  - a segment, cell, or dimension becomes a public GTL topology object or bare semantic job target
  - ABG imports odd_sdlc, data_mapper, prompt-grid, Rust-service, or other downstream product vocabulary
  - an evaluator finding can directly close, emit events, write ledgers, select a vector, or own redispatch truth
  - localized redispatch is implemented by a second per-segment state machine outside the T-149 iteration outcome fold
  - sibling scoped findings are discarded by default when one scope fails
  - preserved, superseded, stale, and orphan scoped evidence are not distinguished before closure or redispatch
  - no negative test proves malformed, stale, or mismatched scope refs fail admission
  - proof only covers the degenerate one-segment case
review_gate: design and implementation review required before release
---

# T-151: Declare Segment-Scoped Evaluation Redispatch Substrate

## Intake Triage

Smallest lawful re-entry point: `requirement_reprice`.

Reason: existing ABG law covers edge-level iteration outcome, graph-vector
re-entry, assurance projection, and dependency-frontier branch realization.
It does not yet declare a generic evaluation scope address beneath one
graph-vector traversal.

The current public iteration outcome carrier intentionally has only three
primitive constructors: terminate, redispatch, and suspend. This ticket does
not change that law. The missing piece is addressability: a redispatch target
can name a graph vector today, but it cannot name a declared failed evaluation
segment or segment-dimension cell inside that vector.

This is not a reopening of odd_sdlc T-192. The closed T-192 proof covers the
degenerate fused 1 x k case. This ticket records the upstream ABG substrate
needed before a downstream product can lawfully claim scalable n-segment
evaluation without product-local retry/block/close logic.

## Evidence For The Gap

The current generic finding and redispatch carriers are edge-monolithic:

- `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts:214`
  defines `GtlEvaluationFindingRef` with finding, evaluator, evidence,
  authority, composition, diagnostic, residual pressure, and continuation refs,
  but no segment or dimension address.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/graph_span_reentry.ts:125`
  defines re-entry rows with `targetVectorIndex`, and `:398` validates that
  target against the graph's vector index range.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration_state_action.ts:133`
  defines `IterationRedispatchTarget` as `GraphReentryPoint` plus
  `targetVectorIndex`.

odd_sdlc T-192 pre-registered the dependency:

- `T-192:215` says that if the existing T-149 fold plus
  `GraphReentryPoint` and `reentryTargetVectorIndex` cannot express localized
  segment redispatch, the missing substrate is an abiogenesis ticket and
  release dependency.
- `T-192:256` requires a proof that GridFold can redispatch one failed
  segment/dimension without invalidating admitted sibling cells.

The post-hoc review confirmed that the 1 x k steel thread closed lawfully, but
that n>1 localized redispatch is not expressible on the current substrate.

## Target Model

Add a generic scoped evaluation address under the existing graph-vector
boundary.

Sketch, not final design authority:

```ts
interface EvaluationScopeRef {
  readonly kind: "evaluation_scope_ref";
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly compositionRef: string;
  readonly scopeTopologyRef: string;
  readonly scopeKind: "edge" | "segment" | "dimension_cell" | "fold" | "relation";
  readonly segmentRef: string | null;
  readonly dimensionRef: string | null;
}
```

The final design may choose different names, but it must preserve these
properties:

- scope identity is admitted data, not parsed prose
- scope identity is subordinate to the graph call, frame, vector, and selected
  composition
- product owns segment meaning and topology declaration
- ABG owns admission, replay projection, row folding, redispatch selection, and
  sibling evidence lifecycle
- scoped redispatch reuses the T-149 `redispatch` constructor and adds no new
  outcome kind

## Boundary Rules

- GTL may declare the generic evaluation-scope carrier and hook/field slots.
  It must not import downstream segment taxonomies.
- ABG admits scoped findings and projects scoped satisfaction, runtime,
  binding-guard, lifecycle, and redispatch target rows.
- Evaluator output remains semantic finding evidence only.
- Assurance and iteration folds decide edge closure over the full scoped row
  set.
- A failed local scope may select localized redispatch only when sibling scope
  evidence remains current and the failed scope has a lawful target.
- If scope topology, authority binding, sibling freshness, or lineage is
  missing or contradictory, ABG fails closed, serializes, blocks, or escalates
  through existing admitted runtime truth.

## Required Work

| id | task | closure proof | status |
| --- | --- | --- | --- |
| P-010 | Amend requirements for scoped evaluation addressability under one graph-vector boundary. | `REQ-R-ABG3-ITERATION`, `REQ-R-ABG3-ASSURANCE`, `REQ-R-ABG3-PROJECTION`, and GTL evaluator/vector law define scope refs without creating a public topology object. | complete |
| P-020 | Add M03 design, IACS, and structural carrier updates. | Design shows scope refs entering findings, assurance rows, iteration rows, and redispatch target rows while preserving the T-149 primitive outcome algebra. | complete |
| P-030 | Extend TypeScript carriers, constructors, admission, serialization, and exports. | Malformed, stale, mismatched, and product-vocabulary scope refs fail admission; valid generic scope refs round-trip. | complete |
| P-040 | Wire scoped rows into assurance and iteration outcome projection. | One failed scoped row can select a scoped redispatch target; sibling rows remain eligible when authority/input/lineage stays current. | complete |
| P-050 | Add focused tests for n>1 scoped evaluation. | Tests prove localized redispatch, sibling preservation, stale-scope rejection, malformed-scope rejection, and no new outcome constructor. | complete |
| P-060 | Publish a downstream consumption seam. | odd_sdlc can depend on the released generic substrate for its future scalable evaluation follow-up without importing ABG internals or owning a local outcome decider. | complete |

## Proof Requirements

- Static proof: no ABG production source imports odd_sdlc or downstream segment
  vocabulary.
- Static proof: `IterationOutcome` still exposes only terminate, redispatch, or
  suspend.
- Unit proof: `GtlEvaluationFindingRef` or its successor can carry an admitted
  evaluation scope ref and rejects missing or mismatched graph call, frame,
  vector, composition, segment, or dimension identity.
- Unit proof: the scoped assurance row set folds to close only when every
  required current scoped row is fulfilled or lawfully deferred.
- Unit proof: one failed segment-dimension scope can redispatch that scope
  without clearing admitted sibling scopes.
- Negative proof: stale scoped evidence becomes superseded or stale rather than
  satisfying current closure.
- Negative proof: a scope ref with no declared topology binding fails closed
  instead of becoming an untyped string convention.

## Implementation Summary

Implemented the first generic segment-scoped evaluation substrate:

- requirements now declare scoped evaluation addressability, scoped assurance
  folding, projection source law, evaluator scope refs, and graph-vector scope
  topology without creating a new GTL topology object
- M03 iteration design/IACS/diagram now show `GtlEvaluationScopeRef` as
  subordinate row and redispatch-target metadata
- GTL M02 compute notation now exports `GtlEvaluationScopeRef`,
  `constructGtlEvaluationScopeRef`, `admitGtlEvaluationScopeRef`, and closed
  scope kinds: `edge`, `segment`, `dimension_cell`, `fold`, and `relation`
- F_P evaluation findings can carry an admitted scope ref; runner composition
  checks reject scope refs bound to the wrong graph call, frame, graph
  function, vector, or composition
- iteration satisfaction, runtime, binding-guard, and redispatch target rows can
  carry optional scope refs; scoped redispatch still uses the T-149
  `redispatch` outcome constructor
- `npm run test:t151` runs deterministic deep coverage plus a live-style
  package-surface proof under `test_env/live/`

## Review Gate

Passed on 2026-06-07.

Review disposition:

- requirements/design/code preserve the scoped address as subordinate metadata
  under one graph-vector boundary
- runner validation binds scoped F_P findings to the active graph call, frame,
  graph function, vector, and selected composition
- iteration projection validates scoped rows against the active graph call,
  frame, graph function, vector index, and graph vector edge
- scoped redispatch reuses the existing `redispatch` outcome constructor
- tests cover a non-degenerate n>1 scoped grid, sibling preservation, malformed
  scope shape, mismatched boundary identity, stale/orphan distinction,
  superseded replay visibility, and the no-new-outcome structural guard

No T-151 release blocker found.

## Proof Log

Passed:

- `npm run test:t151` - 10/10, including live-style package-surface proof.
- `npm run test:t145` - 16/16.
- `npm run test:t149` - 12/12.
- `npm run test:t143` - 1/1.
- `npm run lint:semantic`.
- `npm run lint:test-harness`.
- `npx eslint --max-warnings=0 test_env/tests/test_t151_segment_scoped_evaluation_redispatch.test.mjs`.
- `npm run test:semantic` - 691/691.
- `git diff --check`.

Live attempt:

- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:t132:live` ran the
  installed live edge-assurance lane and failed before producing an admitted
  JSON result. The transport exited status 0, but the live worker refused to
  emit the prefilled close JSON because the prompt supplied refs without
  underlying evidence. Archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t132_edge_assurance_installed_live/20260606T174518329Z_pid58524`.

## Current Status

Completed. T-151 releases the generic segment-scoped evaluation redispatch
substrate for downstream consumption. This does not tap a broader package
release over the unrelated T-132 external live edge-assurance failure recorded
above.
