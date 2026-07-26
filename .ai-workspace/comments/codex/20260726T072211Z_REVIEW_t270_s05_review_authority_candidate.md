# Independent Review - T-270 S05 Review-Authority Candidate

## Subject

- reviewed candidate:
  `61c7676ec38dcf91d6ab14396c5f1b87eb1f4ff3`
- reviewed tree:
  `a8c44d88686543673676178556a2aaff9876710f`
- evidence head excluded from subject:
  `2e32a6ec9051d032f2ec7bfef47bdc578ede4b18`
- reviewer:
  independent Codex sub-agent `019f9d31-fc83-71e0-8116-b9dc065c4530`

## Verdict

REQUEST CHANGES. S05 remains open and S06 remains held.

## Findings

1. P1 - a fresh candidate checkout cannot build or pack.

   The candidate removes the checked-in vocabulary projections, but
   `generate-product-manifest.mjs` writes their generated replacements without
   creating `contracts/vocabularies/`. Git preserves no empty directory. A
   fresh `git archive` therefore fails with `ENOENT` before package
   construction.

   Required correction: the generator must create every generated-asset parent
   directory. The exact replacement candidate must build, test, and reproduce
   both packs from a fresh archive without manual directory creation.

2. P2 - live design-scope metadata reports the prior S03 boundary.

   `design/README.md` still selects S03 and accepted M05 Sections 1 through 11.
   The M05 header still describes A5-F08 as later. GOALS instead selects S05,
   accepts Sections 1 through 12, and activates A5-F08 through candidate
   Section 13.

   Required correction: align the design index and M05 header without changing
   Product meaning or expanding Section 13.

## Confirmed

- no canonical direct bypass around supervised One Surface;
- agreement, dissent, and contract failure cannot enter F_H support;
- native reviewer parsing and serialized schema meaning share one source;
- valid preserved output is salvaged while outputless transport failure remains
  ordinary ABG failure truth;
- the generic ABG direct-supervised guard is effective and fail-closed;
- Section 13 contains the required bounded Ontology, atomic, Prime/IACS,
  three-view, lifecycle, axiom, operational-lifecycle, and module-proof
  surfaces; and
- no Consensus-specific runtime/controller/event/public path or later outcome
  entered the cut.

After manually creating the missing directory, the reviewer independently
reproduced M5 `147/147`, M4 `26/26`, Mermaid `10/10`, and two identical
183-entry packages with SHA-256
`85ca145e7d6755285f9c18f999f840888f8637c3e9788e35dd702a476f16d733`.

The repair is bounded to generated-directory construction and live design
metadata. No Product rewrite, new ticket, runtime family, or feature work is
authorized.
