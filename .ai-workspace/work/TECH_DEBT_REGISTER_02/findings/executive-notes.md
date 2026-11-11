# Executive notes for the register (facts established outside the area reviews)

Commentary. Claude Fable 5.2, 2026-11-12. Each item is checked as stated; "to confirm" marks what an area review is settling.

## Census totals (census/out, scripts beside it)

- Source: 291 files, 171,563 lines; 7,162 top-level declarations spanning 152,973 lines.
- Reachability by top-level declaration: 144,161 lines reachable from what the product executes; 7,620 reachable only through a package export; 1,192 reachable from no entry point (412 of those with no test mention).
- Compiler: 31 unused locals, imports and parameters.
- 2,400 snake_case kind values; 54 are typed or tested in source and never produced there (23 with no test mention); 694 are produced and never typed or tested in source or tests.
- Clone census: `abg/construction_continuation.ts` is by far the largest self-clone; then `gtl/consensus_schema.ts`, `abg/c_call.ts`, `abg/retry.ts`.
- Tests: 225 test files; 190 are named by no npm script. 360 environment variables gate test code. The census regex finds no `process.env.NAME` read in source, but that is a limit of the regex, not a fact about the source: the workers review found environment keys read through named constants, among them `ABG_TS_FP_TIMEOUT_MS` (`abg/actor_process.ts:714`).
- Census limits found by the area reviews: a runtime root was first resolved by bare name, so a same-named export in a sibling module counted as live (corrected: roots now resolve through their package export); code reached only through the in-process SDK export `./public` first counted as package-only (corrected: tier `sdk`). Corrected totals: runtime 144,003 lines, sdk 1,191, package 6,529, none 1,250. The compiler error TS2322 at `validator/conformance_operation.ts:325` appears only inside the census program, where types are queried in another order; `npm run build` on main exits 0 (run twice on 2026-11-12).
- Design: 327 notes, about 102,700 lines; 82 notes (9,682 lines) are mentioned by no source, test, specification, design note or active ticket; 23 hold path references that no longer exist; 103 were last committed in April 2026.
- Repository: `.ai-workspace/comments` 45,600 tracked entries, 33.3 GB; `.ai-workspace/work` 81,994 entries, 10.7 GB; product code 292 entries, 7.8 MB.

## E1. The product's identity depends on npm's private state (verified 2026-11-12)

- `T/scripts/generate-product-manifest.mjs:504-547` takes the payload file list from `npm pack --dry-run --json` and digests it into `productContentDigest`.
- On `main` at `002035b8a`, with source, `build/`, `contracts/`, `package-lock.json` and `node_modules` byte-equal to the cut worktree (`diff -rq`: 0 differences), `npm run build` regenerates the manifest and the capability graph with a different `productContentDigest`: `sha256:4428e0d0…` against the committed `sha256:dcfbcf42…`. The payload gains `node_modules/fast-check/CHANGELOG.md` and `node_modules/pure-rand/CHANGELOG.md` (5,327 locators against 5,325). Reproduced twice.
- The same build in the cut worktree leaves the tree clean. The cut Writer had noted two "packlist branches" (X_RETURN: "package-files branch; hidden lockfile rejected, 20 violations").
- Cause, by reading and the observation above: npm decides how to list bundled dependency files from whether it trusts `node_modules/.package-lock.json`, which depends on file times. Not traced inside npm.
- Consequence: the same commit yields two product identities; a plain build on `main` dirties two tracked files and would produce an archive that is not `rc.12`.
- Retire: derive the payload list from a declared rule (the package `files` plus the dependency inventory of `package-lock.json`), not from npm's projection. S to M. Risk: manifest and digest pins. realization_refactor.

## E2. A Public operation family with no binding (to confirm: product-run, implementation-public)

- `public/binding/owner_contract_source_set.ts:190` names `INTERACTION_DEFINITION_BINDINGS`; the census finds no exported declaration of that name. The generated surface lists `sdk.interaction.respond`. The Product reserves native response and resume for 5.1.

## E3. Package exports named after milestones (to confirm: abg-events, gtl-validator, implementation-public)

- `./gtl/m01`, `./gtl/m02`, `./gtl/requirements`, `./abg/requirements`, `./abg/m03`, `./abg/m03/transport`, `./app/m04`, `./qualification/m05` are package exports; the runtime loads none of them (`modules.json`). `implementation/index.ts` and `shared/index.ts` are reachable from no entry point.

## E4. Mirrored specification inside the package (verified 2026-11-11)

- `T/contracts/qualification/sources/` holds mirrored copies of `PRODUCT.md`, `INTENT.md` and the requirement files, and `contracts/**` is in the package `files`. Any edit to a specification file therefore changes the archive and forces a restage and a new cut. RC12 could not record its change authority in the Product header for this reason.

## E5. Release mechanics live outside the tenant (verified 2026-11-11)

- The RC12 stamp, cut, install and smoke scripts are under `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/cut/` and are written for `rc.11` to `rc.12`. The stamp refused on git-ignored test output until patched. A test pinned two digests derived from the package version and went red at the stamp.

## E6. The test suite as an instrument (verified 2026-11-11)

- The whole suite runs only as a hand-typed glob, takes about 2.5 hours, and has 14 tests that fail at the release base. One 31-case file retained 104 MB per case and ran out of heap; it was split. The qualification inventory and recipe list none of RC12's ten new test files.

## E7. The main checkout (verified 2026-11-12)

- `T/test_env/test_runs` holds 45 GB of git-ignored run output in the main checkout (584,472 files).
- Three Codex worktrees under `/private/tmp` are merged into `main` and hold untracked directories.

## E8. Replay digests carry derived liveness (verified in RC12; to detail: abg-events)

- RC12 corrected readers instead of axioms for frames ended by a handled failure, because the digested replay body includes derived liveness and a change would alter the digests of recorded Runs.

## E9. How many mechanisms choose the next step (to detail: abg-traversal, gtl-validator)

- Registered selection (default library), `construction_intent_selected` over an action catalog (One Surface), the `consequence` term of `C.edge`, and a `gate` relation that is constructed and validated with no executor found.
