import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

export const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
export const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
export function inside(root, path) {
  const part = relative(root, path);
  return part !== '..' && !part.startsWith('../') && !isAbsolute(part);
}
export function fixturePath(root, path) {
  if (typeof path !== 'string' || path.length === 0 || isAbsolute(path)) throw new TypeError('Fixture path must be relative');
  const selected = resolve(root, path);
  if (!inside(root, selected)) throw new TypeError('Fixture path leaves its owned root');
  return selected;
}
export async function loadScenarios(root) {
  root = await realpath(root);
  const manifestBytes = await readFile(resolve(root, 'scenarios.json'));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const rows = Array.isArray(manifest) ? manifest : manifest.scenarios;
  if (!Array.isArray(rows) || rows.length !== 7 || new Set(rows.map(row => row.key)).size !== 7) {
    throw new TypeError('Sandbox UAT acquisition must declare exactly seven unique original workloads');
  }
  for (const row of rows) {
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(row.key)) throw new TypeError('Invalid scenario key');
    for (const key of ['requestFile', 'sourceFile', 'oracleFile', 'oracleModule']) fixturePath(root, row[key]);
  }
  return {root, manifest, manifestBytes, manifestDigest:digest(manifestBytes), rows};
}
export function selectScenarios(rows, {caseKey, all = false} = {}) {
  if (all && caseKey) throw new TypeError('Select one case or all');
  if (all) return rows;
  const selected = rows.filter(row => row.key === caseKey);
  if (selected.length !== 1) throw new TypeError('Select one declared case with --case or use --all');
  return selected;
}
export async function acquireScenario(root, row) {
  const pins=row.acquisitionDigests;
  if(!Array.isArray(pins)||pins.length===0)throw new TypeError('Exact workload acquisition digests are required');
  if(new Set(pins.map(pin=>pin.path)).size!==pins.length)throw new TypeError('Duplicate acquisition asset path');
  for(const required of [row.requestFile,row.oracleFile,row.sourceFile,row.oracleModule])if(!pins.some(pin=>pin.path===required))throw new TypeError('Unpinned workload asset: '+required);
  const assets=[];
  for(const pin of pins) {
    const path=fixturePath(root,pin.path);
    if(!inside(root,await realpath(path)))throw new TypeError('Acquisition asset leaves fixture root');
    const bytes=await readFile(path);
    if(digest(bytes)!==pin.digest||(pin.byteCount!==undefined&&bytes.length!==pin.byteCount))throw new TypeError('Acquisition digest mismatch: '+pin.path);
    assets.push({path:pin.path,digest:pin.digest,byteCount:bytes.length,bytes});
  }
  const request = JSON.parse(assets.find(asset=>asset.path===row.requestFile).bytes.toString('utf8'));
  if (!Array.isArray(request.sourceMembers) || request.sourceMembers.length === 0) throw new TypeError('Original source members are required');
  const sources = [];
  for (const member of request.sourceMembers) {
    fixturePath('/worksite', member.path);
    const asset=assets.find(asset=>asset.path===member.fixtureFile);
    if(!asset)throw new TypeError('Unpinned source member: '+member.fixtureFile);
    const bytes = asset.bytes;
    if (asset.digest !== member.digest) throw new TypeError('Acquisition digest mismatch: ' + member.fixtureFile);
    sources.push({...member, bytes});
  }
  if (new Set(sources.map(member => member.path)).size !== sources.length) throw new TypeError('Duplicate original worksite path');
  return {row, request, sources, assets};
}

// Retain the exact bytes already acquired, not a later copy of a moving tree.
// The manifest retains all seven declarations; only selected assets are copied.
export async function snapshotScenario(fixtures, selected, archiveRoot) {
  const {manifestBytes,manifestDigest}=fixtures;
  if(!Buffer.isBuffer(manifestBytes)||digest(manifestBytes)!==manifestDigest)throw new TypeError('Acquired manifest bytes changed');
  const manifest=JSON.parse(manifestBytes.toString('utf8'));
  const row=(Array.isArray(manifest)?manifest:manifest.scenarios).find(row=>row.key===selected.row.key);
  if(!isDeepStrictEqual(row,selected.row))throw new TypeError('Selected scenario differs from acquired manifest');
  const root=fixturePath(archiveRoot,'oracle-inputs');await mkdir(root);
  const manifestRef={path:'scenarios.json',digest:manifestDigest,byteCount:manifestBytes.length};
  await writeFile(fixturePath(root,manifestRef.path),manifestBytes,{flag:'wx'});
  const assets=[];
  for(const asset of selected.assets) {
    const pin=row.acquisitionDigests.find(pin=>pin.path===asset.path);
    if(!pin||digest(asset.bytes)!==pin.digest||(pin.byteCount!==undefined&&asset.bytes.length!==pin.byteCount))throw new TypeError('Acquisition digest mismatch: '+asset.path);
    const path=fixturePath(root,asset.path);await mkdir(dirname(path),{recursive:true});
    await writeFile(path,asset.bytes,{flag:'wx'});
    assets.push({path:asset.path,digest:pin.digest,byteCount:asset.bytes.length});
  }
  if(assets.length!==row.acquisitionDigests.length)throw new TypeError('Snapshot acquisition inventory is incomplete');
  return {kind:'sandbox_uat_oracle_snapshot',scenarioKey:row.key,root,manifest:manifestRef,assets,oracleModule:row.oracleModule};
}

export async function acquireArchivedScenario(snapshot) {
  const fixtures=await loadScenarios(snapshot.root);
  if(fixtures.manifestDigest!==snapshot.manifest.digest||fixtures.manifestBytes.length!==snapshot.manifest.byteCount)throw new TypeError('Archived manifest digest mismatch');
  const [row]=selectScenarios(fixtures.rows,{caseKey:snapshot.scenarioKey});
  if(row.oracleModule!==snapshot.oracleModule)throw new TypeError('Archived checker selection changed');
  const selected=await acquireScenario(fixtures.root,row);
  if(!isDeepStrictEqual(selected.assets.map(({bytes,...asset})=>asset),snapshot.assets))throw new TypeError('Archived acquisition inventory differs');
  return selected;
}

export function constructWorkloadInput(product, selected, assessment, toolchains) {
  const request = selected.request;
  const commands = request.testing.commands.map(command => {
    const configured = toolchains[command.executable];
    if (!configured?.executable) throw new TypeError('No explicit toolchain binding for ' + command.executable);
    return {...command, executable: configured.executable,
      environment: {...(command.environment ?? {}), ...(configured.environment ?? {})}};
  });
  // Source templates retain acquisition/provenance separately. The installed
  // owner constructs and checks its own strict governance carrier.
  return product.constructGovernanceWorkState({
    taskRef: request.taskRef, task: request.task,
    sources: selected.sources.map(({path, digest: sourceDigest}) => ({path, digest: sourceDigest})),
    requiredSupportRefs: request.requiredSupportRefs, authorityRefs: request.authorityRefs,
    readRoots: request.readRoots, maxContextFiles: request.maxContextFiles,
    maxContextBytes: request.maxContextBytes, maxPromptBytes: request.maxPromptBytes,
    workOrders: request.workOrders,
    testing: {...request.testing, commands},
    assessment: {...request.assessment, ...assessment},
  });
}
