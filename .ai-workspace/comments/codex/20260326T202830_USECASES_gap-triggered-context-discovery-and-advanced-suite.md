# USE CASES: Gap-Triggered Context Discovery and the Advanced Design Suite

**Category**: USECASES
**Date**: 2026-03-26T20:28:30+11:00
**Purpose**: restate the current high-value use case in a design-ready form and bring the previously surfaced advanced use cases back into one suite for alternative-solution evaluation

**Builds on**:
- `20260325T164500_EXTENSION_gsdlc-usecases-materialization-and-hydration.md`
- `20260325T173500_STRATEGY_gtl-as-constrained-machine-ir-for-bpm-sourced-workflows.md`
- `20260326T161806_STRATEGY_pluggable-graph-synthesis-selection-and-evaluator-ioc.md`
- `20260326T190414_PROPOSAL_graphfunction-monadic-composition.md`

---

## 1. Separation First

This suite assumes the separation now established in the constitutional surface:

- **ABG owns the deterministic protocol**
  - traversal
  - gap triggering
  - escalation across `F_D`, `F_P`, `F_H`
  - lawful refinement application
  - event emission
  - provenance and replay

- **Domain implementations own the metric**
  - what counts as open / closed / ambiguous
  - what deterministic checks are possible
  - what semantic interpretation `F_P` provides
  - what human escalation `F_H` means

- **GTL is the SDK declaration surface**
  - graph functions
  - evaluators
  - rules
  - composition
  - substitution
  - recursion
  - deferred refinement / synthesis boundaries

This means the use cases below are not requests to put domain semantics into ABG.
They are pressure tests for whether GTL/ABG cleanly host domain-defined metrics and lawful topology change.

---

## 2. Detailed Current Use Case

## Gap-Triggered Context Discovery During `requirements -> design`

### Problem shape

A domain pipeline traverses the coarse contract:

```text
requirements -> design
```

The domain has a large corpus of documents. Those documents may or may not already contain the context required for the next lawful step.

Concrete example:

- a regulatory pipeline must inspect trade-data documentation
- the pipeline needs enough context to proceed to design
- if the relevant schema/rule context is already present, continue
- if the relevant context is absent or insufficient, discovery/refinement work is needed before design can close

The important point is:

- the **engine must not know what "schema present" means**
- the **domain must be able to define that metric**
- the **engine must still own the triggering/escalation/provenance protocol**

### Required behavior

At the platform level, the use case is:

1. traverse a coarse contract step
2. run domain-supplied `F_D`
3. if unresolved, escalate through `F_P` and then `F_H` as needed
4. if the evaluator path determines that more structure is required, activate a lawful refinement boundary
5. apply the chosen/refined topology
6. continue traversal with full provenance

In abstract form:

```text
Traversal(contract)
-> GapEvent
-> F_D / F_P / F_H
-> optional deferred refinement
-> lawful substitution
-> continue outer workflow
```

### What must remain true

- the outer contract remains stable to the caller
- the gap metric is domain-defined, not engine-defined
- the refinement is lawful and replayable
- ABG records why the refinement happened and what was applied
- the engine behaves deterministically even when the metric is domain-specific

### Why this use case matters

This is the first real test of the separation:

- if the engine starts learning domain meaning, the boundary is broken
- if the engine cannot host lawful refinement, dynamic zoom is not real
- if the evaluator path cannot trigger refinement while preserving trace, the homeostatic loop is not real

This is not a corner case.
It is the pattern for many domain builds:

- missing context
- inadequate evidence
- incomplete source model
- unresolved interface contract
- need for discovery before downstream work can continue

---

## 3. Alternative Solution Shapes To Compare

The use case above should be used to compare design alternatives.

### Option A — Guarded pre-authored branch

The workflow contains an explicit branch:

- if `F_D` closes the contract, continue
- else route into a pre-authored discovery subgraph

Shape:
- simplest runtime
- strongest replayability
- weakest flexibility
- requires the discovery path to be known in advance

Good for:
- stable domains
- predictable discovery patterns

Risk:
- may not scale when the refinement needed is not known ahead of time

### Option B — Deferred refinement boundary

The workflow declares a lawful refinement boundary.
When the evaluator path says the coarse contract is insufficient, a domain-supplied callback produces an interface-compatible graph/function which ABG then validates and applies.

Shape:
- preserves the clean engine/domain split
- supports real dynamic zoom
- keeps topology change lawful and replayable

Good for:
- discovery-heavy domains
- builder-of-builders direction
- contract-specific GSDLC variants

Risk:
- needs a very clear validation and provenance surface

### Option C — Candidate family plus evaluator selection

