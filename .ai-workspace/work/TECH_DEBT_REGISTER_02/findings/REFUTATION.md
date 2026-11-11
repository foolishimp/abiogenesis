# Refutation pass over the strongest register claims

Commentary, not law. Independent adversarial review for the Executive, 2026-11-12, by Claude Opus 5.5.

**Same model family.** I share a model family with the area reviewers and the Executive. Blind spots common to that family may survive this pass. A different-family reader would be a stronger check.

## Basis and method

**Commits.**
- Reviewed on `main`. The base was `002035b8a`; HEAD moved to `59fbaf8a0` during the pass.
- `git diff --stat 002035b8a 59fbaf8a0` shows one line added to `rc12-executive-01/LEDGER.md`. Source, tests, scripts, contracts, design and specification are unchanged.
- T stands for `build_tenants/abiogenesis/typescript`.

**What I ran.** Small Node snippets that import `T/build`:
- the module publication constructors from `build/code/src/gtl/index.js`, called with a dummy basis;
- the built `./product` binding tables;
- valibot schemas of the same form as the code under review.

For predicates that are not exported, I evaluated verbatim copies of their bodies.

The helper scripts are in this session's scratch directory, not in the repository:

| Script | Purpose |
|---|---|
| `kindscan.py` | Scans recorded stores for event kinds. |
| `claim2.mjs` | Resolves `OWNER_CONTRACT_SOURCES` locators. |
| `claim11b.mjs` | Prints the workflow composition of each publication. |
| `noteclass.py` | Re-implements the Lead 1 note classifier. |
| `declspan.mjs` | Gives declaration line spans from the TypeScript parser. |
| `tscheck/` | Type-identity checks, compiled with `noEmit`. |

**What I did not run.** No tests, no `npm run build` or `npm pack`, no CLI, no store writes, no provider or network calls. Nothing was repaired.

## Verdicts at a glance

| # | Register entries | Verdict |
|---:|---|---|
| 1 | abg-calls E1, abg-traversal AT-01 | holds |
| 2 | product-run 1, implementation-public "Nine declared Public members" | holds |
| 3 | AT-06, product-run 3 | **narrowed** |
| 4 | AT-07, product-install E1, GV-04 | **narrowed** |
| 5 | GV-01 | holds (one producer missed) |
| 6 | abg-calls E2 | **narrowed** |
| 7 | abg-events E7 | holds |
| 8 | abg-events E4 | holds (by reading) |
| 9 | abg-workers GC03 | holds |
| 10 | product-run 5 | holds (consumer fixture missed) |
| 11 | product-run 12 | **narrowed** |
| 12 | GV-03, hog-shared-bindings first entry | **narrowed** (two drift items refuted; looser in four places, not one) |
| 13 | implementation-public "Worksite path confinement" | holds (scope understated) |
| 14 | AT-05, product-run 2 | **narrowed** ("records supervised by default" refuted) |
| 15 | AT-04 | holds for the stores searched |
| 16 | design-spec-repo E2 | holds |
| 17 | design-spec-repo Lead 1 | **narrowed** (1 of 12 stale is mixed; tokenizer blind spot) |
| 18 | design-spec-repo surprises, E10, Lead 7 | holds, except the branch count: 74 commits through 24 names; one is also held by a stash |
| 19 | implementation-public "Dead residue"; hog-shared-bindings "dead public twins" | **narrowed** (Risk "none" refuted; test users missed) |
| 20 | product-install PERF-A | holds (understated: per-row executions) |

## Claim 1. No source writes `fh_interaction_resume_admitted`, nothing calls the F_H response commit, and no recorded Run holds a resume event

**Verdict: holds.**

**Source.**
- There are 37 mentions in `T/code/src`, across 12 files under `abg/`. None constructs an event of this kind. They are:
  - the kind list and schema (`abg/event_store.ts:103`, `:965`);
  - axioms (`abg/calculus/axioms.ts:324`, `:1325`);
  - replay readers (`abg/replay.ts:1640`, `:1674`, `:1877`);
  - one reader coordinate label (`abg/fh_continuation_projection.ts:998`);
  - comparisons in the cursor, route and retry readers.
- `commitFhInteractionResponseAtExpectedPrefix` (`abg/continuation.ts:1564`) has no caller. Its only other mention is its barrel export (`abg/index.ts:302-306`). It would produce `fh_interaction_responded`, not the resume event.
- The only test use of this pair is `t287-single-address-space-consolidation.test.mjs:1094,1133`, which calls the prepare half.
- Commit `c2f1cfa3d` (C-17) says the kind "stays declared and read".

**Hand-built events in tests.** Two tests construct the resume event by hand: `generic-input-retention.test.mjs:49` and `t287-undispatched-diagnostic.test.mjs:176`.

**Recorded stores.** I scanned 78 files with `kindscan.py`, `node_modules` excluded. The scanner parses JSON and JSONL, including JSON nested in strings.

| Store | Files |
|---|---:|
| `T/test_env/proof` | 4 |
| `T/test_env/evidence` | 8 |
| `T/test_env/uat/runs` (basic-cli `2026-10-06T00-44-53-198Z-0282ce9e…` and preflight `2026-10-06T00-44-43-112Z…`) | 66 |
| `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/live-01/events.json` (1,692 events) | 1 |

- No node has `kind` equal to `fh_interaction_resume_admitted`, `fh_interaction_responded`, `fh_interaction_opened`, `continuation_abandoned`, `construction_intent_selected` or `construction_delta_observed`.
- The raw substring hits are embedded `.d.ts` source text, in:
  - `evidence/abi5-root-r1.json`
  - `evidence/abi5-root-r2.json`
  - uat `abg-acquisition.json`
  - uat `calls/workspace-create.request.jsonl`
