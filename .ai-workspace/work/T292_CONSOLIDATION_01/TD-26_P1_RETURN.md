# TD-26 P1 Return: the Consensus doors on the Public side

Writer: Claude Opus 5.5. Branch `claude/td26-p1-consensus-doors` from local
`main` at `b3bcb1303`, worktree `/private/tmp/abg-td26p1`. Change class:
realization_refactor (plan `TD-26_RETIREMENT_PLAN.md` section 6 "P1"; the
member's withdrawal is P7's). No push, no tag.

**Status: complete; one ruling asked (R1, section 15).** `project.read#ticket_consensus`
stays declared and is refused `installed_binding_unavailable` at the installed
transport and the CLI (exit 2); 56 declared, 46 callable, 10 unavailable. 569
source lines removed, 4 added. No register row, corpus id or Consensus schema
contract changes; the capability graph rows, artifact truth over 25 recorded
stores, the replay census over 23 logs and the kept run reads are identical on
base and final. Every listed lane passes on final with base counts, the
`td36r` fixture lanes after the scratch refresh. Commits: `24d364cee` (Return
skeleton), `d5508f27d` (code), `ece1625f2` (tests), then this Return.

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

Regenerated by `npm run build` and not committed (rules, step 7):
`contracts/capabilities/capability-definition-graph.json` and
`product-toolchain-manifest.json`. No other file under `contracts/` changes and
the candidate-basis fixture is not rewritten by the build. Section 9 gives the
content summary.

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

## 3. Specification and design

No specification file and no design note is edited (brief). The kept design
sentences that still describe what P1 removes are listed in section 1.3; the
four `ABI5_REALIZATION_CONSTITUTION.md` passages (1412, 1503, 1672, 1952) are
among them.

## 4. Source lines removed by file

Commit `d5508f27d`. Counts from `git diff --numstat b3bcb1303`.

| File | Added | Removed | What goes |
| --- | --- | --- | --- |
| `product/project_read_definition_bindings.ts` | 3 | 205 | the `ticket_consensus` callable and its table entry; `admittedAuthorityBinding`; `TicketConsensusProjectReadPacket` in `ProjectReadPacket`; the `runtime` resource field of `ProductProjectReadResourceAssertion` and `"runtime"` in the `validResources` key union; seven imports used only by these (the three added lines are the type-only import of `ExactPrefixArtifactTruthProjection`, the new last line of the `ProjectReadPacket` union and the shortened `validResources` key union) |
| `product/project_read_ports.ts` | 1 | 102 | section 5 |
| `product/project_read_operation_contracts.ts` | 0 | 4 | the `ConsensusProjectionPort` interface |
| `public/run_projection_authority.ts` | 0 | 189 | the whole file |
| `public/index.ts` | 0 | 3 | the `PublicRunProjectionAuthority` type export |
| `product/semantics.ts` | 0 | 62 | the provider field `publicResultProjectionKinds`, the loader's check of it, `hasInstalledPublicResultProjection`, `supportsInstalledPublicResultProjection`, `projectInstalledPublicResult` |
| `product/index.ts` | 0 | 3 | the three helper exports |
| `product/builtin_semantics.ts` | 0 | 1 | the roster value `["result", "ticket.consensus"]` |
| **Total** | **4** | **569** | |

`npx tsc --noEmit` is clean. The `--noUnusedLocals --noUnusedParameters`
report is identical to the base report (no new unused local). The three
boundary lints (`lint:imports`, `lint:lifecycle`, `lint:calculus`) report no
offender; the lifecycle lint counts 282 modules against 283 at base.

## 5. Hunks in `product/project_read_ports.ts`

Line numbers at `b3bcb1303`. Every hunk only deletes or shortens; no hunk
touches `projectWorkspaceStatus` (`:622-707`) or `WorkspaceStatusProjectReadPacket`
(`:105`). The nearest is hunk 4, three lines below the `workspace_status` entry
of `ProductProjectReadPacketByCase` (`:152`).

