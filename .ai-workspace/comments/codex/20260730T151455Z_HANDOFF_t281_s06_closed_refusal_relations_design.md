# T-281 S06 Closed Refusal Relations Design Handoff

## Review Purpose

Review one bounded replacement over returned candidate `8dc59264`.

That candidate correctly removed later release-closure assurance from S06 and
separated indexed admission refusal from owner refusal. Review returned two
underconstrained failure routes: PFC-F08 catalog binding and common pre-index
envelope admission. This replacement closes only those routes and corrects the
two PFC-F05 aliases.

## Exact Subject

| Identity | Value |
|---|---|
| candidate | `aa0daa626b0f4ea05058d7ef7541afc8eaf350b5` |
| tree | `9fa256630bc3d40d31f0bb7d6a70fd303e29c923` |
| parent evidence head | `81e9e47e200e052c5ebcc30a7fe1e2e821825426` |
| returned predecessor | `8dc59264e8aa32e606c925f6a933ba3131e41bde` |
| accepted supplemental parent | `2bb7b594920b1b126a6d314ed7bb39dabd211823` |
| design SHA-256 | `236d1d3394b987fd9aeaa5676f72b6ec08941b895d873b6c4d879cbe9cd379ce` |
| requirement SHA-256 | `26eb36ca6701ac9970b2e4d63b1125a48353cf553c37addbb85c9586e9204ad7` |
| two-file aggregate SHA-256 | `297e324af627857ad5ce90a3987cf34a96b0bb2696cb9e368766d97a97df8488` |

The aggregate hashes the two displayed `shasum -a 256` output lines in design
then requirement order, including repository-relative paths.

The candidate changes only:

`build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`

Its direct delta is 319 additions and 75 deletions. No requirement, runtime,
schema, test, package, Prime, S04, M6, or M7 file is part of the candidate.

## Bounded Correction

The replacement:

- defines one exact `PublicCatalogBindingAttempt` and a closed
  `PublicCatalogBindingRefusal` failure enum, input basis, ref/digest law,
  Product-owned native source, and canonical schema coordinate;
- adds subordinate PFC-F03A common-envelope admission with one
  `PublicInvocationEnvelope` or typed `PublicEnvelopeAdmissionRefusal`, then
  leaves exact family selection to PFC-F03B;
- keeps malformed envelopes, family lookup refusal, indexed admission refusal,
  owner refusal, and catalog-binding refusal disjoint;
- corrects PFC-F05 to return the defined `ResultOf<K>` and
  `NonTerminalOf<K>` aliases; and
- reconciles only the affected Ontology, authority, Prime/IACS, domain,
  sequence, lifecycle, axiom, realization, and falsification rows.

The exact 44-row S06 diagnostic remains non-authoritative. Later complete
public-contract publication remains under T-270. No operation roster, owner
payload algebra, native occurrence relation, release-closure evaluator, new
Prime carrier, or realization file changed.

## Mechanical Readiness

| Check | Result |
|---|---|
| Pandoc GFM parse | `1/1` |
| Mermaid render | `3/3`, all SVGs non-empty |
| operation identities | `18` |
| definition keys | `56` |
| project-read cases | `24` |
| diagnostic roster identities | `44` |
| cross-view axiom rows | `28`, all ten columns |
| rejected closure-algebra terminology | none |
| `git diff --check` | pass |

These checks establish identity and mechanical readiness, not semantic
acceptance.

## Bounded Review Questions

1. Does every PFC-F08 refusal bind the exact extant catalog, family, supplied
   proposal set, Product identity/content, attempt identity, closed failure
   class, and native/schema contract without producing a catalog?
2. Does PFC-F03A alone admit or refuse the common native/JSONL envelope before
   PFC-F03B family selection and PFC-F04 indexed admission?
3. Are common-envelope, family-lookup, indexed-admission, owner, and
   catalog-binding refusals disjoint across the Ontology and all three views?
4. Did the delta preserve the bounded S06 diagnostic, flat catalog, acyclic
   identity staging, `18/56/24/44` census, native F01/F02 algebra, and
   no-new-Prime boundary?

Review only these changed relations. Realization, Prime entropy compression,
S04, unified M5, M6, and M7 remain held until direct acceptance of this exact
subject.
