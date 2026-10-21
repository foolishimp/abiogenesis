// Existing final03 binding mechanics, rebased to the selected successor06 native formats.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',work=join(repo,'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01');
const here=fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/u,'');
assert.equal(here,join(work,'realization/l4-final-candidate-04'));
const prior=join(work,'realization/l4-final-candidate-03/preparation'),closed=join(work,'realization/c0-potential-effect-successor-06');
const fresh='/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc',oldFresh='/private/tmp/abg-stdo3-final-03-9d2138e91c6946ab';
const sha=b=>createHash('sha256').update(b).digest('hex'),read=async p=>JSON.parse(await readFile(p,'utf8')),pins=[];
async function pin(path,expected){const s=await lstat(path);assert.ok(s.isFile(),path);const b=await readFile(path),h=sha(b);if(expected)assert.equal(h,expected,path);const r={path,sha256:h,bytes:s.size,mode:'0o'+(s.mode&0o777).toString(8)};pins.push(r);return r;}
async function write(name,value){const path=join(here,name);assert.ok(!relative(here,path).startsWith('..'));await mkdir(join(path,'..'),{recursive:true});const b=JSON.stringify(value,null,2)+'\n';await writeFile(path,b,{flag:'wx'});return {path,sha256:sha(b)};}
function rebase(v){if(typeof v==='string')return v.replaceAll(oldFresh,fresh).replaceAll('t287-final03-','t287-final04-').replaceAll('9d2138e91c6946ab','6f42d9a31e5870bc');if(Array.isArray(v))return v.map(rebase);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,rebase(x)]));return v;}
const priorFreezePin=await pin(join(prior,'freeze.json'),'f2ae662c93fd1b4a821ad2e020af3f743c866613eab067f9a6e6dbdc13194428');
const priorRows=new Map((await read(priorFreezePin.path)).files.map(r=>[r.path,r]));
async function control(name){const r=priorRows.get(name);assert.ok(r,name);const p=await pin(join(prior,name),r.sha256);assert.equal(p.bytes,r.bytes);assert.equal(p.mode,r.mode);return rebase(await read(p.path));}
await pin(join(prior,'bind-successor03.mjs'),priorRows.get('bind-successor03.mjs').sha256);
const priorPins=await control('binding-input-pins.json'),translator=join(work,'realization/l4-final-candidate-02/preparation/translate-inventories.mjs');
await pin(translator,priorPins.pins.find(p=>p.path===translator).sha256);
const {rowForRunner,uniqueRows,SUPPORT,TENANT}=await import(pathToFileURL(translator).href);
const runner=await pin(join(work,'proof/run-installed.mjs'),'fb20ffc2a5f3bdfcbbbebc51e68d17ac1ec52b4fc20093aaa652efcfd84a7164');
const oracle=await pin(join(work,'realization/proof/oracle.mjs'),'dee13b0b642c9b3184d5ed27a5ee1bbd07a951c19b7481469bc4a681aff995dc');
const owner=await pin(join(work,'realization/final-proof-preparation-01/owner-resolution.mjs'),'ec16ec05680ec4702302482cc9d121e715da79ef85819c43ea6b20ae5ac05185');
await pin(join(work,'L2-execution-contract.md'),'65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1');
const proofFreeze=await pin(join(closed,'proof-freeze.json'),'b60eca3e6fa641206eda37658b42285cf888a1a42b3cae259be5e2be75a5ce37');
const proof=await read(proofFreeze.path),proofRows=new Map(proof.records.map(r=>[r.path,r]));
const explicit={'source-inputs.json':'4e9f5acc061fc6ffce9fd8620a779a862adcfe509cae4baf7f2c01c065c5967c','generated-inventory.json':'b0b38bf971f06aaff83889f2f4dd4301b5e08fd8d1f503afc12fcc8b48349d99','stage-post-generation-inventory.json':'eb41de1242486d6bcfe5cec7b902bd25092cc91ddda6dfe513448c6dbbd83d37','archive-members.json':'404c0be5cc48bbc85e5b80685c01072458c720a513aca5465f543d4f47b475fb'};
const selected={};
for(const name of ['source-inputs.json','generated-inventory.json','stage-post-generation-inventory.json','archive-members.json','dependency-inputs.json','emitted-correspondence.json','package-source-correspondence.json','archive-payload-owner-result.json','offline-closure.json','metadata-correspondence.json','commands/generate.result.json','commands/material.result.json','commands/archive-correspondence.result.json','commands/generation-correspondence.result.json','commands/payload.result.json']){
 const path=join(closed,name),declared=proofRows.get(path),p=await pin(path,explicit[name]??declared?.sha256);if(declared)assert.equal(p.bytes,declared.bytes);selected[name]={pin:p,value:await read(path)};
}
for(const name of ['generate','material','archive-correspondence','generation-correspondence','payload'])assert.equal(selected['commands/'+name+'.result.json'].value.exitCode,0);
const stage=join(closed,'stage'),tenant=join(stage,TENANT),source=selected['source-inputs.json'].value,dependencies=selected['dependency-inputs.json'].value;
assert.equal(source.root,stage);assert.equal(dependencies.allBytesModesLinksExact,true);assert.equal(dependencies.sharedWritableInodes,0);
const sourceRows=new Map(uniqueRows(source.files.map(r=>rowForRunner(r))).map(r=>[r.path,r]));
const post=new Map(uniqueRows(selected['stage-post-generation-inventory.json'].value.files.map(r=>rowForRunner(r))).map(r=>[r.path,r]));
const gen=new Map(uniqueRows(selected['generated-inventory.json'].value.files.map(r=>rowForRunner(r))).map(r=>[r.path,r]));
const emissions=selected['emitted-correspondence.json'].value,graph=TENANT+'/contracts/capabilities/capability-definition-graph.json',context=TENANT+'/contracts/worksite/command-execution-context.inventory.json';
assert.deepEqual(emissions.sourceDerivedChanges.map(x=>x.before.path),[graph]);
for(const x of emissions.sourceDerivedChanges){const b=rowForRunner(x.before),a=rowForRunner(x.after);assert.equal(b.path,a.path);assert.deepEqual(sourceRows.get(b.path),b);assert.deepEqual(post.get(a.path),a);assert.deepEqual(gen.get(a.path),a);sourceRows.set(a.path,a);const actual=await pin(join(stage,a.path),a.sha256);assert.equal(actual.mode,a.mode);assert.equal(actual.bytes,a.bytes);}
assert.deepEqual(sourceRows.get(context),post.get(context));assert.deepEqual(post.get(context),gen.get(context));
for(const [path,row]of sourceRows)assert.deepEqual(post.get(path),row,'unexpected source delta '+path);
assert.equal(sourceRows.size,1320);assert.equal(gen.size,940);assert.equal(dependencies.files.length,4576);
for(const row of dependencies.files){assert.ok(['file','symlink'].includes(row.type));rowForRunner(row);}
for(const row of selected['generated-inventory.json'].value.files)assert.equal(row.kind,'file');
const members=selected['archive-members.json'].value,packageProof=selected['package-source-correspondence.json'].value;
assert.equal(members.files.length,5271);assert.equal(members.all_bytes_match_stage,true);
for(const row of members.files){assert.equal(row.type,undefined);assert.equal(row.kind,undefined);assert.equal(rowForRunner(row).type,'file');}
for(const key of ['all_archive_member_bytes_match_stage','all_archive_modes_match_npm_projection','stage_unchanged_by_pack','proof_support_excluded_from_payload'])assert.equal(packageProof[key],true,key);
assert.deepEqual(members.archive,packageProof.archive);
const archive=await pin(join(repo,members.archive.path),'25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079');assert.equal(archive.bytes,10681844);assert.equal(archive.mode,members.archive.mode);assert.equal(proof.archive.sha256,archive.sha256);
const manifest=await pin(join(stage,packageProof.manifest.path),'a782e3bc49c703b3ea254e45edb54d3f7bf0402b42ff3bd34356dc0c13111ab4');
const mv=await read(manifest.path),payload=selected['archive-payload-owner-result.json'].value;assert.equal(payload.status,'satisfied');assert.equal(payload.actualProductContentDigest,payload.expectedProductContentDigest);assert.equal(mv.productContentDigest,payload.actualProductContentDigest);
const supports=[];for(const path of SUPPORT){const r=sourceRows.get(TENANT+'/'+path);assert.equal(r.type,'file');const p=await pin(join(tenant,path),r.sha256);assert.equal(p.mode,r.mode);assert.equal(p.bytes,r.bytes);supports.push({...r,path});}
const sourceInventory=await write('intake/stage-source-inventory.json',{files:uniqueRows([...sourceRows.values()])}),supportManifest=await write('intake/selected-support.json',{files:uniqueRows(supports)});
const subject={id:'candidate',stageTenant:tenant,archive,manifest,packageInventory:selected['archive-members.json'].pin,supportManifest,inventories:[{...sourceInventory,root:stage},{...selected['generated-inventory.json'].pin,root:stage},{...selected['dependency-inputs.json'].pin,root:join(tenant,'node_modules')}]};
await write('intake/source-afterimages.json',{preimage:selected['source-inputs.json'].pin,post:selected['stage-post-generation-inventory.json'].pin,correspondence:selected['emitted-correspondence.json'].pin,producerReceipt:selected['commands/generate.result.json'].pin,changes:emissions.sourceDerivedChanges,unchangedSecondGeneratorOverlap:sourceRows.get(context),allOtherSourceRowsExact:true});
const oldClosurePath=join(work,'realization/l4-final-candidate-02/execution-intake-01/archive-closure.json'),oldMetaPath=join(work,'realization/l4-final-candidate-02/execution-intake-01/archive-package-metadata.json');
const oldClosurePin=await pin(oldClosurePath),oldMetaPin=await pin(oldMetaPath),oldClosure=await read(oldClosurePath),oldMeta=await read(oldMetaPath);
assert.equal(oldClosure.status,'satisfied');assert.equal(oldClosure.packageCount,14);assert.equal(oldClosure.edges.length,17);
const memberMap=new Map(members.files.map(r=>[r.path,r]));const packageRelations=[];
for(const dir of oldClosure.packages){const path=dir?dir+'/package.json':'package.json',old=oldMeta.metadata[path],current=memberMap.get(path);assert.ok(current,path);assert.equal(current.sha256,old.sha256,'exact runtime package metadata '+path);const observed=await pin(join(tenant,path),current.sha256);packageRelations.push({path,oldSha256:old.sha256,current:observed});}
const presentPackages=members.files.filter(r=>r.path==='package.json'||/^node_modules\/(?:@[^/]+\/)?[^/]+\/package\.json$/u.test(r.path)).map(r=>r.path).sort();
assert.deepEqual(presentPackages,packageRelations.map(r=>r.path).sort());
for(const edge of oldClosure.edges){if(edge.target)assert.equal(memberMap.get(edge.target).sha256,edge.metadataSha256);else for(const path of edge.candidates)assert.equal(memberMap.has(path),false);}
const offline=selected['offline-closure.json'].value;assert.equal(offline.archiveSha256,archive.sha256);assert.equal(offline.archiveMembersSha256,selected['archive-members.json'].pin.sha256);assert.equal(offline.packageLockSha256,'df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12');assert.equal(offline.allBundledMemberRowsExactlyPreserved,true);
const emptySeed=await write('intake/empty-seed.json',{kind:'explicit_empty_seed',files:[],sourceRoot:null,selectedBy:'/root',globalCacheRead:false,globalCacheWrite:false,networkFallback:false});
await write('intake/archive-closure.json',{status:'satisfied',subjectId:'candidate',archive,packageCount:14,edgeCount:17,packageRelations,edges:oldClosure.edges,oldClosure:oldClosurePin,oldMetadata:oldMetaPin,currentClosure:selected['offline-closure.json'].pin,relation:'Every runtime package metadata byte and optional absent peer is identical; Node 24.7.0 and all 17 declared dependency/peer relations conserved. No old runtime receipt transferred.',cacheSelection:emptySeed});
const conditionResult=await pin(join(closed,'commands/unavailable-owner.result.json')),conditionStdout=await pin(join(closed,'commands/unavailable-owner.stdout'),'04ada63c3a96306d7c92bfe29801d4900334c756ff5d543bdb68ef10e709d8c4');
const condition=await read(conditionResult.path);assert.equal(condition.exitCode,0);assert.equal(condition.stdoutSha256,conditionStdout.sha256);assert.equal(condition.pid,4993);
await write('intake/runtime-condition.json',{status:'satisfied',source:'Root notification plus exact actual command receipt',result:conditionResult,stdout:conditionStdout,proofFreeze,claim:'Root/06 Writer reports genuine unavailable-owner admitted failure, full/index/cold currentness, anti-revival, origin and fresh-replay assertions passed; exact selected test exit0, no rerun here'});
const resources=await control('resource-plan.json');delete resources.absenceCheck;
const paths=[resources.resources.parent,resources.resources.ownerResolution,...Object.values(resources.resources.npmCaches),...['public-preparation','partial-install','declared-execution'].flatMap(n=>Object.values(resources.resources[n]))];
for(const path of paths){assert.ok(path===fresh||path.startsWith(fresh+'/'));try{await lstat(path);assert.fail('resource already exists: '+path);}catch(e){if(e.code!=='ENOENT')throw e;}}
await write('intake/resource-preconditions.json',{status:'all_absent_before_allocation',paths,allocated:false});
await write('intake/resource-plan.json',resources);
for(const lane of ['p1','p2','p3']){const c=await control(lane+'.configuration.NOT_GRANTED.json');c.subject=subject;await write('intake/'+lane+'.configuration.template.json',c);const g=await control(lane+'.effect-grant.NOT_GRANTED.json');delete g.preparedConfiguration;await write('intake/'+lane+'.grant.template.json',g);}
const oc=await control('owner-resolution.configuration.NOT_GRANTED.json');oc.installedInventory=subject.packageInventory;oc.requiredPins=[archive,subject.packageInventory,supportManifest,proofFreeze];await write('intake/owner.configuration.template.json',oc);
const og=await control('owner-resolution.effect-grant.NOT_GRANTED.json');delete og.preparedConfiguration;await write('intake/owner.grant.template.json',og);
const handoff=await control('actual-handoff-binding-map.json');handoff.status='pending actual final04 P1 outputs';handoff.subjectBinding={archive,manifest,proofFreeze};await write('intake/actual-handoff-binding-map.json',handoff);
const correspondence=await control('output-correspondence-inputs.json');correspondence.candidate={archive,manifest,productContentDigest:mv.productContentDigest};correspondence.status='original policy selected; final04 outputs pending';correspondence.pending='actual final04 P1/owner/P2/P3';await write('intake/output-correspondence-inputs.json',correspondence);
const c1=await read(join(here,'intake/p1.configuration.template.json'));await pin(c1.externalConsumer.path,c1.externalConsumer.sha256);await pin(c1.toolchains.node.path,c1.toolchains.node.sha256);
const retain=await pin(join(work,'realization/l4-final-candidate-02/execution-intake-01/retain-lane.py'));
await write('intake/input-pins.json',{pins,priorFreeze:priorFreezePin,proofFreeze,runner,oracle,owner,retain,scope:'finite exact binding inputs; no prior-tree or main preservation rescan'});
const result={status:'bound_runtime_condition_satisfied',subject,proofFreeze,priorFreeze:priorFreezePin,runner,oracle,owner,retain,emptySeed,counts:{source:sourceRows.size,generated:gen.size,dependencies:dependencies.files.length,packageMembers:members.files.length,support:supports.length},allocatedRoots:0,sourceWrites:0,builds:0,packages:0};
await write('intake/binding-result.json',result);console.log(JSON.stringify({status:result.status,archive:archive.sha256,counts:result.counts,emptySeed:true,resourcesAbsent:paths.length}));
