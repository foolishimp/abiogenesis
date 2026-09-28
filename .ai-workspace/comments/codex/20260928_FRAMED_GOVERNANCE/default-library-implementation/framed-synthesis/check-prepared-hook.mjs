import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-implementation/framed-synthesis'),dir=resolve(root,'attempt-01');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const setup=await read(resolve(dir,'setup.json')),run=await read(resolve(dir,'execution.json')),request=await read(run.requestPath),handoff=await read(resolve(dir,'handoff.json'));
const load=p=>import(pathToFileURL(resolve(setup.installedRoots[0],'build/code/src',p+'.js')).href);
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
const current=await import(pathToFileURL(resolve('build_tenants/abiogenesis/typescript/build/code/src/implementation/default_library.js')).href);
const port=await load('implementation/leaf_invocation_port');
const occurrence={nativeInstructionAssemblyBasis:basis,cCallRef:call.cCallRef,runId:call.runId,graphCallId:call.graphCallId,frameId:call.frameId,programLocusRef:call.programLocusRef,taskOrdinal:call.taskOrdinal,attempt:call.attempt,executionAuthority:null};
// The frozen installed owner supplies its actual authenticated basis/assembly
// and unchanged guard. Only the repaired exported implementation is substituted.
const returned=await port.invokeLeafOwnerBoundary({resolution:current.GOVERNANCE_SELECTOR_DESCRIPTOR,value:input,inputDigest:owner.inputDigest,failureValueKind:'governance_failure',verifyAuthority:()=>bases.authenticateNativeInstructionAssemblyBasis(basis)!==null,validateSuccess:product.isFramedSynthesisResult,
 resolveWorkerContracts:()=>({instructionContractRef:call.inputContractRef,resultContractRef:graphFunction.declarations['abg.raw_result_contract']}),occurrence,contractByRef,loadImplementation:async()=>current.selectGovernanceWork});
assert.equal(returned.kind,'prepared_probabilistic_leaf_owner_invocation');assert.deepEqual(returned.workerRequest,built.request);assert.equal(immutable.isDeeplyFrozen(returned),true);
const report={kind:returned.kind,callRef:call.cCallRef,openedEvent:opened.eventId,requestDigest:product.sha256Canonical(returned.workerRequest),requestMatchesExactOwnedAssembly:true,deeplyFrozen:immutable.isDeeplyFrozen(returned),actorInvoked:false,changedImplementation:'build/code/src/implementation/default_library.js',installedPort:resolve(setup.installedRoots[0],'build/code/src/implementation/leaf_invocation_port.js')};
await writeFile(resolve(root,'prepared-hook-installed-owner-check.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(report);
