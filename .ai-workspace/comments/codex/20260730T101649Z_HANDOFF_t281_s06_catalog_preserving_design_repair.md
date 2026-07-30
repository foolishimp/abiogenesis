# T-281 S06 Catalog-Preserving Design Repair Handoff

## Review Purpose

Review one bounded replacement over returned digest repair `5770755a`.

That candidate made definition, family, payload, Product-content, and catalog
identity acyclic, but PFC-F08 replaced the existing complete flat public
contract catalog with a new nested subset carrier. It also left generated
schema asset identity available to the pre-family definition projection and
did not define the exact-one Product-verification join.

This replacement repairs only those relations. S06 realization, native
occurrence realization, both rejected donor branches, and post-S06 Prime
entropy compression remain excluded.

## Exact Subject

| Identity | Value |
|---|---|
| candidate | `458ce3c285ab9161e90a9d6cefb3eeb9b94f4257` |
| tree | `b5c7a1ebc5385f5b0af68bd28fd80b806b36860f` |
| parent | `747b07f3e476682cbeebd1acc868138becc4b9c1` |
| accepted design parent | `2bb7b594920b1b126a6d314ed7bb39dabd211823` |
| returned digest repair | `5770755af7cc19c55d1f526c4e34e482f0ba7df5` |
| design SHA-256 | `beab3ee572c665c8f63ec7c3a8f8d44fba31cf513f7b966fde891d64b6dad1d7` |
| requirement SHA-256 | `26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7` |
| two-file aggregate SHA-256 | `81c25e0d951f7f5f240b9072b19f6d17f94b95e8730bbb427e879a223273cd03` |

The aggregate hashes the two displayed `shasum -a 256` output lines, in design
then requirement order, including their repository-relative paths.

The candidate commit changes only:

`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`

Its direct commit delta is 296 additions and 189 deletions, net 107 lines. No
requirement, realization, schema, test, package, ticket, or status file is part
of the candidate commit.

## Repaired Relations

### Pre-Family Identity

`OwnerContractIdentityProjection` contains only the exact definition key and
slot, stable contract identity/version, owner authority, strict owner-schema
member identity, and owner projection witness. Generated native locators,
schema asset paths and digests, family/catalog/Product identities, and
Product-content identity are downstream and cannot enter `definitionDigest`.

### Existing Catalog Merge

PFC-F07 emits operation-contract payloads and flat catalog-row proposals.
PFC-F08 replaces only the exact three common operation-contract identities and
18 operation identities inside the complete existing row set. Every other
required GTL, ABG, runtime, installer, Consensus, qualification, vocabulary,
schema, and corpus row is retained unchanged.

The serialized carrier remains exactly:

```text
schemaVersion
catalogId
catalogVersion
catalogDigest
catalogSchemaPath
catalogSchemaDigest
rows: flat PublicContractCatalogRow[]
```

There is no `catalogRef`, top-level Product/family wrapper, `intrinsicRow`, or
per-row `bindingDigest`. The verified containing manifest supplies the exact
Product and Product-content coordinate.

### Verification Join

PFC-F08A recomputes the deterministic PFC-F07 proposal for each expected
pre-family owner identity and requires exactly one matching verified flat row
under the same containing Product, Product-content inventory, and catalog
digest. Zero, multiple, cross-Product, locator-divergent, authority-divergent,
or payload-incoherent matches refuse before `VerifiedProductArtifact`.

## Preserved Decisions

- Identity order remains owner -> definition -> family -> payload -> Product
  content -> complete flat catalog -> external manifest digest.
- The active family remains exactly 18 operations and 56 definition keys.
- All 24 `project.read` cases remain unchanged.
- Native F01/F02 occurrence and binding algebra is unchanged.
- The existing catalog and manifest carriers remain singular.
- No requirement, operation, owner function, schema, runtime, event family,
  service, analyzer, registry, or Prime family is added.
- Rejected facade donor `e5902c55` and native donor `310966ab` remain local
  evidence only.

## Mechanical Readiness

| Check | Result |
|---|---|
| Pandoc GFM parse | `1/1` |
| Mermaid render with `mmdc 11.3.0` | `3/3` |
| operation identities | `18` |
| definition keys | `56` |
| project-read cases | `24` |
| `git diff --check` | pass |
| requirement/realization/schema/test/package changes in candidate | `0` |

These checks establish exact identity and mechanical readiness, not semantic
acceptance.

## Bounded Review Questions

1. Can any generated aggregate asset, family, catalog, Product, or
   Product-content identity enter the pre-family definition digest?
2. Does PFC-F08 preserve the exact existing `catalogId` and flat row carrier
   while retaining every non-operation row?
3. Is the operation-row replacement set exact, duplicate-free, and total?
4. Does PFC-F08A enforce exactly one owner-identity-to-verified-row join under
   the same Product/content/catalog authority?
5. Did the repair preserve the complete 18/56 family, native F01/F02 design,
   Prime/IACS mapping, and realization hold?

Review only these relations. Realization resumes only after direct acceptance
of this exact subject.