The domain publishes a family of lawful graph functions for the same boundary.
ABG enumerates candidates, and `F_D` / `F_P` / `F_H` or domain logic above the interpreter chooses one.

Shape:
- no arbitrary graph generation at runtime
- still allows dynamic choice
- stronger catalog/provenance story

Good for:
- domains with recurring known patterns
- policy-heavy or regulated environments

Risk:
- less open-ended than true synthesis
- can become catalog management overhead

### Option D — Always-run discovery subgraph

The system always performs the discovery/refinement path, even when the context may already be present.

Shape:
- simplest topology
- weakest efficiency
- weakest expression of conditional structural need

Good for:
- early prototyping only

Risk:
- wastes work
- weakens the value of domain-defined gap metrics
- does not prove lawful conditional refinement

### Current recommendation

For the constitutional design, the preferred target is:

- **Option B** as the general capability
- **Option C** as a common constrained realization of that capability
- **Option A** as a simpler first delivery where the domain is stable enough

Option D should not be the architectural destination.

---

## 4. Evaluation Criteria For Alternatives

Any proposed solution to the current use case should be judged against:

1. Does the engine remain domain-agnostic about the metric?
2. Is the refinement boundary explicit in GTL?
3. Does ABG own the deterministic trigger/escalation/provenance protocol?
4. Is the resulting topology change replayable?
5. Does the outer contract remain stable under refinement?
6. Can the same pattern be reused in multiple domains, not just the regulatory example?
7. Does the solution support incremental feature delivery without smearing capability across the kernel?

---

## 5. Advanced Use Cases To Bring Back Up

These are the previously surfaced advanced cases that should remain in the design pressure suite.

### U1. Ranked decomposition / materialization profiles

One logical builder should hydrate into different lawful structures based on an explicit profile such as:

- `steelthread`
- `mvp`
- `optimal`

Pressure:
- parameterized graph-function materialization
- profile provenance
- no hidden engine heuristics

Source thread:
- `20260325T164500_EXTENSION_gsdlc-usecases-materialization-and-hydration.md`

### U2. Gap-triggered context discovery

The current detailed use case in this note.

Pressure:
- domain-owned metric
- engine-owned protocol
- lawful deferred refinement

Source thread:
- current conversation plus the monadic/synthesis work

### U3. Consensus-gated review

Multiple reviewers or review agents assess an artifact under an explicit policy.
Consensus policy must be explicit, replayable, and separate from ambient engine behavior.

Pressure:
- explicit review policy surface
- `F_D` / `F_P` / `F_H` interplay
- durable gate provenance

Source thread:
- `20260325T164500_EXTENSION_gsdlc-usecases-materialization-and-hydration.md`

### U4. Parallel worker harvest

Multiple workers produce candidate outputs.
The worker set, candidate set, and harvest policy are all explicit.
The final merge/choice is replayable.

Pressure:
- parallel branch handling
- harvest policy visibility
- no hidden ranking heuristics

Source thread:
- `20260325T164500_EXTENSION_gsdlc-usecases-materialization-and-hydration.md`

### U5. BPM-sourced regulatory workflow fulfillment

Business-facing artifacts such as policy text, BRDs, SOPs, and BPM/BPMN models compile into GTL, then execute through ABG with hydration into the target environment.

Pressure:
- GTL as constrained semantic IR
- source-to-GTL traceability
- environment hydration without semantic corruption

Source thread:
- `20260325T173500_STRATEGY_gtl-as-constrained-machine-ir-for-bpm-sourced-workflows.md`

### U6. Runtime hydration into target environments

One logical GTL/ABG workflow should be hydrable into:

- local development
- cloud-native production
- regulated enterprise environments

Pressure:
- capability binding
- hydration provenance
- portability without language contamination

Source thread:
- `20260325T164500_EXTENSION_gsdlc-usecases-materialization-and-hydration.md`

---

## 6. Why This Suite Matters

Taken together, these use cases test whether the platform is really:

- metric-domain driven
- fully observable
- homeostatic
- builder-of-builders
- engine-independent over time

If the design solves only one of them well, the model is too narrow.
If it solves all of them by smearing logic into the engine, the model is too impure.

The winning design is the one that:

- keeps GTL structural and compositional
- keeps ABG deterministic and provenance-owning
- keeps domain semantics pluggable
- and supports incremental capability growth without ontology drift

---

## 7. Immediate Next Move

Use **U2: Gap-triggered context discovery during `requirements -> design`** as the first comparison case for alternative module designs.

Recommended comparison set:

1. guarded pre-authored branch
2. deferred refinement boundary
3. candidate family + evaluator selection

Evaluate them against the criteria in section 4 before choosing the first implementation path.
