# TD-69R Return: the remaining tenant pack sites go through packProduct

Status: done. No test-side code packs the tenant with npm directly, apart from the deliberate dry run in `t292-product-payload-rule`: five tenant pack sites now go through `packProduct`, and the 18 sites left pack another package or, in that one case, state npm's own projection. The three cases that failed with `payload_inventory_mismatch` in the trusted lockfile state pass, and every converted file passes in both states.

Writer: Claude Opus 5.5. Branch `claude/td69r-remaining-pack-sites` from
local `main` at `72ac59366`, worktree `/private/tmp/abg-td69r`. Change class:
realization_refactor. Test side only. No push, no tag.

| Commit | Content |
| --- | --- |
| `109ed7821` | `t287-single-address-space-consolidation`: maintained SDK setup case |
| `cec609544` | `t287-default-library`: RC7 fixed admission case |
| `b73e846d1` | `t287-gtl-serialization-publication` and `t287-framework-handoff-types` |
| `02b20bcf1` | `uat/harness.test.mjs`: maintained setup case |
| this commit | this Return |

Diff: 14 insertions and 20 deletions over five test files. Every path below
is under `build_tenants/abiogenesis/typescript/` (T). The diff
`git diff --stat 72ac59366 -- T/code T/contracts T/package.json T/product-toolchain-manifest.json`
is empty. The same diff over `T/scripts` is empty too, so
`product-payload.mjs` is unchanged: no site needed an option that
`packProduct` lacks.

## 1. Census

Search: every argument `"pack"` or `'pack'`, every `npm pack`, `--pack-destination`,
`libnpmpack`, `pacote`, `npm-packlist`, `publish`, `ci` and `install-links`
under `T/test_env` and `T/scripts`, excluding `test_runs`, `downstream`,
`evidence` and `node_modules`. None of those excluded directories exists in
this worktree at any depth, so the exclusion hides nothing here. The search
finds 23 pack calls besides `packProduct` itself (`scripts/product-payload.mjs:152`)
and the generator check at `t292-product-payload-rule.test.mjs:26`, which
only matches text.

