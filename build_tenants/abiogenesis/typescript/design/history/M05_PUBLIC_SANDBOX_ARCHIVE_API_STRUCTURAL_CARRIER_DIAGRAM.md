# M05 Public Sandbox Archive API Structural Carrier Diagram

**Status**: Completed
**Date**: 2026-04-27
**Derived from**: [M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md](./M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md), [M05_PUBLIC_SANDBOX_ARCHIVE_API_FIRST_SLICE_IACS.md](./M05_PUBLIC_SANDBOX_ARCHIVE_API_FIRST_SLICE_IACS.md)

```mermaid
classDiagram
class PublicM05PackageExport {
  <<public substrate surface>>
  +@abiogenesis/typescript-tenant/qualification/m05
}

class RunArchiveFinalizationRequest {
  <<prime existing>>
}

class RunArchiveFinalizationOutcome {
  <<prime existing>>
}

class RunArchiveQualificationRequest {
  <<prime existing>>
}

class RunArchiveQualificationOutcome {
  <<prime existing>>
}

class RunArchiveFileKind {
  <<subordinate public union>>
  +runtime_identity
  +command_binding
  +projection
  +postmortem
}

class InstalledResetPostmortemRequest {
  <<prime existing>>
}

class InstalledResetPostmortemOutcome {
  <<prime existing>>
}

PublicM05PackageExport --> RunArchiveFinalizationRequest : exports
PublicM05PackageExport --> RunArchiveFinalizationOutcome : exports
PublicM05PackageExport --> RunArchiveQualificationRequest : exports
PublicM05PackageExport --> RunArchiveQualificationOutcome : exports
PublicM05PackageExport --> InstalledResetPostmortemRequest : exports
PublicM05PackageExport --> InstalledResetPostmortemOutcome : exports
RunArchiveQualificationRequest *-- RunArchiveFileKind
```

## Reading Rules

- The package export is a public surface over existing `M05` prime carriers.
- `RunArchiveFileKind` is subordinate evidence vocabulary, not a new prime
  archive family.
- Downstream products own scenario semantics and acceptance interpretation.
  ABG owns the archive carrier, finalizer, qualifier, and proof shape.
