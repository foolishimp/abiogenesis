# REQ-L-GTL3-REQUIREMENTS-ALGEBRA — Requirement Declaration Wrappers

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-06-26
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-L-GTL3-MODULE.md](REQ-L-GTL3-MODULE.md), [REQ-L-GTL3-GRAPHFUNCTION.md](REQ-L-GTL3-GRAPHFUNCTION.md), [REQ-L-GTL3-GRAPHVECTOR.md](REQ-L-GTL3-GRAPHVECTOR.md), [REQ-L-GTL3-CONTEXT.md](REQ-L-GTL3-CONTEXT.md), [REQ-L-GTL3-HOOKS.md](REQ-L-GTL3-HOOKS.md), [REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md](../abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md)

---

## Purpose

Define the GTL-facing declaration wrappers that let human-agent authors express
requirement identity, relations, spans, staged context, destination topology,
test relations, and evidence policy without creating a second requirements
language beside GTL.

GTL exposes declarations. ABG owns admission, replay, projection, fold,
residual, continuation, closure, and query truth.

## Acceptance Criteria

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-001**: Requirement declarations shall live under existing GTL publication and attachment surfaces such as `Module`, `GraphFunction`, `GraphVector`, `Context`, `Job`, `Role`, hook refs, and asset surfaces.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-002**: Requirement declarations shall preserve stable ids, aliases, source refs, source digests, relation refs, span refs, context refs, evidence policy refs, and projection refs.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-003**: Traversal-span declarations shall reference existing graph-function and graph-vector identity. They shall not introduce a new topology anchor, public start family, or graph-vector rival.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-004**: Authority context fragments shall remain GTL `Context`-bound or wrapper-bound constraints unless a promotion policy lawfully admits a closeable requirement term.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-005**: Destination topology declarations shall describe HOW constraint frameworks such as tenant, technology, runtime, package, deployment, proof, or regulatory topology without becoming WHAT requirement meaning.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-006**: Requirement test relations shall keep asset projection, test-source projection, test-execution projection, and semantic interpretation projection distinct.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-007**: GTL conformance gates shall fail closed for malformed requirement declarations, duplicate stable ids, dangling refs, invalid spans, unresolved graph-function/vector refs, unknown relation kinds, open payloads, and authority-smuggling fields.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-008**: DOT, diagrams, editor exports, imported goal models, ReqIF, GSN, SACM, GRL, and natural-language extraction outputs shall be read models or candidates until represented through GTL declaration law and ABG admission.

**REQ-L-GTL3-REQUIREMENTS-ALGEBRA-009**: GTL declarations may reference ABG requirement algebra hooks or projection refs, but they shall not emit runtime events, write ledgers, select traversal, close assurance scopes, or own continuation/re-entry.