| # | Base lines | Change |
| --- | --- | --- |
| 1 | 8-15 | delete the two `../gtl/consensus.js` imports (`ConsensusResult`, `TicketConsensusProjection`, `isConsensusResult`, `projectTicketConsensus`) |
| 2 | 53-54 | `ProductProjectReadCase` ends at `"release_evidence"`; `"ticket_consensus"` goes |
| 3 | 138-148 | delete `TicketConsensusProjectReadPacket` and the blank line after it |
| 4 | 155 | delete the `ticket_consensus` entry of `ProductProjectReadPacketByCase` |
| 5 | 296-301 | delete `TicketConsensusOperationResult` |
| 6 | 806-874 | delete `projectConsensusTicket` and the blank line after it |
| 7 | 892-895 | delete `ConsensusProjectionPort` and the blank line after it |
| 8 | 902 | delete the `ticket_consensus` entry of the port table `PRODUCT_PROJECT_READ_CONTRACTS` |

## 6. Door table

Probe: `/private/tmp/abg-td26p1-work/scripts/door-probe.mjs`, run on the base
build (`base-root`) and on the final build (worktree at `ece1625f2`). It
constructs one schema-exact `project.read#ticket_consensus` call with the SDK
constructor (request `caseKey`, `source` of kind `consensus_result`,
`projectionBasis`, the `ticket_consensus` selector; the member's required
authority slots) and presents it at each door. Outputs:
`/private/tmp/abg-td26p1-work/door-base.txt`, `door-final.txt`.

| Door | Base | Final |
| --- | --- | --- |
| Public family (`PUBLIC_FUNCTION_DEFINITION_FAMILY`) | declares the member; locator `./product` `PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.ticket_consensus` | unchanged (declared, same locator, same contracts) |
| SDK `constructInstalledPublicDefinitionCall` | constructs the call | constructs the call (unchanged; the SDK checks contracts, not bindings) |
| `runInstalledDefinitionCallTransport({kind: "eventless"}, call)` | reaches the binding: `installed_definition_call_transport_result`, receipt exit 70, fault `resource_admission/invalid_resource_assertion` "ticket consensus requires one exact typed owner packet" | **refused** `installed_definition_call_transport_refusal`, code `installed_binding_unavailable`, "manifest-bound installed definition member is unavailable" |
| `runInstalledDefinitionCallTransport({kind: "new", eventLogPath: <absent>}, call)` | `acquisition_mismatch` (checked before the binding) | `acquisition_mismatch` (unchanged) |
| `abg.cli --jsonl` (eventless) | exit 70, the same fault as the transport | **exit 2**, `installed_binding_unavailable`, same message |
| `runInstalledDefinitionCallWithResource` (native carrier) | reaches the binding after acquisition | read, not run: the same `selectedCallable` selection as the transport (`public/installed_definition_call_transport.ts:240-299`, called at `:485`), so `installed_binding_unavailable` once acquisition passes |
| `./product` `PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.ticket_consensus` (direct owner call) | present, a function; a direct call with empty resources faults `invalid_resource_assertion` | absent; members `catalog_list`, `catalog_describe`, `workspace_status`, `install_evidence`, `release_evidence` |
| `./product` `hasInstalledPublicResultProjection`, `supportsInstalledPublicResultProjection`, `projectInstalledPublicResult` | functions | `undefined` (not exported) |
| `build/code/src/public/run_projection_authority.js` | loads; exports `constructPublicRunProjectionAuthority`, `parsePublicRunProjectionAuthority` | import fails `ERR_MODULE_NOT_FOUND`; the file is gone from the packed inventory (section 9). It was never a package export path: `./public` exported only its type. |
| Product semantics loader, provider key `publicResultProjectionKinds` | malformed roster refused (`TypeError` "installed Product semantics provider differs from its published binding"); well-formed roster admitted | read, not run: any value admitted and read by nothing (ruling R1, section 15) |

The refusal code is the existing `installed_binding_unavailable`; no refusal
code or message is added. The refusal lane is the `ticket_consensus` row of
`UNAVAILABLE_REQUESTS` in `t287-framework-handoff-types` (section 8) and the
transport assertion in `t287-w2-05-install-catalog-owner-chain`.

