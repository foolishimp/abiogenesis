# TD-76 Return: one record schema refuses the three skipped names and an array

Writer: Claude Opus 5.5. Branch `claude/td76-record-schema-keys` from local
`main` at `21c108af0`, worktree `/private/tmp/abg-td76` (sparse). Change class:
realization_refactor with a Public-contract change (the serialization schema
and the admitted set). No push, no tag. T = `build_tenants/abiogenesis/typescript`.
Scratch: `/private/tmp/abg-td76-work/`. `EV` = `/Users/jim/src/apps/abiogenesis/.ai-workspace`.
Line numbers are at `21c108af0` unless marked "now".

**Status: Done, with one departure from ruling 2: the shared `jsonValueSchema` is reached by callers but is not adopted, and is handed back for a ruling (R1). Seventeen record uses adopt one helper (`recordSchema`, `shared/public_function_contracts.ts`). Every door that reaches them refuses the three names and an array with its existing refusal, in JSON text and in process. The serialization schema states the key rule as `propertyNames` at 13 positions. A value without the names is admitted with identical output. The 76 kept lanes are unchanged test by test, and artifact truth and replay are identical.**

## 1. Census and differential

The search is `v.record` under `T/code/src`. It finds 21 uses in 6 files, and
no alias of `v.record` or other record-shaped schema from the library exists
there. "Today" is measured on the base build (`base-T`), through the door
that reaches the use with a caller's value. Three scratch scripts measure it:

- `probe/doors.mjs` covers the doors of the GTL owner and the run door's
  Catalog, with 133 cases and 444 door cells in both forms.
- `probe/census.mjs` covers the shared JSON value, the semantic job records
  and the prerequisites declaration.
- The lane's diagnostics cover every adopted use at its door (section 6).

Valibot 1.4.2 `record` (`node_modules/valibot/dist/index.mjs:6073`) walks the
input with `for … in`. It skips every key for which `_isValidObjectKey`
(`:481`) is false: a key that is not own, or one of `__proto__`, `prototype`
and `constructor`. A skipped member is never checked and is absent from the
output. Any input whose `typeof` is `"object"` passes the type check, so an
array is a record: `[]` gives `{}` and `["x"]` gives `{"0": "x"}`. What a
caller sees depends on what the consumer keeps:

- a consumer that keeps the schema output (the run door's binder, through
  `admitContract`) loses the member, and an array becomes an object;
- a consumer that checks with the schema and keeps its own copy of the input
  (raw admission, every `v.is` predicate) keeps the member unchecked, and an
  array stays an array.

| # | Use (base line) | Position | Doors that reach it with a caller's value | Today: a skipped name | Today: an array | This package |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `gtl/serialization_contracts.ts:34` | the owner's JSON value, object branch (every object inside a rule `config`) | raw admission of `module_publication`; Catalog admission; conformance input; run door publication | raw: admitted, member kept unchecked; owner schema: admitted, member dropped | an array is a JSON array here (the `v.array` branch), so it is valid | adopts the helper |
| 2 | `gtl/serialization_contracts.ts:87` | `RULE_DECLARATION_SCHEMA.config` | as row 1 | as row 1 | raw: admitted as an array; owner schema: admitted as `{}` or `{"0":…}` | adopts the helper |
| 3 | `gtl/serialization_contracts.ts:143` | `GRAPH_FUNCTION_SCHEMA.declarations` | as row 1, plus raw `graph_function` and the run door's Catalog and view entries | as row 1; raw admission also keeps a member with an invalid value (`42`) unchecked | as row 2 | adopts the helper |
| 4 | `gtl/serialization_contracts.ts:194` | `GTL_PROGRAM_SCHEMA.policies` | as row 1, plus raw `gtl_program` | as row 3 | as row 2 | adopts the helper |
| 5-8 | `owner_bindings/run_invocation.ts:565`, `:567`, `:597`, `:599` | `byHandle` and `declarationsByHandle` of the caller's Catalog and view | run door (`runInstalledDefinitionCallWithResource`, CLI `run`) | the binder admits and drops the member; the call goes on to the owner as if the member were absent | the binder admits it as `{}` or `{"0":…}`; the call goes on | adopts the helper |
| 9 | `shared/public_function_contracts.ts:157` | the shared `jsonValueSchema`, object branch (58 users) | every Public contract that carries a JSON value | admitted; the member is dropped from the `admitContract` output | a JSON array is valid | left; for a ruling (R1) |
| 10-11 | `owner_bindings/run_invocation.ts:448`, `:451` | verified product `definitionContractCoordinates`, `nativeDeclarationEvidence` (their values are row 9) | run door, caller-supplied verified product (`readinessBasis.verifiedProducts`) | the binder drops the member; the call goes on to the owner | the binder admits it as an object; the call goes on | adopts the helper |
| 12 | `product/default_library.ts:69` | `original.workOrders` of the governance work state | Run input on the governance state contract (`admitInput`, `isGovernanceWorkState`); `constructGovernanceWorkState` | admitted; the input is kept, so the member is kept unchecked | admitted; the array is kept | adopts the helper |
| 13 | `product/default_library.ts:192` | governance prerequisites (picklist keys) | the declaration value `abg.default_library_prerequisites` (JSON text) of a published executive step, read at Run time by `governancePrerequisites` (`abg/default_library.ts:147`, `:290`; `abg/instruction_assembly.ts:391`); also the author-side builder `defaultGovernanceGraphFunctions` (`gtl/default_library.ts:61`) | with a valid value, returned with the member kept; with `42`, `governancePrerequisites` throws `TypeError: number 42 is not iterable` | the picklist refuses the key `"0"`, so the owner answers `null` | adopts the helper |
| 14 | `product/default_library.ts:253` | `refusal.selectors` of a failed attempt | Run input on the selection-task contract (`admitInput`, `isFramedSynthesisTask`); the owner also builds these values from the admitted record (`abg/default_library.ts:196-206`) | `v.is` true; the input is kept | `v.is` true | adopts the helper |
| 15-17 | `product/semantic_job.ts:75`, `:79` (twice) | executable capability `environment`; `taskData`; `evaluationData` | Run input on the semantic job input contract (`admitInput`, `isSemanticJobInput`) | admitted; the input is kept, so the member is kept unchecked (`environment` keeps `constructor: 42`) | admitted | adopts the helper |
| 18 | `product/semantic_job.ts:152` | a design command's `environment` | a native result on the semantic job asset candidate contract (`isSemanticJobAssetCandidate`, `semantic_job.ts:451`) | `isSemanticJobAssetCandidate` true | true for `[]` | adopts the helper |
| 19-21 | `abg/project_read_operation_contracts.ts:144`, `:167`, `:242` | read result `value` | none: these are the owner's output for a read | not reached by a caller | not reached | left |

