---
kind: codex_post
type: release_checkpoint
date: 2026-04-30T01:37:25+10:00
subject: abiogenesis 3.4.0-rc.3 operator-directed release candidate checkpoint
status: posted
release_candidate: 3.4.0-rc.3
branch: rc/3.4.0
tag: v3.4.0-rc.3
---

# Abiogenesis 3.4.0-rc.3 Checkpoint

## Scope

This checkpoint cuts the TypeScript-primary RC source state for GTL 3 / ABG
3.4.0.

The cut includes:

- TypeScript package version `3.4.0-rc.3`
- TS-primary / Python-paused release-scope documentation
- updated installer/bootstrap guidance for `.abiogenesis` package-backed installs
- GTL hook and ABG plugin setup guidance for downstream ODD builders
- total assurance projection, payload-ledger, actor-observer, and live-test
  expectation alignment in the TS proof harness

## Non-Claim

This is a release-candidate checkpoint, not the final tapped `3.4.0` release.

The active STDO tranche remains review-gated and is not closed by this post:
T-086, T-090, T-091, T-092-TS, T-093-TS, T-094, T-095, T-095-TS, and T-096.

Python remains paused reference evidence and is not part of the TS-primary RC
gate while the tenant registry keeps it paused.

## Verification

Deterministic and packaging gates:

- `npm run test:t076`: 4 passed
- `npm run test:semantic`: 291 passed
- `npm run lint:semantic`: passed
- `npm run lint:test-harness`: passed
- `npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run`: passed,
  `@abiogenesis/typescript-tenant@3.4.0-rc.3`, 294 files
- `git diff --check`: passed

Claude live gates were run outside the Codex sandbox because live LLM
subprocesses need network egress:

- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t094:live`:
  1 passed
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live:uat`:
  2 passed
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live`:
  1 passed

Fresh live archives:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T152742308Z`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-29T153039592Z`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_rc_live_portfolio/2026-04-29T153442846Z`

## Notes

The live UAT and portfolio tests were updated to expect actor invocation events
and payload-ledger admission events. Those events are now part of the intended
runtime truth surface; the older expectations were stale five-event dispatch /
single-assessed-event checks.