## 7. Kept reads over a store that holds admitted Consensus results

No recorded store holds an admitted Consensus result (section 2), including
the lane outputs under `T/test_env/test_runs`, so there is no such store to
read. None was constructed: a Consensus Run's submitter and reviewer are
probabilistic leaf invocations (`implementation/consensus.ts:607`), that is,
model calls, which this package does not make. Over such a store the kept reads
could not differ either: they are ABG ports, P1 changes no file under `abg/`,
and the only read that took an admitted Consensus result through Product
semantics was `ticket_consensus`, which is now refused (section 6). What a kept
read returns over the stores that exist is unchanged, shown three ways:

- **Kept ABG run reads.** `run_status`, `run_result`, `run_replay` and
  `run_evidence` (the ports a Public `project.read` reaches for a Run), over a
  copy of the live rc.12 store and the two fixtures
  `t287-native-assessment-evidence` and `t287-selected-action-authority` read.
  Probe `/private/tmp/abg-td26p1-work/scripts/kept-reads-pair.mjs` writes one
  scratch copy per store and reopens that same file with the base build and
  then the final build, so the prefix coordinate (path, device, inode) is the
  same for both: all three stores identical (output
  `truth/kept-reads-pair.jsonl`). rc.12: four projections; native-assessment
  fixture: three projections and `run_result` refused `target_absent`;
  selected-action fixture: three projections and `run_result` refused
  `target_not_ready`, on both builds. An earlier probe that wrote a fresh
  scratch copy per build is not comparable run to run (the prefix coordinate
  carries the scratch path and inode) and is not used.
- **Kept Public reads in lanes.** `t287-cross-cut-public-read`,
  `t287-historical-source-resource`, `r10-child-proof`,
  `t287-native-assessment-evidence` and `t287-selected-action-authority` pass
  with the same counts on base and final (section 10).
- **Artifact truth** over 25 recorded stores is identical (section 12).

## 8. Tests and fixtures

Commit `ece1625f2`. No file, support module or fixture is deleted.