- The 6 KB consumer tgz in uat was scanned as raw bytes only.

## Claim 2. Nine declared Public members have no binding

**Verdict: holds (evaluated on the build).**

**What the built `./product` holds.**
- `INTERACTION_DEFINITION_BINDINGS` does not exist.
- `WITNESS_DEFINITION_BINDINGS.admit` has only `reprice` and `run-stopped`.
- Of the 56 `OWNER_CONTRACT_SOURCES` locators, 9 resolve to no callable. They are the five `interaction.respond` members, and witness `attest`, `hygiene-stamp`, `intake` and `run-resumed`.
- The transport refuses these with `installed_binding_unavailable` (`public/installed_definition_call_transport.ts:240-298`).

**The native admitter exists but is reached by one binding.**
- `admitWitnessedAct` (`abg/witness_admission_operation.ts:1113`) has branches for `attest` (:817), `hygiene-stamp` (:861), `intake` (:950) and `run-resumed` (:1053, :1098).
- Its only runtime caller is `abg/witness_definition_bindings.ts:302`.

**Test coverage of the native branches.**
- `witness-reprice-definition-binding.test.mjs:193-213` admits `reprice`, `attest` and `hygiene-stamp` natively.
- No test admits `intake` or `run-resumed`. "Implemented" for those two rests on reading.

## Claim 3. Legacy root-public request family; the re-entry basis is never constructed

**Verdict: narrowed.**

**What holds.**
- Producers of the legacy family are tests and support only: r5-invocation-admission, t287-c2-child-program, t287-post-binding-worksite-write, m5-event-store-reopen, and `support/root-installed-environment.mjs`.
- Recorded evidence uses it: `proof/abi5-root-r10.events.jsonl`, `evidence/r1`, `evidence/r2`.
- No `reentryBasis` value is ever constructed.
- On the exact path the re-entry branch always refuses, because `suppliedReentryAuthority` (`abg/invocation_admission.ts:1047-1050`) comes only from the legacy payload.

**What is wrong.**
- **`priorGap` is live on the exact path.**
  - It is read on every admission (`:1288-1291`).
  - When there is no re-entry basis, a non-null `priorGap` is refused with `authority_mismatch` (`:1354-1360`).
  - The fixture `developer-mini-product/src/index.ts` declares `priorGap` in its input (:754, :790-804, :902-932, :2387, :3058). It is null in every test.
  - AT-06's "priorGap is read only there" is wrong. Deleting the read changes exact-path behaviour.
- **`admitInvocation` has a string-named manifest user.** It is the `nativeTypedLocator` of `abg.contract.abg.invocation-root-admission` (`T/scripts/generate-product-manifest.mjs:846-849`). `nativeTypedLocator` (:617-634) throws if the symbol is not exported. product-run entry 3 omits this from Risk; AT-06 has it.
- `ExactInvocationAdmissionInput` inherits the optional `reentryBasis` field (:132, :141-146).

**Corrected statement.**
- The legacy family and the re-entry branch have no shipped producer.
- Retiring them must keep the exact-path `priorGap` refusal or move it.
- It must also re-point or delete the manifest locator for `admitInvocation`.

## Claim 4. The STDO-only environment evidence is dead and the `stdoRunEnvironments` shape is always refused

**Verdict: narrowed.**

**What holds.**
- No runtime code reads the STDO evidence functions. The payload field `stdoEnvironment` (`abg/stdo_environment.ts:159`) is in no `event_store` key list.
- The shape is always refused:
  - refusal points: `validator/validation.ts:178`, `:754`, and `gtl/stdo_run_environment.ts:228-229`, `:241`, `:298-302`;
  - these are reached through `product/catalog_operations.ts:291` and `product/execution_resolution.ts:763`;
  - raw admission still accepts the field (`validator/raw_admission.ts:125`).
- Recorded stores hold `stdoRunEnvironments` only as declaration text.

**What is wrong.**
- **Live schemas read the STDO schema objects at module load.**
  - `abg/stdo_environment.ts:187,190`: `RUN_ENVIRONMENT_EVIDENCE_SCHEMA` borrows `contexts` and `accesses`. AT-07 notes this.
  - `gtl/stdo_run_environment.ts:172`: the live `RUN_ENVIRONMENT_SCHEMA` spreads `STDO_RUN_ENVIRONMENT_SCHEMA.entries.roles.item.entries`. GV-04's "delete the old schema" misses this.
  - The published owner also names it: `gtl/serialization_contracts.ts:218`, and `gtl/canonicalization.ts:141`.
- **product-install E1's deletion range takes live helpers.** "Delete `product/stdo_environment.ts:24-197`" would remove `ref`, `path`, `digest`, `hash`, `encoded`, `inside`, `fileAt` and `ObservationFailure`. Code after line 197 uses them 18 times.
- **The STDO-only items in that range** are:
  - the resource schema and types (29-41);
  - `inventoryPaths` (55);
  - `verifyCompanion` (65);
  - `observeStdoEnvironment` (85).

**Corrected statement.**
- First move the shared role, `contexts` and `accesses` entries into the run-environment schemas. Then delete the STDO schema.
- In `product/stdo_environment.ts`, delete only the STDO-only items listed above.

## Claim 5. `gate` has no producer outside tests

**Verdict: holds.**

**Shipped code.**
- `gateApplication` (`gtl/graph_applications.ts:219`) is exported only through `gtl/index.ts:104`.
- The contracts carry the schema arm only.

**Fixtures.**
- The fixture `test_env/fixtures/language-structural/program.mjs:92-97` builds a gate application.
- Its default case list (:49) includes `gate`, so many tests install and validate the gate Program.
- No test starts it: there is no `GATE_IDS` use.
- The leaf (`leaf.mjs:11`) passes input through. The rule config `fixture_subject_gate`/`blockedSubject` is never read.

