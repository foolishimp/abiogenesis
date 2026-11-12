# TD-26 P1 Return: the Consensus doors on the Public side

Writer: Claude Opus 5.5. Branch `claude/td26-p1-consensus-doors` from local
`main` at `b3bcb1303`, worktree `/private/tmp/abg-td26p1`. Change class:
realization_refactor (plan `TD-26_RETIREMENT_PLAN.md` section 6 "P1"; the
member's withdrawal is P7's). No push, no tag.

**Status: in progress (census and recorded history).**

`T` = `build_tenants/abiogenesis/typescript`. Scratch, probes and TAP output:
`/private/tmp/abg-td26p1-work/`. The base tree for base lanes and probes is
`/private/tmp/abg-td26p1-work/base-root` (`git archive b3bcb1303` with the
tenant's `node_modules`, built; its contracts and manifest are byte-identical
to the worktree's base build).

## 1. Census

Line numbers in this section are at `b3bcb1303`. Search: whole-word, over
`specification`, `T/code/src`, `T/scripts`, `T/test_env` (without
`test_runs`, `downstream`, `evidence`), live `T/design` (without `history/`)
and `T/package.json`, for `ticket_consensus`, `ticketConsensus`,
`TicketConsensusProjectReadPacket`, `TicketConsensusOperationResult`,
`projectConsensusTicket`, `ConsensusProjectionPort`,
`Product.ConsensusProjection`, `admittedAuthorityBinding`,
`run_projection_authority`, `PublicRunProjectionAuthority`,
`constructPublicRunProjectionAuthority`, `parsePublicRunProjectionAuthority`,
`public_run_projection_authority`, `publicResultProjectionKinds`,
`hasInstalledPublicResultProjection`, `supportsInstalledPublicResultProjection`,
`projectInstalledPublicResult`, `projectPublicResult`,
`ProductPublicResultProjection` and `ticket.consensus`.

### 1.1 What P1 removes

- **The `ticket_consensus` binding.** `project.read#ticket_consensus` is a
  declared member whose binding is the callable `ticket_consensus` in
  `PRODUCT_PROJECT_READ_DEFINITION_BINDINGS`
  (`product/project_read_definition_bindings.ts:869-996`, table entry
  `:1027`). It projects an admitted Consensus result into a ticket projection
  through `ConsensusProjectionPort.ticketConsensus`
  (`product/project_read_ports.ts:806-873`, `:892-894`, `:902`), after
  `admittedAuthorityBinding` (`:224-277` of the bindings) re-derives the
  workspace binding from artifact truth. Its definition, request, result and
  refusal contracts stay published until P7, because register row
  `abg.capability.operator.public-contract@5` names its key (ruling 2, plan
  §5.4). Without the binding the member is declared and unavailable, as the
  nine members without a binding already are.
- **`public/run_projection_authority.ts`** (189 lines). It has no caller in
  source; its only user is one case of `m5-consensus-module`.
- **The Public-result roster and its three `./product` helpers.**
  `ProductSemanticsProvider.publicResultProjectionKinds` (`product/semantics.ts:152`),
  the loader's check of it (`:459-472`, the clause and its `||`), and `hasInstalledPublicResultProjection`
  (`:589-600`), `supportsInstalledPublicResultProjection` (`:602-613`) and
  `projectInstalledPublicResult` (`:615-635`). Their only referrer is the
  `./product` barrel (`product/index.ts:141`, `:144-145`). The roster's only
  non-default value is `"ticket.consensus"` in `ABI5_SYSTEM_PRODUCT_SEMANTICS`
  (`product/builtin_semantics.ts:593`).

### 1.2 Specification

No hit. P0 removed `ticket_consensus` from the live specification
(`TD-26_P0_RETURN.md` section 4). No specification file is edited.

### 1.3 Design (kept notes, `T/design/*.md`; not edited)

These kept sentences still describe what P1 removes. The brief reserves design
edits to other packages; they are listed for them.

| Note | Line | Text |
| --- | --- | --- |
| `ABI5_REALIZATION_CONSTITUTION.md` | 1412 | row `E21` `project.read/ticket_consensus`: "admitted Consensus result -> Product-owned ticket projection" |
| same | 1503 | row `L10`: `TicketConsensusProjectReadPacket + admitted Consensus result -> ProductProjectReadResult<ticket_consensus>`, realized by `P/project_read_ports.ts::projectConsensusTicket` |
| same | 1672 | row `R21` `E21` ticket_consensus: result and refusal law, "`P/project_read_ports.ts::projectConsensusTicket` invokes `G/consensus.ts::projectTicketConsensus`" |
| same | 1952 | `ticket_consensus` bound at `./product` `ConsensusProjectionPort.ticketConsensus` |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` | 2052-2053 | "`PublicRunProjectionAuthority` constructor semantics are replaced by unverified coordinate parsing plus ABG-backed basis rehydration" |
| same | 2178 | row `D02`: `product/project_read_ports.ts` exports `… ConsensusProjectionPort`, depends on `gtl/consensus.ts` |
| same | 2264 | row 27: `ticket_consensus` → `Product.ConsensusProjectionPort.ticketConsensus` |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | 1339 | `ticket_consensus` row: ConsensusResult → TicketConsensusProjection |
| same | 1358 | `ticket_consensus` → `Product.ConsensusProjectionPort.ticketConsensus` |
| same | 1399-1404 | the `ticket_consensus` selector arm of the read basis type |
| `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md` | 665 | trace step `-> PublicRunProjectionAuthority` |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 1118 | "a port reached outside an owner's hold … from a Run owner's stage, `ticket_consensus`, the native assessment or a direct caller" |

The constitution passages (1412, 1503, 1672, 1952) are listed and not edited,
as the rules require.

### 1.4 Source (`T/code/src`)

| File | Lines at base | What | Action |
| --- | --- | --- | --- |
| `product/project_read_definition_bindings.ts` | 869-996 | `ticket_consensus` callable | delete |
| same | 1027 | its `PRODUCT_PROJECT_READ_DEFINITION_BINDINGS` entry | delete |
| same | 224-277 | `admittedAuthorityBinding` (only referrer: `ticket_consensus`) | delete |
| same | 79-85 | `ProjectReadPacket` union member `TicketConsensusProjectReadPacket` | edit |
| same | 98-102, 121 | the `runtime` resource field and its `validResources` key (only `ticket_consensus` admits it) | delete |
| same | 11, 15-16, 21, 23, 49, 63, 71 | imports used only by the deleted code: `projectRunTruthAtDurablePrefix`, `AbgGraphCallProjectionPort`, `projectAdmittedProductInstallByAdmissionEventRef`, `projectAdmittedWorkspaceBindingByInvocationRef`, `ABI5_SYSTEM_PRODUCT_SEMANTICS`, `ConsensusProjectionPort`, `TicketConsensusProjectReadPacket` | delete |
| `product/project_read_ports.ts` | 8-15 | `gtl/consensus.js` imports (`ConsensusResult`, `TicketConsensusProjection`, `isConsensusResult`, `projectTicketConsensus`) | delete |
| same | 54 | `"ticket_consensus"` in `ProductProjectReadCase` | edit |
| same | 138-147 | `TicketConsensusProjectReadPacket` | delete |
| same | 155 | its `ProductProjectReadPacketByCase` entry | edit |
| same | 296-301 | `TicketConsensusOperationResult` | delete |
| same | 806-873 | `projectConsensusTicket` | delete |
| same | 892-894 | `ConsensusProjectionPort` | delete |
| same | 902 | its entry in the port table `PRODUCT_PROJECT_READ_CONTRACTS` | edit |
| `product/project_read_operation_contracts.ts` | 312-314 | `ConsensusProjectionPort` interface | delete |
| same | 26, 96-104, 272-285, 292 | the `ticket_consensus` definition, its projection schema and table entry | stay until P7 (ruling 2) |
| `public/run_projection_authority.ts` | 1-189 | whole file | delete |
| `public/index.ts` | 5-7 | `PublicRunProjectionAuthority` type export | delete |
| `product/semantics.ts` | 152 | `publicResultProjectionKinds` | delete |
| same | 459-472 | the loader's roster check | delete |
| same | 589-600 | `hasInstalledPublicResultProjection` | delete |
| same | 602-613 | `supportsInstalledPublicResultProjection` | delete |
| same | 615-635 | `projectInstalledPublicResult` | delete |
| same | 139-144, 215-223, 456-458 | `ProductPublicResultProjection`, the `projectPublicResult` hook and its loader check | stay (see below) |
| `product/index.ts` | 141, 144-145 | the three helper exports | delete |
| `product/builtin_semantics.ts` | 593 | the roster value `["result", "ticket.consensus"]` in `ABI5_SYSTEM_PRODUCT_SEMANTICS` | delete |
| same | 586-711 | the rest of `ABI5_SYSTEM_PRODUCT_SEMANTICS`, including the `ticket.consensus` arms of `projectPublicResult` (`:672-673`, `:700-705`) | stay until P2 (ruling 3) |
| `shared/capability_contracts.ts` | 82, 88, 91 | register rows naming the Consensus schema ids and the `ticket_consensus` key | unchanged (ruling 1) |

Kept code that imports from a reduced file:
- `product/project_read_definition_bindings.ts` keeps importing
  `CatalogProjectionPort`, `InstallProjectionPort`, `WorkspaceProjectionPort`,
  `projectReleaseEvidence` and the packet types of the five kept members from
  `product/project_read_ports.ts`. Nothing it keeps reads a deleted item.
- `bindingAuthorityMatches`, `authoritySlots` and `exactCoordinateSet` stay:
  `workspace_status` and `install_evidence` use them.
- `isWorkspaceAuthorityBasis` and `productInstallCoordinate` stay imported:
  `workspace_status` uses them (`:685`, `:709`, `:747`).
- `projectRunTruthAtDurablePrefix` and `GraphCallProjectionPort` stay in
  `abg/` with their other callers (`abg/qualification_proof.ts:22`,
  `abg/project_read_definition_bindings.ts`).
- `ProductPublicResultProjection`, the provider hook `projectPublicResult` and
  its loader check stay. Their only implementer is `ABI5_SYSTEM_PRODUCT_SEMANTICS`,
  which stays until P2 by ruling 3 (the shipped Consensus publication names it
  by string). After P1 no source calls the hook; it is P2 residue (section 15).

### 1.5 Tests, support, fixtures (`T/test_env`)

| File | Lines at base | What | Action |
| --- | --- | --- | --- |
| `tests/t287-framework-handoff-types.test.mjs` | 145-146, 197, 215, 230-241, 275 | 56 declared, 47 callable, 9 unavailable; the unavailable request table | counts to 46 callable and 10 unavailable; a `ticket_consensus` request joins the table (the refusal lane) |
| `types/framework-handoff.compile.ts` | 103-113, 126 | the `UNAVAILABLE` oracle | gains `project.read#ticket_consensus`; 56 − 10 = 46 |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs` | 28, 1134-1225, 1647 | `ticket_consensus` among the W2-05 callable additions; the direct-binding fault path; the proof line | the member leaves the callable additions and is asserted unavailable in the census; the existing call goes through the installed transport and is refused `installed_binding_unavailable`; the run-truth `target_absent` claim stays |
| `tests/m5-consensus-module.test.mjs` | 25-28, 2004-2096 | the `run_projection_authority` import and its case | delete (the file goes in P2) |
| `tests/t287-wave2-owner-contract-source-set.test.mjs` | 294 | `ticket_consensus` → its register capability | unchanged: the definition and the register row stay |
| `tests/t287-st2a-g-capability-definition-graph.test.mjs` | 225 | same | unchanged |

No support module or fixture names a removed item. No fixture, support or UAT
Product semantics provider declares `publicResultProjectionKinds`
(`rg -uu` over `T/test_env` without `test_runs`, `downstream`, `evidence`).
No other list enumerates the unavailable members (search for
`interaction.respond#answer_escalation`).

### 1.6 Scripts and package metadata

No hit in `T/scripts` or `T/package.json`.

### 1.7 Qualification mirrors (not edited)

| File | Members |
| --- | --- |
| `test_env/qualification/inventory.json` | changed: `code/src/product/project_read_ports.ts`, `project_read_definition_bindings.ts`, `project_read_operation_contracts.ts`, `semantics.ts`, `builtin_semantics.ts`, `index.ts`, `code/src/public/index.ts`, `test_env/tests/t287-w2-05-install-catalog-owner-chain.test.mjs`, `test_env/tests/m5-consensus-module.test.mjs`; deleted: `code/src/public/run_projection_authority.ts`. `t287-framework-handoff-types.test.mjs` and `types/framework-handoff.compile.ts` are not members. |
| `test_env/qualification/recipe/verification-recipe.json` | the same; `:970-971` name the deleted file |
| `test_env/qualification/recipe/expected-output-inventory.json` | `:521-522` name `build/code/src/public/run_projection_authority.{d.ts,js}` |

No lane reads these files.

### 1.8 Generated

Regenerated by `npm run build` and not committed (rules, step 7): the
`project/read` operation contract and its request, result and refusal schemas
(source module and member digests move with `project_read_operation_contracts.ts`),
every `operation-contract.json` (family digest), `adapter-projection.json`,
`public-operation.schema.json`, `capability-definition-graph.json`,
`product-toolchain-manifest.json` and `test_env/fixtures/abi5-root-candidate-basis.json`.
Section 9 gives the content summary.

## 2. Recorded history

**Scope.** `rg --no-config -uu` over `/Users/jim/src/apps/abiogenesis/.ai-workspace`
and the main checkout's `T/test_env` (`test_runs` included), files `*.json`,
`*.jsonl`, `*.ndjson`, `*.txt`, `*.log`, without `node_modules` and `.git`, no
size cap (31 s). A second pass searched every `*.gz` file decompressed
(`rg -z`) for the value patterns below. Zip archives are not covered. Scripts:
`/private/tmp/abg-td26p1-work/hist/scan.sh`, `scan2.sh`, `kinds.py`,
`consensus-results.py`; outputs beside them.

**Values P1's code reads or writes.**

| Value | Files |
| --- | --- |
| a `ticket_consensus` request (`"caseKey":"ticket_consensus"`, plain or escaped) | 0 (gzip: 0) |
| a ticket projection value (`"kind":"ticket_consensus_projection"`) | 0 (gzip: 0) |
| a Public result projection value (`"kind":"product_public_result_projection"`) | 0 (gzip: 0) |
| a run projection authority value (`"kind":"public_run_projection_authority"`) | 1 (gzip: 0): `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/attempt-005/source-acquisition-001/public-run-projection-authority.json` |

The one authority value is operator evidence. Its script
(`acquire-source.mjs:78`, `:93-95` in the same folder) imported
`public/run_projection_authority` from the installed rc4 package by build path
and recorded what it constructed. No event log holds it, and no kept reader
reads that file. The rc4 install that wrote it is immutable and keeps its
module.

**Where the names occur in event logs.** The name searches also match text:
copies of the Product's sources, contracts and catalogs inside recorded rows.
In event logs (`*events*.jsonl`):

| Name | Rows (logs) | Row kinds |
| --- | --- | --- |
| `"memberKey":"ticket_consensus"` | 434 (347) | `public_operation_artifact_admitted`: the recorded install's Public contract, which declares the member |
| same | 19 (11) | `basis_admitted`: embedded source text |
| same | 12 (8) | `c_call_result_admitted`: native assessment results whose text quotes the contract |
| `public_run_projection_authority`, `publicResultProjectionKinds`, `product_public_result_projection`, `ticket_consensus_projection` | 11 logs | `basis_admitted` rows that carry the build's `.d.ts` text (for example row 88 of `comments/codex/20260928_FRAMED_GOVERNANCE/final-native-setup-03/resources/events/runtime.events.jsonl`) |

Decoding checks payload keys and never resolves these strings; artifact truth
compares a recorded install's contract rows with the register, which P1 does
not change (section "Artifact truth over recorded stores" below).

**Stores that hold admitted Consensus results.** None. 1,162 JSONL files name
`contract://abg/consensus/result-candidate@5` or
`contract://abg/schema/consensus-result@5` as a `contractRef`,
`resultContractRef` or `outputContractRef`; in none of them does an event
payload carry either as its own contract (`consensus-results.py`). The 8 logs
whose `c_call_result_admitted` rows mention the candidate contract admit
`contract://abiogenesis/qualification/native-runtime-assessment@5` results. So
no recorded store gives a kept read a Consensus result to return, before or
after P1.

**Stop condition (rules step 2).** Not met. P1 removes no event kind, payload
key, decoder arm, replay arm or artifact-truth guard. No store that the kept
feature set produces needs the removed binding or helpers to reopen, replay or
read; no recorded store holds a `ticket_consensus` read.
