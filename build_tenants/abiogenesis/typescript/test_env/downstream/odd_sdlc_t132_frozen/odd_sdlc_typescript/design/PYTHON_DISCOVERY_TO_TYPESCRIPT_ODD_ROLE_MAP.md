# Python Discovery To TypeScript ODD Role Map

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-041
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `build_tenants/python/design/ODD_SDLC_ABG_BOUNDARY_AND_MODULE_TOPOLOGY.md`

## Purpose

Classify recent `odd_sdlc.python` functionality by ODD-native TypeScript role.

This map prevents two mistakes:

- losing Python-discovered behavior during the rebuild
- copying Python's imperative module layout as TypeScript architecture

It also forces the optimization step: once behavior is classified by ODD role,
the TypeScript design should consolidate duplicate workflow shape into graph
functions, shared carriers, projections, or hook contracts instead of
preserving the Python helper topology.

## Role Map

| Python source material | TypeScript role | Target module group |
| --- | --- | --- |
| `domain_model.py` | admitted asset, binding, function, and work-act carriers | `domain/` |
| `asset_types.py` | typed asset vocabulary and evaluation vocabulary | `domain/` |
| `software_domain_catalog.py` | software-domain asset families, work acts, edge contracts | `domain/`, `graph/` |
| `function_catalog.py` | named SDLC graph-function catalog entries | `graph/` |
| `program_catalog.py` | executive graph-function programs | `graph/` |
| `gtl_module.py` | GTL module publication and job binding | `graph/` |
| `normalization.py` | typed workspace ingress and normalization evidence | `workspace/` |
| `project_profile.py` | capability and project-constraint admission | `workspace/`, `domain/` |
| `imported_intent_carry_forward.py` | imported authority carry-forward | `workspace/`, `hooks/` |
| `public_start.py` | public start policy and ABG handoff | `start/` |
| `start_targeting.py` | target catalog and asset ownership resolution | `start/`, `projection/` |
| `execution_contract.py` | admitted execution-contract source carrier | `start/` |
| `worker_attachment.py` | F_P worker readiness and attachment | `start/` |
| `runtime_contexts.py` | domain context published into ABG manifest context | `runtime/`, `start/` |
| `runtime_event_contract.py` | ABG event projection for SDLC use | `runtime/`, `projection/` |
| `continuation.py` | ABG continuation adapter | `runtime/` |
| `constructor.py` | bounded SDLC constructor hook set | `hooks/` |
| `fd_checks.py` | deterministic preflight/postflight checks | `hooks/` |
| `fd_contracts.py` | deterministic proof contracts | `hooks/` |
| `repair_frontier.py` | deterministic repair-frontier evidence | `hooks/`, `projection/` |
| `traceability.py` | traceability derivation | `projection/` |
| `traceability_index.py` | traceability index read model | `projection/` |
| `traceability_report.py` | operator/report projection | `projection/` |
| `requirement_closure.py` | requirement closure register | `projection/` |
| `query.py` | query-domain projection aggregation | `projection/` |
| `query_contract.py` | query payload contract | `projection/` |
| `gap_dossier.py` | current gap dossier | `projection/` |
| `span_analysis.py` | bounded graph-span gap analysis | `projection/` |
| `triage.py` | gap classification and route proposal | `triage/` |
| `homeostatic_loop.py` | repricing proposal, application, loopback, retirement | `triage/` |
| `work_item_routing.py` | ticket/work-item route contracts | `triage/` |
| `operational_dispatch.py` | cooperative operational transition adapter | `operational/` |
| `test_lane_evidence.py` | test source and run evidence admission | `operational/`, `projection/` |
| `app.py` | split across Spec Method entrypoint, start, runtime, projection, workspace, and qualification adapters | not copied as one module |
| `__main__.py` | process launcher only | `cli/` |

## Translation Rule

The TypeScript implementation ticket for each role must state:

- source Python behavior used as evidence
- governing requirement/design authority
- target TypeScript carrier or graph function
- whether the module may write workspace state
- whether the module may call ABG
- whether the module may admit another traversal

If those answers are unclear, implementation must re-enter design before code
lands.

## Non-Translation Rule

A Python module name is never sufficient authority for a TypeScript module.

The TypeScript tenant should not preserve a Python boundary when that boundary
mixes:

- carrier vocabulary with filesystem effects
- projection construction with semantic closure
- public start with internal iteration
- triage classification with ticket publication
- F_D checks with F_P construction

Those mixed shapes must be decomposed at module design time and then
consolidated into ODD-native carriers or graph-function surfaces.
