# ODD SDLC TypeScript Traversal Assurance Integration

## Authority

- Ticket: `T-066`, `T-094`, `T-095`, `T-100`, `T-101`
- Requirements: `REQ-F-ODDSDLC-013`, `REQ-F-ODDSDLC-051`,
  `REQ-F-ODDSDLC-053`, `REQ-F-ODDSDLC-055`, `REQ-F-ODDSDLC-058`,
  `REQ-F-ODDSDLC-061`, `REQ-F-ODDSDLC-062`
- Design pack:
  - `ODD_SDLC_TYPESCRIPT_DETERMINISTIC_TRAVERSAL_STATE_MACHINE.md`
  - `ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`
  - `ODD_SDLC_TYPESCRIPT_INSTALLED_OPERATOR_UX.md`

## Purpose

The installed operator must not close a product-realization edge only because a
worker wrote files that pass path and digest checks.

For materialization edges, the worker result surface is admitted through this
deterministic sequence:

```text
worker result report
  -> product materialization postflight
  -> traversal assurance ledgers
  -> ledger fold
  -> edge closure or replayable gap pressure
```

The ledgers are graph-function-owned evaluators. They are not commentary and
not a separate report lane.

## Cumulative Obligation Context

The installed operator must give every requirement-bearing realization edge one
self-contained traversal obligation context.

The context is the current edge's obligation basis:

```text
TraversalObligationContext =
  source asset types
  + target asset type
  + requirement authority refs
  + design/module authority refs
  + prior edge evidence refs
  + runtime context refs
  + retry gap dossiers
  + current delta summary
```

The worker must assess that context in its result report. The operator must
fold the worker assessments, materialized evidence, requirement closure truth,
and prior gap truth before edge closure.

This is not prompt guidance. It is the closure contract for product
realization:

```text
TraversalObligationContext
  -> F_P candidate output + WorkerObligationAssessment[]
  -> F_D assurance ledgers
  -> TraversalRequirementSatisfaction
  -> close | retry_same_edge | blocked | reprice_required
```

Large surfaces are carried by stable references and digests. The manifest may
also include compact current-state summaries for the actively blocking delta.
This distributes LLM compute across intermediate states without permitting
obligation loss.

## Carrier Boundary

| Carrier | Producer | Consumer | Closure Role |
| --- | --- | --- | --- |
| `SdlcWorkerResultReport` | F_P worker | installed operator | candidate result surface |
| `SdlcTraversalObligationContext` | installed operator | F_P worker and assurance gate | cumulative requirement/design/module/prior-edge pressure |
| `SdlcWorkerObligationAssessment[]` | F_P worker | requirement fulfillment ledger | worker-declared fulfillment over manifest obligations |
| `SdlcPostflightResult` | operator F_D postflight | materialization ledger | file/path/digest admission |
| `SdlcWorkerExecutionEvidence` | worker or execution adapter | operator F_D postflight | build/test command result admission |
| `SdlcAssuranceLedger[]` | operator assurance gate | ledger fold | dimension-specific realization truth |
| `SdlcTraversalRequirementSatisfaction` | ledger fold | installed operator | total closure/retry decision |
| `SdlcPostflightGapDossier` | installed operator | ABG-compatible retry events | replayable gap pressure |

## F_D Severity Placement

F_D findings are classified before they affect admission, construction,
routing, or closure:

| Severity Class | Blocks | Does Not Block | Runtime Meaning |
| --- | --- | --- | --- |
| `protocol_invalid` | Evidence admission for the affected carrier. | Independent F_P/content construction when its inputs remain valid. | Fixed protocol identity, target carrier envelope, digest, closed-kind, or required carrier field is invalid. |
| `construction_context_invalid` | Construction or routing that depends on the invalid context. | Content evaluation on unrelated admitted evidence. | Required workspace, topology, target, policy, install, or command context is unavailable or stale. |
| `diagnostic_shape_invalid` | Nothing by itself. | F_P construction, evidence admission, closure, or execution when no downstream consumer reads the malformed field. | A diagnostic/register field is malformed or extra but outside the downstream-read set for routing/admission/closure/execution construction. The finding records residual diagnostic pressure. |
| `content_unproven` | Product/content close. | Evidence admission and next F_P/execution attempts. | Execution, test, requirement, or assurance evidence has not proven the declared product behavior. |

The downstream-read rule is mechanical: a field can block only if a downstream
consumer reads that field to choose routing, admit evidence, derive closure, or
construct the declared execution command. Otherwise the finding is
`diagnostic_shape_invalid` and remains visible as pressure without forcing a
register-repair pass.

