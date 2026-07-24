# T-272 - Connect F_H Response To Replay Continuation

> **Current disposition (2026-07-24):**
> `active_for_s03`. The durable hold/read/respond/continue prerequisite and
> mixed compute path closed with corrected S02 at `de29a7b7`. One Surface,
> consequence routes, runtime dispositions, and public-control work are now
> active through the same extension path. Historical X-path designs and
> checkpoints remain donor evidence only.

- id: T-272
- title: Connect F_H response to exact held-locus continuation
- type: bug
- ticket_category: implementation_migration
- status: active
- implementation_hold: released
- implementation_hold_ref: GOAL-035 ABG5-S03
- implementation_hold_effect: >-
    extend the green durable F_H path with Product-defined One Surface,
    consequence routes, runtime dispositions, and public-control behavior;
    historical X implementation remains held donor evidence
- phase_status: s03_active
- review_status: corrected_s02_closed_s03_scope_released
- proof_status: durable_fh_continuation_green_s03_open
- delivery_phase: M5_frontier_3
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Extend the closed replay-derived F_H hold, read, response, and same-run
    continuation path with One Surface plus the consequence,
    runtime-disposition, and public start/control rows constitutionally
    assigned to ABG5-S03.
- change_class: design_reframe
- re_entry_point: >-
    specification/requirements/product/REQ-P-SCENARIOS.md
    REQ-P-SCENARIOS-010
- triaged_at: 2026-07-24
- created_at: 2026-07-14
- updated_at: 2026-07-24
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-258
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg,
    build_tenants/abiogenesis/typescript/code/src/hog, and
    build_tenants/abiogenesis/typescript/code/src/public

## Current S03 Reprice

The bounded direct prerequisite is complete:

```text
F_H hold
  -> public read
  -> interaction.respond
  -> run.continue
  -> same-run replay and typed outcome
```

Implementation commit `de29a7b7` closes the F_H and mixed compute-fibre
evidence needed by S02. The same ticket now extends that path with every
retained consequence route, runtime disposition, and public start/control row
owned by S03. This reprice does not authorize the historical X interpreter,
checkpoint-basis carrier, public controller, or any other X implementation.

Fresh proof is `test:m5` `72/72`, `test:m4` `26/26`, live F_P `1/1`, durable
reopen `7/7`, and conservation `23/40` with all S02-owned rows green. The
installed mixed Product proves F_H hold, replay-derived read, malformed and
wrong-actor refusal, attributed response, append-only reopen, separate
continue, same-Run typed closure, and replay agreement. No second result or
judgment is minted for the held C-call.

## Historical X Evidence

Everything below this heading is retained source material from the prior X
trajectory and has no current implementation or closure authority.
- dependencies:
  - T-270 accepted contracts-owned held-execution checkpoint-basis design
  - T-252 accepted canonical F_H target, recurse-law, and reachable-schema ownership repair
  - T-275 accepted interaction subject policy and result-contract binding
  - completed T-258 interaction carriers
  - completed T-267 and T-271 runtime conservation/interpreter
- downstream_dependencies:
  - T-281 P2 atomic public publication consumes truthful handlers only
  - T-276 installed Consensus F_H steel thread proves closure
- authority_refs:
  - specification/PRODUCT.md interactive One Surface and bounded Consensus
  - specification/requirements/product/REQ-P-CONSENSUS.md
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
- ontology_ref: >-
    build_tenants/abiogenesis/typescript/design/
    ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
- prime_contraction_refs:
  - PC-007
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md
- repaired_design_digest: 1ea155c6a50a35f7d59f6448dab48cbefe7f0f8ec69c4e21a6b20ec8647688e6
- accepted_repaired_design_digest: 1ea155c6a50a35f7d59f6448dab48cbefe7f0f8ec69c4e21a6b20ec8647688e6
- repaired_design_review_and_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260718T022245Z_REVIEW_DECISION_t252_t272_constructability_repair.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260718T001835Z_SELF_REVIEW_t272_event_basis_and_lifecycle_repair.md
- prior_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T065807Z_DECISION_fh_accept_t272_reconciled_continuation_design.md
- prior_design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T065807Z_SELF_REVIEW_t272_reconciled_continuation_design.md

