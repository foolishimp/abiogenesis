# T293 B22 bounded metadata route — read-only preparation

Prepared for `/root` on main `94e588ec9209c0fed89f967601e8f9071573a9cd`.
No repo/Git mutation, build, tests, pack, cut, install or pin change was performed.
The snippets below are proposed commands, not executed evidence. Final P5–P7,
TD25 and design changes are still outstanding; no final count/digest is derived.

Control: T292 amendment and Codex resumption of 2026-11-13; T293 B22.
Frame: artifact identity plus qualification evidence ownership, applying the
project frame basis's Entity/Owner/Proof families. Shared host; no isolation or
semantic-independence claim. Installed STDO manager `status --definition
stdo_abiogenesis.json --verify` returned valid/installed, no failures; `resolve
stdo://releases/v3.0.4/` returned `/Users/jim/Library/Application Support/STDO/releases/v3.0.4`.
Manifest SHA `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`,
definition SHA `b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44`;
composition empty. Native stdo-work was loaded. Existing RC13 delivery prep,
sequence and staged claim were read before selecting this route.

## Smallest route

Use an authorized metadata Writer; no qualification-system refactor is needed.
`test_env/qualification/build-resources.mjs` is the owner of `classification`,
`memberPaths`, `constructInventory` and `commandInput` (lines 49–77, 216–217).
There is no `test_env/qualification/inventory.mjs` at this subject.
Do not invoke its CLI or `installedExports`: both still select RC1, and full
mode requires the Public-install `.install` wrapper. Do not patch those guards
or relabel RC1 data as RC13. `resources.json`, `tenant-manifest.json`, runtime
basis/scope, provenance and judgments are outside this refresh; they are not
current RC13 qualification evidence.

1. After P5/P6/P7 + TD25 and the one design reconciliation, finalize the
   RC13 claim and four stamp sites. Restage authorities using the existing
   owner below. The currently compiled generator dependencies must exist;
   use the pinned TypeScript compilation first only if needed. Then perform
   the ordinary final build.
2. Freeze a real payload-source checkpoint `C_payload` after the final
   source/version/claim/mirrors and generated Product members are committed.
   Capture its full commit/tree. Build its clean `git archive` extraction with
   the exact dependency inventory and existing pinned compiler/generator,
   then run the existing payload owner to a scratch archive destination.
   This is archive derivation, not formal qualification or the final cut.
3. From that actual archive, refresh expected-output rows and its actual
   archive name/SHA/`sourceCommit=C_payload`. Refresh the source candidate-basis
   fixture through `scripts/refresh-candidate-basis.mjs`; require its artifact
   hash to equal the clean-checkpoint archive. No fixture value is copied from
   RC12. Update the compare predicate from the actual member count.
4. Reconcile only confirmed retired command/test/lint inputs and declared
   generated roots/write territories. Refresh the classification's current
   candidate/method locators without changing its role/grouping policy.
5. Construct the verification recipe with current compiled owners using the
   faithful bounded projection below. No commands in the recipe are executed
   by that construction. Run the existing syntax lint and output comparison.
6. Stage intended removals before enumeration; `git ls-files --cached` still
   reports unstaged deletions. Check the tenant contains no unrelated trackable
   scratch files: memberPaths includes `--others --exclude-standard` by policy.
   Construct inventory last, after every other tenant byte is final, then
   commit metadata as `C_final`. Do not edit a selected tenant member afterward
   without refreshing its inventory. Source/generated metadata and the complete
   selected tests must be fixed before the single composed broad run.
7. The composed broad run and final clean cut use `C_final`. Existing cut
   `--compare-archive <C_payload archive>` proves member equality; separately
   require final archive SHA to equal the expected/basis archive SHA. The
   external CUT_RECORD and final proof bind `C_final`, `C_payload`, their
   metadata-only delta, and the archive equality. Install/smoke then follow the
   already prepared delivery sequence. B21 remains an explicit S2/P2 limitation.

