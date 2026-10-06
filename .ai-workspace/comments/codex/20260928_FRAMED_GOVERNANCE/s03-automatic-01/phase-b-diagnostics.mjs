// Read-only diagnosis of the retained native prefix; no acquisition, replay call,
// continuation, assertion retry or admission occurs here.
import {readFile,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const proof=join(process.cwd(),'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s03-automatic-01');
const read=async name=>JSON.parse(await readFile(join(proof,name),'utf8'));
const environment=await read('environment.json'),handoff=await read('latest-handoff.json'),receipt=await read('positive/start-receipt.json'),prospective=await read('positive/prospective-start.json');
const owner=await import(pathToFileURL(join(environment.installedRoot,'build/code/src/abg/event_store.js')));
const rows=owner.readRuntimeEventsAtDurablePrefix(handoff.prefix),run=receipt.output.receipt.resources.run;
const local=rows.filter(row=>row.runId===run.ref),intents=local.filter(row=>row.kind==='construction_intent_selected');
const selected=intents.map(event=>{
 const intent=event.payload.constructionIntent;
 const delta=local.find(row=>row.kind==='construction_delta_observed'&&row.payload.constructionIntentRef===intent.constructionIntentRef);
 const workflow=local.find(row=>row.kind==='c_call_opened'&&row.payload.cursorRef===intent.targetCursorRef);
 const childBasis=local.find(row=>row.kind==='basis_admitted'&&row.payload.basisClass==='child'&&row.payload.parentCCallRef===workflow?.payload.cCallRef);
 const childResults=childBasis?local.filter(row=>row.kind==='c_call_result_admitted'&&row.basisId===childBasis.payload.basisRef):[];
 return {event,envelopeKeys:Object.keys(event.payload),erroneousTopLevelSelectedActionRefPresent:Object.hasOwn(event.payload,'selectedActionRef'),erroneousTopLevelTargetInputPresent:Object.hasOwn(event.payload,'targetInput'),actualSelectedActionRef:intent.selectedActionRef,actualTargetInput:intent.targetInput,workflow:workflow??null,childBasis:childBasis??null,childResults,delta:delta??null};
});
const physicalPath=fileURLToPath(handoff.prefix.eventLogRef),bytes=await readFile(physicalPath),info=await stat(physicalPath);
const observation={at:new Date().toISOString(),purpose:'First-failure causal observation only; no repaired oracle or resumed proof',run,publicStart:{outcomeKind:receipt.output.receipt.ownerOutput.outcomeKind,disposition:receipt.output.receipt.ownerOutput.value.disposition,failure:receipt.output.receipt.failure,wallMs:receipt.wallMs},actualInput:prospective.input,workAuthority:prospective.workAuthority,policy:prospective.policy,invocation:rows.find(row=>row.kind==='invocation_admitted'&&row.payload.publicRequestInvocationRef===prospective.call.invocation.invocationRef),rootBasis:local.find(row=>row.kind==='basis_admitted'&&row.payload.basisClass==='root'),logicalEventCount:rows.length,runEventCount:local.length,eventKinds:Object.fromEntries([...new Set(local.map(r=>r.kind))].sort().map(kind=>[kind,local.filter(r=>r.kind===kind).length])),selected,routes:local.filter(row=>row.kind==='traversal_route_admitted'),runClosure:local.filter(row=>row.kind==='run_closed'),physical:{path:physicalPath,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),device:info.dev,inode:info.ino,mtimeMs:info.mtimeMs},handoff,notPerformed:['no-action case','cold run_result','cold run_replay','cold run_status','proof retry','source repair']};
await writeFile(join(proof,'phase-b-causal-observations.json'),JSON.stringify(observation,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({logicalEvents:rows.length,runEvents:local.length,positiveStart:observation.publicStart,actions:selected.map(s=>({selectedAction:s.actualSelectedActionRef,inputOperation:s.actualTargetInput.operation,childResults:s.childResults.map(r=>({eventId:r.eventId,target:r.payload.value?.domain?.target,unaffected:r.payload.value?.domain?.unaffected})),delta:s.delta?.eventId})),closure:observation.runClosure.map(e=>e.eventId),physical:observation.physical},null,2));
