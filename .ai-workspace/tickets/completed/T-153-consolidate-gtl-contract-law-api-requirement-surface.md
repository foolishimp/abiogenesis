---
id: T-153
title: Consolidate GTL contract-law API requirement surface
type: feature
ticket_category: ordinary
status: completed
proof_status: passed
goal: create a single reloadable constitutional GTL requirement surface and PRODUCT.md anchor set that states GTL as the contract-law API and graph algebra for deterministic integrations, then use that surface to audit GTL, ABG, and downstream consumers for hidden or duplicated contract truth
change_class: requirement_reprice
change_intent: Make GTL capability, algebra, contract definition, and admission boundaries reviewable from one REQ-level source of truth instead of requiring reviewers to reconstruct them from scattered GTL requirement files, ABG implementation tickets, SDLC target-carrier code, prompt asset code, or prior conversation memory.
re_entry_point: requirements
created_at: 2026-06-08
updated_at: 2026-06-08
completed_at: 2026-06-08
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/gtl/README.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE.md
  - specification/requirements/gtl/REQ-L-GTL3-ATTRS.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPH.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-RULE.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPOSE.md
  - specification/requirements/gtl/REQ-L-GTL3-SUBSTITUTE.md
  - specification/requirements/gtl/REQ-L-GTL3-RECURSE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOF.md
  - specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md
  - specification/requirements/gtl/REQ-L-GTL3-SUBWORK.md
  - specification/requirements/gtl/REQ-L-GTL3-SYNTHESIS.md
  - specification/requirements/gtl/REQ-L-GTL3-MODULE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-JOB.md
  - specification/requirements/gtl/REQ-L-GTL3-ROLE.md
  - specification/requirements/gtl/REQ-L-GTL3-IDENTITY.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-GRAPHCALL.md
  - specification/requirements/abg/REQ-R-ABG3-FRAME.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-LINEAGE.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-JOB-WORKER.md
  - specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md
  - .ai-workspace/tickets/active/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-184-partition-handoff-into-compute-stage-boundary-modules.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-194-migrate-typescript-tenant-to-abg-4-0-0-rc-3.md
affected_boundary:
  product:
    - specification/PRODUCT.md
  requirements:
    - specification/requirements/gtl/README.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts
  downstream_audit:
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/graph/target_carrier_contracts.ts
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/component_depth_register.ts
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/prompt_assets.ts
target_truth: GTL is the published contract-law API and graph algebra. It is complete enough as a language to configure every product-visible graph-program element that ABG admits or interprets, including typed graph program carriers, graph algebra, Operator/Evaluator/Rule declarations, F_D/F_P/F_H composition through abg.fn_composition, recursive graph functions, selection/refinement/synthesis/sub-work carriers, hook declarations, asset-surface declarations, target-carrier contract law, prompt construction contract law, plugin/ABG boundary declarations, module/job/public-start binding, and external tool gates. ABG interprets and admits GTL programs; downstream products consume GTL contract definitions and must not hide equivalent contract law in local parsers, prompt prose, wrappers, or test-only inventories.
superseded_truth: GTL capability is discoverable only by reading many scattered requirement files plus ABG/SDLC implementation details; downstream products may treat local target-carrier parsers, prompt formats, or plugin wrappers as their own contract law; ABG conformance may certify a lossy inventory that omits the GTL contract fields actually used at runtime.
closure_law: This ticket closes only when there is a single REQ-level GTL contract-law API anchor, PRODUCT.md points to it as the fast context reload surface, T-152 consumes or references it for program conformance, the reload anchor indexes all live GTL declaration families and the ABG runtime-operation families needed for product-visible configuration, and an audit checklist classifies each known GTL/ABG/SDLC contract definition as either GTL-owned language law, ABG-owned admission/interpreter/runtime law, or downstream product-owned meaning.
non_closure_conditions:
  - PRODUCT.md still requires reconstructing GTL contract-law capability from scattered prose
  - the new REQ surface duplicates detailed GTL requirements without indexing or anchoring them
  - the new REQ omits live GTL declaration families such as attrs, context, operator, evaluator, rule, identity, selection boundary, sub-work, or synthesis
  - the new REQ omits the ABG runtime-operation families needed to distinguish GTL Operator declarations from ABG runtime operations
  - target-carrier contract law, prompt asset contract law, plugin boundary law, F_* composition law, recursive graph-function law, or graph algebra law remain hidden only in implementation code
  - ABG `typecheckGtlProgram(...)` can pass an inventory that omits GTL contract declaration fields used by downstream runtime admission
  - downstream SDLC keeps local parser/admission law that is not traceable to a GTL contract definition or ABG admission surface
