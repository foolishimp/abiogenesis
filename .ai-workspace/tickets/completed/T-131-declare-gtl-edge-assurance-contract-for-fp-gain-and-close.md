---
id: T-131
title: Declare GTL edge assurance contract for F_P gain and close
type: feature
ticket_category: gtl_edge_assurance_contract
status: completed
review_status: completed_source_scope_residual_consolidated_to_T-132
goal: gtl-native-edge-gain-close-contract
change_intent: Move edge gain and close law into a declared GTL edge assurance contract consumed by ABG, so downstream products constrain F_P semantic evaluation through GTL/ABG instead of recreating product-local meta-runtimes.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: post-3.5.0-rc.2 GTL/ABG edge assurance hardening
triaged_at: 2026-05-13T16:27:21+10:00
created_at: 2026-05-13T16:27:21+10:00
updated_at: 2026-05-13T20:22:13+10:00
closed_at: 2026-05-13T20:22:13+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
parent_tickets:
  - .ai-workspace/tickets/completed/T-116-enable-gtl-plugin-traversal-observer-bindings-for-transform-and-eval.md
  - .ai-workspace/tickets/completed/T-130-define-recorded-hook-action-typing-model-for-fp-evals.md
follow_up_tickets:
  - .ai-workspace/tickets/completed/T-132-prove-runner-consumed-edge-assurance-eval-replay.md
related_downstream:
  - odd_sdlc/.ai-workspace/comments/codex/20260513T035126Z_data_mapper_test35_vs_ts_followup.md
current_evidence:
  - PRODUCT.md defines one GTL edge traversal as the bounded unit of probabilistic compute and says F_D is a deterministic evaluator or domain-owned optimization where part of the work can be made precise.
  - REQ-L-GTL3-GRAPHVECTOR already makes GraphVector.declarations the canonical transition-governance declaration surface for one invariant traversal boundary.
  - REQ-L-GTL3-HOOKS already allows assurance hook refs for authority snapshots, evidence adaptation, ambiguity classification, closure policy, and gain-function adaptation.
  - REQ-R-ABG3-ASSURANCE already gives ABG a total assurance projection and closure fold, but the GTL edge does not yet declare a first-class assurance contract that binds constrained F_P gain evaluation to closure and residual pressure.
  - Graph overlays provide the governed lay of the land over an underlying mutable workspace reality. They bind graph interpretation over that reality and run graph functions across it, but they are not the only possible materializer of the underlying workspace.
  - If an edge traversal lacks a declared assurance function, the lawful default is F_H assurance by absentia: a human iterator must declare closure or continuation, and that judgment must still be scoped and replay-visible.
  - F_H absentia also permits F_H transform: a human who is unsatisfied with the current edge result may change the mutable worksite directly, after which ABG observes the changed state and continues or closes the same scoped edge from admitted observation and human judgment.
  - Downstream odd_sdlc parity analysis showed the test35.py behavior was effectively a product-local meta-contract over edges; that shape must move into GTL/ABG rather than remain an SDLC-specific controller.
  - 2026-05-13 implementation added an immutable `EdgeAssuranceContract`, source-precedence `EdgeAssuranceContractSelection`, F_H-required `EdgeAssuranceAbsentiaResolution`, and `FpEdgeAssuranceEvalFinding`.
  - 2026-05-13 implementation added `EnginePluginInput.edgeAssuranceResolution`, so runtime plugins receive the selected edge assurance contract or F_H absentia disposition without a side-door lookup.
  - 2026-05-13 proof added `test:t131`, proving vector-first precedence, lower-precedence defaults, malformed declaration failure, F_H absentia, F_P eval finding admission shape, plugin input exposure, and forbidden closure-authority rejection.
  - 2026-05-13 self-review repair added `ExecutionBasis.modulePolicyHooks` and `edgeAssuranceDefaults` threading through runner/plugin input so module policy hooks and visible defaults reach runtime plugins rather than only unit-level resolver calls.
  - 2026-05-13 follow-up added `EdgeAssuranceEvaluationProjection` and `EdgeAssuranceEvaluationReadModel`, proving admitted F_P eval findings can project gain, residual pressure, continuation, next-action basis, and ABG-owned close fold without giving F_P closure authority.
  - 2026-05-13 review hardening made selection refs use canonical identity, exported F_H absentia action refs, removed synthetic module objects from plugin input resolution, reused generic hook-admission matching, added qualified-defer and digest-stability tests, and split F_P human-assurance proposals from ABG F_H absentia.
  - 2026-05-13 residual consolidation moved deep runner/replay proof and downstream carry-across readiness into T-132.
