#!/usr/bin/env node
// Metadata-only successor03 binding. No Product imports or endpoint execution.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,readFile,writeFile} from 'node:fs/promises';
import {join,relative,resolve,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const repo='/Users/jim/src/apps/abiogenesis';
const work=join(repo,'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01');
const closed=join(work,'realization/c0-potential-effect-successor-03');
const prior=join(work,'realization/l4-final-candidate-02/preparation');
const here=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/u,'');
assert.equal(here,join(work,'realization/l4-final-candidate-03/preparation'));
const fresh='/private/tmp/abg-stdo3-final-03-9d2138e91c6946ab';
const previousFresh='/private/tmp/abg-stdo3-final-02-08c0665f0fed9141';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const pins=[];
async function pin(path,expected){
  const s=await lstat(path);assert.ok(s.isFile(),path+' regular file');
  const b=await readFile(path),actual=sha(b);
  if(expected)assert.equal(actual,expected,path+' sha256');
  const result={path,sha256:actual,bytes:s.size,mode:'0o'+(s.mode&0o777).toString(8)};
  pins.push(result);return result;
}
async function write(name,value){
  const path=join(here,name);assert.equal(resolve(path),path);assert.ok(!relative(here,path).startsWith('..'));
  const b=JSON.stringify(value,null,2)+'\n';await writeFile(path,b,{flag:'wx'});
  return {path,sha256:sha(b)};
}
function same(a,b,message){assert.deepEqual(a,b,message);}
function safe(path){assert.ok(typeof path==='string'&&path!==''&&!isAbsolute(path)&&!path.split('/').some(x=>['','.','..'].includes(x)));return path;}
function rebase(value){
  if(typeof value==='string')return value.replaceAll(previousFresh,fresh).replaceAll('t287-final02-','t287-final03-').replaceAll('08c0665f0fed9141','9d2138e91c6946ab');
  if(Array.isArray(value))return value.map(rebase);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rebase(v)]));
  return value;
}

