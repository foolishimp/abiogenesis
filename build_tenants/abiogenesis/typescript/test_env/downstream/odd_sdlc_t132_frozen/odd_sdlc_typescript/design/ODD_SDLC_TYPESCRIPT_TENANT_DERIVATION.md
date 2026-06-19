# odd_sdlc TypeScript Tenant Derivation

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-041, REQ-F-ODDSDLC-042, REQ-F-ODDSDLC-043
**Derives From**: `specification/PRODUCT.md`, `specification/requirements/13-odd-sdlc-typescript-tenant.md`, `build_tenants/python/design/ODD_SDLC_ABG_BOUNDARY_AND_MODULE_TOPOLOGY.md`, `/Users/jim/src/apps/abiogenesis/specification/PRODUCT.md`

## Purpose

Define the TypeScript tenant topology before implementation.

This design translates Python-discovered SDLC behavior into ODD-native
TypeScript module boundaries. It does not authorize a Python file-by-file port.

## Consolidation Rule

Python is discovery evidence, not architectural instruction.

Before any Python behavior lands in the TypeScript tenant, module design must
classify the behavior into an ODD role:

- graph-function program truth
- domain carrier
- hook contract
- runtime adapter
- projection/read model
- triage decision
- operational command/result
- Spec Method entrypoint
- qualification proof

After classification, the implementation must look for local and global
optimization:

- local optimization removes mixed-concern files, duplicate carriers, helper
  wrappers, and imperative control flow inside a module boundary
- global optimization moves repeated workflow shape into graph functions,
  reusable carriers, projections, or hook contracts

Like-for-like Python movement is non-closure evidence. A direct port is lawful
only when the design review shows that the Python shape is already the minimal
ODD carrier shape.

## Generated Asset Assurance Rule

TypeScript build proof prefers ABG graph-function generated assets over copied
Python-created assets.

An asset counts as governed generated output only when the proof surface can
name:

- the published graph function that owns the traversal
- the ABG-selected edge or execution basis that opened the work
- the SDLC hook or worker contract used for construction
- the target binding and output identity
- the generated-asset contract attestation
- the work report and lineage record consumed by downstream closure

Copying a Python asset, preserving a Python file layout, or carrying trace tags
is not assurance by itself.

## Position

The governing shape is:

```text
operator
  -> odd_sdlc.TS adapter
  -> published SDLC graph function
  -> ABG execution basis and traversal
  -> SDLC hook for one selected edge
  -> ABG events and projection
  -> SDLC read model, triage, or next public-start admission
```

The unlawful shape is:

```text
TypeScript controller
  -> inspect workspace files
  -> decide current step
  -> run local service method
  -> decide next step
  -> present result as graph-function execution
```

That second shape is a shadow runtime.

## Module Topology

| Module group | Owns | May call ABG | May write workspace | May admit another traversal |
| --- | --- | --- | --- | --- |
| `graph/` | typed nodes, edges, graph functions, module publication, jobs | no | no | no |
| `domain/` | asset, worksite, capability, work-act, and operational evidence carriers | no | no | no |
| `workspace/` | source input admission, normalization carriers, project profile, install topology | no | bounded publication only | no |
| `runtime/` | ABIogenesis substrate adapter, execution-basis binding, event/projection consumption | yes | no | no |
| `start/` | public start request, target resolution, execution contract, worker attachment | yes through `runtime/` | no | one public boundary only |
| `hooks/` | SDLC F_D, F_P, and F_H hook contracts for one selected edge | no direct traversal authority | bounded target asset publication | no |
| `projection/` | query-domain, gaps, gap dossier, span analysis, asset ownership, requirement closure views | no | no | no |
| `triage/` | observation, gap classification, route binding, repricing proposal, ticket work-item routing | no | bounded product/ticket publication | only through public start policy |
| `operational/` | build/test/deploy/runtime-return command, result, and state projection carriers | no direct continuation authority | bounded evidence publication | no |
| `cli/` | command parsing and adapter binding | no direct ABG calls | no direct writes | no |
| `qualification/` | scenario, sandbox, live, and parity proof lanes | no production calls | test-only | no |

## Authority Rules

