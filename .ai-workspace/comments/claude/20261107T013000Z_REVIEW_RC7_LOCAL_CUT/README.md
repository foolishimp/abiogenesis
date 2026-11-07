# Review: abiogenesis 5.0.0-rc.7 local cut at `27c08ce597`

Commentary, not ratified design. Reviewer: Claude Fable 5.1. Pen stays with
Codex. Nothing is pushed. Times are UTC unless marked AEDT (UTC+11).

## 0. Subject

- Worktree `/Users/jim/src/apps/abiogenesis-rc7-local-cut`, branch
  `codex/rc7-local-cut`, commit `27c08ce597`, tree `0bce8197…`, clean.
- Base `1f62c0095` (the rc.6 cut). Delta: 86 files, +7,422/−858; 49 runtime
  files (+2,184/−577), 20 test files, 6 design files, 3 contract projections.
- Main's Product source last moved at `4742e4929` (2026-10-30). None of
  main's 48 commits since the merge base touch the tenant, so rc.7 is a
  linear descendant of main's Product source.
- Archive `2e086133…` (11,022,180 bytes, 5,325 members); clean reproduction
  byte-equal; installed at
  `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.7`; Root
  accepted 2026-11-07T00:27:49Z as `RC7_LOCAL_INSTALLED_UNQUALIFIED`.
- Builder for every Worker in this cut: immutable rc.6 on `runtime-001`,
  whose log is now 2.94 GB.

## 1. Verdict

The cut is what the report says it is: a reproducible, locally installed,
unqualified rc.7 that realizes the held-session design as revised, with
every claim in the report verifiable in the records or the source. Six
focused lanes pass 6+6+7+3+2+9 = 33 tests with no skips. The two identity
workarounds are gone. S6 was refused on measured evidence, which is the
right reading of the conditional.

"Complete" is the refactor, not the candidate. Four things stand between
this cut and a reviewable release candidate: no broad test run exists on
the accepted source or the install (F1); the artifact that was measured and
tested is not the artifact that was installed (F2); twelve of eighteen
project reads are still cold (F3); and a Worker launch on the builder is
still proportional to the log, so the fresh runtime the handoff selects is
load-bearing, not optional (F4).

## 2. Reconciliation

| Report claim | Verified at | Standing |
|---|---|---|
| Held session, borrowed reads, maintained caller; accepted 06:49 AEDT | `rc7-held-session-author-06/ROOT_REVIEW_DISPOSITION.json` 19:49:56Z; source: read owners admit `ReopenedAbgEventResourceInput` and complete at the unchanged entry prefix; `runner.mjs` held readbacks, one close, cold readbacks, held/cold equality; `public-setup.mjs` `populateSandbox(caller,{retain:true})`, `refresh()` without a source | Correct. Took six Worker sessions (author-01 to -06, 12:54Z to 19:49Z). |
| Stdout windows, archive validation, profile compatibility; 33 tests; review clear | `rc7-stdout-window-author-03/activation-001`: lanes native-caller 6, archive-integrity 6, legacy-replay 7, scope-ordering 3, stdout-differential 2, timeout-interruption 9; reviews `root-scope-001` (actor `/root/rc7_growth_control_review`), `code-controls-001`, `source-stage-sw3-stage-01` | Counts correct. "Review clear" means Root-side bounded reviews (F5). Three sessions: S5 timed out, S2 partial, S3 accepted 23:54Z. |
| Installed 1 MiB / 4 MiB growth; results 2,617 bytes; zero warm decodes/reopens; zero held-read work | `rc7-carriage-measurement-01/ROOT_GROWTH_AND_S6_DISPOSITION_001.json`: result 2,617/2,617; binding 40,208/40,210; basis task 1, binding 0, result 0 copies; held acquisition 0.097 s; scripted call 4.1/4.3 s; held read 0.34/0.27 s; cold read 1.8/1.9 s | Correct, on a 90-row, 10.56 MB log, scripted actor, parent RSS only. Warm body reads 90 = every row (F4). |
| S6 not needed | same record, `S6.activated: false`, SDK serialization +1 byte over +3 MiB context | Correct and well argued. |
| Build and clean reproduction byte-identical, 72 s | `actual-001/BUILD_RESULT.json`, `reproduction/RESULT.json` `BYTE_EQUAL` | Correct. |
| Packaging review passed; 9m43 interval | `actual-001/reviews/packaging-001/REVIEW.json`; `ARTIFACT_IDENTITY_BRIDGE.json` 5,319 unchanged, 6 changed | Correct (F2). |
| Local install, 5,325 payloads match, 45 s | `actual-001/install-001/RESULT.json`, `FINAL_INSTALL_VERIFICATION.json` | Correct. |

Design points verified in source, not only in records:

- R-B: `project_read_definition_bindings.ts` `completeRunReadEventResource`
  returns `abg_event_resource_completion` for a held selection and a reopen
  receipt otherwise; both at the entry prefix. `exact_prefix_bindings.ts`
  validates "reopened entry or current held selection".
- HS03: `event_store.ts` `admitNativeRuntimeLivenessEvent` flushes the
  candidate's own actor scope first (common ingress, keyed by
  `actorInvocationRef`); `runtime_liveness.ts` `admitRuntimeThreshold`
  commits the window before the decision; the probe carries the last
  qualifying instant and a noise-only window has no probe. The fold's
  out-of-order refusal is untouched.
