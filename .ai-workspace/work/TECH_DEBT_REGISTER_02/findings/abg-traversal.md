# Area findings: abg-traversal

Commentary, not law. Independent read-only reviewer (Claude Opus 5.5), 2026-11-12, `main` at `002035b8a`. Area: routes, admission, execution basis and graph applications, 16 files under `T/code/src/abg/` (T = `build_tenants/abiogenesis/typescript`). All line numbers are at `002035b8a`.

Labels used below:

- **One Surface**: the ConstructionComposition protocol. An evaluateNext `c_of` locus emits a `next_action_projection` (selected, no_action or converged). ABG admits a separate `construction_intent_selected` event. The selected action runs at the composition's one fixed action locus. evaluateAction emits `construction_delta_observed` with an edge fulfillment ledger and a closure decision.
- **Registered selection**: the GTL `registered_selection` application. A Product F_P result of kind `registered_graph_choice` names one of the source `c_workflow`'s outgoing edges; the rule is `gtl/registered_selection.ts` `resolveRegisteredSelection`.
- **F_H resume**: the event kind `fh_interaction_resume_admitted` and the route evidence class `interaction_resume`.
- **Legacy request family**: the `legacy_root_public` arm of `InvocationRequestBasis` (invocation_admission.ts:148-158), entered only through `admitInvocation` with a raw request payload.
- **Cold re-derivation**: a reader that recomputes, at read time, a relation that admission already checked and recorded on an event.
- **Complete mode / owned mode**: a `ValidatedRuntimeEventPrefix` built from a whole array (store and test path) versus the owned `RuntimeEventPrefix` held selection (product runtime path).

## What I checked and what I did not

Checked: the census rows for all 16 files (declarations, compiler-unused, kinds, clones); a full read of traversal_route.ts in chunks; targeted reads of invocation_admission.ts, execution_basis.ts, traversal_cursor.ts, graph_application.ts, environment_admission.ts, closure.ts, traversal_transition.ts; full reads of stdo_environment.ts, registered_selection_provenance.ts, runtime_derivation.ts; `grep` for every `none`-tier name across `code/src`, `contracts` and `scripts`; `grep` for producers of the F_H and One Surface event kinds across `code/src`; `grep` for admitted events (`"kind":"fh_interaction_resume_admitted"` and `"kind":"construction_intent_selected"`, plain and JSON-escaped) across all of `test_env` outside `node_modules`, including `test_runs` (results in AT-01 and AT-04); `git merge-base --is-ancestor` and `git log --full-history` for the Consensus retirement commits fb86974e3, f4aad7d5e, a61231c6a and for c2f1cfa3d. All four are ancestors of `main`; the three Consensus retirements were then reverted on `main` (AT-04). Cross-reads outside the area: hog/traversal.ts:435-530, hog/route_proposal.ts:737-800, gtl/registered_selection.ts, gtl/source_path.ts:817-828, shared/value/equality.ts, continuation.ts producers, O1_TRACE.md of rc12-executive-01, REQ-P-POLICY-012/013.

Not done: no tests, builds or runs; no profiling of my own, so every performance item is structural unless it cites RC8 or RC9 measurements. instruction_assembly.ts, default_library.ts, invocation_execution_truth.ts, effectful_invocation_truth.ts, requirement_handoff.ts were outlined only. I did not search archived Run logs outside `test_env`. Claims marked *inferred* were reasoned from code I did not read in full.

## Answers to the leads

1. **How many mechanisms choose the next step.** Two mechanisms carry a Product judgment that selects among declared alternatives: registered selection and One Surface. Two more decide only whether to re-enter: graph-span re-entry (a `re_enter` application bounded by `maxApplications`, choosing on a Product `graph_span_selection` value) and recursion termination. The `consequence` term of C.edge chooses nothing: C.edge is the fixed sequence transform, evaluate, consequence (gtl/source_path.ts:817-828, `edge_next`), so that part of the lead is refuted.
   - Registered selection owns: the domain (outgoing `c_workflow` edges), the selected edge, and the bound child input. Its provenance is the route payload (`registeredSelectionApplicationRef`, `boundInput`).
   - One Surface owns: an action catalog whose rows all target one fixed locus, the intent event, the delta and ledger, and the closure decision. Its provenance is a separate `construction_intent_selected` event.
   - Duplicated between them: "the judgment selects a member of a declared domain", "the child input is bound by digest", and provenance recording in two shapes. Duplicated within registered selection: the target is derived by HoG proposal (route_proposal.ts:769), ABG admission (traversal_route.ts:4271 and :3877), cursor ancestry (traversal_cursor.ts:552), read-time provenance (registered_selection_provenance.ts) and replay (replay.ts:770, :1187-1209).
   - One owner would hold: the pure target relations (continuation, retry, structural, registered, graph-span, recursion) in one GTL module, consumed by HoG, ABG admission, cursor ancestry and replay (entry AT-02), and the next-action basis reading in one function (AT-03). One Surface's intent, delta and closure stay supervision-specific; whether they stay at all depends on the owner's pending Consensus and Executive decision (AT-04).
