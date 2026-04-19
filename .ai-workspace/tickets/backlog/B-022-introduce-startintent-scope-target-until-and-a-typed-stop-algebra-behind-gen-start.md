# B-022 Introduce `StartIntent(scope, target, until)` And A Typed Stop Algebra Behind `gen-start`

- id: B-022
- title: Realize `StartIntent(scope, target, until)` plus a typed stop algebra behind `gen-start`
- type: feature
- status: backlog
- goal: start-intent-normalization
- change_intent: Realize the product-ratified `gen-start` request grammar as one internal typed normalization contract. `StartIntent` belongs to the named composition `gen-start`, not to any one literal CLI or service spelling. Concrete command spelling remains adapter/build realization detail. `gen-start` should accept operator intent shaped by the public `scope + target + until` contract, normalize it into one lawful traversal plan, and stop according to canonical stop predicates rather than ambiguous CLI buckets.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- intake_source: operator UX direction 2026-04-19 after ABG B-018 review
- dependencies: B-021, B-018
- affected_boundary: CLI design, control-plane design, `cli_adapter.py`, `services.py`, `interpret.py`, run/control-plane projections
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- updated_at: 2026-04-19

## Context

Once the public command surface is ratified around `gen-start` and
`gen-gaps`, the next problem is request normalization.

Current advancement semantics are still implementation-shaped:

- `gen-start`
- `gen-iterate`
- `--edge`
- `--feature`
- `--auto`
- `--human-proxy`
- `--supervised-root`

The intended operator language is already a public product contract from
`B-021`:

- `scope`
- `target`
- `until`

Intent/product/policy own that named composition truth. Adapter/build surfaces
own the literal command spellings that invoke it.

But that contract will only be lawful if it does not:

- leak bare graph-vector targeting into the public surface
- turn CLI-local stop labels into a second semantic center
- collapse traversal request grammar, control-plane modes, and literal parser
  spelling into one surface

## Problem Statement

ABG does not yet have one authoritative internal run-request shape behind the
public `gen-start` contract, and it does not yet split canonical stop
predicates from CLI projection labels and control-plane exit reasons.

Without that separation:

- `gen-start` semantics stay coupled to parser flags and historical command
  structure
- stop labels such as “blocked” risk conflating dispatch needs, yielded
  handoff, held state, and deterministic non-advancement
- supervision or proxy capabilities could drift into `StartIntent` even though
  they are not traversal-request fields
- `StartIntent` would itself become a second semantic center instead of a
  normalization contract over canonical ABG truth

## Required Direction

ABG should define one internal typed request contract behind `gen-start`:

```text
StartIntent =
  scope
  + target
  + until
```

### 1. `scope`

The active context in which traversal is allowed, including at minimum:

- module
- workspace
- work identity / work key

Historical parser aliases such as `--feature` may survive temporarily as
compatibility inputs, but they must not remain the canonical public term if
the real scope concept is work identity / work key.

### 2. `target`

`StartIntent.target` should initially support only the already-ratified base
target family:

- `next`

Additional public target families should be added through separate tickets:

- published graph-function targeting: `B-023`
- asset-handle registry / ownership targeting: `B-024`

If a lower-level `edge` override is retained, it must be framed explicitly as a
diagnostic or internal override, not as a co-equal public target family. Public
execution entry must not target bare graph vectors as first-class operator
handles.

### 3. `until`

`StartIntent.until` must consume a typed canonical stop algebra, not a vague
“blocked” bucket.

Canonical stop predicates should distinguish at minimum:

- one lawful traversal or advancement applied
- dispatch required
- human gate required
- proof hold reached
- yielded handoff reached
- deterministic no-advance / gap stop
- converged

CLI or UI labels may later project these into operator-friendly summaries, but
those labels must remain projections over the canonical stop predicates.

Control-plane stop labels such as:

- `max_iterations`
- transport/runtime stop reasons
- shell exit-code groupings
- historical shorthands such as `--auto`

must remain downstream projection and orchestration labels. They are not
canonical traversal-stop predicates.

### 4. Outside `StartIntent`

`StartIntent` owns traversal request only.

Capabilities such as:

- human proxy
- root supervision
- similar recovery or control-plane modes

must be classified outside `StartIntent`.

Active control modes such as `--human-proxy` and `--supervised-root` are
orthogonal wrappers around `StartIntent`, not fields inside the traversal
request contract.

They may remain as product-policy control modes around execution of
`gen-start`, but they are not members of the `scope + target + until`
request grammar.

Literal CLI spellings and flags are also outside `StartIntent`. They are
adapter/build bindings into the named composition, not the canonical contract
itself.

## Normalization Rule

`gen-start` should:

1. parse operator input into `StartIntent`
2. normalize `StartIntent` into one lawful traversal plan
3. bind any orthogonal control modes or literal adapter spellings around that
   request without changing the request grammar itself
4. execute through existing ABG traversal machinery
5. derive canonical stop truth from ABG/runtime truth
6. project CLI/control-plane labels from that stop truth without inventing
   rival lifecycle semantics

If historical flags such as `--feature`, `--edge`, or `--auto` remain during
transition, they must be treated as compatibility aliases beneath the
canonical `scope + target + until` contract rather than as co-equal semantic
surfaces.

The important law is that `StartIntent` normalizes to runtime truth; it does
not invent new runtime truth.

## Acceptance

- ABG has one explicit internal run-request contract behind `gen-start`
- public runtime advancement semantics are expressible as `scope + target + until`
- public target families do not leak bare graph-vector entry as co-equal public
  operator truth
- supervision/proxy capabilities are explicitly kept outside `StartIntent`
- literal CLI spellings are explicitly treated as bindings into the named
  composition rather than as the contract itself
- concrete command spelling remains adapter/build realization detail rather
  than product/operator constitutional truth
- canonical stop predicates are defined separately from CLI projection labels
- control-plane stop reasons such as `max_iterations` remain projections over
  canonical truth rather than part of the canonical stop algebra
- historical flags remain, if at all, as compatibility aliases beneath the
  canonical contract rather than as rival semantic surfaces
- yielded handoff remains distinct from blocker or failure classes
- `StartIntent` acts as a normalization contract over canonical truth rather
  than as a second semantic center
