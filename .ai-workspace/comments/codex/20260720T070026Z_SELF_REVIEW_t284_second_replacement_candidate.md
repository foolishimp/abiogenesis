# SELF REVIEW: T-284 Second Replacement Candidate

**Author**: codex
**Observed at**: 2026-07-20T07:00:26Z
**Ticket**: T-284
**Candidate**: `c6ff2e37cd1b0aab27dbca16419b175e0161cf7b`
**Status**: bounded repair verified; independent exact-cut review pending

## Scope

This review covers only the two blockers returned by the independent review of
candidate `7f69aa83`:

1. the generic `XC41` archive disposition hid live requirement-tracing donor
   carriers; and
2. D6 incorrectly coupled pre-tap downstream portability to tapped STDO 2.0.

It does not reopen the accepted Product, the nine requirement amendments, the
zero-inherited successor decision, or the selected Fundamental Re-Adoption
strategy. It does not accept M3 design or authorize runtime work.

## Finding Replay

| Finding | Reproduction | Repair |
|---|---|---|
| `XC41` was arithmetically complete but semantically false | Reproduced: 120 paths entered a generic fallback; the independent reviewer found 56 TypeScript paths tracing live requirements | Removed the fallback. `execution_declaration_compiler.ts` enters explicit lowering retirement `XC08`; every other former fallback path enters one of `XC41`-`XC49` with class, action, destination, admission stage, and owning proof. An unmatched path now fails reproduction. |
| D6 made S06 depend on STDO 2.0 despite M5-before-M6 authority | Reproduced in RCI-09 and the D6 definition | Moved the independent flavored-catalog fixture and `ABG5-S06` to D5. D6 now owns only tapped-STDO self-conformance, qualification, release, and post-publication proof. |

## Exact Checks

- candidate commit: `c6ff2e37cd1b0aab27dbca16419b175e0161cf7b`;
- candidate tree: `862f58a204397bda2f709bfca1535fb60d38b8bb`;
- constitutional subject: unchanged at 86 files, SHA-256
  `5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69`;
- nine-family requirement amendment: unchanged at SHA-256
  `d7f88193122d015cb0cfbeb8e9d556c4e0c36a85ffdbf9dfe78054283f3163cf`;
- correction vector: SHA-256
  `26cf209f269b86ab7dda924af2dfedeb5edf36bd7fb74cac2b183f092b0ab8e9`;
- X membership evidence file: SHA-256
  `bdb13c81868032ca55fae0d8d7ec4caa46a43aa66a8d95aaf38bb30d98ee7133`;
- frozen-X membership: 1,935 paths, 49 inhabited first-match families,
  SHA-256
  `9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1`;
- `XC08` now contains two lowering carriers; `XC41`-`XC49` contain the
  remaining 119 former fallback paths; and no fallback predicate exists;
- RCI-09, A5-F17, ABG5-S06, D5, and D6 agree on pre-tap portability and
  tapped-STDO qualification ordering;
- the rejected-candidate independent review is persisted at SHA-256
  `2092238392ab30912d9f5b87ef5ee931206fc99249ebdef08807045a2241edc4`;
- changed Markdown tables retain their declared column shapes;
- `git diff --check` passes; and
- candidate `c6ff2e37` changes no runtime, test, package, generated,
  qualification, release, constitutional, or M3 design path.

## Residual Boundary

The nine new X families classify donor value; they do not authorize wholesale
copy-forward. Every selected carrier remains sideways until M3 names an exact
destination and its owning proof admits the behavior. The final-integration
dirty snapshot remains archive-only under T-284.

## Verdict

The two independent-review blockers are repaired without upstream semantic
change. Candidate `c6ff2e37` is ready for a fresh independent exact-cut review.
It is not self-accepted. M2 and the implementation hold remain active.
