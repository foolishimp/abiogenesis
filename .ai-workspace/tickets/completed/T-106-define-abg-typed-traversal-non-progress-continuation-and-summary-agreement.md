---
id: T-106
title: Define ABG typed traversal non-progress continuation and public summary agreement
type: bug
ticket_category: runtime_traversal_non_progress
status: completed
review_status: closed_ratified_abg_substrate_scope
goal: make silent or non-progress F_P traversal attempts become ABG-owned typed continuation truth rather than downstream-local retry or triage policy
change_intent: Repair the traversal layer so an F_P graph-vector attempt that produces no artifact, report, stdout, stderr, or progress signal emits a typed ABG non-progress carrier with replay-derived retry or stop action, and every public/consumer summary renders that same action.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG supervised actor invocation, F_P dispatch outcome, retry frontier, continuation projection, public start/gaps projection, downstream odd_sdlc worker failure consumption, live data_mapper test66 resume
priority: critical
build_tenant: typescript
triaged_at: 2026-05-03T12:00:00+10:00
created_at: 2026-05-03T12:00:00+10:00
updated_at: 2026-05-03T13:32:16+10:00
closed_at: 2026-05-03T13:32:16+10:00
closure_scope: ABG substrate scope only
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-084 completed ABG-owned F_P result ingest retry and continue loop
  - T-087 completed supervised process actor invocation over one F_P dispatch
  - T-098 completed full retry frontier projection
  - T-099 completed typed F_P stage carriers and admission flow
  - T-100 completed zoomed workspace-asset obligation schedule and foldback evaluation
  - T-103 completed graph-span foldback and reentry frontier
  - T-104 completed cross-workspace output allocation
related_tickets:
  - odd_sdlc T-102/T-109 consume ABG RC6 traversal, ledger, and reentry substrate
  - odd_sdlc follow-up consumer ticket required before source-level odd_sdlc patches
  - future traversal modulation ticket seeded by the strategy post below
related_strategy:
  - .ai-workspace/comments/codex/20260503T115921AEST_STRATEGY_traversal_modulation_and_intent_affect.md
evidence_refs:
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260502T163843237Z_pid31949/worker_process_summary.json
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260502T163843237Z_pid31949/gap_dossier.json
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260502T163843237Z_pid31949/run.json
  - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/installed_operator.ts
  - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/projection/query_domain.ts
candidate_requirement_authority:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/product/REQ-P-POLICY.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md
intake_source: Operator confirmed that the test66 failure exposes an ABG traversal-layer bug, not merely an odd_sdlc prompt or adapter issue. The required rule is that an F_P traversal attempt must either produce an artifact/progress carrier for admission and ledger fold, or emit a typed retry/non-progress path whose carrier and public summary agree.
target_truth: ABG classifies supervised F_P non-progress as typed runtime truth and projects one authoritative next action. A downstream product receives and displays that ABG projection; it does not infer retryability from local shard presence, local dossier shape, CLI status labels, or prompt conventions.
superseded_truth: Downstream products such as odd_sdlc locally decide whether silent F_P inactivity is same-edge retry, triage, review, or inspect-archive, causing the typed carrier, run summary, and gaps projection to disagree.
source_closure_boundary: T-106 closes for ABG source scope when ABG requirements, design, code, and TypeScript proof establish typed traversal non-progress carrier/projection truth. Downstream odd_sdlc source changes require a downstream consumer ticket. The existing test66 workspace remains the cross-repo empirical proof gate for the consumer patch, not a reason for ABG to absorb odd_sdlc-local code.
downstream_boundary_status: odd_sdlc consumer work remains outside T-106 closure and must consume the stable ABG projection under downstream ticket authority.
closure_law: Close only when ABG has requirement/design/code proof that no-progress F_P traversal attempts produce a typed replay-visible carrier, retry/continuation eligibility is derived from ABG policy/frontier truth, and public summaries render the same projected action. Cross-repo closure of the live bug additionally requires odd_sdlc to consume that ABG projection and prove test66 can be patched in place and restarted from its existing state without recreating the workspace.
non_closure_conditions:
  - retryability is derived from downstream-local concepts such as odd_sdlc execution shard count
  - CLI/start/gaps summaries derive next action through separate hardcoded mappings
  - silent no-progress is collapsed into opaque runtime failure without retry/continuation carrier detail
  - a valid artifact produced before transport failure is discarded instead of going through deterministic admission
  - a second or exhausted no-progress attempt loops privately rather than emitting replay-visible stop/escalation truth
  - odd_sdlc fixes the symptom by adding a private controller loop or prompt-only chunking policy
  - F_D envelope checks replace F_P semantic evaluation of requirement-to-result content
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run test:t087
  - npm run test:t098
  - npm run test:t100:unit
  - npm run test:t103
  - npm run test:t106
  - npm run test:semantic
  - downstream odd_sdlc focused consumer tests after package patch
  - patched data_mapper.test66.TS.cl start from existing workspace state
