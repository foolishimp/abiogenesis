# T-281 S06 Nested Catalog Authority Design Handoff

## Review Purpose

Review one bounded replacement over returned catalog-preserving candidate
`458ce3c2`.

That candidate preserved the flat catalog carrier and acyclic digest order, but
its owner-contract verification cardinality was unsatisfiable, it assumed a
complete mandatory catalog that does not exist, and it included an undefined
pre-family projection-witness digest.

This replacement repairs only those three relations. S06 realization, native
occurrence realization, mandatory catalog-row publication, both rejected donor
branches, and post-S06 Prime entropy compression remain excluded.

## Exact Subject

| Identity | Value |
|---|---|
| candidate | `356aa6a24fbfaac32c9ce2bb4fbc8b78f59bcd92` |
| tree | `4af5ada4d1487d4e63b5ae55b4f55be522f3ae3c` |
| parent | `eb451477787813dcd63899ba6d667240035dec39` |
| accepted design parent | `2bb7b594920b1b126a6d314ed7bb39dabd211823` |
| returned catalog repair | `458ce3c285ab9161e90a9d6cefb3eeb9b94f4257` |
| design SHA-256 | `3a65c0f1b8e5c15011197f48fb61e730c16dac45ec160077139eb42fc758e49c` |
| requirement SHA-256 | `26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7` |
| two-file aggregate SHA-256 | `fdf998b0303ab194ac9a2354323ec205f192a7a20c1e608cc15d938923b5b0fe` |

The aggregate hashes the two displayed `shasum -a 256` output lines, in design
then requirement order, including their repository-relative paths.

The candidate commit changes only:

`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`

Its direct commit delta is 360 additions and 146 deletions, net 214 lines. The
added material defines the nested coordinate relation and reconciles its
Ontology, lifecycle, views, axioms, realization boundary, and proof clauses.
No requirement, realization, schema, test, package, ticket, or status file is
part of the candidate commit.

## Repaired Relations

### Family-Derived Nested Join

`product.verify` no longer accepts an expected-contract set from the caller.
It derives the complete set from the content-verified public-function family.
Each request, result, refusal, and applicable non-terminal contract resolves:

```text
exact flat operation row
  -> exact definition key
  -> exact slot
  -> exact nested JSON pointer
```

Many nested contracts may share one flat operation row. Each
`(definitionKey, slot, definitionRef)` coordinate is unique, and the selected
nested identity set must equal the complete family-derived expected set.
`RequestContractOf<K>`, `ResultContractOf<K>`, `RefusalContractOf<K>`, and
`NonTerminalContractOf<K>` are projections from that complete map.

The common projection-refusal definition remains under the unsuffixed
`abg.schema.public-operation-outcome` row. A fragment is not treated as a flat
contract identity.

### S06 Catalog Boundary

PFC-F08 preserves every extant non-operation row and binds only the three
common public-operation rows plus the 18 operation rows. It computes the exact
44-identity mandatory roster difference as `MandatoryCatalogGapSet`.

S06 may verify and exercise its development-Product portability path while
that residual is explicit and no ABIogenesis 5.0 public-contract conformance
claim is made. S06 cannot synthesize the 28 currently absent mandatory rows.

T-270 owns `CompleteMandatoryPublicContractCatalog` as a later unified-M5
composition over exact owner-local publications. The gap set must be empty
before unified M5 freeze, any 5.0 conformance claim, M6, or M7. This adds no
catalog, operation, runtime, Prime, or S06 realization obligation.

### Pre-Family Identity

The undefined `projectionWitnessDigest` is removed. Pre-family owner-contract
identity is bound by the exact owner authority and the digested owner
module/member native-schema identity. Generated assets, family identity,
Product content, catalog identity, and later verification evidence remain
downstream.

## Preserved Decisions

- The active family remains exactly 18 operations and 56 definition keys.
- All 24 `project.read` cases remain unchanged.
- Native F01/F02 occurrence and binding algebra is unchanged.
- The existing `catalogId` and flat serialized catalog carrier remain singular.
- S06 remains a development-Product portability proof, not full catalog
  publication or a 5.0 conformance claim.
- No requirement, owner function, schema, runtime, event family, service,
  analyzer, registry, or Prime family is added.
- Rejected facade donor `e5902c55` and native donor `310966ab` remain local
  evidence only.

## Mechanical Readiness

| Check | Result |
|---|---|
| Pandoc GFM parse | `1/1` |
| Mermaid render | `3/3` |
| operation identities | `18` |
| definition keys | `56` |
| project-read cases | `24` |
| mandatory catalog identities | `44` |
| `git diff --check` | pass |
| requirement/realization/schema/test/package changes in candidate | `0` |

These checks establish exact identity and mechanical readiness, not semantic
acceptance.

## Bounded Review Questions

1. Does the family-derived expected set join exactly through operation row,
   definition key, slot, and nested pointer without one-flat-row-per-contract
   cardinality?
2. Can an empty, partial, caller-authored, duplicate, or family-divergent
   expected set bypass Product verification?
3. Does PFC-F08 preserve the extant flat carrier while exposing every mandatory
   roster gap instead of synthesizing absent rows?
4. Is T-270, rather than S06 or implementation convention, the explicit owner
   of exact owner-published mandatory-row completion before unified M5?
5. Is pre-family identity constructable and acyclic with no separate
   projection-witness digest?
6. Did the repair preserve the accepted 18/56 family, native F01/F02 design,
   Prime/IACS mapping, and realization hold?

Review only these relations. Realization resumes only after direct acceptance
of this exact subject.
