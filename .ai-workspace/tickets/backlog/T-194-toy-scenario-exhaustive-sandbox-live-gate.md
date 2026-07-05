---
id: T-194
title: Toy-scenario exhaustive installed-sandbox live gate (rc.7 release gate)
type: proof_realization
ticket_category: release_gate_live_proof
status: backlog
goal: >-
  Create a toy GTL scenario proven exhaustively live from a
  snapshot-installed sandbox: real installer, real installed package, the
  PUBLIC start path, a real LLM worker, and the full T-188 carry-through
  chain (requirement declarations + carry-through startup as PRODUCT data)
  asserted from emitted replay events — closeable branch eligible+satisfied
  AND depth-shallow branch residual+no_close_preserved. This lane is the
  rc.7 release gate and discharges the review's question A (the T-188 live
  proof ran over a harness basis, not an installed sandbox).
change_class: realization_refactor
re_entry_point: installed_sandbox_carry_through_live_gate
owner: abiogenesis
priority: high
created_at: 2026-07-05
updated_at: 2026-07-05
governance_scope: RELEASE_METHOD, T-188 closure record, T-184 canonical lane
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-188-realize-requirement-proof-carry-through.md
  - .ai-workspace/tickets/completed/T-184-consolidate-canonical-installed-live-hello-world-proof.md
source_documents:
  - test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs
review_status: pending
proof_status: pending
target_truth: >-
  A digest-pinned sandbox live artifact proves the carry-through chain on
  the installed public path; rc.7 cites this artifact; no RC after rc.6
  claims carry-through without it.
non_closure_conditions:
  - The lane hand-calls admission, coverage, or fold (engine-emitted events
    only, parsed from the sandbox run's JSON lines).
  - The lane bypasses the installer or the public start path (direct
    runEngineIterate inside the test process is the harness lane's job, not
    this one's).
  - Requirement/carry-through declarations enter as test fixtures instead
    of product data consumed by the installed startup.
  - The shallow no-close branch is omitted (a closeable-only proof is
    presence, not differential).
required_work:
  - "SPLICE MAP (verified against the tree 2026-07-05): copy test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs to test_t194_carry_through_sandbox_live.test.mjs and modify: (1) productDeclarations block (:490) gains the toy scenario's requirement route bundle declarations; (2) the generated runtimeBindingSource (:995-1015 region) gains requirementRouteDeclarationBundle + requirementProofCarryThroughStartup on the engine start call, entries built from product-declared contract/table/template with the worker's execution evidence ref as strength; (3) the generated script emits the requirement_proof_carry_through_admitted and requirement_fold_projected events as JSON lines; (4) the test parses (parseJsonLines) and asserts BOTH branches: full-depth -> carry eligible + fold satisfied; depth-shallow -> carry residual (missing_depth_obligation_class) + fold no_close_preserved; (5) new npm script test:t194:sandbox-live, env-gated like the t180 lane; (6) record the artifact digest in the ticket and cite it in the rc.7 release note."
  - "Gate wiring: rc.7 cut requires this lane green (release-claim gate: the note cites the artifact digest)."
acceptance_criteria:
  - Both branches proven from the snapshot-installed sandbox via the public
    start path with a real LLM worker; artifact digest recorded.
  - T-188 closure record updated to cite this lane as the installed-sandbox
    discharge of review question A.
notes:
  - This is also the release-vector seed in miniature (four-recursions
    resolution 2) - the RC gate becomes an admitted proof artifact, not
    prose.
---

# T-194: Toy-Scenario Exhaustive Sandbox Live Gate

The toy scenario is the smallest program that exercises the full carry-
through chain in a real install: declared requirements, product-declared
carry-through startup, public start, real worker, engine-emitted coverage
and fold truth, both branches differentially.

## Build Scout Record (2026-07-05 — splice anchors verified, build-ready)

- The generated runtime-binding source builds ONE config object consumed by
  the installed runtime-binding convention (.abiogenesis/
  typescript-runtime.mjs): `runtimeRegistryStartup`,
  `instructionAssemblyStartup`, runId/workKey, `createPlugins` (whose
  fpDispatch already dispatches the real worker with ONLY
  instructionPromptManifest.renderedPrompt and asserts manifest-rendered
  bound refs + prior-artifact carry).
- T-194 deltas on the copy: add `requirementRouteDeclarationBundle` +
  `requirementProofCarryThroughStartup` to that binding object (product
  data), with strength refs declared in the artifact's assessment
  evidence_refs (the accepted-payload path admits them as typed evidence —
  the exact chain proven in the T-188 live lane).
- FIRST BUILD STEP (potential gap the lane exists to catch): verify the
  PUBLICSTART ADAPTER forwards requirementProofCarryThroughStartup +
  requirementRouteDeclarationBundle down to runEngineStart —
  runEngineStart/Async forwarding was fixed (T-188 slice 5), but the
  adapter layer above it (publicStart / installed cli-runtime binding
  consumption) has not been checked. If it drops either family, that is a
  P1-b-shaped finding on the public path and the first fix of this lane.
- Assertions: parse the sandbox run's emitted JSON lines for
  requirement_proof_carry_through_admitted (statuses/issueKinds) and
  requirement_fold_projected (fold.state), both branches.
