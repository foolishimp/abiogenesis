import {declarations as baseDeclarations,ref,contract,hash,canonical,version,packageName} from './index.mjs';
export {ref,contract,hash};
const stateContract=contract('recursive-state');
const recordOK=value=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length>0&&
  Object.entries(value).every(([k,v])=>/^[A-Za-z][A-Za-z0-9_]*$/.test(k)&&typeof v==='string'&&!v.includes('\n'));
const equal=(a,b)=>canonical(a)===canonical(b);
const refs=x=>Array.isArray(x)&&x.length>0&&x.every(r=>typeof r==='string'&&r.length>0)&&new Set(x).size===x.length;
const representations=['json','labelled_lines'];
// Permitted renderers the caller admitted, in preference order, with their exact
// catalogue definition digests. A state without one selects nothing.
const catalogOK=c=>Array.isArray(c)&&c.length>0&&c.every(r=>r!==null&&typeof r==='object'&&Object.keys(r).sort().join(',')==='definitionDigest,graphFunctionRef,representation'&&
  typeof r.graphFunctionRef==='string'&&r.graphFunctionRef.length>0&&representations.includes(r.representation)&&/^sha256:[a-f0-9]{64}$/.test(r.definitionDigest))&&
  new Set(c.map(r=>r.graphFunctionRef)).size===c.length;

// Prospective controlled receiver: consume actual bytes using its fixed decoder.
// Its independently supplied documentation is deliberately inaccurate.
export function receive(rendered,expected){
  const decoded={};
  for(const line of rendered.split('\n')){
    const match=/^([A-Za-z][A-Za-z0-9_]*): (.*)$/.exec(line);
    if(!match||Object.hasOwn(decoded,match[1]))return {accepted:false,decodedRecord:null,diagnostic:'Receiver could not decode a unique labelled field in key: value format.'};
    decoded[match[1]]=match[2];
  }
  const accepted=equal(decoded,expected);
  return {accepted,decodedRecord:decoded,diagnostic:accepted?'Receiver decoded the exact supplied record.':'Decoded fields or values differ from the supplied record.'};
}
const render=(format,record)=>format==='json'?JSON.stringify(record):Object.entries(record).map(([k,v])=>`${k}: ${v}`).join('\n');
const measurement=(format,record)=>{
  const rendered=render(format,record),body={representation:format,rendered,...receive(rendered,record)};
  return {observationRef:ref('observation',hash(body).slice(7)),...body};
};
export function initialState(){
  const task={taskRef:ref('task','deliver-record'),text:'Deliver the supplied record in a representation accepted by the receiver, preserving every field name and value.',record:{service:'Atlas',status:'healthy'}};
  const requiredSupportRefs=[ref('support','receiver-accepts'),ref('support','record-preserved')];
  return {kind:'recursive_selection_state',schemaVersion:version,task,taskDigest:hash(task),requiredSupportRefs,
    observations:[{observationRef:ref('observation','receiver-documentation'),qualification:'Supplied receiver documentation, provisional until checked against the actual receiver.',value:'The receiver documentation advertises JSON object input. Actual acceptance has not yet been measured.'}],
    measurements:[],unresolvedSupportRefs:[...requiredSupportRefs],terminal:false};
}
export function validState(s){
  return s?.kind==='recursive_selection_state'&&s.schemaVersion===version&&recordOK(s.task?.record)&&typeof s.task.text==='string'&&
    typeof s.task.taskRef==='string'&&s.taskDigest===hash(s.task)&&refs(s.requiredSupportRefs)&&Array.isArray(s.unresolvedSupportRefs)&&
    (equal(s.unresolvedSupportRefs,s.requiredSupportRefs)||s.unresolvedSupportRefs.length===0)&&typeof s.terminal==='boolean'&&
    Array.isArray(s.observations)&&s.observations.length>0&&s.observations.every(o=>typeof o.observationRef==='string'&&typeof o.qualification==='string'&&Object.hasOwn(o,'value'))&&
    Array.isArray(s.measurements)&&s.measurements.every(m=>representations.includes(m.representation)&&equal(m,measurement(m.representation,s.task.record)))&&
    (s.catalog===undefined||catalogOK(s.catalog))&&
    (s.terminal?s.unresolvedSupportRefs.length===0&&s.measurements.at(-1)?.accepted===true:equal(s.unresolvedSupportRefs,s.requiredSupportRefs));
}
const requireState=s=>{if(!validState(s))throw new TypeError('missing or invalid recursive task/support/measurement state');return s;};
export function evaluatedState(input){
  const s=requireState(input),terminal=s.measurements.at(-1)?.accepted===true;
  return {...s,terminal,unresolvedSupportRefs:terminal?[]:[...s.requiredSupportRefs]};
}
export function selectionTask(input){
  const s=requireState(input);if(s.terminal||s.unresolvedSupportRefs.length===0)throw new TypeError('no unresolved parent task');
  return {kind:'recursive_selection_request',schemaVersion:version,
    task:s.task.text,observations:[...s.observations,{observationRef:ref('observation',s.taskDigest.slice(7)),qualification:'Original record and task identity retained from the admitted parent state.',value:s.task},
      ...s.measurements.map(m=>({observationRef:m.observationRef,qualification:'Actual retained receiver measurement produced by a completed child computation.',value:m}))],
    requiredSupportRefs:[...s.unresolvedSupportRefs],childInput:{contractRef:stateContract,value:s},catalog:s.catalog??[]};
}
const validRequest=v=>{try{return v?.kind==='recursive_selection_request'&&equal(v,selectionTask(v.childInput?.value));}catch{return false;}};
const measuredState=(input,format)=>{const s=requireState(input);if(s.terminal)throw new TypeError('parent already terminal');return {...s,measurements:[...s.measurements,measurement(format,s.task.record)]};};
export const bindings=['select','A','B','parent','prepare'].map(name=>({kind:'implementation_binding',bindingRef:ref('binding',name),implementationRef:ref('implementation',name),packageName,packageVersion:version,modulePath:'build/recursive.mjs',
  namedSymbol:({select:'select',A:'executeA',B:'executeB',parent:'evaluateParent',prepare:'prepareSelectionTask'})[name],computeRegime:'F_D',
  inputContractRef:name==='select'?contract('request'):stateContract,outputContractRef:name==='select'?contract('choice'):name==='prepare'?contract('request'):stateContract,
  failureContractRef:contract('failure'),refusalContractRef:contract('refusal')}));
