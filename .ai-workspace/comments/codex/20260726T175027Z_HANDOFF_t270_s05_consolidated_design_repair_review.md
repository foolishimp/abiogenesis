# Handoff - T-270 S05 Consolidated Design Repair Review

## Purpose

Three independent review payloads rejected the first global-to-local cut at
aggregate `6a809f94...ca2be1`. Their findings were consolidated before this one
bounded repair pass. No runtime code was changed.

The controlling topology decision follows unchanged Product law: unresolved
F_H escalation remains a hold, response, and continuation inside the same
admitted Run and causal ABG episode. The rejected direct support invocation and
separate target Run are not retained.

## Exact Review Subject

Review these files in this order:

1. `specification/requirements/product/REQ-P-CONSENSUS.md`
   - SHA-256:
     `12bab5c07ca0f9a0fe0075f1df8a766f4333cf43f8e347c03799b20f280eed89`
2. `build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`
   - SHA-256:
     `f5d9d4445a66eda58fc8d8fcc4abd0d772913f40937a8d192e31d25044f1d2b5`
3. `build_tenants/abiogenesis/typescript/design/adrs/ADR-045-global-design-constraints-survive-local-projection.md`
   - SHA-256:
     `de6301adfa25185d5eace74124530a852d9cebe4ce784263dd638bba03896755`

Aggregate:
`5d01783b843481fc60a3a947a65522bc53620dd01cc87350fe2e0441015567cb`.

The aggregate is SHA-256 over the three standard `shasum -a 256` output lines,
including paths and newlines, in the stated order.

## Consolidated Finding Disposition

| Review finding family | Repair location |
|---|---|
| missing REQ-003, 006, 007, and 013 projections | requirement-projection table and global decisions 13 through 15 |
| reviewer result occurrence not constructible | REQ-006 plus `ReviewerOccurrenceKey` and reviewer algebra |
| round, ruling, classification, exhaustion, and contract-failure algebra incomplete | REQ-008/008A plus `RoundDecision` and `ConstructRulingVector` |
| F_H finalization underdesigned and non-singular | REQ-015/015A plus same-Run `FinalizeHumanDecision` |
| Product same-Run law contradicted by separate support episode | direct support invocation removed; one hold/respond/continue Run |
| function authority/module placement ambiguous | complete semantic-function/module/interface/output matrix |
| Ontology, lifecycle, authority, Prime, and IACS absent | affected Ontology, lifecycle/authority matrices, Prime contraction, and IACS sections |
| three views and cross-view evaluation absent | three rendered Mermaid views and ten-column axiom table |
| operational lifecycle and module proof absent | explicit lifecycle and module-owned proof sections |
| M05 Section 13 competing with the delta | GOALS/design index demote it to discovery evidence; replacement supersedes it upon acceptance |
| direct F_H affirmation obligation absent | REQ-015A and design acceptance predicate |

## Accepted And Excluded Basis

- Accepted Product/design base: S03 candidate
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`, M03 and M05 Sections 1 through
  12.
- Current implementation at `7c27f0aa642fb5922e7895bb14575f86e19464a4`
  remains provisional design-discovery evidence.
- M05 Section 13 is not current S05 design authority.
- Runtime implementation, S06, observer/tuner, qualification, and release are
  outside this subject and remain held.

## Review Focus

Review from Product and requirements through the complete constraint network:

1. Product consistency and singular same-Run F_H topology.
2. Total reviewer-failure, occurrence, ruling, round, result, and human-decision
   algebras.
3. One workspace contract across existing, alternate, and temporary roots.
4. Complete Ontology-to-Prime-to-IACS-to-module-to-three-view derivation.
5. Cross-view agreement, operational lifecycle, and module-owned proof.
6. No rival controller, runtime, event family, result store, public entry,
   semantic owner, or design authority.

## Mechanical Readiness

- `git diff --check`: pass.
- GFM parse through `pandoc`: pass.
- Mermaid CLI `11.3.0`: all three diagrams render.
- Rendered SVG sizes: 92,895, 46,158, and 57,866 bytes.
- Exact three member hashes and aggregate reproduce.
- Runtime tests and package builds: not run because this is a design-only
  repair and implementation remains held.

These are mechanical readiness claims, not semantic acceptance.

## Role And Stop Condition

The worker issued no semantic verdict. Independent reviewers now assess this
exact replacement subject. No authoring changes should occur during review.

If the repaired cut is clean, direct human acceptance must separately affirm
REQ-P-CONSENSUS-015A's same-Run F_H topology before implementation resumes. A
further architectural finding returns to design or direct human direction; it
does not authorize another autonomous patch-review loop.
