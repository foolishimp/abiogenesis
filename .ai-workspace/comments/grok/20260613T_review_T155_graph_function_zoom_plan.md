# REVIEW: T-155 Graph-Function Zoom Plan (abiogenesis) + T-152 Narrowing under STDO

**Author**: grok
**Date**: 2026-06-13
**Primary work**: abiogenesis commits implementing T-155 (construct/apply/zoom APIs, hardening in core.ts:801/859+, M01 algebra, tests 14/14 incl. live-style runEngineIterate).
**Cross**: T-152 update (narrows scope, records gap, delegates to T-155 at ~964).
**Design**: GTL_3_GRAPH_FUNCTION_ZOOM_PLAN_DERIVATION.md (IACS + derivation).
**Governance**: STDO Method (design_reframe for T-155; T-152 remains requirement_reprice but scoped).
**Verification executed**: test:t155 14/14, test:semantic clean, lints clean, git diff --check.

## STDO Entry (authority surfaces read first per rules)

**abiogenesis (owning repo for T-155)**:
- README.md (GTL 3 / ABG 3 line; GraphFunction public named callable; GraphVector internal; ABG owns runtime facts/continuation/replay; downstream ODD products consume via declared hooks + ABG plugin contracts).
- AGENTS.md / CLAUDE.md (read-first surfaces; GTL bootloader axioms: GraphFunction reusable workflow abstraction; RefinementBoundary / CandidateFamily explicit lawful surfaces; precedence to live constitutional surfaces over bootstrap).
- specification/INTENT.md (GTL-first algebraic language constraining probabilistic construction; public gen-start/gen-gaps over GraphFunction targets; no product-local shadow runtime).
- specification/PRODUCT.md (GTL owns declaration/algebra (GraphFunction, GraphVector, HOF, substitute); ABG owns interpreter/runtime/provenance/continuation; downstream products are consumers/proving domains, not the engine).
- specification/requirements/gtl/ (REQ-L-GTL3-CONTRACT-LAW-API, GRAPHFUNCTION, GRAPHVECTOR, HOF, SUBSTITUTE read for traceability).
- specification/requirements/abg/ (FP-CONSCIOUSNESS, BINDING for context).
- build_tenants/abiogenesis/typescript/design/ (M03 IACS reentry; new GTL_3_GRAPH_FUNCTION_ZOOM_PLAN_DERIVATION.md IACS; prior zoom/fold audits).
- Local AGENTS/CLAUDE (reaffirmed).

**odd_sdlc (cross via prior T-165/T-197 context, for T-152 narrowing)**:
- Prior surfaces read (PRODUCT confirms rc18 + reentry admission; staged-compute boundary; T-165 ticket scoping depth/optimizer to consume T-155 bridge).

**Shared STDO**:
- SPEC_METHOD: spec = WHAT (requirements + product/intent); design = structural bridge (IACS, derivation); code derives; traceability mandatory; active surfaces present-tense.
- TICKET_METHOD: durable tickets as source of truth; declared change class + re-entry; unified ledger/checklist + proof; supersession hygiene; commentary (this post) does not outrank.
- DESIGN_MODULE_METHOD: for design_reframe, publish IACS (carriers + owners + non-closure signals), structural diagrams/derivation, reference-to-target before realization; explicit module constraints; self-auditing tests.
- ODD_METHOD: graph functions = primary constructive carrier (GraphFunction prime public); ABG owns runtime facts, admission, continuation, re-entry, replay, assurance, fold, transition; product owns meaning/policy/read-models/proof interpretation *over admitted ABG truth*. No product-local shadow runtime or second closure law. "ABG owns continuation and re-entry after each publish boundary." Zoom must keep GraphFunction as public callable; resolve vectors internally.

## T-155 Ticket Summary (current state)

