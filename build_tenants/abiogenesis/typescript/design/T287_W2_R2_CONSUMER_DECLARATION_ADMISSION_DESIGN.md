# T-287 W2-R2 Consumer Declaration Admission

Status: `W2-STEEL-02-I/R2-OBS-05`, Executive-selected bounded membership clarification during implementation; the complete successor awaits independent implementation review. The accepted predecessor HOW `193cdb1863486cac10387c5f3c6ac2c50af9d9cb363e2c64e1c21b5a81e27051` is retained in the implementation record. This child closes the two producer questions for one independent, zero-executable consumer case; the remaining parent HOW stays unratified.

## Basis and boundary

Exact worktree: ABIogenesis main `29846fc36c6a455e5aab642a5965a47fbfeb815d` plus the current dirty source set bound by the [original design subject](../../../../.ai-workspace/comments/codex/20260908_W2_STEEL_SEQUENCE/thread-02-design/subject.json); the [correction manifest](../../../../.ai-workspace/comments/codex/20260908_W2_STEEL_SEQUENCE/thread-02-design/correction-01/manifest.json) binds this successor and retains its preimage. Accepted basic-cli artifact `e51a7393523ecb00f1e069f8962f43dcaf6d6556d37511294680dbbd6fbec63d` remains historical immutable evidence.

