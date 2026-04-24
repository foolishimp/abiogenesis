# M04 Complete `gen-start` Callable Surface Derivation

**Status**: Proposed
**Date**: 2026-04-24
**Purpose**: Apply upstream `B-030` to the TypeScript tenant by
deriving the smallest lawful TypeScript `M04` boundary that can publish one
complete callable `gen-start` surface and one small stop taxonomy without
reforming kernel truth or inventing a second operator story.

## 1. Source Material

This boundary derives from:

- `specification/PRODUCT.md`
- `specification/requirements/product/REQ-P-POLICY.md`
- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `.ai-workspace/tickets/completed/B-030-publish-one-complete-gen-start-interface-and-clear-stop-taxonomy.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/code/genesis/proof_hold.py`
- `build_tenants/abiogenesis/python/code/genesis/subwork.py`
- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md`
- `.ai-workspace/tickets/completed/T-016-realize-typescript-m04-event-ingress-over-the-canonical-kernel-emission-surface.md`
- `.ai-workspace/tickets/completed/T-017-realize-typescript-m04-result-assessment-ingress-over-canonical-result-ingest-law.md`
- `.ai-workspace/tickets/completed/T-018-realize-typescript-m04-live-status-projection-over-explicit-runtime-projection-law.md`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/transport_contracts.ts`

## 2. Position

The TypeScript application of `B-030` does not patch `M03` advancement
carriers directly and it does not demote the completed `M04` lower-level
surfaces.

It starts from the current TypeScript truth already realized:

- one explicit public-start request and outcome family
- one explicit control-loop request and outcome family
- one explicit event-ingress family
- one explicit result-assessment family
- one projection-only live-status family

And it must be read in the concrete operator context of the current cut:

- the primary UX is through the agentic coder CLIs
- the completed TypeScript transport line already recognizes `claude`,
  `codex`, and `gemini` as explicit transport identities
- so "runtime unavailable", "capability missing", and related stop classes are
  not abstract labels; they have to explain those concrete operator backends

So the smallest lawful TypeScript boundary is:

- one new wrapper-facing callable-start layer above the completed `M04` public
  control surfaces
- one new stop-taxonomy projection over existing public/runtime truth

That keeps `B-030` in `M04` operator/public policy territory instead of
smuggling it down into `M03`.

## 3. Preserved Boundary Truth

The TypeScript application preserves these truths:

- the lower-level public `scope + target + until` request grammar remains lawful
- `fh_mode` and `root_mode` remain real public control families
- the new callable surface lowers to existing public truth rather than replacing it
- stop-class meaning must remain a projection over canonical runtime/public
  truth rather than downstream wrapper folklore
- `gen-start` remains the one operator story

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally demotes these Python-shaped details from the
first TypeScript application:

- CLI flag spellings and exit-code mapping
- install-shell ergonomics
- controller-local loop structure in `cli_adapter.py`
- source-vs-installed adapter wording

Those are delivery bindings. They are not the architectural center of the
TypeScript application.

## 5. Current TypeScript Coverage And Gaps

### 5.1 Already Present In TypeScript

The TypeScript tenant already has the raw ingredients needed for the new
boundary:

- convergence and nothing-to-do truth through `PublicStartOutcome` and
  `PublicControlLoopOutcome`
- explicit human-gate truth through `human_gate_required`
- explicit dispatch-required truth through `dispatch_required`
- projection-only live status over admitted public/runtime carriers
- transport/result outcomes below `M04`

### 5.2 Still Missing For B-030 Closure

Two missing TypeScript families are exposed by this application:

1. proof-hold projection is still deferred in the TypeScript line
2. transport/result/public failure meaning is still too coarse to separate:
   - worker/runtime-unavailable
   - capability-missing
   - true runtime failure

That second gap is specifically important because the current TypeScript line
already knows about agentic coder CLI transport contracts. If the public stop
taxonomy cannot say whether `claude`, `codex`, or `gemini` was unavailable,
unsupported, or failed at runtime, the operator story is still too coarse for
`B-030`.

So `B-030` cannot close in the TypeScript line just by adding a wrapper around
existing `publicStart(...)`.

It also needs:

- `T-034` proof-hold projection
- `T-035` runtime/capability/failure taxonomy repricing

## 6. First TypeScript Target

The first TypeScript `B-030` application should realize only:

- one admitted wrapper-facing complete callable `start` surface
- one deterministic lowering from that surface to the completed lower-level
  public control surface
- one closed stop-taxonomy projection over completed public/runtime truth

This first slice should **not** widen into:

- a rival operator command beside `gen-start`
- kernel-owned advancement doctrine
- CLI spellings or exit-code doctrine as the design center
- installed-shell narrative as authority

## 7. Python-To-TypeScript Mapping

| Python / product truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| bare `start` should mean maximum lawful autonomy | one explicit `M04` wrapper-facing complete callable `start` surface | downstream wrappers call one substrate surface and agent guidance may layer convenience over it |
| explicit grammar remains lawful for advanced users | completed `PublicStartRequest` and `PublicControlLoopRequest` stay public beneath the callable surface | no destructive rewrite of the lower-level contract |
| stop meaning should be small and stable | one stop-taxonomy projection over completed public/runtime truth | downstream products no longer infer stop meaning from raw `blocked`/`yielded`/`rejected` detail |
| primary UX is through agentic coder CLIs | projection must stay honest about `claude`, `codex`, and `gemini` transport reality | stop classes cannot hide the concrete backend/operator surface |
| proof-hold is product-layer projection, not controller memory | new TypeScript proof-hold projection prerequisite | current TypeScript line is not closure-ready until `T-034` lands |
| worker/runtime absence and capability gaps must not look identical | new `M03`/`M04` taxonomy prerequisite | current TypeScript line is not closure-ready until `T-035` lands |

## 8. Result Of The Application

Applying `B-030` to TypeScript yields one clear conclusion:

- the right TypeScript boundary is a new `M04` callable-start and stop-taxonomy wave

It also yields two design-module-method blocker discoveries:

- `T-034` for proof-hold projection
- `T-035` for runtime/capability/failure taxonomy clarity

So the TypeScript result is valuable now, even before code:

- it shows where the new boundary belongs
- it shows what the current TypeScript line already covers
- it shows exactly what is still missing for honest closure

## 9. Required Next Assets

Before any TypeScript implementation opens for this application, this
derivation must be followed by:

- the first-slice IACS
- the structural carrier diagram in Mermaid UML
- the TypeScript ticket carrying the Python and TypeScript source inventories
- explicit blocker tickets for the missing proof-hold and failure-taxonomy
  families