| # | Site | Directory packed | Kind | What the test does with the archive | Decision |
| --- | --- | --- | --- | --- | --- |
| 1 | `test_env/tests/t287-single-address-space-consolidation.test.mjs:936` | `packageRoot` | the tenant | extracts it as the bootstrap install, `verifyArtifact` against the built manifest, then the maintained SDK setup | converted: `packProduct` |
| 2 | `test_env/tests/t287-default-library.test.mjs:2526` | `packageRoot`: the tenant, or the root `ABI5_DEFAULT_LIBRARY_BUILD_ROOT` names | the tenant | as row 1, for the RC7 fixed admission | converted: `packProduct` (imported at the pack site) |
| 3 | `test_env/tests/t287-gtl-serialization-publication.test.mjs:27` | `tenantRoot`, unless `ABI5_GTL_CORE_PACKAGE_ROOT` names an extracted package | the tenant | extracts it; compares its `.d.ts` and `package.json` populations with the manifest locators and resolves the native declaration closures | converted: `packProduct` |
| 4 | `test_env/tests/t287-framework-handoff-types.test.mjs:107` | `tenant`: this tenant, or the root `ABG_FRAMEWORK_HANDOFF_TENANT_ROOT` names | the tenant | extracts it; a consumer compiles the HC1 proof against its declarations; loads its runtime | converted: the tenant's own `scripts/product-payload.mjs pack` (calls `packProduct`); the helper stays synchronous |
| 5 | `test_env/uat/harness.test.mjs:845` | `tenantRoot` | the tenant | basis digest, then `verifyArtifact` and the maintained setup | converted: `packProduct` |
| 6 | `test_env/tests/t287-d1-requirement-handoff.test.mjs:350` | `sourceRoot`, a single-start worksite fixture Product written in scratch | another package | fixture basis and install | left |
| 7 | `test_env/tests/t287-installed-dependency-lock.test.mjs:62` | `root`, a minimal author-owned fixture Product | another package | `verifyProduct` against its own manifest; dependency for the install cases | left |
| 8 | `test_env/tests/t287-installed-dependency-lock.test.mjs:199` | `tamperedRoot`, a copy of fixture `current.root` with a changed `build/index.js` | another package (a tampered fixture, not the tenant) | physical dependency of the `tampered` install case, which must refuse with `dependency_lock_mismatch` | left |
| 9 | `test_env/uat/consumer.mjs:103` | `consumer-source`, the UAT consumer Product | another package | consumer basis, verification and install | left |
| 10 | `test_env/falsifiers/runtime-f09-product.mjs:642` | `mini.sourceRoot`, the developer-mini fixture with an authored manifest | another package | AX-F09 basis and publication | left |
| 11 | `test_env/tests/t292-product-payload-rule.test.mjs:54` | a copy of the built tenant, `npm pack --dry-run` | npm's own projection | reports npm's count as a diagnostic beside the rule's | left, by the brief |
| 12 | `test_env/support/d5-authentic-preserved-result-fixture.mjs:269` | `<owner>-product-source` fixture | another package | fixture basis | left |
| 13 | `test_env/support/registered-graph-selection.mjs:197` | registered-selection data product fixture | another package | fixture basis | left |
| 14 | `test_env/support/t287-generic-job-intake.mjs:180` | generic-job data product fixture | another package | fixture basis | left |
| 15 | `test_env/support/flavored-catalog-product.mjs:361` | flavored-catalog fixture | another package | fixture basis | left |
| 16 | `test_env/support/developer-mini-product.mjs:243` | developer-mini fixture `sourceRoot` | another package | fixture basis | left |
| 17 | `test_env/support/developer-mini-product.mjs:336` | developer-mini variant (copy of row 16's fixture) | another package | variant basis | left |
| 18 | `test_env/support/neutral-schema-product.mjs:455` | neutral-schema fixture | another package | fixture basis | left |
| 19 | `test_env/support/serial-branch-worksite-program.mjs:501` | serial-branch worksite fixture | another package | fixture basis | left |
| 20 | `test_env/support/language-structural-fixture.mjs:68` | language-structural fixture | another package | fixture basis | left |
| 21 | `test_env/support/language-smoke-fixture.mjs:69` | language-smoke fixture | another package | fixture basis | left |
| 22 | `test_env/support/d2-frame-fixture.mjs:269` | `consumer-source`, a D2 consumer fixture | another package | fixture basis | left |
| 23 | `test_env/support/single-start-worksite-program.mjs:381` | single-start worksite fixture | another package | fixture basis | left |

Rows 12 to 23 are fixture-product packs. TD-69's list of fixture packs
also named `declared-testing-capability` and `stdo-environment-pilot`; both
files remain, but TD-31 (`b2f501b49`) removed their pack calls, so they are
no longer sites. `d2-frame-fixture` (row 22) is missing from TD-69's list;
it is a consumer fixture like the others. No fixture root copies the tenant: each is written in scratch or
copied from `test_env/fixtures`. None of these files declares
`bundleDependencies`, so npm's hidden lockfile cannot change their member
lists.

No site packs a copy or a tampered copy of the tenant. Row 8, the one
tampered root, is a copy of a minimal fixture Product, and its claim (a
self-reported manifest cannot hide a changed payload) needs a root that is
deliberately not consistent with its manifest; `packProduct` would refuse it.

## 2. Lockfile states

The oracle is `/private/tmp/abg-td69r-work/oracle.sh`. It runs
`npm pack --dry-run --ignore-scripts --json` in T, counts the entries and the
fast-check and pure-rand `CHANGELOG.md` among them, and compares the count with
`node scripts/product-payload.mjs members` (5,327). npm's count 5,329 with
both CHANGELOGs means trusted; 5,327 means untrusted. The oracle ran before
and after every test run, and every run kept its state.

- After `npm run build` (29 s, no tracked change) the worktree was
  **untrusted** (5,327), unlike the TD-69 worktree.
- Trusted: `touch node_modules/.package-lock.json` (5,329, two CHANGELOGs).
- Untrusted: `touch node_modules/effect` (5,327).

Order: trusted before, untrusted before, the four commits, untrusted after,
trusted after, then `t287-single-address-space-consolidation` with
`ABI5_EVIDENCE_ROOT` in the trusted state.

## 3. Before and after

Command, from T, one file at a time:
`TMPDIR=/private/tmp/abg-td69r-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap <file>`.
`t287-single-address-space-consolidation` runs without `ABI5_EVIDENCE_ROOT`
("no root") except in the last row; its six retained-history cases then skip.
Figures are tests / pass / fail / skip.

### Trusted (oracle 5,329)

| File | Before (`72ac59366`) | After (`02b20bcf1`) |
| --- | --- | --- |
| `t287-single-address-space-consolidation`, no root | 12 / 4 / **2** / 6. Case 8 "maintained SDK setup holds one acquired resource…" fails with `abg-artifact-verification: … "code":"payload_inventory_mismatch","message":"archive file set differs from the manifest"`; case 12 "single-address-space proof records every measured case" fails with it (`maintainedSetup completed`) | 12 / 6 / 0 / 6 |
| `t287-single-address-space-consolidation`, with root | not run | 12 / 12 / 0 / 0 (529 s) |
| `t287-default-library` | 37 / 33 / **1** / 3. "RC7 fixed admission: a Public direct Testing state Result admits direct UAT…" fails with `payload_inventory_mismatch` | 37 / 34 / 0 / 3 |
| `t287-gtl-serialization-publication` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-framework-handoff-types` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `uat/harness.test.mjs` | 33 / 32 / **1** / 0. "Maintained setup retains actual owner verification…" fails with `payload_inventory_mismatch` | 33 / 33 / 0 / 0 |

In the trusted state, `node scripts/product-payload.mjs pack` gives 5,327
members and archive `sha256:8cfa6e6f0c62c9c7ecfc6705ccdcb06f836ed215da6aff14d304a036301a122d`,
the `artifactDigest` of the committed `test_env/fixtures/abi5-root-candidate-basis.json`.

### Untrusted (oracle 5,327)

| File | Before (`72ac59366`) | After (`02b20bcf1`) |
| --- | --- | --- |
| `t287-single-address-space-consolidation`, no root | 12 / 6 / 0 / 6 | 12 / 6 / 0 / 6 |
| `t287-default-library` | 37 / 34 / 0 / 3 | 37 / 34 / 0 / 3 |
| `t287-gtl-serialization-publication` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-framework-handoff-types` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `uat/harness.test.mjs` | 33 / 33 / 0 / 0 | 33 / 33 / 0 / 0 (second run; see below) |

The first untrusted after run of `uat/harness.test.mjs` gave 33 / 32 / 1 / 0:
the maintained-setup case passed its setup and then failed with `EEXIST` at
`T/artifacts/setup020/preparation-resolve-call.json`. The case writes three
fixed-name evidence files there with `{flag: 'wx'}` at its end
(`harness.test.mjs:1102-1105`). The passing untrusted before run had written
them; the trusted before run had failed before reaching them. I removed
`T/artifacts/setup020` (ignored, and removed by `npm run clean`) and reran
the file alone: 33 / 33 / 0 / 0. I removed it again before the trusted after
run. This is the test's own residue, not the pack; see §6.

The three default-library skips are environment-selected cases
(`ABI5_PLANNING_PROJECTION_CAPTURE`, `ABI5_NATIVE_OBSERVATION_CAPTURE`,
`ABI5_DEFAULT_LIBRARY_LIVE`), the same in every run. The gtl and HC1 lanes
pass before the change in both states because they compare only the
`.d.ts`, `.d.cts`, `.d.mts` and `package.json` populations, which the two
CHANGELOGs do not touch. They are converted so that no tenant pack bypasses
the rule.

## 4. Sites left and why

- Rows 6, 7, 9, 10 and 12 to 23 pack another package: a fixture or consumer
  Product with its own `files` list and manifest. Ruling 2 keeps them.
- Row 8 packs a tampered copy of a fixture Product, not of the tenant. Its
  claim needs a root that does not match its manifest.
- Row 11 states npm's own projection on purpose.

## 5. Deviations

- The two maintained-setup packs in `t287-single-address-space-consolidation`
  and `t287-default-library` ran npm with `npm_config_update_notifier=false`.
  `packProduct` runs npm with the caller's environment and does not set it.
  The update check is npm's background registry query; it does not change
  the archive and no assertion depends on it. I did not add an option to
  `product-payload.mjs` for it. The setup environment of both cases still
  sets it for the setup's own npm calls. The pack-site comment in
  `t287-single-address-space-consolidation` that named the update check now
  states what the pack does.
- `t287-single-address-space-consolidation`: besides the pack hunk, the
  import block gains `packProduct` and loses `execFile`, `promisify` and the
  `execFileAsync` helper, whose only use was the pack. The hunks sit at
  base lines 7, 14, 16, 62 and 935-938, above the response-chain call sites
  another package edits.
- `t287-default-library`: `packProduct` is imported dynamically at the pack
  site, as the case already imports its setup modules, so the change is one
  hunk of two lines.
- `t287-framework-handoff-types`: `candidatePackage` and the test that calls
  it stay synchronous. The pack runs the tenant's own command,
  `node <tenant>/scripts/product-payload.mjs pack <root>`, which calls
  `packProduct` on that tenant and prints npm's JSON. The doc comment names it.
- `uat/harness.test.mjs`: the `execFile` and `promisify` imports, used only
  by the pack, are removed.
- Correction to the brief: after `npm run build` the worktree was untrusted
  (5,327), not trusted.

## 6. Residuals

- `uat/harness.test.mjs` maintained setup writes fixed-name evidence to
  `T/artifacts/setup020/` with exclusive create. A second passing run in the
  same tree fails with `EEXIST` until `npm run build` (or `npm run clean`)
  removes `T/artifacts`. This predates TD-69R and is outside the pack site;
  it is left unchanged. It is a candidate for the register: the evidence
  belongs under a run-owned archive (the case already has one from
  `newArchive`) or needs a fresh directory per run.
- The environment overrides now meet the payload rule.
  `ABI5_DEFAULT_LIBRARY_BUILD_ROOT` is packed by `packProduct`, which refuses
  a root whose built manifest differs from the rule, for example a root
  built by the pre-TD-69 generator in a trusted lockfile state.
  `ABG_FRAMEWORK_HANDOFF_TENANT_ROOT` runs that root's own
  `scripts/product-payload.mjs`, which a root cut before TD-69 lacks. Both
  overrides then fail with the reason named instead of verifying a
  different archive. No current caller sets either.
- The HC1 lane runs `product-payload.mjs` as a command. Its command guard
  compares `resolve(process.argv[1])` with the module's own path, which Node
  resolves through symlinks. When the tenant is reached through a symlinked
  path (a symlinked `ABG_FRAMEWORK_HANDOFF_TENANT_ROOT`, or the
  `--preserve-symlinks-main` layout TD-69 used for sparse worktrees), the
  command prints nothing and the lane fails with a `JSON.parse` error
  instead of a named reason. All paths in these runs are real.
- The known reds named in the brief (`witness-reprice-definition-binding`,
  the GC03 case of `t287-governed-context`) are in files this package does
  not touch; I did not run them.
- The worktree is left in the trusted state (oracle 5,329), with
  `T/artifacts/setup020` removed after the last harness run.
