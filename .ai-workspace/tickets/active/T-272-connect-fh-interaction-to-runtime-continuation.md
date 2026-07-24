# T-272 - Connect F_H Response To Replay Continuation

> **Current disposition (2026-07-25):**
> `active_for_s03`. The durable hold/read/respond/continue prerequisite and
> mixed compute path were repaired across fresh public contexts at `cbb57d56`.
> The externally packed, Program-owned One Surface path is green through
> Product-owned evaluator output, ABG-owned construction-intent admission,
> governed evidence fold, and post-evidence refresh. Candidate `bc2fb639`
> further binds explicit observation and action-evaluation bases and derives
> closure from replay-visible construction state rather than a stage label.
> Consequence routes, runtime dispositions, and public-control work remain
> active through the same extension path. Section 12 of the M05 design is an
> affected-boundary candidate pending exact review.
> Historical X-path designs and checkpoints remain donor evidence only.

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
- review_status: s03_governed_basis_and_closure_exact_review_pending
- proof_status: program_start_governed_basis_fold_refresh_and_negatives_green_s03_open
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
- updated_at: 2026-07-25
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

Implementation commit `de29a7b7` established the F_H and mixed compute-fibre
path needed by S02. Commit `cbb57d56` makes its public authority serializable
and Product-bound, proves each operation from a fresh context, and atomically
admits the pending judgment, hold route, and continuation opening. The same
ticket now extends that path with every retained consequence route, runtime
disposition, and public start/control row owned by S03. This reprice does not
authorize the historical X interpreter, checkpoint-basis carrier, public
controller, or any other X implementation.

Current integrated proof is `test:m5` `81/81`, `test:m4` `26/26`, live F_P
`1/1`, and durable reopen `8/8`; all twelve S02-owned rows are green. The
installed mixed Product proves F_H hold, replay-derived read, malformed and
wrong-actor refusal, attributed response, append-only reopen, separate
continue, same-Run typed closure, and replay agreement. No second result or
judgment is minted for the held C-call.

## Prior S03 Vertical Checkpoint

The first S03 product checkpoint established an independently packed developer
Product rather than an ABIogenesis conformance publication:

```text
public Program start
  -> Program-owned GraphFunction
  -> synthesizeModel
  -> evalGap
  -> evaluateNext
  -> nonterminal F_H hold
  -> fresh-context read
  -> fresh-context interaction.respond
  -> fresh-context run.continue
  -> evaluateAction
  -> same-Run replay-derived closure
```

The `start` request names the admitted Program start and supervised policy. It
does not name a GraphFunction; that target is derived from the Program. The
validator checks the original GTL without lowering, HoG re-enters the admitted
successor cursor, and ABG remains the authority for invocation, response,
resume, result, judgment, replay, and closure truth. The fixture supplies its
own namespace, contracts, semantic implementations, Program, GraphFunction,
and implementation bindings; ABIogenesis core contains none of its identities.

That checkpoint did not close S03. It proved ordering and durable continuation
but deliberately did not claim:

- admitted `ConstructionIntent` between `evaluateNext` and work invocation;
- separate admission of evaluator output, work evidence, or action evaluation;
- model, gap, next-action, and action-result refresh after admitted evidence;
- the remaining consequence, runtime-disposition, and public-control rows; or
- the final all-forty-row qualification reconciliation.

Current verification is `test:m5` `74/74`, `test:m4` `26/26`, live Claude F_P
`1/1`, external developer Product `3/3`, and two byte-identical packs at
`sha256:0de23bd2344be03707c53846bd2570d50ee30ff59f9b12273b1e13e1a40dbed6`.

## Prior Selected Action And Construction Intent Checkpoint

Implementation commit `771e82e5` advances the same external Product path:

- `synthesizeModel`, `evalGap`, `evaluateNext`, F_H approval, and
  `evaluateAction` now emit distinct Product-owned typed values through the
  ordinary C-call evidence, result, and judgment path;
- `evaluateNext` emits one canonical `NextActionProjection` naming its target
  outcome, action, obligations, assets, expected delta, progress and stop
  conditions, current Program, GraphFunction, and successor GTL locus;
- ABG admits that projection only when it selects the exact current execution
  basis and declared F_H successor cursor, then derives one
  `ConstructionIntent` bound to the workspace, invocation, Program,
  GraphFunction, ExecutionBasis, Run, GraphCall, Frame, source
  C-call/result/judgment, and target cursor;
- the admitted route and construction selection bind the projection and
  intent, `fh_interaction_opened` consumes the exact intent availability, and
  replay-derived `project.read` renders it without Public recomputation; and
- a Product-valid approval naming another construction intent refuses before
  `fh_interaction_responded` or `run_closed`.

Fresh serialized verification is `test:m5` `75/75`, retained `test:m4`
`26/26`, external developer Product `4/4`, live Claude F_P `1/1`, and
conservation `44` pass with `18` explicit `todo`. Two independent packs
reproduce artifact SHA-256
`3ed3142c0e7b29f78bd17de9c693619e936a2b3cca8b6fd98582b5b34453d845`,
Product content digest
`sha256:1f80f715f27b13f455576b78861e7b3f84cc0325c1ac395c66dace9ffe4da6e7`,
and manifest digest
`sha256:9967bac4560781456bbbb47a83ba2923a1df330b2fc65b59edf48b397512d0cb`.

