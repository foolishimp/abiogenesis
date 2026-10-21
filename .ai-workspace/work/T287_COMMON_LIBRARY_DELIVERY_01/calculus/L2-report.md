# L2 computational/domain selection

**Role and result:** bounded Worker/Writer report, candidate ready for Executive conjunction and independent design assessment. No implementation or executed outcome is claimed. [Activation](activation.md) and [exact shared basis](../basis.json) bind the subject; source hashes, including pre-existing dirty bytes, are preserved in the accompanying readiness record.

**A → Z:** the accepted common capability design and delivery plan become a finite implementation contract: D02–D04 contractions, concrete E01/E02 retention decisions, existing K01–K11 consumption, and the owner-selected standalone STDO 3 specialization. L2-E effects/foundations and L2-P installed proof remain separately assigned predicates. This report does not absorb their unclosed results or close the combined L2 frontier.

## 1. Authority and selection

[Product's prerequisite](../../../../specification/PRODUCT.md#common-computational-library-prerequisite), [the active delivery contract](../../../tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#common-computational-library-deliverable), [the project frame](../../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md) and [the accepted library design](../../../../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md) select usable shared computations, actual consumer adoption and retirement or justification of equivalent responsibilities. They do not select a new runtime, registry, package or interpreter. All fifteen retained Product families remain in scope at their existing owners; a small initial contraction does not redefine Product completeness.

The exact method is STDO 3.0.0 RC1, manifest `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`. DESIGN_MODULE's typed closed operations, whole-family Prime and decision-complete design obligations apply. SPEC_METHOD §11 binds requirements to the existing computational calculus and execution environment. Existing GTL seven constructors, owner ports, three static binders and admitted Effect 3.22.1 are the selected machinery. No new categorical representation or proof of universal minimality is claimed.

Concrete selection:

1. D02 removes three identical private equality implementations from two Product binding modules.
2. D03 retires two independent finite filtering/cardinality implementations, preserving their two owner projections through existing `resolveExactMatch`.
3. D04 removes two private exact-key algorithms on their actual supported domains; it does not replace any NUL-joined relation.
4. E01 closes by retaining every existing NUL-joined caller and its domain; E02 closes by retaining the existing distinct equalities and exact owner closure/reuse mechanisms, with no wider equality, solver or cache construction.
5. K11 adds a bounded correction to the **current public** STDO specialization: standalone exact STDO source may be declared without unselected companions. Existing generic schema, acquisition, evidence, native context and owner admission are reused.

The implementation set is six existing production files for D02–D04 plus `gtl/stdo_run_environment.ts` for the K11 specialization. Direct imports and the source-owned modules form the library. No new library facade, callable export, generic result enum or primitive is needed. Proof additions and the current installed consumer data are a separate finite support set to be conjoined with L2-P before implementation.

## 2. D02: equality consumer and retirement set

The shared destination is [definition_binding_mechanics.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/definition_binding_mechanics.ts): `sameJson` at line 42 and `sameCoordinate` at line 50. Both target Product files already import this module for exact call admission, so additional named imports introduce no new dependency direction.

| Source / local callable | Exact current direct consumers | Selected change |
|---|---|---|
| [environment_definition_bindings.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/environment_definition_bindings.ts), `sameJson`, line 128 | `validateResolveResources`: lines 252,264; `projectResolutionSuccess`: 415; `validateBindResources`: 547,572,579,581; `bind` owner result comparison: 783. Eight calls. | Import shared `sameJson`; delete this local function. Preserve every predicate position and owner refusal/fault. |
| Same module, `sameCoordinate`, line 136 | `invalidVerifiedPreimage`: 230; `validateBindResources`: 575,580. Three calls. | Import shared `sameCoordinate`; delete this local function. |
| [verification_definition_bindings.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/verification_definition_bindings.ts), `sameCoordinate`, line 92 | `artifactMatchesRequest`: 101–104; `admitResources`: 141,144,145; `projectOwnerOutput`: 264. Eight calls. | Import shared `sameCoordinate`; delete this local function. |

The file's Product `resolve`/`bind` and `verify` owners, invocation admission, contract schemas, receipt checks, preimage checks and filesystem operations remain in place. Equality does not authenticate an install, proof, authority or publication.

**Exact relation.** All three private bodies use the same computations as their shared destination. `sameJson` calls `canonicalJson` on both values in order and returns text equality; an encoding exception returns `false`. There is no identity shortcut: an object compared with itself can still fail canonical encoding. `sameCoordinate` compares both `ref` and `digest` with strict equality; equal refs with different digests and equal digests with different refs both fail. It does not catch property access faults or coerce a coordinate.

**Preservation population.** Equal ordinary values with differently inserted keys; changed nested values/order; admitted negative zero; source-supported sparse-array behavior; unsafe/non-finite/unsupported values at their existing encoding boundary; encoder throw; same object with invalid contents; each one-coordinate mismatch; actual equal and crossed environment/verification resource preimages. Preserve error/refusal precedence because the call locations do not move. Do not add a preliminary I-JSON normalization that narrows existing caller domains.

**Retain distinct.** [HoG `sameCanonical`](../../../../build_tenants/abiogenesis/typescript/code/src/hog/operator_support.ts) compares canonical digests, not canonical text. Native owner identity/deep-strict equality and currentness comparisons retain their own contracts. They are neither retirement targets nor generalized into `sameJson`.

Source proof routes include [static binding algebra](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-w2-05-static-binding-algebra.test.mjs) (native preimage, preparation/resolution and changed-module cases), [install/catalog owner chain](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-w2-05-install-catalog-owner-chain.test.mjs) and [owner reuse](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-conformance-owner-reuse.test.mjs). These files are existing executable support, not results run in this activity. L3 must retain actual owner tests in addition to comparator correspondence.

## 3. D03: exact selection and local projections

Use [product/exact_match.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/exact_match.ts)::`resolveExactMatch<T>(readonly T[], predicate) → absent | one(value) | many(values)`. It scans with `Array.filter`, retains matching sequence order, candidate references and duplicate occurrences, and freezes the wrapper/multiple-match array. It does not freeze candidate values. Predicate throws propagate.

| Source / callable | Current finite input and direct consumer set | Required owner projection |
|---|---|---|
| [execution_resolution.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/execution_resolution.ts)::`exact`, line 276 | `exactInstallForCoordinate` calls it at 317 (installId + productId); `exactInstallForPublication` at 327 (productId + content/manifest digests); `publicationForCoordinate` at 377 (module + owner + semantic publication digest). | `absent → {kind:"absent"}`; `one → {kind:"one",value}`; `many → {kind:"ambiguous"}`. Keep a thin private `exact` projection if useful to retain existing return types and callers; remove its private filtering/cardinality algorithm. Construct the same fresh owner result shape rather than leaking a new `many` result or changing private wrapper freezing. |
| [definition_binding_mechanics.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/definition_binding_mechanics.ts)::`selectedDefinition`, line 118 | `PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions`, predicate `sameJson(definition.definitionKey, packet.definitionKey)`; sole direct caller `admitExactDefinitionCall` at 336. | Exactly one value returns that definition; absent or many returns `null`. Preserve the predicate and full candidate family. Exact-call consumers then retain existing `null` refusal behavior. |

Existing [implementation_resolution.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/implementation_resolution.ts) already calls `resolveExactMatch` at 323,612,635. It is the unchanged common route. Importing this stateless leaf from shared definition mechanics creates no runtime registry or owner lookup; the leaf has no Product service or reverse import.

**Preservation population.** Empty, zero-match, one-match, multiple distinct matches, repeated references and distinct equal-looking matches; original candidate identity and order; a predicate that throws; same total scan and predicate call order on the supported finite array domain. A duplicate must remain ambiguous, even when a first-match or deduplication algorithm would look convenient. The selected Product predicates are unchanged, including semantic publication digest calculation and its fault boundary.

**Retirement boundary.** Retire two independent scan/cardinality bodies. Do not count a named owner projection as an unremoved competing algorithm. Do not replace `graphFunctionSemanticsOwner`, whose binding/provider relation is different, or [declaration_closure.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/declaration_closure.ts)::`locateRequired`: its all-matches versus reachable-matches distinction maps no eligible result to `absent` only if no matching declaration exists, otherwise `missing_dependency`. This is D05's retained owner decision.

[m5-s06-prime.test.mjs](../../../../build_tenants/abiogenesis/typescript/test_env/tests/m5-s06-prime.test.mjs), lines 161–179, already checks absent/one/multiple ordering and frozen result behavior. [Static declaration closure](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-static-declaration-closure.test.mjs) supplies unpublished/ambiguous/dependency/executable-owner cases; [selected execution closure](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-selected-execution-closure.test.mjs) covers foreign/historical/public refusal joins. A meaningful new D03 proof compares each old owner projection with the common route on these case classes and exercises actual owner selection; a helper-only green result is insufficient.

## 4. D04 and E01: exact key domains

The destination is [admission_predicates.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/admission_predicates.ts)::`hasExactKeys`. It compares sorted `Object.keys` against a sorted copy of expected keys with equal length and elementwise equality. It is shallow enumerable-own-string-key inspection, not member validation or authentication.

| Source / target | Proven correspondence domain and consumers | Owner outcome preserved |
|---|---|---|
| [rooted_topology_partition.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/rooted_topology_partition.ts)::private `hasExactKeys`, line 67 | `validateCanonicalRootedTopologyWitness` calls at 81 and112 after object/non-null/non-array guards. Expected arrays are the frozen sorted unique `WITNESS_KEYS` (7 names) and `SEGMENT_KEYS` (2 names). Sorting these constants is observationally inert. | Missing/extra names still yield `invalid_witness`; field validation, adjacency checking and all other partition refusal causes remain unchanged. Delete this private function and import the common one. |
| [event_body_encoding.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/event_body_encoding.ts)::private `exactKeys`, line 25 | `decodeEventBody` at 163 and164: unique constant lists `kind,codecVersion,event,bodyReference` and `sourceEventRef,sourcePayloadDigest,sourceSlot,bodyDigest`. Production ingress is JSON-parsed physical rows. | Malformed reference envelope still throws at the same owner check; version/slot/source/digest/canonical-value validation remains local. Delete private `exactKeys` and call common `hasExactKeys` at these two sites. |

The codec correspondence is explicitly **not** asserted for arbitrary JavaScript descriptor/proxy objects. For example, an ordinary object with a non-enumerable expected key and an enumerable unexpected key can satisfy the old equal-count plus `Object.hasOwn` test while failing exact enumerable-key comparison. This is a real counterexample outside the selected storage ingress; no universal equality proof is offered.

All **three** production calls to `decodeEventBody` are in [event_store.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts): full physical decode at 3324, selected-body acquisition at 3518, and cold descriptor decode at 3599. Each obtains its physical object using `JSON.parse` and requires canonical bytes before calling the codec. Parsed object members are enumerable own data properties; the constant expected lists are unique, so old count-plus-membership and exact-key comparison coincide on this ingress, including malformed ordinary JSON records. `decodeEventBody(unknown, …)` remains a storage parser boundary rather than a new arbitrary host-object contract. Proof must cover all three joins and preserve raw/v1/v2 and malformed-reference outcomes.

E01 is decided **retain**, not “replace later without a decision.” All current `hasNulJoinedKeys`, `hasUnicodeNulJoinedKeys`, `hasObjectUnicodeNulJoinedKeys`, `hasJsonNulJoinedKeys` and other NUL-joined variants/callers remain unchanged in this delivery. The existing alias `hasUnicodeNulJoinedKeys as hasExactKeys` in definition and environment bindings still denotes that legacy relation. `{"a\u0000b":0}` with expected `["a","b"]`, or `{}` with expected `[""]`, demonstrates why it is not exact-key equality. The consolidation does not certify either as equivalent. A future stricter acceptance set is an owning semantic change requiring affected caller proof, not another primitive required now.

[t288-admission-predicates.test.mjs](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t288-admission-predicates.test.mjs) preserves 93 recorded helper preimages and cases including NUL collisions, empty/duplicate keys, Unicode, descriptors, proxies and error/trace behavior. [Rooted topology tests](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-tv5-rooted-topology-partition.test.mjs) exercise deterministic detached/frozen output, path relations and closed refusals. [Event-body tests](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-event-body-encoding.test.mjs) exercise canonical golden bytes, all physical versions, missing/forward/foreign references, cold replay, failed/staged batches and large-body behavior. These are future L3/L4 proof routes; this report executed none.

## 5. E02: retain the existing exact owner mechanisms

E02 is closed for the selected consumers by these concrete choices:

| Potential wider extraction | Selected disposition and usable route | Counterexample that prevents a blanket merge |
|---|---|---|
| Universal value/identity equality | Retain exact text, digest, ref/digest pair and native owner identity/deep-strict relations separately; D02 only consolidates identical bodies. | Equal digest is not a proof of text identity; a stale physical observation can be structurally equal to a prior value without current support. |
| Generic dependency solver | No new solver. Use `resolveProgramDeclarationClosure` / `resolveExecutionDeclarationClosure` and keep reachable-owner membership in Product. | A matching declaration outside reachable dependencies is `missing_dependency`, not `absent`; a duplicate admitted owner cannot be silently selected. |
| Library-wide immutable cache | No new cache. Existing closure reuse is keyed by actual deeply frozen catalog/view objects plus exact Program/scope/GraphFunction. Keep call-local installed-module preparation. | A copied or mutable catalog/view is not the same authenticated/reusable support; a changed physical install cannot inherit previous acquisition by string coordinate alone. |
| Shared history reducer/current-state cache | Keep `RuntimeHistorySelection`, exact prefix derivation and Event Calculus/replay owners. | Prospective/rolled-back rows, another store/profile or wrong prefix cannot be reused as an admitted current result. |
| One “immutable” operation | Keep `deepFreeze`, `isDeeplyFrozen`, I-JSON detached capture and event owner capture distinct. | `deepFreeze` returns an already frozen shell without proving children frozen and retains aliases; detached admission and owner-authenticated truth are stronger different predicates. |

This is an explicit no-addition decision supported by existing consumers, not a claim that every possible future demand is solved. A newly selected consumer with a different equality, reachability, freshness or lifetime domain re-enters the owning decision before construction. No material dependency/foundation replacement is selected here, so no new package comparison is needed for D02–D04. E03/E04 candidate discovery belongs to the independent effects/foundations report.

## 6. K01–K11 usable routes

This finite table identifies actual mechanisms and representative real consumer joins. It does not claim exhaustive body inspection of all 264 production TypeScript files or that every family is qualified. The all-fifteen-family routing and V1–V7 population in the accepted design remain authoritative for allocation.

| Capability | Current common mechanism → actual consumer route | Required preserved relation / proof route |
|---|---|---|
| K01 admission | [i_json.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/i_json.ts), [admission_predicates.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/admission_predicates.ts) → raw/public/owner ingress; D04 witness and codec users | Typed admitted I-JSON versus shallow shape stay separate; retain error code, ordering and original accepted domain. `t288-admission-predicates`, `t287-json-value-definition`. |
| K02 bytes/digest/equality | [canonical_json.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/canonical_json.ts) → [digests.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/digests.ts), Event Store and source/context encoding; D02 Product users | Collected and streamed canonical bytes agree on admitted domain; synchronous sink failure may follow partial output. Existing event-body golden-byte and stream-hash cases. |
| K03 capture/immutability | [immutable.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/immutable.ts), I-JSON copy and event capture → declaration reuse, native detached input and Event Store | Mutating freeze, recursive inspection, detached value and admitted event are distinct. Existing static-binding native detachment and event-body input-capture cases. |
| K04 multiplicity | [exact_match.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/exact_match.ts) → implementation resolution, selected D03 execution/definition consumers | Preserve duplicates, identity, predicate exception and explicit owner projection. §§3 proof population. |
| K05 three static binders | [static_definition_bindings.ts](../../../../build_tenants/abiogenesis/typescript/code/src/shared/static_definition_bindings.ts) → `abg/witness_definition_bindings` static owner; `abg/project_read_definition_bindings` exact reads; `owner_bindings/run_invocation` exact transitions | Typed output/fault/effect/resource channels; one owner call; unchanged/successor/held receipt relations. Existing static-binding algebra; post-effect receipt/finalizer failure conserves actual successor. |
| K06 seven C / rooted partition | [c_algebra.ts](../../../../build_tenants/abiogenesis/typescript/code/src/gtl/c_algebra.ts), [materialize.ts](../../../../build_tenants/abiogenesis/typescript/code/src/gtl/materialize.ts), [source_path.ts](../../../../build_tenants/abiogenesis/typescript/code/src/gtl/source_path.ts); rooted partition → [retry.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/retry.ts) calls at 3988,5446,6002,6234 | Retain `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`, `C.batch`, `C.retry`; partition only canonical rooted paths with all five refusals. Do not generalize to causal DAG/route selection. |
| K07 declaration/executable resolution | [declaration_closure.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/declaration_closure.ts), execution/implementation resolution, [installed_module.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/installed_module.ts) → execution; `validator/conformance_definition_bindings`; `abg/project_read_ports`, `invocation_execution_truth`, `qualification_proof`, `worksite_command_forward` | Exact Program/view/owner/dependency; absent, ambiguous, wrong owner, missing dependency, catalog mismatch. Empty/multi-Program views remain legal; invocation selects one. Cold/immutable/copy/changed-install proofs remain required. |
| K08 history/current projection | [runtime_history.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/runtime_history.ts), [event_prefix.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/event_prefix.ts), [runtime_derivation.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/runtime_derivation.ts) → [event_calculus.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/event_calculus.ts)::`runtimePrefixComputation` at 2158; [replay.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/replay.ts) selected derivations | Authenticate selection; decode selected bodies; advance exact suffix; compare warm/cold; preserve rollback/profile invalidation. No feature-local runtime truth. `t287-exact-prefix-projection-reuse`. |
| K09 admission/resource lifetime | [event_store.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts), [definition_event_resource.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/definition_event_resource.ts) → installed run owner and exact project read/transition binders | Expected-prefix admission; acquired selection versus serializable assertion; held completion versus physical close. Physical failure or invalid receipt cannot erase an admitted successor. Independent L2-E/L2-P must bind actual lifecycle execution. |
| K10 physical body representation | [event_body_encoding.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/event_body_encoding.ts) → three Event Store decode joins in §4 and committed encode path | `basis_input`, `c_call_result_value`, typed `native_definition_material`; raw/v1/v2 restoration, inline/source authentication, pending versus committed eligibility. No semantic result cache; complete logical values survive. |
| K11 context/exchange | [stdo_run_environment.ts](../../../../build_tenants/abiogenesis/typescript/code/src/gtl/stdo_run_environment.ts) → Product acquisition → ABG evidence/admission → [instruction_assembly.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts) → [leaf_invocation_port.ts](../../../../build_tenants/abiogenesis/typescript/code/src/implementation/leaf_invocation_port.ts) | §7 selects standalone STDO3 consumer. Keep actual current input, exact role/source spans, native bounds and independent output meaning; transport success is not semantic acceptance. |

The library is the lower common realization basis. Default GraphFunctions remain Product-declared higher-level computations using it; their names are not new common computational primitives. No K classifier creates an automatic callable export.

## 7. Selected K11 STDO 3 specialization

### Current defect and minimal design

[Product STDO run-environment](../../../../specification/PRODUCT.md#stdo-governed-run-environment) and [REQ-L-GTL3-CONTEXT-008](../../../../specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md), together with ABG [binding](../../../../specification/requirements/abg/REQ-R-ABG3-BINDING.md) and [instruction assembly](../../../../specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md), require exact native source and only explicitly selected supplements.

The **current generic** `RUN_ENVIRONMENT_SCHEMA`, `isRunEnvironmentDeclaration`, `constructRunEnvironmentDeclaration`, Product observer and ABG evidence already permit `corpusAccess:null`, `accesses:[]`, role `accessRefs:[]` and `pythonPath:null`. Current runtime is not restricted to STDO 2.5. The historical `STDO_RUN_ENVIRONMENT_SCHEMA` and `isStdoRunEnvironmentDeclaration` retain their RC6/RC7 profile; `runEnvironmentForProgram` rejects that historical declaration/policy for current execution. Preserve those historical schemas and receipts.

The mismatching current public specialization is `constructStdoRunEnvironmentDeclaration` at `gtl/stdo_run_environment.ts:219–225`, exported through [gtl/index.ts](../../../../build_tenants/abiogenesis/typescript/code/src/gtl/index.ts). It currently demands non-null corpus access, representation/axiom dependencies and nonempty role accessRefs even for a native-source-only environment.

**Selected implementation contract:**

1. Keep the existing generic constructor as the validator/freezer and retain its returned object identity and existing TypeError boundary. No new data schema or version hardcoding.
2. Require at least one STDO source dependency whose `basisRef` has the existing exact `stdo://releases/<release>/` shape and whose `recordFormat` is `stdo_source_manifest@1`. Generic validation already requires unique dependencyRef and basisRef, exact member inventory digests, source/context correspondence and exact role spans. The release URI shape alone is not proof of installation or semantic sufficiency.
3. With `corpusAccess:null`, accept the generic empty-access declaration. Do not require representation, indexer, Python or tool-access refs. Actual source and permitted `read_context` acquisition remain mandatory.
4. With an explicitly selected non-null corpus, retain the current specialization checks: selected `sourceDependencyRef` identifies an STDO source dependency; representation and axiom refs identify explicit `release_record@1` dependencies; required role access refs remain nonempty. Generic selection/operation/span and Product/ABG physical-evidence checks remain intact. This bounded addition does not widen the supported corpus protocol or silently make a selected access optional.
5. Preserve the exported constructor name/signature and current generic Program policy `abg.run_environment`. No migration or reinterpretation of old Runs, old source bases or old installed receipts.

This is an at-least-one STDO source condition, not an exactly-one-dependency restriction. Additional explicitly declared source or other dependencies remain lawful under the existing generic contract. Their unique dependency/basis identities and each role's Context/source bindings disambiguate the supplied material; no ambient installation or arbitrary STDO label substitutes for an exact declared record, inventory and actual permitted source evidence.

The exact standalone consumer basis is `stdo://releases/v3.0.0-rc.1/`, manifest `sha256:069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`, with actual manifest-derived members and selected current source spans. This exact identity belongs to declared consumer data and proof; the generic public constructor need not hardcode that one release.

### Concrete current producer-to-consumer joins

1. A current installed consumer constructs a generic-shaped `RunEnvironmentDeclaration` through the public STDO specialization; publication supplies `runEnvironments` and Program `abg.run_environment` policy. Raw/Program validation retain existing identity/locus/role checks.
2. [product/run_invocation_operation.ts](../../../../build_tenants/abiogenesis/typescript/code/src/product/run_invocation_operation.ts):668 invokes [observeRunEnvironment](../../../../build_tenants/abiogenesis/typescript/code/src/product/stdo_environment.ts):313. Exact permission comparison precedes physical reads; the observer checks record bytes, declared members, Context bytes and source spans. Standalone requires `pythonPath:null`; output has `corpusDocuments:null` and no accesses.
3. Product preparation returns evidence; [owner_bindings/run_invocation.ts](../../../../build_tenants/abiogenesis/typescript/code/src/owner_bindings/run_invocation.ts):1396 passes it into ABG invocation admission. [invocation_admission.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/invocation_admission.ts):1548 applies `runEnvironmentEvidenceMatchesInvocation`.
4. [abg/stdo_environment.ts](../../../../build_tenants/abiogenesis/typescript/code/src/abg/stdo_environment.ts):292–350 validates declaration/evidence/authority and projects exact selected role spans from the admitted invocation prefix. Context bytes, span coordinates, role/frame/policy identity and permitted access disposition survive.
5. Native assembly consumes that role projection with the authenticated current execution/input. Existing `assemblyIdentity`, `renderInstructionSections`, `finishInstructionAssembly` compute bookkeeping after branch-owned selection. The prepared native exchange uses the existing leaf implementation and attributed output admission. Fresh read/replay recovers admitted evidence without pretending a new physical acquisition happened.

Current direct constructor consumers found in source are [support/native-registered-selection.mjs](../../../../build_tenants/abiogenesis/typescript/test_env/support/native-registered-selection.mjs):40 and [support/default-library.mjs](../../../../build_tenants/abiogenesis/typescript/test_env/support/default-library.mjs):51 using the current generic shape, plus historical `support/stdo-environment-pilot.mjs` and `support/declared-testing-capability.mjs` using the obsolete shape. The current native-selection helper selects STDO 2.5.1 plus explicit companions, and default-library support builds on it. Preserve those historical-basis proof utilities unless their precise new consumer is separately selected; do not silently retag their receipts. A new bounded standalone proof can reuse their current generic installed route while supplying separate STDO3 source-only declaration/resources. The legacy pilot is not the selected runtime path.

### Finite proof population and distinctions

Existing [management context tests](../../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-management-context.test.mjs):327–399 already construct a generic source-only environment, observe exact bytes without Python, reject crossed permission/changed spans, and project retained evidence after source unavailability. This supplies reusable proof structure, not actual installed STDO3/native evidence.

Required selected cases:

- Public constructor admits exact standalone STDO3; rejects a generic-only non-STDO dependency, missing STDO source, duplicate dependency identity, malformed source/context/member/span or nonempty accesses with null corpus under existing generic validation.
- An explicitly selected complete companion composition continues to satisfy the existing checks; missing/mismatched selected source/representation/tool/access cannot become optional because standalone mode exists.
- Actual Product observer rejects missing or changed required source, wrong manifest/member/span, crossed permission or a non-null Python path in standalone mode before dependent native dispatch. Unselected co-located files do not become dependencies.
- An actual supported installed `F_P` call receives exact STDO3 source spans, frames and policy in its native request. Record current producer/input rather than substituting graph entry data. Native output is attributed and admitted only through the existing owner path.
- Reopen/fresh public read reconstructs the same admitted environment and result; old source unavailability does not invalidate the historical byte evidence, but cannot justify fresh current acquisition. Mutated/crossed declaration/evidence/basis is refused.
- Native actor unavailability means the required native evaluation did not occur. Malformed output, timeout or semantic non-success retain their distinct actual owner/transport/method predicates. Successful access or envelope validation does not prove correct application of STDO.

The exact installed support file, actor profile, independent semantic oracle and run budget are the L2-P join. This report names the required current native boundary and refuses to substitute an F_D-only installed path for it. The source selection is closed; combined execution design remains pending Executive conjunction.

## 8. Retirement, proof order and limits

**Retirement ledger:** D02 deletes exactly three local functions; D03 deletes exactly two private filtering/cardinality bodies while retaining necessary owner projections; D04 deletes exactly two local exact-key bodies. K11 retires the unconditional companion requirement in the current public constructor's standalone branch, not the selected-companion protocol or historical profile. Existing common implementations remain the single destinations. No entire Product/ABG owner or test family is retired merely because its algorithm now imports a helper.

The finite realization order after independent L2 acceptance is:

1. Apply the six-file D02–D04 import/contraction set with the exact domains above; separately apply the one-file current STDO specialization and bounded standalone consumer/proof data.
2. Verify no retired algorithm remains reachable in selected consumers, no second helper/registry was introduced, and existing exported contracts, source-owned return/refusal shapes and predicate order are retained.
3. Execute focused value/domain correspondence and actual owner tests; run TypeScript/public contract checks against isolated build artifacts. Preserve dirty main-tree build files.
4. Execute the separately accepted installed/native proof with actual source/package identity, fresh read, negative/partial-effect discriminator, reuse/currentness and lifetime evidence. Counterexamples reopen the shared contract and all affected consumers.
5. Independently assess the exact combined candidate and executed obligations. Executive alone conjoins library delivery acceptance; general 5.0 release work remains waiting.

Algorithmic account: D02 reuses identical computations; D03 still makes one finite scan and materializes matches; D04 may sort a constant expected list; K11 removes an unselected dependency obligation without bypassing exact source acquisition. Informational account: output bytes, multiplicity, field domains, source identities, historical evidence and semantic owner decisions remain conserved. Computational account: record actual acquisition counts, bytes/canonicalization/hash work, match/path lengths, selected history bodies/suffixes, retained memory, native calls, wall/CPU and physical residue on the selected path. No latency/memory saving is inferred from deleted lines or fewer names.

Material residuals are the closed L2-E and L2-P decisions, their executable joins, independent L2 assessment, actual implementation, source/package correspondence, actual contraction, executed obligations and L5 acceptance. No whole-product Prime, exhaustive all-source conformance, native semantic success, performance improvement or release readiness is claimed. The report's mechanical source/link preservation checks cannot discharge those predicates.


## 9. Root-selected exact-key entrypoint amendment — 2026-10-21

Root dispositions the owner's common-entrypoint feedback as real inherited
K01/D04 naming/mechanics debt under accepted common design `cb8dae9f…1160b`.
The [bounded path/grant record](../realization/exact-key-canonical-entrypoints-01/path-grant.md)
and its preflight bind the exact sources, four legacy consumers and proof limits.
This amendment supersedes §4's retention of the misleading shared export name
only; E01's historical NUL-joined acceptance, collisions and caller domains remain.

- Delete two duplicate exact-key algorithm bodies: preserve the typed
  `hasExactJsonKeys` signature while delegating to existing
  `admission_predicates.hasExactKeys`; delete the private coordinate helper in
  `shared/operation_definition_coordinate.ts` and import the same common function.
  Source comparison establishes identical `Object.keys`/sort/spread/length/every
  operations and order after local identifier renaming. Existing guards, arguments,
  signatures, field checks and failures remain.
- Rename the import/use/export in `shared/definition_binding_mechanics.ts` from
  the misleading `hasExactKeys` alias to `hasUnicodeNulJoinedKeys`. Migrate exactly
  `validator/conformance_definition_bindings.ts` and
  `product/{catalog,install,project_read}_definition_bindings.ts` (nine calls).
  Remove the old shared export without a compatibility alias. This is the same
  NUL-joined function identity, never substitution with elementwise exact equality.
- Migrate the existing t288 module-identity assertion to the honest export and
  add explicit old-export absence. Keep its 93 historical preimages and all
  type/refinement/erased-value/error/trace cases unchanged. Other owner-local NUL
  aliases and unrelated consumers remain outside this amendment.

The debt ledger gains two algorithm deletions and one misleading export rename,
with shared destinations actually consumed. This resolves the selected feedback
through source contraction; it is no measured performance benefit or universal
canonicality claim. A forwarding call may add overhead. Only source/syntax/type-shape
correspondence is selected now; no test/build/typecheck/emission/runtime/Git
execution. Existing affected proof and semantic acceptance await the single
combined isolated candidate. Earlier frozen evidence and D1–D3 remain unchanged.
