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
