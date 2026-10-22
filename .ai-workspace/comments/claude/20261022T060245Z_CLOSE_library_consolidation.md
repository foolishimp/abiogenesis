# Close: common computational library delivery under the STDO 3.0.0 pen

Commentary, not law. Executive: Claude Fable 5.1. Plan post:
`20261021T162409Z_PLAN_library_consolidation_pen.md`. Design authority:
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`.

## Result

The library is delivered on `main` at `562d4515a` (not pushed, not a release).
Steps 2 to 8 landed as twelve code commits with Executive bookkeeping between
them. Five owner obligations are closed with sites; O-TYPE is recorded per
site. The design's proofs P-EQUAL, P-KEYS, P-SELECT, P-FOLD, P-BIND and
P-LIFECYCLE hold; P-ADMIT and P-RECORD hold for the atoms with their whole
paths by reading; P-LAYER holds for `shared/` and is stated truthfully for
`abg/calculus/`.

## Commit chain

| Step | Commit | What landed |
|---|---|---|
| 1 | `97b1200bc` | design re-entry (pre-code baseline) |
| 2 | `69132360f` | refusal carrier; layering; `lint:imports`; D6 binding family in `public/binding/` |
| 3 | `a2516dbdc` | admit family: `isRecord`, `hasExactKeys`, `admitJson`, `admitContract`, `admitRef` |
| 4 | `5f4a1d4c9` | value family: `canonicalEquals` at 1204 call sites; `writeCanonicalRecord`; `canonicalRecordDigest` |
| 5 | `10efed8b2` | select family: `resolveExactMatch`, `checkExactRecord`; 13 `one` helpers and 10 checked readers retired |
| 6 | `c2432eb85`, `8eede7fdb` | calculus fold: pure `effectOf`/`foldStep`, `ROOT_DERIVED_RULES`, lifecycle rule (D1); D7 witness |
| 7 | `ffb767171`, `dddb05dfd` | process facts into L; refusal carrier; D5 fold-time copy check; D8 archive tolerance |
| 8a | `37ef7d760`, `cac7802b2` | D4; `lint:lifecycle`; fold working state; consensus `admitJson`; O-RESOURCE probes; integrated run |
| 8 repair | `562d4515a` | D9 reversed; final integrated run |
| 8b | `c8d3f8ecd` | ticket close; GOAL-035; design notes |

## Decisions under the pen

D0 to D5 are Jim's (plan post). D6 to D9 are the Executive's, each with a
one-line reversal: D6 placement of call admission; D7 replay witness (trace
corrected by the step 6 review); D8 pre-step-7 transport artifacts read as
"facts not recorded"; D9 the late-exit guard, reversed after the whole-diff
review refuted its physical argument.

## Where it churned, where it ran

Steps 3, 4 and 5 each ran as one Worker, one commit, no stop and no repair
round; they retired the bulk of the duplication (every NUL-joined key body,
43 of 44 equality bodies, the local first-match helpers and record guards).
The steel thread (build, `lint:imports`, the installed language smoke) held
at every step at about 80 seconds.

Churn came from four places. Step 1 took three Workers, two reviews and two
repair rounds to carry B14 (facts enter `L` as content; the refusal route);
it set the law the later steps realized. Two Workers stopped on design
questions the activations had not pre-decided: step 2's call admission
reads the Public family by value (D6) and step 6's replay witness digests
the held fluent set (D7); each cost a restart. Two Executive rulings were
corrected by review: the D7 trace (code right, trace wrong) and D9, refuted
by the whole-diff review with the design's own text and reversed in the
step 8 repair rather than restated. Step 7's activation grant omitted the
two bare `firstError` throws beside the sites it named; both reviews found
them and one repair round closed them. Step 8 spent most of its Worker time
on attribution against a built baseline worktree: sixteen integrated-run
files were red before the plan, and step 4's "zero production hits" for the
C2 comparison was a manifest artifact (`product_content_mismatch`) rather
than an unreached path.

## Test reality

Final run at `562d4515a` (`step-8-run-final.log`): 44 files in one
invocation, 1096 s; 313 tests, 245 pass, 52 fail, 2 cancelled, 14 skipped.
Every failure is attributed. Sixteen of the 34 integrated-run files are
baseline-red at `97b1200bc` with the same failure set (`forward-command-owners`,
`m5-consensus-module` at load, `m5-event-calculus-runtime`,
`m5-fresh-process-reconstruction`, `m5-installed-graph-edge`,
`m5-installed-portability`, `m5-retry-lifecycle-authority`, `m5-s03-authority`,
`m5-s06-prime`, `t287-c2-owner-coordinate-reuse`, `t287-calculus-state-transfer`
by timeout, `t287-event-calculus-owner-continuation` at load,
`t287-native-semantic-revision`, `t287-observed-worksite-command`,
`t287-ordered-reconstruction`, `t287-worksite-command-execution`). The one
seam this plan opened (`t287-c2a-fp-source-contract`, source order, step 7)
was fixed in 8a; the one law change (`m5-terminal-quiescence-owner`, step 6)
went through D9 and its reversal and is 7/7. Of the ten suites edited in
steps 2 to 4 and first run in the repair, one is green and nine are
baseline-red with the same failure set; three of those fail at load on a
fixture coordinate, an environment variable or a missing export, so their
path edits are unexercised past load. The uat harness is 30 pass, 1 fail,
3 skipped; the failure ("canonical C2 budget fits") is baseline-red.

## Items for Jim

- D6 to D9 reversals (plan post).
- `sameQualificationValue` removed from the `validator` barrel (step 4).
- 40 tracked `build/` files (historical force-add).
- Baseline defect at `t287-worksite-command-execution:826` (C2 owner-local
  negative), red before the plan.
- O-SCHEMA: closed by ingress premise; `admitJson` inside the schema if
  refusal there is wanted.
- The `abg/calculus` to `runtime_liveness` function-level cycle (F2).
- Pushing: nothing pushed.

## Residue the design records

- **As touched, not migrated**, all listed in the ticket close: step 3's
  `isRecordEvidence` and seven local `isJsonRecord` copies outside the
  touched sites; step 4's casts, the three record writers and the
  installed-codec pair (§10.1 row 3 and §4.3 corrected in 8b); step 5's
  eight checked-record readers, which keep a static `RecordCheck` (the
  earlier reason "needs a runtime value" is withdrawn); the 13 owner
  `safeParse` sites (eight named by the review, five more at the baseline).
- **O-TYPE** is recorded per site in the 8a Return and the ticket, at head
  lines.
- **Design notes landed in 8b:** F2 (§2 row and the `abg/calculus` to
  `runtime_liveness` function-level cycle), F3 (P-INGRESS as wording, no
  lint), F4 (`canonicalRecordDigest` row, §10.7, constitution §16.14 (b)),
  F5, F6 (P-RECORD by reading), F9 (`advance` wording), F10
  (`lint:lifecycle` in P-LAYER); step 6's R2, R5, R6, R7; step 7's stale
  citations and the P-LIFECYCLE no-child clause; the C2 proof route in
  P-EQUAL; D7's "proposed or admitted" clause in §4.4 and §10.6 row 5; the
  `rules.ts` comment that still described the dropped guard.
- **Left as found:** §9.3 item 7 cites `worksite_construction_recovery.ts:285`
  and the call is at `:283`; §10.6 row 5's "Decided by" and "Sequencing"
  cells still read as a gate before D1's retention, and D1 is taken;
  `GOALS.md:18` keeps a conjunction-frame sentence outside the library;
  `step-5.md` keeps its superseded reason as history (the ledger row is
  corrected).
- **Tests:** three of the ten late-run suites fail at load at head and at
  the baseline, so their step 2 path edits are unexercised past load; a
  baseline attribution of `t287-cross-cut-public-read` needs its two
  gitignored fixtures linked into the baseline worktree.

Day stamps: the step records and the ticket subsection say 2026-10-23; this
post's file stamp is UTC, 2026-10-22.

## Lesson for the next cycle (Jim, 2026-10-23: "caching expertise cost")

Nearly every stop and repair in this plan was a named check nobody ran:
the import graph behind D6, the stored digests over derived state behind
D7, the old-instance reading of a changed artifact behind D8, the throw
sites beside the two the step 7 grant named, the ten edited suites outside
the run list. The census activations that did run such checks (step 7's
47-occurrence census, step 4's AST census, 8a's baseline attribution) held.
The two wrong Executive rulings (the D7 trace, D9) were made by the
strongest model in the allocation and corrected by review, not by a smarter
ruler. So the next cycle pays for expertise once, in the decomposition, and
caches it as process: design activations carry trace obligations as tables
in the Return (structure claims to import sites; persistence changes to
their old-instance reading; derived-state changes to the digests over them;
every proof names an existing check; every edited test in the run list),
one Opus activation with many bounded items; an Executive mid-step ruling
is a claim a Worker verifies before it applies; Fable stays in the Reviewer
slot and reviews the design step too, the one step this plan reviewed with
Opus and the one that leaked three classes into the build.

## Addendum: post-close review (Executive, 2026-10-23)

A third external review, pasted by Jim after this post was written, found
six S2 and the Executive verified all six by reading. The Result section
above is superseded until the repairs land: the helper route's facts do not
reach an admitted failure subject (the helper exits uncaught before
publishing its artifact); public liveness reads the predecessor cut;
streaming `advance` copies the fold state per call; the O-SCHEMA closure
premise is false at `admitInput`; consensus reference arrays throw on a
cycle where the baseline answered false; and O-TYPE is open at the step 4
cast sites while GOALS claims delivery. Disposition, priorities and the two
repair activations are in `step-8.md`. The claim stands as: the library is
on `main`; the design's proofs hold except P-FOLD's cost property and
P-LIFECYCLE's helper route, both in repair; delivery is not declared until
the repairs land and Jim decides D11 (discharge of the O-TYPE sites).
