---
id: T-162
title: Realize ABG requirements algebra first slice
type: feature
ticket_category: requirements_algebra
status: active
goal: >-
  Implement the first ABG-owned requirements algebra slice from the strategy
  post as one coherent substrate: requirement identity, traversal spans,
  staged context fragments, KAOS-inspired relations, edge requirement
  environments, projections, evidence bindings, test relations, folds,
  residuals, attenuation, assurance-case read models, and deterministic query
  functions. The implementation must make obligation, materialization,
  evidence, fold, residual, and re-entry ledgers projections from admitted
  requirement carriers rather than peer local ledgers.
change_intent: >-
  Ratify and realize requirements as the typed carrier that preserves WHAT
  pressure through finite GTL/ABG graph-function traversal. A requirement is
  not a flat document row or a product-local string id. It is a stable,
  source-provenanced algebraic term with a traversal span, relations,
  operationalization, evidence policy, fold state, residual pressure, and
  replay-visible projection. ABG owns the carrier grammar, admission, replay,
  deterministic projection gates, fold law, residual attenuation, and query
  surface; GTL exposes wrapper declarations and graph-function bindings; F_P
  maintains semantic pressure; F_H may admit explicit product-owner reprices or
  residual risk; F_D is limited to admitted envelope, identity, relation,
  provenance, span, and replay consistency checks.
change_class: product_reprice
re_entry_point: product
owner: abiogenesis
priority: critical
triaged_at: 2026-06-26
created_at: 2026-06-26
updated_at: 2026-06-26
governance_scope: STDO Method, GTL, ABG, Requirements, Assurance
build_tenant: typescript
single_ticket_rule: >-
  This is the single ticket for the first requirements-algebra implementation
  wave. Do not split the first slice into sibling implementation tickets unless
  the operator explicitly reprices the work. Use the internal checklist in this
  ticket for sequencing.
intake_source: >-
  Operator asked for one ticket to implement the requirements algebra from
  `.ai-workspace/comments/codex/20260626T011328Z_STRATEGY_requirements_algebra_edge_spans.md`.
  The strategy states that ledgers should fall out from one requirements
  ledger: requirements ledger -> obligation projection -> materialization target
  projection -> evidence binding projection -> closure fold projection ->
  residual/re-entry projection. It also states that the core belongs in
  GTL/ABG first, with odd_glc and recursive executive-observer work downstream
  of this substrate.
source_documents:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/GOALS.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - .ai-workspace/comments/codex/20260626T011328Z_STRATEGY_requirements_algebra_edge_spans.md
related_tickets:
  - .ai-workspace/tickets/completed/T-145-realize-evaluate-c-as-evaluation-set-phase-over-read-only-ledgers.md
  - .ai-workspace/tickets/completed/T-146-generalize-composed-c-stages-as-stage-set-phases.md
  - .ai-workspace/tickets/completed/T-149-simplify-abg-iteration-state-action-algebra.md
  - .ai-workspace/tickets/completed/T-151-declare-segment-scoped-evaluation-redispatch-substrate.md
  - .ai-workspace/tickets/completed/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - .ai-workspace/tickets/completed/T-159-formalize-traversal-unit-and-consequence-bind-boundary.md
  - .ai-workspace/tickets/backlog/T-160-declare-abg-recursive-executive-observer-graph-for-obligation-pressure.md
affected_boundary:
  product:
    - specification/PRODUCT.md
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
    - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
    - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
    - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t162_requirements_algebra.test.mjs
target_truth: >-
  ABG/GTL core owns an algebraic requirement kernel. Requirement pressure is
  represented by admitted carriers with stable identity, source provenance,
  typed relations, traversal spans, active edge environments, obligations,
  projections, evidence bindings, folds, residuals, attenuation, and assurance
  read models. Existing obligation refs and residual pressure refs become
  projections from the requirements ledger. Product-specific meaning enters
  through context fragments, product-authored requirement terms, graph-function
  refs, evidence refs, F_P findings, F_H decisions, and plugins; it does not
  become ABG-local parsing of unknown product syntax.
superseded_truth: >-
  Requirements exist primarily as prose documents or local string ids, while
  obligation ledgers, materialization ledgers, test ledgers, evidence ledgers,
  closure folds, residuals, and re-entry decisions are independently invented
  per product and later reconciled by prompt convention, archive parsing, or
  deterministic semantic reconstruction.
closure_law: >-
  Close only when product law, requirements, design, TypeScript realization,
  admission tests, projection tests, fold/residual tests, and semantic regression
  tests prove the first ABG-owned requirements algebra slice. Closure must prove
  that broad and narrow traversal spans project obligations correctly; context
  fragments remain staged unless lawfully promoted; KAOS-inspired relations are
  admitted as typed terms; edge environments carry immediate, prior, and
  overarching pressure; evidence binding does not equal closure; test source,
  execution, and semantic interpretation remain distinct projections; current
  admitted evidence supersedes empty predecessor replay; F_P rejection can
  leave semantic assurance residual despite admitted execution evidence; folds
  emit replay-visible residuals and attenuation; and query/read models expose
  active requirements, obligations, evidence, folds, residuals, and assurance
  claims without downstream archive parsing.
