# TD-26 P2T Return: an ungated lane for the installed Public view and apply over declaration rows

Writer: Claude Opus 5.5. Branch `claude/td26-p2t-declaration-rows-lane` from
local `main` at `7f4c4ef46`, worktree `/private/tmp/abg-td26p2t` (sparse).
Change class: realization_refactor (test only). No push, no tag.
T = `build_tenants/abiogenesis/typescript`.

**Status: done; one deviation needs a ruling.** The new lane
`test_env/tests/t292-td26-p2t-declaration-rows-installed.test.mjs` is ungated:
it requires no environment input and calls no provider. On the base: 1 test,
1 pass, 0 fail, 0 skip, 368 s. Through the installed transport
(`abg.cli --jsonl`) it views a consumer Product's `node_type` and `overlay`
rows, applies each, and refuses an unknown handle and a row outside the view.
The deviation is fixture source added under ruling 3: a 16-line addition to
the existing fixture `test_env/support/neutral-schema-product.mjs`, so the
fixture's package can declare the tenant archive as its npm dependency. It is
a second changed file against ruling 1's one new file. Without it the install owner
refuses the consumer install `lock_mismatch` (observed). Ruling 5 does not
hold: the gate supplies nothing the route needs.

Commits:
- `8b4c7258d`: the lane and the fixture-support edit;
- this Return.

No source under `code/src`, no specification, no design note and no existing
test file changes. Generated files are not committed.

## What the lane shows (ruling 2)

`steel-basic-cli-public` at `fc818876c` made five assertions over the core
Consensus `node_type` and `overlay` rows. It made no `catalog.apply` assertion
over them (the comment at `:822-829` records the Public application of those
rows as already removed) and no refusal over them. `t287-w2-05-install-catalog-owner-chain`
at `fc818876c` made the same five (`:791-831`) and also asserted no apply over
them (`:847-855`, `:1611-1613`).

| Assertion at `fc818876c` (`steel-basic-cli-public`) | Where the new lane makes it |
|---|---|
| A1. The admitted Catalog's `declarationEntries` hold a `node_type` row and an `overlay` row (`:727-734`) | `:270-273`: the consumer's rows are exactly `[node_type, handle, contract]` and `[overlay, handle, contract]`, compared with the fixture's literal handles and contract refs |
| A2. The installed Public `catalog.view#allowlist` over those two handles, through `abg.cli`, returns a transport result with exit 0 and outcome `result` (`:736-759`, `runBinding` `:243-250`) | `:278-281` (`invoke`, `:120-127`) |
| A3. The native view over the same allowlist is a `graph_function_catalog_view` (`:760-767`) | `:284-285` |
| A4. The Public `effectiveHandles` equal the native view's allowlist (`:768`) | `:282` compares them with the fixture's literal handles, not with the native view; `:286` compares the Public view coordinate with the native view's; `:287-297` check that the view holds no callable row and holds both declaration rows with their kind, contract ref and owner |
| A5. The event log bytes after the view equal those before it (`:754`, `:830`) | `:275`, `:387`, over both views, both applications and both refusals |

New assertions (no pre-P2 counterpart):

| Claim | Lane lines | Code observed |
|---|---|---|
| A second Public view over the Program's callable row and both declaration rows (the application view; a `node_type` target is a node of a callable Program member) | `:302-310` | result, exit 0 |
| `catalog.apply#node_type` and `#overlay` apply each row and return the application coordinate, the target (null for overlay), the evidence `[validationReceipt, applicationBasis]` and the provenance `[contributor]`; the receipt is `read_only_unchanged` | `:322-344` | result, exit 0 |
| An unknown handle at `catalog.view` is refused | `:346-360` | Public: owner refusal `unknown`, issue path `/allowlist`, exit 1, no view; native `narrowGraphFunctionCatalog`: `catalog_construction_refusal`, `unknown_allowlist_entry` |
| The `node_type` row outside the view at `catalog.apply` is refused | `:362-384` | Public: execution fault `resource_relation_mismatch` at resource admission ("catalog application resources differ from the admitted request or exact CatalogView row", `product/catalog_definition_bindings.ts:860-875`), exit 70; native `applyCatalogDeclaration`: `declaration_application_refusal`, `outside_view` |

