# abiogenesis 3.9.0-rc.7 Release Candidate Note

This checkpoint is the seventh TypeScript ABG `3.9.0` release candidate. It
follows `3.9.0-rc.6` with PTY supervisor hardening, heartbeat/progress lease
separation, and trace-visible inactivity cleanup for agent worker processes.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC6
preserves the staged compute runtime law introduced in RC1, the proof-harness
alignment from RC2, the evaluation-rule provenance fix from RC3, the runner/PTY
corrections from RC4, and the canonical runtime event identity boundary from
RC5. It then realizes the T-147 runtime-authority invariants inside ABG rather
than leaving them as downstream adapter precedent. RC7 keeps that authority
surface and hardens the worker process supervision path that executes those
runtime plugin calls.

RC7 adds:

- PTY execution topology
  `pty_terminal -> agent_supervisor -> local-spawn -> worker`, so the terminal
  envelope no longer owns the worker directly;
- supervisor-owned hard timeout, inactivity timeout, process-group cleanup, and
  grace-period escalation for local-spawned workers;
- trace-visible supervisor decisions:
  `terminal_agent_supervisor_configured`,
  `terminal_agent_supervisor_hard_timeout`, and
  `terminal_agent_supervisor_inactivity_timeout`;
- heartbeat/probe separation from progress lease reset: heartbeat can prove
  liveness, but it no longer prevents inactivity from firing when no substantive
  worker progress is observed;
- propagated `inactivityTimeoutMs` through supervised process actor execution;
- heartbeat-only silent worker proof that inactivity is exceeded;
- PTY request archive hygiene: the generated supervisor request does not
  serialize `env`, while the worker still inherits the supervisor process
  environment normally;
- package version advancement to `3.9.0-rc.7` for downstream consumers that
  need the corrected worker-supervision boundary.

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
  .bind(plugin.consequence.C)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

RC6 does not introduce a new GTL ontology object, a public `ComputeUnit`
aggregate, a public `Vector` execution target, or product-owned ABG system
effects. The new surfaces are ABG runtime projections and admission/fold
mechanics over existing retry frontier, payload ledger, and target-carrier
authority law.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `3.9.0-rc.7`
- Candidate package version: `3.9.0-rc.7`
- Candidate tag: `v3.9.0-rc.7`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

npm run test:t147
7 passed

node --test test_env/tests/test_t111_pty_terminal_executor.test.mjs \
  test_env/tests/test_t097_supervised_process_actor.test.mjs \
  test_env/tests/test_t129_runtime_liveness_observer.test.mjs
24 passed

npm run test:semantic
657 passed

npm pack --dry-run
passed, package `3.9.0-rc.7`, 388 entries

git diff --check
pending before the snapshot commit
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

The release operator preserves `3.9.0-rc.1` as the first staged-compute runtime
candidate, `3.9.0-rc.2` as the live-proof harness alignment candidate,
`3.9.0-rc.3` as the ABG-owned actor invocation provenance candidate, RC4 as the
downstream live-lane runner and PTY stability candidate, and RC5 as the
downstream live-lane runner and PTY stability candidate, and RC5 as the
event-source identity and millisecond timestamp boundary candidate. RC6 is the
runtime-authority wiring candidate for retry freshness, output authority, and
projection-output admission before closure. RC7 is the worker-supervision
candidate for PTY/local-spawn topology, heartbeat/progress separation, and
bounded process cleanup.
