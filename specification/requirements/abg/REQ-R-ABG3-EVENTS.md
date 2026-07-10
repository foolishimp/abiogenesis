# REQ-R-ABG3-EVENTS — Event Truth And Emission

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define the ABG 3 event substrate as the only written runtime truth surface.

## Acceptance Criteria

**REQ-R-ABG3-EVENTS-001**: `emit()` shall remain the only lawful write path. The event stream shall be append-only.

**REQ-R-ABG3-EVENTS-002**: Event truth shall be rich enough that runtime truth is reconstructable by replay from events plus declared GTL surfaces alone.

**REQ-R-ABG3-EVENTS-003**: The canonical event envelope shall carry immutable engine-assigned `event_id`, immutable system-assigned `event_time`, aggregate identity, causal/correlation identity, and explicit runtime references sufficient for replay.

**REQ-R-ABG3-EVENTS-004**: Canonical aggregate types shall include at minimum `run`, `graph_call`, `frame`, and `continuation`.

**REQ-R-ABG3-EVENTS-005**: Vector-local traversal facts shall attach to the nearest enclosing runtime aggregate. Vector shall never be its own runtime aggregate.

**REQ-R-ABG3-EVENTS-006**: Lifecycle open/close/fail/rebound events shall remain authoritative truth. Snapshot or checkpoint events may assist replay but shall not replace authoritative lifecycle facts.

**REQ-R-ABG3-EVENTS-007**: ABG shall observe process-boundary runtime facts only. It shall not constitutionalize internal chain-of-thought, hidden tactic steps, or private decomposition inside probabilistic workers.

**REQ-R-ABG3-EVENTS-008**: When ABG yields on unresolved non-blocking post-transform observer truth, the yielded handoff and its causing observer facts shall be emitted as authoritative event truth rather than inferred from absence of terminal failure.

**REQ-R-ABG3-EVENTS-009**: Long-running supervised dispatch shall emit enough progress, artifact-observation, stall, salvage, and terminal facts that operator-grade live status can be replay-projected without hidden controller memory.

**REQ-R-ABG3-EVENTS-010**: The canonical event envelope shall preserve at minimum event identity, event time, event type, aggregate type, aggregate identity, parent aggregate identity when present, causation identity, correlation identity, workflow version, work key, run identity, semantic job identity, graph-function identity, materialization identity, frame attempt identity, frame lineage identity, vector identity when present, and closed event data.

**REQ-R-ABG3-EVENTS-011**: Authoritative event truth shall cover at minimum run lifecycle, graph-call lifecycle, frame lifecycle, vector-local traversal and dispatch facts, proof and closure facts, continuation lifecycle, correction, and supersession.

**REQ-R-ABG3-EVENTS-012**: Actor/process supervision facts shall be authoritative ABG event truth when a traversal dispatch crosses a local or external process boundary. Product-local transcripts, terminal logs, or controller memory shall not replace these events.

**REQ-R-ABG3-EVENTS-013**: The actor/process event family shall preserve enough source facts to replay at minimum actor invocation start, process start or spawn failure, stdout chunk observation, stderr chunk observation, heartbeat or liveness observation, timeout observation, termination signal request, process exit, result-artifact observation, and actor invocation closure or failure.

**REQ-R-ABG3-EVENTS-014**: Spawn failure, unavailable command, path drift, sandbox/runtime denial, timeout, signal termination, and nonzero exit shall be emitted as typed runtime facts. Such failures shall not crash admission, disappear into stderr text, or be represented only as absent result artifacts.

**REQ-R-ABG3-EVENTS-015**: Actor/process events shall carry the run, graph function, graph call, frame, vector, actor invocation, worker binding, causation, and correlation identities needed to connect process evidence back to the active traversal boundary by replay.

**REQ-R-ABG3-EVENTS-016**: Traversal modulation runtime truth shall be admitted as replay-visible event truth. The minimum event family shall include modulation resolution, attempt-envelope derivation, attempt dispatch, progress observation, non-progress classification, forced-review projection, same-edge continuation planning, and modulation exhaustion.

