# Findings: hog-shared-bindings

Commentary, not law. Independent read-only reviewer (Claude Opus 5.5) for the Executive, 2026-11-12, at `main` `b4b6095df` working tree. T = `build_tenants/abiogenesis/typescript`; paths below are under `T/code/src/` unless stated.

Area: `hog/` (19 files), `owner_bindings/run_invocation.ts`, `shared/` (29 files with `admit/`, `process/`, `select/`, `value/`).

## Method, limits, labels

- Every file was read in full except where the coverage table says otherwise. The census in `census/out/` was used for tiers, `testFiles`, compiler-unused, kinds and clones. No test, build, network or model call was run. Only this file was written.
- Each `none`/`package` declaration in the area was re-checked by whole-word grep over `code/src`, then by reading the hits.
- The manifest reach of each area declaration file was counted in `T/product-toolchain-manifest.json`: `publicContractCatalog.rows[*]` (packed declaration closures) versus `productRelativeLocators` (the file inventory).
- Census limits found in this area, which the Executive may want applied to other areas:
  - **Namespace-qualified use is not counted.** `product.populateRunContinuationAtDurablePrefix` (`public/installed_public_definition_call.ts:615`) reached `usedByFiles` only through the barrel.
  - **Import aliases look like use.** `import { evaluateOwnedExecutableCCall as evaluateExecutableCCall }` makes a whole-word hit on the dead public name. HoG does this in every lifecycle import.
  - **Type-only use is tiered `package`.** `ExactOwnerOperationPort` is type-imported by twelve operation-contract modules.
- Performance claims in this area are **structural**, by reading only. The measured reviews attribute canonical JSON, sha256 and `canonicalEquals` cost to ABG event-store and product owners, never to `hog/` frames. Those reviews are RC6/RC7 operational, RC8 F2 (4 MiB: `writeCanonicalJson` 43 %, `sha256Canonical` 23 %, `canonicalEquals` 15 %) and RC9 F3.
- Labels used below:
  - **Owned variant:** an `@internal` function or type carrying `RuntimeReplayGuard`.
  - **Public twin:** the exported wrapper that converts the owned variant's result to the full `ReplayState` shape through `completePublicOutcome` (`abg/c_call_outcome.ts`). This is the TD-10 C-15b legacy.
  - **Held re-derivation:** recomputing, in the same process, a value the same owner already established and handed over.
  - **Cold rehydration:** rebuilding from the log after a stop. The recorded rule is that the log is the recovery source and the reader is a fold, so cold rehydration is lawful and is not listed as debt.

## Entries

### Consolidate run_invocation's restated GTL schemas into GTL, and move its product schemas to the product owners
- Category: second owner
- Evidence (read):
  - **GTL copies.** `owner_bindings/run_invocation.ts:247-717` declares local `EXECUTABLE_LEAF_REQUIREMENT_SCHEMA`, `INTERACTION_LEAF_REQUIREMENT_SCHEMA`, `C_OF_SCHEMA`, `C_PROGRAM_TERM_SCHEMA`, `GRAPH_FUNCTION_APPLICATION_SCHEMA`, `GRAPH_TEMPLATE_SCHEMA`, `GRAPH_FUNCTION_SCHEMA`, `CONTRACT_DECLARATION_SCHEMA`, `GTL_PROGRAM_SCHEMA`, `CATALOG_CONTRIBUTION_SCHEMA` and `MODULE_PUBLICATION_SCHEMA`. These are the same names GTL exports from `gtl/serialization_contracts.ts:39-229`. The file already imports `FOLDBACK_DECLARATION_SCHEMA` from that module (`:9`).
  - **The copy has drifted from the owner.**
    - The copy's `MODULE_PUBLICATION_SCHEMA` (`:620`) is a strict object without `stdoRunEnvironments`. GTL has it (`serialization_contracts.ts:218`), and `gtl/stdo_run_environment.ts:83-87` and `validator/raw_admission.ts:125` read it.
    - It has no `minLength(2)` on `c_compose.terms` or `minLength(1)` on `c_batch.tasks`. GTL has both (`:60`, `:69`).
    - It uses `v.union`/`v.tuple` where GTL uses `v.variant`/`v.strictTuple`.
    - `declarations` and `policies` take a nonblank value in the copy and a plain string in GTL.
    - `semanticJobLifecycle` lacks GTL's `stages` composition (`:209-211`).
    - The clone census pairs 550/574 (four copies of the construction authority row) and 672/693 (two closure-contract rows) sit inside this copy.
  - **Product shapes have no other schema owner.** `:719-1052` (`PRODUCT_CONTRIBUTION_MANIFEST_SCHEMA`, `RESOLVED_PRODUCT_LOCK_SCHEMA`, `VERIFIED_PRODUCT_SCHEMA`, `PRODUCT_INSTALL_CANDIDATE_SCHEMA`, `WORKSPACE_BINDING_CANDIDATE_SCHEMA`, `READY_GRAPH_FUNCTION_CATALOG_SCHEMA`, `GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA`, `DECLARATION_APPLICATION_SCHEMA`) are the only valibot schemas for these product types (grep for their `kind` literals). Clone pair 861/899 is verified product versus install candidate.
  - **The source-result basis has three owners.** `:1064-1097` restates `invocation_source_result_basis`, whose type is in `product/semantics.ts:29` and whose constructor and predicate are in `abg/invocation_admission.ts:392`/`:598`.
  - **When the catalog schemas run.** `public/binding/static_definition_bindings.ts:54-91` passes an owner-established `catalog` and `catalogView` by identity (`:2309-2312`). The nested catalog, publication and graph-function schemas therefore run only when a caller supplies a non-established catalog.
