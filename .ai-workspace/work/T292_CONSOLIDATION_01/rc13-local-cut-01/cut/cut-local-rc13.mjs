#!/usr/bin/env node
// Local unqualified RC13 cut, on the route of the successful RC11 cut
// (local-cut-03): git-archive the exact tenant source of one commit into a
// fresh root, copy one verified dependency tree, compile with the pinned tsc,
// run the Product's own manifest generator and TD69 product-payload pack
// owner (offline), then prove every archive member equals the built tree and the
// Product owner `verifyProduct`, imported from the archive itself, verifies it.
// Writes the archive, its member list and a cut record to --output (create
// once). --dry-run does all of it and writes only under --scratch. No install,
// tag, selector, pin, publication, provider call or delete.
import assert from 'node:assert/strict';
import {constants, copyFileSync, cpSync, mkdirSync, readFileSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  ARCHIVE_NAME, FROM_VERSION, GENERATED, PACKAGE_NAME, PRODUCT_ID, T, VERSION,
  absent, archiveMembers, childEnvironment, exists, inventory, inventoryDigest, log, mode, now,
  parseArgs, pin, required, reserve, run, stamp, toolchain, within, writeOnce,
} from './cut-common.mjs';
import {stampTree} from './stamp-rc13.mjs';

const USAGE = `usage: node cut-local-rc13.mjs (--dry-run | --apply)
  --repo <git checkout holding the commit> --commit <40-hex> --tree <40-hex tree of that commit>
  --deps <donor .../typescript/node_modules>
  --output <release directory; must not exist> --scratch <work directory>
  [--dependency-inventory <pinned inventory json>] [--compare-archive <earlier .tgz>]
  [--scratch-stamp --scratch-claim <owned RC13 claim file>]   proof only: stamp an unstamped commit's extracted tree; --output must lie inside --scratch`;

const args = parseArgs(process.argv.slice(2), {
  values: ['repo', 'commit', 'tree', 'deps', 'output', 'scratch', 'dependency-inventory', 'compare-archive', 'scratch-claim'],
  flags: ['dry-run', 'apply', 'scratch-stamp'], usage: USAGE,
});
required(args, ['repo', 'commit', 'tree', 'deps', 'output', 'scratch'], USAGE);
const MODE = mode(args, USAGE);
const repo = resolve(args.repo), deps = resolve(args.deps), output = resolve(args.output), scratch = resolve(args.scratch);
assert(Boolean(args['scratch-claim']) === Boolean(args['scratch-stamp']), '--scratch-stamp and --scratch-claim must be supplied together');
assert(/^[0-9a-f]{40}$/.test(args.commit) && /^[0-9a-f]{40}$/.test(args.tree), '--commit and --tree are full 40-hex object names');
assert.equal(basename(deps), 'node_modules', '--deps names a node_modules directory');
assert(!within(output, scratch) && !within(scratch, output) || args['scratch-stamp'], '--output and --scratch are separate locations');
if (args['scratch-stamp']) assert(within(scratch, output) && output !== scratch, '--scratch-stamp is proof only: --output must lie inside --scratch');
absent(output, '--output');
assert(exists(dirname(output)), `parent of --output does not exist: ${dirname(output)}`);
mkdirSync(scratch, {recursive: true});
reserve([scratch, output]);

const runDir = join(scratch, `cut-${MODE}-${stamp()}`);
absent(runDir, 'run directory');
mkdirSync(runDir, {recursive: true});
const logs = join(runDir, 'commands'), env = childEnvironment(runDir), tools = toolchain(env);
const started = now(), timings = {};
const record = {kind: 'local_unqualified_development_candidate_cut', schemaVersion: '1', mode: MODE, status: 'FAILED', startedUtc: started,
  version: VERSION, packageName: PACKAGE_NAME, productId: PRODUCT_ID};
