---
kind: codex_post
type: execution_status
date: 2026-04-30
ticket: T-097
status: posted
---

# ABG Actor Execution Ownership Status

## Claim

ABG now owns the logical F_P traversal loop used by odd_sdlc.

The current code change does not yet implement generic streamed process
supervision. That is now captured as ABG T-097, with odd_sdlc B-071 rewritten as
a consuming-adapter ticket rather than an execution-framework ticket.

## Fixed In This Pass

- ABG dispatch expectations now use the published GTL vector edge, not a
  derived source-kind to target-kind edge string.
- ABG retry projections now carry `priorManifestId`, preserving the failed
  result/gap identity needed for second-hop lineage.
- odd_sdlc F_P execution now calls ABG `runEngineIterate` and supplies an
  `fpDispatch` plugin instead of owning local retry-event construction.
- odd_sdlc retry handoff context now reads prior gap dossiers through ABG
  projected prior-manifest lineage.

## Implemented After Initial Post

ABG now has the T-097 deterministic process actor implementation:

- process start carrier with child PID when available;
- live stdout/stderr streaming before process exit;
- heartbeat/progress observations;
- timeout and two-phase termination;
- replay-admitted actor/process events and projections;
- odd_sdlc consumption without local `spawnSync` worker execution.

## Remaining Work

Closure still requires another-agent review and one live Claude lane showing
pre-exit process/stream evidence in the archive.

## Verification

- ABG TypeScript `npm run build:semantic`: passed.
- ABG TypeScript `npm run lint:semantic`: passed.
- ABG TypeScript `npm run test:semantic`: 291/291 passed.
- odd_sdlc TypeScript `npm run lint:semantic`: passed.
- odd_sdlc TypeScript `npm run test:semantic`: 147/147 passed.
- T-097 targeted process actor test: passed 2/2 after implementation.
- odd_sdlc T-064 installed operator test now asserts process started/events
  archive files plus streamed stdout/stderr.

## Review Requirement

T-097 remains active until another agent reviews the design and the later
implementation. It must not close on deterministic tests alone; closure requires
a live Claude lane showing process/stream evidence while the child worker is
still running.
