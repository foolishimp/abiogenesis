# REVIEW — S06 Gate 1 Authority Delta `29aea26d`

Date: 2026-07-31T13:19:55Z

Review class: bounded delta-only Gate 1 authority review

Subject:

- replacement commit: `29aea26dbb8dc500e3c0c932a465b6385cdefa79`
- replacement tree: `057e4d5f4534be6f22521265a3cc0aff9fa01c10`
- rejected parent: `ba2e39a4b51f2192d88089294edeef364cf53043`
- accepted census blob: `efe88cac85bd3bb071d4b5dd451dfadaec893c4f`

## Verdict

**ACCEPT — A1 and A2 are repaired; no counterexample remains in the bounded
authority delta.**

## Delta Findings

### A1 — repaired: CatalogView now has one explicit lifecycle relation

The replacement limits the change to the obsolete M03 CatalogView admission
mechanism while preserving S03 narrowing and invocation meaning
(`build_tenants/abiogenesis/typescript/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:33-36`).
Its supersession table now names the complete conflicting M03 relation:
admitted-projection ontology, ABG-owned `narrowCatalogView`, view-admission
event, catalog-view sequence admission, and ABI5-ROOT-001 R4 admission mapping
(`:93-104`). It replaces that relation with Product-owned deterministic
construction over an ABG-admitted projection and explicit allowlist, followed
by `run.invoke` revalidation against the explicit-prefix Event Calculus
catalog.

The operative equation is correspondingly complete: construction is total,
deterministic, eventless, and runtime-truth-neutral; equal inputs reconstruct
the equal view; `RunInvocationPort` rehydrates the runtime catalog at the
explicit prefix, revalidates the complete view, and records only invocation
use (`:232-260`). The previously competing accepted M03 admission/event
relation is therefore singularly superseded rather than left live beside the
new relation.

### A2 — repaired: common refusal and projection refusal are complete and disjoint

The replacement retains exactly the five common refusal codes and supplies one
structural mapping for each (`:377-403`). It separately defines the indexed
`OutcomeProjectionRefusal<K>` with exactly these six classes:
`malformed_owner_output`, `cross_definition`, `wrong_contract`,
`digest_mismatch`, `unexpected_nonterminal`, and `relation_mismatch`
(`:405-428`).

That disposition is expressly not owner truth, cannot be nested under
`owner_refusal`, and is not a sixth common refusal code. It is projected into
the common outcome native symbol and schema and every indexed operation row;
its adapter exit is exactly `adapterFailure = 70`, and it carries no owner
result/refusal truth or runtime event (`:430-435`). This supplies the
previously missing malformed-owner-output disposition without changing the
closed common-code set.

## Boundary Receipt

The commit object identifies the exact replacement tree and rejected parent,
and the census path resolves to the stated accepted blob in that tree. Review
was limited to A1 and A2 in the frozen replacement. No donor, held work, or
unchanged authority corpus was reopened. No production, test, schema,
generator, package, ticket, requirement, design subject, or feature was
edited. This post is the only review output.
