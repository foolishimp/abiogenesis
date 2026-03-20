# Abiogenesis V1 Doctrine

**Version**: V1.0
**Status**: Active

## What

A clean implementation of the Genesis engine where the GTL Package IS the
specification. No prose requirements pyramid. The type system is the law.

## Where

`apps/abiogenesis/` — standalone project. Installs via `genesis_sdlc`.

## Success Condition

`abiogenesis` can run `/gen-start` on its own workspace and create real assets —
code under `builds/claude_code/code/`, tests under `builds/claude_code/tests/`,
sandbox-local tests passing — with the event log recording the work truthfully.

Asset creation is the primary bar. Self-hosting is Phase 5.

## The Single Tenant Rule

One Worker: `claude_code`. `Worker.conflicts_with()` trivially false.
Multi-tenant scheduling deferred to V2.

## The Six Functions

V1 implements exactly these and nothing else:

```
iterate(job, asset)          → (Asset, WorkingSurface)
project(stream, type, id)    → Asset
emit(event_type, data)       → void
bind_fd(job, stream)         → PrecomputedManifest
delta(asset, evaluators)     → float
schedule(workers)            → list[list[Worker]]
```

## The Three Commands

```
/gen-start    state_derive → select_job → bind → iterate
/gen-iterate  bind one job → iterate
/gen-gaps     bind_fd across scope → return delta_summary
```

## V1 Non-Goals

If any of these appear because "the old system had them," the reset is failing:

- Multi-tenant scheduling
- Tournament arbitration
- Consensus engine
- Release workflow
- Observer / sensory stack
- Spawn / fold-back
- Telemetry / monitor UI
- Commands beyond the three above
- Porting requirements from other projects into this project

## The Build Order

```
Phase 0  Scaffold + ratify cut          ← current
Phase 1  Constitutional surface         spec/packages/genesis_core.py is loadable
Phase 2  Substrate                      emit, project, event stream, context resolver
Phase 3  Linker                         bind_fd → bind_fp → PrecomputedManifest
Phase 4  Asset-producing loop           iterate, delta, schedule, three commands
Phase 5  Self-hosting                   abiogenesis runs its own code↔tests edge
Phase 6+ Higher-order functions         V2 and beyond — only after Phase 5
```

## V1 Bounded Limitations

These are explicit V1 deferrals, not design gaps:

**Package-snapshot/context-snapshot governance**: The GTL model defines
`PackageSnapshot`, `package_snapshot_id`, and `context_snapshot_id` for lawful
replay under a specific package version. V1 does not implement this. Events record
`event_time`, `event_type`, `data` only. `project()` is deterministic within a
session; cross-version replay fidelity is a V2 concern.

**GTL is vendored, not published**: `builds/claude_code/code/gtl/` is copied from `genesis_sdlc`.
Upgrades are deliberate copy-and-commit, not automatic. GTL will be
published to PyPI in V2.
