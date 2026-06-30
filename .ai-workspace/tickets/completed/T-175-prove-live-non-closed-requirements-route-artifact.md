---
id: T-175
title: Prove live non-closed requirements-route replay artifact
type: proof
ticket_category: downstream_proof_artifact
status: completed
goal: >-
  Publish a live, execution-grounded non-closed requirements-route replay
  artifact that downstream lifecycle consumers can use as proof-of-record for
  residual pressure, continuation, re-entry, or blocked lifecycle truth.
change_intent: >-
  T-167 published an installed non-closed route artifact, but downstream review
  found that the non-closure was produced by an in-test evaluator stub and an
  answer-carrying requirement source. odd_glc correctly consumed the artifact
  read-only, but the artifact is not execution-grounded closure evidence. This
  ticket replaces that proof class with a live ABI artifact.
change_class: realization_refactor
re_entry_point: proof
owner: abiogenesis
priority: critical
triaged_at: 2026-06-30
created_at: 2026-06-30
updated_at: 2026-06-30
completed_at: 2026-06-30
governance_scope: STDO Method, GTL, ABG, Requirements Algebra, Live Proof, Downstream ODD Consumers
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-014-prove-non-closed-lifecycle-interpretation.md
source_documents:
  - specification/GOALS.md
  - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - .ai-workspace/tickets/completed/T-167-publish-non-closed-requirements-route-replay-artifact.md
  - .ai-workspace/tickets/completed/T-170-earn-full-odd-glc-abi-substrate-closure.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260630T002500Z_REVIEW_t167-nonclosed-proof-correction.md
affected_boundary:
  proof:
    - build_tenants/abiogenesis/typescript/test_env/live/
    - build_tenants/abiogenesis/typescript/test_env/tests/support/requirements-route-replay-artifact.mjs
  package_scripts:
    - build_tenants/abiogenesis/typescript/package.json
  downstream_fixtures:
    - /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/fixtures/
target_truth: >-
  ABI publishes a digest-pinned live replay artifact whose non-closed
  requirement fold, residual projection, and lifecycle disposition are caused
  by a real F_P or executable-subject judgment over admitted evidence. The
  artifact includes live run capture comparable to other live ABI proof rungs
  and is consumable by odd_glc without exposing ABI emitters or requiring
  downstream-authored route truth.
superseded_truth: >-
  The T-167 installed non-closed route artifact is sufficient closure evidence
  for downstream non-closed lifecycle parity.
closure_law: >-
  Close only when `npm run test:t175:live` or its ratified successor runs with
  `CODEX_LIVE_FP=1`, writes a manifest plus replay artifact, and demonstrates
  that the non-closed disposition is caused by live worker/executable-subject
  evidence rather than a test stub, prompt-carried answer, or requirement text
  that states the desired outcome.
non_closure_conditions:
  - The proof uses a synthetic or installed-only evaluator stub to set
    `closeDisposition`.
  - The requirement source or prompt says the artifact "shall not close",
    "must not close", or otherwise carries the intended close disposition.
  - The live worker output is not serialized into the run capture.
  - The run directory lacks live process/transport/trace evidence comparable to
    T-160/T-168/T-169/T-174 live proof captures.
  - The artifact omits `requirement_residual_projected`.
  - The artifact computes disposition without admitted ABI continuation or
    graph re-entry truth.
  - A query constructs residual or disposition truth that was not emitted on
    the traversal path.
  - The proof has only one fixture and cannot discriminate a closeable subject
    from a non-closeable subject by causal input variation.
required_work:
  - Add a gated live T-175 proof script.
  - Drive a closeable control scenario and a non-closeable scenario through the
    same ABI route so output varies causally with admitted evidence.
  - Ensure the non-closeable scenario does not embed the desired disposition in
    requirement text or prompt text.
  - Preserve GTL/ABG ownership: GTL declares the requirement/route; ABI invokes
    the worker or executable subject, admits evidence, folds, residualizes,
    joins continuation/re-entry, emits route facts, and serializes the artifact.
  - Publish a digest-pinned artifact and manifest suitable for odd_glc
    fixture-of-record consumption.
  - Keep the old T-167 artifact as an engine-mechanics regression only.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run test:t175:live
  - cd build_tenants/abiogenesis/typescript && npm run test:t167
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - git diff --check
---

