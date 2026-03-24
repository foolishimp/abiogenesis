# Engine Correctness (REQ-F-BIND-*, REQ-F-CORE-*)

**Traces to**: INT-001

### REQ-F-BIND-001 — ContextResolver digest mismatch halts execution

Context integrity is enforced — the engine must not substitute fallback content for corrupted contexts.

**Acceptance Criteria**:
- AC-1: `ContextResolver` loads context by scheme (`workspace://` resolves to filesystem path)
- AC-2: If a context has a non-pending SHA-256 digest and the loaded content does not match → halt with exit code 1
- AC-3: Engine must not substitute `[context unavailable]` or empty string for integrity failures
- AC-4: Pending digests (`sha256:0*64`) bypass verification (content not yet stabilised)

### REQ-F-CORE-001 — project() "current" projection observes edge_started events

The asset projection function derives current state from the event stream.

**Acceptance Criteria**:
- AC-1: `project(stream, asset_type, instance_id)` returns the current asset state
- AC-2: "current" projection filters `edge_started` events by target asset type
- AC-3: Projection is deterministic: same stream + same args = same result
- AC-4: Projection for instance I never reads events of instance J (isolation)
- AC-5: Current state is not stale during active iteration — `edge_started` events update the projection

### REQ-F-CORE-002 — Projection determinism invariant

The projection function is a pure function of the event stream.

**Acceptance Criteria**:
- AC-1: `project(S, T, I) = project(S, T, I)` — same stream, same type, same instance always produces identical output
- AC-2: No hidden state, caching, or side effects in the projection path
- AC-3: Property tests verify determinism across randomised event sequences

### REQ-F-CORE-003 — Event stream completeness

All prior asset states are reconstructable from the event stream.

**Acceptance Criteria**:
- AC-1: Every state-changing operation produces at least one event
- AC-2: `project(stream[0..k])` reconstructs the asset state at any point k in the stream
- AC-3: Corrupted event log lines fail visibly — never silently skipped

### REQ-F-CORE-004 — F_D pre-computation produces PrecomputedManifest

The binding phase computes everything possible without an LLM.

**Acceptance Criteria**:
- AC-1: `bind_fd()` produces a PrecomputedManifest containing: job, current asset state, failing/passing evaluators, F_D results, resolved contexts, and delta summary
- AC-2: Passing evaluators are excluded from the F_P prompt — they are provably outside the ambiguity bounds
- AC-3: `bind_fp()` assembles the F_P prompt from the PrecomputedManifest — template assembly only, no LLM invocation

### REQ-F-CORE-005 — ContextResolver loads and verifies context documents

Context documents are loaded by scheme and verified by digest.

**Acceptance Criteria**:
- AC-1: Supports `workspace://` scheme (resolves relative to workspace root)
- AC-2: Directory locators recursively collect readable files, prefix each with relative path
- AC-3: SHA-256 digest verification — mismatch halts execution
- AC-4: Pending digest (`sha256:0*64`) skips verification
- AC-5: Unimplemented schemes (V1) degrade gracefully without halting

### REQ-F-CORE-006 — Worker scheduling partitions by write territory

Workers with overlapping write territory must not execute concurrently.

**Acceptance Criteria**:
- AC-1: `schedule(workers)` returns batches of non-conflicting workers
- AC-2: Conflict detection is based on `Worker.writable_types` (target asset names)
- AC-3: Batch i completes before batch i+1 starts
- AC-4: V1: single worker is trivially `[[worker]]`
