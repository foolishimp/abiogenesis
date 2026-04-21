---
id: B-028
title: Govern F_P prompt assembly with a recorded prompt-budget carrier
type: bug
ticket_category: implementation_migration
status: completed
goal: remove ad hoc prompt text compaction and make every over-budget prompt surface visible in runtime truth
change_intent: replace scattered prompt string truncation with one prompt assembly budget carrier that owns limits, records every exceeded budget, publishes compaction records into manifests and dispatch events, and keeps full source surfaces inspectable by reference
change_class: design_reframe
re_entry_point: design_surface
affected_boundary: ABG F_P prompt assembly, deterministic failure summaries, source asset snapshots, context injection, runtime environment rendering, F_P manifest publication, and fp_dispatched event truth
priority: high
triaged_at: 2026-04-21
created_at: 2026-04-21
updated_at: 2026-04-22
dependencies: B-027 completed; odd_sdlc T-020 active; odd_sdlc T-024 completed
intake_source: odd_sdlc Test28 compact prompt regression exposed silent prompt clipping as hidden runtime policy
target_truth: F_P prompt text is a governed runtime interface assembled through one prompt-budget carrier; when any input exceeds a prompt budget, the emitted prompt is bounded, the full source remains inspectable by reference, and the compaction record is published in the manifest and runtime event stream
superseded_truth: prompt assembly directly concatenates raw F_D stdout, full context bodies, full source snapshots, and carried environment rows, or silently clips them through local helper constants without recording that compaction occurred
closure_law: closes only when prompt compaction has one owner, all exceeded limits become manifest/event truth, raw oversized prompt inputs no longer pass silently, and tests prove both compact prompt output and visible compaction records
evaluation_criteria:
  - prompt budgets are declared in one carrier/wrapper, not scattered constants interpreted per section
  - every prompt section that can omit, truncate, summarize, or compact content records surface, reason, original size, emitted size, budget, and inspection reference
  - F_D result summaries do not dump raw stdout/stderr into prompts, but full detail remains in manifest/runtime artifacts
  - context and source asset compaction is reference-first and does not hide the full source location
  - carried runtime environment rows omitted from prompt are counted and inspectable through the asset query surface or manifest
  - fp_manifest and fp_dispatched event payloads publish the same prompt_compactions records
  - tests fail if an over-budget surface is clipped without a compaction record
non_closure_conditions:
  - any prompt section applies a local size limit without using the prompt-budget carrier
  - any oversized F_D stdout, context, source snapshot, or environment surface is silently clipped or omitted
  - prompt compactness tests pass only because a test threshold was raised
  - manifest and fp_dispatched disagree about prompt compaction records
  - consumers must parse prompt text to discover that compaction occurred
  - full source inspection references are absent or not actionable
proof_surface:
  - unit proof for PromptAssemblyBudget recording semantics
  - prompt assembly proof with over-budget F_D stdout showing compact prompt text plus prompt_compactions record
  - prompt assembly proof with over-budget context and source asset snapshot showing manifest/event records
  - ABG runtime envelope proof that source snapshots and required environment entries remain present after compaction
  - odd_sdlc Test28 compact prompt regression proof
  - negative proof that direct local truncation helper usage is rejected by source scan
---

## Migration Declaration

- old_truth_path: `_assemble_prompt(...)` and adjacent helpers in
  `genesis.binding` own prompt text as direct string concatenation. Prompt
  compactness is currently an emergent behavior of local limits over F_D
  details, context bodies, source asset snapshots, and environment rows.
- new_truth_path: `PromptAssemblyBudget` (or successor name) is the single
  prompt-budget carrier. Prompt assembly asks it to compact or omit surfaces,
  and the carrier records every budget crossing as structured runtime truth.
- producers_old:
  - `_assemble_prompt(...)`
  - `_compact_fd_prompt_detail(...)`
  - `_read_workspace_asset_snapshot(...)` callers
  - direct environment-row rendering in `_assemble_prompt(...)`
  - `render_delta(...)` F_D detail rendering
