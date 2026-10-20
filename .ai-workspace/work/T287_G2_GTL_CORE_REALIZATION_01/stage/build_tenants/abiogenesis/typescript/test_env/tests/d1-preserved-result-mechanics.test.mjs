import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {constructWorksiteObservation} from '../../build/code/src/product/worksite_effect.js';
import {ABI5_PRODUCT_SEMANTICS} from '../../build/code/src/product/builtin_semantics.js';
import {packageRoot,product,gtl,validator,recovery,selector,sourceObservation,readRetained,staticDeclarations,rebindRetained,nativeHarness} from '../support/d1-preserved-result-harness.mjs';
const ids=product.WORKSITE_PRESERVED_RESULT_IDS,old=product.WORKSITE_CONSTRUCTION_IDS;
const clone=structuredClone,hash=product.sha256Canonical;

test('closed recovery constructor validates as a whole Program and borrowed native closure (unadmitted readiness assumptions)',()=>{
  const d=staticDeclarations();
  assert.equal(d.validate().kind,'program_validation',JSON.stringify(d.validate()));
  assert.equal(d.closure().kind,'resolved_program_declaration_closure',JSON.stringify(d.closure()));
  assert.deepEqual(gtl.worksitePreservedResultSourceOfGraphFunction(d.graph),selector);
  for(const mutate of [
    g=>{delete g.declarations['abg.preserved_result_source'];},
    g=>{const source=JSON.parse(g.declarations['abg.preserved_result_source']);source.callerBytes='forbidden';g.declarations['abg.preserved_result_source']=JSON.stringify(source);},
    g=>{g.declarations['abg.compute_regime']='F_P';},
    g=>{g.declarations['abg.failure_contract']='contract://mechanical/crossed';},
    g=>{g.template.nodes[0].term.terms[0].requirement.implementationBindingRef=ids.deriveBindingRef;},
  ]){
    const bad=staticDeclarations(graph=>{const next=clone(graph);mutate(next);return next;});
    assert.equal(gtl.worksitePreservedResultSourceOfGraphFunction(bad.graph),null);
    assert.equal(bad.validate().kind,'static_validation_refusal');
    const closed=bad.closure();assert.equal(closed.kind,'execution_declaration_closure_refusal');
    assert.equal(closed.code,'wrong_owner');
  }
});

test('C0/C1/C3 algorithms, closed identities and old publication rows are conserved',async()=>{
  const d=staticDeclarations();
  const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-04/work';
  const previous=await import(pathToFileURL(resolve(base,'build/code/src/gtl/worksite_construction.js')).href);
  const before=previous.constructWorksiteConstructionModulePublication(d.artifact);
  for(const key of ['graphFunctions','programs','closureContracts','contributions','productSemanticsBinding'])assert.deepEqual(d.native[key],before[key],key);
  assert.deepEqual(d.native.contracts.filter(c=>c.contractRef!==ids.artifactContractRef),before.contracts);
  assert.deepEqual(d.native.implementationBindings.filter(b=>![ids.authenticateBindingRef,ids.deriveBindingRef].includes(b.bindingRef)),before.implementationBindings);
  for(const path of ['code/src/product/worksite_construction.ts','code/src/product/worksite_effect.ts','code/src/implementation/worksite_file_replace.ts',
    'code/src/product/worksite_branch_construction.ts','code/src/abg/semantic_revision.ts','code/src/abg/worksite_revision.ts',
    'code/src/product/semantic_stage.ts','code/src/abg/semantic_stage.ts','code/src/validator/self_conformance.ts']){
    assert.ok(readFileSync(resolve(packageRoot,path)).equals(readFileSync(resolve(packageRoot,'../preimages/source',path))),path);
  }
});

