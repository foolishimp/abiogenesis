import { WORKSITE_COMMAND_FORWARD_IDS as F } from "../product/worksite_command_forward_identity.js";
import { type WorksiteCommandForwardRequest, type WorksiteCommandForwardTask,
  type WorksiteCommandForwardObservation } from "../product/worksite_command_forward.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as C2 } from "../product/worksite_command_execution.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import { canonicalizeAuthoredGtlCarrier } from "./canonicalization.js";
import { graphEdge } from "./graph_applications.js";
import type { GraphFunction, RootModuleArtifactBasis } from "./contracts.js";
import { modulePublication, implementationBinding, closureContract, contractDeclaration,
  productSemanticsBinding, catalogContribution } from "./declarations.js";

/** Exactly one no-effect preparation and one nested C2; history grants no calls. */
export function worksiteCommandForwardGraphFunctions(): readonly GraphFunction[] {
  const request=cCarrier<WorksiteCommandForwardRequest>(F.requestContractRef),task=cCarrier<WorksiteCommandForwardTask>(F.taskContractRef),
    output=cCarrier<WorksiteCommandForwardObservation>(F.observationContractRef);
  const declaration=(close:string,predicate:string)=>({"abg.closure_contract":close,"abg.evidence_contract":C2.evidenceContractRef,
    "abg.judgment_contract":C2.judgmentContractRef,"abg.judgment_predicate":predicate,"abg.transition_contract":C2.transitionContractRef,
    "abg.worksite_command_forward":F.historyDependencyRef});
  const requirement=(binding:string,input:string,output:string)=>({kind:"executable_leaf_requirement" as const,
    implementationBindingRef:binding,inputContractRef:input,outputContractRef:output,evidenceContractRef:C2.evidenceContractRef,
    failureContractRef:C2.failureContractRef,refusalContractRef:C2.refusalContractRef,judgmentContractRef:C2.judgmentContractRef});
  const root:GraphFunction={kind:"graph_function",name:F.graphFunctionRef,version:"5.0.0",
    environment:{requires:[F.requestContractRef],provides:[F.observationContractRef],carries:[F.taskContractRef]},
    inputs:[F.requestContractRef],outputs:[F.observationContractRef],effects:[],tags:["abiogenesis","worksite","forward-only","no-construction"],
    template:{kind:"inline_graph",graphRef:F.graphRef,startNodeRef:F.prepareNodeRef,terminalNodeRefs:[F.callNodeRef],
      nodes:[{nodeRef:F.prepareNodeRef,nodeKind:"c_locus",term:C.of({input:request,output:task,programLocusRef:F.prepareNodeRef,
        stageRole:"authenticate-forward-obligation",fibre:"F_D",armId:"arm://abiogenesis/worksite/command-forward/prepare@5",
        compositionRef:null,vectorIndex:0,judgmentPredicateRef:F.stepPredicateRef,resultBearing:true,
        requirement:requirement(F.prepareBindingRef,F.requestContractRef,F.taskContractRef)})},
        {nodeRef:F.callNodeRef,nodeKind:"c_locus",term:workflow.C(cGraphFunctionRef({graphFunctionRef:F.childGraphFunctionRef,input:task,output}))}],
      edges:[graphEdge({fromNodeRef:F.prepareNodeRef,toNodeRef:F.callNodeRef})],
      applications:[]},
    declarations:{...declaration(F.closureContractRef,F.stepPredicateRef),"abg.compute_regime":"F_D"}};
  const child:GraphFunction={kind:"graph_function",name:F.childGraphFunctionRef,version:"5.0.0",
    environment:{requires:[F.taskContractRef],provides:[F.observationContractRef],carries:[F.workerResultContractRef]},
    inputs:[F.taskContractRef],outputs:[F.observationContractRef],effects:[],tags:["abiogenesis","worksite","forward-only","child-only"],
    template:{kind:"inline_graph",graphRef:F.childGraphRef,startNodeRef:F.nodeRef,terminalNodeRefs:[F.nodeRef],edges:[],applications:[],
      nodes:[{nodeRef:F.nodeRef,nodeKind:"c_locus",term:C.of({input:task,output,programLocusRef:F.nodeRef,stageRole:"forward-command",
        fibre:"F_P",armId:"arm://abiogenesis/worksite/command-forward/execute@5",compositionRef:null,vectorIndex:0,
        judgmentPredicateRef:F.judgmentPredicateRef,resultBearing:true,requirement:requirement(F.implementationBindingRef,F.taskContractRef,F.observationContractRef)})}]},
    declarations:{...declaration(F.childClosureContractRef,F.judgmentPredicateRef),"abg.compute_regime":"F_P",
      "abg.child_closure_contract":F.childClosureContractRef,"abg.raw_result_contract":F.workerResultContractRef}};
  return [root,child].map(g=>canonicalizeAuthoredGtlCarrier(g,"graph_function"));
}
export function isWorksiteCommandForwardGraphFunction(value:GraphFunction):boolean {
  return worksiteCommandForwardGraphFunctions().some(g=>canonicalJson(g as unknown as JsonValue)===canonicalJson(value as unknown as JsonValue));
}
export function constructWorksiteCommandForwardModulePublication(artifact:RootModuleArtifactBasis) {
  const graphFunctions=worksiteCommandForwardGraphFunctions();
  const close=closureContract({kind:"closure_contract",closureContractRef:F.closureContractRef,predicateRef:F.rootPredicateRef,
    evidenceContractRef:C2.evidenceContractRef,resultContractRef:F.observationContractRef,refusalContractRef:C2.refusalContractRef,
    refusalValueKind:"worksite_command_execution_refusal",judgmentContractRef:C2.judgmentContractRef,rejectionContractRef:C2.failureContractRef,
    transitionContractRef:C2.transitionContractRef,replayProjectionRef:"projection://abiogenesis/worksite/command-forward@5",
    terminalKind:"completed",closureScope:"run",eventKindRefs:["terminal_reached","frame_closed","graph_call_closed","run_closed"]});
  const bindings=[
    [F.prepareBindingRef,F.prepareImplementationRef,"prepareWorksiteCommandForward","F_D",F.requestContractRef,F.taskContractRef],
    [F.implementationBindingRef,F.implementationRef,"realizeWorksiteCommandForward","F_P",F.taskContractRef,F.observationContractRef],
  ].map(([bindingRef,implementationRef,namedSymbol,computeRegime,inputContractRef,outputContractRef])=>implementationBinding({
    kind:"implementation_binding",bindingRef:bindingRef!,implementationRef:implementationRef!,namedSymbol:namedSymbol!,
    computeRegime:computeRegime as "F_D"|"F_P",inputContractRef:inputContractRef!,outputContractRef:outputContractRef!,
    packageName:artifact.packageName,packageVersion:artifact.packageVersion,modulePath:"build/code/src/implementation/worksite_command_forward.js",
    failureContractRef:C2.failureContractRef,refusalContractRef:C2.refusalContractRef}));
  return modulePublication({kind:"module_publication",moduleRef:F.moduleRef,moduleVersion:"5.0.0",owningProductId:artifact.productId,
    artifactDigest:artifact.artifactDigest,productContentDigest:artifact.productContentDigest,productManifestDigest:artifact.productManifestDigest,
    descriptorRef:`descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
    contributionManifestRef:`contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding:productSemanticsBinding({kind:"product_semantics_binding",bindingRef:F.semanticsBindingRef,
      packageName:artifact.packageName,packageVersion:artifact.packageVersion,modulePath:"build/code/src/product/builtin_semantics.js",
      namedSymbol:"ABI5_WORKSITE_COMMAND_FORWARD_PRODUCT_SEMANTICS"}),
    contracts:[[F.requestContractRef,"input","worksite_command_forward_request"],[F.taskContractRef,"input","worksite_command_forward_task"],
      [F.observationContractRef,"output","worksite_command_forward_observation"],[F.workerResultContractRef,"output","worksite_command_forward_worker_result"],
      [F.closureContractRef,"closure","worksite_command_forward_closure"],[F.childClosureContractRef,"closure","worksite_command_forward_child_closure"]]
      .map(([contractRef,contractKind,valueKind])=>contractDeclaration({contractRef:contractRef!,contractVersion:"5.0.0",
        contractKind:contractKind as "input"|"output"|"closure",valueKind:valueKind!})),
    graphFunctions:[...graphFunctions],implementationBindings:bindings,evaluators:[],rules:[],
    closureContracts:[close,closureContract({...close,closureContractRef:F.childClosureContractRef,predicateRef:F.judgmentPredicateRef,
      closureScope:"graph_call",eventKindRefs:["terminal_reached","frame_closed","graph_call_closed"]})],
    programs:[{kind:"gtl_program",programRef:F.programRef,version:"5.0.0",moduleRef:F.moduleRef,
      starts:[{startRef:F.startRef,graphFunctionRef:F.graphFunctionRef}],callableMembership:[F.graphFunctionRef,F.childGraphFunctionRef],
      closureContractRef:F.closureContractRef,policies:{"abg.root_mode":"direct","abg.default_start_ref":F.startRef}}],
    contributions:graphFunctions.map(g=>catalogContribution({handle:g.name,kind:"graph_function",declarationOrContractRef:g.name,
      owningProductId:artifact.productId,programMembershipRefs:[F.programRef],readinessPrerequisiteRefs:[F.programRef],
      compatibilityRefs:["compatibility://abiogenesis/major/5"],provenanceRefs:[artifact.artifactDigest,artifact.productManifestDigest]}))});
}
