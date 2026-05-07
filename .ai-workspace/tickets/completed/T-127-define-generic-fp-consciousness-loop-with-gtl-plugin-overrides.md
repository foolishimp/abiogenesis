---
id: T-127
title: Define generic F_P consciousness loop with GTL plugin overrides
type: feature
ticket_category: implementation_migration
status: completed
review_status: completed_with_t127_live_scenario_and_semantic_proof
goal: generic-homeostatic-fp-construction-evaluator
change_intent: Ratify and realize a generic tail-recursive F_P construction evaluator over linked asset state, where GTL declarations may override observer, admissibility, value, progress, and escalation policy while ABG preserves runtime admission, traversal, event, ledger, projection, and lineage truth.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/
  - specification/requirements/abg/
  - specification/requirements/product/
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/
  - build_tenants/abiogenesis/typescript/test_env/
priority: critical
build_tenant: typescript
release_scope: 3.7.0-rc.1 substrate release candidate
triaged_at: 2026-05-07T20:25:21+10:00
created_at: 2026-05-07T20:25:21+10:00
activated_at: 2026-05-07T20:30:27+10:00
updated_at: 2026-05-08T02:00:57+10:00
closed_at: 2026-05-08T01:28:44+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
related_strategy:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260507T100305Z_STRATEGY_fp_consciousness_loop.md
related_tickets:
  - .ai-workspace/tickets/completed/T-100-define-abg-zoomed-workspace-asset-obligation-schedule-and-foldback-evaluation.md
  - .ai-workspace/tickets/completed/T-103-define-abg-graph-span-foldback-and-reentry-frontier.md
  - .ai-workspace/tickets/completed/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md
  - .ai-workspace/tickets/completed/T-107-define-abg-traversal-modulation-profiles-for-agentic-fp-attempts.md
  - .ai-workspace/tickets/completed/T-116-enable-gtl-plugin-traversal-observer-bindings-for-transform-and-eval.md
  - .ai-workspace/tickets/backlog/T-118-complete-abg-defaults-bundle-expansion-after-plugin-observer-slice.md
  - .ai-workspace/tickets/backlog/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
source_review:
  - STDO review performed from the strategy post, Abiogenesis INTENT/PRODUCT, LLM GTL App Builder Guide, local ticket README, and shared SPEC/TICKET/ODD method surfaces.
requirement_refs:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/gtl/REQ-L-GTL3-ATTRS.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-JOB.md
  - specification/requirements/gtl/REQ-L-GTL3-MODULE.md
