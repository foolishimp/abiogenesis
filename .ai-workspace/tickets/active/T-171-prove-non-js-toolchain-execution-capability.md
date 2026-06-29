---
id: T-171
title: Prove non-JS toolchain execution capability
type: implementation
ticket_category: odd_glc_ladder_prerequisite
status: active
goal: >-
  Prove that GTL/ABG can execute a non-JS toolchain command, specifically a
  Rust Cargo or rustc Hello World command, with cwd/env binding, admitted
  runtime evidence, requirement evidence binding, fold, residual, disposition,
  and replay-consumable proof truth. This unblocks the odd_glc Rust CLI ladder
  rung without allowing odd_glc to shell out locally. Cargo/Rust is the live
  proof binding for generic command execution, not ABI-owned language or
  toolchain policy.
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
  - /Users/jim/src/apps/odd_glc/specification/scenarios/SCN-GLC-HELLO-WORLD-RUST-CLI.md
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
  ABI can run a declared non-JS toolchain capability through ABG actor/operator
  authority and publish replay-consumable proof that a downstream product can
  read without owning execution, admission, evidence binding, fold, residual,
  or disposition authority. ABI records command/cwd/env/runtime evidence; it
  does not define Rust correctness or Cargo acceptability policy.
superseded_truth: >-
  Existing Node/JavaScript execution proof or frozen odd_sdlc Rust fixtures are
  enough to claim non-JS toolchain execution readiness for odd_glc.
closure_law: >-
  Close only after a live proof starts from GTL declarations for a Rust Hello
  World CLI capability, executes Cargo or rustc through ABG actor/operator
  authority with declared cwd/env, admits runtime evidence, emits requirement
  route truth through the event stream, folds/residualizes/disposes through ABI,
  and publishes a digest-pinned replay artifact. The proof shall consume
  declared plugin/downstream policy refs for toolchain meaning where needed; ABI
  shall not infer language semantics from command names.
non_closure_conditions:
  - The proof uses JavaScript/Node execution as a stand-in for Cargo or rustc.
  - The proof reads frozen odd_sdlc fixtures or local logs instead of ABG
    runtime events.
  - Cargo/rustc is invoked by the test harness outside ABG actor/operator
    authority.
  - cwd, env, command, stdout/stderr, exit status, or artifact refs are not
    admitted or replay-visible.
  - Requirement evidence binding, fold, residual, or disposition is computed
    outside the ABI requirements route.
  - Missing Rust tooling is skipped as success instead of failing closed,
    deferring, or documenting an explicit non-closure.
  - ABI hard-codes Rust, Cargo, compiler, language, or acceptability policy
    instead of consuming admitted declarations or policy refs.
  - No live proof is run before closure.
required_work:
  - Audit current actor/operator execution surfaces for non-JS command support.
  - Ratify any missing GTL declaration or ABG runtime contract needed for
    command, cwd, env, and toolchain identity.
  - Implement the Rust CLI proof path as a scenario binding over generic command
    execution without introducing a product-local executor or ABI-owned
    Rust/Cargo policy.
  - Publish a digest-pinned replay artifact equivalent in role to T-166.
  - Prove downstream query/read-only consumption can identify target artifact,
    capability, evidence binding, fold, residual, and disposition refs.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t171
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t171:live
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - git diff --check
---

# T-171: Non-JS Toolchain Execution Capability

## STDO Triage

### First Missing Layer

GTL/ABG runtime proof.

odd_glc has a Rust CLI scenario, but ABI rc16 does not contain a live Cargo or
rustc execution proof. The missing capability belongs upstream because command
execution, cwd/env binding, evidence admission, fold, residual, and disposition
are ABG authority. Rust/Cargo semantics and acceptability remain plugin or
downstream policy.

### Lawful Re-Entry

`requirement_reprice -> design_reframe -> realization_refactor`.

The product boundary is stable. The missing work is to ratify and prove a
runtime capability that downstream products can consume read-only.

## Acceptance Checklist

- [ ] Current non-JS execution support is audited and recorded.
- [ ] Any required GTL/ABG declaration or runtime contract is ratified.
- [ ] Live Rust CLI proof executes through ABG actor/operator authority.
- [ ] cwd/env/toolchain identity is admitted and replay-visible.
- [ ] Evidence binding, fold, residual, and disposition are emitted or
      replay-projected through the ABI requirements route.
- [ ] A digest-pinned replay artifact is published.
- [ ] Proof commands pass, including live.

## Closure Evidence

Open.