- Retire:
  - Replace `:247-717` with imports of GTL's exported schemas.
  - Move the eight product schemas to `product/catalog.ts`, `product/environment.ts` and `product/contracts.ts`, beside their types.
  - Take the source-result basis schema from `abg/invocation_admission.ts`.
  - `run_invocation.ts` keeps only the resource assertion and receipt composition (`:1099-1134`).
- Size: L (about 470 lines deleted, about 330 moved). It spans GTL, product and ABG owners, and the divergences need one ruling.
- Risk: manifest or digest pins. The consts are not exported, so `run_invocation.d.ts` (48 contract rows) is unchanged, but the build's JS file digest changes. Public contract is not listed because no generated contract under `T/contracts/` names `run_invocation_resource_assertion` (grep, 0 files). Adopting GTL's stricter rules changes what the fallback admits, for example an empty `c_compose`. That change is a correction toward the owner, not a weakening.
- Change class: realization_refactor (the GTL owner is already authoritative).
- Confidence: verified for duplication and divergence. Investigate whether any lane sends a non-established catalog with `stdoRunEnvironments`, which this copy would refuse today; a test-side grep for catalogs built outside `product/catalog.ts` settles it.

### Stop HoG re-deriving values ABG already established in the same process
- Category: performance (structural) and second owner (authority)
- Evidence (read). Each item recomputes, in the same process, a value the same owner just handed over:
  - **Program hash on every step.** `hog/traversal.ts:587`: `validateTraverseInput` hashes the whole `GtlProgram` on every `traverse`/`traverseFromCursor` call. Callers include each `c_of` step (`graph_execute.ts` `evaluateLocus` `:320-483`), the retry resume (`retry_lifecycle.ts:290`, `:366`), entry's projected-retry branch and parent rehydration. Cost scales with program size times steps.
  - **Comparing an object with itself.** `traversal.ts:654-667` runs `canonicalEquals(term, declaredTerm)` where `term` defaults to the same object. `canonicalEquals` has no identity shortcut by design (`shared/value/equality.ts`).
  - **Entry rehashes the admitted input.** `hog/entry.ts:119-122` hashes `initialInput.input` and `executionBasis.rawInputValue` and `canonicalEquals` them. ABG verified `canonicalRecordDigest(rawInputValue) === rawInputDigest` at root basis construction (`abg/execution_basis.ts:1555-1559`), and the brand `isExecutionBasis` (a WeakSet, `:1038`) is checked on `:110`. At run start both arguments are `prepared.admittedInput` (`run_invocation.ts:1506`, `:1635`). That is two full hashes and a full walk of one object per Run.
  - **Retry resume projects the same input three times.** `advanceOwnedRetryLifecycle` projects the retry input at `retry_lifecycle.ts:692`. `resumeProjectedRetry` re-projects it at `:227` and compares at `:244`. It projects runtime truth at `:266`, rehydrates basis and scope and `canonicalEquals` both at `:309-310`, calls `traverseFromCursor` twice (`:290`, `:366`) and compares the target at `:393`. `entry.ts:133-196` repeats the projection for the projected-retry entry.
  - **Recursion derives the deferred application five times per step.** This is the strongest structural item.
    - In `beginRecursionApplicationUsing`, `restoreOwnedDeferredRecursion` (`recursion_lifecycle.ts:627`) runs `deferredApplicationState` and `projectOwnedDeferredApplicationAtPrefix`. `requireDeferredApplication(restored, …)` (`:636`, body `:317-329`) runs both again plus one more `deferredApplicationState`. That is 3 derivations, 2 ABG projections and 2 completion `canonicalEquals`, all to compare the owner's result with itself.
    - `completeRecursionChildUsing` repeats it at `:849`, for 2 more derivations.
    - Each derivation runs `projectOwnedAdmittedLeafCCallOutcomeAtPrefix`, `deriveCompletedTraversalCursor` and `sha256Canonical(traversal.input)` (`:209-247`).
    - `:685` rehashes `restored.resultValue`, whose digest ABG holds as `state.result.valueDigest` (used as such at `:475`).
  - **Smaller held re-checks:**
    - `workflow_lifecycle.ts:326` and `:341-342` hash the child closure contract and filter `programValidation.closureContractDigests`, then pass both to `Abg.openCCall` (`:351-363`). Inferred, not read: that `openCCall` repeats the check is concluded from the arguments it receives.
    - `:421` rehashes the ABG-prepared intent input before child-basis admission. Inferred, not read: that the admission re-verifies it.
    - `:558` rehashes `frame.childInput` on the hold path.
    - `structural_transition.ts:129` rehashes the retry input against `target.inputDigest`.
    - `ccall_lifecycle.ts:202-203` hashes the same `resolution` twice.
