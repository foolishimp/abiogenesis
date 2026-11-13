// Operator preparation draft only. No top-level Product import or execution.
// Root must supply actual verified candidate/resources and separately admit each call.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export async function checkBindingFile(path) {
 const b=JSON.parse(await readFile(path,'utf8'));
 const required=['archive','installedRoot','manifest','productContentDigest','definitionContractCoordinates','installationProof','candidateC2Receipt','candidateSourceCorrespondence','consumerProgram','consumerCatalog','consumerCatalogView','workspaceBinding','providerProfile','providerWrapper','neutralRuntimeTmp','providerLeafTmp','genuineCallerHandoff','commissionedAStop','aStopOwnerEvidence','admission'];
 const missing=required.filter(k=>b.executionBindings[k]===null);
 for(const r of b.referenceAssets){const bytes=await readFile(r.path);assert.equal(bytes.length,r.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256);}
 assert.equal(b.scriptedModels,false);
 return {status:missing.length?'DRAFT_BLOCKED_MISSING_BINDINGS':'BINDINGS_PRESENT_NOT_EXECUTION_AUTHORITY',missing,sourceCommit:b.sourceCommit};
}
export function realProviderEnvironment(base,{wrapper,neutralTmp}) {
 assert(wrapper&&neutralTmp,'Root-selected exact wrapper and neutral Runtime TMP required');
 assert(!Object.keys(base).some(k=>k.startsWith('ABI5_SCRIPTED_ACTOR')),'scripted model controls forbidden');
 assert(!/scripted[-_]actor/i.test(wrapper),'scripted actor forbidden');
 const env={...base,ABG_TS_CLAUDE_COMMAND:wrapper,TMPDIR:neutralTmp};delete env.NPM_CONFIG_CACHE;
 return env; // pinned wrapper must only set provider TMP/cache then exec real Claude unchanged.
}
export const retainedTestingAssetHandle="retained-native-candidate-testing";
// One immutable consumer Program/catalog declares both ordinary root entries before A.
// Existing helper/constructors supply the same default-library step and contracts.
export function dualEntryConsumerDeclaration({gtl,library,runEnvironment,libraryConsumerDeclaration,witnessRef}) {
 const A=libraryConsumerDeclaration(gtl,library,runEnvironment,{bound:2});
 const B=libraryConsumerDeclaration(gtl,library,runEnvironment,{bound:8});
 assert.deepEqual(A.graphFunctions[1],B.graphFunctions[1],'Both roots must share the identical ordinary step');
 const rename=(root,name)=>({...root,name,template:{...root.template,graphRef:name+'/graph'}});
 const a=rename(A.graphFunctions[0],witnessRef('graph-function','executive-a'));
 const b=rename(B.graphFunctions[0],witnessRef('graph-function','executive-b'));
 const step=B.graphFunctions[1],oldRoot=B.graphFunctions[0].name,program=B.programs[0];
 const starts=[{startRef:witnessRef('start','a'),graphFunctionRef:a.name},{startRef:witnessRef('start','b'),graphFunctionRef:b.name}];
 const publicAssetTargets=[{kind:'program_public_asset_target',handle:retainedTestingAssetHandle,assetRef:witnessRef('asset','retained-native-candidate-testing'),startRef:starts[1].startRef}];
 const nextProgram={...program,starts,publicAssetTargets,callableMembership:[a.name,b.name,...program.callableMembership.filter(r=>r!==oldRoot)],policies:{...program.policies,'abg.default_start_ref':starts[0].startRef}};
 const rootContribution=B.contributions.find(c=>c.handle===oldRoot);assert(rootContribution);
 const contribution=root=>({...rootContribution,handle:root.name,declarationOrContractRef:root.name});
 return {...B,programs:[nextProgram],graphFunctions:[a,b,step],contributions:[contribution(a),contribution(b),...B.contributions.filter(c=>c.handle!==oldRoot)]};
}
// A uses the default direct next start; B uses the declared public asset target.
// Bound2 permits one selected child, not guaranteed Construction. Root must observe
// successful native Construction and the owner-derived eligible latest judged state.
// B resolves its different predeclared root through the SAME Program/catalog first;
// only then attach A's fresh owner-derived source basis. No A root slots are copied.
export async function constructRetainedBStart({product,publicApi,installed,env,startA,sourceBasis,eventResource,identity,eventTime,assetHandle,constructInstalledStartCall,runEnvironmentResourceFactory}) {
 assert(sourceBasis&&sourceBasis.sourceResultValue,'No fabricated retained state');
 const input=installed.retainedGovernanceWorkInput(sourceBasis.sourceResultValue);assert(input,'Eligible nonterminal retained state required');
 assert.deepEqual(input,sourceBasis.sourceResultValue,'Exact retained state conserved without transformation');
 assert.deepEqual(input.original,sourceBasis.sourceResultValue.original,'Original workload conserved');
 assert(input.observations.some(o=>o.purpose==='construction'),'Actual Construction observation is a prerequisite');
 const base=await constructInstalledStartCall({environment:env,publicApi,eventResource,input,identity,runEnvironmentResourceFactory,programRef:startA.call.invocation.request.program.ref,rootMode:'direct',assetHandle});
 const A=startA.call.invocation,B=base.call.invocation;
 assert.deepEqual(B.request.program,A.request.program,'Same predeclared Program ref and digest');
 assert.deepEqual(B.request.catalogView,A.request.catalogView,'Catalog/view must not change between A and B');
 assert.deepEqual(B.invocationAuthority.slots.workspace_binding,A.invocationAuthority.slots.workspace_binding,'Same workspace binding');
 assert.equal(B.request.target.kind,'asset');assert.equal(B.request.target.handle,assetHandle);
 assert.deepEqual(B.request.input.value,input,'Exact retained input, no rewriting');
 const call=publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates:env.verified.definitionContractCoordinates,
  contractCatalog:env.verified.definitionContractCoordinates.operations.find(o=>o.operationId===B.definitionKey.operationId).members.find(m=>m.memberKey==='start').slots.request.contractCatalog,
  operationId:B.definitionKey.operationId,memberKey:'start',
  request:{...B.request,sourceBasis:{kind:'admitted_source_result',projectionAuthority:{ref:A.invocationRef,digest:sourceBasis.publicAuthorityDigest},sourceResult:{ref:sourceBasis.sourceResultRef,digest:sourceBasis.sourceResultDigest}}},
  slots:B.invocationAuthority.slots,
  resources:{...base.call.resources,source:{kind:'admitted_source_result',basis:sourceBasis}},
  requestRef:`public-request://retained-source/${identity}`,correlationRef:`correlation://retained-source/${identity}`,eventTime,provenanceRefs:['provenance://default-library-witness/retained-source@5']});
 return {...base,call};
}
// Existing continuation owner derives every coordinate from B's actual interrupted prefix.
export function pendingBRequest({continuationOwner,openCallOwner,prefix,runB,interruption}) {
 const [p,...extra]=continuationOwner.projectPendingExecutionContinuations(prefix,runB);
 assert(p&&extra.length===0&&p.phase==='undispatched','One undispatched B frontier required');
 assert.equal(interruption.openedAtInterruption,0);assert.equal(interruption.entered.length,1);assert.equal(p.pendingCursorRef,interruption.entered[0].cursorRef);
 const scope=openCallOwner.projectOpenedTraversalScopeForFrameAtPrefix(prefix,p.chain[0].frameId);assert(scope);
 assert(p.progressedInputRef&&p.progressedInputDigest,'Entered Testing must carry actual progressed input');
 const coordinate=(ref,digest)=>({ref,digest});
 const request={run:coordinate(runB,scope.runDigest),continuation:coordinate(p.continuationRef,p.continuationDigest),pendingCursor:coordinate(p.pendingCursorRef,p.pendingCursorDigest),continuationInput:coordinate(p.progressedInputRef,p.progressedInputDigest),expectedBasis:coordinate(p.chain[0].basisRef,p.chain[0].basisDigest)};
 const use=continuationOwner.selectPendingExecutionUse(prefix,request);assert.equal(use.kind,'pending_execution_use');return {request,use,p};
}
// No start/stop/recover/continue command mode exists in this draft.
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 assert.equal(process.argv[2],'--check-bindings');assert.equal(process.argv.length,4);
 const result=await checkBindingFile(process.argv[3]);console.log(JSON.stringify(result,null,2));process.exitCode=result.missing.length?2:0;
}
