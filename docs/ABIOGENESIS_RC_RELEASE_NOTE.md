# abiogenesis 3.9.0-rc.5 Release Candidate Note

This checkpoint is the fifth TypeScript ABG `3.9.0` release candidate.
It follows `3.9.0-rc.4` with event-sourcing hardening for canonical ABG runtime
events and a runner ordering correction found while exercising downstream SDLC
lanes.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC5
preserves the staged compute runtime law introduced in RC1, the proof-harness
alignment from RC2, the evaluation-rule provenance fix from RC3, and the
runner/PTY corrections from RC4. It then makes canonical runtime event identity
and time explicit at ABG emission and replay boundaries.

RC5 adds:

- canonical runtime event envelopes with immutable `eventId`, ISO UTC
  millisecond `eventTime`, numeric `eventTimeUnixMs`, and
  `eventAdmissionOrdinal`;
- duplicate-`eventId` rejection for canonical emitted event batches and runner
  replay inputs;
- a strict `EngineIterateRequest.runtimeEvents` boundary that rejects raw
  event-shaped objects as replay history;
- runner ordering that emits and evaluates F_D authority outcome truth before
  generic evaluation-set blocking can terminate traversal;
- package version advancement to `3.9.0-rc.5` for downstream consumers that need
  the corrected ABG event-sourcing boundary.

## Boundary

The governing execution framing remains:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(system.planTransformSet)
  .bind(plugin.transform.C.task[*])
  .bind(system.admitTransformTaskResult[*])
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.collectTransformSet)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(system.planConsequenceSet)
  .bind(plugin.consequence.C.task[*])
  .bind(system.admitConsequenceTaskResult[*])
  .bind(system.collectConsequenceSet)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

RC5 does not introduce a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects.

## Versioned Artifacts

- RC branch: `rc/3.9.0`
- RC identity: `3.9.0-rc.5`
- Candidate package version: `3.9.0-rc.5`
- Candidate tag: `v3.9.0-rc.5`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

npm run test:semantic
647 passed

CODEX_LIVE_FP=1 npm run test:live
1 passed

CODEX_LIVE_FP=1 npm run test:live:uat
2 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal node --test test_env/live/test_t087_supervised_actor_invocation_live.test.mjs test_env/live/test_t094_assurance_register_two_hop_live.test.mjs test_env/live/test_t100_five_rule_algebra_live.test.mjs test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs test_env/live/test_t119_temporal_gtl_live.test.mjs test_env/live/test_t125_temporal_and_non_temporal_gtl_live.test.mjs test_env/live/test_t127_fp_consciousness_scenarios_live.test.mjs test_env/live/test_t132_edge_assurance_installed_live.test.mjs test_env/live/test_t141_saga_frontier_live.test.mjs
24 passed

git diff --check
passed

No orphan live worker process remained after the live matrix.

The RC live portfolio remains a live transport/admission/projection smoke lane:
it runs real Codex subprocesses but uses constrained JSON-response prompts. The
additional live matrix above covers the PTY, temporal, assurance, edge-assurance,
consciousness, and saga-frontier lanes.
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

The release operator preserves `3.9.0-rc.1` as the first staged-compute runtime
candidate, `3.9.0-rc.2` as the live-proof harness alignment candidate, and
`3.9.0-rc.3` as the ABG-owned actor invocation provenance candidate. RC4 is the
downstream live-lane runner and PTY stability candidate. RC5 is the event-source
identity and millisecond timestamp boundary candidate.
