# Step 3. Admit family

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 3.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant. No review at this step.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 3.
Outcome: one `validate` family in `shared/admit/` owns record shape, exact
key sets, JSON ingress, contract admission and reference admission; every
private copy of those algorithms in the tree is retired; the five owner
obligations O-RESOURCE, O-SHAPE, O-SCHEMA, O-KEY and O-CODEC are closed with
site lists; D3 and D4 are applied as decided. Change class:
`realization_refactor`. One commit on `main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 2 commit recorded in the plan ledger. Tenant root
`build_tenants/abiogenesis/typescript`; source `code/src`. Frames `f-law`,
`f-checks`, `f-claim` (project basis). Design authority:
`build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§3 (carrier set), §4.1 (`validate`: `shared/admit/`, the exact signatures),
§4.5 (lift: `bindStaticOwner` consumes `admitContract`), §10.2 (D3, D4) and
§10.3 (owner obligations). Read those sections only. The refusal carrier is
`shared/refusal.ts` from step 2.

**Decisions already taken.** D3: the two native composite classifications are
ingress questions; decide each site you touch (does this ingress admit a
plain `JsonValue` record, or a typed contract through `admitContract`?) and
record the decision per site in Return; no blanket rule. D4: the throwing
`admitIJsonValue` and `admitIJsonText` in `shared/i_json.ts` stay as thin
lifts over the new `admitJson` (call it; throw `IJsonAdmissionError` on a
refusal); callers are not changed in this step.

**Census the Executive made at `93a4b08df` (re-verify; line numbers may have
moved after step 2):**

- `shared/admission_predicates.ts`: `isRecord` (7), `isJsonRecordShape` (26),
  and five exact-key bodies built on `Object.keys(value).sort().join("\0")`
  at lines 17, 44-45, 56, 67, 78-79. Two use `compareUnicodeCodeUnits`
  ordering, three default ordering; all compare sets, so one body serves all
  five once both sides use the same ordering.
- Local record guards: `abg/execution_basis.ts:169`, `abg/artifact_truth.ts:167`.
- `isJsonRecordShape` imported under the alias `isRecord` by
  `product/builtin_semantics.ts`, `abg/continuation.ts`, `abg/retry.ts`,
  `abg/invocation_execution_truth.ts`, `gtl/canonicalization.ts`,
  `gtl/materialize.ts`; and by name in `abg/event_body_encoding.ts`.
- Inline exact-key bodies outside `admission_predicates.ts` (the same
  `sort().join("\0") ===` algorithm on `Object.keys`): `validator/validation.ts:102`,
  `product/worksite_preparation.ts:89`, `product/worksite_revision.ts:87`,
  `product/registered_selection_native.ts:10`, `product/default_library.ts:117`,
  `product/semantic_stage.ts:135`, `product/workspace_operations.ts:194`,
  `product/worksite_command_forward.ts:86`, `product/execution_resolution.ts:184`,
  `abg/stdo_environment.ts:39`, `abg/invocation_admission.ts:365`,
  `abg/transport_contracts.ts:20`, `:26`, `:30`, `abg/c_call.ts:6294`, `:6299`,
  `abg/event_store.ts:3853`, `abg/definition_event_resource.ts:151`, `:226-237`,
  `:249-257`, `:296-297`, `:329-330`, `abg/actor_process.ts:469-471`,
  `abg/project_read_definition_bindings.ts:763-764`,
  `implementation/worksite_command_execution.ts:155-156`,
  `gtl/worksite_c0.ts:81-82`, `gtl/materialize.ts:33-45`,
  `gtl/registered_selection.ts:13`. About thirty sites.
- Not in this step: `join("\0")` comparisons of two arrays (sequence
  equality, for example `product/invocation.ts:311-344`,
  `abg/traversal_route.ts:2992`, `abg/execution_basis.ts:2171`) belong to
  the `derive` family at step 4; `includes("\0")` validity checks on paths
  and strings are not key-set comparisons and stay.
