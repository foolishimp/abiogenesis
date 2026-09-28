import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-implementation/framed-synthesis'),dir=resolve(root,'attempt-02'),out=resolve(root,'correction-01');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const setup=await read(resolve(dir,'setup.json')),run=await read(resolve(dir,'execution.json')),request=await read(run.requestPath),handoff=await read(resolve(dir,'handoff.json'));
const load=p=>import(pathToFileURL(resolve('build_tenants/abiogenesis/typescript/build/code/src',p+'.js')).href);
const [store,truth,bases,calls,cursors,gtl,assembly,implementation,immutable,product]=await Promise.all(['abg/event_store','abg/artifact_truth','abg/execution_basis','abg/c_call','abg/traversal_cursor','gtl/index','abg/instruction_assembly','implementation/default_library','shared/immutable','product/index'].map(load));
const events=store.readRuntimeEventsAtDurablePrefix(handoff.prefix),publication=await read(resolve(dir,'publication.json'));
const publications=request.invocation.resources.catalog.boundPublications,definitions=publications.flatMap(p=>p.graphFunctions);
const opened=events.find(e=>e.kind==='c_call_opened'&&e.payload.programLocusRef===product.governanceRef('node','select'));
const fibre=events.find(e=>e.kind==='c_call_fibre_selected'&&e.aggregateId===opened.aggregateId),durable=store.durableRuntimeEventPrefixThroughEvent(handoff.prefix,fibre.eventId),artifact=truth.projectOwnedPrefixArtifactTruth(durable),prefix=truth.runtimePrefixFromArtifactTruth(artifact);
const execution=bases.rehydrateExecutionBasisAtPrefix(prefix,opened.basisId),graphFunction=definitions.find(g=>g.name===opened.graphFunctionRef);
const graph=gtl.materializeGraph(graphFunction,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
const origin=events.find(e=>e.kind==='traversal_cursor_entered'&&e.graphCallId===opened.graphCallId),p=origin.payload;
const route=events.find(e=>e.kind==='traversal_route_admitted'&&e.payload.targetCursorRef===opened.payload.cursorRef),previousResult=events.find(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===route.payload.cCallRef);
const cursor=cursors.constructTraversalCursorCandidate({programRef:p.programRef,executionBasisRef:p.executionBasisRef,traversalScopeRef:p.traversalScopeRef,runId:opened.runId,graphCallId:opened.graphCallId,frameId:opened.frameId,graphRef:p.materializationRef,inputRef:previousResult.payload.resultRef,inputDigest:previousResult.payload.valueDigest,currentNodeRef:opened.payload.programLocusRef,position:'at_term',termPath:gtl.rootCSourcePath(opened.payload.programLocusRef),taskOrdinal:opened.payload.taskOrdinal,attempt:opened.payload.attempt,retryPath:opened.payload.retryPath});assert.equal(cursor.cursorRef,opened.payload.cursorRef);
const call=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,opened.aggregateId);
const basis=bases.constructNativeInstructionAssemblyBasis({publication,graph,graphFunction,declarationGraphFunctions:definitions,executionBasis:execution,cCall:call,cursor,predecessorPrefix:durable});assert.ok(basis);
const owner=bases.authenticateNativeInstructionAssemblyBasis(basis),input=owner.inputValue;
const contractByRef=ref=>{const rows=publications.flatMap(p=>p.contracts).filter(c=>c.contractRef===ref);return rows.length===1?rows[0]:null;};
const built=assembly.requireDeclaredNativeInstructionAssembly(basis,input,contractByRef);assert.equal(built.kind,'native_instruction_assembly');
// Component counterfactual only: real retained invocation/basis and newly built
// assembly, projected by the actual cold replay owner. No historical event changes.
const historical=events.find(e=>e.kind==='actor_transport_binding_admitted'&&e.payload.instructionAssembly?.envelope.cCallRef===call.cCallRef);
assert.ok(historical);
const persisted=JSON.parse(JSON.stringify(built));
assert.equal(persisted.manifest.runEnvironment.invocationAdmissionRef,execution.invocationAdmissionRef);
const scope={},file=resolve('build_tenants/abiogenesis/typescript/build/code/src/abg/replay.js');
let selected=historical;
const m=new SourceTextModule((await readFile(file,'utf8'))+'\nexport { projectOwnerFacts };',{identifier:file});
await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
  const values=specifier==='./event_prefix.js'?{...actual,runtimeEventsFromValidatedPrefix:p=>p===scope?[selected]:actual.runtimeEventsFromValidatedPrefix(p)}:actual;
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
const empty={cCalls:[],routes:[],fanOutCompletions:[],constructionDeltas:[]},correspondence=new Map([[historical.eventId,'atom:retained-binding']]);
const project=()=>m.namespace.projectOwnerFacts(scope,prefix,empty,[],correspondence);
assert.throws(project,/STDO assembly lacks its exact environment evidence/);
selected={...historical,payload:{...historical.payload,instructionAssembly:persisted}};
const facts=project();assert.equal(facts.length,1);assert.equal(facts[0].owner,'run_environment_instruction_assembly');assert.deepEqual(facts[0].instructionAssembly,persisted);
for(const wrong of [{invocationAdmissionRef:'invocation:foreign'},{environmentDigest:product.sha256Canonical('wrong')},{evidenceDigest:product.sha256Canonical('wrong')}]){
  selected={...historical,payload:{...historical.payload,instructionAssembly:{...persisted,manifest:{...persisted.manifest,runEnvironment:{...persisted.manifest.runEnvironment,...wrong}}}}};
  assert.throws(project,/STDO assembly lacks its exact environment evidence/);
}
const raw=await read(resolve(root,'failed-native-response.json'));
assert.equal(product.isFramedSynthesisJudgment(raw),false,'historical malformed response remains refused');
const report={componentOnly:true,authoritativeHistoryChanged:false,providerInvoked:false,
  sourceBindingEvent:historical.eventId,sourceBindingOrdinal:historical.admissionOrdinal,invocationAdmissionRef:execution.invocationAdmissionRef,
  historicalMissingIdentityRefuses:true,serializedCurrentAssemblyProjects:true,crossedInvocationEnvironmentAndEvidenceRefuse:true,rawHistoricalResponseStillRefuses:true,
  currentAssemblyDigest:product.sha256Canonical(persisted),runEnvironment:persisted.manifest.runEnvironment,
  ownerSource:file,scope:'Only retained binding selected for actual private owner fact projection; actual invocation rehydration and authenticated assembly owners, no mocked environment admission.'};
await writeFile(resolve(out,'rendered-assembly.json'),JSON.stringify(persisted,null,2)+'\n',{flag:'wx'});
await writeFile(resolve(out,'assembly-cold-replay.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report,null,2));
