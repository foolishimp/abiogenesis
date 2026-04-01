# Proposal: Tail-Loop Event-Backed Recursive Interpreter

Date: 2026-04-01
Author: Codex
Context: follow-on to the GraphFunction recursion correction work
Audience: ABG / GTL runtime owners

## Purpose

Propose the next correction step after restoring local frame semantics:

- make recursion operative, not merely declared
- extend GTL recursion declaration so fold-back law is explicit, not
  interpreter-invented
- preserve explicit recursive context across descent
- avoid dependence on Python call-stack depth
- keep suspend/resume, replay, and fold-back lawful through events

## Executive Position

ABG should implement recursion as a tail-loop recursive interpreter backed by
explicit invocation context and event-carried frame state.

This means:

- recursion is real interpreter behavior
- GTL recursion publishes both termination and fold-back law
- context is passed through every descent
- Python stack frames are not the durable truth surface
- events persist the recursive state needed to suspend, resume, replay, and
  fold back
- fold-back never means automatic parent certification
- nested traversal targets may be frame-local, not module-global only

This is the correct bridge between:

- GTL's lawful `recurse(...)` capability
- ABG's event-sourced runtime
- deep recursion safety

## Problem With The Current State

The current runtime is better than the old global rewrite model, but it is
still not fully done as a recursive foundation.

What it does now:

- selection opens local frames
- child work is spawned as lineage
- parent convergence happens by fold-back

What it still does not do:

- treat GTL `recurse(...)` as operative runtime semantics
- drive recursive descent through one explicit recursive interpreter
- carry a canonical recursive invocation context through descent/resume

Today, recursion is still split:

- GTL declares recursive capability
- ABG runs local frames
- scheduler re-entry is still the effective continuation mechanism

That is not the same as one true recursive runtime.

## Why Not Pure Python Call Recursion Alone

We can use Python recursive function calls for local control flow, but not as
the only runtime state carrier.

Why:

- F_P and F_H steps suspend
- work must resume later
- event replay must reconstruct runtime truth
- crash recovery cannot depend on Python locals
- depth around 1000 is too close to Python recursion limits to be a credible
  engine foundation

So the right rule is:

- recursion semantics: yes
- explicit passed context: yes
- Python call stack as the only storage of recursive truth: no

## Proposed Runtime Shape

Implement a tail-loop recursive interpreter with explicit invocation state.

### Core runtime objects

- `InvocationContext`
  - `root_work_key`
  - `run_id`
  - `stack`
  - `workflow_version`
  - `spec_hash`
  - `runtime_identity`

- `FrameState`
  - `frame_id`
  - `parent_frame_id | None`
  - `work_key`
  - `graph_function`
  - `materialization_id`
  - `termination_contract`
  - `step_cursor`
  - `status`
  - `bound_context`
  - `foldback_buffer`

- `Continuation`
  - explicit next action
  - no hidden strategy

### Runtime rule

The interpreter owns one explicit stack of `FrameState` values.

The control loop is iterative:

- inspect top frame
- determine next action
- descend by pushing child frame
- advance by updating top frame
- return by popping frame and producing fold-back input for parent re-binding
- suspend by emitting snapshot state and stopping cleanly

This is semantically recursive but mechanically stack-safe.

## Operative Meaning Of `recurse(...)`

`gtl.algebra.recurse(graph_function, termination, *, foldback)` should no
longer be merely a metadata tag.

It should mean:

- this graph function may re-enter itself or another declared recursive
  application
- the interpreter must honor the declared termination contract
- the interpreter must honor the declared fold-back contract
- recursive descent must preserve outer contract stability
- fold-back is the only lawful parent return mechanism
- parent completion requires lawful re-binding/re-evaluation against declared
  parent truth, not direct certification from child closure alone

ABG should read the recursion declaration and create a recursive frame rather
than treating it as descriptive metadata only.

## Declared Fold-Back Contract

The proposal now requires GTL to declare fold-back law directly.

