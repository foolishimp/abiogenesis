# STRATEGY: Patent Landscape — GTL/ABG Intellectual Property

**Author**: Claude
**Date**: 2026-03-31
**Addresses**: Patentability assessment of GTL language and ABG runtime inventions
**Status**: Draft

## Summary

GTL/ABG contains several independently patentable inventions. The core inventive step across all claims is the same: **orchestrating untrusted probabilistic workers**. Every prior workflow system assumes trusted workers — task completion implies correctness. GTL/ABG exists because that assumption breaks with AI agents. The entire architecture follows from that single broken assumption.

This document identifies what is novel, what has prior art, and how claims cluster for filing.

## Likely Patentable — Novel and Non-Obvious

### 1. Convergence Gradient for Multi-Regime AI Workflow Evaluation

**The core invention.** A method for orchestrating untrusted AI agents using a continuous convergence metric (`delta`) computed across three constitutionally ordered evaluation regimes (deterministic, probabilistic, human), where the system iterates toward `delta=0` rather than running to binary completion.

```
delta(state, constraints) → work
```

The same computation at every scale — single evaluator, single edge, feature traversal, entire project. The engine selects the first unconverged edge, dispatches work, evaluates across regimes, records events, recomputes delta. When delta reaches zero, the system is at rest.

**Prior art has:** workflow DAGs (Airflow, Prefect), retry logic, quality gates, continuous integration pipelines.

**Prior art does NOT have:** a continuous convergence gradient computed across typed evaluation regimes with formal escalation ordering, applied to probabilistic AI workers. No existing system treats convergence as a gradient rather than a binary. No existing system constitutionally orders its evaluation regimes.

**Claim strength:** Strong. This is the central invention. Every other patentable element is either a mechanism that makes this work or a consequence of this design.

### 2. Contract-Preserving Runtime Graph Refinement

A method for dynamically refining a workflow graph during execution by substituting a coarse edge with a finer subgraph, where algebraic laws guarantee the outer interface contract is preserved.

```
coarse = edge(requirements, production)           -- one giant step
refined = substitute(coarse, target_id, finer)    -- three internal steps
-- outer contract (requirements → production) is algebraically preserved
```

The substitution is lawful only when the inner graph's input/output interface matches the replaced edge's source/target nodes. The algebra enforces this — you cannot substitute a graph that violates the outer contract.

**Prior art has:** static workflow graphs, dynamic task generation (Airflow dynamic DAGs), workflow decomposition patterns.

**Prior art does NOT have:** algebraic guarantees that runtime graph modification preserves a declared interface contract. Airflow's dynamic DAGs can generate arbitrary structure — there is no contract preservation law. Temporal's child workflows are ad-hoc composition, not algebraically constrained substitution.

**Claim strength:** Strong. Runtime graph refinement with algebraic contract preservation is novel in the workflow domain.

### 3. Constitutional Evaluator Escalation Ladder

A workflow system where evaluation regimes are formally ordered (F_D < F_P < F_H) as a language-level constraint:

```
F_D checks first.              -- can we prove it?
  if F_D can't close it  →  F_P assesses.    -- can an agent judge it?
  if F_P can't close it  →  F_H reviews.     -- a human must decide.
```

Deterministic proof must discharge before probabilistic judgment is invoked. Probabilistic judgment must discharge before human review is invoked. You never ask a human what a test suite can answer. You never ask an agent what a type checker can prove.

**Prior art has:** quality gates, human approval steps, test-then-deploy pipelines, maker/checker patterns.

**Prior art does NOT have:** a formal regime ordering enforced at the language level where lower regimes must discharge all provable truth before higher regimes are invoked. Existing systems have optional gates, not constitutional escalation. The ordering F_D→F_P→F_H as a language constraint — not a convention — is novel.

**Claim strength:** Strong as a dependent claim under #1. The escalation ladder is the mechanism that makes the convergence gradient work for mixed human/AI evaluation.

