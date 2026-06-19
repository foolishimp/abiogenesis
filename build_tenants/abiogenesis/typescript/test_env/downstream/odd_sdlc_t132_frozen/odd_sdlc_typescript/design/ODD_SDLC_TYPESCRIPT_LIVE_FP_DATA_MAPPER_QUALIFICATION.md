# odd_sdlc TypeScript Live F_P data_mapper Qualification

**Status**: Accepted
**Date**: 2026-04-27
**Owner Ticket**: `.ai-workspace/tickets/completed/T-053-build-typescript-live-fp-data-mapper-qualification-lane.md`
**Implements**: REQ-F-ODDSDLC-024, REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-043
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`, `ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`

## Purpose

Define the TypeScript live `F_P` data_mapper proof lane.

This lane is not a harnessed sandbox. When enabled, it must dispatch an
external worker process, use the repo-local copied `data_mapper.template`
fixture as scenario input, admit the returned artifact through TypeScript hook
contracts, and write an archive.

## Module Shape

| Module | Classification | Owns | Does Not Own |
| --- | --- | --- | --- |
| `test_env/live/test_t053_live_fp_data_mapper.test.mjs` | Live qualification module | live worker dispatch, repo-local fixture binding, ABG-installed workspace evidence, result admission, archive writing | production runtime, ABG traversal law, Python parity claim |
| `test_env/sandbox/abg_installed_workspace.mjs` | Installed substrate fixture | public ABG TypeScript install evidence | live worker behavior |
| `hooks/` | Admission/evaluation modules | preflight, work-report construction, postflight proof | worker execution or retry |

## Execution Contract

The lane is explicit:

- disabled by default unless `ODD_SDLC_TS_LIVE_FP=1`
- requires the repo-local copied `data_mapper.template` fixture root
- requires an external worker command, defaulting to `codex`
- provisions a fresh ABG-installed workspace
- opens one public start over the published `bootstrap_release_self_test`
  executive graph function
- dispatches the worker with a prompt and manifest
- requires a generated target file from the worker
- constructs and admits `SdlcConstructorResult`
- runs `runSdlcHookTurn`
- archives install evidence, prompt, worker stdout/stderr, generated file,
  result payload, hook outcome, event sequence, projection summary, and
  postmortem

## Non-Ownership

The live lane must not:

- claim full operational Python replacement
- infer proof from Python live tests
- accept a harnessed fixture as live `F_P`
- bypass ABG-installed workspace setup
- accept worker text without generated artifact admission
- retry locally when worker output is insufficient

## Design-Module Review

This is a qualification module, not production architecture. The new surface is
lawful because it has one owner: proving the live external worker proof class.

The local optimization is that all archive mechanics for this lane are bounded
to the live qualification module while T-048 tracks upstream ABG common archive
convergence.

The global optimization is that result proof reuses existing graph, start,
hook, and ingress modules instead of creating a separate live runner.

## Accepted Proof

The accepted run is:

- command: `ODD_SDLC_TS_LIVE_FP=1 npm run test:live`
- duration: `149909.146459ms`
- archive:
  `build_tenants/typescript/test_env/test_runs/t053_live_data_mapper/20260426T183216072Z_pid7194/`
- target graph function: `bootstrap_release_self_test`
- selected edge graph function: `derive_code_surface`
- result digest:
  `sha256:c296f8a916f71df70e8d8d05ffe15b41db430f07e6d0211d8cfa2b8ac77b480b`