- Not listed as debt:
  - `parent_rehydration.ts` (`validateGraph` per frame `:103`, four hashes at `:123`, `:127`, `:211`, `:296`) and `rehydrateOwnedRecursionChildFoldFrame` (`recursion_lifecycle.ts:730-789`) are cold rehydrations and lawful folds.
  - One exception may matter: `parent_rehydration.ts:256-263` walks the whole rehydrated `ExecutionBasis` (it carries `rawInputValue`) against the held one. Investigate whether ABG returns the same retained object on a held prefix (`:243` comment); if it does, comparing by the ABG brand would end the walk.
- Retire:
  - Where ABG's brand (`isExecutionBasis`, the owned receipts) proves the same check already ran on the same object, HoG consumes the receipt and keeps no second check.
  - Pass the established program digest instead of rehashing the program.
  - Compute the deferred application once per step and pass it on.
  - Do not delete a check whose object did not come from the owner's brand.
- Size: M (about 150 lines of checks removed across six files).
- Risk: none for replay digests, because no admitted event bytes change. Each removal must cite the owner check that already covers it, so no check is weakened.
- Change class: realization_refactor
- Confidence: verified as re-derivation by reading. The cost is structural, not measured; a per-frame timing of one recursion lane and one retry lane would settle the size.

### Delete HoG's dead public twins whose declarations are only in the file inventory
- Category: dead code (residue of TD-10 C-15b)
- Evidence: census tier `none`. Whole-word grep hits outside the file are only import aliases of the owned variants: `graph_execute.ts:27`, `:37`, `:46-47`, `:53`, `:61`, `:90-91`, `interaction_lifecycle.ts:29`, `retry_lifecycle.ts:25`, `ccall_lifecycle.ts:71`. The group:
  - `workflow_lifecycle.ts`: `beginWorkflowLocus` `:1129`, `completeWorkflowLocus` `:1142`.
  - `recursion_lifecycle.ts`: `restoreDeferredRecursion` `:1128`, `beginRecursionApplication` `:1134` (28 lines, the return type written twice), `completeRecursionChild` `:1163`, `RecursionApplicationStep` `:116`, `OwnedRecursionApplicationStep` `:138`. Also the `complete` flag of `beginRecursionApplicationUsing`/`completeRecursionChildUsing` and the `complete` branch of `deferredRecursionCompletionsMatch` (`:336-341`), which only the twins select. This is a dead branch inside live functions that the census cannot see.
  - `structural_transition.ts`: `advanceStructuralTransition` `:63`. It is identical to `advanceOwnedStructuralTransition` `:70`, so the indirection `advanceStructuralTransitionUsing` collapses too.
  - `interaction_lifecycle.ts`: `holdInteraction` `:227`.
  - `evaluation_frame.ts`: `MachineReturnFrame` `:88`, `TraversalMachineState` `:92`, `MachineLocusEvaluation` `:108`, which are the public twins of the `Owned*` types at `:140-149`.
  - Each of these `.d.ts` files appears once in the manifest, in `productRelativeLocators` only, and in no `publicContractCatalog` row.
- Retire: the listed declarations, the `complete` flag and branch, and the identity wrapper in `structural_transition.ts`.
- Size: S (about 110 lines).
- Risk: manifest or digest pins. Five locator digests change and no contract row does.
- Change class: realization_refactor
- Confidence: verified (tier, alias reading and manifest count). `testFiles` is 1 for some names; one test-side grep confirms those hits are words, not imports.

### Decide the public twins inside the packed declaration closure
- Category: dead code / design and specification (TD-10 option (c) scope)
- Evidence:
  - Tier `none`, alias-only hits as above:
    - `retry_lifecycle.ts:748` `advanceRetryLifecycle`.
    - `retry_lifecycle.ts:119-129` public `planSuccessfulRetryExit`. Its census tier is `runtime` because its type is read in the same file (`Parameters<typeof planSuccessfulRetryExit>[0]` at `:132` and `:136-140`), but it has no caller. All three call sites import the owned variant under the public name (`ccall_lifecycle.ts:62`, `workflow_lifecycle.ts:36`, `recursion_lifecycle.ts:51`). Name the input type once and delete the public body.
    - `ccall_lifecycle.ts:853` `projectCCallCompletion`, `:861` `evaluateExecutableCCall`, `:131` `OwnedCCallLifecycleEvaluation` (unused).
    - `ccall_lifecycle.ts:141` `OwnedRetryCCallOutcomeReceipt`, which is a re-declaration of `abg/c_call_outcome.ts:860`.
    - `traversal_completion.ts:159` `projectExecutableTraversalCompletion`.
    - `traversal_completion.ts:135` `projectOwnedBlockedRetryTraversalCompletion` (23 lines, no caller).
    - `traversal_completion.ts:103` `OwnedRouteTransitionAdmission`, a local type that shares its name with a different ABG export at `abg/traversal_route.ts:5191`.
  - `route_proposal.ts` gives every proposer a public `ReplayState` overload next to the `@internal` guard overload. These are the clone-census overload triples.
  - These files are in 48 `publicContractCatalog` rows each (`retry_lifecycle.d.ts`, `ccall_lifecycle.d.ts`, `traversal_completion.d.ts`, `route_proposal.d.ts`). The C-15b lesson applies: a retyping's reach is the packed declaration closure.
