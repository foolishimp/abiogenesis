# STRATEGY: Pluggable Graph Synthesis, Selection, and Evaluator IoC

**Author**: codex
**Date**: 2026-03-26T16:18:06+11:00
**Status**: Review first
**Audience**: jim, claude

## Position

The likely remaining `abg 1.0` blocker is not a generic “custom evaluator” feature.

It is a stronger producer-contract capability:

**consumer-pluggable graph synthesis/selection and invocation, with evaluator attestation, under ABG-hosted application and provenance**

This is what makes:
- contract-specific GSDLC variants
- higher-order workflow composition
- meaningful dynamic zoom
- consumer-owned business logic

all fit together without pushing business logic into ABG.

---

## Why this is a 1.0 blocker

If GSDLC is the major consumer, this capability dictates how that consumer is authored.

Without it:
- GSDLC is authored as a monolithic or hardcoded graph
- dynamic zoom is mostly decorative decomposition
- custom contract-specific variants become ad hoc forks
- evaluator logic gets pulled into ABG or hidden in non-replayable glue

With it:
- GSDLC can publish reusable workflow programs
- contract-specific consumers can synthesize/select lawful graphs for their current situation
- composed/refined graphs can be invoked under ABG
- evaluator hooks can attest and close the contract without ABG absorbing business logic

That makes this a live product capability, not backlog polish.

---

## Core boundary

### ABG owns

- interpretation and application of lawful GTL structures
- event sourcing
- replay
- provenance
- lineage
- binding
- run governance
- transport
- correction

ABG is a lawful host/runtime. It must remain business-logic-free.

### GTL owns

- graph structure
- graph functions
- lawful composition
- lawful substitution
- lawful recursion
- higher-order graph operators
- the selection boundary

GTL defines what counts as a lawful graph/program surface.

### GSDLC or other consumers own

- contract-specific graph synthesis/selection logic
- contract-specific evaluator hooks
- contract-specific criteria for choosing among lawful alternatives

That is where business logic belongs.

---

## What the feature actually is

The first thing a real consumer will want is:

1. inspect the current contract, context, lineage, and state
2. construct or choose a valid graph/workflow for the current situation
3. invoke that graph
4. attest that the chosen/generated graph was lawful and appropriate

That means the missing capability is not just “call a custom evaluator.”

It is a four-part surface:

1. **Graph synthesis/selection hook**
   - consumer-pluggable logic can build or select a lawful GTL graph/function/composition for the current situation

2. **Lawful application surface**
   - ABG can accept the selected/generated graph contract and invoke it without owning the business logic that produced it

3. **Evaluator attestation hook**
   - consumer-pluggable evaluators can attest:
     - why this graph was chosen
     - whether the composition is compatible
     - whether the invoked structure closed the intended contract

4. **Replayable provenance**
   - the synthesis/selection decision and invocation path are recorded as structured provenance, not as hidden prompt magic

---

## What this is not

This is not:

- putting business logic into ABG
- letting evaluators invent hidden topology inside the interpreter
- letting F_P prompts silently choose arbitrary workflows with no provenance
- replacing GTL structural law with consumer-specific imperative code

The consumer may propose or select lawful structure.
ABG must still host and record the lawful application of that structure.
GTL still defines what “lawful structure” means.

---

## Relationship to existing GTL 2.x capability

This is mostly a closure/proof gap on the existing 2.x direction, not a random new axis.

It depends on making these surfaces operationally real:
- `GraphFunction`
- `compose`
- `substitute`
- `recurse`
- higher-order graph operators
- explicit selection/application boundary
- provenance-carrying evaluator decisions

In other words:

**higher-order compositional GTL workflows become real when consumers can lawfully plug in graph synthesis/selection logic and evaluator hooks without contaminating ABG.**

That is what makes dynamic zoom meaningful instead of decorative.

---

## Inversion of control reading

The clean architecture is inversion of control:

- GTL provides the language and lawful structure
- ABG provides the host loop and replay/provenance/runtime law
- GSDLC provides consumer-specific synthesis/selection/evaluator hooks

So the platform surface should not read as:

“ABG knows how to choose your workflow.”

It should read as:

“ABG can host consumer-pluggable lawful graph synthesis/selection and evaluator attestation under replayable provenance.”

---

## Likely design rule

The hook surface should be powerful enough to:
- inspect contracts
- inspect contexts
- inspect lineage
- inspect candidate graph functions or modules
- return a lawful candidate or composition
- return structured rationale
- fail closed when no lawful candidate exists

