# C3 finite retirement, consumer and proof map

Paths below are relative to `build_tenants/abiogenesis/typescript/code/src`.
Line numbers identify the frozen input, not the eventual successor. Exact bytes
are in [source-inputs.json](source-inputs.json). The four callable K04 entries
and K08 checked-record relation are defined in [the proposal](HOW-proposal.md).
Nothing in this map is executed evidence.

## Thirteen private singleton bodies

`R` means `resolveExactMatch(source, predicate)` plus common
`exactMatchValue`; `O` means common `onlyExactMatch(alreadySelected)`;
`C` means common `exactMatchCardinality(rows.length)` plus the exact owner
exception and original `rows[0]` result. Every R scan retains its current source,
predicate order and throw trace. Every O/C preserves preselected O(1) access;
neither rescans its array. No one/many policy is silently changed.

| ID | Body and actual callers | Retired computation -> common destination | Retained owner meaning / affected proof |
|---|---|---|---|
| H01 | `abg/worksite_command_forward.ts:33`; selected source/retained forward joins | Filter + singleton -> R | Exact source witnesses, command dispatch exclusion and native authority; forward owner controls. |
| H02 | `product/declaration_application.ts:83`; publication, verified Product, install, contribution, declaration, Program and schema selection | Count body -> C; a `require...` error projection may remain | Exact `CatalogApplicationConstructionError(code,message)` and selected reference; catalog-application positive and absent/many controls. |
| H03 | `abg/construction_continuation.ts:41`; Run/CCall/intent/continuation selections | Count body -> O | Latest terminal choice, continuation status, causal joins remain; continuation controls. |
| H04 | `abg/native_work_effect.ts:62`; five U1 supporting events | Kind filter/count/record/digest -> R + K08 check | Keys and raw/owned route, actual cause, scope/grants/causation and outer null catch; U1 controls. Also migrate selected implementation-row multiplicity. |
| H05 | `abg/project_read_ports.ts:223`; terminal/scope/ancestry/gap projections | Count body -> C; named terminal error projection may remain | Exact `TypeError("terminal projection requires one exact " + label)`, original reference and terminal contract; Public terminal controls. |
| H06 | `abg/c_call_outcome.ts:226`; `projectWorksiteSelectedOccurrence` basis/open/fibre/binding | Kind filter/count -> R | Prospective prefix is prior events plus supplied fibre; C0 grant/effect/causation remains; C0 occurrence controls. |
| H07 | `abg/native_worksite_execution.ts:20`; native source/result/currentness joins | Filter/count -> R | Native task applicability, owned value proof and currentness remain; native source/unknown-effect controls. |
| H08 | `abg/worksite_construction_recovery.ts:47`; admitted leaf and preserved recovery joins | Filter/count -> R | Native materialization, current acquisition and recovery evidence; recovery controls. |
| H09 | `abg/worksite_input_provenance.ts:40`; leaf result, C3 child, retained input, command/bridge sources | Scan/filter/count -> R; `successfulResult` additionally K08 | Whole scan or current indexed bucket stays unchanged; multi-fact provenance and value identity; retained/forward/U1 path. |
| H10 | `abg/qualification_proof.ts:57`; owner rows, proof resources, result/evidence/plan slots | Count body -> O | Qualification contracts and exact source selection remain; qualification contraction/scopes controls, not new qualification. |
| H11 | `abg/worksite_revision.ts:52`; native result, binding, observation/producer and implementation rows | Structural filter/count -> R; native result record checks additionally K08 | Four-selection and short-circuit order, revision matching/currentness and CCall validator remain; revision/forward controls. |
| H12 | `abg/native_work_reacquisition.ts:41`; native declarations, preserved predecessor/source joins | Structural filter/count -> R | Raw-versus-owned applicability, prerequisite physical acquisition and refusal reports remain; reacquisition/forward controls. |
| H13 | `abg/runtime_liveness.ts:42`; liveness context and supporting event selection | Scan/filter/count -> R | C1 owns lifecycle-law changes. C3 replaces selection only, preserving scope, probes and current context; liveness controls conjoined with C1. |

