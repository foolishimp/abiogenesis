# Scenario Sandbox Descriptors

Each `*.scenario.mjs` file in this directory is a data descriptor for a
rebuildable app-building sandbox driven by
`../scenario_sandbox.mjs`.

A scenario descriptor declares:

- `scenarioId` — unique id, used in the archive root and installed package name
- `fixture.root` — absolute path to the source-of-truth project the harness
  will copy into a fresh workspace before installing odd_sdlc
- `fixture.sourceFiles` — files the harness asserts before copying
- `expectations` — optional assertions over the first advance:
  - `firstEdge` — expected `targetGraphFunction` returned by the first `gaps`
  - `firstStartStatus` — expected `status` returned by the first `start`
  - `firstStartTargetGraphFunction` — expected graph function in the first
    `start` execution contract
  - `firstStartOverlayRef` — expected overlay ref in the first `start`
    execution contract
  - `firstEventKinds` — runtime event kinds that must appear in the first start
  - `requirementIds` — ids that must be lifted into requirement families
  - `workspaceFiles` — files that must exist in the final workspace
  - `materializationEvidenceWorkspaceFiles` — workspace files that must have
    product materialization evidence in the operator-run ledger history
  - `handoffEdgeSequencePrefix` — expected handoff edge sequence prefix,
    ignoring consecutive same-edge retries
  - `edgeAssuranceArchiveSequencePrefix` — expected handoff edge sequence
    prefix whose selected close archive must carry handoff, gain, residual
    pressure, fulfillment ledger, closure decision, and next-action evidence
  - `processChecks` — commands to run inside the workspace after traversal;
    checks may assert exact stdout or selected JSON stdout fields through
    `stdoutJson.hasKeys`, `stdoutJson.equals`, `stdoutJson.arrayIncludes`, or
    exact array checks through `stdoutJson.arrayEquals` or order-insensitive
    `stdoutJson.arrayMembers`
  - `archiveArtifacts` — files that must exist under the first start's archive
  - `latestArchiveArtifacts` — files that must exist under the latest observed
    operator-run archive
- `maxAdvances` — how many `gaps -> start` cycles to run (default 1)
- `liveWorker` — opt-in worker URI (e.g. `process://claude`); omit for
  deterministic single-advance lanes
- `startTarget`, `startUntil` — passed through to `start --target / --until`
- `startTargetSequence`, `startUntilSequence` — optional per-advance overrides
  for compound overlay proofs; after the sequence is exhausted, the descriptor
  falls back to `startTarget` and `startUntil`

Run any scenario through `runScenarioSandbox(scenario)` exported by
`../scenario_sandbox.mjs`. The result includes the run root, the workspace
path, the install outcome, and the captured advances; pass it to
`assertScenarioExpectations(result, scenario)` to enforce the descriptor's
assertions.

## Bootstrap Seed Contract

New app-building fixtures should treat `bootstrap.md` as the initial
conformance source for `Fg_conform_project`, unless the scenario explicitly
tests a preconformed workspace. The bootstrap document must carry enough
authority to derive intent, product definition, requirement pressure, tenant
selection, output root, technology stack, and proof command shape.

Conformed specification files, tenant registries, design files, and product
source are traversal outputs. Do not include them in the fixture when the
scenario is meant to prove initial conformance bootstrap.

Adding a new app-building sandbox is two files: a fixture directory and one
descriptor. No harness change is required.