Without this, ABG would still be forced to invent recursive return semantics in
the interpreter, which is exactly what we are trying to prevent.

Minimum declaration shape:

- `termination`
  - existing boundedness contract
- `foldback`
  - `mode = "rebind"`
  - `binding = <declared parent-absorption contract or symbolic reference>`
  - `requires_parent_evaluation = true`
  - optional policy-visible payload fields

Minimum law:

- the declaration says how child return truth binds into the parent contract
- the declaration does not allow direct parent certification from child closure
- parent convergence still depends on parent re-evaluation after lawful
  absorption

If GTL cannot express this, the recursive interpreter is still under-declared.

## Fold-Back Law

This proposal must be stricter than the current frame patch.

`frame_foldback` is not equivalent to `edge_converged`.

Child completion means only:

- child frame has produced lawful return material
- that material is eligible to re-bind into the parent frame
- the parent may now be re-evaluated

It does not mean:

- parent edge is automatically converged
- parent proof is inherited merely because child steps closed

The lawful rule is:

- child frame closes
- interpreter derives `FoldBackOutcome`
- parent frame absorbs that outcome through a declared fold-back contract
- parent boundary is re-bound and re-evaluated
- only then may parent convergence be certified

If ABG ever certifies the parent directly from "all child steps closed", that is
still the wrong model.

Minimum runtime objects added by this rule:

- `FoldBackOutcome`
  - `frame_id`
  - `parent_frame_id | None`
  - `work_key`
  - `contract_id`
  - `payload`
  - `provenance`

- `ParentRebindResult`
  - the parent boundary after lawful fold-back absorption
  - enough proof surface to run the parent's declared evaluators again

## Frame-Local Traversal Target Law

True recursion requires more than pushing and popping frames.

The interpreter must know how to resolve traversal targets inside a materialized
inner graph.

Today, traversal-target resolution is still largely module-bound. That is not
sufficient for real recursive graph execution.

The recursive interpreter therefore needs a frame-local traversal surface.

### Required rule

Every `FrameState` must carry or reference a lawful traversal surface for the
materialized graph active in that frame.

Minimum contents:

- frame-local `Graph`
- frame-local `GraphVector`s
- frame-local `RefinementBoundary` declarations
- frame-local `CandidateFamily` declarations
- recursive declarations active for the frame

### Resolution order

For a frame-local step:

1. resolve `CandidateFamily` or `RefinementBoundary` from the frame-local
   traversal surface
2. if explicitly imported/published, resolve from module/global surface
3. otherwise fail closed

The prime recursive model must not synthesize fake boundaries for inner steps as
its semantic fallback.

### Validation law

Frame-local publication surfaces need the same fail-closed validation law that
module publication already requires.

That means the recursive runtime must have the frame-local equivalent of:

- `validate_module_selection_surface()`
- `validate_module_traversal_surface()`

Required frame-local law:

- hidden structural alternatives are not lawful
- ambiguous declared `CandidateFamily` truth is not lawful
- ambiguous declared `RefinementBoundary` truth is not lawful
- missing traversal targets fail closed

If these checks exist only at module scope, recursion can still recreate the
same bug one frame lower.

### Consequence

A materialized inner graph may itself publish lawful structural alternatives.

That means nested recursive alternatives are allowed, but they are:

- frame-local unless explicitly exported
- still governed by the same contract/interface rules
- still provenance-carrying

This is how ABG becomes "real recursive graph" rather than one-level local
expansion.

## Event Model

The recursive interpreter should use events as durable recursion truth.

Minimum event family:

- `frame_opened`
- `frame_context_bound`
- `frame_step_started`
- `frame_step_completed`
- `frame_descended`
- `frame_suspended`
- `frame_resumed`
- `frame_foldback`
- `frame_rebound`
- `frame_closed`

Optional but useful:

- `frame_failed`
- `frame_terminated`
- `frame_limit_reached`

Event payload must be sufficient to reconstruct:

- the current frame stack
- current cursor in each frame
- lineage and parent/child linkage
- materialization identity
- bound context and carry-forward references
- pending continuation

But event authority must remain single-surface:

- causal events are authoritative
- published declarations are authoritative
- snapshots are derived caches/checkpoints only
- replay must be able to ignore snapshots and still reconstruct lawful state

So `frame_suspended` may carry a resumable checkpoint, but that checkpoint is
not constitutional truth. It is a cache for restart speed only.

If snapshot content disagrees with authoritative causal events, the snapshot is
discarded.

## Pseudocode

```python
def run_recursive(ctx: InvocationContext, stream: EventStream) -> Outcome:
    stack = ctx.stack

    while stack:
        frame = stack[-1]
        action = next_action(frame, stream)

        if action.kind == "descend":
            child = open_child_frame(frame, action)
            emit("frame_descended", {...})
            emit("frame_opened", serialize(child))
            stack.append(child)
            continue

        if action.kind == "advance":
            updated = advance_frame(frame, action)
            stack[-1] = updated
            emit("frame_step_completed", {...})
            continue

        if action.kind == "suspend":
            emit("frame_suspended", snapshot(stack))
            return Suspended(snapshot(stack))

        if action.kind == "return":
            outcome = close_frame(frame)
            emit("frame_closed", {...})
            stack.pop()
            if stack:
                rebound = rebind_parent_from_foldback(stack[-1], outcome)
                emit("frame_foldback", {...})
                emit("frame_rebound", {...})
                stack[-1] = rebound
                continue
            return outcome

        if action.kind == "re_evaluate_parent":
            updated_parent = re_evaluate_parent(frame, stream)
            stack[-1] = updated_parent
            if updated_parent.status == "closed":
                emit("edge_converged", {...})
                continue
            continue

    return Complete()
```

This is the intended shape:

- tail-loop
- explicit stack
- explicit context
- event-backed suspension/resume
- fold-back followed by lawful parent re-binding/re-evaluation

## Context Passing

The interpreter must pass context explicitly through descent.

Context should include:

- authored GTL contexts resolved for the frame
- runtime provenance
- parent fold-back state
- child-specific work key
- current traversal target
- frame-local traversal surface
- current termination state

This avoids hidden mutable ambient state and keeps recursion lawful under
replay.

## Reset And Correction Law

Recursive runtime truth must obey the existing reset/correction model.

That means any recursive interpreter must apply reset containment rules to:

- active frames
- frame progress
- fold-back outcomes
- parent rebind results
- resumable checkpoints
- cached projections/indexes

### Required rule

Any frame-local progress older than the latest applicable reset for its scope is
stale and must be ignored during replay.

This includes:

- `frame_step_completed`
- `frame_foldback`
- `frame_rebound`
- `frame_closed`
- cached `frame_suspended` checkpoints

### Reset behavior

- workspace reset invalidates all frames
- work_key reset invalidates frames in that lineage subtree
- edge reset invalidates only that edge slice within the lineage subtree

When reset invalidates a frame:

- projection must show that frame as stale/reopened/void, not current truth
- resumable checkpoints for that scope are discarded
- parent convergence cannot rely on stale fold-back state

Optional explicit event:

- `frame_invalidated`

That event is projection aid only; invalidation authority still comes from
causal reset events plus containment rules.

## Frame Identity And Attempt Law

Reset semantics are not complete unless frame identity is explicit.

The current frame patch uses deterministic structural identity. That is not
sufficient for true recursive replay if frames can reopen after reset/retry.

The recursive model should therefore distinguish:

- `frame_lineage_id`
  - stable identity for the structural recursive slot
- `frame_attempt_id`
  - fresh identity for each active attempt

Required law:

- reset/retry reopens the frame with a fresh `frame_attempt_id`
- stale `frame_step_completed`, `frame_foldback`, `frame_rebound`, and
  `frame_closed` events from earlier attempts must not alias the current one
