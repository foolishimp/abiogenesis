# T-281 S06 Direct Dependency And TypeScript Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` candidate. Independent review of
candidate `33ab384b` retained the installed portability architecture and
returned three bounded defects:

- readiness authority leaked through transitive dependencies;
- native export verification used a custom declaration recognizer instead of
  TypeScript's parser, resolver, diagnostics, and export table; and
- valid JSON Schema pointers through arrays were refused.

This cut repairs only those relations and their focused mutation proof. S03
and S05 remain accepted. S04 remains parked for 5.1. The worker has stopped
authoring. This post records mechanical evidence and does not issue a semantic
verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `4f9bf7077579469135963a73b20cac7d9d082fb3` |
| Candidate tree | `21ffbdaa5dfa52886a3cb29c6f2311f2d25012cc` |
| Candidate parent | `0c91f1dc3ee56c81885b86f326d118ef31878377` |
| Superseded S06 candidate | `33ab384b14f7feb1bbab42f16c03f1724270eafd` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |
| M05 design digest | `248071c6b79d733425d16dfc5f0a4269514ddd94f1df09a2dc40451169165278` |

The evidence commit is a direct child of the candidate and changes only active
status surfaces and this handoff. Review runtime, tests, generated root proof,
and package at the candidate commit.

## Bounded Repair

### Direct Dependency Readiness

Catalog readiness consumes only exact outgoing dependency edges declared by
the publishing Product. Each edge contributes only the contracts and
capabilities named on that edge after its target Product, package version,
compatibility reference, contract roster, and capability roster agree with
the resolved lock.

An `A -> B -> C` graph does not let A consume C's contract or capability
without an explicit `A -> C` edge. Unrelated lock rows and invalid edges
contribute no readiness.

### TypeScript Export Truth

Packed native-contract verification constructs one TypeScript Program over
the exact Product declaration closure. It requires clean parser, options,
syntactic, and applicable semantic diagnostics, then obtains each module's
exports from the TypeScript checker.

The pre-install verifier cannot install an unverified package dependency.
The generated Product therefore seals the exact TypeScript `5.9.2` compiler,
standard declaration libraries, Node declaration types, and `undici-types`
inside `build/toolchain`. The verifier resolves only that compiler payload and
the packed Product's `build/code` declarations. It does not consult an ambient
compiler or source tree.

The mutation lane admits valid `const enum`, Unicode namespace, namespace type
re-export, and semicolonless declarations. It refuses a syntactically invalid
export, a re-export from an absent module, and a false ESM default inferred
from `export =`.

### JSON Schema Array Pointers

JSON Pointer resolution now traverses object members and canonical in-range
array indices. The final value must still be an object schema or Boolean
schema. The installed verifier positively resolves both `#/oneOf/0` and
`#/oneOf/0/additionalProperties`; noncanonical, missing, scalar, and unsafe
targets remain refused by the existing boundary.

No new catalog, resolver, runtime, controller, event family, deep import,
copied runtime, or S04 realization entered the cut.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `176/176` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S03 authority module | `4/4` |
| S05 module within M5 | `18/18` |
| S06 Prime module | `6/6` |
| S06 installed portability | `13/13` |
| Focused S06 aggregate | `19/19` |
| Source-blind packed verification R1 | included in M4 |
| Conservation | `62/62` |
| Design files changed | `0` |
| `git diff --check` before freeze | pass |

Every reported test lane had zero failures, skips, and todos. Complete M5 ran
after the root proof was regenerated and passed before the exact candidate
freeze. The compiler-bearing package increased installed-witness duration, so
the conservation harness's mechanical subprocess budget changed from 30 to 90
seconds; the witness semantics and assertions are unchanged.

## Reproducible Package

Two independent `git archive` extractions of candidate `4f9bf707` each ran
`npm ci --ignore-scripts --offline` and ordinary `npm pack --json`. The
archives and C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `2005527064d3ed250acb07a41c5f241bd47675488c8f2609214c2127552bc1ca` |
| SHA-1 | `7d0b2a35dba3678085be45f8ff1938939222e37b` |
| npm integrity | `sha512-lkj+39VLVhgK2iawA53fb5FwGYlwV9b2tL2Xrlvemnq31Hgx653D3pxYwZMbUe4YBURj6UzXBjKAU6r+ey/2ug==` |
| Packed size | `2872851` bytes |
| Unpacked size | `17235990` bytes |
| Entries | `410` |
| Sorted payload inventory | `a4ed5c359a678d504e32a201259a3c06bde9255fd3909a440ab24ee25353caa5` |
| Product content | `c68fa36e4458217b91a0e0bbfede289a618ad37c97e143327e868f6250a21202` |
| Manifest file | `f6ecc078e0c792a86fe106162745881637a3239f54911d629c37b87842c78be7` |
| Canonical manifest | `c87aae6ef3862d8416ba23546866e4cfe658e8d4e8e51b11e4239bf833a9f3e5` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `d426143061dbd185034a982626c5f0c28e530546671373281e3a8aebde9c5002` |
| Event log | `176559280eb81c70532a565ddde3b9e427b0c5697e22028a4304b079f7740c38` |
| R10 result | `43eae9155f17c3ae2d0243632744ff8ee862f73490d46c1d55b67cf10338f1aa` |
| Outcomes | `ecafce2a047cbb1c2600eb4b66879fc2fc8a374c7741b7ad22ee80c054bfb991` |
| Transcript | `33585effc369a25557bffdf1ba89db2fdf56dfffa808fd2548e111229537e2bf` |
| Rival-authority mutations | `e8ff67a84c390968d224591ed808a312eec2f8006f560d6f982d41a3f9453ee2` |
| Candidate basis | `e100bad3b96967e17423a859eca7f223d7144990c246f20eabac271a7a6493c9` |

## Review Questions

1. Can readiness arise through a transitive dependency that the publishing
   Product did not directly declare?
2. Does native export verification use the exact sealed TypeScript Program
   and checker, reject invalid or unresolved declarations, and remain
   source-blind before installation?
3. Do valid JSON Schema array pointers resolve while non-schema and malformed
   targets remain refused?
4. Do source-blind packaging, accepted S03/S05 behavior, the singular catalog
   and runtime, and S04 exclusion remain preserved?
5. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, freeze unified M5, select qualification, or
authorize release. Independent reviewers evaluate this exact cut. Direct F_H
authority then accepts it or returns one consolidated bounded repair set.
