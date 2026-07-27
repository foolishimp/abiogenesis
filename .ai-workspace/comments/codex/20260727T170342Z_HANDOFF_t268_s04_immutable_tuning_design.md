# Handoff: T-268 S04 Immutable Tuning Design

## Why This Is Being Reviewed

S05 exposed a repeated failure mode: implementation and code review were being
used to discover Product functions that design should already have resolved.
The proportionality correction is to disambiguate the complete S04 function
before realization, then stop.

Direct F_H authority selected one design-only T-268 reframe. No S04 runtime,
contract, schema, event, operation, test, publication, package, or proof code is
authorized by this cut. The worker authored and mechanically checked one
coherent design subject and issues no semantic verdict.

The intake question is now explicit:

> What does tuning mean, what is being tuned, and what makes one version better?

The candidate answer is:

```text
solve:     Execute(A, Workspace[n]) -> Workspace[n+1]
evaluate:  Executive(Replay(Workspace[0..n]), EvaluationOverlay) -> admitted evaluations
optimize:  Tuner(A, admitted evaluations, TuningObjective) -> no_proposal | draft A1
```

The workspace evolves. GraphFunctions, Graph interiors, reusable `node_type`
declarations, overlays, and subordinate policy content are immutable. Tuning
does not mutate or solve the workspace. It derives a complete immutable
successor declaration `A1` from exact `A` under one replay-grounded objective.

## Exact Subject

- candidate commit:
  `4897ead13d4d43bdd7538f74e3ce83888b03f5c6`
- candidate tree:
  `11d0ef7ba40cfbd6efc31f447b27b21834c23d54`
- parent:
  `ffc5b84c8ed773365b522dfaf0372646b1fc2de4`
- active ticket SHA-256:
  `67ac610d92c1a0192c1bd17e067082f396cbab762d5392cad8d92466befc523a`
- design SHA-256:
  `a84cf02bb428ff1f0fce2c2b203a2ad478fa9a81b0c1ed3405cf9ed09893d3a5`
- ADR SHA-256:
  `92c469ac44f9ae1dd65054fc363a25023ca75f7f153d148166f1a137c676627e`
- sorted three-file aggregate:
  `c85541d57e465c8eee55dc63f976a441085f849a479d67db95247816bb5e87fa`

Aggregate algorithm:

```text
for each core path:
  sha256(file bytes) + two spaces + path + newline
sort rows bytewise
sha256(sorted rows)
```

Core review surfaces:

- `.ai-workspace/tickets/active/T-268-publish-abg-5-tenant-conformance-manifest-consensus-coverage.md`
- `build_tenants/abiogenesis/typescript/design/M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/adrs/ADR-047-reflective-optimization-is-gtl-over-replay.md`

The exact commit also reconciles GOALS, bootstrap instructions, design index,
M05 supersession, and the T-270 design-only exception.

## Resolved Design

1. ABG derives an ordered non-empty vector of exact replay observations from
   one WorkspaceBinding lineage.
2. Every observation binds the immutable declaration set and exact applied
   evaluation overlay that shaped its execution.
3. Product F_D projects complete overlay-fulfillment rows. The executive
   observer interprets those rows through a separately admitted F_P judgment.
4. The tuner receives only admitted evaluations, an immutable target set, and
   one exact `TuningObjective`.
5. The default objective first maximizes required overlay fulfillment, then
   minimizes indeterminate predicates, recurring defects, adapter gaps, and
   rail breaks, then improves closure rate, retry density, and cost.
6. Hard conservation of outer contract, obligations, evidence classes,
   authority, replay comparability, and source identity is not tradeable.
7. A proposal contains complete canonical successor bytes, a new exact URI and
   content digest, and explicit `A -> A1` lineage. It is not a patch.
8. GraphFunction, `node_type`, and overlay are the existing public target
   kinds. Graph and policy changes are carried inside complete successor
   GraphFunction or overlay/Program declarations.
9. If an overlay is a tuning target, a distinct immutable applied overlay and
   objective must evaluate it. A proposal cannot grade itself.
10. The existing catalog URI hierarchy records exact versions. Lookup remains
    exact; there is no prefix fallback, mutable latest alias, hierarchy engine,
    or second catalog.
11. Ratification records authority over the A1 draft. Ordinary Product
    publication, verification, catalog admission, and `catalog.apply` where
    required make exact A1 available later. A remains addressable.
12. Only later execution of admitted A1 and executive reevaluation under the
    same objective can establish realized improvement.
13. `run.invoke`, `project.read`, and `tuning.transition` remain the only public
    relations. CLI spellings are elimination-equivalent serializers.

## Mechanical Readiness

- `git diff --check`: pass
- Pandoc parse: `9/9`
- Mermaid render: `3/3`
- runtime/code changes: `0`
- tests changes: `0`
- schema/operation/event/package changes: `0`
- tracked candidate tree: clean after freeze
- seven pre-existing untracked review/strategy posts: preserved and excluded

Runtime suites were not run because the selected work is design-only and
changes no realization surface.

## Review Questions

Review from Product requirements to design atoms, not from prior findings to
patches:

1. Does the design define what tuning is for without hidden fitness,
   thresholds, weights, or implementation defaults?
2. Does the executive evaluate the evolving workspace against one exact
   applied overlay and exact executed declaration basis?
3. Is the observer-to-tuner exchange admitted, typed, and non-controller?
4. Are objective comparison, indeterminate values, hard constraints, and
   proposed-versus-realized improvement total and non-circular?
5. Do `A -> A1` identity, content, lineage, ratification, publication, catalog
   availability, selection, replay, and retirement preserve immutability?
6. Does URI hierarchy remain exact naming rather than a new resolver or mutable
   alias?
7. Are Graph, GraphFunction, reusable `node_type`, overlay, and subordinate
   policy changes projected through the existing catalog kinds without a new
   carrier family?
8. Can the generic CLI trigger the complete construction while remaining only
   a parser/renderer?
9. Do Ontology, atomic functions, whole-family Prime contraction, IACS, module
   mapping, domain/interaction/lifecycle views, axioms, operational lifecycle,
   and module proof describe one satisfiable system?
10. Could implementation still choose materially different Product meaning,
    authority, topology, comparison, identity, lifecycle, or public semantics?

## Review Boundary

- S03 remains accepted at `8865ccff`.
- S05 candidate `1ddc802d` remains frozen and unaccepted by this cut.
- S06 remains held.
- S04 realization remains held until independent design review, direct
  acceptance, S06 closure, and later GOALS selection.
- Findings should be recorded against this exact candidate without editing it.
- Reviewer findings are consolidated once. The worker does not self-review,
  repair during review, or recursively refreeze.