**Missed producer.** GV-01 missed a static producer in `t287-gtl-serialization-publication.test.mjs:373`.

**Downstream.** `odd_sdlc_t132_frozen/.../gtl_conformance/program.js:898-899` only detects the names `gate(`/`gate`; it builds no gate application.

**Not checked.** GV-01's inferred "a refusal never stops the Run".

## Claim 6. The pasted return types in `abg/construction_continuation.ts` are the same as their named types

**Verdict: narrowed.** These results come from type-identity checks (`Equal<A,B>` plus one-way assignability), compiled against the repository's compiler options.

**Where the drift has already happened.**
- The pasted `childFunction` is mutually assignable with `Readonly<GraphFunction>` but not identical to it.
- The only difference is the recurse `foldback`. The paste lacks the optional `failedChildDiagnosticClassRefs` (`gtl/serialization_contracts.ts:99-102`).
- That field was added in `9ad8d7e83` on 2026-11-11, after the paste in `67c333799` on 2026-10-21. The drift E2 predicts has already happened.

**Types that are identical.**
- The embedded prepared type equals `PreparedConstructionIntentContinuation`.
- `request` equals `SelectedActionUseRequest`.
- The two `prepareConstructionIntentContinuation` overload copies are identical.

**Types that are not.**
- The `prepareConstructionContinuationOperation` overload copies differ.
- The public copy types `prefix` as `ValidatedRuntimeEventPrefix | DurablePrefixCoordinate` in the `duplicate` and `invalid_history` variants.
- The internal copy and the implementation signature type it as `RuntimeEventPrefix | DurablePrefixCoordinate`.
- A single named type therefore needs a prefix type parameter.

**The projector type.**
- It is a mutable `EffectfulPublicInvocationPriorAdmission` with `operationId` narrowed to `"abg.operation.run.continue"`.
- E2's replacement widens `operationId` to seven literals. The one caller (`abg/effectful_invocation_truth.ts:241-245`) still compiles.

**What changes in the published artifacts.**
- With `stripInternal`, the 708-line `.d.ts` keeps only the public overloads. The GraphFunction expansion appears twice there and six times in source. Signature lines total about 1,459.
- The manifest names `abg/construction_continuation.d.ts` 48 times: 47 `publicContractCatalog` declaration inventories, plus `productRelativeLocators[24]`.
- A text change therefore moves:
  - 47 `declarationDigest` values;
  - each row's `contractDigest`, which is `sha256Canonical(declarationInventory)` (generator :610-615);
  - `productContentDigest`.
- The emitted JS does not change.

**Corrected statement.**
- Name the shared types, with a prefix parameter for the operation result.
- Re-sync the paste with `GraphFunction` first: it has already drifted.
- Budget for 47 contract-row digest changes.

## Claim 7. `persistEventLog` writes nothing

**Verdict: holds.**
- `abg/event_log.ts` (57 lines) reads, decodes, compares and returns.
- `readAll` (`abg/event_store.ts:2590`) does no write.
- Users:
  - the barrel (`abg/index.ts:395`);
  - `t287-event-body-encoding.test.mjs:10,285`;
  - two design notes.

## Claim 8. The twelve legacy reads decode the whole log twice per call

**Verdict: holds, by reading.**

**First decode.** `binding()` (`abg/project_read_definition_bindings.ts:894-990`) accepts only a reopen resource. The store therefore reopens (`abg/definition_event_resource.ts:331`, `abg/event_store.ts:4254`).

**Second decode.** Every port calls `project()` (`abg/project_read_ports.ts:1837`). Then:
1. `prepareRead` (:686) runs without a retained prefix.
2. `admitJson` copies the packet.
3. The `activeSelection` WeakMap misses.
4. `coldHistoryReads` increments.
5. `decodeRuntimeHistoryDescriptor` runs again (`abg/event_store.ts:3637-3661`).

**Scope.**
- The built module has 18 members: 12 legacy reads and 6 run reads.
- The two members that always return `target_absent` also decode twice.
- The basis-mismatch refusal decodes once.

## Claim 9. Governed context is test-only

**Verdict: holds.**
- The policy key (`abg/governed_context.ts:812`) is set only in `t287-governed-context.test.mjs` and `support/t287-governed-context.mjs`.
- `queryArtifacts: () => null` is at `abg/actor_process.ts:1031`.
- Only that test calls the cold-verify pair (`governed_context.ts:244`, `:638`).
- In attempt-009 (B07, 150 MB) the key appears only in `B07_INCREMENTAL_DIFF.patch`.

## Claim 10. `product/registered_selection_native.ts` is used only by tests

**Verdict: holds, with one omission.**

**Users.**
- It is consumed only at runtime, through `abg/instruction_assembly.ts:298-345`.
- Producers of `registered_selection_task` are three tests (t287-native-registered-selection, t287-recursive-registered-selection, t287-native-selection-profile-scope) and the fixture Product `test_env/fixtures/registered-selection-product/`.
- The fixture's `native.mjs` imports the three route functions from `@abiogenesis/typescript-tenant/product`, as a consumer would. `recursive.mjs:50` also uses the route.

**Recorded and live use.**
- The live RC12 Run has 14 `framed_synthesis_task` and 0 `registered_selection_task`.
- The RC12 foldback tests import `recursive.mjs` but rewrite the root without the select node.

**Omission.**
- Framed synthesis requires `abg.framed_synthesis_locus` and the default-library bindings.
- For a consumer F_P `registered_selection`, this route is therefore the only native selector.
- The `./product` exports are a consumer surface. Retiring them is a Public-contract change, not a test cleanup.

