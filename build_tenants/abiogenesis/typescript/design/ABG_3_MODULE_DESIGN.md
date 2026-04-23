# ABG 3 Module Design

**Status**: Active
**Date**: 2026-04-23
**Purpose**: Human-readable design and impact assessment for the ABG 3 TypeScript line, focused on package-first delivery, engine-owned runtime truth, and the runtime/module cut required by the ABG 3 constitution.

## 1. Position

ABG 3 keeps the same center:

- GTL declares law
- ABG interprets, enforces, emits facts, and projects truth
- the event stream remains the one runtime truth surface

The TypeScript line does not change ABG ontology.

Its first design task is to realize the same runtime law without:

- controller-owned semantic centers
- open JSON trusted inside the runtime kernel
- package entrypoints acting as runtime doctrine

Public execution entry remains graph-function-first:

- jobs bind published graph functions
- ABG materializes and executes those graph functions
- graph vectors remain internal realized invariant boundaries for local
  evaluation, proof, and closure

The target default profile remains broad and F_P-biased:

1. Try deterministic constructive and proof paths when they exist.
2. If they do not exist, or they do not close the contract, fall forward to
   governed F_P execution.
3. Escalate to F_H only when the resolved escalation policy still requires it.

That rule is governed explicitly by ADR-042.

## 2. Why A TypeScript ABG Line Exists

The TypeScript line exists because the product needs a realization that fits:

- package-first enterprise deployment
- strong discriminated-union carrier design
- native alignment with MCP and related agent tooling
- runtime reach across Node, Bun, and Deno

Those are delivery and realization concerns.
They do not justify weakening ABG runtime law.

## 3. Design Goals

### 3.1 Goals

- preserve the ABG 3 carrier-and-event runtime model
- keep package entrypoints and runtime adapters as delivery bindings only
- express advancement and runtime outcome through closed carrier families
- admit plain-object ingress once, then carry typed truth inward
- keep runtime portability below the public operator contract

### 3.2 Non-goals

- invent a second workflow language above GTL
- move policy or runtime truth into package entrypoints
- prescribe one permanent runtime choice before the tenant proves itself
- let TypeScript escape hatches become a second semantic center

## 3A. Reference Derivation Rule

The TypeScript ABG line derives from the released Python ABG design through:

- `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
- `ABG_3_FIRST_SLICE_IACS.md`
- `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md`
- the TypeScript ADR chain in `design/adrs/`

That derivation is design-first.

The TypeScript line is allowed to reshape delivery bindings for package-first
runtime entry, strict TypeScript typing, and closed effect edges, but it is not
allowed to inherit Python controller drift or file layout as architecture.

The implementation order for ABG is:

1. TypeScript ABG design
2. module-bounded ABG carrier assets
3. implementation ticket
4. code

If an ABG change cannot point to that chain, it is not yet ready for
implementation.

## 4. Delivery Boundary

The TypeScript tenant is package-first.

The shared structural ownership for this boundary remains
`build_tenants/common/design/modules/M04-app-bootstrap.yml`.
This document binds that shared app-bootstrap law to the TypeScript line's
package-first delivery posture. It does not replace the shared `M04` module
surface with a second tenant-local bootstrap doctrine.

That means:

- the primary artifact is an installable package line
- compiled single-file executables are optional delivery artifacts, not the
  governing design assumption
- Node, Bun, and Deno are shell/runtime choices around the same carrier and
  event law

The delivery boundary may normalize:

- process startup
- environment/config ingress
- runtime-specific transport wiring
- packaging and installation

It may not define:

- advancement truth
- convergence truth
- public operator meaning
- closure doctrine

## 5. Core Thesis

The TypeScript ABG line adds no new ontology.
It realizes two existing ABG 3 requirements explicitly:

### 5.1 Configured default policy stays engine-owned

Policy resolution remains engine-owned and carrier-readable.

TypeScript package code may load configuration and adapters at ingress, but it
must not let runtime choice or package wiring become semantic authority.

### 5.2 Post-dispatch runtime stays engine-owned

After a traversal reaches an F_P boundary, ABG owns:

- dispatch request creation
- worker/backend resolution
- result-artifact loading
- proof/evaluation replay
- closure decision
- retry/correction scheduling
- fact emission for every stage

Package entrypoints may still poll, present, proxy, or request approval.
They do not become the owner of F_P runtime truth.

## 6. TypeScript Implementation Consequence

The TypeScript line should prefer:

- discriminated unions for runtime transition families
- readonly carriers for semantic centers
- explicit boundary parsers/validators
- exhaustive switching over runtime variants

It should reject:

- controller-local reconstruction from raw objects
- mutable shared result bags
- unchecked casts to silence the type checker
- package-level helper orchestration that outranks emitted events and runtime
  carriers

## 7. First Slice Carrier Boundary

The first ABG runtime code wave is constrained by
[ABG_3_FIRST_SLICE_IACS.md](./ABG_3_FIRST_SLICE_IACS.md).
Its completed structural sign-off asset is
[ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md](./ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md).

The next `M04-app-bootstrap` public-start wave derives from
[M04_PUBLIC_START_DERIVATION.md](./M04_PUBLIC_START_DERIVATION.md) before any
tenant-local `M04` carrier inventory or code is opened.
Its first module-bounded carrier assets are:

- [M04_FIRST_SLICE_IACS.md](./M04_FIRST_SLICE_IACS.md)
- [M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md)

The completed next `M04-app-bootstrap` control-mode wave derived from
[M04_CONTROL_LOOP_DERIVATION.md](./M04_CONTROL_LOOP_DERIVATION.md).
Its module-bounded carrier assets are:

- [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](./M04_CONTROL_LOOP_FIRST_SLICE_IACS.md)
- [M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed control-mode wave stays above completed `publicStart(...)`
truth. It does not authorize direct event append, event-ingress,
result-assessment, or install/bootstrap widening.

The completed `M04` work in this tenant now includes:

- one admitted public-start request carrier
- one closed public-start outcome family
- one admitted public control-loop request carrier
- one closed public control-loop outcome family
- one bounded supervision route over repeated `publicStart(...)`
- one bounded `human-proxy` route over explicit public stop detail

No later `M04-app-bootstrap` wave is active yet.
Event-ingress, result-assessment, install/bootstrap, bootloader, and later
qualification families remain deferred until successor tickets open them.

## 8. Effect Boundary Rule

The canonical effect shell does not accept open carrier truth.

That means:

- `emit(...)` accepts only members of the closed `RuntimeEvent` family
- dispatch/transport effect edges accept only closed request carriers derived
  from the transition family
- `unknown`, `Record<string, unknown>`, or generic object bags are lawful only
  at named ingress parsers, never as the canonical argument type of the effect
  shell

If a later TypeScript implementation creates an effect boundary that erases
typed carriers to an open object bag, that implementation is out of design.
