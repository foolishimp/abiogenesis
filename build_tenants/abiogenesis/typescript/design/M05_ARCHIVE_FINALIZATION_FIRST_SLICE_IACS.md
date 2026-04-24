# M05 Archive Finalization First Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_ARCHIVE_FINALIZATION_DERIVATION.md](./M05_ARCHIVE_FINALIZATION_DERIVATION.md), [M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md](./M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md), [ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md), [T-030](../../.ai-workspace/tickets/completed/T-030-realize-typescript-m05-installed-run-archive-writer-and-postmortem-finalization-proof-under-explicit-archive-finalization-law.md)

## Purpose

Declare the `M05` archive-finalization slice as an explicit carrier inventory so
archive output materialization remains owned by one bounded writer/finalizer
before archive qualification evaluates that output.

## Archive-Finalization First Slice Boundary

This slice is:

- one `RunArchiveFinalizationRequest` carrier
- one `RunArchiveFinalizationOutcome` family
- one bounded finalizer that consumes the completed delivery library writer
- one downstream builder into the existing `RunArchiveQualificationRequest`

This slice does **not** include:

- release packaging or publication
- binary artifact storage
- archive replay or live-status projection
- reset/postmortem semantic correction law

## Irreducible Architectural Carrier Set

The archive-finalization slice is allowed exactly these prime carrier families:

1. `RunArchiveFinalizationRequest`
2. `RunArchiveFinalizationOutcome`

Explicit `finalized` or `rejected` variants are members of the outcome family,
not separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `RunArchiveFinalizationRequest` | `M05-qualification-scenarios` | authoritative archive-materialization request | test/support harness admits explicit archive metadata, summaries, logs, and source-file refs | finalizer only | archive finalizer |
| `RunArchiveFinalizationOutcome` | `M05-qualification-scenarios` | authoritative archive-materialization outcome family | derived from admitted finalization request only | none beyond the finalizer's materialization write | archive integration lane, downstream qualification-request builder |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `RunArchiveMetadataRef` | subordinate | generated run metadata nested under one finalization request | admitted once into `RunArchiveFinalizationRequest` |
| `RunArchiveSummaryRef` | subordinate | generated summary detail nested under one finalization request | admitted once into `RunArchiveFinalizationRequest` |
| `RunArchiveNoteRef` | subordinate | audit note detail only | admitted once into archive metadata |
| `RunArchiveFinalizationSourceFileRef` | subordinate | source artifact detail nested under one request | admitted once into `RunArchiveFinalizationRequest` |
| `RunArchiveMaterializedFileRef` | subordinate | realized file detail nested under one outcome | derived only from archive finalization |
| `RunArchiveFinalizationGapRef` | subordinate | rejection detail only | derived only from archive finalization failure |
| `RunArchiveFinalized` | prime family variant | explicit finalization outcome variant | pattern-matched as part of `RunArchiveFinalizationOutcome` |
| `RunArchiveFinalizationRejected` | prime family variant | explicit finalization outcome variant | pattern-matched as part of `RunArchiveFinalizationOutcome` |
| `RunArchiveQualificationRequest` | already completed | later archive-proof family, not finalization ownership | built downstream from successful finalization |

## First Slice Rules

- `RunArchiveFinalizationRequest` is the only lawful first-slice carrier for
  archive postmortem materialization in the TypeScript line.
- archive finalization must consume explicit source-file refs rather than
  implicitly scanning arbitrary workspace trees.
- archive finalization must consume the completed delivery library writer and
  materialization helpers instead of inventing a rival write substrate.
- archive finalization must fail closed when required source files are missing
  or materialization verification fails.
- archive qualification remains downstream of finalization and must continue to
  evaluate one admitted `RunArchiveQualificationRequest` family.

## Promotion Rule

No subordinate payload may be promoted during this slice unless:

1. it acquires independent persisted or public authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-030` before code lands.
