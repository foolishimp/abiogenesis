# TD-28A Return: the `abg.codex` CLI, the adapter exit metadata and the witness residue

Writer: Claude Opus 5.5. Branch `claude/td28a-codex-cli-and-exit-metadata` from
local `main` at `b13bdd5c2`, worktree `/private/tmp/abg-td28a`. Change class:
product_reprice (owner decision of 2026-11-12, register entry TD-28). No push,
no tag.

**Status: census committed; work in progress.**

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
