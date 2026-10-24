import assert from 'node:assert/strict';
import {readFileSync,lstatSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join,relative,isAbsolute,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {runInNewContext} from 'node:vm';
import {workflowStepHarness} from './d2-workflow-step-harness.mjs';
import {evidenceInput} from './evidence-root.mjs';
export const packageRoot=resolve(import.meta.dirname,'../..');
const skipOf=input=>input.kind==='absent'&&input.reason;
// Historical evidence under ABI5_EVIDENCE_ROOT: the D2 installed-continuation-07
// native store and its ready record, and the implementation-03 predecessor
// build, named by its two compiled collectors and the first module the lane
// imports from it.
const D2='comments/codex/20260911_D2_BOUNDED_REPAIR/';
export const retainedStoreInput=evidenceInput({path:D2+'installed-continuation-07/installed-frame-01/events-01/runtime.events.jsonl',
  sha256:'25dd49061c9046436469f07cdafad592840ea9ebfdf824ec091042c02859dc96',bytes:12040406});
export const readyRecordInput=evidenceInput({path:D2+'installed-continuation-07/installed-frame-01/attempt-01/program-ready-16.json',
  sha256:'99cd271bc49df83ff716c1e8c7fad5fb99753fb64577098d99b9cc70ba1806a4',bytes:12781893});
export const priorInputs=Object.fromEntries([
  ['digests','build/code/src/shared/digests.js','bcfca50154c00df17ac3eacbd49323180f7645b2b0d779554dc9aa7c7c34212a',838],
  ['compiledStage','build/code/src/abg/semantic_stage.js','b7c408d39f6ee8f6c57e6c68fa43da624ed9226c0dba59c2a0c744cf28d8b2d3',27249],
  ['compiledRevision','build/code/src/abg/semantic_revision.js','fe7fe9bfa94191137c5557cc3e8b443ebd27e0d777b658bab6f4d331b854e6f2',30666],
].map(([name,path,sha256,bytes])=>[name,evidenceInput({path:D2+'implementation-03/work/'+path,sha256,bytes})]));
export const retainedSkip=skipOf(retainedStoreInput)||skipOf(readyRecordInput)||false;
export const priorSkip=retainedSkip||Object.values(priorInputs).map(skipOf).find(Boolean)||false;
export const priorRoot=priorSkip?null:resolve(dirname(priorInputs.digests.path),'../../../..');
export const load=(root,path)=>import(pathToFileURL(join(root,'build/code/src',path+'.js')).href);
const rawSha=b=>createHash('sha256').update(b).digest('hex');
export function retainedRows() {
  if(retainedStoreInput.kind!=='present')throw new Error(retainedSkip);
  const bytes=retainedStoreInput.bytes;
  const lines=bytes.toString('utf8').trimEnd().split('\n'),events=lines.map(JSON.parse);
  assert.equal(events.length,800);
  return {bytes,events,lines};
}

// Read-only reconstruction of an actual stopped native invocation's historical
// cut. No event/store is opened for writes; no fabricated event is admitted.
export async function retainedNativeBasis(root=packageRoot) {
  const {sha256Canonical:hash}=await load(root,'shared/digests');
  const {deepFreeze}=await load(root,'shared/immutable');
  const store=await load(root,'abg/event_store'),prefixes=await load(root,'abg/event_prefix');
  const execution=await load(root,'abg/execution_basis'),calls=await load(root,'abg/c_call');
  const {constructTraversalCursorCandidate}=await load(root,'abg/traversal_cursor');
  const {materializeGraph}=await load(root,'gtl/materialize');
  const stage=await load(root,'abg/semantic_stage'),product=await load(root,'product/semantic_stage');
  const captured=retainedRows(),readyBytes=readyRecordInput.bytes;
  const ready=deepFreeze(JSON.parse(readyBytes));
  const prefixBytes=Buffer.from(captured.lines.slice(0,795).join('\n')+'\n');
  assert.equal(rawSha(prefixBytes),'bee0eb307565ad2328d30c2629517bd53db003b0094b5377faaacc7e069b642a');
  const {coordinateDigest:ignored,...body}=ready.closeHandoff.prefix;
  const prefixBody={...body,prefixLength:prefixBytes.length,prefixDigest:'sha256:'+rawSha(prefixBytes)};
  const predecessorPrefix=deepFreeze({...prefixBody,coordinateDigest:hash(prefixBody)});
  assert.ok(store.validateDurablePrefixCoordinate(predecessorPrefix));
  const events=store.readRuntimeEventsAtDurablePrefix(predecessorPrefix);
  const prefix=prefixes.selectValidatedRuntimeEventPrefix(events),selected=events.at(-1);
  const executionBasis=execution.rehydrateExecutionBasisAtPrefix(prefix,selected.basisId);
  assert.ok(executionBasis);
  const publications=ready.call.resources.catalog.boundPublications;
  const publication=publications.find(p=>p.moduleRef===ready.resolution.programOwner.moduleRef);
  const sourcePublication=publications.find(p=>p.requirementHandoffs?.some(d=>d.declarationRef===publication.semanticLifecycle.sourceDeclarationRef));
  const declarationGraphFunctions=publications.flatMap(p=>p.graphFunctions);
  const graphFunction=declarationGraphFunctions.find(g=>g.name===executionBasis.graphFunctionRef&&hash(g)===executionBasis.graphFunctionDigest);
  const graph=materializeGraph(graphFunction,{invocationAdmissionRef:executionBasis.invocationAdmissionRef,
    admittedInputRef:executionBasis.rawInputAdmissionRef,admittedInputDigest:executionBasis.rawInputDigest,admittedInput:executionBasis.rawInputValue});
  const cCall=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,selected.payload.cCallRef);
  assert.ok(cCall);
  const entered=events.find(e=>e.admissionOrdinal===793),e=entered.payload;
  const cursor=constructTraversalCursorCandidate({programRef:e.programRef,executionBasisRef:e.executionBasisRef,
    traversalScopeRef:e.traversalScopeRef,runId:entered.runId,graphCallId:entered.graphCallId,frameId:entered.frameId,
    graphRef:e.materializationRef,inputRef:e.inputRef,inputDigest:e.inputDigest,currentNodeRef:e.termPath[1],
    position:'at_term',termPath:e.termPath,taskOrdinal:e.taskOrdinal,attempt:e.attempt,retryPath:e.retryPath});
  assert.equal(cursor.cursorRef,e.cursorRef);
  assert.equal(cursor.cursorDigest,e.cursorDigest);
  const basis=deepFreeze({publication,lifecyclePublication:publication,sourcePublication,graph,graphFunction,
    declarationGraphFunctions,executionBasis,cCall,cursor,predecessorPrefix});
  assert.ok(stage.authenticateSemanticStageBasis(basis),'native owner authenticates actual historical prefix and declaration coordinates');
  const input=stage.semanticInputValueAtBasis(basis);
  return {root,stage,product,basis,input,events,prefix,predecessorPrefix,hash,deepFreeze,publications};
}

