# REQ-R-ABG3-REQUIREMENTS-ALGEBRA — Requirements Algebra Substrate

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-06-26
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-CONTRACT-LAW-API.md](../gtl/REQ-L-GTL3-CONTRACT-LAW-API.md), [REQ-R-ABG3-EVENTS.md](REQ-R-ABG3-EVENTS.md), [REQ-R-ABG3-PROJECTION.md](REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-PAYLOAD.md](REQ-R-ABG3-PAYLOAD.md), [REQ-R-ABG3-ASSURANCE.md](REQ-R-ABG3-ASSURANCE.md), [REQ-R-ABG3-CONTINUATION.md](REQ-R-ABG3-CONTINUATION.md), [REQ-R-ABG3-ITERATION.md](REQ-R-ABG3-ITERATION.md), [REQ-R-ABG3-FN-COMPOSITION.md](REQ-R-ABG3-FN-COMPOSITION.md)

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

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-014**: Evidence binding shall distinguish subject-artifact projection, verifier-artifact projection, verifier-execution projection, and semantic interpretation projection. Current compatibility spellings such as `asset`, `test_source`, and `test_execution` name these generic proof-evidence roles; they shall not define software-test policy. One evidence kind shall not close another by path shape, tool name, or pass status alone.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-015**: Current admitted evidence for a requirement projection shall supersede empty or stale predecessor replay for the same projection without erasing event history.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-016**: Declared build byproducts shall bind as non-closing evidence unless explicitly admitted under the active requirement projection.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-017**: A materialized file under a declared verifier-artifact root shall classify as verifier-artifact evidence only when an active requirement proof relation admits that root and projection role. Filesystem path shape shall not let ABI infer product test meaning.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-018**: Verifier-execution discoverability shall not be required before admitted verifier-artifact materialization can be represented as partial non-closing evidence.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-019**: Requirement fold projection states shall be mapped over existing ABG assurance fold, continuation, and evaluate-next truth. Requirement folds shall not introduce a second closure decision family.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-020**: Requirement residual projection shall preserve remaining span, pressure class, owner surface, evidence refs, and source fold refs. Residuals shall not become a second retry, continuation, or re-entry controller.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-021**: Requirement attenuation shall classify residual movement as unchanged, narrowed, transformed, moved-to-prerequisite, escalated, or cleared.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-022**: Requirement assurance-case read models shall project claim, context, evidence, fold, and residual refs from admitted requirement and assurance truth. They shall not write assurance truth.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-023**: F_D over the requirements algebra shall be total over admitted states and shall return typed outcomes for valid, malformed, unknown-state-rejected, incomplete, stale/superseded, contradictory, semantic-assessment-required, semantic-residual-preserved, human-decision-required, and non-closing states.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-024**: Unknown or unclassified state shall not be admitted into F_D. It shall be rejected, structurally classified, or routed to typed F_P/F_H pressure before deterministic evaluation.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-025**: Deterministic completeness gates shall fail closed for missing span coverage, evidence-policy coverage, context routing, destination-topology coverage, proof-relation coverage, or fold-attenuation coverage.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-026**: Obstacle and conflict gates shall check only structural resolution of already-admitted obstacles and conflicts. F_P owns ambiguous obstacle or conflict plausibility and admission.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-027**: Retained compatibility wrappers may wrap existing obligation refs and residual-pressure refs as requirement projections, but those wrapped refs shall not own closure, retry, continuation, or re-entry truth.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-028**: Query/read models shall expose active requirements, obligations, materialization targets, execution schedules, evidence bindings, fold projections, residual projections, attenuation, and assurance claims without downstream archive parsing.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-029**: Product-specific meaning shall enter through product-authored requirement terms, context fragments, graph-function refs, evidence refs, F_P findings, F_H decisions, or plugins. ABG shall not parse unknown product syntax to infer semantic satisfaction.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-030**: The first-slice realization shall be proven by a worked trace from GTL requirement declaration through edge environment, obligation projection, evidence binding, fold projection, residual/attenuation, and query.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-031**: The downstream requirements route shall preserve a visibility split. Downstream-public surfaces may declare GTL requirement inputs and query replay-derived ABG requirement truth. Admission commands and projection commands that emit requirement event, fold, residual, or disposition truth shall remain ABG-runtime-internal.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-032**: Public requirements route facades shall reconcile one-to-one with existing requirements-algebra symbols or with explicitly ratified route gaps. A facade shall not rename or redeclare existing carriers as a second function catalog, carrier catalog, ledger, or closure surface.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-033**: Admitted requirement refs, evidence refs, fold refs, residual refs, disposition refs, and runtime scope refs shall be nominal route inputs that downstream callers cannot structurally forge. ABG command boundaries shall resolve each admitted ref against replay-visible event or projection truth and recompute the payload digest before use.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-034**: Ref resolution shall fail closed with typed rejection for unknown refs, dangling refs, stale or superseded refs, and digest mismatches. Carried `ref`, `sourceEventRef`, or `digest` fields shall not confer admission unless replay resolution verifies them.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-035**: Requirement evidence binding shall consume admitted runtime evidence event refs and explicit requirement projection refs. It shall reject boolean-only admission, filesystem path-shape evidence authority, pass/fail status as semantic closure, and arbitrary source truth strings.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-036**: Requirement fold projection shall consume admitted requirement evidence binding refs and admitted ABG assurance closure decision refs. It shall not accept manually supplied truth refs, local strings, downstream closure decisions, or query-produced semantic closure as fold authority.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-037**: Requirement fold, residual, and disposition truth shall be emitted by ABG runtime/admission/projection code on the real traversal path, including edge-close handling where applicable. Query surfaces may replay and join those facts; they shall not be the first place that fold, residual, or disposition truth is invented.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-038**: Requirement lifecycle disposition shall be a named read-only projection over admitted requirement residual/fold truth and existing ABG continuation or graph re-entry truth. It shall not be a writable carrier, closure enum, next-action controller, retry loop, or re-entry authority.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-039**: Disposition-affecting policy inputs shall be admitted runtime-policy refs or admitted F_H decision refs. Free string policy refs may appear only as inert labels in diagnostics or read models and shall not influence disposition.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-040**: F_D route code shall validate, admit, reject, project, replay, join, and guard over admitted carriers. F_D shall not author requirement meaning, infer missing requirements, infer semantic satisfaction, infer residual acceptability, select semantic next action, or treat command success as requirement closure.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-041**: F_P semantic findings and F_H decisions shall enter the requirements route only as admitted refs with provenance and digest truth. ABG F_D projections may consume those admitted refs but shall not replace their semantic authority with deterministic reconstruction.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-042**: Requirement assurance-case projection shall distinguish an empty fold set as `no_evidence`. It shall not collapse no-evidence, blocked, partial, satisfied, deferred, repriced, and no-close-preserved states into one blocked status.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-043**: The joined lifecycle-state query shall be read-only and replay-derived. It may return edge environment, obligations, materialization targets, execution schedules, evidence bindings, folds, assurance claims, residuals, attenuation, dispositions, and source refs, but it shall not emit admission or projection events.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-044**: Negative proof shall cover downstream attempts to emit fold, residual, or disposition truth; structurally forged admitted refs; digest mismatches; boolean evidence admission; manual assurance truth refs; query-lazy fold/residual/disposition; and F_D semantic inference.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-045**: ABG requirement graph projection shall reuse admitted `RequirementTerm` and `RequirementRelation` truth. Any graph view shall be replay-derived over those carriers and shall not mint a second KAOS, goal, decomposition, obstacle, requirement-graph kernel, or writable refinement ledger.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-046**: Edge requirement environments shall preserve active parent/child relation pressure for the edge by projecting active relations alongside active terms and spans. This relation pressure is query input and shall not become traversal selection, continuation, or re-entry authority.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-047**: Aggregate parent requirement fold and residual state shall be read-only projection over admitted child or leaf requirement folds and residuals. ABG shall not emit a second parent fold or parent residual writer merely because child requirements have been counted or because a command succeeded.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-048**: Multi-requirement public queries shall expose replay-derived graph structure, active parent/child pressure, leaf fold state, aggregate parent state, residual refs, and source refs without exposing admission, evidence-binding, fold, residual, disposition, or event-emission commands to downstream consumers.

**REQ-R-ABG3-REQUIREMENTS-ALGEBRA-049**: ABG requirement span-lineage projection shall reuse admitted `TraversalSpan` truth and expose span id, graph-function ref, graph-vector refs, vector indexes, source/target node refs, frame refs, zoom refs, foldback refs, alias refs, and active status as a replay-derived read model. It shall not infer span identity from vector index alone, query-time string matching, prompt text, product-local maps, or downstream naming convention.
