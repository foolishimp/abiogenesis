// Existing004 ordinary fixture composition and retained-source adapter, unchanged.
import assert from 'node:assert/strict';
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
 const locus='node://default-library-witness/executive-b-parent@5';
 const node=b.template.nodes[0],old=node.term;node.nodeRef=locus;
 node.term=gtl.C.of({...old,input:gtl.cCarrier(old.inputCarrierRef),output:gtl.cCarrier(old.outputCarrierRef),programLocusRef:locus,armId:locus+'/arm'});
 b.template.startNodeRef=locus;b.template.terminalNodeRefs=[locus];
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
export async function constructRetainedBStart({product,publicApi,env,startA,sourceBasis,eventResource,envelope,identity,assetHandle,runEnvironmentResources}) {
 const input=product.retainedGovernanceWorkInput(sourceBasis.sourceResultValue);assert(input);assert.deepEqual(input,sourceBasis.sourceResultValue);
 assert(input.observations.some(o=>o.purpose==='construction'));
 const result=await publicApi.constructInstalledStartCall({
  selection:{memberKey:'start',target:{kind:'asset',handle:assetHandle},rootMode:'direct',fhMode:'direct'},
  programRef:startA.call.invocation.request.program.ref,catalog:env.catalog,catalogView:env.catalogView,applications:[],
  admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,
  verifyInstallAdmission:install=>env.abg.hasAdmittedProductInstall(env.artifactTruth,install),
  actorRef:env.workspaceBinding.authorizedActorRef,input:{value:input},inputValueRef:`value://default-library-witness/${identity}/input`,
  source:{kind:'admitted_source_result',basis:sourceBasis,projectionAuthority:{ref:startA.call.invocation.invocationRef,digest:sourceBasis.publicAuthorityDigest}},
  eventResource,envelope,runEnvironmentResources});
 if(result.kind!=='installed_start_call')return result; // Preserve actual owner refusal unchanged.
 const A=startA.call.invocation,B=result.call.invocation;
 assert.deepEqual(B.request.program,A.request.program);assert.deepEqual(B.request.catalogView,A.request.catalogView);
 assert.deepEqual(B.invocationAuthority.slots.workspace_binding,A.invocationAuthority.slots.workspace_binding);
 assert.deepEqual(B.request.target,{kind:'asset',handle:assetHandle});assert.deepEqual(B.request.input.value,input);
 return result;
}
