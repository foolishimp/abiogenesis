# GTL/ABG User Guide

**Status**: Current GTL 3 / ABG 3.2.0 user guide
**Audience**: People building or operating GTL/ABG applications
**Purpose**: Explain what GTL/ABG is for, what it builds, how the build loop works, what the runtime gives you, and how to run the current kernel

## Why Build With GTL/ABG

Build with GTL/ABG when you need probabilistic LLM work to produce governed,
eventually deterministic, repeatable outcomes.

The value is deterministic governance over:

- what was declared
- what ran
- what evidence was produced
- what remained open
- what closed
- what must be corrected or superseded

Use GTL/ABG when the process matters, not only the artifact.

## What You Can Build

GTL/ABG is a good fit for:

- workflow-native applications
- governed internal tools
- agentic build systems
- evidence and approval pipelines
- delivery methods with explicit closure rules
- recursive work systems where one callable can lawfully open more work
- products where replay, audit, and correction matter

Examples:

- outcome-driven development systems
- design-to-code delivery loops
- compliance and proving workflows
- operational runbooks with bounded human escalation
- internal agent platforms with audit and correction

GTL/ABG is a poor fit for:

- static brochure sites
- simple CRUD apps with no meaningful workflow law
- products where audit, replay, and closure do not matter

## What You Are Building

You are building:

- a declared outcome or workflow model
- a graph-function catalog
- semantic work contracts over those graph functions
- runtime policy surfaces
- evented runtime truth
- evidence and closure lanes

The load-bearing split is:

- GTL declares the graph, graph functions, jobs, roles, and hook surfaces
- ABG executes graph calls, emits runtime facts, opens continuations, and
  projects what holds

## Installed Surface Ownership

One installed workspace may contain mixed-provenance surfaces.

Treat them by owner:

- project-owned authority
  - imported or authored `specification/*`
  - project `README.md`
- kernel-owned installed surfaces
  - `.genesis/*`
  - installed docs under `.genesis/docs/`
  - the generic GTL bootloader section written into `CLAUDE.md` / `AGENTS.md`
- domain-installer-owned surfaces
  - runtime-contract overlays such as `.odd_sdlc/release/genesis.yml`
  - domain governance preambles written into `CLAUDE.md` / `AGENTS.md`
  - generated workspace read models and normalization artifacts under
    `.ai-workspace/`

Use the highest-authority surface for the question you are answering:

- project identity and business meaning: project-owned authority
- GTL/ABG substrate law: kernel-owned surfaces
- workspace operation under a domain package: domain-installer-owned surfaces

Do not collapse these into one ownership bucket.

## Core Builder Model

The user-facing builder vocabulary is:

- **Outcome**
  - a declared state with explicit meaning and closure expectations
- **Transition**
  - a lawful move between outcomes
- **Graph Function**
  - the named callable carrier for constructive work
- **Work Vector**
  - the product view over one graph function or lawful graph-function
    composition
- **Policy Surface**
  - declarative config over evaluation, escalation, selection, proof, or
    closure
- **Runtime Fact**
  - emitted ABG event truth
- **Continuation**
  - one open runtime obligation derived from event truth
- **Proof Lane**
  - the declared proving path for a capability or closure claim

The important rule is:

`GraphFunction` is the callable carrier.

`GraphVector` remains internal realized structure.

## ABG 3.2.0 Runtime Boundary

ABG 3.2.0 makes runtime law carrier and event owned.

Public work still starts from a semantic `Job` bound to a published
`GraphFunction`, but advancement truth is no longer reconstructed from service
return dictionaries or local controller state.

The runtime source carriers are:

- `ExecutionBasis`
- `AdvancementTransition`
- `IterationAdvanceDecision`
- `RegimeBindingSet`

The primary event rule is unchanged:

- `emit()` is the lawful write boundary
- projections derive current truth by replay
- `runtime_config` is ingress/configuration input, not independent runtime law

## How You Build

The build loop is:

1. declare outcomes and transitions
2. publish named graph functions
3. attach policy, evidence, and closure surfaces
4. publish semantic jobs over graph functions
5. run one graph call
6. inspect the emitted runtime facts
7. correct, supersede, or reprice
8. prove the capability through scenarios

### 1. Declare outcomes and transitions

Start from the declared states that matter.

Define:

- what counts as an outcome
- what transitions are lawful
- what evidence or closure each outcome needs

### 2. Publish named graph functions

Express constructive work as named graph functions.

Invest in:

- clear callable names
- explicit outer contracts
- lawful composition
- lawful recursion where needed

Do not introduce a second execution primitive.

### 3. Attach policy and proof surfaces

Attach:

- evaluation policy
- escalation policy
- proof expectations
- closure expectations

Do this declaratively.

Do not hide runtime law in local controller code.

### 4. Publish semantic jobs

Publish semantic work contracts over graph functions.

Jobs name the durable work.

They do not become runtime controller objects.

### 5. Run a graph call

ABG opens runtime execution from the public graph-function carrier.

The public runtime path is:

```text
Job -> GraphFunction -> GraphCall -> ExecutionBasis -> AdvancementTransition -> events/projection -> proof -> closure
```

