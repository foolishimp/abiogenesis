# T-270 S05 Catalog-Application Authority Handoff

## Purpose

This handoff binds one exact replacement S05 realization candidate for
independent review. It addresses the consolidated findings against candidate
`8fde581d` in one bounded repair:

- exact `node_type | overlay` public variants;
- exact node-or-Program targets for node-type application;
- Product-sealed concrete-value validation and contributor provenance;
- event-store-scoped ABG application admission and expiry;
- native/serialized Consensus domain parity; and
- an installed positive proof that an applied overlay controls Consensus
  ruling behavior.

The existing Product publication catalog remains the only catalog. This cut
adds no controller, runtime, event family, ticket, or S06 realization.

This is a worker handoff, not a semantic review verdict or S05 acceptance.
S06 remains held.

## Exact Subject

- accepted S03 base:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`
- superseded candidate:
  `8fde581d97dff06439c7de358e531f4f0d1525d9`
- replacement candidate:
  `c33ba46c4b9fdc49aca179fd3f111eb4357b1ce5`
- candidate tree:
  `8206b6846421725d2d6692b7b46d7d6c4f940e82`

The candidate-to-evidence delta is limited to `GOALS.md`, T-270, and this
handoff. Those surfaces project the review state; they do not alter the
candidate.

## Realized Boundary

### Product Validation

Product loads the exact installed provider and validates the selected
publication row, concrete value, membership, target or composition, and
contributor before minting the application candidate. The opaque receipt binds:

- installed Product, content, artifact, and manifest;
- publication and selected row;
- concrete value reference and digest;
- node-or-Program target for `node_type`;
- published Program composition for `overlay`; and
- the authorized workspace actor or exact row-owning Product.

An unrelated locked Product cannot be substituted as contributor. A structural
lookalike cannot substitute for the Product-minted candidate.

### Public And ABG

`catalog.apply` admits exactly `node_type` or `overlay`. Node-type application
requires one exact admitted node or Program target. Overlay application forbids
that target and requires its exact published Program composition.

ABG admits the Product-branded candidate only in the originating event-store
context. Cross-context reuse refuses, and closing that root context revokes the
application authority. Application appends no runtime or generic artifact
event.

### Consensus Projection

Consensus invocation bindings carry the exact application variant and target.
Serialized reviewer and submitter references reject whitespace-only values,
and integer domains stop at `Number.MAX_SAFE_INTEGER`, matching native
validation.

The installed One Surface proof applies a non-canonical ruling overlay, passes
its exact application reference into `run.invoke`, and derives the selected
ruling from the public result. The canonical no-overlay path remains green.

## Design Amendment

| File | SHA-256 |
|---|---|
| `M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md` | `9c689f8033dc5fe1fb2767d4b20f97445efb93eafd0c38807477dd53d0d845c2` |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | `2f67fd2a29e59a22a33693096ce296aed885dce0752bcb95a76ec533c2071aeb` |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` | `e0a4a9e47a3e60dc0026581d711e0a148d39b9f40ee042227b04508ae0843008` |
| `ADR-046-catalog-application-binds-concrete-values-without-runtime-events.md` | `1d6f918ab41516893d2265a7083e96aad99dc8d8d7ea0b0f25828b252c8571f9` |

The SHA-256 over C-sorted standard `shasum -a 256` member lines is:

`5f4f3c4547b61031e5e76cf86671aac9de2b341ec7fdbc7585516a1534fa195b`

## Mechanical Evidence

All commands ran serially against the candidate source state.

| Gate | Result |
|---|---:|
| Complete M5 | `157/157` |
| S05 module cases within M5 | `18/18` |
| Installed Consensus cases within M5 | `25/25` |
| Installed portability cases within M5 | `3/3` |
| Retained M4 | `26/26` |
| Installed external Product | `36/36` |
| S03 authority unit | `4/4` |
| Conservation projection | `62/62` |
| Affected GFM parses | `4/4` |
| Affected Mermaid renders | `16/16` |
| `git diff --check` | pass |

Every test aggregate reported zero failures, skips, and todos. The complete M5
run includes the focused forged receipt, unrelated contributor, wrong variant,
missing target, whitespace reference, cross-context reuse, context-close
expiry, and installed applied-overlay cases.

## Reproducible Package

Two independent `git archive` extractions of exact candidate `c33ba46c` each
ran `npm ci` and `npm pack --json`. The resulting archives are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `84535a40bf2514e6d4aae3e0ef5fb9836325bcddc5664e26f0bf6aed7bc3f84b` |
| SHA-1 | `48c57d91b8cdb4aa62f4d717c0b55d728a593d0c` |
| npm integrity | `sha512-3k/wSFYbybpyoAmdQRBtw/wgUU2i9COczIU9XuGxc0k5bhEy974S6lIAP+/IKk+yWD+3i3ZK4EW8DOtD6tGrnw==` |
| Packed size | `307863` bytes |
| Unpacked size | `2277336` bytes |
| Entries | `186` |
| Sorted payload inventory | `21d1ce1296d745e1446579312d58003c07f1c8997c297118fc86e0df1b8eb86e` |
| Product content | `8d9c582c9bf5a938e8378654b526b59ad3c5ccbb5cb5b1b27430bb90567f9fac` |
| Canonical manifest | `fc43e1e5609394cf257d186f1f88afce40038f3b3a759cf7564bc4d597f22011` |

The inventory is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction. Both archives produced the recorded digest.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `7e923938af793358f2cd1e430221eb6263362d814b2cb49ce7851a1671d6c87c` |
| Event log | `4f5817aa09ca89d5429fafafc03aef3db50a42c15cdc9c0dd9b261130993aa5e` |
| R10 result | `25dd488a99a75c0c602327a1601bdbea7bc2f3e4702d62493f68983cb1ce0859` |
| Outcomes | `69d71268fa26d180c8b271c092dd75343d839fd72dd1af98980cfe081d424e0e` |
| Transcript | `0c23a28f427303298517aa0c6a3c2f6e14fbff524ec541485aa89c6b48971620` |

## Review Boundary

Independent review should answer:

1. Does `catalog.apply` now realize the exact `node_type | overlay` operation,
   including one exact node-or-Program target for node-type application?
2. Can any caller fabricate the Product validation receipt or attribute a
   concrete value to an unrelated locked Product?
3. Is ABG application truth confined to the exact originating event-store
   context and revoked when that context closes?
4. Do native and serialized Consensus domains agree for references and safe
   integers?
5. Does an exact applied overlay, rather than a free caller field, control the
   installed Consensus ruling while the canonical path remains reachable?
6. Do the design amendment, code, tests, package, and retained S03/M4/external
   Product evidence project one relation without another catalog or authority?

Direct human acceptance remains required after independent review. No further
worker edits or self-review are authorized against this frozen subject.
