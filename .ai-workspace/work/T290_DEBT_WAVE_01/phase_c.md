# T-290 Phase C package records

Phase C of [T-290](../../tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md): the packages the owner agreed on 2026-10-24 are ruled by the log principle, run in the ticket's recorded order after the Phase B close (`a8937b837`). Same record pattern as Phase B (`packages.md`): an Executive activation, a Worker return, an Executive disposition, one commit per package, nothing pushed.

## C-1 activation (Executive, 2026-10-24; the three S items: the barrel export, the tracked build outputs, the Run-read law)

Debt (T-290 Phase C rows `sameQualificationValue`, 40 tracked `build/` files, Run read validity scope; the §9.3 `command_failed` sentence in the same row group is the Executive's and is placed in this package's bookkeeping commit, not by you).

1. `sameQualificationValue`. Step 4 of the library plan (`5f4a1d4c9`) deleted `export const sameQualificationValue = (a: unknown, b: unknown): boolean => qualificationHash(a) === qualificationHash(b);` from `code/src/validator/qualification_contracts.ts`, and with it the name left the `validator` barrel (`validator/index.ts:53` `export * from "./qualification_contracts.js"`) and the package `"."` and `"./validator"` entries; the step's disposition flagged that as a surface change outside a realization refactor. The owner ruled: restore it to the barrel. Restore the one export at its old place with the same name and signature, its body the shared canonical equality the value family owns (the function `canonicalEquals` of `shared/value/`, or the digest comparison if `qualificationHash` is not canonical-JSON digest equality; state which and why: the restored function must decide equality exactly as the deleted body did, which means canonical-JSON equality of the two operands if `qualificationHash` is the canonical digest). Proof: the lane that already covers the value family (`t287-value-equality`) plus one case in it or in `t287-qualification-scopes`: equal canonical values with different key order and number spellings are equal, one differing leaf is not, and a non-I-JSON operand takes the same outcome as the deleted body did (state it). `npm run build` and the generated manifest: report whether any tracked file changed from the restored export.
2. The 40 tracked `build/` files. `.gitignore` at the tenant (`:2`) and the repository root (`:6`) already ignore `build/`; forty built outputs are tracked by a historical force-add (`git ls-files build`: 12 under `abg`, 12 under `product`, 9 under `gtl`, 5 under `implementation`, 2 under `hog`), and every package commit of this wave regenerated some of them. The owner ruled: untrack them; the build regenerates them. Census first: every reader of a `build/code/src` path outside the build itself (`scripts/generate-product-manifest.mjs` imports five built modules; `test_env/uat/*.mjs`; the lanes import the built modules through `privateOwner` and the package entries) and whether any of them reads a tracked copy before `npm run build` runs (a reader that needs the file from git, not from the build, is a stop). Then: record the sha256 of each of the forty tracked files as committed; `git rm --cached` the forty (index only; the working files stay); `rm -rf build && npm run build`; every one of the forty regenerated files has the committed digest, or the differing ones are named with the reason (a build output that is not a function of the source is a finding); `git status --short` shows the forty deletions and nothing else under `build/`. The build's own check (the C2 pin, `scripts/generate-product-manifest.mjs:94-107`) passes.
3. The Run-read law. `test_env/tests/r10-projection-contracts.test.mjs:109` ("Run reads validate selected liveness while workspace replay retains the complete calculus") plants a malformed `runtime_activity_probe_observed` in another Run's scope and at `:142` expects the Run read to project while the workspace replay refuses `invalid_history`; the project-read owner refuses the Run read with `invalid_history` too (the lane is 10/9/1/0 at head, the one red since the family loads again at `bf117cf92`). The owner ruled: keep the whole-prefix refusal (a log holding a malformed row is not admitted history; the planted event is synthetic) and retire the test's unrelated-scope expectation. Change that test only: the unrelated-scope read asserts `invalid_history` like the target-scope reads; the test's name states the law ("a prefix holding a malformed liveness event is not admitted history: Run and workspace reads over it refuse"); cite the refusal site in `abg/project_read_ports.ts` that produces it (find the one the test reaches; `:670`, `:912` and `:1537` name `invalid_history`). No production edit.
4. Boundaries. No edit to `abg/project_read_ports.ts` or any `code/src` file other than the one export of item 1; no `.gitignore` edit (it already covers `build/`); no other test edit.
5. Lanes. `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`, `npm run build`; before and after: `r10-projection-contracts` (10/9/1/0 at head), `t287-value-equality` (4/4), `t287-qualification-scopes`, `t287-qual056-material` (7/7), `t287-qualification-carrier-resource`, `t287-default-library` (20/17/0/3), `t287-c2-core-environment` (3/3), `m5-c-algebra-validation` (22/19/0/3); tests/pass/fail/skipped, the same red identities before and after or the difference named. Lanes run one at a time from `build_tenants/abiogenesis/typescript` with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 test_env/tests/<lane>.test.mjs`.

Grant: `code/src/validator/qualification_contracts.ts` (the one export), the git index entries of the forty `build/` files (no file content), `test_env/tests/r10-projection-contracts.test.mjs` (the one test), `test_env/tests/t287-value-equality.test.mjs` or `t287-qualification-scopes.test.mjs` (the one case of item 1), the two tracked files `npm run build` regenerates (`contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`) if it changes them, and this record (append only, your section). No other file.

Stop (write it in the Return, keep the rest moving): `qualificationHash` is not canonical-JSON digest equality, so the restored body cannot be the shared equality (restore the digest comparison and say so); a reader that needs a tracked `build/` file from git before the build runs (name it; untrack the other thirty-nine); a regenerated file whose digest differs from its committed copy (name it; the untracking still proceeds, since the build is the source); any change to a Public read's outcome other than the ruled refusal.

Return contract: one commit on `main` with the first line `C-1: the barrel export restored; the forty build outputs untracked; the Run-read test states the whole-prefix law` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path (`git rm --cached` for the forty, `git add` for the edited files and this record); no `git add -A`. Append `## C-1 return` at the end of this record with the census of item 2, the digest table (forty rows: path, committed digest, regenerated digest, equal or not), the equivalence statement of item 1, the refusal site of item 3, the lane table (item 5), and any stops. Nothing above your section is edited.