The payload owner excludes test_env, scripts, design and release-claim from
runtime package membership (package.json `files` selects build/**, contracts/**,
and product-toolchain-manifest.json, plus the payload owner's always-selected
package metadata). Thus the archive does not contain its expected-output file,
recipe, subject inventory or candidate-basis fixture. The fixture contains no
Git SHA. Inventory excludes itself. This breaks both self-hash cycles without
inventing a future commit. Do not assert the old resource index has been made
current by updating inventory. Full construction provenance, if later selected,
uses actual committed postimages including metadata, under its separate owner.

## Authority mirror and generated Product scope

From the final tenant, with current compiled imports available:

```sh
node scripts/generate-qualification-rule-catalog.mjs --stage-authorities ../../.. '/Users/jim/Library/Application Support/STDO/releases/v3.0.4'
npm run build
node scripts/refresh-candidate-basis.mjs
```

The stage function (generator lines 20–53) writes
`contracts/qualification/authority-inputs.json` and current
`contracts/qualification/sources/*`; CLI then calls `generateQualificationAssets`
which writes `rule-catalog.json`, `law-basis.json`, `coverage.json`, and
`contracts/schemas/self-conformance.schema.json` (lines 86–152). It does not
remove stale mirror files. Compare old mirror paths with the new exact
`authority-inputs.sources[].path` set, and remove only confirmed TD25/P7 retired
members. The final build regenerates the Product manifest/capability graph and
its ordinary outputs. These are payload changes, so all precede `C_payload`.

Current observations, not final declarations: authority inputs already name
3.0.4 and 94 sources; classification still says 95 and has three 3.0.2 method
selectors (release, identity, standards prefix), RC1 purpose/release-claim
wording and surfaceGroups.ownerRefs. All declared selection evidence paths
exist at this checkpoint. All current source-mirror files are selected. Future
retirement is what can create stale mirror members.

## Expected archive inventory owner reuse

The prepared `cut/cut-common.mjs` exports `archiveMembers(archivePath)` (lines
153–163): it rejects non-regular, duplicate, unsafe or non-package members and
returns sorted `{path, bytes, sha256, mode, data}`. Reuse it directly; no final
cut is necessary just to obtain member rows. Mapping to the existing declaration:

```js
const rows = archiveMembers(actualArchivePath);
expected.source = {
  archive: basename(actualArchivePath),
  archiveDigest: 'sha256:' + hex(readFileSync(actualArchivePath)),
  sourceCommit: actualPayloadCommit,
  method: 'every file of the extracted archive package/ root, by relative path'
};
expected.files = rows.map(({path, bytes, sha256}) => ({path, digest: 'sha256:' + sha256, byteCount: bytes}));
// Preserve kind/schema; reconcile generatedRoots with the final generator.
```

For the existing cut's ARCHIVE_MEMBERS.json shape the rows are `.rows`, the
count is `.members`, and each row has `bytes` (not `byteCount`). Never carry
5303 (scratch precursor) or 5317 (RC1 declaration) forward as the final count.
The final cut's `--compare-archive` compares member hashes; archive hash equality
is an additional explicit check.

## Recipe construction — exact existing owner relation

Build-resources lines 237–261 own the recipe shape and ordering; 228–233 own
inputs; 241–250 use the existing cold worksite fixture and observed-task
constructor only to normalize the configuration. That task calls
`constructWorksiteCommandConfiguration` at
`code/src/product/worksite_command_execution.ts:493`, returning the exact
commands/predicates/write territories hashed by the recipe. This creates no
admitted execution/evidence. Keep this route rather than hand-implementing
normalization or changing the package loader's RC1 check.

Root may place this bounded harness outside the selected tenant and execute it
from the final tenant after its explicit metadata Writer activation. It projects
only the existing recipe assembly; it does not copy the full resource generator:

```js
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root = process.cwd();
const scratch = resolve(process.argv[2]); // explicit bounded scratch path
const load = p => import(pathToFileURL(join(root, p)).href);
const {Q, OUTPUTS, classification, memberPaths, commandInput} =
  await load('test_env/qualification/build-resources.mjs');
const product = await load('build/code/src/product/index.js');
const validator = await load('build/code/src/validator/index.js');
const actorProcess = await load('build/code/src/abg/actor_process.js');
const valibot = await import(pathToFileURL(createRequire(join(root, 'package.json')).resolve('valibot')).href);
const readJson = async p => JSON.parse(await readFile(join(root, p), 'utf8'));
const declaration = await classification(root);
const declared = await readJson(Q + '/recipe/declared-commands.json');
const dependencies = await readJson(Q + '/recipe/dependencies.json');
const expected = await readJson(Q + '/recipe/expected-output-inventory.json');
const inside = (p, roots) => roots.some(r => r.pathKind === 'file' ? r.relativePath === p : p.startsWith(r.relativePath + '/'));
const paths = memberPaths(declaration, root, [OUTPUTS.recipe, OUTPUTS.tenantManifest, OUTPUTS.resources]);
const sourcePaths = paths.filter(p => p !== OUTPUTS.recipe && !inside(p, expected.generatedRoots));
const unprotectable = sourcePaths.filter(p => inside(p, declared.allowedWriteTerritories));
if (unprotectable.length) throw new TypeError('protected inputs inside a write territory: ' + unprotectable.join(', '));
// Capture the true command ambient BEFORE confining the cold fixture to scratch,
// exactly as build-resources does. Retain these rows in an external receipt.
const ambient = actorProcess.selectedWorksiteCommandAmbientEnvironment();
await mkdir(scratch, {recursive: true});
process.env.TMPDIR = scratch;
const {worksiteFixture} = await load('test_env/support/t287-generic-job-worksite.mjs');
const f = await worksiteFixture(product);
await writeFile(join(f.canonicalRoot, 'probe.txt'), 'probe\n');
const subject = product.constructWorksiteSubject({...f, relativePath: 'probe.txt', subjectUri: pathToFileURL(join(f.canonicalRoot, 'probe.txt')).href});
const observation = await product.observeWorksiteSubject(f.workspaceAuthorityBasis, f.workspaceBinding, subject);
const task = product.constructObservedWorksiteCommandExecutionTask({
  workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
  capabilityGrant: f.capabilityGrant, observedFiles: [{subject, observation}],
  commands: commandInput(declared), outcomePredicates: declared.outcomePredicates,
  allowedWriteTerritories: declared.allowedWriteTerritories
}, ambient);
const recipe = {
  kind: 'qualification_verification_recipe', schemaVersion: '1',
  sourceInputs: sourcePaths.map(p => ({memberRef: declaration.memberRefPrefix + p, relativePath: p})),
  auxiliaryInputs: dependencies.dependencies.map(r => ({relativePath: r.path, digest: r.digest, byteCount: r.byteCount})),
  commandConfigurationDigest: product.sha256Canonical(task.commands),
  predicateConfigurationDigest: product.sha256Canonical(task.outcomePredicates),
  writeTerritoriesDigest: product.sha256Canonical(task.allowedWriteTerritories),
  commands: declared.commands.map(r => ({commandId: r.commandId, role: r.role})),
  lint: declared.lint, tests: declared.tests, skipPolicy: 'incomplete', reportFormat: 'node-test-events-jsonl@1'
};
valibot.parse(validator.QUALIFICATION_VERIFICATION_RECIPE_SCHEMA, recipe);
await writeFile(join(root, OUTPUTS.recipe), JSON.stringify(recipe, null, 2) + '\n');
await writeFile(join(scratch, 'RECIPE_CONSTRUCTION.json'), JSON.stringify({
  claim: 'configuration metadata only; no command execution or qualification',
  ambient, recipe, owner: 'test_env/qualification/build-resources.mjs:237-261'
}, null, 2) + '\n');
```

The ambient reader currently reads HOME, TMPDIR, LANG, LC_ALL and PATH. Declared
PATH wins for all present commands; the other inherited rows enter command
digests. Record actual values and use the same environment for any later recipe
execution; do not call the digests universally host-independent. Scratch fixture
identities are cold constructor inputs, not an installed RC13 or admission proof.

## Last inventory write and bounded checks

Existing syntax lint and archive correspondence commands, from final tenant:

```sh
node scripts/lint-verification.mjs test_env/qualification/recipe/verification-recipe.json
node test_env/qualification/recipe/compare-generated.mjs
```

Then construct inventory last with existing owner, from the final tenant:

```sh
node --input-type=module <<'JS'
import {writeFile} from 'node:fs/promises';
import {classification, constructInventory} from './test_env/qualification/build-resources.mjs';
import * as preparation from './build/code/src/qualification/m05.js';
const declaration = await classification();
const inventory = await constructInventory({preparation}, declaration);
await writeFile('test_env/qualification/inventory.json', JSON.stringify(inventory) + '\n');
JS
```

Inventory's schema constructor is exported by qualification/m05 through
self_conformance_contracts -> qualification_contracts. It hashes the exact
current members with their declared classifications. This is an inventory
construction, not semantic evaluation. It needs neither candidate install nor
prospective release identity. Any missing member or unclassified trackable file
is a real stop, not permission to filter it away.

## Actual edit territory and residuals

Required bounded metadata files, tenant-relative:
`test_env/qualification/{classification.json,inventory.json,recipe/expected-output-inventory.json,recipe/declared-commands.json,recipe/verification-recipe.json}`,
`test_env/fixtures/abi5-root-candidate-basis.json`, and `release-claim.md`. Build-resources.mjs is imported only;
no edit is needed. Authority mirrors/catalog/schema/generated Product members
are owner-generated payload scope described above. Four source identity sites
remain owned by existing stamp-rc13. Correcting install-dependencies.mjs's obsolete
npm-hidden-lock comment is optional, not needed to resolve the route.

At this checkpoint six declared file paths are already absent:
- test_env/qualification/fixtures/rp2-correction-product.mjs
- test_env/tests/t287-multi-candidate-admission.test.mjs
- test_env/tests/t287-native-selection-profile-scope.test.mjs
- test_env/tests/t287-rp2-correction-carriers.test.mjs
- test_env/tests/t287-selected-action.test.mjs
- test_env/uat/continuation.test.mjs

Use the final accepted retirement list; existence alone cannot authorize dropping
a kept obligation. For a retired whole command, remove its commands/tests row
and corresponding lint-only retired files together; remove an empty test group
(the schema requires nonempty files). A partially retired group keeps its other
lanes. Update only the compare stdout count from actual archive rows. Retained
absolute external UAT inputs remain external historical fixtures, never newly
obtained RC13 evidence. The selected group proof remains Root's separate composed
suite/history/provider plan; recipe metadata does not select a new broad run.

No changes to RC12, RC11 operational pin, publication, tag or remote are selected.
B21 blocks reliable-operation/5.0 qualification claims and remains in the claim.
