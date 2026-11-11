# TD-31 Return: one run-environment shape, no `stdoRunEnvironments`

Writer: Claude Opus 5.5. Branch `claude/td31-stdo-environment-shape` from
local `main` at `84d4f6d8c`, worktree `/private/tmp/abg-td31`. Change class:
realization_refactor. No push, no tag.

**Status: stopped before the deletion commit.** The move (step 1) is committed
at `232265c3f`, and it is proven byte-identical. The deletion (step 2) is
built, measured and saved as a patch, but it is not committed. One door meets
the stop condition: Product resolution on a caller-supplied catalog still
admits a publication that carries the member, when that publication is a
closure dependency rather than the program publication. That door admits it
on base too, and it admits any unknown key the same way. The ruling request
is in section 7.

Everything else passes on the patched build:

- The source census is empty.
- `npm run build` and the three lints pass.
- The new lane is red on base and green on the patch.
- All 338 recorded publication values that carry the member keep their
  semantic digest.
- The run-environment differential is identical to base.

| Commit | Content |
| --- | --- |
| `232265c3f` | step 1: the run-environment schemas own their role, `contexts` and `accesses` entries |
| this commit | this Return |

Uncommitted, held for the ruling:

| Path | Content |
| --- | --- |
| `/private/tmp/abg-td31-work/td31-step2-source.patch` | step 2 deletion, `code/src` only; `git apply --check` passes on `232265c3f` |
| `test_env/tests/t292-td31-stdo-run-environment-shape.test.mjs` | new lane, untracked in the worktree; copy at `/private/tmp/abg-td31-work/` |

## 1. Lines

| File | Base `84d4f6d8c` | Step 1 `232265c3f` | With patch |
| --- | --- | --- | --- |
| `gtl/stdo_run_environment.ts` | 313 | 319 (+7 −1) | 253 (+5 −71) |
| `abg/stdo_environment.ts` | 340 | 346 (+8 −2) | 214 (+3 −135) |
| `product/stdo_environment.ts` | 437 | 437 | 280 (+3 −160) |
| `gtl/serialization_contracts.ts` | 269 | 269 | 267 (+1 −3) |
| `gtl/canonicalization.ts` | 224 | 224 | 223 (+0 −1) |
| `gtl/index.ts` | 333 | 333 | 332 (+1 −2) |
| `validator/raw_admission.ts` | 235 | 235 | 234 (+1 −2) |
| **`code/src` total** | | **+15 −3** | **+14 −374** |

Step 1 and the patch together remove 348 lines net from `code/src`. The
brief estimated about 450. The difference is the helpers and the live
`StdoEnvironmentRefusalCause`, which stay (section 6).

### Step 1, committed (move)

- `RUN_ENVIRONMENT_SCHEMA` states its role entries in a local `roleEntries`
  instead of spreading `STDO_RUN_ENVIRONMENT_SCHEMA.entries.roles.item.entries`.
  It keeps the spread-then-override form, so the role entry order at runtime
  and the inferred `.d.ts` stay the same.
- `RUN_ENVIRONMENT_EVIDENCE_SCHEMA` states `contexts` itself, and states its
  `accesses` entries in a local `accessEntries`. Neither is read from
  `STDO_ENVIRONMENT_EVIDENCE_SCHEMA` any more.

Proof against base, both builds from clean `npm run build`:

| Check | Result |
| --- | --- |
| Emitted `.d.ts` (496 files, sha256 list) | identical |
| Generated JSON Schemas and contracts under `contracts/` (202 files) | 201 identical. `capabilities/capability-definition-graph.json` differs only by the identity cascade from the two changed `.js` files: 241 `productContentDigest`, 34 `capabilityDefinitionDigest`, 34 `capabilityDefinitionRef`, 1 `graphDigest` |
| `publicContractCatalog` | 75 rows, 0 changed, `catalogDigest` unchanged |
| Differential: `RUN_ENVIRONMENT_SCHEMA` over 14,344 valid and invalid values | identical verdicts and predicate results (2,079 accepted, 475 pass `isRunEnvironmentDeclaration`) |
| Differential: `RUN_ENVIRONMENT_EVIDENCE_SCHEMA` over 17,017 values | identical (2,753 accepted) |
| Differential: module-publication raw admission with `runEnvironments[0]` mutated, 14,344 values | identical |
| `lint:imports`, `lint:lifecycle`, `lint:calculus` | pass |

