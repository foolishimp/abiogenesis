# M04 Public Gaps Projection First Slice IACS

**Status**: Completed, amended by T-127 on 2026-05-08
**Date**: 2026-04-25
**Scope**: TypeScript `M04` public `gen-gaps` observation projection.

## Inputs

- public gaps request:
  - `scope.kind = workspace`
  - `scope.workspaceRoot`
  - `scope.moduleName`
- public gaps context:
  - admitted GTL module
  - runtime identity
  - resolved policy
  - replayed runtime events
  - visible installed fallback/config bundle when present, or visible
    source-default fallback for direct source API use without an installed bundle
  - optional configured `ConstructionPriorityScheme`
  - optional `AffectPriorityPolicy` rows
  - optional run/work/frame identifiers

## Authorities

- `M02` publication lookup authority owns graph-function/job bindings.
- `M03` execution basis owns graph materialization, replay projection, and
  advancement-transition derivation.
- `M03` `T-127` construction evaluator carriers own observation-to-action
  binding and priority ranking truth.
- GTL hook surfaces own declared `abg.fp_consciousness` override precedence:
  GraphVector, GraphFunction, Job, Role, Module, then visible installed
  fallback/config.
- `M04` owns public request admission and public observation projection.
- CLI binary binding owns executable prefix and JSON serialization only.

## Computations

1. Admit the public gaps request.
2. Enumerate one semantic job per graph-function target.
3. Construct an execution basis for each scoped graph-function.
4. Filter replay events by admitted basis identity only. Runtime events without
   `basisId` do not bind to public gaps by run/work/edge fallback.
5. Derive the `M03` runtime aggregate projection.
6. Derive the next advancement transition without emitting events.
7. Adapt open typed asset pressure into `ConstructionObservationSnapshot` using
   M03 construction observation asset refs derived from passed input bindings,
   declared graph input roots, fallback graph-linked root sources, and
   replay-closed target assets.
8. Project `ConstructionActionCatalogProjection` from lawful graph function,
   graph vector, semantic job, hook, and visible fallback truth. Installed
   fallback/config wins when present; direct source API use without a bundle uses
   a visible source-default fallback.
9. Derive `ObservationToActionBindingProjection`.
10. Derive `ConstructionPriorityProjection` from admitted configured priority
    policy or the M03 `abg.fp_consciousness` hook-config-to-priority surface.
11. Project public gaps fields and read-only evaluator recommendation from that
    same priority projection.

## Surfaces

- `PublicGapsRequest`
- `PublicGapsContext`
- `PublicGapsEntry`
- `PublicGapsProjection`
- `PublicTypedAssetGapProjectionRow`
- read-only evaluator recommendation fields for highest-ranked eligible asset
  and graph function
- admission blocker refs for typed asset rows whose highest-ranked action is
  ineligible or lacks binding authority
- CLI JSON fields:
  - `jobs_considered`
  - `total_delta`
  - `open_frames`
  - `converged`
  - `read_only_evaluator`
  - `gaps[]`

## Deferred

- `work_key:<id>` scoping
- product-specific proof-hold presentation labels
- direct runtime-failure gap facts before substrate failure events are ratified
- Python bind-FD evaluator replication

## Closure Rules

- Projection must be read-only.
- Ambiguous semantic job ownership must fail closed.
- Missing semantic work in scope must fail closed.
- The installed package binary must prove real behavior.
- Installed CLI gaps must consume declared construction priority policy.
- Public gaps must consume GTL hook precedence rather than a Module-only or
  adapter-local fallback.
- Ineligible highest-priority actions must not be exposed as public best
  actions.
- Projection identity or source refs must distinguish different priority
  schemes over the same observation.
