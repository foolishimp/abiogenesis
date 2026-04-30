---
kind: codex_post
type: release_checkpoint
date: 2026-05-01
subject: abiogenesis 3.4.0-rc.4 release candidate checkpoint
release_candidate: 3.4.0-rc.4
tenant: abiogenesis/typescript
tag: v3.4.0-rc.4
status: cut_ready
---

# Abiogenesis 3.4.0-rc.4 Checkpoint

This post records the operator-directed `v3.4.0-rc.4` release candidate cut for
the TypeScript primary ABG line.

## Scope

This RC incorporates the reviewed ABG assurance/payload/process-actor tranche:

- supervised process actor events and replay projection
- typed `F_P` transform request/result carriers
- request-scoped transform result admission
- full retry frontier projection
- fulfilled-without-evidence rejection
- assurance gate authority precedence over worker-admitted authority
- requirement authority for process actor events, process projection, and
  supervised transport law

The Python tenant remains paused. Downstream odd_sdlc regression proof for the
test60-class consumer bugs is not claimed by this source RC; it remains a
separate odd_sdlc consumer gate.

## Version

- package: `@abiogenesis/typescript-tenant@3.4.0-rc.4`
- planned tag: `v3.4.0-rc.4`
- primary tenant: `build_tenants/abiogenesis/typescript`

## Verification

Fresh rc.4 gates:

- `npm run lint:semantic`: passed
- `npm run lint:test-harness`: passed
- `npm run test:semantic`: 304 passed, 0 failed
- `npm run test:t076`: 4 passed, 0 failed
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=240000 npm run test:t094:live`:
  1 passed
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=240000 npm run test:t097:live`:
  1 passed
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`: passed,
  package version `3.4.0-rc.4`, 300 files

Live archives:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260430T141629554Z`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/t097_supervised_process_actor_live/20260430T141652934Z`

## Decision

Cut the ABG TypeScript source RC as `v3.4.0-rc.4`. This is not the final tapped
`3.4.0` release.
