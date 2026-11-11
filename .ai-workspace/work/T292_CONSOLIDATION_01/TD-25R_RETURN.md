# TD-25R Return: the human response and resume residue

Writer: Claude Opus 5.5. Branch `claude/td25r-response-resume-residue` from
local `main` at `72ac59366`, worktree `/private/tmp/abg-td25r`. Change class:
realization_refactor. No push, no tag.

**Status: in progress. Step 1 (census and site table) is committed. The
census finds no recorded F_H response, resume, abandonment or supersession,
so the readers may go.**

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
V provider member, T test. Lines removed per file are filled in at the end.

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

Ruling 4 routing (plan): one explicit case in `eventCalculusEffectRefs`
before its `default`, the fold every replay runs over every event. Its
existing way of refusing an event it has no arm for is a thrown `TypeError`,
which leaves the step unapplied (the route-kind `default` is the precedent).
`continuation_superseded` is refused there only when its continuation kind is
not a construction kind.

## 3. Ruling-4 routing

Pending.

## 4. Replay comparison

Pending. Subjects (rows on the base build):

| Log | Rows | Why |
| --- | ---: | --- |
| `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl` | 1,695 | the live rc.12 Run's store; the evidence-root copy `rc12-executive-01-evidence/live-01/events.json` is an export from ordinal 4 and does not decode alone |
| `work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl` | 44 | default-library Run ending in a blocked handoff |
| `work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/evidence-generation-03/raw/native-assessment/tmp/abi5-root-env-MdmivN/runtime/events.jsonl` | 27 | retry Run |
| `work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/evidence-generation-02/raw/selected-action/tmp/abi5-root-env-gjgeWi/runtime/events.jsonl` | 216 | re-entry Run with child foldback and `selected_action` continuations |
| `work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/registered-selection-whole-001/actual-001/selection-evidence/events.jsonl` | 282 | registered selection, seven Runs, child foldback |
| `work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/native-02/runtime-001/resources/events/runtime.events.jsonl` | 421 | native workspace work |
| `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/…/test_env/evidence/hc2-current-intent/continue-events.jsonl` | 166 | construction-intent continuation superseded |
| `T/test_env/proof/abi5-root-r10.events.jsonl` | refused | the r10 proof log |
| three RC1 F_H hold logs (`s02-installed-continuation-04`, `-18`, `-19`) | refused | recorded F_H holds |

## 5. Lanes

Pending.

## 6. Deleted and changed tests

Pending.

## 7. Provider member

Pending.

## 8. Identity digests and generated contracts

Pending.

## 9. Deviations

Pending.

## 10. Residuals

Pending.
