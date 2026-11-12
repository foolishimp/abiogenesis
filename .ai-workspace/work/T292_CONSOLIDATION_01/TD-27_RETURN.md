# TD-27 Return: the `gate` relation

Writers: Claude Opus 5.5 (census, candidate and stop), then Claude Opus 5.5
(rulings applied, commits, this Return). Branch `claude/td27-retire-gate` from
local `main` at `b13bdd5c2`, worktree `/private/tmp/abg-td27`. T is
`build_tenants/abiogenesis/typescript`. Change class: requirement_reprice
(`REQ-L-GTL3-HOF-003` deleted), then realization_refactor. No push, no tag,
no merge.

**Status: DONE. The retirement is committed on `claude/td27-retire-gate` in
the order of the rules: specification, design, code, tests, and this Return
last. The Executive's rulings on the stop are applied.** `catalog.admit`
refuses a recorded readiness basis that carries a gate application. That is
the intended door behaviour (ruling 1). `w2-steel-single-start-closure` case 7
now re-derives its recorded Catalog through the Product's Catalog owner, as
the historical declaration proof does. It keeps every later claim, and it
asserts that refusal on the real recorded input. It passes on the final build
(ruling 2, realization (i)).

The source under `code/src` is byte-for-byte the stopped candidate's: the
`git diff` of `code/src` before any edit and `git diff 996c2261c HEAD` of
`code/src` both hash to `sha256:5697d882b40a8c02209c047ca6e552c89879b4bb7a2d86d5db74c706f324cc6e`.

Generated files are not committed (ruling 6). The Executive restages the
qualification mirrors, rebuilds and commits the generated files at merge.
`git merge-tree --write-tree main 4c6a621b3` merges without conflict (tree
`0675a6734`).

## Executive rulings and how each is realized

| Ruling | Realization | Where |
| --- | --- | --- |
| 1. A recorded pre-retirement readiness basis is not admissible through `catalog.admit`; reading history is unchanged; no historical arm and no second admission path | No source change beyond the candidate. `catalog.admit` over the `steel03-retained-call` basis returns `catalog_validation_refusal` / `raw_admission_refusal` / `invalid_kind`, and the door table states this as intended (section 6). The history read paths are unchanged: the historical declaration proof, replay (section 10) and artifact truth (section 11). | `32c704e14` (code), `4c6a621b3` (assertion) |
| 2. The case keeps its claims on kept behaviour | Realization (i), described below the table. | `4c6a621b3` |
| 3. `PRODUCT.md`, "adaptive declared selection" | The Executive's sentence, verbatim: "Selection at a declared GTL structural selection boundary, or policy, chooses among named admitted compositions from replay-observed facts; the selected identity becomes replay truth and no HoG-local program catalog or ladder owns the choice." Checked against `b13bdd5c2`: the label cell and every word from "from replay-observed facts" to the end of the cell are byte-equal; only the first clause changes. It agrees with `REQ-L-GTL3-SELECTION-BOUNDARY-001` to `-004`: the boundary exposes candidates, and selection (rule execution or policy) chooses. | `64e839596` |
| 4. `REQ-L-GTL3-EVALUATOR` purpose and `-002` | The candidate's reading stands. "gate-visible assessment" becomes "assessment", and "or a gate has passed" leaves `-002`. | `64e839596` |
| 5. The shared module design | Three lines of `M01-gtl-core.yml` change; the other shared-design hits stay or are listed (detail below the table). | `f006c6f64` |
| 6. Specification mirrors (R1) and generated schema (R2) | No generated file is committed. The tracked `contracts/` still carries the gate arm and `HOF-003` (section 8). | none |
| 7. R3, R6, R8 | Not changed here. | none |
| 8. The four gate-bearing inputs that no lane exercises | Unchanged and listed (section 2, last table row). | none |

### Ruling 2, realization (i)

The function call that replaces the admission is
`product.admitGraphFunctionCatalog(supplied.catalog.readinessBasis)`
(`product/catalog.ts:446`, exported through `./product`). It replaces
`product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", …, readinessBasis: supplied.catalog.readinessBasis })`.

What the call establishes:

- The readiness basis's workspace binding agrees with its resolved lock.
- The verified Products equal the lock rows.
- The installed Products equal verified Product truth.
- The Product set.
- The Catalog built from the basis publications. It raw-admits no GTL schema.

It is the call `reconstructHistoricalDeclarationCatalog`
(`product/declaration_closure.ts:53`) makes to re-derive a recorded Catalog.
The case's unchanged `assert.deepEqual(catalog, supplied.catalog)` is the
equality that function then applies.

Every later assertion is unchanged:

- the narrowed view equals the recorded view;
- the five borrowed members and their membership;
- the Program and selected-root closures;
- the refusal with an empty view (`absent`);
- the two dependency refusals (`missing_dependency`).

The proof file the case writes when `ABI5_STEEL03_CLOSURE_PROOF_PATH` is set is byte-identical: the base
case on the base build and the edited case on the final build both write
`sha256:259bf25655c998cf6bebe5d9886cad2ba5f37966b91f8fbdc1659c60d649da20`
(315,889 bytes).

**The refusal assertion.** The case adds it after the dependency refusals and before the proof write.
`product.CatalogOperationPort.admit` over the same recorded basis returns:

- `kind` `catalog_validation_refusal`;
- `validation.code` `invalid_kind`;
- a message matching
  `^\$\/graphFunctions\/12\/template\/applications\/0\/relationKind: Invalid type: .* but received "gate"$`.

It uses the case's evidence gate `steel03-retained-call`. Putting it in this
case keeps the gate catalogue true with no edit:

- the row still names this file, this title and one suite skip;
- `test_env/support/evidence-gates.json` is not changed.

This matters for the merge, because `main` changed that file after
`b13bdd5c2`. On the base build the edited case fails at exactly this assertion
(line 557, actual `graph_function_catalog`), after every kept claim has
passed.

**The realization not taken.** `reconstructHistoricalDeclarationCatalog` itself needs
environment facts supplied by the environment owner. For this input, the
owner's projections `abg.projectAdmittedProductInstallByAdmissionEventRef`
and `abg.projectAdmittedWorkspaceBindingByInvocationRef` return `null` for
the recorded dev.286 artifact-truth rows, on both builds. Fed the raw recorded
rows instead, the function re-derives both the Catalog and the view equal to
the recorded ones on both builds. Raw rows are not owner-supplied facts, so the
case does not use that call. Probes:
`/private/tmp/abg-td27-work/td27b/probe-recorded-catalog.mjs` and
`probe-raw-env.mjs`.

Qualification: no recipe or inventory names `ABI5_STEEL03_CLOSURE_PROOF_PATH`
or the proof file. The test file
`test_env/tests/w2-steel-single-start-closure.test.mjs` is an inventory and
recipe member, and its bytes change (section 8).

### Ruling 5, the shared module design

`build_tenants/common/design/modules/M01-gtl-core.yml`:

- line 53, `gate(target, rule, evaluators)`, is removed;
- line 65, the invariant, drops "gate obligations";
- line 77, the test obligation, drops "inspectable gate declarations".

The three lines go verbatim to
`build_tenants/common/design/history/M01-gtl-core__RETIRED_SECTIONS.md`, and
the YAML carries a pointer comment. Because the file is tenant-neutral
prior-basis evidence, the restated lines cite no tenant code (section 12).

Other hits under `build_tenants/common/design`:

- `module_decomp.md:43` and `M01-gtl-core.yml:25` cite the
  `REQ-L-GTL3-HOF` file, which stays.
- `M03-engine-kernel.yml:100` ("one ABG-owned static gate") and
  `M05-qualification-scenarios.yml:25,38` ("method trace gate") are other senses.
- Nothing names `REQ-L-GTL3-HOF-003`.

The withdrawn Python tenant is listed in section 1 and not edited.

## Commits

| Commit | Step |
| --- | --- |
| `5ea2259fd` | 1-2: census and recorded history (Return skeleton) |
| `996c2261c` | Return: stop at step 2 |
| `64e839596` | 3: specification |
| `f006c6f64` | 4: design (tenant notes and `build_tenants/common/design/modules/M01-gtl-core.yml`) |
| `32c704e14` | 5: code |
| `4c6a621b3` | 6: tests and fixture |
| this commit | Return |

