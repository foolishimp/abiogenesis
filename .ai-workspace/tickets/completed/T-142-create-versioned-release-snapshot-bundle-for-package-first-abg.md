# T-142 Create Versioned Release Snapshot Bundle For Package-First ABG

- id: T-142
- title: Create versioned release snapshot bundle for package-first ABG
- type: feature
- ticket_category: implementation_migration
- status: completed
- review_status: passed
- build_tenant: typescript
- goal: package-stable-abg-release-cuts-as-versioned-snapshot-bundles
- change_intent: Replace ad hoc tenant-root `.tgz` files and dry-run-only pack evidence with one governed versioned release snapshot bundle that binds package artifact, manifest, checksum, source identity, release note, and verification evidence.
- change_class: requirement_reprice
- re_entry_point: requirements
- triaged_at: 2026-05-22
- created_at: 2026-05-22
- updated_at: 2026-05-22
- completed_at: 2026-05-22
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- dependencies:
  - T-076
  - T-141
- affected_boundary: `specification/requirements/product/REQ-P-QUAL.md`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, `build_tenants/abiogenesis/typescript/code/src/cli/**`, TypeScript package scripts, release snapshot output roots
- target_truth: Each ABG RC or tapped release snapshot is one immutable directory whose manifest is the source of truth for package identity, source ref, source commit, release note, tarball, checksum, pack/build commands, and verification facts.
- superseded_truth: A release note plus tag plus `npm pack --dry-run` output, or stray tenant-root tarballs, are sufficient release snapshot truth.
- closure_law: Closes only when the TypeScript tenant can create a non-overwriting versioned release snapshot bundle from an explicit source root/ref, rejects dirty or mismatched package identity, writes manifest/checksum/release-note evidence, exposes the operation through a package-local command, and proves positive and negative behavior through focused tests.
- requirement_authority:
  - REQ-P-QUAL-050
  - REQ-P-QUAL-051
  - REQ-P-QUAL-052
  - REQ-P-QUAL-053
  - REQ-P-QUAL-054
  - REQ-P-QUAL-055

## Problem

ABG is now package-first and stable enough for downstream consumption, but the
release snapshot surface is not yet governed as a first-class artifact set.

Current release notes correctly name the RC branch, tag, package version, and
`npm pack --dry-run` result. That proves packability, but it does not preserve
one immutable local artifact set that downstream operators can inspect or
archive without rerunning pack against a mutable source checkout.

Older tenant-root `.tgz` files demonstrate the need, but they are not a lawful
source of truth:

- they sit beside source rather than under a versioned release-snapshot root
- they are not tied to one manifest
- checksum, source ref, release note, build command, and pack command evidence
  are not carried as one carrier
- a later source checkout could silently produce a same-version but different
  tarball

## Scope

Realize the first package-first release snapshot surface for the TypeScript
tenant:

- add product qualification requirements for release snapshots
- add M05 release-snapshot design/IACS surfaces
- add one release snapshot carrier family and builder
- add a CLI/package script entrypoint for creating a snapshot
- add focused tests for successful bundle creation and fail-closed conditions
- create a local snapshot for the current published `v3.8.0-rc.2` source cut

## Non-Goals

- Do not tap final `3.8.0`.
- Do not publish to npm or a remote artifact store.
- Do not mutate the existing `v3.8.0-rc.2` tag.
- Do not bless a dirty working tree as an immutable RC snapshot.
- Do not treat release snapshots as live constitutional specification.

## Required Break Order

1. Ratify release snapshot qualification requirements.
2. Declare the M05 release snapshot IACS and design boundary.
3. Implement carrier constructors and one builder that owns build/pack/copy
   effects.
4. Expose one command/script binding.
5. Prove positive bundle creation and negative mismatch/overwrite/dirty-source
   rejection.
6. Generate the `v3.8.0-rc.2` snapshot from the tagged source identity.

## Impacted Interface Review Checklist

- [x] `REQ-P-QUAL.md` names release snapshot artifact obligations without
  making version identity live specification truth.
- [x] M05 design owns release snapshot packaging; M04 installer remains
  install/bootstrap, not release packaging.
- [x] Snapshot builder consumes an explicit package source root and source ref.
- [x] Snapshot manifest is the only semantic center for artifact identity.
- [x] Snapshot output is immutable/non-overwriting.
- [x] Dirty source or package identity mismatch fails closed.
- [x] Package script/CLI does not create a second release method or tap flow.
- [x] Tests prove both positive artifact creation and negative rejection.

## Closure Evidence

- [x] `npm run test:t142`
  - pass: 4 tests
- [x] `npm run lint:semantic`
- [x] `npm run test:semantic`
  - pass: 601 tests
- [x] `git diff --check`
- [x] local snapshot path for `v3.8.0-rc.2`
  - `release_snapshots/abiogenesis-typescript-tenant/3.8.0-rc.2/`
- [x] manifest checksum and tarball checksum recorded
  - tarball: `b7ad0173e71e5fd6ddf7eff409a79d1769bdd0963f615f9a5a595ee6d1a1a72d`
  - manifest: `e017bbaf7a71af371185b766e91d1fda42273e8ffa390ccce2e5253d1ab30564`
  - checksum verification: `shasum -a 256 -c checksums.sha256` passed
