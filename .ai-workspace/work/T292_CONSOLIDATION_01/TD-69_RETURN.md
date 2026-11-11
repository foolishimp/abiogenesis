# TD-69 Return: Product identity independent of npm's private state

Writer: Claude Opus 5.5. Branch `claude/td69-payload-rule` from `main` at
`59fbaf8a0`, worktree `/private/tmp/abg-td69`. Change class:
realization_refactor. No push, no tag.

| Commit | Content |
| --- | --- |
| `3f28312ab` | rule module, generator, candidate-basis refresh, 13 tenant-root pack sites |
| `e346c77ad` | two-state test |
| `b565d1382` | design note section |
| this commit | this Return |

## 1. Trace

npm 11.5.1 under Node 24.7.0 (`/opt/homebrew/lib/node_modules/npm`), read
in place.

1. `npm pack`, dry run or real, goes through `libnpmpack` to pacote's
   `DirFetcher[_tarballFromResolved]` (`pacote/lib/dir.js:61-85`). That calls
   `new Arborist({ path }).loadActual()` with no options, then
   `npm-packlist(tree)`, then `tar.c`. The `--json` file list is read back from
   the produced tarball bytes (`npm/lib/utils/tar.js:49`, `getContents`), so
   the dry run and the real pack make one selection.
2. `loadActual` (`@npmcli/arborist/lib/arborist/load-actual.js:136-160`) first
   tries `node_modules/.package-lock.json` (`Shrinkwrap.load`,
   `hiddenLockfile: true`). No npm config reaches its `forceActual` option.
   `assertNoNewer` (`shrinkwrap.js:131`) rejects the lockfile when a walked
   directory is newer than its mtime + 10 ms, or when a package directory is
   missing from it. The walked directories are `node_modules`, each scope
   directory, each package directory and each nested package directory.
   File mtimes are never compared. Touching an existing file inside a package
   leaves the lockfile trusted. Adding or removing an entry, or touching the
   package directory, untrusts it.
3. Trusted, the tree comes from the lockfile, whose package metadata keeps
   only `pkgMetaKeys` (`shrinkwrap.js:85`). That list has no `files`, `main`
   or `browser`. Untrusted, every package.json is read from disk. A direct
   check with npm's own Arborist on this tree shows the difference: trusted,
   fast-check's `package.files` is `undefined`; untrusted, it is
   `["lib","runkit.cjs"]`.
4. `npm-packlist` `processPackage` (`npm-packlist/lib/index.js:270-353`)
   takes `files` from `tree.package`. With no `files`, it injects no `*`
   exclusion, and a bundled package contributes every installed file.
   fast-check and pure-rand ship `CHANGELOG.md` in their registry tarballs
   but leave it out of `files`. npm-packlist 10 always includes only
   `package.json`, README, LICENSE/LICENCE and COPYING. A CHANGELOG is packed
   only when `files` names it or when there is no `files`, so only the
   trusted state lists the two files.
   jsonc-parser declares no `files`, so its CHANGELOG is in both states.
5. The real archive differs exactly as the dry run does:

   | State | Archive members | Archive sha256 |
   | --- | --- | --- |
   | hidden lockfile trusted | 5,329 (+ fast-check, pure-rand `CHANGELOG.md`) | `beb1f89b2867d90f5b4b2c442ec4724aa512d689a31e31e5e5c779be46e5e4b0` |
   | hidden lockfile untrusted | 5,327 | `db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca` (the committed candidate basis `artifactDigest`) |

6. This identity has already flipped between cuts. The qualification recipe's
   `expected-output-inventory.json` (5.0.0-rc.1, `fd38e8227`) holds both
   CHANGELOGs. The RC12 K Return records that RC11 shipped the hidden-lock
   branch with the CHANGELOGs and that RC12 was cut on the package-files
   branch without them.

Two corrections to the brief:

- The worktree as handed over was in the trusted state. My first oracle read
  gave 5,329, not 5,325. With the old generator, `npm run build` there would
  have rewritten the two tracked generated files.
- A file newer than the lockfile inside a package directory does not untrust
  it, because only directory mtimes are compared. Untrusting needs a new or
  removed entry, or a touched directory. I used `touch node_modules/effect`.

The committed rc.12 payload is the state in which npm honours each
dependency's own `package.json`. That is npm's documented `files` rule, not
an accident of its implementation, so the stop condition does not apply.

## 2. The rule

The Product payload is every regular file that a package's own
`package.json` selects, for the root package and each package in its
lockfile bundled-dependency closure. A package selects `package.json`, its
top-level README/LICENSE/LICENCE/COPYING files, its `main`, `browser` and
`bin` targets, and everything under its `files` entries. A package with no
`files` selects its whole directory. Nested `node_modules`, version-control
directories and OS/editor residue are never selected.

- Owner: `productPayloadMembers` in `build_tenants/abiogenesis/typescript/scripts/product-payload.mjs`.
  It moves the generator's bundled-closure code (`bundledDependencyClosure`)
  into the same module.
