# M03 Total Assurance Projection Proof Plan

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md](./M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md), [M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md](./M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md), [M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md](./M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md), [T-091](../../../../.ai-workspace/tickets/active/T-091-prove-abg-total-ambiguity-projection-and-premature-closure-guards.md)

## Purpose

Define the proof matrix required before ABG total assurance implementation can
close in any tenant.

This plan is not tenant proof. It is the accepted proof contract that T-092-PY
and T-092-TS must satisfy independently.

## Row Totality Matrix

| Scenario | Required row | Required fold result | Tenant proof obligation |
|---|---|---|---|
| current authority exists, evidence is scoped, current, complete, and admitted | `fulfilled` | `close` only if every required row is fulfilled or lawfully deferred | positive close case |
| evidence exists but is trace-only, planned, shallow, incomplete, or unbound | `partial` | not `close`; retry/reprice/block by policy | shallow evidence negative |
| authority requires evidence and none exists | `missing` | not `close`; retry/reprice/block by policy | missing evidence negative |
| prior closure projection digest differs from current authority/input digest | `stale_input` | not `close`; invalidate prior closure projection | stale beats prior fulfilled |
| closure-capable scope has no current authority snapshot | `authority_missing` | reprice or qualified defer by policy | missing authority negative |
| evidence exists without matching authority or scope binding | `orphan_evidence` | not authority fulfillment | orphan never satisfies by default |
| current authority conflicts with itself | `contradictory_authority` | `reprice` | contradictory authority negative |
| admitted evidence conflicts with authority or other evidence | `contradictory_evidence` | block or retry by policy | contradictory evidence negative |
| deferral is explicit and policy permits it | `deferred` | `qualified_defer` or close-with-qualified-defer only under policy | lawful vs accidental defer |
| event ledger is unreadable, inadmissible, or non-deterministic | `event_ledger_invalid` | `block` | invalid ledger negative |

## Cross-Row Priority

| Mixed state | Required result |
|---|---|
| `event_ledger_invalid` plus any other row | `block` |
| `contradictory_authority` plus `fulfilled` | `reprice` |
| `stale_input` plus prior `fulfilled` | not `close`; prior projection invalid |
| `authority_missing` plus evidence | not `close`; evidence becomes orphan or partial |
| `orphan_evidence` plus missing authority-bound evidence | not `close` |
| all required rows `fulfilled`, optional unrelated orphan evidence | policy-defined block or non-closing warning; orphan never satisfies authority |
| all required rows `fulfilled` plus lawful `deferred` row | `close` or `qualified_defer` only if policy permits |

## Old Closure Path Negative Matrix

| Superseded path | Required proof |
|---|---|
| worker exits zero | cannot close without fulfilled/deferred assurance rows |
| transport succeeds | cannot close without fulfilled/deferred assurance rows |
| worker writes `unresolvedReasons: []` | treated as evidence candidate only |
| tests pass | treated as evidence candidate only |
| archive exists with expected shape | read model only |
| report or ledger says all green | read model only unless derived from assurance projection |
| no closure-register row exists | no closure meaning |
| plugin output says success | provider output subject to admission and row classification |

## Plugin Authority Negative Matrix

| Plugin attempt | Required result |
|---|---|
| emits runtime events | reject/fail closed |
| chooses next vector | reject/fail closed |
| closes assurance scope | reject/fail closed |
| hides missing authority | `authority_missing` still emitted |
| supplies evidence outside scope | `orphan_evidence` emitted |
| supplies unknown row status | fail closed |
| supplies stale snapshot | `stale_input` or `authority_missing` emitted |

## Replay Determinism

Each tenant must prove that the same:

- assurance scope,
- authority/input snapshot,
- admitted event ledger,
- provider outputs,
- closure policy,

produces the same `AssuranceProjection` and `AssuranceClosureDecision`.

Reports may vary in rendering. They may not vary the projection or decision.

## T-086 Envelope Compatibility

Each tenant proof must show that assurance scope and evidence are derived from
the traversal envelope:

- `ExecutionBasis`,
- `RuntimeEvent`,
- `RuntimeAggregateProjection`,
- `IterationAdvanceDecision`,
- result ingest truth,
- retry/progress truth,
- actor/leaf-task facts when present,
- output-binding refs when present.

Hidden controller memory, prompt prose, and report-only state cannot be part of
the authoritative assurance projection.

## Tenant Allocation

T-091 accepts this proof matrix only.

T-092-PY and T-092-TS must each implement and prove:

- row-totality cases,
- mixed-state precedence,
- stale-input invalidation,
- plugin authority rejection,
- old closure path bypass prevention,
- read-model report limits,
- deterministic replay.

One tenant passing does not close the other tenant.