# T-175: Live Non-Closed Requirements Route Artifact

## STDO Triage

### First Missing Layer

Proof artifact.

The route mechanics exist. The missing proof is a live artifact where
non-closure is discovered by ABI from admitted evidence and worker judgment,
not asserted by a test stub.

### Lawful Re-Entry

`realization_refactor`.

The product boundary and requirements route law stay stable. The correction is
in the proof surface and artifact publication discipline.

## Design Boundary

This ticket shall not add product-local lifecycle policy to ABI. The proof
subject may be a minimal scenario, but Rust, JavaScript, service, test,
release, or lifecycle semantics are proof bindings only. ABI owns invocation,
admission, event emission, replay, fold, residual, continuation, and re-entry.
Downstream products own interpretation.

## Acceptance Checklist

- [x] Live proof script exists and is gated by `CODEX_LIVE_FP=1`.
- [x] Non-closed scenario uses live worker or executable-subject evidence.
- [x] Closeable control scenario proves discriminating output.
- [x] Requirement source and prompt do not carry the desired non-closure answer.
- [x] Run directory records live worker/process capture.
- [x] ABI emits requirement fold, residual, and lifecycle disposition through
      the runtime event stream.
- [x] Manifest records a live source run kind.
- [x] Digest-pinned artifact is ready for odd_glc T-014 consumption.
- [x] `npm run test:t175:live` passes.
- [x] `npm run test:t167` remains as engine-mechanics regression.
- [x] `git diff --check` passes.

## Closure Evidence

Closed on 2026-06-30.

The live proof command ran for approximately 90 seconds:

```bash
cd build_tenants/abiogenesis/typescript && npm run test:t175:live
```

It executed two live F_P branches over the same GTL requirement source:

- `closeable_20260630T010754187Z_pid31652`: the live worker returned
  `closeDisposition: close` and `ambiguityStatus: fulfilled` for a packet
  containing an implementation artifact plus independent verification evidence.
- `missing_verification_20260630T010854879Z_pid31652`: the live worker returned
  `closeDisposition: no_close` and `ambiguityStatus: partial` because
  verification evidence was null.

The non-closed branch wrote the downstream replay artifact:

- artifact:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t175_live_non_closed_requirements_route/missing_verification_20260630T010854879Z_pid31652/requirements-route-replay-artifact.json`
- manifest:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t175_live_non_closed_requirements_route/missing_verification_20260630T010854879Z_pid31652/requirements-route-replay-manifest.json`
- artifact digest:
  `sha256:fd4596f6c481ae957461cb7bc0222d6242052336d3d9bac2841ca10e2b0e501e`
- route event count: `9`
- runtime/replay event count: `36`
- live source run kind: `live_fp_non_closed_requirements_route`
- lifecycle disposition: `continuation_available`
- fold ref:
  `requirement-fold:REQ-T175-LIVE-NON-CLOSED-ROUTE:partial:proof://t175/missing_verification/requirements_ready#requirement-projection=projection%3AREQ-T175-LIVE-NON-CLOSED-ROUTE%3Aobligation`
- residual ref:
  `requirement-residual:REQ-T175-LIVE-NON-CLOSED-ROUTE:partial`

The run directories contain serialized live worker prompts, stdout/stderr,
transport JSON, and trace files for both control and non-closed branches.

Regression commands:

```bash
cd build_tenants/abiogenesis/typescript && npm run test:t167
cd build_tenants/abiogenesis/typescript && npm run test:semantic
git diff --check
```

`test:t167` remains installed engine-mechanics regression coverage. T-175 is
the live proof-of-record for downstream non-closed lifecycle consumption.
