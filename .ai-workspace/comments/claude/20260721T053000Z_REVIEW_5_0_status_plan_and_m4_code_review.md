# REVIEW: ABIogenesis 5.0 Status, Forward Plan, and T-286/M4 Code Review

**Type:** REVIEW (reviewer seat; requested evaluation of current 5.0 status,
forward plan, and code, using STDO as the governing lens).
**Author:** claude · 2026-07-21
**Verification basis:** all five 5.0-relevant worktrees inspected directly
(`abiogenesis`, `abiogenesis-5-root-governor`, `abiogenesis-5-final-integration`,
`abiogenesis-5-product-reprice`, `abiogenesis-5-root-build`); `specification_methodology`
inspected directly for the STDO 2.0 method-release state; `test:m4` gate suite
**re-run from a clean build in this session**, not taken on report.

## Verdict

**Status is healthy and honestly reported. The forward plan (M5 -> M6 -> M7) is
coherent and the RC5 conservation obligation that a 2026-07-19 review flagged as
a P1 gap has been formally dispositioned, not dropped. T-286/M4's code
independently reproduces green.** One real defect exists, but it is not in
abiogenesis: `specification_methodology` has committed a premature
`tapped_release` self-declaration for STDO 2.0 to `main`, which is exactly the
failure mode abiogenesis's own `PRODUCT.md` already forbids, and it sits
directly on the path to `M6`.

## 1. Status

Milestone ladder (`GOALS.md`, `abiogenesis-5-root-build`, the current frontier
worktree):

| Milestone | State |
|---|---|
| M0 reify constitution | Completed (T-283) |
| M1 close constitutional destination | Completed (T-283) |
| M2 freeze donors, correction vector | Completed (T-284) |
| M3 accept direct-GTL design | Completed (T-285) |
| M4 installed root (`ABI5-ROOT-001`) | **Completed (T-286 at `ffba4e71`)** |
| M5 pre-qualification behavior | Ready; not opened |
| M6 adopt STDO 2.0, qualify | Blocked by M5 and the STDO 2.0 tap |
| M7 release 5.0.0 | Blocked by M6 |

This is a recovery from the 2026-07-19 seven-day-delivery-failure postmortem
(SDK-as-controller, unadmitted semantic authority, 9/19 handlers unconnected,
dual public truth, lost RC5 lineage). The recovery line is: postmortem ->
destination reprice (F_H-accepted 2026-07-19T18:04) -> T-283 (M0/M1) -> T-284
(M2, correction vector) -> T-285 (M3, direct-GTL design) -> T-286 (M4, installed
root). `abiogenesis-5-root-build` at `e0575b82` (2026-07-21T06:54 local) is the
absolute frontier — nothing later exists in any worktree, and no M5 ticket,
comment, or uncommitted work exists anywhere. About 8 hours idle at review time.

**The "two divergent lanes" question flagged in earlier working notes is
resolved, in writing, not just de facto.** T-284's correction vector froze both
the original `abiogenesis` main-line attempt (`X`) and `abiogenesis-5-final-integration`
as immutable sideways donor/evidence lines (archived at
`origin/archive/t284-x-freeze-20260720T022230Z` and
`origin/archive/t284-final-integration-freeze-20260720T032908Z`), classified
every carrier in both (1,935-path predicate membership for X; a 4-row donor
census for final-integration), and was independently reviewed and F_H-accepted
before M3 opened. I confirmed this holds at the Git level: `git merge-base
--is-ancestor` shows neither `X`'s nor final-integration's HEAD is an ancestor
of the current frontier, and a source grep for `worker_executes` in the M4 tree
correctly returns zero hits — the old implementation genuinely did not cross,
exactly as designed, not by accident.

## 2. Plan

The M5 -> M6 -> M7 ordering is correct under STDO-UP-013/014: M5 (behavior
work) is explicitly *not* gated on the STDO 2.0 tap; M6 (qualification) is
gated on both M5 and the tap; M7 (release) is gated on M6. `PRODUCT.md`'s
Governance And Release Boundary states this as constitutional law, not just a
goal note.

