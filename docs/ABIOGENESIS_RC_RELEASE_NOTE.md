# abiogenesis 3.7.1-rc.2 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the release line from `3.7.1-rc.1` to `3.7.1-rc.2` because
T-130, T-131, and T-132 make edge assurance a declared GTL contract consumed by
ABG runtime replay rather than a downstream meta-contract.

The `3.7.0-rc.1` line introduced the generic F_P construction evaluator and
read-only public gaps over evaluator truth. The `3.7.1-rc.1` candidate
preserved that evaluator substrate and added the runtime liveness observer
needed to keep long-running constructive work governed by admitted activity
rather than flat caller-local timeouts. This `3.7.1-rc.2` candidate preserves
both lines and adds edge-level gain/close assurance contracts with live
installed proof.

It is an RC candidate, not the final tapped `3.7.1` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
preserves the accepted `3.7.0-rc.1` evaluator substrate and the
`3.7.1-rc.1` runtime probe observer, then adds a first-class edge assurance
contract path through GTL declarations, ABG plugin input, hook action/finding
admission, payload-ledger evidence, closure projection, and installed live
replay.

RC2 for `3.7.1` adds:

- `HookActionRecord` and `HookFindingAdmission` as typed replay-visible records
  for F_P eval actions and returned findings;
- `EdgeAssuranceContract` on GTL declaration surfaces, including target
  outcome, authority, evidence, gain, metric, close, residual, continuation,
  composition, and policy refs;
- F_H-by-absentia default assurance when an edge does not declare automated
  gain/close;
- `EnginePluginInput.edgeAssuranceResolution` so plugins consume the selected
  contract instead of reconstructing it from prompts or runtime config;
- `FpEdgeAssuranceEvalFinding`, `EdgeAssuranceEvaluationProjection`, and
  `EdgeAssuranceEvaluationReadModel` for replay-derived gain/close/residual and
  next-action truth;
- installed deterministic and live proof over a three-edge GTL graph:
  source information -> synthesized requirements -> formal logical requirements
  -> disambiguated design syntax;
- a concrete `gtl_disambiguated_design_syntax` payload on the terminal
  `C -> D` edge, F_D-validated for schema/envelope before F_P assurance owns
  semantic close;
- fail-closed proof for missing hook records, unrecorded admissions, rejected
  findings, unadmitted evidence, side-door closure authority, lineage drift,
  premature compound close, and missing intermediate edge contribution.

## Non-Claims

The T-130/T-131/T-132 edge assurance slice does not claim downstream odd_sdlc
test35 migration as complete. It creates the ABG substrate proof that
downstream products can now consume without rebuilding an SDLC-local
meta-contract for edge gain and close.

The T-127/T-128 split remains intact. T-127 owns the construction evaluator
substrate; T-128 owns the installed runner-level loop that consumes admitted
construction intent and invokes graph work recursively.

The 3.7 RC line also does not claim recurrence, window policy, cloud durable
provider integration, sticky-session reuse, warm agent pools, or automatic
session affinity. Those remain outside this cut unless separately ticketed.

## Versioned Artifacts

- RC branch: `rc/3.7.1`
- RC identity: `3.7.1-rc.2`
- Candidate package version: `3.7.1-rc.2`
- Candidate tag: `v3.7.1-rc.2`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t129
11 passed

npm run test:t130:t131
20 passed

npm run test:t132
1 passed

ABG_TS_T132_LIVE=1 CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=120000 npm run test:t132:live
1 passed, archive build_tenants/abiogenesis/typescript/test_env/test_runs/t132_edge_assurance_installed_live/20260513T122205821Z_pid12061

npm run test:semantic
522 passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.7.1-rc.2, files 333, package abiogenesis-typescript-tenant-3.7.1-rc.2.tgz
```

The previous `3.7.0-rc.1` construction evaluator proof remains historical
release evidence for the evaluator substrate preserved by this line. The
previous `3.7.1-rc.1` liveness proof remains historical release evidence for
the runtime observer substrate preserved by this line.

## RC Decision

The release operator repriced edge assurance gain/close as a patch
release-candidate over the accepted `3.7.1-rc.1` liveness line. Cut
`v3.7.1-rc.2` as the next release-candidate checkpoint after committing this
source state. This is not the final tapped `3.7.1` release.
