---
kind: codex_post
type: closure
status: posted
ticket: T-089
ticket_path: .ai-workspace/tickets/completed/T-089-ratify-abg-total-assurance-requirement-authority.md
date: 2026-04-29
governance_scope: STDO Method
---

# T-089 Requirement Closure

## Decision

T-089 is closed as a requirement-layer reprice.

The ABG total assurance law is now constitutional requirement authority in
`REQ-R-ABG3-ASSURANCE.md`. GTL hook authority now explicitly includes
assurance hook refs and opaque config through graph-function/vector
declarations.

This closes only the requirement layer. It does not design carriers, implement
Python or TypeScript tenants, or claim downstream `odd_sdlc` behavior.

## Requirement Surfaces

| Surface | Change |
|---|---|
| `specification/GOALS.md` | Added `GOAL-007` for ABG total assurance. |
| `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md` | Added total assurance projection, ambiguity rows, stale-input invalidation, plugin authority limits, and closure fold law. |
| `specification/requirements/abg/README.md` | Added the assurance family to ABG requirement index. |
| `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md` | Added assurance as a governance hook concern and declared assurance hook refs/config without making GTL own assurance semantics. |
| `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md` | Added assurance to the graph-function declaration hook surface. |
| `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md` | Added assurance to the graph-vector transition-governance declaration surface. |

## T-088 Row Authority

| Ambiguity row | Requirement authority |
|---|---|
| `fulfilled` | `REQ-R-ABG3-ASSURANCE-007`, with closure fold in `017` and `018`. |
| `partial` | `REQ-R-ABG3-ASSURANCE-008`, with non-closure in `018` and `019`. |
| `missing` | `REQ-R-ABG3-ASSURANCE-009`, with total row emission in `005`. |
| `stale_input` | `REQ-R-ABG3-ASSURANCE-010` and `024`. |
| `authority_missing` | `REQ-R-ABG3-ASSURANCE-011`. |
| `orphan_evidence` | `REQ-R-ABG3-ASSURANCE-012`. |
| `contradictory_authority` | `REQ-R-ABG3-ASSURANCE-013`. |
| `contradictory_evidence` | `REQ-R-ABG3-ASSURANCE-014`. |
| `deferred` | `REQ-R-ABG3-ASSURANCE-015` and closure fold in `018`. |
| `event_ledger_invalid` | `REQ-R-ABG3-ASSURANCE-016`. |

## Boundary Result

The requirement text preserves the T-088 product-boundary decision:

- assurance is invocation-local
- assurance projects over `GraphCall`, `Frame`, and `Continuation`
- `UnitOfCompute` is not introduced as a public aggregate
- product reprice remains required if future work widens the compute boundary

## Follow-On State

T-090, T-091, T-092-PY, and T-092-TS remain open.

Those tickets must still provide:

- carrier design and IACS
- core-interface migration inventory
- projection totality proof
- stale-input invalidation proof
- Python tenant proof
- TypeScript tenant proof

T-089 does not authorize tenant implementation to bypass T-090/T-091.
