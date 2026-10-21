import { isNativeRegisteredSelectionTask,isNativeRegisteredSelectionResponse,materializeNativeRegisteredChoice } from '@abiogenesis/typescript-tenant/product';
import { declarations as baseDeclarations,bindings as baseBindings,hash,ref,contract,version,packageName } from './index.mjs';
export {ref,contract,version,packageName};
export const bindings=baseBindings.map(binding=>({...binding,modulePath:'build/native.mjs',computeRegime:binding.bindingRef===ref('binding','select')?'F_P':'F_D'}));
const descriptor=binding=>{const {kind,bindingRef,...body}=binding;return {kind:'packaged_leaf_implementation_descriptor',schemaVersion:version,...body,descriptorDigest:hash(body)};};
export const SELECT_DESCRIPTOR=descriptor(bindings[0]),A_DESCRIPTOR=descriptor(bindings[1]),B_DESCRIPTOR=descriptor(bindings[2]);
const realize=(name,input,resultCandidate)=>({kind:'leaf_realization_candidate',schemaVersion:version,disposition:'success',resultCandidate,
  evidenceCandidates:name==='select'?[]:[{kind:'deterministic_evidence_candidate',schemaVersion:version,implementationRef:ref('implementation',name),inputDigest:hash(input),outputDigest:hash(resultCandidate)}]});
export function select(input,occurrence,prepareAssembly) {
  const assembly=prepareAssembly();
  return Object.freeze({kind:'prepared_probabilistic_leaf_invocation',schemaVersion:version,workerRequest:assembly.request,
    complete(exchange){
      const o=exchange.observation;
      if(hash(exchange.request)!==hash(assembly.request)||o.disposition!=='success'||o.toolCallCount!==0||
        o.promptDigest!==assembly.manifest.promptDigest||o.inputDigest!==hash(input)||o.implementationRef!==ref('implementation','select')) throw new Error('native exchange differs from prepared selection');
      const choice=materializeNativeRegisteredChoice(input,assembly.envelope.targetBindings,JSON.parse(o.finalOutput));
      if(choice===null) throw new Error('native choice binding refused');
      return realize('select',input,choice);
    }});
}
const validChild=x=>x?.kind==='selection_record_input'&&x.record!==null&&typeof x.record==='object'&&!Array.isArray(x.record)&&
  Object.values(x.record).every(v=>typeof v==='string')&&Object.keys(x).sort().join(',')==='kind,record';
export const executeA=input=>realize('A',input,{kind:'selection_rendered_record',schemaVersion:version,child:'A',rendered:JSON.stringify(input.record)});
export const executeB=input=>realize('B',input,{kind:'selection_rendered_record',schemaVersion:version,child:'B',rendered:Object.entries(input.record).map(([k,v])=>`${k}: ${v}`).join('\n')});
export const SEMANTICS={kind:'product_semantics_provider',schemaVersion:version,bindingRef:ref('semantics','product'),packageName,packageVersion:version,
  admitInput(contractRef,value){return contractRef===contract('request')&&isNativeRegisteredSelectionTask(value)||contractRef===contract('child-input')&&validChild(value)?value:null;},
  evaluateInteractionResponse(){return null;},
  resolveProbabilisticWorkerContracts(basis){return {instructionContractRef:basis.inputContractRef,resultContractRef:contract('native-response')};},
  validateContractValue(kind,value){
    if(kind==='registered_selection_task')return isNativeRegisteredSelectionTask(value);
    if(kind==='registered_selection_response')return isNativeRegisteredSelectionResponse(value);
    if(kind==='selection_record_input')return validChild(value);
    if(kind==='selection_rendered_record')return value?.kind===kind&&['A','B'].includes(value.child)&&typeof value.rendered==='string';
    return value?.kind===kind;
  },
  resolveJudgmentRelation(predicateRef){return predicateRef!==ref('predicate','valid')?null:{predicateRef,advanceReasonRef:ref('reason','valid'),rejectionReasonRef:ref('reason','unresolved'),
    evaluate:(input,output)=>output?.kind==='registered_graph_choice'?output.disposition==='selected':output?.kind==='selection_rendered_record'&&
      output.rendered===(output.child==='A'?JSON.stringify(input.record):Object.entries(input.record).map(([k,v])=>`${k}: ${v}`).join('\n'))};},
};
export function declarations(gtl,runEnvironment){
  const d=baseDeclarations(gtl);d.implementationBindings=bindings;
  d.productSemanticsBinding.modulePath='build/native.mjs';
  for(const c of d.contracts){if(c.contractRef===contract('request'))c.valueKind='registered_selection_task';if(c.contractRef===contract('child-input'))c.valueKind='selection_record_input';if(c.contractRef===contract('result'))c.valueKind='selection_rendered_record';}
  d.contracts.push({contractRef:contract('native-response'),contractVersion:version,contractKind:'output',valueKind:'registered_selection_response'});
  d.evaluators[0]={...d.evaluators[0],regime:'F_P',description:'Judge suitability from declared purposes and current supplied task facts.',consumedFieldRefs:['$.task','$.observations']};
  d.rules[0]={...d.rules[0],kind:'framed_suitability',config:{policyRef:runEnvironment.roles[0].policy.policyRef}};
  const root=d.graphFunctions[0];root.template.nodes[0].term={...root.template.nodes[0].term,fibre:'F_P'};
  root.declarations={...root.declarations,'abg.compute_regime':'F_P','abg.raw_result_contract':contract('native-response'),'abg.functional_purpose':'Select a suitable permitted record renderer under the declared Executive frame.','abg.conditions_for_use':'Current supplied task facts and common record input are available; preserve a gap if no registered capability suffices.'};
  d.graphFunctions[1].declarations={...d.graphFunctions[1].declarations,'abg.functional_purpose':'Render the supplied record as compact JSON for machine consumption.','abg.conditions_for_use':'The recipient needs structured JSON; output is ordinary unsigned text, with no cryptographic signing or external effects.'};
  d.graphFunctions[2].declarations={...d.graphFunctions[2].declarations,'abg.functional_purpose':'Render the supplied record as readable labelled lines for a human reader.','abg.conditions_for_use':'The recipient needs a simple human-readable record; output is ordinary unsigned text, with no cryptographic signing or external effects.'};
  d.programs[0].policies={...d.programs[0].policies,'abg.compute_regime':'F_P','abg.run_environment':runEnvironment.declarationRef};
  d.runEnvironments=[runEnvironment];return d;
}
