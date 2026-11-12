# TD-25M Return: the `interaction.respond` operation and its five members

Writer: Claude Opus 5.5. Branch `claude/td25m-withdraw-respond-members` from
local `main` at `b13bdd5c2`, worktree `/private/tmp/abg-td25m`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag.

**Status: census committed; recorded history in progress.**

## 1. Census

All line numbers are at `b13bdd5c2`. The operation is
`abg.operation.interaction.respond`; its members are `select`, `approve`,
`reject`, `assess` and `answer_escalation`. The hold
(`admitFhInteractionOpen`, `admitOwnedFhInteractionHold`,
`hog/interaction_lifecycle.ts`), the blocked handoff and the four declared
event kinds with their schema are out of scope and are not listed.

### 1.1 Source (`T/code/src`)

| Site | What it holds | Planned action |
| --- | --- | --- |
| `product/interaction_operation_contracts.ts:24-33` | `INTERACTION_RESPONSE_KINDS` (exported), `InteractionResponseKind` | delete |
| `:35-36` | `INTERACTION_AUTHORITY` (`authority://abiogenesis/product/interaction-response@5`) | delete |
| `:38-64` | `interactionRefusalSchema`, `respondedInteractionProjectionSchema` | delete |
| `:66-126` | `interactionContract()`: abstract module `Product.InteractionResponse`, export `INTERACTION_OPERATION_CONTRACTS`, effect class `fh_response_event`, SDK `sdk.interaction.respond`, CLI `interaction respond <kind>` | delete |
| `:128-142` | the five packets and `INTERACTION_OPERATION_CONTRACTS` | delete |
| `:263-268` | `InteractionResponsePort` (exported) | delete |
| `:8`, `:10` imports | `digestSchema`, `jsonValueSchema` are used only by the respond packets | delete the two imports |
| `:144-261`, `:270-272` | `result.assess`: `RESULT_OPERATION_CONTRACTS`, `ResultAssessmentPort`, `_TypedResidualSchemaIsNative` | keep; the file keeps its name because `product/result_definition_bindings.ts:61` imports `RESULT_OPERATION_CONTRACTS` from it and the source-set row at `owner_contract_source_set.ts:194-199` names its module path |
| `public/binding/owner_contract_source_set.ts:8-10` | import of `INTERACTION_OPERATION_CONTRACTS` | delete |
| `:187-193` | source-set row naming `INTERACTION_DEFINITION_BINDINGS` (an export that does not exist) | delete |
| `:36` | `EXACT_OWNER_CONTRACT_KEY_SET_DIGEST` | recompute for 17 operations and 51 keys |
| `:691-693` | `operationCount !== 18 \|\| length !== 56 \|\| distinctKeys.size !== 56` | 17 / 51 / 51 |
| `shared/capability_contracts.ts:87` | replay-continuation row lists the operation and its five keys | remove the operation and keys |
| `:88` | operator.public-contract row lists the operation and its five keys | remove the operation and keys |
| `shared/public_invocation.ts:191` | authority-slot type arm `"abg.operation.interaction.respond" \| "abg.operation.result.assess"` | remove the respond arm |
| `product/invocation.ts:960` | `invocationOperation` list in `constructInvocationCapabilityGrant` | remove the entry |
| `abg/environment_admission.ts:71` | `PublicOperationId` union | remove the arm |
| `abg/effectful_invocation_truth.ts:44` | `EffectfulPublicInvocationPriorAdmission.operationId` union | remove the arm, if the F_H fact owner no longer needs it (next row) |
| `abg/fh_continuation_projection.ts:334`, `:340` | selects `public_operation_admitted` events for the operation and F_H `run.continue` as orphans and returns `invalid_history` | keep: this refuses a recorded respond admission ("refused, not ignored") |
| `public/binding/public_function_family.ts:462` | comment "18-operation/56-definition" | 17 / 51 |
| `product/public_contract_publication.ts:118-120` | `operationIds.length !== 18 \|\| S06_REPLACEMENT_CONTRACT_IDS.length !== 21` | 17 / 20 |
| `product/verify_product.ts:1550` | message "the artifact does not declare the selected exact 18/56 public-function family" | 17/51 |
| `product/verify_product.ts:1573-1591` | the 56 and 18 checks and their messages | 51 / 17 |
| `app/m04.ts:10` | `export * from "../product/interaction_operation_contracts.js"` (package subpath `./app/m04`) | keep the line; it then re-exports only the kept `result.assess` names |

Kept and hold-related, not touched: `InvocationInteractionCapability` and
the schema `abg.schema.fh-interaction`.

`T/scripts`: no hit.

