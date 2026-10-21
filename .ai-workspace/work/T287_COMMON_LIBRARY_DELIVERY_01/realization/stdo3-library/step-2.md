# Step 2. Carrier and layering

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 2.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant. No review at this step.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 2.
Outcome: `shared/` imports only `shared/` and packages; the structural refusal
carrier exists; the two exact-prefix binders live in `abg/`; exact match lives
in `shared/select/`; the owner contract source set is out of `shared/`; an
executable import-direction check enforces the layering. Change class:
`realization_refactor`. One commit on `main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the latest step 1 commit in the plan's ledger row (after its repairs).
Tenant root: `build_tenants/abiogenesis/typescript`; source: `code/src`.
Frames: `f-law`, `f-checks`, `f-claim` from
`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`.
Design authority: `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§2 (organization and dependency direction), §3 (carrier set) and §4
(families); read those three sections, not the whole document.

**Census the Executive already made (at `93a4b08df`; re-verify cheaply).**

- Upward imports inside `shared/`: `shared/definition_binding_mechanics.ts:2`
  imports `../product/exact_match.js`; `shared/static_definition_bindings.ts:17-18`
  imports `../abg/definition_event_resource.js` and `../abg/event_store.js`,
  used only by `bindExactPrefixRead` (line 188) and `bindExactPrefixTransition`
  (line 244), not by `bindStaticOwner` (line 109);
  `shared/owner_contract_source_set.ts:2-19` imports thirteen contract modules
  from `abg/`, `product/` and `validator/`.
- `shared/public_function_family.ts:6-15` imports from
  `./owner_contract_source_set.js`; it is imported by `shared/definition_binding_mechanics.ts`,
  `shared/public_function_projections.ts` and six modules above `shared/`.
  `shared/public_function_contracts.ts`, `shared/public_invocation.ts` and
  `shared/public_function_projections.ts` import nothing upward;
  `public_function_contracts` has about fifty importers and stays where it is.
- Importers of the two prefix binders: `owner_bindings/run_invocation.ts`,
  `product/release_snapshot_definition_bindings.ts`,
  `product/project_read_definition_bindings.ts`, `abg/project_read_definition_bindings.ts`.
- Importers of `product/exact_match.js`: `product/execution_resolution.ts`,
  `product/implementation_resolution.ts`, `shared/definition_binding_mechanics.ts`.
- Importers of `shared/owner_contract_source_set.js`:
  `public/installed_definition_call_transport.ts`, `shared/public_function_family.ts`.
- Tests importing moved modules through `build/`:
  `test_env/tests/t287-w2-05-static-binding-algebra.test.mjs` (lines 34, 38, 266-267, 502-503),
  `test_env/tests/m5-s06-prime.test.mjs` (line 30),
  `test_env/tests/t287-wave2-owner-contract-source-set.test.mjs` (lines 15, 32),
  `test_env/tests/t287-common-computational-library.test.mjs` (line 4).
- Constitution location strings naming `product/exact_match.ts`:
  `design/ABI5_REALIZATION_CONSTITUTION.md` lines 2595 (Table 5.6.3-B `N06`)
  and 3514 (§10 exact-match cardinality). Location strings only; no law text.
- `scripts/lint-verification.mjs` is a recipe runner (takes a recipe path), not
  a linter. The import-direction check is a new script.

**What changes.**

1. New `shared/refusal.ts`: `StructuralRefusal`, `Outcome<A>`, `ok`, `refused`,
   `then`, exactly as design §3 and §4 type them. No consumers yet; steps 3
   to 5 consume it. Frozen values, no I/O, no classes.
2. Move `product/exact_match.ts` to `shared/select/exact_match.ts` unchanged.
   Leave `product/exact_match.ts` as a one-line re-export of the new path until
   step 5 removes it. Update the three importers to the new path. Update the
   two constitution location strings to `shared/select/exact_match.ts`.
3. Move `bindExactPrefixRead` and `bindExactPrefixTransition`, with the `abg`
   imports they alone use, to new `abg/exact_prefix_bindings.ts`. The exported
   signatures and behavior are unchanged. `shared/static_definition_bindings.ts`
   keeps `bindStaticOwner` and no `abg` import. Update the four importers and
   the test `t287-w2-05-static-binding-algebra.test.mjs` import lines.
