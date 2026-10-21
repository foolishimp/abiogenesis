import {createHash} from 'node:crypto';
import {STRUCTURAL_FIXTURE_OWNER as owner,LEAF_SPECS,contractKinds,FP_IDS,WORKER_EXPECTED_PAYLOAD,GATE_IDS,RECURSION_IDS,FAN_OUT_IDS} from './program.mjs';
const canonical=value=>Array.isArray(value)?`[${value.map(canonical).join(',')}]`:value!==null&&typeof value==='object'?`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`:JSON.stringify(value);
const hash=value=>'sha256:'+createHash('sha256').update(canonical(value)).digest('hex');
const descriptor=symbol=>{const s=LEAF_SPECS[symbol],body={implementationRef:s.ids.implementationRef,packageName:owner.packageName,packageVersion:owner.packageVersion,modulePath:'build/leaf.mjs',namedSymbol:symbol,computeRegime:s.regime??'F_D',inputContractRef:s.input,outputContractRef:s.output,failureContractRef:s.ids.failureContractRef,refusalContractRef:s.ids.refusalContractRef};return Object.freeze({kind:'packaged_leaf_implementation_descriptor',schemaVersion:'5.0.0',descriptorDigest:hash(body),...body});};
export const ATOMIC_DESCRIPTOR=descriptor('atomic'),NORMALIZE_DESCRIPTOR=descriptor('normalize'),PASS_DESCRIPTOR=descriptor('pass'),PROJECT_DESCRIPTOR=descriptor('project'),GATE_DESCRIPTOR=descriptor('gate'),GATE_TARGET_DESCRIPTOR=descriptor('gateTarget'),RECURSION_EVALUATE_DESCRIPTOR=descriptor('recursionEvaluate'),RECURSION_STEP_DESCRIPTOR=descriptor('recursionStep'),ELEMENT_DESCRIPTOR=descriptor('element'),REDUCE_DESCRIPTOR=descriptor('reduce'),WORKER_DESCRIPTOR=descriptor('worker'),WORKER_DETERMINISTIC_DESCRIPTOR=descriptor('workerDeterministic'),WORKER_PASS_DESCRIPTOR=descriptor('workerPass');
const candidate=(symbol,input,resultCandidate,failed=false)=>Object.freeze({kind:'leaf_realization_candidate',schemaVersion:'5.0.0',disposition:failed?'failure':'success',resultCandidate,evidenceCandidates:[{kind:'deterministic_evidence_candidate',schemaVersion:'5.0.0',implementationRef:LEAF_SPECS[symbol].ids.implementationRef,inputDigest:hash(input),outputDigest:hash(resultCandidate)}],...(failed?{diagnosticRef:'diagnostic://abi5-tests/structural/blocked'}:{})});
const value=(kind,fields)=>({kind,schemaVersion:'5.0.0',...fields});
export const atomic=input=>candidate('atomic',input,value('data_output',{message:input.subject}));
export const normalize=input=>candidate('normalize',input,value('normalized_data',{subject:input.subject.trim()}));
export const pass=input=>candidate('pass',input,{...input});
export const project=input=>candidate('project',input,value('data_output',{message:input.subject}));
export const gate=input=>candidate('gate',input,{...input});
export const gateTarget=input=>candidate('gateTarget',input,value('data_output',{message:input.subject}));
export const recursionEvaluate=input=>candidate('recursionEvaluate',input,{...input,terminal:input.remaining===0});
export const recursionStep=input=>input.blockedChildRemaining===input.remaining?candidate('recursionStep',input,value('structural_failure',{diagnosticRef:'diagnostic://abi5-tests/structural/blocked'}),true):candidate('recursionStep',input,{...input,remaining:input.remaining-1,terminal:input.remaining===1,trace:[...input.trace,input.remaining-1]});
export const element=input=>input.block?candidate('element',input,value('structural_failure',{diagnosticRef:'diagnostic://abi5-tests/structural/blocked'}),true):candidate('element',input,value('member_output',{subject:input.subject,message:input.subject}));
export const reduce=input=>candidate('reduce',input,value('member_summary',{count:input.members.length,messages:input.members.map(x=>x.value.message)}));
export const workerDeterministic=input=>candidate('workerDeterministic',input,value('worker_output',{resultContractRef:input.resultContractRef,actorRef:input.workerActorRef,message:input.subject}));
export const workerPass=input=>candidate('workerPass',input,{...input});
export function worker(input){
 const responseJsonSchema={type:'object',additionalProperties:false,required:['kind','schemaVersion','resultContractRef','actorRef','message'],properties:{kind:{const:'worker_output'},schemaVersion:{const:'5.0.0'},resultContractRef:{const:FP_IDS.outputContractRef},actorRef:{const:FP_IDS.workerActorRef},message:{const:WORKER_EXPECTED_PAYLOAD}}};
 const workerRequest={actorRef:input.workerActorRef,workerBindingRef:input.workerBindingRef,implementationRef:FP_IDS.implementationRef,inputDigest:hash(input),materializationPlanRef:input.materializationPlanRef,rendererRef:input.rendererRef,instructionContractRef:input.instructionContractRef,resultContractRef:input.resultContractRef,transportLane:input.transportLane,prompt:`Independent structural worker fixture\nSubject: ${JSON.stringify(input.subject)}\nInstruction: ${input.instruction}`,responseJsonSchema};
 return {kind:'prepared_probabilistic_leaf_invocation',schemaVersion:'5.0.0',workerRequest,complete(exchange){const transport=exchange.observation;let output;try{output=JSON.parse(transport.finalOutput);}catch{output=value('malformed_worker_output',{rawOutputDigest:hash(transport.finalOutput)});}const salvaged=transport.disposition==='failure'&&transport.failureClass==='transport_failure'&&valid('worker_output',output);const success=transport.disposition==='success'||salvaged;const diagnosticRef=success?null:`diagnostic://abiogenesis/transport/${(transport.failureClass??'transport_failure').replaceAll('_','-')}@5`;return {kind:'leaf_realization_candidate',schemaVersion:'5.0.0',disposition:success?'success':'failure',evidenceCandidates:[],resultCandidate:success?output:value('structural_failure',{failureClass:transport.failureClass??'transport_failure',diagnosticRef}),...(diagnosticRef?{diagnosticRef}:{})};}};
}
const keys=(v,wanted)=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join('\0')===[...wanted].sort().join('\0');
function valid(kind,v){
 if(v===null||typeof v!=='object'||Array.isArray(v)||v.kind!==kind||v.schemaVersion!=='5.0.0')return false;
 if(['data_input','normalized_data'].includes(kind))return keys(v,['kind','schemaVersion','subject'])&&typeof v.subject==='string';
 if(kind==='data_output')return keys(v,['kind','schemaVersion','message'])&&typeof v.message==='string';
 if(kind==='worker_instruction')return keys(v,['kind','schemaVersion','materializationPlanRef','rendererRef','instructionContractRef','resultContractRef','workerActorRef','workerBindingRef','transportLane','subject','instruction'])&&v.instructionContractRef===FP_IDS.inputContractRef&&v.resultContractRef===FP_IDS.outputContractRef&&v.workerActorRef===FP_IDS.workerActorRef&&v.workerBindingRef===FP_IDS.workerBindingRef&&['closed_prompt_proof','worker_executes'].includes(v.transportLane)&&typeof v.subject==='string'&&typeof v.instruction==='string';
 // The closed test fixture declares a fixed payload, independent of ABG meaning.
 if(kind==='worker_output')return keys(v,['kind','schemaVersion','resultContractRef','actorRef','message'])&&v.resultContractRef===FP_IDS.outputContractRef&&v.actorRef===FP_IDS.workerActorRef&&v.message===WORKER_EXPECTED_PAYLOAD;
 if(kind==='recursion_state')return keys(v,['kind','schemaVersion','blockedChildRemaining','remaining','terminal','trace'])&&Number.isSafeInteger(v.remaining)&&v.remaining>=0&&typeof v.terminal==='boolean'&&Array.isArray(v.trace)&&v.trace.every(Number.isSafeInteger);
 if(kind==='member_input')return keys(v,['kind','schemaVersion','subject','block'])&&typeof v.subject==='string'&&typeof v.block==='boolean';
 if(kind==='member_output')return keys(v,['kind','schemaVersion','subject','message'])&&typeof v.subject==='string'&&typeof v.message==='string';
 if(kind==='member_vector_input')return keys(v,['kind','schemaVersion','members'])&&v.members.every((row,index)=>row.ordinal===index&&typeof row.memberRef==='string'&&valid('member_input',row.value));
 if(kind==='gtl_fan_out_vector')return typeof v.applicationRef==='string'&&Array.isArray(v.members)&&v.members.every(row=>valid('member_output',row.value));
 if(kind==='member_summary')return keys(v,['kind','schemaVersion','count','messages'])&&Number.isSafeInteger(v.count)&&Array.isArray(v.messages)&&v.messages.every(x=>typeof x==='string');
 if(kind==='deterministic_evidence_candidate')return keys(v,['kind','schemaVersion','implementationRef','inputDigest','outputDigest'])&&Object.values(LEAF_SPECS).some(s=>s.ids.implementationRef===v.implementationRef)&&/^sha256:[0-9a-f]{64}$/u.test(v.inputDigest)&&/^sha256:[0-9a-f]{64}$/u.test(v.outputDigest);
 if(['structural_failure','structural_refusal'].includes(kind))return typeof v.diagnosticRef==='string';
 return false;
}
const relation=(input,output)=>{
 if(input?.kind==='data_input'&&output?.kind==='normalized_data')return output.subject===input.subject.trim();
 if(input?.kind==='normalized_data'&&output?.kind==='normalized_data')return output.subject===input.subject;
 if(['data_input','normalized_data'].includes(input?.kind)&&output?.kind==='data_output')return output.message===input.subject.trim();
 if(input?.kind==='data_input'&&output?.kind==='data_input')return input.subject!=='Blocked'&&output.subject===input.subject;
 if(input?.kind==='recursion_state'&&output?.kind==='recursion_state')return valid('recursion_state',output);
 if(input?.kind==='member_input'&&output?.kind==='member_output')return !input.block&&output.message===input.subject;
 if(input?.kind==='gtl_fan_out_vector'&&output?.kind==='member_summary')return output.count===input.members.length&&output.messages.join('\0')===input.members.map(row=>row.value.message).join('\0');
 if(input?.kind==='worker_instruction'&&output?.kind==='worker_output')return valid('worker_output',output)&&output.message===input.subject;
 if(input?.kind==='worker_output'&&output?.kind==='worker_output')return canonical(input)===canonical(output);
 return false;
};
export const semantics=Object.freeze({kind:'product_semantics_provider',schemaVersion:'5.0.0',bindingRef:'product-semantics://abi5-tests/structural/mechanics@5',packageName:owner.packageName,packageVersion:owner.packageVersion,admitInput(contractRef,v){return valid(contractKinds[contractRef],v)?Object.freeze({...v}):null;},evaluateInteractionResponse(){return null;},validateContractValue:valid,resolveJudgmentRelation(predicateRef){return predicateRef.startsWith('predicate://abi5-tests/structural/')?{predicateRef,advanceReasonRef:'reason://abi5-tests/structural/valid',rejectionReasonRef:'reason://abi5-tests/structural/blocked',evaluate:relation}:null;},resolveProbabilisticWorkerContracts({input}){return input.kind==='worker_instruction'?{instructionContractRef:input.instructionContractRef,resultContractRef:input.resultContractRef}:null;}});
