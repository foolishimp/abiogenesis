# T-281 S06 Portability Candidate Handoff

## Purpose

Review one exact `ABG5-S06` candidate. S05 is accepted. S04 is parked. This
cut must prove only that native SDK, native CLI, and one bounded Codex process
delegate are elimination-equivalent shells over the installed public contract,
and that an independently flavored Product can use the existing catalog and
runtime through installed public exports.

The worker has stopped authoring. This post records mechanical evidence and
does not issue a semantic verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `fd6a3f1670687fcf5e50765161a72fd769d6271b` |
| Candidate tree | `8d3aeccf8a3e9966df31c68382ed03f6807baac8` |
| Prime-gate parent | `8c4c78668122f7ae69626302186e10ea7ac775b6` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |
| M05 design digest | `5e69c37af2a53b0fc1af74f44c5f014fa38332867845979182db6844e4268b4b` |

The evidence commit is a direct child of the candidate and changes only live
status and this handoff. Review runtime, design, tests, and package at the
candidate commit.

## Realized Boundary

The pre-S06 Prime gate contracts four recurring mechanics:

1. exact zero/one/many Product coordinate resolution;
2. verified installed-module content, confinement, and loading;
3. one Product dependency-cycle predicate; and
4. GTL declaration and publication carrier construction.

Each caller retains semantic disposition and admission authority.

The S06 path is:

```text
independently packed flavored Product
  -> exact installed ProductSet and dependency lock
  -> caller-owned ModulePublication
  -> existing catalog.admit -> catalog.view -> catalog.apply
  -> one serialized public transcript
  -> native SDK | native CLI | abg.codex -> exact installed CLI
  -> direct HoG traversal
  -> ABG events and replay-derived typed result
```

`abg.codex` validates an exact CLI path and transcript path, invokes
`abg.cli --jsonl <transcript>`, and forwards process output and status. It
contains no Product, GTL, HoG, ABG, worker, continuation, or closure behavior.

The flavored Product owns its Product ID, namespace, Module, Program,
GraphFunction, contracts, judgment, node type, overlay, implementation, and
semantics. It type-checks against the installed package's declared `./gtl` and
`./product` exports. SDK execution imports the declared `./public` export. No
ABIogenesis deep-runtime path is present in the flavored Product.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `165/165` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S05 module | `18/18` |
| S06 Prime module | `4/4` |
| S06 installed portability | `4/4` |
| `git diff --check` before freeze | pass |

Every reported lane had zero failures, skips, and todos. Complete M5 includes
the retained S03 and installed S05 paths.

## Reproducible Package

Two independent `git archive` extractions of candidate `fd6a3f16` each ran
`npm ci --ignore-scripts` and ordinary `npm pack --json`. The archives and
C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `d747cf0f99eeac442baf2a8c068bb605943040fb7780a4c7c6b0fcfa41d62cdd` |
| SHA-1 | `235f2249960434ba7ed86fb7e66f443daab25c6e` |
| npm integrity | `sha512-YWMRN+B+XCLtH/2/FphDXgyGl3ksVot+I3tsmtt530kFzUB6ZzhNlMStLbCBADRh1Eg93FUE0iYtrZTfb07ynQ==` |
| Packed size | `310767` bytes |
| Unpacked size | `2292529` bytes |
| Entries | `190` |
| Sorted payload inventory | `8ee18e0de2439672c7da88bb413408e684f5b37843463124afcbaf709bbb71dc` |
| Product content | `716b609a81cf6c72a65de6c4fcbc34de12bc9a36b85f199c93d44323cdc81d18` |
| Canonical manifest | `ed2b9cab3697e1c66e2f2bef94ace3dbf111d34286346b4d70461613cde48b07` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `29220e74b07e6b2e7b3ef23bc24edec7ddf081c59bd0ffc63a221edf3d940e95` |
| Event log | `c0bc60cfd82c281177bc4d0151485e3606ba6d8d950dbc696b0e69ddba6ab4c4` |
| R10 result | `e52dcca54763a8932259d9fb7a79776eae0df06269f823589e9785edb435805f` |
| Outcomes | `669d8561264aa3d5010db01f5826baa0b965087523efde5763895191570135b9` |
| Transcript | `59a0093fc81222aa93f8168eabf18f6262d9345ecbfd3550ff1d47f74b8869e4` |

## Review Questions

1. Do the four Prime contractions preserve Product, validator, and ABG
   authority while eliminating only repeated mechanics?
2. Do SDK, CLI, and Codex delegate consume one installed public operation
   contract without any alternate behavior?
3. Does the independently flavored Product depend only on declared installed
   exports while retaining all of its own Product meaning?
4. Does the path use the existing catalog with exact URI coordinates and the
   ordinary HoG/ABG runtime, with no second registry or resolver?
5. Are S03 and S05 preserved, and is S04 realization absent?
6. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, select S04, claim qualification, or authorize
release. Independent reviewers evaluate this exact cut. F_H then accepts or
returns one consolidated bounded repair set.
