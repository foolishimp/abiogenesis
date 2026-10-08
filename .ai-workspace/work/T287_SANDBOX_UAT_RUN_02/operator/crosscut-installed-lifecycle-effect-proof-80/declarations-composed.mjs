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
  c0ProgramRef:fixtureRef('program','file-replace'),
  c0StartRef:fixtureRef('start','file-replace'),
  c0GraphFunctionRef:fixtureRef('graph-function','file-replace'),
  c0NodeRef:fixtureRef('node','file-replace'),
});

export function lifecycleEffectDeclaration(gtl,nativePublication,runEnvironment,rootPublication){
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
  const c0=gtl.WORKSITE_C0_IDS;
  const c0Target=rootPublication.graphFunctions.find(g=>g.name===c0.graphFunctionRef);
  if(c0Target===undefined)throw new TypeError('canonical root C0 declaration is required');
  const c0Declarations=Object.fromEntries(Object.entries(c0Target.declarations).filter(([key])=>key!=='abg.raw_result_contract'));
  const c0Graph={kind:'graph_function',name:ids.c0GraphFunctionRef,version:'5.0.0',
    environment:structuredClone(c0Target.environment),inputs:[...c0Target.inputs],outputs:[...c0Target.outputs],
    effects:[...c0Target.effects],tags:['controlled-installed-test'],declarations:c0Declarations,
    template:{kind:'inline_graph',graphRef:fixtureRef('graph','file-replace'),
      startNodeRef:ids.c0NodeRef,terminalNodeRefs:[ids.c0NodeRef],edges:[],applications:[],
      nodes:[{nodeRef:ids.c0NodeRef,nodeKind:'c_locus',term:gtl.workflow.C(gtl.cGraphFunctionRef({
        graphFunctionRef:c0.graphFunctionRef,input:gtl.cCarrier(c0Target.inputs[0]),output:gtl.cCarrier(c0Target.outputs[0]),
      }))}]}};
  const c0Program={kind:'gtl_program',programRef:ids.c0ProgramRef,version:'5.0.0',moduleRef:ids.moduleRef,
    starts:[{startRef:ids.c0StartRef,graphFunctionRef:c0Graph.name}],callableMembership:[c0Graph.name,c0.graphFunctionRef],
    closureContractRef:c0Declarations['abg.closure_contract'],policies:{'abg.root_mode':'direct',
      'abg.compute_regime':c0Declarations['abg.compute_regime'],'abg.default_start_ref':ids.c0StartRef}};
  return {moduleRef:ids.moduleRef,owningProductId:ids.productId,descriptorRef:ids.descriptorRef,
    contributionManifestRef:ids.contributionManifestRef,
    productSemanticsBinding:structuredClone(nativePublication.productSemanticsBinding),
    contracts:[],implementationBindings:[],closureContracts:[],evaluators:[],rules:[],
    programs:[program,c0Program],graphFunctions:[graph,c0Graph],runEnvironments:[runEnvironment],
    contributions:[{handle:graph.name,kind:'graph_function',declarationOrContractRef:graph.name,
      owningProductId:ids.productId,programMembershipRefs:[program.programRef],
      readinessPrerequisiteRefs:[program.programRef],compatibilityRefs:['compatibility://abiogenesis/major/5']},
      {handle:c0Graph.name,kind:'graph_function',declarationOrContractRef:c0Graph.name,owningProductId:ids.productId,
        programMembershipRefs:[c0Program.programRef],readinessPrerequisiteRefs:[c0Program.programRef],compatibilityRefs:['compatibility://abiogenesis/major/5']}]};
}
