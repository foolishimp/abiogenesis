---
id: T-190
title: Replace T-189 source dispatch census with runtime F_P dispatch enumeration
type: realization_refactor
ticket_category: runtime_proof_hardening
status: completed
goal: >-
  Replace the T-189 source-text dispatch census with runtime enumeration and
  mutation proofs for every F_P-capable dispatch arm, including latent arms
  that are plumbed but not currently yielded.
change_intent: >-
  The RC5 T-189 closure fixed the live fail-closed dispatch and registry
  self-seeding defects, but its dispatch-site census remains a source-text
  scrape. A source scrape can stay green while a newly wired F_P arm bypasses
  instruction assembly. This ticket turns the census into runtime evidence.
change_class: realization_refactor
re_entry_point: abg_runtime_dispatch_proof
owner: abiogenesis
priority: high
triaged_at: 2026-07-05
created_at: 2026-07-05
governance_scope: STDO Method, DESIGN_MODULE_METHOD, ABG Runtime, Instruction Assembly, Registry Selection
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-189-wire-ratified-dispatch-and-selection-law-into-live-runtime.md
source_documents:
  - .ai-workspace/tickets/completed/T-189-wire-ratified-dispatch-and-selection-law-into-live-runtime.md
  - specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t189_instruction_dispatch_runtime_wiring.test.mjs
review_status: pending
proof_status: pending
target_truth: >-
  Every F_P-capable runtime dispatch arm is proven by runtime execution or by
  a typed construct-and-block exemption. Runtime proof observes the actual
  `EngineRunner` path, asserts the per-task instruction prompt manifest is
  attached before worker/plugin/evaluator invocation, and proves that a
  mutated or missing manifest blocks dispatch. The latent singular
  `evaluation_rule_evaluate` effect is either wired through the same manifest
  path with a runtime proof or rejected/typed-exempted before it can become a
  live unbound F_P dispatch.
superseded_truth: >-
  A source-text regex census over `engine_runner.ts` counts binding calls and
  regime branches, then infers coverage without driving each dispatch arm
  through the runtime and without mutation-differential evidence on every arm.
closure_law: >-
  Close only when `test:t189` or a successor proof command drives scalar
  transform, scalar evaluate, composed transform, composed consequence,
  evaluation-rule batch, and the singular `evaluation_rule_evaluate` effect
  through runtime enumeration or a typed exemption; each live F_P dispatch
  proof asserts manifest presence and rejects a mutated/missing manifest before
  invocation; and the test fails by construction when a new F_P-capable arm is
  added without a runtime proof or explicit exemption.
non_closure_conditions:
  - A source-text grep, count, or regex scrape is the primary closure proof for
    F_P dispatch-arm coverage.
  - A dispatch arm is counted without runtime evidence that an
    `instructionPromptManifest` is attached before the F_P worker, plugin, or
    evaluator can run.
  - A dispatch arm is counted without a mutation differential proving that a
    missing, stale, mismatched, or non-tautology-failing manifest blocks
    dispatch.
  - The singular `evaluation_rule_evaluate` effect remains plumbed as an
    F_P-capable effect without a construct-and-block proof, runtime manifest
    proof, or typed constitutional exemption.
  - Composed consequence or evaluation-rule batch arms rely only on existing
    zero-manifest legacy tests instead of runtime manifest attachment checks.
  - A new F_P-capable site can be added to the runner while `test:t189`
    remains green without adding a runtime proof or typed exemption.
  - The ticket changes `REQ-R-ABG3-SELECTION-APPLICATION-006` by drift.
    Current ratified posture is explicit: absent vector or edge registry
    constraints are unconstrained; vector declarations narrow the registry
    universe; ABG shall not backfill missing constraints from the selected
    candidate.
required_work:
  - >-
    Classify every F_P-capable dispatch effect and runner branch as one of:
    runtime-proven live arm, construct-and-block latent arm, or typed exempt
    non-F_P arm. The classification must be data in the test, not an
    unreviewed source-count expectation.
  - >-
    Replace the T-189 census's source-text closure claim with runtime
    enumeration that drives each live arm through `runEngineIterate` or the
    narrowest runner entry that exercises the same dispatch bind path.
  - >-
    Add per-arm manifest assertions for scalar transform, scalar evaluate,
    composed transform, composed consequence, and evaluation-rule batch paths.
  - >-
    Add per-arm mutation differentials: remove or corrupt the manifest,
    manifest digest, non-tautology proof, or plan identity and prove the arm
    blocks before invocation.
  - >-
    Handle the singular `evaluation_rule_evaluate` effect explicitly. Either
    wire it through instruction assembly and prove it at runtime, or add a
    typed construct-and-block proof that it cannot dispatch unbound while it is
    not yielded by the runner.
  - >-
    Preserve the `REQ-R-ABG3-SELECTION-APPLICATION-006` decision in the ticket
    record: registry selection starts from the registry universe; absent
    constraints are unconstrained; vector constraints are optional narrowing
    declarations.
