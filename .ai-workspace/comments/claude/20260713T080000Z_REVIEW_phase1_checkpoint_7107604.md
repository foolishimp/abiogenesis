# REVIEW: Phase-1 Checkpoint (7107604) — PASS

**Type:** REVIEW (monitoring seat; independent checkpoint review against the
checklist published before execution).
**Author:** claude · 2026-07-13
**Subject:** commit `7107604` "governance: align 5.0 stable-first authority" —
36 files, +1,556/−872, constitutional surfaces + ticket carriers.

## Verdict

**PASS — 8/8 checklist items verified.** Phase 1 is internally consistent,
the record discipline is exemplary, and the constitution agrees with itself
for the first time since 2026-07-10. Ready for the two F_H acts codex's
self-review names: confirm the T-244 register, ratify the T-249 diff.

| # | Check | Result |
|---|---|---|
| 1 | Ruling A persisted verbatim; R4 append-only | ✅ Stable-First Superseding Decision Record added; R4 preserved verbatim as Historical **with an explicit supersession boundary** (ladder superseded; source/install/product distinction retained) — better than the checklist demanded |
| 2 | T-249 full span executed | ✅ GOALS/INTENT/PRODUCT rewritten; REQ-R-ABG3-SELFHOSTING repriced; **REQ-P-CONSENSUS created** with exclusions verbatim (no scheduler/wake/mutation, "no new engine law"); REQ-P-QUAL + SELF-CONFORMANCE revised; REQ-P-INSTALL R7 review; TENANT_REGISTRY → Withdrawn |
| 3 | Consistency greps | ✅ no fixed-point/campaign mandates, no "Python paused," no retired tickets in closure gates |
| 4 | T-244 = the exact register | ✅ 12 rows `A5-F01..F12` with authority/proof/remaining/owner/dependency/exact-gate/risk-hedge; amendments honored in-row (F03: recompile oracle + non-Consensus consumer per atom; F08: three-view hedge; GOALS routes through T-244 as sole authority) |
| 5 | A1 dispositions recorded | ✅ T-243 completed "Option B, Predecessor Evidence Only"; B-010 stable-first deferral with 5.0.1 re-entry; T-245/246 retargeted to the dogfood wave; T-247 repriced to realized-compliance owner with hard evidence gate; T-248 stable-release owner |
| 6 | No new ticket tree | ✅ carriers amended in place; nothing minted |
| 7 | Code freeze | ✅ `git diff` on `code/` since baseline empty |
| 8 | Gates rerun (mine, not attested) | ✅ **1,499/1,501**; only the two known doc-drift reds (t193/t195); zero new failures from the constitutional rewrite; count delta (1,529→1,501) exactly the revert's removed tests |

## Self-review quality note

Codex's Phase-1 self-review found and repaired seven drift items during its
own pass (the GOALS alternate-reading loophole, builder→source/candidate
terminology, stale INTENT numbering, Python reconciliation, a stale T-230
owner, scenario-08 rewording, the 36-operation vs 16-capability distinction)
and honestly names its open gates. That is the review discipline working as
instituted.

## The one loose item for F_H at ratification

The standing reds are named-but-unruled: t193/t195 (CLAUDE.md and the release
note still say `4.6.0-rc.3` vs package `5.0.0-dev.0`), the lint:test-harness
lane (10 unused-var errors, 3 old files), and the A6 render checker (27/27
still attested, not reproducible). All are bounded entry-gate work; they will
trip every per-phase full-gates run until fixed or recorded as debt. My
recommendation: order the trivial fixes (lint + render checker) now, and tie
the doc-version reds to the T-248 release-note authoring where they have a
natural lawful fix point.

## State of the plan

Phase 0 (design dispositions) and Phase 1 (authority alignment) are
checkpointed pending the two F_H acts. Next per the approved plan: Phase 2,
the executable Consensus GTL design probe — exit gate: accepted design with
an exact typed gap census, no Consensus TypeScript. Product code remains
frozen until F_H ratifies Phase 1.
