# Data Mapper Live Runbook

## Purpose

The data_mapper lane tests whether odd_sdlc can build data_mapper. It is not an outside-in effort to build data_mapper by hand.

Generated data_mapper workspace defects are F_P worksite repair pressure unless the observed failure proves an odd_sdlc framework, ABG, or GTL defect.

## Pre-Run Gate

Before starting or resuming a data_mapper live lane, run:

```bash
npm run guard:data-mapper-boundary
```

Record the current framework diff before the run:

```bash
git diff --stat -- code/src test_env/tests package.json
```

Do not start a new sandbox when an existing sandbox has a resumable failure. Patch the active sandbox and resume from the failed node.

For the code-depth isolation lane, use the copied-archive runner instead of a
fresh template:

```bash
npm run test:t199:data-mapper-code-depth-resume-live
```

That lane is valid only when the seed archive already carries substantive prior
events, ledgers, handoffs, design-depth register, and code-generation target
authority. Override the seed with
`ODD_SDLC_TS_T199_DATA_MAPPER_SEED_ARCHIVE_ROOT` only for an existing
data_mapper archive that passes that gate.

The code-depth isolation lane is a clean first codegen tranche over the prior
graph, not a full tenant closure rerun. Keep the prior graph inputs and edge
authority, but prune copied build/tool byproducts (`target`, `.bloop`,
`.metals`, `.scala-build`, `sbt-boot`, `sbt-global`, `ivy2`, `coursier`,
`scalac-classes`) before execution. Review-grade residuals for broad
tenant-stack modules or missing lineage traces are product pressure unless they
prove a framework prompt, admission, replay, or closure defect.

For a release proof, run the full data_mapper lane against the release snapshot
package instead of the mutable source package:

```bash
ODD_SDLC_TS_DATA_MAPPER_RELEASE_SNAPSHOT_ROOT=release_snapshots/odd-sdlc-typescript-tenant/2.0.0 \
ODD_SDLC_TS_DATA_MAPPER_LANE_NAME=data_mapper_v2_0_0_release_proof \
ODD_SDLC_TS_DATA_MAPPER_START_TARGET=overlay:deep-sdlc-traversal \
npm run live:data-mapper-sandbox
```

The run archive must record `packageSource.kind =
release_snapshot_package`. If it records `source_package`, the run is source
checkout evidence, not release evidence.

## Failure Classification

Classify generated workspace compile, test, source, lineage, and tenant-stack failures as F_P worksite repair pressure by default.

Patch odd_sdlc source only when the evidence points to an SDLC framework, ABG, or GTL defect, including:

- prompt, admission, evaluator, closure, replay, event, or projection boundary defects
- ABG/GTL runtime, traversal, continuation, process supervision, or cleanup defects
- framework-authored tenant-stack inference or hard-coded downstream technology knowledge

Do not patch odd_sdlc source merely because the generated data_mapper workspace has a language, compiler, build-tool, or test failure.

## Framework Write Lock

During a data_mapper live run, `code/src`, `package.json`, and shared test harness surfaces are write-locked until the failure has been classified as an SDLC framework, ABG, or GTL defect.

Before editing a locked framework surface, write down:

- the failing sandbox path and operator-run path
- the failed stage and node
- the exact artifact or prompt evidence
- the smallest lawful re-entry point
- why the failure is not ordinary F_P worksite repair pressure

After editing a locked framework surface:

- run `npm run guard:data-mapper-boundary`
- run the focused test that proves the framework defect
- rebuild and hot-patch the active sandbox package copy when resuming the same sandbox
- resume the failed node instead of starting a new sandbox

## Agent Instruction

When operating this lane: You are testing whether odd_sdlc can build data_mapper. Do not improve data_mapper from outside the sandbox. Only patch odd_sdlc when the observed defect is in SDLC framework law, ABG/GTL runtime, prompt/admission/evaluator boundaries, event/replay, projection, closure, or process supervision.