## C-1 return

Worker, 2026-10-24. Head at activation: `97c8612520b48d2d4e6cc16295e82d2bfb0830b9`. Paths below are relative to `build_tenants/abiogenesis/typescript` unless they name the repository root.

**Item 1: `sameQualificationValue` restored.** `code/src/validator/qualification_contracts.ts:478`, on the line after `qualificationHash` where the deleted line stood:

```ts
export const sameQualificationValue = (a: unknown, b: unknown): boolean => canonicalEquals(a as JsonValue, b as JsonValue);
```

The name and signature are those of the deleted line. One import comes with it: `:4` `import { canonicalEquals } from "../shared/value/index.js";`, the path 118 other `code/src` sites use. `validator/index.ts:53` `export *` re-exports it again. Nothing else in `code/src` declares the name, so no star-export collision drops it from the `"."` entry (`index.ts:6` `export * from "./validator/index.js"`).

Equivalence statement. The deleted body was `qualificationHash(a) === qualificationHash(b)`, with `qualificationHash = (value: unknown) => sha256Canonical(value as JsonValue)`. `qualificationHash` is canonical-JSON digest equality. `sha256Canonical` is SHA-256 over the UTF-8 bytes of the `writeCanonicalJson` parts. Neither function has changed since `5f4a1d4c9`: the only later edit to `shared/canonical_json.ts`, `shared/digests.ts` and `shared/value/` is the added `presentMember` (`99b80d6f5`). Each part is a whole `JSON.stringify` token or punctuation, so no surrogate pair is split across `hash.update` calls. `JSON.stringify` escapes lone surrogates, so the canonical text is well-formed and UTF-8 is injective on it. The two digests are therefore equal exactly when the two canonical texts are equal, up to a SHA-256 collision. That is what `canonicalEquals` decides. Both bodies write the left operand in full and then the right operand in full (`canonicalEquals` keeps writing the right side after a mismatch), so an encoding failure throws the same `TypeError` from the same operand. The restored function decides as the deleted body did, and it is the shared equality, so the Stop does not apply.

The casts are the deleted body's own ingress: it passed `unknown` into the digest by `as JsonValue`. An `admitJson` body would refuse a prototype-bearing record that the deleted body compared, which would change outcomes. Non-I-JSON operands give the same outcome under both bodies:
- A class instance with own `a: 1` against `{a: 1}`: `true` (canonical text `{"a":1}` on both sides; `admitJson` refuses the instance with `structural_refusal`).
- `NaN`: `TypeError` "canonical JSON does not admit non-finite numbers".
- An absent member `{a: undefined}`: `TypeError` "Cannot convert undefined or null to object".

