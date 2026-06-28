---
id: T-165
title: Prove Hello World live requirements route
type: feature
ticket_category: live_proof
status: completed
goal: >-
  Add a gated live F_P proof that the completed T-164 GTL/ABG
  requirements-algebra route works for a minimal Hello World steel thread.
  The proof must start from GTL requirement declarations, invoke a real live
  F_P worker, execute the produced Hello World artifact, emit ABG requirement
  route facts through the runtime event stream, and replay the lifecycle state
  without downstream local ledgers or caller-supplied route truth.
change_intent: >-
  T-164 closed under installed non-live proof and explicitly deferred a future
  operator-enabled live proof. This ticket supplies that live proof for the
  smallest useful downstream-facing scenario: a Hello World program. Hello
  World is only the steel-thread proof vehicle; it does not narrow the
  product scope of the generic GTL/ABG requirements route.
change_class: realization_refactor
re_entry_point: realization
owner: abiogenesis
priority: high
triaged_at: 2026-06-28
created_at: 2026-06-28
updated_at: 2026-06-29
reopened_at: 2026-06-29
closed_at: 2026-06-29
governance_scope: STDO Method, GTL, ABG, Requirements Algebra, Live Proof
build_tenant: typescript
source_documents:
  - specification/GOALS.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t164_requirements_route_facade.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/live/test_t162_requirements_algebra_live.test.mjs
affected_boundary:
  goals:
    - specification/GOALS.md
  realization:
    - build_tenants/abiogenesis/typescript/package.json
    - build_tenants/abiogenesis/typescript/test_env/live/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/live/test_t165_hello_world_requirements_route_live.test.mjs
target_truth: >-
  The T-164 route is live-proven by a Hello World steel thread. The runner
  receives GTL requirement declarations, not a caller-supplied
  RequirementRouteRuntimeContext. A live F_P worker produces the Hello World
  artifact. The proof executes that artifact and then verifies that ABG emits
  declaration, projection, evidence, fold, residual or residual absence, and
  disposition route facts through `emit()` into replay. The lifecycle read
  model is replay-derived from those events.
superseded_truth: >-
  T-164 live readiness is treated as only a closure-note defer with no
  executable proof command. A Hello World proof is accepted if it bypasses the
  live F_P transport, constructs route truth locally, or asserts on a result
  side-channel instead of the event stream.
closure_law: >-
  Close only when `test:t165:hello-world-live` exists, is env-gated like the
  existing live proof lane, and proves a real live F_P worker produced a Hello
  World program artifact that executes successfully while the ABG requirements
  route closes through runtime-emitted replay facts. Closure must prove no
  caller-supplied route context, no downstream public emitters, no product-local
  ledger, no query-first invention of fold, residual, or disposition truth, and
  no prompt-side preconstruction of the Hello World program source.
non_closure_conditions:
  - The proof does not call a real live F_P transport worker.
  - The prompt gives the live worker the exact program source, exact artifact
    JSON, or exact fulfillment answer expected for closure.
  - The proof passes `RequirementRouteRuntimeContext` into the runner.
  - The proof asserts against non-replay side arrays or local route payloads
    instead of `emittedEvents`, `replayEvents`, or the configured sink.
  - The Hello World artifact is not executed.
  - The route emits fold, residual, or disposition truth outside `emit()`.
  - Disposition is computed without admitted ABG continuation truth.
  - The live proof requires downstream `glc.*`, `sdlc.*`, or product-local
    requirement carriers.
  - The test is not env-gated and therefore runs live transport in ordinary
    semantic test lanes.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t164
  - cd build_tenants/abiogenesis/typescript && npm run test:t165:hello-world-live
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - git diff --check
---

# T-165: Prove Hello World Live Requirements Route

## STDO Triage

### First Missing Layer

`realization`.

T-164 already ratified and realized the requirements-route law. The missing
piece is the live proof command that its closure note intentionally deferred.

### Lawful Re-Entry

`realization_refactor`.

No product, requirement, or design law changes are intended. This ticket adds
the live proof surface and package script for a completed route.

## Required Work

1. Add `test:t165:hello-world-live` to the TypeScript package scripts.
2. Add an env-gated live test under `test_env/live/`.
3. Make the live F_P worker return a Hello World program artifact.
4. Execute the returned Hello World artifact and verify stdout.
5. Run the ABG runner with `requirementRouteDeclarationBundle`, not route
   context.
6. Assert route facts in `replayEvents`, `emittedEvents`, and the event sink.
7. Project lifecycle state from replayed route events.
8. Replace the current live-transport smoke prompt with a proof-grade prompt
   that gives the worker requirement pressure and output contract only, without
   the exact source text or prefilled fulfillment answer.

## Acceptance Checklist

- [x] GOAL-012 names the Hello World live-proof wave.
- [x] T-165 live test is env-gated by `ABG_TS_T165_HELLO_WORLD_LIVE=1` or
      `CODEX_LIVE_FP=1`.
- [x] Smoke test invokes a real F_P transport worker.
- [x] Smoke test returns a Hello World program artifact.
- [x] Smoke test executes the returned program and verifies `Hello, world!`.
- [x] Smoke test activation uses GTL declarations through
      `requirementRouteDeclarationBundle`.
