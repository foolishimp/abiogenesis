# TD-28E Return: the forward declaration key is refused

Writer: Claude Opus 5.5. Branch `claude/td28e-forward-key-refused` from local
`main` at `b3bcb1303`, worktree `/private/tmp/abg-td28e`. Follow-up to TD-28d
(ruling R2). Change class: realization_refactor (a retired shape refused, not
ignored; no specification or design text names it). No push, no tag.

**Status: complete. When a GraphFunction in a Program's `callableMembership` declares `abg.worksite_command_forward`, the Program is refused at:**

- publication validation;
- `catalog.admit` (which also covers a GraphFunction borrowed from another publication, section 5);
- conformance;
- Product resolution;
- the run-environment observation;
- the Run door (shown by reading the code, not by a probe).

**Each refusal uses an existing code: `invalid_reference` `$.runEnvironments`, `unsupported_declaration` or `invalid_program`. Programs without the key are unchanged. Recorded history reads identically. On the final build: 264 tests, 252 pass, 0 fail, 12 skip. A GraphFunction that is only applied by a template is outside the position and needs a ruling (section 15, item 4).**

`T` = `build_tenants/abiogenesis/typescript`. Scratch, probes and TAP output:
`/private/tmp/abg-td28e-work/`.

## 1. Census

Line numbers are at `b3bcb1303`. Searches: `abg.worksite_command_forward`,
`worksite_command_forward`, `command-forward`, `REFUSED_PROGRAM_POLICIES`,
`namesRefusedPolicy`, `runEnvironmentForProgram`,
`selectorRoleFromBoundDeclarations`, `validRunEnvironmentProgram`,
`validRunEnvironmentPublication`, `abg.governed_context` over
`specification/`, `T/design` (not `history/`), `T/code/src`, `T/scripts`,
`T/test_env` (without `test_runs`, `downstream`, `evidence`) and
`T/package.json`.

### 1.1 The key

