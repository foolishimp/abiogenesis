# REQ-L-GTL3-REQUIREMENTS-ALGEBRA — Requirement Declaration Wrappers

**Status**: Active - accepted by T-283 F_H closure
**Category**: Capability / Constraint
**Date**: 2026-06-26
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-L-GTL3-MODULE.md](REQ-L-GTL3-MODULE.md), [REQ-L-GTL3-GRAPHFUNCTION.md](REQ-L-GTL3-GRAPHFUNCTION.md), [REQ-L-GTL3-GRAPHVECTOR.md](REQ-L-GTL3-GRAPHVECTOR.md), [REQ-L-GTL3-CONTEXT.md](REQ-L-GTL3-CONTEXT.md), [REQ-L-GTL3-HOOKS.md](REQ-L-GTL3-HOOKS.md), [REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md](../abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md)

---

## Purpose

Define the GTL-facing declaration wrappers that let human-agent authors express
requirement identity, relations, spans, staged context, destination topology,
proof-evidence relations, and evidence policy without creating a second requirements
language beside GTL.

GTL exposes declarations. HoG traverses admitted requirement-bearing GTL
structure. ABG owns admission, replay, projection, fold, residual,
continuation, closure, and query truth.

## Acceptance Criteria

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-001**: Requirement declarations shall live under existing GTL publication and attachment surfaces such as `Module`, `GraphFunction`, `GraphVector`, `Context`, `Job`, `Role`, hook refs, and asset surfaces.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-002**: Requirement declarations shall preserve stable ids, aliases, source refs, source digests, relation refs, span refs, context refs, evidence policy refs, and projection refs.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-003**: Traversal-span declarations shall reference existing graph-function and graph-vector identity. They shall not introduce a new topology anchor, public start family, or graph-vector rival.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-004**: Authority context fragments shall remain GTL `Context`-bound or wrapper-bound constraints unless a promotion policy lawfully admits a closeable requirement term.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-005**: Destination topology declarations shall describe HOW constraint frameworks such as tenant, technology, runtime, package, deployment, proof, or regulatory topology without becoming WHAT requirement meaning.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-006**: Requirement proof-evidence relations shall keep subject-artifact projection, verifier-artifact projection, verifier-execution projection, and semantic interpretation projection distinct. Compatibility names such as test relation, test-source, or test-execution are generic proof-role spellings only; GTL shall not define product test policy.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-007**: GTL conformance gates shall fail closed for malformed requirement declarations, duplicate stable ids, dangling refs, invalid spans, unresolved graph-function/vector refs, unknown relation kinds, open payloads, and authority-smuggling fields.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-008**: DOT, diagrams, editor exports, imported goal models, ReqIF, GSN, SACM, GRL, and natural-language extraction outputs shall be read models or candidates until represented through GTL declaration law and ABG admission.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-009**: GTL declarations may reference ABG requirement algebra hooks or projection refs, but they shall not emit runtime events, write ledgers, select traversal, close assurance scopes, or own continuation/re-entry.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-010**: A GTL requirements facade shall expose declaration carriers and constructor surfaces only. It shall not admit events, write ledgers, project runtime truth, bind evidence, fold assurance, residualize pressure, select continuation, or route re-entry.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-011**: A GTL requirements lifecycle composition declaration shall carry published route refs, contract refs, symbolic bindings, and source digests. It shall not import, instantiate, or depend on ABG runtime implementation modules.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-012**: GTL requirement route refs shall be inert declaration truth until HoG reaches them and ABG resolves them against admitted route/publication authority. A GTL route ref shall not become runtime authority merely because it names an ABG route.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-013**: GTL conformance for requirement route declarations shall fail closed for unknown route refs, missing contract refs, malformed source digests, duplicate lifecycle composition refs, and any field that attempts to smuggle ABG runtime state or event authority into GTL.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-014**: GTL requirement graph declarations shall express parent/child, refinement, dependency, obstruction, mitigation, satisfaction, evidence, assurance, and proof-evidence structure through existing `RequirementTerm` declarations and typed requirement relation declarations. They shall not introduce a second KAOS, goal, decomposition, obstacle, or requirement-graph carrier kernel, and they shall not turn proof-role labels into product test policy.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-015**: GTL requirement graph conformance shall fail closed for duplicate requirement ids, duplicate relation ids, duplicate traversal span ids, dangling term relation refs, dangling term span refs, dangling relation endpoints, dangling proof-relation requirement ids, and unknown relation kinds.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-016**: GTL requirement graph declarations shall remain declaration-only. Parent/child or refinement structure may name published ABG route refs, but it shall not import ABG runtime modules, mint admitted refs, emit runtime events, project folds, residualize pressure, select continuation, or route re-entry.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-017**: GTL traversal-span declarations used by requirements algebra shall be able to declare existing frame refs, zoom refs, foldback refs, and alias refs as inert lineage refs over graph-function and graph-vector identity. They shall not introduce a rival graph topology anchor, graph-vector carrier, frame carrier, zoom carrier, foldback carrier, continuation carrier, or re-entry carrier.
