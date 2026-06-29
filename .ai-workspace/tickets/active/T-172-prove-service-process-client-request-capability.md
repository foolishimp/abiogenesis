---
id: T-172
title: Prove service process and client request capability
type: implementation
ticket_category: odd_glc_ladder_prerequisite
status: active
goal: >-
  Prove that GTL/ABG can start a long-running service process, bind port/env
  truth, issue a client request, admit response and cleanup evidence, and route
  requirement evidence binding, fold, residual, and disposition through ABI
  runtime truth. This unblocks the odd_glc Rust service ladder rung without
  allowing odd_glc to own a service supervisor or HTTP proof admission. The
  service/HTTP shape is the live proof binding for generic process/request
  execution, not ABI-owned service or protocol policy.
change_class: requirement_reprice
re_entry_point: design_reframe
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
  - .ai-workspace/tickets/completed/T-165-prove-hello-world-live-requirements-route.md
  - .ai-workspace/tickets/completed/T-166-publish-requirements-route-replay-proof-artifact.md
  - /Users/jim/src/apps/odd_glc/specification/scenarios/SCN-GLC-HELLO-WORLD-RUST-SERVICE.md
affected_boundary:
  goals:
    - specification/GOALS.md
  requirements:
    - specification/requirements/gtl/
    - specification/requirements/abg/
  design:
    - build_tenants/abiogenesis/typescript/design/
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/
target_truth: >-
  ABI can prove a declared service capability through process-start,
  client-request, response-evidence, cleanup, requirement binding, fold,
  residual, disposition, and replay truth without downstream supervision or
  request-admission authority. ABI records process/request/response/cleanup
  truth; it does not define service readiness, protocol correctness, or
  response acceptability policy.
superseded_truth: >-
  A liveness observer, local service fixture, or local HTTP smoke test is enough
  to claim service process readiness for odd_glc.
closure_law: >-
  Close only after a live proof starts from GTL declarations for a service
  Hello World capability, starts the service through ABG actor/operator
  authority, admits port/env/process truth, performs a client request through
  ABG-owned execution/admission truth, records response and cleanup evidence,
  emits requirement route truth, and publishes a digest-pinned replay artifact.
  Service readiness and response acceptability shall enter through admitted
  declarations, plugin outputs, or policy refs, not ABI inference.
non_closure_conditions:
  - The service is started or supervised by the test harness outside ABG
    actor/operator authority.
  - Port, env, process id, readiness, client request, response, or cleanup truth
    is only local harness state and not admitted or replay-visible.
  - The proof treats an ABG liveness observer as equivalent to a service proof.
  - Requirement evidence binding, fold, residual, or disposition is computed
    outside the ABI requirements route.
  - Failed start, failed probe, or cleanup failure cannot produce residual,
    blocked, continuation, or re-entry truth through ABI.
  - ABI hard-codes service readiness, HTTP semantics, response acceptability, or
    cleanup policy instead of consuming admitted declarations or policy refs.
  - No live proof is run before closure.
required_work:
  - Audit current process, actor/operator, and client-request capability
    surfaces.
  - Ratify any missing GTL declaration or ABG runtime contract for service
    process lifecycle, port/env binding, client request, response evidence, and
    cleanup.
  - Implement a live service proof path as a scenario binding over generic
    process/request execution without product-local supervision or ABI-owned
    service/protocol policy.
  - Publish a digest-pinned replay artifact equivalent in role to T-166.
  - Prove downstream query/read-only consumption can identify service
    capability, request/response evidence, fold, residual, disposition, and
    cleanup refs.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t172
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t172:live
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - git diff --check
---

# T-172: Service Process And Client Request Capability

## STDO Triage

### First Missing Layer

GTL/ABG runtime proof.

odd_glc has a Rust service scenario, but ABI rc16 does not contain a service
process-start plus client-request proof. The missing capability belongs
upstream because process lifecycle, request admission, evidence admission,
fold, residual, continuation, and disposition are ABG authority. Service
readiness, protocol semantics, and response acceptability remain plugin or
downstream policy.

### Lawful Re-Entry

`requirement_reprice -> design_reframe -> realization_refactor`.

The product boundary is stable. The missing work is to ratify and prove a
runtime capability that downstream products can consume read-only.

## Acceptance Checklist

- [ ] Current service/process/client-request support is audited and recorded.
- [ ] Any required GTL/ABG declaration or runtime contract is ratified.
- [ ] Live service proof starts and probes the service through ABG
      actor/operator authority.
- [ ] Port/env/process/request/response/cleanup truth is admitted and
      replay-visible.
- [ ] Evidence binding, fold, residual, and disposition are emitted or
      replay-projected through the ABI requirements route.
- [ ] A digest-pinned replay artifact is published.
- [ ] Proof commands pass, including live.

## Closure Evidence

Open.