- Retire: the unused declarations and the public overloads, if the Executive rules the closure change acceptable. Otherwise record them in the register's retention section under TD-10 option (c), with the reason that they enter 48 contract rows.
- Size: M (about 200 lines plus the overload signatures).
- Risk: manifest or digest pins and Public contract. 48 contract rows change their declaration-closure digests.
- Change class: realization_refactor
- Confidence: likely. A build plus the manifest's declaration-closure check settles it, as at C-15b.

### Give ABG the projections HoG builds from raw event envelopes
- Category: second owner (authority)
- Evidence (read). HoG filters ABG's event index by kind and reads payload fields:
  - `workflow_lifecycle.ts:582-593` chooses the child's "last cause" over `traversal_route_admitted`/`c_call_judged`/`runtime_failure_observed` by `admissionOrdinal`.
  - `recursion_lifecycle.ts:747-751` finds the `c_call_judged` event for a `cCallRef` and `resultRef`, and reads `payload.judgmentRef` with a cast (`:757`).
  - `recursion_lifecycle.ts:825-830` finds `c_call_result_admitted` by payload `resultRef`/`cCallRef`.
  - `workflow_lifecycle.ts:510-536` (`childResultIsFailureClass`) reads the replay CCall guard in a try/catch to classify a child result as a failure. Its comment states the foldback admission "carries no class". HoG derives a class that ABG's foldback does not carry.
- Retire: ABG (`abg/event_prefix.ts` or `abg/c_call.ts`) exposes "judgment of CCall result", "result admission of CCall" and "last scope cause" projections. The foldback admission (`prepareWorkflowChildFoldback`) carries the child's result class. HoG reads those.
- Size: M (about 60 HoG lines out, three ABG projections in).
- Risk: none for replay digests, if the foldback class is projected rather than added to the admitted payload. Adding it to the payload would change recorded Run bytes, so prefer the projection.
- Change class: realization_refactor (projection only); design_reframe if the foldback payload changes.
- Confidence: verified as raw reads. Investigate whether an ABG projection for these already exists under another name; grep `abg/` for a `c_call_judged` reader keyed by `resultRef`.

### Read the no-action disposition set and the graph-span projection from ABG
- Category: second owner
- Evidence (read):
  - `route_proposal.ts:552-578` (`proposeGapStopRoute`) hard-codes `["gap_stop","reprice_required","repair","inspect_runtime_archive","reprice","escalate"]`. ABG owns `NO_ACTION_DISPOSITIONS` at `abg/traversal_route.ts:286-290` and checks it at `:1176`.
  - `route_proposal.ts:781` and `:889` cast `result.value as unknown as GraphSpanReentryProjection`, where ABG has the parser (`abg/traversal_route.ts`, around `:995`).
  - `selectedCCallOutcomeRoute` (`:724-743`) classifies the span-selection and next-action projections a second time.
- Retire: export the ABG set and parser and use them in HoG. Delete the literal list and the casts.
- Size: S (about 40 lines).
- Risk: none.
- Change class: realization_refactor
- Confidence: verified.

### Retire the F_H interaction-resume route residue
- Category: failed or superseded feature
- Evidence:
  - `route_proposal.ts:75`: refusal code `resume_not_admitted`. Its producer `proposeInteractionResumeRoute` and `hog/interaction_resume.ts` (286 lines) were deleted at C-18a `a0829a298`.
  - `traversal.ts:386`: `deriveInteractionSuccessorInputCarrierRef` (48 lines, tier `package` through `hog/index.ts:5` only, `testFiles` 0, no source caller). Its only caller was the deleted module: `git show a0829a298` removes the import and the call `const successorContract = deriveInteractionSuccessorInputCarrierRef(` from `hog/interaction_resume.ts`.
  - C-17 `c2f1cfa3d` retired the F_H resume chain and left this module only because a test support imported it by path. The register's C-6 record states that no Public operation resumes an F_H hold.
- Retire: the code literal and the function, and its export from `hog/index.ts`.
- Size: S (about 50 lines).
- Risk: manifest or digest pins and Public contract. `route_proposal.d.ts` and `traversal.d.ts` are in 48 contract rows and `hog/index.d.ts` in 50; the function is a `./hog` package export.
- Change class: realization_refactor
- Confidence: verified dead in source and tests by census. The package-export removal needs the same closure ruling as the previous entry.

