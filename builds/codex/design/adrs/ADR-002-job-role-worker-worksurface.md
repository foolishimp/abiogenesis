# ADR-002: Job / Role / Worker Split with Immutable WorkSurface

## Status

Accepted

## Context

The codex build still conflates:

- `Job` as GTL semantic work contract
- `Job` as runtime executable hop
- `Worker` as both semantic capability class and concrete actor identity
- `WorkingSurface` as mutable execution scratch state

This makes the model unstable. Each time a new phase distinction appears, the
runtime is pressured to add another wrapper type instead of collapsing back to
the minimum irreducible set.

The semantic correction already established the intended split:

- GTL owns `Job` and `Role`
- ABG owns concrete execution and worker realization
- execution truth should accumulate onto one immutable surface rather than a zoo
  of phase-specific wrapper objects

## Decision

1. `gtl.work_model` is introduced as the semantic work surface for the codex
   build. It owns:
   - `ContractRef`
   - `Role`
   - `Job`
2. In this codex build, `ContractRef.kind == "edge"` is the supported
   executable target. The semantic job points at one or more `Edge.id` values.
3. The current executable runtime wrapper is renamed to `ExecutableJob`.
   It is ABG-owned and resolves one GTL `Job` against one executable `Edge`
   plus its evaluator set.
4. `Worker` remains an ABG runtime identity. `can_execute` stays as the
   executable capability surface. `role_ids` and `authority_ref` are additive,
   not replacements.
5. The returned execution dossier is standardized as immutable `WorkSurface`.
   Lifecycle phase distinctions live on `WorkSurface.stage` and on event flow,
   not in proliferating wrapper type names.
6. If two runtime structures differ only by lifecycle phase, they should be
   collapsed into one type plus state unless they introduce distinct semantics.
7. The codex build keeps one explicit pre-dispatch carrier,
   `PreparedExecution`, because it is not just a lifecycle label. It carries
   a resolved prompt package for F_P / F_H realization. It does not replace
   `WorkSurface`, and it is not the durable audit/context surface.
8. `Package` may declare GTL `jobs` and `roles` directly. Runtime workers still
   execute resolved `ExecutableJob`s.

## Consequences

Positive:

- GTL and ABG stop sharing the same `Job` term for different meanings.
- `Role` becomes an explicit semantic concept.
- `WorkSurface` becomes the single returned execution dossier and context
  carrier.
- The codex build can express the V2 correction without rewriting the entire
  engine at once.

Negative:

- Existing codex imports must be updated from `gtl.core.Job` to
  `genesis.runtime_model.ExecutableJob` where they mean runtime work.
- Bootloader and package surfaces must be restated so they no longer imply that
  `Worker` is part of GTL.
- The codex build remains edge-based rather than graph-vector-based; this is a
  build constraint, not constitutional law.

## Non-Decisions

This ADR does not yet add:

- orchestration declarations such as schedules, windows, KPIs, or triggers
- run reducers or a full ABG run module in the codex build
- graph-level or graph-function-level semantic job realization
- internal authentication or authority resolution logic