non_closure_conditions:
  - The work only adds strategy prose, comments, or ticket text.
  - Requirements remain flat strings without stable ids, source refs, spans, and typed relations.
  - Obligation/materialization/evidence/fold/residual ledgers remain peer ledgers rather than projections from requirement terms.
  - F_D infers product semantic satisfaction from unknown syntax or path shape.
  - Test source materialization or test execution is treated as requirement closure by itself.
  - F_P semantic rejection cannot preserve a residual over the requirement/test relationship.
  - Current admitted evidence cannot supersede empty or stale predecessor replay.
  - Context fragments are either all exploded into requirement atoms or all left as inert prose.
  - Traversal spans are local string conventions that do not survive graph-function/vector identity.
  - The implementation starts odd_glc, T-160 executive observation, UI, or downstream product policy before ABG/GTL owns the core carriers and folds.
  - No query/read model exists for active requirements, obligations, evidence bindings, folds, residuals, attenuation, and assurance claims.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t162
  - cd build_tenants/abiogenesis/typescript && npm run test:t145
  - cd build_tenants/abiogenesis/typescript && npm run test:t146
  - cd build_tenants/abiogenesis/typescript && npm run test:t149
  - cd build_tenants/abiogenesis/typescript && npm run test:t151
  - cd build_tenants/abiogenesis/typescript && npm run test:t159
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
---

# T-162: Realize ABG Requirements Algebra First Slice

## STDO Triage

### First Missing Layer

Product definition, followed by requirements.

The strategy post is commentary, not ratified specification. The work must
first make the product law explicit: ABG/GTL core owns requirement algebra as a
constructive substrate that carries WHAT pressure through HOW traversal and
assurance fold. Only after that product claim is ratified should requirement
surfaces, design modules, carriers, admission, and tests descend.

### Lawful Re-Entry

`product_reprice`.

This changes the product substrate. Requirements are no longer only upstream
constitutional text or downstream-local obligation ids. They become admitted
ABG/GTL carriers that project edge-local work, materialization targets,
evidence bindings, folds, residuals, attenuation, and assurance read models.

### Governance Expansion

- `S`: specification must distinguish product meaning, staged constraints,
  algebraic requirements, graph-function HOW, evidence, fold, and residual.
- `T`: this single ticket is the durable implementation record for the first
  slice.
- `D`: design must declare carrier roles, IACS, effect edges, projection edges,
  and replay precedence before code.
- `O`: the result must remain graph-native and ABG-owned. It must not become
  a document parser, product-local ledger framework, or downstream lifecycle
  policy.

## Product Shape

The intended algebra is:

```text
requirements ledger
  -> obligation projection
  -> materialization target projection
  -> evidence binding projection
  -> closure fold projection
  -> residual/re-entry projection
```

Requirements are the carrier preserving finite computation from `A -> Z`:

```text
Req.what_i =
  <meaning_i, span_i, asset_projection_i, assurance_projection_i,
   evidence_policy_i>

H(Req.what_i) ->
  <P.asset_i, P.assurance_i, Fold_i, Residual_i>
```

The first slice must implement enough algebra to prove this preservation rule
for edge spans, test relations, evidence binding, fold, and residual. It does
not need full import/export, UI, odd_glc, or recursive executive observation.

## Required Work

1. Product and requirements reprice
   - Ratify in `PRODUCT.md` that ABG/GTL core owns requirement algebra as the
     substrate for obligation, evidence, fold, residual, and assurance
     projections.
   - Add or update ABG/GTL requirement law for requirement identity, traversal
     spans, staged authority fragments, typed relations, edge environments,
     evidence bindings, folds, residuals, attenuation, and query/read models.
   - State that F_D may validate carriers and replay consistency but must not
     infer product semantic satisfaction from unknown syntax.
   - State that F_P and F_H are the lawful semantic and owner-decision pressure
     surfaces.

2. Design module
   - Add `M03_REQUIREMENTS_ALGEBRA_DERIVATION.md`.
   - Add `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md`.
   - Add `M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`.
   - Define how existing edge assurance, evaluation-set, stage-set,
     continuation, payload, and traversal-unit law consume or project the new
     requirement carriers without replacing them abruptly.

3. Core carriers and admission
   - Add `AuthorityContextFragment` staging fields: origin stage, constraint
     scope, promotion policy, applies-to refs, and routing outcome.
   - Add `TraversalSpan` and `covers(span, edge)`.
   - Add `RequirementTerm` variants for atom, composition, refinement,
     dependency, assumption, obstacle, conflict, mitigation, agent assignment,
     operationalization, projection, test relation, evidence binding, fold, and
     residual.
   - Add `RequirementRelation`, `RequirementAttribute`, and
     `RequirementImportRef` for stable identity, source metadata, aliases, and
     typed relations.
   - Add admission for all first-slice carriers. Unknown fields must fail
     closed.

