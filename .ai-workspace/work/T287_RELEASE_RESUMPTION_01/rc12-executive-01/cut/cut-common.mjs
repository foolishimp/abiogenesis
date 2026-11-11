// Shared mechanics for the RC12 local cut scripts: arguments, pins, create-once
// writes, inventories, a tar.gz member reader, the npm hidden-lockfile
// predicate and bounded child commands. Plain Node; no dependency; no delete.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, realpathSync, statSync, statfsSync, writeFileSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {gunzipSync} from 'node:zlib';

export const T = 'build_tenants/abiogenesis/typescript';
export const FROM_VERSION = '5.0.0-rc.11';
export const VERSION = '5.0.0-rc.12';
export const PACKAGE_NAME = '@abiogenesis/typescript-tenant';
export const PRODUCT_ID = `product://abiogenesis/typescript-tenant@${VERSION}`;
export const ARCHIVE_NAME = `abiogenesis-typescript-tenant-${VERSION}.tgz`;
export const GENERATED = ['product-toolchain-manifest.json', 'contracts/capabilities/capability-definition-graph.json'];
export const RESERVE_BYTES = 4 * 1024 ** 3;

export const hex = bytes => createHash('sha256').update(bytes).digest('hex');
export const now = () => new Date().toISOString();
export const stamp = () => `${now().replace(/[-:.]/g, '')}-${process.pid}`;

/** `--key value` options and bare `--flag` switches; unknown names refuse. */
export function parseArgs(argv, {values, flags, usage}) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--')) fail(usage, `unexpected argument ${argv[i]}`);
    if (flags.includes(name)) out[name] = true;
    else if (values.includes(name)) {
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) fail(usage, `--${name} needs a value`);
      out[name] = argv[++i];
    } else fail(usage, `unknown option --${name}`);
  }
  return out;
}
export function fail(usage, message) {
  process.stderr.write(`${message}\n${usage}\n`);
  process.exit(2);
}
export function required(args, names, usage) {
  for (const name of names) if (args[name] === undefined) fail(usage, `missing --${name}`);
}

/** Exactly one of --dry-run and --apply; nothing is written for real without --apply. */
export function mode(args, usage) {
  if (Boolean(args['dry-run']) === Boolean(args.apply)) fail(usage, 'choose exactly one of --dry-run and --apply');
  return args.apply ? 'apply' : 'dry-run';
}

