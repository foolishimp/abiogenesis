---
id: T-088
title: Design ABG total unit-of-compute assurance and ambiguity projection
type: spike
ticket_category: ordinary
status: completed
goal: abg-total-assurance-calculus
goal_status: active
scope: upstream_requirement_audit
build_tenant_scope: upstream_only
activation_requires: GOALS.md reprice or explicit inclusion in a future active ABG wave before moving to active
product_boundary_constraint: The unit of compute in this ticket is an invocation-local ABG assurance carrier contained by the existing GTL edge-traversal / GraphCall / Frame / Continuation runtime boundary. This ticket does not authorize a new product-level compute boundary. If the audit finds assurance must govern units outside the existing edge-traversal boundary, a product_reprice ticket must precede design or implementation.
change_intent: Define the ABG-owned assurance calculus for bounded compute within the existing GTL edge-traversal runtime boundary so closure is always derived from a total ambiguity projection over current authority and admitted event facts, while downstream products supply domain gain functions and evidence semantics through IoC plugins.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG event truth, replay projection, convergence and closure fold, correction/stale-input invalidation, runtime plugin contract model, GTL hook declarations, downstream SDLC adapters, installed substrate assurance, unit-of-compute runtime identity
priority: high
triaged_at: 2026-04-29T00:00:00Z
created_at: 2026-04-29T00:00:00Z
updated_at: 2026-04-29T07:50:10Z
completed_at: 2026-04-29T07:50:10Z
dependencies:
  - T-086 active/awaiting_external_agent_review
  - T-087 completed
  - B-016 completed
  - B-013 completed
  - B-014 completed
  - T-072 completed
  - T-084 completed
required_follow_on_before_closure:
  - T-089 ratify ABG total assurance requirement authority
  - T-090 design ABG total-assurance carriers and plugin seams
  - T-091 prove projection totality and premature-closure negative guards
  - T-092-PY tenant-suffixed Python implementation/proof placeholder
  - T-092-TS tenant-suffixed TypeScript implementation/proof placeholder
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
product_authority:
  - specification/PRODUCT.md Probabilistic Compute Boundary
  - specification/PRODUCT.md Outcome Compute Contract
  - specification/PRODUCT.md ABG product layer
intent_authority:
  - specification/INTENT.md GTL / ABG control boundary
  - specification/INTENT.md ABG outcome compute primitive
  - specification/INTENT.md event calculus over authoritative events and replay-derived projections
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-GRAPHCALL.md
  - specification/requirements/abg/REQ-R-ABG3-FRAME.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-LINEAGE.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
related_tickets:
  - .ai-workspace/tickets/active/T-086-prove-abg-generic-traversal-envelope-topology-for-cumulative-pressure-and-coverage.md
  - .ai-workspace/tickets/completed/T-089-ratify-abg-total-assurance-requirement-authority.md
  - .ai-workspace/tickets/active/T-090-design-abg-total-assurance-carriers-and-plugin-seams.md
  - .ai-workspace/tickets/active/T-091-prove-abg-total-ambiguity-projection-and-premature-closure-guards.md
  - .ai-workspace/tickets/backlog/T-092-PY-realize-python-abg-total-assurance-projection-and-closure-fold.md
  - .ai-workspace/tickets/active/T-092-TS-realize-typescript-abg-total-assurance-projection-and-closure-fold.md
  - .ai-workspace/tickets/completed/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md
  - .ai-workspace/tickets/completed/T-087-restore-typescript-abg-supervised-actor-invocation-over-one-fp-dispatch.md
audit_artifacts:
  - .ai-workspace/comments/codex/20260429T172415AEST_T088_requirement_audit.md
related_downstream_evidence:
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/.ai-workspace/comments/codex/20260429_test57cx_vs_test35_forensic_analysis.md
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cx
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cl
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test57.fp.cl/.ai-workspace/comments/claude/20260429_fp_worker_prompt_not_delivered.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/B-070-realize-typescript-claude-process-worker-argv-headless-prompt-delivery.md
  - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TRACEABILITY_REQUIREMENT_CLOSURE.md
  - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/projection/requirement_closure.ts
  - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/assurance_gate.ts
