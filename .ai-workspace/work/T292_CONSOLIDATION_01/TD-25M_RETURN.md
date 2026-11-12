# TD-25M Return: the `interaction.respond` operation and its five members

Writer: Claude Opus 5.5. Branch `claude/td25m-withdraw-respond-members` from
local `main` at `b13bdd5c2`, worktree `/private/tmp/abg-td25m`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag.

**Status: stopped at step 2. Two stop conditions hold. First, recorded
stores that the kept feature set produces carry the operation in their
Product install lock, and the withdrawal makes artifact truth refuse them;
the live rc.12 default-library Run is one of them. Second, a kept Public
read changes what its caller observes: `project.read#graph_call_result`
over a retained store returns a value on base and `invalid_history` with
the change, and three kept lanes lose cases that pass on base:
`r10-child-proof` (10 of 10), `t287-historical-source-resource` (3 of 4) and
`t287-cross-cut-public-read` (3 of the 4 that pass). No specification,
design, code or test is edited. Three ruling options are in section 6.**

Commits on the branch, oldest first:

| Commit | Content |
| --- | --- |
| `beae063d5` | census (Return skeleton) |
| this commit | the Return: recorded history, the stop, the planned door, the ruling options |

Lines removed: none.

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

## 2. Recorded history

### 2.1 The operation as a value

The search covers the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace`
with `rg -uuu -z` and the pattern below, which matches the member value in both
spacing forms and in the single-escaped form:

```text
\\?"operationId\\?"\s*:\s*\\?"abg\.operation\.interaction\.respond\\?"
```

| Measure | Value |
| --- | ---: |
| files searched | 2,830,915 |
| bytes searched | 244,174,053,634 |
| files with a match | 7,819 |
| matches | 1,051,063 |

A JSON walk classifies every match by its nearest event ancestor. It reads
5,098 JSON files whole and the matched lines of 2,208 JSONL files and 76
gzipped JSONL files; every JSON file parses.

| Where the value sits | Occurrences |
| --- | ---: |
| event whose `payload.operationId` is the operation (a recorded call) | 0 |
| inside `public_operation_artifact_admitted` (the published contract) | 29,880 |
| inside `basis_admitted` (graph rows, per-slot rows, `verifiedProducts`) | 2,400 + 100 per slot + 20 |
| inside `c_call_result_admitted` | 1,440 + 60 per slot + 12 |
| outside events (contract, manifest and request copies) | the remainder |

The lines the walk could not parse (6,970 JSONL lines from request and start
records, 202 lines of `catalog-input.json.gz`), 64 text files and 373
archives were searched for a same-line `"kind":"public_operation_admitted"`
with the operation. One hit: an agent transcript of the
`t287-single-address-space-consolidation` RAW F_H test output
(`work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/runtime-001/resources/archives/fp-b4e881d8c2879add-stdout.log`),
which shows the hand-built orphan refused. It is not a store.

No recorded store holds a call of the operation. Limits: zip archives are not
opened; the main checkout's `test_runs`, `uat/runs` and `evidence` are not
searched.

### 2.2 The operation inside Product install locks

411 JSONL logs under the evidence root (24.56 GB) carry
`public_operation_artifact_admitted` events that publish the operation; the
same logs open with a `product.install` artifact admission whose resolved
lock lists the operation's contract with its capability identities
`abg.capability.operator.public-contract@5` and
`abg.capability.runtime.replay-continuation@5`. They come from rc4, rc6, rc7,
rc8, rc9, rc10, rc11, the D1, D2 and D4 campaigns and the trusted desktop
steel thread. In the worktree, `test_env/fixtures/t287-current-owner/native-assessment/events.jsonl.gz`
and `selected-action/events.jsonl.gz` carry the same lock in event 1.
`test_env/proof` and the uat stores have no match (107 files).

The live rc.12 default-library Run
`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl` (1,695
rows) is one of these stores: its inline lock at admission ordinal 1
(`event://abiogenesis/41d002308b0baee43e51d061991e250ffd5977e3f75d63f84e8c40a81d9e5429`)
holds the rows `product://abiogenesis/typescript-tenant@5.0.0-rc.12` and
`product://default-library-witness/consumer@5`, and the first lists the
operation.

## 3. Why the withdrawal stops here

### 3.1 The reader checks a recorded lock against its own register

`projectArtifactTruth` (`T/code/src/abg/artifact_truth.ts:618`) folds every
artifact admission. For a `product.install` row it establishes the recorded
lock with `isResolvedProductLock` (`:409`) and refuses on failure:

- inline lock: `TypeError("Product install inline body requires one resolved lock and no body cause")` (`:423`);
- referenced or embedded lock: `TypeError("Product install artifact truth requires one complete candidate and resolved lock")` (`:466`).

