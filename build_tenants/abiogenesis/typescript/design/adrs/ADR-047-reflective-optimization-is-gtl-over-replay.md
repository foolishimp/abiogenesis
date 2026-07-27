# ADR-047: Reflective Optimization Is GTL Over Replay

**Status**: Candidate; pending independent S04 design review

**Date**: 2026-07-28

**Owner**: T-268 under T-270

## Context

ABIogenesis must observe and tune an existing graph without creating an
observer runner, tuner controller, mutable telemetry store, or semantic CLI.
The target graph already has the required constructive and runtime authorities:
GTL declares it, HoG traverses it, ABG records its events, and replay projects
its truth.

Optimization is undefined without a declared comparison basis. The workspace
evolves through ordinary graph execution; the GraphFunctions, reusable node
types, policies, and overlays bound to each execution are immutable catalog
declarations. The executive must evaluate the replay-projected workspace
against one exact applied evaluation overlay. The tuner may then propose a new
immutable declaration version under one exact objective. It does not optimize
the workspace directly.

The unresolved design question is whether the installed CLI can trigger the
observer and tuner while preserving those authorities.

## Decision

1. An observable target is an admitted graph execution identified by its exact
   WorkspaceBinding, Program, GraphFunction, materialization, Run, event-log
   prefix, and replay digest. A declaration with no admitted replay is not an
   observation target.
2. ABG derives one immutable observation basis from durable replay authority.
   The caller may transport its fields but cannot author or widen them.
3. Each observation basis binds the exact catalog declaration set and applied
   evaluation overlay used by the target execution. Product-owned deterministic
   relations project overlay fulfillment; the executive observer interprets
   that admitted projection. Neither relation selects or mutates workspace work.
4. One immutable `TuningObjective` binds the evaluation overlay, ordered typed
   criteria, comparison direction, aggregation contract, priority, hard
   conservation constraints, target declaration set, and admissible observation
   scope. Hidden weights, prompt preferences, and implementation defaults are
   not tuning authority.
5. Tuning means deriving a candidate next immutable declaration version:

   ```text
   immutable A + admitted executive evaluations + objective
     -> no_proposal | immutable A1 draft
   ```

   GraphFunctions, reusable `node_type` declarations, and overlays are the
   existing eligible catalog target kinds. Policy changes are subordinate
   content of a complete successor overlay/Program declaration, not a new
   catalog kind. The tuner cannot patch `A` in place. `A1` has a new canonical
   ref and content digest and binds `derivedFromRef` and
   `derivedFromDigest` to `A`.
6. Catalog identity uses the existing exact URI namespace. Family and version
   ancestry are represented by hierarchical URI paths or qualifiers plus
   explicit lineage fields; no hierarchy engine, mutable latest alias, fallback
   lookup, or second catalog is introduced. Existing Runs remain bound to
   `A`. A ratified `A1` becomes available only through ordinary Product
   publication, verification, catalog admission, and, where required,
   `catalog.apply`.
7. An overlay being proposed as a target is never its own governing evaluator.
   `EvaluationOverlay` is immutable for one tuning basis. A proposed
   `TargetOverlay A1` is judged by another exact objective/evaluation overlay,
   and only later replay can establish realized improvement.
8. ABIogenesis publishes observer and tuner GraphFunctions as Product-owned GTL
   content. A composed reflective root orders them through existing
   `C.compose`, `C.edge`, and `workflow.C` constructors.
9. Observer and tuner remain separate judgments. The tuner can consume an
   observer report only after ABG has admitted the observer child result and
   foldback.
10. The existing `abg.operation.run.invoke` path starts the reflective root.
   `abg.cli` parses and renders that same typed public invocation. It does not
   select the target, derive replay truth, sequence the graph, or interpret the
   result.
11. Literal `tune report`, `tune propose`, `tune ratify`, and `tune reject`
   spellings, when supplied, are elimination-equivalent request serializers for
   `project.read` and `tuning.transition`. They add no operation identity or
   semantic branch.
12. Observer output is attributed diagnostic truth. Tuner output is a
   declaration-draft candidate. Neither output mutates the target graph,
   declarations, workspace assets, tickets, or runtime state.
13. `tuning.transition(propose | ratify | reject)` uses the existing public
   operation-definition family and the existing ABG RuntimeEventFamily.
   Ratification records authority over a draft; applying it is later ordinary
   governed work.
14. The existing catalog publishes the reflective Program, GraphFunctions,
   contracts, policies, and optional overlays under canonical URI identities.
   No observer or tuner catalog, registry, store, or hierarchy engine exists.

## Consequences

- The generic CLI can trigger optimization over an existing replay-bearing
  graph without new shell functionality.
- A graph with no admitted execution history refuses as
  `missing_replay_basis`; static conformance is a different Product function.
- The executive answers whether and how the evolving workspace satisfies the
  exact applied overlay. The tuner answers whether an immutable catalog
  declaration should have a candidate successor under the declared objective.
- Ratification makes a candidate eligible for ordinary catalog publication; it
  does not mutate, replace, or retag its source declaration.
- Realized improvement is replay truth from later execution of the admitted
  successor, not a fact created by proposal or ratification.
- Reflective execution appends events for its own Run and draft transitions.
  It cannot append target-Run events or change target declarations.
- The three tuner draft event kinds extend the existing event variant roster;
  they do not create a new event family.
- The design consumes the accepted M03 IACS and module dependency law. It adds
  no module, runtime, controller, or top-level carrier family.

## Falsification

This decision is false if implementation needs any of:

- a `tune` runner or controller outside `run.invoke`;
- caller-authored replay or telemetry truth;
- observer-to-tuner transfer without an admitted result boundary;
- tuning without an exact objective, evaluation overlay, target declaration
  set, baseline, or comparison law;
- in-place declaration mutation, mutable latest aliases, or a Run silently
  rebinding from `A` to `A1`;
- an overlay proposal evaluating itself;
- a Product, implementation, HoG, Public, or CLI event writer;
- direct mutation or automatic application of a draft;
- a second catalog, event log, draft ledger, replay fold, or closure path; or
- a new semantic choice not resolved by the S04 design.