The differential seeds are the run environments of every
`construct*ModulePublication` output (3 seeds) and two evidence values. Each
seed is mutated at every node: a key or item deleted, an extra key, an
emptied or duplicated array, and each node replaced by 16 junk values
(empty and blank strings, negative, fractional and large numbers, `null`,
booleans, arrays, objects, a digest, a `..` path and an absolute path).

### Step 2, patch (delete)

| File | Deleted | Changed |
| --- | --- | --- |
| `gtl/stdo_run_environment.ts` | `STDO_RUN_ENVIRONMENT_SCHEMA`, `StdoRunEnvironmentDeclaration`, the STDO-only `companion` entries, `isStdoRunEnvironmentDeclaration` with the rc.6/rc.7 release-URI allowlist, `stdoEnvironmentForProgram`, `validStdoEnvironmentPublication`, `validStdoEnvironmentProgram`, and the `publication.stdoRunEnvironments` branches in `runEnvironmentForProgram`, `selectorRoleFromBoundDeclarations` and `validRunEnvironmentPublication` | `stdoInventoryDigest(members)` is typed `RunEnvironmentDeclaration["dependencies"][number]["members"]`. `stdoRoleForDeclaredLeaf` returns `Exclude<RunEnvironmentRole["role"], "selector"> \| null`. Both types are structurally the same as before. |
| `abg/stdo_environment.ts` | `recordBytes`, `STDO_ENVIRONMENT_EVIDENCE_SCHEMA`, `StdoEnvironmentEvidence`, `isStdoEnvironmentEvidence`, `stdoEvidenceMatchesInvocation`, `projectStdoRoleEvidence` | `stdoRecordInventory` returns `RunEnvironmentDeclaration["dependencies"][number]["members"]` (structurally the same) |
| `product/stdo_environment.ts` | STDO `roots`, `STDO_ENVIRONMENT_RESOURCES_SCHEMA`, `StdoEnvironmentResources`, `StdoEnvironmentObservation`, `inventoryPaths`, `verifyCompanion`, `observeStdoEnvironment`, and the now-unused `readdir` import | none. `ref`, `path`, `digest`, `hash`, `encoded`, `inside`, `fileAt` and `ObservationFailure` are untouched. |
| `gtl/serialization_contracts.ts` | the `stdoRunEnvironments` member of `MODULE_PUBLICATION_SCHEMA` and its import | none |
| `gtl/canonicalization.ts` | the `stdoRunEnvironments` sort branch in `canonicalizeModulePublication` | none |
| `validator/raw_admission.ts` | the `isStdoRunEnvironmentDeclaration` local-relation check and its import | none |
| `gtl/index.ts` | the exports `isStdoRunEnvironmentDeclaration` and `type StdoRunEnvironmentDeclaration` | none |

These names are kept: `constructStdoRunEnvironmentDeclaration`,
`stdoRoleForDeclaredLeaf`, `stdoInventoryDigest`, `STDO_ENVIRONMENT_POLICY`,
`exactStdoBytes`, `stdoSourceInventory`, `stdoRecordInventory`,
`StdoEnvironmentRefusalCause`, and the replay correspondence label
`stdo_environment`.

Checks on the patched build:

| Check | Result |
| --- | --- |
| `rg "stdoRunEnvironments" code/src` | empty |
| `STDO_ENVIRONMENT_POLICY` uses | the kept refusal in `runEnvironmentForProgram` (`:169`) and the same refusal in `selectorRoleFromBoundDeclarations` (`:181`); plus the definition and the `./gtl` export |
| `npm run build` | pass |
| `lint:imports`, `lint:lifecycle`, `lint:calculus` | pass |
| New lane `t292-td31-stdo-run-environment-shape` | 3/3 pass (base: 2 pass, 1 fail) |
| Differential against base, same three families and counts as step 1 | identical |
| Live code reading a deleted name | none; the build compiles without them |

## 2. Refusal per door

The subjects are:

- the semantic-stage publication with `stdoRunEnvironments: []`;
- the recorded pilot publication
  `20260915_ABG5_EXECUTIVE_PILOT/stage-b-native-02/stdo-note-product-source/build/publication.json`,
  which carries one allowlisted rc.7 declaration;
- a Program selecting the policy `abg.stdo_run_environment`;
- a clean publication.

