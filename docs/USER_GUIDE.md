# Abiogenesis User Guide

**Status**: V2 skeleton
**Audience**: users running the current GTL 2.x / ABG 2.x Claude build
**Purpose**: explain the current runtime surface without carrying V1 terminology or deleted compatibility behavior

---

## 1. What Abiogenesis Is

Abiogenesis is the ABG runtime for GTL.

- **GTL** declares the topology:
  - typed `Node`s
  - `GraphVector`s between nodes
  - `Graph`s
  - reusable `GraphFunction`s
  - published `RefinementBoundary` and `CandidateFamily` declarations
  - `Job`s, `Role`s, `Evaluator`s, `Operator`s, and `Rule`s
- **ABG** executes that topology through:
  - an append-only event stream
  - replay/projection
  - deterministic convergence
  - traversal
  - selection application
  - correction/reset
  - provenance

The current build is explicitly V2:

| Old idea | Current surface |
|---|---|
| `Asset` | `Node` |
| `Edge` | `GraphVector` |
| `Package` | `Module` |
| hidden overlays / zoom | `CandidateFamily` + explicit `SelectionDecision` |
| ad hoc refinement | `RefinementBoundary` + lawful `substitute()` |

The important split is:

- **GTL** owns declaration
- **ABG** owns runtime protocol

---

## 2. Core Concepts

### GTL declaration types

The current authored surface is Python over these modules:

```python
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.function_model import GraphFunction, RefinementBoundary, CandidateFamily
from gtl.operator_model import Operator, Evaluator, Rule, F_D, F_P, F_H
from gtl.work_model import Job, ContractRef, Role
from gtl.module_model import Module
```

The main GTL concepts are:

- `Node`
  - typed local locus such as `requirements`, `design`, `code`
- `GraphVector`
  - internal adjacency record between nodes
  - carries operators, evaluators, contexts, and optional rule
- `Graph`
  - the one first-class structural type
- `GraphFunction`
  - reusable graph-valued workflow abstraction
- `RefinementBoundary`
  - published lawful refinement/synthesis boundary
- `CandidateFamily`
  - published lawful structural alternatives over one outer contract
- `Module`
  - publication boundary for graphs, functions, boundaries, families, jobs, roles, rules, metadata

### ABG runtime types

The main runtime types are:

- `Scope`
  - the first-class command scope
- `Traversal`
  - one named traversal attempt over one GTL target boundary
- `WorkSurface`
  - immutable execution dossier
- `EvaluatorOutcome`
  - one normalized evaluator result
- `ConvergenceResult`
  - aggregate convergence truth
- `SelectionDecision`
  - explicit, replayable candidate choice
- `Worker`
  - concrete runtime actor identity

### Evaluator regimes

Every evaluator belongs to one of three regimes:

| Regime | Meaning | Typical use |
|---|---|---|
| `F_D` | Deterministic | tests, schema checks, file checks, trace checks |
| `F_P` | Probabilistic | agent construction or bounded agent judgment |
| `F_H` | Human | explicit human judgment or approval |

The runtime escalates in this order:

`F_D -> F_P -> F_H`

Lower regimes should discharge objective truth before higher-regime judgment is used.

---

## 3. Install and Run

### Local editable install