| File | Change | Reason |
| --- | --- | --- |
| `tests/t287-framework-handoff-types.test.mjs` | `:146` 9 → 10 unavailable; title and `:215` 47 → 46 callable; a `project.read#ticket_consensus` request joins `UNAVAILABLE_REQUESTS` (schema-exact: `caseKey`, `source` of kind `consensus_result`, `projectionBasis`, the `ticket_consensus` selector); `:275` 9 → 10 refused calls | the pin sites; the new table row is the refusal lane: the packed runtime sends the call through `runInstalledDefinitionCallTransport({kind: 'eventless'})` and asserts `installed_definition_call_transport_refusal` / `installed_binding_unavailable` |
| `types/framework-handoff.compile.ts` | `UNAVAILABLE` gains `abg.operation.project.read#ticket_consensus`; length 9 → 10; comment `56 - 10 = 46` | the type-level oracle; `OwnerDefinitionCompositeKey<OwnerUnavailableDefinitionMember>` now includes the member because its binding leaf is gone |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs` | the member leaves `selectedAdditions` and is asserted among the census's unavailable keys; the direct binding call becomes `Object.hasOwn(PRODUCT_PROJECT_READ_DEFINITION_BINDINGS, "ticket_consensus") === false` plus the same call through the installed `./public` transport, refused `installed_binding_unavailable`; the `unavailableRunTruth` `target_absent` claim stays; the proof line's `ticketConsensusUnavailableCode` now carries the transport code | the test used the binding as a vehicle for "the member does not project an unissued result"; the claim stays and now holds at the door |
| `tests/m5-consensus-module.test.mjs` | the `run_projection_authority` import and the authority half of the S05 case go (construction, parse and tamper refusal of `PublicRunProjectionAuthority`), with the two imports only that half used (`pathToFileURL`, `ROOT_EVENT_CONTRACT_DIGEST`); the case keeps its replay-binding claims (`bindConsensusReplay`, `isConsensusResult`, `projectTicketConsensus(result).replayRef`) and its catalog claims, renamed "S05 public result binds real replay" | the authority is retired; the replay binding is kept Consensus behaviour until P2 and no other case asserts `projectTicketConsensus(...).replayRef` (deviation from the plan's "delete the case", section 14) |

`steel-basic-cli-public` and `r10-projection-contracts`, which the plan lists for
edits, name no retired item at `b3bcb1303` and pass unchanged on the final
build (section 10).

## 9. Generated contracts and identity digests

Final build at `ece1625f2` (same output as at `d5508f27d`). Not committed;
the Executive regenerates the identity at merge.

- **`contracts/`.** One file changes: `capabilities/capability-definition-graph.json`.
  No operation contract, schema, `adapter-projection.json` or
  `public-operation.schema.json` changes: the `ticket_consensus` definition,
  its request, result and refusal contracts and the family digest are
  byte-identical to the base.
- **Capability graph rows.** 16 rows on base and final; capability ids,
  owning and projected contract ids and definition-key lists identical
  (`capgraph-cmp.py`: `nonIdentityDiffCount` 0). The changed fields are the
  identity fields only: `capabilityDefinitionRef`, `capabilityDefinitionDigest`,
  `catalogDigest`, `productContentDigest`.
- **`product-toolchain-manifest.json`.** The file inventory loses
  `build/code/src/public/run_projection_authority.{d.ts,js}` (5,306 → 5,304
  locators). The Public contract catalog keeps 75 rows; their declaration
  inventories lose `run_projection_authority.d.ts` and carry new digests for the
  seven changed declaration files. Every other change is a digest or a ref
  derived from one.

| Digest | Base (`b3bcb1303`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:52e13fdc162e1c648e1b8c2c963debc16e26afb4ac77470e7dac9b75ca452f99` | `sha256:7c68bd97aee30316e31b13f873de2acda9cab766de484aabf0313b944fee3bca` |
| `contributionManifestDigest` | `sha256:5f5e27d41c18fd2ff303410fee7fd99e8f5ce9ae8c7601dead583891865be679` | `sha256:4dcffc83537dc2f75b6e21ab106b32e0e971b6f45182be734c129fa88977a321` |
| `publicContractCatalog.catalogDigest` | `sha256:e19931bd2c363bec559bb56c31913ec4d551c574a714f97567a55a7e941d5429` | `sha256:50b29ce1d092b854dab36dd7a387e8181ef1e8cb9937f689fa94c49185c11ae6` |
| capability `graphDigest` | `sha256:ade661144125992e920b6bf59b83b54e5fc963f60d96f88074f6ea48a65b5300` | `sha256:29d7b6a84e8c2c18b7efce2a7ab25b58b1979d1d4cf3fa25efc7fb6483368a89` |

## 10. Lanes before and after

Each file run alone, `node --test --test-concurrency=1`, TAP in
`/private/tmp/abg-td26p1-work/lanes-{base,final,refreshed}/`. Base: `base-root`
(`b3bcb1303`, built). Final: the worktree at `ece1625f2`, built, generated
files present while the lanes ran and restored afterwards. Refreshed:
`final-root` (`git archive ece1625f2`, built, candidate-basis fixture refreshed
with `node scripts/refresh-candidate-basis.mjs`).

