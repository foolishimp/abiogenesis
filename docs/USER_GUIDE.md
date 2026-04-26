# GTL/ABG User Guide

**Status**: Current single human guide for GTL 3 / ABG 3.4.0-rc.2
**Audience**: People building, operating, or reviewing GTL/ABG applications
**Purpose**: Explain what GTL/ABG is for, what it builds, the technical GTL/ABG model, how the build loop works, what the runtime gives you, and how to run the current kernel

This is the single human guide. It combines operator orientation, builder
workflow, and technical reference material.

LLM agentic coders should be primed with
`LLM_GTL_APP_BUILDER_GUIDE.md`, which compresses this guide into an
agent-facing technical bootstrap surface.

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

## GTL Technical Reference

GTL is the declaration language.

ABG is the runtime that interprets and enforces GTL declarations.

GTL is:

- LLM-first
- graph-first
- algebraic
- declarative
- tenant-realized through concrete language surfaces such as Python and
  TypeScript

GTL does not own runtime execution state.

GTL owns:

- graph structure
- graph-function publication
- semantic work contracts
- policy-visible hook attachment
- evidence and closure expectations as declaration truth

ABG owns:

- traversal
- typed runtime carriers
- graph-call execution
- runtime event truth
- projection
- continuation opening and resolution
- proof and closure facts

### Core Thesis

The irreducible structural type of GTL is `Graph`.

The public callable carrier of GTL is `GraphFunction`.

`GraphVector` is internal structural truth inside a realized graph. It is not a
public work-entry surface.

`Job` binds published graph functions by identity.

The execution shape is:

```text
Job -> GraphFunction -> GraphCall -> materialized graph -> internal GraphVector traversal
```

### Regimes

GTL uses three regime markers across operators and evaluators:

| Regime | Meaning | Typical use |
| --- | --- | --- |
| `F_D` | Deterministic | checks, transforms, proofs |
| `F_P` | Probabilistic | constructive synthesis, bounded agentic work |
| `F_H` | Human | approval, adjudication, external action |

These regimes classify the ambiguity class of the work. They do not implement
policy by themselves.

### Core Types

`Attrs` is the immutable metadata carrier for public declaration surfaces. Use
it for graph-function declarations, graph-vector declarations, role policy
hooks, and module metadata.

`Context` is an externally located, snapshot-bound constraint dimension. Use it
when a graph boundary depends on an external artifact or environment surface
that should remain explicit in the declaration.

`Node` is a typed local locus of graph meaning. Common examples are `intent`,
`requirements`, `design`, `code`, `tests`, and `artifact`.

`GraphVector` is the internal adjacency record between typed nodes. It carries
transition-local truth: source, target, operators, evaluators, contexts,
optional rule, and declarations.

`Graph` is the named topology of nodes and graph vectors. Everything
structural in GTL is graph: one primitive step, one multi-step workflow, one
composed workflow, one refined workflow, or one recursive workflow.

`Operator` performs effectful work. Operators transform; they do not decide
convergence.

`Evaluator` judges whether a boundary converged. Evaluators judge; they do not
perform the constructive step.

`Rule` is passive governance attached to a boundary. Use it for static
guardrails and declarative control constraints, not as a hidden execution
program.

`TemplateRef` identifies the declared outer contract for a graph function.
Recursive and higher-order graph functions preserve that outer contract.

`GraphFunction` is the primary reusable GTL compute abstraction. It is named,
publishable, callable by identity, composable, recursion-capable, and
higher-order.

`RefinementBoundary` is the explicit lawful refinement or synthesis boundary.
Use it when one declared outer contract may be realized by multiple lawful
inner structures.

`CandidateFamily` publishes lawful graph-function alternatives over one outer
contract. Use it when selection among alternatives must remain explicit and
inspectable.

`Role` is the semantic capability class required to perform or supervise work.
It is not the same thing as a worker identity.

`ContractRef` is the indirection from a job to the GTL contract it binds. In
the GTL 3 line, semantic work contracts bind published graph functions by
identity.

`Job` is the durable semantic work contract. A job names work, binds one or
more published graph functions, declares required roles, and remains semantic,
not runtime-local.

`Module` is the publication boundary for GTL declarations. It publishes
graphs, graph functions, refinement boundaries, candidate families, jobs,
roles, rules, imports, and metadata.

### Graph-Function Algebra

GTL is not limited to single-edge wrappers.

The active algebra includes:

- graph-function composition
- graph-function recursion
- gating
- substitution and refinement
- higher-order graph-function application

The important rule is stable callable identity:

- recursion does not destroy the outer contract
- composition does not invent a second executor
- higher-order graph functions remain inspectable and publishable

### Hook Surfaces

GTL exposes hook attachment points. It does not define a policy mini-language.

The hook surfaces are:

- `GraphFunction.declarations`
- `GraphVector.declarations`
- `Role.policy_hooks`
- `CandidateFamily.policy_hints`

The lawful shape is:

```text
GTL declaration -> hook ref + replay-safe config
ABG admission   -> resolved carrier truth + executable implementation
Runtime         -> carrier-owned decision + evented enforcement
```

