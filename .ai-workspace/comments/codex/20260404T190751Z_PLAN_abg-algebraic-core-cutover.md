# PLAN — ABG Algebraic Core Cutover

**Status**: Posted execution plan
**Date**: 2026-04-04
**Scope**: `build_tenants/abiogenesis/python/` and all governing truth surfaces that would otherwise preserve semantic drift
**Constraint State**: no compatibility shims, no parallel semantics, no retained compromise surfaces

## Purpose

This is not an additive cleanup.

The work must:

1. strip all legacy semantic references that can pull the engine back toward partial/boolean governance
2. break the current core deliberately
3. rebuild outward from one typed, algebraic execution center
4. leave no live dual-truth surface behind

If old and new semantics coexist, the migration fails.

## Non-Negotiable Rules

- one live run algebra
- one live failure algebra
- one lawful event-emission path
- one projection source for CLI/control-plane summaries
- no boolean field may contradict emitted event truth
- no compatibility aliases unless declared as temporary deletion targets in the same tranche

## Governing Shape

The target kernel shape is:

`Command -> Event* -> SubstrateEvaluation -> DomainEvaluation -> Route`

with these invariants:

- commands are requests, not facts
- events are facts, not commands
- substrate evaluation classifies execution and contract truth
- domain evaluation preserves evaluator results faithfully but does not rewrite substrate truth
- routing is derived from typed state, not caller-local booleans
- once `fp_dispatched` exists, `handled=false` is illegal

## Phase 0 — Reprice Truth First

Before code changes, update all active truth surfaces together so the repo stops teaching the old model.

Required surfaces:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG2-RUN.md`
- `specification/requirements/abg/REQ-R-ABG2-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG2-TRANSPORT.md`
- `specification/requirements/product/REQ-P-QUAL.md`
- `specification/requirements/product/REQ-P-POLICY.md`
- `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
- `docs/ABG_Design_Document.md`
- `docs/USER_GUIDE.md`

Decisions to settle once:

- choose the canonical failure algebra and delete the rejected one everywhere
- choose the canonical successful terminal representation and delete the rejected one everywhere
- choose the canonical event-emission ownership boundary
- choose whether lifecycle failure is emitted explicitly, derived centrally, or both through one transition owner

Acceptance gate:

- no active truth surface describes the superseded model
- no active design surface leaves semantic ownership ambiguous

## Phase 1 — Strip Drift-Back Surfaces

Delete or invalidate legacy semantic anchors before rebuilding.

Prime targets:

- flat successful terminal state assumptions
- old failure-taxonomy names if superseded
- `auto_fp_dispatch_handled`
- direct `EventStream.append()` writes outside the lawful boundary
- consumer-local lifecycle interpretations

Prime file set:

- `build_tenants/abiogenesis/python/code/genesis/run.py`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/abiogenesis/python/code/genesis/subwork.py`

Acceptance gate:

- drift-back names and fields are removed or explicitly marked as deletion-in-progress
- code does not silently continue to project the old semantics

## Phase 2 — Break and Rebuild the Core

Make `run.py` the single owner of canonical lifecycle and failure truth.

Required changes:

- define the canonical run algebra
- define the canonical failure algebra
- define one replay/projection surface
- define structured control-plane outcome types
- define central transition helpers for lifecycle projection

Explicit rule:

- do not preserve aliases in `run.py`
- force downstream breakage and repair consumers afterward

Acceptance gate:

- there is only one lifecycle/failure definition site
- no other module declares competing semantic enums or state interpretations

## Phase 3 — Re-Centralize Event Emission

Make the declared event law true in code.

Required changes:

- `events.py` becomes the only lawful write surface
- `interpret.py` stops calling `EventStream.append()` directly
- lifecycle event construction happens through canonical helpers
- provenance invariants are enforced at the canonical surface

Acceptance gate:

- traversal/orchestration code cannot bypass the lawful emission surface
- event payload construction is not smeared across call sites

## Phase 4 — Make Transport Classification Total

Rebuild `transport.py` and `subwork.py` around total substrate classification.

Required changes:

- subprocess timeout and nonzero exit remain substrate failures even if an artifact exists
- missing/empty artifact classification is unique
- malformed/schema-invalid artifact classification is unique
- successful subprocess plus artifact presence is never enough to claim certification success

Acceptance gate:

- each failure class has one lawful classification path
- no artifact presence can erase transport truth

## Phase 5 — Rebuild Traversal from the Core

`interpret.py` must consume the core, not own parallel semantics.

Required changes:

- bind runs through canonical helpers
- emit lifecycle truth through canonical helpers
- use projected run truth for pending deduplication, retry, and supersession
- stop inventing ad hoc lifecycle payloads in traversal

Acceptance gate:

- traversal is an orchestrator over the core, not a second semantics engine

## Phase 6 — Rebuild CLI as Pure Projection

`cli_adapter.py` must project from canonical run truth.

Required changes:

- replace `bool(auto_fp_dispatch(...))` with typed outcome handling
- delete `auto_fp_dispatch_handled` if it duplicates or contradicts canonical truth
- make `assess-result` consistent with the new lifecycle model
- make command result JSON a projection of central run truth and product policy

Acceptance gate:

- CLI summary fields are derivable from the canonical run/event model
- no caller-local boolean summary can deny a handled failed dispatch

## Phase 7 — Repair All Consumers

After the core is stable, repair every module that still encodes the old meaning.

Known consumers:

- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/abiogenesis/python/code/genesis/subwork.py`
- `build_tenants/abiogenesis/python/code/genesis/services.py`
- docs and design surfaces that still teach the old event/lifecycle model

Acceptance gate:

- no live consumer assumes the superseded state or taxonomy

## Phase 8 — Rebuild Tests to the New Algebra

Do not preserve tests that validate the old compromise.

Required coverage:

- replay determinism from event stream
- lawful emit-only write boundary
- dispatch success
- transport failure
- missing output
- contract/schema failure
- certification failure
- timeout
- supersession
- handled-but-failed dispatch projection
- subwork uses the same failure algebra

Acceptance gate:

- tests validate the new algebra directly
- there are regression tests for each removed compromise surface

## Phase 9 — Final Drift Sweep

Before calling the work complete, sweep the tree for residual old semantics.

Search classes:

- superseded failure names
- superseded run-state names
- `EventStream.append(` outside the canonical boundary
- `auto_fp_dispatch_handled`
- ad hoc dict/boolean status fields duplicating lifecycle truth
- stale docs teaching the old model

Acceptance gate:

- one live semantic center remains
- no residual compatibility layer is carrying hidden precedent

## Completion Criteria

The cutover is complete only when:

- the active spec/design surfaces declare the new algebra explicitly
- the Python carrier implements exactly that algebra
- traversal, transport, CLI, and consumers all project from the same center
- tests prove the new algebra directly
- no old semantic compromise remains live in code, docs, design, or requirements

## Operating Warning

Do not optimize for partial green tests early.

The correct order is:

1. settle truth
2. remove drift-back semantics
3. break the center
4. rebuild the center
5. repair outward consumers
6. rebuild tests
7. sweep for residual compromise

If the work tries to preserve operability while both semantic centers coexist, the engine will drift back again.