## Claim 11. The default library uses three of eleven mechanisms, and the others have no caller in any shipped composition

**Verdict: narrowed.** I evaluated all ten shipped publication constructors with `claim11b.mjs`. They are the ones listed at `generate-product-manifest.mjs:1203-1214`.

**What holds.**
- The default library's only external workflow targets are:
  - `worksite/native-work@5` (induction, specification, design, construction);
  - `worksite/native-work/assessment@5` (review, uat);
  - `worksite/command-execution@5`, which is C2 (testing).
- The three named mechanisms are therefore correct.

**What is wrong.** "No shipped program composes them" is true only for the default library. Inside other shipped modules:
- **C3 composes C1, and C1 composes the C0 file-replace function** (`module://abiogenesis/worksite/construction@5`):
  - `branch-construction@5` → `branch-construction/branch-application@5` → `construction@5`;
  - `construction@5` → `construction/vector-application@5` → `file-replace@5`.
  - That `file-replace@5` is published by the construction module itself, from the C0 parts constructor.
  - The standalone C0 module (`module://abiogenesis/worksite/c0@5`) is not shipped. It is absent from the generator's module list (`T/scripts/generate-product-manifest.mjs:1203-1214`) and from the manifest's 10 `publicationBindings`. C0 ships only as parts inside the construction module, where C1 composes it.
- **C2 binds the C1 and C3 selectors.** The C2 module binds `select-construction-fd@5`, `select-branch-construction-fd@5` and `prepare-branch-task-fd@5`. It also holds the supervised, start-free `revision-command-execution@5` Program.
- **The semantic stage reuses requirement handoff's implementation.**
  - It binds `semantic-stage/job-intake@5` to `requirement_handoff.js`. This is an implementation binding, not a GraphFunction composition.
  - Its job-graph constructors compose C0 file-parents by contract (`gtl/semantic_stage_publication.ts:27-28`, `:87-88`). Those constructors are exported for consumers; the shipped publication does not call them.
- **Nothing composes these:** the command-forward, requirement-handoff and C3 Programs. Result assessment is a Public operation only.
- Consensus and self-conformance compose only their own graph functions (evaluated).

**Corrected statement.**
- Beyond the default library, C1 is composed by C3 inside the construction module, and C0 ships only there, composed by C1.
- C2 binds the C1 and C3 selectors.
- The semantic stage reuses the requirement handoff implementation.
- The owner question in entry 12 still stands, but its exception list is incomplete.

## Claim 12. `owner_bindings/run_invocation.ts:247-717` is a drifted hand copy of `gtl/serialization_contracts.ts`

**Verdict: narrowed.** It is a hand copy. I read both sides and evaluated the valibot semantics on the repository's valibot.

**Drifts confirmed:**

| Drift | Copy | Owner | Effect |
|---|---|---|---|
| `c_compose.terms` | `run_invocation.ts:298`, no `minLength(2)` | `serialization_contracts.ts:60` | copy looser |
| `c_batch.tasks` | `:321`, no `minLength(1)` | `:69` | copy looser |
| tuples (`authorities`, both `eventKindRefs`) | `v.tuple`, `:549`, `:686`, `:707` | `v.strictTuple`, `:191`, `:165`, `:167` | copy looser and rewriting: evaluated, `v.tuple` accepts `["a","b","c"]` and outputs `["a","b"]`; `admitContract` returns the schema output (`shared/admit/contract.ts:13,27`) |
| `declarations`, `policies` values | nonblank (`:485`, `:516`) | `v.string()` (`:147`, `:198`) | copy stricter |
| `stdoRunEnvironments` | absent from a strict object (`:620-717`) | optional (`:218`) | copy stricter (refuses the key) |
| `semanticJobLifecycle.stages` | `SEMANTIC_JOB_LIFECYCLE_SCHEMA` (`:624`): `v.custom(isSemanticStageDeclaration)` = `STAGE_SCHEMA` plus its invariants (`gtl/semantic_job.ts:38`, `gtl/semantic_stage.ts:114-120`) | `STAGE_SCHEMA` alone (`:209-211`) | copy stricter |

**Drift items refuted.**
- **"`vectorIndex` has no maximum" is false.** The copy's `v.pipe(v.number(), v.safeInteger(), v.minValue(0))` accepts exactly what the owner's `integer` + `minValue(0)` + `maxValue(MAX_SAFE_INTEGER)` accepts. Evaluated: 2^53-1 is accepted by both; 2^53, 2^60, 1.5 and -1 are refused by both. The same holds for `budget`, `bound` and `maxApplications`.
- **"`v.union` where the owner uses `variant`" changes no accepted value.** The options are strict objects with distinct discriminator literals. Evaluated: identical accept and refuse results on five probes. Only the issue shape differs.

**The "looser" count is wrong.** GV-03 says adopting the owner makes admission "stricter in five places and looser in one".
- "Stricter in five" is right when counted by site: compose length, batch length, and the three tuple sites.
- "Looser in one" is wrong. Adopting the owner loosens four places: blank declaration values, blank policy values, `stdoRunEnvironments`, and the semantic job stage invariants.
- hog-shared-bindings' "a correction toward the owner, not a weakening" is therefore also wrong for those four.

**Does a malformed publication pass the copy?** The answer depends on the path.
- **Shipped path: the copy never runs on the catalog or the view.**
  - `RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS` (`run_invocation.ts:2309-2312`) passes an owner-established catalog and view by identity, before any schema run (`public/binding/static_definition_bindings.ts:76-90`).
  - The 247-717 copy is reachable only through those two members. `GRAPH_FUNCTION_SCHEMA` is used at :926, and `MODULE_PUBLICATION_SCHEMA` at :1015 and :1017.
