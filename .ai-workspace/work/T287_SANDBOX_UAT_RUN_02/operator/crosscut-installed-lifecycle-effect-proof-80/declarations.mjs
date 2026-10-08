// External finite test declaration. Imported ABI contracts, implementations,
// closure and semantics retain their canonical installed owner.
export const fixtureRef=(kind,name)=>`${kind}://crosscut-local-protocol/${name}@5`;
export const ids=Object.freeze({
  productId:fixtureRef('product','lifecycle-effect'),
  moduleRef:fixtureRef('module','lifecycle-effect'),
  descriptorRef:fixtureRef('descriptor','lifecycle-effect'),
  contributionManifestRef:fixtureRef('contribution-manifest','lifecycle-effect'),
  programRef:fixtureRef('program','lifecycle-effect'),
  startRef:fixtureRef('start','native-work'),
  graphFunctionRef:fixtureRef('graph-function','native-work'),
  nodeRef:fixtureRef('node','native-work'),
});

export function lifecycleEffectDeclaration(gtl,nativePublication,runEnvironment){
  const native=gtl.NATIVE_WORKSPACE_WORK_IDS;
  const target=nativePublication.graphFunctions.find(g=>g.name===native.graphFunctionRef);
  if(target===undefined)throw new TypeError('canonical native work declaration is required');
  const declarations=Object.fromEntries(Object.entries(target.declarations)
    .filter(([key])=>key!=='abg.raw_result_contract'));
  const graph={kind:'graph_function',name:ids.graphFunctionRef,version:'5.0.0',
    environment:{requires:[native.taskContractRef],provides:[native.observationContractRef],carries:[]},
    inputs:[native.taskContractRef],outputs:[native.observationContractRef],
    effects:[native.effectUri],tags:['controlled-installed-test'],declarations,
    template:{kind:'inline_graph',graphRef:fixtureRef('graph','native-work'),
      startNodeRef:ids.nodeRef,terminalNodeRefs:[ids.nodeRef],edges:[],applications:[],
      nodes:[{nodeRef:ids.nodeRef,nodeKind:'c_locus',term:gtl.workflow.C(gtl.cGraphFunctionRef({
        graphFunctionRef:native.graphFunctionRef,input:gtl.cCarrier(native.taskContractRef),
        output:gtl.cCarrier(native.observationContractRef),
      }))}]}};
  const program={kind:'gtl_program',programRef:ids.programRef,version:'5.0.0',moduleRef:ids.moduleRef,
    starts:[{startRef:ids.startRef,graphFunctionRef:graph.name}],
    callableMembership:[graph.name,native.graphFunctionRef],closureContractRef:native.closureContractRef,
    policies:{'abg.root_mode':'direct','abg.compute_regime':'F_P','abg.default_start_ref':ids.startRef,
      [gtl.RUN_ENVIRONMENT_POLICY]:runEnvironment.declarationRef}};
  return {moduleRef:ids.moduleRef,owningProductId:ids.productId,descriptorRef:ids.descriptorRef,
    contributionManifestRef:ids.contributionManifestRef,
    productSemanticsBinding:structuredClone(nativePublication.productSemanticsBinding),
    contracts:[],implementationBindings:[],closureContracts:[],evaluators:[],rules:[],
    programs:[program],graphFunctions:[graph],runEnvironments:[runEnvironment],
    contributions:[{handle:graph.name,kind:'graph_function',declarationOrContractRef:graph.name,
      owningProductId:ids.productId,programMembershipRefs:[program.programRef],
      readinessPrerequisiteRefs:[program.programRef],compatibilityRefs:['compatibility://abiogenesis/major/5']}]};
}
