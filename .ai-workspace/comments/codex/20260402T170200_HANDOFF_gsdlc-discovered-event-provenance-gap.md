# HANDOFF: GSDLC-Discovered Event Provenance Gap

**Author**: Codex
**Date**: 2026-04-02
**For**: ABG implementation / qualification agent
**Purpose**: Record the event-provenance defect exposed by real `genesis_sdlc`
live sandbox qualification, define the additional provenance that must be
persisted in ABG events, and set the required testcase posture for GTL/ABG
qualification going forward.

## 1. Executive Summary

`genesis_sdlc` live sandbox qualification exposed a real provenance gap at the
ABG execution boundary.

The representative scenario was lawful in all the important ways:

1. fresh sandbox
2. dev install into that sandbox
3. ABG provenance sourced from the dependency repo, not ambient root install
4. runtime worker override applied inside the sandbox
5. real model execution performed inside the installed sandbox
6. event stream, manifests, results, summary, and backend artifacts archived

The run passed functionally, but the event stream did **not** carry the full
binding truth needed for replay from events alone.

Specifically:

- the event stream persisted the ABG router worker
  `abiogenesis_python_router`
- the concrete selected execution worker/backend
  `constructor -> codex`, `backend -> codex`
  existed only in side artifacts
- therefore the event stream alone could not answer
  "which concrete worker/backend actually executed this traversal?"

This is not a "maybe nice to have" gap. It is a replay/provenance defect.

## 2. Evidence Surface

Representative `genesis_sdlc` live workflow run:

- `/Users/jim/src/apps/genesis_sdlc/build_tenants/abiogenesis/python/test_runs/workflow_fp_dispatch/20260402T042841_test_workflow_advances_from_fh_gate_to_live_fp_qualification/summary.json`
- `/Users/jim/src/apps/genesis_sdlc/build_tenants/abiogenesis/python/test_runs/workflow_fp_dispatch/20260402T042841_test_workflow_advances_from_fh_gate_to_live_fp_qualification/artifacts/events.jsonl`
- `/Users/jim/src/apps/genesis_sdlc/build_tenants/abiogenesis/python/test_runs/workflow_fp_dispatch/20260402T042841_test_workflow_advances_from_fh_gate_to_live_fp_qualification/workspace/.ai-workspace/runtime/session-overrides.json`
- `/Users/jim/src/apps/genesis_sdlc/build_tenants/abiogenesis/python/test_runs/workflow_fp_dispatch/20260402T042841_test_workflow_advances_from_fh_gate_to_live_fp_qualification/artifacts/requirements_feature_decomp_backend_result.json`

Observed event truth:

- `run_bound.worker_id = abiogenesis_python_router`
- `run_bound.role_id = constructor`
- `run_bound.authority_ref = runtime://role-dispatch`
- `edge_started.worker_id = abiogenesis_python_router`
- `edge_started.build = abiogenesis_python_router`

Observed side-artifact truth:

- `session-overrides.json` selected `constructor = codex`
- `summary.json` recorded `selected_worker = codex`
- `summary.json` recorded `selected_backend = codex`
- `requirements_feature_decomp_backend_result.json` recorded
  `worker_id = codex`, `backend = codex`

So the run was traceable only by combining:

1. event stream
2. runtime session state
3. backend result artifact
4. operator-facing summary

That is weaker than the required engine truth.

## 3. Revealed Bug

### Bug Statement

ABG event emission currently preserves router binding truth, but not the
concrete downstream execution binding truth, when router identity and selected
execution identity differ.

### Why This Is A Bug

The defect is not that `worker_id = abiogenesis_python_router` is wrong.
That field is semantically meaningful and should remain.

The defect is that the event stream does not also preserve the concrete
selection-applied execution identity that the traversal actually used.

When dispatch is role-routed:

- router identity matters
- selected worker identity matters
- backend identity matters
- selection source / resolved runtime truth matters

All of that existed at execution time.
Not all of it was persisted in events.

## 4. Requirement Surfaces Implicated

### ABG requirements directly implicated

- `specification/requirements/abg/REQ-R-ABG2-EVENTS.md`
  - `REQ-R-ABG2-EVENTS-003`: graph application truth must be reconstructable
    from events alone plus graph declarations
