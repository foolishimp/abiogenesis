# Area findings: abg-calls (call execution, retry, continuation, fan-out)

Commentary, not law. Read-only area review for the Executive's second
technical debt register. Reviewer: Claude Opus 5.5, 2026-11-12, at
`main` `002035b8a`. Same model family as the Executive; this is not an
independent assessment.

**What I did.** I read the brief, the census outputs for the sixteen area
files (`declarations.json`, `compiler-unused.json`, `kinds-never-produced.json`,
`kinds-never-read.json`, `clones.json`, `clones-by-file-pair.json`), the
register's retention section and its C-6, C-10, C-14, C-15b and C-17 rows, the
Product's 5.0/5.1 boundary (`specification/PRODUCT.md:93`, `:373`, `:415`,
`:1225-1233`) and `requirements/README.md:92-96` and
`REQ-P-PUBLIC-CONTRACTS.md:229-233`. I read code as recorded in the coverage
table, with grep for every claim about producers, callers and tests.

**What I did not do.** I ran no build, test or profile. Every performance
claim below is structural (by reading) unless it cites an earlier measurement.
I did not search the 1 GB campaign logs under `.ai-workspace/work/` for event
kinds; I relied on the RC6 whole-log census and on there being no producer in
source. Grep over `test_env/uat` was abandoned (copied `node_modules`; it timed
out).

**Labels used.**
- *Overload triple*: one exported function written as a public overload over
  `ValidatedRuntimeEventPrefix`, an `/** @internal */` overload over
  `RuntimeEventPrefix`, and the implementation signature, each with the full
  parameter list (introduced codebase-wide in `67c333799`).
- *Body view scan*: iterating `runtimeEventBodiesAtPrefix(prefix)` with
  `filter`, `find`, `slice`, `map` or `flatMap`. On a located (body-location)
  prefix each visited row goes through `RuntimeHistory.event`
  (`runtime_history.ts:316-342`), which counts `bodyRows`, decodes a body that
  is not in the generation's verified-body cache (`bodyDecodes`), and never
  caches a `basis_admitted` body unless an open scope holds its invocation.
- *Manifest pins*: `product-toolchain-manifest.json` lists the `.d.ts` and
  `.js` files of 13 of the 16 area files in 48 public contract rows each
  (`retry_lifecycle`, `fan_out_projection` and `child_lifecycle` in 1). Any
  edit to those files moves those rows' digests; C-14 accepted regeneration.

---

## Five most valuable entries

1. **E1** The F_H response/resume chain: a producer side with no Public binding
   and a reader side for an event kind nothing produces. About 2,000 lines in
   this area alone; the decision is the owner's (bind or retire).
2. **E2** `construction_continuation.ts` spells six return types out in full,
   three times each, including a frozen copy of the `GraphFunction` schema.
   About 1,330 of its 2,480 lines are signature text.
3. **E3** Body view scans whose predicate only needs envelope fields or an
   existing selector key, on the F_P transport and child foldback paths.
4. **E4** The overload triple and the hand-written CCall event envelope are the
   repeated shapes behind the `c_call.ts` and `retry.ts` self-clones.
5. **E8** Worksite C0 authentication and outcome branches live inside the
   generic CCall outcome owner, and may re-hash payloads the store already
   verified on decode (investigate).

---

## Check 1. Dead declarations (`none` and `package` tiers)

Every `none` and `package` declaration in the area, grouped by the feature it
served. All were confirmed by grep over `code/src` and `test_env/tests`,
`falsifiers`, `support`, `proof`, `qualification`.

| Feature | Declarations | Disposition |
|---|---|---|
| F_H response, resume and terminal disposition | `continuation.ts`: `admitContinuationTerminal`, `HeldInteractionCCallProjectionInput`, `ContinuationPublicOperationAdmission`, `PreparedContinuationPublicOperation`, `UnavailableEffectfulPublicInvocationTruth`, `PreparedContinuationPublicOperationResult`, the two `Owned…` types, `FhInteractionResponseAdmission`, `PreparedFhInteractionResponse`, `CommittedFhInteractionResponse(Result)`, `projectHeldInteractionCCallOutcomeAtPrefix`, `runtimeEventCandidate`, both `resolve…ContinuationOperationCoordinateAtPrefix`, `projectFhInteractionSemanticBasis(AtPrefix)`, `prepareContinuationPublicOperation`, `resolveContinuationPublicOperationGrant`, `prepareFhInteractionResponse`, `commitFhInteractionResponseAtExpectedPrefix`, `deriveFhResumeSuccessorInput(AtPrefix)` | Confirmed dead. Four have test mentions: `prepareContinuationPublicOperation` and `prepareFhInteractionResponse` (`t287-single-address-space-consolidation.test.mjs:1084-1133`), `resolveContinuationPublicOperationGrant` (`m5-s03-authority.test.mjs:127-138`); `runtimeEventCandidate`'s 2 test hits are a same-named helper. See E1. |
| Complete-output and store-reading Public wrappers over `Owned` owners | `c_call_outcome.ts:1943-1959` `admitCCallResult`, `admitCCallJudgment`, `admitCCallRejection`, `admitCCallCompletion`, `projectCCallOutcomeReceiptAtPrefix`, type `AdmittedCCallOutcomeReceipt` (`:586`); `c_call.ts:4393` `rehydrateWorkflowCCall`, `:4731` `projectAdmittedLeafCCallOutcomeAtPrefix`, `:4992` `rehydrateAdmittedCCallState`; `open_call.ts:406` `rehydrateOpenedTraversalScope`; `deferred_application.ts:40` `projectDeferredApplicationAtPrefix`; `probabilistic_result.ts:303` `admitProbabilisticResultCandidate`; `retry.ts:3576` `projectExecutableRetryInput`, `:181` `RetryInputBasis`; `continuation.ts:1693` `admitFhInteractionHold` | Confirmed no runtime caller and not named in `T/contracts/` or the register; several are test-reached through the `./abg` barrel. See E5. |
| Construction pending-execution request | `construction_continuation.ts:2278` `projectPendingExecutionUseRequest` | **Not refuted.** Its one source caller, `owner_bindings/run_invocation.ts:2280`, sits in `populateRunContinuationAtDurablePrefix` (`:2215`), which the census also marks `package` with 0 tests. Cross-area lead for the owner-bindings reviewer: is the `pending_execution` variant of `run.continue` reachable from any binding? |
| Historical terminal selection | `terminal_result_contracts.ts:82` type `AbgHistoricalTerminalSelection` | Confirmed dead type (the schema at `:81` is live through `:88`). Fold into E6. |
| Runtime failure close helpers | `c_call.ts:3173` `runtimeFailurePlanBody`, `:3512` `runtimeFailureCloseError` | Confirmed dead; E6. |

