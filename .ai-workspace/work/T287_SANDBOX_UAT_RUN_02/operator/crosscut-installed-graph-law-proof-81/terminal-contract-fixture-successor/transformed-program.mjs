// Independently authored test declarations for ordinary GTL mechanics. No greeting.
export const STRUCTURAL_FIXTURE_OWNER = Object.freeze({ productId: 'product://abi5-tests/structural-fixtures@5.0.0', packageName: '@abi5-tests/structural-fixtures', packageVersion: '5.0.0' });
const ref = (scheme, name) => `${scheme}://abi5-tests/structural/${name}@5`;
const ids = name => Object.freeze(Object.fromEntries([
  ['programRef','program'],['graphFunctionRef','graph-function'],['graphRef','graph'],['nodeRef','node'],['startRef','start'],
  ['inputContractRef','contract'],['outputContractRef','contract'],['failureContractRef','contract'],['refusalContractRef','contract'],
  ['evidenceContractRef','contract'],['judgmentContractRef','contract'],['transitionContractRef','contract'],['closureContractRef','contract'],['childClosureContractRef','contract'],
  ['implementationBindingRef','implementation-binding'],['implementationRef','implementation'],['armId','arm'],['judgmentPredicateRef','predicate'],
].map(([key,scheme]) => [key,ref(scheme, ['inputContractRef','outputContractRef','failureContractRef','refusalContractRef','evidenceContractRef','judgmentContractRef','transitionContractRef','closureContractRef','childClosureContractRef'].includes(key) ? `${name}/${key.replace('ContractRef','')}` : name)])));
export const STRUCTURAL_IDS = Object.freeze({ ...ids('atomic'), moduleRef: ref('module','mechanics') });
export const STRUCTURAL_DIRECT_IDS = Object.freeze({ programRef: ref('program','atomic/direct'), handle: ref('gtl','atomic/direct') });
export const COMPOSED_IDS = Object.freeze({ ...ids('compose'), normalizeLocusRef: ref('locus','compose/normalize'), edgeEvaluateLocusRef: ref('locus','compose/evaluate'), renderLocusRef: ref('locus','compose/render') });
export const GRAPH_EDGE_IDS = Object.freeze({ ...ids('graph-edge'), normalizeGraphFunctionRef: ref('graph-function','graph-edge/normalize'), renderGraphFunctionRef: ref('graph-function','graph-edge/render'), normalizeNodeRef: ref('node','graph-edge/normalize'), renderNodeRef: ref('node','graph-edge/render') });
export const SUBSTITUTED_IDS = Object.freeze({ ...ids('substitute'), innerGraphFunctionRef: ref('graph-function','substitute/pass'), innerNodeRef: ref('node','substitute/pass') });
export const WORKFLOW_IDS = ids('workflow');
export const GATE_IDS = Object.freeze({ ...ids('gate'), targetGraphFunctionRef: ref('graph-function','gate/target'), targetNodeRef: ref('node','gate/target'), evaluatorRef: ref('evaluator','gate'), ruleRef: ref('rule','gate'), admittedInputContractRef: ref('contract','gate/admitted-input') });
export const RECURSION_IDS = Object.freeze({ ...ids('recursion'), childGraphFunctionRef: ref('graph-function','recursion/step'), childNodeRef: ref('node','recursion/step'), evaluatorRef: ref('evaluator','recursion'), terminationRuleRef: ref('rule','recursion'), bound: 4 });
export const FAN_OUT_IDS = Object.freeze({ ...ids('fan-out'), elementGraphFunctionRef: ref('graph-function','fan-out/element'), reducerGraphFunctionRef: ref('graph-function','fan-out/reducer'), elementNodeRef: ref('node','fan-out/element'), reducerNodeRef: ref('node','fan-out/reducer'), batchRef: ref('batch','fan-out'), inputVectorRef: ref('contract','fan-out/input-vector'), outputVectorRef: ref('contract','fan-out/output-vector'), inputMemberContractRef: ref('contract','fan-out/member-input'), outputMemberContractRef: ref('contract','fan-out/member-output'), summaryContractRef: ref('contract','fan-out/summary') });
export const FP_IDS = Object.freeze({ ...ids('worker'), workerActorRef: ref('actor','worker'), workerBindingRef: ref('worker-binding','worker'), materializationPlanRef: ref('prompt-plan','worker'), rendererRef: ref('renderer','worker') });
export const FP_RETRY_IDS = ids('retry');
export const FIBRE_SUBSTITUTION_IDS = ids('worker-deterministic');
export const FP_FD_COMPOSED_IDS = Object.freeze({ ...ids('worker-compose'), passGraphFunctionRef: ref('graph-function','worker-pass'), passNodeRef: ref('node','worker-pass'), passImplementationRef: ref('implementation','worker-pass') });
export const NORMALIZED_CONTRACT_REF = ref('contract','normalized-data');
export const WORKER_EXPECTED_PAYLOAD = 'World';
export const contractKinds = Object.freeze({
  [STRUCTURAL_IDS.inputContractRef]:'data_input',[STRUCTURAL_IDS.outputContractRef]:'data_output',[NORMALIZED_CONTRACT_REF]:'normalized_data',
  [GATE_IDS.admittedInputContractRef]:'data_input',[RECURSION_IDS.inputContractRef]:'recursion_state',[RECURSION_IDS.outputContractRef]:'recursion_state',
  [FAN_OUT_IDS.inputVectorRef]:'member_vector_input',[FAN_OUT_IDS.outputVectorRef]:'gtl_fan_out_vector',[FAN_OUT_IDS.inputMemberContractRef]:'member_input',[FAN_OUT_IDS.outputMemberContractRef]:'member_output',[FAN_OUT_IDS.summaryContractRef]:'member_summary',
  [FP_IDS.inputContractRef]:'worker_instruction',[FP_IDS.outputContractRef]:'worker_output',
});
// Metadata only; these are ordinary owner-defined leaf bindings in the fixture.
export const LEAF_SPECS = Object.freeze({
  atomic:{ids:STRUCTURAL_IDS,input:STRUCTURAL_IDS.inputContractRef,output:STRUCTURAL_IDS.outputContractRef,kind:'data_output'},
  normalize:{ids:ids('normalize'),input:STRUCTURAL_IDS.inputContractRef,output:NORMALIZED_CONTRACT_REF,kind:'normalized_data'},
  pass:{ids:ids('pass'),input:NORMALIZED_CONTRACT_REF,output:NORMALIZED_CONTRACT_REF,kind:'normalized_data'},
  project:{ids:ids('project'),input:NORMALIZED_CONTRACT_REF,output:STRUCTURAL_IDS.outputContractRef,kind:'data_output'},
  gate:{ids:ids('gate/evaluate'),input:STRUCTURAL_IDS.inputContractRef,output:GATE_IDS.admittedInputContractRef,kind:'data_input'},
  gateTarget:{ids:ids('gate/target'),input:GATE_IDS.admittedInputContractRef,output:STRUCTURAL_IDS.outputContractRef,kind:'data_output'},
  recursionEvaluate:{ids:ids('recursion/evaluate'),input:RECURSION_IDS.inputContractRef,output:RECURSION_IDS.inputContractRef,kind:'recursion_state'},
  recursionStep:{ids:ids('recursion/step'),input:RECURSION_IDS.inputContractRef,output:RECURSION_IDS.outputContractRef,kind:'recursion_state'},
  element:{ids:ids('fan-out/element'),input:FAN_OUT_IDS.inputMemberContractRef,output:FAN_OUT_IDS.outputMemberContractRef,kind:'member_output'},
  reduce:{ids:ids('fan-out/reducer'),input:FAN_OUT_IDS.outputVectorRef,output:FAN_OUT_IDS.summaryContractRef,kind:'member_summary'},
  worker:{ids:FP_IDS,input:FP_IDS.inputContractRef,output:FP_IDS.outputContractRef,kind:'worker_output',regime:'F_P'},
  workerDeterministic:{ids:FIBRE_SUBSTITUTION_IDS,input:FP_IDS.inputContractRef,output:FP_IDS.outputContractRef,kind:'worker_output'},
  workerPass:{ids:ids('worker-pass'),input:FP_IDS.outputContractRef,output:FP_IDS.outputContractRef,kind:'worker_output'},
});
export function constructStructuralInput(subject='World'){return Object.freeze({kind:'data_input',schemaVersion:'5.0.0',subject});}
export function constructMemberVector(subjects, blockedOrdinal=null){return {kind:'member_vector_input',schemaVersion:'5.0.0',members:subjects.map((subject,ordinal)=>({ordinal,memberRef:`member://abi5-tests/${ordinal}`,value:{kind:'member_input',schemaVersion:'5.0.0',subject,block:ordinal===blockedOrdinal}}))};}
export function constructStructuralPublication(gtl,artifact,{cases=['atomic','compose','graph-edge','substitute','workflow','gate','recursion','fan-out','worker','retry','worker-deterministic','worker-compose']}={}) {
  const contracts=[],bindings=[],closures=[],graphFunctions=[],programs=[],contributions=[],evaluators=[],rules=[];
  const contract = (contractRef,contractKind,valueKind) => {if(!contracts.some(x=>x.contractRef===contractRef))contracts.push(gtl.contractDeclaration({contractRef,contractVersion:'5.0.0',contractKind,valueKind}));};
  const common = group => {
    for(const kind of ['failure','refusal','evidence','judgment','transition','closure'])contract(group[`${kind}ContractRef`],kind,kind==='evidence'?'deterministic_evidence_candidate':`structural_${kind}`);
    contract(group.childClosureContractRef,'closure','structural_closure');
  };
  const close = (group,output,scope='run',closureRef=scope==='run'?group.closureContractRef:group.childClosureContractRef,predicate=group.judgmentPredicateRef) => {
    common(group); if(closures.some(x=>x.closureContractRef===closureRef))return closureRef;
    closures.push(gtl.closureContract({kind:'closure_contract',closureContractRef:closureRef,closureScope:scope,predicateRef:predicate,evidenceContractRef:group.evidenceContractRef,resultContractRef:output,refusalContractRef:group.refusalContractRef,refusalValueKind:'structural_refusal',judgmentContractRef:group.judgmentContractRef,rejectionContractRef:group.refusalContractRef,transitionContractRef:group.transitionContractRef,replayProjectionRef:ref('projection',closureRef),terminalKind:'completed',eventKindRefs:['terminal_reached','frame_closed','graph_call_closed',...(scope==='run'?['run_closed']:[])]}));return closureRef;
  };
  const of = (symbol,role='result',resultBearing=true,locus=null,index=0,compositionRef=null) => {
    const s=LEAF_SPECS[symbol],group=s.ids;common(group);contract(s.input,'input',contractKinds[s.input]);contract(s.output,'output',contractKinds[s.output]??s.kind);
    if(!bindings.some(b=>b.bindingRef===group.implementationBindingRef))bindings.push(gtl.implementationBinding({kind:'implementation_binding',bindingRef:group.implementationBindingRef,implementationRef:group.implementationRef,packageName:artifact.packageName,packageVersion:artifact.packageVersion,modulePath:'build/leaf.mjs',namedSymbol:symbol,computeRegime:s.regime??'F_D',inputContractRef:s.input,outputContractRef:s.output,failureContractRef:group.failureContractRef,refusalContractRef:group.refusalContractRef}));
    return gtl.C.of({input:gtl.cCarrier(s.input),output:gtl.cCarrier(s.output),programLocusRef:locus??group.nodeRef,stageRole:role,fibre:s.regime??'F_D',armId:group.armId,compositionRef,vectorIndex:index,judgmentPredicateRef:group.judgmentPredicateRef,resultBearing,requirement:{kind:'executable_leaf_requirement',implementationBindingRef:group.implementationBindingRef,inputContractRef:s.input,outputContractRef:s.output,evidenceContractRef:group.evidenceContractRef,failureContractRef:group.failureContractRef,refusalContractRef:group.refusalContractRef,judgmentContractRef:group.judgmentContractRef}});
  };
  const graph = (group,term,input,output,{name=group.graphFunctionRef,nodeRef=group.nodeRef,applications=[],regime='F_D'}={}) => ({kind:'graph_function',name,version:'5.0.0',inputs:[input],outputs:[output],environment:{requires:[input],provides:[output],carries:[...new Set([input,output])]},effects:[],tags:['language-mechanics',name],declarations:{'abg.compute_regime':regime,'abg.closure_contract':close(group,output,'graph_call'),'abg.child_closure_contract':close(group,output,'graph_call'),'abg.evidence_contract':group.evidenceContractRef,'abg.judgment_contract':group.judgmentContractRef,'abg.judgment_predicate':group.judgmentPredicateRef,'abg.transition_contract':group.transitionContractRef},template:{kind:'inline_graph',graphRef:group.graphRef,startNodeRef:nodeRef,terminalNodeRefs:[nodeRef],nodes:[{nodeRef,nodeKind:'c_locus',term}],edges:[],applications}});
  const addProgram = (group,members=[group.graphFunctionRef],{programRef=group.programRef,starts=[{startRef:group.startRef,graphFunctionRef:group.graphFunctionRef}],output=STRUCTURAL_IDS.outputContractRef}={}) => {
    close(group,output); programs.push({kind:'gtl_program',programRef,version:'5.0.0',moduleRef:STRUCTURAL_IDS.moduleRef,starts,callableMembership:members,closureContractRef:group.closureContractRef,policies:{'abg.root_mode':'direct','abg.compute_regime':'mixed',...(starts.length?{'abg.default_start_ref':starts[0].startRef}:{})}});
    for(const name of members)contributions.push(gtl.catalogContribution({handle:name,kind:'graph_function',declarationOrContractRef:name,owningProductId:artifact.productId,programMembershipRefs:[programRef],readinessPrerequisiteRefs:[programRef],compatibilityRefs:['compatibility://abiogenesis/major/5'],provenanceRefs:[artifact.artifactDigest,artifact.productManifestDigest]}));
  };
  // The finite source cases instantiate existing operators; there is no controller.
  graphFunctions.push(graph(STRUCTURAL_IDS,of('atomic'),STRUCTURAL_IDS.inputContractRef,STRUCTURAL_IDS.outputContractRef));
  addProgram(STRUCTURAL_IDS); programs.push({...programs[0],programRef:STRUCTURAL_DIRECT_IDS.programRef,starts:[],policies:{'abg.root_mode':'direct','abg.compute_regime':'F_D'}});
  contributions.push(gtl.catalogContribution({...contributions[0],handle:STRUCTURAL_DIRECT_IDS.handle,programMembershipRefs:[STRUCTURAL_DIRECT_IDS.programRef],readinessPrerequisiteRefs:[STRUCTURAL_DIRECT_IDS.programRef]}));
  if(cases.includes('compose')){
    const checks=gtl.C.batch([of('pass','check',false,ref('locus','compose/check-a')),of('pass','check',false,ref('locus','compose/check-b'))],ref('batch','compose/checks'));
    const edge=gtl.C.edge({transform:of('pass','transform',false,ref('locus','compose/retry-transform'),3),evaluate:of('pass','evaluate',false,COMPOSED_IDS.edgeEvaluateLocusRef,4),consequence:of('project','consequence',true,COMPOSED_IDS.renderLocusRef,5)});
    const term=gtl.C.compose(gtl.C.compose(of('normalize','transform',false,COMPOSED_IDS.normalizeLocusRef),checks),gtl.C.retry(edge,2));
    graphFunctions.push(graph(COMPOSED_IDS,term,STRUCTURAL_IDS.inputContractRef,STRUCTURAL_IDS.outputContractRef));addProgram(COMPOSED_IDS);
  }
  const normalizeGraph=graph(ids('graph-edge/normalize'),of('normalize','transform',true,ref('locus','graph-edge/normalize')),STRUCTURAL_IDS.inputContractRef,NORMALIZED_CONTRACT_REF);
  const projectGraph=graph(ids('graph-edge/render'),of('project','consequence',true,ref('locus','graph-edge/render')),NORMALIZED_CONTRACT_REF,STRUCTURAL_IDS.outputContractRef);
  normalizeGraph.declarations={'abg.compute_regime':'F_D'};projectGraph.declarations={'abg.compute_regime':'F_D'};
  if(cases.includes('graph-edge')||cases.includes('substitute')){
    const parent=gtl.composeGraphFunctions({name:GRAPH_EDGE_IDS.graphFunctionRef,left:normalizeGraph,right:projectGraph});
    graphFunctions.push(normalizeGraph,projectGraph,parent);addProgram(GRAPH_EDGE_IDS,[parent.name]);
    // Finite external fixture RUN closure follows its actual terminal Project contracts.
    const graphEdgeRunClosureIndex=closures.findIndex(row=>row.closureContractRef===GRAPH_EDGE_IDS.closureContractRef&&row.closureScope==='run');
    const terminalProjectNode=parent.template.nodes.find(row=>parent.template.terminalNodeRefs.includes(row.nodeRef));
    const terminalProjectTerm=terminalProjectNode.term;
    const terminalProjectBinding=bindings.find(row=>row.bindingRef===terminalProjectTerm.requirement.implementationBindingRef);
    closures[graphEdgeRunClosureIndex]=gtl.closureContract({...closures[graphEdgeRunClosureIndex],
      evidenceContractRef:terminalProjectTerm.requirement.evidenceContractRef,
      judgmentContractRef:terminalProjectTerm.requirement.judgmentContractRef,
      refusalContractRef:terminalProjectBinding.refusalContractRef,
      rejectionContractRef:terminalProjectBinding.refusalContractRef});

    if(cases.includes('substitute')){const inner=graph(ids('substitute/pass'),of('pass','pass',true,ref('locus','substitute/pass')),NORMALIZED_CONTRACT_REF,NORMALIZED_CONTRACT_REF);inner.declarations={'abg.compute_regime':'F_D'};const replaced=gtl.substituteGraphFunction({name:SUBSTITUTED_IDS.graphFunctionRef,outer:parent,targetVectorRef:parent.template.edges[0].edgeRef,inner});graphFunctions.push(inner,replaced);addProgram(SUBSTITUTED_IDS,[replaced.name]);}
  }
  if(cases.includes('workflow')){const term=gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:STRUCTURAL_IDS.graphFunctionRef,input:gtl.cCarrier(STRUCTURAL_IDS.inputContractRef),output:gtl.cCarrier(STRUCTURAL_IDS.outputContractRef)}));graphFunctions.push(graph(WORKFLOW_IDS,term,STRUCTURAL_IDS.inputContractRef,STRUCTURAL_IDS.outputContractRef));addProgram(WORKFLOW_IDS,[WORKFLOW_IDS.graphFunctionRef,STRUCTURAL_IDS.graphFunctionRef]);}
  if(cases.includes('gate')){
    const app=gtl.gateApplication({inputContractRef:GATE_IDS.admittedInputContractRef,outputContractRef:STRUCTURAL_IDS.outputContractRef,targetRef:GATE_IDS.targetGraphFunctionRef,ruleRef:GATE_IDS.ruleRef,evaluatorRefs:[GATE_IDS.evaluatorRef]});
    evaluators.push(gtl.evaluatorDeclaration({name:GATE_IDS.evaluatorRef,regime:'F_D',description:'Tests an ordinary declared gate over supplied data',binding:LEAF_SPECS.gate.ids.implementationRef,consumedFieldRefs:['$.subject'],tags:['gate','mechanics']}));rules.push(gtl.ruleDeclaration({name:GATE_IDS.ruleRef,kind:'fixture_subject_gate',config:{blockedSubject:'Blocked'},tags:['gate','mechanics']}));
    const term=gtl.C.compose(of('gate','evaluate',false,ref('locus','gate/evaluate'),0,app.applicationRef),gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:GATE_IDS.targetGraphFunctionRef,input:gtl.cCarrier(GATE_IDS.admittedInputContractRef),output:gtl.cCarrier(STRUCTURAL_IDS.outputContractRef)})));
    graphFunctions.push(graph(GATE_IDS,term,STRUCTURAL_IDS.inputContractRef,STRUCTURAL_IDS.outputContractRef,{applications:[app]}),graph(ids('gate/target'),of('gateTarget'),GATE_IDS.admittedInputContractRef,STRUCTURAL_IDS.outputContractRef));addProgram(GATE_IDS,[GATE_IDS.graphFunctionRef,GATE_IDS.targetGraphFunctionRef]);
  }
  if(cases.includes('recursion')){
    evaluators.push(gtl.evaluatorDeclaration({name:RECURSION_IDS.evaluatorRef,regime:'F_D',description:'Tests finite declared termination',binding:LEAF_SPECS.recursionEvaluate.ids.implementationRef,consumedFieldRefs:['$.terminal'],tags:['recursion','mechanics']}));rules.push(gtl.ruleDeclaration({name:RECURSION_IDS.terminationRuleRef,kind:'boolean_field_termination',config:{fieldRef:'$.terminal',terminalValue:true},tags:['recursion','mechanics']}));
    const app=gtl.recurseApplication({inputContractRef:RECURSION_IDS.inputContractRef,outputContractRef:RECURSION_IDS.outputContractRef,graphFunctionRef:RECURSION_IDS.childGraphFunctionRef,terminationRuleRef:RECURSION_IDS.terminationRuleRef,terminationEvaluatorRefs:[RECURSION_IDS.evaluatorRef],terminationFieldRef:'$.terminal',foldback:{mode:'rebind',binding:'fixture_state_rebind',requiresParentEvaluation:true},bound:RECURSION_IDS.bound});
    const step=graph(ids('recursion/step'),of('recursionStep','recursion_step'),RECURSION_IDS.inputContractRef,RECURSION_IDS.outputContractRef);step.declarations['abg.child_closure_contract']=close(RECURSION_IDS,RECURSION_IDS.outputContractRef,'graph_call');
    const term=gtl.C.compose(of('recursionEvaluate','evaluate',false,RECURSION_IDS.nodeRef,0,app.applicationRef),gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:step.name,input:gtl.cCarrier(RECURSION_IDS.inputContractRef),output:gtl.cCarrier(RECURSION_IDS.outputContractRef)})));
    graphFunctions.push(graph(RECURSION_IDS,term,RECURSION_IDS.inputContractRef,RECURSION_IDS.outputContractRef,{applications:[app]}),step);addProgram(RECURSION_IDS,[RECURSION_IDS.graphFunctionRef,step.name],{output:RECURSION_IDS.outputContractRef});
  }
  if(cases.includes('fan-out')){
    contract(FAN_OUT_IDS.inputVectorRef,'input','member_vector_input');contract(FAN_OUT_IDS.outputVectorRef,'output','gtl_fan_out_vector');contract(FAN_OUT_IDS.inputMemberContractRef,'input','member_input');contract(FAN_OUT_IDS.outputMemberContractRef,'output','member_output');contract(FAN_OUT_IDS.summaryContractRef,'output','member_summary');
    const element=graph(ids('fan-out/element'),of('element'),FAN_OUT_IDS.inputMemberContractRef,FAN_OUT_IDS.outputMemberContractRef),reduce=graph(ids('fan-out/reducer'),of('reduce'),FAN_OUT_IDS.outputVectorRef,FAN_OUT_IDS.summaryContractRef);
    const fanout=gtl.fanOutApplication({inputContractRef:FAN_OUT_IDS.inputVectorRef,outputContractRef:FAN_OUT_IDS.outputVectorRef,batchRef:FAN_OUT_IDS.batchRef,elementGraphFunctionRef:element.name,inputVectorRef:FAN_OUT_IDS.inputVectorRef,outputVectorRef:FAN_OUT_IDS.outputVectorRef,inputMemberContractRef:FAN_OUT_IDS.inputMemberContractRef,outputMemberContractRef:FAN_OUT_IDS.outputMemberContractRef});
    const fanin=gtl.fanInApplication({inputContractRef:FAN_OUT_IDS.outputVectorRef,outputContractRef:FAN_OUT_IDS.summaryContractRef,reducerGraphFunctionRef:reduce.name,inputVectorRef:FAN_OUT_IDS.outputVectorRef});
    const batch=gtl.C.batch([gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:element.name,input:gtl.cCarrier(FAN_OUT_IDS.inputMemberContractRef),output:gtl.cCarrier(FAN_OUT_IDS.outputMemberContractRef)}))],FAN_OUT_IDS.batchRef,{input:gtl.cCarrier(FAN_OUT_IDS.inputVectorRef),output:gtl.cCarrier(FAN_OUT_IDS.outputVectorRef)});
    const term=gtl.C.compose(batch,gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:reduce.name,input:gtl.cCarrier(FAN_OUT_IDS.outputVectorRef),output:gtl.cCarrier(FAN_OUT_IDS.summaryContractRef)})));
    graphFunctions.push(graph(FAN_OUT_IDS,term,FAN_OUT_IDS.inputVectorRef,FAN_OUT_IDS.summaryContractRef,{applications:[fanout,fanin]}),element,reduce);addProgram(FAN_OUT_IDS,[FAN_OUT_IDS.graphFunctionRef,element.name,reduce.name],{output:FAN_OUT_IDS.summaryContractRef});
  }
  if(cases.some(x=>['worker','retry','worker-deterministic','worker-compose'].includes(x))){
    const worker=graph(FP_IDS,of('worker'),FP_IDS.inputContractRef,FP_IDS.outputContractRef,{regime:'F_P'});worker.declarations={'abg.compute_regime':'F_P'};graphFunctions.push(worker);addProgram(FP_IDS,[worker.name],{output:FP_IDS.outputContractRef});
    if(cases.includes('retry')){graphFunctions.push(graph(FP_RETRY_IDS,gtl.C.retry(of('worker','result',true,FP_RETRY_IDS.nodeRef),3),FP_IDS.inputContractRef,FP_IDS.outputContractRef,{regime:'F_P'}));addProgram(FP_RETRY_IDS,[FP_RETRY_IDS.graphFunctionRef],{output:FP_IDS.outputContractRef});}
    if(cases.includes('worker-deterministic')){graphFunctions.push(graph(FIBRE_SUBSTITUTION_IDS,of('workerDeterministic'),FP_IDS.inputContractRef,FP_IDS.outputContractRef));addProgram(FIBRE_SUBSTITUTION_IDS,[FIBRE_SUBSTITUTION_IDS.graphFunctionRef],{output:FP_IDS.outputContractRef});}
    if(cases.includes('worker-compose')){const pass=graph(ids('worker-pass'),of('workerPass'),FP_IDS.outputContractRef,FP_IDS.outputContractRef);pass.declarations={'abg.compute_regime':'F_D'};const parent=gtl.composeGraphFunctions({name:FP_FD_COMPOSED_IDS.graphFunctionRef,left:worker,right:pass});graphFunctions.push(pass,parent);addProgram(FP_FD_COMPOSED_IDS,[parent.name],{output:FP_IDS.outputContractRef});}
  }
  // One handle can belong to multiple finite test Programs, exactly as ordinary GTL.
  const joined=new Map();for(const row of contributions){const prior=joined.get(row.handle);joined.set(row.handle,prior?gtl.catalogContribution({...prior,programMembershipRefs:[...new Set([...prior.programMembershipRefs,...row.programMembershipRefs])],readinessPrerequisiteRefs:[...new Set([...prior.readinessPrerequisiteRefs,...row.readinessPrerequisiteRefs])]}):row);}
  return gtl.modulePublication({kind:'module_publication',moduleRef:STRUCTURAL_IDS.moduleRef,moduleVersion:'5.0.0',owningProductId:artifact.productId,descriptorRef:ref('descriptor','mechanics'),artifactDigest:artifact.artifactDigest,productContentDigest:artifact.productContentDigest,productManifestDigest:artifact.productManifestDigest,contributionManifestRef:ref('contribution-manifest','mechanics'),productSemanticsBinding:gtl.productSemanticsBinding({kind:'product_semantics_binding',bindingRef:ref('product-semantics','mechanics'),packageName:artifact.packageName,packageVersion:artifact.packageVersion,modulePath:'build/leaf.mjs',namedSymbol:'semantics'}),contracts,evaluators,rules,implementationBindings:bindings,closureContracts:closures,graphFunctions,programs,contributions:[...joined.values()]});
}