design_refs:
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_FIRST_SLICE_IACS.md
current_evidence:
  - requirement_reprice applied through PRODUCT.md and REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - GTL hook surface reconciled through REQ-L-GTL3-HOOKS.md, REQ-L-GTL3-ATTRS.md, REQ-L-GTL3-JOB.md, and REQ-L-GTL3-MODULE.md
  - detailed design names construction observation, observation-to-action binding, priority scheme, affect policy, ABG-derived affect adjustment, action catalog, ranked candidate, admitted intent, graph invocation, progress ledger, projection, EC axiom, and derived-fluent rule surfaces
  - requirement/design now define public gaps as a read-only evaluator view over typed asset construction-observation truth that derives candidate completion/induction actions and ranking reasons without appending events, admitting intent, dispatching graph work, or owning a retry loop
  - requirement/design now define bootstrap as the first construction episode over sparse replay state; asset induction must enter as a published graph function/action catalog row admitted by ABG
  - structural carrier diagram now includes Mermaid classDiagram with prime, subordinate, effect-edge, downstream, deferred, authoritative, and public/private visibility roles
  - Event Calculus contract separates primary construction events from derived progress, stagnation, terminal, and public projection truth
  - first TypeScript slice implemented in build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/fp_consciousness.ts
  - first slice covers pure construction observation, action catalog, observation-to-action binding, configured priority ranking, affect policy/ABG-derived affect adjustment, candidate admission, progress ledger, public projection, summary agreement, and hook declaration precedence/fallback
  - npm run test:t127 passed 15/15 on 2026-05-07
  - npm run test:semantic passed 458/458 on 2026-05-07
  - review hardening applied for policy-ranked admitted intent selection, selected terminal route parity, exact public summary trace parity, affect boost/attenuation, overlapping terminal policies, unordered candidate admissions, explicit recursion metadata, and canonical progress ledger ordering
  - construction runtime event family admitted through RuntimeEvent carriers and event_admission.ts for episode start, observation snapshot materialization, action catalog projection, evaluator invocation, candidate return/admission/rejection, intent selection, graph-action invocation, and delta observation
  - construction Event Calculus effects declared for event kinds that initiate or terminate runtime fluent truth; observation/catalog events remain replay-aid events with empty effects
  - CONSTRUCTION_PROGRESS_DERIVED_FLUENT_RULE now derives construction progress fluent truth only from material delta events; same-blocker/same-digest delta events remain observable deltas but do not become positive progress fluents
  - construction replay now rejects causally orphaned delta events before EC projection or progress-ledger derivation; a delta must follow an admitted candidate, selected intent, and in-flight graph-action invocation
  - closed construction delta truth now terminates construction_episode_open and initiates construction_episode_closed in EC replay
  - npm run test:t127 passed 18/18 on 2026-05-07
  - npm run test:semantic passed 461/461 on 2026-05-07
  - review hardening applied for stagnant delta non-progress, orphan delta rejection, and closed-episode EC termination
  - npm run test:t127 passed 20/20 on 2026-05-07
  - npm run test:semantic passed 463/463 on 2026-05-07
  - live GTL carrier integration added for T-127 hook precedence: Job and Module now expose policyHooks alongside Role.policyHooks, GraphFunction.declarations, and GraphVector.declarations; M02 serialization/replay preserves the fields as carrier truth
  - abg.fp_consciousness hook resolution now consumes live GTL carrier surfaces through one resolver path: GraphVector > GraphFunction > Job > Role > Module > visible fallback
  - T-127 hook resolver tests cover live GTL precedence, Job-over-Role precedence, Module fallback, duplicate hook declarations, malformed present hook attrs, and visible fallback
  - M02 publication tests now prove Job.policyHooks and Module.policyHooks survive module admission, serialization, and replay
  - npm run test:t127 passed 21/21 on 2026-05-07
  - npm run test:t010 passed 5/5 on 2026-05-07
  - npm run test:semantic passed 464/464 on 2026-05-07
  - 2026-05-08 review finding accepted: read-only public gaps must not carry a second ranking law; one source of truth means M04 gaps renders the T-127 construction evaluator projection instead of deriving local priority
  - M04 gaps now adapts replay-derived runtime state into T-127 construction observation, action catalog, observation-to-action binding, and ConstructionPriorityProjection carriers, then renders typed asset gap rows from that projection without admitting intent, appending events, dispatching graph work, or owning retry; the public read-only evaluatorRef points at the ConstructionPriorityProjection ref
  - M04 no longer uses the former local statusPriorityRank / lexical gap sorter, and no longer emits public-gaps-action/public-gaps-action-catalog refs as the ranking authority; public read-only recommendation refs come from the construction action catalog and construction priority projection
  - existing M04 gaps surface now renders typed asset gap rows and a top-level read-only evaluator preview over current replay truth; it did not create a parallel public_gaps surface
  - npm run test:t058 passed 5/5 on 2026-05-08
  - node --test test_env/tests/test_m04_public_gaps_projection_integration.test.mjs passed 3/3 on 2026-05-08, including a regression where declared ConstructionPriorityScheme ranks a lexically later release-blocking asset above an earlier job/asset
  - 2026-05-08 T127-REVIEW-001 through T127-REVIEW-008 implementation fixes applied: installed CLI gaps now admits constructionPriorityScheme and constructionAffectPolicies from runtime binding; public gaps resolves per-action abg.fp_consciousness hook precedence across GraphVector, GraphFunction, Job, Role, Module, and visible installed fallback/config; ineligible highest-priority actions are withheld from public bestActionRef while blockers remain visible; ConstructionPriorityProjection identity includes priority scheme/policy digest; M04 design/IACS names the T-127 carrier chain; public gaps action refs are derived by a shared M03 construction action-ref helper; typed gap binding rejects non-providing actions and unpublished internal traversal authority.
  - npm run build:semantic passed on 2026-05-08 after T127-REVIEW implementation fixes
  - node --test test_env/tests/test_t127_fp_consciousness_loop_unit.test.mjs test_env/tests/test_m04_public_gaps_projection_integration.test.mjs passed 30/30 on 2026-05-08
  - npm run test:t127 passed 23/23 on 2026-05-08
  - npm run test:t058 passed 9/9 on 2026-05-08
  - npm run test:semantic passed 471/471 on 2026-05-08
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live passed 1/1 on 2026-05-08
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live:uat passed 2/2 on 2026-05-08
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live passed 1/1 on 2026-05-08
  - 2026-05-08 deep T-127 scenario ladder added under test_env/sandbox and test_env/live, covering configured priority, GTL hook-derived priority, missing typed input/admission blockers, bootstrap typed-asset induction, and recursive construction replay over progress then stagnation
  - npm run test:t127:sandbox passed 5/5 on 2026-05-08
  - npm run test:t127:live passed 5/5 on 2026-05-08
  - npm run test:t127 passed 28/28 on 2026-05-08
  - npm run test:t058 passed 9/9 on 2026-05-08 after linked-asset availability derivation changed from current-vector sources to initial inputs plus closed-vector outputs
  - npm run test:semantic passed 471/471 on 2026-05-08
  - git diff --check passed on 2026-05-08
  - terminal construction disposition runtime event support added for construction_review_required, fh_input_required, construction_escalated, ticket_created, reprice_required, construction_blocked, and construction_closed; EC replay now projects those public states and closes construction_episode_open when construction_closed is admitted
  - constructConstructionGraphActionInvokedEvent added as the shared runtime-entry constructor from AdmittedConstructionIntent to ConstructionGraphActionInvokedEvent, so graph action invocation cannot be built from terminal/non-invokable candidates or test-local prose
  - T-127 downstream-style design-depth repair scenario added to prove progressive repair projects typed construction progress/stall rather than untyped retry_same_edge or process_timeout
  - npm run test:t127:sandbox passed 6/6 on 2026-05-08
  - npm run test:t127:live passed 6/6 on 2026-05-08
  - npm run test:t127 passed 32/32 on 2026-05-08
  - npm run test:t058 passed 9/9 on 2026-05-08
  - npm run test:semantic passed 474/474 on 2026-05-08
  - git diff --check passed on 2026-05-08
  - 2026-05-08 T127-REVIEW-010 through T127-REVIEW-016 consistency fixes applied: terminal disposition causality now has selected-action contradiction proof; public gaps basis scoping rejects legacy assessed events without basisId instead of matching by run/work/edge; M03 owns construction observation asset refs from passed-input and replay-linked truth; M03 owns hook-config-to-priority policy derivation; installed CLI ingress admits construction priority and affect policy carriers fail-closed; M03/M04 design bookkeeping now names the single M03 construction carrier module and read-only M04 adapter boundary.
  - npm run test:t058 passed 11/11 on 2026-05-08 after removing basisless assessed-event fallback and adding installed CLI malformed-priority ingress proof
  - npm run test:t127 passed 32/32 on 2026-05-08 after terminal disposition selected-action contradiction proof
  - npm run test:t127:live passed 6/6 on 2026-05-08
  - npm run test:semantic passed 476/476 on 2026-05-08
  - git diff --check passed on 2026-05-08 after T127-REVIEW-010 through T127-REVIEW-016
  - 2026-05-08 T127-REVIEW-017 through T127-REVIEW-021 closure-coherence fixes applied: stale provisional ticket claims removed; T-127 closure narrowed to the first-slice construction substrate rather than installed runner recursion; T-128 opened for runner-level consumption of AdmittedConstructionIntent; construction observation root derivation now includes declared graph input roots, falling back to source nodes with no incoming target when graph input truth is absent, not only vector 0 sources; M04 direct API fallback is named as visible source-default fallback when no installed bundle is present; M03 design Event Calculus section includes terminal disposition events and implemented RuntimeDerivedFluentRule status.
  - npm run test:t127 passed 33/33 on 2026-05-08 after adding the independent graph-root asset regression
  - npm run test:t058 passed 11/11 on 2026-05-08
  - npm run test:t127:live passed 6/6 on 2026-05-08
  - npm run test:semantic passed 477/477 on 2026-05-08
  - git diff --check passed on 2026-05-08 after closure-coherence fixes
