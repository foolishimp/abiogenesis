# REVIEW: Canonical GTL Type Boundary — PRODUCT.md and LLM_GTL_APP_BUILDER_GUIDE.md Constitutional Revision

**Author**: claude
**Date**: 2026-05-14T01:00:00Z
**Addresses**:
- pending `specification/PRODUCT.md` diff adding §"Canonical GTL Type Boundary" (L73-102 in working tree)
- pending `docs/LLM_GTL_APP_BUILDER_GUIDE.md` diff updating Axiomatic Substrate table (L77-82) and adding precedence-of-truth note (L34-36) and downstream-vocabulary prohibition (L123-126)
**Status**: Open

## Summary

The additions are substantively good: explicit Node/GraphVector/GraphFunction boundary statements, a precedence-of-truth declaration in the Builder Guide, and a sharp Node-vs-GraphFunction asset-surface clarification. The load-bearing concern is F6 below — the headline "Canonical GTL Type Boundary" narrows a 12-type first-class declaration surface to 6 without naming what happens to the other 6, and that contradicts the installed `GTL_BOOTLOADER` / `CLAUDE.md` substrate. Do not commit until F6 is resolved.

## Verified primary sources

| Boundary claim in new PRODUCT.md row | Verified at |
| --- | --- |
| Node is local locus + schema + markov + asset_surface | `REQ-L-GTL3-NODE.md` L17-37 |
| GraphVector is "internal adjacency record... not a rival public ontology, not a public callable carrier, and not a semantic job target" | `REQ-L-GTL3-GRAPHVECTOR-002` (near-verbatim) |
| GraphFunction is "sole public named callable workflow carrier" | `REQ-L-GTL3-GRAPHFUNCTION-002` |
| GraphFunction "distinct from the materialized Graph... not the runtime attempt or the downstream domain asset" | `REQ-L-GTL3-GRAPHFUNCTION-019` |
| Job does not target bare GraphVector | `REQ-L-GTL3-JOB-010` (verbatim) |
| Public execution enters through GraphFunction bound by Job | `REQ-R-ABG3-INTERPRET-002` |

All five cited requirements actually back the corresponding row of the new table. The anchoring is real.

## Findings

### F1. `PRODUCT.md:98-100` — "derives from" list omits `REQ-L-GTL3-GRAPH` and `REQ-L-GTL3-MODULE`

The section's table has Graph and Module rows; the citation list cites only Node/GraphVector/GraphFunction/Job + ABG-INTERPRET. Add both `REQ-L-GTL3-GRAPH` and `REQ-L-GTL3-MODULE` for completeness.

### F2. `PRODUCT.md:86` — Node row introduces "invariant state" that isn't in `REQ-L-GTL3-NODE`

Row says "Typed local locus of graph meaning, **invariant state**, markov conditions, and optional asset-surface declaration." `REQ-L-GTL3-NODE-002` names "declared schema/type and declared markov conditions." "Invariant state" looks like phrase migration from GraphVector ("invariant traversal boundary") onto Node. Either land it in REQ-L-GTL3-NODE or drop the phrase to keep the row faithful to spec.

### F3. `PRODUCT.md:90` vs `LLM_GTL_APP_BUILDER_GUIDE.md:82` — Module row drift between the two new surfaces

- PRODUCT.md: Module is the publication boundary for "graphs, graph functions, jobs, roles, and **policy surfaces**."
- Builder Guide: "graphs, graph functions, jobs, roles, and **selection surfaces**."
- `REQ-L-GTL3-MODULE-001`: Module shall own "graphs, graph functions, refinement boundaries, candidate families, jobs, roles, operators, evaluators, rules, imports, and metadata."

Two constitutional surfaces, two different list endings, neither matching the spec enumeration. Pick one canonical phrasing and use it in both. "Policy surfaces" matches `REQ-L-GTL3-MODULE-006` (`policy_hooks`). "Selection surfaces" does not match anything specifically named in the spec.

### F4. `PRODUCT.md:87` — GraphVector row drops dispatch intent / escalation / proof from the spec list

Row says vectors carry "evaluators, hooks, closure, and edge assurance." `REQ-L-GTL3-GRAPHVECTOR-006` enumerates "invariant transition description, dispatch intent, evaluation policy, escalation policy, deterministic proof surfaces, closure contract, assurance hook references, other hook references, and opaque hook configuration." Either end the row with "etc." so it reads as illustrative, or expand to match the spec enumeration.

### F5. `LLM_GTL_APP_BUILDER_GUIDE.md:123-126` — prohibition lists only 4 terms

"Downstream terms such as graph overlay, leaf, workflow lane, and app surface are not canonical GTL type names." If the intent is *any* non-canonical term, phrase generically ("Downstream terms — graph overlay, leaf, workflow lane, app surface, etc. — ..."). As written, a reader could conclude only these four are demoted.

### F6. `PRODUCT.md:76-82` — headline framing contradicts the installed GTL Bootloader / CLAUDE.md substrate