`none`/`package` declarations elsewhere in the area: none.

## Check 2. Compiler-unused

One entry: **E6**.

## Check 3. Kinds handled but never produced, produced but never read

| Kind | Site | Decision |
|---|---|---|
| `fh_interaction_resume_admission` | `continuation.ts:295` | Residue of F_H resume (5.1). Type `FhInteractionResumeAdmission` is imported by reader branches in `retry.ts:282`, `traversal_route.ts:483`, `closure.ts:209`; nothing constructs one. E1. |
| `interaction_resume` | `c_call_outcome.ts:1803` (and `traversal_route.ts:478/2887/4394`, `traversal_transition.ts:106`) | Dead branch of F_H resume: the `interaction_resume` route evidence class has no producer, so the `kind: "interaction"` closure arm at `c_call_outcome.ts:1810-1818` never runs. E1. |
| `no_declared_check` | `c_call.ts:784` (`CCallJudgment`) | Reserved by requirement, not dead: `REQ-R-ABG3-CCALL.md:64-65`, `REQ-L-GTL3-C-ALGEBRA.md:56`. No producer exists; that is a requirement-to-code gap for the requirement owner to check, not removable debt. (`escalated` at `:783` is the same case; I did not trace it further.) |
| `plan_mismatch` | `c_call.ts:869` | Unproduced refusal code in `CCallRuntimeFailureCloseRefusal`. Residue of the retired `runtimeFailureCloseError` path; E6. |
| `vector_contract_mismatch` | `fan_out.ts:126` | Unproduced refusal code in `FanOutCompletionRefusal`; no producer in `fan_out.ts` or `fan_out_projection.ts`. Remove from the union (S, part of E6). Not traced into tests. |
| `c_call_judgment_available`, `continuation_terminated` | `c_call.ts:1357`, `fh_continuation_projection.ts:741` | Refuted: fluent names read through `holdsAt`/`runtimeFluentHoldsAtPrefix(constructRuntimeFluent({ name }))`. |
| `abg_typed_terminal_result`, `abg_historical_declaration_reference` | `terminal_result_contracts.ts:9/60/74` | Refuted: valibot literals read by `safeParse`/`parse`. |
| `canonical_completion_facts` | `fan_out_projection.ts:1066` | Refuted: a `Symbol` description. |
| `payload_not_record`, `undispatched_evidence_mismatch`, `worksite_failure_evidence_mismatch`, `retry_attempt_not_projected` | `c_call_outcome.ts:141/373`, `c_call.ts:2423`, `retry.ts:1296` | Refuted as dead: `StructuralRefusal` codes returned by `checkExactRecord`; they are diagnostic outputs that callers map to `null`. Whether any caller surfaces them is a diagnostics question, not dead code. |

## Check 4. Second owners

E4 (CCall event envelope inside `c_call.ts`), E7 (exact-key predicates;
cursor-origin input digest; F_H continuation identity), E2 (the
`GraphFunction` schema expansion and `EffectfulPublicInvocationPriorAdmission`
restated), and in E1 the second `public_operation_admitted` builder at
`continuation.ts:994`.

## Check 5. Failed, unfinished or superseded features

E1 (F_H response/resume). No module in the area is named after a milestone or
ticket.

## Check 6. Structure

E2, E4, E8. The long functions are listed under **Long functions** below;
they get no entry of their own except where they block E1 or E8.

## Check 7. Performance

E3, E9, E10. All structural. The class of cost (canonical JSON, SHA-256 and
canonical comparison dominating a call) was measured in RC6 F2 (52-55 % of
cold-read CPU, `20261106T024745Z_REVIEW_RC6_RC7_OPERATIONAL`), RC8 F2 (two
thirds of a 4 MiB call; `admitOwnedCCallResult` 199 ms inclusive,
`20261108T050500Z_REVIEW_RC8_REFERENCE_PRESERVATION`) and RC9 F3
(`20261109T011141Z_REVIEW_RC9_OWNER_HELD_FOLDS`). None of those measurements
attributes time to a specific scan in this area; the whole-log decode and fold
they found sit in `event_store.ts`, `project_read_ports.ts` and
`artifact_truth.ts`, outside the area.

---

## Entries