- A `files` entry must be a literal path, `dir/` or `dir/**`. Any other entry
  refuses, and so do a symlink and a selected nested `node_modules`. The
  residue names are excluded, not refused: `.DS_Store`, `._*`, `.*.swp`,
  `*.orig`, `npm-debug.log` and `.npmrc`. None occurs in the current payload,
  and npm drops them from the root package too.
- Reproduces rc.12 byte for byte: 5,325 locators in the same order,
  `productContentDigest` `sha256:dcfbcf4268a08efb15616507fb74bdc19fb0bb504342cd56b3df5dd5bf1fd106`,
  and archive `sha256:db80a5da…` in both states. No pin moves.
- `packProduct(root, destination)` does four things:
  1. It checks that the rule's list equals the built manifest's locators
     plus its two generated members. A stale manifest fails with the diff.
  2. It clone-copies exactly that list into a `mkdtemp` stage outside the
     tree. No hidden lockfile exists there.
  3. It runs `npm pack --ignore-scripts --json` in the stage.
  4. It refuses when the archive members differ from the list, and returns
     npm's JSON unchanged.

  `node scripts/product-payload.mjs members | pack <destination>` serves
  callers outside the tenant.

## 3. Files changed

All under `build_tenants/abiogenesis/typescript/`.

- `scripts/product-payload.mjs` (new): the rule, the closure, `packProduct`
  and the command entry.
- `scripts/generate-product-manifest.mjs`: the payload now comes from
  `productPayloadMembers`, and the `npm pack --dry-run` call is gone. The
  mandatory-member and governed-context checks are kept, and so are the
  `require.resolve` exact-root check and the full-tree symlink refusal per
  closure package. Uniqueness, safe paths and regular files now hold by
  construction, and the rule adds an unsafe-path guard.
- `scripts/refresh-candidate-basis.mjs`, `test_env/tests/{r1-packed-artifact,r2-clean-install,r3-workspace-binding,t287-w2-05-generator-package-reproducibility,t287-st2a-g-capability-definition-graph,m5-s06-prime,t287-w2-05-release-snapshot-definition-bindings,t287-public-groups,hello-product-boundary}`,
  `test_env/support/{root-installed-environment,root-cli-environment,t287-wave2-owner-chain-worker,developer-mini-product (ABG dependency pack only)}`:
  every pack of the tenant root now calls `packProduct`.
- `test_env/tests/t292-product-payload-rule.test.mjs` (new).
- `design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md`: new section
  "Product payload membership". It is the only design note that names the
  generator as its territory and states the bundled-closure payload law. The
  commit that introduced the npm projection (`3014f1257`) touched no design
  note.

Diff: 288 insertions, 210 deletions over 17 code and test files, plus 22
design lines.

## 4. Proof

State oracle before and after every step: `npm pack --dry-run` entry count
in the tenant root. 5,329 means trusted and 5,327 means untrusted, as in
§1. "Tracked changes" is `git status --short --untracked-files=no` after the
step. The trusted state is the worktree as handed over (the lockfile was
already newest). The untrusted state was set with `touch node_modules/effect`
(a package directory newer than the lockfile).

All runs were on head `b565d1382`. Every row kept its state: the oracle
read the same before and after.

| Step | Trusted (oracle 5,329) | Untrusted (oracle 5,327) |
| --- | --- | --- |
| `npm run build`, then tracked changes | pass, 0 | pass, 0 |
| manifest after each step | 5,325 locators, `sha256:dcfbcf42…d106` | 5,325 locators, `sha256:dcfbcf42…d106` |
| `npm run test:r1` | 1/1 pass, 0 tracked changes | 1/1 pass, 0 tracked changes |
| `npm run test:r2` | 2/2 pass, 0 tracked changes | 2/2 pass, 0 tracked changes |
| `t287-w2-05-generator-package-reproducibility.test.mjs` ("W2-05 generator is reproducible and the real pack verifies 18/56") | 2/2 pass; evidence `artifactDigest` `sha256:db80a5da…` | 2/2 pass; evidence `artifactDigest` `sha256:db80a5da…` |
| `t292-product-payload-rule.test.mjs` (new; sets both states inside its own copy) | 1/1 pass | 1/1 pass |
| `t287-default-library-prerequisites.test.mjs` (once) | 7/7 pass, see note | not run (asked for once) |

New test diagnostics, identical in both runs:
`trusted: rule 5327, archive 5327 sha256:db80a5da…, npm's own projection 5329 (+fast-check, pure-rand CHANGELOG.md)`;
`untrusted: rule 5327, archive 5327 sha256:db80a5da…, npm's own projection 5327`.

Note on `t287-default-library-prerequisites`:
- In this sparse worktree, 6 of its 7 tests fail with ENOENT. They read
  `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/`,
  which the sparse set excludes.