The two refusals the brief names have no pre-P2 code to compare with: neither
re-pointed lane asserted a refusal over the Consensus declaration rows. The
codes above are those the route gives at head. The native codes equal the P2
door table's rows for `narrowGraphFunctionCatalog` and `applyCatalogDeclaration`.
The Public route does not reach native `outside_view`: its owner refuses the
row at resource admission first, so the lane asserts the fault it observes and,
separately, the native code. The nearest pre-P2 refusal near these rows is in
`w2-05` (`:1318-1347`): a forged session view widened by one hidden row,
refused `resource_relation_mismatch` by the in-process `project.read#catalog_list`
binding. Its hidden row was a callable row and its view was the Consensus-row
view; that assertion stays in `w2-05` at base over the default-library view.

## Fixture and support (rulings 3 and 4)

Fixture: the existing neutral consumer Product
`test_env/support/neutral-schema-product.mjs` (`prepareNeutralSchemaProduct`),
the one the gated `steel-consumer-declaration` uses. It publishes one callable
Program member, one `node_type` row, one `overlay` row and their schema assets.
Fixture source added under ruling 3: an optional `abiPackageArchivePath`
parameter (what and why below).

Support, imported, no copy: `setupInstalledCliHarness` and
`importInstalledPackageExport` (`support/root-cli-environment.mjs`),
`expectedVerificationIdentity` (`support/candidate-basis.mjs`). The installed
calls are built with the shipped constructors as `uat/public-setup.mjs:33-61`
builds them. The chain follows the gated lane's lines: verify (`:335-352`),
resolve (`:353-368`), install (`:369-388`), bind (`:389-410`), admit
(`:412-431`), apply (`:450-469`). It differs in three places:
- the consumer's package declares the tenant archive as its npm dependency
  (the deviation below);
- the fixture receives the worksite construction publication: the harness runs
  with `rootPublicationKinds: ["worksite_construction"]`, so no language-smoke
  fixture is packed;
- the Catalog admits all eight core publications and the consumer's; a subset
  is refused `conservation_failure` at `/contributionManifests` (observed).

### Deviation: the fixture-source edit (needs a ruling)

Ruling 3 allows fixture source when needed; ruling 1 says one new file. The
lane also changes `test_env/support/neutral-schema-product.mjs`:

```diff
-import { basename, join } from "node:path";
+import { basename, isAbsolute, join } from "node:path";
@@ doc comment
- * application, verified Product, install, binding or runtime event.
+ * application, verified Product, install, binding or runtime event. With
+ * abiPackageArchivePath, the package declares the ABI archive as its npm
+ * dependency, so the install owner materializes the declared ABI dependency
+ * under the consumer's install target.
@@ parameters
   abiArtifact,
+  abiPackageArchivePath,
@@ after the manifest check
+  if (
+    abiPackageArchivePath !== undefined &&
+    (typeof abiPackageArchivePath !== "string" || !isAbsolute(abiPackageArchivePath) ||
+      await product.sha256File(abiPackageArchivePath) !== abiArtifact.artifactDigest)
+  ) {
+    throw new TypeError("neutral schema fixture requires the exact absolute verified ABI package archive");
+  }
@@ package.json
     files: ["build", "contracts", "product-toolchain-manifest.json"],
+    ...(abiPackageArchivePath === undefined
+      ? {}
+      : { dependencies: { [abiArtifact.packageName]: `file:${abiPackageArchivePath}` } }),
```

Why: without it the Public `product.install` of the consumer is refused
`lock_mismatch` at `/resolvedLock` (observed, run 1). The install owner requires
each declared Product dependency to resolve by Node resolution inside the
consumer's install target (`code/src/product/install_product.ts:272-312`,
refusal `:449`). The neutral fixture declares the tenant as a Product dependency
but its package carries no npm dependency on it. The other installed fixtures
carry one: `support/language-smoke-fixture.mjs:18-33` takes the same
`abiPackageArchivePath` parameter and writes the same `file:` dependency;
`uat/consumer.mjs:67` does the same. The edit gives the neutral fixture that
parameter. Without the parameter, the fixture's bytes are unchanged, so the
gated lane's call is unchanged (read; its only other caller skipped).

The alternatives keep ruling 1 but are worse: a second fixture in the lane file
(a copy, against ruling 4), or rewriting the packed fixture in the lane before
`npm pack` (patches a support output from outside its owner).

