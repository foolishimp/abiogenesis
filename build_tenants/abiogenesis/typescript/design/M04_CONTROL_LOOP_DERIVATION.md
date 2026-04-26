# M04 Control Loop Derivation

**Status**: Active
**Date**: 2026-04-23
**Purpose**: Derive the TypeScript `M04-app-bootstrap` public-control projection
boundary from the released Python design and delivery evidence without
promoting Python controller drift into tenant-local architecture.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`

## 2. Position

The next TypeScript `M04` wave does not start from Python executable wiring,
install wiring, or helper decomposition.

It starts from the released Python design truths:

- `fh_mode` and `root_mode` remain product-policy control modes outside
  `scope + target + until`
- control-mode behavior consumes public outcome truth rather than redefining
  kernel meaning
- root-level supervision remains distinct from per-edge dispatch capability
- human-proxy approval remains an app concern above kernel-owned `F_H` truth
- yielded, dispatch-required, and human-gate-required runtime seams remain
  explicit operator-visible control seams

## 3. Preserved Boundary Truth

The next TypeScript `M04` slice preserves these truths from the Python line:

- `publicStart(...)` remains a compatibility adapter over the same engine-owned
  route as `start(...)`
- `start(...)` is the ABG-owned start-to-iterate public entry
- root supervision consumes closed public outcome truth rather than raw kernel
  payloads
- `human-proxy` approval is a bounded control-plane action over explicit public
  stop detail, not a second runtime doctrine
- supervision and proxy behavior remain above canonical `emit(...)` truth and
  do not append events directly
- public control outcomes remain replay-readable operator truth rather than
  helper-local mutable state

This control surface is not the ABG internal iterate engine. After `T-072`, it
does not repeat public calls for graph-function execution. It delegates once to
`start(...)`, then projects operator-facing control truth from the returned
public outcome.

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally demotes these Python-shaped details to
delivery binding or deferred concern:

- binary parser implementation and command wiring
- review-log file layout and shell behavior
- install/bootstrap side effects
- result-assessment ingress commands
- event-ingress commands
- live-status projection details

Those may reappear later as TypeScript delivery surfaces, but they do not
define the next TypeScript `M04` control-loop boundary.

This does not demote the shared public flag grammar. It demotes only the
Python adapter implementation and binary prefix.

## 5. Next TypeScript M04 Target

The next TypeScript `M04` slice should realize only:

- one bounded control-loop route over completed `PublicStartRequest`
- one closed control-loop outcome family over `start(...)` public outcome truth
- one supervised root-level projection path
- one bounded `human-proxy` approval path over explicit `human_gate_required`
  truth

This slice should **not** widen into:

- event-ingress commands
- result-assessment ingress
- install/bootstrap
- bootloader ownership
- sandbox/scenario qualification

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| repeated `gen_start` convergence loop was Python control-plane delivery logic | bounded TypeScript control projection over `start(...)` | repeated advancement collapses into M03 engine-owned runtime law |
| `fh_mode` remains outside traversal request grammar | explicit control-loop semantics over admitted `PublicStartRequest.controlModes` | `human-proxy` does not become target grammar |
| `root_mode=supervised` is root-level observation/recovery | closed control-loop outcome family | supervision consumes public outcome truth and returns one public control result |
| yielded/dispatch/human-gate seams stay explicit | control loop must preserve those seams as pattern-matchable outcomes | loop may stop or proxy; it must not flatten them into silent success |
| canonical event truth stays kernel-owned | control projection calls `start(...)` once and may not append events directly | app control remains projection, not runtime truth |

## 7. Required Next Assets

Before control-loop implementation starts, this derivation must be followed by:

- the `M04` control-loop first-slice IACS
- the `M04` control-loop authority/role matrix
- the `M04` control-loop subordinate payload register
- the `M04` control-loop structural carrier diagram in Mermaid UML
- the `M04` strict-lane expansion

Only then is the next `M04` control-loop wave ready for implementation.