## Required Dimensions

For non-product edges, product assurance is not applicable.

For product materialization edges:

- `materialization` is required
- `shallow_realization` is required
- `requirement_fulfillment` is required when the handoff carries requirement
  obligations
- `obligation_carry` is required when replay-derived retry gap dossiers are
  present
- `capability` is required on `code_surface` when the conformed project
  declares capability contracts for the active tenant

For `test_run_archive_surface`:

- `SdlcWorkerExecutionEvidence` is required
- the lane must be `test`
- the command must match the conformed project test execution contract
- status must be `succeeded`
- observed tests must be greater than zero
- report refs must be present

The admitted status vocabulary is closed:

- `succeeded`
- `failed`
- `pending`

Legacy or worker-emitted `not_run` is normalized to `pending` at report
admission. `pending` is admissible as a carrier state, but it is not closure
evidence. The archive edge blocks until execution evidence is `succeeded` with
observed tests, report refs, and zero failures.

For `component_test_surface`:

- materialized test files must be discoverable by the declared test execution
  contract
- when the contract is `sbt test`, standalone `object ... main` programs are
  not component-test closure evidence
- if the selected tenant build configuration lacks a discoverable test
  framework binding, the worker must materialize or update build configuration
  and report the file as `build_config`
- non-discoverable test materialization blocks before the test-run archive edge
  and is emitted as replay-visible gap pressure

The fold result is total:

| Fold Status | Operator Transition |
| --- | --- |
| `close_allowed` | continue to hook postflight and accepted runtime events |
| `retry_same_edge` | emit gap dossier and same-edge retry pressure |
| `blocked` | emit typed blocked gap pressure |
| `reprice_required` | emit typed reprice pressure |

## Complexity-Admitted Traversal Selection

Traversal selection is an evaluator consequence over admitted complexity
evidence. It is not edge deletion by label and not an analyzer-owned skip.

The evaluator records:

- outcome class: `domain_product`, `framework_smoke`, or `tutorial_example`
- hop class: `single_hop`, `dual_hop`, `staged`, `zoom_required`, or `blocked`
- upstream-per-downstream compression ratio
- downstream-per-upstream expansion ratio
- residual ownership and public-boundary measures
- selected graph variant
- Min(F_P) pressure-preservation mechanism
- rejected alternatives and blocking reasons

The operator-run archive is the audit surface for those decisions. When staged
topology evidence is available, the operator writes
`sdlc_decomposition_summary.json` plus the implementation/test-specific
summary and dependency-map carriers. When traversal depth is evaluated, the
operator writes `sdlc_traversal_hop_selection.json` and emits an ABG-typed
`fd_authority_outcome_admitted` runtime event whose evidence refs cite the
selection carrier and its proportionality inputs. The event stream carries the
auditable pointer; the carrier holds the full measured decision.

Min(F_P) may reduce probabilistic worker invocations only when skipped or
collapsed pressure is preserved by one of four admitted mechanisms:

- typed-template direct materialization
- replay-visible projection over admitted carriers/events
- bundled F_P output for coupled pressure
- outcome-class graph variant

Projection-only rollups can avoid `F_P.transform` dispatch only when the
projection cites admitted carrier/event refs that preserve the skipped pressure.
When no admitted complexity or pressure-preservation evidence exists, analyzer
output must report `blocked`; the analyzer does not create traversal authority.
Analyzer output first reads archived traversal-hop selections and
decomposition-summary carriers. It derives a fallback projection only when no
archived decision exists.

## ABG-Owned Retry And Continuation Closure

Worker report admission failure is not success, but it is also not terminal
when the operator has already converted it into retry/repair runtime truth.

The installed operator does not own a traversal loop. It exposes odd_sdlc F_P
dispatch as an ABG engine plugin and lets ABG whole-graph iteration decide
whether the current vector retries, advances, blocks, or converges.

```text
worker report missing or malformed
  -> report-admission postflight blocked
  -> SdlcPostflightGapDossier
  -> retry/continuation runtime events
  -> nextLawfulAction = retry_same_edge_with_gap_dossier
  -> ABG retry frontier decides whether the same vector receives prior gap pressure
```

When ABG schedules a retry, the next attempt receives the prior gap dossier as
`prior_gap:*` traversal obligations. The runner stops only when ABG reaches a
terminal blocked, failed, or converged state for the selected graph function.
The CLI and installed operator may serialize the result and archives, but they
do not own vector advancement or the retry fold.

## Design Rule

An assurance finding is part of traversal state. It must be archived and, when
not close-allowed, converted into replay-visible gap/continuation pressure
before the operator returns.