Seventeen uses adopt the helper. Rows 1-8 are the GTL owner's records and the
Catalog records that the debt names. Rows 10-18 are the other records that a
caller's value reaches. Four uses are left:

- **Row 9, the shared `jsonValueSchema`.** Caller values reach it, but it is
  the JSON value of every Public contract that carries one: 58 users in 14
  modules, among them terminal results, witness and qualification contracts,
  release snapshots and admission authority. Adopting the helper there would
  change what each of those contracts admits and publishes. Recorded
  documents hold 373 keys named `constructor` or `prototype` at JSON-value
  positions (none in an event log; section 5). I hand it back for a ruling
  (R1) and do not adopt it. Rows 10-11 adopt the helper at the record level,
  so a name nested inside one of their JSON values still meets row 9.
- **Rows 19-21, the read owner's output contracts.** No caller's value
  reaches them.

Differential, base build against final build, with the same input values:

- **`probe/doors.mjs`**: 133 cases and 444 door cells.
  - The 76 cells of the 21 control cases give the same verdict on both
    builds. The controls are the unmodified publication, an ordinary key at
    each position, an empty caller Catalog and an object-literal `__proto__`.
  - All 368 other cells change from admitted to refused.
  - No cell changes in any other direction.
  - The output on the final build is byte-identical to the first step's
    output (`probe/v2-doors.json` = `probe/after-doors.json`).
- **`probe/census.mjs`**: 25 rows.
  - The 7 shared `jsonValueSchema` rows are unchanged on both builds
    (row 9 is left).
  - The 11 semantic job rows (each name in `taskData`, each name with a valid
    and an invalid value in `environment`, and an array at each) change from
    `true` to `false`.
  - The 6 prerequisites rows change to `null` (not canonical). Before, they
    were returned with the member kept (valid value) or threw `TypeError`
    (value `42`).
  - The read-owner row is unchanged.
- **Lane test 6**: the helper is compared with `v.record` over string,
  nonblank and picklist keys, with ordinary members, empty objects and
  non-objects. The result, the output and the issues are equal.

## 2. The helper and its call sites

`recordSchema(key, value)` in `T/code/src/shared/public_function_contracts.ts`
(now `:150-200`) is marked `@internal`. It sits beside `nonblankSchema` and
`digestSchema`, which the serialization owner already imports from that
module. It takes the same arguments as `v.record` and is written where
`v.record` was.

- **Key rule.** The key rule is `v.pipe(key, v.notValues(["__proto__",
  "constructor", "prototype"]))`, and the record is `v.record(keyRule,
  value)`. The helper keeps the record's `kind`, `type`, `key`, `value` and
  `expects`, so the JSON Schema projector projects it as a record whose
  `propertyNames` is the key rule.