`abg.worksite_command_forward` is named nowhere in `T` or `specification/` at
base. The forward module (`gtl/worksite_command_forward.ts`, deleted by TD-28d)
set it on both of its GraphFunctions with the value
`dependency://abiogenesis/worksite/command-forward/historical-owners@5`
(`WORKSITE_COMMAND_FORWARD_IDS.historyDependencyRef`). Until TD-28d,
`product/declaration_closure.ts` (`5c9df5056`, `:606-615`) refused any
GraphFunction that declared it outside the exact forward Program (`wrong_owner`,
"forward C2 must retain its exact finite no-construction Program and
historical-proof marker"). That arm left with the module; no owner reads the
key at base.

### 1.2 Specification and design

- `specification/`: no file names the key, the forward module or the
  refused-key owner. No edit.
- Kept design notes (`T/design/*.md`): none names the key or the list of
  refused keys. `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md`,
  `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:684`,
  `M03_INSTRUCTION_ASSEMBLY_DERIVATION.md:68` and
  `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md:84` cite
  `gtl/stdo_run_environment.ts` for role and selector lookup, not for refused
  keys. No edit.
- `design/history/`: the moved forward note and its retired sections name the
  forward module (retired text; not edited).
- `ABI5_REALIZATION_CONSTITUTION.md`: no passage names the key.

### 1.3 Source (`T/code/src`)

The owner of refused keys, `gtl/stdo_run_environment.ts`:

| Lines | Symbol | Role |
| --- | --- | --- |
| 29 | `STDO_ENVIRONMENT_POLICY` | the TD-31 retired policy key, exported |
| 30-33 | `REFUSED_PROGRAM_POLICIES`, `namesRefusedPolicy(program)` | the three refused Program policy keys; reads `program.policies` only |
| 168-174 | `runEnvironmentForProgram(publication, program)` | `false` for a Program that names a refused key |
| 176-188 | `selectorRoleFromBoundDeclarations` (via `framedSynthesisNativeRole`, 210-218) | `false` for the same Program |
| 219-223 | `validRunEnvironmentPublication(publication)` | every Program of the publication through `runEnvironmentForProgram` |
| 224-234 | `validRunEnvironmentProgram(publication, program, graphFunctions)` | `runEnvironmentForProgram`, then role coverage over the Program's callable GraphFunctions (`:229`) |

Callers, and the door each serves:

| Caller | Door |
| --- | --- |
| `validator/validation.ts:178` (`validatePublishedDeclarations`, from `validatePublicationSubject:629`) | publication validation; `catalog.admit` (`product/catalog_operations.ts:291`, `constructReadyCatalog`) |
| `validator/validation.ts:747` (`validateProgram`) | conformance evaluation (`validator/conformance_operation.ts:302`); Product resolution (`product/execution_resolution.ts:773`); qualification (`validator/qualification.ts:308`) |
| `product/stdo_environment.ts:165,170` (`observeRunEnvironment`) | run-environment observation; the Run door's preparation (`product/run_invocation_operation.ts:807-815`) |
| `abg/stdo_environment.ts:162,171,207` (`runEnvironmentEvidenceMatchesInvocation`, `projectRunEnvironmentRoleEvidence`, `…AtPrefix`) | reads of recorded invocation evidence and role evidence |
| `hog/ccall_lifecycle.ts:481` | whether a C-call needs native instruction assembly |
| `abg/c_call_outcome.ts:1255`, `abg/instruction_assembly.ts:290,429,436` (`framedSynthesisNativeRole`) | framed-synthesis selector role at a locus |

The Run door: `prepareProductRunInvocation`
(`product/run_invocation_operation.ts:606`) calls
`ProductExecutionResolutionPort.resolve` (`:660`); a resolution refusal at
stage `declaration_closure` maps to `invalid_program` (`resolutionRefusalCode`,
`:283-291`); the observation's `unsupported_declaration` maps to
`invalid_program` (`:815`).

Module admission (`gtl/m02` `admitModule`, `validator/raw_admission.ts`) is
structural: GraphFunction `declarations` is a string record, and no key is read
by name there.

### 1.4 Scripts, package metadata, tests

- `T/scripts`, `T/package.json`: nothing names the key or the owner.
- Tests that name `REFUSED_PROGRAM_POLICIES`, `namesRefusedPolicy` or
  `runEnvironmentForProgram`: `t292-td28c-governed-context-policy`,
  `t292-td31-stdo-run-environment-shape`, `t287-c2-core-environment`.
- The refusal lane `t292-td28d-command-forward-refused` names the forward
  value kinds and coordinates, not the key.
- `T/test_env/proof`, `T/test_env/fixtures`: no file carries the key.
- Qualification mirrors (`test_env/qualification/inventory.json`,
  `recipe/verification-recipe.json`, `recipe/expected-output-inventory.json`):
  they name the forward files deleted by TD-28d, not the key. Not edited.

## 2. Recorded history

`rg -uu -l -g '*.json' -g '*.jsonl' -F 'abg.worksite_command_forward'` over the
evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace` (no size cap,
28.6 s): **1,496 files** (635 `*.jsonl`; list `hist-key-files.txt`).

- Every recorded value of the key is the forward module's own:
  13,424 occurrences of
  `"abg.worksite_command_forward":"dependency://abiogenesis/worksite/command-forward/historical-owners@5"`
  (escaped forms included), no other value (`hist-key-values.txt`).
- Owner: 6,338 of those occurrences have the owning GraphFunction's `name`
  within a bounded window on the same line; all are
  `graph-function://abiogenesis/worksite/command-forward@5` (3,169) or
  `…/command-forward/execute@5` (3,169) (`hist-key-owners.txt`). No recorded
  GraphFunction outside the forward module carries the key.
- The files are recorded forward module publications inside Catalogs,
  readiness bases, Public request packets and their results: by name, 93
  `lifecycle-start.request.jsonl`, 80 `after-run-resume.json`, 70
  `prepared-call.json`, 68 `execution.json`, 61 `call-N.jsonl`, 37
  `intake-start.jsonl`, 31 `publication-inputs.json`, 29
  `program-conformance.request.jsonl`, 28 `catalog-admit.request.jsonl`, 27
  `setup-catalog.jsonl`, 11 `runtime.events.jsonl`, and others.
- `T/test_env/proof` and `T/test_env/fixtures`: none.

Evidence-gated inputs (`test_env/support/evidence-gates.json`) that carry the
forward module (`command-forward@5` or `worksite_command_forward`), with the
lanes that read them; each runs on base and final (section 9):

| Evidence gate | Status | Lane |
| --- | --- | --- |
| `s7-pending-consumer-intent` | `runs_with_root` | `t287-continuation-causation` |
| `single-address-space-native-02` | `runs_with_root` | `t287-single-address-space-consolidation` |
| `owned-proof-declaration` | `runs_with_root` | `t287-native-runtime-gate` |
| `producer-acquisition-reuse` | `runs_with_root` | `t287-qualification-producer-acquisition-reuse` |
| `governance-covered-fixture`, `-completed-work` | `runs_with_root` | `t287-governance-covered-source-use` |
| `stdo-proof-entry-run-nine` | `runs_with_root` | `t287-stdo-proof-entry` |
| `owner-history-logical-digest` | `failing_with_input_present` | `t288-logical-prefix-digest` |

`steel03-retained-call` (`w2-steel-single-start-closure`, the TD-27 case) does
not carry the forward module: its readiness basis holds five publications from
September 11 (`order-summary.example/single-start`, C2, consensus,
construction, `conformance/hello-world`).

## 3. Specification and design

No edit (section 1.2). No live specification or kept design text names the
key, the forward module or the list of refused keys; the code comment at the
refusal site states the rule.

## 4. Source

Commit `1f09dea47`. `git diff --numstat b3bcb1303`:

| File | + | − | Change |
| --- | ---: | ---: | --- |
| `code/src/gtl/stdo_run_environment.ts` | 13 | 6 | `REFUSED_GRAPH_FUNCTION_DECLARATIONS = ["abg.worksite_command_forward"]` beside `REFUSED_PROGRAM_POLICIES`; `namesRefusedPolicy(program)` becomes `namesRefusedKey(program, graphFunctions)`: a refused Program policy key, or a refused declaration key on a GraphFunction in `program.callableMembership`. `runEnvironmentForProgram` and `selectorRoleFromBoundDeclarations` pass `publication.graphFunctions`. `validRunEnvironmentProgram` also passes its own `graphFunctions` argument (the callable GraphFunctions of the whole closure) and checks it before the no-environment return. The comment states the rule. |
| `code/src/product/stdo_environment.ts` | 2 | 2 | `observeRunEnvironment` consults `validRunEnvironmentProgram` before its no-environment shortcut instead of after it (the same two lines, moved up). |
| **`code/src` total** | **15** | **8** | |

Why the two lines beyond the list (deviation 1): a Program's callable
GraphFunctions can come from other publications of its closure (the default
library Program calls the native-work, assessment and C2 GraphFunctions).
`runEnvironmentForProgram(publication, program)` sees only the Program's own
publication. `validRunEnvironmentProgram` already filters exactly the callable
GraphFunctions of the closure (`:229` at base), so reading their declarations
there makes Product resolution and conformance refuse a borrowed keyed
GraphFunction. The observation returned before calling it whenever the
Program declares no run environment; with the call moved first it refuses the
same case. For a Program without the key both moves are no-ops:
`validRunEnvironmentProgram` returns `true` whenever `runEnvironmentForProgram`
returns `null` and no callable GraphFunction declares the key, and the
observation's later branches are unchanged.

The refusal reuses the existing codes and messages: no new refusal code, no
new message, no new message kind. None of the messages names "policy":

- publication validation: `invalid_reference` at `$.runEnvironments`,
  "invalid exact STDO environment declaration or Program selection";
- Program validation (conformance, Product resolution, qualification):
  `invalid_reference` at `$.runEnvironments`, "STDO environment must cover
  every supported dependent semantic or worksite leaf exactly once";
- observation: cause `unsupported_declaration` at `/program/runEnvironment`.

They name the run environment, as they already do for the three refused
policy keys. The ruling's condition for a wording proposal (a message that
names "policy") does not hold, so none is made.

