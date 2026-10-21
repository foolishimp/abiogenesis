# ABG Event Calculus IACS

**Status**: Active
**Ticket**: T-120

## Irreducible Carrier Set

| Carrier | Owner | Role |
|---|---|---|
| `RuntimeEvent` | ABG M03 | admitted happened fact |
| `RuntimeFluent` | ABG M03 | replay-derived fact candidate |
| `RuntimeFluentPattern` | ABG M03 | clipping/derived-rule match shape |
| `RuntimeEventCalculusAxiom` | ABG M03 | event-kind to effect declaration, declared in the table `ROOT_EVENT_CALCULUS` |
| `RuntimeEventCalculusEffect` | ABG M03 | initiated, terminated, clipped, declipped fluents; realized as the type `EventCalculusEffect` |
| `DerivedEffectRule` | ABG M03 | contextual effect from the fold state, the event and its declared dependencies, declared in the table `ROOT_DERIVED_RULES`; realizes `RuntimeDerivedFluentRule`, the ramification hook over replayed fluents |
| `FoldState` | ABG M03 | fold carrier at one prefix cut: its `HoldsAt` and ordinal |
| `HoldsAt` | ABG M03 | current fluent truth at one cut: fluent ref to `RuntimeFluent` |
| `RuntimeEventCalculusProjection` | ABG M03 | `HoldsAt` read model: the published projection of one `FoldState` at a prefix cut |

`ROOT_EVENT_CALCULUS` declares the effects that depend only on the event kind.
`ROOT_DERIVED_RULES` declares every contextual effect: the terminal Run census,
per-process cleanup, liveness and the actor process lifecycle. Both tables are
module constants; no caller supplies an axiom or a rule.

The pure functions `effectOf` and `foldStep` apply the axiom effect and every
applicable rule effect to a `FoldState`. `RuntimeEventCalculusDerivation` is
the memoized realization of the pure `foldStep`, with `forkAt` for reuse at a
cut. It is not a carrier.

## Subordinate And Downstream Rows

`RuntimeEventCalculusEffectRow` is subordinate to
`RuntimeEventCalculusProjection`. It publishes replay evidence for audit, but it
does not become a second source of event/fluent law.

The transition cache, probe facts and interruption facts inside `FoldState` are
subordinate to `FoldState`. They have no identity, admission or lifecycle of
their own.

## Effect Boundary

The axiom and rule tables have no provider, runner, or product-policy effect.
They only map admitted event truth to replay-derived fluent truth.

## Proof Surface

`test_t120_event_calculus_runtime_law.test.mjs` proves initiation, inertia,
clipping, undeclared-kind rejection, malformed fluent rejection, duplicate
axiom rejection, contradictory effect rejection, and projection parity for
vector closure.

For every admitted prefix, `RuntimeEventCalculusDerivation.advance` and the pure
`foldStep` fold yield identical `holds`, `clippedFluentRefs` and
`declippedPatternRefs`, and cold replay equals the warm fork at every cut.

`holdsAt` is the only admitted reader of a lifecycle fact, such as whether an
owned process has terminated. Falsifier: any module outside `abg/calculus/`
that answers a lifecycle question from a copied payload field, from process
facts, from its own recomputation over the log or from a second store, instead
of calling `holdsAt`. The owner's physical observation that selects which event
it reports is not such a reader.

The `actor_process_lifecycle` rule derives `actor_process_terminated` and checks
the copied `terminationConfirmed` payload field against it at fold time. The
field stays in the payload until the next root event contract profile change.
Falsifier: an admitted event whose copied field disagrees with the derived
fluent. The
[common library design](ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md#9-recovery-from-the-event-log)
states the recovery law this reader serves.
