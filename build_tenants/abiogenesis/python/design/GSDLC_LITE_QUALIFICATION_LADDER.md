# GSDLC Lite — Qualification Ladder

**Status**: Active  
**Category**: Qualification Design  
**Date**: 2026-03-27  
**Derives from**: [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md), [GTL_3_INTERFACE_CONTRACTS.md](GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_MODULE_DESIGN.md](GTL_3_MODULE_DESIGN.md)

---

## Purpose

Define the single canonical sunny-day qualification ladder for the current ABG runtime.

This ladder is intentionally compositional:

- one installer-backed sandbox
- one evolving `gsdlc_lite` story
- one durable archive shape
- one growing chain of capabilities

Qualification rule:

> Every major current-runtime feature must appear in at least one successful composed sandbox run, or remain explicitly deferred from the ladder.

`F_H` interaction is deferred from the sunny-day ladder. Qualification is centered on `F_D` and `F_P`.

---

## Already Proved

These are already exercised in the canonical sandbox family:

1. real installer-backed sandbox bootstrap
2. deterministic `F_D` checks over real artifacts
3. `F_P` dispatch and result ingestion
4. explicit `Traversal` / `traverse(...)`
5. explicit `CandidateFamily` selection
6. lawful refinement / substitution
7. lineage spawn through `work_spawned`
8. persistent archive and postmortem capture
9. live transport qualification
10. zoomed `requirements -> decomposition -> dependency_chain -> sequencing -> design`

Current canonical proofs:

- [SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md)
- [SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md)
- [SCENARIO_REQUIREMENTS_TO_UAT.md](https://github.com/foolishimp/abiogenesis/blob/main/build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md)

---

## Mandatory Ladder

The following features must be represented in the `gsdlc_lite` ladder before release.

### Stage 0 — Current Baseline

**Feature**: chained delivery and zoomed design  
**Status**: done  
**Sunny-day proof**:

- `requirements -> design -> code`
- zoom selection on `requirements -> design`
- live and fake sandbox lanes

### Stage 1 — Fold-Back Closure

**Feature**: parent closure after child chain  
**Status**: done  
**Why it matters**:

- spawn alone is not enough
- the engine must prove that the outer contract closes lawfully after child convergence

**Sunny-day proof**:

1. select `zoomed_design_profile`
2. converge all child zoom edges
3. assert the parent `requirements -> design` contract is closed
4. continue the outer chain lawfully

**Expected evidence**:

- `workflow_selected`
- `work_spawned`
- per-child `assessed`
- typed closure in `gen_gaps`

**Current proof**:

- fake zoom chain qualification
- live zoom chain qualification
- archived run lineage shows child work progressing in graph order

### Stage 2 — Multi-Evaluator F_P Review

**Feature**: vector-capable `F_P` convergence  
**Status**: done  
**Why it matters**:

- single-judge `F_P` is already proved
- the runtime still needs a sunny-day composed path with multiple `F_P` evaluators over one edge

**Sunny-day proof**:

1. insert a `design review` gate between `design` and `code`
2. declare multiple `F_P` evaluators over the same `design` artifact
3. ingest all review results
4. prove convergence of the evaluator vector
5. advance to `design -> code`

**Expected evidence**:

- one `fp_dispatched` per review round
- multiple `assessed{kind: fp}` entries for the same edge
- typed convergence closure over the review vector

**Current proof**:

- fake `design -> design_review -> code`
- live `design -> design_review -> code`
- three `F_P` assessed events over one review edge in the live archive

### Stage 3 — Correction / Reset / Replay

**Feature**: correction and reset  
**Status**: fake-lane proved  
**Why it matters**:

- correction is implemented but not yet scenario-proved in the canonical ladder
- replay after certification shadowing is a release-risk feature

**Sunny-day proof**:

1. converge a `design review` or `design` edge
2. emit a lawful reset/correction
3. prove the prior certification is shadowed
4. replay the affected edge
5. reconverge the chain

**Expected evidence**:

- correction/reset event
- old convergence no longer treated as active
- new run lifecycle for the reopened edge

**Current proof**:

- fake reset over `design -> design_review`
- edge reopens under the same lineage
- replayed review edge reconverges before outer chain continuation

### Stage 4 — Bounded Subwork

**Feature**: `LeafTask` / bounded sub-work  
**Status**: fake-lane proved  
**Why it matters**:

- implemented in runtime
- not yet present in the sandbox ladder

**Sunny-day proof**:

1. place a leaf task inside `design -> code`
2. leaf task performs bounded internal work
3. parent run continues after leaf completion

**Expected evidence**:

- `leaf_task_started`
- `leaf_task_completed`
- sub-run identity under the parent run

**Current proof**:

- fake leaf-task execution inside `design_review -> code`
- traversal emits leaf task events and artifacts
- outer sandbox story still converges after assessment

### Stage 5 — Role / Worker Eligibility

**Feature**: role-gated execution  
**Status**: fake-lane proved  
**Why it matters**:

- current sandbox assumes one worker identity
- the runtime still needs a composed proof that role eligibility influences lawful dispatch

**Sunny-day proof**:

1. one step requires a distinct role
2. sandbox declares both worker identities
3. wrong worker is not selected
4. right worker executes the edge

**Expected evidence**:

- explicit worker identity in `run_bound`
- no hidden fallback to the wrong worker

**Current proof**:

- fake reviewed ladder with `designer`, `reviewer`, and `coder` workers
- each worker advances only its lawful phase
- event log records distinct `worker_id` values across the chain

### Stage 6 — Transport Failure / Retry

**Feature**: classified transport failure with recovery  
**Status**: pending  
**Why it matters**:

- current live lane proves happy path
- the ladder still needs one composed failure-and-recovery proof

**Sunny-day proof**:

1. force one `F_P` dispatch failure
2. classify the failure
3. retry or re-dispatch lawfully
4. eventually converge

**Expected evidence**:

- transport failure classification
- no duplicate or ambiguous run ownership
- successful later convergence

---

## Deferred From Sunny-Day Ladder

These may remain covered by collective tests or design-level traceability, but do not block the canonical ladder:

1. real `F_H` human interaction infrastructure
2. selfhosting drift as part of the main sandbox story
3. pure interface/identity laws that are already collectively covered
4. projection edge cases that do not materially alter the `gsdlc_lite` story

---

## Collective-Only Support Features

These still need tests, but do not need to become separate sandbox stories:

1. `REQ-L-GTL3-INTERFACE`
2. `REQ-L-GTL3-JOB`
3. `REQ-L-GTL3-ROLE`
4. `REQ-R-ABG3-PROJECTION`
5. `REQ-R-ABG3-RUN`
6. `REQ-R-ABG3-SELFHOSTING`

They should remain supported by collective/kernel tests unless the canonical ladder naturally pulls them in.

---

## Implementation Order

Recommended order for ladder completion:

1. transport failure/retry

This order is deliberate:

- it keeps the story inside one composed sandbox
- it leaves only one major runtime-risk feature still unproved in the canonical ladder
- it defers infrastructure-heavy concerns without pretending they are solved

---

## Acceptance Standard

The ladder is complete only when:

1. every non-deferred ladder feature appears in at least one successful fake-lane sandbox run
2. every transport-sensitive feature appears in at least one successful live-lane sandbox run
3. each run leaves a durable archive under `test_runs/`
4. the event log is sufficient to reconstruct lineage, convergence, and replay truth without inference
