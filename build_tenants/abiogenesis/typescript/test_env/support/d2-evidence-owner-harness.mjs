import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
import {runInNewContext} from 'node:vm';
import {workflowStepHarness} from './d2-workflow-step-harness.mjs';
import {evidenceInput} from './evidence-root.mjs';
import {assertContextBinds} from './vm-context-names.mjs';
export const packageRoot=resolve(import.meta.dirname,'../..');
const skipOf=input=>input.kind==='absent'&&input.reason;
// Historical evidence under ABI5_EVIDENCE_ROOT: the D2 installed-continuation-07
// native store, named by path, digest and bytes; its first ten events are the
// lookup base below. The native ic-07 collector case, the initial-arm lookup
// cases over its admitted preparation and the implementation-03 predecessor
// collector are retired (T-290 C-18b): the retained preparation predates the
// current stage context contract, and the predecessor build is not runnable
// here (C-5 stop 2).
const D2='comments/codex/20260911_D2_BOUNDED_REPAIR/';
export const retainedStoreInput=evidenceInput({path:D2+'installed-continuation-07/installed-frame-01/events-01/runtime.events.jsonl',
  sha256:'25dd49061c9046436469f07cdafad592840ea9ebfdf824ec091042c02859dc96',bytes:12040406});
export const retainedSkip=skipOf(retainedStoreInput)||false;
export const load=(root,path)=>import(pathToFileURL(join(root,'build/code/src',path+'.js')).href);
export function retainedRows() {
  if(retainedStoreInput.kind!=='present')throw new Error(retainedSkip);
  const bytes=retainedStoreInput.bytes;
  const lines=bytes.toString('utf8').trimEnd().split('\n'),events=lines.map(JSON.parse);
  assert.equal(events.length,800);
  return {bytes,events,lines};
}

