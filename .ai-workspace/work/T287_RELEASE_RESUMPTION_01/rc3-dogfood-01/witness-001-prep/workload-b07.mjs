import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {assessmentSelection} from './consumer-b07.mjs';
export async function witnessInput(product,root){
 const paths=['task.md','rubric.json','fixture.txt'],files=await Promise.all(paths.map(p=>readFile(join(root,p))));
 assert.equal(product.sha256Bytes(files[2]),'sha256:bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6');assert.equal(files[2].length,4616);
 const task=files[0].toString('utf8'),commandId='command://abi5-tests/gc03-witness/current-fixture';
 const order={outcome:task,instructions:['Preserve every W1-W5 criterion in rubric.json. Testing must measure supplied fixture.txt with subjectEvidenceRef null before Construction; Construction must use the actual installed governed client and its owner-supplied keys, including one denied key. Retain honest gaps; do not treat parent bound exhaustion as UAT.'],readFirst:['task.md','rubric.json'],writeRoots:[],checks:[]};
 return product.constructGovernanceWorkState({taskRef:'task://abi5-tests/gc03-witness/original@5',task,sources:paths.map((path,i)=>({path,digest:product.sha256Bytes(files[i])})),
 requiredSupportRefs:['support://abi5-tests/gc03-witness/W1-W5@5'],authorityRefs:['authority://abi5-tests/gc03-witness/owner-selected@5'],readRoots:paths,maxContextFiles:8,maxContextBytes:65536,maxPromptBytes:1048576,
 workOrders:{testing:order,construction:order,uat:order},testing:{selectedPaths:paths,commands:[{commandId,executable:'/bin/cat',args:['fixture.txt'],relativeCwd:'.',environment:{},timeoutMs:10000,terminationGraceMs:1000,expectedReports:[]}],
 outcomePredicates:[{predicateId:'predicate://abi5-tests/gc03-witness/exact-fixture@5',predicateKind:'stdout_exact',declaration:{validationCommandId:commandId,equals:files[2].toString('utf8')}}],allowedWriteTerritories:[]},
 assessment:{sources:['task.md'],candidatePath:'fixture.txt',rubricPath:'rubric.json',...assessmentSelection}});
}
