# Data Mapper: Project Genesis Reference Template

## Overview
This is the canonical template for the **Categorical Data Mapping & Computation Engine (CDME)**. It is a moderate-complexity inherited specification corpus used to pressure **odd_sdlc** and **abiogenesis** against a non-normalized real project shape.

The project is mathematically grounded in Category Theory and requires strict adherence to invariants such as path validation, grain safety, and type unification.

## Contents
- `specification/`: the inherited project truth. Contains `INTENT.md`, `REQUIREMENTS.md`, and the domain-specific `mapper_requirements.md`.
- `.ai-workspace/context/project_constraints.yml`: project-local constraints carried into new test runs.
- `build_tenants/scala_spark/spec/`: the active build-tenant technology stack
  authority for Scala/Spark implementation and testing.

## RC Validation Operating Model
- This README is the template-side reference for how to interpret and run the `data_mapper.testXX` series.
- Do not inject these rules into `AGENTS.md` or `CLAUDE.md` for copied test workspaces; installed runs should still experience the normal workspace bootloader and runtime guidance.
- `data_mapper.template` is the preserved project authority and the seed for fresh RC validation runs.
- `data_mapper.testXX` is a clean installed workspace for a specific RC, but once installed it should be operated as a real live governed system, not as a toy test harness with special pleading.
- Use the `data_mapper.testXX` result as evidence of what that RC actually did under normal operating assumptions.
- `/Users/jim/src/apps/odd_sdlc` is the current `odd_sdlc` RC source. If `data_mapper.testXX` exposes a framework or runtime bug, patch there rather than editing the installed run.
- `/Users/jim/src/apps/odd_sdlc/build_tenants/python/test_env/tests` contains release-record tests. Use them to understand prior releases and regressions, not as the place to patch a live RC diagnosis.
- After install, prefer the installed workspace bootloader plus `.ai-workspace/context/project_bootstrap.md` and runtime registers over legacy README instructions if they disagree.

## Why This Template Matters
This template is useful precisely because it is not already shaped to the current `odd_sdlc` scaffold. It tests whether the framework can:
- preserve inherited project truth
- install itself cleanly into an arbitrary project folder
- orient around mixed legacy/current surfaces without false convergence
- derive the next lawful edge from the project rather than the scaffold

## Genesis History
This project has been implemented across multiple dogfood runs to track methodology evolution:
- `test02`: first complete run (`v1.x` pipeline)
- `test04`: best observability and gap detection (`v2.1+`)
- `test06`: first uninterrupted single-shot build (`v2.8`)
- `test07`: best design depth and REQ traceability (`v2.8` design-first)
- `test15`: exposed the old installed ABG/runtime control-plane and provenance gaps
- `test16+`: use the current bootstrap flow below

## Current Bootstrap
Use this procedure for current `odd_sdlc.TS` RC validation runs. The copied
workspace may have its root `README.md` preserved, updated, or superseded by
installed guidance during normalization; after install, `AGENTS.md`,
`.ai-workspace/context/odd_sdlc_typescript_bootstrap.md`,
`.ai-workspace/context/project_bootstrap.md`, and runtime registers are the
active operating surfaces.

1. Copy the template.

```bash
cp -R /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/test_env/fixtures/data_mapper_reference/data_mapper.template \
      <throwaway-data-mapper-workspace>
```

2. Build the current local `odd_sdlc.TS` source.

```bash
cd /Users/jim/src/apps/odd_sdlc/build_tenants/typescript
npm run build:semantic
```

3. Install the current local `odd_sdlc.TS` source into the new workspace.

```bash
cd /Users/jim/src/apps/odd_sdlc/build_tenants/typescript
ODD_SDLC_TS_OUTPUT=json \
node build/semantic/code/src/cli/main.js install \
  --target <throwaway-data-mapper-workspace> \
  --installed-package-name odd-sdlc-data-mapper-testXX \
  --package-source /Users/jim/src/apps/odd_sdlc/build_tenants/typescript \
  --abg-package-source /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript
```

This install command runs the ABG TypeScript installer as part of the
`odd_sdlc` install and writes both:

- `.abiogenesis/install-manifest.json`
- `.abiogenesis/odd_sdlc/typescript/install-manifest.json`

4. Change into the new workspace and run gap analysis first.

```bash
cd <throwaway-data-mapper-workspace>
node_modules/.bin/odd-sdlc-ts gaps --workspace .
```

5. Review the gap output before traversal.

6. Only then run the executable workflow path. Attach a real worker transport
for live traversal. Without `--worker`, `start` may fail closed at
`fp_worker_unattached`.

```bash
node_modules/.bin/odd-sdlc-ts start --workspace . --target next --until blocked --worker process://claude
```

For an autonomous loop, raise the stop condition explicitly:

```bash
node_modules/.bin/odd-sdlc-ts start --workspace . --target next --until converged --worker process://claude
```

7. Use the installed workspace guidance and RC projection surfaces rather than
legacy source-repo habits.

```bash
node_modules/.bin/odd-sdlc-ts rc-report
```

## Historical Note

Older Python bootstrap commands are historical evidence only. Do not use
`python -m odd_sdlc ...` as the current install/start path for new
`data_mapper.testXX` TypeScript RC runs unless you are explicitly reproducing an
older Python release line.

## Working Rule
Treat the imported `specification/` corpus as project truth to preserve. The goal is not to hand-normalize the project into a perfect fresh scaffold before running. The goal is to install the framework cleanly, observe how it orients, and use the run to expose real methodology or engine gaps.

If `gaps` reports convergence while release, test, deployment, runtime, or retrofit surfaces still state `pending_external_evidence`, treat that as an RC defect or an incomplete operational run, not as fully qualified delivery.
