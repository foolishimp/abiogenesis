# Review: Full Board — GOALS, Active Tickets, And The STDO 2.1 Basis

- reviewer: claude (independent, direct F_H commission — the
  return-for-status-review event named in the proxy mandate)
- date: 2026-07-25T02:30Z
- subjects: `specification_methodology` branch
  `codex/stdo-2.1-bounded-delivery-amendment` at `d6a0fd8`;
  `abiogenesis-5-root-build` promoted HEAD `bcd8769a` (live WIP excluded);
  GOALS.md; active tickets T-270, T-281, T-268, T-282, T-278
- method: destination gate first; all declared gates rerun in an **isolated
  detached worktree** at the promoted HEAD (live worktree carries active S06
  WIP)

## Destination Gate (my standing first check): PASS

What a user can do at `bcd8769a` that they could not at the 2026-07-24
rejection: author a **separately packed GTL product** in their own namespace
with their own contracts and judgment law; install it beside ABIogenesis with
a **non-empty dependency lock**; publish it through **caller-supplied**
`catalog.admit`; invoke it through a **product-neutral SDK/CLI**; hold for
F_H, read, respond, and continue across fresh public contexts; run ordinary
and supervised Consensus across three workspace outcomes; and drive the One
Surface intent loop (`synthesizeModel → evalGap → evaluateNext →
ConstructionIntent → F_H hold → project.read → interaction.respond →
run.continue → evaluateAction`) as Product content. Every wave since the
correction bound one Product outcome and moved user-facing rows. The drift
class is repaired at the constitutional level (`ABI5-M5-EXT-001` as Order 1;
`ABI5-ROOT-001` demoted to bootstrap/regression, "no longer projects Product
progress") and at the code level.

Front-door probes (the 2026-07-24 root cause): `constructHelloWorldModulePublication`
— **zero** references in `public/`/`product/`; the four-family
`run.invoke` dispatch — **gone**; `catalog.admit` reads the caller's
`publication` payload against the exact verified Product basis; `run.invoke`
resolves program/target **from the admitted publication**. Mini-product
isolation verified: `developer.example`/`greeting` — **zero** references in
core `src/`; the fixture compiles separately with its own tsconfig, package,
and contracts.

## Gates (isolated worktree at `bcd8769a`)

| Gate | Result |
|---|---|
| `test:m4` | **26/26** |
| `test:m5` (combined, 20+ suites incl. external, consensus, portability) | **123/123** |
| `test:m5:conservation` | **41/41, zero todo — all forty rows proven** |
| `test:m5:live-fp` (real `claude` binary) | **pass, 7.8s** |

GOALS' "M5 120/120" is three behind the head count (S06 tests landed after
the status line was written) — trivial staleness; suggest status lines cite
the gate at a pinned commit.

## STDO 2.1 — Found And Verified; Not Yet Lawful Operative Law (F1)

- Identity: single commit `d6a0fd8` on
  `codex/stdo-2.1-bounded-delivery-amendment` (2026-07-24 16:27 +1000);
  release record `releases/v2.1.0.md` honestly self-describes as
  **candidate** with qualification/review/acceptance/tag open.
- Member set: 41 paths retained, nine members changed; candidate digest
  recomputed by me with the declared algorithm: **exact match**
  (`4b4ca5d542a1839e2ced0c5c0b2b83299488e3c7667f7da6e4cff60f46d2a1b0`).
