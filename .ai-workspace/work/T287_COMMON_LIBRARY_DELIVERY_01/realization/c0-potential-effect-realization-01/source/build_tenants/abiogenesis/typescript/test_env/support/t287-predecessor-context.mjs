import fs from 'node:fs';
import assert from 'node:assert/strict';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
export const root=process.env.ABI5_PREDECESSOR_PACKAGE_ROOT??resolve(import.meta.dirname,'../..');
export const prior=process.env.ABI5_PREDECESSOR_PRIOR_ROOT;
assert.ok(prior,'requires exact preserved original1B evidence');
export const load=p=>import(pathToFileURL(join(root,'build/code/src',p+'.js')).href);
export const semantic=await load('product/semantic_stage');
export const {sha256Canonical:hash,sha256Bytes}=await load('shared/digests');
export const {canonicalJson}=await load('shared/canonical_json');
export const eventsPath=join(prior,'live-01/run/events-01/runtime.events.jsonl');
export const originalBytes=fs.readFileSync(eventsPath);
assert.equal(sha256Bytes(originalBytes),'sha256:6fa12fb2f44325e2952f713b1017e9dff56a025684ae651bfe6c9e99fbc559db');
export const events=originalBytes.toString().trim().split('\n').map(JSON.parse);
export const input=events.findLast(e=>e.kind==='basis_admitted').payload.rawInputValue;
export const stage=input.lifecycle.stages[0];
export const failed=JSON.parse(fs.readFileSync(join(prior,'live-01/run/workspace/archives/fp-42c04b85e5509386-output.txt')));
export const source=label=>({cCallRef:'component-only:'+label,inputDigest:hash(input),actorInvocationRef:'component-only:'+label,promptDigest:hash('prompt'),transportDigest:hash('transport')});
export const raw=(ref,links=[])=>({kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',statements:[{statementRef:ref,text:'Mechanical relation discriminator, not semantic acceptance.',modality:'supporting',sourceQuotes:[],requirementRefs:[],obligationRefs:[],predecessorStatementRefs:links}],requirementCandidates:[],worksiteDesign:null,pressure:[]});
export async function retainedBasis(){
  const [store,prefixes,executions,calls,cursors,materialize,owner]=await Promise.all(['abg/event_store','abg/event_prefix','abg/execution_basis','abg/c_call','abg/traversal_cursor','gtl/materialize','abg/semantic_stage'].map(load));
  const opened=events.findLast(e=>e.kind==='c_call_opened');
  const actor=events.find(e=>e.kind==='actor_invocation_started');
  const count=actor.admissionOrdinal-1;
  const prefixBytes=Buffer.from(originalBytes.toString().split('\n').slice(0,count).join('\n')+'\n');
  const stat=fs.lstatSync(eventsPath);
  const body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:pathToFileURL(eventsPath).href,prefixLength:prefixBytes.length,prefixDigest:sha256Bytes(prefixBytes),storeIdentity:{device:stat.dev,inode:stat.ino,eventContractDigest:store.ROOT_EVENT_CONTRACT_DIGEST}};
  const durable={...body,coordinateDigest:hash(body)};
  const prefixEvents=store.readRuntimeEventsAtDurablePrefix(durable),prefix=prefixes.selectValidatedRuntimeEventPrefix(prefixEvents);
  const execution=executions.rehydrateExecutionBasisAtPrefix(prefix,opened.basisId);assert.ok(execution);
  const ready=JSON.parse(fs.readFileSync(join(prior,'live-01/output/attempt-01/program-ready-22.json')));
  const pubs=ready.call.resources.catalog.boundPublications;
  const publication=pubs.find(p=>p.programs.some(p=>p.programRef===execution.programRef));assert.ok(publication);
  const lifecyclePublication=pubs.find(p=>p.semanticLifecycle?.declarationRef===input.lifecycle.declarationRef);assert.ok(lifecyclePublication);
  const sourcePublication=pubs.find(p=>p.requirementHandoffs?.some(d=>d.declarationRef===input.lifecycle.sourceDeclarationRef));assert.ok(sourcePublication);
  const declarations=pubs.flatMap(p=>p.graphFunctions),gf=declarations.find(g=>g.name===execution.graphFunctionRef);assert.ok(gf);
  const graph=materialize.materializeGraph(gf,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
  const cCall=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,opened.aggregateId);assert.ok(cCall);
  const route=prefixEvents.find(e=>e.kind==='traversal_route_admitted'&&e.payload.targetCursorRef===opened.payload.cursorRef);
  const ce=prefixEvents.find(e=>e.kind==='traversal_cursor_entered'&&e.payload.cursorRef===(route?.payload.sourceCursorRef??opened.payload.cursorRef)),cp=ce.payload;
  let cursor=cursors.constructTraversalCursorCandidate({programRef:cp.programRef,executionBasisRef:cp.executionBasisRef,traversalScopeRef:cp.traversalScopeRef,runId:ce.runId,graphCallId:ce.graphCallId,frameId:ce.frameId,graphRef:cp.materializationRef,inputRef:cp.inputRef,inputDigest:cp.inputDigest,currentNodeRef:graph.template.startNodeRef,position:'at_term',termPath:cp.termPath,taskOrdinal:cp.taskOrdinal,attempt:cp.attempt,retryPath:cp.retryPath});
  assert.equal(cursor.cursorDigest,cp.cursorDigest);
  if(route){const traversal=await load('hog/traversal');cursor=traversal.deriveStructuralTargetCursor(graph,cursor,graph.template.nodes[0].term);}
  assert.equal(cursor.cursorDigest,opened.payload.cursorDigest);
  const basis={publication,lifecyclePublication,sourcePublication,graph,graphFunction:gf,declarationGraphFunctions:declarations,executionBasis:execution,cCall,cursor,predecessorPrefix:durable};
  const authenticated=owner.authenticateSemanticStageBasis(basis);assert.ok(authenticated,'actual unchanged authentication at retained prefix');
  assert.equal(owner.semanticInputMatchesBasis(basis,input),true);
  return {basis,authenticated,count};
}
// Explicit component seam for synthetic nonempty inputs only. No event store,
// admitted asset, execution basis or native semantic judgment is produced.
export async function componentAssembly(owner,basis,value){
  const p=join(root,'build/code/src/abg/instruction_assembly.js');
  const module=new SourceTextModule(fs.readFileSync(p,'utf8'),{identifier:p});
  await module.link(async s=>{const native=await import(pathToFileURL(resolve(dirname(p),s)).href);const values={...native,...(s==='./semantic_stage.js'?{authenticateSemanticStageBasis:()=>owner,semanticInputMatchesBasis:()=>true}:{})};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});
  await module.evaluate();return module.namespace.evaluateNativeInstructionAssembly(basis,value);
}
export function assertIdentities(assembly){
  assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  assert.equal(assembly.planDigest,hash(assembly.plan));assert.equal(assembly.envelopeDigest,hash(assembly.envelope));assert.equal(assembly.manifestDigest,hash(assembly.manifest));
  assert.equal(assembly.manifest.responseSchemaDigest,hash(assembly.request.responseJsonSchema));
  assert.equal(assembly.manifest.promptDigest,hash(assembly.request.prompt));assert.equal(assembly.manifest.promptBytesDigest,sha256Bytes(Buffer.from(assembly.request.prompt)));
  for(const row of assembly.manifest.sections)assert.equal(row.digest,hash(assembly.envelope.sections[row.name]));
  assert.equal(assembly.request.prompt,assembly.plan.sectionOrder.map(n=>`## ${n}\n${canonicalJson(assembly.envelope.sections[n])}`).join('\n\n'));
}