### 1.2 Package metadata (`T/package.json`)

`exports` has 15 subpaths. `./public` (`public/index.ts`) exports no type that
exists only for these members. `./app/m04` re-exports the whole module, so
`INTERACTION_RESPONSE_KINDS`, `INTERACTION_OPERATION_CONTRACTS` and
`InteractionResponsePort` leave that subpath with the deletion. `./product`
(`product/index.ts`) does not re-export the module; the source-set row's
`packageExportPath: "./product"` names a binding export that does not exist,
which is why the members refuse with `installed_binding_unavailable`.

### 1.3 Tests, support and fixtures (`T/test_env`, without `test_runs`, `downstream`, `evidence`)

| Site | Use | Planned action |
| --- | --- | --- |
| `types/framework-handoff.compile.ts:51-55`, `:104-108` | the five keys in DECLARED (56) and UNAVAILABLE (9); `FamilyProof` asserts 56 and 9; comment "56 - 9 = 47" | remove the keys; 51 and 4; "51 - 4 = 47" |
| `tests/t287-framework-handoff-types.test.mjs:145` | `oracle('DECLARED').length` 56 | 51 |
| `:197`, `:224-235` | test 5 "packed runtime keeps 56 declared, 47 callable and 9 unavailable": respond requests assert `installed_binding_unavailable` | assert the undeclared refusal (`unknown_definition`) for the five; 51 / 47 / 4 |
| `:306` | `rows.size === 56*SLOTS.length` | 51 |
| `tests/t287-wave2-owner-contract-source-set.test.mjs:206` | D10 respond approve packet | delete the case or move it to a kept member |
| `:334`, `:412` | respond capability and slot vectors | remove the vectors |
| `:438-443`, `:632`, `:717`, `:765`, `:797` | 18/56, key-set digest, 56, 18 | 17/51 and the new digest |
| `tests/t287-single-address-space-consolidation.test.mjs:70` | `PUBLIC_OPERATION_CLASSES` names the operation (F_H classification) | keep |
| `:896` | hand-admits an orphan respond `public_operation_admitted` | keep: shows the recorded event refused |
| `:1057`, `:1145` | `rawFhResponseSeed` from the `interaction` module | follow the support change below |
| `support/single-address-space-consolidation.mjs:152-173` | `rawFhResponseSeed` builds a test-owned root grant from `INTERACTION_OPERATION_CONTRACTS.respond.approve` and the respond `approve` definition (option `responseGrant`); a vehicle for kept hold assertions | switch the grant to `run.invoke#invoke` |
| `tests/t287-st1-installed-cross-owner-hello.test.mjs:250-273` | prototype pollution case using `INTERACTION_DEFINITION_BINDINGS` and the operation id | move to a kept unavailable member or a fabricated key |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs:398` | 56 | 51 |
| `tests/t287-w2-05-generator-package-reproducibility.test.mjs:136,137,171,179,180,299,315,316,363,364` | 18/56 | 17/51 |
| `tests/r10-projection-contracts.test.mjs:51-52` | 18/56 roster | 17/51 |
| `tests/t287-pfc-f08a-product-verification-boundary.test.mjs:503` | 18 | 17 |
| `fixtures/t287-current-owner/native-assessment/events.jsonl.gz`, `selected-action/events.jsonl.gz` | event 1 is a `product.install` admission whose inline lock names the respond contract | see section 2 |

Qualification mirrors, listed and not edited: `test_env/qualification/tenant-manifest.json:168`, `:223`; `qualification/recipe/expected-output-inventory.json:842`, `:971-974`; `qualification/inventory.json`.

### 1.4 Generated contracts (base build, saved under `/private/tmp/abg-td25m-work/base-gen/`)

| File | Base content naming the operation |
| --- | --- |
| `product-toolchain-manifest.json` `publicContractCatalog.rows` | 75 rows, 27 `serialized_native_contract`, of which 18 operations; one row `abg.operation.interaction.respond` (`contracts/public-operations/interaction/respond/operation-contract.json`) |
| `contracts/capabilities/capability-definition-graph.json` | 16 rows; `owningPublicContracts` 84 for operator.public-contract and 76 for replay-continuation, both including the operation; `graphDigest` `sha256:8a7486de…` |
| `contracts/public-functions/adapter-projection.json` | `cliGrammar`, `documentationInventory`, `sdkMembers`: 56 each |
| `contracts/schemas/operations/interaction/respond/{request,result,non-terminal,refusal}.schema.json` | the four member schemas |
| `contracts/schemas/public-operation.schema.json` | the operation arm |
| `contracts/qualification/sources/*.md` | specification mirrors |

### 1.5 Specification (`specification/`)

No file in the specification states a numeric count of operations,
members or keys.

Already excludes the operation or reserves it to 5.1 (stays):

| Site | Text |
| --- | --- |
| `requirements/product/REQ-P-PUBLIC-CONTRACTS.md:197-232` | the PUBLIC-CONTRACTS-008 table lists 17 identities without the operation; `:229-232` reserves it to 5.1 |
| `requirements/README.md:93-97` | "outside the required 5.0 public operation family" |
| `requirements/product/REQ-P-POLICY.md:234-245` | POLICY-031 and POLICY-032 "Reserved for 5.1" |
| `REQ-P-POLICY.md:257` | 5.1 scope |
| `PRODUCT.md:1040-1043` | "Reserved human-response definitions do not become 5.0 capabilities…" |
| `PRODUCT.md:94`, `:373`, `:374`, `:415`, `:1076`, `:1230`, `:1369`, `:1386`, `:1468`, `:1621` | other reservations; `PRODUCT.md` names no operation |

Lists that include it (to correct):

| Site | Text |
| --- | --- |
| `REQ-P-POLICY.md:142` | POLICY-021 bullet "F_H selection, approval, rejection, assessment, and escalation response;" |
| `REQ-P-POLICY.md:313-314` | POLICY-042 list includes `interaction.respond` |
| `REQ-P-POLICY.md:606` | acceptance "submit an `interaction.respond` variant against a pending interaction;" |
| `requirements/runtime/REQ-R-ABG3-SUPERVISOR-WITNESS.md:38` | WITNESS-009 "typed F_H response and assessed-result admission map to `abg.operation.interaction.respond` and `abg.operation.result.assess`" |

`REQ-P-CONSENSUS.md`, listed and not edited: `:218-221` and `:266-268`
require `interaction.respond` and `run.continue` to complete an F_H
Consensus in the same Run.

### 1.6 Kept design (`T/design`, not `history`)

Lines naming `interaction.respond` (whole word, `rg -c -w`):

| Note | Lines |
| --- | ---: |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 26 |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | 5 |
| `ABI5_REALIZATION_CONSTITUTION.md` | 3 |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 3 |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` | 2 |
| `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md` | 1 |
| `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md` | 1 |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` | 1 |

Count sites (18 operations, 56 keys, 47 callable, 9 unavailable):

| Note | Lines |
| --- | --- |
| `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md` | 13 |
| `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md` | 78 (56 / 47 / nine) |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md` | 45, 327, 393 |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | 61, 104, 137, 280, 656, 1140, 1221, 1226, 1518, 2654, 2688, 2760, 2767, 2802, 2897-2898, 3058, 3185, 3190, 3224-3225, 3277, 3324 |
| `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md` | 237 |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md` | 513 (56) |

### 1.7 Constitution (`T/design/ABI5_REALIZATION_CONSTITUTION.md`)

Inside the sections the brief opens (5.6.2C at `:736-1315`, 5.6.3 at
`:1316-1962`):

| Lines | Content |
| --- | --- |
| `:743-745` | 18 / 56 |
| `:1139` | "interaction operations" |
| `:1266-1287` | the E33 kernel paragraph (L53 → L54 → L55 → L56 → R33) |
| `:1304`, `:1307` | 56-key, 56/56 |
| `:1323`, `:1329-1330` | 18 / 56 |
| `:1338-1345` | effect partition 25/7/8/16 = 56 |
| `:1352`, `:1357` | shapes "56 - (1+1+4+4+3+1+1) = 41" |
| `:1362` | count |
| `:1424` | row E33 |
| `:1438` | class sum = 56 |
| `:1540` | row L47 (`deriveFhResumeSuccessorInputAtPrefix`, deleted by TD-25R, used in the E31 trace) |
| `:1546-1549` | rows L53-L56 (functions deleted by TD-25R) |
| `:1684` | row R33 |
| `:1784` | E33 trace |
| `:1793` | table D heading "exact 56-key" |
| `:1797`, `:1833`, `:1843` | counts |
| `:1934` | `interaction.respond#{…}` → `./product` `InteractionResponsePort.respond` |

Outside those sections, listed and not edited: `:642`, `:719`, `:729`,
`:1982-1983`, `:2014-2066` (5.6.5, with E33 rows at `:2018` and `:2058`),
`:2108`, `:2141-2148` (5.6.5A "interaction.respond | one E33 kernel plus
five frozen packets"), `:2190`, `:2365`, `:2467`, `:2510` (10.1.3 heading
"Exact 18/56"), `:2666`, `:2692`, and the section 16 records. The amendment
rule is at `:2923`; record 16.16 is at `:3242`.
