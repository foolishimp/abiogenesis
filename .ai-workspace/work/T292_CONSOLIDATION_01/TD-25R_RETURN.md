# TD-25R Return: the human response and resume residue

Writer: Claude Opus 5.5. Branch `claude/td25r-response-resume-residue` from
local `main` at `72ac59366`, worktree `/private/tmp/abg-td25r`. Change class:
realization_refactor. No push, no tag.

**Status: done. The response and resume residue is removed and the F_H hold
stays: 27 source files, 3,326 lines removed and 263 added over `code/src`
(net −3,063), in eight commits after the census. Replay of 11 recorded logs is
identical on base and final; no hold lane changes its result; the five
`interaction.respond` members refuse through the installed transport as
before; generated contracts change in digest and reference values only.
Five items need the Executive's ruling (section 11).**

Commits on the branch, oldest first:

| Commit | Content |
| --- | --- |
| `e0843f572` | census and site table (Return skeleton) |
| `6ac88a91b` | producer side (`continuation.ts`, barrel) |
| `cdcc88029` | F_H projection reduced to the opened hold; `fh_resume_relation.ts` deleted |
| `eebb079f2` | `fh_resume_success` retry completion class |
| `6e5404ff0` | call owner resume origins and interaction closure arm |
| `480947e28` | `interaction_resume` route class, transition arm, resume cursor origins |
| `92ae03e5a` | ruling-4 routing in the fold; replay and smaller arms; the refusal lane |
| `98e464ee8` | HoG residue (`resume_not_admitted`, `deriveInteractionSuccessorInputCarrierRef`) |
| `de96441a9` | provider member `evaluateInteractionResponse` and its wrapper |
| this commit | the Return |

## 1. Recorded-history census

The four kinds are `fh_interaction_responded`, `fh_interaction_resume_admitted`,
`continuation_abandoned` and the F_H use of `continuation_superseded`. The
pattern matches each kind as a JSON member value in both spacing forms and in
the single-escaped form (`\"kind\":\"…\"`):

```text
\\?"kind\\?"\s*:\s*\\?"(fh_interaction_responded|fh_interaction_resume_admitted|continuation_abandoned|continuation_superseded)\\?"
```

`rg -uuu` (no ignore files, hidden files, binary files searched), no size cap.

| Store | Files searched | Bytes searched | Hits |
| --- | ---: | ---: | --- |
| `*.jsonl` under the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace` | 4,350 | 65,426,442,746 | 17, all `continuation_superseded` |
| `*.json` and `*.ndjson` under the evidence root (added) | 238,013 | 94,367,483,740 | 2, both `continuation_superseded` |
| every file under the main checkout's `T/test_env/test_runs` and `T/test_env/uat/runs` | 1,315,763 | 57,580,358,134 | 2, both `continuation_superseded` (`test_runs/rp2/selected-action`) |
| every file under `T/test_env/proof` (4) and `T/test_env/fixtures` (93), worktree and main checkout | 97 | | 0 |
| `T/test_env/evidence` (main checkout only; absent from the worktree): 8 files | 8 | | 0 |
| compressed archives (`rg -z` over `*.gz`, `*.tgz`, `*.zst`, `*.bz2`, `*.xz`, `*.tar`) under the evidence root, `test_runs` and `uat/runs` | 1,712 | 34,498,020,775 decompressed | 2 test-source hits (below); one `.tar.zst` decompressed by hand: 7 `continuation_superseded` |

Classification of every hit. A Python classifier parses each matching JSON
or JSONL file (JSON nested in strings included) and reports each event of
the four kinds with its `payload.continuationKind`:

- All 21 uncompressed hits, and the 7 inside
  `s7-pending-consumer-01/exact-intent-checkpoint-01/frozen-evidence.tar.zst`,
  are `continuation_superseded` events with an `eventId` (recorded, admitted
  events) whose `continuationKind` is `construction_intent` (14) or
  `selected_action` (7) and whose `terminalDisposition` is `superseded`. The
  live construction-continuation owner produces them
  (`abg/construction_continuation.ts:591`, `:845`). None is an F_H use.
- The two compressed test-source hits are one test line,
  `after.includes("\"kind\":\"fh_interaction_responded\"")`, in a copied
  `test_env/tests/m5-installed-external-product.test.mjs` inside
  `work/T287_SANDBOX_UAT_01/retirement/undo.tar.gz` and
  `comments/codex/20260923_RC1_QUALIFICATION_RECIPE/frozen-source.tar.gz`.
  It is test text, not an event.
- No recorded log holds `fh_interaction_responded`,
  `fh_interaction_resume_admitted` or `continuation_abandoned`, and none holds
  an F_H `continuation_superseded`.

Hand-built events, not recorded history: `generic-input-retention.test.mjs:49`
and `t287-undispatched-diagnostic.test.mjs:176` build a resume event in the
test; `t287-single-address-space-consolidation.test.mjs:1133` calls the
response preparer.

Coverage limits:

- Zip archives are not searched: 1,056 Scala `zinc` compile caches under
  archived sandboxes and one STDO tooling `sources.zip`.
- Three `changed-archive.tgz` files under `work/T287_REUSE_CONSUMER_REPAIR_0{2,3,4}`
  are 21-byte text files ("changed archive bytes"), not archives.
- JSON escaped twice or more (`\\\"kind\\\"`) is outside the pattern.