### E1. Retire or bind the F_H response and resume chain (5.1 capability carried in 5.0 source)
- Category: failed or superseded feature
- Evidence:
  - Product and requirements: native response admission and response-driven same-Run resumption are reserved for 5.1 (`PRODUCT.md:93-94`, `:373`, `:415`, `:1229` the "Human boundary" row); `interaction.respond` and its five variants are outside the closed 5.0 operation family (`requirements/README.md:92-96`, `REQ-P-PUBLIC-CONTRACTS.md:229-233`). The source agrees: `continuation.ts:1577-1578` "no 5.0 binding resumes F_H".
  - Prior register: TD-18 closure and FRAMED-RECOVERY-01 left "the absent F_H resume operation" to the owner (bind or retire); C-17 retired the carried-memory resume chain and left `hog/interaction_resume.ts` and `proposeInteractionResumeRoute` to C-18.
  - **Producer side, no Public binding** (grep over `code/src`). `fh_interaction_responded` is produced only by `prepareFhInteractionResponse` (`continuation.ts:1511`), reached only from `commitFhInteractionResponseAtExpectedPrefix` (no caller). The `interaction.respond` operation contract binds `namedExport: "INTERACTION_DEFINITION_BINDINGS"` from `./product` (`contracts/public-operations/interaction/respond/operation-contract.json`, generated from `public/binding/owner_contract_source_set.ts`); no such export exists in source. `continuation_abandoned` and the F_H use of `continuation_superseded` are produced only by `admitContinuationTerminal` (`continuation.ts:79`, no caller, no test). `projectHeldInteractionCCallOutcomeAtPrefix` (`:318-650`, 332 lines, no caller, no test) re-derives the CCall identity, locus, fibre, evidence and pending-result bodies that `c_call.ts` owns (clone pairs `c_call.ts:4887`/`continuation.ts:569`, `c_call.ts:4934`/`:616`). `prepareContinuationPublicOperation` (`:911`, candidate literal from `:994`) is a second hand-written `public_operation_admitted` builder beside `construction_continuation.ts:1015` `constructionContinuationOperationCandidate`.
  - **Reader side, kind never produced.** No source path admits `fh_interaction_resume_admitted` (grep for `kind: "fh_interaction_resume_admitted"`: none; `deriveFhResumeSuccessorInput*` derives the input but nothing writes the event). Readers in this area: `fh_resume_relation.ts` (whole file, 283 lines; consumers are only `continuation.ts` and `fh_continuation_projection.ts`); `fh_continuation_projection.ts` `exactPublicOperation` (`:112`, 31), `exactClosureContract` (`:302`, 57), `validateExactFhResumeOwnerRelationAtPrefix` (`:360`, 190), the response and resume branches of `projectFhContinuations` (`:575-701`), and the responded/resumed fact projection in `projectFhEffectfulPublicInvocationFacts` (`:818-1128`); `retry.ts` `projectExactInteractionResumeSuccessorAtPrefix` (`:1849`, 86) and the `fh_resume_success` arms (`:278-283`, `:2816`, `:5185`, `:5212`, `:5292`, `:5329`, `:5490`); `retry_progress.ts` `exactFhResumeCompletionWitness` (`:566`, 38) and arms at `:84`, `:91`, `:187`, `:478-521`, `:600`, `:849-870`; `retry_lifecycle.ts:33`; `c_call.ts:2601`, `:4351`, `:6439` (cursor-origin disjuncts); `c_call_outcome.ts:1802-1818` (the `interaction` closure arm).
  - Recorded history: the RC6 whole-log census found `fh_interaction_opened`, `fh_interaction_responded`, `fh_interaction_resume_admitted` and `continuation_abandoned` never admitted in 17.9 h (RC6 review, line 215). `test_env/fixtures`, `falsifiers`, `support` hold no such rows (grep). The two test mentions of `fh_interaction_resume_admitted` (`generic-input-retention.test.mjs:49`, `t287-undispatched-diagnostic.test.mjs:176`) build the event by hand. I did not scan the campaign logs under `.ai-workspace/work/`.
  - Cross-area readers (not in my files, for the Executive to join): `traversal_route.ts` (`interaction_resume` evidence class `:477-483`, `:2436-2438`, `:2887`, `:3550-3639`, `isDeclaredInteractionResumeTarget` `:4031`, `:4394-4434`), `traversal_transition.ts:106`, `traversal_cursor.ts` (`:190-221`, `:297`, `:430`, `:481-521`, `:586`, `:688` `isInteractionResumeCursorSuccessorAtPrefix`), `closure.ts:209/244`, `replay.ts:1640/1674/1877`, `runtime_failure.ts:250`, `project_read_ports.ts:1703`, `runtime_history.ts:719-723` (selector keys), `abg/calculus/axioms.ts:324/1325`, `event_store.ts:101-105` (admitted kind list), `qualification_proof.ts:525/644`, `effectful_invocation_truth.ts:199`, `shared/capability_contracts.ts:87`, `product/interaction_operation_contracts.ts`, `hog/interaction_resume.ts`.
  - **Stays:** the hold. `admitOwnedFhInteractionHold` (`continuation.ts:1369`, called from `hog/interaction_lifecycle.ts:160`), `admitFhInteractionOpen` (`:1115`), their types, and the `fh_interaction_opened` reader in `fh_continuation_projection.ts` are live 5.0 behaviour (typed hold and blocked handoff).
