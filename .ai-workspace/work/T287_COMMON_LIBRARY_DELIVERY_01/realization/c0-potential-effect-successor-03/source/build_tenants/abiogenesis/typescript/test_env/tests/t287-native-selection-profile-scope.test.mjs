import assert from 'node:assert/strict';
import test from 'node:test';
import * as gtl from '../../build/code/src/gtl/index.js';
import {sha256Bytes,sha256Canonical} from '../../build/code/src/shared/digests.js';
import {registeredSelectionNativeRole} from '../../build/code/src/gtl/stdo_run_environment.js';
import {registeredSelectionInstructionResultMatches,evaluateRegisteredSelectionInstructionAssembly,requireDeclaredNativeInstructionAssembly} from '../../build/code/src/abg/instruction_assembly.js';
import {declarations,ref,contract} from '../fixtures/registered-selection-product/index.mjs';

// Controlled applicability checks at the actual ABG profile guard, not a
// fabricated actor/result admission. Existing native proof owns that relation.
function fixture(selected=false){
  const publication=declarations(gtl),graph=publication.graphFunctions[0],program=publication.programs[0];
  graph.template.nodes[0].term={...graph.template.nodes[0].term,fibre:'F_P'};
  const text='Apply the declared selector frame.',bytes=Buffer.from(text),digest=sha256Bytes(bytes);
  const member={path:'frame.txt',type:'file',digest,target:null},contextMember={memberRef:'member:scope',path:member.path,byteCount:bytes.length,digest};
  const role={graphFunctionRef:graph.name,programLocusRef:ref('node','select'),role:'selector',frameRefs:['frame:scope'],
    policy:{policyRef:'policy:scope',text,digest},contextPolicy:{policyRef:'policy:context',selectors:['full_source','active_binding_semantics']},accessRefs:[],
    sourceBindings:[{contextRef:'context:scope',memberRef:contextMember.memberRef,memberDigest:digest,startByte:0,endByte:bytes.length,spanDigest:digest}]};
  publication.runEnvironments=[gtl.constructRunEnvironmentDeclaration({kind:'run_environment_declaration',schemaVersion:'5.0.0',declarationRef:'environment:scope',
    dependencies:[{dependencyRef:'dependency:scope',basisRef:'generic://scope/',recordRef:'record:scope',recordDigest:digest,recordFormat:'member_inventory@1',inventoryDigest:gtl.stdoInventoryDigest([member]),members:[member]}],
    contexts:[{contextRef:'context:scope',sourceLocator:'generic://scope/',inventoryDigest:sha256Canonical([contextMember]),members:[contextMember]}],corpusAccess:null,accesses:[],roles:[role]})];
  if(selected)program.policies['abg.run_environment']='environment:scope';
  const candidate={publication,graphFunction:graph,executionBasis:{programRef:program.programRef},cCall:{programLocusRef:role.programLocusRef}};
  return {publication,graph,program,role,candidate};
}
const ownInput={kind:'consumer_specific_task',instruction:'Use the declared consumer F_P contract'};
const ownChoice={kind:'registered_graph_choice',schemaVersion:'5.0.0',disposition:'selected',reason:'Own probabilistic result contract',evidenceRefs:[],
  graphFunctionRef:ref('graph-function','A'),definitionDigest:'sha256:'+'a'.repeat(64),input:{contractRef:contract('child-input'),value:{kind:'consumer_specific_child',value:17}}};

test('generic registered F_P keeps its own task/raw contract when the profile is unselected',()=>{
  const f=fixture();
  assert.equal(gtl.isRegisteredGraphChoice(ownChoice),true);
  assert.equal(registeredSelectionNativeRole(f.publication,f.candidate.executionBasis.programRef,f.graph,f.role.programLocusRef),null);
  assert.equal(registeredSelectionInstructionResultMatches(f.candidate,ownInput,ownChoice),true);
  assert.equal(registeredSelectionInstructionResultMatches(f.candidate,{kind:'registered_selection_task'},ownChoice),true,'payload resemblance does not activate the profile');
});

test('selected exact role requires runtime correspondence and cannot fall back on another input shape',()=>{
  const f=fixture(true);
  assert.deepEqual(registeredSelectionNativeRole(f.publication,f.candidate.executionBasis.programRef,f.graph,f.role.programLocusRef),f.role);
  for(const input of [ownInput,{kind:'registered_selection_task'},null])assert.equal(registeredSelectionInstructionResultMatches(f.candidate,input,ownChoice),false);
  assert.equal(evaluateRegisteredSelectionInstructionAssembly(f.candidate,ownInput).cause,'stale_basis','selected role without admitted native basis refuses');
});

test('missing or misbound selected environment refuses at preparation and result guard',()=>{
  for(const mutate of [
    f=>{f.publication.runEnvironments=[];},
    f=>{f.publication.runEnvironments=structuredClone(f.publication.runEnvironments);f.publication.runEnvironments[0].roles[0].graphFunctionRef=ref('graph-function','B');},
    f=>{f.publication.runEnvironments=structuredClone(f.publication.runEnvironments);f.publication.runEnvironments[0].roles[0].role='assessor';},
    f=>{f.graph.template.applications=[{...f.graph.template.applications[0],inputContractRef:"contract:wrong-choice"}];},
    f=>{f.publication.programs=[];},
    f=>{f.candidate.publication=undefined;},
  ]){
    const f=fixture(true);mutate(f);
    assert.equal(registeredSelectionNativeRole(f.candidate.publication,f.candidate.executionBasis.programRef,f.graph,f.role.programLocusRef),false);
    assert.equal(registeredSelectionInstructionResultMatches(f.candidate,ownInput,ownChoice),false);
    assert.equal(evaluateRegisteredSelectionInstructionAssembly(f.candidate,ownInput).cause,'unknown_dependency');
    assert.throws(()=>requireDeclaredNativeInstructionAssembly(f.candidate,ownInput),/unknown_dependency/);
  }
});

test('an unrelated locus remains outside this profile even with choice-shaped data',()=>{
  const f=fixture(true);f.graph.template.applications=[];
  assert.equal(registeredSelectionNativeRole(f.publication,f.candidate.executionBasis.programRef,f.graph,f.role.programLocusRef),null);
  assert.equal(registeredSelectionInstructionResultMatches(f.candidate,ownChoice,ownChoice),true);
});
