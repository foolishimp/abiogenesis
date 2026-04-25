# ABG 3 Module Design

**Status**: Active
**Date**: 2026-04-23
**Purpose**: Human-readable design and impact assessment for the ABG 3 TypeScript line, focused on package-first delivery, engine-owned runtime truth, and the runtime/module cut required by the ABG 3 requirement families.

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

### 5.3 Graph-function iteration stays engine-owned

The TypeScript line must preserve the ABG interpretation split established by
`REQ-R-ABG3-INTERPRET-009` through `REQ-R-ABG3-INTERPRET-012`.

`publicStart(...)` is a public ignition boundary. It locates, admits, or
resumes a lawful graph-function execution boundary.

It is not the complete execution engine.

The runtime engine must own the internal iteration law beneath that public
boundary:

- materialize the published `GraphFunction` for the active `Job`
- open or resume the corresponding `GraphCall`
- derive the next lawful internal `GraphVector` traversal from replay-derived
  graph-call, frame, traversal, evaluation, proof, and closure truth
- emit canonical runtime facts for that traversal
- project what now holds from event truth
- continue until convergence, failure, hold, continuation, yielded handoff,
  human gate, or another lawful public stop condition is reached

A TypeScript implementation that materializes a composed graph function but
dispatches only `graph.vectors[0]` has not realized graph-function execution
parity. It has only proven one-vector admission over a composed declaration.

The existing `M04` control loop remains an operator-facing supervision route
over public outcomes. It is not a substitute for the internal ABG iterate
engine, because package-level repetition over `publicStart(...)` cannot own
next-edge runtime law.

Design consequence:

- `M03-engine-kernel` owns next-edge planning and advancement carriers
- `M04-app-bootstrap` owns public ingress, delivery routing, and operator
  projection only
- installed sandbox proof must include at least one composed graph function
  whose progression is selected by replay-derived runtime truth rather than a
  harness replay or first-vector shortcut

The concrete TypeScript `M03` design pack for this consequence is:

- [M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md](./M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md)
- [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md)
- [M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md)

### 5.4 Retry/repair and leaf tasks stay substrate-owned

Generic retry/repair and bounded leaf-task execution are `M03-engine-kernel`
runtime governance law.

Retry is not transport retry. A retryable same-edge repair attempt must mint
fresh runtime identity, regenerate prompt and manifest truth from current
projection, preserve prior attempts as evidence only, consume explicit budget
truth, and stop or escalate through authoritative runtime facts.

Leaf-task execution is not helper dispatch. It is subordinate runtime work
under the parent run, graph-call, frame, and vector boundary with
schema-validated input/output and typed failure truth.

The concrete TypeScript `M03` design pack for this consequence is:

- [M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md](./M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md)
- [M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md](./M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md)
- [M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md)

### 5.5 Runtime failure taxonomy stays canonical across M03/M04

Runtime/payload failure classification is `M03-engine-kernel` truth consumed
by `M04-app-bootstrap` projection.

The TypeScript line must preserve a closed `RuntimeFailureClass` taxonomy for:

- runtime unavailable
- capability missing
- runtime execution failure
- payload contract failure

`M04` may expose those classes in public result assessment and live status, but
it must not reconstruct them from reason text, CLI stderr, downstream wrapper
labels, or local operator projection rules.

The concrete TypeScript `M03`/`M04` design pack for this consequence is:

- [M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md](./M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md)
- [M03_M04_RUNTIME_FAILURE_TAXONOMY_FIRST_SLICE_IACS.md](./M03_M04_RUNTIME_FAILURE_TAXONOMY_FIRST_SLICE_IACS.md)
- [M03_M04_RUNTIME_FAILURE_TAXONOMY_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_M04_RUNTIME_FAILURE_TAXONOMY_STRUCTURAL_CARRIER_DIAGRAM.md)

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

The completed next `M04-app-bootstrap` wave derived from:

- [M04_EVENT_INGRESS_DERIVATION.md](./M04_EVENT_INGRESS_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M04_EVENT_INGRESS_FIRST_SLICE_IACS.md](./M04_EVENT_INGRESS_FIRST_SLICE_IACS.md)
- [M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed event-ingress wave now routes app-owned `approved`, `revoked`,
and `reset` command ingress through the canonical emission surface.
Its first slice was bounded to app-owned `approved`, `revoked`, and `reset`
command ingress over canonical kernel emission.
It still did not authorize `assessed`, result-assessment,
install/bootstrap, bootloader, or later qualification widening.

The completed next `M04-app-bootstrap` wave derives from:

- [M04_RESULT_ASSESSMENT_DERIVATION.md](./M04_RESULT_ASSESSMENT_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md](./M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md)
- [M04_RESULT_ASSESSMENT_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_RESULT_ASSESSMENT_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed result-assessment wave is bounded to `assessed{kind: fp}` over the completed
canonical ingest boundary.
It still does not authorize non-F_P review, live-status,
install/bootstrap, bootloader, or later qualification widening.

The completed next `M04-app-bootstrap` live-status wave derives from:

- [M04_LIVE_STATUS_DERIVATION.md](./M04_LIVE_STATUS_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M04_LIVE_STATUS_FIRST_SLICE_IACS.md](./M04_LIVE_STATUS_FIRST_SLICE_IACS.md)
- [M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed live-status wave is projection-only over admitted public and
runtime truth.
It does not authorize install/bootstrap, bootloader, archive replay, or later
qualification widening.

The completed next `M04-app-bootstrap` install/bootstrap wave derives from:

- [M04_INSTALL_BOOTSTRAP_DERIVATION.md](./M04_INSTALL_BOOTSTRAP_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md)
- [M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed install/bootstrap wave is bounded to explicit installed-runtime
delivery truth only.
It does not authorize bootloader, public asset-addressing, or later
qualification widening.

The completed next `M04-app-bootstrap` bootloader wave derives from:

- [M04_BOOTLOADER_DERIVATION.md](./M04_BOOTLOADER_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M04_BOOTLOADER_FIRST_SLICE_IACS.md](./M04_BOOTLOADER_FIRST_SLICE_IACS.md)
- [M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed bootloader wave is bounded to explicit project-facing delivery
truth over bootloader document and instruction-file injection only.
It does not authorize public asset-addressing or later qualification widening.

The completed next `M04-app-bootstrap` public asset-addressing wave derives from:

- [M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md](./M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md](./M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md)
- [M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md](./M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed public asset-addressing wave is bounded to explicit
operator-facing asset-handle resolution over one published graph-function
owner only.
It does not authorize qualification, sandbox/archive proof, or later mapping
repricing.

The completed late `M03-engine-kernel` transport wave derives from:

- [M03_TRANSPORT_PROTOCOL_DERIVATION.md](./M03_TRANSPORT_PROTOCOL_DERIVATION.md)

Its first module-bounded carrier assets are:

- [M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md](./M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md)
- [M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md)

That completed wave is bounded to governed transport and result-artifact
protocol truth under `M03`, now landed under `code/src/abg/m03/transport/**`.
It still does not authorize `M04` result-assessment, installed
qualification, or archive widening.

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