Proof. `test_env/tests/t287-value-equality.test.mjs` gains one case: "sameQualificationValue is exported by both package entries and decides as the deleted digest comparison did". It imports through the package self-reference `@abiogenesis/typescript-tenant/validator` and `@abiogenesis/typescript-tenant`, which resolve to `build/code/src/validator/index.js` and `build/code/src/index.js`. It asserts that the root export is the same function. The oracle is `qualificationHash(a) === qualificationHash(b)`, that is, the deleted body. Restored and oracle outcomes are equal and as expected on five pairs:
- equal values with other key order and number and string spellings (`JSON.parse` of `1.0`, `-0`, `1e2`, `2.50` against `1`, `0`, `100`, `25e-1`, and `"é"` against `"é"`): `true`;
- one differing leaf (`100` against `101`): `false`;
- the three non-I-JSON pairs above.

The lane goes from 4/4 to 5/5.

`npm run build` and the generated files. A build of the unedited head (`rm -rf build && npm run build`, before any edit) left every tracked file byte-identical. After the restore, two tracked files change:

| File | Before (head build) | After | Changed leaves |
|---|---|---|---|
| `product-toolchain-manifest.json` | `22e78863…441e1b` | `7e12b452…7c5279` | 138 |
| `contracts/capabilities/capability-definition-graph.json` | `fdaeb33c…d5a2da` | `d33d50e1…5bff90` | 551 |

Every changed leaf in both files is a digest or a digest-bearing ref. They cascade from `productContentDigest` `sha256:61ad470e…92914` → `sha256:157ba205…05396`, because the packed `build/code/src/validator/qualification_contracts.{js,d.ts}` changed. Both files are in the grant and staged. No other tracked file changed.

**Item 2: the forty tracked `build/` files untracked.**

Census of the readers of `build/code/src` paths outside the build, at head. No reader takes a `build/` file from git, so the Stop does not apply. Every reader reads the working tree or an installed copy after a build.

