# STATUS: 5.0 → 5.0.1 Progress Board (living)

**Type:** STATUS read-model (derived view, non-authoritative; revised in place
by claude at every monitoring checkpoint). Authority: T-244 register, T-242,
the approved nine-phase plan.
**Last updated:** 2026-07-13 · after T-251 PASS (`2442cd3`) · watching T-250

## Board

| # | Item | Carrier | Status |
|---|---|---|---|
| 0 | Design back-fill (9 designs) | register | ✅ done |
| 1 | Stable-first authority (T-249) | T-242/249 | ✅ done, PASS 8/8 |
| 2a | Lint + design-render gate | T-251 | ✅ done, verified |
| 2b | Version-basis fix (t193/t195) | T-250 | 🔄 executing |
| 3 | Consensus GTL design probe | new leaf | ⏳ next after 2b |
| 4 | Invocation spine (4 leaves) | F03/F04/F07 | ⛔ needs design rework |
| 5 | workflow.C → C.batch → C.retry | F03 | ⛔ after probe census |
| 6 | Consensus as GTL function | F08 | ⛔ after 4+5 |
| 7 | Retained surface (36 ops, 16 caps) | F05/06/07/09/10 | ⛔ after 3–6 |
| 8 | Compliance (self-conf, witness) | T-247 | ⛔ after features |
| 9 | Release 5.0.0 (RC → tag) | T-248 | ⛔ last 5.0 step |
| 10 | odd_glc 1.0 over 5.0 | odd_glc repo | ⛔ post-release |
| 11 | Dogfood scaffold + pilot | T-245 | ⛔ post-release |
| 12 | 5.0.1 built as GLC project | T-246+B-010 | ⛔ the dogfood proof |

## Gates and evidence (short)

- Suite now: 1,504/1,506. Only reds = t193/t195 (T-250's scope).
- Design gate: `check:design-mermaid` green (9 files / 27 views, pinned 11.3.0).
- Lint lanes: all green. Pack census: clean.
- Code freeze: holds for product code; only T-251's test/gate work landed.

## Design verdicts (gate Phase 3–7 entry)

| Verdict | Count | Meaning |
|---|---|---|
| candidate | 3 (+1 split) | need F_H `accepted` before their code |
| blocked | 4 | need rework → accepted (spine, SDK/CLI, F_P, vertical) |
| rejected | 1 | consensus as-built (calibration case; stays rejected) |

## Next checkpoints I will verify

1. T-250 lands → 7 differentials, rc.3 bytes untouched, suite fully green.
2. Phase-2 probe design → three-view review + typed gap census.
3. Each atom (Phase 5) → recompile oracle: expected gap vanishes, no
   feature-specific code.