4. Take `owner_contract_source_set.ts` out of `shared/`. The cut is yours:
   either move it to `public/` and move `public_function_family.ts` (and
   `public_function_projections.ts` if required) with it, updating their
   importers; or split it so the types `public_function_family.ts` needs stay
   in a new `shared/` module with no upward import, and the value table with
   its thirteen contract imports moves to `public/`. Choose the cut that
   leaves the three binders (`bindStaticOwner`, `bindExactPrefixRead`,
   `bindExactPrefixTransition`) and `definition_binding_mechanics.ts` with no
   upward import and changes the fewest importers. State the cut and the
   resulting placement of every moved module in Return.
5. New `scripts/check-import-direction.mjs`: for every `.ts` under
   `code/src/shared/`, any `from "../<dir>/..."` where `<dir>` is not `shared`
   is a violation; print offenders as `path:line: import`; exit 1 on any.
   Add `"lint:imports": "node scripts/check-import-direction.mjs"` to
   `package.json`. The check must pass at your commit.
6. Public surface unchanged: the exports of `code/src/public/index.ts` and
   `code/src/index.ts` keep the same names and signatures.
7. Constitution amendment record, once, on that single surface
   (`design/ABI5_REALIZATION_CONSTITUTION.md` §16 "Amendment Rule", lines
   about 4117 to 4130: an amendment records reason, upstream basis,
   superseded clause, affected catalog/entity rows and migration
   consequences; callable location is `realization_refactor`, catalog law is
   `design_reframe`). Add `### 16.8 T-287 Common Library Operator-Family
   Amendment Record` in the same field table form as §16.7, covering two
   things: (a) the `realization_refactor` moving `N06`'s callable from
   `product/exact_match.ts` to `shared/select/exact_match.ts` (update the two
   location strings at lines about 2595 and 3514 in the same commit); (b)
   the `design_reframe` that the accepted library design
   (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, its
   catalog table in §10) adds to the catalog: list the added callables with
   their `catalog_reuse` / `catalog_extension` / `catalog_addition_proposal`
   class as the design states them, each with the plan step that realizes it.
   Do not change §5.6.1, §5.6.2C, or any law text; the record cites the
   design document as upstream basis. If the design's catalog table is
   absent or inconsistent, record only (a) and state the gap in Return.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/**`,
`code/src/abg/exact_prefix_bindings.ts` (new), `code/src/public/**` as the cut
requires, the importer files named above and any importer the cut requires
(list each in Return), the four test files' import lines only,
`scripts/check-import-direction.mjs` (new), `package.json` (one script line),
the two constitution location strings plus the new §16.8 record, and the build outputs the gate
regenerates (`build/**`, `contracts/**/*.json`, `product-toolchain-manifest.json`),
which are committed with the source because the tree tracks them. Plus this
file's `## Return`. Nothing else: no design text, no ticket, no GOALS, no
behavior change in any moved function.

**Gate** (run in `build_tenants/abiogenesis/typescript`, in this order, all
must pass): `npm run build`; `npm run lint:imports`; `npm run test:installed:language`.
Record each command's exit code and wall time in Return. The smoke takes
about 46 s and the build about 34 s at the baseline.

**Self-check before the commit:** (1) `grep -rn 'from "\.\./\(abg\|product\|hog\|gtl\|validator\|implementation\|public\|app\|owner_bindings\|qualification\)/' code/src/shared` returns nothing; (2) `grep -rn "product/exact_match.js" code/src` shows only the re-export shim's own path references, none in `shared/`; (3) `grep -n "bindExactPrefix" code/src/shared/static_definition_bindings.ts` returns nothing; (4) the public index exports are unchanged (`git diff code/src/public/index.ts code/src/index.ts` shows only import-path changes, no export changes); (5) the gate passed; (6) `grep -n "product/exact_match.ts" design/ABI5_REALIZATION_CONSTITUTION.md` shows the path only inside the §16.8 record.

**Return contract.** Stage by path (never `git add -A`), commit on `main`, no
push. Message first line `Step 2: refusal carrier and layering; shared/ imports only shared/`,
short body naming the cut, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Append to this file:

```
## Return
- commit: <hash>
- cut: <which option in rule 4, one paragraph>
- moved modules: <from -> to>, one per line
- changed importers: <path>, one per line
- gate: build <rc, s>; lint:imports <rc>; test:installed:language <rc, s, pass/fail counts>
- self-check: 1..6 with result
- constitution: §16.8 written (a and b, or a only with the gap named)
- residuals: anything you could not do inside the grant, with the exact reason
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing and write the reason under
`## Return` if: (a) the three binders or `definition_binding_mechanics.ts`
cannot be left in `shared/` without an upward import under either cut; (b)
the gate fails after one bounded fix attempt; (c) a public export name or
signature would have to change.

ACTION: execute step 2 as activated.

## Return

- commit: none. Stopped under stop contract (a) before any edit; working tree unchanged at `3614749ed` (source = `97b1200bc`).
- cut: neither. Under both cuts, `shared/` keeps an upward import while `definition_binding_mechanics.ts` stays in `shared/`. The cause is a runtime value dependency, not types. On the live path of the exported `admitExactDefinitionCall` (`shared/definition_binding_mechanics.ts:325`), the function reads three instantiated Public values: `PUBLIC_FUNCTION_DEFINITION_FAMILY` through `selectedDefinition` (`:337` -> `:122`), `PUBLIC_OPERATION_CONTRACT_PROJECTIONS` (`:380`, and `:167` via `expectedContractCoordinates` at `:388`) and `PUBLIC_PROJECTION_PAYLOADS` (`:170`, `:384`, `:394`). `bindStaticOwner` calls `admitExactDefinitionCall` (`shared/static_definition_bindings.ts:124`). `PUBLIC_FUNCTION_DEFINITION_FAMILY = constructFamily()` (`shared/public_function_family.ts:467`) maps the value `OWNER_CONTRACT_SOURCES` (`:343`). That table is computed at module load from the thirteen owner contract roots that `owner_contract_source_set.ts:2-19` imports. `PUBLIC_PROJECTION_PAYLOADS` (`public_function_projections.ts:797`) is built over the family.
  - Cut A moves `owner_contract_source_set`, `public_function_family` and `public_function_projections` to `public/`. `definition_binding_mechanics.ts:29-34` then imports `../public/public_function_family.js` and `../public/public_function_projections.js` by value: a direct upward import, which is stop (a).
  - Cut B leaves the types in a new `shared/` module and moves the value table to `public/`. `public_function_family.ts` needs the value `OWNER_CONTRACT_SOURCES`, not only types, so it would import `../public/owner_contract_source_set.js`. `lint:imports` and self-check 1 fail. Removing that edge means moving the family as well, which is cut A.
  - Result: every arrangement that passes `lint:imports` requires `definition_binding_mechanics.ts`, and through it `bindStaticOwner`, to import from `public/`.
  - Injection is not a Worker fix. Passing the family in as a parameter, or registering it in a `shared/` slot at module load, changes the signature or behavior of `admitExactDefinitionCall`, which has 14 importers. It also contradicts design §4.5 ("every captured owner function, schema and packet is a direct import").
- moved modules: none
- changed importers: none
- gate: not run; nothing changed.
- self-check: 1..6 not applicable; nothing changed.
- constitution: §16.8 not written; no location strings changed.
- residuals:
  - Census gap: the census at `93a4b08df` counted direct imports only. `public_function_contracts`, `public_invocation` and `public_function_projections` are clean as direct imports. `public_function_projections` and `definition_binding_mechanics` still depend by value on all thirteen owner contract tables, through `public_function_family` -> `owner_contract_source_set`.
  - Design gap (`design_reframe`; design text not edited): design §2 move 3 relocates only the source set, which leaves `shared/public_function_family.ts` importing `../public/`. §2 also says the Public contract modules "obey the same import direction". Neither holds while the `binding` family's call admission reads the instantiated Public family. The order `refusal <- value <- admit <- select <- {binding, process} <- ... <- owners` places `binding` below the owners. The code has binding call admission above every owner's contract table and below every owner's definition-binding module. The design must choose one of two placements. (i) Call admission, the binders and the Public family modules form a layer above the owner contract tables, outside `shared/`. (ii) Call admission stops reading the instantiated family. That is a semantic change, because `sourceModuleDigest`, `familyDigest` and the projection asset digests range over the whole set, so they cannot be derived from one packet.
  - Items without a blocker: changes 1 (`shared/refusal.ts`), 2 (`exact_match` to `shared/select/`, plus the two constitution location strings and §16.8 (a)) and 3 (prefix binders to `abg/exact_prefix_bindings.ts`) are independent of this blocker. The Executive could re-activate them as a narrower step. Change 5 could then land only with a named exception for the source-set/family edge, and that exception changes the stated outcome. Not performed.
  - Note for change 3, if re-activated: `t287-w2-05-static-binding-algebra.test.mjs` does more than import from the moved module. At `:264-268` it asserts `Object.keys(bindings)` equals all three binder names. At `:652-657` it chains `observedSource('shared/static_definition_bindings', ...)` into `owner_bindings/run_invocation` through the override key `'../shared/static_definition_bindings.js'`. After the move, this needs a three-level chain through `abg/exact_prefix_bindings`. That is more than "import lines only", so the grant should name it.