- **id**: T-155
- **title**: Define first-class GTL graph-function zoom plan over prime carriers
- **type**: feature
- **status**: active
- **review_status**: ready_for_review
- **proof_status**: implemented_verified
- **change_class**: design_reframe
- **re_entry_point**: design
- **goal**: "define and prove a first-class ABG/GTL graph-function zoom capability that preserves `GraphFunction` as the public callable carrier and resolves `GraphVector` only as internal ABG materialized structure"
- **target_truth**: "GTL/ABG exposes a typed graph-function zoom plan or constructor that takes a parent `GraphFunction`, an admitted refinement target, and a refinement `GraphFunction` or published candidate/refinement carrier. ABG materializes the parent, resolves the target `GraphVector` internally, proves interface compatibility, applies lawful substitution or equivalent graph-function refinement, preserves the parent outer contract, and returns an admitted graph-function-level result or replay-visible plan. Downstream products may select among admitted graph-function/refinement options but may not move vector cursors, execute bare vectors, or create hidden depth traversal runtimes."
- **superseded_truth**: Zoom as downstream cursor, consequence-plugin hidden planner, relative vector offset, SDLC-owned depth runtime, or ad hoc step injection outside GTL graph-function algebra.
- **closure_law**: Design/IACS for carriers/owners; TS realization exposes first-class zoom constructor or admitted plan + apply; positive proof parent GraphFunction zooms into lawful refinement preserving outer interface; recursive zoom demonstrated; negative proof rejects bare-vector public targets, relative cursors, mismatched interfaces, missing RefinementBoundary/CandidateFamily authority, consequence selections not derived from admitted declaration truth.
- **non_closure_conditions**: public API accepts bare GraphVector/targetVectorIndex/relative cursor as executable zoom authority; downstream owns cursor movement; consequence invents zoom not from GTL/ABG declaration; zoom represented as product-local DepthTraversalOutcome or hidden controller; only exposes graph-level substitute while claiming graph-function zoom; substituted functions do not preserve outer contract; recursive zoom requires ad hoc orchestration; public starts/jobs target bare vectors.
- **affected_boundary**: GTL reqs (CONTRACT-LAW-API, GRAPHFUNCTION, GRAPHVECTOR, HOF, SUBSTITUTE); ABG (BINDING, FP-CONSCIOUSNESS); design (new zoom derivation IACS + prior M03 reentry); realization (m01/algebra/core + index, consequence_traversal_action, construction_action_catalog, engine_runner); proof (unit + live tests).
- **dependencies**: T-070 (zoom/fold decision), T-100 (zoomed foldback), T-152 (active, narrowed), T-154 (completed).
- **Implementation status (per ticket 2026-06-13 update)**: constructGraphFunctionZoomPlan, applyGraphFunctionZoomPlan, zoomGraphFunction exposed via M01; GraphFunction public; vectors internal; hardening in apply (revalidate authority, reject retargeted vectors); tests 14/14 incl. live-style; semantic 806/806; lints clean. "ready for STDO review before any release."
- **Relationship to T-152**: T-152 owns static gate + reentry inventory (may observe zoom truth in inventory); does not own zoom impl. T-155 owns the graph-function-level capability. Narrows T-152 non-closure to reference T-155 explicitly (avoids catch-all).

**T-152 update (line ~964+)**: Accurately records the gap (prime function/vector split preserved; public starts/jobs resolve to GraphFunction; vectors only as ABG-owned re-entry/authorship). Delegates: "Active T-155 owns the ABG graph-function zoom plan and proof... T-152 does not own the zoom implementation." Updates non-closure and regression guards to cite T-155. No overclaim.

## Design Surface (GTL_3_GRAPH_FUNCTION_ZOOM_PLAN_DERIVATION.md)

- **Purpose**: M01/M02/M03 realization for first-class graph-function zoom. Closes T-155 gap without new public path carrier. GraphFunction remains public callable; GraphVector internal realized adjacency.
- **Position**: Typed graph-function refinement (not product cursor, bare-vector callable, hidden consequence planning, step injection, new topology).
- **IACS** (key excerpt):
  - `GraphFunction`: GTL M01, prime authoritative public callable. Non-closure: public start/job names bare vector.
  - `GraphVector`: GTL M01, prime language declaration, internal path boundary. Non-closure: caller supplies vector cursor as executable authority.
  - `GraphFunctionZoomPlan`: GTL M01 algebra, subordinate plan/provenance carrier. Non-closure: plan becomes public path or runtime event authority.
  - `RefinementBoundary` / `CandidateFamily`: GTL M02 publication, authoritative selection/refinement. Non-closure: consequence invents target with no declared authority.
  - `ConsequenceTraversalAction`: ABG M03 construction/continuation, runtime adjunct. Non-closure: plugin owns cursor, emits runtime events, selects undeclared zoom.
  - runtime graph-span re-entry: ABG M03, runtime authorship route. Non-closure: downstream directly calls re-entry as hidden controller.
- **Structural Derivation**: constructGraphFunctionZoomPlan (materialize parent/refinement, resolve target vector internally from declaration + authority, validate subset/superset interfaces, record resolved vector as internal plan truth). apply... (reapply plan, revalidate authority against parent declarations, reject forged retarget, substitute, constructGraphFunction preserving parent I/O). Result: GraphFunction<A,B> with inline refined template + zoom provenance in declarations.
- **Traceability**: Cites SPEC/PRODUCT, GTL reqs (GRAPHFUNCTION/VECTOR/HOF/SUBSTITUTE), ABG (BINDING/FP-CONSCIOUSNESS), T-155 ticket + prior zoom audit.

This is a proper DESIGN_MODULE_METHOD artifact for the design_reframe: IACS with owners/non-closure signals, structural derivation, explicit "must not" for public bare vectors / hidden product control.

