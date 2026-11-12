# TD-27 Return: the `gate` relation retires

Writer: Claude Opus 5.5. Branch `claude/td27-retire-gate` from local `main` at
`b13bdd5c2`, worktree `/private/tmp/abg-td27`. T is
`build_tenants/abiogenesis/typescript`. Change class: requirement_reprice,
then realization_refactor. No push, no tag.

**Status: in progress. This commit is the census and recorded-history
skeleton.**

## 1. Census

Whole-word search for `gate`, `gates`, `GateApplication`, `gateApplication`
and `GATE_APPLICATION_SCHEMA`, every hit read for its sense. "Relation" means
the GTL graph application `relationKind: "gate"` or the higher-order form
`gate(target, rule, evaluators)`. Every other hit (release, qualification,
quality, admission, judgment, phase, review, closure, evidence or temporal
property gates, and the `admitJson` "gate form") is another sense and stays.

### Specification (relation sense)

| File | Line | Text | Disposition |
| --- | --- | --- | --- |
| `specification/INTENT.md` | 95 | "composition, substitution, recursion, fan-out, fan-in, gates, promotion, and identity" | list loses "gates" |
| `specification/PRODUCT.md` | 214 | "composition, substitution, recursion, fan-out, fan-in, gates, and promotion" | list loses "gates" |
| `specification/PRODUCT.md` | 299 | `gate` in the retained graph algebra block | line removed |
| `specification/PRODUCT.md` | 392 | "GTL gates or policy select among named admitted compositions" | restated without the relation |
| `requirements/gtl/REQ-L-GTL3-HOF.md` | 32 | `REQ-L-GTL3-HOF-003` | requirement deleted |
| `requirements/gtl/REQ-L-GTL3-LAWS.md` | 34 | `REQ-L-GTL3-LAWS-010` "fan-out, fan-in, gate, and promote" | list loses "gate" |
| `requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md` | 58 | graph algebra capability group "fan-out, fan-in, gate, promote" | list loses "gate" |
| `requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md` | 57 | `REQ-L-GTL3-CONTRACT-LAW-API-002` core graph algebra list | list loses `gate` |
| `requirements/gtl/REQ-L-GTL3-RULE.md` | 1, 21, 23 | title "Declarative Constraints And Gates"; `REQ-L-GTL3-RULE-003` split clause "`gate(...)` = the graph combinator"; `REQ-L-GTL3-RULE-004` "gate protocol" | title and the two sentences restated |
| `requirements/gtl/REQ-L-GTL3-EVALUATOR.md` | 13, 19 | purpose "gate-visible assessment"; `REQ-L-GTL3-EVALUATOR-002` "or a gate has passed" | read as the relation (section 3); restated |

