# T-281 S06 Contract-Authority Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` candidate. Two independent reviews of
candidate `28122033` agreed that the existing portability architecture remains
sound. One review accepted it; the other returned five bounded
contract-authority defects:

- catalog readiness prerequisites were recorded but never established;
- Product verification trusted self-authored native-symbol and JSON-definition
  locator claims;
- published public-contract identities and digests differed from the
  constitutional contract;
- `product.resolve` collapsed distinct failure semantics; and
- native timestamp admission was broader than the serialized schema.

This cut repairs only those relations and their mutation proof. S03 and S05
remain accepted. S04 remains parked for 5.1. The worker has stopped authoring.
This post records mechanical evidence and does not issue a semantic verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `c0d2a3e686ed589ce35efe629a351d149025a9d3` |
| Candidate tree | `2fb9cbbe041c650d3c52846657ea579668b6258e` |
| Candidate parent | `e2ed992d9af8ee2f3aa6b341389cdba19c46baa8` |
| Superseded S06 candidate | `281220331a9684247d8f7f00eb7ec4e7422131c9` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |
| M05 design digest | `248071c6b79d733425d16dfc5f0a4269514ddd94f1df09a2dc40451169165278` |

The evidence commit is a direct child of the candidate and changes only active
status surfaces and this handoff. Review runtime, tests, generated root proof,
and package at the candidate commit.

## Bounded Repair

### Readiness

Catalog construction now resolves every contribution
`readinessPrerequisiteRef` against an exact admitted readiness evidence set
derived from the verified lock and publication. An unknown publisher-bound
prerequisite refuses as typed `catalog_admission_refusal` with disposition
`unready`; it cannot become a ready catalog row.

### Locator And Contract Truth

Packed Product verification now:

- requires nonempty requirement-authority and capability rosters;
- resolves each native declaration through the exact package export;
- verifies the claimed native symbol and exported-symbol roster against the
  actual declaration file;
- resolves each JSON `definitionRef` as a JSON Pointer in its exact asset; and
- uses the constitutional native or asset digest rather than an invented
  combined digest.

The manifest publishes the exact constitutional rows:

```text
abg.schema.public-operation-contract
abg.schema.public-operation-invocation
abg.schema.public-operation-outcome
```

### Public Refusal And Schema Parity

`product.resolve` preserves the closed typed dispositions `unresolved`,
`incompatible`, `ambiguous`, and `cyclic`. Native public timestamps now require
the same RFC 3339 date-time domain as the generated JSON schema; date-only
values refuse in both SDK and CLI.

No second catalog, resolver, runtime, controller, event family, deep import,
copied runtime, or S04 realization entered the cut.

## Focused Mutations

The S06 lanes now prove:

- an unknown readiness prerequisite cannot become an admitted ready row;
- empty requirement and capability rosters refuse Product verification;
- nonexistent native symbols and JSON definitions refuse;
- the three canonical public schema rows and their digests are exact;
- unresolved, incompatible, ambiguous, and cyclic dependency results remain
  distinguishable; and
- SDK and CLI both refuse a date-only timestamp.

The previously accepted S05 durable Run binding, exact installed CLI shell,
immutable Product authority, publication binding, pre-install lock, shared GTL
constructors, and independent flavored Product remain regression-covered.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `172/172` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S05 module | `18/18` |
| S06 Prime module | `4/4` |
| S06 installed portability | `11/11` |
| Focused S06 aggregate | `15/15` |
| Conservation | `62/62` |
| Affected Mermaid views | `13/13` |
| `git diff --check` before freeze | pass |

Every reported test lane had zero failures, skips, and todos. Complete M5 was
run after retained M4 regenerated the root proof.

## Reproducible Package

Two independent `git archive` extractions of candidate `c0d2a3e6` each ran
`npm ci --ignore-scripts` and ordinary `npm pack --json`. The archives and
C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `1deedcc3979d06d4c6546464c01632b7cc65aea9176c8750cb92b4cd16d5686c` |
| SHA-1 | `0f96e541767df484ecb3940160da3bef704bd92c` |
| npm integrity | `sha512-kwGIMZOGIcuaLsQZuIP22f7bleqAZG202jXEGMtFhym2VcQQ83Qcag+KWVPww2jV6usUxBemqw9AdKWnOBKdXg==` |
| Packed size | `327512` bytes |
| Unpacked size | `2440474` bytes |
| Entries | `195` |
| Sorted payload inventory | `5b9c3d52b5c67b2d33c78330398d425fb37c87102109d81dfbc8dc58ef74e913` |
| Product content | `771345f882c0d953e92b1c3c085cdab54df6e0c071393da75e984e2e1cce75fa` |
| Canonical manifest | `af3cac7ed2ba82581f9105de3875c6d70d6e960423c5c7082820990ed44cc43e` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `66942bd3aaa03cee28b2c60326df3eb52f74e03afb9864d80cb0ee429642aae2` |
| Event log | `d079d05d3f1e16bbeaaf26802615b8d6eff8bdafcb4f530b80d9eb3b91dbde96` |
| R10 result | `b41bb4779a1b8dccc1f97ad1b09966e107aa5d8a42baf361af013625378a8ecf` |
| Outcomes | `c628f939155c1d6a6ecd0a967fa9b0ac573f7bc26057d7fccc4d78e06529a946` |
| Transcript | `4705622b0a1b9d8181e2459e7a5839e0434583bf9ea4e3ef43db0bfc07ad26ad` |
| Rival-authority mutations | `8a567fc43bceaabf31ce572e25025959238b24f9d9ad5b47f4100abad65c92ab` |
| Candidate basis | `cf8d2c2785ec5a4f30279ee5492633da26a21545c8cfcb768be4497eda474b02` |

## Review Questions

1. Can a contribution become ready unless every exact prerequisite resolves
   against admitted publication or lock truth?
2. Can a Product verify a nonexistent native symbol, nonexistent JSON
   definition, or empty authority roster?
3. Do the three public-operation schema identities and their native or asset
   digests exactly match the constitutional contract?
4. Are dependency-resolution failure dispositions total, closed, and
   distinguishable through the SDK and CLI?
5. Do native and serialized timestamp admission define one value domain?
6. Are the prior S06 authority repairs, accepted S03/S05 behavior, singular
   catalog and runtime, and S04 exclusion preserved?
7. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, freeze unified M5, select qualification, or
authorize release. Independent reviewers evaluate this exact cut. Direct F_H
authority then accepts it or returns one consolidated bounded repair set.
