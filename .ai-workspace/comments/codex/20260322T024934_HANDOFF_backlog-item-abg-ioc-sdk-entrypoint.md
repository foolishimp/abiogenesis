# HANDOFF: Backlog Item Draft For ABG IoC SDK Entrypoint

**Author**: Codex
**Date**: 2026-03-22T02:49:34+11:00
**Addresses**: backlog capture for abiogenesis inversion-of-control / SDK direction
**For**: claude

## Summary
This is a backlog-ready draft for a highly desirable post-beta architecture direction: evolve `abiogenesis` away from framework-style installer/config ownership toward an inversion-of-control SDK entrypoint.

This is not a `1.0-beta` blocker. It is structural debt reduction that would simplify installer boundaries, eliminate broken bootstrap assumptions, and make the `abg` kernel/domain split much cleaner.

## Backlog Draft

```yaml
id: BL-001
title: Introduce inversion-of-control SDK entrypoint for abiogenesis
status: idea
created: 2026-03-22
updated: 2026-03-22
notes: |
  Problem this solves:
  abiogenesis currently behaves as a framework: the installer writes runtime
  binding config, the engine expects .genesis/genesis.yml, and bootstrap flows
  depend on implicit filesystem territory and import-path conventions. This
  creates boundary confusion between the ABG kernel and domain/methodology
  layers such as genesis_sdlc.

  Why this matters:
  The desired territory model is:
  - .genesis/ = immutable ABG kernel + GTL
  - domain layer owns its own release territory
  - mutable evidence/state lives outside the kernel

  In the current model, installer and runtime assumptions leak domain concerns
  into ABG. The result is fragile bootstrap behavior, cross-territory config
  mutation, and states where ABG binds to package modules it does not itself
  install.

  Desired direction:
  Evolve abiogenesis toward an SDK / inversion-of-control model where the
  caller supplies package, worker, and workspace binding explicitly rather than
  ABG owning those decisions through installer-generated config.

  Conceptual target shape:
    from genesis.core import workspace_bootstrap
    from genesis.commands import Scope, gen_gaps
    from some_domain.package import package, worker

    stream = workspace_bootstrap(workspace)
    scope = Scope(package=package, worker=worker, workspace_root=workspace)
    result = gen_gaps(scope, stream)

  Architectural benefits:
  - removes ABG responsibility for domain wrapper/bootstrap surfaces
  - dissolves the broken state where ABG writes config for modules it does not install
  - reduces cross-territory mutation between ABG and domain installers
  - makes installer bootstrap cleaner: kernel installs kernel, domain installs domain
  - reduces ambient import-path dependence during installer and runtime startup
  - better matches the intended .genesis = kernel-only architecture

  What is uncertain:
  - whether genesis.yml should become optional compatibility-only metadata or be
    removed entirely in a later version
  - what the stable public library entrypoint should be
  - how workflow_version / provenance binding should be supplied explicitly in
    an IoC model
  - whether command CLI remains a thin compatibility layer over the SDK or
    stays as a first-class public surface
  - migration strategy for existing projects expecting framework-style install

  What would need to be true before promotion:
  - ABG 1.0 beta bootstrap stabilization is complete
  - current territory split work (.genesis vs domain release territory) has
    settled enough to avoid redesign churn
  - a clear compatibility story exists for current CLI / genesis.yml users
  - one concrete dependent package (likely genesis_sdlc) is ready to consume
    the SDK entrypoint as the caller/bootstrap owner

  Related work:
  - ABG installer kernel-only cleanup
  - gsdlc territory split into .genesis, .gsdlc/release, .gsdlc/workspace
  - installer/bootstrap provenance cleanup
  - discussion of framework-style runtime binding vs SDK-style caller ownership
```

## Recommended Action
1. Treat this as a high-value post-beta backlog item, not a `1.0-beta` release blocker.
2. Keep the current framework-style engine working for now; do not mix this redesign into the active bootstrap repair.
3. Promote this only after the current territory and installer cleanup is stable enough to serve as the baseline for an API redesign.
