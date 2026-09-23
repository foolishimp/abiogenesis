import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
import {isRecord} from '../../build/code/src/shared/admission_predicates.js';
import {isRawAdmittedValue} from '../../build/code/src/validator/raw_admission.js';
import {ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS as semantics} from '../../build/code/src/product/builtin_semantics.js';
const hash=product.sha256Canonical,root=new URL('../../',import.meta.url);
// Execute the complete production contract guard verbatim. Earlier/later owner,
// authority, prefix and event admission are outside this effect-free component
// discriminator; none are stubbed into a successful runtime admission.
function boundary(source){
 const start=source.indexOf('const inputContract = executionResolution.inputContract;'),end=source.indexOf('const request = requestBasis.family',start);
 assert(start>=0&&end>start,'exact production boundary markers required');
 const body=source.slice(start,end);
 assert(body.includes('inputOwnerMatches.length !== 1')&&body.includes('isRawAdmittedValue(input.rawInput)'));
 return new Function('input','executionResolution','canonicalJson','sha256Canonical','isRawAdmittedValue','isRecord','refusal',body+'\nreturn null;');
}
const source=readFileSync(new URL('build/code/src/abg/invocation_admission.js',root),'utf8'),guard=boundary(source);
const check=(f,fn=guard)=>fn(f.input,f.resolution,canonicalJson,hash,isRawAdmittedValue,isRecord,(code,message)=>({code,message}));
const artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:hash('component artifact'),productContentDigest:hash('component content'),productManifestDigest:hash('component manifest')};
const publication=gtl.constructWorksiteCommandExecutionModulePublication(artifact),ids=product.NATIVE_WORK_REACQUISITION_IDS;
function fixture(pub,value={kind:'native_worksite_command_reacquisition_request'}){
 const graph=pub.graphFunctions.find(g=>g.name===ids.graphFunctionRef),program=pub.programs.find(p=>p.programRef===ids.programRef);
 const inputContract=pub.contracts.find(c=>c.contractRef===graph.inputs[0]),outputContract=pub.contracts.find(c=>c.contractRef===graph.outputs[0]);
 const owner=c=>({declarationKind:'contract',declarationRef:c.contractRef,productId:pub.owningProductId,moduleRef:pub.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(pub)});
 const rawInput=validator.rawAdmitValue(value,'invocation_input',inputContract.contractRef);assert.equal(rawInput.kind,'raw_admitted_value');
 const resolution={catalogBasisDigest:hash('catalog'),catalogViewDigest:hash('view'),programRef:program.programRef,programDigest:hash(program),graphFunctionRef:graph.name,graphFunctionDigest:hash(graph),programValidationRef:'program-validation://component',inputContract,outputContract,inputContractDigest:hash(inputContract),outputContractDigest:hash(outputContract),inputContractOwner:owner(inputContract),outputContractOwner:owner(outputContract),declarationOwners:[owner(inputContract),owner(outputContract)]};
 const input={invocation:{catalogBasisDigest:resolution.catalogBasisDigest,programDigest:resolution.programDigest,graphFunctionDigest:resolution.graphFunctionDigest,inputContractRef:inputContract.contractRef,outputContractRef:outputContract.contractRef,rawInputAdmissionRef:rawInput.admissionRef,rawInputDigest:rawInput.subjectDigest},program,graphFunction:graph,catalogView:{viewDigest:resolution.catalogViewDigest},programValidation:{validationRef:resolution.programValidationRef},rawInput};
 return {input,resolution};
}
function withOutputKind(kind){
 const f=fixture(publication),contract={...f.resolution.outputContract,contractKind:kind};f.resolution={...f.resolution,outputContract:contract,outputContractDigest:hash(contract)};return f;
}
test('same published task is a lawful root output and unchanged C2 input; reserved contracts and crossed identities refuse',()=>{
 const raw=(value,kind)=>{const a=validator.rawAdmitValue(value,kind,'contract://component/'+kind);assert.equal(a.kind,'raw_admitted_value');return a;};
 const program=publication.programs.find(p=>p.programRef===ids.programRef),pubAdmission=raw(publication,'module_publication');
 const validation=validator.validateProgram({declarationBasisDigest:pubAdmission.subjectDigest,programPublication:pubAdmission,program:raw(program,'gtl_program'),graphFunctions:publication.graphFunctions.filter(g=>program.callableMembership.includes(g.name)).map(g=>raw(g,'graph_function')),contracts:publication.contracts.map(c=>raw(c,'contract_declaration')),evaluators:publication.evaluators,rules:publication.rules,implementationBindings:publication.implementationBindings.map(b=>raw(b,'implementation_binding')),closureContracts:publication.closureContracts.map(c=>raw(c,'closure_contract'))});
 assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
 const f=fixture(publication),task=publication.contracts.find(c=>c.contractRef===product.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef),c2=publication.graphFunctions.find(g=>g.name===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
 assert.equal(task.contractKind,'input');assert.equal(f.input.graphFunction.outputs[0],c2.inputs[0]);assert.equal(check(f),null);
 assert.equal(check(withOutputKind('output')),null,'existing output-contract path conserved');
 for(const kind of ['evidence','failure','refusal','judgment','transition','closure'])assert.equal(check(withOutputKind(kind)).code,'contract_mismatch',kind);
 const mutations=[
  g=>{g.input.graphFunction={...g.input.graphFunction,outputs:['contract://foreign']};},
  g=>{g.resolution={...g.resolution,outputContractDigest:hash('foreign')};},
  g=>{g.resolution={...g.resolution,declarationOwners:[g.resolution.inputContractOwner]};},
  g=>{g.resolution={...g.resolution,outputContractOwner:{...g.resolution.outputContractOwner,declarationRef:'contract://foreign'}};},
  g=>{g.input={...g.input,rawInput:{...g.input.rawInput}};},
  g=>{g.input.invocation={...g.input.invocation,rawInputDigest:hash('foreign')};},
 ];
 for(const mutate of mutations){const g=fixture(publication);mutate(g);assert.equal(check(g).code,'contract_mismatch');}
 assert.equal(check(fixture(publication,{kind:'wrong-value-kind'})).code,'contract_mismatch');
});
test('retained refused Public input crosses only the corrected production contract boundary',{skip:!process.env.ABG_REACQUISITION_ROOT_ACTUAL_REQUEST},t=>{
 const started=performance.now(),path=process.env.ABG_REACQUISITION_ROOT_ACTUAL_REQUEST,bytes=readFileSync(path),request=JSON.parse(bytes),call=request.invocation,value=call.invocation.request.input.value;
 const pub=call.resources.catalog.boundPublications.find(p=>p.graphFunctions.some(g=>g.name===ids.graphFunctionRef));assert(pub);
 const actualGraph=pub.graphFunctions.find(g=>g.name===ids.graphFunctionRef),currentGraph=publication.graphFunctions.find(g=>g.name===ids.graphFunctionRef);assert.deepEqual(actualGraph,currentGraph);
 for(const ref of [...actualGraph.inputs,...actualGraph.outputs])assert.deepEqual(pub.contracts.find(c=>c.contractRef===ref),publication.contracts.find(c=>c.contractRef===ref));
 assert.equal(product.isNativeWorksiteCommandReacquisitionRequest(value),true);assert(semantics.admitInput(ids.requestContractRef,value));
 const malformed={...value,currentContext:null};assert.equal(product.isNativeWorksiteCommandReacquisitionRequest(malformed),false);assert.equal(semantics.admitInput(ids.requestContractRef,malformed),null);
 const baseline=process.env.ABG_REACQUISITION_ROOT_BASELINE;assert(baseline,'exact baseline is required for the retained differential');
 const prior=boundary(readFileSync(join(baseline,'build/code/src/abg/invocation_admission.js'),'utf8')),f=fixture(pub,value);
 assert.equal(check(f,prior).code,'contract_mismatch');assert.equal(check(f),null);
 assert.equal(call.invocation.request.input.valueDigest,hash(value));
 t.diagnostic(JSON.stringify({requestSha256:product.sha256Bytes(bytes),inputDigest:hash(value),graphFunctionDigest:hash(actualGraph),inputContract:f.resolution.inputContract,outputContract:f.resolution.outputContract,baselineRefused:true,successorBoundaryPassed:true,malformedNativeInputRefused:true,elapsedMs:performance.now()-started,limits:'Verbatim production contract guard and actual Product input validation only. No original event/worksite read, environment reconstruction, full invocation admission, native call or execution.'}));
});