const recordInScratch = () => writeOnce(join(runDir, 'CUT_RECORD.json'), {...record, endedUtc: now()});
try {
  // Source: exactly the commit's tenant tree, never the working tree.
  const git = (label, gitArgs) => run(label, 'git', ['-C', repo, '-c', 'core.hooksPath=/dev/null', ...gitArgs], {cwd: repo, env, timeoutMs: 120000, logDir: logs}).stdout.trim();
  assert.equal(git('commit', ['rev-parse', '--verify', `${args.commit}^{commit}`]), args.commit, 'commit does not resolve to itself');
  assert.equal(git('tree', ['rev-parse', `${args.commit}^{tree}`]), args.tree, '--tree is not the tree of --commit');
  const subject = git('subject', ['log', '-1', '--format=%s', args.commit]);
  const sourceTar = join(runDir, 'source.tar'), sourceRoot = join(runDir, 'source');
  git('archive', ['archive', '--format=tar', `--output=${sourceTar}`, args.commit, T]);
  mkdirSync(sourceRoot);
  run('extract-source', 'tar', ['-xf', sourceTar, '-C', sourceRoot], {cwd: runDir, env, timeoutMs: 120000, logDir: logs});
  const tenant = join(sourceRoot, T);
  for (const p of ['build', 'node_modules', 'artifacts']) absent(join(tenant, p), `extracted ${p}`);
  const committedGenerated = GENERATED.map(p => ({...pin(join(tenant, p)), path: p}));
  const committedManifest = JSON.parse(readFileSync(join(tenant, 'product-toolchain-manifest.json'), 'utf8'));

  // Version: the commit states RC13, or (proof only) the extracted tree is stamped.
  const pkgVersion = JSON.parse(readFileSync(join(tenant, 'package.json'), 'utf8')).version;
  let scratchStampDelta = null;
  if (pkgVersion !== VERSION) {
    assert(args['scratch-stamp'], `commit states ${pkgVersion}, not ${VERSION}: stamp and commit first (stamp-rc13.mjs --apply)`);
    scratchStampDelta = stampTree(sourceRoot, {write: true});
  } else stampTree(sourceRoot, {write: false});
  let scratchClaimDelta = null;
  const claimPath = join(tenant, 'release-claim.md');
  if (args['scratch-stamp']) {
    const before = pin(claimPath), supplied = pin(resolve(args['scratch-claim']));
    copyFileSync(supplied.path, claimPath);
    scratchClaimDelta = {before, supplied, after: pin(claimPath)};
  }
  const claim = readFileSync(claimPath, 'utf8');
  assert(claim.startsWith(`# ABIogenesis ${VERSION} local development candidate\n`) && !claim.includes(FROM_VERSION),
    'release-claim.md needs its owned RC13 restatement; never relabel RC12 claims or test results');
  record.source = {repo, commit: args.commit, tree: args.tree, subject, sourceArchive: pin(sourceTar), committedVersion: pkgVersion,
    scratchStampDelta, scratchClaimDelta, releaseClaim: pin(claimPath)};

  // Dependencies: one donor tree, version-checked against the commit's lock and,
  // when given, byte-checked against a pinned inventory. Hidden-lock state is not payload authority.
  const donorRows = inventory(deps);
  let pinned = null;
  if (args['dependency-inventory']) {
    const inv = JSON.parse(readFileSync(args['dependency-inventory'], 'utf8'));
    const shape = rows => rows.map(r => r.kind === 'symlink' ? {path: r.path, kind: r.kind, target: r.target} : {path: r.path, kind: r.kind, bytes: r.bytes, sha256: r.sha256});
    assert.deepEqual(shape(donorRows), shape([...inv.rows].sort((a, b) => (a.path < b.path ? -1 : 1))), 'donor dependency tree differs from the pinned inventory');
    pinned = {...pin(resolve(args['dependency-inventory'])), rows: inv.rows.length, equal: true};
  }
  const lock = JSON.parse(readFileSync(join(tenant, 'package-lock.json'), 'utf8'));
  const locked = Object.entries(lock.packages).filter(([key]) => key.startsWith('node_modules/'));
  for (const [key, row] of locked) {
    const installed = JSON.parse(readFileSync(join(dirname(deps), key, 'package.json'), 'utf8'));
    assert.equal(installed.version, row.version, `donor ${key} is ${installed.version}, the commit's lock states ${row.version}`);
  }
  cpSync(deps, join(tenant, 'node_modules'), {recursive: true, verbatimSymlinks: true, preserveTimestamps: true});
  const copyRows = inventory(join(tenant, 'node_modules'));
  assert.deepEqual(copyRows, donorRows, 'copied dependency tree differs from the donor');
  record.dependencies = {donor: deps, donorFilesAndLinks: donorRows.length, donorInventoryDigest: inventoryDigest(donorRows), pinnedInventory: pinned,
    lockedPackagesVersionChecked: locked.length, payloadOwner: 'scripts/product-payload.mjs'};

  // Build: pinned tsc, then the Product's deterministic payload/manifest owners.
  timings.compile = run('compile', process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], {cwd: tenant, env, timeoutMs: 240000, logDir: logs}).wallMs;
  timings.generate = run('generate', process.execPath, ['scripts/generate-product-manifest.mjs'], {cwd: tenant, env, timeoutMs: 600000, logDir: logs}).wallMs;
  const basisPath = join(tenant, 'test_env/fixtures/abi5-root-candidate-basis.json');
  if (args['scratch-stamp']) {
    const before = pin(basisPath);
    timings.refreshBasis = run('refresh-candidate-basis', process.execPath, ['scripts/refresh-candidate-basis.mjs'],
      {cwd: tenant, env, timeoutMs: 120000, logDir: logs}).wallMs;
    record.source.scratchBasisRefresh = {owner: 'scripts/refresh-candidate-basis.mjs', before, after: pin(basisPath)};
  }
  const packDir = join(runDir, 'pack');
  mkdirSync(packDir);
  const packed = run('pack', process.execPath, ['scripts/product-payload.mjs', 'pack', packDir], {cwd: tenant, env, timeoutMs: 120000, logDir: logs});
  timings.pack = packed.wallMs;
  const packJson = JSON.parse(packed.stdout);
  assert(Array.isArray(packJson) && packJson.length === 1 && packJson[0].filename === ARCHIVE_NAME, 'payload pack owner did not report the one expected archive');
  const packedArchive = join(packDir, ARCHIVE_NAME), archivePin = pin(packedArchive);
  assert.equal(packJson[0].size, archivePin.bytes, 'payload pack size differs from the archive');

  // Archive = built tree: member set is the manifest locators plus the two generated files; every member is byte-equal.
  const manifest = JSON.parse(readFileSync(join(tenant, 'product-toolchain-manifest.json'), 'utf8'));
  const members = archiveMembers(packedArchive);
  const expectedPaths = [...new Set([...manifest.productRelativeLocators, ...GENERATED])].sort();
  assert.deepEqual(members.map(m => m.path), expectedPaths, 'archive member set differs from the manifest locators plus generated files');
  for (const m of members) assert(readFileSync(join(tenant, m.path)).equals(m.data), `archive member differs from the built tree: ${m.path}`);
  const built = ['build', 'contracts'].flatMap(dir => inventory(join(tenant, dir), {hash: false}).map(r => `${dir}/${r.path}`));
  const memberSet = new Set(members.map(m => m.path));
  const omitted = built.filter(p => !memberSet.has(p));
  assert.deepEqual(omitted, [], 'built build/** or contracts/** files missing from the archive');
  const extractDir = join(runDir, 'archive-extract');
  mkdirSync(extractDir);
  run('extract-archive', 'tar', ['-xzf', packedArchive, '-C', extractDir], {cwd: runDir, env, timeoutMs: 120000, logDir: logs});
  const extracted = inventory(join(extractDir, 'package'));
  assert.deepEqual(extracted.map(r => [r.path, r.sha256]), members.map(m => [m.path, m.sha256]), 'tar extraction differs from the parsed members');

  // Product owners from the archive itself verify the archive.
  Object.assign(process.env, env);
  const product = await import(pathToFileURL(join(extractDir, 'package/build/code/src/product/index.js')).href);
  assert.equal(product.ABI5_PACKAGE_VERSION, VERSION);
  assert.equal(product.ABI5_PRODUCT_ID, PRODUCT_ID);
  for (const [key, value] of [['productId', PRODUCT_ID], ['packageName', PACKAGE_NAME], ['packageVersion', VERSION]]) assert.equal(manifest[key], value, `manifest ${key}`);
  const identity = {artifactDigest: `sha256:${archivePin.sha256}`, productContentDigest: manifest.productContentDigest, manifestDigest: product.sha256Canonical(manifest)};
  // The fixture is an owned proof input outside the runtime payload, not a stamp site.
  assert(!expectedPaths.includes('test_env/fixtures/abi5-root-candidate-basis.json'));
  const basis = JSON.parse(readFileSync(basisPath, 'utf8'));
  assert.deepEqual(basis, {kind: 'abi5_root_candidate_basis', schemaVersion: '5.0.0', ...identity,
    productId: PRODUCT_ID, packageName: PACKAGE_NAME, packageVersion: VERSION},
    'candidate basis differs from the actual archive; refresh with scripts/refresh-candidate-basis.mjs after the final build and commit it');
  record.candidateBasis = {...pin(basisPath), exactArchiveIdentity: true, runtimePayload: false};
  stampTree(sourceRoot, {write: false});
  const verify = async path => {
    const result = await product.verifyProduct({artifactPath: path, artifactRef: pathToFileURL(path).href,
      expectedArtifactDigest: identity.artifactDigest, expectedProductContentDigest: identity.productContentDigest, expectedManifestDigest: identity.manifestDigest,
      expectedProductId: PRODUCT_ID, expectedPackageName: PACKAGE_NAME, expectedPackageVersion: VERSION});
    assert.equal(result.disposition, 'verified', JSON.stringify(result).slice(0, 2000));
    assert(product.isVerifiedProductArtifact(result));
    return result;
  };
  let verified = await verify(packedArchive);

  // Candidate facts the installed smoke later checks, taken from the archive's own members.
  const pkg = JSON.parse(readFileSync(join(extractDir, 'package/package.json'), 'utf8'));
  const adapter = JSON.parse(readFileSync(join(extractDir, 'package/contracts/public-functions/adapter-projection.json'), 'utf8'));
  record.candidate = {packageExports: Object.keys(pkg.exports), packageExportCount: Object.keys(pkg.exports).length,
    publicFunctionDefinitionCount: adapter.sdkMembers.length, publicFunctionFamilyDigest: adapter.family.familyDigest,
    bin: pkg.bin, bundleDependencies: pkg.bundleDependencies};

  // Generated files: the commit's copies agree with the archive, or (scratch stamp only) the drift is recorded.
  const regenerated = GENERATED.map(p => ({...pin(join(tenant, p)), path: p}));
  const generatedEqual = regenerated.every((r, i) => r.sha256 === committedGenerated[i].sha256);
  record.generated = {equal: generatedEqual, committed: committedGenerated, regenerated};
  if (!generatedEqual) {
    const old = committedManifest;
    const before = new Set(old.productRelativeLocators ?? []), after = new Set(manifest.productRelativeLocators);
    record.generated.locatorDelta = {added: [...after].filter(p => !before.has(p)), removed: [...before].filter(p => !after.has(p)),
      committedVersion: old.packageVersion, committedContentDigest: old.productContentDigest};
    assert(args['scratch-stamp'], `regenerated ${GENERATED.join(' and ')} differ from the commit: rebuild in the worktree through the payload owner, commit them, then cut (${JSON.stringify(record.generated.locatorDelta).slice(0, 600)})`);
  }

  if (args['compare-archive']) {
    const other = archiveMembers(resolve(args['compare-archive'])), otherBy = new Map(other.map(m => [m.path, m.sha256]));
    record.comparison = {archive: pin(resolve(args['compare-archive'])), members: other.length,
      added: members.filter(m => !otherBy.has(m.path)).map(m => m.path), removed: other.filter(m => !memberSet.has(m.path)).map(m => m.path),
      changed: members.filter(m => otherBy.has(m.path) && otherBy.get(m.path) !== m.sha256).length,
      unchanged: members.filter(m => otherBy.get(m.path) === m.sha256).length};
  }

  const memberRows = members.map(({path, bytes, sha256, mode: fileMode}) => ({path, bytes, sha256, mode: fileMode}));
  const membersRecord = {archiveName: ARCHIVE_NAME, archiveSha256: archivePin.sha256, members: memberRows.length,
    payloadBytes: memberRows.reduce((n, r) => n + r.bytes, 0), inventoryDigest: inventoryDigest(memberRows), rows: memberRows};
  record.archive = {name: ARCHIVE_NAME, bytes: archivePin.bytes, sha256: archivePin.sha256, path: packedArchive};
  record.identity = identity;
  record.members = {count: membersRecord.members, payloadBytes: membersRecord.payloadBytes, inventoryDigest: membersRecord.inventoryDigest,
    file: 'ARCHIVE_MEMBERS.json', builtTreeByteEqual: true, buildAndContractsFilesAllPresent: built.length};
  record.verification = {owner: 'product.verifyProduct imported from the archive', disposition: verified.disposition, checkedPayloadFiles: verified.checkedPayloadFiles ?? null};
  record.toolchain = tools;
  record.environment = env;
  record.timingsMs = timings;
  record.buildRoot = tenant;
  record.claims = {local: true, unqualified: true, published: false, installed: false, providerCalls: 0, nativeRuns: 0,
    tagsCreated: false, selectorChanged: false, pinChanged: false, qualificationTransferredFromEarlierCandidates: false};
  // The claim names what was built: the commit's tree, or its tree after the scratch stamp, and any regenerated-file drift.
  const stampedSites = (scratchStampDelta?.sites ?? []).filter(r => r.state === 'stamped').map(r => r.path);
  const builtTree = stampedSites.length === 0 ? 'the built tree of that commit'
    : `the built tree of that commit's extracted source after a scratch stamp of ${stampedSites.length} site(s) (${stampedSites.join(', ')})`;
  const drift = (stampedSites.length === 0 ? '' : ' It is not the built tree of the commit itself.') +
    (scratchClaimDelta ? ' The extracted release claim was replaced and the proof fixture refreshed through its owner for this scratch proof.' : '') +
    (generatedEqual ? '' : ` Its regenerated ${GENERATED.join(' and ')} differ from the commit's copies.`);
  record.claim = `Local unqualified development candidate ${VERSION} cut from ${args.commit}. It proves only that this archive is ${builtTree} and that the Product's own verifier accepts it.${drift} No qualification, Hello, native-workflow or earlier-candidate result transfers to artifact ${identity.artifactDigest}.`;
  writeOnce(join(runDir, 'ARCHIVE_MEMBERS.json'), membersRecord);

  if (MODE === 'apply') {
    mkdirSync(output, {mode: 0o755});
    const finalArchive = join(output, ARCHIVE_NAME);
    copyFileSync(packedArchive, finalArchive, constants.COPYFILE_EXCL);
    assert.deepEqual({...pin(finalArchive), path: null}, {...archivePin, path: null}, 'archive copy differs');
    verified = await verify(finalArchive);
    record.archive.path = finalArchive;
    record.status = 'CUT_COMPLETE_INSTALL_NOT_PERFORMED';
    writeOnce(join(output, 'ARCHIVE_MEMBERS.json'), membersRecord);
    const cut = writeOnce(join(output, 'CUT_RECORD.json'), {...record, endedUtc: now()});
    recordInScratch();
    console.log(JSON.stringify({status: record.status, version: VERSION, commit: args.commit, archive: record.archive, identity, members: record.members.count,
      payloadBytes: record.members.payloadBytes, generatedEqual, payloadOwner: 'scripts/product-payload.mjs', cutRecord: cut, timingsMs: timings}));
  } else {
    record.status = 'DRY_RUN_COMPLETE_NOTHING_WRITTEN_OUTSIDE_SCRATCH';
    const cut = recordInScratch();
    console.log(JSON.stringify({status: record.status, version: VERSION, commit: args.commit, archive: record.archive, identity, members: record.members.count,
      payloadBytes: record.members.payloadBytes, generatedEqual, payloadOwner: 'scripts/product-payload.mjs', outputAbsent: !exists(output), cutRecord: cut, timingsMs: timings}));
  }
} catch (error) {
  record.error = String(error?.stack ?? error);
  log(`cut failed: ${error?.message ?? error}`);
  try { recordInScratch(); } catch {}
  log(`run directory preserved: ${runDir}`);
  process.exitCode = 1;
}