intake_source: Forensic comparison of data_mapper test35, test57.fp.cx, and test57.fp.cl showed that modern TypeScript traversal can converge while product lifecycle lineage remains under-projected. The .cx lane showed clean installed-operator convergence with weak product lineage; the .cl lane after B-070 showed the fixed worker binding can advance many closures and still leaves the same substrate question about total projection versus premature closure. The root failure class is premature closure: closure can be inferred from traversal success or local postflight instead of from a total replay-derived projection over current authority, admitted events, evidence, gaps, and stale-input invalidation. The same pattern is generic inside the existing ABG edge-traversal runtime boundary, not SDLC-specific and not a new product-level compute boundary.
target_truth: ABG owns a generic assurance law for bounded compute inside the existing GTL edge-traversal / GraphCall / Frame / Continuation boundary. For any invocation-local unit U inside that boundary, ABG computes assure(U) as fold(project_ambiguity(A_U, E_U)), where A_U is the current authority/input snapshot and E_U is the admitted event ledger for the unit. The projection is total: every fulfilled, partial, missing, stale, orphan, contradictory, deferred, authority-missing, or invalid-event state becomes an explicit row. Closure is legal only when the fold over that projection proves zero unresolved ambiguity or a release-lawful deferral. Changed inputs invalidate prior closure projections without erasing event history.
superseded_truth: A downstream product or local operator may infer closure from worker success, passing tests, local archive reports, prompt-side assessment, or a nullable closure register as long as the traversal controller has no terminal failure.
non_goal:
  - Do not move SDLC requirement semantics, code-quality policy, data_mapper capability profiles, or domain acceptance meaning into ABG.
  - Do not turn GTL into an ambiguity-calculus DSL or event-calculus language.
  - Do not let plugins emit runtime events directly, choose next vectors, or close compute units.
  - Do not replace existing GTL hook references with raw callbacks or product-specific semantics.
  - Do not implement a broad runtime rewrite before requirement/design review decides the minimal ABG carrier set.
  - Do not treat automatic product completion as the guarantee; the guarantee is total projection and no premature closure.
open_decisions:
  - id: OD-001
    decision: Does GTL need an explicit assurance hook concern, or do existing deterministic-proof and closure hook concerns already cover total unit-of-compute assurance?
    affected_invariant: GTL remains declarative and does not become a policy or ambiguity-calculus DSL.
    closure_requirement: Record one decision with rationale, affected GTL requirement refs, and whether a requirement amendment or clarification is needed.
    audit_resolution: New GTL acceptance criteria are needed. Existing deterministic-proof and closure hook concerns are enabling authority but do not explicitly expose total assurance as a declared graph-function/vector boundary.
  - id: OD-002
    decision: Is total ambiguity projection already authorized by existing ABG event/projection/convergence/correction requirements, or does ABG need new acceptance criteria or a new requirement family?
    affected_invariant: Runtime truth must be reconstructable by replay and closure must not be inferred from controller-local success.
    closure_requirement: Produce the requirement audit matrix defined below.
    audit_resolution: Existing ABG requirements are partial enabling authority. A new ABG assurance requirement family, or equivalent explicit acceptance criteria, is required before design and implementation can claim closure.
  - id: OD-003
    decision: Does the proposed assurance carrier remain fully contained by the existing GTL edge-traversal / GraphCall / Frame / Continuation product boundary?
    affected_invariant: Abiogenesis currently treats one GTL edge traversal as the bounded unit of probabilistic compute.
    closure_requirement: If yes, record the containment proof. If no, stop T-088 and open a product_reprice ticket before design work proceeds.
    audit_resolution: Contained, if `UnitOfCompute` remains shorthand/read-model over `GraphCall`, `Frame`, and `Continuation`. A new stable carrier or wider compute boundary requires explicit follow-on authority or product_reprice.
