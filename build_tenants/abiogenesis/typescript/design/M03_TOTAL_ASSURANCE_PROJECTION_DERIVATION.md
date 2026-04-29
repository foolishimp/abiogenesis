# M03 Total Assurance Projection Derivation

**Status**: Active
**Date**: 2026-04-29
**Purpose**: Close T-090 by designing the ABG-owned carrier and plugin
topology for total assurance projection over the T-086 traversal envelope.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-CORRECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- `specification/requirements/abg/REQ-R-ABG3-POLICY.md`
- `specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`
- [T-090](../../../../.ai-workspace/tickets/active/T-090-design-abg-total-assurance-carriers-and-plugin-seams.md)

## Position

ABG assurance is a replay-derived projection and fold over current authority,
current input state, and admitted runtime truth. It is not a worker report,
test result, archive shape, report ledger, or plugin callback.

GTL exposes the declaration surface:

- graph functions and vectors may declare assurance hook refs,
- hook refs may carry opaque configuration,
- the published GTL surface can describe the full graph-function contract
  without hidden runtime side doors.

ABG resolves and enforces the assurance law:

- scope derivation,
- authority/input snapshot identity,
- evidence adaptation,
- ambiguity classification,
- closure policy,
- gain-function adaptation,
- closure fold.

Downstream products own domain meaning and gain quality. ABG owns totality,
row visibility, stale-input invalidation, and non-premature closure.

## Target Carrier Families

T-090 introduces these ABG carrier families:

1. `AssuranceScopeRef`
2. `AssuranceAuthoritySnapshot`
3. `AssuranceEvidenceRow`
4. `AssuranceAmbiguityRow`
5. `AssuranceProjection`
6. `AssuranceClosureDecision`

`AssuranceScopeRef` is a derived runtime identity over existing
`GraphCall`, `Frame`, `Continuation`, and vector event truth. It is not a new
public `UnitOfCompute` aggregate and does not widen the product compute
boundary.

## Projection Algorithm

The assurance projection is deterministic for a given scope, authority
snapshot, input digest, policy, and admitted event ledger.

1. Derive `TraversalEnvelopeView` from admitted M03 runtime truth.
2. Derive `AssuranceScopeRef` from the current graph-call/frame/continuation
   and vector identities in that envelope.
3. Resolve GTL assurance hook refs and opaque config from the graph function,
   graph vector, role, candidate family, and resolved policy surfaces.
4. Ask authority providers for a current `AssuranceAuthoritySnapshot`.
5. Compute or admit the authority/input digest.
6. Adapt admitted events, result artifacts, assessments, actor observations,
   leaf-task facts, and downstream declared evidence into
   `AssuranceEvidenceRow` records.
7. Classify every authority obligation and every orphan evidence candidate
   into explicit `AssuranceAmbiguityRow` records.
8. Fold rows through `AssuranceClosureDecision`.
9. Publish reports, dashboards, archives, and adapter ledgers as read models
   over the projection and decision.

Unknown, absent, unreadable, or unclassified state emits a row. It does not
default to success.

## Ambiguity Rows

`AssuranceAmbiguityRow.status` uses the requirement vocabulary:

- `fulfilled`
- `partial`
- `missing`
- `stale_input`
- `authority_missing`
- `orphan_evidence`
- `contradictory_authority`
- `contradictory_evidence`
- `deferred`
- `event_ledger_invalid`

Rows preserve:

- scope ref,
- authority ref,
- evidence refs,
- authority digest,
- input digest,
- event ids used for classification,
- provider refs used for classification,
- policy refs used for closure,
- explanatory reason codes.

## Closure Fold

`AssuranceClosureDecision.kind` is closed:

- `close`
- `retry`
- `reprice`
- `block`
- `qualified_defer`

Fold rules:

1. `event_ledger_invalid` blocks.
2. `contradictory_authority` reprices.
3. `authority_missing` reprices unless policy explicitly permits a qualified
   defer.
4. `stale_input` invalidates prior closure projection and requires retry,
   reprice, or block according to policy.
5. `contradictory_evidence` blocks or retries according to policy.
6. `orphan_evidence` does not satisfy authority and blocks closure unless all
   affected obligations are independently fulfilled or lawfully deferred.
7. `missing` and `partial` cannot close. They retry, reprice, or block
   according to policy and retry budget.
8. `deferred` can participate in `close` only when release/closure policy
   permits qualified deferral for the scope.
9. `close` is lawful only when every required row is `fulfilled` or lawfully
   `deferred`.

## Plugin Provider Topology

Assurance extends the B-016 plugin model. Providers are resolved through typed
contracts and consumed by ABG projection law.

| Provider | Role | Authority limit |
|---|---|---|
| `AuthoritySnapshotProvider` | returns current authority and input snapshot refs | cannot classify rows or close |
| `EvidenceAdapter` | adapts admitted runtime facts into evidence rows | cannot invent admitted events |
| `AmbiguityClassifier` | proposes row status from authority/evidence/policy inputs | cannot emit runtime truth or choose closure |
| `ClosurePolicyProvider` | supplies closure/retry/reprice/defer policy | cannot decide a concrete scope alone |
| `GainFunctionAdapter` | supplies domain gain signals or scoring | cannot mark fulfillment without ABG row classification |

Provider output is evidence for ABG projection, not runtime truth. If provider
output is missing, contradictory, malformed, stale, or out-of-scope, ABG emits
the corresponding ambiguity row.

## Core-Interface Migration Inventory

| Surface | Old producer/consumer | New producer/consumer |
|---|---|---|
| authority truth | implicit requirement files, prompt prose, local reports | `AssuranceAuthoritySnapshot` from GTL declarations and provider contracts |
| evidence truth | worker markdown, result reports, tests, archive files | `AssuranceEvidenceRow` derived from admitted events and adapters |
| closure truth | worker `unresolvedReasons: []`, passing tests, archive shape, local ledgers | `AssuranceClosureDecision` over `AssuranceProjection` |
| stale-input reset | Python-local closure-register reset, TS absent/partial | digest-bound projection invalidation over current authority/input |
| downstream reports | local quality reports, release ledgers, dashboards | read models over assurance projection |
| plugin behavior | seam-specific callbacks and local payloads | B-016 typed provider contracts with no event/vector/closure authority |
| proof surfaces | scenario-specific success checks | row-totality proof, stale-input proof, and old-path bypass negatives |

## Superseded Closure Paths

The following paths are no longer closure authority:

- worker process exit code,
- transport success,
- prompt-side self-assessment,
- `unresolvedReasons: []`,
- passing tests alone,
- archive presence or expected archive shape,
- report or ledger rows not projected from assurance,
- absence of a closure-register row,
- plugin output claiming success,
- downstream adapter all-green summary.

Each may be evidence only after admitted into the assurance projection.

## Report Consumers

Reports, dashboards, run archives, release summaries, and downstream adapter
ledgers consume:

- `AssuranceProjection`
- `AssuranceClosureDecision`
- row provenance refs
- authority/input digest refs

They may render or filter assurance truth. They may not write assurance truth
or close work independently.

## T-086 Consumption

T-090 consumes `TraversalEnvelopeView` from T-086 as the scoped runtime basis
for assurance projection. T-090 does not duplicate the envelope topology and
does not create a broader compute boundary.

## Proof Hand-Off

T-091 must prove:

- one row per ambiguity status,
- cross-row fold precedence,
- stale-input invalidation,
- plugin authority limits,
- old closure path bypass prevention,
- T-086 envelope compatibility.

Tenant implementation remains separate in T-092-PY and T-092-TS.
