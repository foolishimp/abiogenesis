# TD-28A Return: the `abg.codex` CLI, the adapter exit metadata and the witness residue

Writer: Claude Opus 5.5. Branch `claude/td28a-codex-cli-and-exit-metadata` from
local `main` at `b13bdd5c2`, worktree `/private/tmp/abg-td28a`. Change class:
product_reprice (owner decision of 2026-11-12, register entry TD-28). No push,
no tag.

**Status: items 1 and 3 done; item 2 done and stands only if the Executive
accepts ruling 1 (section 14).** Four kept requirements stated the
row-owned exit classification; I amended them rather than stopping, which is a
stop condition of the rules read strictly. If ruling 1 is refused, item 2 is
exactly `c615c2f4d`, `8536afeca` and `764e758a8`, and reverting those three
applies cleanly (checked) and leaves items 1 and 3 standing. `code/src` +2 −169.
Lanes are unchanged before and after apart from the two new refusal checks;
replay and artifact truth over recorded stores are identical on both builds.

T = `build_tenants/abiogenesis/typescript`. Line numbers are at `b13bdd5c2`.

## 1. Census

### 1.1 The `abg.codex` second CLI

| Surface | Site | Disposition |
| --- | --- | --- |
| Product definition | `specification/PRODUCT.md:1055-1056` ("One bounded Codex projection may delegate to the same public contract. It owns no copied program, traversal, event, continuation, or product behavior.") | delete; `:1057` ("Native operation must not depend on Codex, Claude, or another marketplace host.") stays |
| Product definition, kept | `PRODUCT.md:1233` (host-projection row: "Any retained host adapter is a thin projection …"), `:1473-1474` (Codex/native parity reserved to 5.1; "any retained adapter still owns no copied runtime behavior") | unchanged: general host-adapter law and 5.1 reservations, which hold with no adapter |
| Requirements, kept | `REQ-P-POLICY-015` (`claude`, `codex`, `gemini` are worker transports), `-045` (any host adapter delegates), `REQ-P-QUAL-063`, `-066` (5.1 parity), `REQ-P-SCENARIOS-013` | unchanged, same reason |
| Kept design | `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` §14.2 "Bounded Codex projection" (`:3434-3459`), `:3278`, `:3405-3406`; `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:97`, `:2112`, `:2269`, `:2276`; `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md:745`; `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:68`, `:85`, `:108`, `:2095-2096`, `:2265`, `:3202`, `:3229`, `:3365`, `:3429` | §14.2 cut whole; the other lines restated |
| Constitution (not edited) | `ABI5_REALIZATION_CONSTITUTION.md:2738`, `:3000`, `:3058` name Codex beside SDK and CLI | listed |
| Source | `code/src/public/codex_cli.ts` (77 lines): imports only `node:child_process`, `node:fs`, `node:path`, `node:url`; nothing imports it | delete |
| Package metadata | `T/package.json:13` `"abg.codex": "./build/code/src/public/codex_cli.js"`; `T/package-lock.json:28` (the same bin in the lock's root package entry) | delete both lines |
| Scripts | none names it; `scripts/product-payload.mjs:103-104` takes every `bin` target into the payload generically | unchanged |
| Tests | `m5-installed-portability.test.mjs:427-449`, the Codex half of "S06 Codex delegate and flavored Product keep their public boundaries" (a source scan of `codex_cli.ts`) | Codex half deleted, flavored-Product half kept and retitled |
| Test support | `support/root-cli-environment.mjs:225` `codexPath` (no reader) | delete |
| Qualification mirrors (not edited) | `test_env/qualification/inventory.json`, `recipe/expected-output-inventory.json`, `recipe/verification-recipe.json` rows for `code/src/public/codex_cli.ts` and the `package.json` digest | listed in section 7 |

Retired-name set for the closing search: `abg.codex`, `codex_cli`,
`codexPath`, "Codex projection", "Codex delegate", "Codex shell", and "Codex"
where it names an adapter beside SDK and CLI. Not in the set: Codex as a
worker transport (`REQ-P-POLICY-015`), Codex/native parity reserved to 5.1,
the paused `build_tenants/abiogenesis/codex/` tenant, and
`.ai-workspace/comments/codex/` paths.

### 1.2 The adapter exit metadata

Declarations (`code/src/shared/public_function_contracts.ts`):
`PublicAdapterProfile` (`:39`), `PublicAdapterExitMap` (`:40-46`),
`TERMINAL_ONLY_ADAPTER_EXIT_MAP` (`:48-54`),
`RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP` (`:56-62`), the `adapterExitMap` member
of `OwnerContractSourceDeclaration["metadata"]` (`:451`) and its copy in
`ownerMetadata` (`:655`).

Carriers, which pass it on and decide nothing by it:

| File | Sites |
| --- | --- |
| `public/binding/public_function_family.ts` | import `:18`; `IntrinsicPublicFunctionDefinition.adapterExitMap` `:90`; `adapterCoordinateByDefinition[].adapterExitMap` `:162`; definition fields `:299` (inside the `definitionDigest` preimage); operation row `:449` (inside the `rowDigest` preimage) |
| `public/binding/public_function_projections.ts` | `PublicCliGrammarProjection.adapterExitMap` `:86`; `cliGrammar` rows `:738` |
| 13 operation-contract declarations, each importing one const and passing `adapterExitMap:` per packet | `product/catalog_operation_contracts.ts` (3 sites), `product/environment_operation_contracts.ts` (2), `product/install_operation_contracts.ts` (1), `product/interaction_operation_contracts.ts` (2), `product/materialization_operation_contracts.ts` (1), `product/project_read_operation_contracts.ts` (1), `product/release_snapshot_operations.ts` (1), `product/run_operation_contracts.ts` (2), `product/verification_operation_contracts.ts` (1), `product/workspace_operation_contracts.ts` (2), `abg/project_read_operation_contracts.ts` (1), `abg/witness_operation_contracts.ts` (1), `validator/conformance_operation_contracts.ts` (1) |

Package export: `code/src/app/m04.ts:3` re-exports
`shared/public_function_contracts.js` with `export *`, so the two consts and
the two types are names of `@abiogenesis/typescript-tenant/app/m04`. No test,
fixture or UAT module imports them from there.

Nothing reads the metadata (read, not grepped only):

- Exit codes come from two owners. `shared/effect_definition.ts`
  `runExactDefinition` sets `exitCode` 0 (result), 1 (refusal), 3
  (non-terminal) or 70 (execution failure) on the host receipt. `public/cli.ts`
  exits 2 on an argument, file, JSON or transport-request failure and on a
  transport refusal (`:87`, `:98`, `:108`, `:117`, `:129-132`, `:140`), and
  otherwise exits with `receipt.exitCode`. Neither reads a map.
- `public/installed_definition_call_transport.ts` and the transport path do
  not name it.
- Scripts: no hit.
- `product/verify_product.ts:1547-1551` compares the artifact's whole adapter
  projection with the host's by canonical equality. That is an integrity check
  of the published asset; it reads no field of it.
- Tests: `t287-wave2-owner-contract-source-set.test.mjs:641` lists
  `"adapterExitMap"` in the exact key set of a family definition. No test
  reads a value.

Correspondence check on the base build, over all 56 definitions: every map
has `acceptedTerminal` 0, `refused` 1, `invalidInvocation` 2 and
`adapterFailure` 70, and `acceptedNonTerminal` is 3 exactly when the
definition declares a non-terminal contract (10 definitions) and `null`
otherwise (46). The map carries nothing that the declared non-terminal
contract and the one runner do not already fix.

Specification that states the row-owned exit classification:
`REQ-P-PUBLIC-CONTRACTS-009` ("adapter exit classification"),
`REQ-P-POLICY-020` ("exit semantics"), `REQ-P-POLICY-039` ("exit contracts"),
`REQ-P-POLICY-064` ("adapter exit classification"). `REQ-P-POLICY-022`
(SDK and CLI preserve the same exit classification) is parity through the one
runner and stays.

Kept design: `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:68`,
`:108`, `:188`, `:379`, `:475`, `:861`, `:1863-1864`, `:2148-2150`,
`:2246-2262` (the adapter profiles), `:2268-2289` (the "Adapter profile"
column), `:3342`; `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2141-2142`.
Constitution (not edited): `ABI5_REALIZATION_CONSTITUTION.md:1630` (adapter
exit `70`).

Generated content that carries it: `contracts/public-functions/adapter-projection.json`
(56 `cliGrammar` rows), the 18 `contracts/public-operations/**/operation-contract.json`
(56 `adapterCoordinateByDefinition` rows), `contracts/schemas/public-operation.schema.json`
(56 occurrences in the operation-row constants). Because the map is in the
definition and row digest preimages, every public `definitionDigest`, the
`familyDigest` and every operation `rowDigest` and `rowRef` change.

### 1.3 The witness residue

| Site | Lines | Readers |
| --- | --- | --- |
| `abg/witness_operation_contracts.ts` interface `WitnessAdmissionPort` | `:163-172` | none |
| `abg/witness_admission_operation.ts` const `WitnessAdmissionPort` | `:1217-1219` | only the duplicate map below |
| `abg/witness_admission_operation.ts` duplicate map `WITNESS_OPERATION_CONTRACTS` (every member `admitWitnessedAct`) | `:1221-1230` | none |

The live packet map `WITNESS_OPERATION_CONTRACTS` is in
`abg/witness_operation_contracts.ts:152`; `abg/index.ts:535`, the owner source
set (`public/binding/owner_contract_source_set.ts:3`, `:206`), the definition
bindings (`abg/witness_definition_bindings.ts:51`), the UAT continuation
(`a.WITNESS_OPERATION_CONTRACTS`, the `./abg` barrel) and the tests import
that one. The tests that load `abg/witness_admission_operation.js` as a
namespace read `WITNESS_CONTENT_CONTRACTS`, `WITNESS_ADMISSION_MEMBER_KEYS`
and `admitWitnessedAct` only; `loadMechanism`
(`support/witness-reprice-mechanics.mjs:26-41`) transpiles the module and
enumerates no export of it.

Kept design: `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2183`
(row `D12`), `:2220` (rows 46-51); `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:644`.
Constitution (not edited): `ABI5_REALIZATION_CONSTITUTION.md:1936`
(`WitnessAdmissionPort.admit`).

Not removed: `WORKSPACE_HYGIENE_CLASSIFICATION_VALUES`
(`witness_admission_operation.ts:205`). The review names it unused, and its
own Retire line keeps it as the type of a single hygiene classifier; the
register's "const" is the `WitnessAdmissionPort` const.

## 2. Recorded history

Searched the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace`
over every `*.json` (236,323 files, 94.36 GB), `*.jsonl` (4,350 files,
65.43 GB) and `*.ndjson` (1,694 files), plus `T/test_env/proof` (4 files) and
`T/test_env/fixtures` (93 files) in the worktree and the main checkout.

| Name | Files | Matches |
| --- | ---: | ---: |
| `codex_cli` | 8,905 | 42,781 |
| `abg.codex` | 4,683 | 6,219 |
| `adapterExitMap` | 15,803 | 127,070 |
| `WitnessAdmissionPort` | 3,054 | 8,676 |

- `adapterExitMap` as a JSON key occurs only in `.json` files (12,083): 10,674
  `operation-contract.json`, 605 `public-operation.schema.json`, 593
  `adapter-projection.json` copies of earlier generated contracts, and recorded
  CLI `*-command.json` request files. No `.jsonl` log carries it as a key.
- Every `.jsonl` hit, including 32 event logs, is declaration source text
  embedded as data, for example the `basis_admitted` payload path
  `rawInputValue/proof/declarations/0/catalog/readinessBasis/verifiedProducts/0/nativeDeclarationEvidence/sources[*]/sourceText`.
  Replay reads it as bytes and executes none of it.
- `test_env/proof` and `test_env/fixtures`: no hit for any of the four names.
- Recorded `definitionDigest` values: the base public definition digests occur
  in 13,324 evidence files, among them 223 event logs and the RC12 live events.
  ABG replay does not import the public-function family; a definition digest is
  compared only when a new call is admitted (section 6, row 4).

The recorded-history stop condition does not hold: no recorded log needs the
retired code to decode or replay (section 10).

## 3. Specification

| Item | Requirement or section | Edit |
| --- | --- | --- |
| 1 | `specification/PRODUCT.md:1055-1056` | deleted "One bounded Codex projection may delegate to the same public contract. It owns no copied program, traversal, event, continuation, or product behavior."; "Native operation must not depend on Codex, Claude, or another marketplace host." stays |
| 2 | `REQ-P-PUBLIC-CONTRACTS-009` | drops "adapter exit classification, " from the operation-row contents |
| 2 | `REQ-P-POLICY-020` | drops "exit semantics, " from the per-operation declaration |
| 2 | `REQ-P-POLICY-039` | "publish exact request, result, refusal, and provenance contracts" (drops "exit") |
| 2 | `REQ-P-POLICY-064` | "mutation class, typed refusals, and disposition." (drops "adapter exit classification") |
| 3 | none | the residue had no specification |

Identifiers are unchanged. Kept: `REQ-P-POLICY-022` (SDK and CLI preserve the
same exit classification; it holds through the one runner),
`REQ-P-POLICY-015`, `-045`, `REQ-P-QUAL-063`, `-066`, `REQ-P-SCENARIOS-013`,
`PRODUCT.md:1231` and `:1471-1472` (general host-adapter law and the reserved
5.1 Codex parity claim, which hold with no adapter present).

## 4. Design

Cuts are verbatim in `T/design/history/<NOTE>__RETIRED_SECTIONS.md`, each
block headed "Cut from `<note>` at commit `<c>`, lines …, verbatim.".

| Item | Note | Lines cut (at commit) | Kept text now says |
| --- | --- | --- | --- |
| 1 | `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 3278, 3405-3407, 3433-3459 (§14.2 "Bounded Codex projection", whole) at `882b71e64` | the native CLI (`public/cli.ts`) submits serialized values through `runInstalledDefinitionCallTransport` (`public/installed_definition_call_transport.ts`) |
| 1 | `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` | 97-98, 2112-2113, 2269-2270, 2276 at `882b71e64` | the same sentences without Codex |
| 1 | `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` | 745-746 at `882b71e64` | "Codex shell" removed from the owner list; new history file, pointer line under the title, entry in `history/README.md` |
| 1 | `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | 68, 85, 108, 2095-2096, 2265, 3202, 3229, 3365, 3429 at `882b71e64` | the same rows without Codex |
| 3 | `M05_S06_AXIOMATIC_…` | 2185 (row D12), 2222 (rows 46-51) at `db93b3c50` | `admitWitnessedAct` (`abg/witness_admission_operation.ts`); packets `WITNESS_OPERATION_CONTRACTS` (`abg/witness_operation_contracts.ts`); `WITNESS_DEFINITION_BINDINGS` (`abg/witness_definition_bindings.ts`) binds `reprice` and `run-stopped` |
| 3 | `M05_S06_PUBLIC_FUNCTION_…` | 644 at `db93b3c50` | `admitWitnessedAct` (`abg/witness_admission_operation.ts`) |
| 2 | `M05_S06_PUBLIC_FUNCTION_…` | 68, 108, 188, 379, 475, 861, 1863-1864, 2134-2135, 2140-2141, 2148-2150, 2245-2266 (adapter profiles), 2270-2289 (table with the "Adapter profile" column), 3342 at `c615c2f4d` | exit codes come from `runExactDefinition` (`shared/effect_definition.ts`: 0, 1, 3, 70) and `public/cli.ts` (2 on transport refusal); the projection refusal has no producer at head, a contract-invalid owner output is the fault `invalid_owner_output` (`public/binding/static_definition_bindings.ts`), exit 70; the §4.6 table keeps its other columns |
| 2 | `M05_S06_AXIOMATIC_…` | 2143-2146 at `c615c2f4d` | the same restatement |

Constitution passages listed, not edited (`T/design/ABI5_REALIZATION_CONSTITUTION.md`):
`:1630` ("adapter exit `70`"), `:1936` (`WitnessAdmissionPort.admit` as the
`witness.admit` export), `:2738`, `:3000`, `:3058` (Codex beside SDK and CLI).

## 5. Source lines removed

`git diff --numstat b13bdd5c2`:

| Surface | Added | Removed |
| --- | ---: | ---: |
| `T/code/src` | 2 | 169 |
| `T/test_env` | 32 | 23 |
| `specification` | 6 | 8 |
| `T/design` kept notes | 77 | 111 |
| `T/design/history` | 179 | 0 |
| `T/package.json`, `T/package-lock.json` | 2 | 4 |

By item, `code/src`: item 1 −77 (`public/codex_cli.ts`); item 3 −27
(`witness_admission_operation.ts` −15, `witness_operation_contracts.ts` −12);
item 2 +2 −65 (`shared/public_function_contracts.ts` −26,
`public_function_family.ts` −5, `public_function_projections.ts` −2, 13
operation contract files −32 +2 for the one-line release snapshot form).

Closing whole-word search over `specification`, the kept design notes,
`T/code`, `T/scripts`, `T/test_env` (without `test_runs`, `downstream`,
`evidence`) and `T/package*.json`, `history/` excluded, for `abg.codex`,
`codex_cli`, `codexPath`, `adapterExitMap`, `PublicAdapterExitMap`,
`PublicAdapterProfile`, `TERMINAL_ONLY_ADAPTER_EXIT_MAP`,
`RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP`, `WitnessAdmissionPort`, "adapter exit
map", "adapter exit class", "adapter profile", `terminal_only`,
`runtime_nonterminal`, and Codex within 40 characters of SDK or CLI. Remaining
hits: the two refusal lanes (`m5-installed-portability.test.mjs:435`,
`t287-pfc-f08a-product-verification-boundary.test.mjs:548`), the constitution
(`:1936`, listed) and the qualification mirrors (section 7). Codex otherwise
remains only as a worker transport, the reserved 5.1 claim (`REQ-P-QUAL-066`)
and agent comment paths.

## 6. Doors and tests

| Door | Base | Final | Shown by |
| --- | --- | --- | --- |
| A user invokes `abg.codex` in an installed host | the package links `node_modules/.bin/abg.codex` | nothing is installed under the name: `node_modules/.bin/abg.codex` does not exist (`ENOENT`), the package's `bin` keys are `['abg.cli']`, and `abg.cli` is the only linked `abg.*` command | new m5 lane "S06 the installed package links abg.cli as its only command" |
| An artifact's adapter projection carries `adapterExitMap` in its `cliGrammar` rows | that is the host projection; `verifyProduct` verifies | `verifyProduct` refuses with `catalog_mismatch`, "the artifact does not declare the selected exact 18/56 public-function family" (`product/verify_product.ts:1547-1551`); no new refusal code | new PFC-F08A case `cli-grammar-adapter-exit-map` |
| `import { TERMINAL_ONLY_ADAPTER_EXIT_MAP } from "@abiogenesis/typescript-tenant/app/m04"` | resolves to the map | `SyntaxError: … does not provide an export named 'TERMINAL_ONLY_ADAPTER_EXIT_MAP'` at link; the namespace has neither const | probe on both builds; no test, fixture or UAT module imports these names |
| A recorded call carrying a base `definitionDigest` is submitted to the final build | admitted | refused before any effect: transport refusal `invalid_definition_call`, CLI exit `2`, no event log and no install target created; an existing code, no new one | probe: a scratch copy of the steel lane with one extra mutation (the base `product.install` digest `sha256:d595b9b1…a135`, invocation rehashed), 1 of 1 pass on the final build; evidence `/private/tmp/abg-td28a-work/probe-evidence.json` |

Rows 1 and 2 are the two doors the brief names. Rows 3 and 4 are further
observations of names and values the retirement moves. Row 4 is the retired
shape refused: a base `definitionDigest` commits to the definition including
`adapterExitMap`, so a call that names it names the retired shape.

Item 3 has no door. `./abg` re-exports only `WITNESS_OPERATION_CONTRACTS` from
`abg/witness_operation_contracts.ts` and `WITNESS_CONTENT_CONTRACTS` from
`abg/witness_admission_operation.ts` by name (`abg/index.ts:535-536`); no
package export star-exports either module. On both builds the `./abg` namespace
has no `WitnessAdmissionPort`, and `WITNESS_OPERATION_CONTRACTS.admit` holds the
six packets (`admit.reprice` is an object with `definitionKey`
`abg.operation.witness.admit#reprice`), not the removed function map.

The four witness acts (`attest`, `hygiene-stamp`, `intake`, `run-resumed`) keep
their packets, `admitWitnessedAct` and their unbound state; the witness
packets lose only `adapterExitMap` with every other definition (item 2).

Test edits:

- `m5-installed-portability.test.mjs`: the Codex source-scan half of "S06
  Codex delegate and flavored Product keep their public boundaries" deleted;
  the flavored-Product half kept as "S06 flavored Product keeps its public
  boundaries"; new lane above.
- `support/root-cli-environment.mjs`: `codexPath` removed (no reader).
- `t287-pfc-f08a-product-verification-boundary.test.mjs`: the new refusal case
  reinserts the exact base map into every `cliGrammar` row (`acceptedNonTerminal`
  3 where the SDK member has a non-terminal schema, else `null`).
- `t287-wave2-owner-contract-source-set.test.mjs`: `"adapterExitMap"` dropped
  from the exact definition key list.

Both new refusal checks fail on the base build for the intended reason, run as
scratch copies against base: the m5 lane fails at `Object.keys(bin)`
(`['abg.cli', 'abg.codex']` against `['abg.cli']`); the PFC-F08A case
`cli-grammar-adapter-exit-map` gets `verified_product_artifact` where it expects
`product_verification_refusal`. Both pass on the final build.

## 7. Generated contracts, identities and qualification mirrors

Contract content changes, final build against base (`T/contracts`):

| File | Member change | Other changes |
| --- | --- | --- |
| `public-functions/adapter-projection.json` | 56 `cliGrammar[i].adapterExitMap` removed | `family.familyDigest`, every `definitionDigest` and `definitionRef` |
| 18 `public-operations/**/operation-contract.json` | 56 `adapterCoordinateByDefinition[i].adapterExitMap` removed (catalog/admit 1, catalog/apply 2, catalog/view 1, conformance/evaluate 1, interaction/respond 5, product/install 1, product/materialize 2, product/resolve 1, product/verify 1, project/read 24, release/snapshot 2, result/assess 1, run/continue 2, run/invoke 2, witness/admit 6, workspace/bind 1, workspace/create 2, workspace/open 1) | definition digests and refs, `rowDigest`, `rowRef` |
| `schemas/public-operation.schema.json` | 56 `adapterExitMap` members removed from the row constants | the same digests |
| `capabilities/capability-definition-graph.json` | none | digests and refs; `rows[9].owningPublicContracts` reorders because owner coordinates sort by canonical JSON, digests included (`shared/capability_contracts.ts:363-368`) |
| `product-toolchain-manifest.json` | `productRelativeLocators` loses `build/code/src/public/codex_cli.js` and `.d.ts` (item 1) | digests |

Items 1 and 3 alone changed only digests and refs in the graph (and the
manifest locators for item 1).

| Identity | Base `b13bdd5c2` | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:b3b89acc1adcbbef1e5b04e3f0669382cc257d1450fd432c588ed0797d4b54f4` | `sha256:41745691692a21f0e38dca8fca3d79ad7211a8ae55d6712c19e3237f40777cc9` |
| `contributionManifestDigest` | `sha256:b3e65b46088b250900e1ffea76ad58a984ef8a525ab106ed95b6dd2297c5f5bc` | `sha256:03dbf95defad1c8116c0f46a4b282e28694df2e8649dad93df20a9e69ad1e3a7` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | `sha256:871bba012c24ac6c7c9900991dbcd2aad0f20d65aceb742e18ed200c2fe976d4` |
| capability graph `graphDigest` | `sha256:8a7486def91432c08f3763e4c10d08fdc30e7276de50ed3a96ee28671e51277e` | `sha256:7800c65d036fb66e0e1a5976ce2c2660bf3e384b18c8c5dc65b3ccb25660367f` |
| public family `familyDigest` | `sha256:6452adb0a3a4ee6057e4df3872f60d7ccffdbaba64b405203a582fc77d49cbf1` | `sha256:94a6be2ff37b0cd1cb35073288553dcbc4a1bd7af470ec5aa7691a64a4f579b1` |
| `EXACT_OWNER_CONTRACT_KEY_SET_DIGEST` | `sha256:61077d017dbbe0bd071f312066d27bc6535a732aa9da00cd543a70506ec24a4f` | unchanged |

Generated files were restored after every build (`git checkout -- contracts
product-toolchain-manifest.json test_env/fixtures/abi5-root-candidate-basis.json`).

Qualification mirrors, not edited. Rows that no longer match:

- `test_env/qualification/inventory.json` and
  `recipe/verification-recipe.json` (`:950-951` names `code/src/public/codex_cli.ts`):
  the deleted member `code/src/public/codex_cli.ts`; changed digests for the 17
  changed `code/src` files, the four kept design notes, `package.json`,
  `package-lock.json`, `test_env/support/root-cli-environment.mjs` and the three
  changed test files; the added
  `design/history/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN__RETIRED_SECTIONS.md`
  and the changed history files are not listed members.
- `recipe/expected-output-inventory.json`: `:511-512`
  (`build/code/src/public/codex_cli.d.ts`, `.js`) name deleted outputs; the
  `package.json` row and the rebuilt outputs and contracts carry base digests.

## 8. Commits

On `claude/td28a-codex-cli-and-exit-metadata`, oldest first:

| Commit | Content |
| --- | --- |
| `cc02a86e0` | census (this Return's skeleton) |
| `882b71e64` | item 1, specification |
| `dc863203a` | item 1, design |
| `db93b3c50` | item 1, code and tests (`codex_cli.ts`, `bin`, lock, `codexPath`, m5 lane) |
| `2869f3e5d` | item 3, design |
| `65bffbe0c` | item 3, code |
| `c615c2f4d` | item 2, specification |
| `8536afeca` | item 2, design |
| `764e758a8` | item 2, code and tests |
| the next commit | this Return |

## 9. Lanes before and after

Base: a copy of the worktree at `b13bdd5c2` with its build
(`/private/tmp/abg-td28a-work/base-root`). Final: a copy at the item 2 code
commit with the final build and its generated contracts and manifest
(`/private/tmp/abg-td28a-work/final-root`). One file at a time, the rules'
command, `ABI5_EVIDENCE_ROOT` set; `T/artifacts/setup020` removed before the
harness. TAP in `lanes-before/` and `lanes-after/` there.

| Lane | Before (tests/pass/fail/skip) | After | Per-test change |
| --- | --- | --- | --- |
| `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-public-groups` | 3/3/0/0 | 3/3/0/0 | none |
| `hello-product-boundary` | 1/1/0/0 | 1/1/0/0 | none |
| `test_env/uat/harness.test.mjs` | 33/33/0/0 | 33/33/0/0 | none |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | none |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | none |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-default-library` | 37/34/0/3 | 37/34/0/3 | none |
| `m5-installed-portability` | 8/8/0/0 | 9/9/0/0 | retitled case; new lane |
| `t287-wave2-owner-contract-source-set` | 15/15/0/0 | 15/15/0/0 | none |
| `t287-pfc-f08a-product-verification-boundary` | 1/1/0/0 | 1/1/0/0 | one more refusal case inside the test |
| `witness-reprice-definition-binding` | 15/14/1/0 | 15/14/1/0 | none; case 14 is the known red on main, same message |
| `witness-run-stopped-definition-binding` | 7/7/0/0 | 7/7/0/0 | none |
| `integration-shared-seams` | 2/2/0/0 | 2/2/0/0 | none |
| `t287-selected-action` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-framework-handoff-types` | 6/6/0/0 | 6/6/0/0 | none |
| `t287-runtime-failure-diagnostic` | 21/21/0/0 | 21/21/0/0 | none |

The main CLI's behaviour is unchanged on the four lanes the brief names
(steel, public groups, hello boundary, UAT harness).

Build and lints on the final source: `npm run build`, `lint:imports`,
`lint:lifecycle` and `lint:calculus` exit 0, as they did after items 1 and 3.

## 10. Replay

The brief waived the replay because no runtime path changes. That premise does
not hold for item 2: the exit map is inside the `definitionDigest` preimage,
and definition digests are stamped into invocations and events
(`public/installed_public_definition_call.ts:330`,
`owner_bindings/run_invocation.ts:741`, `abg/invocation_execution_truth.ts:471`,
`abg/artifact_truth.ts:774`). I ran it.

The eleven TD-25R logs replayed with the final build give output identical,
line for line, to the base build (11 of 11 lines equal: row counts, kinds,
prefix digests, whole-log and per-Run replay results, the two whole-log
refusals and the four decode refusals).

The replay folds logs; it does not continue a Run. Continuation across the
upgrade was checked by reading every comparison of a public
`definitionDigest` in `code/src`. Each compares the current call with the
current family (`public/binding/definition_binding_mechanics.ts:394`,
`product/invocation.ts:920`, `product/admission_authority.ts:389`,
`abg/invocation_admission.ts:1277`, where `basis` and `requestBasis` are both
the new run.invoke call) or two recorded values inside one artifact or event
(`abg/artifact_truth.ts:495`, `implementation/release_publication.ts:157-168`,
`abg/invocation_execution_truth.ts:467-471`, a shape check). Continuations stamp
the new call's digest beside recorded fields and compare neither
(`abg/construction_continuation.ts:490`). No path compares a digest recorded
under the base family with the final family, so a Run recorded on base
continues on the final build as far as the public definition digest goes. The
product identity itself moves with every item, item 1 included; that is the
brief's accepted consequence, not this item's.

Base digests pinned outside the generated contracts and the qualification
mirrors: all 56 base definition digests, the 18 base row digests, the base
family, catalog, graph and product digests searched in `T/code`, `T/scripts`,
`T/test_env` (without `test_runs`, `downstream`, `evidence`, `qualification`),
`T/design`, `specification` and `build_tenants/common`. One hit:
`test_env/fixtures/abi5-root-candidate-basis.json` pins the base
`productContentDigest`; it is read only under
`ABI5_CANDIDATE_BASIS_SOURCE=committed` and is regenerated on main by
`scripts/refresh-candidate-basis.mjs` (generated, not mine to commit).
`ABG_EVENT_RESOURCE_RECOVERY_DIGEST` is computed
(`abg/definition_event_resource.ts:413`) over a constant that names no public
definition.

Script and inputs:
`/private/tmp/abg-td28a-work/scripts/replay-log.mjs`,
`/private/tmp/abg-td28a-work/replay-logs.txt`; outputs
`replay-base.jsonl`, `replay-final.jsonl` in the same directory.

## 11. Artifact truth over recorded stores

Added at the Executive's request: replay does not exercise artifact truth.

Direct probe. `projectArtifactTruth` (`abg/artifact_truth.ts`) over a copy of
the live rc.12 default-library store
(`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`, sha256
`440994c0…6a511`, 1,695 rows, 3 artifact admissions), with the TD-25M Writer's
`probe-artifact-truth.mjs` and `probe-lock.mjs` copied to
`/private/tmp/abg-td28a-work/scripts/`:

| Build | Outcome | Digest | `isResolvedProductLock` on the inline `product.install` lock | Capability identity mismatches |
| --- | --- | --- | --- | --- |
| base | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true | 0 |
| final | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true | 0 |

The same projection over the other ten replay logs is identical on both builds,
11 of 11 lines (seven projections with equal digests, the same four decode
refusals). Outputs: `truth-base.jsonl`, `truth-final.jsonl` in
`/private/tmp/abg-td28a-work/`.

Capability graph rows, base build against final build
(`contracts/capabilities/capability-definition-graph.json`): 16 rows each; the
capability ids, their order, the owning contract ids and definition keys, and
every other row member are identical with digests masked. Rows 9 and 11 list
their owning contracts in another order because owners sort by canonical JSON
with digests included (`shared/capability_contracts.ts:363-368`). This package
does not change the register (`shared/capability_contracts.ts`).

Lanes over recorded stores, one file at a time with `ABI5_EVIDENCE_ROOT` set,
on the base and final copies (TAP in `lanes-extra-base/`, `lanes-extra-final/`):

| Lane | Base (tests/pass/fail/skip) | Final | Per-test change |
| --- | --- | --- | --- |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | none |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-cross-cut-public-read` | 5/4/1/0 | 5/4/1/0 | none; case 1 is the known read-count red, expected 1053 and actual 12477 on both builds |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | none; case 3 skips on both builds (`ABI5_SELECTED_ACTION_OW…` unset) |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | none |

No case goes from pass to fail, and the projection of the rc.12 store neither
refuses nor changes digest on the final build. No stop condition.

## 12. Deviations

- `T/package-lock.json:28` also carried the `abg.codex` bin; removed with the
  `package.json` entry so the lock matches the manifest.
- Replay run although waived (section 10).
- Item 2 changes four requirement texts (section 3). The brief retires the
  declaration and its publication; these clauses required each operation row to
  carry the classification, so they had to change with it. Correspondence
  checked first: all 56 maps were fixed by the runner and the declared
  non-terminal contract.

## 13. Residuals

- `WORKSPACE_HYGIENE_CLASSIFICATION_VALUES`
  (`abg/witness_admission_operation.ts:205`) kept: the review's own Retire line
  keeps it as the hygiene classifier's type.
- Constitution passages in section 4.
- `REQ-P-QUAL-066` ("Mandatory Codex projection qualification is reserved for
  5.1") kept with the other 5.1 reservations.
- The projection refusal (`OutcomeProjectionRefusal`) has no producer at head;
  the restated design says so. Not in this package's scope.
- Qualification mirror rows in section 7.
- `test_env/fixtures/abi5-root-candidate-basis.json` still pins the base
  `productContentDigest`; regenerate on main with
  `scripts/refresh-candidate-basis.mjs` after the build, as for earlier
  packages.
- `T/design/history/README.md:5` gives the provenance of the first 24
  retired-section files by commit; it names no total, and the 29 files now
  present (28 at base) are each listed below it. The new file is listed, as
  TD-25S did for its two.

## 14. Rulings needed

1. The four requirement clause removals (`REQ-P-PUBLIC-CONTRACTS-009`,
   `REQ-P-POLICY-020`, `-039`, `-064`). These kept requirements stated the
   classification the item retires; item 2 stands only if they change. If
   refused, revert `764e758a8`, `8536afeca`, `c615c2f4d` (clean).
2. Every public `definitionDigest`, the `familyDigest`, every operation
   `rowDigest`/`rowRef` and the catalog, graph and product digests move. Old
   logs replay unchanged and their artifact truth projects unchanged; a
   recorded call that names a base definition digest is refused at admission by
   the final build (section 6, row 4); a host on one family refuses an artifact
   declaring the other at `verifyProduct` (`product/verify_product.ts:1547-1551`),
   as for any family change. This includes the witness operations: the
   `witness/admit` operation contract loses six `adapterExitMap` members and
   all six witness `definitionDigest`s move with every other definition. The
   four unbound acts keep their packets, request, result and refusal contracts,
   `admitWitnessedAct` and their unbound state; only the digests change, through
   item 2, not item 3.
