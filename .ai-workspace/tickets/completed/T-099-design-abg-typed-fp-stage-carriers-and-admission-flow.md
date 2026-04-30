---
id: T-099
title: Design ABG typed F_P stage carriers and admission flow
type: feature
ticket_category: implementation_migration
status: completed
review_status: external_review_accepted_for_abg_rc_downstream_odd_sdlc_gate_deferred
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Define first-class ABG carriers for F_P.transform, admission, evidence observation, evaluation, ledger projection, and closure fold so downstream products do not collapse construction, evaluation, event emission, and closure into one worker report.
change_class: design_reframe
re_entry_point: design
affected_boundary: ABG F_P dispatch/admission, payload ledger, assurance projection, closure fold, plugin contracts, odd_sdlc transform-only worker bridge
priority: high
triaged_at: 2026-04-30T22:30:00+10:00
created_at: 2026-04-30T22:30:00+10:00
updated_at: 2026-05-01T00:15:48+10:00
dependencies:
  - T-088 completed
  - T-090 completed
  - T-091 completed
  - T-092-TS completed
  - T-093-TS completed
  - T-095 completed
  - T-097 completed
governing_library:
  - specification/PRODUCT.md
  - specification/requirements/abg/
  - specification/requirements/gtl/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
governance_scope: STDO Method
intake_source: odd_sdlc T-102 and data_mapper.test59/test60 proved that the TypeScript SDLC lane still relies on a bridge where a transformer can be confused with evaluator, ledger author, and closure witness. The worker result report remains a legacy compatibility carrier rather than a typed ABG F_P stage algebra.
target_truth: ABG owns a typed multi-stage F_P process. Workers perform bounded construction and return transform results. ABG admits payloads and evidence, emits events, projects ledgers, invokes deterministic or probabilistic evaluators as declared plugins, and folds closure from replay-derived truth.
superseded_truth: One F_P worker report can simultaneously serve as transform result, materialization ledger, obligation assessment ledger, runtime event authority, and closure decision.
closure_law: This ticket closes for the ABG source layer when ABG publishes the typed F_P stage carrier design, implements the TypeScript primary carrier path, exposes downstream plugin contracts, and receives external STDO review. odd_sdlc T-102 remains the downstream consumer migration from legacy reports to these carriers.
evaluation_criteria:
  - `F_P.transform_request` and `F_P.transform_result` are distinct admitted carriers.
  - Transform results can carry artifact refs, product deltas, process refs, and declared evidence candidates without granting closure authority.
  - ABG admission emits event truth from admitted transform facts.
  - Evaluation rows are produced by ABG-owned deterministic checks or declared evaluator plugins, not accepted solely from worker self-assessment.
  - Payload, evidence, ambiguity, materialization, and fulfillment ledgers are projected from events/admitted carriers.
  - Closure fold consumes projected ledgers and cannot be overridden by `unresolvedReasons: []`.
  - Downstream products supply domain evaluators and prompt/materialization mapping only.
proof_surface:
  - ABG design document with carrier schemas and sequence diagrams.
  - TypeScript tests for transform-only result admission.
  - TypeScript tests proving worker self-closure is rejected without projected ledger support.
  - odd_sdlc T-102 consumer migration plan.
  - live two-hop data_mapper proof showing transform evidence deepens the next hop and prevents premature convergence.
  - external STDO review before closure.
non_closure_conditions:
  - Leaving `worker_result_report.json` as the architecture carrier.
  - Allowing workers to append authoritative runtime events directly.
  - Allowing workers to close obligations through self-reported empty unresolved reasons.
  - Implementing only odd_sdlc-local bridge logic without ABG carrier authority.
  - Treating deterministic test pass as sufficient without assurance/payload ledger projection.
---

# T-099: ABG Typed F_P Stage Carriers

## STDO Triage

First missing layer: design.

The ABG product boundary already says ABG owns runtime facts, admitted payload
ledgers, total assurance projection, and closure fold. The missing design is
the typed carrier family for an F_P invocation lifecycle.

Downstream `odd_sdlc` has a containment bridge in T-102, but that bridge still
generates legacy reports and keeps too much lifecycle interpretation in the
domain package. This ticket is the upstream substrate correction.

## Target Flow

```mermaid
sequenceDiagram
  participant GTL as GTL GraphFunction
  participant ABG as ABG Runtime
  participant FP as F_P Worker
  participant Plug as Evaluator Plugins
  participant Ledgers as ABG Projections

  GTL->>ABG: traverse vector
  ABG->>FP: F_P.transform_request
  FP-->>ABG: F_P.transform_result
  ABG->>ABG: admit payload and evidence candidates
  ABG->>ABG: emit runtime events
  ABG->>Plug: evaluate admitted evidence
  Plug-->>ABG: evaluation rows
  ABG->>Ledgers: project payload/evidence/assurance/fulfillment
  Ledgers-->>ABG: closure inputs
  ABG->>ABG: fold close/retry/reprice/continue
```

