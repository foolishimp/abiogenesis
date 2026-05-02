---
id: T-104
title: Define cross-workspace output allocation for graph-function starts
type: feature
ticket_category: runtime_output_allocation
status: completed
review_status: closure_accepted_for_abg_source_scope
goal: explicit-input-workspace-output-workspace-graph-function-materialization
change_intent: Make ABG graph-function starts able to read admitted inputs from one workspace and allocate declared outputs into a different explicit output workspace without collapsing the two workspace authorities.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG start intent, workspace binding, output allocation, materialization root authority, plugin handoff manifests, runtime event truth, projection, lineage, T-082 output allocation
priority: high
triaged_at: 2026-05-02T21:40:26+10:00
created_at: 2026-05-02T21:40:26+10:00
updated_at: 2026-05-02T23:57:00+10:00
closed_at: 2026-05-02T23:57:00+10:00
dependencies:
  - T-082 completed ABG output instance allocation for input-only graph-function start
related_tickets:
  - T-100 completed ABG zoomed workspace-asset obligation schedule and foldback evaluation
  - T-103 completed ABG graph-span foldback and reentry frontier
related_design_inputs:
  - .ai-workspace/comments/jim/design_0502
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
proof_commands:
  - npm run test:t104
  - npm run test:t104:sandbox
  - npm run test:t082
  - npm run test:t100:unit
  - npm run test:t103
  - npm run lint:semantic
  - npm run test:semantic
  - git diff --check
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

## Selected Shape

The selected TypeScript shape is output-specific workspace binding per requested
output.

Same-workspace T-082 remains valid: when no output workspace binding is present,
ABG allocates under the start scope workspace root. Cross-workspace allocation
requires an admitted output workspace binding. The binding is not a caller path
shortcut; it is runtime truth with:

- `workspaceRef`
- `workspaceRoot`
- optional `authorityRef`
- binding source

The W2 binding selects only the workspace authority. ABG still derives the
output asset ref, materialization root, materialization URI, and allowed write
root. Plugins receive those ABG-derived roots in handoff manifests and may not
write elsewhere.

## Carrier And Event Law

Start truth accepts:

```text
StartIntent.scope.workspaceRoot = W1
StartRequestedOutput.outputWorkspace = W2 binding, optional
```

Allocation law is:

```text
deriveOutputInstanceAllocation(basis(W1), output, optional W2 binding)
  -> OutputInstanceAllocation(inputWorkspaceRoot=W1,
                              outputWorkspaceRef=W2.ref or basis-scope ref,
                              outputWorkspaceRoot=W2.root or W1,
                              materializationRoot under outputWorkspaceRoot)
```

Runtime events and projections must carry both sides:

- W1 input workspace root for source lineage
- W2 output workspace ref/root/authority for output lineage
- ABG-derived output asset refs and write roots

The plugin handoff manifest is the reviewable boundary for parallel streams:
it carries admitted input refs and roots, allocated output refs, output
workspace refs/roots, and the exact allowed write roots.

## STDO Alignment With T-082/T-100/T-103

T-104 does not move semantic evaluation into output allocation. It preserves:

- T-082: ABG owns output instance allocation and path containment.
- T-100: semantic requirement-by-requirement quality remains F_P/F_H
  assessment over admitted artifacts, not F_D path checks.
- T-103: graph-span re-entry consumes replayed events and projections; W1/W2
  lineage becomes event/projection truth available to later re-entry logic.

The change class stays `requirement_reprice` because the public start truth now
has a new lawful authority shape: input workspace and output workspace can be
distinct without product-local orchestration.

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

## Implementation Notes

- Add requirement wording under `REQ-R-ABG3-BINDING`.
- Extend `StartRequestedOutput` with optional `outputWorkspace`.
- Add an admitted `OutputWorkspaceBinding` carrier.
- Extend `OutputInstanceAllocation`, output events, projection, and handoff
  manifest with W1/W2 lineage.
- Add `test:t104` focused semantic tests and keep `test:t082` green.

## Implementation Result

Closed in the TypeScript tenant source scope.

Implemented surfaces:

- `REQ-R-ABG3-BINDING-015`
- `StartRequestedOutput.outputWorkspace`
- `OutputWorkspaceBinding`
- W2-aware `deriveOutputInstanceAllocation`
- W1/W2 lineage fields on `OutputInstanceAllocation`,
  `output_instance_allocated`, and `output_binding_admitted`
- W1/W2 projection through `deriveOutputAllocationProjection`
- W1 input roots and W2 output refs/roots in
  `OutputPluginHandoffManifest`
- `test:t104` with W1->W2 success, W1 leakage rejection, W2 escape rejection,
  path-shortcut rejection, and same-workspace T-082 preservation
- `test:t104:sandbox` with two deterministic mini data-mapper review streams,
  each using a distinct W1 input workspace and W2 output workspace, then
  comparing edge-by-edge semantic fingerprints from ledger, foldback,
  manifest, F_D envelope, F_P evaluation, and assessments

Deepened proof surface:

- `mini_dm_redux/run.mjs` accepts `--output-workspace`,
  `--output-workspace-ref`, and `--output-workspace-authority-ref`.
- Edge 1 proves W1->W2 materialization from the raw problem input.
- Edges 2 and 3 prove the produced W2 artifacts can become the next admitted
  input while subsequent outputs remain isolated in the same W2 review stream.
- The sandbox writes `forensic_analysis.json` and `forensic_analysis.md` under
  `test_env/test_runs/t104_cross_workspace_mini_dm_forensics/<run>/`.
- The forensic comparison requires distinct stream-specific asset refs and
  materialization URIs while requiring identical semantic fingerprints across
  streams.

Closure evidence:

- `npm run test:t104:sandbox`: 1/1
- `npm run test:t104`: 6/6
- `npm run test:t082`: 6/6
- `npm run test:t100:unit`: 8/8
- `npm run test:t103`: 24/24
- `npm run lint:semantic`: pass
- `npm run test:semantic`: 354/354
- `git diff --check`: pass