Emitted declarations: all 488 `.d.ts` files are byte-identical to base (the
new constant and helper are not exported, the comments are `//`). Two `.js`
files differ: `gtl/stdo_run_environment.js` and `product/stdo_environment.js`.
`npm run build`, `lint:imports`, `lint:lifecycle` and `lint:calculus` exit 0.

### Owner output for every Program without the key

`scripts/differential.mjs` runs, for the ten `gtl` publication constructors and
the structural language fixture, every Program and every leaf locus:
`validRunEnvironmentPublication`, `validatePublication`,
`runEnvironmentForProgram`, `validRunEnvironmentProgram` (own and all
GraphFunctions), conformance evaluation, `observeRunEnvironment` (own and all
GraphFunctions), `runEnvironmentEvidenceMatchesInvocation`,
`projectRunEnvironmentRoleEvidence`, `framedSynthesisNativeRole` and
`nativeContextLeafFamily`. 476 rows; base and final outputs are byte-identical
(`diff/base.jsonl` = `diff/final.jsonl`,
`sha256:6118f75ef7e18ece6efa2b5bd9a22c67d6fd3b82105785a2a428fbbd5c6ce789`; a
second base run is identical). Stop condition 3 does not hold.

### Readers of recorded history that reach the owner

`runEnvironmentEvidenceMatchesInvocation`, `projectRunEnvironmentRoleEvidence`
and `…AtPrefix` (`abg/stdo_environment.ts`), `framedSynthesisNativeRole` (via
`selectorRoleFromBoundDeclarations`) and the native-assembly test in
`hog/ccall_lifecycle.ts:481` read `runEnvironmentForProgram` for the Program of
a recorded or running Run. Their answer changes only for a Program one of
whose callable GraphFunctions declares the key: on recorded data, only the
forward Program. The two recorded forward Runs are already unreadable at base
(TD-28d R1, the odd_glc store refused at row 2474), so no reachable read
changes. Replay and artifact truth are identical (sections 10 and 11).

## 5. Door table

