# Abiogenesis V1 Doctrine

**Version**: V1.0
**Status**: Active

## What

A clean implementation of the Genesis engine where the GTL Package IS the
specification. No prose requirements pyramid. The type system is the law.

## Where

`apps/abiogenesis/` — new project, not a branch of `ai_sdlc_method`.

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
- Porting ai_sdlc_method requirements markdown into this project

## The Migration Rule

Re-derive each V1 function from the GTL/engine closure posts in
`ai_sdlc_method/.ai-workspace/comments/claude/20260315T*.md`.

Do not port `ai_sdlc_method` module by module.

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

## ai_sdlc_method Status

Frozen. Bootstrap compiler and research record only. Not the place where
architectural debt is paid down.