- Graph functions are source program truth.
- Graph-function typed surfaces are query/read models.
- Start targets bind operator intent to graph functions or governed assets.
- Asset ownership maps workspace assets back to governing graph functions.
- ABG owns internal graph-function iteration.
- SDLC hooks may construct, evaluate, or govern one edge traversal selected by
  ABG.
- Query and gap surfaces do not outrank GTL publication, admitted SDLC
  carriers, or ABG replay truth.
- Query-domain publication must structurally reconcile catalog-derived function,
  program, ownership, and start-target views against the admitted GTL module.
  Same-name graph functions with different inputs, outputs, vectors,
  declarations, or start-target bindings fail closed before publication.
- Public start may admit one boundary. It is not the internal iterate engine.

## Python Evidence Rule

Python modules are source material by behavior:

- `function_catalog.py`, `program_catalog.py`, and `gtl_module.py` inform graph
  publication.
- `normalization.py` and `project_profile.py` inform workspace admission.
- `public_start.py`, `start_targeting.py`, `execution_contract.py`, and
  `worker_attachment.py` inform public start.
- `constructor.py`, `fd_checks.py`, and `repair_frontier.py` inform SDLC hooks.
- `query.py`, `gap_dossier.py`, `span_analysis.py`, and `triage.py` inform
  projection and triage.
- `homeostatic_loop.py` and `work_item_routing.py` inform downstream repricing
  and ticket routing.
- `operational_dispatch.py` and `test_lane_evidence.py` inform operational
  command/result/projection carriers.

Python file boundaries are not TypeScript module law.

Python-discovered behavior may be retained only after this design has decided
which ODD carrier, graph function, projection, or hook owns it.

## First Implementation Sequence

1. package scaffold and strict lane
2. ABIogenesis substrate binding
3. domain asset/worksite carriers
4. GTL graph-function publication
5. workspace ingress and bootstrap lineage
6. query-domain and gap dossier projections
7. public start and execution contract
8. constructor/evaluator hooks
9. traceability, lineage, and requirement closure
10. homeostatic triage and ticket routing
11. operational transition and runtime return
12. RC qualification

## Test Categories

The TypeScript tenant uses two source categories for tests:

- unit and module-derived tests come from design and module authority. They
  prove carrier admission, graph publication, ABG adapter boundaries, hook
  contracts, projection purity, and deterministic closure behavior.
- UAT and scenario tests come from requirements and scenario authority. They
  prove operator workflows through composed application behavior.

Sandbox tests are the UAT class that exercises the deployed or installed
software through composed scenarios. Sandbox tests may be harnessed or live:

- harnessed sandbox tests use deterministic fixtures, fake workers, or
  controlled substrate bindings.
- live sandbox tests use an actual F_P worker, tool, or external runtime where
  the release claim depends on live probabilistic or operational behavior.

Required semantic closure must run from the declared source boundary. External
project fixtures, including the full `data_mapper.template` workspace, are
reference comparison, sandbox, or RC qualification evidence unless they are
captured by a checked-in fixture or explicit fixture manifest.

An RC claim may not rely on unit tests alone when it claims public SDLC
workflow behavior.

## Tenant Execution Contract Admission

The tenant execution contract is product authority over how test execution is
invoked. `test_execution_contract` and `tenant_test_execution_contract` are the
only project-constraints keys that may populate the effective
`testExecutionContract`. `test_runner` is a descriptive runner/tool label and
must not be promoted into an execution command.

| source key | admitted role | target |
| --- | --- | --- |
| `test_execution_contract` | concrete project execution command | `prepare_test_execution_surface` and `derive_test_execution_result_surface` |
| `tenant_test_execution_contract` | tenant-level execution command | effective project profile when project-level command is absent |
| `test_runner` | tool identity/read-model label | runner display, framework selection, or diagnostic context only |

This keeps the external tool boundary in GTL/ABG contract-law terms: the
product declares the command contract, the installed runtime executes it on the
selected edge, and `derive_test_execution_result_surface` records admitted
`sdlc_worker_execution_evidence`. A bare runner name such as `cargo`, `pytest`,
or `sbt` is not execution proof.

## Non-Ownership

The TypeScript tenant shall not:

- fork ABG runtime semantics
- choose internal next graph vectors outside ABG projection
- treat projections as source truth
- hide graph functions in service methods
- copy Python controller loops as architecture
- close requirements from trace-token presence alone
- treat command intent as operational result evidence