2. **`gate` is never executed here.** Confirmed: no site in the 16 files names `gate`, not even in a type position. It appears in validator/validation.ts, owner_bindings/run_invocation.ts:390, construction_continuation.ts, gtl/graph_applications.ts:225, gtl/declaration_references.ts, gtl/serialization_contracts.ts. Whether gate is executed elsewhere belongs to those areas.
3. **`graph_function` start bypasses root mode.** Confirmed by reading; judged a likely defect, not dead policy. The supervised refusal at invocation_admission.ts:955-963 is live for program targets. The graph_function route is also live: `resolvedPublicStart` is skipped for a graph_function target (:1093-1126), product/execution_resolution.ts:561-575 skips `resolveProgramStart` the same way, and `publicStart` (:1293-1313) records `rootMode: exactRequest.rootMode` without comparing it to `program.policies["abg.root_mode"]`. A supervised Program's callable member can therefore be started directly, and the admitted record says `supervised` (the schema default) although no system program was selected. Entry AT-05.
4. **Kinds handled but never produced.** `invocation_reentry_basis` (invocation_admission.ts:161, :1402) is residue of the unfinished gap re-entry start, reachable only through the legacy request family (AT-06). The compiler-unused entries are one entry (AT-10). The `none`-tier declarations in stdo_environment.ts are the superseded STDO-only environment evidence, replaced by `run_environment_evidence` (AT-07). The rest are in check 3 below.
5. **What traversal_route.ts owns** (5,809 lines):
   - Route and evidence types (:141-583).
   - Historical route readers (:614-856).
   - One Surface carrier validators (:952-1492).
   - One Surface intent construction and no-action stop (:1494-2026).
   - Intent rehydration (:2028-2279).
   - One Surface delta (:2350-2787).
   - Governed closure (:2789-3002).
   - Structural advance (:3060-3152).
   - The per-class route evidence checks (:3153-4212).
   - Retained input (:4234-4331).
   - `admitRoute` (:4338-5180).
   - The transition wrappers (:5182-5809).

   Re-derivations: see AT-02 (graph-span and recursion targets re-implemented against HoG), AT-03 (the next-action basis read twice), AT-08 (the current cursor re-scanned from run events after the replay guard; four replay derivations per transition), and AT-15 (`isDeclaredStructuralTarget` at :3142 recomputes the cursor computed at :3114 and compares it with itself).
6. **Performance.** The RC6/RC7 whole-log passes were in project_read_ports and artifact_truth, outside this area. In this area the RC9 F3 remaining owners still exist at head: `hasAdmittedExecutionBasisAtPrefix` (execution_basis.ts:1424-1438, AT-09), the install rehydration hashes (environment_admission.ts:302, :709, :719, AT-16), and `admitInvocationWithRequest`, which I did not trace to a cause. Those are measured. Everything else is structural (AT-08, AT-11, AT-15).

## Named checks

1. **Dead declarations.**
   - Confirmed `none` tier: the STDO-only environment evidence (stdo_environment.ts:37, :69, :144, :151). `isStdoEnvironmentEvidence` has one source caller, product/stdo_environment.ts:186 inside `observeStdoEnvironment`, which is itself `none` (AT-07).
   - `observeWorkspaceEnvironmentWork` (environment_admission.ts:561) is refuted as dead. It is an observation-only counter for the §10.12 body-reuse proof, test t287-held-owner-fold-reuse. Its documented purpose makes it test instrumentation to keep.
   - `nativeInstructionRequestMatches` (instruction_assembly.ts:1214) has no source caller; its only use is test t287-d1-semantic-stage. Likely test support; investigate whether the test proves a runtime relation or only this function.
   - Package tier: store-based thin wrappers over the `…AtPrefix` owners plus the complete-mode variants. No name appears under `contracts/` (AT-12). One exception: `admitInvocation` is the `nativeTypedLocator` of `abg.contract.abg.invocation-root-admission` (scripts/generate-product-manifest.mjs:848), so it belongs with AT-06.
2. **Compiler-unused.** One entry, AT-10.
3. **Kinds handled but never produced, and produced but never read.**
   - `interaction_resume` and `fh_interaction_resume_admitted`: residue of the F_H resume feature after C-17 retired its producer (AT-01).
   - `invocation_reentry_basis`: unfinished gap re-entry (AT-06).
   - `graph_span_selection`, `continue_candidate`, `governed_correction`, `no_action`, `request_human_input`, `runtime_archive_inspection`: external input, meaning Product carrier values produced by Product functions or fixtures and read here. `request_human_input` is an external input whose only completion path is the dead F_H resume (AT-01).
   - `registered_selection_response` and `registered_selection_task` (instruction_assembly.ts:320-322): prompt descriptors (outline only; investigate).
   - Never read: descriptive prompt and metadata literals in instruction_assembly.ts and default_library.ts (not debt), and the outcome literals `frame_blocked`, `frame_failed`, `run_terminal`, `child_foldback_available` (graph_application.ts:537-666). Those literals are returned only by the package-tier `projectCurrentApplicationChild*` projections (AT-12).