review_gate: high-bar review of Product.md anchors, REQ traceability, and at least one downstream SDLC audit pass
---

# T-153: Consolidate GTL Contract-Law API Requirement Surface

## Intake Triage

Smallest lawful re-entry point: `requirement_reprice`.

The current defect is not only a parser bug or an SDLC migration gap. The
reviewer cannot quickly reload the constitutional GTL capability model. GTL
already has strong types and graph algebra, but the practical contract-law
meaning is spread across detailed requirement files, ABG conformance code,
target-carrier contracts, prompt asset surfaces, and downstream SDLC handoff
code.

The next lawful move is a REQ-level consolidation surface. It must not replace
the detailed GTL requirements. It must index them, state their product role, and
make the contract-law API boundary explicit enough that future work can be
audited outward from one source.

Additional 2026-06-08 triage: the reload surface must do more than say GTL is
an index. GTL now needs to be complete enough as a language to configure every
product-visible graph-program element ABG admits or interprets. That includes
`F_D`/`F_P`/`F_H` compute composition, recursive graph-function declaration,
operator/evaluator/rule declarations, prompt construction, plugin/hook
contracts, selection/refinement/synthesis carriers, public starts, and external
tool gates. ABG runtime operations remain ABG-owned, but any product-visible
configuration for those operations must trace to GTL declarations or ABG
admission over GTL declarations.

## Prime Law

GTL is the contract-law API and graph algebra.

ABG is the interpreter/admission/runtime truth substrate for GTL.

Downstream products consume GTL and ABG. They may own domain meaning and
product acceptance interpretation, but they must not create a second GTL
contract language in local parser code, prompt prose, or inventory tests.

## Required Product.md Anchors

Add a compact, high-signal section to `specification/PRODUCT.md` that names the
fast reload surface:

- `REQ-L-GTL3-CONTRACT-LAW-API.md` is the constitutional GTL reload anchor.
- GTL owns graph algebra, typed graph program declarations, contract
  declarations, operator/evaluator/rule declarations, recursive graph-function
  declaration, hook declarations, target-carrier contract definitions, prompt
  asset interfaces, plugin boundary declarations, selected `F_*` compute
  composition, and deterministic integration contract shape.
- ABG owns admission, interpretation, runtime events, payload ledgers,
  assurance fold, traversal transition, continuation, correction, and replay.
- Downstream products must feed their GTL program inventory into ABG admission
  and must not replace GTL contract law with product-local parser or wrapper
  law.
- Product.md must distinguish GTL `Operator` declarations from ABG runtime
  operation families such as start, graph call, frame opening, iteration,
  traversal selection, retry, continuation, correction, replay, payload
  admission, worker binding, transport, projection, assurance, and
  saga/frontier control.
- Product.md must keep the reload anchor near the existing GTL product identity,
  canonical topology anchors, GTL/ABG boundary, and product-layer ownership
  sections so reviewers can reload the model without scanning the full
  requirement tree first.

## Required REQ Surface

Create `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`.

It must be an index and consolidation surface, not a parallel constitution. It
must contain:

- GTL contract-law API definition: GTL is the known programmatic contract
  language for graph-native deterministic integrations; MCP or other external
  tools may be gated by GTL later, but they are not the source of GTL truth.
- Graph algebra definition and references to the detailed algebra laws:
  `edge`, `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`,
  `promote`, `identity`, and `same_object`, with host-language API spellings
  such as `sameObject` treated as implementation syntax over the same law.
- Selection, refinement, synthesis, and publication carriers:
  `RefinementBoundary`, `CandidateFamily`, selection boundaries, sub-work,
  synthesis declarations, and single-vector graph-function publication helpers.
- `F_*` composition syntax and trace:
  `abg.fn_composition`, `fn<A, B>.C`, `transform.C`, `evaluate.C`,
  `consequence.C`, `evaluate.C.F_D.register_rule[*]`,
  `evaluate.C.F_P.semantic_judgment_rule[*]`, and `F_H` as external
  `human_callout`.
- Recursive graph-function reload row:
  `recurse(graph_function, termination, foldback)` with explicit termination,
  foldback, lineage, bounds, preserved outer interface, detailed REQ pointer,
  constructor/API pointer, static admission owner, runtime owner, and proof
  test pointer.
- Contract declaration classes:
  - graph function interface law
  - graph vector identity and target law
  - operator/evaluator/rule declaration law
  - target-carrier contract law
  - selected compute-composition law
  - hook/plugin boundary law
  - prompt/AssetSurface law
  - module publication law
  - public start/job binding law