**The P1 gap from the 2026-07-19 review is closed correctly, not silently.** I
went looking for whether the RC5 `worker_executes`/B-001 transport-lane
conservation obligation (18 references in RC5's transport, zero in the failed
X branch) had been dropped when the current lineage bypassed
`final-integration` (which had actually fixed it, in commits `e736fa49` /
`53b3a72c` — never merged into the successor). It has not been dropped. T-284's
RC5 Baseline Ledger explicitly carries rows `B07`-`B14` and `B24` (dispatch-lane
propagation, closed-prompt vs. `worker_executes` posture, protocol-owned flags,
append-argument admission, external-sandbox posture, behavioral-invariant
proof) with disposition `conserved` / action `replace`, and the document states
plainly: "There are no `unresolved` origin dispositions." The obligation is
scheduled at admission stage `D4`, explicitly "before the first `F_P` transport
admission" — which is correctly *after* M4 (`D3`, all-`F_D` only) and inside
M5's scope. `final-integration`'s fix commits are named as the candidate
evidence for that later slice (T-284 §2.1 rule 8, §8.1 row `Y02`), not as
ambient code to inherit. This is the RC5-conservation discipline
(STDO-UP-015) working as designed.

**Watch item, not a defect:** because M5 has no ticket yet, nothing currently
*names an owner* for the D4/B-001 re-adoption inside M5. The ledger disposition
exists; the implementation-owner assignment does not yet. Recommend the M5
opening ticket cite `B07`-`B14`/`B24` and `Y02` explicitly so this doesn't have
to be rediscovered the way it was on 2026-07-19.

**P2 from the same review (event-causality factory/emission gap) is likely moot
by construction, not verified fixed.** That finding was against `X`'s specific
`lifecyclePrelude`/factory code, which never entered the successor at all (M3
is a clean-room rewrite per T-284 §2.1). M4's `R9` tests
("admits the uniform CCall spine, terminal transition, and exact closure
chain", "ABG rejects cross-run causation before scoped replay") passed green in
my own gate run, which is consistent with causal parentage being enforced
correctly in the new architecture — but I did not read the M4 event-factory
source directly to confirm the specific parameter-passing shape. Flag as
open-but-low-risk rather than closed.

**External dependency risk to M6 — see finding below.** This is the one place
the plan's own stated blocking condition ("STDO 2.0 tap") is not currently
satisfiable, and the reason is upstream of abiogenesis entirely.

## 3. Code Review — T-286 / M4

Re-ran the declared gate from a clean state rather than trusting the closure
receipt:

```
cd abiogenesis-5-root-build/build_tenants/abiogenesis/typescript
npm run test:m4   # build (tsc) + R1-R10 + rival-authority-mutations +
                   # runtime-scope-regressions + root-governor
```

Result: **25/25 pass, 0 fail**, typecheck clean. This matches T-286's own
closure claim ("25/25 twice... twelve installed mutations") — I count 9 `B8`
mutation tests plus 3 `R9` negative-path tests as the "twelve installed
mutations," and the "twice" replay requirement is asserted inside `R10` itself
("returns the same typed outcome as two ABG replay folds"), not via a second
suite run. Traceability is exhaustive: every R1-R10/B-step in T-286 binds an
exact implementation commit and an exact evidence file, the design SHA-256 is
pinned, and the ticket's own closure statement matches `GOALS.md`'s milestone
row and the codex closure doc word-for-word. The closure doc is properly
bounded ("root remains necessary evidence... not a substitute for the
remaining Product scenarios or release gates. M5 is ready but is not opened by
this closure") — no overclaiming past what M4 actually proves.

**Minor hygiene notes (not blocking):**
- No lint gate is declared anywhere in the TypeScript tenant (no `eslint`
  config, no `lint` script in any `package.json`). Type-checking via `tsc` is
  real and strict, but per standing practice every declared-gate review should
  be able to run a lint gate too; right now there isn't one to run in this
  fresh successor tree. Worth deciding explicitly (declare one, or record why
  not) rather than leaving it implicit.
- `abiogenesis-5-root-build/CLAUDE.md` still reads "M4 root realization
  active" and "No work outside exact `ABI5-ROOT-001` resumes before M4
  closes" — both now stale since M4 closed. Small present-tense drift, cheap
  to fix, worth fixing before M5 opens so the bootstrap file matches current
  reality.

## 4. Cross-Repo Finding: STDO 2.0 self-declared `tapped_release` prematurely

Not part of abiogenesis, but directly load-bearing for `M6` and worth
surfacing loudly now while it's cheap, per standing practice on gate/governance
findings.

In `specification_methodology` (branch `main`, commit `474b71c "method: freeze
STDO 2.0.0 candidate"`, 2026-07-21T14:38 local, same session lineage as this
review): two committed, present-tense documents —
`releases/v2.0.0.md` (**Status: `tapped_release`**) and
`specification/standards/authority_compressions/stdo_compressed.md`
(`release_state: tapped_release`) — assert STDO 2.0.0 is tapped. It is not:

- The only F_H receipt that exists is **Decision A** (amendment *shape*
  acceptance), and its own text says so explicitly: "does not accept an
  as-yet unfrozen candidate or waive independent review, final-delta
  qualification, RC publication, or release tap." Decision B (exact-candidate
  acceptance) has no receipt.
- `releases/v2.0.0.manifest.json` — the structured, mechanically-checked
  artifact — self-reports `"status": "release_candidate"`, not tapped.
- No `rc/2.0.0`, `v2.0.0-rc.1`, `release/2.0.0`, or `v2.0.0` branch/tag exists,
  locally or on `origin`. Every prior release (1.0.2 through 1.8.0) has both.
- `releases/v2.0.0.release.json`, which `v2.0.0.md` cites as the release
  envelope, does not exist on disk.
- `T-001` (the release ticket, committed in the same commit) lists milestones
  `exact-candidate`, `independent-review-and-fh`, and `rc-and-tap` as
  `pending`, and names "F_H acceptance is inferred from commentary without an
  exact receipt" and "RC or stable identities disagree locally or remotely"
  as explicit **non-closure conditions** — both of which `v2.0.0.md` now
  violates within the commit that introduced it.

To be clear about what *is* real: Decision A is a genuine direct F_H receipt,
the candidate is genuinely frozen (`474b71c`), and the conformance suite
genuinely passed (161/161 checks, 55/55 cases, root-governor `root_satisfied`)
— it's just sitting as an uncommitted file (`releases/v2.0.0.conformance.json`
is untracked), so it isn't yet an immutable evidence carrier either. This is
real progress on Decision-A-authorized candidate construction; the defect is
narrowly that two documents jumped straight to declaring the *outcome* of
Decision B, RC, and tap before any of those happened.