| Reader | What it reads, and when |
|---|---|
| `scripts/generate-product-manifest.mjs` (the build's own last step) | Imports about twenty built modules after `tsc` in `npm run build`. The C2 pin (`:94-107`) reads `build/code/src/product/worksite_command_execution.js` from the working tree after `tsc`. `:451` selects Product content with `npm pack --dry-run --ignore-scripts`, which applies package.json `files` (`build/**`) to the working tree, not to the git index. |
| `scripts/generate-qualification-rule-catalog.mjs` | Imported by the generator, so it runs after `tsc`. |
| `scripts/refresh-candidate-basis.mjs` | `npm pack --ignore-scripts` of the working tree, then `product/index.js` and the generated manifest. A manual step that needs a prior build. |
| `test_env/tests/*.test.mjs` (189 files) | `../../build/code/src/...`, the package self-reference, or `privateOwner` (`test_env/support/r10-private-owner-harness.mjs` reads the emitted file with `fs.readFileSync`), all at lane run time. |
| `test_env/support` (40), `test_env/falsifiers` (4), `test_env/uat` (4: `continuation.mjs`, `continuation.test.mjs`, `harness.test.mjs`, `public-setup.mjs`), `test_env/fixtures` modules (3: `r10-projection-family/s01-store.mjs`, `t287-management-supervision/archive-supervisor.mjs`, `fresh-public-read.mjs`) | Built modules under the tenant root or under an installed Product root, at run time. |
| `test_env/fixtures` data (2: `continuation-causation.json`, `r10-projection-family/s01-attempt-01/events-01/runtime.events.jsonl`), `test_env/proof/abi5-root-r10.*` (4) | Recorded inventory strings, not readers. |
| `code/src` (24 files) | `modulePath: "build/code/src/..."` locators, resolved in the packed or installed Product at run time. `abg/definition_event_resource.ts:465` compares a package.json export string. |
| `package.json`, `package-lock.json`, `tsconfig.json` | `exports`, `bin` and `files` name `build/`; `outDir`. |
| `product-toolchain-manifest.json`, `contracts/worksite/command-execution-context.inventory.json` | Generated by the build; they name build paths. |
| Git readers | `code/src/implementation/release_publication.ts:67` runs `git cat-file blob <commit>:<member.path>` over a caller-granted source inventory. The `t287-release-publication` and `t287-release-acceptance` lanes run git only in scratch fixture repositories (`subject.txt`). No test or script runs git against the tenant. |
| Outside the tenant | No tracked file outside the tenant and `.ai-workspace/` names a tenant build path. The `.ai-workspace/comments/codex/**` scripts that do are historical records. Those that run git read past commits, whose blobs survive untracking. |

The build had 781 files under `build/`, of which these 40 were tracked. `npm run build` begins with `scripts/clean.mjs`, which removes `build/`. So every build already rewrote the tracked copies from source.

Sequence:
1. Recorded each file's committed sha256 from its `HEAD` blob (`git ls-tree -r HEAD -- build`, `git cat-file blob`). The working copies equalled them.
2. A build of the unedited head (`rm -rf build && npm run build`) regenerated all 40 byte-identical.
3. `git rm --cached` of the 40, index only. The working files stayed.
4. After the item 1 and item 3 edits, `rm -rf build && npm run build`. Exit 0, so the C2 pin passed.
5. All 40 regenerated files have the committed digest: 40 of 40 equal, 0 differing. None of the 40 depends on `validator/qualification_contracts`.
6. `git status --short` under `build/` shows the 40 `D` entries and nothing else, because `build/` is ignored at the tenant `.gitignore:2` and the root `.gitignore:6`.

No `.gitignore` was edited.

Digest table, committed (`HEAD` blob at `97c861252`) against regenerated (final build):

| # | Path (under `build/code/src/`) | Committed sha256 (`HEAD` blob) | Regenerated sha256 | Equal |
|---|---|---|---|---|
| 1 | `abg/actor_process.d.ts` | `657d8fddbd24366a7809b0dcbd2311c4ccbb2098fed43953617f6d37cdc31b9a` | `657d8fddbd24366a7809b0dcbd2311c4ccbb2098fed43953617f6d37cdc31b9a` | yes |
| 2 | `abg/actor_process.js` | `661495f4338206410f740cf797db066795e9d58ae4da3040d51a6fc7d70aeb4e` | `661495f4338206410f740cf797db066795e9d58ae4da3040d51a6fc7d70aeb4e` | yes |
| 3 | `abg/c_call_outcome.d.ts` | `6c648fd6971936f638daaa13d88d0d45884c652248163dc2d843b10f120942d1` | `6c648fd6971936f638daaa13d88d0d45884c652248163dc2d843b10f120942d1` | yes |
| 4 | `abg/c_call_outcome.js` | `4d20e2cb316c4ac9d4dd5d965b6d68f9e2ffaafae79eb370f6d99f858264c507` | `4d20e2cb316c4ac9d4dd5d965b6d68f9e2ffaafae79eb370f6d99f858264c507` | yes |
| 5 | `abg/event_store.js` | `e7753034202a33fcdc77a6ee2dfcb5e3a4629f7e8a76913818b58daa4733c124` | `e7753034202a33fcdc77a6ee2dfcb5e3a4629f7e8a76913818b58daa4733c124` | yes |
| 6 | `abg/instruction_assembly.d.ts` | `1c5c95898228cdd845e0b9c966e9f881228730e9111a28ef0d60becad5b2958a` | `1c5c95898228cdd845e0b9c966e9f881228730e9111a28ef0d60becad5b2958a` | yes |
| 7 | `abg/instruction_assembly.js` | `988e21776dd573d552afe2aa47df5756733147cdbcb6e69e3afe7432bdba6a22` | `988e21776dd573d552afe2aa47df5756733147cdbcb6e69e3afe7432bdba6a22` | yes |
| 8 | `abg/semantic_job.d.ts` | `7568464b27f006169ad49cde2aa4bc43d54538633ce8d85eb86e05b35563ca67` | `7568464b27f006169ad49cde2aa4bc43d54538633ce8d85eb86e05b35563ca67` | yes |
| 9 | `abg/semantic_job.js` | `e2b51737817d9655c593895154582f8b59b98017586a556c98222223ab679fc5` | `e2b51737817d9655c593895154582f8b59b98017586a556c98222223ab679fc5` | yes |
| 10 | `abg/semantic_revision.d.ts` | `a01620b54cfe92f84da59b5c147d1f09113dfed0225d91b298a22cf6e195e387` | `a01620b54cfe92f84da59b5c147d1f09113dfed0225d91b298a22cf6e195e387` | yes |
| 11 | `abg/semantic_revision.js` | `44894eb18bd4c4d570214160debf421d8af645af8e4d11eb6fa9f43069752e48` | `44894eb18bd4c4d570214160debf421d8af645af8e4d11eb6fa9f43069752e48` | yes |
| 12 | `abg/worksite_revision.js` | `35ebd288e90bda739657baaead217b4721f1372a01331daffb1ea3661b32c680` | `35ebd288e90bda739657baaead217b4721f1372a01331daffb1ea3661b32c680` | yes |
| 13 | `gtl/registered_selection.d.ts` | `cc2b8ffaa47b16bcdf429f2b74911d1470dce2ef38882ec7bb02549ff4107707` | `cc2b8ffaa47b16bcdf429f2b74911d1470dce2ef38882ec7bb02549ff4107707` | yes |
| 14 | `gtl/registered_selection.js` | `52df5cf6ef1cbc3ffb8d4c8368f0fc8d2353cc018eac0df3841539ab6b75827a` | `52df5cf6ef1cbc3ffb8d4c8368f0fc8d2353cc018eac0df3841539ab6b75827a` | yes |
| 15 | `gtl/semantic_revision_identity.d.ts` | `2c3bb9ee18446fe4f832ebe7f3964476747477369ff53fa268bd852e68bfbd7e` | `2c3bb9ee18446fe4f832ebe7f3964476747477369ff53fa268bd852e68bfbd7e` | yes |
| 16 | `gtl/semantic_revision_identity.js` | `f7d7b0c3e6498c7083de85b09e38dc4cfea3dbc61bd317f490884619a26e646c` | `f7d7b0c3e6498c7083de85b09e38dc4cfea3dbc61bd317f490884619a26e646c` | yes |
| 17 | `gtl/semantic_revision_publication.d.ts` | `07ab5b91484c005d20d7542d13c80e60918b5bbe132e791319ba43182100ce16` | `07ab5b91484c005d20d7542d13c80e60918b5bbe132e791319ba43182100ce16` | yes |
| 18 | `gtl/semantic_revision_publication.js` | `1f69efe428c5a99fa2e9f92267e92313f6ca76908b86563c802a79e5a6c39be4` | `1f69efe428c5a99fa2e9f92267e92313f6ca76908b86563c802a79e5a6c39be4` | yes |
| 19 | `gtl/stdo_run_environment.d.ts` | `b03d4f4b2c9db407393474889f5922973ce6f62f620a016c18c1711f2a8ae44f` | `b03d4f4b2c9db407393474889f5922973ce6f62f620a016c18c1711f2a8ae44f` | yes |
| 20 | `gtl/stdo_run_environment.js` | `5b5c6d533f2dd33d5cf85e4467ebaad9cc321aa5a7cbabe02ab249924909c9dd` | `5b5c6d533f2dd33d5cf85e4467ebaad9cc321aa5a7cbabe02ab249924909c9dd` | yes |
| 21 | `gtl/worksite_command_execution.js` | `929aed93c9efadfd6069bcc7e7eceff10e11669881b770d61a4aaaa78c134ca2` | `929aed93c9efadfd6069bcc7e7eceff10e11669881b770d61a4aaaa78c134ca2` | yes |
| 22 | `hog/ccall_lifecycle.d.ts` | `c2bdb9be9e0bab6cd62506643fd21cdd72c9036adb89936f480e6f00741dfd0f` | `c2bdb9be9e0bab6cd62506643fd21cdd72c9036adb89936f480e6f00741dfd0f` | yes |
| 23 | `hog/ccall_lifecycle.js` | `9de91bb9445909995c8318b108ffb95098e25c0259b5fb108b063b778bc8c750` | `9de91bb9445909995c8318b108ffb95098e25c0259b5fb108b063b778bc8c750` | yes |
| 24 | `implementation/semantic_revision.d.ts` | `fe2d9dea45ab616e630b820f0b065eecc9b2f08015a9ca4d3502b83ef43ca669` | `fe2d9dea45ab616e630b820f0b065eecc9b2f08015a9ca4d3502b83ef43ca669` | yes |
| 25 | `implementation/semantic_revision.js` | `85358c2de98105327f13b7cfba0ff9e91019a9721bbe2f8ccefdecfe9f92c98e` | `85358c2de98105327f13b7cfba0ff9e91019a9721bbe2f8ccefdecfe9f92c98e` | yes |
| 26 | `implementation/semantic_stage.js` | `4e5601210e53b337054862879fe4d76938ddae7f4d1591d216766f2a042dacd3` | `4e5601210e53b337054862879fe4d76938ddae7f4d1591d216766f2a042dacd3` | yes |
| 27 | `implementation/worksite_command_execution.d.ts` | `0512f70d79d764ce79d4b807f7ba04d1100bd9f73fb20a6ad7980bde91afb257` | `0512f70d79d764ce79d4b807f7ba04d1100bd9f73fb20a6ad7980bde91afb257` | yes |
| 28 | `implementation/worksite_command_execution.js` | `430d99b3bed468fe0c54e13c5a06e8902fa375a02a205db815198d7d101420fd` | `430d99b3bed468fe0c54e13c5a06e8902fa375a02a205db815198d7d101420fd` | yes |
| 29 | `product/builtin_semantics.js` | `5ce59acc7e313e1decbc1e7e6f7bc1be093aaf73e72391c0a1ddac645fd4b3d4` | `5ce59acc7e313e1decbc1e7e6f7bc1be093aaf73e72391c0a1ddac645fd4b3d4` | yes |
| 30 | `product/execution_resolution.js` | `37fac4e47cc7a06d66df11d2141061e69b5a443d50735500176a087e2b974175` | `37fac4e47cc7a06d66df11d2141061e69b5a443d50735500176a087e2b974175` | yes |
| 31 | `product/index.d.ts` | `3a7fc1e7383e4ad535d334a1d17a2c8b345fc5b4b60cbcd5007240f21380d066` | `3a7fc1e7383e4ad535d334a1d17a2c8b345fc5b4b60cbcd5007240f21380d066` | yes |
| 32 | `product/index.js` | `d9ee80f110f679fff03dc01b82824297cd85ecc65ef4b02a144b8018cbcd5fcf` | `d9ee80f110f679fff03dc01b82824297cd85ecc65ef4b02a144b8018cbcd5fcf` | yes |
| 33 | `product/registered_selection_native.d.ts` | `907ef7fabaa339df7701763a77dc825f3e0b4e801f71314f99da17eb0113f65d` | `907ef7fabaa339df7701763a77dc825f3e0b4e801f71314f99da17eb0113f65d` | yes |
| 34 | `product/registered_selection_native.js` | `d3b91febf0992e14e71c4dcc32f0fa1a6d9dcdc2f76ac5e2d89c831209609d35` | `d3b91febf0992e14e71c4dcc32f0fa1a6d9dcdc2f76ac5e2d89c831209609d35` | yes |
| 35 | `product/semantic_job.d.ts` | `81ee424a1f89b75007045846cda4e66fc9777c4fc7fb7d39407b92fb702b4c76` | `81ee424a1f89b75007045846cda4e66fc9777c4fc7fb7d39407b92fb702b4c76` | yes |
| 36 | `product/semantic_job.js` | `726bf1f207ae069e37dbd1a3e7fdd0f839bfdafade89ea0daa5fd2bf9730b21a` | `726bf1f207ae069e37dbd1a3e7fdd0f839bfdafade89ea0daa5fd2bf9730b21a` | yes |
| 37 | `product/semantic_revision.d.ts` | `712c79b260618f2568e202f9c1bb2cf146d98a32abcb03953e676f8dfb8302d0` | `712c79b260618f2568e202f9c1bb2cf146d98a32abcb03953e676f8dfb8302d0` | yes |
| 38 | `product/semantic_revision.js` | `64cd15d7c831bce0a32ddb72020ad70346ccec0a04989f38e7bfedb89df30adf` | `64cd15d7c831bce0a32ddb72020ad70346ccec0a04989f38e7bfedb89df30adf` | yes |
| 39 | `product/worksite_command_execution.d.ts` | `280d878ae2197349a0962f4552b4a4500701dd7a32c3daa46597cbf33b97b457` | `280d878ae2197349a0962f4552b4a4500701dd7a32c3daa46597cbf33b97b457` | yes |
| 40 | `product/worksite_command_execution.js` | `a8d7035f451e9f8459e5ff696ef520d440efc7a32bce2481374cae577e693182` | `a8d7035f451e9f8459e5ff696ef520d440efc7a32bce2481374cae577e693182` | yes |

**Item 3: the Run-read test states the whole-prefix law.** The test is `test_env/tests/r10-projection-contracts.test.mjs:109`, renamed "a prefix holding a malformed liveness event is not admitted history: Run and workspace reads over it refuse". `:146` (formerly `:142`) now asserts `unrelated.RunProjectionPort.run_result(packet('run_result')).code === 'invalid_history'`, as the target-scope reads do. It replaces the `deepEqual` on `terminalResult`. A four-line comment above it cites the site. The positive `original` assertions and the three target and workspace `invalid_history` assertions are unchanged. No production edit.

Refusal site, observed on the head build with a scratch probe (`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c1/probe_r10.mjs`). The probe ran the test's own `malformed` rows and the `privateOwner` override, plus the internal `prepareRead` and `projectValue`.
- The site is `code/src/abg/project_read_ports.ts:1537`, the projector catch of `projectPreparedRead` (`:1525`, catch `:1533-1539`). Message: "ABG project read owner projectors refused the durable event history".
- `prepareRead` admits the prefix, so the refusal does not come from `:670`. It does not come from `:912` either.
- The caught throw comes from `projectRunResult` (`:1041`) → `canonicalRunContext` (`:784`) → `runContext` (`:686`) → `projectOwnedRunReplayContext` (`abg/replay.ts:2171`) → `replayValidatedRuntimeEventPrefix` (`replay.ts:899`) → `deriveReplayPrefixFacts` (`:925`) → `deriveRuntimeHeldFluentProjection` (`abg/event_calculus.ts`) → the calculus fold → `deriveLiveness` (`abg/calculus/rules.ts:104`), which throws `TypeError` "native liveness effect has no exact admitted source/threshold relation" at `rules.ts:113`.
- The replay folds the whole prefix, whichever Run is selected. So the same site and the same cause answer all six reads: unrelated-scope `run_result`, `run_replay` and `workspace_replay`, and target-scope `run_result`, `run_replay` and `workspace_replay`.

No Public read outcome changed beyond the ruled refusal: the lane's other nine tests are unchanged and pass. The lane goes from 10/9/1/0 to 10/10/0/0.

**Item 5: lanes.** Run one at a time from the tenant with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`. Before means the head build; after means the final build. Counts are tests/pass/fail/skipped.

| Lane | Before | After | Red or skipped identities |
|---|---|---|---|
| `npx tsc --noEmit -p tsconfig.json` | clean | clean | |
| `npm run lint:imports` | 28 modules, clean | 28 modules, clean | |
| `npm run lint:lifecycle` | 284 modules, 10 allow-listed, no offender | same | |
| `npm run build` | exit 0, C2 pin passes | exit 0, C2 pin passes | |
| `r10-projection-contracts` | 10/9/1/0 | 10/10/0/0 | before: red "Run reads validate selected liveness while workspace replay retains the complete calculus" (`:142` `TypeError` reading `terminalResult`); after: the renamed test passes |
| `t287-value-equality` | 4/4/0/0 | 5/5/0/0 | +1 case (item 1) |
| `t287-qualification-scopes` | 17/17/0/0 | 17/17/0/0 | |
| `t287-qual056-material` | 7/7/0/0 | 7/7/0/0 | |
| `t287-qualification-carrier-resource` | 7/0/0/7 | 7/0/0/7 | the same seven skipped before and after |
| `t287-default-library` | 20/17/0/3 | 20/17/0/3 | the same three skipped: native observation facts…, one installed Public default-library invocation…, selector planning fits… |
| `t287-c2-core-environment` | 3/3/0/0 | 3/3/0/0 | |
| `m5-c-algebra-validation` | 22/19/0/3 | 22/19/0/3 | the same three skipped: M5 complete resolution refuses…, M5 F_H-only roots…, M5 resolves and independently validates… |

Red identities are the same before and after except for the ruled R10 test. No new red. After the lanes, `git status` shows no tracked change beyond the files listed below.

**Files in the commit.**
- `code/src/validator/qualification_contracts.ts`: the one export and its import.
- `test_env/tests/t287-value-equality.test.mjs`: the one case.
- `test_env/tests/r10-projection-contracts.test.mjs`: the one test.
- `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`, as regenerated.
- The forty index deletions under `build/code/src/`.
- This section.

**Stops.** None. `qualificationHash` is canonical-JSON digest equality. No reader needs a tracked `build/` file from git. All 40 regenerated byte-identical. No Public read outcome changed beyond the ruled refusal.