4. Edge environment and projection functions
   - Add `RequirementLedger`.
   - Add `EdgeRequirementEnvironment`.
   - Add `activeRequirements(ledger, edge)`.
   - Add `buildEdgeRequirementEnvironment(ledger, edge, priorEvents)`.
   - Add `projectRequirements(environment, edge)`.
   - Add `projectMaterializationTargets(environment, obligations)`.
   - Add `routeContextConstraint(fragment, state)`.

5. Evidence, fold, residual, and assurance
   - Add `RequirementEvidenceBinding`.
   - Add `RequirementTestRelation` with distinct asset, test-source,
     test-execution, and test-interpretation projections.
   - Add `foldRequirementEvidence(environment, bindings)`.
   - Add `residualizeRequirementFolds(environment, folds)`.
   - Add `classifyRequirementAttenuation(priorResiduals, folds, residuals)`.
   - Add `RequirementAssuranceClaim` and `projectAssuranceCase(...)`.

6. Query/read models and compatibility bridge
   - Add a read model that exposes active requirements, edge obligations,
     materialization targets, evidence bindings, folds, residuals, attenuation,
     and assurance claims.
   - Wrap current carried obligation refs and residual pressure refs as
     `RequirementProjection` records without changing existing downstream
     behavior in the first slice.
   - Make the query surface explicit enough that products do not need to parse
     archives to recover requirement pressure.

7. Tests
   - Add `test:t162`.
   - Prove broad `A -> X` spans cover an interior edge.
   - Prove narrow `F -> J` spans do not cover earlier unrelated edges.
   - Prove current admitted evidence supersedes empty predecessor replay for
     the same projection.
   - Prove partial fold can satisfy test-source projection while execution
     projection remains residual.
   - Prove admitted execution evidence can still leave semantic
     test-interpretation residual when F_P rejects the relationship to
     `Req.what`.
   - Prove F_D rejects malformed carriers, duplicate ids, dangling relations,
     span drift, unknown fields, and authority-smuggling fields.
   - Prove read models expose folds, residuals, attenuation, and assurance
     claims without losing stable ids.

## Acceptance Criteria

- [ ] Product law states that ABG/GTL core owns requirement algebra as the
      substrate for obligation, evidence, fold, residual, and assurance
      projections.
- [ ] Requirements define stable requirement identity, source provenance,
      traversal spans, staged context fragments, KAOS-inspired typed relations,
      edge environments, evidence bindings, folds, residuals, attenuation, and
      query/read models.
- [ ] Design modules derive the first slice from product and requirement law,
      including carrier roles, IACS, structural carrier diagram, replay
      precedence, effect boundaries, and compatibility with existing edge
      assurance law.
- [ ] TypeScript carriers and admission cover `TraversalSpan`,
      `RequirementTerm`, `RequirementRelation`, `RequirementProjection`,
      `EdgeRequirementEnvironment`, `RequirementEvidenceBinding`,
      `RequirementTestRelation`, `RequirementFold`, `RequirementResidual`, and
      `RequirementAssuranceClaim`.
- [ ] `activeRequirements`, `buildEdgeRequirementEnvironment`,
      `projectRequirements`, `projectMaterializationTargets`,
      `routeContextConstraint`, `foldRequirementEvidence`,
      `residualizeRequirementFolds`, `classifyRequirementAttenuation`, and
      `projectAssuranceCase` are implemented as deterministic APIs over
      admitted carriers.
- [ ] Existing carried obligation refs and residual pressure refs can be
      wrapped as requirement projections without changing downstream behavior.
- [ ] Test-source materialization, execution evidence, and semantic
      requirement assurance are distinct projections and cannot close each
      other by path shape or pass status alone.
- [ ] Current admitted evidence supersedes empty or stale predecessor replay
      for the same projection.
- [ ] F_D rejects malformed carriers and authority drift, while F_P/F_H remain
      the semantic and owner-decision pressure surfaces.
- [ ] Query/read models expose active requirements, obligations,
      materialization targets, evidence bindings, folds, residuals,
      attenuation, and assurance claims.
- [ ] `build:semantic`, `lint:semantic`, `test:t162`, relevant regression
      suites, full `test:semantic`, and diff checks pass.

## Non-Goals

- Do not implement `odd_glc`.
- Do not implement T-160 recursive executive observation.
- Do not build a GUI/editor workflow.
- Do not implement ReqIF, GRL, GSN, SACM, or KAOS import/export as native
  authority in the first slice.
- Do not make ABG parse unknown product syntax to infer requirement meaning.
- Do not replace existing edge assurance contracts abruptly; bridge them
  through requirement projection refs.
- Do not split this first implementation wave into additional tickets without
  explicit operator reprice.

## Closure Note

Open. This ticket is the single active first-slice implementation ticket for
the ABG requirements algebra strategy.
