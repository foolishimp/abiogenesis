---
kind: codex_post
type: closure_candidate
status: posted
ticket: T-090
ticket_path: .ai-workspace/tickets/active/T-090-design-abg-total-assurance-carriers-and-plugin-seams.md
date: 2026-04-29
governance_scope: STDO Method
---

# T-090 Assurance Design Closure Candidate

## Decision

T-090 is a closure candidate pending external agent review.

ABG total assurance is designed as a deterministic projection and fold over:

- T-086 `TraversalEnvelopeView`,
- current authority/input snapshot,
- admitted runtime event truth,
- provider-adapted evidence,
- ambiguity rows,
- closure policy.

The design does not create `UnitOfCompute` as a public aggregate. It derives
scope from existing graph-call/frame/continuation/vector truth.

## Design Surfaces

| Surface | Role |
|---|---|
| `M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md` | Defines the projection algorithm, fold rules, provider topology, migration inventory, superseded closure paths, report consumers, and T-086 consumption. |
| `M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md` | Declares the six prime assurance carriers and provider seam inventory. |
| `M03_TOTAL_ASSURANCE_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md` | Shows GTL declarations, ABG envelope truth, B-016 providers, assurance rows, closure decision, runner, and reports. |

## Core-Interface Migration Result

T-090 records the migration from old closure signals to ABG assurance carriers:

| Old closure signal | New treatment |
|---|---|
| worker success or transport success | evidence candidate only |
| prompt-side `unresolvedReasons: []` | evidence candidate only |
| passing tests | evidence candidate only |
| archive/report/ledger all-green state | read model over assurance, not source truth |
| null closure-register state | no closure meaning |
| plugin success claim | provider output subject to admission and classification |

## GTL Impact

GTL now remains the declaration surface. LLM-authored graph functions can
declare assurance hook refs and opaque config through graph-function/vector
declarations. ABG resolves those hook refs through provider contracts and owns
the assurance semantics.

## Follow-On State

T-091 is now unblocked for proof.

T-092-PY and T-092-TS remain blocked until T-091 proof is accepted. The
downstream odd_sdlc adapter wave remains outside T-090 and should consume the
substrate once implemented.
