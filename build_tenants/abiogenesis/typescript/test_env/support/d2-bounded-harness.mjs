import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {pathToFileURL} from "node:url";
import {SourceTextModule,SyntheticModule} from "node:vm";
import {createHash} from "node:crypto";

export const packageRoot=resolve(import.meta.dirname,"../..");
export const predecessorRoot="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260910_D2_FRAME_REPAIR/implementation-01";
export const load=path=>import(pathToFileURL(resolve(packageRoot,path)).href);
export const capturedEnvelopePath="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/live-04/bridge-first-cause-01/bridge-input.json";
export function capturedEnvelope(){
  const bytes=readFileSync(capturedEnvelopePath);
  assert.equal(createHash("sha256").update(bytes).digest("hex"),"6cde4824e5912305cb94de3afdc2eabfd74560e8d8f828cd6be7aa6f64991b16");
  return JSON.parse(bytes);
}

// These are lookup stubs, not RuntimeEvents or calls to ABG admission. They
// exercise the real private projection body with authentic Product guards and
// explicit boundary assumptions. No prefix is admitted, persisted, or replayed.
export async function projectionHarness({sourceRoot=packageRoot}={}){
  const product=await load("build/code/src/product/index.js");
  const revisionProduct=await load("build/code/src/product/semantic_revision.js");
  const {SEMANTIC_REVISION_IDS:ids}=await load("build/code/src/gtl/semantic_revision_identity.js");
  const stage=capturedEnvelope(),current=stage.worksite,states=new Map(),executions=new Map(),lookupOrder=[];
  const originCalls=[];
  const oldCommand={kind:"unit_old_closed_C2_guard_assumption",commandResults:[{exitStatus:1}]};
  const newCommand={kind:"unit_new_closed_C2_guard_assumption",commandResults:[{exitStatus:1}]};
  const owner={prefix:{fixture:"lookup-only-not-a-native-prefix"},events:lookupOrder,lifecycle:stage.lifecycle,source:stage.sourceHandoff.declaration,
    execution:{workspaceBindingId:"binding://unit/current",workspaceBindingDigest:product.sha256Canonical(current.workspaceBinding),invocationAdmissionRef:"invocation://unit/current"},call:{implementationRef:ids.projectionImplementationRef}};
  const basis={input:null,publication:{},predecessorPrefix:{fixture:"lookup-only"},graphFunction:{declarations:{"abg.semantic_revision_selection":stage.lifecycle.declarationRef}},declarationGraphFunctions:[]};
  function state(name,value,{invocation="invocation://unit/root",rawInput=stage,ordinal=10,resultClass="success",judgment="advance",implementationRef=ids.projectionImplementationRef}={}){
    const cCallRef=`c-call://unit/${name}`,basisId=`basis://unit/${name}`,resultRef=`result://unit/${name}`,resultDigest=product.sha256Canonical(value);
    const resultAdmissionEventRef=`lookup-result:${name}`,judgmentEventRef=`lookup-judgment:${name}`;
    const coordinate={cCallRef,resultRef,resultDigest,resultAdmissionEventRef,judgmentEventRef};
    const call={cCall:{cCallRef,basisId,graphFunctionRef:`graph-function://unit/${name}`,implementationRef,regime:"F_P",outputContractRef:ids.selectionContractRef},
      result:{resultRef,resultDigest,admissionEventRef:resultAdmissionEventRef,resultClass,value},judgment:{admissionEventRef:judgmentEventRef,judgment}};
    const execution={basisRef:basisId,admissionEventRef:`lookup-basis:${name}`,rawInputValue:rawInput,rawInputAdmissionRef:`input://unit/${name}`,
      rawInputDigest:product.sha256Canonical(rawInput),invocationAdmissionRef:invocation};
    states.set(cCallRef,call);executions.set(basisId,execution);
    lookupOrder.push({eventId:resultAdmissionEventRef,admissionOrdinal:ordinal},{eventId:judgmentEventRef,admissionOrdinal:ordinal+1});
    return {coordinate,call,execution};
  }
  const root=state("root",stage,{ordinal:10});
  const oldCause=state("old-command",oldCommand,{ordinal:20});
  function revision(parent,cause,name,ordinal,invocation){
    const selection={kind:"semantic_revision_selection",schemaVersion:"5.0.0",parent:parent.coordinate,causes:[cause.coordinate],mode:"construction_repair",selectedStageRef:null,
      selectedObligationRefs:[stage.sourceHandoff.declaration.fulfillmentBindings[0].obligationRef],selectedTargetRefs:stage.worksite.targets.slice(0,2).map(row=>row.target.targetRef),reasonRef:`reason://unit/${name}`};
    const decision=state(`${name}-selection`,selection,{ordinal:ordinal-2,invocation,rawInput:{kind:"semantic_revision_selection_input",schemaVersion:"5.0.0",parent:parent.coordinate,causes:[cause.coordinate]}});
    basis.declarationGraphFunctions.push({name:decision.call.cCall.graphFunctionRef,declarations:{"abg.semantic_revision_selection":stage.lifecycle.declarationRef}});
    const request={kind:"semantic_revision_request",schemaVersion:"5.0.0",parent:parent.coordinate,causes:[cause.coordinate],selection:decision.coordinate,currentWorksite:current};
    const value=revisionProduct.deriveSemanticRevision(parent.call.result.value,request,selection);
    assert.ok(value,"native pure envelope construction; not admission");
    return {...state(name,value,{ordinal,invocation,rawInput:request}),request,selection};
  }
  const first=revision(root,oldCause,"first-revision",40,"invocation://unit/first-repair");
  const partial=state("later-partial-C1-failure",{kind:"unit_failure_value"},{ordinal:50,invocation:first.execution.invocationAdmissionRef,resultClass:"failure",judgment:"block"});
  const second=revision(first,partial,"second-revision",70,"invocation://unit/second-repair");
  const modulePath=resolve(sourceRoot,"build/code/src/abg/semantic_revision.js");
  const overrides={
    "./semantic_stage.js":{authenticateSemanticStageBasis:()=>owner,semanticInputValueAtBasis:b=>b.input,
      projectSemanticPredecessorAtPrefix:(_prefix,_events,_publication,ref)=>states.get(ref)??null},
    "./execution_basis.js":{rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>executions.get(ref)??null},
    "./invocation_admission.js":{rehydrateInvocationAdmissionAtPrefix:(_prefix,ref)=>ref===owner.execution.invocationAdmissionRef?{capabilityGrants:[current.capabilityGrant]}:null},
    "./environment_admission.js":{projectExactPrefixWorkspaceEnvironment:()=>({kind:"exact_prefix_workspace_environment",workspaceBinding:current.workspaceBinding,workspaceAuthorityBasis:current.workspaceAuthorityBasis})},
    "./worksite_revision.js":{projectWorksiteRevisionOrigins:(...args)=>{originCalls.push(args);const input=args[1].rawInputValue;
      // Preserve the unchanged real projector's envelope-seed precondition;
      // successful C0 origin/currentness admission is not simulated here.
      return product.isSemanticStageEnvelope(input)||revisionProduct.isSemanticRevisionEnvelope(input)?[]:null;},worksiteRevisionPhysicalMatches:()=>{throw Error("physical observation is outside this mechanical check");}},
    "../product/worksite_command_execution.js":{isWorksiteCommandExecutionObservation:value=>value===oldCommand,isWorksiteRevisionCommandExecutionObservation:value=>value===newCommand},
  };
  const module=new SourceTextModule(readFileSync(modulePath,"utf8"),{identifier:modulePath});
  const links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const native=await import(specifier.startsWith("node:")?specifier:pathToFileURL(resolve(dirname(modulePath),specifier)).href),exports={...native,...overrides[specifier]};
    const linked=new SyntheticModule(Object.keys(exports),function(){for(const [name,value]of Object.entries(exports))this.setExport(name,value);});
    links.set(specifier,linked);return linked;
  });
  await module.evaluate();
  function select(parent,cause){basis.input={kind:"semantic_revision_selection_input",schemaVersion:"5.0.0",parent:parent.coordinate,causes:[cause.coordinate]};owner.call.implementationRef=ids.selectionImplementationRef;return module.namespace.projectRevisionSelectionSubject(basis,basis.input);}
  function project(request){basis.input=request;owner.call.implementationRef=ids.projectionImplementationRef;return module.namespace.projectSemanticRevision(basis,request,false);}
  return {product,revisionProduct,ids,stage,current,states,executions,lookupOrder,owner,basis,root,oldCause,first,partial,second,state,revision,select,project,originCalls,oldCommand,newCommand,module};
}