Probe: `scripts/doors.mjs <T> <values.json>` on three builds: `5c9df5056` (the
base of the forward retirement, TD-28d's `base-root` build, read only),
`b3bcb1303` (this package's base, `base-root` copy) and the final build.
Outputs `doors/doors-5c9df5056.txt`, `doors-b3bcb1303.txt`,
`doors-final.txt`: 74 lines each (a header, 71 door rows, 2 shipped-publication
lists); `5c9df5056` against `b3bcb1303` differs in the 4 Product-resolution
rows of the keyed subjects B, C, D and H1 (the forward arm) and in the 2
shipped-publication lists (ten at `5c9df5056` with the forward module, nine
after); `b3bcb1303` against final differs in 34 rows, all on keyed subjects.

Subject: the `recursion@5` Program of the structural language fixture
(`test_env/fixtures/language-structural/program.mjs`; two callable
GraphFunctions, admitted at every door when clean). The key is put on the root
GraphFunction with the forward module's value
(`dependency://abiogenesis/worksite/command-forward/historical-owners@5`), on
the root with an arbitrary value (`td28e://arbitrary-value`), and on the second
callable GraphFunction with the forward value. All three give the same row at
every door on every build.

| Door | `5c9df5056` | `b3bcb1303` (base) | Final |
| --- | --- | --- | --- |
| Module admission (`gtl/m02` `admitModule`) | `raw_admitted_value` | `raw_admitted_value` | `raw_admitted_value` (structural; declarations are a string record) |
| Publication validation (`validatePublication`) | `publication_validation` | `publication_validation` | `static_validation_refusal`, stage `publication`, `invalid_reference` `$.runEnvironments` |
| `catalog.admit` (`CatalogOperationPort.admit`) | passes publication validation and reaches readiness (the probe's basis has no binding or lock: `catalog_construction_refusal` `binding_lock_mismatch`) | the same | `catalog_validation_refusal` with the publication refusal above |
| Conformance evaluation (`gtl_program`) | `gtl_program_conformance_result` | `gtl_program_conformance_result` | `gtl_program_conformance_refusal` `validation_failed`, `invalid_reference` `$.runEnvironments` |
| Product resolution (Catalog, View, `resolveProgramDeclarationClosure`, `constructCatalogProgramValidationInput`, `validateProgram`) | `execution_declaration_closure_refusal` `wrong_owner`, "forward C2 must retain its exact finite no-construction Program and historical-proof marker" | `program_validation` | `static_validation_refusal`, stage `program`, `invalid_reference` `$.runEnvironments` |
| Run-environment observation (`observeRunEnvironment`) | `run_environment_observed` | the same | `run_environment_refusal`, cause `unsupported_declaration`, `/program/runEnvironment` |
| Run door (`prepareProductRunInvocation`, by reading) | resolution refuses at the closure (`wrong_owner`, stage `declaration_closure`) → `invalid_program` at `/program` | resolution and observation admit; the Run proceeds and the GraphFunction runs as an ordinary one | resolution refuses at `validateProgram` (`incompatible_or_unproven`, stage `declaration_closure`, "whole-Program declaration inventory failed static validation", `execution_resolution.ts:773-785`) → `invalid_program` at `/program` (`resolutionRefusalCode`, `run_invocation_operation.ts:283-291, 668-673`); the observation behind it maps `unsupported_declaration` to `invalid_program` too (`:815`) |

The Run door row is by reading: the probe exercises the components Product
resolution calls, in its order, but not `ProductExecutionResolutionPort.resolve`
itself, which needs an installed readiness basis. The `5c9df5056` column agrees
with TD-28d's Return (section 7, last paragraph).

Further subjects (same probe):

| Subject | Door | `5c9df5056` | `b3bcb1303` | Final |
| --- | --- | --- | --- | --- |
| A callable GraphFunction of another closure publication declares the key (the recursion Program's publication is clean; the GraphFunctions handed to the owner carry the keyed copy, as the Run door hands the observation every closure GraphFunction) | `runEnvironmentForProgram` | `null` | `null` | `null` (the publication itself declares no key) |
| | `validRunEnvironmentProgram` | `true` | `true` | `false` |
| | observation | `run_environment_observed` | the same | `run_environment_refusal` `unsupported_declaration` |
| The default library Program over the shipped publications (nine; ten at `5c9df5056`), with the key on the C2 GraphFunction it calls (owned by the C2 publication) | library publication validation | `publication_validation` | the same | the same (the library publication declares no key) |
| | C2 publication validation | `publication_validation` | the same | `static_validation_refusal`, `invalid_reference` `$.runEnvironments` (its own C2 Program calls the GraphFunction) |
| | `catalog.admit` over all publications | reaches readiness | the same | `catalog_validation_refusal` |
| | Product resolution | closure `wrong_owner` (forward arm) | `program_validation` | `static_validation_refusal` stage `program`, `invalid_reference` `$.runEnvironments` |
| The forward publication captured on `5c9df5056` (TD-28d `doors/values.json`; both GraphFunctions carry the key with the forward value) | module admission | `raw_admitted_value` | the same | the same |
| | publication validation | `publication_validation` | the same | `static_validation_refusal` `invalid_reference` `$.runEnvironments` |
| | `catalog.admit` | reaches readiness | the same | `catalog_validation_refusal` |
| | conformance | `validation_failed` (`missing_contract` ×10: the packet carries no C2 contracts) | the same | `validation_failed`: `invalid_reference` `$.runEnvironments` and the same ten |
| | Product resolution (with the captured C2 publication) | `program_validation` (the exact forward Program passes the forward arm) | `program_validation` | `static_validation_refusal` stage `program` |
| | observation | `run_environment_observed` | the same | `run_environment_refusal` `unsupported_declaration` |

The last group is ruling 4's intended refusal: a recorded readiness basis that
contains the forward module is refused when it is admitted anew, at
`catalog.admit` (its publication validation) and, for the forward Program, at
the Run door's Product resolution. By reading, Product resolution of another
Program over such a basis does not reach the forward publication's
declarations: it re-derives the Catalog with `admitGraphFunctionCatalog`
(`product/catalog.ts:446`, no publication validation) and validates only the
selected Program and its closure. The lanes that run over recorded bases
(section 9) are the evidence for kept behaviour.

Controls (admitted at every door on all three builds, identical rows): the
clean Program; an unknown declaration key `abg.td28e_unknown` on the root
GraphFunction; the key as a Program policy (`program.policies`), which shows
that only the GraphFunction-declaration position is read; the default library
Program over the clean shipped publications (`program_validation`).

### Where the position ends (final build, `scripts/borrowed.mjs`)

Output `borrowed/borrowed-final.txt`, run after a fresh `npm run build`.

- **A borrowed keyed GraphFunction always refuses its own publication.** A
  GraphFunction reaches another publication's Program only through its Catalog
  handle. A `graph_function` contribution must name at least one Program of its
  own publication whose `callableMembership` lists it
  (`validator/validation.ts:654-661`, `missing_membership`;
  `product/catalog.ts:762-771`, `invalid_program_membership`). So the owning
  publication has a Program that calls the keyed GraphFunction, and that
  publication's validation refuses it. `catalog.admit` therefore refuses every
  basis that carries a keyed GraphFunction which any Program can call. Probe K
  confirms that no borrowed-only form can be built: with the C2 publication's
  three Programs removed, the C2 publication is refused with `missing_membership`
  with or without the key, and Product resolution with
  `invalid_program_membership`. With the key, the library Program's
  observation also refuses (`unsupported_declaration`).
- **A GraphFunction that a template applies, but no Program lists as callable,
  is outside the position.** Applied GraphFunctions have no Catalog handle
  and appear only in their own publication's templates
  (`template.applications[].leftGraphFunctionRef`). The structural fixture has
  four: `graph-edge/normalize@5`, `graph-edge/render@5`, `substitute/pass@5`
  and `worker-pass@5`. With the key on `graph-edge/normalize@5`, which the
  `graph-edge@5` Program applies, the probe gives the same row as the no-key
  control at every door:
  - `runEnvironmentForProgram` `null`;
  - publication validation `publication_validation`;
  - `catalog.admit` reaches readiness;
  - Product resolution `program_validation`;
  - observation `run_environment_observed`;
  - conformance is refused for both, by the fixture's own `invalid_application`.

  Product resolution's Program-validation input does contain `normalize@5`,
  because the closure follows applications, but `namesRefusedKey` filters by
  `callableMembership`. This follows rulings 1 and 2 ("callable GraphFunctions",
  "only that position"). Every recorded value of the key sits on the two
  callable forward GraphFunctions (section 2). Ruling item 4 (section 15)
  asks whether applied GraphFunctions are inside the position.

## 6. Tests

Commit `5d91c75fb`: three tests added to
`test_env/tests/t292-td28d-command-forward-refused.test.mjs` (+149, no line
removed; the three TD-28d tests are unchanged). They run the doors in-process
over the structural language fixture and the shipped publication constructors;
no model call, no evidence root.

| Test | Asserts |
| --- | --- |
| 4. a Program one of whose callable GraphFunctions declares the forward key is refused at every Program-validating door | for the root GraphFunction with the forward value, the root with an arbitrary value and the second callable GraphFunction with the forward value: module admission `raw_admitted_value`; `runEnvironmentForProgram` `false`; publication validation, `catalog.admit` and conformance refuse with exactly `[invalid_reference, $.runEnvironments]`; Product resolution's path (Catalog, View, `resolveProgramDeclarationClosure`, `constructCatalogProgramValidationInput`, `validateProgram`) refuses at stage `program` with the same pair; the observation refuses with `unsupported_declaration` at `/program/runEnvironment` |
| 5. a callable GraphFunction of another closure publication that declares the key refuses the Program that calls it | the default library Program over the nine shipped publications resolves (control); with the key on the C2 GraphFunction it calls: the library publication validates, the C2 publication is refused, `catalog.admit` is refused, Product resolution of the library Program is refused; the observation is refused when the closure GraphFunctions it is handed carry the key and the Program's own publication does not |
| 6. without the key on a callable GraphFunction the same doors admit the Program | no key, an unknown declaration key, the key as a Program policy: admitted at every door, `catalog.admit` validates and stops at readiness (`binding_lock_mismatch`, the probe basis is empty), the observation returns evidence `null` |

Red at base: the lane at `5d91c75fb` run against the `b3bcb1303` build
(`base-root`, tests file copied in, then restored): 6 tests, 4 pass, 2 fail
(test 4 at its first owner assertion: `runEnvironmentForProgram` returns
`null` where `false` is expected; test 5 at the C2 publication's validation:
no diagnostic where `[invalid_reference, $.runEnvironments]` is expected; the
door probe shows the remaining base rows). Test 6 passes at
base, which is the point of the control. TAP:
`lanes-refusal-base/refused-on-base.tap`. On the final build: 6/6.

## 7. Generated contracts and identity

`npm run build` regenerates `contracts/` and `product-toolchain-manifest.json`;
they are not committed (restored before each commit). Snapshots:
`manifest-base.json`, `manifest-final.json`, `capgraph-base.json`,
`capgraph-final.json`.

| Digest | Base `b3bcb1303` | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:52e13fdc162e1c648e1b8c2c963debc16e26afb4ac77470e7dac9b75ca452f99` | `sha256:02bbd31680649850ea9e74f882c58e57f0ee2dc188c16bfb598208a7494391d6` |
| `contributionManifestDigest` | `sha256:5f5e27d41c18fd2ff303410fee7fd99e8f5ce9ae8c7601dead583891865be679` | `sha256:02c63f6473a644baecb88fb470ae6c9df2f5e4f225cf905970b2174f8bf0b52b` |
| `catalogDigest` | `sha256:e19931bd2c363bec559bb56c31913ec4d551c574a714f97567a55a7e941d5429` | unchanged |
| capability `graphDigest` | `sha256:ade661144125992e920b6bf59b83b54e5fc963f60d96f88074f6ea48a65b5300` | `sha256:6a68af7e91e21133b1695e7c7fa8b67b3da8d31f9a589e7418eeca5532b60161` |

The final manifest after the test commit is byte-identical to the one after the
source commit (`test_env` is not Product content).

- Capability definition graph: 16 rows at base and final; no difference outside
  the identity-following fields `productContentDigest`,
  `capabilityDefinitionRef` and `capabilityDefinitionDigest`
  (`scripts/capgraph-cmp.py`). The rows are unchanged.
- Manifest: only identity-following fields change (the nine publication
  binding digests, the provenance references that carry the content digest);
  locators (5,306), rows (47) and bindings (9) are unchanged.
- Under `contracts/`, only `capabilities/capability-definition-graph.json`
  differs from base.

## 8. Whole-word search at the final commit

`rg -w` over `specification/`, `T/code/src`, `T/scripts`, `T/design` (without
`history/`), `T/package.json` and `T/test_env` (without `test_runs`,
`downstream`, `evidence`):

| Term | Hits |
| --- | --- |
| `abg.worksite_command_forward` | `gtl/stdo_run_environment.ts:35` (the refused list); the refusal lane (`:101` comment, `:108` constant) |
| `REFUSED_GRAPH_FUNCTION_DECLARATIONS` | `gtl/stdo_run_environment.ts:35, 39` |
| `namesRefusedKey` | `gtl/stdo_run_environment.ts:36, 175, 187, 234` |
| `namesRefusedPolicy` | none (renamed; it was module-private) |
| `REFUSED_PROGRAM_POLICIES` | `gtl/stdo_run_environment.ts:34, 37` (unchanged list) |

Test files naming `REFUSED_PROGRAM_POLICIES`, `namesRefusedPolicy` or
`runEnvironmentForProgram`: `t292-td28c-governed-context-policy`,
`t292-td31-stdo-run-environment-shape`, `t287-c2-core-environment` (they name
`runEnvironmentForProgram`; the other two symbols are module-private) and, on
the final commit, the refusal lane. All four run on base and final
(section 9).

## 9. Lanes before and after

Each file ran alone with the rules' command (`scripts/lane.sh`;
`TMPDIR=/private/tmp/abg-td28e-tmp`, `ABI5_EVIDENCE_ROOT` the evidence
root, `--test-concurrency=1`), one after another; base in `base-root`
(`b3bcb1303` build), final in the worktree (final build, final generated files
in place). Columns are tests/pass/fail/skip. TAP: `lanes-base/`,
`lanes-final/`.

| Lane | Base | Final | Change |
| --- | --- | --- | --- |
| `t292-td28d-command-forward-refused` | 3/3/0/0 | 6/6/0/0 | 3 tests added (section 6) |
| `t292-td28c-governed-context-policy` | 3/3/0/0 | 3/3/0/0 | none |
| `t292-td31-stdo-run-environment-shape` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-worksite-command-execution` | 13/13/0/0 | 13/13/0/0 | none |
| `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 | none |
| `steel-basic-cli-c2` | 6/0/0/6 | 6/0/0/6 | none |
| `t292-td34a-run-invocation-schema-owner` | 4/4/0/0 | 4/4/0/0 | none |
| `t288-instruction-assembly-owner` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-stdo3-run-environment` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 | none |
| `t287-gtl-serialization-publication` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-qualification-scopes` | 24/24/0/0 | 24/24/0/0 | none |
| `t287-continuation-causation` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-native-runtime-gate` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-qualification-producer-acquisition-reuse` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-governance-covered-source-use` | 9/7/0/2 | 9/7/0/2 | none |
| `t287-stdo-proof-entry` | 3/3/0/0 | 3/3/0/0 | none |
| `t288-logical-prefix-digest` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-single-address-space-consolidation` | 17/17/0/0 | 17/17/0/0 | none |
| `t287-native-workspace-work` | 43/43/0/0 | 43/43/0/0 | none |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 | none |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | none |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | none |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | none |
| `r4-catalog-admission` | 8/8/0/0 | 8/8/0/0 | none |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | none |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | none |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | none |
| **Total** | **261/249/0/12** | **264/252/0/12** | |

- Per case, the sorted `ok` / `not ok` / `SKIP` lines are identical base to
  final in every lane except the refusal lane, which gains its three tests.
  The base row of the refusal lane is the base file; the new file on the base
  build is 6/4/2/0 (section 6).
- No timeouts, no cancellations, no reruns.
- The 12 skips are the same cases on both builds, each gated by an unset
  selection variable (`ABI5_C2_CARRIER_FIXTURE_PATH` ×6,
  `ABI5_CONTEXT_PUBLIC_PROOF`, `ABG_GOVERNANCE_COVERED_PROOF_ROOT`,
  `ABG_GOVERNANCE_COVERED_C2_MATERIAL_SELECTORS`, `ABI5_OWNER_HISTORY`,
  `ABI5_DEFAULT_LIBRARY_LIVE`, `ABI5_SELECTED_ACTION_OWNER_SUBJECT`).
- The known red of `t287-cross-cut-public-read` (read count) did not occur on
  either build in this run.
- Ruling 4: every lane whose evidence-gated inputs carry the forward module
  (section 2) passes on the final build with the same cases as base. No kept
  lane re-admits a forward-bearing basis through a door that now refuses it;
  the stop condition does not hold.

## 10. Replay comparison

`scripts/replay-log.mjs` (TD-28d's script, copied) over the 34 logs of
`replay-set.txt`: TD-28d's 33 (the r10 proof log taken from this worktree) and
the 2,474-row readable prefix of the odd_glc store
(`/private/tmp/abg-td28d-work/hist/odd-glc-d1-04-readable.events.jsonl`, read
only), which carries forward-bearing basis rows (rows 2469 and 2472). Per log:
the whole-log replay digest, event-kind counts, owner facts and the per-Run
replay against full authority.

| | Base | Final |
| --- | --- | --- |
| logs that decode | 12 (20,373 rows: TD-28d's 11 with 17,899 rows, and the odd_glc prefix) | the same 12 |
| logs refused at decode | 22: 19 "event stamp differs from the exact native profile schedule", 2 "durable ABG event log contains a noncanonical event", 1 "runtime event payload matches no admitted event-contract variant" | the same 22, same messages |
| output | `replay/replay-base.jsonl`, `sha256:fe41f0cec370b7da28df5b03160eac476c4511b320f002f5e1a81ba363cf2ef7` | `replay/replay-final.jsonl`, byte-identical (`cmp`) |

The refused-at-decode set and messages are TD-28d's; this package moves none.
The history readers of section 4 change their answer only for a Run whose
Program calls a keyed GraphFunction; no decodable recorded Run has such a
Program (the forward Runs lie past the odd_glc refusal row), so the
forward-bearing basis rows replay to the same values.

## 11. Artifact truth over recorded stores

`scripts/probe-artifact-truth.mjs` over the 34 logs of `truth/truth-set.txt`
(a copy of the rc.12 Run store, `sha256:440994c0…6511`, equal to the live
store, and the replay set without the live path): 12 project
`artifact_truth_projection` and 22 are refused at decode (the same 22 as
section 10), on both builds; `truth/truth-base.jsonl`
(`sha256:0466df8814f259e4d44f1b2834d64687b353fe5e89aa26e1a687899a993a4fad`)
and `truth/truth-final.jsonl` are byte-identical.

| Store | Base | Final |
| --- | --- | --- |
| rc.12 Run store (1,695 rows, 3 artifact admissions; row 0 names the forward module) | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | same |
| rc.12 locks (`scripts/probe-lock.mjs`): one inline lock (rows `typescript-tenant@5.0.0-rc.12`, `default-library-witness/consumer@5`) and one lock reference | `isResolvedProductLock: true`, no capability mismatch | same (byte-identical output) |
| odd_glc readable prefix (2,474 rows, 13 artifact admissions; rows 2469 and 2472 name the forward module) | `sha256:7cdcccd7c6c26ea42d99010848867c1cdad45977c2cb1086e5433c33980c5f71`; 9 inline locks resolved, 0 mismatches | same (byte-identical outputs) |

The digests equal TD-28d's (its section 12). Recorded history is read, not
re-admitted: the truth and lock owners compare a recorded lock with the
recorded manifest it names and do not validate recorded publications. The
five artifact-truth lanes pass on both builds (section 9).

## 12. Size

`git diff --numstat b3bcb1303` at the test commit:

| Area | + | − |
| --- | ---: | ---: |
| `T/code/src` | 15 | 8 |
| `T/test_env` | 149 | 0 |
| `specification/`, `T/design` | 0 | 0 |

## 13. Deviations

1. **Two lines beyond the refused list.** The brief asks for the key in the
   owner's list and the owner reading GraphFunction declarations.
   `validRunEnvironmentProgram` also checks the closure GraphFunctions it is
   given, and `observeRunEnvironment` calls it before its no-environment
   shortcut. Without them a Program whose own publication is clean but which
   calls a keyed GraphFunction of another closure publication is admitted at
   Product resolution and the observation (door table, subjects G and H1).
   The differential (section 4) shows no change for any Program without the
   key. A ruling may keep the narrower form (own publication only); the two
   borrowed-callable rows then stay admitted.
2. **Run door by reading.** The Run door row is read from
   `prepareProductRunInvocation` and `resolutionRefusalCode`, with the
   components Product resolution calls probed in its order. The full
   `ProductExecutionResolutionPort.resolve` needs an installed readiness basis
   and was not driven.
3. **Base lanes in a copy.** Base lanes ran in `base-root`, an rsync copy of the
   worktree at `b3bcb1303` with its own build, so the worktree stays on the
   branch. The red-at-base run copied the new lane in and restored it after.
4. **Background waits.** The Bash tool moves a foreground command to the
   background after 180 s. The lanes therefore ran as sequential background
   jobs (one `node --test` process at a time, each started after the previous
   one exited), awaited with until-loops on the job output; no two test files
   ran at once.
5. **Commit order.** The Return skeleton (census and recorded history) was
   committed first, before the source commit, so the census is fixed at base;
   the completed Return is the last commit.

## 14. Qualification mirror

Members changed (not edited in the mirrors, by the rules):
`code/src/gtl/stdo_run_environment.ts`, `code/src/product/stdo_environment.ts`,
`test_env/tests/t292-td28d-command-forward-refused.test.mjs`.

## 15. Residuals and items for a ruling

No residual defect. Stop conditions: none holds (ruling 4: no kept lane fails;
no new refusal code; the differential shows no change for any Program without
the key).

For a ruling:

1. Deviation 1 (the closure check in `validRunEnvironmentProgram` and the
   observation order). Keep, or narrow to the Program's own publication.
2. Wording: the existing messages name the run environment ("invalid exact
   STDO environment declaration or Program selection", "STDO environment must
   cover every supported dependent semantic or worksite leaf exactly once",
   `unsupported_declaration` at `/program/runEnvironment`), not "policy". No
   wording is proposed. They do not name the refused key; a reader learns the
   reason from the code comment, as for the three refused policy keys.
3. Recorded forward-bearing bases (1,496 evidence-root files, among them 28
   `catalog-admit.request.jsonl` and 29 `program-conformance.request.jsonl`)
   are refused when submitted anew to `catalog.admit`, conformance or, for the
   forward Program, the Run door. This is ruling 4's intended outcome; no kept
   lane submits one.
4. Applied GraphFunctions (section 5, "Where the position ends"). The key on a
   GraphFunction that a Program's template applies, but that is in no
   `callableMembership`, is admitted at every door, as rulings 1 and 2 scope
   it. If the ruling wants it refused, the smallest change is:
   - `namesRefusedKey` reads every GraphFunction of the closure input it is
     given (Product resolution's input already contains the applied ones);
   - `runEnvironmentForProgram` follows `template.applications` within the
     publication, so publication validation and `catalog.admit` refuse too.

   Both use the existing codes. No recorded value sits on an applied
   GraphFunction. Not changed here.

## 16. Commits

On `claude/td28e-forward-key-refused` from `b3bcb1303`, in order:

1. `1f7dfe6a4` TD-28e Return skeleton: census and recorded history of the
   forward declaration key
2. `1f09dea47` TD-28e: refuse the forward declaration key on a Program's
   callable GraphFunctions
3. `5d91c75fb` TD-28e tests: the forward declaration key is refused at every
   Program-validating door
4. `14c70d81c` TD-28e Return: door table, lanes, replay and artifact truth
5. this amendment: where the position ends (borrowed and applied
   GraphFunctions), the status line, ruling item 4

Generated files (`contracts/`, `product-toolchain-manifest.json`,
`test_env/fixtures/abi5-root-candidate-basis.json`) are not committed. No push,
no tag.