Step 1 behaves as base at every door. The probe is
`/private/tmp/abg-td31-work/scripts/doors.mjs`. Its outputs are
`doors-base.json` and `doors-step2.json`.

| Door | Subject | Base and step 1 | With patch |
| --- | --- | --- | --- |
| `./gtl/m02` `admitModule` | member `[]`, recorded rc.7 | `raw_admitted_value` | `raw_admission_refusal` `invalid_kind` `$/stdoRunEnvironments: Invalid key` |
| `./gtl/m02` `serializeModule` | member `[]`, recorded rc.7 | serializes | throws `TypeError` `invalid_kind` |
| `validatePublication` after raw admission | member `[]`, recorded rc.7 | `static_validation_refusal` stage `publication`, `invalid_reference` `$.runEnvironments` | not reached: raw admission refuses first |
| Catalog publication: `catalog.admit` (`CatalogOperationPort.admit`, `constructReadyCatalog`) | member `[]`, recorded rc.7 | `catalog_validation_refusal` / `static_validation_refusal` stage `publication`, `invalid_reference` `$.runEnvironments` | `catalog_validation_refusal` / `raw_admission_refusal` `invalid_kind` |
| `conformance.evaluate` `gtl_program` (raw packet) | member `[]` | `validation_failed` `invalid_reference` `$.runEnvironments` | `raw_admission_refused` `invalid_kind` |
| `conformance.evaluate` `gtl_program` (raw packet) | recorded rc.7 | `validation_failed` (`$.runEnvironments` plus two unrelated diagnostics) | `raw_admission_refused` `invalid_kind` |
| Product resolution on a caller-supplied catalog (`constructProgramValidationInputFromResolvedClosure`, then `validateProgram`) | member on the program publication | `static_validation_refusal` stage `program`, `invalid_reference` `$.runEnvironments` | validation input `raw_admission_refusal` `invalid_kind` |
| Same door | member on a dependency publication only | **admitted** (`program_validation`) | **admitted** (`program_validation`): stop condition |
| Same door | unknown key `fooTd31` on a dependency publication only | admitted | admitted |
| `owner_bindings/run_invocation.ts` copy of `MODULE_PUBLICATION_SCHEMA` (`:620`) | any member | refused (strict object without the member) | refused |
| All doors above | policy `abg.stdo_run_environment` | `invalid_reference` `$.runEnvironments` at stage `publication` (program at resolution) | the same, with the same code |
| All doors above | clean | admitted | admitted |

**Public tightening.** The `./gtl/m02` admission and serialization calls admit
the recorded rc.6/rc.7 publications today. With the patch they refuse them.
The catalog and conformance doors already refused these publications; with
the patch they refuse earlier, at structural admission, with `invalid_kind`.

**The `run_invocation` copy.** Its module-publication copy has no member, and
it refuses the member before and after. Once the patch lands, the owner schema
agrees with it, which settles one TD-34 difference. I did not edit the file.

## 3. Recorded history

| Root | Scan | Files searched | Bytes | Contain the string | Carry it as a JSON key | Publication values |
| --- | --- | --- | --- | --- | --- | --- |
| `abiogenesis/.ai-workspace` | `rg -l -uu -a --no-messages --max-filesize 4G -g '*.json' -g '*.jsonl'` | 240,669 | 159.8 GB | 3,283 | 520 (390 are copies of `gtl-serialization.schema.json`) | 338 in 130 files |
| main checkout `test_env/test_runs` | same | 99,858 | 41.6 GB | 1,157 | 216, all schema copies | 0 |
| worktree `test_env/proof`, `evidence`, `fixtures` | same | 53 | 37.6 MB | 2 (`abi5-root-r1.json`, `-r2.json`) | 0; both hold `.d.ts` text | 0 |

The remaining hits hold the string, but not as a key. A check for the key
escaped inside JSON strings finds 0 files.

All 338 values are `module_publication` values with exactly one
`stdoRunEnvironments` entry. They come from the September 15–16 pilot and RC7
comment folders under `comments/codex/`:

| Folder | Files |
| --- | --- |
| `20260915_ABG5_EXECUTIVE_PILOT` | 43 |
| `20260916_ABG5_RC7_ORIGINAL_1B_01` | 35 |
| `20260915_ABG5_RC7_SOURCE_CONTINUATION` | 20 |
| `20260915_ABG5_RC7_PROOF_CONTINUATION` | 16 |
| `20260916_ABG5_RC7_OBSERVATION_REPAIR` | 6 |
| `20260915_ABG5_RC7_TASK_1A` | 4 |
| `20260915_ABG5_RC7_TASK_1B` | 4 |
| `20260916_ABG5_RC7_COMBINED_QUALIFICATION` | 2 |

By file name the values sit in:

| File | Values |
| --- | --- |
| `call-N.jsonl` | 97 |
| `receipt-N.json` | 57 |
| `stdout-N.json` | 57 |
| `declaration-preflight.json` | 36 |
| `program-ready-N.json` | 30 |
| `publication.json` | 20 |
| `setup-ready.json` | 15 |
| refusal and result files | 26 |

No event log carries the member.

**Re-admission paths.** No reopen or replay path raw-admits a recorded
publication. Recorded publications reach deleted code only through
`modulePublicationSemanticDigest` (`product/publication.ts`). That function
calls `canonicalizeAuthoredGtlCarrier`, which calls
`canonicalizeModulePublication` and its deleted sort branch. The reopen and
replay callers are:

- `abg/project_read_ports.ts:410,433,447`
- `abg/execution_basis.ts:647`
- `abg/qualification_proof.ts:226`
- `abg/semantic_stage.ts:129`
- `abg/semantic_job.ts:131`
- `abg/worksite_command_forward.ts:110`

Every value has one entry, so the deleted sort is a no-op. Measured over all
338 values, base against patch:

| Measure | Equal | Differ | Throw |
| --- | --- | --- | --- |
| `modulePublicationSemanticDigest` | 338 | 0 | 0 |
| canonical form digest | 338 | 0 | 0 |

Base raw admission admits all 338. With the patch, raw admission refuses all
338 with `invalid_kind`, but no reopen or replay path calls raw admission on
them. The recorded-history stop condition therefore does not hold.

Recorded RC6/RC7 event logs also carry STDO evidence, in the
`invocation_admitted` payload field `stdoEnvironment`. The only reader of that
field was `projectStdoRoleEvidence`, and nothing outside its file called it.
No live code reads the field before or after.

## 4. Generated contracts and identity

The generated files are not committed. The worktree holds the base generated
files.

| Identity | Base `84d4f6d8c` | Step 1 | With patch |
| --- | --- | --- | --- |
| `productContentDigest` | `sha256:f2998d9e58576b590cb08c57f98dfab171c93b42c067315fdc920d809d7d8127` | `sha256:832bc30ef4735e152b78fd997c8eb946dfb37aa705c938586ce9e428405a3058` | `sha256:8288cb234352edacba535da444b9bfa2e1efaf615e5961894266b3b9ab224c80` |
| `contributionManifestDigest` | `sha256:3c7080f93dc6f8c6e7ff2bae4cd9ec0566cd16ff677fcf2c32090d4608287ebf` | `sha256:adb260b1174d4be8787bb82d1a8b31e3467d1d825823746a79ca17d391650a2b` | `sha256:770b1192d6c3b436ee19f8d580378592f1938cbb35f583bfc9f395f12403cafc` |
| `publicContractCatalog.catalogDigest` | `sha256:44dc5b920db0402cab7ec6a5c2c7fdd6c2fdea53bd204df1c49604df66d096f4` | unchanged | `sha256:9b2adffbf9c4432708f194c51a17dcf8c14aa03ccb674f5c4da7b06d083461b5` |
| capability graph `graphDigest` | `sha256:4667187b71327110a9be5c35ea3c37fb348090bc7a65c5f3b92c1c1ecaa4cf88` | `sha256:3a5d1612a36d0b871912cd943e5b3e2f73c7e61ef6f931babf7cdd822b9f98c0` | `sha256:f23269c57d3e2f3059e320918bfc8976e3ddaf003fb3928e75fcb34e186bf54f` |

### Contract rows

The catalog has 75 rows in all three builds. No row is added, removed or
moved.

- **Step 1:** 0 rows change.
- **With the patch:** 51 rows change content.
  - 28 change `contractDigest`.
  - 50 change `nativeTypedLocator.declarationInventory`, where the
    declaration digests of the changed `.d.ts` files appear.
  - 5 change `assetLocator.contentDigest`: four rows locate
    `gtl-serialization.schema.json`, and one locates the conformance corpus.