## Boundary

T-272 owns one generic ABG lifecycle over an already held F_H leaf:

```text
held T-271 receipt
-> existing FhInteractionOpenedEvent and Continuation
-> interaction.respond admits and records response only
-> run.continue reconstructs replay authority and values
-> same-coordinate successor receipt replaces held receipt
-> existing T-271 interpreter resumes
```

The conserved coordinate includes execution basis, graph call, frame, vector,
compiled plan, leaf node, cursor, C-call, input payload and lineage, task
ordinal, retry attempt/path, and held receipt identity. No member can be chosen
or changed by the caller.

The T-270 `FhHeldExecutionCheckpointBasis` is a subordinate, immutable,
invocation-local contracts value embedded in the existing run-local F_H event.
It contains only primitive exact
coordinate fields and frozen ordered rows of node/schema/carrier/admission
refs, constituent digests, and canonical `IJsonValue` bodies. It imports no
runner or declared-execution-context type and owns no checkpoint identity or
seal. Existing constituent digests remain authority evidence. The existing
opened event embeds the body; its existing `interactionBasisDigest` is the
single checkpoint seal. There is no checkpoint store, new event family,
lookup callback, ref-to-body inference, or alternate reconstruction path.

`interaction.respond` and `run.continue` are separate public invocations.
Response admission performs no execution. Continue first verifies the exact
opened-event projection and its single seal, then admits the selected result
contract, creates one successor `CProgramAtomReceipt` at the same coordinate,
records one resume event, resolves the existing run-local Continuation member,
and re-enters T-271. Duplicate continuation is idempotent and cannot open a
second interaction at the same effective coordinate.

The retry-specific continuation events remain unchanged. Existing F_H effects
initiate `continuation_open` and resolve it through
`continuation_terminated(resolved)`. A qualifying `run_stopped` effect clips
every open fluent by exact run and authors no continuation ids. Canonical replay
must first pass canonical-sequence admission and
`sortReplayByAdmissionOrdinalFailClosed` inside the single Event Calculus
replay entry; this is not a caller precondition. Missing or colliding ordinals
refuse before an effect row exists. One subordinate
`ContinuationAbandonmentDerivedRule` inside the existing calculus authority
then folds all open initiations from the closed
`fh_interaction_opened -> fh_interaction` and
`continuation_reopened -> retry_repair` mapping, subtracts every terminal
effect, and derives `continuation_terminated(abandoned)` for each unresolved
member in the stopped run. The same ordered chain projects exact id/kind/run/
status/cause rows, with cause equal to the resume or stop event id. Operator
stop or external interruption preserves open members. The rule is not IACS or
new authority; no fluent, event, aggregate, or retry-event shape is added.

This slice emits only `resolved` and `abandoned`. Generic `superseded` remains
constitutional vocabulary, but correction/supersession must terminate the old
continuation and open a causally linked member in a new run under
CONTINUATION-004. T-272 does not implement same-run supersession.

The full checkpoint basis remains event/replay truth. For checkpoint addressing
and sealing, the public interaction projection adds no field and continues to
use the existing `interactionRef` and `interactionBasisDigest` alongside its
other existing fields. T-270 owns the private checkpoint-basis shape and
admission; T-252 owns the reachable graph-schema source/key family; T-274B
derives its asserted native definitions; T-275 owns response/result binding
semantics; T-272 authors no schema identity or definition.

## Consensus Join

The two canonical Consensus F_H vectors target
`ConsensusRoundDisposition`. Pending interaction is ABG event/projection truth,
not a GTL node or result. T-275 supplies the interaction subject, policy,
response shape, and result-contract binding without owning its schema identity
or native definition; ABG derives `interactionRef`.

The recurse table is closed:

| Outcome | Law |
|---|---|
| `closed_done` | terminate |
| `escalate_fh` | terminate after admitted F_H result |
| `recurse_next_round` | fold through the declared next-round binding |

An open interaction is not `escalate_fh`. Foldback never consumes either
terminal value, and termination never consumes the recurse value.

## Prime And Proportionality

