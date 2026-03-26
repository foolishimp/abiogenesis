# Temporal vs ABG/GTL — Capability Crosswalk

**Date**: 2026-03-27  
**Purpose**: Compare Temporal and ABG/GTL side by side, identify equivalent capability surfaces, and separate true overlap from real divergence.

---

## 1. Framing

This comparison only makes sense if the layers are kept straight:

- **Temporal** is primarily a **durable workflow runtime and programming model**.
- **GTL** is a **graph/declaration language**.
- **ABG** is the **canonical runtime/engine** for GTL.

So the fairest comparison is not:

- `Temporal` vs `GTL`

It is:

- **Temporal runtime + workflow model**
- **GTL declaration layer + ABG runtime layer**

That matters because GTL intentionally owns structure while ABG owns execution:

- [REQ-L-GTL2-ENGINE-INDEPENDENCE.md](/Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL2-ENGINE-INDEPENDENCE.md)
- [REQ-M-GTL2-MAPPING.md](/Users/jim/src/apps/abiogenesis/specification/requirements/mapping/REQ-M-GTL2-MAPPING.md)

---

## 2. One-Line Summary

**Temporal is stronger today as a durable distributed orchestration runtime.**  
**ABG/GTL is stronger as an explicit graph/declaration + evaluator/provenance model.**

The overlap is substantial in:

- long-running orchestration
- replay/recovery
- nested work
- worker-based execution
- retries/timeouts
- event/history-driven progression

The divergence is substantial in:

- GTL-first graph algebra
- explicit evaluator/convergence semantics
- lawful refinement/substitution/candidate families
- constitutional traceability from requirements to runtime
- engine-independence as a first-class goal

---

## 3. Side-by-Side Capability Matrix

| Capability | Temporal | ABG/GTL | Intersection | Divergence |
| --- | --- | --- | --- | --- |
| **Core execution model** | Code-first workflows plus activities, run by workers polling task queues | GTL declares graphs/functions/boundaries; ABG executes via `Traversal`, binding, runs, lineage, convergence | Both execute long-running work through workers over explicit runtime state | Temporal is workflow-code-first; GTL/ABG is declaration-first and graph-first |
| **Durable replay / recovery** | Event History is durably persisted and used for Durable Execution and recovery | Replay/projection/convergence are core ABG obligations; provenance and history are explicit requirements | Both treat history as execution truth | Temporal ships mature durability infrastructure now; ABG is architected for it but lighter/local-first in 1.0 |
| **Nested work / sub-workflows** | Child workflows are first-class runtime capability | GTL has `GraphFunction`, `RefinementBoundary`, `CandidateFamily`, substitution, spawn/fold-back; ABG supports lineage spawn/fold-back | Both support hierarchical work decomposition | Temporal names runtime child workflows directly; GTL/ABG separates declaration of lawful refinement from runtime realization |
| **Dynamic refinement / zoom** | Achieved through workflow code, child workflows, signals, and runtime logic | First-class language surface: `deferred_refinement(...)`, `candidate_family(...)`, substitution, lawful zoom chain | Both can realize dynamic structure changes | GTL makes the structural boundary explicit in the language; Temporal usually expresses it in workflow code |
| **Messaging into running execution** | Signals, Queries, Updates are first-class | ABG has evaluator/result ingestion and event-driven progression; explicit message/control boundary pressure is recognized, but this is not yet the strongest 1.0 surface | Both have a notion of external influence on running work | Temporal is ahead here with mature typed message classes; ABG 1.0 is more evaluation/result-oriented than general message-passing-oriented |
| **Retries / timeouts** | Declarative Retry Policy, workflow/activity timeouts, automatic retry behavior | ABG has run lifecycle, transport, correction, convergence, and pending transport failure/retry proof on the 1.0 ladder | Both treat retries/timeouts as engine/runtime law rather than business logic | Temporal is much more complete and production-proven here today |
| **History management** | Continue-As-New, event-history limits, reset | ABG has correction/reset and replay; continue-as-new style history compaction is not yet a shipped 1.0 surface | Both recognize history growth and replay as runtime concerns | Temporal has explicit built-in history-rotation semantics; ABG has correction/reset but not an equivalent mature continue-as-new story yet |
| **Visibility / search / indexing** | Search Attributes and visibility are first-class | ABG has provenance, archives, and event logs; mapping/visibility layer is explicitly deferred | Both preserve runtime evidence | Temporal has a richer built-in visibility/search substrate today |
| **Selection over alternatives** | Usually encoded in workflow code and runtime branching | Explicit `CandidateFamily` plus external `SelectionDecision` | Both can branch to alternatives | GTL/ABG makes lawful alternatives a named declarative surface; Temporal typically does not |
| **Convergence / evaluation** | Success/failure/retry semantics are strong, but evaluator algebra is not the center of the model | Evaluators, evaluator vectors, `delta()`, convergence rules, escalation are first-class | Both support progress toward completion | ABG/GTL is explicitly evaluator/convergence-centric; Temporal is execution/durability-centric |
| **Lineage / fold-back** | Parent/child workflow relationships and event history | `work_key`, spawn, fold-back, substitution-preserving lineage are explicit | Both preserve parent/child execution relationships | ABG/GTL makes lineage a named semantic requirement surface, not just a runtime implementation property |
| **Human / governance gates** | Possible through application design and integrations | `F_H` exists architecturally, though real human infrastructure is deferred from 1.0 sunny-day qualification | Both can host approvals/governance | GTL/ABG models regimes (`F_D`, `F_P`, `F_H`) more explicitly; Temporal is more neutral here |
| **Portability / alternate runtime mapping** | Temporal is itself a runtime target | GTL explicitly intends mapping onto ABG, Temporal, Prefect, Step Functions, etc. | Both can participate in orchestration ecosystems | GTL is trying to be the portable orchestration IR; Temporal is not trying to be engine-neutral |