## Downstream Dependency

`odd_sdlc` T-102 is the downstream SDLC plugin migration. It should not close as
the final architecture until this ABG carrier design exists and odd_sdlc can
consume it.

## Solution Design

Engine-first holistic solution reference:

`/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260430T224308AEST_abg_engine_first_holistic_solution.md`

Downstream SDLC symptom reference:

`/Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/codex/20260430T223828AEST_test60_bug_wave_domain_solution.md`

This ticket defines the missing ABG F_P stage algebra. It removes closure
authority from the worker report and makes ABG the runtime owner of admission,
events, projection, and fold.

Current broken shape:

```mermaid
flowchart TD
  Worker[worker] --> Report[worker_result_report.json]
  Report --> Files[materializedFiles]
  Report --> Evidence[executionEvidence]
  Report --> Obligations[obligationAssessments]
  Report --> Closure["unresolvedReasons: []"]
  Closure --> Runtime[downstream runtime treats report as near-truth]
```

Target shape:

```mermaid
flowchart TD
  Request[F_P.transform_request] --> Worker[worker.F_P.transform]
  Worker --> Result[F_P.transform_result]
  Result --> Admit[ABG admit payload/evidence candidates]
  Admit --> Events[ABG events]
  Events --> Projections[payload/evidence/assurance projections]
  Projections --> Eval[evaluator plugins]
  Eval --> Rows[evaluation rows]
  Rows --> Fold[ABG closure fold]
  Fold --> Decision[close/retry/reprice/triage]
```

Design-module checks:

- Authority seam closure: one admitted carrier owns each boundary.
- Prime law: transform request/result, admitted payload, projection, and
  closure decision are the irreducible carrier set.
- Effect-edge rule: worker/process effects are outside semantic closure fold.
- No semantic center: no controller or domain plugin can decide closure outside
  ABG fold truth.

## Implementation Status

TypeScript implementation is in place for the primary carrier path.

- Added `fp_stages.ts` with `FpTransformRequest`, `FpTransformResult`,
  `FpEvidenceCandidate`, transform-result admission, and
  `runtimeEventsForFpTransformResult`.
- `EnginePluginInput` now carries `fpTransformRequest` for F_P plugin calls.
- Attached F_P result ingestion now turns fulfilled transform evidence into
  ABG payload/evidence events through `runtimeEventsForFpTransformResult`
  instead of a worker-report-owned evidence path.
- Attached F_P blocked, runtime-failed, and contract-failed outcomes now enter
  retry progress through request-scoped `FpTransformResult` admission before
  retry rows are emitted.
- `admitFpTransformResultForRequest` rejects result carriers whose request ref,
  actor invocation id, or result ref do not match the active transform request.
- Fulfilled result artifacts with empty `evidence_refs` are rejected at artifact
  admission; a vacuous fulfilled assessment is no longer a structurally valid
  transform result.
- The assurance gate now gives an external provider authority snapshot
  precedence over worker-admitted authority rows. Worker-supplied fulfilled
  evidence can close a vector locally, but cannot override external authority at
  convergence.
- `admitFpTransformResult` rejects closure-authority fields such as
  `runtimeEvents`, `unresolvedReasons`, `nextVectorIndex`, and
  `closedVectorIndexes`.
- Added `test_t099_fp_stage_carriers.test.mjs`.

Verification:

- `npm run build:semantic` passed.
- `node --test test_env/tests/test_t099_fp_stage_carriers.test.mjs` passed.
- Adjacent regressions passed:
  `test_t084_attached_fp_worker_loop.test.mjs`,
  `test_t095_payload_ledger_unit.test.mjs`,
  `test_t094_assurance_register_two_hop_unit.test.mjs`,
  `test_m03_engine_owned_iterate_runner_unit.test.mjs`,
  `t072-m03-plugin-contract-negative.test.mjs`,
  `test_m03_plugin_contract_inventory_unit.test.mjs`.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed at `2026-04-30T23:44:12+10:00`: 304 tests,
  0 failed.
- 2026-04-30 review-response focused proof:
  `node --test test_env/tests/test_t098_retry_frontier_projection.test.mjs
  test_env/tests/test_t099_fp_stage_carriers.test.mjs
  test_env/tests/test_t097_supervised_process_actor.test.mjs` passed 13/13.
- `npm run lint:semantic` passed after the review-response patch.
- `/bin/zsh -ic 'CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=240000 npm run test:t094:live'`
  passed.
- T-094 live archive:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260430T134330381Z`.
  The register shows the first admitted transform artifact can close its local
  hop, while the second hop projects missing execution evidence and forces
  `decision=deepen`. The archive includes `assertions.json`.

Closure disposition:

- External STDO/code review accepted before the `3.4.0-rc.4` cut.
- ABG source-layer closure is accepted for this RC.
- Downstream odd_sdlc T-102 migration from the legacy report bridge to ABG stage
  carriers remains a downstream consumer gate.