- Content: four supersessions mapping one-to-one onto the 2026-07-24 failure
  classes — outcome succession ("evidence cannot select, enlarge, or replace
  the outcome"), bounded-evolution presumption with explicit human selection
  for fundamental re-adoption, path-relative closure across the full causal
  closure, and the review-and-design horizon (findings block only on
  falsification/authority/safety/foreclosure; the anti-amplifier law).
  Substantively sound as the drift repair; the board is already operating in
  its shape (single bound outcome per wave, typed reprice stops, bounded
  proxy cadence).
- **Gaps to close before "governed by 2.1" is true**: (a) the branch is
  **unpushed — single-copy risk; push it now**; (b) steps 5–7 of its own
  checklist: independent exact-cut review, direct F_H acceptance of the same
  exact candidate, then release commit/branch/`v2.1.0` tag; (c) consumer
  selection: a bounded method-basis reprice in abiogenesis updating the six
  v2.0.0 pin surfaces (GOALS basis row + milestone note, PRODUCT governance
  boundary, CLAUDE.md, T-270 fields, T-282 basis) and re-materializing
  `.genesis/docs/standards/` with the nine changed members and the new
  digest. Until then `v2.0.0` remains the recorded operative law — the
  written chain is currently coherent and honest on that point.

## Governance Findings

- **F2 — missing durable records for the wave's two pivotal F_H events.**
  (i) The 2026-07-24 correction authorization (requirement/delivery-order
  reprice, EXT-001 governor, S02 reordering — and, riding on it, **S02
  closure**, which has no decision record at all) is asserted in GOALS and
  T-270 but exists nowhere as a decision file; (ii) the 2026-07-25
  delegation ("continue … until the human returns for status review") is
  quoted only inside each proxy decision. Both should be backfilled as
  DECISION records with the verbatim instruction and bounds, per the
  fp-authority/composition pattern.
- **Ratification set for the return review** (this review is that event):
  nine bounded-proxy decisions — gap re-entry repair; resolved run
  projections; typed reprice-required stop; graph-span re-entry; public
  next/asset targets; governed correction + **close S03**; S05 ordinary
  consensus design; **S05 implementation + advance S06**; S06 design. Each
  states the mandate and pins exact subjects; the two scenario closures are
  the stretch-points of "implementation and design cuts" and most deserve
  explicit F_H ratification.
- **F3 — requirement basis hygiene**: 61 requirement files still reference
  the mutable `/Users/jim/src/apps/specification_methodology` path; the
  69-file binding patch sits uncommitted in `abiogenesis-5-product-reprice`.
  Fold into the 2.1 method-basis reprice.
- **F4 — standing hazard**: the `specification_methodology` main checkout
  remains at rejected `c6c085a`; repoint it (origin/main or `v2.0.0`).
- **F5 — concurrent-worktree collision, including my own error**: the live
  worktree carries active S06 WIP (new `abg/executive_projection.ts`,
  `abg/tuning.ts`, `gtl/executive.ts`, `implementation/executive.ts`; three
  modified index/product_semantics files). My first gate run executed in
  that worktree without checking cleanliness — it collided with the WIP, and
  my routine `git checkout -- test_env/proof/` may have reverted
  WIP-regenerated proof artifacts (unverifiable retroactively; recoverable
  by rerunning the owning suite). All verification then moved to an isolated
  detached worktree. Recommendation: reviewer gate runs happen **only** in
  disposable worktrees while a pen-holder session is active.

  **F5 addendum (2026-07-25T03:10Z, forensic resolution):** mtime evidence
  resolves the incident precisely. Pen-holder gate run wrote proofs
  12:02–12:03 (+1000); WIP source edits 12:17–12:19; my colliding run
  12:45–12:47 — its `clean` step deleted `build/`, `tsc` failed on the
  mid-edit WIP, so no test runner ever started and no proof was written by
  me. My `git checkout -- test_env/proof/` was a **no-op**: every proof file
  retains its pre-collision mtime (checkout rewrites only files differing
  from the index, updating mtimes). Nothing was reverted; WIP source
  untouched (all seven files retain 12:17–12:19 mtimes). The single real
  side effect is the deleted, currently absent `build/` directory —
  generated state that self-heals on the pen-holder's next `test:*` run once
  the WIP compiles. The disposable-worktree rule stands, with the sharper
  rationale: a reviewer run in a pen-holder's worktree destroys generated
  build state even when it touches no source.

## Ticket-By-Ticket

| Ticket | State | Assessment |
|---|---|---|
| T-270 | sole M5 parent, `m5_s06_active`, reprice triaged 2026-07-24 at REQ-P-SCENARIOS-009/010 | Sound: substantive triage, all four design deltas hash-pinned, gates green, closure conditions intact |
| T-281 | released for S06 (native SDK/CLI parity, bounded Codex projection, independent flavored downstream catalog) | Sound: X-era 19-operation body explicitly demoted to donor evidence; owns the current frontier |
| T-268 | repriced for replay-grounded observer/tuner + final read model | Sound: drafts ratified via policy/F_H, no direct authority mutation, `design_reframe` re-entry into the accepted S06 delta; its implementation is the live WIP |
| T-282 | held for M6; pins v2.0.0 basis | Correct today; becomes the carrier of the 2.1 rebinding after release + selection |
| T-278 | held historical, superseded status fields explicit | Honest disposition; no authority ambiguity |
| T-247/T-248 | backlog carriers for M6/M7 | Per GOALS; unchanged |

Completed-ticket bookkeeping is clean: T-272/T-274/T-275/T-276 moved to
`completed/` matching GOALS.

## Recommendation

The board is in the best state I have reviewed: destination-correct,
gate-green at the promoted head, honestly recorded, and already operating in
2.1's shape. To converge record with reality: (1) push the 2.1 branch
immediately; (2) run 2.1's independent exact-cut review and your acceptance,
tag `v2.1.0`; (3) execute the abiogenesis method-basis reprice (folding F3);
(4) backfill the two F_H decision records and ratify the nine proxy
decisions plus S02/S03/S05 closures in one return-review decision; (5)
repoint the hazard checkout. S06 continues meanwhile under the existing
mandate.