review_findings:
  - id: T127-REVIEW-001
    severity: high
    finding: Configured construction priority is not live through the installed CLI gaps path. The direct M04 test injects constructionPriorityScheme into publicGaps, but the installed runtime binding and startContext path do not admit or carry that field, so installed gen-gaps still uses the empty fallback scheme unless called by direct API.
    required_fix: Admit declared GTL/product priority policy into the installed/runtime binding or derive it from live GTL hook/policy surfaces, then add an installed CLI regression proving declared priority changes public gaps ranking.
    implementation_status: completed
  - id: T127-REVIEW-002
    severity: high
    finding: M04 public gaps does not yet consume the full GTL hook precedence surface. The read-only gaps adapter resolves abg.fp_consciousness with Module plus fallback only, while the T-127 resolver supports GraphVector, GraphFunction, Job, Role, Module, and visible installed fallback.
    required_fix: Build public gaps construction subjects with the implicated GraphVector, GraphFunction, Job, Role, and Module hook inputs, and add tests proving vector/job/function-level overrides are reflected in public gaps ranking.
    implementation_status: completed
  - id: T127-REVIEW-003
    severity: high
    finding: Ineligible action rows can still become the top public recommendation without top-level blocker context. Failed leaf task evidence is copied to action ineligibleReasonRefs, but ConstructionPriorityProjection ranks all binding rows and readOnlyEvaluator.bestActionRef exposes row zero.
    required_fix: Either exclude ineligible bindings from top-level bestActionRef or project the top-level recommendation as blocked with admissionBlockerRefs; add a negative test where the highest ranked action is ineligible.
    implementation_status: completed
  - id: T127-REVIEW-004
    severity: medium-high
    finding: M04 design assets are not reconciled to the implemented T-127 carrier chain. Current M04 IACS still describes the older runtime aggregate / advancement transition computation and generic read-only evaluator recommendation, not ConstructionObservationSnapshot -> ConstructionActionCatalogProjection -> ObservationToActionBindingProjection -> ConstructionPriorityProjection.
    required_fix: Update M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md and M04_PUBLIC_GAPS_PROJECTION_FIRST_SLICE_IACS.md so the module boundary names the T-127 carrier chain and its non-authority/read-only law.
    implementation_status: completed
  - id: T127-REVIEW-005
    severity: medium
    finding: Priority projection identity is not policy-distinct. M04 exposes readOnlyEvaluator.evaluatorRef as the ConstructionPriorityProjection ref, but that ref is currently episodeId plus observationId; M04 observation id is based on module/run/work/event count rather than priority scheme or policy digest.
    required_fix: Include prioritySchemeRef or a scheme/config digest in projection identity or in public source refs strongly enough that two different ranking policies cannot share the same evaluator ref.
    implementation_status: completed
  - id: T127-REVIEW-006
    severity: medium
    finding: Negative proof remains thin around lawful action binding. The positive regression proves declared ranking can change order, but the required tests for non-providing actions and missing published graph/action authority are still open.
    required_fix: Add negative tests for actions that do not provide or induce the missing typed asset and for actions lacking published traversal authority; public gaps must report typed blocks rather than selected actions.
    implementation_status: completed
  - id: T127-REVIEW-007
    severity: medium
    finding: Public gaps fallback hook is code-local rather than the resolved installed fallback/config bundle used by runtime construction selection.
    required_fix: Consume the same visible installed fallback/config truth as the construction runtime, or explicitly carry the fallback ref/digest through the public gaps source refs.
    implementation_status: completed
  - id: T127-REVIEW-008
    severity: medium
    finding: M04 derives construction action identity locally as a convention. The identity is no longer public-gaps-action, but the runtime construction entry point does not yet emit or consume the same catalog rows, so gaps and execution can drift by convention.
    required_fix: Share action catalog derivation with the runtime construction entry point or derive both from one admitted catalog surface.
    implementation_status: completed
  - id: T127-REVIEW-009
    severity: release-hygiene
    finding: Core T-127 artifacts are still untracked in the worktree, including the active ticket, new requirement, M03 fp_consciousness.ts, M03 design docs, and T-127 unit test.
    required_fix: Before check-in or RC, intentionally stage/commit the T-127 artifacts or split them into reviewable commits; do not leave closure evidence in untracked files.
    implementation_status: closure_artifacts_intentionally_included_in_t127_change_set
  - id: T127-REVIEW-010
    severity: high
    finding: Runtime-entry closeability must be proved by an ABG-owned construction-intent path, not by public gaps or harness-local loops.
    required_fix: Keep public gaps read-only, derive graph-action invocation from AdmittedConstructionIntent through the shared M03 constructor, and cover bootstrap/downstream scenarios with admitted construction runtime events.
    implementation_status: completed
  - id: T127-REVIEW-011
    severity: high
    finding: Terminal construction disposition events require the same causal validation as evaluator, intent, graph-action, and delta events.
    required_fix: Validate terminal events against prior episode start, selected intent, and selected action parity; add fail-closed tests for orphan, missing-intent, and selected-action contradiction cases.
    implementation_status: completed
  - id: T127-REVIEW-012
    severity: high
    finding: M04 public gaps reconstructed available asset truth locally from first-vector source plus closed targets.
    required_fix: Move construction observation asset-ref derivation behind the M03 construction surface and have M04 consume linkedAssetRefs and passedInputRefs as adapter output.
    implementation_status: completed
  - id: T127-REVIEW-013
    severity: medium-high
    finding: Priority hook config parsing lived in M04, making read-only gaps a second ranking/policy semantic surface.
    required_fix: Move abg.fp_consciousness hook-config-to-ConstructionPriorityScheme derivation into M03 and have M04 call that helper.
    implementation_status: completed
  - id: T127-REVIEW-014
    severity: medium-high
    finding: Installed CLI ingress cast constructionPriorityScheme and constructionAffectPolicies instead of admitting them as carrier truth.
    required_fix: Add M03 admission helpers for configured priority and affect policy carriers; make CLI ingress fail closed on malformed present fields; add installed CLI negative proof.
    implementation_status: completed
  - id: T127-REVIEW-015
    severity: medium
    finding: M03 first-slice IACS code ownership plan still described split files that do not match the intentionally single-surface fp_consciousness.ts implementation.
    required_fix: Reconcile IACS to the implemented single pure M03 construction carrier module with real effect/admission/projection boundaries named separately.
    implementation_status: completed
  - id: T127-REVIEW-016
    severity: medium
    finding: Public gaps matched assessed events without basisId by runId, workKey, and edge, allowing same-edge evidence to cross-contaminate bases.
    required_fix: Remove the legacy assessed-event fallback and require admitted basis identity for public gaps event scoping; add a regression proving basisless assessed events do not satisfy gap truth.
    implementation_status: completed
  - id: T127-REVIEW-017
    severity: high
    finding: Completed ticket body still carried stale provisional truth saying the design was implementation-incomplete/proof-incomplete and runtime entry, bootstrap execution, terminal parity, and downstream proof remained open.
    required_fix: Reconcile body text to current completed first-slice truth and move remaining runner-level execution work to a child ticket.
    implementation_status: completed
  - id: T127-REVIEW-018
    severity: high
    finding: Runtime-entry closure was overstated as runner-level recursion; current implementation is an admitted-intent-to-graph-action event substrate plus scenario proof, not an installed ABG runner that consumes AdmittedConstructionIntent and performs the loop.
    required_fix: Narrow T-127 closure law to substrate/runtime-event entry truth and open T-128 for installed runner-level consumption.
    implementation_status: completed_with_child_ticket
  - id: T127-REVIEW-019
    severity: medium-high
    finding: Observation asset refs used only the first vector's source nodes plus closed targets, which can falsely mark independent later root inputs as missing.
    required_fix: Derive root input refs from declared graph inputs, falling back to source nodes with no incoming target when graph input truth is absent; add a regression for independent root vectors.
    implementation_status: completed
  - id: T127-REVIEW-020
    severity: medium
    finding: Public gaps direct API used a code-local fallback when no installed fallback bundle exists, while ticket/design wording only named installed fallback/config.
    required_fix: Make the direct API fallback visibly source-default and document that installed fallback/config wins when present.
    implementation_status: completed
  - id: T127-REVIEW-021
    severity: medium
    finding: M03 design Event Calculus section omitted construction_terminal_disposition_projected and still described derived fluent rules as future implementation.
    required_fix: Reconcile design to current terminal event support and implemented RuntimeDerivedFluentRule/ConstructionProgressLedger projection status.
    implementation_status: completed
