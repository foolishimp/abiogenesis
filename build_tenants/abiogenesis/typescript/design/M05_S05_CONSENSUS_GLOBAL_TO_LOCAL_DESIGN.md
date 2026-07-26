# M05 S05 Consensus Global-To-Local Design

**Status**: Proposed design cut; implementation held; review not started

**Owner**: T-270

**Product outcome**: `ABG5-S05`

**Accepted basis**: S03 candidate `8865ccff`; accepted M03 and M05 Sections
1 through 12

**Decision rationale**:
[ADR-045](./adrs/ADR-045-global-design-constraints-survive-local-projection.md)

This delta records only the global decisions S05 must preserve and their local
projection. It does not restate accepted traversal, event, replay,
continuation, or closure design.

## Product Function

```text
One Surface selects canonical Consensus
  -> attributed reviewers evaluate exact subject and instructions
  -> complete admitted findings vector
  -> exact attributed submitter responds
  -> Product reduces admitted response
  -> close or open response-bearing next round
  -> admit source result
  -> optionally resolve eligible unresolved result through replay-bound F_H
  -> replay-derived public result and ticket.consensus read
```

The total public outcome is typed refusal, block, failure, agreement,
unresolved disagreement, contract failure, or an F_H-derived partial
agreement. Consensus adds no controller, scheduler, event family, result
store, continuation family, public command, compiler, or second runtime.

## Global Decisions And Local Projection

1. **One Surface is the sole public construction path.**
   - Local: the canonical Consensus action selects one declared source
     GraphFunction after invocation admission.
   - Falsified by: direct public source start, feature selector, or result-only
     closure.

2. **Product owns semantic meaning.**
   - Local: subject, role, task, findings, response, reduction, result, and
     support-finalization relations are Product-owned F_D meaning.
   - Falsified by: implementation, HoG, ABG, Public, fixture, or worker
     deciding agreement, recursion, escalation, or closure.

3. **Implementation owns only F_P host effects.**
   - Local: reviewer and submitter transports receive exact Product tasks and
     return candidates.
   - Falsified by: transport selecting subject, instructions, schema, policy,
     panel, result meaning, or runtime truth.

4. **GTL owns declared composition.**
   - Local: reviewer fan-out, submitter response, deterministic reduction,
     bounded recursion, source projection, and F_H support are visible in the
     published Program and GraphFunctions.
   - Falsified by: host-language round, panel, retry, submitter, or escalation
     loop.

5. **HoG traverses and proposes; ABG admits.**
   - Local: leaf candidates return to HoG; HoG proposes evidence, result,
     judgment, route, child closure-or-stop, and foldback; ABG alone admits and
     appends.
   - Falsified by: LeafPort or Product writing ABG truth, or HoG deciding
     closure independently.

6. **Lineage is one product-wide relation.**
   - Local: the admitted source Program has one exact disposition for every
     reachable F_P output contract; reviewer and submitter semantic evidence
     must derive from that exact attempt's admitted transport evidence.
   - Falsified by: missing/surplus policy, absent-policy success,
     result-created evidence, or a Consensus-specific lineage path.

7. **ABG events are authoritative; diagnostics are not.**
   - Local: round, child, C-call, response, result, support, and closure truth
     use existing ABG events and replay. Logs, traces, metrics, and telemetry
     are observations only.
   - Falsified by: diagnostic presence or absence changing admission,
     reduction, retry, escalation, replay, or closure.

8. **Retry, child closure, and foldback are shared runtime laws.**
   - Local: each reviewer or submitter task opens one child GraphCall/Frame;
     retries open fresh C-call attempts inside that child; child close-or-stop
     totalizes its transparent parent C-call and permits at most one successful
     foldback.
   - Falsified by: retrying `workflow.C`, sibling retry children, inferred
     closure, incomplete parent suffix, or duplicate foldback.

9. **Replay and durable authority govern continuation and reads.**
   - Local: source and support episodes reopen from exact event-prefix,
     Product, workspace, Program, invocation, and Run authority.
   - Falsified by: process memory changing admissibility, stale prefix,
     cross-workspace substitution, mutable read, or rival result store.

10. **F_H support consumes admitted source truth.**
    - Local: only an ABG-derived basis over an admitted
      `unresolved_disagreement + escalate_fh` source result may open a distinct
      support invocation.
    - Falsified by: candidate result escalation, agreement/contract-failure
      escalation, source Run mutation, or source/target identity collapse.

11. **Native and serialized contracts have one Product meaning.**
    - Local: generated schemas and vocabularies project the Product-owned
      native contract source.
    - Falsified by: hand-maintained competing schema meaning or schema runtime
      authority.

12. **`ticket.consensus` is a read, not governance.**
    - Local: a ticket subject projects its exact admitted result and replay to
      the exact ticket ref/digest.
    - Falsified by: ticket mutation, automatic triage, or Consensus admitting
      its own ruling as governance truth.

## Local Semantic Functions

S05 introduces these irreducible Product relations:

