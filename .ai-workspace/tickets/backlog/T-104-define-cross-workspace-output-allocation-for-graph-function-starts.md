---
id: T-104
title: Define cross-workspace output allocation for graph-function starts
type: feature
ticket_category: runtime_output_allocation
status: backlog
goal: explicit-input-workspace-output-workspace-graph-function-materialization
change_intent: Make ABG graph-function starts able to read admitted inputs from one workspace and allocate declared outputs into a different explicit output workspace without collapsing the two workspace authorities.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG start intent, workspace binding, output allocation, materialization root authority, plugin handoff manifests, runtime event truth, projection, lineage, T-082 output allocation
priority: high
triaged_at: 2026-05-02T21:40:26+10:00
created_at: 2026-05-02T21:40:26+10:00
updated_at: 2026-05-02T21:40:26+10:00
dependencies:
  - T-082 completed ABG output instance allocation for input-only graph-function start
related_tickets:
  - T-100 completed ABG zoomed workspace-asset obligation schedule and foldback evaluation
  - T-103 completed ABG graph-span foldback and reentry frontier
related_design_inputs:
  - .ai-workspace/comments/jim/design_0502
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: Operator clarified that the design_0502 proposal includes `ABG.Transform((W1,W2), Intent.history, Context[](W1,Additional_Context), A.ref, B.type) -> W2.B.ref`; T-082 closed the input-only same-workspace allocation primitive but does not yet define explicit output workspace authority.
target_truth: ABG admits graph-function start truth with an input workspace binding set and a distinct output workspace binding set. Output allocation mints asset identities and materialization roots under the declared output workspace authority while preserving input asset lineage back to the source workspace.
superseded_truth: Output allocation always derives from the input workspace root or from one implicit workspace in the start scope.
closure_law: close only when ABG defines the W1/W2 start intent carrier, workspace authority checks, cross-workspace output allocation law, plugin handoff manifest shape, event/projection truth, and focused tests proving W1 inputs can lawfully materialize W2 outputs without plugins or callers choosing hidden paths.
non_closure_conditions:
  - W2 is represented as a string path without an admitted workspace binding
  - output roots are derived from W1 when the caller explicitly supplied W2
  - a plugin can write outside the W2 allocated root and still pass materialization
  - cross-workspace lineage is visible only in prose and not in runtime events or projection
  - the feature is implemented as a sandbox-only convention instead of ABG start/allocation law
---

# T-104: Cross-Workspace Output Allocation

## STDO Triage

First missing layer: requirement.

T-082 closed the lower primitive for input-only graph-function starts where ABG
allocates output asset instances and write roots under the invocation's
workspace root. The operator's design note also names a separate shape:

```text
ABG.Transform((W1,W2), Intent.history, Context[](W1,Additional_Context), A.ref, B.type) -> W2.B.ref
```

That is a distinct requirement. It is not a bug in T-082 and should not be
folded into the just-closed tranche by drift.

## Required Design Question

Define whether the public start grammar names:

- an `inputWorkspace` plus `outputWorkspace`
- a workspace-pair carrier
- output-specific workspace bindings per requested output

The selected shape must keep workspace authority explicit. `W1` owns the input
asset lineage. `W2` owns the output materialization root and output asset ref.
ABG owns allocation, lineage, event admission, and projection.

## Acceptance Criteria

- AC-1: requirement wording names explicit input-workspace and output-workspace
  authority for graph-function starts.
- AC-2: TypeScript design defines the W1/W2 carrier and its relationship to
  T-082 same-workspace output allocation.
- AC-3: implementation admits output workspace bindings before allocation.
- AC-4: T-082 allocation can allocate under W2 without reading hidden caller or
  plugin paths.
- AC-5: plugin handoff manifests carry W1 input refs, W2 output refs, and W2
  allowed write roots.
- AC-6: runtime events and projection preserve W1 source lineage and W2 output
  lineage.
- AC-7: tests prove W1->W2 materialization succeeds, W1-root output leakage
  fails, W2-root escape fails, and same-workspace T-082 behavior remains green.