Qualification mirror: `neutral-schema-product.mjs` is a member of
`test_env/qualification/inventory.json` (digest `sha256:a43903d7…`, the base
file) and is named by `test_env/qualification/recipe/verification-recipe.json`
(path only). After the edit the file is `sha256:86b18b28…`, so the inventory
row no longer matches it. The mirrors are not edited (not this package's); the
new lane is a member of neither.

## What the gate supplies (ruling 5)

The gated lane skips unless `ABI5_STEEL02_EVIDENCE_PATH` and
`ABI5_WAVE1_FROZEN_ARTIFACT_PATH` are set
(`steel-consumer-declaration.test.mjs:232-234`). The first names a directory
for the scratch and the retained evidence files (`:236-237`, `:559`, `:625`).
The second selects a frozen tenant archive and install host in place of the
harness packing and installing the tree (`root-cli-environment.mjs:15-23`,
`:89-133`). Neither supplies anything the route needs: the new lane runs the
same route on the harness-packed archive in its own scratch. Ruling 5 does not
hold.

## Run cost

The committed file, run alone on the base: 368 s wall. In the lane's own
timings: harness pack and CLI host install 8.0 s; 13 `abg.cli` subprocess
calls 326.9 s, about 25 s each (89 % of the wall); total 367.2 s.

The earlier full run, before the fault-message assertion at `:378` was added:
379 s wall, 336.6 s of it in the 13 `abg.cli` calls. The host load average was
10 to 20 during the runs.

Packs: two (the tenant, by the harness; the neutral fixture, by `npm pack`).
Installs: three (the harness's npm install of the CLI host; Public
`product.install` of the tenant and of the consumer, the second also
materializing the tenant through the consumer's `file:` dependency).

## Mutant

In a scratch copy of the tree, one line of `code/src/product/catalog.ts:930`
(the narrowing that selects a declaration row into a view) drops `node_type`
rows:

```diff
-    return entry === undefined ? [] : [entry];
+    return entry === undefined || entry.declarationKind === "node_type" ? [] : [entry];
```

Built and run from the copy, so the packed and installed tenant carries the
mutant too (the file before `:378` was added): 1 test, 0 pass, 1 fail, 265 s.
It fails at `:288`: the view's
declaration rows are only the overlay handle. `:282-286` held: the installed
Public view echoed both handles as `effectiveHandles` (it echoes the
allowlist) and returned the same mutant view coordinate as the in-process
owner, since both carry the mutant. The lane caught the mutant only at the
in-process check `:288`; the installed apply, which checks the exact
CatalogView row, was not reached. A break in the installed binding alone would
fail at `:286` (reasoning, not run).

## Lanes, build and lints

Each run once on the base with the change, one file at a time:

| File | Why | Tests / pass / fail / skip | Wall |
|---|---|---|---|
| the new lane | the subject | 1 / 1 / 0 / 0 | 368 s |
| `steel-consumer-declaration` | imports the changed support | 1 / 0 / 0 / 1 (gate unset) | 0 s |
| `steel-basic-cli-public` | the re-pointed pre-P2 lane; shares the harness | 1 / 1 / 0 / 0 | 298 s |
| `t287-w2-05-install-catalog-owner-chain` | the other re-pointed lane; shares the harness | 3 / 3 / 0 / 0 | 82 s |
| `m5-installed-portability` | shares the harness | 9 / 9 / 0 / 0 | 204 s |

The new lane is the only other importer of the changed support. The harness
(`root-cli-environment.mjs`) is unchanged, so its other importers were not run.

`npm run build` (29 s) leaves no tracked change; nothing to restore.

Lints: `lint:imports`, `lint:lifecycle` and `lint:calculus` pass. `npm run lint`
needs the recipe path; with
`test_env/qualification/recipe/verification-recipe.json` it checks 72 files,
70 pass and 2 fail ENOENT: `test_env/tests/t287-native-selection-profile-scope.test.mjs`
and `test_env/uat/continuation.test.mjs` are not in the base commit. Neither
changed file is in its list; `node --check` passes on both. `lint:evidence`
cannot run in this sparse checkout (`.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json`
is outside it).

## Residuals

- The gated `steel-consumer-declaration` would not pass with its gate set
  (read, not run). It hands `harness.rootPublication` to the fixture as the
  ABI publication (its `:302-303`); with default harness options that is the
  language-smoke fixture's publication (`root-cli-environment.mjs:194-210`),
  which the fixture's owner check (`neutral-schema-product.mjs:35-45`) refuses.
  Past that, its consumer install meets `lock_mismatch` (it does not pass the
  new parameter), and its admission names two core publications beside the
  language-smoke and consumer publications (its `:416-417`), a subset like the
  one this lane saw refused `conservation_failure`. It is an existing test
  file, so this package does not change it.
- `abg.cli` costs about 25 s per call here; 89 % of the lane's wall is its
  13 calls.
- The inventory digest for `neutral-schema-product.mjs` no longer matches the
  file (above).
- The lint recipe names two files absent from the tree (above).