- `MaterializeSubject`: admitted inline subject bytes -> exact materialization
  or refusal.
- `ResolveRoleBasis`: admitted declaration and environment -> exact reviewer
  or submitter role basis or refusal.
- `ConstructConsensusInvocation`: subject, panel, role bases, policy,
  workspace, Program, and catalog -> invocation candidate or refusal.
- `InitializeRound`: admitted invocation -> round one with empty prior lineage.
- `ConstructReviewerTask`: admitted round and panel position -> exact reviewer
  task.
- `EvaluateReviewer`: reviewer task -> attributed findings candidate or F_P
  failure.
- `AssembleFindingsVector`: complete ordered admitted reviewer results ->
  vector or refusal.
- `ConstructSubmitterTask`: round and complete vector -> exact submitter task.
- `EvaluateSubmitter`: submitter task -> attributed response candidate or F_P
  failure.
- `ReduceRound`: admitted response embedding its exact task and vector ->
  terminal or response-bearing successor round.
- `ProjectSourceResult`: complete terminal history -> source result candidate.
- `FinalizeSupport`: admitted source-result basis and admitted F_H decision ->
  target result candidate.

`AssembleFindingsVector` has no partial-stop output. ABG owns partial-stop truth
as the disjoint completed/stopping/unstarted task partition.

## Composition

- Invocation identity is constructed before observation and action selection;
  selected action and ConstructionIntent do not participate in that identity.
- One Surface observes the admitted invocation, selects the canonical action,
  and admits its intent before entering the source GraphFunction.
- A round constructs reviewer tasks in panel order, traverses reviewer
  children, and assembles a vector only after complete fan-out truth.
- Every complete vector enters the submitter child before deterministic
  reduction.
- A successor round is impossible until the exact submitter response is
  Product-valid, ABG-admitted, and carried in prior-round lineage.
- Terminal reduction projects one source result; canonical child closure and
  foldback precede One Surface evidence fold, refresh, and root closure.
- An eligible unresolved source result may later open a separate support
  episode; the source remains closed and readable.

Algorithms must preserve panel order, contiguous round ordinals, exact
finding-occurrence identity, finite round and attempt bounds, and total
reduction. Concrete data structures and equivalent algorithms remain local
implementation choices.

## Module Projection

- `src/gtl`: Product domain contracts, semantic relations, canonical
  declarations, and GTL topology.
- `src/product`: installed Product semantics, role and worker resolution,
  sealed F_D relations, F_P lineage projection, and Product read semantics.
- `src/implementation`: reviewer and submitter F_P transport mechanics only.
- `src/hog`: generic traversal and candidate/route proposal.
- `src/abg`: admission, authoritative events, Event Calculus, replay,
  continuation, and closure.
- `src/public`: stateless fixed composition and immutable envelopes.

No new IACS family is introduced. S05 values remain subordinate to accepted
GTL declaration and traversal aggregate families.

## Three Semantic Views

### Domain

- Product domain: subject, panel, role basis, invocation, round, task,
  findings vector, submitter response, result, and ticket projection.
- Runtime domain: accepted Invocation, Run, GraphCall, Frame, C-call, events,
  replay, source-result basis, and continuation.
- Authority direction: Product candidates -> HoG proposals -> ABG admission ->
  replay -> Public projection.

### Interaction

- request -> Product basis -> Program validation -> invocation admission;
- Graph and leaf-basis validation -> Run open -> One Surface action selection;
- reviewer tasks -> F_P candidates -> ABG results -> complete vector;
- submitter task -> F_P candidate -> ABG response -> Product reduction;
- successor round or source result -> child close/foldback -> One Surface
  refresh -> root closure; and
- replay-bound eligible source result -> distinct F_H support invocation ->
  target result and closure.

### Lifecycle

- pre-invocation refusal opens no invocation or Run;
- post-invocation/pre-Run refusal records invocation refusal and opens no Run;
- post-Run refusal becomes ABG blocked/failed stop;
- an opened C-call always receives a complete rejection or success suffix;
- reviewer partial stop cannot create vector, submitter, reducer, or successor;
- submitter failure cannot create reduction or successor;
- response-bearing successor loops to the next round;
- terminal source closes and remains immutable/readable; and
- support refusal or failure changes only the separate target episode.

These bullet views are the proposed text-native delta projections for this
boundary. Accepted S03 M03/M05 diagrams remain the unchanged global basis.

## Design Acceptance Predicate

Independent review should answer only:

- Does each global decision have one visible local projection?
- Do the local functions and composition satisfy every applicable S05
  requirement without adding a rival global mechanism?
- Can any local path lose or contradict identity, authority, lineage, event,
  replay, failure, closure, or public-read law?
- Do two materially different semantic systems remain lawful?

If those answers are clean, code can be derived. If code later requires a new
global decision, design re-entry or F_H direction is required.

The worker performs no semantic self-review. Before handoff it runs only
mechanical checks, binds one exact subject, and stops.