- projections may group by `frame_lineage_id`, but current truth must bind to
  `frame_attempt_id`

If the runtime reuses one deterministic `frame_id` across attempts, stale frame
history can still alias current truth unless invalidation is perfect. The safe
design is fresh attempt identity.

## Depth And Safety

With this design, depth safety is not tied to Python recursion depth.

Expected properties:

- depth 10: trivial
- depth 100: should be normal
- depth 1000: plausible, but only if projection/binding stop re-scanning the
  entire event log on every step

So the design does not magically make 1000 cheap. It makes it possible.

Performance prerequisites for deep recursion:

- frame index by `frame_id`
- active child index by `parent_frame_id`
- latest event index by `(edge, work_key)`
- cached projection for hot replay paths

Without those indexes, the runtime will degrade because current bind/projection
paths repeatedly scan the full event log.

## Migration Plan

### Phase 0

Extend GTL recursion declaration before interpreter refactor:

- `recurse(..., foldback=...)`
- declared fold-back contract with required rebind/re-evaluate law
- tests that fail closed on missing or unlawful fold-back declaration

### Phase 1

Introduce explicit recursive invocation types:

- `InvocationContext`
- `FrameState`
- `Continuation`

### Phase 2

Teach `abg.interpret` to execute recursive descent from `recurse(...)`
declarations rather than treating them as metadata only.

Add frame-local traversal-surface resolution for nested `CandidateFamily` and
`RefinementBoundary` truth, plus frame-local fail-closed publication validation.

### Phase 3

Replace scheduler re-entry as the primary recursive continuation mechanism with
the tail-loop recursive interpreter.

Scheduler re-entry may remain as a transport/app seam, but not as the semantic
engine of recursion.

### Phase 4

Add frame indexes, projection caches, and reset-aware invalidation logic.

### Phase 5

Qualify depth:

- 10 nested recursive descents
- 100 nested recursive descents
- stress target 1000 with timing and memory evidence

## Acceptance Criteria

The proposal is realized only when all of the following are true:

1. `recurse(...)` changes runtime behavior, not just declarations.
2. GTL declares both termination and lawful fold-back binding for recursion.
3. Recursive descent carries explicit invocation context through every level.
4. Parent completion never occurs directly from child closure; parent
   certification requires lawful fold-back absorption and parent re-evaluation.
5. Nested frame-local steps resolve their own published traversal targets
   without relying on synthetic fallback boundaries.
6. Frame-local publication surfaces fail closed on hidden, ambiguous, or
   missing alternatives just as module publication does.
7. Suspension and resume reconstruct the recursive stack from authoritative
   events; snapshots are optional caches only.
8. Reset/correction invalidates stale frame progress, fold-back outcomes, and
   resumable checkpoints according to existing containment law.
9. Reopened frames mint fresh attempt identity rather than aliasing prior
   attempt history.
10. Published module topology remains stable during recursion.
11. Depth does not depend on Python recursion limits.
12. Qualification tests exist for at least 10 and 100 levels before claiming
   deep-recursion readiness.

## Answers To Current Open Questions

### Should fold-back certify the parent directly?

No.

Fold-back should only make the parent lawfully re-bindable and re-evaluable.
Parent certification happens only after the parent's declared truth surface
passes again.

### Are nested recursive alternatives module-only or can they be frame-local?

They can be frame-local.

A materialized inner graph may publish frame-local `CandidateFamily` or
`RefinementBoundary` truth. Those alternatives remain local unless explicitly
exported.

### Are `frame_suspended` snapshots authoritative?

No.

They are resumable caches/checkpoints only. Authoritative truth remains:

- causal events
- published declarations
- reset containment rules

## Recommendation

Adopt this proposal.

Do not stop at local frames plus scheduler re-entry.

That was the right correction away from global rewrite, but it is not the final
recursive foundation.

The final foundation should be:

- true recursive interpreter semantics
- explicit passed context
- tail-loop execution
- event-backed suspension/resume
- fold-back as canonical return