Nine bodies filter; four accept an already selected vector (H02/H03/H05/H10).
H02 and H05 deliberately retain different error construction. A generic silent
null would change those real callers' externally handled refusal paths. H03/H10
return null, including a sole null value if supplied; a sole undefined remains
undefined as before. Common K04 must not replace this with truthiness.

## Five existing common calls

| Current location | Count | Contract conserved |
|---|---:|---|
| `shared/definition_binding_mechanics.ts:122` | 1 | Definition predicate; `one.value`, otherwise null. |
| `product/execution_resolution.ts:280` | 1 | Exact selected declaration; `many -> ambiguous`, not absence. |
| `product/implementation_resolution.ts:323,612,635` | 3 | GraphFunction and implementation predicate/multiplicity and original match identity. |

They stay on the same `resolveExactMatch` implementation. The source census
distinguishes five call expressions from three consuming modules.

## Eight reviewed readers: actual contract and disposition

| Reader | Required contraction | Owner step retained; concrete distinguishing input/outcome and falsifier |
|---|---|---|
| `invocation_execution_truth::projectExactExecutionBasisAtPrefix` (614) | Replace index/filter/count body with K04. Raw-input record/digest check uses K08 with a narrowly scoped catch preserving current `canonicalRecordDigest` behavior; retire that now-single-use helper. | Raw-input hash failure maps to null while later basis-body encoding can throw; one universal catch changes this boundary. Basis-body preimage, self-ref, field equality and frozen carrier construction stay owner-defined. Falsifier: valid same-source basis, wrong raw digest, malformed raw record, malformed body, and exact original throw/null. |
| `invocation_execution_truth::projectExactInvocationAdmissionAtPrefix` (262) | Replace main exact selection with K04; retain current predicate and record check. | A singleton event with missing/foreign Public cause must fail even with matching payload digest. Public authority/grants/input/definition joins, optional historical catalog arrays and freezing remain. First-ID Public-cause lookup is not changed. Falsifier: same bytes with wrong Public cause/authority and optional-field legacy behavior. |
| `execution_basis::rehydrateAdmittedImplementationSetAtPrefix` (1278) | K04 exact selection; nested typed-record K08 with `digest: null` removes repeated record projection after exact selection without inventing a hash. The paired interaction-set reader repeats the same route and is included in this finite successor. | `implementationSets.add(set)` occurs before `hasAdmittedImplementationSetAtPrefix`; typed guard/WeakSet membership and owner content identity are not common reader work. Returning a record without registration changes `isAdmittedImplementationSet` behavior. Preserve operation order even for failed final validation. Same obligation for the existing interaction-set registry. |
| `traversal_route::projectAdmittedRoute` (757) | Reuse its already projected historical route; no new exact-one conversion. | Two matching raw `construction_intent_selected` or `run_stopped` rows choose the earlier eligible event. Returning many/null changes supported raw projection. Owner: traversal route. Falsifier: controlled ordered duplicate side events, including later equal/changed bodies; record the exact resulting refs. This route-specific case is additional to T288's CCall first-ID controls. |
| `replay::projectRunIdentityAtPrefix` (1869) | K04 for Run opening and causal root-basis multiplicity, preserving the existing `flatMap` then filter acquisition order. | Semantic Run digest, native Run digest and ExecutionBasis digest have different preimages. A generic URI/self-digest rule would reject or misidentify a valid Run. Keep typed-reference-path refusal and semantic digest construction. Falsifier: semantic/native digests differ on a valid opening; missing/duplicate/wrong-root support refuses as before. |
| `worksite_input_provenance::projectRetainedWorksiteInputAtPrefix` (265) | H09 and shared successful-Result record/value digest checks. | One valid Result from another CCall, scope or producer cannot substitute for the exact source/entry basis, Judgment, terminal and foldback. Shared value equality alone is insufficient. Keep construction/raw admission/output identity at this owner. Falsifier: equal-value foreign producer, duplicate true producer, missing closure/foldback, later invalidation. |
| `c_call::projectAdmittedCCallResultFromPhase` (1497) | Keep the already derived phase and exact global first-ID read; use existing owner `exactEventBody`. No new singleton reconstruction. | For a valid phase and supplied admitted Result, return the identical supplied object. A rebuilt frozen equivalent fails reference/owner identity. Earlier foreign shadow ID or later duplicate must retain T288's behavior. Falsifier: all 17 raw-shadow histories plus `returned === suppliedResult`; no new phase derivation. |
| `native_work_effect::projectNativeWorkUnknownEffectTask` (52) | H04 common exact selection and payload/digest checks; selected implementation row uses K04. | A matching payload with wrong scope/profile/cause, wrong binding hash, future support or unauthorized task cannot yield task scope. Retain authenticated task relation and source dependency selection. Falsifier: U1's existing missing/ambiguous/foreign/changed/late/substituted cases over owned/cold/prospective categories. |

