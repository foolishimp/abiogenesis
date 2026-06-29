---
id: T-173
title: Publish generic proof-evidence replay proof
type: implementation
ticket_category: odd_glc_ladder_prerequisite
status: completed
goal: >-
  Prove and publish a downstream-consumable ABI requirements-route replay
  artifact for the odd_glc ladder using generic proof-evidence roles. The proof
  must distinguish subject-artifact evidence from verifier-artifact and
  verifier-execution evidence, then bind, fold, residualize, dispose, and replay
  that truth through ABI runtime events. The JavaScript tenant/test case is only
  the live proof binding; ABI owns no JavaScript, test, release, or acceptability
  policy.
change_class: realization_refactor
re_entry_point: proof_publication
owner: abiogenesis
priority: high
created_at: 2026-06-29
updated_at: 2026-06-29
governance_scope: STDO Method, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Actor/Operator, Requirements Algebra
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - .ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md
  - .ai-workspace/tickets/completed/T-165-prove-hello-world-live-requirements-route.md
  - .ai-workspace/tickets/completed/T-166-publish-requirements-route-replay-proof-artifact.md
  - /Users/jim/src/apps/odd_glc/specification/scenarios/SCN-GLC-HELLO-WORLD-JS-TENANT-TEST.md
affected_boundary:
  goals:
    - specification/GOALS.md
  realization:
    - build_tenants/abiogenesis/typescript/test_env/live/
    - build_tenants/abiogenesis/typescript/test_env/tests/support/
    - build_tenants/abiogenesis/typescript/package.json
  proof:
    - build_tenants/abiogenesis/typescript/test_env/test_runs/
target_truth: >-
  ABI publishes a digest-pinned replay artifact proving generic
  subject-artifact, verifier-artifact, and verifier-execution evidence are
  admitted and bound to the active requirement route without downstream
  product-local materialization, proof ledgers, or policy inference. JavaScript
  is the scenario binding, not ABI-owned semantics.
superseded_truth: >-
  The T-166 single-artifact replay artifact is enough for the odd_glc
  artifact-plus-test ladder rung, ABI may own software-test policy, or odd_glc
  may infer verifier evidence from generic subject-artifact evidence.
closure_law: >-
  Close only after a live proof starts from GTL declarations and admitted
  requirement pressure, produces a subject artifact and an independent verifier
  artifact, executes the verifier through ABG actor/operator authority, emits
  admitted evidence and requirement route truth through the runtime event stream,
  and writes a digest-pinned replay artifact whose bindings preserve distinct
  subject-artifact, verifier-artifact, and verifier-execution evidence roles.
  Existing `asset`, `test_source`, and `test_execution` spellings may appear
  only as compatibility names for those generic roles.
non_closure_conditions:
  - The artifact contains only subject-artifact evidence bindings.
  - The verifier artifact or verifier execution is inferred by odd_glc or a
    harness log instead of appearing as admitted ABI replay truth.
  - The proof constructs route events by hand instead of using ABI route
    emission/admission/projected replay truth.
  - The live prompt carries the complete subject source, complete verifier
    source, or a prefilled pass/fail answer.
  - The verifier command is executed outside ABG actor/operator evidence truth.
  - ABI hard-codes JavaScript, test-source, path-root, pass/fail, release, or
    acceptability policy instead of consuming admitted plugin/downstream
    declarations or policy refs.
  - The published replay artifact does not preserve subject-artifact,
    verifier-artifact, verifier-execution, fold, and disposition refs, or does
    not explicitly record residual absence for a closed route.
  - No live proof is run before closure.
required_work:
  - Resolve the declaration-to-projection gap for generic proof-evidence roles:
    existing compatibility declarations name asset/test-source/test-execution
    projection refs, but the route builder derives only obligation projections
    from declarations. Closure requires either deriving generic subject,
    verifier-artifact, and verifier-execution projection slots from proof
    relations or ratifying a projection declaration surface.
  - Add a T-173 live proof lane that uses JavaScript only as the scenario binding
    for subject-artifact plus verifier-artifact evidence.
  - Use GTL requirement declarations plus proof-evidence relation declarations
    where required.
  - Preserve distinct generic proof-evidence roles in route replay truth. If
    compatibility spellings `asset`, `test_source`, and `test_execution` appear,
    the artifact or manifest shall map them to subject-artifact,
    verifier-artifact, and verifier-execution roles.
  - Publish a digest-pinned replay artifact and manifest.
  - Leave downstream consumption to odd_glc T-010 after this upstream artifact
    exists.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t173
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t173:live
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - git diff --check
---

# T-173: Generic Proof-Evidence Replay Proof

## STDO Triage

### First Missing Layer

Proof publication.

The route already supports distinct requirement evidence roles, and T-162
proves role separation in lower-level tests. The missing piece is a
downstream-consumable replay artifact that carries generic subject-artifact,
verifier-artifact, and verifier-execution evidence roles for a live scenario.
The JavaScript Hello World test case is the first binding of that generic proof
contract, not ABI-owned software-test policy.

