# T-270 S05 Policy, Catalog, And Schema Repair Handoff

## Purpose

This handoff binds one exact replacement candidate for independent review.
It addresses the consolidated findings against S05 candidate `5ceb9401`
without adding a catalog, runtime, controller, event family, ticket, or later
Product outcome.

This is a worker handoff, not a semantic review verdict or S05 acceptance.
S06 remains held.

## Authority

- selected outcome: `ABG5-S05`
- owner: `T-270`
- accepted S03 base:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`
- superseded candidate:
  `5ceb940123dee9d64332d6a744a35194a171007d`
- exact replacement candidate:
  `8fde581d97dff06439c7de358e531f4f0d1525d9`
- candidate tree:
  `2c9887db1b395501d78e7037dd89fb452f7cbf1d`

The accepted S05 Product function is unchanged. The catalog-application
clarification is candidate design evidence pending exact-cut review.

## Bounded Repair

### Canonical And Overlaid Policy

- The canonical material-dispute relation is reachable with no overlay and
  produces `decision_row`.
- A downstream ruling overlay is optional.
- An applied overlay binds the exact One Surface Program, reducer
  GraphFunction, policy contract, and canonical disagreement rule before it
  may select an alternate ruling.
- A free caller policy field cannot substitute for the applied overlay.

### Existing Catalog Only

- The existing Product publication catalog remains the only catalog.
- A catalog row handle is a URI category coordinate.
- `catalog.apply` derives the concrete applied handle as a child URI of that
  coordinate using the validated value digest. No second resolver or
  hierarchy mechanism was introduced.
- Product semantics validates the complete concrete subject, profile,
  instruction, policy, or overlay value and derives its exact reference,
  digest, and Program memberships.
- Contributor provenance is either the authorized workspace actor or an exact
  Product in the resolved dependency lock.
- Node-type applications have no Program membership. Overlay applications
  bind at least one exact published Program.
- ABG admits the application as operation-local authority after validating
  the existing CatalogView cause. It appends no runtime event.

ADR-046 records the REQ-P-CATALOG-030 interpretation: catalog application is a
workspace operation and authority transition, not runtime execution truth.

### Contract And Instruction Meaning

- Serialized reference schemas now reject whitespace-only values, matching
  native nonblank-reference validation.
- Distinct reviewer profiles may share one exact instruction contract.
- Contribution validation requires node-type Program membership to be empty
  and overlay Program membership to resolve to published Programs.

### Focused Negatives

The candidate refuses:

- uncataloged concrete values;
- a free caller-supplied value digest without the concrete preimage;
- a Product contributor absent from the resolved dependency lock;
- an unapplied alternative ruling overlay;
- malformed contribution membership;
- whitespace-only serialized references; and
- unknown or callable catalog rows at the existing public boundary.

The persisted portability trace contains its admitted CatalogView event and
contains no catalog-application artifact event.

## Design Amendment

The exact candidate design subject is:

| File | SHA-256 |
|---|---|
| `M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md` | `f8ded18363a97ee7cdf28742b6a7f919e624b872b438f66eb0edc30250573711` |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | `58e3a5f7f8b477aa4fb3c4562be0ff5d3083f4d7662a9b4c5b5537e0ce7932f0` |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` | `7d47e9aec8b4e6578fccc085f79b97a2391fc84aab9214c6b02959c706ee7be2` |
| `ADR-046-catalog-application-binds-concrete-values-without-runtime-events.md` | `09d9760570bbe65bef3724f95e1fc8969ef2339010f4ca766c61ff1608ca5184` |

The aggregate is computed from C-sorted lines in the form
`<sha256><two spaces><repo-relative path><newline>`:

`c8f1d7f40778357061fec5ac8fed8a9f75c1baa150407021832405702d59696e`

## Mechanical Evidence

| Gate | Result |
|---|---:|
| S05 module proof | `18/18` |
| Installed Consensus | `24/24` |
| Complete M5 | `156/156` |
| Retained M4 | `26/26` |
| Installed external Product | `36/36` |
| S03 authority unit | `4/4` |
| Conservation projection | `62/62` |
| M05 Mermaid | `10/10` |
| S05 Mermaid | `3/3` |
| Affected design Pandoc parses | `3/3` |
| `git diff --check` | pass |

All test commands ran serially. M5, M4, external Product, S03, and
conservation reported zero failures, skips, and todos.

## Reproducible Package

Two independent `git archive` extractions of the exact candidate each ran
`npm ci` followed by `npm pack --json`. The archives are byte-identical.

| Property | Exact value |
|---|---|
| Archive | `abiogenesis-typescript-tenant-5.0.0-dev.286.tgz` |
| SHA-256 | `d676a4a348754a4c6782e53bcec325fba12d7286726978fda20d1bf3447f2f16` |
| SHA-1 | `e0d7ef764de427dbefa0a8465a1d8d47f1e22974` |
| npm integrity | `sha512-9BgKiKJf+pmlWzKY1SHLqLXKIufFnNV1796542vrj7Dph3HDw4wL7+PWA4su1u89ted6GnduM58GOmKcNVrIaw==` |
| Packed size | `305754` bytes |
| Unpacked size | `2264448` bytes |
| Entries | `186` |
| Sorted payload inventory | `eacf1da006de19b62c1994cdf65f9e6f5192c63cdad6135fe58d4c7b0310541c` |
| Product content | `3e05d3e5e02d6c63be468bd5185aa2f2f61e89cd6b306937b2f295927d21d2a2` |
| Canonical manifest | `da3d214d6e4ee8375cb76a2591132da7204cd9500146945f6c044573e106bed2` |

The corrected inventory algorithm is:

```sh
tar -xzf <archive> -C <empty-directory>
cd <empty-directory>/package
find . -type f -print | LC_ALL=C sort |
  while IFS= read -r file; do
    digest=$(shasum -a 256 "$file" | awk '{print $1}')
    printf '%s  %s\n' "$digest" "${file#./}"
  done |
  shasum -a 256
```

Both independent extractions produced the recorded inventory digest.

## Retained Root Proof

| Proof | SHA-256 |
|---|---|
| Governor | `819c9c40e2168afeb68951f6b3e3105510057b0b1908b8998a0fc1f916e5e0f2` |
| Event log | `2712264739be739579bc53d27899fd9557209807d97492e5cda5fde18c8f8f14` |
| R10 result | `2edae6f4ca6082ce4b88fe5d63dbee708d9351d49c5720710c7989ff38ced357` |
| Outcomes | `e6d324ed2ef6bb2263e47415fa2887c993ad011f1149989d311dc222f84408f5` |
| Transcript | `f45191b4958dca0f1122478758fca3f2295ea2c45a49cac42d4ad308dfc420cc` |

## Review Boundary

Independent review should answer:

1. Is the canonical disagreement rule reachable without an overlay, with any
   alternate ruling selected only by an exact applied overlay?
2. Does `catalog.apply` admit only a Product-validated concrete value under
   exact contributor provenance, rather than a caller-asserted digest?
3. Does the operation-local, no-runtime-event application relation faithfully
   reconcile REQ-P-CATALOG-030 without creating another catalog or event
   authority?
4. Do native and serialized reference domains agree, and may distinct
   reviewers share one instruction contract?
5. Does the design amendment project those relations without changing the
   accepted S05 Product function or reopening S03?
6. Do all retained S05, S03, external Product, M4, and package guarantees
   remain intact?

Direct human acceptance remains required after independent review. This
handoff does not provide it.