### Move product-specific leaf dispatch out of hog/ccall_lifecycle
- Category: second owner / structure
- Evidence (read):
  - `hog/ccall_lifecycle.ts` imports product identities: `:1`, `:3-4`, `:15-17`, `:45-52` (`GOVERNANCE_IMPLEMENTATION_REFS`, native workspace work, worksite forward, preparation, revision, construction recovery, worksite effect).
  - `receivesCommandAmbientEnvironment` (`:78-81`) is a list of product implementation refs.
  - `worksiteLeafAuthority` (`:142-215`) builds worksite authority inside HoG.
  - `evaluateOwnedExecutableCCall` (`:399-837`, about 440 lines) branches on these.
  - HoG's role is to traverse and propose. Product meaning belongs to the product and implementation owners behind the leaf port.
- Retire: a product-owned leaf-authority hook on `LeafInvocationPort` (`implementation/leaf_invocation_port.ts` already constructs `constructLeafExecutionAuthority`). HoG calls it without naming product refs.
- Size: L (design decision on the port and about 250 lines moved).
- Risk: none for replay digests, if the authority bytes are unchanged; this needs a writer probe as at C-15.
- Change class: design_reframe
- Confidence: likely. Reading shows the imports and the branches; the port shape needs a design.

### Settle whether the gate relation has runtime meaning
- Category: failed or unfinished feature, if the specification gives gate a runtime meaning (cross-area: GTL and validator own it)
- Evidence:
  - `grep -w gate hog/` finds nothing.
  - Runtime relation dispatch, counted over `abg/` and `hog/` (`relationKind ===`/`case`), covers only `recurse`, `fan_out`, `re_enter` and `fan_in`.
  - `gate` has a schema (`gtl/serialization_contracts.ts:120`), a type (`gtl/contracts.ts:33`), a constructor `gateApplication` (`gtl/graph_applications.ts:219`, tier `package`, `testFiles` 2, no source caller) and validator rules (`validator/validation.ts:405`, `:1198`, `:1241-1290`). The validator ties evaluate leaves to it by `compositionRef`.
  - At runtime `compositionRef` is read only for `recurse` (`graph_execute.ts:237`, `:1062`), so a gate-attached leaf runs as an ordinary `c_of`. Gate has no runtime owner of its own.
  - Two readings remain open:
    - Gate may be a validated topology assertion: evaluate-stage leaves plus exactly one workflow target equal to `targetRef`. Ordinary leaf judgment and routing would then carry it out, and it is not debt.
    - Or gate is meant to decide whether the target runs, and that meaning is missing.
  - Not in the same class:
    - `compose`, `substitute` and `promote` are consumed at construction (`gtl/graph_construction.ts`).
    - `registered_selection` executes through ABG and `route_proposal.ts:4`.
    - `identity` and `same_object` were not traced.
- Retire:
  - If gate is an assertion: nothing; record it as such.
  - If it lacks meaning: either specify it (HoG proposes a gate route, ABG admits it) or retire the schema, constructor and validator rules.
- Size: L (a specification decision).
- Risk: Public contract. `GateApplication` is in the GTL contract types, and published module publications may carry gate rows.
- Change class: chosen by the outcome. design_reframe if the specification defines a meaning the code lacks; product_reprice if the language feature is retired.
- Confidence: investigate. A specification read for gate semantics and a check of the published default library for gate rows settle it. Neither was done here.

### Split run_invocation and the two longest HoG functions where they repeat one sequence
- Category: structure (only where it blocks consolidation)
- Evidence (read):
  - **Four owners repeat one setup sequence.** `runInvocationOwner` (`run_invocation.ts:1250-1778`, 529 lines), `runCurrentIntentOwner` (`:1935-2009`), `runSelectedActionOwner` (`:2011-2079`) and `runPendingExecutionOwner` (`:2102-2173`) each repeat the same steps:
    - event-resource acquisition,
    - a `refuse` closure,
    - `projectSetupTruth`,
    - the authority prefix,
    - the duplicate-invocation check,
    - policy and grant,
    - the input-contract slot check (`sha256Canonical(inputContracts[0])` plus `canonicalEquals(slot.value, …)` at `:1979-1980`, `:2045-2046`, `:2146-2147`),
    - qualification resources and leaf-port construction.
  - **Two root-preparation compositions.** The root preparation at `:1442-1590` (materialize, `validateGraph`, `admitExecutionBasis`, `openTraversalScope`) mirrors `hog/child_traversal.ts:154-302` (materialize, `validateGraph`, `admitChildExecutionBasis`, `openTraversalScope`).
  - **Long HoG functions.** `completeOwnedWorkflowLocus` (`workflow_lifecycle.ts:539-1127`, about 590 lines) and `evaluateOwnedExecutableCCall` (above).
  - **Imports in the middle of files.** `workflow_lifecycle.ts:124-126`, `recursion_lifecycle.ts:129-131`, `run_invocation.ts:1780-1791` and `:2342` hide the dependency surface.
  - **Where the file belongs.** `run_invocation.ts` is imported only by `product/index.ts` (`modules.json`). It is runtime-reachable because `RUN_DEFINITION_BINDINGS` is one of the fourteen definition bindings. It is a product-owned binding of ABG, GTL, validator and HoG owners and belongs under `product/`, beside `run_invocation_operation.ts`, not in a separate `owner_bindings/` directory of one file.
