import { createHash } from 'node:crypto';
export const version = '5.0.0';
export const packageName = '@abiogenesis-fixtures/registered-selection';
export const ref = (type, name) => `${type}://registered-selection/${name}@5`;
export const contract = name => ref('contract', name);
export const canonical = value => JSON.stringify(value, function (_, v) {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v;
});
export const hash = value => `sha256:${createHash('sha256').update(canonical(value)).digest('hex')}`;
export const bindings = ['select', 'A', 'B'].map(name => ({
  kind: 'implementation_binding', bindingRef: ref('binding', name), implementationRef: ref('implementation', name),
  packageName, packageVersion: version, modulePath: 'build/index.js', namedSymbol: name === 'select' ? 'select' : `execute${name}`,
  computeRegime: 'F_D', inputContractRef: contract(name === 'select' ? 'request' : 'child-input'),
  outputContractRef: contract(name === 'select' ? 'choice' : 'result'), failureContractRef: contract('failure'), refusalContractRef: contract('refusal'),
}));
const descriptor = binding => {
  const {kind, bindingRef, ...body} = binding;
  return {kind:'packaged_leaf_implementation_descriptor', schemaVersion:version, ...body, descriptorDigest:hash(body)};
};
export const SELECT_DESCRIPTOR = descriptor(bindings[0]);
export const A_DESCRIPTOR = descriptor(bindings[1]);
export const B_DESCRIPTOR = descriptor(bindings[2]);
const realize = (name, input, resultCandidate) => ({kind:'leaf_realization_candidate', schemaVersion:version, disposition:'success',
  evidenceCandidates:[{kind:'deterministic_evidence_candidate', schemaVersion:version, implementationRef:ref('implementation',name), inputDigest:hash(input), outputDigest:hash(resultCandidate)}], resultCandidate});