### 6. Inspect the runtime facts

After a run, the primary truth is the event stream.

Read what happened from:

- execution-basis and advancement-transition payloads
- runtime events
- graph calls
- frames
- continuations
- regime-binding outcomes
- proof and closure facts

Do not treat process return codes or chat summaries as the main truth.

### 7. Correct or supersede

If the run does not close lawfully:

- resolve an open continuation
- retry under policy
- supersede stale work
- reprice the declaration if the model is wrong

### 8. Prove

A capability is not real because the declaration exists.

It is real when:

- the significant paths are named
- the runtime facts are explainable
- the installed or runnable form proves the claim

## What You Get

You get more than application code.

You get:

- a declared graph-native application model
- a graph-function catalog
- semantic jobs and roles
- runtime fact truth
- replayable projections over runs, graph calls, frames, and continuations
- proof and closure facts
- correction and supersession paths
- written testcase authority and proof lanes

The output is both:

- the application behavior
- the governance and observability around that behavior

## What The UX Is

The GTL/ABG UX is artifact-first.

The primary operator surfaces are:

- **Define**
  - outcomes, transitions, graph functions, jobs
- **Build**
  - graph-function authoring and refinement
- **Run**
  - graph calls and active execution
- **Audit**
  - event stream, projections, proof, closure
- **Correct**
  - continuation resolution, supersession, retry, repricing
- **Prove**
  - scenarios, qualification, installed-dev evidence

The main objects on screen should be:

- outcomes
- graph functions
- runs
- graph calls
- continuations
- evidence
- proof status

The UX should show the lawful next move from runtime facts and keep the primary
operational surface in declared artifacts, runtime facts, and proof state.

## How To Run The Current Kernel

The live kernel in this repo is `abiogenesis`.

### Run from source

```bash
git clone https://github.com/foolishimp/abiogenesis.git
cd abiogenesis
PYTHONPATH=build_tenants/abiogenesis/python/code python -m genesis --help
```

Current commands:

- `start`
- `gaps`
- `emit-event`
- `assess-result`
- `check-tags`
- `check-req-coverage`
- `check-impl-coverage`
- `check-validates-coverage`
- `check-bootloader-consistency`

Common commands:

```bash
PYTHONPATH=build_tenants/abiogenesis/python/code python -m genesis gaps --workspace . --scope workspace
PYTHONPATH=build_tenants/abiogenesis/python/code python -m genesis start --workspace . --scope workspace --target next --until first_traversal
```

### Public `start` contract

The CLI command is `start`. The public operator contract is `gen-start`.

`start` accepts one traversal request. The request has three governing fields:

| Field | Values | Meaning |
| --- | --- | --- |
| `--scope` | `workspace`, `work_key:<id>` | Selects the work scope. |
| `--target` | `next`, `graph_function:<handle>`, `asset:<handle>` | Selects the public work target. |
| `--until` | `first_traversal`, `blocked`, `converged` | Selects the stop condition. |

Target meanings:

- `next` advances the next open job in scope.
- `graph_function:<handle>` selects one published graph-function carrier by handle.
- `asset:<handle>` resolves the handle through the published operator asset registry, then selects the governing graph-function carrier for that asset.
- Unknown, unsupported, unowned, or ambiguous targets fail closed.

Stop-condition meanings:

| `--until` | Use it when | Stops on |
| --- | --- | --- |
| `first_traversal` | You want one visible advancement and one manifest or fact surface. | First applied traversal, dispatch requirement, gate, blocker, or completed no-op. |
| `blocked` | You want ABG to run until a blocking condition is visible. | Dispatch requirement, human gate, proof hold, policy stop, or no lawful move. |
| `converged` | You want ABG to continue until the scoped work is closed or cannot lawfully continue. | Convergence, no work, proof hold, gate, policy stop, or runtime failure. |

Control modes stay outside `scope + target + until`:

| Mode | Values | Law |
| --- | --- | --- |
| `--fh-mode` | `direct`, `human-proxy` | Lawful only with `--until converged`. |
| `--root-mode` | `direct`, `supervised` | Lawful only with `--until converged`. |