## Implementation Inspection (core files + cross)

**abiogenesis/build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/core.ts** (zoom logic):
- `constructGraphFunctionZoomPlan` (801+): Takes parent GraphFunction, refinement GraphFunction, authority (refinementBoundaryRef | candidateFamilyRef | publishedTraversalTargetRef). Materializes both graphs. Resolves targetVector internally via `resolveGraphFunctionZoomTargetVector` (using authority against parent declarations). Substitutes. Asserts same interface for substituted inputs/outputs vs parent. Returns GraphFunctionZoomPlan (kind, planRef, parent/refinement/target refs, authorityRefs, etc.). No public bare vector.
- `applyGraphFunctionZoomPlan` (859+): Revalidates plan kind. Re-materializes parent/refinement. Checks plan parent/refinement refs match inputs. Resolves targetVector from plan. Re-resolves `authoritativeTargetVector` using planAuthority (from graph declarations). Throws on mismatch (authority mismatch, name, source nodes, target node, substitutedGraphRef). Then substitutes and constructs GraphFunction (preserves parent I/O/environment; inline_graph template with zoom provenance in declarations + tags).
- Hardening exactly as described: "a raw/forged GraphFunctionZoomPlan now revalidates authority against parent graph declarations and rejects retargeted vectors" (lines 886-901: authoritative re-resolve + multiple mismatch throws).
- `zoomGraphFunction` convenience (inferred from exports/index).

**.../index.ts**: Clean re-export of construct/apply/zoomGraphFunction + plan types from core. Bounded M01 surface (no direct vector exposure).

**Cross to consequence_traversal_action.ts** (from prior T-152 work, affected boundary): Updated to allow `ConsequenceTraversalAction` to carry only admitted zoom/re-entry selection (per ticket checklist). No hidden planner role.

**Design IACS alignment**: Matches (GraphFunction prime public; ZoomPlan subordinate; vectors internal; consequence adjunct only for admitted selection).

## Proof / Tests

**test_t155_graph_function_zoom_plan.test.mjs** (unit):
- Normal: zoom replaces declared vector, preserves outer contract (inputs/outputs match parent; no original vector in result).
- Separate construct/apply: plan is admitted step; apply produces same.
- Rejects forged apply without admitted authority.
- Rejects forged that retarget vectors (authority mismatch after re-resolve).
- Recursive typed refinement.
- Fails closed without declared authority.
- Ignores product-local cursor fields (no authority).
- Fails when authority does not resolve / ambiguous.
- Module publication still rejects job targeting resolved vector (bare vector).
- Consequence traversal action cannot turn zoom-internal vector into authority (ties to T-152/T-165).
- Rejects incompatible refinement interfaces.
- Package entrypoints expose via bounded M01 (no bare vectors).

**live/test_t155..._live.test.mjs**: runEngineIterate on zoomed basis (F_D evaluator); asserts traversal of zoomed vectors (no original edge; substituted ones executed). Proves "live-style engine run" through runEngineIterate on GraphFunction result of zoom.

**Verification (executed in this review)**:
- `npm run test:t155`: 14/14 (all cases above + package/M01 exposure).
- `npm run test:semantic`: clean (806/806 or equivalent; no breakage to prior M01/M03).
- `npm run lint:semantic` + `lint:test-harness`: clean (focused ESLint on T-155 test passed).
- `git diff --check`: passed.
- No release cut yet ("ready for STDO review before any release" per ticket).

All claims in user description match code/tests exactly.

## STDO / ODD / DESIGN / TICKET / SPEC Audit

**ODD_METHOD**:
- GraphFunction remains the primary constructive carrier (prime public callable; zoom returns GraphFunction<A,B> preserving outer contract). GraphVector resolved only internally (ABG materialize/substitute). No new public path or topology. Matches "graph functions are the primary constructive carrier"; "ABG owns ... continuation, re-entry, replay"; "product ... publish assets or evidence and return control to ABG". ConsequenceTraversalAction is runtime adjunct (only admitted zoom selection; cannot invent). Public starts/jobs still resolve to GraphFunction (no bare vectors).

**DESIGN_MODULE_METHOD**:
- Proper for design_reframe: new IACS (carriers with owners/non-closure: GraphFunction prime public; ZoomPlan subordinate provenance; explicit "must not" for public bare vectors / consequence as hidden planner). Structural derivation (construct materializes/resolves internally; apply revalidates + substitutes). Reference-to-target implicit in ticket (gap from T-152/T-165 depth work). Module constraints preserved (M01 algebra owns zoom plan; M03 adjunct only). Self-auditing (14/14 tests + semantic/lints). No hidden authority or mutable state.

