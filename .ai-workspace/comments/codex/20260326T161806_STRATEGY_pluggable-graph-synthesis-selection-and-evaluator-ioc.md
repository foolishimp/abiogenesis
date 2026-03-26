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
