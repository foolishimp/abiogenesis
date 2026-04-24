# M04 Complete `gen-start` Callable Surface First Slice IACS

**Status**: Proposed
**Date**: 2026-04-24
**Derived from**: [M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md](./M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [B-030-TS](../../.ai-workspace/tickets/backlog/B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md)

## Purpose

Declare the TypeScript application of `B-030` as one bounded `M04`
callable-start and stop-taxonomy carrier inventory so downstream products can
bind bare `start` to substrate truth without rebuilding control folklore or
operator stop meaning locally.

## M04 Maximum-Autonomy First Slice Boundary

The first TypeScript first slice is:

- one admitted wrapper-facing complete callable `start` request carrier
- one closed wrapper-facing complete callable `start` outcome family
- one deterministic lowering from the request to the completed lower-level
  public control family
- one stop-taxonomy projection over completed public/runtime truth

This wave does **not** include:

- a rival operator command surface beside `gen-start`
- new kernel runtime doctrine
- CLI spelling or exit-code authority
- install/bootstrap narrative as design truth

The first slice is still written for the current primary operator UX:

- agentic coder CLI backends `claude`, `codex`, and `gemini`

So any stop-class claim in this slice must remain compatible with explicit
transport/runtime identity over those backends.

## Upstream Authoritative Carriers Consumed By This Slice

This slice does not redefine the lower-level public or runtime truth it reads.

The following remain authoritative upstream truth and are consumed unchanged:

- `PublicStartRequest`
- `PublicStartOutcome`
- `PublicControlLoopRequest`
- `PublicControlLoopOutcome`
- `PublicLiveStatusProjection`
- `ResultIngestOutcome`

The completed TypeScript transport line also remains authoritative for the
current primary operator UX substrate:

- agentic coder CLI transport contracts over `claude`, `codex`, and `gemini`

If proof-hold or richer failure taxonomy are required to satisfy the public
stop taxonomy completely, those truths must be realized in the upstream
TypeScript line first through `T-034` and `T-035` rather than invented here.

## Irreducible Architectural Carrier Set

The first TypeScript first slice is allowed exactly these prime
carrier families:

1. `PublicCallableStartRequest`
2. `PublicCallableStartOutcome`

Explicit variants of `PublicCallableStartOutcome` are members of that
one prime outcome family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicCallableStartRequest` | `M04-app-bootstrap` | authoritative wrapper-facing callable ingress | package/start parser | none | CLI/MCP callable binding, public-control routing |
| `PublicCallableStartOutcome` | `M04-app-bootstrap` | authoritative wrapper-facing callable outcome family | derived from admitted callable request plus completed public/runtime truth | none | downstream bare-start CLI/MCP bindings, later install/qualification surfaces |

`PublicCallableStartRequest` and `PublicCallableStartOutcome` are
the only prime outer carriers in this slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `CallableStartBinding` | subordinate | route-owned detail translating callable truth to the completed lower-level request surface | constructed once by `M04`, not exposed as a rival public carrier |
| `PublicStopClass` | subordinate | nested stop-class projection detail, not an outer carrier | derived only from completed public/runtime truth |
| `StartTraceRef` | subordinate | trace/provenance detail only | derived only from canonical public/runtime truth |
| `PublicCallableStartResolved` | prime family variant | explicit outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicCallableStartOutcome` |
| `PublicCallableStartRejected` | prime family variant | explicit outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicCallableStartOutcome` |
| proof-hold projection payloads | deferred/blocking prerequisite | current TypeScript line still lacks proof-hold projection | `T-034` must land first |
| runtime-unavailable / capability-missing / runtime-failure split payloads | deferred/blocking prerequisite | current TypeScript line still lacks the required canonical split | `T-035` must land first |

## Maximum-Autonomy First Slice Rules

- `PublicCallableStartRequest` is the only lawful wrapper-facing callable
  ingress in this slice.
- the callable request is functionally complete for the current cut and is
  allowed to carry the lower-level control truth wrappers need to set:
  - `scope`
  - `target`
  - `until`
  - `fhMode`
  - `rootMode`
  - `runtimeSelector`
- the slice does not publish a convenience/autonomy enum as product truth.
  Agent guidance may still recommend a convenience bundle over those fields,
  but that bundle is not itself a prime public carrier in this slice.
- the lower-level explicit `PublicStartRequest` and `PublicControlLoopRequest`
  remain lawful for advanced callers and are not superseded by this slice.
- `PublicCallableStartOutcome` is a closed discriminated family.
  Callers must pattern-match the outcome family rather than reading open result
  objects.
- `PublicStopClass` must be projected from canonical completed public/runtime
  truth. It must not be reconstructed by downstream wrappers.
- the public stop taxonomy for closure must distinguish at least:
  - `converged`
  - `human_decision_required`
  - `runtime_unavailable`
  - `capability_missing`
  - `proof_hold`
  - `runtime_failure`
- `runtime_unavailable`, `capability_missing`, and `runtime_failure` must stay
  truthful against the concrete current operator backends `claude`, `codex`,
  and `gemini`, not only against an abstract generic transport shell
- if current upstream TypeScript truth cannot supply one of those classes, this
  slice cannot claim closure until the blocking predecessor lands.

## Promotion Rule

No subordinate payload may be promoted during this wave unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `B-030-TS` before code lands.
