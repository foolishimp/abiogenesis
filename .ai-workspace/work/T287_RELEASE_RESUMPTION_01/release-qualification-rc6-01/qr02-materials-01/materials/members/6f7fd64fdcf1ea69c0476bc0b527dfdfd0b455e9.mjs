// T-287 Phase D, D5-b item 3: the construction provenance of the pre-RC candidate of
// @abiogenesis/typescript-tenant 5.0.0-rc.1 (external_construction, reference form).
// One chain per commit that touched the tenant tree after the Phase C close (exclusive)
// up to the qualifying head (inclusive), in order. The construction before the Phase C
// close is the inherited base of this release line and is not attributed by chains
// (T-287 D5 disposition, F-4). Every record is read from Git with tenant pathspecs:
//   activation  the commit message (git log -1 --format=%B <commit>)
//   preimage    JSON manifest of the changed members' prior path and digest
//   delta       git diff <parent> <commit> -- build_tenants/abiogenesis/typescript
//   closure     JSON manifest of the postimage members (path, digest), actor = author
//   bodies      the prior and posterior bytes of every changed member (git show <rev>:<path>)
// Members a commit deletes are not postimage members. The author and the actor identity
// come from the commit's Co-Authored-By trailer.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { TENANT_ROOT } from './build-resources.mjs';

export const PHASE_C_CLOSE = '51bc5d2d8';
export const TENANT_PATH = 'build_tenants/abiogenesis/typescript';
export const REPOSITORY_ROOT = resolve(TENANT_ROOT, '../../..');
const MEMBER_REF_PREFIX = 'repo://abiogenesis/';
const sha256 = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', ['-C', REPOSITORY_ROOT, ...args], { maxBuffer: 1 << 30 });
const text = args => git(args).toString('utf8');

/** Trailer identities (D5 disposition F-4): Opus 5.5 a Worker, Fable 5.1 the Executive, no trailer the owner. */
export const CONSTRUCTION_IDENTITIES = Object.freeze({
  'Claude Opus 5.5': { authorRef: 'actor://abiogenesis/t287/worker', actorIdentityRef: 'actor-identity://anthropic/claude-opus-5.5' },
  'Claude Fable 5.1': { authorRef: 'actor://abiogenesis/t287/executive', actorIdentityRef: 'actor-identity://anthropic/claude-fable-5.1' },
  owner: { authorRef: 'actor://abiogenesis/product-owner', actorIdentityRef: 'actor-identity://abiogenesis/product-owner' },
});
function identity(message) {
  const trailers = [...message.matchAll(/^Co-Authored-By:\s*(.+?)\s*<[^>]*>\s*$/gimu)].map(m => m[1]);
  if (trailers.length > 1) throw new TypeError('more than one Co-Authored-By trailer');
  if (trailers.length === 0) return CONSTRUCTION_IDENTITIES.owner;
  const row = CONSTRUCTION_IDENTITIES[trailers[0]];
  if (row === undefined) throw new TypeError('unmapped Co-Authored-By trailer: ' + trailers[0]);
  return row;
}

/** The chain commits, oldest first. */
export function chainCommits(head, base = PHASE_C_CLOSE) {
  return text(['rev-list', '--reverse', base + '..' + head, '--', TENANT_PATH]).trim().split('\n').filter(Boolean);
}

