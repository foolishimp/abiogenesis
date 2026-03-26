# STRATEGY: Best-of-Breed Reference Classes for ABG and GTL

**Author**: codex
**Date**: 2026-03-26T17:18:47+11:00
**Status**: Review first
**Audience**: jim

## Position

The relevant workflow/orchestration systems should not be studied only as competitors.

They are also:
- reference classes for robust execution
- pressure tests for GTL abstraction quality
- future mapping targets

The question is not only:

> how do we beat these tools?

It is also:

> what do these tools reveal about the runtime shape ABG needs, and what do they reveal about the language shape GTL needs?

This is especially important if GTL is meant to remain engine-independent and ABG is meant to be the canonical engine rather than the only engine.

---

## Core framing

Study each system along two axes:

1. **Engine question**
   - what robust execution pattern does this system already solve well?
   - what does that imply for ABG runtime law?

2. **Language question**
   - what workflow shape or semantic form does this system assume?
   - what does that imply for GTL if GTL is to project onto or learn from that system?

This makes the research constitutional rather than merely market-facing.

---

## Priority reference classes

### 1. Temporal

**Best at**
- durable execution
- deterministic replay
- retries/timeouts/compensation
- long-running dynamic workflows
- child workflows and signals

**What it teaches ABG**
- how serious durable orchestration treats replay as law
- how execution history and workflow state must remain coherent under failure
- how dynamic structure can emerge without abandoning determinism
- how retry/timeout/run lifecycle governance should be first-class

**What it teaches GTL**
- what dynamic graph growth/refinement really needs from the language
- how recursion, child-work, and lineage may need to be expressed so a durable engine can realize them
- where graph expansion belongs semantically versus operationally

**Where ABG/GTL should likely differ**
- GTL should stay more explicitly graph/language-first than Temporal’s code-first model
- ABG should preserve provenance and constitutional traceability more explicitly than typical workflow-code practice

**Why it matters**
- probably the strongest durability reference for ABG
- likely the best pressure test for “can GTL dynamic zoom become real runtime law?”

---

### 2. Camunda / Zeebe

**Best at**
- explicit process orchestration
- business process visibility
- human tasks and approvals
- governance-heavy orchestration

**What it teaches ABG**
- how human judgment and operator governance become first-class runtime surfaces
- how process visibility and explicit decision points matter in real organizations
- how approval/escalation/governance should not be treated as afterthoughts

**What it teaches GTL**
- where explicit decision/governance boundaries must remain visible
- how selection and approval can remain lawful without becoming hidden interpreter behavior

**Where ABG/GTL should likely differ**
- GTL should remain more compositional/programmatic than BPMN-style process modeling
- ABG should avoid hardwiring business process semantics into the core runtime

**Why it matters**
- strongest reference for human/governance/process visibility

---

### 3. Conductor / Orkes Conductor

**Best at**
- distributed workflow orchestration
- service choreography/orchestration
- retries/error handling for large operational graphs

**What it teaches ABG**
- what practical distributed orchestration looks like under real failure
- how state, retries, compensation, and task coordination are handled outside a purely local engine

**What it teaches GTL**
- what structural workflow forms need to exist so service-heavy orchestration can still be described lawfully
- what GTL should expose if it is to remain relevant beyond local development loops

**Where ABG/GTL should likely differ**
- ABG should keep stronger provenance and spec-trace closure
- GTL should preserve a cleaner language/runtime split than typical orchestration JSON/task DSLs

**Why it matters**
- useful reference for distributed robustness without the exact Temporal model

---

### 4. LangGraph

**Best at**
- graph-native agent orchestration
- stateful agent loops
- explicit graph-based control flow for LLM systems

**What it teaches ABG**
- how graph-native agent orchestration is being operationalized in the current market
- where agent-state execution models become practical and where they drift

**What it teaches GTL**
- how close GTL is, or is not, to current graph-native agent orchestration practice
- whether GTL graph semantics are rich enough to capture agent workflow patterns without collapsing into ad hoc state graphs

