# GTL ODD Zoom And Fold Algebra Decision

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Resolve zoom-in, zoom-out, and fold terminology against existing
GTL/ODD algebra before implementation.

## Source Material

- `specification/requirements/gtl/REQ-L-GTL3-HOF.md`
- `specification/requirements/gtl/REQ-L-GTL3-SUBSTITUTE.md`
- `specification/requirements/gtl/REQ-L-GTL3-RECURSE.md`
- `specification/requirements/gtl/REQ-L-GTL3-SYNTHESIS.md`
- `GTL_3_MODULE_DESIGN.md`
- `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `specification/scenarios/09-research-product-lab-scenario-catalog.md`

## Decision

The vocabulary is useful for design discussion, but it is not new interpreter
law.

| Term | Current lawful mapping | Decision |
| --- | --- | --- |
| zoom in | refine or substitute one outer edge with an inner graph function while preserving the outer contract | existing law is sufficient |
| zoom out | project or compare typed nodes/assets through a graph function over replay-visible evidence | existing law is sufficient, scenario proof still needed |
| fold | `fan_in`, recursion foldback, or an explicit reducer graph function over a vector boundary | existing law is sufficient |

No new register, ledger, or intermediary tracking surface is authorized by the
terms alone.

## Constraints

- A zoom-in operation must preserve outer interface truth.
- A zoom-out operation must be an explicit graph-function projection or
  comparison, not an observer-local mental model.
- A fold must declare the vector boundary and reducer semantics.
- Asset registers and event ledgers needed by a product shall themselves be
  ODD products or ABG runtime facts, not ad hoc deterministic side stores.
- If a future scenario cannot be expressed with current GTL operations, the
  missing law must be repriced into requirements before code.

## Proof Consequence

T-068 catalog scenarios become the proof surface. The next implementation wave
should test zoom-in through refinement/substitution, zoom-out through typed
projection or comparison, and fold through `fan_in` or reducer graph functions
before adding new algebra.