- Owner split:
  - GTL owns declarations and algebra
  - ABG owns admission/interpreter/runtime truth
  - downstream products own domain meaning and product read-models
- One-truth rule: implementation parsers may admit concrete syntax only when
  traceable to a GTL contract declaration or ABG admission function.
- Reload checklist for agents and reviewers.

## Proposed REQ Shape

The new requirement should stay short and index-like:

- `REQ-L-GTL3-CONTRACT-LAW-API-001`: GTL shall be the constitutional
  contract-law API for graph-native workflow programs.
- `REQ-L-GTL3-CONTRACT-LAW-API-002`: GTL shall expose graph algebra as
  inspectable program law, not hidden orchestration code.
- `REQ-L-GTL3-CONTRACT-LAW-API-003`: GTL contract definitions shall include
  the declarations required to admit target-carrier contracts, prompt asset
  views, hook/plugin boundaries, module publication, and public job or graph
  function starts.
- `REQ-L-GTL3-CONTRACT-LAW-API-004`: GTL shall expose selection, refinement,
  synthesis, sub-work, and publication carriers as first-class language
  configuration surfaces rather than hidden orchestration.
- `REQ-L-GTL3-CONTRACT-LAW-API-005`: GTL shall make selected `F_D`, `F_P`, and
  `F_H` composition law configurable through `abg.fn_composition` and compute
  notation.
- `REQ-L-GTL3-CONTRACT-LAW-API-006`: GTL shall allow recursive graph-function
  creation through declared termination, foldback, lineage, bounds, and
  preserved outer interface.
- `REQ-L-GTL3-CONTRACT-LAW-API-007`: GTL shall be complete enough to configure
  ABG-visible plugin and hook boundaries.
- `REQ-L-GTL3-CONTRACT-LAW-API-008`: GTL shall be complete enough to configure
  prompt construction and typed asset surfaces.
- `REQ-L-GTL3-CONTRACT-LAW-API-009`: ABG program admission shall typecheck
  downstream GTL program inventory against the GTL contract-law API before
  runtime traversal.
- `REQ-L-GTL3-CONTRACT-LAW-API-010`: ABG program admission shall fail closed
  for empty, partial, identity-ambiguous, unreachable, algebra-incomplete,
  composition-incomplete, prompt-incomplete, hook-incomplete, or lossy program
  inventories.
- `REQ-L-GTL3-CONTRACT-LAW-API-011`: Target-carrier rows shall carry visible
  contract declaration fields required by runtime admission and replay.
- `REQ-L-GTL3-CONTRACT-LAW-API-012`: Downstream products shall not create
  second contract-law surfaces in local parsers, prompt prose, plugin wrappers,
  or test-only inventory construction.
- `REQ-L-GTL3-CONTRACT-LAW-API-013`: Every concrete syntax carrier accepted by
  an implementation shall trace to either a GTL contract declaration or an ABG
  admission function.
- `REQ-L-GTL3-CONTRACT-LAW-API-014`: External tool surfaces may be gated by
  GTL/ABG admission, but they shall not become GTL contract-law source.
- `REQ-L-GTL3-CONTRACT-LAW-API-015`: Product and GTL README surfaces shall
  identify the REQ as the fast reload surface.

## Sole-Source Audit Map

| Surface | Sole source | Consumer check |
| --- | --- | --- |
| Graph algebra | GTL requirements and GTL constructors | ABG `typecheckGtlProgram(...)` rejects untyped or non-derived graph/vector rows. |
| Operator/evaluator/rule declarations | GTL Operator, Evaluator, Rule, GraphVector, and Module requirements | ABG plugin/binding admission resolves executable refs without making local wrappers language truth. |
| `F_*` compute composition | GTL Hooks and Compute Notation plus ABG FN Composition | ABG admits selected composition, payloads, ledgers, assurance, traversal, closure, and replay through one runtime truth path. |
| Recursive graph functions | GTL Recurse, HOF, Laws, and GraphFunction requirements | Recursion preserves outer interface, exposes termination/foldback/lineage/bounds, and is interpreted by ABG rather than hidden controller code. |
| Selection/refinement/synthesis/sub-work | GTL Selection Boundary, Synthesis, Subwork, RefinementBoundary, and CandidateFamily requirements | ABG may enumerate or admit candidates but does not silently select product strategy. |
| Target-carrier contract fields | GTL contract-law API plus detailed graph-vector and asset-surface requirements | ABG conformance input requires full carrier contract declarations rather than lossy summaries. |
| Prompt construction assets | GTL AssetSurface requirements | Prompt renderers remain views over admitted typed assets. |
| Plugin and hook boundaries | GTL hook declarations plus ABG plugin admission | Plugins provide inputs; ABG owns events, ledgers, fold, transition, and replay. |
| ABG runtime operation configuration | GTL language declarations plus ABG runtime-operation requirements | Product-visible configuration for start/run/frame/iteration/retry/continuation/correction/replay/payload/worker/transport/projection/assurance/frontier traces to GTL or ABG admission. |
| Handoff modules | GTL target-carrier law plus ABG admission | SDLC T-184 partitions handoff code without inventing product-local contract law. |
| Product read models | Downstream product specification | Downstream surfaces interpret admitted facts without redefining GTL or ABG. |