`isResolvedProductLock` (`T/code/src/product/environment.ts:544`) compares
each recorded contract's `capabilityIdentities` with the reader's current
register, `capabilityRefsForContract(contract.contractId)` (`:674-679`);
`lockRowGraphMatchesCatalog` (`:764-767`) also reads the current register.
`capabilityRefsForContract` (`shared/capability_contracts.ts:107`) returns the
capabilities whose register row lists the contract. Withdrawing the operation
removes it from both rows at `:87-88`, so for its contract the reader returns
`[]` while every recorded lock holds two identities. The lock check fails and
artifact truth throws.

Artifact truth is consulted by every Public binding that reopens a store:
`owner_bindings/run_invocation.ts:709`, `abg/project_read_definition_bindings.ts:704`
(`artifact_truth_invalid`), `product/admission_authority.ts:180`/`:302`
(`artifact_truth_unauthenticated`), `abg/environment_admission.ts:495`/`:509`
(`artifact_truth_invalid`), `abg/effectful_invocation_truth.ts:136`/`:141`,
`product/materialization_definition_bindings.ts:386`, `abg/worksite_revision.ts`
and `abg/invocation_execution_truth.ts:118`.

### 3.2 Simulation

The simulation copies the base build and patches
`build/code/src/shared/capability_contracts.js` so that
`capabilityRefsForContract` returns `[]` for the operation's contract when a
flag is set. After the real change the function returns exactly that value;
the real change also removes the contract from the reader's catalog, so the
simulation can only under-count refusals. Removing the strings from the
built register directly does not load: `interactionContract` needs
capability refs and the module throws "owner metadata authority requirements
are incoherent".

On the live rc.12 store, `isResolvedProductLock` is `true` on base and `false`
in the simulation, with one mismatch: contract
`abg.operation.interaction.respond`, recorded
`["abg.capability.operator.public-contract@5","abg.capability.runtime.replay-continuation@5"]`,
reader `[]`.

### 3.3 Artifact truth over recorded logs

| Logs | Count |
| --- | ---: |
| logs carrying the operation in artifact admissions | 411 |
| over the 300 MB cap, not probed (21.08 GB) | 14 |
| probed | 397 |
| decode on base | 118 |
| refused at decode on base ("event stamp differs from the exact native profile schedule" 270, "invalid admission ordinal" 5, "noncanonical event" 4) | 279 |
| artifact truth projects on base | 118 |
| artifact truth refused in the simulation | 118 |

The simulation refuses with the inline-lock message for 73 and the
candidate-and-lock message for 45. Every log that base can read becomes
unreadable through artifact truth. By area: rc4 native recovery 43, D1
lifecycle 20, D2 bounded repair 10, rc11 effect phase 2 and rc11
qualification 7 each, W2 steel sequence 5, rc6 release qualification and
rc11 effect phase 1 4 each, D4 self-conformance, D4 S01 program owner and rc10
retention 3 each, single-address-space consolidation, D2 lifecycle and rc8
reference preservation 2 each, trusted desktop steel thread, D2 frame repair
and rc9 owner reuse 1 each.

The seven decodable logs of the 23 that TD-25R and TD-25S replayed, and the
two worktree fixtures, project on base with these digests and are refused in
the simulation:

| Log | Base artifact truth digest |
| --- | --- |
| live rc.12 default library | `sha256:895b6a68…` |
| rc7 blocked testing | `sha256:0a5b675c…` |
| rc11 native-assessment | `sha256:b0f08e5c…` |
| rc11 selected-action | `sha256:ec614656…` |
| rc8 registered selection | `sha256:76314729…` |
| rc11 native-02 | `sha256:563557d5…` |
| rc4 worksite command execution | `sha256:aaa27f50…` |
| fixture native-assessment | `sha256:c7c0d324…` |
| fixture selected-action | `sha256:ec614656…` |

The other 16 of the 23 do not decode on base.

### 3.4 Replay is not affected