// Mechanical collector tests: use the unchanged compiled collector and exact
// selectedSemanticPredecessor bodies, real Product guards/constructors and the
// strict native prefix selector. Authentication, CCall/basis lookup, revision
// preparation and snapshot I/O are explicit assumptions. Synthetic lookup rows
// are never persisted, admitted, replayed or represented as native history.
export async function collectorHarness(arm) {
  const stage=await load(packageRoot,'abg/semantic_stage');
  const revision=await load(packageRoot,'abg/semantic_revision');
  const product=Object.assign({},...await Promise.all([
    'product/semantic_stage','product/semantic_revision','product/worksite_command_execution',
    'product/worksite_construction','product/worksite_preparation','product/worksite_revision',
    'shared/digests','shared/immutable','gtl/semantic_stage_identity','gtl/semantic_revision_identity',
  ].map(path=>load(packageRoot,path))));
  const prefixes=await load(packageRoot,'abg/event_prefix');
  const hash=product.sha256Canonical,deepFreeze=product.deepFreeze;
  const actual=retainedRows().events;
  let original,entry,input,prior,snapshotBytes;
  if(arm==='initial') {
    const producer=actual.find(e=>e.admissionOrdinal===211);
    original=actual.find(e=>e.kind==='basis_admitted'&&e.payload.basisRef===producer.basisId).payload.rawInputValue;
    entry=producer.payload.value;input=actual.find(e=>e.admissionOrdinal===769).payload.value;prior=original;
    snapshotBytes=new Map(input.snapshotMembers.map(member=>[resolve(input.provenance.helperPlan.sandboxRoot,member.relativePath),
      readFileSync(resolve(input.provenance.helperPlan.sandboxRoot,member.relativePath))]));
  } else {
    assert.equal(arm,'revision');
    const h=await workflowStepHarness();original=h.cut.value;entry=h.entry;input=h.observation;prior=h.stage;
    snapshotBytes=new Map(input.snapshotMembers.map(member=>[resolve(input.provenance.helperPlan.sandboxRoot,member.relativePath),
      Buffer.from(h.cut.value.current.worksite.targets.find(row=>row.target.subject.relativePath===member.relativePath).base64,'base64')]));
  }
  const D=product.SEMANTIC_STAGE_IDS,R=product.SEMANTIC_REVISION_IDS;
  const bridgeRef=arm==='initial'?D.bridgeImplementationRef:R.bridgeImplementationRef;
  const states=new Map(),executions=new Map(),prefixCalls=[],preparationCalls=[];
  const identity={invocationAdmissionRef:'lookup-only:invocation-admission',invocationRef:'lookup-only:invocation',invocationDigest:hash('invocation'),
    programRef:'lookup-only:program',programDigest:hash('program'),rootImplementationSetRef:'lookup-only:implementations',rootImplementationSetDigest:hash('implementations'),
    workspaceBindingId:entry.constructionTask.workspaceBinding.bindingId,workspaceBindingDigest:entry.constructionTask.workspaceBinding.bindingDigest};
  const owner={prefix:{assumption:'authenticated native lookup only'},events:deepFreeze(actual.slice(0,10)),execution:identity,
    inputDigest:hash(input),call:{implementationRef:arm==='initial'?D.evidenceInputImplementationRef:R.evidenceInputImplementationRef}};
  const basis={publication:{},declarationGraphFunctions:[]};
  function state(name,value,implementationRef,rawInput=original,ordinal=owner.events.length+1) {
    const cCallRef=`lookup-only:call:${name}`,basisId=`lookup-only:basis:${name}`;
    const event={kind:'c_call_result_admitted',eventId:`lookup-only:event:${name}`,aggregateId:cCallRef,admissionOrdinal:ordinal,payload:{value}};
    const previous={cCall:{cCallRef,basisId,implementationRef},result:{value,resultClass:'success',resultRef:`lookup-only:result:${name}`,resultDigest:hash(value)},judgment:{judgment:'advance'}};
    states.set(cCallRef,previous);executions.set(basisId,{...identity,rawInputValue:rawInput});
    owner.events=Object.freeze([...owner.events,event]);return {event,previous,execution:executions.get(basisId)};
  }
  const bridge=state('bridge',entry,bridgeRef);
  const alias=state('parent-alias',entry,'lookup-only:parent-implementation');
  const construction=state('construction',input.task.sourceConstructionResult,product.WORKSITE_CONSTRUCTION_IDS.reducerImplementationRef);
  const command=state('command',input,arm==='initial'?product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef:product.WORKSITE_REVISION_IDS.implementationRef);
  const compiled=readFileSync(join(packageRoot,'build/code/src/abg/semantic_stage.js'),'utf8');
  const sameInvocation=compiled.match(/^function sameInvocation\(a, b\) \{[\s\S]*?^\}/m)?.[0];assert.ok(sameInvocation);
  function collector(root=packageRoot,diagnostic=false) {
    const file=join(root,'build/code/src/abg',arm==='initial'?'semantic_stage.js':'semantic_revision.js');
    const name=arm==='initial'?'projectSemanticEvidenceInput':'projectRevisionEvidenceInput';
    const compiled=readFileSync(file,'utf8');
    let body=compiled.match(new RegExp(`^export function ${name}\\(basis, input\\) \\{[\\s\\S]*?^\\}`,'m'))?.[0].replace(/^export /,'');
    assert.ok(body,'one exact compiled collector body');
    if(diagnostic){let n=0;body=body.replace(/return null;/g,()=>`{console.error('collector refusal ${++n}');return null;}`).replace(/catch \{/g,"catch(error) { console.error(error.stack);");}
    const context={...product,console,hash,deepFreeze,ids:R,record:value=>value!==null&&typeof value==='object'&&!Array.isArray(value),
      resolve,relative,isAbsolute,realpathSync:path=>path,
      lstatSync:path=>({isSymbolicLink:()=>false,isFile:()=>snapshotBytes.has(path),nlink:1}),
      readFileSync:path=>{assert.ok(snapshotBytes.has(path),'only mapped snapshot bytes');return snapshotBytes.get(path);},
      authenticateSemanticStageBasis:()=>owner,semanticInputValueAtBasis:()=>input,
      projectSemanticPredecessorAtPrefix:(_prefix,_events,_publication,ref)=>states.get(ref)??null,
      rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>executions.get(ref)??null,
      selectValidatedRuntimeEventPrefix:events=>{prefixCalls.push(events);return prefixes.selectValidatedRuntimeEventPrefix(events);},
      revisionPreparationAtBasis:(_basis,value,readPhysical,cut)=>{
        assert.equal(hash(value),hash(original));assert.equal(readPhysical,false);
        const rows=prefixes.runtimeEventsFromValidatedPrefix(cut);assert.equal(rows.length,10);
        assert.deepEqual(rows.map(e=>e.eventId),actual.slice(0,10).map(e=>e.eventId));
        preparationCalls.push(cut);return entry;
      },
      admitted:()=>({result:{value:prior}}),
    };
    return runInNewContext(`${sameInvocation}\n${stage.selectedSemanticPredecessor.toString()}\n${body}\n${name}`,context,{filename:file});
  }
  const current=collector(),old=collector(priorRoot);
  return {arm,product,owner,basis,entry,input,original,bridge,alias,construction,command,states,executions,bridgeRef,state,
    prefixCalls,preparationCalls,project:()=>current(basis,input),projectBefore:()=>old(basis,input),diagnose:()=>collector(packageRoot,true)(basis,input),
    removeAlias:()=>{owner.events=Object.freeze(owner.events.filter(e=>e!==alias.event));}};
}

// Instrumented read-only localization only. Return/catch logging does not
// replace the unmodified native projector's separately retained result.
export async function diagnoseNativeCollector() {
  const h=await retainedNativeBasis();
  const product=Object.assign({},...await Promise.all(['product/semantic_stage','product/worksite_command_execution',
    'product/worksite_construction','product/worksite_preparation','gtl/semantic_stage_identity','shared/digests','shared/immutable']
    .map(path=>load(packageRoot,path))));
  let n=0;const body=h.stage.projectSemanticEvidenceInput.toString()
    .replace(/return null;/g,()=>`{console.error('native collector refusal ${++n}');return null;}`)
    .replace(/catch \{/g,"catch(error) { console.error(error.stack);");
  const context={...product,...h.stage,console,hash:h.hash,record:value=>value!==null&&typeof value==='object'&&!Array.isArray(value),
    resolve,relative,isAbsolute,readFileSync,lstatSync,realpathSync};
  const projector=runInNewContext(body+'\nprojectSemanticEvidenceInput',context);
  const output=projector(h.basis,h.input);console.log(JSON.stringify({diagnosticOnly:true,outputKind:output?.kind??null}));
}
