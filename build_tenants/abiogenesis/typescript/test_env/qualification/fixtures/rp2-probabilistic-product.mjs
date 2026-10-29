// Installed as index.js with the original registered-selection fixture in base.js.
export * from './base.js';
import * as base from './base.js';
const deepFreeze=value=>{if(value!==null&&typeof value==='object'){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
const {ref,contract,hash,version}=base;
const {kind:_kind,bindingRef:_ref,...binding}=base.bindings[1];
const descriptor={...binding,computeRegime:'F_P'};
export const A_DESCRIPTOR={kind:'packaged_leaf_implementation_descriptor',schemaVersion:version,...descriptor,descriptorDigest:hash(descriptor)};
export function executeA(input){
  const result={kind:'selection_result',schemaVersion:version,child:'A',payload:input.payload};
  return deepFreeze({kind:'prepared_probabilistic_leaf_invocation',schemaVersion:version,
    workerRequest:{actorRef:ref('actor','rp2'),workerBindingRef:ref('worker-binding','rp2'),implementationRef:ref('implementation','A'),inputDigest:hash(input),
      materializationPlanRef:ref('materialization-plan','rp2'),rendererRef:ref('renderer','rp2'),instructionContractRef:contract('child-input'),resultContractRef:contract('result'),
      transportLane:'closed_prompt_proof',prompt:'Return the declared result.\n'+JSON.stringify(result),responseJsonSchema:{type:'object',additionalProperties:false,required:Object.keys(result),
        properties:Object.fromEntries(Object.entries(result).map(([key,value])=>[key,{const:value}]))}},
    complete(exchange){
      const actual=JSON.parse(exchange.observation.finalOutput);
      if(exchange.observation.disposition!=='success'||hash(actual)!==hash(result))throw new TypeError('same-contract worker result required');
      return {kind:'leaf_realization_candidate',schemaVersion:version,disposition:'success',evidenceCandidates:[],resultCandidate:actual};
    }});
}
