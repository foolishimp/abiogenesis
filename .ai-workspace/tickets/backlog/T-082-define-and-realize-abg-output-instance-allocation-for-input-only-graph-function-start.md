---
id: T-082
title: Define and realize ABG output instance allocation for input-only graph-function start
type: feature
ticket_category: runtime_output_allocation
status: backlog
goal: outcome-driven-development-runtime-materialization
change_intent: Make ABG able to start a graph function from declared input bindings and mint collision-safe output asset instance bindings and materialization roots without the caller predeclaring concrete output paths.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG start intent, execution basis, runtime binding, graph-function materialization provenance, output asset identity, F_P/F_D plugin handoff manifests, event/projection truth, CLI proof
priority: high
triaged_at: 2026-04-27T04:54:36Z
created_at: 2026-04-27T04:54:36Z
updated_at: 2026-04-27T04:54:36Z
dependencies:
  - T-072 completed
  - T-073 completed
  - T-081 completed
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
product_authority:
  - specification/PRODUCT.md LLM-First Product Identity
  - specification/PRODUCT.md Probabilistic Compute Boundary
  - specification/PRODUCT.md ABG product layer
  - specification/PRODUCT.md Public Operator Contract
intent_authority:
  - specification/INTENT.md convergence engine and gen-start operator intent
  - specification/INTENT.md first-class publication and materialization
  - specification/INTENT.md typed asset surfaces and graph-function materialization
candidate_requirement_authority:
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-IDENTITY.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
missing_requirement_truth:
  - ABG-owned input binding admission for graph-function start.
  - ABG-owned output instance allocation when graph-function outputs are declared but no concrete output asset binding is supplied.
  - Collision-safe invocation-local materialization root policy.
  - Replay-visible output allocation, output binding, and materialization provenance events.
  - Plugin handoff manifest contract carrying allocated output paths and forbidding writes outside them.
  - Projection surface that answers which output asset instances were minted by a graph-function run.
intake_source: Operator identified a missing outcome-driven-development capability: run a graph function from input start truth, let the graph function traverse internally, and have ABG create new output asset instances at non-colliding paths such as `<guid>/<graph-function-defined-paths>` rather than forcing the caller to predeclare every output path.
target_truth: A caller can start a published graph function with only declared input asset bindings. ABG admits the inputs, allocates invocation-local output asset identities and materialization roots from graph-function output declarations and domain-owned path templates, dispatches workers with those bindings, records allocation/provenance events, and projects the resulting output assets without path collisions or hidden harness truth.
superseded_truth: Callers, tests, or downstream harnesses must precompute every output path and asset ID before ABG can run a constructive graph function.
closure_law: close only when requirements are updated first, design/module surfaces define the allocation carriers and event/projection laws, implementation mints collision-safe output identities/roots through ABG-owned runtime truth, tests prove graph-function start with input-only bindings, and at least one sandbox proves a requirements-to-design-style traversal materializes output assets under a fresh invocation root.
non_closure_conditions:
  - output paths are hardcoded by a test harness or downstream worker prompt
  - output asset IDs are caller-authored rather than ABG-allocated
  - graph-function output declarations are ignored
  - ABG writes domain HOW or domain acceptance semantics into the allocation rule
  - allocation is not replay-visible through events and projections
  - path collision detection is absent or only best-effort
---

# T-082: Output Instance Allocation

## Problem

The current TypeScript ABG runtime can start and iterate a published graph
function, but the caller still has to supply concrete output paths and output
asset IDs in the surrounding harness or downstream worker prompt.

That weakens outcome-driven development. The intended operator shape is:

```text
gen-start graph_function:requirements_to_design
inputs:
  requirements_surface -> asset://...
outputs:
  auto
```

ABG should then create the invocation-local output asset instances and pass
those bindings to the worker/plugin. The caller should not have to know the
final `build_tenants/.../design` paths before the graph function runs.

## Why This Matters

Outcome-driven development depends on starting from declared outcome intent and
letting governed traversal create the next asset surface. If every caller must
predeclare concrete output IDs and paths, the framework drifts back toward
imperative orchestration and harness-owned path lore.

The powerful behavior is:

```text
input assets + graph function + policy-visible materialization profile
  -> ABG run identity
  -> output instance allocation
  -> worker/plugin handoff manifest
  -> materialized assets
  -> replay-derived projection
```

This lets graph functions behave like programs whose outputs are real asset
instances, not merely named types.

