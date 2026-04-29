# M04 Public Start Derivation

**Status**: Active
**Date**: 2026-04-23
**Purpose**: Derive the first TypeScript `M04-app-bootstrap` public-start
boundary from the paused Python reference design without importing Python
controller/bootstrap drift as architecture.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-031-runtime-identity-and-configured-worker.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`
- `.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md`
- `.ai-workspace/tickets/completed/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md`

## 2. Position

The TypeScript `M04` line does not start from Python `cli_adapter.py`,
`gen_start()`, or install/bootstrap helpers as architecture.

It starts from the paused Python reference **design truths**:

- public execution is graph-function-first
- package/bootstrap remains a delivery binding above kernel-owned runtime law
- runtime identity and configured worker resolution remain explicit
- public operator proof is execution-chain proof, not parser-local proof
- event truth is kernel-owned and still flows through the canonical emit path
- the public command grammar is tenant-invariant; only the executable prefix
  and delivery adapter may differ
- after `T-072`, public start does not own one-transition advancement logic;
  it delegates to the ABG-owned `start -> iterate` runner

## 3. Preserved Boundary Truth

The first TypeScript `M04` slice preserves these truths from the Python line:

- there is one public start ingress over kernel truth
- operator input is normalized once at the public boundary
- the app/bootstrap layer routes into kernel carriers rather than inventing a
  second runtime doctrine
- `publicStart(...)` is a compatibility adapter over `start(...)`, not a
  second execution route
- runtime identity and configured worker resolution remain explicit public
  inputs or projections
- public proof must show a deeper runtime consequence, not only ingress
  acceptance

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally demotes these Python-shaped details to
delivery binding or deferred concern:

- Python executable prefix and adapter wiring
- `cli_adapter` helper layout
- install-specific shell behavior
- auto progression loops
- human-proxy control flow
- later event-ingress and assessment command surfaces

Those may reappear as TypeScript delivery surfaces later, but they do not
define the first TypeScript `M04` boundary.

This demotion does not permit divergent public command grammar. The shared
`start`, `gaps`, `assess-result`, target, `until`, `fh-mode`, and `root-mode`
grammar is product-policy truth above tenant delivery.

`auto progression loops` here means package-level or CLI-level repetition over
public calls. It does not demote the ABG internal iteration engine required by
`REQ-R-ABG3-INTERPRET-009` through `REQ-R-ABG3-INTERPRET-012`.

The first `M04` public-start slice originally stopped at one admitted public
advancement result. After `T-072`, that transitional rule is superseded.
`publicStart(...)` and `start(...)` both route through the same engine-owned
runner. M04 may parse and project public truth; it must not derive
advancement, select vectors, emit traversal facts, or close a graph function
through local public-start code.

## 5. First TypeScript M04 Target

The first TypeScript `M04` slice should realize only:

- one public start request carrier
- one public start outcome family
- one explicit runtime or worker identity projection path
- one canonical route into completed `M03` `start -> iterate` engine carriers

This first slice should **not** widen into:

- auto loops
- proxy approval
- downstream live-status or proof-hold projections
- sandbox/scenario harnesses

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| public `gen-start` is the operator-facing entry | package-first `M04` public start entry | root package exports one bounded public start surface rather than many controller helpers |
| execution-chain proof is primary | module-owned `M04` integration lane | proofs must show public input changing a deeper runtime consequence |
| controller and adapter layers are delivery bindings only | TypeScript `app/m04/**` stays below kernel meaning | package code parses, projects, and routes through `start(...)`; it does not define advancement law |
| runtime identity and configured worker remain explicit | `M04` request/outcome boundary preserves runtime identity explicitly | helper-owned worker or build defaults are out of design |
| canonical event truth stays kernel-owned | public start routes through completed `M03` engine runner and emit surfaces | no direct event append or event reconstruction from package/bootstrap code |

## 7. Required Next Assets

Before `M04` implementation starts, this derivation must be followed by:

- the `M04` first-slice IACS
- the `M04` authority/role matrix
- the `M04` subordinate payload register
- the `M04` structural carrier diagram in Mermaid UML
- the `M04` strict-lane expansion

Only then is `M04` ready for implementation.