4. **Second owners.**
   - Route-target relations in HoG and ABG (AT-02).
   - The next-action basis reader (AT-03).
   - Root versus child execution basis body: the clones execution_basis.ts:1633/:1668 and :2132/:2667 rebuild the closure-contract field spread in `admitExecutionBasis` and `admitChildExecutionBasisUsing` (AT-13).
   - Worksite and governance law held inside ABG (AT-14).
   - Clones I did not read past the census: graph_application.ts:578/:591, environment_admission.ts:1210/:1362 (install vs binding candidate check), c_call.ts:935 vs graph_application.ts:131, fh_resume_relation.ts:230 vs traversal_route.ts:2253.
5. **Failed, unfinished or superseded features.**
   - F_H resume (AT-01).
   - Gap re-entry start and the legacy request family (AT-06).
   - STDO-only environment evidence (AT-07).
   - One Surface, whose retirement was reverted on `main` pending the owner's Consensus decision (AT-04).
   - No milestone- or ticket-named modules in this area.
6. **Structure.** Only where it blocks consolidation:
   - `admitRoute` (traversal_route.ts:4338, 843 lines) dispatches eight evidence classes inline and owns the One Surface write batch. Splitting by evidence class falls out of AT-01, AT-02 and AT-04.
   - `admitInvocationWithRequest` (invocation_admission.ts:860, 872 lines) parses the start target three times, each with a legacy arm (AT-06).
   - `admitExecutionBasis` (665) and `admitChildExecutionBasisUsing` (493) share the basis body (AT-13).
   - `constructionDeltaForAdvance` (438), `admitOwnedScopeClosure` (closure.ts:349, 346), `admitRecursiveApplicationChildFoldback` (graph_application.ts:848, 327): read only where cited.
7. **Performance.** AT-08, AT-09, AT-11, AT-15, AT-16.
8. **Coverage.** Table at the end.

## Candidate entries

AT-nn numbers are local labels for cross-reference inside this file only.

### AT-01 Retire the F_H resume readers left after C-17
- Category: failed or superseded feature
- Evidence:
  - The producer is gone. Commit c2f1cfa3d (C-17, on `main`) retired it with the message "the fh_interaction_resume_admitted kind stays declared and read". `grep` of `code/src` finds producers for `fh_interaction_opened` and `fh_interaction_responded` (continuation.ts:1223, :1485, :1511) but none for `fh_interaction_resume_admitted`. HoG never produces evidence class `interaction_resume`; it does produce `hold` (hog/interaction_lifecycle.ts:152), which stays live.
  - No recorded Run holds the kind. A `grep` for an admitted event of this kind (plain and JSON-escaped `"kind":"fh_interaction_resume_admitted"`) found none anywhere in `test_env` outside `node_modules`, including `test_runs`. The bare name does appear in evidence/abi5-root-r1.json, evidence/abi5-root-r2.json and uat/runs/basic-cli/2026-10-06T00-44-53-198Z-…/abg-acquisition.json and calls/workspace-create.request.jsonl. Each of those hits is embedded event-calculus type text, not an admitted event.
  - Dead readers in the area, by read:
    - traversal_route.ts: the evidence type (:478); `hasInteractionResumeRouteEvidence` (:3543-3647, which also builds a full held-fluent projection for one row); the `interaction_resume` arm of `admitRoute` (:4394 and the terminal and advance arms that consume it); the resume arm of the current-cursor scan (:4426, :4434); the resume lookup and `interactionEvaluationBasis` in `constructionDeltaForAdvance` (:2435-2446, always null); the guard at :2887.
    - traversal_cursor.ts: :190, :209, :221, :297, :430, :481-490, :517, :586, and `isInteractionResumeCursorSuccessorAtPrefix` (:688).
    - traversal_transition.ts:106.
    - closure.ts: the `interaction` closure subject, which requires `resume: FhInteractionResumeAdmission` (:204-210, :282-292, :358-499).
  - Outside the area: the caller fh_continuation_projection.ts:541, plus c_call_outcome.ts:1803 and replay.ts.
  - REQ-P-POLICY-012 reserves native human interaction for 5.1.
- Retire: every reader above, the `interaction_resume` evidence class, and the interaction closure subject. Keep the event-kind declaration (event_store.ts:103) and its generated schema (contracts/schemas/native-runtime-observation.json:67, :3635, :4756) until an owner decides whether 5.1 reuses it. 5.1 re-authors resume from its own requirements.
- Size: L, about 600 lines across four area files plus three outside.
- Risk: replay digests of recorded Runs only if a Run outside `test_env` contains the kind; none in `test_env` does. Removing the declared kind itself would move a generated contract and the embedded type text in recorded evidence, which is why it stays.
- Change class: realization_refactor (the requirement already reserves the feature for 5.1).
- Confidence: verified for the missing producer, for the readers listed by read, and for `test_env`. Archived Run logs outside `test_env` were not searched.