Other-sense hits that stay, by file: `GOALS.md` (31, release, human and
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
`REQ-R-ABG3-REQUIREMENTS-ALGEBRA` (2), `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH`
(2), `requirements/README.md` (2). `specification/scenarios/` has no hit.

### Kept design notes (`T/design/*.md`, not `history/`)

533 whole-word hits in 52 notes; five notes name the relation:

| Note | Line | Text | Disposition |
| --- | --- | --- | --- |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | 123 | `GraphFunctionApplication` row: "composition, substitution, recursion, fan-out, fan-in, gate, promote, identity, or same-object identity" | restated from `gtl/contracts.ts` |
| same | 410 | `gate` row of the graph algebra projection table | cut |
| same | 415-417 | "Recursion, fan-out, fan-in, and gate retain explicit runtime-visible application declarations because they govern child traversal or admission." | restated |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | 37 | "Existing gate applications bind evaluators to one workflow target; they do not route alternative callees." | cut |
| same | 180 | "ConstructionComposition, Gate and C terms retain meaning." | restated |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 149 | "the declared `gate` application is not used" | restated |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md` | 115 | graph domain list with `gate`; "gates/promotion cannot widen authority" | restated |

`ABI5_REALIZATION_CONSTITUTION.md`: 9 hits, none names the relation (lines
436, 2320, 2364, 2413, 2535, 2746, 2749, 3046, 3228: approval, per-API,
implementation and C3/C4 gates). Not edited. `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:353`
("no fabricated gate pass") is a judgment check and stays.
`ABI5_STDO3_COMPUTATIONAL_BINDING.md:187` names the test files
`t287-malformed-gtl-gate`, `t287-native-runtime-gate` and
`t287-native-structural-gates`, which are qualification gates, not the
relation.

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
| `validator/validation.ts` | 405-411 | `case "gate"` of the exact-keys check | switch arm |
| same | 1197-1211 | published Rule and Evaluator check for a gate | validator law |
| same | 1241-1294 | attached evaluator loci and single workflow target law | validator law |
| same | 1364-1365 | the gate disjunct of the outer-interface check | validator law |

Callers: `gateApplication` has no source caller; it is reached through the
`./gtl` export only by tests and the fixture. `GateApplication` is named by
`contracts.ts`, `graph_applications.ts` and the barrel. No file is deleted.
Every helper the removed law uses (`cLeafTerms`, `isExecutableCLeaf`,
`compareUnicodeCodeUnits`, `projectCProgramNodeDeclarationReferences`,
`canonicalEquals`, `requireRefs`) has other callers and stays.
`abg/construction_continuation.ts` names no application arm at head: since
TD-47 (`6cc33e60a`) it uses `GraphFunction` from `gtl/contracts.ts`
(`:347`, `:459`, `:1071-1080`), which reaches the union through the type.
`grep -w gate` over `abg/` and `hog/` finds no relation site; runtime
relation dispatch covers `recurse`, `fan_out`, `fan_in` and `re_enter`
(`hog/route_proposal.ts:476`, `:1054`, `:1149`; `abg/traversal_route.ts:3594`,
`:3683`, `:3793`, `:3868`). The emitted `.d.ts` files that inline the union
(`gtl/serialization.d.ts`, `gtl/default_library.d.ts`,
`validator/conformance_operation.d.ts`, `gtl/worksite_command_forward.d.ts`,
`abg/qualification_proof.d.ts`) follow the source.

### Scripts and package metadata

`T/scripts`: no hit. `T/package.json:127` names the test files
`t287-native-structural-gates` and `t287-native-runtime-gate` (qualification
gates); no relation.

### Tests, support and fixtures (`T/test_env`, without `test_runs`, `downstream`, `evidence`)

| File | Site | Use |
| --- | --- | --- |
| `fixtures/language-structural/program.mjs` | `GATE_IDS` (16), `contractKinds` row (27), `LEAF_SPECS.gate`, `LEAF_SPECS.gateTarget` (35-36), `'gate'` in the default case list (49), the gate case (92-97) | producer: builds and publishes a gate Program |
| `fixtures/language-structural/leaf.mjs` | `GATE_IDS` import (2), `GATE_DESCRIPTOR`, `GATE_TARGET_DESCRIPTOR` (4), leaves `gate`, `gateTarget` (11-12), the `data_input -> data_input` arm of `relation` (only the gate leaf has that shape) | producer support |
| `tests/t287-gtl-serialization-publication.test.mjs` | `:373` static `{relationKind:'gate',…}` variant | static producer |
| `tests/m5-c-algebra-validation.test.mjs` | `:468-628` constructs every relation (`gateApplication` at `:511`; list and count `9` at `:552-567`); `:825-909` the gate-law test | constructor and validator law |
| `tests/t287-static-declaration-closure.test.mjs` | `:162-181` uses the gate application as the vehicle for a private-source closure refusal; `:183-197` loops over `GATE_IDS` among four owner-row cases | vehicle and one case |
| `tests/m5-installed-graph-edge.test.mjs` | `:69` source anchor equal to the default case list string | names the case list |
| `tests/a5-f02-canonical-gtl-identity.test.mjs` | `reverseInventory(value, "evaluators")`, `(…, "rules")` (`:316-317`) need two entries; today the gate and recursion cases supply them | counts the cases' declarations |

Other installers and validators of the fixture Program, none of which starts
the gate Program: `m5-event-calculus-runtime`,
`t287-single-address-space-consolidation`,
`t287-f04a-probabilistic-result-candidate`, `t287-calculus-state-transfer`,
`t287-r6-retry-success-exit`, `t287-gtl-graph-law`,
`t287-native-structural-gates`; support `language-structural-fixture.mjs`,
`language-structural-gtl.mjs`, `native-runtime-structural-cases.mjs`.

Qualification mirrors that name changed members (not edited):
`test_env/qualification/inventory.json` lists the fixture, its support files
and every edited test and source file by digest;
`test_env/qualification/recipe/verification-recipe.json`.

Outside this tenant and outside the package's scope (not edited):
`build_tenants/abiogenesis/python` (paused tenant: `code/gtl/algebra.py`,
`code/gtl_spec/packages/abiogenesis.py`, two tests, `GTL_3_MODULE_DESIGN.md`,
`test_surface_map.md` name `REQ-L-GTL3-HOF`), `build_tenants/common/design`
(`module_decomp.md`, `modules/M01-gtl-core.yml` name `REQ-L-GTL3-HOF`).

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
| every file under the main checkout's `T/test_env/test_runs` and `T/test_env/uat/runs` (added) | 1,332,834 | 57,864,557,094 | 97 |

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
  exact native profile schedule". They are not replayable on base, so the
  retirement takes no replay from them.
- The 97 `test_runs` hits are all `hello-gate-target@5` from
  `5.0.0-dev.286`, under `test_runs/steel-single-start` (74) and
  `test_runs/steel-serial-branch` (23), dated September.
- "No shipped publication carries a gate" holds at head (the ten shipped
  publication constructors, `scripts/generate-product-manifest.mjs:1203-1214`,
  build no gate; `T/contracts` carries the relation only in the schema arm).
  It did not hold for `dev.286` and `rc.1`.

Recorded inputs that passing lanes read through `support/evidence-gates.json`
and that carry a gate object (intersection of the catalogue's input paths with
the hit list): `d2-continuation-09-*` and `r10-child-proof-d2-s01`
(`20260911_D2_BOUNDED_REPAIR/.../program-ready-16.json`),
`r10-child-proof-d2-s01` (`20260911_D4_S01_PROGRAM_OWNER/.../call-9.jsonl`),
`s7-pending-consumer-intent`, `owned-proof-declaration`,
`producer-acquisition-reuse`, `steel03-retained-call`,
`stdo-proof-entry-run-nine`; and, already failing with the input present,
`steel02-resolver-proof`, `f11-carrier-full-fixture`,
`f11-fp-assessment-packet`, `qual-raw-contract-preimage`. Their lanes are run
before and after (section 8).

Stop condition (step 2): see section 8; this skeleton records the census only.