- Retire: if the owner retires: in this area, about 1,150 lines of `continuation.ts` (every declaration in the first Check 1 row), all of `fh_resume_relation.ts`, about 550 lines of `fh_continuation_projection.ts` (the response and resume validation, leaving opened-hold projection and an empty-or-refusing fact set for F_H), the `fh_resume_success` completion class across `retry.ts`, `retry_progress.ts` and `retry_lifecycle.ts` (about 250 lines), the three cursor-origin disjuncts in `c_call.ts`, and the `interaction` closure arm in `c_call_outcome.ts`. Owner for what remains: `continuation.ts` holds only the hold transaction; `fh_continuation_projection.ts` projects open/blocked holds. If the owner binds instead: the dangling `INTERACTION_DEFINITION_BINDINGS` export is the first missing piece, and the binding must go through `constructionContinuationOperationCandidate`, not the second builder.
- Size: L. About 2,000 lines in this area; more across `traversal_route.ts`, `traversal_cursor.ts`, `closure.ts`, the calculus axioms, the selector keys, the event kind list and the Public contract rows.
- Risk: Public contract and manifest or digest pins. Retiring removes the `interaction.respond` operation contract and five definition keys from the published catalog and capability graph (`capability_contracts.ts:87`), and moves the 48 manifest rows that carry these files. Removing reader branches from replay is safe for recorded Runs only if no recorded Run contains these kinds; RC6 says none in that campaign, but the owner should confirm across admitted campaign logs before replay readers lose the arms.
- Change class: realization_refactor (the requirements already exclude the operation from 5.0). If the owner instead treats the published contract row as a retained 5.1 reservation, retiring it is a requirement_reprice of `REQ-P-PUBLIC-CONTRACTS`.
- Confidence: verified for "no producer, no binding" (grep); likely for the line counts (spans read, branches not each read in full); investigate for recorded campaign logs (a kind census over the admitted campaign logs settles it).

### E2. Name the six spelled-out return types in `construction_continuation.ts`
- Category: structure (with a second owner of the `GraphFunction` schema)
- Evidence (read in full for the signatures):
  - `prepareConstructionIntentContinuation`: three overload signatures, each with the full inferred return type, lines 377-563, 565-751, 752-938 (562 lines); body 939-1003 (65 lines). The `childFunction` field expands the `GraphFunction` contract type field by field, including all eleven `relationKind` application variants (the six `readonly relationKind: "gate"` sites at 475, 663, 850, 1169, 1376, 1582 are this expansion).
  - `prepareConstructionContinuationOperation`: three signatures, 1055-1260, 1262-1467, 1468-1673 (619 lines), each embedding another copy of the 186-line prepared type; body 1674-1695.
  - `selectPendingActionUse` 1872-1986 (three copies of a 38-line type that re-spells `SelectedActionUseRequest` from `:1860`), `prepareSelectedActionContinuation` 2034-2148 (three copies of 37 lines), `projectSelectedActionOperation` 2208-2232 and `projectPendingExecutionOperation` 2357-2381 (three copies each of the `EffectfulPublicInvocationPriorAdmission` shape, `effectful_invocation_truth.ts:37`, which `fh_continuation_projection.ts:80` `FhEffectfulPublicInvocationFact` also restates).
  - Origin: `git log -S` puts the expansion in `67c333799` (2026-10-21), the change that added the `@internal` `RuntimeEventPrefix` overloads. Overloads need explicit return types, and the inferred types were pasted in.
  - The clone census figure (22,580 normalized lines for this file paired with itself) counts overlapping pairs of copies, not distinct duplicated text; the distinct duplicated text is these spans.
  - The same file already shows the right pattern: `PendingExecutionUse`, `PendingExecutionUseRequest`, `PendingExecutionUseRefusal` (`:2266-2272`) are named once.