acceptance_criteria:
  - `test:t189` or a successor test fails if a new F_P-capable dispatch arm is
    added without a runtime proof or typed exemption.
  - Every live F_P dispatch arm has a runtime manifest-presence assertion.
  - Every live F_P dispatch arm has a missing/mutated-manifest rejection
    differential.
  - The singular `evaluation_rule_evaluate` effect is covered by runtime proof
    or construct-and-block proof.
  - Registry `-006` is not changed by this ticket; any change to
    unconstrained-by-default semantics requires a separate requirement reprice.
proof_commands:
  - git diff --check
  - npm run test:t189 --prefix build_tenants/abiogenesis/typescript
  - npm run test:t183 --prefix build_tenants/abiogenesis/typescript
  - npm run test:semantic --prefix build_tenants/abiogenesis/typescript
---

# T-190: Runtime Dispatch Enumeration

T-189 earned the live fail-closed dispatch wiring and selected-entry fallback
removal. This ticket hardens the proof shape so future runner changes cannot
quietly add an unbound F_P arm behind a source-text census.

The design decision on registry constraints is not reopened here. ABG's current
law is registry-universe first, optional vector constraints second, and no
selected-entry backfill. If the project later wants intrinsic edge contract
defaults instead of unconstrained absent fields, that is a separate
requirement reprice against `REQ-R-ABG3-SELECTION-APPLICATION-006`.

## Execution Record

- 2026-07-05: Ticket opened from the post-closure T-189 DMM review. No phases
  executed yet.

## Execution + Closure Record (2026-07-06)

REALIZED — the census is now the BIND PATH, not observation:
- ENGINE_FP_DISPATCH_ARM_IDS exported from the runner; every
  bindInstructionAssemblyForFpEffect call names a registered armId
  (armId is REQUIRED in the input type — a new site cannot compile without
  naming an arm; an unregistered armId throws before any manifest binds,
  and T-189 law already blocks dispatch without binding, so an
  unregistered arm cannot dispatch at all). Seven sites named:
  scalar_transform, scalar_evaluate, composed_transform,
  composed_consequence (x2 paths), evaluation_rule_batch (x2 paths).
- Source-text census DELETED from the t189 lane (readFileSync scrape and
  its test removed); replaced by classification-as-data
  (T190_ARM_CLASSIFICATION) with registry set-equality — a new registered
  arm without a classification row fails the suite by construction.
- Runtime proofs added: evaluate arms (scalar evaluate + rule batch)
  receive admitted manifests (observer assertions on live plugin inputs);
  composed consequence receives manifest (fixture gained an OPT-IN
  consequence/F_P regime binding — default off, existing composition
  identities unchanged); mutation differentials per stage: omitted
  transform/evaluate/consequence plan blocks that stage's plugins before
  invocation with gap_stop naming the stage.
- Latent singular evaluation_rule_evaluate: CONSTRUCT-AND-BLOCK realized
  in both executor twins (sync/async) — a manifestless effect input
  throws before plugin invocation; differential proves the plugin never
  runs unbound and runs exactly once with a manifest.
- SELECTION-APPLICATION-006 preserved: no registry-constraint semantics
  changed by this ticket (the F5 ambiguity fix earlier today was its own
  recorded change and did not touch -006's unconstrained-by-default law).

Gates at closure: t189 lane 11/11; test:t183 16/16; test:t188 26/26;
test:semantic 1068/1068; git diff --check clean; STANDING CLOSURE GATE
test:t194:sandbox-live 1/1 (fresh run, first enforced use).

## Post-Closure Self-Review (2026-07-06, same day)

Findings against my own closure, fixed in-pass:
1. VACUITY HOLE (real, not hiding a vacuous pass): the scalar_evaluate
   assertion was conditional (`if observed.evaluator !== null`) — the
   cited proof could have passed with the evaluator never invoked.
   Hardened to an unconditional invocation guard; the evaluator IS
   invoked (proof was real, weakly asserted).
2. IDENTITY GAP: presence-only manifest assertions on the new arms;
   added per-stage planRef identity (evaluate plan to evaluate arms,
   consequence plan to the consequence task) — presence-not-differential
   discipline applied to my own tests.
3. Dead census artifacts removed (RUNNER_SOURCE_PATH + unused import).
RESIDUAL (named, not fixed): the async executor twin's construct-and-block
guard is code-identical to the sync twin but only the sync path has a
differential (resolveAsyncEnginePluginEffect is unexported); the runtime
armId assert is dead code under TS callers (the union type is the compile
gate) and guards only non-TS/cast callers — both acceptable, both named.
Lane 11/11; semantic re-verified green.