target_truth: A GTL edge can declare an EdgeAssuranceContract. The contract names the target outcome, obligation surface, admissible evidence, constrained F_P eval input/output contract, gain report schema, closure decision schema, residual pressure schema, continuation schema, composition law, and cheap structural checks. The contract is bound through a graph overlay over an underlying mutable workspace reality; the overlay governs interpretation, traversal, and measurement, but it does not claim to be the only possible materializer of that reality. If the edge does not declare an assurance function, ABG resolves default assurance to F_H by absentia rather than inferring closure from worker output, gaps absence, or runtime success. In that absentia mode, F_H may either declare closure/continuation or perform direct worksite transform and return for renewed observation. ABG resolves the contract or F_H absentia default, materializes the eval boundary, records and admits the returned findings, worksite observations, external materialization deltas, or human closure judgment, projects gain/closure/residual truth, and keeps selection, event, ledger, and replay authority inside ABG.
closure_law: Source-scope close only when requirements, design, carriers, and tests prove that a published GraphVector or GraphFunction can carry an inspectable EdgeAssuranceContract; ABG can resolve it without side-door runtime config; F_P eval returns structured gain/close/residual findings under that contract; and ABG records, admits or rejects, and projects those findings through replay-visible carriers. Downstream removal of private meta-contracts is a carry-across obligation, not this ticket's source-scope closure condition.
non_closure_conditions:
  - Edge gain or close remains only prompt prose, worker narrative, downstream service code, or product-local meta-runtime state.
  - F_P eval output can close an edge without satisfying a GTL-declared output contract and ABG admission record.
  - Missing edge assurance silently falls through to automated closure instead of producing an F_H-required absentia disposition.
  - F_H direct worksite changes are treated as invisible side effects rather than observed worksite state change under the open edge.
  - The graph overlay is treated as the only materializer of the workspace rather than as a governed interpretation and measurement layer over mutable underlying reality.
  - ABG treats F_D as the generic semantic recognizer for arbitrary domain work instead of preserving F_D as cheap structural checking or domain-owned optimization.
  - Assurance projection can infer close from worker success, file presence, report shape, or absence of gap rows without the edge assurance contract.
  - Residual pressure and A-to-Z composition are not represented, so one edge can close locally while the compound traversal remains unmeasured.
---

# T-131: Declare GTL Edge Assurance Contract For F_P Gain And Close

## Entry

Smallest lawful re-entry: `design_reframe`.

The missing structure is not another downstream SDLC ledger and not an ABG-side
semantic oracle. It is a GTL-native contract on the edge:

```text
A -> B declares how B will be recognized, measured, closed, deferred,
continued, or repriced by constrained F_P evaluation.
```

For generic software-domain work, F_P owns the semantic judgment. GTL constrains
the boundary. ABG admits, records, projects, and routes the result. F_D remains
cheap structural checking or domain-owned optimization where the domain can make
part of the work precise.

If no assurance function is declared for an edge traversal, the default is not
"no assurance" and not "runtime can infer closure." The default is F_H assurance
by absentia:

```text
edge has no declared assurance function
-> ABG projects F_H-required absentia assurance
-> human iterator declares close, continue, reprice, block, or defer
   or performs direct F_H transform in the mutable worksite
-> ABG observes the changed worksite and admits the human judgment or state delta
   as scoped replay-visible edge input
```

In absentia mode the graph does not own the human's internal transform method. The
graph only owns the scoped traversal boundary and the admitted observation,
judgment, or closure consequence after the worksite changes.

## Overlay And Underlying Reality

The graph overlay gives the lay of the land. It binds graph meaning over an
underlying mutable workspace reality and makes that reality traversable,
measurable, replayable, and reviewable through GTL/ABG.

The overlay is not the only materializer of the workspace.

Legal materializers may include:

- ABG-invoked F_P transform
- F_H direct worksite transform
- external tool or build output
- imported or pre-existing workspace state
- downstream product runtime return

The graph does not need to own every materializer's internal HOW. It needs to
observe the resulting state, bind it to the scoped edge or overlay, admit the
relevant evidence or delta, and then evaluate gain, residual pressure, and
closure.

## Problem

Current GTL/ABG has the surrounding hooks:

- `GraphVector.declarations` can carry transition-governance truth.
- `Evaluator` can declare probabilistic convergence or attestation surfaces.
- plugin traversal observer bindings can materialize transform and eval prompts.
- ABG assurance can project authority/evidence rows and fold closure.
- ABG plugin contracts already forbid plugins from owning traversal closure.

The missing object is the explicit edge-level assurance contract that connects
those pieces:

```text
edge declaration
-> constrained F_P eval contract
-> gain finding
-> close/residual finding
-> ABG admission/projection
-> next lawful basis
```

Without this, downstream products can describe requirements, tag outcomes, and
collect worker assessments, but they still lack the declared computation that
says how an `A -> B` edge gained the intended `B`, whether `B` is satisfied, what
pressure remains, and how that edge composes into `A -> Z`.

## Required Contract Shape

The exact carrier names are design work, but the first stable shape should cover:

```text
EdgeAssuranceContract {
  edgeRef
  targetOutcomeRef
  authoritySurfaceRefs
  targetObligationBindingRefs

  transformFpContractRef
  evalFpContractRef
  evalPromptInputContractRef
  evalExpectedOutputContractRef

  admissibleEvidencePolicyRef
  admittedEvidenceKindRefs
  gainReportSchemaRef
  metricFunctionRef
  closeDecisionSchemaRef
  residualPressureSchemaRef
  continuationSchemaRef
  compositionLawRef

  cheapStructuralCheckRefs
  policyRefs
}
```

Gain is not necessarily a scalar. It is the edge-declared measurement of movement
from current authority and input state toward the target outcome. A scalar metric
may be one realization, but it must be an admitted metric row under the edge
contract, not an informal worker percent complete.

Closure is not raw F_P self-report. F_P returns constrained findings under the
edge assurance contract. ABG records the hook action, admits or rejects findings,
projects gain/closure/residual truth, and exposes replay-visible decision basis.

## Authority Split

| Layer | Owns |
| --- | --- |
| GTL | Declares the edge assurance contract, hook refs, evaluator refs, schemas, evidence policy refs, and composition law refs. |
| F_P | Performs constructive work and semantic eval inside the declared contract; returns structured gain, close, residual, and evidence findings. |
| ABG | Resolves the contract, materializes the eval boundary, records hook actions, admits/rejects findings, emits events, projects assurance, and routes next lawful control. |
| F_D | Performs cheap structural checks: schema, identity, digest, evidence presence, write-root, provenance, and envelope consistency. |
| Downstream product | Owns domain meaning, concrete gain semantics, evidence interpretation, and product-specific closure policy instances. |

## Required Work

- Update GTL requirements/design so `GraphVector.declarations` can carry a
  stable `abg.edge_assurance_contract` hook/config surface or equivalent.