/** Records and chains for the commits; the records hold bytes, the chains coordinates. */
export function constructChains(commits, authorityRef) {
  const records = new Map(), chains = [];
  const record = (ref, path, bytes) => {
    const row = { ref, path, digest: sha256(bytes), byteCount: bytes.length, contentBase64: bytes.toString('base64') };
    const prior = records.get(ref);
    if (prior !== undefined && prior.digest !== row.digest) throw new TypeError('record ref names two byte sequences: ' + ref);
    records.set(ref, row); return row;
  };
  for (const commit of commits) {
    const parent = text(['rev-parse', commit + '^']).trim(), short = commit.slice(0, 12);
    const message = git(['log', '-1', '--format=%B', commit]);
    const who = identity(message.toString('utf8'));
    const status = text(['diff', '--no-renames', '--name-status', parent, commit, '--', TENANT_PATH]).trim().split('\n').filter(Boolean)
      .map(line => { const [code, path] = line.split('\t'); return { code, path }; });
    if (status.some(row => !['A', 'M', 'D'].includes(row.code))) throw new TypeError('unsupported change kind in ' + short);
    const delta = git(['diff', '--no-color', '--no-ext-diff', '--no-renames', parent, commit, '--', TENANT_PATH]);
    const body = (rev, path) => {
      const oid = text(['rev-parse', rev + ':' + path]).trim();
      return record('git-blob://abiogenesis/' + oid + '/' + path, path, git(['show', rev + ':' + path]));
    };
    const prior = status.filter(row => row.code !== 'A').map(row => ({ path: row.path, body: body(parent, row.path) }));
    const posterior = status.filter(row => row.code !== 'D').map(row => ({ path: row.path, body: body(commit, row.path) }));
    if (posterior.length === 0) throw new TypeError('chain without postimage members: ' + short);
    const base = 'git-commit://abiogenesis/' + commit;
    const activation = record(base + '/activation', 'commits/' + short + '/message.txt', message);
    const preimage = record(base + '/preimage', 'commits/' + short + '/preimage.json', Buffer.from(JSON.stringify({
      kind: 'external_construction_preimage', commit, parent,
      members: prior.map(row => ({ path: row.path, digest: row.body.digest, byteCount: row.body.byteCount })) }, null, 1) + '\n'));
    const deltaRecord = record(base + '/delta', 'commits/' + short + '/delta.patch', delta);
    const closure = record(base + '/closure', 'commits/' + short + '/closure.json', Buffer.from(JSON.stringify({
      kind: 'external_construction_closure', commit, parent, actor: who.authorRef, actorIdentityRef: who.actorIdentityRef,
      members: posterior.map(row => ({ path: row.path, digest: row.body.digest, byteCount: row.body.byteCount })) }, null, 1) + '\n'));
    const postimageMembers = posterior.map(row => ({ ref: MEMBER_REF_PREFIX + row.path, path: row.path, digest: row.body.digest, byteCount: row.body.byteCount }));
    chains.push({ activationRef: activation.ref, preimageRef: preimage.ref, deltaRef: deltaRecord.ref, closureRef: closure.ref,
      authorRef: who.authorRef, actorIdentityRef: who.actorIdentityRef, authorityRef,
      scopeRefs: postimageMembers.map(m => m.ref), postimageMembers,
      changes: posterior.map(row => ({ memberRef: MEMBER_REF_PREFIX + row.path, patchPath: row.path,
        preimageMemberRef: prior.find(p => p.path === row.path)?.body.ref ?? null, postimageMemberRef: row.body.ref })),
      attributionSources: [activation, closure].map(m => ({ sourceRef: m.ref, startByte: 0, endByte: m.byteCount, spanDigest: m.digest })),
      commit, parent, deleted: status.filter(row => row.code === 'D').map(row => row.path) });
  }
  return { records: [...records.values()], chains };
}

/** The embedded provenance (records with bytes) and its resource form (records as material selections). */
export function constructProvenance(product, { inventory, chains, records }) {
  const hash = product.sha256Canonical, sorted = [...records].sort((a, b) => a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : 0);
  const recordSet = { ref: 'qualification-record-set://abiogenesis/construction/' + hash(sorted).slice(7), digest: hash(sorted) };
  const lawChains = chains.map(({ commit: _c, parent: _p, deleted: _d, ...chain }) => chain);
  const embedded = { kind: 'external_construction', subjectInventory: { ref: inventory.inventoryRef, digest: inventory.inventoryDigest },
    recordSet, records: sorted, chains: lawChains, acknowledgmentSelectionRef: null };
  return { embedded, records: sorted, recordSet, chains: lawChains,
    reference: resource => ({ ...embedded, records: sorted.map(m => ({ entryKind: 'material', entry: { ref: m.ref, digest: m.digest } })) }) };
}

/** A selection of chains with exactly their records, in the same embedded and resource forms. A task carries the
 * chains that constructed its subject members; the attribution's coverage of those members is the same as under the
 * whole chain set, since a chain that touches none of them covers none of them (validator/qualification.ts:800-804). */
export function selectChains(product, provenance, indexes) {
  const chains = indexes.map(n => provenance.chains[n]);
  const refs = new Set(chains.flatMap(c => [c.activationRef, c.preimageRef, c.deltaRef, c.closureRef,
    ...c.changes.flatMap(x => [x.preimageMemberRef, x.postimageMemberRef]).filter(Boolean)]));
  const records = provenance.records.filter(m => refs.has(m.ref)), hash = product.sha256Canonical;
  const recordSet = { ref: 'qualification-record-set://abiogenesis/construction/' + hash(records).slice(7), digest: hash(records) };
  const embedded = { ...provenance.embedded, recordSet, records, chains };
  return { embedded, records, recordSet, chains,
    reference: () => ({ ...embedded, records: records.map(m => ({ entryKind: 'material', entry: { ref: m.ref, digest: m.digest } })) }) };
}

/** Coverage of a subject member set by the chains' postimage scopes (validator/qualification.ts:800-804). */
export function chainCoverage(chains, subjectRefs) {
  const covered = new Set(chains.flatMap(c => c.scopeRefs));
  const uncovered = subjectRefs.filter(ref => !covered.has(ref));
  return { subject: subjectRefs.length, covered: subjectRefs.length - uncovered.length, uncovered };
}