Recorded F_H holds exist: five logs under
`comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-{04,18,19}`
hold one `fh_interaction_opened` each. They are replay subjects in section 4.

## 2. Site table

Every site this package deletes, by file. Kind: P producer, R reader, H HoG,
V provider member, T test. Lines removed per file follow the table.

| File | Sites | Kind | Live neighbour kept |
| --- | --- | --- | --- |
| `abg/continuation.ts` | `admitContinuationTerminal`; `HeldInteractionCCallProjectionInput` and `projectHeldInteractionCCallOutcomeAtPrefix` (dead duplicate of the `c_call.ts` owner); `ContinuationPublicOperationAdmission`, `PreparedContinuationPublicOperation(Result)`, `UnavailableEffectfulPublicInvocationTruth`, the two `Owned…` types; `FhInteractionResponseAdmission`, `PreparedFhInteractionResponse`, `CommittedFhInteractionResponse(Result)`; `runtimeEventCandidate`, both `resolve…ContinuationOperationCoordinateAtPrefix`; `prepareContinuationPublicOperation` (the second `public_operation_admitted` builder) and `resolveContinuationPublicOperationGrant`; `prepareFhInteractionResponse`, `commitFhInteractionResponseAtExpectedPrefix`; `deriveFhResumeSuccessorInput(AtPrefix)` and the `fh_resume_relation` imports and re-exports; `FhInteractionResumeAdmission` (with its last reader) | P | `admitFhInteractionOpen`, `admitOwnedFhInteractionHold`, `admitFhInteractionHold`, their input and result types, `ContinuationProductBasis`, `FhInteractionContinuation` |
| `abg/index.ts` | the barrel exports of the names above and of `isInteractionResumeCursorSuccessorAtPrefix`, `InteractionResumeRouteAdmissionEvidence` | P, R | every hold export |
| `abg/fh_resume_relation.ts` | whole file | R | none |
| `abg/fh_continuation_projection.ts` | `exactPublicOperation`, `exactLifecycleEnvelope`, `exactClosureContract`, `validateExactFhResumeOwnerRelationAtPrefix`; the response, resume and terminal-disposition branches of `projectFhContinuations`; the responded and resumed fact projection in `projectFhEffectfulPublicInvocationFacts` | R | `ReplayContinuationState` (every key kept: it feeds `replayDigest`), `exactOpenedBasis`, the opened-hold projection, the per-hold history check and the orphan-operation refusal (`invalid_history`) |
| `abg/retry.ts` | the `fh_resume_success` member of `RetrySuccessfulExitEvidence`, `projectExactInteractionResumeSuccessorAtPrefix`, the `fh_resume_success` arms | R | judged, fan-out and structural-identity completion |
| `abg/retry_progress.ts` | `exactFhResumeCompletionWitness`, the `fh_resume_success` class and its arms | R | the other completion classes |
| `abg/retry_lifecycle.ts` | the `fh_resume_success` entry | R | the other classes |
| `abg/c_call.ts` | the three cursor-origin disjuncts for `fh_interaction_resume_admitted` | R | the `traversal_cursor_entered` and `traversal_route_admitted` origins |
| `abg/c_call_outcome.ts` | the `interaction_resume` closure arm | R | the judged closure arm |
| `abg/traversal_route.ts` | `InteractionResumeRouteAdmissionEvidence`; the resume lookup and `interactionEvaluationBasis` in the construction delta; the guard in the governed closure; `hasInteractionResumeRouteEvidence`; `isDeclaredInteractionResumeTarget`; the `interaction_resume` arms of `admitRoute`; the resume arm of the current-cursor scan | R | `hold` and `blocked` evidence and arms |
| `abg/traversal_transition.ts` | the `interaction_resume` evidence member and arm | R | `hold` |
| `abg/traversal_cursor.ts` | the resume arms of cursor origin, input origin, witness and successor checks; `isInteractionResumeCursorSuccessorAtPrefix` | R | cursor entry and route-target origins |
| `abg/closure.ts` | the `interaction` closure subject and its `resume` checks | R | the judged closure subject |
| `abg/replay.ts` | the typed-reference rows for the response and resume kinds, the resume value field, the semantic-payload resume arm | R | the `continuation_superseded` row (live for construction continuations) |
| `abg/runtime_failure.ts` | `fh_interaction_resume_admitted` in the progress-kind list | R | the other kinds |
| `abg/runtime_history.ts` | the two resume selector keys | R | the cursor-origin and input-origin keys of the live kinds |
| `abg/calculus/axioms.ts` | the response, resume and abandonment arms of `eventCalculusEffectRefs` | R | the axiom table `ROOT_EVENT_CALCULUS` (published in `native-runtime-observation.json`, kept byte-identical); the `continuation_superseded` arm for construction continuations |
| `abg/qualification_proof.ts` | the two response readers | R | the hold readers |
| `abg/project_read_ports.ts` | the resume input-origin disjunct | R | the other origins |
| `abg/effectful_invocation_truth.ts` | nothing beyond what the F_H owner stops returning | R | the F_H history check |
| `hog/route_proposal.ts` | refusal code `resume_not_admitted` | H | the other codes |
| `hog/traversal.ts`, `hog/index.ts` | `deriveInteractionSuccessorInputCarrierRef` and its export | H | the other cursor derivations |
| `product/semantics.ts`, `product/builtin_semantics.ts`, `product/index.ts`, `validator/self_conformance_semantics.ts` | `ProductSemanticsProvider.evaluateInteractionResponse`, `evaluateInstalledInteractionResponse`, the implementations | V (ruling 5, own commit) | every other provider member |
| tests | `t287-single-address-space-consolidation` (calls the prepare half), `generic-input-retention` and `t287-undispatched-diagnostic` (hand-built resume event), `m5-s03-authority` (grant resolver, provider wrapper), `t287-common-computational-library` (provider wrapper), test fixtures that implement the provider member | T | every hold assertion |

