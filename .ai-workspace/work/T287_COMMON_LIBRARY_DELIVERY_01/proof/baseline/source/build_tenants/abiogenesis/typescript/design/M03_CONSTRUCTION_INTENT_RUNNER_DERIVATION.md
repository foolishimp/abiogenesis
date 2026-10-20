# M03 Construction Intent Runner Derivation

## Requirement Authority

- `REQ-R-ABG3-FP-CONSCIOUSNESS`
- `T-128`

## Problem

T-127 admitted construction observations, candidates, selected intent, graph
action invocation events, deltas, progress ledgers, and construction
projections. It did not provide the installed ABG runner step that consumes the
selected admitted construction intent and performs the graph action.

Without that runner, downstream products are tempted to rebuild the loop in
CLI, public gaps, or product controllers. That repeats the Python outer-loop
shape at the wrong layer.

## Derivation

The runner boundary is:

1. replay admitted construction events;
2. select the admitted construction intent from admitted priority truth;
3. emit `construction_graph_action_invoked`;
4. run the selected graph function through the existing ABG iterate runner;
5. emit `construction_delta_observed` from the graph action result;
6. rederive the progress ledger and `ConstructionProjection` from replay.

The runner owns event append order and graph invocation. It does not own product
meaning, pressure selection, or content closure. Those remain in admitted
construction carriers and downstream evaluators.

## Non-Goals

- No CLI-owned construction loop.
- No public-gaps dispatch path.
- No prompt-prose graph action invocation.
- No second runtime controller outside ABG traversal.