```bash
cd /path/to/abiogenesis
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

After that you can use either:

```bash
gen start --help
```

or:

```bash
python -m genesis start --help
```

### CLI commands in the current build

The current runtime commands are:

- `gen gaps`
- `gen iterate`
- `gen start`
- `gen assess-result`
- `gen emit-event`
- traceability commands such as:
  - `gen check-tags`
  - `gen check-req-coverage`
  - `gen check-impl-coverage`
  - `gen check-validates-coverage`
  - `gen check-bootloader-consistency`

The GTL/ABG runtime no longer uses `--package` / `--worker` as the primary user-facing override.
The current CLI resolves a `Module`, and `Scope` derives a default `Worker` from that module when one is not explicitly injected programmatically.

---

## 4. First Session

The simplest way to run the engine is against an installed workspace or a workspace with a valid runtime contract.

If the workspace already has a configured module, the basic loop is:

```bash
gen gaps --workspace .
gen iterate --workspace .
gen start --workspace . --auto
```

If you want to bypass the runtime contract and point directly at a module:

```bash
gen gaps --workspace . --module some_python_module:module
```

### What the commands do

`gen gaps`
- resolves `Scope`
- runs deterministic binding over the scoped jobs
- reports residual work
- emits `edge_converged` certificates when a scoped edge is freshly confirmed at delta 0

`gen iterate`
- finds the first unconverged work item in scope
- constructs a `Traversal`
- runs `traverse()` exactly once

`gen start`
- derives state
- delegates to `gen_iterate`
- with `--auto`, loops until:
  - converged
  - blocked on `F_P`
  - blocked on `F_H`
  - blocked on a deterministic gap
  - max iterations reached

---

## 5. Runtime Contract and Config Resolution

The CLI resolves configuration through the runtime contract chain.

### Resolution order

1. CLI `--module` if supplied
2. `.genesis/genesis.yml`
3. if `.genesis/genesis.yml` contains `runtime_contract: <path>`, that file becomes authoritative

The current loader behavior is:

- read `.genesis/genesis.yml`
- if it contains `runtime_contract`, read that file instead
- use that final config to resolve:
  - `module`
  - optional `pythonpath`
  - optional `active_workflow`
  - optional `workflow_root`

### Minimal kernel config

The kernel installer writes only a minimal default:

```yaml
# Genesis kernel default — written by gen-install.py
# runtime_contract: path/to/domain/genesis.yml
# module: your_domain.module:module
```

The kernel does **not** own your domain binding.
Domain installers or the workspace owner supply the actual runtime contract.

### Example domain runtime contract

```yaml
module: my_domain.spec:module
pythonpath:
  - build_tenants/<family>/<variant>/src
active_workflow: .genesis/workflows/my_domain/default/v0_1_0/active-workflow.json
workflow_root: .genesis/workflows
```

---

## 6. Writing a Minimal GTL Module

The current V2 authored unit is a `Module`, not a `Package`.

Minimal example:

```python
from gtl.graph import Graph, Node, GraphVector
from gtl.algebra import deferred_refinement
from gtl.module_model import Module
from gtl.operator_model import Operator, Evaluator, F_D, F_P
from gtl.work_model import ContractRef, Job, Role


requirements = Node(name="requirements")
design = Node(name="design")

agent = Operator("claude_agent", F_P, "agent://claude/genesis")

eval_shape = Evaluator(
    "design_shape_valid",
    F_D,
    "design artifact matches the required structural standard",
    binding="exec://python checks/check_design.py",
)

eval_quality = Evaluator(
    "design_quality",
    F_P,
    "agent judges whether the design is coherent and complete",
)

vector = GraphVector(
    name="requirements→design",
    source=requirements,
    target=design,
    operators=(agent,),
    evaluators=(eval_shape, eval_quality),
)

graph = Graph(
    name="mini_flow",
    inputs=(requirements,),
    outputs=(design,),
    nodes=(requirements, design),
    vectors=(vector,),
)

role_designer = Role(name="designer")

job = Job(
    name="requirements→design",
    contracts=(ContractRef(kind="graph_vector", target_id=vector.id),),
    roles=(role_designer,),
)

boundary = deferred_refinement(
    "requirements→design",
    inputs=(requirements,),
    outputs=(design,),
)

module = Module(
    name="mini_domain",
    graphs=(graph,),
    refinement_boundaries=(boundary,),
    jobs=(job,),
    roles=(role_designer,),
)
```

Important current rules:

- every live `GraphVector` must publish a `RefinementBoundary` or `CandidateFamily`
- structural alternatives must be published through `CandidateFamily`
- `Module` is a pure declaration container
- module-level traversal validation happens in kernel functions such as `validate_module_traversal_surface()` at `Scope` construction, not automatically in `Module.__post_init__`

---

## 7. Installing Into Another Project

Use the kernel installer when you want a self-contained runtime under a target workspace.

```bash
python /path/to/abiogenesis/build_tenants/abiogenesis/python/code/gen-install.py \
  --target /path/to/project
