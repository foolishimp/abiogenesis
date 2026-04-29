---
id: T-087
title: Restore TypeScript ABG supervised actor invocation over one F_P dispatch
type: feature
ticket_category: runtime_actor_invocation
status: completed
goal: abg-typescript-outcome-compute-parity
change_intent: Make the TypeScript ABG runtime explicitly own the supervised actor invocation that wraps each F_P dispatch so actor progress, result-artifact observation, timeout/salvage, and replay-visible failure truth are substrate behavior rather than downstream orchestration.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG TypeScript M03 transport, attached F_P loop, worker binding, agent CLI invocation, progress lease, live result artifact observation, runtime events, result ingest, retry/re-entry, installed sandbox qualification
priority: high
triaged_at: 2026-04-29T00:00:00Z
created_at: 2026-04-29T00:00:00Z
updated_at: 2026-04-28T18:13:41Z
dependencies:
  - T-004 completed
  - T-026 completed
  - T-072 completed
  - T-084 completed
  - T-085 completed
  - T-086 active/awaiting_external_agent_review
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
product_authority:
  - specification/PRODUCT.md Probabilistic Compute Boundary
  - specification/PRODUCT.md Outcome Compute Contract
  - specification/PRODUCT.md ABG product layer
intent_authority:
  - specification/INTENT.md GTL / ABG control boundary
  - specification/INTENT.md ABG outcome compute primitive
  - specification/INTENT.md primary operator workflow with agentic coder surface
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-WORKER.md
design_authority:
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md
related_python_precedent:
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/.genesis/genesis/transport.py
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/.genesis/genesis/dispatch_runtime.py
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/.genesis/genesis/interpret.py
related_downstream_evidence:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-101-repair-test56-progressive-live-output-followup-and-manifest-binding.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/codex/20260429T120000Z_REVIEW_test35_actor_pattern_and_secret_sauce.md
intake_source: Review of Python-era test35 and current TypeScript SDLC live runs showed that the useful historical behavior was not only retry or prompt pressure. Python ABG supervised one agent process per F_P invocation, watched live artifact/progress surfaces, salvaged valid result artifacts after transport failure, and admitted the outcome into event truth. TypeScript ABG has transport, result ingest, attached F_P retry, and progress concepts, but the actor invocation itself is not yet an explicit ABG TypeScript carrier and proof obligation.
target_truth: ABG TypeScript owns a first-class supervised actor invocation as the effect wrapper around one F_P dispatch. One F_P dispatch corresponds to exactly one actor invocation. The actor may supervise liveness, progress, and result-artifact observation for that invocation, but it may not perform hidden graph retry, choose a next vector, close traversal, or append domain truth outside ABG event calculus. Retry or re-entry creates a fresh actor invocation and fresh F_P dispatch identity from replay-derived runtime truth.
superseded_truth: A downstream product, installed operator, or local sandbox may treat the agent process as an opaque command and rely on caller-local loops, operator archives, or postflight conventions to recover from timeout, partial progress, or missing report surfaces.
missing_requirement_truth:
  - ABG shall define an actor invocation carrier or equivalent explicit runtime identity for one supervised actor process around one F_P dispatch.
  - ABG shall preserve the one-to-one law between actor invocation identity and F_P dispatch attempt identity.
  - ABG shall surface actor start, progress observation, result-artifact observation, completion/failure, and salvage classification as replay-visible runtime truth or closed ingest truth.
  - ABG shall admit valid result artifacts observed before timeout or nonzero process exit when the artifact satisfies the same dispatch boundary.
  - ABG shall classify missing, malformed, stale, or wrong-boundary result artifacts as typed gap/failure truth that can feed retry/re-entry.
  - ABG shall keep graph retry and same-edge re-entry owned by runtime event calculus, not by the actor subprocess or downstream caller loop.
non_goal:
  - Do not move odd_sdlc domain construction, data_mapper policy, requirement semantics, or acceptance meaning into ABG.
  - Do not create a long-lived agent session ontology in this ticket.
  - Do not let the actor run multiple F_P traversals under one hidden invocation.
  - Do not bypass `DispatchRequest`, `ResultArtifact`, `ResultIngestOutcome`, or attached F_P result admission.
  - Do not make transport logs or agent stdout semantic truth.
  - Do not change GTL graph-function semantics.
closure_law: Close only after the requirement layer either ratifies explicit actor invocation law or proves existing ABG requirements already own it, design/module surfaces define the TypeScript carrier and event/projection topology, implementation routes attached/live F_P dispatch through the supervised actor invocation path, and tests prove timeout/progress/result salvage and retry re-entry without downstream orchestration owning control truth.
evaluation_criteria:
  - Requirement audit decides whether REQ-R-ABG3-TRANSPORT and REQ-R-ABG3-RETRY are sufficient or need explicit actor-invocation acceptance criteria.
  - Design Module Method review identifies the prime carrier set and rejects duplicate transport, actor, result, retry, or progress surfaces.
  - Structural carrier diagram shows GTL edge, ABG dispatch request, actor invocation, F_P process/tool, result artifact, ingest outcome, runtime event, projection, and retry/re-entry boundaries.
  - TypeScript implementation exposes an ABG-owned supervised actor invocation path for attached or live F_P dispatch.
  - A valid result artifact observed before timeout or subprocess failure is deterministically admitted or deterministically rejected with typed reasons.
  - Missing, malformed, stale, wrong-edge, or wrong-run artifacts produce replay-visible failure/gap truth, not operator-local archive-only truth.
  - Retry creates fresh actor invocation identity and fresh F_P dispatch attempt identity while carrying prior gap/progress evidence from replay.
  - Downstream SDLC tests consume the ABG surface rather than recreating actor supervision locally.
