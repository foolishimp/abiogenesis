# M04 Control Loop First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [M04_CONTROL_LOOP_DERIVATION.md](./M04_CONTROL_LOOP_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [T-013](../../.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md)

## Purpose

Declare the TypeScript `M04-app-bootstrap` control carrier inventory so
supervision and proxy behavior stay above public start outcome truth rather
than reforming a second runtime doctrine in package helpers.

## M04 Control-Loop First Slice Boundary

The first TypeScript control-loop wave is:

- one admitted public control-loop request carrier over completed
  `PublicStartRequest` truth
- one closed public control-loop outcome family over `start(...)`
  `PublicStartOutcome` truth
- one bounded supervision projection for `root_mode=supervised`
- one bounded proxy-facing control path over explicit `human_gate_required`
  outcome truth
- one canonical route that calls completed `start(...)` once and leaves
  graph-function iteration in M03

This wave does **not** include:

- direct event append
- event-ingress commands
- result-assessment ingress
- install/bootstrap
- bootloader ownership
- live-status projection
- sandbox/scenario qualification

## Upstream Authoritative Carriers Consumed By The Control Loop

This slice does not redefine the completed `T-012` public-start boundary.

The following carriers remain authoritative upstream truth and are consumed
unchanged:

- `PublicStartRequest`
- `PublicStartOutcome`

The control loop may admit, route, and project over those carriers.
It must not recreate rival public-start carriers of its own.

## Irreducible Architectural Carrier Set

The first TypeScript control-loop wave is allowed exactly these prime carrier
families:

1. `PublicControlLoopRequest`
2. `PublicControlLoopOutcome`

Explicit variants of `PublicControlLoopOutcome` are members of that one prime
outcome family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicControlLoopRequest` | `M04-app-bootstrap` | authoritative public control ingress | package/control-loop parser | none | control route binding, one `start(...)` invocation |
| `PublicControlLoopOutcome` | `M04-app-bootstrap` | authoritative public control outcome family | derived from admitted control request plus `start(...)` `PublicStartOutcome` truth | none | root package export, later event/assessment ingress, later qualification lanes |

`PublicControlLoopRequest` and `PublicControlLoopOutcome` are the only prime
outer carriers in this slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `ControlLoopRouteBinding` | subordinate | route-owned detail that binds the control request to `start(...)` invocation | constructed once by `M04`, not exposed as a rival public carrier |
| `PublicControlLoopTraceRef` | subordinate | public trace/provenance detail over start outcome truth, not an outer carrier | derived once from the `PublicStartOutcome` family |
| `PublicControlLoopStopDetail` | subordinate | outcome-detail payload only | derived from repeated public-start outcome truth |
| `HumanProxyApprovalHint` | subordinate | bounded proxy-facing control detail, not a separate public carrier | derived only when a `human_gate_required` seam is preserved under `fh_mode=human-proxy` |
| `PublicControlLoopConverged` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicControlLoopOutcome` |
| `PublicControlLoopYielded` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicControlLoopOutcome` |
| `PublicControlLoopDispatchRequired` | prime family variant | explicit public seam variant, not a separate outer carrier family | pattern-matched as part of `PublicControlLoopOutcome` |
| `PublicControlLoopHumanGateRequired` | prime family variant | explicit public seam variant, not a separate outer carrier family | pattern-matched as part of `PublicControlLoopOutcome` |
| `PublicControlLoopRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicControlLoopOutcome` |
| direct event-ingress command payloads | deferred | separate app ingress family below a future successor ticket | successor ticket only |
| result-assessment ingress payloads | deferred | separate app ingress family below a future successor ticket | successor ticket only |
| install/bootstrap payloads | deferred | delivery/install family outside this control-loop slice | successor ticket only |
| bootloader payloads | deferred | delivery/install family outside this control-loop slice | successor ticket only |
| live-status projection payloads | deferred | later observation family, not part of the first control-loop slice | successor ticket only |
| sandbox/scenario carriers | deferred | later qualification family | successor ticket only |

## M04 Control-Loop First Slice Rules

- `PublicControlLoopRequest` carries completed `PublicStartRequest` as the
  authoritative source carrier for `start(...)` invocation.
- `PublicControlLoopRequest` does not reopen raw `scope`, `target`, `until`,
  `fh_mode`, or `root_mode` as rival public authority once the upstream
  public-start request is admitted.
- `root_mode=supervised` is realized by projecting the single canonical
  `start(...)` outcome. M03 owns repeated graph-function traversal.
- `fh_mode=human-proxy` may preserve `human_gate_required` as explicit public
  control truth and may derive `HumanProxyApprovalHint` from admitted
  `approvalSubjectRef`, but it must not append approval events directly in this
  slice.
- `PublicControlLoopOutcome` is a closed discriminated family. Callers must
  pattern-match the outcome family rather than probing open result objects.
- `dispatch_required`, `yielded`, and `human_gate_required` remain explicit
  public outcome variants in this slice rather than being flattened into
  generic blocked/success objects.
- unsupported upstream `gap_stop` truth remains explicit in subordinate stop
  detail when the control loop rejects that seam; it must not be relabeled as
  yielded truth.
- `PublicControlLoopOutcome` may expose trace and stop detail derived from
  `PublicStartOutcome` truth, but it must not reinterpret raw runtime events or
  kernel payloads directly.
- This slice routes through completed `start(...)`. It may not call lower
  kernel admission/emit surfaces directly unless that routing still occurs
  through the public start boundary.

## Promotion Rule

No subordinate payload may be promoted during the first control-loop wave
unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-013` before code lands.