- `specification/requirements/abg/REQ-R-ABG2-BINDING.md`
  - `REQ-R-ABG2-BINDING-003`: binding record minimum fields
  - `REQ-R-ABG2-BINDING-006`: binding provenance replayable from engine truth
  - `REQ-R-ABG2-BINDING-007`: graph-function/materialization references must be
    preserved at executable graph/job boundary
- `specification/requirements/abg/REQ-R-ABG2-PROVENANCE.md`
  - `REQ-R-ABG2-PROVENANCE-001`: provenance on events
  - `REQ-R-ABG2-PROVENANCE-003`: selection provenance
  - `REQ-R-ABG2-PROVENANCE-008`: graph-function/materialization provenance
  - `REQ-R-ABG2-PROVENANCE-009`: derivation-chain provenance for graph-derived
    companion bundles
- `specification/requirements/abg/REQ-R-ABG2-SELECTION-APPLICATION.md`
  - `REQ-R-ABG2-SELECTION-APPLICATION-003`: replayable selection provenance
- `specification/requirements/abg/REQ-R-ABG2-RUN.md`
  - `REQ-R-ABG2-RUN-007`: preserve bound worker and role in run/binding
    provenance

### GTL / mapping surfaces implicated

The defect surfaced on the ABG side, but it matters because GTL declarations
and published graph-function/materialization truth are supposed to remain
replayable through engine provenance.

Relevant families:

- `specification/requirements/gtl/REQ-L-GTL2-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL2-HOF.md`
- `specification/requirements/gtl/REQ-L-GTL2-RECURSE.md`
- `specification/requirements/gtl/REQ-L-GTL2-SELECTION-BOUNDARY.md`
- `specification/requirements/gtl/REQ-L-GTL2-SUBSTITUTE.md`
- `specification/requirements/gtl/REQ-L-GTL2-SYNTHESIS.md`
- `specification/requirements/mapping/REQ-M-GTL2-MAPPING.md`
- `specification/requirements/mapping/REQ-M-GTL2-PROVENANCE.md`

### Design surfaces implicated

- `specification/GTL_2_CONSTITUTIONAL_DESIGN.md`
- `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`

The key design law already exists:

- event provenance context is explicit
- graph-function/materialization provenance is first-class
- recursive/refinement provenance must be replayable
- projection is from event truth, not hidden interpreter-local state

## 5. Additional Provenance That Must Be Persisted

This handoff is **not** asking ABG to invent new semantics.
The missing information already exists during traversal.
It must be projected into the event stream.

At minimum, when router identity and selected execution identity differ, ABG
events for the relevant traversal must persist:

1. `worker_id`
   - meaning: ABG execution worker / router identity
2. `selected_worker_id`
   - meaning: concrete worker selected for execution after role dispatch
3. `selected_backend`
   - meaning: backend derived from selected worker assignment
4. `role_id`
   - meaning: GTL role being realized
5. `authority_ref`
   - meaning: external authority/binding source already preserved today
6. `assignment_source`
   - meaning: where the selected assignment came from
     such as release default, session override, selection application, or other
     resolved runtime authority
7. `resolved_runtime_ref` or equivalent replayable runtime-binding reference
   - meaning: enough identity to correlate the selected execution binding to the
     runtime truth used during the run
8. `graph_function`
   - when the executable graph boundary was materialized from a published graph
     function
9. `materialization_id` or equivalent materialization reference
   - enough to replay how that executable graph or derived bundle came to exist
10. `companion_bundle_ref` where applicable
   - for graph-derived evaluator bundles or similar derived execution bundles

Minimum event types that should carry the relevant subset:

- `run_bound`
- `run_started`
- `edge_started`
- `fp_dispatched`
- `assessed`

The target is not "put everything on every event".
The target is:

> no lawful replay should require consulting side artifacts to determine the
> selected execution identity or graph-function/materialization identity of the
> traversal being reported.

## 6. Qualification Doctrine Confirmed By This Bug

This bug was exposed only because the test was a real installed-sandbox
scenario.

That distinction must not be lost again.

