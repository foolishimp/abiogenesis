---
id: T-090
title: Design ABG total assurance carriers and plugin seams
type: feature
ticket_category: implementation_migration
status: completed
review_status: external_review_accepted
goal: abg-total-assurance-calculus
goal_status: active
activation_requires: T-089 completed and T-086 completed/external_review_accepted
change_intent: Design the minimal ABG-owned carrier and IoC plugin topology for total assurance projection without creating a rival compute aggregate, side-door runtime configuration, or plugin-owned closure path.
change_class: design_reframe
re_entry_point: design
affected_boundary: ABG projection carriers, closure fold carrier, authority snapshot provider, evidence adapter, ambiguity classifier, closure policy provider, gain function adapter, GTL assurance hook refs, reports/projections
priority: high
triaged_at: 2026-04-29T07:24:15Z
created_at: 2026-04-29T07:24:15Z
updated_at: 2026-04-30T17:57:01+10:00
closure_candidate_at: 2026-04-29T08:09:58Z
completed_at: 2026-04-30T17:57:01+10:00
dependencies:
  - T-088 completed
  - T-089 completed
  - T-086 completed/external_review_accepted
  - B-016 completed
migration_strategy: inside_out_core_interface_migration
library_usage: extend
governing_library: B-016 IoC provider model and ABG event/projection law
related_evidence:
  - .ai-workspace/comments/codex/20260429T172415AEST_T088_requirement_audit.md
  - .ai-workspace/comments/codex/20260429T180416AEST_T086_traversal_envelope_closure.md
governance_scope: STDO Method
design_authority:
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md
intake_source: T-088 found a requirement gap for total ambiguity projection. T-089 ratified the requirement layer; T-086 proved the traversal envelope topology. This ticket designs the core-interface migration surface that can realize assurance without premature implementation.
target_truth: ABG has a reviewed design for assurance projection over existing `GraphCall`, `Frame`, and `Continuation` truth. The design defines authority snapshot, input digest, admitted event facts, evidence rows, ambiguity rows, closure decisions, stale-input invalidation, and plugin/provider contracts as prime carriers.
superseded_truth: Assurance can be added as an ad hoc report, local closure register, odd_sdlc-specific ledger, or plugin callback that bypasses ABG event/projection authority.
non_goal:
  - Do not implement Python or TypeScript tenant code in this ticket.
  - Do not create a public `UnitOfCompute` aggregate unless T-089 explicitly authorizes it.
  - Do not let plugins append runtime events, choose next vectors, or close work.
  - Do not duplicate T-086's traversal envelope topology.
closure_law: Close only after external agent review accepts that design surfaces define the carrier topology, core-interface migration inventory, plugin contract model, target projections, report consumers, superseded closure paths, and negative proof obligations. This ticket remains active while T-086 is review-pending and T-091/T-092 remain open or review-pending.
core_interface_migration_inventory_required:
  - old and new producers
  - old and new consumers
  - runtime projections
  - reports and dashboards
  - proof surfaces
  - superseded closure paths
  - compatibility or adapter boundaries
  - negative proof that superseded closure paths cannot still close work
evaluation_criteria:
  - Design diagram shows GTL declarations, ABG runtime aggregates, event ledger, assurance projection, closure fold, plugin providers, and downstream adapters.
  - IACS identifies prime carriers and rejects duplicate truth surfaces.
  - Design defines how assurance scope is derived from `GraphCall`, `Frame`, and `Continuation` without relying on hidden controller memory.
  - Design defines provider contracts for authority snapshot, evidence adaptation, ambiguity classification, closure policy, and gain-function adaptation.
  - Design defines projection outputs and how existing reports consume them without becoming truth stores.
  - Design records how T-086's traversal envelope is consumed or co-closed.
  - Design preserves B-016 IoC shape: refs, contracts, resolvers/providers, consumers.
proof_surface:
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md
  - .ai-workspace/comments/codex/20260429T180958AEST_T090_assurance_design_closure.md
  - follow-on T-091 and T-092-TS remain open; T-092-PY is paused by tenant registry disposition
non_closure_conditions:
  - design closes by pointing at T-088 audit alone
  - design introduces a new public compute boundary without requirement authority
  - design leaves an old closure path authoritative
  - design treats plugin output as runtime truth or closure truth
  - design depends on downstream odd_sdlc semantics for the generic assurance law
---

# T-090: ABG Total Assurance Design

## Closure Candidate

T-090 is closed after external agent review accepted the carrier and plugin seam design.

The accepted design is a total assurance projection over the T-086 traversal
envelope. It introduces assurance carriers, provider contracts, row
classification, and closure fold law without creating a public `UnitOfCompute`
aggregate or a plugin-owned closure path.

## Prime Assurance Carriers

| Carrier | Role |
|---|---|
| `AssuranceScopeRef` | derived scope identity over existing graph-call/frame/continuation/vector truth |
| `AssuranceAuthoritySnapshot` | current authority/input snapshot and digest |
| `AssuranceEvidenceRow` | normalized evidence candidate from admitted runtime facts |
| `AssuranceAmbiguityRow` | explicit row status for authority/evidence state |
| `AssuranceProjection` | total row set plus provenance |
| `AssuranceClosureDecision` | only close/retry/reprice/block/qualified-defer decision |

`AssuranceScopeRef` is not a new product aggregate. It is an assurance-model
identity over existing runtime truth.

## Provider Contracts

The design extends the B-016 plugin model with assurance providers:

- `AuthoritySnapshotProvider`
- `EvidenceAdapter`
- `AmbiguityClassifier`
- `ClosurePolicyProvider`
- `GainFunctionAdapter`

Providers supply typed data and proposals. ABG admits provider outputs into the
projection and owns final row totality, precedence, and closure fold.

## Superseded Closure Paths

These are evidence only, not closure authority:

- worker process success,
- transport success,
- prompt-side self-assessment,
- `unresolvedReasons: []`,
- passing tests,
- archive shape,
- local report/ledger all-green rows,
- null closure-register state,
- plugin success claims.

## Core-Interface Migration Result

The migration inventory is recorded in
`M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md`. Old producer/consumer paths are
mapped into:

- authority snapshot providers,
- evidence adapters over admitted event truth,
- assurance rows,
- closure decisions,
- read-model reports and ledgers.

## Follow-On State

T-091 must prove row totality, stale-input invalidation, plugin authority
limits, old closure path bypass prevention, and T-086 envelope compatibility.

T-092-TS remains the active tenant implementation ticket. T-092-PY is retained
as a paused Python reference ticket under the tenant registry disposition. No
tenant implementation is claimed by T-090.
