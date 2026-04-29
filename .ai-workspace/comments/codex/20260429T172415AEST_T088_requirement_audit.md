---
kind: codex_post
type: requirement_audit
status: posted
ticket: T-088
ticket_path: .ai-workspace/tickets/backlog/T-088-design-abg-total-unit-of-compute-assurance-and-ambiguity-projection.md
date: 2026-04-29
governance_scope: STDO Method
---

# T-088 Requirement Audit

## Decision

T-088 is contained within the current ABG product boundary only if its "unit of
compute" remains an assurance read-model over existing ABG runtime aggregates:
`GraphCall`, `Frame`, and `Continuation`.

It does not currently authorize a new public `UnitOfCompute` aggregate, a new
product-level compute boundary, or a side-door runtime configuration surface.

The audit finds that existing ABG/GTL requirements provide strong enabling
authority for event truth, replay projection, closure policy, correction,
lineage, provenance, transport, and GTL hook declarations. They do not yet
authorize the total ambiguity row algebra as a named ABG closure law.

Required result:

- add a new ABG requirement authority for total assurance projection
- add or clarify the GTL assurance hook concern so LLM-authored graph functions
  can declare the full graph-function boundary through GTL declarations
- design ABG carriers and IoC plugin seams under core-interface migration
  discipline
- prove totality and negative closure behavior before tenant implementation can
  claim closure

## STDO Walk-Through

1. Goals:
   `abg-total-assurance-calculus` is not in the current active goals wave.
   T-088 stays backlog unless GOALS is repriced or the work is admitted to a
   future wave.

2. Intent:
   `INTENT.md` supports the investigation. ABG is already the event-calculus
   runtime over GTL traversal, and one edge traversal is the bounded
   probabilistic compute unit.

3. Product:
   `PRODUCT.md` contains the boundary. One GTL edge traversal is the bounded
   probabilistic compute boundary. T-088 can proceed as `requirement_reprice`
   only while assurance remains inside that boundary.

4. Requirements:
   Existing requirements are enabling authority, not complete closure
   authority. The missing requirement is a total ambiguity projection and fold
   law that prevents premature closure.

5. Design:
   T-088 does not design the runtime. Follow-on design must inventory core
   interface producers, consumers, projections, reports, proof surfaces, and
   superseded closure paths.

6. Code and proof:
   Tenant proof is independent. Python and TypeScript need tenant-suffixed
   follow-ons once requirement/design authority is ratified.

## Authority Read

| Surface | Audit result |
|---|---|
| `specification/INTENT.md` | Supports contained investigation. It names one edge traversal as the unit of probabilistic compute and ABG as the event/projection runtime. |
| `specification/PRODUCT.md` | Constrains the work. No new product-level compute boundary is lawful under T-088. |
| `REQ-L-GTL3-HOOKS` | Partially covers hook attachment and concerns for dispatch, evaluation, escalation, deterministic proof, and closure. It does not explicitly name assurance/total projection. |
| `REQ-L-GTL3-GRAPHFUNCTION` | Provides the canonical graph-function declaration surface and hook refs. It can carry assurance refs if HOOKS authority is amended. |
| `REQ-L-GTL3-GRAPHVECTOR` | Provides transition-governance declarations, proof surfaces, closure contract, hook refs, and opaque config. It can carry vector-local assurance intent if HOOKS authority is amended. |
| `REQ-R-ABG3-EVENTS` | Partially covers append-only event truth, replayable runtime facts, proof/closure facts, and actor progress/artifact facts. It does not define ambiguity rows. |
| `REQ-R-ABG3-PROJECTION` | Partially covers deterministic replay and declares incompleteness when replay cannot determine truth. It does not define total assurance projection or row classification. |
| `REQ-R-ABG3-CONVERGENCE` | Partially covers proof/closure checks and declared policy. It does not define the total fold over ambiguity rows. |
| `REQ-R-ABG3-CORRECTION` | Partially covers stale runtime truth and reset invalidation. It does not define input-digest closure invalidation for all assurance rows. |
| `REQ-R-ABG3-LINEAGE` / `PROVENANCE` | Partially cover event causation, graph-call/frame lineage, and provenance. They do not define row-bound evidence binding. |
| `REQ-R-ABG3-BINDING` / `WORKER` / `JOB-WORKER` | Partially cover worker/role/job/call authority and identity separation. They do not define authority-missing or orphan-evidence closure behavior. |
| `REQ-R-ABG3-RUN` / `GRAPHCALL` / `FRAME` / `CONTINUATION` | Provide the existing aggregate boundary. They are the containment basis for assurance. |
| `REQ-R-ABG3-RETRY` / `TRANSPORT` | Partially cover retry freshness, worker artifact admission, and actor invocation truth. They do not define the generic ambiguity fold. |
| `REQ-R-ABG3-POLICY` | Partially covers resolved policy and fail-closed hooks. It does not define release-lawful deferral as an assurance row. |
| `REQ-R-ABG3-LEAFTASK` | Not in T-088's mandatory audit set, but relevant if follow-on design extends assurance into subordinate work. Leaf tasks must remain subordinate to parent runtime truth. |

## Product-Boundary Decision

Decision: contained.

Reason:

- current product authority already names one GTL edge traversal as the bounded
  probabilistic compute boundary
- ABG already owns `GraphCall`, `Frame`, and `Continuation` aggregates for
  runtime truth inside that boundary
- T-088 can express total assurance as a replay-derived projection over those
  aggregates without inventing a new top-level compute product

Constraint:

- `UnitOfCompute` remains shorthand only
- if follow-on design wants a stable public `UnitOfCompute` carrier, it must be
  authorized explicitly by requirement/design work before implementation
