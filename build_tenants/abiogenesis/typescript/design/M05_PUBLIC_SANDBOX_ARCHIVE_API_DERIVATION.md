# M05 Public Sandbox Archive API Derivation

**Status**: Completed
**Date**: 2026-04-27
**Purpose**: Promote the completed TypeScript `M05` sandbox/archive proof
surface to a stable downstream package API without creating a rival archive
framework.

## Source Authority

- `specification/PRODUCT.md` installed substrate contract
- `specification/requirements/product/REQ-P-INSTALL.md`
- `M05_INSTALLED_SANDBOX_DERIVATION.md`
- `M05_ARCHIVE_FINALIZATION_DERIVATION.md`
- `.ai-workspace/tickets/backlog/T-077-export-typescript-m05-sandbox-archive-framework-as-public-downstream-api.md`

## Position

Downstream ODD products need one ABG-owned archive substrate. They should not
copy `M05` test helpers or import private build paths to prove sandbox runs.

The TypeScript tenant already has the correct archive kernel:

- `RunArchiveFinalizationRequest`
- `RunArchiveFinalizationOutcome`
- `RunArchiveQualificationRequest`
- `RunArchiveQualificationOutcome`
- installed reset/postmortem proof carriers

This wave promotes those existing carriers through
`@abiogenesis/typescript-tenant/qualification/m05`.

## Evidence Surface

The public archive API requires these evidence kinds for a qualified run:

- run metadata
- summary
- stdout
- stderr
- events
- manifest
- result
- runtime identity
- command binding
- projection
- postmortem
- workspace artifact

Captured raw responses remain allowed as non-qualification artifacts.

## Boundary Rule

The public API is a substrate API. It does not define downstream scenario
meaning, SDLC domain policy, or product-specific acceptance rules. Downstream
products supply their own source files and domain interpretation; ABG supplies
the archive carrier, finalizer, and qualifier.

## Realization

This derivation is realized by:

- package export `./qualification/m05`
- widened `RunArchiveFileKind`
- public installed-runtime proof lane
  `test_t077_m05_public_sandbox_archive_api_integration.test.mjs`