## Audit Checklist

- [x] `PRODUCT.md` has a named GTL reload anchor and points to the new REQ.
- [x] `requirements/gtl/README.md` indexes the new REQ as the contract-law API
  entrypoint.
- [x] The new REQ references all detailed GTL requirement files it depends on.
- [x] The new REQ indexes all live GTL declaration families present in
  `requirements/gtl/README.md`, including attrs, context, operator, evaluator,
  rule, identity, selection-boundary, sub-work, and synthesis.
- [x] The new REQ distinguishes GTL `Operator` declarations from ABG runtime
  operation families.
- [x] The new REQ includes a capability router for graph algebra, operators,
  `F_*` composition, recursive graph functions, selection/refinement/synthesis,
  prompt assets, public starts, and external tool gates.
- [x] The new REQ includes a recursive graph-function reload row covering
  surface, required fields, detailed REQ, runtime owner, and proof surface.
- [x] The new REQ states GTL as deterministic integration contract law, tighter
  than MCP because the contract declarations are already known to the program.
- [x] The new REQ states that MCP can be gated by GTL later, but MCP is not the
  constitutional source of GTL contract law.
- [x] T-152 `typecheckGtlProgram(...)` references the new REQ for program
  conformance scope.
- [x] T-152 target-carrier input rows carry the GTL contract declaration fields
  needed by downstream admission, not a lossy row summary.
- [x] SDLC T-184 classifies handoff contract definitions by owner:
  GTL-declared, ABG-admitted, or downstream product meaning.
- [x] SDLC component-depth register syntax and target-carrier envelope law are
  traceable to GTL target-carrier contract law or explicitly filed as a GTL gap.
- [x] Prompt construction assets are traceable to GTL AssetSurface and not to an
  SDLC-local prompt schema clone.
- [x] Plugin contracts are traceable to GTL/ABG boundary declarations and not to
  local wrapper convention.
- [x] No retired or legacy layer is added; the ticket uses current truth surfaces
  and exposes hidden contract law instead of preserving it locally.
- [x] Stale root README, AGENTS, and CLAUDE bootloader references no longer
  duplicate old GTL algebra or old RC identity.
- [x] Live requirement wording no longer uses ambiguous source wording where
  conformance, interface fit, or rejected alternate keying is the actual law.

## Implementation Update - 2026-06-08

Completed the first requirement-reprice slice:

- Created `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md` as
  the fast reload and index surface for GTL contract-law API review.
- Added a `PRODUCT.md` anchor that states GTL owns contract declarations and
  graph algebra, ABG owns admission/runtime truth, and downstream products own
  domain meaning over admitted facts.
- Indexed the new REQ from `specification/requirements/gtl/README.md`.
- Linked T-152 to the new requirement home for ABG program conformance scope.

Completed the language-completeness revision after self-review and external
review feedback:

- Expanded the REQ indexed families to cover every live GTL family from
  `requirements/gtl/README.md`.
- Added an explicit principle that GTL must be complete enough as a language to
  configure every product-visible graph-program element ABG admits or
  interprets.
- Split graph algebra operations from selection/refinement/synthesis/publication
  carriers so `RefinementBoundary` and `CandidateFamily` are not misclassified
  as core algebra operators.
- Added `F_D`/`F_P`/`F_H` composition syntax, recursive graph-function
  declaration law, plugin/hook configuration, prompt construction, public
  starts, external tool gates, and ABG runtime-operation configuration to the
  reload surface.
- Updated T-152 downstream proof pointers from the historical odd_sdlc rc.1
  ticket to the completed rc.3 migration ticket.
- Updated repo entry and bootloader read models to defer to
  `REQ-L-GTL3-CONTRACT-LAW-API.md`, name the current TypeScript RC3 release
  line, remove stale `deferred_refinement` / `candidate_family` algebra entries,
  and classify `RefinementBoundary` / `CandidateFamily` as first-class
  selection/publication carriers instead of core algebra operators.