| Lane | Base pass/fail/skip | Final pass/fail/skip |
| --- | --- | --- |
| `t287-framework-handoff-types` | 6/0/0 | 6/0/0 (46 callable, 10 unavailable, 10 raw refusals) |
| `t287-w2-05-install-catalog-owner-chain` | 3/0/0 (callable 47; code `resource_relation_mismatch`) | 3/0/0 (callable 46; code `installed_binding_unavailable`) |
| `m5-consensus-module` | 16/0/0 | 16/0/0 |
| `r10-projection-contracts` | 11/0/0 | 11/0/0 |
| `t287-wave2-owner-contract-source-set` | 15/0/0 | 15/0/0 |
| `t287-pfc-f08a-product-verification-boundary` | 1/0/0 | 1/0/0 |
| `t287-st2a-g-capability-definition-graph` | 4/0/0 | 4/0/0 |
| `t292-td60b-evidence-gate-catalogue` | 3/0/0 | 3/0/0 |
| `t287-w2-05-generator-package-reproducibility` | 2/0/0 | 2/0/0 |
| `r1-packed-artifact` | 1/0/0 | 1/0/0 |
| `r2-clean-install` | 1/0/0 | 1/0/0 |
| `r3-workspace-binding` | 1/0/0 | 1/0/0 |
| `steel-basic-cli-public` | 1/0/0 | 1/0/0 |
| `w2-steel-serial-branch-installed` | 0/0/2 | 0/0/2 |
| `w2-steel-single-start-closure` | 1/0/1 | 1/0/1 |
| `w2-steel-single-start-installed` | 0/0/1 | 0/0/1 |
| `w2-steel-single-start` | 7/0/0 | 7/0/0 |
| `t287-default-library` | 34/0/1 (after the fixture fix, section 14) | 34/0/1 |
| `t287-registered-graph-selection` | 1/0/0 | 1/0/0 |
| `t287-recursive-registered-selection` | 7/0/0 | 7/0/0 |
| `t287-native-assessment-evidence` | 4/0/0 | 4/0/0 |
| `t287-selected-action-authority` | 2/0/1 | 2/0/1 |
| `t287-historical-source-resource` | 4/0/0 | 4/0/0 |
| `r10-child-proof` | 10/0/0 | 10/0/0 |
| `t287-cross-cut-public-read` | 5/0/0 | 5/0/0 |
| `t287-st1-installed-cross-owner-hello` | 3/0/0 | 3/0/0 |
| `t287-w2-05-static-binding-algebra` | 3/0/1 | 3/0/1 |
| `t287-release-acceptance` | 6/0/0 | 6/0/0 |
| `t287-release-publication` | 5/0/0 | 5/0/0 |
| `t287-held-operation-bodies` | 1/0/0 | 1/0/0 |
| `t287-public-groups` | 3/0/0 | 3/0/0 |
| `t292-td36r-admitted-binding-owner` | 1/0/0 | worktree 0/1/0 (`artifact_digest_mismatch` against the committed fixture); refreshed 1/0/0 |
| `t292-td36r-bind-door-strings` | 6/0/0 | worktree 0/1/0 (same); refreshed 6/0/0 |
| `t292-td36r-remaining-owners` | 6/0/0 | 6/0/0; refreshed 6/0/0 |
| `t292-td36s-bind-string-rule` | 7/0/0 | 7/0/0; refreshed 7/0/0 |

**Skipped, the same on base and final, because they need a live provider or
retained live evidence** (no model call was made):
`w2-steel-serial-branch-installed` "Thread 4 live success" and "Thread 4
deterministic partial stop" (`ABI5_STEEL04_*`, `ABI5_WAVE1_FROZEN_ARTIFACT_PATH`;
the live arm runs the actor command; the partial stop needs the retained live
success), `w2-steel-single-start-installed` "Thread 3" (`ABI5_STEEL03_*`,
frozen artifact, Claude command), `w2-steel-single-start-closure` case 2
(`ABI5_STEEL03_RETAINED_START_CALL_PATH`), `t287-default-library` case 31
(`ABI5_DEFAULT_LIBRARY_LIVE`), `t287-selected-action-authority` case 3
(`ABI5_SELECTED_ACTION_OWNER_SUBJECT`), `t287-w2-05-static-binding-algebra`
case 4 (`ABI5_PREPARATION_RESOLVE_CALL`).

No case timed out. The base runs of `w2-steel-single-start-closure`,
`w2-steel-single-start-installed` and `w2-steel-single-start` were first
issued together and may have overlapped; each was rerun alone with the same
counts (1/0/1, 0/0/1, 7/0/0), which the table reports.

## 11. Replay comparison