---

## 4. Equivalent Functionality

This is the real overlap where comparison is fair.

### 4.1 Long-running orchestrated execution

- **Temporal**: Workflow Execution with Activities, Workers, Task Queues, Event History.
- **ABG/GTL**: `Traversal`, `WorkSurface`, `RunState`, `Worker`, `ExecutableJob`, evaluator-driven convergence over graph contracts.

Equivalent core idea:

- there is a durable or replayable execution unit
- external workers realize it
- progress is history-driven, not just call-stack-driven

### 4.2 Hierarchical work

- **Temporal**: child workflows
- **ABG/GTL**: substitution, spawn, fold-back, refinement boundaries, candidate families

Equivalent core idea:

- a coarse contract can be replaced by a more detailed internal structure
- parent and child relationships must remain coherent

### 4.3 Failure governance

- **Temporal**: retry policies, timeouts, reset, continue-as-new
- **ABG/GTL**: correction/reset, run lifecycle, convergence visibility, pending transport failure/retry qualification

Equivalent core idea:

- failure handling belongs in the runtime protocol, not in random domain code

### 4.4 Workers external to the service

- **Temporal**: worker processes poll task queues; Temporal service orchestrates state transitions
- **ABG/GTL**: ABG binds work to workers; workers execute transport/bounded subwork while ABG preserves provenance and convergence

Equivalent core idea:

- engine owns orchestration truth
- workers own execution of externalized work

---

## 5. Where Temporal Is Ahead

Temporal is clearly ahead in the parts of orchestration that require an already-hardened distributed runtime:

1. **Durable execution as a shipping core competency**
2. **Event-history scale management**
   - limits
   - continue-as-new
   - reset
3. **Message-passing to live workflows**
   - signals
   - queries
   - updates
4. **Retry/timeouts/operational failure policy**
5. **Visibility/search/operational tooling**
6. **Task queues and distributed worker operational model**

If the question is:

- “Which system is more mature today for production-grade distributed durable workflow execution?”

the answer is:

- **Temporal**

---

## 6. Where ABG/GTL Is Ahead

ABG/GTL is stronger where the problem is not only orchestration, but **lawful declaration of evolving graph semantics**.

### 6.1 Graph-first declaration

GTL has explicit:

- `Graph`
- `Node`
- `GraphVector`
- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`

Temporal does not center its model on a public graph algebra in this way.

### 6.2 Evaluator-centric convergence

ABG makes these central:

- evaluator declarations
- evaluator vectors
- `delta()`
- convergence visibility
- escalation across regimes

That is much closer to “governed synthesis / review / refinement” than Temporal’s core model.

### 6.3 Explicit lawful alternatives

ABG/GTL treats:

- profile selection
- structural alternatives
- refinement points

as first-class declarations.

Temporal usually expresses those choices in workflow code.

### 6.4 Requirements-to-runtime traceability

ABG/GTL is explicitly trying to preserve:

- requirement lineage
- declared graph lineage
- runtime lineage
- postmortem/provenance archive

as part of the constitutional model.

That is not Temporal’s center of gravity.

### 6.5 Engine-independence

Temporal is an engine.

GTL is trying to be:

- a language/IR that can map to ABG, Temporal, Prefect, Step Functions, and others

That is a fundamentally different ambition.

---

## 7. The Deepest Divergence

The deepest divergence is:

- **Temporal asks you to write durable workflow code**
- **GTL asks you to declare lawful graph structure**
- **ABG asks the engine to realize that structure deterministically**

That means Temporal’s “dynamic workflow” and ABG/GTL’s “lawful refinement/substitution” are not identical ideas even when they can simulate similar outcomes.

Temporal’s center:

- runtime durability
- workflow execution model
- operational robustness

ABG/GTL’s center:

- graph semantics
- convergence/evaluation
- provenance/traceability
- constitutional separation of language vs engine vs domain logic

---

## 8. Practical Mapping Read

If GTL were mapped onto Temporal, the likely mapping would look like:

- `GraphFunction` / `Graph` -> workflow or sub-workflow realization units
- `CandidateFamily` -> explicit workflow branch family chosen externally
- `RefinementBoundary` -> child-workflow or sub-workflow invocation boundary
- ABG lineage/run semantics -> Temporal workflow/child-workflow execution identity
- ABG retries/timeouts/history-management -> Temporal native runtime strengths

But some GTL/ABG surfaces do not map one-to-one:

- evaluator vectors
- constitutional requirement traceability
- explicit fold-back semantics
- selection as a first-class published declaration

Those would need either:

- a richer Temporal-facing adapter layer
- or an explicit capability-profile saying the mapping is partial

That is exactly why the mapping requirements use:

- full mappings
- partial mappings
- capability-profile mappings

instead of promising perfect equivalence.

---

## 9. Honest Bottom Line

### If the goal is:

- **a battle-tested durable orchestration runtime**

then Temporal is the stronger reference.

### If the goal is:

- **a graph-first, evaluator-first, provenance-first orchestration language/runtime pair**

then ABG/GTL is intentionally doing something different and in several areas more explicit.

### The intersection

Real overlap exists in:

- replayable orchestration
- worker-based execution
- nested work
- failure governance
- long-running processes

### The divergence

Real divergence exists in:

- language-first graph algebra
- explicit evaluator and convergence semantics
- lawful refinement and candidate-family publication
- requirement-to-runtime constitutional traceability
- engine-independence as a design goal

So the right conclusion is not:

- “ABG is a Temporal clone”

It is:

- **Temporal is the strongest runtime reference class for ABG durability**
- **ABG/GTL is pursuing a different, more declaration-centric and evaluator-centric architecture**

---

## 10. Sources

### ABG/GTL local sources

- [REQ-L-GTL2-ENGINE-INDEPENDENCE.md](/Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL2-ENGINE-INDEPENDENCE.md)
- [REQ-M-GTL2-MAPPING.md](/Users/jim/src/apps/abiogenesis/specification/requirements/mapping/REQ-M-GTL2-MAPPING.md)
- [REQ-R-ABG2-CONVERGENCE.md](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG2-CONVERGENCE.md)
- [REQ-R-ABG2-LINEAGE.md](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG2-LINEAGE.md)
- [REQ-R-ABG2-CORRECTION.md](/Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG2-CORRECTION.md)
- [GTL_2_MODULE_DESIGN.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/GTL_2_MODULE_DESIGN.md)
- [GTL_2_INTERFACE_CONTRACTS.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/GTL_2_INTERFACE_CONTRACTS.md)
- [GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/GSDLC_LITE_ABG_1_0_QUALIFICATION_LADDER.md)
- [20260326T161806_STRATEGY_pluggable-graph-synthesis-selection-and-evaluator-ioc.md](/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260326T161806_STRATEGY_pluggable-graph-synthesis-selection-and-evaluator-ioc.md)
- [20260326T171847_STRATEGY_best-of-breed-reference-classes-for-abg-and-gtl.md](/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260326T171847_STRATEGY_best-of-breed-reference-classes-for-abg-and-gtl.md)

### Temporal official sources

- https://docs.temporal.io/
- https://docs.temporal.io/develop
- https://docs.temporal.io/workflow-execution/event
- https://docs.temporal.io/encyclopedia/retry-policies
- https://docs.temporal.io/encyclopedia/workflow-message-passing
- https://docs.temporal.io/workers
- https://api-docs.temporal.io/