- [x] No caller-supplied `RequirementRouteRuntimeContext` is passed to the
      runner.
- [x] Requirement route facts are asserted from `replayEvents`,
      `emittedEvents`, and the configured event sink.
- [x] Disposition joins ABG continuation truth and closes.
- [x] Lifecycle state is projected from replayed route events.
- [x] `npm run test:t165:hello-world-live` passes as a proof-grade live test
      when live env is enabled.
- [x] Live proof prompt omits the exact Hello World program source.
- [x] Live proof prompt omits the prefilled fulfillment answer.
- [x] Live worker constructs the program from requirement pressure and an
      output contract rather than copying a source literal supplied by the
      harness.
- [x] Closure record classifies the live lane as proof, not only transport
      smoke, with trace evidence.
- [x] `git diff --check` passes.

## Implementation Progress

- 2026-06-28: Added `test:t165:hello-world-live` as an env-gated live smoke
  lane. The test invokes a real F_P transport worker, requires a structured
  Hello World program artifact, writes and executes the returned JavaScript
  program, and admits the execution as runtime evidence.
- 2026-06-28: The live proof drives the runner with
  `requirementRouteDeclarationBundle`; it does not pass a caller-supplied
  `RequirementRouteRuntimeContext`. It asserts declaration, projection,
  evidence, fold, residual absence, and disposition route facts through
  `replayEvents`, `emittedEvents`, and the configured sink.
- 2026-06-28: The smoke lane projects lifecycle state from replayed route
  events and verifies that disposition joins ABG continuation truth.
- 2026-06-29: Reopened. The live lane is a valid bare smoke test for real
  F_P worker invocation, artifact execution, route emission, and replay
  plumbing, but it is not proof-grade because the prompt supplies the exact
  Hello World source and prefilled fulfillment answer.
- 2026-06-29: Added a prompt-carry proof guard. The test now writes a
  requirement source file, declares it through GTL with a digest, admits it
  through the ABG requirements route, builds the F_P prompt from the admitted
  active requirement environment, and fails if the prompt contains the exact
  implementation source, exact expected-output JSON field, or prefilled
  fulfilled answer. The live worker now receives admitted requirement pressure
  and an output contract, then constructs and returns the executable program.

## Earlier Smoke Evidence And Non-Closure Finding

The 2026-06-28 live run is retained as smoke evidence only. It does not close
T-165.

Latest smoke run artifact:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260628T142425269Z_pid84119`

Live worker artifact summary:

- actor: `claude`
- program: `hello.js`
- source: `console.log("Hello, world!");`
- expected stdout: `Hello, world!\n`
- fulfillment status: `fulfilled`

Smoke run:

```bash
cd build_tenants/abiogenesis/typescript && npm run test:t165:hello-world-live
cd build_tenants/abiogenesis/typescript && npm run test:t164
cd build_tenants/abiogenesis/typescript && npm run lint:semantic
cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
git diff --check
```

`npm run test:t165:hello-world-live` includes `npm run build:semantic` before
the live lane. The command passed with one live test, zero failures. `npm run
test:t164` passed 29 tests, zero failures.

Non-closure finding: the current prompt contains the exact JSON shape, exact
`hello.js` file name, exact JavaScript source, exact expected stdout, and exact
fulfilled assessment. That proves live worker process invocation and route
plumbing, but not independent F_P construction from requirement pressure.

## Closure Evidence

Closed on 2026-06-29 under proof-grade live F_P route proof.

Latest proof run artifact:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260628T151338866Z_pid21165`

Requirement-carry facts:

- GTL declaration source ref:
  `file:///Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260628T151338866Z_pid21165/hello-world-requirement.txt`
- source digest:
  `sha256:bd625fab9ccaf6ab5b7e856acfced92a0c58c0a2905fec55d80508955f705b2d`
- admitted context:
  `fragment://t165/live-requirement-carry`
- prompt guard:
  `T-165 prompt carries admitted requirements without preconstructed source`

Live worker artifact summary:

- actor: `claude`
- program: `hello-world.js`
- source was generated by the live worker, not supplied in the prompt:
  `console.log("Hello, world!");`
- execution was performed through the governed traced-process substrate:
  `hello-world-execution.trace/result.json`
- expected stdout: `Hello, world!\n`
- fulfillment status: `fulfilled`
- evidence refs include the requirement source file, source digest, and
  admitted requirement context fragment.

Proof run:

```bash
cd build_tenants/abiogenesis/typescript && npm run test:t165:hello-world-live
cd build_tenants/abiogenesis/typescript && npm run test:t164
cd build_tenants/abiogenesis/typescript && npm run lint:semantic
cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
git diff --check
```

`npm run test:t165:hello-world-live` includes `npm run build:semantic` before
the live proof. The command passed two tests, zero failures:

- `T-165 prompt carries admitted requirements without preconstructed source`
- `T-165 live Hello World proof closes through the GTL/ABG requirements route`

The prompt-carry test proves the prompt is assembled from the admitted ABG
requirement environment and rejects prompt-side preconstruction. The live test
then invokes the real F_P worker, executes the returned artifact, and verifies
the requirements route through `replayEvents`, `emittedEvents`, and the
configured event sink.