- **`~run`.** It refuses two inputs before the record runs:
  - an array gets a type issue at the record ("Invalid type: Expected Object
    but received Array");
  - an own member named `__proto__`, `constructor` or `prototype` gets the key
    rule's issue at that key: `not_values` for a string or nonblank key, the
    picklist's own issue for a picklist key.

  Every other input gets the record's own result. A value without those names
  therefore has the same output and the same issues as before.
- **Why `~run` is needed.** Valibot's record never checks a skipped key
  against its key schema, so the key rule alone cannot refuse it. The `~run`
  check makes the door enforce the rule that `propertyNames` publishes.
- **`~standard`.** It runs the same `~run`.

Call sites (now):

| File | Lines | Record |
| --- | --- | --- |
| `gtl/serialization_contracts.ts` | `:34`, `:87`, `:143`, `:194` | JSON value object, rule `config`, `declarations`, `policies` |
| `owner_bindings/run_invocation.ts` | `:449`, `:452`, `:566`, `:568`, `:595`, `:597` | verified product `definitionContractCoordinates`, `nativeDeclarationEvidence`; Catalog and view `byHandle`, `declarationsByHandle` |
| `product/default_library.ts` | `:70`, `:193`, `:254` | `workOrders`, prerequisites, failed attempt `selectors` |
| `product/semantic_job.ts` | `:76`, `:80` (twice), `:153` | executable `environment`, `taskData`, `evaluationData`, command `environment` |

Types (scratch `typecheck/`; `tsc --strict` over the base and final `.d.ts`):

- **Serialization family (`equal.ts`).** It asserts 152 type equalities: the
  input, output and `ContractValue` of every exported schema in
  `gtl/serialization_contracts.ts`. 140 hold. The 12 that fail are the output
  of the 11 schemas that reach the recursive syntax reference, plus the
  non-schema `GTL_SERIALIZATION_SCHEMA_DEFINITIONS`. A control
  (`control.ts`) compares base with a copy of base and gives the identical
  error set. The cause is the module's `declare const recursiveReference:
  unique symbol`: each declaration file mints its own symbol, so the two
  builds' branded types can never be equal.
- **Product types (`equal2.ts`).** It asserts 12 equalities and all hold:
  - the semantic job input schema's input and output, `SemanticJobInput`,
    `SemanticJobDesign` and `SemanticJobAssetCandidate`;
  - `GovernanceWorkState`, `GovernanceOriginal`, `GovernancePrerequisites`,
    `FramedSynthesisFailedAttempt`, `FramedSynthesisTask` and
    `FramedSynthesisResult`.

  Its `@ts-expect-error` control fires.

## 3. Door table

**Forms (ruling 5).**

- **JSON text.** The CLI (`public/cli.ts:102`, `JSON.parse`) is the door that
  receives JSON text. When the text has a `__proto__` member, the CLI reaches
  every Public operation below with it as an own member.
- **In process.** SDK callers pass in-process values to
  `runInstalledDefinitionCallWithResource`, `admitModule`,
  `admitGraphFunction`, `admitGtlProgramConformanceInput`,
  `CatalogOperationPort.admit`, the Product's input admission and the owner
  predicates. The transport detaches a non-established call with
  `structuredClone`, which keeps an own `__proto__`.
- **How the lane and probes make them.** The in-process own member is made
  with `Object.defineProperty`, and the JSON form with `JSON.parse`.

**Reading the table.**

- Before is the base build, and after is the final build.
- "Valid" is a value of the declared type and "invalid" one that is not.
  Every JSON value is a valid `config`, `taskData` or `evaluationData` value,
  so those positions have the valid case only.
- The verdicts are the same for the three names, in both forms, at every
  position, so the table lists each once.
- Section 6 gives the lane's cell counts for each row.

| Door | Case | Before | After |
| --- | --- | --- | --- |
| Raw admission (`rawAdmitValue`, `admitModule`, `admitGraphFunction`), kinds `module_publication`, `graph_function`, `gtl_program` | `__proto__`, `prototype` or `constructor`, valid value | admitted; output equals the input, with the member kept and unchecked | refused `invalid_kind`, for example `$/graphFunctions/0/declarations/constructor: Invalid value: Expected !("__proto__" \| "constructor" \| "prototype") but received "constructor"` |
| | the same names, invalid value | admitted; the member is kept unchecked (`constructor: 42`) | refused `invalid_kind`, same message |
| | an array at `declarations`, `policies` or `config` | admitted; the array is kept | refused `invalid_kind`: `$/graphFunctions/0/declarations: Invalid type: Expected Object but received Array` |
| Catalog admission (`CatalogOperationPort.admit`) | any name, valid or invalid value | raw admission passes, and the packet goes on to Catalog construction | `catalog_validation_refusal`, `raw_admission_refusal` `invalid_kind` |
| | an array | raw admission passes. At `declarations` and `policies` the packet goes on to Catalog construction; at `config`, static validation refuses it later (`static_validation_refusal`) | `catalog_validation_refusal`, `raw_admission_refusal` `invalid_kind` |
| Conformance input (`admitGtlProgramConformanceInput`, `evaluateGtlProgramConformance`) | any name, valid or invalid value | admitted; evaluation passes | refused `invalid_kind`; evaluation `failed`, `raw_admission_refused` |
| | an array | admitted. Evaluation passes at `declarations` and `policies`, and fails later at `config` (`validation_failed`, `invalid_reference`) | refused `invalid_kind`; evaluation `failed`, `raw_admission_refused` |
| Run door (`runInstalledDefinitionCallWithResource`, CLI `run`): caller publication, Catalog and view entries | any name, valid or invalid value | the binder drops the member; the call reaches the owner | fault `resource_admission` `invalid_resource_assertion` |
| | an array | the binder admits it as an object; the call reaches the owner | fault `resource_admission` `invalid_resource_assertion` |
| Run door: Catalog and view `byHandle`, `declarationsByHandle` | any name, valid or invalid entry | the binder drops the member; the call reaches the owner | fault `resource_admission` `invalid_resource_assertion` |
| | an array | the binder admits it as an object; the call reaches the owner | fault `resource_admission` `invalid_resource_assertion` |
| Run door: verified product `nativeDeclarationEvidence`, `definitionContractCoordinates` | any name, values `"x"` and `{"nested":1}` | the binder drops the member; the call reaches the owner | fault `resource_admission` `invalid_resource_assertion` |
| | an array | the binder admits it as an object; the call reaches the owner | fault `resource_admission` `invalid_resource_assertion` |
| Product input admission (`admitInput`), semantic job input contract; `isSemanticJobInput` | any name in `taskData`, `evaluationData` or an executable `environment` (in `environment`, a valid and an invalid value) | admitted; the admitted input keeps the member unchecked | `isSemanticJobInput` false; `admitInput` `null` |
| | an array at those positions | admitted; the array is kept | `isSemanticJobInput` false; `admitInput` `null` |
| Native result on the semantic job asset candidate contract (`isSemanticJobAssetCandidate`) | any name in a design command's `environment`; an array there | true | false; the native result takes its existing `author_schema` issue at `$` (`semantic_job.ts:451`) |
| Product input admission, governance state contract; `constructGovernanceWorkState` | any name in `original.workOrders` (a valid order and `42`) | constructed and admitted; the member is kept unchecked | `constructGovernanceWorkState` throws its existing `TypeError` ("governance input requires complete original source, scope and declared work contracts"); `admitInput` `null` |
| | an array at `workOrders` | constructed | the same `TypeError` |
| Prerequisites declaration (`governancePrerequisites`) | any name, with a valid value | returned with the member kept | `null` (not canonical) |
| | any name, with `42` | throws `TypeError: number 42 is not iterable` | `null` (not canonical) |
| | an array (`[]`, `["review://td76"]`, `[["review://td76"]]`) | `null` | `null` |
| Governance builder (`defaultGovernanceGraphFunctions({ prerequisites })`, `gtl/default_library.ts:61`), own member | any name, with a valid value | `TypeError`: "process prerequisites name registered purposes and reviews through the registered review wrapper" | the same `TypeError` |
| | any name, with `42` | `TypeError: number 42 is not iterable` (thrown from inside `governancePrerequisites`) | the builder's own `TypeError`, as above; a refusal-to-refusal change in message only (`probe3/builder.mjs`; an ordinary prerequisites value returns 9 graph functions on both builds) |
| Selection task failed attempt `refusal.selectors` (`isFramedSynthesisTask`) | any name; an array | true: `v.record` skips the name and takes the array, as at every other use (not measured at this door) | false through the helper's refusal (not measured at this door). Lane test 6 measures the helper under a nonblank key, `v.pipe(v.string(), v.minLength(1))`, which is the key rule `selectors` uses (`default_library.ts:44`) |

Every refusal is a code or answer the door already gives for an invalid value
at that position. No new refusal code exists.

- **Product input.** A `null` from Product input admission becomes the run
  door's existing preparation refusal `invalid_input` at `/input`
  (`product/run_invocation_operation.ts:980-983`). That consequence is read
  from source; the lane measures `admitInput`.
- **Prerequisites.** A `null` from `governancePrerequisites` is the existing
  `process_declaration` refusal at selection intake (`abg/default_library.ts:147-150`).
  At the two other Run-time readers it is the existing `null`. At the
  builder (`gtl/default_library.ts:61`) it is the builder's existing
  `TypeError` (next row of the table below).
- **Run door fixtures.** In the run door fixtures the owner refuses every call
  with `invalid_program`, because the minimal caller Catalog is not a runnable
  Program. "Reaches the owner" therefore means the owner's verdict, which
  equals the control case's.

An object literal `{__proto__: X}` in source sets the prototype and makes no
member.

- Raw admission refuses it as `non_canonical_value` (the I-JSON gate) on both
  builds.
- The run door detaches it with `structuredClone`, which drops the prototype.
  The call reaches the owner on both builds (residual 4).

The owner schema itself (`admitContract` over the family schema) now refuses
with `contract_mismatch`. The issue is:

- `not_values` for a name at `declarations`, `policies` or `config`;
- `union` for a name in an object inside `config`;
- `custom` for an array.

## 4. Published-schema change

`contracts/schemas/gtl-serialization.schema.json` gains
`"not": {"enum": ["__proto__", "constructor", "prototype"]}` inside
`propertyNames` at 13 positions.

- Each position already states `"type": "object"`,
  `"propertyNames": {"type": "string"}` and its `additionalProperties`.
- Nothing else in the file changes.
- No generator change was needed, because `projectStrictJsonSchema` already
  projects `not_values` as `not: {enum}`.

| Position (JSON Pointer) |
| --- |
| `/$defs/GraphFunction/properties/declarations` |
| `/$defs/ModulePublication/properties/graphFunctions/items/properties/declarations` |
| `/$defs/ModulePublication/properties/programs/items/properties/policies` |
| `/$defs/ModulePublication/properties/rules/items/properties/config` |
| `/$defs/GtlProgramConformanceInput/properties/program/properties/policies` |
| `/$defs/GtlProgramConformanceInput/properties/publication/properties/graphFunctions/items/properties/declarations` |
| `/$defs/GtlProgramConformanceInput/properties/publication/properties/programs/items/properties/policies` |
| `/$defs/GtlProgramConformanceInput/properties/publication/properties/rules/items/properties/config` |
| `/$defs/GtlLanguageConformanceCorpus/properties/programs/items/properties/packet/properties/program/properties/policies` |
| `/$defs/GtlLanguageConformanceCorpus/properties/programs/items/properties/packet/properties/publication/properties/graphFunctions/items/properties/declarations` |
| `/$defs/GtlLanguageConformanceCorpus/properties/programs/items/properties/packet/properties/publication/properties/programs/items/properties/policies` |
| `/$defs/GtlLanguageConformanceCorpus/properties/programs/items/properties/packet/properties/publication/properties/rules/items/properties/config` |
| `/$defs/d1/anyOf/5` (the JSON value's object branch) |

For example, `/$defs/GraphFunction/properties/declarations` after the change is
`{"additionalProperties":{"type":"string"},"propertyNames":{"not":{"enum":["__proto__","constructor","prototype"]},"type":"string"},"type":"object"}`.

No published schema changes for rows 5-18:

- The run door's Catalog, view and verified-product schemas are not
  published; no file under `contracts/` names `byHandle`,
  `declarationsByHandle` or `nativeDeclarationEvidence`.
- The semantic job and default library schemas are not published either.
- No file under `contracts/` other than the three below changes.

The other generated files change only in digests. With every 64-hex run
masked, each file equals base.

- `contracts/conformance/gtl-language-conformance-corpus.json` changes in 1
  leaf, `/schema/contentDigest`.
- `contracts/capabilities/capability-definition-graph.json` changes in 551
  leaves, all digests (section 8).
- `product-toolchain-manifest.json` changes in 249 leaves, all digests:
  - the public contract catalog moves in 5 asset digests (the 4 rows that
    point at `gtl-serialization.schema.json`, and the corpus row) and 28
    contract digests;
  - 144 `declarationInventory` entries change: 50 for
    `gtl/serialization_contracts.d.ts`, 47 for `product/default_library.d.ts`
    and 47 for `product/semantic_job.d.ts`;
  - 49 row `provenanceRef`s and 10 `publicationDigest`s change;
  - the remaining 13 leaves are the manifest and graph identities (section 10).
- The emitted `.d.ts` changes only in those three files.

## 5. Recorded history

Coverage:

- every `*.json`, `*.jsonl`, `*.json.gz`, `*.jsonl.gz` and `*.gz` file under
  `EV` (240,919 files, 246 of them gzip, 160.62 GB);
- every such file under `T/test_env/fixtures` and `T/test_env/proof`.

The search ran in two passes, one for each step of the change.

**First pass: the GTL and Catalog records (rows 1-8), and the names anywhere.**

- A byte prefilter (`recorded/prefilter.sh`, `rg -z`) selects two kinds of
  file: files where one of the three names is an object key, plain or
  JSON-escaped inside a string; and files where `declarations`, `policies`,
  `config`, `byHandle` or `declarationsByHandle` opens an array. In `EV` it
  selects 299 distinct files (2.2 GB); in fixtures and proof, 0.
- A structural pass (`recorded/structural.mjs`, `recorded/structural-keys.mjs`)
  parses every hit file and every JSON document held in a string inside it:
  109,806 documents and 207,261 nested documents, with no parse failure.
- 373 keys carry one of the three names, and 0 sit at any record position of
  rows 1-18. They are report fields, such as
  `"constructor": "constructXModulePublication"`, and role maps, and none is in
  an event log.
- 467 arrays sit at a record-named key, and 0 are held by a `graph_function`,
  a `gtl_program`, a rule or a Catalog.

**Second pass: rows 10-18.**

- **Prefilters.** Two prefilters (`recorded2/prefilter2.sh`,
  `recorded2/prefilter3.sh`) select files where an array opens at
  `environment`, `taskData`, `evaluationData`, `workOrders`,
  `definitionContractCoordinates`, `nativeDeclarationEvidence` or
  `selectors`. They also select files where a prerequisites declaration value
  is JSON text that opens an array.
  - In `EV` this gives 2,182 distinct files (81 GB).
  - In fixtures and proof it gives 0.
- **Structural pass.** `recorded2/structural2.mjs` reads each event log, and
  each file over 400 MB, line by line through `rg`. It parses every other file
  whole, and walks every JSON document held in a string. It classifies each
  array by the shape of the object that holds it.
  - 48 pretty-printed `*.jsonl` files and one 467 MB `pure-preflight.json`
    failed line-wise parsing (5,578 lines), so they were parsed whole.
  - In total it found 49,437 + 5,398 + 180 arrays at those keys.
- **Results.**
  - Semantic job records hold 0 arrays: none in an executable capability,
    a semantic job input, or a design command (`/design/commands/`).
  - 4,666 `environment` arrays sit in an object with the semantic job
    command's keys. Every one is a worksite command
    (`product/worksite_command_execution.ts:100-136`): a declared command or
    a command input, at paths such as `task/commands/N`,
    `rawInputValue/commands/N` and `input/worksite/commands/N`. That owner
    takes `environment` as a list or a record by design, so this is a
    different schema from the semantic job's.
    - 3,724 are lists of `worksite_command_environment_entry` rows.
    - 941 are lists of `{name, value}` pairs.
    - 1 is an empty array, at `$/command/task/commands/0` in
      `e03-physical-launch-failure-01/prepared-inputs.json`.

    The check that names the 941 is `recorded2/structural2c.mjs` over the
    353 files that hold such a list.
  - The other 7,855 `environment` arrays are held by other shapes.
  - There are 26 `workOrders` arrays, all in report documents, and none in a
    governance original.
  - There are 42,468 `selectors` arrays, and none in a failed attempt's
    `refusal` (an object with exactly `relation` and `selectors`).
  - There are 0 arrays anywhere at `definitionContractCoordinates`,
    `nativeDeclarationEvidence`, `taskData` or `evaluationData`.
  - There are 10 prerequisites declaration values, with no array and no
    reserved name.
  - There are 0 reserved names at any of these positions.

No recorded value that a kept lane or a readable store uses would be refused.
Ruling 6's stop condition does not hold.

## 6. The lane

`T/test_env/tests/t292-td76-record-schema-keys.test.mjs` is new (438 lines).

- It builds its run door calls the way the TD-34A lane does: `exactInvokeCall`,
  a caller Catalog with entry and view patches, and
  `publicApi.runInstalledDefinitionCallWithResource`.
- For the verified product, it puts `setupInstalledRootCatalog`'s verified
  product (packed artifact basis) into the caller's
  `readinessBasis.verifiedProducts`.
- The semantic job cases start from the `ordinaryJob` fixture of the T-287
  intake support.
- Every refusal case is sent in both forms.

| Test | Covers | Base | Final |
| --- | --- | --- | --- |
| 1 | each name, valid and invalid value, at `declarations`, `policies`, `rules[].config` and an object inside `config`, in both forms. Doors: raw `module_publication`, Catalog admission, conformance input and run door publication, plus raw `graph_function` and run door Catalog and view entries (`declarations`) and raw `gtl_program` (`policies`) | fail | pass |
| 2 | `[]` and `["abg.td76"]` at the three GTL record positions, in both forms, at the same doors | fail | pass |
| 3 | each name and an array in `byHandle` and `declarationsByHandle` of the caller Catalog and view, in both forms (64 cases) | fail | pass |
| 4 | ordinary keys: raw output's canonical JSON equals the input; the owner schema's output deep-equals the input; Catalog admission passes raw admission; the run door reaches the owner; raw admission refuses an object-literal `__proto__` as `non_canonical_value` | pass | pass |
| 5 | `projectStrictJsonSchema` over the family and the corpus states the key rule and `type: object` at exactly 13 record positions | fail | pass |
| 6 | the helper against `v.record` over string, nonblank and picklist keys, with values `v.string()` and `v.unknown()`: the same result, output and issues without the names; a refusal at the key with them; an array refused | fail | pass |
| 7 | semantic job input `taskData`, `evaluationData` and executable `environment` through `isSemanticJobInput` and `admitInput`, and a design command's `environment` through `isSemanticJobAssetCandidate`: each name (valid and invalid value), an array, and an ordinary-key control | fail | pass |
| 8 | governance `workOrders` through `constructGovernanceWorkState` and `admitInput`, and the prerequisites declaration through `governancePrerequisites`: each name, an array, and a control | fail | pass |
| 9 | run door, verified product `nativeDeclarationEvidence` and `definitionContractCoordinates`: each name (values `"x"` and `{"nested":1}`), an array, and an ordinary-key control | fail | pass |

On the base build, the lane gives 9 tests, 1 pass and 8 fail
(`lanes/base/t292-td76-record-schema-keys.test.mjs.tap`).

- Tests 1-3, 7, 8 and 9 fail because base admits every refusal case. Their
  diagnostics are the "Before" column of section 3.
- Tests 5 and 6 fail because base has no `recordSchema` and states no key rule.

On the final build, the lane gives 9 tests and 9 pass
(`lanes/final/t292-td76-record-schema-keys.test.mjs.tap`).

- Its diagnostics hold 469 door cells: 441 refusal cells and 28 control cells.
- 438 refusal cells change from admitted, kept or thrown to the door's
  refusal (section 3).
- The other 3 refusal cells are the prerequisites arrays. They are `null` on
  both builds, because the picklist already refuses the key `"0"`.
- The 28 control cells (ordinary keys) give the same verdict on both builds.

The per-door summaries are `lanes/td76-base-diag.txt` and
`lanes/td76-final-diag.txt` (`scripts/lanediag.mjs`).

## 7. Lanes before and after

Each of the 77 files is run alone from T, on the base build (`21c108af0`, base
source and base build) and on the final build. On base, the brief's named
files ran first, then the rest of the first selection with the new lane as
its 47th file, then the 30 further files. On final, they ran in the order of
`final-lanes.txt`, with the new lane last. The command is the brief's (`TMPDIR=/private/tmp/abg-td76-tmp`,
`ABI5_EVIDENCE_ROOT=EV`).

| Build | Tests | Pass | Fail | Skip |
| --- | --- | --- | --- | --- |
| Base | 521 | 495 | 8 | 18 |
| Final | 521 | 503 | 0 | 18 |

- The 8 base failures are the new lane.
- `scripts/tapcompare.mjs` compares every `ok` and `not ok` line, nested
  ones included, with its directive. By that comparison, the 76 kept files
  give the same result test by test.
- No case changes from pass to fail.
- The 18 skips are the same cases on both builds.
- No case is cancelled or timed out.

"(named)" marks the brief's named list, and "(artifact truth)" its artifact
truth lanes. The other files name the changed owners, their schemas or
predicates, raw admission, the run door's Catalog records or the verified
product.

| # | Lane | Base tests/pass/fail/skip | Final tests/pass/fail/skip | Test by test |
| --- | --- | --- | --- | --- |
| 1 | `t292-td34a-run-invocation-schema-owner` (named) | 4/4/0/0 | 4/4/0/0 | same |
| 2 | `m5-c-algebra-validation` (named) | 18/18/0/0 | 18/18/0/0 | same |
| 3 | `t287-gtl-serialization-publication` (named) | 9/9/0/0 | 9/9/0/0 | same |
| 4 | `t287-static-declaration-closure` (named) | 10/10/0/0 | 10/10/0/0 | same |
| 5 | `a5-f02-canonical-gtl-identity` (named) | 7/7/0/0 | 7/7/0/0 | same |
| 6 | `r1-packed-artifact` (named) | 1/1/0/0 | 1/1/0/0 | same |
| 7 | `r2-clean-install` (named) | 1/1/0/0 | 1/1/0/0 | same |
| 8 | `r4-catalog-admission` (named) | 8/8/0/0 | 8/8/0/0 | same |
| 9 | `t287-default-library` (named) | 35/34/0/1 | 35/34/0/1 | same |
| 10 | `d2-bounded-repair` | 10/10/0/0 | 10/10/0/0 | same |
| 11 | `generic-input-retention` | 4/4/0/0 | 4/4/0/0 | same |
| 12 | `m5-consensus-module` | 16/16/0/0 | 16/16/0/0 | same |
| 13 | `retained-route-cursor-transition` | 1/1/0/0 | 1/1/0/0 | same |
| 14 | `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 | same |
| 15 | `t287-conformance-owner-reuse` | 1/0/0/1 | 1/0/0/1 | same |
| 16 | `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 | same |
| 17 | `t287-event-body-encoding` | 25/25/0/0 | 25/25/0/0 | same |
| 18 | `t287-generic-job-revision` | 2/1/0/1 | 2/1/0/1 | same |
| 19 | `t287-gtl-graph-law` | 9/9/0/0 | 9/9/0/0 | same |
| 20 | `t287-gtl-language-corpus` | 3/3/0/0 | 3/3/0/0 | same |
| 21 | `t287-malformed-gtl-gate` | 6/6/0/0 | 6/6/0/0 | same |
| 22 | `t287-management-context` | 13/12/0/1 | 13/12/0/1 | same |
| 23 | `t287-native-semantic-revision` | 7/7/0/0 | 7/7/0/0 | same |
| 24 | `t287-native-work-reacquisition` | 8/7/0/1 | 8/7/0/1 | same |
| 25 | `t287-native-workspace-work` | 43/43/0/0 | 43/43/0/0 | same |
| 26 | `t287-reacquisition-root-contract` | 1/1/0/0 | 1/1/0/0 | same |
| 27 | `t287-recursive-failure-foldback` | 8/8/0/0 | 8/8/0/0 | same |
| 28 | `t287-recursive-registered-selection` | 7/6/0/1 | 7/6/0/1 | same |
| 29 | `t287-registered-graph-selection` | 1/1/0/0 | 1/1/0/0 | same |
| 30 | `t287-rp2-fibre-substitution` | 1/1/0/0 | 1/1/0/0 | same |
| 31 | `t292-td28c-governed-context-policy` | 3/3/0/0 | 3/3/0/0 | same |
| 32 | `t292-td31-stdo-run-environment-shape` | 3/3/0/0 | 3/3/0/0 | same |
| 33 | `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 | same |
| 34 | `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 | same |
| 35 | `w2-steel-single-start` | 7/7/0/0 | 7/7/0/0 | same |
| 36 | `d2-frame-installed.mjs` | 1/0/0/1 | 1/0/0/1 | same |
| 37 | `t287-w2-05-static-binding-algebra` | 4/3/0/1 | 4/3/0/1 | same |
| 38 | `t287-owned-call-reference` | 1/1/0/0 | 1/1/0/0 | same |
| 39 | `t287-historical-source-resource` (artifact truth) | 4/4/0/0 | 4/4/0/0 | same |
| 40 | `r10-child-proof` (artifact truth) | 10/10/0/0 | 10/10/0/0 | same |
| 41 | `t287-cross-cut-public-read` (artifact truth) | 5/5/0/0 | 5/5/0/0 | same |
| 42 | `t287-selected-action-authority` (artifact truth) | 3/2/0/1 | 3/2/0/1 | same |
| 43 | `t287-native-assessment-evidence` (artifact truth) | 4/4/0/0 | 4/4/0/0 | same |
| 44 | `r5-invocation-admission` | 2/2/0/0 | 2/2/0/0 | same |
| 45 | `t287-w2-05-install-catalog-owner-chain` | 3/3/0/0 | 3/3/0/0 | same |
| 46 | `t287-st1-installed-cross-owner-hello` | 3/3/0/0 | 3/3/0/0 | same |
| 47 | `rc2-assessment-intake` | 5/5/0/0 | 5/5/0/0 | same |
| 48 | `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | same |
| 49 | `steel-consumer-declaration` | 1/0/0/1 | 1/0/0/1 | same |
| 50 | `t287-amendment-witness` | 13/12/0/1 | 13/12/0/1 | same |
| 51 | `t287-common-computational-library` | 16/16/0/0 | 16/16/0/0 | same |
| 52 | `t287-default-library-prerequisites` | 7/7/0/0 | 7/7/0/0 | same |
| 53 | `t287-default-library-recoverable-failure` | 5/5/0/0 | 5/5/0/0 | same |
| 54 | `t287-default-library-reviews` | 10/10/0/0 | 10/10/0/0 | same |
| 55 | `t287-exact-construction-intent` | 1/1/0/0 | 1/1/0/0 | same |
| 56 | `t287-exact-prefix-projection-reuse` | 2/2/0/0 | 2/2/0/0 | same |
| 57 | `t287-framework-handoff-types` | 6/6/0/0 | 6/6/0/0 | same |
| 58 | `t287-generic-job-intake` | 1/1/0/0 | 1/1/0/0 | same |
| 59 | `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 | same |
| 60 | `t287-generic-job-meaning` | 3/3/0/0 | 3/3/0/0 | same |
| 61 | `t287-generic-job-read-dependency` | 1/1/0/0 | 1/1/0/0 | same |
| 62 | `t287-governance-covered-source-use` | 9/7/0/2 | 9/7/0/2 | same |
| 63 | `t287-native-semantic-job` | 9/9/0/0 | 9/9/0/0 | same |
| 64 | `t287-native-work-currentness-consumers` | 6/6/0/0 | 6/6/0/0 | same |
| 65 | `t287-pfc-f08a-product-verification-boundary` | 1/1/0/0 | 1/1/0/0 | same |
| 66 | `t287-readable-stops` | 5/5/0/0 | 5/5/0/0 | same |
| 67 | `t287-required-operation-bindings` | 11/11/0/0 | 11/11/0/0 | same |
| 68 | `t287-rp2-behavior-carriers` | 1/1/0/0 | 1/1/0/0 | same |
| 69 | `t287-runtime-failure-diagnostic` | 21/21/0/0 | 21/21/0/0 | same |
| 70 | `t287-selected-action` | 1/0/0/1 | 1/0/0/1 | same |
| 71 | `t287-single-address-space-consolidation` | 17/17/0/0 | 17/17/0/0 | same |
| 72 | `t287-stdo3-run-environment` | 5/5/0/0 | 5/5/0/0 | same |
| 73 | `t287-w2-05-generator-package-reproducibility` | 2/2/0/0 | 2/2/0/0 | same |
| 74 | `t287-worksite-command-execution` | 12/12/0/0 | 12/12/0/0 | same |
| 75 | `t292-td36s-bind-string-rule` | 7/7/0/0 | 7/7/0/0 | same |
| 76 | `t292-td37a-path-relation` | 6/6/0/0 | 6/6/0/0 | same |
| 77 | `t292-td76-record-schema-keys` | 9/1/8/0 | 9/9/0/0 | 8 fail → pass (tests 1-3, 5-9); test 4 passes on both |

## 8. Artifact truth

What is measured is the output on both builds: the five lanes, the projection
over the rc.12 store copy, and the capability graph. Replay (section 9) also
runs the Product predicates over recorded values, and its output is identical
too.

- **Lanes.** `t287-historical-source-resource` 4/4/0/0, `r10-child-proof` 10/10/0/0, `t287-cross-cut-public-read` 5/5/0/0, `t287-selected-action-authority` 3/2/0/1 and `t287-native-assessment-evidence` 4/4/0/0 (tests/pass/fail/skip). Each is the same on base and final, test by test.
- **Live rc.12 store.**
  - The store is `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
    copied to `scratch/store/rc12-events.jsonl`. The copy's sha256 is
    `440994c04f0bf214a8c62bd03d7f9905217b145cc34ce741aca8e5e393a76511`, equal
    to the original before and after the runs.
  - `scripts/probe-artifact-truth.mjs` (copied from the TD-25M scripts)
    decodes it, selects the whole prefix and projects artifact truth.
  - The result is 1,695 rows, 3 artifact admissions, outcome
    `artifact_truth_projection`, digest
    `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f`.
    It is the same on the base build (`base-T`) and the final build, and
    `probes/truth-base.jsonl` and `probes/truth-v2.jsonl` are byte-identical.
- **Capability graph.**
  - There are 16 rows on both builds. With every 64-hex run masked, each row
    is equal.
  - All 551 differing leaves are digests:
    - `graphDigest` (1);
    - each row's `capabilityDefinitionDigest` and `capabilityDefinitionRef`
      (16 each);
    - `dependentCapabilities` digest and ref (18 each);
    - the owning public contracts' `contractCatalog.catalogDigest` and
      `productContentDigest` (241 each).

## 9. Replay

`scripts/replay-log.mjs` (copied from the TD-25M scripts) replays each log on
the base build (`base-T`) and the final build. For each log it records:

- the decoded prefix digest;
- the whole-log replay;
- the F_H continuation projection and facts;
- each Run's replay against full authority.

The log list is the earlier packages' (`scripts/replay-logs.txt`), with two
replacements (`scripts/replay-logs-td76.txt`):

- the live rc.12 store is replaced by its scratch copy;
- the TD-25R base-root path of the r10 proof is replaced by
  `T/test_env/proof/abi5-root-r10.events.jsonl` (same sha256, `50747a85…bfbd`).

The two output files (`probes/replay-base.jsonl` and `probes/replay-v2.jsonl`)
are byte-identical: 11 logs and 14 Run replays.

| # | Log | Rows | Outcome (both builds) |
| --- | --- | --- | --- |
| 1 | `scratch/store/rc12-events.jsonl` | 1,695 | whole replay `sha256:3800fb111acf…`; 1 Run |
| 2 | `EV/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl` | 44 | whole replay `sha256:40028725031a…`; 1 Run |
| 3 | `EV/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/evidence-generation-03/raw/native-assessment/tmp/abi5-root-env-MdmivN/runtime/events.jsonl` | 27 | whole replay `sha256:6dbf55865ef5…`; 1 Run |
| 4 | `EV/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/evidence-generation-02/raw/selected-action/tmp/abi5-root-env-gjgeWi/runtime/events.jsonl` | 216 | whole replay `sha256:0d3923da558e…`; 1 Run |
| 5 | `EV/work/T287_RELEASE_RESUMPTION_01/rc8-reference-preservation-01/registered-selection-whole-001/actual-001/selection-evidence/events.jsonl` | 282 | whole replay refused: "replay run_stopped event and run_terminal HoldsAt truth disagree"; 7 Runs replay |
| 6 | `EV/work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/native-02/runtime-001/resources/events/runtime.events.jsonl` | 421 | whole replay `sha256:bc4a919ee1d0…`; 1 Run |
| 7 | `EV/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/…/hc2-current-intent/continue-events.jsonl` | 166 | whole replay refused: "replay requires zero or one exact run_stopped event"; 2 Runs replay |
| 8 | `T/test_env/proof/abi5-root-r10.events.jsonl` | - | decode refused: "runtime event payload matches no admitted event-contract variant" |
| 9 | `EV/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-19/episode-01/continued-mixed-human-boundary-events.jsonl` | - | decode refused: "durable ABG event log contains a noncanonical event" |
| 10 | `EV/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-18/episode-01/appended-events.jsonl` | - | decode refused: "durable ABG event log contains a noncanonical event" |
| 11 | `EV/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/events/runtime.events.jsonl` | - | decode refused: "event stamp differs from the exact native profile schedule" |

The refusals in rows 5 and 7-11 are the recorded logs' own, and they are the
same on both builds.

## 10. Identity digests

The final build is `npm run build` on the final source. Two builds give
identical output.

| Identity | Base (`21c108af0`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:060b02590b8fbd3d44c22f49d4397ea78dbfbe664b3a659fc64a2fabc157b030` | `sha256:4862b3bfa4d106765c58b1337d6cc397969a7a5a563429c0d4f42920f2ba52ff` |
| `contributionManifestDigest` | `sha256:1b99d4b450a2defc1093e2b99a20003a61e25a12e0828892108fd9b468c47004` | `sha256:74fdf0478d3dec9a1f63488ee0bd31b91218bc1a1424e33a7d6602221551d6da` |
| capability graph `graphDigest` | `sha256:6862b4fc41308ae51d714b766a09db40039d5bfcc5f582d9ac7cdf8380db5066` | `sha256:8bca33be703b4388e110c627a67925b1c816c7134b0777eafcdfecaf726e2c22` |
| capability graph asset `contentDigest` | `sha256:ba7bdacbdb62f3fce695b393c205bdef9b1960c55c6602df927003a9330c0477` | `sha256:153a7dfffbddc18ec25880042f3bfd77a7fdd77dc6d084defb2fdcfe7576cd20` |
| `publicContractCatalogDigest` | `sha256:0fa1742789cfaf80107c16184ba8c7efc437d057308c3ec4fced37d014fc99b5` | `sha256:6662f25cdb99f40a1fbf624d3884b4019b1989b4e7fb02bc84e7101e786ea107` |
| `gtl-serialization.schema.json` `contentDigest` | `sha256:7cf95509118fb129c5e4abd1947e684262add7df3c8d1d1747ca1eb3b6945b14` | `sha256:16c99e90c6c8d69e67e0efed9d0cbdf6ab76e901eb1a7eb444dde3a4cdcc9388` |

No generated file is committed. After every build the tracked generated files
are restored with `git checkout -- contracts product-toolchain-manifest.json
test_env/fixtures/abi5-root-candidate-basis.json`.

Lints on the final source:

- `lint:imports` passes (30 shared modules; the 3 forbidden pairs hold).
- `lint:lifecycle` passes (289 modules, 7 allow-listed sites).
- `lint:calculus` passes (6 modules).

## 11. Lines changed

`git diff --numstat 21c108af0` over `code/src` and `test_env`:

| File | Added | Removed |
| --- | --- | --- |
| `code/src/shared/public_function_contracts.ts` | 49 | 0 |
| `code/src/gtl/serialization_contracts.ts` | 5 | 5 |
| `code/src/owner_bindings/run_invocation.ts` | 7 | 12 |
| `code/src/product/default_library.ts` | 4 | 3 |
| `code/src/product/semantic_job.ts` | 4 | 3 |
| `test_env/tests/t292-td76-record-schema-keys.test.mjs` (new) | 438 | 0 |

Source: 69 added, 23 removed. Test: 438 added.

## 12. Commits

On `claude/td76-record-schema-keys`, from `21c108af0`:

1. `957261a61`: "Refuse the three skipped record names and an array through
   one record schema (TD-76)". This commit holds the five source files and the
   lane.
2. The commit after it holds this Return.

Neither is pushed or tagged.

## 13. Deviations

1. **Row 9 is not adopted.** Ruling 2 says every record schema that admits
   caller-supplied keys uses the helper, and caller values reach the shared
   `jsonValueSchema`. It is the JSON value of 58 users in 14 modules, among
   them terminal results, witness and qualification contracts, release
   snapshots and admission authority, and recorded documents hold 373 keys
   with the names at JSON-value positions. The line I drew is the published
   schema. Rows 10-18 publish no schema (section 4), so adopting the helper
   there changes no published contract. Adopting it at row 9 changes the
   admitted set and the generated published schema of 58 other Public
   contracts. That is the shape of the stop condition on changing schema
   generation for other contracts, so I hand it back (R1) instead. It is the
   only caller-reached use left.
2. **Where the helper lives.** I read "the shared admission module that the
   serialization owner already uses" as `shared/public_function_contracts.ts`
   and put `recordSchema` there.
   - The serialization owner imports `nonblankSchema` and `digestSchema` from
     that module, and nothing from `shared/admit/` or
     `shared/admission_predicates.ts`.
   - `shared/admission_predicates.ts` holds predicate functions and a
     re-export of `shared/admit/record.js`, and no valibot schema.
3. **Lane selection.** Before and after cover 76 kept files plus the new lane.
   - The selection is every file that names the changed owners, schemas or
     predicates, raw admission, the run door's Catalog records or the
     verified product, plus the brief's named list.
   - I did not run the optional `t292-td36r-*` lanes. They compare the packed
     archive with a committed fixture and fail on any source change until
     the identity is regenerated.
4. **Rows 14 and 18 are covered through the helper and kept lanes.**
   - **Row 14.** No lane sends a selection task with a name in
     `refusal.selectors`, because building a valid `FramedSynthesisTask` needs
     a digest-checked worksite context observation. The refusal is measured
     on the helper under a nonblank key (lane test 6), which is the key rule
     the failed attempt uses. The ordinary path is measured by the kept
     `t287-amendment-witness` lane, whose Run folds a failed attempt with
     `refusal.selectors` into an admitted selection task.
   - **Row 18.** It is measured through `isSemanticJobAssetCandidate`. The
     native result door that calls it (`semantic_job.ts:451`) is read from
     source.

## 14. Residuals

1. **`strictObject` keeps or drops `constructor` and `__proto__` (ruling
   item R2).**
   - Valibot's `strictObject` tests an unknown key with `key in this.entries`.
     That finds `constructor` and `__proto__` on `Object.prototype`, so it
     never reports them as unknown.
   - Probe `probe/strict.mjs` puts them as a top-level member of a graph
     function, with values `"x"` and `42`. Raw admission admits them and keeps
     the member in its output. The owner schema at the run door's binder
     admits them and drops the member.
   - Both refuse `prototype` (`invalid_kind`, `strict_object`).
   - The behaviour is the same on base and final. It affects every
     `strictObject` in the family, which is a different schema from the
     record this package repairs.
2. **Raw admission's message for a name inside a nested `config` object.**
   - The refusal code is `invalid_kind`, but the name sits at
     `$/rules/0/config/td76/constructor` and the message is
     `$/constructor: Invalid type: Expected (null | boolean | string | number | Array | Object) but received Object`.
   - For a union failure, raw admission's message takes the path of the
     union's nested sub-issue and the union's own expectation.
   - The message is the only effect.
3. **A name nested in a verified product's JSON value.** Rows 10-11 refuse a
   name at the record level. A name one level down, inside a member's JSON
   value, meets the shared `jsonValueSchema` (row 9): the binder admits it
   and drops it. This changes with R1.
4. **An object-literal `__proto__` at the run door.** `{__proto__: X}` in
   source sets the prototype and makes no member.
   - Raw admission refuses it (`non_canonical_value`).
   - The run door detaches the call with `structuredClone`, which drops the
     prototype, and the call reaches the owner as if the member were absent.
   - The same happens on base and final. No member is lost, because none
     existed.
5. **Identity.** The identity moves (section 10). The causes are the
   serialization schema, the corpus digest, 28 contract digests and 144
   `declarationInventory` entries of the three changed declaration files.
   The `t292-td36r-*` lanes fail until the Executive regenerates the identity
   at merge.

## 15. For a ruling

- **R1.** Whether the shared `jsonValueSchema` (row 9, 58 users) adopts
  `recordSchema`. Adopting it would refuse the three names inside every
  Public JSON value, change every contract that carries one and its published
  schema, and refuse the 373 recorded report keys if those documents are
  re-admitted.
- **R2.** Whether the `strictObject` hole for `constructor` and `__proto__`
  (residual 1) is a debt of its own.
