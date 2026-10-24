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

## C-1 disposition (Executive, 2026-10-24)

Accepted at `2c9878c3b`. Executive check on that head: `tsc --noEmit` clean; both lints (28 modules; 284 modules, 10 allow-listed, no offender); `npm run build` rc 0 and no regenerated diff; `r10-projection-contracts` 10/10; `t287-value-equality` 5/5; `t287-qualification-scopes` 17/17; `t287-qual056-material` 7/7; `m5-c-algebra-validation` 22/19/0/3; `t287-default-library` 20/17/0/3 (`exec_check_C1.log`). The commit carries the 46 files the grant names: the restored export and its import, the two regenerated digest files (every changed value a digest following the product content digest, which the restored export changes), the Run-read test, the one `t287-value-equality` case, the 40 `build/code/src` deletions and this record; `git show --name-status` counts 40 deletions under `build/`.

The Return meets the contract. Item 1: the body is restored and the equivalence to the deleted digest comparison is argued from `qualificationHash` being `sha256Canonical` since `5f4a1d4c9`, so digest equality is canonical-JSON text equality, which `canonicalEquals` decides with the same throws in the same order; the lane proves it through both package entries with the deleted comparison as the oracle. Item 2: the census finds no reader that takes a `build/` file from git; the 40 regenerate byte-identical; the C2 pin passes. Item 3: the refusal site is the catch in `projectPreparedRead` (`abg/project_read_ports.ts:1537`), the cause is `deriveLiveness` (`abg/calculus/rules.ts:113`) throwing on the planted event during the whole-prefix fold, the same site answering all six Run and workspace reads; the test now states the whole-prefix law (ruling: a log holding a malformed row is not admitted history).

One defect against the design's completion condition, carried into C-2 as item 0 rather than a package of its own: the restored body takes `(a: unknown, b: unknown)` and casts both operands `as JsonValue` into `canonicalEquals`. Post-close repair C closed that cast class at every census site that feeds an equality atom (§10.3 O-TYPE); the Worker kept the deleted body's signature to conserve its outcome on a class instance, but the export has no consumer in `code/src` or outside it, so the lawful shape is the typed signature (class T), with no runtime change for any JSON operand. The §9.3 `command_failed` sentence was placed at activation (`97c861252`). No register row: the S items are not TD rows. No stops.

## C-2 activation (Executive, 2026-10-24; the lifecycle reader: one prefix-level exact read for the seven lifecycle point queries)

Debt (T-290 Phase C row "Lifecycle reader"; register TD-07, Conditional). TD-07 (`ea18189e3`) routed 30 exact point queries from `holdsAt(deriveRuntimeHeldFluentProjection(prefix), pattern)` to `runtimeFluentHoldsAtPrefix(prefix, fluent, ordinal?)` (`code/src/abg/event_calculus.ts:332-340`), which answers from the fold's own derivation (`eventCalculusDerivation(prefix).fluentAt(runtimeFluentKey(fluent), ordinal)`) without materializing and sorting the held set. Seven sites decide a §4.4 lifecycle fluent with an identity-bound pattern (name and identity both set, so the pattern names exactly one fluent) and still copy and sort the whole held set per question: `abg/runtime_liveness.ts:840-843` (`actor_process_live`; at-prefix or before-event cut), `abg/actor_process.ts:636-640` (the local `lifecycle(name)` reader over one `deriveRuntimeHeldFluentProjection(prefix)`: `actor_process_live`, `actor_process_termination_unconfirmed`, `actor_cleanup_pending`), `abg/c_call.ts:2028` and `:6632` (`actor_process_terminated`), `abg/invocation_admission.ts:522-523` (`actor_process_terminated` per actor over one `runCalculus` projection), `abg/replay.ts:2458-2461` (`actor_process_terminated`), `abg/worksite_construction_recovery.ts:55-58` (`actor_process_terminated`). TD-07 stopped on them because `scripts/check-lifecycle-boundary.mjs` (`isHoldsAtPatternName`, `:94-102`; the visit at `:169`) admits a lifecycle fluent name outside `abg/calculus/` only as the `name` of a pattern passed to `holdsAt`, and the design says `holdsAt` is the only admitted reader (§5 `:285` row and `:290`; §9.1 `:536`; P-LAYER `:641`, last sentence). The owner ruled (T-290 Phase C): one prefix-level reader on the same fold's recorded transitions, the lint extended, the seven point queries routed. The design sentences are the Executive's and are restated at acceptance; your Return names them.

Items.

0. C-1's residual (a defect against §10.3 O-TYPE, carried here from the C-1 disposition). `sameQualificationValue` (`code/src/validator/qualification_contracts.ts:478`) takes `(a: unknown, b: unknown)` and casts both operands `as JsonValue` into `canonicalEquals`, the cast class post-close repair C closed at every census site that feeds an equality atom. Retype it `(a: JsonValue, b: JsonValue): boolean => canonicalEquals(a, b)`: class T, the signature states the admitted domain, no cast, no runtime change for any JSON operand. The `t287-value-equality` case keeps its oracle and its rows (the lane is `.mjs`, so its class-instance and `NaN` rows still run as JS calls). State in the Return that no caller in `code/src` or `test_env` passes a non-`JsonValue` static type (`tsc` is the check).

1. The reader. `runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name, identity }), ordinal?)` becomes the admitted lifecycle reader beside `holdsAt`. It answers from the derivation the fold records, never from a copied payload field, from an event kind's presence or from a second store (§9.1 item 3). State by reading, with lines, that `fluentAt(runtimeFluentKey(fluent), ordinal) !== null` for the key of `name(identity)` equals `holdsAt(deriveRuntimeHeldFluentProjection(<prefix at that ordinal>), constructRuntimeFluentPattern({ name, identity })).length !== 0`: a pattern with both components set matches exactly that key (`ownedRuntimeFluentMatchesPattern`), and TD-07's equivalence case in `t287-calculus-fold` covers exact fluents at at-prefix and before-event cuts.
2. The lint. Extend `check-lifecycle-boundary.mjs` so a lifecycle fluent name is also admitted as the `name` of a `constructRuntimeFluent` argument (the object literal, directly or as that call's argument) passed to `runtimeFluentHoldsAtPrefix`. Nothing else widens: a lifecycle name in any other position still fails; the `scopeAbsence`/`directExit` rule is unchanged; the header comment states both admitted forms. The three allow-list entries for `actor_process.ts:638-640` are deleted when that local reader is routed (a stale entry fails the lint, so the Return shows the allow-listed count moving from 10 to 7). Negative check: a scratch `.ts` under `code/src` that binds `constructRuntimeFluent({ name: "actor_process_live", identity: x })` to a variable and compares it without passing it to the reader still prints an offender; quote the output and delete the file before committing.
3. Route the seven. Each site keeps its prefix, its cut and its guard order exactly. `runtime_liveness.ts:840-843`: the at-prefix cut reads `prefix`; the before-event cut reads the same `validatedRuntimeEventPrefixBeforeEvent(prefix, boundary.eventId)` prefix it builds today (TD-07's routed shape at `worksiteSelectedOccurrenceInputCurrent`, `event_calculus.ts:352-359`); say so. `actor_process.ts:636-640`: `lifecycle(name)` becomes the exact read on `prefix` with `constructRuntimeFluent({ name, identity: processRef })`; `held` disappears. `invocation_admission.ts:522-523`: `runCalculus` disappears; per actor one exact read on `runPrefix`. `c_call.ts:2028`, `:6632`, `replay.ts:2458-2461`, `worksite_construction_recovery.ts:55-58`: the same substitution on the prefix each already names. An import of `holdsAt`, `deriveRuntimeHeldFluentProjection` or `constructRuntimeFluentPattern` is removed from a file when no use remains. No other site changes; no `abg/calculus/` edit.
4. Proof. (a) The lanes that exercise each site, before and after, identical: census them (grep `test_env/tests` for the seven module paths and for the five fluent names; name the lanes per site). (b) One lifecycle equivalence case added to TD-07's equivalence case in `t287-calculus-fold.test.mjs`: over a fixture whose held set carries the five lifecycle fluents (TD-07's Return names "each lifecycle fixture has 3 to 9 keys"; use the one it used), at every cut, for every held (name, identity) and one absent identity per name, the exact read equals the `holdsAt` pattern read, at the at-prefix and the before-event cut. (c) `npm run lint:lifecycle` exit 0 with 7 allow-listed sites; the negative scratch of item 2 fails.
5. Records. Quote the design sentences the routing contradicts (`:285` "instead of calling `holdsAt` with a pattern naming that fluent"; `:290` "`holdsAt` is the only admitted reader"; `:536` "answered from the fold of `L` through `holdsAt`"; `:641` "No module outside `abg/calculus/` decides a lifecycle fluent except through `holdsAt`") and propose the wording that admits the prefix-level reader on the same fold; the Executive edits the design. The register TD-07 row is the Executive's.
6. Lanes. `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`, `npm run build`; before and after: `t287-calculus-fold` (12/12 at head), `m5-worker-transport` (23/23), `t287-owned-process-lifetime` (18/18), `t287-lifecycle-failure-carrier` (5/5), `t287-runtime-activity-quiescence` (1/1), `m5-terminal-quiescence-owner` (7/7), `forward-command-contracts` (10/10), `t287-route-reconstruction` (10/8/0/2), `m5-retry-lifecycle-authority` (9/4/5/0, red at head), `m5-event-calculus-runtime` (19/13/5/1, red at head), `t287-worksite-construction` (3/0/3/0, red at head, error text carries per-run digests), `t287-worksite-branch-construction` (red at head, likewise), `t287-worksite-command-execution` (10/10, installed cases, about nine minutes), `t287-value-equality` (5/5, item 0), and the lanes item 4(a) adds. Report tests/pass/fail/skipped and the red identities (file:line, test name, first error) before and after; the same, or the difference named. Lanes run one at a time from `build_tenants/abiogenesis/typescript` with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 test_env/tests/<lane>.test.mjs`.

Grant: `code/src/validator/qualification_contracts.ts` (the one export of item 0), `test_env/tests/t287-value-equality.test.mjs` (that case only, if it needs a change), `code/src/abg/runtime_liveness.ts`, `code/src/abg/actor_process.ts`, `code/src/abg/c_call.ts`, `code/src/abg/invocation_admission.ts`, `code/src/abg/replay.ts`, `code/src/abg/worksite_construction_recovery.ts` (the seven sites and their now-unused imports only), `scripts/check-lifecycle-boundary.mjs`, `test_env/tests/t287-calculus-fold.test.mjs` (the one case of item 4(b)), the two tracked files `npm run build` regenerates (`contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`) if it changes them, and this record (append only, your section). No design edit; no `abg/calculus/` edit; no other file.

Stop (write it in the Return, keep the rest moving): a site whose pattern leaves `identity` null (a wildcard is not an exact read; it stays on `holdsAt`); a site whose prefix or cut would have to change to route it; a lifecycle answer that differs between the two readers at any cut in item 4(b); any lane whose red identities change.

Return contract: one commit on `main` with the first line `C-2: the seven lifecycle point queries read the fold's exact transition; the lint admits the prefix-level reader; sameQualificationValue typed` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`. Append `## C-2 return` at the end of this record with the equivalence statement (item 1), the lint diff and the negative check output (item 2), the seven sites before and after (item 3), the proof (item 4), the design sentences and proposed wording (item 5), the lane table (item 6), and any stops. Nothing above your section is edited.

## C-2 return

Worker: Opus 5.5, fresh context. Code base `638819314`. The commit's parent is `1d64e2651`, an Executive commit that landed during the package; it changes only the T-287 and T-290 ticket files and touches no C-2 file, grant or contract. This package's single commit follows it on `main` and is not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/`, and `abg/` means `code/src/abg/`. Lines "before" are at `638819314`; lines "after" are in the commit. No stops.

| Item | State | After |
|---|---|---|
| 0. `sameQualificationValue` typed | done | `code/src/validator/qualification_contracts.ts:478` |
| 1. The reader: equivalence by reading | done | below |
| 2. The lint | done; 10 → 7 allow-listed; negative check fails as required | `scripts/check-lifecycle-boundary.mjs:1-15`, `:92-111`, `:176` |
| 3. Route the seven | done, all seven; no stop | table below |
| 4. Proof | done: (a) census of 77 lanes, before and after; (b) one case, `t287-calculus-fold.test.mjs:432`; (c) lint exit 0 with 7 | below |
| 5. Records | design sentences quoted, wording proposed; no design edit | below |
| 6. Lanes | done; no red identity changed | below |

**Item 0.** `:478` now reads `export const sameQualificationValue = (a: JsonValue, b: JsonValue): boolean => canonicalEquals(a, b);`. It has no cast, and its body is the same call with the same operands, so it decides identically for every JSON operand. `canonicalEquals` takes `(left: JsonValue, right: JsonValue)` (`shared/value/equality.ts:16`). The `JsonValue` type import (`:3`) was already in use by `qualificationHash` (`:477`). The definition is the only occurrence of the name in `code/src`, and `npx tsc --noEmit -p tsconfig.json` exits 0. `tsc` covers `code/src` only. The one other caller is `test_env/tests/t287-value-equality.test.mjs:216-238`, an untyped `.mjs` file, so no static type reaches the function from `test_env`. That case is unchanged, keeps its oracle and its rows (including the class-instance and `NaN` rows, which run as JS calls), and passes 5/5.

**Item 1: equivalence, by reading.** Take a lifecycle name `n` and an identity `i`. At each of the seven sites, `i` is guarded non-empty (item 3). Let `f = constructRuntimeFluent({ name: n, identity: i })` (`abg/calculus/axioms.ts:1654-1668`). Then `f.fluentRef` is `` `${n}(${i})` `` (`:1666`), and `n` contains no parenthesis (`assertFluentName`, `:1648`). `P` is the prefix the site reads, and the ordinal is the default, `lastOrdinal(P)`.

- **The exact read.** `runtimeFluentHoldsAtPrefix(P, f)` (`abg/event_calculus.ts:332-339`) returns `eventCalculusDerivation(P).fluentAt(runtimeFluentKey(f), lastOrdinal(P)) !== null`. `runtimeFluentKey` validates `f` and returns `n(i)` (`axioms.ts:1712`).
- **The pattern read.** The site's old query was `holdsAt(deriveRuntimeHeldFluentProjection(P), constructRuntimeFluentPattern({ name: n, identity: i })).length !== 0`.
  - `deriveRuntimeHeldFluentProjection` (`:317`) is `{ holds: derivation.held(P) }`.
  - `holdsAt` with a pattern over a held projection (`abg/calculus/fold.ts:293-307`) validates every held fluent (`:306`). It keeps each held `g` for which `ownedRuntimeFluentMatchesPattern(g, pattern)` holds (`axioms.ts:1745-1748`). With both members set, that is `g.name === n && g.identity === i`.
  - A held fluent is canonical: `g.fluentRef` is `g.name(g.identity)`, and names carry no parenthesis. So `n(i)` decodes to exactly one (name, identity) pair, and `g` matches if and only if `g.fluentRef === n(i)`. This is the reading the activation names: a pattern with both members set matches exactly that key.
  - `held` holds one fluent per key, so the list has length 0 or 1. Its length is non-zero exactly when the key `n(i)` is in `held(P)`.
- **`held(P)`** (`event_calculus.ts:279-284`) takes one of two paths.
  - Slow path, when `P`'s count is below the folded count: `held` collects every key whose `fluentAt(key, lastOrdinal(P))` is non-null, so membership of `n(i)` is that call itself. A key with no recorded transition is absent from `fluentKeys()`, and `fluentAt` returns null for it through the base chain (`:228-233`).
  - Fast path, at the folded count: `held` returns the owned state's `holds`. That map equals the set of keys whose `fluentAt` is non-null at `lastOrdinal(P)`, because the fold records every change to it:
    - `applyStep` pushes every change to `holds` onto `transition.fluents`, in the order it applies them: terminations at `fold.ts:238-241`, clips at `applyClip` `:202-203`, initiations at `:245-247`;
    - `memoize` records each change at the step's ordinal (`event_calculus.ts:251`, `recordFluent` `:224`);
    - `fluentAt` binary-searches for the last record at or before the cut (`:228-233`), which is the key's state at the end of that step;
    - a fork seeds `holds` from its base's `held` at the cut (`:194`), and its `fluentAt` falls through to the base, capped at `baseOrdinal`.

So the two answers are equal at every prefix and cut, from the same fold's recorded transitions. The exact read uses no copied payload field, no event-kind presence and no second store; nothing in `event_calculus.ts` or `abg/calculus/` changed.

The tests that check the equality:
- TD-07's case (`t287-calculus-fold.test.mjs:365`, tests `:409` and `:417`) covers exact fluents and exact patterns at cold, warm, streaming, fork and before-event cuts, including the lifecycle row lists.
- Item 4(b) adds the lifecycle case.

**Item 2: the lint.** Three changes; the full diff follows the list:
- the header (`:1-15`) states both admitted forms;
- `isHoldsAtPatternName` becomes `isLifecycleReaderName` (`:92-111`), over two exact (reader, constructor) pairs: `holdsAt` with `constructRuntimeFluentPattern`, and `runtimeFluentHoldsAtPrefix` with `constructRuntimeFluent`. Each pair admits the object literal passed directly to its reader, or passed as the argument of its own constructor, which is itself passed to that reader;
- the visit (`:176`) calls the new predicate.

```diff
@@ -1,11 +1,17 @@
 // Lifecycle boundary (design §9.1). Lifecycle questions about actor processes
-// are answered from the fold through `holdsAt`, and only the process owners
-// read the physical facts. Outside code/src/abg/calculus/, a `.ts` file under
-// code/src fails this check when it
-//   - writes a lifecycle fluent name in any position other than the `name` of
-//     a pattern passed to `holdsAt`
+// are answered from the fold through `holdsAt` or through
+// `runtimeFluentHoldsAtPrefix`, the exact read of the same fold's recorded
+// transitions at a prefix, and only the process owners read the physical
+// facts. Outside code/src/abg/calculus/, a `.ts` file under code/src fails this
+// check when it
+//   - writes a lifecycle fluent name in any position other than these two:
+//     the `name` of a pattern passed to `holdsAt`
 //     (`holdsAt(state, constructRuntimeFluentPattern({ name: "<fluent>", ... }))`
-//     or `holdsAt(state, { name: "<fluent>", ... })`), or
+//     or `holdsAt(state, { name: "<fluent>", ... })`), or the `name` of a
+//     fluent passed to `runtimeFluentHoldsAtPrefix`
+//     (`runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "<fluent>", ... }))`
+//     or `runtimeFluentHoldsAtPrefix(prefix, { name: "<fluent>", ... })`); each
+//     constructor admits the name only under its own reader, or
 //   - reads `scopeAbsence` or `directExit` (property access, element access or
 //     destructuring) outside the process owners listed below.
 // `actor_process_termination_unconfirmed` is also a process terminal event
@@ -44,14 +50,6 @@ const PROCESS_FACT_OWNERS = [
 // Each entry names the file, the exact trimmed line text, its line at the
 // commit that added it, and the reason it is not an offender.
 const ALLOWED = [
-  ...[
-    [638, 'const processLive = lifecycle("actor_process_live");'],
-    [639, 'const terminationUnconfirmed = lifecycle("actor_process_termination_unconfirmed");'],
-    [640, 'const cleanupPending = lifecycle("actor_cleanup_pending");'],
-  ].map(([line, text]) => ({
-    path: "code/src/abg/actor_process.ts", line, text,
-    reason: "argument of the local `lifecycle` reader (:636-637), whose only use of it is the `name` of the holdsAt pattern",
-  })),
   ...[
     [322, '"actor_cleanup_pending",'],
     [329, '"actor_process_live",'],
@@ -89,17 +87,26 @@ const isKindAccess = (node) => ts.isPropertyAccessExpression(node) && node.name.
 const propertyNamed = (node, name) =>
   ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && node.name.text === name;
 
-// The literal is the `name` of a fluent pattern that is itself an argument of
-// holdsAt, directly or through constructRuntimeFluentPattern.
-function isHoldsAtPatternName(literal) {
+// The two admitted lifecycle readers, each with the one constructor whose
+// object-literal argument may carry the fluent's `name` under it.
+const LIFECYCLE_READERS = [
+  ["holdsAt", "constructRuntimeFluentPattern"],
+  ["runtimeFluentHoldsAtPrefix", "constructRuntimeFluent"],
+];
+
+// The literal is the `name` of an object literal that is itself an argument of
+// an admitted reader, directly or through that reader's constructor.
+function isLifecycleReaderName(literal) {
   const member = literal.parent;
   if (!propertyNamed(member, "name") || member.initializer !== literal) return false;
   const object = member.parent;
-  let argument = object;
-  if (isCallTo(object.parent, "constructRuntimeFluentPattern") && object.parent.arguments.includes(object)) {
-    argument = object.parent;
-  }
-  return isCallTo(argument.parent, "holdsAt") && argument.parent.arguments.includes(argument);
+  return LIFECYCLE_READERS.some(([reader, constructor]) => {
+    let argument = object;
+    if (isCallTo(object.parent, constructor) && object.parent.arguments.includes(object)) {
+      argument = object.parent;
+    }
+    return isCallTo(argument.parent, reader) && argument.parent.arguments.includes(argument);
+  });
 }
 
 // The same-file function bound to `name`, if any.
@@ -166,7 +173,7 @@ for (const file of files) {
     findings.push({ path, line, text: lines[line - 1].trim() });
   };
   const visit = (node) => {
-    if (ts.isStringLiteralLike(node) && LIFECYCLE_FLUENTS.has(node.text) && !isHoldsAtPatternName(node) &&
+    if (ts.isStringLiteralLike(node) && LIFECYCLE_FLUENTS.has(node.text) && !isLifecycleReaderName(node) &&
       !(ALSO_EVENT_KINDS.has(node.text) && isEventKindPosition(node, sourceFile))) record(node);
     else if (!factOwner && factMemberRead(node)) record(node);
     ts.forEachChild(node, visit);
```

Nothing else widens:
- A constructor admits the name only under its own reader.
- A lifecycle name anywhere else still fails.
- The event-kind exemption, `scopeAbsence` and `directExit`, and the process-owner list are unchanged.
- The three `actor_process.ts` allow-list entries are deleted, and the replay name table (5) and recovery (2) entries remain.

Applied to unrouted head source, the extended lint printed the three `lifecycle("…")` lines as offenders (`actor_process.ts:639-641`, exit 1). That is why item 3 realizes that site as direct reads (see the site table). After routing: `check-lifecycle-boundary: 284 modules under code/src; 7 allow-listed site(s), no offender`, exit 0.

The negative check used a scratch file, `code/src/abg/zz_c2_lint_negative.ts`:
- `:3` binds `constructRuntimeFluent({ name: "actor_process_live", identity: x })` to a variable;
- `:4` compares its `fluentRef` without passing it to the reader;
- `:5` passes `constructRuntimeFluent` to `holdsAt`, a cross-pair negative;
- `:6` passes `constructRuntimeFluentPattern` to `runtimeFluentHoldsAtPrefix`, a cross-pair negative;
- `:7` is the admitted form, `runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_termination_unconfirmed", identity: x }))`.

`npm run -s lint:lifecycle` printed this and exited 1:

```
code/src/abg/zz_c2_lint_negative.ts:3: const bound = constructRuntimeFluent({ name: "actor_process_live", identity: x });
code/src/abg/zz_c2_lint_negative.ts:5: const crossA = holdsAt(projection, constructRuntimeFluent({ name: "actor_process_terminated", identity: x }));
code/src/abg/zz_c2_lint_negative.ts:6: const crossB = runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluentPattern({ name: "actor_cleanup_pending", identity: x }));
check-lifecycle-boundary: 3 offender(s), 0 stale allow-list entries
```

The admitted `:7` is not printed. The file was deleted before any `tsc` or build; after deletion the lint exits 0 with 7, and `build/` holds no `zz_*` output.

**Item 3: the seven sites.** Each site keeps its prefix, its cut and its guards. Imports of `holdsAt`, `deriveRuntimeHeldFluentProjection` and `constructRuntimeFluentPattern` were removed wherever no use remained. Five files now import exactly `{ constructRuntimeFluent, runtimeFluentHoldsAtPrefix }`. `c_call.ts` (`:87-88`) and `replay.ts` (`:28`, `:37`) keep their other imports: `replay.ts` keeps 13 `holdsAt` and 5 `deriveRuntimeHeldFluentProjection` list and carrier uses, and loses `constructRuntimeFluentPattern`.

| Site | Before | After | Prefix, cut, guards, identity |
|---|---|---|---|
| `runtime_liveness.ts`, `actor_process_live` | `:840-842` `holdsAt(deriveRuntimeHeldFluentProjection(cut === "at_prefix" ? prefix : validatedRuntimeEventPrefixBeforeEvent(prefix, boundary!.eventId)), constructRuntimeFluentPattern({ name, identity: started.processRef })).length !== 0` | `:841-843` `runtimeFluentHoldsAtPrefix(cut === "at_prefix" ? prefix : validatedRuntimeEventPrefixBeforeEvent(prefix, boundary!.eventId), constructRuntimeFluent({ name: "actor_process_live", identity: started.processRef }))` | The at-prefix cut reads `prefix`. The before-event cut reads the same `validatedRuntimeEventPrefixBeforeEvent(prefix, boundary.eventId)` it builds today, which is TD-07's routed shape at `worksiteSelectedOccurrenceInputCurrent` (`event_calculus.ts:352-359`). The guard chain `actorRef !== null && any(…) && !actorDone && started.processRef !== null && (cut === "at_prefix" \|\| boundary !== undefined)` is unchanged. The comment `:828-833` now names the exact read. |
| `actor_process.ts`, three names | `:636-640` `held = processRef === null ? null : deriveRuntimeHeldFluentProjection(prefix)`; `lifecycle(name)` over `held`; three `lifecycle("…")` calls | `:637-642` three direct reads, `processRef !== null && runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "<fluent>", identity: processRef }))`, for `actor_process_live`, `actor_process_termination_unconfirmed` and `actor_cleanup_pending` | Same `prefix`. With `processRef === null`, each read is `false` without a fold, as before. `held` and the local reader are gone. A local `lifecycle(name)` would leave the names as call arguments, which the lint still flags, so its three allow-list entries would stay live. Item 2's 10 → 7, with no widening, therefore requires the names in the constructor's `name`. The comment `:633-635` is updated. |
| `c_call.ts` `projectAdmittedActorTransport` | `:2028-2029` `holdsAt(deriveRuntimeHeldFluentProjection(prefix), constructRuntimeFluentPattern({ name: "actor_process_terminated", identity: source.processRef as string })).length !== 0` | `:2025-2026` `runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: source.processRef as string }))` | Same `prefix`. The identity is a string (`typeof` guard `:1796`) equal to the admitted process terminal's `aggregateId` (`:1930`). |
| `c_call.ts` `admitEvidenceUsingTransport` | `:6632-6633` `candidate.exitObserved === (holdsAt(…(prefix), constructRuntimeFluentPattern({ …, identity: candidate.processRef })).length !== 0)` | `:6629-6630` `candidate.exitObserved === runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: candidate.processRef }))` | Same `prefix`. The identity is guarded earlier in the same `&&` chain by `typeof candidate.processRef === "string" && candidate.processRef.length > 0` (`:6591`). |
| `invocation_admission.ts` `deriveSourceResultBasisAtPrefix` | `:521-523` `runCalculus = deriveRuntimeHeldFluentProjection(runPrefix)`, then per actor `holdsAt(runCalculus, constructRuntimeFluentPattern({ …, identity: actor.processRef })).length !== 0` | `:521-522` per actor `runtimeFluentHoldsAtPrefix(runPrefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: actor.processRef }))` | Same `runPrefix`. Per-actor guards `status !== "active" && processRef !== null && processRef.length !== 0` are unchanged, and `runCalculus` is gone. This is the one site where the fold moves from eager to lazy, and no refusal is dropped: `projectRuntimeReplayGuard(runPrefix, prefix)` at `:442` (`replay.ts:188-190`, then `deriveReplayPrefixFacts(…, guardOnly = true)`) folds `runPrefix` at `replay.ts:960`, or returns its cached guard (`:955-958`), which was produced through `:960` at the same end. Either way the fold of `runPrefix` has run before `:521`. |
| `replay.ts` `projectRuntimeActorProcessFields` | `:2458-2459` `processRef !== null && processRef.length !== 0 && holdsAt(deriveRuntimeHeldFluentProjection(prefix), constructRuntimeFluentPattern({ …, identity: processRef })).length !== 0` | `:2458-2459` `processRef !== null && processRef.length !== 0 && runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: processRef }))` | Same `prefix`, same guards. |
| `worksite_construction_recovery.ts` `actorProcessTerminated` | `:56-57` `processRef.length !== 0 && holdsAt(deriveRuntimeHeldFluentProjection(prefix), constructRuntimeFluentPattern({ …, identity: processRef })).length !== 0` | `:56-57` `processRef.length !== 0 && runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: processRef }))` | Same `prefix`; used at `:248` and `:283`. |

Evaluation order. At three sites the old code built the projection before the pattern, and the new code builds the fluent before the fold: `runtime_liveness`, `actor_process` and `c_call:2025`. The two orders differ only if the identity is the empty string, and then both throw `TypeError` with different messages. At `runtime_liveness` both throws reach the same `catch { return null; }` (`:886`). The other four sites guard the identity non-empty, so their order difference cannot be observed. No event payload key, fluent name, failure class or axiom effect changed, and no file under `abg/calculus/` or `event_calculus.ts` changed.

**Item 4: proof.**

(a) The census. I grepped `test_env/tests/*.test.mjs` for three things:
- each site module (`abg/<module>.js`, or the module name as a quoted string);
- the `test_env/support` helpers that import a site module, resolved to the lanes that import them;
- the lifecycle fluent names each site reads.

The union with item 6 is 77 lanes. Each ran once at the head build and once after, one lane at a time, with the plain command. Lanes per site:

| Site | Lanes |
|---|---|
| `runtime_liveness.ts:841` | `m5-event-calculus-runtime`, `m5-terminal-quiescence-owner`, `t287-authenticated-owner-family`, `t287-authenticated-owner-values`, `t287-calculus-fold`, `t287-event-calculus-owner-continuation`, `t287-lifecycle-failure-carrier`, `t287-management-stream-drain`, `t287-native-frame-observation`, `t287-native-work-unknown-effect`, `t287-native-workspace-work`, `t287-ordered-reconstruction` |
| `actor_process.ts:637-642` | `d1-preserved-result-mechanics`, `integration-shared-seams` (both through `d1-preserved-result-harness.mjs`), `m5-terminal-quiescence-owner`, `t287-calculus-fold`, `t287-f04a-probabilistic-result-candidate`, `t287-lifecycle-failure-carrier`, `t287-native-frame-observation`, `t287-native-work-currentness-consumers`, `t287-native-work-unknown-effect`, `t287-native-workspace-work`, `t287-runtime-failure-diagnostic`, `t288-instruction-assembly-owner` |
| `c_call.ts:2025`, `:6629` | the 54 lanes that import `abg/c_call.js`, directly or through `d1-preserved-result-harness`, `malformed-gtl-native-fixture`, `multi-candidate-admission-owner`, `t287-generic-job-worksite` or `t287-native-work-currentness-consumers`, or that name `actor_process_terminated`. All 54 are rows of the lane table below. |
| `invocation_admission.ts:522` | `t287-native-event-time` (through its support module), `t287-native-work-reacquisition`, `t287-native-worksite-execution`, `t287-reacquisition-root-contract`, `w2-steel-single-start-closure`, plus the three `actor_process_terminated` lanes |
| `replay.ts:2458` | `m5-event-calculus-runtime`, `m5-fresh-process-reconstruction`, `m5-terminal-quiescence-owner`, `retained-route-cursor-transition`, `steel-basic-cli-source-replay`, `t287-c2-owner-coordinate-reuse`, `t287-calculus-fold`, `t287-deferred-application-restoration`, `t287-event-body-encoding`, `t287-fh-hold-open`, `t287-held-prefix`, `t287-lifecycle-failure-carrier`, `t287-ordered-reconstruction`, `t287-reconstruction-conservation`, `t287-retry-run-prefix`, `t287-route-reconstruction`, `t287-runtime-activity-quiescence`, `t287-runtime-failure-diagnostic`, `t287-undispatched-diagnostic`, `w2-steel-single-start-closure`, plus `witness-reprice-definition-binding` and `witness-run-stopped-definition-binding` (through `witness-reprice-mechanics.mjs`) |
| `worksite_construction_recovery.ts:56` | `d1-preserved-result`, `d1-preserved-result-mechanics`, `integration-shared-seams`, plus the three `actor_process_terminated` lanes. `test_env/tests/integration-d1-readonly-discriminator.mjs` is a helper that no lane imports. |

The census is by grep, as the activation specifies. A lane that imports a site module does not necessarily execute the site.

(b) The new case is `t287-calculus-fold.test.mjs:432`: "C-2: the lifecycle exact read equals the holdsAt pattern read at every at-prefix and before-event cut".
- **Fixtures.** It uses TD-07's lifecycle row lists: the four `CASES` (counterexamples A and B, spawn failure then the actor terminal, late confirmation) and `S, U, exit, A, R`. No single list holds all five lifecycle fluents; together they do.
- **Cuts.** For every row there are two cold cuts and two warm cuts:
  - cold: a fresh prefix through the row, whose before-event cut `validatedRuntimeEventPrefixBeforeEvent(prefix, row.eventId)` is asked first; then the at-prefix cut itself. A scratch copy of the case asserted, after each cold read, that the fold state serving the cut stands at that cut's last ordinal; it passed at all 15 rows, and its file was deleted. So both cold cuts read `held`'s fast path, the owned `holds` at the folded count, against `fluentAt`;
  - warm: cuts of one prefix already advanced to its end, which is the slow path of `held`.
- **Reads.** At each cut, for each of the five §4.4 names (the file's `LIFECYCLE`: `actor_cleanup_pending`, `actor_process_live`, `actor_process_spawn_failed`, `actor_process_terminated`, `actor_process_termination_unconfirmed`) with the fixture's `processRef` and one absent identity, it asserts that `runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name, identity }))` equals `holdsAt(deriveRuntimeHeldFluentProjection(prefix), constructRuntimeFluentPattern({ name, identity })).length !== 0`.
- **Extra assertions.** Every held lifecycle fluent at the cut is an asked key. Each of the five names holds at some cut, so the case is not vacuous.

Diagnostic `{"cuts":60,"reads":600,"held":84}`. All 600 reads agree. A scratch mutant reading at `lastOrdinal - 1` failed at the first at-prefix cut (`S,exit,R cold at-prefix 1: actor_process_live(process://t287/fold)`, actual `false`); its file was deleted.

The lane goes from 12/12 to 13/13, which is the named difference. The case asks the §4.4 five, as design `:285` lists them. The lint's set (`check-lifecycle-boundary.mjs:33-39`) has `terminationConfirmed_copy_disagrees` in place of `actor_process_spawn_failed`. None of the seven sites reads either of those two names.

(c) `npm run lint:lifecycle` exits 0: "284 modules under code/src; 7 allow-listed site(s), no offender". The negative scratch of item 2 fails with 3 offenders.

**Item 5: design sentences the routing contradicts, with proposed wording.** All are in `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, which is not edited. The activation's four are `:285`, `:290`, `:536` and `:641`. The activation calls `:641` P-LAYER: it is the last sentence of P-LIFECYCLE, and P-LAYER is `:643`, which restates the lint rule and the allow-list classes. Eight more lines state the old rule: `:191`, `:203`, `:209`, `:461-462`, `:554`, `:560`, `:576` and `:643`.

1. `:285` (§6 table, the `holdsAt` row, "replaces" column). Current: "… from its own recomputation over the log or from a second store, instead of calling `holdsAt` with a pattern naming that fluent; …". Proposed: "… from its own recomputation over the log or from a second store, instead of calling `holdsAt` with a pattern naming that fluent or `runtimeFluentHoldsAtPrefix` with that exact fluent (`constructRuntimeFluent({ name, identity })`), which reads the same fold's recorded transitions at the prefix; …".
2. `:290`. Current: "`holdsAt` is the only admitted reader of "is this actor process gone"; …". Proposed: "The fold is the only admitted source of "is this actor process gone": a reader asks `holdsAt` with a pattern, or asks `runtimeFluentHoldsAtPrefix` for one exact fluent at a prefix, which answers from the same fold's recorded transitions (`fluentAt`) without materializing the held set; …".
3. `:536` (§9.1 item 3). Current: "… are answered from the fold of `L` through `holdsAt`. … `holdsAt` answers admitted questions only; it does not replace the physical observation of layer 1." Proposed: "… are answered from the fold of `L` through `holdsAt` or, for one exact fluent at a prefix, through `runtimeFluentHoldsAtPrefix`, which reads the same fold's recorded transitions. … Both readers answer admitted questions only; neither replaces the physical observation of layer 1."
4. `:641` (P-LIFECYCLE, last sentence). Current: "No module outside `abg/calculus/` decides a lifecycle fluent except through `holdsAt`." Proposed: "No module outside `abg/calculus/` decides a lifecycle fluent except through `holdsAt` or `runtimeFluentHoldsAtPrefix`, the two readers of the one fold."
5. `:643` (P-LAYER). Current: "… outside `abg/calculus/` a lifecycle fluent name appears only as the `name` of a pattern passed to `holdsAt`, and only the process owners read `scopeAbsence` or `directExit`. Its allow-list names exact lines in three classes: the arguments of the actor projection's local `holdsAt` reader (`abg/actor_process.ts`), the Run quiescence name table (`abg/replay.ts`) and …". Proposed: "… outside `abg/calculus/` a lifecycle fluent name appears only as the `name` of a pattern passed to `holdsAt` or of an exact fluent passed to `runtimeFluentHoldsAtPrefix`, each constructor only under its own reader, and only the process owners read `scopeAbsence` or `directExit`. Its allow-list names exact lines in two classes: the Run quiescence name table (`abg/replay.ts`) and the check of the digest-bound transport artifact's encoded facts (`abg/worksite_construction_recovery.ts`)."
6. `:191`. Current: "…; a list consumer reads the held projection (`held`, `:279`), a reader of a §4.4 lifecycle fluent asks `holdsAt` over it, and `t287-calculus-fold` (`:365`) holds the exact read equal to the projection's point query at every cut." Proposed: "…; a list consumer reads the held projection (`held`, `:279`) and asks `holdsAt` over it; an exact point query, including every reader of one §4.4 lifecycle fluent of one process, reads `runtimeFluentHoldsAtPrefix`; `t287-calculus-fold` (`:365`, and `:432` for the lifecycle names) holds the exact read equal to the projection's point query at every cut."
7. `:203`. Current: "counterexample A, the cleanup reading of the actor projection, which reads the rule's fluents through `holdsAt` (`abg/actor_process.ts:636-640`)". Proposed: "…, which reads the rule's fluents through `runtimeFluentHoldsAtPrefix` (`abg/actor_process.ts:637-642`)".
8. `:209`. Current: "`actor_process.ts`, `replay.ts`, `runtime_liveness.ts` and every other reader of a lifecycle fact read them through `holdsAt`, with a pattern `{ kind: "runtime_fluent_pattern", name, identity }` that names one lifecycle fluent." Proposed: "`actor_process.ts`, `replay.ts`, `runtime_liveness.ts` and every other reader of a lifecycle fact read them from the fold: a point query through `runtimeFluentHoldsAtPrefix` with the exact fluent `constructRuntimeFluent({ name, identity })`, a pattern query through `holdsAt` with `{ kind: "runtime_fluent_pattern", name, identity }`."
9. `:461-462` (sequence view). Current: "R->>C: holdsAt with the RuntimeFluentPattern actor_process_terminated and processRef" and "C-->>R: RuntimeFluent rows of the RuntimeEventCalculusProjection". Proposed: "R->>C: runtimeFluentHoldsAtPrefix with the RuntimeFluent actor_process_terminated(processRef) at the prefix" and "C-->>R: whether it holds, from fluentAt over the recorded transitions".
10. `:554` (§9.2). Current: "Every reader calls `holdsAt(state, { kind: "runtime_fluent_pattern", name: "actor_process_terminated", identity: processRef })`." Proposed: "Every reader calls `runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: processRef }))` on the prefix in hand."
11. `:560` (§9.2 item 3). Current: "Read through `holdsAt` with a pattern naming `actor_process_terminated`: `abg/c_call.ts:2036` and `:6635`, `abg/replay.ts:2457`, `abg/invocation_admission.ts:514-516`, and `abg/worksite_construction_recovery.ts:55-57`, used at `:248` and `:283`." Proposed: "Read through `runtimeFluentHoldsAtPrefix` with the exact fluent `actor_process_terminated(processRef)`: `abg/c_call.ts:2025` and `:6629`, `abg/replay.ts:2458`, `abg/invocation_admission.ts:521-522`, and `abg/worksite_construction_recovery.ts:55-57`, used at `:248` and `:283`." The current line citations were already stale at head.
12. `:576` (§9.3 item 6). Current: "For an actor process it is `holdsAt` over the prefix for its lifecycle fluents, …". Proposed: "For an actor process it is the exact read `runtimeFluentHoldsAtPrefix` of each of its lifecycle fluents at the prefix, …".

**Item 6: lanes.** Gates, before and after:
- `npx tsc --noEmit -p tsconfig.json`: exit 0 both times.
- `npm run lint:imports`: exit 0 both times, 28 modules.
- `npm run lint:lifecycle`: before, 284 modules, 10 allow-listed; after, 284 modules, 7 allow-listed; no offender either time.
- `npm run build`: exit 0 both times. Before, it regenerated nothing. After, it regenerated the two tracked files, which are in the commit:
  - `product-toolchain-manifest.json`: `7e12b452…7c5279` → `f0dc3964…2c9aa7`, 138 changed leaves;
  - `contracts/capabilities/capability-definition-graph.json`: `d33d50e1…5bff90` → `01bccfd7…da29cc`, 551 changed leaves.
  
  Every changed leaf is a `sha256:` digest or a ref that embeds one, following the product content digest.

Each lane ran one at a time from the tenant root with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 test_env/tests/<lane>.test.mjs`: before, on the head build; after, on the rebuilt tree. Counts are tests/pass/fail/skipped, and no lane had a cancelled or todo test.

For red identities I compared each lane's whole failing-tests section, before and after, after normalizing per-run values: `sha256` and hex digests, UUIDs, timestamps, temporary paths, durations, and `build/…js` stack line numbers, which move because the built files changed. The sections are identical in every lane except `t287-worksite-construction` (`:688`) and `t287-worksite-branch-construction` (`:584`, `:669`). In those two, the only differing tokens are per-run measurements inside the asserted completion JSON: `elapsedMs`, `lastActivityElapsedMs`, `leaseDeadlineElapsedMs`, the store `inode`, and `prefixLength`. `prefixLength` differs by 7, 24 and 13 bytes, and tracks the lengths of the recorded elapsed numbers. The test names, locations and first error lines are the same.

Item 6 lanes:

| Lane | Before | After | Reds |
|---|---|---|---|
| `t287-calculus-fold` | 12/12/0/0 | 13/13/0/0 | none |
| `m5-worker-transport` | 23/23/0/0 | 23/23/0/0 | none |
| `t287-owned-process-lifetime` | 18/18/0/0 | 18/18/0/0 | none |
| `t287-lifecycle-failure-carrier` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-runtime-activity-quiescence` | 1/1/0/0 | 1/1/0/0 | none |
| `m5-terminal-quiescence-owner` | 7/7/0/0 | 7/7/0/0 | none |
| `forward-command-contracts` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-route-reconstruction` | 10/8/0/2 | 10/8/0/2 | none |
| `m5-retry-lifecycle-authority` | 9/4/5/0 | 9/4/5/0 | 5, same |
| `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 | 5, same |
| `t287-worksite-construction` | 3/0/3/0 | 3/0/3/0 | 3, same |
| `t287-worksite-branch-construction` | 2/0/2/0 | 2/0/2/0 | 2, same |
| `t287-worksite-command-execution` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-value-equality` | 5/5/0/0 | 5/5/0/0 | none |

The census lanes item 4(a) adds:

| Lane | Before | After | Reds |
|---|---|---|---|
| `d1-preserved-result` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `d1-preserved-result-mechanics` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `generic-input-retention` | 4/2/2/0 | 4/2/2/0 | 2, same |
| `integration-shared-seams` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `m5-event-store-reopen` | 21/21/0/0 | 21/21/0/0 | none |
| `m5-fresh-process-reconstruction` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `m5-s03-authority` | 5/1/4/0 | 5/1/4/0 | 4, same |
| `r10-projection-contracts` | 10/10/0/0 | 10/10/0/0 | none |
| `retained-route-cursor-transition` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `steel-basic-cli-source-replay` | 2/0/0/2 | 2/0/0/2 | none |
| `t287-authenticated-owner-family` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-authenticated-owner-values` | 3/1/1/1 | 3/1/1/1 | 1, same |
| `t287-c2-core-environment` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-c2-owner-coordinate-reuse` | 6/0/6/0 | 6/0/6/0 | 6, same |
| `t287-continuation-causation` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-d1-requirement-handoff` | 5/2/0/3 | 5/2/0/3 | none |
| `t287-default-library` | 20/17/0/3 | 20/17/0/3 | none |
| `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-deferred-application-restoration` | 2/0/2/0 | 2/0/2/0 | 2, same |
| `t287-event-body-encoding` | 14/14/0/0 | 14/14/0/0 | none |
| `t287-event-calculus-owner-continuation` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-f04a-probabilistic-result-candidate` | 2/1/1/0 | 2/1/1/0 | 1, same |
| `t287-fh-hold-open` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-generic-job-read-dependency` | 2/1/0/1 | 2/1/0/1 | none |
| `t287-generic-job-worksite` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-governance-covered-source-use` | 8/2/3/3 | 8/2/3/3 | 3, same |
| `t287-held-prefix` | 6/0/0/6 | 6/0/0/6 | none |
| `t287-malformed-gtl-gate` | 6/5/1/0 | 6/5/1/0 | 1, same |
| `t287-management-stream-drain` | 8/4/0/4 | 8/4/0/4 | none |
| `t287-multi-candidate-admission` | 75/75/0/0 | 75/75/0/0 | none |
| `t287-native-assessment-evidence` | 4/1/3/0 | 4/1/3/0 | 3, same |
| `t287-native-c2-instruction-assembly` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-native-event-time` | 6/0/4/2 | 6/0/4/2 | 4, same |
| `t287-native-frame-observation` | 8/1/3/4 | 8/1/3/4 | 3, same |
| `t287-native-runtime-gate` | 7/6/0/1 | 7/6/0/1 | none |
| `t287-native-semantic-job` | 9/8/1/0 | 9/8/1/0 | 1, same |
| `t287-native-semantic-revision` | 9/4/4/1 | 9/4/4/1 | 4, same |
| `t287-native-structural-gates` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-native-work-currentness-consumers` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-native-work-reacquisition` | 9/6/0/3 | 9/6/0/3 | none |
| `t287-native-work-unknown-effect` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-native-worksite-execution` | 6/3/0/3 | 6/3/0/3 | none |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 | none |
| `t287-observed-worksite-command` | 8/7/1/0 | 8/7/1/0 | 1, same |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 | 4, same |
| `t287-qual056-material` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-qualification-contraction` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-qualification-parent-alias` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-qualification-producer-acquisition-reuse` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-qualification-producer-context` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-reacquisition-root-contract` | 2/1/0/1 | 2/1/0/1 | none |
| `t287-reconstruction-conservation` | 2/0/0/2 | 2/0/0/2 | none |
| `t287-release-acceptance` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-result-evidence-lineage-type-contract` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-retry-run-prefix` | 3/0/3/0 | 3/0/3/0 | 3, same |
| `t287-runtime-failure-diagnostic` | 15/15/0/0 | 15/15/0/0 | none |
| `t287-undispatched-diagnostic` | 7/5/2/0 | 7/5/2/0 | 2, same |
| `t287-worksite-file-replace-owner` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t288-composition-conservation` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t288-instruction-assembly-owner` | 11/4/0/7 | 11/4/0/7 | none |
| `w2-steel-single-start-closure` | 8/0/0/8 | 8/0/0/8 | none |
| `witness-reprice-definition-binding` | 15/0/15/0 | 15/0/15/0 | 15, same |
| `witness-run-stopped-definition-binding` | 7/0/7/0 | 7/0/7/0 | 7, same |

Red identities. There are 94, the same before and after; each is `file:line`, the test name, and the first error line. An entry at `:1:1` named "'test failed'" is a module-level failure.

- `m5-retry-lifecycle-authority.test.mjs:21:1` declared C.retry frontier is the sole retry-attempt lifecycle owner: AssertionError [ERR_ASSERTION]: declared retry frontier lost owner relation: const calculus = deriveRuntimeEventCalculusProjection(prefix);
- `m5-retry-lifecycle-authority.test.mjs:238:1` CCall retry writes require the exact current declared retry frontier: AssertionError [ERR_ASSERTION]: missing source boundary: export function openInteractionCCall(
- `m5-retry-lifecycle-authority.test.mjs:281:1` production judgment writers remain closed behind the CCall owner: AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
- `m5-retry-lifecycle-authority.test.mjs:323:1` raw executor resume remains closed to every retry cursor: AssertionError [ERR_ASSERTION]: missing source boundary: else if (initialInput?.resume !== undefined)
- `m5-retry-lifecycle-authority.test.mjs:533:1` F04 payload refusal composes one pure result rejection while authority refusal cannot retry: AssertionError [ERR_ASSERTION]: missing source boundary: /**
- `m5-event-calculus-runtime.test.mjs:372:1` A5-F10 exact CCall opening accepts rehydrated carriers and refuses repeat or stale prefixes with zero append: TypeError [Error]: abg.openCall is not a function
- `m5-event-calculus-runtime.test.mjs:1316:1` terminal projection rows realize static locus law for the exact Run and preserve unrelated loci: AssertionError [ERR_ASSERTION]: runtime_failure_observed/runtime_invocation_active
- `m5-event-calculus-runtime.test.mjs:1471:1` run HoldsAt truth survives durable reopen and a lawful closure: TypeError [Error]: abg.openCall is not a function
- `m5-event-calculus-runtime.test.mjs:1548:1` runtime_failure_observed terminates the exact active Run: TypeError [Error]: abg.openCall is not a function
- `m5-event-calculus-runtime.test.mjs:1590:1` run_stopped makes runtime failure throw before memory or durable append: TypeError [Error]: abg.openCall is not a function
- `t287-worksite-construction.test.mjs:217:1` T-287 C1 remains singular inside the C3 composite publication: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-worksite-construction.test.mjs:361:1` T-287 C1 traverses one installed fake-Claude candidate through C0 and fresh replay: TypeError [Error]: Cannot read properties of null (reading 'nativeInstructionAssemblyBasis')
- `t287-worksite-construction.test.mjs:688:1` T-287 C1 retains an exact partial prefix when a later C0 member refuses: AssertionError [ERR_ASSERTION]: {"kind":"executable_traversal_completion","schemaVersion":"5.0.0","disposition":"failed","cCallRef":"c-call:sha256:<H>…
- `t287-worksite-branch-construction.test.mjs:584:1` T-287 C3 Parallel topology constructs canonically and closes installed C1 children: AssertionError [ERR_ASSERTION]: {"kind":"executable_traversal_completion","schemaVersion":"5.0.0","disposition":"blocked","cCallRef":"c-call:sha256:<H…
- `t287-worksite-branch-construction.test.mjs:669:1` T-287 C3 preserves outer and nested partial prefixes and never opens fan-in: AssertionError [ERR_ASSERTION]: {"kind":"executable_traversal_completion","schemaVersion":"5.0.0","disposition":"blocked","cCallRef":"c-call:sha256:<H…
- `d1-preserved-result.test.mjs:1:1` test_env/tests/d1-preserved-result.test.mjs: 'test failed'
- `d1-preserved-result-mechanics.test.mjs:1:1` test_env/tests/d1-preserved-result-mechanics.test.mjs: 'test failed'
- `generic-input-retention.test.mjs:82:1` real warm derivation and serialized cold projector agree; crossed/missing/duplicate lineage refuses: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `generic-input-retention.test.mjs:132:1` indexed immutable route membership avoids serialization and preserves detached-copy provenance: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `integration-shared-seams.test.mjs:1:1` test_env/tests/integration-shared-seams.test.mjs: 'test failed'
- `m5-fresh-process-reconstruction.test.mjs:13:1` M5 exact catalog basis and retained runtime truth reconstruct equally in two fresh processes: TypeError [Error]: abg.openCall is not a function
- `m5-s03-authority.test.mjs:96:1` S03 capability policy is exact over admitted Program interaction requirements: TypeError [Error]: capability grant requires exact workspace, policy, actor, and definition authority
- `m5-s03-authority.test.mjs:218:1` S03 continuation operation authority requires the exact admitted grant and lifecycle state: TypeError [Error]: capability grant requires exact workspace, policy, actor, and definition authority
- `m5-s03-authority.test.mjs:285:1` S03 HoG accepts one Product-sealed projection and rejects its forged twin: AssertionError [ERR_ASSERTION]: The input did not match the regular expression /exact admitted install/u. Input:
- `m5-s03-authority.test.mjs:415:1` S03 Run semantic projection maps only typed R references and preserves opaque event-shaped domain strings: TypeError [Error]: runtime event candidate has an invalid envelope
- `retained-route-cursor-transition.test.mjs:26:1` route-origin workflow cursor stages, replays, commits and cold-projects exact retained input: TypeError [Error]: traversal transition differs from its staged successor projection
- `t287-authenticated-owner-values.test.mjs:39:1` pure artifact values do not reacquire; fresh bytes, currentness and held effect checks still refuse drift: AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
- `t287-c2-owner-coordinate-reuse.test.mjs:120:1` post-stop Run and Workspace replay retain the JSON-cloned preparation owner and identical cold semantics: TypeError [Error]: child C2 source does not reproduce at its admitted preparation cut
- `t287-c2-owner-coordinate-reuse.test.mjs:195:1` C2 consumer reidentifies its copied preparation cut while preserving source/output and cold fallback: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:212:1` reopened C2 consumer retains the original native and preparation cuts without another physical read: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:227:1` a later duplicate producer invalidates current C2 consumption while its historical cut remains valid: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:238:1` C2 coordinate reuse preserves wrong/foreign cut, absent advancing producer, binding-cover and latest failed-mutation refusal: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:266:1` separate installed reacquisition realization and judgment use exact original owner; C2 occurrence stays owner-bound: TypeError [Error]: operations.nativeWorkReacquisition is not a function
- `t287-deferred-application-restoration.test.mjs:85:1` deferred restoration preserves the exact native completion prefix including observations after judgment: AssertionError [ERR_ASSERTION]: select the frozen S02 continuation-03 evidence carrier
- `t287-deferred-application-restoration.test.mjs:116:1` deferred restoration refuses another producer and the later failed native scope: AssertionError [ERR_ASSERTION]: select the frozen S02 continuation-03 evidence carrier
- `t287-event-calculus-owner-continuation.test.mjs:1:1` test_env/tests/t287-event-calculus-owner-continuation.test.mjs: 'test failed'
- `t287-f04a-probabilistic-result-candidate.test.mjs:356:1` F04-A exact request-bound raw result admission is pure and decision-exact: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-fh-hold-open.test.mjs:1:1` test_env/tests/t287-fh-hold-open.test.mjs: 'test failed'
- `t287-governance-covered-source-use.test.mjs:351:1` covered use binds exact original state, complete canonical Catalog and cold admitted coordinates: AssertionError [ERR_ASSERTION]: select the frozen bounded fixture
- `t287-governance-covered-source-use.test.mjs:386:1` later completed work follows actual admitted covered-source ancestry without root or value guesses: AssertionError [ERR_ASSERTION]: select the frozen bounded fixture
- `t287-governance-covered-source-use.test.mjs:430:1` built-in ingress preserves the whole captured34 state and independent assessment subject: AssertionError [ERR_ASSERTION]: select the frozen bounded fixture
- `t287-malformed-gtl-gate.test.mjs:60:1` Public conformance conserves dual-kind closure authorities and rejects missing or conflicting ownership: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-native-assessment-evidence.test.mjs:551:1` CCall failure projection conserves the authenticated malformed-result assessment: TypeError [Error]: profile schedule requires the original gap-free stamped history
- `t287-native-assessment-evidence.test.mjs:559:1` CCall failure projection refuses foreign producer, assessment and artifact correspondence: TypeError [Error]: profile schedule requires the original gap-free stamped history
- `t287-native-assessment-evidence.test.mjs:585:1` actor transport authentication is available before candidate association and refuses crossed facts: TypeError [Error]: profile schedule requires the original gap-free stamped history
- `t287-native-event-time.test.mjs:30:1` native HoG phase samples ignore caller seed; prepared candidate identity survives later admission and replay: AssertionError [ERR_ASSERTION]: explicit absolute proof territory required
- `t287-native-event-time.test.mjs:66:1` wall-clock rollback does not change store ordinal ordering or restamp historical bytes on lawful fresh-fixture reopen: AssertionError [ERR_ASSERTION]: explicit absolute proof territory required
- `t287-native-event-time.test.mjs:86:1` complete selected native producer field coverage samples each phase; planned candidates and probe aliases retain their sample: AssertionError [ERR_ASSERTION]: explicit proof territory required
- `t287-native-event-time.test.mjs:108:1` exact paired admission producer preserves recognition across forced clock movement; unequal-time baseline remains rejected: AssertionError [ERR_ASSERTION]: exact rejected paired producer required
- `t287-native-frame-observation.test.mjs:189:1` native controlled process preserves frame observations and owner causes: AssertionError [ERR_ASSERTION]: explicit proof-local territory
- `t287-native-frame-observation.test.mjs:209:1` frame declaration and observation-join falsifiers over an authentic read-only historical opening: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of Buffer or URL. Received undefined
- `t287-native-frame-observation.test.mjs:237:1` exact current D4 descriptor and retained historical EC rows/projections are conserved: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-native-semantic-job.test.mjs:224:1` native author fold preserves exact contract issues for same-response requirement refs outside the incoming domain: AssertionError [ERR_ASSERTION]: native failure reuses the original derivation
- `t287-native-semantic-revision.test.mjs:122:1` native D2 serialized public request chooses among eligible stages and composes the declared correction through native C2 and fresh Evidence: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-native-semantic-revision.test.mjs:270:1` native D2 root-backed binding cover authenticates source ancestry and preserves first refusals: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-native-semantic-revision.test.mjs:332:1` native D2 rejected assessor-only correction follows exact conserved requests across Runs and bindings: AssertionError [ERR_ASSERTION]: exact ancestry gets as far as the new cover
- `t287-native-semantic-revision.test.mjs:531:1` native Evidence preparation recovery conserves its exact folded producer through intake and the declared Evidence-only suffix: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `t287-observed-worksite-command.test.mjs:43:1` extended original C2 plan preserves all 26 sources through native and observed owners: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-ordered-reconstruction.test.mjs:22:1` snapshot proof identity rejects transplanted descriptors while raw and copied histories keep cold fallback: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-ordered-reconstruction.test.mjs:74:1` cold acquisition receipt detaches caller input and preserves pure, copied, explicit-fresh and current-prefix distinctions: AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
- `t287-ordered-reconstruction.test.mjs:103:1` historical durable cuts reidentify only exact owner history after physical authentication: AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
- `t287-ordered-reconstruction.test.mjs:158:1` held derivation preserves physical authentication and discards staged facts on rollback: AssertionError [ERR_ASSERTION]: exact held object, after physical byte authentication
- `t287-qualification-parent-alias.test.mjs:18:1` native parent alias conserves the original child/J and rejects crossed provenance and competing producers: AssertionError [ERR_ASSERTION]: explicit frozen fixture and isolated emitted-owner binding required
- `t287-qualification-producer-acquisition-reuse.test.mjs:1:1` test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs: 'test failed'
- `t287-release-acceptance.test.mjs:1:1` test_env/tests/t287-release-acceptance.test.mjs: 'test failed'
- `t287-retry-run-prefix.test.mjs:59:1` retry entry conserves nested attempts in one Run while the workspace retains other stopped Runs: AssertionError [ERR_ASSERTION]: select the immutable s02-installed-continuation-04 carrier
- `t287-retry-run-prefix.test.mjs:92:1` retry entry refuses foreign scope and stale source without committing a partial transition: AssertionError [ERR_ASSERTION]: select the immutable s02-installed-continuation-04 carrier
- `t287-retry-run-prefix.test.mjs:107:1` retry entry retains the failed native scope refusal and refuses an unrelated authority prefix: AssertionError [ERR_ASSERTION]: select the immutable s02-installed-continuation-04 carrier
- `t287-undispatched-diagnostic.test.mjs:93:1` undispatched refusal retains entered, routed and resumed cursor ownership at raw and cold boundaries: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-undispatched-diagnostic.test.mjs:222:1` CCall refusal completion keeps full authority across sparse multi-Run scope and cold raw admission: AssertionError [ERR_ASSERTION]: The input did not match the regular expression /authentic open-call|stage does not match/. Input:
- `t287-worksite-file-replace-owner.test.mjs:371:1` T-287 C0 Product owner atomically replaces one W-bound worksite file and fails closed: AssertionError [ERR_ASSERTION]: {"kind":"worksite_effect_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_coordinate","message…
- `t288-composition-conservation.test.mjs:1:1` test_env/tests/t288-composition-conservation.test.mjs: 'test failed'
- `witness-reprice-definition-binding.test.mjs:27:1` declared ABG constructors remain unchanged and source binding exposes only selected callables: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:36:1` exact DefinitionCall admits one native witness pair and fresh-process reads/replay agree (stubbed Product environment): AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:67:1` external approval remains exact-member only; unselected witness members remain unsupported: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:77:1` crossed or missing authority, request, resource and grant refuse before native owner: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:94:1` installed catalog coordinate cannot be substituted with internally consistent caller coordinates: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:102:1` native semantic content/context refusals return owner close handoff and no witness event: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:112:1` generic witness reprice does not implement D2 cover-selection meaning: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:118:1` native second-event transaction failure leaves neither event and preserves first cause: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:124:1` duplicate native outcome projects a typed basis refusal without forging success: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:129:1` raw Public witness with material history decodes only on acquisition and retains cold correspondence: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:147:1` copied witness packets keep I-JSON, wrong-prefix and foreign-store refusals: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:162:1` raw witness acquisition still refuses changed current physical bytes before native admission: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:169:1` all six native witness members consume the admitted held history after raw packet validation: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:205:1` Public profile reprice retains the exact L-to-P boundary and standalone cold content checks: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:226:1` successful append still requires successful physical close before any receipt: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:31:1` current Public run_status supplies the same Run and route-grade basis to stop; cold replay preserves the result: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:65:1` wrong actor, missing/crossed execution basis, grant and malformed request refuse before native admission: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:77:1` approved but false stop content or Run/basis context returns a semantic refusal and unchanged close: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:89:1` a closed Run with the authentic Public identity and basis refuses stop without appending: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:96:1` changed cold physical bytes refuse before stop admission: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:102:1` live owner stop borrows its admitted state without decoding history or releasing the enclosing owner: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:117:1` failed native stop transaction keeps both events absent and returns the first cause: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

**Findings.**
- **The activation's site-and-section citations.** The `:285` row is in §6 (Prime atoms), not §5. `:641` is P-LIFECYCLE and `:643` is P-LAYER, as item 5 says. The allow-list's recorded lines for `actor_process.ts` (`638-640`) were one line off at head (`639-641`); matching is by text, so this had no effect, and those entries are now gone.
- **Cast left in place.** `c_call.ts:2026` keeps `identity: source.processRef as string`. The item 3 substitution leaves it in place. The `typeof` guard at `:1796` may make the cast unnecessary, but this was not tested.
- **Untracked residue.** The two runs of `t287-management-stream-drain` left 12 more `stream-drain-*` directories at the tenant root; there were 6 at head, and there are 18 now. The two `test_env/context-component-*` directories were there at head. None of it is staged or deleted.

## C-2 disposition (Executive, 2026-10-24)

Accepted at `b8f66ef4b`. Executive check on that head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 7 allow-listed, no offender; `npm run build` rc 0 and no regenerated diff; `t287-calculus-fold` 13/13; `t287-value-equality` 5/5; `m5-worker-transport` 23/23; `t287-owned-process-lifetime` 18/18; `t287-lifecycle-failure-carrier` 5/5; `m5-terminal-quiescence-owner` 7/7; `t287-runtime-activity-quiescence` 1/1 (`exec_check_C2.log`). The commit carries the twelve files the grant names and no other.

The Return meets the contract. Item 0: the export is typed `(a: JsonValue, b: JsonValue)` with no cast; its only `code/src` occurrence is its definition. Item 1: the equivalence is argued by reading (a pattern with both components set matches exactly the key `name(identity)`; the fold records every change to the held set as a transition, so the recorded transitions and the held set agree at every cut) and proved by the lifecycle case at `t287-calculus-fold.test.mjs:432` (600 reads, cold and warm, at both cuts; a one-ordinal-early mutant fails). Item 2: the lint admits two reader and constructor pairs, each constructor only under its own reader; the negative scratch flagged the variable-bound construction and both cross-pairs; the allow-list moves from 10 to 7. Item 3: the seven sites keep their prefix, cut and guards; the one deviation from the activation's wording, `actor_process.ts` losing its local `lifecycle(name)` helper in favour of three direct reads, is accepted: the helper's name argument would have kept the names in a position the lint flags, and the activation asked for the 10 to 7 count. Item 4: 77 lanes identical before and after; 94 red tests with the same identities; the only differences are per-run timings, the store inode and `prefixLength` inside asserted completion JSON. Item 6: lanes as the table.

Design sentences restated by the Executive in this bookkeeping commit, from the Return's item 5: `:191`, `:203`, `:209`, `:285`, `:290`, `:461-462`, `:536` (two sentences), `:554`, `:560`, `:576`, `:641` and `:643`. Each now names `runtimeFluentHoldsAtPrefix` beside `holdsAt` as the two readers of the one fold, or carries the current line citations. Errata to the activation, accepted: the `:285` row is in §6, not §5; `:641` is P-LIFECYCLE's last sentence and `:643` is P-LAYER; the allow-list's `actor_process.ts` lines were one off at head (matching is by text; the entries are now gone).

Findings ruled. (1) The lint's name set carries `terminationConfirmed_copy_disagrees` and not `actor_process_spawn_failed`, which §4.4 (`:205`) lists among the closed lifecycle fluents. Measured: with `actor_process_spawn_failed` added, the lint reports 11 offenders, all event-kind sites (`actor_process.ts` ×6, `c_call.ts` ×2, `event_store.ts:83`, `replay.ts:352`, `runtime_liveness.ts:386`): the fluent shares its name with the owner's process terminal event kind, which those sites lawfully name. Ruling: the lint set stands; P-LAYER (`:643`) now states the set and the collision. Not a defect. (2) `c_call.ts:2026` keeps `identity: source.processRef as string` into the exact read; `source.processRef` is optional on one carrier type (`:718`) and guarded by `typeof` at `:1796` in another function. A cast that can carry `undefined` into an exact fluent key is a defect (the read would answer `false` for the key `actor_process_terminated(undefined)` instead of refusing); carried into C-3 as item 0b. (3) `t287-management-stream-drain` creates `stream-drain-` and `held-drain-` directories under the tenant root and `t287-management-context` creates `context-component-` under `test_env`, and neither removes them: 12 new directories from two runs. A lane that leaves scratch is a defect; carried into C-3 as item 0c. The 18 `stream-drain-*` and 2 `context-component-*` directories present at this acceptance are deleted (the owner's instruction of 2026-10-24 on this class).

Register: TD-07 closed at `b8f66ef4b` (its Conditional remainder was these seven sites). No stops.

## C-3 activation (Executive, 2026-10-24; `admitJson` totality with O-1, and the C-2 residuals)

Debt (T-290 Phase C row "`admitJson` totality"; register LEAF-FAILURE-DIAGNOSTIC-01 and NW-DEBT-ADMISSION-DIAGNOSTIC-01 for O-1). `admitJson` (`code/src/shared/admit/json.ts:214`, the recursion `admitAt` `:164`) documents that a throwing proxy trap throws (`:209-212`), and it overflows the stack on a cyclic or over-deep input (`RangeError`). TD-16 migrated 13 sites from the throwing lift to the outcome and kept one bare `catch` at each for exactly those throws, so their Product-boundary refusals are conserved (`packages.md`, `## TD-15 + TD-16 return`, table rows 1 to 13); the 9 throw-contract callers (rows 14 to 22) propagate as head did. The owner ruled (T-290 Phase C): the atom refuses a cycle, over-deep input and a trap throw as `non_ijson_value`, no new code; the 13 `catch` blocks are then deleted; O-1 rides with it: `deterministicFailure` takes the failure class and `finalize` builds `malformed_return` with a cold subject naming the refusal's `at` and `reason` or the thrown error's class and message (TD-17's conventions; the class and the receipt shape unchanged). TD-17's disposition retained the `finalize` catch as the one site that still totalizes without its cause.

Items.

0. The C-2 residuals (two defects, from the C-2 disposition).
   - 0b. `code/src/abg/c_call.ts:2026` reads `identity: source.processRef as string` into the exact lifecycle read. `source.processRef` is optional on one carrier type (`:718`); the `typeof` guard at `:1796` is in another function. Replace the cast with the value the guard establishes (thread the narrowed string, or guard at the site and take the carrier's existing refusal for an absent `processRef`); no cast remains at the site; state which function's guard the site now relies on. An exact read with the key `actor_process_terminated(undefined)` must be impossible by type.
   - 0c. `test_env/tests/t287-management-stream-drain.test.mjs` creates `stream-drain-` (`:21`) and `held-drain-` (`:141`) directories under the tenant root, and `test_env/tests/t287-management-context.test.mjs:327` creates `context-component-` under `ABI5_CONTEXT_PROOF_ROOT ?? test_env`; none is removed. Remove each in a `finally` (or the lane's `after` hook) when the lane created it under the default location; when `ABI5_CONTEXT_PROOF_ROOT` is set, the owner chose a root and the directory stays. No new environment variable. After a run of each lane, `git status --short` shows no new untracked directory.
1. Totality of `admitJson`. (a) A cycle: the recursion carries the set of containers on the current path; a container already on the path is refused `non_ijson_value` at the member where the path closes, with `at` and a reason naming the cycle. (b) Depth: a container nested past a bound is refused `non_ijson_value` with `at` and a reason naming the bound; choose the bound with its reason (it must admit every value the lanes and fixtures admit today; the Return names the deepest nesting the lanes exercise and the bound), and state it in the code comment at `:209-212`. (c) A trap throw: the inspection reads (`Object.getPrototypeOf`, `Reflect.ownKeys`, `Object.getOwnPropertyDescriptor`, `Array.isArray`) run user code on a proxy; a throw from any of them is caught at the value being inspected and refused `non_ijson_value` with `at` and a reason naming the thrown error's class. No getter runs (D12 stands); the admitted value for every input admitted today is byte-identical (`canonicalJson` equal); the seven codes are unchanged; the refusal shape (`code`, `path`, `at`, `reason`) is unchanged. The comment at `:209-212` states the new contract: `admitJson` returns an outcome for every input and throws for none.
2. The 13 `catch` blocks. At each of TD-16's rows 1 to 13 the `catch` that existed for `admitJson`'s throws is deleted and the outcome is read directly. Where the `try` also encloses other work (rows 5, 8, 11, 12, 13), only the admission leaves it; the other work keeps its guard and the Return names what that guard still catches. Row 12 (`leaf_invocation_port.ts:693-699`, the F_D admission) encloses only the admission: the `try` goes. Row 13 is item 3. Each site's refusal, `null` or `false` for a refused value is unchanged; the Return shows per site the before and after lines.
3. O-1, the `malformed_return` cause (`leaf_invocation_port.ts`). `deterministicFailure` (`:559`) takes the failure class as a parameter (`"implementation_exception" | "malformed_return"`) in place of the fixed `totalizedFailure("implementation_exception")`; its four existing F_D callers and the two `implementation_completion` callers pass `"implementation_exception"` and are byte-identical in effect. `finalize` (`:776-795`) builds its `malformed_return` through it: an admission refusal gives stage `implementation_completion`, reason `refused`, cause `{ at, reason }` of the refusal; a candidate the validator rejects gives reason `refused` with a reason text naming the rejection; a validator throw gives reason `thrown` with the error's class and message as `deterministicFailure` already sanitizes them; the `try` then encloses only the validator. The F_D admission (`:710-713`) takes the same route with stage `implementation_invocation`. The failure class `malformed_return`, the receipt shape, `closedProbabilisticOwnerReceipt`, `closedDeterministicOwnerReceipt` and every event payload key are unchanged; a new member of the stage or reason union, if one is needed, follows TD-17's precedent and is named in the Return. The cold subject is read back as TD-17's cases read it (`t287-runtime-failure-diagnostic`, the two cases after `:586`).
4. Proof. (a) In the lane that owns the admit family (census `test_env/tests` for `admitJson(`; name it): a self-referencing object and a self-referencing array are refused with the closing member's `path` and `at`; a value nested one past the bound is refused and one at the bound is admitted; a proxy whose `ownKeys`, `getOwnPropertyDescriptor` or `getPrototypeOf` trap throws is refused at the proxied member; a value admitted today round-trips byte-identical. (b) In `t287-runtime-failure-diagnostic`: an F_P completion whose output is cyclic, one whose output is a non-candidate, and one whose validator throws, each reach `malformed_return` whose cold subject names the refusal's `at` and `reason` or the error's class and message, through the admitted failure as TD-17's two cases do; the F_D admission the same for the cyclic and non-candidate outputs. (c) The 13 sites' lanes identical before and after (item 6).
5. Records. Quote the design sentences the change touches and propose wording for the Executive: the `admitJson` row at `:126` and the falsifier row at `:280` (state whether each still holds as written), the D4 decision at `:606` if its "nine sites" clause is affected (it is not expected to be), and the §9.3 closing paragraph (`:579`, TD-17's sentence "keeps its first cause inline"), which gains the `malformed_return` route. The register rows are the Executive's.
6. Lanes. `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`, `npm run build`; before and after, one lane at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 test_env/tests/<lane>.test.mjs`: the admit family's lane, `t287-common-computational-library`, `t287-value-equality`, `t287-runtime-failure-diagnostic`, `t287-undispatched-diagnostic` (red at head, fixture rows F2/F3), `t287-f04a-probabilistic-result-candidate` (red at head, `'World'`), `t287-ordered-reconstruction` (red at head), `m5-worker-transport`, `t287-owned-process-lifetime`, `t287-c2-core-environment`, `forward-command-contracts`, `r10-projection-contracts`, `m5-c-algebra-validation`, `t287-worksite-command-execution` (installed cases, about nine minutes), `t287-management-stream-drain` and `t287-management-context` (item 0c; also `git status --short` after each), and every lane whose test file or support module imports one of the nine changed `code/src` modules (TD-16's census rule; name them). Report tests/pass/fail/skipped and every red identity (file:line, test name, first error) before and after; the same, or the difference named.

Grant: `code/src/shared/admit/json.ts`; the `catch` sites only in `code/src/validator/conformance_operation.ts`, `code/src/product/result_assessment_operation.ts`, `code/src/abg/witness_admission_operation.ts`, `code/src/abg/project_read_ports.ts`, `code/src/abg/probabilistic_result.ts`, `code/src/abg/actor_process.ts`, `code/src/product/worksite_command_execution.ts`, `code/src/abg/execution_basis.ts`; `code/src/implementation/leaf_invocation_port.ts` (`deterministicFailure`, `finalize`, the F_D admission, their callers' arguments); `code/src/abg/c_call.ts` (the one site of item 0b); `test_env/tests/t287-management-stream-drain.test.mjs` and `test_env/tests/t287-management-context.test.mjs` (item 0c); the admit family's lane file and `test_env/tests/t287-runtime-failure-diagnostic.test.mjs` (item 4); the two tracked files `npm run build` regenerates if they change; this record (append only, your section). No design edit; no other file.

Stop (write it in the Return, keep the rest moving): a new admission code; a change to a failure class, a refusal class, a receipt shape or an event payload key; a `catch` whose deletion would let a throw other than `admitJson`'s escape (keep that guard and name it); a depth bound that would refuse a value a lane or fixture admits today; a lane whose red identities change.

Return contract: one commit on `main` with the first line `C-3: admitJson total (cycle, depth, trap refused as non_ijson_value); the thirteen catch blocks deleted; malformed_return carries its cause` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`. Append `## C-3 return` at the end of this record with items 0b and 0c (the site before and after; the `git status` evidence), the totality design and the bound with its reason (item 1), the 13 sites before and after (item 2), the producer and the three `finalize` routes with one cold subject each (item 3), the proof cases (item 4), the design sentences and proposed wording (item 5), the lane table (item 6), and any stops. Nothing above your section is edited.

## C-3 return

Worker: Opus 5.5, fresh context. Base `79339b560`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/code/src/` unless they start with `test_env/`, `design/` or `scripts/`. Lines are at head `79339b560` unless marked "after".

| Item | State | Evidence |
|---|---|---|
| 0b. `c_call.ts:2026` cast | done | the cast is gone; a negative compile fails without the guard |
| 0c. lane scratch | done (default location); held path by reading | `git status` and directory listings before and after each lane |
| 1. `admitJson` totality | done; bound 512 | `shared/admit/json.ts`; case `C-3: …` in `t287-common-computational-library` |
| 2. The 13 sites | 11 sites changed; rows 9-10 stopped (guard kept, see Stops) | item 2 below |
| 3. O-1 | done; no new union member | producer and routes; cases in `t287-runtime-failure-diagnostic` |
| 4. Proof | done | item 4 below |
| 5. Records | proposed | design sentences |
| 6. Lanes | done; no red identity changed; +3 tests, the new cases | lane table |

**Item 0b.** Before (`:2025-2026`): `terminationConfirmed: runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "actor_process_terminated", identity: source.processRef as string })),`. After: the same line with `identity: source.processRef`. No cast remains at the site. The site relies on the guard `typeof source.processRef !== "string"` at `:1796`, which is in the same function, `projectAdmittedActorTransport` (`:1781-2060`), and returns `null` before the site. `source` there is `Readonly<Record<string, JsonValue>>`, not the carrier type `AdmittedCCallEvidenceDetails` (`:699`) whose optional `processRef` is at `:718`. Erratum to the C-2 disposition and the activation: the guard is not in another function. Type proof: `RuntimeFluentInput.identity` is `string | null` and optional (`abg/calculus/axioms.ts:58`), under `exactOptionalPropertyTypes`. With the guard disjunct at `:1796` replaced by `false` in scratch, `tsc` fails at the site with `TS2412: Type 'JsonValue | undefined' is not assignable to type 'string | null | undefined'`. An exact read keyed `actor_process_terminated(undefined)` therefore does not type-check.

**Item 0c.** `t287-management-stream-drain`: `exercise` now creates the `stream-drain-` directory and hands it to `exerciseAt`, the unchanged body, inside `try`/`finally`; `finally` removes it (head `:21`; after `:19-23`). Every read of that directory happens inside the body: `producer.json` and the stdout artifact. `heldObservation` registers one `after` hook right after it creates `held-drain-` (head `:141`; after `:146-149`). The hook closes the held store, if one was opened, and then removes the directory. It replaces the `after` hook that only closed the store. `t287-management-context`: `genericEnvironment(context)` registers `context.after(() => rm(root, …))` when `ABI5_CONTEXT_PROOF_ROOT` is unset (after `:326-330`). When the variable is set the root is the owner's and the directory stays. Its two callers pass their test context. No new environment variable.

Evidence. These are the runner's listings of `stream-drain-*`, `held-drain-*` and `test_env/context-component-*` under the tenant root, plus the hash of the tenant's untracked `git status --short` set, taken before and after each lane.

| Lane | Head run | After run |
|---|---|---|
| `t287-management-context` | 2 new `test_env/context-component-*`; untracked set changed | none; untracked set unchanged |
| `t287-management-stream-drain` | 6 new `stream-drain-*`; untracked set changed | none; untracked set unchanged |

The head run's 8 directories were deleted after the head pass, and the census pass's after that, so the after pass started with none. `held-drain-` is created only when `T287_STREAM_HELD_EVENT_LOG` is set. The records and the tenant hold no value for it, and no event log under `.ai-workspace/work` or `test_env` holds the held actor `e4be4df1…`. The held path's cleanup is therefore proved by reading only: its three tests are among the lane's 4 skips at head and after.

**Item 1: `admitJson` totality** (`shared/admit/json.ts`). The seven codes, the refusal shape `{ kind, stage, code, path, evidence: { at, reason } }` and D12 are unchanged. No code was added.
- **Cycle.** `admitAt(input, path, at, open)` (after `:264`) carries `open`, the containers on the path from the root. `admitJson` passes an empty set (after `:324`). A container joins `open` before its members are read and leaves it in a `finally` on unwind (after `:301-306`). So a container shared by two members, a DAG, is admitted, and a container already on the path is refused where the path closes (after `:284-286`): `non_ijson_value`, reason "a container that encloses itself (a cycle) is not I-JSON". Example: `r = { a: 1 }; r.self = r` gives path `['self']`, `at` `.self`.
- **Depth.** `NESTING_BOUND = 512` (after `:119`). A container is refused when 512 containers are already open, so the root counts as 1 and the 513th nested container is refused at its own location (after `:287-294`): reason "containers nested more than 512 deep exceed the admission bound". The check sits before the container's inspection, so a 200,000-deep `JSON.parse` value is refused at depth 513 with no overflow.
- **Trap.** Every inspection read sits in a `try` that refuses the value being inspected, at that value's location, through `trapped` (after `:153`). The reads are `Array.isArray` (after `:296-300`), the prototype reads of D12, `Reflect.ownKeys`, the length descriptor and the dense check (`admitArray` after `:157-191`; `admitRecord` after `:217-231`), and each member's `Object.getOwnPropertyDescriptor` (after `:193-201`, `:238-246`). The reason is "inspecting the value threw <class>". `thrownClass` (after `:138-147`) runs no user code. It walks the thrown value's prototype chain to the nearest of this realm's eight native error prototypes, compared by identity, and stops at a proxy (`types.isProxy`) without inspecting it. So a subclass of `RangeError` is named `RangeError`. Anything else is "a value that is not a native error": a string, a proxy, a plain object, or another realm's error. No member of the thrown value is read.
- **No hidden overflow.** The recursion into a member is outside every `try`. If the bound were too high for the stack, the `RangeError` would escape as a throw rather than be refused as a fake trap. No getter runs: members are read only through data descriptors (D12).
- **Comment.** The doc comment on `admitJson` (after `:309-323`) replaces head's "Defects (a throwing proxy trap) still throw" (`:209-212`). It states that `admitJson` returns an outcome for every input and throws for none, the three refusals, the bound and its reason, and the measured depths.

**The bound's reason.** The bound keeps `admitJson`, and the recursive writers that read what it admits, inside the stack with room for the caller. I measured where the recursion overflows (Node v24.7.0, default stack):

| Caller | `admitJson` arrays | `admitJson` records | `canonicalJson` / `sha256Canonical` |
|---|---|---|---|
| top level, warm | 2,343 | 2,343 | not measured |
| `node:test` + VM module + 200 frames, cold | 2,161 | 1,883 | 4,060 |
| `node:test` + VM module + 2,000 frames, cold | 1,695 | 1,476 | 3,220 |

512 is about 2.9 times under the lowest overflow measured (1,476 nested records). Values nested 513 to about 1,500-2,300 deep, which head admitted when the stack allowed, are now refused.

**Every value admitted today is admitted at the bound:**
- **Fixtures.** A byte-identity script admitted 180,554 values with head's built `admitJson` and with the new one, and compared each result. The values were every JSON and JSONL document under the tenant's `test_env/` and `contracts/`, plus 26 probes (refused scalars, holes, accessors, symbols, class instances, `-0`, lone surrogates, a null-prototype record, a DAG). Admitted values were compared by `canonicalJson`, refusals whole. There were 0 differences. The deepest fixture value is 40 containers.
- **Lanes.** A census ran every lane of the item 6 set once at head under an uncommitted load hook. The hook recorded the deepest value each built `admitJson` admitted in each process: 318 processes in 121 lanes. The deepest admitted value is 17 containers (`t287-historical-source-resource`, `t287-cross-cut-public-read`). Next come `r10-projection-contracts` at 16, `t287-calculus-state-transfer` at 14 and `t287-worksite-command-execution` at 13.
- **Census gaps.** 19 lanes recorded nothing: lanes that fail at load, lanes whose cases all skip, and `t287-multi-candidate-admission`. That lane fails to load under the hook alone (`SyntaxError: Export 'constructionIntentForAdvance' is not defined in module`, `build/code/src/abg/traversal_route.js:2`) and is 75/75 at head without it. A child process spawned with a scrubbed environment is not instrumented, so 17 is a lower bound. Its margin to 512 is 30 times.
- **Cost.** Admitting a 2.8 MB fixture takes 17.7-18.1 ms with the new `admitJson`, against 17.1 ms at head (3-5%).

**Item 2: the 13 sites.** Rows are TD-16's (`packages.md`, `## TD-15 + TD-16 return`). Line numbers are at head, then after. Each site's refusal, `null` or `false` for a refused value is unchanged. A cycle, an over-deep value or a trap now reaches that same channel as a refusal outcome instead of as a caught throw.

Rows 1-4. The four sites have one shape, so one before and after shows them all.

| Row | Site | Head | After |
|---|---|---|---|
| 1 | `validator/conformance_operation.ts` `evaluateWithValidationInput` | `:246-251` | `:245-246`, `const admitted = outcome.value` `:253` |
| 2 | `product/result_assessment_operation.ts` `assessResult` | `:497-502` | `:494-495`, `:502` |
| 3 | `abg/witness_admission_operation.ts` `validatePacket` | `:433-438` | `:433-434`, `:442` |
| 4 | `abg/project_read_ports.ts` `admitReadPacket` | `:598-603` | `:598-599`, `:607` |

```ts
// before
let admitted: JsonValue | undefined;
try {
  const outcome = admitJson(supplied);
  if (outcome.kind === "ok") admitted = outcome.value;
} catch { /* admitJson throws on a cycle, at the stack bound and from a proxy trap; these take the same refusal. */ }
if (admitted === undefined) {
  return refusal(…); // unchanged
}
// after
const outcome = admitJson(supplied);
if (outcome.kind !== "ok") {
  return refusal(…); // unchanged
}
const admitted = outcome.value;
```

The `JsonValue` type import fell out of use in rows 1 and 2 and was removed (`conformance_operation.ts:13`; `result_assessment_operation.ts:2-5` is now one line). Rows 3 and 4 still use it.

Row 5, `abg/probabilistic_result.ts` `canonicalObject` (head `:284-294`, after `:284-289`). The `try` also enclosed `asIJsonObject(admitted.value)`. That call reads an admitted, frozen, plain `JsonValue` and cannot throw: it is a type test and a cast. So the whole `try` is deleted, and no guard remains for other work. **Deviation:** the activation expected the other work to keep its guard. It has nothing left to catch.
```ts
// before
try {
  const admitted = admitJson(value);
  return admitted.kind === "ok" ? asIJsonObject(admitted.value) as … | null : null;
} catch {
  return null;
}
// after
const admitted = admitJson(value);
return admitted.kind === "ok" ? asIJsonObject(admitted.value) as … | null : null;
```

Rows 6-7, `abg/actor_process.ts` `validateActorProcessCarrierPair`: the request (head `:367-372`, after `:367-368` and `:374`) and the observation (head `:413-418`, after `:410-411` and `:417`). The existing cast stays where it was.
```ts
// before
let request: Readonly<ActorProcessRequest> | undefined;
try {
  const outcome = admitJson(requestRecord);
  if (outcome.kind === "ok") request = outcome.value as unknown as Readonly<ActorProcessRequest>;
} catch { /* … */ }
if (request === undefined) {
  return carrierRefusal(…); // unchanged
}
// after
const admittedRequest = admitJson(requestRecord);
if (admittedRequest.kind !== "ok") {
  return carrierRefusal(…); // unchanged
}
const request = admittedRequest.value as unknown as Readonly<ActorProcessRequest>;
```
The observation is the same, with `admittedObservation` and `observation`.

Row 8, `abg/actor_process.ts` `assessNativeResultArtifact` (head `:1060-1069`, after `:1054-1066`). The `try` also enclosed `JSON.parse` and the owner's verifier. Two guards remain, and the admission is between them:
- `JSON.parse(output)` keeps its own guard, which catches a `SyntaxError` for output that is not JSON;
- `owner.port.verifyProbabilisticResultContractPreimage(…)` keeps the other. It catches whatever the owner port throws.

Malformed or owner-refused output leaves `disposition` `rejected`, as at head.
```ts
// before
try {
  const admitted = admitJson(JSON.parse(output));
  const raw = admitted.kind === "ok" ? admitted.value : null;
  if (isRecord(raw)) {
    const result = owner.port.verifyProbabilisticResultContractPreimage({ … });
    if (result.kind === "verified_probabilistic_result_contract_preimage") { verification = result; disposition = "admitted"; }
  }
} catch { /* exact malformed/owner-refused output stays rejected, never repaired */ }
// after
let parsed: Readonly<{ value: unknown }> | null = null;
try { parsed = { value: JSON.parse(output) }; } catch { /* malformed output stays rejected, never repaired */ }
const admitted = parsed === null ? null : admitJson(parsed.value);
const raw = admitted?.kind === "ok" ? admitted.value : null;
if (isRecord(raw)) {
  try {
    const result = owner.port.verifyProbabilisticResultContractPreimage({ … });
    if (result.kind === "verified_probabilistic_result_contract_preimage") { verification = result; disposition = "admitted"; }
  } catch { /* owner-refused output stays rejected, never repaired */ }
}
```

Rows 9-10, `product/worksite_command_execution.ts` `isPredicateObservation` (head and after `:1781-1785`): **unchanged. This is a stop; see Stops.**

Row 11, `abg/execution_basis.ts` `constructNativeInstructionAssemblyBasis` (head `:246-256`, after `:246-258`). Two guards remain, and the admission is between them:
- The first guard encloses `NativeAssemblyBasisDerivation.value(basis)` (`:225-228`). That is `Object.getOwnPropertyDescriptor(basis, …)` on the raw basis. It catches a proxy trap's throw, and the `TypeError` for a `null` or `undefined` basis.
- The second guard encloses the capture `captureDurablePrefixCoordinate(basis.predecessorPrefix)`, which reads the raw basis (a getter can run), then `deriveOwnedNativeInstructionAssemblyBasis` and `Object.defineProperty`. It catches the capture's throw contract (TD-16 row 19) and any throw from the derivation or that read.

Both return `null`, as head's single `catch` did.
```ts
// before
try {
  if (NativeAssemblyBasisDerivation.value(basis) !== undefined) return basis;
  const admitted = admitJson(basis);
  if (admitted.kind !== "ok") return null;
  const captured = { …, predecessorPrefix: captureDurablePrefixCoordinate(basis.predecessorPrefix) };
  … // derive, defineProperty, deepFreeze
} catch { return null; }
// after
try {
  if (NativeAssemblyBasisDerivation.value(basis) !== undefined) return basis;
} catch { return null; }
const admitted = admitJson(basis);
if (admitted.kind !== "ok") return null;
try {
  const captured = { …, predecessorPrefix: captureDurablePrefixCoordinate(basis.predecessorPrefix) };
  … // unchanged
} catch { return null; }
```

Row 12, `implementation/leaf_invocation_port.ts`, the F_D admission (head `:692-713`, after `:721-724`). The admission's `try` is deleted. The validator's `try` moves into `malformedOrAdmitted` (item 3) and now encloses only `isLeafRealizationCandidate(…, input.validateSuccess, …)`. It catches a throw from the caller's `validateSuccess`. The cast `admittedCandidate as Readonly<LeafRealizationCandidate>` is gone, because `isLeafRealizationCandidate` narrows the admitted value.
```ts
// before
let admittedCandidate: unknown;
try {
  const admitted = admitJson(implementationOutput);
  admittedCandidate = admitted.kind === "ok" ? admitted.value : null;
} catch {
  admittedCandidate = null;
}
let valid = false;
try {
  valid = isLeafRealizationCandidate(admittedCandidate, "F_D", input.validateSuccess, failureValueKind);
} catch {
  valid = false;
}
return closedDeterministicOwnerReceipt(
  valid ? admittedCandidate as Readonly<LeafRealizationCandidate> : totalizedFailure("malformed_return"),
  true,
);
// after
return closedDeterministicOwnerReceipt(
  malformedOrAdmitted(implementationOutput, "F_D", "implementation_invocation"),
  true,
);
```

Row 13, `finalize` (head `:771-794`, after `:780-785`). Item 3 covers the change.
- Head's single `try` enclosed the admission, the validator and `closedProbabilisticOwnerReceipt`. Now only the validator is guarded, inside `malformedOrAdmitted`.
- The receipt construction is outside any `try`. It is `deepFreeze` over the candidate, plus the `workerContracts` and `exchange` that the boundary validated before completion. The candidate is either admitted and frozen, or built by `deterministicFailure`.
- The F_P sync-throw path (after `:774`) and the rejection path (after `:788`) already call `closedProbabilisticOwnerReceipt` unguarded with the same `workerContracts` and `exchange`. So deleting this `catch` lets no new throw escape.
```ts
// before
const finalize = (candidateOutput: unknown) => {
  try {
    const admitted = admitJson(candidateOutput);
    const valid = admitted.kind === "ok" && isLeafRealizationCandidate(admitted.value, "F_P", input.validateSuccess, failureValueKind);
    return closedProbabilisticOwnerReceipt(
      valid ? admitted.value as Readonly<LeafRealizationCandidate> : totalizedFailure("malformed_return"),
      workerContracts, exchange);
  } catch {
    return closedProbabilisticOwnerReceipt(totalizedFailure("malformed_return"), workerContracts, exchange);
  }
};
// after
const finalize = (candidateOutput: unknown) =>
  closedProbabilisticOwnerReceipt(
    malformedOrAdmitted(candidateOutput, "F_P", "implementation_completion"),
    workerContracts,
    exchange,
  );
```

**Item 3: O-1, the `malformed_return` cause** (`implementation/leaf_invocation_port.ts`).

The producer is `deterministicFailure` (head `:559`, after `:561`):
- It takes the failure class as its first parameter, `failureClass: "implementation_exception" | "malformed_return"`, and builds the failure from `totalizedFailure(failureClass)` in place of the fixed `totalizedFailure("implementation_exception")`.
- It takes an optional last parameter `refusal?: { at, reason }`. When `refusal` is given, the cause is `{ at, atTruncated, reason }`, with `at` cut to 8,192 characters as a caught message is. Otherwise the cause is TD-17's `{ errorClass, errorCode, message, messageTruncated }`, sanitized by `sanitizeUndispatchedOwnerError`. A proxy is never read.
- Its six existing callers pass `"implementation_exception"` first and are otherwise unchanged. Four are F_D: `authority_verification` (after `:682`), `implementation_load` thrown (`:696`), `missing_export` (`:702`) and `implementation_invocation` thrown (`:717`). Two are F_P completion: thrown (`:775`) and rejected (`:789`). Their subjects are byte-identical: `t287-runtime-failure-diagnostic`'s six TD-17 cases still pass with their literal expected subjects.
- The diagnostic class ref follows the class: `totalizedFailure("malformed_return")` gives `diagnostic://abiogenesis/implementation/malformed-return@5`.
- No stage or reason union member was added: the routes use `refused` and `thrown`.
- The failure class, `closedDeterministicOwnerReceipt`, `closedProbabilisticOwnerReceipt`, the receipt shape and every event payload key are unchanged.

`malformedOrAdmitted(output, regime, stage)` (after `:605-624`) is the route for both regimes. F_D calls it with stage `implementation_invocation` (after `:722`), and F_P's `finalize` calls it with stage `implementation_completion` (after `:782`). It admits the output, then validates the admitted value, and has three routes:

| Route | Reason | Cause |
|---|---|---|
| admission refused | `refused` | `{ at, atTruncated, reason }` of the refusal's evidence |
| validator rejects the admitted value | `refused` | `{ at: "", atTruncated: false, reason: "the admitted output is not an <F_D or F_P> leaf realization candidate" }` |
| validator throws | `thrown` | the sanitized `{ errorClass, errorCode, message, messageTruncated }` |

The only `try` encloses `isLeafRealizationCandidate`. A valid candidate is returned as admitted. The rejection gives no `at` because `isLeafRealizationCandidate` answers a boolean, not a location.

One cold subject per route follows. Each was read by `readRuntimeFailureDiagnosticSubject` from the candidate's `diagnosticRef`, admitted through `admitRuntimeFailure`, and read back from a JSON-cloned prefix as `runtime_failure_observed` evidence (`availability: "retained"`). The `inputDigest` is `sha256:f40505b2780f9fded56ccbfb5ae4e97ab7cb3a2020ab82c728e768bad10de653`.
- F_P, admission refused (a cyclic answer): `{"diagnosticClassRef":"diagnostic://abiogenesis/implementation/malformed-return@5","computeRegime":"F_P","implementationRef":"implementation://diagnostic/probabilistic@5","inputDigest":"sha256:f405…de653","stage":"implementation_completion","reason":"refused","cause":{"at":".resultCandidate.answer.self","atTruncated":false,"reason":"a container that encloses itself (a cycle) is not I-JSON"}}`
- F_P, validator rejects (a bare success value): `{…,"computeRegime":"F_P",…,"stage":"implementation_completion","reason":"refused","cause":{"at":"","atTruncated":false,"reason":"the admitted output is not an F_P leaf realization candidate"}}`
- F_P, validator throws: `{…,"computeRegime":"F_P",…,"stage":"implementation_completion","reason":"thrown","cause":{"errorClass":"RangeError","errorCode":null,"message":"selected validator cause","messageTruncated":false}}`
- F_D: the same three, with `"computeRegime":"F_D"`, `"implementationRef":"implementation://diagnostic/deterministic"`, `"stage":"implementation_invocation"` and "an F_D leaf realization candidate".

**Item 4: proof.**

(a) The admit family's lane is `t287-common-computational-library`. A census of `test_env/tests` for `admitJson(` finds two lanes: this one, and `t287-value-equality`, which uses it to admit equality operands and to show non-I-JSON operands refused. The new case is `:70`, "C-3: admitJson refuses a cycle, nesting past 512 and a throwing proxy trap at the member, and throws for none". It covers:
- a self-referencing record (`['self']`, `.self`) and array (`['1']`, `[1]`), and a cycle closing three levels down (`.inner.items[1]`);
- a DAG admitted, with its canonical text;
- arrays and records nested 512 deep admitted, equal to `JSON.stringify`; at 513, refused at `'[0]'.repeat(512)` and `'.k'.repeat(512)`;
- a 200,000-deep `JSON.parse` value refused at the bound, with no overflow;
- `ownKeys`, `getOwnPropertyDescriptor` and `getPrototypeOf` traps that throw, on a record proxy (`TypeError`) and an array proxy (`RangeError`), each refused at the proxied member with the class named;
- a revoked proxy, refused through `Array.isArray`;
- a thrown string, a thrown proxy and a thrown plain object, each named "a value that is not a native error", with the thrown proxy's traps run 0 times;
- a thrown subclass of `RangeError`, named `RangeError`, and another realm's `TypeError`, named "a value that is not a native error";
- a value admitted before C-3, with its canonical text as a literal: `-0`, a non-BMP code point, NUL, a null-prototype record and another realm's record.

Head negative: with this file run against head's `json.ts` in a scratch worktree, the lane is 10/9/1. The case fails at its first assertion with `RangeError: Maximum call stack size exceeded`. This was measured before the case gained its subclass and other-realm assertions. Head fails at the first cycle assertion either way.

(b) `t287-runtime-failure-diagnostic` gains two cases. Both use TD-17's readback, factored from its two F_P cases into `retainedCauseSurvivesAdmission` (after `:428`). The readback checks:
- the cold subject read from the `diagnosticRef`;
- `admitRuntimeFailure`;
- the JSON-cloned prefix's `runtime_failure_observed` evidence: `availability`, `diagnosticClassRef`, `subject`, `subjectDigest`, `failureRef`;
- `diagnosticRef` equal to `constructRuntimeFailureDiagnosticRef(expected)`;
- no input body in the subject;
- the Public evidence projection's decoded subject;
- a substituted `reason` refused before append.

The cases:
- `:486`, "probabilistic completion malformed returns keep their cause …". It runs the three cases of `malformedCases('F_P', [])` (after `:473-485`): cyclic, non-candidate, validator throws. Each goes through the actual F_P boundary and `finalize` with a validated carrier pair, and each asserts the class `malformed_return` and the expected subject. F_P validation never calls `validateSuccess`, so an admitted value cannot make it throw. The validator-throw case therefore replaces `isRecord` in `../shared/admission_predicates.js` with a version that throws `RangeError('selected validator cause')` for one marked value. That is a controlled premise, disclosed in the case's diagnostic.
- `:502`, "deterministic malformed returns keep their cause …". The same three run through the actual F_D boundary. Here `validateSuccess` throws for the third. The case also asserts the closed receipt, the evidence candidate's `outputDigest` and the candidate's own validity.
- The F_D null-output assertion of `:353` now reads the rejection cause.
- The TD-16 case (`:701`) now compares each F_D and F_P malformed row with head's receipt plus its cause (`headWithCause`): the subject's `at` and `reason` per malformed value (`td16Causes`), `at` included. The deep value's `at` is `.resultCandidate.answer` followed by `[0]` 510 times.

Head negative: run against head's `code/src` in the scratch worktree, the lane is 17/13/4:
- `:353` fails with "Cannot read properties of null (reading 'cause')": head's `malformed_return` has no subject;
- `:486` and `:502` fail with `availability` `not_retained` and subject `null`;
- `:701` fails at "F_D output: null".

After the change, the lane is 17/17.

(c) Item 6: the 13 sites' lanes are within the 140-lane set, before and after.

**Item 5: design sentences** (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, not edited).
1. **`:126`**, the `admitJson` row of the atom table. Current: "| `admitJson` | `(raw: unknown) => Outcome<JsonValue>` | the throwing path of `i_json.ts` for new callers | the seven `IJsonAdmissionFailureCode` values: … |". It holds as written: the signature and the seven codes are unchanged. Optional addition at the end of the last cell: "; total: a cycle, nesting past 512 containers and a proxy-trap throw are each `non_ijson_value` at the member, and no input throws".
2. **`:280`**, the falsifier row. Current: "| `admitJson` | `unknown` | an I-JSON value refused, or a non-I-JSON value admitted |". It does not hold as written: an I-JSON value nested 513 or more deep is now refused. Proposed: "| `admitJson` | `unknown` | an I-JSON value nested at most 512 containers deep refused, a non-I-JSON value admitted, or any input that throws |".
3. **`:606`**, D4. Its "nine sites after TD-16" clause holds: the lift and its nine throw-contract callers are unchanged. Its last clause does not hold. Current: "a caller that consumed only the refusal reads `admitJson`'s outcome and keeps one `catch` for the throws `admitJson` itself documents (a proxy trap; the stack bound on a cycle or deep nesting)". Proposed: "a caller that consumed only the refusal reads `admitJson`'s outcome, which is total (a cycle, nesting past 512 containers and a proxy-trap throw are refused `non_ijson_value`), and keeps no `catch` for it".
4. **`:613`**, O-TYPE (A). This line is not named in the activation. Current: "an `unknown` value passes `admitJson` at the site, and a refusal or a throw takes the site's own channel". Proposed: "an `unknown` value passes `admitJson` at the site, and a refusal takes the site's own channel".
5. **`:579`**, the §9.3 closing paragraph. Its last sentence is now false. Current: "The `malformed_return` totalization after a completion that returns an inadmissible value keeps the class reference only." Proposed replacement: "A returned value that admission refuses or the validator rejects, or whose validation throws, is the `malformed_return` failure through the same producer, at stage `implementation_invocation` (F_D) or `implementation_completion` (F_P) (`malformedOrAdmitted`, `implementation/leaf_invocation_port.ts:605`): a refusal gives reason `refused` and cause `{ at, atTruncated, reason }` of the refusal, a rejection gives reason `refused` with `at` `""` and a reason naming the regime's candidate, and a validator throw gives reason `thrown` with the sanitized cause." In the same paragraph, the citation `implementation/leaf_invocation_port.ts:560` becomes `:561`. The paragraph's "8192 bytes" is 8,192 UTF-16 code units in the code (`slice(0, 8192)`, `:577-578`). The same holds for `at` (`:590`). Proposed: "8192 UTF-16 code units".

The register rows are the Executive's.

**Item 6: lanes.** Gates, before (head `79339b560`) and after:
- `npx tsc --noEmit -p tsconfig.json`: exit 0 both times.
- `npm run lint:imports`: exit 0 both times, 28 modules.
- `npm run lint:lifecycle`: exit 0 both times, 284 modules, 7 allow-listed, no offender.
- `npm run build`: exit 0 both times. Before, it regenerated nothing. After, it regenerated the two tracked files, which are in the commit:
  - `product-toolchain-manifest.json`: `f0dc3964…2c9aa7` → `bd694e0e…c4c43f`, 185 changed leaves;
  - `contracts/capabilities/capability-definition-graph.json`: `01bccfd7…da29cc` → `c2438278…a826c`, 551 changed leaves.

  Every changed leaf is a `sha256:` digest or a ref that embeds one. With runs of 32 or more hex characters masked, no leaf differs.

The lane set has 140 lanes:
- the 15 lanes item 6 names;
- the census by TD-16's rule. A lane is in the census when its test file, or a `test_env/support` module it imports (to two levels), names one of the changed modules or `product/worksite_command_execution`. `shared/admit/json` counts when it is imported through `admit/index`. The census finds 138 lanes, 13 of them among the named 15; `m5-c-algebra-validation` and `t287-management-stream-drain` are named lanes outside it.

Each lane ran once, one at a time, from the tenant root with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 test_env/tests/<lane>.test.mjs`:
- before, on the head build, 08:13-09:22Z;
- after, on the rebuilt tree, 10:44-11:55Z.

An after pass begun at 10:35Z on an earlier cut of `thrownClass` was stopped after 21 lanes, and its results are not used. Counts are tests/pass/fail/skipped; a cancelled test is named.

Red identities were checked two ways:
- per lane, the set of (`file:line`, test name) pairs is equal before and after;
- the whole failing-tests section is compared after masking per-run values. The masked values are hex digests, UUIDs, timestamps, temporary paths, durations, `elapsedMs` fields, the stack line numbers of `build/…js` and of Node internals, and the store's `prefixLength`, `inode`, `lastOrdinal`, `eventCount` and `lastAdmissionOrdinal`.

The sections are identical in 139 of 140 lanes. In the 140th, `t287-worksite-branch-construction`, the completion JSON asserted at `:669` holds one actor-process exchange whose `streamEventRefs` has one event after and two before. The census pass at head, on the same code as the before pass, also had one. So the count is per run at head: the child's output arrives in one stream event or two. The lane's two reds are the same tests with the same first error.

Totals:

| Pass | Tests | Pass | Fail | Skipped | Cancelled |
|---|---|---|---|---|---|
| before | 887 | 606 | 185 | 94 | 2 |
| after | 890 | 609 | 185 | 94 | 2 |

The difference is the three new cases: `t287-common-computational-library` gains 1 and `t287-runtime-failure-diagnostic` gains 2. Both management lanes leave no scratch and an unchanged untracked set (item 0c).

The lanes item 6 names:

| Lane | Before | After | Reds |
|---|---|---|---|
| `t287-common-computational-library` | 9/9/0/0 | 10/10/0/0 | none |
| `t287-value-equality` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-runtime-failure-diagnostic` | 15/15/0/0 | 17/17/0/0 | none |
| `t287-undispatched-diagnostic` | 7/5/2/0 | 7/5/2/0 | 2, same |
| `t287-f04a-probabilistic-result-candidate` | 2/1/1/0 | 2/1/1/0 | 1, same |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 | 4, same |
| `m5-worker-transport` | 23/23/0/0 | 23/23/0/0 | none |
| `t287-owned-process-lifetime` | 18/18/0/0 | 18/18/0/0 | none |
| `t287-c2-core-environment` | 3/3/0/0 | 3/3/0/0 | none |
| `forward-command-contracts` | 10/10/0/0 | 10/10/0/0 | none |
| `r10-projection-contracts` | 10/10/0/0 | 10/10/0/0 | none |
| `m5-c-algebra-validation` | 22/19/0/3 | 22/19/0/3 | none |
| `t287-worksite-command-execution` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-management-stream-drain` | 8/4/0/4 | 8/4/0/4 | none |
| `t287-management-context` | 14/12/0/2 | 14/12/0/2 | none |

The census lanes. "Imports" names the changed modules the lane reaches by the census rule. A lane that imports a module does not necessarily execute the changed site.

| Lane | Imports | Before | After | Reds |
|---|---|---|---|---|
| `d1-preserved-result-mechanics` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `d2-acknowledgment` | `execution_basis`, `worksite_command_execution` | 4/0/4/0 | 4/0/4/0 | 4, same |
| `d2-binding-transition` | `execution_basis`, `witness_admission_operation`, `worksite_command_execution` | 10/0/10/0 | 10/0/10/0 | 10, same |
| `d2-bounded-repair` | `execution_basis`, `worksite_command_execution` | 12/7/5/0 | 12/7/5/0 | 5, same |
| `d2-evidence-owner` | `execution_basis`, `worksite_command_execution` | 2/0/2/0 | 2/0/2/0 | 2, same |
| `d2-evidence-owner-lookup` | `execution_basis`, `worksite_command_execution` | 9/0/9/0 | 9/0/9/0 | 9, same |
| `d2-historical-design` | `execution_basis` | 14/10/4/0 | 14/10/4/0 | 4, same |
| `d2-historical-owner` | `worksite_command_execution` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `d2-workflow-step` | `execution_basis`, `worksite_command_execution` | 9/0/9/0 | 9/0/9/0 | 9, same |
| `forward-command-owners` | `witness_admission_operation`, `worksite_command_execution` | 6/2/4/0 | 6/2/4/0 | 4, same |
| `generic-input-retention` | `c_call` | 4/2/2/0 | 4/2/2/0 | 2, same |
| `installed-language-smoke` | `leaf_invocation_port` | 1/1/0/0 | 1/1/0/0 | none |
| `integration-shared-seams` | `execution_basis`, `worksite_command_execution` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `m5-consensus-module` | `execution_basis` | 18/11/7/0 | 18/11/7/0 | 7, same |
| `m5-event-calculus-runtime` | `c_call`, `leaf_invocation_port` | 19/13/5/1 | 19/13/5/1 | 5, same |
| `m5-event-store-reopen` | `c_call`, `leaf_invocation_port` | 21/21/0/0 | 21/21/0/0 | none |
| `m5-fresh-process-reconstruction` | `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `m5-installed-graph-edge` | `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `m5-retry-lifecycle-authority` | `c_call` | 9/4/5/0 | 9/4/5/0 | 5, same |
| `m5-s03-authority` | `c_call`, `leaf_invocation_port` | 5/1/4/0 | 5/1/4/0 | 4, same |
| `m5-terminal-quiescence-owner` | `actor_process` | 7/7/0/0 | 7/7/0/0 | none |
| `r10-child-proof` | `project_read_ports` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `r5-invocation-admission` | `leaf_invocation_port` | 3/0/3/0 | 3/0/3/0 | 3, same |
| `r6-implementation-resolution` | `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `r7-graph-validation-basis` | `execution_basis`, `leaf_invocation_port` | 1/1/0/0 | 1/1/0/0 | none |
| `r8-direct-hog-entry` | `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `r9-causal-result-closure` | `leaf_invocation_port` | 2/0/2/0 | 2/0/2/0 | 2, same |
| `retained-route-cursor-transition` | `c_call` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `rival-authority-mutations` | `leaf_invocation_port` | 3/1/2/0 | 3/1/2/0 | 2, same |
| `runtime-scope-regressions` | `leaf_invocation_port` | 2/2/0/0 | 2/2/0/0 | none |
| `steel-basic-cli-c2` | `worksite_command_execution` | 6/0/0/6 | 6/0/0/6 | none |
| `t287-authenticated-owner-values` | `execution_basis` | 3/1/1/1 | 3/1/1/1 | 1, same |
| `t287-c0-correction-regressions` | `leaf_invocation_port` | 4/3/1/0 | 4/3/1/0 | 1, same |
| `t287-c0-post-publication-failure` | `leaf_invocation_port` | 31/31/0/0 | 31/31/0/0 | none |
| `t287-c2-child-program` | `c_call` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-c2-owner-coordinate-reuse` | `c_call`, `execution_basis` | 6/0/6/0 | 6/0/6/0 | 6, same |
| `t287-c2a-fp-source-contract` | `actor_process` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-calculus-fold` | `actor_process`, `execution_basis`, `leaf_invocation_port`, `worksite_command_execution` | 13/13/0/0 | 13/13/0/0 | none |
| `t287-calculus-state-transfer` | `leaf_invocation_port` | 8/6/0/0 +2 cancelled | 8/6/0/0 +2 cancelled | 2, same |
| `t287-conformance-owner-reuse` | `conformance_operation`, `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-cross-cut-public-read` | `project_read_ports` | 5/4/1/0 | 5/4/1/0 | 1, same |
| `t287-d1-requirement-handoff` | `c_call` | 5/2/0/3 | 5/2/0/3 | none |
| `t287-d1-semantic-stage` | `execution_basis` | 3/1/0/2 | 3/1/0/2 | none |
| `t287-declared-testing-capability` | `leaf_invocation_port` | 7/5/1/1 | 7/5/1/1 | 1, same |
| `t287-default-library` | `execution_basis`, `leaf_invocation_port`, `worksite_command_execution` | 20/17/0/3 | 20/17/0/3 | none |
| `t287-default-library-fulfillment` | `execution_basis`, `worksite_command_execution` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-event-body-encoding` | `worksite_command_execution` | 14/14/0/0 | 14/14/0/0 | none |
| `t287-exact-construction-intent` | `c_call`, `leaf_invocation_port` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-fh-hold-open` | `execution_basis`, `witness_admission_operation` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-generic-job-intake` | `execution_basis`, `leaf_invocation_port` | 2/0/1/1 | 2/0/1/1 | 1, same |
| `t287-generic-job-lifecycle` | `c_call`, `execution_basis`, `leaf_invocation_port`, `worksite_command_execution` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-generic-job-meaning` | `execution_basis` | 5/3/0/2 | 5/3/0/2 | none |
| `t287-generic-job-parent-audit` | `c_call` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-generic-job-parent-foldback` | `c_call` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-generic-job-read-dependency` | `execution_basis`, `worksite_command_execution` | 2/1/0/1 | 2/1/0/1 | none |
| `t287-generic-job-revision` | `c_call`, `execution_basis`, `leaf_invocation_port` | 4/1/0/3 | 4/1/0/3 | none |
| `t287-generic-job-worksite` | `execution_basis` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-governance-covered-source-use` | `worksite_command_execution` | 8/2/3/3 | 8/2/3/3 | 3, same |
| `t287-gtl-language-corpus` | `conformance_operation` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-held-prefix` | `project_read_ports` | 6/0/0/6 | 6/0/0/6 | none |
| `t287-historical-source-resource` | `project_read_ports` | 2/1/1/0 | 2/1/1/0 | 1, same |
| `t287-installed-product-coordinate` | `project_read_ports` | 11/11/0/0 | 11/11/0/0 | none |
| `t287-installed-qualification-conservation` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-lifecycle-failure-carrier` | `c_call` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-live-worksite-construction` | `leaf_invocation_port` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-malformed-gtl-gate` | `conformance_operation`, `execution_basis` | 6/5/1/0 | 6/5/1/0 | 1, same |
| `t287-management-supervision` | `execution_basis`, `leaf_invocation_port` | 5/4/1/0 | 5/4/1/0 | 1, same |
| `t287-multi-candidate-admission` | `c_call` | 75/75/0/0 | 75/75/0/0 | none |
| `t287-native-assembly-retained-input` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-native-assessment-evidence` | `c_call` | 4/1/3/0 | 4/1/3/0 | 3, same |
| `t287-native-c2-instruction-assembly` | `execution_basis`, `worksite_command_execution` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-native-event-time` | `actor_process` | 6/0/4/2 | 6/0/4/2 | 4, same |
| `t287-native-frame-observation` | `execution_basis` | 8/1/3/4 | 8/1/3/4 | 3, same |
| `t287-native-owner-reuse` | `project_read_ports` | 3/0/0/3 | 3/0/0/3 | none |
| `t287-native-registered-selection` | `c_call`, `leaf_invocation_port` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-native-runtime-gate` | `execution_basis`, `leaf_invocation_port` | 7/6/0/1 | 7/6/0/1 | none |
| `t287-native-semantic-evidence` | `worksite_command_execution` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-native-semantic-job` | `execution_basis`, `worksite_command_execution` | 9/8/1/0 | 9/8/1/0 | 1, same |
| `t287-native-semantic-revision` | `execution_basis`, `witness_admission_operation`, `worksite_command_execution` | 9/4/4/1 | 9/4/4/1 | 4, same |
| `t287-native-structural-gates` | `execution_basis` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-native-work-currentness-consumers` | `execution_basis`, `leaf_invocation_port`, `worksite_command_execution` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-native-work-reacquisition` | `c_call`, `execution_basis` | 9/6/0/3 | 9/6/0/3 | none |
| `t287-native-work-unknown-effect` | `execution_basis`, `leaf_invocation_port`, `worksite_command_execution` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-native-worksite-execution` | `execution_basis`, `worksite_command_execution` | 6/3/0/3 | 6/3/0/3 | none |
| `t287-native-workspace-work` | `actor_process`, `execution_basis` | 38/37/0/1 | 38/37/0/1 | none |
| `t287-observed-worksite-command` | `execution_basis`, `worksite_command_execution` | 8/7/1/0 | 8/7/1/0 | 1, same |
| `t287-owned-native-proof` | `worksite_command_execution` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-post-binding-worksite-write` | `leaf_invocation_port` | 2/1/1/0 | 2/1/1/0 | 1, same |
| `t287-predecessor-context` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-public-terminal-projection` | `project_read_ports` | 4/0/4/0 | 4/0/4/0 | 4, same |
| `t287-qual056-material` | `execution_basis`, `worksite_command_execution` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-qualification-contraction` | `execution_basis`, `leaf_invocation_port` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-qualification-fp-proof-delivery` | `leaf_invocation_port` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-qualification-parent-alias` | `c_call` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-qualification-producer-acquisition-reuse` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-qualification-producer-context` | `execution_basis` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-qualification-raw-contract-preimage` | `leaf_invocation_port` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-recursive-registered-selection` | `leaf_invocation_port` | 4/2/1/1 | 4/2/1/1 | 1, same |
| `t287-registered-graph-selection` | `execution_basis`, `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-release-acceptance` | `execution_basis`, `project_read_ports` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-release-publication` | `project_read_ports` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-result-evidence-lineage-projection` | `probabilistic_result` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-result-evidence-lineage-type-contract` | `c_call` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-route-reconstruction` | `c_call` | 10/8/0/2 | 10/8/0/2 | none |
| `t287-s03-automatic` | `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-selected-action` | `execution_basis`, `leaf_invocation_port` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-selected-execution-closure` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t287-st1-installed-cross-owner-hello` | `leaf_invocation_port`, `project_read_ports` | 2/0/2/0 | 2/0/2/0 | 2, same |
| `t287-st2a-e-exact-prefix-workspace-environment` | `leaf_invocation_port` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-stdo-run-environment` | `execution_basis` | 2/0/1/1 | 2/0/1/1 | 1, same |
| `t287-wave2-installed-product-verification` | `leaf_invocation_port` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-wave2-owner-contract-source-set` | `execution_basis` | 15/13/2/0 | 15/13/2/0 | 2, same |
| `t287-worksite-branch-construction` | `leaf_invocation_port` | 2/0/2/0 | 2/0/2/0 | 2, same |
| `t287-worksite-construction` | `c_call`, `leaf_invocation_port` | 3/0/3/0 | 3/0/3/0 | 3, same |
| `t287-worksite-file-replace-owner` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t288-composition-conservation` | `c_call` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t288-instruction-assembly-owner` | `execution_basis` | 11/4/0/7 | 11/4/0/7 | none |
| `t288-physical-return-conservation` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `t288-workflow-scope-conservation` | `execution_basis` | 1/0/1/0 | 1/0/1/0 | 1, same |
| `w2-steel-serial-branch-installed` | `worksite_command_execution` | 2/0/0/2 | 2/0/0/2 | none |
| `w2-steel-single-start` | `worksite_command_execution` | 8/6/1/1 | 8/6/1/1 | 1, same |
| `w2-steel-single-start-closure` | `execution_basis` | 8/0/0/8 | 8/0/0/8 | none |
| `w2-steel-single-start-installed` | `worksite_command_execution` | 1/0/0/1 | 1/0/0/1 | none |
| `witness-reprice-definition-binding` | `witness_admission_operation` | 15/0/15/0 | 15/0/15/0 | 15, same |
| `witness-run-stopped-definition-binding` | `witness_admission_operation` | 7/0/7/0 | 7/0/7/0 | 7, same |

Red identities: 187, the same before and after. Each is `file:line`, the test name and the first error line, cut at 160 characters. An entry at `:1` named after its file is a module-level failure.

- `d1-preserved-result-mechanics.test.mjs:1` test_env/tests/d1-preserved-result-mechanics.test.mjs: 'test failed'
- `d2-acknowledgment.test.mjs:17` closed raw guards and real constructors accept old/old and revision/revision only: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-acknowledgment.test.mjs:34` acknowledgment refuses wrong task, digest, attempt, artifact and extra fields at the owning seam: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-acknowledgment.test.mjs:51` task, published raw contract, Product routing, schema and constructor select the same closed arm: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-acknowledgment.test.mjs:81` legacy schema, task and predicates remain exact; generic native owners and helper are byte-exact: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-binding-transition.test.mjs:6` native acquisition child uses its exact admitted input when another Run acquired equal content: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `d2-binding-transition.test.mjs:148` mechanical exact cover; unchanged initial observation crosses W only with its actual native coordinates: TypeError [Error]: h.owner.projectWorksiteRevisionBindingCover is not a function or its return value is not iterable
- `d2-binding-transition.test.mjs:172` mechanical repeated repair and partially successful C0 preserve S2/V22/R20 and earlier successful origins: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `d2-binding-transition.test.mjs:191` mechanical cover cardinality, malformed inventory, broad writes and foreign branches fail closed: TypeError [Error]: h.owner.projectWorksiteRevisionBindingCover is not a function or its return value is not iterable
- `d2-binding-transition.test.mjs:208` mechanical later revised Design retains its own authenticated historical coordinates across another W: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-binding-transition.test.mjs:232` mechanical C0 same-byte/new-inode survives binding translation; residue and unexplained identity refuse: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `d2-binding-transition.test.mjs:247` mechanical multiple binding projections retain actual origins and refuse old-W resurrection after new-W C0: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `d2-binding-transition.test.mjs:269` mechanical exact cover rejects wrong direction, scope, historical basis and unadmitted or self projection: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `d2-binding-transition.test.mjs:289` mechanical distinct projection branches are ambiguity, never equal-value or latest-origin selection: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `d2-binding-transition.test.mjs:303` mechanical evidence-input gate resolves a real Product new-C2 carrier through its exact earlier projection: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-bounded-repair.test.mjs:10` revision-C2 adds exactly its contribution and closed raw contract; old publication members are conserved: Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'jsonc-parser' imported from /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260910_D2_FRAME_RE
- `d2-bounded-repair.test.mjs:56` selection accepts the new C2 success/advance observation cause and conserves the old arm (guard/lookup stubs): AssertionError [ERR_ASSERTION]: new C2 failed command can reach selection despite native success/advance
- `d2-bounded-repair.test.mjs:66` the two recorded continuation counterexamples still fail on exact predecessor code (same lookup assumptions): Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'valibot' imported from /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260910_D2_FRAME_REPAIR/
- `d2-bounded-repair.test.mjs:77` revision-projection parent recovers the native ancestor seed after later C1 failure (lookup stubs): AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-bounded-repair.test.mjs:103` root input reuse, historical C0 byte conservation and current physical guard are retained: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-evidence-owner.test.mjs:7` actual immutable07 prefix: predecessor refuses alias pair; corrected native projection returns 22 artifacts and preserves exit1 (diagnostic only): Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/jim/src/apps/abiogenesis/build_tenants/implementation-03/work/build/code/src/shared/digests.js' importe
- `d2-evidence-owner.test.mjs:27` 08 source delta is only the two candidate guards and revision immutable-prefix allocation: Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/implementation-03/work/code/src/abg/semantic_stage.ts'
- `d2-evidence-owner-lookup.test.mjs:8` initial collector: actual producer plus nested aliases yields one source and retains nonzero observation (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:19` initial collector: one producer without any alias remains accepted (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:22` initial collector: distinct same-valued producing CCalls remain ambiguous (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:27` initial collector: spliced, wrong, foreign, nonadvancing and stale producer each refuse (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:8` revision collector: actual producer plus nested aliases yields one source and retains nonzero observation (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:19` revision collector: one producer without any alias remains accepted (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:22` revision collector: distinct same-valued producing CCalls remain ambiguous (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:27` revision collector: spliced, wrong, foreign, nonadvancing and stale producer each refuse (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-evidence-owner-lookup.test.mjs:39` revision collector: old un-frozen filtered prefix refuses; successor supplies strict immutable historical prefix (lookup assumptions): Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-07/installed-frame-01/events-01/runtime.eve
- `d2-historical-design.test.mjs:8` same-byte/new-inode targets recover original Design coordinates on repeated repair (native lookup assumptions): AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-historical-design.test.mjs:27` first repair and byte-changing successor preserve exactly selected current targets: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-historical-design.test.mjs:35` newly assessed and subsequently retained revised Design use their own author basis, not the original root: AssertionError [ERR_ASSERTION]: same stage-revision bridge maps parent selection to new Design basis
- `d2-historical-design.test.mjs:89` the correction stays on the shared preparation path and preserves prior mechanisms byte-exact: Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/preimages/source/code/src/abg/semantic_revision.ts'
- `d2-historical-owner.test.mjs:1` test_env/tests/d2-historical-owner.test.mjs: 'test failed'
- `d2-workflow-step.test.mjs:9` retained stopped Intent foldback satisfies existing D1 step, not premature lifecycle closure: Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/installed-continuation-04/installed-frame-01/events-01/runtime.eve
- `d2-workflow-step.test.mjs:22` new relation accepts exact revision projection and refuses unknown or crossed request coordinates: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:29` stage author, assessment and combined stage foldback conserve revision basis and exact role: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:42` bridge requires matching revision/A/W coordinates while retaining the actual historical Design: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:52` E_D to new C2 reconstructs exact task, selected construction and retained sources; command failure remains evidence: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:65` evidence foldback and complete terminal preserve failed command and reject missing or crossed evidence: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:98` old C2 carrier/observation constructor and predicates stay unchanged; new chain will not accept the old arm: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:108` revision acknowledgment now constructs its honest nonzero-command observation while old guard stays closed: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `d2-workflow-step.test.mjs:118` exact four corrected Programs validate; root step differs from run closure and nested E_D is unchanged: Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/fixture-preparation/work/test_env/support/d2-continu
- `forward-command-owners.test.mjs:7` synthetic current native lookup maps all controlled retained C0 owners only under exact witness: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `forward-command-owners.test.mjs:22` synthetic cover wrong direction, scope, missing member and unrelated origin refuse in unchanged native owners: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `forward-command-owners.test.mjs:37` synthetic workflow alias does not add a C0 owner; distinct same-value producer is ambiguity: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `forward-command-owners.test.mjs:45` synthetic later cross-W post-publication failure invalidates the old subject alias without fabricating O1: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `generic-input-retention.test.mjs:82` real warm derivation and serialized cold projector agree; crossed/missing/duplicate lineage refuses: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `generic-input-retention.test.mjs:132` indexed immutable route membership avoids serialization and preserves detached-copy provenance: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `integration-shared-seams.test.mjs:1` test_env/tests/integration-shared-seams.test.mjs: 'test failed'
- `m5-consensus-module.test.mjs:1108` S05 reviewer and submitter project through one role-parameterized Prime atom: AssertionError [ERR_ASSERTION]: {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process
- `m5-consensus-module.test.mjs:1314` S05 round reduction and same-Run human finalization form one total Product algebra: AssertionError [ERR_ASSERTION]: {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process
- `m5-consensus-module.test.mjs:1546` S05 ABG binds each durable Run to its exact admitted invocation: AssertionError [ERR_ASSERTION]: {"kind":"event_store_reopen_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_event_history","message":"T
- `m5-consensus-module.test.mjs:1660` S05 reviewer realization carries the Product-declared instruction contract: AssertionError [ERR_ASSERTION]: {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process
- `m5-consensus-module.test.mjs:1935` S05 exact submitter-response basis gates reviewer reconsideration: AssertionError [ERR_ASSERTION]: {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process
- `m5-consensus-module.test.mjs:2115` S05 Product judgment binds reviewer and submitter output to the exact input task: AssertionError [ERR_ASSERTION]: {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process
- `m5-consensus-module.test.mjs:2251` S05 generic Public and ABG invocation basis contain no Consensus branch: Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/public/operations.ts'
- `m5-event-calculus-runtime.test.mjs:372` A5-F10 exact CCall opening accepts rehydrated carriers and refuses repeat or stale prefixes with zero append: TypeError [Error]: abg.openCall is not a function
- `m5-event-calculus-runtime.test.mjs:1316` terminal projection rows realize static locus law for the exact Run and preserve unrelated loci: AssertionError [ERR_ASSERTION]: runtime_failure_observed/runtime_invocation_active
- `m5-event-calculus-runtime.test.mjs:1471` run HoldsAt truth survives durable reopen and a lawful closure: TypeError [Error]: abg.openCall is not a function
- `m5-event-calculus-runtime.test.mjs:1548` runtime_failure_observed terminates the exact active Run: TypeError [Error]: abg.openCall is not a function
- `m5-event-calculus-runtime.test.mjs:1590` run_stopped makes runtime failure throw before memory or durable append: TypeError [Error]: abg.openCall is not a function
- `m5-fresh-process-reconstruction.test.mjs:13` M5 exact catalog basis and retained runtime truth reconstruct equally in two fresh processes: TypeError [Error]: abg.openCall is not a function
- `m5-installed-graph-edge.test.mjs:9` M5 installed HoG traverses an independently declared composed GraphFunction: AssertionError [ERR_ASSERTION]: {"kind":"product_execution_resolution_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"incompatible_or_unproven"
- `m5-retry-lifecycle-authority.test.mjs:21` declared C.retry frontier is the sole retry-attempt lifecycle owner: AssertionError [ERR_ASSERTION]: declared retry frontier lost owner relation: const calculus = deriveRuntimeEventCalculusProjection(prefix);
- `m5-retry-lifecycle-authority.test.mjs:238` CCall retry writes require the exact current declared retry frontier: AssertionError [ERR_ASSERTION]: missing source boundary: export function openInteractionCCall(
- `m5-retry-lifecycle-authority.test.mjs:281` production judgment writers remain closed behind the CCall owner: AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
- `m5-retry-lifecycle-authority.test.mjs:323` raw executor resume remains closed to every retry cursor: AssertionError [ERR_ASSERTION]: missing source boundary: else if (initialInput?.resume !== undefined)
- `m5-retry-lifecycle-authority.test.mjs:533` F04 payload refusal composes one pure result rejection while authority refusal cannot retry: AssertionError [ERR_ASSERTION]: missing source boundary: /**
- `m5-s03-authority.test.mjs:96` S03 capability policy is exact over admitted Program interaction requirements: TypeError [Error]: capability grant requires exact workspace, policy, actor, and definition authority
- `m5-s03-authority.test.mjs:218` S03 continuation operation authority requires the exact admitted grant and lifecycle state: TypeError [Error]: capability grant requires exact workspace, policy, actor, and definition authority
- `m5-s03-authority.test.mjs:285` S03 HoG accepts one Product-sealed projection and rejects its forged twin: AssertionError [ERR_ASSERTION]: The input did not match the regular expression /exact admitted install/u. Input:
- `m5-s03-authority.test.mjs:415` S03 Run semantic projection maps only typed R references and preserves opaque event-shaped domain strings: TypeError [Error]: runtime event candidate has an invalid envelope
- `r10-child-proof.test.mjs:1` test_env/tests/r10-child-proof.test.mjs: 'test failed'
- `r5-invocation-admission.test.mjs:15` W2-03 request selection is owned only by ProductExecutionResolutionPort: Error: ENOENT: no such file or directory, open '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/public/operations.ts'
- `r5-invocation-admission.test.mjs:100` non-root alias selection admits a distinct catalogHandle for one exact definition: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `r5-invocation-admission.test.mjs:598` R5 start admission resolves one exact Product start before its catalog definition: AssertionError [ERR_ASSERTION]: {"kind":"catalog_construction_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"verified_product_mismatch","messa
- `r6-implementation-resolution.test.mjs:14` R6 resolves one exact packaged leaf and all declared contracts: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `r8-direct-hog-entry.test.mjs:19` R8 opens explicit runtime scope and enters HoG at the declared C locus: TypeError [Error]: abg.hasAdmittedExecutionBasis is not a function
- `r9-causal-result-closure.test.mjs:53` R9 admits the uniform CCall spine, terminal route, and exact closure chain: TypeError [Error]: abg.openCall is not a function
- `r9-causal-result-closure.test.mjs:721` R9 totalizes a real result-admission rejection on the same CCall spine: TypeError [Error]: abg.openCall is not a function
- `retained-route-cursor-transition.test.mjs:26` route-origin workflow cursor stages, replays, commits and cold-projects exact retained input: TypeError [Error]: traversal transition differs from its staged successor projection
- `rival-authority-mutations.test.mjs:54` B8 an exact rehydrated ExecutionBasis enters the installed ABG path: TypeError [Error]: environment.abg.openCall is not a function
- `rival-authority-mutations.test.mjs:78` B8 HoG hides low-level completion and rejects a forged leaf port: TypeError [Error]: abg.openCall is not a function
- `t287-authenticated-owner-values.test.mjs:39` pure artifact values do not reacquire; fresh bytes, currentness and held effect checks still refuse drift: AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
- `t287-c0-correction-regressions.test.mjs:42` correction: raw writer retired; C0 marker scope remains strict: TypeError [Error]: Cannot read properties of undefined (reading 'graphFunctionRef')
- `t287-c2-owner-coordinate-reuse.test.mjs:120` post-stop Run and Workspace replay retain the JSON-cloned preparation owner and identical cold semantics: TypeError [Error]: child C2 source does not reproduce at its admitted preparation cut
- `t287-c2-owner-coordinate-reuse.test.mjs:195` C2 consumer reidentifies its copied preparation cut while preserving source/output and cold fallback: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:212` reopened C2 consumer retains the original native and preparation cuts without another physical read: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:227` a later duplicate producer invalidates current C2 consumption while its historical cut remains valid: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:238` C2 coordinate reuse preserves wrong/foreign cut, absent advancing producer, binding-cover and latest failed-mutation refusal: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-c2-owner-coordinate-reuse.test.mjs:266` separate installed reacquisition realization and judgment use exact original owner; C2 occurrence stays owner-bound: TypeError [Error]: operations.nativeWorkReacquisition is not a function
- `t287-calculus-state-transfer.test.mjs:70` identity_end: 'test did not finish before its parent and was cancelled'
- `t287-calculus-state-transfer.test.mjs:64` real admitted compose and shared batches conserve changing inputs under one basis: 'test timed out after 300000ms'
- `t287-conformance-owner-reuse.test.mjs:1` test_env/tests/t287-conformance-owner-reuse.test.mjs: 'test failed'
- `t287-cross-cut-public-read.test.mjs:105` different-cut native Definition reads keep blocked absence and exact historical child result/replay: AssertionError [ERR_ASSERTION]: run_status must retain the acquired prefix through late proof admission
- `t287-declared-testing-capability.test.mjs:174` declared checker composition uses native owners and independently rederives saved C1/C2 requests: AssertionError [ERR_ASSERTION]: exact selected RC7 companion release-record directory is required
- `t287-f04a-probabilistic-result-candidate.test.mjs:356` F04-A exact request-bound raw result admission is pure and decision-exact: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-fh-hold-open.test.mjs:1` test_env/tests/t287-fh-hold-open.test.mjs: 'test failed'
- `t287-generic-job-intake.test.mjs:12` one installed generic declaration admits two ordinary jobs through actual native child intake: AssertionError [ERR_ASSERTION]: {"kind":"product_install_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"dependency_lock_mismatch","message":"m
- `t287-governance-covered-source-use.test.mjs:351` covered use binds exact original state, complete canonical Catalog and cold admitted coordinates: AssertionError [ERR_ASSERTION]: select the frozen bounded fixture
- `t287-governance-covered-source-use.test.mjs:386` later completed work follows actual admitted covered-source ancestry without root or value guesses: AssertionError [ERR_ASSERTION]: select the frozen bounded fixture
- `t287-governance-covered-source-use.test.mjs:430` built-in ingress preserves the whole captured34 state and independent assessment subject: AssertionError [ERR_ASSERTION]: select the frozen bounded fixture
- `t287-gtl-language-corpus.test.mjs:1` test_env/tests/t287-gtl-language-corpus.test.mjs: 'test failed'
- `t287-historical-source-resource.test.mjs:64` actual R10 ancestry, declaration and leaf proof owners return borrowed historical facts; same live resource resolves once and cold copies reconstruct: AssertionError [ERR_ASSERTION]: exact existing basis body is borrowed
- `t287-installed-qualification-conservation.test.mjs:1` test_env/tests/t287-installed-qualification-conservation.test.mjs: 'test failed'
- `t287-malformed-gtl-gate.test.mjs:60` Public conformance conserves dual-kind closure authorities and rejects missing or conflicting ownership: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-management-supervision.test.mjs:105` native unknown coverage preserves a silent actor until hard cap; blocked child reaches Public unchanged: AssertionError [ERR_ASSERTION]: {"kind":"product_install_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"dependency_lock_mismatch","message":"m
- `t287-native-assembly-retained-input.test.mjs:12` actual native author fold consumes its admitted retained pair; crossed basis and input refuse: AssertionError [ERR_ASSERTION]: explicit closed job selection required; this test never acquires or writes its resource
- `t287-native-assessment-evidence.test.mjs:551` CCall failure projection conserves the authenticated malformed-result assessment: TypeError [Error]: profile schedule requires the original gap-free stamped history
- `t287-native-assessment-evidence.test.mjs:559` CCall failure projection refuses foreign producer, assessment and artifact correspondence: TypeError [Error]: profile schedule requires the original gap-free stamped history
- `t287-native-assessment-evidence.test.mjs:585` actor transport authentication is available before candidate association and refuses crossed facts: TypeError [Error]: profile schedule requires the original gap-free stamped history
- `t287-native-event-time.test.mjs:30` native HoG phase samples ignore caller seed; prepared candidate identity survives later admission and replay: AssertionError [ERR_ASSERTION]: explicit absolute proof territory required
- `t287-native-event-time.test.mjs:66` wall-clock rollback does not change store ordinal ordering or restamp historical bytes on lawful fresh-fixture reopen: AssertionError [ERR_ASSERTION]: explicit absolute proof territory required
- `t287-native-event-time.test.mjs:86` complete selected native producer field coverage samples each phase; planned candidates and probe aliases retain their sample: AssertionError [ERR_ASSERTION]: explicit proof territory required
- `t287-native-event-time.test.mjs:108` exact paired admission producer preserves recognition across forced clock movement; unequal-time baseline remains rejected: AssertionError [ERR_ASSERTION]: exact rejected paired producer required
- `t287-native-frame-observation.test.mjs:189` native controlled process preserves frame observations and owner causes: AssertionError [ERR_ASSERTION]: explicit proof-local territory
- `t287-native-frame-observation.test.mjs:209` frame declaration and observation-join falsifiers over an authentic read-only historical opening: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of Buffer or URL. Received undefined
- `t287-native-frame-observation.test.mjs:237` exact current D4 descriptor and retained historical EC rows/projections are conserved: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-native-semantic-evidence.test.mjs:11` retained native C2 evidence preserves file scope without constructing a legacy C1 task: AssertionError [ERR_ASSERTION]: explicit closed owner extraction required; no runtime resource is read
- `t287-native-semantic-job.test.mjs:224` native author fold preserves exact contract issues for same-response requirement refs outside the incoming domain: AssertionError [ERR_ASSERTION]: native failure reuses the original derivation
- `t287-native-semantic-revision.test.mjs:122` native D2 serialized public request chooses among eligible stages and composes the declared correction through native C2 and fresh Evidence: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-native-semantic-revision.test.mjs:270` native D2 root-backed binding cover authenticates source ancestry and preserves first refusals: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-native-semantic-revision.test.mjs:332` native D2 rejected assessor-only correction follows exact conserved requests across Runs and bindings: AssertionError [ERR_ASSERTION]: exact ancestry gets as far as the new cover
- `t287-native-semantic-revision.test.mjs:531` native Evidence preparation recovery conserves its exact folded producer through intake and the declared Evidence-only suffix: TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix
- `t287-observed-worksite-command.test.mjs:43` extended original C2 plan preserves all 26 sources through native and observed owners: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-ordered-reconstruction.test.mjs:22` snapshot proof identity rejects transplanted descriptors while raw and copied histories keep cold fallback: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-ordered-reconstruction.test.mjs:74` cold acquisition receipt detaches caller input and preserves pure, copied, explicit-fresh and current-prefix distinctions: AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
- `t287-ordered-reconstruction.test.mjs:103` historical durable cuts reidentify only exact owner history after physical authentication: AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:
- `t287-ordered-reconstruction.test.mjs:158` held derivation preserves physical authentication and discards staged facts on rollback: AssertionError [ERR_ASSERTION]: exact held object, after physical byte authentication
- `t287-post-binding-worksite-write.test.mjs:244` T-287 C0 reaches its owner, admits specialized evidence, and replays O1 from a fresh process: TypeError [Error]: artifact truth is reachable only through its checked owner ingress
- `t287-predecessor-context.test.mjs:1` test_env/tests/t287-predecessor-context.test.mjs: 'test failed'
- `t287-public-terminal-projection.test.mjs:34` actual closed retry-completion history yields exact Run truth, Result and replay without new execution: AssertionError [ERR_ASSERTION]: select the exact frozen S02 episode fixture
- `t287-public-terminal-projection.test.mjs:50` terminal producer join refuses missing progress, foreign producer/scope and unrelated causal paths: AssertionError [ERR_ASSERTION]: select the exact frozen S02 episode fixture
- `t287-public-terminal-projection.test.mjs:68` workspace replay fixed Definition uses its exact owner projection identity in held and cold reads: AssertionError [ERR_ASSERTION]: select the exact frozen S02 episode fixture
- `t287-public-terminal-projection.test.mjs:87` Run-truth refusal conserves the caught terminal cause through existing Public evidenceRefs: AssertionError [ERR_ASSERTION]: select the exact frozen S02 episode fixture
- `t287-qualification-parent-alias.test.mjs:18` native parent alias conserves the original child/J and rejects crossed provenance and competing producers: AssertionError [ERR_ASSERTION]: explicit frozen fixture and isolated emitted-owner binding required
- `t287-qualification-producer-acquisition-reuse.test.mjs:1` test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs: 'test failed'
- `t287-recursive-registered-selection.test.mjs:129` authenticated recursive child failure preserves its diagnostic, prior work and cold failed truth: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-registered-graph-selection.test.mjs:15` registered selection through installed Public CLI, child foldback and fresh reads: AssertionError [ERR_ASSERTION]: module://registered-selection/product@5: {"kind":"static_validation_refusal","schemaVersion":"5.0.0","disposition":"invalid","st
- `t287-release-acceptance.test.mjs:1` test_env/tests/t287-release-acceptance.test.mjs: 'test failed'
- `t287-release-publication.test.mjs:1` test_env/tests/t287-release-publication.test.mjs: 'test failed'
- `t287-result-evidence-lineage-projection.test.mjs:215` actual CCall callback conserves admitted lineage for both qualification task forms without weakening any guard: TypeError [Error]: event store was not constructed by this ABG module
- `t287-s03-automatic.test.mjs:1` test_env/tests/t287-s03-automatic.test.mjs: 'test failed'
- `t287-selected-action.test.mjs:1` test_env/tests/t287-selected-action.test.mjs: 'test failed'
- `t287-selected-execution-closure.test.mjs:1` test_env/tests/t287-selected-execution-closure.test.mjs: 'test failed'
- `t287-st1-installed-cross-owner-hello.test.mjs:116` ST-4 transport refuses inherited selectors and owner traversal: AssertionError [ERR_ASSERTION]: inherited eventResource
- `t287-st1-installed-cross-owner-hello.test.mjs:737` ST-1 executes an independently authored minimal GTL test through installed Public owners: ReferenceError [Error]: product is not defined
- `t287-stdo-run-environment.test.mjs:87` STDO declaration, exact actual access, bounded refusals and immutable profiles: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `t287-undispatched-diagnostic.test.mjs:93` undispatched refusal retains entered, routed and resumed cursor ownership at raw and cold boundaries: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-undispatched-diagnostic.test.mjs:222` CCall refusal completion keeps full authority across sparse multi-Run scope and cold raw admission: AssertionError [ERR_ASSERTION]: The input did not match the regular expression /authentic open-call|stage does not match/. Input:
- `t287-wave2-owner-contract-source-set.test.mjs:609` the deeply frozen intrinsic family closes exact schemas and schema-free digests: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-wave2-owner-contract-source-set.test.mjs:796` D01-D15 strict native requests admit their accepted representative: AssertionError [ERR_ASSERTION]: D15
- `t287-worksite-branch-construction.test.mjs:584` T-287 C3 Parallel topology constructs canonically and closes installed C1 children: AssertionError [ERR_ASSERTION]: {"kind":"executable_traversal_completion","schemaVersion":"5.0.0","disposition":"blocked","cCallRef":"c-call:sha256:2fbb02f9132a
- `t287-worksite-branch-construction.test.mjs:669` T-287 C3 preserves outer and nested partial prefixes and never opens fan-in: AssertionError [ERR_ASSERTION]: {"kind":"executable_traversal_completion","schemaVersion":"5.0.0","disposition":"blocked","cCallRef":"c-call:sha256:8a4350fe55a3
- `t287-worksite-construction.test.mjs:217` T-287 C1 remains singular inside the C3 composite publication: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `t287-worksite-construction.test.mjs:361` T-287 C1 traverses one installed fake-Claude candidate through C0 and fresh replay: TypeError [Error]: Cannot read properties of null (reading 'nativeInstructionAssemblyBasis')
- `t287-worksite-construction.test.mjs:688` T-287 C1 retains an exact partial prefix when a later C0 member refuses: AssertionError [ERR_ASSERTION]: {"kind":"executable_traversal_completion","schemaVersion":"5.0.0","disposition":"failed","cCallRef":"c-call:sha256:7d1d1bf549fc3
- `t287-worksite-file-replace-owner.test.mjs:371` T-287 C0 Product owner atomically replaces one W-bound worksite file and fails closed: AssertionError [ERR_ASSERTION]: {"kind":"worksite_effect_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_coordinate","message":"worksit
- `t288-composition-conservation.test.mjs:1` test_env/tests/t288-composition-conservation.test.mjs: 'test failed'
- `t288-physical-return-conservation.test.mjs:1` test_env/tests/t288-physical-return-conservation.test.mjs: 'test failed'
- `t288-workflow-scope-conservation.test.mjs:1` test_env/tests/t288-workflow-scope-conservation.test.mjs: 'test failed'
- `w2-steel-single-start.test.mjs:118` terminal cardinality remains one while explicit downstream consumption preserves child result: AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
- `witness-reprice-definition-binding.test.mjs:27` declared ABG constructors remain unchanged and source binding exposes only selected callables: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:36` exact DefinitionCall admits one native witness pair and fresh-process reads/replay agree (stubbed Product environment): AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:67` external approval remains exact-member only; unselected witness members remain unsupported: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:77` crossed or missing authority, request, resource and grant refuse before native owner: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:94` installed catalog coordinate cannot be substituted with internally consistent caller coordinates: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:102` native semantic content/context refusals return owner close handoff and no witness event: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:112` generic witness reprice does not implement D2 cover-selection meaning: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:118` native second-event transaction failure leaves neither event and preserves first cause: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:124` duplicate native outcome projects a typed basis refusal without forging success: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:129` raw Public witness with material history decodes only on acquisition and retains cold correspondence: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:147` copied witness packets keep I-JSON, wrong-prefix and foreign-store refusals: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:162` raw witness acquisition still refuses changed current physical bytes before native admission: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:169` all six native witness members consume the admitted held history after raw packet validation: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:205` Public profile reprice retains the exact L-to-P boundary and standalone cold content checks: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-reprice-definition-binding.test.mjs:226` successful append still requires successful physical close before any receipt: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:31` current Public run_status supplies the same Run and route-grade basis to stop; cold replay preserves the result: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:65` wrong actor, missing/crossed execution basis, grant and malformed request refuse before native admission: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:77` approved but false stop content or Run/basis context returns a semantic refusal and unchanged close: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:89` a closed Run with the authentic Public identity and basis refuses stop without appending: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:96` changed cold physical bytes refuse before stop admission: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:102` live owner stop borrows its admitted state without decoding history or releasing the enclosing owner: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:
- `witness-run-stopped-definition-binding.test.mjs:117` failed native stop transaction keeps both events absent and returns the first cause: AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:

**Stops.**
1. **Rows 9-10 are unchanged** (`product/worksite_command_execution.ts:1781-1785`, `isPredicateObservation`). This stop has two reasons.
   - *The guard catches other work.* The `try` also performs the reads `value.observedValue` and `value.evidence`. `exactKeys` checks the key set, not that each member is a data property, so an accessor member runs its getter at those reads. With the `catch` deleted, a throwing getter would escape. This is the stop rule's case: the guard stays.
   - *The admission cannot leave the guard within the grant.* Taking the admission out of the guard means editing the file. Any edit changes the bytes of `build/code/src/product/worksite_command_execution.js`, which `gtl/worksite_command_execution.ts:36-39` and `:61` pin as the C2 context member: digest, byte count 115,562, and the renderer span at bytes 105,477-107,909. The renderer (`:2283`) follows the site, so its span would move. In the scratch worktree, the edited file failed the build at `scripts/generate-product-manifest.mjs:101`: "C2 declared context member differs from its packaged Product source: build/code/src/product/worksite_command_execution.js". The pin is outside the grant.

   The admission inside the guard no longer throws, so the `catch` now catches only the getter reads. To discharge it, grant the pin (`gtl/worksite_command_execution.ts`: digest, `byteCount`, `startByte`, `endByte`; the span's text and digest do not change) with this change at the site:
   ```ts
   let observed: unknown, evidence: unknown;
   try { observed = value.observedValue; evidence = value.evidence; } catch { return false; }
   return admitJson(observed).kind === "ok" && admitJson(evidence).kind === "ok";
   ```
   The commit's mandated first line says "the thirteen catch blocks deleted". The commit changes 11 of the 13 sites. At rows 8, 11, 12 and 13 the admission's `catch` is deleted and a guard stays only for other work; at rows 12 and 13 that work is the validator. At row 5 the whole `try` is deleted. Rows 9-10 are this stop.

No other stop. No admission code was added. No failure class, refusal class, receipt shape or event payload key changed. No lane's red identities changed (item 6). The bound refuses nothing that a lane or fixture admits.

**Deviations from the activation's wording.**
- Row 5 deletes the whole `try`, because its other work, `asIJsonObject` on an admitted value, cannot throw. The activation expected the other work to keep its guard.
- Rows 8 and 11 each keep two guards, one on each side of the admission. Item 2 names what each guard catches.
- Rows 12 and 13 share `malformedOrAdmitted`. The validator's guard moved there and encloses only `isLeafRealizationCandidate`.
- The refusal cause is `{ at, atTruncated, reason }`, not `{ at, reason }`. `at` is bounded at 8,192 characters as a caught message is, and `atTruncated` flags the cut, as `messageTruncated` does. The Executive accepts it or drops it.
- The F_P validator-throw route cannot be reached with genuine inputs. F_P validation of an admitted value calls no caller code, so it is proved under a replaced `isRecord` premise. The same `try` serves F_D, where `validateSuccess` is caller code.
- Item 0b: the guard the site relies on is in the same function. The C-2 disposition and the activation said it was in another; this is an erratum.

**Findings outside the grant.**
1. **Dead `catch` blocks.** `sameJson` (`public/binding/definition_binding_mechanics.ts:42-57`) and `exactIJson` (`abg/definition_event_resource.ts:212-219`) each keep a `catch` around `admitJson` alone. It can no longer fire. `sameJson`'s comment (`:45-47`) says `admitJson` throws on a cycle and on a proxy trap. Both answers stay `false` through the refusal. The `O-TYPE: sameJson …` case (`t287-common-computational-library.test.mjs:238`) passes. Discharge: delete both `catch` blocks and the stale comment.
2. **The throwing lift.** For a cyclic, over-deep or trapped input, the lift `admitIJsonValue` (`shared/i_json.ts`) and its nine throw-contract callers (TD-16 rows 14-22) now throw `IJsonAdmissionError` with the message `<label><at>: <reason>`. Head threw a `RangeError` or the trap's own error. Row 14 (`validator/raw_admission.ts`) copies that message into its `non_canonical_value` refusal, so for those inputs its text now names the cycle, the bound or the trap. The code and the class are unchanged.
3. **Other `admitJson` callers.** Outside TD-16's rows, they now take their own refusal channel for those inputs, where head threw.
4. **Values 513 or more deep.** Head admitted values nested 513 to about 1,500-2,300 deep when the stack allowed. They are now refused. No lane or fixture holds one.

## C-3 disposition (Executive, 2026-10-24)

Accepted at `8566b228e`. Executive check on that head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 7 allow-listed, no offender; `npm run build` rc 0 and no regenerated diff; `t287-common-computational-library` 10/10; `t287-value-equality` 5/5; `t287-runtime-failure-diagnostic` 17/17; `t287-undispatched-diagnostic` 7/5/2/0 (the two head reds, fixture rows F2/F3); `m5-worker-transport` 23/23; `t287-owned-process-lifetime` 18/18; `r10-projection-contracts` 10/10; `forward-command-contracts` 10/10; `t287-management-stream-drain` 8/4/0/4 and `t287-management-context` 14/12/0/2 with no untracked directory after either (`exec_check_C3.log`). The commit carries seventeen files: the ten `code/src` modules the grant names, the two files `npm run build` regenerates, the four test files and this record; no other.

The Return meets the contract. Item 0b: the cast is gone and the site relies on the guard at `:1796` in the same function; the type proof (TS2412 with the guard removed in scratch) shows the key `actor_process_terminated(undefined)` cannot type-check. Erratum accepted: the C-2 disposition and the activation said the guard was in another function. Item 0c: the two lanes leave no directory and the untracked set is unchanged; the held path is proved by reading, since nothing sets `T287_STREAM_HELD_EVENT_LOG`. Item 1: the cycle set holds the containers on the current path only, so a shared non-cyclic value is admitted; the bound is 512 with the measured headroom (overflow at 1,476 nested records from 2,000 frames deep, the deepest fixture 40, the deepest lane value 17); every inspection read of a container is inside a guard that refuses the container at its own location, naming the thrown value's nearest native error class without reading a member of it; 180,554 fixture values admit byte-identically. Item 2: eleven of the thirteen sites read the outcome directly; rows 8 and 11 keep a guard on each side of the admission for `JSON.parse` and the owner's verifier, and for the derivation lookup and the capture; rows 12 and 13 share `malformedOrAdmitted`, whose only `try` encloses the validator; row 5 lost its whole `try` because `asIJsonObject` over an admitted value cannot throw (deviation accepted). Item 3: `deterministicFailure` takes the class; its six existing callers are byte-identical in effect (TD-17's six literal subjects still pass); the three routes give one cold subject each, read back cold through failure admission and the Public projection. The `atTruncated` member is accepted: it is TD-17's `messageTruncated` convention applied to the refusal's `at`, which the same producer cuts at the same bound, and the cause is a new body on a new route, not a change to an existing key; no class, receipt shape or event payload key changed. Item 4: three new cases; the F_P validator-throw case is proved under a replaced `isRecord` premise because F_P validation of an admitted value calls no caller code, and the case says so in its output (accepted). Item 6: 140 lanes, 887/606/185/94 before and 890/609/185/94 after with the three new tests, the 187 red identities the same; the one output difference (`t287-worksite-branch-construction:669`, one or two stream events) varies between two runs at head and is not this package's.

Design sentences restated by the Executive in this bookkeeping commit, from the Return's item 5: `:126` (the row gains the totality clause), `:280` (the falsifier names the bound and any throw), `:606` (D4: no `catch` for `admitJson`; a remaining guard encloses other work), `:613` (O-TYPE (A): a refusal takes the site's channel), and the §9.3 closing paragraph (`:579`: the `malformed_return` routes and their causes; the citation `:560` becomes `:561`; "8192 bytes" becomes "8192 UTF-16 code units").

Stop ruled. Rows 9 and 10 (`product/worksite_command_execution.ts:1781-1785`): the guard stays, since the `try` also performs the two member reads that can run a getter (the stop rule's own case). The admission can leave the guard only with an edit to that module, whose built bytes the C2 context pin fixes (`gtl/worksite_command_execution.ts:36-39`, `:61`); the pin is a self-check that the packaged source equals the declared member, refreshed with every edit to that module (TD-15 + TD-16 did so at `a692fb4b9`), not a Product contract. Ruling: discharge, carried into C-4 as item 0a with the Return's text and the pin refresh; reversal: leave the site, where the admission inside the guard is harmless. The commit's first line says thirteen; the record states eleven and this carry.

Findings ruled. (1) `sameJson` (`public/binding/definition_binding_mechanics.ts:42-57`) and `exactIJson` (`abg/definition_event_resource.ts:212-219`) keep a dead `catch` around `admitJson` alone, with a stale comment: a defect of the same class; carried into C-4 as item 0b. (2) The throwing lift and its nine throw-contract callers now throw `IJsonAdmissionError` naming the cycle, the bound or the trap where head threw `RangeError` or the trap's error, and row 14's refusal text carries that message: the code and the class are unchanged and the message is more exact; not a defect. (3) Values nested 513 or more deep, which head admitted when the stack allowed, are refused; no lane or fixture holds one; the bound is the design's (`:280`). Not a defect.

Register: O-1 closed at `8566b228e` (LEAF-FAILURE-DIAGNOSTIC-01's `finalize` site; the `finalize` clause of NW-DEBT-ADMISSION-DIAGNOSTIC-01, whose retry route cause remains P2). The T-290 Phase C row "`admitJson` totality" is discharged except rows 9 and 10, which C-4 item 0a carries.

## C-4 activation (Executive, 2026-10-24; TD-19's stop: no new tree mirror under `.ai-workspace`)

Debt (register TD-19, "Stop recursive evidence copying; inventory historical retention"; T-290 Phase C row "TD-19"). The register's census at `2f1393061` over `.ai-workspace/comments` and `work/T287_COMMON_LIBRARY_DELIVERY_01` found 85,492 tracked paths and 40,256,058,637 logical bytes, with the same 16,367,505-byte `abg-acquisition.json` tracked 25 times. The owner ruled (T-290 Phase C): stop copying now, proof packages reference the log by coordinate; historical deletion only after the retention manifest. The register's boundary stands: no historical cleanup is authorized by this package.

The mechanism, from the Executive's census at `79339b560` (`git ls-files`, no disk walk). Past packages copied the tenant tree into their work records and committed the copy: `realization/<package>/source/` and `stage/` ("a new disposable exact source mirror", `work/T287_COMMON_LIBRARY_DELIVERY_01/realization/pure/report.md:33`, `:47`), `proof/baseline/source/`, `proof/baseline-build/`, `preimages/`, `subject-*/`, `failed-*/`. Tracked paths under `.ai-workspace/` holding a `build_tenants/` segment: 43,638. Under `work/`: 41,900 paths in 89 mirror roots, 2,113,143,583 logical blob bytes (`T287_COMMON_LIBRARY_DELIVERY_01` 31,757; the seven `T287_G2_*` and `T287_PUBLIC_PREPARATION_BRIDGE_01` records 1,049 to 1,130 each; the four `T287_CONTEXT_PROJECTION_*` and `T287_REFERENCE_ATTRIBUTION_*` records 478 to 479 each). Under `comments/`: 1,737 paths in 83 roots, 1,507 of them under `comments/codex/20260928_FRAMED_GOVERNANCE`. Under `evidence/` and `uat/`: none. The `specification/` segment appears in 3,122 tracked paths inside those roots and in four comment-side roots outside them (`20260928_FRAMED_GOVERNANCE/g2-existing-owner-groups-01/stage/`, `f11-law-stage-repair-01/source-fixtures/{selectedRC2,retainedRC1}/`, `rc1-successor-construction-controls-03/authority-postimages/`). `work/T287_SANDBOX_UAT_RUN_02` holds 657 tracked paths under `source/` (527 of them `code/`) written by the UAT harness, and `supplied-work/<run>/{old,fresh}/sandbox/worksite/specification/` (7 paths per run), which are the sandbox's own worksite records. The repository's `.gitignore` already states the intent ("Local AI-work installations, compilation scratch and copied Product trees" stay local; "authored work records, reviews, drivers and patches remain visible") and names thirteen directory names; the mirrors entered under names it does not list (`source`, `stage`, `stage-01`, `baseline`, `baseline-build`, `baseline-repo`, `preimages`, `postimages`, `root-preimages`, `subject-*`, `failed-*`, `acquired`, `templates`, and the package names themselves). The current wave copies nothing: `work/T290_DEBT_WAVE_01` has 5 tracked paths, and every Phase A to C record names its cut by commit hash, its lanes by file and its inputs by path and line. The code's only copy operations (`scripts/generate-product-manifest.mjs:245-266`) copy the TypeScript toolchain into `build/toolchain`, an ignored build output, and are not this debt.

The rule this package makes mechanical: a tracked path under `.ai-workspace/` is never a copy of a repository tree, an install, a build output or a prior proof tree. A package record names its cut by commit hash and each finite input by path and digest; what the record needs from a tree is a reference into the log or the cut, never the tree. Paths in this activation are relative to the repository root unless they start with `scripts/`, `test_env/` or `code/`, which are under `build_tenants/abiogenesis/typescript/`.

Items.

0. The C-3 residuals (two defects, from the C-3 disposition).
   - 0a. `code/src/product/worksite_command_execution.ts:1781-1785` (`isPredicateObservation`, TD-16 rows 9 and 10). The `try` encloses the reads `value.observedValue` and `value.evidence`, which can run a getter (`exactKeys` checks the key set, not that each member is a data property), and the two `admitJson` calls, which no longer throw. Move the admissions out: read the two members inside the guard into locals, `catch` returns `false`, and return the conjunction of the two admissions after the guard (the C-3 Return's text under its stop). Any edit to this module changes the bytes of `build/code/src/product/worksite_command_execution.js`, which `code/src/gtl/worksite_command_execution.ts:36-39` and `:61` pin as the C2 context member; refresh the pin (`digest`, `byteCount`, `startByte`, `endByte`) so `npm run build` passes its check at `scripts/generate-product-manifest.mjs:101`, and state that the renderer span's text and `spanDigest` are unchanged; the two tracked files the build regenerates follow. Lanes: `t287-worksite-command-execution` (installed cases, about nine minutes), `forward-command-contracts`, `m5-c-algebra-validation`, before and after.
   - 0b. `code/src/public/binding/definition_binding_mechanics.ts:42-57` (`sameJson`) and `code/src/abg/definition_event_resource.ts:212-219` (`exactIJson`) each keep a `catch` around `admitJson` alone, which cannot fire, and `sameJson`'s comment (`:45-47`) says `admitJson` throws on a cycle and a proxy trap. Delete both `catch` blocks and restate both comments in one sentence each: a refusal on either side is inequality; a value is I-JSON when `admitJson` admits it. Both answers stay `false` for a refused value. Lanes: `t287-common-computational-library` (the `O-TYPE: sameJson` case at `:238`) and every lane whose test file or support module imports either module (name them), before and after.
1. `.gitignore`. Under the existing block ("Local AI-work installations, compilation scratch and copied Product trees"), add the patterns that catch a copied tree by what it contains rather than by its parent's name: `.ai-workspace/**/build_tenants/` and `.ai-workspace/**/specification/` at least; add a pattern only when the census of item 3 shows tracked copies it alone would have caught (for example `.ai-workspace/**/code/src/`). Prove, with `git ls-files` and `git check-ignore --no-index`, that every tracked path the new patterns match lies inside an inventoried root of item 3 and that no authored record (a `.md`, `.json`, `.mjs`, `.diff` or `.txt` outside those roots) matches. A pattern that would hide an authored record is a stop. The ignore rules do not untrack anything: every historical path stays tracked and resolvable; the rules only refuse a new copy at `git add`.
2. The lint, `scripts/check-evidence-mirrors.mjs`, wired as `"lint:evidence"` in `package.json` beside `lint:imports` and `lint:lifecycle`. It runs from the tenant directory with `git -C <repository root> ls-files -z .ai-workspace`, no disk walk, no network, no dependency outside Node. It classifies each tracked path by the first segment that marks a copied tree (`build_tenants`, `specification`, `code/src`, `node_modules`, and any the census adds), takes the path above that segment as the mirror root, and compares the set of roots and each root's tracked path count with the inventory of item 3: a root absent from the inventory, or a root with more tracked paths than inventoried, is an offender; fewer is lawful (deletion is later and separate). Exit 1 with one line per offender naming the root and the count; exit 0 with one summary line in the style of the two existing lints (`check-evidence-mirrors: <n> tracked mirror roots under .ai-workspace, all inventoried; no new copy`). Negative: in a scratch index (`GIT_INDEX_FILE`), stage one file at `.ai-workspace/work/T290_DEBT_WAVE_01/scratch-mirror/build_tenants/x.txt` and show the lint exit 1 naming `scratch-mirror`; nothing of that enters the real index or the working tree.
3. The inventory, `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json`, generated by the same script with `--write` and committed; a second `--write` on the same tree is byte-identical (prove it). One row per mirror root (the 89 under `work/`, the 83 under `comments/`, and any the classification of item 2 adds, including the UAT run `source/` roots and the sandbox worksite roots, each marked with its kind): the root path; the owning record (the `work/<record>` or `comments/<agent>/<post>` directory); the tracked path count; the logical byte total from `git cat-file --batch-check`; the cut it mirrors when a freeze, manifest or report file inside the owning record names a commit (`freeze.json`, `source-manifest.json`, `basis.json`, `L2-candidate-freeze*.json`, or the report's own line; `null` otherwise, with the file you looked in); and the references: every tracked `.md` or `.json` file outside the root whose text names a path inside it, found with `git grep -l -F`. Totals at the end: roots, paths, bytes, roots with zero references, roots whose cut is known. The inventory is a derived read model pinned by the lint, not authority; it is the reference inventory the register's L task requires before any deletion, and the Executive takes the deletion decision to the owner with it at the Phase C close.
4. The active writer. Find what writes `.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/<run>/source/` (start at `scripts/sandbox-uat.mjs`, a four-line entry, and `test_env/uat/`). State whether a UAT run at head would add a tracked copied tree to a work record. If it would, and the run record's consumer (`test_env/uat/harness.test.mjs` or any test) does not assert the copy's presence, make the writer record a reference in its place: the source commit hash, the package name, version and tarball digest it already knows, and the paths it would have copied, as one JSON file; the run's own outputs (receipts, logs, event bodies the harness owns) are not copies and stay. If a consumer asserts the copy, stop: name the assertion and leave the writer unchanged (the ignore rules of item 1 still refuse the copy at `git add`). If nothing at head writes such a copy, say so with the evidence and change nothing.
5. Records. Propose, for the Executive to place: one sentence for the `.gitignore` block comment stating the rule of this activation in the block's own voice; one bullet for the T-290 Rules ("A package record names its cut by commit hash and its inputs by path and digest; it holds no copy of a repository tree, an install, a build output or a prior proof tree; `npm run lint:evidence` refuses one"); the TD-19 register state after this package (the stop closed; the historical rows held for the owner's deletion decision on the inventory). No design sentence is touched; say so after checking `design/` for "proof package", "mirror" and "evidence packaging".
6. Lanes. `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`, `npm run lint:evidence`, `npm run build` (rc 0 with the refreshed pin and no regenerated diff beyond the two files the commit carries), and `git status --short` (nothing untracked after the lint and the inventory run). The lanes of items 0a and 0b before and after, one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 test_env/tests/<lane>.test.mjs`, with tests/pass/fail/skipped and every red identity, the same or the difference named. If item 4 changes the writer, `node --test test_env/uat/harness.test.mjs` before and after (its one budget case is red at head at `:471`, 18015000 against 18025250; name it the same before and after) and the writer's own unit lane if one exists. No other lane.

Grant: for item 0, `code/src/product/worksite_command_execution.ts` (the one function), `code/src/gtl/worksite_command_execution.ts` (the pin values only), `code/src/public/binding/definition_binding_mechanics.ts` (`sameJson` and its comment), `code/src/abg/definition_event_resource.ts` (`exactIJson` and its comment), and the two tracked files `npm run build` regenerates; `.gitignore`; `build_tenants/abiogenesis/typescript/scripts/check-evidence-mirrors.mjs` (new); `build_tenants/abiogenesis/typescript/package.json` (the one `lint:evidence` line); `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json` (new); the one writer of item 4, named in the Return before it is changed, and only its copy step; this record (append only, your section). No deletion, move or rewrite of any tracked path under `.ai-workspace/`; no design edit; no register edit; no other file.

Stop (write it in the Return, keep the rest moving): any deletion or relocation of a tracked historical path; an ignore pattern that would hide an authored record; a UAT consumer that asserts the copied tree; a run record format a test reads that item 4 would change; a mirror whose classification is ambiguous (name it in the inventory with `kind: "unclassified"` and leave it counted).

Return contract: one commit on `main` with the first line `C-4: TD-19's stop: no new tree mirror under .ai-workspace; lint:evidence pins the inventoried historical roots; the inventory lists each root's size, cut and references` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`. Append `## C-4 return` at the end of this record with the pattern proof (item 1), the lint's summary line and its negative (item 2), the inventory totals and the rows with zero references and with a known cut (item 3), the writer finding and its before and after or the evidence that nothing writes a copy (item 4), the proposed sentences (item 5), the lane table (item 6), the before and after of the four item 0 sites with the pin values (item 0), and any stops. Nothing above your section is edited.

## C-4 return

Worker: Opus 5.5, fresh context. Base `a9f336ead`; this package's single commit is the next one on `main`, not pushed. Paths are relative to the repository root unless they start with `scripts/`, `test_env/`, `code/`, `design/` or `build/`, which are under `build_tenants/abiogenesis/typescript/`. Lines are at head `a9f336ead` unless marked "after". Every count under `.ai-workspace/` comes from the index (`git ls-files`, `git cat-file`, `git grep --cached`, `git check-ignore --no-index`); nothing under `.ai-workspace/` was walked on disk, and no tracked path there was deleted, moved or rewritten.

| Item | State | Evidence |
|---|---|---|
| 0a. `isPredicateObservation` | done; pin refreshed; span text and `spanDigest` unchanged | item 0 below |
| 0b. `sameJson`, `exactIJson` | done | item 0 below |
| 1. `.gitignore` | done; five patterns; `contracts/` stopped; patch layouts and sandbox worksites are stops | pattern proof |
| 2. `lint:evidence` | done; negative exits 1 naming `scratch-mirror` | summary line and two negatives |
| 3. Inventory | done; 607 roots; second `--write` byte-identical | totals, rows |
| 4. UAT writer | nothing at head writes a copy; no change | item 4 below |
| 5. Records | proposed; no design sentence touched | item 5 below |
| 6. Lanes and gates | done; no red identity changed | lane table |

**Item 0a** (`code/src/product/worksite_command_execution.ts`, `isPredicateObservation`). Head `:1781-1785`: a `try` returned `admitJson(value.observedValue).kind === "ok" && admitJson(value.evidence).kind === "ok"`, and `catch` returned `false`. After `:1781-1783`, the C-3 Return's text:
```ts
let observed: unknown, evidence: unknown;
try { observed = value.observedValue; evidence = value.evidence; } catch { return false; }
return admitJson(observed).kind === "ok" && admitJson(evidence).kind === "ok";
```
The guard now encloses only the two member reads, which can run a getter. The admissions follow it.

The C2 context pin (`code/src/gtl/worksite_command_execution.ts`). Measured on the built `build/code/src/product/worksite_command_execution.js`:

| Pin value | Line | Head | After |
|---|---|---|---|
| `digest` | `:37` | `sha256:a8d7035f451e9f8459e5ff696ef520d440efc7a32bce2481374cae577e693182` | `sha256:5a9e5414090bd2e2b521551b9a28d98917cefa6edd1d252c2d26fbfd9997aba5` |
| `byteCount` | `:39` | 115,562 | 115,644 |
| `startByte` | `:61` | 105,477 | 105,559 |
| `endByte` | `:61` | 107,909 | 107,991 |
| `spanDigest` | `:61` | `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf` | unchanged |

The span's 2,432 bytes occur once in the new member and equal head's span byte for byte. They sit 82 bytes later because the function precedes them. The renderer's text is unchanged.

`npm run build` regenerates three tracked files, not two. `a692fb4b9` carried the same three.

| File | Head sha256 | After sha256 | Changed leaves |
|---|---|---|---|
| `build_tenants/abiogenesis/typescript/product-toolchain-manifest.json` | `bd694e0e98ae…` | `a6c99b87f2ac…` | 68 |
| `build_tenants/abiogenesis/typescript/contracts/capabilities/capability-definition-graph.json` | `c2438278693d…` | `dbca026ed932…` | 310 |
| `build_tenants/abiogenesis/typescript/contracts/worksite/command-execution-context.inventory.json` | `5f1e603756ab…` | `6e72f8a15368…` | 1 (the member digest) |

With every hex run of 32 or more characters masked, no leaf of the three files differs between head and after. Each change is a digest. `package.json` is packaged content (`files` holds `build/**`, `contracts/**` and the manifest, and the manifest digests `package.json`), so the `lint:evidence` line also moves the product content digest. The after lanes ran on the build that holds that line.

**Item 0b.** Both dead `catch` blocks and the stale comment sentences are deleted.
- `sameJson` (`code/src/public/binding/definition_binding_mechanics.ts`). Head `:42-57`; after `:42-51`. The two admissions are plain `const` reads, and the conjunction with `canonicalEquals` is unchanged. Head's comment (`:45-47`) said that `admitJson` throws on a cycle and on a proxy trap, and that the `catch` keeps those answers `false`. Those sentences are gone. The comment is now one sentence: "The binding lift of `canonicalEquals` over unchecked call values: both sides are admitted through `admitJson`, and a refusal on either side is inequality."
- `exactIJson` (`code/src/abg/definition_event_resource.ts`). Head `:212-219`; after `:212-215`. The body is `return admitJson(value).kind === "ok";`. The comment is "A value is I-JSON when `admitJson` admits it." It replaces "… A cyclic value or a throwing proxy trap is not."

A probe on the built module gave `sameJson`: a cyclic record `false`, a proxy whose `ownKeys` trap throws `false`, 513 nested arrays `false`, equal values `true`, unequal values `false`; each refused value answers `false` without a throw. The lane case `O-TYPE: sameJson` (`test_env/tests/t287-common-computational-library.test.mjs:238`) passes before and after.

**Item 1: `.gitignore`.** I added five lines at `.gitignore:73-77`, after `.ai-workspace/**/toolchain/npm/` and inside the block "Local AI-work installations, compilation scratch and copied Product trees":
```
.ai-workspace/**/build_tenants/
.ai-workspace/**/specification/
.ai-workspace/**/code/src/
.ai-workspace/**/test_env/
.ai-workspace/**/.ai-workspace/
```
Three of them come from the item 3 census. The two mandated patterns catch 47,265 tracked paths. The other three catch 28,531 that hold neither a `build_tenants/` nor a `specification/` directory:
- 18,665 with a `code/src/` directory;
- 9,664 with `test_env/` and no `code/src/`;
- 202 with only a nested `.ai-workspace/`.

`node_modules/` is already ignored (`:55`).

Proof. I ran `git ls-files -z .ai-workspace | git check-ignore --no-index -z --stdin -v` with head's `.gitignore` and again with the new one, then compared the results with the inventory:

| Measure | Count |
|---|---|
| tracked paths under `.ai-workspace/` (with the new inventory) | 127,233 |
| ignored by head's rules | 447 |
| ignored by the new rules | 76,065 |
| newly matched | 75,618 |
| newly matched inside an inventoried root | 75,618 |
| newly matched outside every inventoried root | 0 (so 0 authored `.md`, `.json`, `.mjs`, `.diff` or `.txt` outside them) |
| deciding pattern of the newly matched (the one that excludes the outermost directory) | `build_tenants/` 43,621; `code/src/` 18,492; `test_env/` 9,683; `specification/` 3,620; `.ai-workspace/` 202 |
| previously ignored, now decided by a new pattern | 28 |
| classified (inventoried) paths | 75,801; all ignored after; 183 ignored before |
| classified paths whose root is not in the inventory | 0 |

The rules untrack nothing. They refuse a new copy at `git add`. The untracked set is unchanged: before and after, `git status --short` lists the same 14 untracked entries, none of them this package's. Two are codex strategy posts; twelve are harness unit-run directories dated 2026-10-24T05:21 under `.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/`. The new rules now hide 216 of the 421 untracked files in those unit-run directories (160 under `build_tenants/`, 56 under `specification/`). They are a sandbox's worksite trees written by `test_env/uat/harness.test.mjs`; see Findings. Three stops follow (Stops 1 to 3).

**Item 2: the lint.** `scripts/check-evidence-mirrors.mjs` (new) is wired as `"lint:evidence": "node scripts/check-evidence-mirrors.mjs"` (`package.json:102`, after `lint:lifecycle`).
- It runs `git -C <repository root> ls-files -z .ai-workspace` with no disk walk, no network and Node built-ins only.
- It classifies each path by its first marker segment below `.ai-workspace/`: `build_tenants`, `specification`, a nested `.ai-workspace`, `code/src`, `test_env` or `node_modules`. The root is the path above that segment.
- It compares each root and its path count with the inventory. An unlisted root, or one with more paths than listed, prints one line and the lint exits 1. Fewer paths is lawful.
- `--write` regenerates the inventory from the same classification.

At the commit:
```
check-evidence-mirrors: 607 tracked mirror roots under .ai-workspace, all inventoried; no new copy
```
(rc 0). Negatives in scratch indexes (`GIT_INDEX_FILE` copies of the real index, one `git update-index --add --info-only --cacheinfo` entry each, the empty blob `e69de29bb2d1…`, nothing on disk):
```
$ GIT_INDEX_FILE=…/index.neg   # + .ai-workspace/work/T290_DEBT_WAVE_01/scratch-mirror/build_tenants/x.txt
.ai-workspace/work/T290_DEBT_WAVE_01/scratch-mirror: 1 tracked path(s), not inventoried
check-evidence-mirrors: 1 mirror root(s) under .ai-workspace hold tracked paths the inventory does not list, a new copy; name the cut by commit hash and each input by path and digest instead
rc=1
$ GIT_INDEX_FILE=…/index.neg2  # + …/T287_COMMON_LIBRARY_DELIVERY_01/proof/baseline/source/build_tenants/negative-probe.txt
.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/proof/baseline/source: 1307 tracked path(s), 1306 inventoried
check-evidence-mirrors: 1 mirror root(s) under .ai-workspace hold tracked paths the inventory does not list, a new copy; name the cut by commit hash and each input by path and digest instead
rc=1
```
`git check-ignore --no-index -v` decides both probe paths by `.gitignore:73:.ai-workspace/**/build_tenants/`. Afterwards the real index holds 5 paths under `work/T290_DEBT_WAVE_01`, none of them a probe path, and `scratch-mirror/` does not exist on disk.

**Item 3: the inventory** (`.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json`, 1,616,337 bytes, sha256 `f2dec8874073a4907eda405c20154892562dd5a8f0318406c98e6a6cd1b11966`). Generation:
1. Every grant file was staged first.
2. `node scripts/check-evidence-mirrors.mjs --write` ran (3 min 6 s), and its output was copied to scratch.
3. A second `--write` ran, and `cmp` reported the two outputs byte-identical (`IDENTICAL`, same sha256).

The file holds `kind`, `schemaVersion`, `standing` (a derived read model pinned by the lint, not authority), `rules` (the classification and each field's definition, in words), `roots` and `totals`. Each row records:
- `root`, `owner` (`work/<record>`, `evidence/<record>`, `comments/<agent>/<post>` or `context/<area>/<kind>/<entry>`) and `kind`;
- `markers`, `paths` and `bytes` (from `git cat-file --batch-check`, duplicates counted);
- `pathsAtHead`: paths whose position below the root names a tracked path at this index;
- `pathsDuplicated`: paths whose blob is also tracked outside the root;
- `cut`: `{ commit, file, line, pathsMatching }` or `null`; `pathsMatching` counts paths whose blob equals the blob at the same position in that commit;
- `cutLookedIn`, the files examined when `cut` is `null`;
- `references` and `referencesOutsideMirrors`.

| Total | Value |
|---|---|
| roots | 607 |
| paths | 75,801 |
| bytes | 3,128,437,550 |
| roots with zero references | 5 (the same 5 counting only references outside mirrors) |
| roots with a known cut | 266 |
| roots whose known cut matches at least one path's blob | 121 |

| Area | Roots | Paths | Bytes |
|---|---|---|---|
| `work/` | 240 | 61,792 | 2,701,942,527 |
| `comments/` | 346 | 13,909 | 422,494,143 |
| `evidence/` | 20 | 89 | 3,784,527 |
| `context/` | 1 | 11 | 216,353 |

| Kind (decided in this order) | Roots | Paths | Bytes |
|---|---|---|---|
| `uat-run-source` (`work/T287_SANDBOX_UAT_RUN_02/operator/<run>/source`) | 2 | 527 | 14,409,143 |
| `patch-layout` (only `.diff`/`.patch`; authored, not a copy) | 3 | 11 | 38,116 |
| `ignore-skeleton` (only `.gitignore`) | 162 | 3,938 | 2,876,017 |
| `sandbox-worksite` | 27 | 661 | 47,390,071 |
| `install` | 5 | 5 | 650 |
| `build-output` | 21 | 7,675 | 208,699,902 |
| `repository-tree` | 190 | 45,881 | 2,216,839,550 |
| `tenant-tree` | 197 | 17,103 | 638,184,101 |
| `unclassified` | 0 | 0 | 0 |

The `ignore-skeleton` roots hold only per-directory `.gitignore` files of a copied tree. The tree's other files stayed untracked, and the 20260923 WIP checkpoint transport alone left 5,511 tracked `.gitignore` files.

Census reconciliation. The activation's census counts the roots of tracked paths holding a `build_tenants/` segment. On this index that census gives 89 roots and 41,900 paths under `work/`, 83 roots and 1,737 paths under `comments/`, and 1 root of 1 path under `context/` (43,638 paths, 173 roots), which matches the activation's figures. The context root is one the activation did not list. 172 of the 173 roots are inventory roots unchanged. The 173rd, `comments/codex/20260928_FRAMED_GOVERNANCE/f11-carrier-realization-01/copied-tenant/test_env/…/docs/standards/templates` (12 paths), falls inside the inventory root `…/f11-carrier-realization-01/copied-tenant`, because `test_env` opens the tree first. The inventory adds 434 roots that the `build_tenants` census does not see: `specification/`, `code/src/`, `test_env/`, nested `.ai-workspace/` and `node_modules/` copies, plus the UAT source and sandbox worksite roots the activation names. Of the activation's 657 tracked paths under `T287_SANDBOX_UAT_RUN_02/…/source/`, 527 lie in the two `uat-run-source` roots. The other 130 lie in fixture `source/` directories (`crosscut-installed-source-context-proof-82/…/fixture/source/`, `current-installed-dependency-lock-repair-207/fixtures/…`), authored fixture files that no marker classifies.

Rows checked by hand. Each is a row where no path, or one, names a tracked path at this index. Each keeps the kind its rule gives, and none is `unclassified`.
- **7 `odd_glc` roots**: `comments/codex/20260924_EXECUTIVE_CHECKPOINT/tracking-0{3,4}/{preimages,postimages}/odd_glc`, `20260924_WORKSPACE_RESOURCE_LIFETIME/command-budget-contract-01/{preimages,postimages}/odd_glc` and `…/native-d2-01/source-basis-repair-01/tracking-preimage/odd_glc`. They hold the sibling repository's files laid out by its own paths. Their `build_tenants` or nested `.ai-workspace` marker makes them `repository-tree`.
- **9 `standards/templates` roots**: the 8 `final-law/standards/templates` roots under `20260928_FRAMED_GOVERNANCE/final-candidate-construction-03` to `-10` (13 paths each), and `work/T287_COMMON_LIBRARY_DELIVERY_01/realization/k11-role-source-successor-01/resources/counterexample-stdo-source/standards/templates`. They are copies of STDO standard templates: blob `6feb61a0…` exists in the `specification_methodology` `a_c` source. They are `repository-tree` by `build_tenants`.
- **`comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/seed`** (1 path): its blob is the one tracked under `default-library-implementation/attempt-0{3,4}/worksite-result`. It is `repository-tree` by `specification`, and `pathsDuplicated` 1 keeps it out of `unclassified`.

Rows with zero references. No tracked `.md` or `.json` outside the root names a path inside it:

| Root (under `.ai-workspace/`) | Paths | Bytes | Kind | Cut | What does name it |
|---|---|---|---|---|---|
| `work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/root-preimages` | 4 | 690,922 | repository-tree | `727f1dbcab3c` | `verify_documents.py` (a `.py`) |
| `work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233/finite-membership-diagnostic-33` | 1 | 38,128 | tenant-tree | `0b1187c40cca` | a `.jsonl` checkpoint |
| `work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233/finite-retainer-diagnostic-33` | 1 | 37,472 | tenant-tree | `0b1187c40cca` | a `.jsonl` checkpoint |
| `work/T287_STDO3_RECONCILIATION_01/product-writer/preimages` | 11 | 223,782 | repository-tree | `727f1dbcab3c` | the activation names `preimages.json` only |
| `work/T287_STDO3_RECONCILIATION_01/root-preimages` | 4 | 645,800 | repository-tree | `727f1dbcab3c` | none found |

Rows with a known cut: 266 roots in 17 groups, by owner and named commit. The cut is the commit the record names, found in `return.md` (173 roots), `basis.json` (68), `freeze.json` (24) and `source-manifest.json` (1). It is not proved to be the copied tree. `pathsMatching` measures the tie: a path matches when its blob equals the blob at the same position in that commit. A post-image root matches 0 by construction. Each root's own row is in the inventory.

| Owner (under `.ai-workspace/`) | Cut | Roots | Paths | Paths matching | Named at |
|---|---|---|---|---|---|
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | `5c4245ea900f` | 6 | 26 | 12 | `native-d2-01/return.md:9` |
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | `701026970da5` | 5 | 28 | 7 | `command-budget-contract-01/return.md:5`, `native-contract-diagnostics-01/return.md:5` |
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | `88cd8b66f901` | 2 | 16 | 8 | `native-d2-01/admission-boundary-refactor-01/selector-presentation-01/author-context-policy-01/design-presentation-continuation-02/owner-continuation-repair-01/lock-graph-reuse-01/return.md:3` |
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | `c080e5f85de0` | 1 | 3 | 2 | `event-causation-lookup-01/return.md:5` |
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | `faf44bfb5904` | 7 | 28 | 13 | `native-d2-01/admission-boundary-refactor-01/selector-presentation-01/return.md:3` |
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | `ff29a8bab8f8` | 3 | 16 | 16 | `native-d2-01/admission-boundary-refactor-01/step3/return.md:3`, `native-d2-01/admission-boundary-refactor-01/return.md:26` |
| `comments/codex/20260928_FRAMED_GOVERNANCE` | `1535e001baf4` | 2 | 11 | 8 | `registered-selection-native/return.md:7` |
| `comments/codex/20260928_FRAMED_GOVERNANCE` | `1aec3999f5c9` | 2 | 28 | 17 | `s7-pending-consumer-01/selected-action-01/return.md:3` |
| `comments/codex/20260928_FRAMED_GOVERNANCE` | `55a8a452141c` | 13 | 55 | 1 | 7 files (return.md) |
| `comments/codex/20260928_FRAMED_GOVERNANCE` | `b8bffae0654b` | 2 | 21 | 10 | `s6-fulfillment-implementation/return.md:5` |
| `comments/codex/20260928_FRAMED_GOVERNANCE` | `b90249e0d18a` | 3 | 29 | 9 | `s7-pending-consumer-01/source-use-01/return.md:5` |
| `work/T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01` | `727f1dbcab3c` | 1 | 4 | 0 | `basis.json:3` |
| `work/T287_COMMON_LIBRARY_DELIVERY_01` | `67c33379992b` | 26 | 8,836 | 8,334 | 6 files (freeze.json, basis.json) |
| `work/T287_COMMON_LIBRARY_DELIVERY_01` | `727f1dbcab3c` | 63 | 26,589 | 21,746 | `basis.json:3`, `proof/baseline/source-manifest.json:6` |
| `work/T287_COMMON_LIBRARY_DELIVERY_PLAN_01` | `727f1dbcab3c` | 1 | 3 | 0 | `basis.json:3` |
| `work/T287_SANDBOX_UAT_RUN_02` | `0b1187c40cca` | 127 | 15,665 | 5,535 | `operator/return.md:3`, `return.md:38` |
| `work/T287_STDO3_RECONCILIATION_01` | `727f1dbcab3c` | 2 | 15 | 8 | `basis.json:3` |

**Item 4: the UAT writer.** Nothing at head writes `.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/<run>/source/`. The writer is unchanged.
- **The entry.** `scripts/sandbox-uat.mjs` (4 lines) calls `main` of `test_env/uat/runner.mjs`. The runner archives each run under `config.archiveRoot`, whose default is `test_env/test_runs/sandbox-uat` (`runner.mjs:79`). `.gitignore:38` (`build_tenants/*/*/test_env/test_runs/`) ignores that directory, and `:80` refuses an archive inside `build/` or `artifacts/`. A run writes its own records, a `bootstrap/node_modules` install and the sandbox's `sandbox/worksite` tree.
- **No copy step.** None of `test_env/uat/{runner,public-setup,consumer,continuation}.mjs` holds a `cp`, `cpSync`, `copyFile` or `rename` call, or any copy of tenant source.
- **No tracked naming.** Outside `.ai-workspace/`, only two tracked files name `T287_SANDBOX_UAT_RUN_02` (`git grep --cached`): `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md` (prose) and this package's lint.
- **The two copied trees** are `operator/library-definition-reuse-232/source` (263 classified paths) and `operator/library-runtime-state-233/source` (264). Drivers inside the record wrote them. For example, `operator/library-runtime-state-233/stage-owned-overlay.py:5-13` writes tenant `code/src` files and Worker 235 post-images into `phase/'source/code/src'`. They are history, and the item 1 rules and the lint refuse a repeat.

So a UAT run at head adds no tracked copied tree to a work record. Item 6 runs the harness lane only when the writer changes, so it was not run.

**Item 5: records (proposed; the Executive places them).**
- **`.gitignore` block comment**, a third line under the two at `:53-54`:
  `# A tree copied into a work record (repository, tenant, specification, install, build output or prior proof) stays local; the record names its cut by commit hash and its inputs by path and digest.`
- **T-290 Rules bullet:**
  "A package record names its cut by commit hash and its inputs by path and digest; it holds no copy of a repository tree, an install, a build output or a prior proof tree; `npm run lint:evidence` refuses one."
- **TD-19 register state.**
  - The stop is closed at the C-4 commit. `.gitignore:73-77` refuses, at `git add`, a copied repository, tenant, specification or workspace tree under `.ai-workspace/`. `npm run lint:evidence` refuses a tracked one that `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json` does not list.
  - The historical rows are held for the owner's deletion decision: 607 mirror roots, 75,801 paths and 3,128,437,550 bytes, each with its size, its named cut and its references.
  - The inventory does not cover two things. The first is 43,039,901,551 bytes in 51,432 tracked paths outside the mirror roots: run outputs, mostly `.json` (21.58 GB), `.jsonl` (10.69 GB) and `.part*` chunks. The second is a copy holding only a `contracts/` tree (Stop 1).
  - Open for a ruling: Stops 2 and 3 (patch layouts, sandbox worksites).
- **Design check.** `design/` holds no "proof package" or "evidence packaging" (0 hits each). "mirror" has 12 hits in 9 files, and all of them concern runtime or code structure. Examples: the sandbox snapshot mirror (`design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:302`, `:453`, `:592`), "does not port by file mirroring" (`design/PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md:20`) and carrier mirroring (`design/TYPESCRIPT_REALIZATION_GUARDRAILS.md:57`). None of them governs how a package record holds evidence, so no design sentence is touched. The repository has no root `design/`.

**Item 6: lanes and gates.**

| Gate | Result after |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | rc 0 |
| `npm run lint:imports` | `check-import-direction: 28 modules under code/src/shared/ import only code/src/shared/ and packages` |
| `npm run lint:lifecycle` | `check-lifecycle-boundary: 284 modules under code/src; 7 allow-listed site(s), no offender` |
| `npm run lint:evidence` | `check-evidence-mirrors: 607 tracked mirror roots under .ai-workspace, all inventoried; no new copy` (rc 0) |
| `npm run build` | rc 0 (33 s), run with every grant file staged; `git diff` afterwards is empty, so the build regenerates exactly the three staged files |
| `npm run build` at head, before any edit | rc 0, no diff |
| `git status --short` before the commit | the 11 grant files and this record, staged; untracked: the same 14 entries as at the start (item 1) |

Lanes ran one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`. Before means head's build. After means the final build, with the `lint:evidence` line. A middle run, on the edited code before that line was added, gave the same counts and red identities. A script compared each red's test identity and first error, before against after, and found both the same in every lane.

| Lane | Item | Why in the set | Before (t/p/f/s) | After | Reds |
|---|---|---|---|---|---|
| `t287-worksite-command-execution` | 0a | activation; installed cases (8 min 52 s before, 8 min 18 s after) | 10/10/0/0 | 10/10/0/0 | none |
| `forward-command-contracts` | 0a | activation | 10/10/0/0 | 10/10/0/0 | none |
| `m5-c-algebra-validation` | 0a | activation | 22/19/0/3 | 22/19/0/3 | none |
| `t287-common-computational-library` | 0b | `O-TYPE: sameJson` `:238`; imports `definition_binding_mechanics` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-conformance-owner-reuse` | 0b | imports both | 1/0/1/0 | 1/0/1/0 | file level: `ABI5_CONFORMANCE_METADATA` not set |
| `t287-cross-cut-public-read` | 0b | `definition_binding_mechanics` | 5/4/1/0 | 5/4/1/0 | `:105` |
| `t287-installed-product-coordinate` | 0b | `definition_event_resource` | 11/11/0/0 | 11/11/0/0 | none |
| `t287-interrupted-event-resource-recovery` | 0b | `definition_event_resource` | 8/6/2/0 | 8/6/2/0 | `:74`, `:136` |
| `t287-malformed-gtl-gate` | 0b | `definition_binding_mechanics` | 6/5/1/0 | 6/5/1/0 | `:60` |
| `t287-release-acceptance` | 0b | `definition_event_resource` | 1/0/1/0 | 1/0/1/0 | file level: "explicit disposable F16 proof territory required" |
| `t287-w2-05-install-catalog-owner-chain` | 0b | `definition_binding_mechanics` | 1/0/1/0 | 1/0/1/0 | `:286` |
| `t287-w2-05-static-binding-algebra` | 0b | imports both | 5/3/0/2 | 5/3/0/2 | none |
| `witness-reprice-definition-binding` | 0b | `definition_event_resource`, `test_env/support/witness-reprice-mechanics.mjs` | 15/0/15/0 | 15/0/15/0 | all 15 (`:27` to `:226`) |
| `witness-run-stopped-definition-binding` | 0b | the same two | 7/0/7/0 | 7/0/7/0 | all 7 (`:31` to `:117`) |
| `t287-fh-hold-open` | 0b | `witness-reprice-mechanics.mjs`, which imports `definition_event_resource` | 1/0/1/0 | 1/0/1/0 | file level: `ERR_MODULE_NOT_FOUND`, a module under `.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/` |
| `t288-workflow-scope-conservation` | 0b | `definition_event_resource` | 1/0/1/0 | 1/0/1/0 | file level: `assert.ok(prior)` |
| `t288-physical-return-conservation` | 0b | `definition_event_resource` | 1/0/1/0 | 1/0/1/0 | file level: `assert.ok(prior)` |
| `t287-governance-covered-source-use` | 0b | `definition_event_resource` | 8/2/3/3 | 8/2/3/3 | `:351`, `:386`, `:430` ("select the frozen bounded fixture") |
| `test_env/uat/continuation` | 0b | `definition_event_resource` | 4/0/0/4 | 4/0/0/4 | none |

Totals: 19 lanes, 127 tests, 80 pass in both runs (before and after), 35 reds with the same identities and first errors in both runs, and 12 skipped. The reds depend on the environment or on records: unset variables, record-held modules and fixtures. None of them involves `sameJson`, `exactIJson` or `isPredicateObservation`.

**Stops.**
1. **`contracts/` is not a marker and has no pattern.** `.ai-workspace/**/contracts/` would hide authored records: the 36 run outputs of `.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/e03-r1-identity-boundary-01/contracts/` (`explicit-design-*-actual.json`, `-comparison.json`, `-input.json`), which are that run's own results, not a copy. A `contracts` marker would add 4,958 tracked paths in 227 roots, 103 of them not existing roots. Those 4,958 paths are neither inventoried nor checked by the lint, and a new copy holding only a `contracts/` tree is not refused.
2. **The patterns match authored patches laid out by repository path.** The three `patch-layout` roots hold 11 tracked `.diff` files:
   - `comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-typed-contract-realization-01/deltas` (7, decided by `build_tenants/`);
   - `evidence/T287_G2_CLOSED_TUPLE_PROOF_CONSUMER_REPAIR_01/Source/diffs` (2, decided by `code/src/` and `test_env/`);
   - `evidence/T287_G2_SEMANTIC_ASSEMBLY_TUPLE_REPAIR_01/Source/diffs` (2, the same).

   They are inside inventoried roots, so the item 1 proof holds, and they stay tracked. But a future record that lays its diffs out this way is refused at `git add` and by the lint. That contradicts the block's own line "… drivers and patches remain visible" (`.gitignore:54`). A possible refinement, for the Executive to rule on:
   - use the forms `.ai-workspace/**/build_tenants/**` (and the like) in place of the directory forms, because git cannot re-include a file below an excluded directory;
   - add `!.ai-workspace/**/*.diff` and `!.ai-workspace/**/*.patch`;
   - have the lint skip `.diff`/`.patch` paths.

   The mandated pattern form is kept.
3. **The patterns also refuse a sandbox's own worksite records.** The activation calls `supplied-work/<run>/{old,fresh}/sandbox/worksite/specification/` the sandbox's own worksite records, and item 4 keeps a run's own outputs.
   - The 27 `sandbox-worksite` roots hold 661 paths. 14 are under `comments/codex/20260928_FRAMED_GOVERNANCE`, 8 under `work/T287_SANDBOX_UAT_RUN_02`, 4 under `work/T287_COMMON_LIBRARY_DELIVERY_01` and 1 under `comments/codex/20260926_CALCULUS_CROSSCUT`.
   - They are inventoried, so the item 1 proof holds, and they stay tracked.
   - A future run record that holds a sandbox worksite's `specification/` or `build_tenants/` tree is refused at `git add` (`.gitignore:73-74`), and the lint refuses it as a new root.
   - Finding 2 shows the effect today: 216 of the 421 untracked harness unit-run files are hidden.

   For the Executive to rule, one of two:
   - a sandbox worksite is a run output that stays visible: then the same `/**` forms with a re-include scoped to the worksite segments (`!.ai-workspace/**/sandbox/worksite/**` and the like), and the lint skips the `sandbox-worksite` kind;
   - a run record names its worksite by digest, as it names any other input.

**Deviations from the activation's wording.**
- `npm run build` regenerates three tracked files, not two. `product-toolchain-manifest.json` is the third, as at `a692fb4b9`.
- The marker set is `build_tenants`, `specification`, a nested `.ai-workspace`, `code/src`, `test_env` and `node_modules`. The census added `.ai-workspace` and `test_env`; `contracts` is out (Stop 1).
- Owners include `evidence/<record>` and `context/<area>/<kind>/<entry>` as well as `work/` and `comments/`. The inventory has 20 roots under `evidence/` and 1 under `context/`.
- References are found differently. The activation names a per-root `git grep -l -F`. A single fixed-string pattern over all tracked `.md`/`.json` takes about 5.5 s, and the time grows with the pattern count: 1,000 patterns ran past 11 minutes before I stopped them. So `git grep --cached -l -F` runs once over the 54 owner directory names, and a resolver attributes each path-like token to the deepest root containing it. The candidate set adds the `.md`/`.json` files outside mirrors below each root's parent, where relative mentions are written. Two kinds of file are excluded from references: the inventory itself, and `.ai-workspace/work/T290_DEBT_WAVE_01/`, whose records name roots in order to discuss them.
- The cut is looked up in `freeze.json`, `source-manifest.json`, `basis.json`, `L2-candidate-freeze*.json`, `report.md` and `return.md`, from the root's parent directory up to the owner. It is the commit the record names, not a proved tie to the copied tree, and `pathsMatching` measures the tie. For 225 cut-less roots, `cutLookedIn` is empty because no such file exists between the root and its owner. For the other 116, it lists the files examined.
- Kinds are decided by an ordered rule, and the rule is written into the inventory. Seventeen rows were checked by hand (item 3), and none is `unclassified`.
- The lint's offender line reads `<root>: <n> tracked path(s), not inventoried` or `<root>: <n> tracked path(s), <m> inventoried`. It is followed by one closing line naming the remedy.

**Findings outside the grant.**
1. **References cover `.md` and `.json` only.** Consumers in other formats exist: `t287-fh-hold-open` imports a module from `.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/`, `verify_documents.py` names `T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/root-preimages`, and a `.jsonl` checkpoint names the two `*-diagnostic-33` roots. One tenant `.mjs` (`test_env/`, `scripts/`) names a path inside a root: `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-04/work`. A deletion decision should first grep every tracked format.
2. **The harness writes into a tracked work record by default.** `test_env/uat/harness.test.mjs:20` sets the default unit-run root to `.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/`, where 120 historical paths are tracked. The 12 untracked unit-run directories at the start of this package came from it. The new rules hide 216 of their 421 files, the `build_tenants/` and `specification/` trees of the sandbox worksite. The other files stay visible to `git status`.
3. **Mirror roots hold a small share of the bytes.** Of the 46,168,339,101 tracked bytes under `.ai-workspace/` at this index, mirror roots hold 3,128,437,550 (6.8 %). The other 43,039,901,551 bytes, in 51,432 paths, are run outputs. By owner:

   | Owner | Bytes |
   |---|---|
   | `comments/codex/20260928_FRAMED_GOVERNANCE` | 16.50 GB |
   | `20260923_WIP_CHECKPOINT` | 8.25 GB |
   | `20260924_WORKSPACE_RESOURCE_LIFETIME` | 6.82 GB |
   | `work/T287_SANDBOX_UAT_RUN_02` | 4.08 GB |
   | `work/T287_COMMON_LIBRARY_DELIVERY_01` | 3.67 GB |
   | `20260926_CALCULUS_CROSSCUT` | 2.33 GB |

   The largest single names are `intake-start.jsonl` (1.00 GB in total), `08-intake-conformance.json` (0.59 GB) and `live-start.jsonl` (0.57 GB). All 30 tracked `abg-acquisition.json` copies lie inside mirror roots. TD-19's retention manifest needs this second inventory before the 40 GB figure shrinks materially. This package's rule does not reach it.

## C-4 disposition (Executive, 2026-10-25)

Accepted at `cc8e796a6`. Executive check on that head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 7 allow-listed, no offender; `lint:evidence` 607 roots inventoried, no new copy, and its negative (a `scratch-mirror/build_tenants/x.txt` staged in a scratch index) rc 1 naming the root; `npm run build` rc 0 and no regenerated diff; the C2 pin re-measured on the built member (digest `5a9e5414…`, 115,644 bytes, span 105,559 to 107,991, `spanDigest` `1fcd7184…` unchanged); `t287-worksite-command-execution` 10/10; `forward-command-contracts` 10/10; `m5-c-algebra-validation` 22/19/0/3; `t287-common-computational-library` 10/10; the untracked set unchanged at 14 entries (`exec_check_C4.log`). The commit carries twelve files: the four item 0 code files, the three files `npm run build` regenerates (the toolchain manifest, the capability graph and the command execution context inventory, each changed in one digest leaf), `.gitignore`, `package.json`, the new lint, the inventory and this record; no other; no tracked path deleted, moved or rewritten.

The Return meets the contract. Item 0a: the guard encloses the two member reads only and the two admissions follow it; the C2 pin is refreshed (digest `5a9e5414…`, 115,644 bytes, span 105,559 to 107,991), and the Executive re-measured the built member and its span: the span's 2,432 bytes and `spanDigest` `1fcd7184…` are unchanged, 82 bytes later. Item 0b: both dead `catch` blocks and their stale sentences are gone; the probe shows a cycle, a throwing trap and 513 nested arrays answer `false` without a throw. Item 1: five patterns; 75,618 tracked paths newly matched, all inside inventoried roots, none outside; nothing untracked; the three patterns beyond the two mandated (`code/src/`, `test_env/`, a nested `.ai-workspace/`) come from the census and are accepted. Item 2: the lint reads the index only, pins each root's path count, and its two negatives exit 1 naming the root; the Executive's own negative agrees. Item 3: 607 roots, 75,801 paths, 3,128,437,550 bytes; byte-identical on the second `--write`; the activation's census of 173 roots reproduces, 172 as roots and one inside a larger root; 434 roots the `build_tenants` census could not see; eight kinds, none `unclassified`; 266 roots with a named cut and 121 of them tied to it by at least one blob; five roots with no `.md` or `.json` reference. Item 4: nothing at head writes a copy into a run record; the two copied trees were written by drivers inside the record; the writer is unchanged and the harness lane lawfully not run. Item 5: no design sentence governs evidence packaging; none touched. Item 6: 19 lanes, 127 tests, 80 pass and 35 red with the same identities and first errors before and after; the reds are environment and record dependencies, none involving the three touched functions.

Deviations accepted: three regenerated files (the context inventory follows the pin); the marker set; owners under `evidence/` and `context/`; the one-pass reference search (a per-root search would take over 11 minutes per 1,000 roots); the cut as the named commit with `pathsMatching` as the tie; the ordered kind rule.

Stops ruled, each into C-5 item 0. (1) `contracts/`: no name pattern can tell a copied `contracts/` tree from a run's own `contracts/` outputs, so the lint classifies by content (a path below it that names a tenant `contracts/` path by position) and `.gitignore` gains nothing. (2) Patch layouts: `.gitignore:54` already promises patches visible; the five patterns take their `/**` forms with scoped directory re-includes and `.diff`/`.patch` re-includes, and the lint skips those files; reversal: the C-4 directory forms. (3) Sandbox worksites: a run record names its worksite by digest, as any other input; the 27 historical roots stay; the harness's default unit-run root leaves the tracked work record for the ignored `test_env/test_runs/`, which also discharges Finding 2.

Findings ruled. (1) References in other formats: C-5 item 0a searches every tracked text format. (2) Discharged as above. (3) The 43,039,901,551 bytes of run outputs in 51,432 paths outside mirror roots (half under `20260928_FRAMED_GOVERNANCE`): TD-19's retention decision is the owner's at the Phase C close, brought with this inventory and the Return's by-owner table; a second inventory is written only if the owner decides to delete. The leftover worktree `wt-base-97b1200bc` is the Executive's scratch, pruned at the Phase C close.

Register: TD-19's stop closed at `cc8e796a6`; the row carries the historical state for the owner's decision. T-290 Rules gain the record bullet. The `.gitignore` comment sentence is placed by C-5 item 0a with the pattern change.

## C-5 activation (Executive, 2026-10-25; the evidence root: one root, one variable, lanes skip with their reason; nothing over 6 MB enters; TD-04 and TD-05 discharged)

Base: the C-4 bookkeeping commit on `main`. Worker: one fresh Opus 5.5 at xhigh. Paths are relative to the repository root unless they start with `scripts/`, `test_env/`, `code/`, `design/` or `build/`, which are under `build_tenants/abiogenesis/typescript/`. Every count under `.ai-workspace/` comes from the index (`git ls-files`, `git cat-file --batch-check`, `git grep --cached`, `git check-ignore --no-index`); the only disk reads under `.ai-workspace/` are the named evidence files (by path) and the two bounded searches item 1 names.

The owner's ruling (T-290 `## Phase C`, row "Historical evidence stores for proof lanes", agreed 2026-10-24): one evidence root named by one environment variable; a lane skips with its named reason when the root is absent and runs when it is present; nothing over 6 MB enters the repository; the stores stamped with an intermediate event-contract profile (`sha256:4196aaeb…`, P8; `t288-instruction-assembly-owner:499` with its retained directory set, F1) are regenerated from their scenario at head under the root or retired with the reason; the reader's admission set at `abg/event_store.ts:1189` is not widened (reversal: admit one digest whose event-kind delta is shown fold-compatible); the TD-05 fixture increments F2 and F3 (`t287-native-semantic-revision:531`; `t287-undispatched-diagnostic:93`, `:222`) ride with it. The register's TD-04 and TD-05 rows list the remaining increments; this package discharges them all or states, per increment, why not.

**Item 0: the C-4 residuals (Executive rulings on the C-4 Return's three stops and findings 1 and 2).**

- 0a. `scripts/check-evidence-mirrors.mjs` and the inventory. (i) Stop 1 ruled: `contracts/` is classified by content, not by name. A `contracts/` directory under `.ai-workspace/` is a mirror root of kind `contracts-tree` (marker `contracts`) when at least one tracked path below it names, by its position below that directory, a tracked path below `build_tenants/abiogenesis/typescript/contracts/` at the same index; a `contracts/` directory with no such path is a run's own output and is not classified. `.gitignore` gains no `contracts/` pattern, since a pattern cannot discriminate by content. (ii) Finding 1 ruled: references are searched over every tracked text file (`.md`, `.json`, `.jsonl`, `.py`, `.mjs`, `.js`, `.ts`, `.sh`, `.txt`, `.yaml`, `.yml`, `.toml`) under `.ai-workspace/` and the tenant, with the same one-pass grep over owner names and the same resolver; the three roots Finding 1 names (`T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/root-preimages`, the two `*-diagnostic-33` roots) now show their references. (iii) The 6 MB rule, mechanical: a tracked path whose blob exceeds 6,000,000 bytes anywhere in the repository is refused unless the inventory lists it under `oversize` (path, bytes, the tracked files that name it); at head the list holds exactly `test_env/proof/abi5-root-r10.json` (18,642,450 bytes) and `test_env/proof/abi5-root-r10.transcript.json` (9,801,195 bytes), each with its readers (the Executive's census found none outside `test_env/proof/` for either; confirm or correct). The proof of refusal uses a `--size-bound <bytes>` flag that lowers the bound for one run: at `--size-bound 2000000` the lint exits 1 naming the tracked 2 to 6 MB files as unlisted; no object is written to `.git`. (iv) The inventory is regenerated with `--write` after (i) to (iii) and item 0b, and a second `--write` is byte-identical. (v) The `.gitignore` block comment (`:53-54`) gains the C-4 Return's third line: `# A tree copied into a work record (repository, tenant, specification, install, build output or prior proof) stays local; the record names its cut by commit hash and its inputs by path and digest.`
- 0b. Stop 2 ruled: a patch laid out by repository path is authored evidence, and `.gitignore:54` already promises it visible. The five directory patterns at `.gitignore:73-77` become their `/**` forms, followed by directory re-includes scoped to the five trees and file re-includes for `*.diff` and `*.patch`:
  ```
  .ai-workspace/**/build_tenants/**
  .ai-workspace/**/specification/**
  .ai-workspace/**/code/src/**
  .ai-workspace/**/test_env/**
  .ai-workspace/**/.ai-workspace/**
  !.ai-workspace/**/build_tenants/**/
  !.ai-workspace/**/specification/**/
  !.ai-workspace/**/code/src/**/
  !.ai-workspace/**/test_env/**/
  !.ai-workspace/**/.ai-workspace/**/
  !.ai-workspace/**/*.diff
  !.ai-workspace/**/*.patch
  ```
  The re-includes are scoped so that no directory excluded by an earlier pattern (`node_modules/`, `packs/`, `installed/`, …) becomes visible. The lint skips `.diff` and `.patch` paths in classification, so the three `patch-layout` roots leave the inventory. Proof, all with `git check-ignore --no-index -v` over `git ls-files -z .ai-workspace` and a synthetic list: the 11 tracked `.diff` files are not ignored; the newly matched set equals C-4's 75,618 minus those 11; the 447 paths ignored by head's rules before C-4 are still ignored; and each of these synthetic paths is still ignored: `<root>/node_modules/x/index.js`, `<root>/build_tenants/a/b/node_modules/y.js`, `<root>/build_tenants/a/b/code/src/x.ts`, `<root>/specification/GOALS.md`, `<root>/test_env/test_runs/x.json`, `<root>/.ai-workspace/work/x.md`, for `<root>` = `.ai-workspace/work/T290_DEBT_WAVE_01/scratch-mirror`; and `<root>/deltas/build_tenants/a/b/code/src/x.diff` is not ignored.
- 0c. Stop 3 ruled: a run record names its sandbox worksite by digest, as any other input; the 27 historical `sandbox-worksite` roots stay inventoried and tracked, and a new one is refused. Finding 2 discharged: `test_env/uat/harness.test.mjs:20` sets the default unit-run root to `test_env/test_runs/sandbox-uat-units/` (under `build_tenants/*/*/test_env/test_runs/`, ignored at `.gitignore:38`); `ABI5_UAT_UNIT_ROOT` stays the override. `test_env/uat/continuation.test.mjs:13` skips with the named reason when the variable is unset if it asserts today. The twelve untracked unit-run directories dated 2026-10-24 under `.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/` are this wave's own harness output (the Phase B close run); delete them (`rm -r` of those twelve directories only, named in the Return; no tracked path is touched) and show `git status --short` lists the two codex strategy posts as the only untracked entries. The 120 tracked historical paths there stay.

**Item 1: the evidence root.** One variable, `ABI5_EVIDENCE_ROOT` (unused at head), names one directory. New `test_env/support/evidence-root.mjs` exports one function, `evidenceInput({ path, sha256, bytes })`, where `path` is relative to the root: when the variable is unset it returns `{ kind: "absent", reason }` with `reason` = `ABI5_EVIDENCE_ROOT unset; requires <path> (sha256:<first 12>)`; when it is set it reads the file, checks the byte count and the digest, and returns `{ kind: "present", path: <absolute>, bytes: <Buffer> }` or throws an error naming the path and the expected and actual digest (the owner chose a root; a wrong root is a failure, not a skip). A lane declares `{ skip: input.kind === "absent" && input.reason }` on each test that needs the input, or skips at file level with the same reason when every test does. No default root; no second variable.

Migrate these sites to it, each input named by path and digest (the digests are the ones the sites assert today where they do):
- `test_env/tests/r10-child-proof.test.mjs:14-19` and `:119` (the D2 store: `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl`, sha256 `4f561cea…`, 19,058,361 bytes; `attempt-01/program-ready-16.json`, `2147862a…`, 12,781,893 bytes; S01 `comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/call-9.jsonl`, 20,426,253 bytes, digest measured); `test_env/tests/r10-retained-child-projection.mjs:7-10`, `:45` (the same two D2 files). The lane's `path.resolve(…, '../../../../../20260911_D2_BOUNDED_REPAIR/…')` displaced paths disappear.
- `test_env/support/d1-preserved-result-harness.mjs:20` (`preimages/source-observation.json`, displaced): find the file by `git ls-files` first, then a bounded `find -name source-observation.json` under `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR` and `.ai-workspace/comments/codex/20260909_D1_LIFECYCLE` only; if found, it becomes a root input with its digest; if not found anywhere, the harness and `test_env/tests/d1-preserved-result-mechanics.test.mjs` state the absent input as the skip reason and the Return says so. `d1-preserved-result-mechanics.test.mjs:34` (absolute path to `20260911_D2_BOUNDED_REPAIR/implementation-04/work`, a predecessor build): a root input (the directory, named by the digest of the one file the test imports from it).
- `test_env/support/d2-bounded-harness.mjs:9,11` (absolute paths to `20260910_D2_FRAME_REPAIR/implementation-01` and `20260909_D1_LIFECYCLE/…/bridge-input.json`); `test_env/support/d2-evidence-owner-harness.mjs:9-10` (displaced `../../implementation-03/work`, `../../installed-continuation-07/installed-frame-01`): root inputs, each by path and digest; the lanes that import these harnesses skip with the reason.
- `test_env/tests/t288-composition-conservation.test.mjs:12` and `test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs:22` assert their variables at file level and are red when unset; they skip with the named reason instead. Their variables name predecessor builds and fixtures; they stay as they are.
- `test_env/support/declared-testing-capability.mjs:18` (`LIVE_TESTING_TRANSPORT.command`, an absolute `claude` version path): the command comes from `ABG_TS_CLAUDE_COMMAND`, the variable the runtime already reads; the lane skips with the reason when it is unset; `model` and `effort` stay.
- `test_env/support/stdo-environment-pilot.mjs:153-156` (absolute paths to three installed STDO releases and `python3`): installs, not evidence; they come from one declared input the lane already requires (a JSON under `ABI5_ENV_INPUT_ROOT` naming the four paths, or the lane's existing variables if it has them), and the lane skips with the reason when it is absent. Name the mechanism you chose.
- `test_env/tests/t288-instruction-assembly-owner.test.mjs` and `test_env/tests/t287-native-semantic-revision.test.mjs`: every retained-material variable they read (`ABI5_NATIVE_D2_DESIGN_DIRECTORY`, `ABI5_NATIVE37_DIRECTORY`, `ABI5_NATIVE38_DIRECTORY`, `ABI5_EVIDENCE_CONTEXT_DIRECTORY`, `ABI5_D07_PREDECESSOR_SCRATCH` if it names retained material) becomes a root input named by path and digest; variables that name an output location (`*_OUTPUT`) or a prompt stay.

Proof: `git grep -n -E '/Users/|/private/var/|/var/folders/' -- test_env/tests test_env/support test_env/uat scripts` after the change lists only fixture data (recorded event payloads and comments), each line named in the Return as data, not a read. Run each migrated lane twice: with the variable unset (every dependent test skips, the reason printed, nothing red that was not red before) and with `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace` (the historical material lives there today, ignored and untracked; the lanes run and reach their branches, `r10-child-proof` among them, which TD-04 + TD-05 stopped for packaging).

The other variables: do not migrate them. The Return holds a census table of every `process.env.*` name read under `test_env/` and `scripts/` (about 300 at head), one row per variable: the lanes reading it and one word for what it names (evidence, predecessor build, install, scratch, command, mode, output). The Executive decides at the Phase C close what, if anything, follows.

**Item 2: the intermediate-profile stores (P8, F1).** `t288-instruction-assembly-owner:499` ("actual derived revision successor shares complete typed assets under the unchanged Design bound") fails at `:516` when its retained directory is supplied: the retained intake's prefix coordinate is stamped `eventContractDigest sha256:4196aaeb…`, which `isKnownRootEventContractDigest` (`abg/event_store.ts:1189-1190`) refuses, admitting only the legacy and current profiles. Do not widen that set. Regenerate: if the retained directory (or the material beside it under the root) holds the scenario's events, the case admits them through the store owner at head into a scratch store (a truthful new coordinate under the current profile) and proceeds from that store; the retained bytes are read only, and the regenerated store is per-run scratch, never written under the root or the repository. If the retained material holds only an envelope embedding the historical coordinate and no events, regeneration needs a native run, which is the owner's; the case is then retired: its body deleted, one comment naming the retained input, its digest and the reason, and the Return states it so the register's DESIGN-REFERENCE-DR01 row can stay U with that reason. Say which outcome and why. Search the tenant for any other site that supplies a store or coordinate stamped `4196aaeb…` to the current reader (`git grep -n 4196aaeb -- test_env`): `t287-native-assessment-evidence.test.mjs:37` stamps its inline rows with it, and `t287-qualification-producer-acquisition-reuse.test.mjs:52` asserts a historical owner's own digest; for each, state whether the current reader refuses it (red at head) and treat a refused one as above.

**Item 3: the TD-05 fixture increments, F2 and F3 first.** The closure rule is TD-05's: genuine positive setup reaches the current owner; a negative mutation fails at the intended boundary; an obsolete body disappears; a current inventory comes from its owner, not a replacement number; a controlled component test is disclosed as such; no retired production API is restored and no authority is weakened to keep a test green.
- F2, `t287-native-semantic-revision:531` ("native Evidence preparation recovery conserves its exact folded producer…"), red at `:588` with "Event Calculus requires a nominal validated immutable event prefix": the harness builds a prefix by hand; it must come from the store owner (`createNewEmptyAppendSink`, `admitRuntimeEvent`, the owner's prefix selection), in `test_env/support/d2-binding-harness.mjs` if that is where the prefix is built. The test's claim is unchanged.
- F3, `t287-undispatched-diagnostic:93` ("undispatched refusal retains entered, routed and resumed cursor ownership…"): the mock `prefixOps` lacks the `cursor-origin:` key family and `runtimeEventBodiesAtPrefix`; prefer the real `abg/event_prefix` owner over a store-built prefix if the claim survives it, else the corrected mock, disclosed as a controlled component test in the test's own output. `:222` ("CCall refusal completion keeps full authority…"): the store the test constructs by hand is constructed by the store owner.
- `m5-consensus-module:385` (five tests refused `invalid_actor_process_observation`): the observation fixture to the current contract, built from the owner's own constructors where they exist; `:1572` (reopen payload variant): the reopen authority body to the shape the owner's close handoff uses today (`event_store.ts:2539` is the TD-04 + TD-05 Return's reference); `:2252` ("S05 generic Public and ABG invocation basis contain no Consensus branch", `ENOENT` on `code/src/public/operations.ts`, deleted in `adaeede02`): the current sources holding the generic Public operations and the ABG invocation basis are the files read, or the body disappears if the claim has no current source; name which.
- `t287-wave2-owner-contract-source-set:611` ("the deeply frozen intrinsic family closes exact schemas and schema-free digests"): Executive ruling: no shared-atom change. `isDeeplyFrozen` already treats a function as a leaf, as `deepFreeze` does; the unfrozen members are the validation library's schema objects inside `requestSchema`. The assertion names the family's schema-free projection (the same projection its digest is computed over) and asserts, separately, that each definition's `requestSchema` is the exact object `constructFamily` installed (identity). `:798` ("D01-D15 strict native requests admit their accepted representative"): the D15 representative request to the one its owner admits today, taken from the owner (a constructor or a contracts file), not written by hand.
- `t287-native-assessment-evidence:548`: read the red, apply the rule, state the fix.
Each case's claim is stated in the Return as unchanged or restated, with the reason.

**Item 4: the two tracked proof files over 6 MB.** `test_env/proof/abi5-root-r10.json` and `abi5-root-r10.transcript.json` stay where they are, listed in the inventory's `oversize` table (item 0a (iii)) with their readers. Moving or deleting them is the owner's decision at the Phase C close, with the inventory. `m5-consensus-module:1550` reads `abi5-root-r10.events.jsonl` (504,306 bytes), which is under the bound.

**Item 5: records (propose; the Executive places them).** (a) The TD-04 and TD-05 register rows: closure text if every increment is discharged, else the remaining increments by site with the reason. (b) The T-290 Rules clause to add to the C-4 bullet: "nothing over 6 MB enters the repository; historical evidence lives under the root `ABI5_EVIDENCE_ROOT` names, by path and digest, and a lane skips with its reason when the root is absent". (c) The TD-19 register state after item 0. (d) Design: check `design/` for any sentence governing how a lane obtains its evidence or the frozen family (`:167`, `:664` name the two atoms); report hits; edit nothing.

**Item 6: lanes and gates.** `npx tsc --noEmit -p tsconfig.json`; `npm run lint:imports`; `npm run lint:lifecycle`; `npm run lint:evidence` with the mirror negative (the C-4 scratch-index probe) and the size negative (`--size-bound 2000000`); `npm run build` rc 0 and `git status --short` afterwards showing no regenerated diff; the `.gitignore` proof of item 0b. Lanes, one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`, before (head) and after, each with `ABI5_EVIDENCE_ROOT` unset and set as item 1 says: `r10-child-proof`, `r10-projection-contracts`, `d1-preserved-result-mechanics`, `t288-composition-conservation`, `t287-qualification-producer-acquisition-reuse`, `t287-declared-testing-capability`, `t287-stdo-run-environment`, `t287-stdo-environment-citation`, `t287-stdo-proof-entry`, `t288-instruction-assembly-owner`, `t287-native-semantic-revision`, `t287-undispatched-diagnostic`, `m5-consensus-module`, `t287-wave2-owner-contract-source-set`, `t287-native-assessment-evidence`, `test_env/uat/harness.test.mjs`, `test_env/uat/continuation.test.mjs`, and every lane that imports a changed support file (name them from `git grep`). Table: lane, item, tests/pass/fail/skipped before and after per variable state, the red identities and first errors, with every change in a red identity named and attributed. `git status --short` at the end: nothing but the two codex posts untracked.

Grant: `.gitignore`; `scripts/check-evidence-mirrors.mjs`; `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json` (regenerated); `test_env/support/evidence-root.mjs` (new); the `test_env/tests/*.mjs`, `test_env/support/*.mjs` and `test_env/uat/*.mjs` files items 0c, 1, 2 and 3 name, plus any support file a named lane needs for its prefix or store construction (name it in the Return); the two files `npm run build` regenerates if `package.json` changes (it should not); this record (append only, your section). No edit under `code/src` (the ruling at item 3 needs none); `abg/event_store.ts:1189` untouched; no design edit; no register edit; no deletion, move or rewrite of a tracked path under `.ai-workspace/` or under `test_env/proof/`; the twelve untracked unit-run directories of item 0c are the only deletion. Scratch under `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c5/`; a scratch index is a copy of `.git/index` used through `GIT_INDEX_FILE`; remove any worktree before the commit. Never walk `.ai-workspace/` on disk beyond item 1's two bounded searches and the named evidence files.

Stop (write it in the Return, keep the rest moving): any change that widens the profile admission set or touches an event contract, a payload key, a failure class or a Product contract; a case whose claim cannot be met without weakening authority or restoring a retired API (retire it instead and say so); a regeneration that needs a live native run (retire per item 2 and say so); a tracked historical path that would need to move or go; a `.gitignore` re-include that would make a previously ignored path visible (keep the C-4 form for that pattern and say so).

Return contract: one commit on `main` with the first line `C-5: the evidence root: one root, one variable, lanes skip with their reason; nothing over 6 MB enters; the intermediate-profile stores regenerated or retired; TD-04 and TD-05 discharged` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`; never push. Append `## C-5 return` at the end of this record with: item 0's three proofs (classification change with the `contracts-tree` roots found, the `.gitignore` proof counts, the harness default and the deletion list); item 1's per-site before and after with each input's path, digest and bytes, the absolute-path grep, and the variable census; item 2's outcome and why; item 3's per-case disposition with the claim stated; item 4's two rows; item 5's proposed sentences; item 6's tables; deviations from this wording; findings outside the grant; stops. Nothing above your section is edited.

## C-5 return

Base `a393c9ca2`. Worker: Opus 5.5 at xhigh. The commit carrying this section is the C-5 commit.

The answer is no, not everything is discharged. The increments the activation lists are discharged: each case was regenerated, restated or retired with its reason. Six things remain:

- `t287-undispatched-diagnostic:233` stays red on a Product defect in `abg/c_call_outcome.ts:1889-1891`, which the grant does not reach.
- With the root set, two lanes cannot load their predecessor builds: the builds kept under the root hold no package closure. This is a stop.
- The d2 lanes reach their branches with the root set, and 34 historical-fixture assertion reds appear there. No register row owns them.
- `t287-native-semantic-revision` keeps 3 reds identical to head. No register row owns them either.
- TD-04 sites remain outside the grant. Item 5(a) lists them.
- In `d1-preserved-result-mechanics`, three cases skip even with the root set. The native store their source observation names lives outside the root.

### Item 0: the C-4 residuals

**0a. The check script and the inventory.**

- **Classification of `contracts/` directories.** A `contracts/` directory under `.ai-workspace/` is classified by content, as ruled: it becomes a mirror root of kind `contracts-tree` only when, at the same index, a tracked path below it names, by its position below that directory, a tracked path below `build_tenants/abiogenesis/typescript/contracts/`.
  - 87 `contracts-tree` roots qualify: 1,934 paths, 114,384,254 bytes. Examples:
    - `20260928_FRAMED_GOVERNANCE/f11-carrier-installed-execution-01/fixture-source` (35 references);
    - the 20 `current-installed-dependency-lock-repair-207/fixtures/*/source` roots;
    - the `*/setup/consumer-source` roots.
  - A `contracts/` directory that names none of them is a run's own output and is not classified.
  - `.gitignore` gains no `contracts/` pattern.
- **References.** References are now searched over every tracked text file of the twelve named extensions, under `.ai-workspace/` and the tenant, in one pass.
  - Roots with zero references: 5 at head, 0 now.
  - The roots Finding 1 named now show their references: `T287_COMMON_COMPUTATIONAL_LIBRARY_DESIGN_01/root-preimages` has 2, and the two `library-runtime-state-233/*-diagnostic-33` roots have 1 each.
  - The inventory itself and `.ai-workspace/work/T290_DEBT_WAVE_01/` are excluded from the search, so neither this record nor the inventory references itself.
- **The 6 MB rule.** A tracked path whose blob exceeds 6,000,000 bytes is refused unless the inventory's `oversize` table lists it, with its bytes and its readers.
  - The table holds 1,739 paths, 40,396,699,215 bytes in all. Two are outside `.ai-workspace/`: the two proof files of item 4. The other 1,737 are historical records under `.ai-workspace/`.
  - The rule reads "anywhere in the repository", so they are listed. See Deviations.
  - At `--size-bound 2000000`, the lint exits 1 with: "683 tracked path(s) exceed the 2000000-byte bound and are not listed under oversize". The named files include:
    - `contracts/schemas/public-operation.schema.json`, 2,867,688 bytes;
    - `product-toolchain-manifest.json`, 3,254,049 bytes;
    - `test_env/proof/abi5-root-r10.outcomes.json`, 4,259,486 bytes.
  - That run writes no object to `.git`.
- **Inventory.** Regenerated with `--write` after (i) to (iii) and 0b, with every grant file staged. The first and second runs gave byte-identical files, sha256 `6b1685f0863ae8f4fcbbb6621ce39fb3a07db01e907a1399359c268f139b3772`.
  - Totals: 691 roots (head 607: 87 `contracts-tree` added, 3 `patch-layout` removed), 80,368 paths, 3,355,594,208 bytes.
  - A third `--write`, run after the last test edits, gave the same digest.
- **Checks.**
  - Plain `npm run lint:evidence`: rc 0, "691 tracked mirror roots under .ai-workspace, all inventoried; no new copy; 1739 listed path(s) over 6000000 bytes, no other".
  - Mirror negative: a scratch index (a copy of `.git/index` used through `GIT_INDEX_FILE`) gets the empty blob at `.ai-workspace/work/T290_DEBT_WAVE_01/scratch-mirror/build_tenants/x.txt`. Result: rc 1, "1 mirror root(s) under .ai-workspace hold tracked paths the inventory does not list, a new copy". The scratch index was then deleted.
- **`.gitignore` comment.** The block comment gains the C-4 Return's third line, verbatim.

**0b. `.gitignore` uses the `/**` forms.**

- The five directory patterns became their `/**` forms, followed by the five scoped directory re-includes and the `*.diff` and `*.patch` file re-includes, exactly as given.
- The lint skips `.diff` and `.patch` paths in classification, so the three `patch-layout` roots left the inventory.
- Proof, using `git check-ignore --no-index -v` over `git ls-files -z .ai-workspace` (127,233 tracked paths) and a synthetic list:
  - The 11 tracked `.diff` files under `result-lineage-typed-contract-realization-01/deltas` are not ignored.
  - The newly matched set is 75,607, which is C-4's 75,618 minus exactly those 11. Nothing is added.
  - The 447 paths that head's rules ignored before C-4 are all still ignored.
  - Each of the six synthetic paths the activation lists is still ignored. `<root>/deltas/build_tenants/a/b/code/src/x.diff` is not ignored.
  - Ten more synthetic paths are still ignored, each by its own later pattern: `node_modules/` under the trees and a `.diff` under `node_modules/`, `installed/`, `scratch/`, `tmp/`, `packs/`, `events.jsonl` and `runtime.events.jsonl`.
- `git status --short` lists no newly visible path.
- Placement: the block sits above the existing exclusions (`node_modules/`, `packs/`, `installed/`, `scratch/`, `tmp/` and the rest), not at the old `:73-77`. A later exclusion overrides an earlier `!…/**/` re-include. At the old position the re-includes would come last and expose, for example, `build_tenants/a/node_modules/`. Placing the block first is the form that exposes nothing.

**0c. The unit-run root.**

- `test_env/uat/harness.test.mjs:20-23`: the default unit-run root is `test_env/test_runs/sandbox-uat-units/`, ignored at `.gitignore:38`. `ABI5_UAT_UNIT_ROOT` stays the override.
- `test_env/uat/continuation.test.mjs:15-17`: every case skips with the named reason, "ABI5_UAT_CONTINUATION_INSTALLED_ROOT, ABI5_UAT_CONTINUATION_NATIVE_ACQUISITION, ABI5_UAT_CONTINUATION_CONSUMER_ACQUISITION, ABI5_UAT_UNIT_ROOT unset; requires the installed root, both retained acquisitions and a unit-run root".
- Deleted with `rm -r`, all untracked, under `.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/`:
  - the twelve directories:
    - `archive-negative/2026-10-24T05-21-02-568Z-c5a280ba-05e6-4e12-887b-02d59c5b043c`;
    - `controlled-basic-cli`, `controlled-js-sdlc-bootstrap`, `controlled-js-tenant-test`, `controlled-parallel-js`, `controlled-report-consumer`, `controlled-rust-cli`, `controlled-rust-service`;
    - `optional-actor-bounds`;
    - `oracle-drift/2026-10-24T05-21-02-595Z-4e346fa5-7029-4a5d-9f3c-0ac64cf988e2`;
    - `oracle-event-prefix`, `supplied-work`;
  - two more, `archive-negative/2026-10-24T14-03-24-034Z-a0edcf11-…` and `oracle-drift/2026-10-24T14-03-24-060Z-480b4582-…`. My own head-baseline run of `uat/harness` wrote them on the old default before the change. See Deviations.
- The 120 tracked paths there are untouched.
- After the change, two harness runs wrote nothing under `.ai-workspace/`. `git status --short` lists the two codex strategy posts as the only untracked entries.

### Item 1: the evidence root

`test_env/support/evidence-root.mjs` exports `evidenceInput({path, sha256, bytes})`, as specified.

- No default root and no second variable.
- When the variable is unset, it returns `{kind: 'absent', reason}` with reason "ABI5_EVIDENCE_ROOT unset; requires <path> (sha256:<first 12>)".
- When the variable is set, it reads the file and checks the bytes and the digest. It returns `{kind: 'present', path, bytes}`, or throws, naming the root, the path, and the expected and actual digest and bytes.
- It writes nothing.
- At head nothing reads `ABI5_EVIDENCE_ROOT` (`git grep -c ABI5_EVIDENCE_ROOT HEAD` over the tenant counts 0), so one head run stands for both head columns of item 6.

Sites, before (head), then inputs under the root (path relative to it, sha256, bytes):

| Site | Head | Inputs | After |
|---|---|---|---|
| `r10-child-proof:14-19`, `:119` | module load `ENOENT` (displaced D2 path) | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl` `f841bba98385cb572a944edf1793634fcf10baf59a74331110042bcb200f8e82` 19,058,361; `…/attempt-01/program-ready-16.json` `2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02` 12,781,893; `comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/call-9.jsonl` `b41e2253b63acb7fd9d2505544272c1ef887c2430d11ec3027d11759a8d32d65` 20,426,253 (measured) | unset: one file-level skip with the reason; set: 10/10. The proof's 846-line prefix (13,540,472 bytes, `4f561cea…`) is asserted on the slice. The store owner reopens a byte copy in per-run scratch and closes it with no append. That truthful coordinate replaces the retained close handoff's device and inode (16777230 to 16777231 drift), which the cuts no longer compare. The S01 prefix is read from the packaged byte copy under its owner's reopen coordinate. Physical identity of the root files is asserted unchanged across the lane. |
| `r10-retained-child-projection.mjs:7-10`, `:45` | `ENOENT` at `:10` (path resolves to `/Users/jim/src/apps/abiogenesis/20260911_D2_BOUNDED_REPAIR/…`, absent) | the same two D2 files | unset: prints `disposition: skipped` with the reason and exits 0; set: `passed`, three summaries over a scratch copy |
| `support/d1-preserved-result-harness.mjs:20` | `ENOENT` `build_tenants/abiogenesis/preimages/source-observation.json` | `git ls-files`: no hit. The bounded `find` under the two named directories found three copies, all `c03f587f…`. The harness names `comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/preserved-result-implementation-01/preimages/source-observation.json` `c03f587f370f8ce9b34a2fc9f0b275493926eac78e21114c3de350c40b6b6c85` 9,988 | test 1 needs only it. Tests 3 to 5 also need the native event store it names, which is `/Users/jim/src/apps/odd_glc/…`, outside the root. With the root set they skip with that reason (see Deviations). |
| `d1-preserved-result-mechanics:34` | not reached | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-04/work/build/code/src/gtl/worksite_construction.js` `bc1891c25cdf…` 23,816 | retired: the claim is false today (item 3) |
| `support/d2-bounded-harness.mjs:9,11` | absolute `/Users/` paths (resolved on this machine) | `comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/live-04/bridge-first-cause-01/bridge-input.json` `6cde4824e5912305cb94de3afdc2eabfd74560e8d8f828cd6be7aa6f64991b16` 983,713. Under `comments/codex/20260910_D2_FRAME_REPAIR/implementation-01/`: `work/build/code/src/product/index.js` `db068a67…` 9,920, `work/build/code/src/gtl/worksite_command_execution.js` `9e0bbd55…` 15,716, `work/build/code/src/product/semantic_stage.js` `46b06546…` 26,525, `source-freeze-01/source/code/src/abg/worksite_revision.ts` and `work/code/src/abg/worksite_revision.ts` `771808d2…` 10,022 | the importing lanes skip with the reason; set: head's identities (item 6) |
| `support/d2-evidence-owner-harness.mjs:9-10` | displaced (`build_tenants/implementation-03/…`, absent) | under `comments/codex/20260911_D2_BOUNDED_REPAIR/`: `installed-continuation-07/installed-frame-01/events-01/runtime.events.jsonl` `25dd49061c90…` 12,040,406; `…/attempt-01/program-ready-16.json` `99cd271bc49d…` 12,781,893; `implementation-03/work/build/code/src/shared/digests.js` `bcfca501…` 838, `…/abg/semantic_stage.js` `b7c408d3…` 27,249, `…/abg/semantic_revision.js` `fe7fe9bf…` 30,666 | skips with the reason; set: item 6 |
| `support/d2-workflow-step-harness.mjs` (a support file the named lanes need) | displaced store path (`ENOENT`) | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-04/installed-frame-01/events-01/runtime.events.jsonl` `42c1bfd29619…` 5,082,898 | the case passes with the root set |
| `d2-workflow-step:118` | `ERR_MODULE_NOT_FOUND` (displaced fixture) | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-04/fixture-preparation/work/test_env/support/d2-continuation-fixture.mjs` `3405f1595000…` 35,798 | set: reached; red inside the retained fixture (item 6) |
| `t288-composition-conservation:12`, `:62` | file-level assert | the variables stay (they name a predecessor build and a scratch history). `:62`'s absolute S01 path is now `comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/call-11.jsonl` `3d4adcf616337360931993fbd10e42090c989ac24060d56318cd21ea9363f845` 9,304 | skips naming the unset variables, or the absent input |
| `t287-qualification-producer-acquisition-reuse:22` | file-level assert | the four variables stay | skips naming the unset variables |
| `support/declared-testing-capability.mjs:18` | absolute command path (`/Users/jim/.local/share/claude/versions/2.1.263`, absent on disk today) | `ABG_TS_CLAUDE_COMMAND`, which the runtime already reads; `model` and `effort` unchanged | the two transport cases skip with "ABG_TS_CLAUDE_COMMAND unset; requires the live claude command". With the variable set the lane is 7/5/0/2, head's five passes. The head red `:174` skips with its reason. Live mode also requires the command. |
| `support/stdo-environment-pilot.mjs:153-156` | absolute install paths | Mechanism: one declared input under `ABI5_ENV_INPUT_ROOT`, `stdo-installs.json`, `{"stdo","representation","axiomIndexer","python3"}`, each an absolute path. `stdoInstallsSkip` and `pilotInputSkip` name the absent variable or file. | the citation, run-environment and installed lanes skip with the reason |
| `t288-instruction-assembly-owner`, `t287-native-semantic-revision` retained-material variables | the cases read `ABI5_NATIVE_D2_DESIGN_DIRECTORY`, `ABI5_NATIVE37_DIRECTORY`, `ABI5_NATIVE38_DIRECTORY`, `ABI5_EVIDENCE_CONTEXT_DIRECTORY` | Every case that read them is retired under item 2, with its input named by path and digest. `ABI5_NATIVE_D2_SELECTOR_PROMPT` names a retained prompt file under the root (the census word is evidence) and stays a variable under the prompt exception. `ABI5_D07_PREDECESSOR_SCRATCH` names retained material (a call and its event log, read only), but no tracked record names its location, so there is no path and digest to declare; it stays a variable (census word: evidence). | the two remaining cases skip as before, without a printed reason (finding 5) |

Custody with the root set:

- Every lane of item 6 ran with a scratch preload in `NODE_OPTIONS` that logs each node `fs` call whose path resolves under `/Users/jim/src/apps/abiogenesis/.ai-workspace`.
- Unset run: no access under it.
- Set run: 920 reads of 388 files and no write call.
- The 388 files:
  - the declared inputs above;
  - 178 and 177 modules of the two predecessor builds that the lanes import;
  - 22 worksite command archives under `installed-continuation-07/installed-frame-01/workspace/archives/`, which the current owner reads because the retained events name them.
- Digest, bytes, device, inode, mtime and ctime of all 388 are identical before and after a second set run, and after two untraced runs. Every ctime is from 2026-09-11, before the runs.
- Limit: writes by processes that are not node are not traced, and the ctime check covers only the 388 files read.

**Absolute-path grep.** `git grep -n -E '/Users/|/private/var/|/var/folders/' -- test_env/tests test_env/support test_env/uat scripts` gives 15 lines:

- **Data, not reads (12):**
  - `t287-native-assessment-evidence:122`, `:140`, `:141`, `:177-181`: recorded event payload fields inside inline rows.
  - `test_env/uat/config.example.json:17`, `:18`, `:25`: example configuration values.
- **Machine-identity assertions in lanes outside the grant (3; finding 2):**
  - `t287-installed-qualification-conservation:32` (`HOME`);
  - `w2-steel-serial-branch-installed:597`;
  - `w2-steel-single-start-installed:547` (`ABG_TS_CLAUDE_COMMAND`).

**Variable census.** These are all `process.env.*` names read under `test_env/` and `scripts/` at this commit: 368 rows.

- 355 are read directly.
- 12 are read indirectly, through a passed environment or a helper:
  - `testingExecutionConfig`: `ABI5_TESTING_ALLOW_LIVE`, `ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS`, `ABI5_TESTING_MODE`, `ABI5_TESTING_NATIVE_BUDGET_MS`;
  - the live worksite lane: `ABG_TS_LIVE_CLAUDE_COMMAND`, `ABI5_T287_C1_LIVE`;
  - supervision: `ABG_TS_FP_TERMINATION_GRACE_MS`;
  - the UAT runner's pass-through: `LANG`, `LC_ALL`, `ANTHROPIC_API_KEY`, `CLAUDE_CONFIG_DIR`, `CLAUDE_CODE_OAUTH_TOKEN`.
- 1 is new: `ABI5_EVIDENCE_ROOT`.

Counts by what each names:

| Names | Count |
|---|---|
| evidence | 199 |
| predecessor build | 66 |
| mode | 43 |
| install | 20 |
| output | 14 |
| scratch | 13 |
| command | 13 |

"Read by" names the lane file without `.test.mjs`, or the support or fixture file that reads the variable.

| Variable | Names | Read by |
|---|---|---|
| `ABG_AX_F09_COUNTER` | mode | `falsifiers/runtime-f09-worker` |
| `ABG_AX_F09_MODE` | mode | `falsifiers/runtime-f09-product`, `falsifiers/runtime-f09-worker` |
| `ABG_C0_POTENTIAL_PROOF` | evidence | `t287-c0-post-publication-failure` |
| `ABG_C0_PROOF_ROOT` | evidence | `t287-c0-correction-regressions`, `t287-c0-post-publication-failure` |
| `ABG_GOVERNANCE_COVERED_BUILD_ROOT` | predecessor build | `t287-governance-covered-source-use`, `t287-native-work-reacquisition` |
| `ABG_GOVERNANCE_COVERED_C2_MATERIAL_SELECTORS` | mode | `t287-governance-covered-source-use` |
| `ABG_GOVERNANCE_COVERED_DECLARATION_PAIR` | evidence | `t287-governance-covered-source-use` |
| `ABG_GOVERNANCE_COVERED_FIXTURE` | evidence | `t287-governance-covered-source-use` |
| `ABG_GOVERNANCE_COVERED_PROOF_ROOT` | evidence | `t287-governance-covered-source-use` |
| `ABG_MULTI_CANDIDATE_BUILD_ROOT` | predecessor build | `support/multi-candidate-admission-owner` |
| `ABG_MULTI_CANDIDATE_DEPENDENCIES_ROOT` | predecessor build | `support/multi-candidate-admission-owner` |
| `ABG_NATIVE_EXECUTION_RETAINED_LOG` | evidence | `t287-native-worksite-execution` |
| `ABG_NATIVE_REACQUISITION_RETAINED_ROOT` | evidence | `t287-native-work-reacquisition` |
| `ABG_OWNER_REUSE_EVIDENCE` | evidence | `t287-native-owner-reuse` |
| `ABG_OWNER_REUSE_PREDECESSOR` | predecessor build | `t287-native-owner-reuse` |
| `ABG_OWNER_REUSE_TASK` | evidence | `t287-native-owner-reuse` |
| `ABG_QUALIFICATION_RELEASE_ROOT` | evidence | `t287-qualification-law` |
| `ABG_QUALIFICATION_RETAIN_TEST_SCRATCH` | mode | `t287-qualification-law` |
| `ABG_QUALIFICATION_SOURCE_ROOT` | predecessor build | `t287-qualification-law` |
| `ABG_QUALIFICATION_STAGE_FIXTURES` | evidence | `t287-qualification-law` |
| `ABG_REACQUISITION_NORMALIZATION_RETAINED_ROOT` | evidence | `t287-native-work-reacquisition-normalization` |
| `ABG_REACQUISITION_ROOT_ACTUAL_REQUEST` | evidence | `t287-reacquisition-root-contract` |
| `ABG_REACQUISITION_ROOT_BASELINE` | predecessor build | `t287-reacquisition-root-contract` |
| `ABG_RESULT_LINEAGE_TYPE_PROOF_DIR` | output | `t287-result-evidence-lineage-type-contract` |
| `ABG_RESULT_LINEAGE_TYPE_TENANT_ROOT` | predecessor build | `t287-result-evidence-lineage-type-contract` |
| `ABG_T287_C2_PROOF_CONFIG` | evidence | `t287-worksite-command-execution` |
| `ABG_T287_HELPER_FACTS` | evidence | `t287-worksite-command-execution` |
| `ABG_T287_HELPER_UNCONFIRMED` | evidence | `t287-worksite-command-execution` |
| `ABG_TS_CLAUDE_APPEND_ARGS` | command | `d2-frame-installed`, `w2-steel-serial-branch-installed`, `w2-steel-single-start-installed` |
| `ABG_TS_CLAUDE_COMMAND` | command | `d2-frame-installed`, `falsifiers/runtime-f09-worker`, `support/declared-testing-capability`, `t287-generic-job-lifecycle`, `t287-generic-job-revision`, `t287-installed-qualification-conservation`, `t287-live-worksite-construction`, `t287-native-workspace-work`, `t287-worksite-branch-construction`, `t287-worksite-command-execution`, `t287-worksite-construction`, `w2-steel-serial-branch-installed`, `w2-steel-single-start-installed` |
| `ABG_TS_FP_ABSOLUTE_TIMEOUT_MS` | mode | `d2-frame-installed`, `t287-installed-qualification-conservation`, `t287-native-semantic-job`, `t287-worksite-command-execution`, `w2-steel-serial-branch-installed`, `w2-steel-single-start-installed` |
| `ABG_TS_FP_TERMINATION_GRACE_MS` | mode | `t287-management-supervision` |
| `ABG_TS_FP_TIMEOUT_MS` | mode | `d2-frame-installed`, `falsifiers/runtime-f09-worker`, `t287-installed-qualification-conservation`, `t287-native-semantic-job`, `t287-worksite-command-execution`, `w2-steel-serial-branch-installed`, `w2-steel-single-start-installed` |
| `ABG_TS_LIVE_CLAUDE_COMMAND` | command | `t287-live-worksite-construction` |
| `ABG_U1_EVIDENCE_DIR` | output | `t287-native-work-currentness-consumers` |
| `ABG_U1_FIRST_CASE` | mode | `t287-native-work-currentness-consumers` |
| `ABG_WORKSITE_BUILD_ROOT` | predecessor build | `support/t287-generic-job-worksite` |
| `ABI207_COMPILED_ROOT` | predecessor build | `t287-installed-dependency-lock` |
| `ABI207_NATIVE_IDENTITY` | evidence | `t287-installed-dependency-lock` |
| `ABI207_PROOF_ROOT` | scratch | `t287-installed-dependency-lock` |
| `ABI232_ISOLATED_MANIFEST` | evidence | `t287-installed-dependency-lock` |
| `ABI232_NATIVE_IDENTITY` | evidence | `t287-installed-dependency-lock` |
| `ABI5_ARTIFACT_DIGEST` | install | `r2-clean-install` |
| `ABI5_ARTIFACT_PATH` | install | `r2-clean-install` |
| `ABI5_ARTIFACT_REF` | install | `r2-clean-install` |
| `ABI5_AUTHENTIC_C2_EVENT` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_C2_EVENT_DIGEST` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_C2_PROVENANCE` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_READ_HISTORY` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_READ_HISTORY_DIGEST` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_XML_BYTES` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_XML_DIGEST` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_XML_OFFSET` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_XML_STORE` | evidence | `uat/harness` |
| `ABI5_AUTHENTIC_XML_WORKSITE` | evidence | `uat/harness` |
| `ABI5_C10_MATERIAL` | evidence | `t287-c2-owner-coordinate-reuse` |
| `ABI5_C2_CARRIER_FIXTURE_PATH` | evidence | `steel-basic-cli-c2` |
| `ABI5_C2_PRODUCT_MODULE` | predecessor build | `steel-basic-cli-c2` |
| `ABI5_CALCULUS_CASES` | mode | `t287-calculus-state-transfer` |
| `ABI5_CAUSATION_EVIDENCE_ROOT` | evidence | `t287-continuation-causation` |
| `ABI5_COLD_RECORD_MATERIAL` | evidence | `t287-cold-record-decoder` |
| `ABI5_COLD_RECORD_PREIMAGE` | evidence | `t287-cold-record-decoder` |
| `ABI5_COMPOSITION_PREDECESSOR` | predecessor build | `t288-blocked-retry-entry`, `t288-composition-conservation` |
| `ABI5_COMPOSITION_SCRATCH` | scratch | `t288-composition-conservation` |
| `ABI5_CONFORMANCE_METADATA` | evidence | `t287-conformance-owner-reuse` |
| `ABI5_CONFORMANCE_PREDECESSOR_ROOT` | predecessor build | `t287-conformance-owner-reuse` |
| `ABI5_CONFORMANCE_PROOF_ROOT` | evidence | `t287-conformance-owner-reuse` |
| `ABI5_CONFORMANCE_SOURCE_ONLY` | mode | `t287-conformance-owner-reuse` |
| `ABI5_CONTEXT_ODD_DECLARATIONS` | evidence | `t287-management-context` |
| `ABI5_CONTEXT_PROOF_ROOT` | output | `t287-management-context` |
| `ABI5_CONTEXT_PUBLIC_PROOF` | evidence | `t287-management-context` |
| `ABI5_CONTEXT_STDO_CONFIGURATION` | evidence | `t287-management-context` |
| `ABI5_CURSOR_BASELINE_PROVENANCE` | predecessor build | `retained-route-cursor-transition` |
| `ABI5_D07_PREDECESSOR_SCRATCH` | evidence | `t288-instruction-assembly-owner` |
| `ABI5_D16_HISTORY` | evidence | `t288-native-producer-membership` |
| `ABI5_D16_PREDECESSOR` | predecessor build | `t288-native-producer-membership` |
| `ABI5_D17_PREDECESSOR` | predecessor build | `t288-environment-context-reuse`, `t288-environment-guard-contraction` |
| `ABI5_D17_SCRATCH` | scratch | `t288-environment-context-reuse`, `t288-environment-guard-contraction` |
| `ABI5_D1_ASSESSOR_DOMAIN_EVIDENCE` | evidence | `t287-d1-semantic-stage` |
| `ABI5_D1_ASSESSOR_PREDECESSOR_ROOT` | predecessor build | `t287-d1-semantic-stage` |
| `ABI5_D1_ATTEMPT` | mode | `t287-d1-requirement-handoff` |
| `ABI5_D1_BUILD_ROOT` | predecessor build | `t287-d1-requirement-handoff`, `t287-d1-semantic-stage` |
| `ABI5_D1_CONTINUATION_ATTEMPT` | mode | `t287-d1-requirement-handoff` |
| `ABI5_D1_CONTINUE` | mode | `t287-d1-requirement-handoff` |
| `ABI5_D1_EVIDENCE_ROOT` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D1_NATIVE_PROJECTION_EVIDENCE` | evidence | `t287-d1-semantic-stage` |
| `ABI5_D1_NEGATIVE_ROOT` | scratch | `t287-d1-requirement-handoff` |
| `ABI5_D1_POSITIVE_PROOF` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D1_PREFLIGHT_ONLY` | mode | `t287-d1-requirement-handoff` |
| `ABI5_D1_RETAINED_EPOCH` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D1_RETAINED_NATIVE_BASIS` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D1_RETAINED_NATIVE_PROOF` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D1_RUN_ROOT` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D1_SOURCE_FIXTURE` | evidence | `t287-d1-requirement-handoff` |
| `ABI5_D2_FRAME_BUILD_ROOT` | predecessor build | `d2-frame-installed` |
| `ABI5_D2_FRAME_RUN` | evidence | `d2-frame-installed` |
| `ABI5_D2_FRAME_RUN_ROOT` | evidence | `d2-frame-installed` |
| `ABI5_DECLARATION_BASELINE_MODULE` | predecessor build | `t287-declaration-closure-symbol-reuse` |
| `ABI5_DECLARATION_PROOF_ROOT` | output | `t287-declaration-closure-symbol-reuse` |
| `ABI5_DEFAULT_LIBRARY_BUILD_ROOT` | predecessor build | `t287-default-library` |
| `ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS` | evidence | `t287-default-library` |
| `ABI5_DEFAULT_LIBRARY_EVIDENCE_ROOT` | evidence | `t287-default-library` |
| `ABI5_DEFAULT_LIBRARY_FROZEN_ARTIFACT` | install | `t287-default-library` |
| `ABI5_DEFAULT_LIBRARY_LIVE` | mode | `t287-default-library` |
| `ABI5_DEFAULT_LIBRARY_SUPPLIED_VALID` | evidence | `t287-default-library` |
| `ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE` | evidence | `t287-default-library` |
| `ABI5_DESIGN_CONTEXT_OBSERVATIONS` | evidence | `t287-stdo-run-environment` |
| `ABI5_DESIGN_CONTEXT_PREDECESSOR` | predecessor build | `t287-stdo-run-environment` |
| `ABI5_EC_OWNER_CLOSED_HISTORY` | evidence | `t287-event-calculus-owner-continuation` |
| `ABI5_EC_OWNER_CLOSED_SHA256` | evidence | `t287-event-calculus-owner-continuation` |
| `ABI5_EC_OWNER_EVIDENCE` | evidence | `t287-event-calculus-owner-continuation` |
| `ABI5_ENV_ATTEMPT` | mode | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_BUILD_ROOT` | predecessor build | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_DEADLINE` | mode | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_EVIDENCE_ROOT` | evidence | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_INPUT_ROOT` | install | `t287-stdo-environment-citation`, `t287-stdo-run-environment`, `t287-stdo-run-environment-installed` |
| `ABI5_ENV_NATIVE_BUDGET_MS` | mode | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_OUTPUT_ROOT` | output | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_PRIOR_EVENTS` | evidence | `t287-stdo-environment-citation` |
| `ABI5_ENV_PROOF_ENTRY_ONLY` | mode | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_PROOF_ROOT` | evidence | `t287-stdo-environment-citation`, `t287-stdo-run-environment` |
| `ABI5_ENV_RESUME_PREPARATION` | evidence | `t287-stdo-run-environment-installed` |
| `ABI5_ENV_RUN_ROOT` | evidence | `t287-stdo-proof-entry`, `t287-stdo-run-environment-installed` |
| `ABI5_ENV_SOURCE_EVIDENCE` | evidence | `t287-stdo-proof-entry`, `t287-stdo-run-environment-installed` |
| `ABI5_ENV_TEST_PACKAGE_ROOT` | predecessor build | `t287-stdo-environment-citation` |
| `ABI5_EVENT_TIME_BASELINE_ROOT` | predecessor build | `t287-native-event-time` |
| `ABI5_EVENT_TIME_HISTORY_PATH` | evidence | `t287-native-event-time` |
| `ABI5_EVENT_TIME_HISTORY_SHA256` | evidence | `t287-native-event-time` |
| `ABI5_EVENT_TIME_PACKAGE_ROOT` | predecessor build | `t287-native-event-time` |
| `ABI5_EVENT_TIME_PAIRED_BASELINE_ROOT` | predecessor build | `t287-native-event-time` |
| `ABI5_EVENT_TIME_PROOF_ROOT` | evidence | `t287-native-event-time` |
| `ABI5_EVIDENCE_ROOT` | evidence | `support/evidence-root` (through it: `d1-preserved-result-mechanics`, `integration-shared-seams`, `integration-d1-readonly-discriminator`, `d2-acknowledgment`, `d2-binding-transition`, `d2-bounded-repair`, `d2-evidence-owner`, `d2-evidence-owner-lookup`, `d2-historical-design`, `d2-workflow-step`, `t287-native-semantic-revision`, `r10-child-proof`, `r10-retained-child-projection`) |
| `ABI5_EXACT_INTENT_EVIDENCE_ROOT` | evidence | `t287-exact-construction-intent` |
| `ABI5_F11_CARRIER_FULL_FIXTURE` | evidence | `t287-qualification-carrier-resource` |
| `ABI5_F11_CARRIER_REPORT` | output | `t287-qualification-carrier-resource` |
| `ABI5_F11_FP_ASSESSMENT_PACKET` | evidence | `t287-qualification-fp-proof-delivery` |
| `ABI5_F11_FP_BASELINE_TENANT` | predecessor build | `t287-qualification-fp-proof-delivery` |
| `ABI5_F11_FP_PROOF_REPORT` | output | `t287-qualification-fp-proof-delivery` |
| `ABI5_F16_PROOF_ROOT` | scratch | `t287-release-acceptance` |
| `ABI5_FH_HOLD_EVIDENCE` | evidence | `t287-fh-hold-open` |
| `ABI5_FRAME_ATTEMPT` | mode | `support/t287-native-frame-observation`, `t287-native-frame-observation` |
| `ABI5_FRAME_BASELINE_ROOT` | predecessor build | `t287-native-frame-observation` |
| `ABI5_FRAME_ENTRY_ROOT` | predecessor build | `support/t287-native-frame-observation`, `t287-native-frame-observation` |
| `ABI5_FRAME_EXECUTION_GRANT` | evidence | `support/t287-native-frame-observation` |
| `ABI5_FRAME_HISTORY_PATH` | evidence | `t287-native-frame-observation`, `t287-native-frame-route-conservation` |
| `ABI5_FRAME_HISTORY_SHA256` | evidence | `t287-native-frame-observation`, `t287-native-frame-route-conservation` |
| `ABI5_FRAME_PACKAGE_ROOT` | predecessor build | `t287-native-frame-observation` |
| `ABI5_FRAME_PROOF_ROOT` | evidence | `t287-native-frame-observation` |
| `ABI5_FULFILLMENT_RECORDS_ROOT` | evidence | `t287-default-library-fulfillment` |
| `ABI5_GENERIC_JOB_BUILD_ROOT` | predecessor build | `t287-generic-job-intake`, `t287-generic-job-lifecycle`, `t287-generic-job-meaning`, `t287-generic-job-parent-audit`, `t287-generic-job-parent-foldback`, `t287-generic-job-read-dependency`, `t287-generic-job-revision`, `t287-native-assembly-retained-input`, `t287-native-semantic-evidence`, `t287-native-semantic-job`, `t287-native-semantic-revision` |
| `ABI5_GENERIC_JOB_COMPLETED_ROOT` | evidence | `t287-generic-job-read-dependency` |
| `ABI5_GENERIC_JOB_CORRECTION_NATIVE` | evidence | `t287-generic-job-revision` |
| `ABI5_GENERIC_JOB_EVIDENCE_ROOT` | evidence | `t287-generic-job-intake` |
| `ABI5_GENERIC_JOB_FAILED_FULL_ROOT` | evidence | `t287-generic-job-meaning` |
| `ABI5_GENERIC_JOB_FAILED_PARENT_ROOT` | evidence | `t287-generic-job-meaning` |
| `ABI5_GENERIC_JOB_FULL_NATIVE` | evidence | `t287-generic-job-lifecycle` |
| `ABI5_GENERIC_JOB_ORIGIN_PREDECESSOR_ROOT` | predecessor build | `t287-generic-job-read-dependency` |
| `ABI5_GENERIC_JOB_PARENT_FOLDBACK_ROOT` | evidence | `t287-generic-job-parent-foldback` |
| `ABI5_GENERIC_JOB_PARENT_GATE_ROOT` | evidence | `t287-generic-job-parent-audit` |
| `ABI5_GENERIC_JOB_RETAINED_PROOF` | evidence | `t287-generic-job-intake` |
| `ABI5_GENERIC_JOB_REVISION_EVIDENCE_PREFIX_ROOT` | evidence | `t287-generic-job-revision` |
| `ABI5_GENERIC_JOB_REVISION_PREFIX_ROOT` | evidence | `t287-generic-job-revision` |
| `ABI5_GTL_CORE_BASELINE` | predecessor build | `t287-gtl-serialization-publication` |
| `ABI5_GTL_CORE_PACKAGE_ROOT` | predecessor build | `t287-gtl-language-corpus`, `t287-gtl-serialization-publication` |
| `ABI5_GTL_GRAPH_BASELINE_CORE` | predecessor build | `t287-gtl-graph-law` |
| `ABI5_GTL_GRAPH_OWNER_CORE` | predecessor build | `t287-gtl-graph-law` |
| `ABI5_HELD_PREFIX_NATIVE_FIXTURE` | evidence | `t287-held-prefix` |
| `ABI5_HISTORICAL_LIVENESS_DIGEST` | evidence | `t287-ordered-reconstruction` |
| `ABI5_HISTORICAL_LIVENESS_LOG` | evidence | `t287-ordered-reconstruction` |
| `ABI5_HISTORICAL_LIVENESS_PREDECESSOR` | predecessor build | `t287-ordered-reconstruction` |
| `ABI5_HISTORICAL_SOURCE_EVIDENCE` | evidence | `t287-historical-source-resource` |
| `ABI5_INSTALLED_CONSERVATION_ARCHIVE` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_ARCHIVE_DIGEST` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_EVIDENCE_ROOT` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_FIXTURE_ROOT` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_HANDOFF` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_INPUT_ROOT` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_MODE` | mode | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_NODE` | command | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_ORIGINAL_ROOT` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT` | predecessor build | `t287-installed-qualification-conservation` |
| `ABI5_INSTALLED_CONSERVATION_ROOT` | evidence | `t287-installed-qualification-conservation` |
| `ABI5_INSTALL_BODY_HISTORY` | evidence | `t289-install-event-bodies` |
| `ABI5_INSTALL_BODY_HISTORY_SHA256` | evidence | `t289-install-event-bodies` |
| `ABI5_INSTALL_BODY_PREDECESSOR_ROOT` | predecessor build | `t289-install-event-bodies` |
| `ABI5_INSTALL_BODY_PROOF_ROOT` | evidence | `t289-install-event-bodies` |
| `ABI5_LIVENESS_CUT_HISTORY` | evidence | `t287-ordered-reconstruction` |
| `ABI5_LIVENESS_CUT_PREDECESSOR` | predecessor build | `t287-ordered-reconstruction` |
| `ABI5_LIVENESS_CUT_SHA256` | evidence | `t287-ordered-reconstruction` |
| `ABI5_LOCK_REUSE_EXPECTED_EVENTS` | evidence | `t289-install-event-bodies` |
| `ABI5_MANIFEST_DIGEST` | install | `r2-clean-install` |
| `ABI5_MEMORY_SEED_PATH` | evidence | `t287-event-body-encoding` |
| `ABI5_NATIVE_BASIS_PREDECESSOR` | predecessor build | `t287-authenticated-owner-values` |
| `ABI5_NATIVE_BASIS_SAMPLE` | evidence | `t287-authenticated-owner-values` |
| `ABI5_NATIVE_D2_SELECTOR_PROMPT` | evidence | `t288-instruction-assembly-owner` |
| `ABI5_NATIVE_EVIDENCE_EXTRACT` | evidence | `t287-native-semantic-evidence` |
| `ABI5_NATIVE_MATERIAL_PREIMAGE` | evidence | `t287-native-c2-instruction-assembly` |
| `ABI5_NATIVE_MATERIAL_SCRATCH` | scratch | `m5-terminal-quiescence-owner` |
| `ABI5_NATIVE_OBSERVATION_CAPTURE` | output | `t287-default-library` |
| `ABI5_NATIVE_RETAINED_JOB` | evidence | `t287-native-assembly-retained-input` |
| `ABI5_NATIVE_SELECTION_EVIDENCE_ROOT` | evidence | `t287-native-registered-selection` |
| `ABI5_NATIVE_SELECTION_LIVE` | mode | `t287-native-registered-selection` |
| `ABI5_NATIVE_SELECTION_PROVIDER` | command | `t287-default-library`, `t287-native-registered-selection`, `t287-recursive-registered-selection` |
| `ABI5_NATIVE_SOURCE_READY_CATALOG` | evidence | `t287-native-worksite-execution` |
| `ABI5_NATIVE_WORK_CHECK_CHILD` | evidence | `t287-native-workspace-work` |
| `ABI5_NATIVE_WORK_OWNER_PROOF_PATH` | evidence | `t287-native-workspace-work` |
| `ABI5_NATIVE_WORK_RETAINED_ROOT` | evidence | `t287-native-workspace-work` |
| `ABI5_OPERATOR_STOP_EVIDENCE` | evidence | `t287-fh-hold-open` |
| `ABI5_ORACLE_SOURCE_OWNER_ROOT` | predecessor build | `uat/harness` |
| `ABI5_OWNED_ADMISSION_PREIMAGE` | evidence | `t287-w2-05-static-binding-algebra` |
| `ABI5_OWNED_JUDGMENT_FIXTURE` | evidence | `t287-held-prefix` |
| `ABI5_OWNED_OUTCOME_PREIMAGE` | evidence | `t287-held-prefix` |
| `ABI5_OWNED_PROCESS_PACKAGE_ROOT` | predecessor build | `t287-owned-process-lifetime` |
| `ABI5_OWNED_PROOF_DECLARATION` | evidence | `t287-native-runtime-gate` |
| `ABI5_OWNED_PROOF_NATIVE_REQUEST` | evidence | `t287-owned-native-proof` |
| `ABI5_OWNER_HISTORY` | evidence | `t287-authenticated-owner-family`, `t288-blocked-retry-entry`, `t288-initial-cursor-entry`, `t288-logical-prefix-digest`, `t288-prefix-structure`, `t288-scoped-retry-guard` |
| `ABI5_OWNER_PREDECESSOR` | predecessor build | `t287-authenticated-owner-family` |
| `ABI5_PACKAGE_NAME` | install | `r2-clean-install` |
| `ABI5_PACKAGE_VERSION` | install | `r2-clean-install` |
| `ABI5_PARENT_ALIAS_BINDINGS` | evidence | `t287-qualification-parent-alias` |
| `ABI5_PARENT_ALIAS_REPORT` | output | `t287-qualification-parent-alias` |
| `ABI5_PHYSICAL_PREDECESSOR` | predecessor build | `t288-physical-return-conservation`, `t288-workflow-scope-conservation` |
| `ABI5_PHYSICAL_SCRATCH` | scratch | `t288-physical-return-conservation`, `t288-workflow-scope-conservation` |
| `ABI5_PLANNING_PROJECTION_CAPTURE` | output | `t287-default-library` |
| `ABI5_PREDECESSOR_OLD_PACKAGE_ROOT` | predecessor build | `t287-predecessor-context` |
| `ABI5_PREDECESSOR_PACKAGE_ROOT` | predecessor build | `support/t287-predecessor-context` |
| `ABI5_PREDECESSOR_PRIOR_ROOT` | predecessor build | `support/t287-predecessor-context` |
| `ABI5_PREDECESSOR_PROOF_ROOT` | predecessor build | `t287-predecessor-context` |
| `ABI5_PREFIX_EVENT_PATH` | evidence | `t287-exact-prefix-projection-reuse` |
| `ABI5_PREFIX_EXPECTED_SHA256` | evidence | `t287-exact-prefix-projection-reuse` |
| `ABI5_PREFIX_PACKAGE_ROOT` | predecessor build | `t287-exact-prefix-projection-reuse` |
| `ABI5_PREFIX_PREDECESSOR_ROOT` | predecessor build | `t288-prefix-structure` |
| `ABI5_PREFIX_PROOF_ROOT` | evidence | `t287-exact-prefix-projection-reuse` |
| `ABI5_PREFIX_REUSE_BASELINE_ROOT` | predecessor build | `m5-event-calculus-runtime`, `t287-native-frame-observation` |
| `ABI5_PREFIX_REUSE_CUTS` | evidence | `m5-event-calculus-runtime`, `t287-native-frame-observation` |
| `ABI5_PREFIX_REUSE_OBSERVATIONS` | evidence | `m5-event-calculus-runtime`, `t287-native-frame-observation`, `t287-ordered-reconstruction`, `t287-reconstruction-conservation` |
| `ABI5_PREPARATION_RESOLVE_CALL` | evidence | `t287-w2-05-static-binding-algebra` |
| `ABI5_PRODUCER_CONTEXT_FIXTURE` | evidence | `t287-qualification-producer-acquisition-reuse` |
| `ABI5_PRODUCER_HISTORY_FIXTURE` | evidence | `t287-qualification-producer-acquisition-reuse` |
| `ABI5_PRODUCER_OWNER_FIXTURE` | evidence | `t287-qualification-producer-acquisition-reuse` |
| `ABI5_PRODUCER_OWNER_SOURCE_FIXTURE` | evidence | `t287-qualification-producer-acquisition-reuse` |
| `ABI5_PRODUCT_CONTENT_DIGEST` | install | `r2-clean-install` |
| `ABI5_PRODUCT_ID` | install | `r2-clean-install` |
| `ABI5_PUBLIC_GROUPS_BASELINE` | predecessor build | `t287-public-groups` |
| `ABI5_PUBLIC_GROUPS_PACKAGE_ROOT` | predecessor build | `t287-public-groups` |
| `ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT` | predecessor build | `t287-public-preparation` |
| `ABI5_QUAL_RAW_BASELINE_TENANT` | predecessor build | `t287-qualification-raw-contract-preimage` |
| `ABI5_QUAL_RAW_BODY` | evidence | `t287-qualification-raw-contract-preimage` |
| `ABI5_QUAL_RAW_COORDINATES` | evidence | `t287-qualification-raw-contract-preimage` |
| `ABI5_QUAL_RAW_INPUT_PACKET` | evidence | `t287-qualification-raw-contract-preimage` |
| `ABI5_QUAL_RAW_REPORT` | output | `t287-qualification-raw-contract-preimage` |
| `ABI5_QUAL_RAW_REQUEST` | evidence | `t287-qualification-raw-contract-preimage` |
| `ABI5_RECURSIVE_SELECTION_EVIDENCE_ROOT` | evidence | `t287-recursive-registered-selection` |
| `ABI5_RECURSIVE_SELECTION_LIVE` | mode | `t287-recursive-registered-selection` |
| `ABI5_RELEASE_PROOF_ROOT` | scratch | `t287-release-publication` |
| `ABI5_RELEASE_RETAINED_INSTALL_COORDINATE` | install | `t287-release-publication` |
| `ABI5_REPLAY_PREIMAGE` | evidence | `retained-route-cursor-transition` |
| `ABI5_RESULT_LINEAGE_BASELINE` | predecessor build | `t287-result-evidence-lineage-projection` |
| `ABI5_RESULT_LINEAGE_REPORT` | output | `t287-result-evidence-lineage-projection` |
| `ABI5_RETAINED_CONSUMER_CONFIG` | evidence | `t287-retained-installed-consumer` |
| `ABI5_RETAINED_CONSUMER_PHASE` | mode | `t287-retained-installed-consumer` |
| `ABI5_RETAINED_MATERIAL` | evidence | `retained-route-cursor-transition` |
| `ABI5_ROUTE_BASELINE_ROOT` | predecessor build | `support/t287-native-frame-route-conservation`, `t287-native-frame-route-conservation` |
| `ABI5_ROUTE_PROJECTION_SCRATCH` | scratch | `t287-route-reconstruction` |
| `ABI5_ROUTE_PROOF_ROOT` | evidence | `t287-native-frame-route-conservation` |
| `ABI5_ROUTE_REPLAY_PREIMAGE` | evidence | `t287-route-reconstruction` |
| `ABI5_S02_PROJECTION_FIXTURE` | evidence | `t287-public-terminal-projection` |
| `ABI5_S02_RECURSION_FIXTURE` | evidence | `t287-deferred-application-restoration` |
| `ABI5_S02_RETRY_FIXTURE` | evidence | `t287-retry-run-prefix` |
| `ABI5_S03_EVIDENCE_ROOT` | evidence | `t287-s03-automatic` |
| `ABI5_S03_PHASE_B_RELEASE` | evidence | `t287-s03-automatic` |
| `ABI5_SELECTED_ACTION_EVIDENCE_ROOT` | evidence | `support/t287-selected-action-host`, `t287-selected-action` |
| `ABI5_SELECTED_ACTION_FROZEN_FIXTURE_ENV` | evidence | `support/t287-selected-action-host` |
| `ABI5_SELECTED_ACTION_OBSERVER_PREFLIGHT` | mode | `t287-selected-action` |
| `ABI5_SELECTED_ACTION_OWNER_SUBJECT` | evidence | `t287-selected-action-authority` |
| `ABI5_SELECTED_ACTION_PREFLIGHT` | mode | `t287-selected-action` |
| `ABI5_SELECTED_ACTION_PUBLIC_START` | evidence | `support/t287-selected-action-host` |
| `ABI5_SELECTED_ACTION_RECOVER_FROM` | mode | `t287-selected-action` |
| `ABI5_SELECTED_ACTION_RESUME_FROM` | mode | `t287-selected-action` |
| `ABI5_SELECTED_ACTION_RESUME_PREFLIGHT` | mode | `t287-selected-action` |
| `ABI5_SELECTED_ACTION_SOURCE_BOUND` | mode | `t287-selected-action-authority` |
| `ABI5_SELECTED_CLOSURE_EVIDENCE` | evidence | `t287-selected-execution-closure` |
| `ABI5_SELECTED_CLOSURE_HISTORY_FIXTURE` | evidence | `t287-selected-execution-closure` |
| `ABI5_SELECTED_CLOSURE_INSTALLED_ROOT` | install | `t287-selected-execution-closure` |
| `ABI5_SELECTED_CLOSURE_PREIMAGE` | evidence | `t287-selected-execution-closure` |
| `ABI5_SELECTION_EVIDENCE_ROOT` | evidence | `t287-registered-graph-selection` |
| `ABI5_SELECTION_REPEAT_ONLY` | mode | `t287-registered-graph-selection` |
| `ABI5_SNAPSHOT_PREDECESSOR` | predecessor build | `t287-ordered-reconstruction` |
| `ABI5_STAGE_MODE` | mode | `t287-stdo-run-environment-installed` |
| `ABI5_STAGE_SETUP_ATTEMPT` | mode | `t287-stdo-run-environment-installed` |
| `ABI5_STATIC_CLOSURE_BASELINE_MODULE` | predecessor build | `t287-static-declaration-closure` |
| `ABI5_STATIC_CLOSURE_CAPTURED_INPUT` | evidence | `t287-static-declaration-closure` |
| `ABI5_STATIC_CLOSURE_OWNER_ROOT` | predecessor build | `t287-static-declaration-closure` |
| `ABI5_STDO3_SOURCE_ROOT` | predecessor build | `t287-native-registered-selection`, `t287-recursive-registered-selection` |
| `ABI5_STEEL02_AUTHORITY_CALL_PATH` | evidence | `steel-consumer-authority` |
| `ABI5_STEEL02_AUTHORITY_INSTALL_HOST` | install | `steel-consumer-authority` |
| `ABI5_STEEL02_EVIDENCE_PATH` | evidence | `steel-consumer-declaration` |
| `ABI5_STEEL02_RESOLVER_PROOF_PATH` | evidence | `m5-c-algebra-validation` |
| `ABI5_STEEL03_C0_WITNESS_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_CLOSURE_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_CONTINUATION_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_EVIDENCE_PATH` | evidence | `w2-steel-single-start-installed` |
| `ABI5_STEEL03_FANOUT_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_OUTPUT_PROOF_PATH` | output | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_OWNER_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RESOURCE_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_C0_ROOT` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_C2_ROOT` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_CALL_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_CONTINUATION_ROOT` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_FANOUT_ROOT` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_LEAF_ROOT` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_PREFLIGHT_PATH` | mode | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RETAINED_START_CALL_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL03_RUN_LIVE` | mode | `w2-steel-single-start-installed` |
| `ABI5_STEEL03_RUN_ROOT` | evidence | `w2-steel-single-start-installed` |
| `ABI5_STEEL03_SOURCE_REPLAY_PROOF_PATH` | evidence | `w2-steel-single-start-closure` |
| `ABI5_STEEL04_EVIDENCE_PATH` | evidence | `w2-steel-serial-branch-installed` |
| `ABI5_STEEL04_RUN_LIVE` | mode | `w2-steel-serial-branch-installed` |
| `ABI5_STEEL04_RUN_ROOT` | evidence | `w2-steel-serial-branch-installed` |
| `ABI5_STEEL04_SUCCESS_ROOT` | evidence | `w2-steel-serial-branch-installed` |
| `ABI5_STEEL_C1_ATTEMPT_PATH` | evidence | `steel-basic-cli-projection` |
| `ABI5_STEEL_C2_ATTEMPT_PATH` | evidence | `steel-basic-cli-source-replay` |
| `ABI5_STEEL_PROJECTION_EVIDENCE_PATH` | evidence | `steel-basic-cli-projection` |
| `ABI5_STEEL_PUBLIC_EVIDENCE_PATH` | evidence | `steel-basic-cli-public` |
| `ABI5_STEEL_READER_INSTALL_ROOT` | install | `steel-basic-cli-projection` |
| `ABI5_STEEL_REPLAY_CANDIDATE_SOURCE` | predecessor build | `steel-basic-cli-source-replay` |
| `ABI5_STEEL_REPLAY_EVIDENCE_PATH` | evidence | `steel-basic-cli-source-replay` |
| `ABI5_STEEL_REPLAY_READER_ROOT` | predecessor build | `steel-basic-cli-source-replay` |
| `ABI5_STEEL_SOURCE_REPLAY_STATE` | evidence | `steel-basic-cli-source-replay` |
| `ABI5_T287_C1_LIVE` | mode | `t287-live-worksite-construction` |
| `ABI5_TESTING_ALLOW_LIVE` | mode | `support/declared-testing-capability` |
| `ABI5_TESTING_BUILD_ROOT` | predecessor build | `t287-declared-testing-capability` |
| `ABI5_TESTING_DEADLINE` | mode | `t287-declared-testing-capability` |
| `ABI5_TESTING_INPUT_ROOT` | install | `t287-declared-testing-capability` |
| `ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS` | mode | `support/declared-testing-capability` |
| `ABI5_TESTING_MODE` | mode | `support/declared-testing-capability` |
| `ABI5_TESTING_NATIVE_BUDGET_MS` | mode | `support/declared-testing-capability` |
| `ABI5_UAT_CONTINUATION_CONSUMER_ACQUISITION` | evidence | `uat/continuation` |
| `ABI5_UAT_CONTINUATION_INSTALLED_ROOT` | install | `uat/continuation` |
| `ABI5_UAT_CONTINUATION_LOCK_DIGEST` | evidence | `uat/continuation` |
| `ABI5_UAT_CONTINUATION_LOCK_REF` | evidence | `uat/continuation` |
| `ABI5_UAT_CONTINUATION_NATIVE_ACQUISITION` | evidence | `uat/continuation` |
| `ABI5_UAT_UNIT_ROOT` | evidence | `uat/continuation`, `uat/harness` |
| `ABI5_WAVE1_FROZEN_ARTIFACT_PATH` | install | `hello-product-boundary`, `steel-consumer-declaration`, `support/root-cli-environment`, `support/root-installed-environment`, `t287-d1-requirement-handoff`, `t287-recursive-registered-selection`, `t287-stdo-run-environment-installed`, `w2-steel-serial-branch-installed`, `w2-steel-single-start-installed` |
| `ABI5_WAVE1_FROZEN_ARTIFACT_SHA256` | install | `steel-consumer-declaration`, `support/root-cli-environment`, `support/root-installed-environment`, `t287-stdo-environment-citation`, `w2-steel-serial-branch-installed`, `w2-steel-single-start-installed` |
| `ABI5_WAVE1_FROZEN_INSTALL_HOST` | install | `d2-frame-installed`, `support/root-cli-environment`, `support/root-installed-environment`, `t287-d1-requirement-handoff`, `t287-stdo-proof-entry` |
| `ABI5_WITNESS_TEST_ROOT` | scratch | `support/witness-reprice-mechanics` |
| `ANTHROPIC_API_KEY` | command | `uat/runner` |
| `CLAUDE_CODE_OAUTH_TOKEN` | command | `uat/runner` |
| `CLAUDE_CONFIG_DIR` | command | `uat/runner` |
| `FIXTURE_TOOL_USES_JSON` | evidence | `m5-worker-transport` |
| `HOME` | command | `t287-installed-qualification-conservation` |
| `LANG` | command | `uat/runner` |
| `LC_ALL` | command | `uat/runner` |
| `NODE_OPTIONS` | command | `t287-installed-qualification-conservation`, `t287-worksite-command-execution` |
| `P0_ENVIRONMENT_FINAL_ROOT` | evidence | `t287-environment-projection-conservation` |
| `P0_ENVIRONMENT_NATIVE_SCRATCH` | scratch | `t287-environment-projection-conservation` |
| `P0_ENVIRONMENT_PREDECESSOR_ROOT` | predecessor build | `t287-environment-projection-conservation` |
| `P0_PREDECESSOR_INSTALLED_ROOT` | install | `t287-route-reconstruction` |
| `P0_RETAINED_NATIVE_SCRATCH` | scratch | `t287-route-reconstruction` |
| `P0_SAVED_OUTPUTS` | output | `t287-ordered-reconstruction` |
| `PATH` | command | `t287-native-semantic-evidence`, `t287-qual056-material`, `uat/harness` |
| `T287_STREAM_HELD_EVENT_LOG` | evidence | `t287-management-stream-drain` |
| `T287_STREAM_RETAINED_EVENT_LOG` | evidence | `t287-management-stream-drain` |
| `T287_SUPERVISION_MODE` | mode | `test_env/fixtures/t287-management-supervision/process-worker.mjs`, `test_env/fixtures/t287-management-supervision/semantic-worker.mjs` |
| `TMPDIR` | scratch | `support/installed-qualification-conservation`, `support/t287-s03-automatic`, `t287-selected-action`, `t287-worksite-command-execution` |
| `W2_STEEL_RETAINED_EVENT_PATH` | evidence | `w2-steel-single-start` |

### Item 2: the intermediate-profile stores (P8, F1)

**`t288-instruction-assembly-owner`: retired, with four sibling cases.** Five cases are retired:

- `:499` "actual derived revision successor shares complete typed assets under the unchanged Design bound";
- "semantic result matcher follows the exact native compact Design materialization and preserves other roles";
- "assessment-first actual successor preserves typed retained terms and full pending candidate under the unchanged bound";
- the two "native42" context cases.

Each retained input carries a native revision intake whose durable prefix coordinate is stamped `sha256:4196aaeb…`:

- `design-input.json` `49b8be73c463…`, 1,545,750 bytes;
- `intake-terminal-request.json` `3494d102d333…`, 296,449 bytes;
- `87788-c_call_result_admitted.jsonl` `359b374ef0f0…`, 1,513,991 bytes;
- `native42-selector-component-fixture.json` `1bd71a0947d9…`, 13,904,702 bytes;
- `native42-selected-events.json` `733701942d27…`, 6,413,207 bytes.

The coordinates name prefixes of 104,482,827 to 531,792,783 bytes of an `odd_glc` native store outside the root, and no retained record holds those events. So no case can be regenerated from retained events, and a truthful current-profile coordinate needs a new native run, which is the owner's. Each body is deleted, with one comment naming the inputs, digests and reason (`:476-508`). The admission set at `abg/event_store.ts:1189` is unchanged. The register's DESIGN-REFERENCE-DR01 row can stay U with this reason.

**`git grep -n 4196aaeb -- test_env`, the other sites:**

- `t287-native-semantic-revision`:
  - the assessor-successor branch inside `:485` over the same `87788-…` input is retired (comment `:490-500`);
  - the case "native D2 retained empty-obligation selector composes with all fifteen unchanged obligations" is retired (`:545-556`): `design-input.json` and `forensic-diagnostic-events.json` `367666219f2f…`, a coordinate over a 104,482,827-byte `odd_glc` prefix. Same reason.
- `t287-native-assessment-evidence:37`: its inline rows are stamped `4196aaeb…` and were refused by the current reader at head (red `:551`, `:559`, `:585`). They are regenerated, as recorded under item 3.
- `t287-qualification-producer-acquisition-reuse:58` (head `:52`): it asserts the `ROOT_EVENT_CONTRACT_DIGEST` of the historical owner module it loads from `ownerPins.ownerRoot`, not anything the current reader admits. The current reader never sees it. Not refused; the lane skips with its unset variables.

### Item 3: the TD-05 fixture increments

The closure rule held throughout: the setup comes from the owner, negatives fail at their boundary, obsolete bodies are deleted, and controlled component tests say so. No retired API was restored and no authority was weakened.

**F2, `t287-native-semantic-revision:531`: retired.**

- Its prefix is the component's hand-built event list.
- The store owner cannot build it. The binding cover it joins needs `workspace-bind` artifact events, which only the Public owner's ingress admits. The other rows are lookup premises without complete envelopes, so admitting them would fabricate native history.
- Over the event-prefix owner's selection of the component's immutable snapshot, the case gets past the former refusal. It then needs every premise completed into an envelope.
- A corrected mock prefix would keep the case only under the weaker authority it was meant to leave.
- Its input, the D1 `bridge-input.json`, stays a root input of the other cases (comment `:528-543`).

**F3, `t287-undispatched-diagnostic:96` (head `:93`): restated, now green.**

- The mock `prefixOps` is replaced by the real `abg/event_prefix` owner (`selectValidatedRuntimeEventPrefix` over owner-complete rows) and the real cursor owner.
- Physical append custody and native frame liveness sampling are substituted. The case prints "controlled component test: physical append custody and native frame liveness sampling substituted" in its own output.
- Restated claim: entered, routed and resumed cursor ownership holds at raw and cold boundaries over the owner's prefix.
- Two negatives now fail at the earlier boundary, the prefix owner, with `assert.throws`:
  - cross-Run route: "cannot cross a run causation boundary";
  - dangling cause: "unknown causal predecessor".
- The ordinal-6 negative is now "route admitted after the open". The duplicate negative is now "a second route admitted before the open". Under the real owner each original form is refused before the predicate.
- A probe confirmed that each negative differs from the positive in exactly one fact.

**F3, `t287-undispatched-diagnostic:233` (head `:222`): the claim is unchanged; red on a Product defect (stop 1).**

- Warm and cold stores are now built by the store owner: `createNewEmptyAppendSink`, `admitRuntimeEvent` with complete payloads, and for the cold store `projectReopenAuthorityAndClose` then `reopenEventStore`. Each is opened in the system temporary directory and removed.
- Native frame liveness is the one substitution, printed as a controlled component test.
- The head red was "event store was not constructed by this ABG module". The red now is `completePublicOutcome` refusing with "runtime event-prefix selection requires a total, gap-free admission-ordinal order".
- Cause: `abg/c_call_outcome.ts:1889-1891` passes `runtimeEventBodiesAtPrefix(copy.runtimePrefix).materialize()` to `selectValidatedRuntimeEventPrefix`. For a Run-scoped owned prefix of a multi-Run store, the materialized ordinals are sparse (`[1,3,4,6,7,8]` here).
- Probe: passing the view instead of `.materialize()` admits. The owned path, `admitOwnedCCallRejection`, passes every assertion of the case.

**`m5-consensus-module:385` (five cases): claims unchanged.**

- No exported observation constructor exists: the owner builds the observation inline at `abg/actor_process.ts:1133`.
- The fixture is completed to `ACTOR_PROCESS_OBSERVATION_FIELDS` (`:225`) by adding `toolInvocations: []` beside each `toolCallCount: 0`.
- All five are green.

**`m5-consensus-module:1546` "S05 ABG binds each durable Run to its exact admitted invocation": retired.**

- The activation's diagnosis, a reopen-authority shape, does not hold. Naming either profile in the authority still fails, because the history itself matches neither contract:
  - `test_env/proof/abi5-root-r10.events.jsonl` holds 504,306 bytes in 20 unstamped rows;
  - rows 1-2 carry `definitionKey`, and rows 3-4 carry `hogEntryCoordinate` and `hogEntryStep`;
  - the contracts admit `memberKey`, `gtlEntryCoordinate` and `gtlEntryTerm`.
- The tracked file stays as it is.
- The claim returns only over a root Run that the installed root admits and closes in per-run scratch. That is the regeneration option. `m5-event-calculus-runtime`'s installed closure path fails today with `abg.openCall is not a function`.

**`m5-consensus-module:2151` (head `:2251`) "S05 generic Public and ABG invocation basis contain no Consensus branch": restated over the current sources.**

- The files read are:
  - every `.ts` under `code/src/public/`;
  - `product/run_invocation_operation.ts`;
  - `abg/execution_basis.ts`;
  - the generic CCall result admission in `abg/c_call_outcome.ts`, sliced from `const result = payloadRejection ?? admitResult(`.
- These replace `public/operations.ts` (deleted in `adaeede02`) and `hog/leaf_admission.ts` (deleted in `f162e5531`). The message names the new reach.

**`t287-wave2-owner-contract-source-set:611`: restated per the ruling.**

- The test asserts:
  - the family, its definitions array and each definition are frozen;
  - the schema-free projection (the preimage its digests are computed over) is deeply frozen;
  - for each slot, the binding is frozen and its identity is deeply frozen;
  - `binding.schema` is the exact object of the owner declaration's `<slot>Schema`, an identity check (all 178 are);
  - each schema and its entries are frozen.
- No shared atom changed.

**`t287-wave2-owner-contract-source-set:798`: the D15 representative is built by the owner.**

- `constructQualificationIdentity` (`validator/qualification_contracts.js`) builds it over the request schema `RELEASE_OPERATION_CONTRACTS.snapshot.published_rc` (`qualificationBasis`, `lawBasis`, `verdict`, `requestedIdentity`), with the identity in `RELEASE_IDENTITY_SCHEMA` form.
- The claim is unchanged. The lane is 15/15.

**`t287-native-assessment-evidence:548`: regenerated; claim unchanged.**

- The red was "profile schedule requires the original gap-free stamped history": rows stamped `4196aaeb…` without ordinals.
- The retained rows are admitted in order through the store owner into a per-run scratch store under the current profile. References among them are rebound to the admitted identities, and the cases read the admitted events. The lane is 4/4.

**Byte or source conservation claims against superseded cuts: retired (stop 4).**

- `d1-preserved-result-mechanics` "C0/C1/C3 algorithms, closed identities and old publication rows are conserved": all nine current sources differ from the preimages, and six publication members differ.
- `d2-acknowledgment:81` "legacy schema, task and predicates remain exact; generic native owners and helper are byte-exact": six of seven generic owners differ from the `pre-ack-01` freeze.
- `d2-historical-design:89` "the correction stays on the shared preparation path and preserves prior mechanisms byte-exact": `semantic_revision.ts` differs from the `implementation-04` preimage outside the corrected span.
- `d2-evidence-owner:27` "08 source delta is only the two candidate guards and revision immutable-prefix allocation": `semantic_stage.ts` differs beyond the 08 delta.

Each comment names the inputs by path and digest.

### Item 4: the two tracked proof files over 6 MB

| Path | Bytes | Readers (inventory `oversize`) |
|---|---|---|
| `build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.json` | 18,642,450 | 605 tracked files, all under `.ai-workspace/` (596 under `comments/codex/`, 9 under `evidence/`); no tenant file reads it |
| `build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.transcript.json` | 9,801,195 | 605 tracked files, same areas, a different list; no tenant file reads it |

The Executive's census holds: no reader outside `.ai-workspace/` and `test_env/proof/`. A sampled reader names the file, for example `f11-bound-packet.json` naming `repo://…/test_env/proof/abi5-root-r10.json`. Both files stay where they are.

No lane reads `abi5-root-r10.events.jsonl` (504,306 bytes) any more: its one `m5` case is retired, and only that comment names it.

### Item 5: records (proposals; the Executive places them)

**(a) Register rows.**

TD-05 proposed text:

> R10 increment at `bf117cf92`. C-5 increment:
> - F2 retired (store-owner construction would fabricate native history);
> - F3 `undispatched:96` restated over the event-prefix owner;
> - `:233` stores built by the store owner;
> - `m5:385` (5) completed to the owner's field set;
> - `m5:1546` retired (history matches neither contract);
> - `m5:2151` restated over current sources;
> - wave2 `:611` and `:798` restated;
> - `native-assessment:548` regenerated through the store owner;
> - four conservation claims against superseded cuts retired.
>
> Remaining:
> 1. `t287-undispatched-diagnostic:233`, red on the Product defect in the new row below.
> 2. The d2 lanes reached with the root set hold 34 historical-fixture assertion reds that no row owns:
>    - `d2-acknowledgment` 3;
>    - `d2-binding-transition` 10;
>    - `d2-bounded-repair` `:56`, `:77`, `:103`;
>    - `d2-historical-design` 3;
>    - `d2-workflow-step` 8;
>    - `d2-evidence-owner-lookup` 7.
>
>    Head shows the same identities wherever its absolute paths resolved. `d2-workflow-step:123` and the lookup reds are new only because the inputs now resolve.
> 3. `t287-native-semantic-revision:118`, `:266`, `:328`: identical to head, unowned.

New row proposed:

> CCall Public outcome reselects a materialized Run-scoped prefix. `completePublicOutcome` (`abg/c_call_outcome.ts:1889-1891`) calls `selectValidatedRuntimeEventPrefix(runtimeEventBodiesAtPrefix(copy.runtimePrefix).materialize())`. For a Run-scoped prefix of a multi-Run store the ordinals are sparse, and the selector refuses. Probe: the view admits; the owned path passes. Red: `t287-undispatched-diagnostic:233`. Change class: `realization_refactor` under `code/src/abg`.

TD-04 proposed text:

> Discharged:
> - the R10 pair and S01;
> - `d1-preserved-result-harness:20` and `d1-preserved-result-mechanics:34`;
> - `d2-bounded-harness:9,11`, `d2-evidence-owner-harness:9-10`, `d2-workflow-step-harness`;
> - `t288-composition-conservation:12`, `:62`; `t287-qualification-producer-acquisition-reuse:22`;
> - `declared-testing-capability:18`; `stdo-environment-pilot:153-156`.
>
> Remaining, by site:
> 1. `support/d2-historical-owner-harness.mjs:6`, `:11`, `:63`: displaced `build_tenants/abiogenesis/evidence/d2-program-ready.json` and `installed-continuation-09/…`, read at module load by `d2-historical-owner` and `integration-shared-seams`. Also `integration-shared-seams:63` and `integration-d1-readonly-discriminator:7-8`, the `origins.json` layout of a former integration directory.
> 2. Relative `.ai-workspace/` evidence reads:
>    - `t287-common-computational-library:223`;
>    - `t287-cross-cut-public-read:20`;
>    - `t287-default-library-fulfillment:16` (the default of `ABI5_FULFILLMENT_RECORDS_ROOT`);
>    - `t287-default-library:24`;
>    - `t287-fh-hold-open:13`, `:14`, `:143`;
>    - `t287-historical-source-resource:38`;
>    - `t287-selected-action-authority:13` (a default);
>    - `t287-selected-action:187`.
> 3. Machine-identity assertions: `t287-installed-qualification-conservation:32`, `w2-steel-serial-branch-installed:597`, `w2-steel-single-start-installed:547`.
> 4. Predecessor builds under the root without their package closure: `d2-bounded-repair:10`, `:66`, `d2-evidence-owner:5`. The owner decides: keep the closure beside each retained build under the root, or retire.
> 5. `w2-steel-*-installed`: these already skip with named reasons. Their variables are in the C-5 census and stay, per the activation.

**(b) T-290 Rules clause, added to the C-4 bullet:**

> nothing over 6 MB enters the repository; historical evidence lives under the root `ABI5_EVIDENCE_ROOT` names, by path and digest, and a lane skips with its reason when the root is absent

**(c) TD-19:**

> S done. The stop is mechanical: the lint refuses a tracked mirror root the inventory does not list, and any tracked path over 6,000,000 bytes that its `oversize` table does not list. `contracts/` directories are classified by content. Authored patches are visible. 691 roots are inventoried, none with zero references. A work record names its cut by commit hash and its inputs by path and digest (`.gitignore` comment).
>
> L open: historical deletion after a retention and deletion manifest. `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json` (roots, paths, bytes, references, and 1,739 oversize paths with readers) is its input.

**(d) `design/` check: hits only; nothing edited.**

- No sentence governs how a lane obtains its evidence. Searched for "evidence root", `ABI5_EVIDENCE_ROOT`, `test_env/proof`, lane, skip and retained-evidence wording.
  - The hits name retained records as historical evidence: `A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md:17`, `M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md:63`, `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md:27`, `M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md:570`.
  - Or they are proof-lane tables that state assertions, not acquisition: `M03_ABG_FN_COMPOSITION_DERIVATION.md:258` and its siblings.
- Frozen family:
  - `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:167` lists `deepFreeze` and `isDeeplyFrozen` as existing atoms.
  - `:664` lists them as `catalog_reuse` (immutable carrier construction, `N01`, `N02`, `N04`).
  - `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:162-167`: "Each definition is one frozen runtime value … Family construction … then freezes the definition."
  - The restated `:611` asserts exactly that. No design sentence requires validation-library schema objects to be deeply frozen.

### Item 6: gates and lanes

| Gate | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | rc 0 |
| `npm run lint:imports` | rc 0, "28 modules under code/src/shared/ import only code/src/shared/ and packages" |
| `npm run lint:lifecycle` | rc 0, "284 modules under code/src; 7 allow-listed site(s), no offender" |
| `npm run lint:evidence` | rc 0; mirror negative rc 1; size negative rc 1 (item 0a) |
| `npm run build` with every grant file staged | rc 0; `git status --short` afterwards shows no regenerated diff |
| `.gitignore` proof | item 0b |

**How the lanes ran.**

- Each lane ran on its own with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 --test-reporter=tap`.
- Head ran once. At head nothing reads the variable, so the one run is both of head's states.
- After-change runs:
  - unset, with `ABI5_EVIDENCE_ROOT` removed from the environment;
  - set, with `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace`;
  - each state once untraced, which is the table below, and once traced, which is the custody record under item 1. Counts were identical.
- Lanes:
  - those the activation names;
  - every file `git grep` finds importing a changed support file, directly or through `d2-binding-harness` and `d2-historical-design-harness`;
  - `integration-d1-readonly-discriminator`, which `git grep` names because it reads the donor's copy of the d1 harness as text.
- Counts are tests/pass/fail/skipped.

| Lane | Item | Head | Unset | Set | Red identities and changes |
|---|---|---|---|---|---|
| `uat/continuation` | 0c | 4/0/0/4 | 4/0/0/4 | 4/0/0/4 | none. The skips now print the four variable names. |
| `uat/harness` | 0c | 34/30/1/3 | 34/30/1/3 | 34/30/1/3 | `:473` (head `:471`, a 2-line shift from the default-root comment): same, expected 18015000, actual 18025250. |
| `r10-child-proof` | 1 | 1/0/1/0 | 1/0/0/1 | 10/10/0/0 | Head file-level `ENOENT` is gone. |
| `r10-retained-child-projection.mjs` | 1 | `ENOENT` `:10` (not run; the head path resolves to an absent directory) | 1/1/0/0 (prints skipped) | 1/1/0/0 (prints passed) | Gone. |
| `r10-projection-contracts` | loader | 10/10/0/0 | 10/10/0/0 | 10/10/0/0 | none |
| `d1-preserved-result-mechanics` | 1 | 1/0/1/0 | 5/1/0/4 | 5/2/0/3 | Head file-level `ENOENT` is gone. One case is retired (6 to 5). Three cases skip with the root set: their store is outside the root. |
| `integration-shared-seams` | d1 importer | 1/0/1/0 | 1/0/1/0 | 1/0/1/0 | Changed: head `ENOENT` `build_tenants/abiogenesis/preimages/source-observation.json` (d1 harness), now `ENOENT` `build_tenants/abiogenesis/evidence/d2-program-ready.json` at `d2-historical-owner-harness.mjs:11`. The d1 harness no longer reads at load, so the next displaced read surfaces in an unchanged file outside the grant (finding 1). |
| `integration-d1-readonly-discriminator.mjs` | grep | not run (file unchanged) | 1/0/1/0 | 1/0/1/0 | `ENOENT` `build_tenants/abiogenesis/origins.json` at `:8`, before any harness read; independent of this package. |
| `t288-composition-conservation` | 1 | 1/0/1/0 | 1/0/0/1 | 1/0/0/1 | Head assert `:12` is gone; skips naming the two variables. |
| `t287-qualification-producer-acquisition-reuse` | 1, 2 | 1/0/1/0 | 1/0/0/1 | 1/0/0/1 | Head assert `:22` is gone; skips naming the four variables. |
| `t287-declared-testing-capability` | 1 | 7/5/1/1 | 7/3/0/4 | 7/3/0/4 | Head `:174` assert is now a skip with its reason. Cases 2 and 3 skip on `ABG_TS_CLAUDE_COMMAND`; with it set the lane is 7/5/0/2. |
| `t287-stdo-run-environment` | 1 | 2/0/1/1 | 2/0/0/2 | 2/0/0/2 | Head `:87` assert is now a skip naming `ABI5_ENV_PROOF_ROOT` and `stdo-installs.json`. |
| `t287-stdo-environment-citation` | 1 | 2/0/1/1 | 2/0/0/2 | 2/0/0/2 | Head `:16` assert is now a skip with its reason. |
| `t287-stdo-proof-entry` | pilot importer | 5/0/0/5 | 5/0/0/5 | 5/0/0/5 | none (unchanged file; boolean skips) |
| `t287-stdo-run-environment-installed.mjs` | 1 | 1/0/0/1 | 1/0/0/1 | 1/0/0/1 | none |
| `t288-instruction-assembly-owner` | 1, 2 | 11/4/0/7 | 6/4/0/2 | 6/4/0/2 | Five cases retired (item 2). |
| `t287-native-semantic-revision` | 2, 3 | 9/4/4/1 | 7/4/1/2 | 7/4/3/0 | `:118` (head `:122`, shift): same in both states, expected `native_revision_cause_absent`, actual `native_revision_intake_basis_mismatch`. `:266`, `:328` (head `:270`, `:332`): skip unset, and with the root set the same as head ("expected `native_revision_binding_cover_absent`", "exact ancestry gets as far as the new cover"). F2 `:531` and `:545` retired. |
| `t287-undispatched-diagnostic` | 3 | 7/5/2/0 | 7/6/1/0 | 7/6/1/0 | `:93` is green. `:233` changed: head "event store was not constructed by this ABG module", now "runtime event-prefix selection requires a total, gap-free admission-ordinal order" (stop 1). |
| `m5-consensus-module` | 3 | 18/11/7/0 | 17/17/0/0 | 17/17/0/0 | All seven head reds are gone (five completed, one restated, one retired). |
| `t287-wave2-owner-contract-source-set` | 3 | 15/13/2/0 | 15/15/0/0 | 15/15/0/0 | Both head reds are gone. |
| `t287-native-assessment-evidence` | 2, 3 | 4/1/3/0 | 4/4/0/0 | 4/4/0/0 | All three head reds are gone. |
| `d2-acknowledgment` | 1 | 4/0/4/0 | 3/0/0/3 | 3/0/3/0 | `:14`, `:31`, `:48` = head `:17`, `:34`, `:51`, same falsy asserts; `:81` retired. |
| `d2-binding-transition` | 1 | 10/0/10/0 | 10/0/0/10 | 10/0/10/0 | Set: all ten = head (+1 line), same first errors. |
| `d2-bounded-repair` | 1 | 12/7/5/0 | 12/1/0/11 | 12/7/5/0 | Set = head: `:10` (`jsonc-parser`) and `:66` (`valibot`) not found from the root's predecessor build (stop 2); `:56`, `:77`, `:103` asserts. |
| `d2-historical-design` | 1 | 14/10/4/0 | 13/0/0/13 | 13/10/3/0 | `:6`, `:25`, `:33` = head `:8`, `:27`, `:35`; `:89` retired. |
| `d2-workflow-step` | 1 | 9/0/9/0 | 9/0/0/9 | 9/1/8/0 | Head `:9` `ENOENT` now passes. `:23` to `:109` = head `:22` to `:108`, same. `:123` changed: head `ERR_MODULE_NOT_FOUND` (displaced fixture), now "fn is not a function" inside the retained `d2-continuation-fixture.mjs:60` against the current build. |
| `d2-evidence-owner-lookup` | 1 | 9/0/9/0 | 9/0/0/9 | 9/2/7/0 | Changed: head 9 `ENOENT` (displaced store). With the root set, 2 pass (initial collector: ambiguity and refusals) and 7 fail on falsy asserts. The current collector does not project the retained store under the lane's lookup assumptions. |
| `d2-evidence-owner` | 1 | 2/0/2/0 | 1/0/0/1 | 1/0/1/0 | Changed: head `ERR_MODULE_NOT_FOUND` `build_tenants/implementation-03/…/digests.js`, now `valibot` not found from the root's `implementation-03/work/build` (stop 2). `:27` retired. |

`git status --short` at the end shows nothing tracked modified and only the two codex strategy posts untracked.

### Deviations from the activation's wording

1. **The `oversize` table lists 1,739 paths, not two.** The rule covers every tracked blob over 6,000,000 bytes "anywhere in the repository", and 1,737 such historical records lie under `.ai-workspace/`. Listing only the two proof files would make the lint fail at head.
2. **The D2 store input is named by the whole file.** The activation's `4f561cea…` is the digest of the proof's first 846 lines, 13,540,472 bytes. The input is named by the whole file, `f841bba9…`, 19,058,361 bytes, and the lane asserts the prefix digest on the slice.
3. **The `.gitignore` block sits above the existing exclusions**, not at `:73-77`. At the old place, the directory re-includes would override the earlier exclusions and expose ignored paths (item 0b).
4. **Fourteen unit-run directories were deleted, not twelve.** The two extra, dated 2026-10-24T14-03Z, were written by my own head-baseline run of `uat/harness` on the old default before the change.
5. **`d2-workflow-step-harness.mjs` and `d2-workflow-step:118`** were migrated as support files the named lanes need. The activation did not name them.
6. **`t287-declared-testing-capability` cases 2 and 3** now skip when `ABG_TS_CLAUDE_COMMAND` is unset. With it set they pass as at head.
7. **`d1-preserved-result-mechanics` with the root set**: three cases skip, because the native store they need is outside the root (`odd_glc`). They do not reach their branches.
8. **The `m5:1572` diagnosis does not hold.** The reopen authority was never the cause, and the case is retired (item 3).
9. **Restated rather than unchanged:** F3 `:96`'s negatives (item 3), and `r10-child-proof`'s historical cuts, which use a truthful store coordinate in place of the retained device and inode.

### Findings outside the grant

1. `d2-historical-owner-harness.mjs` (unchanged) holds displaced paths at `:6`, `:11` and `:63`. Since the d1 harness migration it is the first failure of `integration-shared-seams`. It also blocks `d2-historical-owner`. A TD-04 site, item 5(a).
2. Three machine-identity assertions and nine relative `.ai-workspace/` evidence reads in lanes outside the grant. Item 5(a).
3. The predecessor builds under the root have no `node_modules`; `.ai-workspace/**/node_modules/` keeps them local. Stop 2.
4. A pre-existing worktree, `scratchpad/wt-base-97b1200bc` at `97b1200bc`, was created 2026-10-22, before C-5. It is left in place: the grant's only deletion is item 0c's. C-5 created no worktree.
5. Boolean skips without a printed reason remain for variables that are not migrated: `t288-instruction-assembly-owner:17`, `:389`; `uat/harness:99`, `:128`, `:165`; `t287-stdo-proof-entry` ×5. The census is the base for the Executive's Phase C close decision.

### Stops

1. **Product defect.** `abg/c_call_outcome.ts:1889-1891` keeps `t287-undispatched-diagnostic:233` red, and no edit under `code/src` is granted. New row proposed (item 5(a)).
2. **Predecessor package closure.** Three cases cannot load their predecessor build from the root: `d2-bounded-repair:10`, `:66` and `d2-evidence-owner:5` (`jsonc-parser`, `valibot`). Resolving the packages from the tenant would run "exact predecessor code" against other package versions, which weakens the claim. No resolver hook was added. The owner's decision: keep each build's closure under the root, or retire.
3. **Regenerations that need a live native run, retired (item 2):**
   - `t288-instruction-assembly-owner`: five cases;
   - `t287-native-semantic-revision`: the `:485` retained branch and the `:545` case.
4. **Claims that cannot be met without weakening, retired (item 3):**
   - F2;
   - `m5:1546`;
   - the four conservation claims against superseded cuts.
5. **Did not arise:** no tracked historical path needed to move, and no re-include exposes a previously ignored path. The admission set, event contracts, payload keys, failure classes and Product contracts are untouched.

## C-5 disposition (Executive, 2026-10-25)

Accepted at `afcb3be58`. Executive check on that head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 7 allow-listed, no offender; `lint:evidence` 691 roots inventoried, no new copy, 1,739 listed paths over 6,000,000 bytes and no other; its mirror negative (a `scratch-mirror/build_tenants/x.txt` staged in a scratch index) rc 1 naming the root and its size negative (`--size-bound 2000000`) rc 1 naming 683 unlisted paths; a further `--write` byte-identical (`6b1685f0…`); `.gitignore`: 76,054 tracked paths under `.ai-workspace/` ignored (447 + 75,607), 0 of 205 tracked `.diff` ignored, the nine synthetic paths each matched by the expected line; `npm run build` rc 0 and no regenerated diff; the helper's absent reason, present read (19,058,361 bytes) and wrong-digest throw probed; 25 lanes run unset and set, every count and red identity as the Return's table (`r10-child-proof` 10/10, `m5-consensus-module` 17/17, `t287-wave2-owner-contract-source-set` 15/15, `t287-native-assessment-evidence` 4/4 with the root set; `t287-undispatched-diagnostic:233` red on the prefix re-selection; the d2 lanes' 34 reds and the two missing-package reds with the root set); `r10-retained-child-projection.mjs` skipped then passed, rc 0; no file written under the four named evidence directories; the absolute-path grep 15 lines (12 data, 3 machine-identity assertions outside the grant); the untracked set the two codex posts (`exec_check_C5.log`). The commit carries thirty-five files: `.gitignore`, the lint, the inventory, the new helper `test_env/support/evidence-root.mjs`, thirty test, support and UAT files (the sites items 0c, 1, 2 and 3 name; the d2 lanes that import the migrated harnesses; `d2-workflow-step` and its harness; the STDO pilot's three importers) and this record. No file under `code/src`; no tracked path deleted, moved or rewritten; the only deletions are fourteen untracked unit-run directories, the twelve named and the Worker's own two.

The Return's first sentence stands: the commit's first line says TD-04 and TD-05 are discharged, and they are not. Every increment the activation listed is regenerated, restated or retired with its reason, and six things remain. The package is accepted as what it did; the remainder is placed below.

Item 0 accepted. `contracts/` is classified by content (87 `contracts-tree` roots, 1,934 paths); references are searched over all tracked text (zero-reference roots 5 to 0); the 6 MB rule is mechanical, with `oversize` listing 1,739 paths (deviation 1 accepted: the rule as written covers the repository, and the 1,737 historical records over 6,000,000 bytes under `.ai-workspace/`, 40,396,699,215 bytes in all, are now a named list for the owner's retention decision); the inventory holds 691 roots, byte-identical on three writes (`6b1685f0…`); the `/**` forms with their re-includes sit above the existing exclusions (deviation 3 accepted: at `:73-77` the re-includes would have exposed `node_modules/` under the copied trees; the Executive's placement was wrong and the Worker's is the form that exposes nothing); the eleven `.diff` files are visible and 75,607 equals 75,618 minus 11; the harness default root is `test_env/test_runs/sandbox-uat-units/` and `continuation` skips naming its four variables.

Item 1 accepted. The helper is as specified; every named site reads its input by path, sha256 and bytes (deviation 2 accepted: the whole-file digest `f841bba9…` names the D2 store and the lane asserts the 846-line prefix digest on the slice); custody with the root set is traced (920 calls over 388 files, no write; the 388 unchanged in digest, bytes, inode, mtime and ctime); the absolute-path grep lists twelve data lines and three machine-identity assertions outside the grant; the census holds 368 variables (evidence 199, predecessor build 66, mode 43, install 20, output 14, scratch 13, command 13) and is held for the Phase C close. Deviations 5 and 6 accepted (`d2-workflow-step` and its harness are support the named lanes need; the two transport cases skip on `ABG_TS_CLAUDE_COMMAND` and pass with it set).

Item 2 accepted. Seven cases are retired with their inputs named by path, digest and bytes (five in `t288-instruction-assembly-owner`, the `:485` branch and the `:545` case in `t287-native-semantic-revision`): each retained coordinate names a prefix of an `odd_glc` native store outside the root and no retained record holds the events, so regeneration needs a native run, which is the owner's; the admission set at `abg/event_store.ts:1189` is unchanged; DESIGN-REFERENCE-DR01 stays U with that reason. `t287-native-assessment-evidence` is regenerated through the store owner (4/4). `producer-acquisition-reuse:58` asserts the historical owner's own constant and is not refused.

Item 3 accepted per case. F2 retired: the store owner cannot build its prefix without fabricating native history (the binding cover needs `workspace-bind` events only the Public ingress admits), and a corrected mock would keep the case under the authority it was meant to leave. F3 `:96` restated over the real event-prefix owner and the cursor owner, green, disclosed in its output, its negatives failing one boundary earlier under the real owner. `:233` built by the store owner, claim unchanged, red on a defect (stop 1). `m5:385` five cases completed to `ACTOR_PROCESS_OBSERVATION_FIELDS`. `m5:1546` retired (deviation 8 accepted: the activation's reopen-authority diagnosis was wrong; the tracked history matches neither contract and stays as it is). `m5:2151` restated over the current sources. wave2 `:611` and `:798` per the ruling, 15/15. `native-assessment:548` regenerated. Four byte-conservation claims against superseded cuts retired (stop 4 accepted: a conservation claim against a cut is a claim about that cut).

Item 4: both proof files stay, listed under `oversize` with 605 readers each, none under the tenant; the owner's decision at the close. Item 5: the rows are placed below in this commit; the Rules clause is added; no design sentence governs how a lane obtains its evidence, and the restated `:611` asserts what `M05_S06…:162-167` asks. Item 6: the gates are green and the twenty-eight lanes are tabled with every red identity attributed.

Stops ruled.
1. `completePublicOutcome` (`abg/c_call_outcome.ts:1889-1891`) re-selects a materialized Run-scoped prefix of a multi-Run store, whose store-wide ordinals are sparse, and the selector refuses; the owned path admits. A defect of realization: no class, key, event or Product contract changes. Carried into C-6 as item 0 (the fix at the re-selection; the Public outcome stays materialized and the selector's rule stays; a change to either is a stop). Reversal: leave `:233` red with this record. No register row: a defect found in a Return is discharged by the next package, as C-3's and C-4's were.
2. The predecessor builds under the root have no package closure (`d2-bounded-repair:10`, `:66`, `d2-evidence-owner:5`). Ruled: no closure is provisioned under the root. The root holds evidence read by path and digest; a runnable predecessor is an install, and an install beside a work record is what TD-19 stops. A case that needs predecessor code running makes a claim about that cut, not about the Product at head; under TD-05's rule it is retired, unless its claim is about the current Product, in which case it is restated over the current build. Carried into C-15. Reversal: `npm ci` beside each retained build under the root, declared in the lane as an input.
3 and 4: retirements accepted as above.

The remainder: one package, C-15, appended last in Phase C before the close run, "TD-04 and TD-05 closed: the remaining sites and the unowned reds". (a) TD-04: `d2-historical-owner-harness.mjs:6`, `:11`, `:63`, `integration-shared-seams:63` and `integration-d1-readonly-discriminator:7-8` (displaced paths); the relative `.ai-workspace/` reads whose targets are ignored material migrate to the root (`t287-fh-hold-open:13-14`: `fh-hold-repair-01` 0 of 23 files tracked, `s02-installed-continuation-17` 0 of 273; `t287-cross-cut-public-read:20` and `t287-historical-source-resource:38`: the D2 `installed-frame-01` store), and those whose targets are tracked records stay (`default-library-witness`, 13 of 13; the others checked file by file); the three machine-identity assertions; the ten reasonless skips; stop 2's three cases. (b) TD-05: the 34 historical-fixture reds the d2 lanes reach with the root set (`d2-acknowledgment` 3, `d2-binding-transition` 10, `d2-bounded-repair` 3, `d2-historical-design` 3, `d2-workflow-step` 8, `d2-evidence-owner-lookup` 7) and `t287-native-semantic-revision:118`, `:266`, `:328`: each is a defect at head and repaired (with its own stop if it reaches a contract), a fixture regenerated through its owner, or a claim about a superseded cut and retired. Why a package: a red lane in the suite is debt, and each red is a candidate defect until it is classified; "residuals spawn a package only when they are defects" is met by the classification itself, which is the package. Why last: the registered rows run first in the agreed order, and C-15 closes TD-04 and TD-05 before the broad run. Reversal: strike C-15; the reds stay in the close's reported red set.

Findings: 1, 2 and 5 are C-15's; 3 is stop 2; 4 is the Executive's worktree from 2026-10-22, pruned at the Phase C close. The Worker's two disclosed rule-breaks are accepted: the head-baseline harness run wrote two directories under `.ai-workspace/` because head's default pointed there, and the deletion was of its own untracked output.

Register: TD-04 and TD-05 "Open (C-5 increment closed at `afcb3be58`; the remainder is C-15)"; TD-19 "S done; L is the owner's"; DESIGN-REFERENCE-DR01, NATIVE-EVIDENCE-RECOVERY-01, GJ-D2-UNDISPATCHED-CURSOR-REPORTING and CALLER-EVIDENCE-VOLUME-01 updated; the Completion record row. Ticket: the Rules clause; C-15 in the order.

## C-6 activation (Executive, 2026-10-25; TD-18's trace: every held-return resumption fact is an event in the log or a definition input; a fact that is neither is a defect; none found means closed)

Base: the C-5 bookkeeping commit on `main`. Worker: one fresh Opus 5.5 at xhigh. Paths are relative to the repository root unless they start with `scripts/`, `test_env/`, `code/`, `design/` or `build/`, which are under `build_tenants/abiogenesis/typescript/`. No walk of `.ai-workspace/` on disk; the record is this file and the register.

The owner's ruling (T-290 `## Phase C`, row TD-18, agreed 2026-10-24): "the recovery trace; a resumption fact that is not an event in the log is a defect and is repaired; none found means closed". The law is the design's §9.1 (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:530-551`): a fact is admitted once as an event; derived state is a fold of the log and "is never recomputed from copied payload fields and never read from a second store"; Product permits an internal handoff to use established state and forbids caller memory as authority ("replay, not caller memory, derives the result, next execution state, and explanation of workspace change", A5-F10). The open instance is §9.4 (`:581-583`): the held suspensions "carry `parentGraph`, `parentClosureContract`, `parentCCall`, `parentGraphInput`, `parentInput` and `childInput` as in-memory copies across a hold, and `rehydrateParentReturnFrames` rebuilds the return frames from those copies. Under §9.1, holding established state in memory across an internal handoff is permitted, and rebuilding derived state from copies instead of the fold is not. Which of the two a return frame is depends on whether the hold crosses a recovery boundary and whether `application` and `sourceCursor` are recoverable from events. Neither is yet traced." The register's TD-18 body names the evidence (`hog/traversal_completion.ts:29`, `hog/parent_rehydration.ts:109`, `:178`, `:326`, `hog/graph_execute.ts:1015`), the closure ("nested workflow/recursion warm and cold paths preserve inputs, completed work, remaining obligations and failure cuts; redundant state can be deleted without reconstructing a second runtime") and the boundary ("retained state is not debt merely because it is state-shaped").

**Item 0: the C-5 residual, the Public outcome's prefix re-selection (`abg/c_call_outcome.ts:1884-1893`).** `completePublicOutcome` re-selects the owned prefix with `selectValidatedRuntimeEventPrefix(runtimeEventBodiesAtPrefix(copy.runtimePrefix).materialize())`. For a Run-scoped owned prefix of a store holding more than one Run, the materialized array carries the store-wide admission ordinals (the C-5 probe saw `[1,3,4,6,7,8]`), and the selector refuses with "runtime event-prefix selection requires a total, gap-free admission-ordinal order" (`abg/event_prefix.ts:552`, `:614`); passing the view admits (the owner-bound prefix comes back through `BODY_VIEW_PREFIXES`, `:467-470`). Two constraints hold: the Public outcome stays an explicitly materialized validated prefix, never an owner-bound one (the comment at `:1882-1883`: "the ordinary owner never retains this returned history in its private computation territory"); the selector's gap-free rule is the prefix owner's authority and is not touched. The fix is at the re-selection: select over the complete admitted history at the prefix's cut with the prefix's own scope (the two-argument form, `selectValidatedRuntimeEventPrefix(events, scope)`, or the owner's `selectRuntimeEventPrefixFromAuthority`), and show the materialized result is the same prefix as the owned one (selection, length, digest, profile). Reach: trace every production constructor of an owned outcome whose `runtimePrefix` can be Run-scoped over a multi-Run store (the `completePublicOutcome` callers at `:1894` onward and the owned admissions that feed them) and say whether a production path reaches the refusal today or only the lane's construction does. Proof: `t287-undispatched-diagnostic:233` green with its claim unchanged, the lane 7/7; every other lane that reaches `completePublicOutcome` unchanged (name them from `git grep`). Stop if the fix needs the selector's rule or the outcome's shape to change. Change class: `realization_refactor` under `code/src/abg`.

**Item 1: the trace.** The subject is the held-return path: a child traversal holds (`disposition === "held"`), the parent's return frame is retained as a `HeldWorkflowSuspension` or `HeldRecursionSuspension` (`hog/traversal_completion.ts:29-75`), and the Run resumes after the store has closed and reopened. Four producers: `hog/workflow_lifecycle.ts:540-566`, `hog/recursion_lifecycle.ts:801-828`, `hog/evaluation_frame.ts:130-175` (`projectParentSuspensions` over the return frames), `hog/entry.ts:504-521` (the construction resume, built from the store's prepared source, not from memory). Consumers: `hog/parent_rehydration.ts:326-452` (`rehydrateParentReturnFrames`: execution bases and scopes by ref at the prefix, the parent owner by projection, child lineage and digests checked, then `exactParentTraversal` at `:98` revalidating the graph from the copy against the basis's `graphValidationRef`, `graphRef` and `graphDigest`, `rehydrateHeldInteractionCursor` at `hog/traversal.ts:138`, `rehydrateWorkflowCCallAtPrefix` at `abg/c_call.ts:4308`, and the outward projection required equal to the input at `:440-447`); `hog/graph_execute.ts:1015-1040` (`preflightParentReturns`), `:1324` (`"constructionResume" in input`) and `:1331` (`"interactionResume" in input`); the hog port `ResumeHeldInteractionInput.parentSuspensions` (`hog/traversal_contract.ts:84-101`); `public/continuation_authority.ts:33-55` (`PublicContinuationAuthority.parentSuspensions`, digest-sealed and admitted as I-JSON on return).

Facts the Executive read from greps, to verify first (each is a claim about callers, not about behaviour): (i) the run owner's three hog entries (`owner_bindings/run_invocation.ts:1600`, `:1858`, `:1931`) pass neither `parentSuspensions` nor `interactionResume`; `:1858`'s `continued` is `prepareConstructionContinuationTraversal`'s result, whose one suspension is the `entry.ts:504` value built from the store; (ii) no file under `code/src` constructs an input with `interactionResume`; `test_env/falsifiers/runtime-f09-worker.mjs` and `test_env/tests/t287-route-reconstruction.test.mjs` do; (iii) `constructPublicContinuationAuthority` and `updatePublicContinuationAuthority` have no caller under `code/src`; the type is exported from `public/index.ts` and named in `design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md`, `design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` and the R10 proofs; (iv) `prepareFhInteractionResume` and `rehydrateFhContinuationAtPrefix` are exported from `abg/index.ts` and have no caller under `code/src` outside `abg/continuation.ts` and hog's commit at `graph_execute.ts:1189`.

The trace has three parts.

(a) **Where the suspensions go between hold and resume, in production.** From the held completion (`projectHeldTraversalCompletion`, `hog/traversal_completion.ts:231`) through the run owner's `finish` (`owner_bindings/run_invocation.ts`) to the Public output and the continuation handed to the caller: does any Public carrier or any event carry `parentSuspensions`, or are they dropped at the hold and rebuilt on resume? Then the live F_H resume: which Public operation resumes a held Run today (`abg.operation.run.continue` and its packets; `prepareFhInteractionResume` or another), which hog port it enters, and where that port's parent frames come from. If no production path reaches `graph_execute.ts:1331` with `parentSuspensions`, the port's input is dead in production and reached only by the lane and the falsifier: say so.

(b) **The field table.** One row per field of `HeldWorkflowSuspension` and of `HeldRecursionSuspension` (`parentExecutionBasisRef`, `parentTraversalScope`, `parentGraph`, `parentClosureContract`, `parentCCall` or `evaluatorCCall`, `evaluatorResult`, `evaluatorJudgment`, `application`, `sourceCursor`, `parentGraphInput` and its digest, `parentInput` or `evaluatorInput` and its digest, `childExecutionBasisRef`, `childTraversalScopeRef`, `childInput` and its digest, `terminalMode`), for each resume ingress that is live or lane-reached. Columns: the source at resume, one of (E) an event in `L` (the event kind, the payload key, the projection that reads it at the prefix); (D) a definition input (the publication, program, graph or contract by ref and digest, resolved through the leaf port or the install); (W) warm, re-derived on resume from E and D (the function); (C) caller memory, carried across the recovery boundary and used, not merely checked, to build the resumed state; (M) missing: in neither `L` nor D and needed. Then the disposition: E, D and W are lawful. C is a copy: if the field is fully re-derivable from E and D at the prefix, the copy is redundant derived state; the repair derives it from the fold and treats the carried value as a claim to check, or drops it (a `realization_refactor` under `hog/`, done in this package if it changes no Public key). M is a resumption fact not in the log: a defect; the repair is admitting it as an event, which is an event contract change: stop, with the proposed event kind, payload keys, producer, fold reader and the fold-compatibility argument, implemented by nobody until the owner rules. `application` and `sourceCursor` are the two §9.4 names; trace them first.

(c) **The steel thread.** A cold held-return resume: a parent holds on a child, the store closes and reopens, the Run resumes, and the parent's return frames are rebuilt from the log and equal (`canonicalEquals`) the frames the warm path held. If a lane does this today, name it and its assertion. If none does, build one in the existing family (`t287-fh-hold-open`, `t287-continuation-causation`, `t287-held-prefix`, `t287-route-reconstruction`) with stores built by the store owner (TD-05's rule), the suspension carried only as the warm witness. If the cold resume needs a field that is M, the lane shows it red at the named assertion and the Return stops there.

Dead surfaces: if (a) shows `PublicContinuationAuthority` has no producer, it is a Public export whose removal is a Product contract change: stop with the recommendation (delete, with the two design citations to restate) and the reversal (keep, documented as unused). If the hog port's `parentSuspensions` input is dead in production, state whether the port computes the frames itself from the log (then the input is removed, a `realization_refactor`, and the lane and falsifier are restated over the production ingress) or the port itself is dead; restate before deleting; stop if a lane cannot be restated.

**Item 2: records (propose; the Executive places them).** (a) The TD-18 register row: "Closed at `<commit>`" with the trace's one-line result if every row is E, D or W; else "Open: stop" naming the M rows and the proposed event. (b) The §9.4 sentence replacing "Neither is yet traced, so this instance has its own design re-entry after row 5 of §10.1." with the traced answer. (c) The FRAMED-RECOVERY-01 crosswalk row ("exact resumption TD-18"). (d) Design hits for any sentence naming the continuation authority or the held suspensions; report, edit nothing.

**Item 3: gates and lanes.** `npx tsc --noEmit -p tsconfig.json`; `npm run lint:imports`; `npm run lint:lifecycle`; `npm run lint:evidence`; `npm run build` rc 0 and `git status --short` with no regenerated diff (if a `code/src` edit changes `product-toolchain-manifest.json` or `contracts/capabilities/capability-definition-graph.json`, they are regenerated and committed, as C-4 did). Lanes, one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`, before (head) and after: `t287-fh-hold-open`, `t287-held-prefix`, `t287-continuation-causation`, `t287-route-reconstruction`, `t287-event-calculus-owner-continuation`, `t287-undispatched-diagnostic`, the new lane if any, and every lane importing a changed module (name them from `git grep`); the falsifier `runtime-f09-worker.mjs` if its module changed. Table: lane, item, tests/pass/fail/skipped before and after, red identities and first errors, every change attributed.

Grant: `code/src/hog/*` (`traversal_completion.ts`, `parent_rehydration.ts`, `graph_execute.ts`, `entry.ts`, `evaluation_frame.ts`, `workflow_lifecycle.ts`, `recursion_lifecycle.ts`, `traversal.ts`, `interaction_resume.ts`, `traversal_contract.ts`, `index.ts`); `code/src/abg/c_call_outcome.ts` (item 0 only); a read-only projection added to `code/src/abg/open_call.ts`, `execution_basis.ts` or `c_call.ts` only if a rehydration needs one that does not exist (name it; it reads the prefix and changes no event, key, class or export of `public/`); the named lanes, the falsifier and one new lane file under `test_env/tests/`; the two regenerated files; this record (append only, your section). No edit to `public/continuation_authority.ts`, `public/index.ts`, `abg/event_store.ts`, `abg/event_prefix.ts` or `abg/event_contract_profiles.ts`; no design or register edit; no deletion of a tracked path; no `.ai-workspace/` read beyond this record. Scratch under `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c6/`; remove any worktree before the commit.

Stop (write it in the Return, keep the rest moving): any event kind, payload key, failure class, Public export or Product contract change; a selector-rule or outcome-shape change for item 0; a field whose source is M; a lane that cannot be restated over a production ingress before a deletion.

Return contract: one commit on `main` with the first line `C-6: TD-18's trace: each held-return resumption fact traced to the log, a definition input or caller memory, with the repair or the stop it needs; the Public outcome re-selects a Run-scoped prefix without refusal` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`; never push. Append `## C-6 return` at the end of this record: the first sentence says closed, or names the gap; item 0's fix, its same-prefix proof and its reach; the production ingress trace (a); the field table (b) with every row's source and disposition; the steel thread (c), its lane and assertion; the dead-surface findings with their consumers; item 2's proposals; item 3's tables; deviations from this wording; findings outside the grant; stops. Nothing above your section is edited.

## C-6 return

Base `65dc47210`. Worker: Opus 5.5 at xhigh. The commit carrying this section is the C-6 commit.

Scratch root: `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c6/`, written `scratch/c6/` below.

The answer is no, not everything is delivered. The trace finds no missing fact, which closes TD-18 under the owner's ruling ("none found means closed"). Every field of both suspensions is an event, a definition input or a re-derivation from the two, so no row is M. The one live ingress that hands a held suspension to `rehydrateParentReturnFrames`, the construction resume, builds that suspension from the reopened log and consumes it in the same call. Item 0 is fixed.

The gap is the steel thread. It cannot run on `main`, because the only genuine nested-hold producer is red at head on its fixture support. The closure therefore rests on code reading and on `t287-exact-construction-intent`, the live cold path. Three stops remain:

- the F_H resume chain (bind or retire);
- the unproduced `PublicContinuationAuthority` (delete or keep);
- the steel thread, which no lane on `main` can show inside the grant because the only genuine nested-hold producer is red at head on its fixture.

### Item 0: the Public outcome's prefix re-selection

**Fix** (`code/src/abg/c_call_outcome.ts`: helper `:1886-1904`, call `:1913`). `completePublicOutcome` now calls `materializeOwnedRuntimePrefix(prefix)` in place of `selectValidatedRuntimeEventPrefix(runtimeEventBodiesAtPrefix(prefix).materialize())`. The helper:

1. materializes the complete admitted history at the prefix's cut: `runtimeEventBodiesAtPrefix(unscopedRuntimeEventPrefix(prefix)).materialize()`, selected by the existing array path, which is gap-free by construction;
2. keeps that authority when the prefix already spans the whole cut;
3. otherwise reselects the prefix's own Run, `selectRuntimeEventPrefixFromAuthority(authority, { runId })`, where `runId` is read with the existing `indexedRuntimeEventEnvelopes(prefix, "kind:run_segment_opened")[0]?.runId` (the reader `runtime_failure.ts:144` uses);
4. requires the result to equal the owned prefix in count, last admission ordinal, `runtimeEventPrefixDigest` and `runtimeEventProfileScheduleFromValidatedPrefix` (`canonicalEquals`). A mismatch throws `TypeError("Public outcome prefix differs from its owned selection")`.

The selector rule (`event_prefix.ts:552`, `:614`) is untouched. The outcome shape is unchanged: the Public `runtimePrefix` is still an explicitly materialized `ValidatedRuntimeEventPrefix`, selected from a materialized snapshot and never the owner-bound prefix. No event kind, payload key, failure class or export changes. The `TypeError` is an internal invariant, not a failure class. No owned producer can trip it: every production `runtimePrefix` is a `{ runId }` selection of its own cut (below). A prefix with another scope (for example `{ invocationRef }`) would fail closed there instead of at the selector.

**Same-prefix proof.**

- The helper's own check runs on every Public materialization.
- `t287-undispatched-diagnostic:233` keeps its title and every prior assertion. Four assertions are added at `:327-334`, comparing `result.runtimePrefix` with `selectRuntimeEventPrefixFromAuthority(selectValidatedRuntimeEventPrefix(rows), { runId })` at the same cut on the warm and the reopened store: event ids, `runtimeEventPrefixExtent`, digest and profile. The lane went from 7/6/1/0 to 7/7/0/0.
- A scratch probe through the built `completePublicOutcome` covers a single-Run store whose setup events are not in the Run: the R10 fixture `test_env/fixtures/r10-projection-family/s01-attempt-01/events-01/runtime.events.jsonl`, 20 events, Run selection ordinals 3..20. It returns the same 18 event ids, digest and profile. At head the same call refused with the gap-free message (C-5's probe and this package's). An unscoped prefix comes back with equal count and digest.

**Behaviour difference.** A gap-free Run selection 1..m that is shorter than its cut used to come back as an unscoped prefix of m events. It now comes back Run-scoped. The events, digest and profile are the same. Memory: the Public materialization now decodes the complete history at the cut rather than the Run's slice. Public output was already explicitly materialized. No production caller pays this (below).

**Reach.**

- *Producers.* Every owned producer of a `runtimePrefix` is Run-scoped:
  - `replay.ts:131`, `:228`, `:234`;
  - `traversal_route.ts:5453`;
  - `c_call_outcome.ts:880` (from `replay.ts` truth) and `:1512`.
- *Where the residual bit.* The residual is wider than multi-Run. It refused any Run selection that does not start at ordinal 1, which is every real store with workspace or install events before the Run (the R10 case).
- *Callers that reach `completePublicOutcome`.* These are the Public wrappers:
  - in `c_call_outcome.ts:1895-1911`: `admitCCallResult`, `admitCCallJudgment`, `admitCCallRejection`, `admitCCallCompletion` and `projectCCallOutcomeReceiptAtPrefix`;
  - in hog: `ccall_lifecycle.ts:841`, `:847`; `graph_execute.ts:1374`; `interaction_lifecycle.ts:231`; `interaction_resume.ts:286`; `recursion_lifecycle.ts:341`, `:1090`, `:1113`, `:1126`; `retry_lifecycle.ts:752`; `traversal_completion.ts:228`, `:241`, `:250`; `workflow_lifecycle.ts:1131`, `:1138`.
- *Whether production reaches the refusal.* It does not, today.
  - The run owner imports `executeOwnedGraphTraversalEffect as executeGraphTraversalEffect` (`owner_bindings/run_invocation.ts:76`).
  - Inside hog, every lifecycle call is the owned form under the Public name (`graph_execute.ts:26-108`; `workflow_lifecycle.ts:45`; `recursion_lifecycle.ts:43`; `ccall_lifecycle.ts:69`; `interaction_lifecycle.ts:29`; `interaction_resume.ts:31`; `retry_lifecycle.ts:24`).
  - The one internal call to a Public wrapper is `hog/parent_rehydration.ts:282` (`:284` after this package): `projectCCallOutcomeReceiptAtPrefix`, whose prefix is Run-scoped. It sits in the recursion branch of `rehydrateParentReturnFrames`, and no ingress reaches that branch (trace (a)).
- *Who did reach it.* Only lanes and external callers of the Public `./abg` and `./hog` wrappers, `t287-undispatched-diagnostic:233` among them.

### Item 1(a): the production ingress trace

1. **Hold.**
   - The held completion is `projectOwnedHeldTraversalCompletion` (`hog/traversal_completion.ts:165`; Public form `:231`).
   - Its `parentSuspensions` come from the warm fold: `workflow_lifecycle.ts:539`, `recursion_lifecycle.ts:800` and `projectParentSuspensions` (`evaluation_frame.ts:130-175`).
2. **Run owner.**
   - The three hog entries are `run_invocation.ts:1600` (invoke/start), `:1858` (continue/current_intent) and `:1931` (continue/selected_action).
   - The owner reads only the traversal's `kind` and `successorPrefix`. It projects `projectRunTruthAtDurablePrefix(finalPrefix, runId)` (`:1656`), builds the output with `ProductRunInvocationPort.projectOutcome(memberKey, truth)`, and `finish` (`:1223`) returns that output with the resource receipt (event-resource close handoff).
   - `parentSuspensions` are dropped at the owner. No event kind or payload key carries them: outside `hog/`, the only `code/src` file naming them is `public/continuation_authority.ts`, which has no producer. The held Public output carries refs and digests projected from the log.
3. **Resume.**
   - `RUN_DEFINITION_BINDINGS` (`run_invocation.ts:1979`) binds invoke/start and continue/current_intent and continue/selected_action. None resumes an F_H hold:
     - `selected_action` enters as a plain initial input (`:1931`);
     - `current_intent` resumes a construction-intent continuation.
   - `abg.operation.interaction.respond` has packets (`product/interaction_operation_contracts.ts`) and no binding. `public/binding/owner_contract_source_set.ts:185` names `INTERACTION_DEFINITION_BINDINGS`, and no module exports it.
   - `prepareFhInteractionResume` (`abg/continuation.ts:2153`) is reached only through `commitFhInteractionResumeAtExpectedPrefix` (`:2315`, `:2346`) from the hog port's commit (`graph_execute.ts:1189`).
   - So **no Public operation resumes an F_H-held Run.**
4. **The hog port** `ResumeHeldInteractionInput` (`traversal_contract.ts:84-101`; consumed at `graph_execute.ts:1072-1257` and `:1331`) has no constructor anywhere: not in `code/src`, not in `test_env/`, not in `scripts/`. The port itself is dead, not only its `parentSuspensions` input. It does not compute frames from the log: it hands the carried suspensions to `rehydrateParentReturnFrames`.
5. **The live ingress into `rehydrateParentReturnFrames` is the construction resume** (`graph_execute.ts:1324`).
   - It is not a held-return resume. The Run it continues failed at an undispatched preparation frontier: in `t287-exact-construction-intent` the initial completion is `failed` with zero `parentSuspensions`.
   - `prepareConstructionIntentContinuation` (`abg/construction_continuation.ts:586-843`) projects the original parent position cold from the log: root basis, materialized and validated root graph, parent cursor and input, parent CCall, scopes.
   - `prepareConstructionContinuationTraversal` (`hog/entry.ts:466-523`) admits a new root basis, scope, cursor, parent CCall, child and reentry link in a new Run. It builds its one `HeldWorkflowSuspension` from those (`:504-520`) and passes it to `preflightParentReturns` (`graph_execute.ts:1015-1043`) in the same call.
   - The suspension never crosses a recovery boundary. It is §9.1's permitted internal handoff of established state.
6. `projectedRetryResume` (`hog/entry.ts:157-222`, used by F09) carries no parent suspension inward. It produces a held completion whose suspensions are warm.

### Item 1(b): the field table

**How to read the table.**

- Column 1 is the one live ingress, the construction resume, which builds only workflow suspensions.
- Column 2 has no resume ingress. It gives the cold source a resume of an F_H hold would use, by code reading of the existing projections. Item (c) names the witness written for the workflow rows, which could not run on `main`.
- Column 3 is how `rehydrateParentReturnFrames` treats a carried value. That consumer is reached live only from column 1. Its carried-value input is reached in full only from the dead hog port: no caller, not repaired, and deleting the port is a stop.

**Source codes in the cells.**

- E: event, with the projection that reads it.
- D: definition input.
- W: re-derived from E and D.
- C\*: carried, used, and checked against a digest in L. This is §9.1's referenced evidence.
- claim: carried only as a key or claim; the frame uses the E or W value.

| Field | Construction resume (live) | F_H hold, cold source (no ingress) | `rehydrateParentReturnFrames`, carried value | Disposition |
|---|---|---|---|---|
| `parentExecutionBasisRef` | E: `basis_admitted` of the new root basis (`admitConstructionContinuationExecutionBasis`), read by `rehydrateExecutionBasisAtPrefix` | E: the held child basis's `parentExecutionBasisRef` (`basis_admitted`) | claim, checked equal to the child basis's `parentExecutionBasisRef` (`:382`) | lawful |
| `parentTraversalScope` | E: `run_segment_opened`, `graph_call_opened`, `frame_opened` (`openTraversalScope`), read by `rehydrateOpenedTraversalScopeAtPrefix` | E: `projectOpenedTraversalScopeForFrameAtPrefix` at the parent CCall's frame | claim, re-derived (E) and checked against the child basis | lawful |
| `parentGraph` | W: `materializeGraph(resolution.graphFunction, root basis raw input)`, validated against the basis (`construction_continuation.ts:791-801`) | W: the same over the parent basis | C\*: `validateGraph` re-derives the template from D; `validationRef`, `graphRef`, `graphDigest` equal the basis (`:107-127`) | lawful |
| `parentClosureContract` | D: `resolution.closureContract`, bound by the basis's `closureContractRef` and `closureContractDigest` | D: `leafPort.closureContractByRef(basis.closureContractRef)`, digest equal to `basis.closureContractDigest` | C\*: ref, and from this package digest, against the basis (`:126-129`); was ref only | repaired (`realization_refactor`, hog) |
| `parentCCall` / `evaluatorCCall` | E: `c_call_opened` (`openCCall`), re-derived by `rehydrateWorkflowCCallAtPrefix` | E: `projectOpenedCCallCarrierAtPrefix` at the child basis's `parentCCallRef`; evaluator: `projectAdmittedCCallOutcomeAtPrefix` | claim; the frame uses the re-derived CCall or the projected outcome | lawful |
| `evaluatorResult`, `evaluatorJudgment` | not built | E: `c_call_result_admitted`, `c_call_judged` | claim, projected (E) | lawful |
| `application` | W: `null`; the template has no fan-out application for the call and the CCall's `batchRef` is null | W: workflow, the template application with the CCall's `batchRef`; recursion, the template application with the evaluator CCall's `compositionRef` | workflow: claim, the frame uses the template's and requires the CCall's `batchRef` (E). Recursion: claim selected by the carried `applicationRef`, not checked against the evaluator's `compositionRef` | workflow lawful; recursion binding gap, unreached (finding) |
| `sourceCursor` | E: the cursor admitted by `admitContinuedTraversalCursor`, read by `rehydrateHeldInteractionCursor` | E: `c_call_opened` `cursorRef` and `cursorDigest` plus cursor ancestry (`projectOpenedCCallTraversalInputAtPrefix`) | claim; the frame uses the admitted cursor | lawful |
| `parentGraphInput`, digest | E: the original root `basis_admitted` `rawInputValue` and `rawInputDigest` | E: the parent basis `rawInputValue` | C\*: digest, and through `graphValidationRef` (E) | lawful |
| `parentInput` / `evaluatorInput`, digest | E: the input origin at the original parent cursor (`projectTraversalInputAtPrefix`: `c_call_result_admitted` value, route `boundInput`, ...) | E: the same at the parent CCall's cursor | C\*: digest equal to `sourceCursor.inputDigest` (E) | lawful |
| `childExecutionBasisRef` | E: child `basis_admitted` | E: `basisId` of the held CCall's `c_call_opened`, found from the held output's `continuationRef` through `fh_interaction_opened` | claim, checked against the current child (E) | lawful |
| `childTraversalScopeRef` | E: the child scope's opening events | E: `projectOpenedTraversalScopeForFrameAtPrefix` at the held CCall's frame | claim, checked against the current child (E) | lawful |
| `childInput`, digest | E: the construction intent's `targetInput`, admitted as the child basis raw input | E: the child basis `rawInputValue` | C\*: digest equal to the child basis's `rawInputDigest` (E) | lawful |
| `terminalMode` | W: `"close_run"`, which the consumer re-derives | W: `projectOpenedTraversalScopeClassAtPrefix` (root gives `close_run`) | claim, checked equal to the derived mode | lawful |

**Counts.**

| Ingress | Kind | Rows | E | D | W | C | M |
|---|---|---|---|---|---|---|---|
| Construction resume (live) | workflow | 13 | 9 | 1 | 3 | 0 | 0 |
| Construction resume (live) | recursion | 0 | n/a | n/a | n/a | n/a | n/a |
| F_H hold, cold source (no ingress) | workflow | 13 | 9 | 1 | 3 | 0 | 0 |
| F_H hold, cold source (no ingress) | recursion | 15 | 11 | 1 | 3 | 0 | 0 |

The dead hog port's carried values (no caller; column 3):

| Kind | Rows | Claims the consumer replaces with the E or W value | C\* | M |
|---|---|---|---|---|
| workflow | 13 | 8 | 5 (`parentGraph`, `parentClosureContract`, `parentGraphInput`, `parentInput`, `childInput`) | 0 |
| recursion | 15 | 10 (one, `application`, not bound to the evaluator's `compositionRef`) | 5 (the same, with `evaluatorInput`) | 0 |

**`application` and `sourceCursor`, the two §9.4 names.**

- `sourceCursor` is an event: the admitted cursor. `c_call_opened` names it by `cursorRef` and `cursorDigest`, and `projectOpenedCCallTraversalInputAtPrefix` rebuilds it.
- A workflow `application` is a re-derivation: the definition's template application selected by the CCall's admitted `batchRef`.
- A recursion `application` is the template application named by the evaluator CCall's admitted `compositionRef`.

**C\* rows.** These are carried bodies the consumer uses after checking them against a digest in L. A canonical digest equal to the log's digest is canonical equality with the fold's value, so they are referenced evidence under §9.1, not a second source. One exception was repaired here: the closure contract was bound by ref only.

**Why the C\* rows are not repaired.** The activation's C repair (derive from the fold and treat the copy as a claim) is not applied to the C\* rows of column 3. That ingress is dead, and removing or replacing its carried input is the port's stop.

### Item 1(c): the steel thread

**No lane on `main` shows a cold held-return resume. This is a stop.**

**Live path.** The live cold path is `t287-exact-construction-intent`, green before and after. It closes the store, reopens it through the installed CLI, runs `continue.current_intent` and closes the continued Run with `child_foldback_admitted`. The suspension consumed there is built from the reopened log in the same call. It has no warm witness: the initial Run fails with zero suspensions, and the resume opens a new Run.

**Genuine nested hold: two producers, neither green.**

- `t287-r4-aba-retry`, the F09 A-B-A worker. It holds a parent workflow on an F_H child through the installed `executeGraphTraversal`. It is red at head and after, at fixture verification in `constructP1Environment` (`runtime-f09-worker.mjs:952`), before the hold. Its first error is `product_verification_refusal` `manifest_malformed`. The cause is `test_env/support/developer-mini-product.mjs`, which writes a manifest without `capabilityDefinitionGraph`, a key `parseProductManifest` requires (`product/verify_product.ts:1052`).
- `t287-fh-hold-open`, red at head and after on a missing installed bootstrap under `.ai-workspace/`.

**The witness, built but not committed.** I wrote the steel thread into `produceAba` after the existing assertions. It does the following:

1. Closes the store with `projectReopenAuthorityAndClose` and reopens it with `reopenEventStore`.
2. Derives the `HeldWorkflowSuspension` from the reopened log and definition inputs only, starting from the held output's `continuationRef`: `rehydrateExecutionBasisAtPrefix`, `materializeGraph`, `projectOpenedCCallTraversalInputAtPrefix`, `projectOpenedCCallCarrierAtPrefix`, `projectOpenedTraversalScopeForFrameAtPrefix`, `leafPort.closureContractByRef` with a digest check, and `projectOpenedTraversalScopeClassAtPrefix`.
3. Requires the derivation to `canonicalEquals` `completion.parentSuspensions[0]`, field by field and whole.
4. Requires `rehydrateParentReturnFrames` over the cold implementation set (`rehydrateAdmittedImplementationSetAtPrefix`) to give frames from the derived and the warm suspension that `canonicalEquals` each other.
5. Checks three negatives:
   - a closure body changed under the same ref is refused at `parent-runtime`;
   - a changed `parentInput` is refused at `workflow-relation`;
   - the same input re-sealed with its own digest is refused at `workflow-relation`.

**One scratch attempt to run it, refused.** I ran it once from a scratch harness, `scratch/c6/run_f09_scratch.mjs`. The harness serves a patched support module to the driver through a `registerHooks` load hook and adds the capability graph as `registered-graph-selection.mjs:55-64,130,179` do. Verification got past `manifest_malformed` and refused with `catalog_mismatch` ("capability graph ownership or catalog projection is crossed"). The cause is that the mini product declares `developer.example.capability.greeting@5`, which an empty graph does not cover. Log: `scratch/c6/scratch_f09/run1-no-closure-check.log`.

**Why the witness is not committed.** A witness that never runs is not evidence, so I removed it from `runtime-f09-worker.mjs`. Its text is at `scratch/c6/runtime-f09-worker.witness.mjs`, `produceAba` (the block between `assert.deepEqual(completion.replayState, heldReplay)` and the return, and `...coldReturn` in the audit).

**Recommendation.** Repair the mini product support to write the capability graph and coordinates its declarations require. That is a test-only increment outside this grant. Then commit the witness. The negative for the closure check rides on it.

**Reversal.** None needed; nothing was committed.

**Not shown.** The closure check's negative is not shown by any lane on `main`. Its positive path on the live ingress is `t287-exact-construction-intent`, green after the check. The continued root basis copies the original basis body, whose `closureContractDigest` is `sha256Canonical(resolution.closureContract)` (root admission `abg/execution_basis.ts:2086`; the copy `:2777-2808`).

### Dead surfaces

**`PublicContinuationAuthority`** (`public/continuation_authority.ts:33-55`).

- *Producers and callers.*
  - `constructPublicContinuationAuthority` and `parsePublicContinuationAuthority` have no caller under `code/src`.
  - `updatePublicContinuationAuthority` is called nowhere either. It calls `construct` inside the module.
  - `public/index.ts:1-3` exports the type only.
  - No lane or script constructs or parses it.
- *Where it is named as data.* `test_env/proof/abi5-root-r10.json`, `.outcomes.json`, `.transcript.json`, `.events.jsonl`, `test_env/fixtures/continuation-causation.json` and the R10 projection-family events.
- *Design citations.* `design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1228`, `:1299`, `:1300`, `:1496`; `design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2050`.
- **Stop**, below.

**The hog interaction-resume port** (`ResumeHeldInteractionInput`, `traversal_contract.ts:84-101`; `graph_execute.ts:1072-1257`, `:1331`; exported through `hog/index.ts` and the `./hog` package export).

- The port itself is dead. It does not compute frames from the log.
- No lane or falsifier reaches it, so nothing needs restating before a deletion.
- Its removal changes the Public `./hog` surface (`ExecuteGraphTraversalRequest`). **Stop**, below.

**Other members of the same chain.**

- The `./abg` exports `prepareFhInteractionResume`, `rehydrateFhContinuationAtPrefix` and `commitFhInteractionResumeAtExpectedPrefix` (`abg/index.ts:305-315`) have no caller outside `abg/continuation.ts` and the dead port.
- The warm `parentSuspensions` on the Public held completion have two readers:
  - the dead port, through `rehydrateParentReturnFrames`;
  - the read-only assertions in `runtime-f09-worker.mjs:2715`, `:3112` and `t287-route-reconstruction:393`.

### Claims (i) to (iv)

- **(i) Verified.**
  - `run_invocation.ts:1600` and `:1931` pass a plain initial input to `executeOwnedGraphTraversalEffect`, aliased at `:76`.
  - `:1858` passes `continued`, the result of `prepareConstructionContinuationTraversal`. That result has `constructionResume: true` and one suspension, the `entry.ts:504` value built from the store's prepared source.
  - None of the three passes `interactionResume`.
- **(ii) Corrected.** No file constructs an input with `interactionResume`:
  - not under `code/src`;
  - not `test_env/falsifiers/runtime-f09-worker.mjs` or `test_env/tests/t287-route-reconstruction.test.mjs`, which only read `parentSuspensions` from a held completion (`:2715`, `:3112`; `:393`);
  - no other file under `test_env/` or `scripts/`.

  The only references are the consumer (`graph_execute.ts:1082`, `:1331`) and the type (`traversal_contract.ts:86`).
- **(iii) Verified.** As above. The type, not the functions, is exported from `public/index.ts`.
- **(iv) Verified.**
  - `prepareFhInteractionResume` (`continuation.ts:2153`) and `rehydrateFhContinuationAtPrefix` (`:1059`) are exported at `abg/index.ts:310` and `:315`.
  - Their callers are `continuation.ts:1051` and `:2346`, and hog's commit at `graph_execute.ts:1189`, which only the dead port reaches.

### Item 2: records (proposals; the Executive places them)

- **(a) Register TD-18.** "Closed at `<commit>`: no M row. Every held-return field is an event, a definition input or a re-derivation (construction resume, the live ingress: 9 E, 1 D, 3 W; F_H cold source by code reading: 9/1/3 workflow, 11/1/3 recursion). The closure contract carried into `rehydrateParentReturnFrames` is now digest-bound to the basis. Three items carry their own C-6 stops: no Public operation resumes an F_H-held Run (bind or retire); `PublicContinuationAuthority` has no producer (delete or keep); the steel thread waits on the mini product fixture support."
- **(b) §9.4 sentence.** Replace "Neither is yet traced, so this instance has its own design re-entry after row 5 of §10.1." with:

  > "Traced at T-290 C-6: `sourceCursor` is the admitted cursor that `c_call_opened` names, `application` is the definition's template application selected by the CCall's admitted `batchRef` (workflow) or the evaluator's `compositionRef` (recursion), and every other field is an event or a definition input, so no field is missing from the log. The one live ingress, the construction resume, builds its suspension from the reopened log and consumes it in the same call, an internal handoff. `rehydrateParentReturnFrames` uses a carried body only after checking it against its digest in the log, except in its recursion branch, which only the unused interaction-resume port reaches: there the carried `applicationRef` selects the application and is not checked against the evaluator's `compositionRef`. No operation resumes an F_H hold, so the carried suspensions cross no recovery boundary in production; binding that resume or retiring the chain is the owner's decision."
- **(c) FRAMED-RECOVERY-01 crosswalk row.** "TD-24 share U at `a8937b837` (the bounded installed fresh case accepted at `execution.md:3144-3154`; the territory is absent); exact resumption traced at C-6 (`<commit>`): no M field, TD-18 closed; the absent F_H resume operation is a separate stop (bind or retire)."
- **(d) Design hits.** Reported only; none edited.
  - The continuation authority: `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1228`, `:1299`, `:1300`, `:1496`; `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2050`.
  - The held suspensions: `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:581-583` (§9.4).

### Item 3: gates and lanes

**Gates.** All were run on the final tree, before the commit.

| Gate | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | rc 0 |
| `npm run lint:imports` | rc 0 (28 shared modules) |
| `npm run lint:lifecycle` | rc 0 (284 modules, 7 allow-listed sites, no offender) |
| `npm run lint:evidence` | rc 0 (691 mirror roots inventoried, no new copy) |
| `npm run build` | rc 0. It regenerates `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`, because the `code/src` edits change the product content digest (every changed key is a digest or ref derived from it). Both are committed. A rebuild after staging leaves `git status --short` with no tenant diff. |

**Lanes.** All were run one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`. Before is head `65dc47210` after `npm run build`; after is the final tree. Logs: `scratch/c6/before/`, `scratch/c6/after/`. Counts are tests/pass/fail/skipped.

| Lane | Why run | Before | After | Red or skip identities, first error | Attribution |
|---|---|---|---|---|---|
| `t287-undispatched-diagnostic` | item 0; imports `c_call_outcome` (source-transpiled) | 7/6/1/0 | 7/7/0/0 | before: `:233` `TypeError` "runtime event-prefix selection requires a total, gap-free admission-ordinal order" | item 0; four same-prefix assertions added at `:327-334` |
| `t287-fh-hold-open` | named | 1/0/1/0 | 1/0/1/0 | file load: `ERR_MODULE_NOT_FOUND` for the installed bootstrap under `.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-17/` | unchanged |
| `t287-held-prefix` | named; imports `c_call_outcome` | 6/0/0/6 | 6/0/0/6 | all skip: `ABI5_HELD_PREFIX_NATIVE_FIXTURE` unset | unchanged |
| `t287-continuation-causation` | named | 1/1/0/0 | 1/1/0/0 | | unchanged |
| `t287-route-reconstruction` | named; imports `c_call_outcome` | 10/8/0/2 | 10/8/0/2 | skip `:217`, `:246` (`P0_RETAINED_NATIVE_SCRATCH` unset); body-retention cases `:481`, `:536` green both runs | unchanged |
| `t287-event-calculus-owner-continuation` | named | 1/0/1/0 | 1/0/1/0 | file load: `:18` "exact preimage territory and a digest-bound CLOSED JSONL fixture are required" | unchanged |
| `m5-consensus-module` | imports `c_call_outcome` | 17/17/0/0 | 17/17/0/0 | | unchanged |
| `m5-retry-lifecycle-authority` | imports `c_call_outcome` (source text) | 9/4/5/0 | 9/4/5/0 | `:21`, `:238`, `:281`, `:323`, `:533`, source-boundary assertions ("declared retry frontier lost owner relation", "missing source boundary: ...", writer list deep-equal) | unchanged; logs identical apart from timings |
| `t287-c0-correction-regressions` | imports `c_call_outcome` | 4/3/1/0 | 4/3/1/0 | `:42` `TypeError` "Cannot read properties of undefined (reading 'graphFunctionRef')" | unchanged |
| `t287-c0-post-publication-failure` | imports `c_call_outcome` | 31/31/0/0 | 31/31/0/0 | | unchanged |
| `t287-generic-job-parent-foldback` | imports `c_call_outcome` | 1/0/0/1 | 1/0/0/1 | skip: `ABI5_GENERIC_JOB_PARENT_FOLDBACK_ROOT` unset | unchanged |
| `t287-native-work-currentness-consumers` | imports `c_call_outcome` | 4/4/0/0 | 4/4/0/0 | | unchanged |
| `t287-result-evidence-lineage-projection` | imports `c_call_outcome` | 1/0/1/0 | 1/0/1/0 | `:215` `TypeError` "event store was not constructed by this ABG module" | same error; its stack frame in `build/.../c_call_outcome.js` moves with item 0's inserted lines |
| `t287-runtime-failure-diagnostic` | imports `c_call_outcome` | 17/17/0/0 | 17/17/0/0 | | unchanged |
| `t287-recursive-registered-selection` | imports hog wrappers over `completePublicOutcome` | 4/2/1/1 | 4/2/1/1 | `:129` diagnostic `registered-selection/original-child-failure@5` where `hog/application-foldback-mismatch@5` is expected; skip `:239` (`ABI5_RECURSIVE_SELECTION_LIVE`) | unchanged |
| `t287-deferred-application-restoration` | imports `hog/traversal_completion` | 2/0/2/0 | 2/0/2/0 | `:85`, `:116` "select the frozen S02 continuation-03 evidence carrier" | unchanged |
| `t287-exact-construction-intent` | live construction resume into `rehydrateParentReturnFrames` (installed) | 1/1/0/0 | 1/1/0/0 | | the closure digest check passes on the live ingress |
| `t287-r4-aba-retry` | F09 A-B-A, the only genuine nested-hold producer (installed) | 1/0/1/0 | 1/0/1/0 | `:9`: the worker fails at `constructP1Environment` (`runtime-f09-worker.mjs:952`), `product_verification_refusal` `manifest_malformed` | unchanged; the worker is committed unchanged |

**Scratch evidence** (not committed lane state): `scratch/c6/scratch_f09/run1-no-closure-check.log` holds the F09 witness run through the substituted support module, which ended at fixture verification with `catalog_mismatch`.

### Deviations from the activation's wording

- **Claim (ii) is corrected** (above).
- **Item 0's reach is wider than the activation states.** The activation scopes it to multi-Run stores. The refusal hit every Run selection that does not start at ordinal 1.
- **The field table adds columns.** Besides the one live ingress, it carries an F_H cold-source column and the dead port's carried-value column, each labelled. The activation's C repair is applied to one row only, the closure digest. The other C\* rows sit on an ingress with no caller, and its removal is a stop.
- **Item (c) is not built in the named family.**
  - The family has no lane producing a genuine nested hold: `t287-fh-hold-open` is red at head on a missing bootstrap, `t287-held-prefix` skips 6/6, and `t287-continuation-causation` and `t287-route-reconstruction` use rows or controlled premises.
  - The witness was written in the granted falsifier, run once from a scratch harness with a substituted support module (a deviation, scratch only), and not committed because it cannot run on `main`.
- **The first sentence follows the owner's closure rule.** The live ingress has 0 C and 0 M rows, so TD-18 is proposed Closed. The missing F_H resume operation and the unshown steel thread are stops of their own, not grounds to keep TD-18 open.
- **Unlisted lanes run.** `t287-r4-aba-retry` and `t287-exact-construction-intent` were run before and after because they reach the changed modules through the installed package.

### Findings outside the grant

- **`test_env/support/developer-mini-product.mjs`.** Its manifest lacks `capabilityDefinitionGraph`, and the mini product's declared capability needs graph coordinates. This keeps every F09 lane that prepares the retry product red at fixture verification (`t287-r4-aba-retry` here).
- **`public/binding/owner_contract_source_set.ts:185`** names `INTERACTION_DEFINITION_BINDINGS`, which no module exports.
- **Recursion `application` binding gap.** `exactRecursionReturn` (`hog/parent_rehydration.ts:271-275`, `:290-304`) selects the recursion application by the carried `applicationRef` and does not compare it with the evaluator CCall's admitted `compositionRef`. That branch is reachable only from the dead port. Repair it inside the bind option, or delete it with the retire option.
- **Head reds this package does not touch**, listed in the lane table with first errors:
  - `t287-event-calculus-owner-continuation`, `t287-deferred-application-restoration`: fixture missing;
  - `m5-retry-lifecycle-authority`: source-text boundaries;
  - `t287-c0-correction-regressions`, `t287-result-evidence-lineage-projection`, `t287-recursive-registered-selection`.

### Stops

1. **The F_H resume chain.** No Public operation resumes an F_H-held Run, and the hog interaction-resume port has no constructor.
   - **Option A, bind.** Bind `abg.operation.interaction.respond`, exporting the binding `owner_contract_source_set.ts:185` names. Its owner derives the parent frames from the log at the cut with the column-2 projections, adding the recursion `compositionRef` check, and passes no carried `parentSuspensions`. That drops the port's carried input and the C\* rows with it. Product contract change: a new bound operation. Reversal: unbind it and keep the port.
   - **Option B, retire.** Delete the port (`ResumeHeldInteractionInput`, `graph_execute.ts:1072-1257`, `:1331`), its `./abg` support exports and the `interaction.respond` packets. The Public held completion's `parentSuspensions` then has no consumer and goes too. Public export and contract change. Reversal: restore from the C-6 commit.
   - **Recommendation.** Option A if F_H resume is in Product scope; else B. Nothing of either is implemented.
2. **`PublicContinuationAuthority`.**
   - **Recommendation: delete** the type export (`public/index.ts:1-3`) and the module, restating the design rows `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md:1228`, `:1299`, `:1300`, `:1496` and `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:2050`. Public export change.
   - **Reversal: keep it**, documented as unused, if option A will produce it as the respond operation's carrier.
3. **The steel thread (c).** No lane on `main` can show it inside the grant (item (c)).
   - **Recommendation.** Grant the mini product support repair, then commit the scratch witness.
   - **Reversal.** None; nothing was committed.

## C-6 disposition (Executive, 2026-10-25)

Accepted at `229b1e034`. Executive check on that head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 7 allow-listed, no offender; `lint:evidence` 691 roots inventoried, no new copy, 1,739 listed paths over 6,000,000 bytes and no other; `npm run build` rc 0 and no regenerated diff; the item 0 probe through the built `completePublicOutcome` on the R10 store (20 events, the Run selection at ordinals 3 to 20) gives the same 18 event ids, digest and profile, and an unscoped prefix equal in count and digest; the commit's six files all in the grant, the five forbidden files and the design untouched, no deletion; lanes `t287-undispatched-diagnostic` 7/7 (6/7 at head), `t287-fh-hold-open` 1/0/1 (the installed bootstrap under `.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-17` absent, head state), `t287-held-prefix` 6 skipped (`ABI5_HELD_PREFIX_NATIVE_FIXTURE` unset), `t287-continuation-causation` 1/1, `t287-route-reconstruction` 10/8/0/2, `t287-event-calculus-owner-continuation` 1/0/1 (fixture required, head state), `t287-interrupted-event-resource-recovery` 8/6/2/0 (head state since C-4), `t287-cold-record-decoder` 3/1/1/1 (head state, no changed module), `m5-consensus-module` 17/17, `t287-runtime-failure-diagnostic` 17/17, `t287-exact-construction-intent` 1/1, `t287-r4-aba-retry` 1/0/1 (`manifest_malformed` at fixture verification, head state); the untracked set the two codex posts (`exec_check_C6.log`). The commit carries six files: the two `code/src` modules the grant names (`abg/c_call_outcome.ts` for item 0, `hog/parent_rehydration.ts`), the two files `npm run build` regenerates, the item 0 lane and this record; no other, no deletion; one commit, parent `65dc47210` (the Worker amended its own first commit, accepted).

The Return's first sentence stands: TD-18's trace is complete and finds no missing fact, and the steel thread is not shown. The package is accepted as what it did; the steel thread is carried.

Item 0 accepted. The Public outcome re-selects the owned prefix's own Run over the complete admitted history at its cut and requires the same count, last ordinal, digest and profile; the selector rule and the outcome shape are unchanged; the `TypeError` on a mismatch is an internal invariant no owned producer can trip, since every production `runtimePrefix` is a `{ runId }` selection of its own cut. Reach accepted as wider than the activation said: the refusal hit every Run selection not starting at ordinal 1, which is every real store with setup events before the Run; no production path reached it (the run owner and hog use the owned forms; the one internal Public call, `parent_rehydration.ts:284`, sits in the recursion branch no ingress reaches). The Executive's probe on the R10 store agrees with the Worker's.

Item 1 accepted. (a) The production ingress trace: `parentSuspensions` leave the warm fold into the held completion and are dropped at the run owner; no event and no Public carrier carries them; no Public operation resumes an F_H-held Run; the hog interaction-resume port has no constructor anywhere (claim (ii) corrected: the falsifier and `t287-route-reconstruction` only read `parentSuspensions`); the one live ingress into `rehydrateParentReturnFrames` is the construction resume, which builds its suspension from the reopened log and consumes it in the same call. (b) The field table: no M row in any column; the live ingress 9 E, 1 D, 3 W, 0 C; the F_H cold source by reading 9/1/3 workflow and 11/1/3 recursion; the five carried bodies the consumer uses are each checked against a digest the log binds (§9.1's referenced evidence), and the one that was bound by ref only, the closure contract, is now digest-bound (`parent_rehydration.ts:128`; its positive path `t287-exact-construction-intent`, green). The two §9.4 names: `sourceCursor` is the admitted cursor `c_call_opened` names; `application` is the template application selected by the CCall's admitted `batchRef` (workflow) or the evaluator's `compositionRef` (recursion). (c) Not shown: no lane on `main` produces a genuine nested hold and runs; the witness is written and saved, not committed (accepted: untested code is not evidence).

Deviations accepted: the two extra table columns; the unlisted lanes run; the scratch harness with a substituted support module (scratch only, nothing committed).

Stops ruled. (3) The steel thread: a test-support defect (`test_env/support/developer-mini-product.mjs` writes no `capabilityDefinitionGraph`, which `parseProductManifest` requires, and the declared capability needs graph coordinates) keeps `t287-r4-aba-retry` red at fixture verification. Ruling: discharge, carried into C-7 as item 0 with the saved witness; reversal: none needed. (1) The F_H resume chain and (2) `PublicContinuationAuthority`: each is a Product contract change (a Public output member, Public exports, a bound operation), so both go to the owner with the Executive's recommendation in the ticket's Phase C decisions table: retire the carried-memory chain now and keep the `interaction.respond` packets declared-unbound (the state the result and materialization bindings share), binding the resume over the fold when it is selected; reversal: restore from `229b1e034`. Nothing of either is implemented. The recursion `application` binding gap (`parent_rehydration.ts:271-304`, reached only from the dead port) goes with the chain under either option.

Findings ruled. `INTERACTION_DEFINITION_BINDINGS` named at `owner_contract_source_set.ts:185` with no exporting module is not a defect: `RESULT_DEFINITION_BINDINGS` and `MATERIALIZATION_DEFINITION_BINDINGS` are in the same state and `t287-wave2-owner-contract-source-set` is green; it is the declared-unbound state. The head reds in the lane table (`t287-fh-hold-open`, `t287-event-calculus-owner-continuation`, `t287-deferred-application-restoration`: fixtures absent; `m5-retry-lifecycle-authority`, `t287-c0-correction-regressions`, `t287-result-evidence-lineage-projection`, `t287-recursive-registered-selection`; and the Executive's `t287-interrupted-event-resource-recovery`, `t287-cold-record-decoder`) are untouched by this package and are attributed at the Phase C close run.

Register: TD-18 Closed at `229b1e034` by the owner's rule (none found means closed), with the witness and the two owner stops stated in the row; FRAMED-RECOVERY-01's exact-resumption share traced. Design §9.4 restated by the Executive in this bookkeeping commit from the Return's item 2(b): the open instance becomes the traced result. Ticket: the Phase C decisions table gains the owner's row.

## C-7 activation (Executive, 2026-10-25; the fork trace: a fork of the calculus derivation at any cut, advanced to any later cut, equals the warm projection there; a difference is a defect and is repaired; with the C-6 steel thread as item 0)

Base: the head carrying this activation (the C-6 bookkeeping commit). Worker: Opus 5.5 at xhigh, fresh. Scratch: `scratchpad/c7/`. Record: this file, append only, your section `## C-7 return`.

**Item 0: the C-6 steel thread (the carried defect).** C-6 could not show a cold held-return resume because the only genuine nested-hold producer, the F09 A-B-A falsifier (`test_env/falsifiers/runtime-f09-worker.mjs`, lane `t287-r4-aba-retry`), is red at head at fixture verification (`runtime-f09-worker.mjs:952`): `product_verification_refusal` `manifest_malformed` "product manifest shape is invalid" for `abiogenesis-fixtures-developer-mini-product-5.0.0.tgz`.

(a) The fixture. `test_env/support/developer-mini-product.mjs` writes a product manifest (`:151-185`) without `capabilityDefinitionGraph`, a coordinate `parseProductManifest` requires (`product/verify_product.ts:1052`), and declares `developer.example.capability.greeting@5` (`:180`), which an empty graph does not cover (the C-6 scratch run with an empty graph refused `catalog_mismatch`, "capability graph ownership or catalog projection is crossed"). Repair the support so the mini product writes the capability definition graph asset and the coordinate its declaration requires, as `test_env/support/registered-graph-selection.mjs:55-64`, `:130`, `:179` does for its product, and the variant products it writes (`:266-304`) stay consistent. Then `t287-r4-aba-retry` passes fixture verification. If the lane is then red past verification on a defect in `code/src`, stop item 0 at that assertion with its first error, commit the fixture repair, and leave (b) in scratch.

(b) The witness. The C-6 Worker's text is at `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c6/runtime-f09-worker.witness.mjs`, a whole copy of the falsifier with the witness in `produceAba` (between `assert.deepEqual(completion.replayState, heldReplay)` and the return, and `...coldReturn` in the audit); diff it against the committed falsifier and apply the witness. It closes the store with `projectReopenAuthorityAndClose` and reopens it with `reopenEventStore`; derives the `HeldWorkflowSuspension` from the reopened log and definition inputs only, starting at the held output's `continuationRef` (`rehydrateExecutionBasisAtPrefix`, `materializeGraph`, `projectOpenedCCallTraversalInputAtPrefix`, `projectOpenedCCallCarrierAtPrefix`, `projectOpenedTraversalScopeForFrameAtPrefix`, `leafPort.closureContractByRef` with the digest check, `projectOpenedTraversalScopeClassAtPrefix`); requires the derivation to `canonicalEquals` `completion.parentSuspensions[0]`, field by field and whole; requires `rehydrateParentReturnFrames` over the cold implementation set (`rehydrateAdmittedImplementationSetAtPrefix`) to give frames from the derived and the warm suspension that `canonicalEquals` each other; and checks three negatives (a closure body changed under its ref is refused at `parent-runtime`; a changed `parentInput` is refused at `workflow-relation`; the same input re-sealed with its own digest is refused at `workflow-relation`). Run the lane; commit the witness green. The suspension equality is restated if the owner later retires the carried member (C-6 stop 1); the frame equality and the negatives stand under either option. Report the lane's count before and after and the witness's assertion lines. No `code/src` edit for item 0: a defect it reveals there is a stop with its first error.

**Item 1: the fork trace.**

The fact, reproduced by the Executive on this head (scratch `scratchpad/c7/fork_probe.test.mjs`): on the U1 store as `t287-calculus-fold` builds it (`createU1Fixture`, then `cause`, `exit`, `cause('actor_invocation_failed')`; 22 events), `forkRuntimeEventCalculusAtForModuleTest(source, cut, source)` differs from `deriveRuntimeEventCalculusProjection(source)` at 20 of the 22 cuts when `source` is the validated prefix (`prefixOf(rows)`), and at 0 of 22 when it is the owned prefix (`selectOwnedRuntimeEventPrefix(store)`). The difference: the fork's `basis_admitted` effect rows initiate one fluent where the warm fold initiates two, and the five `worksite_observation_current(worksite-observation://…)` fluents the warm end holds are missing from the fork's end; clipped refs agree. The step-8 record saw it (`work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md:1859`) and replaced the end-to-end assertion with the at-cut one (`t287-calculus-fold.test.mjs:111`). The owner ruled on 2026-10-24 (ticket, Phase C decisions): a cold fold at any cut equals the warm projection by the fold law, so the difference is a defect to repair.

Cause by reading, to verify first. `eventCalculusDependencies(prefix, event, prior)` (`abg/event_calculus.ts:90-96`) returns the carried `prior` list whole for a `validated_runtime_event_prefix` and selects the exact dependencies from the before-event cut for a located prefix (owned or validation; `:97-138`). `RuntimeEventCalculusDerivation.advance` (`:243-249`) passes `this.priorEvents`, which `memoize` (`:259`) extends for validated prefixes only. `forkAt` (`:188-212`) builds the fork with an empty `priorEvents`, so a fork of a validated source gives its first steps no prior event, and the `basis_admitted` worksite dependencies (`isWorksiteFileReplaceRequest` → `addPhysicalDependencies`, `:112-114`) are not there. Production forks only through `eventCalculusDerivation` (`:286-292`) for a validation prefix over an owned base (`isValidationRuntimeEventPrefix` requires `isOwnedRuntimeEventPrefix(proof.base)`, `event_prefix.ts:95-105`), which never takes the carried path: verify with the grep of `forkAt` and `eventCalculusDerivation` callers and state the reach exactly (the step-8 record's "module-test only" claim, confirmed or corrected). `abg/replay.ts:1217` (`owned ? eventCalculusDependencies(prefix, event, []) : events`) is the replay consumer of the same function; its non-owned branch passes all events, the same meaning as the carried list.

(a) The trace table. For the first, one middle and the last differing cut: the event whose transition differs, the dependency set the warm fold gave it, the set the fork gave it, the dependency the step needed (the event kinds the `worksite_observation_current` initiation reads), and the member of the derivation that did not carry across the fork (`priorEvents`, and any other, named). State whether `holds`, `clippedFluentRefs`, `declippedPatternRefs` and the effect rows differ, and from which event on.

(b) The repair, `realization_refactor` in `abg/event_calculus.ts`. Two forms; take the first if its proof holds, else the second with the reason the first failed.

1. The validated path reads its dependencies as the located path does, by the exact selection from the before-event cut, and the derivation carries no `priorEvents`: nothing is carried beside the prefix, so a fork inherits nothing (the owner's log principle: the reader is a fold over the prefix). Proof: at every cut of every fixture `t287-calculus-fold` holds (U1, the lifecycle fixtures, counterexamples A and B) and of every lane importing `event_calculus` that folds a validated prefix, the cold fold and the warm projection with exact dependencies equal the ones with the all-prior list: `holds`, clipped, declipped and every effect row (the recorded calculus effects under D1). If any fixture shows the exact selection missing a dependency the all-prior fold used, name the event kind and the missing dependency and stop: that is a selector defect whose repair changes recorded effect rows. If the third parameter of `eventCalculusDependencies` becomes unused, remove it and restate its callers (`abg/replay.ts:1217`; `t287-calculus-fold:31`; `t287-native-work-unknown-effect:48`, `:129`; `t287-native-work-currentness-consumers:672`, `:749`, `:921`, `:1037`, `:1170-1171`); a parameter kept and ignored is not accepted.
2. The fork inherits its base's prior events through the cut (the base's list sliced to the base count, recursively through a fork of a fork).

Either way `forkAt` leaves the source state unchanged (`t287-calculus-fold:113`) and the derivation keeps one owned state (`:107`).

(c) The proof in `test_env/tests/t287-calculus-fold.test.mjs`: the end-to-end fork assertion restored for validated sources, at every cut of `streaming` (streaming case) and of `validated` (P-FOLD case): `forkRuntimeEventCalculusAtForModuleTest(source, cut, source)` equals `deriveRuntimeEventCalculusProjection(source)` in holds, clipped, declipped and effect rows, as `:68` asserts for `owned`; the at-cut assertion (`:111`) stays; one more case, a fork at one cut advanced to a later middle cut equals the warm projection there. Titles and counts of the P-FOLD, streaming and TD-07 cases unchanged. A scratch mutant with the repair reverted shows the restored assertion red; cite its first error.

(d) Reach: the lanes importing `abg/event_calculus` or `abg/calculus` (nineteen tests and five supports at this head; list them from `git grep`), before and after, with every red's first error and its attribution; `m5-event-calculus-runtime`, `t287-ordered-reconstruction`, `t287-native-work-unknown-effect` and `t287-native-work-currentness-consumers` named. `t287-c0-post-publication-failure` runs 23 minutes: run it once after and cite C-6's before count (31/31).

**Item 2: records (proposals; the Executive places them).** The ticket's Phase C decisions row "Module-test fork from a middle cut" gets its outcome; the design sentences that state the fork law or the derivation's copies (`event_calculus.ts:140-143` comment; §4.4 and the P-FOLD sentence of `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, cite the lines) and the restatement each needs if the realization changes what they say. No design, register or ticket edit by the Worker.

**Item 3: gates and lanes.** `npx tsc --noEmit -p tsconfig.json`; `npm run lint:imports`; `npm run lint:lifecycle`; `npm run lint:evidence`; `npm run build` rc 0 and `git status --short` with no regenerated diff (`product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` regenerated and committed when a `code/src` edit changes them). Lanes one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`, before (head) and after: `t287-calculus-fold`, `t287-r4-aba-retry`, and the item 1(d) list. Table: lane, item, tests/pass/fail/skipped before and after, red or skip identities with first error, attribution.

Grant: `code/src/abg/event_calculus.ts`; `code/src/abg/replay.ts` at the `:1217` call site only, if the signature changes; `test_env/tests/t287-calculus-fold.test.mjs`; the named test call sites if the signature changes; `test_env/support/developer-mini-product.mjs`; `test_env/falsifiers/runtime-f09-worker.mjs` (item 0 (b) only); the two regenerated files; this record (append only, your section). No edit to `abg/calculus/*`, `abg/event_prefix.ts`, `abg/event_store.ts`, `abg/event_contract_profiles.ts`, `hog/*`, `public/*`, design, register or ticket; no deletion of a tracked path; never walk `.ai-workspace/` (the evidence volume); scratch under `scratchpad/c7/` only.

Stop (write it in the Return, keep the rest moving): any event kind, payload key, failure class, Public export or Product contract change; a change to any recorded effect row at any cut of any fixture; a selector dependency missing (form 1 fails); item 0's lane red past fixture verification on a `code/src` defect.

Return contract: one commit on `main` with the first line `C-7: the fork trace: a fork of the calculus derivation at any cut, advanced to any later cut, equals the warm projection there; the mini product fixture verifies and the cold held-return witness runs` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`; never push. Append `## C-7 return` at the end of this record: the first sentence says closed, or names the gap; item 0's fixture repair and the witness's lane, count and assertion lines; the trace table (a); the repair (b), its form and its proof; the restored assertions (c) and the mutant's first error; the reach (d); item 2's proposals; item 3's tables; deviations from this wording; findings outside the grant; stops. Nothing above your section is edited.

## C-7 return

Base `e08d7db74`. Worker: Opus 5.5 at xhigh. The commit carrying this section is the C-7 commit. Scratch root: `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c7/`, written `scratch/c7/` below.

Not closed: the cold held-return witness does not run, because the F09 worker's own program-validation and capability-grant calls are stale (not `code/src`); item 1 is closed. The fork law holds: a fork of the calculus derivation at any cut, advanced to any later cut, equals the warm projection there for validated, streaming and owned sources, effect rows included. Form 1 was taken and proved by a dual run over the 16 reach lanes that fold a validated prefix: 21,013 validated fold steps, 0 mismatches. In item 0 the mini product now verifies and installs, but `t287-r4-aba-retry` is still red past both, at program validation inside the F09 worker, so the witness stays in scratch. The commit's first line keeps the activation's text up to "the mini product fixture verifies" and states that the witness does not run (deviation 1).

### Item 0: the C-6 steel thread

**(a) The fixture repair** (`test_env/support/developer-mini-product.mjs`). Three changes, each forced by a Product rule.

1. **The capability definition graph.** The support writes the graph asset at `CAPABILITY_DEFINITION_GRAPH_ASSET_PATH`. It writes the graph's coordinate into the manifest (`capabilityDefinitionGraph`, with the asset locator) and into the contribution manifest, as `registered-graph-selection.mjs:55-64`, `:130` and `:179` do. The variant products (`materializePublicationVariant`) spread both manifests and copy the source tree with the asset, so they carry the same coordinate and asset.
2. **No declared capability** (deviation 2). The activation asked for a graph that covers `developer.example.capability.greeting@5`. No graph can, for two reasons:
   - Verification builds the expected graph from ABG's own register, over the catalog's flat coordinates (`product/verify_product.ts:2616`). The register projects no capability for a developer contract (`capabilityRefsForContract`, `shared/capability_contracts.ts:107`).
   - Verification then requires each catalog row's `capabilityIdentities` to equal that projection (`:2620-2636`; this is the `catalog_mismatch` C-6 hit). It also requires the graph's ids to equal `declaredCapabilityRefs` (`:2638-2650`, and `:866-907` for the verified artifact).

   So the mini product's graph is the empty graph, its catalog row carries `capabilityIdentities: []`, and its manifest carries `declaredCapabilityRefs: []`. Nothing reads the removed identity: `git grep` finds it only in this support.
3. **The managed ABG dependency** (deviation 3). Once verification passed, installation refused with `dependency_lock_mismatch` ("materialized managed Product dependencies differ from the selected resolved lock", worker `:983`).
   - The manifest declares a `requires` dependency on ABG. `installProduct` checks that this dependency is materialized under the target root and matches its lock row (`product/install_product.ts:256-296`). The mini package carried no npm dependency.
   - The support now packs ABG from `packageRoot` and writes `dependencies: { "@abiogenesis/typescript-tenant": "file:<archive>" }` into the mini package. The registered-selection, language-smoke and language-structural supports do the same.
   - The pack is deterministic (two packs gave the same sha256) and costs about 3 s.

**Result on the head build** (support repaired, no `code/src` change).
- `manifest_malformed` is gone, fixture verification passes, and both installs materialize.
- The lane is red at program validation in `constructP1Environment` (`runtime-f09-worker.mjs:1138`). First error: `static_validation_refusal` `raw_subject_mismatch`, "Program validation accepts package-admitted raw values only".
- Count: 1/0/1/0 before and after. Logs: `scratch/c7/before/`, `scratch/c7/item0b/`, `scratch/c7/after/`.

**Why this is not `code/src`, and where it stops.** The worker keeps a private `rawProgramInput` (`:87-128`) in a superseded shape:
- it passes `publication` where `ProgramValidationInput` (`validator/validation.ts:502-514`) takes `programPublication` and `declarationBasisDigest`;
- it omits `evaluators` and `rules`.

The current form is the support's `rawProgramInput` (`root-installed-environment.mjs:140-167`). I ran two scratch probes, each a temporary edit of the worker that I reverted at once (logs `scratch/c7/probe_f09_1/`, `scratch/c7/probe_f09_2/`):
1. With `programPublication` and `declarationBasisDigest`, the error becomes `invalid_reference`, "GTL Program declarations do not satisfy the declared static contracts". This is the validator's catch-all; `evaluators` and `rules` are still absent.
2. With the support's full shape, the worker throws at `product/invocation.js:577`, "capability grant requires exact workspace, policy, actor, and definition authority". The call is the worker's `product.constructCapabilityGrant(policy, actorRef)` (`:1221-1222`), which omits the operation and the definition authority the current constructor requires (compare `constructInstalledStartCall` in `registered-graph-selection.mjs`).

Each layer is stale test code in the worker, and the worker is outside the grant except for (b). How many layers lie past the third is unknown. **Stop 1**, below.

**(b) The witness: not committed.**
- The C-6 text applies cleanly. `diff` against the committed falsifier shows additions only (`scratch/c7/witness.diff`: 239 lines after `:3356`, plus `...coldReturn` at `:3643`), and `patch` reproduces the C-6 file byte for byte.
- It cannot run, because the worker fails at `:1138`, before the hold. The falsifier is committed unchanged.
- In the applied copy its assertions sit at `:3394-3583`; `coldReturn` is built at `:3584` and spread into the worker's result at `:3643`.
- The witness text stays at `scratchpad/c6/runtime-f09-worker.witness.mjs`, with the applied copy at `scratch/c7/runtime-f09-worker.witness-applied.mjs`.

### Item 1(a): the trace

**Cause verified.** Three pieces at head combine:
- `eventCalculusDependencies` (head `abg/event_calculus.ts:90-139`) returned the carried list whole for a `validated_runtime_event_prefix` (`:96`). For a located prefix it returned the exact selection from the before-event cut.
- The derivation carried `priorEvents` (`:151`). `memoize` extended it for validated prefixes only (`:259`), and `advance` passed it (`:246`).
- `forkAt` (`:188-212`) builds the fork with an empty list.

So step k of a fork of a validated source read only the events from the cut to k-1.

**No other member was missing.**
- `forkAt` carries the holds, run ids, clipped and declipped refs, probe and interruption scopes and the ordinal through the cut, and `advance` sets the source.
- The repair removes only the list. After it, the fork equals the warm projection at every pair of cuts of U1, for validated, streaming and owned sources (item 1(c)).
- U1 has no probe or interruption event, so the carry of those scopes rests on reading.

**Reach.**
- `forkAt` has two callers: `eventCalculusDerivation` (head `:290`, now `:292`) and the module-test function (`:299`).
- In production it forks only a validation prefix. The fork's base comes from `runtimeEventValidationBase` through `selectLocatedSubset` (`event_prefix.ts:102-107`, `:139-147`), which returns an owned or a validation prefix, and `isValidationRuntimeEventPrefix` requires an owned base (`:95-100`).
- So both the base derivation and the fork advance only over located prefixes, which already took the exact path. The step-8 record's "module-test only" is confirmed.
- `abg/replay.ts:1217` is the other consumer of `eventCalculusDependencies`. Its non-owned branch passes every event, as before.

**Table.** Source: the U1 store, 22 events (`scratch/c7/trace_probe.test.mjs`, log `trace_probe.log`). The probe found 20 differing cuts, ordinals 2 to 21. Column meanings:
- "Warm gave": the validated derivation at head, which passes every prior event.
- "Fork gave": `forkRuntimeEventCalculusAtForModuleTest(source, cut, source)` at head.
- "Needed": the exact selection `eventCalculusDependencies` gives the same event over the owned prefix.

| Cut | Step whose transition differs | Warm gave | Fork gave | Needed (exact) | Missing from the fork | Effect-row difference | Holds, clipped, declipped |
|---|---|---|---|---|---|---|---|
| 2 `invocation_admitted` (first) | 5 to 11, each a `basis_admitted` with a worksite request | ordinals 1..k-1 | 3..k-1 | `2:invocation_admitted`; for 6..11 also the earlier bases 5..k-1 | `2:invocation_admitted` | warm initiates `basis_admitted(...)` and `worksite_observation_current(...)`; the fork initiates `basis_admitted(...)` only | holds differ from event 5 on (five `worksite_observation_current` fluents missing at the end); clipped and declipped equal |
| 12 `basis_admitted` (middle) | 20 `actor_process_termination_unconfirmed`; 22 `actor_invocation_failed` | 1..19; 1..21 | 13..19; 13..21 | 1, 2, 5..19; for 22 also 20, 21 | 1, 2, 5..12 | warm terminates one `worksite_observation_current(...)` at 20 and at 22; the fork terminates none | holds differ from event 20 on (the fork keeps that fluent); clipped and declipped equal |
| 21 `actor_process_exited` (last) | 22 `actor_invocation_failed` | 1..21 | none | 1, 2, 5..21 | all of them | warm terminates `worksite_observation_current(...)`; the fork does not | holds equal (the fluent ended at 20); clipped and declipped equal; only effect row 22 differs |

**What the steps needed.**
- The `basis_admitted` initiation of `worksite_observation_current` reads the `invocation_admitted` row named by the basis's `invocationAdmissionRef` (`projectWorksiteBasisObservation`, `c_call_outcome.ts:166-236`). Through `worksiteBasisMayEstablish` (`calculus/axioms.ts:688`) it also reads the earlier worksite causes.
- The unknown-effect terminations read the native task's support rows and the worksite requests of earlier bases (`projectNativeWorkRetiredObservations`, `axioms.ts:508`).

The member that did not carry across the fork is `priorEvents`, and only it.

### Item 1(b): the repair, form 1

`realization_refactor` in `abg/event_calculus.ts`:
- **Exact selection for every prefix kind.** `eventCalculusDependencies(prefix, event)` (`:92`) reads the exact selection from the before-event cut whatever the prefix kind. The validated early return is gone and the third parameter is removed. Callers restated: `abg/replay.ts:1217`; `t287-calculus-fold:29`; `t287-native-work-unknown-effect:48`, `:129`; `t287-native-work-currentness-consumers:672`, `:749`, `:921`, `:1037`, `:1170-1171`.
- **No carried list.** The derivation drops `priorEvents`, its push in `memoize` and the argument in `advance`, and `memoize` no longer takes the prefix. Nothing is carried beside the prefix, so a fork inherits nothing.
- **Lazy cut.** The before-event cut is taken only when a selector is read (`:97-98`). This is deviation 4.
- **Comment.** The class comment (`:142-147`) gains one sentence: each step reads its dependencies from the prefix, and nothing else is carried beside it.

Invariants kept:
- `forkAt` leaves the source state unchanged (`t287-calculus-fold:143`, green).
- The derivation keeps one owned state (`:132`, green).
- No event kind, payload key, failure class, Public export or Product contract changes. `eventCalculusDependencies` is `@internal`, and no barrel exports it.

**The proof: a dual run over the reach lanes.**
- *The patch* (`scratch/c7/apply_dual.py`, scratch only, stripped before the clean build). It instrumented the repaired derivation. At every step of every validated-prefix fold it computed `effectOf` on the same state twice, once with the exact dependencies and once with every prior event of the prefix, and logged any difference per process.
- *What it covers.* Equal effects at every step make every state, holds, clipped and declipped list and effect row equal. That is the recorded calculus effect under D1.
- *Totals.* 21,013 steps compared, **0 mismatches**, over 16 lanes whose processes fold a validated prefix. The longest prefix had 131 prior events. Logs: `scratch/c7/dual/dual-*.jsonl`.

| Lane | Steps compared | Mismatches |
|---|---|---|
| `t287-native-work-currentness-consumers` | 9,129 | 0 |
| `t287-c0-post-publication-failure` (with its `runtime-retained-projections-worker` children) | 7,025 | 0 |
| `t287-calculus-fold` (U1, lifecycle fixtures, counterexamples A and B, forks) | 2,772 | 0 |
| `t287-route-reconstruction` | 1,191 | 0 |
| `t287-native-work-unknown-effect` | 231 | 0 |
| `m5-event-calculus-runtime` (with `runtime-preparation-refusal-worker`) | 164 | 0 |
| `t287-runtime-failure-diagnostic` | 157 | 0 |
| `m5-terminal-quiescence-owner` | 155 | 0 |
| `t287-lifecycle-failure-carrier` | 86 | 0 |
| `t287-native-frame-observation` | 27 | 0 |
| `t287-native-workspace-work` | 24 | 0 |
| `t287-r4-aba-retry` (the installed worker process; `C7_DUAL_LOG` reached it) | 16 | 0 |
| `t287-f04a-probabilistic-result-candidate`, `t287-runtime-activity-quiescence` | 14 each | 0 |
| `t287-authenticated-owner-values`, `t287-ordered-reconstruction` | 4 each | 0 |
| `t287-event-calculus-owner-continuation`, `t287-exact-prefix-projection-reuse`, `t287-native-event-time`, `t287-native-frame-route-conservation`, `t289-install-event-bodies`, `witness-run-stopped-definition-binding` | 0 (each is red at head before folding: required territory or fixture absent) | n/a |
| `t287-fh-hold-open` | no process (red at module load, head state) | n/a |

No selector dependency is missing, so form 1 holds and form 2 was not needed. The lane counts and first errors on the instrumented build equal head's (`scratch/c7/dual/summary.txt`).

### Item 1(c): the restored assertions

All in `test_env/tests/t287-calculus-fold.test.mjs`; the lane stays at 13 tests.

- **P-FOLD case, end to end** (`:82-95`). For `validated` and for `owned`, a fork at every cut advanced to the end equals `deriveRuntimeEventCalculusProjection(source)` in holds, clipped, declipped and every effect row (`forkView`, `:51`). The old owned-only assertion compared the view without effect rows; it is now this loop.
- **The one more case** (`:90-93`). A fork at every cut, advanced to every later middle cut, equals the warm projection there: 210 pairs per source. It sits inside the P-FOLD case, not in a new test.
- **Streaming case** (`:138-142`). A fork at every cut of `streaming`, advanced to its end, equals the warm end. The at-cut assertion (`:135-137`) stays.
- **The reference fold** (`:36-46`, used at `:62-65`; deviation 5). At every cut of both sources, `foldStep` over every prior event equals the warm projection, and its step effects equal the projection's effect rows. This makes the form-1 proof durable in the lane for U1.
- **The cold fold** (`:27-31`) now uses the exact dependencies, as the class does.
- Titles and test count are unchanged, and so are the diagnostics of the P-FOLD, streaming and TD-07 cases.

**The mutant** (`scratch/c7/mutant.diff`, built and run, then reverted and rebuilt). It is the repaired file with the carried list restored for validated prefixes in `advance` (`priorEvents` member, the push, the validated branch). The lane went to 13/11/2/0:
- The cold and reference folds still agree at every cut.
- First error: `validated: fork at 2 advanced to the end equals warm`; the diff lists the `worksite_observation_current` fluents missing from the fork's holds.
- The streaming case fails at `streaming: fork at 2 advanced to the end equals warm`.

Log: `scratch/c7/mutant/t287-calculus-fold.log`.

### Item 1(d): reach

**Lanes in the reach.**
- `git grep -l -E "abg/event_calculus|abg/calculus" -- test_env/` gives 19 tests: `m5-event-calculus-runtime`, `m5-terminal-quiescence-owner`, `t287-authenticated-owner-values`, `t287-c0-post-publication-failure`, `t287-calculus-fold`, `t287-event-calculus-owner-continuation`, `t287-f04a-probabilistic-result-candidate`, `t287-fh-hold-open`, `t287-lifecycle-failure-carrier`, `t287-native-frame-observation`, `t287-native-work-currentness-consumers`, `t287-native-work-unknown-effect`, `t287-native-workspace-work`, `t287-ordered-reconstruction`, `t287-route-reconstruction`, `t287-runtime-activity-quiescence`, `t287-runtime-failure-diagnostic`, `t289-install-event-bodies`, `witness-run-stopped-definition-binding`.
- It also gives 5 supports: `t287-exact-prefix-projection-reuse`, `t287-native-event-time`, `t287-native-frame-observation`, `t287-native-frame-route-conservation`, `t287-native-work-currentness-consumers`.
- It also gives the falsifier `runtime-f09-worker.mjs`, which imports the installed `event_calculus.js`.
- Three tests reach the calculus only through those supports, and I added them: `t287-exact-prefix-projection-reuse`, `t287-native-event-time` and `t287-native-frame-route-conservation` (deviation 6).

**Results.**
- Every lane has the same counts, red identities, first errors and skip identities before and after. The comparison is in `scratch/c7/compare.py`.
- The four named lanes: `m5-event-calculus-runtime` 19/13/5/1 both runs, with the same five reds; `t287-ordered-reconstruction` 7/0/4/3 both; `t287-native-work-unknown-effect` 10/10 both; `t287-native-work-currentness-consumers` 4/4 both.
- `t287-c0-post-publication-failure` ran once, on the instrumented build: 31/31, against C-6's before count of 31/31 (deviation 7).

**Wall time.** It is unchanged except in two lanes:
- `t287-calculus-fold` went from 1 s to 5 s, because of the 486 added fork assertions.
- `t287-native-work-currentness-consumers` went from 36 s to 38 s.

### Item 2: records (proposals; the Executive places them)

- **(a) Ticket, Phase C decisions row "Module-test fork from a middle cut", outcome.** "Done at `<commit>` (C-7). Cause: the derivation carried a prior-event list for validated prefixes, and `forkAt` did not inherit it. Form 1: every prefix kind reads its exact dependencies from the before-event cut, and nothing is carried beside the prefix. A fork at any cut, advanced to any later cut, equals the warm projection there, effect rows included (`t287-calculus-fold`: validated, streaming, owned). The exact selection equals the fold over every prior event at every validated fold step of the 16 reach lanes that fold a validated prefix (21,013 steps, 0 mismatches; 7 reach lanes fold nothing before their head red). The defect reached module tests only."
- **(b) Design §4.4** (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:191`).
  - After "and copies no fold state;" add: "each step reads its dependencies from the cut before the event by the exact selection (`eventCalculusDependencies`, `abg/event_calculus.ts:92`), for every prefix kind, and the derivation carries nothing beside the prefix, so a fork advanced from a cut folds as its base did;".
  - Restate the line cites: `abg/event_calculus.ts:240` becomes `:243`; `:332` becomes `:334`; `:279` becomes `:281`.
  - Restate the `t287-calculus-fold` cites: `:267` and `:284` become `:299` and `:316` (the TD-06 tests, already two lines off at head, at `:269` and `:286`); `:365` becomes `:395`; `:432` becomes `:462`.
- **(c) P-FOLD** (`:640`). Replace "cold replay equals warm fork at every cut" with: "the cold fold equals the warm projection at every cut, and a fork at any cut, advanced to any later cut, equals the warm projection there in `holds`, `clippedFluentRefs`, `declippedPatternRefs` and effect rows, for validated, streaming and owned sources; the exact dependency selection gives the same transitions as every prior event".
- **(d) The fold-row falsifiers** (`:270`, `:284`). "a cut where cold replay and the warm fork differ" may read "a cut, or a fork at a cut advanced to a later cut, where cold replay and the warm projection differ". This is optional, since the current wording is not false.
- **(e) No change needed** at `:114` ("`forkAt` copies it at a cut") or `:524`.
- **(f) The code comment** at `event_calculus.ts:140-143` is restated in this commit (`:142-147`), inside the grant.

### Item 3: gates and lanes

**Gates**, run on the final tree:

| Gate | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | rc 0 |
| `npm run lint:imports` | rc 0 (28 shared modules) |
| `npm run lint:lifecycle` | rc 0 (284 modules, 7 allow-listed sites, no offender) |
| `npm run lint:evidence` | rc 0 (691 mirror roots inventoried, no new copy; 1,739 listed paths over 6,000,000 bytes, no other) |
| `npm run build` | rc 0. It regenerates `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`, because the `code/src` edits change the product content digest; both are committed. A rebuild after staging leaves no tenant diff. |

**Lanes.** Each lane ran alone with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`. "Before" is head `e08d7db74` after `npm run build`; "after" is the final tree. Counts are tests/pass/fail/skipped. Logs: `scratch/c7/before/`, `scratch/c7/after/`, and `scratch/c7/dual/` for the instrumented build.

| Lane | Item | Before | After | Reds or skips, first error | Attribution |
|---|---|---|---|---|---|
| `t287-calculus-fold` | 1 | 13/13/0/0 | 13/13/0/0 | none | fork assertions restored |
| `t287-r4-aba-retry` | 0 | 1/0/1/0 | 1/0/1/0 | before: worker `:952` `product_verification_refusal` `manifest_malformed`; after: worker `:1138` `static_validation_refusal` `raw_subject_mismatch` | item 0 moves the red past verification and installation; the rest is the stale worker (stop 1) |
| `m5-event-calculus-runtime` | 1(d) | 19/13/5/1 | 19/13/5/1 | four tests (A5-F10 CCall opening, Run HoldsAt reopen, `runtime_failure_observed` terminates, `run_stopped` throws): `abg.openCall is not a function`; terminal projection rows: `runtime_failure_observed/runtime_invocation_active` `false !== true`; skip: nominal prefix reuse | head state, unchanged |
| `m5-terminal-quiescence-owner` | 1(d) | 7/7/0/0 | 7/7/0/0 | none | |
| `t287-authenticated-owner-values` | 1(d) | 3/1/1/1 | 3/1/1/1 | "Values have same structure but are not reference-equal"; one environment-gated skip | head state, unchanged |
| `t287-c0-post-publication-failure` | 1(d) | 31/31/0/0 (C-6) | 31/31/0/0 (instrumented build, 1,376 s) | none | deviation 7 |
| `t287-event-calculus-owner-continuation` | 1(d) | 1/0/1/0 | 1/0/1/0 | file load: "exact preimage territory and a digest-bound CLOSED JSONL fixture are required" | head state, unchanged |
| `t287-f04a-probabilistic-result-candidate` | 1(d) | 2/1/1/0 | 2/1/1/0 | `'World' !== 'Hello Ada'` (strict equal) | head state, unchanged |
| `t287-fh-hold-open` | 1(d) | 1/0/1/0 | 1/0/1/0 | `ERR_MODULE_NOT_FOUND`, the installed bootstrap under `.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-17/` | head state, unchanged |
| `t287-lifecycle-failure-carrier` | 1(d) | 5/5/0/0 | 5/5/0/0 | none | |
| `t287-native-frame-observation` | 1(d) | 8/1/3/4 | 8/1/3/4 | "explicit proof-local territory"; `ERR_INVALID_ARG_TYPE` (path undefined); third red "The expression evaluated to a falsy value"; four environment-gated skips | head state, unchanged |
| `t287-native-work-currentness-consumers` | 1(d) | 4/4/0/0 | 4/4/0/0 | none | call sites restated |
| `t287-native-work-unknown-effect` | 1(d) | 10/10/0/0 | 10/10/0/0 | none | call sites restated |
| `t287-native-workspace-work` | 1(d) | 38/37/0/1 | 38/37/0/1 | one environment-gated skip | |
| `t287-ordered-reconstruction` | 1(d) | 7/0/4/3 | 7/0/4/3 | falsy `assert.ok`; two "not reference-equal"; "exact held object, after physical byte authentication"; three environment-gated skips | head state, unchanged |
| `t287-route-reconstruction` | 1(d) | 10/8/0/2 | 10/8/0/2 | skips `P0_RETAINED_NATIVE_SCRATCH` unset | |
| `t287-runtime-activity-quiescence` | 1(d) | 1/1/0/0 | 1/1/0/0 | none | |
| `t287-runtime-failure-diagnostic` | 1(d) | 17/17/0/0 | 17/17/0/0 | none | |
| `t289-install-event-bodies` | 1(d) | 4/0/4/0 | 4/0/4/0 | "explicit isolated proof territory and digest-bound retained history required"; two `ERR_INVALID_ARG_TYPE`; "explicit predecessor package and digest-bound retained history required" | head state, unchanged |
| `witness-run-stopped-definition-binding` | 1(d) | 7/0/7/0 | 7/0/7/0 | falsy `assert.ok(territory)` (all seven) | head state, unchanged |
| `t287-exact-prefix-projection-reuse` | 1(d), support | 2/0/1/1 | 2/0/1/1 | "explicit fresh proof territory required"; one skip | head state, unchanged |
| `t287-native-event-time` | 1(d), support | 6/0/4/2 | 6/0/4/2 | "explicit absolute proof territory required" (two), "explicit proof territory required", "exact rejected paired producer required"; two skips | head state, unchanged |
| `t287-native-frame-route-conservation` | 1(d), support | 3/0/3/0 | 3/0/3/0 | falsy assertion; `ERR_INVALID_ARG_TYPE`; falsy assertion | head state, unchanged |

### Deviations from the activation's wording

1. **The commit's first line.** The activation fixes it as ending "the mini product fixture verifies and the cold held-return witness runs". The witness does not run (item 0), so the commit keeps the fixed text through "the mini product fixture verifies" and ends "; the cold held-return witness does not run (stale F09 worker, stop 1)". The `C-7: the fork trace:` prefix is unchanged. The commit body states the item 0 gap.
2. **No declared capability.** The mini product declares no capability, so its graph is empty and covers nothing; the reason is in item 0 (a)2. The activation asked for a graph covering `developer.example.capability.greeting@5`, which the verification law does not admit for a developer contract.
3. **The managed ABG dependency.** Item 0 also repairs installation, not only verification, inside the granted support.
4. **The lazy before-event cut.** For an event absent from the prefix whose kind reads no selector, `eventCalculusDependencies` now returns `[]`. At head the located path refused at the eager cut, and the validated path returned the carried list. The fold never passes an absent event. An absent event whose kind reads a selector is still refused at the cut.
5. **Test additions.** The test adds the reference fold (every prior event, effect rows included) as the durable form-1 proof. It realizes the "one more case" as every (cut, later middle cut) pair inside the P-FOLD case, not as a new test, so the count stays at 13. The owned end-to-end assertion now also compares effect rows.
6. **Extra lanes.** The reach adds the three tests that reach the calculus through the supports, and `t287-r4-aba-retry`.
7. **`t287-c0-post-publication-failure` ran on the instrumented build.** Its after count comes from that build, which differs from the final build by the logger only (stripped; `git diff` shows no `c7`, `effectOf` or `appendFileSync`). The run also gave its dual-run coverage. I did not run the lane a second time.
8. **Temporary worker edits.** Two scratch probes edited the granted worker and were reverted at once. The worker is committed unchanged.

### Findings outside the grant

- **The F09 worker is stale** against the current validator and product APIs: `rawProgramInput` (`:87-128`) and `constructCapabilityGrant(policy, actorRef)` (`:1221-1222`). Stop 1.
- **`abg/replay.ts:1217`'s non-owned branch** still passes every event. With form 1, `eventCalculusDependencies(prefix, event)` serves every prefix kind, so the ternary and the all-events list could go. I left them: this is a replay behaviour change with no proof run here.
- **Two design cites were already off at head.** §4.4's `t287-calculus-fold` cites `:267` and `:284` pointed two lines before the TD-06 tests (`:269`, `:286`).
- **Head reds.** All are unchanged and attributed in the lane table.

### Stops

1. **Item 0 past verification.** `t287-r4-aba-retry` is red in the F09 worker's own stale calls (test code, outside the grant except for (b)). The first is `rawProgramInput`; with that restated in scratch, the next is `constructCapabilityGrant` without its definition authority. The depth past that is unknown.
   - **Recommendation.** Grant one bounded package for `runtime-f09-worker.mjs`, stopping on the first `code/src` defect. It should:
     - use the support's `rawProgramInput` (`root-installed-environment.mjs:140`);
     - pass `constructCapabilityGrant` the operation, capability and definition authority, as `registered-graph-selection.mjs` does;
     - peel each further stale call up to the A-B-A hold;
     - then apply and commit the C-6 witness.
   - **Reversal.** Revert the worker. The support repair here stands either way.

No other stop:
- No event kind, payload key, failure class, Public export or Product contract changes.
- No recorded effect row changes at any cut of any fixture: 0 mismatches over 21,013 steps.
- No selector dependency is missing.

### What could not be verified

- **The probe and interruption scopes.** The fork's carry of probe and interruption scopes across a cut is shown by reading only, because U1 has no probe or interruption event.
- **Lanes red before any fold.** Seven reach lanes fold nothing before their head red, so the dual run covers no step there: `t287-fh-hold-open`, `t287-event-calculus-owner-continuation`, `t287-exact-prefix-projection-reuse`, `t287-native-event-time`, `t287-native-frame-route-conservation`, `t289-install-event-bodies`, `witness-run-stopped-definition-binding`.
- **Cost on long prefixes.** I measured no cost on validated prefixes longer than the lanes' (at most 131 prior events) beyond lane wall times. The lazy cut avoids the O(n) before-event cut on events that read no selector.
- **The witness.** It has not run.

## C-7 disposition (Executive, 2026-10-25)

Accepted at `2acb06fcf`. Executive check on that head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 7 allow-listed, no offender; `lint:evidence` 691 roots inventoried, no new copy, 1,739 listed paths over 6,000,000 bytes and no other; `npm run build` rc 0 and no regenerated diff; the Executive's own reproduction (`scratchpad/c7/fork_probe.test.mjs`, the U1 store, 22 events) gives 0 of 22 differing cuts for the validated and for the owned prefix, against 20 of 22 for the validated prefix at `e08d7db74`; the commit's nine files all in the grant (`abg/event_calculus.ts`, `abg/replay.ts` in one hunk at `:1217`, the three test files the signature change names, the mini product support, the two regenerated files and this record), the forbidden modules, the design, the register and the ticket untouched, no deletion, no three-argument caller of `eventCalculusDependencies` left in `code/src` or `test_env`, no derivation member `priorEvents` left (the remaining `priorEvents` names in `code/src` are parameters of the axiom and outcome selectors, not a carried list); lanes `t287-calculus-fold` 13/13 (5 s), `t287-r4-aba-retry` 1/0/1 (`static_validation_refusal` `raw_subject_mismatch` at the worker's program validation; `manifest_malformed` at fixture verification at head), `m5-event-calculus-runtime` 19/13/5/1 (head reds), `t287-ordered-reconstruction` 7/0/4/3 (head), `t287-native-work-unknown-effect` 10/10, `t287-native-work-currentness-consumers` 4/4, `t287-route-reconstruction` 10/8/0/2, `t287-runtime-failure-diagnostic` 17/17, `m5-terminal-quiescence-owner` 7/7, `t287-lifecycle-failure-carrier` 5/5, `t287-native-workspace-work` 38/37/0/1; the untracked set the two codex posts (`exec_check_C7.log`). One commit, parent `e08d7db74`, the Opus trailer; the falsifier `runtime-f09-worker.mjs` is in the grant and unchanged.

The Return's first sentence stands: the fork law holds and item 1 is closed; the cold held-return witness does not run. The package is accepted as what it did; the steel thread is carried once more, with the reason it moved.

Item 1 accepted. The cause is the one member the activation named, `priorEvents`, and no other: the fork carried holds, run ids, clipped and declipped refs, probe and interruption scopes and the ordinal, and after the repair the fork equals the warm projection at every pair of cuts. Reach confirmed as module tests only: production forks run only over located prefixes, which took the exact path at head. Form 1 taken, so the derivation carries nothing beside the prefix and the reader is the fold over it (the owner's log principle); the third parameter removed and its nine callers restated; the proof the dual run over the 16 reach lanes that fold a validated prefix, 21,013 steps and 0 mismatches between the exact selection and every prior event, so no recorded effect row moved and no selector dependency was missing. The restored assertions (486 fork pairs per source, effect rows included; the reference fold over every prior event kept in the lane as the durable form of the proof) and the mutant's first error (`validated: fork at 2 advanced to the end equals warm`) are accepted. The wall time moved in two lanes only (1 s to 5 s for the 486 assertions; 36 s to 38 s). Deviation 4 accepted: an event absent from the prefix whose kind reads no selector now gives `[]` where the located path refused at the eager cut; `eventCalculusDependencies` is `@internal`, the fold never passes an absent event, the forged-event case (`t287-native-work-unknown-effect:129`) gives `[]` as at head, and no recorded refusal is involved. Deviations 5 (the reference fold; the later-cut pairs inside the P-FOLD case, count 13 kept) and 6 (three support-reached lanes and `t287-r4-aba-retry` added to the reach) accepted. Deviation 7 accepted with the qualification the Worker states: `t287-c0-post-publication-failure` 31/31 was run once on the instrumented build, which differs from the final build by the stripped logger only (`git diff` shows no `c7`, `effectOf` or `appendFileSync`); the lane runs on the final build in the Phase C close run. Deviation 8 (two probes of the worker, both reverted) accepted.

Item 0 accepted as what it did. The mini product now verifies and installs: the support writes the empty capability definition graph and its coordinate (deviation 2 accepted: verification builds the expected graph from ABG's register, which projects no capability for a developer contract, `verify_product.ts:2616-2650`, and requires the catalog row and the manifest to agree with it, so the declared `developer.example.capability.greeting@5` could cover nothing and is read by no other file) and the managed ABG dependency (deviation 3 accepted: `installProduct` requires the declared dependency materialized and lock-matched, `install_product.ts:256-296`; the other product supports pack it the same way). The red moved from `:952` (`manifest_malformed`) past verification and installation to `:1138` (`raw_subject_mismatch`), inside the worker's own stale program-validation input, with the capability grant call stale behind it. The witness stays in scratch: untested code is not evidence (as at C-6). Deviation 1 accepted: the mandated first line asserted a fact that did not hold, and the Worker kept its fixed text through the fact that did hold and stated the gap; the Executive's wording was the error.

Stop 1 ruled. The F09 worker (`test_env/falsifiers/runtime-f09-worker.mjs`) is stale against the current validator and product constructors: a test-support defect, no contract or design decision, so it is discharged, not recorded. Ruling: C-8 item 0, with the witness: C-8 is the retry package and the A-B-A retry falsifier is its own steel thread. The carry is the third (C-5 residual, C-6 item 0, C-7 item 0); each moved the red to a later stage (verification, installation, program validation) and each was a different test-support defect. Reversal: none needed; the fixture repair stands under any outcome.

Finding ruled. `abg/replay.ts:1217` keeps two forms of one relation (`owned ? eventCalculusDependencies(prefix, event) : events`) where form 1 serves every prefix kind; the Worker left it for want of a proof run. The two forms are proved equal by the same dual run for every validated fold step the reach lanes take, so this is one line of debt with its proof in hand: C-8 item 0(c), with the condition that no replay lane moves. The two §4.4 cites to `t287-calculus-fold` that were already two lines off at head are restated in this bookkeeping commit with the others.

Not verified, accepted as stated: the fork's carry of probe and interruption scopes rests on reading (the U1 store has neither event); the seven reach lanes that are red at head before folding anything are covered by no dual-run step and are attributed at the Phase C close run; no cost was measured on validated prefixes longer than 131 events. On the last: the validated path now takes the before-event cut the owned path always took (lazily, only when a selector is read); TD-09 (C-13, the snapshot-copy and ancestor-walk census) counts that cut with the rest.

Records. The ticket's Phase C decisions row "Module-test fork from a middle cut" gets its outcome. Design §4.4 restated by the Executive from the Return's item 2(b): the sentence that each step reads its dependencies from the cut before the event for every prefix kind and the derivation carries nothing beside the prefix, with the line cites moved (`abg/event_calculus.ts:243`, `:281`, `:334`; `t287-calculus-fold:299`, `:316`, `:395`, `:462`); P-FOLD restated to the fork law for validated, streaming and owned sources, effect rows included, and the exact selection equal to every prior event; the two fold-row falsifiers name a fork advanced to a later cut. Register: a completion row; no debt row, since the fork was a decisions-table item, not a TD. Ticket: ledger, current package, `Next`.

## C-8 activation (Executive, 2026-10-25; the retry route cause (P2): a `route_mismatch` refusal's replay cause rides as a cold diagnostic subject through the recorded failure's existing diagnostic reference, the projection nullable and the refusal unchanged; with the C-7 residuals as item 0)

Base: the head carrying this activation (the C-7 bookkeeping commit). Worker: Opus 5.5 at xhigh, fresh. Scratch: `scratchpad/c8/`. Record: this file, append only, your section `## C-8 return`.

**Item 0: the C-7 residuals.**

(a) The F09 worker (`test_env/falsifiers/runtime-f09-worker.mjs`; lane `t287-r4-aba-retry`, 1/0/1 at head, about 75 s). The mini product fixture verifies and installs since `2acb06fcf`; the lane is red at the worker's own program validation (`:1138`): `static_validation_refusal` `raw_subject_mismatch`, "Program validation accepts package-admitted raw values only". The worker's private `rawProgramInput` (`:87-128`) is in a superseded shape: it passes `publication` where `ProgramValidationInput` (`validator/validation.ts:502-514`) takes `programPublication` and `declarationBasisDigest`, and it omits `evaluators` and `rules`; the current form is the support's `rawProgramInput` (`test_env/support/root-installed-environment.mjs:140-167`). Behind it (the C-7 Worker's reverted probes) `product.constructCapabilityGrant(policy, actorRef)` (`:1221-1222`) omits the operation, capability and basis the constructor takes (`product/invocation.ts:853-879`; the support forms `registered-graph-selection.mjs:302-318` and `:510-518`), and throws "capability grant requires exact workspace, policy, actor, and definition authority". How many stale calls follow is unknown. Restate each to the current support form, one at a time, importing the support's producer where one exists rather than keeping a private copy, and record the lane's first error after each; the worker's own assertions on diagnostic references (`:1718`, `:1731`, `:1790`, `:1971`, `:2645-2683`) and on the A-B-A comparison are kept unless a current form moves them, each named. If the lane is red on a defect in `code/src`, stop item 0 at that assertion with its first error, keep the restatement so far in the commit, and leave (b) in scratch.

(b) The witness. The C-6 text is `scratchpad/c6/runtime-f09-worker.witness.mjs`; the C-7 Worker's applied copy and diff are `scratchpad/c7/runtime-f09-worker.witness-applied.mjs` and `scratchpad/c7/witness.diff` (239 added lines after `:3356` and `...coldReturn` at `:3643` of the applied copy; the assertions at `:3394-3583`). It closes the store with `projectReopenAuthorityAndClose`, reopens it with `reopenEventStore`, derives the `HeldWorkflowSuspension` from the reopened log and definition inputs only, requires it to `canonicalEquals` `completion.parentSuspensions[0]`, requires `rehydrateParentReturnFrames` over the cold implementation set to give equal frames from the derived and the warm suspension, and checks three negatives (a closure body changed under its ref refused at `parent-runtime`; a changed `parentInput` and the same input re-sealed with its own digest refused at `workflow-relation`). Apply it on the restated worker, run the lane, commit it green; report the lane's count before and after and the assertion lines as committed. The suspension equality is restated if the owner retires the carried member (C-6 stop 1, pending); the frame equality and the negatives stand under either option. No `code/src` edit for item 0: a defect it reveals there is a stop with its first error.

(c) `abg/replay.ts:1217`: `owned ? eventCalculusDependencies(prefix, event) : events` keeps two forms of one relation; since `2acb06fcf` (C-7, form 1) `eventCalculusDependencies` reads the exact selection for every prefix kind, and the C-7 dual run showed the exact selection equal to every prior event at all 21,013 validated fold steps of the reach lanes. Restate to the one call for every prefix and remove the `owned` distinction if nothing else reads it. Proof: the lanes importing `abg/replay` (list them from `git grep`; `t287-route-reconstruction` 10/8/0/2, `t287-runtime-failure-diagnostic` 17/17, `m5-event-calculus-runtime` 19/13/5/1 with head reds named) unchanged in count, red identity and first error. If any moves, revert (c), keep it reverted, and name the lane and the step.

**Item 1: the retry route cause (P2; the retry clause of NW-DEBT-ADMISSION-DIAGNOSTIC-01).**

The ruling (ticket, Phase C decisions, owner agreed 2026-10-24): run under TD-17's convention: the cause rides as a cold diagnostic subject through the refusal's existing diagnostic reference; the projection stays nullable; the class and the refusal keys unchanged; if the refusal has no diagnostic member, adding one is a payload key change and stops for the owner.

The fact at head, to verify first. `projectHistoricalTraversalRoute` (`abg/traversal_route.ts:605-647`) catches the replay failure thrown by `projectValidatedReplayRouteAtPrefix` and returns `null` unless `propagateReplayFailure`, which only the staged path passes as true (`projectHistoricalTraversalRouteAtPrefix` `:602` and `projectAdmittedRoute`'s caller `:762` pass false); `projectHistoricalTraversalRoutesAtPrefix` (`:718-745`) returns `null` when any route projects `null`; `projectDeclaredCRetryFrontier` (`abg/retry.ts:2974`, the route read `:3070-3077`) returns `null` on that and on its other conditions; `admitRetryAttempt` (`:4913`; the frontier test `:4958-4970`) then refuses `route_mismatch` "retry attempt must extend the exact admitted retry route" with no cause. `RetryAdmissionRefusal` (`:341-352`) has `kind`, `schemaVersion`, `disposition`, `code`, `message`: no diagnostic member. The refusal leaves ABG through `admitOwnedRouteTransition`'s retry class (`traversal_route.ts:5391-5411`) and the hog records it with `failRetry` → `failTraversal` (`hog/traversal_failure.ts:70-96`) → `admitRuntimeFailure` (`abg/runtime_failure.ts:263`) as a `runtime_failure_observed` whose payload carries `stage`, `subjectDigest` and `diagnosticRef` (`:293-301`): the subject `{ stage, candidate }` is recorded as its digest, and the hog's diagnostic reference is the class-only `diagnostic://abiogenesis/hog/${code}@5` (`hog/retry_lifecycle.ts:644-650`, `:686-692`, `:710-716`, `:734-740`), so nothing of the refusal is readable cold but the class. The Public-returned form (`projectedRetryRefusal`, `:501-507`) carries the ABG refusal whole as `lowerCause`. TD-17's convention is the inline-retained subject: `constructRuntimeFailureDiagnosticRef(subject)` (`runtime_failure.ts:94`) encodes the subject in the reference, `admitRuntimeFailure` requires an inline reference to encode exactly the subject it digests (`:290-292`; for `failTraversal` that subject is `{ stage, candidate }`), and `readRuntimeFailureDiagnosticSubject` (`:99`) reads it cold; the leaf port's `deterministicFailure` builds such a subject (`diagnosticClassRef`, `stage`, `reason`, the cause sanitized by `sanitizeUndispatchedOwnerError`, `abg/event_contract_profiles.ts:80`, message and stack truncated as `:93-108` checks), and O-1 (C-3, `8566b228e`) carried `malformed_return`'s cause through that producer. The lane `t287-runtime-failure-diagnostic:208` asserts the nullable projection with the replay owner overridden to throw, and `git grep route_mismatch` finds the literal in no test or falsifier at head, so no lane drives the refusal.

(a) The trace table. For the `route_mismatch` refusal: each surface it reaches (the ABG refusal; `admitOwnedRouteTransition`'s result; the hog's recorded failure, payload and inline subject; the hog's Public-returned refusal), what each carries at head about the replay cause, and which lane reaches it (none, if none). Then the reasons `projectDeclaredCRetryFrontier` returns `null` other than the swallowed replay failure (from `:2974` on), since the subject must say which one it was. Then the hog sites that record a retry refusal (the four `diagnostic://abiogenesis/hog/${code}@5` sites named above) and which of them can carry `route_mismatch`.

(b) The run, `realization_refactor`. The Executive's reading of the ruling, to confirm or correct in the Return with the reason: the "refusal's existing diagnostic reference" is the recorded failure's `diagnosticRef`, which exists; the ABG refusal has no diagnostic member and gets none. Realization: at the hog site that records a `route_mismatch` retry refusal, the diagnostic reference becomes the inline-retained subject (`constructRuntimeFailureDiagnosticRef`) over exactly the `{ stage, candidate }` `failTraversal` digests, where the candidate carries the present class-only reference as `diagnosticClassRef` (so the class stays legible to every reader of the reference), the ABG refusal as recorded today with its keys unchanged, and the replay cause: the error class and code `sanitizeUndispatchedOwnerError` gives and the message truncated to the undispatched subject's limit, no stack; or `null` with the frontier's reason named when the frontier was `null` for another reason. The cause is re-derived at the refusal, not stored anywhere else: an `@internal` reader in `abg/traversal_route.ts` or `abg/retry.ts` (named in the Return) runs the route projection for the cursor's Run with `propagateReplayFailure` true over the same prefix and authority and returns the caught cause or `null`; `projectHistoricalTraversalRouteAtPrefix`, the plural and `projectDeclaredCRetryFrontier` keep their signatures and their results at every prefix; `admitRetryAttempt`'s refusal is unchanged. The `runtime_failure_observed` payload keys, the failure class, `RetryAdmissionRefusal`, `ProjectedRetryResumeRefusal` and every Public export are unchanged; the Public-returned refusal gains nothing (its `lowerCause` is the ABG refusal whole; state that the recorded failure's reference is not returned there). Which hog sites change: only those that can record `route_mismatch`, from (a); the other retry refusal codes keep the class-only reference unless the one producer serves them at no cost, named. If the realization needs a new key on any event payload, on either refusal type, a new failure class or a new Public export: stop, with the member named and the rest moving.

(c) The proof in `test_env/tests/t287-runtime-failure-diagnostic.test.mjs`: a case that drives `route_mismatch` through the hog recording site with the replay owner overridden to throw, as `:208` overrides `projectValidatedReplayRouteAtPrefix` (through `sourceOwner` on the hog module or, if the hog site cannot be reached by module override, through `admitRetryAttempt` with the failure recorded by `failTraversal` directly; say which), then reads the recorded failure cold (`readRuntimeFailureDiagnosticSubject` over the event's `diagnosticRef`; `projectRuntimeFailureEvidenceAtPrefix`) and asserts the subject names the stage, the refusal's code and message, the class reference, the sanitized error class and the message, and contains no stack and no private body; one negative: a `route_mismatch` whose frontier is `null` for a cursor reason gives the subject with the cause `null` and that reason named; the `:208` case unchanged. A scratch mutant with the class-only reference restored shows the new case red; cite its first error.

(d) Reach: the lanes importing `hog/retry_lifecycle`, `hog/traversal_failure`, `abg/retry`, `abg/traversal_route` or `abg/runtime_failure` (list them from `git grep`), before and after, with every red's first error and attribution; `t287-runtime-failure-diagnostic`, `t287-route-reconstruction`, `t287-undispatched-diagnostic`, `m5-retry-lifecycle-authority` (red at head) and `t287-r4-aba-retry` (item 0) named; every assertion on a `diagnostic://abiogenesis/hog/` literal in `test_env` kept or restated, named.

**Item 2: records (proposals; the Executive places them).** The ticket's Phase C decisions row "Retry route cause (P2, NW-DEBT-ADMISSION-DIAGNOSTIC-01)" gets its outcome; the register's crosswalk rows for NW-DEBT-ADMISSION-DIAGNOSTIC-01 (`TECHNICAL_DEBT_REGISTER.md:344`) and LEAF-FAILURE-DIAGNOSTIC-01 (`:309`) their restatement; the design sentences that state the retry refusal, the diagnostic reference or the nullable route projection (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`; cite the lines, §9.3 among them) and what each needs. No design, register or ticket edit by the Worker.

**Item 3: gates and lanes.** `npx tsc --noEmit -p tsconfig.json`; `npm run lint:imports`; `npm run lint:lifecycle`; `npm run lint:evidence`; `npm run build` rc 0 and `git status --short` with no regenerated diff (`product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` regenerated and committed when a `code/src` edit changes them). Lanes one at a time with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`, before (head) and after: `t287-r4-aba-retry`, `t287-runtime-failure-diagnostic`, the item 0(c) list and the item 1(d) list. Table: lane, item, tests/pass/fail/skipped before and after, red or skip identities with first error, attribution.

Grant: `test_env/falsifiers/runtime-f09-worker.mjs`; `code/src/abg/replay.ts` at the `:1217` site only (item 0(c)); `code/src/hog/retry_lifecycle.ts` at the recording sites; `code/src/hog/traversal_failure.ts` only if the subject composition must live there; `code/src/abg/traversal_route.ts` and `code/src/abg/retry.ts` for the `@internal` cause reader only, with no change to any existing function's signature or result; `code/src/abg/index.ts` for that reader's export if the hog needs the barrel; `test_env/tests/t287-runtime-failure-diagnostic.test.mjs`; the two regenerated files; this record (append only, your section). No edit to `abg/runtime_failure.ts`, `abg/event_contract_profiles.ts`, `abg/event_store.ts`, `abg/event_prefix.ts`, `abg/event_calculus.ts`, `abg/calculus/*`, `public/*`, design, register or ticket; no deletion of a tracked path; never walk `.ai-workspace/` (the evidence volume); scratch under `scratchpad/c8/` only.

Stop (write it in the Return, keep the rest moving): any event kind, payload key, failure class, Public export or Product contract change; a new member on `RetryAdmissionRefusal` or `ProjectedRetryResumeRefusal`; a change to any nullable projection's result at any prefix; item 0's lane red on a `code/src` defect; item 0(c) moving any replay lane.

Return contract: one commit on `main` with the first line `C-8: the retry route cause: a route_mismatch refusal's replay cause rides cold in the recorded failure's existing diagnostic reference, the projection nullable and the refusal unchanged; the F09 worker restated and the cold held-return witness runs`; if item 0 does not close, keep that text through "unchanged" and state the gap after it, as C-7's deviation 1 did; the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage by path; no `git add -A`; never push; never amend an earlier commit. Append `## C-8 return` at the end of this record: the first sentence says closed, or names the gap; item 0 (a) each restated call with the lane's first error after it, (b) the witness's lane count and assertion lines, (c) the replay lanes; the trace table (a); the run (b) with the sites, the reader and the subject's keys; the proof (c) and the mutant's first error; the reach (d); item 2's proposals; item 3's tables; deviations from this wording; findings outside the grant; stops. Nothing above your section is edited.

## C-8 return

Base `36b007242`. Worker: Opus 5.5 at xhigh. The commit carrying this section is the C-8 commit. Scratch root: `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/c8/`, written `scratch/c8/` below.

Not closed: item 1 stops at (b). The `route_mismatch` cause exists only over the staged prefix that the transition's transaction rolls back before the hog records the failure. It can reach the recorded failure's diagnostic reference only through a new member on `RetryAdmissionRefusal`, a named stop. No `code/src` edit was made for item 1, so there is no item 1(c) case. Item 0 is closed:

- the F09 worker is restated to the support's producers and to the current transport carrier;
- the cold held-return witness runs, and `t287-r4-aba-retry` goes from 1/0/1/0 to 1/1/0/0;
- `replay.ts:1217` reads the one call, and every replay lane is unchanged.

The commit's first line keeps the activation's structure and names the item 1 gap in place of the claim it could not make (deviation 1).

### Item 0: the C-7 residuals

**(a) The F09 worker, one restated call at a time.** The lane is `t287-r4-aba-retry`. Every step ran the whole lane; logs are `scratch/c8/item0/step-NN.log`. Counts are tests/pass/fail/skipped.

| Step | Restated call (head line → current form) | Lane after | First error after |
|---|---|---|---|
| head | none | 1/0/1/0 | `static_validation_refusal` `raw_subject_mismatch` at the worker's program validation (`:1138`) |
| 1 | `:1137` `validateProgram(rawProgramInput(...))` over the private copy → the support's `rawProgramInput` (`root-installed-environment.mjs:140-167`) | 1/0/1/0 | `TypeError: capability grant requires exact workspace, policy, actor, and definition authority` (`product/invocation.js:577`), from the worker's `constructCapabilityGrant(policy, actorRef)` (`:1222`) |
| 2 | `:1222-1243`, the grants and the authority → one `abg.operation.run.invoke` grant with `capabilityGrantBasis` `{ admittedInstalls, workspaceBinding, fixedPacket }`, passed to `constructCapabilityGrant` and `constructInvocationAuthority` (`product/invocation.ts:853-884`, `:1072-1145`) | 1/0/1/0 | `TypeError: Cannot convert undefined or null to object` in `sha256Canonical`, inside `admitInvocationWithRequest` (`invocation_admission.js:481`), from the worker's `abg.admitInvocation` (`:1273`): the call carries no `programPublication` |
| 3 | the whole private construction in `constructP1Environment` → the support's producers (detail below) | 1/0/1/0 | `AssertionError: ... 'blocked' !== 'held'` at `produceAba` (`assert.equal(completion.disposition, "held")`); the run stopped with `diagnostic://abiogenesis/c-call/result-contract-mismatch@5` |
| 4 | the attempt command's host carrier `{ type: 'result', subtype: 'success', result }` → `{ type: 'result', subtype: 'success', is_error: false, structured_output }` | 1/0/1/0 | the same assertion; blocked again, now on a transport `contract_failure` |
| 5 | the command's mode variable: the command reads `ABG_AX_F09_ATTEMPT_MODE`, and the worker no longer sets `ABG_AX_F09_MODE` | 1/0/1/0 | `assert.equal(signals[0], signals[2])` (`:2689` as committed): the two A signals differ |
| 6 | the command prints `attempt a`, `attempt b`, `attempt a`, `attempt 4` instead of the attempt number | 1/1/0/0 | none |

In step 3 the private construction is fixture verify and install (`:942-971`), catalog, program validation, grants, authority, invocation, resolution and execution basis. It is replaced by:

- `setupInstalledRootCatalog`, with `prepareAdditionalProducts` for the F09 fixture;
- then `setupInstalledRootExecutionBasis`, which runs `setupInstalledRootInvocation` and `setupInstalledRootResolution` (`root-installed-environment.mjs:168-1200`; committed at `:918` and `:960`).

Steps 3 to 6 supersede steps 1 and 2, and the text of steps 1 and 2 is not in the commit. The step 2 copy is `scratch/c8/item0/worker-after-step02.mjs`.

**The cause of the red in steps 3 to 5.** It was verified on kept event-log excerpts (`scratch/c8/item0/evidence/step03-events.json`, `step04-events.json`, `probe06-events.json`) and by reading the sites below. It is stale test input; it is not `code/src`.

1. Since `c7988f937` (2026-09-28), a structured request reads only the successful host carrier's `structured_output` (`abg/worker_transport.ts:303-318`). The command was last edited at `e4a9be06b` (2026-08-17) and printed `result:` only, so every attempt was `no_output`: `finalOutput` was `""` (`transport_contracts.ts:88`).
2. With the carrier restated (step 4), the native result assessment rejects the string value. The transport therefore fails with `contract_failure` (`transport_contracts.ts:66-75`).
3. The fixture's A-B-A branch (`test_env/falsifiers/runtime-f09-product.mjs:118-150`, outside the grant) turns any non-success into disposition `success` with a `developer_greeting_failure` candidate, a failed transport included.
4. Neither retry route takes that combination:
   - the transport-failure retry needs leaf disposition `failure` (`abg/c_call_outcome.ts:1191-1208`);
   - the payload-rejection retry needs a transport `success` (`:1438-1471`).
5. `admitResult` then rejects the success-class candidate (`c_call.ts:6880-6921`), and `stageBlockedOutcome` (`c_call_outcome.ts:1029-1050`) blocks. This is ABG refusing a Product that claims success on a failed transport.

One probe (`scratch/c8/f09/worker-probe06.mjs`) tested whether the old payload-rejection route is still reachable. It used a structured greeting with a wrong message. That passes the native assessment, so the transport succeeds, and the run still blocks the same way. The route is therefore not reachable through the transport for this fixture.

**What the restatement moves, named.**

- **The source class of the A-B-A signals.** It moves from `deterministic_output_rejection`, keyed on candidate digest, contract and diagnostic, to `probabilistic_transport`. The new stable source digests the request, the raw output, stdout and the artifacts (`c_call.ts:2077-2106`). The two A attempts therefore print identical bytes (step 6).
- **The assertions.** The A-B-A comparison (`:2689-2690`) is kept and exercised. The harness's `failureClasses` (three `contract_failure`, `runtime-f09.mjs:150`) is unchanged and passes.
- **The fixture's branch.** The fixture's `ABG_AX_F09_MODE` branch is no longer reached by this lane (findings outside the grant).

**The diagnostic-reference assertions the activation names** are `:1718`, `:1731`, `:1790`, `:1971` and `:2645-2683` at head. As committed they are `:1304`, `:1317`, `:1376`, `:1557` and `:2231-2280`.

- They sit in `advanceRetry`, `produceFrontier` and `inspectHandoff`, which only the `produce_frontier` and `inspect_frontier` actions reach.
- No lane runs those actions: `runAxF09` has no test.
- They are kept, unchanged and unexercised.

**Residual.** The private `rawProgramInput` (`:87-128`, with `requireRawAdmission` `:81`) remains. Its only caller is `loadInstalledRetryDependencies` (`:560`) on the `inspect_frontier` path.

- That consumer process gets `{ action, handoff }` only (`runtime-f09.mjs:266-269`, outside the grant). The handoff is strict by design: the worker checks its keys (`:1982-1995`), and the harness requires it closed (`runtime-f09.mjs:325-328`). The consumer therefore cannot locate the support module.
- Importing the support's producer there needs the harness to pass `supportPath` in the consumer input.
- The copy is the stale shape C-7 found. `inspect_frontier` would fail there if it were run.

**(b) The witness.** The 239 lines of `scratch/c7/witness.diff` (sha256 `bfca1b23bd046d0d7e4f56a088b5d1e08e37da28d61b94fb1061a61702bc16ee`) are applied after the held-replay assertion (`:2945`), with `...coldReturn` in the audit (`:3234`). The C-6 text `scratch/c6/runtime-f09-worker.witness.mjs` and the C-7 applied copy have the same digest, `b664ac7a2f2a600f0dc5dc8d8917ab21c485df3641127d6a8045b8fe07714639`.

Two restatements of the witness were each forced by a lane error:

1. **The owner root.** `environment.installedRoot` is the F09 fixture's install, at head (`:1104`) and now. The witness's owners (`abg/execution_basis`, `abg/traversal_cursor`, `abg/c_call`, `abg/open_call`, `gtl/materialize`, `hog/parent_rehydration`, `shared/value/index`) live in the tenant. `loadOwner` therefore reads `environment.tenantRoot` (`:2954`): the support's tenant install, returned at `:1042`.
2. **The log read** (step 07b, 1/0/1/0). It failed with `TypeError: Event Calculus requires a nominal validated immutable event prefix` at `rehydrateExecutionBasisAtPrefix`. The cold prefix was selected by the cliHost tenant (`installedAbg`) and read by the environment tenant's owners, and validated prefixes are nominal per owner module. The reopen, select and read now use `environment.abg` (`:2984-2994`).

Lane after: 1/1/0/0 (step 08b, 151 s). The after-run below repeats it. Two comment-only edits to the worker followed, and the lane ran once more on the committed file (sha256 `f8c44362e29580a0ff2076d97939d4f728401d400cb2ca18b5187d67e5579927`): 1/1/0/0, 150 s (`scratch/c8/item0/step-09-final.log`). The audit (`scratch/c8/f09/out-w08.json`) reports:

- `coldSuspensionEqualsWarm` true;
- `coldFramesEqualWarm` true, with 1 frame;
- closure field `closureScope` changed: refused at `parent-runtime`;
- changed `parentInput`: refused at `workflow-relation`;
- the same input re-sealed with its own digest: refused at `workflow-relation`.

Assertion lines as committed:

- the suspension: `:3107` and `:3111`;
- the frames: `:3129-3150`;
- the three negatives: `:3162`, `:3168` and `:3174`;
- the close: `:3185`.

The suspension equality holds with the carried member as it stands; C-6 stop 1 is still pending.

**(c) `abg/replay.ts:1217`** now reads `const priorRows = eventCalculusDependencies(prefix, event);`. The `owned` distinction stays, because other code reads it: `:936`, `:959`, `:1148`, `:1229`, `:1234` and `:1473`. `events` stays (`:1374`). Proof (item 3's table): every replay lane is unchanged. The replay lanes are the 17 that `git grep` finds importing `abg/replay` by module path, plus `t287-runtime-failure-diagnostic` (named by the activation), plus 10 lanes that load `replay.js` by a path join or through a support owner loader (marked "indirect" in the table). All 28 have the same counts, the same red and skip names, and the same first errors before and after. The three lanes the activation names are among them: `t287-route-reconstruction` 10/8/0/2, `t287-runtime-failure-diagnostic` 17/17/0/0, and `m5-event-calculus-runtime` 19/13/5/1 (head reds: four times `abg.openCall is not a function`, and `runtime_failure_observed/runtime_invocation_active`). (c) stays.

### Item 1(a): the trace

**Surfaces of a `route_mismatch` refusal at head.**

| Surface | Site | What it carries about the replay cause | Lane |
|---|---|---|---|
| ABG refusal | `RetryAdmissionRefusal` (`retry.ts:341-353`), built in `admitRetryAttempt` at `:4958-4970`. It is computed over `routeSuccessorPrefix`, the staged prefix holding the just-staged retry route (`traversal_route.ts:5391-5410`) | `code: "route_mismatch"` and a fixed message. No cause and no diagnostic member | none |
| Owned transition result | `admitTraversalTransitionUsing` (`traversal_route.ts:5479-5530`). The refusal returns at `:5410`, leaves the transaction as `RouteTransitionAbort` (`:5501-5503`) after the staged events roll back (`event_store.ts:4244-4265`), and is returned whole (`:5520`) | The same refusal. The staged route and its prefix are gone | none |
| Hog Public-returned refusal | `resumeProjectedRetry` → `projectedRetryRefusal` (`hog/retry_lifecycle.ts:195-221`, `:501-507`): `code: "retry_attempt_refused"`, with the ABG refusal whole as `lowerCause` | The class, and `route_mismatch` in `lowerCause.code`. No cause. The recorded failure's reference is not returned here | none |
| Hog recorded failure | `advanceOwnedRetryLifecycle` `:734-740` → `failRetry` (`:174-193`) → `failTraversal` (`hog/traversal_failure.ts:70-96`) → `admitRuntimeFailure` (`runtime_failure.ts:263`). This records `runtime_failure_observed` with payload `stage` `hog_traversal`, `subjectDigest` over `{ stage: "retry-resume", candidate: <the Public-returned refusal> }`, and `diagnosticRef` `diagnostic://abiogenesis/hog/retry_attempt_refused@5`, then throws `GraphTraversalFailure(diagnosticRef, receipt)` | Cold: the class `retry_attempt_refused` only. `route_mismatch` and everything else sit inside the digested subject, which is not readable | none |

`git grep route_mismatch -- test_env` finds nothing. No lane drives the refusal.

**Why `projectDeclaredCRetryFrontier` returns `null` (`retry.ts`, from `:2974`).**

| Lines | Reason |
|---|---|
| `:2982-2992` | Any of: the graph is not materialized; the cursor is not a candidate or is not admitted at the prefix; the graph or graph function differs; the retry depth is out of range |
| `:2998`, `:3000` | No enclosing `C.retry` context at the depth |
| `:3035-3053` | The attempt history fails: more attempts than budget; an attempt that does not project or derive its cursor; a mismatch in ordinal, boundary, budget, term path, task ordinal, input contract, retry path or coordinate; or a duplicate manifest |
| `:3062-3069` | A progress does not project, or there are more progresses than attempts |
| `:3070-3077` | The Run's historical route projections are `null`. This happens when any route projects `null`, which includes the swallowed replay failure (`traversal_route.ts:605-647`) |
| `:3105` | First attempt: no exact entry route to the cursor, a progress already present, or the Run or the locus not active |
| `:3156-3176` | A later attempt: the origin route or the progress does not match |
| `:3208-3309` | Per-attempt lineage fails: opened call, source lineage, CCall phase, judgment, continuation routes, target cursor, or a progress against an active attempt |
| `:3335-3451` | Retry history fails: a completed or prospective attempt's judgment, consumers, retry path or final lineage |
| `:3496-3515` | Inner-source lineage fails |

`admitRetryAttempt` also refuses `route_mismatch` on a frontier that is not `null`, in two cases (`:4958-4965`):

- the frontier is not `eligible`;
- its `nextAttempt`, current cursor or eligibility route (`admissionEventRef`, target cursor) differ.

**Hog sites that record a retry refusal** (`hog/retry_lifecycle.ts`). There are six sites, not the four the activation names. Its `:644-650` is now `:645-651`. The other cited lines hold.

| Site | Stage | Candidate | Can carry `route_mismatch` |
|---|---|---|---|
| `:567-573` | `retry-failure-plan` | `planRetryRuntimeFailureTransition` refusal | no |
| `:587-593` | `retry-blocked-route` | `proposeBlockedRoute` refusal | no |
| `:645-651` | `retry-blocked-transition` | refusal of the blocked route-class transition (no retry attempt is admitted) | no |
| `:686-692` | `retry-failure-transition` | `admitRetryRuntimeFailureTransition` refusal | no |
| `:710-716` | `retry-input-projection` | `projectOwnedExecutableRetryInput` refusal | no |
| `:734-740` | `retry-resume` | `ProjectedRetryResumeRefusal` `retry_attempt_refused`, with `lowerCause.code` `route_mismatch` | yes, nested |

The sole producer is `retry.ts:4968`, inside `admitRetryAttempt`. Its sole caller is `traversal_route.ts:5396`, on the retry-class branch. Two places build retry-class candidates: `hog/retry_lifecycle.ts:422`, recorded at `:734-740`, and `hog/structural_transition.ts:221`, recorded at `:270-276`. That second recording site is outside the grant (findings outside the grant).

### Item 1(b): the run: stopped

**The Executive's reading, confirmed.** The "refusal's existing diagnostic reference" is the recorded failure's `diagnosticRef`. That member exists, and the ABG refusal has no diagnostic member.

**The Executive's reading, corrected: the realization cannot be faithful at the hog.** The proposed reader re-derives the cause "over the same prefix and authority". The prefix the refusal was computed over is `routeSuccessorPrefix` (`traversal_route.ts:5392-5395`), which holds the staged retry route. The transaction rolls it back before the refusal leaves ABG (`:5501-5520`; `event_store.ts:4244-4265`). The hog site has only `retryTransition.successorPrefix`, which is durable and has no staged route. Over that prefix:

1. A replay failure on the staged route cannot be observed.
2. The frontier's eligibility test compares against the staged route's `admissionEventRef` (`retry.ts:4963`). The durable prefix lacks that route, so a frontier re-derived there names a reason that is not the refusal's.
3. Re-staging the route in a throwaway transaction does not give the same prefix either. The route event's `eventTime` is sampled natively at admission (`traversal_route.ts:4986-4988`).

The cause therefore exists only inside ABG's transaction. It can leave in one of two ways:

- on the refusal: a new member on `RetryAdmissionRefusal`;
- on a changed result of `admitOwnedTraversalTransition`, an existing function's result, which the grant excludes.

The ruling's own clause applies: "if the refusal has no diagnostic member, adding one is a payload key change and stops for the owner". Stop 1. No `code/src` was edited for item 1. `projectHistoricalTraversalRouteAtPrefix`, the plural, `projectDeclaredCRetryFrontier`, `admitRetryAttempt`, both refusal types, the payload keys, the failure class and every Public export are unchanged.

**What the owner would rule on.**

- **Option A.** A `diagnosticRef` member on `RetryAdmissionRefusal`, built at `retry.ts:4958-4970` inside the transaction. It would hold `constructRuntimeFailureDiagnosticRef` over a subject naming:
  - the class;
  - the sanitized replay cause, thrown by an `@internal` frontier reader with `propagateReplayFailure` true over the same staged prefix;
  - or the frontier's `null` reason from the table above.

  The hog site `:734-740` then builds its inline reference from the `{ stage, candidate }` that `failTraversal` digests. The candidate already holds the refusal whole as `lowerCause`, so the cause reads cold.
- **Option B.** A log-only reader at the hog over the durable prefix. It is exact for a replay failure of an earlier durable route. It is wrong for the staged route and for every eligibility reason. Not recommended.

### Item 1(c): the proof

Not done: there is no (b) to prove, and `t287-runtime-failure-diagnostic.test.mjs` is unchanged. The `:208` case still passes (17/17 after).

### Item 1(d): reach

The reach lanes are the lanes importing `hog/retry_lifecycle`, `hog/traversal_failure`, `abg/retry`, `abg/traversal_route` or `abg/runtime_failure` (`git grep`):

`generic-input-retention`, `m5-event-calculus-runtime`, `m5-retry-lifecycle-authority`, `r9-causal-result-closure`, `retained-route-cursor-transition`, `t287-fh-hold-open`, `t287-lifecycle-failure-carrier`, `t287-native-work-reacquisition`, `t287-public-terminal-projection`, `t287-qualification-fp-proof-delivery`, `t287-r6-retry-success-exit`, `t287-recursive-registered-selection`, `t287-retry-run-prefix`, `t287-route-reconstruction`, `t287-runtime-failure-diagnostic`, `t287-undispatched-diagnostic`, `t287-worksite-command-execution`, `t288-blocked-retry-entry`, `t288-scoped-retry-guard`, `t288-workflow-scope-conservation` and `w2-steel-single-start-closure` (21). `t287-r4-aba-retry` is also named by the activation and was run.

They ran before and after (item 3). Item 1 changed no code, so only item 0 could move them, and only `t287-r4-aba-retry` moved.

Every assertion in `test_env` on a `diagnostic://abiogenesis/hog/` literal is kept unchanged:

- `runtime-f09-worker.mjs:1304`, `:1317`, `:1376`, `:1557`, `:2231-2280` (unexercised, as above);
- `m5-retry-lifecycle-authority:523`;
- `t287-held-prefix:138`;
- `t287-recursive-registered-selection:133`;
- `t287-runtime-failure-diagnostic:44`, `:568`, `:616`, `:637`;
- `w2-steel-single-start-closure:92`, `:260`.

None of them keys on `retry_attempt_refused` or `route_mismatch`.

### Item 2: records (proposals; the Executive places them)

- **Ticket, Phase C decisions row "Retry route cause (P2, NW-DEBT-ADMISSION-DIAGNOSTIC-01)".** Proposed outcome: "C-8: stopped for the owner. The `route_mismatch` refusal (`retry.ts:4958-4970`) is computed over the staged prefix the route transition rolls back (`traversal_route.ts:5391-5410`, `:5501-5520`), so its cause can ride the recorded failure's reference (`hog/retry_lifecycle.ts:734-740`) only through a member on `RetryAdmissionRefusal`, which is the ruling's own stop. Options A and B are in the C-8 return. The nullable projections and the refusal are unchanged."
- **Register `TECHNICAL_DEBT_REGISTER.md:344`** (NW-DEBT-ADMISSION-DIAGNOSTIC-01). Proposed replacement for its last clause: "the retry route cause stopped at C-8: it exists only over the staged prefix, so carrying it needs a `RetryAdmissionRefusal` member (owner decision)".
- **Register `:309`** (LEAF-FAILURE-DIAGNOSTIC-01). No change from C-8: the leaf path is closed. Optionally add that the retry clause stays under NW-DEBT-ADMISSION-DIAGNOSTIC-01.
- **Design** (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`):
  - §9.3 (`:567-579`) and §10.6 row 6 (`:656`) state the inline diagnostic reference for process facts and leaf owner failures only.
  - No design sentence states the retry refusal, `route_mismatch`, the class-only `diagnostic://abiogenesis/hog/${code}@5` reference at the retry sites, or the nullable historical route projection.
  - Nothing there needs restating for C-8. If the owner takes option A, §9.3 gains one item: the retry attempt refusal's inline subject and its hog site.

### Item 3: gates and lanes

**Gates**, run on the final tree after `npm run build`:

| Gate | Result |
|---|---|
| `npm run build` | rc 0 (`scratch/c8/build-after.log`) |
| `npx tsc --noEmit -p tsconfig.json` | rc 0 |
| `npm run lint:imports` | rc 0: "28 modules under code/src/shared/ import only code/src/shared/ and packages" |
| `npm run lint:lifecycle` | rc 0: "284 modules under code/src; 7 allow-listed site(s), no offender" |
| `npm run lint:evidence` | rc 0: "691 tracked mirror roots under .ai-workspace, all inventoried; no new copy" |
| `git status --short` | The build regenerated `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` (one line each, from the `replay.ts` change); both are committed. No other diff. Neither file digests the worker, so the later comment-only worker edits regenerate nothing. Two untracked Codex comment files under `.ai-workspace/comments/codex/` were present before this package; they are not staged |

**Lanes.** Each lane ran alone with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`. "Before" is head `36b007242` after `npm run build` (`scratch/c8/before/`, `before2/`). "After" is the final tree (`scratch/c8/after/`, `after2/`). Columns: Item, lane, before, after, reds and skips with first error, attribution.

| Item | Lane | Before | After | Reds and skips (first error) | Attribution |
|---|---|---|---|---|---|
| 0(a)(b), 1(d) | `t287-r4-aba-retry` | 1/0/1/0 | 1/1/0/0 | before: 1 red, the F09 worker exits 1 at its program validation (`static_validation_refusal` `raw_subject_mismatch`); after: none | moved: item 0(a)(b), intended |
| 0(c), 1(d) | `t287-runtime-failure-diagnostic` | 17/17/0/0 | 17/17/0/0 | none | unchanged, green |
| 0(c), 1(d) | `t287-route-reconstruction` | 10/8/0/2 | 10/8/0/2 | 2 skip, same | unchanged |
| 0(c), 1(d) | `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 | 5 red, same names and first errors before and after: `TypeError [Error]: abg.openCall is not a function`; `AssertionError [ERR_ASSERTION]: runtime_failure_observed/runtime_invocation_active`; 1 skip, same | unchanged |
| 1(d) | `t287-undispatched-diagnostic` | 7/7/0/0 | 7/7/0/0 | none | unchanged, green |
| 1(d) | `m5-retry-lifecycle-authority` | 9/4/5/0 | 9/4/5/0 | 5 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: declared retry frontier lost owner relation: const calculus = deriveRuntimeEve`; `AssertionError [ERR_ASSERTION]: missing source boundary: export function openInteractionCCall(`; `AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:`; `AssertionError [ERR_ASSERTION]: missing source boundary: else if (initialInput?.resume !== undefined)`; `AssertionError [ERR_ASSERTION]: missing source boundary: /**` | unchanged |
| 0(c) | `m5-terminal-quiescence-owner` | 7/7/0/0 | 7/7/0/0 | none | unchanged, green |
| 0(c), 1(d) | `retained-route-cursor-transition` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `TypeError [Error]: traversal transition differs from its staged successor projection` | unchanged |
| 0(c) | `steel-basic-cli-source-replay` | 2/0/0/2 | 2/0/0/2 | 2 skip, same | unchanged |
| 0(c) | `t287-c2-owner-coordinate-reuse` | 6/0/6/0 | 6/0/6/0 | 6 red, same names and first errors before and after: `TypeError [Error]: child C2 source does not reproduce at its admitted preparation cut`; `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:`; `TypeError [Error]: operations.nativeWorkReacquisition is not a function` | unchanged |
| 0(c) | `t287-deferred-application-restoration` | 2/0/2/0 | 2/0/2/0 | 2 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: select the frozen S02 continuation-03 evidence carrier` | unchanged |
| 0(c) | `t287-event-body-encoding` | 14/14/0/0 | 14/14/0/0 | none | unchanged, green |
| 0(c), 1(d) | `t287-fh-hold-open` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `'test failed'` | unchanged |
| 0(c) | `t287-held-prefix` | 6/0/0/6 | 6/0/0/6 | 6 skip, same | unchanged |
| 0(c) | `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 | 4 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:`; `AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:`; `AssertionError [ERR_ASSERTION]: exact held object, after physical byte authentication`; 3 skip, same | unchanged |
| 0(c) | `t287-reconstruction-conservation` | 2/0/0/2 | 2/0/0/2 | 2 skip, same | unchanged |
| 0(c), 1(d) | `t287-retry-run-prefix` | 3/0/3/0 | 3/0/3/0 | 3 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: select the immutable s02-installed-continuation-04 carrier` | unchanged |
| 0(c) | `t287-runtime-activity-quiescence` | 1/1/0/0 | 1/1/0/0 | none | unchanged, green |
| 0(c) | `t287-selected-action` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `'test failed'` | unchanged |
| 0(c), 1(d) | `w2-steel-single-start-closure` | 8/0/0/8 | 8/0/0/8 | 8 skip, same | unchanged |
| 0(c) | `witness-run-stopped-definition-binding` | 7/0/7/0 | 7/0/7/0 | 7 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:` | unchanged |
| 0(c) indirect | `t287-native-event-time` | 6/0/4/2 | 6/0/4/2 | 4 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: explicit absolute proof territory required`; `AssertionError [ERR_ASSERTION]: explicit proof territory required`; `AssertionError [ERR_ASSERTION]: exact rejected paired producer required`; 2 skip, same | unchanged |
| 0(c) indirect | `t287-native-frame-observation` | 8/1/3/4 | 8/1/3/4 | 3 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: explicit proof-local territory`; `TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of Buffer or URL. `; `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:`; 4 skip, same | unchanged |
| 0(c) indirect | `t287-native-frame-route-conservation` | 3/0/3/0 | 3/0/3/0 | 3 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:`; `TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of Buffer or URL. ` | unchanged |
| 0(c) indirect | `t287-s03-automatic` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `'test failed'` | unchanged |
| 0(c) indirect | `witness-reprice-definition-binding` | 15/0/15/0 | 15/0/15/0 | 15 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:` | unchanged |
| 1(d) | `generic-input-retention` | 4/2/2/0 | 4/2/2/0 | 2 red, same names and first errors before and after: `TypeError [Error]: Event Calculus requires a nominal validated immutable event prefix` | unchanged |
| 1(d) | `r9-causal-result-closure` | 2/0/2/0 | 2/0/2/0 | 2 red, same names and first errors before and after: `TypeError [Error]: abg.openCall is not a function` | unchanged |
| 1(d) | `t287-lifecycle-failure-carrier` | 5/5/0/0 | 5/5/0/0 | none | unchanged, green |
| 1(d) | `t287-native-work-reacquisition` | 9/6/0/3 | 9/6/0/3 | 3 skip, same | unchanged |
| 1(d) | `t287-public-terminal-projection` | 4/0/4/0 | 4/0/4/0 | 4 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: select the exact frozen S02 episode fixture` | unchanged |
| 1(d) | `t287-qualification-fp-proof-delivery` | 1/0/0/1 | 1/0/0/1 | 1 skip, same | unchanged |
| 1(d) | `t287-r6-retry-success-exit` | 1/1/0/0 | 1/1/0/0 | none | unchanged, green |
| 1(d) | `t287-recursive-registered-selection` | 4/2/1/1 | 4/2/1/1 | 1 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:`; 1 skip, same | unchanged |
| 1(d) | `t287-worksite-command-execution` | 10/10/0/0 | 10/10/0/0 | none | unchanged, green |
| 1(d) | `t288-blocked-retry-entry` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value:` | unchanged |
| 1(d) | `t288-scoped-retry-guard` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `SyntaxError [Error]: Unexpected token 'export'` | unchanged |
| 1(d) | `t288-workflow-scope-conservation` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `'test failed'` | unchanged |
| 0(c) indirect | `t287-multi-candidate-admission` | 75/75/0/0 | 75/75/0/0 | none | unchanged, green |
| 0(c) indirect | `t287-governance-covered-source-use` | 8/2/3/3 | 8/2/3/3 | 3 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: select the frozen bounded fixture`; 3 skip, same | unchanged |
| 0(c) indirect | `t287-native-semantic-revision` | 7/4/1/2 | 7/4/1/2 | 1 red, same names and first errors before and after: `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:`; 2 skip, same | unchanged |
| 0(c) indirect | `t287-native-work-currentness-consumers` | 4/4/0/0 | 4/4/0/0 | none | unchanged, green |
| 0(c) indirect | `t287-result-evidence-lineage-projection` | 1/0/1/0 | 1/0/1/0 | 1 red, same names and first errors before and after: `TypeError [Error]: event store was not constructed by this ABG module` | unchanged |

### Deviations from the activation's wording

1. **The commit's first line.** The mandated text claims the cause rides cold, which is false (item 1 stop). The line keeps the structure and names the gap in place of the claim. Item 0's tail ("the F09 worker restated and the cold held-return witness runs") holds and is kept.
2. **The Executive's reading of item 1(b) is corrected** (item 1(b)). The cause cannot be re-derived at the hog "over the same prefix", because that prefix is rolled back.
3. **There are six hog recording sites, not four** (item 1(a)). `:644-650` is now `:645-651`. Only `:734-740` can carry `route_mismatch`.
4. **Item 0(a) restated three things beyond program validation and the grant.**
   - The invocation admission and the whole construction now come from the support's producers.
   - The attempt command's host carrier.
   - The A-B-A route. The fixture's stale branch is bypassed from the worker by not setting `ABG_AX_F09_MODE`, and the A signals' source class moves to `probabilistic_transport`. Each move was forced by the lane error named in the step table.
5. **Item 0(b): the witness was restated in two places** (owner root, log read), each forced by a lane error.

### Findings outside the grant

- **`hog/structural_transition.ts:270-276`** records a structural `C.retry` transition's refusal (`transitionClass: "retry"`, `:217-226`) as `diagnostic://abiogenesis/hog/${committed.code}@5`. Here a `route_mismatch` is the top-level class, and the same staged-prefix limit applies. Option A would serve it through the same member.
- **`test_env/falsifiers/runtime-f09-product.mjs:118-150`**: the fixture's `ABG_AX_F09_MODE` branch declares disposition `success` with a failure-kind candidate on any non-success. ABG blocks that by design. No lane reaches the branch now. Proposal: retire it.
- **`test_env/falsifiers/runtime-f09.mjs:266-269`**: the inspect consumer's fixed input `{ action, handoff }` keeps it on the worker's stale private `rawProgramInput` (`:87-128`, `:560`). Passing `supportPath` in that input would let it import the support's producer. `runAxF09` (`produce_frontier`/`inspect_frontier`) has no lane, so the cited diagnostic assertions and that path are unexercised.

### Stops

1. **Item 1(b), member `RetryAdmissionRefusal.diagnosticRef`** (or an equivalent cause member). Equally, a changed result of `admitOwnedTraversalTransition`. The `route_mismatch` cause is derivable only over the rolled-back staged prefix (`retry.ts:4958-4970`, `traversal_route.ts:5391-5410`, `:5501-5520`). Nothing was implemented for it. Item 1(c) follows it.

### What could not be verified

- **The staged-prefix limit** in item 1(b) is shown by reading the sites, not by a run. No lane or fixture drives `route_mismatch` (`git grep` finds no literal in `test_env`), and building such a fixture was outside the package.
- **The `produce_frontier` and `inspect_frontier` actions** of the restated worker were not run. No lane exists.
- **The witness's suspension equality** is proved against the carried member as it stands. If the owner retires that member (C-6 stop 1), the equality is restated.
