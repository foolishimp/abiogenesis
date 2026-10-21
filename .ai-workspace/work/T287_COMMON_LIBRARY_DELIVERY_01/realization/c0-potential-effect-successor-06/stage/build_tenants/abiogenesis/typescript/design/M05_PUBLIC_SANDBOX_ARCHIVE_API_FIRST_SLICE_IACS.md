# M05 Public Sandbox Archive API First Slice IACS

**Status**: Completed
**Date**: 2026-04-27
**Derived from**: [M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md](./M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md)

## Purpose

Declare the public `M05` sandbox/archive API slice so downstream products can
consume ABG archive proof without private imports or duplicated framework code.

## First Slice Boundary

This slice is:

- one package export subpath: `@abiogenesis/typescript-tenant/qualification/m05`
- one existing archive finalization family
- one existing archive qualification family
- one existing installed reset/postmortem proof family
- one public installed-runtime proof lane

This slice is not:

- a downstream scenario catalog
- a product-specific SDLC archive policy
- a new runtime executor
- a second delivery writer

## Authority And Role Matrix

| Carrier or surface | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `./qualification/m05` package export | `M05-qualification-scenarios` | public substrate entry | package exports map | none | downstream sandbox/test lanes |
| `RunArchiveFinalizationRequest` | `M05-qualification-scenarios` | archive-materialization request | downstream admits explicit source refs | finalizer writes archive | downstream archive finalizers |
| `RunArchiveFinalizationOutcome` | `M05-qualification-scenarios` | finalization result | finalizer only | none beyond archive write | downstream archive qualification |
| `RunArchiveQualificationRequest` | `M05-qualification-scenarios` | archive-proof request | downstream or builder admits file refs | none | downstream proof lanes |
| `RunArchiveQualificationOutcome` | `M05-qualification-scenarios` | archive-proof outcome | qualifier only | none | downstream closure evidence |
| `InstalledResetPostmortemRequest` | `M05-qualification-scenarios` | reset/postmortem proof request | downstream admits reset observations | none | downstream postmortem lanes |
| `InstalledResetPostmortemOutcome` | `M05-qualification-scenarios` | reset/postmortem proof outcome | qualifier only | none | downstream postmortem lanes |

## Qualification Evidence Kinds

`RunArchiveFileKind` is the only public evidence-kind union for qualified run
archives. It includes:

- `run_meta`
- `summary`
- `stdout`
- `stderr`
- `events`
- `manifest`
- `result`
- `runtime_identity`
- `command_binding`
- `projection`
- `postmortem`
- `workspace_artifact`

`captured_artifact` remains a finalization-only kind. It may be materialized
but does not satisfy archive qualification.

## Rules

- Downstream code must import `M05` archive proof through the package export.
- Private build paths under `build/semantic/code/src/qualification/m05` are test
  implementation detail, not downstream API.
- The public API must not infer domain meaning from filenames.
- Archive qualification must fail closed when any required evidence kind is
  absent.
