# GATE REVIEW — ABG Algebraic Cutover Pre-Code Stages 1-4

**Date**: 2026-04-04
**Status**: stages 1-4 passed; code not yet touched in this cut
**Governing checklist**: `/Users/jim/src/apps/genesis_sdlc/.ai-workspace/comments/codex/20260404T191851Z_CHECKLIST_abg-cutover-evaluation-gates.md`
**Declared change intent**: [20260404T192803Z_CHANGE_INTENT_abg-algebraic-cutover-spec-reprice.md](/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260404T192803Z_CHANGE_INTENT_abg-algebraic-cutover-spec-reprice.md)

## Stage Scores

| Stage | Score | Evidence |
| --- | --- | --- |
| 1. Intent | `2` | `specification/INTENT.md` repriced to one run algebra, one failure algebra, one ownership split |
| 2. Requirements | `2` | `REQ-R-ABG2-RUN`, `REQ-R-ABG2-EVENTS`, `REQ-R-ABG2-TRANSPORT`, `REQ-P-QUAL`, `REQ-P-POLICY` rewritten to one executable doctrine |
| 3. Design | `2` | `PRODUCT.md`, `docs/ABG_Design_Document.md`, `docs/USER_GUIDE.md` aligned to the same doctrine |
| 4. Module ownership/design surfaces | `2` | `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md` assigns one module owner per semantic responsibility |
| 5. Code | `0` | not started in this cut |
| 6. Tests | `0` | not started in this cut |
| 7. Drift sweep | `0` | final repo-wide sweep deferred until after code and tests |

Stages 1 through 4 are now strong enough that the semantic center can be re-derived from written surfaces without consulting the old implementation.

## Pre-Code Closure Artifacts By Finding

| Finding | Pre-code closure artifact(s) | Result |
| --- | --- | --- |
| F-001 run-governance center split | `specification/INTENT.md`, `specification/requirements/abg/REQ-R-ABG2-RUN.md`, `specification/PRODUCT.md`, `docs/ABG_Design_Document.md`, `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md` | one declared run algebra |
| F-002 split failure taxonomy | `specification/INTENT.md`, `specification/requirements/product/REQ-P-QUAL.md`, `specification/requirements/abg/REQ-R-ABG2-TRANSPORT.md` | one declared failure algebra |
| F-003 event ownership ambiguity | `specification/requirements/abg/REQ-R-ABG2-EVENTS.md`, `docs/ABG_Design_Document.md`, `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md` | one declared emission boundary |
| F-004 transport non-totality | `specification/requirements/abg/REQ-R-ABG2-TRANSPORT.md`, `specification/requirements/product/REQ-P-QUAL.md` | doctrine fixed; code/tests still pending |
| F-005 CLI boolean shadow semantics | `specification/requirements/product/REQ-P-POLICY.md`, `specification/PRODUCT.md`, `docs/USER_GUIDE.md` | policy boundary fixed; code/tests still pending |
| F-006 consumer-local legacy semantics | `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`, `docs/ABG_Design_Document.md`, `docs/USER_GUIDE.md` | module projection rules fixed; code/tests still pending |
| F-007 perimeter-first rewrite risk | this change set plus declared change intent note | left-to-right gate order enforced before code |

## Doctrinal Outcome Now Fixed In Active Truth Surfaces

- Successful F_P certification projects to `assessed_pass`.
- Failed F_P certification projects to `failed` with `failure_class=certification_failure`.
- The substrate failure algebra is `transport_failure | no_output | contract_failure`.
- `emit()` is the only lawful event-emission path.
- `EventStream.append()` is internal event-substrate machinery, not a second public contract.
- CLI and control-plane outputs are product-policy projections over canonical ABG run truth.

## Pre-Code Drift Check

Searches across `specification/`, `docs/`, and `build_tenants/abiogenesis/python/design/` show:

- no live `bad_output`
- no live `auto_fp_dispatch_handled`
- `EventStream.append()` only survives as internal-substrate explanation
- `assessed` survives only as evaluator-fact event, not as successful terminal run truth

## First Lawful Code-Cut Entry Point

The next stage is **Stage 5: code**, in this order:

1. `build_tenants/abiogenesis/python/code/genesis/run.py`
   Centralize the run algebra, replay projection, and terminal truth mapping.
2. `build_tenants/abiogenesis/python/code/genesis/events.py`
   Make `emit()` the only lawful write boundary and reduce `EventStream.append()` to internal substrate.
3. `build_tenants/abiogenesis/python/code/genesis/interpret.py`
   Strip direct append semantics and local lifecycle ownership; traversal becomes a consumer of `events` and `run`.
4. `build_tenants/abiogenesis/python/code/genesis/transport.py`
   Make classification total: transport failure cannot be erased by artifact presence; malformed/schema-invalid becomes `contract_failure`.
5. `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
   Remove boolean shadow semantics and project operator output from canonical run truth.
6. `build_tenants/abiogenesis/python/code/genesis/binding.py`
7. `build_tenants/abiogenesis/python/code/genesis/services.py`
8. `build_tenants/abiogenesis/python/code/genesis/subwork.py`
   Reprice all consumers to the new semantic center only after the center itself exists.

## Constraint

No compatibility aliases are lawful in the code phase:

- do not preserve `bad_output`
- do not preserve successful terminal `assessed`
- do not preserve `auto_fp_dispatch_handled`
- do not preserve direct `EventStream.append(` bypass outside lawful internals