design_refinements_required:
  - compose T-106 per-attempt action projection with T-103 graph-span reentry frontier instead of duplicating graph reentry law
  - map T-106 timeout classes to the T-100 retryable runtime failure allowlist
  - preserve ABG source closure boundary while tracking odd_sdlc consumer proof separately
  - retain REQ-R-ABG3-TRANSPORT.md as requirement authority or explicitly update its scope during AC-1
  - define inspect_runtime_archive as terminal stop or F_H-gated pause before implementation
---

# T-106: ABG Typed Traversal Non-Progress Continuation And Summary Agreement

## STDO Triage

### First Missing Layer

Requirement.

ABG already owns supervised process actor events, result artifact admission,
continuation, retry frontier projection, and graph-span reentry. The missing
runtime law is the specific no-progress F_P traversal case:

```text
F_P dispatch starts
worker emits no result artifact
worker emits no report
worker emits no stdout/stderr/progress signal
supervisor terminates on inactivity
```

That condition is not a semantic failure of the graph vector. It is not proof
that the source obligations cannot be transformed into the target artifact. It
is a runtime non-progress fact about the attempt.

ABG must classify that fact and project the lawful next action.

### Lawful Re-Entry

`requirement_reprice`.

The current ABG requirement surface names retry, continuation, convergence,
projection, transport, and replay truth. It does not yet explicitly require a
typed traversal non-progress carrier that downstream products must consume as
the authority for retry/triage/stop summaries.

This is therefore not only a local realization refactor. The runtime law needs
to be explicit before the odd_sdlc consumer is patched.

## Observed Failure

The live `data_mapper.test66.TS.cl` run reached:

```text
graph_function: bootstrap_release_self_test
edge: derive_implementation_module_surface
vectorIndex: 10
```

The worker process was launched and supervised. The archive records:

- prompt file exists
- `worker_stdout.log` is empty
- `worker_stderr.log` is empty
- no `implementation_module_surface.md`
- no `worker_result_report.json`
- inactivity timeout at about 600 seconds
- `SIGTERM`
- exit status `143`

The downstream odd_sdlc carrier then recorded:

```text
code: silent_worker_inactivity
reasonClass: worker_runtime
lawfulReentryPoint: triage_gap
retryEligible: false
nextLawfulActions: ["triage_gap"]
```

But the run summary also recorded:

```text
nextLawfulAction: retry_same_edge_with_gap_dossier
```

And the public `gaps` projection reported a generic review path.

The immediate defect is not that the worker failed. The defect is that runtime
non-progress does not have one ABG-owned action projection consumed by all
surfaces.

## Required Runtime Rule

For an F_P traversal attempt, ABG must produce one of:

```text
artifact_or_progress_admitted
typed_same_edge_retry
typed_continuation_yield
typed_retry_exhausted
typed_reentry_or_reprice
typed_runtime_blocked
```

