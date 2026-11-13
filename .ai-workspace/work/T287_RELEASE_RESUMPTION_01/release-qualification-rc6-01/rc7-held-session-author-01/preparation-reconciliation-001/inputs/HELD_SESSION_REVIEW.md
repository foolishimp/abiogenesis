# Review: the RC7 held-session plan against the state of abiogenesis 5.0.0-rc.7

Commentary, not ratified design. Reviewer: Claude Fable 5.1. Pen stays with
Codex. Nothing is pushed.

Subject: the ticket section "RC7 held-session plan — current (2026-11-06)" in
`.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`
(rows RC7-HS-S4, R5, 00, 01, 02, 03, 04, 05, 06 and the HS-01/02/03 paragraphs),
read from the uncommitted working tree (the ticket's last commit is `f63f030b9`, 2026-11-01),
which adapts the design post at revision 3 (`f0d4c644b`):
`.ai-workspace/comments/claude/20261106T041246Z_DESIGN_HELD_GRAPH_INTERFACE/README.md`.

State of RC7 at review time (2026-11-06, about 10:30Z):

- There is no 5.0.0-rc.7 cut, tag or install. Tags stop at `v5.0.0-rc.1`;
  installs run rc.1 to rc.6. RC6 remains the immutable builder.
- The prospective RC7 source is the worktree `abiogenesis-rc6-local-cut` at
  `1f62c0095` with 58 modified tracked files (+3,218/−468) and two new test
  files, frozen as N `SOURCE_AFTER` `40cd0868…` (449 files) and accepted by
  Root at 07:51Z (`rc7-overhead-author-03/ROOT_REVIEW_DISPOSITION.json`:
  7 cases pass, 1 stage, 4 lanes, not qualified, not published).
- The fixed Testing/UAT task F (`rc7-fixed-proof-author-01`) ran today from
  09:11:50Z to 09:53:52Z on the RC6 install through a one-process SDK host,
  completed with a result, closed its resource once, and its cold readbacks
  are pending.

All source paths below are under
`build_tenants/abiogenesis/typescript/code/src/` of that worktree unless stated;
line numbers are from the committed `1f62c0095` text where the file is
unmodified, and from the worktree where it is modified.

## 1. Verdict

The plan is correct in direction and in every status it claims; each
"implemented" row is in the worktree source and each "open" row is open.
It is tighter than the design in two places: HS-03 adds an ordering rule the
design lacked, and HS-05 denies the dead-export census any deletion authority.
Its HS-01 exit is incomplete in four places (findings F1 to F4 below): the
order inside the bundled S1 + S2 + S7 increment, RC7's own identity patches as
retirement targets, the public owner-contract regeneration, and the flush
point for HS-03. None changes a row's status.

## 2. Reconciliation

| Row | Plan status | RC7 source state, verified | Relation to the design | Gap |
| --- | --- | --- | --- | --- |
| HS-S4 | implemented, bounded accepted | `product/native_workspace_work.ts`: observation and failure carry `inputDigest` and no `task` or `before`; `abg/event_prefix.ts`: a context member's holder is a Result or the basis holder `{basisRef, basisDigest, path}`; `abg/instruction_assembly.ts`, `abg/execution_basis.ts`: the persisted binding carries `NativeExecutionBasisCoordinate` without `rawInputValue`; HOW §10.8 rows R1–R4 added | S4 (rule R-D) realized | installed context and result growth not measured; F ran on RC6, so it measures nothing here. One installed Run on RC7 source is still the S4 discriminator |
| HS-R5 | implemented, partial | `abg/project_read_definition_bindings.ts` passes `environment.artifactTruth.prefix` to `prepareRunReadAtDurablePrefix` | the traced R5 (142 s to 68 s on the RC6 install) | none |
| HS-00 (F) | prerequisite, in progress | ran today. Host `rc7-fixed-proof-author-01/prepare-and-dispatch.mjs:71–119`: `caller.acquire(caller.reopen())`, `caller.refresh(entry.prefix)`, start call constructed with `eventResource: entry`, `runInstalledDefinitionCallWithResource(entry, call)`, completion validated against the entry, one `caller.close(finalPrefix)`. Outcome: result, physical close succeeded, readbacks pending. Marks: acquired 38.2 s, environment 84.3 s, prepared 86.2 s, wall 2,523 s; log 1.52 GB at entry, 1.68 GB at close | the lifecycle half of S1's operator rule, live on the RC6 install | reads stay cold by design ("it proves no held public reads"); the session paid one decode and one fold |
| HS-01 | next | read owners unchanged: `abg/project_read_definition_bindings.ts` differs only in the R5 lines, so the resource schema (`:113–127`), the admission check (`:880–886`) and `closeReadEventResource` (`:253`) still require `reopen_abg_event_resource` and close; `abg/exact_prefix_bindings.ts:118`, `public/installed_public_definition_call.ts:651`, `abg/definition_event_resource.ts` and `public/installed_definition_call_transport.ts` are unmodified. The maintained `test_env/uat/runner.mjs` still routes `invokeLifecycle` (`:375–378`) and `freshReadbacks` (`:266–295`) through `invokeColdInstalledEntry`; R6 substitutes the acquired prefix object into the reopen handoff when hash-equal (`:277–280`) | S1 + S2 + touched S7 | F1, F2, F3, F5, F6 |
| HS-02 | open, deciding proof | — | the revision 3 lanes: same committed boundary, same selectors, complete result (value, producer, projection basis); counters; full cold verification kept; 500–730 s is RC6, under 30 s is a forecast | F5: the counter is unnamed |
| HS-03 | follows HS-01/02 | `abg/calculus/liveness.ts:745`: a probe whose elapsed time is below the last seen on the scope makes the fold return null, a refusal; Root's example (stdout buffered at t100, stderr probe at t200, stdout flushed at t100) is therefore a refused projection, not a wrong value | S5 with E1–E4 plus Root's ordering rule | F4; Q2 (window cadence) and Q3 (stdout row) are still undecided |
| HS-04 | conditional | — | S6 under Q1 | none |
| HS-05 | withdrawn | `abg/event_store.ts` diff is +16/−4 with no decoder change | S3 withdrawn | none |
| HS-06 | retained | no RC7 cut exists | outside the design | none |

The plan's change classes match the design: HS-01 is a `realization_refactor`
with a bounded HOW amendment; HS-03 is a later `design_reframe`.

## 3. Findings

**F1. Order inside HS-01.** The row bundles S1, "necessary S2" and touched S7
into one native increment with deletion of displaced plumbing in the same
exit. With R5 in place and an open owner, `projectOwnedRuntimeHistoryAtDurablePrefix`
finds the selection known and `prepareRead` borrows at 4.3 s, so the HS-02
counters may already read zero after the borrowed-read change alone. Order the
increment: (a) borrowed reads in the read owners (schema, admission,
completion through `completeAbgEventResource`, receipt schema admitting
`abg_event_resource_completion`, the exact-prefix wrapper, the constructor
type, the warm transport check); (b) the maintained caller on the held
selection with one close at the test boundary; (c) the HS-02 counters;
(d) delete what the counters show unreachable. Deletion before (c) is S7
without its discriminator.

**F2. RC7's own identity patches are retirement targets.** Two interim repairs
in the RC7 state depend on object identity across the caller, the mechanism
the design removes under rule R-A: the §10.8 R6 substitution in
`test_env/uat/runner.mjs:277–280` (`hash(acquiredPrefix) === hash(prefix)`,
then the acquired object is spliced into the reopen handoff so the in-process
construction borrows), and SAME_PROCESS_REUSE §1 (`caller.refresh(env.prefix)`
with "the exact object returned by the dry acquisition; do not clone or
serialize"). Both are correct today and both are the pattern HS-01 replaces.
HS-01 should name them as displaced plumbing, rewrite the §10.8 R6 row to the
held selection, and retire the hash-equal splice. Otherwise the Product loses
the fallback while the harness keeps it.

**F3. HS-01 changes a public owner contract.** The read owner's resource
assertion and receipt are owner-contract-source declarations
(`public/binding/owner_contract_source_set.ts`). Accepting a held selection
and returning a completion changes the generated owner contracts and the
catalog identities, exactly as `FIXED_PROOF_ROUTE.md` treats nullable
provenance ("observable contract changes requiring rebuilt identities and
proof"). HS-01's exit should include contract regeneration, the §10.8 member
and span pin check, and an unchanged CLI path for `reopen`. The plan's HS-02
list does not mention it.

**F4. HS-03's flush point.** Probes reach the store from several producers:
stdout and stderr in `abg/actor_process.ts:1440–1474`, frame and CCall clocks
in `abg/runtime_liveness.ts:82–160`. Because `liveness.ts:745` refuses any
later probe on the scope with a smaller elapsed time, a per-producer checklist
("flush before stderr and artifact probes and before timeout and effect
decisions") will miss a producer. Put the flush inside the one admission path
every probe passes through, `admitNativeRuntimeLivenessEvent`, keyed by
scope: before admitting any probe for a scope, admit that scope's pending
stdout window, with its last qualifying activity's elapsed time when it has
one, and the stdout row alone when it does not. The window's elapsed is at
most the new probe's by construction, so the fold's order holds structurally.

**F5. Name the HS-02 counter.** The closure law says "zero further whole-log
decode/reopen" but RC6 exposes no counter. Two options fit the touched scope:
a test-mode counter in the store owner on `decodeRuntimeHistoryDescriptor`,
`reopenEventStore` and the cold branch of `readOwnedRuntimeHistoryAtDurablePrefix`;
or the CPU-profile signature used in the companion review (self time of
`writeCanonicalJson` and `hash.update`, 52–55% of a cold read). The first is
exact; the second needs no Product change.

**F6. The execution contract lives only in the ticket.** The worktree's
design documents contain no held-session or borrowed-read text yet; the
ticket authorizes documentation only. HS-01's bounded HOW amendment should land
beside §10.8 (a §10.9 with rules R-A, R-B and R-G as rows, and §10.8 R5/R6
marked superseded at HS-01 close), so the read owners' accepted inputs are
owned by HOW, not by the ticket.

**F7. F's marks are the first session-cost datum, not the HS-02 measurement.**
The F host paid acquisition once (38.2 s, one decode of 1.52 GB) and the
environment fold once (46.1 s), then constructed the call in 2 s. That is
86 s of host preparation against P3's 135.6 s preflight and the RC6 operator's
142 s construction; it matches the design's per-session cost shape. It is on
the RC6 install, for one lifecycle call, with no held reads and a larger log,
so it does not stand in for HS-02.

## 4. What the plan gets right that the design did not say

- HS-03's ordering rule (verified at `liveness.ts:745`) closes a hole in E3,
  which only covered timeout and effect decisions.
- HS-05's "a broad unused-subsystem/dead-export census grants no deletion
  authority" is the correct reading of the companion review's F9 row.
- HS-02's "Root deliberation is not runtime cost" and "an under-30 s figure is
  a forecast, not a pass" keep the discriminator honest.
- HS-00's host already shows the operator rule for the lifecycle without a
  Product change, which is what the design said the warm path allowed.

## 5. Limits

- Records read: the ticket section, `ROOT_RC7_OVERHEAD_SELECTION.json`,
  `rc7-overhead-author-03/{CURRENT_HANDOFF.md, ROOT_REVIEW_DISPOSITION.json}`,
  `rc7-overhead-reentry-01/latency/{SAME_PROCESS_REUSE.md, FIXED_PROOF_ROUTE.md,
  ROOT_FIXED_PROOF_DISPOSITION.json, operational-sdk-readiness-001/*.md}`,
  `rc7-overhead-reentry-01/carriage/LOGICAL_BOUNDARY.md`,
  `rc7-fixed-proof-author-01/{ROOT_DEPENDENCY_READY_SELECTION.json,
  ROOT_OPERATIONAL_CONTROL_TRIAGE.json, operational-preparation-002/HANDOFF.md,
  execution/*.json}` and the worktree diff. Nothing else under `.ai-workspace/`
  was walked.
- No run, build or test was executed; F's numbers are its own marks.
- Same-family review; no independent assessment is established.
