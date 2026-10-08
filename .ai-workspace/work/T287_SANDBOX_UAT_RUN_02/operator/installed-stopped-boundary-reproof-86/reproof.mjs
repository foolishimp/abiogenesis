import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {exclusiveRecord,readOracleEvents,freshReadbacks,commandRecorder,commandObservationOwner,eventResourceIdentity} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {installedModules,publicCaller} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
import {readJson,digest,acquireArchivedScenario,fixturePath} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/scenarios.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const pins=await readJson(join(root,'input-pins.json')),archive=pins.archive;
const record=(path,value,raw=false)=>exclusiveRecord(root,path,value,raw);
const t0=performance.now(),stages=[];
let stage='input-pins',caller;
const memory=()=>({...process.memoryUsage(),maxRSSKiB:process.resourceUsage().maxRSS});
async function mark(name,data={}) {stage=name;const row={stage:name,at:new Date().toISOString(),elapsedMs:performance.now()-t0,memory:memory(),...data};stages.push(row);await record('stages/'+stages.length+'-'+name+'.json',row);console.log(JSON.stringify(row));}
try {
 for(const p of pins.pins){const bytes=await readFile(p.path);assert.equal(digest(bytes),'sha256:'+p.sha256);assert.equal(bytes.length,p.byteCount);}
 const setup=await readJson(join(archive,'setup-identity.json')),acquisition=await readJson(join(archive,'abg-acquisition.json')),
   old=await readJson(join(archive,'run.json')),handoff=await readJson(join(archive,'final-close-handoff.json'));
 const outcome=await readJson(join(archive,'calls/lifecycle-start.outcome.json')),call=await readJson(join(archive,'prepared-definition-call.json'));
 assert.deepEqual(outcome.receipt.resources.run,pins.rootSelectedRun);assert.deepEqual(handoff.prefix,pins.selectedPrefix);
 assert.equal(outcome.receipt.ownerOutput.value.terminalResult,null);assert.equal(outcome.receipt.ownerOutput.value.disposition,'blocked');
 const bootstrapRoot=pins.readerHostRoot,runtime=await installedModules(bootstrapRoot);
 const inherited=Object.fromEntries((old.configuration.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']).filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
 const environment={...inherited,...(old.configuration.toolchainEnvironment??{})};
 const config={...old.configuration,runId:old.runId,bootstrapRoot,setupEnvironment:environment};
 const command=commandRecorder(root,{environment,timeoutMs:config.processTimeoutMs,maxOutputBytes:config.maxProcessOutputBytes});
 const reader=await readJson(pins.readerAcquisitionSource);
 const native={request:reader.request,verification:reader.verification,verified:reader.verification.verifiedArtifact};
 assert.equal(native.verified.productContentDigest,'sha256:0aec3faf0c230042f2c9457a03565eb9a4d566a41da9888e873438a9e7b17c5c');
 caller=publicCaller({root,runtime,native,command,record,config});
 caller.installedRoot=bootstrapRoot;caller.state.closeHandoff=handoff;caller.state.binding=setup.workspaceBinding;
 caller.state.resolvedLock=setup.resolvedLock;caller.workspaceAuthority=setup.workspaceAuthority;
 await record('run.json',{classification:'Model-free post-stop evidence-boundary reproof; no new Run/native work or old truth alteration',fromArchive:archive,run:pins.rootSelectedRun,originalRunId:old.runId});
 const execution={receipt:{resources:{run:outcome.receipt.resources.run},ownerOutput:outcome.receipt.ownerOutput},call};
 const oldFreeze=await readJson('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/installed-call-local-successor-execution-48/execution-freeze.json');
 const materialPins=oldFreeze.ledger.filter(p=>p.path.startsWith(join(archive,'sandbox/worksite')+'/'));
 assert.equal(materialPins.length,48);
 for(const p of materialPins){const b=await readFile(p.path);assert.equal(digest(b),'sha256:'+p.sha256);assert.equal(b.length,p.byteCount);}
 const contentBefore=[];
 for(const install of setup.installations){assert.equal(await runtime.product.installedProductContentMatches(install),true);contentBefore.push({installId:install.installId,installedRoot:install.installedRoot,productContentDigest:install.productContentDigest,contentMatches:true});}
 await record('installed-content-before-reproof.json',contentBefore);
 await mark('owner-read-start',{run:pins.rootSelectedRun,prefix:pins.selectedPrefix,installedRoot:caller.installedRoot,historicalInstalledRoots:setup.installations.map(x=>x.installedRoot),readerArtifact:native.verified.productContentDigest,ownedPid:process.pid});
 const events=await readOracleEvents(runtime.abg,handoff.prefix,record,source=>caller.refresh(source));
 await mark('owner-read-complete',{eventCount:events.length,first:{eventId:events[0].eventId,ordinal:events[0].admissionOrdinal},last:{eventId:events.at(-1).eventId,ordinal:events.at(-1).admissionOrdinal}});
 await mark('fresh-readbacks-start');
 const reads=await freshReadbacks(caller,execution);await record('fresh-readback.json',reads);
 await mark('fresh-readbacks-complete',{reads:reads.map(r=>({memberKey:r.memberKey,outcomeKind:r.ownerOutput.outcomeKind,code:r.ownerOutput.value?.code,status:r.projection?.status,terminalResult:r.projection?.terminalResult??null}))});
 const oracleSnapshot=await readJson(join(archive,'oracle-acquisition.json')),selected=await acquireArchivedScenario(oracleSnapshot);
 const sourceChecks=[];
 for(const source of selected.sources)sourceChecks.push({path:source.path,expected:source.digest,observed:digest(await readFile(fixturePath(join(archive,'sandbox/worksite'),source.path)))});
 assert.ok(sourceChecks.every(s=>s.expected===s.observed));await record('source-conservation.json',sourceChecks);
 const installedOwner=(await installedModules(caller.installedRoot)).product,terminal=execution.receipt.ownerOutput.value.terminalResult;
 const observationOwner=commandObservationOwner(installedOwner,execution);
 const observationRelation=installedOwner.resolveWorksiteCommandExecutionJudgmentRelation(installedOwner.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
 const oracle=await import(pathToFileURL(fixturePath(oracleSnapshot.root,selected.row.oracleModule)).href);
 const input=call.invocation.request.input.value;
 assert.equal(runtime.product.sha256Canonical(input),call.invocation.request.input.valueDigest);
 assert.ok(input?.original?.testing,'Archived canonical lifecycle input.original.testing is required');
 await mark('original-oracle-start');
 const judged=await oracle.evaluate({worksiteRoot:join(archive,'sandbox/worksite'),runArchive:archive,commands:caller.state.calls,events,source:selected.row,
  request:{...selected.request,testing:input.original.testing},observationOwner,validateObservation:observationRelation?observation=>observationRelation.evaluate(observation.task,observation):undefined});
 await record('independent-oracle.json',judged);
 await mark('original-oracle-complete',{disposition:judged.disposition??judged.status,criteria:judged.criteria?.length});
 const contentAfter=[];
 for(const install of setup.installations){assert.equal(await runtime.product.installedProductContentMatches(install),true);contentAfter.push({installId:install.installId,installedRoot:install.installedRoot,productContentDigest:install.productContentDigest,contentMatches:true});}
 assert.deepEqual(contentAfter,contentBefore);await record('installed-content-after-reproof.json',contentAfter);
 for(const p of materialPins){const b=await readFile(p.path);assert.equal(digest(b),'sha256:'+p.sha256);assert.equal(b.length,p.byteCount);}
 for(const p of pins.pins){const bytes=await readFile(p.path);assert.equal(digest(bytes),'sha256:'+p.sha256);assert.equal(bytes.length,p.byteCount);}
 const fullIdentity=await eventResourceIdentity(fileURLToPath(handoff.prefix.eventLogRef));
 assert.equal(fullIdentity.digest,handoff.prefix.prefixDigest);assert.equal(fullIdentity.byteCount,handoff.prefix.prefixLength);
 await record('event-resource-conservation.json',fullIdentity);
 const s=await stat(fileURLToPath(handoff.prefix.eventLogRef),{bigint:true});assert.equal(s.size,BigInt(pins.storeBefore.byteCount));assert.equal(s.ino,BigInt(pins.storeBefore.inode));assert.equal(s.dev,BigInt(pins.storeBefore.device));assert.equal(String(s.mtimeNs),String(pins.storeBefore.mtimeNs));
 await record('outcome.json',{classification:'Supported eventless boundary reproof only; no new native result or completion',run:pins.rootSelectedRun,nativeDisposition:'blocked',terminalResult:null,uatPass:false,eventCount:events.length,
  freshReads:reads.map(r=>({memberKey:r.memberKey,outcomeKind:r.ownerOutput.outcomeKind,status:r.projection?.status??null,code:r.ownerOutput.value?.code??null})),oracleDisposition:judged.disposition??judged.status,
  originalControlPinsConserved:pins.pins.length,worksiteFilePinsConserved:materialPins.length,installationsUnchanged:contentAfter.length,wallMs:performance.now()-t0});
 await mark('complete');
} catch(error) {
 const observation=error.observation;
 const failure={stage,name:error.name,message:error.message,code:error.code??null,stack:error.stack,at:new Date().toISOString(),wallMs:performance.now()-t0,memory:memory(),
  observation:observation===undefined?null:observation,stop:'First actual failure; no retry/patch/cap or native effect'};
 await record('failure.json',failure);console.error(JSON.stringify({stage,name:error.name,message:error.message,code:error.code??null,stack:error.stack}));process.exitCode=1;
} finally {await record('stages.json',stages);}
