# odd_sdlc TypeScript F_P Evaluation Ledger Purpose

Status: design note for T-109/T-135/T-136/T-137/T-138 alignment.

This note records the current authority distinction for SDLC ledgers and
registers. It is not a new traversal surface.

## Claim

The purpose of odd_sdlc ledgers and registers is to preserve consequential
`F_P` evaluation as deterministic, replay-visible system truth.

They are not merely passive projections from the ABG event log. They are
admitted records of evaluator findings over a declared basis:

```text
ABG calls plugin.odd_sdlc.<eval_role>.F_P
plugin reads workspace state and returns odd_sdlc findings
ABG/F_D admits or rejects those findings
the installed operator records the admitted result in the owning ledger/register/projection
```

The event log records that calls, findings, admissions, observations, and
invocations happened. The ledger/register records what the admitted SDLC
evaluation concluded about the current target and worksite.

## Authority Split

```text
F_P eval = probabilistic/domain judgment
F_D/ABG admission = deterministic envelope and contract authority
ledger/register = admitted evaluation record
closure decision = disposition over ledger truth
evaluate_next = next lawful action selection
ConstructionIntent = admitted action intent
```

No `F_P` eval writes authority directly. No ledger/register selects the next
action by itself.

`F_P.transform` is the only `F_P` role with workspace edit authority. Every
other `F_P` role is read-only over workspace state and passes typed findings or
parameters to the installed operator typed-carrier interface for deterministic
write/admission.

## Evaluation Record Rule

Every authoritative `F_P` eval that can influence closure, traversal, repair,
re-entry, repricing, or public gap truth must have an owning deterministic
record surface.

The generic shape is:

```text
F_P.<role>.eval(input_basis) -> Findings<role>
F_D/ABG.admit(Findings<role>) -> RecordSurface<role>
```

`RecordSurface<role>` may be named ledger, register, projection, or admitted
event depending on the domain role. The name is secondary; the authority role
is primary.

## Register vs Ledger

Current odd_sdlc language sometimes uses `register` and `ledger`
interchangeably. This note uses the following distinction:

- `register`: admitted rows for candidates, findings, schedules, or classified
  facts that may not be an ordered edge-attempt fold.
- `ledger`: admitted or derived ordered record used for evidence,
  fulfillment, progress, closure input, or replayable consequence.

Both are deterministic record surfaces. Neither is prompt prose, hidden worker
memory, or local installed-operator branch state.

## SDLC Evaluation Roles

| Evaluation role | Record surface |
|---|---|
| `synthesize_model` | `ProductAssetModel` projection over intent lineage and admitted product truth |
| `eval_gap` | gap pressure and target-obligation binding rows |
| `evaluate_action` | `SdlcEdgeFulfillmentLedger` and `SdlcEdgeClosureDecision` |
| `evaluate_next` | next-action projection, then admitted `ConstructionIntent` |
| worksite evidence evaluation | worksite evidence bundle and materialization/evidence rows |
| intent lineage evaluation | `IntentLineage` projection over admitted event refs, not an intent ledger |

## Event Log Relationship

The event log is prime runtime fact authority. It is not enough by itself to
answer whether the current workspace satisfies an SDLC target.

The missing computation is:

```text
target obligations
+ observed workspace/worksite state
+ admitted process/product evidence
+ graph/action/policy authority
-> F_P evaluation findings
-> admitted deterministic record
```

That admitted record is what later evaluators consume.

## Negative Rules

- Do not create an `intent ledger`; intent authority belongs in admitted event
  truth, and `IntentLineage` is a projection over event refs.
- Do not treat public gaps output as executable traversal authority.
- Do not let `SdlcEdgeFulfillmentLedger` contain `next_action` authority.
- Do not let worker result prose close an edge without admitted evaluation
  record truth.
- Do not keep legacy managed traversal ledgers as rival authority after T-109
  consequence carriers own edge fulfillment and closure.

## Target Spine

```text
IntentLineage
-> ProductAssetModel
-> eval_gap
-> TargetObligationBinding
-> evaluate_next
-> admitted ConstructionIntent
-> graph action invocation
-> WorksiteEvidence
-> evaluate_action
-> SdlcEdgeFulfillmentLedger
-> SdlcEdgeClosureDecision
-> evaluate_next
```

This spine is the one traversal consequence surface. Additional ledgers or
registers are lawful only when they have a distinct evaluation role and feed
this spine without becoming a second action-selection authority.

## Admission Timing Invariant

After `F_P.transform` output is observed and admitted, any result returned to
ABG must already have the consequence chain on disk:

```text
WorksiteEvidence
-> SdlcEdgeFulfillmentLedger
-> SdlcEdgeClosureDecision
-> SdlcNextActionProjection
```

The admitted `SdlcNextActionProjection` is the closure/action truth for that
result. ABG transport fields that identify an attached result
artifact may still point at the attached artifact or gap-pressure carrier; that
transport identity must not be treated as closure authority. Gap dossiers
remain pressure evidence. They do not substitute for closure or next-action
truth.

This is an executable invariant, not a reporting preference. If a retry,
close, retry, repair, re-entry, reprice, or block branch returns before the
consequence chain is written, the next traversal can lose the only lawful resume carrier and
public `gaps` can only report missing consequence truth.