The repair extends the existing receipt family and F_H event effects, and adds
one subordinate algorithm inside the existing Event Calculus derived-rule
carrier plus its run-local Continuation projection. It adds no
controller, store, scheduler, aggregate, event family, schema family, result
authority, or public operation. The T-270 checkpoint basis is an identity-free
projection of existing admitted values and authority, embedded in replay truth
because reconstruction is its sole consumer.

Defensive work is limited to likely desktop failures: malformed response,
stale/forged coordinate, missing or reordered checkpoint entries, schema
mismatch, duplicate continue, and incomplete replay. Hostile-process tamper
resistance, signatures, locks, replicated logs, and independent checkpoint
storage are out of scope.

## Delivery Checklist

- [x] canonical domain model, execution sequence, and state machine reconciled
- [x] exact same-locus continuation stated; graph restart and action selection excluded
- [x] both Consensus F_H targets named as `ConsensusRoundDisposition`
- [x] recurse termination and foldback table made exhaustive
- [x] contracts-owned T-270 checkpoint basis named, identity-free, and kept subordinate
- [x] T-252/T-274B schema authority, T-275 subject/policy/result binding, and ABG interaction identity separated
- [x] existing Continuation aggregate and F_H/run event families retained
- [x] executable open/resolved effects and generic ordered-row abandonment algorithm specified
- [x] strict replay ordinal admission and closed F_H-open/retry-reopen mapping specified
- [x] response-without-execution and continue-with-replacement separated
- [x] legacy identities routed to atomic P2 removal
- [ ] independent F_H design review accepts the repaired design
- [ ] T-270, T-252, and T-275 prerequisite designs are accepted
- [ ] opened event embeds exact checkpoint basis and coordinate truth under one interaction-basis seal
- [ ] response schema admission records no execution effect
- [ ] run.continue admits one same-coordinate successor receipt
- [ ] replay verifies the exact opened-event projection before reconstruction
- [ ] replay selects the successor and resolves the open continuation once
- [ ] run abandonment derives for F_H and retry opens from strictly ordered effect rows without ids on run stop
- [ ] duplicate continue emits no duplicate event, receipt, or interaction
- [ ] existing T-271 interpreter resumes without graph restart
- [ ] legacy `run.resume` and `abg.operation.fh.*` identities are atomically absent at P2
- [ ] focused, semantic, GTL, packed, publication, Prime, governance, and installed gates pass

## Negative Proof

- every coordinate, canonical-I-JSON row, or checkpoint mismatch refuses before receipt replacement;
- malformed or wrong-contract response refuses before response event admission;
- `interaction.respond` invokes no interpreter or graph atom;
- `run.continue` without one admitted response refuses;
- a successor receipt with changed plan, node, cursor, C-call, input, result
  contract, or retry coordinate refuses;
- a held interaction cannot be projected as a round disposition or terminal
  Consensus result;
- duplicate continue is replay-idempotent;
- no second aggregate, event family, checkpoint identity/digest, checkpoint
  store, selector, or controller exists;
- retry-specific lifecycle events cannot resolve an F_H continuation;
- every T-272 open member becomes resolved, derives abandoned on run
  abort/close, or remains open after a non-abandoning stop;
- a run-stop event or public invocation with authored continuation ids refuses;
- missing/colliding replay ordinals or an unmapped open-producing event kind
  refuses before the fold;
- physical replay order cannot change abandonment, and both F_H-open and
  retry-reopen fixtures derive the same generic terminal law;
- conflicting effect-row history or derived/projection status-cause mismatch
  refuses;
- T-272 emits no same-run `superseded` truth;
- no fold occurs for `closed_done` or `escalate_fh`;
- no termination occurs for `recurse_next_round`; and
- public catalog, SDK, CLI, schemas, and generated assets contain no legacy F_H
  operation identity after the P2 hard break.

## Exit

From a packed installed candidate, the canonical Consensus path reaches a real
T-271 F_H leaf and returns one pending interaction. `interaction.respond`
admits a typed response while execution remains held. A distinct
`run.continue` verifies the exact opened-event projection and single seal,
reconstructs the embedded value environment and exact held coordinate, and
replaces the held receipt with an admitted
`ConsensusRoundDisposition`, and resumes the existing interpreter. Converged,
recurse, and escalation outcomes follow the declared table; forged authority,
malformed output, duplicate continuation, and every legacy identity fail.