- return route: this file

## Re-activation (Executive decision, 2026-10-22)

The Return above is accepted: the census counted direct imports only, and
`admitExactDefinitionCall` reads the instantiated Public family at run time
(`sourceModuleDigest`, `familyDigest` and the projection asset digests range
over the whole owner set). Placement (ii) is a semantic change and is
refused. Placement (i) is decided as a `design_reframe` under the pen: the
`binding` family is Public-owned and sits above the owner contract tables,
in `public/binding/`. `shared/` keeps only modules with no upward
dependency by import or by value. Everything in `## Activation` stands
except as amended here. Worker: Opus 5.5, xhigh, fresh context, Writer
grant. Change class of the step: `design_reframe` (this placement) plus
`realization_refactor`.

**Rule 4 is replaced.** Move five modules from `code/src/shared/` to
`code/src/public/binding/`, unchanged except import paths:
`owner_contract_source_set.ts`, `public_function_family.ts`,
`public_function_projections.ts`, `definition_binding_mechanics.ts`, and
`static_definition_bindings.ts` after rule 3 has taken the two prefix
binders out of it. `effect_definition.ts` (imports only Effect and
`./canonical_json.js`), `public_function_contracts.ts`,
`public_invocation.ts`, `operation_definition_coordinate.ts` and
`capability_contracts.ts` stay in `shared/`. Update every importer; the
Executive's census at `97b1200bc`: `definition_binding_mechanics` 15
importers, `static_definition_bindings` 5, `public_function_family` 9,
`public_function_projections` 5, `owner_contract_source_set` 2, overlapping;
and 12 test files under `test_env/tests` name one of these modules through
`build/`. List each changed file in Return.

**Rule 3 stands** with this placement: `abg/exact_prefix_bindings.ts`
imports `bindStaticOwner` from `../public/binding/static_definition_bindings.js`
and the two `abg` store modules. Its four importers change their path. The
grant for `t287-w2-05-static-binding-algebra.test.mjs` is widened beyond
import lines: adapt the module-shape assertion at lines 264 to 268 (the
three binder names now span two modules) and the override chain at lines
652 to 657 to the new layout, preserving what each assertion proves. State
both edits in Return.

**Design amendment, bounded to these lines.** In
`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`: (1) the §2
table row `shared/binding/` becomes `public/binding/`, role "lift at Public",
imports `refusal`, `admit`, `shared/effect_definition.ts`, and the owner
contract tables through the Public family; (2) the §2 row
`abg/exact_prefix_bindings.ts` imports `public/binding/` and
`abg/event_store.ts`; (3) the order line becomes
`refusal <- value <- admit <- select <- process <- abg/calculus <- owner contract tables <- public/binding <- owner definition-binding modules <- entrypoints`,
followed by one sentence: owner contract tables live in owner directories
and are data; owner definition-binding modules live in owner directories
and are Public-surface compositions; the lint applies to `shared/`;
(4) move 3 names the five modules and `public/binding/`; (5) in "Existing
shared modules take these places", the `binding` bullet says
`effect_definition.ts` is the `shared/` member of the `binding` family and
the other members are in `public/binding/`, and the Public contract modules
bullet drops `public_function_family.ts` and `public_function_projections.ts`;
(6) §4.5 heading `Lift: \`public/binding/\`` and its first sentence name the
new location; the sentence "every captured owner function, schema and packet
is a direct import" stays; (7) §10.6 row 1 `U(B)` gains the decided
relation: "placement of call admission: `public/binding/`, above the owner
contract tables, decided by the Executive at step 2 (2026-10-22) because
`admitExactDefinitionCall` reads the instantiated family, whose digests range
over the whole owner set"; sequencing stays. Nothing else in the design
changes; list each changed line in Return. `ABI5_STDO3_COMPUTATIONAL_BINDING.md`
names no location for these modules and is not touched. The constitution
has no location string for any of the five modules (verified by the
Executive); rule 7's §16.8 record is unchanged, and (a)'s migration
consequences may say in one line that the binding family's modules moved
under this design.