- producers_new:
  - prompt-budget carrier/wrapper
  - prompt section renderers that return rendered text plus compaction records
  - runtime manifest publication of `prompt_compactions`
  - `fp_dispatched` event publication of `prompt_compactions`
- consumers_old:
  - F_P prompt readers
  - F_P manifests
  - live status and replay tools reading prompt size only
  - downstream tests asserting compactness without compaction evidence
- consumers_new:
  - prompt readers receive bounded prompt text
  - reviewers inspect `prompt_compactions` in the manifest and event stream
  - replay/status/dossier consumers use structured records rather than parsing
    prompt text for truncation markers

## Candidate Inventory

Implementation candidates:

- `build_tenants/abiogenesis/python/code/genesis/binding.py`
  - `PromptAssemblyBudget`
  - `_assemble_prompt(...)`
  - `_compact_fd_prompt_detail(...)`
  - `_compact_fd_stdout(...)`
  - `_compact_fd_json_output(...)`
  - `_read_workspace_asset_snapshot(...)` caller path
  - environment row rendering in `_assemble_prompt(...)`
  - `render_delta(...)`
- `build_tenants/abiogenesis/python/code/genesis/runtime_carrier.py`
  - `DispatchBindingRequest`
  - `IterationDispatchPlan`
  - `FpDispatchPublicationPlan`
  - `fp_dispatch_publication_plan(...)`
  - `iterated_result_payload(...)`
  - `fp_manifest_payload(...)` prompt publication
  - runtime result prompt metadata
- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
  - `_bind_fp_dispatch_job(...)`
  - `_plan_iteration_execution(...)`
  - `_apply_iteration_execution_plan(...)`
  - `_plan_pending_dispatch_replay(...)`
  - `_apply_pending_dispatch_replay_plan(...)`
  - `_iterated_outcome(...)`
  - `_realize_iteration(...)`
  - `fp_dispatched` event payload
- `build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
  - `PendingDispatchSurface`
  - `_resolve_pending_dispatch_surface(...)`
  - `dispatch_bound_manifest_via_transport(...)`
  - `dispatch_bound_manifest_via_supervised_transport(...)`
  - `auto_dispatch_from_result(...)`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
  - `call_agent(...)`
  - `dispatch_agent(...)`
  - `dispatch_agent_supervised(...)`
  - `_build_args(...)`
  - `AGENT_PROBE_PROMPT`
- `build_tenants/abiogenesis/python/code/genesis/subwork.py`
  - `dispatch_leaf(...)`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
  - prompt/manifest projection consumers
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
  - manifest/status readers exposed through public commands
- `build_tenants/abiogenesis/python/code/genesis/run.py`
  - run-status projection consumers
- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
  - result publication consumers that must preserve inspection references

Proof candidates:

- `build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- odd_sdlc downstream proof:
  `../odd_sdlc/build_tenants/python/test_env/tests/test_odd_sdlc_test28_regression.py`

## Pre-Test Gate

No new or repriced tests close this ticket until the refactor checklist below
is complete or each remaining item is explicitly marked out of scope with a
method reason. Tests are the proof surface after the prompt authority cut, not
the migration plan.

## Refactor Interface Checklist

Carrier and admitted prompt truth:

- [x] `binding.py:PromptAssemblyBudget` is replaced or tightened so prompt
  assembly is a closed carrier transformation, not a mutable side channel that
  can be privately created and discarded.
- [x] `binding.py` publishes a typed prompt assembly result carrier that owns
  emitted prompt text, section records, compaction records, omitted-surface
  records, and inspection references as one value.
- [x] `binding.py:BoundJob` cannot carry raw `prompt: str` without the admitted
  prompt assembly carrier or an equivalent typed prompt-budget proof.
- [x] `binding.py:PromptAssemblyBudget.records()` no longer exposes loose
  `dict[str, Any]` records as the canonical contract; records must have a
  closed field set and stable reason/classification values.
- [x] `binding.py:PromptAssemblyBudget.compact_text(...)` guarantees emitted
  text respects the declared budget after marker insertion, or records a
  separate marker-overhead rule as carrier truth.