- **Fallback path: a caller-supplied catalog that the owner did not establish.**
  - A one-term compose or an empty batch passes the copy.
  - If it lies in the selected Program's declaration closure, it is refused later. Product resolution runs `validateProgram` (`product/execution_resolution.ts:763-775`), which reaches `validator/validation.ts:992` and then `validator/c_algebra.ts:283` or `:404`. The refusal is `incompatible_or_unproven` at `declaration_closure`.
  - Outside the selected closure it passes and is never read.
  - An over-long tuple passes and is silently truncated to the owner shape.
  - Resolution also binds each publication by `modulePublicationSemanticDigest` to an admitted install's contribution-manifest row (`execution_resolution.ts:378-389`, `:785-799`). Installs are projected from durable artifact truth (`run_invocation.ts:1145-1151`).

**Additions.**
- The copy's `C_PROGRAM_TERM_SCHEMA` rebuilds a seven-member union inside `v.lazy` on every nested term parse (`:287-330`). The owner's lazy getter returns one prebuilt schema (`:37`).
- `rules[].config` uses the shared `jsonValueSchema` (finite numbers), so it matches the owner. That is not a drift.

## Claim 13. The worksite path-confinement copies disagree on a directory named `..x`

**Verdict: holds (evaluated), but the entry understates the scope.** The predicates are not exported, so I evaluated verbatim copies of their bodies.

**Evaluation of the named predicates.**

| Candidate under root `/w/root` | Parent `containsPath` (`implementation/worksite_command_execution.ts:320-323`) | Helper `containsAbsolutePath` (`implementation/worksite_command_helper.ts:349-353`) | Release `inside` (`implementation/release_publication.ts:37`) |
|---|---|---|---|
| `/w/root/..x` | false | true | true |
| `/w/root/..x/f` | false | true | true |
| `/w/root/...` | false | true | true |
| `/w/root/a/..x` | true | true | true |
| `/w/root` (the root itself) | true | true | false (strictly inside) |

**There are more copies than three.**
- Two more containment predicates use the helper's `../` rule: `product/worksite_effect.ts:500-504`, and `inside` at `product/stdo_environment.ts:46-48`, which means strictly inside.
- About ten inline `rel.startsWith("..")` checks use the parent's rule:
  - `abg/worksite_construction_recovery.ts:153`
  - `abg/semantic_revision.ts:965`
  - `abg/worksite_revision.ts:794`, `:822`
  - `abg/transport_contracts.ts:577`
  - `abg/semantic_stage.ts:294`, `:381`
  - `abg/semantic_job.ts:403`
  - `implementation/leaf_invocation_port.ts:1099`
  - `validator/self_conformance.ts:185`
- "One module; the three sites import it" undercounts the change.

**A concrete cross-owner disagreement.**
- Product's subject normalizer (`product/worksite_effect.ts:741-765`) admits a top-level path `..x/f`, and Product's protected-root check does not flag it.
- The parent then refuses the same subject at Worker dispatch: `:337`, "protected subject escapes the canonical worksite root".

**A fail-open that is not reachable.**
- The parent's rule fails open on its exclusion checks. Its protected-root check (`:342`) does not flag `.abg/events/..x/f` under an event-log root at `/w/site/.abg/events`. Its nesting checks (`:449`, `:459`) do not see a root at `/p/..x/state`. Both were evaluated.
- Through `constructWorksiteSubject`, this is not reachable. Product's `protectedWorksitePath` (`worksite_effect.ts:506-515`, used at `:799-803`) flags that subject as protected first. That was evaluated too.
- I did not check whether some route builds a `WorksiteExecutionTask` subject without that constructor.

## Claim 14. A graph_function start skips the root-mode check in Product and ABG, and the admitted record states `supervised`

**Verdict: narrowed.** The bypass holds. "Records `supervised` (the schema default)" is refuted.

**The bypass holds, by reading.**
- `abg/invocation_admission.ts:955-963` and `product/invocation.ts:1138-1146` key on the invocation variant `direct`, not on `rootMode`. A graph_function start has variant `start`, so neither refusal applies.
- `resolvedPublicStart` excludes graph_function targets (`abg/invocation_admission.ts:1093-1126`).
- Product's `startSelection` (`product/run_invocation_operation.ts:224-251`) carries `rootMode` without reading program policy. `execution_resolution.ts:561-575` only looks the handle up.
- `publicStart` (`abg/invocation_admission.ts:1293-1313`) records `rootMode: exactRequest.rootMode`. Its only membership checks are `callableMembership` and catalog `programMembershipRefs` (:1175-1194).
- No HoG file reads root mode. The only other reader is the projection at `abg/instruction_assembly.ts:443`, so the recorded value reaches F_P instructions.

**What is refuted.** Both product-run entry 2's "a graph_function start of a direct program without an explicit `rootMode` is admitted and records `rootMode: supervised`" and AT-05's "(the schema default)" fail:
- The shipped start constructor requires `rootMode`. `ProductRunInvocationSelectionIntent` types it as required (`run_invocation_operation.ts:839-848`), and it is copied into the request (`:1041`).
- A hand-built request that omits `rootMode` fails call identity:
  - `admitExactDefinitionCall` re-admits the request with the request schema, which inserts the default (`public/binding/definition_binding_mechanics.ts:454-466`).
  - It then compares `invocation.requestDigest` with `sha256Canonical(invocation.request)` (:477). The caller's digest was taken over the request without the field (`public/installed_public_definition_call.ts:308`).
  - Evaluated: valibot's `optional(..., "supervised")` adds the key to the output.
  - The early return for established invocations (`:447-452`) does not open a gap. The only writer of `establishedInvocations` is `establishExactDefinitionCall` (`:212-223`), and it first runs the same full `admitExactDefinitionCall`. Its docstring states that the request is "the value `requestDigest` names".
