---
id: T-147
title: Realize T-188 runtime-authority invariants in ABG
type: bug
ticket_category: implementation_migration
status: completed
proof_status: passed
goal: close the ABG realization and design gaps surfaced by the T-188 worksite proof instead of leaving shared replay, projection, correction, and payload-authority invariants as local adapter precedent
change_class: design_reframe
re_entry_point: design
created_at: 2026-06-02
updated_at: 2026-06-02
completed_at: 2026-06-02
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - build_tenants/abiogenesis/typescript/design/M03_COMPOSED_C_STAGE_SET_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t147_runtime_authority_invariants.test.mjs
related_tickets:
  - T-098
  - T-133
  - T-144
  - T-145
  - T-146
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-188-force-fp-depth-through-iteration-and-prompt-control.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/backlog/T-189-close-t188-runtime-authority-bug-ledger-and-abg-handoff.md
affected_boundary:
  requirements:
    - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-RETRY.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_COMPOSED_C_STAGE_SET_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t084_attached_fp_worker_loop.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t099_fp_stage_carriers.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t128_construction_runner.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t147_runtime_authority_invariants.test.mjs
  worksite_evidence:
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/installed_operator.ts
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts
target_truth: ABG realizes existing runtime law for replay-stable retry/correction context selection, projection-output admission before closure, and admitted payload/source authority projection. Worksite-specific labels may specialize domain meaning, but they do not become ABG runtime law or local controller authority.
superseded_truth: ABG replay/projection bugs are discovered during live worksite lanes, patched locally in adapters, and later treated as precedent without entering at the first missing ABG layer.
closure_law: This ticket closes only when each defect has first-missing-layer triage, the design entry for projection-output-before-closure is ratified, realization gaps are enforced in TypeScript with deterministic tests, and worksite-specific labels remain local mapping over ABG projections.
non_closure_conditions:
  - retry context freshness is left to worksite-local heuristics
  - projection-only or no-dispatch closure can happen before declared output payload admission
  - ABG imports odd_sdlc, data_mapper, or stack-specific product vocabulary as runtime law
  - closure proof relies on live-run notes without ABG-side deterministic tests
---

# T-147: Realize T-188 Runtime-Authority Invariants In ABG

## Intake Triage

SPEC_METHOD and TICKET_METHOD require first-missing-layer triage before code:

- absent requirement -> `requirement_reprice`
- requirement exists but design does not realize it -> `design_reframe`
- requirement and design exist but code deviates -> `realization_refactor`

No requirement reprice is currently indicated. ABG requirements already govern
retry freshness, correction, payload admission, projection truth, assurance fold,
target-carrier closure, and plugin authority.

The ticket-level change class is `design_reframe` because one defect class
requires a design entry before code is lawful. The implementation work under
that design will be local `realization_refactor`.

## Defect Triage

### 1. Retry context freshness and real-gap precedence

Observed worksite defect:

- same-edge retry could use stale projected context or omit the newest real gap
  evidence.

Governing requirement authority:

- `REQ-R-ABG3-CORRECTION-004`
- `REQ-R-ABG3-PAYLOAD-015`
- `REQ-R-ABG3-PROJECTION-009`
- `REQ-R-ABG3-PROJECTION-010`
- `REQ-R-ABG3-RETRY-002`
- `REQ-R-ABG3-RETRY-004`
- `REQ-R-ABG3-RETRY-007`
- `REQ-R-ABG3-ASSURANCE-024`

Design authority:

- T-098 defines `RetryFrontierProjection` as replay-derived ABG truth, including
  full attempt coverage, reason classes, owner surfaces, evidence refs, and
  rejection of latest-only projections.

First missing layer:

- `realization_refactor`

Required work:

- expose or repair ABG retry-context selection over `RetryFrontierProjection`
  so callers consume replay-derived current frontier truth and stale supplied
  aliases fail closed.

### 2. Projection output before closure

Observed worksite defect:

- no-dispatch or projection-only paths could reach closure checks before the
  declared output payload existed or was ABG-admitted.

Governing requirement authority:

- `REQ-R-ABG3-PAYLOAD-002`
- `REQ-R-ABG3-PAYLOAD-004`
- `REQ-R-ABG3-PAYLOAD-012`
- `REQ-R-ABG3-PAYLOAD-019`
- `REQ-R-ABG3-ASSURANCE-017`
- `REQ-R-ABG3-ASSURANCE-018`
- `REQ-R-ABG3-ASSURANCE-019`
- `REQ-R-ABG3-ASSURANCE-020`
- `REQ-R-ABG3-FN-COMP-021`

Design authority:

- M03 payload-ledger design says payload bodies are external but envelopes are
  ABG truth.
- M03 edge-assurance design says target carrier satisfaction requires admitted
  payload under the selected target carrier contract.
- M03 composed-stage-set design defines stage-set admission/projection order but
  does not explicitly state that declared graph-vector output/projection payload
  admission precedes assurance fold and traversal transition.

First missing layer:

- `design_reframe`

Required work:

