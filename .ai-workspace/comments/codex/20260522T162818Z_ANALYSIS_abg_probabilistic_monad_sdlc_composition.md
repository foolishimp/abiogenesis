# ABG Probabilistic Monad Over SDLC Composition

Status: commentary / clarification
Author: Codex
Date: 2026-05-22

## Claim

ABG is the monadic system boundary over GTL and downstream product
composition.

For an SDLC product, the correct shape is not one local plugin call that runs
the whole lifecycle. The correct shape is staged plugin computation with
ABG.system side effects between stages:

```text
ABG.start
  -> ABG invokes SDLC_plugin.transform.C
  -> ABG.system admits, writes, projects, and replays transform truth
  -> ABG invokes SDLC_plugin.evaluate.C
  -> ABG.system admits, writes ledgers, folds assurance, and derives traversal
  -> ABG invokes SDLC_plugin.consequence.C when a product read-model projection is required
  -> ABG.system admits projection refs and continues, retries, blocks, reprices, escalates, or closes
```

The product plugin computes typed values. ABG binds those values into runtime
truth.

## Notation

The notation is `function.compute`.

```text
transform.C
evaluate.C
consequence.C
```

`C` is selected composition notation over selected `abg.fn_composition`.
It is not `ComputeUnit`, not `ReliableCompute`, not a public GTL topology
object, not an execution target, and not a ledger writer.

`F_D`, `F_P`, and `F_H` are regimes inside the selected composition.

```text
C = selected abg.fn_composition(
  ordered regime bindings: F_D | F_P | F_H
)
```

The stage name comes first because the function boundary is the thing being
computed. The means of computation lives inside `C`.

```text
transform.C, not F_P.transform as the primary notation
evaluate.C, not F_P.evaluate as the primary notation
```

`F_P.evaluate` remains a valid regime binding inside `evaluate.C`.

## Monadic Shape

ABG is the effect and continuation system.

The clearest expression is:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(plugin.transform.C)
  .bind(system.admitTransform)
  .bind(system.writeTransformEventsAndLedgers)
  .bind(plugin.evaluate.C)
  .bind(system.admitEvaluation)
  .bind(system.writeEvaluationLedgers)
  .bind(system.assuranceFold)
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

```text
SDLC_plugin.transform.C : A -> Candidate<B>
ABG.bind(admit_transform)
ABG.bind(write_transform_events_and_payload_ledgers)

SDLC_plugin.evaluate.C : Candidate<B> -> EvaluationFindingRefs
ABG.bind(admit_evaluation)
ABG.bind(write_evaluation_ledgers)
ABG.bind(assurance_fold)

SDLC_plugin.consequence.C : AdmittedEvaluationState -> ProductProjectionRefs
ABG.bind(admit_consequence_projection)
ABG.bind(traversal_transition)
ABG.bind(replay_continuation)
```

In compact form:

```text
fn<A, B>.C =
  ABG.system(
    transform.C
      >>= ABG.admit
      >>= ABG.write
      >>= evaluate.C
      >>= ABG.admit
      >>= ABG.ledger
      >>= ABG.fold
      >>= consequence.C
      >>= ABG.traverse
  )
```

More generally, ABG is the event-sourced monad over selected GTL composition.
The probabilistic case is the composition where `C` includes `F_P`.

```text
F_D-only composition:
  deterministic event-sourced system

F_P-backed composition:
  probabilistic event-sourced system

F_D -> F_P -> F_D composition:
  deterministic envelope, probabilistic semantic judgment, deterministic admission

F_D -> F_P -> F_H composition:
  deterministic envelope, probabilistic judgment, human escalation
```

This is why ABG is also the probabilistic monad: probabilistic compute can
exist inside the composition, but ABG owns the bind points where probabilistic
outputs become admitted runtime truth, ledgers, assurance projections, replay,
and continuation.

## Plugin Boundary

Plugins are stage functions called by ABG. They are not mini-runtimes.

```text
ABG invokes plugin stage
plugin returns candidate/evaluation/projection refs
ABG.system performs side effects
ABG derives the next lawful stage
ABG invokes the next plugin stage
```

The product plugin owns product-specific assertions at the stage boundary:

```text
SDLC_plugin.transform.C:
  assert selected composition has a transform regime binding
  assert transform regime is allowed for this edge
  assert F_P writes only candidate/product artifacts
  assert no ledger, projection, traversal, or closure write

SDLC_plugin.evaluate.C:
  assert selected composition has an evaluate regime binding
  assert ambiguous SDLC edges use F_P.evaluate unless a deterministic optimization is selected
  assert F_D.evaluate has an explicit disambiguation or optimization contract
  assert evaluation findings cite the selected composition and selected regime binding
  assert findings are candidate facts, not closure truth

SDLC_plugin.consequence.C:
  assert inputs are ABG-admitted evaluation facts
  assert product projections cite admitted state, assurance decision refs, and traversal refs
  assert no product plugin writes event, ledger, replay, or closure truth
```

