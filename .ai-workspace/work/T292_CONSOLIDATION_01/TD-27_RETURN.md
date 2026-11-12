# TD-27 Return: the `gate` relation (stopped at step 2)

Writer: Claude Opus 5.5. Branch `claude/td27-retire-gate` from local `main` at
`b13bdd5c2`, worktree `/private/tmp/abg-td27`. T is
`build_tenants/abiogenesis/typescript`. Change class: requirement_reprice
(`REQ-L-GTL3-HOF-003` deleted), then realization_refactor. No push, no tag.

**Status: STOPPED at step 2 (recorded history); nothing past the census is
committed.** The retirement exists as an uncommitted candidate: it builds,
passes the three lints and its refusal lane, and every other lane gives the same
result as on base, with one exception. Case 7 of
`w2-steel-single-start-closure` ("consumer callable membership resolves exact
borrowed owners without contributor membership rewriting") passes at
`b13bdd5c2` and fails on the candidate. The case re-admits through
`catalog.admit` the recorded readiness basis of evidence gate
`steel03-retained-call` (D4_S01 borrowed-five call 11). That basis carries
the shipped `5.0.0-dev.286` conformance publication `hello-world@5`, whose
GraphFunction `hello-gate@5` has a gate application, and the owner schema
now refuses it with `invalid_kind`. The candidate is the worktree diff
against `5ea2259fd` (31 files, +140 −246), saved as
`/private/tmp/abg-td27-work/td27-candidate.patch`
(`sha256:4890c74decc1d6ac2d43f42bd1981c2d4e5ac156b52d123861109acb48683f0c`).

Rulings needed:

1. Must recorded pre-retirement readiness bases (`5.0.0-dev.286` and
   `5.0.0-rc.1` carried `hello-gate@5`) stay admissible through
   `catalog.admit`? On base such a basis passes both raw admission and the
   gate law of `validatePublication`, so keeping it admissible keeps both.
2. If they must, which realization: a read-only historical admission arm for
   `gate` without a constructor; re-cut or re-recorded evidence for
   `steel03-retained-call`; or an admission path for recorded bases. This is a
   design question for its own package, not one this package can settle.
3. If they need not, the case or its input is re-ruled, and the candidate can
   be committed as it stands.
4. Once the retirement proceeds: restaging the specification mirrors
   (residual R1), the two specification readings in section 3, and the doors
   that admit no schema (residual R3).

## Commits

| Commit | Step |
| --- | --- |
| `5ea2259fd` | 1-2: census and recorded history (Return skeleton) |
| this commit | Return: stop at step 2 (this file only) |

The four commits of steps 3-6 (specification, design, code, tests) are not
made. Their content is the uncommitted candidate described in sections 3-8.

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
| `specification/PRODUCT.md` | 392 | "GTL gates or policy select among named admitted compositions" | restated without the relation |
| `requirements/gtl/REQ-L-GTL3-HOF.md` | 32 | `REQ-L-GTL3-HOF-003` | requirement deleted |
| `requirements/gtl/REQ-L-GTL3-LAWS.md` | 34 | `REQ-L-GTL3-LAWS-010` "fan-out, fan-in, gate, and promote" | list loses "gate" |
| `requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md` | 58 | graph algebra capability group "fan-out, fan-in, gate, promote" | list loses "gate" |
| `requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md` | 57 | `REQ-L-GTL3-CONTRACT-LAW-API-002` core graph algebra list | list loses `gate` |
| `requirements/gtl/REQ-L-GTL3-RULE.md` | 1, 21, 23 | title "Declarative Constraints And Gates"; `REQ-L-GTL3-RULE-003` "`gate(...)` = the graph combinator"; `REQ-L-GTL3-RULE-004` "gate protocol" | title and the two sentences restated |
| `requirements/gtl/REQ-L-GTL3-EVALUATOR.md` | 13, 19 | purpose "gate-visible assessment"; `REQ-L-GTL3-EVALUATOR-002` "or a gate has passed" | read as the relation (section 3); restated |

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
| same | 1068 | `traversal_route_admitted` row: "… fan-out completion, gate result, retry progress …" in the causal basis | restated (this line was missing from the committed skeleton) |
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
candidate build in none.

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

Other installers and validators of the fixture Program, none of which starts
the gate Program: `m5-event-calculus-runtime`,
`t287-single-address-space-consolidation`,
`t287-f04a-probabilistic-result-candidate`, `t287-calculus-state-transfer`,
`t287-r6-retry-success-exit`, `t287-gtl-graph-law`,
`t287-native-structural-gates`; support `language-structural-fixture.mjs`,
`language-structural-gtl.mjs`, `native-runtime-structural-cases.mjs`.
`hello-product-boundary.test.mjs:13` lists `GATE_HELLO` among removed
identifiers it forbids; it stays.

Outside this tenant and outside the package's scope (not edited):
`build_tenants/abiogenesis/python` (paused tenant: `code/gtl/algebra.py`,
`code/gtl_spec/packages/abiogenesis.py`, two tests, `GTL_3_MODULE_DESIGN.md`,
`test_surface_map.md`), `build_tenants/common/design` (`module_decomp.md`,
`modules/M01-gtl-core.yml` cite `REQ-L-GTL3-HOF`).

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
  exact native profile schedule". The candidate build refuses them with the same
  message (section 10).
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
| `steel02-resolver-proof`, `f11-carrier-full-fixture`, `f11-fp-assessment-packet`, `qual-raw-contract-preimage` | marked `failing_with_input_present`; each needs variables that are unset | their cases skip on both builds (section 9): not exercised |

**Stop check (step 2): the condition holds.** A lane case that passes at
`b13bdd5c2` on kept behaviour fails on the candidate because it re-admits a
recorded readiness basis that carries a gate application:

- Case: `w2-steel-single-start-closure`, "consumer callable membership
  resolves exact borrowed owners without contributor membership rewriting"
  (`test_env/tests/w2-steel-single-start-closure.test.mjs:505`). Its subject is
  kept behaviour: borrowed-owner callable membership, Catalog narrowing and
  Program and execution declaration closure.
- Input: evidence gate `steel03-retained-call` ("the retained installed
  conformance call (S01 borrowed-five call 11)", status `runs_with_root`),
  `comments/codex/20260911_D4_S01_PROGRAM_OWNER/implementation-01/evidence/borrowed-five-call-11.jsonl`,
  `sha256:3cd8961c3f8a95eaded5b0e9e805b41cef16c58a8098b585166bbe1610eed3dd`,
  19,478,678 bytes. Its
  `invocation.resources.declarationCatalog.catalog.readinessBasis.publications[4]`
  is the shipped `module://abiogenesis/conformance/hello-world@5` publication
  of `product://abiogenesis/typescript-tenant@5.0.0-dev.286`;
  `graphFunctions[12]` is `graph-function://abiogenesis/conformance/hello-gate@5`,
  whose `template.applications[0]` has `relationKind: "gate"`.
- What the case does: `product.CatalogOperationPort.admit({kind:
  "catalog_admit_packet", …, readinessBasis: supplied.catalog.readinessBasis})`
  and then `assert.equal(catalog.kind, "graph_function_catalog")` (`:510-513`).
- Base (`b13bdd5c2` build, evidence root set, the file run alone):
  `ok 7 - consumer callable membership resolves exact borrowed owners without contributor membership rewriting`
  (TAP `/private/tmp/abg-td27-work/lanes-w2check/base.tap`; tests 8, pass 1,
  skip 7).
- Candidate: `not ok 7 - consumer callable membership resolves exact borrowed owners without contributor membership rewriting`
  (TAP `/private/tmp/abg-td27-work/lanes-after2/w2-steel-single-start-closure.tap`;
  tests 8, pass 0, fail 1, skip 7), with
  `{"kind":"catalog_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","validation":{"kind":"raw_admission_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_kind","message":"$/graphFunctions/12/template/applications/0/relationKind: Invalid type: Expected (\"compose\" | \"substitute\" | \"recurse\" | \"fan_out\" | \"fan_in\" | \"registered_selection\" | \"re_enter\" | \"promote\" | \"identity\" | \"same_object\") but received \"gate\""}}`.

This also meets the fourth stop condition: a caller of the kept Public
operation `catalog.admit` that supplies this recorded readiness basis observes
a refusal where it observed an admitted Catalog equal to the recorded one.

Why my earlier mechanism check missed it. Before the lanes finished I probed
the 22 gate-bearing Catalog and publication rows of seven recorded inputs,
`borrowed-five-call-11.jsonl` among them, with `admitGraphFunctionCatalog`
and `canonicalEquals` (`/private/tmp/abg-td27-work/canon/probe.mjs`): all 22
re-derive equal on both builds. That pair is what the historical declaration
proof uses (`reconstructHistoricalDeclarationCatalog`), and it parses no GTL
schema. `CatalogOperationPort.admit` (`product/catalog_operations.ts`,
`constructReadyCatalog`) is a different path: it runs `rawAdmitValue` on each
publication of the readiness basis first, and raw admission is where the
retirement refuses the arm. The probe therefore says nothing about
`catalog.admit` over recorded bases and is not evidence that recorded
Catalogs are unaffected.

The other gate-bearing inputs give the same result on both builds (section
9). The 12 gate-bearing event logs are not replayable on base.

I stopped here: none of the candidate is committed, the lane, its input and
the test are not changed, and no historical arm is added.

## 3. Specification edits (uncommitted candidate)

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
| `PRODUCT.md:392` | "GTL gates or policy select among named admitted compositions …" | "A GTL structural selection boundary or policy selects among named admitted compositions …" |
| `REQ-L-GTL3-LAWS-010` | "fan-out, fan-in, gate, and promote preserve interface and type truth" | "fan-out, fan-in, and promote …" |
| `REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL` graph algebra group | "fan-out, fan-in, gate, promote, and same-object identity" | "fan-out, fan-in, promote, and same-object identity" |
| `REQ-L-GTL3-CONTRACT-LAW-API-002` | "`fan_in`, `gate`, `promote`, …" | "`fan_in`, `promote`, …" |
| `REQ-L-GTL3-RULE` title | "Declarative Constraints And Gates" | "Declarative Constraints" |
| `REQ-L-GTL3-RULE-003` | "`Rule` = what must hold, `Evaluator` = what checks or attests convergence, `gate(...)` = the graph combinator that blocks or allows continuation." | "`Rule` = what must hold, `Evaluator` = what checks or attests convergence." |
| `REQ-L-GTL3-RULE-004` | "parameters for gate protocol, aggregation, ordering, or threshold concerns" | "parameters for aggregation, ordering, or threshold concerns" |
| `REQ-L-GTL3-EVALUATOR` purpose | "convergence, attestation, and gate-visible assessment" | "convergence, attestation, and assessment" |
| `REQ-L-GTL3-EVALUATOR-002` | "… an output has converged, or a gate has passed." | "… or an output has converged." |

Readings that need the Executive's eye:

- `PRODUCT.md:392`. "GTL gates … select among named admitted compositions"
  contradicts HOF-003 itself ("without choosing a candidate"), so the
  sentence did not describe the relation's law; it names a GTL form that
  selects. I restated it with the term `REQ-L-GTL3-SELECTION-BOUNDARY` uses,
  "structural selection boundary". `registered_selection` is the realizing
  application, but the specification does not use that name.
- `REQ-L-GTL3-EVALUATOR` purpose and `-002`. "gate-visible assessment" and
  "a gate has passed" date from the same April requirement set as RULE-003's
  `gate(...)`, so I read them as the relation. Read as quality or release
  gates, the edits only drop an example and change no obligation.

## 4. Design changes (uncommitted candidate)

Cuts and replaced text go verbatim to `T/design/history/`, each cut file's
header naming the note, commit `b13bdd5c2` and the line ranges. Each kept note
gains one pointer line (M05 already had one).

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

`design/history/README.md` lists the three new files under "Retired
sections:" in order. No note moves. `ABI5_REALIZATION_CONSTITUTION.md` is not
edited (no relation-sense passage).

## 5. Source lines removed (uncommitted candidate)

| File | Removed | Added |
| --- | ---: | ---: |
| `gtl/serialization_contracts.ts` | 4 | 1 |
| `gtl/contracts.ts` | 3 | 0 |
| `gtl/graph_applications.ts` | 13 | 0 |
| `gtl/index.ts` | 2 | 0 |
| `gtl/declaration_references.ts` | 5 | 0 |
| `validator/validation.ts` | 77 | 0 |
| **total** | **104** | **1** |

Compiler-first: removing `GATE_APPLICATION_SCHEMA` and its arm gave errors at
`gtl/contracts.ts:33`; removing `GateApplication` gave errors at exactly the
census sites (`declaration_references.ts:111`, `graph_applications.ts:12`,
`index.ts:136`, `validation.ts:405, 1198, 1241, 1364`). No stub, wrapper or
dead branch remains. `hasExactApplicationShape` and
`projectGraphFunctionApplicationDeclarationReferences` have no default arm;
no admitted value reaches them with another kind, because every door parses
the application union first (section 6).

## 6. Door table (uncommitted candidate)

Subject: a publication or GraphFunction whose application has `relationKind:
"gate"`. "Recorded" is the fixture publication built by the base fixture
(gate case included) and saved as JSON; "hand-written" is the shipped
Consensus publication with one gate application added to its first
GraphFunction. Probe: `/private/tmp/abg-td27-work/door/doors.mjs`; run door:
the new case in `t292-td34a-run-invocation-schema-owner` (base observation
with a scratch copy whose `catalog.admit` call is wrapped).

| Door | Base | Candidate |
| --- | --- | --- |
| `./gtl/m01` `admitGraphFunction` | `raw_admitted_value` | `raw_admission_refusal` / `invalid_kind`, "`$/template/applications/0/relationKind`: Invalid type: Expected ("compose" \| … \| "same_object") but received "gate"" |
| `./gtl/m02` `admitModule`; `./validator` `rawAdmitValue(…, "module_publication")` | `raw_admitted_value` | `raw_admission_refusal` / `invalid_kind` at `$/graphFunctions/N/template/applications/0/relationKind` |
| `validatePublication` | `publication_validation` | not reached: raw admission refuses |
| Catalog admission, `product.CatalogOperationPort.admit` (`catalog_admit_packet`) | passes raw admission and publication validation, reaches readiness | `catalog_validation_refusal` with `raw_admission_refusal` / `invalid_kind` |
| `conformance.evaluate` `gtl_program` | recorded: `gtl_program_conformance_result`; hand-written: refused by the gate law (`invalid_application`) | `gtl_program_conformance_refusal` / `raw_admission_refused` (`invalid_kind`) |
| Product resolution, `constructProgramValidationInputFromResolvedClosure` | recorded: `program_validation`; hand-written: `static_validation_refusal` (gate law) | `raw_admission_refusal` / `invalid_kind` |
| Run door, `runInstalledDefinitionCallWithResource` on a caller-supplied Catalog: gate in a publication, a Catalog entry, a view entry | `owner:invalid_program` (the door admits; the run owner refuses the unadmitted setup); `isRunInvocationResourceAssertion` true | `resource_admission:invalid_resource_assertion`; `isRunInvocationResourceAssertion` false; the binder resource gate runs once per case |
| Catalog admission of a recorded readiness basis: `steel03-retained-call`, `publications[4]` = dev.286 `hello-world@5` with `hello-gate@5` (section 2) | `graph_function_catalog`, equal to the recorded Catalog | `catalog_validation_refusal` / `raw_admission_refusal` / `invalid_kind` at `$/graphFunctions/12/template/applications/0/relationKind`: the stop |
| Control: the fixture publication without the gate case | admitted at every door | admitted at every door |

No new refusal code or message: every refusal is the owner schema's existing
`invalid_kind` or the binder's existing `invalid_resource_assertion`.

Doors that take a gate application on both builds, for the record:

- `product.buildGraphFunctionCatalog` (exported through `./product`) takes
  typed `ModulePublication` values and admits nothing. It builds a catalog
  from the gate-bearing publication on base and candidate alike, and equally from
  an invented `relationKind` with an extraneous key. This is existing
  behaviour of a builder, not of the relation (residual R3).
- The historical declaration proof (`project.read` `graph_call_*`
  `declarationProof`, `reconstructHistoricalDeclarationCatalog`) re-derives
  the recorded Catalog with `admitGraphFunctionCatalog` from its readiness
  basis and compares it with the supplied one; it parses no GTL schema. It
  accepts only the exact recorded Catalog its root basis names, so it reads
  history and admits no new gate shape. The recorded gate-bearing Catalogs
  re-derive identically on both builds through it (section 2); `catalog.admit`
  over the same recorded bases does not (the stop).

## 7. Tests and fixtures (uncommitted candidate)

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

Not committed (section 2). No test file, support module or fixture file is
deleted. Before deletion the gate-law test also asserted the missing Rule, detached locus and divergent
target refusals; all three are gate law and leave with it. No assertion on
kept behaviour is weakened.

## 8. Generated contracts and identity (uncommitted candidate)

Generated files are not committed; after every build I restored
`contracts`, `product-toolchain-manifest.json` and
`test_env/fixtures/abi5-root-candidate-basis.json`.

| Digest | Base `b13bdd5c2` | Candidate (ordinary build) | Candidate with authorities restaged (scratch) |
| --- | --- | --- | --- |
| `productContentDigest` | `sha256:b3b89acc1adcbbef1e5b04e3f0669382cc257d1450fd432c588ed0797d4b54f4` | `sha256:b08db7313bc31b434544eda71819032774d898cf0a523111d93a9423a3361636` | `sha256:86e7984abe764cfadc538e358af8954e5710af59cf370dca058150c1c92f5e8d` |
| `contributionManifestDigest` | `sha256:b3e65b46088b250900e1ffea76ad58a984ef8a525ab106ed95b6dd2297c5f5bc` | `sha256:5679388aec5eee374fd3ce0ca283d8ff4c390988d663f306d47bead1a2602aaf` | `sha256:844af4498f16bdea53259467e7b566f887bba4b6954e45ec5b5310a428f74f8b` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | `sha256:afd71b717a36bd6c585a6728adabab3d22376041e9d31b889891eeabdda3fedf` | `sha256:eea70f69d6699c5846bf179aed85786b452ec13268ed9c97ad44bb536227acc6` |
| capability graph `graphDigest` | `sha256:8a7486def91432c08f3763e4c10d08fdc30e7276de50ed3a96ee28671e51277e` | `sha256:648502cba70d0db3bfec3194acf0b38c721a04d06e4b01b22a3683f183d96a6b` | `sha256:5c57d5a8cf775b2d277187c19b46fceea65a1f54abe5975768ad7a042767bf75` |

Content changes under `T/contracts` (ordinary build):

| File | Content change |
| --- | --- |
| `schemas/gtl-serialization.schema.json` | the gate arm leaves the application `oneOf` (11 → 10) at its four sites: `GraphFunction`, `ModulePublication`, `GtlProgramConformanceInput` and `GtlLanguageConformanceCorpus` |
| `conformance/gtl-language-conformance-corpus.json` | only `schema.contentDigest` (the schema above) |
| `capabilities/capability-definition-graph.json` | digests and refs only (551 changes); same rows |
| `product-toolchain-manifest.json` | digests and digest-derived refs only; 75 public contract rows with the same ids; 10 publication bindings with new `publicationDigest`; 5,327 locators, same list |

The ordinary build does not restage the specification mirrors under
`contracts/qualification/` (`scripts/generate-qualification-rule-catalog.mjs`
stages them only with `--stage-authorities`, "an explicit source-build
action"); on the candidate they still carry the base specification text,
`REQ-L-GTL3-HOF-003` included. Restaging is a separate commit in this
repository (`ead445d32`, `60c76259d`). In a scratch copy I ran the same
command (`--stage-authorities ../../.. "<STDO v3.0.4 release>"`) and rebuilt;
the third digest column is that build. It changes `authority-inputs.json`,
`law-basis.json` (19 fields: sources' digests and byte counts, the catalog
digest, its own ref and digest), `coverage.json` (catalog and law-basis
digests, one authority source), `rule-catalog.json` and eight mirrors
(`INTENT`, `PRODUCT`, `REQ-L-GTL3-CONTRACT-LAW-API`, `-EVALUATOR`, `-HOF`,
`-LANGUAGE-CAPABILITY-MODEL`, `-LAWS`, `-RULE`). The rule catalog goes from
2,116 to 2,115 rows: the HOF-003 row leaves; the rows of HOF-004 … HOF-012 and
of the RULE title get new `ruleRef`s (10 new, 10 gone besides HOF-003)
because a `ruleRef` is derived from its byte span, which moves; the
requirement identifiers do not change. 203 other rows keep their `ruleRef`
and change only `sourceDigest` and offsets. On that restaged build,
`t287-qualification-law` (11 tests: 7 pass, 4 skip) and
`t287-qualification-scopes` (24 of 24 pass) give the same results as on base
and on the ordinary candidate build.

Qualification mirrors (not edited). Members of
`test_env/qualification/inventory.json` and the verification recipe that the
candidate changes: `code/src/gtl/contracts.ts`, `declaration_references.ts`,
`graph_applications.ts`, `index.ts`, `serialization_contracts.ts`,
`code/src/validator/validation.ts`; `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`,
`M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`,
`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`,
`T287_REGISTERED_GRAPH_SELECTION_DESIGN.md`;
`test_env/fixtures/language-structural/leaf.mjs`, `program.mjs`;
`test_env/tests/a5-f02-canonical-gtl-identity`, `m5-c-algebra-validation`,
`m5-installed-graph-edge`, `t287-gtl-serialization-publication`,
`t287-static-declaration-closure`. Changed files neither lists:
`t292-td34a-run-invocation-schema-owner.test.mjs`, `design/history/README.md`,
the M05 retired file and the three new retired files. Generated members that
a build moves: the four contract files above and, on restaging, the
qualification files.

## 9. Lanes before and after

Checks on the candidate:

- `npm run build` passes. `lint:imports` passes (30 modules under `code/src/shared/`; 3 forbidden owner pairs hold), as do `lint:lifecycle` (292 modules; 7 allow-listed sites; no offender) and `lint:calculus` (6 modules; no offender).
- Whole-word search over specification, kept design, source, scripts and tests, excluding `test_runs`, `downstream` and `evidence`:
  - `gateApplication`, `GateApplication`, `GATE_APPLICATION_SCHEMA`, `GATE_IDS`, `GATE_DESCRIPTOR`, `GATE_TARGET_DESCRIPTOR` and `gateTarget` occur only under `design/history/`.
  - The literal `"gate"` / `'gate'` occurs in the refusal lane `t292-td34a-run-invocation-schema-owner.test.mjs`. It also occurs in `test_env/support/evidence-gates.json`, where it is the key that names an evidence gate, another sense.
  - `HOF-003` is absent from `specification/`. Outside the search scope, the generated `contracts/qualification/` mirrors still carry it (residual R1), and the tracked generated `contracts/schemas/gtl-serialization.schema.json` still carries the gate arm (residual R2).
- Size, `git diff --numstat b13bdd5c2` over `code/src`, `test_env`, `specification` and `design`: +140 −246.
  - `code/src`: +1 −104.
  - `test_env`: +78 −118.
  - `specification`: +11 −14.
  - `design`: +50 −10, of which +29 are under `design/history/` (26 in the retired-section files, 3 README entries).

Every file runs alone with the brief's command and `ABI5_EVIDENCE_ROOT` set.
Base is a copy of the `b13bdd5c2` tree with its build
(`/private/tmp/abg-td27-work/base-root`). Candidate is a copy of the worktree
with the candidate build (`/private/tmp/abg-td27-work/final-root`). Case-level
comparison by title: `/private/tmp/abg-td27-work/scripts/tapcmp.py`.

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
| `w2-steel-single-start-closure` | 8 / 1 / 0 / 7 | 8 / 0 / 1 / 7 |
| `t287-stdo-proof-entry` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-qualification-carrier-resource` | 7 / 0 / 0 / 7 | 7 / 0 / 0 / 7 |
| `t287-qualification-fp-proof-delivery` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-qualification-raw-contract-preimage` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-qualification-law` | 11 / 7 / 0 / 4 | 11 / 7 / 0 / 4 |
| `t287-qualification-scopes` | 24 / 24 / 0 / 0 | 24 / 24 / 0 / 0 |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |

Case-level differences, base to candidate:

| Lane | Case | Base | Candidate | Reading |
| --- | --- | --- | --- | --- |
| `w2-steel-single-start-closure` | consumer callable membership resolves exact borrowed owners without contributor membership rewriting | ok | **not ok** | **the stop (section 2)** |
| `m5-c-algebra-validation` | M5 native GTL constructs all ten graph relations with derived identities | ok | renamed "… all nine …", ok | candidate test edit |
| `m5-c-algebra-validation` | M5 whole-program validation binds gate law to published Rule and Evaluator declarations | ok | deleted | gate law |
| `t287-static-declaration-closure` | existing named workflow, gate, recursion and fan-out owner rows remain required | ok | renamed without "gate", ok | candidate test edit |
| `t292-td34a-run-invocation-schema-owner` | a gate graph application is refused at raw admission, at Catalog admission and at the run door | – | ok | the refusal lane (red on base) |

Every other case has the same outcome on both builds. Known reds:
`t287-cross-cut-public-read` case 1 fails on both at its read-count
assertion (`expected: 1053`, `actual: 12477`). It reads the
`d2-continuation-09-store-cross-cut-reads` input, and because it fails before
any later step on both builds, it does not show whether a later step would
meet the gate. `witness-reprice-definition-binding` is not in this set. Skips
are the same on both builds, and each names an unset variable; the
gate-bearing inputs `steel02-resolver-proof` (3 cases of
`m5-c-algebra-validation`), `f11-carrier-full-fixture` (7),
`f11-fp-assessment-packet` (1) and `qual-raw-contract-preimage` (1) are
therefore not exercised. `w2-steel-single-start-closure` was also run alone
on base outside the batch (`/private/tmp/abg-td27-work/lanes-w2check/base.tap`):
case 7 is ok.

## 10. Replay

The eleven TD-25R logs (TD-25R Return, section "Replay"), with the
`replay-log.mjs` entry copied from TD-25R, on the base build and the
candidate build: every row is identical (event counts by kind, final digests, owner
facts, and the same refusal text for the five that base refuses: registered
selection, hc2, r10 and two RC1 logs). The live rc.12 log replays to
`sha256:3800fb11…`, blocked-testing to `sha256:4002872…`, retry to
`sha256:6dbf558…`, selected-action to `sha256:0d3923d…`, native-02 to
`sha256:bc4a919…` on both. The twelve gate-bearing logs of section 2 are
refused at decode on both builds with the same message ("event stamp differs
from the exact native profile schedule").

## 11. Artifact truth over recorded stores

Added at the Executive's request: the replay comparison does not exercise
`projectArtifactTruth` (`abg/artifact_truth.ts`), which re-validates each
recorded `product.install` lock with `isResolvedProductLock`
(`product/environment.ts`) against the reader's capability register.

- Register. `shared/capability_contracts.ts` is not changed. The capability
  graph `contracts/capabilities/capability-definition-graph.json` of the base
  build and of the candidate build has the same 16 rows with the same capability
  ids in the same order, the same dependent capability ids, and the same 241
  owning Public contract rows (contract id, version and nested selector). It is
  identical once digests are masked; the 551 changed leaves are
  `catalogDigest` (241), `productContentDigest` (241),
  `capabilityDefinitionDigest` and `capabilityDefinitionRef` (34 each, rows
  and dependents) and `graphDigest` (1).
- Direct probe. A copy of the rc.12 default-library store
  (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
  `sha256:440994c0…`, copied to
  `/private/tmp/abg-td27-work/truth/rc12-default-library.events.jsonl`),
  probed with the TD-25M Writer's `probe-artifact-truth.mjs` and
  `probe-lock.mjs` (copied to `/private/tmp/abg-td27-work/scripts/`):

| Build | Rows | Artifact admissions | `projectArtifactTruth` | Digest | Inline `product.install` lock: `isResolvedProductLock`, capability identity mismatches |
| --- | ---: | ---: | --- | --- | --- |
| base | 1,695 | 3 | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true, 0 |
| candidate | 1,695 | 3 | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true, 0 |

  The second `product.install` admission carries a
  `resolved_product_lock_reference` on both builds.
- Lanes, both builds, one file at a time with `ABI5_EVIDENCE_ROOT` set:

| Lane | Base: tests / pass / fail / skip | Candidate: tests / pass / fail / skip | Cases |
| --- | --- | --- | --- |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | same |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 | same |
| `t287-cross-cut-public-read` | 5 / 4 / 1 / 0 | 5 / 4 / 1 / 0 | same; case 1 is the known read-count red on both (`expected: 1053`, `actual: 12477`) |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 | same; case 3 skips on both (`ABI5_SELECTED_ACTION_OWNER_SUBJECT` unset) |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | same |

Artifact truth does not change: none of these cases goes from pass to fail,
and the store's projection is admitted with the same digest on both builds.
The stop in section 2 is on a different path, `catalog.admit` over a recorded
readiness basis, which artifact truth does not take.

## 12. Deviations

- The committed skeleton (`5ea2259fd`) said "five notes", gave `M05:415-417`
  for a passage at 416-417, gave `LEAF_SPECS.gate` and `gateTarget` as lines
  35-36 (they are 37-38), and missed `M05:1068`. This Return corrects all four.
- The discriminator of the arm is `relationKind`, not `kind` as the brief
  wrote; the door subject uses `relationKind: "gate"`.
- The run door "before" column comes from a scratch copy of the new lane run
  against the base build
  (`/private/tmp/abg-td27-work/door/td27-scratch-gate-refusal-base.test.mjs`,
  TAP `/private/tmp/abg-td27-work/td34a-base-with-lane.tap`): on base the
  lane's own refusal assertions fail, which is the point of the lane.
- One kept assertion moves rather than stays: the widened-Evaluator check (an
  Evaluator with an added `runtimeAuthority` fails raw admission) lived inside
  the deleted gate-law test and now closes the recursion-law test of
  `m5-c-algebra-validation`, with the same three assertions.
- `a5-f02-canonical-gtl-identity` gains a 21-line helper. Its
  inventory-permutation claims need two Evaluators and two Rules; the gate
  case supplied one of each, so the helper adds one of each to the two
  publications it permutes. The claims are unchanged.
- The artifact-truth section (section 11) is an addition by the Executive
  after the brief.
- Before the lanes finished I treated a probe of the historical-proof path as
  the stop check's mechanism. It was the wrong path for `catalog.admit`
  (section 2). The lanes settled the stop check, as the rules require.

## 13. Residuals

- R1, specification mirrors (ruling). The ordinary build does not restage
  `contracts/qualification/` (section 8). With the candidate committed, those
  mirrors and `rule-catalog.json` would still state `REQ-L-GTL3-HOF-003` and
  the old sentences; a whole-word search over the candidate finds `HOF-003`
  in `rule-catalog.json` and
  `contracts/qualification/sources/REQ-L-GTL3-HOF.md`. Restaging is an
  explicit source-build action with its own commit precedent (`ead445d32`,
  `60c76259d`); the staged figures in section 8 are what it produces.
- R2, generated schema. `contracts/schemas/gtl-serialization.schema.json`
  is tracked and generated; under rule 7 I restored it, so with the candidate
  committed the tracked copy would keep the gate arm until a build is
  committed. The candidate build emits it without the arm (section 8).
- R3, doors that admit no schema. `product.buildGraphFunctionCatalog` builds a
  Catalog from typed values without raw admission, for a gate application and
  for any invented `relationKind` alike, on both builds. The historical
  declaration proof admits no GTL schema either; it accepts only the exact
  recorded Catalog its root basis names. Neither is changed here; whether the
  builder should admit its input is a question for its own package.
- R4, process prerequisites (for the record, not acted on). Process
  prerequisites are today an opaque policy string that the validator never
  reads. A first-class relation for them is future work, authored from its
  own requirement.
- R5, "no shipped publication carries a gate" holds at head only. The
  `5.0.0-dev.286` and `5.0.0-rc.1` builds shipped the `hello-gate`
  conformance Program, and 8,130 of the 8,192 gate objects in the evidence
  root are its target (section 2). This is the source of the stop. Replay
  (section 10) and artifact truth (section 11) do not need it; `catalog.admit`
  over a recorded basis does.
- R6, lists that omit applications. `specification/PRODUCT.md` "Graph
  Algebra" (`:288-303`) and the M05 relation table (`:401-411`) list neither
  `registered_selection` nor `re_enter`, which the schema carries. This
  predates the package; adding them is a product or design decision, not part
  of this retirement.
- R7, outside the tenant. `build_tenants/abiogenesis/python` (paused tenant)
  and `build_tenants/common/design` (`module_decomp.md`,
  `modules/M01-gtl-core.yml`) still name the relation or
  `REQ-L-GTL3-HOF`; the brief scopes this package to the TypeScript tenant
  and the specification.
- R8, `test_env/fixtures/language-structural/leaf.mjs` imports
  `RECURSION_IDS` and `FAN_OUT_IDS` and does not use them; this predates the
  package (it was so at `b13bdd5c2`).
