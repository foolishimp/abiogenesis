# B-029 Project continuation-owned yield truth instead of failure-shaped public status

- id: B-029
- title: Project continuation-owned yield truth instead of failure-shaped public status
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: lawful-yield-projection-for-open-continuations
- change_intent: Rebind ABG public control and runtime result projection so continuation-owned retry, repair, and review states project as lawful yield truth instead of failure-shaped public status whenever a governed next step already exists.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: critical
- dependencies:
  - B-009 completed
  - B-022 completed
  - B-027 completed
- intake_source: RC forensic comparison over data_mapper.test35 and data_mapper.test36; downstream odd_sdlc bug triage; operator clarification 2026-04-22 that F_P progression semantics are complete-or-yield with governed iteration, not operator-facing terminal error when lawful continuation truth exists
- affected_boundary: ABG dispatch runtime, result-ingest continuation projection, public `gen-start`/`gen-iterate` control plane, CLI adapter stop classification, run/live-status projection, and installed downstream operator surfaces consuming ABG status
- triaged_at: 2026-04-22
- created_at: 2026-04-22
- updated_at: 2026-04-22
- authoritative_contract: `genesis.continuation.YieldedContinuationContract` plus `run_yielded` event truth and its public runtime/control projection become the one authoritative carrier family for continuation-owned retry/repair/review outcomes; failure-shaped public status is lawful only when no continuation-owned next step exists
- old_path_classification: `dispatch_runtime` return payloads for continuation-opened failure branches=`replace`; `cli_adapter` failure-default projection after non-yield dispatch result=`replace`; downstream product workarounds over failure-shaped status=`demote after ABG fix`
- governing_design:
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md
  - build_tenants/abiogenesis/python/design/adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md
- constitutional_requirements:
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/product/REQ-P-POLICY.md
- links:
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/product/REQ-P-POLICY.md
  - build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py
  - build_tenants/abiogenesis/python/code/genesis/result_ingest.py
  - build_tenants/abiogenesis/python/code/genesis/cli_adapter.py
  - build_tenants/abiogenesis/python/code/genesis/live_status.py
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/B-036-public-start-next-collapses-lawful-proof-yield-continuation-into-operator-facing-failure-projection.md
- target_truth: when ABG opens a continuation because a lawful next step exists, `YieldedContinuationContract` plus `run_yielded` become the one authoritative source carrier for the public runtime/control result; retry, repair, and fh-review continuations are continuation-owned progression seams, not public terminal failure
- superseded_truth: ABG currently emits continuation-owned truth in events but still returns failure-shaped public status from dispatch/control boundaries in paths such as retry continuation after transport/runtime failure, allowing downstream products to see `status=error` and `stopped_by=fp_runtime_failure` even though continuation truth exists
- closure_law: this ticket closes when continuation-owned retry, repair, and review paths project as lawful yield at the ABG source public boundary, source proofs cover both positive yielded cases and negative no-continuation failures, and the source release cut is published; downstream install validation is release qualification and reopens this ticket only if the installed consumer still exposes a source regression
- evaluation_criteria:
  - public ABG runtime/control surfaces distinguish true failure with no lawful continuation from continuation-owned yielded states
  - when runtime emits `continuation_opened` and a governed next step exists, public status projects `yield` rather than failure-shaped status
  - the yielded public contract exposes continuation identity, continuation kind, failing or blocked boundary, and lawful next-step handle without event-log archaeology
  - run/live-status projection agrees with the yielded public contract
  - source proofs cover retry, repair, and fh-review continuation families, and the release note records downstream install validation as reopen-only qualification
  - if proof discovers that requirements are insufficiently explicit about continuation-owned yield projection, that gap is repriced explicitly rather than patched as silent local precedent
- non_closure_conditions:
  - ABG still returns `status=error` or `stopped_by=fp_runtime_failure` when `continuation_opened` already exists for the same public run/call and a lawful next step exists
  - events project yielded or continuation-opened truth while public status projects failure-shaped output
  - retry continuation remains classified as public failure even though the runtime already opened a retry continuation
  - review can only defend the implementation by local controller convenience rather than the constitutional requirement anchors listed above
- proof_surface:
  - source reproducer for retry continuation in `dispatch_runtime.py` proving public yield projection
  - source reproducer for proof-driven repair continuation in `result_ingest.py` proving public yield projection
  - source reproducer for fh-review continuation proving public yield projection
  - negative proof that true runtime/config defect with no lawful continuation still returns failure-shaped public status
  - release qualification note documenting that downstream installed validation follows the published source cut and reopens this ticket only if the installed consumer exposes a source regression

