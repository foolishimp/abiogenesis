# B-003 Restore Gap-First F_D Authority And Remove Post-F_P Closure Regression

- id: B-003
- title: Restore gap-first F_D authority and remove post-F_P closure regression
- type: bug
- status: active
- goal: runtime-convergence-governance
- priority: critical
- created_at: 2026-04-13
- updated_at: 2026-04-13

## Triage

- intake: bug / regression / downstream operator finding
- repriced_from: runtime_hardening
- repriced_to: requirement_and_design_root_cause
- affected_boundary: ABG post-dispatch convergence, closure, and downstream gap authority
- lawful_re_entry: ABG convergence requirements, constitutional/module design surfaces, then runtime result-ingest implementation
- downstream_proof_span: odd_method T-004 gap train, installed `data_mapper.test31` traversal, and ABG runtime proving lanes

## Context

An installed downstream workspace (`odd_method` -> `data_mapper.test31`) halted on
`closure_failed` with `policy_reason = fd_failures_unresolved_after_fp` after a
successful `F_P` turn on `derive_implementation_design_surface`.

That stop signature was not caused by the new gap train. The downstream domain
already models `F_D` as the first observer in the gap path:

- `gen_gaps -> bind_fd` produces the raw deterministic finding set
- `odd_sdlc.triage.enrich_gap_snapshot(...)` turns that into observation,
  triage, route proposal, and route binding

But ABG runtime ingestion still performs a second post-transform deterministic
recheck in `result_ingest.py`, then promotes unresolved `F_D` findings back into
closure authority. That emits:

- `proof_passed`
- `closure_failed`
- `found { kind = "fd_gap" }`

and stops the run before the downstream gap/intent loop can own the outcome.

## Why This Bug Matters

This regression is especially costly because it does not look like a substrate
crash. It produces behavior that appears almost lawful:

- `F_D` still exists in the gap model
- downstream `T-004` homeostatic artifacts still publish
- emitted events still look governed
- but live execution is being cut short by a second closure authority path

That combination can mislead operators into tightening prompts, triage, or
domain policy while the real defect is an authority inversion inside ABG.

## Forensic Signature

The downstream stop sequence was:

1. worker turn returned successfully
2. `proof_passed` emitted
3. ABG reran manifest-local `F_D`
4. unresolved `F_D` caused:
   - `closure_failed`
   - `found { kind = "fd_gap" }`
5. graph call failed and the run stopped

The concrete downstream case was paperwork-style upstream incompleteness:

- `scenario_surface` existed
- heading was corrected
- required generated-surface marker was still missing

That is exactly the class of issue that should become a gap/intent obligation,
not a traversal-stopping closure event during construction.

Concrete downstream identifiers for the observed halt:

- workspace: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper.test31`
- run id: `94f12ca7-a3c9-41f3-bff0-ed6157b46b0d`
- call id: `call-94f12ca7-a3c9-41f3-bff0-ed6157b46b0d`
- proof event id: `ca30d36c6ac94b11885fea44ede85583`
- closure_failed event id: `b7768a8b81724c9e91863b74da856148`
- found(fd_gap) event id: `3e59ab1692f94460affa9ee4758ee4fc`
- graph_call_failed event id: `30c5367e3bb84926b8f2f35bb29a0afb`
- evidence archive: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper.test31/.ai-workspace/events/events.jsonl`

## Existing Correct Path Versus Regressed Path

### Correct Path Already Present

The downstream domain already has the intended observer ordering:

1. `gen_gaps`
2. `bind_fd`
3. raw deterministic finding set
4. `odd_sdlc.triage.enrich_gap_snapshot(...)`
5. observation
6. triage
7. route proposal / route binding
8. intent-compatible re-entry

In that model, `F_D` is the first stage of the gap train.

### Regressed Path

ABG result ingestion currently adds a second path after transformation:

1. `F_P` result ingested
2. `proof_passed`
3. `_rerun_manifest_fd_failures(...)`
4. unresolved `F_D` becomes `closure_failed`
5. `fd_gap` is emitted only after the stop decision

That means observer truth is being interpreted twice:

- once correctly at gap time
- once incorrectly as closure truth after transformation

This ticket exists to remove that ambiguity from requirements, design, and then
runtime.