The same arguments apply from source or from an installed runtime.
These examples use an installed runtime:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until first_traversal
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target graph_function:code-flow --until first_traversal
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target asset:code_surface --until first_traversal
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until converged --root-mode supervised
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until converged --fh-mode human-proxy
```

`asset:<handle>` requires an installed runtime contract that publishes `operator_asset_contract`.
The registry entry resolves the public asset handle to a published graph-function target.
The asset registry is operator-ingress truth; the selected traversal still runs through the graph-function carrier.

Proof-hold lives in resolved policy. When proof-hold is disabled, repeated proof failures remain event truth and do not stop `start` through the hold projection.

### Read `start` output

`start` writes one JSON object to stdout.

These fields carry the operator surface:

| Field | Meaning |
| --- | --- |
| `status` | Overall public result. Common values include `pending`, `in_progress`, `converged`, `nothing_to_do`, `blocked`, and `error`. |
| `target` | The admitted target string. |
| `asset_id` | Present for `asset:<handle>` when the registry resolves the handle. |
| `edge` | The selected graph edge when execution selects a traversal. |
| `stop_predicate` | The runtime stop reason projected from the typed advancement transition. |
| `fp_manifest_path` | Present when ABG dispatched F_P work and wrote a manifest. |
| `root_mode` | The admitted root control mode. |
| `root_supervision` | Present and true when `--root-mode supervised` admitted a supervised root run. |
| `live_status` | Present on supervised root output and some status surfaces. |
| `proof_hold_active` | Present when replay-derived proof-hold state blocks further public start progress. |

Typical stop predicates:

| `stop_predicate` | Operator action |
| --- | --- |
| `dispatch_required` | Open `fp_manifest_path`, do the requested F_P work, write the result JSON at the manifest `result_path`, then run `assess-result --result <path>`. |
| `human_gate_required` | Satisfy the human approval lane or rerun with lawful `--fh-mode human-proxy --until converged` when policy allows proxying. |
| `proof_hold` | Inspect `gaps --workspace . --scope workspace` and live status. Clear the underlying failed proof state through the scoped correction path before rerunning. |
| `converged` | Inspect the event stream and proof surfaces before treating the run as operationally closed. |
| `nothing_to_do` | Confirm the scope and target were correct. This means ABG found no lawful advancement in that scope. |

Process exit codes classify the same surface for scripts:

| Code | Meaning |
| --- | --- |
| `0` | Converged or nothing to do. |
| `1` | Command or runtime error. |
| `2` | F_P dispatch is pending. Read `fp_manifest_path`. |
| `3` | F_H gate is pending. Read the gate criteria in output. |
| `4` | Deterministic gap stopped advancement. |
| `5` | Iteration limit stopped convergence. |
| `6` | Constructive work yielded handoff truth. |
| `7` | Proof hold stopped redispatch. |

### Run targeted work

Use `next` for ordinary workspace advancement:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until first_traversal
```

Use a graph-function target when the operator already knows the published carrier:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target graph_function:code-flow --until first_traversal
```

When this selects F_P work, the output includes `fp_manifest_path`.
Read the manifest edge before writing the result:

```bash
python -m json.tool .ai-workspace/fp_manifests/<manifest-id>.json
PYTHONPATH=.genesis python -m genesis assess-result --workspace . --result .ai-workspace/fp_results/<manifest-id>.json
```

Use an asset target when the operator works from a published artifact handle:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target asset:code_surface --until first_traversal
```

The runtime contract must publish an `operator_asset_contract`.
The contract command must return registry JSON with an `assets` collection.
Each entry must identify the asset and its operator target.

Example registry entry:

```json
{
  "assets": [
    {
      "asset_id": "code_surface",
      "uri": "file://build/code",
      "operator_target": {
        "kind": "graph_function",
        "handle": "code-flow"
      }
    }
  ]
}
```

Use supervised root mode when the operator wants convergence control plus a live status surface:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until converged --root-mode supervised
```

The output includes `root_supervision: true` and a `live_status` object.

Use human-proxy mode only for convergence runs where the resolved policy allows F_H proxying:

```bash
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until converged --fh-mode human-proxy
```

`--fh-mode human-proxy` and `--root-mode supervised` are control modes.
They do not change the admitted `scope + target + until` traversal request.

### Install the kernel into another workspace

```bash
python build_tenants/abiogenesis/python/code/gen-install.py --target /path/to/project
```

That installs:

```text
/path/to/project/.genesis/
├── genesis/
├── gtl/
└── genesis.yml
```

Then run:

```bash
cd /path/to/project
PYTHONPATH=.genesis python -m genesis gaps --workspace . --scope workspace
PYTHONPATH=.genesis python -m genesis start --workspace . --scope workspace --target next --until first_traversal
```

## What To Inspect After A Run

Inspect these in order:

1. `.ai-workspace/events/events.jsonl`
2. projected run state
3. projected graph-call state
4. open continuations
5. proof and closure facts
6. selected manifest edge when `start` dispatches F_P work

Ask these questions:

- what graph function was called
- which `target` and `until` the command admitted
- whether `root_mode` or `fh_mode` changed the control path
- which manifest edge was selected
- which edge was dispatched or assessed
- what runtime facts were emitted
- what failed or remained open
- whether proof passed
- whether closure passed
- whether the run completed, failed, or was superseded

The post-mortem audit is the decisive operational surface.

## When Not To Use GTL/ABG

Do not use GTL/ABG because you want:

- a generic chatbot
- lightweight text generation with no governance
- a trivial app with no meaningful workflow law
- ad hoc automation with no need for audit or correction

Use GTL/ABG when you need:

- declared workflow structure
- graph-function-first execution
- evented runtime truth
- lawful correction
- replay
- proof of closure

## First Practical Path

If you are starting from zero, do this:

1. declare one small outcome graph
2. publish one named graph function
3. publish one semantic job over it
4. run one graph call
5. inspect the event log
6. add one proof lane

That is enough to tell whether the product should stay on GTL/ABG or whether a
simpler architecture would be better.