**REQ-R-ABG3-EVENTS-017**: Traversal modulation events shall preserve basis, graph function, run, work key, graph call, frame, frame lineage, vector, edge, causation refs, and correlation id sufficient to replay the modulation projection without runner-local state.

**REQ-R-ABG3-EVENTS-018**: ABG event kinds that change runtime fluent truth shall have declared Event Calculus effects. The declaration shall identify the fluents initiated, terminated, clipped, and declipped by the admitted event kind.

**REQ-R-ABG3-EVENTS-019**: Temporal provider effects shall become ABG runtime truth only through admitted temporal events. Timer intent, timer outcome, deadline-breach, and scheduled-continuation events shall preserve basis, graph function, graph call, frame, vector, edge, policy, provider, causation, and correlation identity. Deadline-breach events shall also preserve the deadline ref and policy-selected breach action.

**REQ-R-ABG3-EVENTS-020**: Traversal strategy selection shall use one canonical GTL declaration surface: `GraphVector.declarations["abg.traversal_strategy"]`, `GraphFunction.declarations["abg.default_traversal_strategy"]`, and `Role.policy_hooks["abg.traversal_strategy"]`. Legacy or alternate traversal-modulation key spellings shall not be admitted as live authority surfaces.

**REQ-R-ABG3-EVENTS-021**: Construction consciousness-loop event families shall separate admitted primary events from derived-fluent projection. Events such as construction episode start, observation materialization, action-catalog projection, evaluator invocation, candidate return, candidate admission/rejection, intent selection, graph-action invocation, and delta observation may carry primary event authority when they declare Event Calculus effects. Progress, stagnation, public terminal status, and summary agreement shall be derived from admitted events and declared `RuntimeDerivedFluentRule` law unless a later requirement explicitly grants primary event authority.

**REQ-R-ABG3-EVENTS-022**: Runtime probe activity and external interruption shall be admitted as typed ABG events when they affect liveness, watchdog, retry, or public runtime status. At minimum ABG shall admit `runtime_activity_probe_observed` and `runtime_external_interruption_observed` events that preserve basis, graph function, run, work key, graph call, frame, vector, edge, actor invocation when present, worker/backend identity when present, probe/source identity, system or runtime-asset ref, evidence refs, causation refs, correlation id, and elapsed observation time. Event log, ledger, manifest, PTY capture, stream capture, result artifact, projection/report, archive, heartbeat, and structured stream observations shall normalize through the same event family when they are used as liveness evidence.

**REQ-R-ABG3-EVENTS-023**: Runtime probe event kinds that change liveness fluent truth shall have declared Event Calculus effects. Activity observation shall initiate activity-recent and invocation-active truth. External safety interruption shall terminate active truth and initiate externally-interrupted and invocation-blocked truth.

**REQ-R-ABG3-EVENTS-024**: When ABG emits a runtime event on an installed or public runtime path with a configured replay event log, durable replay-log append shall occur as part of event-sink acceptance before the next effectful runtime step observes downstream state. A terminal-only batch flush shall not satisfy append-only event truth. Command-local buffers, product transcripts, PTY/process traces, and archives may assist operator output or evidence, but they shall not replace the replay log as the durable event truth surface.

**REQ-R-ABG3-EVENTS-025**: Every runtime event kind shall either carry run/basis scope (basisId, and runId/workKey where meaningful) or be DECLARED run-independent with a named scope class. Run-independent kinds (at minimum the registry publication family, graph-function selection, node-type satisfaction, and workspace installation) are workspace-scoped truth: basis-scoped filters shall pass them by declaration, and read models folding them across a shared store shall state that scope in their input contract. An event kind that is neither scoped nor declared run-independent is a carrier defect.

**REQ-R-ABG3-EVENTS-026**: Typed rejection events shall carry their issues as structured rows, not prose alone. `payload_rejected` shall preserve, per issue, the issue kind (closed vocabulary) and the offending path, alongside the schema/contract refs it already carries. Until the structured rows land, the interim reason-string grammar (comma-joined `issueKind:path` pairs) is the declared lossy contract and consumers may rely on it; the structured rows supersede it on this requirement's realization.

