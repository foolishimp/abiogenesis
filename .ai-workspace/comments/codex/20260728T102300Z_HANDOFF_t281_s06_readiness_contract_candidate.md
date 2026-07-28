# T-281 S06 Readiness And Contract Candidate Handoff

## Purpose

Review one exact replacement `ABG5-S06` candidate. Independent review of
candidate `c0d2a3e6` retained the installed portability architecture and
returned two bounded authority defects:

- catalog readiness ignored exact capabilities and contracts supplied through
  the publishing Product's resolved dependency edges; and
- packed Product verification could accept a quoted false native export, a
  JSON Pointer resolving to a non-schema scalar, or the wrong digest law for a
  native typed group carrying both locators.

This cut repairs only those relations and their focused mutation proof. S03
and S05 remain accepted. S04 remains parked for 5.1. The worker has stopped
authoring. This post records mechanical evidence and does not issue a semantic
verdict.

## Exact Subject

| Property | Exact value |
|---|---|
| Candidate commit | `33ab384b14f7feb1bbab42f16c03f1724270eafd` |
| Candidate tree | `a5b86b5441666d679a86a6bc61da892883eab1ab` |
| Candidate parent | `daa3b85347a3180c8653a9ffd332e6a7fdd5aeaf` |
| Superseded S06 candidate | `c0d2a3e686ed589ce35efe629a351d149025a9d3` |
| Accepted S05 base | `1ddc802d3003a3d0782398f7ec7c74cfa81ab127` |
| M05 design digest | `248071c6b79d733425d16dfc5f0a4269514ddd94f1df09a2dc40451169165278` |

The evidence commit is a direct child of the candidate and changes only active
status surfaces and this handoff. Review runtime, tests, generated root proof,
and package at the candidate commit.

## Bounded Repair

### Reachable Dependency Readiness

Catalog construction starts at the publishing Product and traverses only its
exact resolved dependency edges. An edge contributes only the contract and
capability references it explicitly requires, and only after its exact target
row, package version, compatibility reference, required contracts, and
required capabilities agree with the resolved lock.

Unrelated lock rows contribute no readiness. An unknown prerequisite still
refuses before catalog admission.

### Packed Native Export Truth

Product verification no longer searches declaration text with a regular
expression. A Product-local lexical TypeScript declaration parser recognizes
actual top-level export declarations while excluding strings, comments,
templates, and nested declarations. It remains source-blind and introduces no
runtime package dependency.

A quoted `export const MissingSymbol` string therefore cannot satisfy a native
typed locator.

### Schema And Locator Law

A JSON `definitionRef` now succeeds only when the exact pointer resolves to a
JSON Schema value: an object or Boolean schema. Scalar metadata such as
`#/$id` cannot satisfy a schema definition.

The public contract kind closes its locator and digest law:

| Contract kind | Native locator | Asset locator | Contract digest |
|---|---|---|---|
| `native_typed_group` | required | optional | canonical native inventory |
| `schema_asset` | forbidden | required | exact asset bytes |
| `serialized_native_contract` | required | required | exact canonical asset |
| `vocabulary_asset` | forbidden | required | exact asset bytes |

The native and serialized catalog types and the published catalog schema carry
the same closed kind roster.

No new catalog, resolver, runtime, controller, event family, deep import,
copied runtime, or S04 realization entered the cut.

## Focused Proof

The S06 lanes now prove:

- a declared capability supplied by the flavored Product's exact reachable
  ABIogenesis dependency makes its contribution ready;
- an unknown readiness prerequisite still refuses;
- a quoted false native export cannot satisfy a packed locator;
- a JSON Pointer to non-schema metadata cannot satisfy a schema definition;
- a native typed group carrying both locators must use the native digest law;
  and
- the packed Product remains importable without its source tree or an ambient
  runtime dependency.

The accepted S05 durable Run binding, exact installed CLI shell, immutable
Product authority, publication binding, pre-install lock, shared GTL
constructors, and independent flavored Product remain regression-covered.

