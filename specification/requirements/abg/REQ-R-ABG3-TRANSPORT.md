# REQ-R-ABG3-TRANSPORT — Governed Probabilistic Transport

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define transport for governed `F_P` work as substrate truth rather than
product-local imperative code.

## Acceptance Criteria

**REQ-R-ABG3-TRANSPORT-001**: `F_P` dispatch shall use explicit transport surfaces owned by ABG. Product-local code shall not become the runtime fact owner after dispatch.

**REQ-R-ABG3-TRANSPORT-002**: Transport shall return structured substrate output sufficient to classify runtime defect, transport failure, payload-contract failure, or timeout without parsing agent internals as domain truth.

**REQ-R-ABG3-TRANSPORT-003**: Timeout, crash, nonzero exit, or equivalent subprocess failure shall remain substrate/runtime failure truth unless ABG can deterministically validate and ingest a preserved authoritative result artifact for the same boundary.

**REQ-R-ABG3-TRANSPORT-004**: Missing, empty, malformed, or contract-invalid payload artifacts shall classify distinctly from transport/runtime defects.

**REQ-R-ABG3-TRANSPORT-005**: Certification or proof failure after constructive work shall remain downstream proof/closure truth, not transport truth.

**REQ-R-ABG3-TRANSPORT-006**: Agent CLI invocation contracts shall be owned by ABG but locally overrideable through runtime configuration so workspace/runtime-specific transport drift does not require product code changes.

**REQ-R-ABG3-TRANSPORT-007**: Malformed or unreadable local transport-contract overrides shall fail closed as runtime/policy configuration defects rather than silently falling back to embedded defaults.

**REQ-R-ABG3-TRANSPORT-008**: Long-running `F_P` dispatch shall be governed by a progress lease over explicit observable facts such as result-artifact updates, bounded heartbeat/progress events, or equivalent declared liveness surfaces. Elapsed wall-clock alone is not sufficient runtime truth for long constructive work.

**REQ-R-ABG3-TRANSPORT-009**: ABG shall observe `result_path` as a live writeback surface during supervised dispatch. Detection of a valid artifact before subprocess termination shall be replay-visible and available to closure/recovery logic without inventing new semantic truth.

**REQ-R-ABG3-TRANSPORT-010**: Each governed `F_P` dispatch attempt shall be wrapped by exactly one ABG-owned actor invocation identity. The actor invocation is the supervised effect boundary for one worker, tool, or agent process and shall not hide multiple graph traversals.

**REQ-R-ABG3-TRANSPORT-011**: Actor invocation identity shall be derived from admitted runtime truth for the current dispatch attempt. Same-edge retry or re-entry shall mint a fresh actor invocation identity and shall carry prior actor invocation evidence only through replay-derived context.

**REQ-R-ABG3-TRANSPORT-012**: Actor invocation events shall be replay-visible. At minimum ABG shall preserve actor invocation start, result-artifact observation, and actor invocation closure or failure as runtime truth or as a closed ingest surface that is projected from runtime truth.

**REQ-R-ABG3-TRANSPORT-013**: An actor invocation may supervise liveness, progress, subprocess execution, and result-artifact observation for its own dispatch attempt. It shall not select the next graph vector, close traversal, retry the edge, or append domain truth outside ABG event calculus.

**REQ-R-ABG3-TRANSPORT-014**: When an actor invocation reports timeout, crash, nonzero exit, or equivalent transport failure after producing a candidate result artifact, ABG shall attempt deterministic admission of that artifact against the original `DispatchRequest`. A valid artifact shall be available to closure/recovery logic; an invalid artifact shall become typed failure or gap truth.

**REQ-R-ABG3-TRANSPORT-015**: Downstream products may provide the concrete actor binding and domain-specific worker implementation, but they shall not replace ABG-owned actor invocation identity, progress observation, result admission, retry, or projection truth with a shadow runtime.

**REQ-R-ABG3-TRANSPORT-016**: A supervised process actor shall use an explicit ABG-owned invocation contract covering command, arguments, working directory, stdin or prompt source, environment policy, timeout policy, stream capture targets, result artifact reference, and worker binding identity.

