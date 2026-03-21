# STRATEGY: ABG 1.0 MVP — Definitive Task Plan

**Author**: Claude Code
**Date**: 2026-03-21T18:00:00Z
**Purpose**: Single authoritative task list for ABG 1.0 MVP. Consolidates all prior plans and gap analysis findings into one dependency-ordered, non-duplicated plan.
**Revised**: r1 2026-03-21T18:30:00Z — Codex review fixes: (1) EC1 split into 2.2a (schema prerequisite) + 2.2b (fluent), (2) release order inverted — proof gates release, (3) pressure test downgraded from "proved" to "working hypothesis," (4) REQ parser widened from `REQ-F-*` to `REQ-*` to match engine's generic contract
**Supersedes**: Scattered tasks across `genesis_sdlc` posts (`20260321T113000_STRATEGY`, `20260321T150000_STRATEGY`, `20260321T160000_SCHEMA`)
**Provenance**: Three-agent convergence (Claude, Codex, Gemini) across formal gap analysis, pressure test matrix, and closure judgment
**For**: all

---

## ABG 1.0 MVP Definition

**Claim**: ABG is the kernel/TCP layer — it guarantees single-hop A→B traversal with F_D/F_P/F_H hooks, truthful convergence reporting, and sufficient abstraction for higher-order systems to build on.

**Success metric** (per Gemini): An agent successfully completes a job *without* being given the history of previous failures or certifications. The kernel handles transport reliability. WiFi just works.

**Working hypothesis**: Zero new GTL primitives needed. Pressure test matrix indicates all 9 future feature sets are likely expressible with current GTL + abg + composition law (Codex: "probably still achievable without new primitives" contingent on composition law being made more explicit around observer-relative homeostasis, intent routing, and local-to-global consistency). This hypothesis is validated or falsified during implementation — if a gap forces a primitive, classify it per the decision rules before adding.

---

## Task Plan

### Phase 1: Fix the Custody Handoff (gsdlc)

The requirements custody failure (S1) — the system evaluates the wrong requirements for every non-gsdlc project. False convergence. Product-viability severity.

| # | Task | Description | Dep |
|---|------|-------------|-----|
| 1.1 | **`instantiate()` signature** | Accept optional `requirements` parameter: `instantiate(slug, requirements=None)`. When provided, overrides workflow's hardcoded 33 keys. Backward compatible. | — |
| 1.2 | **Layer 3 wrapper generation** | Installer generates `.genesis/gtl_spec/packages/{slug}.py` that parses `### REQ-*` headers from `specification/requirements.md` and passes to `instantiate(requirements=_load_reqs())`. Parser must match the engine's own generic `REQ-*` pattern (see `check-req-coverage` in `__main__.py`), not a subtype-specific pattern. System-owned, rewritten on every redeploy. | 1.1 |
| 1.3 | **Scaffold requirements.md** | Installer creates `specification/requirements.md` with starter template on fresh install, only if file doesn't exist. | 1.1 |

### Phase 2: Kernel Hardening — Observation Surface (abg + gsdlc)

Three fixes from the formal gap analysis. Each plugs a "complexity leak" where infrastructure state leaks into the agent's cognitive load.

| # | Task | Description | Dep | Gap ID |
|---|------|-------------|-----|--------|
| 2.1 | **Context digest in spec_hash** | Extend `job_evaluator_hash()` (or create `job_context_hash()`) to include `Edge.context[].digest` in the certification hash. When any context's content changes, all F_P certifications for edges binding that context are automatically invalidated. The generalized "keepalive." | — | EC3 |
| 2.2a | **Event schema: add `manifest_id`** | Extend `fp_dispatched` event payload to include a `manifest_id` field (unique per dispatch). Extend `assessed` event payload to include the corresponding `manifest_id`. Update `domain_model.md` event schema. This is the prerequisite carrier — without it, the pending fluent has no identity to track. | — | EC1 |
| 2.2b | **Pending fluent** | Add `pending(edge, manifest_id, stale_after_ms)` fluent. `fp_dispatched` initiates it (keyed on `manifest_id`), `assessed` terminates it. `bind_fd()` checks `holdsAt(pending)` before re-dispatch to prevent duplicate work. Kernel reports `pending → stale` transition; orchestrator decides policy. Kernel detects, OS decides. | 2.2a | EC1 |
| 2.3 | **PackageSnapshot carrier enforcement** | `emit()` validates that work events (`edge_started`, `edge_converged`, `assessed`, `approved`) include `package_snapshot_id` when a PackageSnapshot is active. Engine computes active snapshot at startup and injects into all work event payloads. `project()` gains ability to filter by snapshot. Without this, events are "lawless at runtime" (Gemini). | — | A1 |

### Phase 3: Observation Model for Test Edges (gsdlc)