## Triage

This is a requirement reprice.

The product and intent surfaces already point at the capability:

- graph functions are product-real only when materializable from declared
  inputs and policy-visible parameters
- ABG owns graph-function materialization, runtime truth, provenance, and
  binding
- GTL owns output contracts and graph-function declarations
- downstream domains own domain path templates, domain HOW, and acceptance
  interpretation

The exact ABG requirement is still missing: ABG must own invocation-local output
instance allocation when start truth supplies inputs but omits concrete output
bindings.

## Required Requirement Work

Add or refine ABG requirement law for:

1. Input binding admission:
   `gen-start` may accept explicit input asset bindings for a graph-function
   invocation.
2. Output allocation:
   when graph-function outputs are declared and no concrete output binding is
   supplied, ABG mints fresh output asset identities and materialization roots.
3. Collision safety:
   ABG allocation roots must be invocation-local and non-colliding by
   construction, for example under a generated run/work/attempt root.
4. Domain boundary:
   ABG may allocate roots and bind declared output surfaces. Domains may provide
   graph-function-owned relative path templates or materialization profiles, but
   ABG must not own domain HOW or acceptance semantics.
5. Worker/plugin handoff:
   F_D/F_P/F_H plugins receive a manifest containing admitted inputs, allocated
   output bindings, allowed write roots, graph-function identity, run identity,
   and proof obligations.
6. Event truth:
   allocation, handoff, materialization observation, and postflight assessment
   must be replay-visible.
7. Projection truth:
   `gen-gaps`, live status, and runtime projection must answer which output
   asset instances were allocated, materialized, satisfied, blocked, or
   superseded.

## Target Design Shape

The design should keep the ownership split strict:

| Surface | Owner |
|---|---|
| graph-function input/output contract | GTL |
| runtime run/work/attempt identity | ABG |
| invocation-local allocation root | ABG |
| output asset IDs | ABG |
| relative materialization templates | GTL/domain product |
| worker internal construction strategy | F_D/F_P/F_H plugin |
| postflight proof interpretation | domain/product evaluator |
| event/projection truth | ABG |

Expected conceptual allocation:

```text
.ai-workspace/runtime/runs/<run-guid>/assets/
  <graph-function-name>/
    <output-node-name>/
      <graph-function-defined-relative-paths>
```

The exact path law should be designed, not assumed from this sketch.

## Minimal Proof Scenario

Create an ABG TypeScript sandbox scenario equivalent to:

```text
requirements_surface -> design_surface
```

Inputs:

- one admitted requirements asset binding
- a graph function declaring `requirements_surface` input and `design_surface`
  output
- no concrete design output path from the caller

Expected behavior:

- ABG starts the graph function
- ABG allocates a fresh non-colliding output root
- ABG emits output allocation/runtime events
- worker/plugin receives the allocated output binding
- plugin writes only under the allocated root
- postflight F_D verifies materialization
- projection reports the minted `design_surface` asset ID, URI/path, producing
  graph function, run identity, and status

## Open Design Questions

- Should output allocation be part of `StartIntent`, `ExecutionBasis`, or a
  subordinate `RuntimeAllocationPlan` derived immediately after basis
  admission?
- Should callers be able to override output allocation with explicit bindings,
  and if so how does ABG prove those paths are non-colliding and lawful?
- Should graph functions declare relative materialization templates directly,
  or should that remain a domain/product materialization profile referenced by
  graph-function declarations?
- What event kinds are needed: `output_instance_allocated`,
  `output_binding_admitted`, `output_materialization_observed`, or a smaller
  algebra?
- How should retry/correction supersede or reuse allocation roots?

## Design Module Method Bar

Before implementation, the ticket requires:

- structural carrier diagram for input binding, output allocation, handoff
  manifest, materialization observation, and projection
- IACS for the first slice
- explicit local/global optimization review to prevent another imperative
  harness or per-product path allocator
- module-derived unit tests for carriers and projections
- sandbox proof that uses public ABG start/iterate path rather than a
  test-local loop

## Non-Goals

- Do not make ABG own SDLC-specific path naming such as
  `build_tenants/typescript/design`.
- Do not make ABG judge whether a design is good.
- Do not bypass GTL graph-function output declarations.
- Do not let a worker write to arbitrary workspace paths and call that
  materialization.
- Do not use this ticket to add broad SDLC product behavior. This is ABG
  runtime allocation law.