The selected action must be replay-derived and public-summary-safe.

No downstream product may independently infer a different action from:

- process exit code
- presence or absence of execution shards
- latest local gap dossier
- CLI status label
- prompt text

## Boundary Rule

ABG owns:

- process actor lifecycle truth
- runtime non-progress classification
- retry/continuation eligibility projection
- retry budget exhaustion projection
- public start/gaps action agreement
- preservation/salvage of valid artifacts produced before transport failure

Downstream products own:

- domain obligation meaning
- semantic F_P/F_H evaluation of `A.req_i -> B.result_i`
- domain-specific policy preferences consumed through declared policy/hook
  surfaces
- display text that renders ABG-projected action truth

Downstream products do not own:

- a private retry loop
- local retryability classification
- hidden chunking policy as prompt-only truth
- closure or stop truth that contradicts ABG projection

## Target Design Shape

The TypeScript ABG design should define a carrier shape equivalent to:

```ts
interface TraversalNonProgressCarrier {
  readonly kind: "traversal_non_progress";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly attemptIndex: number;
  readonly workerBindingRef: string;
  readonly processInvocationRef: string;
  readonly elapsedMs: number;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly progressSignalCount: number;
  readonly artifactObserved: boolean;
  readonly reportObserved: boolean;
  readonly timeoutClass: "inactivity_timeout" | "hard_timeout" | "transport_exit";
  readonly signalSequence: readonly string[];
  readonly evidenceRefs: readonly string[];
}
```

and a projected action equivalent to:

```ts
interface TraversalContinuationActionProjection {
  readonly kind: "traversal_continuation_action_projection";
  readonly basisId: string;
  readonly vectorIndex: number;
  readonly action:
    | "retry_same_edge"
    | "yield_same_edge_continuation"
    | "retry_exhausted"
    | "inspect_runtime_archive"
    | "reprice_runtime_policy"
    | "blocked";
  readonly retryEligible: boolean;
  readonly reasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}
```

Exact names may change during design. The roles may not collapse.

## Design Refinements From Initial Review

The initial STDO review accepted the ticket shape and requested five refinements
for design before implementation.

### R-1: Compose With T-103, Do Not Duplicate It

T-103 already owns graph-span foldback and graph reentry frontier decisions:

```text
advance | reenter | constitutional_reentry | reprice | block
```

T-106 is narrower. It owns one F_P attempt's runtime non-progress decision
before a graph-span semantic assessment exists.

Design must therefore state the composition rule:

- `retry_same_edge` is a per-attempt continuation action. It should route
  through the existing retry/continuation mechanism for the current vector.
- T-103 `reenter` is graph-span control after admitted semantic span/foldback
  evidence exists.
- T-106 must not emit graph-span reentry events merely because a worker was
  silent.
- If T-106 produces a terminal runtime block, T-103 may later consume that fact
  as evidence, but T-106 does not replace T-103 frontier projection.

The design doc must cross-reference
`M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md` and name the runner composition
point.

### R-2: Map Timeout Classes To T-100 Retry Allowlist

T-100 uses the retryable runtime failure allowlist:

```text
transport_failure | no_output | contract_failure
```

T-106 timeout classes must map into that existing vocabulary rather than create
a second retry taxonomy.

Initial mapping for design:

| T-106 timeout class | T-100/runtime failure class | Rule |
| --- | --- | --- |
| `inactivity_timeout` | `no_output` | no artifact, no report, no stdout/stderr/progress signal |
| `hard_timeout` | `transport_failure` | process exceeded hard runtime boundary before admissible result |
| `transport_exit` | `transport_failure` | abnormal process exit before admissible result |
| invalid report/artifact after output exists | `contract_failure` or `payload_contract_failure` | not a timeout class; determined by result/admission failure |

If a valid artifact exists after transport failure, artifact salvage/admission
precedes retry classification.

