---
id: T-105
title: RC.6 cross-surface consistency loop — docs, bootstrap, install, design, and operator-facing artifacts
type: feature
ticket_category: rc_consistency_loop
status: active
goal: rc6-cross-surface-consistency-with-substrate-actually-shipping
change_intent: Run a full consistency audit across documentation, bootstrap, install, design, specification statements, operator-facing CLI outputs, and test-surface registries to detect and fix rc.4-era references that survive across rc cuts. Original scope (LLM_GTL_APP_BUILDER_GUIDE.md substrate refresh) is one node in the loop, not the whole ticket. Independent review of the guide refresh found three pre-existing field-level inaccuracies inherited across rc cuts (CLI start fields, lawful-next-move conflation, exit codes including 5 and 7 that do not exist in source); that finding generalizes — other surfaces likely carry analogous rc.4-era stale references that the rc.6 cut bumped version labels for without correcting content.
change_class: realization_refactor
re_entry_point: realization
affected_boundary: docs/, bootstrap/, install scripts, README.md, AGENTS.md, CLAUDE.md, USER_GUIDE.md if present, test_env/test_surface_map.md, build_tenants/.../design/*.md, package.json version surfaces, install-manifest / install-provenance, CLI help/version output, and any other operator-facing or builder-facing artifact that names rc carriers, events, plugin contracts, CLI fields, exit codes, or version labels. No specification or intent surface modifications without explicit operator approval per finding.
priority: high
build_tenant: typescript
triaged_at: 2026-05-02T13:06:08Z
created_at: 2026-05-02T13:06:08Z
updated_at: 2026-05-02T13:06:08Z
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-082 completed
  - T-100 completed
  - T-101 completed
  - T-102 completed
  - T-103 completed
  - T-104 completed
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
related_comments:
  - .ai-workspace/comments/claude/20260502T053000Z_DESIGN_eval-framework-from-anthropic-demystifying-evals.md
intake_source: Operator probe on 2026-05-02 confirmed via grep that the LLM_GTL_APP_BUILDER_GUIDE has its version label at rc.6 but zero substantive content from T-082 through T-104. The doc claims to be the first document an LLM reads to build a GTL/ABG app, so staleness is a high-impact failure mode.
target_truth: docs/LLM_GTL_APP_BUILDER_GUIDE.md describes the RC.6 substrate accurately — the new carriers (output allocation, zoom foldback, eval suite, graph span reentry, cross-workspace), the 5-rule edge_converged predicate, retry allowlist, artifact salvage, behavioral observation rule, F_P/F_D constitutional boundary, change_class taxonomy and constitutional reentry, pass@k/pass^k metrics, and capability/regression eval discipline.
superseded_truth: The doc has the rc.6 version label but describes only the rc.4-era surface (ExecutionBasis/AdvancementTransition/IterationAdvanceDecision/RegimeBindingSet, gen-start/gen-gaps grammar, generic plugin contracts) without any of the substrate added in the wave.
closure_law: close only when (a) the LLM builder guide describes the new carriers, events, F_P/F_D rule, 5-rule edge_converged predicate, retry allowlist, salvage, behavioral observation, eval-suite, graph-span reentry, constitutional reentry, and cross-workspace allocation with file:line anchors (first-pass landed; see Implementation Result); AND (b) the existing Public Runtime Loop section's CLI output fields, lawful-next-move table, and exit-code table match `code/src/cli/command.ts:820-836` and `:770-789`; AND (c) every other operator-facing or builder-facing artifact named in `affected_boundary` has been independently audited against the rc.6 source for rc.4-era stale references — version labels alone are not parity, content must be verified — with the audit produced as a registered finding list and each finding either fixed in this ticket or filed as an explicit deferral with rationale.
non_closure_conditions:
  - new sections describe carriers without anchoring to source file:line
  - F_P/F_D boundary description is generic and doesn't pin "subdivision is a feature, not the check" or the recurring B-003/B-013/B-014/B-016/B-017 pattern
  - any new section invents vocabulary that doesn't appear in source
  - any document grows beyond its declared role by adding marketing prose, hedging language, or redundant repetition
  - existing document structure is broken by inserting sections at the wrong logical position
  - specification or intent surface is modified without explicit operator approval per finding
  - rc cut version labels are bumped on a surface without verifying that the surface's content matches the new rc — version-label-only changes are exactly the failure mode this ticket exists to detect
  - the audit-finding registry is missing or fails to enumerate which surfaces were checked, what was found, and what was fixed vs deferred
  - any deferred finding is not filed under a typed deferral (named follow-up ticket reference or explicit operator decision recorded in this ticket)
proof_commands:
  - grep -ciE "outputinstanceallocation|outputworkspacebinding|zoomframe|obligationledgerasset|obligationscheduleasset|zoomfoldbackevaluation|outertraversalevaluation|graphspanassessment|graphspanfoldbackevaluation|graphreentryfrontier|graphreentryplan|graphconstitutionalreentry|evalsuitespec|evaltask|evaltrial|evaloutcome|evalgradevector|evalaggregateprojection|pass@k|pass\\^k|carryconverged|fulfillmentconverged|targetcertificationpassed|fdrecheckpassed|retryable_runtime_failure_classes|semantic_fulfillment_gap|traceability_reference_gap|change_class|intent_reprice|salvageditemrefs" docs/LLM_GTL_APP_BUILDER_GUIDE.md
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - git diff --check
---

# T-105: Refresh LLM GTL App Builder Guide to RC.6 Substrate Parity

## STDO Triage

First missing layer: realization (documentation surface).

The doc carries the `3.4.0-rc.6` version label but every substantive section
describes only the rc.4-era surface. Every new carrier, event kind, plugin
contract, and constitutional rule from the T-082 → T-104 wave is absent. Because
this guide is the first document an LLM agent reads to build a GTL/ABG app, the
staleness produces unsafe priming — the next agent will reproduce the failure
modes the wave was designed to prevent (lexical-F_D check, controller-local
iteration, missing artifact salvage, graph-local repair instead of constitutional
reentry).

## Required Sections

The doc must explicitly describe:

1. The F_P / F_D constitutional boundary (anchored to PRODUCT.md / INTENT.md
   and the recurring B-003 / B-013 / B-014 / B-016 / B-017 pattern).
2. T-082 output instance allocation primitive (`OutputInstanceAllocation`,
   `OutputPluginHandoffManifest`, three new event kinds).
3. T-100 zoom/foldback substrate (`ZoomFrame`, `ObligationLedgerAsset`,
   `ObligationScheduleAsset`, `ScheduledSliceAssessment`,
   `ZoomFoldbackEvaluation`, `OuterTraversalEvaluation`, the five-term
   `edge_converged` predicate, retry allowlist, artifact salvage, finding-class
   split).
4. T-101 mini data-mapper redux pattern as the operator-runnable per-edge
   sandbox shape.
5. T-102 eval-suite projection (`EvalSuiteSpec`, `EvalTask`, `EvalTrial`,
   `EvalOutcome`, `EvalGradeVector`, `EvalAggregateProjection`, pass@k /
   pass^k, capability / regression discipline, Anthropic-vocabulary mapping).
6. T-103 graph-span foldback and reentry (`GraphSpanRef`,
   `GraphSpanAssessment`, `GraphSpanFoldbackEvaluation`,
   `GraphReentryFrontierProjection`, `GraphReentryPlan`,
   `GraphConstitutionalReentry`, `change_class` enum, earliest-implicated-vector
   reentry rule, constitutional reentry routes, intent / homeostatic loop).
7. T-104 cross-workspace output allocation (`OutputWorkspaceBinding`, W1/W2
   discipline).
8. Updated public runtime contract / public runtime loop sections to reflect
   graph-span and reentry events.
9. Updated LLM Builder Algorithm to include output allocation, cross-workspace
   binding, eval-suite emission, span foldback consumption, constitutional
   reentry routing.

## Implementation Plan

1. Add an "F_P / F_D Constitutional Boundary" subsection inside the Hook Model
   section. Anchor to `specification/PRODUCT.md:97`, `specification/PRODUCT.md:105`,
   `specification/INTENT.md:92`, `specification/INTENT.md:96`. Pin "subdivision
   is a feature, the per-obligation check is still F_P" and the recurring bug
   pattern.
2. Insert a new top-level "Eval Suite Projection And Worker Variance" section
   between Hook Model and ABG 3.4.0 RC carrier law. Anchor to
   `code/src/abg/m03/contracts/eval_suite.ts`. Cover capability vs regression,
   pass@k / pass^k, Anthropic vocabulary mapping, transcript discipline.
3. Extend the "ABG 3.4.0 RC carrier law" section with an "ABG 3.4.0-rc.6 carrier
   extensions" subsection. Cover T-082 (output allocation primitive), T-100
   (zoom foldback), T-104 (cross-workspace W1/W2). Anchor each carrier to
   file:line.
4. Insert a new top-level "Graph-Span Foldback And Constitutional Reentry"
   section after the carrier extensions. Cover T-103 substantively. Include the
   change_class / re_entry_point taxonomy and the homeostatic intent loop
   mapping.
5. Update LLM Builder Algorithm. The 13-step list at line 973 must reference
   the new substrate.
6. Update the public runtime contract / loop sections to include graph-span and
   reentry events alongside existing transitions.

## Acceptance Criteria

- AC-1: New "F_P / F_D Constitutional Boundary" subsection appears in the Hook
  Model neighborhood, anchored to PRODUCT.md:97 and PRODUCT.md:105.
- AC-2: New section describing T-082 output allocation carriers
  (`OutputInstanceAllocation`, `OutputPluginHandoffManifest`, the three new
  event kinds: `output_instance_allocated`, `output_binding_admitted`,
  `output_materialization_observed`) appears with file:line citations to
  `code/src/abg/m03/contracts/output_allocation.ts`.
- AC-3: New section describing T-100 zoom/foldback carriers + 5-term
  `edge_converged` predicate (`carryConverged`, `fulfillmentConverged`,
  `admitted`, `targetCertificationPassed`, `fdRecheckPassed`) + retry allowlist
  (`RETRYABLE_RUNTIME_FAILURE_CLASSES`) + artifact salvage (`salvagedItemRefs`)
  + finding-class split (`semantic_fulfillment_gap`,
  `traceability_reference_gap`), with file:line citations.
- AC-4: New section describing T-102 eval-suite projection carriers + pass@k /
  pass^k + capability/regression discipline + Anthropic-vocabulary mapping
  (task / transcript / outcome / grader).
- AC-5: New section describing T-103 graph-span foldback + reentry frontier +
  constitutional reentry + `change_class` taxonomy + intent loop / homeostatic
  loop, with file:line citations.
- AC-6: New section describing T-104 cross-workspace output allocation (W1/W2,
  `OutputWorkspaceBinding`).
- AC-7: Public runtime contract / loop updated to reflect graph-span events and
  cross-workspace start truth.
- AC-8: LLM Builder Algorithm updated to mention output allocation,
  cross-workspace, eval-suite emission, span foldback consumption,
  constitutional reentry routing.
- AC-9: All new sections preserve the doc's compressed, technical, present-tense
  tone — no marketing prose, no hedging, no redundant repetition.
- AC-10: `git diff --check` and `lint:semantic` pass; the substrate-vocabulary
  grep returns more than 50.
- AC-11: All surfaces in `affected_boundary` have been independently audited
  and a finding registry exists in this ticket's body.
- AC-12: The three known findings F1/F2/F3 in `LLM_GTL_APP_BUILDER_GUIDE.md`
  are fixed; the runtime-loop CLI fields, lawful-next-move table, and exit-code
  table match `code/src/cli/command.ts:820-836` and `:770-789`.
- AC-13: Every additional finding from the audit is either fixed in this
  ticket or filed as an explicit deferral in the registry with rationale.
- AC-14: No surface had a version-label-only update — every surface where
  rc.6 appears has had its content verified against rc.6 source.
- AC-15: Specification and intent surfaces were not modified in this ticket.
  Any spec-level findings are deferred for explicit operator approval.

## Implementation Result

Closed on first pass.

### Implemented surfaces

`docs/LLM_GTL_APP_BUILDER_GUIDE.md` extended in five surgical inserts at the
positions called out in the implementation plan. No structural reshuffle. No
modification to specification, intent, design, code, or test surfaces.

1. New `### F_P / F_D constitutional boundary` subsection inside Hook Model.
   Anchored to `specification/PRODUCT.md:97`, `specification/PRODUCT.md:105`,
   `specification/INTENT.md:92`, `specification/INTENT.md:96`. Pins the
   recurring B-003 / B-013 / B-014 / B-016 / B-017 conflation pattern, the
   "subdivision is a feature, not the check" rule, and the F_P / F_D / ABG
   ownership table.
2. New top-level `## Eval Suite Projection And Worker Variance` section between
   Hook Model and What ABG Owns. Anchored to
   `code/src/abg/m03/contracts/eval_suite.ts:13-457`. Covers `EvalSuiteSpec`,
   `EvalTask`, `EvalTrial`, `EvalOutcome`, `EvalGradeVector`,
   `EvalAggregateProjection`, capability vs regression, `passAtK` / `passAllK`,
   the Anthropic vocabulary mapping table, the operator sandbox shape, and
   the "read transcripts" rule.
3. New `### ABG 3.4.0-rc.6 carrier extensions` subsection inside the existing
   carrier law. Three sub-subsections covering T-082 output allocation
   (`output_allocation.ts:32-174` plus the three new event kinds), T-100 zoom
   foldback (`workspace_zoom_foldback.ts:32-201` plus the five-term
   `edge_converged` predicate, retry allowlist, salvage, finding-class split,
   behavioral observation rule, six event kinds), and T-104 cross-workspace
   (`output_allocation.ts:44-50, 106-109, 148-153, 337-363`).
4. New top-level `## Graph-Span Foldback And Constitutional Reentry` section
   covering T-103. Anchored to `graph_span_reentry.ts:50-168, 376-408,
   533-544, 680-703, 1122-1255, 1329-1388`. Includes the five new event kinds,
   the `change_class` and `re_entry_point` taxonomies, the
   earliest-implicated-vector reentry rule, the frontier severity priority,
   and the homeostatic intent loop mapping table.
5. LLM Builder Algorithm extended from 13 steps to 17 to reference output
   allocation, cross-workspace W2, ledger / schedule / zoom-frame opening, the
   five-term predicate, foldback decision routing, eval-suite emission, and
   constitutional reentry consumption.
6. Public runtime contract extended with W1 / W2 start truth.
7. Public runtime loop event-kinds table added covering the 14 new and
   relevant event kinds in one block.

### Verification

```text
grep -nE "rc\.[0-9]" docs/LLM_GTL_APP_BUILDER_GUIDE.md
# 6 hits, all rc.6, label consistent

grep -ciE "<31 substrate vocabulary terms>" docs/LLM_GTL_APP_BUILDER_GUIDE.md
# before: 0
# after:  53

cd build_tenants/abiogenesis/typescript && npm run lint:semantic
# lint=0 (passes with --max-warnings=0)

git diff --check
# clean

wc -l docs/LLM_GTL_APP_BUILDER_GUIDE.md
# 1941 -> 2338, net +397 lines
```

The doc grew slightly past the 250-400 line guidance because three substrate
sections (T-100 zoom foldback, T-103 graph-span reentry, T-102 eval suite)
each carry first-class carriers, event kinds, and predicate algebra that
needed file:line citation. Hedging or compression beyond what landed would
have produced ungrounded prose, which is one of the closure non-conditions.

### Items for follow-up

- T-101 mini data-mapper redux is referenced in the Eval Suite section as the
  operator-runnable per-edge sandbox shape, but the doc does not yet have a
  dedicated worked example. The current treatment is intentional — T-101 is a
  pattern, not a carrier, and the doc anchors it through
  `test_env/sandbox/mini_dm_redux/`. If a worked example is wanted as a public
  reference, that is a separate doc ticket.
- The doc's existing Python and TypeScript appendices (lines ~1670 onwards)
  do not yet show concrete examples of allocating outputs, opening a zoom
  frame, or admitting a span assessment. Adding language-shaped examples of
  the new carriers would help downstream tenants but expands the appendix
  surface; the current ticket scope is "describe accurately", not "provide
  worked language examples". Suggest a follow-up ticket if examples are
  required for the appendix.

### Status

- Phase 1 (LLM guide substrate refresh): complete, first-pass landed.
- Phase 2 (cross-surface audit + F1/F2/F3 fix): complete; see Phase 2 section
  below.
- Awaiting operator review for closure.

## Phase 2 — Cross-Surface Audit

### Method

Audit ran across the seven surface families named in `affected_boundary`:

1. `docs/` markdown (LLM_GTL_APP_BUILDER_GUIDE.md, USER_GUIDE.md, README.md,
   ABIOGENESIS_RC_NOTES.md, ABIOGENESIS_RC_RELEASE_NOTE.md, THE_GENESIS_VISION.md).
2. Workspace bootstrap (root `README.md`, `AGENTS.md`, `CLAUDE.md`).
3. Bootstrap and install scripts (`gen-install*`, `*install*.mjs`,
   `*install*.ts`, `package.json` version surfaces).
4. Build-tenant design docs
   (`build_tenants/abiogenesis/typescript/design/*.md`).
5. Test-surface registries
   (`build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`,
   `build_tenants/abiogenesis/typescript/test_env/README.md`).
6. Specification statements (`specification/PRODUCT.md`, `INTENT.md`,
   `specification/requirements/abg/`, `specification/requirements/gtl/`).
7. Operator-facing CLI outputs (LLM guide and USER guide CLI sections,
   `.claude/commands/*.md`).

For each surface, three greps ran:

```bash
grep -rnE "rc\.[0-9]|3\.4\.0[\.-]rc|RC[0-9]" <surface>
grep -rE "ExecutionBasis|AdvancementTransition|IterationAdvanceDecision|RegimeBindingSet" <surface>
grep -rE "fp_manifest_path|proof_hold_active|root_supervision|stop_predicate|Iteration limit|Proof hold stopped" <surface>
grep -rE "OutputInstanceAllocation|ZoomFrame|GraphSpanAssessment|EvalSuiteSpec|edge_converged|graph_span" <surface>
```

Each match was inspected against the rc.6 source: `code/src/cli/command.ts`,
`code/src/abg/m03/contracts/output_allocation.ts`,
`code/src/abg/m03/contracts/workspace_zoom_foldback.ts`,
`code/src/abg/m03/contracts/graph_span_reentry.ts`,
`code/src/abg/m03/contracts/eval_suite.ts`, `package.json`.

### Finding registry

| ID  | Surface                                            | Finding                                                                                                                                                                                              | Severity                          | Action                                                                                                                                                  |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | `docs/LLM_GTL_APP_BUILDER_GUIDE.md` lines 1549-1560 | CLI `start` field table claimed `stop_predicate`, `fp_manifest_path`, `root_supervision`, `proof_hold_active`; missing `command`, `resolved_target`, `graph_function_id`, `stopped_by`, `event_kinds`, `events_path`, `stop_class`, `control_outcome`, `fh_mode`. | Blocking parity claim             | **Fixed**: rewrote table to match `cli/command.ts:820-836`. Cited source.                                                                               |
| F2  | `docs/LLM_GTL_APP_BUILDER_GUIDE.md` lines 1562-1571 | "Lawful next move" table keyed off `dispatch_required`/`human_gate_required`/`proof_hold` as if they were `status`; `proof_hold` is not a valid CLI signal in rc.6.                                  | Blocking parity claim             | **Fixed**: rewrote to act from `status` and `stopped_by`; dropped `proof_hold` row.                                                                     |
| F3  | `docs/LLM_GTL_APP_BUILDER_GUIDE.md` lines 1593-1604 | Exit-code table claimed codes 5 (Iteration limit) and 7 (Proof hold) that do not exist in `exitCodeForStart`.                                                                                        | Blocking parity claim             | **Fixed**: dropped 5 and 7; cited `cli/command.ts:770-789`. Reworded code 4 to "Rejected with `gap_stop`".                                              |
| F4  | `docs/USER_GUIDE.md` lines 700-736                  | Identical F1+F2+F3 pattern in the operator guide: same stale fields, `stop_predicate` table, exit codes 5 and 7.                                                                                     | Blocking parity claim             | **Fixed**: rewrote field table, signal table, and exit-code table to match the same source. Same rc.6 source citations.                                  |
| F5  | `docs/USER_GUIDE.md` line 776                       | Said "the output includes `fp_manifest_path`" — that field is not emitted on `start`.                                                                                                                | Blocking parity claim             | **Fixed**: replaced with `stopped_by = dispatch_required` and routes through the dispatch event.                                                        |
| F6  | `docs/USER_GUIDE.md` line 817                       | Said "output includes `root_supervision: true`"; that field does not exist.                                                                                                                          | Blocking parity claim             | **Fixed**: replaced with `root_mode: "supervised"`.                                                                                                     |
| F7  | `CLAUDE.md` line 57                                  | GTL Bootloader version label `3.4.0-rc.5`; package.json is `3.4.0-rc.6`.                                                                                                                              | Bootstrap label drift             | **Fixed**: bumped to `3.4.0-rc.6`. Bootloader content is rc.6-consistent (carriers ExecutionBasis/AdvancementTransition/etc. still present in rc.6 source).  |
| F8  | `AGENTS.md` line 49                                  | Same as F7.                                                                                                                                                                                          | Bootstrap label drift             | **Fixed**: bumped to `3.4.0-rc.6`.                                                                                                                       |
| F9  | `.claude/commands/gen-{start,gaps,iterate,review,status}.md` | All five workspace-root slash commands invoke `python -m genesis ...`; rc.6 primary tenant is TypeScript (`genesis-ts ...`). gen-start references `fp_manifest_path` and exit code 5 (max_iterations). | Operator-surface structural drift | **Deferred**: rewriting Python-flavored slash commands to TS is structural reshuffle beyond rc.4-era stale-reference fix. File for follow-up ticket.    |
| F10 | `docs/LLM_GTL_APP_BUILDER_GUIDE.md` overall         | Doc was 1941 → 2338 lines after Phase 1 substrate refresh; vocab grep ≥53 hits.                                                                                                                      | None                              | Confirmed in Phase 1.                                                                                                                                    |
| F11 | `docs/README.md`, `docs/THE_GENESIS_VISION.md`, `docs/ABIOGENESIS_RC_NOTES.md`, `docs/ABIOGENESIS_RC_RELEASE_NOTE.md` | Version labels rc.6, no stale CLI field references, no rc.4-era CLI vocabulary. The retained `rc.4 live gates` reference in the release note is a legitimate historical footnote.                                                                                | None                              | No action.                                                                                                                                              |
| F12 | `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md` | Already references T-082, T-100, T-103 substrate; no rc.4-era stale references; uses `edge_converged`, `graph_span_reentry`.                                                                          | None                              | No action.                                                                                                                                              |
| F13 | `build_tenants/abiogenesis/typescript/design/*.md`  | No matches for `fp_manifest_path`, `proof_hold_active`, `root_supervision`, `Iteration limit`, `Proof hold stopped`. No rc.x version labels.                                                          | None                              | No action.                                                                                                                                              |
| F14 | `specification/PRODUCT.md`, `INTENT.md`, `requirements/`     | No rc.x version labels, no stale CLI field references, no rc.4-era CLI vocabulary.                                                                                                                    | None                              | No action.                                                                                                                                              |
| F15 | Root `README.md`                                    | Uses rc.6 label, references `ExecutionBasis`/`AdvancementTransition`/`IterationAdvanceDecision`/`RegimeBindingSet` which are rc.6-current. CLI references mention public contract only, no stale fields. | None                              | No action.                                                                                                                                              |
| F16 | `build_tenants/abiogenesis/python/CHANGELOG.md`     | Python tenant is paused reference line on a separate version (3.2.0-rc.1).                                                                                                                              | Out of scope                      | Out of scope — `affected_boundary` excludes paused Python tenant.                                                                                       |
| F17 | `package.json`, `package-lock.json`                  | Version `3.4.0-rc.6`; consistent with all rc.6 documentation labels.                                                                                                                                 | None                              | No action.                                                                                                                                              |

### Per-finding outcome summary

- Fixed in this ticket: F1, F2, F3, F4, F5, F6, F7, F8 (8 findings).
- Deferred for follow-up ticket: F9 (workspace-root slash commands targeting
  paused Python tenant; structural rewrite, not a stale-reference fix).
- No action required: F10, F11, F12, F13, F14, F15, F17 (7 surfaces audited
  clean).
- Out of scope: F16 (paused Python tenant).
- Specification surface: no findings; no modification.

### Files modified

- `docs/LLM_GTL_APP_BUILDER_GUIDE.md` — F1, F2, F3.
- `docs/USER_GUIDE.md` — F4, F5, F6.
- `CLAUDE.md` — F7.
- `AGENTS.md` — F8.

### Verification

```text
# F1: stale fields gone
grep -nE "fp_manifest_path|proof_hold_active|root_supervision" docs/LLM_GTL_APP_BUILDER_GUIDE.md
# 0 hits

# F1: correct fields land
grep -nE "stopped_by|resolved_target|event_kinds|stop_class|control_outcome" docs/LLM_GTL_APP_BUILDER_GUIDE.md
# multiple hits in the new field table and signal table

# F3: exit codes 5 and 7 dropped
grep -nE "Iteration limit|Proof hold stopped" docs/LLM_GTL_APP_BUILDER_GUIDE.md
# 0 hits

# F4-F6: USER_GUIDE updated
grep -nE "fp_manifest_path|proof_hold_active|root_supervision|stop_predicate|Iteration limit|Proof hold stopped" docs/USER_GUIDE.md
# 0 hits

# F7-F8: bootstrap version labels
grep -nE "Version.*rc\." CLAUDE.md AGENTS.md
# both: 3.4.0-rc.6

# Lint and diff-check
cd build_tenants/abiogenesis/typescript && npm run lint:semantic
# lint=0

git diff --check
# clean
```

### Followup-ticket candidates

- **F9**: Rewrite `.claude/commands/gen-{start,gaps,iterate,review,status}.md`
  to invoke `genesis-ts` against the TypeScript tenant (rc.6 primary).
  Current versions reference `python -m genesis`, `PYTHONPATH=.genesis`,
  `fp_manifest_path`, and exit code 5 (max_iterations) — all paused-Python
  tenant idioms. Out of scope for the rc.4-era stale-reference loop;
  structural reshuffle.

## Phase 3 — Bootloader Content Audit And Fix

Independent review of the Phase 2 audit report identified that Phase 2 only
bumped the bootloader version label (rc.5 → rc.6) without auditing the 230-line
bootloader content embedded inside `AGENTS.md` and `CLAUDE.md`. Operator invoked
SPEC_METHOD: active surfaces are present-tense, no history; bootstrap is compact
ontology + references for traversal. Phase 3 audited the bootloader against
that discipline and applied compact additions per section.

### Findings

| ID | Bootloader section | Finding | Outcome |
|----|---------|---------|---------|
| F18 | Section 2 (Structural Axioms) closing list | ABG runtime artifact list missing rc.6 carriers | **Fixed** — extended list to include `OutputInstanceAllocation`, `OutputWorkspaceBinding`, `ZoomFrame`, `ScheduledSliceAssessment`, `ZoomFoldbackEvaluation`, `GraphSpanAssessment`, `GraphSpanFoldbackEvaluation`, `GraphReentryFrontierProjection`, `GraphReentryPlan`, `GraphConstitutionalReentry`, `EvalSuiteSpec`, `EvalAggregateProjection` |
| F19 | Section 4 (GTL/ABG Boundary) "ABG realizes" list | Missing 6 realizations from rc.6 substrate | **Fixed** — added 6 bullets: output allocation, zoomed obligation ledger, graph-span foldback, constitutional reentry routing, eval-suite projection, cross-workspace start truth |
| F20 | Section 4 (GTL/ABG Boundary) | F_P/F_D constitutional rule not stated in the bootloader (only in the LLM guide); the bootloader is the FIRST surface an LLM reads | **Fixed** — added one paragraph pinning F_P semantic / F_D mechanical / subdivision-is-a-feature / determinism-does-not-reclassify |
| F21 | Section 6 (Recursive Runtime Contract) | Missing graph-span foldback and reentry-frontier projection as recursive-frame outcomes | **Fixed** — added 2 bullets covering terminal-vector closure → graph-span foldback and reentry routing |
| F22 | Section 7 (Runtime Truth Rules) | 14 rules describe rc.4 carrier set; missing 5-term `edge_converged`, retry allowlist, graph-span foldback, output allocation events | **Fixed** — added 4 rules (15-18) covering edge convergence predicate, retry allowlist, graph-span foldback / constitutional reentry, output allocation / cross-workspace |
| F23 | Section 8 (Read Next) "Project-owned surfaces" | Missing T-100 and T-103 design-doc references for traversal into detail | **Fixed** — added 2 design-doc paths |

### Files modified

- `AGENTS.md`: 280 → 307 lines (+27)
- `CLAUDE.md`: 321 → 348 lines (+27)

Mirror-identity preserved: `diff <(awk '/GTL_BOOTLOADER_START/,/GTL_BOOTLOADER_END/' AGENTS.md) <(awk '/GTL_BOOTLOADER_START/,/GTL_BOOTLOADER_END/' CLAUDE.md)` returns zero diff.

### SPEC_METHOD discipline check

History-phrase scan over the bootloader region returned 0 hits for `now`,
`newly`, `previously`, `formerly`, `extends to`, `has been added`, `recently`,
`in rc.[0-9]`. Each addition is present-tense, names a carrier or pins a rule
in one sentence, and points at deeper detail through Section 8 references.

### Verification

- `npm run lint:semantic`: exit 0
- `node --test test_env/tests/test_m04_bootloader_integration.test.mjs test_env/tests/t020-m04-bootloader-negative.test.mjs`: 5/5 pass
- Bootloader rc.6 vocabulary line count: 0 → 8 (representative carriers and predicates appear; non-exhaustive by SPEC_METHOD compactness rule)
- `git diff --check`: clean
- Bootloader-region byte-identity between `AGENTS.md` and `CLAUDE.md`: confirmed

