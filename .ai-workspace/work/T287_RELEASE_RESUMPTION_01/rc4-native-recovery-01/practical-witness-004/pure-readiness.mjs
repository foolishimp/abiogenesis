// Pure readiness only: no setup/install/build/Public/Runtime/store/provider calls.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
import {dualEntryConsumerDeclaration} from './operator.mjs';
import {libraryEnvironment,libraryConsumerDeclaration,witnessRef} from './operator-assets/test_env/support/default-library.mjs';
const D=dirname(fileURLToPath(import.meta.url));
const old=join(D,'../practical-witness-003'),host=join(old,'setup-host/abi5-root-env-wz1KCc');
const root=join(D,'node_modules/@abiogenesis/typescript-tenant');
const hash=b=>createHash('sha256').update(b).digest('hex');
const pin=p=>{const b=fs.readFileSync(p);return{path:p,bytes:b.length,sha256:hash(b)}};
const custody=JSON.parse(fs.readFileSync(join(D,'CANDIDATE_CUSTODY.json'),'utf8'));
for(const r of custody.allArchiveMembers){const p=join(root,r.path),st=fs.lstatSync(p);assert(st.isFile()&&!st.isSymbolicLink());const b=fs.readFileSync(p);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256);}
const logPath=join(host,'runtime/events.jsonl'),dataPath=join(host,'consumer-additional-0/node_modules/@abiogenesis-fixtures/registered-selection/build/publication.json');
assert.equal(pin(logPath).sha256,'897116a18650b7f412cb8c95351c5085e9f54fbf7043bff7e8cfa1c831492d7e');
assert.equal(pin(dataPath).sha256,'9b0cc946c4973717224fd58d4aa5c2a236e30bb3e0857210a14aec170499c3ec');
const load=p=>import(pathToFileURL(join(root,'build/code/src',p+'.js')).href);
const validator=await load('validator/index'),gtl=await load('gtl/index'),d=await load('shared/digests'),start=await load('gtl/public_start'),product=await load('product/index');
const events=fs.readFileSync(logPath,'utf8').trim().split('\n').map(JSON.parse),lock=events.find(e=>e.payload.resolvedLock).payload.resolvedLock;
const core=lock.rows.find(x=>x.packageName==='@abiogenesis/typescript-tenant'),fixture=lock.rows.find(x=>x.packageName==='@abiogenesis-fixtures/registered-selection');assert(core&&fixture);
const basis={...core,productManifestDigest:core.manifestDigest};
const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
const environment=await libraryEnvironment({gtl,product,packageRoot:root});
const original=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const data=dualEntryConsumerDeclaration({gtl,library,runEnvironment:environment.declaration,libraryConsumerDeclaration,witnessRef});
const expected='sha256:c1e559fb34c282f941f2a59b9bd0108f7604e60bc5c719a2d4f152b2989df5e7';assert.equal(d.sha256Canonical(data),expected);
const comparison=structuredClone(original),b=comparison.graphFunctions.find(g=>g.name===witnessRef('graph-function','executive-b')),node=b.template.nodes[0],term=node.term,locus='node://default-library-witness/executive-b-parent@5';
node.nodeRef=locus;node.term=gtl.C.of({...term,input:gtl.cCarrier(term.inputCarrierRef),output:gtl.cCarrier(term.outputCarrierRef),programLocusRef:locus,armId:locus+'/arm'});b.template.startNodeRef=locus;b.template.terminalNodeRefs=[locus];assert.deepEqual(data,comparison,'Only selected paired B locus changes');
const unique=(values,key)=>{const m=new Map();for(const v of values){const old=m.get(v[key]);if(old)assert.equal(d.sha256Canonical(old),d.sha256Canonical(v),'unequal declaration '+key+' '+v[key]);m.set(v[key],v)}return[...m.values()]};
const raw=(v,kind,suffix)=>{const x=validator.rawAdmitValue(v,kind,'contract://abiogenesis/gtl/'+suffix+'@5');assert.equal(x.kind,'raw_admitted_value');return x};
function validate(declaration){
 // Retained003 identity is used only for a counterfactual static subject, never asserted as new installed artifact truth.
 const consumer=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...declaration,artifactDigest:fixture.artifactDigest,productContentDigest:fixture.productContentDigest,productManifestDigest:fixture.manifestDigest,contributions:declaration.contributions.map(c=>({...c,provenanceRefs:[fixture.artifactDigest,fixture.manifestDigest]}))});
 const pubs=[gtl.constructWorksiteConstructionModulePublication(basis),library,gtl.constructNativeWorkspaceWorkModulePublication(basis),gtl.constructWorksiteCommandExecutionModulePublication(basis),consumer],program=consumer.programs[0];
 const publication=raw(consumer,'module_publication','module-publication');
 const pv=validator.validatePublication(publication,consumer.contributions.map(v=>raw(v,'catalog_contribution','catalog-contribution')));
 const input={declarationBasisDigest:d.sha256Canonical(pubs),programPublication:publication,program:raw(program,'gtl_program','program'),graphFunctions:unique(pubs.flatMap(p=>p.graphFunctions).filter(g=>program.callableMembership.includes(g.name)),'name').map(v=>raw(v,'graph_function','graph-function')),contracts:unique(pubs.flatMap(p=>p.contracts),'contractRef').map(v=>raw(v,'contract_declaration','contract-declaration')),evaluators:unique(pubs.flatMap(p=>p.evaluators),'name'),rules:unique(pubs.flatMap(p=>p.rules),'name'),implementationBindings:unique(pubs.flatMap(p=>p.implementationBindings),'bindingRef').map(v=>raw(v,'implementation_binding','implementation-binding')),closureContracts:unique(pubs.flatMap(p=>p.closureContracts),'closureContractRef').map(v=>raw(v,'closure_contract','closure-contract'))};
 const result=validator.validateProgram(input),entries=['next','asset:retained-native-candidate-testing'].map(target=>({target,result:start.resolveProgramStart(program,{scope:'program',target,until:'converged',rootMode:'direct'})}));
 return {publicationValidation:pv.kind,publicationDiagnostics:pv.diagnostics??[],programValidation:result.kind,programDiagnostics:result.diagnostics??[],counts:{graphs:input.graphFunctions.length,contracts:input.contracts.length,bindings:input.implementationBindings.length},diagnosticDeclarationUnionDigest:input.declarationBasisDigest,entries};
}
const negative=validate(original),positive=validate(data);
assert.equal(negative.programValidation,'static_validation_refusal');assert.deepEqual(negative.programDiagnostics,[{code:'duplicate_identity',path:'$.graphFunctions[*].template.nodes[*].term',message:'duplicate C leaf program locus node://abiogenesis/default-library/parent@5'}]);
assert.equal(positive.publicationValidation,'publication_validation');assert.deepEqual(positive.publicationDiagnostics,[]);assert.equal(positive.programValidation,'program_validation');assert.deepEqual(positive.programDiagnostics,[]);assert.deepEqual(positive.counts,{graphs:9,contracts:93,bindings:26});
for(const [i,entry] of positive.entries.entries()){assert.equal(entry.result.kind,'resolved_program_start');assert.equal(entry.result.start.graphFunctionRef,witnessRef('graph-function',i?'executive-b':'executive-a'));}
console.log(JSON.stringify({status:'PURE_WHOLE_PROGRAM_AND_ENTRY_READINESS_PASSED',sourceCommit:'4fda33bb60eaa3d5f105beebbbaea19d6fa7fe5e',sourceTree:'d136d90f44921b2944579bf89fbac0075052920b',candidateArchive:custody.archive,originalDeclaration:pin(dataPath),retainedLog:pin(logPath),operator:pin(join(D,'operator.mjs')),script:pin(fileURLToPath(import.meta.url)),proposedDeclarationCanonicalDigest:expected,onlySelectedBChange:true,negative,positive,effects:{PublicCalls:0,RuntimeAdmissions:0,eventStoreCalls:0,providerCalls:0,builds:0,installs:0},limits:'Local diagnostic declaration union, not admitted catalog/closure or installed artifact truth. Actual Root installation/catalog/call preflight remains required; no setup or witness acceptance.'},null,2));