## Triage Position

Current triage stance:

- this appears to be an implementation bug against existing requirement truth,
  not a fresh requirement hole
- the requirement authority is already explicit in:
  - `REQ-R-ABG3-RUN-007`
  - `REQ-R-ABG3-CONVERGENCE-009`
  - `REQ-R-ABG3-EVENTS-008`
  - `REQ-P-POLICY-004`
- if implementation proof shows those requirements are still too weak or
  ambiguous for retry/repair/review continuation families, repricing must be
  explicit and must not be smuggled in as controller precedent

## Migration Declaration

- old_truth_path: ABG emits `continuation_opened` for retry, repair, and
  `fh_review`, but runtime/control adapters still project failure-shaped public
  status from local return payloads and default stop classification
- new_truth_path: ABG public status projects one continuation-owned yield
  contract whenever a lawful continuation exists, while preserving
  failure-shaped public status only when no continuation-owned next step exists
- producers_old:
  - `dispatch_runtime.dispatch_bound_manifest_via_transport(...)`
  - `result_ingest.ingest_fp_result(...)`
  - `cli_adapter._run_start_until_converged(...)`
- producers_new:
  - `continuation.YieldedContinuationContract`
  - `dispatch_runtime.dispatch_bound_manifest_via_transport(...)` retry yield projection
  - `result_ingest.ingest_fp_result(...)` repair / `fh_review` yield projection
  - `run_yielded` event truth
- consumers_old:
  - `cli_adapter._run_start_until_converged(...)`
  - downstream product `start(next)` control surfaces
  - operator/runtime inspection over failure-shaped ABG status
- consumers_new:
  - `gen-start` and `gen-iterate` public control surfaces
  - `live_status.project_live_run_status(...)`
  - `run.run_state(...)`
  - downstream product control surfaces consuming ABG yielded continuation
    truth
  - operator/live-status review over yielded continuation contract
- derived_surfaces:
  - `.ai-workspace/events/events.jsonl`
  - run projection / live-status projection
  - continuation projection
  - public runtime/control result payloads

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection and read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old and new behavior are removed or repriced
- [ ] ticket wording, design wording, requirement wording, and proof claims are reconciled before closure

## Context

The downstream odd_sdlc investigation exposed two distinct layers:

1. downstream products may misproject ABG continuation-owned truth
2. ABG itself still contains failure-shaped public return payloads in paths
   where continuation truth already exists

The strongest current substrate example is the retry-continuation branch in
`dispatch_runtime.py`, which emits:

- `worker_turn_failed`
- `graph_call_failed`
- `continuation_opened(kind=retry)`

but then returns:

- `status: error`
- `stopped_by: fp_runtime_failure`

This is not just a downstream consumption bug. It is an ABG public-semantics
bug.

## Concrete Authoritative Seam

The authoritative continuation-owned public seam for this migration is:

1. `continuation_opened` event truth
2. typed `YieldedContinuationContract` in `genesis/continuation.py`
3. `run_yielded` event truth for the owning run
4. public runtime/control projection returned by:
   - `dispatch_runtime.dispatch_bound_manifest_via_transport(...)`
   - `result_ingest.ingest_fp_result(...)`
   - `cli_adapter._run_start_until_converged(...)`

That seam is the source truth for continuation-owned retry/repair/review
projection.

This ticket does **not** close on a controller-local wrapper in `cli_adapter.py`
or a local `.get(...)` classification branch. The carrier/module boundary above
must become authoritative.

## Constitutional Anchors

The current live requirement surface already says this should not happen:

- [REQ-R-ABG3-RUN-007](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-RUN.md:28)
  - if callable work must hand off unresolved non-blocking observer truth to
    the next lawful layer, the run projects as yielded rather than completed
- [REQ-R-ABG3-CONVERGENCE-009](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md:33)
  - materially advanced constructive work with unresolved non-blocking
    post-transform truth must surface as yielded handoff truth rather than
    blocker-class failure
- [REQ-R-ABG3-EVENTS-008](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-EVENTS.md:30)
  - yielded handoff truth and causing observer facts must be emitted as
    authoritative event truth
- [REQ-P-POLICY-004](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-POLICY.md:23)
  - public `gen-start` control modes must treat yielded handoff truth as a
    lawful control seam and must not flatten it into terminal success or
    blindly redispatch