- I left the sparse settings unchanged and ran it once on the same tenant
  through a symlinked layout: `node --preserve-symlinks-main`, with the 13
  witness files extracted by `git archive HEAD` into the matching relative
  location under the scratch directory. All 7 pass, including the
  `HEAD_PINS` digest test.
- Independently of that run, `productContentDigest` is unchanged, so every
  packaged `build/` byte is the rc.12 byte.

I also ran the other tests whose pack site changed once, in the trusted
state, which is the one that used to diverge. All pass:

| Test | Result |
| --- | --- |
| `hello-product-boundary` | 1/1 |
| `t287-st2a-g-capability-definition-graph` | 4/4 |
| `t287-public-groups` | 3/3 |
| `t287-w2-05-release-snapshot-definition-bindings` | 1/1 |
| `r3-workspace-binding` | 1/1 |
| `t287-wave2-owner-chain` | 2/2 |

I did not run `m5-s06-prime` or the tests that set up
`root-cli-environment`/`root-installed-environment` or the developer mini
product. Their pack site changed in the same one-line way. The worktree is
left trusted (oracle 5,329), as it was handed over.

## 5. Deviations

- Fixture-product packs stay on plain `npm pack`. These are `sourceRoot` and
  `variantRoot` in `runtime-f09-product`, `flavored-catalog-product`,
  `registered-graph-selection`, `neutral-schema-product`,
  `developer-mini-product` (fixture and variants), `t287-d1-requirement-handoff`,
  `d5-authentic-preserved-result-fixture`, `t287-generic-job-intake`,
  `declared-testing-capability`, `stdo-environment-pilot`,
  `language-{smoke,structural}-fixture` and
  `{serial-branch,single-start}-worksite-program`.
  - They are other Products with explicit payload lists.
  - None declares `bundleDependencies` and none has a hidden lockfile. The
    only fixture `node_modules` is flavored-catalog's type symlink, so npm's
    tree source cannot change their member list.
  - `verifyProduct` already checks their archives against their manifests.
- The new test runs on a copy of the built root and its complete dependency
  tree, so the tenant's `node_modules` is never mutated. Its preconditions are
  the mtime relations that define npm's trust. It does not assert npm's
  dry-run count, which would pin npm's defect; it reports that count as a
  diagnostic (5,329 against 5,327).
- I checked that the test bites. When `packProduct` packs the root directly,
  it fails with
  `npm archive differs from the payload rule: {"missing":[],"unexpected":["node_modules/fast-check/CHANGELOG.md","node_modules/pure-rand/CHANGELOG.md"]}`.
- `verifyProduct` and every member check are unchanged.

## 6. Residual risks

- A dependency upgrade that brings a glob or negated `files` entry fails the
  build until the rule is extended. This is deliberate: no invented glob
  semantics.
- If npm ever drops a file the rule selects, `packProduct` fails with the
  file named, and the fix is a rule decision. Two cases would do it: a
  `.gitignore` under `build/` or `contracts/`, or a lockfile at the root of a
  bundled package that has no `files`.
- `test_env/qualification/recipe/install-dependencies.mjs` writes the hidden
  lockfile, by its own comment so that the generator's `npm pack --dry-run`
  matches the candidate. That write no longer affects the payload, so the
  comment is now false. I left it unchanged because it is recorded
  qualification material, and its inventory is already stale (309 of 1,191
  member digests differ). It is a candidate for the next qualification-recipe
  refresh.
- `packProduct` copies about 5.3k files per call (about 0.5 s with APFS
  clones) before npm packs.

## 7. Release cut scripts outside the tenant (noted, not edited)

I searched `main` with `git grep` for executable `npm pack` callers outside
the tenant. The live ones are in
`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/cut/`. The
others are historical copies under `.ai-workspace/evidence` and
`*/proof/baseline*`.

1. Required before the next cut: in `cut-local-rc12.mjs`, step `pack`,
   replace `npm pack --ignore-scripts --offline --json --pack-destination <packDir>`
   (run with `cwd: tenant`) with `node scripts/product-payload.mjs pack <packDir>`
   in the tenant. To keep offline behaviour, set `npm_config_offline=true` in
   its environment. It prints the same JSON array.
2. Until step 1 is done, cut only with `--npm-packlist package-files`. With
   the new generator, `hidden-lock` gives a 5,325-locator manifest, but plain
   `npm pack` then archives 5,329 members, and the cut's member check fails.
3. After step 1, `--npm-packlist`, the hidden-lockfile copy and `utimes`, and
   `npmPacklistBranch` (`cut-common.mjs:169-215`) no longer affect identity.
   The generator does not consult npm, and the staged pack gives one archive
   in both branches. They can be dropped.
- The cut comment "the Product's own generator (it runs `npm pack --dry-run`
  itself)" is no longer true.
- The cut's member check (archive equals manifest locators plus `GENERATED`),
  its byte equality check and its `verifyProduct` call stay valid as they are.