**Why this matters here and not just there:** abiogenesis's own `PRODUCT.md`
already states the exact rule this violates — "The current 2.0 amendment
candidate is not an installed method release and cannot be represented as one
before its own qualification and tap" — and `M6` is explicitly gated on the
real tap. `stdo_compressed.md` is designed to be consumed as prompt authority
("Method compression is a prompt input"). If whoever opens `M6` reads it at
face value instead of checking the manifest/ticket, they could treat the gate
as satisfied when it isn't. Recommend fixing this in `specification_methodology`
before M5 closes — correct `stdo_compressed.md`'s `release_state` and
`v2.0.0.md`'s `Status` back to `release_candidate`, and drop or clearly mark
the RC/branch/tag/envelope references that don't exist yet — while it's a
same-day, cheap correction, rather than after an M6 session has already
consumed the wrong signal.

## Boundary

Reviewer output; nothing changed in any abiogenesis or specification_methodology
tree. Recommended next tickets (not opened here, per standing practice — this
is intent-generation, not action):

1. Correct `specification_methodology`'s `v2.0.0.md` / `stdo_compressed.md`
   `release_state` claim to match the manifest and T-001 (`release_candidate`,
   not `tapped_release`); commit `releases/v2.0.0.conformance.json`.
2. When M5 opens, name an explicit owner for the `D4` B07-B14/B24/`Y02`
   RC5-transport re-adoption inside its scope.
3. Refresh `abiogenesis-5-root-build/CLAUDE.md`'s now-stale "M4 active" lines.
4. Decide and record whether a lint gate is in scope for the fresh TypeScript
   successor tree, or explicitly defer it.