- `bindStaticOwner` inlines `v.safeParse` at `shared/static_definition_bindings.ts:134` and `:153`.
- O-RESOURCE: `shared/definition_binding_mechanics.ts` `requiredSlot` (135)
  and `exactContractCoordinate` (148) take `unknown`.
- O-SCHEMA: `product/default_library.ts:44` `jsonRecord = v.custom(...)` with
  a shallow check; `abg/project_read_definition_bindings.ts:149` `asRecord`
  casts after a shallow check.
- O-KEY: `product/default_library.ts:117` private `exactKeys` (used at 133).
- O-CODEC: `abg/event_body_encoding.ts:26` `nativeParts` and the decoders
  at 43, 52, 60 return an unknown restored event for later event-store
  validation. Keep that order.
- Inline `typeof x === "object" && x !== null` guards: 57 in the tree; replace
  those that guard a record you touch; do not sweep the rest.

**What changes.**

1. New `shared/admit/` with the five atoms of design §4.1, typed exactly as
   there, returning `Outcome` from `shared/refusal.ts` where the design says
   so. `hasExactKeys` compares own enumerable string keys as a set against
   the expected keys; one ordering, stated in a comment.
2. `shared/admission_predicates.ts` becomes a re-export of the new atoms (or
   is deleted and its importers updated; your choice, state it). The alias
   imports switch to `isRecord`.
3. Every inline exact-key site above calls `hasExactKeys`. Every local
   record guard you touch calls `isRecord`. Behavior is preserved for every
   valid input: an exact-key check that today compares own keys keeps
   comparing own keys; if a site's old body would accept an input that
   `hasExactKeys` refuses (or the reverse), stop and report the site rather
   than silently changing admission.
4. `bindStaticOwner` consumes `admitContract` for both `safeParse` sites and
   maps a refusal to the existing fault exactly as before.
5. O-RESOURCE: `requiredSlot` and `exactContractCoordinate` consume
   `admitRef` and `admitContract`; absent selection still yields the existing
   outcome.
6. O-SCHEMA: `jsonRecord` and `asRecord` are replaced by `isRecord` or
   `admitContract` with the existing schema, as D3 decides per site.
7. O-KEY: `default_library.ts:117` goes; line 133 uses `hasExactKeys` with the
   same five keys; exact owner shape (own keys), not inherited keys.
8. O-CODEC: `nativeParts` and the decoders use `isRecord` and `hasExactKeys`
   for their shape checks only; the restored event stays `unknown` for the
   store's later validation.
9. D4: `admitIJsonValue` and `admitIJsonText` call `admitJson` and throw on
   refusal; their signatures and error class are unchanged.
10. Tests under `test_env/` that import `admission_predicates.js` or
    `i_json.js` through `build/`: census them yourself; update import paths
    only.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/admit/**`
(new), `code/src/shared/admission_predicates.ts`, `code/src/shared/i_json.ts`,
`code/src/shared/static_definition_bindings.ts`,
`code/src/shared/definition_binding_mechanics.ts`, every site file named in
the census (the lines named and the imports they need), test import lines,
and the build outputs the gate regenerates (`build/**`, `contracts/**/*.json`,
`product-toolchain-manifest.json`). Plus this file's `## Return`. No design
text, no ticket, no GOALS, no sequence-equality sites, no change to any
admission outcome for a valid input.

**Gate** (in `build_tenants/abiogenesis/typescript`, in order): `npm run build`;
`npm run lint:imports`; `npm run test:installed:language`. Record exit codes
and wall times.