**Grant additions:** `code/src/public/binding/**` (new), every importer the
move requires, the 12 test files' import lines, the two widened edits in
`t287-w2-05-static-binding-algebra.test.mjs`, and the seven design edits
above.

**Self-check 7:** `grep -rn "shared/\(static_definition_bindings\|definition_binding_mechanics\|public_function_family\|public_function_projections\|owner_contract_source_set\)" code/src test_env design` returns nothing in `code/src` or `test_env`, and in `design/` only the §2 move list's source paths.

**Stop contract (a) is replaced:** stop if a module in `public/binding/`
would have to import from `app/`, `public/cli.ts`, `public/codex_cli.ts` or
`public/index.ts` (a cycle), or if `effect_definition.ts` needs an upward
import. (b) and (c) stand.

Commit message first line: `Step 2: refusal carrier and layering; binding family to public/binding/`.

ACTION: execute step 2 as re-activated.

## Return

- commit: the commit that carries this section, first line `Step 2: refusal carrier and layering; binding family to public/binding/`. A commit cannot name its own hash, so the hash is in the Worker's report to the Executive.
- cut: re-activation placement (i). First, rule 3 split `static_definition_bindings.ts`. The two prefix binders moved to the new `abg/exact_prefix_bindings.ts`, together with:
  - their private helpers: `samePrefix`, `sameStore`, the two Reopen types, `EMPTY_PREFIX_DIGEST`, `admittedEventReceipt`, `exactReadReceipt` and `exactTransitionReceipt`;
  - the imports only they use: `node:path`, `node:url`, `sha256Bytes` and the two `abg` modules.

  The new module imports `definitionFault` and `bindStaticOwner` from `public/binding/`. The five modules then moved from `shared/` to `public/binding/` with only their import paths changed. Every function body is byte-identical to `97b1200bc`, checked by diff. `shared/` now holds 16 modules, and none imports outside `shared/`. `effect_definition.ts` needed no change. No module in `public/binding/` imports `app/`, `public/cli.ts`, `public/codex_cli.ts` or `public/index.ts`, so stop (a) as replaced was not met.
- moved modules:
  - `code/src/product/exact_match.ts` -> `code/src/shared/select/exact_match.ts`. The old path is now the one line `export * from "../shared/select/exact_match.js";`.
  - `code/src/shared/owner_contract_source_set.ts` -> `code/src/public/binding/owner_contract_source_set.ts`
  - `code/src/shared/public_function_family.ts` -> `code/src/public/binding/public_function_family.ts`
  - `code/src/shared/public_function_projections.ts` -> `code/src/public/binding/public_function_projections.ts`
  - `code/src/shared/definition_binding_mechanics.ts` -> `code/src/public/binding/definition_binding_mechanics.ts`
  - `code/src/shared/static_definition_bindings.ts` -> `code/src/public/binding/static_definition_bindings.ts`, which keeps `bindStaticOwner` only.
  - `bindExactPrefixRead` and `bindExactPrefixTransition` -> `code/src/abg/exact_prefix_bindings.ts` (new).
  - New modules: `code/src/shared/refusal.ts` and `scripts/check-import-direction.mjs`.
