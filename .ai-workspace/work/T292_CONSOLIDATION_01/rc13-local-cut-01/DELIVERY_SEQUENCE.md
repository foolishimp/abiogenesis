# RC13 bounded delivery sequence

Prepared by Writer `T292-RC13-DELIVERY-PREP-01` on predecessor
`25e74e96f7ad553201278a6066603d5bdacf909f`, tree
`e5578bcab6cec84140d3f62d550d840a44fbcd28`. This is delivery preparation;
Root owns final integration, source selection and disposition. No TD71
maintained-cut refactor is selected.

## Existing route and explicit delta

The five `cut/` tools are copies of
`T287_RELEASE_RESUMPTION_01/rc12-executive-01/cut/` at that predecessor.
Install and smoke mechanics are unchanged; their labels now identify RC13.
The cut keeps clean `git archive`, commit/tree equality, locked dependency
versions and optional exact donor-inventory comparison, pinned compiler,
create-once outputs, manifest-plus-generated member equality, every member's
byte equality, archive-owned verification, and installed-member equality.
The final invocation supplies the dependency inventory.

The cut invokes `node scripts/product-payload.mjs pack <destination>` with
`npm_config_offline=true`. The obsolete npm hidden-lock branch option,
predicate and timestamp manipulation are removed. All dependency files are
copied and compared unchanged. TD69 owns payload membership; npm's private
state no longer selects it.

`stamp-rc13.mjs` stamps only package.json, both root package-lock versions,
the Product contract constants, and the current-owner README's source
identity. It plans the complete census before writes and refuses unexpected
RC12 residue, including extra residue inside one of those four files.
Historical RC10 fixture data is untouched. The two generated members remain
build-owned. `release-claim.md` and `test_env/fixtures/abi5-root-candidate-basis.json`
are explicit separately owned carriers, reported rather than text-stamped.
The cut checks the claim's current identity and the basis against the actual
packed artifact. The basis fixture is excluded from runtime payload.

## Final source preparation, owned by Root

1. Finish TD78, TD85N, TD26 P5/P6/P7, TD25 member withdrawal and design cleanup.
   Consume the composed verification and QA under T292. Keep B21's demonstrated
   firmlink alias defect visible as S2/P2 after-cut work; it blocks reliable
   operation and 5.0 qualification claims, not this local unqualified claim.
2. Complete the B22 metadata refresh described below after P6/P7. This is not
   formal qualification resource production. Preserve historical evidence.
3. Adopt `RC13_RELEASE_CLAIM.md` as tenant `release-claim.md`, adjusting only
   the final external proof routes when known. Root's final proof must state
   its actual subject, tests, history, QA and limitations. Do not relabel RC12
   tests or Consensus claims. The template explicitly keeps pending results
   pending and retains B21.
4. Run the four-site stamp dry-run, then apply on the authorized final source.
   From the tenant, build and run `node scripts/refresh-candidate-basis.mjs`.
   It uses the existing deterministic pack owner and derives every identity
   field. Candidate checks use `ABI5_CANDIDATE_BASIS_SOURCE=committed`; the
   default packed-artifact mode checks self-consistency, not the recorded basis.
5. Finish metadata that depends on those exact bytes; record the source commit
   behind the candidate archive separately from any later metadata-only commit.
   Stage removals before inventory enumeration (`git ls-files --cached` still
   lists unstaged deletions). Commit the exact source/generated/fixture bytes.
6. Run clean cut `--dry-run` on that commit/tree with the pinned dependency
   inventory. Without `--scratch-stamp`, generated output must equal the
   committed generated files and the basis must equal the actual archive.
   Only the selected final delivery performs `--apply` to its new RC13 output.
   Install from that cut record/archive, then smoke from its install record.
   Record the final artifact and installed correspondence externally.

Example final delivery commands (all paths are explicit selected values):

```sh
node "$RC13_TOOLS/stamp-rc13.mjs" --dry-run --root "$RC13_REPO" --scratch "$RC13_SCRATCH/stamp"
node "$RC13_TOOLS/stamp-rc13.mjs" --apply --root "$RC13_REPO" --scratch "$RC13_SCRATCH/stamp"
# From the selected tenant, after the owned claim and B22 source changes:
npm run build
node scripts/refresh-candidate-basis.mjs
ABI5_CANDIDATE_BASIS_SOURCE=committed node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/r1-packed-artifact.test.mjs test_env/tests/r2-clean-install.test.mjs
# Commit final source and regenerated members, then bind full commit/tree:
node "$RC13_TOOLS/cut-local-rc13.mjs" --dry-run --repo "$RC13_REPO" --commit "$RC13_COMMIT" --tree "$RC13_TREE" --deps "$RC13_DEPS" --dependency-inventory "$RC13_DEPS_PIN" --output "$RC13_RELEASE" --scratch "$RC13_SCRATCH/cut-dry"
node "$RC13_TOOLS/cut-local-rc13.mjs" --apply --repo "$RC13_REPO" --commit "$RC13_COMMIT" --tree "$RC13_TREE" --deps "$RC13_DEPS" --dependency-inventory "$RC13_DEPS_PIN" --output "$RC13_RELEASE" --scratch "$RC13_SCRATCH/cut"
node "$RC13_TOOLS/install-local-rc13.mjs" --apply --cut-record "$RC13_RELEASE/CUT_RECORD.json" --archive "$RC13_RELEASE/abiogenesis-typescript-tenant-5.0.0-rc.13.tgz" --output "$RC13_INSTALL_RECORDS" --install-host "$RC13_INSTALL_HOST" --scratch "$RC13_SCRATCH/install"
node "$RC13_TOOLS/installed-owner-smoke.mjs" --apply --install-record "$RC13_INSTALL_RECORDS/INSTALL_RECORD.json" --output "$RC13_PROOF/INSTALLED_OWNER_SMOKE.json" --scratch "$RC13_SCRATCH/smoke"
```