This ticket exists because current implementation no longer matches that
constitutional chain cleanly.

## Process-Model Declaration

For this boundary, the strong semantic rule is:

- the meaningful public outcomes are `complete`, `yield`, or true failure with
  no lawful continuation
- proof failure, retry need, or review need do not themselves create public
  terminality when the runtime already opened a continuation-owned next step
- if continuation-owned next-step truth exists, the public surface must project
  `yield`

So the defect is public misprojection of continuation-owned truth, not a claim
that every internal failure becomes success.

## Functional Review Criteria

Review this ticket as a continuation-owned yield-projection migration.

Every review pass must ask:

1. Did the slice remove a failure-shaped public projection where continuation
   truth already existed?
2. Is continuation meaning carried by one typed runtime/public projection
   rather than duplicated across dispatch return payloads, CLI control logic,
   and downstream products?
3. Does the public result distinguish true failure with no lawful continuation
   from yielded continuation-owned progression?
4. Under `DESIGN_MODULE_METHOD.md`, is the runtime semantic center still the
   typed continuation/run/event truth rather than controller-local if/else
   projection?
5. Are effects and event writes still edge-owned, with semantic
   classification derived from those admitted facts rather than local fallback
   defaults?
6. Do tests prove both positive continuation-yield cases and negative true
   failure cases?
7. Does the implementation keep the ABG source boundary singular so any
   downstream failure after release is a release-validation regression rather
   than a second semantic center left open in source?

Passing tests are not enough if the implementation still preserves a rival
failure-shaped semantic center in controller code.

## Impacted Interface Review Checklist

- [x] `dispatch_runtime.dispatch_bound_manifest_via_transport(...)` no longer returns failure-shaped public status when it opens `continuation_opened(kind=retry)`
- [x] `result_ingest.ingest_fp_result(...)` no longer returns failure-shaped public status when it opens `continuation_opened(kind=repair)`
- [x] `result_ingest.ingest_fp_result(...)` no longer returns failure-shaped public status when it opens `continuation_opened(kind=fh_review)`
- [x] `cli_adapter._run_start_until_converged(...)` consumes the continuation-owned yield contract rather than repairing substrate semantics locally
- [x] run projection consumes `run_yielded` truth for continuation-owned states and no longer depends on mixed `run_failed + continuation_opened` for current-line proof
- [x] live-status projection agrees with run/continuation truth for yielded continuation-owned states
- [ ] requirement anchors remain sufficient; if not, requirement repricing is opened explicitly rather than hidden in implementation commentary

## Required Break Order

1. write source proof reproducer for retry continuation currently projected as failure-shaped public status
2. project continuation-owned retry truth through one typed public yield carrier instead of error return payload
3. reprice repair and fh-review continuation branches to the same public yield contract
4. prove true failure with no lawful continuation still projects failure
5. prove run/live-status/read-model surfaces agree with the yielded public contract
6. publish the source release cut and treat downstream install validation as reopen-only evidence rather than a source closure blocker

## Break Contract

### Break 1

- seam severed: acceptance of `continuation_opened(kind=retry)` plus failure-shaped public status as a lawful mixed state
- expected negative proof: if retry continuation opens, source proof must fail unless the public result is yielded

### Break 2

- seam severed: `dispatch_runtime.py` local error return payload as authoritative retry-semantics surface
- expected negative proof: retry continuation can no longer emit `run_failed` plus `status=error` in normal execution

### Break 3

- seam severed: `result_ingest.py` local error return payload as authoritative repair / `fh_review` semantics surface
- expected negative proof: repair and `fh_review` continuations can no longer emit `run_failed` plus failure-shaped public status in normal execution

### Break 4

- seam severed: over-broad yield classification that would flatten true runtime/config defect into yielded continuation
- expected negative proof: true runtime/config defect with no lawful continuation still emits failure-shaped public status and no counterfeit yield contract

### Break 5

- seam severed: rival run/live-status summaries that disagree with continuation-owned yielded truth
- expected negative proof: run projection or live-status cannot remain failed/terminal while the public result and continuation carrier are yielded for the same live run

## Break-To-Closure Map

- Break 1 closes the direct reproduction clause
- Breaks 2-3 close the public-yield semantic clause
- Break 4 closes the negative-proof clause
- Break 5 closes the projection-alignment clause
- Break 6 closes the source release-publication clause and moves downstream validation to reopen-only release qualification

## Mixed-State Negative Proof

Closure requires proof that this mixed state is impossible:

