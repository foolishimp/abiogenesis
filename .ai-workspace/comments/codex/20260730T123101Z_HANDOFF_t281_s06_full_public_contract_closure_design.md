# T-281 S06 Full Public-Contract Closure Design Handoff

## Review Purpose

Review one bounded replacement over returned candidate `356aa6a2`.

That candidate correctly repaired the nested owner-contract join, preserved the
existing flat catalog carrier, and removed the pre-family witness digest. It
incorrectly treated the 44 schema, vocabulary, and corpus identities in
`REQ-P-PUBLIC-CONTRACTS-006A` as the complete public-contract publication
predicate.

This replacement repairs only that completion predicate. S06 realization,
native-occurrence realization, public-contract completion, Prime entropy
compression, S04, unified M5, M6, and M7 remain excluded.

## Exact Subject

| Identity | Value |
|---|---|
| candidate | `844df3fcbccaef97e27cc27264ad2622cea6e889` |
| tree | `c48e9df90bf125ac08d2c4b9183a7622d966859a` |
| parent evidence head | `a19c3a1209e9ccfa0d306578b0c50e309fbb26f0` |
| returned predecessor | `356aa6a24fbfaac32c9ce2bb4fbc8b78f59bcd92` |
| accepted supplemental parent | `2bb7b594920b1b126a6d314ed7bb39dabd211823` |
| design SHA-256 | `5da0de37d0eba0143f3562eaa7dfcb5caa323ab17f075c4b0fdc2aa88349adba` |
| requirement SHA-256 | `26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7` |
| two-file aggregate SHA-256 | `7fb350cd962342278f06d043d602af17bba6b9f51aee8cc9321dcd9eecf4d05d` |

The aggregate hashes the two displayed `shasum -a 256` output lines, in design
then requirement order, including their repository-relative paths.

The candidate commit changes only:

`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`

Its direct delta is 161 additions and 75 deletions. No requirement,
realization, schema, test, package, ticket, or status file is part of the
candidate commit.

## Corrected Relation

The design now separates:

```text
MandatorySchemaVocabularyCorpusGapSet
  = exact 44 REQ-P-PUBLIC-CONTRACTS-006A identities
    minus catalog row identities

PublicContractClosureResidual
  = all unsatisfied REQ-P-PUBLIC-CONTRACTS-005..011 obligations
```

The full residual covers:

- nine required contract-group identities, locators, and required content;
- 44 schema, vocabulary, and corpus row identities;
- every required native or asset locator and roster member;
- 18 operation identities and complete operation projections;
- one accepted capability-definition graph basis;
- 16 mandatory capability identities; and
- every owning-contract and dependency relation in the accepted graph.

An empty 44-row subset does not close the full residual. If no capability graph
has been accepted, the graph-basis obligation remains unsatisfied.
Implementation cannot select graph edges.

## Ownership And Timing

S06 may close with a non-empty full residual because it makes no ABIogenesis
5.0 conformance claim. S06 must preserve and expose the residual; it cannot
synthesize missing publication truth.

T-270 owns later `CompletePublicContractPublication` from exact owner-local
publications and the accepted capability graph. The full residual must be empty
before:

- unified M5 freeze;
- any ABIogenesis 5.0 public-contract conformance claim;
- M6 entry; or
- M7 entry.

This adds no catalog, operation, runtime, event family, service, registry,
analyzer, Prime carrier, or S06 realization obligation.

## Preserved Decisions

- The active family remains exactly 18 operations and 56 definition keys.
- All 24 `project.read` cases remain unchanged.
- The family-derived row to definition to slot to pointer join is unchanged.
- The existing `catalogId` and flat serialized catalog carrier remain singular.
- Native F01/F02 occurrence and binding algebra is unchanged.
- The intrinsic definition to family to payload to Product-content to catalog
  identity sequence remains acyclic.
- The 44-row set remains useful as an exact diagnostic subset.
- Rejected facade donor `e5902c55` and native donor `310966ab` remain excluded.

## Mechanical Readiness

| Check | Result |
|---|---|
| Pandoc GFM parse | `1/1` |
| Mermaid render | `3/3`, all SVGs non-empty |
| operation identities | `18` |
| definition keys | `56` |
| project-read cases | `24` |
| required contract groups | `9` |
| schema/vocabulary/corpus identities | `44` |
| required operation identities | `18` |
| mandatory capability identities | `16` |
| stale predecessor terminology | none |
| `git diff --check` | pass |
| requirement/realization/schema/test/package changes in candidate | `0` |

These checks establish exact identity and mechanical readiness, not semantic
acceptance.

## Bounded Review Questions

1. Is the 44-row roster now unambiguously a diagnostic subset rather than the
   full publication predicate?
2. Does the full residual cover every REQ-P-PUBLIC-CONTRACTS-005..011 group,
   row, locator, roster, operation, capability, and capability-graph
   obligation?
3. Does a missing accepted capability graph remain a typed gap without
   authorizing S06 or implementation to choose its edges?
4. May S06 close with the residual visible while unified M5, conformance, M6,
   and M7 remain blocked until T-270 empties it?
5. Did the correction preserve the nested join, flat catalog carrier, acyclic
   identity staging, 18/56 family, native F01/F02 algebra, and realization
   hold?

Review only these relations. Realization resumes only after direct acceptance
of this exact subject.