### Lawful Re-Entry

`realization_refactor`.

This does not change the ABI product boundary. It publishes a proof artifact
over existing GTL/ABG requirements-route authority and explicitly keeps
language/toolchain/test/release policy outside ABI.

## Acceptance Checklist

- [x] T-173 live proof lane exists.
- [x] Declaration-to-projection gap is resolved without caller-supplied route
      projection refs.
- [x] Live proof produces subject artifact and independent verifier artifact.
- [x] Verifier execution runs through ABI actor/operator evidence truth.
- [x] Replay artifact includes distinct subject-artifact, verifier-artifact,
      and verifier-execution evidence bindings.
- [x] If compatibility evidence-role spellings are used, the artifact or
      manifest maps them to generic proof-evidence roles.
- [x] ABI does not define JavaScript, test, release, or acceptability policy.
- [x] Replay artifact includes fold and disposition route truth, and records
      closed-route residual absence.
- [x] Manifest digest pins the artifact.
- [x] Proof commands pass, including live.

## Closure Evidence

Completed 2026-06-29.

- Added `test:t173:live` and
  `test_env/live/test_t173_generic_proof_evidence_live.test.mjs`.
- Final live command:
  `cd build_tenants/abiogenesis/typescript && npm run test:t173:live`.
- Final live result: 2/2 passing in 130109.561792 ms.
- Final proof run root:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t173_generic_proof_evidence_live/20260629T131855445Z_pid76289`.
- Replay artifact:
  `generic-proof-evidence-replay-artifact.json`.
- Manifest:
  `generic-proof-evidence-replay-manifest.json`.
- Manifest artifact digest:
  `sha256:4c825ba13dd250d114f33f1d417d2d7470a5d62b3c3e917478e55c7e79d43206`.
- Route event count: 19.
- Preserved route payload kinds:
  `requirement_term_admitted`,
  `requirement_projection_admitted`,
  `requirement_evidence_bound`,
  `requirement_fold_projected`,
  `requirement_lifecycle_disposition`,
  `authority_context_fragment_admitted`,
  `requirement_test_relation_admitted`,
  `traversal_span_admitted`.
- Distinct admitted evidence bindings were present for:
  `projection://t173/live/subject-artifact` as `asset`,
  `projection://t173/live/verifier-artifact` as `test_source`,
  `projection://t173/live/verifier-execution` as `test_execution`, and
  `projection://t173/live/interpretation` as `semantic_interpretation`.
- Artifact source metadata maps compatibility role spellings to generic roles:
  `asset -> subject_artifact`,
  `test_source -> verifier_artifact`,
  `test_execution -> verifier_execution`,
  `semantic_interpretation -> semantic_interpretation`.
- Closed-route residual handling is explicit: no
  `requirement_residual_projected` event is expected for this closed proof;
  disposition `residualRefs` is empty.

## Execution Start Note

2026-06-29 start pass found the first implementation gate:

- ABI lower-level requirements algebra supports compatibility evidence roles
  currently spelled `test_source` and `test_execution`.
- GTL declaration bundles can carry the compatibility-named
  `GtlRequirementTestRelationDeclaration`.
- `buildRequirementRouteRuntimeContextFromDeclarations(...)` currently derives
  only default obligation projections from declarations.
- Therefore a downstream-consumable artifact with distinct generic
  subject-artifact, verifier-artifact, and verifier-execution evidence roles
  cannot be honestly produced as an odd_glc-ready proof until the
  declaration-to-projection bridge is implemented or ratified.

This is upstream ABI work. odd_glc shall not compensate by classifying generic
subject-artifact bindings as verifier evidence. ABI shall not compensate by
hard-coding product test policy.

## Execution Update

2026-06-29 implementation pass resolved the declaration-to-projection bridge
for generic proof-evidence roles:

- `projectRequirements(...)` derives subject-artifact, verifier-artifact,
  verifier-execution, and semantic-interpretation projection slots from admitted
  proof relation declarations.
- Derived verifier-execution slots are `evidence_expectation`, not
  `execution_schedule`, unless a separate admitted projection declares a
  command. ABI therefore does not invent command, toolchain, test, or pass/fail
  policy from the relation.
- `test:t173` proves replay-visible projection facts for all generic roles.
- `test:t162` and `test:t164` pass after the projection bridge change.

At that point, the remaining work was the live proof lane, verifier execution
through ABG actor/operator evidence truth, digest-pinned replay artifact
publication, and odd_glc downstream consumption. The ABI-side items are
resolved by the completion update below; downstream consumption remains odd_glc
work.

## Completion Update

2026-06-29 completion pass added and ran the live proof lane. The live F_P
worker produced a subject artifact and independent verifier artifact. The
verifier was executed through the traced process path, its result was admitted
through ABI runtime evidence, and the requirements route emitted replay-visible
bindings/fold/disposition facts. JavaScript and CommonJS proof-root details
remain proof-harness bindings; ABI core owns no JavaScript, test, release, or
acceptability policy.
