# M05 Release Snapshot First Slice IACS

**Status**: Active
**Date**: 2026-05-22
**Derived from**: [M05_RELEASE_SNAPSHOT_DERIVATION.md](./M05_RELEASE_SNAPSHOT_DERIVATION.md), [T-142](../../../../.ai-workspace/tickets/completed/T-142-create-versioned-release-snapshot-bundle-for-package-first-abg.md)

## Purpose

Declare the first release-snapshot carrier inventory so package-first release
artifact materialization has one source of truth.

## Release-Snapshot Boundary

This slice is:

- one release snapshot request
- one release snapshot outcome family
- one package build/pack/copy/checksum effect boundary
- one manifest-centered snapshot bundle

This slice is not:

- release tapping
- npm publication
- installer/bootstrap law
- run archive finalization
- downstream product qualification

## Irreducible Architectural Carrier Set

The release-snapshot slice is allowed exactly these prime carrier families:

1. `ReleaseSnapshotRequest`
2. `ReleaseSnapshotOutcome`

`ReleaseSnapshotCreated`, `ReleaseSnapshotRejected`, `ReleaseSnapshotManifest`,
`ReleaseSnapshotArtifactRef`, and `ReleaseSnapshotGapRef` are members or
subordinate records inside that carrier set. They are not separate prime
families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `ReleaseSnapshotRequest` | `M05-qualification-release-snapshot` | authoritative request for one versioned package snapshot | CLI/script/test admits package source root, source ref, source commit, release identity, release note, and snapshot root | release snapshot builder only | builder |
| `ReleaseSnapshotOutcome` | `M05-qualification-release-snapshot` | authoritative result of one snapshot attempt | derived from request plus build/pack/checksum observations | none beyond builder writes | release operator, docs, downstream artifact storage |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `ReleaseSnapshotManifest` | subordinate | manifest payload for one successful outcome | derived only by builder |
| `ReleaseSnapshotArtifactRef` | subordinate | artifact evidence row | derived only from files written in the snapshot root |
| `ReleaseSnapshotPackageIdentity` | subordinate | package identity detail | read from package manifest and pack result |
| `ReleaseSnapshotCommandResult` | subordinate | build/pack observation detail | captured by builder |
| `ReleaseSnapshotGapRef` | subordinate | rejection detail only | derived only by builder |

## Rules

- A release snapshot is immutable: an existing non-empty snapshot root rejects.
- The package source root must be explicit.
- Dirty source rejects unless the request explicitly marks a non-release use.
- Requested release identity must match package identity.
- The package tarball, release note copy, manifest, and checksum file are one
  artifact set.
- The manifest is the source of truth for the snapshot.
- Dry-run pack output is verification evidence, not the artifact bundle.

## Review Questions

1. Does the snapshot manifest own all artifact identity?
2. Can a same-version dirty checkout be packaged silently?
3. Can a tenant-root tarball bypass the manifest?
4. Can a second run overwrite the same versioned snapshot root?
5. Does the command package an explicit source root/ref rather than ambient cwd?