- Define how `GraphFunction.declarations`, `Job.policy_hooks`, `Role.policy_hooks`,
  and visible defaults may provide edge-assurance defaults without overriding a
  vector-local contract.
- Define the absentia rule: when no edge assurance function is declared, ABG
  must require F_H assurance instead of inferring automated closure.
- Define F_H transform in absentia mode: direct human worksite edits are lawful
  edge progress when they are followed by scoped observation/admission before
  continuation or closure.
- Define overlay/materializer boundary: graph overlays govern interpretation and
  measurement over workspace reality without claiming exclusive materialization
  authority over that reality.
- Define the ABG resolution and admission path for the contract.
- Integrate the contract with recorded hook-action typing from T-130 so F_P eval
  returns findings, not direct ledger/projection/closure authority.
- Extend assurance projection so declared gain/close/residual findings are
  replay-visible and causal to the edge contract.
- Add negative tests proving that prompt prose, worker narrative, report shape,
  file presence, or gap absence cannot close an edge without the contract.

## Acceptance

- [x] Requirements state that every closure-capable probabilistic edge may carry
      an explicit edge assurance contract in GTL.
- [x] Design defines the carrier shape, declaration keys, precedence, and
      fallback behavior.
- [x] Missing edge assurance resolves to an F_H-required absentia disposition.
- [x] F_H absentia supports direct human transform over the mutable worksite
      without making graph structure own the human HOW.
- [x] Overlay binding distinguishes governed graph interpretation from the
      non-exclusive set of materializers that can change the workspace.
- [x] The contract distinguishes transform F_P from eval F_P.
- [x] F_P eval output schema includes gain, close disposition, residual pressure,
      evidence refs, authority refs, and composition contribution.
- [x] ABG records the eval hook action and admits or rejects the returned
      findings before deriving assurance projection or closure.
- [x] F_D checks are limited to structural envelope authority unless the domain
      explicitly supplies deterministic semantic law.
- [x] Compound traversal composition is represented so local edge close cannot
      imply `A -> Z` close without composition evidence.
- [x] Tests prove malformed, missing, prose-only, or side-door edge assurance
      contracts fail closed.
- [x] Tests prove a downstream domain can provide a valid constrained F_P eval
      contract and ABG can project replay-visible gain, close, residual, and
      next-action basis from it.

## Implementation Evidence

Date: 2026-05-13

Changed surfaces:

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/edge_assurance_contract.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t131_edge_assurance_contract.test.mjs`

Proof commands:

```bash
cd build_tenants/abiogenesis/typescript
npm run build:semantic
npm run lint:semantic
npx eslint --max-warnings=0 test_env/tests/test_t130_hook_action_typing_model.test.mjs test_env/tests/test_t131_edge_assurance_contract.test.mjs
npm run test:t131
npm run test:t130:t131
npm run test:semantic
```

Residual for terminal closure:

- The edge assurance contract and hook-action admission chain now exist and are
  exposed to `EnginePluginInput`.
- Runtime plugin input now resolves vector, graph-function, job, role, module
  policy, and explicit visible-default edge assurance contracts.
- The source-scope proof now consumes an admitted `FpEdgeAssuranceEvalFinding`
  into `EdgeAssuranceEvaluationProjection` and
  `EdgeAssuranceEvaluationReadModel`.
- Deep runner/replay proof and downstream carry-across readiness are consolidated
  into T-132. Downstream odd_sdlc implementation remains separate from ABG, but
  T-132 is now the ABG gate before that carry-across.

## Proof Span

Executed proof commands:

```bash
cd build_tenants/abiogenesis/typescript
npm run build:semantic
npm run lint:semantic
npx eslint --max-warnings=0 test_env/tests/test_t130_hook_action_typing_model.test.mjs test_env/tests/test_t131_edge_assurance_contract.test.mjs
npm run test:t131
npm run test:t130:t131
npm run test:semantic
```

The remaining installed/live proof obligation is now controlled by T-132.