### AT-02 One owner for route-target relations, consumed by HoG, ABG admission, cursor ancestry and replay
- Category: second owner
- Evidence:
  - HoG owns pure cursor derivations `deriveGraphSpanReentryCursor` and `deriveRecursionReentryCursor` (hog/traversal.ts:435-530, read). ABG re-implements them inline:
    - graph-span at traversal_route.ts:3987-4014 and traversal_cursor.ts:527-534;
    - recursion at traversal_route.ts:4100-4140 and traversal_cursor.ts:557-573. That second copy is commented "HoG's deriveRecursionReentryCursor relation, read cold".
  - The registered target is resolved by HoG (route_proposal.ts:769), ABG admission (traversal_route.ts:4271 retained input; :3874-3885 continuation check), cursor ancestry (traversal_cursor.ts:544-556) and replay (replay.ts:770, :1187-1209). That is five or more derivations per registered route.
  - Continuation, retry and structural targets already live in gtl/source_path.ts (`deriveCContinuationTarget`, `deriveCRetryTarget`, `deriveCStructuralTarget`).
  - `projectCursorAncestry` (traversal_cursor.ts:468-591) re-derives every route's target per kind and walks back to the initial cursor on each acquisition.
- Retire: move the graph-span and recursion target relations into gtl/source_path.ts beside the three that are there. HoG, `admitRoute`'s evidence checks, `projectCursorAncestry` and replay call that one function per kind. The inline copies in traversal_route.ts and traversal_cursor.ts go. Keep cold re-authentication by ancestry only if the retention rule for complete recorded witnesses requires it. In that case it calls the shared relation; it does not re-implement it.
- Size: M, about 150 lines moved and 120 deleted.
- Risk: none if the moved relations are byte-identical; a divergence between the copies today would surface as a replay difference, so the move needs one replay comparison over the proof logs.
- Change class: realization_refactor
- Confidence: verified for the duplicate sites by read. Likely that the copies agree: settle by a differential test of HoG against ABG on the recursion and graph-span fixtures.

### AT-03 One next-action basis reader in One Surface
- Category: second owner
- Evidence:
  - `constructionIntentForAdvance` (traversal_route.ts:1494-1766) and `noActionProjectionForStopRoute` (:1768-2026) repeat the same opening. Both resolve the source term, composition and evaluateNext authority. Both find the basis event by `payload:resultRef:` and re-validate the basis hash. Both check snapshot, workspace, catalog and policy against the execution basis.
  - The census confirms the repetition as clone pairs :1539/:1809 (30 lines), :1506/:1778 and :1645/:1932 (13 each).
  - `rehydrateConstructionIntentForCursorAtPrefix` (:2048-2144) re-derives the intent from the event on every use. It has five consumer files.
  - Type and spread clones: `AdmittedRoute` vs `HistoricalTraversalRouteProjection` (:182/:533), and the projection spreads (:685/:806, :707/:838).
- Retire: one `nextActionBasisAt(prefix, sourceCursor, executionBasis)` that returns the authenticated basis event, composition and authority, or a refusal. The intent builder and the no-action stop consume it. Derive `HistoricalTraversalRouteProjection` from `AdmittedRoute` with one shared spread.
- Size: S, about 120 lines removed.
- Risk: none; the intent and stop event bytes are unchanged.
- Change class: realization_refactor
- Confidence: verified by read and the clone census. Moot if AT-04 retires One Surface.