The TD-25R replay script (decode, prefix selection, whole-log replay, F_H
projections, per-Run replay) gives byte-identical output on base and in the
simulation for the seven decodable logs. The whole-log replay digests match
TD-25R's (`3800fb11…`, `40028725…`, `6dbf5586…`, `0d3923da…`, `bc4a919e…`),
and the two refusals keep their messages ("run_stopped event and
run_terminal HoldsAt truth disagree", "requires zero or one exact
run_stopped event"). Only artifact truth refuses.

### 3.5 What a caller of a kept Public read observes

`project.read#graph_call_result` over the retained D2 continuation-09 store
(first 846 lines, the input of `t287-historical-source-resource`), called as
that lane calls it (`GraphCallProjectionPort.graph_call_result`):

| Build | Caller receives |
| --- | --- |
| base | the terminal result (`sha256:b5f8503e…`) |
| simulation | `abg_project_read_refusal`, code `invalid_history`, "ABG project read owner projectors refused the durable event history" |

### 3.6 Lanes on kept behaviour

Run from the base copy and from the simulation copy, one file at a time,
with `ABI5_EVIDENCE_ROOT` set:

| Lane | Base (tests / pass / fail / skip) | Simulation | Cause |
| --- | --- | --- | --- |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 1 / 0 / 1 / 0 | the file aborts: "historical environment is absent" (`abg/project_read_ports.ts:369`) |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 1 / 3 / 0 | `graph_call_result` returns the refusal of 3.5, no `terminalResult` |
| `t287-cross-cut-public-read` | 5 / 4 / 1 / 0 | 5 / 1 / 4 / 0 | base fails case 1 only, the known read-count red ("12477 !== 1053"); in the simulation cases 1, 2, 3 and 5 fail with `exact_prefix_workspace_environment_refusal` where `exact_prefix_workspace_environment` is expected, so cases 2, 3 and 5 go from pass to fail |
| `m5-event-store-reopen` | 27 / 27 / 0 / 0 | 27 / 25 / 2 / 0 | "packed payload digest differs from the manifest": an artifact of patching the built file, not of the change |
| `r10-projection-contracts` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 | same cases |
| `d2-workflow-step` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | same cases |
| `d2-evidence-owner-lookup` | 5 / 2 / 3 / 0 | 5 / 2 / 3 / 0 | the same three cases fail on both builds |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 | same cases |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | same cases |

The retained inputs of the first three lanes are the D2 continuation-09
store and the S01 program-selection store; both project artifact truth on
base and are refused in the simulation. `t287-single-address-space-consolidation`
reads the rc5 performance log (586 MB, over the cap) and is not run.

## 4. The door, planned and not executed

| Door | Value | Before | After the planned change |
| --- | --- | --- | --- |
| installed definition-call transport (`public/installed_definition_call_transport.ts`) | a structurally exact `interaction.respond#<member>` call | `installed_definition_call_transport_refusal`, code `installed_binding_unavailable` (asserted by `t287-framework-handoff-types` test 5); by reading, message "manifest-bound installed definition export is unavailable" (`:278-281`), since `./product` has no `INTERACTION_DEFINITION_BINDINGS` | `installed_definition_call_transport_refusal`, code `unknown_definition`, "DefinitionCall must select one exact installed owner contract source" (`:254`) |
| CLI `abg.cli --jsonl` (`public/cli.ts:120-132`) | a transport request for the same call | the transport refusal above, exit code 2 | the `unknown_definition` refusal, exit code 2 |
| recorded store | a hand-built orphan `public_operation_admitted` for the operation | F_H fact owner `invalid_history` (`fh_continuation_projection.ts:334-340`); effectful truth `invocation_pair_invalid` | unchanged |
| recorded store | a `product.install` lock that lists the operation's contract | artifact truth projects; kept reads answer | artifact truth throws; kept reads refuse (3.5, 3.6) |

No new refusal code is planned. The last row is the stop.

## 5. Not done

No specification, design, constitution, code, test or generated-file edit
is made. No build of the worktree is needed; `git status --short` is clean
apart from the two commits. The census in section 1 is the plan of record
for whichever ruling follows.

## 6. Items for the Executive's ruling

The stop is general. Any package that removes a contract from the
capability register meets the same check, so TD-26 (Consensus and One
Surface) will stop the same way unless the ruling covers it. One ruling for
all register removals is preferable to one per package.

| Option | What it means | Consequence |
| --- | --- | --- |
| (a) accept | Withdraw the operation as planned and accept that recorded stores whose lock lists it are no longer readable through artifact truth. | Waives two stop conditions: the live rc.12 default-library Run and 118 probed logs become unreadable, and `project.read` callers over them get `invalid_history`. `r10-child-proof`, `t287-historical-source-resource` and `t287-cross-cut-public-read` need new retained inputs or lose cases, which weakens kept assertions; the rules forbid that without a ruling. |
| (b) reframe first | A `design_reframe` before the withdrawal: a recorded lock row's capability identities are checked against the recorded row's own capability graph (`row.capabilityDefinitionGraph`, which the lock already carries and which `environment.ts:669-672` already compares), not against the reader's current register. Then rerun this package. | Recorded stores stay readable after any register removal, TD-26 included. It changes what a reader accepts as a resolved historical lock; it needs a requirement reading of whether a reader honours a lock whose capabilities it no longer declares. |
| (c) keep | Keep the five members declared and always refusing with `installed_binding_unavailable`, as on `main`. | No change to recorded history or callers. The register entry's alternative; the surface keeps 18 operations and 56 keys while the specification reserves the operation to 5.1. |

Also open, from the census and unchanged by the stop:

- `REQ-P-CONSENSUS.md:218-221` and `:266-268` require `interaction.respond`
  in 5.0 Consensus while `REQ-P-PUBLIC-CONTRACTS.md:229-232`, POLICY-031,
  POLICY-032 and `requirements/README.md:93-97` reserve it to 5.1 (already
  in the register under TD-25's second part).
- `d2-evidence-owner-lookup` fails three of five cases on base with the
  evidence root set; it is not on the rules' list of known reds.
