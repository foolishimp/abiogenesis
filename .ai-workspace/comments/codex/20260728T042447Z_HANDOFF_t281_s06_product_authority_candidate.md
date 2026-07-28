# T-281 S06 Product-Authority Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` candidate. The prior candidate
`ac61e080` proved the Product-neutral installed shell and Prime constructor
boundary, but independent review found four remaining authority defects:

- contribution and compatibility truth was not bound to publisher-authored
  manifest content;
- bare public-contract IDs could satisfy dependencies;
- dependency locking occurred after installation; and
- `abg.codex` verified a resolved path but spawned the submitted path.

This cut repairs only those relations and their focused proof. S05 remains
accepted. S04 remains parked for 5.1. The worker has stopped authoring. This
post records mechanical evidence and does not issue a semantic verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `d97942750a295c1c2ca47acbff947e7da5f7c3de` |
| Candidate tree | `6db6aa53a8554bae28062180aac0f584ba68c890` |
| Candidate parent | `81f7e65224566cd53d1e8de4f5eb15ff400e8eb9` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |
| M05 design digest | `ae5b0094509b40c1907e17e6b8774b4c22d2461d160a25a3645756082acd6435` |

The evidence commit is a direct child of the candidate and changes only
`AGENTS.md`, `GOALS.md`, T-281 status, and this handoff. Review runtime, design,
tests, generated root proof, and package at the candidate commit.

## Repaired Authority Path

```text
exact packed Product bytes
  -> verify descriptor
  -> verify complete public-contract rows and locators
  -> verify exact publisher-authored contribution manifest and digest
  -> resolve one complete dependency and compatibility lock
  -> install every selected Product under that exact lock
  -> bind the installed Product set under the same lock
  -> match publication contributions to exact verified manifest rows
  -> existing catalog admission
```

The contribution manifest now carries immutable row content for Module,
handle, kind, declaration or contract, owning Product, Program membership,
compatibility, provenance, and readiness prerequisites. Product verification
binds that content and its digest to the packed Product. Catalog admission
refuses missing, surplus, or changed publication rows.

Dependency satisfaction now consumes complete verified public-contract rows,
including version, digest, kind, owner, requirement authority, capabilities,
and native or asset locator. The lock resolves from verified artifacts before
an install target is written. Installation and workspace binding consume the
same lock identity and exact Product member set.

`abg.codex` still remains a convenience shell. It resolves the submitted path,
requires it to identify the exact installed sibling `abg.cli`, and spawns the
resolved installed sibling. It adds no operation, catalog, GTL, HoG, ABG,
worker, replay, or result behavior.

## Focused Mutations

The installed portability lane now proves:

- caller-authored workspace dependency edges refuse;
- a publication compatibility claim absent from the verified contribution
  manifest refuses;
- an unresolved Product dependency refuses before target materialization;
- an incomplete public-contract row refuses during Product verification;
- substituted and missing Codex CLI paths refuse deterministically; and
- source and dynamic-import boundary guards remain active.

The independently flavored Product continues to consume the installed GTL
constructors and declared `./gtl` and `./product` exports. No private path,
copied runtime, second catalog, or S04 realization entered the cut.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `170/170` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S05 module | `18/18` |
| S06 Prime module | `4/4` |
| S06 installed portability | `9/9` |
| Conservation | `62/62` |
| Affected Mermaid renders | `13/13` |
| `git diff --check` before freeze | pass |

Every reported test lane had zero failures, skips, and todos. Complete M5
includes retained S03, S05, external Product, S06 Prime, and installed
portability paths.

## Reproducible Package

Two independent `git archive` extractions of candidate `d9794275` each ran
`npm ci --ignore-scripts` and ordinary `npm pack --json`. The archives and
C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `8c73a8e486d097a4a1d4944c7b4817c73aead231f143633cf81324320c16d010` |
| SHA-1 | `7cf6ca72113a8cda01e7f84c537c3e86d439da13` |
| npm integrity | `sha512-CohPjYdgST3CllREHJZs8aSTNEx0i7IetJf42+fyadU2ZBloNwFAogLHKTqlWw8KCUClqlOiwgKxv1xxPG3qdQ==` |
| Packed size | `316957` bytes |
| Unpacked size | `2349953` bytes |
| Entries | `190` |
| Sorted payload inventory | `ebb83106600aefad34b02bb6f0be7b6338378e66bc5b138e20ecd6c82f5bd716` |
| Product content | `cb8445b23f95093336d39a2b1aa5745d8c88cbc0ac77fd601de2bd16a4f9b90d` |
| Canonical manifest | `13201d9cc854209af87332e2ef74a756351293fc1331f8cdcddb6f41fb900476` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `aeeb8665f2f9a257b319483011905be438a3b3c1ceaf733aadfddbcd5121bb63` |
| Event log | `4bdcab171002b56ce5ceb2abc46328da0baa6e245b4febee0f98528989faf210` |
| R10 result | `612e3e26e258415dd80001945dece34627a33c631a8803b67a47d8b2d8be8f4f` |
| Outcomes | `9c355f02a5fc2004b4286d656e2315a324ba1de5eca04a24b1bc61aedba099df` |
| Transcript | `284ec974ab52d9c86108c144f87381c34cadd3a599afb1ba8012a4b20dead716` |

## Review Questions

1. Does publisher-authored contribution truth remain immutable from packed
   Product verification through lock and catalog admission?
2. Can a missing, changed, or caller-minted contribution or compatibility row
   become ready or compatible?
3. Can an incomplete public-contract row satisfy a dependency?
4. Does one complete lock resolve before materialization and remain identical
   through every selected installation and workspace binding?
5. Does `abg.codex` execute only the resolved installed sibling while remaining
   an elimination-equivalent convenience shell?
6. Are S03 and S05 preserved, S04 absent, and the existing catalog and
   HoG/ABG runtime still singular?
7. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, freeze M5, select qualification, or authorize
release. Independent reviewers evaluate this exact cut. Direct F_H authority
then accepts it or returns one consolidated bounded repair set.