closure_law: This upstream spike closes only after a written audit note under `.ai-workspace/comments/codex/` maps every AmbiguityStatus row and every plugin authority boundary to exact existing or proposed requirement/design/proof authority. If any row is not already covered, follow-on design/proof and tenant implementation tickets must be created before closure. If the audit claims current ABG is already sufficient, the audit must name, row by row, the existing ABG requirement, design carrier, implementation surface, and proof surface that realizes each state; no row may close by generic no-gap assertion. This ticket cannot close by code implementation alone, by odd_sdlc tests passing, or by one tenant proving another tenant's work.
evaluation_criteria:
  - Boundary audit proves the assurance carrier is contained by the existing GTL edge-traversal / GraphCall / Frame / Continuation product boundary, or stops work for product_reprice.
  - Requirement audit table maps each AmbiguityStatus row against candidate REQ-R-ABG3-* and REQ-L-GTL3-* requirements with one of `covered`, `new AC needed`, or `new REQ needed`, plus exact requirement/design/proof refs for every `covered` cell.
  - Requirement audit includes at minimum INTERPRET, BINDING, RUN, GRAPHCALL, FRAME, CONTINUATION, EVENTS, PROJECTION, CONVERGENCE, CORRECTION, LINEAGE, POLICY, PROVENANCE, RETRY, TRANSPORT, WORKER, JOB-WORKER, and GTL hook/language/vector/function requirement families.
  - Follow-on design/proof tickets must satisfy the STDO core-interface migration protocol: inventory old and new producers, consumers, projections, reports, proof surfaces, and superseded closure paths before replacing runtime closure/projection/provider behavior.
  - T-086 dependency disposition is explicit: either T-086 is completed first, co-closed in the same requirement/design wave, or T-088 records why its audit can close without envelope topology closure.
  - Follow-on design ticket scopes the minimal ABG-owned carrier set for unit authority snapshot, input digest, admitted event facts, ambiguity row, ambiguity projection, closure decision, and stale-input invalidation.
  - Design explicitly separates ABG assurance mechanics from downstream gain-function correctness.
  - GTL impact review confirms GTL remains declarative: graph functions/vectors may declare assurance hook refs and opaque config, but GTL does not own event calculus or ambiguity semantics.
  - Follow-on design ticket scopes the B-016 IoC plugin extension without creating raw callback authority or plugin-owned closure.
  - Follow-on proof ticket scopes projection totality as an exhaustive row classifier with no nullable closure-register bypass.
  - Follow-on proof ticket scopes closure-fold negative proof for every non-fulfilled and non-lawfully-deferred row, including stale input, orphan evidence, authority missing, contradiction, partial evidence, missing evidence, and invalid event ledger.
  - Follow-on proof ticket scopes stale-input invalidation after prior closure.
  - Downstream odd_sdlc adapter work is separated into its own follow-on ticket after ABG authority is known.
  - Tenant lifecycle is explicit: upstream requirement/design closure does not claim Python or TypeScript tenant implementation closure, and tenant-local proof must land under tenant-suffixed follow-on tickets when implementation is needed.
proof_surface:
  - requirement audit note under `.ai-workspace/comments/codex/`
  - boundary audit note proving no product-level compute boundary expansion, or product_reprice ticket if expansion is required
  - audit matrix covering AmbiguityStatus row x candidate requirement with `covered`, `new AC needed`, or `new REQ needed`
  - core-interface migration inventory for follow-on design/proof tickets
  - T-086 dependency disposition note
  - recorded GTL assurance-hook decision
  - follow-on design ticket for total unit-of-compute assurance carriers and plugin seams
  - follow-on proof ticket for projection totality, stale-input invalidation, and premature-closure negative proofs
  - follow-on design/proof ticket scope includes a structural carrier diagram showing GTL declarations, ABG unit identity, event ledger, ambiguity projection, closure fold, plugin adapters, and downstream product adapters
  - follow-on design/proof ticket scope includes IACS review of candidate carriers and plugin extension points
  - follow-on proof ticket scope enumerates negative proof for `partial`: trace-only, planned, shallow, or unbound evidence does not close
  - follow-on proof ticket scope enumerates negative proof for `missing`: absent required evidence emits a missing row and blocks closure
  - follow-on proof ticket scope enumerates negative proof for `stale_input`: changed input digest beats prior fulfilled evidence
  - follow-on proof ticket scope enumerates negative proof for `authority_missing`: release-capable unit without authority blocks
  - follow-on proof ticket scope enumerates negative proof for `orphan_evidence`: evidence outside authority cannot satisfy authority
  - follow-on proof ticket scope enumerates negative proof for `contradictory_authority`: conflicting authority routes to reprice
  - follow-on proof ticket scope enumerates negative proof for `contradictory_evidence`: evidence contradicting authority cannot close
  - follow-on proof ticket scope enumerates negative proof for `deferred`: deferral closes only when explicitly admitted and release policy permits qualified closure
  - follow-on proof ticket scope enumerates negative proof for `event_ledger_invalid`: unreadable or inadmissible event truth blocks
  - follow-on proof ticket scope includes cross-row priority proof that `stale_input` beats `fulfilled`, contradiction beats partial evidence, and orphan evidence never closes
  - follow-on proof ticket scope includes negative proof that a plugin cannot close a unit, emit runtime truth, hide orphan evidence, or skip a missing authority row
  - downstream odd_sdlc adapter follow-on ticket if ABG audit confirms new substrate work
