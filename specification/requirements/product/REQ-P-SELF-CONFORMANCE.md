# REQ-P-SELF-CONFORMANCE - ABIogenesis Product Self-Conformance

**Status**: Active - accepted by T-283 F_H closure
**Category**: Constraint / Verification
**Date**: 2026-07-16
**Derives from**: [INTENT.md](../../INTENT.md) INT-001,
[PRODUCT.md](../../PRODUCT.md),
[REQ-M-GTL3-CAPABILITY.md](../mapping/REQ-M-GTL3-CAPABILITY.md),
[REQ-P-QUAL.md](REQ-P-QUAL.md)
**Wave**: ABG 5.0

---

## Purpose

Define the product law by which ABIogenesis applies its published method,
contract, conformance, proof, and release rules to its own frozen source and
candidate-product subject through the same `ExactCandidateQualification<K>`
family used by release qualification. The product has no exemption and no
ticket, reviewer, release adapter, or snapshot may become a second conformance
authority.

## Subject And Basis

**REQ-P-SELF-CONFORMANCE-001**: Each self-conformance run shall bind one exact
`ExactCandidateQualification<basis>` projection and its subordinate
`QualificationLawBasis`. The subject shall identify its closed qualification
kind, exact source and artifact content, toolchain manifest, installed-product
and workspace-binding truth when applicable, tenant-conformance manifest, and
frozen gate inventory. The law basis shall identify the specification-method
version, applicable rule-catalog version, exact source references, and content
digests used to decide the run. ABIogenesis 5.0 release qualification shall
bind the exact tapped and installed STDO 2.0 release identity and digest.

**REQ-P-SELF-CONFORMANCE-001A**: Missing, stale, conflicting, unreadable, or
cross-subject basis truth shall produce a typed non-green result. A release cut,
release snapshot, ticket, prior verdict, or mutable source-tree label shall not
substitute for the exact qualification subject or law basis.

**REQ-P-SELF-CONFORMANCE-002**: The frozen subject inventory shall include every
ABIogenesis constitutional, design, realization, proof, ticket/execution-
contract, public-seam or exported-contract, product/installer manifest,
qualification, and release-claim surface applicable to the candidate. An
unclassified or unreadable required surface shall be a typed incomplete result,
not an implicit pass.

**REQ-P-SELF-CONFORMANCE-003**: Applicability shall derive from the published
method, requirement families, tenant-conformance manifest, module ownership,
and declared public contract identities. File extension, source-tenant path,
ticket status, test name, or reviewer preference shall not create or remove a
rule obligation.

## Evaluation And Results

**REQ-P-SELF-CONFORMANCE-004**: Self-conformance shall use the existing
conformance evaluator atom, `AF-22`, under its qualification-bound
`self_conformance` kind and the published GTL-validator and rule-catalog
path. It is not another public operation. It shall not create a second method
checker, repair engine, release checker, runtime, or hidden manual audit as a
co-equal source of truth.

**REQ-P-SELF-CONFORMANCE-005**: The result shall carry the exact qualification
subject-basis and `QualificationLawBasis` identities and digests, inventory
digest, rule applications, typed diagnostics, affected surface refs, evidence
refs, and one disposition for each finding and for the whole run. At minimum,
dispositions shall distinguish passed, failed, inapplicable-with-reason,
blocked/incomplete, and accepted re-entry work.

**REQ-P-SELF-CONFORMANCE-006**: A waiver, exclusion, or inapplicable
disposition shall name the governing authority and reason. Product identity,
release pressure, ticket closure, prior review, or historical acceptance shall
not waive an applicable rule.

**REQ-P-SELF-CONFORMANCE-007**: Findings shall remain diagnostics and admitted
work pressure. The self-conformance evaluator shall not silently edit
constitutional, design, code, proof, ticket, public-contract, or release
surfaces. Repair re-enters through the owning change class and ticket or
execution contract.

**REQ-P-SELF-CONFORMANCE-007A**: The admitted self-conformance result is one
owning-gate result in the complete ordered
`QualificationGateResultVector<K>`. It shall preserve the same qualification
subject and law basis and shall not directly emit, replace, or reinterpret the
overall `ExactCandidateQualification<verdict>` projection.

## Proof And Exact-Cut Gate

**REQ-P-SELF-CONFORMANCE-008**: Qualification of a `pre_rc_candidate` shall run
the self-conformance contract against the real complete ABIogenesis candidate
tree bound by its exact `ExactCandidateQualification<basis>` projection.
Qualification of an `installed_rc` or `final_tap_candidate` shall rerun every
self-conformance gate made applicable by that exact subject or its admitted
delta. A run is green only when every applicable required surface and rule has
a typed terminal disposition.

**REQ-P-SELF-CONFORMANCE-009**: A seeded-negative matrix shall introduce
representative missing authority, broken traceability, unowned public contract,
design/code drift, malformed proof claim, ticket/closure mismatch, and
release-identity mismatch defects. Each seed shall produce its expected stable
diagnostic and non-green disposition.

**REQ-P-SELF-CONFORMANCE-010**: The release-grade self-conformance result shall
bind the exact ABIogenesis 5.0 qualification subject, its tenant-conformance
manifest, frozen subject inventory, and exact method/rule/source basis. A result
over different bytes or a different law basis, an incomplete inventory, an
unresolvable basis, or a seeded defect that passes shall refuse the owning gate
and therefore the complete qualification vector.

**REQ-P-SELF-CONFORMANCE-011**: The bounded A5-R1 release snapshot manifest may
cite the exact self-conformance result and the qualification verdict that
authorized its cut. The snapshot is output evidence only. It shall not qualify
its own input, reinterpret findings, replace their dispositions, or turn a red,
blocked, incomplete, stale, cross-basis, or bypassed result green.

## Bounded Scope

**REQ-P-SELF-CONFORMANCE-012**: ABIogenesis 5.0 self-conformance is a bounded
exact-product gate. It does not claim a universal autonomous specification
repair product, hosted policy service, general repository auditor, new
constitutional ontology, or substitute for ordinary F_H decisions and lawful
repricing.