> "The canonical GTL product vocabulary is `Graph`, `Node`, `GraphVector`, `GraphFunction`, `Job`, and `Module`."

The installed `GTL_BOOTLOADER` / `CLAUDE.md` substrate enumerates **12** first-class structural axioms in §2 (Graph, Node, GraphVector, Context, Operator, Evaluator, Rule, GraphFunction, RefinementBoundary, CandidateFamily, Module, Job) plus Role in §2 axiom 12, plus a 14-row §3 GTL Type Surface table over `gtl.graph`, `gtl.operator_model`, `gtl.function_model`, `gtl.work_model`, `gtl.module_model`.

The 7 declaration types not in the new PRODUCT.md section are all backed by live `REQ-L-GTL3-*` clauses in the spec tree:

- `REQ-L-GTL3-CONTEXT.md`
- `REQ-L-GTL3-OPERATOR.md`
- `REQ-L-GTL3-EVALUATOR.md`
- `REQ-L-GTL3-RULE.md`
- `REQ-L-GTL3-ROLE.md`
- `REQ-L-GTL3-SYNTHESIS.md` (RefinementBoundary / CandidateFamily)

Three reconciliation paths, in order of preference:

1. **Rename and reframe.** Title the section "Canonical GTL Topology Anchors" and open with:

   > "The canonical GTL **topology-anchoring** types are Graph, Node, GraphVector, GraphFunction, Job, and Module. Operator, Evaluator, Rule, Context, RefinementBoundary, CandidateFamily, and Role remain first-class GTL declarations attached to these anchors per `REQ-L-GTL3-LAWS` / `REQ-L-GTL3-LANGUAGE`."

   This preserves both the new prohibition on overlay/leaf/lane/app-surface drift and the existing first-class type surface.

2. **Promote the 7 secondary types into the table.** Add rows for Operator, Evaluator, Rule, Context, RefinementBoundary, CandidateFamily, Role. Keeps the "canonical" framing while listing all first-class types truthfully.

3. **Update Bootloader + CLAUDE.md + Type Surface table to match the 6-type subset.** Wrong direction — Role/Evaluator/Operator are not derivable from the 6 anchors; they are first-class GTL declarations the substrate explicitly publishes via `REQ-L-GTL3-ROLE`, `REQ-L-GTL3-EVALUATOR`, `REQ-L-GTL3-OPERATOR`.

Without one of these, any reader cross-referencing PRODUCT.md against the installed bootstrap will see a constitutional contradiction. Per `CLAUDE.md` §LLM Operating Rule and the new Builder Guide L34-36 elevation, PRODUCT.md wins over the bootloader — so the bootloader has to follow PRODUCT.md, but the bootloader's 12 structural axioms are themselves derived from the spec. The resolution must therefore happen in PRODUCT.md, not the bootloader.

### F7. `LLM_GTL_APP_BUILDER_GUIDE.md:34-36` — precedence-of-truth paragraph is the right move

> "This guide is secondary truth beneath `specification/PRODUCT.md` and the live requirement surface. If this guide conflicts with product or requirement law, repair this guide; do not reinterpret the product from the compressed guide."

Keep verbatim. This is exactly the bootstrap-is-read-model framing `CLAUDE.md` §1 already commits to.

### F8. `PRODUCT.md:92-96` — Node-vs-GraphFunction asset-surface clarification is excellent

> "A node may describe an asset surface that contains graph-function-related data, such as a catalog, selector, or declaration file. That does not make the node a `GraphFunction`. Public execution enters through published graph-function carriers bound by jobs. ABG executes the call by advancing the realized internal `GraphVector` boundaries beneath that carrier."

Keep verbatim. This directly closes a real failure mode — a node whose `asset_surface` declaration names a catalog of graph-function data getting read as if the node itself were callable. Earns the new section its weight.

### F9. Active-surface discipline

Both files lead with present-tense law and avoid migration narrative. The Builder Guide note "Use them only as product-local vocabulary, then bind them back..." reads as an operating rule, not a history. Per active-surface writing discipline, this is right.

## Recommended Action

1. **Resolve F6 before commit.** Pick path 1 (recommended), 2, or 3. Without resolution the new section contradicts the live bootstrap and weakens the "PRODUCT.md is supreme" elevation that Builder Guide L34-36 establishes.
2. Apply F1 (add `REQ-L-GTL3-GRAPH` and `REQ-L-GTL3-MODULE` citations), F2 (drop or land "invariant state"), F3 (reconcile policy-surfaces vs selection-surfaces phrasing), F4 (illustrative-vs-canonical GraphVector enumeration), F5 (generalize the downstream-vocabulary prohibition).
3. F7 and F8 land as-is.

Once F6 is resolved, propagate the canonical-list resolution into the installed bootstrap so PRODUCT.md and the bootloader mirror each other:

- `docs/standards/GTL_BOOTLOADER.md` (if present at that path) §2 Structural Axioms and §3 GTL Type Surface
- `/Users/jim/src/apps/abiogenesis/CLAUDE.md` §2 Structural Axioms and §3 GTL Type Surface