No evidence supports the claim that all eight readers perform the same
scheme-self-reference check, freeze or cast. Therefore the checked-record
capability does not promise to manufacture every domain type from a schema
parameter. Complete owner schema consolidation is a separate unresolved
relation if needed during implementation, returned to Root rather than silently
classified as retained duplication.

## Proof obligations and proportional sequence

1. **Mechanical retirement and type boundary.** On the later exact candidate,
   check these thirteen definitions and the additional named exact-cardinality
   sites against the map: their selected local count algorithms are gone and
   their actual routes import common K04. Permit the two named error projections.
   Check all five existing common call sites still use K04. Compile arrays and
   `RuntimeEventBodyView` against the source contract without casts or whole-view
   materialization. Compile-negative unknown/lazy-view-as-JsonValue checks belong
   to the conjoined C2/C5 boundary. No global function-name ban or generic clone
   detector is selected.
2. **Small mechanical discriminator.** Zero, one, many; equal-looking duplicate
   occurrences; sole null/undefined; original identity and frozen-wrapper
   behavior. For arrays test a sparse hole, a predicate throwing after two
   matches, deletion/insertion during filter, and observed native callback
   arguments. Preserve evaluation of later matches. Preselected many must not
   read its elements before the H02/H05 error. For a transient view use the
   same ordered filter trace and prove no call to `materialize` is introduced.
3. **Checked record discriminator.** No project/hash calls for absent or many;
   malformed singleton -> invalid, distinct from absent; matching and mismatched
   digest; missing claimed digest; projector/encoder/expected callback throw
   identity; exactly one projection/hash; same event/value references; digest
   null performs none. Owners' return-null/throw mappings match their original
   cuts. Two malformed matches remain many before payload validation: do not
   filter malformed candidates away after selection to manufacture one.
4. **Actual owner composition first.** Reuse the U1 fixture and existing
   `t287-native-work-unknown-effect.test.mjs` path over actual indexed/owned,
   raw copied, cold reopened and prospective prefixes. Pair with provenance/
   revision controls for exact Result identity, missing/duplicate true producer,
   wrong scope/cause/grant and currentness. Reuse existing forward-command owner,
   generic revision and C0 controls; add only the missing branch/order cases.
   A forged/copy prefix must retain existing owner refusal; the helper cannot
   convert it into an owned prefix.
5. **Conservation at changed read owners.** Preserve basis raw/body error order,
   invocation Public-cause relation, set/interaction registry behavior, Run
   native/semantic identity and terminal error text. Reuse the exact T288 D08
   17-case shadow control artifact named by its closed review; add the two
   route-side ordered-first cases rather than claiming T288 already proves
   them. T288 D03/D04/D07/D08/D09 remain accepted, not reopened wholesale.
6. **Conjoined installed boundary.** Root selects the smallest affected
   installed/fresh proof on the one combined candidate after source/type and
   focused owner checks. U1 current-input selection must reach the existing
   C2/leaf/HoG consumer with the same permitted/refused input and replay truth.
   Preserve the held P1/P5/P4 plan; this design grants no run or paid call. No
   full-suite rerun, new native witness or repeated freeze review is automatic.

Planned incremental cost: one shared-mechanics/type lane, the existing U1 and
provenance/revision owner lanes, and bounded read-owner conservation cases.
Exact wall-time budgets and candidate/tool pins belong to Root's later execution
grant. Counts and source deletion are evidence of contraction only, not measured
CPU/memory growth, whole-path improvement, qualification or release acceptance.