- Retire:
  - One shared run-operation prelude used by the four owners.
  - One traversal-preparation composition (root or child) beside `hog/child_traversal.ts`.
  - Move the file to `product/` after the schema entry above.
- Size: L (about 300 lines collapse; spans product and HoG).
- Risk: manifest or digest pins (`run_invocation.d.ts` is in 48 rows if exported types move).
- Change class: realization_refactor
- Confidence: likely. Line ranges and repetition are verified; the shared prelude's shape is a design choice.

### Validate the capability definition graph once per graph, not per call
- Category: performance (structural)
- Evidence (read):
  - `shared/capability_contracts.ts:407` `isCapabilityDefinitionGraph` reconstructs and compares the graph on each call.
  - Its sort comparator serializes with `canonicalJson` inside the comparison (`:366-369`), which costs O(n log n) serializations.
  - Callers include `product/invocation.ts:734` (`selectedCapabilityOwner`, called at `:906` and `:973`) and `product/verify_product.ts:795`, `:867`, `:879` and `:2454`.
- Retire: a WeakSet brand on validated graphs in the capability owner, and a key-then-compare sort.
- Size: S (about 30 lines).
- Risk: none.
- Change class: realization_refactor
- Confidence: likely. Reading only; a call count on one install lane settles the size.

### Consolidate the shared Public contract vocabulary and drop its residue
- Category: second owner / dead code
- Evidence (read plus grep):
  - **Three owners of one slot set.** `shared/public_function_contracts.ts:63` `PublicAuthoritySlot` and `:78` `PUBLIC_AUTHORITY_SLOTS` (no reader) restate `InvocationAuthoritySlotName` (`shared/public_invocation.ts:86`) and `AUTHORITY_SLOTS` (`public/binding/public_function_projections.ts:30`).
  - **Coordinate map inlines the slots shape.** `CompleteDefinitionContractCoordinateMap` (`:455`) writes the slots shape out inline.
  - **Repeated return type.** `ownerContractPacket` (`:547-628`) repeats a 20-line return type twice (clone `:562`/`:608`).
  - **Dead declarations.** `noResidualsSchema` `:231` and `OwnerContractSchemas` `:476` have no reader.
  - **Residue kinds.** `PublicAdapterProfile` `:39` is the only site of the kinds `terminal_only`/`runtime_nonterminal`. It was introduced at `39a714d43` (2026-08-13, "d2: preserve effect translation failure surface"), and nothing produces or reads it.
  - **Cloned schemas.** `externalRelationOriginSchema`/`externalSelectionSchema` (`:258-289`) are cloned in `product/environment_operation_contracts.ts:106-137`.
  - **Redefined digest schema.** `digestSchema` is redefined at `shared/capability_contracts.ts:166`.
- Retire:
  - The slot set stays in `public_invocation.ts` and the other two derive from it.
  - Delete `PUBLIC_AUTHORITY_SLOTS`, `PublicAdapterProfile`, `noResidualsSchema` and `OwnerContractSchemas`.
  - The product contracts import the two external schemas.
  - `capability_contracts.ts` imports `digestSchema`.
  - Name the packet return type once.
- Size: M (about 120 lines).
- Risk: manifest or digest pins and Public contract. `public_function_contracts.d.ts` and `public_invocation.d.ts` are in 50 contract rows each.
- Change class: realization_refactor
- Confidence: verified for no reader. The six package-only types in `public_invocation.ts` (`DefinitionContractCoordinateSet` `:65`, `InvocationAuthorityCandidateSlots` `:234`, `InvocationAuthorityCandidate` `:240`, `UnselectedPublicInvocationRequestCandidate` `:247`, `PublicInvocationRequestCandidate` `:253`, `BoundPublicOwnerPort` `:286`) have no source reader. They are published declarations of the Public package, so investigate whether a consumer contract or design names them before deleting.

### Adopt or drop the unadopted shared Outcome atoms
- Category: design and specification
- Evidence: an import grep shows nothing imports these four from their modules:
  - `refused` (`shared/refusal.ts:22`) and `andThen` (`:33`). The whole-word grep for `refused` is noise from string literals.
  - `selectRefusal` (`shared/select/exact_match.ts:57`) and `exactMatchOutcome` (`:68`).
  - The common-library design declares them (library design `:96-100`, `:145`, `:266-267`, `:608`, `:690`; binding `:88`, `:177`).
- Retire: either adopt them at the hand-built refusal sites or delete them and their design sentences.
- Size: S (about 30 lines plus design text).
- Risk: manifest or digest pins (`refusal.d.ts` is in 48 rows).
- Change class: design_reframe (the design names them)
- Confidence: verified unused.

### Keep one nonblank-string predicate
- Category: second owner
- Evidence (read):
  - `shared/admission_predicates.ts:17` `isNonblankString`, `shared/references.ts:1` `isNonBlankRef` and the body of `shared/admit/contract.ts:42` `admitRef` are the same rule.
  - `shared/operation_definition_coordinate.ts:30` and `:81` inline the record check that `shared/admit` exports.