test('complete protocol records select one acknowledged proposal and reject ambiguity without normalizing bytes',()=>{
  const input={kind:'worksite_construction_worker_result',schemaVersion:'5.0.0',files:[]};
  const proposal={type:'assistant',session_id:'session-one',message:{content:[{type:'tool_use',id:'tool-one',name:'StructuredOutput',input}]}};
  const ack={type:'user',session_id:'session-one',message:{content:[{type:'tool_result',tool_use_id:'tool-one',content:'Structured output provided successfully'}]}};
  const line=value=>JSON.stringify(value)+'\n',valid=line(proposal)+line(ack),project=value=>recovery.projectPreservedStructuredProposal(Buffer.from(value));
  assert.deepEqual(project(valid+'{"type":"result","incomplete":').workerCandidate,input);
  const failures=[
    ['missing ack',line(proposal)],['duplicate proposal',line(proposal)+valid],['duplicate ack',valid+line(ack)],
    ['reversed ack',line(ack)+line(proposal)],['foreign session',line(proposal)+line({...ack,session_id:'other'})],
    ['foreign tool id',line(proposal)+line({...ack,message:{content:[{...ack.message.content[0],tool_use_id:'other'}]}})],
    ['ordinary tool',line({...proposal,message:{content:[{...proposal.message.content[0],name:'Read'}]}})+line(ack)],
    ['ordinary streamed tool',line({type:'stream_event',event:{content_block:{type:'tool_use',name:'Read'}}})+valid],
    ['failed ack',line(proposal)+line({...ack,message:{content:[{...ack.message.content[0],is_error:true}]}})],
    ['contradictory result',valid+line({type:'result',subtype:'success'})],['protocol error',valid+line({type:'error'})],
    ['nested protocol error',valid+line({type:'stream_event',event:{type:'error'}})],
    ['duplicate JSON key',valid.replace('"type":"assistant"','"type":"user","type":"assistant"')],
    ['complete malformed JSON',valid+'{"type":"result",}\n'],
  ];
  for(const [name,bytes]of failures)assert.throws(()=>project(bytes),name);
  assert.throws(()=>recovery.projectPreservedStructuredProposal(Buffer.from([0xff,10])),'invalid UTF8');
});

test('actual proposal rebinds through real Product identities, preserves all bytes and refuses changed/missing/ambiguous physical targets',()=>{
  const {projected}=readRetained(),rebased=rebindRetained(),task=rebased.task;
  assert.notEqual(task.workspaceBinding.bindingId,projected.originalTask.workspaceBinding.bindingId);
  assert.ok(task.targets.every((target,i)=>target.targetRef!==projected.originalTask.targets[i].targetRef));
  const body={source:selector,proof:projected.proof,originalTask:projected.originalTask,currentTask:task,workerResult:projected.workerResult,
    owner:{graphFunctionRef:rebased.declared.graph.name,executionBasisRef:'basis://mechanical/current',executionBasisDigest:hash('mechanical basis'),cCallRef:'c-call://mechanical/current'}};
  const artifact=product.constructWorksitePreservedResultArtifact(body),bundle=product.derivePreservedWorksiteCandidateBundle(artifact);
  assert.deepEqual(ABI5_PRODUCT_SEMANTICS.admitInput(ids.artifactContractRef,artifact),artifact);
  assert.equal(ABI5_PRODUCT_SEMANTICS.validateContractValue('worksite_preserved_result_artifact',artifact),true);
  assert.equal(ABI5_PRODUCT_SEMANTICS.resolveJudgmentRelation(ids.authenticatePredicateRef).evaluate(task,artifact),true);
  assert.equal(ABI5_PRODUCT_SEMANTICS.resolveJudgmentRelation(ids.derivePredicateRef).evaluate(artifact,bundle),true);
  assert.equal(bundle.files.length,22);assert.equal(bundle.files.reduce((n,row)=>n+Buffer.from(row.replacementBase64,'base64').length,0),111575);
  const original=product.constructWorksiteCandidateBundle(projected.originalTask,projected.workerResult);
  bundle.files.forEach((file,i)=>{assert.equal(file.targetRef,task.targets[i].targetRef);assert.equal(file.replacementBase64,original.files[i].replacementBase64);});
  const reordered=product.constructWorksiteConstructionTask({...task,targets:[...task.targets].reverse().map(({subject,territory,predecessorObservation})=>({subject,territory,predecessorObservation}))});
  const reorderedBundle=product.derivePreservedWorksiteCandidateBundle(product.constructWorksitePreservedResultArtifact({...body,currentTask:reordered}));
  assert.deepEqual(reorderedBundle.files.map(f=>f.replacementBase64),[...bundle.files].reverse().map(f=>f.replacementBase64),'bijection is not incidental vector position');
  const first=task.targets[0],changed=constructWorksiteObservation({subject:first.subject,state:'file',fileIdentity:first.predecessorObservation.fileIdentity+'-new',
    fileDigest:first.predecessorObservation.fileDigest,byteLength:first.predecessorObservation.byteLength});
  const changedTask=product.constructWorksiteConstructionTask({...task,targets:task.targets.map((row,i)=>({subject:row.subject,territory:row.territory,predecessorObservation:i===0?changed:row.predecessorObservation}))});
  assert.throws(()=>product.constructWorksitePreservedResultArtifact({...body,currentTask:changedTask}),'same-byte/new-inode preimage');
  const missingTask=product.constructWorksiteConstructionTask({...task,targets:task.targets.slice(1)});
  assert.throws(()=>product.constructWorksitePreservedResultArtifact({...body,currentTask:missingTask}));
  assert.throws(()=>product.constructWorksiteConstructionTask({...task,targets:[...task.targets,task.targets[0]]}));
  const forged=clone(artifact);forged.workerResult.files[0].replacementText+='!';
  assert.equal(product.isWorksitePreservedResultArtifact(forged),false);
  const raw=clone(projected.workerResult);raw.files[0].replacementBase64='AA==';
  assert.throws(()=>product.constructWorksiteConstructionWorkerResult(projected.originalTask,raw),'text/base64 XOR');
  assert.throws(()=>product.constructWorksiteConstructionWorkerResult(projected.originalTask,{...raw,files:[...raw.files].reverse()}),'original order remains exact');
});