But it should not be able to:
- bypass GTL structural law
- mutate interpreter topology secretly
- create non-replayable hidden decisions
- become a second constitution

---

## Likely proof obligation

The proof should be consumer-shaped, not abstract.

Suggested proof scenario:

1. Define reusable base GSDLC graph functions.
2. Define at least two contract-specific GSDLC variants.
3. Show that each variant is produced through lawful composition/substitution rather than copy-pasted monoliths.
4. Use a consumer-provided synthesis/selection hook to choose or build the right graph for a current contract situation.
5. Invoke the resulting graph under ABG.
6. Record provenance of:
   - why that graph was chosen/generated
   - what structural law made it valid
   - what evaluator closed the contract

If that scenario cannot be written and proven, the feature is not real enough for `abg 1.0`.

---

## Recommended next move

Do not jump straight to code.

First review and decide whether this framing is right:

- Is the blocker correctly named?
- Is the boundary between ABG, GTL, and GSDLC correct?
- Is this mostly an existing-capability closure gap, or does it require a new requirement family?
- What exact proof scenario should be the 1.0 release gate?

If the framing is accepted, the next step should be:

1. intent delta
2. requirement wording
3. owning design rule / ADR
4. proof scenario

Not implementation first.

---

## Hard Delta Functions

These delta scales are intended to be concrete enough to drive repricing.

### GTL delta scale

- `ΔG0` — already present in GTL; no language change, only proof/trace/cleanup
- `ΔG1` — wording / ownership / constraint clarification; no new GTL types
- `ΔG2` — extend GTL declaration surface (fields, contract refs, interfaces, metadata, hook contracts)
- `ΔG3` — add first-class GTL algebra or semantic law (composition/substitution/recursion/selection semantics)
- `ΔG4` — add a new GTL semantic subsystem (for example mapping profiles or graph-synthesis/selection IoC as a first-class language concern)

### ABG delta scale

- `ΔA0` — already present in ABG; no runtime change, only proof/trace/cleanup
- `ΔA1` — policy / provenance / trace / verification change
- `ΔA2` — extend an existing runtime module or service surface
- `ΔA3` — add a substantive runtime subsystem or cross-module execution capability
- `ΔA4` — major runtime architecture change

---

## Capability Matrix

The table below is intentionally GTL-weighted.