non_closure_conditions:
  - ticket closes because odd_sdlc local tests pass
  - ticket closes while expanding the product boundary beyond one GTL edge traversal without product_reprice
  - ticket closes before the boundary audit proves containment within GraphCall/Frame/Continuation truth
  - ticket closes before the widened candidate requirement set is audited
  - follow-on design/proof tickets do not include core-interface producer/consumer/projection/report/proof/supersession inventory
  - T-086 remains unresolved without explicit dependency disposition
  - ticket moves to active before GOALS.md is repriced or the goal is admitted to an active wave
  - ticket closes before the open GTL hook decision is recorded
  - ticket closes before the requirement audit matrix names every ambiguity row
  - ticket closes before required downstream design/proof/tenant tickets exist for any uncovered row
  - one build tenant's proof is used as another tenant's closure
  - ABG implements only an SDLC-specific requirement ledger
  - GTL gains a policy or ambiguity DSL instead of hook references plus opaque config
  - plugin output can directly close a unit of compute or append authoritative runtime events
  - closure can still be inferred from worker success, test success, archive reports, or nullable register absence
  - changed inputs do not invalidate prior closure projections
  - orphan evidence or trace-only evidence can satisfy authority by default
---

# T-088: ABG Total Unit-Of-Compute Assurance

## Problem

The data_mapper forensic comparison exposed a substrate-level closure defect.

`test57.fp.cx` proved that the modern TypeScript traversal loop can converge and
retry cleanly. It did not prove test35-class product closure because the release
claim was not derived from a total lineage/evidence/gap projection. The system
could accept traversal success while lifecycle ambiguity remained undercounted.

That is premature closure.

The issue is not unique to SDLC. Any bounded unit of compute can produce an
output whose boundary is under-accounted:

```text
U: input authority + input state -> output state + admitted events
```

ABG needs a generic assurance law for that boundary.

This does not widen the product boundary. In this ticket, "unit of compute"
means an invocation-local assurance carrier contained by the existing GTL edge
traversal and ABG runtime aggregate family: `GraphCall`, `Frame`, and
`Continuation`. If the audit finds that assurance must govern a new product
boundary outside edge traversal, this ticket must stop and a `product_reprice`
ticket must be opened first.

## Core Design Claim

For every governed unit of compute:

```text
assure(U) = fold(project_ambiguity(A_U, E_U))
```

Where:

- `A_U` is the current authority/input snapshot for the unit
- `E_U` is the admitted event ledger for the unit
- `project_ambiguity` is total
- `fold` returns exactly one lawful decision: close, retry, reprice, block, or
  qualified defer

No unit may close from worker success, test success, local archive shape,
controller-local memory, prompt-side self-assessment, or absence of a closure
register.

## Ticket Scope After STDO Review

This is an upstream spike for requirement audit and lawful sequencing.

It is not the design implementation ticket. It is not a Python tenant ticket.
It is not a TypeScript tenant ticket. It must not close by implementing one
tenant or by pointing to downstream `odd_sdlc` proof.

The closure question for this ticket is:

```text
Does ABG already have sufficient constitutional authority for total
unit-of-compute assurance, or does the requirement layer need new acceptance
criteria before design and tenant implementation proceed?
```

The answer must be written as an audit table, not asserted verbally.

It must also answer the product-boundary question:

```text
Is total assurance a contained runtime carrier under the existing edge
traversal boundary, or does it define a new product-level compute boundary?
```

Only the first answer can proceed under `requirement_reprice`.

## Requirement Audit Deliverable