- changed importers:
  - `code/src` (23 files):
    - `abg/project_read_definition_bindings.ts`
    - `abg/witness_definition_bindings.ts`
    - `app/m04.ts`
    - `implementation/release_publication.ts`
    - `owner_bindings/run_invocation.ts`
    - `product/admission_authority.ts`
    - `product/catalog_definition_bindings.ts`
    - `product/declaration_application.ts`
    - `product/environment_definition_bindings.ts`
    - `product/execution_resolution.ts`
    - `product/implementation_resolution.ts`
    - `product/install_definition_bindings.ts`
    - `product/invocation.ts`
    - `product/project_read_definition_bindings.ts`
    - `product/project_read_ports.ts`
    - `product/public_contract_publication.ts`
    - `product/release_snapshot_definition_bindings.ts`
    - `product/verification_definition_bindings.ts`
    - `product/verify_product.ts`
    - `public/index.ts`
    - `public/installed_definition_call_transport.ts`
    - `public/installed_public_definition_call.ts`
    - `validator/conformance_definition_bindings.ts`
  - Scripts:
    - `scripts/generate-product-manifest.mjs`: two import lines. Without them, `npm run build` fails after `clean`.
    - `package.json`: one script line.
  - Test support: `test_env/support/witness-reprice-mechanics.mjs`, three import lines.
  - Tests, import lines or `build/` path strings only:
    - `m5-s06-prime` :30
    - `r10-projection-contracts` :16
    - `t287-common-computational-library` :3-4
    - `t287-cross-cut-public-read` :16
    - `t287-pfc-f08a-product-verification-boundary` :25
    - `t287-st2a-g-capability-definition-graph` :14
    - `t287-w2-05-install-catalog-owner-chain` :1634, a `readFile` path in its legacy-pattern scan.
    - `t287-w2-05-generator-package-reproducibility` :30, the pinned `sharedProjectionOwner` value that the generator-import assertion compares, and :76-77.
    - `t287-wave2-owner-contract-source-set` :15 and :32
    - `t288-admission-predicates` :11
  - Tests, path-only override keys and `load` paths: `t287-conformance-owner-reuse` :71, :86 and :90, and `t287-malformed-gtl-gate` :87. Each key now equals the specifier the observed module writes. I checked this mechanically; these two files were not run.
  - `t287-w2-05-static-binding-algebra`, under the widened grant (new line numbers):
    - Imports (:34, :36-41, :43-45): two namespaces, `staticBindings` and `prefixBindings`, plus `const bindings = Object.freeze({ ...staticBindings, ...prefixBindings })`. The call sites at :506-507, :558, :584 and :597 are unchanged.
    - Module-shape assertion (:269-273): it now asserts each module's exact key set, `["bindStaticOwner"]` and `["bindExactPrefixRead","bindExactPrefixTransition"]`. This still proves exactly three combinators and no fourth.
    - Override chain (:656-662), now three levels:
      - `public/binding/static_definition_bindings` with the counting `./definition_binding_mechanics.js`;
      - then `abg/exact_prefix_bindings` over that, through `../public/binding/static_definition_bindings.js`;
      - then `owner_bindings/run_invocation` over `../abg/exact_prefix_bindings.js`.
    - Transport override key (:665): `./binding/definition_binding_mechanics.js`.
    - Run once: 3 pass, 0 fail, and 2 skips that existed before and are env-gated. The admission observations read `before [0,1]` and `after [0,1]`, so the counter chain applies.
- gate:
  - build: rc 0, 32.1 s.
  - lint:imports: rc 0, 0.1 s, 16 modules.
  - test:installed:language: rc 0, 45.1 s, 1 pass, 0 fail.
- self-check:
  1. Pass. No match. No `../../` specifier exists under `shared/select/` either.
  2. Pass. `product/exact_match.js` appears nowhere in `code/src`.
  3. Pass, run on the new path, because the named file no longer exists in `shared/`. `bindExactPrefix` does not appear in `public/binding/static_definition_bindings.ts`.
  4. Pass. `public/index.ts` changes only two `from` paths, to `./binding/public_function_family.js` and `./binding/public_function_projections.js`. `code/src/index.ts` is unchanged.
  5. Pass (gate above).
  6. Pass. `product/exact_match.ts` appears only inside §16.14, in its superseded clause and migration consequence.
  7. Pass, with one named exception. I ran it with `git grep`, because the ignored `test_env/test_runs/` and `test_env/uat/runs/` hold old run copies.
     - In `design/`, the only hits are the §2 move list: move 1 at line 59 and move 3 at line 61.
     - Exception: `test_env/fixtures/continuation-causation.json` :8022, :8032 and :8037. These are the `declarationPath` strings of a recorded historical install, stored next to their digests; `t287-continuation-causation` checks `sha256Canonical(program)` against the fixture. The file is evidence, not an importer, and was not edited.