const freezePin=await pin(join(closed,'freeze.json'),'cfed5ef7e736ec6ff24005290c23cb0e30a39e64266ca8a2e2806f4493ae20f9');
const priorFreezePin=await pin(join(prior,'freeze.json'),'561c8178702fed08d8800f1b31253a6ecd9f4ff08158475e40b44c6f65c49af8');
const freeze=await read(freezePin.path),priorFreeze=await read(priorFreezePin.path);
const nativeRows=new Map(freeze.files.map(row=>[safe(row.path),row]));assert.equal(nativeRows.size,freeze.files.length);
const priorRows=new Map(priorFreeze.records.map(row=>[join(repo,row.path),row]));
async function native(name){
  const row=nativeRows.get(safe(name));assert.ok(row,'closed native record '+name);assert.equal(row.kind,'file');
  const observed=await pin(join(closed,name),row.sha256);
  assert.equal(observed.bytes,row.bytes);assert.equal(observed.mode,row.mode);
  return {pin:observed,value:await read(observed.path)};
}
async function priorJson(name){
  const path=join(prior,name),row=priorRows.get(path);assert.ok(row,'closed prior record '+name);
  const observed=await pin(path,row.sha256);assert.equal(observed.bytes,row.bytes);assert.equal(observed.mode,row.mode);
  return rebase(await read(path));
}
const translation=join(prior,'translate-inventories.mjs');
await pin(translation,priorRows.get(translation).sha256);
const {rowForRunner,uniqueRows,SUPPORT,TENANT}=await import(pathToFileURL(translation).href);
const runner=await pin(join(work,'proof/run-installed.mjs'),'fb20ffc2a5f3bdfcbbbebc51e68d17ac1ec52b4fc20093aaa652efcfd84a7164');
const oracle=await pin(join(work,'realization/proof/oracle.mjs'),'dee13b0b642c9b3184d5ed27a5ee1bbd07a951c19b7481469bc4a681aff995dc');
const l2=await pin(join(work,'L2-execution-contract.md'),'65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1');
const selected={};
for(const name of ['source-inputs.json','stage-post-generation-inventory.json','generated-inventory.json','dependency-inputs.json','archive-members.json','package-source-correspondence.json','emitted-correspondence.json','metadata-correspondence.json','archive-payload-owner-result.json','offline-closure.json','producer-input-pins.json','commands/generate.result.json','commands/material.result.json','commands/payload.result.json','commands/archive-correspondence.result.json','commands/generation-correspondence.result.json','commands/sunny-host-check.result.json'])selected[name]=await native(name);
for(const name of ['generate','material','payload','archive-correspondence','generation-correspondence'])assert.equal(selected['commands/'+name+'.result.json'].value.exitCode,0,name+' retained receipt');
assert.equal(selected['commands/sunny-host-check.result.json'].value.exitCode,1,'preserve old host stop');
assert.equal(freeze.newCompileCount,0);assert.equal(freeze.principalC0Attempts,0);
const stage=join(closed,'stage'),tenant=join(stage,TENANT);
const source=selected['source-inputs.json'].value,post=selected['stage-post-generation-inventory.json'].value;
const generated=selected['generated-inventory.json'].value,dependencies=selected['dependency-inputs.json'].value;
const archiveRows=selected['archive-members.json'].value,packageProof=selected['package-source-correspondence.json'].value;
const emissions=selected['emitted-correspondence.json'].value,offline=selected['offline-closure.json'].value;
same(source.root,join(closed,'source'));same(dependencies.root,join(tenant,'node_modules'));
assert.equal(dependencies.copiedIndependent,true);assert.equal(dependencies.noSharedWritableInodes,true);
const src=new Map(uniqueRows(source.files.map(x=>rowForRunner(x))).map(x=>[x.path,x]));
const postRows=new Map(uniqueRows(post.files.map(x=>rowForRunner(x))).map(x=>[x.path,x]));
const genRows=new Map(uniqueRows(generated.files.map(x=>rowForRunner(x))).map(x=>[x.path,x]));
const expectedDerived=[TENANT+'/contracts/capabilities/capability-definition-graph.json',TENANT+'/contracts/worksite/command-execution-context.inventory.json'].sort();
same(emissions.sourceDerivedChanges.map(x=>x.before.path).sort(),expectedDerived);
for(const change of emissions.sourceDerivedChanges){
  const before=rowForRunner(change.before),after=rowForRunner(change.after);same(before.path,after.path);
  same(src.get(before.path),before,'exact source preimage');same(postRows.get(after.path),after,'post-generation afterimage');same(genRows.get(after.path),after,'generated afterimage');
  assert.notEqual(before.sha256,after.sha256);src.set(after.path,after);
  const observed=await pin(join(stage,after.path),after.sha256);assert.equal(observed.bytes,after.bytes);assert.equal(observed.mode,after.mode);
}
for(const [path,row] of src)same(postRows.get(path),row,'unexplained source delta '+path);
assert.equal(src.size,1319);assert.equal(genRows.size,940);assert.equal(dependencies.files.length,4576);
for(const row of generated.files)assert.equal(row.kind,'file','directly reusable generated rows are regular files');
for(const row of dependencies.files){assert.ok(['file','symlink'].includes(row.type));rowForRunner(row);}
for(const row of archiveRows.files){assert.equal(row.type,undefined);assert.equal(row.kind,undefined);assert.equal(rowForRunner(row).type,'file');}
assert.equal(archiveRows.files.length,5271);assert.equal(archiveRows.all_bytes_match_stage,true);
assert.equal(packageProof.all_archive_member_bytes_match_stage,true);assert.equal(packageProof.all_archive_modes_match_npm_projection,true);
assert.equal(packageProof.stage_unchanged_by_pack,true);assert.equal(packageProof.proof_support_excluded_from_payload,true);
same(archiveRows.archive,freeze.archive);same(packageProof.archive,freeze.archive);
const archive=await pin(join(repo,freeze.archive.path),'6c577a2f0ad90f89c35dd989040c6787892bbdb4e6a0bba6f3bbd6cc0fa0c3b5');
assert.equal(archive.bytes,freeze.archive.bytes);assert.equal(archive.mode,freeze.archive.mode);
const manifestNative=packageProof.manifest;const manifest=await pin(join(stage,manifestNative.path),manifestNative.sha256);
assert.equal(manifest.bytes,manifestNative.bytes);assert.equal(manifest.mode,manifestNative.mode);
const manifestValue=await read(manifest.path),payload=selected['archive-payload-owner-result.json'].value;
assert.equal(payload.status,'satisfied');assert.equal(payload.actualProductContentDigest,payload.expectedProductContentDigest);
assert.equal(manifestValue.productContentDigest,payload.actualProductContentDigest);assert.equal(payload.manifestByteSha256,manifest.sha256);
assert.equal(offline.archiveSha256,archive.sha256);assert.equal(offline.archiveMembersSha256,selected['archive-members.json'].pin.sha256);
assert.equal(offline.generatorResultSha256,selected['commands/generate.result.json'].pin.sha256);
assert.equal(offline.packageLockSha256,'df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12');
const support=[];
for(const path of SUPPORT){const row=src.get(TENANT+'/'+path);assert.ok(row,'selected support '+path);assert.equal(row.type,'file');const observed=await pin(join(tenant,path),row.sha256);assert.equal(observed.bytes,row.bytes);assert.equal(observed.mode,row.mode);support.push({...row,path});}
assert.equal(support.length,14);assert.ok(support.every(x=>!x.path.includes('native-registered-selection.mjs')));