Authority: fixed ABI 5.0 Product; REQ-P-PUBLIC-CONTRACTS-009..013; REQ-P-INSTALL-008/008A/043/049/052..054/059/060; REQ-P-CATALOG-008/014..018/022/029/030; REQ-R-ABG3-BINDING-006/016..018; the accepted R0/R1 and R2 routing in [the parent](./T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md#current-constructability-disposition). Frame: [project basis](./ABI5_PROJECT_REFERENCE_FRAME_BASIS.md), with RC6 Derived Worker, Design, Owner and Public Boundary constraints under manifest `bed7535a5feddc5e874993ff96d1f5f27e2a0fff63f366fc3b1fec3e301dd9e0`.

Preserve the 16 Product families, 18 operations and 56 definition keys. Existing owner packets retain their request/result/refusal schemas, metadata, native/SDK/CLI coordinates and event meanings. Public remains a thin fixed-definition transport. This design adds native resource preimages and pure owner constructors beneath those packets, not a Public operation, controller, authority store or credential system. GTL declares, HoG traverses, ABG alone admits runtime truth.

## Reached gaps and selected delta

| Current relation | Smallest selected replacement |
|---|---|
| `product/invocation.ts::CapabilityGrantConstructionBasis` requires W; `constructCapabilityGrant` supports only run/interaction/continuation/read | An admission-basis overload of the same grant constructor and verifier, sharing exact fixed-definition, installed capability-owner and dependency checks. Existing invocation/read branches remain unchanged. |
| Setup/catalog/conformance owners accept capability coordinates without reconstructing their authority basis | Each exercised fixed owner consumes complete admission grant preimages and verifies them before its existing operation. Common mechanics do not choose an operation or perform effects. |
| `CatalogApplicationResourceAssertion` cross-matches application/validation/contributor coordinates without their values | One ABI Product-owned pure application-resource constructor, reused by apply and runtime admission, derives these coordinates from verified declarations, schema assets, values and exact admitted artifact truth. |
| Runtime application admission reconstructs a digest over caller coordinates only | Reconstruct the complete backing application inputs against the declared durable prefix, then revalidate their relation to the current invocation basis before recording existing application refs/digests. |

## Non-circular authority construction

### External input and bootstrap

REQ-R-ABG3-BINDING-006 leaves authentication and authority resolution external. The installed caller supplies one explicit resolved trusted-developer decision: `actorRef`, `authorityMode: trusted_developer`, the resolved authority's ref/digest and full preimage, and an approval ref/digest with full decision preimage. The approval names exactly one definition, actor, canonical request digest and resource-scope digest. Its decision is `allow`; absence, denial or an unmatched scope cannot produce a grant. No wildcard definition, ambient cwd, package presence or later W supplies permission.

The resource scope contains the fixed definition ref/digest, request digest, immutable owner artifact/manifest/capability-graph coordinates, and the operation's existing target coordinates below. Its canonical digest excludes the resulting grant, invocation identity and result, making the construction acyclic. Approval/policy/authority refs identify the supplied external decision; their digests are recomputed from its canonical preimages. The existing grant's `scopeRef/scopeDigest` identify this exact scope. The approval is external input, not an ABI-created assertion that authentication occurred.

The trust boundary is the existing trusted desktop: a caller authorized to supply the externally resolved decision can supply that decision. Hashes detect crossing and inconsistent reconstruction; they do not authenticate a hostile same-user caller or replace external approval. Tests must retain an explicit external approval fixture as the authority input, then call the installed producer; they may not manufacture a grant or validation receipt and label it approval.

Before a ProductInstall exists, use the executing ABI package's immutable verified artifact, full owner packet, public-contract catalog and capability graph. Reuse `verifyProduct`'s pure installed-artifact verification and native-declaration evidence to reconstruct this basis. This inspection verifies the already installed operation owner; it is independent of the candidate artifact that `product.verify#verify` will examine. It creates no ProductInstall, workspace binding or ABG event. Do not accept a caller-claimed `VerifiedProductArtifact` without its verified bytes/evidence, or fabricate a future install to satisfy the old signature.

### Existing grant, extended basis

Keep `CapabilityGrant` unchanged. Add a discriminated admission basis alongside the existing invocation/read basis, and expose it through `product/index.ts` with the existing constructor/verifier. The native constructor basis contains the full `OwnerContractSourceDeclaration` as an installed module-static parameter plus the data basis. The serialized data basis is a closed I-JSON object containing only exact definition/owner coordinates, verified executing-owner artifact preimages, external decision/approval, request, operation resource scope, and (only for bound definitions) actual A/W, admitted installs/lock and explicit artifact-truth prefix. It excludes the full native packet and its schema functions. Define strict schemas for this data basis once and derive its types and installed resource parser from them. Never deserialize a native packet, accept caller schema functions, or type a partial coordinate object as a full `OwnerContractSourceDeclaration`.

The admission branch executes this pure algorithm:

1. Use the constructor's full installed module-static packet to resolve the one intrinsic definition and its exact request/result/refusal contracts. Match the serialized definition/owner coordinates to that packet; reject an operation/member or owner crossing. Coordinates do not reconstruct schema functions or select a caller-supplied packet.
2. Resolve every required capability from the verified executing owner's graph. Reuse the current `selectedCapabilityOwner` relation generalized to verified-owner or admitted-install evidence, retaining exact owning contract rows and dependency ref/digest closure. Missing, duplicate, ambiguous or crossed graph owners fail; do not select the first match.
3. Validate the external decision, actor and exact request/resource scope. Construct one existing `CapabilityGrant` for each metadata-required capability, with the existing canonical grant digest/ref algorithm. No undeclared capability or unused extra grant is admitted.
4. At the consuming fixed owner, parse the closed data basis and reattach that owner's own full installed module-static packet as the native constructor parameter. Reconstruct the grant and compare every field, then compare the exact set of grant coordinates with `invocationAuthority.slots.capability_grants`. Equal reconstructed data values are sufficient; no process-local brand, constructor identity or hidden registry is authority.
5. Enforce the fixed packet's binding requirement and operation-owned target relation before any directory creation, install write, binding event or runtime admission. A crossed native resource is refused before the operation port is called.

| Exercised definition(s) | Scope and owner checks |
|---|---|
| `workspace.create#clean`, `workspace.open#open` | W forbidden. Scope includes canonical target root and exact request; create uses `scaffoldPolicy: none`. Existing workspace owner checks root/manifest state. Open may project the existing unbound state. |
| `product.verify#verify` | W forbidden. Scope includes the candidate artifact's declared exact identity/digests and locator; executing-owner verification is a separate immutable input. Candidate verification remains the verification owner's work. |
| `product.resolve#resolve` | W forbidden. Scope includes the complete verified Product set, resolution request and native-closure evidence. Preserve all declared contributions and full native lock identity. |
| `product.install#install` | W forbidden. Scope includes exact verified artifact, resolved lock, target install root and existing event-resource authority. Only the existing install owner admits its event. |
| `workspace.bind#bind` | W forbidden on input. Scope includes actual workspace authority A, all admitted installs, lock and declared roots. The binding owner creates W from those inputs; no proposed W is a grant prerequisite. |
| `catalog.admit#admit`, `catalog.view#allowlist`, `catalog.apply#node_type/#overlay`, `conformance.evaluate#gtl_program` | Exactly one W. Reconstruct A/W and installs/lock from the explicit artifact truth using existing projections. Match actor, Product set, lock and any metadata-required catalog/view scope. Include the operation's request and complete immutable input coordinates in approval scope. |

Workspace creation/opening and A remain distinct existing carriers. A construction consumes the actual workspace result/manifest root plus the explicit resolved authority's workspace id, actor and authority-manifest preimage. Use `constructWorkspaceAuthorityBasis` unchanged: its four-field authority-manifest digest is not the `WorkspaceManifest` digest. The consuming bind owner checks the actual workspace root/manifest and external approval against A. Preserve A's complete identity and W's full roots/install/lock relation; no new mutable type information enters A or W.

The owner-local resource types gain one admission-authority member containing only the serialized data basis and grants; the full native packet never enters resources. Their existing operation-specific fields stay authoritative. `admitExactDefinitionCall` still checks common shape and fixed coordinates; each fixed owner supplies its own module-static packet to the shared grant checker, and no switch in Public chooses owner semantics. Existing run/read grant construction and policy admission continue to use their current A/W and InvocationPolicyBasis laws.

### Shared resource admission and owned derivation lifetime (T-287)

Fixed-owner structural resource parsing establishes closed shape, not an admitted environment.
It must not cold-reconstruct history or repeatedly validate full immutable owner
bodies merely because schema, grant and effect consumers are separate helpers.
The full serialized data basis, canonical scope/grant identities and external
approval meaning above remain unchanged.

For a bound reopened effect, the existing admission wrapper acquires its declared
ABG resource once and passes that exact native acquisition to the existing effect
owner. It establishes the supplied environment relation against that acquired
entry prefix, then validates one shared Product owner/request/resource/approval
basis before constructing the exact required grants. New/unbound resource creation
stays after authorization at its original effect owner. Read-only definitions and
standalone constructors retain cold source authentication when no acquisition is
supplied. A failed admission releases its acquisition without admitting an event;
only ordinary owner close issues the close handoff.

ABG's existing prefix derivation owner retains the immutable artifact projection
and workspace environment for their exact prefix and selected binding. Consumers
reuse these completed relations, including through qualification. A prefix or
binding change selects its own relation; raw/copy/closed-resource paths retain
physical authentication. This is disposable derivation, never a serializable proof
flag or independent registry. Retained wrappers stay private/immutable. Input
capture/detachment, closed shape/I-JSON, exact archive/executing-manifest equality,
actor/definition/contracts, approval/request/resource/grant scope, currentness and
pre-effect held ownership remain required. The effect owner still owns its
operation-specific relation, failure, append and close. No schema parse, equal
coordinate or process-local identity alone grants permission or admission.

The existing exported admission-data/resource schemas retain their direct cold
semantic contract (including release-artifact readers). Only fixed resource
owners use the internal structural preimage parser before consolidated admission;
that parser is not an alternative authority or publicly asserted success.

## Pure declaration application and value validation

### One producer and its exact inputs

Add `product/declaration_application.ts` as an internal Product module and export its pure `constructCatalogApplicationResources` through `product/index.ts`. It owns generic resource construction and reconstruction for the existing `DeclarationApplication`; it is not an operation port. Its input is the current catalog/view, selected contribution row and complete publication, exact admitted installs/lock/A/W artifact projection, explicit durable-prefix basis, target declaration preimage, and the application value with its exact published contract/schema assets. No actor or approval enters application identity.

For this bounded case, the consumer publishes JSON-only `ModulePublication` data, a reusable `ContractDeclaration` for each neutral type/application value, matching `schema_asset` rows in its existing flat public-contract catalog, URI-shaped node-type/overlay contribution handles and its own Program. The schema row's `contractId` equals the selected declaration's `contractRef`; `owningProduct`, contract version, asset locator/digest, publication and contribution-manifest membership resolve uniquely through the selected install/lock. No lookup by `kind` alone, URI spelling, package name, file extension or ABI fallback contract is permitted.

Target law uses current carriers: a node-type application targets one exact published GTL node in the selected Program's admitted declaration closure; its `targetRef` is that node's URI and its digest hashes that exact node value. An overlay application targets the selected published Program value and validates the supplied composition value against the selected overlay contract, including its declared membership. The outward overlay request/result retain `target: null`; the internal `DeclarationApplication` target is the exact Program ref/digest, never the contributor fallback currently used by `createApplyBinding`. A node-type declaration carries no callable Program membership; its target node must belong to the selected Program through the actual admitted GraphFunction contribution, Program callable membership and declaration closure. An overlay target must belong to its own contribution’s explicit `programMembershipRefs` and actual Program composition. Cross-owner references require their existing exact admitted dependency/compatibility relation.

The pair `declaration.contractRef : application.targetRef` expresses the bounded TypeRef/URI relation; `DeclarationApplication` conserves its catalog/view, declaration, target and applied-value coordinates. This is not a new URI-binding object or a mutable workspace map. Publication/application construction is pure; the relation becomes runtime-used truth only when the existing invocation owner revalidates and records its use. General traversal from unknown external URI values is outside this child.

### Deterministic construction

1. Reconstruct catalog/view from immutable inputs; resolve the exact contribution, selected declaration, target and schema closure. Confirm installed provenance/readiness and admitted Product/W basis. Preserve existing missing/ambiguous/incompatible owner outcomes.
2. Re-admit the declaration/value bytes as canonical I-JSON using existing raw-admission machinery, then validate the application value against its selected installed schema. Raw kind admission alone is not value validation. For an object-valued contract, its `kind` must also equal the declaration's `valueKind`.
3. Derive `applicationBasis` as `ref = application-value://abiogenesis/<digest>`, `digest = sha256Canonical(value)`. It is the existing `appliedValueRef/appliedValueDigest`, with the full value supplied in native resources. Do not hash an unrelated wrapper and call it the value.
4. Derive contributor provenance from the exact verified Product/descriptor/contribution-manifest/publication/row tuple, retaining the declaration owner's existing `provenanceRef`; its digest hashes that tuple. It is a deterministic projection of verified provenance, not a new contributor attestation.
5. Derive the validation receipt from a canonical body containing: selected existing catalog-apply owner authority coordinate and executing-owner manifest digest; exact schema rows and byte digests; declaration/target/value coordinates; catalog/view and A/W/install/lock coordinates; explicit artifact-truth prefix coordinate; successful validation disposition. Use `validation://abiogenesis/<body-digest>` as the existing receipt ref. This receipt reports that exact pure check; it grants no execution authority.
6. Invoke existing `applyCatalogDeclaration` using the exact target and value coordinates. Preserve its canonical `DeclarationApplication` body, ref/digest algorithm and outward apply result/evidence/provenance schemas.

`CatalogApplicationResourceAssertion` retains its existing fields and gains the complete construction input preimages. The installed apply owner runs this same constructor, compares all three supplied coordinates and the resulting application, and returns the existing owner output. Coordinate-only resources no longer pass. Native JSON reconstruction, including a fresh process, is equivalent to the original pure constructor result.

For `run.invoke`, carry these same backing inputs beside the existing `applications` list in `RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA`. `abg/invocation_admission.ts` reconstructs each application against its stated construction prefix and verifies that prefix and its install/W facts against the actual durable invocation prefix. An extended prefix is permitted only through existing exact-prefix/event-chain verification; substituting an unrelated prefix is not. Re-check the selected Program, catalog/view, full A/W, install/lock and contract closure under the current invocation basis. A changed basis needs newly valid inputs; do not rewrite the old receipt. Record only the existing invocation application refs/digests and existing runtime facts. Bare matching application coordinates or a locally branded receipt cannot bypass this check.

### Maintained schema foundation

Select **`ajv@8.20.0`**, `ajv/dist/2020.js`, for the single declared dialect `https://json-schema.org/draft/2020-12/schema`. Select **`ajv-formats@3.0.1`** as its standard format implementation, without custom keyword extensions. Pin both and their lock closure in the later implementation and include them in the existing bundled package machinery. Native owner packet schemas remain Valibot's source of truth; this validator consumes independently published JSON Schema assets, not a second authoring schema for Public.

Use an owner-local validator instance with `strict: true`, `allErrors: true`, `validateSchema: true`, `validateFormats: true`, `coerceTypes: false`, `useDefaults: false`, `removeAdditional: false`, `$data: false`; install formats in full mode with additional format-comparison keywords disabled. Preload only exact schema assets from the selected admitted closure. Require the selected `$schema`, canonical absolute `$id` equal to its contract identity, and exact resolution of every referenced resource/fragment. No network loader, ambient filesystem resolver, asynchronous schema, custom dialect/keyword or executable downstream hook is accepted. Unknown format/keyword, unsupported dialect, unresolved/ambiguous/cross-owner reference or compile failure is an existing unready/invalid validation outcome; it is never silently ignored. Standard annotation keywords remain annotations; this child does not claim content decoding or arbitrary vocabulary support.

Validation does not coerce or mutate values. Normalize diagnostics by instance path, schema path and keyword for deterministic evidence; receipt identity uses the admitted inputs and success, not library prose. Compiled validator functions are ephemeral mechanics over immutable schema bytes, not serialized Programs, runtime authority or a downstream executable semantics provider. The installed ABI owner remains responsible for selection, provenance, refusal and runtime revalidation.

Foundation selection under RC6 `DESIGN_MODULE_METHOD.md` STDO-UP-023 is bounded to this capability as of 2026-09-08. Current dependencies (`valibot@1.4.2`, `@valibot/to-json-schema@1.7.1`, `effect@3.22.1`, `jsonc-parser@3.3.1`) supply native parsing/projection/effects, not validation of arbitrary published schema assets; the language runtime supplies no such validator. The existing executable mini-Product hook cannot meet zero-executable admission. A custom partial schema evaluator fails the standard-semantics and proof-burden constraints.

The maintained external frontier examined was Ajv 8.20.0 plus formats 3.0.1 and Hyperjump JSON Schema 1.17.8. Both publish MIT-licensed implementations with 2020-12 support. Select Ajv's explicit per-instance synchronous validation and closed preloaded schema set for this owner; Hyperjump's documented schema registration and automatic URI retrieval would require additional retrieval/global-registry containment here. This is a task-specific fit decision, not a universal dominance claim. Package size/performance and absence of security defects are not inferred; implementation must verify the exact lock, installed import and offline fixture. No measured runtime budget or hostile-schema service claim is made. Replacement remains confined to the internal validator function and affected evidence.

Primary foundation evidence: [Ajv 8.20.0 package](https://raw.githubusercontent.com/ajv-validator/ajv/v8.20.0/package.json), [options](https://ajv.js.org/options.html), [strict behavior](https://ajv.js.org/strict-mode.html), [2020-12 support](https://ajv.js.org/json-schema.html), [formats 3.0.1 package](https://raw.githubusercontent.com/ajv-validator/ajv-formats/v3.0.1/package.json), [Hyperjump 1.17.8 API](https://github.com/hyperjump-io/json-schema/blob/v1.17.8/README.md). Exact versions were checked against official registry metadata; no dependency was installed during this design activation.

## Refusal ownership and effect boundary

Malformed or crossed native authority/resource carriers use the existing `DefinitionExecutionFault` call/resource-admission stages and existing identity/resource mismatch codes before effects. Capability construction throws the existing constructor `TypeError` class on an invalid basis; the fixed owner maps it to resource admission. No new semantic Public refusal code is selected.

For validly shaped application requests, preserve the existing catalog-apply partition: wrong kind -> `kind_mismatch`; crossed catalog/view -> `view_mismatch`; missing/ambiguous/unready declaration or schema closure -> `unready`; wrong target or membership -> `target_mismatch`; schema-invalid value or mismatched value coordinate -> `application_mismatch`; treating node type/overlay as callable -> `callability_mismatch`; copied/changed validation receipt -> `invalid_validation_receipt`; wrong or mismatched contributor owner/provenance -> `invalid_contributor`. Structural request/resource disagreement remains a resource fault. Run-time failure to reconstruct application use stays in the existing invocation-admission refusal path. No failed check creates install/binding/run events, worker work or an application store.

## Implementation cut and source-blind proof

The later bounded source grant should name only these seams (paths under `code/src`):

| Seam | Proposed files |
|---|---|
| Admission grant overload, shared graph/owner checks and exported constructors | `product/invocation.ts`, `product/index.ts`; if extracted, one `product/admission_authority.ts` internal module |
| Existing fixed setup owners consume authority before effects | `product/{workspace,verification,environment,install}_definition_bindings.ts` |
| Application construction/schema validation and fixed catalog owner | new `product/declaration_application.ts`, `product/catalog_definition_bindings.ts` |
| Bound conformance grant check | `validator/conformance_definition_bindings.ts` |
| Complete application inputs reach existing invocation admission | `owner_bindings/run_invocation.ts`, `abg/invocation_admission.ts` |
| Foundation packaging | tenant `package.json` and existing lock; generated assets only through the established isolated build |

Reuse `environment.ts`, `catalog.ts`, `declaration_closure.ts`, raw admission, capability contracts and exact artifact projections. Their Product algorithms are not redesigned by this child. Any required edit beyond these named seams returns with the observed relation; the table is not a source grant. No change to Public operations/contracts/CLI transport, runtime traversal, source/C0/C1/C2/C3 semantics, store/event schema or Product requirements is selected.

One decisive proof uses a freshly installed ABI artifact and a separate zero-executable neutral consumer artifact, with ABI source unavailable. Extend the JSON-only `prepareOddGlcDataProduct` pattern in `test_env/support/developer-mini-product.mjs`: consumer owns distinct Product/descriptor/provenance/publication/contract/schema/type/URI/overlay/Program identities and has no native semantics export. Reuse the ABI-owned typed Hello leaf via the current exact installed semantic-owner dependency; do not copy the executable `prepareDeveloperMiniProduct` provider. This proves consumer declaration ownership and generic application validation; it does not claim arbitrary new runtime input/result semantics.

The installed path is: explicit external resolved authority -> installed grant producer -> actual `workspace.create#clean` and `workspace.open#open` -> verify both immutable artifacts -> resolve/install all declared Products -> bind exact A/W -> catalog admit/view -> construct and apply both node type and overlay -> `conformance.evaluate#gtl_program` -> existing `run.invoke#start` of the consumer Program -> admitted typed result -> fresh-process declared `project.read#run_result/#run_replay`. Pass full exported owner packets only to native constructors; send the closed data-only basis through the existing installed DefinitionCall/CLI route, whose fixed owner supplies its own full packet. No legacy RootPublicInvocation, private import, fixture grant/receipt or source-tree fallback is permitted. Derive the runtime policy from the actual reconstructed applications.

Retain exact artifact and fixture identities, external decision and constructed resources, setup receipts, application coordinates, conformance result, admitted result/event prefix and fresh read/replay equivalence; prove the immutable installs did not change. Reuse accepted B06 evidence for the existing CLI node-type/overlay routes, checking only affected owner/resource agreement on this successor. No all-56 positive matrix is required.

Deterministic negatives must cross one relation at a time: missing/denied approval, wrong actor/definition/request/root, missing or duplicate capability owner/dependency; phantom W on a forbidden definition and absent/crossed W on a bound one; missing/ambiguous/wrong-owner schema/declaration, invalid dialect/keyword/reference/value, wrong node/Program membership, copied validation from another value/target/view/prefix and changed contributor provenance; bare applications or an unrelated durable prefix at invocation. Show typed failure before the corresponding effect and unchanged event/install/workspace bytes where the operation has not been admitted. The fresh JSON positive serializes only the closed data basis, grants and existing operation resources, then invokes a fresh installed process whose fixed owner reattaches its native packet; require equal reconstructed grant/application coordinates. Crossed serialized definition/owner coordinates must fail before effect. Include two different neutral values under the same schema to exclude fixture identity selection.

## Disposition

The selected producer relations are decision-complete for this one schema-asset case and independent typed leaf. No unresolved new WHAT is proposed. Independent review and Executive acceptance precede source activation; implementation evidence remains unrun. Later one-start worksite construction/execution, serial C3 branching, general URI traversal, full Data Mapper, seven-scenario UAT, positive human continuation and release remain outside this child. Wave 2 and umbrella T-287/GOAL-035 remain active/HOLD under the sequence.