test('current-call, admitted predecessor, independent regeneration and replay owner joins (explicit lookup assumptions; zero admission/effects)',async()=>{
  const h=await nativeHarness(),n=h.native,b=h.authBasis;
  assert.ok(n.authenticateWorksitePreservedResultBasis(b),'genuine typed bridge/task and current-owner lookup assumptions compose');
  const artifact=n.projectWorksitePreservedResultArtifact(b,h.task);assert.ok(artifact);
  assert.equal(n.worksitePreservedResultMatchesBasis(b,h.task,artifact),true);
  const bridgeExecution=h.lookups.executions.get(h.bridge.call.basisId),invocation=bridgeExecution.invocationDigest;
  bridgeExecution.invocationDigest=hash('foreign admitted-bridge lookup');
  assert.equal(n.authenticateWorksitePreservedResultBasis(b),null,'a valid-looking bridge from another invocation is not current authority');
  bridgeExecution.invocationDigest=invocation;
  const bridgeValue=h.bridge.result.value;
  h.bridge.result.value={...bridgeValue,constructionTask:product.constructWorksiteConstructionTask({...h.task,prompt:h.task.prompt+'\nCaller-spliced instructions.'})};
  assert.equal(n.projectWorksitePreservedResultArtifact(b,h.task),null,'spliced bridge/task is not the immutable current projection');
  h.bridge.result.value=bridgeValue;
  for(const mutate of [
    x=>{x.predecessorPrefix.storeIdentity.inode+=1;},
    x=>{x.executionBasis.invocationAdmissionRef='foreign';},
    x=>{x.cursor.inputDigest=hash('caller changed input');},
    x=>{x.cCall.implementationBindingRef=ids.deriveBindingRef;},
    x=>{x.graphFunction.declarations['abg.preserved_result_source']='{}';},
  ]){const bad=clone(b);mutate(bad);assert.equal(n.authenticateWorksitePreservedResultBasis(bad),null);}
  const forgedBody={source:artifact.source,proof:artifact.proof,originalTask:artifact.originalTask,currentTask:artifact.currentTask,
    workerResult:clone(artifact.workerResult),owner:artifact.owner};
  forgedBody.workerResult.files[0].replacementText+='!';
  const forged=product.constructWorksitePreservedResultArtifact(forgedBody);
  assert.equal(product.isWorksitePreservedResultArtifact(forged),true,'self-consistent unadmitted bytes are only a Product value');
  assert.equal(n.worksitePreservedResultMatchesBasis(b,h.task,forged),false,'native regeneration refuses forged but well-formed artifact');
  h.mutatePhysical((path,bytes)=>path.endsWith(h.task.targets[0].subject.relativePath)?Buffer.concat([bytes,Buffer.from('!')]):bytes);
  assert.equal(n.projectWorksitePreservedResultArtifact(b,h.task),null,'unexplained current drift refuses before candidate/C0');
  h.resetPhysical();
  const derive=h.deriveBasis(artifact),bundle=n.projectWorksitePreservedCandidateBundle(derive,artifact);
  assert.ok(bundle);assert.equal(n.worksitePreservedResultMatchesBasis(derive,artifact,bundle),true);
  const crossed=clone(bundle);crossed.files[0].replacementBase64='AA==';
  assert.equal(n.worksitePreservedResultMatchesBasis(derive,artifact,crossed),false);
  const authState=h.lookups.outcomes.get(b.cCall.cCallRef),oldJudgment=authState.judgment.judgment;
  authState.judgment.judgment='blocked';assert.equal(n.projectWorksitePreservedCandidateBundle(derive,artifact),null);authState.judgment.judgment=oldJudgment;
  assert.equal(n.nativeWorksiteRecoverySourceAtPrefix(h.currentPrefix,h.owner),false,'both admitted F_D producers are required');
  const result={resultRef:'result://mechanical/derive',resultDigest:hash('derive result envelope'),resultClass:'success',value:bundle,admissionEventRef:'lookup-result:derive'};
  const judgment={judgmentRef:'judgment://mechanical/derive',judgmentDigest:hash('derive judgment'),judgment:'advance',admissionEventRef:'lookup-judgment:derive'};
  h.synthetic.push({kind:'c_call_result_admitted',aggregateId:derive.cCall.cCallRef,basisId:h.owner.basisRef,eventId:result.admissionEventRef,admissionOrdinal:2100,payload:result},
    {kind:'c_call_judged',aggregateId:derive.cCall.cCallRef,basisId:h.owner.basisRef,eventId:judgment.admissionEventRef,admissionOrdinal:2101,payload:judgment});
  h.lookups.outcomes.set(derive.cCall.cCallRef,{cCall:derive.cCall,result,judgment});
  const reads={...h.count};h.mutatePhysical(()=>{throw Error('replay must not read original worksite');});
  assert.equal(n.nativeWorksiteRecoverySourceAtPrefix(h.currentPrefix,h.owner),true);
  assert.deepEqual(h.count,reads,'replay source uses no store/archive/physical reads beyond its admitted-prefix argument');
  assert.equal(n.nativeWorksiteRecoverySourceAtPrefix(h.currentPrefix,{...h.owner,graphFunctionRef:'graph-function://caller/same-value@5'}),false);
  h.resetPhysical();
  console.log(JSON.stringify({claim:'compiled current-owner/admission-regeneration/C2-source mechanics with native lookup assumptions, not native admission',members:bundle.files.length,
    replacementBytes:bundle.files.reduce((sum,row)=>sum+Buffer.from(row.replacementBase64,'base64').length,0),reads:h.count}));
});