The plan's census over TD-25M's 23 logs
(`/private/tmp/abg-td26p1-work/replay/replay-logs.txt`, script
`scripts/replay-log.mjs`: decode, row kinds, prefix digest, whole replay, the
continuation and fact projections, per-Run replay). Base and final outputs are
byte-identical (`sha256:da9bc9254b835233281a08b2303696aacc97f314356d77de0753d2c7cac2bed9`
both). Per log, on both builds: 5 replay to a digest, 2 replay-refused (the
same messages), 16 decode-refused (9 native-profile stamp, 3 noncanonical
event, 3 admission ordinal, 1 payload variant).

## 12. Artifact truth over recorded stores

- **The five lanes.** `t287-historical-source-resource` 4/0/0,
  `r10-child-proof` 10/0/0, `t287-cross-cut-public-read` 5/0/0,
  `t287-selected-action-authority` 2/0/1, `t287-native-assessment-evidence`
  4/0/0, on base and on final (section 10). No case goes from pass to fail.
- **The live rc.12 store and the census stores.** `projectArtifactTruth` over
  a copy of `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`
  and 24 further recorded stores (`truth/truth-set.txt`): the outputs are
  byte-identical on base and final (`truth-base.jsonl`, `truth-final.jsonl`).
  rc.12: 1,695 rows, 3 artifact admissions, `artifact_truth_projection`
  `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` on
  both. Over the set: 9 project, 16 do not decode (the same 16 as the replay
  census), identically.
- **Recorded locks.** `isResolvedProductLock` and the capability identity
  check over the recorded `product.install` locks of rc.12 and the two
  fixtures (`scripts/probe-lock.mjs`): identical on base and final. Each store
  has one install event with an inline lock (`isResolvedProductLock` true, no
  capability identity mismatch) and one that carries a lock reference.
- **Graph rows.** `contracts/capabilities/capability-definition-graph.json`:
  16 rows; capability ids, owning and projected contract ids and
  definition-key lists identical; only identity fields change (section 9).

No pass-to-fail case, refused projection, changed digest or changed graph row:
no stop condition.

## 13. Whole-word search after the change

Search at `ece1625f2` for `TicketConsensusProjectReadPacket`,
`TicketConsensusOperationResult`, `projectConsensusTicket`,
`ConsensusProjectionPort`, `admittedAuthorityBinding`,
`run_projection_authority`, `PublicRunProjectionAuthority`,
`constructPublicRunProjectionAuthority`, `parsePublicRunProjectionAuthority`,
`public_run_projection_authority`, `publicResultProjectionKinds`,
`hasInstalledPublicResultProjection`, `supportsInstalledPublicResultProjection`
and `projectInstalledPublicResult` over `specification`, `T/code/src`,
`T/scripts`, `T/test_env` (without `test_runs`, `downstream`, `evidence`),
`T/design` and `T/package.json`:

- `specification`, `T/code/src`, `T/scripts`, `T/package.json`, and the tests
  and types under `T/test_env`: no hit.
- Kept design: the passages of section 1.3 (not edited).
- `T/design/history/`: retired sections, out of scope.
- Qualification mirrors: `inventory.json`, `recipe/verification-recipe.json:970-971`,
  `recipe/expected-output-inventory.json:521-522` (not edited, section 1.7).
- `test_env/proof/abi5-root-r10.events.jsonl`: recorded text inside a
  `basis_admitted` row of a committed proof log (recorded history, section 2).

`ticket_consensus` itself stays: the member is declared until P7.

## 14. Deviations

1. **Three `./product` names, not two.** The plan names
   `supportsInstalledPublicResultProjection` and `projectInstalledPublicResult`.
   `hasInstalledPublicResultProjection` reads the same roster and has no
   referrer other than the `./product` barrel, so it goes with the roster.
2. **The identity is not committed.** The plan's common rules say to
   regenerate it; the rules (step 7) forbid committing generated files. The
   Executive regenerates at merge; section 9 gives the digests the build
   produced.
