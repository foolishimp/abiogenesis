# SCHEMA: Tech-Neutral Scope And Worker Resolution

**Author**: Codex
**Date**: 2026-03-21T02:14:39+11:00
**Addresses**: `specification/domain_model.md` Scope/Worker definitions, tenant leakage into constitutional surfaces, multi-F_P orchestration purpose of the engine
**For**: all

## Summary
The specification should remain technology-neutral and speak only in terms of `F_D`, `F_P`, `F_H`, graph semantics, convergence, and governance. Concrete tenant/runtime choices belong in `builds/`. That means the current `Scope.build = "claude_code"` default is in the wrong layer, while `Worker` remains a first-class constitutional object whose concrete resolution mechanism is build-specific.

I propose a single boundary rule: the spec defines abstract execution objects and unambiguous command scope; builds define how those objects are imported, selected, and bound to concrete agent technologies. This preserves multi-`F_P` orchestration as a constitutional engine purpose without smuggling tenant identity into the spec.

## Problem
Two different kinds of concern are currently mixed together.

First, the specification leaks a tenant-specific runtime identity:
- `Scope.build` defaults to `"claude_code"` in `specification/domain_model.md`

Second, the Claude build adds convenience resolution behavior on a constitutional object:
- `Worker` is correctly modeled as a first-class type
- but the Claude build allows `Scope.worker is None` and falls back to a self-hosting import path

These are not equivalent issues.

- `Worker` is a real domain object and belongs in the spec.
- `claude_code` is a build/tenant label and does not.
- import-path fallback and config lookup are build conveniences, not constitutional semantics.

## Proposed Contract

### 1. The specification is technology-neutral

The constitutional surface may talk about:
- `F_D`, `F_P`, `F_H`
- `Operator`, `Worker`, `Job`, `Package`, `Scope`
- convergence, lineage, governance, and projection

It must not name concrete implementation tenants or vendor-specific runtimes as defaults.

Examples of things that belong in `builds/`, not `specification/`:
- `claude_code`
- `codex`
- specific CLI import paths
- local package/module fallback conventions
- concrete agent product bindings

### 2. `Worker` remains a first-class constitutional object

`Worker` is part of the domain model and should remain there.

Why:
- it defines executable capability over jobs
- it carries write/read territory implications
- it is central to conflict analysis and orchestration
- it is part of how the engine supports multiple `F_P` actors

So the spec should continue to define `Worker` abstractly as an execution actor over a set of jobs.

### 3. `Scope` must be unambiguous, but worker resolution is not constitutional

The specification should require that command execution occurs against an unambiguous scope.

That means the runtime must end up with:
- a `Package`
- a `Worker`
- a workspace
- optional feature/edge refinements

But the mechanism that obtains the `Worker` object is build-specific.

Possible build-specific mechanisms:
- direct caller injection
- config-file lookup
- module import from a build-local package path
- registry lookup
- other resolver schemes

The spec should not privilege any one of these.

### 4. `build` is not a constitutional field in the current sense

The current `build` field is carrying tenant identity, not graph semantics.

There are two acceptable ways to handle this:

- remove `build` from the constitutional `Scope` type entirely and treat it as runtime provenance metadata
- or retain a neutral provenance field with no tenant-specific default and explicitly mark it as implementation-provided

What should not remain is a constitutional default of `"claude_code"`.

### 5. Multi-`F_P` orchestration is constitutional

One of the engine's core purposes is to orchestrate multiple substitutable `F_P` agents.

That means the specification should be able to express:
- multiple `F_P` operators
- multiple workers
- distinct execution capabilities or territories
- conflict and routing semantics

without tying any of those to one vendor or tenant.

The spec should say "agent" or `F_P` actor.
The builds should say which technology realizes that actor.

## Proposed Spec Direction

### domain_model.md

Revise `Scope` so it becomes tenant-neutral.

Recommended direction:
- keep `package`
- keep `workspace_root`
- keep `feature`
- keep `edge`
- keep `worker` as the selected first-class execution actor
- keep `workflow_version`
- remove tenant-specific defaulting for `build`

If provenance identity is needed, describe it as runtime/build metadata, not as a constitutional default.

### requirements / convergence model

Add a simple boundary statement:
- commands require an unambiguous worker scope
- the worker object is part of the command scope
- worker resolution/import/config lookup is implementation territory

This makes the contract portable across tenants while preserving the object model.

### builds/*

Each build may define:
- how `Worker` is resolved
- whether config fallback is allowed
- which agent technologies implement `F_P`
- how provenance labels are emitted

Those are legitimate build decisions.

## Why This Is The Right Separation

It preserves the important abstraction without flattening the engine into generic prose.

`Worker` is not an incidental Python convenience. It is part of the engine's abstract execution model. It belongs in the specification because it expresses capability, territory, and orchestration structure.

But tenant identity and object-resolution mechanisms are not abstract engine law. They are build-layer choices. If they remain in the constitutional surface, the spec stops being portable and stops serving as a neutral basis for multiple `F_P` implementations.

That would undermine one of the engine's main reasons to exist in the first place.

## Recommended Action
1. Ratify that the specification is agent-neutral and technology-neutral, referring only to `F_P` actors rather than specific products or tenants.
2. Keep `Worker` as a first-class constitutional object.
3. Move `Worker` resolution/import/config fallback rules out of the specification and into `builds/*`.
4. Remove or neutralize the tenant-specific `Scope.build = "claude_code"` default.
5. State explicitly that multi-`F_P` orchestration is a constitutional engine purpose, while concrete agent bindings remain build decisions.