ABG owns the universal plugin assertions:

```text
plugin may not select the next vector
plugin may not close traversal
plugin may not own the iteration loop
plugin may not emit runtime truth directly
plugin output is proposed evidence until ABG admission
```

## Evaluation Authority

`F_D.evaluate` is valid as an optimization when the use case is disambiguated.
It is not the generic substitute for semantic evaluation.

For exact contracts:

```text
evaluate.C = F_D.evaluate
```

Examples: schema shape, digest match, declared path existence, exact test
command exit, target carrier envelope admission.

For general SDLC ambiguity:

```text
evaluate.C = F_P.evaluate -> F_D.admit
```

Examples: intent satisfaction, requirement pressure closure, design adequacy,
implementation fitness, residual ambiguity, semantic gap analysis.

For hybrid use:

```text
evaluate.C = F_D.precheck -> F_P.evaluate -> F_D.admit
```

`F_D` removes malformed or impossible inputs. `F_P` maps semantic ambiguity.
`F_D` admits the returned evaluation facts. ABG writes truth.

## Ledger Rule

F_P does not write ledgers.

`evaluate.C` returns F_P-authored or F_D-authored evaluation facts under the
selected composition. ABG.system admits those facts and writes the ledgers,
events, projections, fold truth, traversal transition, continuation, and replay.

```text
F_P.evaluate -> evaluation finding refs
ABG.admit -> admitted evaluation facts
ABG.system -> ledgers/events/projections/fold/replay
```

This keeps probabilistic judgment inside composition while keeping runtime truth
inside ABG.

## Drift Pattern

The drift pattern is easy to identify:

```text
constructFpEvaluateResult(report, postflight)
```

This is suspicious when no `evaluate.C` plugin stage was invoked and no selected
evaluation regime produced the findings.

The false-positive compliance shape is:

```text
postflight -> construct GtlEvaluationFindingRef -> carry compositionRef
```

That preserves selected composition identity but does not prove that
`evaluate.C` was executed by the selected evaluation regime.

The valid shape is:

```text
ABG invokes SDLC_plugin.evaluate.C
SDLC_plugin.evaluate.C returns finding refs
ABG admits finding refs
ABG writes fp_evaluate_result / ledgers / fold projections
```

## SDLC T-179 Implication

T-179 should be assessed against the staged monadic model, not only against
documentation or carrier identity.

Passing criteria:

```text
transform.C result preserves selected composition identity
ABG.system admits and writes transform truth
evaluate.C is a real stage invocation under selected composition
evaluate.C findings cite selected composition and selected regime binding
ambiguous SDLC edges use F_P.evaluate unless an F_D optimization is selected
ABG.system writes evaluation ledgers and closure/fold truth
consequence.C is a projection over ABG-admitted facts
```

Failing pattern:

```text
one fp_dispatch plugin call performs transform, report synthesis, postflight,
evaluate-result construction, assurance, consequence, and continuation
```

That makes the product plugin act as a local runtime. It collapses the ABG bind
points and pushes semantic ambiguity into deterministic code branches.

## Relationship To Existing Law

This post does not propose a GTL or ABG rename.

It restates the existing law:

- GTL defines graph functions, typed nodes, graph vectors, jobs, and selected
  compute notation.
- `C` is notation over selected `abg.fn_composition`.
- ABG owns admission, events, payload ledgers, assurance projection, closure
  fold, traversal transition, continuation, correction, and replay truth.
- Downstream products own product pressure, gain meaning, proof interpretation,
  and read-model projection semantics.

The clarification is execution-shape specific:

```text
ABG invokes one product plugin stage at a time.
ABG.system side effects occur between stages.
The next plugin stage is invoked only after ABG has admitted and projected the
previous stage result.
```

## Public Release Framing

The reusable framework statement is:

```text
GTL supplies typed graph functions.
ABG supplies the event-sourced monad over selected composition.
Products supply plugins that compute typed stage values.
ABG binds those values into admitted runtime truth.
```

The user-facing simplification is:

```text
Plugins compute.
ABG binds.
ABG writes.
ABG continues.
```

## T-144 Realization Note

The ratified implementation should make the same shape visible in contracts:

- compute-stage category names are `transform`, `evaluate`, `consequence`, and
  external `human_callout`;
- `F_H` is not internal human work inside ABG, but an external callout boundary
  whose response must be admitted before it can affect runtime truth;
- runtime observer and hook/action surfaces should use `evaluate`, not the
  ambiguous `eval` stage label;
- selected `abg.fn_composition` identity must be present on plugin invocation
  surfaces that participate in transform/evaluate/consequence computation.
