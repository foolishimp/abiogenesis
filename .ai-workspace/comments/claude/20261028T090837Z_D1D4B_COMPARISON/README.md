# D1/D4-b: the comparison at the cut

Commentary record of package D1/D4-b (T-287 Phase D). Base `9e5d1383f12d97e585e25fcfe39e403939508120`; tenant `code/`, `test_env/` and `contracts/` trees equal R3-c `bf7119489`. Digests, counts and paths only (TD-19). The return is in `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/phase_d.md` under `## D1/D4-b return`.

## 1. Completion condition of the library design §10 at the cut

| Row | Holds | Site | Carrier |
|---|---|---|---|
| §10.1 row 1 | holds | code/src/shared/refusal.ts:8-33; code/src/abg/exact_prefix_bindings.ts:98,154; code/src/shared/select/exact_match.ts (code/src/product/exact_match.ts absent); code/src/public/binding/ holds the five binding modules; none under code/src/shared/ | lint:imports (28 modules, 3 pairs hold); t287-common-computational-library 17/17/0/0 |
| §10.1 row 2 | holds | code/src/shared/admit/record.ts:6,20; code/src/shared/admit/json.ts:332; code/src/shared/admit/contract.ts:17,42; NUL-joined key-set bodies: 0 (35 files at 0b1187c40); safeParse in code/src/public/binding/: 0 (note: the remaining "\0" composite keys (product/catalog.ts:819, stdo_environment, gtl/stdo_run_environment.ts:71,203) predate the census (ad2a39f40, 785cfa9cc) and are not key-set bodies) | t287-common-computational-library 17/17/0/0 (D04, C-3, C-15 cases); forward-command-contracts 10/10/0/0 |
| §10.1 row 3 | holds | code/src/shared/value/equality.ts:16; code/src/shared/value/record.ts:22,46; sameCanonical*: 0 (12 at 0b1187c40) | t287-value-equality 5/5/0/0 |
| §10.1 row 4 | holds | code/src/shared/select/exact_match.ts:25,33,49,68; code/src/shared/select/exact_record.ts:45-54; local one(): 0 (12 at 0b1187c40) | t287-select-family 7/7/0/0 |
| §10.1 row 5 | holds | code/src/abg/calculus/fold.ts:113 (effectOf), :275 (foldStep), :287-293 (holdsAt); code/src/abg/calculus/rules.ts:200 (terminal_run_census, process_cleanup, liveness, actor_process_lifecycle); code/src/abg/event_calculus.ts:242 (advance applies only applyStep) | t287-calculus-fold 18/18/0/0; lint:calculus (6 modules, 0 offenders) |
| §10.1 row 6 | holds by reading; its physical-owner lane is red in this run (see stops) | code/src/shared/process/facts.ts:14,20,58; code/src/abg/replay.ts:2483-2485 reads terminationConfirmed through the fluent | t287-lifecycle-failure-carrier 5/5/0/0; lint:lifecycle (288 modules, 7 allow-listed, no offender); t287-owned-process-lifetime 18/16/2/0 under shared load, 18/16/2/0 alone (R3-c after column 18/18/0/0); t287-worksite-command-execution 10/4/0/0 (cancelled 6) under shared load, 10/4/0/0 (cancelled 6) alone (R3-c after column 10/10/0/0) |
| D0 | holds | no process-facts or failure file is written or read in the Source tree | t287-lifecycle-failure-carrier 5/5/0/0 |
| D1 | holds | code/src/abg/calculus/rules.ts:102 deriveLiveness over code/src/abg/calculus/liveness.ts | lint:calculus; t287-calculus-fold 18/18/0/0 |
| D2 | holds | code/src/shared/select/exact_record.ts:45-54 | t287-select-family D2 case |
| D3 | holds | canonicalEquals(left, right) only (code/src/shared/value/equality.ts:16) | t287-value-equality 5/5/0/0 |
| D4 | holds | code/src/shared/i_json.ts:112; validator/raw_admission.ts:184; product/worksite_command_execution.ts:1101,1104,2103,2156; abg/event_store.ts:1731,2593; abg/project_read_ports.ts:1642; implementation/worksite_command_execution.ts:166; no IJsonAdmissionError catch at those sites (the one catch, probabilistic_result.ts:512, is an admitIJsonText caller) | reading; tsc --noEmit 0 |
| D5 | holds | code/src/abg/calculus/rules.ts:192-197; code/src/abg/event_store.ts:1181-1183 isKnownRootEventContractDigest; code/src/abg/event_store.ts:3704-3705 reopen stamp check (note: design citations event_store.ts:1189 and :3608 have drifted) | t287-lifecycle-failure-carrier D5 case |
| O-TYPE | does not hold as recorded | 16 new casts since a692fb4b9 (TD-15 + TD-16): 23 there, 39 at the cut; C-14 57e39894e: abg/execution_basis.ts:1332,1374; abg/project_read_ports.ts:289; abg/worksite_revision.ts:421; C-18a a0829a298: abg/execution_basis.ts:1208,1285,1336,1378; product/declaration_exports.ts:527,529; M-5b 94e923d75: validator/qualification.ts:57; validator/qualification_catalogs.ts:67 (feeds sha256Canonical directly),86; R2-c 19700d8f7: abg/artifact_truth.ts:249,270; product/materialization_definition_bindings.ts:403; no (T), (I), (A) or keep-until decision for them in design §10.3 or the register (note: owner: the §10.3 O-TYPE owner with the introducing packages C-14, C-18a, M-5b, R2-c) | cast census at a692fb4b9 and at the cut (git blame) |
| O-RESOURCE | holds | no self-compare probe; code/src/product/project_read_definition_bindings.ts:128 admitJson | reading |
| O-SHAPE | holds | isJsonRecord: 0; code/src/abg/retry.ts:586 admitJson | reading |
| O-CODEC | holds | code/src/abg/event_body_encoding.ts:28,157 | reading |
| O-SCHEMA | holds | code/src/product/semantics.ts:512,530,620 | t287-common-computational-library O-SCHEMA cases |
| O-KEY | holds | code/src/product/default_library.ts:134 (register :133); code/src/abg/traversal_transition.ts:93-112; code/src/abg/artifact_truth.ts:213,415,427 | t287-common-computational-library D04 case |
| E04 | holds | no parser module added since c8d3f8ecd; the ustar reader dates from 29846fc36, before 0b1187c40 | git log |
| P-EQUAL | holds | code/src/abg/execution_basis.ts:724 exactC2SourceEnvironment, called at :982 and :1892 (note: design site citations have drifted) | t287-value-equality P-EQUAL and C2 cases |
| P-INGRESS | holds | no export of code/src/shared/value/ or code/src/shared/select/ takes unknown | tsc --noEmit 0; signature grep |
| P-KEYS | holds | code/src/shared/admit/record.ts | t287-common-computational-library D04 case |
| P-SELECT | holds | code/src/shared/select/exact_match.ts | t287-select-family two P-SELECT cases |
| P-RECORD (whole path) | holds | code/src/abg/calculus/execution_basis_record.ts:101 (design cites invocation_execution_truth.ts:671: drift) | t287-select-family three P-RECORD cases; reading |
| P-FOLD | holds | code/src/abg/calculus/fold.ts | t287-calculus-fold 18/18/0/0 including the streaming case |
| P-LIFECYCLE (whole path) | A, B and the worker negatives hold; the physical-owner lane is red in this run (see stops) | code/src/abg/calculus/rules.ts; code/src/shared/process/facts.ts | t287-calculus-fold counterexamples A and B; t287-lifecycle-failure-carrier 5/5/0/0; t287-owned-process-lifetime 18/16/2/0 under shared load, 18/16/2/0 alone |
| P-BIND | holds (3 of 5 cases ran) | code/src/shared/effect_definition.ts:95 the one Effect.run* site (register :102); code/src/public/binding/static_definition_bindings.ts:48,67 admitContract | t287-w2-05-static-binding-algebra 5/3/0/2 (two skips: ABI5_PREPARATION_RESOLVE_CALL unset) |
| P-LAYER | holds | - | lint:imports; lint:lifecycle |
| §10.6 row 5 U(B) | holds | code/src/abg/actor_process.ts:1361, the single emitter, via processTerminalEvent | reading |
| §10.7 | holds | constitution §16.14 lists every disposition; constitution §10 catalog row exact-match at shared/select/exact_match.ts (note: Table 5.6.3-B N05's location cell still names only shared/i_json.ts::admitIJsonValue) | reading |

## 2. The Source44 procedure rerun on the candidate

| Step | Continuation16 | Candidate |
|---|---|---|
| (a) build and Source/output correspondence | 264 Source / 528 outputs | 288 Source / 576 outputs (288 .js, 288 .d.ts), 0 missing, 0 extra |
| (b) pack | `sha256:192356a4…34b5`, 10,676,374 B | `sha256:f94e1a1dab24fc2567f5aeff31945516d405a3cc92ce3506615d60459d43c612`, 10,914,695 B; equal to the Executive's `pack.sha256`: True |
| (c) clean install, archive/installed bodies | 5,267 exact; two CLI modes | 5,317 exact; two CLI modes (`cli.js`, `codex_cli.js`, 0644 to 0755) |
| (d) `consumer.mts` under `tsc --strict` | passed | rc 0; closure 480 files |
| (e) Public setup outcomes | 12, all `result` | 10 of 10 current labels recorded: workspace-create result, product-verify-0 result, product-verify-1 result, product-resolve result, product-install-0 result, product-install-1 result, workspace-bind result, catalog-admit result, catalog-view result, program-conformance result |

## 3. Delta from Source44 to the candidate, by package

| Directory | Equal | Changed | Added | Removed |
|---|---|---|---|---|
| code/src | 48 | 208 | 32 | 8 |
| contracts | 166 | 21 | 9 | 7 |
| (postimage extra) | 0 | 2 | 0 | 0 |
| scripts | 6 | 2 | 4 | 0 |
| test_env/fixtures | 54 | 10 | 1 | 1 |
| test_env/uat | 2 | 5 | 2 | 0 |
| package.json | 0 | 1 | 0 | 0 |

313 non-equal paths; 0 without an owning commit.

| Package | Commits | Paths touched | Paths last changed | Evidence |
|---|---|---|---|---|
| checkpoint (no package) | 2e74fcd8c, 400d763d1, 67c333799, 727f1dbca | 134 | 15 | none of its own (no Return, no lanes); per-path coverage in checkpointOnly |
| T-287 library Step 2 | 69132360f | 43 | 8 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 3 | a2516dbdc | 78 | 7 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 4 | 5f4a1d4c9 | 130 | 5 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 5 | 10efed8b2 | 38 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 6 | c2432eb85 | 10 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 6 repair | 8eede7fdb | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 7 | ffb767171 | 12 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 7 repair | dddb05dfd | 3 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 8a | 37ef7d760 | 9 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 8a-2 | cac7802b2 | 5 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 8 repair | 562d4515a | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Step 8b | c8d3f8ecd | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair A | a1349e50b | 4 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair C | 99b80d6f5 | 195 | 43 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair B | d8cf6b5d9 | 8 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair D | 0eacd4668 | 10 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair E | 280f5777f | 6 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair F | 195b65ddb | 6 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-287 library Post-close repair H | 46ed04895 | 2 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-06 | 94ca67abf | 3 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-07 | ea18189e3 | 11 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-17 | 4bc5a945a | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-13 | 50301d557 | 13 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-14 | 8387f70b3 | 19 | 4 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-04 + TD-05 | bf117cf92 | 1 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-11 | 3c91f5200 | 1 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| Executive record | 7e2425376 | 1 | 0 | Executive record 7e2425376; its one path is also owned by later packages |
| T-290 TD-08 | f6bdf13bd | 2 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-15 + TD-16 | a692fb4b9 | 16 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 TD-23 | bc7135549 | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-1 | 2c9878c3b | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-2 | b8f66ef4b | 9 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-3 | 8566b228e | 11 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-4 | cc8e796a6 | 8 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-5 | afcb3be58 | 3 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-6 | 229b1e034 | 3 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-7 | 2acb06fcf | 3 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-8 | 8282938dc | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-9 | 695a63e94 | 2 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-10 | 457b5632a | 2 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-11 | 5caf0149d | 4 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-12 | c4f279a1e | 3 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-12b | 9bedf89db | 3 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-12c | 0ca045919 | 9 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-13 | 39aebe727 | 8 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-15 | ee7c49721 | 18 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-15b | 6071e6936 | 10 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-16 | cd6fc7e55 | 10 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-17 | c2f1cfa3d | 14 | 4 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-14 | 57e39894e | 12 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-291 M-4 | e9e74fb74 | 5 | 1 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-291 M-5 | 661294535 | 5 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-291 M-5b | 94e923d75 | 12 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-291 M-6 | ae84e2099 | 8 | 0 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-18a | a0829a298 | 127 | 98 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-18b | 811bb8f85 | 5 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-19 | d61cfd90f | 5 | 3 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| T-290 Phase C C-20 | acb5200a8 | 2 | 2 | its Return's lane column in its ticket record (not re-read here); its tree is carried by D1/D4-a's after column at 93119c1b2 (195 lanes 1,161/990/4/167, compose 2/2/0/0) and by item 1's carriers |
| Phase D D0 | 529ffa0f6 | 45 | 19 | D0 Return (not re-read); its tree is carried by D1/D4-a's after column at 93119c1b2 |
| Phase D D1/D4-a | 93119c1b2 | 4 | 2 | D1/D4-a disposition (phase_d.md 730-753): after column 195 lanes 1,161/990/4/167, compose 2/2/0/0 at 93119c1b2 |
| Phase D R2 | c01b63c4f | 1 | 1 | named only: its disposition is outside this read grant; its tree is carried by the sandbox runs on 19700d8f7 |
| Phase D R2-b | 6e7a5246d | 5 | 2 | named only: its disposition is outside this read grant; its tree is carried by the sandbox runs on 19700d8f7 |
| Phase D R2-c | 19700d8f7 | 7 | 4 | Sandbox UAT on 19700d8f7 (phase_d.md 1565-1582): basic-cli, js-tenant-test, js-sdlc-bootstrap passed; rust-cli failed |
| Phase D U1-b | 9ec6c22f1 | 3 | 0 | retest on 9ec6c22f1 (phase_d.md 1790-1808): rust-cli, rust-service, parallel-js passed; data-mapper-full refused |
| Phase D S1 | e71ae8a5c | 22 | 19 | S1 disposition (phase_d.md 2308-2319): 179 lanes; rust-cli passed on e71ae8a5c |
| Phase D R3 | 0f6258433 | 18 | 8 | R3 disposition (phase_d.md 2704-2725): 94 lanes + uat + compose 695/594/0/101; rust-cli passed on its pack (0f6258433) |
| Phase D R3-b | b78409e76 | 19 | 6 | R3-b disposition (phase_d.md 3091-3106): 608/516/0/92; rust-cli passed on its pack (b78409e76) |
| Phase D R3-c | bf7119489 | 20 | 20 | R3-c disposition (phase_d.md 3528-3543): 679/579/0/100; pack f94e1a1d…c612; rust-cli passed on bf7119489; item 2 here |

Checkpoint-only paths (finding F1):

| Path | Relation | Exercised by | Disposition |
|---|---|---|---|
| `code/src/shared/owned_process_lifetime.ts` | added | t287-owned-process-lifetime: 18/16/2/0 under shared load, 18/16/2/0 alone; R3-c after column 18/18/0/0 | finding F1; its carrier lane is red in this run |
| `code/src/shared/rooted_topology_partition.ts` | changed | t287-tv5-rooted-topology-partition in D1/D4-a's after column | finding F1, mitigated |
| `contracts/default-library/stdo/standards/ASSURANCE.md` | added | t287-default-library pins its digest and membership (S1 and later columns); packed in item 2(b) | finding F1, mitigated |
| `contracts/default-library/stdo/standards/STDO_REFERENCE_FRAME_BASELINE.md` | removed | absent from the candidate archive (item 2(c)); t287-default-library's member list excludes it | finding F1, mitigated |
| `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | changed | none: not packed; no release relation | finding F1; note: documentary |
| `test_env/fixtures/language-smoke/leaf.mjs` | changed | installed-language-smoke, a5-f02-canonical-gtl-identity, m5-installed-graph-edge, t287-gtl-graph-law in D1/D4-a's and R3-c's columns | finding F1, mitigated |
| `test_env/fixtures/language-structural/leaf.mjs` | changed | installed-language-smoke, a5-f02-canonical-gtl-identity, m5-installed-graph-edge, t287-gtl-graph-law in D1/D4-a's and R3-c's columns | finding F1, mitigated |
| `test_env/fixtures/sandbox-uat/data-mapper-full/request.json` | changed | data-mapper-full at 9ec6c22f1 (refused) | finding F1, mitigated; may carry Source44 dirty bytes |
| `test_env/fixtures/sandbox-uat/independent-oracle.mjs` | changed | the independent oracle of every sandbox run (satisfied in the ten passes) | finding F1, mitigated; may carry Source44 dirty bytes |
| `test_env/fixtures/sandbox-uat/scenarios.json` | changed | the sandbox runs and this prepare | finding F1, mitigated; may carry Source44 dirty bytes |
| `test_env/uat/README.md` | changed | none: documentary; not packed | finding F1; note: documentary; may carry Source44 dirty bytes |
| `test_env/uat/config.example.json` | changed | none: an example; not packed; the prepare config here follows its shape | finding F1; note; may carry Source44 dirty bytes |
| `test_env/uat/continuation.mjs` | added | none: uat-continuation 4/0/0/4 (all skipped); runner.mjs does not import it | finding F1 and F2: no evidence |
| `test_env/uat/public-setup.mjs` | changed | the sandbox runs and this prepare (item 2(e)) | finding F1, mitigated; may carry Source44 dirty bytes |
| `test_env/uat/runner.mjs` | changed | the sandbox runs and this prepare (item 2(e)) | finding F1, mitigated; may carry Source44 dirty bytes |

## 4. Authentic setup evidence

"The sandbox runs": the ten passing sandbox runs: 19700d8f7 (R2-c) basic-cli, js-tenant-test, js-sdlc-bootstrap; 9ec6c22f1 (U1-b) rust-cli, rust-service, parallel-js; e71ae8a5c (S1) rust-cli; and rust-cli on the packs of R3 (0f6258433), R3-b (b78409e76) and R3-c (bf7119489, archive f94e1a1d…c612).

| Claim | Continuation16 | Disposition | Evidence |
|---|---|---|---|
| C16-01 | ordinary build passed; all 264 Source and 528 outputs match cut 44 | renewed by | item 2(a): build rc 0; 288 Source, 576 outputs (288 .js, 288 .d.ts), none missing or extra |
| C16-02 | sole payload body delta versus Continuation15 is abg/native_work_reacquisition.js; graph and manifest derive freshly | historical, superseded by | item 2(a) and item 3: the candidate's payload is rebuilt from its own Source; its delta from Source44 is item 3 |
| C16-03 | actual content sha256:6fb24fc7…, archive sha256:192356a4…34b5, 10,676,374 B | renewed by | item 2(b): archive sha256:f94e1a1d…c612, 10,914,695 B, content sha256:ea974075…6a4d; equal to the Executive's pack.sha256 and the fixture's artifactDigest |
| C16-04 | direct pack, clean install and external strict TypeScript passed; 5,267 archive/installed bodies exact; two installed CLI modes differ | renewed by | item 2(b)-(d): 5,317 bodies exact; the same two CLI modes (0644 to 0755); consumer.mts rc 0 under --strict |
| C16-05 | 936 generated preimages have exact Continuation15 archive homes; no old tree copied | historical, superseded by | item 2(a) and 2(c): a fresh build and a clean install from the candidate archive |
| C16-06 | the unsupported product/… checker path preserved with its Root-selected abg/… correction | historical, superseded by | item 2(a): correspondence recomputed from the check-02 relation over the candidate's own tree |
| C16-07 | Original37 parent/native producer and whole Program 80475497… authenticated | historical, superseded by | the sandbox runs |
| C16-08 | the actual fresh44 pair | historical, superseded by | item 2(b): the candidate archive itself |
| C16-09 | 12 Public setup outcomes, all result | renewed by | item 2(e): the eight matched labels all result; workspace-create and program-conformance are new |
| C16-09w | witness-34, witness-37, witness-40, witness-43 outcomes | historical, superseded by | the sandbox runs, whose current Public setup (test_env/uat/public-setup.mjs) runs no witnesses |
| C16-10 | four target covers | historical, superseded by | the sandbox runs |
| C16-11 | current-use sha256:7805da0d… | historical, superseded by | the sandbox runs |
| C16-12 | normal preparation close | renewed by | item 2(e): the prepare seals its prepared Definition call |
| C16-13 | real post-close private callback | historical, superseded by | the sandbox runs |
| C16-14 | Helper07, workload and controlled local responder exact; driver 72547b2a… | historical, superseded by | the sandbox runs (provider-backed; no controlled responder) |
| C16-15 | latest native close lifecycle-start.close.json and the one bounded owned selected read | historical, superseded by | the sandbox runs; t287-worksite-command-execution's large-log case in R3-c's column (10/10/0/0; it timed out under load here) |
| C16-16 | candidate broken\n, three inputs exact, locks absent, both owned processes ESRCH | historical, superseded by | the sandbox runs |
| C16-17 | first native runtime_failed: transport-identity-mismatch@5 at ordinal 1235 | historical, superseded by | the sandbox runs: C2 completes in the passing runs |
| C16-18 | two closing documentary locator errors | historical, superseded by | this comparison's own record |
| C16-19 | readiness currentSetup identity (11 members) | renewed by item 2(e) and 2(d) for the installed root, workspace binding, resolved lock, catalog basis, catalog view and consumer; historical, superseded by the sandbox runs for the Program, sourceResultRef, sourceBasisRef, current-use and target covers |  |

Not claims: C2 red/repair/green, restart, full 26 Replay with nativeLiveness and raw comparisons, original capacity: stated unearned by Continuation16; neither Source44 nor this comparison earns them; helper samples max heap 2,493,101,816 B / RSS 2,961,801,216 B: stated not peaks or allocator attribution; Data Mapper: the original Data Mapper was untouched; data-mapper-full refused at 9ec6c22f1.

Sandbox summaries cited:

| Commit | Package | Case | Run | Status | summary.json |
|---|---|---|---|---|---|
| 19700d8f7 | R2-c | basic-cli | `2026-10-27T16-35-14-097Z-b2ea4165-3f1e-4bce-9cdb-4126a4b15ed6` | passed | `sha256:865c0b438fd53efbf3b362fe44804b22646db789b70b50d85ce4be37280233bd` |
| 19700d8f7 | R2-c | js-tenant-test | `2026-10-27T17-25-53-880Z-7e043ae1-55c5-40aa-8a4f-3aae165b89ad` | passed | `sha256:f99cae33d939ebe374d7d4aedd4431753abda56a58830e98028e5900302911d8` |
| 19700d8f7 | R2-c | js-sdlc-bootstrap | `2026-10-27T17-48-50-168Z-d88ea160-b9d7-410c-b79f-4d8249ad7389` | passed | `sha256:76e9677d4e646a0c72f45d6f91e5b3997d15ce248a0fb78cac2c3e2f6e5b4d0f` |
| 19700d8f7 | R2-c | rust-cli | `2026-10-27T18-03-55-623Z-d512c06e-e638-4c56-9744-063cbe6c41f7` | failed | `sha256:22d074594a6fcd475b3c5c638e1b1a8dd7660502c8434c80cdbc0c6ebc29ed6c` |
| 9ec6c22f1 | U1-b | rust-cli | `2026-10-27T20-44-45-190Z-7729355a-04e0-4a8b-8263-9ffde296b700` | passed | `sha256:d64565ed103d4218be2f25cb8d846206ba41e39d5d4cae046ac50b89b54ebba3` |
| 9ec6c22f1 | U1-b | rust-service | `2026-10-27T20-56-39-285Z-3525ca50-e91b-4935-b56b-992bff388712` | passed | `sha256:6570e6196971eb86f66a86ee835bd12d5f03756a95791223cc58d3c3257d12a5` |
| 9ec6c22f1 | U1-b | parallel-js | `2026-10-27T21-14-33-151Z-8ccb7ab8-444d-4cf1-881a-eadda14bd882` | passed | `sha256:d549cb7f8619119819c791d91885f698e36ce5a9569633722c7dd0e30671c3cc` |
| 9ec6c22f1 | U1-b | data-mapper-full | `2026-10-27T21-27-01-448Z-6fd35515-3d34-44f6-90ba-d29928ae8a0f` | refused | `sha256:261e27cb2fa3be0ec8b3a5ff1c9acdd7040685a4fe0083793894853757058a72` |
| e71ae8a5c | S1 | rust-cli | `2026-10-28T00-13-33-189Z-45f34950-d191-4907-92ea-ebc0aaabdc94` | passed | `sha256:82a41b8a557ca6ad529df03424b76dc019bd7a7bafb0ec3337f5b0aead50592d` |
| 0f6258433 | R3 | rust-cli | `2026-10-28T02-21-12-772Z-1af8655f-4b54-48a8-81bb-afa58e42c5e7` | passed | `sha256:545081a32656d6042830da39e86e502a8a48b2732528c9a74db55c209645a3bd` |
| b78409e76 | R3-b | rust-cli | `2026-10-28T04-22-26-284Z-9f03bb85-253e-449e-818d-226adb486947` | passed | `sha256:e5704638806d98a7d5a9ed9b4306264406ad1e6286b1c84da83996a1fd4fb64c` |
| bf7119489 | R3-c | rust-cli | `2026-10-28T06-37-24-748Z-9e0891e5-e0c2-4db6-917b-dc2e0e5712b4` | passed | `sha256:56c4500ea378ba46d27fb7604fcf3ed69791a4f17f1daf8fc4a64894c4889106` |
