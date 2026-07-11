# REQ-P-SELF-CONFORMANCE - ABIogenesis Builder Self-Conformance

**Status**: Active
**Category**: Constraint / Verification
**Date**: 2026-07-11
**Derives from**: [INTENT.md](../../INTENT.md) INT-001,
[PRODUCT.md](../../PRODUCT.md),
[REQ-M-GTL3-CAPABILITY.md](../mapping/REQ-M-GTL3-CAPABILITY.md),
[REQ-P-QUAL.md](REQ-P-QUAL.md)
**Wave**: ABG 5.0

---

## Purpose

Define the product law by which ABIogenesis applies its published method,
contract, conformance, proof, and release rules to its own frozen builder. The
builder has no exemption and no ticket, reviewer, or release adapter may become
a second conformance authority.

## Subject And Basis

**REQ-P-SELF-CONFORMANCE-001**: Each self-conformance run shall bind one exact
subject identity and one exact rule basis. The subject shall identify the
candidate product, source snapshot, and tenant-conformance manifest. The basis
shall identify the specification-method version, applicable rule-catalog
version, exact source references, and content digests used to decide the run.

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

**REQ-P-SELF-CONFORMANCE-004**: Self-conformance shall extend the existing
semantic-compiler and rule-catalog path. It shall not create a second method
checker, repair engine, release checker, runtime, or hidden manual audit as a
co-equal source of truth.

**REQ-P-SELF-CONFORMANCE-005**: The result shall carry the exact subject and
basis identities, inventory digest, rule applications, typed diagnostics,
affected surface refs, evidence refs, and one disposition for each finding and
for the whole run. At minimum, dispositions shall distinguish passed, failed,
inapplicable-with-reason, blocked/incomplete, and accepted re-entry work.

**REQ-P-SELF-CONFORMANCE-006**: A waiver, exclusion, or inapplicable
disposition shall name the governing authority and reason. Builder identity,
release pressure, ticket closure, prior review, or historical acceptance shall
not waive an applicable rule.

**REQ-P-SELF-CONFORMANCE-007**: Findings shall remain diagnostics and admitted
work pressure. The self-conformance evaluator shall not silently edit
constitutional, design, code, proof, ticket, public-contract, or release
surfaces. Repair re-enters through the owning change class and ticket or
execution contract.

## Proof And Exact-Cut Gate

**REQ-P-SELF-CONFORMANCE-008**: Qualification shall run the self-conformance
contract against the real complete ABIogenesis builder tree and shall prove a
green result only when every applicable required surface and rule has a typed
terminal disposition.

**REQ-P-SELF-CONFORMANCE-009**: A seeded-negative matrix shall introduce
representative missing authority, broken traceability, unowned public contract,
design/code drift, malformed proof claim, ticket/closure mismatch, and
release-identity mismatch defects. Each seed shall produce its expected stable
diagnostic and non-green disposition.

**REQ-P-SELF-CONFORMANCE-010**: The release-grade self-conformance result shall
bind exact installed `R5`, its tenant-conformance manifest, the frozen subject
inventory, and the exact method/rule/source basis. A result over different
bytes, an incomplete inventory, an unresolvable basis, or a seeded defect that
passes shall refuse the release gate.

**REQ-P-SELF-CONFORMANCE-011**: The bounded A5-R1 release manifest may cite the
exact self-conformance result. It shall not reinterpret findings, replace their
dispositions, or turn a red, blocked, incomplete, stale, or bypassed result
green.

## Bounded Scope

**REQ-P-SELF-CONFORMANCE-012**: ABIogenesis 5.0 self-conformance is a bounded
exact-product gate. It does not claim a universal autonomous specification
repair product, hosted policy service, general repository auditor, new
constitutional ontology, or substitute for ordinary F_H decisions and lawful
repricing.