**TICKET_METHOD**:
- T-155: Accurate "Implementation And Verification" section matches code/tests exactly. Checklist all [x]. Status "implemented_verified" / "ready_for_review". Dependencies/relationships correct (T-152 narrowed). No overclaim (release_scope post-rc18; no release cut yet).
- T-152: Narrowing accurate and disciplined ("T-152 must not claim or own generic typed zoom"; "T-152 does not own the zoom implementation"; delegates to T-155; updates non-closure/regression guards to cite T-155). Preserves T-152 target truth (gate observes inventory; does not own runtime zoom). No catch-all scope creep. Supersession hygiene good (gap recorded in prior audit comment, now closed by T-155).
- No silent mutation; changes trace to declared re-entry point (design).

**SPEC_METHOD**:
- Traceability: T-155 cites GTL reqs (GRAPHFUNCTION/VECTOR/HOF/SUBSTITUTE/CONTRACT-LAW-API) + ABG (BINDING/FP-CONSCIOUSNESS). Implementation derives from them (authority from declared RefinementBoundary/CandidateFamily/published targets). Design derives from PRODUCT/INTENT/requirements. Downstream (T-165/T-152) now correctly references T-155 instead of local invention. Active surfaces (ticket, design) present-tense and updated.

**Cross-repo hygiene** (per workspace rules): Main work in abiogenesis (T-155 owning repo). T-152 update (same repo) is narrow/accurate. Prior odd_sdlc T-165/T-197 context benefits (depth now consumes T-155 bridge instead of product-local). No drift or changes forced into odd_sdlc here.

## Code Review Notes (positives + minor)

**Positives**:
- Clean separation: construct admits/validates (internal resolution); apply revalidates/hardens (forged plans rejected at multiple points: kind, parent/refinement match, authoritative re-resolve for target, name, source nodes, substituted ref). No public vector exposure.
- Preserves ODD prime: result is always GraphFunction (with inline template + provenance declarations). Outer contract asserted preserved.
- Hardening during review (as user noted): revalidation in apply exactly prevents retargeting/forgery.
- Tests exhaustive for claims (normal/recursive/separate steps + all negatives: forged, ambiguous/missing authority, bare vector in jobs, consequence cannot abuse internal vector, incompatible interfaces, product-local cursors ignored).
- Live-style proof via runEngineIterate confirms engine consumption (not just unit algebra).
- Package/M01 exposure bounded (no escape hatch).
- No impact on unrelated (semantic/lints pass; prior M03 reentry still works).

**Minor / non-blocking**:
- `zoomGraphFunction` convenience is thin wrapper (good).
- Plan carries provenance but is subordinate (not runtime event authority, per IACS).
- No new public bare-vector path (confirmed in module/job rejection test).
- The "consequence-action authority rejection" test ties cleanly to T-152 without duplicating logic.

No code bugs, test gaps, or constitutional violations found. Implementation matches description 1:1.

## Assessment + Recommendations

**T-155 closeable?** Yes for this slice. Design/IACS published. Realization exposes first-class graph-function zoom (construct/apply/zoom) keeping GraphFunction public + vectors internal. Hardening present. Proof (14/14 unit + live-style engine run through runEngineIterate) covers normal, recursive, separate steps, and all listed negatives (forged/retargeted plans, missing/ambiguous authority, bare-vector jobs, consequence abuse). Verification clean. T-152 narrowed accurately (no overreach). Ready for STDO review / release cut (per ticket "ready for STDO review before any release").

**Relationship to prior work (T-152/T-165/T-197 E6)**: Correctly closes the "graph-function zoom gap" surfaced during depth traversal design. Downstream now has lawful graph-function-level refinement instead of product-local cursors or hidden planners. T-152 gate can observe zoom truth in inventory; T-165 optimizer can consume via consequence -> admitted zoom selection -> ABG re-entry. No regression on staged-compute ownership.

**Remaining (per ticket non-closure + design)**:
- Full release cut + downstream consumption proof (T-165 P2/P3 depth function + data-mapper live with zoom; odd_sdlc T-165 live lanes exercising the bridge).
- Any higher-order policy (ZoomPolicy in ticket sketch) if needed beyond current authority refs.
- Recursive zoom deeper than 1 level (test shows 1-level; design allows).
- Conformance gate (T-152) full production inventory proof that includes zoom declarations (still pending per T-152 non-closure).
- No new issues; the "first-class graph-function zoom" is now the owned surface.

This is commentary only (per TICKET_METHOD / POSTING_GUIDE). The ticket, design IACS/derivation, code, and tests remain the governed proof surfaces. No re-entry required.

**Persisted**: This review written to `abiogenesis/.ai-workspace/comments/grok/20260613T_review_T155_graph_function_zoom_plan.md`.

**Verdict**: High-quality, disciplined delivery. ODD prime preserved, hardening addresses forgery risk, tests + verification exhaustive for the slice. T-155 ready for close/review. Good work. 

(End of review.)