Lines changed over `T/code/src` (`git diff --numstat 72ac59366 -- code/src`):
27 files, 3,326 lines removed, 263 added, net −3,063.

| File | Removed | Added |
| --- | ---: | ---: |
| `abg/continuation.ts` | 1,235 | 0 |
| `abg/fh_continuation_projection.ts` | 694 | 49 |
| `abg/traversal_route.ts` | 321 | 43 |
| `abg/fh_resume_relation.ts` (deleted) | 283 | 0 |
| `abg/traversal_cursor.ts` | 155 | 66 |
| `abg/retry.ts` | 145 | 10 |
| `abg/retry_progress.ts` | 101 | 28 |
| `abg/closure.ts` | 61 | 14 |
| `hog/traversal.ts` | 51 | 0 |
| `abg/calculus/axioms.ts` | 49 | 19 |
| `abg/replay.ts` | 43 | 3 |
| `product/builtin_semantics.ts` | 40 | 0 |
| `abg/qualification_proof.ts` | 39 | 12 |
| `product/semantics.ts` | 30 | 0 |
| `abg/index.ts` | 24 | 0 |
| `abg/c_call_outcome.ts` | 20 | 7 |
| `abg/c_call.ts` | 9 | 4 |
| `abg/traversal_transition.ts` | 7 | 0 |
| `abg/effectful_invocation_truth.ts` | 4 | 4 |
| `validator/self_conformance_semantics.ts` | 4 | 0 |
| `abg/project_read_ports.ts` | 3 | 2 |
| `abg/runtime_history.ts` | 3 | 1 |
| `abg/runtime_failure.ts` | 1 | 1 |
| `product/index.ts` | 1 | 0 |
| `hog/route_proposal.ts` | 1 | 0 |
| `hog/index.ts` | 1 | 0 |
| `abg/retry_lifecycle.ts` | 1 | 0 |

The 263 added lines are reshaped existing code, not new behaviour. Ignoring
whitespace (`git diff -w --numstat`), 132 lines are added; the other 131 are
re-indentation after a removed branch. By file:

- `fh_continuation_projection.ts` (+49): the narrowed `ReplayContinuationState`
  type (`status: "open"`, the response, successor and terminal fields typed
  `null`, every key kept), the opened-hold row that fills those fields with
  `null`, the one-row lifecycle check that replaces the base ordering check
  (same message), the facts type `readonly []`, imports and comments.
- `axioms.ts` (+19): the ruling-4 case and its comment.
- `qualification_proof.ts` (+12): the two `null`-returning projector bodies
  with underscore parameters and their comment (section 9).
- `traversal_route.ts` (+11), `traversal_cursor.ts` (+4), `c_call.ts` (+4),
  `retry.ts` (+6), `retry_progress.ts` (+7), `closure.ts` (+8),
  `c_call_outcome.ts` (+1), `project_read_ports.ts` (+2),
  `runtime_history.ts` (+1), `runtime_failure.ts` (+1): a disjunction or
  ternary with its resume arm removed, rewritten as the remaining arm; a
  union type without its resume member; a comment saying the arm is reserved
  to 5.1.
- `effectful_invocation_truth.ts` (+4): its comment, rewritten.

Outside `code/src`: test files remove 303 lines and add 83; fixture Products
remove 87 and add 5. No file of the concurrent path-relation package
(`abg/worksite_construction_recovery.ts`, `semantic_revision.ts`,
`worksite_revision.ts`, `semantic_stage.ts`, `semantic_job.ts`,
`transport_contracts.ts`, `implementation/leaf_invocation_port.ts`, the
worksite files under `product/` and `implementation/`) is touched.

`rg` over `T/code/src` finds `fh_interaction_responded`,
`fh_interaction_resume_admitted` and `continuation_abandoned` only in the kind
declaration and payload contracts of `abg/event_store.ts` (`:102-104`,
`:959-978`), the published axiom table of `abg/calculus/axioms.ts`
(`:320-334`) and the ruling-4 routing (`axioms.ts:1314-1316`).

## 3. Ruling-4 routing

Where: `abg/calculus/axioms.ts`, `eventCalculusEffectRefs`, one combined case
for `fh_interaction_responded`, `fh_interaction_resume_admitted`,
`continuation_abandoned` and `continuation_superseded`, before the function's
`default`. Every replay, the held fluent projection and every owner that
derives Event Calculus truth run this fold over each admitted event. The
comment:

```ts
// Human response and same-Run resumption are reserved to 5.1. These kinds
// stay declared for it and have no 5.0 reader, and neither has an F_H
// supersession: a log that carries one is refused here, never folded as
// if the event were absent. Construction supersession is live.
```

Disposition: the fold throws the existing F_H owner message
``TypeError(`continuation ${event.aggregateId} has an invalid event lifecycle`)``
(the message `fh_continuation_projection.ts` already threw for a continuation
history it could not order). No new refusal code or message. Why a case and
not a fall-through: the kind `switch`'s `default` (`axioms.ts:1462-1463`)
returns `ROOT_EVENT_CALCULUS[event.kind]` for every admitted kind without its
own arm, so falling through would fold the declared 5.1 effects as if 5.0 had
a reader. The fold's existing way of refusing an event it cannot apply is a
thrown `TypeError` that leaves the step unapplied; its precedent, the
route-kind `default` (`axioms.ts:1606-1607`, "traversal route event carries an
unknown route kind"), names route events, so the case reuses the F_H owner's
message instead. The replay entry calls the fold at
`replay.ts:997` (`deriveRuntimeHeldFluentProjection`) with no surrounding
`catch`, and `event_calculus.ts` has none, so a replay of such a log throws;
the lane below exercises the fold and the F_H fact owner directly, not the
replay entry. The F_H fact owner `projectFhEffectfulPublicInvocationFacts`
catches the throw in its existing arm and returns
`{disposition: "invalid_history", eventRefs}`.
`continuation_superseded` keeps its base effect when its `continuationKind`
is `construction_intent`, `selected_action` or `pending_execution`; any other
supersession is refused. The `switch` and its `default` are otherwise
unchanged, and no arm swallows these four.

The published table `ROOT_EVENT_CALCULUS` (and so
`native-runtime-observation.json`) is unchanged: its rows for the four kinds
stay as the declaration of 5.1 effects.

Second line of defence: `projectFhContinuations` now accepts exactly one row
per F_H continuation, `fh_interaction_opened`; any other row in the
continuation's history throws the same "invalid event lifecycle" message.

The refusal lane is `t287-single-address-space-consolidation`, "RAW F_H hold
seed: a hand-built response, resume, abandonment or F_H supersession on the
open hold is refused by the fold and the F_H fact owner, never folded as if
absent". It builds the RAW hold seed and then one projector-stamped event per
kind on the open hold, with four `t.test` subtests. For each kind:
`deriveRuntimeHeldFluentProjection` over the Run cut throws
`/continuation <ref> has an invalid event lifecycle/`, and
`projectFhEffectfulPublicInvocationFacts` returns
`{disposition: 'invalid_history', eventRefs: []}`. Before the four kinds, the
seed alone projects `['open']` and `{disposition: 'valid', facts: []}`.

| Build | Result |
| --- | --- |
| base (`72ac59366`, scratch copy of the lane) | 4 of 4 subtests fail, "Missing expected exception": the base fold applies each event |
| final | 4 of 4 pass |

## 4. Replay comparison

Entry: `/private/tmp/abg-td25r-work/scripts/replay-log.mjs` decodes each log
with `validateHistoricalEvents`, selects the whole log with
`selectValidatedRuntimeEventPrefix`, and records the whole-log
`replayValidatedRuntimeEventPrefix` result (`replayDigest`, a canonical
digest of the full replay state, `runtimeStatus`, continuation count),
`projectFhContinuations` over the held fluent projection,
`projectFhEffectfulPublicInvocationFacts`, and per Run the Run replay against
full authority (the reconstruction tests' entry). It ran on the base build
and after every commit; the final run is on the final-root copy of
`de96441a9`.

Result: **11 of 11 logs give identical output on base and final**, every
digest, owner fact, refusal message and per-Run value.

| Log | Rows | Whole-log replay digest | Status | Runs |
| --- | ---: | --- | --- | ---: |
| live rc.12 Run, `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl` | 1,695 | `sha256:3800fb111acfede513425e706737e1637b7dfd210aac2fe68015eb3b47f5c5a5` | closed | 1 |
| default library, `rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl` | 44 | `sha256:40028725031a6ab8f143fa7ba6cdff4a8b80e6af2ad3bfe8cd28784295306a11` | blocked | 1 |
| retry, `rc11-qualification-01/evidence-generation-03/raw/native-assessment/…/events.jsonl` | 27 | `sha256:6dbf55865ef5692a2ef9b5a43e84a54ab78d1a69c36980568923cd843cf3bc1c` | failed | 1 |
| re-entry with `selected_action` continuations, `rc11-qualification-01/evidence-generation-02/raw/selected-action/…/events.jsonl` | 216 | `sha256:0d3923da558e1b89dafabc8eff59521fdb5d164f552fffccca7c29cdcabef091` | held (2 continuations) | 1 |
| registered selection, recursion, `rc8-reference-preservation-01/registered-selection-whole-001/actual-001/selection-evidence/events.jsonl` | 282 | whole-log replay refuses: "run_stopped event and run_terminal HoldsAt truth disagree" | 7 Run digests, each identical | 7 |
| native workspace work, `rc11-qualification-01/native-02/runtime-001/resources/events/runtime.events.jsonl` | 421 | `sha256:bc4a919ee1d0d395b11b8487d1c51483efa500422dfe2d01068fed8a510275ae` | failed | 1 |
| construction intent superseded, `rc4-native-recovery-01/…/hc2-current-intent/continue-events.jsonl` | 166 | whole-log replay refuses: "requires zero or one exact run_stopped event" | 2 Run digests, each identical | 2 |
| r10 proof log, `T/test_env/proof/abi5-root-r10.events.jsonl` | | decode refuses: "runtime event payload matches no admitted event-contract variant" | | |
| RC1 F_H hold, `s02-installed-continuation-19/…/continued-mixed-human-boundary-events.jsonl` | | decode refuses: "durable ABG event log contains a noncanonical event" | | |
| RC1 F_H hold, `s02-installed-continuation-18/…/appended-events.jsonl` | | decode refuses: same | | |
| RC1 F_H hold, `s02-installed-continuation-04/…/runtime.events.jsonl` | | decode refuses: "event stamp differs from the exact native profile schedule" | | |

The seven decodable logs give `projectFhContinuations` = 0 rows and
`projectFhEffectfulPublicInvocationFacts` = `{disposition: "valid", facts: []}`
on both builds. Paths without a leading `/` are under
`/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/`
or `.../comments/codex/20260923_RC1_QUALIFICATION_RECIPE/`.

Coverage limit: no recorded log that the current build decodes holds an F_H
hold. The only recorded holds (the RC1 logs) are refused at decode by base
and final alike, so the replay comparison proves the hold unchanged only
through those identical refusals. Live hold behaviour is proved by the lanes
in section 5.

## 5. Lanes

Command, from T, one file at a time:
`TMPDIR=/private/tmp/abg-td25r-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`
(`/private/tmp/abg-td25r-work/scripts/lanes.sh`). Before runs on
`base-root` (`72ac59366`), after on `final-root` (`de96441a9`). TAP files:
`/private/tmp/abg-td25r-work/lanes-before/`, `lanes-after/`,
`lanes-after-extra/`, `lanes-before-f09/`, `lanes-after-f09/`.

Hold-lane selection: `rg -l "fh_interaction_opened|admitOwnedFhInteractionHold|admitFhInteractionOpen|interaction_lifecycle|blocked_handoff|blocked handoff"`
over `test_env/tests` finds no file. The names occur in
`test_env/support/single-address-space-consolidation.mjs` (imported by
`t287-single-address-space-consolidation`, `t287-exact-construction-intent`,
`t287-route-reconstruction`, `t287-calculus-fold`) and in
`test_env/falsifiers/runtime-f09-worker.mjs` (driven by
`t287-r4-aba-retry` and `t287-f09-frontier-handoff`). A blocked handoff is
asserted in `m5-event-calculus-runtime`. All of these, the brief's named
files and the files this package edits are in the table.

| Lane | Before tests / pass / fail / skip | After tests / pass / fail / skip |
| --- | --- | --- |
| `t287-ordered-reconstruction` | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 |
| `t287-reconstruction-conservation` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `m5-fresh-process-reconstruction` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-route-reconstruction` | 13 / 11 / 0 / 2 | 13 / 11 / 0 / 2 |
| `t287-held-prefix` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 |
| `t287-retry-run-prefix` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `m5-retry-lifecycle-authority` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-r4-aba-retry` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-r6-retry-success-exit` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `m5-event-calculus-runtime` | 19 / 18 / 0 / 1 | 19 / 18 / 0 / 1 |
| `t287-default-library` | 37 / 33 / 1 / 3 | 37 / 33 / 1 / 3 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-exact-construction-intent` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-recursive-registered-selection` | 7 / 6 / 0 / 1 | 7 / 6 / 0 / 1 |
| `hog-operator-support` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-single-address-space-consolidation` | 12 / 10 / 2 / 0 | 17 / 15 / 2 / 0 |
| `generic-input-retention` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-undispatched-diagnostic` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `m5-s03-authority` | 5 / 5 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-common-computational-library` | 17 / 17 / 0 / 0 | 16 / 16 / 0 / 0 |
| `t287-framework-handoff-types` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t287-wave2-owner-contract-source-set` | 15 / 15 / 0 / 0 | 15 / 15 / 0 / 0 |
| `t287-f09-frontier-handoff` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |

Per test, by name (`/private/tmp/abg-td25r-work/scripts/tapcmp.py`), 21
lanes give the same outcome for every test. The other four differ only by
the test edits of section 6:

- `t287-single-address-space-consolidation`: the RAW F_H test is retitled
  (pass before, pass after); the ruling-4 lane is added (1 test and 4
  subtests, all pass), which makes 12 → 17. The two failures are the same
  two tests on both builds.
- `t287-undispatched-diagnostic`: one test retitled, pass on both.
- `m5-s03-authority`: the grant-resolver test is deleted (5 → 4).
- `t287-common-computational-library`: the O-SCHEMA response test is
  deleted (17 → 16).

No hold lane changes its result.

The three failures are environmental and identical on both builds:
`t287-default-library` "RC7 fixed admission: a Public direct Testing state
Result admits direct UAT …" and `t287-single-address-space-consolidation`
"maintained SDK setup holds one acquired resource …" refuse their packed
artifact with `payload_inventory_mismatch` ("archive file set differs from
the manifest") in `test_env/uat/public-setup.mjs` `verifyArtifact`; "single-
address-space proof records every measured case" fails because the
`maintainedSetup` case did not complete. The scratch test copies in
`base-root` are not the cause: they postdate the before-run and the package
`files` list is `build/**`, `contracts/**` and the manifest.

Skips (18 tests in the hold lanes, same on both builds) are the files' own
environment gates that the brief's command does not set: retained evidence
(`ABI5_HISTORICAL_LIVENESS_LOG`, `ABI5_LIVENESS_CUT_HISTORY`,
`ABI5_PREFIX_REUSE_OBSERVATIONS`, `P0_RETAINED_NATIVE_SCRATCH`,
`ABI5_HELD_PREFIX_NATIVE_FIXTURE`, `ABI5_OWNED_JUDGMENT_FIXTURE`, two
capture fixtures) and live selectors (`ABI5_DEFAULT_LIBRARY_LIVE`,
`ABI5_RECURSIVE_SELECTION_LIVE`).

Public surface for the five members: `t287-framework-handoff-types` test 5,
"packed runtime keeps 56 declared, 47 callable and 9 unavailable members and
its raw refusals", sends one call per `abg.operation.interaction.respond`
member (`answer_escalation`, `approve`, `assess`, `reject`, `select`)
through the packed `runInstalledDefinitionCallTransport` and asserts
`installed_definition_call_transport_refusal` with code
`installed_binding_unavailable`. It passes on both builds.

Provider-member lanes (after only; a pass needs no base run), for the
fixture Products and the deleted consensus test:

| Lane | Fixture | After tests / pass / fail / skip |
| --- | --- | --- |
| `m5-consensus-module` | system provider | 16 / 16 / 0 / 0 |
| `m5-installed-portability` | `flavored-catalog-product` | 8 / 8 / 0 / 0 |
| `t287-st1-installed-cross-owner-hello` | `developer-mini-product`, `language-smoke` | 3 / 3 / 0 / 0 |
| `installed-language-smoke` | `language-smoke` | 1 / 1 / 0 / 0 |
| `t287-registered-graph-selection` | `registered-selection-product` | 1 / 1 / 0 / 0 |
| `t287-native-structural-gates` | `language-structural` | 9 / 9 / 0 / 0 |
| `t287-native-registered-selection` | `registered-selection-product/native.mjs` | 1 / 0 / 0 / 1 (`ABI5_NATIVE_SELECTION_LIVE`) |
| `t287-selected-action` | `t287-selected-action-product` | 1 / 0 / 0 / 1 (`ABI5_SELECTED_ACTION_EVIDENCE_ROOT`) |
| `t287-s03-automatic` | `t287-s03-automatic-product` | 2 / 0 / 0 / 2 (`ABI5_S03_EVIDENCE_ROOT`) |

`exact-intent-product` and `registered-selection-product/recursive.mjs` are
covered by `t287-exact-construction-intent` and
`t287-recursive-registered-selection` above. Every edited `.mjs` fixture
passes `node --check`.

Build and lints at every commit: `npm run build`, `lint:imports`,
`lint:lifecycle` and `lint:calculus` pass; `tsc --noEmit` is clean and
`--noUnusedLocals` reports the same 13 findings as base.

## 6. Deleted and changed tests

| File | Case | Change | Reason |
| --- | --- | --- | --- |
| `m5-s03-authority` | "S03 continuation operation authority requires the exact admitted grant and lifecycle state" | deleted, with its `operationBasis` helper | its subject is `resolveContinuationPublicOperationGrant` and `prepareContinuationPublicOperation`, the retired second `public_operation_admitted` builder |
| `m5-s03-authority` | "S03 Product semantics requires a loaded provider and is absent from HoG's public port" | changed: drops the `evaluateInstalledInteractionResponse` presence and HoG-absence asserts, the forged provider's response member and the wrapper's loaded-provider throw | the wrapper and member are retired; the test keeps `admitInstalledProductInput` and `bindInstalledLeafInvocationPort` absent from HoG and `projectInstalledLeafSemantics` refusing an unloaded provider |
| `t287-single-address-space-consolidation` | "RAW F_H response pair: …" | changed and retitled "RAW F_H hold seed: an explicit conditional root grant and one exact basis/Run/pending/hold/open seed hold at their actual gates, the open seed has no F_H response fact, and the owners keep their values over repeated reads, a fresh frozen clone and unrelated growth"; proof key `fhResponsePair` becomes `fhHoldSeed` | the response-pair half called the retired preparers. Kept on live behaviour: the seed's gates, the grant, the before-owners, the open seed's `{valid, facts: []}`, an ungranted root still opening the same hold, repeated read, fresh frozen clone and unrelated growth. Dropped with the preparers: the prepared operation and response events, the six-field fact, preparer guards, crossed-pair controls and historical cuts of the completed pair. The orphan F_H operation refusal stays proved by the complete-pair case in the same file (`:820`, `respondCut.warm.fh` = `invalid_history`) |
| `t287-single-address-space-consolidation` | "single-address-space proof records every measured case" | changed: `fhResponsePair` → `fhHoldSeed` in its list | follows the key rename |
| `t287-single-address-space-consolidation` | "RAW F_H hold seed: a hand-built response, resume, abandonment or F_H supersession on the open hold is refused …" | added | the ruling-4 lane (section 3) |
| `generic-input-retention` | "real warm derivation and serialized cold projector agree; …" | changed: the `resume` origin leaves the loop; the hand-built resume fixture is now asserted refused (`projectRetainedWorksiteInputAtPrefix` = `null`); the resume arms of two crossed-field mutators go | a hand-built resume event is no cursor origin; the `entry` and `route` origins keep every assertion |
| `t287-undispatched-diagnostic` | "undispatched refusal retains entered, routed and resumed cursor ownership at raw and cold boundaries" | retitled "… retains entered and routed cursor ownership at raw and cold boundaries and refuses a resumed cursor"; the hand-built resume now asserts `c_call_admission_rejection` and `matches() === false`; the wrong-digest resume variant goes | ruling 4: a hand-built resume is refused; the entered and routed assertions are unchanged |
| `t287-common-computational-library` | "O-SCHEMA: the Product boundary admits an interaction response candidate to I-JSON before the provider evaluates it" | deleted | its subject is `evaluateInstalledInteractionResponse` |
| `m5-consensus-module` | "S05 Product response semantics bind the exact pending result and acting actor" | deleted, with its now-unused `unresolvedResolution` helper | its subject is `ABI5_SYSTEM_PRODUCT_SEMANTICS.evaluateInteractionResponse`; it passed on base (`/private/tmp/abg-td25r-work/consensus-s05-base.tap`). The live escalation finalization ("S05 round reduction and same-Run human finalization …") stays |

`generic-input-retention` and `t287-undispatched-diagnostic` as changed are
red on the base build (the base reader admits the resume) and green on the
final build. No assertion about the hold is weakened: every hold assertion of
the RAW seed test is kept, and no other test asserting a hold changed.

## 7. Provider member

The pre-check finds `evaluateInteractionResponse` named nowhere under
`T/contracts`, in no published schema and in none of the five members'
packets (`framework-handoff.compile.ts` and its generated lines). The member
goes in its own commit, `de96441a9`:

- `product/semantics.ts`: the interface member, the loader's
  `typeof value.evaluateInteractionResponse !== "function"` check, and
  `evaluateInstalledInteractionResponse`; `product/index.ts` its export.
- implementations: `ABI5_PRODUCT_SEMANTICS`, `ABI5_SYSTEM_PRODUCT_SEMANTICS`
  (the consensus escalation-decision evaluation; `isConsensusEscalationRequest`
  and `isConsensusEscalationDecision` stay, used by the live consensus
  owners), `ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS`,
  `ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS` (`qualificationRulingMatches`
  stays, used by the ruling predicate).
- fixture Products: `exact-intent-product`, `t287-selected-action-product`,
  `t287-s03-automatic-product`, `registered-selection-product`
  (`index.mjs`, `native.mjs`, `recursive.mjs`), `language-smoke`,
  `language-structural`, `flavored-catalog-product`, `developer-mini-product`
  (its implementation and the response-evaluation counter with its two
  accessors, which nothing reads).

`developer-mini-product` type-checks with `--noUnusedLocals`.
`flavored-catalog-product` does not type-check standalone on base or final
(`publication.ts` cannot resolve `@abiogenesis/typescript-tenant/gtl`); its
edit is the deletion of a three-line `return null` member.

Design documents still name the member and the removed code (not edited, not
mine): `design/ABI5_REALIZATION_CONSTITUTION.md:2660-2661, 3128`,
`design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1301, 1305, 1470, 1524,
1602`, `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:636`.

## 8. Identity digests and generated contracts

After the final build of `de96441a9` (before restoring generated files):

| Identity | Base (`72ac59366`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:560eee7e53e000851d6eaccc78ee2d56b99bd0a9cab976edea787e64f7765f65` | `sha256:aa34206cf73b89350ee140d9d367e2c6d1dc22f8b27d8a590aa2fe8c0235e5ce` |
| `contributionManifestDigest` | `sha256:85affa61afeb7c99078ba612830f91e796db20eb19bf6df16de985b72fec576a` | `sha256:a85f6d5692b867f29d736e7a9145f00df0138d34a4225ab2520d190ea79f45cf` |
| `publicContractCatalog.catalogDigest` | `sha256:9366decf0cfef0241bb5cac33b3df374d38a2a0892239ae8a0558e75c853aa8d` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` |
| capability graph `graphDigest` | `sha256:0e5048eafef7ed1e4f037065d31762b554a4b3c95ca0f1bdbfdd3b9c778c9e87` | `sha256:19af149649e39a5f2c8cf768a2669ee5b9b0a9dd4ed67f34d3d9908eb31fbe84` |
| capability graph file `contentDigest` | `sha256:5ac4f7293249983726ceef230972a813e8e5bb195750bfbd3825a8c0b3ddb968` | `sha256:b9584173a2d018fd0d9879e12895f9d6928993a1e1f26f6953c6cd2db90994d3` |

`productId` stays `product://abiogenesis/typescript-tenant@5.0.0-rc.12`;
`descriptorRef`, `provenanceRef` and `contributionManifestRef` follow the new
content digest.

Generated files the final build changes:

- `T/contracts`: only `contracts/capabilities/capability-definition-graph.json`,
  digest and reference values only (a structural diff against the base
  build's file finds no other change). No schema, no contract member list,
  no other contract file changes. `native-runtime-observation.json` is
  byte-identical.
- `T/product-toolchain-manifest.json` (outside `T/contracts`): digest and
  reference values; and the deleted file `abg/fh_resume_relation.{js,d.ts}`
  leaves `productRelativeLocators` and leaves the declaration inventory of
  47 public-contract rows (one entry per package export path, 12 paths). No
  entry is added; no other inventory entry changes beyond its digest.
- `test_env/fixtures/abi5-root-candidate-basis.json`: unchanged.

All three are restored before every commit; the branch carries no generated
file.

## 9. Deviations

- Removed beyond the named list: `projectFhInteractionSemanticBasis` and
  `projectFhInteractionSemanticBasisAtPrefix` (`continuation.ts`, with their
  barrel exports). Their only callers were the retired preparers; the design
  documents above still name them.
- `qualification_proof.ts`: `projectQualificationRulingForConsumer` and
  `projectQualificationOwnerRuling` read the owner ruling from an
  `fh_interaction_responded` row. They now return `null` with the comment "An
  owner ruling is a human response, reserved to 5.1: no 5.0 history carries
  one." instead of being deleted, because their callers are live code paths:
  `realizeQualificationRuling` (`implementation/qualification.ts:84`), the
  acknowledgment branch for an ungrounded external-construction attribution
  (`qualification_proof.ts:676-680`) and the `abg/index.ts` export. Without
  an `fh_interaction_responded` row the base projectors also returned `null`,
  so no 5.0 history changes result. The callers' ruling arms are dead until
  5.1 (residual).
- The ruling-4 lane asserts on the fold and the F_H fact owner, not on the
  replay entry: the RAW hold seed does not replay on base or final ("incomplete
  CCall identity payload"). The fold is the step every replay runs.
- The live rc.12 replay subject is the demonstration's own store under
  `/private/tmp/abg-demo-tmp`, because the evidence-root copy
  (`rc12-executive-01-evidence/live-01/events.json`) is an export from
  ordinal 4 that does not decode alone.
- Lanes run on rsync copies of the worktree (`base-root` at `72ac59366`,
  `final-root` at `de96441a9`, without `.git`, `test_runs` and `uat/runs`),
  each with its own build and the generated files that build wrote, so each
  lane sees a consistent package.
- `m5-consensus-module`: the deleted test's helper `unresolvedResolution`
  goes with it. `developer-mini-product`: the response-evaluation counter and
  its accessors go with the member.

## 10. Residuals

- `abg/event_store.ts:2930`: the event store's hand-written admission check
  for a completed retry progress payload still accepts `completionClass`
  `"fh_resume_success"`. No generated contract names it and no 5.0 owner
  produces or reads it. It is admission of a declared payload shape, like the
  four kinds, so it stays; deleting the one array entry would narrow what the
  store admits. Ruling 1, section 11.
- `hog/traversal_contract.ts:76` `InteractionResumeTraversalEntryInput` stays:
  `hog/entry.ts:371` uses its `continuationProductBasis` field type for the
  live entry.
- `EffectfulPublicInvocationPriorAdmission` still includes the
  `interaction.respond` fact arm (now never produced).
- `readHeldRuntimeEventsAtDurablePrefix` (`event_store.ts:2328`) has no source
  caller left; it is exported.
- The published calculus fluents `continuation_response_available` and
  `continuation_terminated` stay in `ROOT_EVENT_CALCULUS` and in
  `replay.ts:292-313`'s fluent-name lists, with the table rows of the four
  kinds.
- Qualification recipe and inventory under `test_env/qualification/recipe`
  still list `abg/fh_resume_relation.ts` (the `consensus.ts` deletion left
  them stale the same way).
- Design documents named in section 7 describe removed code.
- The qualification owner-ruling path (section 9) is dead until 5.1.
- The five `interaction.respond` Public members, their schemas and packets
  remain, as ruled; their transport refusal is unchanged (section 5).

## 11. Rulings needed

1. `event_store.ts:2930` `"fh_resume_success"` in the retry progress
   admission check: keep until 5.1 (as now), or delete the entry.
2. Qualification owner ruling: accept the two projectors stubbed to `null`
   with their caller arms dead until 5.1 (as now), or retire the ruling path
   (`realizeQualificationRuling`, the acknowledgment branch, the export),
   which goes beyond this package's deletion list.
3. `projectFhInteractionSemanticBasis(AtPrefix)` removed beyond the named
   list (no caller outside the retired preparers): confirm.
4. The ruling-4 refusal reuses the F_H owner's message "continuation <ref>
   has an invalid event lifecycle" as a `TypeError` from the fold: confirm
   it as the named existing disposition. The fold has no refusal for an
   admitted kind without an arm: its kind `default` returns the published
   table row, which for these kinds is the 5.1 effect, so a fall-through
   would fold them. The alternative message is the route-kind `default`'s
   "traversal route event carries an unknown route kind", which names route
   events.
5. The manifest's declaration inventories (47 rows) and
   `productRelativeLocators` lose the deleted `fh_resume_relation` entries,
   outside `T/contracts`: confirm as expected under ruling 7.