- if assurance is extended outside edge traversal scope, the work exits T-088
  and requires `product_reprice`

## GTL Hook Decision

Decision: new GTL acceptance criteria are needed.

Existing deterministic-proof and closure hooks are close but not sufficient.
Total assurance includes authority snapshot, input digest, event ledger,
evidence classification, ambiguity projection, stale-input invalidation, and
closure fold. Treating all of that as implicit closure/proof risks rebuilding
side-door configuration.

Target requirement change:

- add an explicit `assurance` governance hook concern, or equivalent wording,
  to `REQ-L-GTL3-HOOKS`
- make clear that `GraphFunction.declarations` and `GraphVector.declarations`
  can carry assurance hook refs and opaque config
- preserve the invariant that GTL declares hook refs and boundary intent while
  ABG resolves, projects, and enforces assurance semantics

This keeps GTL as the authored program surface without turning it into an
ambiguity-calculus DSL.

## Requirement Matrix

Each row below was audited against the full candidate set: ABG INTERPRET,
BINDING, RUN, GRAPHCALL, FRAME, CONTINUATION, EVENTS, PROJECTION,
CONVERGENCE, CORRECTION, LINEAGE, POLICY, PROVENANCE, RETRY, TRANSPORT,
WORKER, JOB-WORKER, plus GTL HOOKS, LANGUAGE, GRAPHFUNCTION, and GRAPHVECTOR.

| Ambiguity status | Decision | Existing enabling authority | Missing authority | Follow-up |
|---|---|---|---|---|
| `fulfilled` | `new REQ needed` | GTL proof/closure hook refs; ABG events, projection, convergence, provenance. | No requirement defines "fulfilled" as evidence bound to current authority/input digest and required proof shape. | `T-089`, `T-090`, `T-091` |
| `partial` | `new REQ needed` | Convergence can emit unresolved observer findings; retry can continue while signal is produced. | No requirement names trace-only, planned, shallow, or unbound evidence as non-closing partial assurance. | `T-089`, `T-090`, `T-091` |
| `missing` | `new REQ needed` | Projection incompleteness is unconstitutional; continuations can carry unresolved work. | No total projection requirement emits a missing row for every required authority/evidence obligation. | `T-089`, `T-090`, `T-091` |
| `stale_input` | `new REQ needed` | Correction shadows stale truth; retry manifests regenerate from current state. | No generic input-digest binding law invalidates prior closure projections across all assurance rows. | `T-089`, `T-090`, `T-091` |
| `authority_missing` | `new REQ needed` | Binding preserves authority refs when provided; worker may preserve external authority hooks; policy fails closed on malformed hooks. | No assurance row says release-capable work without current authority blocks closure. | `T-089`, `T-090`, `T-091` |
| `orphan_evidence` | `new REQ needed` | Provenance and lineage preserve causal identity; event envelopes carry references. | No row rejects evidence that exists outside current authority or cannot bind to the governed boundary. | `T-089`, `T-090`, `T-091` |
| `contradictory_authority` | `new REQ needed` | Policy and binding can fail closed on malformed hooks/authority. | No row classifies conflicting authority as reprice-required rather than closure or retry. | `T-089`, `T-090`, `T-091` |
| `contradictory_evidence` | `new REQ needed` | Convergence can rerun proof and blocker checks after constructive work. | No row classifies evidence that contradicts authority and prevents default closure. | `T-089`, `T-090`, `T-091` |
| `deferred` | `new REQ needed` | Continuation/yield truth exists; policy can govern closure and escalation. | No row defines release-lawful deferral and prevents ungoverned deferral from acting as closure. | `T-089`, `T-090`, `T-091` |
| `event_ledger_invalid` | `new REQ needed` | Events are append-only; projection must be deterministic; unreadable truth makes the model incomplete. | No assurance row maps unreadable/inadmissible ledger truth to operator block and non-closure. | `T-089`, `T-090`, `T-091` |

Audit conclusion:

The existing requirements are not enough to claim `covered` for any row because
no row has an existing requirement, design carrier, implementation surface, and
proof surface that realizes the row end to end. The correct follow-up is a new
ABG assurance requirement family plus focused GTL hook acceptance criteria, not
only scattered implementation work.

## T-086 Disposition

T-088's audit can close before T-086 because this note does not design the
traversal envelope. It only determines that total assurance authority is
missing.

Follow-on design/proof cannot silently bypass T-086:

- `T-090` must depend on T-086 completion or co-closure before final design
  closure
- `T-091` must prove assurance over the envelope that T-086 defines or proves
- tenant tickets must not implement a rival envelope or closure path while
  T-086 remains unresolved

## Follow-On Tickets

Created follow-ons:

| Ticket | Purpose |
|---|---|
| `T-089` | Ratify ABG total assurance requirement authority and GTL assurance hook acceptance criteria. |
| `T-090` | Design ABG total assurance carriers and IoC plugin seams under core-interface migration discipline. |
| `T-091` | Prove total ambiguity projection, stale-input invalidation, and premature-closure negative behavior. |
| `T-092-PY` | Python tenant implementation/proof placeholder after upstream authority and design. |
| `T-092-TS` | TypeScript tenant implementation/proof placeholder after upstream authority and design. |

Not created yet:

- downstream `odd_sdlc` adapter ticket

Reason: the adapter should be opened after `T-089` and `T-090` define the ABG
authority boundary it will consume.

## Closure Effect On T-088

This audit satisfies T-088's requirement-audit deliverable.

It does not move T-088 to active or completed. The ticket still remains backlog
until the active goals wave admits the work. If T-088 is later closed as an
upstream spike, closure must point to this audit plus the follow-on tickets
above.
