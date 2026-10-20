import assert from'node:assert/strict';import{readFileSync,writeFileSync,statSync}from'node:fs';import{join}from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';import{performance}from'node:perf_hooks';
const root=fileURLToPath(new URL('.',import.meta.url)),pins=JSON.parse(readFileSync(join(root,'input-pins.json'),'utf8')),installed=pins.readerHostRoot,t0=performance.now();
const record=(name,x)=>writeFileSync(join(root,name),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
let stage='imports',resource;
const mark=(name,scalars={})=>{stage=name;const x={stage:name,at:new Date().toISOString(),elapsedMs:performance.now()-t0,memory:process.memoryUsage(),maxRSSKiB:process.resourceUsage().maxRSS,pid:process.pid,...scalars};record(name+'.json',x);console.log(JSON.stringify(x));};
try{
 const load=member=>import(pathToFileURL(join(installed,'build/code/src',member+'.js')).href);
 const [definition,prefixOwner,replay,liveness,ijson]=await Promise.all(['abg/definition_event_resource','abg/event_prefix','abg/replay','abg/runtime_liveness','shared/i_json'].map(load));
 const closeHandoff=JSON.parse(readFileSync(join(pins.archive,'final-close-handoff.json'),'utf8'));
 const request={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff,handoffDigest:definition.abgEventHandoffDigest(closeHandoff)};record('resource-request.json',request);
 mark('acquisition-start',{eventLogRef:pins.prefix.eventLogRef,expectedBytes:pins.prefix.prefixLength,runRef:pins.run.ref});
 const acquisition=definition.acquireAbgEventResource(request);if(acquisition.kind!=='acquired_abg_event_resource'){record('acquisition-refusal.json',acquisition);throw Error('Existing owner refused resource acquisition: '+acquisition.code+': '+acquisition.message);}
 resource=acquisition.resource;assert.deepEqual(resource.entryPrefix,pins.prefix);
 const events=resource.store.readAll(),fullPrefix=prefixOwner.selectValidatedRuntimeEventPrefix(events),runId=pins.run.ref;
 assert.equal(events.length,165617);mark('acquisition-complete',{eventCount:events.length,lastOrdinal:events.at(-1).admissionOrdinal,fullPrefixSelected:true,currentOwnerPrefix:resource.entryPrefix.coordinateDigest});
 mark('canonical-replay-start');const context=replay.projectRunReplayContext(fullPrefix,runId,resource.entryPrefix);
 if(context===null){mark('canonical-replay-null',{contractAllowsNull:true,noPublicVerdict:true});}else{
 const semanticReplay=context.semanticReplay;
 mark('canonical-replay-complete',{replayRunId:context.replay.runId,replayStatus:context.replay.status??null,terminalResultAvailable:context.replay.terminalResult!==null&&context.replay.terminalResult!==undefined,semanticEventAtomCount:semanticReplay.eventAtoms?.length??null,semanticPhysicalEventCount:semanticReplay.physicalCoordinates?.events?.length??null,replayCCallCount:context.replay.cCalls?.length??null,limitation:'private canonicalRunContext wrapper checks/envelope omitted; same exported replay kernel'});
 mark('additional-whole-run-liveness-start');const nativeLiveness=liveness.projectNativeLivenessRead(fullPrefix,runId,undefined);
 mark('additional-whole-run-liveness-complete',{nativeLivenessReturned:nativeLiveness!==null,invocationProjectionCount:nativeLiveness?.invocations?.length??0,graphCallIdArgument:'undefined/no narrowing'});
 mark('joined-ijson-admission-start');const admitted=ijson.admitIJsonValue(nativeLiveness===null?semanticReplay:{...semanticReplay,nativeLiveness},'ABG project read projection');
 mark('joined-ijson-admission-complete',{joinedTopLevelKeyCount:Object.keys(admitted).length,nativeLivenessPresent:admitted.nativeLiveness!==undefined,semanticEventAtomCount:admitted.eventAtoms?.length??null,noPublicProjectionOrUATCredit:true});
 }
 const closed=definition.closeAbgEventResource(resource,resource.entryPrefix);assert.deepEqual(closed.closeHandoff,closeHandoff);record('close-receipt.json',closed);resource=undefined;
 const s=statSync(fileURLToPath(pins.prefix.eventLogRef),{bigint:true});assert.equal(s.size,BigInt(pins.storeBefore.byteCount));assert.equal(s.dev,BigInt(pins.storeBefore.device));assert.equal(s.ino,BigInt(pins.storeBefore.inode));assert.equal(String(s.mtimeNs),pins.storeBefore.mtimeNs);
 mark('complete',{sameCloseHandoff:true,noEventAppend:true,logBytes:Number(s.size)});
}catch(error){record('failure.json',{stage,name:error.name,message:error.message,stack:error.stack,at:new Date().toISOString(),elapsedMs:performance.now()-t0,memory:process.memoryUsage(),retainedOwnedResource:resource!==undefined,stop:'Firsterror; no retry/recovery/caps. Residue retained for Executive.'});console.error(JSON.stringify({stage,name:error.name,message:error.message,stack:error.stack}));process.exitCode=1;}