**Where ABG/GTL should likely differ**
- GTL should remain a stronger semantic language, not just a state graph API
- ABG should keep replay/provenance/governance tighter than typical agent-framework practice

**Why it matters**
- closest graph-shaped adjacent system
- probably the clearest “are we better than agent state graphs?” comparison

---

### 5. CrewAI

**Best at**
- teams of agents
- flows + crews separation
- enterprise-friendly agent workflow packaging

**What it teaches ABG**
- what the market currently expects from multi-agent orchestration ergonomics
- how agent-team abstractions get surfaced for end users

**What it teaches GTL**
- whether GTL can project onto agent-team/workflow systems rather than only classic workflow engines
- what a future `GTL -> CrewAI` mapping might need:
  - graph/function to flow/crew projection
  - capability constraints
  - mapping provenance

**Where ABG/GTL should likely differ**
- ABG must remain business-logic-free
- GTL should remain the higher-order lawful language rather than becoming an agent-team product surface
- evaluator/business logic should remain consumer-pluggable, not absorbed into the core runtime

**Why it matters**
- both competitor and likely future mapping target
- strong test of whether GTL is genuinely engine-independent

---

### 6. Step Functions / Durable Functions / Cloud Workflows

**Best at**
- managed orchestration
- cloud-hosted execution constraints
- state-machine workflows under operational limits

**What they teach ABG**
- what practical cloud-hosted orchestration imposes:
  - timeouts
  - payload limits
  - state persistence tradeoffs
  - service boundary constraints

**What they teach GTL**
- what semantics survive projection into more constrained managed engines
- where GTL needs capability profiles or mapping degradation rules

**Where ABG/GTL should likely differ**
- ABG can remain richer and more local-first as canonical engine
- GTL should explicitly record capability loss or degraded mapping where these targets cannot faithfully realize the language

**Why they matter**
- useful for future cloud ABG design
- useful for mapping/capability/provenance requirements

---

## Secondary reference classes

These matter, but are less central to the ABG/GTL core question:

- **Airflow** — useful for DAG scheduling and ecosystem lessons, less central for semantic/runtime law
- **Prefect** — useful for Python-native orchestration ergonomics
- **Dagster** — useful for asset/data pipeline worldview and operational visibility
- **Argo** — useful for K8s-native workflow execution patterns
- **Flyte** — useful for typed/data-heavy orchestration
- **Control-M** — useful for enterprise workload governance and job control

These are more adjacent than central unless ABG intentionally leans harder into data or enterprise batch/workload automation.

---

## What this research is actually for

This research should answer:

### For ABG

- what runtime capabilities must be first-class for robustness?
- what failure/run/replay/provenance patterns are non-negotiable?
- what cloud/distributed execution model should ABG eventually support?

### For GTL

- what semantic structures must be first-class if GTL is to remain engine-independent?
- how should dynamic zoom, recursion, composition, and substitution be expressed so real engines can host them?
- what mapping/capability/provenance layer is needed for alternate engines?

### For strategy

- where should ABG compete directly as a canonical engine?
- where should GTL compete as a language/mapping layer above other engines?
- where should we deliberately differ instead of imitating incumbents?

---

## Likely immediate takeaway

The most valuable near-term deep studies are probably:

1. **Temporal**
   - durable execution
   - dynamic workflow realization
   - replay/run semantics

2. **LangGraph**
   - graph-native agent orchestration
   - stateful graph control loops

3. **CrewAI**
   - agent-team/workflow packaging
   - future engine-target possibility

4. **Camunda**
   - human/governance/process visibility

Those four likely give the highest leverage on both ABG robustness and GTL language shape.

---

## Proposed next step

Turn this into a research matrix with columns:

- platform
- best-of-breed strength
- what it teaches ABG
- what it teaches GTL
- likely future mapping target?
- where ABG/GTL should deliberately differ

That matrix should then drive:
- architecture study
- requirement repricing if needed
- mapping-layer prioritization
- cloud/distributed ABG roadmap

Not implementation first.