- The recorded `rootMode` is therefore always the value the caller stated. A caller can still state `supervised` against a direct Program, or `direct` against a supervised one, and it is recorded as stated.

**No live user of the bypass on a supervised Program.**
- The tests and support that start by graph_function handle all name direct Programs with `rootMode: "direct"`:
  - `t287-st1-installed-cross-owner-hello.test.mjs:2015-2021`, `:2303`;
  - `support/installed-qualification-conservation.mjs:387`. Its qualification Programs are all direct: evaluated, seven Programs, each with one start.
- The live RC12 Run's only `public_start_identity` is target `next`, `rootMode: direct`.
- `worksite/revision-command-execution@5` is supervised with zero starts, so `resolveProgramStart` can never admit it as a root. Outside its owner `gtl/worksite_command_execution.ts`, nothing in source or tests names it (grep).

## Claim 15. No recorded Run outside test output contains `construction_intent_selected` or `construction_delta_observed`

**Verdict: holds for the stores in claim 1**, from the same scan: zero One Surface events.

**Not checked.** AT-04's `test_runs`/rp2 statement.

## Claim 16. Self-conformance and qualification never completed a run

**Verdict: holds.**

**Records read.**
- The T-287 header reads `current_qualification: OPEN_fifteen_families_F11_sole_AF22_pre_RC_installed_RC_and_human_acceptance`.
- The T-287 line at :924 records D5-c: the dry mode admitted F11 and AF22 and "ended undispatched".
- `specification/GOALS.md:2` reads "local, unqualified, unpublished". Every status line through RC10 and RC11 says unqualified, for example `:50` "RC11_LOCAL_DELIVERED_UNQUALIFIED".

**The F11 return.** `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/final-f11-native-assessment-execution-01/return.md:5-9` records:
- `ENOTFOUND`;
- no qualification judgment;
- a `runtime_failed` Run;
- 291,588.677 ms;
- a driver peak RSS of 5,254,938,624 bytes;
- a 67,784,040-byte canonical input.

**The rule catalog.** `T/contracts/qualification/rule-catalog.json` holds 2,116 rules. Every rule has `applicability: requires_admitted_judgment` and `diagnostic: semantic_assessment_required` (parsed).

**Searches for a verdict record.**
- I grepped for verdict, self-conformance-result and green-disposition records in `rc11-qualification-01`, `rc8-close-proof-01`, `rc8-local-cut-01`, `rc8-resumption-20261108` and `rc12-executive-01`, excluding `node_modules`. The only hits are frozen source copies.
- The `release-qualification-rc6-01/HANDOFF.md` status lists "pre-RC F11/soleAF22" as remaining.
- In tests, the two `disposition: "green"` values are hand-built probes:
  - `t287-w2-05-release-snapshot-definition-bindings.test.mjs:88`;
  - `support/fresh-process-runtime-proof.mjs:71`.

**Not searched.** The other `.ai-workspace/work` campaign directories, and `test_runs`.

## Claim 17. Design-note classification: a sample of twelve stale and six current notes

**Verdict: narrowed.**

**Sampling basis.**
- The reviewer's classifier output is not saved (`census/out/design.json` has no per-note class), so I re-implemented the stated rule as `noteclass.py`.
- My counts are current 50, superseded 17, stale 187, record 73. The reviewer's are 48, 17, 189, 73.
- The difference is the source tokenizer: I read 20,438 identifiers, against the reviewer's 19,074. Two notes sit on the 60% line under my tokenizer: `M03_M04_RUNTIME_FAILURE_TAXONOMY_FIRST_SLICE_IACS` at 64% and `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS` at 60%. The rule is threshold-sensitive.
- I drew the sample with seed 20261112 and excluded those two notes.

**Stale, 11 of 12 hold.**
- These hold: `M03_EXECUTION_AUTHORITY_PROVENANCE_DESIGN`, `M03_TRAVERSAL_MODULATION_DERIVATION`, `M03_EDGE_ASSURANCE_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM`, `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN`, `M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS`, `M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS`, `M03_GRAPH_FUNCTION_ITERATION_DERIVATION`, `M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION`, `M03_REQUIREMENTS_ALGEBRA_DERIVATION`, `M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION` and `M03_TOTAL_ASSURANCE_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM`.
- Each is an April-to-July ABG 3, first-slice or proposed design.
- Their named mechanisms are absent: `worker_turn`, `EdgeAssuranceContract`, requirements algebra, traversal modulation.
- PascalCase and UPPER_SNAKE survival is 0-29% in every one of them except the registry note. That note's two hits are generic type names (`GraphFunction`, `RuntimeEvent`), while its proposed replay-derived ABG registry does not exist.

**Stale, 1 of 12 is mixed.**
- `M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN` designs live code:
  - its central carrier `DS1_CAPABILITY_CONTRACT_REGISTER` exists at `shared/capability_contracts.ts:75`, with the Consensus rows the note designs (:39, :91);
  - `PublicContractCatalog` and `TenantConformanceManifest` exist;
  - `T255CapabilityCoverageEvaluator` and the projection names do not.
- It landed in stale because the token rule counts only lowerCamel and lower_snake names. Its PascalCase and UPPER_SNAKE carriers scored as one identifier, and it then fell to the date rule (2026-07-15 < 2026-07-21).

**Current, 6 of 6 hold.**
- These hold: `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN`, `T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN` (its `resolveNativeDeclarationClosures` is live in `product/verify_product.ts` and `product/declaration_exports.ts`), `T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN` and `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN`.
- `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN` and `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN` are two of the six held candidates the reviewer already lists.