const descriptor=binding=>{const {kind,bindingRef,...body}=binding;return {kind:'packaged_leaf_implementation_descriptor',schemaVersion:version,...body,descriptorDigest:hash(body)};};
export const SELECT_DESCRIPTOR=descriptor(bindings[0]),A_DESCRIPTOR=descriptor(bindings[1]),B_DESCRIPTOR=descriptor(bindings[2]),PARENT_DESCRIPTOR=descriptor(bindings[3]),PREPARE_DESCRIPTOR=descriptor(bindings[4]);
const realize=(name,input,resultCandidate)=>({kind:'leaf_realization_candidate',schemaVersion:version,disposition:'success',resultCandidate,
  evidenceCandidates:[{kind:'deterministic_evidence_candidate',schemaVersion:version,implementationRef:ref('implementation',name),inputDigest:hash(input),outputDigest:hash(resultCandidate)}]});
// Total F_D rule: the first permitted renderer whose representation has no
// rejected receiver measurement; a gap when none remains.
export function chooseRenderer(request){
  const rejected=request.observations.filter(o=>o.value?.accepted===false&&representations.includes(o.value.representation));
  const row=request.catalog.find(r=>!rejected.some(o=>o.value.representation===r.representation));
  const base={kind:'registered_graph_choice',schemaVersion:version,evidenceRefs:rejected.map(o=>o.observationRef)};
  return row===undefined
    ? {...base,disposition:'gap',reason:'No permitted renderer remains without a rejected receiver measurement.',missingSupportRefs:[...request.requiredSupportRefs]}
    : {...base,disposition:'selected',reason:'First permitted renderer without a rejected receiver measurement.',graphFunctionRef:row.graphFunctionRef,
      definitionDigest:row.definitionDigest,input:{contractRef:stateContract,value:request.childInput.value}};
}
export const select=input=>{if(!validRequest(input))throw new TypeError('invalid recursive selection request');return realize('select',input,chooseRenderer(input));};
export const executeA=input=>realize('A',input,measuredState(input,'json'));
export const executeB=input=>realize('B',input,measuredState(input,'labelled_lines'));
export const evaluateParent=input=>realize('parent',input,evaluatedState(input));
export const prepareSelectionTask=input=>realize('prepare',input,selectionTask(input));
export const SEMANTICS={kind:'product_semantics_provider',schemaVersion:version,bindingRef:ref('semantics','product'),packageName,packageVersion:version,
  admitInput(c,v){return c===stateContract&&validState(v)||c===contract('request')&&validRequest(v)?v:null;},
  validateContractValue(kind,v){if(kind==='recursive_selection_state')return validState(v);if(kind==='recursive_selection_request')return validRequest(v);return v?.kind===kind;},
  resolveJudgmentRelation(predicateRef){
    const name=['parent','prepare','A','B','valid','workflow'].find(n=>predicateRef===ref('predicate',n));if(!name)return null;
    return {predicateRef,advanceReasonRef:ref('reason','valid'),rejectionReasonRef:ref('reason','unresolved'),evaluate(input,output){
      try{return name==='valid'?output?.kind==='registered_graph_choice'&&output.disposition==='selected':equal(output,name==='parent'?evaluatedState(input):name==='prepare'?selectionTask(input):measuredState(input,name==='workflow'?output.measurements.at(-1).representation:name==='A'?'json':'labelled_lines'));}catch{return false;}
    }};
  },
};
export function declarations(gtl){
  const d=baseDeclarations(gtl),[root,A,B]=d.graphFunctions;
  d.implementationBindings=bindings;d.productSemanticsBinding.modulePath='build/recursive.mjs';
  for(const c of d.contracts)if(c.contractRef===contract('request'))c.valueKind='recursive_selection_request';
  d.contracts.push({contractRef:stateContract,contractVersion:version,contractKind:'input',valueKind:'recursive_selection_state'});
  d.evaluators[0]={...d.evaluators[0],description:'Closed rule: the first permitted renderer without a rejected receiver measurement.',consumedFieldRefs:['$.observations','$.catalog']};
  d.rules[0]={...d.rules[0],kind:'first_unrejected_renderer'};
  for(const closure of d.closureContracts)closure.resultContractRef=stateContract;
  const leaf=(name,compositionRef=null)=>{const b=bindings.find(b=>b.bindingRef===ref('binding',name));return gtl.C.of({input:gtl.cCarrier(b.inputContractRef),output:gtl.cCarrier(b.outputContractRef),programLocusRef:ref('node',name),stageRole:name==='parent'?'termination':name==='prepare'?'prepare':'result',fibre:'F_D',armId:ref('arm',name),compositionRef,vectorIndex:0,judgmentPredicateRef:ref('predicate',name),resultBearing:name!=='prepare',
    requirement:{kind:'executable_leaf_requirement',implementationBindingRef:b.bindingRef,inputContractRef:b.inputContractRef,outputContractRef:b.outputContractRef,evidenceContractRef:contract('evidence'),failureContractRef:b.failureContractRef,refusalContractRef:b.refusalContractRef,judgmentContractRef:contract('judgment')}});};
  for(const graph of [root,A,B]){
    graph.inputs=[stateContract];graph.outputs=[stateContract];graph.environment={requires:[stateContract],provides:[stateContract],carries:[stateContract,contract('request'),contract('choice')]};
    graph.declarations={...graph.declarations,'abg.closure_contract':contract('closure-graph_call')};
  }
  for(const [graph,name] of [[A,'A'],[B,'B']]){graph.template.nodes[0].term=leaf(name);graph.declarations['abg.judgment_predicate']=ref('predicate',name);}
  A.declarations['abg.functional_purpose']='Render the supplied record as compact JSON, submit those bytes to the controlled receiver decoder and return its actual acceptance or rejection measurement.';
  A.declarations['abg.conditions_for_use']='The recipient is expected to accept a JSON object. Input task, prior measurements and unresolved support are preserved; only the parent can certify task completion.';
  B.declarations['abg.functional_purpose']='Render the supplied record as labelled key: value lines, submit those bytes to the controlled receiver decoder and return its actual acceptance or rejection measurement.';
  B.declarations['abg.conditions_for_use']='The recipient is expected to accept labelled text lines. Input task, prior measurements and unresolved support are preserved; only the parent can certify task completion.';
  root.declarations={...root.declarations,'abg.judgment_predicate':ref('predicate','workflow'),
    'abg.functional_purpose':'Select one permitted record renderer by the declared rule and run it on the unchanged state.',
    'abg.conditions_for_use':'The state names its permitted renderers with their admitted definition digests; without them the selection is a gap.'};
  root.template.nodes.unshift({nodeRef:ref('node','prepare'),nodeKind:'c_locus',term:leaf('prepare')});root.template.startNodeRef=ref('node','prepare');
  root.template.edges.unshift(gtl.graphEdge({fromNodeRef:ref('node','prepare'),toNodeRef:ref('node','select')}));
  const {applicationRef:_old,kind:_kind,relationKind:_relation,...selection}=root.template.applications[0];
  root.template.applications=[gtl.registeredSelectionApplication({...selection,outputContractRef:stateContract})];
  for(const name of ['A','B'])root.template.nodes.find(n=>n.nodeRef===ref('node',`call-${name}`)).term=gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:ref('graph-function',name),input:gtl.cCarrier(stateContract),output:gtl.cCarrier(stateContract)}));
  d.evaluators.push({name:ref('evaluator','parent'),regime:'F_D',description:'Evaluate actual receiver acceptance and exact record preservation.',binding:ref('implementation','parent'),consumedFieldRefs:['$.terminal'],tags:[]});
  d.rules.push({name:ref('rule','parent'),kind:'boolean_field_termination',config:{fieldRef:'$.terminal',terminalValue:true},tags:[]});
  const application=gtl.recurseApplication({inputContractRef:stateContract,outputContractRef:stateContract,graphFunctionRef:root.name,terminationRuleRef:ref('rule','parent'),terminationEvaluatorRefs:[ref('evaluator','parent')],terminationFieldRef:'$.terminal',foldback:{mode:'rebind',binding:'$',requiresParentEvaluation:true},bound:3});
  const parent={...structuredClone(A),name:ref('graph-function','recursive-parent'),template:{kind:'inline_graph',graphRef:ref('graph','recursive-parent'),startNodeRef:ref('node','parent'),terminalNodeRefs:[ref('node','parent')],nodes:[{nodeRef:ref('node','parent'),nodeKind:'c_locus',term:leaf('parent',application.applicationRef)}],edges:[],applications:[application]},
    declarations:{...A.declarations,'abg.closure_contract':contract('closure-run'),'abg.judgment_predicate':ref('predicate','parent'),'abg.functional_purpose':'Preserve the original delivery obligation until explicit receiver acceptance and record-equality evaluation passes.'}};
  d.graphFunctions.push(parent);d.programs[0].starts[0].graphFunctionRef=parent.name;d.programs[0].callableMembership.push(parent.name);
  d.contributions.push({...d.contributions[0],handle:parent.name,declarationOrContractRef:parent.name});return d;
}