// Mechanical collector tests: use the unchanged compiled collector and exact
// selectedSemanticPredecessor bodies, real Product guards/constructors and the
// strict native prefix selector. Authentication, CCall/basis lookup, revision
// preparation and snapshot I/O are explicit assumptions. Synthetic lookup rows
// are never persisted, admitted, replayed or represented as native history.
// Every other free name of the extracted source comes from its owner's real
// module (path confinement among them), and the source is checked against the
// context before it runs, so a name the context lacks fails by name instead of
// as the collector's own null.
// Two private helpers of the semantic-job arm have no export to load. The
// harness builds a stage-lifecycle basis, so that arm is not reached.
const JOB_ARM_PRIVATE=['jobRevisionPreparationFromSubject','jobRevisionSubjectAtBasis'];
export async function collectorHarness() {
  const stage=await load(packageRoot,'abg/semantic_stage');
  const {authenticateOwnedSemanticJobBasis}=await load(packageRoot,'abg/semantic_job');
  const product=Object.assign({},...await Promise.all([
    'product/semantic_stage','product/semantic_revision','product/worksite_command_execution',
    'product/worksite_construction','product/worksite_preparation','product/worksite_revision','product/worksite_effect',
    'shared/digests','shared/immutable','shared/path_confinement','gtl/semantic_stage_identity','gtl/semantic_revision_identity',
  ].map(path=>load(packageRoot,path))));
  const prefixes=await load(packageRoot,'abg/event_prefix');
  const {canonicalEquals,presentMember}=await load(packageRoot,'shared/value/index'),{onlyExactMatch}=await load(packageRoot,'shared/select/index');
  const hash=product.sha256Canonical,deepFreeze=product.deepFreeze;
  const actual=retainedRows().events;
  const h=await workflowStepHarness(),original=h.cut.value,entry=h.entry,input=h.observation,prior=h.stage;
  const snapshotBytes=new Map(input.snapshotMembers.map(member=>[resolve(input.provenance.helperPlan.sandboxRoot,member.relativePath),
    Buffer.from(h.cut.value.current.worksite.targets.find(row=>row.target.subject.relativePath===member.relativePath).base64,'base64')]));
  const storedPaths=new Map([input.provenance.helperPlan.sandboxRoot,...snapshotBytes.keys()].map(path=>[path,path])),spellingReads=[];
  const spellingOwner=await load(packageRoot,'shared/stored_spelling');
  const R=product.SEMANTIC_REVISION_IDS;
  const bridgeRef=R.bridgeImplementationRef;
  const states=new Map(),executions=new Map(),prefixCalls=[],preparationCalls=[];
  const identity={invocationAdmissionRef:'lookup-only:invocation-admission',invocationRef:'lookup-only:invocation',invocationDigest:hash('invocation'),
    programRef:'lookup-only:program',programDigest:hash('program'),rootImplementationSetRef:'lookup-only:implementations',rootImplementationSetDigest:hash('implementations'),
    workspaceBindingId:entry.constructionTask.workspaceBinding.bindingId,workspaceBindingDigest:entry.constructionTask.workspaceBinding.bindingDigest};
  const owner={prefix:{assumption:'authenticated native lookup only'},events:deepFreeze(actual.slice(0,10)),execution:identity,
    inputDigest:hash(input),call:{implementationRef:R.evidenceInputImplementationRef}};
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
  const command=state('command',input,product.WORKSITE_REVISION_IDS.implementationRef);
  const compiled=readFileSync(join(packageRoot,'build/code/src/abg/semantic_stage.js'),'utf8');
  const sameInvocation=compiled.match(/^function sameInvocation\(a, b\) \{[\s\S]*?^\}/m)?.[0];assert.ok(sameInvocation);
  const exactOrNull=compiled.match(/^const exactOrNull = .*;$/m)?.[0];assert.ok(exactOrNull);
  function collector(diagnostic=false) {
    const file=join(packageRoot,'build/code/src/abg/semantic_revision.js');
    const name='projectRevisionEvidenceInput';
    const compiled=readFileSync(file,'utf8');
    // The collector and its component selector (`revisionEvidenceComponentsAtBasis`)
    // are the one compiled revision evidence owner.
    const bodyOf=(fn,exported)=>compiled.match(new RegExp(`^${exported?'export ':''}function ${fn}\\(basis, input\\) \\{[\\s\\S]*?^\\}`,'m'))?.[0].replace(/^export /,'');
    let body=[bodyOf('revisionEvidenceComponentsAtBasis',false),bodyOf(name,true)];
    assert.ok(body.every(Boolean),'one exact compiled collector body and its component selector');body=body.join('\n');
    if(diagnostic){let n=0;body=body.replace(/return null;/g,()=>`{console.error('collector refusal ${++n}');return null;}`).replace(/catch \{/g,"catch(error) { console.error(error.stack);");}
    const context={...product,authenticateOwnedSemanticJobBasis,console,hash,deepFreeze,canonicalEquals,presentMember,onlyExactMatch,ids:R,record:value=>value!==null&&typeof value==='object'&&!Array.isArray(value),
      resolve,relative,isAbsolute,
      // The actual spelling owner runs against the same explicit virtual
      // snapshot filesystem as stat/read below, never the host's old paths.
      realpathSync:{native:path=>{spellingReads.push(path);
        if(!storedPaths.has(path))throw Object.assign(new Error('missing virtual snapshot path'),{code:'ENOENT'});
        return storedPaths.get(path);}},
      lstatSync:path=>({isSymbolicLink:()=>false,isFile:()=>snapshotBytes.has(path),nlink:1}),
      readFileSync:path=>{assert.ok(snapshotBytes.has(path),'only mapped snapshot bytes');return snapshotBytes.get(path);},
      // The collector authenticates through the owned stage authenticator
      // (`authenticateOwnedSemanticStageBasis`, 67c333799) and compares the
      // basis input by the owner's input-equality reader.
      authenticateOwnedSemanticStageBasis:()=>owner,semanticInputValueAtBasis:()=>input,
      semanticInputAtBasisEquals:(_basis,value)=>hash(value)===hash(input),
      projectSemanticPredecessorAtPrefix:(_prefix,_events,_publication,ref)=>states.get(ref)??null,
      rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>executions.get(ref)??null,
      // The owner prefix is a lookup assumption, so the shared historical cut
      // keeps the owner rows before the exact bridge row; the strict selector
      // validates those retained rows.
      validatedRuntimeEventPrefixBeforeEvent:(prefix,eventId)=>{
        assert.equal(prefix,owner.prefix);const boundary=owner.events.find(e=>e.eventId===eventId);
        if(boundary===undefined)throw new TypeError('historical event-prefix boundary requires one exact admitted event');
        const rows=Object.freeze(owner.events.filter(e=>e.admissionOrdinal<boundary.admissionOrdinal));
        prefixCalls.push(rows);return prefixes.selectValidatedRuntimeEventPrefix(rows);},
      revisionPreparationAtBasis:(_basis,value,readPhysical,cut)=>{
        assert.equal(hash(value),hash(original));assert.equal(readPhysical,false);
        const rows=prefixes.runtimeEventsFromValidatedPrefix(cut);assert.equal(rows.length,10);
        assert.deepEqual(rows.map(e=>e.eventId),actual.slice(0,10).map(e=>e.eventId));
        preparationCalls.push(cut);return entry;
      },
      admitted:()=>({result:{value:prior}}),
    };
    const source=`${spellingOwner.storedSpelling.toString()}\n${spellingOwner.spelledAsStored.toString()}\n${sameInvocation}\n${exactOrNull}\n${stage.selectedSemanticPredecessor.toString()}\n${body}\n${name}`;
    assertContextBinds(source,context,'the extracted revision evidence collector',JOB_ARM_PRIVATE);
    return runInNewContext(source,context,{filename:file});
  }
  const current=collector();
  return {product,owner,basis,entry,input,original,bridge,alias,construction,command,states,executions,bridgeRef,state,
    prefixCalls,preparationCalls,storedPaths,spellingReads,project:()=>current(basis,input),diagnose:()=>collector(true)(basis,input),
    removeAlias:()=>{owner.events=Object.freeze(owner.events.filter(e=>e!==alias.event));}};
}
