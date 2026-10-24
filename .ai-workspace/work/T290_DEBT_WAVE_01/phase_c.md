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
