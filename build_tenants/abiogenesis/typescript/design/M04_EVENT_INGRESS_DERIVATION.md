# M04 Event Ingress Derivation

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Derive the next TypeScript `M04-app-bootstrap` event-ingress
boundary from the released Python design and delivery evidence without
promoting Python CLI wiring or result-ingest behavior into the wrong
TypeScript module boundary.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/events.py`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m04_app_bootstrap_integration.py`
- `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md`
- `.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md`
- `.ai-workspace/tickets/completed/T-027-realize-a-tenant-local-abg-common-realization-library-for-expectation-derivation-contract-carriers-and-module-derived-proof-helpers.md`

## 2. Position

The next TypeScript `M04` wave does not start from Python executable wiring,
stdout formatting, or file layout.

It starts from the released Python design truths:

- event ingress is app-owned
- canonical event persistence remains kernel-owned through `emit(...)`
- ingress may validate and annotate foreign payloads, but it does not append
  directly
- approval and revocation are app-facing review commands above kernel truth
- reset is app-facing correction ingress, but reset follow-up behavior remains
  below ingress once the canonical event is emitted

## 3. Preserved Boundary Truth

The next TypeScript `M04` slice preserves these truths from the Python line:

- public event ingress is a bounded app/bootstrap concern
- canonical runtime fact write ownership stays below ingress on the kernel
  emission surface
- approval, revocation, and reset remain explicit operator-visible commands
  rather than open object payloads
- ingress may annotate explicit provenance such as workflow or runtime context,
  but the resulting emitted truth must still be carrier-owned and closed
- reset follow-up behavior remains downstream of canonical event emission, not
  a second app-owned append loop

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally demotes these Python-shaped details to
delivery binding or deferred concern:

- binary parser implementation and argparse decomposition
- stdout or exit-code conventions
- shell pre-stack command routing
- direct JSON string parsing as the public API shape
- `assessed` result-ingest command handling
- result-artifact loading and fulfillment-ledger publication

Those may reappear later as TypeScript delivery surfaces, but they do not
define the first TypeScript `M04` event-ingress slice.

## 5. First TypeScript M04 Event-Ingress Target

The first TypeScript `M04` event-ingress slice should realize only:

- one admitted public event-ingress request carrier
- one closed public event-ingress outcome family
- one bounded route for app-owned `approved`, `revoked`, and `reset` commands
- one canonical route into kernel-owned `emit(...)` truth

This first slice should **not** widen into:

- `assessed` event ingress
- result-artifact or fulfillment-ledger ingestion
- live-status projection
- install/bootstrap
- bootloader ownership
- sandbox/scenario qualification

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| CLI event command validates payloads above the kernel | bounded `M04` request admission | foreign input is validated once at app ingress |
| `_emit_workspace_event(...)` routes through `emit(...)` | event-ingress route binds only to canonical emission | app/bootstrap does not append facts directly |
| `approved` and `revoked` are review commands | first-slice event command family includes review command variants | review truth remains explicit and closed |
| `reset` is correction ingress with follow-ups below emission | first slice includes reset command ingress but not separate app-owned follow-up logic | correction follow-up stays downstream of canonical emit |
| `assessed` depends on result-ingest and fulfillment truth | defer `assessed` to result-assessment wave | `T-016` does not smuggle `T-017` into the first slice |

## 7. Required Next Assets

Before event-ingress implementation starts, this derivation must be followed by:

- the `M04` event-ingress first-slice IACS
- the `M04` event-ingress authority/role matrix
- the `M04` event-ingress subordinate payload register
- the `M04` event-ingress structural carrier diagram in Mermaid UML
- the `M04` strict-lane expansion

Only then is the next `M04` event-ingress wave ready for implementation.