- Updated common design module, current docs, user guide, LLM builder guide,
  and TypeScript design surfaces so they no longer present old RC identity,
  old algebra classification, or adapter/conformance wording as live authority.
- Reworded live requirement surfaces so conformance, interface fit, and rejected
  alternate keying are stated directly instead of relying on ambiguous source
  wording.

Triage status: close-ready for T-153. The constitutional reload surface exists,
and the downstream outward audit now classifies SDLC T-184 prompt, plugin,
component-depth, handoff, and target-carrier surfaces by GTL, ABG, or
downstream-product ownership. T-184 remains active for its broader handoff
partition closure, but the T-153 outward-audit requirement is satisfied.

## Outward Gap-Finding Plan

1. Consolidate the GTL REQ reload anchor.
2. Add `PRODUCT.md` and `requirements/gtl/README.md` references.
3. Re-run T-152 against the new requirement scope.
4. Audit SDLC T-184 handoff and target-carrier surfaces against the GTL reload
   anchor.
5. File or fix each gap in the owning layer:
   - GTL requirement gap
   - ABG typecheck/admission gap
   - SDLC downstream-consumption gap

## Acceptance Evidence

Required before close:

- `npm run build:semantic`
- focused GTL requirement/reference review
- `npm run test:t150`
- T-152 conformance tests proving lossy target-carrier rows fail
- downstream SDLC T-194 or successor conformance proof consuming the ABG gate
  with full GTL contract rows

## Proof Evidence - 2026-06-08

Observed after creating the REQ/Product reload surface:

- `npm run test:t150` passed 24/24.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed 745/745.
- `git diff --check` passed.
- Active edited Product/REQ/ticket surfaces contain no retired bridge-wording
  markers from the rejected vocabulary.

Closure remained pending until the SDLC T-184 outward audit classified prompt,
plugin, component-depth, handoff, and target-carrier surfaces against the new
GTL contract-law API anchor. That audit now exists in SDLC T-184 under
`T-153 Contract-Law Owner Classification`.

Observed after the language-completeness revision:

- Mechanical REQ coverage check found no live GTL requirement family omitted
  from `REQ-L-GTL3-CONTRACT-LAW-API.md`.
- Mechanical ABG file check found every ABG runtime-operation requirement named
  by the REQ exists under `specification/requirements/abg/`.
- Scan over edited Product/REQ/README/T-153/T-152 surfaces found no retired
  source-wording markers and no current odd_sdlc rc.1 T-194 pointer.
- `git diff --check` passed.
- `npm run lint:semantic` passed.
- `npm run test:t150` passed 24/24.

Observed after stale-reference cleanup:

- Root `README.md` points to `@abiogenesis/typescript-tenant` `4.0.0-rc.4`
  and to `REQ-L-GTL3-CONTRACT-LAW-API.md`.
- `AGENTS.md` and `CLAUDE.md` identify their bootloader text as a compressed
  read model and point at the new GTL contract-law REQ for authority.
- `AGENTS.md` and `CLAUDE.md` no longer list `deferred_refinement` or
  `candidate_family` as core graph algebra operations.
- Current docs and TypeScript design surfaces no longer describe
  `publicStart(...)` as an old-route preservation surface; they describe it as
  a subordinate adapter over the canonical start path.

Observed after the downstream outward-audit completion:

- SDLC T-184 now carries `T-153 Contract-Law Owner Classification`, classifying
  graph/vector, target-carrier, component-depth, prompt asset, plugin, and
  handoff/module partition surfaces by owner.
- `SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE` names component-depth as a
  downstream product read model over GTL target-carrier family/envelope law.
- `admitComponentDepthRegisterFromArtifact(...)` rejects component-depth
  target-carrier envelopes with product-local wrapper contract refs.
- SDLC T-194 now supplies full production target-carrier contract fields to
  ABG `typecheckGtlProgram(...)` rather than reduced edge/target summaries.
- `npm run build:semantic` passed in
  `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`.
- `node --test test_env/tests/test_t113_component_depth_register_admission.test.mjs`
  passed 12/12.
- `node --test test_env/tests/test_t184_handoff_partition_boundary.test.mjs`
  passed 21/21.
- `node --test test_env/tests/test_t194_gtl_program_conformance.test.mjs`
  passed 3/3.
- ABG `npm run test:t150` passed 24/24, including the T-152 lossy
  target-carrier row, malformed raw input, plugin authority, prompt asset, and
  evidence-bound report identity checks.
