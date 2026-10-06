// READ-ONLY installed projection and owner currentness checks. Never imports a
// driver/caller, opens a writable event store or invokes a Public CLI.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {loadRuntime} from './public-support.mjs';
const D=import.meta.dirname,P=join(D,'../final-f11-native-assessment-01');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=(n,v)=>fs.writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const sha=b=>createHash('sha256').update(b).digest('hex');
const began=performance.now(),core=await read(join(D,'selected-core.json'));
assert.equal(await fs.realpath(D),D);
assert.equal(await fs.realpath(core.installedRoot),core.installedRoot);
const {abg,product}=await loadRuntime(core.installedRoot);
const resource=await read(join(D,'resource-plan.json'));
const handoff=await read(join(D,'initial-handoff.json'));
const former=await read(join(P,'closed-current-environment.json'));
const binding={ref:former.workspaceBinding.bindingId,digest:former.workspaceBinding.bindingDigest};
const before=await fs.stat(resource.eventLogPath);
const bytes=await fs.readFile(resource.eventLogPath),after=await fs.stat(resource.eventLogPath);
assert.equal(before.dev,after.dev);assert.equal(before.ino,after.ino);
assert.equal(before.size,after.size);assert.equal(before.mtimeMs,after.mtimeMs);
assert.equal(await fs.realpath(resource.eventLogPath),resource.eventLogPath);
assert.equal(after.dev,handoff.prefix.storeIdentity.device);
assert.equal(after.ino,handoff.prefix.storeIdentity.inode);
assert.equal(bytes.length,handoff.prefix.prefixLength);
assert.equal('sha256:'+sha(bytes),handoff.prefix.prefixDigest);
assert.equal(abg.validateDurablePrefixCoordinate(handoff.prefix),true);
assert.notEqual(handoff.prefix.coordinateDigest,handoff.prefix.prefixDigest);
assert.equal(product.isRunInvocationResourceAssertion({kind:'run_invocation_resource_assertion',schemaVersion:'5.0.0',
 eventResource:{kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)},
 catalog:await read(join(D,'retained-catalog.json')),catalogView:await read(join(D,'assessment-view.json')),
 applications:[],applicationResources:[],source:{kind:'none'}}),true);
const current=abg.projectExactPrefixWorkspaceEnvironment(handoff.prefix,binding);
assert.equal(current.kind,'exact_prefix_workspace_environment');
assert.deepEqual(current.prefix,handoff.prefix);
const invariantKeys=['workspaceAuthorityBasis','workspaceBindingCandidate','workspaceBinding','productInstalls','resolvedProductLock','productSet'];
for(const k of invariantKeys)assert.deepEqual(current[k],former[k],k);
assert.deepEqual(current.artifactTruth.rows,former.artifactTruth.rows);
assert.notEqual(current.artifactTruth.projectionDigest,former.artifactTruth.projectionDigest);
await write('closed-current-environment.json',current);
const negatives=[];
const crossed={...handoff.prefix,coordinateDigest:handoff.prefix.prefixDigest};
assert.equal(abg.validateDurablePrefixCoordinate(crossed),false);
negatives.push({case:'raw prefix digest substituted for owner coordinate',owner:'validateDurablePrefixCoordinate',disposition:'refused'});
const crossedBinding=abg.projectExactPrefixWorkspaceEnvironment(handoff.prefix,{...binding,digest:'sha256:'+'0'.repeat(64)});
assert.equal(crossedBinding.kind,'exact_prefix_workspace_environment_refusal');
assert.equal(crossedBinding.code,'workspace_binding_mismatch');
negatives.push({case:'foreign WorkspaceBinding digest',owner:'projectExactPrefixWorkspaceEnvironment',disposition:crossedBinding.kind,code:crossedBinding.code});
const old=await read(join(P,'initial-handoff.json'));
assert.equal(abg.validateDurablePrefixCoordinate(old.prefix),true);
let stale;
try{abg.readRuntimeEventsAtDurablePrefix(old.prefix,{requireCurrent:true});}catch(e){stale={name:e.name,code:e.code,message:e.message};}
assert.ok(stale,'An old84 historical coordinate is not the current136 resource');
assert.equal(stale.code,'prefix_length_mismatch');
negatives.push({case:'old84 coordinate used as current resource',owner:'readRuntimeEventsAtDurablePrefix requireCurrent',disposition:'refused',...stale});
const lock=join(resource.lockDirectory,String(after.dev)+'-'+String(after.ino)+'.lock');
await assert.rejects(fs.stat(lock),e=>e.code==='ENOENT');
await write('prefix-readiness.json',{status:'PASSED',initialHandoff:resource.initialHandoffRecord,
 rawPrefixDigest:handoff.prefix.prefixDigest,ownerCoordinateDigest:handoff.prefix.coordinateDigest,
 events:136,bytes:bytes.length,device:after.dev,inode:after.ino,lockAbsent:true,
 invariantKeys,artifactRowsConserved:true,derivedArtifactProjectionAdvanced:true,negatives,
 elapsedMs:performance.now()-began,nativeCalls:0,modelCalls:0,
 claim:'Current genuine136 resource acquired with separately checked byte/owner identity and current owner environment. No runtime/transport/assessment outcome implied.'});
console.log(JSON.stringify({status:'PASSED_CURRENT136_PREFIX_AND_OWNER_ENVIRONMENT',negativeCases:negatives.length,nativeCalls:0}));