- add the composed-stage-set design rule that any declared graph-vector output,
  projection output, or no-dispatch output that can satisfy closure must be
  admitted as payload/target-carrier truth before assurance fold and traversal
  transition.
- then enforce and test that rule in TypeScript.

### 3. Prior source/output authority projection

Observed worksite defect:

- a prior report ref was visible for a required source/output asset, but the
  actual admitted output payload ref was not projected to the next worker.

Governing requirement authority:

- `REQ-R-ABG3-PAYLOAD-002`
- `REQ-R-ABG3-PAYLOAD-003`
- `REQ-R-ABG3-PAYLOAD-004`
- `REQ-R-ABG3-PAYLOAD-005`
- `REQ-R-ABG3-PAYLOAD-014`
- `REQ-R-ABG3-PAYLOAD-016`
- `REQ-R-ABG3-PAYLOAD-019`
- `REQ-R-ABG3-PROJECTION-001`
- `REQ-R-ABG3-PROJECTION-002`
- `REQ-R-ABG3-PROJECTION-005`
- `REQ-R-ABG3-PROJECTION-010`
- `REQ-R-ABG3-ASSURANCE-020`
- `REQ-R-ABG3-ASSURANCE-022`

Design authority:

- M03 payload-ledger design defines payload envelopes, payload observations,
  validations, evidence admissions, closure inputs, and replay-derived
  `PayloadLedgerProjection`.
- M03 payload-ledger IACS already owns `PayloadLedgerProjection`; no new prime
  ABG carrier is needed for a domain label such as source asset.

First missing layer:

- `realization_refactor`

Required work:

- expose or repair a domain-neutral ABG helper over `PayloadLedgerProjection`
  that returns the current admitted output payload ref, report/evidence refs,
  contract refs, and digests for a scoped boundary.
- keep labels such as `source asset` and `test_execution_result_surface` as
  worksite mapping over ABG payload facts, not ABG vocabulary.

## Proof Requirements

- stale supplied retry context loses to replay-derived frontier truth
- latest-only retry dossiers fail full-frontier assertion
- missing declared output payload blocks closure
- file/report shape without ABG payload admission blocks closure
- admitted target-carrier payload allows closure only after assurance rows close
- prior report ref without admitted output payload ref does not satisfy source
  authority
- admitted output payload with selected contract ref and digest projects as
  current source/output authority
- plugin/stage outputs cannot smuggle runtime events, ledger writes, traversal
  selection, or closure authority

## Work Rules

- Do not edit GTL language surfaces unless a separate GTL re-entry is opened.
- Do not encode odd_sdlc, data_mapper, JVM, SBT, or other stack-specific facts
  in ABG.
- Implement in ABG TypeScript only after the design entry above is made.

## Implementation Result

- Added composed-stage-set runtime law: closure-satisfying graph-vector target
  payloads, projection outputs, and no-dispatch/system projection outputs must
  be admitted as ABG payload truth before assurance fold and traversal
  transition.
- Added `deriveFreshRetryContextProjection` over replay-derived
  `RetryFrontierProjection`; supplied retry frontiers are freshness checks only
  and stale aliases do not replace replay truth.
- Added `deriveAdmittedOutputAuthorityProjection` over
  `PayloadLedgerProjection`; report-shaped or unrelated payload refs remain
  related facts and do not satisfy selected output authority.
- Added focused T-147 behavioral proof for retry freshness, latest-only retry
  dossier rejection, output payload admission before closure, target-carrier
  close with authority-bound evidence, and stage task authority-smuggling
  rejection.
- Wired `deriveFreshRetryContextProjection` into runtime plugin input
  construction. `EnginePluginInput` now carries replay-derived
  `retryContext`, so retry workers receive the current ABG frontier instead of
  a caller-local alias.
- Wired `deriveFreshRetryContextProjection` into attached and no-artifact retry
  decisions. A stale supplied `FpTransformRequest.retryFrontierRef` is rejected
  before retry planning.
- Wired target-carrier output admission into accepted attached F_P results.
  Accepted results now emit selected target-carrier `payload_observed` and
  `payload_validated` events before assurance fold and traversal transition.
- Wired `deriveAdmittedOutputAuthorityProjection` into runtime plugin input
  construction and the current-vector assurance fold. `EnginePluginInput` now
  carries replay-derived `outputAuthorityProjections`, and internal closure
  blocks when the selected target-carrier output is not admitted.

## Current Verification

- `npm run test:t147` -> 7/7 passing.
- `node --test test_env/tests/test_t099_fp_stage_carriers.test.mjs test_env/tests/test_t128_construction_runner.test.mjs` -> 8/8 passing.
- `npm run build:semantic && node --test test_env/tests/test_t084_attached_fp_worker_loop.test.mjs test_env/tests/test_t098_retry_frontier_projection.test.mjs test_env/tests/test_t095_payload_ledger_unit.test.mjs test_env/tests/test_t133_target_carrier_contract.test.mjs test_env/tests/test_t146_composed_stage_set_phase.test.mjs test_env/tests/test_t147_runtime_authority_invariants.test.mjs` -> 54/54 passing.
- `npm run test:semantic` -> 654/654 passing.