### R-3: Preserve Cross-Repo Boundary

T-106 is an abiogenesis source ticket. It should not silently own odd_sdlc
source changes.

Closure split:

- ABG source closure: requirements/design/code/tests prove typed non-progress
  carrier and action projection.
- odd_sdlc consumer closure: separate downstream ticket consumes the ABG action
  projection and removes local next-action disagreement.
- empirical proof: the existing `data_mapper.test66.TS.cl` workspace is patched
  in place and resumed after the consumer patch.

This follows the T-103/T-109 split: substrate first, downstream consumer proof
second.

### R-4: Requirement Authority Check

`specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md` exists and remains a
valid candidate authority surface for supervised process actor non-progress,
artifact salvage, and transport failure classification.

AC-1 should update or cite it explicitly alongside retry, continuation,
convergence, events, projection, and assurance law.

### R-5: Define `inspect_runtime_archive`

The action `inspect_runtime_archive` is not yet a settled runtime decision term.

Design must decide one of:

1. Terminal runtime stop:
   - public projection says inspection is required
   - no retry is planned
   - resume requires a new admitted operator action

2. F_H-gated pause:
   - public projection says inspection is waiting on human review
   - an F_H gate/event is required before retry/stop can be projected

The implementation must not leave `inspect_runtime_archive` as a vague escape
hatch. If it is terminal, it must not pretend to be retryable. If it is
non-terminal, it must cite the F_H gate and event truth.

## Relationship To Traversal Modulation Strategy

This ticket is the immediate bug fix. It is not the whole traversal modulation
feature.

The broader strategy post proposes typed traversal modulation for steel-thread,
layered build, by-obligation, by-feature, gap-repair, and future intent-affect
control pressure. That belongs in a follow-on ticket if accepted.

T-106 only requires enough substrate law to make no-progress F_P attempts
truthful and replayable:

```text
artifact/progress -> admit and fold
no artifact/progress -> typed retry/continuation/stop action
all summaries -> same projected truth
```

## Implementation Targets

Expected TypeScript code areas:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_repair.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- public command/result projection surfaces that render start/gaps summaries

Expected downstream consumer areas after ABG patch:

- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/installed_operator.ts`
- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/projection/query_domain.ts`
- installed package copy in
  `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/node_modules/`

## Acceptance Criteria

- AC-1: Requirement/design wording names typed traversal non-progress as ABG
  runtime law.
- AC-2: ABG emits or derives a typed carrier for F_P no-progress attempts with
  process, attempt, lineage, timeout, stream, artifact/report, and evidence
  facts.
- AC-3: ABG projects one authoritative action for the no-progress attempt.
- AC-4: Retry eligibility is derived from ABG policy/frontier truth, not
  downstream-local execution shard count or latest dossier shape.
- AC-5: Public start/gaps style summaries render the same action as the carrier.
- AC-6: Valid artifact salvage remains preserved when a transport failure
  occurs after a result artifact exists.
- AC-7: Repeated no-progress attempts exhaust or escalate through replay-visible
  truth; they do not loop privately.
- AC-8: odd_sdlc consumes ABG projected action truth and stops producing
  carrier/summary disagreement.
- AC-9: Existing T-082/T-100/T-103/T-104 proof lanes remain green.
- AC-10: The existing `data_mapper.test66.TS.cl` workspace can be patched in
  place and `start` can resume from the current vector without recreating the
  folder after the downstream odd_sdlc consumer ticket lands.

## Implementation Evidence

Implemented on 2026-05-03 for ABG source scope.

Requirement authority updated:

- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
  - `REQ-R-ABG3-TRANSPORT-020`
  - `REQ-R-ABG3-TRANSPORT-021`
  - `REQ-R-ABG3-TRANSPORT-022`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
  - `REQ-R-ABG3-RETRY-007`
  - `REQ-R-ABG3-RETRY-008`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
  - `REQ-R-ABG3-PROJECTION-011`

