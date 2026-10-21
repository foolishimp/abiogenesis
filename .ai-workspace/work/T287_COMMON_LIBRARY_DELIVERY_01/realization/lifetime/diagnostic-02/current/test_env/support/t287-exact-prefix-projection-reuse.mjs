import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {Session} from 'node:inspector';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export async function loadProjectionOwners(packageRoot) {
  const load = name => import(pathToFileURL(join(packageRoot,'build/code/src',name+'.js')));
  const [artifact,environment,events,prefix,digests,json] = await Promise.all([
    load('abg/artifact_truth'),load('abg/environment_admission'),load('abg/event_store'),
    load('abg/event_prefix'),load('shared/digests'),load('shared/canonical_json'),
  ]);
  return {artifact,environment,events,prefix,digests,json};
}

// A read selector over actual file bytes, not append ownership or a close handoff.
export async function filePrefix(path, bytes, owners, count) {
  const selected = count === undefined ? bytes : Buffer.from(bytes.toString('utf8').trimEnd().split('\n').slice(0,count).join('\n')+'\n');
  const identity = await stat(path);
  const body = {kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:pathToFileURL(path).href,
    prefixLength:selected.length,prefixDigest:'sha256:'+sha256(selected),
    storeIdentity:{device:identity.dev,inode:identity.ino,eventContractDigest:owners.events.ROOT_EVENT_CONTRACT_DIGEST}};
  return {...body,coordinateDigest:owners.digests.sha256Canonical(body)};
}

export async function measuredEnvironment(owners, coordinate, binding) {
  const session = new Session();session.connect();
  const post = (method,params={}) => new Promise((resolve,reject)=>session.post(method,params,(error,result)=>error?reject(error):resolve(result)));
  await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:false});
  const start=performance.now(),cpu=process.cpuUsage();
  const result=owners.environment.projectExactPrefixWorkspaceEnvironment(coordinate,binding);
  const durationMs=performance.now()-start,usage=process.cpuUsage(cpu);
  const coverage=await post('Profiler.takePreciseCoverage');await post('Profiler.stopPreciseCoverage');session.disconnect();
  assert.equal(result.kind,'exact_prefix_workspace_environment',JSON.stringify(result));
  const calls = (suffix,name) => coverage.result.filter(row=>row.url.endsWith(suffix)).flatMap(row=>row.functions)
    .filter(row=>row.functionName===name).reduce((n,row)=>n+row.ranges[0].count,0);
  return {result,measurement:{durationMs,cpuUserMs:usage.user/1000,cpuSystemMs:usage.system/1000,
    artifactFolds:calls('/abg/artifact_truth.js','projectArtifactTruth'),
    eventCalculusFolds:calls('/abg/event_calculus.js','deriveRuntimeEventCalculusProjection'),
    durableReads:calls('/abg/event_store.js','readRuntimeEventsAtDurablePrefix'),
    canonicalDigest:owners.digests.sha256Canonical(result),prefix:coordinate}};
}

export async function measureRetainedEnvironment({packageRoot,eventPath,expectedSha256,repeat=false}) {
  const owners=await loadProjectionOwners(packageRoot),bytes=await readFile(eventPath);
  assert.equal(sha256(bytes),expectedSha256);
  const records=bytes.toString('utf8').trimEnd().split('\n').map(JSON.parse);
  const row=records.find(e=>e.kind==='public_operation_artifact_admitted'&&e.payload.operationId==='abg.operation.workspace.bind');
  const binding={ref:row.payload.artifactRef,digest:row.payload.authorityScopeDigest};
  const measurements=[];
  for(const count of [240,246,388]) {
    const coordinate=await filePrefix(eventPath,bytes,owners,count);
    const first=await measuredEnvironment(owners,coordinate,binding);
    assert.equal(first.result.artifactTruth.prefixEventCount,count,'new prefix is not a stale cached prefix');
    measurements.push({count,pass:'first',...first.measurement});
    if(repeat) {
      const second=await measuredEnvironment(owners,structuredClone(coordinate),binding);
      assert.equal(second.measurement.canonicalDigest,first.measurement.canonicalDigest);
      assert.strictEqual(second.result.artifactTruth,first.result.artifactTruth,'same exact-prefix computed value reused');
      measurements.push({count,pass:'repeat',...second.measurement});
    }
  }
  assert.equal(new Set(measurements.filter(m=>m.pass==='first').map(m=>m.canonicalDigest)).size,3);
  assert.equal(sha256(await readFile(eventPath)),expectedSha256);
  return {packageRoot,eventPath,eventSha256:expectedSha256,measurements,publicCalls:0,storeAcquisitions:0,eventAppends:0};
}
