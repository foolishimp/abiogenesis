# T-281 S06 Portability Repair Candidate Handoff

## Purpose

Review one replacement `ABG5-S06` candidate after the bounded findings against
`fd6a3f16`. S05 remains accepted and S04 remains parked. This handoff records
mechanical readiness only; it does not issue a semantic verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `ac61e0805b38f5535049bc792865daddd569e434` |
| Candidate tree | `90d16730524f7376c63d056a358e2c20f70da9d5` |
| Candidate parent | `42f60658d4197e6ce0f8285ec1652aa59c8cccf4` |
| Superseded S06 candidate | `fd6a3f1670687fcf5e50765161a72fd769d6271b` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |

The evidence commit is a direct child of the candidate and changes only live
status and this handoff. Review runtime, tests, and package at the candidate
commit.

## Bounded Repair

The repair addresses the consolidated findings without adding Product
functionality:

1. Product descriptors now carry exact dependency, compatibility, public
   contract, and contribution-capability requirements through verification,
   installation, lock construction, workspace binding, and catalog admission.
   `workspace.bind` cannot author dependency edges.
2. `abg.codex` resolves and launches only its exact sibling installed
   `abg.cli`. Substituted and missing executables refuse deterministically.
3. The independently packed flavored Product consumes the shared GTL
   declaration and publication constructors while retaining all Product-owned
   identities, topology, contracts, semantics, and implementation.
4. Source-boundary proof rejects relative, deep, dynamic-import, and
   `require(...)` paths. S04 realization remains absent.

No second catalog, resolver, runtime, controller, event family, Product
semantic branch, or S04 implementation entered the cut.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `167/167` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S05 module | `18/18` |
| S06 Prime module | `4/4` |
| S06 installed portability | `6/6` |
| R1-R10 installed proof | `13/13` |
| `git diff --check` before freeze | pass |

Every reported lane had zero failures, skips, and todos.

## Reproducible Package

Two independent `git archive` extractions of candidate `ac61e080` each ran
`npm ci --ignore-scripts` and ordinary `npm pack --json`. Their archives and
C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `b72284ed9d8ded15e0f6e7c8e2b8f8654e36914e1e2f8367503ddda5446e73bc` |
| SHA-1 | `eee292a66056a642796d9c5e004ffccc4113ada3` |
| npm integrity | `sha512-qSwXbO323mwFSkVw0xF6zV2EizPo8im3Zd7WEsxaVUOxu7Y2UhBj9Dz0bovFk4LYFTXyVQ132VIdrJONAZnu7w==` |
| Packed size | `312909` bytes |
| Unpacked size | `2306292` bytes |
| Entries | `190` |
| Sorted payload inventory | `bb4d1f71aca8ba387c529669225d0674f6bf15d1e0145c2a91f878a12d816fb8` |
| Product content | `21b895ba80725461285544bb83327389db5b0d1a5cf9c0ff6055d93cb00498dd` |
| Canonical manifest | `57e82dad888c5ed38bd9ff365d033c371feebb7cff0b293c76e47ac6103d2d74` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `b5b4d592bb1b947090c52dad6e101a645c8afe887893d4c356d68c08705169c8` |
| Event log | `83c782d5dd4c3d7297dc76ce2346b729e28a7e2b0dbfa2e59edddcc0a4faafaa` |
| R10 result | `e5c24fc79cde38d1d05257948c9d8eef70513954f4973cae730dd10c7d99c8df` |
| Outcomes | `7618a9d461782d71ee04b1dadc7902af04fc40f1c216e900264702a31ada0ddf` |
| Transcript | `be0be56ceac8d0e4a4408ea73507a6cb3bd524b268648cbb6f50d9308ad6a491` |

## Review Questions

1. Does every lock edge derive from one verified immutable Product descriptor,
   with missing, undeclared, incompatible, wrong-contract, wrong-capability,
   ambiguous, and cyclic dependencies refused?
2. Can `abg.codex` launch anything except the exact installed sibling CLI, or
   produce alternate Product or runtime behavior?
3. Does the flavored Product consume the accepted Prime constructors while
   retaining its own Product meaning and using installed public exports only?
4. Are accepted S03/S05 preserved and S04 realization absent?
5. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, select S04, claim qualification, or authorize
release. Independent reviewers evaluate this exact cut. F_H then accepts or
returns one consolidated bounded repair set.
