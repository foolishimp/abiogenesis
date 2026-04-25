# T-046 Wire TypeScript Public Execution To Replay-Derived M03 Iteration

- id: T-046
- title: Wire TypeScript public execution to replay-derived M03 iteration
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: T-044
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: close the governance gap where M03 can derive replay-based graph-function iteration but public/package execution still repeats public start without passing replay-derived runtime truth into the engine
- change_class: design_reframe
- re_entry_point: typescript_m03_m04_design_surface
- triaged_at: 2026-04-25
- priority: critical
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-041 completed
  - T-044 completed
  - B-030-TS completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_*`, `build_tenants/abiogenesis/typescript/design/M04_*`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: none
- library_rationale: this is core `M03-engine-kernel` to `M04-app-bootstrap` execution authority; reusable helper extraction is subordinate to closing the runtime authority seam
- target_truth: public/package TypeScript execution advances composed graph functions through one replay-derived M03 iteration surface, with `public start` acting as ignition or entry resolution rather than next-edge law
- superseded_truth: `publicStartFromRequest(...)` calls `deriveAdvancementTransition(basis)` with no replay events, and supervised public control repeats public start over the same request rather than consuming replay-derived iteration state
- closure_law: this ticket closes only when public/package execution consumes replay-derived runtime events or projection for graph-function advancement, and no accepted public proof treats repeated public-start calls as the internal iteration engine
- evaluation_criteria:
  - M03 exposes one admitted iteration/advance function or carrier that consumes prior event truth or projection
  - M04 public start/control/callable start invoke that engine truth rather than repeating first-step start as next-edge law
  - composed three-stage graph-function proof runs through the public/package path, not only a harness-directed M03 unit path
  - negative proof rejects first-vector-only and public-start-repetition closure
  - design surfaces say whether public start is ignition-only or full execution entry
- non_closure_conditions:
  - `publicStartFromRequest(...)` still calls `deriveAdvancementTransition(basis)` with an empty event stream in normal execution
  - `publicControlLoopFromRequest(...)` still advances by issuing the same public-start request repeatedly
  - M03 replay iteration remains test-only or harness-only
  - public/package proof can pass without replay-derived next-edge truth
- proof_surface:
  - module-derived unit tests for M03 iteration over replay
  - integration proof through public/package callable execution
  - sandbox/UAT proof for a composed three-stage graph function
  - negative proof for repeated public-start next-edge law
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: public/package execution derives one transition from a fresh basis and supervised control repeats public start without replay-owned next-edge state
- new_truth_path: replay-derived M03 iteration governs next-edge advancement and M04 consumes that authority through one public execution entry
- producers_old:
  - `code/src/app/m04/public_start.ts`
  - `code/src/app/m04/control/control_loop.ts`
  - `code/src/app/m04/max_autonomy/callable_start.ts`
- producers_new:
  - M03 replay event stream or aggregate projection
  - M03 iteration advance carrier/function
  - M04 public execution binding to M03 iteration truth
- consumers_old:
  - public start
  - public control loop
  - callable start wrappers
  - sandbox proof that exercises package execution
- consumers_new:
  - M04 public start/control/callable surfaces
  - M05 sandbox/live proof lanes
  - downstream package/bootstrap users
- derived_surfaces:
  - live status projection
  - stop taxonomy
  - test surface map
  - RC live/sandbox reports

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] if the work exists in more than one build tenant, this backlog/active ticket carries only one tenant lifecycle and any sibling tenant work lives on its own suffixed ticket
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Functional Review Criteria

1. Does public/package execution traverse graph functions through replay-derived M03 state?
2. Is public start clearly bounded as ignition/entry location if it is not itself the iteration engine?
3. Can a reviewer trace a three-stage graph function from GTL publication to ABG runtime events to next-edge decision to public/package proof?
4. Does removing replay truth fail closed instead of silently falling back to first-vector dispatch?

## Required Break Order

1. Inventory M03 and M04 public execution interfaces that currently call start or transition derivation.
2. Ratify the M03-to-M04 execution seam if current design wording is insufficient.
3. Publish or expose the replay-derived iteration source carrier/function.
4. Rebind public start/control/callable start to that source truth.
5. Reprice proof lanes so harness-only M03 iteration no longer counts as public execution closure.
6. Add negative proof for start-repetition and first-vector-only behavior.

## Closure Evidence

Completed on 2026-04-25.

- `PublicStartContext` now carries optional replay `runtimeEvents`.
- `publicStartFromRequest(...)` derives transitions from replay events and emits graph-call/frame/vector traversal facts.
- F_D public advancement emits vector evaluated/closed facts so supervised re-entry advances from replay-derived closure truth.
- `publicControlLoopFromRequest(...)` accumulates emitted runtime facts and re-enters public start with replay context.
- B030 complete-start proof now converges from replay-derived supervised execution.
- Proof: `npm run test:b030`, `npm run test:t013`, `npm run test:t044`, `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