This checkpoint does not close S03. Post-evidence refresh and the remaining
scenario-owned consequence, runtime-disposition, and public-control behavior
remain the next frontier.

## Governed Evidence Fold And Refresh Checkpoint

Implementation commit `d5f8dbf6` repairs the review findings on the same
external Product path:

```text
Program ActionCatalog
  -> evaluateNext selection
  -> construction_intent_selected
  -> F_H hold/read/respond/continue
  -> evaluateAction
  -> EdgeFulfillmentLedger + EdgeClosureDecision(close_candidate)
  -> construction_delta_observed
  -> refreshed model -> refreshed gap -> converged NextActionProjection
  -> ordinary terminal route and closure
```

- the Program publishes the exact action, obligations, assets, expected delta,
  and progress/stop conditions; validation admits the canonical catalog and
  ABG requires the selected projection to equal its exact row;
- `construction_intent_selected`, not the traversal route, is the canonical
  intent event and the cause consumed by the F_H opening;
- the F_H response no longer closes the Run or supplies terminal truth;
- Product-owned `evaluateAction` emits one canonical evidence ledger and
  closure candidate through ordinary C-call evidence, result, and judgment;
- ABG admits `construction_delta_observed` only after reconciling the catalog
  obligations and assets with the exact intent, F_H lifecycle, and
  `evaluateAction` runtime evidence;
- Product-owned model, gap, and next-action refreshes execute through the same
  ordinary GTL/HoG/ABG path; only a converged projection citing the admitted
  intent, closure decision, refreshed gap, and construction delta can reach
  terminal closure; and
- a canonical Program whose catalog omits the selected action refuses before
  intent or F_H admission, while a Product-valid response naming another
  intent still refuses before response admission.

The affected design subject is M05 Section 12 at SHA-256
`d437db883ebdd18a33d809be7fcbec6b1ff3eeeb20da6375b39d1e202b2acd5a`.
It remains pending exact review and does not inherit the accepted M5 base
digest.

Fresh serialized verification is `test:m5` `75/75`, retained `test:m4`
`26/26`, external developer Product `4/4`, and live Claude F_P `1/1`. Two
independent packs reproduce artifact SHA-256
`2922f06fa25abed877e09753e2247bff0dedd09fcce17ae8cb89b1bd87aa2142`,
Product content digest
`sha256:32b43a2dc79db3d196f601e6739ccc0507195912dd3700e38e4ae1c3a126017c`,
and manifest digest
`sha256:b39ec404158e8908f759bda5304be450d11eb04220dfb1f069359266a928cd73`.

This checkpoint does not close S03. The retained consequence,
runtime-disposition, and public-control behavior remains the next vertical
frontier.

## Governed Basis And Closure Repair Candidate

Candidate `bc2fb63949dfba5524ccaa3a194b0921f74b0fe9` repairs the exact
Section 12 findings without changing Product, requirements, scenarios, or the
ticket graph:

- the external Product starts from an `ObservationSnapshot` bound to the exact
  WorkspaceBinding and Program `ActionCatalog`;
- Product model and gap evaluation emits one `NextActionBasis` containing the
  snapshot, target obligations, admitted catalog, deterministic priority,
  runtime frontier, and declared policy;
- the admitted `ConstructionIntent` preserves that exact basis;
- ABG derives one `ActionEvaluationBasis` from the intent, complete admitted
  F_H evidence, workspace, catalog identity, closure policy, and causal runtime
  events before HoG re-enters the Product evaluator;
- Product `evaluateAction` consumes that basis and ABG reconciles its ledger
  and decision against every admitted evidence reference; and
- an intent-bearing Run can close only after its matching construction delta,
  refreshed converged basis, and converged next-action projection exist in the
  same replay scope. Stage-role strings carry no closure authority.

Installed mutations prove refusal of terminal closure immediately after
`evaluateAction`, terminal closure directly from F_H resume, the old scalar
approval input, and a self-consistent ledger that omits the admitted evidence.
A complete path with a renamed terminal role remains green.

The affected M05 design subject hashes to
`96724255739b8b3c9e2e472b3b17f8680898e8cd9eddfad1a836ddcd6d3ac4d4`.
It remains pending exact review and is not accepted by this checkpoint.

Fresh serialized verification is `test:m5` `81/81`, retained `test:m4`
`26/26`, and external developer Product `10/10`. The committed live F_P proof
remains retained and was not rerun. Two byte-identical packs reproduce:

- artifact SHA-256:
  `bd639bc2b203ebb7baf92b2f04a0506c7dfd01ac06b93bbef493a3bbde242da2`;
- Product content digest:
  `sha256:2f550a698e20c16ce3c7c4011cab4121e4541ded339d5bd208bad910f652c3e2`;
- manifest digest:
  `sha256:145970e141aea03921ba8c06c3d3b66357d362c055ac36f89cea2a0f07e6dc1f`.

This repair does not close S03. Exact review of the frozen candidate precedes
the next consumer-visible `gap_stop -> public re-entry -> convergence` slice.

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