resolved_blocks:
  - substrate runtime entry event constructor from admitted construction intent to construction_graph_action_invoked event
  - terminal construction event/projection parity for review, F_H input, escalation, ticket/reprice, block, and closure
  - bootstrap substrate proof showing asset induction through published graph/action authority and admitted construction intent
  - public construction projection adapter wiring through read-only M04 gaps view, with no adapter-owned loop
  - shared construction action catalog/admitted-intent path consumed by public gaps and runtime invocation event construction
  - downstream-style progressive design-depth repair proof lane
child_ticket_candidates:
  - .ai-workspace/tickets/backlog/T-128-realize-fp-consciousness-runner-over-admitted-construction-intent.md
intake_source: Design discussion on 2026-05-07 after odd_sdlc T-109 live proof showed incremental F_P repair progress collapsing into repeated same-edge retry and harness timeout rather than a typed homeostatic construction-progress projection.
target_truth: ABG provides the first-slice generic, event-sourced F_P construction substrate over observed linked asset state. The substrate observes runtime truth, loads a graph/action catalog, ranks admissible outcomes, admits an F_P construction intent, constructs replay-visible graph-action invocation events from that admitted intent, records asset/runtime deltas, and projects progress, closure, block, or escalation truth. Public gaps is a read-only construction preview over incomplete typed assets, blocking obligations, lawful completion or induction actions, and ranking reasons; it cannot mutate runtime truth or dispatch work. Bootstrap enters the same substrate law from sparse replay state, where asset induction may rank highest but must still be a published graph function/action row admitted by ABG. GTL declarations and product plugins may override observation, admissibility, value, progress, and escalation policy; ABG owns carrier admission, invocation event construction, runtime events, ledgers, replay, projection, and lineage. Installed runner-level recursion that consumes AdmittedConstructionIntent and performs graph work is deferred to T-128.
superseded_truth: Open gaps collapse into next-edge or same-edge retry, product/harness code drives iteration, or prompt prose acts as the hidden evaluator for which graph function should be invoked next.
closure_law: Closed as the first-slice construction substrate because the requirement/design/code/test surfaces establish the lawful ABG-supported construction episode carriers, GTL plugin override points, admitted construction-intent and progress carriers, replay-visible events/projections, read-only gaps projection, bootstrap asset-induction admission, deterministic contract tests, and downstream-style proof showing incremental repair progress does not collapse into untyped same-edge retry or harness-owned control. This closure does not claim an installed ABG runner loop consumes AdmittedConstructionIntent and performs recursive graph work; that execution-path realization is tracked by T-128.
non_closure_conditions:
  - the strategy remains commentary only and no requirement/design authority names the generic loop
  - implementation creates a CLI, harness, or downstream-local iterator as the control authority
  - ABG decides product construction strategy instead of admitting F_P/product evaluator intent
  - F_P evaluator outputs are prompt-only and not admitted as replay-visible carriers/events
  - GTL plugin overrides become hidden runtime config rather than declared hook/policy surfaces
  - F_D mechanical checks become semantic product judgment or force disambiguated requirements not present in source authority
  - repeated same-edge repair can make progress only as opaque retries without a construction progress ledger
  - stagnation is indistinguishable from incremental progress
  - public gaps appends events, admits evaluator output as construction intent, dispatches graph work, or owns a retry/bootstrap loop
  - public gaps uses an adapter-local ranking policy, omits GTL hook precedence, or fails to consume the same configured priority policy available to construction selection
  - public gaps exposes an inadmissible or ineligible action as the top recommendation without top-level blocked/admission context
  - read-only evaluator projection identity cannot distinguish different priority schemes or policy digests over the same observation
  - M04 gaps design/IACS describes an older runtime-aggregate-only computation instead of the T-127 construction evaluator carrier chain
  - bootstrap asset induction is hardcoded in CLI, harness, setup code, or product-local glue instead of admitted through published graph/action authority
  - public projection still collapses evaluator decisions to only retry_same_edge, blocked, or inspect_archive
  - downstream products must implement private construction selection loops after this substrate exists
