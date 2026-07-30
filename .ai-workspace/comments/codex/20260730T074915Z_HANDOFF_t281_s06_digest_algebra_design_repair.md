# T-281 S06 Digest Algebra Design Repair Handoff

## Review Purpose

Review one bounded design delta over accepted parent `2bb7b594`.

Realization exposed a circular identity relation:

```text
definitionDigest
  -> catalog familyDigest
  -> familyDigest
  -> definitionDigest
```

The same definition projection also carried Product content identity even
though the definition/schema payload bytes participate in that Product
identity. Seed, zero, loader-order, or post-hoc replacement values are not
lawful resolutions.

This candidate repairs only that algebra. S06 realization, both rejected donor
branches, and post-S06 Prime entropy compression remain excluded.

## Exact Subject

| Identity | Value |
|---|---|
| candidate | `5770755af7cc19c55d1f526c4e34e482f0ba7df5` |
| tree | `77842794bdafb25b48f3ef1554fd6d47e002a456` |
| parent | `4d70778ea2123c5395f428838cb68d281c4ca265` |
| design SHA-256 | `163da0eaa3b91505d896dfeac745ff31474484585fe3f2d78d185073a2d98a0f` |
| requirement SHA-256 | `26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7` |
| two-file aggregate SHA-256 | `63ac778fca780047734d43086bd41742650287f43c2d857422aa308a5e0555e8` |

The aggregate hashes the two displayed `shasum -a 256` output lines, in design
then requirement order, including their repository-relative paths.

The candidate changes only:

`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`

Delta from the accepted parent is 224 additions and 96 deletions, net 128
lines. No requirement, realization, schema, test, package, ticket, or status
file is part of the candidate commit.

## Repaired Algebra

The exact order is now:

```text
owner contract inputs
  -> intrinsic definition digests
  -> intrinsic 18-operation/56-key family digest
  -> PFC-F07 payload schemas, rows, SDK, and CLI projections
  -> productContentDigest over immutable payload files
     excluding product-toolchain-manifest.json
  -> PFC-F08 final Product-bound publicContractCatalog
  -> catalogDigest over the completed catalog with only catalogDigest omitted
  -> complete manifest digest stored outside the manifest
```

Definitions contain no family, catalog, Product, or Product-content identity.
Intrinsic rows contain no Product identity or containing-catalog digest.
PFC-F08 binds the exact intrinsic rows and contracts to the already-computed
Product content identity in the final manifest catalog. Installed processes
consume that verified manifest value; no process-memory bridge or loader-order
fallback exists in the design.

This is the digest order already required by
`REQ-P-PUBLIC-CONTRACTS-001..002A`. It adds no operation, owner function,
catalog, runtime, event family, service, analyzer, or Prime family.

## Preserved Decisions

- The active family remains exactly 18 operations and 56 definition keys.
- All 18 semantic owner functions remain realization obligations in their
  named Product, ABG, Validator, and release-authority modules.
- Public remains a join, admission, dispatch, and projection surface only.
- The 24-case `project.read` family is unchanged.
- Native F01/F02 occurrence and binding design is unchanged.
- Rejected facade donor `e5902c55` remains evidence only.
- Native donor `310966ab` remains unsafe evidence only.
- Post-S06 Prime entropy compression remains held.

## Mechanical Readiness

| Check | Result |
|---|---|
| Pandoc GFM parse | `1/1` |
| Mermaid render with `mmdc 11.3.0` | `3/3` |
| operation identities | `18` |
| definition keys | `56` |
| project-read cases | `24` |
| `git diff --check` | pass |
| specification/realization/test changes in candidate | `0` |

These checks establish exact identity and mechanical readiness, not semantic
acceptance.

## Bounded Review Questions

1. Is the definition -> family -> payload -> Product content -> final catalog
   relation acyclic and total?
2. Does the final catalog digest follow `REQ-P-PUBLIC-CONTRACTS-002A` without
   omitting any Product-bound row or including itself?
3. Can generation or runtime still lawfully use a seed, zero value,
   loader-order fallback, post-hoc reevaluation, or process-memory authority?
4. Did the repair preserve the complete 18/56 family, named owner authority,
   native-occurrence design, Prime/IACS mapping, and realization boundary?

Review only this digest-algebra delta. Realization resumes only after direct
acceptance of this exact subject.