- [x] `binding.py:PromptAssemblyBudget.compact_context(...)` publishes an
  actionable inspection reference, not prose such as "context locator for".
- [x] `binding.py:PromptAssemblyBudget.record_source_snapshot(...)` never uses
  sentinel sizes such as `-1` as canonical truth.
- [x] `binding.py:PromptAssemblyBudget.record_omitted_obligations(...)` records
  counts with count fields, not character-size field names.

F_P binding and prompt construction:

- [x] `binding.py:_construct_bound_job(...)` receives the typed prompt assembly
  result and passes that carrier into `BoundJob` without extracting/recombining
  prompt text and loose records.
- [x] `binding.py:bind_fp(...)` exposes only the admitted prompt assembly
  surface downstream.
- [x] `binding.py:_assemble_prompt(...)` stops accepting an optional budget and
  stops returning only `str`; every caller must receive the complete prompt
  assembly carrier.
- [x] `binding.py:_assemble_prompt(...)` has no private fallback budget that can
  record compaction and then discard the records.
- [x] `binding.py:_assemble_prompt(...)` turns each prompt section into a
  section-level transformation that returns text plus records, not direct list
  append orchestration.
- [x] `binding.py:_assemble_prompt(...)` records omitted carried environment
  bindings as prompt-budget records, not only as prose in the emitted prompt.
- [x] `binding.py:_assemble_prompt(...)` records all fulfillment obligation
  omissions and does not later dump the full obligation ID list through another
  prompt line.
- [x] `binding.py:_assemble_prompt(...)` keeps the full obligation set
  inspectable through manifest/runtime artifact references instead of prompt
  text.
- [x] `binding.py:render_delta(...)` stops using prompt compaction helpers
  without a carrier, or is explicitly classified as non-prompt diagnostic
  rendering with no prompt-budget authority.

Compaction helpers:

- [x] `binding.py:_compact_json_scalar(...)` removes `budget=None` silent
  truncation and requires admitted prompt-budget authority for any truncation.
- [x] `binding.py:_compact_fd_json_output(...)` records every list item
  omission, dict key omission, selected-key summary, and fallback scalar
  truncation.
- [x] `binding.py:_compact_fd_stdout(...)` removes `budget=None` silent
  truncation and records JSON and non-JSON compaction through the same carrier.
- [x] `binding.py:_compact_fd_prompt_detail(...)` removes `budget=None` silent
  truncation and records stdout, stderr, summary, and joined-detail compaction
  through the same carrier.
- [x] `binding.py:_read_workspace_asset_snapshot(...)` stops owning prompt
  truncation policy; it may read source surfaces, but prompt budgeting belongs
  to the prompt assembly carrier.
- [x] `binding.py:_read_workspace_asset_snapshot(...)` returns enough source
  identity, original-size, emitted-size, and inspectable reference data for the
  carrier to publish truthful records.
- [x] Source scan rejects `...[truncated]`, direct slicing, prompt `max_chars`,
  and prompt helper `budget=None` paths outside the admitted carrier.

Runtime carrier publication:

- [x] `runtime_carrier.py:DispatchBindingRequest` carries only admitted
  dispatch-binding inputs and does not smuggle prompt text or prompt policy.
- [x] `runtime_carrier.py:IterationDispatchPlan` carries the typed prompt
  assembly surface through dispatch planning.
- [x] `runtime_carrier.py:FpDispatchPublicationPlan` carries the typed prompt
  assembly surface instead of reconstructing prompt text and loose
  `prompt_compactions`.
- [x] `runtime_carrier.py:fp_dispatch_publication_plan(...)` publishes prompt
  assembly truth into the manifest from the carrier without changing shape.
- [x] `runtime_carrier.py:iterated_result_payload(...)` publishes the same
  prompt assembly truth into runtime result payloads without deriving a second
  shape.
- [x] Manifest payloads always include the prompt compaction field, including an
  explicit empty list or explicit no-compaction value, so absent-vs-empty is not
  a second state.
- [x] Manifest payloads include references to full F_D output, contexts, source
  snapshots, runtime environment rows, and fulfillment obligations whenever
  prompt text is compacted or omitted.