**A consequence of moving notes.**
- Every sampled note is named by `T/test_env/qualification/inventory.json` (`qualification_subject_inventory`, 1,191 members with digests) and by `recipe/verification-recipe.json`.
- These are whole-tree snapshots, not readers of note content, so leaving them out of the mention count is reasonable.
- Moving or deleting notes still changes the qualification subject inventory.
- That inventory is already stale: 309 of 1,191 member digests differ from the current files (computed).

**Corrected statement.** The stale class is mostly right. A note scored only on lowerCamel and lower_snake tokens can still hold live PascalCase or UPPER_SNAKE carriers. Read every stale note that names an UPPER_SNAKE or PascalCase symbol found in source before moving it.

## Claim 18. Tag `v5.0.0` selects the unqualified rc.1; `main` is 429 ahead of `origin/main`; 75 commits are reachable only through 25 local branch names

**Verdict: holds for the tag and the ahead count. Narrowed by one commit for the branch count.**

**The tag.**
- `v5.0.0` (tag `70cec304a`) and `v5.0.0-rc.1` (tag `29a22e18c`) both peel to commit `5b793c65e`.
- The `v5.0.0` message reads "Latest published ABIogenesis 5.0 RC discovery selector -> v5.0.0-rc.1; development preview, not stable acceptance."
- `specification/PRODUCT.md:1552`, `:1772` define a mutable `v5.0.0` latest-RC selector.

**Ahead of origin.**
- `git rev-list --count origin/main..002035b8a` gives 429. At HEAD `59fbaf8a0` the count is 430; it is 0 behind.
- `origin/main` is `93a4b08df`, dated 2026-10-22.

**The 75 commits.**
- `git rev-list --branches --not main --remotes --tags` gives 75.
- Per-branch counts sum to 75 over exactly 25 branches: 19 `codex/*` and 6 `donor/*`. The list matches Lead 7.
- The count stays 75 when `refs/archive/apps-retirement` (13), `refs/codex/checkpoints` (3) and the `refs/stash` tip are also excluded.
- It falls to 74 when all 9 stash entries are excluded (`$(git stash list --format=%H)`). The one `codex/t280-impl` commit, `594d7fbf1` from 2026-07-16, is also reachable from `stash@{7}`, "On codex/t280-impl: t280-pre-shared-projector".
- No worktree HEAD is among them.

**Corrected statement.** 74 commits are reachable only through 24 local branch names. One more is held by `codex/t280-impl` and by `stash@{7}`.

## Claim 19. Dead residue (implementation-public) and HoG dead public twins (hog-shared-bindings)

**Verdict: narrowed for both.** "Risk: none" in implementation-public is refuted.

### implementation-public "Dead residue, grouped by feature"

Its five largest declarations, by parser span:

| Declaration | Size | Users found |
|---|---|---|
| `public/gap_authority.ts` (module) | 144 lines | `public/index.ts:1-4` re-exports `PublicGapAuthority` and `PublicGapSource` (type-only) into the `./public` package export (`T/package.json:36-39`). That is SDK surface, not tier none. No runtime caller and no test. |
| `implementation/index.ts` (barrel) | 122 lines | Tests and support, as stated. |
| `isClosedProbabilisticLeafInvocation` (`implementation/leaf_invocation_port.ts:138-176`) | 39 lines | A real test, not a name coincidence. `t287-c2a-fp-source-contract.test.mjs:47-81` imports it from the built module and asserts that it refuses missing and forged carrier pairs. That test is named in `T/package.json`. |
| `OWNER_CONTRACT_SOURCE_MAP` (`owner_contract_source_set.ts:703-715`) | 13 lines | Test only, as stated. |
| `ProbabilisticLeafImplementation` (`implementation/contracts.ts:218-221`) | 4 lines | None. |

**"They appear in no manifest row I found" is refuted.** These files each appear in 47 `publicContractCatalog` declaration inventories, plus `productRelativeLocators`:
- `public/gap_authority.d.ts`
- `implementation/contracts.d.ts`, which holds `ProbabilisticLeafImplementation`
- `public/binding/owner_contract_source_set.d.ts`, which holds `direct_owner_primitive`
- `public/binding/public_function_family.d.ts`, which holds `IntrinsicOwnerNativeSchemaIdentity`

I parsed the manifest to get these counts. Each deletion moves 47 contract-row digests and `productContentDigest`.

**Corrected Risk.**
- Manifest and digest pins: 47 contract rows.
- A Public type change on `./public`.
- The C2A receipt test must be moved or deleted with `isClosedProbabilisticLeafInvocation`.

### hog-shared-bindings "Delete HoG's dead public twins"

The runtime claim holds:
- no source caller besides the owned-variant aliases;
- no barrel export;
- each `.d.ts` appears once in `productRelativeLocators` and in no contract row (parsed).

Its five largest declarations:

| Declaration | Size | Users found |
|---|---|---|
| `beginRecursionApplication` | 28 lines | `t287-route-reconstruction.test.mjs:388`, through the built `hog/recursion_lifecycle.js` loaded as a module namespace (:320-330). The test asserts `publicStep` equals `completePublicOutcome(ownedStep)`. |
| `TraversalMachineState` | 15 lines | None. |
| `beginWorkflowLocus` | 12 lines | None. |
| `RecursionApplicationStep` | 11 lines | None outside `OwnedRecursionApplicationStep` (:138), which is also unused. |
| `completeRecursionChild` and `completeWorkflowLocus` | 6 lines each | `t287-route-reconstruction.test.mjs:393`; `t287-held-prefix.test.mjs:129-130`, through the built `hog/workflow_lifecycle.js`. |