---

# T-127: Define Generic F_P Consciousness Loop With GTL Plugin Overrides

## STDO Review

### S - Specification Method

The strategy is directionally aligned with the active Abiogenesis intent:

- `iterate()` advances replay-derived current projection under cumulative
  context and evaluator truth.
- `gen-start` and `gen-gaps` are the public operator compositions.
- the primary operator workflow must not replace ABG with a second local
  controller.
- F_P owns unconstrained constructive traversal inside the declared boundary.

The gap is that the active product surface still frames one GTL edge traversal
as the bounded unit of probabilistic compute. The strategy introduces a
higher-order construction episode:

```text
observe linked asset state
-> F_P evaluator selects an admissible outcome/action
-> ABG invokes the selected graph function
-> observe delta
-> tail recurse, yield, close, block, or escalate
```

That is not a small realization refactor. It changes the runtime/product law
around how evaluator truth can select graph-function invocation. The lawful
entry is `requirement_reprice`.

The requirement/design checkpoint now answers those questions:

- the loop is a product-owned F_P construction evaluator admitted by ABG runtime
  carriers, not an ABG product-strategy decider;
- one graph function or graph-vector traversal remains the bounded compute
  invocation; the construction episode composes those invocations through
  event-sourced tail recursion;
- public stop/projection states are `construction_closed`,
  `construction_progressing_yield`, `construction_blocked`,
  `construction_stalled`, `construction_review_required`,
  `construction_escalated`, `fh_input_required`, `ticket_created`, and
  `reprice_required`;
- evaluator intent enters as ranked `ConstructionIntentCandidate` rows that ABG
  admits or rejects before selecting one `AdmittedConstructionIntent`.
- public `gaps` is a read-only construction-observation projection over
  incomplete typed assets, blocking obligations, missing truth, lawful candidate
  completion/induction actions, admission blockers, and ranking reasons; it
  does not append events, invoke the evaluator, admit intent, dispatch graph
  work, or own a retry loop.
- bootstrap starts as the same construction episode over sparse replay state.
  If asset induction is the highest-value or blocking action, that induction is
  a published graph function/action catalog row admitted by ABG, not CLI setup
  glue.

### T - Ticket Method

The referenced strategy post is commentary. It can explain the proposal but
cannot become the durable work-item authority.

This ticket records the durable execution contract:

- change class: `requirement_reprice`
- re-entry point: `requirement`
- governance: `STDO Method`
- closure law and non-closure conditions
- dependency chain to existing ABG substrate tickets

This ticket closes the first-slice substrate ratification. Installed
runner-level recursion remains outside this ticket and is tracked by `T-128`.

### D - Design Module Method

The post had a coherent first design shape, but it was not design-complete at
intake. The completed design checkpoint defines the carrier family, Event
Calculus boundary, terminal event parity, structural carrier diagram, and
first-slice IACS, with deterministic and live-equivalent proof for the substrate
scope.

The design must define one carrier family, not another set of side channels:

