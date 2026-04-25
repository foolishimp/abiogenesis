# M04 Public Gaps Projection First Slice IACS

**Status**: Completed
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
  - optional run/work/frame identifiers

## Authorities

- `M02` publication lookup authority owns graph-function/job bindings.
- `M03` execution basis owns graph materialization, replay projection, and
  advancement-transition derivation.
- `M04` owns public request admission and public observation projection.
- CLI binary binding owns executable prefix and JSON serialization only.

## Computations

1. Admit the public gaps request.
2. Enumerate one semantic job per graph-function target.
3. Construct an execution basis for each scoped graph-function.
4. Filter replay events by basis identity, with assessed events matched by
   run/work and edge.
5. Derive the `M03` runtime aggregate projection.
6. Derive the next advancement transition without emitting events.
7. Project public gaps fields and next lawful action.

## Surfaces

- `PublicGapsRequest`
- `PublicGapsContext`
- `PublicGapsEntry`
- `PublicGapsProjection`
- CLI JSON fields:
  - `jobs_considered`
  - `total_delta`
  - `open_frames`
  - `converged`
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
