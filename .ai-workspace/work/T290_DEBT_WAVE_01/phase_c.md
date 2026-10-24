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