**REQ-R-ABG3-EVENTS-027**: The canonical event envelope shall carry a store-assigned admission ordinal. Any fold over replayed events that selects latest or current truth shall be decided by admission ordinal, never by array order, file order, or caller order. Ordinal collisions among candidate events, and candidate sets that admission ordinal cannot totally order, shall fail closed at ingest rather than resolve by incidental order.

Gap: latest-selecting folds still decide by array/caller order rather than admission ordinal — at minimum `deriveConstructionPressureProjection` (latest package ref taken in event-array order) and the runner's `latestSelectedGraphFunctionEvent` (reverse array scan). Collision/unorderable-candidate fail-closed ingest is likewise not realized in those folds. Owner: T-217 (the active 4.6 wave).

**REQ-R-ABG3-EVENTS-028**: Admission ordinal shall be per-store emitter-context state. A live emitter context shall reject an externally pre-stamped canonical envelope as inadmissible: canonical stamping authority belongs to the admitting store alone, and accepting a foreign stamp is envelope forgery. A replay-tolerant emitter context shall admit previously admitted canonical truth forward-only: already-stamped events re-enter in admission-ordinal order, and the context shall not restamp, reorder, or rewind them.

Gap: the default emitter context is a module-level replay-tolerant singleton, not per-store state; emission paths that do not adopt a seeded live context inherit it, so live-forgery rejection is realized only where a live context is explicitly adopted (the persisted-store append path), not universally. Owner: T-217 (the active 4.6 wave).

**REQ-R-ABG3-EVENTS-029**: The complete runtime event-kind union shall be a published, versioned conformance contract of the substrate. A conformant tenant shall produce exactly the census kinds under the canonical envelope: no missing kinds, no undeclared extra kinds, and no rival envelope. The authoritative kind roster is the published `RuntimeEvent` contract of the released substrate package; the family enumeration in the census section below is a normative map into that contract, not a substitute roster.

## Canonical Runtime Event-Kind Census

The runtime event union decomposes into these families. Example kinds are
illustrative members drawn from the published `RuntimeEvent` contract; the
published contract owns the complete roster.

- lifecycle/basis: `basis_admitted`, `run_segment_opened`, `graph_call_opened`, `frame_opened`
- advancement/regime: `fd_advance_ready`, `fp_dispatch_requested`, `lever_resolution_admitted`
- actor/process: `actor_invocation_started`, `actor_process_started`, `actor_process_exited`
- instruction assembly: `instruction_prompt_manifest_projected`, `instruction_response_contract_admitted`, `instruction_causal_context_bound`
- witness/attestation/proof: `declaration_reprice_admitted`, `replay_log_attested`, `workspace_hygiene_stamped`
- tuner: `tuner_draft_admitted`, `tuner_draft_ratified`, `tuner_draft_rejected`
- c-call spine: `c_call_opened`, `c_call_evidenced`, `c_call_judged`
- retry/continuation: `retry_attempt_opened`, `retry_progress_recorded`, `continuation_reopened`
- leaf-task/branch saga: `leaf_task_opened`, `branch_lease_acquired`, `branch_fan_in_projected`
- payload ledger: `payload_observed`, `payload_rejected`, `evidence_admitted`
- F_H assessment: `approved`, `revoked`, `assessed`
- overlay/output/zoom: `overlay_frame_declared`, `output_instance_allocated`, `zoom_frame_opened`
- traversal modulation: `traversal_modulation_resolved`, `traversal_attempt_dispatched`, `traversal_modulation_exhausted`
- graph-span foldback/reentry: `graph_span_assessed`, `graph_span_foldback_evaluated`, `graph_reentry_planned`
- timer: `timer_intent_admitted`, `deadline_breach_admitted`, `scheduled_continuation_reopened`
- construction: `construction_episode_started`, `construction_intent_selected`, `construction_delta_observed`
- registry/projection: `registry_entry_admitted`, `graph_function_selected`, `node_type_satisfaction_projected`