**Self-check before the commit:** (1) `grep -rn 'sort().join("\\0") ===\|sort().join("\\0") !==' code/src --include='*.ts'` lists only sites you have classified as sequence equality (step 4) in Return, none on `Object.keys`; (2) `grep -rn "function isRecord\|const isRecord" code/src` shows exactly one definition, in `shared/admit/`; (3) `grep -n safeParse code/src/shared/static_definition_bindings.ts` returns nothing; (4) the gate passed; (5) `git diff --stat` touches only grant files.

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 3: admit family; one owner for record shape, exact keys, JSON ingress and contract admission`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append:

```
## Return
- commit: <hash>
- atoms: <file: exported names>
- retired: <file:line -> atom>, one per line, with the before/after count of `Object.keys(...).sort().join("\0")` bodies in code/src
- obligations: O-RESOURCE, O-SHAPE, O-SCHEMA, O-KEY, O-CODEC: closed/open, each with its site list
- D3 decisions: <site: plain record | typed contract (schema)>, one per line
- gate: build <rc, s>; lint:imports <rc>; test:installed:language <rc, s, pass/fail>
- self-check: 1..5
- residuals
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing if: (a) any replacement would
change the admission outcome for a valid input at a site (report the site
and both behaviors); (b) the gate fails after one bounded fix; (c) a site
needs a Product or requirement change to close.

ACTION: execute step 3 as activated.

## Executive note (2026-10-22, from the step 1 re-review)

Design §10.6 row 2 omits two relations that this step's Return records:
(1) the admit atoms return `Outcome` and so depend on the step 2 carrier
(`shared/refusal.ts`), which the constitution §16.14 record of step 2 admits;
(2) the catalog disposition of the five admit atoms: the design's §10.7
calls them a `catalog_extension` of `N05`, and `N05` is a row of Table
5.6.3-B (the selected leaf-instance catalog: "strict schema and I-JSON
admission", `shared/i_json.ts::admitIJsonValue` and the owner Valibot
schemas), not a §10 catalog relation. In Return, state which §16.14 (b) row
of the step 2 record covers the admit atoms and that they extend the `N05`
leaf instance; change no constitution text in this step.

## Executive note 2 (2026-10-22, from the step 2 Return at `69132360f`)

Do these first, before any admit code; they are in your grant:

1. Rename the carrier's sequencing export `then` to `andThen` in
   `code/src/shared/refusal.ts` and in every design mention (§3's code
   block and prose, §4, §5, §10.7's carrier row) and in the constitution
   §16.14 (b) row that lists the carrier's exports. Reason, stated in one
   sentence in design §3: a module namespace with an export named `then` is
   a thenable, so `import()` of the module never settles; static imports
   work, dynamic ones hang. The step 2 Worker verified it with a probe.
2. Design §2: the `shared/refusal.ts` row's Imports column says `none`;
   the file imports the type `JsonValue` from `canonical_json.ts`. Change
   the column to `value` (types only).
3. Design §2 move 1 links `static_definition_bindings.ts` at its old path,
   which no longer exists; point the link at `public/binding/static_definition_bindings.ts`.
4. Design §10.6 row 1: record that the carrier's `catalog_addition_proposal`
   was accepted through the constitution §16.14 record at step 2 (commit
   `69132360f`), so the row's `U(B)` is empty and it co-evolves.

List each of these lines in Return. Head for this step is `69132360f`.

## Return

- commit: the commit that carries this Return, first line `Step 3: admit family; one owner for record shape, exact keys, JSON ingress and contract admission`, parent `572203825`; the hash is in the Worker's report.
- atoms: `code/src/shared/admit/record.ts`: `isRecord`, `hasExactKeys`; `code/src/shared/admit/json.ts`: `admitJson`, plus `JSON_ADMISSION_CODES` and `JsonAdmissionCode` for the D4 lift; `code/src/shared/admit/contract.ts`: `admitContract`, `admitRef`; `code/src/shared/admit/index.ts`: the five atoms and the code type; `code/src/shared/admit/validate_refusal.ts`: private refusal constructor of the family. Signatures are those of design §4.1. `hasExactKeys` is the existing element-wise body of `admission_predicates.ts:82` with its parameter widened to `object`. It compares own enumerable string keys with both sides in the default string sort (UTF-16 code units). `admission_predicates.ts` re-exports `isRecord` and `hasExactKeys` and keeps four string predicates that are outside the family.
- retired: `Object.keys(...).sort().join("\0")` bodies in `code/src`: 34 before, 0 after. The count is multi-line aware; the single-line grep of self-check 1 misses ten of them.
  - `shared/admission_predicates.ts:17` `hasNulJoinedKeys`, `:44` `hasObjectUnicodeNulJoinedKeys`, `:56` `hasJsonNulJoinedKeys`, `:67` `hasNulJoinedFields`, `:78` `hasUnicodeNulJoinedKeys` -> `hasExactKeys`; `:97` `hasExactJsonKeys` -> `hasExactKeys`; `:82` `hasExactKeys` -> moved to `admit/record.ts`
  - `shared/admission_predicates.ts:7` `isRecord` -> moved; `:20` `isJsonRecord`, `:26` `isJsonRecordShape`, `:32` `isOptionalJsonRecord`, `:59` `isMutableRecord` -> `isRecord`
  - `validator/validation.ts:102` -> `hasExactKeys`
  - `product/worksite_preparation.ts:89` -> `hasExactKeys`
  - `product/worksite_revision.ts:87` -> `hasExactKeys`; `:85` local `record` -> `isRecord`
  - `product/registered_selection_native.ts:10` -> `hasExactKeys`; `:7` local `record` -> `isRecord`
  - `product/default_library.ts:117` -> `hasExactKeys` (O-KEY); `:44` `jsonRecord` -> `v.custom(isRecord)`
  - `product/semantic_stage.ts:135` -> `isRecord` + `hasExactKeys`; `exactRecord` stays as a one-line composition
  - `product/workspace_operations.ts:194` -> `hasExactKeys`
  - `product/worksite_command_forward.ts:86` -> `hasExactKeys`; `:84` local `record` -> `isRecord`
  - `product/execution_resolution.ts:184` -> `hasExactKeys`; guard at 181-183 -> `isRecord`
  - `abg/stdo_environment.ts:39` -> `isRecord` + `hasExactKeys`; `keys` stays as a one-line composition
  - `abg/invocation_admission.ts:365` -> `hasExactKeys`
  - `abg/transport_contracts.ts:20`, `:26`, `:30` -> `hasExactKeys`
  - `abg/c_call.ts:6294`, `:6299` -> `hasExactKeys`
  - `abg/event_store.ts:3853` -> `hasExactKeys`
  - `abg/definition_event_resource.ts:151`, `:226`, `:235`, `:249`, `:296`, `:329` -> `hasExactKeys`
  - `abg/actor_process.ts:469` -> `hasExactKeys`; guard at 468 -> `isRecord`
  - `abg/project_read_definition_bindings.ts:763` -> `hasExactKeys`; `:149` `asRecord` body -> `isRecord`
  - `implementation/worksite_command_execution.ts:155-156` -> `hasExactKeys`
  - `gtl/worksite_c0.ts:81-82` -> `hasExactKeys`; guard at 74 -> `isRecord`
  - `gtl/materialize.ts:33-45` -> `hasExactKeys`; guard at 30-32 -> `isRecord`
  - `gtl/registered_selection.ts:13` -> `hasExactKeys`; `:8` local `record` -> `isRecord`
  - `abg/execution_basis.ts:169` local `isRecord` -> `isRecord`; `abg/artifact_truth.ts:167` local `isRecord` -> `isRecord`
  - `shared/i_json.ts` value path (`admitIJsonValue` body, `admitIJsonArray`, `assertUnicodeScalarString`, `isJsonObject`, `isDataDescriptor`) -> `admitJson`
  - `public/binding/static_definition_bindings.ts:47`, `:66` `v.safeParse` -> `admitContract`
  - Every NUL-joined replacement differs from its old body only when keys collide, which is the change P-KEYS and O-KEY require: `"a\0b"` against `a`,`b`, or an empty key against an empty list. Such an input's key set differs from the expected set, so it is not a valid input at any site. Valid inputs keep their outcomes.
  - Census: 34 exact-key bodies retired. 29 inline sites in 21 files migrated.
  - Record guards retired: 4 typed aliases, 6 local definitions and 5 inline guards. The shallow casts in `asRecord` and `jsonRecord` went with them.
  - Importers switched: 37 alias import lines plus 6 importers that used the retired names directly (listed under residuals).
- obligations:
  - O-RESOURCE: closed for the activation's sites. In `public/binding/definition_binding_mechanics.ts`, `requiredSlot` (135) admits the selected discriminator through `admitRef`, and `exactContractCoordinate` (148) admits through `admitContract(publicContractCoordinateSchema, ·)` before the comparison. An absent or non-ref selection still yields `null`. The design's seven self-comparison encodability probes were not in this census and are untouched.
  - O-SHAPE: closed except one site. Shallow bodies were retired into `isRecord`. Six of the seven shape-wrapper consumers have unknown members unless their input is truthfully `JsonValue`; `abg/retry.ts:663` keeps an explicit `as JsonValue` cast (see D3 and residuals):
    - `product/builtin_semantics.ts`, `abg/continuation.ts`, `abg/invocation_execution_truth.ts` (`:233` parameter is `JsonValue | undefined`), `gtl/canonicalization.ts` (`:69` callback parameter `JsonValue`), `gtl/materialize.ts` (`:124` callback parameter `JsonValue`), `abg/event_body_encoding.ts`
    - `abg/fan_out_projection.ts:1296` takes the same callback typing.
    - No recursive validator was added on a read path.
  - O-SCHEMA: closed by decision.
    - `product/default_library.ts:44` is a plain record (`v.custom(isRecord)`) with identical acceptance.
    - `abg/project_read_definition_bindings.ts:149` `asRecord(value: JsonValue | undefined)` is a plain JSON record or `null`, with no cast. `coordinateFrom` now takes `JsonValue | undefined`.
  - O-KEY: closed. `product/default_library.ts:117` is gone, and `:133` uses `hasExactKeys` with the same five keys over own keys. Valid results stay true. The collided or inherited `basis`/`judgment` form is refused. All 34 bodies listed above are retired the same way.
  - O-CODEC: closed. In `abg/event_body_encoding.ts`, `nativeParts` (26) and `decodeEventBody` (163) use `isRecord` and `hasExactKeys` for shape only.
    - `valueAtSlot` builds its bundle with unknown members.
    - `omitValue` and `targetIsAbsent` take records with unknown members.
    - `replaceValue` is generic over the payload type, so the decoded event stays `unknown` until the store validates it.
- D3 decisions:
  - `abg/retry.ts:659-663` (`isProjectedRetryResumeCarrier`, `inputValue` digest): open. The site keeps `isRecord` plus `sha256Canonical(value.inputValue as JsonValue)` inside the existing `try`, which is the old behaviour; the cast was hidden in the retired `isJsonRecordShape` and is now visible. `admitJson` here would refuse a non-I-JSON record that the digest accepts today (lone surrogate, array hole, non-plain object such as a class instance), and no I-JSON admission of the value upstream is shown: `abg/execution_basis.ts:1525` detaches the invocation input through `detachJsonRecord` (`:964`, `structuredClone`, shallow record check, freeze), not `admitIJsonValue`. Admitting here is a stop-(a) change, so the D3 choice is left to the owner.
  - `abg/project_read_definition_bindings.ts:149` `asRecord`: plain JSON record (`isRecord`, `JsonValue` parameter).
  - `product/default_library.ts:44` `jsonRecord`: plain record (`isRecord`). The schema output still claims `JsonValue` members (see residuals).
  - `abg/invocation_execution_truth.ts:233` `canonicalRecordDigest`: plain JSON record (callers hold `JsonValue`).
  - `abg/event_body_encoding.ts` decode path: plain record, members unknown.
  - `public/binding/static_definition_bindings.ts` resource assertion and receipt: typed contract (the owner's `resourceAssertionSchema` and `resourceReceiptSchema`).
  - `public/binding/definition_binding_mechanics.ts` `exactContractCoordinate`: typed contract (`publicContractCoordinateSchema`).
  - `requiredSlot`: ref (`admitRef`). The discriminator domain narrows to nonblank strings. Both declarations use strings (`product/run_operation_contracts.ts:93` `["graph_function"]`, `product/verification_operation_contracts.ts:123` `["installed_artifact"]`), so outcomes are unchanged.
- catalog relation (Executive note 1):
  - The step 2 record's §16.14 "affected catalog/entity rows" field, part (b), covers the admit atoms in the entry "`admitJson`, `admitContract`, `admitRef`, `isRecord`, `hasExactKeys`: `catalog_extension` of `N05`, row 2".
  - They extend the `N05` leaf instance of Table 5.6.3-B: strict schema and I-JSON admission, `shared/i_json.ts::admitIJsonValue` and the owner Valibot schemas.
  - Their `Outcome` return depends on the carrier entry of the same (b) field: `StructuralRefusal`, `Outcome`, `ok`, `refused`, `andThen`, `catalog_addition_proposal`, row 1.
  - No constitution text changed beyond the `andThen` token.
- Executive note 2:
  1. `then` -> `andThen`:
     - `code/src/shared/refusal.ts`.
     - Design §3 code block, plus one sentence after it giving the reason.
     - §5 unit/lift law, sequential row (name and the three laws) and falsifier.
     - §6 prime-atom row: not named in the note, but a design mention.
     - §10.7 carrier row.
     - §4 has no mention of the export.
     - Constitution §16.14 (b) token at line 4390.
     - No importer of `then` existed in `code/src`, `build/` or `test_env/`. A dynamic `import()` of `shared/refusal.js` and of `shared/admit/index.js` settles.
  2. Design §2 `shared/refusal.ts` row Imports: `value` (types only).
  3. Design §2 move 1 link now points at `public/binding/static_definition_bindings.ts`.
  4. Design §10.6 row 1: `U(B)` is empty. The row records that the addition was accepted through the constitution §16.14 record at step 2 (`69132360f`) and that the Executive decided the call-admission placement at step 2. Sequencing is co-evolution.
- D4: `admitIJsonValue` is `liftIJson(admitJson(input), label)`. `admitIJsonText` keeps its jsonc parse, duplicate-key and framing front end, and calls `admitJson` for property names and leaves. Signatures and `IJsonAdmissionError` are unchanged. The lift renders `${label}${evidence.at}: ${evidence.reason}`. An old-versus-new differential (`admitIJsonValue` and `admitIJsonText`, three labels, 202 comparisons covering code, message, value and frozen state, including -0, `__proto__` keys, getters, symbols, holes and a throwing proxy) found 0 differences.
- gate (in `build_tenants/abiogenesis/typescript`, final tree): build rc 0, 32 s; lint:imports rc 0, <1 s (21 modules); test:installed:language rc 0, 45 s, 1/1 pass.
- self-check:
  1. The grep lists only `product/environment.ts:713` and `product/verify_product.ts:1235`. Both are sortedness checks on value arrays (sequence equality, step 4); neither is on `Object.keys`. The multi-line count is 0.
  2. Noted fail. The grep shows `shared/admit/record.ts:6` and `product/release_snapshot_definition_bindings.ts:91` `isRecordEvidence`. The second matches by prefix, but its body is the `isRecord` algorithm: a private copy outside the census, left in place and listed under residuals.
  3. No output. The named path `code/src/shared/static_definition_bindings.ts` does not exist; the owning file `code/src/public/binding/static_definition_bindings.ts` has no `safeParse`.
  4. Passed.
  5. Noted fail. `git diff --stat` touches the grant files plus the files listed under residuals, each required by Executive note 2, by the retirement, or by the build.
- residuals:
  - Two out-of-gate tests now fail by design; their assertions cannot be repaired with import-path edits:
    - `test_env/tests/t288-admission-predicates.test.mjs` (3/3 fail): imports retired names, asserts NUL-collision results, and asserts pre-step types, including `hasExactKeys(value: Readonly<Record<…>>)` where the design has `object`.
    - `test_env/tests/t287-common-computational-library.test.mjs` (import of the retired `hasUnicodeNulJoinedKeys`; collision assertion at :65).
    - A differential over t288's case corpus: `isRecord` classes show 0 differences. Exact-key classes differ only on NUL or empty-key collisions, non-string expected elements, and the `TypeError` parameter name for a non-iterable expected list.
  - `admitJson(raw: unknown)` cannot distinguish JSON text from a string value. Three of the seven codes (`duplicate_object_key`, `invalid_json_framing`, `malformed_json`) therefore come from the text front end kept in `admitIJsonText`. A text-form entry, or a design note, is the owner's call.
  - Changes outside the literal grant list, each required by item 2, by the retirement, or by the build:
    - 37 alias import lines.
    - `product/catalog_definition_bindings.ts`, `product/install_definition_bindings.ts`, `product/project_read_definition_bindings.ts` and `validator/conformance_definition_bindings.ts` imported `hasUnicodeNulJoinedKeys` through `definition_binding_mechanics`. They now import `hasExactKeys` from `shared/admit/`, and `definition_binding_mechanics` no longer re-exports it.
    - `product/native_workspace_assessment.ts`: `isJsonRecord` -> `isRecord`.
    - `abg/fan_out_projection.ts:1296` typing (O-SHAPE).
    - `gtl/worksite_command_execution.ts` C2 context pin: digest, `byteCount` 110016 -> 110010, span 100071-102379 -> 100065-102373, span digest unchanged. The import line of `product/worksite_command_execution.ts` shortened by 6 bytes, as at step 2.
  - Not retired: outside the census, or a different algorithm.
    - `abg/artifact_truth.ts:171` and `abg/traversal_transition.ts:85` local `hasExactKeys` (`Object.hasOwn` with length; counts non-enumerable keys).
    - Local `isJsonRecord` in `abg/c_call.ts:1561`, `abg/c_call_outcome.ts:136`, `abg/traversal_route.ts:934`, `abg/traversal_cursor.ts:104`, `abg/execution_basis.ts:949`, `hog/recursion_lifecycle.ts:139` and `hog/workflow_lifecycle.ts:135`.
    - Remaining local `record` guards, among them `abg/stdo_environment.ts:37` (typed `any`, 13 uses), and the remaining inline guards.
    - Guards kept so admission and casts stay as they were: `abg/transport_contracts.ts:18`, `:26`, `:29`; `product/default_library.ts:133`; `product/worksite_preparation.ts:87`. Each is cast-dependent or lacks `Array.isArray`.
    - `shared/references.ts` `requireRef` is not lifted over `admitRef`; it is not in the grant.
  - `abg/retry.ts:663` `as JsonValue` (O-TYPE, D3 open). Old and current behaviour: any own-enumerable record whose canonical digest matches is accepted. `admitJson` behaviour: the same records are accepted only when every member is I-JSON. The owner decides whether the retry carrier's input is admitted as I-JSON here or upstream at `abg/execution_basis.ts:1525`.
  - `product/release_snapshot_definition_bindings.ts:91` `isRecordEvidence` is a private copy of `isRecord` outside the census (self-check 2).
  - `jsonRecord` still declares `Readonly<Record<string, JsonValue>>` output. Its consumers `abg/default_library.ts:51`, `abg/instruction_assembly.ts:325` and `product/default_library.ts:224` read members as `JsonValue` and are outside this grant (O-TYPE).
  - In `event_body_encoding`, the native-slot spread of `replaceValue` is typed through generic-spread intersection, not member by member.
  - `build/code/src/gtl/stdo_run_environment.d.ts` reorders one union: a tsc artifact.
  - The plan post and `step-5.md` changed in the working tree during this step. They are not mine and were not staged.
- return route: this file
