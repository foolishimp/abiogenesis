# T-272 First External One Surface Vertical Checkpoint

**Category**: CHECKPOINT
**Date**: 2026-07-24
**Owner**: Codex
**Disposition**: first S03 vertical green; S03 remains open

## Claim

An independently packed developer Product now starts one supervised,
Program-owned GTL path through the installed public surface:

```text
run.invoke(start)
  -> Program start selects its GraphFunction
  -> synthesizeModel
  -> evalGap
  -> evaluateNext
  -> nonterminal F_H hold
  -> project.read in a fresh context
  -> interaction.respond in a fresh context
  -> run.continue in a fresh context
  -> evaluateAction
  -> same-Run ABG replay and typed closure
```

The public start request cannot author a rival `graphFunctionRef`. The target is
derived from the admitted Program start. The continued traversal re-enters the
exact HoG cursor from durable ABG truth; no process-local continuation authority
or lowered execution carrier is used.

## Exact Product Evidence

- package artifact:
  `sha256:0de23bd2344be03707c53846bd2570d50ee30ff59f9b12273b1e13e1a40dbed6`;
- Product content:
  `sha256:ead3ed2d12c66b977b531a5bdc1c1f228f0b5f813c46c276219c6d952d3b8026`;
- manifest:
  `sha256:91c419c9a022af9b416a098734314c73666011e6959a2251535cd8878301a18a`;
- two fresh packs reproduced the same artifact digest.

## Verification

- `npm run test:m5`: `74/74`;
- `npm run test:m4`: `26/26`;
- live Claude F_P with explicit real executable: `1/1`;
- installed external developer Product: `3/3`;
- `git diff --check`: pass.

## Boundary

This checkpoint proves a developer-visible vertical path, not S03 closure. It
does not yet prove:

- `ConstructionIntent` admission between next-action evaluation and work;
- separate evaluator-result, evidence, or action-evaluation admission;
- post-evidence refresh of model, gap, next-action, and action-result truth;
- every retained consequence, runtime-disposition, and public-control row; or
- final forty-row qualification reconciliation.

Those gaps remain under the existing T-272/T-270 ownership. No new ticket,
compiler, lowering carrier, public controller, or second runtime was added.