## 1. Census

Whole-word search for `gate`, `gates`, `GateApplication`, `gateApplication`
and `GATE_APPLICATION_SCHEMA`, every hit read for its sense. "Relation" means
the GTL graph application `relationKind: "gate"` or the higher-order form
`gate(target, rule, evaluators)`. Every other hit (release, qualification,
quality, admission, judgment, phase, review, closure, evidence or temporal
property gates, the binder resource gate, and the `admitJson` "gate form") is
another sense and stays.

### Specification (relation sense)

| File | Line | Text | Disposition |
| --- | --- | --- | --- |
| `specification/INTENT.md` | 95 | "composition, substitution, recursion, fan-out, fan-in, gates, promotion, and identity" | list loses "gates" |
| `specification/PRODUCT.md` | 214 | "composition, substitution, recursion, fan-out, fan-in, gates, and promotion" | list loses "gates" |
| `specification/PRODUCT.md` | 299 | `gate` in the graph algebra block | line removed |
| `specification/PRODUCT.md` | 392 | "GTL gates or policy select among named admitted compositions" | the Executive's sentence (ruling 3) |
| `requirements/gtl/REQ-L-GTL3-HOF.md` | 32 | `REQ-L-GTL3-HOF-003` | requirement deleted |
| `requirements/gtl/REQ-L-GTL3-LAWS.md` | 34 | `REQ-L-GTL3-LAWS-010` "fan-out, fan-in, gate, and promote" | list loses "gate" |
| `requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md` | 58 | graph algebra capability group "fan-out, fan-in, gate, promote" | list loses "gate" |
| `requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md` | 57 | `REQ-L-GTL3-CONTRACT-LAW-API-002` core graph algebra list | list loses `gate` |
| `requirements/gtl/REQ-L-GTL3-RULE.md` | 1, 21, 23 | title "Declarative Constraints And Gates"; `REQ-L-GTL3-RULE-003` "`gate(...)` = the graph combinator"; `REQ-L-GTL3-RULE-004` "gate protocol" | title and the two sentences restated |
| `requirements/gtl/REQ-L-GTL3-EVALUATOR.md` | 13, 19 | purpose "gate-visible assessment"; `REQ-L-GTL3-EVALUATOR-002` "or a gate has passed" | read as the relation (ruling 4); restated |

