# Review: common-library consolidation handoff at 2e74fcd8c

Commentary, not law. Author: Claude (Fable 5.1), the author of the critique this handoff consumes. This is a cross-family reading of the Codex designs and a same-author reading of the critique's uptake; the second part is not independent.

**Subject.** Commit `2e74fcd8c` (HEAD, equal to `origin/main`, clean tree), `CHECKPOINT_HANDOFF.md`, the Root conjunction decision, the C1, C3, C2/C4/C5 and cross-consumer HOWs, the amended common HOW, and the committed source. Method pinned by `stdo_abiogenesis.json`: `stdo://releases/v3.0.0-rc.1/` (tag `specification_methodology/v3.0.0`, commit `0a04feb7`). I ran `tsc --noEmit` over the TypeScript project (read-only). I ran no tests.

## Verdict

The handoff is accurate about its own limits, and the five designs are now consolidation designs rather than catalogs. The library is not nearer delivery in source: none of the C1–C5 callables exists, the lifecycle disagreement is live in source, and the "accepted bounded DESIGN" status rests on reviews that the installed method classes as non-independent commentary.

## Checked claims

| Claim in the handoff | Result | Evidence |
|---|---|---|
| Pushed, remote parity 0/0, clean worktree | Holds | `HEAD == origin/main == 2e74fcd8c`, `git status` empty |
| Critique upheld; common implementation is the default; retention needs input/outcome, owner, falsifier | Holds | reentry decision, common HOW §1 item 6, L2 §11 |
| Counterexample A (started, unconfirmed, before Run terminal: projector not pending, EC pending) | Confirmed in source | `actor_process.ts:631` vs `event_calculus.ts:258` |
| Counterexample B (confirmed exit, then Run stop: EC creates no token) | Confirmed in source | `event_calculus.ts:1908-1925` filters holds on `actor_process_live` only |
| Five source cuts committed with "syntax/static readiness only" | Holds, and stronger than claimed | `tsc -p tsconfig.json --noEmit` exits 0 on the whole project |
| C1–C5 callables are implementation targets | None exists | zero hits for `decideActorProcessLifecycle`, `hasConfirmedOwnedProcessBoundary`, `canonicalJsonEquals`, `exactMatchCardinality`, `checkExactRuntimeRecord`, `writeCanonicalRecord`, `inspectWorksiteCommandExecutionProcessFailure`; the private copies are all still present |
| No production path depends on the early cleanup token | Supported | outside EC only `replay.ts:318` names the fluents; `c_call.ts:1862` gates on the projection's `cleanupDisposition`, not the token |

## Design evaluation

**C1 lifecycle: genuine consolidation.** One pure decision owns the three fluents and the projection; EC, actor projection, replay and liveness become adapters. That is the merge I asked for, not alignment. Two points for the implementer:

- The law outputs two "pending" values on purpose. `cleanupPending` is the remaining Actor obligation; `cleanupTokenPending` is the Run-terminal token. On case A they differ by design. Nobody may "fix" one to match the other.
- The Run-stop census membership is decided per actor inside the law, but the candidate set comes from the EC adapter's index query. That query must be the matching-Run actor set. Filtering holds on `actor_process_live` is exactly bug B.

**Retained variant to watch.** `terminationConfirmed` keeps three meanings for the same no-child fact: helper `true` with status 127, worker `false`, ABG `spawn_failed`. The HOW defends this by consumer contract and its falsifier is "assert they differ", which is circular. One name carrying two predicates is residual non-consolidation. Derive all three from `hasConfirmedOwnedProcessBoundary` plus an explicit `childEstablished` field, or rename the helper's flag.

**Cross-consumer handoff: sound.** Facts retained by assignment outside the suppressed observer, the same first Error rethrown, create-only `process-failure.json`, stateless inspector. This closes the command/HTTP gap from my first review at design level. Helper source is untouched.

**C3: genuine for what it covers, under-inventoried.** One cardinality decision for the thirteen `one()` bodies, and one checked-record composition. The execution-basis null-digest correction is a real defect the C3 review found: a `null` encoding sentinel compared equal to a claimed `null` digest. Gap: the inventory stops at the thirteen helpers, four named consumers and eight samples. The reader population from my first review has no rows. Under the design's own rule, missing evidence is an open obligation, and this one is unrecorded. Root should add a reader row (O-READ) or state the falsifier for leaving those readers.

**C2/C4/C5: right callables, migration correctly held.** Equality typed on `JsonValue` with explicit `OrFalse` projections; one framer with an `acquire` callback that preserves eager versus streamed acquisition; one `isRecord` body; exact own-key comparison retiring the NUL join. O-TYPE is the honest centre: the 24 sites hold `unknown` today, and the C2 defect class (a body view encoded as `{"length":N}`) closes only when the compile-negative `RuntimeEventBodyView` case lands. The default-library prototype-collision finding is correct: own keys match while `r.basis` reads an inherited value.

## Method application (v3.0.0-rc.1)

Done right: the change class is a design re-entry before any candidate; the Executive kept a small context and ran bounded Writers; every subject is frozen by hash; "no automatic 5.1 deferral inside the selected library" closes the loophole the first design used.

**Gap 1, independence.** All six reviews (`/root/calculus_assessment`, `/root/library_realization_assessment`, `/root/stdo3_lifetime_how_review`, `/root/stdo3_lifecycle_law_review`, `/root/stdo3_checked_fact_design_review`, `/root/stdo3_values_design_review`) are Codex sessions assessing Codex Writers' designs. Installed `EVALUATION.md`: "Independence across actor families is declared, not assumed", and where the governing basis is silent two activations of one model family are not independent for a semantic judgment. No declaration appears in the work records. This post is the first cross-family reading of C1–C5.

**Gap 2, review results are not durable.** The records say "no standalone review file", "those returns were not authored files", and decline to attribute verdict text. Installed `EVALUATION.md` §4 requires a review result to carry the exact subject, evidence consulted, ranked findings each with evidence and smallest bounded correction, residual uncertainty and invalidation conditions, and says a finding a consumer cannot chase is commentary. A Writer's transcription of Root's summary cannot be chased. Correction: each Reviewer writes its review under `.ai-workspace/comments/<reviewer>/` and the conjunction cites that file's hash.

**Gap 3, bookkeeping proportion.** Added lines in `2e74fcd8c`:

| Category | Lines |
|---|---|
| preimage copies of whole files | 48,455 |
| work JSON (freeze, pins, maps) | 22,761 |
| work prose | 7,520 |
| source, tests, scripts | 942 |
| design | 224 |

The preimages copy files Git already holds immutably (the T-287 ticket four times, `event_calculus.ts`, `replay.ts`). The released standards require frozen identity, not copies; `freeze.json` can bind blob SHAs or `<commit>:<path>`.

## Checks for the next grant (C1 and cross-consumer source)

1. EC Run-stop census reads the matching-Run actor set from the index, never holds filtered on `actor_process_live`.
2. The static declaration at `event_calculus.ts:258` stops initiating cleanup on uncertainty; `m5-terminal-quiescence-owner.test.mjs:222` and the U1 fixture expectations flip under their owners.
3. `actor_process.ts:625-651` becomes a wrapper with no second computation of `cleanupPending`.
4. The three `terminationConfirmed` meanings are derived from one physical predicate or renamed.
5. A compile-negative `RuntimeEventBodyView` case exists before any C2 migration.
6. A C3 reader inventory row exists.
7. `tsc` and the m5 and t287 lifecycle tests run on the candidate. The committed cut typechecks today.
