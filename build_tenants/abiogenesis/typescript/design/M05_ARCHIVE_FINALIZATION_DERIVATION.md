# M05 Archive Finalization Derivation

**Status**: Completed
**Date**: 2026-04-24
**Purpose**: Derive the TypeScript `M05` archive-finalization slice from the
Python run-archive reference line so archive qualification is driven from one
canonical writer/finalizer rather than synthetic fixture materialization.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/test_env/tests/test_run_archive.py`
- `build_tenants/abiogenesis/python/test_env/tests/run_archive.py`
- `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- `.ai-workspace/tickets/completed/T-030-realize-typescript-m05-installed-run-archive-writer-and-postmortem-finalization-proof-under-explicit-archive-finalization-law.md`

## 2. Position

The current TypeScript line already proves archive-shape qualification, but it
does so over synthetic fixture materialization in test support.

The Python line proves a stronger truth:

- one canonical archive writer/finalizer owns postmortem output materialization
- the archive root is durable proof truth, not disposable temp output
- qualification should validate that real output shape

The TypeScript slice therefore needs one explicit archive-finalization boundary
inside `M05`, not a larger runtime or install redesign.

## 3. Preserved Boundary Truth

This slice preserves these Python truths:

- archive output is durable qualification truth
- canonical postmortem files include run metadata, summary, stdout, stderr,
  event logs, manifests, results, and workspace artifacts
- archive proof should consume the writer/finalizer output rather than a
  synthetic shape-only fixture

## 4. Repriced Python Detail

The TypeScript line intentionally reprices these Python implementation details:

- Python dataclass-based helper lifecycle
- implicit directory scanning of workspace roots during finalization
- subprocess-derived git commit probing during finalization
- Python-specific `Path`/`shutil` helper structure

Instead, the TypeScript line uses:

- explicit admitted finalization request carriers
- explicit source-file refs for archive inputs
- the completed ABG common delivery library writer/materialization surface
- one explicit downstream qualification-request builder

## 5. First TypeScript Archive-Finalization Target

This slice should realize only:

- one `RunArchiveFinalizationRequest` carrier
- one `RunArchiveFinalizationOutcome` family
- one canonical archive writer/finalizer under `code/src/qualification/m05/**`
- one downstream builder from finalization output into the existing
  `RunArchiveQualificationRequest`
- one module-derived unit lane
- one real-output archive integration lane
- one fail-closed negative lane

This slice should **not** widen into:

- release automation
- binary artifact archiving
- live-scenario portfolio expansion
- reset/postmortem parity beyond archive output materialization itself

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| `RunArchive.finalize()` writes `run.json`, `summary.json`, `stdout.log`, and `stderr.log` | `RunArchiveFinalizationRequest` and canonical finalizer | TypeScript finalizer owns generated postmortem files as one explicit carrier-bound materialization step |
| Python helper copies events, manifests, results, and workspace artifacts into the archive | explicit source-file refs nested under the finalization request | TypeScript finalizer consumes explicit source-file refs and materializes them through the delivery library |
| `test_run_archive.py` validates the postmortem shape through the real helper | archive integration lane over real finalizer output | TypeScript archive integration now consumes the finalizer output before qualification |
| archive proof remains separate from runtime/install semantics | downstream `RunArchiveQualificationRequest` builder | existing `qualifyRunArchive(...)` stays the archive-proof kernel; finalization feeds it rather than replacing it |

## 7. Required Assets

This derivation is completed by:

- `M05_ARCHIVE_FINALIZATION_FIRST_SLICE_IACS.md`
- `M05_ARCHIVE_FINALIZATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- the archive-finalization code boundary under `qualification/m05`
- the `T-030` proof lanes
