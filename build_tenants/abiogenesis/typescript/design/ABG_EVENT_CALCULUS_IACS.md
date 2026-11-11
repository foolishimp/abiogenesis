# ABG Event Calculus IACS

**Status**: Active
**Ticket**: T-120

Retired sections: [history/ABG_EVENT_CALCULUS_IACS__RETIRED_SECTIONS.md](history/ABG_EVENT_CALCULUS_IACS__RETIRED_SECTIONS.md).

## Irreducible Carrier Set

| Carrier | Owner | Role |
|---|---|---|
| `RuntimeEvent` | ABG M03 | admitted happened fact |
| `RuntimeFluent` | ABG M03 | replay-derived fact candidate |
| `RuntimeFluentPattern` | ABG M03 | clipping/derived-rule match shape |
| `RuntimeEventCalculusAxiom` | ABG M03 | event-kind to effect declaration, declared in the table `ROOT_EVENT_CALCULUS` |
| `RuntimeEventCalculusEffect` | ABG M03 | initiated, terminated, clipped, declipped fluents; realized as the type `EventCalculusEffect` |
| `DerivedEffectRule` | ABG M03 | contextual effect from the fold state, the event and its declared dependencies, declared in the table `ROOT_DERIVED_RULES`; realizes `RuntimeDerivedFluentRule`, the ramification hook over replayed fluents |
| `RuntimeEventCalculusProjection` | ABG M03 | `HoldsAt` read model: the published projection of one `FoldState` at a prefix cut |

`ROOT_EVENT_CALCULUS` declares the effects that depend only on the event kind.
`ROOT_DERIVED_RULES` declares every contextual effect: the terminal Run census,
per-process cleanup, liveness and the actor process lifecycle. Both tables are
module constants; no caller supplies an axiom or a rule.

The pure functions `effectOf(state, event, dependencies)` and
`foldStep(state, event, dependencies)` are closed over `ROOT_EVENT_CALCULUS`
and `ROOT_DERIVED_RULES`: they apply the axiom effect and every applicable rule
effect to a `FoldState`, and their signatures take no axiom or rule. Each
rule's `derive` is module-owned. `RuntimeEventCalculusDerivation` is the
memoized realization of the pure `foldStep`, with `forkAt` for reuse at a cut.
It is not a carrier.

## Subordinate And Downstream Rows

`RuntimeEventCalculusEffectRow` is subordinate to
`RuntimeEventCalculusProjection`. It publishes replay evidence for audit, but it
does not become a second source of event/fluent law.

`FoldState`, the fold carrier at one prefix cut, and its `HoldsAt`, the map
from fluent ref to `RuntimeFluent`, are subordinate to
`RuntimeEventCalculusProjection`, which publishes one `FoldState`. The
transition cache, probe facts and interruption facts inside `FoldState` are
subordinate to `FoldState`. None has identity, admission or lifecycle of its
own.

## Effect Boundary

The axiom and rule tables have no provider, runner, or product-policy effect.
They only map admitted event truth to replay-derived fluent truth.

## Proof Surface

`m5-event-calculus-runtime.test.mjs` ("closed typed Event Calculus law refuses
missing, duplicate, malformed, and contradictory input") proves rejection of a
missing axiom kind and a duplicate axiom kind
(`validateRuntimeEventCalculusAxiomKindsForModuleTest`), a fluent pattern that
constrains neither name nor identity (`constructRuntimeFluentPattern`), an
effect that both initiates and terminates one fluent
(`validateRuntimeEventCalculusEffectForModuleTest`, `abg/calculus/axioms.ts`)
and a prefix that is not a nominal validated prefix
(`deriveRuntimeEventCalculusProjection`, `abg/event_calculus.ts`).

For every admitted prefix, `RuntimeEventCalculusDerivation.advance` and the pure
`foldStep` fold yield identical `holds`, `clippedFluentRefs` and
`declippedPatternRefs`, and cold replay equals the warm fork at every cut.

`holdsAt` is the only admitted reader of a lifecycle fact. The lifecycle
fluents are closed: `actor_process_spawn_failed` from the axiom table, and
`actor_process_live`, `actor_process_terminated`,
`actor_process_termination_unconfirmed` and `actor_cleanup_pending` from the
`actor_process_lifecycle` rule. A reader passes a pattern
`{ kind: "runtime_fluent_pattern", name, identity }` naming one of them.
Falsifier: any module outside `abg/calculus/` that decides one of these
fluents from a copied payload field, from the presence of an event kind in a
prefix, from its own recomputation over the log or from a second store,
instead of calling `holdsAt`. The owner's physical observation that selects
which terminal event it reports is not such a reader. Helper-run processes
have no `actor_process_*` events; their answer is a projection of their admitted leaf
result or failure.

The `actor_process_lifecycle` rule initiates `actor_process_terminated` from
`actor_process_exited` and checks the copied `terminationConfirmed` payload
field against it at fold time. The fluent wins. A disagreement initiates the
diagnostic fluent `terminationConfirmed_copy_disagrees(processRef)`, and no
prefix is refused, so existing history reopens unchanged. The field stays in
the payload until the next root event contract profile change. Falsifier: a
disagreement not recorded as that diagnostic fluent, or a prefix refused for
it. The
[common library design](ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md#9-recovery-from-the-event-log)
states the recovery law this reader serves.