Ensure the agentic coder's test generation observes against spec + design, not code. The consciousness loop fix.

| # | Task | Description | Dep |
|---|------|-------------|-----|
| 3.1 | **F_P context for test edges** | `code↔unit_tests` and `unit_tests→integration_tests` edges: add `specification/requirements.md` and `design/adrs/` to `Edge.context`. F_P derives test scenarios from spec, not code. Code is secondary context (what to test against), not primary (what to test for). | 1.1 |
| 3.2 | **Test-plan artifact** | F_P on integration_tests edge produces a test-plan section mapping each scenario to source REQ key + design decision. Derivation is auditable — not just tagged, traced. F_D checks mapping exists and REQ keys are valid. | 3.1 |
| 3.3 | **F_H criteria for UAT gate** | Define explicit F_H criteria: "Does this system solve the problem stated in intent?" F_H actor receives intent + requirements. Proxy evaluates against intent, not code. | 3.1 |
| 3.4 | **Homeostatic feedback** | When F_D on integration_tests detects a gap (REQ key has no test scenario), affect routes to F_P with spec+design context. When F_H on UAT rejects, intent feeds back to requirements. Document feedback edges or why existing edges suffice. | 3.2, 3.3 |

### Phase 4: Completeness Verification (abg)

Validate the kernel against its own claimed invariants.

| # | Task | Description | Dep |
|---|------|-------------|-----|
| 4.1 | **UML model vs code** | Validate SCHEMA post (`20260321T090000`) domain model against running code. Every constitutional type present, every state machine correct. | — |
| 4.2 | **Seven completeness criteria** | Evaluate against Codex's 7 criteria. Document any gaps: (1) every concept modeled, (2) every legal transition explicit, (3) every illegal transition forbidden, (4) every terminal distinguishable, (5) every decision has evidence, (6) every event = state change, (7) every path traceable from constraint to outcome. | 4.1 |
| 4.3 | **State machine testing** | Test iterator, workflow, and manifest state machines against actual engine behavior. Verify transitions are total and well-governed. | 4.1 |
| 4.4 | **Unreachable asset detection** | Add `Package._validate()` warning for assets with no inbound edge that aren't graph roots. | — |
| 4.5 | **Path-independence test** | Verify that two evaluator orderings on same event stream produce same delta. | — |

### Phase 5: Release, Cascade, Validate (abg + gsdlc + dependents)

| # | Task | Description | Dep |
|---|------|-------------|-----|
| 5.1 | **Pre-release validate on abg** | Install gsdlc custody fix from source (not released) into abiogenesis. Run `gen-gaps`. Gate: must report 45 project-specific REQ keys, delta > 0 for uncovered keys. The system stops lying. **Proof gates release — release does not gate proof.** | 1.1-1.3 |
| 5.2 | **Release gsdlc** | Version bump, all tests pass, custody fix shipped. Only after 5.1 proves the fix works on a real dependent. | 5.1 |
| 5.3 | **Cascade to abiogenesis** | `gen-install` with released gsdlc. Layer 3 wrapper now reads project requirements. | 5.2 |
| 5.4 | **Audit convergence certificates** | Mark all `edge_converged` events emitted against wrong requirements as invalid. | 5.3 |
| 5.5 | **Release abg 1.0.0** | Version bump. All completeness criteria documented as satisfied. All hardening items (2.1-2.3) shipped. WiFi test passes. | 2.1-2.3, 4.1-4.5, 5.3 |
| 5.6 | **Cascade to all dependents** | genesis-manager, etc. | 5.5 |

### Phase 6: Cleanup (abg)

| # | Task | Description | Dep |
|---|------|-------------|-----|
| 6.1 | **Evaluate custom Package** | `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` — dead code or future intent? Remove if dead. | 5.3 |
| 6.2 | **Remove pythonpath artifact** | Remove `pythonpath: builds/claude_code/code` from `genesis.yml`. Pre-migration artifact, shadowing risk. | 6.1 |
| 6.3 | **Reconcile orphaned REQ tags** | Tracing tags (`# Implements: REQ-F-EC-002`) in code — now visible to coverage checks. Reconcile against project requirements. | 5.3 |

### Phase 7: Process Fix (gsdlc)

| # | Task | Description | Dep |
|---|------|-------------|-----|
| 7.1 | **REQ key for requirements separation** | The requirement that was never tracked must enter the graph. Close the provenance chain broken at step one. | 5.1 |
| 7.2 | **Marketplace → graph bridge** | Mechanism for STRATEGY posts requiring action to enter the graph as tracked requirements. | 7.1 |

### Phase 8: Spec Clarifications (abg)