### Changed contract files with the patch

| File | Change |
| --- | --- |
| `contracts/schemas/gtl-serialization.schema.json` | base with its three `stdoRunEnvironments` properties removed equals the patched file exactly (checked by JSON comparison). The removed properties are at `$defs/ModulePublication/properties`, `$defs/GtlProgramConformanceInput/properties/publication/properties` and `$defs/GtlLanguageConformanceCorpus/…/packet/properties/publication/properties`. No `$defs` entry is added or removed. 199,854 → 178,407 bytes. The raw diff is `/private/tmp/abg-td31-work/gtl-serialization-schema-step2.diff`. |
| `contracts/conformance/gtl-language-conformance-corpus.json` | only `schema.contentDigest`, `f4a58c61…` → `8d2a603e…` |
| `contracts/capabilities/capability-definition-graph.json` | identity cascade |

### Changed `.d.ts` files with the patch

Ten files change.

- **Removals only.** Six files lose the member's inlined declaration type,
  92 lines each, or 736 lines in `gtl/serialization_contracts.d.ts`:
  - `abg/qualification_proof`
  - `gtl/default_library`
  - `gtl/serialization`
  - `gtl/serialization_contracts`
  - `gtl/worksite_command_forward`
  - `validator/conformance_operation`
- **Owner files.** Four files lose the deleted declarations and carry the
  retyped signatures listed in section 1:
  - `gtl/stdo_run_environment`
  - `gtl/index`
  - `abg/stdo_environment`
  - `product/stdo_environment`

## 5. Tests

Before: the base, run one file at a time with the brief's command. `r1` and
`r2` ran after `refresh-candidate-basis.mjs`; the refreshed basis is not
committed.

| File | Tests | Pass | Fail | Skip |
| --- | --- | --- | --- | --- |
| `t292-td31-stdo-run-environment-shape` (new) | 3 | 2 | 1 | 0 |
| `t287-stdo-run-environment` | 2 | 0 | 0 | 2 |
| `t287-stdo-environment-citation` | 2 | 0 | 0 | 2 |
| `t287-stdo-proof-entry` | 5 | 0 | 0 | 5 |
| `t287-stdo-run-environment-installed.mjs` | 1 | 0 | 0 | 1 |
| `t287-gtl-serialization-publication` | 9 | 9 | 0 | 0 |
| `t287-management-context` | 14 | 12 | 0 | 2 |
| `t287-declared-testing-capability` | 7 | 3 | 0 | 4 |
| `t287-c2-child-program` | 4 | 4 | 0 | 0 |
| `t287-c2-core-environment` | 7 | 7 | 0 | 0 |
| `t287-default-library` | 37 | 34 | 0 | 3 |
| `t287-native-selection-profile-scope` | 4 | 4 | 0 | 0 |
| `t287-stdo3-run-environment` | 5 | 5 | 0 | 0 |
| `t288-instruction-assembly-owner` | 6 | 4 | 0 | 2 |
| `m5-c-algebra-validation` | 22 | 19 | 0 | 3 |
| `r1-packed-artifact` | 1 | 1 | 0 | 0 |
| `r2-clean-install` | 1 | 1 | 0 | 0 |

After: only the new lane has run on the patch (3/3 pass). The other
after-runs wait for the ruling, because the test edits below land with the
deletion commit.

The new lane asserts three things:

1. A publication carrying the member (empty, and with an allowlisted rc.7
   declaration) is refused with `invalid_kind` at `admitModule`, by
   `serializeModule` and at the catalog door.
2. The policy refusal keeps `invalid_reference` at `$.runEnvironments`.
3. A clean publication is admitted, validated and serialized.

### Test edits planned with the deletion (ruling 6)

