#!/usr/bin/env node
// Stamp the RC14 candidate version on one source tree: the four tracked sites
// that state the current candidate (K_RETURN D1). Idempotent: a site already at
// 5.0.0-rc.14 is left alone; a site at neither version refuses. The two
// generated files (product manifest, capability graph) are not stamped; the
// build regenerates them. Nothing is deleted; --dry-run writes only its report.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {FROM_VERSION, VERSION, PRODUCT_ID, T, GENERATED, hex, exists, inventory, mode, parseArgs, required, stamp, writeOnce, within} from './cut-common.mjs';

const USAGE = 'usage: node stamp-rc14.mjs (--dry-run | --apply) --root <repository or extracted root containing build_tenants/> --scratch <report dir>';

/** Each site: one exact textual occurrence of the old statement, and a parse check. */
// These two current-source carriers have separate owners; they are never
// text-stamped. The cut requires the new claim and exact refreshed basis.
export const OWNED_VERSION_SITES = [
  'release-claim.md',
  'test_env/fixtures/abi5-root-candidate-basis.json',
  'test_env/qualification/classification.json',
  'test_env/qualification/recipe/expected-output-inventory.json',
];

export const SITES = [
  {path: `${T}/package.json`, from: [`  "version": "${FROM_VERSION}",\n`], to: [`  "version": "${VERSION}",\n`],
    check: text => { const p = JSON.parse(text); return p.version; }},
  {path: `${T}/package-lock.json`, from: [`  "version": "${FROM_VERSION}",\n  "lockfileVersion": 3,`, `      "name": "@abiogenesis/typescript-tenant",\n      "version": "${FROM_VERSION}",\n`],
    to: [`  "version": "${VERSION}",\n  "lockfileVersion": 3,`, `      "name": "@abiogenesis/typescript-tenant",\n      "version": "${VERSION}",\n`],
    check: text => { const l = JSON.parse(text); assert.equal(l.version, l.packages[''].version, 'lock root versions disagree'); return l.version; }},
  {path: `${T}/code/src/product/contracts.ts`,
    from: [`export const ABI5_PRODUCT_ID = "product://abiogenesis/typescript-tenant@${FROM_VERSION}";\n`, `export const ABI5_PACKAGE_VERSION = "${FROM_VERSION}";\n`],
    to: [`export const ABI5_PRODUCT_ID = "${PRODUCT_ID}";\n`, `export const ABI5_PACKAGE_VERSION = "${VERSION}";\n`],
    check: text => {
      const id = /export const ABI5_PRODUCT_ID = "([^"]+)";/.exec(text)?.[1], version = /export const ABI5_PACKAGE_VERSION = "([^"]+)";/.exec(text)?.[1];
      assert.equal(id, `product://abiogenesis/typescript-tenant@${version}`, 'product id and package version disagree');
      return version;
    }},
  {path: `${T}/test_env/fixtures/t287-current-owner/README.md`, from: [`package identity \`${FROM_VERSION}\``], to: [`package identity \`${VERSION}\``],
    check: text => /package identity `([^`]+)`/.exec(text)?.[1]},
];

const HISTORICAL_VERSION_SITES = new Map([["test_env/tests/t293-rc14-qualification-preparation.test.mjs", "c96b44c444d77297e840284b8b13c8ee9cab4911378a954a78109c31a48f1c7d"]]);

const count = (text, needle) => text.split(needle).length - 1;

/** Plans (and with `write`, applies) the stamp on `root`; returns per-site rows. */
export function stampTree(root, {write}) {
  const rows = [], changes = [];
  for (const site of SITES) {
    const path = join(root, site.path);
    assert(exists(path), `stamp site missing: ${site.path}`);
    const before = readFileSync(path, 'utf8');
    const old = site.from.map(s => count(before, s)), cur = site.to.map(s => count(before, s));
    let state, after = before;
    if (old.every(n => n === 1) && cur.every(n => n === 0)) {
      state = 'stamped';
      site.from.forEach((s, i) => { after = after.replace(s, site.to[i]); });
    } else if (old.every(n => n === 0) && cur.every(n => n === 1)) state = 'already';
    else throw new Error(`stamp site ${site.path} states neither ${FROM_VERSION} nor ${VERSION} exactly (old ${old}, new ${cur})`);
    assert.equal(site.check(after), VERSION, `stamp site ${site.path} does not parse to ${VERSION}`);
    if (state === 'stamped') changes.push({path, after});
    rows.push({path: site.path, state, beforeSha256: hex(before), afterSha256: hex(after), bytesBefore: Buffer.byteLength(before), bytesAfter: Buffer.byteLength(after)});
  }
  // No other tenant source may still state the old version; only the two generated
  // files and two separately owned carriers may, until their owner refresh. Ignored outputs (the tenant's .gitignore and the
  // repository's build_tenants/*/*/test_env/test_runs/ rule) are skipped.
  const tenant = join(root, T), needle = Buffer.from(FROM_VERSION);
  const ignored = p => ['node_modules', 'build', 'artifacts', 'test_env/uat/runs', 'test_env/test_runs'].includes(p) || /^test_env\/evidence\/[^/]+\.json$/.test(p);
  const projected = new Map(changes.map(({path, after}) => [path, Buffer.from(after)]));
  const remaining = inventory(tenant, {hash: false, skip: ignored})
    .filter(r => r.kind === 'file' && (projected.get(join(tenant, r.path)) ?? readFileSync(join(tenant, r.path))).includes(needle)).map(r => r.path);
  for (const [path, digest] of HISTORICAL_VERSION_SITES) assert.equal(hex(readFileSync(join(tenant, path))), digest, 'Historical fixture changed; reacquire version census');
  const unexpected = remaining.filter(p => !GENERATED.includes(p) && !OWNED_VERSION_SITES.includes(p) && !HISTORICAL_VERSION_SITES.has(p));
  assert.deepEqual(unexpected, [], `tenant files outside the census still state ${FROM_VERSION}: ${unexpected.join(', ')}`);
  const ownedRestatement = OWNED_VERSION_SITES.map(path => {
    const bytes = readFileSync(join(tenant, path));
    if (path === 'test_env/fixtures/abi5-root-candidate-basis.json') {
      const basis = JSON.parse(bytes);
      assert.equal(basis.kind, 'abi5_root_candidate_basis');
      assert([FROM_VERSION, VERSION].includes(basis.packageVersion), 'candidate basis has an unexpected version');
    }
    return {path, sha256: hex(bytes), containsPredecessorVersion: bytes.includes(needle),
      owner: path === 'release-claim.md' ? 'Root release-claim restatement' : path === 'test_env/fixtures/abi5-root-candidate-basis.json' ? 'scripts/refresh-candidate-basis.mjs after build' : 'Root qualification metadata refresh before exact qualification'};
  });
  // Validate the complete census before changing any identity site.
  if (write) for (const change of changes) writeFileSync(change.path, change.after);
  return {from: FROM_VERSION, to: VERSION, sites: rows, ownedRestatement,
    regeneratedByBuild: remaining.filter(p => GENERATED.includes(p))};
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2), {values: ['root', 'scratch'], flags: ['dry-run', 'apply'], usage: USAGE});
  required(args, ['root', 'scratch'], USAGE);
  mode(args, USAGE);
  const root = resolve(args.root), scratch = resolve(args.scratch);
  assert(exists(join(root, T, 'package.json')), `not a source root: ${root}`);
  assert(!within(join(root, T), scratch), 'the report scratch directory must lie outside the tenant tree');
  const result = stampTree(root, {write: !args['dry-run']});
  mkdirSync(scratch, {recursive: true});
  const report = writeOnce(join(scratch, `STAMP_${args['dry-run'] ? 'DRY_RUN' : 'APPLIED'}_${stamp()}.json`),
    {kind: 'rc14_version_stamp', mode: args['dry-run'] ? 'dry-run' : 'applied', root, at: new Date().toISOString(), ...result});
  console.log(JSON.stringify({mode: args['dry-run'] ? 'dry-run' : 'applied', root, changed: result.sites.filter(s => s.state === 'stamped').map(s => s.path),
    already: result.sites.filter(s => s.state === 'already').map(s => s.path), ownedRestatement: result.ownedRestatement, regeneratedByBuild: result.regeneratedByBuild, report: report.path}));
}