- Retire: declare `PreparedConstructionIntentContinuation` as a named type with `childFunction: Readonly<GraphFunction>` (`gtl/contracts.ts:98`), and likewise `PreparedConstructionContinuationOperation`, `SelectedActionUse` and `PreparedSelectedActionContinuation`; make the two operation projectors return `EffectfulPublicInvocationPriorAdmission | null`. The `NonNullable<ReturnType<…>>` and `Extract<ReturnType<…>>` aliases at `:1004`, `:1696`, `:2172` and the parameter type at `:2035` become the named types. The frozen expansion is a second copy of the `GraphFunction` schema that does not follow a schema change (a new optional field would be silently accepted, a new required field would only surface at the implementation's return).
- Size: S. About 1,330 lines removed (1,461 signature lines become about 130); no body changes.
- Risk: manifest or digest pins. Emitted `.d.ts` text changes for a package-exported module, and the new named types become new declarations in the packed declaration closure; runtime JavaScript is unchanged; no event bytes change. The `stripInternal` failure that stopped C-15b's retyping does not apply to the two reused types: `GraphFunction` (`gtl/contracts.ts:98`) and `EffectfulPublicInvocationPriorAdmission` (`effectful_invocation_truth.ts:37`) are exported and carry no `@internal` marker (read).
- Change class: realization_refactor
- Confidence: likely. Spans read and the reused types checked for `@internal`; whether `Readonly<GraphFunction>` is the same type as the pasted expansion is settled only by a build and a `.d.ts` diff, which I did not run.

### E3. Replace body view scans that need only envelopes or an existing selector
- Category: performance (structural)
- Evidence (read; no counter run). Each scan visits every row of the prefix it is given and acquires each row's body (Labels). Since C-10 a warm generation serves kept bodies from cache, so the warm cost is O(rows) lookups and envelope checks per call; a cold process decodes every visited body, and un-held `basis_admitted` bodies (multi-MiB raw inputs, RC6 F3) are re-decoded on every scan because they are not cached without a hold.
  - `c_call.ts:2071` in `projectAdmittedActorTransportLifecycle` (`:1868`, 311 lines): `events.filter(e => e.aggregateId === ref || e.parentAggregateId === ref)`. That set is exactly the `related:` selector (`runtime_history.ts:673`, `:731`). Reached from `projectAdmittedTransportEvidenceLifecycle` (`:1820`), `projectAdmittedActorTransport` (`:1845`) and `projectAdmittedProbabilisticTransport` (`:2179`), the F_P transport path every native actor call takes. Scales with the prefix given (Run prefix from the call owner).
  - `child_lifecycle.ts:83`: `events.slice().reverse().find(route…)` copies and walks the whole prefix on every child foldback (`c_call.ts:4215`, `hog/recursion_lifecycle.ts:813`). Then `retry_lifecycle.ts:99` (completed bridge, and the stopped bridge at `:244`) builds `new Map(events.map(e => [e.eventId, e]))` over the whole prefix for a causation walk whenever a child closed through a terminal route with retry bridges allowed (`c_call.ts:4224` passes `allowRetryBridges: true`). The `id:` selector (`runtimeEventAtPrefix`) answers each lookup. Scales with the parent Run prefix, per workflow child, recursion level or fan-out task return.
  - `retry.ts:1857-1858` `projectExactInteractionResumeSuccessorAtPrefix`: `flatMap` over every body looking for `fh_interaction_resume_admitted`, a kind with a `kind:` index and no producer (E1). Reached from the retry frontier (`:2565`, for F_H pending phases) and from `planCompletedRetryProgressFromHistory` (`:5481`) whenever a direct CCall phase exists.
  - `c_call.ts:2468` `undispatchedResultRelation`: a whole-prefix `filter` to find the row before one ordinal; `validatedRuntimeEventPrefixBeforeEvent` (used for the same purpose in `construction_continuation.ts:169`) answers it. Only reached when undispatched evidence exists.
  - `fan_out_projection.ts:776` (`some` on an ordinal), `:1418`, `:1496`, `:1507` (three `uniqueEvent` scans in `hasExactPartialFanOutStopRouteBridge`), `retry_progress.ts:993` (`findIndex`): same pattern; I did not trace their selectors.
- Retire: each scan becomes the selector read it reimplements (`related:`, `id:`, `kind:`, `run:`), or `runtimeEventEnvelopesAtPrefix` where only envelope fields are tested. Owner of the rule "which rows relate to X" stays `runtime_history.ts` `runtimeHistorySelectorKeys`.
- Size: M (about eight sites in four owners, with a counter-first proof).
- Risk: none for recorded Runs if each selector returns the same rows in the same order (selectors are ordered by admission); prove by `bodyRows`/`bodyDecodes` counters and an equal-result differential, as C-10 and C-14 did.
- Change class: realization_refactor
- Confidence: likely. The scans and their predicates are read; their share of call time is not measured. A lane run with the `RuntimeHistory.work` counters before and after settles it.

### E4. One owner for the overload triple's parameters and for the CCall event envelope
- Category: structure (second owner inside one file)
- Evidence (clone census, then read):
  - The `c_call.ts` (505 normalized clone lines) and `retry.ts` (398) self-clones are mostly overload triples: 20 functions in `c_call.ts` and 10 in `retry.ts` repeat 9 to 13 parameter lines three times (examples: `admitResult` `c_call.ts:6916-6960`, `admitEvidence` `:6451-6500`, `planCCallRuntimeFailureClose` `:3186-3225`, `rehydrateWorkflowCCallAtPrefix` `:4419-4445`, `projectCurrentChildParentCCallAtPrefix` `:1168-1195`; `retry.ts:4851-4864`, `:4970-4987`, `:4023-4040`). The same 11-parameter bundle (store, prefix, executionBasis, graph, graphFunction, cursor, cCall, source, failureCandidate, failureValueKind, basis) recurs across `planCCallRuntimeFailureClose`, `planRetryRuntimeFailureTransition`, `admitPlannedRetryRuntimeFailureTransitionInActiveTransaction` and `admitRetryRuntimeFailureTransition`. Across the area 64 functions have three or more signatures; across `code/src` about 236 (grep for repeated `function NAME` declarations; approximate).
  - Fifteen hand-written CCall event envelopes in `c_call.ts` (`aggregateType: "c_call"` at `:3337`, `:3412`, `:3454`, `:4046`, `:5375`, `:5398`, `:6145`, `:6174`, `:6219`, `:6882`, `:7035`, `:7165`, `:7297`, `:7347`, `:7387`). The post-opening ones carry the same ten fixed or `cCall`-derived envelope fields (aggregate type and id, parent, workflow version, scope class, basis, Run, GraphFunction ref, graph call, frame; read at `:3334-3349`) and differ only in kind, causation, eventTime, correlation and payload. Ten `{ kind: "admitted_c_call_…", schemaVersion, disposition: "admitted", ref, digest, ...body, admissionEventRef }` literals follow them.
  - The opening guard of `openImplementationCCallLocus` and `openInteractionCCallLocus` is the same 23 lines (`c_call.ts:5465-5488` and `:5616-5639`), differing only in `isExecutableCLeaf` against `isInteractionCLeaf`.
  - `retry.ts:2129-2150` and `:2841-2860`: the frontier body's common fields are written twice in `deriveDeclaredCRetryFrontier`.
- Retire: (a) one `cCallEventCandidate(cCall, kind, causationEventRefs, basis, payload)` and one `admittedCCallRecord(kind, ref, digest, body, event)` owner in `c_call.ts`; (b) one shared opening-guard predicate for the two leaf openers; (c) for overload triples, a named parameter tuple or input object per function so each signature is written once and the triple differs only in the prefix type. (c) is codebase-wide; the Executive should decide it once, not per area.
- Size: M for (a) and (b) (about 250 lines in `c_call.ts`); L for (c) (about 650 lines in this area, more codebase-wide).
- Risk: manifest or digest pins for (c) (declaration text). (a) must not change event bytes; prove by byte-equal candidate transcription, as TD-15 did for its record writers.
- Change class: realization_refactor
- Confidence: verified for the repeated shapes (read); likely for the line estimates.

### E5. Decide the Public complete-output and store-reading wrappers
- Category: dead code (package-only)
- Evidence: the second Check 1 row. Each wrapper calls its `Owned` or `AtPrefix` owner and either materializes complete output through `completePublicOutcome` (`c_call_outcome.ts:1934`, described there as the "explicit legacy-output boundary") or `materializeRuntimeReplayGuard` (`deferred_application.ts:57`), or selects a fresh prefix from the store (`c_call.ts:4393`, `:4992`, `open_call.ts:406`). None has a runtime caller (census tier `package`, confirmed by grep). Tests reach `admitCCallResult` (3 files), `admitCCallJudgment`, `admitCCallRejection`, `rehydrateOpenedTraversalScope`, `projectDeferredApplicationAtPrefix` (2), `admitProbabilisticResultCandidate`, `projectExecutableRetryInput` (2) through the `./abg` barrel. `projectDeferredApplicationAtPrefix` additionally reads the whole durable prefix into an array and validates it twice (`selectValidatedRuntimeEventPrefix(snapshot)` at `:51` and `:52`), a cold double selection on a path no runtime uses.
- Retire: delete the wrappers and move the tests to the owners they wrap. `completePublicOutcome` itself stays (HoG lifecycles call it). The register already rules that "the barrel is not the Product contract" (C-15). C-15b's stop was different: retyping published fields to an `@internal` type failed the `stripInternal` declaration-closure build. Deleting a wrapper removes a declaration and does not reference an internal type, so that stop does not apply. None of the thirteen wrapper names appears under `T/contracts/` or anywhere in the register, including its retention section (grep).
- Size: M (about 120 lines of source plus test rewrites).
- Risk: manifest or digest pins: the `./abg` package export's declaration closure shrinks and the 48 rows carrying these files move; regenerable as in C-14.
- Change class: realization_refactor
- Confidence: likely. Settled by a build and the manifest's declaration-closure check after deletion, which I did not run.

### E6. Compiler-unused entries and the dead runtime-failure close predicate
- Category: dead code
- Evidence (`compiler-unused.json`, each read):
  - `c_call.ts:79` unused import `selectValidatedRuntimeEventPrefix`; `retry.ts:4` unused import `runtimeEventPrefixExtent`.
  - `c_call.ts:3173` `runtimeFailurePlanBody` and `:3512` `runtimeFailureCloseError`, both dead. Consequence the compiler cannot see: `isCCallRuntimeFailureCloseError` (`:3516`, runtime tier) tests for a message only `runtimeFailureCloseError` creates, so it never returns true, and its arm in the `retry.ts:5082` catch is dead. The `plan_mismatch` code (`:869`) has no producer for the same reason.
  - `c_call.ts:3911` unused parameter `request` (`probabilisticTransportEvidenceValue`), `:4146` unused `predecessorPrefix` (`admitWorkflowChildFoldbackUsing`), `retry.ts:5170` unused `predecessorPrefix` (`planCompletedRetryProgressFromHistory`).
  - `c_call_outcome.ts:1004` unused `priorDerivation` on `projectOwnedCCallOutcomeReceiptAtPrefix`, still threaded through the package wrapper `projectCCallOutcomeReceiptAtPrefix` (`:1955-1957`). Residue of C-15b, which retired `StageTraversalTransitionInput.priorDerivation`.
  - Also: `terminal_result_contracts.ts:82` `AbgHistoricalTerminalSelection` (dead type), `fan_out.ts:126` `vector_contract_mismatch` (unproduced code).
- Retire: delete all of the above, the `isCCallRuntimeFailureCloseError` predicate and its catch arm, and `plan_mismatch`.
- Size: S (about 40 lines).
- Risk: manifest or digest pins (`priorDerivation` is on an exported signature; `isCCallRuntimeFailureCloseError` is exported).
- Change class: realization_refactor
- Confidence: verified

### E7. Three small second owners
- Category: second owner
- Evidence and owner:
  - **Exact key set.** `shared/admit/record.ts:20` `hasExactKeys` owns "own enumerable keys equal this set". `c_call.ts:3665` `hasExactRecordFields` is `isRecord` plus the same algorithm; `retry_progress.ts:155` `exactPayloadKeys` is the same through `sameStrings`. The stricter descriptor-checking `hasExactDataFields` has six copies: `probabilistic_result.ts:136` in this area, and `witness_admission_operation.ts:282`, `project_read_ports.ts:208`, `validator/conformance_operation.ts:84`, `implementation/leaf_invocation_port.ts:178`, `implementation/leaf_execution_authority.ts:91` (cross-area). Owner: `shared/admit/record.ts`, with a data-descriptor variant beside `hasExactKeys`.
  - **Cursor origin input digest.** `traversal_cursor.ts` owns cursor origin (`traversalCursorAdmissionEventsAtPrefix` `:164-215`, `traversalCursorAdmissionDigest` `:217`). `c_call.ts:4350-4351` and `:6438-6439` restate which origin field carries the input digest (`inputDigest` against `successorInputDigest`), and `c_call.ts:2595-2605` restates the three-kind origin match. Owner: `traversal_cursor.ts`, adding `traversalCursorAdmissionInputDigest(event)`. Shrinks further if E1 retires the resume kind.
  - **F_H continuation identity.** The identity body hashed into `continuationRef` is written by `continuation.ts:1203-1218` (`admitFhInteractionOpen`) and rebuilt by `fh_continuation_projection.ts:188-205` (`exactOpenedBasis`). Owner: one `fhContinuationIdentity(...)` beside the writer. This is the live hold path.
- Retire: as stated per item.
- Size: S each (about 120 lines in total in the area).
- Risk: none (digests unchanged when the bodies are equal; prove by equal output).
- Change class: realization_refactor
- Confidence: verified

### E8. Move worksite C0 authentication out of the CCall outcome owner
- Category: structure (and performance, investigate)
- Evidence (read): `c_call_outcome.ts:138-500` (about 360 lines: `projectWorksiteBasisObservation`, `projectWorksiteSelectedOccurrence`, `projectWorksiteFailureBasis`, `worksiteSelectedOccurrenceDependencies`, the failure-evidence record, `projectWorksiteFailureResultRequest`, `worksiteFailureResultDependencies`, `worksiteEvidenceCandidate`) and `:1962` authenticate worksite C0 occurrences for `native_worksite_execution.ts:262/271` and for worksite branches inside `stageCCallResult` (`:1100-1129`: post-publication failure, file-parent results). The generic owner imports from six worksite modules (`:10-13`, `:26`, `:28`). Inside, `PAYLOAD_RECORD` (`:148-155`) re-hashes each selected payload against its `payloadDigest` (basis, opened, fibre, binding, invocation and implementation rows per occurrence), and `projectWorksiteSelectedOccurrence` hashes the raw request twice (`:180` in the nested observation check and `:284`) and compares the authority basis canonically (`:285`). RC6 F3 measured the worksite context at 14.7 MB per copy.
- Retire: move the C0 occurrence authentication to the worksite owner (`native_worksite_execution.ts` or a `worksite_c0` ABG module) and leave `stageCCallResult` a single call into it. Separately, if the store already verified `payloadDigest` when it decoded the row (RC6 F2 places that check in `decodeRuntimeHistoryDescriptor`), `PAYLOAD_RECORD`'s digest leg is a second hash of the same bytes.
- Size: M (about 400 lines moved; the hash change is S).
- Risk: none for the move. The hash change is a validation-strength question; it must not weaken the check (brief rule), so it needs the event-store owner to state what decode guarantees.
- Change class: realization_refactor (move); design_reframe if the digest leg is dropped in favour of a decode guarantee.
- Confidence: verified for the structure; investigate for the hash (settled by the event-store owner's decode contract and a counter on `sha256Canonical` calls per worksite call).

### E9. Admitted CCall result predicate hashes the value twice per check
- Category: performance (structural)
- Evidence (read): `c_call.ts:1580-1592` `isAdmittedCCallResult` computes `sha256Canonical(admittedResultBody(result))` (the body includes `value`) and then `sha256Canonical(result.value)`, so a result value is serialized and hashed twice per check. It runs in `projectAdmittedCCallResultFromPhase` (`:1495`), `projectCCallOutcomeReceiptFromTruth` (`c_call_outcome.ts:972`), `admitFhInteractionOpen` (`continuation.ts:1144`) and `product/result_assessment_operation.ts:419`. RC11's census put `c_call_result_admitted` at 68 rows and 310 MB (about 4.5 MB per value). RC8 F2 measured `admitOwnedCCallResult` at 199 ms inclusive in a 4 MiB call without attributing it further.
- Retire: the admitting owner records its admitted result objects by identity (the "references, not copies" rule the RC8/RC9 work applied elsewhere) and the predicate checks identity first, hashing only foreign objects. Both digest definitions stay as they are: `resultDigest` is the hash of the whole body including `value` and `valueDigest` (`admittedResultBody`, `c_call.ts:4679`), and it is a recorded digest, so the body digest must not be redefined over the value's digest. A smaller variant that also keeps them is to serialize `value` canonically once per check and reuse those bytes in both hashes, if the canonical writer can splice a pre-serialized fragment (not checked).
- Size: S
- Risk: none if the predicate's verdicts are unchanged; prove by a differential over owner-built and forged inputs.
- Change class: realization_refactor
- Confidence: likely (call counts per Public call not measured).

### E10. The F_H hold event copies facts the log already holds
- Category: performance (structural); design and specification
- Evidence (read): `fh_interaction_opened` (`continuation.ts:1222-1299`) carries `inputValue` (the full held input), `openedTraversalScope`, `heldCursor`, `cCall`, `pendingResult`, `pendingJudgment` and the product install coordinates, all present in earlier rows. `exactOpenedBasis` (`fh_continuation_projection.ts:144-287`) re-verifies each copy against its source on every `projectFhContinuations` call, including `sha256Canonical(openedPayload.inputValue)` (`:252`) and a full `projectPendingInteractionCarrier` (`:165`). `projectFhEffectfulPublicInvocationFacts` runs for every effectful Public invocation (`effectful_invocation_truth.ts:199`) and, for each F_H continuation in the prefix, takes a prefix through its boundary, re-scopes it to the hold's Run, folds the held fluents over that Run prefix (`deriveRuntimeHeldFluentProjection`) and projects the continuations (`fh_continuation_projection.ts:854-905`). The response and resume rows themselves are selected through the `kind:` index (`:842-845`); the per-hold work runs whether or not any exist. Cost scales with (F_H holds in the store) × (Run prefix), per effectful Public invocation.
- Retire: the opened event carries references (row ids and digests) and the reader joins them, per the owner's "event log is the recovery source" rule. If E1 retires response/resume, the facts this function projects (responded and resumed continuations) are always empty, but the per-hold loop is also a history check: any throw inside it returns `invalid_history` (`fh_continuation_projection.ts:907-911`), so every effectful Public invocation currently re-validates every F_H hold. That validation must not be dropped; it needs one owner, at hold admission or at the hold's real consumer, after which the per-invocation pass can stop at the kind index.
- Size: L (event contract change for new Runs).
- Risk: replay digests of recorded Runs and the event contract: old `fh_interaction_opened` rows keep their shape, so the reader must accept both or the change waits for a contract version. The E1 half is free once E1 lands.
- Change class: design_reframe
- Confidence: likely for the structure; investigate for cost (no hold occurred in the RC6 campaign; the cost appears only once holds accumulate).

---

## Long functions (structure, no separate entry)

Over about 300 lines, outline-read only: `retry.ts` `deriveDeclaredCRetryFrontier` (`:1978`, 957 lines), `planCompletedRetryProgressFromHistory` (`:5154`, 519), `planRetryRuntimeFailureTransition` (`:4321`, 506), `projectExecutableRetryInputUsing` (`:3589`, 433); `c_call.ts` `admitEvidenceUsingTransport` (`:6508`, 407), `planCCallRuntimeFailureClose` (`:3186`, 324), `projectAdmittedActorTransportLifecycle` (`:1868`, 311), `projectOpenedLeafCCallCarrier` (`:2492`, 310); `open_call.ts` `openTraversalScope` (`:473`, 380); `retry_progress.ts` `projectRetryProgressAt` (`:605`, 371); `c_call_outcome.ts` `stageCCallResult` (`:1070`, 348); `probabilistic_result.ts` `admitResultCandidate` (`:334`, 338); `fan_out_projection.ts` `deriveCanonicalAdmission` (`:1086`, 272). The retry frontier and `stageCCallResult` block consolidation only through the branches E1 and E8 remove; I found no other blocking reason by outline. Retry itself is 5.0 scope (bounded retry under Local Consequence, `PRODUCT.md:1227`); RC6's observation that no retry event occurred in 17.9 h is a qualification gap, not a reason to retire.

## Cross-area leads (not in my files)

- `owner_bindings/run_invocation.ts:2215` `populateRunContinuationAtDurablePrefix` is `package` tier with 0 tests; it is the only caller of `projectPendingExecutionUseRequest` and of the `pending_execution` use path.
- `contracts/public-operations/interaction/respond/operation-contract.json` binds the nonexistent `INTERACTION_DEFINITION_BINDINGS` while the requirements exclude the operation from 5.0 (E1).
- `invocation_admission.ts:1652` and `witness_admission_operation.ts:682` build `public_operation_admitted` by hand; check them against `construction_continuation.ts:1015`.
- The overload triple (E4 c) is codebase-wide.
- Discarded `runtimeEventBodiesAtPrefix(prefix);` statements (for example `open_call.ts:169/228/287/336/866`, `c_call.ts:1220/2498/2875/3540/4813/6419`) are an assertion spelled as a view construction; cheap (the view is lazy, `event_prefix.ts:196-200`), not a performance cost. Noted only so nobody counts them as scans.

## Check 8. Coverage

| File | Lines | How read | Findings |
|---|---|---|---|
| `c_call.ts` | 7,445 | Outline (census declarations and long-function list) plus targeted reads of each site cited in E1, E3, E4, E6, E7 and E9; the long functions themselves outline only | E1, E3, E4, E6, E7, E9 |
| `c_call_outcome.ts` | 1,968 | Outline plus reads of the worksite block (`:136-500`), `stageCCallResult`'s worksite branches, `:1004`, and `:1780-1968` | E1, E5, E6, E8 |
| `retry.ts` | 5,816 | Outline plus targeted reads of the sites cited in E1, E3, E4, E5 and E6 (including `:1849-1935` in full); `deriveDeclaredCRetryFrontier` and the other long functions outline only | E1, E3, E4, E5, E6 |
| `retry_progress.ts` | 1,113 | Outline plus reads at `:155` and `:566`; resume arms located by grep, not read | E1, E3, E7 |
| `retry_lifecycle.ts` | 322 | Read `:70-130`, `:300-322`; `:244` located by grep | E1, E3 |
| `continuation.ts` | 1,697 | Full | E1, E5, E7, E10 |
| `construction_continuation.ts` | 2,480 | In depth: every signature span measured, bodies read, `:1004-1060`, `:1674-1700`, `:1860-1990`, `:2034-2240`, `:2264-2381` read | E2 |
| `fh_continuation_projection.ts` | 1,128 | Read `:1-287`, `:355-1000`; `:288-354` and `:1000-1128` outline only | E1, E7, E10 |
| `fh_resume_relation.ts` | 283 | Outline plus the `deriveFhResumeSuccessorInputAtPrefix` signature; consumers by grep | E1 |
| `fan_out_projection.ts` | 1,525 | Census and outline; scan sites located by grep, not traced | E3 |
| `fan_out.ts` | 340 | Outline; the refusal union read | E6 |
| `open_call.ts` | 887 | Outline plus the wrapper at `:406` and the re-scope at `:559`; `openTraversalScope` outline only | E5 |
| `child_lifecycle.ts` | 255 | Read `:20-195` | E3 |
| `deferred_application.ts` | 148 | Read the package wrapper (`:40-60`); rest outline | E5 |
| `probabilistic_result.ts` | 671 | Outline plus `hasExactDataFields` (`:136`) and the wrapper (`:303`) | E5, E7 |
| `terminal_result_contracts.ts` | 117 | Full | E6 |