- Retire: one predicate in `admission_predicates.ts`; the others re-export or call it.
- Size: S (about 15 lines).
- Risk: none.
- Change class: realization_refactor
- Confidence: verified.

### Delete the orphan shared barrel
- Category: dead code
- Evidence: `shared/index.ts` (16 lines) has `importedBy` `[]` and `reachRuntime`/`reachPackage` false (`modules.json`). `package.json` has no `./shared` export, and grep finds no importer. Its `.d.ts` is in `productRelativeLocators` only (1 entry).
- Retire: the file.
- Size: S.
- Risk: manifest or digest pins (one locator).
- Change class: realization_refactor
- Confidence: verified.

### Merge the duplicate prefix helpers in hog/operator_support
- Category: second owner
- Evidence (read): `hog/operator_support.ts:37` `runtimePrefixAtDurable` and `:134` `ownedRuntimePrefixAtDurable` have identical bodies. Callers alias the owned one (`structural_transition.ts:24`, `workflow_lifecycle.ts:33`, `recursion_lifecycle.ts:47`).
- Retire: one helper.
- Size: S.
- Risk: manifest or digest pins (`operator_support.d.ts` is in 48 rows if the exported name goes).
- Change class: realization_refactor
- Confidence: verified.

### Compiler-unused in this area (one entry)
- Category: dead code
- Evidence: `compiler-unused.json`:
  - `hog/route_proposal.ts:200`: `boundInput` of `proposeStructuralRoute`.
  - `:1043-1044`: `boundInput` and `definitionDigests` of `proposeFanOutRoute`. Its only caller (`workflow_lifecycle.ts:1006-1018`) passes neither.
  - `shared/public_invocation.ts:9`: the type parameter `T` of `ReferenceDigest<T>`.
- Retire: the three parameters and their overload signatures (`:1030-1031`), and the type parameter.
- Size: S.
- Risk: manifest or digest pins. `route_proposal.d.ts` (48 rows) and `public_invocation.d.ts` (50 rows) change.
- Change class: realization_refactor
- Confidence: verified.

## Named checks

1. **Dead declarations.** These were confirmed and grouped by feature in the entries above: HoG public twins (two entries, split by manifest reach), F_H resume, shared Outcome atoms, the shared Public vocabulary residue and the orphan barrel. Refuted, with the use shown:
   - **Continuation population is live.** `populateRunContinuationAtDurablePrefix` and `RunContinuationSelectionIntent`, `RunContinuationPopulationRefusal`, `PopulatedRunContinuation`, `POPULATION_CONTINUATION_STAGES` and `runPopulationSelection` are consumed by `public/installed_public_definition_call.ts:598-640` (`constructInstalledPendingCall`, tier `package`, `testFiles` 6) through `product.` namespace use. The feature landed at `0a8d330a3` ("PARTIAL UNACCEPTED HC2 C3 custody after outer timeout", 2026-11-03) and is carried by the later accepted-source checkpoints `27c08ce59` (RC7) through `93a0de75a` (RC10). Acceptance is inferred from inclusion; no named acceptance was found.
   - **Test-only package exports, not dead.** `isRunInvocationResourceAssertion` (`testFiles` 7) and `capabilityDefinitionGraphCoordinate` (`testFiles` 17) are package exports reached by tests.
   - **Used by type.** `ExactOwnerOperationPort` is type-imported by twelve operation-contract modules.
   - **`hog/index.ts` is the `./hog` package export** (`package.json:32`), not dead, although the runtime never loads it.
   - **Public package API, owner's decision.** `executeGraphTraversal` (`testFiles` 19), `executeGraphTraversalEffect`, `ExecuteGraphTraversalResult` and `proposeTerminalRoute` (`testFiles` 1, no source caller) are `./hog` API. Retiring them is the same closure ruling as the in-closure twins entry.
   - **Live.** `projectParentSuspensions` (`parent_rehydration.ts:338`).
2. **Compiler-unused.** One entry above.
3. **Kinds never produced or never read:**
   - `resume_not_admitted` is residue of the F_H resume route.
   - `terminal_only`/`runtime_nonterminal` are residue of `PublicAdapterProfile` (D2 effect translation).
   - The `run_invocation.ts` never-read kinds (`setup_truth`, `resource_completion`, `product_prepare`, `graph_refusal_admission`, `open_refusal_admission`, `post_open_runtime_failure`, and the codes `admitted_setup_absent`, `source_result_absent`, `observation_basis_mismatch`, `validation_refused`) are external diagnostic output. They are emitted as `DefinitionExecutionFault.stage` (`:213-245`) or owner refusal codes (`projectOwnerRefusal`), so they are not debt.