- constitution: the record is §16.14, not §16.8. §16.8 already exists as the W2-05 review-compression record, followed by §16.9 to §16.13. §16.14 records both (a) and (b).
  - (a) The location strings at lines 2595 (`N06`) and 3514 (§10 exact-match cardinality) now read `shared/select/exact_match.ts`. The migration consequence states in one sentence that the binding family's modules moved.
  - (b) It lists every design §10.7 row with its disposition. Each row cites the design §10.1 row that realizes it, not a plan step, because the plan post is outside my read set.
- design: 22 changed lines in `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` (`--numstat`: 12 inserted, 10 deleted). Old line numbers:
  - :44, edit 1.
  - :47, edit 2.
  - :52, plus one new paragraph after the code block, edit 3.
  - :59, edit 4.
  - :69 and :72, edit 5.
  - :201, and the first sentence at :203, edit 6. `runExactDefinition` and `runEffectProgram` live in `shared/effect_definition.ts`, so the sentence places only `bindStaticOwner` in `public/binding/`.
  - :634, edit 7.
  - Beyond the seven edits, link targets only, required by self-check 7:
    - :203: the `static_definition_bindings.ts` link now points to `public/binding/`, and the cited lines are recomputed to 47-58 and 66-77.
    - :747: the §11 "Static binders" link.
- build outputs: 15 tracked outputs were regenerated and committed. Most of their diff predates this step. The tracked outputs were last refreshed at `67c333799`, and step 1 did not refresh them; examples are `abg/actor_process.js`, `abg/c_call_outcome.*` and `contracts/default-library/stdo/context.inventory.json`. Every inventory member is a tracked path. New outputs under the ignored `build/`, such as `public/binding/*`, `abg/exact_prefix_bindings.*` and `shared/refusal.*`, are untracked and were not force-added.
- residuals:
  - **`then` hazard; decide before step 3.**
    - Mechanism: design §3 names the sequencing function `then`, so the module namespace of `shared/refusal.ts` is a thenable. An `import()` of it never settles. Resolution calls `then(resolve, reject)`; `resolve.kind` is not `"ok"`, so `then` returns `resolve` and calls neither callback.
    - Probe: `await import(".../build/code/src/shared/refusal.js")` ends with "unsettled top-level await". Static named imports work.
    - Exposure:
      - `observedSource` in `t287-w2-05-static-binding-algebra`, which runs `await import()` on each dependency of an observed module.
      - `load` in `t287-conformance-owner-reuse`, which does the same.
      - Any barrel that `export *`s the module, including `shared/index.ts` if it is ever added there.
    - Options: rename in design §3 (for example `andThen`), or keep the name and allow only static named imports.
    - Current state: implemented as named; no consumer exists.
  - `shared/refusal.ts` type-imports `JsonValue` from `./canonical_json.js` (the `value` family). This is an erased, type-only back-edge against `refusal <- value`, and §2 says `refusal` imports nothing. §3 types `evidence` with `JsonValue`.
  - The §2 row for `abg/exact_prefix_bindings.ts` (edit 2, as dictated) omits `abg/definition_event_resource.ts`, which the module imports. The original row omitted it too.
  - Design move 1 (line 59) still links `../code/src/shared/static_definition_bindings.ts`, which now dangles. It sits in the move list, outside the seven edits.
  - With `ABI5_OWNED_ADMISSION_PREIMAGE` set, `t287-w2-05-static-binding-algebra` loads a preimage transport whose `../shared/definition_binding_mechanics.js` specifier no longer resolves. That env-gated path needs a new preimage.
  - `design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` lines 2170, 2174 and 2296 still name `product/exact_match.ts`. The shim keeps that path resolvable until step 5.
  - Design §10.6 row 1 still lists acceptance of the carrier's `catalog_addition_proposal`, with its §10.1 cost ledger, as unresolved and design-gated. I relied on the activation as that acceptance. This commit contains no cost ledger.
  - The test title "W2-05 generator imports projections from the exact shared owner" and the constant name `sharedProjectionOwner` keep the word "shared". Only the path value changed.
- return route: this file
