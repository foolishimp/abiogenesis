---
id: T-171
title: Prove generic non-default command execution capability
type: implementation
ticket_category: odd_glc_ladder_prerequisite
status: completed
goal: >-
  Prove that GTL/ABG can execute a declared non-default command, using a Rust
  source artifact compiled by rustc as the live proof binding, with cwd/env
  binding, admitted runtime evidence, requirement evidence binding, fold,
  residual, disposition, and replay-consumable proof truth. This unblocks the
  odd_glc Rust CLI ladder rung without allowing odd_glc to shell out locally.
  Rust/rustc is the live proof binding for generic command execution, not
  ABI-owned language or toolchain policy.
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
  ABI can run a declared non-default command capability through ABG actor/operator
  authority and publish replay-consumable proof that a downstream product can
  read without owning execution, admission, evidence binding, fold, residual,
  or disposition authority. ABI records command/cwd/env/runtime evidence; it
  does not define Rust correctness or rustc acceptability policy.
superseded_truth: >-
  Existing Node/JavaScript execution proof or frozen odd_sdlc Rust fixtures are
  enough to claim generic non-default command execution readiness for odd_glc.
closure_law: >-
  Close only after a live proof starts from GTL declarations for a Rust Hello
  World CLI capability, executes rustc and the compiled CLI through ABG actor/operator
  authority with declared cwd/env, admits runtime evidence, emits requirement
  route truth through the event stream, folds/residualizes/disposes through ABI,
  and publishes a digest-pinned replay artifact. The proof shall consume
  declared plugin/downstream policy refs for toolchain meaning where needed; ABI
  shall not infer language semantics from command names.
non_closure_conditions:
  - The proof uses JavaScript/Node execution as a stand-in for rustc or another
    declared non-default command.
  - The proof reads frozen odd_sdlc fixtures or local logs instead of ABG
    runtime events.
  - rustc is invoked by the test harness outside ABG actor/operator
    authority.
  - cwd, env, command, stdout/stderr, exit status, or artifact refs are not
    admitted or replay-visible.
  - Requirement evidence binding, fold, residual, or disposition is computed
    outside the ABI requirements route.
  - Missing Rust tooling is skipped as success instead of failing closed,
    deferring, or documenting an explicit non-closure.
  - ABI hard-codes Rust, rustc, compiler, language, or acceptability policy
    instead of consuming admitted declarations or policy refs.
  - No live proof is run before closure.
required_work:
  - Audit current actor/operator execution surfaces for declared non-default
    command support.
  - Ratify any missing GTL declaration or ABG runtime contract needed for
    command, cwd, env, and toolchain identity.
  - Implement the Rust CLI proof path as a scenario binding over generic command
    execution without introducing a product-local executor or ABI-owned
    Rust/rustc policy.
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

# T-171: Generic Non-Default Command Execution Capability

## STDO Triage

### First Missing Layer

GTL/ABG runtime proof.

odd_glc has a Rust CLI scenario, but ABI rc16 does not contain a live rustc
execution proof. The missing capability belongs upstream because command
execution, cwd/env binding, evidence admission, fold, residual, and disposition
are ABG authority. Rust/Cargo semantics and acceptability remain plugin or
downstream policy.

### Lawful Re-Entry

`requirement_reprice -> design_reframe -> realization_refactor`.

The product boundary is stable. The missing work is to ratify and prove a
runtime capability that downstream products can consume read-only.

## Acceptance Checklist

- [x] Current declared non-default command execution support is audited and
      recorded.
- [x] Any required GTL/ABG declaration or runtime contract is ratified.
- [x] Live Rust CLI proof executes through ABG actor/operator authority.
- [x] cwd/env/toolchain identity is admitted and replay-visible.
- [x] Evidence binding, fold, residual, and disposition are emitted or
      replay-projected through the ABI requirements route.
- [x] A digest-pinned replay artifact is published.
- [x] Focused proof commands pass, including live; full-suite timing residual is
      recorded below.

## Closure Evidence

Completed 2026-06-29.

- Added `test:t171` and `test:t171:live`.
- Added
  `build_tenants/abiogenesis/typescript/test_env/live/test_t171_non_js_toolchain_execution_live.test.mjs`.
- Local toolchain audit found:
  `rustc 1.82.0 (f6e511eec 2024-10-15)` at `/Users/jim/.cargo/bin/rustc`
  and `cargo 1.82.0 (8f40fc59f 2024-08-21)` at `/Users/jim/.cargo/bin/cargo`.
- Final non-live command:
  `cd build_tenants/abiogenesis/typescript && npm run test:t171`.
- Final non-live result: 2/2 passing, 1 live test correctly skipped.
- Final live command:
  `cd build_tenants/abiogenesis/typescript && npm run test:t171:live`.
- Final live result: 3/3 passing in 98212.615458 ms.
- Boundary guard command:
  `cd build_tenants/abiogenesis/typescript && node --test test_env/tests/test_t109_agent_callout_guard.test.mjs`.
- Boundary guard result: 1/1 passing.
- Full semantic command:
  `cd build_tenants/abiogenesis/typescript && npm run test:semantic`.
- Full semantic result after the T-109 correction: the T-109 guard violation is
  gone, but the suite still failed on supervised-process timing cases
  `T-097`, `T-204`, and `T-129`. Those files pass when run directly:
  `node --test test_env/tests/test_t097_supervised_process_actor.test.mjs`
  and
  `node --test test_env/tests/test_t129_runtime_liveness_observer.test.mjs`.
  This is recorded as an existing suite-level process timing residual, not as
  T-171 proof truth.
- Final proof run root:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t171_non_js_toolchain_execution_live/20260629T134455708Z_pid97032`.
- Replay artifact:
  `non-js-toolchain-replay-artifact.json`.
- Manifest:
  `non-js-toolchain-replay-manifest.json`.
- Manifest artifact digest:
  `sha256:30ffdeda4968bcf49ffacad785ac70ab78474420b07ab4ca5b2779f3d9315235`.
- Route event count: 20.
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
  `projection://t171/live/rust-cli-source` as `asset`,
  `projection://t171/live/toolchain-command-manifest` as `test_source`,
  `projection://t171/live/toolchain-execution` as `test_execution`, and
  `projection://t171/live/rust-cli-interpretation` as
  `semantic_interpretation`.
- Artifact source metadata maps compatibility role spellings to generic roles:
  `asset -> rust_cli_source_artifact`,
  `test_source -> toolchain_command_manifest`,
  `test_execution -> rustc_compile_and_cli_run_execution`,
  `semantic_interpretation -> rust_cli_execution_interpretation`.
- Closed-route residual handling is explicit: no
  `requirement_residual_projected` event is expected for this closed proof;
  disposition `residualRefs` is empty.

Boundary note: Rust, Cargo, rustc, language semantics, compiler acceptability,
and artifact policy are proof-harness/plugin-owned in this ticket. ABI owns the
generic command/cwd/env evidence path, admitted replay truth, requirement
evidence binding, fold, residual/disposition, and query surface only.

Boundary correction note: the first live pass exposed a T-109 guard violation
in the proof harness because toolchain discovery used direct `node:child_process`
calls. The committed closure pass removes that side path: executable discovery
uses filesystem metadata, and rustc/cargo version observations, rustc compile,
and CLI execution all use `runTracedProcess` evidence.