4. **Second owners.** Entries above: run_invocation schemas (the largest), HoG raw event reads, the no-action set and graph-span parser, product dispatch in HoG, the Public slot set, external schemas, `digestSchema`, nonblank predicates, prefix helpers, plus the two ABG types re-declared in HoG (in the in-closure twins entry).
5. **Failed or superseded features.** F_H interaction resume, `PublicAdapterProfile`, the unadopted Outcome atoms and the HoG public-twin family. Gate is open: it may be an assertion and not a feature. No `m01`-`m05` or ticket-named modules are in the area.
6. **Structure.** One entry above. Nothing else blocks consolidation.
7. **Performance.** All structural: HoG held re-derivations (recursion, retry, per-step program hash, entry rehash) and per-call capability graph validation. No structuredClone or JSON round-trip copy is in the area (`grep -rn 'structuredClone\|JSON.parse(JSON.stringify' hog shared owner_bindings` is empty). No measurement attributes cost to these files.
8. **Coverage.** Table below.

Not checked: test-side behaviour (no runs), the GTL/validator semantics of `identity` and `same_object`, whether ABG's `openCCall` and child-basis admission re-run the closure-digest and input-hash checks HoG performs (inferred from parameters passed, not read), and `public/` consumers beyond the two named sites.

## Coverage

| File | Lines | How read | Findings |
|---|---:|---|---|
| hog/ccall_lifecycle.ts | 865 | full | product dispatch; in-closure twins; double hash `:202-203` |
| hog/child_traversal.ts | 302 | full | root/child preparation mirror (structure) |
| hog/entry.ts | 435 | full | entry rehash; projected-retry re-projection |
| hog/evaluation_frame.ts | 149 | full | locator-only twins (three types) |
| hog/graph_execute.ts | 1149 | full | per-step re-derivation callers; `./hog` API; double JSDoc `:1120-1121` |
| hog/index.ts | 69 | full | package barrel (refuted dead); F_H export |
| hog/interaction_lifecycle.ts | 229 | full | locator-only twin `holdInteraction`; rehash `:79` |
| hog/judgment.ts | 98 | full | none (public/internal overload pair, in-closure group) |
| hog/operator_support.ts | 140 | full | duplicate prefix helpers |
| hog/parent_rehydration.ts | 348 | full | cold rehydration, not debt; basis walk `:256` (investigate) |
| hog/recursion_lifecycle.ts | 1168 | full | 5 deferred derivations per step; raw event reads; locator-only twins and `complete` branch |
| hog/retry_lifecycle.ts | 750 | full | triple projection; in-closure twin |
| hog/route_proposal.ts | 1206 | full | no-action set and graph-span casts; `resume_not_admitted`; overload triples; compiler-unused |
| hog/structural_transition.ts | 305 | full | locator-only twin; retry input rehash |
| hog/traversal.ts | 823 | full | per-step program hash; self-compare; F_H carrier function |
| hog/traversal_completion.ts | 166 | full | in-closure twins; dead blocked-retry projection |
| hog/traversal_contract.ts | 145 | full | none |
| hog/traversal_failure.ts | 88 | full | none |
| hog/workflow_lifecycle.ts | 1147 | full | 590-line function; raw event reads; held re-checks; locator-only twins |
| owner_bindings/run_invocation.ts | 2342 | full | GTL/product/ABG schema second owner; four-owner repetition; placement |
| shared/admission_predicates.ts | 23 | full | nonblank predicate copy |
| shared/admit/contract.ts | 46 | full | nonblank predicate copy (`admitRef`) |
| shared/admit/index.ts | 3 | full | none |
| shared/admit/json.ts | 334 | full | none (TD-13/TD-16 closures not reopened) |
| shared/admit/record.ts | 25 | full | none |
| shared/admit/validate_refusal.ts | 17 | full | none |
| shared/canonical_json.ts | 67 | full | none (TD-15 not reopened) |
| shared/capability_contracts.ts | 460 | full | per-call graph validation; `digestSchema` copy |
| shared/digests.ts | 42 | full | none |
| shared/effect_definition.ts | 162 | full | none |
| shared/i_json.ts | 153 | full | none (TD-16 retained lift) |
| shared/immutable.ts | 26 | full | none |
| shared/index.ts | 16 | full | orphan barrel |
| shared/operation_definition_coordinate.ts | 110 | full | inline record check |
| shared/owned_process_lifetime.ts | 265 | full | none (retained shared process lifetime) |
| shared/owned_process_state.ts | 241 | full | none (markers `:160`, `:161`, `:191` benign) |
| shared/process/facts.ts | 75 | full | none |
| shared/process/index.ts | 19 | full | none |
| shared/public_function_contracts.ts | 795 | full | slot-set second owner; residue declarations; clones |
| shared/public_invocation.ts | 290 | full | six package-only published types (investigate); unused `T` |
| shared/references.ts | 10 | full | nonblank predicate copy |
| shared/refusal.ts | 38 | full | unadopted `refused`/`andThen` |
| shared/rooted_topology_partition.ts | 250 | full | none |
| shared/select/exact_match.ts | 77 | full | unadopted `selectRefusal`/`exactMatchOutcome` |
| shared/select/exact_record.ts | 77 | full | none |
| shared/select/index.ts | 14 | full | none |
| shared/value/equality.ts | 26 | full | none (no identity shortcut by design) |
| shared/value/index.ts | 13 | full | none |
| shared/value/record.ts | 54 | full | none |
