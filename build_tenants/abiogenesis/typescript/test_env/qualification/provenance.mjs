// T-287 Phase D, D5-b item 3 and D5-c item 1: the construction provenance of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1 (external_construction, reference form).
// The inherited-base chain first (D5-b disposition G-2): the tree at the Phase C close as one construction,
//   activation  the ticket's Phase C close rows (grep -n 'Phase C close', the run-ledger table rows excluded;
//               sed -n of the matched rows) under a descriptor naming the chain
//   preimage    the empty manifest
//   delta       git diff <empty tree> <Phase C close> -- build_tenants/abiogenesis/typescript
//   closure     the manifest of every member at the Phase C close
//   bodies      the posterior bytes of every member at the Phase C close
// then one chain per commit that touched the tenant tree after the Phase C close (exclusive) up to the
// qualifying head (inclusive), in order. Every commit record is read from Git with tenant pathspecs:
//   activation  the commit message (git log -1 --format=%B <commit>)
//   preimage    JSON manifest of the changed members' prior path and digest
//   delta       git diff <parent> <commit> -- build_tenants/abiogenesis/typescript
//   closure     JSON manifest of the postimage members (path, digest), actor = author, one member row per line
//   bodies      the prior and posterior bytes of every changed member (git cat-file --batch)
// Members a commit deletes are not postimage members; members deleted before the Phase C close are nobody's.
// The author and the actor identity of a commit chain come from its Co-Authored-By trailer.
//
// A task carries per-task views of the chains (taskProvenance): each subject member under the last chain that
// constructed it (its postimage digest is the member's current digest), each chain restricted to those members,
// its attribution spans the whole activation, the closure's header and the closure rows of those members. The
// attribution check (validator/qualification.ts:743-805) requires a selected material's digest to equal the
// postimage digest of every chain carrying the member: a chain whose postimage of a member was superseded
// cannot carry it in a task that embeds the member's current bytes.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { TENANT_ROOT } from './build-resources.mjs';

export const PHASE_C_CLOSE = '51bc5d2d8';
export const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
export const TENANT_PATH = 'build_tenants/abiogenesis/typescript';
export const REPOSITORY_ROOT = resolve(TENANT_ROOT, '../../..');
export const TICKET_PATH = '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md';
export const TICKET_PATTERN = 'Phase C close';
const MEMBER_REF_PREFIX = 'repo://abiogenesis/';
const sha256 = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', ['-C', REPOSITORY_ROOT, ...args], { maxBuffer: 1 << 30 });
const text = args => git(args).toString('utf8');

/** Trailer identities (D5 disposition F-4): Opus 5.5 a Worker, Fable 5.1 the Executive, no trailer the owner;
 * the inherited base (D5-b disposition G-2) the predecessor line's construction accepted at the Phase C close. */
export const CONSTRUCTION_IDENTITIES = Object.freeze({
  'Codex gpt-6-astra': { authorRef: 'actor://abiogenesis/t287/codex-worker', actorIdentityRef: 'actor-identity://openai/gpt-6-astra' },
  'Claude Opus 5.5': { authorRef: 'actor://abiogenesis/t287/worker', actorIdentityRef: 'actor-identity://anthropic/claude-opus-5.5' },
  'Claude Fable 5.1': { authorRef: 'actor://abiogenesis/t287/executive', actorIdentityRef: 'actor-identity://anthropic/claude-fable-5.1' },
  owner: { authorRef: 'actor://abiogenesis/product-owner', actorIdentityRef: 'actor-identity://abiogenesis/product-owner' },
  inheritedBase: { authorRef: 'author://abiogenesis/t287/inherited-base@' + PHASE_C_CLOSE, actorIdentityRef: 'actor-identity://abiogenesis/t287/predecessor-construction' },
});
function identity(message) {
  const trailers = [...message.matchAll(/^Co-Authored-By:\s*(.+?)\s*<[^>]*>\s*$/gimu)].map(m => m[1]);
  if (trailers.length > 1) throw new TypeError('more than one Co-Authored-By trailer');
  if (trailers.length === 0) return CONSTRUCTION_IDENTITIES.owner;
  const row = CONSTRUCTION_IDENTITIES[trailers[0]];
  if (row === undefined) throw new TypeError('unmapped Co-Authored-By trailer: ' + trailers[0]);
  return row;
}