Other-sense hits that stay, by file: `GOALS.md` (31: release, human and
qualification gates), `INTENT.md:196,323`, `PRODUCT.md` (12 more: release,
qualification, scenario and library gates), `REQ-P-SCENARIOS` (4),
`REQ-P-QUAL` (15), `REQ-P-CONSENSUS` (3), `REQ-P-SELF-CONFORMANCE` (3),
`REQ-P-POLICY:17` (merge gates), `REQ-L-GTL3-C-ALGEBRA-003` ("cannot satisfy
a required gate", a judgment check), `REQ-L-GTL3-HOOKS-011` and
`REQ-R-ABG3-TRANSPORT-023` (phase gates), `REQ-R-ABG3-PROJECTION-012`
(forced-review gates), `REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-003` (readiness
gates), `REQ-L-GTL3-REQUIREMENTS-ALGEBRA-007` (conformance gates),
`requirements/gtl/README.md:16` (external tool gates),
`REQ-L-GTL3-HOF-012` (capability gates), `REQ-L-GTL3-TEMPORAL-PROPERTIES`
(8: gate points, `safety_gate`), `REQ-R-ABG3-CCALL` (4: gate-satisfying
judgment, -015 gate invariance), `REQ-R-ABG3-SELFHOSTING` (3),
`REQ-R-ABG3-TUNER-009` (ratification gate), `REQ-R-ABG3-FPC-014` (F_H gate,
a human step), `REQ-R-ABG3-FN-COMP-007` (closure-gate refs),
`REQ-R-ABG3-REQUIREMENTS-ALGEBRA` (2),
`REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH` (2), `requirements/README.md`
(2). `specification/scenarios/` has no hit. No scenario or index names
`REQ-L-GTL3-HOF-003`: `scenarios/TESTCASE_AUTHORITY.md:10-11`,
`scenarios/03-graph-function-algebra.md:8` and `REQ-P-CONSENSUS.md:9` cite
the HOF file, HOF-001 and HOF-009..012 only.

### Kept design notes (`T/design/*.md`, not `history/`)

533 whole-word hits in 52 notes; four notes name the relation:

| Note | Line | Text | Disposition |
| --- | --- | --- | --- |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 123 | `GraphFunctionApplication` row: "composition, substitution, recursion, fan-out, fan-in, gate, promote, identity, or same-object identity" | restated |
| same | 410 | `gate` row of the graph algebra projection table | cut |
| same | 416-417 | "Recursion, fan-out, fan-in, and gate retain explicit runtime-visible application declarations because they govern child traversal or admission." | restated |
| same | 1068 | `traversal_route_admitted` row: "… fan-out completion, gate result, retry progress …" in the causal basis | restated |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | 37 | "Existing gate applications bind evaluators to one workflow target; they do not route alternative callees." | cut |
| same | 180 | "ConstructionComposition, Gate and C terms retain meaning." | restated |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 147-149 | "… the declared `gate` application is not used." | restated |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md` | 115 | graph domain list with `gate`; "gates/promotion cannot widen authority" | restated |

`ABI5_REALIZATION_CONSTITUTION.md`: 9 hits, none names the relation (lines
436, 2320, 2364, 2413, 2535, 2746, 2749, 3046, 3228: approval, per-API,
implementation and C3/C4 gates). Not edited.
`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:353` ("no fabricated gate
pass") is a judgment check; `T287_D4_SELF_CONFORMANCE_DESIGN.md:151,187`
("same-basis gate result") is the self-conformance gate;
`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:1570` names
`gateGovernedContextExecution`; `ABI5_STDO3_COMPUTATIONAL_BINDING.md:187`
names the test files `t287-malformed-gtl-gate`, `t287-native-runtime-gate`
and `t287-native-structural-gates`. All stay.

### Shared design (`build_tenants/common/design`, ruling 5)

| File | Line | Text | Disposition |
| --- | --- | --- | --- |
| `modules/M01-gtl-core.yml` | 53 | `gate(target, rule, evaluators)` in `interfaces` | removed |
| same | 65 | invariant "… recursion termination, gate obligations, and governance hook attachment remain inspectable on GTL declarations" | restated without "gate obligations" |
| same | 77 | test obligation "… explicit `over` boundaries, inspectable gate declarations, and no hidden strategy in GTL core" | restated without "inspectable gate declarations" |
| same | 25; `module_decomp.md:43` | `REQ-L-GTL3-HOF` (the file) | stays |
| `modules/M03-engine-kernel.yml` | 100 | "one ABG-owned static gate" | other sense; stays |
| `modules/M05-qualification-scenarios.yml` | 25, 38 | "method trace gate(s)" | other sense; stays |

### Source (`T/code/src`)

| File | Lines | Declaration or site | Kind |
| --- | --- | --- | --- |
| `gtl/serialization_contracts.ts` | 119-121 | `GATE_APPLICATION_SCHEMA` | declaration |
| same | 136 | the arm in `GRAPH_APPLICATION_SCHEMA` (`v.variant("relationKind", …)`) | union member; emitted into `contracts/schemas/gtl-serialization.schema.json` |
| `gtl/contracts.ts` | 33 | `interface GateApplication` | declaration |
| same | 51 | `GateApplication` in `GraphFunctionApplication` | union member |
| `gtl/graph_applications.ts` | 12, 219-229 | `GateApplication` import; `gateApplication` constructor | declaration |
| `gtl/index.ts` | 103, 136 | barrel exports `gateApplication`, `GateApplication` | export |
| `gtl/declaration_references.ts` | 111-115 | `case "gate"` of `projectGraphFunctionApplicationDeclarationReferences` | switch arm |
| `validator/validation.ts` | 405-411 | `case "gate"` of `hasExactApplicationShape` | switch arm |
| same | 1197-1211 | published Rule and Evaluator check for a gate | validator law |
| same | 1241-1294 | attached evaluator loci and single workflow target law | validator law |
| same | 1364-1365 | the gate disjunct of the outer-interface check | validator law |

Callers: `gateApplication` has no source caller; tests and the fixture reach
it through the `./gtl` export. `GateApplication` is named by `contracts.ts`,
`graph_applications.ts` and the barrel. No file is deleted. Every helper the
removed law uses (`cLeafTerms`, `isExecutableCLeaf`,
`compareUnicodeCodeUnits`, `projectCProgramNodeDeclarationReferences`,
`canonicalEquals`, `requireRefs`, `publishedRuleRefs`) keeps other callers.

`abg/construction_continuation.ts` names no application arm (no whole-word
`gate`): since TD-47 (`6cc33e60a`) it uses `GraphFunction` from
`gtl/contracts.ts` (`:347`, `:459`, `:1071-1080`), so the arm leaves it
through the type. `abg/` and `hog/` have no relation site; runtime relation
dispatch covers `recurse`, `fan_out`, `fan_in` and `re_enter`. The emitted
`.d.ts` files that inline the union (`gtl/serialization.d.ts`,
`gtl/default_library.d.ts`, `validator/conformance_operation.d.ts`,
`gtl/worksite_command_forward.d.ts`, `abg/qualification_proof.d.ts`) follow
the source: the base build has the `"gate"` literal in 10 emitted files, the
final build in none.

### Scripts and package metadata

`T/scripts`: no hit. `T/package.json:127` names the test files
`t287-native-structural-gates` and `t287-native-runtime-gate` (qualification
gates); no relation.

### Tests, support and fixtures (`T/test_env`, without `test_runs`, `downstream`, `evidence`)

| File | Site | Use |
| --- | --- | --- |
| `fixtures/language-structural/program.mjs` | `GATE_IDS` (16), `contractKinds` entry (27), `LEAF_SPECS.gate`, `LEAF_SPECS.gateTarget` (37-38), `'gate'` in the default case list (49), the gate case (92-97) | producer: builds and publishes a gate Program |
| `fixtures/language-structural/leaf.mjs` | `GATE_IDS` import (2), `GATE_DESCRIPTOR`, `GATE_TARGET_DESCRIPTOR` (4), leaves `gate`, `gateTarget` (11-12), the `data_input -> data_input` arm of `relation` (only the gate leaf has that shape) | producer support |
| `tests/t287-gtl-serialization-publication.test.mjs` | `:373` static `{relationKind:'gate',…}` variant | static producer |
| `tests/m5-c-algebra-validation.test.mjs` | `:468-628` constructs every relation (`gateApplication` at `:511`; list and count at `:552-567`); `:825-909` the gate-law test | constructor and validator law |
| `tests/t287-static-declaration-closure.test.mjs` | `:162-181` uses the gate application as the vehicle for a private-source closure refusal; `:183-197` loops over `GATE_IDS` among four owner-row cases | vehicle and one case |
| `tests/m5-installed-graph-edge.test.mjs` | `:69` source anchor equal to the default case list | names the case list |
| `tests/a5-f02-canonical-gtl-identity.test.mjs` | `reverseInventory(value, "evaluators")`, `(…, "rules")` (`:316-317`) need two entries; the gate and recursion cases supplied them | counts the cases' declarations |
| `tests/w2-steel-single-start-closure.test.mjs` | `:511` (at `b13bdd5c2`) `catalog.admit` over a recorded dev.286 readiness basis that carries `hello-gate@5` | recorded-input vehicle (section 2; ruling 2) |

Other installers and validators of the fixture Program, none of which starts
the gate Program: `m5-event-calculus-runtime`,
`t287-single-address-space-consolidation`,
`t287-f04a-probabilistic-result-candidate`, `t287-calculus-state-transfer`,
`t287-r6-retry-success-exit`, `t287-gtl-graph-law`,
`t287-native-structural-gates`; support `language-structural-fixture.mjs`,
`language-structural-gtl.mjs`, `native-runtime-structural-cases.mjs`.
`hello-product-boundary.test.mjs:13` lists `GATE_HELLO` among removed
identifiers it forbids; it stays.

### The withdrawn Python tenant (listed, not edited; ruling 5)

`build_tenants/abiogenesis/python` has its own register entry. Relation-sense
hits:

| File | Lines | Site |
| --- | --- | --- |
| `code/gtl/algebra.py` | 446-478 | the `gate()` constructor (declaration `"gate": {rule, evaluators}`); `:4` cites `REQ-L-GTL3-HOF` |
| `code/gtl/__init__.py` | 10 | exports `gate` |
| `code/gtl_spec/packages/abiogenesis.py` | 82 | `Rule(name="standard_gate", kind="gate")`; `:426` cites `REQ-L-GTL3-HOF` |
| `code/gtl_spec/packages/project_package.py` | 76 | `Rule(name="standard_gate", kind="gate")` |
| `code/gtl_spec/GTL_BOOTLOADER.md` | 102 | `gate` in the algebra list |
| `design/GTL_ABG_LLM_GUIDE_DOMAIN_WORKFLOWS.md` | 42, 263 | `gate` in the algebra lists |
| `design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md` | 139 | `requirements_gate = gate(` |
| `design/GTL_3_MODULE_DESIGN.md` | 35 | cites `REQ-L-GTL3-HOF` (the file) |
| `test_env/test_install/CLAUDE.md` | 84 | `gate` in a list |
| `test_env/test_surface_map.md` | 49, 141 | cite `REQ-L-GTL3-HOF` (the file) |
| `test_env/tests/test_m01_gtl_core_integration.py` | 16, 38, 447, 723, 738-739 | imports and builds a gate; a `kind="gate"` Rule |
| `test_env/tests/test_usecases_u1_u4.py` | 4, 14, 23, 328 | U4 "fan_out -> promote -> fan_in -> gate" topology |

The other 27 whole-word hits in that tenant are other senses (F_H, F_P and
coverage gates, CLI exit, ADR-035, the GSDLC ladder, `README.md:62`,
`test_env/README.md:4`, `test_m03_engine_kernel_integration.py:2748`, the
`gen-start.md` plugin command).

## 2. Recorded history

Pattern, as a JSON member value in both spacing forms and the single-escaped
form, for the current discriminator and the older `operatorKind`:

```text
\\?"(relationKind|operatorKind)\\?"\s*:\s*\\?"gate\\?"
```

`rg -uuu` (no ignore files, hidden and binary files searched), no size cap.

| Store | Files searched | Bytes searched | Files with a hit |
| --- | ---: | ---: | ---: |
| `*.json`, `*.jsonl`, `*.ndjson` under the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace` | 242,367 | 159,795,737,164 | 1,713 (8,380 matches) |
| every file under `T/test_env/proof` (worktree and main checkout) | 4 + 4 | 511,117 each | 0 |
| every file under `T/test_env/fixtures` (worktree and main checkout) | 93 + 93 | 2,543,286 each | 0 |
| every file under the main checkout's `T/test_env/test_runs` and `T/test_env/uat/runs` | 1,332,834 | 57,864,557,094 | 97 |

Classification (a parser walks every matching JSON or JSONL file, JSON
nested in strings included, and reads each gate object's `targetRef`; 1,666
of the 1,713 evidence-root files parse to at least one object, the other 47
hold the value escaped twice or more):

- 8,130 of 8,192 parsed gate objects are `hello-gate-target@5`, the
  `program://abiogenesis/conformance/hello-gate@5` conformance Program that
  the shipped conformance module carried in the `5.0.0-dev.286` and
  `5.0.0-rc.1` builds (`c803dd65f` "feat(t270): traverse declared gate";
  the module left the source in `0b1187c40`). 62 are the language-structural
  fixture's `abi5-tests/structural/gate/target@5`, in 13 test-output files
  under `work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-installed-graph-law-proof-81`
  (12) and `work/T287_COMMON_LIBRARY_DELIVERY_01/realization/hog-final06-binding-01` (1).
- By product version named in the file: 894 files name `5.0.0-dev.286`,
  818 name `5.0.0-rc.1`, 1 names none. No file names a later build.
- 12 files are event logs whose events carry a gate object, inside
  `basis_admitted` (12) and `c_call_result_admitted` (8) payloads:
  10 from `5.0.0-dev.286` (`20260921_TRUSTED_DESKTOP_STEEL_THREAD` 8,
  `20260922_QUALIFICATION_CONTRACTION` 1, `20260922_AF22_PROOF_REUSE` 1) and
  2 from `5.0.0-rc.1` (`20260928_FRAMED_GOVERNANCE/final-f11-native-assessment-execution-01/final-native-prefix.jsonl`,
  `final-native-setup-03/resources/events/runtime.events.jsonl`). The base
  build refuses every one of the 12 at decode: "event stamp differs from the
  exact native profile schedule". The final build refuses them with the same
  message (section 10). They are recorded development logs from builds that
  carried the relation; no log that decodes today carries a gate.
- The 97 `test_runs` hits are all `hello-gate-target@5` from
  `5.0.0-dev.286`, under `test_runs/steel-single-start` (74) and
  `test_runs/steel-serial-branch` (23), dated September.
- "No shipped publication carries a gate" holds at head: the ten shipped
  publication constructors (`scripts/generate-product-manifest.mjs:1203-1214`)
  build no gate, and `T/contracts` carries the relation only in the schema
  arm. It did not hold for `dev.286` and `rc.1`.

Recorded inputs that lanes read through `support/evidence-gates.json` and that
carry a gate object (the catalogue's input paths intersected with the hit
list), with the lane cases that read them:

| Evidence gate | Input carrying a gate | Lane cases |
| --- | --- | --- |
| `d2-continuation-09-ready`, `-store`, `-store-cross-cut-reads`, `-store-late-child-proof`, `-store-borrowed-ancestry` | `20260911_D2_BOUNDED_REPAIR/.../program-ready-16.json` | `integration-shared-seams` (1), `t287-cross-cut-public-read` (4), `t287-historical-source-resource` (3) |
| `r10-child-proof-d2-s01` | the same, and `20260911_D4_S01_PROGRAM_OWNER/.../call-9.jsonl` | `r10-child-proof` (1) |
| `s7-pending-consumer-intent` | `20260928_FRAMED_GOVERNANCE/.../continue-call.json` | `t287-continuation-causation` (1) |
| `owned-proof-declaration` | `20260921_TRUSTED_DESKTOP_STEEL_THREAD/.../atomic_call-assessment-input.json` | `t287-native-runtime-gate` (1) |
| `producer-acquisition-reuse` | `20260923_RC1_QUALIFICATION_RECIPE/.../retained-source-context.json` | `t287-qualification-producer-acquisition-reuse` (1) |
| `steel03-retained-call` | `20260911_D4_S01_PROGRAM_OWNER/implementation-01/evidence/borrowed-five-call-11.jsonl` | `w2-steel-single-start-closure` (1) |
| `stdo-proof-entry-run-nine` | `20260915_ABG5_RC7_TASK_1B/.../call-9.jsonl` | `t287-stdo-proof-entry` (3) |
| `steel02-resolver-proof`, `f11-carrier-full-fixture`, `f11-fp-assessment-packet`, `qual-raw-contract-preimage` | marked `failing_with_input_present`; each needs variables that are unset | their cases skip on both builds (section 9): not exercised; unchanged under ruling 8, their lanes are another package's |

**Stop check (step 2), as ruled.** The earlier Writer stopped here. One case
on kept behaviour, `w2-steel-single-start-closure` "consumer callable
membership resolves exact borrowed owners without contributor membership
rewriting", passed at `b13bdd5c2` and failed on the candidate. It re-admitted
through `catalog.admit` the recorded readiness basis of evidence gate
`steel03-retained-call`.

The input carries the gate:

- `comments/codex/20260911_D4_S01_PROGRAM_OWNER/implementation-01/evidence/borrowed-five-call-11.jsonl`,
  `sha256:3cd8961c3f8a95eaded5b0e9e805b41cef16c58a8098b585166bbe1610eed3dd`,
  19,478,678 bytes.
- Its
  `invocation.resources.declarationCatalog.catalog.readinessBasis.publications[4]`
  is the shipped `module://abiogenesis/conformance/hello-world@5` publication
  of `product://abiogenesis/typescript-tenant@5.0.0-dev.286`.
- `graphFunctions[12]` of that publication is
  `graph-function://abiogenesis/conformance/hello-gate@5`, and its
  `template.applications[0]` has `relationKind: "gate"`.

The Executive ruled that this is the intended door behaviour, not a stop
(ruling 1):

- `catalog.admit` admits a new Catalog under the current language, so a recorded
  basis that carries a gate application is the retired shape arriving at an
  admission door. The fourth stop condition excepts that refusal.
- Reading recorded history takes other paths, and the retirement does not
  change them. The historical declaration proof re-derives the 22 gate-bearing
  recorded Catalog and publication rows of seven recorded inputs equal on both
  builds with `admitGraphFunctionCatalog` and `canonicalEquals`
  (`/private/tmp/abg-td27-work/canon/probe.mjs`). Replay and artifact truth are
  identical (sections 10 and 11).

The case now takes the history path for its Catalog and asserts the refusal
(ruling 2). It passes on the final build.

The step-2 condition does not hold for the committed set:

- No store or log that the kept feature set produces needs the retired code to
  reopen, replay or read.
- Every lane case on kept behaviour gives the same result on base and final
  builds (section 9).

## 3. Specification edits (`64e839596`)

Requirement deleted: `REQ-L-GTL3-HOF-003` ("`gate(target, *, rule,
evaluators)` shall block or allow continuation over an explicit boundary
without choosing a candidate or inventing domain pass/fail semantics."). The
other HOF identifiers are unchanged; the file now runs HOF-001, -002, -004 …
-012. No kept requirement depends on the relation: each kept sentence that
named it listed it beside other relations or as one side of a split, and
reads complete without it.

| File | Before | After |
| --- | --- | --- |
| `INTENT.md:95` | "fan-in, gates, promotion, and identity" | "fan-in, promotion, and identity" |
| `PRODUCT.md:214` | "fan-in, gates, and promotion" | "fan-in, and promotion" |
| `PRODUCT.md:299` | `gate` line in the graph algebra block | removed |
| `PRODUCT.md:391` (392 at base) | "GTL gates or policy select among named admitted compositions from replay-observed facts; …" | "Selection at a declared GTL structural selection boundary, or policy, chooses among named admitted compositions from replay-observed facts; …" (ruling 3; the rest of the row is unchanged) |
| `REQ-L-GTL3-LAWS-010` | "fan-out, fan-in, gate, and promote preserve interface and type truth" | "fan-out, fan-in, and promote …" |
| `REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL` graph algebra group | "fan-out, fan-in, gate, promote, and same-object identity" | "fan-out, fan-in, promote, and same-object identity" |
| `REQ-L-GTL3-CONTRACT-LAW-API-002` | "`fan_in`, `gate`, `promote`, …" | "`fan_in`, `promote`, …" |
| `REQ-L-GTL3-RULE` title | "Declarative Constraints And Gates" | "Declarative Constraints" |
| `REQ-L-GTL3-RULE-003` | "`Rule` = what must hold, `Evaluator` = what checks or attests convergence, `gate(...)` = the graph combinator that blocks or allows continuation." | "`Rule` = what must hold, `Evaluator` = what checks or attests convergence." |
| `REQ-L-GTL3-RULE-004` | "parameters for gate protocol, aggregation, ordering, or threshold concerns" | "parameters for aggregation, ordering, or threshold concerns" |
| `REQ-L-GTL3-EVALUATOR` purpose | "convergence, attestation, and gate-visible assessment" | "convergence, attestation, and assessment" (ruling 4) |
| `REQ-L-GTL3-EVALUATOR-002` | "… an output has converged, or a gate has passed." | "… or an output has converged." (ruling 4) |

`git diff --numstat b13bdd5c2` over `specification`: +11 −14 in 8 files.

## 4. Design changes (`f006c6f64`)

Cuts and replaced text go verbatim to a history file. Each file's header names
the note, commit `b13bdd5c2` and the line ranges. Each kept note gains one
pointer line; M05 already had one.

| Note | Lines at `b13bdd5c2` | Change | Retired file |
| --- | --- | --- | --- |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 123 | row restated: "composition, substitution, recursion, fan-out, fan-in, registered selection, re-entry, promotion, identity, or same-object identity (`gtl/contracts.ts`, `GraphFunctionApplication`; `gtl/serialization_contracts.ts`, `GRAPH_APPLICATION_SCHEMA`)" | appended to the existing `M05_…__RETIRED_SECTIONS.md` |
| same | 410 | `gate` row cut | same |
| same | 416-417 | restated: recursion, fan-out, fan-in and re-entry stay runtime-visible; HoG reads them in `recursionApplication`, `fanOutApplicationForBatch`, `proposeGraphSpanReentryRoute`, ABG admits their routes in `recursionRouteCausation`, `hasFanOutRouteEvidence`, `hasGraphSpanReentryRouteEvidence` | same |
| same | 1068 | "gate result" leaves the `traversal_route_admitted` causal basis; cites `abg/traversal_route.ts` `admitTraversalTransition` | same |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | 37 | row cut | new `T287_REGISTERED_GRAPH_SELECTION_DESIGN__RETIRED_SECTIONS.md` |
| same | 180 | "ConstructionComposition and C terms retain meaning; the registered-selection check is one more application arm of `validateProgramSubject` in `validator/validation.ts`." | same |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 147-149 | "… no application … is added: the library publication carries only its `registered_selection` and `recurse` applications (`gtl/default_library.ts`, `constructDefaultGovernanceLibraryModulePublication`)." | new `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN__RETIRED_SECTIONS.md` |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md` | 115 | "The graph domain is `edge` and the applications `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `registered_selection`, `re_enter`, `promote`, `identity` and `same_object` (`gtl/serialization_contracts.ts`, `GRAPH_APPLICATION_SCHEMA`) …; promotion cannot widen authority" | new `ABI5_STDO3_COMPUTATIONAL_BINDING__RETIRED_SECTIONS.md` |
| `build_tenants/common/design/modules/M01-gtl-core.yml` (ruling 5) | 53, 65, 77 | line 53 removed; lines 65 and 77 restated without "gate obligations" and "inspectable gate declarations"; a pointer comment `# Retired sections: ../history/M01-gtl-core__RETIRED_SECTIONS.md` | new `build_tenants/common/design/history/M01-gtl-core__RETIRED_SECTIONS.md` |

`T/design/history/README.md` lists the three new tenant files under "Retired
sections:" in order. No note moves. `ABI5_REALIZATION_CONSTITUTION.md` is not
edited (no relation-sense passage).

`git diff --numstat b13bdd5c2`:

- `T/design`: +50 −10. Of that, +29 are under `design/history/`: 26 in the
  retired-section files and 3 README entries.
- `build_tenants/common/design`: +10 −3. Of that, +7 is the new history file.

## 5. Source lines removed (`32c704e14`)

| File | Removed | Added |
| --- | ---: | ---: |
| `gtl/serialization_contracts.ts` | 4 | 1 |
| `gtl/contracts.ts` | 3 | 0 |
| `gtl/graph_applications.ts` | 13 | 0 |
| `gtl/index.ts` | 2 | 0 |
| `gtl/declaration_references.ts` | 5 | 0 |
| `validator/validation.ts` | 77 | 0 |
| **total** | **104** | **1** |

The removal is compiler-first:

- Removing `GATE_APPLICATION_SCHEMA` and its arm gives errors at
  `gtl/contracts.ts:33`.
- Removing `GateApplication` gives errors at exactly the census sites:
  `declaration_references.ts:111`, `graph_applications.ts:12`,
  `index.ts:136` and `validation.ts:405, 1198, 1241, 1364`.

No stub, wrapper or dead branch remains. `hasExactApplicationShape` and
`projectGraphFunctionApplicationDeclarationReferences` have no default arm.
No admitted value reaches them with another kind, because every door parses
the application union first (section 6).

The committed `code/src` equals the stopped candidate's: `git diff 996c2261c
HEAD -- build_tenants/abiogenesis/typescript/code/src` hashes to
`sha256:5697d882…`. That is the same hash as the `code/src` part of
`/private/tmp/abg-td27-work/td27-candidate.patch`, taken from the worktree
before any edit of this round.

## 6. Door table

Subject: a publication or GraphFunction whose application has `relationKind:
"gate"`. Two values are used:

- "Recorded" is the fixture publication built by the base fixture (gate case
  included) and saved as JSON.
- "Hand-written" is the shipped Consensus publication with one gate
  application added to its first GraphFunction.

Probe: `/private/tmp/abg-td27-work/door/doors.mjs`. The run door is exercised
by the new case in `t292-td34a-run-invocation-schema-owner`. Its base column
comes from a scratch copy of that case run against the base build.

| Door | Base | Final |
| --- | --- | --- |
| `./gtl/m01` `admitGraphFunction` | `raw_admitted_value` | `raw_admission_refusal` / `invalid_kind`, "`$/template/applications/0/relationKind`: Invalid type: Expected ("compose" \| … \| "same_object") but received "gate"" |
| `./gtl/m02` `admitModule`; `./validator` `rawAdmitValue(…, "module_publication")` | `raw_admitted_value` | `raw_admission_refusal` / `invalid_kind` at `$/graphFunctions/N/template/applications/0/relationKind` |
| `validatePublication` | `publication_validation` | not reached: raw admission refuses |
| Catalog admission, `product.CatalogOperationPort.admit` (`catalog_admit_packet`) | passes raw admission and publication validation, reaches readiness | `catalog_validation_refusal` with `raw_admission_refusal` / `invalid_kind` |
| `conformance.evaluate` `gtl_program` | recorded: `gtl_program_conformance_result`; hand-written: refused by the gate law (`invalid_application`) | `gtl_program_conformance_refusal` / `raw_admission_refused` (`invalid_kind`) |
| Product resolution, `constructProgramValidationInputFromResolvedClosure` | recorded: `program_validation`; hand-written: `static_validation_refusal` (gate law) | `raw_admission_refusal` / `invalid_kind` |
| Run door, `runInstalledDefinitionCallWithResource` on a caller-supplied Catalog: gate in a publication, a Catalog entry, a view entry | `owner:invalid_program` (the door admits; the run owner refuses the unadmitted setup); `isRunInvocationResourceAssertion` true | `resource_admission:invalid_resource_assertion`; `isRunInvocationResourceAssertion` false; the binder resource gate runs once per case |
| Catalog admission of a recorded pre-retirement readiness basis (`steel03-retained-call`; `publications[4]` is the dev.286 `hello-world@5` with `hello-gate@5`) | `graph_function_catalog`, equal to the recorded Catalog | `catalog_validation_refusal` / `raw_admission_refusal` / `invalid_kind` at `$/graphFunctions/12/template/applications/0/relationKind`. Intended behaviour (ruling 1): the retired shape refused at the admission door for a real recorded input. Asserted in `w2-steel-single-start-closure` case 7. |
| Control: the fixture publication without the gate case | admitted at every door | admitted at every door |

No new refusal code or message: every refusal is the owner schema's existing
`invalid_kind` or the binder's existing `invalid_resource_assertion`.

Paths that take a gate-bearing value on both builds:

- **History reads.** The historical declaration proof (`project.read`
  `graph_call_*` `declarationProof`, `reconstructHistoricalDeclarationCatalog`)
  re-derives the recorded Catalog with `admitGraphFunctionCatalog` from its
  readiness basis and compares it with the supplied one.
  - It parses no GTL schema.
  - It accepts only the exact recorded Catalog its root basis names, so it
    reads history and admits no new gate shape.
  - The recorded gate-bearing Catalogs re-derive identically on both builds
    through it.
  - `w2-steel-single-start-closure` case 7 now uses the same call for its
    recorded Catalog.
- **Builders that admit no schema.** Both are exported through `./product`:
  - `product.buildGraphFunctionCatalog` takes typed `ModulePublication` values
    and admits nothing. It builds a catalog from a gate-bearing publication on
    both builds, and equally from an invented `relationKind` with an extraneous
    key.
  - `product.admitGraphFunctionCatalog`, called directly, establishes the
    readiness facts and builds the Catalog without raw-admitting the basis
    publications.

  This is existing builder behaviour, not the relation's. The Executive records
  it in the register (R3, ruling 7).

## 7. Tests and fixtures (`4c6a621b3`)

| File | Change | Reason |
| --- | --- | --- |
| `fixtures/language-structural/program.mjs` | `GATE_IDS`, its `contractKinds` entry, `LEAF_SPECS.gate`/`gateTarget`, the gate case and `'gate'` in the default case list removed; 11 other cases unchanged | the fixture's gate Program was the only producer |
| `fixtures/language-structural/leaf.mjs` | `GATE_IDS` import, the two descriptors, leaves `gate`/`gateTarget`, and the `data_input -> data_input` relation arm removed | no leaf has that shape any more |
| `t287-gtl-serialization-publication` | the gate variant leaves "all application variants" | static producer |
| `m5-c-algebra-validation` | "constructs all ten graph relations" becomes "nine" (gate constructor, list entry and count 9 → 8); "binds gate law to published Rule and Evaluator declarations" deleted; its widened-Evaluator check (an added `runtimeAuthority` fails raw admission, `invalid_kind`, `/runtimeAuthority/`) moves verbatim into the recursion-law test, the only other place that proves the Evaluator record is closed | the deleted test's subject is the gate law |
| `t287-static-declaration-closure` | "runtime use of a private static source refuses …" uses the recursion GraphFunction's `recurse` application as its vehicle (retargeted with `graphFunctionRef`); "existing named workflow, recursion and fan-out owner rows remain required" drops `GATE_IDS` | vehicle; the claim on kept closure law stands. `product/declaration_closure.ts:710` sends every application kind other than compose and substitute down the Catalog-row path, as it sent gate |
| `m5-installed-graph-edge` | its anchor on the default case list follows the fixture | names the case list |
| `a5-f02-canonical-gtl-identity` | `addSecondaryEvaluatorAndRule` adds one Evaluator and one Rule declaration to `richAuthoredCarriers` and `validRichPublication` | the fixture now declares one of each; the inventory-permutation claims need two |
| `t292-td34a-run-invocation-schema-owner` | new case "a gate graph application is refused at raw admission, at Catalog admission and at the run door"; header gains one sentence; loads `validator/index` | the refusal lane (section 6) |
| `w2-steel-single-start-closure` | case 7: `product.admitGraphFunctionCatalog(supplied.catalog.readinessBasis)` replaces the `catalog.admit` call, with a two-line comment; every later assertion unchanged; after the dependency refusals the case asserts that `catalog.admit` over the same basis is refused (`catalog_validation_refusal`, `invalid_kind`, the gate application's path); +13 −2 | ruling 2 (i): the claim that a fresh admission of the dev.286 basis reproduces the recorded Catalog goes; the claims on kept behaviour stay; the refusal on a real recorded input is the second refusal site |

No test file, support module or fixture file is deleted, and
`support/evidence-gates.json` is not changed. Before deletion, the gate-law
test also asserted the missing Rule, detached locus and divergent target
refusals. All three are gate law and leave with it. No assertion on kept
behaviour is weakened.

`git diff --numstat b13bdd5c2` over `test_env`: +91 −120.

## 8. Generated contracts and identity

Generated files are not committed (ruling 6). After the final build I restored
`contracts`, `product-toolchain-manifest.json` and
`test_env/fixtures/abi5-root-candidate-basis.json`. The final build's
generated outputs are byte-identical to the stopped candidate's build
(`diff -rq` of `contracts`, `cmp` of the manifest): the edits of this round
touch no build input of the ordinary build.

| Digest | Base `b13bdd5c2` | Final (ordinary build of `4c6a621b3`'s tree) | Final with authorities restaged (scratch, earlier run) |
| --- | --- | --- | --- |
| `productContentDigest` | `sha256:b3b89acc1adcbbef1e5b04e3f0669382cc257d1450fd432c588ed0797d4b54f4` | `sha256:b08db7313bc31b434544eda71819032774d898cf0a523111d93a9423a3361636` | `sha256:86e7984abe764cfadc538e358af8954e5710af59cf370dca058150c1c92f5e8d` |
| `contributionManifestDigest` | `sha256:b3e65b46088b250900e1ffea76ad58a984ef8a525ab106ed95b6dd2297c5f5bc` | `sha256:5679388aec5eee374fd3ce0ca283d8ff4c390988d663f306d47bead1a2602aaf` | `sha256:844af4498f16bdea53259467e7b566f887bba4b6954e45ec5b5310a428f74f8b` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | `sha256:afd71b717a36bd6c585a6728adabab3d22376041e9d31b889891eeabdda3fedf` | `sha256:eea70f69d6699c5846bf179aed85786b452ec13268ed9c97ad44bb536227acc6` |
| capability graph `graphDigest` | `sha256:8a7486def91432c08f3763e4c10d08fdc30e7276de50ed3a96ee28671e51277e` | `sha256:648502cba70d0db3bfec3194acf0b38c721a04d06e4b01b22a3683f183d96a6b` | `sha256:5c57d5a8cf775b2d277187c19b46fceea65a1f54abe5975768ad7a042767bf75` |

The restaged column was measured on the candidate before ruling 3. Restaging
at merge also mirrors the final `PRODUCT.md` row, so the Executive's restaged
digests differ from that column in the `PRODUCT` mirror and everything derived
from it.

Content changes under `T/contracts` (ordinary build):

| File | Content change |
| --- | --- |
| `schemas/gtl-serialization.schema.json` | the gate arm leaves the application `oneOf` (11 → 10) at its four sites: `GraphFunction`, `ModulePublication`, `GtlProgramConformanceInput` and `GtlLanguageConformanceCorpus` |
| `conformance/gtl-language-conformance-corpus.json` | only `schema.contentDigest` (the schema above) |
| `capabilities/capability-definition-graph.json` | digests and refs only (551 changes); same rows |
| `product-toolchain-manifest.json` | digests and digest-derived refs only; 75 public contract rows with the same ids; 10 publication bindings with new `publicationDigest`; 5,327 locators, same list |

The ordinary build does not restage the specification mirrors under
`contracts/qualification/`. `scripts/generate-qualification-rule-catalog.mjs`
stages them only with `--stage-authorities`, "an explicit source-build
action". Until the Executive restages them at merge (ruling 6), the tracked
mirrors carry the base specification text. A search of the tracked
`T/contracts` finds:

- `HOF-003` in `qualification/rule-catalog.json` and
  `qualification/sources/REQ-L-GTL3-HOF.md`;
- the gate arm in `schemas/gtl-serialization.schema.json`.

The earlier Writer restaged and rebuilt in a scratch copy, with the same
command (`--stage-authorities ../../.. "<STDO v3.0.4 release>"`), before
ruling 3. That restaging changes:

- `authority-inputs.json`;
- `law-basis.json`: 19 fields (sources' digests and byte counts, the catalog
  digest, its own ref and digest);
- `coverage.json`: the catalog and law-basis digests, and one authority source;
- `rule-catalog.json`;
- eight mirrors: `INTENT`, `PRODUCT`, `REQ-L-GTL3-CONTRACT-LAW-API`,
  `-EVALUATOR`, `-HOF`, `-LANGUAGE-CAPABILITY-MODEL`, `-LAWS`, `-RULE`.

The rule catalog goes from 2,116 to 2,115 rows, because the HOF-003 row leaves:

- The rows of HOF-004 … HOF-012 and of the RULE title get new `ruleRef`s: 10
  new and 10 gone besides HOF-003. A `ruleRef` is derived from its byte span,
  which moves. The requirement identifiers do not change.
- 203 other rows keep their `ruleRef` and change only `sourceDigest` and
  offsets.

On that restaged build, `t287-qualification-law` (11 tests: 7 pass, 4 skip)
and `t287-qualification-scopes` (24 of 24 pass) give the same results as on
base and on the ordinary build.

Qualification mirrors (not edited). Members of
`test_env/qualification/inventory.json` and the verification recipe that this
change set changes:

- `code/src/gtl/contracts.ts`, `declaration_references.ts`,
  `graph_applications.ts`, `index.ts`, `serialization_contracts.ts`;
- `code/src/validator/validation.ts`;
- `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`,
  `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`,
  `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`,
  `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md`;
- `test_env/fixtures/language-structural/leaf.mjs`, `program.mjs`;
- `test_env/tests/a5-f02-canonical-gtl-identity`, `m5-c-algebra-validation`,
  `m5-installed-graph-edge`, `t287-gtl-serialization-publication`,
  `t287-static-declaration-closure` and `w2-steel-single-start-closure`.

Changed files that neither lists:

- `t292-td34a-run-invocation-schema-owner.test.mjs`;
- `design/history/README.md`, the M05 retired file and the three new tenant
  retired files;
- `build_tenants/common/design/modules/M01-gtl-core.yml` and its history file.
  The inventory's selected root is the TypeScript tenant.

No recipe or inventory names the closure proof file
(`ABI5_STEEL03_CLOSURE_PROOF_PATH`). Generated members that a build moves are
the four contract files above and, on restaging, the qualification files.

## 9. Lanes before and after

### Checks on the final tree

- `npm run build` passes. `lint:imports` passes (30 modules under
  `code/src/shared/`; 3 forbidden owner pairs hold). `lint:lifecycle` passes
  (292 modules; 7 allow-listed sites; no offender). `lint:calculus` passes
  (6 modules; no offender). Logs are in `/private/tmp/abg-td27-work/td27b/`.
- Whole-word search over specification, kept design (tenant and shared),
  source, scripts and tests, excluding `test_runs`, `downstream` and
  `evidence`:
  - `gateApplication`, `GateApplication`, `GATE_APPLICATION_SCHEMA`,
    `GATE_IDS`, `GATE_DESCRIPTOR`, `GATE_TARGET_DESCRIPTOR`, `gateTarget` and
    `HOF-003` occur only under `design/history/`.
  - The literal `"gate"` / `'gate'` occurs at the two refusal sites:
    `t292-td34a-run-invocation-schema-owner.test.mjs:250` and
    `w2-steel-single-start-closure.test.mjs:560`.
  - It also occurs in `test_env/support/evidence-gates.json`, where it is the
    key that names an evidence gate (another sense).
  - In the generated `contracts/**`, which is reported separately (ruling 6),
    `HOF-003` occurs twice and the schema arm once (section 8).
- Size, `git diff --numstat b13bdd5c2 HEAD`:
  - `code/src`: +1 −104;
  - `test_env`: +91 −120;
  - `specification`: +11 −14;
  - `T/design`: +50 −10;
  - `build_tenants/common/design`: +10 −3;
  - total +163 −251, of which +36 are under the two `history/` directories.

### Lanes rerun for the committed set

The source is unchanged from the candidate, so this round reruns only the
brief's set. Every file runs alone with the rules' command and
`ABI5_EVIDENCE_ROOT` set:

- Final: the worktree T with its build of the committed tree.
- Base: the `b13bdd5c2` copy with its build
  (`/private/tmp/abg-td27-work/base-root`). An edited file is copied in under a
  `.td27b` name and removed after the run.
- TAP files: `/private/tmp/abg-td27-work/td27b/base/` and `…/td27b/final/`.

| Lane | Base build, base file | Base build, committed file | Final build, committed file |
| --- | --- | --- | --- |
| `w2-steel-single-start-closure` | 8 / 1 / 0 / 7 (case 7 ok) | 8 / 0 / 1 / 7: case 7 fails at the refusal assertion (`:557`, actual `graph_function_catalog`), after every kept claim passes | 8 / 1 / 0 / 7 (case 7 ok) |
| `w2-steel-single-start-closure` case 7 with `ABI5_STEEL03_CLOSURE_PROOF_PATH` set | 1 / 1 / 0 / 0; proof `sha256:259bf256…` | – | 1 / 1 / 0 / 0; proof `sha256:259bf256…`, byte-identical |
| `t292-td34a-run-invocation-schema-owner` (refusal lane) | 3 / 3 / 0 / 0 | 4 / 3 / 1 / 0: the new refusal case fails on base | 4 / 4 / 0 / 0 |

Figures are tests / pass / fail / skip.

The catalogue lane `t292-td60b-evidence-gate-catalogue` is on `main`
(`f82b8ad24`) and not on this branch. Its file from `main` ran over three
`git archive` extracts of `test_env`. It needs no build.

| Tree | Tests / pass / fail / skip |
| --- | --- |
| base `b13bdd5c2`, with the lane file added | 3 / 3 / 0 / 0 |
| branch `4c6a621b3`, with the lane file added | 3 / 3 / 0 / 0 |
| trial merge of `main` and `4c6a621b3` (`git merge-tree`, tree `0675a6734`, clean), the lane file as on `main` | 3 / 3 / 0 / 0 |

### Lanes before and after (the stopped candidate's runs; source unchanged since)

The earlier Writer ran these on base and on a copy of the candidate tree
(`/private/tmp/abg-td27-work/final-root`). Its `code/src` equals the
committed `code/src`. The table below is from those runs. The
`w2-steel-single-start-closure` row is superseded by the reruns above.

| Lane | Base: tests / pass / fail / skip | Candidate: tests / pass / fail / skip |
| --- | --- | --- |
| `t287-gtl-serialization-publication` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `m5-c-algebra-validation` | 22 / 19 / 0 / 3 | 21 / 18 / 0 / 3 |
| `t287-static-declaration-closure` | 11 / 10 / 0 / 1 | 11 / 10 / 0 / 1 |
| `a5-f02-canonical-gtl-identity` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t292-td34a-run-invocation-schema-owner` | 3 / 3 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-gtl-graph-law` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-r6-retry-success-exit` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `m5-event-calculus-runtime` | 19 / 18 / 0 / 1 | 19 / 18 / 0 / 1 |
| `t287-native-structural-gates` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `m5-installed-graph-edge` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-calculus-state-transfer` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-f04a-probabilistic-result-candidate` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-single-address-space-consolidation` | 17 / 17 / 0 / 0 | 17 / 17 / 0 / 0 |
| `t287-registered-graph-selection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-recursive-registered-selection` | 7 / 6 / 0 / 1 | 7 / 6 / 0 / 1 |
| `t287-readable-stops-foldback` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-recursive-failure-foldback` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-w2-05-static-binding-algebra` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-owned-call-reference` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-default-library` | 37 / 34 / 0 / 3 | 37 / 34 / 0 / 3 |
| `integration-shared-seams` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-cross-cut-public-read` | 5 / 4 / 1 / 0 | 5 / 4 / 1 / 0 |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-continuation-causation` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-native-runtime-gate` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-qualification-producer-acquisition-reuse` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `w2-steel-single-start-closure` | 8 / 1 / 0 / 7 | superseded: 8 / 1 / 0 / 7 on the final build (above) |
| `t287-stdo-proof-entry` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-qualification-carrier-resource` | 7 / 0 / 0 / 7 | 7 / 0 / 0 / 7 |
| `t287-qualification-fp-proof-delivery` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-qualification-raw-contract-preimage` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-qualification-law` | 11 / 7 / 0 / 4 | 11 / 7 / 0 / 4 |
| `t287-qualification-scopes` | 24 / 24 / 0 / 0 | 24 / 24 / 0 / 0 |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |

Case-level differences, base to final:

| Lane | Case | Base | Final | Reading |
| --- | --- | --- | --- | --- |
| `m5-c-algebra-validation` | M5 native GTL constructs all ten graph relations with derived identities | ok | renamed "… all nine …", ok | test edit |
| `m5-c-algebra-validation` | M5 whole-program validation binds gate law to published Rule and Evaluator declarations | ok | deleted | gate law |
| `t287-static-declaration-closure` | existing named workflow, gate, recursion and fan-out owner rows remain required | ok | renamed without "gate", ok | test edit |
| `t292-td34a-run-invocation-schema-owner` | a gate graph application is refused at raw admission, at Catalog admission and at the run door | – | ok | the refusal lane (red on base) |
| `w2-steel-single-start-closure` | consumer callable membership resolves exact borrowed owners without contributor membership rewriting | ok | ok | Catalog through the history path; asserts the recorded-basis refusal (red on base at that assertion) |

Every other case has the same outcome on both builds. Known reds:

- `t287-cross-cut-public-read` case 1 fails on both builds at its read-count
  assertion (`expected: 1053`, `actual: 12477`). It reads the
  `d2-continuation-09-store-cross-cut-reads` input. Because it fails before
  any later step on both builds, it does not show whether a later step would
  meet the gate.
- `witness-reprice-definition-binding` is not in this set.

Skips are the same on both builds, and each names an unset variable. The
gate-bearing inputs are therefore not exercised:

- `steel02-resolver-proof` (3 cases of `m5-c-algebra-validation`);
- `f11-carrier-full-fixture` (7);
- `f11-fp-assessment-packet` (1);
- `qual-raw-contract-preimage` (1).

## 10. Replay

The earlier Writer replayed the eleven TD-25R logs (TD-25R Return, section
"Replay") on the base build and the candidate build, with the `replay-log.mjs`
entry copied from TD-25R. The candidate's `code/src` is the committed
`code/src`.

- Every row is identical: event counts by kind, final digests, owner facts,
  and the same refusal text for the five that base refuses (registered
  selection, hc2, r10 and two RC1 logs).
- These logs replay to the same digests on both builds:
  - the live rc.12 log, `sha256:3800fb11…`;
  - blocked-testing, `sha256:4002872…`;
  - retry, `sha256:6dbf558…`;
  - selected-action, `sha256:0d3923d…`;
  - native-02, `sha256:bc4a919…`.
- Both builds refuse the twelve gate-bearing logs of section 2 at decode, with
  the same message ("event stamp differs from the exact native profile
  schedule").

## 11. Artifact truth over recorded stores

The replay comparison does not exercise `projectArtifactTruth`
(`abg/artifact_truth.ts`). That function re-validates each recorded
`product.install` lock with `isResolvedProductLock`
(`product/environment.ts`) against the reader's capability register. The
earlier Writer measured this section on the candidate; the committed
`code/src` and the generated contracts are identical to it.

- **Register.** `shared/capability_contracts.ts` is not changed. The
  capability graph `contracts/capabilities/capability-definition-graph.json` is
  the same on the base build and the final build:
  - the same 16 rows, with the same capability ids in the same order;
  - the same dependent capability ids;
  - the same 241 owning Public contract rows (contract id, version and nested
    selector).

  With digests masked the two graphs are identical. The 551 changed leaves are
  `catalogDigest` (241), `productContentDigest` (241),
  `capabilityDefinitionDigest` and `capabilityDefinitionRef` (34 each, rows
  and dependents) and `graphDigest` (1).
- **Direct probe.** The store is a copy of the rc.12 default-library store
  (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
  `sha256:440994c0…`), copied to
  `/private/tmp/abg-td27-work/truth/rc12-default-library.events.jsonl`. It was
  probed with the TD-25M Writer's `probe-artifact-truth.mjs` and
  `probe-lock.mjs`, copied to `/private/tmp/abg-td27-work/scripts/`.

| Build | Rows | Artifact admissions | `projectArtifactTruth` | Digest | Inline `product.install` lock: `isResolvedProductLock`, capability identity mismatches |
| --- | ---: | ---: | --- | --- | --- |
| base | 1,695 | 3 | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true, 0 |
| final | 1,695 | 3 | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true, 0 |

  The second `product.install` admission carries a
  `resolved_product_lock_reference` on both builds.
- **Lanes,** both builds, one file at a time with `ABI5_EVIDENCE_ROOT` set:

| Lane | Base: tests / pass / fail / skip | Final: tests / pass / fail / skip | Cases |
| --- | --- | --- | --- |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | same |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 | same |
| `t287-cross-cut-public-read` | 5 / 4 / 1 / 0 | 5 / 4 / 1 / 0 | same; case 1 is the known read-count red on both (`expected: 1053`, `actual: 12477`) |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 | same; case 3 skips on both (`ABI5_SELECTED_ACTION_OWNER_SUBJECT` unset) |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | same |

Artifact truth does not change. None of these cases goes from pass to fail,
and the store's projection is admitted with the same digest on both builds.

## 12. Deviations

- The census skeleton (`5ea2259fd`) has four errors, corrected in this Return:
  - it says "five notes";
  - it gives `M05:415-417` for a passage at 416-417;
  - it gives `LEAF_SPECS.gate` and `gateTarget` as lines 35-36 (they are
    37-38);
  - it misses `M05:1068`.
- The discriminator of the arm is `relationKind`, not `kind` as the first brief
  wrote. The door subject uses `relationKind: "gate"`.
- The base column of the run door comes from a scratch copy of the refusal
  lane run against the base build
  (`/private/tmp/abg-td27-work/door/td27-scratch-gate-refusal-base.test.mjs`).
- One kept assertion moves rather than stays. The widened-Evaluator check (an
  Evaluator with an added `runtimeAuthority` fails raw admission) lived inside
  the deleted gate-law test. It now closes the recursion-law test of
  `m5-c-algebra-validation`, with the same three assertions.
- `a5-f02-canonical-gtl-identity` gains a 21-line helper. Its
  inventory-permutation claims need two Evaluators and two Rules. The gate
  case supplied one of each, so the helper adds one of each to the two
  publications it permutes. The claims are unchanged.
- The ruling-2 refusal assertion is in `w2-steel-single-start-closure`, not
  in the refusal lane file. There it uses the case's existing evidence gate,
  and the catalogue row stays true without an edit.
- The shared module's retired lines go to a new
  `build_tenants/common/design/history/`. The rules name only `T/design/history/`,
  and the shared tree is not the tenant's. The two restated YAML lines cite no
  tenant file or symbol, because the file is tenant-neutral prior-basis
  evidence (`authority_note`: "Not current ABIogenesis 5.0 design authority").
- The catalogue lane is not on this branch. It ran from `main`'s file over
  `git archive` extracts of base, branch and a trial merge, not in the
  worktree.
- This round reran only the brief's set (section 9), because no source file
  changed. The full lane list, replay and artifact truth are the earlier
  Writer's runs on a tree with the same `code/src` and the same generated
  output.
- Before the lanes finished, the earlier Writer treated a probe of the
  historical-proof path as the stop check's mechanism. It was the wrong path
  for `catalog.admit` (section 2), and the lanes settled the stop check.

## 13. Residuals

- **R1, specification mirrors.** The ordinary build does not restage
  `contracts/qualification/`. Until the Executive restages them at merge, the
  tracked mirrors and `rule-catalog.json` carry `REQ-L-GTL3-HOF-003` and the
  base sentences, including the base `PRODUCT.md` selection row. The Executive
  restages and commits them at merge (ruling 6).
- **R2, generated schema.** The tracked
  `contracts/schemas/gtl-serialization.schema.json` keeps the gate arm until the
  generated files are rebuilt and committed at merge (ruling 6). The final build
  emits it without the arm (section 8).
- **R3, doors that admit no schema.** Two `./product` builders take a
  gate-bearing value on both builds, unchanged here:
  - `product.buildGraphFunctionCatalog`;
  - `product.admitGraphFunctionCatalog` when called directly.

  The Executive records them in the register (ruling 7).
- **R4, process prerequisites** (for the record, not acted on). Process
  prerequisites are today an opaque policy string that the validator never
  reads. A first-class relation for them is future work, authored from its own
  requirement.
- **R5, recorded pre-retirement bases.** The `5.0.0-dev.286` and `5.0.0-rc.1`
  builds shipped the `hello-gate` conformance Program, and 8,130 of the 8,192
  gate objects in the evidence root are its target (section 2). Under ruling 1
  such a basis is refused at `catalog.admit` by design. History reads
  (historical declaration proof, replay, artifact truth) are unchanged.
- **R6, lists that omit applications.** `specification/PRODUCT.md` "Graph
  Algebra" and the M05 relation table list neither `registered_selection` nor
  `re_enter`, which the schema carries. This predates the package. The Executive
  records it (ruling 7).
- **R7, outside the tenant.** The shared design is done (ruling 5). The
  withdrawn Python tenant is listed in section 1 and not edited; it has its own
  register entry.
- **R8, unused imports.** `test_env/fixtures/language-structural/leaf.mjs`
  imports `RECURSION_IDS` and `FAN_OUT_IDS` and does not use them. This
  predates the package. The Executive records it (ruling 7).
- **R9, the four gate-bearing inputs that no lane exercises** (section 2, last
  table row) stay as they are. Their lanes are another package's (ruling 8).
- **R10 (observation, for the Executive).** For the recorded dev.286
  artifact-truth rows of `steel03-retained-call`, the environment owner's
  projections `abg.projectAdmittedProductInstallByAdmissionEventRef` and
  `abg.projectAdmittedWorkspaceBindingByInvocationRef` return `null`:
  - on the base build and on the final build alike;
  - for both `product.install` rows and the `workspace.bind` row.

  So `reconstructHistoricalDeclarationCatalog` cannot take its environment from
  the owner for this input, and the case uses the Catalog owner alone (ruling 2).
  This is the TD-77 kind of reader behaviour, not changed or caused here.