Design/module authority added:

- `build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/README.md`

Code surfaces added or updated:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_non_progress.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/package.json`

Proof surface added:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_t106_traversal_non_progress_continuation.test.mjs`

The implementation keeps the source-scope boundary:

- `TraversalNonProgressCarrier` is a pure replay-derived fact carrier over
  actor invocation, process, stream, timeout, artifact/report/progress, and
  evidence truth.
- `TraversalContinuationActionProjection` is the single action truth consumed
  by summaries.
- `deriveTraversalContinuationSummary(...)` and
  `assertTraversalContinuationSummaryAgreement(...)` prevent public summary
  action drift.
- `deriveTraversalContinuationActionProjection(...)` re-derives and validates
  the supplied carrier against replay truth before projecting an action, so a
  caller cannot forge a downstream-local no-progress carrier.
- `engine_runner.ts` consumes the projection on blocked/no-artifact F_P
  dispatch outcomes. Silent process truth can now drive same-edge retry through
  ABG retry events; missing process evidence renders
  `inspect_runtime_archive` through the same summary/action path.
- timeout classes map through the T-100 retry taxonomy.
- artifact/report salvage is preserved before no-progress classification.
- T-103 graph-span re-entry remains separate from T-106 per-attempt retry or
  stop projection.

Initial verification on 2026-05-03:

- `npm run lint:semantic`: passed
- `npm run test:t087`: passed, 4/4
- `npm run test:t098`: passed, 2/2
- `npm run test:t100:unit`: passed, 8/8
- `npm run test:t103`: passed, 24/24
- `npm run test:t106`: passed, 7/7
- `npm run test:semantic`: passed, 361/361

Review-fix verification on 2026-05-03:

- `git diff --check`: passed
- `npm run lint:semantic`: passed
- `npm run test:t087`: passed, 4/4
- `npm run test:t098`: passed, 2/2
- `npm run test:t100:unit`: passed, 8/8
- `npm run test:t103`: passed, 24/24
- `npm run test:t106`: passed, 14/14
- `npm run test:semantic`: passed, 368/368

Review findings fixed:

- runner/code-path coverage: fixed by wiring T-106 into the blocked/no-artifact
  F_P runner path and adding runner tests
- forged-carrier drift: fixed by replay validation inside
  `deriveTraversalContinuationActionProjection(...)`
- branch coverage: fixed for `blocked`, `reprice_runtime_policy`,
  `stationary_retry`, report-ref rejection, progress signal, stderr progress,
  inferred hard timeout, inferred transport exit, and clean no-output exit

Downstream boundary still open by design:

- odd_sdlc must consume the ABG projection under its own downstream consumer
  ticket before the live `data_mapper.test66.TS.cl` workspace can be patched in
  place and resumed.

## Closure Review

Closed on 2026-05-03 for ABG substrate scope after STDO implementation review
ratified the runner integration, action projection, summary-agreement gate, and
expanded regression proof. The ABG source ticket is complete because the typed
carrier/projection law is now requirement-backed, design-backed, exported,
runner-consumed, and covered by focused and semantic tests.

This closure does not close downstream odd_sdlc consumer work, live
`data_mapper.test66.TS.cl` patch/resume, or public `odd-sdlc-ts` summary
alignment. Those remain downstream-product proof obligations.

## Initial Proof Plan

1. Add ABG unit tests for no-progress F_P attempt projection.
2. Add ABG runner/projection test proving public action agreement.
3. Add negative test proving downstream-style latest/local action cannot be
   admitted as full ABG action truth.
4. Patch odd_sdlc consumer to render ABG action truth.
5. Build and test ABG TypeScript.
6. Build and test odd_sdlc TypeScript focused lanes.
7. Patch `data_mapper.test66.TS.cl` in place.
8. Run `odd-sdlc-ts start` from current workspace state.