## Mechanical Evidence

| Gate | Result |
|---|---:|
| Complete M5 | `173/173` |
| Retained M4 | `26/26` |
| Independent external Product | `36/36` |
| S05 module within M5 | `18/18` |
| S06 Prime module | `4/4` |
| S06 installed portability | `12/12` |
| Focused S06 aggregate | `16/16` |
| Source-blind packed verification R1 | `1/1` |
| Conservation | `62/62` |
| Design files changed | `0` |
| `git diff --check` before freeze | pass |

Every reported test lane had zero failures, skips, and todos. Complete M5 was
run after retained M4 regenerated the root proof.

## Reproducible Package

Two independent `git archive` extractions of candidate `33ab384b` each ran
`npm ci --ignore-scripts` and ordinary `npm pack --json`. The archives and
C-sorted payload inventories are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `6005326e627cc57ccf4a72f2bb85f1ccc7306f6b7e5a7dc6f965f5fb6f85afd3` |
| SHA-1 | `040cd6cfe8979a6bb15656ea58e2d38c24031477` |
| npm integrity | `sha512-aazjygxzaJqUsvO1//XQx+400WFzoHUXLKg/+mYmWtItwvPgHq+CbPXq68rATq03fH5ihnefjJJCYvZiiV3how==` |
| Packed size | `329470` bytes |
| Unpacked size | `2453386` bytes |
| Entries | `197` |
| Sorted payload inventory | `b5ef43c73b4adf827bcee2ba214678543564e7e424808e0b8d50c5a8305a3fec` |
| Product content | `08f49cd14763b2dccb57e08fcbbe22d30af56cd05ef95bb543895a6fd5177d75` |
| Manifest file | `cbcd06a21ec03ba023b4ac336b788c01ac7ef5f8b50acfed9f671550651833da` |
| Canonical manifest | `7c4c397c97cfede286fec75f66f02a51f128aff9cdcaf4669a188f38abe000cd` |

The inventory digest is SHA-256 over C-sorted lines
`<file-sha256><two spaces><package-relative-path><newline>` from an empty
archive extraction.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `fb9a7e280d9473868922714adc1817ad2b6602dc796726f25266c0711d70e03f` |
| Event log | `001d2409a48af738edbd416daeebef2b713e6e7e523102c7d6848e3dc1ac6466` |
| R10 result | `6711e640e5e074526d3e0296dfc744ee3ba2afa96099620fe3610239db87e9a2` |
| Outcomes | `966666441141a9d46bb297fb10be369b28c46e6581876ddf08c07a95b3820bce` |
| Transcript | `f3e2616fc97dc55faeff07f1a79190dc3bf6537986447532cb12e9f9a6d3079a` |
| Rival-authority mutations | `8a567fc43bceaabf31ce572e25025959238b24f9d9ad5b47f4100abad65c92ab` |
| Candidate basis | `5a8aec3a30a2584fc8ca5f6d7fa8153351c3c93cbb4092787a032b491194c808` |

## Review Questions

1. Can readiness arise from anything except the publishing Product, its
   publication, or its exact reachable and satisfied dependency edges?
2. Can a string, comment, template, nested declaration, or absent top-level
   export satisfy a native typed locator?
3. Can a JSON Pointer resolving to a non-schema scalar satisfy a schema
   definition?
4. Does each closed contract kind enforce its permitted locators and exact
   constitutional digest law?
5. Do source-blind packaging, accepted S03/S05 behavior, the singular catalog
   and runtime, and S04 exclusion remain preserved?
6. Does the package reproduce from the exact candidate with the recorded
   archive and inventory identities?

## Non-Closure

This handoff does not accept S06, freeze unified M5, select qualification, or
authorize release. Independent reviewers evaluate this exact cut. Direct F_H
authority then accepts it or returns one consolidated bounded repair set.