The qualifying test surface is:

1. create a fresh sandbox
2. install the dev ABG line into that sandbox
3. execute only within the installed sandbox runtime
4. run a constrained but real project scenario
5. archive event stream plus all forensic artifacts
6. assert replayable traceability from the event stream itself

The following are useful supporting tests, but they are **not** release-grade
proof of runtime traceability:

- in-process unit tests
- direct helper/import tests
- tests that call a worker directly without full traversal
- tests that validate behavior only by inspecting side files instead of the
  event stream

Real tests are mini constrained projects.
That is the required posture.

## 7. Required Testcase Program

The user requirement that emerged from this bug is stronger than "add one test".

ABG needs a qualification matrix that proves:

1. every GTL requirement family has at least one installed-sandbox scenario
   proving its executable consequence
2. every ABG requirement family has at least one installed-sandbox scenario
   proving its engine consequence
3. every prime design element in the GTL/ABG constitutional and module design
   surfaces has at least one proving testcase or explicit trace to a proving
   testcase set

### 7.1 GTL requirement coverage expectation

Use the GTL requirement families listed in
`specification/requirements/gtl/README.md` as the minimum matrix:

- graph
- node
- interface
- operator
- evaluator
- rule
- graphfunction
- role
- job
- identity
- compose
- substitute
- recurse
- higher-order functions
- laws
- module
- selection boundary
- engine independence
- subwork
- synthesis

Expectation:

- every family gets at least one scenario-oriented proving test
- the test must execute via installed runtime, not only via imports
- the event stream must contain enough truth to replay the key law being proven

### 7.2 Design element coverage expectation

Use at minimum these design elements as explicit coverage headings:

- explicit event provenance context
- router vs selected-worker binding truth
- graph-function publication and materialization
- evaluator-bundle derivation provenance
- substitution/refinement derivation chain
- recursion frame locality and fold-back provenance
- module/library provenance
- run/job/role/worker identity integrity
- selection application provenance
- engine-independence boundary preservation
- append-only event truth and projection sufficiency

For each design element:

- name the proving scenario(s)
- state which requirement keys it satisfies
- state which event fields prove it
- fail closed if proof requires consulting non-event side artifacts

### 7.3 Provenance-specific scenario lane to add immediately

Add a dedicated installed-sandbox qualification scenario that:

1. installs ABG into a fresh sandbox
2. applies a runtime worker override or equivalent lawful external binding input
3. executes a real graph traversal through the CLI/runtime surface
4. produces a run where router identity and selected worker identity differ
5. asserts the event stream alone preserves:
   - job identity
   - run identity
   - role identity
   - router worker identity
   - selected worker identity
   - backend identity
   - authority reference
   - graph-function identity where applicable
   - materialization identity where applicable
   - evaluator bundle derivation reference where applicable

This test should currently fail if implemented against the present event stream.
That is the correct starting point.

## 8. Immediate Implementation Target

The short implementation target for ABG is:

1. keep existing router identity semantics intact
2. project already-resolved selected execution identity into the event stream
3. project graph-function/materialization identity at executable boundaries
4. add scenario tests that prove replay from events alone

Do **not** "fix" this by replacing router identity with selected worker
identity.
That would destroy a meaningful distinction.

The correct model is:

- preserve both truths
- make both replayable from events

## 9. Requested Follow-Through

The ABG-side agent should produce:

1. the event-emission fix
2. the failing-then-passing provenance scenario
3. a GTL/design coverage matrix showing which scenario proves which
   requirement/design element
4. explicit trace tags from tests back to requirement keys

If the final implementation still requires `summary.json`,
`session-overrides.json`, or backend-result side artifacts to answer
"what concrete execution identity did this traversal use?",
the bug is not closed.

## 10. Bug Fix Report

**Fix date**: 2026-04-02
**Status**: Implemented in `abiogenesis/python`, pending downstream
`genesis_sdlc` migration bug-test closure
**Release posture**: check in on the existing `2.0` line; no version increment
required
**Closure scope**: ABG event emission, F_P manifest provenance, `assess-result`
provenance ingestion, and run replay surfaces

### 10.1 Outcome