export function pin(path) {
  const st = lstatSync(path);
  assert(st.isFile() && !st.isSymbolicLink(), `not a regular file: ${path}`);
  const bytes = readFileSync(path);
  return {path, bytes: bytes.length, sha256: hex(bytes)};
}
export function exists(path) {
  try { lstatSync(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
export function absent(path, what = 'location') {
  assert(!exists(path), `${what} already exists (create-once; nothing is overwritten or removed): ${path}`);
}
/** True when `inner` is `outer` or below it. */
export function within(outer, inner) {
  const rel = relative(resolve(outer), resolve(inner));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}
export function writeOnce(path, value) {
  writeFileSync(path, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
  return pin(path);
}
export function nearestExisting(path) {
  let at = resolve(path);
  while (!exists(at)) at = dirname(at);
  return at;
}
export function freeBytes(path) {
  const s = statfsSync(nearestExisting(path));
  return s.bavail * s.bsize;
}
export function reserve(paths) {
  for (const path of paths) {
    const free = freeBytes(path);
    assert(free >= RESERVE_BYTES, `free space ${free} under the 4 GiB reserve at ${path}; stop, preserve everything`);
  }
}

/** Files and symlinks below `root`, sorted by path; directories are implied. */
export function inventory(root, {skip = () => false, hash = true} = {}) {
  const rows = [];
  const walk = (dir, prefix) => {
    for (const name of readdirSync(dir).sort()) {
      const path = prefix + name, full = join(dir, name);
      if (skip(path)) continue;
      const st = lstatSync(full);
      if (st.isSymbolicLink()) rows.push({path, kind: 'symlink', target: readlinkSync(full)});
      else if (st.isDirectory()) walk(full, path + '/');
      else if (st.isFile()) {
        const row = {path, kind: 'file', bytes: st.size, mode: st.mode & 0o777};
        if (hash) row.sha256 = hex(readFileSync(full));
        rows.push(row);
      } else throw new Error(`unsupported file type below ${root}: ${path}`);
    }
  };
  walk(root, '');
  return rows.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
export const inventoryDigest = rows => hex(Buffer.from(JSON.stringify(rows)));

/** Every member of an npm tar.gz: ustar headers with pax `path`/`size` records. */
export function readTarGz(path) {
  const buf = gunzipSync(readFileSync(path));
  const rows = [];
  let offset = 0, pax = null;
  const parsePax = data => {
    const out = {};
    let at = 0;
    while (at < data.length) {
      const space = data.indexOf(0x20, at), length = Number(data.subarray(at, space).toString('ascii'));
      assert(Number.isSafeInteger(length) && length > 0, 'malformed pax record');
      const record = data.subarray(space + 1, at + length - 1).toString('utf8'), eq = record.indexOf('=');
      out[record.slice(0, eq)] = record.slice(eq + 1);
      at += length;
    }
    return out;
  };
  while (offset + 512 <= buf.length) {
    const header = buf.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const text = (start, end) => {
      const field = header.subarray(start, end), zero = field.indexOf(0);
      return field.subarray(0, zero < 0 ? field.length : zero).toString('utf8');
    };
    const octal = (start, end) => parseInt(text(start, end).trim() || '0', 8);
    let checksum = 0;
    for (let i = 0; i < 512; i++) checksum += i >= 148 && i < 156 ? 32 : header[i];
    assert.equal(checksum, octal(148, 156), `tar header checksum at offset ${offset}`);
    const type = header[156] === 0 ? '0' : String.fromCharCode(header[156]);
    const prefix = text(257, 263).startsWith('ustar') ? text(345, 500) : '';
    const size = pax?.size === undefined ? octal(124, 136) : Number(pax.size);
    const data = buf.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === 'x') { pax = parsePax(data); continue; }
    if (type === 'g') continue;
    const name = pax?.path ?? (prefix ? `${prefix}/${text(0, 100)}` : text(0, 100));
    rows.push({name, type, mode: octal(100, 108), size, data: Buffer.from(data)});
    pax = null;
  }
  return rows;
}

/** Archive members as payload rows; every member is a regular file below `package/`. */
export function archiveMembers(path) {
  const seen = new Set();
  return readTarGz(path).map(member => {
    assert.equal(member.type, '0', `non-file archive member ${member.name}`);
    assert(member.name.startsWith('package/'), `member outside package/: ${member.name}`);
    const rel = member.name.slice('package/'.length);
    assert(rel && !isAbsolute(rel) && !rel.split('/').some(x => !x || x === '.' || x === '..'), `unsafe member ${member.name}`);
    assert(!seen.has(rel), `duplicate member ${member.name}`);
    seen.add(rel);
    return {path: rel, bytes: member.size, sha256: hex(member.data), mode: member.mode, data: member.data};
  }).sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * npm's hidden-lockfile predicate (arborist shrinkwrap `assertNoNewer`): the
 * hidden lock `node_modules/.package-lock.json` is used only when no walked
 * package, scope or node_modules directory is newer than the lock's mtime + 10
 * ms and the lock and the tree name the same packages. When it is used, npm
 * packs bundled dependencies from the lock (no per-package `files` lists);
 * otherwise it reads each dependency's own package.json.
 */
export function npmPacklistBranch(projectRoot) {
  const lockPath = join(projectRoot, 'node_modules/.package-lock.json');
  if (!exists(lockPath)) return {branch: 'package-files', reason: 'no hidden lockfile'};
  const data = JSON.parse(readFileSync(lockPath, 'utf8'));
  const lockTime = Math.trunc(statSync(lockPath).mtimeMs) + 10;
  const seen = new Set(), violations = [];
  const walk = dir => {
    const rel = relative(projectRoot, dir).split(sep).join('/');
    const base = rel.split('/').at(-1);
    const isNM = dir !== projectRoot && base === 'node_modules', isScope = dir !== projectRoot && base.startsWith('@');
    if (data.packages?.[rel]?.ideallyInert) return;
    seen.add(rel);
    let parent = dir, entries;
    if (dir === projectRoot) entries = [{name: 'node_modules', dir: true, link: false}];
    else {
      const dirTime = Math.trunc(statSync(dir).mtimeMs);
      if (dirTime > lockTime) violations.push({path: rel, reason: 'newer_directory', dirTime, lockTime});
      if (!isScope && !isNM && !data.packages?.[rel]) violations.push({path: rel, reason: 'missing_from_lockfile'});
      parent = isNM || isScope ? dir : join(dir, 'node_modules');
      entries = exists(parent) ? readdirSync(parent, {withFileTypes: true}).map(d => ({name: d.name, dir: d.isDirectory(), link: d.isSymbolicLink()})) : [];
    }
    for (const entry of entries) {
      const child = join(parent, entry.name);
      if (entry.dir && !entry.name.startsWith('.')) walk(child);
      else if (entry.link) {
        const target = resolve(parent, readlinkSync(child));
        seen.add(relative(projectRoot, child).split(sep).join('/'));
        let isDir = false;
        try { isDir = statSync(target).isDirectory(); } catch {}
        if (isDir && !seen.has(relative(projectRoot, target).split(sep).join('/'))) walk(target);
      }
    }
  };
  walk(projectRoot);
  for (const loc of Object.keys(data.packages ?? {})) {
    if (!seen.has(loc) && !data.packages[loc].ideallyInert) violations.push({path: loc, reason: 'missing_from_node_modules'});
  }
  return violations.length === 0
    ? {branch: 'hidden-lock', reason: 'hidden lockfile is the newest entry', lock: {...pin(lockPath), mtimeMs: statSync(lockPath).mtimeMs}}
    : {branch: 'package-files', reason: 'hidden lockfile rejected', lock: {...pin(lockPath), mtimeMs: statSync(lockPath).mtimeMs},
      violations: violations.length, firstViolations: violations.slice(0, 5)};
}

/** A closed child environment: pinned PATH, isolated npm configuration and cache, offline, no scripts. */
export function childEnvironment(runDir) {
  const npmDir = join(runDir, 'npm');
  mkdirSync(npmDir, {recursive: true});
  mkdirSync(join(runDir, 'tmp'), {recursive: true});
  for (const name of ['npm-user.npmrc', 'npm-global.npmrc']) if (!exists(join(npmDir, name))) writeFileSync(join(npmDir, name), '', {flag: 'wx'});
  return {
    HOME: process.env.HOME,
    PATH: `${dirname(realpathSync(process.execPath))}:/usr/bin:/bin:/usr/sbin:/sbin`,
    LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8', CI: '1',
    GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0',
    TMPDIR: join(runDir, 'tmp'), NODE_OPTIONS: '--max-old-space-size=8192',
    npm_config_userconfig: join(npmDir, 'npm-user.npmrc'), npm_config_globalconfig: join(npmDir, 'npm-global.npmrc'),
    npm_config_cache: join(npmDir, 'cache'), npm_config_offline: 'true', npm_config_ignore_scripts: 'true',
    npm_config_audit: 'false', npm_config_fund: 'false', npm_config_update_notifier: 'false',
  };
}

/** Runs one bounded command, keeps its output under `logDir`, and fails closed. */
export function run(label, command, args, {cwd, env, timeoutMs, logDir}) {
  const started = Date.now();
  const result = spawnSync(command, args, {cwd, env, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 256 * 1024 * 1024});
  const wallMs = Date.now() - started;
  mkdirSync(logDir, {recursive: true});
  writeFileSync(join(logDir, `${label}.stdout`), result.stdout ?? '', {flag: 'wx'});
  writeFileSync(join(logDir, `${label}.stderr`), result.stderr ?? '', {flag: 'wx'});
  const receipt = {label, command, args, cwd, exitCode: result.status, signal: result.signal, wallMs, error: result.error ? String(result.error) : null};
  writeFileSync(join(logDir, `${label}.json`), JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
  assert(result.error === undefined && result.status === 0 && result.signal === null,
    `${label} failed (exit ${result.status}, signal ${result.signal}${result.error ? ', ' + result.error : ''}); see ${logDir}/${label}.stderr`);
  return {stdout: result.stdout, wallMs};
}

export function toolchain(env) {
  const tool = name => {
    const found = spawnSync('/usr/bin/which', [name], {env, encoding: 'utf8'}).stdout.trim();
    assert(found, `tool not found on the pinned PATH: ${name}`);
    const real = realpathSync(found);
    return {name, path: found, realPath: real, sha256: hex(readFileSync(real))};
  };
  const version = (cmd, args) => spawnSync(cmd, args, {env, encoding: 'utf8'}).stdout.trim();
  return {
    node: {...tool('node'), version: process.version, execPath: realpathSync(process.execPath)},
    npm: {...tool('npm'), version: version('npm', ['--version'])},
    tar: tool('tar'), git: tool('git'),
  };
}

export const log = (...parts) => process.stderr.write(parts.join(' ') + '\n');