const resources=await priorJson('resource-plan.json');
const absentPaths=[resources.resources.parent,resources.resources.ownerResolution,...Object.values(resources.resources.npmCaches),...['public-preparation','partial-install','declared-execution'].flatMap(name=>Object.values(resources.resources[name]))];
for(const path of absentPaths){assert.ok(path===fresh||path.startsWith(fresh+'/'));try{await lstat(path);assert.fail('proposed resource already exists: '+path);}catch(error){if(error.code!=='ENOENT')throw error;}}
const absence={status:'all_absent',paths:absentPaths,allocated:false};
const sourceInventory=await write('stage-source-inventory.json',{files:uniqueRows([...src.values()])});
const supportManifest=await write('selected-support.json',{files:uniqueRows(support)});
const subject={id:'candidate',stageTenant:tenant,archive,manifest,
  packageInventory:selected['archive-members.json'].pin,supportManifest,
  inventories:[{...sourceInventory,root:stage},{...selected['generated-inventory.json'].pin,root:stage},{...selected['dependency-inputs.json'].pin,root:dependencies.root}]};
const derivation=await write('source-afterimages.json',{source:selected['source-inputs.json'].pin,post:selected['stage-post-generation-inventory.json'].pin,
  correspondence:selected['emitted-correspondence.json'].pin,producer:'scripts/generate-product-manifest.mjs',producerPin:selected['producer-input-pins.json'].value.generator,
  producerReceipt:selected['commands/generate.result.json'].pin,changes:emissions.sourceDerivedChanges,allOtherSourceRowsExactlyEqual:true,
  nativeShapePolicy:'source kind -> runner type; original generated kind=file rows use runner regular-file branch; original dependency type/link rows retained; original archive rows are all regular files, preserving exact mode/stage_mode/bytes/SHA',
  reusedInventories:['generated-inventory.json','dependency-inputs.json','archive-members.json'],noGlobalIdentityStripping:true});
await write('subject.NOT_GRANTED.json',{status:'NOT_GRANTED',subject,closedFreeze:freezePin,closedStatus:freeze.status,productContentDigest:manifestValue.productContentDigest,sourceAfterimages:derivation,
  counts:{source:src.size,generated:genRows.size,dependencies:dependencies.files.length,support:support.length,packageMembers:archiveRows.files.length},
  gate:'Root-selected C0 actual owner proof remains separate and pending; see ROOT-proof-status.md for attributed temporal steering; no candidate or L5 acceptance'});