Runtime events, replay, and interpretation:

- [x] `interpret.py:_bind_fp_dispatch_job(...)` consumes the admitted prompt
  assembly carrier from binding and does not rebuild prompt metadata.
- [x] `interpret.py:_plan_iteration_execution(...)` carries prompt assembly
  truth through the execution plan.
- [x] `interpret.py:_apply_iteration_execution_plan(...)` writes manifest
  prompt assembly truth exactly once from the plan.
- [x] `interpret.py:_iterated_outcome(...)` remains an effect shell and does
  not regain prompt-budget policy or prompt string reconstruction.
- [x] `interpret.py:_realize_iteration(...)` publishes `fp_dispatched`
  prompt assembly truth for both empty and non-empty compaction cases.
- [x] `interpret.py:_realize_iteration(...)` does not conditionally omit
  `prompt_compactions` when the manifest carries the field.
- [x] `interpret.py:_plan_pending_dispatch_replay(...)` preserves manifest
  prompt assembly truth and does not reconstruct compaction records from prompt
  text.
- [x] `interpret.py:_apply_pending_dispatch_replay_plan(...)` republishes or
  projects prompt assembly truth without creating a second record shape.

Dispatch and transport boundaries:

- [x] `dispatch_runtime.py:PendingDispatchSurface` treats prompt assembly truth
  as required manifest state for F_P dispatch.
- [x] `dispatch_runtime.py:_resolve_pending_dispatch_surface(...)` rejects
  old prompt-only manifests for B-028-governed F_P dispatch unless the ticket
  explicitly defines a migration quarantine.
- [x] `dispatch_runtime.py:dispatch_bound_manifest_via_transport(...)` validates
  the manifest prompt assembly contract before dispatch.
- [x] `dispatch_runtime.py:dispatch_bound_manifest_via_transport(...)` remains a
  delivery shell and does not infer prompt compaction from prompt text.
- [x] `dispatch_runtime.py:dispatch_bound_manifest_via_supervised_transport(...)`
  enforces the same prompt assembly contract as the unsupervised path.
- [x] `dispatch_runtime.py:auto_dispatch_from_result(...)` does not dispatch a
  pending F_P result unless the referenced manifest carries admitted prompt
  assembly truth.
- [x] `transport.py:call_agent(...)` is classified as raw delivery only and must
  not become a prompt construction or compaction authority.
- [x] `transport.py:dispatch_agent(...)` is classified as raw delivery only and
  must not become a prompt construction or compaction authority.
- [x] `transport.py:dispatch_agent_supervised(...)` is classified as raw
  delivery only and must not become a prompt construction or compaction
  authority.
- [x] `transport.py:_build_args(...)` receives already-governed prompt text and
  does not inspect, clip, or annotate prompt content.
- [x] `transport.py:AGENT_PROBE_PROMPT` and probe contract handling are
  explicitly excluded as transport readiness probes or governed separately.

Leaf/subwork prompt entry points:

- [x] `subwork.py:dispatch_leaf(...)` stops constructing direct ad hoc prompts
  from `input_data` and `output_schema`, or is moved behind the same prompt
  assembly carrier.
- [x] `subwork.py:dispatch_leaf(...)` records any omitted, compacted, or
  summarized leaf input/output schema surface through the same carrier if it
  remains an F_P-like prompt path.
- [x] Any callback path that dispatches `LeafTask` work is classified as either
  outside B-028 with a method reason or governed by the prompt assembly carrier.

Projection and public-reader consumers:

- [x] `live_status.py` projects prompt compaction truth from manifest/event
  records rather than deriving meaning from prompt length or prompt text.
- [x] `cli_adapter.py` public status/gaps readers expose prompt compaction
  records when they describe a blocked, dispatched, or replayed F_P surface.
- [x] `run.py` or any run-status projection that reads F_P manifests preserves
  prompt compaction fields as read-model truth.
- [x] `result_ingest.py` and result publication paths preserve prompt assembly
  references needed to inspect compacted full source surfaces.

Migration rejection checks:

- [x] No governed F_P prompt path accepts a raw prompt string as sufficient
  authority after the carrier is admitted.
- [x] No governed F_P prompt path stores compaction truth only in prompt text.
- [x] No governed F_P prompt path treats manifest truth and event truth as
  different contracts.
- [x] No governed F_P prompt path parses `...[truncated]` markers to discover
  that compaction occurred.
- [x] No governed F_P prompt path raises prompt size thresholds as a substitute
  for recorded compaction.
- [x] No mixed old/new prompt dispatch path remains unless it is named as a
  temporary quarantine with explicit removal criteria in this ticket.

## Migration Checklist

- [x] Old truth path named and all old prompt construction/truncation producers
  inventoried.
- [x] New truth path named as one admitted prompt assembly carrier.
- [x] Producer set for new truth listed and implemented.
- [x] Consumer set for new truth listed and rebound.
- [x] Projection and read-model surfaces listed and rebound.
- [x] Old truth path removed, demoted to source reading only, or explicitly
  quarantined with removal criteria.
- [x] Mixed old/new prompt authority rejected by code, not only by tests.
- [x] Tests that prove mixed prompt authority still works are removed or
  repriced as negative proofs.
- [x] Ticket, product/design wording, manifest contract, event contract, and
  proof surface reconciled before closure.

## Break-To-Closure Map

- [x] Break 1: admit the typed prompt assembly carrier at the F_P binding seam.
- [x] Break 2: rebind `_assemble_prompt(...)` and all section renderers to
  return carrier truth instead of prompt strings plus side effects.
- [x] Break 3: remove optional budget and silent truncation helper paths.
- [x] Break 4: rebind manifest publication to the carrier.
- [x] Break 5: rebind `fp_dispatched`, pending replay, and runtime result
  publication to the same carrier.
- [x] Break 6: rebind dispatch-runtime validation so prompt-only F_P manifests
  fail closed.
- [x] Break 7: classify transport as delivery-only and leaf/subwork prompts as
  either governed or explicitly out of scope.
- [x] Break 8: rebind live/status/CLI/result projections to structured
  compaction truth.
- [x] Break 9: run source scan for remaining prompt truncation and raw prompt
  construction authority.
- [x] Break 10: only after breaks 1-9, write or reprice tests for positive,
  negative, replay, manifest/event equality, projection, and downstream
  odd_sdlc proof.

## Current Implementation Notes

- Code migration breaks 1-9 are now landed in the working tree.
- `binding.py` now admits `PromptCompactionRecord`, `PromptSection`, and
  `PromptAssembly`; `BoundJob` carries `prompt_assembly` and exposes prompt text
  only as a projection.
- `_assemble_prompt(...)` now composes named section renderers and returns
  `PromptAssembly`; optional budget arguments and silent helper fallback paths
  were removed.
- `runtime_carrier.py` publishes `prompt_assembly` and `prompt_compactions` in
  manifest and iterated result payloads; `IterationDispatchPlan` carries the
  bound job after binding.
- `interpret.py` publishes prompt compactions on every `fp_dispatched` event
  and preserves prompt compactions during pending replay.
- `dispatch_runtime.py` rejects F_P manifests that lack the admitted
  `prompt_compactions` contract or whose `prompt_assembly.prompt_compactions`
  disagrees with the manifest field.
- `subwork.py` routes leaf prompt construction through the same prompt assembly
  carrier and writes a leaf prompt manifest sidecar for full input/schema
  inspection.
- `transport.py` is explicitly classified as raw delivery only; probe prompts
  are transport readiness checks outside B-028 governed prompt assembly.
- `run.py`, `live_status.py`, `cli_adapter.py`, and `result_ingest.py` preserve
  prompt compaction truth as read-model/result surface data.

Pre-test checks performed:

- `py_compile` on touched runtime modules passed.
- Import smoke over touched runtime modules passed.
- Source scan found no `budget=None`, no old `prompt_budget` parameter path, and
  no raw governed prompt construction outside `PromptAssemblyBudget` carriers.

Focused proof performed:

- Repriced dispatch-runtime manifest fixtures so valid F_P dispatch fixtures
  carry the admitted `prompt_assembly` and `prompt_compactions` contract.
- Added ABG-local positive proofs for `PromptAssemblyBudget` closed record
  shape, over-budget F_D stdout/stderr, over-budget context, over-budget source
  asset snapshots, carried environment omissions, and declared fulfillment
  obligation omissions.
- Removed `PromptAssembly` string-like dunders so consumers must access
  emitted prompt text through the named `.prompt` projection and cannot treat
  the carrier itself as a string.
- Rebound item/binding omission records to explicit count budgets at their call
  sites; `budget_size` no longer self-derives implicitly from `emitted_size`.
- Added structural proof that prompt truncation markers and `max_chars` prompt
  policy remain confined to admitted prompt-budget carrier files.
- Added a negative proof that prompt-only F_P dispatch manifests are rejected
  before dispatch.
- Ran direct B-028 proof slice:
  `python -m pytest test_abg3_runtime_envelope.py test_abg3_runtime_structure.py -k "prompt_assembly_budget or over_budget_fd_context or environment_and_obligation_omissions or prompt_only_manifest or prompt_assembly_does_not_masquerade or prompt_truncation_policy"`.
- Result: `6 passed, 53 deselected`.
- Ran focused ABG prompt/dispatch/kernel proof:
  `python -m pytest ...test_abg3_runtime_envelope.py ...test_m03_engine_kernel_integration.py -k "prompt or environment or target_binding or asset_surface or dispatch or manifest"`.
- Result: `34 passed, 126 deselected`.
- Ran broader focused ABG public/status/structure proof:
  `python -m pytest test_abg3_runtime_envelope.py test_m03_engine_kernel_integration.py test_abg3_runtime_structure.py test_cli_adapter_auto.py -k "prompt or environment or target_binding or asset_surface or dispatch or manifest or live_status or run_status"`.
- Result: `49 passed, 163 deselected`.

Downstream odd_sdlc latest-build proof performed:

- odd_sdlc first-slice proof against current ABG build:
  `test_odd_sdlc_first_slice.py`: 63 passed.
- odd_sdlc query-domain contract version consumers against current ABG build:
  `test_odd_sdlc_disambiguation_usecase.py::test_normalization_publishes_and_reduces_major_ambiguity`
  and
  `test_odd_sdlc_iterative_closure_traceability_usecase.py::test_iterative_requirement_closure_and_generated_traceability`:
  2 passed.
- odd_sdlc installed sandbox proof against current ABG build:
  `test_odd_sdlc_sandbox_usecase.py::test_canonical_sandbox_usecase_runs_from_installed_workspace`:
  1 passed.
- odd_sdlc Test28 regression against current ABG build:
  `test_odd_sdlc_test28_regression.py`: 4 passed.

Break 10 is complete. The ticket remains active until product/design wording
reconciliation and final closure movement are performed.

## Required Break Order

1. Publish one prompt-budget carrier/wrapper and remove direct mutable
   compaction list plumbing.
2. Move all prompt text compaction through that wrapper.
3. Publish `prompt_compactions` in F_P manifests and `fp_dispatched` events.
4. Add unit and integration proofs that over-budget F_D stdout, context, source
   snapshot, and environment omissions produce records.
5. Add a source scan or structural proof that no direct prompt truncation helper
   remains outside the wrapper.
6. Re-run ABG focused prompt/runtime envelope tests and odd_sdlc Test28.

## Functional Review Criteria

Every implementation and review pass must ask:

1. Is prompt text still assembled as arbitrary strings with local truncation
   policy, or has policy moved into the prompt-budget carrier?
2. Does every budget crossing produce a structured compaction record without
   requiring prompt text parsing?
3. Does the emitted prompt remain useful and reference-first, with full source
   inspection references preserved?
4. Are manifest and event records identical for a given dispatch?
5. Can a test create an over-budget surface and prove both bounded prompt output
   and visible compaction truth?
6. Did the change reduce prompt-policy surfaces, or merely rename scattered
   clipping helpers?

Passing tests do not close this ticket if prompt compaction can still happen
silently.