| File | Edit | Reason |
| --- | --- | --- |
| `t287-stdo-run-environment.test.mjs` | delete the test "STDO declaration, exact actual access, bounded refusals and immutable profiles" and its imports (`observeStdoEnvironment`, `isStdoEnvironmentEvidence`, `projectStdoRoleEvidence`, `validStdoEnvironmentPublication`, `validStdoEnvironmentProgram`); keep "construction readiness rederives…" | its only subject is the deleted STDO observation and evidence; the file's top-level imports otherwise fail at load |
| `t287-stdo-environment-citation.test.mjs` | delete the test "RC7 source citation boundary…" and its load-time imports; in "preserved failed RC6 output…", drop the `isStdoRunEnvironmentDeclaration(priorDeclaration)` assertion (`:123`) | the first test's subject is `observeStdoEnvironment` and `projectStdoRoleEvidence`; the dropped assertion states that the deleted RC6 support remains |
| `t287-gtl-serialization-publication.test.mjs` | the scalar projection test (`:122–141`): replace the `stdoRunEnvironments` scalars with their `runEnvironments` counterparts and drop `tagObject`, which has none; the round-trip test (`:175–177`, `:220`): the `['stdoRunEnvironments', [historical]]` fixture becomes a structural refusal (`invalid_kind`) | refusal-asserting cases now assert the structural refusal |
| `t287-management-context.test.mjs:400` | `runEnvironmentForProgram({...publication, stdoRunEnvironments: []})` becomes an `admitModule` structural refusal; the policy refusal and `:401` stay | the same |
| `t287-declared-testing-capability.test.mjs:141,147,200–207` and `support/declared-testing-capability.mjs:246–247` | read `runEnvironments` and call `validRunEnvironment*` | the support puts a generic declaration under `stdoRunEnvironments`; the lanes are environment-gated and skip here |
| `support/stdo-environment-pilot.mjs:296`, `t287-stdo-run-environment-installed.mjs:364,514` | `stdoRunEnvironments` becomes `runEnvironments` | the same pattern; the installed lane is environment-gated |

The tests named in ruling 6 as off limits contain none of the deleted names,
and neither does `support/candidate-basis.mjs`. None of them needs a change.

## 6. Deviations

1. The package stops before the deletion commit. That follows the stop
   condition in section 7.
2. `StdoEnvironmentRefusalCause` stays. `ObservationFailure` and
   `RunEnvironmentObservation` use it.
3. Three kept functions are retyped off the deleted type:
   `stdoInventoryDigest`, `stdoRoleForDeclaredLeaf` and
   `stdoRecordInventory`. Each new type is structurally equal to the old
   one, but the `.d.ts` text changes. The byte-identical claim covers step 1
   only.
4. The patch changes the Public API. `./gtl` no longer exports
   `isStdoRunEnvironmentDeclaration` or the type
   `StdoRunEnvironmentDeclaration`. `ModulePublication` loses its optional
   `stdoRunEnvironments` member in every `.d.ts` that embeds it.
5. `STDO_ENVIRONMENT_POLICY` keeps two use sites of the one kept refusal:
   `runEnvironmentForProgram` and `selectorRoleFromBoundDeclarations`.
6. The patch also deletes the STDO-only local `companion` schema entries and
   the now-unused `readdir` import.

## 7. Ruling request

The stop condition holds at the Product-resolution door. There,
`admitGraphFunctionCatalog` admits a caller-supplied catalog without a
publication schema. `constructProgramValidationInputFromResolvedClosure` then
raw-admits only the program publication and the lifecycle and source
publications. A dependency publication in the closure is never raw-admitted.
A dependency publication carrying `stdoRunEnvironments` is therefore admitted
on base and with the patch.

The gap does not depend on the member. On base, the same door admits a
dependency publication carrying an arbitrary unknown key (`fooTd31`). Where
the door does raw-admit (the program publication), the patch tightens it to
`invalid_kind`.

Two options:

- **(a)** Read the door ruling as covering the publications that resolution
  actually raw-admits (program, lifecycle, source). Track the
  dependency-publication gap as a separate item. Apply
  `td31-step2-source.patch` with the test edits above, then commit the
  deletion and the new lane.
- **(b)** Widen TD-31 so that resolution raw-admits every closure publication.
  This tightens the door further and needs its own recorded-history pass over
  recorded closures.

## 8. Residuals

- **The dependency-publication gap** at the SDK resolution door, as in
  section 7, if option (a) is chosen.
- **Design text still describes the member:**
  - `design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md:725` describes the
    closed optional member;
  - `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`,
    `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md` and
    `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md` name the owner files.
- **Qualification mirrors pin the three owner files by digest:**
  `test_env/qualification/inventory.json` and
  `test_env/qualification/recipe/verification-recipe.json`. They regenerate
  with qualification.
- **A stale comment:** the comment above `nativeContextLeafFamily` still says
  "Historical STDO roles remain confined to their existing declaration
  profile".