## Regression Point

The post-transform `F_D` closure recheck entered the runtime in commit:

- `9bcc8f2132ea3493ed60948d404332703c5853e1`
- `2026-04-11 16:29:57 +1000`
- `Surface unresolved post-continuation FD gaps as fd_gap`

That commit added `_rerun_manifest_fd_failures(...)` and wired
`fd_failures_unresolved_after_fp` into `closure_failed` in
`build_tenants/abiogenesis/python/code/genesis/result_ingest.py`.

## What This Ticket Is And Is Not

### This Ticket Is

- a tightening of ABG requirement and design law
- a restoration of gap-first observer authority
- a removal of one specific post-transform closure regression
- a clarification of which classes of truth may still stop construction
- an explicit reproving of runtime-envelope and engine-kernel tests that
  currently institutionalize the regression

### This Ticket Is Not

- removal of `F_D`
- removal of deterministic evaluation
- removal of closure as a concept
- a claim that all runtime failures should fall forward
- a downstream `odd_sdlc` redesign

`F_D` remains necessary. The correction is that ordinary constructive
incompleteness must be observed and routed through gap/intent, not used as a
transformation-time stop authority.

## Root Cause

This is not only a runtime bug. It is a requirement/design drift that allowed
the regression to appear lawful.

### 1. Runtime Regression

`result_ingest.py` currently gives post-transform `F_D` reruns blocking closure
authority during traversal.

That is the direct regression.

### 2. Requirement Drift

`REQ-R-ABG3-CONVERGENCE-005` currently says:

- after constructive `F_P` work returns, ABG shall re-run proof and closure
  before terminal success or further escalation

That statement is too broad. It does not distinguish:

- deterministic observer truth that should feed gap/continuation/intent
- genuine blocking closure truth

### 3. Design Drift

The same ambiguity is repeated in published design:

- `specification/ABG_3_CONSTITUTIONAL_DESIGN.md` section 11.3
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md` section 6.5

Both currently restate:

- re-run proof and closure after `F_P` returns

without declaring that transformation-time observer reruns are not themselves
authorized to stop constructive traversal for ordinary incompleteness.

### 4. Missing Invariant

ABG needs an explicit invariant:

- transformation traverses
- observers observe
- gap/continuation/intent absorbs constructive incompleteness
- declared hard-stop policy, safety/config/integrity blockers, explicit
  constitutional approval, or release acceptance may still stop promotion

Without that invariant, closure authority keeps creeping back into the
transformation path.

## Requirement And Design Tightening Needed

Future reviewers should read this ticket as a correction of *where* authority
belongs, not merely *what* code path fired.

The missing clarifications are:

1. Post-transform observer replay is not automatically blocking closure truth.
2. Ordinary constructive incompleteness is gap truth first.
3. Closure may still block, but only for declared blocker classes, including
   lawful pre-dispatch hard-stop policy.
4. `fd_gap` is an observer/result classification, not by itself a mandate to
   stop constructive traversal.
5. Transformation does not own stopping authority merely because it just ran.

Those points need to be made explicit in requirement and design language so a
later refactor cannot lawfully reintroduce this behavior.

## Proposed Authority Model

For the purposes of this ticket, ABG should distinguish at least:

- `constructive_obligation`
  - missing paperwork, incomplete generated contracts, shallow realization,
    unresolved but buildable dependency obligations
  - produces gap/continuation/intent truth
  - does not stop constructive traversal
- `constitutional_obligation`
  - requires product/goals/intent/requirements repricing or approval-bearing
    governance
  - may open approval or continuation truth
- `release_blocker`
  - tolerated during construction, not tolerated at go-live or release
    acceptance
- `safety_or_integrity_blocker`
  - runtime defect, malformed config, broken identity, corrupted state,
    invariant violation
  - fails closed immediately
- `declared_transition_hard_stop`
  - policy explicitly removes transition action and requires fail-closed
    treatment before transformation dispatch
  - remains lawful and must not be deleted by this fix

This ticket does not need to finalize every downstream domain taxonomy, but ABG
must explicitly stop treating unresolved post-transform `F_D` as if it were
always a blocking closure class.

## Current Blast Radius

The disputed behavior is not only in runtime code. Current proving lanes
already encode it as correct and must be repriced together with the runtime:

- `build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py`

Those tests currently prove two different things that must remain distinct after
the fix:

- post-transform unresolved `F_D` after successful `F_P` currently stops
  traversal and is the regression to remove
- declared pre-dispatch hard-stop semantics such as
  `fd_fail_without_transition_action: fail` are lawful and must remain

## Why Repriced

This cannot be handled as a local code deletion only.

If the requirement and design surfaces remain ambiguous, the runtime bug will
recur under later refactors because the current published law still makes the
post-`F_P` closure replay sound admissible.

The fix therefore needs to start at the constitutional and requirement/design
layer, then flow into runtime implementation.

## Review Questions

An independent reviewer should be able to answer all of these from this ticket
alone:

1. Why is this an ABG bug rather than an `odd_sdlc` bug?
2. What exact regression commit introduced the behavior?
3. What part of the current requirement/design text allowed the regression to
   look lawful?
4. Why is deleting `_rerun_manifest_fd_failures(...)` alone insufficient?
5. What authority is being restored to the gap train?
6. Which blocker classes are still intended to fail closed, including declared
   pre-dispatch hard-stop policy?
7. What downstream evidence proves the bug today?
8. What downstream run should prove the fix after repricing?

## Task List

- [x] Reprice the active convergence requirement so post-transform deterministic reruns are classified by authority:
  - observer truth that feeds gap/continuation/intent
  - blocking truth that may still fail closed
- [x] Reprice constitutional and module design so constructive traversal is not allowed to regain blocking closure authority through generic post-`F_P` replay.
- [x] State the explicit invariant that transformation-time evaluator reruns do not stop constructive traversal for ordinary incompleteness.
- [x] Define the lawful blocker classes that still fail closed:
  - declared pre-dispatch hard-stop policy
  - safety/integrity/runtime defects
  - policy/config defects
  - explicit constitutional approval gates
  - release/go-live acceptance blockers
- [x] Remove post-transform `F_D` reruns from traversal-stopping closure authority in `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`.
- [x] Reprice or delete ABG proving tests that currently institutionalize the post-transform stop as correct.
- [x] Keep deterministic post-transform observations available as emitted fact truth for downstream gap/continuation/intent handling.
- [x] Prove that unresolved deterministic incompleteness now surfaces into the gap train rather than `closure_failed -> fd_gap -> stop`.
- [x] Prove that genuine malformed/config/safety defects still fail closed.
- [ ] Re-run downstream installed proof on `data_mapper.test31` and confirm the previous stop signature no longer halts constructive execution.

## Proof Shape

The completed fix should let a reviewer inspect:

- the repriced requirement clause
- the repriced constitutional/module design clauses
- the runtime diff removing post-transform `F_D` stop authority
- the downstream event stream before/after comparison

The minimum downstream proof should show:

- before: `proof_passed -> closure_failed -> found(fd_gap) -> stop`
- after: `proof_passed` plus gap/intent-compatible observation without
  traversal-stopping closure for the same class of incompleteness

and separately:

- malformed config or safety defects still fail closed

## Non-Goals

This ticket does not attempt to:

- redesign downstream homeostatic triage semantics
- settle all release-acceptance policy for every consumer domain
- remove ABG closure publication entirely
- collapse approval, release, and safety blockers into one class

## Acceptance

- ABG requirement and design surfaces explicitly distinguish post-transform observer truth from blocking closure truth.
- Post-transform `F_D` reruns no longer stop ordinary constructive traversal.
- Unresolved deterministic incompleteness after `F_P` becomes gap/continuation/intent-compatible fact truth rather than immediate terminal closure.
- Safety, configuration, and integrity defects still fail closed.
- Downstream `odd_method` gap/intent control remains the authority for ordinary constructive incompleteness.
- `data_mapper.test31` no longer stops at `fd_failures_unresolved_after_fp` for paperwork-style upstream incompleteness such as generated-surface contract markers.

## Links

- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md`
- requirement: `/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- design: `/Users/jim/src/apps/abiogenesis/specification/ABG_3_CONSTITUTIONAL_DESIGN.md`
- design: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- downstream evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper.test31/.ai-workspace/events/events.jsonl`