/** Blob bodies by object id, in one git cat-file --batch process. */
function blobs(oids) {
  const unique = [...new Set(oids)], out = new Map();
  if (unique.length === 0) return out;
  const r = spawnSync('git', ['-C', REPOSITORY_ROOT, 'cat-file', '--batch'], { input: unique.join('\n') + '\n', maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new TypeError('git cat-file --batch failed: ' + r.stderr.toString('utf8'));
  let at = 0;
  for (const oid of unique) {
    const eol = r.stdout.indexOf(10, at), header = r.stdout.subarray(at, eol).toString('utf8').split(' ');
    if (header[0] !== oid || header[1] !== 'blob') throw new TypeError('git cat-file returned ' + header.join(' ') + ' for ' + oid);
    const size = Number(header[2]); out.set(oid, Buffer.from(r.stdout.subarray(eol + 1, eol + 1 + size))); at = eol + 1 + size + 1;
  }
  return out;
}
/** The blob ids of paths at one revision (tenant pathspec). */
function treeBlobs(rev, paths = null) {
  const rows = text(['ls-tree', '-r', '--full-tree', rev, '--', TENANT_PATH]).trim().split('\n').filter(Boolean).map(line => {
    const [meta, path] = line.split('\t'), [mode, type, oid] = meta.split(' ');
    if (type !== 'blob' || !['100644', '100755'].includes(mode)) throw new TypeError('unsupported tree entry at ' + rev + ': ' + line);
    return { path, oid };
  });
  const map = new Map(rows.map(r => [r.path, r.oid]));
  return paths === null ? map : new Map(paths.map(path => { const oid = map.get(path); if (oid === undefined) throw new TypeError(path + ' absent at ' + rev); return [path, oid]; }));
}

/** A closure manifest with one member row per line, and the byte span of its header and of each row. */
function closureManifest(header, members) {
  const head = Buffer.from(JSON.stringify(header).slice(0, -1) + ',"members":[\n'), parts = [head], rows = [];
  let at = head.length;
  members.forEach((m, n) => {
    const row = Buffer.from(JSON.stringify({ path: m.path, digest: m.digest, byteCount: m.byteCount }));
    rows.push({ path: m.path, startByte: at, endByte: at + row.length });
    const sep = Buffer.from(n === members.length - 1 ? '\n' : ',\n'); parts.push(row, sep); at += row.length + sep.length;
  });
  parts.push(Buffer.from(']}\n'));
  return { bytes: Buffer.concat(parts), headerSpan: { startByte: 0, endByte: head.length }, rows };
}

/** The ticket's Phase C close rows: grep -n of the pattern, the run-ledger table rows excluded, each read by sed -n. */
export function phaseCCloseRows() {
  const ticket = resolve(REPOSITORY_ROOT, TICKET_PATH);
  const matched = execFileSync('grep', ['-n', TICKET_PATTERN, ticket]).toString('utf8').trim().split('\n')
    .map(line => Number(line.slice(0, line.indexOf(':'))));
  return matched.map(n => ({ line: n, text: execFileSync('sed', ['-n', n + 'p', ticket]).toString('utf8').replace(/\n$/u, '') }))
    .filter(row => !row.text.startsWith('|'));
}

/** Records and chains: the inherited base, then one chain per commit; the records hold bytes, the chains coordinates. */
export function constructChains(commits, authorityRef, { inheritedBase = true } = {}) {
  const records = new Map(), chains = [];
  const record = (ref, path, bytes) => {
    const row = { ref, path, digest: sha256(bytes), byteCount: bytes.length, contentBase64: bytes.toString('base64') };
    const prior = records.get(ref);
    if (prior !== undefined && prior.digest !== row.digest) throw new TypeError('record ref names two byte sequences: ' + ref);
    if (prior === undefined) records.set(ref, row);
    return records.get(ref);
  };
  const blobRecord = (oid, path, bytes) => record('git-blob://abiogenesis/' + oid + '/' + path, path, bytes);
  const chain = ({ base, label, commit, parent, who, activation, preimageValue, delta, posterior, prior, deleted }) => {
    const activationRecord = record(base + '/activation', 'commits/' + label + '/activation.txt', activation);
    const preimage = record(base + '/preimage', 'commits/' + label + '/preimage.json', Buffer.from(JSON.stringify(preimageValue, null, 1) + '\n'));
    const deltaRecord = record(base + '/delta', 'commits/' + label + '/delta.patch', delta);
    const manifest = closureManifest({ kind: 'external_construction_closure', commit, parent, actor: who.authorRef, actorIdentityRef: who.actorIdentityRef },
      posterior.map(row => ({ path: row.path, digest: row.body.digest, byteCount: row.body.byteCount })));
    const closure = record(base + '/closure', 'commits/' + label + '/closure.json', manifest.bytes);
    const postimageMembers = posterior.map(row => ({ ref: MEMBER_REF_PREFIX + row.path, path: row.path, digest: row.body.digest, byteCount: row.body.byteCount }));
    const closureBytes = Buffer.from(closure.contentBase64, 'base64');
    const span = (source, bytes, s) => ({ sourceRef: source.ref, startByte: s.startByte, endByte: s.endByte, spanDigest: sha256(bytes.subarray(s.startByte, s.endByte)) });
    chains.push({ activationRef: activationRecord.ref, preimageRef: preimage.ref, deltaRef: deltaRecord.ref, closureRef: closure.ref,
      authorRef: who.authorRef, actorIdentityRef: who.actorIdentityRef, authorityRef,
      scopeRefs: postimageMembers.map(m => m.ref), postimageMembers,
      changes: posterior.map(row => ({ memberRef: MEMBER_REF_PREFIX + row.path, patchPath: row.path,
        preimageMemberRef: prior.find(p => p.path === row.path)?.body.ref ?? null, postimageMemberRef: row.body.ref })),
      attributionSources: [{ sourceRef: activationRecord.ref, startByte: 0, endByte: activationRecord.byteCount, spanDigest: activationRecord.digest },
        { sourceRef: closure.ref, startByte: 0, endByte: closure.byteCount, spanDigest: closure.digest }],
      // Not law fields (constructProvenance drops them): the closure's spans for per-task views, and the Git coordinates.
      closureSpans: { header: span(closure, closureBytes, manifest.headerSpan), rows: new Map(manifest.rows.map(r => [MEMBER_REF_PREFIX + r.path, span(closure, closureBytes, r)])) },
      commit, parent, deleted });
  };
  if (inheritedBase) {
    const commit = text(['rev-parse', PHASE_C_CLOSE]).trim(), tree = treeBlobs(commit), bodies = blobs([...tree.values()]);
    const who = CONSTRUCTION_IDENTITIES.inheritedBase, rows = phaseCCloseRows();
    const activation = Buffer.from(['external_construction activation: the inherited base of build_tenants/abiogenesis/typescript',
      'chain: inherited-base@' + commit + ' (tree ' + text(['rev-parse', commit + '^{tree}']).trim() + ')',
      'descriptor: the predecessor line\'s construction of the tenant tree up to the T-290 Phase C close commit ' + commit + ', accepted by the product owner at the Phase C close; its authorship is not attributed per commit; assess it, do not trust it blindly',
      'author: ' + who.authorRef, 'actor identity: ' + who.actorIdentityRef, 'authority: ' + authorityRef,
      'source: ' + TICKET_PATH + ', the rows matching "' + TICKET_PATTERN + '" outside the run-ledger table (grep -n; sed -n):',
      ...rows.map(row => row.line + ': ' + row.text), ''].join('\n'));
    const posterior = [...tree].map(([path, oid]) => ({ path, body: blobRecord(oid, path, bodies.get(oid)) }));
    const delta = git(['diff', '--no-color', '--no-ext-diff', '--no-renames', EMPTY_TREE, commit, '--', TENANT_PATH]);
    chain({ base: 'git-commit://abiogenesis/' + commit + '/inherited-base', label: 'inherited-base-' + commit.slice(0, 12), commit, parent: EMPTY_TREE, who,
      activation, preimageValue: { kind: 'external_construction_preimage', commit, parent: EMPTY_TREE, members: [] }, delta, posterior, prior: [], deleted: [] });
  }
  for (const commit of commits) {
    const parent = text(['rev-parse', commit + '^']).trim(), label = commit.slice(0, 12);
    const message = git(['log', '-1', '--format=%B', commit]);
    const who = identity(message.toString('utf8'));
    const status = text(['diff', '--no-renames', '--name-status', parent, commit, '--', TENANT_PATH]).trim().split('\n').filter(Boolean)
      .map(line => { const [code, path] = line.split('\t'); return { code, path }; });
    if (status.some(row => !['A', 'M', 'D'].includes(row.code))) throw new TypeError('unsupported change kind in ' + label);
    const delta = git(['diff', '--no-color', '--no-ext-diff', '--no-renames', parent, commit, '--', TENANT_PATH]);
    const before = treeBlobs(parent, status.filter(row => row.code !== 'A').map(row => row.path));
    const after = treeBlobs(commit, status.filter(row => row.code !== 'D').map(row => row.path));
    const bodies = blobs([...before.values(), ...after.values()]);
    const prior = [...before].map(([path, oid]) => ({ path, body: blobRecord(oid, path, bodies.get(oid)) }));
    const posterior = [...after].map(([path, oid]) => ({ path, body: blobRecord(oid, path, bodies.get(oid)) }));
    if (posterior.length === 0) throw new TypeError('chain without postimage members: ' + label);
    chain({ base: 'git-commit://abiogenesis/' + commit, label, commit, parent, who, activation: message,
      preimageValue: { kind: 'external_construction_preimage', commit, parent, members: prior.map(row => ({ path: row.path, digest: row.body.digest, byteCount: row.body.byteCount })) },
      delta, posterior, prior, deleted: status.filter(row => row.code === 'D').map(row => row.path) });
  }
  return { records: [...records.values()], chains };
}

/** The chain commits, oldest first. */
export function chainCommits(head, base = PHASE_C_CLOSE) {
  return text(['rev-list', '--reverse', base + '..' + head, '--', TENANT_PATH]).trim().split('\n').filter(Boolean);
}

const lawChain = ({ commit: _c, parent: _p, deleted: _d, closureSpans: _s, ...chain }) => chain;
const sortRecords = records => [...records].sort((a, b) => a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : 0);
function provenanceForm(product, inventory, chains, records, acknowledgmentSelectionRef = null) {
  const hash = product.sha256Canonical, sorted = sortRecords(records);
  const recordSet = { ref: 'qualification-record-set://abiogenesis/construction/' + hash(sorted).slice(7), digest: hash(sorted) };
  const embedded = { kind: 'external_construction', subjectInventory: { ref: inventory.inventoryRef, digest: inventory.inventoryDigest },
    recordSet, records: sorted, chains, acknowledgmentSelectionRef };
  return { embedded, records: sorted, recordSet, chains,
    reference: () => ({ ...embedded, records: sorted.map(m => ({ entryKind: 'material', entry: { ref: m.ref, digest: m.digest } })) }) };
}

/** The whole provenance (every chain whole, whole closure spans), with the last constructing chain of each member. */
export function constructProvenance(product, { inventory, chains, records }) {
  const whole = provenanceForm(product, inventory, chains.map(lawChain), records);
  const last = new Map();
  chains.forEach((c, n) => c.postimageMembers.forEach(m => last.set(m.ref, n)));
  return { ...whole, inventory, source: chains, last, recordsByRef: new Map(records.map(r => [r.ref, r])) };
}

/** Each inventory member's constructing chain: the last chain whose postimage holds it, current when its postimage
 * digest is the member's digest. A member no chain constructed, or whose last postimage is not current, is uncovered. */
export function memberCurrency(provenance, members) {
  return members.map(m => { const n = provenance.last.get(m.ref), post = n === undefined ? null : provenance.source[n].postimageMembers.find(p => p.ref === m.ref);
    return { ref: m.ref, chain: n ?? null, current: post !== null && post.digest === m.digest && post.byteCount === m.byteCount && post.path === m.path }; });
}

/** A task's provenance: each subject member under its constructing chain, each chain restricted to those members, with
 * exactly their records; spans the whole activation, the closure header and the closure rows of those members. The
 * acknowledgment selection ref is fixed with the task (it is part of the task digest), so a live run can carry an owner
 * acknowledgment of an insufficient attribution (abg/qualification_proof.ts:661-671) without re-planning. */
export function taskProvenance(product, provenance, subjectRefs, { acknowledgmentSelectionRef = null } = {}) {
  // A subject member no chain constructed (an uncommitted file) stays out of the view: the installed check then finds
  // it uncovered and returns invalid for the slot (validator/qualification.ts:800-804).
  const groups = new Map(), unconstructed = [];
  for (const ref of subjectRefs) {
    const n = provenance.last.get(ref);
    if (n === undefined) { unconstructed.push(ref); continue; }
    groups.set(n, [...(groups.get(n) ?? []), ref]);
  }
  const chains = [], refs = new Set();
  for (const n of [...groups.keys()].sort((a, b) => a - b)) {
    const source = provenance.source[n], keep = new Set(groups.get(n));
    const postimageMembers = source.postimageMembers.filter(m => keep.has(m.ref)), changes = source.changes.filter(c => keep.has(c.memberRef));
    const rows = postimageMembers.map(m => source.closureSpans.rows.get(m.ref)).sort((a, b) => a.startByte - b.startByte);
    const closure = provenance.recordsByRef.get(source.closureRef), closureBytes = Buffer.from(closure.contentBase64, 'base64');
    const merged = [];
    for (const r of rows) { const tail = merged.at(-1);
      if (tail !== undefined && r.startByte - tail.endByte <= 2) tail.endByte = r.endByte; else merged.push({ startByte: r.startByte, endByte: r.endByte }); }
    const spans = [source.closureSpans.header, ...merged.map(s => ({ sourceRef: closure.ref, ...s,
      spanDigest: sha256(closureBytes.subarray(s.startByte, s.endByte)) }))];
    chains.push({ ...lawChain(source), scopeRefs: postimageMembers.map(m => m.ref), postimageMembers, changes,
      attributionSources: [source.attributionSources[0], ...spans] });
    for (const r of [source.activationRef, source.preimageRef, source.deltaRef, source.closureRef,
      ...changes.flatMap(c => [c.preimageMemberRef, c.postimageMemberRef]).filter(Boolean)]) refs.add(r);
  }
  return { ...provenanceForm(product, provenance.inventory, chains, [...refs].map(ref => provenance.recordsByRef.get(ref)), acknowledgmentSelectionRef), unconstructed };
}

/** Coverage of a subject member set by the chains' postimage scopes (validator/qualification.ts:800-804). */
export function chainCoverage(chains, subjectRefs) {
  const covered = new Set(chains.flatMap(c => c.scopeRefs));
  const uncovered = subjectRefs.filter(ref => !covered.has(ref));
  return { subject: subjectRefs.length, covered: subjectRefs.length - uncovered.length, uncovered };
}

/** The established attributions of a provenance's chains (the output J returns when it establishes each chain). */
export const establishedAttributions = (chains, reason) => chains.map(c => ({ activationRef: c.activationRef, authorRef: c.authorRef,
  actorIdentityRef: c.actorIdentityRef, authorityRef: c.authorityRef, scopeRefs: c.scopeRefs, disposition: 'established',
  sourceRefs: [c.activationRef, c.preimageRef, c.deltaRef, c.closureRef], reason }));