- `ConstructionObservationSnapshot`
- `LinkedAssetState`
- `ConstructionActionCatalog`
- `ConstructionIntentCandidate`
- `AdmittedConstructionIntent`
- `ConstructionProgressLedger`
- construction projection rows / public summaries
- construction intent and progress events

The design must also prove composition with existing carriers:

- T-100 zoomed asset obligation schedule and foldback
- T-103 graph-span reentry frontier
- T-106 traversal non-progress continuation
- T-107 traversal modulation profile/envelope
- T-116 plugin traversal observer bindings
- assurance projection and closure fold

The main design risk is duplicate truth. If construction intent, graph reentry
frontier, traversal modulation, and assurance each compute their own next
action independently, the loop will recreate the current multi-source retry
defect.

### O - ODD Method

The strategy is ODD-correct only if the constructive carrier remains a
published graph function and ABG remains the runtime-truth substrate.

The evaluator may choose any lawful graph reentry point, but only by producing
an admitted construction intent over declared graph/action catalog truth. A
downstream product must not replace ABG continuation with a private runner or
harness loop.

ODD framing for this ticket:

```text
typed linked asset state
+ published graph/action catalog
+ F_P construction evaluator plugin
+ admitted construction intent
+ ABG graph invocation/runtime events
+ construction progress projection
+ proof surface
```

The generic loop is tail recursion over event-sourced construction state, not
an imperative while loop.

## Gaps And Bootstrap Boundary

The public gaps surface is a preview of current construction judgment:

```text
incomplete typed assets
-> missing input/output/proof/publication truth
-> blocking typed asset obligations
-> lawful graph/action rows that complete or induce those assets
-> priority and ranking reasons
```

It is read-only. It may tell an operator that the highest-value or blocking next
work is "induce typed asset inventory" or "complete this typed asset through
graph function X", but it cannot become the runtime authority for doing that
work. The mutation path remains:

```text
construction episode start
-> evaluator candidate ranking
-> ABG candidate admission
-> AdmittedConstructionIntent
-> ABG graph invocation
-> runtime/asset delta events
-> replay-derived progress or next gap
```

This means bootstrap is not a separate product-local setup loop. Bootstrap is
the first construction evaluation over sparse state. Sparse typed assets should
produce asset-induction pressure; asset induction must be represented as a
published graph function/action row and admitted before invocation.

## Added Acceptance Criteria: Gaps And Bootstrap

- AC-T127-GAPS-001: public gaps derives incomplete typed assets, missing
  input/output/proof/publication truth, blocking obligations, lawful candidate
  completion or induction actions, admission blockers, and ranking reasons from
  replay-derived state.
- AC-T127-GAPS-002: public gaps is read-only. It may render the same evaluator
  ranking used for construction action selection, but it does not append
  construction events, admit construction intent, select or dispatch graph work,
  or retry privately.
- AC-T127-GAPS-003: typed asset gaps bind only to lawful graph/action catalog
  rows that can complete or induce the missing typed asset truth; unbound gaps
  remain typed blocks.
- AC-T127-GAPS-004: declared priority policy can rank a highest-value or
  blocking typed asset gap above non-blocking gaps, but ranking cannot make an
  inadmissible action lawful.
- AC-T127-BOOTSTRAP-001: bootstrap begins as a construction episode over sparse
  replay state, not as a CLI/harness/setup loop.
- AC-T127-BOOTSTRAP-002: asset induction is lawful only when represented as a
  published graph function/action catalog row admitted by ABG before invocation.

Required test cases:

- TC-T127-GAPS-001: a sparse typed asset registry projects read-only gap rows
  with missing truth refs, candidate completion/induction refs, ranking reasons,
  and admission blockers.
- TC-T127-GAPS-002: rendering public gaps leaves the runtime event ledger,
  evaluator invocation ledger, candidate admission rows, and graph dispatch rows
  unchanged.
- TC-T127-GAPS-003: a candidate action that does not provide or induce the
  missing typed asset truth does not bind to the gap.
- TC-T127-GAPS-004: a candidate action with the right asset output but no
  published graph/action authority is reported as blocked, not selected.
- TC-T127-GAPS-005: declared highest-value/blocking policy ranks the blocking
  typed asset gap before non-blocking gaps without overriding admission.
- TC-T127-BOOTSTRAP-001: sparse replay state recommends a published
  asset-induction action and rejects setup-script-only induction.
- TC-T127-BOOTSTRAP-002: starting bootstrap emits/consumes the admitted
  construction event family and invokes the selected induction action only after
  ABG candidate admission.

## Proposed Generic Algorithm

```text
loop(S):
  O = observe(S)
  D = evaluate(O)
  if D is terminal:
    return D
  I = intend(D)
  Delta = ABG.invoke(I)
  return loop(project(S + Delta))
```

The recursion is lawful only when each iteration emits replay-visible runtime
truth and reaches one of the typed stop states:

- `construction_closed`
- `construction_progressing_yield`
- `construction_blocked`
- `construction_stalled`
- `construction_review_required`
- `construction_escalated`
- `fh_input_required`
- `ticket_created`
- `reprice_required`

## GTL Plugin Override Model

The default loop must be generic and domain-neutral.

Candidate GTL attachment points:

- `Module.policy_hooks["abg.fp_consciousness"]`
- `Job.policy_hooks["abg.fp_consciousness"]`
- `Role.policy_hooks["abg.fp_consciousness"]`
- `GraphFunction.declarations["abg.fp_consciousness"]`
- `GraphVector.declarations["abg.fp_consciousness"]`

Candidate override concerns:

- `observer_adapter`
- `action_catalog_adapter`
- `observation_to_action_resolver`
- `priority_scheme`
- `affect_priority_policy`
- `admissibility_policy`
- `value_function`
- `progress_policy`
- `escalation_policy`
- `intent_renderer`

The default resolution order should be designed explicitly. A plausible order:

```text
GraphVector -> GraphFunction -> Job -> Role -> Module -> visible installed fallback/config or visible source-default fallback for direct API use
```

No fallback may be hidden. Missing or malformed plugin declarations must fail
closed or select the declared default.

## Current Design Checkpoint

The requirement/design and first TypeScript substrate slices are completed for
operator review. Runtime-entry event construction, public gaps adapter,
bootstrap asset-induction admission, terminal route parity, and downstream-style
progress proof are implemented. Installed runner-level recursion is deliberately
not claimed by this ticket and is carried by `T-128`.

Added authority:

- `specification/PRODUCT.md`: names higher-order F_P construction episodes and
  preserves one traversal as the bounded runtime compute unit.
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`: ratifies the
  generic construction loop, construction intent admission, progress ledger,
  projection states, read-only gaps projection, bootstrap asset-induction
  boundary, GTL override rule, and F_D ambiguity boundary.
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`: adds the
  `abg.fp_consciousness` hook concern and precedence.
- `specification/requirements/gtl/REQ-L-GTL3-ATTRS.md`: reconciles job/module
  policy hooks into the base attrs carrier list.
