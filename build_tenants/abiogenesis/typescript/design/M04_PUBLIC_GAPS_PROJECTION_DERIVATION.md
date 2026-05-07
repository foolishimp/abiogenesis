# M04 Public Gaps Projection Derivation

**Status**: Completed, amended by T-127 on 2026-05-08
**Date**: 2026-04-25
**Purpose**: Derive the TypeScript `gen-gaps` observation boundary that closes
the remaining CLI behavior gap after the TypeScript binary binding landed.

## 1. Source Material

This boundary derives from:

- `specification/requirements/product/REQ-P-POLICY.md`
- `build_tenants/abiogenesis/python/code/genesis/services.py`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_START_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_CONTROL_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-044-realize-typescript-m03-replay-derived-graph-function-iteration-and-aggregate-projection.md`
- `.ai-workspace/tickets/completed/T-046-wire-typescript-public-execution-to-replay-derived-m03-iteration.md`
- `.ai-workspace/tickets/completed/T-057-realize-typescript-cli-binary-binding-over-shared-product-command-grammar.md`
- `.ai-workspace/tickets/backlog/T-058-realize-typescript-gen-gaps-projection-over-replay-derived-runtime-truth.md`
- `.ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md`
- `build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`

## 2. Position

`gen-gaps` is a read-only observation surface.

It must not:

- start traversal
- emit runtime events
- append replay facts
- delegate to Python
- rebuild controller-local state

It projects current work from TypeScript substrate truth:

- admitted module publication
- semantic job bindings
- admitted runtime identity and resolved policy
- replayed `M03` runtime events
- replay-derived aggregate projection
- replay-derived next-vector and transition status
- `T-127` construction evaluator carriers:
  `ConstructionObservationSnapshot`,
  `ConstructionActionCatalogProjection`,
  `ObservationToActionBindingProjection`, and
  `ConstructionPriorityProjection`

## 3. Boundary Law

The TypeScript gaps projection belongs in `M04` because it is a public
operator-facing read model over runtime truth.

It consumes `M03`; it does not redefine `M03`.

The read-only evaluator preview must render the same `T-127` construction
evaluator ranking surface used for construction action selection. M04 may adapt
runtime aggregate truth into construction observation pressure rows, but M04
must not carry a separate local ranking law, fabricate public-gaps action
authority, or select a graph action outside the construction action catalog.

The carrier chain is:

```text
replay-derived runtime aggregate truth
  -> ConstructionObservationSnapshot
  -> ConstructionActionCatalogProjection
  -> ObservationToActionBindingProjection
  -> ConstructionPriorityProjection
  -> PublicGapsProjection read-only fields
```

Configured priority policy and `abg.fp_consciousness` hook resolution remain
visible inputs. Public gaps resolves hook precedence through the same declared
GTL order as construction selection:

```text
GraphVector.declarations
  > GraphFunction.declarations
  > Job.policyHooks
  > Role.policyHooks
  > Module.policyHooks
  > visible installed fallback/config, or visible source-default fallback when
    public gaps is called directly without an installed fallback bundle
```

Ineligible or inadmissible construction bindings must not be exposed as the
top public best action. The read model may show their typed blockers and
ranking pressure, but selected best action refs must remain eligible action
refs.

The projection reports:

- jobs considered
- total delta
- open frames
- convergence
- current edge, vector index, and vector counts per job
- replay-derived closed/planned/evaluated vector indexes
- replay events scoped by admitted `basisId`; legacy assessed events without
  basis identity do not bind by run/work/edge fallback
- expected evaluator obligations still missing for the next open vector
- typed asset gap rows with missing truth, candidate action refs, blockers, and
  construction priority rank
- read-only evaluator recommendation for the highest-ranked eligible asset and
  graph function, or blocked context when no eligible action remains

The recommendation is preview truth. It is derived from the same evaluator
ranking surface used by construction action selection, but it does not admit
intent, dispatch graph work, or publish a rival action authority outside the
construction episode.

Projection identity must be policy-distinct. If the same observation is ranked
under different priority schemes or visible hook configs, the public evaluator
ref or source refs must carry a distinct priority projection identity.

## 4. Explicit Non-Ownership

This boundary does not reintroduce `proof_hold` as TypeScript `M04` substrate
taxonomy.

`T-034` closed that diagnosis as a downstream-abbreviation ownership error.
Downstream products may still project product-specific hold labels from
canonical truth, but this TypeScript gaps surface owns only canonical replay
and transition projection.

Future runtime-failure or hold facts can extend the carrier when they are
ratified as substrate facts. This slice does not invent those facts to match a
presentation label.

## 5. Public Command Consequence

The TypeScript package binary now supports:

```bash
genesis-ts gaps --workspace . --scope workspace
abiogenesis-ts gaps --workspace . --scope workspace
```

The executable prefix may differ by tenant. The command suffix remains shared
product grammar.

`gaps` exits successfully when it returns a valid observation, even when the
observation contains open work. Admission or projection defects still fail
closed as command errors.

## 6. Closure Proof Shape

The proof must show installed-package behavior, not only source imports:

- no-event replay produces open/blocked work truth without creating events
- partially closed replay advances the reported next edge and delta
- fully closed replay converges
- no semantic jobs fail closed
- ambiguous semantic job ownership fails closed
- configured construction priority changes ranking through the installed CLI
  gaps path, not only through direct API injection
- GTL hook precedence can change the read-only ranking without creating a
  second M04 ranking surface
- ineligible highest-priority actions are not exposed as selected best actions
- priority projection identity changes, or carries distinct source refs, when
  priority policy changes
