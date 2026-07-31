# REVIEW — S06 Gate 1 Authority `ba2e39a4`

Date: 2026-07-31T13:02:44Z

Review class: cold independent Gate 1 authority review

Subject:

- commit: `ba2e39a4b51f2192d88089294edeef364cf53043`
- tree: `3d5686d4c845c050c38b9f4c12e05f53014910bf`
- branch: `codex/t286-abi5-root`
- accepted census blob: `efe88cac85bd3bb071d4b5dd451dfadaec893c4f`

## Verdict

**REJECT — accepted-authority counterexamples remain.**

## Findings

### A1 — CatalogView has two unreconciled accepted authority/lifecycle relations

The accepted M03 design identifies `CatalogView` as an admitted projection
owned by `catalog.view plus ABG admission` and specifies that
`narrowCatalogView` is ABG-owned and emits a view-admission event
(`build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:114`,
`:297`; its accepted status is explicit at `:3-4`).

The candidate says S03 meaning is unchanged
(`build_tenants/abiogenesis/typescript/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:33-35`)
and says it supersedes **only** the predecessor relations enumerated at
`:90-105`; that enumeration does not supersede the M03 CatalogView admission or
event relation. The same candidate nevertheless declares CatalogView a total
deterministic Product construction that emits no event and changes no runtime
truth at `:238-240`, reiterated at `:441`.

This leaves both the accepted ABG-admitted/eventful relation and the proposed
Product-deterministic/eventless relation live. It violates T-281 `CL-07`'s
non-substitutable singular catalog separation
(`.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md:254-256`)
and STDO's rule that the exact claim include every applicable accepted-design
relation without competing or ambiguous authority
(`.genesis/docs/standards/DESIGN_MODULE_METHOD.md:1741-1747`). The candidate
therefore does not construct one unambiguous deterministic eventless
CatalogView authority.

### A2 — The exact five-code map has no outcome-projection-failure disposition

The accepted S06 predecessor retains `OutcomeProjectionRefusal<K>` as a
distinct final `PublicOutcome<K>` member for malformed owner output,
cross-definition output, wrong contract, digest mismatch, unexpected
non-terminal output, and relation mismatch
(`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1932-1949`).
It explicitly states that this failure is not owner-result truth and cannot be
reclassified as an owner refusal, and assigns its adapter exit at `:2004-2009`.
Live `REQ-P-PUBLIC-CONTRACTS-009` requires every operation row to retain every
non-success disposition, typed error/refusal, and adapter exit classification
(`specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md:229-236`).

The candidate claims Sections 4 through 9 supersede the older common-refusal
shape at
`build_tenants/abiogenesis/typescript/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:100`,
but its exhaustive five-code mapping at `:358-376` covers only request/schema
failure, target mismatch, missing prerequisite, duplicate admitted identity,
and a typed refusal returned by the owner port. It supplies no mapping or typed
outcome for projection failure, while `:380-382` forbids any additional common
code.

The result is not an exact complete five-code Public refusal relation: the
accepted malformed/cross-definition/wrong-contract/digest projection cases have
no lawful outcome or adapter exit. This violates the complete Public behavior
required by T-281 `CL-03` and the exact derived-surface relation in `CL-10`
(`.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md:242-243`,
`:264-266`).

## Boundary Receipt

No donor code was inspected. No production, schema, generator, package, test,
proof, requirement, ticket, or design subject was edited. This review does not
authorize or prescribe replacement features. Semantic implementation, legacy
deletion, Gate 2, compatibility, S04, post-S06 Prime work, publication
completion, M6, and M7 remain held.
