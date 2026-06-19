# Data Mapper: Project Genesis Reference Template

## Overview
This is the canonical template for the **Categorical Data Mapping & Computation Engine (CDME)**. It is a moderate-complexity inherited specification corpus used to pressure **genesis_sdlc** and **abiogenesis** against a non-normalized real project shape.

The project is mathematically grounded in Category Theory and requires strict adherence to invariants such as path validation, grain safety, and type unification.

## Contents
- `specification/`: the inherited project truth. Contains `INTENT.md`, `REQUIREMENTS.md`, the generic imported-source ledger, and the domain-specific `mapper_requirements.md`.
- `.ai-workspace/context/project_constraints.yml`: project-local constraints carried into new test runs.

## RC Validation Operating Model
- This README is the template-side reference for how to interpret and run the `data_mapper.testXX` series.
- Do not inject these rules into `AGENTS.md` or `CLAUDE.md` for copied test workspaces; installed runs should still experience the normal workspace bootloader and runtime guidance.
- `data_mapper.template` is the preserved project authority and the seed for fresh RC validation runs.
- `data_mapper.testXX` is a clean installed workspace for a specific RC, but once installed it should be operated as a real live governed system, not as a toy test harness with special pleading.
- Use the `data_mapper.testXX` result as evidence of what that RC actually did under normal operating assumptions.
- `/Users/jim/src/apps/odd_method` is the current `odd_sdlc` RC source. If `data_mapper.testXX` exposes a framework or runtime bug, patch there rather than editing the installed run.
- `/Users/jim/src/apps/odd_method/build_tenants/odd_sdlc/python/test_env/tests` are release-record tests. Use them to understand prior releases and regressions, not as the place to patch a live RC diagnosis.
- After install, prefer the installed workspace bootloader plus `.ai-workspace/context/project_bootstrap.md` and runtime registers over legacy README instructions if they disagree.

## Why This Template Matters
This template is useful precisely because it is not already shaped to the current `genesis_sdlc` scaffold. It tests whether the framework can:
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
Use this procedure for older `genesis_sdlc` runs such as `data_mapper.testXX` on that line.

For the current `odd_method` / `odd_sdlc` line, use the active RC installer and the installed workspace bootloader generated into the new run. Treat the commands below as historical provenance unless they match the current installed runtime guidance.

1. Copy this checked-in fixture into a throwaway workspace under the current
   test run archive. Do not read from or write to `ai_sdlc_examples` template
   roots for internal scenarios.

2. Install the current local `genesis_sdlc` source into the new workspace.

```bash
python /Users/jim/src/apps/genesis_sdlc/build_tenants/abiogenesis/python/src/genesis_sdlc/release/install.py \
  --target <throwaway-data-mapper-workspace> \
  --source /Users/jim/src/apps/genesis_sdlc \
  --project-slug data_mapper_testXX
```

3. Change into the new workspace and run gap analysis first.

```bash
cd <throwaway-data-mapper-workspace>
PYTHONPATH=.gsdlc/release:.genesis python -m genesis gaps --workspace .
```

4. Review the gap output before traversal.

5. Only then run the executable workflow path.

```bash
PYTHONPATH=.gsdlc/release:.genesis python -m genesis start --auto --human-proxy --workspace .
```

## Working Rule
Treat the imported `specification/` corpus as project truth to preserve. The goal is not to hand-normalize the project into a perfect fresh scaffold before running. The goal is to install the framework cleanly, observe how it orients, and use the run to expose real methodology or engine gaps.