**REQ-R-ABG3-TRANSPORT-017**: Environment sanitation for supervised actors shall remove parent-session control variables only by explicit policy. It shall preserve required authentication or runtime capability inputs unless policy explicitly classifies them as unsafe for the child process.

**REQ-R-ABG3-TRANSPORT-018**: Actor stdout and stderr observation shall be recorded as process-boundary evidence while the process is running when the transport can observe it. Post-exit transcript capture alone shall not satisfy live-observation proof for long-running actor dispatch.

**REQ-R-ABG3-TRANSPORT-019**: Actor invocation may return, block, fail, or time out only through typed ABG transport and result-admission outcomes. Worker self-report fields may inform transform assessment, but they shall not own retry, vector closure, traversal convergence, or release closure.

**REQ-R-ABG3-TRANSPORT-020**: When a supervised `F_P` actor invocation terminates, times out, or becomes non-progressing without an admitted result artifact, admitted report, stream evidence, or declared progress signal, ABG shall expose that fact as a typed traversal non-progress carrier. The carrier shall be derivable from admitted runtime truth and shall not be invented by a downstream product summary.

**REQ-R-ABG3-TRANSPORT-021**: A traversal non-progress carrier shall preserve the graph function, graph call, frame, vector, actor invocation, attempt, process identity when available, timeout class, stream byte counts, last heartbeat, signal sequence, exit status, artifact/report/progress observation flags, and evidence references used for classification.

**REQ-R-ABG3-TRANSPORT-022**: ABG shall not classify traversal non-progress when a valid result artifact or admitted report exists for the actor invocation. Artifact/report salvage and admission precede retry projection; no-progress is reserved for absence of semantically assessable worker output.

**REQ-R-ABG3-TRANSPORT-023**: A modulated `F_P` dispatch handoff shall carry the ABG-derived traversal attempt envelope or a stable ref to it. The handoff surface shall preserve selected schedule items, ordering constraints, phase gates, required progress artifact refs, gap-pressure refs, and affect refs needed to drive the worker without making prompt prose the authority surface.

**REQ-R-ABG3-TRANSPORT-024**: A worker or downstream product shall not invent a private schedule, retry, or chunking loop when a traversal attempt envelope is present. Any continuation, exhaustion, or forced-review result shall be admitted as ABG runtime truth.

**REQ-R-ABG3-TRANSPORT-025**: Every ABG-known runtime system and runtime asset surface that can affect supervised traversal liveness shall expose a declared, substrate-neutral probe contract. Probe contracts shall identify the observed runtime boundary, the source kind, the system or asset ref, and the evidence refs that can prove activity or interruption. Runtime asset activity includes event log append, ledger append/update, manifest creation/update, PTY capture output, stdout/stderr capture, result artifact creation, projection/report/dossier creation, archive/sidecar write, heartbeat/status stream, and typed external interruption evidence. They may be adapted to future telemetry backends, but ABG liveness law shall not depend on a telemetry vendor, span model, or non-ABG trace authority.

**REQ-R-ABG3-TRANSPORT-026**: Probe adapters shall publish raw runtime activity or interruption evidence only. They shall not decide retry, stop, graph advancement, closure, escalation, or traversal movement.

**REQ-R-ABG3-TRANSPORT-027**: ABG runtime liveness shall be governed by an inactivity lease over admitted probe activity. Any admitted activity for the active invocation from a declared system or asset probe source shall reset the lease. Activity evidence is not domain truth, closure truth, or artifact admission by itself.

**REQ-R-ABG3-TRANSPORT-028**: A hard elapsed-time safety cap may exist only as outer safety evidence. When it fires, ABG shall admit typed external interruption truth before any public summary or retry decision treats the invocation as stopped.

**REQ-R-ABG3-TRANSPORT-029**: A valid result artifact, admitted report, or declared progress observation produced before transport failure shall be deterministically admitted or rejected before no-progress, retry, or block classification.

**REQ-R-ABG3-TRANSPORT-030**: ABG-owned live transport paths shall prefer inactivity lease policy over flat subprocess timeout policy for long-running constructive work. A caller-local timeout shall not be the effective liveness authority for an invocation that continues to emit admitted probe activity.
