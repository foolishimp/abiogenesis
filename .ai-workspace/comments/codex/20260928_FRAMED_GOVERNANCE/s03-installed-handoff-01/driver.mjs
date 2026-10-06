import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const D=import.meta.dirname,G=join(D,'..'),C=join(G,'final-candidate-construction-01');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),save=async(n,v)=>fs.writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'}),sha=b=>createHash('sha256').update(b).digest('hex');
const selected=await read(join(C,'selected-core.json')),installedRoot=selected.packageRoot;
const frozenSupport=join(C,'source-freeze/repo/build_tenants/abiogenesis/typescript/test_env/support');
const [{constructInstalledRunReadCall},{assertPublicGapDomain}]=await Promise.all([import(pathToFileURL(join(frozenSupport,'registered-graph-selection.mjs'))),import(pathToFileURL(join(frozenSupport,'t287-s03-automatic.mjs')))]);
const load=name=>import(pathToFileURL(join(installedRoot,`build/code/src/${name}.js`)));
const [product,publicApi,reads,eventOwner]=await Promise.all(['product/index','public/index','abg/project_read_operation_contracts','abg/event_store'].map(load));
const historical=await read(join(G,'s03-automatic-01/environment.json')),oracle=await read(join(G,'s03-automatic-01/oracle.json'));
const originalHandoff=await read(join(G,'s03-automatic-02/final-handoff.json')),originalBytes=await fs.readFile(join(G,'s03-automatic-02/final-native-prefix.jsonl'));
assert.equal(sha(originalBytes),'e7f7de0e3fd801436b3e3d559e7fdb1bc41a54d52ce57c2505afd3f9ae863f59');
const livePath=fileURLToPath(originalHandoff.prefix.eventLogRef),lockNamespace=join(G,'s03-automatic-01/disposable'),lockPath=join(lockNamespace,'abiogenesis-event-store-locks-v5/16777230-463811526.lock');
const cases=[{name:'negative',retained:'no-action',correctionAvailable:false,run:{ref:'run://abiogenesis/fc9ca55bd6e4a3164c546b9bcb2df1c10b1e9d55884c34fc98f4524a7b7396e8',digest:'sha256:3df8116ae6a3ad65a84fcac0c0e53a947a1a51cef44a0e86a560654e019fde79'}},{name:'positive',retained:'positive',correctionAvailable:true,run:{ref:'run://abiogenesis/6f642652d6a55bda784eacdebf63038fd2e767c939a28dc59d86a72c24d51e11',digest:'sha256:fcab567902049fe1cb7e9fac0b4979bc266d32adf980a148797d228bc4f2717f'}}];
let handoff=originalHandoff,phase='prepared',nativeCalls=0,activeChild=null,expired=false;const children=[],results=[];
async function physical(label,requireExact=true){
 const before=await fs.stat(livePath),bytes=await fs.readFile(livePath),after=await fs.stat(livePath);let lock={path:lockPath,state:'absent'};
 try{const s=await fs.stat(lockPath);lock={path:lockPath,state:'present',bytes:s.size,sha256:sha(await fs.readFile(lockPath))};}catch(error){if(error.code!=='ENOENT')throw error;}
 const state={path:livePath,bytes:bytes.length,sha256:sha(bytes),device:after.dev,inode:after.ino,mtimeMs:after.mtimeMs,stableDuringRead:before.dev===after.dev&&before.ino===after.ino&&before.size===after.size&&before.mtimeMs===after.mtimeMs,lock,at:new Date().toISOString(),latestObservedHandoff:handoff};
 await save(label+'-physical.json',state);await fs.writeFile(join(D,label+'-snapshot.jsonl'),bytes,{flag:'wx'});
 if(requireExact){assert.equal(state.stableDuringRead,true);assert.equal(after.dev,16777230);assert.equal(after.ino,463811526);assert.deepEqual(bytes,originalBytes);assert.equal(lock.state,'absent');assert.deepEqual(handoff.prefix,originalHandoff.prefix);assert.equal(eventOwner.validateHistoricalEvents(bytes,handoff.prefix.storeIdentity.eventContractDigest).length,566);}
 return state;
}
const started=performance.now(),deadline=started+120000;function checkBudget(){if(expired||performance.now()>=deadline)throw Error('120-second native driver budget expired');}
const watchdog=setTimeout(()=>{expired=true;if(activeChild){activeChild.kill('SIGTERM');children.at(-1).budgetSignal='SIGTERM';}},120000);
async function child(label,args,environment){
 checkBudget();const begun=performance.now();let out='',err='';const p=spawn(process.execPath,args,{cwd:D,env:environment,stdio:['ignore','pipe','pipe']});activeChild=p;const record={label,pid:p.pid,command:[process.execPath,...args],startedAt:new Date().toISOString()};children.push(record);await save(label+'-process-start.json',record);
 p.stdout.on('data',b=>{out+=b.toString();});p.stderr.on('data',b=>{err+=b.toString();});
 const exit=await new Promise(resolve=>{p.on('error',error=>resolve({code:null,signal:null,spawnError:error.message}));p.on('close',(code,signal)=>resolve({code,signal}));});activeChild=null;Object.assign(record,exit,{elapsedMs:performance.now()-begun,exitObserved:true});
 await fs.writeFile(join(D,label+'.stdout'),out,{flag:'wx'});await fs.writeFile(join(D,label+'.stderr'),err,{flag:'wx'});await save(label+'-process.json',record);return {...record,stdout:out,stderr:err};
}
try{
 await save('native-budget.json',{budgetMs:120000,startedAt:new Date().toISOString(),driverPid:process.pid,definition:'Starts after file/hash/syntax preflight; includes current installed verification and two sequential read/renderer pairs',cliTMPDIR:lockNamespace,parentTMPDIR:process.env.TMPDIR});
 phase='current-installed-verification';const verificationPacket=await read(join(C,'product-verification-request.json')),verificationStart=performance.now();const verification=await product.ProductVerificationPort.verify(verificationPacket);await save('current-verification.json',{kind:verification.kind,coordinates:verification.coordinates??null,elapsedMs:performance.now()-verificationStart});
 assert.equal(verification.kind,'product_verification_success');const verified=verification.verifiedArtifact;assert.strictEqual(product.selectOwnedProductVerification(verificationPacket.request,verified),verified);assert.equal(verified.productContentDigest,selected.basis.productContentDigest);assert.equal(verified.manifestDigest,selected.basis.manifestDigest);assert.equal(verified.catalogDigest,'sha256:82d5e747b6ac658a4c2e73e2df474d1cb53be68932275b9201d3b67fb47fb0c1');
 const coordinates=verified.definitionContractCoordinates,member=coordinates.operations.find(o=>o.operationId==='abg.operation.project.read').members.find(m=>m.memberKey==='run_gaps'),catalog=member.slots.request.contractCatalog;
 const environment={...historical,product};
 const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
 const make=entry=>constructInstalledRunReadCall({environment,publicApi,projectReadContracts:reads,memberKey:'run_gaps',selector:{kind:'none'},source:entry.run,eventResource:resource(),identity:'t287-s03-installed-handoff-01-'+entry.name,contractCatalogOverride:catalog,definitionContractCoordinatesOverride:coordinates});
 phase='pure-call-construction';for(const entry of cases){const made=make(entry);assert.deepEqual(made.call.invocation.contractCatalog,catalog);assert.deepEqual(made.call.invocation.request.source,{sourceKind:'run',sourceRef:entry.run.ref,sourceDigest:entry.run.digest});await save(entry.name+'/prospective-call.json',{call:made.call,grants:made.grants});}
 await save('reader-workload-binding.json',{reader:{...selected.basis,verificationRef:verified.verificationRef,verificationDigest:verified.verificationDigest,contractCatalog:catalog,definitionContractCoordinates:coordinates,installedRoot},historical:{workspaceBinding:historical.workspaceBinding,admittedInstalls:historical.admittedInstalls.map(i=>({installId:i.installId,productId:i.productId,productContentDigest:i.productContentDigest,artifactDigest:i.artifactDigest,catalogDigest:i.catalogDigest})),originalInstalledRoot:historical.installedRoot},separation:'Current reader Product constructor/current verified slots with historical admitted workload environment; no new admission or relabeling'});
 await physical('initial');
 for(const entry of cases){
  checkBudget();phase=entry.name+'-pre-effect';const before=await physical(entry.name+'/before'),made=make(entry);await save(entry.name+'/call.json',{call:made.call,grants:made.grants});const request={kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:handoff},invocation:made.call};const requestPath=join(D,entry.name,'request.jsonl');await fs.writeFile(requestPath,JSON.stringify(request)+'\n',{flag:'wx'});
  phase=entry.name+'-cli';nativeCalls++;const result=await child(entry.name+'/cli',[join(installedRoot,'build/code/src/public/cli.js'),'--jsonl',requestPath],{...process.env,TMPDIR:lockNamespace});
  let transport=null;try{const lines=result.stdout.trim().split(/\r?\n/u);assert.equal(lines.length,1);transport=JSON.parse(lines[0]);await save(entry.name+'/transport.json',transport);}catch(error){await save(entry.name+'/transport-parse-failure.json',{message:error.message});throw error;}
  const receipt=transport.receipt;await save(entry.name+'/receipt.json',receipt??null);
  if(receipt?.resources?.eventResource?.closeHandoff){handoff=receipt.resources.eventResource.closeHandoff;await save(entry.name+'/handoff.json',handoff);await fs.writeFile(join(D,'latest-handoff.json'),JSON.stringify(handoff,null,2)+'\n');}
  await physical(entry.name+'/after');assert.equal(result.code,0);assert.equal(result.signal,null);assert.equal(result.stderr,'');assert.ok(receipt?.resources?.eventResource?.closeHandoff,'Ordinary owner close required');assert.equal(receipt.failure,null);assert.equal(receipt.ownerOutput.outcomeKind,'result');
  await save(entry.name+'/owner-output.json',receipt.ownerOutput);phase=entry.name+'-fresh-renderer';const rendered=await child(entry.name+'/renderer',[join(D,'fresh-renderer.mjs'),join(D,entry.name,'owner-output.json')],{...process.env,TMPDIR:join(D,'tmp')});assert.equal(rendered.code,0);assert.equal(rendered.stderr,'');await fs.writeFile(join(D,entry.name,'handoff.txt'),rendered.stdout,{flag:'wx'});
  phase=entry.name+'-independent-comparison';const retained=await read(join(G,'s03-automatic-02',entry.retained,'oracle-result.json'));assert.deepEqual(retained.identity.run,entry.run);const comparison=assertPublicGapDomain({output:receipt.ownerOutput,identity:retained.identity,boundary:handoff,semantic:retained.semantic,oracle,correctionAvailable:entry.correctionAvailable,product});assert.equal(rendered.stdout,comparison.handoff);
  if(!entry.correctionAvailable){const frontier=receipt.ownerOutput.value.projection.frontiers[0];const rows=eventOwner.validateHistoricalEvents(originalBytes,originalHandoff.prefix.storeIdentity.eventContractDigest);for(const evidence of frontier.basis.inputEvidence){const event=rows.find(e=>e.eventId===evidence.admissionEventRef);assert.ok(event);assert.equal(event.runId,entry.run.ref);assert.equal(event.aggregateId,frontier.nextAction.cCallRef);assert.equal(event.payload.evidenceRef,evidence.evidence.ref);assert.equal(event.payload.evidenceDigest,evidence.evidence.digest);assert.equal(event.payload.inputDigest,frontier.basis.valueDigest);}}
  const closed={status:'passed',run:entry.run,reader:selected.basis,frontiers:comparison.projection.frontiers.length,rendering:rendered.stdout,zeroAppend:true,beforePhysical:before.sha256,afterPrefix:handoff.prefix,cliPid:result.pid,rendererPid:rendered.pid,cliElapsedMs:result.elapsedMs,rendererElapsedMs:rendered.elapsedMs};await save(entry.name+'/comparison.json',closed);results.push(closed);
 }
 phase='final-conservation';const final=await physical('final');await save('final-handoff.json',handoff);checkBudget();await save('installed-result.json',{status:'passed',nativeCalls,results,final,ownedProcesses:children,driverPid:process.pid,elapsedMs:performance.now()-started,budgetMs:120000,limits:['Historical workload remains historical','No full final-candidate scenario/qualification claim','No host-wide process observation; owned exit and original lock only']});console.log(JSON.stringify({status:'passed',nativeCalls,elapsedMs:performance.now()-started}));
}catch(error){
 let observed=null;try{observed=await physical('failure-final',false);}catch(observationError){observed={observationError:observationError.message};}
 await save('failure.json',{phase,message:error.message,stack:error.stack,nativeCalls,results,lastGenuineHandoff:handoff,physical:observed,ownedProcesses:children,driverPid:process.pid,budgetExpired:expired,elapsedMs:performance.now()-started});console.error(error.stack);process.exitCode=1;
}finally{clearTimeout(watchdog);}
