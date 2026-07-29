# T-281 S06 Public And Native Contract Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` realization candidate against accepted
native-contract design `4f80f84a`. Independent review returned candidate
`4c3bb239` for five defects in the public operation contract projection and
native Product declaration closure. The worker applied one bounded repair, ran
mechanical gates, froze once, and stopped. This handoff records evidence; it
does not issue a semantic verdict.

S03 and S05 remain accepted. S04 remains planned 5.1 work. Prime entropy
reduction is a separate post-S06 design gate. Unified M5 freeze, M6
qualification, and M7 release remain held.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `4953508de83ab6d6c65dbb81e5407ccb539e44e6` |
| Candidate tree | `cd8bf69d79014e29e45bda52f9a785907eab8e74` |
| Candidate parent | `c46d90406b80cef9ee9d09e254417d8c1a36f3af` |
| Returned candidate | `4c3bb239cbdcfeb2587ff06ca736c77ce84af18f` |
| Accepted design | `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` |
| Accepted design tree | `7070dca7d0f2ca90374b525faa60d5b810488763` |
| Design SHA-256 | `ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |

The evidence commit is a direct child of the candidate and changes only active
status carriers and this handoff. Review implementation, focused mutations,
retained proof, and package at the candidate commit.

## Bounded Repair

The native SDK type, common parser, generated JSON Schema, CLI, and Codex
delegate now project one closed operation-and-variant definition family.
Operation-specific payload fields and outcomes derive from that family.
Malformed operation, variant, and payload shapes refuse at the common SDK
boundary. Operation-owned semantic refusals, including a missing continuation
prerequisite, remain distinguishable from parser refusal.

Native Product verification now preserves the exact `package.json` module
format in its TypeScript program. It retains all reachable self-package
declaration roots required by a public contract through F01 and F02 rather than
requiring subordinate roots to publish unrelated contracts.

The linked checker governs exact named type-only imports, including lawful
`typeof` use of a value symbol. Relation-wide type filtering remains confined
to forms such as type-only star relations.

Every external occurrence must have exactly one source contract before a
binding can be emitted. An occurrence with no source contract refuses instead
of disappearing from the complete binding set.

No new public operation, catalog, registry, runtime, controller, event family,
GTL compiler, lowering carrier, S04 realization, M6 work, or M7 work was added.

## Focused Falsification

Focused mutations cover:

- SDK and serialized-schema admission of unknown operations, variants, and
  undeclared payload fields;
- ESM-package refusal of `export =`;
- self-package subpath closure retained through F01 and F02;
- exact type-only import of a dependency value symbol;
- external occurrence without a source contract;
- external side-effect-only import refusal; and
- retained S05 public-operation and admitted-invocation behavior.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Build and generated manifest | pass |
| S06 native closure / Prime | `9/9` |
| S06 installed portability | `15/15` |
| Complete M5 | `181/181` |
| Retained M4 | `26/26` |
| S05 module in isolation | `18/18` |
| Rival-authority mutations | `10/10` |
| Installed R10 proof regeneration | `1/1` |
| `git diff --check` | pass |

Every reported test lane had zero failures, skips, todos, and cancellations.
Complete M5 ran after the final package basis and retained R10 proof were
regenerated.

## Reproducible Package

Two independent `git archive` extractions of candidate `4953508d` each ran
`npm ci --ignore-scripts --offline` and ordinary `npm pack --json`. The
archives and C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `287263398b31ea39b94cd140071f00b3ef372df6f4cdc6df06698ac67bb0673b` |
| SHA-1 | `d4fd38aafd524f28592a8cd66c29e67a3ca56d0f` |
| npm integrity | `sha512-P+KE/BKC9q8XglxBiHpAgFGlnrvgoXSs1xWGki2UO6aY9VIMSEOpuJU7MEw6fTLhBHKN2I6Lu5ctdKjYYOE/CA==` |
| Packed size | `2893601` bytes |
| Unpacked size | `17516144` bytes |
| Entries | `410` |
| Sorted payload inventory | `2cf73f22cfdd1cc7491e8e3eaaa71fd18478dc3154afeb6e4a4e59601a8dc5d7` |
| Product content | `sha256:6ca5d00ab0cca17080370eafaa744005110ca3cf2114784f195e5037f2d74428` |
| Manifest file | `a52991c8728b4e5c8fd01e2a4c9c33e7ff1dde47f6b31a790d06e6efd2d85df0` |
| Canonical manifest | `9b72ab3fbfc3a830bf22840ae3587acd0a855cd8ea84353f3a3bad868c376df6` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `bd785dda07f0465d692f744fcaf489a1a378186ecd941bda0c7fee2de7db7cd0` |
| Event log | `1eeac80d79141493081b786cbb8d20a069eacafbf22b19ee4738b1aa323f6fd2` |
| R10 result | `daaa7eff7b6bd7927fe78399f315921c0342c291b6ebcd8ee97e621d1c860eb1` |
| Outcomes | `6b103d85e56dbb77197f98c05e4d1708280d4715a4856ae358cf1da781f692e3` |
| Transcript | `ce8071288134deaec121deacfc75d9f859cc6b518086d63a070853aa7ae69544` |
| Rival authority | `5884f9d2afc72ae4ef450282bde0eec3ce27856864580d70b6f2c01c38def6d0` |
| Candidate basis | `369a0cecb690baded24a0d58d96c9faf836828d7cc1b10705ef2fa8837b5c474` |

## Changed Boundary

The candidate changes 19 tracked files:

- native declaration analysis and Product verification;
- the public operation definition, parser, operation projection, and generated
  schema;
- one manifest-generation input;
- focused S06, external-Product, and rival-authority tests; and
- the candidate basis and retained root-proof projections.

It changes no specification, accepted design, GTL, validator, HoG, ABG,
catalog implementation, Codex shell, S04 realization, M6, or M7 file.

## Review Questions

1. Do the native SDK, common parser, JSON Schema, CLI, and Codex delegate expose
   one closed operation-and-variant contract without erasing operation-owned
   refusal semantics?
2. Does native verification preserve the Product's exact module format and
   reject declarations that are unlawful under that format?
3. Do all reachable self-package declaration roots survive from F01 evidence
   into F02 linking without inventing public contracts?
4. Does the linked checker govern exact named type-only imports while
   relation-wide type filtering remains correctly scoped?
5. Must every external occurrence bind exactly once or refuse?
6. Do focused mutations close the returned defects without adding another
   Product surface, authority, or runtime?
7. Do the exact package and retained proof identities reproduce from the
   candidate?

The worker has stopped authoring. Independent review may recommend acceptance
or return findings. Direct F_H decides S06 closure and any transition to the
post-S06 Prime design gate.
