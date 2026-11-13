// Existing native staging route adapted for exact completed Product payload reuse.
// One fresh source stage; no compiler, generator, lifecycle or new Product execution.
import {mkdir,readFile,writeFile,copyFile,cp,chmod,readdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const [label,mode='after']=process.argv.slice(2);
const worksite='/Users/jim/src/apps/abiogenesis-rc6-local-cut',inputRoot=join(worksite,'qualification-inputs/rc7-held-session-author-06'),tmp=join(worksite,'qualification-scratch/rc7-held-session-author-06/tmp');
const tenantRel='build_tenants/abiogenesis/typescript',stage=join(tmp,label??''),tenant=join(stage,tenantRel),sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const checked=async p=>{const s=await lstat(p.path);assert(s.isFile()&&!s.isSymbolicLink(),p.path);const b=await readFile(p.path);assert.equal(b.length,p.bytes,p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
assert.equal(mode,'after');assert.equal(label,'hs6-stage-01');const setupStarted=Date.now();
const inputs=await json(join(inputRoot,'C2_INPUTS.json')),deps=await json(join(inputRoot,'DEPENDENCY_SOURCE_SELECTION.json')),bounds=await json(join(inputRoot,'COMMAND_BOUNDS.json'));
assert.equal(bounds.maxStages,1);assert.equal(bounds.maxLaneInvocations,3);assert.equal(bounds.concurrency,1);assert.deepEqual(bounds.stageLabels,[label]);
assert.equal(inputs.protectedSourcePaths.length,451);assert.equal(inputs.mutableProductPaths.length,1);
const custody=await json(join(inputRoot,'SOURCE_CUSTODY.json')),baseline=JSON.parse(await checked(custody.sourceBefore));
const held=new Map(baseline.files.map(f=>[f.relativePath,f]));assert.equal(held.size,451);
const reuse=JSON.parse(await checked(deps.reusedProductPayload));
await checked(reuse.digestOwner);await checked(reuse.digestOwnerDependency);
const owner=await import(pathToFileURL(reuse.digestOwner.path));
const original=JSON.parse(await checked(reuse.completedBuildReport));assert.equal(original.status,'COMPLETED_WITH_SEPARATE_ROOT_GENERATION_CONTINUATION');
for(const r of [original.compile,original.generate,original.lifecycle])assert(r&&r.exitCode===0&&r.signal===null&&r.error===null);
const manifest=JSON.parse(await checked(reuse.manifest)),graphPath=manifest.capabilityDefinitionGraph.assetLocator.path;
assert.deepEqual([...manifest.productRelativeLocators,graphPath,'product-toolchain-manifest.json'].sort(),reuse.files.map(x=>x.relativePath));assert.equal(reuse.files.length,5325);
const productNames=new Set(reuse.files.map(x=>tenantRel+'/'+x.relativePath));for(const p of inputs.mutableProductPaths)assert(!productNames.has(p),'Writable caller/test must remain outside Product payload');
const verifyPayload=async base=>{const content=[];for(const r of reuse.files){const b=await checked({path:join(base,r.relativePath),bytes:r.bytes,sha256:r.sha256});assert.equal((await lstat(join(base,r.relativePath))).mode&0o777,r.mode,r.relativePath);if(manifest.productRelativeLocators.includes(r.relativePath))content.push({path:r.relativePath,sha256:owner.sha256Bytes(b)});}assert.equal(owner.payloadInventoryDigest(content),manifest.productContentDigest);return{members:reuse.files.length,bytes:reuse.totalBytes,productContentDigest:manifest.productContentDigest,manifestSha256:reuse.manifest.sha256,graphSha256:reuse.graph.sha256};};
const payloadBefore=await verifyPayload(reuse.sourceRoot);
for(const p of [...deps.toolchainEntryPins,...deps.contractSeedPins])await checked(p);
await mkdir(tmp,{recursive:true});const priorNames=await readdir(tmp);
const allocated=bounds.stageLabels.filter(x=>priorNames.includes(x)||priorNames.includes(x+'-stage.json'));
assert.equal(allocated.length,0,'The single stage allocation is consumed, including failed/incomplete attempts');
await mkdir(stage);const sources=[];
for(const path of inputs.protectedSourcePaths){const h=held.get(path);assert(h,path);const bytes=await readFile(join(worksite,path));if(!inputs.mutableProductPaths.includes(path)){assert.equal(bytes.length,h.bytes,path);assert.equal(sha(bytes),h.sha256,path);}await mkdir(dirname(join(stage,path)),{recursive:true});await writeFile(join(stage,path),bytes,{flag:'wx'});sources.push({path,bytes:bytes.length,sha256:sha(bytes)});}
const sourceDigest=sha(Buffer.from(JSON.stringify(sources))),freezePath=join(tmp,label+'-source-freeze.json');
await writeFile(freezePath,JSON.stringify({label,mode,stage,status:'SOURCE_FROZEN_PAYLOAD_REUSE_AND_PROOF_PENDING',sourceCount:sources.length,sourceDigest,sources},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'SOURCE_FROZEN_PAYLOAD_REUSE_AND_PROOF_PENDING',label,mode,stage,freezePath,sourceCount:sources.length,sourceDigest}));
// Fresh stage receives the unchanged offline dependency tree and only declared Product payload members.
await cp(deps.toolchainRoot,join(tenant,'node_modules'),{recursive:true,verbatimSymlinks:true});
for(const r of reuse.files){const target=join(tenant,r.relativePath);await mkdir(dirname(target),{recursive:true});let present=false;try{await lstat(target);present=true;}catch(e){if(e.code!=='ENOENT')throw e;}
 if(present)await checked({path:target,bytes:r.bytes,sha256:r.sha256});else{await checked({path:join(reuse.sourceRoot,r.relativePath),bytes:r.bytes,sha256:r.sha256});await copyFile(join(reuse.sourceRoot,r.relativePath),target);await chmod(target,r.mode);}}
const payloadAfter=await verifyPayload(tenant);assert.deepEqual(payloadAfter,payloadBefore);await verifyPayload(reuse.sourceRoot);
for(const r of sources){await checked({path:join(stage,r.path),bytes:r.bytes,sha256:r.sha256});await checked({path:join(worksite,r.path),bytes:r.bytes,sha256:r.sha256});}
const reuseStep=phase=>({exitCode:0,signal:null,error:null,reused:true,executed:false,receipt:reuse.completedBuildReport,pointer:'/'+phase,historicalSourceDigest:original.sourceDigest,relation:'All450 non-writable source inputs and full5325-member Product payload unchanged; one changed test mjs path excluded from declared package payload.'});
const report={label,mode,stage,freezePath,setupMs:Date.now()-setupStarted,priorStageLabels:allocated,stageAllocationCap:1,sourceCount:451,sourceDigest,sources,compile:reuseStep('compile'),generate:reuseStep('generate'),lifecycle:reuseStep('lifecycle'),productReuse:{status:'FULL_DECLARED_PAYLOAD_BYTE_EQUAL',selection:deps.reusedProductPayload,before:payloadBefore,after:payloadAfter,originalCompletedBuildReport:reuse.completedBuildReport,noCompileOrGenerationExecuted:true}};
await writeFile(join(tmp,label+'-stage.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({label,sourceCount:451,sourceDigest,setupMs:report.setupMs,productReuse:report.productReuse}));