| # | Task | Description | Dep | Gap ID |
|---|------|-------------|-----|--------|
| 8.1 | **Liveness is command-layer** | Document that kernel provides single-hop termination; orchestrator provides loop termination via `max_iterations`. | — | T1 |
| 8.2 | **Frame axiom is intentionally asymmetric** | Document: F_H approvals carry forward across versions; F_P certifications do not (new version = new evaluators). | — | EC4 |
| 8.3 | **Fairness is per-feature** | Document: `_scoped_jobs()` provides feature isolation; topological ordering is correct for single-feature. | — | T2 |
| 8.4 | **Edge.context is the ObserverModel** | Document: context binding on an edge IS the observer model for that hop. Name the pattern. | — | A2 |
| 8.5 | **Overlay compatibility constraints** | Document what overlays must preserve to maintain sheaf consistency. | — | S2 |

---

## Critical Path

```
1.1 (instantiate signature)
 │
 ├──> 1.2 (wrapper generation) ──> 1.3 (scaffold)
 │     │
 │     └──> 5.1 (PRE-RELEASE validate on abg — proof gates release)
 │           │
 │           └──> 5.2 (release gsdlc — only after proof)
 │                 │
 │                 └──> 5.3 (cascade to abg)
 │                       │
 │                       ├──> 5.4 (audit certificates)
 │                       ├──> 6.1-6.3 (cleanup — parallelisable)
 │                       └──> 3.1 (observation model)
 │                             │
 │                             ├──> 3.2 (test-plan artifact)
 │                             ├──> 3.3 (UAT F_H criteria)
 │                             └──> 3.4 (homeostatic feedback)
 │
 ├──> 2.1, 2.2a→2.2b, 2.3 (kernel hardening — parallelisable, no deps)
 │
 ├──> 4.1-4.5 (completeness verification — parallelisable, no deps)
 │
 ├──> 7.1-7.2 (process fix — parallelisable after 5.2)
 │
 ├──> 8.1-8.5 (spec clarifications — parallelisable, no deps)
 │
 └──> 5.5 (ABG 1.0 release gate — depends on all above)
       │
       └──> 5.6 (cascade to dependents)
```

**Parallelisable work streams** (can start immediately):
- Kernel hardening (2.1-2.3)
- Completeness verification (4.1-4.5)
- Spec clarifications (8.1-8.5)

**Blocking work** (serial):
- Phase 1 (custody fix) → Phase 5.1-5.3 (release + validate) → Phase 3 (observation model) + Phase 6 (cleanup)

---

## Project Ownership

| Project | Task count | Tasks |
|---------|-----------|-------|
| **gsdlc** | 10 | 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 5.1, 7.1, 7.2 |
| **abg** | 17 | 2.1, 2.2a, 2.2b, 2.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 8.1-8.5 |
| **both** | 2 | 5.3, 5.6 |
| **Total** | **29** | |

---

## Closure Criteria (ABG 1.0 release gate)

ABG 1.0 is closed when ALL of:

1. **Truthful convergence**: `gen-gaps` reports project-specific REQ keys on abiogenesis. Delta > 0 for uncovered keys. The system stops lying. *(S1 fix validated)*
2. **Observation surface integrity**: Context digest included in certification hash. Context change invalidates certifications automatically. *(EC3 shipped)*
3. **No orphaned manifests**: Pending fluent tracks outstanding dispatches. `bind_fd()` prevents duplicate dispatch. Staleness detectable. *(EC1 shipped)*
4. **Lawful events**: All work events carry `package_snapshot_id`. Replay under specific constitutional state is possible. *(A1 shipped)*
5. **Completeness criteria satisfied**: All 7 of Codex's criteria verified against running code. *(4.1-4.3 done)*
6. **Pressure test holds**: All 9 future feature sets expressible with current GTL + abg + composition law. No new primitive was forced during implementation. *(working hypothesis — falsified if implementation forces a new primitive)*
7. **WiFi test passes**: An agent completes a job without being given history of prior failures or certifications. Kernel handles transport reliability. *(Gemini's validation criterion)*

---

## What ABG 1.0 Does NOT Deliver

- Multi-worker scheduling (kernel supports it, not exercised)
- CompositionSet routing (above abg — gsdlc concern, Part III)
- ObserverModel as a named GTL type (composition pattern, not a primitive)
- Network-level homeostasis (future — requires orchestrator above abg)
- GTL primitive change to `Package.requirements` (deferred to spec-level ADR)
- New primitives of any kind (pressure test indicates none needed — validated during implementation)

---

## What Comes After ABG 1.0

Review gsdlc against the proven kernel. Scope:
1. ObserverModel as named composition pattern
2. CompositionSet — define solution macros (gsdlc, PoC, Discovery, Research) as Packages
3. Intent tree closure — satisfaction = all derived intents converged
4. Network-level homeostasis — observers at broader scope
5. Marketplace → graph bridge (Phase 7 starts this)

**The kernel must be proven before the network is designed.**