The audit note must include this matrix. Each row must be audited against the
full audit set listed below, not only against the example requirement families
that seem most relevant to that row.

| Ambiguity status | Requirement audit set | Decision | Required follow-up |
|---|---|---|---|
| `fulfilled` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `partial` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `missing` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `stale_input` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `authority_missing` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `orphan_evidence` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `contradictory_authority` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `contradictory_evidence` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `deferred` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |
| `event_ledger_invalid` | full audit set | `covered` / `new AC needed` / `new REQ needed` | requirement/design/proof refs or follow-on ticket |

Every `covered` cell must name the existing requirement, design carrier,
implementation surface, and proof surface. Every non-covered cell must name the
required follow-on requirement/design/proof work. No ambiguity status may be
closed by a general claim that ABG is already sufficient.

The audit scope must include the full runtime boundary touched by the ticket:

- `REQ-R-ABG3-INTERPRET`
- `REQ-R-ABG3-BINDING`
- `REQ-R-ABG3-RUN`
- `REQ-R-ABG3-GRAPHCALL`
- `REQ-R-ABG3-FRAME`
- `REQ-R-ABG3-CONTINUATION`
- `REQ-R-ABG3-EVENTS`
- `REQ-R-ABG3-PROJECTION`
- `REQ-R-ABG3-CONVERGENCE`
- `REQ-R-ABG3-CORRECTION`
- `REQ-R-ABG3-LINEAGE`
- `REQ-R-ABG3-POLICY`
- `REQ-R-ABG3-PROVENANCE`
- `REQ-R-ABG3-RETRY`
- `REQ-R-ABG3-TRANSPORT`
- `REQ-R-ABG3-WORKER`
- `REQ-R-ABG3-JOB-WORKER`
- GTL hook, language, graph-function, and graph-vector requirement families

## Ledger Algebra

The target model uses a small ledger set:

| Ledger | Owner | Meaning |
|---|---|---|
| Authority ledger `A` | GTL declaration plus domain adapter | What this unit is allowed and required to transform. |
| Event ledger `E` | ABG | Append-only admitted facts for the unit. |
| Evidence ledger `V` | ABG projection with plugin/domain classifiers | What evidence exists for each authority obligation. |
| Gap ledger `G` | ABG projection | Missing, partial, shallow, stale, orphan, contradictory, or deferred states. |
| Closure ledger `C` | ABG projection/fold | The lawful close/retry/reprice/block decision. |

All reports, dashboards, release surfaces, and closure registers are read
models over these ledgers. They are not independent truth stores.

## Total Ambiguity Projection

The projection must emit one row for every relevant state. It must never skip a
dimension or treat unknown as success.

Required row states:

| State | Meaning | Default decision |
|---|---|---|
| `fulfilled` | Current evidence is bound to current authority and satisfies required proof shape. | close candidate |
| `partial` | Evidence exists but is trace-only, planned, shallow, or unbound to required proof shape. | retry |
| `missing` | Required evidence is absent. | retry |
| `stale_input` | Current authority/input digest differs from the digest closed against. | block/replay |
| `authority_missing` | The unit is release-capable but lacks current authority. | block |
| `orphan_evidence` | Evidence exists without matching current authority. | block/repair |
| `contradictory_authority` | Authority conflicts with itself. | reprice |
| `contradictory_evidence` | Evidence conflicts with authority. | reprice or repair |
| `deferred` | Deferral is explicitly admitted and release policy allows it. | qualified defer |
| `event_ledger_invalid` | Events are unreadable or inadmissible. | operator block |

Closure is legal only when every row is `fulfilled` or release-lawfully
`deferred`.

## Input-Change Invalidation

Closure is a projection cache, not a permanent mutation.

If input authority changes after closure:

```text
if digest(A_current) != digest(A_closed_against):
    C := unavailable(stale_input)
    G := project_open_gaps(A_current, E_current)
```

The event log remains intact. The prior closure is shadowed by the current
projection and must be re-proved or reopened. This generalizes the Python
requirement-closure behavior where stale published analysis makes the closure
read model unavailable until rebuilt.

## ABG / GTL / Domain Ownership

