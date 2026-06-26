# REQ-R-ABG3-REQUIREMENTS-ALGEBRA — Requirements Algebra Substrate

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-06-26
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](../gtl/REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-R-ABG3-EVENTS.md](REQ-R-ABG3-EVENTS.md), [REQ-R-ABG3-PROJECTION.md](REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-PAYLOAD.md](REQ-R-ABG3-PAYLOAD.md), [REQ-R-ABG3-ASSURANCE.md](REQ-R-ABG3-ASSURANCE.md), [REQ-R-ABG3-CONTINUATION.md](REQ-R-ABG3-CONTINUATION.md), [REQ-R-ABG3-ITERATION.md](REQ-R-ABG3-ITERATION.md), [REQ-R-ABG3-FN-COMPOSITION.md](REQ-R-ABG3-FN-COMPOSITION.md)

---

## Purpose

Define the ABG-owned requirements algebra as the replay-derived substrate that
preserves WHAT pressure through finite GTL graph-function traversal, evidence
binding, assurance fold projection, residual pressure, attenuation, and query.

This requirement prevents downstream products from rebuilding obligation,
materialization, evidence, fold, residual, or re-entry ledgers as peer closure
truth. Such ledgers may remain as compatibility inputs or read models only when
they are projected from admitted requirement events and existing ABG runtime
truth.

## Scope

The first slice covers generic ABG/GTL carrier and projection law:

- requirement event payloads,
- replay-derived `RequirementLedger` read models,
- stable requirement identity and typed relations,
- staged authority context fragments,
- traversal spans over existing graph-function and graph-vector identity,
- edge requirement environments,
- obligation/materialization/execution/evidence projections,
- requirement evidence binding,
- requirement fold and residual projections over existing assurance and
  continuation truth,
- deterministic completeness gates,
- query/read models,
- retained-compatibility wrappers for existing obligation and residual refs.

This requirement does not implement `odd_glc`, downstream product ledger
migration, KAOS/ReqIF/GSN/GRL import/export, editor workflows, or product-owned
semantic judgment.

## Acceptance Criteria

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-001**: ABG shall admit requirement event payloads as the only write-side truth for generic requirement-algebra state.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-002**: `RequirementLedger` shall be a replay-derived projection over admitted requirement events. It shall not be an independent writable ledger, a second event store, or a rival closure truth surface.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-003**: A requirement term shall preserve stable identity, source refs, source digest, relation refs, traversal span refs, context refs, evidence policy refs, and projection refs sufficient for replay-derived query.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-004**: Requirement relation kinds shall be typed. Unknown relation kinds shall fail admission before deterministic projection.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-005**: Authority context fragments shall preserve origin stage, constraint scope, digest, promotion policy, applies-to refs, and routing outcome without automatically becoming closeable requirement terms.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-006**: Destination topology shall be represented as a HOW constraint framework. It shall not be collapsed into WHAT requirement meaning or reduced to a build-tenant-only convention.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-007**: Traversal spans shall bind to existing graph-function and graph-vector identity. A span shall not become a public execution target or topology anchor.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-008**: Traversal span identity shall remain stable across graph function, graph vector, recursive frame, zoom, foldback, and alias boundaries through explicit lineage refs.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-009**: ABG shall build edge requirement environments from staged context, active requirement spans, prior fold projections, carried residuals, and compatible obligation refs.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-010**: Active requirement projection for an edge shall be deterministic over the replay-derived ledger and admitted edge identity.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-011**: Obligation, materialization-target, execution-schedule, and evidence-expectation projections shall be read models over admitted requirement events and edge environments.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-012**: Materialization target projection shall preserve declared authority role precedence. A stronger active role policy shall supersede a matching weaker design materialization target for the same projection and target path.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-013**: Execution schedule projection shall prefer admitted schedule commands over fallback commands when both address the same requirement projection.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-014**: Evidence binding shall distinguish asset projection, test-source projection, test-execution projection, and semantic interpretation projection. One evidence kind shall not close another by path shape or pass status alone.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-015**: Current admitted evidence for a requirement projection shall supersede empty or stale predecessor replay for the same projection without erasing event history.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-016**: Declared build byproducts shall bind as non-closing evidence unless explicitly admitted under the active requirement projection.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-017**: A materialized file under a declared test root shall classify as test-source evidence only when an active requirement test relation admits that test root and projection role.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-018**: Component-test execution discoverability shall not be required before admitted test-source materialization can be represented as partial non-closing evidence.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-019**: Requirement fold projection states shall be mapped over existing ABG assurance fold, continuation, and evaluate-next truth. Requirement folds shall not introduce a second closure decision family.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-020**: Requirement residual projection shall preserve remaining span, pressure class, owner surface, evidence refs, and source fold refs. Residuals shall not become a second retry, continuation, or re-entry controller.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-021**: Requirement attenuation shall classify residual movement as unchanged, narrowed, transformed, moved-to-prerequisite, escalated, or cleared.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-022**: Requirement assurance-case read models shall project claim, context, evidence, fold, and residual refs from admitted requirement and assurance truth. They shall not write assurance truth.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-023**: F_D over the requirements algebra shall be total over admitted states and shall return typed outcomes for valid, malformed, unknown-state-rejected, incomplete, stale/superseded, contradictory, semantic-assessment-required, semantic-residual-preserved, human-decision-required, and non-closing states.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-024**: Unknown or unclassified state shall not be admitted into F_D. It shall be rejected, structurally classified, or routed to typed F_P/F_H pressure before deterministic evaluation.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-025**: Deterministic completeness gates shall fail closed for missing span coverage, evidence-policy coverage, context routing, destination-topology coverage, test-relation coverage, or fold-attenuation coverage.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-026**: Obstacle and conflict gates shall check only structural resolution of already-admitted obstacles and conflicts. F_P owns ambiguous obstacle or conflict plausibility and admission.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-027**: Retained compatibility wrappers may wrap existing obligation refs and residual-pressure refs as requirement projections, but those wrapped refs shall not own closure, retry, continuation, or re-entry truth.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-028**: Query/read models shall expose active requirements, obligations, materialization targets, execution schedules, evidence bindings, fold projections, residual projections, attenuation, and assurance claims without downstream archive parsing.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-029**: Product-specific meaning shall enter through product-authored requirement terms, context fragments, graph-function refs, evidence refs, F_P findings, F_H decisions, or plugins. ABG shall not parse unknown product syntax to infer semantic satisfaction.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-030**: The first-slice realization shall be proven by a worked trace from GTL requirement declaration through edge environment, obligation projection, evidence binding, fold projection, residual/attenuation, and query.