const configs={};
for(const lane of ['p1','p2','p3']){
  const c=await priorJson(lane+'.configuration.NOT_GRANTED.json');c.subject=subject;
  assert.equal(c.status,'NOT_GRANTED');assert.equal(c.activationFile,null);assert.equal(c.cleanup,false);assert.equal(c.retryCount,0);
  configs[lane]=await write(lane+'.configuration.NOT_GRANTED.json',c);
  const g=await priorJson(lane+'.effect-grant.NOT_GRANTED.json');assert.equal(g.status,'NOT_GRANTED');g.configurationSha256=null;g.preparedConfiguration=configs[lane];
  await write(lane+'.effect-grant.NOT_GRANTED.json',g);
}
const owner=await priorJson('owner-resolution.configuration.NOT_GRANTED.json');owner.installedInventory=subject.packageInventory;
owner.requiredPins=[archive,subject.packageInventory,supportManifest,freezePin,{path:null,sha256:null,pendingRole:'actual P1 proof freeze'}];
assert.equal(owner.installedRoot,null);assert.ok(Object.values(owner.p1).every(x=>x===null));
const ownerConfig=await write('owner-resolution.configuration.NOT_GRANTED.json',owner);
const ownerGrant=await priorJson('owner-resolution.effect-grant.NOT_GRANTED.json');ownerGrant.preparedConfiguration=ownerConfig;await write('owner-resolution.effect-grant.NOT_GRANTED.json',ownerGrant);
const handoff=await priorJson('actual-handoff-binding-map.json');handoff.subjectBinding={archive,manifest,closedFreeze:freezePin};handoff.status='pending actual final03 P1 output';await write('actual-handoff-binding-map.json',handoff);
await write('resource-plan.json',{...resources,absenceCheck:absence});
const cache=await priorJson('cache-plan.NOT_GRANTED.json');cache.offlineClosure=selected['offline-closure.json'].pin;cache.selectedExistingSeedRoot=null;cache.seedInventory={path:null,sha256:null};cache.candidateExistingSeedRoot=null;
cache.pending='Root must select the exact seed or explicitly select an empty seed under this archive closure; no scan/copy/allocation now';await write('cache-plan.NOT_GRANTED.json',cache);
await write('offline-closure.NOT_GRANTED.json',{status:'NOT_GRANTED',evidence:selected['offline-closure.json'].pin,archive,membership:selected['archive-members.json'].pin,packageLockSha256:offline.packageLockSha256,seedSelected:false,cacheAllocated:false,networkFallback:false});
const correspondence=await priorJson('output-correspondence-inputs.json');correspondence.status='original policy retained; final03 subject bound, no endpoint output';correspondence.candidate={archive,manifest,productContentDigest:manifestValue.productContentDigest};correspondence.pending='actual final03 P1, owner-resolution, P2 and P3 receipts';await write('output-correspondence-inputs.json',correspondence);
const commands=await priorJson('commands.NOT_GRANTED.json');delete commands.translation;commands.noneExecuted=true;await write('commands.NOT_GRANTED.json',commands);
const priorActivation=await priorJson('activation.json');
for(const item of priorActivation.exactInputs)await pin(item.path,item.sha256);
await pin(configs.p1.path,configs.p1.sha256);
await pin((await read(configs.p1.path)).externalConsumer.path,(await read(configs.p1.path)).externalConsumer.sha256);
await write('binding-input-pins.json',{pins,priorFreeze:priorFreezePin,selectedFreeze:freezePin,runner,oracle,l2,scope:'finite selected record identities; no broad physical candidate preservation or host verifier'});
const result={status:'BOUND_NOT_GRANTED',archive,manifest,configs,ownerConfig,sourceAfterimages:derivation,
  counts:{source:src.size,generated:genRows.size,dependencies:dependencies.files.length,support:support.length,packageMembers:archiveRows.files.length},
  originalRunnerUnchanged:true,originalOracleUnchanged:true,sourceWrites:0,builds:0,packages:0,installs:0,ownerAttempts:0,nativeCalls:0,
  allocatedRoots:0,resourceAbsence:absence,actualP1HandoffPending:true,noFinal02ReceiptTransfer:true,artifactChangeStopsScope:true};
await write('binding-result.json',result);
process.stdout.write(JSON.stringify({status:result.status,archive:archive.sha256,manifest:manifest.sha256,counts:result.counts,allocatedRoots:0,actualP1HandoffPending:true})+'\n');