### 4. Provenance-Carrying Selection Over Declared Candidate Families

A workflow language that exposes structural alternatives as explicit candidate families while constitutionally prohibiting the interpreter from making selection decisions:

```
-- The engine can do this:
candidates = enumerate(build_family)    -- [fast_build, careful_build]

-- The engine CANNOT do this:
best = pick_best(build_family)          -- ILLEGAL: hidden strategy
```

All selection must arrive as an explicit, provenance-carrying decision record from an external authority (F_D rule, F_P assessment, F_H judgment, or business logic above the interpreter). The language exposes structure, not strategy.

**Prior art has:** A/B testing frameworks, feature flags, strategy patterns, plugin architectures, model selection in ML pipelines.

**Prior art does NOT have:** a language-level constitutional boundary between exposing alternatives and choosing between them, with mandatory provenance on the selection decision. Feature flags hide alternatives. Strategy patterns encode choice. A/B frameworks randomize. None declare "the interpreter may enumerate but never select" as a structural law, and none require every selection to carry auditable provenance.

**Claim strength:** Strong. The constitutional separation between enumeration and selection, combined with mandatory provenance, is a novel approach to workflow branching.

### 5. Operator/Evaluator Constitutional Separation for Probabilistic Workers

A workflow system where the actor that performs work (Operator) is constitutionally separated from the actor that judges work (Evaluator), formalized as distinct language-level types with regime tags:

```
Operator(name, regime, binding)     -- does work
Evaluator(name, regime, binding)    -- checks work
```

The separation exists specifically because AI agents are untrusted — "the agent finished" is not evidence that the output is correct. Traditional workflow systems don't need this distinction because their workers are trusted (a test either passes or fails; a build either succeeds or fails). When workers are probabilistic, the constitutional separation between doing and judging becomes essential.

**Prior art has:** maker/checker patterns in financial systems, code review workflows, four-eyes principles, separation of duties in security.

**Prior art does NOT have:** a formal type-level distinction between operators and evaluators in a workflow language, specifically designed for probabilistic AI workers, with regime tags that place each actor in the deterministic/probabilistic/human hierarchy. Maker/checker is an organizational pattern, not a language construct.

**Claim strength:** Medium-strong. Novel as a language-level formal type, but the underlying pattern (separation of duties) is well-known. Strongest when claimed in combination with #1 and #3.

## Possibly Patentable — Novel but Narrower

### 6. Algebraic Workflow Compilation to Cloud State Machines

A method for compiling algebraic graph workflows (GTL programs) to cloud state machine definitions (AWS Step Functions ASL), with a defined mapping:

| Algebra Operation | State Machine Equivalent |
|---|---|
| `compose(f, g)` | Sequential States |
| `fan_out()` | Map State (parallel) |
| `fan_in()` | Map State result collection |
| `gate()` | Choice State + Wait-for-Callback |
| `substitute()` | Nested Execution (child state machine) |
| `recurse()` | Iterator with Choice termination |
| `CandidateFamily` | Choice State (selection-driven branching) |

**Claim strength:** Medium. The specific mapping is novel but narrow. Useful as a defensive filing to protect the cloud-native deployment path.

### 7. Event-Sourced Convergence with Replay Integrity for AI Agents

The specific combination of:
- Append-only event stream (the only lawful write path)
- Deterministic projection over event replay
- Convergence delta derived from projected state (never stored)
- Multi-regime evaluation with regime-ordered escalation
- Probabilistic AI agents as primary workers

Applied to AI agent orchestration where agent output is untrusted and evaluation must be replayable for provenance and audit.

**Claim strength:** Medium. Each component has prior art individually. The combination applied to AI agent orchestration is novel.

### 8. Dual Work Identity (Lineage vs. Attempt)

Separating lineage identity (`work_key`) from attempt identity (`run_id`) in an event-sourced workflow system:

- `work_key` — the identity of what is being built (persists across attempts)
- `run_id` — the identity of one attempt to build it (scoped to a single traversal)

Multiple runs against the same work key produce independent event streams that project to the same convergence state. This enables: correction without history erasure, run comparison, and provenance chains that survive retry.

**Claim strength:** Medium. The concept of separating "what" from "which attempt" exists in CI systems (build number vs. project), but formalizing it in an event-sourced convergence system with deterministic projection is more specific.

## Not Patentable — Clear Prior Art

| Concept | Prior Art |
|---|---|
| Event sourcing | Greg Young (2005+), Apache Kafka, EventStoreDB |
| Graph-based workflow orchestration | Apache Airflow, Prefect, Temporal, Argo, AWS Step Functions |
| Algebraic composition | Category theory, functional programming (Haskell, Scala) |
| Human-in-the-loop approval gates | JIRA, GitHub PRs, ServiceNow, every ITSM tool |
| Immutable/frozen data types | Standard practice across languages |
| Append-only logs | Kafka, Datomic, event stores |
| DAG compilation | Spark, Flink, TensorFlow (computational graph → execution plan) |
| Retry with backoff | Ubiquitous in distributed systems |

## Filing Strategy

### Cluster A — The Convergence System (Primary Filing)

**Independent claim:** #1 (Convergence Gradient)
**Dependent claims:** #3 (Escalation Ladder), #5 (Operator/Evaluator Separation), #7 (Event-Sourced Convergence)

This is the core patent. The convergence gradient is the invention; the escalation ladder, operator/evaluator separation, and event-sourced replay are the mechanisms that make it work for untrusted AI workers.

### Cluster B — Algebraic Graph Refinement (Separate Filing)

**Independent claim:** #2 (Contract-Preserving Substitution)
**Dependent claims:** #6 (Compilation to Cloud State Machines)

Runtime graph refinement with algebraic guarantees is independently novel. The cloud compilation mapping extends the claim to a specific deployment target.

### Cluster C — Selection Boundary (Separate Filing)

**Independent claim:** #4 (Provenance-Carrying Selection)
**Dependent claim:** Selection as explicit decision surface with regime-tagged authority

The constitutional separation between enumeration and selection is independently novel and independently valuable. It applies beyond AI workflows — anywhere you need auditable, provenance-carrying decisions over declared alternatives.

### Key Phrase Across All Claims

> "...for orchestrating untrusted probabilistic workers in a workflow system..."

This is the inventive step. Every claim distinguishes itself from prior art by addressing probabilistic, untrusted workers — specifically AI agents — rather than deterministic, trusted workers. Without this phrase, the claims risk rejection as obvious combinations of known workflow and algebra techniques.

## Timing Considerations

**Publication risk:** The algebraic pseudocode post and the cloud-native architecture post, if published externally, could constitute prior disclosure. Most patent jurisdictions (except the US, which allows a 12-month grace period) require filing before public disclosure. If filing is intended, file before publishing those documents externally.

**Defensive vs. offensive filing:** Even if not planning to enforce patents, defensive filings prevent others from patenting the same concepts and blocking this project. The convergence gradient (#1) is the highest-priority defensive filing — if someone else patents "convergence-based evaluation for AI workflows," it could block the entire GTL/ABG architecture.

## Recommended Action

1. **File Cluster A (Convergence System) first** — it's the broadest and most defensible claim, and the one most likely to be independently invented by others as AI agent orchestration matures.
2. **File Cluster C (Selection Boundary) second** — it's independently valuable and applies beyond AI workflows.
3. **File Cluster B (Graph Refinement) third** — it's novel but narrower.
4. **Do not publish the algebra or architecture posts externally until at least a provisional filing is in place.**
5. **Engage a patent attorney specializing in software/AI patents** — these claims need proper claim drafting. This analysis identifies the inventive matter; a patent attorney shapes it into defensible claims.