proof_surface:
  - requirement audit note under `.ai-workspace/comments/codex/`
  - TypeScript ABG design/IACS surface for supervised actor invocation
  - unit tests for one-to-one actor/F_P identity and invalid authority rejection
  - sandbox test where a fixture actor writes a valid result artifact and then times out; ABG salvages or classifies it by admitted truth
  - sandbox test where missing/malformed/wrong-boundary result artifacts become retry-visible gap/failure truth
  - installed/live proof or explicit deferred live proof ticket if external CLI binding cannot be exercised in this slice
non_closure_conditions:
  - actor supervision is implemented only in odd_sdlc or another downstream product
  - a caller-local loop decides retry, closure, next vector, or progress truth
  - artifact salvage depends on reading agent stdout as semantic truth
  - result observation is archived but not available to replay/projection/retry
  - one actor invocation can hide multiple F_P edge traversals
  - tests prove only attempt counters and do not prove state, progress, or artifact carry across re-entry
---

# T-087: TypeScript ABG Supervised Actor Invocation

## Problem

The Python-era `data_mapper.test35` line preserved an important runtime
pattern:

```text
human -> agentic CLI -> sdlc.start -> ABG dispatch runtime
  -> supervised actor invocation -> agent F_P work
  -> result artifact observation -> ABG ingest/events/projection/re-entry
```

That pattern is not SDLC-specific. It is ABG runtime substrate behavior.

The current TypeScript line has strong pieces:

- governed `F_P` transport
- result artifact admission
- retry and same-edge re-entry law
- attached F_P loop proof
- installed sandbox proof

The missing explicit piece is the actor invocation carrier itself. The actor
process is the effective manager of one probabilistic worker call, but ABG must
own the boundary, identity, progress lease, live artifact observation, failure
classification, and replay-visible outcome.

## One-To-One Law

The target law is:

```text
ActorInvocation <-> FpDispatchAttempt
```

One actor invocation wraps one F_P dispatch attempt.

If ABG retries the same edge, that retry is a new dispatch attempt and a new
actor invocation. The prior actor invocation remains event/projection evidence.
It is not resumed as hidden mutable state.

## Python Evidence To Extract

The historical capability is visible in the installed Python runtime:

| Python surface | Capability |
| --- | --- |
| `transport.py` | supervised subprocess transport, result writeback observation, timeout handling |
| `dispatch_runtime.py` | engine-owned F_P dispatch, event emission, result ingest |
| `interpret.py` | F_P manifest/result path creation and blocking reason projection |

This ticket does not authorize copying Python architecture. It authorizes
extracting the generic runtime capability into the TypeScript ABG design.

## Target ABG Shape

Expected topology:

```text
GTL edge / graph function
  -> ExecutionBasis
  -> AdvancementTransition(fp_dispatch)
  -> DispatchRequest
  -> ActorInvocation
  -> F_P tool/process
  -> observed ResultArtifact candidate
  -> ResultArtifact admission
  -> ResultIngestOutcome
  -> RuntimeEvent(s)
  -> replay projection
  -> retry | continue | hold | stop | converge
```

The actor invocation is an effect wrapper, not a semantic owner.

## Design Constraint

The solution must pass Design Module Method review:

- prime carriers only
- no duplicate truth surfaces
- no downstream HOW in ABG
- no actor-owned closure or retry
- no hidden process state as runtime truth
- event/projection truth remains the control source

## Why This Matters Before The Next SDLC Run

The next SDLC data_mapper run can still be valuable without this ticket being
implemented, but any failure around timeouts, partial artifacts, missing report
surfaces, or stalled worker progress will remain ambiguous unless ABG owns this
surface.

If the next run is intended to diagnose SDLC graph/prompt quality only, it can
proceed now. If the next run is intended to prove TypeScript parity with the
test35 actor-supervised behavior, this ticket must be implemented or explicitly
accepted as a known gap before the run.

## Closure Evidence

Closed at: 2026-04-28T18:13:41Z

Requirement surfaces:

- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`

Design surfaces:

- `build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/design/README.md`
- `build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`

Implementation surfaces:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts`

Proof surfaces:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_t087_supervised_actor_invocation.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t084_attached_fp_worker_loop.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/typescript/package.json`

Proof result:

- `npm run test:t087`: 4 passed
- `npm run test:t084`: 4 passed
- `npm run test:t072`: 14 passed
- `npm run test:semantic`: 252 passed
- `npm run lint:semantic`: passed

Closure claim:

ABG TypeScript now has explicit runtime law for one supervised actor invocation
per F_P dispatch attempt. The runner emits replay-visible actor start,
candidate artifact observation, and actor close events; projection preserves
actor invocation refs and observed artifact refs; F_P plugin inputs receive the
ABG-derived invocation ref; plugin outcomes cannot supply actor authority; a
blocked transport result with a valid attached artifact is salvaged through
normal `ResultArtifact` admission; malformed candidate artifacts become
payload-contract runtime failure truth that feeds retry/stop law.

Non-claim:

This does not make ABG own downstream domain HOW, long-lived agent sessions, or
SDLC-specific construction policy. It closes the ABG TypeScript actor
invocation carrier and event-calculus surface needed before downstream SDLC
runs can evaluate graph/prompt quality without ambiguity around actor
supervision.