**Further test users.**
- `restoreDeferredRecursion`: `t287-route-reconstruction.test.mjs:381`.
- `advanceStructuralTransition`:
  - `t287-retry-run-prefix.test.mjs:97,153,287`;
  - `falsifiers/runtime-f09-worker.mjs:1084-1086,1565`, which imports the built `hog/structural_transition.js`.
- The "dead" `complete` branch of `deferredRecursionCompletionsMatch` is asserted with `true` at `t287-route-reconstruction.test.mjs:384-385`.

**Why the entry missed them.** "One test-side grep confirms those hits are words, not imports" is wrong. These tests reach the twins as members of the built modules (`SourceTextModule` namespace, `privateOwner`, dynamic `import()`), which an import-statement grep does not see. None of these files is in an npm script, so the twins have whole-suite test users and no runtime user.

**Corrected statement.** Deleting the twins and the `complete` branch also requires rewriting or deleting the public-equivalence assertions in:
- `t287-route-reconstruction`
- `t287-held-prefix`
- `t287-retry-run-prefix`
- the F09 falsifier

## Claim 20. `productVerificationCoordinates` re-hashes at seven call sites with no memo

**Verdict: holds, and the entry understates the cost.**

**The function.**
- It computes three `sha256Canonical` bodies per call (`product/verify_product.ts:229-310`). One embeds the whole `nativeDeclarationEvidence` (:270); another embeds `checkedPayloadFiles` (:299).
- `sha256Canonical` has no cache (`shared/digests.ts:25-29`).

**The seven call sites are confirmed:**
- `catalog_definition_bindings.ts:344`, `:435`, `:511`, `:546`;
- `install_definition_bindings.ts:156`;
- `verification_operation.ts:58`;
- `environment_definition_bindings.ts:151`.

**The register should count executions, not sites.**
- `:435` (`inputRow`) and `:511` (row provenance) run inside `projectAdmissionRows`, once per contribution-manifest row of each verified product (`:465-531`).
- The ABIogenesis manifest has 49 rows. One catalog admission therefore computes all three bodies about 100 times for that one product: 49 × 2 + `:344` + `:546`.
- At the reviewer's measured 9.6-11 MB of native evidence, that is on the order of 1 GB of canonical JSON hashed per catalog admission. This is by reading and arithmetic; I did not measure it.

**Whether a caller already holds the result.**
- `verification_operation.ts:58` computes the coordinates once and returns them in `product_verification_success`. Downstream owners receive the artifact, not those coordinates.
- Within one catalog admission, the per-product descriptor computed at `:344` is discarded and recomputed per row.
- `environment_definition_bindings.ts:151` keeps only `verifiedArtifact = {ref: verificationRef, digest: verificationDigest}`, which are fields of the artifact itself.

## What I could not check

- Whether replay re-runs request admission over recorded requests (GV-03's open question).
- GV-01's "a gate refusal never stops the Run".
- `T/test_env/test_runs` (45 GB) and the wider `.ai-workspace/work` campaign logs, for claims 1, 15 and 16. AT-04's rp2 statement is included.
- Runtime confirmation of claim 8's double decode, and the cost in claim 20. Both are by reading; nothing was run.
- Claim 14 end to end: I did not run a graph_function start against a supervised Program. The identity failure on an omitted `rootMode` is by reading plus a valibot evaluation of the same `optional` default form, not a full call.
- Claim 13: whether any route builds a `WorksiteExecutionTask` subject without `constructWorksiteSubject`.
- Claim 17: notes outside the 18 sampled. Note bodies were read only to the depth needed to judge currency.
- Claim 2: native admission of witness `intake` and `run-resumed`. No test exercises them.
- The contents of the 75 branch-only commits.

## Patterns of error across the reviewers

1. **Users outside the import graph were missed.** Tests load built modules directly (`SourceTextModule` namespaces, `privateOwner`, dynamic `import()` with cache-busting queries) and call members by property. Import-statement greps and the census do not see these. This affected claims 19 and 10.
2. **Manifest reach was checked against the wrong list.** Entries were checked against `productRelativeLocators` only, or not at all. The packed declaration closure puts many internal `.d.ts` files into 47 `publicContractCatalog` rows. This affected claims 6 and 19, and AT-06 got it right only for one locator.
3. **String-named locators were missed.** `nativeTypedLocator` names a symbol by string and throws if it is unexported, and plain grep for callers misses it. This affected claim 3.
4. **Uses through valibot `.entries` spreads were missed.** A schema that looks dead is read at module load by a live schema. This affected claim 4.
5. **Drift was asserted from combinator names without evaluating acceptance.** `safeInteger` against `maxValue`, and `union` against `variant`, accept the same values. `tuple` against `strictTuple` does differ, and the copy rewrites. Direction counts were not derived. This affected claim 12.
6. **Types were called "the same" without a type check.** Mutual assignability is not identity; a paste has already drifted; two overload copies differ; a replacement widens. This affected claim 6.
7. **Live-path guards were classified as legacy-only.** `priorGap` refuses on the exact path. This affected claim 3.
8. **"Shipped composition" was conflated with "default library".** An implementation binding was also counted as composition. This affected claim 11.
9. **Call sites were counted instead of executions.** Two of seven sites sit in a per-row loop. This affected claim 20.
10. **The invocation variant `direct` was treated as `rootMode: direct`, and schema defaults were assumed to reach the record.** Call identity hashes the request before admission adds defaults. This affected claim 14.
11. **A classifier blind spot was not disclosed.** A token rule that ignores PascalCase and UPPER_SNAKE misfiles notes naming live carriers. The classifier output was also not saved, so its per-note classes cannot be audited. This affected claim 17.
12. **Duplicate counts were taken from the first few copies found.** The confinement rule has at least five predicate copies and about ten inline variants, not three. This affected claim 13.
