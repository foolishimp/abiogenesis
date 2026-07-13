# Research Product Lab Scenario Catalog

**Status**: Active
**Date**: 2026-04-26
**Derives from**: [REQ-P-SCENARIOS.md](../requirements/product/REQ-P-SCENARIOS.md), [REQ-P-POLICY.md](../requirements/product/REQ-P-POLICY.md), [REQ-L-GTL3-HOF.md](../requirements/gtl/REQ-L-GTL3-HOF.md), [REQ-R-ABG3-INTERPRET.md](../requirements/abg/REQ-R-ABG3-INTERPRET.md)

## Purpose

This catalog defines the research-lab scenario families used to decide whether
GTL and ABG can support ODD-native downstream products without recreating
Python SDLC's imperative scaffolding.

The scenarios are product qualification obligations. They are not comments,
not examples, and not permission to move downstream domain meaning into ABG.

## Scenario Families

### 1. Extract

Pattern:

`Pattern/Rexp.X -> List[XItem]`

The graph function consumes a typed source asset plus a declared extraction
pattern and produces a typed vector of extracted items.

Closure requires a graph-function carrier, source-input lineage for every
item, and a proof lane that rejects hidden parsing state.

### 2. Synthesis

Pattern:

`InferenceRules -> List[InferredItem]`

The graph function consumes declared inference rules and source evidence, then
produces typed inferred items with explicit evidence links.

Closure requires replay-visible inputs, inference-rule authority, output item
lineage, and ambiguity capture when the inference is not determinate.

### 3. Transform

Pattern:

`A -> A_t`

The graph function consumes one typed asset and produces one transformed typed
asset.

Closure requires a declared transform carrier, an evaluator surface, and
evidence that the transform result did not come from a hidden service method.

### 4. Fan-Out Transform

Pattern:

`List[A] -> fan_out(T) -> C.batch(T(A_i)) -> List[A_t] -> fan_in(R) -> S`

The graph function applies a declared transform over an explicit vector
boundary. Runtime realization projects each admitted non-empty input member to
one ordinal-preserving `C.batch` task and admits the output vector only when
every task completes under the exact member contract. A declared `fan_in` may
then reduce that complete admitted vector to one synthesized result.

Closure requires `fan_out` or equivalent lawful GTL higher-order application,
projection over the produced vector. Runtime proof must also show one C-call
spine per invoking task, `batchRef` as grouping rather than call authority,
cardinality and attribution preservation, and output order independent of
task completion timing. A blocked, held, malformed, or runtime-failed member
must preserve completed and unstarted evidence while admitting no output
vector and invoking no fan-in. Fan-in must reject incomplete, duplicated,
reordered, foreign-basis, or contract-mismatched vectors before invoking the
exact declared reducer once.

### 5. Ambiguity Harvesting

Pattern:

`For every item in A -> T -> List[Ambiguous[A_t]]`

The graph function preserves ambiguous transform candidates instead of
silently selecting one.

Closure requires evaluator-result vectors or candidate-result vectors, clear
non-merge semantics, and a downstream triage or repricing path for unresolved
ambiguity.

### 6. Gap Evaluation

Pattern:

`RuntimeProjection -> GapTruth -> TriageWork`

ABG exposes replay-derived gap, hold, stop, continuation, and unresolved
observation truth. A downstream product graph function triages that truth into
ticket, action, deferment, repricing, or no-op product work.

Closure requires ABG to remain read-only at the gap projection boundary, the
triage carrier to be a published graph function, and ticket creation or ticket
mutation to remain governed by the downstream product and `TICKET_METHOD.md`.

## Non-Closure Conditions

- A scenario is implemented only as an imperative script.
- Python SDLC orchestration becomes product law for TypeScript.
- A scenario emits output without source-input lineage.
- A partial fan-out is projected as a complete output vector or reaches
  fan-in.
- Batch or fan-in meaning is inferred from names, tags, fixed fixture
  cardinality, or promise completion order.
- ABG owns downstream ticket process state.
- Ambiguity is collapsed by hidden LLM reasoning instead of a declared
  evaluator, merge, triage, or repricing surface.