| Reference system | Specific capability | GTL delta | ABG delta | First move | Why it matters |
| --- | --- | --- | --- | --- | --- |
| **Temporal** | `child workflows / sub-workflows` | `ΔG2` — explicit contract refs for graph/function invocation targets | `ΔA3` — runtime lineage + invocation + lifecycle | GTL first, then ABG | dynamic zoom becomes real only if the language can name what gets invoked |
| **Temporal** | `signals / external messages / updates` | `ΔG2` — message and control boundary must be expressible in contracts | `ΔA3` — durable message delivery, run mutation, replay-safe handling | ABG first, informed by GTL | mostly runtime law, but GTL must not hide the boundary |
| **Temporal** | `durable retries / timeouts / compensation` | `ΔG1` — maybe only explicit contract/governance hooks | `ΔA3` — run governance and retry semantics | ABG first | strong durability lesson, weak language delta |
| **Temporal** | `continue-as-new / history management` | `ΔG0` | `ΔA3` | ABG first | almost entirely runtime |
| **LangGraph** | `subgraphs` | `ΔG3` — first-class lawful subgraph composition/substitution must be real | `ΔA2` — runtime application of nested/composed graphs | GTL first | directly pressures graph-function and zoom semantics |
| **LangGraph** | `state persistence / checkpoints` | `ΔG1` — maybe explicit state/projection boundaries only | `ΔA3` — checkpoint/replay/resume semantics | ABG first | runtime heavy; GTL should only expose lawful structure |
| **LangGraph** | `interrupt / resume / human-in-loop` | `ΔG1` — explicit judgment/governance surface already mostly present | `ΔA2` — runtime pause/resume / pending-state support | ABG first | governance and human gating need robust realization |
| **LangGraph** | `routers / conditional graph control` | `ΔG2` — stronger selection contract surface | `ΔA2` — lawful application and provenance of routing decisions | GTL first | intersects selection-boundary law |
| **CrewAI** | `flows (start / listen / router)` | `ΔG2` — event-triggered control and hook surfaces need clear declaration form | `ΔA2` — host-level trigger and invocation support | GTL first | useful pressure on trigger/control semantics |
| **CrewAI** | `crews / multi-agent team orchestration` | `ΔG1` — likely an engine mapping concern, not native GTL ontology | `ΔA1` if mapped, `ΔA3` if made native | mapping first, not ABG-native first | should not drag team business logic into ABG core |
| **CrewAI** | `guardrails / callbacks / HITL triggers` | `ΔG2` — evaluator hook contracts and structured callback semantics | `ΔA2` — runtime hook invocation and provenance | GTL first | this is close to the actual `abg 1.0` blocker |
| **CrewAI** | `consumer-pluggable graph synthesis / selection` | `ΔG4` — new first-class IoC surface for lawful graph synthesis/selection hooks | `ΔA2` — host invocation + provenance of hook decisions | GTL first | this is the highest-value GTL delta right now |
| **CrewAI** | `mapping GTL -> CrewAI Flow/Crew` | `ΔG4` — mapping/capability/provenance layer becomes real | `ΔA0` for ABG canonical engine, `ΔA1` if ABG records mapping provenance | GTL first | strategic engine-independence proof |
| **Camunda / Zeebe** | `human tasks / approvals / governance checkpoints` | `ΔG2` — stronger human/governance contract surfaces may be needed | `ΔA3` — real runtime support for assignment, pending state, audit | GTL first on contract shape, ABG second on runtime | important for enterprise-grade orchestration |
| **Camunda / Zeebe** | `explicit gateways / decision points` | `ΔG2` — decision/gateway semantics may need sharper declaration surface | `ΔA2` — explicit application/provenance of decisions | GTL first | overlaps selection boundary and rule surfaces |
| **Camunda / Zeebe** | `DMN / rule-task style decision services` | `ΔG2` — evaluator/rule hook contracts | `ΔA2` — execution/provenance of decision artifacts | GTL first | another route into evaluator IoC |
| **Conductor** | `sub-workflows` | `ΔG2` — reusable invocation contracts | `ΔA2` — orchestration runtime for nested flows | GTL first | similar pressure to Temporal, less strong on durability law |
| **Conductor** | `dynamic fork / join` | `ΔG3` — fan-out/fan-in must be real semantics, not decorative | `ΔA2` — runtime realization of branch execution and join provenance | GTL first | directly tests higher-order graph operators |
| **Conductor** | `event tasks / external event wakeups` | `ΔG2` — explicit event/task contract surface | `ΔA3` — runtime event integration and wakeup semantics | ABG first, bounded by GTL | runtime heavy, but still needs language boundary |
| **Step Functions / Durable Functions / Cloud Workflows** | `choice / parallel / map / distributed map` | `ΔG1` to `ΔG3` depending on whether current fan-out/fan-in/gate semantics are actually sufficient | `ΔA0` for canonical ABG, `ΔA3` for cloud-hosted realization | GTL first for semantics; ABG later if cloud target | useful to test whether GTL algebra is truly enough |
| **Step Functions / Durable Functions / Cloud Workflows** | `external events / waits / resumptions` | `ΔG1` — mostly boundary clarity | `ΔA3` — runtime wait/resume/message infrastructure | ABG first | mostly execution substrate |
| **Step Functions / Durable Functions / Cloud Workflows** | `mapping onto constrained managed engines` | `ΔG4` — capability profiles, degradation rules, mapping provenance | `ΔA0` canonical ABG unaffected | GTL first | this is where engine-independence becomes serious |

---

## GTL-first priority order

If the goal is to maximize GTL value first, the likely priority order is:

1. **CrewAI-inspired consumer-pluggable graph synthesis / selection IoC**
   - `ΔG4`
   - strongest direct connection to the current blocker

2. **LangGraph / Conductor pressure on subgraphs, fan-out/fan-in, and routing**
   - `ΔG3`
   - strongest pressure on making higher-order composition real

3. **Temporal pressure on lawful invocation targets, lineage, and dynamic refinement**
   - `ΔG2` to `ΔG3`
   - important, but more ABG-heavy than the two above

4. **Managed-engine mapping layer**
   - `ΔG4`
   - strategically important, but probably post-1.0 unless engine-independence itself becomes a release gate

---

## Reading the matrix

The most important conclusion is:

- **most of the interesting new value is GTL-first**
- ABG then picks up the runtime consequences of what GTL makes explicit

That matches the current blocker:

the hard part is not “make ABG smarter.”
the hard part is **make GTL expressive enough to host lawful consumer-pluggable graph synthesis, selection, composition, and evaluator attestation without leaking business logic into ABG.**
