# Close: common computational library delivery under the STDO 3.0.0 pen

Commentary, not law. Executive: Claude Fable 5.1. Plan post:
`20261021T162409Z_PLAN_library_consolidation_pen.md`. Design authority:
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`.

Restated 2026-10-23 after four post-close repairs. The first statement of
this post (2026-10-22, at `562d4515a`) and its addendum are superseded by
this text; their history is the commit chain below and `step-8.md`.

## Result

Reopened 2026-10-24 by the fifth review (S2): the helper prints no
acknowledgment when it fails after launch, and the parent refuses the
exchange before it reads the artifact, so the D15 claim below is narrowed to
artifact publication, downstream admission and cold retrieval under a
supplied exchange. Repair E (`step-8.md`) carries the helper's
acknowledgment through the worker to the parent; this post is restated when
it lands.

The library is on `main` at `0eacd4668` plus the bookkeeping commit that
carries this restatement (not pushed, not a release). Steps 2 to 8 landed as
twelve code commits; four post-close repairs (A, C, B, D) landed as four more
after three external reviews that Jim pasted and one same-family whole-diff
review. Every owner obligation the design names is closed with its sites:
O-RESOURCE, O-SHAPE, O-CODEC and O-KEY at steps 3 to 8a; O-SCHEMA at the raw
owner boundary (D10); O-TYPE at every census site (D11 to D14). The plan's
completion condition, no O-* open, is met. The design's proofs P-EQUAL,
P-KEYS, P-SELECT, P-FOLD, P-BIND and P-LIFECYCLE hold, P-LIFECYCLE now on the
helper route too (D15); P-ADMIT and P-RECORD hold for the atoms with their
whole paths by reading; P-LAYER holds for `shared/` and is stated truthfully
for `abg/calculus/`. What this text does not claim is listed under "Items for
Jim" and "Residue the design records".

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
| post-close review | `bec07fe57` | the third review's six S2 disposed; activations A and B |
| repair A | `a1349e50b` | public liveness cut; O-SCHEMA at the three raw dispatches (D10); consensus reference shape |
| repair C | `99b80d6f5` | O-TYPE census (D11): 2887 of 2951 casts retired, nine stops |
| repair B | `d8cf6b5d9` | streaming fold in place; realm admission (D12); valueless result events (D13); helper handoff stopped on the contract rule |
| repair D | `0eacd4668` | forward-task comparison; lifecycle failure subjects (D14); helper failure handoff (D15); seam and fixture lanes; final run |

Executive bookkeeping commits sit between them (`0c362da15`, `837781a1a`,
`2f1393061`, `3dbd3cd2f`, and the one carrying this text), each with the
disposition of the Return before it and the activation after it.

## Decisions under the pen

D0 to D5 and D11 are Jim's (plan post). D6 to D10 and D12 to D15 are the
Executive's, each with a one-line reversal in the plan's Decisions table:

- D6 placement of call admission; D7 replay witness (trace corrected by the
  step 6 review); D8 pre-step-7 transport artifacts read as "facts not
  recorded"; D9 the late-exit guard, reversed after the whole-diff review
  refuted its physical argument.
- D10 O-SCHEMA at the raw owner boundary: the three raw Product dispatches
  admit through `admitJson` before the provider's guard.
- D11 (Jim): discharge the O-TYPE cast sites now, by census.
- D12 `admitJson` admits a plain record or array of any realm by structure;
  the rule is stated as realized, one condition stricter than the
  Executive's first row.
- D13 a `c_call_result_admitted` event without `value` is not a candidate at
  the four result-event lookups.
- D14 the five lifecycle failure subjects carry a typed projection of their
  transition whose prefix member is the outcome's own durable coordinate and
  Run selection; taken on the fourth review's corrections, no retention
  claimed.
- D15 the helper's failure after launch reaches the admitted leaf failure
  inline as its diagnostic reference, the design's own route; the Product
  failure value is unchanged.

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

The post-close cycle was the costliest part. The third review (six S2, all
verified by reading) showed that the first closing statement was wrong on
the helper route (the helper exited uncaught before publishing), on public
liveness (predecessor cut), on streaming `advance` (a per-call copy), on the
O-SCHEMA premise (false at `admitInput`), on consensus cycles, and on
O-TYPE (open at the step 4 casts while GOALS claimed delivery). Repair C's
census then surfaced four owner decisions (D12 to D14 and the realm rule);
the fourth review found one S2 that repair C itself had introduced (a
private index loop where a canonical comparison had been) and two
overstatements in repair B's moving tree, and corrected D14's rationale.
Repair B stopped its helper handoff on the activation's contract rule and
wrote the delta; the Executive resolved it from the design's own step 7 text
(no Product output contract change; the inline diagnostic reference), D15,
and repair D proved it on an installed C1 to C2 path. One Executive row
(D12) was looser than the Worker's realization; the realization stood.

## Test reality

Final run at `0eacd4668` (`step-8-run-postclose-d.log`): 48 files in one
invocation, 1160 s; 345 tests, 270 pass, 54 fail, 2 cancelled, 19 skipped;
25 files red. Every failing test is one of `step-8-run-postclose.log`'s,
and that log's set is the first final run's (`step-8-run-final.log`) or the
pre-plan baseline's at `97b1200bc` (repair B attributed the 68 lanes outside
the first run list: 67 the same set at head and baseline, one seam, now
fixed). Fifteen integrated-run files are baseline-red with the same failure
set (`forward-command-owners`, `m5-consensus-module` at load,
`m5-event-calculus-runtime`, `m5-fresh-process-reconstruction`,
`m5-installed-graph-edge`, `m5-installed-portability`,
`m5-retry-lifecycle-authority`, `m5-s03-authority`, `m5-s06-prime`,
`t287-c2-owner-coordinate-reuse`, `t287-calculus-state-transfer` by its
`:64` timeout, `t287-event-calculus-owner-continuation` at load,
`t287-native-semantic-revision`, `t287-observed-worksite-command`,
`t287-ordered-reconstruction`). Two baseline-red lanes were fixed in the
post-close cycle because their cause was a test defect: the C2 suite's
prompt-digest fixture (`sha256Bytes` where the Product digests canonically)
and the reacquisition root lane's binding list, a step 4 seam. The two seams
this plan opened (`t287-c2a-fp-source-contract` at step 7, fixed in 8a; the
reacquisition binding at step 4, fixed in D) are closed; the one law change
(`m5-terminal-quiescence-owner`, step 6) went through D9 and its reversal
and is 7/7. Of the ten suites edited in steps 2 to 4 and first run in the
step 8 repair, one is green and nine are baseline-red with the same failure
set; three of those fail at load on a fixture coordinate, an environment
variable or a missing export, so their path edits are unexercised past
load. The uat harness is 30 pass, 1 fail, 3 skipped; the failure ("canonical
C2 budget fits") is baseline-red.

New lanes and cases of the post-close cycle, all green at `0eacd4668`:
P-FOLD streaming (one owned state, 22 cuts); D12 realm admission with six
refused shapes; D13 valueless result event; `sameJson` function member and
cycle; the forward-task sparse cover vector; D14 over the five subject
shapes, both admission routes, two Run selections over one prefix and a
preserved earlier cut; D15 on an installed C1 to C2 path reading the helper
failure subject cold from the admitted result (subject 3561 bytes, reference
4887 bytes).

## Items for Jim

- D6 to D10 and D12 to D15 reversals (plan post). D14 and D15 were taken
  without you: D14 on the fourth review's recommendation, D15 on the design's
  step 7 text.
- `sameQualificationValue` removed from the `validator` barrel (step 4).
- 40 tracked `build/` files (historical force-add); the post-close commits
  keep regenerating them.
- O-SCHEMA: closed at the raw owner boundary (D10); `admitJson` inside the
  schema if refusal there is wanted.
- The `abg/calculus` to `runtime_liveness` function-level cycle (F2).
- Held-fluent clipping copies and scans the held entries per clip pattern
  (`abg/calculus/fold.ts:222`), so a long stream's cost stays quadratic in
  held fluents and probes. A retained cost, not a regression; outside the
  plan's claim.
- The module-test fork from a middle cut to the end of a validated prefix
  differs from the warm projection of the end; it did so before repair B;
  module-test path only.
- D15's whole-path case covers `command_cleanup_unresolved`; the other three
  helper failure classes pass the Product constructor and validator in a
  probe outside the lanes, and no lane drives them into an artifact.
- The acknowledgment's artifact-digest members are not read on any
  non-success helper disposition (the parent returns on the artifact it read
  before parsing the acknowledgment); this predates D15 and holds for
  `helper_failure` too.
- 1263 untracked files under
  `.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/` from the uat
  harness runs of this cycle (the repo tracks 120 files of an earlier run);
  left untracked.
- Two untracked files not mine: `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`
  and `.ai-workspace/comments/codex/20261022T145146Z_ANALYSIS_technical_debt.md`.
- Pushing: nothing pushed, in this repository or in `specification_methodology`.

## Residue the design records

- **As touched, not migrated**, all listed in the ticket close: step 3's
  `isRecordEvidence` and seven local `isJsonRecord` copies outside the
  touched sites; the three record writers and the installed-codec pair
  (§10.1 row 3 and §4.3 corrected in 8b); step 5's eight checked-record
  readers, which keep a static `RecordCheck`; the 13 owner `safeParse` sites
  (eight named by the review, five more at the baseline).
- **O-TYPE** is closed. The census (`post-close-repair-c-census.tsv`, 2951
  casts) and the comparison census (`post-close-repair-d-comparison-census.tsv`,
  867 `canonicalEquals` calls whose text changed: 846 re-typed, 20 merged,
  one structural, returned) are the record; 55 no-sink casts outside the
  census and 12 `presentMember` sites remain as the O-TYPE row states them.
- **Design notes landed in 8b and the post-close cycle:** F2 to F10, R2,
  R5 to R7 (8b); §4.1 D12 rule, §4.3 `presentMember` row, §4.4 `advance`
  wording, §9.3 item 4 (the helper route as realized), §10.3 O-TYPE and
  O-SCHEMA rows, §10.5 P-FOLD and P-LIFECYCLE, §10.6 row 6 (A to D).
- **Left as found:** §9.3 item 7 cites `worksite_construction_recovery.ts:285`
  and the call is at `:283`; §10.6 row 5's "Decided by" and "Sequencing"
  cells still read as a gate before D1's retention, and D1 is taken;
  `GOALS.md:18` keeps a conjunction-frame sentence outside the library;
  `step-5.md` keeps its superseded reason as history (the ledger row is
  corrected).
- **Tests:** three of the late-run suites fail at load at head and at the
  baseline, so their step 2 path edits are unexercised past load; a baseline
  attribution of `t287-cross-cut-public-read` needs its two gitignored
  fixtures linked into the baseline worktree.

Day stamps: the step records and the ticket subsection say 2026-10-23; this
post's file stamp is UTC, 2026-10-22.

## Lesson for the next cycle (Jim, 2026-10-23: "caching expertise cost")

Nearly every stop and repair in this plan was a named check nobody ran:
the import graph behind D6, the stored digests over derived state behind
D7, the old-instance reading of a changed artifact behind D8, the throw
sites beside the two the step 7 grant named, the ten edited suites outside
the run list. The census activations that did run such checks (step 7's
47-occurrence census, step 4's AST census, 8a's baseline attribution,
repair C's cast census, repair D's comparison census) held. The two wrong
Executive rulings (the D7 trace, D9) were made by the strongest model in the
allocation and corrected by review, not by a smarter ruler. So the next
cycle pays for expertise once, in the decomposition, and caches it as
process: design activations carry trace obligations as tables in the Return
(structure claims to import sites; persistence changes to their old-instance
reading; derived-state changes to the digests over them; every proof names
an existing check; every edited test in the run list), one Opus activation
with many bounded items; an Executive mid-step ruling is a claim a Worker
verifies before it applies; Fable stays in the Reviewer slot and reviews the
design step too, the one step this plan reviewed with Opus and the one that
leaked three classes into the build.

The post-close cycle adds two rules the methodology note (3.0.1) should
carry. A repair's Return is verified against the obligation's full path,
not the local site: the first closing statement passed on local evidence at
every one of the third review's six findings. And a Worker's contract stop
is cheap when the activation names the rule: repair B's stop cost one
sentence of delta, and the design's own text decided it.
