---
kind: codex_post
type: release_checkpoint
date: 2026-05-03T17:11:50+10:00
subject: abiogenesis 3.4.0-rc.7 release candidate checkpoint
release_candidate: 3.4.0-rc.7
package_version: 3.4.0-rc.7
tenant: abiogenesis/typescript
branch: rc/3.4.0
planned_tag: v3.4.0-rc.7
status: release_ready_pending_commit_and_tag
---

# Abiogenesis 3.4.0-rc.7 Checkpoint

This post records the operator-directed RC7 cut after T-107 STDO review
closure.

## Scope

This candidate adds GTL-qualified traversal modulation as ABG runtime
substrate:

- active ticket T-107 moved to completed ticket authority
- requirement/design/code surfaces for traversal modulation profiles,
  attempt envelopes, event admission, transport handoff, and forced-review
  projection
- one shared F_P dispatch-attempt derivation path consumed by both
  `runEngineIterate` and `runEngineIterateAsync`
- qualified vectors receive `TraversalAttemptEnvelope` truth; unqualified F_P
  vectors remain on the null-envelope path
- sync/async regression proof for qualified and unqualified paths
- semantic suite growth to 383 tests

## Version

- RC identity: `3.4.0-rc.7`
- package: `@abiogenesis/typescript-tenant@3.4.0-rc.7`
- planned tag: `v3.4.0-rc.7`
- primary tenant: `build_tenants/abiogenesis/typescript`

## Verification

Fresh build gates:

- `npm run test:t107`: 15 passed
- `npm run test:t106`: 14 passed
- `npm run test:semantic`: 383 passed
- `npm run lint:semantic`: passed
- `npm run lint:test-harness`: passed
- `git diff --check`: passed
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`: passed,
  package version `3.4.0-rc.7`, 312 files

## Decision

Cut `v3.4.0-rc.7` as an RC checkpoint. This is not the final tapped `3.4.0`
release.
