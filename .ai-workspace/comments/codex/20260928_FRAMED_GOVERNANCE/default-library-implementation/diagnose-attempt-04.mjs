import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-implementation'), dir=resolve(root,'attempt-04');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const setup=await read(resolve(dir,'setup.json')), run=await read(resolve(dir,'execution.json')), request=await read(run.requestPath), handoff=await read(resolve(dir,'handoff.json'));
const load=path=>import(pathToFileURL(resolve(setup.installedRoots[0],'build/code/src',path+'.js')).href);
const [store,truth,bases,calls,cursors,gtl,library,physical,invocations]=await Promise.all(['abg/event_store','abg/artifact_truth','abg/execution_basis','abg/c_call','abg/traversal_cursor','gtl/index','abg/default_library','product/worksite_operations','abg/invocation_execution_truth'].map(load));
const events=store.readRuntimeEventsAtDurablePrefix(handoff.prefix), publication=await read(resolve(dir,'publication.json'));
const definitions=request.invocation.resources.catalog.boundPublications.flatMap(p=>p.graphFunctions), report={calls:[]};
for(const opened of events.filter(e=>e.kind==='c_call_opened')){
 const result=events.find(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===opened.aggregateId), evidenced=events.find(e=>e.kind==='c_call_evidenced'&&e.aggregateId===opened.aggregateId), previous=events.find(e=>e.admissionOrdinal===evidenced.admissionOrdinal-1);
 const durable=store.durableRuntimeEventPrefixThroughEvent(handoff.prefix,previous.eventId), artifact=truth.projectOwnedPrefixArtifactTruth(durable), prefix=truth.runtimePrefixFromArtifactTruth(artifact);
 const execution=bases.rehydrateExecutionBasisAtPrefix(prefix,opened.basisId), graphFunction=definitions.find(g=>g.name===opened.graphFunctionRef);
 const graph=gtl.materializeGraph(graphFunction,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
 const origin=events.find(e=>e.kind==='traversal_cursor_entered'&&e.payload.cursorRef===opened.payload.cursorRef),p=origin.payload;
 const cursor=cursors.constructTraversalCursorCandidate({programRef:p.programRef,executionBasisRef:p.executionBasisRef,traversalScopeRef:p.traversalScopeRef,runId:origin.runId,graphCallId:origin.graphCallId,frameId:origin.frameId,graphRef:p.materializationRef,inputRef:p.inputRef,inputDigest:p.inputDigest,currentNodeRef:p.termPath[1],position:'at_term',termPath:p.termPath,taskOrdinal:p.taskOrdinal,attempt:p.attempt,retryPath:p.retryPath});
 assert.equal(cursor.cursorRef,p.cursorRef);
 const call=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,opened.aggregateId);
 const basis=bases.constructNativeInstructionAssemblyBasis({publication,graph,graphFunction,declarationGraphFunctions:definitions,executionBasis:execution,cCall:call,cursor,predecessorPrefix:durable});
 assert.ok(basis,'actual closed-cut assembly basis');const o=bases.authenticateNativeInstructionAssemblyBasis(basis),input=o.inputValue;
 const parent=call.implementationRef.endsWith('/evaluate-parent@5'), projected=parent?library.projectGovernanceParent(basis,input):await library.projectGovernanceSelection(basis,input);
 const invocation=invocations.projectExactInvocationAdmissionAtPrefix(prefix,execution.invocationAdmissionRef);
 const row={callRef:call.cCallRef,implementationRef:call.implementationRef,actualAssemblyBasis:true,projectedNull:projected===null,resultGuard:projected===null?null:library.governanceResultMatches(basis,input,projected)};
 if(!parent){
  const operating={workspaceAuthorityBasis:o.environment.workspaceAuthorityBasis,workspaceBinding:o.environment.workspaceBinding,capabilityGrant:invocation.capabilityGrants[0],protectedInstallRoots:o.environment.productInstalls.map(i=>i.installedRoot),maxFiles:input.original.maxContextFiles,maxBytes:input.original.maxContextBytes};
  row.workspaceRoots=o.environment.workspaceBinding.roots;row.currentReadRoots=input.original.readRoots;
  row.actualContext=await physical.observeWorksiteContext({...operating,readRoots:input.original.readRoots});
  const readRoots=[...new Set([...input.original.sources.map(s=>s.path),...input.original.testing.selectedPaths])].sort();
  row.prospectiveReadRoots=readRoots;
  const context=await physical.observeWorksiteContext({...operating,readRoots});
  row.prospectiveContext={kind:context.kind,...(context.kind==='worksite_context_observation'?{observationRef:context.observationRef,entryCount:context.entries.length,fileBytes:context.entries.reduce((n,e)=>n+(e.byteLength??0),0),allOriginalSources:input.original.sources.every(s=>context.entries.some(e=>e.relativePath===s.path&&e.digest===s.digest))}:{refusal:context})};
 }
 report.calls.push(row);
}
report.providerCalls=events.filter(e=>e.kind==='actor_invocation_started').length;
await writeFile(resolve(root,'diagnose-attempt-04.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report,null,2));