- `specification/requirements/gtl/REQ-L-GTL3-JOB.md` and
  `specification/requirements/gtl/REQ-L-GTL3-MODULE.md`: name job/module
  policy hooks as visible defaults.
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`: names the
  construction event family boundary and requires progress/stagnation/public
  state to derive through Event Calculus/derived-fluent law.

Added detailed design:

- `build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`

## Required Design Decisions

- [x] Decide whether `abg.fp_consciousness` is a new GTL hook concern or a
  composition over existing dispatch/evaluation/escalation/assurance hooks.
- [x] Define the construction episode boundary and its relation to `GraphCall`,
  `Frame`, `Continuation`, and graph-span reentry.
- [x] Define whether the evaluator returns exactly one selected intent or a
  ranked candidate set admitted by ABG.
- [x] Define construction-progress projection states and public summary
  agreement law.
- [x] Define stagnation detection: same blocker and same artifact digest must
  not be treated as progress.
- [x] Define how F_H feedback and ticket creation enter the same construction
  episode without becoming side channels.
- [x] Define how downstream products such as odd_sdlc consume the projection
  without building local retry controllers.
- [x] Define observation-to-action binding from ledger/error/workspace pressure
  into lawful graph action rows.
- [x] Define configured priority scheme for strategy pressure such as
  steel-thread, release-blocking, and gap repair.
- [x] Define affect boost/attenuation/review pressure without allowing affect to
  bypass admission.
- [x] Split `AffectPriorityPolicy` as declared product/GTL config from
  ABG-derived `AffectPriorityAdjustment` projection rows.
- [x] Define terminal affect dispositions and deterministic priority tie-break
  law.
- [x] Map forced review to the public `construction_review_required`
  projection state.
- [x] Define public gaps as a read-only typed asset evaluator projection, not a
  mutation, intent-admission, graph-dispatch, or retry-loop surface.
- [x] Define bootstrap as the first construction evaluation over sparse replay
  state, with asset induction represented by published graph/action authority.

## Implementation Checklist

- [x] Ratify requirement authority for generic F_P construction evaluation.
- [x] Add design surface for the construction episode, observation snapshot,
  action catalog, intent carrier, progress ledger, and projection rows.
- [x] Add Design Module Method structural carrier diagram with classDiagram,
  carrier roles, visibility, and deferred/downstream boundaries.
- [x] Reconcile construction event family with Event Calculus and derived
  fluent law before runtime implementation.
- [x] Add lawful traversal target refs for action catalog rows that target
  internal graph-vector boundaries.
- [x] Consolidate GTL hook/attrs requirement surfaces for job/module policy
  hooks.
- [x] Add observation-to-action, configured priority, affect policy, and
  ABG-derived affect adjustment design carriers.
- [x] Add TypeScript contracts and admission for construction intent and
  progress truth.
- [x] Add first-slice event admission, Event Calculus effects,
  RuntimeDerivedFluentRule, and replay projection support for construction
  start, observation/catalog replay-aids, evaluator invocation, candidate
  return/admission/rejection, intent selection, graph-action invocation, delta
  observation, derived progress fluent truth, and progress-ledger/stagnation
  derivation from delta events.
- [x] Extend construction event/projection support through terminal review,
  F_H input, escalation, ticket/reprice, and closure runtime entry wiring.
- [x] Add public gaps projection support for incomplete typed assets, blocking
  asset obligations, missing truth refs, candidate completion actions, read-only
  evaluator ranking from the T-127 ConstructionPriorityProjection, ranking
  reasons, admission blockers, no-mutation behavior, and no M04-local ranking
  truth.
- [x] Carry configured construction priority policy through the installed CLI
  gaps path. Direct publicGaps API injection is not closure proof; installed
  gen-gaps must admit or derive the same declared GTL/product priority policy
  used by construction selection.
- [x] Resolve public gaps abg.fp_consciousness hook inputs with the same GTL
  precedence as construction selection: GraphVector, GraphFunction, Job, Role,
  Module, then visible installed fallback/config or visible source-default
  fallback for direct API use.
- [x] Prevent top-level public gaps recommendation from presenting ineligible
  actions as selected best actions without blocked/admission context.
- [x] Make read-only evaluator/projection identity policy-distinct by carrying
  prioritySchemeRef or a scheme/config digest in the projection identity or
  public source refs.
- [x] Reconcile M04 public gaps design and IACS to the implemented T-127 carrier
  chain: ConstructionObservationSnapshot -> ConstructionActionCatalogProjection
  -> ObservationToActionBindingProjection -> ConstructionPriorityProjection.
- [x] Bind M04 public gaps to visible fallback truth: installed fallback/config
  wins when present; direct API use without an installed bundle uses a visible
  source-default fallback with explicit source refs/digest.
- [x] Share construction action catalog identity/derivation with the runtime
  construction entry point so public gaps and execution cannot drift by naming
  convention.
- [x] Add bootstrap asset-induction substrate support so sparse replay state can
  rank a published asset-induction graph function/action row and construct the
  graph-action invocation event only after ABG admission.
- [x] Wire the first-slice substrate through ABG-owned admitted-intent and
  runtime-event entry surfaces, not CLI or harness-local loops. Installed runner
  recursion is deferred to `T-128`.
- [x] Add first-slice hook declaration resolution for plugin overrides with
  visible fallback behavior.
- [x] Wire hook declaration resolution to live GTL Module, Job, Role,
  GraphFunction, and GraphVector carrier surfaces.
- [x] Add deep sandbox/live scenario ladder tests for:
  - configured construction priority through read-only public gaps ranking
  - GTL abg.fp_consciousness hook-derived priority ranking
  - missing typed input blockers preventing an otherwise highest-priority action
    from becoming public bestActionRef
  - bootstrap sparse-state typed asset induction through a published graph/action
    row and ABG candidate admission
  - recursive construction replay across two iterations, with material progress
    followed by replay-derived stagnation
- [x] Add deterministic first-slice tests for:
  - observation-to-action binding from ledger/error pressure
  - configured priority ranking and affect adjustment
  - affect boost and confidence attenuation
  - overlapping terminal affect policies select the route for the selected
    disposition
  - admitted intent selection is priority-rank owned, not caller-order owned
  - F_D canonical semantic demand rejection
  - missing input rejection despite priority pressure
  - affect-only non-binding to constructive graph actions
  - forced review, F_H input, and escalation public projection
  - progress/stagnation detection
  - shuffled progress rows canonically ordered by event sequence, iteration
    ordinal, and attempt ordinal before latest projection
  - missing recursion metadata rejected for progress rows
  - construction runtime event admission rejects missing lineage/correlation
  - construction Event Calculus replay uses canonical construction event order
  - observation/catalog construction events are replay-aid events with empty
    effects
  - construction evaluator awaiting-outcome, intent, graph-action, and delta
    fluents replay from declared Event Calculus effects
  - construction delta events derive progress ledger rows without a primary
    stagnation event
  - stagnant same-blocker/same-digest deltas do not derive positive EC progress
    fluent truth
  - orphan construction deltas are rejected before EC projection and
    progress-ledger derivation
  - closed construction delta truth terminates construction_episode_open and
    initiates construction_episode_closed
  - malformed/hidden plugin override rejection
  - public summary agreement with carrier-derived projection including selected
    intent and trace refs
  - public gaps read-only recommendation follows ConstructionPriorityProjection
    rank across multiple open gaps rather than job order, status order, or
    lexical asset order
- [x] Complete remaining deterministic runtime tests for:
  - gap-triggered evaluator invocation
  - full public gaps no-mutation proof that runtime event ledger, evaluator
    invocation ledger, candidate admission rows, and graph dispatch rows remain
    unchanged
  - projection/evaluator refs differ, or source refs carry a policy-distinct
    digest, when the same observation is ranked under different priority schemes
  - bootstrap from sparse replay state rejects CLI/setup-script-only induction
    and constructs graph-action invocation only through the admitted graph/action
    event path
  - same-edge incremental progress through admitted construction events in the
    runtime event entry path
  - arbitrary lawful graph reentry
  - construction Event Calculus and RuntimeDerivedFluentRule replay parity
- [x] Add a downstream-style proving lane that reproduces the odd_sdlc failure
  class: progressive design-depth repair must project construction progress,
  not collapse into untyped same-edge retry or process timeout.

## Proof Surface

Minimum proof before closure:

- `npm run build:semantic`
- focused TypeScript contract test for construction intent admission
- focused TypeScript projection test for construction progress/stagnation
- focused GTL override resolution test
- focused public gaps projection test proving read-only typed asset gap rows,
  candidate completion/induction bindings, and no mutation
- focused bootstrap asset-induction admission test proving sparse state invokes
  only through published graph/action authority
- sandbox test showing same-edge incremental repair progresses through typed
  construction ledger
- live or live-equivalent downstream proof showing the harness observes typed
  construction progress/block truth rather than owning the loop
- `git diff --check`

Current closure proof:

- `npm run build:semantic` passed on 2026-05-08
- `npm run test:t127:sandbox` passed 6/6 on 2026-05-08
- `npm run test:t127:live` passed 6/6 on 2026-05-08
- `npm run test:t127` passed 33/33 on 2026-05-08
- `npm run test:t010` passed 5/5 on 2026-05-07
- `npm run test:t058` passed 11/11 on 2026-05-08
- `npm run test:semantic` passed 477/477 on 2026-05-08
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live` passed 1/1
  on 2026-05-08
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live:uat` passed
  2/2 on 2026-05-08
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000
  npm run test:t094:live` passed 1/1 on 2026-05-08
- `git diff --check` passed on 2026-05-08 after the final consistency sweep

## Non-Implementation Note

Do not start by loosening a live harness timeout. The live timeout is a symptom.

The substrate gap is that F_P construction progress is not durable runtime
truth. The first fix is the evaluator-intent-progress carrier family and its
projection law.