3. **S05 of `m5-consensus-module` is cut, not deleted.** The plan deletes the
   case. Its first half asserts kept Consensus behaviour (replay binding,
   `projectTicketConsensus(...).replayRef`, catalog construction over the
   Consensus publication) that no other case asserts; rules step 6 keeps a
   vehicle test's claim on kept behaviour. Only the authority half goes. P2
   deletes the file.
4. **`steel-basic-cli-public` and `r10-projection-contracts` are not edited.**
   The plan lists them; at `b3bcb1303` neither names a removed item, and both
   pass unchanged on the final build.
5. **An exported type narrows.** `ProductProjectReadResourceAssertion`
   (exported from `./product`) loses its optional `runtime` field. A
   TypeScript caller that sets `runtime` now gets a type error. At run time no
   kept binding ever admitted it: the five kept members' `validResources`
   exact-key check excludes `runtime`, so a kept read that carries it is
   refused `invalid_resource_assertion` on base and final alike (read, not
   run).
6. **Lanes moved to the background.** The tool moves a foreground command to
   the background after 180 s. Every lane still ran alone; the next one
   started only after the notice that the previous one finished.
7. **The base tree first lacked one fixture directory.** `base-root` was
   archived without `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness`,
   which the worktree's sparse checkout includes. The first base run of
   `t287-default-library` failed 23 cases on `ENOENT` for that directory.
   After the directory was added from `b3bcb1303` the base run is 34 pass,
   1 skip; section 10 reports that run. `final-root` carries the directory.

## 15. Residuals and rulings

**Ruling asked: R1. The provider roster key is now inert, not refused.** At
base the semantics loader (`product/semantics.ts`, reached through
`loadInstalledProductSemantics` and `productSemanticsFromModules`, and so by
`forGraphFunction` of the leaf invocation port) refused a provider whose
`publicResultProjectionKinds` was not an array of distinct non-blank strings,
with the existing `TypeError` "installed Product semantics provider differs
from its published binding", and admitted a well-formed roster. At final the
loader no longer names the key: it validates named fields and has no exact-key
check, so a provider that carries any value under the key loads and the value
is read by nothing. This falls short of "retired shape refused, not ignored"
(rules step 5). No fixture, support, UAT or built-in provider carries the key
after P1 (section 1.5). It is the question TD-28D asked as its R2 (an inert
`abg.*` declaration key). The Executive merged TD-28d at `58538e574` with that
key inert: at `b3bcb1303` no source names `abg.worksite_command_forward`.
Neither the merge message, the register nor the T-292 ledger records a ruling
on R2. P1 follows the merged state; this asks to confirm it. Options:

1. Accept the key as inert (what the branch does, as TD-28d merged).
2. Refuse by name with the existing message, as TD-31 and TD-28c refuse
   retired keys: one clause `Object.hasOwn(value, "publicResultProjectionKinds")`
   in the loader's existing refusal condition. This refuses a well-formed
   roster that base admitted, so a Product built against an earlier cut that
   declares one would stop loading (its GraphFunctions get no leaf port).

**P2 residue.** `ProductPublicResultProjection`, the provider hook
`projectPublicResult` and its loader check stay (section 1.4). After P1 no
source calls the hook; its only implementer is `ABI5_SYSTEM_PRODUCT_SEMANTICS`,
which P2 deletes. `gtl/consensus.ts`'s `isConsensusResult`,
`projectTicketConsensus`, `ConsensusResult` and `TicketConsensusProjection`
lose their `product/` importer; they stay exported from `./gtl` and used by
`builtin_semantics.ts` until P2.

**Kept design sentences.** Section 1.3 lists twelve passages in five kept
notes that still describe the removed binding, port, authority or ports item,
including four `ABI5_REALIZATION_CONSTITUTION.md` rows. Not edited (brief).

**Qualification mirrors.** Section 1.7: `inventory.json` and the recipe name
the changed and deleted members, and `expected-output-inventory.json:521-522`
names the deleted build outputs. Not edited (rules).

**The member's withdrawal** stays P7's (plan §5.4): the definition, its four
contracts and register row `abg.capability.operator.public-contract@5` are
unchanged.