GTL does not own:

- prompt choreography
- hidden retry logic
- internal tactic selection for probabilistic workers

### Publication And Execution Boundary

The GTL side stops at declaration and publication.

ABG-compatible engines own:

- graph-call execution
- `ExecutionBasis`
- `AdvancementTransition`
- `IterationAdvanceDecision`
- `RegimeBindingSet`
- frame progression
- continuation truth
- runtime event emission
- proof and closure facts
- replay and projection

This means:

- GTL does not emit runtime facts
- GTL does not carry frame state
- GTL does not become a controller
- GTL does not reinterpret `F_D` / `F_P` / `F_H` runtime outcomes
- GTL does not use `runtime_config` as semantic runtime authority

### Minimal Authoring Shape

The exact syntax differs by tenant, but the authoring shape is stable:

```text
Node requirements
Node design

Operator draft_design classified as F_P
Evaluator design_checks classified as F_D

GraphVector requirements_to_design:
  source requirements
  target design
  operator draft_design
  evaluator design_checks
  declarative dispatch/proof/closure hooks

Graph design_graph:
  inputs requirements
  outputs design
  vectors requirements_to_design

GraphFunction design_fn:
  public callable carrier over design_graph

Job produce_design:
  contract graph_function:design_fn

Module example_module:
  publishes design_graph, design_fn, and produce_design
```

The important properties are:

- the public carrier is `GraphFunction`
- the job binds the graph function, not the vector
- hook attachment is declarative
- the graph vector remains internal structure

### Technical Design Rules

Use GTL well by following these rules:

- publish graph functions as the callable carrier
- keep graph vectors internal
- separate operators from evaluators
- attach policy declaratively
- use candidate families for explicit alternatives
- preserve inspectable outer contracts on composed and recursive graph
  functions
- keep semantic work contracts at the job layer
- let ABG own runtime fact truth
- let ABG own typed advancement and regime-binding truth

Avoid these mistakes:

- binding public work directly to graph vectors
- turning work vectors into a rival execution primitive
- hiding runtime law in ad hoc callbacks
- mixing semantic roles with runtime worker identity
- treating GTL declarations as imperative control code
- rebuilding advancement, policy, or regime meaning from open dictionaries

## ABG 3.4.0 RC Runtime Boundary

ABG 3.4.0 RC makes runtime law carrier and event owned.

Public work still starts from a semantic `Job` bound to a published
`GraphFunction`, but advancement truth is no longer reconstructed from service
return dictionaries or local controller state.

The runtime source carriers are:

- `ExecutionBasis`
- `AdvancementTransition`
- `IterationAdvanceDecision`
- `RegimeBindingSet`

In the TypeScript RC line, `start(...)` delegates to the M03-owned
`start -> iterate` runner. `publicStart(...)` remains as a compatibility
adapter over that path; it does not own a separate one-step advancement loop.

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

The public command-line grammar is tenant-invariant. Python, TypeScript, or
another tenant may use different executable prefixes, but the command suffix
after the binary stays the same.

```bash
<runtime-binary> start --workspace . --scope workspace --target next --until first_traversal
<runtime-binary> start --workspace . --scope workspace --target graph_function:code-flow --until first_traversal
<runtime-binary> start --workspace . --scope workspace --target asset:code_surface --until first_traversal
<runtime-binary> start --workspace . --scope workspace --target next --until converged --root-mode supervised
<runtime-binary> start --workspace . --scope workspace --target next --until converged --fh-mode human-proxy
```

For the Python installed runtime, `<runtime-binary>` is commonly
`PYTHONPATH=.genesis python -m genesis`. For a TypeScript installed runtime,
the package publishes `abiogenesis-ts` and `genesis-ts`; those binaries replace
only the executable prefix.

```bash
abiogenesis-ts start --workspace . --scope workspace --target next --until first_traversal
genesis-ts gaps --workspace . --scope workspace
genesis-ts assess-result --workspace . --result .ai-workspace/fp_results/<manifest-id>.json
```

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
These examples use the Python installed runtime prefix:

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

### Read `gaps` output

`gaps` is a read-only observation command. It must not start traversal or write
runtime events.

The TypeScript binary derives `gaps` from the installed runtime binding and
`.ai-workspace/events/events.jsonl`.

Key fields:

| Field | Meaning |
| --- | --- |
| `jobs_considered` | Semantic jobs included in the admitted scope. |
| `total_delta` | Sum of open-vector fractions across considered jobs. |
| `open_frames` | Replay-visible open frame count. |
| `converged` | True when all considered jobs are closed or contain no vectors. |
| `gaps[].edge` | Next open edge, or `null` when that job is closed. |
| `gaps[].status` | Current replay-derived state for that job. |
| `gaps[].next_step` | Next lawful operator action such as `start`, `assess-result`, `human-decision`, or `none`. |

The command exits successfully when it returns a valid observation, even when
open work remains. Admission or replay-projection defects still return
`status = error`.

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
