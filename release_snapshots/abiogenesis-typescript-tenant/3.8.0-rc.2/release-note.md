# abiogenesis 3.8.0-rc.2 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the release line from `3.7.1-rc.4` to `3.8.0-rc.2` because ABG now
declares and realizes an event-sourced saga frontier for dependency-aware
system parallelism over a shared mutable workspace.

The `3.7.0-rc.1` line introduced the generic F_P construction evaluator and
read-only public gaps over evaluator truth. The `3.7.1-rc.1` candidate
preserved that evaluator substrate and added the runtime liveness observer
needed to keep long-running constructive work governed by admitted activity
rather than flat caller-local timeouts. The `3.7.1-rc.2` candidate preserved
both lines and added edge-level gain/close assurance contracts with live
installed proof. The `3.7.1-rc.3` candidate repaired the constitutional/docs
model so GTL topology anchors do not collapse the wider first-class declaration
surface. The `3.7.1-rc.4` candidate preserved those cuts and added mandatory
target-carrier contract bindings for graph-vector outputs. This
`3.8.0-rc.2` candidate preserves those cuts and adds T-141 saga-frontier law,
typed carriers, evented native async orchestration, and synthetic/live proofs
for transparent serial-vs-parallel realization.

It is an RC candidate, not the final tapped `3.8.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
preserves the accepted `3.7.0-rc.1` evaluator substrate, the `3.7.1-rc.1`
runtime probe observer, the `3.7.1-rc.2` edge-assurance runtime path, the
`3.7.1-rc.3` GTL type-boundary correction, and the `3.7.1-rc.4`
target-carrier binding path.

RC2 for `3.7.1` added:

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

RC3 for `3.7.1` adds:

- `PRODUCT.md` language that names `Graph`, `Node`, `GraphVector`,
  `GraphFunction`, `Job`, and `Module` as topology anchors rather than the
  whole GTL type universe;
- explicit preservation of `Context`, `Operator`, `Evaluator`, `Rule`,
  `RefinementBoundary`, `CandidateFamily`, and `Role` as first-class GTL
  declarations;
- explicit `ContractRef` treatment as job indirection to a published contract,
  not a topology anchor or runtime execution target;
- builder-guide alignment so downstream terms such as graph overlay, leaf,
  workflow lane, and app surface must bind back to a GTL topology anchor or
  first-class declaration surface before declaring GTL or ABG behavior.

RC4 for `3.7.1` adds:

- `gtl.target_carrier_contract` as the mandatory effective output-carrier
  contract binding for graph-vector targets;
- visible `gtl.target-carrier-defaults.json` config for the generic binding
  when no product-specific vector declaration exists;
- vector-local target/schema identity checks so a declaration cannot bind a
  carrier for a different target node;
- normalized defaults-bundle digest identity across load and direct admission
  paths;
- payload validation/rejection events carrying selected contract digest, with
  replay admission filtered by contract ref plus digest;
- assurance-gate closure blocking when the selected target-carrier contract has
  no admitted payload truth;
- generic F_D envelope validation for nested payload presence, required fields,
  carrier kind literal, and fixed protocol fields while leaving downstream
  semantic meaning to product/F_P consumers.

RC2 for `3.8.0` adds:

- `REQ-R-ABG3-SAGA-FRONTIER` as the ABG law for event-sourced saga-frontier
  selection, dependency fan-out/fan-in, observed-state freshness, and
  write/output territory safety;
- a product-transparency axiom: downstream products may declare a steel
  thread or dependency fan-out because they own content meaning, while ABG may
  choose serial or parallel realization under the same declared truth;
- native Node async runner support with policy-capped system parallelism;
- BranchRef, BranchAttemptRef, BranchExecutionPolicy, idempotent branch payload
  admission, branch lease, fan-in, failure, and replay projection carriers;
- fail-closed underdeclaration handling so missing observed-state or
  write/output territory proof does not masquerade as safe concurrency;
- evented lease-before-effect ordering, task-failure disposition, replay-visible
  release behavior, output-allocation conflict projection, and deterministic
  fan-in;
- synthetic proof for an ABG-contained multi-reviewer dependency graph:
  work surface -> configured reviewer fan-out -> finding reduction -> routing;
- live proof for the same abstract shape using real Claude PTY reviewer
  branches and abstract reducer/router branches;
- a deterministic stress proof with 65 branches: 50 concurrent roots, 10
  reducers, and 5 terminal leaves over a three-batch dependency graph.
- RC2 hardening for per-branch task failure: failed branches become
  replay-visible frontier truth, preserve failure evidence refs, release
  leases, block dependents, and do not halt independent ready rows.

## Non-Claims

The T-141 saga-frontier slice does not claim that downstream product changes
its product dependency meaning or must expose ABG scheduling decisions. The
contract is transparent to products: admitted module/test dependency maps,
selected steel-thread or parallel traversal plans, declared targets, write
territories, evidence/fan-in expectations, and product-owned dependency meaning
remain product truth. ABG may or may not exploit lawful fan-out.

The T-141 slice also does not claim cloud durable provider integration, a final
workspace publish/merge primitive, human-gate timeout policy, or a complete
distributed retry/cancellation runtime. Those remain separately ticketed
runtime-realization concerns.

The T-127/T-128 split remains intact. T-127 owns the construction evaluator
substrate; T-128 owns the installed runner-level loop that consumes admitted
construction intent and invokes graph work recursively.

The 3.7 RC line also does not claim recurrence, window policy, cloud durable
provider integration, sticky-session reuse, warm agent pools, or automatic
session affinity. Those remain outside this cut unless separately ticketed.

## Versioned Artifacts

- RC branch: `rc/3.8.0`
- RC identity: `3.8.0-rc.2`
- Candidate package version: `3.8.0-rc.2`
- Candidate tag: `v3.8.0-rc.2`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t141
34 passed

npm run test:semantic
597 passed

npm run test:t141:live
5 passed

npm run lint:test-harness
passed

npm run lint:semantic
passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.8.0-rc.2, files 374, package abiogenesis-typescript-tenant-3.8.0-rc.2.tgz
```

The prior full live sweep remains historical release evidence, and the focused
T-141 live lane was rerun after the RC2 ABG-contained scenario update. The
previous `3.7.0-rc.1` construction evaluator proof, `3.7.1-rc.1` liveness
proof, `3.7.1-rc.2` edge-assurance proof, `3.7.1-rc.3` GTL type-boundary
proof, and `3.7.1-rc.4` target-carrier proof remain historical release evidence
for the substrate preserved by this line.

## RC Decision

The release operator repriced the saga-frontier work as a release-candidate
correction over the accepted `3.7.1-rc.4` target-carrier line. Cut
`v3.8.0-rc.2` as the next release-candidate checkpoint after committing this
source state. This is not the final tapped `3.8.0` release.