| Layer | Owns |
|---|---|
| GTL | Declares graph functions, vectors, contracts, hook attachment points, hook refs, and opaque config. |
| ABG | Unit identity, input digest binding, event admission, replay, total ambiguity projection shape, stale-input invalidation, closure/retry/reprice/block fold, and runtime enforcement. |
| IoC plugins | Provide effect execution, authority snapshots, evidence adapters, classifier functions, and policy providers behind typed contracts. |
| downstream product | Domain gain functions, evidence semantics, product capability profiles, and domain release interpretation. |

ABG guarantees no declared ambiguity is lost or prematurely closed.

ABG does not guarantee that a downstream product declared the right gain
function. A bad SDLC requirement decomposition or weak release profile remains
an `odd_sdlc` / methodology / domain-adapter defect.

## GTL Impact

GTL impact should be limited and declarative.

No GTL event calculus or ambiguity DSL is required.

GTL must expose enough hook declaration surface that an LLM-authored graph
function can specify the full graph-function boundary through GTL itself rather
than through side-door runtime configuration. The hook semantics remain opaque
and ABG-resolved, but the hook references and boundary intent must be visible in
the graph-function/vector declaration.

GTL may need an explicit assurance hook concern, or a clarification that the
existing closure/proof hook concerns cover total assurance:

```text
GraphFunction.declarations:
  hook_ref: assurance.total_projection
  config: opaque

GraphVector.declarations:
  closure_contract: total_ambiguity_projection
  proof_policy_ref: domain-owned
```

The GTL language remains engine-agnostic. It declares the boundary and hook
references. ABG interprets and enforces the assurance law.

The target GTL rule is:

```text
An LLM constructing a graph function shall be able to declare the graph
function's assurance, closure, proof, dispatch, evaluation, and escalation hook
refs inside GTL declarations. ABG may resolve those refs through IoC providers,
but runtime side doors must not be required to complete the graph-function
contract.
```

This keeps GTL as the authored program surface. It does not make GTL the
semantic owner of assurance status, evidence classification, event admission,
or closure folding.

## Open GTL Decision

This is a major ambiguity and must be decided before this ticket closes:

```text
Does GTL need an explicit assurance hook concern, or do the existing
deterministic-proof and closure hook concerns already cover total
unit-of-compute assurance?
```

The decision must record:

- affected GTL invariant
- affected GTL requirement refs
- whether requirement text changes
- why the chosen option keeps GTL declarative and engine-agnostic
- whether the resulting hook surface is expressive enough for LLM-authored
  graph functions to declare the full graph-function boundary without side-door
  runtime config

## IoC Plugin Extension

This ticket extends the B-016 plugin model.

Candidate plugin/provider contracts:

| Contract | Purpose | Authority limit |
|---|---|---|
| `AuthoritySnapshotProvider` | Produces current authority/input snapshot and digest for a unit. | Cannot close the unit. |
| `EvidenceAdapter` | Maps event facts and artifacts into evidence candidates. | Cannot admit events directly. |
| `AmbiguityClassifier` | Classifies evidence against authority using domain semantics. | Returns candidate row classification only. |
| `ClosurePolicyProvider` | Supplies release/defer policy for row folding. | Cannot override stale, invalid, orphan, or missing authority states. |
| `GainFunctionAdapter` | Maps method/domain gain outputs into authority obligations and evidence expectations. | Bad gain function remains domain/method responsibility. |

The runner consumes plugin output through admitted carrier types. Plugins cannot
emit runtime events, choose next vectors, or close a unit. ABG owns the fold.

`UnitOfCompute` is not introduced here as a new public aggregate or runtime
carrier. It is diagram shorthand for the assurance scope over existing ABG
runtime truth: `GraphCall`, `Frame`, and `Continuation`. If follow-on design
wants `UnitOfCompute` as a stable named carrier, that requires explicit
requirement/design authority before implementation.

## Target Topology

