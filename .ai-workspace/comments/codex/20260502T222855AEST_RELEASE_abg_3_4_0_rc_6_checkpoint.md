---
kind: codex_post
type: release_checkpoint
date: 2026-05-02T22:28:55+10:00
subject: abiogenesis 3.4.0-rc.6 release candidate checkpoint
release_candidate: 3.4.0-rc.6
tenant: abiogenesis/typescript
branch: rc/3.4.0
tag: v3.4.0-rc.6
status: release_updated_pending_commit_and_tag
---

# Abiogenesis 3.4.0-rc.6 Checkpoint

This post records the operator-directed release update after the T-104
cross-workspace output allocation tranche.

## Scope

This RC updates the TypeScript-primary ABG line with:

- explicit `W1` input workspace to `W2` output workspace start/allocation truth
- `StartRequestedOutput.outputWorkspace` as admitted W2 authority, not a path
  shortcut
- W2-aware `OutputInstanceAllocation` with W1 input lineage and W2 output
  lineage
- W1/W2 lineage on output allocation events, plugin handoff manifests, and
  replay projection
- mini data-mapper redux support for `--output-workspace`,
  `--output-workspace-ref`, and `--output-workspace-authority-ref`
- a deterministic T-104 forensic sandbox that reruns multiple W1/W2 review
  streams and compares semantic fingerprints across edge ledgers, foldback,
  manifest, F_D envelope, F_P evaluation, and admitted assessments

T-104 is no longer deferred backlog scope in the RC notes. It is accepted as
ABG-owned runtime substrate for parallel reviewable output streams.

## Version

- package: `@abiogenesis/typescript-tenant@3.4.0-rc.6`
- planned tag: `v3.4.0-rc.6`
- primary tenant: `build_tenants/abiogenesis/typescript`

## Verification

Fresh rc.6 gates:

- `npm run lint:semantic`: passed
- `npm run lint:test-harness`: passed
- `npm run test:t082`: 6 passed
- `npm run test:t100:test35-parity`: 15 passed
- `npm run test:t101`: 2 passed
- `npm run test:t102`: 7 passed
- `npm run test:t103`: 24 passed
- `npm run test:t104`: 6 passed
- `npm run test:t104:sandbox`: 1 passed
- `npm run test:semantic`: 354 passed, 0 failed
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`: passed,
  package version `3.4.0-rc.6`, 308 files
- `git diff --check`: passed

Latest deterministic forensic artifacts:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260502T122946642Z/forensic_analysis.json`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/t104_cross_workspace_mini_dm_forensics/20260502T122946642Z/forensic_analysis.md`

## Decision

Update the ABG TypeScript source RC to `v3.4.0-rc.6`. This is still a
release-candidate checkpoint, not the final tapped `3.4.0` release.
