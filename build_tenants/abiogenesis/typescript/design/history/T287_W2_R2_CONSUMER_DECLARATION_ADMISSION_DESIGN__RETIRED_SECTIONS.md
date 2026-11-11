Cut from `build_tenants/abiogenesis/typescript/design/T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md` at commit `39d6cb975`, lines 151-177, verbatim.


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

One decisive proof uses a freshly installed ABI artifact and an independently authored test Program, with ABI source unavailable. The test fixture owns its publication, Program, contracts, schemas, ordinary leaf binding, implementation and expected output outside ABIogenesis production source and package. Declaration-only consumers may reuse genuinely generic published capabilities; a test solution is not an ABI-owned capability. This proves test declaration ownership and generic application validation through ordinary installed owner relations.

The installed path is: explicit external resolved authority -> installed grant producer -> actual `workspace.create#clean` and `workspace.open#open` -> verify both immutable artifacts -> resolve/install all declared Products -> bind exact A/W -> catalog admit/view -> construct and apply both node type and overlay -> `conformance.evaluate#gtl_program` -> existing `run.invoke#start` of the consumer Program -> admitted typed result -> fresh-process declared `project.read#run_result/#run_replay`. Pass full exported owner packets only to native constructors; send the closed data-only basis through the existing installed DefinitionCall/CLI route, whose fixed owner supplies its own full packet. No legacy RootPublicInvocation, private import, fixture grant/receipt or source-tree fallback is permitted. Derive the runtime policy from the actual reconstructed applications.

Retain exact artifact and fixture identities, external decision and constructed resources, setup receipts, application coordinates, conformance result, admitted result/event prefix and fresh read/replay equivalence; prove the immutable installs did not change. Reuse accepted B06 evidence for the existing CLI node-type/overlay routes, checking only affected owner/resource agreement on this successor. No all-56 positive matrix is required.

Deterministic negatives must cross one relation at a time: missing/denied approval, wrong actor/definition/request/root, missing or duplicate capability owner/dependency; phantom W on a forbidden definition and absent/crossed W on a bound one; missing/ambiguous/wrong-owner schema/declaration, invalid dialect/keyword/reference/value, wrong node/Program membership, copied validation from another value/target/view/prefix and changed contributor provenance; bare applications or an unrelated durable prefix at invocation. Show typed failure before the corresponding effect and unchanged event/install/workspace bytes where the operation has not been admitted. The fresh JSON positive serializes only the closed data basis, grants and existing operation resources, then invokes a fresh installed process whose fixed owner reattaches its native packet; require equal reconstructed grant/application coordinates. Crossed serialized definition/owner coordinates must fail before effect. Include two different neutral values under the same schema to exclude fixture identity selection.

## Disposition

The selected producer relations are decision-complete for this one schema-asset case and independent typed leaf. No unresolved new WHAT is proposed. Independent review and Executive acceptance precede source activation; implementation evidence remains unrun. Later one-start worksite construction/execution, serial C3 branching, general URI traversal, full Data Mapper, seven-scenario UAT, positive human continuation and release remain outside this child. Wave 2 and umbrella T-287/GOAL-035 remain active/HOLD under the sequence.