1. `continuation_opened` exists for the current public run/call
2. a lawful next-step contract exists for that continuation
3. ABG public status still reports only failure-shaped output

If that mixed state is still observable, this ticket remains open.

## Initial Design Diagnosis

The likely current semantic split is:

- event and continuation law in `result_ingest.py` / `dispatch_runtime.py`
- failure-default projection in `dispatch_runtime.py` and `cli_adapter.py`
- downstream products repairing the mismatch locally

That is not lawful under the prime-law / no-semantic-center rules.

The intended end state is:

- one continuation-owned runtime truth
- one public yield projection over that truth
- failure projection only when no continuation-owned next step exists

## Progress Notes

### 2026-04-22 — Source Continuation-Yield Contract Landed

Source-side implementation is now materially advanced:

- `continuation.py` publishes a typed `YieldedContinuationContract`
- `dispatch_runtime.py` retry continuation no longer emits `run_failed` plus
  failure-shaped public status; it emits `run_yielded` and returns yield
  projection
- `result_ingest.py` repair and `fh_review` continuations no longer emit
  `run_failed` plus failure-shaped public status; they emit `run_yielded` and
  return yield projection
- `cli_adapter.py` already consumed yielded dispatch truth lawfully; the new
  proof now covers retry continuation explicitly

Targeted source proof is green:

- `test_dispatch_runtime_emits_failure_graph_call_and_continuation`
- `test_dispatch_runtime_retry_continuation_projects_live_status_as_yielded`
- `test_ingest_unadmitted_ledger_fails_proof_and_opens_fh_review`
- `test_ingest_requires_target_binding_materialization_before_success_lifecycle`
- `test_ingest_applies_declared_target_certification_hook_before_closure`
- `test_ingest_repair_continuation_projects_live_status_as_yielded`
- `test_run_start_until_converged_surfaces_retry_continuation_as_yield`
- `test_run_start_until_converged_surfaces_engine_dispatch_failure_without_shadow_booleans`

This did not count as closure yet while the negative proof remained open.

The source break status is currently:

- Break 1 landed in source proof
- Break 2 landed in `dispatch_runtime.py`
- Break 3 landed in `result_ingest.py`
- Break 5 is now green on source run/live-status proof
- Breaks 4 and 6 remained open until the broader negative proof and release disposition were repriced

### 2026-04-22 — Negative Proof Hardened, Downstream Lane Demoted To Release Qualification

The remaining source semantic gap was real: retry yield had been widened too
far, so a true no-continuation defect could still counterfeit yielded public
status.

This is now fixed in source:

- `transport.resolve_agent_contract(...)` preflights local transport-contract
  validity before a worker turn starts
- `dispatch_runtime.py` now opens retry continuation only for retry-eligible
  failure classes (`transport_failure`, `no_output`, `contract_failure`)
- `policy_config_defect` and `runtime_defect` now remain fail-closed terminal
  runtime truth with no `continuation_opened` and no `run_yielded`

New negative proof is green:

- `test_dispatch_runtime_classifies_missing_local_transport_contract_as_policy_config_defect`
- `test_dispatch_runtime_runtime_defect_stays_terminal_without_retry_continuation`
- `test_run_start_until_converged_surfaces_engine_dispatch_failure_without_shadow_booleans`

The repriced positive bundle is also green:

- `test_dispatch_runtime_emits_failure_graph_call_and_continuation`
- `test_dispatch_runtime_retry_continuation_projects_live_status_as_yielded`
- `test_ingest_unadmitted_ledger_fails_proof_and_opens_fh_review`
- `test_ingest_requires_target_binding_materialization_before_success_lifecycle`
- `test_ingest_applies_declared_target_certification_hook_before_closure`
- `test_ingest_repair_continuation_projects_live_status_as_yielded`
- `test_run_start_until_converged_surfaces_retry_continuation_as_yield`

Per operator instruction on 2026-04-22, downstream installed odd_sdlc proof is
not a source closure blocker for B-029. It is release qualification that
reopens the ticket only if the installed consumer still exposes a source
regression after publication.

### 2026-04-22 — Source Closure Ready For RC Publication

B-029 is source-closure complete on the current ABG line:

- positive continuation-owned yield paths are green
- negative no-continuation failure paths are green
- the source ticket no longer stays open for downstream install qualification

The release action for this closure is the next `abiogenesis` `v3.3.0` RC cut.
If downstream installed validation exposes the old failure-shaped status after
that publication, this ticket reopens as a release regression.