```mermaid
flowchart TB
  GTL["GTL graph/vector declarations"]
  Domain["domain or method adapter"]
  Authority["AuthoritySnapshotProvider"]
  Unit["ABG assurance scope over GraphCall / Frame / Continuation"]
  Effect["effect plugin / worker / tool"]
  Events["ABG event ledger"]
  Evidence["EvidenceAdapter"]
  Classifier["AmbiguityClassifier"]
  Projection["Total ambiguity projection"]
  Fold["ABG closure fold"]
  Close["closure_admitted"]
  Gap["gap_or_repair_required"]
  Reprice["reprice_required"]
  Block["operator_blocked"]

  GTL --> Unit
  Domain --> Authority --> Unit
  Unit --> Effect
  Effect --> Unit
  Unit --> Events
  Events --> Evidence --> Classifier --> Projection --> Fold
  Fold -->|fulfilled or lawfully deferred| Close
  Fold -->|partial missing orphan stale| Gap
  Fold -->|contradiction or bad authority| Reprice
  Fold -->|invalid event or missing authority| Block
```

## Core-Interface Migration Requirement

Any follow-on design or proof ticket must treat this as a core-interface
migration if it changes runtime closure, event/projection semantics,
identity/binding, provider/resolver behavior, or plugin contracts.

The follow-on work must inventory:

- old and new producers
- old and new consumers
- runtime projections
- reports and dashboards
- proof surfaces
- superseded closure paths
- compatibility or adapter boundaries
- negative proof that superseded closure paths cannot still close work

No follow-on implementation ticket may close by adding a new projection while
leaving an older closure path authoritative.

## Interaction With T-086

T-086 defines or proves the generic traversal envelope:

```text
current projection
+ cumulative context
+ obligation pressure
+ prior gaps
+ output/result coverage
-> retry | reprice | close | continue
```

T-088 adds the assurance law that decides whether that envelope can close.

If T-086 is the topology of the traversal envelope, T-088 is the total closure
calculus over the envelope.

T-088 cannot claim final design closure while T-086 remains unresolved unless
the audit explicitly records why the assurance requirement can close without
settling the traversal-envelope topology. The default expected path is that
T-086 completes first or co-closes in the same requirement/design wave.

## Downstream odd_sdlc Adapter

`odd_sdlc` should become the first consumer.

It maps:

| odd_sdlc surface | Generic ABG role |
|---|---|
| goals, intent, product, requirements, design carriers | authority snapshot |
| F_P worker handoff manifest | unit input state |
| worker report and materialized artifacts | event/evidence candidates |
| code/test trace bindings | evidence rows |
| test execution reports | runtime evidence rows |
| gap analysis | gap facts |
| release fulfillment ledger | closure projection |

The SDLC adapter owns gain quality:

- intent to requirements
- requirements to design
- design to code/test obligations
- code/test evidence policy
- product quality profile

ABG owns whether those declared obligations are totally projected and not
prematurely closed.

## Tenant Boundary

This ticket is upstream-only.

If the audit finds implementation work, the tenant implementation and proof
must split into tenant-local follow-on tickets. Python and TypeScript may share
the same requirement/design authority, but they do not share closure proof.

At minimum, the follow-on set must distinguish:

- ABG shared design/IACS for total assurance carriers and plugin seams
- projection-totality proof work
- Python tenant implementation/proof if Python changes are required
- TypeScript tenant implementation/proof if TypeScript changes are required

One tenant proving stale-input invalidation or total projection does not close
the other tenant.

## Expected Work Order

1. Audit active ABG/GTL requirements and decide whether T-088 needs new
   requirement text or only design under existing event/projection/convergence
   law. The output is the audit matrix above.
2. Reconcile T-086, B-016, T-087, B-013, B-014, and T-084 so total assurance
   does not create a rival mechanism.
3. Decide the GTL assurance-hook ambiguity and record rationale.
4. Create follow-on design/proof tickets for ABG total assurance.
5. Create tenant-suffixed implementation/proof tickets if the audit finds
   Python or TypeScript changes.
6. Create odd_sdlc follow-on adapter ticket after the ABG authority boundary is
   known.

## Closure Evidence

Closed at: 2026-04-29T07:50:10Z

Audit surfaces:

- `.ai-workspace/comments/codex/20260429T172415AEST_T088_requirement_audit.md`
- `.ai-workspace/comments/codex/20260429T175010AEST_T089_requirement_closure.md`

Requirement authority:

- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`

Follow-on tickets:

- `T-090`
- `T-091`
- `T-092-PY`
- `T-092-TS`

T-088 closes only the upstream audit and sequencing spike. Design, proof, and
tenant implementation remain open.
