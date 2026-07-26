# Review: Adoption Of Released STDO `v2.2.0` Into ABIogenesis 5

- reviewer: claude (independent)
- date: 2026-07-25T06:20Z
- subject: uncommitted working-tree change set in `abiogenesis-5-root-build`
  (110 paths) at HEAD `862a39d9`
- adopted method Product: STDO `v2.2.0`, commit `5326562f`, aggregate
  `ca6dc3d5…2f86c`

> **Recorder correction (codex, 2026-07-25):** The no-blocker verdict below
> is superseded. A later review found two live propagation defects: STDO 2.0
> remained in qualification law, and completed T-272 remained projected as a
> current design owner. The mechanical verification in this review remains
> evidence; its acceptance recommendation does not.

## Verdict

**Correct, lawful, and precisely scoped.** Every substantive claim verifies.
One factual correction (the gate that was reported unavailable is installed and
runnable — I ran it), one unreconcilable figure, and the work is uncommitted.
Nothing blocks.

## The Adopted Subject Is Genuinely Released

I checked this first, because "released" was the load-bearing word and the
premature-tap defect class has bitten this lineage before.

| Check | Result |
|---|---|
| Final tag `v2.2.0` | exists on origin, annotated `9a9beb2a` → `5326562f` |
| `release/2.2.0` branch | on origin at `5326562f` |
| Zero-delta claim | `v2.2.0^{}` == `v2.2.0-rc.1^{}` == `5326562f` — **exact** |
| Aggregate at the release tag | recomputed `ca6dc3d5…2f86c` — **exact** |
| Post-release wave `6fa5074` | touched **no** `specification/standards/` member; only the human DECISION, my RC review record, T-002, and GOALS |

The release subject was conserved through publication exactly as the new
release law requires. The evidentiary gap I raised at RC review is closed on
the STDO side: the human DECISION (`20260725T055634Z`) and my exact-tag review
both landed in the publication wave.

## Adoption Verified

- **Projection is byte-exact.** `.genesis/docs/standards/` holds 41 files,
  **byte-identical file-for-file** to the released members.

  Recording one subtlety so a later check does not misfire: the projection's
  recomputed aggregate is `b92a5ce1…`, **not** `ca6dc3d5…`. That is correct and
  expected — the declared recipe (`find specification/standards -type f`) is
  path-sensitive, and the projection lives at a different path. Per-file bytes
  are the right verification, and they match.

- **Pins are complete and clean.** `PRODUCT.md`, `GOALS.md`, `CLAUDE.md`,
  `AGENTS.md`, `T-270`, and `T-282` each carry `v2.2.0` + `5326562f` +
  `ca6dc3d5`. Zero stale `v2.0.0` / `94ccf4fa` / `284efbb3` in any of them.
  The three remaining old-identity references repo-wide are all historical
  review/audit comments — correctly left untouched.

- **Live surfaces are free of mutable-source references.**
  `specification/`, `build_tenants/`, `CLAUDE.md`, `AGENTS.md`, `README.md`,
  and `tickets/active` + `tickets/backlog` contain **zero** references to
  `src/apps/specification_methodology` or the mutable standards path. The
  remaining references (40 and 54 by pattern) sit entirely in
  `tickets/completed` and `comments/` — historical evidence, correctly
  preserved rather than rewritten. **This closes the long-standing
  mutable-path hygiene item** (previously ~61 requirement files); 63
  requirement files now resolve through the installed projection.

- **"No runtime source or Product behavior changed" — verified.** The 110
  changed paths are 109 `.md` plus one `.py`; that `.py` is a test path
  constant. No `code/`, `src/`, or `.ts` file is touched.

- **`git diff --check`** clean.

## Decision Lawfulness

The adoption record is well-formed against the standing rule that method
adoption must originate in a GOAL/Product ruling and never in `REQ-P-INSTALL`:

- `authority_regime: direct F_H`, with the Product owner's instruction quoted
  verbatim — not a proxy grant;
- `change_class: product_reprice` — the correct class;
- `re_entry_point: specification/PRODUCT.md` — originates in Product.

It also bounds itself correctly: "It does not change ABIogenesis Product
semantics, the selected `ABG5-S03` outcome, the current ticket graph, accepted
design, or runtime implementation. No new Product feature, design programme,
ticket, or implementation increment derives from this adoption alone."

That is STDO 2.2's own non-powers clause applied to the act of adopting 2.2 —
the first use of the new growth-authority law, used correctly, and it preempts
the destination-gate objection I would otherwise raise about changing the
method basis mid-outcome.

## Findings

**F1 (factual correction, non-blocking) — the gate is installed; I ran it.**
The report states "full pytest was unavailable because pytest is not
installed." `pytest` **is** installed and on PATH
(`/Users/jim/.pyenv/shims/pytest`, 8.4.2). Running
`test_env/tests/test_spec_method_trace.py`:

- with the adoption changes: **7 failed, 8 passed**
- at clean HEAD in a disposable worktree: **7 failed, 8 passed — the same
  seven tests**

So the adoption causes **zero regression**; the failures are pre-existing (the
visible one is a link to a missing `T-095-PY` ticket, unrelated to the method
path). Severity is further bounded by `TENANT_REGISTRY.md`, which marks
`abiogenesis/python` **Withdrawn** — "not a current or paused delivery
candidate." So this is a red gate on a withdrawn reference line, not a
delivery gate.

Two things still worth stating: the reported *reason* was wrong, and a
declared suite has been 7/15 red at HEAD independently of this work.
Accepting or scheduling that debt is F_H's call, not the reviewer's.

**F2 (reporting hygiene, minor) — the "178 references" figure does not
reconcile.** My counts: 200 total `.genesis/docs/standards` occurrences, 189
in live surfaces, 112 containing files, 29 identity tokens
(`5326562f` 9 + `ca6dc3d5` 7 + `v2.2.0` 13). None is 178; 189 is nearest. The
underlying work verifies regardless, but a verification figure a reviewer
cannot reproduce is the same class as the earlier "combined 21/21 reconciles
with nothing" note. State the denominator with the count.

**F3 (state) — 110 paths uncommitted.** The adoption is complete and correct
but unlanded. Cheap to close, and the same exposure pattern flagged on the
STDO side this morning.

## Recommendation

Land it. The adoption is materially correct: released subject verified,
projection byte-exact, pins complete, live surfaces clean, no runtime change,
no regression. F1 and F2 are corrections to the *report*, not to the work;
F3 is a commit.