### AT-04 Decide One Surface's ABG carriers together with the pending Consensus Product decision
- Category: design and specification
- Evidence:
  - One Surface occupies traversal_route.ts:952-3002 plus the write batch at :5035-5143, about 2,100 lines, with consumers in closure, cursor and replay.
  - The code is grounded today. REQ-P-CONSENSUS.md:163-244 and REQ-P-POLICY.md:70, :177-179, :317, :429 name One Surface, `evaluateNext` and `ConstructionIntent`. contracts/schemas/consensus.schema.json is published, and contracts/schemas/native-runtime-observation.json lists the One Surface event kinds.
  - The retirement was made and then reverted on `main`. Commits fb86974e3 (code), f4aad7d5e (Product, requirements and design) and a61231c6a (Intent) were reverted by b0327828e, 10cb10e89 and d4ffd8923. The message of b0327828e reads: "RC12 keeps standalone Consensus as the base had it; the retirement stays prepared on branch claude/rc12-consensus for the owner's Product decision." Both `claude/rc12-consensus` and `claude/rc12-consensus-backout` exist.
  - Commit 46dea15df ("RC13 package O1 trace: re-home the system program onto the Executive") records the next direction. Its O1_TRACE.md says `program://abg/system/consensus-one-surface@5` (gtl/consensus.ts:79) is the only shipped supervised Program with a start, and that no test starts it at runtime. The RC6/RC7 live-log census found `construction_intent_selected` and `construction_delta_observed` never admitted.
  - The only recorded One Surface events in `test_env` are test outputs: `construction_intent_selected` in test_runs/rp2/selected-action/* and test_runs/rp2/correction-carriers/*. Tests that exercise it: t287-exact-construction-intent, t287-selected-action, t287-selected-action-authority, t287-rp2-correction-carriers, t287-continuation-causation, t287-route-reconstruction, m5-event-calculus-runtime, and the gated support/t287-s03-automatic.mjs.
- Retire: nothing until the owner decides. If the decision retires Consensus and One Surface (re-applying the branch `claude/rc12-consensus`), the ABG half must go in the same change: carriers, intent, delta, governed closure, write batch, and the evaluateNext/evaluateAction validator branches. The prepared retirement removed gtl/consensus.ts but no ABG file: fb86974e3 changes 81 files, none under `src/abg/`, and `git diff main...claude/rc12-consensus -- code/src/abg/` is empty. As prepared, it would leave about 2,100 lines of ungrounded ABG code. If the Executive keeps One Surface as its selection protocol, keep it and apply AT-03.
- Size: L, about 2,100 lines in the area plus validator, gtl/consensus.ts and tests.
- Risk: Public contract and manifest or digest pins (consensus.schema.json and the event kinds in native-runtime-observation.json are published). The rp2 test-run logs become unreplayable, but they are test outputs regenerated by tests that would retire with the feature.
- Change class: product_reprice
- Confidence: investigate. The owner's Product decision on Consensus and the Executive settles it. Verified: the reverts, the specification grounding, and that the prepared retirement leaves the ABG carriers in place.

### AT-05 Record the root mode that applies to a graph_function start, or refuse it under a supervised Program
- Category: design and specification
- Evidence:
  - invocation_admission.ts:955-963 refuses `direct` against a supervised Program; product invocation.ts:1138-1146 repeats that refusal.
  - For a `graph_function` start target, :1093-1126 skips `resolvedPublicStart` (`!("graphFunctionHandle" in exactStartTarget)`), and product/execution_resolution.ts:561-575 skips `resolveProgramStart`.
  - :1293-1313 then builds `publicStart` with `target: graph_function:<handle>` and `rootMode: exactRequest.rootMode`, never compared with `program.policies["abg.root_mode"]`.
  - REQ-P-POLICY-013: supervised selects the admitted system program, direct selects one entry traversal. No HoG file reads root mode.
  - The O1 trace names this Q2/R8 and leaves it to the owner.
- Retire: either refuse a graph_function start against a supervised Program unless `rootMode` is `direct` and the policy permits direct starts, or record `rootMode: "direct"` for every graph_function start. Either way the recorded value matches what ran.
- Size: S, about 20 lines plus one test.
- Risk: Public contract. A graph_function start that is admitted today could be refused, and the recorded `rootMode` of future graph_function invocations changes. Recorded Runs are not rewritten.
- Change class: realization_refactor if the requirement already forbids it; requirement_reprice if the owner wants graph_function starts to be a sanctioned direct route.
- Confidence: likely defect. Settle with the owner's R8 ruling and one run of a supervised fixture started by graph_function handle.

### AT-06 Retire the legacy request family and the unfinished gap re-entry start
- Category: failed or superseded feature
- Evidence:
  - `InvocationRequestBasis` (invocation_admission.ts:148-158) carries a `legacy_root_public` arm with a raw request.
  - `InvocationReentryBasis` (:160-178, kind `invocation_reentry_basis`) is never constructed in source or tests; tests pass `reentryBasis: null`.
  - The re-entry branch (:1354-1458) needs `suppliedReentryAuthority`, which comes only from the legacy `requestPayload.reentryAuthority` (:1047-1050). `priorGap` is read only there. The branch runs a full replay status, a route projection and a scan of all `invocation_admitted` events.
  - The start target is parsed three times (`exactStartTarget`, `resolvedPublicStart`, `publicStart`), each with a legacy arm.
  - `admitInvocation` (:1733) is package tier. It is used by tests r5-invocation-admission, t287-post-binding-worksite-write, m5-event-store-reopen and support/root-installed-environment, and it is the manifest locator at scripts/generate-product-manifest.mjs:848. `admitExactInvocation` (:1751) is the runtime path.
  - This is residue of the 4.6-style gap re-entry start (PRODUCT.md:460-475 describes start, iterate and root control).
- Retire: the legacy arm, `InvocationReentryBasis`, the re-entry branch, `priorGap`, and the legacy arms of the three target parses (parse once). Point the manifest locator at `admitExactInvocation`. Migrate the four test files to exact public definitions.
- Size: M, about 250 lines in the area plus four tests and one manifest row.
- Risk: manifest or digest pins (the contract's `nativeTypedLocator` moves); the Public contract is unchanged if the exact definitions already cover these tests' requests.
- Change class: realization_refactor
- Confidence: likely. Settle by checking that no Public definition binding resolves to the legacy arm (the census says none does) and that the four tests have exact-definition equivalents.

### AT-07 Retire the STDO-only environment evidence superseded by run environment evidence
- Category: dead code
- Evidence:
  - Census tier `none`, confirmed by `grep` across `code/src`, `contracts` and `scripts`: `StdoEnvironmentEvidence` (stdo_environment.ts:37), `isStdoEnvironmentEvidence` (:69-143), `stdoEvidenceMatchesInvocation` (:144-150), `projectStdoRoleEvidence` (:151-179).
  - The only source caller of `isStdoEnvironmentEvidence` is product/stdo_environment.ts:186 inside `observeStdoEnvironment` (:85, tier `none`).
  - gtl/stdo_run_environment.ts `stdoEnvironmentForProgram`, `validStdoEnvironmentPublication` and `validStdoEnvironmentProgram` are `none`.
  - No admission or replay reads an `invocation_admitted` payload field `stdoEnvironment`. The general `run_environment_evidence` path (:182-340) is runtime.
  - Tests: t287-stdo-environment-citation, t287-stdo-run-environment.
  - The other importers of abg/stdo_environment.ts take only run-environment names: invocation_admission.ts:107 (`runEnvironmentEvidenceMatchesInvocation`), event_store.ts:37 (`isRunEnvironmentEvidence`), actor_process.ts:11 and instruction_assembly.ts:31 (`projectRunEnvironmentRoleEvidenceAtPrefix`). replay.ts:2018 names a correspondence atom `"stdo_environment"` for the `invocation_run_environment` owner. That atom is a label and stays, because renaming it could move replay correspondence bytes (*inferred*, not traced).
- Retire: the four declarations, `observeStdoEnvironment` and its resource schema in product, and the three gtl `none` functions. Inline the `contexts` and `accesses` entries that `RUN_ENVIRONMENT_EVIDENCE_SCHEMA` borrows from `STDO_ENVIRONMENT_EVIDENCE_SCHEMA` (:187, :190), then delete the old schema. `exactStdoBytes`, `stdoRecordInventory` and `stdoSourceInventory` stay: they are runtime. Re-point or retire the two tests.
- Size: M, about 120 lines in the area and about 200 outside.
- Risk: none for replay (no reader). Qualification mirrors if a qualification record names the two tests.
- Change class: realization_refactor
- Confidence: verified for the source callers. Investigate whether the two tests prove anything the run-environment tests do not.

### AT-08 Stop re-deriving route state that the replay guard already folded
- Category: performance
- Evidence (structural, by read):
  - After the guard. `admitRoute` computes `projectRuntimeReplayGuard` at traversal_route.ts:4420 (a second time: the caller computed it at :5363; the second call is a cache hit in replay.ts). It then filters every `run:` event of the run by frame and reverse-scans for the current cursor (:4421-4439). That is O(events in the run) per admitted route.
  - Per transition. `admitTraversalTransitionInActiveTransaction` (:5323-5462) derives the predecessor guard, a replay-through-event `projectAdmittedRoute`, and a replay state of the staged prefix. `committedRouteTransition` (:5283-5297) then derives the replay again on the durable successor.
  - Per route. `projectHistoricalTraversalRoutesAtPrefix` (:727-753) runs one replay-through-event per route event. Its callers are retry.ts:2089 and :3720.
  - Per closure. `hasResolvedRunConstructionIntentLineage` (:2789-2844) runs `filter`, then `every` × `some`, over `runtimeEventBodiesAtPrefix`: O(intents × events).
  - Per registered advance. The registered branch of `deriveRetainedCCallInputAtPrefix` (:4234-4331) is not cached.
- Retire. The current-cursor comparison at :4440-4447 is a currentness gate and stays (register retention section); only its data source changes.
  - Read the current cursor per frame from the replay state the guard returns (*inferred* to be there, since the replay digest covers cursors).
  - Pass the guard into `admitRoute` instead of recomputing it.
  - Derive the staged and committed replay once and carry it.
  - Fold historical routes once per prefix instead of once per route.
  - Index intents by run in the closure check.
- Size: M, about 150 lines changed.
- Risk: none; no admitted bytes change.
- Change class: realization_refactor
- Confidence: likely. Settle with a profile of a 4 MiB recorded Run admission (the RC8/RC9 harness) and a read of the replay state shape in replay.ts.

### AT-09 Compare the branded execution basis by identity before serializing it
- Category: performance
- Evidence:
  - `hasAdmittedExecutionBasisAtPrefix` (execution_basis.ts:1424-1438) already returns false for an unbranded basis at :1428 (`isExecutionBasis` is a WeakSet check, :944, :1038). It then compares the owner's projection with the branded argument by `canonicalEquals`. That function omits an identity shortcut by design (shared/value/equality.ts:7-15), so a value compared with itself is serialized twice in full. Measured in the RC9 review, F3 owners at 4 MiB: 56 ms canonical JSON plus 56 ms compare.
  - `deriveOwnedNativeInstructionAssemblyBasis` (execution_basis.ts:172-224) re-runs `materializeGraph` and compares it with `canonicalEquals` on every native assembly. The exception is a basis built through `constructNativeInstructionAssemblyBasis`, which itself `admitJson`-copies the whole basis (structural).
- Retire: in `hasAdmittedExecutionBasisAtPrefix`, return true when `projected === basis`; otherwise compare canonically. The shortcut belongs at this caller, and the shared `canonicalEquals` owner stays unchanged. Cache the materialized graph on the branded basis so native assembly stops re-materializing. This follows the in-process references review (.ai-workspace/comments/claude/20261107T020000Z_REVIEW_RC7_TRANSPORT_CLONE/README.md, commit 92bbc6d85): owner-established objects pass by identity.
- Size: S, about 30 lines.
- Risk: none; equal values give the same answers and no bytes change.
- Change class: realization_refactor
- Confidence: verified for the code path. Measured for the comparison, structural for the native assembly. Whether callers pass the owner's own object, and so hit the shortcut, is *inferred*; settle with the RC9 profile rerun.

### AT-16 Stop re-hashing install rows the artifact truth owner already digested
- Category: performance
- Evidence:
  - `rehydrateProductInstallRowFromRows` (environment_admission.ts:284-319) re-hashes `row.artifact` (:302) to re-select the row it was handed. The comment at :288-289 says every caller already validated the projection and artifact truth established the row.
  - `hasAdmittedProductInstall` (:689-712) and `projectAdmittedProductInstall` (:714-736) hash the candidate per call.
  - `selectArtifactTruthRow` (:209-229) filters all rows per lookup. `deriveWorkspaceEnvironment` (:578-687) calls it once per causal install, so it scales with causal installs × rows; that call is cached per lineage territory.
  - Measured in RC9 F3: 83 ms for `hasAdmittedProductInstall` plus about 45 ms for the rehydration.
- Retire: compare `row.artifactDigest`, which the owner recorded, instead of re-hashing the artifact the row came from. Index rows by operation and scope once per projection.
- Size: S, about 30 lines.
- Risk: none; no admitted bytes change.
- Change class: realization_refactor
- Confidence: verified for the code path and measured for the cost. The claim that artifact truth already checks `artifactDigest` against `artifact` is the code comment's; settle by reading artifact_truth.ts row admission.

### AT-10 Compiler-unused locals and parameters in the area
- Category: dead code
- Evidence: the census compiler-unused rows, confirmed by read for the parameters:
  - environment_admission.ts:39 `ExactPrefixArtifactTruthProjectionResult` (unused import);
  - execution_basis.ts:127 and invocation_admission.ts:99 `selectValidatedRuntimeEventPrefix` (unused imports);
  - execution_basis.ts:687 `programModuleRef` and :688 `programRef`, unused parameters of `exactChildOwnerInstallations` (:680-727), carried by its callers.
- Retire: the imports, and the two parameters together with the arguments at the call sites.
- Size: S, about 10 lines.
- Risk: none.
- Change class: realization_refactor
- Confidence: verified.

### AT-11 Stop copying the whole event array per complete-mode append
- Category: performance
- Evidence (structural, by read):
  - `RuntimeDerivationSource.snapshot`, `append` and `prefix` (runtime_derivation.ts:41-58) copy the full array (`[...events, ...suffix]`, `slice`).
  - event_prefix.ts:286 and :333 call `append(events, [event])` one event at a time in complete mode, so building a validated prefix event by event is O(N²).
  - The `sharesRuntimeEventPrefix` fallback (:13, :61) is an O(N) element compare.
  - Scope owner Maps (:9, :39) have no bound. RC9 F1 found retained rows there; runtime_history.ts:384 now counts them (`observeBasisRetention`).
  - Owned mode (`selection.actualSuccessor`) does not take this path.
- Retire: let a snapshot proof share its source array plus a length, so `prefix` and `append` stop copying, or build complete-mode prefixes in one call from the whole array.
- Size: S, about 40 lines.
- Risk: none.
- Change class: realization_refactor
- Confidence: likely; it matters only where complete mode runs (store, tests, falsifiers). Settle by counting complete-mode builds in a product run.

### AT-12 Move store-based package wrappers that serve only tests into test support
- Category: test debt
- Evidence: the census `package` tier, with no name under `contracts/` (`grep`):
  - Never named by any test: graph_application.ts:331, :555 (the `projectCurrentApplicationChild*` projections that alone return `frame_blocked`, `frame_failed`, `run_terminal`, `child_foldback_available`, :537-666); traversal_route.ts:2028; traversal_cursor.ts:749; closure.ts:89; execution_basis.ts:1042, :1388.
  - Named by tests or falsifiers only: graph_application.ts:368, :405, :489; traversal_route.ts:5470, :5556, :5677; closure.ts:701; environment_admission.ts:321 (15 test files, including installed steel tests), :1131; execution_basis.ts:1191, :1304, :1346, :1440.
- Retire: delete the never-named ones. Move the rest behind a test-support barrel that selects the prefix and calls the `…AtPrefix` owner, so `./abg` exports only runtime owners. Keep any that installed tests import through the published package; moving those changes the package surface.
- Size: M, about 300 lines moved or deleted, plus test imports.
- Risk: Public contract only if `./abg` is a documented consumer surface (package.json exports it); no runtime bytes change.
- Change class: realization_refactor
- Confidence: likely. Settle by deciding whether `./abg` is a consumer contract or only a test entry.

### AT-13 One execution basis body builder for root and child admission
- Category: second owner
- Evidence:
  - `admitExecutionBasis` (execution_basis.ts:1531, 665 lines) and `admitChildExecutionBasisUsing` (:2263, 493 lines) each build the basis body: the closure-contract field spread, the subset digests, then `basisDigest` and `basisRef`. The census found clone pairs :2132/:2667 (14 lines) and :1633/:1668 (20 lines). I read :2128-2148.
- Retire: one `executionBasisBody(input, sets, resolution)` used by both. The root and child functions keep only their differing authority checks.
- Size: S, about 80 lines.
- Risk: replay digests of recorded Runs if the shared builder changes field order or content. It must reproduce the current bytes exactly; verify by recomputing `basisDigest` over the proof logs.
- Change class: realization_refactor
- Confidence: likely; verified for :2132 only. Read :1633-1690 and :2650-2700 to confirm.

### AT-14 Product worksite and governance law inside ABG admission
- Category: structure
- Evidence:
  - execution_basis.ts imports 13 product modules and holds worksite C1/C2/C3 law: `worksiteAuthorityCarrier` (:532-587), `exactC2SourceEnvironment` (:729-936), `hasExactWorksiteCommandLeafSourceAtDurablePrefix` (:961-1005), keyed on `WORKSITE_CONSTRUCTION_IDS`, `WORKSITE_BRANCH_CONSTRUCTION_IDS` and `WORKSITE_COMMAND_EXECUTION_IDS`.
  - invocation_admission.ts (eight product imports) branches on `GOVERNANCE_DIRECT_WRAPPERS` and `GOVERNANCE_FULFILLMENT_PROFILE` (:1498-1526), and calls `worksiteRevisionEntryBindingDisposition` and `worksiteCommandForwardEntryDisposition`.
  - traversal_route.ts imports product/worksite_preparation. instruction_assembly.ts and default_library.ts import about ten and eight product modules (outline).
  - The workspace ODD rule says ABG owns traversal and runtime facts and the product owns domain meaning.
- Retire: a Product-owned admission policy overlay (worksite and governance) that ABG calls through one declared port with the basis and the candidate. ABG keeps the authority check and the event write.
- Size: L, about 500 lines moved, plus a port contract.
- Risk: replay digests of recorded Runs if any check's refusal text or order changes. The move must keep refusal codes and messages byte-identical.
- Change class: design_reframe
- Confidence: investigate. Settle with a design note that names the port and lists every product-law branch now in ABG.

### AT-15 Drop the self-comparison in the declared structural advance projection
- Category: dead code
- Evidence (by read):
  - `projectDeclaredStructuralAdvanceAtPrefix` (traversal_route.ts:3077-3152) derives `targetCursor` with `declaredStructuralTargetCursor(authorityPrefix, graph, sourceCursor, "advance")` at :3114. It checks the recorded route against that cursor at :3127-3128 (`route.targetCursorRef`, `route.targetCursorDigest`).
  - At :3142 it then calls `isDeclaredStructuralTarget(authorityPrefix, graph, sourceCursor, targetCursor, "advance")`. That function (:3018-3030) calls `declaredStructuralTargetCursor` again with the same arguments and compares the result with `targetCursor`, the value it was itself derived from. The comparison is always true once :3121 has ruled out null, so no check is missing; the second derivation (`deriveAdmittedCStructuralTarget` plus cursor construction and hashing) is wasted.
  - The other callers (:3278, :4653) pass a target taken from a route or candidate, so they are real checks.
  - Also in this function and in `hasBlockedRouteEvidence`: `sha256Canonical(graphFunction)` at :3091 and :3369 hashes the whole GraphFunction per call (structural).
- Retire: the `isDeclaredStructuralTarget` call at :3142. Compare the GraphFunction digest through a digest cached on the materialized graph or the branded basis.
- Size: S, about 5 lines plus the digest cache.
- Risk: none; the result is unchanged for every input.
- Change class: realization_refactor
- Confidence: verified by read.

## Coverage

| File | Lines | How read | Findings |
|---|---|---|---|
| traversal_route.ts | 5,809 | full, in chunks | AT-01, AT-02, AT-03, AT-04, AT-08, AT-12, AT-15 |
| traversal_cursor.ts | 945 | :100-600 read; rest outline | AT-01, AT-02, AT-12 |
| traversal_transition.ts | 312 | :80-140 read; outline | AT-01 |
| graph_application.ts | 1,261 | :325-575 read; outline | AT-12; clone :578/:591 (census only) |
| invocation_admission.ts | 1,764 | :90-340 and :860-1764 read; rest outline | AT-05, AT-06, AT-10, AT-14 |
| invocation_execution_truth.ts | 715 | outline and census | none |
| effectful_invocation_truth.ts | 282 | outline and census | none |
| execution_basis.ts | 2,798 | :110-280, :520-1040, :1395-1470, :2128-2148 read; rest outline | AT-09, AT-10, AT-12, AT-13, AT-14 |
| environment_admission.ts | 1,396 | :185-340, :540-740 read; rest outline | AT-10, AT-12, AT-16; counter at :561 kept |
| closure.ts | 708 | grep; :196-300, :400-425 read; outline | AT-01, AT-12 |
| default_library.ts | 645 | outline and census | AT-14 (imports only) |
| registered_selection_provenance.ts | 90 | full | AT-02 (read-time re-authentication) |
| instruction_assembly.ts | 1,277 | outline and census | AT-14 (imports only); `nativeInstructionRequestMatches` investigate |
| runtime_derivation.ts | 132 | full | AT-11 |
| requirement_handoff.ts | 90 | outline and census | none |
| stdo_environment.ts | 340 | full | AT-07 |