- Counters: `historyDecodes` and peers live in `event_store.ts` and are
  not exported from `abg/index.ts`, as HOW §10.9 states.
- Retired: the R6 hash-equal splice in the runner and the
  `refresh(readSource)` argument in setup. The HOW's deletion predicate
  keeps `capture`, `selection`, `activeSelection` and the R5 artifact-truth
  pass for their cold consumers. That is the correct call.

## 3. Findings

**F1. No broad test run on this cut.** The tenant has 206 test files; this
delta changes 20 of them and 49 runtime files. The evidence is 33 tests in
six focused lanes on the accepted source, plus the two scripted growth calls.
`npm test` runs seven unit files and the UAT harness; the staged chains
`test:r1` to `test:r6` and the rest of the set have no record on rc.7. The
rule for this campaign is unit lanes for new atoms and the broad set once at
the close. This is the close. I did not run it: the data volume is at 99 %
with 28 GB free, a suite run previously left about 250 GB of evidence
worktrees, and the host is memory-starved with the campaign live. It is the
first thing to run once the host is clear.

**F2. The measured artifact is not the installed artifact.** The 33 tests
and the growth measurement ran against the rc.6-named archive built from the
accepted source. The installed rc.7 archive differs in 6 of 5,325 members:
three compiled files carrying identity constants, the capability graph,
`package.json` and the toolchain manifest. The bridge classifies each and
the packaging review accepted it. Nothing has executed on the rc.7 install.
The maintained runner's prepare mode on that install costs about a minute
and closes this.

**F3. Six of eighteen project reads take the held path.** `run_status`,
`run_result`, `run_replay`, `run_gaps`, `graph_call_result` and
`graph_call_replay` admit a held selection. The other twelve (`graph_call_status`,
five `*_evidence`, `workspace_replay`, `interaction_replay`,
`continuation_replay`, `c_call_replay`, `workspace_gaps`,
`run_lawful_actions`) stay reopen-only and decode the whole log on each
call. The maintained paths do not use them, so the measured zeros are honest
for the measured workload. Any session that reads evidence or a witness
during its lifetime still pays a cold decode per read. The HOW should name
the twelve as the residual cold surface; the ticket's HS-01 row says "read
owners" without the split.

**F4. A Worker launch is still proportional to the log.** Per session the
product does one cold decode of the whole log at acquisition and one body
read per row across the session (90 of 90 rows, 10.56 MB, equal to the
physical log; 96 of 96 in HS02). RC7 removes the repeat passes per Run that
the operational review counted; it does not remove the first pass. On the
rc.6 builder the last Worker (S3) acquired in 58.8 s at a 2.79 GB prefix,
which is 21 s per GB and on the uncontended trend, so the 4× jump at 01:41
AEDT was contention as diagnosed. On rc.7 the same log would still cost a
decode of that order plus a 3 GB body sweep. The handoff's fresh, explicitly
bound rc.7 runtime is therefore the mechanism by which the next launch gets
fast, and it should be the first measured number: acquisition, environment
and prepared marks for one real Worker on the rc.7 install, fresh runtime.
The report's "full native-workflow performance remains open" is the correct
statement of what is not yet known.

**F5. The reviews are Root-side.** Each accepted stage carries a
`bounded_root_scope_review` by the Root's own actor, a code-controls review
and a source-stage review. These are valuable, and they are not independent
of the Executive that selected the source. This review is the first from
outside that loop, and it is same-family as the native Workers.

**F6. Residue and position.** S7 is untouched: `retry.ts` changed by six
lines and `governed_context.ts` not at all, so the dead-export census stands
as it was. That is consistent with the plan (no deletion authority from a
census). Main's tenant tree is 262 files behind `codex/rc7-local-cut` with
no conflicting change; merging is a fast-forward for the tenant whenever
Jim selects it. Until then the Product source and the coordination
repository are on different branches, which the handoff states.

## 4. What the cut gets right

- The deletion predicate in HOW §10.9: a zero warm counter is not a
  licence to delete cold plumbing.
- Held and cold readbacks compared at one committed boundary in the
  maintained runner, with the cold reads reopening the close handoff in
  fresh processes.
- The flush at the one liveness ingress, keyed by scope, and the flush
  before the threshold decision.
- A blocked Run diagnosable from retained test output alone.
- S6 refused on a measurement rather than on the design's conditional.

## 5. Next, in order

1. Clear the host, then run the broad test set on `27c08ce597` and the
   installed-route lanes on the rc.7 install.
2. Bind rc.7 as the builder with a fresh runtime and measure one real
   Worker launch. That number is what RC7 was built for.
3. Qualification as listed in the disposition: D5, QR02 and eligible QR03,
   applicable S01 to S06, native F11 with AF22, fifteen-family
   qualification, human gates.

## 6. Limits

No product code was run. Source was read at `27c08ce597` as diffs against
`1f62c0095` for the read owners, exact-prefix bindings, event store,
liveness, worker transport, runner and setup, and HOW §10.9 and §10.10.
Records read: the local-cut handoff, residuals, claim, authority, final
disposition, timeline, build, reproduction, install and bridge records; the
growth and S6 disposition; the HS01 author-03 to -06 and stdout-window
author-01 to -03 dispositions; the S3 lane summaries and reviews. The 33
test names were not read individually.