The output directories and install host are new/create-once; their parents
must exist. Tools neither select nor change an operational pin. Do not use
`--scratch-stamp` for official delivery. That flag requires an explicit
`--scratch-claim` and confines output inside scratch; it records all stamp,
claim and basis-refresh deltas and permits generated drift only for that proof.

## B22 metadata owners and barriers, read-only preflight

`B22_PREFLIGHT.json` records the exact precursor census: the old 1,191-member
inventory has 658 equal, 473 changed and 60 absent files; 59 of the old recipe's
1,115 source inputs are absent. These counts are not the final P7 population.

| Surface | Existing owner / smallest next step |
|---|---|
| Authority mirror and generated qualification definitions in `contracts/qualification/` | After P6/P7, from the tenant run `node scripts/generate-qualification-rule-catalog.mjs --stage-authorities ../../.. '/Users/jim/Library/Application Support/STDO/releases/v3.0.4'`, then the normal build. The script verifies selected method identity. It copies current sources but does not remove stale mirror files; withdraw only confirmed retired mirror members under B22/TD25. No semantic qualification follows from generation. |
| `recipe/expected-output-inventory.json` | Existing declaration says every regular file of the extracted candidate archive, by relative path. Derive the new `files` rows from final `ARCHIVE_MEMBERS.json` (`path`, `sha256:` hash, byte count), and record that archive's name/hash and actual source commit. Retain/reconcile `generatedRoots` with the final generator; do not keep a withdrawn Consensus output merely because the old recipe names it. `recipe/compare-generated.mjs` consumes this declaration and is the byte-correspondence check. No maintained expected-inventory generator was found in the scoped tenant/release carriers. |
| `recipe/declared-commands.json` | This is the source of command arguments, lint/tests, write territories and predicates. Reconcile named retired files against P5/P6/P7 and the final kept test population, without removing kept obligations. Update the exact compare predicate's old `5317` count to the actual final member count. Retain evidence scope for any kept external fixture; old absolute UAT paths are not RC13 results. |
| `recipe/verification-recipe.json` | `build-resources.mjs` lines 235–268 own the construction from current memberPaths, declared commands, dependency declarations and the existing observed-worksite-command task constructor. Command/predicate/territory digests must be recomputed when their declarations change. `--recipe-only true` is the existing bounded CLI, but it currently calls `installedExports`, whose RC1-only version check prevents using a current RC13 package. This is a concrete CLI barrier; do not pass old RC1 runtime data as RC13 proof. Root can use the existing recipe construction with the final current Product owners under a bounded metadata grant; this prep does not alter the qualification system. |
| `inventory.json` | `classification.json` owns member selection; `memberPaths` and `constructInventory` in `build-resources.mjs` enumerate final tracked/trackable tenant files and hash them. Inventory is written last and excludes itself. These exported helpers need only current `qualification/m05` preparation for inventory; the old prospective-release CLI is unnecessary. |
| `recipe/install-dependencies.mjs` | TD69 makes its comment about `npm pack --dry-run`/hidden-lock identity obsolete. The setup itself still materializes declared dependency archives. Correct metadata wording under B22 if touched; no new payload rule or dependency upgrade is selected. |

A bounded final inventory refresh, from the final tenant after all source and
recipe metadata updates, uses the existing exported constructor directly:

```js
import {writeFile} from 'node:fs/promises';
import {classification, constructInventory} from './test_env/qualification/build-resources.mjs';
import * as preparation from './build/code/src/qualification/m05.js';
const inventory = await constructInventory({preparation}, await classification());
await writeFile('test_env/qualification/inventory.json', JSON.stringify(inventory) + '\n');
```

Do not invoke full `build-resources.mjs` for this metadata task. Its
`PROSPECTIVE_RELEASE_FIELDS`, `installedExports` guard and tenant claim refs
still select RC1, and full mode requires an ABG/Public-install identity record
with `.install`, not delivery `installation.json`. Its tenant-manifest,
resources, prospective-release identities, runtime basis, scope and judgment
production belong to later formal qualification. This prep neither repairs
that path nor treats old resources as current qualification evidence.

After the metadata refresh, run the existing recipe lint and output comparison
on their exact selected subjects and regenerate the subject inventory last.
Do not solve stale declarations by adding a new release framework or by
changing Product admission/qualification policy.