```

### What the current installer actually does

1. copies engine modules into `<target>/.genesis/genesis/`
2. copies GTL modules into `<target>/.genesis/gtl/`
3. writes a minimal kernel `.genesis/genesis.yml` if it does not already exist
4. ensures `<target>/.ai-workspace/runtime/` exists
5. creates or updates `<target>/CLAUDE.md` with the GTL bootloader block
6. emits `genesis_installed` into `<target>/.ai-workspace/events/events.jsonl`

### What it does not do

The current installer does **not**:

- generate a starter domain module
- copy a domain `gtl_spec` package into the target
- write a concrete domain `module:` binding for you
- call `workspace_bootstrap()` as part of installation

That is deliberate. The kernel installer installs the kernel.
Domain installers own domain runtime contracts and domain package layout.

### Verify an install

```bash
python /path/to/abiogenesis/build_tenants/abiogenesis/python/code/gen-install.py \
  --target /path/to/project \
  --verify
```

---

## 8. Workspace Layout

The runtime uses `.ai-workspace/` as evidence and coordination territory.

Typical layout:

```text
.ai-workspace/
├── events/
│   └── events.jsonl
├── fp_manifests/
├── fp_results/
├── features/
│   ├── active/
│   └── completed/
├── reviews/
│   ├── pending/
│   └── proxy-log/
├── comments/
│   └── claude/
├── agents/
└── runtime/
```

### Important distinction

- `genesis_installed` is emitted by the real installer
- `workspace_bootstrap()` only scaffolds `.ai-workspace/` directories and binds the event stream

### Event stream

`events.jsonl` is append-only runtime truth.

Typical event families:

- installer/runtime:
  - `genesis_installed`
  - `run_bound`
  - `run_started`
  - `edge_started`
- convergence:
  - `found`
  - `fp_dispatched`
  - `assessed`
  - `edge_converged`
  - `fh_gate_pending`
- structural evolution:
  - `workflow_selected`
  - `work_spawned`
- correction:
  - `reset`

Do not edit the event log manually.

---

## 9. The Working Loop

The standard loop is:

```bash
# 1. Inspect residual work
gen gaps --workspace .

# 2. Run one traversal step
gen iterate --workspace .

# 3. Or let the state machine loop until blocked
gen start --workspace . --auto

# 4. Inspect emitted evidence
tail -20 .ai-workspace/events/events.jsonl
```

Typical blocking conditions:

- `blocking_reason: fp_dispatch`
  - an `F_P` manifest was written
  - an external actor or test harness should produce a result and ingest it with `gen assess-result`
- `blocking_reason: fh_gate`
  - an `F_H` gate is pending
- `blocking_reason: fd_gap`
  - deterministic failure exists and must be fixed before escalation

The workspace is at rest when `gen gaps` reports:

- `converged: true`
- `total_delta: 0`

---

## 10. Traceability and Checks

The current build includes traceability utilities:

```bash
gen check-tags --type implements --path build_tenants/abiogenesis/python/code
gen check-tags --type validates --path build_tenants/abiogenesis/python/test_env/tests
gen check-req-coverage --package some_module:module --features .ai-workspace/features
gen check-impl-coverage --package some_module:module --path build_tenants/abiogenesis/python/code
gen check-validates-coverage --package some_module:module --path build_tenants/abiogenesis/python/test_env/tests
gen check-bootloader-consistency --spec-module gtl --bootloader build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md
```

Use these to verify:

- requirement tags exist in code
- requirement tags exist in tests
- feature vectors cover published requirements
- bootloader language is still consistent with the exported GTL surface

---

## 11. Shipped Examples

Useful examples in this repo:

- current project module:
  - [abiogenesis.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py)
- project-package example:
  - [project_package.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl_spec/packages/project_package.py)
- GTL bootloader source:
  - [GTL_BOOTLOADER.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md)
- interface contracts:
  - [GTL_2_INTERFACE_CONTRACTS.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md)
- module design:
  - [GTL_2_MODULE_DESIGN.md](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md)

If you want a realistic V2 module example, start with `abiogenesis.py`, not older V1 package-style examples.

---

## 12. Current Limitations

- This guide is intentionally rebuilt as a V2 skeleton.
  - It is accurate to the current runtime surface, but not yet exhaustive.
- Real `F_H` infrastructure is not the center of current qualification work.
  - The runtime supports `F_H`, but most current sunny-day scenario proof is concentrated on `F_D` and `F_P`.
- Domain installers are still domain-owned.
  - The kernel installer does not scaffold domain modules for you.
- The runtime contract is stricter than older docs implied.
  - explicit `Module`
  - explicit traversal surface
  - explicit selection for `CandidateFamily`
  - explicit domain runtime contract when not using `--module`

When in doubt, prefer:

1. requirements
2. accepted design
3. current code

over older V1-era prose.