export function select(input) {
  const base = {kind:'registered_graph_choice', schemaVersion:version, reason:'Declared equality rule over request.choice.', evidenceRefs:[]};
  if (input.choice === 'gap') return realize('select',input,{...base, disposition:'gap',missingSupportRefs:[ref('support','choice')]});
  const target = input.catalog.find(row => row.name === input.choice) ?? input.catalog[0];
  return realize('select',input,{...base,disposition:'selected',graphFunctionRef:input.choice === 'nonpermitted' ? ref('graph-function','outside') : target.graphFunctionRef,
    definitionDigest: input.choice === 'stale' ? `sha256:${'0'.repeat(64)}` : target.definitionDigest,
    input:{contractRef:contract(input.choice === 'wrong-contract' ? 'request' : 'child-input'),value:input.choice === 'wrong-input' ? {kind:'selection_child_input',payload:42} : {kind:'selection_child_input',payload:input.payload}}});
}
export const executeA = input => realize('A',input,{kind:'selection_result',schemaVersion:version,child:'A',payload:input.payload});
export const executeB = input => realize('B',input,{kind:'selection_result',schemaVersion:version,child:'B',payload:input.payload});
const validChild = value => value?.kind === 'selection_child_input' && typeof value.payload === 'string';
export const SEMANTICS = Object.freeze({kind:'product_semantics_provider',schemaVersion:version,bindingRef:ref('semantics','product'),packageName,packageVersion:version,
  admitInput(contractRef,value) {
    return (contractRef === contract('request') && value?.kind === 'selection_request' && typeof value.choice === 'string' && typeof value.payload === 'string' && Array.isArray(value.catalog)) ||
      (contractRef === contract('child-input') && validChild(value)) ? value : null;
  },
  evaluateInteractionResponse() { return null; },
  resolveProbabilisticWorkerContracts(basis) { return {instructionContractRef:basis.inputContractRef,resultContractRef:basis.outputContractRef}; },
  validateContractValue(kind,value) {
    if (kind === 'registered_graph_choice') return value?.kind === kind;
    if (kind === 'selection_result') return value?.kind === kind && ['A','B'].includes(value.child) && typeof value.payload === 'string';
    if (kind === 'selection_child_input') return validChild(value);
    return value?.kind === kind;
  },
  resolveJudgmentRelation(predicateRef) {
    if (predicateRef !== ref('predicate','valid')) return null;
    return {predicateRef,advanceReasonRef:ref('reason','valid'),rejectionReasonRef:ref('reason','unresolved'),
      evaluate:(input,output) => output?.kind === 'registered_graph_choice' ? output.disposition === 'selected' : output?.kind === 'selection_result' && output.payload === input.payload};
  },
});
export function declarations(gtl) {
  const closure = (scope) => ({kind:'closure_contract',closureContractRef:contract(`closure-${scope}`),predicateRef:ref('predicate','terminal'),evidenceContractRef:contract('evidence'),resultContractRef:contract('result'),refusalContractRef:contract('refusal'),refusalValueKind:'selection_refusal',judgmentContractRef:contract('judgment'),rejectionContractRef:contract('refusal'),transitionContractRef:contract('transition'),replayProjectionRef:ref('projection','replay'),terminalKind:'completed',closureScope:scope,eventKindRefs:['terminal_reached','frame_closed','graph_call_closed',...(scope === 'run' ? ['run_closed'] : [])]});
  const decl = {'abg.compute_regime':'F_D','abg.closure_contract':contract('closure-run'),'abg.child_closure_contract':contract('closure-graph_call'),'abg.evidence_contract':contract('evidence'),'abg.judgment_contract':contract('judgment'),'abg.judgment_predicate':ref('predicate','valid'),'abg.transition_contract':contract('transition'),'abg.functional_purpose':'Return the requested payload with the declared child identity.','abg.conditions_for_use':'The child input is a string payload admitted under child-input.'};
  const leaf = name => gtl.C.of({input:gtl.cCarrier(bindings.find(b=>b.bindingRef===ref('binding',name)).inputContractRef),output:gtl.cCarrier(bindings.find(b=>b.bindingRef===ref('binding',name)).outputContractRef),programLocusRef:ref('node',name),stageRole:name === 'select' ? 'evaluate':'result',fibre:'F_D',armId:ref('arm',name),compositionRef:null,vectorIndex:0,judgmentPredicateRef:ref('predicate','valid'),resultBearing:name !== 'select',requirement:{kind:'executable_leaf_requirement',implementationBindingRef:ref('binding',name),inputContractRef:contract(name==='select'?'request':'child-input'),outputContractRef:contract(name==='select'?'choice':'result'),evidenceContractRef:contract('evidence'),failureContractRef:contract('failure'),refusalContractRef:contract('refusal'),judgmentContractRef:contract('judgment')}});
  const graph = (name,input,nodes,edges,applications,terminals) => ({kind:'graph_function',name:ref('graph-function',name),version,environment:{requires:[input],provides:[contract('result')],carries:[input,contract('result'),contract('choice'),contract('child-input')]},inputs:[input],outputs:[contract('result')],template:{kind:'inline_graph',graphRef:ref('graph',name),startNodeRef:nodes[0].nodeRef,terminalNodeRefs:terminals,nodes,edges,applications},effects:[],declarations:decl,tags:[]});
  const children = ['A','B'].map(name=>graph(name,contract('child-input'),[{nodeRef:ref('node',name),nodeKind:'c_locus',term:leaf(name)}],[],[],[ref('node',name)]));
  const root = graph('root',contract('request'),[{nodeRef:ref('node','select'),nodeKind:'c_locus',term:leaf('select')},...children.map(child=>({nodeRef:ref('node',`call-${child.name.endsWith('/A@5')?'A':'B'}`),nodeKind:'c_locus',term:gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:child.name,input:gtl.cCarrier(contract('child-input')),output:gtl.cCarrier(contract('result'))}))}))],['A','B'].map(name=>gtl.graphEdge({fromNodeRef:ref('node','select'),toNodeRef:ref('node',`call-${name}`)})),[gtl.registeredSelectionApplication({sourceProgramLocusRef:ref('node','select'),inputContractRef:contract('choice'),outputContractRef:contract('child-input'),evaluatorRef:ref('evaluator','select'),ruleRef:ref('rule','select')})],['A','B'].map(name=>ref('node',`call-${name}`)));
  const program={kind:'gtl_program',programRef:ref('program','root'),version,moduleRef:ref('module','product'),starts:[{startRef:ref('start','root'),graphFunctionRef:root.name}],callableMembership:[root.name,...children.map(c=>c.name)],closureContractRef:contract('closure-run'),policies:{'abg.root_mode':'direct','abg.compute_regime':'F_D','abg.default_start_ref':ref('start','root')}};
  return {moduleRef:program.moduleRef,owningProductId:ref('product','product'),descriptorRef:ref('descriptor','product'),contributionManifestRef:ref('contribution-manifest','product'),productSemanticsBinding:{kind:'product_semantics_binding',bindingRef:SEMANTICS.bindingRef,packageName,packageVersion:version,modulePath:'build/index.js',namedSymbol:'SEMANTICS'},
    contracts:[['input','request','selection_request'],['input','child-input','selection_child_input'],['output','choice','registered_graph_choice'],['output','result','selection_result'],['evidence','evidence','deterministic_evidence_candidate'],...['failure','refusal','judgment','transition'].map(n=>[n,n,`selection_${n}`]),...['run','graph_call'].map(s=>['closure',`closure-${s}`,'selection_closure'])].map(([contractKind,name,valueKind])=>({contractRef:contract(name),contractVersion:version,contractKind,valueKind})),evaluators:[{name:ref('evaluator','select'),regime:'F_D',description:'Closed equality rule on the request choice.',binding:ref('implementation','select'),consumedFieldRefs:['$.choice','$.catalog'],tags:[]}],rules:[{name:ref('rule','select'),kind:'exact_choice',config:{},tags:[]}],implementationBindings:bindings,closureContracts:[closure('run'),closure('graph_call')],programs:[program],graphFunctions:[root,...children],contributions:[root,...children].map(g=>({handle:g.name,kind:'graph_function',declarationOrContractRef:g.name,owningProductId:ref('product','product'),programMembershipRefs:[program.programRef],readinessPrerequisiteRefs:[program.programRef],compatibilityRefs:['compatibility://abiogenesis/major/5']}))};
}
