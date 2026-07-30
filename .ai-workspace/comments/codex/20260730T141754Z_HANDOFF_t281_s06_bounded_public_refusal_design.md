# T-281 S06 Bounded Public Refusal Design Handoff

## Review Purpose

Review one bounded replacement over returned candidate `844df3fc`.

That candidate correctly distinguished the 44-row schema, vocabulary, and
corpus roster from complete publication. It then pulled a later T-270
release-closure evaluator into S06 without defining a complete proof and
satisfaction relation.

This replacement removes that evaluator from S06. It retains the 44-row
diagnostic and repairs only the indexed admission-versus-owner refusal relation
and the missing catalog-binding refusal projections.

## Exact Subject

| Identity | Value |
|---|---|
| candidate | `8dc59264e8aa32e606c925f6a933ba3131e41bde` |
| tree | `77a7ee374be4375c1b67d6cd9730dab6f04007e2` |
| parent evidence head | `58cebf40e9db7f974ed70e9665be19972e2e12df` |
| returned predecessor | `844df3fcbccaef97e27cc27264ad2622cea6e889` |
| accepted supplemental parent | `2bb7b594920b1b126a6d314ed7bb39dabd211823` |
| design SHA-256 | `25c5578552e0f4b47bf6f1711f579de3ca9ed7cd04b17b01c0bcaccba1dd710d` |
| requirement SHA-256 | `26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7` |
| two-file aggregate SHA-256 | `d79fe1d8db6649b7ae414a98b7e5d1532fd2405515839dd7508f15c68f57f132` |

The aggregate hashes the two displayed `shasum -a 256` output lines in design
then requirement order, including their repository-relative paths.

The candidate commit changes only:

`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`

Its direct delta is 212 additions and 209 deletions. No requirement, runtime,
schema, test, package, Prime, S04, M6, or M7 file is part of the candidate.

## Bounded Correction

The replacement:

- removes `PublicContractClosureResidual`,
  `RequiredPublicContractClosureObligationSet`,
  `SatisfiedPublicContractClosureObligationSet`, and
  `CompletePublicContractPublication` from S06;
- retains only
  `MandatorySchemaVocabularyCorpusGapSet = exact 44 required identities minus
  S06 catalog row identities`;
- states that the diagnostic is not generic Product verification, release
  closure, conformance, or later T-270 publication truth;
- keeps later public-contract publication ordered under T-270 without defining
  its algebra in this S06 design;
- defines `IndexedInvocationAdmissionRefusal<K>` with stable attempt identity,
  exact selected definition and catalog basis, and no admitted invocation or
  owner-refusal authority;
- permits `RefusalOf<K>` only after an admitted invocation reaches its exact
  owner port; and
- projects `PublicCatalogBindingRefusal` through the Ontology, domain,
  sequence, lifecycle, cross-view axioms, realization proof, and
  falsification gates.

The existing flat catalog carrier, staged identity order, 18-operation and
56-key family, 24 reads, PFC-F08A nested join, native F01/F02 algebra, and
accepted Prime/IACS boundary remain unchanged.

## Mechanical Readiness

| Check | Result |
|---|---|
| Pandoc GFM parse | `1/1` |
| Mermaid render | `3/3`, all SVGs non-empty |
| operation identities | `18` |
| definition keys | `56` |
| project-read cases | `24` |
| diagnostic roster identities | `44` |
| cross-view axiom rows | `26`, all ten columns |
| rejected closure-algebra terminology | none |
| `git diff --check` | pass |

These checks establish identity and mechanical readiness, not semantic
acceptance.

## Bounded Review Questions

1. Is later T-270 release/publication closure fully absent from S06 while the
   exact 44-row diagnostic remains useful and non-authoritative?
2. Does indexed admission refusal have stable attempt identity without
   manufacturing an admitted invocation or owner refusal?
3. Can owner refusal occur only after exact invocation admission and owner
   evaluation?
4. Does every PFC-F08 failure project as `PublicCatalogBindingRefusal` across
   the Ontology and all three views?
5. Did the correction preserve the flat catalog, acyclic identity staging,
   18/56/24 family, nested contract join, native occurrence algebra, and
   no-new-Prime boundary?

Review only these changed relations. Realization, Prime entropy compression,
S04, unified M5, M6, and M7 remain held until direct acceptance of this exact
subject.