test('historical proof rejects missing chunks, crossed dispatch/prompt/attempt and late bytes (unadmitted read mutations)',async()=>{
  const h=await nativeHarness(),n=h.native,rows=h.original.events;
  const chunk=rows.find(e=>e.kind==='actor_process_stdout_observed'&&e.payload.actorInvocationRef===selector.actorInvocationRef);
  h.mutateHistory(events=>events.filter(e=>e.eventId!==chunk.eventId));
  assert.equal(n.projectPreservedWorksiteProposal(selector),null,'missing chunk');
  h.mutateHistory(events=>events.map(e=>e.eventId===chunk.eventId?{...e,admissionOrdinal:1885}:e));
  assert.equal(n.projectPreservedWorksiteProposal(selector),null,'late bytes after process exit');
  h.mutateHistory(events=>events.map(e=>e.eventId===chunk.eventId?{...e,payload:{...e.payload,streamOrdinal:99}}:e));
  assert.equal(n.projectPreservedWorksiteProposal(selector),null,'noncontiguous stream');
  const binding=rows.find(e=>e.kind==='actor_transport_binding_admitted'&&e.aggregateId===sourceObservation.nativeSource.transportBindingRef);
  for(const key of ['promptDigest','responseJsonSchemaDigest','dispatchOrdinal']){
    h.mutateHistory(events=>events.map(e=>e.eventId===binding.eventId?{...e,payload:{...e.payload,[key]:key==='dispatchOrdinal'?999:hash('wrong dispatch')}}:e));
    assert.equal(n.projectPreservedWorksiteProposal(selector),null,key);
  }
  h.resetHistory();
  assert.equal(n.projectPreservedWorksiteProposal({...selector,actorInvocationRef:'actor-invocation://foreign/attempt'}),null);
  assert.equal(n.projectPreservedWorksiteProposal({...selector,sourceCCallRef:'c-call://foreign/source'}),null);
});