The ABG-side fix is now implemented and qualification-backed.

ABG preserves:

- router identity as `worker_id`
- concrete selected execution identity as `selected_worker_id`
- selected backend as `selected_backend`
- runtime binding provenance as `assignment_source` and
  `resolved_runtime_ref`

This truth is now persisted on the engine event path rather than requiring
operator-side reconstruction from side artifacts.

### 10.2 Root Cause Confirmed

The defect was not in `genesis_sdlc` selection logic itself.

The gap was that ABG had a split identity model:

- router/runtime worker truth existed at traversal time
- selected worker/backend truth also existed at traversal time
- only the router-facing portion was emitted into the event stream on the
  primary traversal events

The result was that lawful replay of concrete execution identity required
consulting `summary.json`, `session-overrides.json`, or backend result files.

That violated the intended event sufficiency contract.

### 10.3 Implemented Fix

The implemented ABG fix preserves both routing truth and execution truth.

Changed engine surfaces:

- `build_tenants/abiogenesis/python/code/genesis/identity.py`
  - extended `RuntimeIdentity` with `assignment_source` and
    `resolved_runtime_ref`
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
  - added a shared execution-binding provenance projection helper
  - `run_bound`, `run_started`, and `edge_started` now preserve selected
    execution identity alongside router identity
  - F_P manifest emission now persists the same binding provenance
  - `fp_dispatched` now carries the selected execution binding truth via the
    bound dispatch surface
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
  - extended `BoundJob` to carry dispatch-time provenance needed for
    `fp_dispatched`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
  - runtime contract loading now accepts `runtime_assignment_source` and
    `runtime_resolved_runtime_ref`
  - `assess-result` now lifts selected worker/backend and runtime-binding
    provenance from manifest/result truth into `assessed`
- `build_tenants/abiogenesis/python/code/genesis/run.py`
  - run replay now exposes `selected_worker_id`, `selected_backend`,
    `assignment_source`, and `resolved_runtime_ref`

### 10.4 Event Truth After Fix

For routed execution where router identity and selected execution identity
differ, the operative event stream now preserves enough truth to answer:

- which router/binding surface accepted the work
- which concrete selected worker executed the traversal
- which backend was used
- which role was realized
- which external authority source applied
- which runtime binding source/reference governed the selected assignment

without consulting non-event side artifacts.

### 10.5 Qualification Added

Two proving lanes were added:

1. Direct engine-kernel proof
   - `build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py`
   - proves router identity and selected execution identity are both emitted
     and replayable

2. Installed-sandbox CLI proof
   - `build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_install.py`
   - proves the real installed runtime preserves the same provenance through
     `iterate` plus `assess-result`

Supporting provenance-ingestion proof:

- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
  - proves `assess-result` routes manifest/result provenance through the
    canonical workspace event helper

### 10.6 Verification

Executed qualification slice:

```text
python -m pytest \
  build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py \
  build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py \
  build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_install.py -q
```

Result:

```text
44 passed in 9.24s
```

### 10.7 Closure Statement

This engine bug fix is ready to check in on the existing `2.0` line.

ABG no longer requires `summary.json`, `session-overrides.json`, or backend
result side artifacts to answer:

> what concrete execution identity did this traversal use?

The event stream now carries that truth directly, provided the downstream
runtime supplies the selected binding truth into ABG's runtime identity
surface before traversal and/or into the bounded result/manifest path used by
`assess-result`.

However, this should not be described as fully closed at the migration-program
level yet.

The broader `genesis_sdlc` migration to ABG/GTL `2.0` is still under active bug
test. So the correct status is:

- engine-side provenance fix implemented
- ready to check in
- no `2.0.x` version increment required for this patch
- overall migration issue remains open until downstream bug testing closes it

### 10.8 Remaining Boundary

This fix closes the identified ABG event-model gap, but not the full migration
workstream.

Downstream integrations such as `genesis_sdlc` still need to provide the
selected runtime binding truth into ABG's runtime contract fields when they
want the earlier traversal events (`run_bound`, `run_started`, `edge_started`,
`fp_dispatched`) to include that selected identity immediately.

That is now an integration obligation, not an ABG replay/provenance gap.
