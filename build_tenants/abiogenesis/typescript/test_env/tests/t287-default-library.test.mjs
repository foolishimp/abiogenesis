import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,mkdtemp,copyFile,cp,rm,symlink,stat,chmod} from 'node:fs/promises';
import {join,basename,resolve,dirname} from 'node:path';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import * as eventOwner from '../../build/code/src/abg/event_store.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {loadWorksiteOwner,worksiteFixture} from '../support/t287-generic-job-worksite.mjs';
import {tmpdir} from 'node:os';
import {pathToFileURL,fileURLToPath} from 'node:url';
import * as gtl from '../support/language-test-gtl.mjs';
import * as canonicalProduct from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import {observedGovernanceTaskMatches} from '../../build/code/src/abg/default_library.js';
import {projectObservedWorksiteCommandChildAtPrefix} from '../../build/code/src/abg/worksite_input_provenance.js';
import {setupInstalledRootCatalog,requirePublicationValidations} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest,
  pendingExecutionUseRequest,constructInstalledPendingCall} from '../support/registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentSchema,schemaPath} from '../support/default-library.mjs';
// Authentic retained RC2 stdout (4616 bytes, sha256 bee000fc…87b6) and its historical producer citation from
// rc3-operator-inputs/increment-a-01/retained-stdout-custody.json, embedded so this test reads no untracked operator path.
const RETAINED_STDOUT_CUSTODY=Object.freeze({"sourcePath":"/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01/setup-001/resources/archives/worksite-command-execution/149ac91a90f69c3b4f40c585eccbeca9afd8203c07d4605d6a79736e569ecbce/51b7537287cdf3e55522f1200482e81526a3d608d62c59e98b2bed2ef0fe2455/result.json","sourceSha256":"b2d43b8976ca84d9202661bf8a6a8422f5279d0a375db1791e7cae82959fc2f8","sourceBytes":5484013,"helperArtifactRef":"worksite-command-helper-artifact://abiogenesis/ce43471cd42e48566357375ad44f9c35d6daa8c68c1840e5575a3c472e4222e5","helperArtifactDigest":"sha256:ce43471cd42e48566357375ad44f9c35d6daa8c68c1840e5575a3c472e4222e5","commandId":"command://abiogenesis/rc2-dogfood/fixture-repair-01/fixture-tests","ordinal":4,"observationRef":"worksite-command-observation://abiogenesis/10718e7ba44510b0d85985fd4bdd87b433da4b0d461829b7e7164215a3fdf4eb","observationDigest":"sha256:10718e7ba44510b0d85985fd4bdd87b433da4b0d461829b7e7164215a3fdf4eb","stream":"stdout","streamSha256":"bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6","streamBytes":4616,"declaredStreamDigest":"sha256:bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6","admittedTestingResult":"result://abiogenesis/3607433aa2790c7a2e0bdd0b49f7a3b1bc54687844c3d5bcc2c9dfad931a1968","resultSource":"failure-008.json","scope":"Byte-identical extraction with supplied producer coordinates; no new ABG event or semantic judgment"});
const RETAINED_STDOUT_BASE64=[
  'KG5vZGU6MzMyODgpIEV4cGVyaW1lbnRhbFdhcm5pbmc6IFZNIE1vZHVsZXMgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUgYW5kIG1pZ2h0IGNoYW5nZSBhdCBhbnkgdGltZQooVXNlIGBub2RlIC0tdHJhY2Utd2FybmluZ3MgLi4uYCB0',
  'byBzaG93IHdoZXJlIHRoZSB3YXJuaW5nIHdhcyBjcmVhdGVkKQrinJYgVTEtUDUtMDIgYWN0dWFsIEMwIHN1Y2Nlc3NvciBhbmQgZXZlcnkgYWZmZWN0ZWQgY3VycmVudG5lc3MgY29uc3VtZXIgKDQ0Mi45Njk1NDJtcykKKG5vZGU6MzMz',
  'MDQpIEV4cGVyaW1lbnRhbFdhcm5pbmc6IFZNIE1vZHVsZXMgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUgYW5kIG1pZ2h0IGNoYW5nZSBhdCBhbnkgdGltZQooVXNlIGBub2RlIC0tdHJhY2Utd2FybmluZ3MgLi4uYCB0byBzaG93IHdo',
  'ZXJlIHRoZSB3YXJuaW5nIHdhcyBjcmVhdGVkKQrinJQgbGlicmFyeSBwcmVwYXJlLXRlc3RpbmcgcmV1c2VzIHRoZSBpbnZva2luZyBwcml2YXRlIG9wZXJhdGlvbiBhbmQgaXRzIGFjdHVhbCBGX0Qgb3JpZ2luICgxMzQuNDA3NzkxbXMp',
  'CuKEuSBDYW5vbmljYWwgbW9kdWxlLXB1YmxpY2F0aW9uIGRlZmluaXRpb24gYW5kIGxlYWYvZGVzY3JpcHRvciBiaW5kaW5nIHdpdGggYWN0dWFsIGxpYnJhcnkgcHJlcGFyYXRpb24vbWF0Y2hlciBhbmQgY29sZCBGX0QgUmVzdWx0L0ov',
  'ZXZpZGVuY2UgcmVsYXRpb25zOyByYXcvZm9yZWlnbi90YW1wZXJlZCBkZWZpbml0aW9uIGFuZCBtYXRlcmlhbGl6YXRpb24gaWRlbnRpdGllcyByZWZ1c2UuIFBoeXNpY2FsIGNvbnN0cnVjdG9ycyBhcmUgcmVhbC4gU291cmNlL2Vudmly',
  'b25tZW50L2NvdmVyL0NDYWxsIGFuZCBpbXBsZW1lbnRhdGlvbi1zZXQgbG9va3VwcyBhcmUgY29udHJvbGxlZCBsb3dlciBwcmVtaXNlcywgbm90IG5ldyBuYXRpdmUgb3IgaW5zdGFsbGVkIGFkbWlzc2lvbi4K4pyUIGxpYnJhcnkgVGVz',
  'dGluZyBmaXJzdC1yZWZ1c2FsIGRpYWdub3N0aWNzIGRpc3Rpbmd1aXNoIGFjdHVhbCBudWxsYWJsZSBvd25lciByZWxhdGlvbnMgd2l0aG91dCBjaGFuZ2luZyBndWFyZHMgKDUzLjQ2M21zKQrihLkgQWN0dWFsIGxpYnJhcnkvdGFzay9u',
  'YXRpdmUgb2NjdXJyZW5jZS9kZWNsYXJhdGlvbi9jbG9zZWQtc291cmNlIGNvZGUgYW5kIHBoeXNpY2FsIGNvbnRleHQgY2hlY2tzLiBTeW50aGV0aWMgaW52b2NhdGlvbi1yb290IHBsdXMgc291cmNlL2Vudmlyb25tZW50L2NvdmVyL0ND',
  'YWxsL3NldC90ZXJtaW5hbCBwcmVtaXNlcyBhcmUgY29udHJvbGxlZDsgdGhlIGVudGVyZWQtcmVmdXNlZCBjYWxsYmFjayBjYXNlIHRlc3RzIG9ubHkgaXRzIGhhbmRvZmYgY29udHJhY3QuIE5vIGluc3RhbGxlZCBUZXN0aW5nL0MyLCBh',
  'Y3R1YWwgZmlyc3QtbnVsbCBvciBuby1lZmZlY3RzIGNsYWltLgrihLkgdGVzdHMgMwrihLkgc3VpdGVzIDAK4oS5IHBhc3MgMgrihLkgZmFpbCAxCuKEuSBjYW5jZWxsZWQgMArihLkgc2tpcHBlZCAwCuKEuSB0b2RvIDAK4oS5IGR1cmF0',
  'aW9uX21zIDEzODEuOTY1NTgzCgrinJYgZmFpbGluZyB0ZXN0czoKCnRlc3QgYXQgdGVzdF9lbnYvdGVzdHMvdDI4Ny1uYXRpdmUtd29yay1jdXJyZW50bmVzcy1jb25zdW1lcnMudGVzdC5tanM6NTk3OjEK4pyWIFUxLVA1LTAyIGFjdHVh',
  'bCBDMCBzdWNjZXNzb3IgYW5kIGV2ZXJ5IGFmZmVjdGVkIGN1cnJlbnRuZXNzIGNvbnN1bWVyICg0NDIuOTY5NTQybXMpCiAgRXJyb3I6IEVOT0VOVDogbm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeSwgb3BlbiAnL1VzZXJzL2ppbS9zcmMv',
  'YXBwcy9hYmlvZ2VuZXNpcy8uYWktd29ya3NwYWNlL3dvcmsvVDI4N19SRUxFQVNFX1JFU1VNUFRJT05fMDEvcmMyLWRvZ2Zvb2QtMDEvc2V0dXAtMDAxL3Jlc291cmNlcy9hcmNoaXZlcy93b3Jrc2l0ZS1jb21tYW5kLWV4ZWN1dGlvbi8x',
  'NDlhYzkxYTkwZjY5YzNiNGY0MGM1ODVlY2NiZWNhOWFmZDgyMDNjMDdkNDYwNWQ2YTc5NzM2ZTU2OWVjYmNlLzUxYjc1MzcyODdjZGYzZTU1NTIyZjEyMDA0ODJlODE1MjZhM2Q2MDhkNjJjNTllOThiMmJlZDJlZjBmZTI0NTUvc2FuZGJv',
  'eC9idWlsZF90ZW5hbnRzL2FiaW9nZW5lc2lzL3R5cGVzY3JpcHQvdGVzdF9lbnYvdGVzdHMvdDI4Ny1uYXRpdmUtc2VtYW50aWMtcmV2aXNpb24udGVzdC5tanMnCiAgICAgIGF0IGFzeW5jIG9wZW4gKG5vZGU6aW50ZXJuYWwvZnMvcHJv',
  'bWlzZXM6NjQyOjI1KQogICAgICBhdCBhc3luYyBPYmplY3QucmVhZEZpbGUgKG5vZGU6aW50ZXJuYWwvZnMvcHJvbWlzZXM6MTI3OToxNCkKICAgICAgYXQgYXN5bmMgc2VtYW50aWNGaXh0dXJlSGVscGVycyAoZmlsZTovLy9Vc2Vycy9q',
  'aW0vc3JjL2FwcHMvYWJpb2dlbmVzaXMvLmFpLXdvcmtzcGFjZS93b3JrL1QyODdfUkVMRUFTRV9SRVNVTVBUSU9OXzAxL3JjMi1kb2dmb29kLTAxL3NldHVwLTAwMS9yZXNvdXJjZXMvYXJjaGl2ZXMvd29ya3NpdGUtY29tbWFuZC1leGVj',
  'dXRpb24vMTQ5YWM5MWE5MGY2OWMzYjRmNDBjNTg1ZWNjYmVjYTlhZmQ4MjAzYzA3ZDQ2MDVkNmE3OTczNmU1NjllY2JjZS81MWI3NTM3Mjg3Y2RmM2U1NTUyMmYxMjAwNDgyZTgxNTI2YTNkNjA4ZDYyYzU5ZTk4YjJiZWQyZWYwZmUyNDU1',
  'L3NhbmRib3gvYnVpbGRfdGVuYW50cy9hYmlvZ2VuZXNpcy90eXBlc2NyaXB0L3Rlc3RfZW52L3N1cHBvcnQvdDI4Ny1uYXRpdmUtd29yay1jdXJyZW50bmVzcy1jb25zdW1lcnMubWpzOjM2NDoxNykKICAgICAgYXQgYXN5bmMgc2VtYW50',
  'aWNEYXRhIChmaWxlOi8vL1VzZXJzL2ppbS9zcmMvYXBwcy9hYmlvZ2VuZXNpcy8uYWktd29ya3NwYWNlL3dvcmsvVDI4N19SRUxFQVNFX1JFU1VNUFRJT05fMDEvcmMyLWRvZ2Zvb2QtMDEvc2V0dXAtMDAxL3Jlc291cmNlcy9hcmNoaXZl',
  'cy93b3Jrc2l0ZS1jb21tYW5kLWV4ZWN1dGlvbi8xNDlhYzkxYTkwZjY5YzNiNGY0MGM1ODVlY2NiZWNhOWFmZDgyMDNjMDdkNDYwNWQ2YTc5NzM2ZTU2OWVjYmNlLzUxYjc1MzcyODdjZGYzZTU1NTIyZjEyMDA0ODJlODE1MjZhM2Q2MDhk',
  'NjJjNTllOThiMmJlZDJlZjBmZTI0NTUvc2FuZGJveC9idWlsZF90ZW5hbnRzL2FiaW9nZW5lc2lzL3R5cGVzY3JpcHQvdGVzdF9lbnYvdGVzdHMvdDI4Ny1uYXRpdmUtd29yay1jdXJyZW50bmVzcy1jb25zdW1lcnMudGVzdC5tanM6Mzc1',
  'OjE5KQogICAgICBhdCBhc3luYyBPYmplY3Quc2VtYW50aWNGb2xkQ29uc3VtZXIgW2FzIHNlbWFudGljRm9sZF0gKGZpbGU6Ly8vVXNlcnMvamltL3NyYy9hcHBzL2FiaW9nZW5lc2lzLy5haS13b3Jrc3BhY2Uvd29yay9UMjg3X1JFTEVB',
  'U0VfUkVTVU1QVElPTl8wMS9yYzItZG9nZm9vZC0wMS9zZXR1cC0wMDEvcmVzb3VyY2VzL2FyY2hpdmVzL3dvcmtzaXRlLWNvbW1hbmQtZXhlY3V0aW9uLzE0OWFjOTFhOTBmNjljM2I0ZjQwYzU4NWVjY2JlY2E5YWZkODIwM2MwN2Q0NjA1',
  'ZDZhNzk3MzZlNTY5ZWNiY2UvNTFiNzUzNzI4N2NkZjNlNTU1MjJmMTIwMDQ4MmU4MTUyNmEzZDYwOGQ2MmM1OWU5OGIyYmVkMmVmMGZlMjQ1NS9zYW5kYm94L2J1aWxkX3RlbmFudHMvYWJpb2dlbmVzaXMvdHlwZXNjcmlwdC90ZXN0X2Vu',
  'di90ZXN0cy90Mjg3LW5hdGl2ZS13b3JrLWN1cnJlbnRuZXNzLWNvbnN1bWVycy50ZXN0Lm1qczo0NjQ6MTgpCiAgICAgIGF0IGFzeW5jIFRlc3RDb250ZXh0Ljxhbm9ueW1vdXM+IChmaWxlOi8vL1VzZXJzL2ppbS9zcmMvYXBwcy9hYmlv',
  'Z2VuZXNpcy8uYWktd29ya3NwYWNlL3dvcmsvVDI4N19SRUxFQVNFX1JFU1VNUFRJT05fMDEvcmMyLWRvZ2Zvb2QtMDEvc2V0dXAtMDAxL3Jlc291cmNlcy9hcmNoaXZlcy93b3Jrc2l0ZS1jb21tYW5kLWV4ZWN1dGlvbi8xNDlhYzkxYTkw',
  'ZjY5YzNiNGY0MGM1ODVlY2NiZWNhOWFmZDgyMDNjMDdkNDYwNWQ2YTc5NzM2ZTU2OWVjYmNlLzUxYjc1MzcyODdjZGYzZTU1NTIyZjEyMDA0ODJlODE1MjZhM2Q2MDhkNjJjNTllOThiMmJlZDJlZjBmZTI0NTUvc2FuZGJveC9idWlsZF90',
  'ZW5hbnRzL2FiaW9nZW5lc2lzL3R5cGVzY3JpcHQvdGVzdF9lbnYvdGVzdHMvdDI4Ny1uYXRpdmUtd29yay1jdXJyZW50bmVzcy1jb25zdW1lcnMudGVzdC5tanM6NjAxOjM5KQogICAgICBhdCBhc3luYyBUZXN0LnJ1biAobm9kZTppbnRl',
  'cm5hbC90ZXN0X3J1bm5lci90ZXN0OjExMTM6NykKICAgICAgYXQgYXN5bmMgc3RhcnRTdWJ0ZXN0QWZ0ZXJCb290c3RyYXAgKG5vZGU6aW50ZXJuYWwvdGVzdF9ydW5uZXIvaGFybmVzczozNTg6MykgewogICAgZXJybm86IC0yLAogICAg',
  'Y29kZTogJ0VOT0VOVCcsCiAgICBzeXNjYWxsOiAnb3BlbicsCiAgICBwYXRoOiAnL1VzZXJzL2ppbS9zcmMvYXBwcy9hYmlvZ2VuZXNpcy8uYWktd29ya3NwYWNlL3dvcmsvVDI4N19SRUxFQVNFX1JFU1VNUFRJT05fMDEvcmMyLWRvZ2Zv',
  'b2QtMDEvc2V0dXAtMDAxL3Jlc291cmNlcy9hcmNoaXZlcy93b3Jrc2l0ZS1jb21tYW5kLWV4ZWN1dGlvbi8xNDlhYzkxYTkwZjY5YzNiNGY0MGM1ODVlY2NiZWNhOWFmZDgyMDNjMDdkNDYwNWQ2YTc5NzM2ZTU2OWVjYmNlLzUxYjc1Mzcy',
  'ODdjZGYzZTU1NTIyZjEyMDA0ODJlODE1MjZhM2Q2MDhkNjJjNTllOThiMmJlZDJlZjBmZTI0NTUvc2FuZGJveC9idWlsZF90ZW5hbnRzL2FiaW9nZW5lc2lzL3R5cGVzY3JpcHQvdGVzdF9lbnYvdGVzdHMvdDI4Ny1uYXRpdmUtc2VtYW50',
  'aWMtcmV2aXNpb24udGVzdC5tanMnCiAgfQo='].join('');
const canonicalPackageRoot=new URL('../..',import.meta.url).pathname;
const packageRoot=process.env.ABI5_DEFAULT_LIBRARY_BUILD_ROOT??canonicalPackageRoot;
const product=packageRoot===canonicalPackageRoot?canonicalProduct:await import(pathToFileURL(resolve(packageRoot,'build/code/src/product/index.js')).href);
const governanceRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/',import.meta.url).pathname;
const witnessRoot=join(governanceRoot,'default-library-witness');
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
function validation(publication,program,publications){
  requirePublicationValidations(validator,publications);
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract:fixture');assert.equal(r.kind,'raw_admitted_value',JSON.stringify(r));return r;};
  const p=raw(publication,'module_publication'),unique=(key,values)=>[...new Map(values.map(v=>[v[key],v])).values()];
  return validator.validateProgram({declarationBasisDigest:p.subjectDigest,programPublication:p,program:raw(program,'gtl_program'),
    graphFunctions:unique('name',publications.flatMap(p=>p.graphFunctions)).map(v=>raw(v,'graph_function')),
    contracts:unique('contractRef',publications.flatMap(p=>p.contracts)).map(v=>raw(v,'contract_declaration')),
    evaluators:unique('name',publications.flatMap(p=>p.evaluators)),rules:unique('name',publications.flatMap(p=>p.rules)),
    implementationBindings:unique('bindingRef',publications.flatMap(p=>p.implementationBindings)).map(v=>raw(v,'implementation_binding')),
    closureContracts:unique('closureContractRef',publications.flatMap(p=>p.closureContracts)).map(v=>raw(v,'closure_contract'))});
}
// The one governance-root projection as built (abg/semantic_job.js), linked
// over a fixture's index and exact-prefix rehydration: each fixture supplies
// both relations, the one indexed root and the ancestry walk that reaches it.
async function rootProjection(indexed,rehydrateExecutionBasisAtPrefix){
  const file=resolve(packageRoot,'build/code/src/abg/semantic_job.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href);
    const values={...actual,...(s==='./event_prefix.js'?{indexedRuntimeEvents:(p,key)=>indexed(p,key,actual.indexedRuntimeEvents)}:s==='./execution_basis.js'?{rehydrateExecutionBasisAtPrefix}:{})};
    return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();return {...m.namespace};
}
// The root basis the indexed root event admits, read from that event at call
// time: an owned execution's ancestry reaches it in one step.
const rootBasis=(root,execution)=>(_p,ref)=>ref===root.payload.basisRef?{...execution,basisRef:ref,parentExecutionBasisRef:null,rawInputValue:root.payload.rawInputValue}:null;
test('default library preserves cumulative wrapper bindings and rejects duplicate carried refs',()=>{
  const state=product.governanceContract('state'),graphs=gtl.defaultGovernanceGraphFunctions();
  for(const purpose of product.GOVERNANCE_PURPOSES){
    const graph=graphs.find(g=>g.name===product.governanceRef('graph-function',purpose));
    const child=purpose==='testing'?product.WORKSITE_COMMAND_EXECUTION_IDS:product.NATIVE_WORKSPACE_WORK_IDS;
    assert.deepEqual(graph.environment,{requires:[state],provides:[state],carries:[state,child.taskContractRef,child.observationContractRef]});
  }
  const publication=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
  assert.equal(requirePublicationValidations(validator,[publication]).length,1);
  const duplicate=structuredClone(publication),wrapper=duplicate.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','testing'));
  wrapper.environment.carries.push(state);
  assert.throws(()=>requirePublicationValidations(validator,[duplicate]),/duplicate_identity.*environment\.carries/s);
});
test('installed root publication precondition rejects a bad non-selected publication',()=>{
  const selected=gtl.constructLanguageTestModulePublication(basis),library=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
  assert.equal(requirePublicationValidations(validator,[selected,library]).length,2);
  const invalid=structuredClone(library),wrapper=invalid.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','construction'));
  wrapper.environment.carries.push(wrapper.environment.carries[0]);
  assert.equal(requirePublicationValidations(validator,[selected])[0].publicationValidation.kind,'publication_validation');
  assert.throws(()=>requirePublicationValidations(validator,[selected,invalid]),/default-library\/default@5: .*duplicate_identity/s);
});
test('default catalogue publishes conditional purposes over fixed native/C2 children and mandatory parent evaluation',()=>{
  const pubs=constructors.map(n=>gtl[n](basis)),library=pubs[0];
  assert.deepEqual(library.runEnvironments[0].roles.find(r=>r.role==='selector').contextPolicy.selectors,['full_source','active_binding_semantics']);
  const contractRefs=pubs.flatMap(p=>p.contracts.map(c=>c.contractRef));assert.equal(new Set(contractRefs).size,contractRefs.length,'shared contracts retain one publication owner');
  assert.equal(library.contributions.length,7);assert.equal(library.graphFunctions.length,8);
  const result=validation(library,library.programs[0],pubs);assert.equal(result.kind,'program_validation',JSON.stringify(result));
  assert.equal(result.executableLeafRows.filter(r=>r.fibre==='F_P').length,4);
  const app=library.graphFunctions.find(g=>g.name===product.governanceRef("graph-function","executive")).template.applications[0];assert.equal(app.foldback.requiresParentEvaluation,true);assert.equal(app.bound,12);
  assert.equal(library.programs[0].constructionComposition,undefined);
  const selected=gtl.defaultGovernanceGraphFunctions({purposes:['testing']});assert.equal(selected.length,3);assert.equal(selected[1].template.nodes.filter(n=>n.term.kind==='c_workflow').length,1);
  assert.equal(selected[2].template.nodes[1].term.graphFunctionRef,product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
  assert.throws(()=>gtl.defaultGovernanceGraphFunctions({purposes:[]}));assert.equal(observedGovernanceTaskMatches({kind:'governance_work_state'},{}),false);
  assert.equal(projectObservedWorksiteCommandChildAtPrefix(null,{parentBasis:{},parentCCallRef:'missing',runId:'missing',task:{}}),null);
});
test('independent consumer restricts choices while preserving actual native role and schema owners',async()=>{
  const pubs=constructors.map(n=>gtl[n](basis)),selected=await libraryEnvironment({gtl,product,packageRoot});
  const data=libraryConsumerDeclaration(gtl,pubs[0],selected.declaration);
  const consumer=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,
    contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
  assert.deepEqual(consumer.contracts.map(c=>c.contractRef),[witnessRef('contract','assessment')]);
  const result=validation(consumer,consumer.programs[0],[...pubs,consumer]);assert.equal(result.kind,'program_validation',JSON.stringify(result));
  assert.equal(result.executableLeafRows.filter(r=>r.fibre==='F_P').length,4);
  assert.ok(!consumer.programs[0].callableMembership.includes(product.governanceRef('graph-function','induction')));
});
test('retention and execution share root, imported and exact external semantics owner selection',async()=>{
  const {graphFunctionSemanticsOwner:select}=await import('../../build/code/src/product/execution_resolution.js');
  const pubs=constructors.map(n=>gtl[n](basis)),library=pubs[0],graph=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','testing'));
  const coordinate=(publication,declarationKind,declarationRef)=>({declarationKind,declarationRef,productId:publication.owningProductId,installId:'install:'+publication.moduleRef,moduleRef:publication.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(publication)});
  const libraryOwner=coordinate(library,'graph_function',graph.name),root={...libraryOwner,moduleRef:'module:consumer',declarationKind:'semantics',declarationRef:'semantics:consumer'};
  const closure={selectedGraphFunctionRef:'graph:root',semanticsOwner:root,publications:[library],graphFunctionOwners:[libraryOwner],contractOwners:[],evaluatorOwners:[],ruleOwners:[],implementationBindingOwners:[],closureContractOwners:[]};
  // Exact publication/install binding is the supplied owner premise. Production
  // callers retain their existing ingress/bound-owner checks around this projection.
  const lookup=owner=>owner.moduleRef===library.moduleRef?{publication:library,install:{packageName:basis.packageName,packageVersion:basis.packageVersion}}:null;
  const selected=select(closure,graph.name,lookup);assert.equal(selected.moduleRef,library.moduleRef);assert.equal(selected.declarationRef,library.productSemanticsBinding.bindingRef);assert.notEqual(selected.moduleRef,root.moduleRef);
  assert.equal(select(closure,'graph:root',()=>null),root);assert.equal(select(closure,graph.name,()=>null),null);
  assert.equal(select({...closure,graphFunctionOwners:[libraryOwner,libraryOwner]},graph.name,lookup),null);
  const external={...library,moduleRef:'module:external-consumer',productSemanticsBinding:library.productSemanticsBinding},externalOwner=coordinate(external,'graph_function','graph:external');
  const imported={...closure,publications:[external,library],graphFunctionOwners:[externalOwner],contractOwners:[coordinate(library,'contract',product.governanceContract('state'))]};
  const externalLookup=owner=>owner.moduleRef===external.moduleRef?{publication:external,install:{packageName:'@consumer/own',packageVersion:'1'}}:lookup(owner);
  assert.equal(select(imported,'graph:external',externalLookup).moduleRef,library.moduleRef);
  assert.equal(select({...imported,publications:[external],contractOwners:[]},'graph:external',externalLookup),null);
  const rival={...library,moduleRef:'module:rival'},rivalOwner=coordinate(rival,'contract','contract:rival');
  assert.equal(select({...imported,publications:[external,library,rival],contractOwners:[...imported.contractOwners,rivalOwner]},'graph:external',owner=>owner.moduleRef===rival.moduleRef?{publication:rival,install:{packageName:basis.packageName,packageVersion:basis.packageVersion}}:externalLookup(owner)),null);
});
test('declared wrapper judgments advance actual observations, including red C2, without satisfying parent state',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),semantics=product.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS;
  const native=await import('../../build/code/src/product/native_workspace_work.js'),c2=await import('../../build/code/src/product/worksite_command_execution.js');
  await writeFile(join(f.canonicalRoot,'source.txt'),'supplied source\n');
  const subject=physical.constructWorksiteSubject({...f,relativePath:'source.txt',subjectUri:pathToFileURL(join(f.canonicalRoot,'source.txt')).href}),observation=await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject);
  const context=await physical.observeWorksiteContext({...f,readRoots:['source.txt'],maxFiles:2,maxBytes:1000});
  const task=product.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,capabilityGrant:f.capabilityGrant,context,outcome:'Bounded check',instructions:['Read supplied source.'],readFirst:['source.txt'],writeRoots:[],checks:[]});
  const provenance={cCallRef:'call:component',executionAuthorityRef:'authority:component',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:component',transportBindingRef:'transport:component',transportBindingDigest:product.sha256Canonical('binding'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')};
  const value=native.constructNativeWorkspaceWorkObservation(task,context,{summary:'Observed',gaps:[]},provenance);
  for(const wrapper of library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']&&g.declarations['abg.default_library_purpose']!=='testing')){
    assert.equal(wrapper.declarations['abg.judgment_predicate'],product.NATIVE_WORKSPACE_WORK_IDS.judgmentPredicateRef);
    const relation=semantics.resolveJudgmentRelation(wrapper.declarations['abg.judgment_predicate']);assert.equal(relation.evaluate(task,value),true);assert.equal(relation.evaluate({...task,outcome:'changed'},value),false);
    assert.equal(wrapper.template.nodes.at(-1).term.judgmentPredicateRef,product.governanceRef('predicate','fold'));
  }
  const commandTask=product.constructObservedWorksiteCommandExecutionTask({...f,observedFiles:[{subject,observation}],commands:[{commandId:'command:component',executable:'node',args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'verification'}]});
  const plan=c2.worksiteCommandExecutionHelperPlan(commandTask,'attempt:component'),{kind:_,schemaVersion:__,expectedReports:___,...command}=commandTask.commands[0];
  const empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
  const body={...command,exitStatus:7,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:empty,stderr:empty,reports:[],reportCount:0},digest=product.sha256Canonical(body);
  const commandResult={kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};
  const members=commandTask.protectedObservations.map(row=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:row.ordinal,sourceMemberRef:row.sourceMemberRef,sourceObservationRef:row.observation.observationRef,sourceObservationDigest:row.observation.observationDigest,relativePath:row.subject.relativePath,byteLength:row.observation.byteLength,digest:row.observation.fileDigest})),snapshotDigest=product.sha256Canonical(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task:commandTask,disposition:'success',commandResults:[commandResult],predicateObservations:[],worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:[observation],protectedAfter:[observation]});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:commandTask.taskRef,taskDigest:commandTask.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  const actor={actorRef:commandTask.workerActorRef,workerBindingRef:commandTask.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:product.sha256Canonical(commandTask),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:component',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:component',...provenance};
  const observed=c2.constructWorksiteExecutionObservation(commandTask,acknowledgment,actor,artifact,plan),wrapper=library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']==='testing');
  assert.equal(wrapper.declarations['abg.judgment_predicate'],product.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
  assert.equal(semantics.resolveJudgmentRelation(wrapper.declarations['abg.judgment_predicate']).evaluate(commandTask,observed),true);assert.equal(observed.commandResults[0].exitStatus,7);
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  assert.equal(product.governanceVerdict(state),false);assert.equal(semantics.resolveJudgmentRelation(product.governanceRef('predicate','fold')).evaluate(commandTask,observed),false,'observation and state fold remain different contracts');
});

test('default role content is the exact packaged STDO3 subset with capability instructions separate',async()=>{
  const {DEFAULT_LIBRARY_STDO_SOURCE:source}=await import('../../build/code/src/gtl/default_library.js');
  assert.equal(source.basisRef,'stdo://releases/v3.0.2/');
  const manifest=await readFile(join(packageRoot,source.manifest.assetPath));
  assert.equal(product.sha256Bytes(manifest),'sha256:f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477');
  const released=product.runEnvironmentRecordMembers('stdo_source_manifest@1',manifest),packaged=new Map();
  const expectedMembers={'standards/EXECUTIVE_BASELINE.md':'sha256:064eb55ec6b1870da8411da814c0a6c59fd7113bd4cb2631351c141f66a02f2a',
    'standards/ASSURANCE.md':'sha256:5f6740a39355314ea2a9227a8795ea68cdafb2c4c3e9b25e1d9e626eb43f27ca'};
  for(const member of Object.values(source.members)){
    const bytes=await readFile(join(packageRoot,member.assetPath));packaged.set(member.path,bytes);
    assert.equal(product.sha256Bytes(bytes),expectedMembers[member.path]);assert.equal(bytes.length,member.byteCount);
    assert.ok(released.some(row=>row.path===member.path&&row.type==='file'&&row.digest===member.digest));
  }
  assert.deepEqual([...packaged.keys()].sort(),Object.keys(expectedMembers).sort());
  const environment=gtl.defaultLibraryRunEnvironment(),dependency=environment.dependencies[0];
  assert.equal(dependency.recordFormat,'member_inventory@1');
  assert.deepEqual(dependency.members.map(member=>member.path),['manifest.json','standards/ASSURANCE.md','standards/EXECUTIVE_BASELINE.md']);
  assert.equal(dependency.members[0].digest,product.sha256Bytes(manifest));
  assert.equal(environment.corpusAccess,null);assert.deepEqual(environment.accesses,[]);
  assert.throws(()=>gtl.constructStdoRunEnvironmentDeclaration(structuredClone(environment)),/STDO requires exact source/,
    'a generic packaged subset does not masquerade as the specialized complete-source manifest');
  const expectedSpans={selector:[[84076,89633]],constructor:[[89633,92614],[97247,109740]],
    assessor:[[92614,97247],[34042,63245]],command_executor:[[89633,92614],[34042,63245]]};
  assert.deepEqual(environment.roles.map(role=>role.role),Object.keys(expectedSpans));
  for(const role of environment.roles){
    assert.deepEqual(role.sourceBindings.map(span=>[span.startByte,span.endByte]),expectedSpans[role.role]);
    assert.equal(role.policy.text,product.DEFAULT_LIBRARY_POLICY);assert.deepEqual(role.accessRefs,[]);
    assert.deepEqual(role.contextPolicy.selectors,role.role==='selector'?['full_source','active_binding_semantics']:['current_worksite','admitted_execution_evidence']);
    assert.ok(role.frameRefs.every(ref=>Object.keys(expectedMembers).some(path=>ref.startsWith(source.basisRef+path+'#'))));
    for(const span of role.sourceBindings){
      const member=environment.contexts.find(context=>context.contextRef===span.contextRef).members.find(member=>member.memberRef===span.memberRef);
      const bytes=packaged.get(member.path).subarray(span.startByte,span.endByte);
      assert.equal(product.sha256Bytes(bytes),span.spanDigest);assert.match(bytes.toString(),/^## (?:7|8|9|10|11)\. /);assert.notEqual(bytes.toString(),role.policy.text);
    }
    if(role.role==='assessor'||role.role==='command_executor'){
      const testing=role.sourceBindings.at(-1),body=packaged.get('standards/ASSURANCE.md').subarray(testing.startByte,testing.endByte).toString();
      for(const section of ['## 7.','## 8.','## 9.','## 10.','## 11.','## 12.'])assert.ok(body.includes(section));
      assert.ok(!body.includes('## 13.'));assert.equal(role.frameRefs.filter(ref=>ref.includes('/ASSURANCE.md#')).length,6);
    }
  }
  const selected=await libraryEnvironment({gtl,product,packageRoot}),expected=structuredClone(environment);
  expected.declarationRef=witnessRef('environment','selected');expected.roles.find(role=>role.role==='selector').graphFunctionRef=witnessRef('graph-function','executive-step');
  assert.deepEqual(selected.declaration,expected,'witness changes only the two accepted identities');
  await assert.rejects(libraryEnvironment({gtl,product}),/explicit exact packageRoot/);
});
test('framed Testing prerequisite keeps the full plan and future mapping while refusing an absent-file probe',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const state=structuredClone(await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}));
  // Generic physical owner fixture: eighteen supplied inputs and eight future
  // inputs, not application code or an invented native execution/assessment.
  const selectedPaths=Array.from({length:26},(_,i)=>`declared-input-${i}.txt`),missing=selectedPaths.slice(18);
  state.original.testing.selectedPaths=selectedPaths;
  state.original.readRoots=[...state.original.readRoots,...selectedPaths];
  for(const path of selectedPaths.slice(0,18))await writeFile(join(f.canonicalRoot,path),'supplied input\n');
  const original=structuredClone(state.original),originalDigest=product.sha256Canonical(original);
  const observe=()=>physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:100,maxBytes:1000000});
  const task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context:await observe()};assert.ok(product.isFramedSynthesisTask(task));
  const targets=gtl.defaultGovernanceGraphFunctions().filter(g=>g.declarations['abg.default_library_purpose']).map(g=>({
    graphFunctionRef:g.name,definitionDigest:product.sha256Canonical(g),purpose:g.declarations['abg.default_library_purpose']}));
  const testing=targets.find(t=>t.purpose==='testing').graphFunctionRef,construction=targets.find(t=>t.purpose==='construction').graphFunctionRef;
  // Controlled basis coordinates exercise the actual strict product binder;
  // ingress authentication and live selector behavior remain installed proof.
  const basisFor=task=>({inputRef:'input:prerequisite',inputDigest:product.sha256Canonical(task),taskRef:state.original.taskRef,
    environmentRef:'environment:prerequisite',environmentDigest:product.sha256Canonical('environment'),frameEvidenceDigest:product.sha256Canonical('frame'),
    frameRefs:['frame:prerequisite'],contextRef:task.context.observationRef,previousResultRef:null});
  const rawFor=(task,nextGraphFunctionRef)=>({interpretation:'Preserve the full original plan; construct its missing inputs before measurement.',
    contributions:[{graphFunctionRef:testing,contribution:'Future full declared Testing, not a reduced probe.',reason:'Measure all declared inputs when present.',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[task.context.observationRef],dependsOn:[]},
      {graphFunctionRef:construction,contribution:'Author one missing prerequisite.',reason:'Current context has missing declared inputs.',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[task.context.observationRef],dependsOn:[]}],
    gaps:nextGraphFunctionRef===null?[{supportRefs:state.unresolvedSupportRefs,reason:'Testing inputs remain missing.',evidenceRefs:[task.context.observationRef]}]:[],
    nextGraphFunctionRef,nextReason:'Choose current work without changing the full Testing declaration.',nextEvidenceRefs:[task.context.observationRef],
    subjectEvidenceRef:null,revisionReason:'Use current observed prerequisites.',revisionEvidenceRefs:[]});
  const {default:Ajv}=await import('ajv'),ajv=new Ajv({strict:false});
  const validate=task=>ajv.compile(product.framedSynthesisResponseSchema(task,targets));
  const schema=product.framedSynthesisResponseSchema(task,targets),prompt=product.projectFramedSynthesisPromptTask(task);
  assert.deepEqual(prompt.testing,original.testing);assert.deepEqual(prompt.testingPrerequisites.missingSelectedPaths,missing);
  assert.match(prompt.testingPrerequisites.meaning,/Presence does not prove adequacy or completion/);
  assert.ok(schema.properties.contributions.items.properties.graphFunctionRef.enum.includes(testing),'future Testing remains a registered mapping row');
  assert.ok(!schema.properties.nextGraphFunctionRef.enum.includes(testing),'absent selected inputs make immediate Testing unavailable');
  const probe=rawFor(task,testing);probe.contributions[0].contribution='Run a partial eighteen-file probe now.';
  assert.equal(validate(task)(probe),false);assert.equal(product.bindFramedSynthesisResult(task,targets,basisFor(task),probe),null);
  for(const next of [construction,null]){const raw=rawFor(task,next);assert.equal(validate(task)(raw),true);
    const bound=product.bindFramedSynthesisResult(task,targets,basisFor(task),raw);assert.ok(bound);assert.equal(bound.state,state);assert.deepEqual(bound.state.original,original);assert.deepEqual(bound.judgment.contributions,raw.contributions);}
  assert.equal(product.bindFramedSynthesisResult(task,targets,basisFor(task),{...rawFor(task,construction),testing:{selectedPaths:selectedPaths.slice(0,18)}}),null,'raw prose or extra fields cannot replace the plan');
  for(const path of missing)await writeFile(join(f.canonicalRoot,path),'newly available input\n');
  assert.equal(product.bindFramedSynthesisResult(task,targets,basisFor(task),rawFor(task,testing)),null,'physical changes do not rewrite a bound context');
  const complete={...task,context:await observe()},raw=rawFor(complete,testing),bound=product.bindFramedSynthesisResult(complete,targets,basisFor(complete),raw);
  assert.deepEqual(product.projectFramedSynthesisPromptTask(complete).testingPrerequisites.missingSelectedPaths,[]);
  assert.ok(product.framedSynthesisResponseSchema(complete,targets).properties.nextGraphFunctionRef.enum.includes(testing));
  assert.equal(validate(complete)(raw),true);assert.ok(bound);assert.deepEqual(bound.state.original,original);
  const observedFiles=[];for(const relativePath of selectedPaths){const subject=physical.constructWorksiteSubject({...f,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
    observedFiles.push({subject,observation:await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject)});}
  const commandTask=product.constructObservedWorksiteCommandExecutionTask({...f,observedFiles,...product.governanceTestingConfiguration(state)});
  assert.deepEqual(commandTask.protectedObservations.map(r=>r.subject.relativePath),selectedPaths);
  assert.ok(observedGovernanceTaskMatches(state,commandTask),'complete supplied files retain the canonical no-author Testing route');
  assert.deepEqual(commandTask.commands.map(c=>({commandId:c.commandId,executable:c.executable,args:c.args,relativeCwd:c.relativeCwd})),
    original.testing.commands.map(c=>({commandId:c.commandId,executable:c.executable,args:c.args,relativeCwd:c.relativeCwd})));
  assert.deepEqual(commandTask.outcomePredicates.map(p=>({predicateId:p.predicateId,predicateKind:p.predicateKind,declaration:p.declaration})),original.testing.outcomePredicates);
  assert.equal(product.sha256Canonical(state.original),originalDigest);
});

test('framed synthesis binds imported contracts, exact raw judgment and compact choice provenance',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const context=await physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),graph=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','executive-step'));
  const node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select')),role=library.runEnvironments[0].roles.find(r=>r.role==='selector');
  const supplied={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context};
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']);
  const events=[],call={regime:'F_P',cCallRef:'call:unit',cCallDigest:product.sha256Canonical('call'),runId:'run:unit',graphFunctionRef:graph.name,programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
  // The executing step's root declares its recursion; the current binding projects that exact relation.
  const executive=library.graphFunctions.find(g=>g.template.applications.some(a=>a.relationKind==='recurse'&&a.graphFunctionRef===graph.name)),recurse=executive.template.applications.find(a=>a.relationKind==='recurse');
  const execution={programRef:library.programs[0].programRef,basisRef:'basis:unit',basisDigest:product.sha256Canonical('basis'),invocationAdmissionRef:'invocation:unit',registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
  // The assembly owner's execution is the executing step under one root; later projection premises keep `execution`.
  const currentExecution={...execution,basisClass:'child',parentExecutionBasisRef:'basis:root-current',invocationRef:'invocation-ref:unit',graphFunctionRef:graph.name};
  const owner={events,call,execution:currentExecution,graph:{template:graph.template},inputValue:supplied,inputDigest:product.sha256Canonical(supplied),inputRef:'input:unit',program:library.programs[0]};
  const candidate={publication:{...library,contracts:[]},graphFunction:graph,declarationGraphFunctions:library.graphFunctions,executionBasis:execution,cCall:call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
  // Controlled current-binding premises: one exact admission, its one Run segment and the governance root.
  const currentAdmission={invocationAdmissionRef:currentExecution.invocationAdmissionRef,invocationRef:currentExecution.invocationRef,invocationVariant:'direct',programRef:execution.programRef,
    graphFunctionRef:executive.name,graphFunctionDigest:product.sha256Canonical(executive),sourceResultBasis:null,
    publicStart:{kind:'public_start_identity',schemaVersion:'5.0.0',programRef:execution.programRef,graphFunctionRef:executive.name,startRef:'start:unit',scope:'program',target:'next',until:'converged',rootMode:'direct'}};
  const currentRoot={basisClass:'root',basisRef:currentExecution.parentExecutionBasisRef,parentExecutionBasisRef:null,invocationAdmissionRef:currentAdmission.invocationAdmissionRef,
    invocationRef:currentAdmission.invocationRef,programRef:execution.programRef,graphFunctionRef:executive.name,graphFunctionDigest:currentAdmission.graphFunctionDigest};
  let currentRun=call.runId;
  // Controlled authenticated occurrence/role premises; actual task/context and
  // declaration/result owners are exercised here. Installed proof owns ingress.
  const file=resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owner}:specifier==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidenceAtPrefix:()=>({...role,invocationAdmissionRef:'invocation:unit',environmentRef:'environment:unit',environmentDigest:product.sha256Canonical('environment'),evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent:[],accessContent:[]})}:
      specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:(_p,ref)=>ref===currentAdmission.invocationAdmissionRef?currentAdmission:null,
        hasExactInvocationRunBindingAtPrefix:(_p,admission,runId)=>admission===currentAdmission&&runId===currentRun}:
      specifier==='./semantic_job.js'?{semanticJobRootAtPrefix:(_p,e)=>e.parentExecutionBasisRef===currentRoot.basisRef&&e.invocationAdmissionRef===currentRoot.invocationAdmissionRef?currentRoot:null}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const lookup=ref=>library.contracts.find(c=>c.contractRef===ref)??null;
  const assembly=m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied,lookup);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  const rendered=assembly.request.prompt, response=assembly.request.responseJsonSchema;
  // Current binding: exact current facts in their own bound section, separate from the conserved task.
  const shown=assembly.envelope.sections.binding;assert.deepEqual(assembly.plan.sectionOrder,['role','choices','task','binding','evidence','response']);
  assert.ok(rendered.includes('## binding\n'+product.canonicalJson(shown)));assert.equal(assembly.manifest.bindingDigest,product.sha256Canonical(shown));
  assert.deepEqual({...shown,meaning:undefined},{meaning:undefined,runId:'run:unit',programRef:execution.programRef,
    invocation:{invocationAdmissionRef:currentExecution.invocationAdmissionRef,invocationRef:currentExecution.invocationRef,invocationVariant:'direct'},
    root:{basisRef:currentRoot.basisRef,graphFunctionRef:executive.name,graphFunctionDigest:currentAdmission.graphFunctionDigest},
    start:{startRef:'start:unit',target:'next',until:'converged',rootMode:'direct'},executing:{basisRef:currentExecution.basisRef,graphFunctionRef:graph.name},
    declaredRecursion:{applicationRef:recurse.applicationRef,graphFunctionRef:graph.name,bound:recurse.bound},predecessor:null});
  // A retained-source predecessor stays separate from the current Run and root.
  const sourceResultBasis={sourceRunId:'run:predecessor',sourceInvocationAdmissionRef:'invocation:predecessor',sourceInvocationRef:'invocation-ref:predecessor',
    sourceGraphFunctionRef:executive.name,sourceCCallRef:'call:predecessor',sourceResultRef:'result:predecessor',sourceResultDigest:product.sha256Canonical('predecessor')};
  currentAdmission.sourceResultBasis=sourceResultBasis;
  const retainedBinding=m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied,lookup).envelope.sections.binding;currentAdmission.sourceResultBasis=null;
  assert.deepEqual([retainedBinding.runId,retainedBinding.root,retainedBinding.invocation],[shown.runId,shown.root,shown.invocation],'the predecessor never becomes the current Run or root');
  const {sourceCCallRef:_call,...predecessor}=sourceResultBasis;assert.deepEqual(retainedBinding.predecessor,predecessor);
  // No invented bound: without the authenticated root definition the bound is absent, not defaulted.
  const unbounded=m.namespace.evaluateFramedSynthesisInstructionAssembly({...candidate,declarationGraphFunctions:library.graphFunctions.filter(g=>g!==executive)},supplied,lookup);
  assert.equal(unbounded.kind,'native_instruction_assembly');assert.equal(unbounded.envelope.sections.binding.declaredRecursion,null);
  // Unknown, foreign or forged current facts refuse before dispatch with the existing cause.
  const zeroDigest='sha256:'+'0'.repeat(64),swap=(target,key,value)=>{const old=target[key];target[key]=value;return ()=>{target[key]=old;};};
  for(const [label,change] of [['foreign Run',()=>{const old=currentRun;currentRun='run:foreign';return ()=>{currentRun=old;};}],
    ['unknown admission',()=>swap(currentAdmission,'invocationAdmissionRef','invocation:forged')],['forged root digest',()=>swap(currentRoot,'graphFunctionDigest',zeroDigest)],
    ['crossed invocation',()=>swap(currentAdmission,'invocationRef','invocation-ref:forged')],['crossed start',()=>swap(currentAdmission.publicStart,'graphFunctionRef','graph:foreign')],
    ['absent root',()=>swap(currentRoot,'basisRef','basis:other-root')]]){
    const undo=change();try{assert.deepEqual(m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied,lookup),
      {kind:'native_instruction_assembly_refusal',cause:'unknown_dependency',policy:null,role:'selector',unresolvedRefs:[execution.invocationAdmissionRef]},label);}finally{undo();}
  }
  assert.deepEqual(m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied,lookup),assembly,'the restored premises reproduce the same assembly');
  const canonical=assembly.envelope.sections.response;
  assert.deepEqual(canonical,product.framedSynthesisResponseSchema(supplied,assembly.envelope.targetBindings));assert.ok(canonical.anyOf.length>0,'canonical target/source constraints remain intact');
  assert.equal(assembly.plan.responsePresentation,undefined);assert.equal(assembly.request.responsePresentation,undefined);
  assert.deepEqual(Object.keys(response).sort(),['additionalProperties','properties','required','type']);
  for(const key of Object.keys(response))assert.deepEqual(response[key],canonical[key],key+' is conserved from the canonical owner');
  for(const key of ['anyOf','oneOf','allOf'])assert.equal(Object.hasOwn(response,key),false,'provider root has no '+key);
  assert.equal(assembly.plan.canonicalResponseSchemaDigest,product.sha256Canonical(canonical));assert.equal(assembly.plan.carrierResponseSchemaDigest,product.sha256Canonical(response));
  assert.notEqual(assembly.plan.canonicalResponseSchemaDigest,assembly.plan.carrierResponseSchemaDigest,'shape carrier is not the canonical semantic schema');
  assert.equal(assembly.manifest.canonicalResponseSchemaDigest,assembly.plan.canonicalResponseSchemaDigest);assert.equal(assembly.manifest.responseSchemaDigest,assembly.plan.carrierResponseSchemaDigest);
  const transport=await import(pathToFileURL(resolve(packageRoot,'build/code/src/abg/transport_contracts.js')).href);
  const argsInput={contract:transport.constructKnownWorkerTransportContract('claude',{environment:{}}),prompt:rendered,outputPath:'/unused-selector-output.json',lane:assembly.request.transportLane,responseJsonSchema:response,environment:{}};
  const args=transport.composeWorkerTransportArgs(argsInput);
  assert.equal(args.filter(arg=>arg==='--json-schema').length,1);assert.deepEqual(JSON.parse(args.at(-1)),response);
  assert.deepEqual(args.slice(-5,-2),['--safe-mode','--tools','']);
  for(const rule of ['at most one contribution row per graphFunctionRef','different contribution row in THIS response; no self-dependency','admitted evidenceRefs, not dependsOn','null with nonempty gaps and null subjectEvidenceRef','For UAT, subjectEvidenceRef must select','For Testing, optionally select','For other work or a gap, subjectEvidenceRef must be null'])assert.ok(rendered.includes(rule),rule);
  assert.match(response.properties.contributions.description,/one contribution row per graphFunctionRef/);
  assert.match(response.properties.contributions.items.properties.dependsOn.description,/different contribution in THIS response/);
  assert.match(response.properties.nextGraphFunctionRef.description,/gaps must be nonempty and subjectEvidenceRef must be null/);
  assert.equal(JSON.parse(JSON.stringify(assembly)).manifest.runEnvironment.invocationAdmissionRef,execution.invocationAdmissionRef);
  assert.equal(m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,supplied).cause,'unknown_dependency');
  for(const missing of [call.inputContractRef,call.outputContractRef,graph.declarations['abg.raw_result_contract'],product.governanceContract('state')])
    assert.equal(m.namespace.evaluateFramedSynthesisInstructionAssembly({...candidate,publication:library},supplied,ref=>ref===missing?null:lookup(ref)).cause,'unknown_dependency');
  const target=targets.find(g=>g.declarations['abg.default_library_purpose']==='testing');
  const raw={interpretation:'Measure supplied candidate against original criteria.',contributions:[{graphFunctionRef:target.name,contribution:'Actual measurements',reason:'No execution evidence yet',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[context.observationRef],dependsOn:[]}],gaps:[],nextGraphFunctionRef:target.name,nextReason:'Measure current files',nextEvidenceRefs:[context.observationRef],subjectEvidenceRef:null,revisionReason:'Initial judgment',revisionEvidenceRefs:[]};
  const hook=await import('../../build/code/src/implementation/default_library.js'),port=await import('../../build/code/src/implementation/leaf_invocation_port.js');
  // Actual exported hook and actual prepared-port guard; this test supplies the
  // same controlled owned-assembly premise as above and never invokes an actor.
  const prepared=await port.invokeLeafOwnerBoundary({resolution:hook.GOVERNANCE_SELECTOR_DESCRIPTOR,value:supplied,inputDigest:owner.inputDigest,failureValueKind:'governance_failure',verifyAuthority:()=>true,validateSuccess:product.isFramedSynthesisResult,
    resolveWorkerContracts:()=>({instructionContractRef:call.inputContractRef,resultContractRef:graph.declarations['abg.raw_result_contract']}),occurrence:{cCallRef:call.cCallRef,runId:'run:unit',graphCallId:'graph-call:unit',frameId:'frame:unit',programLocusRef:node.nodeRef,taskOrdinal:null,attempt:0,executionAuthority:null},contractByRef:lookup,
    loadImplementation:async()=> (value,occurrence)=>hook.selectGovernanceWork(value,occurrence,()=>assembly)});
  assert.equal(prepared.kind,'prepared_probabilistic_leaf_owner_invocation',JSON.stringify(prepared));assert.deepEqual(prepared.workerRequest,assembly.request);
  const bound=product.bindFramedSynthesisResult(supplied,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw);assert.ok(bound);assert.deepEqual(bound.judgment,raw);assert.equal(bound.state,state);
  const observation={disposition:'success',toolCallCount:0,finalOutput:JSON.stringify(raw),inputDigest:owner.inputDigest,implementationRef:call.implementationRef};
  const check=(value=bound,obs=observation,b=candidate)=>m.namespace.framedSynthesisInstructionResultMatches(b,supplied,value,obs,lookup);
  const complete=text=>hook.selectGovernanceWork(supplied,{},()=>assembly).complete({request:assembly.request,observation:{...observation,promptDigest:assembly.manifest.promptDigest,finalOutput:text}});
  assert.deepEqual(complete(JSON.stringify(raw)).resultCandidate,bound);
  const worker=await import(pathToFileURL(resolve(packageRoot,'build/code/src/abg/worker_transport.js')).href);
  const structuredRaw=line=>{const observer=worker.createWorkerTransportOutputObserver(true);observer.observe(line+'\n');return observer.finish().finalOutput;};
  const successfulCarrier=JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:raw});
  const structured=structuredRaw(successfulCarrier);assert.deepEqual(complete(structured).resultCandidate,bound);assert.equal(check(bound,{...observation,finalOutput:structured}),true);
  for(const line of ['', '{', '{"type":"result","subtype":"success","is_error":false,"structured_output":'+JSON.stringify(raw)+',"structured_output":'+JSON.stringify(raw)+'}',
    JSON.stringify({type:'result',subtype:'success',is_error:false,result:'```json\n'+JSON.stringify(raw)+'\n```'})]){
    const rejected=structuredRaw(line);assert.equal(rejected,'');assert.throws(()=>complete(rejected));assert.equal(check(bound,{...observation,finalOutput:rejected}),false);
  }
  for(const text of ['', '{', 'null', '{"interpretation":"duplicate",'+JSON.stringify(raw).slice(1)]){
    assert.throws(()=>complete(text));assert.equal(check(bound,{...observation,finalOutput:text}),false);
  }
  assert.equal(check(),true);assert.equal(check({...bound,judgment:{...raw,nextReason:'rewritten'}}),false);assert.equal(check({...bound,basis:{...bound.basis,frameEvidenceDigest:product.sha256Canonical('crossed')}}),false);
  assert.equal(check(bound,{...observation,inputDigest:product.sha256Canonical('crossed')}),false);assert.equal(check(bound,{...observation,finalOutput:JSON.stringify({...raw,extra:'discard me'})}),false);
  const {framedSynthesisNativeRole:profile}=await import('../../build/code/src/gtl/stdo_run_environment.js');
  const unrelated=structuredClone(graph);delete unrelated.declarations['abg.framed_synthesis_locus'];assert.equal(profile(library,execution.programRef,unrelated,node.nodeRef),null);
  const invalid=structuredClone(graph);invalid.declarations['abg.framed_synthesis_projection']='node:missing';assert.equal(profile(library,execution.programRef,invalid,node.nodeRef),false);assert.equal(check(bound,observation,{...candidate,graphFunction:invalid}),false);
  const bind=raw=>product.bindFramedSynthesisResult(supplied,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw);
  for(const invalid of [{...raw,nextGraphFunctionRef:'graph:foreign'},{...raw,contributions:[...raw.contributions,...raw.contributions]},
    {...raw,contributions:[{...raw.contributions[0],dependsOn:[target.name]}]}, {...raw,nextEvidenceRefs:['result:invented']}, {...raw,subjectEvidenceRef:'result:invented'},
    {...raw,contributions:[{...raw.contributions[0],dependsOn:[targets.find(t=>t.name!==target.name).name]}]},
    {...raw,nextGraphFunctionRef:targets.find(t=>t.name!==target.name).name}, {...raw,nextGraphFunctionRef:null},
    {...raw,contributions:[{...raw.contributions[0],supportRefs:['support:foreign']}]}])assert.equal(bind(invalid),null);
  const gap=bind({...raw,contributions:[],nextGraphFunctionRef:null,gaps:[{supportRefs:state.unresolvedSupportRefs,reason:'Missing capability',evidenceRefs:[]}]});assert.ok(gap);
  const current={resultRef:'result:synthesis',resultDigest:product.sha256Canonical(bound),basis:bound.basis,judgment:bound.judgment};
  assert.ok(product.isGovernanceWorkState({...state,synthesis:current}));assert.equal(product.isGovernanceWorkState({...state,synthesis:{...current,state}}),false,'prior whole state is refused');
  assert.equal(product.isGovernanceWorkState({...state,synthesis:{...current,result:bound}}),false,'prior whole Result is refused');
  const later={...supplied,state:{...state,synthesis:current}},laterBasis={...bound.basis,previousResultRef:current.resultRef};
  const revision=product.bindFramedSynthesisResult(later,assembly.envelope.targetBindings,laterBasis,{...raw,revisionReason:'Retained judgment reconsidered',revisionEvidenceRefs:[current.resultRef]});assert.ok(revision);
  assert.equal(product.bindFramedSynthesisResult(later,assembly.envelope.targetBindings,bound.basis,raw),null,'revision must name exact prior result');
  assert.deepEqual(Object.keys(revision.state.synthesis).sort(),['basis','judgment','resultDigest','resultRef']);
  const invocation={invocationRef:'invocation:unit',invocationAdmissionRef:execution.invocationAdmissionRef,capabilityGrants:[f.capabilityGrant]},projection=graph.template.nodes.find(n=>n.nodeRef===graph.declarations['abg.framed_synthesis_projection']);
  const origin={kind:'c_call_result_admitted',runId:'run:unit',basisId:execution.basisRef,graphCallId:'graph-call:unit',aggregateId:call.cCallRef,payload:{resultClass:'success',resultRef:'result:unit',resultDigest:product.sha256Canonical(bound)}};
  const projectionOwner={...owner,inputValue:bound,inputRef:origin.payload.resultRef,inputOrigin:{event:origin},execution:{...execution,rootImplementationSetRef:'set:unit',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root-unit'},environment:{kind:'exact_prefix_workspace_environment'},prefix:{},call:{...call,runId:'run:unit',graphCallId:'graph-call:unit',implementationRef:product.governanceRef('implementation','project-choice'),outputContractRef:product.governanceContract('choice')}};
  const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:'basis:root-unit',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:'set:unit',rawInputValue:state}},opened={kind:'c_call_opened',runId:'run:unit',basisId:execution.basisRef,payload:{programLocusRef:node.nodeRef}};
  const projectionIndex=(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:[opened],projectionRoot=await rootProjection(projectionIndex,rootBasis(root,projectionOwner.execution));
  const projectionFile=resolve(packageRoot,'build/code/src/abg/default_library.js'),projectionModule=new SourceTextModule(await readFile(projectionFile,'utf8'),{identifier:projectionFile});
  await projectionModule.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(projectionFile),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>projectionOwner}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:projectionIndex}:specifier==='./semantic_job.js'?projectionRoot:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await projectionModule.evaluate();
  const projectionBasis={graphFunction:graph,cursor:{currentNodeRef:projection.nodeRef,termPath:gtl.rootCSourcePath(projection.nodeRef)}};
  const choice=projectionModule.namespace.projectGovernanceChoice(projectionBasis,bound);assert.ok(choice);assert.equal(choice.graphFunctionRef,raw.nextGraphFunctionRef);assert.equal(choice.reason,raw.nextReason);assert.deepEqual(choice.input.value.original,state.original);assert.deepEqual(choice.input.value.synthesis,current.resultRef==='result:unit'?current:{...current,resultRef:'result:unit'});
  origin.basisId='basis:foreign';assert.equal(projectionModule.namespace.projectGovernanceChoice(projectionBasis,bound),null);origin.basisId=execution.basisRef;
  projectionOwner.inputValue=gap;assert.equal(projectionModule.namespace.projectGovernanceChoice(projectionBasis,gap).disposition,'gap');

  // Actual binder -> admitted-choice projection -> typed native preparation,
  // under the controlled occurrence/index premises disclosed above. No actor
  // or application work is supplied by this counterexample.
  const construction=targets.find(g=>g.declarations['abg.default_library_purpose']==='construction');
  const increment={...raw.contributions[0],graphFunctionRef:construction.name,
    contribution:'Inspect only the current candidate and report its remaining gaps.',
    reason:'Full testing and independent acceptance remain parent obligations.'};
  const narrow=bind({...raw,interpretation:'The original task requires several iterations.',contributions:[increment],
    nextGraphFunctionRef:construction.name,nextReason:'One bounded inspection before reassessment.'});assert.ok(narrow);
  projectionOwner.inputValue=narrow;origin.payload.resultDigest=product.sha256Canonical(narrow);
  const selected=projectionModule.namespace.projectGovernanceChoice(projectionBasis,narrow).input.value;
  assert.deepEqual(selected.original,state.original);assert.deepEqual(selected.unresolvedSupportRefs,state.unresolvedSupportRefs);
  Object.assign(projectionOwner.execution,{workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest});
  projectionOwner.environment={kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]};
  const prepare=async input=>{projectionOwner.inputValue=input;projectionOwner.call.implementationRef=product.governanceRef('implementation','prepare-native');return projectionModule.namespace.projectGovernanceNativeTask({graphFunction:construction},input);};
  const selectedTask=await prepare(selected),native=await import('../../build/code/src/product/native_workspace_work.js');
  assert.ok(native.isNativeWorkspaceWorkTask(selectedTask));
  const selectedInstruction=selectedTask.instructions.find(i=>i.startsWith('Current admitted selection for this work unit: '));assert.ok(selectedInstruction);
  const selectedMeaning=JSON.parse(selectedInstruction.slice(selectedInstruction.indexOf(': ')+2));
  assert.deepEqual(selectedMeaning.contributions,[increment]);assert.equal(selectedMeaning.interpretation,narrow.judgment.interpretation);
  assert.equal(selectedMeaning.nextReason,narrow.judgment.nextReason);assert.equal(selectedMeaning.resultRef,origin.payload.resultRef);
  assert.equal(selectedMeaning.resultDigest,origin.payload.resultDigest);assert.deepEqual(selectedMeaning.nextEvidenceRefs,narrow.judgment.nextEvidenceRefs);
  const order=state.original.workOrders.construction;
  assert.notEqual(increment.contribution,order.outcome);assert.equal(selectedTask.outcome,increment.contribution,'operative child goal is the selected increment');
  for(const key of ['readFirst','writeRoots','checks'])assert.deepEqual(selectedTask[key],order[key],key+' stays caller-owned');
  assert.deepEqual(selectedTask.capabilityGrant,f.capabilityGrant);assert.ok(selectedTask.instructions.includes('Supplied purpose outcome (parent context): '+order.outcome));
  assert.ok(selectedTask.instructions.includes('Conserved original task: '+state.original.task));
  assert.ok(selectedTask.instructions.includes('Unresolved parent outcomes: '+JSON.stringify(state.unresolvedSupportRefs)));
  assert.equal(projectionModule.namespace.governanceResultMatches({graphFunction:construction},selected,selectedTask),true);
  const renderedWork=native.renderNativeWorkspaceWorkOrder(selectedTask);
  assert.ok(renderedWork.includes('Outcome: '+increment.contribution));assert.equal(renderedWork.includes('Outcome: '+order.outcome),false,'the broader parent goal is not rendered as the operative child goal');
  assert.ok(selectedTask.instructions.some(i=>i.includes('return a truthful partial report')),'author work may yield a bounded partial report');
  assert.deepEqual(native.nativeWorkspaceWorkResponseSchema(selectedTask).required,['summary','gaps']);
  const directTask=await prepare(state);assert.ok(native.isNativeWorkspaceWorkTask(directTask));
  assert.equal(directTask.outcome,order.outcome,'direct calls retain the supplied goal');
  assert.equal(directTask.instructions.some(i=>i===selectedInstruction),false);
  projectionOwner.inputValue=selected;
  assert.equal(projectionModule.namespace.governanceResultMatches({graphFunction:construction},selected,directTask),false,'old global-only adaptation cannot satisfy the selected preparation');
  const otherChoice={...selected,synthesis:choice.input.value.synthesis};
  const otherTask=await prepare(otherChoice);assert.deepEqual(otherTask.instructions,directTask.instructions,'an unrelated selected purpose is not imported');assert.equal(otherTask.outcome,order.outcome);

  const partial=native.constructNativeWorkspaceWorkObservation(selectedTask,selectedTask.context,
    {summary:'Controlled bounded inspection report.',gaps:['Parent testing and independent acceptance remain.']},
    {cCallRef:'call:partial',executionAuthorityRef:'authority:unit',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:unit',transportBindingRef:'transport:unit',transportBindingDigest:product.sha256Canonical('transport'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')});
  const retained=product.constructRetainedGraphInput(selected,partial),partialEvent={kind:'c_call_result_admitted',runId:'run:unit',basisId:'basis:child',aggregateId:'call:partial',payload:{resultClass:'success',resultRef:'result:partial',resultDigest:product.sha256Canonical(partial),value:partial}};
  projectionOwner.inputValue=retained;projectionOwner.call.implementationRef=product.governanceRef('implementation','fold');
  projectionOwner.inputOrigin={retainedProjection:{entryBasis:projectionOwner.execution,input:{admissionRef:projectionOwner.inputRef,value:retained},sourceResult:partialEvent}};
  const folded=projectionModule.namespace.projectGovernanceFold({graphFunction:construction},retained);assert.ok(folded);
  assert.deepEqual(folded.original,state.original);assert.deepEqual(folded.unresolvedSupportRefs,state.unresolvedSupportRefs);
  assert.equal(folded.terminal,false);assert.equal(folded.observations.at(-1).resultRef,partialEvent.payload.resultRef);
  assert.deepEqual(folded.observations.at(-1).value.report,partial.report);
  projectionOwner.inputValue=folded;projectionOwner.call.implementationRef=product.governanceRef('implementation','evaluate-parent');
  assert.deepEqual(projectionModule.namespace.projectGovernanceParent({},folded),folded,'partial work returns for parent reassessment');
  const reentered={...supplied,state:folded},reentryBasis={...narrow.basis,inputRef:'input:after-partial',inputDigest:product.sha256Canonical(reentered),previousResultRef:folded.synthesis.resultRef};
  const next=product.bindFramedSynthesisResult(reentered,assembly.envelope.targetBindings,reentryBasis,{...raw,nextReason:'Measure after the bounded inspection.',nextEvidenceRefs:[partialEvent.payload.resultRef],revisionReason:'The partial inspection is now admitted.',revisionEvidenceRefs:[folded.synthesis.resultRef]});assert.ok(next);
  projectionOwner.inputValue=next;projectionOwner.inputOrigin={event:origin};projectionOwner.call.implementationRef=product.governanceRef('implementation','project-choice');origin.payload.resultDigest=product.sha256Canonical(next);
  const nextChoice=projectionModule.namespace.projectGovernanceChoice(projectionBasis,next);assert.equal(nextChoice.graphFunctionRef,target.name);
  assert.deepEqual(nextChoice.input.value.original,state.original);assert.deepEqual(nextChoice.input.value.observations,folded.observations);assert.equal(nextChoice.input.value.synthesis.basis.previousResultRef,folded.synthesis.resultRef);

});

/** Actual assembly/result owners with controlled authentication premises. This
 * never authenticates an installed occurrence or invokes an actor. */
async function planningAssemblyFor(task,{oldProjectorSource}={}) {
  const {consumerDeclaration,IDS}=await import('../uat/consumer.mjs');
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis);
  const data=consumerDeclaration(gtl,product,library,1000),publication=gtl.modulePublication({...data,
    artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.productManifestDigest,
    contributions:data.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest]}))});
  const graph=publication.graphFunctions.find(g=>g.name===IDS.stepRef),node=graph.template.nodes.find(n=>n.term.programLocusRef===product.governanceRef('node','select'));
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']),role=publication.runEnvironments[0].roles.find(r=>r.role==='selector');
  const call={regime:'F_P',cCallRef:'call:controlled-planning',cCallDigest:product.sha256Canonical('call'),runId:'run:controlled-planning',graphFunctionRef:graph.name,
    programLocusRef:node.nodeRef,inputContractRef:node.term.inputCarrierRef,outputContractRef:node.term.outputCarrierRef,implementationRef:product.governanceRef('implementation','select')};
  const execution={programRef:IDS.programRef,basisRef:'basis:controlled-planning',basisDigest:product.sha256Canonical('basis'),basisClass:'child',
    parentExecutionBasisRef:'basis:controlled-planning-root',invocationAdmissionRef:'invocation:controlled-planning',invocationRef:'invocation-ref:controlled-planning',
    graphFunctionRef:graph.name,registeredSelectionDefinitionDigests:Object.fromEntries(targets.map(g=>[g.name,product.sha256Canonical(g)]))};
  // Controlled current-binding premises: one exact admission, its Run segment and the governance root of the executing step.
  const rootGraph=[...publication.graphFunctions,...library.graphFunctions].find(g=>g.template.applications.some(a=>a.relationKind==='recurse'&&a.graphFunctionRef===graph.name));
  const rootRef=rootGraph?.name??'graph-function:controlled-planning-root',rootDigest=product.sha256Canonical(rootGraph??rootRef);
  const admission={invocationAdmissionRef:execution.invocationAdmissionRef,invocationRef:execution.invocationRef,invocationVariant:'direct',programRef:execution.programRef,
    graphFunctionRef:rootRef,graphFunctionDigest:rootDigest,publicStart:null,sourceResultBasis:null};
  const rootExecution={basisClass:'root',basisRef:execution.parentExecutionBasisRef,parentExecutionBasisRef:null,invocationAdmissionRef:admission.invocationAdmissionRef,
    invocationRef:admission.invocationRef,programRef:execution.programRef,graphFunctionRef:rootRef,graphFunctionDigest:rootDigest};
  const owner={events:[],call,execution,graph:{template:graph.template},inputValue:task,inputDigest:product.sha256Canonical(task),inputRef:'input:controlled-planning',program:publication.programs[0]};
  const candidate={publication,graphFunction:graph,declarationGraphFunctions:[...publication.graphFunctions,...library.graphFunctions],
    executionBasis:execution,cCall:call,cursor:{currentNodeRef:node.nodeRef,termPath:gtl.rootCSourcePath(node.nodeRef)},predecessorPrefix:{}};
  const source=await import('../../build/code/src/gtl/default_library.js');
  const sourceContent=await Promise.all(role.sourceBindings.map(async binding=>{
    const member=publication.runEnvironments[0].contexts.find(context=>context.contextRef===binding.contextRef).members.find(member=>member.memberRef===binding.memberRef);
    const asset=Object.values(source.DEFAULT_LIBRARY_STDO_SOURCE.members).find(asset=>asset.path===member.path);
    const bytes=await readFile(join(packageRoot,asset.assetPath));assert.equal(product.sha256Bytes(bytes),binding.memberDigest);
    const span=bytes.subarray(binding.startByte,binding.endByte);assert.equal(product.sha256Bytes(span),binding.spanDigest);
    return {...binding,path:member.path,sourceLocator:source.DEFAULT_LIBRARY_STDO_SOURCE.basisRef,text:new TextDecoder('utf-8',{fatal:true}).decode(span)};
  }));
  let oldProjector;
  if(oldProjectorSource){
    const {default:ts}=await import('typescript'),file=resolve(packageRoot,'build/code/src/product/default_library.js');
    const old=new SourceTextModule(ts.transpileModule(await readFile(oldProjectorSource,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText,{identifier:file});
    await old.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href);
      return new SyntheticModule(Object.keys(actual),function(){for(const[k,v]of Object.entries(actual))this.setExport(k,v);});});
    await old.evaluate();oldProjector=old.namespace.projectFramedSynthesisPromptTask;
  }
  const file=resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async s=>{const actual=await import(s.startsWith('node:')?s:pathToFileURL(resolve(dirname(file),s)).href);
    const replacements=s==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owner}:
      s==='./stdo_environment.js'?{projectRunEnvironmentRoleEvidenceAtPrefix:()=>({...role,invocationAdmissionRef:execution.invocationAdmissionRef,
        environmentRef:publication.runEnvironments[0].declarationRef,environmentDigest:product.sha256Canonical(publication.runEnvironments[0]),
        evidenceDigest:product.sha256Canonical('evidence'),contextPolicyDigest:product.sha256Canonical(role.contextPolicy),sourceContent,accessContent:[]})}:
      s==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:(_p,ref)=>ref===admission.invocationAdmissionRef?admission:null,
        hasExactInvocationRunBindingAtPrefix:(_p,a,runId)=>a===admission&&runId===call.runId}:
      s==='./semantic_job.js'?{semanticJobRootAtPrefix:(_p,e)=>e.parentExecutionBasisRef===rootExecution.basisRef?rootExecution:null}:
      s==='../product/default_library.js'&&oldProjector?{projectFramedSynthesisPromptTask:oldProjector}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();const lookup=ref=>[...publication.contracts,...library.contracts].find(c=>c.contractRef===ref)??null;
  return m.namespace.evaluateFramedSynthesisInstructionAssembly(candidate,task,lookup);
}
function planningFactCorrespondence(task,view) {
  assert.equal(view.originalTask,task.state.original.task);assert.deepEqual(view.testing,task.state.original.testing);
  assert.deepEqual(view.unresolvedSupportRefs,task.state.unresolvedSupportRefs);
  assert.deepEqual(view.priorJudgment,task.state.synthesis===null?null:{resultRef:task.state.synthesis.resultRef,judgment:task.state.synthesis.judgment});
  assert.equal(view.observations.length,task.state.observations.length);
  for(const[i,source]of task.state.observations.entries()){
    const shown=view.observations[i];
    for(const key of ['resultRef','resultDigest','cCallRef','actorInvocationRef','purpose','selectedGraphFunctionRef','synthesisResultRef'])assert.deepEqual(shown[key],source[key]);
    if(source.purpose!=='testing'){assert.deepEqual(shown.observed,source.value);continue;}
    for(const[j,row]of source.value.commandResults.entries()){
      const command=shown.observed.commandResults[j];
      for(const[k,v]of Object.entries(row))if(!['stdout','stderr'].includes(k))assert.deepEqual(command[k],v);
      for(const lane of ['stdout','stderr']){
        const stream=row[lane],display=command[lane];if(!stream||!['utf8','base64'].includes(stream.encoding)){assert.deepEqual(display,stream);continue;}
        const raw=stream.encoding==='utf8'?Buffer.from(stream.text):Buffer.from(stream.payload,'base64');
        const strict=(()=>{try{new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(raw);return true;}catch{return false;}})();
        // A strict UTF-8 stream within the 8192-byte allowance is the whole cited body; any other stream is an explicit omission.
        const whole=strict&&raw.length<=8192&&(stream.byteLength===undefined||stream.byteLength===raw.length)&&(stream.digest===undefined||stream.digest===product.sha256Bytes(raw));
        assert.deepEqual(display.rawBody,{resultRef:source.resultRef,resultDigest:source.resultDigest,fieldPath:['commandResults',j,lane],omittedFromPlanningView:!whole});
        assert.equal(display.digest,stream.digest);assert.equal(display.byteLength,stream.byteLength);assert.equal(display.displayOnly,true);
        assert.ok(!Object.hasOwn(display,'text')&&!Object.hasOwn(display,'payload'));
        assert.equal(display.complete,whole);
        if(!strict){assert.equal(display.displayUnavailable,'not_utf8');assert.deepEqual(display.excerpts,[]);assert.equal(display.omittedByteCount,raw.length);continue;}
        let count=0;for(const excerpt of display.excerpts){assert.equal(raw.subarray(excerpt.startByte,excerpt.endByte).toString(),excerpt.text);count+=excerpt.endByte-excerpt.startByte;}
        assert.equal(count,display.displayedByteCount);assert.ok(count<=8192&&display.excerpts.length<=32);
        assert.equal(display.omittedByteCount,raw.length-count);
        if(whole){assert.equal(count,raw.length);assert.equal(display.omittedCandidates,0);assert.ok(Buffer.from(display.excerpts.map(e=>e.text).join('')).equals(raw),'the whole cited bytes');}
        else if(raw.length>8192)assert.ok(display.omittedByteCount>0,'a longer stream never claims completeness');
      }
    }
    for(const[j,row]of source.value.predicateObservations.entries()){
      const shownPredicate=shown.observed.predicateObservations[j];
      for(const[k,v]of Object.entries(row))if(k!=='evidence')assert.deepEqual(shownPredicate[k],v);
      assert.deepEqual(shownPredicate.evidenceBody,{resultRef:source.resultRef,resultDigest:source.resultDigest,fieldPath:['predicateObservations',j,'evidence'],omittedFromPlanningView:true});
    }
  }
}
test('selector planning preserves provenance, adverse values and bounded Unicode diagnostic ranges',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=structuredClone(await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}));
  const context=await physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  const text='ordinary line\n'.repeat(2400)+'[info] - controlled Ω😀 named diagnostic *** FAILED ***\n[error] exact application red\n';
  const stream=text=>({encoding:'utf8',text,digest:product.sha256Bytes(Buffer.from(text)),byteLength:Buffer.byteLength(text)});
  // Constructed planning carrier, no C2 execution/admission claim.
  state.observations=[{purpose:'testing',resultRef:'result:controlled',resultDigest:product.sha256Canonical('controlled'),cCallRef:'call:controlled',
    actorInvocationRef:'actor:controlled',selectedGraphFunctionRef:product.governanceRef('graph-function','testing'),synthesisResultRef:'result:selection',
    value:{commandResults:[{commandId:'command:controlled',observationRef:'observation:command',observationDigest:product.sha256Canonical('command'),
      exitStatus:1,timedOut:false,processSignal:null,terminationConfirmed:false,unknownStatus:null,stdout:stream(text),
      stderr:stream('\uFEFF*** '+ 'Ω😀'.repeat(2400)+'\n'),reports:[{relativePath:'report.xml',state:'absent',digest:null,byteLength:null,observationRef:'report:missing'}]}],
      predicateObservations:[{predicateId:'predicate:controlled',predicateKind:'process_exit',observedValue:1,evidenceRefs:['observation:command'],evidence:[{opaque:'full proof'}]},
        {predicateId:'predicate:unknown',predicateKind:'unknown',observedValue:null,evidenceRefs:[],evidence:[]}]}}];
  const task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context},before=product.sha256Canonical(task);
  const view=product.projectFramedSynthesisPromptTask(task);planningFactCorrespondence(task,view);
  assert.ok(view.observations[0].observed.commandResults[0].stdout.excerpts.some(e=>e.text.includes('controlled Ω😀 named diagnostic')));
  assert.ok(view.observations[0].observed.commandResults[0].stderr.omittedCandidates>0);
  assert.equal(product.sha256Canonical(task),before);assert.equal(product.governanceVerdict(state),false);
  for(const text of ['\uFEFFa\n','\uFEFF[error] Ω😀 exact\n','[error] plain Ω😀\n'])for(const encoding of ['utf8','base64']){
    const sample=structuredClone(task),bytes=Buffer.from(text),row=sample.state.observations[0].value.commandResults[0];
    row.stdout={encoding,...(encoding==='utf8'?{text}:{payload:bytes.toString('base64')}),digest:product.sha256Bytes(bytes),byteLength:bytes.length};
    const projected=product.projectFramedSynthesisPromptTask(sample);planningFactCorrespondence(sample,projected);
    const displayed=projected.observations[0].observed.commandResults[0].stdout;
    assert.equal(displayed.excerpts[0].startByte,0);assert.equal(displayed.excerpts[0].text,text);
    assert.equal(Buffer.from(displayed.excerpts[0].text).equals(bytes),true,'literal display preserves the complete cited bytes');
  }
  const assembly=await planningAssemblyFor(task);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
  assert.ok(Buffer.byteLength(assembly.request.prompt)<=state.original.maxPromptBytes);
  const target=assembly.envelope.targetBindings.find(t=>t.purpose==='construction'),raw={interpretation:'Application remains non-green.',
    contributions:[{graphFunctionRef:target.graphFunctionRef,contribution:'Inspect the reported gap.',reason:'The measurement is adverse.',supportRefs:state.unresolvedSupportRefs,evidenceRefs:['result:controlled'],dependsOn:[]}],
    gaps:[],nextGraphFunctionRef:target.graphFunctionRef,nextReason:'Correct bounded work then reassess.',nextEvidenceRefs:['result:controlled'],subjectEvidenceRef:null,revisionReason:'Initial',revisionEvidenceRefs:[]};
  const bound=product.bindFramedSynthesisResult(task,assembly.envelope.targetBindings,assembly.envelope.boundBasis,raw);assert.ok(bound);assert.deepEqual(bound.state,state);assert.deepEqual(bound.judgment,raw);
  const oversized=structuredClone(task);oversized.state.original.task='x'.repeat(state.original.maxPromptBytes+1);
  assert.equal((await planningAssemblyFor(oversized)).cause,'declared_bound_overflow');
});
test('selector planning delivers a short strict UTF-8 stream whole and keeps longer, binary or unverified streams as explicit omissions',async()=>{
  // Retained RC2 witness, self-contained: the actual 4616-byte strict UTF-8 stdout whose ENOENT the cue display dropped,
  // with its historical producer citation. No operator path is read; the digest check binds these bytes to the citation.
  const custody=RETAINED_STDOUT_CUSTODY,witness=Buffer.from(RETAINED_STDOUT_BASE64,'base64');
  assert.equal(witness.length,4616);assert.equal(witness.length,custody.streamBytes);assert.equal(product.sha256Bytes(witness),custody.declaredStreamDigest);
  assert.equal(custody.declaredStreamDigest,'sha256:bee000fc220e14f318f5b37558dc96d113ef3428ad7d9d0a0043b7aa4a9787b6');assert.equal(custody.streamSha256,custody.declaredStreamDigest.slice(7));
  const stream=(bytes,encoding='base64',digest=product.sha256Bytes(bytes))=>({kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding,
    ...(encoding==='utf8'?{text:bytes.toString()}:{payload:bytes.toString('base64')}),byteLength:bytes.length,digest});
  // Constructed planning carrier over the retained producer coordinates; no new admission or event is claimed.
  const project=(stdout,stderr=stream(Buffer.alloc(0)))=>{
    const observation={purpose:'testing',resultRef:custody.admittedTestingResult,resultDigest:'sha256:'+custody.admittedTestingResult.slice(-64),cCallRef:'call:retained',
      actorInvocationRef:'actor:retained',selectedGraphFunctionRef:product.governanceRef('graph-function','testing'),synthesisResultRef:'result:selection',
      value:{commandResults:[{commandId:custody.commandId,ordinal:custody.ordinal,observationRef:custody.observationRef,observationDigest:custody.observationDigest,
        exitStatus:1,timedOut:false,processSignal:null,terminationConfirmed:true,unknownStatus:null,stdout,stderr}],
        predicateObservations:[{predicateId:'predicate:exit',predicateKind:'process_exit',observedValue:1,evidenceRefs:[custody.observationRef],evidence:[{opaque:'full proof'}]},
          {predicateId:'predicate:unknown',predicateKind:'unknown',observedValue:null,evidenceRefs:[],evidence:[]}]}};
    const state={original:{},observations:[observation]},before=product.sha256Canonical(state),facts=product.projectGovernanceObservationFacts(state,{entries:[]});
    assert.equal(product.sha256Canonical(state),before);assert.equal(facts.length,1);
    for(const key of ['resultRef','resultDigest','cCallRef','actorInvocationRef','purpose','selectedGraphFunctionRef','synthesisResultRef'])assert.equal(facts[0][key],observation[key]);
    const row=facts[0].observed.commandResults[0];
    for(const key of ['commandId','ordinal','observationRef','observationDigest','exitStatus','timedOut','processSignal','terminationConfirmed','unknownStatus'])assert.deepEqual(row[key],observation.value.commandResults[0][key]);
    for(const[j,p]of facts[0].observed.predicateObservations.entries()){const{evidence,...rest}=observation.value.predicateObservations[j];
      assert.deepEqual(p,{...rest,evidenceBody:{resultRef:observation.resultRef,resultDigest:observation.resultDigest,fieldPath:['predicateObservations',j,'evidence'],omittedFromPlanningView:true}});}
    for(const lane of ['stdout','stderr']){assert.equal(row[lane].digest,observation.value.commandResults[0][lane].digest);assert.equal(row[lane].byteLength,observation.value.commandResults[0][lane].byteLength);
      assert.deepEqual(row[lane].rawBody,{resultRef:observation.resultRef,resultDigest:observation.resultDigest,fieldPath:['commandResults',0,lane],omittedFromPlanningView:!row[lane].complete});
      assert.ok(!Object.hasOwn(row[lane],'text')&&!Object.hasOwn(row[lane],'payload'));}
    return row;};
  const whole=(shown,bytes)=>{assert.equal(shown.complete,true);assert.equal(shown.displayedByteCount,bytes.length);assert.equal(shown.omittedByteCount,0);assert.equal(shown.omittedCandidates,0);
    assert.deepEqual(shown.excerpts,bytes.length===0?[]:[{startByte:0,endByte:bytes.length,text:shown.excerpts[0].text}]);
    assert.ok(Buffer.from(shown.excerpts.map(e=>e.text).join('')).equals(bytes),'byte-exact whole stream');};
  const omitted=(shown,bytes)=>{assert.equal(shown.complete,false);assert.ok(shown.omittedByteCount>0);
    if(shown.displayUnavailable==='not_utf8'){assert.deepEqual(shown.excerpts,[]);assert.equal(shown.omittedByteCount,bytes.length);return;}
    let count=0;for(const e of shown.excerpts){assert.ok(Buffer.from(e.text).equals(bytes.subarray(e.startByte,e.endByte)),'exact excerpt range');assert.ok(!e.text.includes('�'));count+=e.endByte-e.startByte;}
    assert.equal(count,shown.displayedByteCount);assert.ok(count<=8192&&shown.excerpts.length<=32);assert.equal(shown.omittedByteCount,bytes.length-count);};
  for(const encoding of ['base64','utf8']){
    const shown=project(stream(witness,encoding)).stdout;whole(shown,witness);
    assert.ok(shown.excerpts[0].text.includes('Error: ENOENT: no such file or directory')&&shown.excerpts[0].text.includes("code: 'ENOENT'"),'the retained diagnostic survives');
    assert.ok(shown.excerpts[0].text.includes('t287-native-semantic-revision.test.mjs'));
  }
  // BOM, CRLF and multi-byte Unicode, including a split-sensitive four-byte scalar at the 8192/8193 boundary.
  const unicode=Buffer.from('﻿first Ω\r\n😀 second\r\n\r\nlast without newline é');whole(project(stream(unicode),stream(unicode,'utf8')).stdout,unicode);
  assert.equal(project(stream(unicode)).stdout.excerpts[0].text.codePointAt(0),0xFEFF);
  const at8192=Buffer.from('a'.repeat(8188)+'😀'),at8193=Buffer.from('a'.repeat(8189)+'😀');assert.equal(at8192.length,8192);assert.equal(at8193.length,8193);
  whole(project(stream(at8192)).stdout,at8192);
  const clipped=project(stream(at8193)).stdout;omitted(clipped,at8193);
  assert.deepEqual(clipped.excerpts.map(e=>[e.startByte,e.endByte]),[[0,8189]],'a clipped range stops before the split scalar');assert.equal(clipped.omittedByteCount,4);
  // A long stream keeps the cue display and its exact citation; a mid-stream ENOENT without a cue is not claimed shown.
  const long=Buffer.concat([witness,Buffer.from('[error] exact application red\n'),witness]);const longShown=project(stream(long)).stdout;omitted(longShown,long);
  assert.ok(longShown.excerpts.some(e=>e.text.includes('[error] exact application red')));
  // Binary or invalid UTF-8, short and long: no excerpt, the whole length omitted.
  for(const bytes of [Buffer.from([0x48,0x69,0xff,0xfe,0x0a]),Buffer.concat([Buffer.from('ok\n'),Buffer.from([0xf0,0x9f,0x98])]),Buffer.concat([Buffer.alloc(9000,0x61),Buffer.from([0xc3])])]){
    const shown=project(stream(bytes)).stdout;assert.equal(shown.displayUnavailable,'not_utf8');omitted(shown,bytes);}
  // A short body that is not the cited stream (declared digest mismatch) never claims completeness.
  const unverified=project(stream(unicode,'base64',product.sha256Bytes(Buffer.from('other')))).stdout;assert.equal(unverified.complete,false);assert.equal(unverified.rawBody.omittedFromPlanningView,true);
  // Completeness needs a valid declared byte length and digest that both match: missing, malformed or mismatched metadata never claims it.
  const withMeta=(bytes,patch)=>{const s={...stream(bytes),...patch};for(const[k,v]of Object.entries(patch))if(v===undefined)delete s[k];return s;};
  for(const bytes of [witness,unicode])for(const patch of [{byteLength:undefined},{digest:undefined},{byteLength:undefined,digest:undefined},{byteLength:bytes.length+1},{byteLength:bytes.length-1},
    {byteLength:String(bytes.length)},{byteLength:-1},{byteLength:1.5},{digest:product.sha256Bytes(bytes).toUpperCase()},{digest:product.sha256Bytes(bytes).slice(7)},{digest:null},{byteLength:null}]){
    const shown=project(withMeta(bytes,patch)).stdout;assert.equal(shown.complete,false,JSON.stringify(Object.keys(patch)));assert.equal(shown.rawBody.omittedFromPlanningView,true);
    assert.ok(shown.omittedByteCount>0);}
  // The truncated witness carried under the witness's own length/digest is not the cited stream.
  assert.equal(project(withMeta(witness.subarray(0,4615),{byteLength:4616,digest:custody.declaredStreamDigest})).stdout.complete,false);
  // An empty strict stream is complete with nothing to display.
  whole(project(stream(Buffer.alloc(0))).stderr,Buffer.alloc(0));
});
test('native-work assembly is bounded by the Run declared prompt bound: a fitting prompt assembles, an overflowing one refuses',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const context=await physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  const nativeOwner=await import(pathToFileURL(resolve(packageRoot,'build/code/src/product/native_workspace_work.js')).href),ids=nativeOwner.NATIVE_WORKSPACE_WORK_IDS;
  const task=nativeOwner.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,
    capabilityGrant:f.capabilityGrant,context,...state.original.workOrders.construction});
  assert.ok(nativeOwner.isNativeWorkspaceWorkTask(task));assert.equal(task.assessment,undefined,'the constructor variant');
  const graph=gtl.constructNativeWorkspaceWorkModulePublication(basis).graphFunctions.find(g=>g.name===ids.graphFunctionRef);
  const execution={basisRef:'basis:native-work-bound',basisDigest:product.sha256Canonical('native-work-bound'),parentExecutionBasisRef:'basis:root-bound',
    invocationAdmissionRef:'invocation:native-work-bound',invocationRef:'invocation-ref:native-work-bound',programRef:'program:native-work-bound'};
  const call={regime:'F_P',cCallRef:'call:native-work-bound',cCallDigest:product.sha256Canonical('call'),implementationRef:ids.implementationRef,
    graphFunctionRef:nativeOwner.nativeWorkspaceWorkGraphFunctionRef(task),inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef,programLocusRef:'locus:native-work-bound'};
  const assemblyBasis={publication:{},graphFunction:graph,executionBasis:execution,cCall:call,predecessorPrefix:{}};
  const owner={prefix:{},events:[],call,execution,program:{callableMembership:[]},environment:{kind:'exact_prefix_workspace_environment',productInstalls:[]},
    inputRef:'input:native-work-bound',inputValue:task,inputDigest:product.sha256Canonical(task)};
  // The root ancestry projection runs as built; only the owned basis, the role
  // read and the exact-prefix basis rehydration are supplied lower premises.
  let root;
  const link=async(file,replacements={})=>{const m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
    await m.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href),values={...actual,...(replacements[s]??{})};
      return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
    await m.evaluate();return m.namespace;};
  const ancestry=await link(resolve(packageRoot,'build/code/src/abg/semantic_job.js'),{'./execution_basis.js':{rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>ref===root.basisRef?root:null},
    './event_prefix.js':{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+execution.invocationRef?[{kind:'basis_admitted',payload:{basisClass:'root',basisRef:root.basisRef,invocationAdmissionRef:root.invocationAdmissionRef,implementationSetRef:root.rootImplementationSetRef,rawInputValue:root.rawInputValue}}]:[]}});
  const assembly=await link(resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),{'./execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:()=>owner},
    './stdo_environment.js':{projectRunEnvironmentRoleEvidenceAtPrefix:()=>null},'./semantic_job.js':{...ancestry}});
  const rooted=rawInputValue=>{root={...execution,basisRef:'basis:root-bound',parentExecutionBasisRef:null,rawInputValue};};
  rooted(task);const unbounded=assembly.constructWorksiteNativeInstructionAssembly(assemblyBasis,task);
  assert.equal(unbounded?.kind,'native_instruction_assembly','a Run whose root declares no prompt bound assembles');
  const bytes=unbounded.manifest.promptByteCount;assert.equal(bytes,Buffer.byteLength(unbounded.request.prompt));
  rooted(product.constructGovernanceWorkState({...state.original,maxPromptBytes:bytes}));
  const fitting=assembly.requireWorksiteNativeInstructionAssembly(assemblyBasis,task);
  assert.deepEqual(fitting,unbounded,'a prompt at the declared bound assembles unchanged');
  rooted(product.constructGovernanceWorkState({...state.original,maxPromptBytes:bytes-1}));
  assert.equal(assembly.constructWorksiteNativeInstructionAssembly(assemblyBasis,task),null);
  assert.throws(()=>assembly.requireWorksiteNativeInstructionAssembly(assemblyBasis,task),error=>{
    assert.deepEqual(JSON.parse(error.message),{kind:'native_instruction_assembly_refusal',cause:'declared_bound_overflow',policy:null,role:'constructor',unresolvedRefs:['maxPromptBytes']});return true;});
});
// The worksite constructor and command-executor prompts take the same Run
// declared bound as the native-work prompt: one case per role.
async function worksiteRoleBoundCase(t,role){
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const relativePath='bounded-source.txt';await writeFile(join(f.canonicalRoot,relativePath),'bounded source\n');
  const subject=product.constructWorksiteSubject({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
  const observation=await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject);
  const {cLeafTerms}=await import(pathToFileURL(resolve(packageRoot,'build/code/src/gtl/c_algebra.js')).href);
  let task,graph,locus,refs;
  if(role==='command_executor'){
    const ids=product.WORKSITE_COMMAND_EXECUTION_IDS;
    task=product.constructObservedWorksiteCommandExecutionTask({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,capabilityGrant:f.capabilityGrant,
      observedFiles:[{subject,observation}],commands:[{commandId:'command://bound/check',executable:process.execPath,args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],
      outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'verification'}]});
    graph=gtl.constructWorksiteCommandExecutionModulePublication(basis).graphFunctions.find(g=>g.name===ids.graphFunctionRef);locus=ids.nodeRef;
    refs={implementationRef:ids.implementationRef,inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef};
  } else {
    const ids=product.WORKSITE_CONSTRUCTION_IDS;
    task=product.constructWorksiteConstructionTask({workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,capabilityGrant:f.capabilityGrant,
      prompt:'Replace the bounded source.',targets:[{subject,territory:f.territory,predecessorObservation:observation}]});
    const located=gtl.constructWorksiteConstructionModulePublication(basis).graphFunctions.flatMap(g=>g.template.nodes.flatMap(n=>cLeafTerms(n.term))
      .filter(leaf=>gtl.nativeContextLeafFamily(g,leaf)==='constructor').map(leaf=>({g,leaf})));
    assert.equal(located.length,1,'one declared constructor leaf');graph=located[0].g;locus=located[0].leaf.programLocusRef;
    refs={implementationRef:ids.candidateImplementationRef,inputContractRef:ids.taskContractRef,outputContractRef:ids.candidateBundleContractRef};
  }
  const execution={basisRef:'basis:worksite-bound',basisDigest:product.sha256Canonical('worksite-bound'),parentExecutionBasisRef:'basis:root-bound',
    invocationAdmissionRef:'invocation:worksite-bound',invocationRef:'invocation-ref:worksite-bound',programRef:'program:worksite-bound'};
  const call={regime:'F_P',cCallRef:'call:worksite-bound',cCallDigest:product.sha256Canonical('call'),runId:'run:worksite-bound',graphCallId:'graph-call:worksite-bound',
    frameId:'frame:worksite-bound',taskOrdinal:null,attempt:1,graphFunctionRef:graph.name,programLocusRef:locus,...refs};
  const assemblyBasis={publication:{},graphFunction:graph,executionBasis:execution,cCall:call,predecessorPrefix:{}};
  const owner={prefix:{},events:[],call,execution,program:{callableMembership:[]},environment:{kind:'exact_prefix_workspace_environment',productInstalls:[]},
    inputRef:'input:worksite-bound',inputValue:task,inputDigest:product.sha256Canonical(task)};
  const stdo={invocationAdmissionRef:execution.invocationAdmissionRef,environmentRef:'environment:worksite-bound',environmentDigest:product.sha256Canonical('environment'),
    evidenceDigest:product.sha256Canonical('evidence'),graphFunctionRef:graph.name,programLocusRef:locus,frameRefs:['frame:worksite-bound/'+role],
    policy:{policyRef:'policy:worksite-bound',digest:product.sha256Canonical('policy')},contextPolicyDigest:product.sha256Canonical('context-policy'),
    contextPolicy:{policyRef:'context-policy:worksite-bound',selectors:role==='constructor'?['full_source','declared_predecessor_semantics','active_binding_semantics','current_worksite']:['current_worksite','admitted_execution_evidence']},
    sourceContent:[],accessContent:[]};
  // The root ancestry projection runs as built; the owned basis, the role read
  // and the exact-prefix basis rehydration are supplied lower premises.
  let root;
  const link=async(file,replacements={})=>{const m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
    await m.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href),values={...actual,...(replacements[s]??{})};
      return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
    await m.evaluate();return m.namespace;};
  const ancestry=await link(resolve(packageRoot,'build/code/src/abg/semantic_job.js'),{'./execution_basis.js':{rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>ref===root.basisRef?root:null},
    './event_prefix.js':{indexedRuntimeEvents:(_p,key)=>key==='invocation:'+execution.invocationRef?[{kind:'basis_admitted',payload:{basisClass:'root',basisRef:root.basisRef,invocationAdmissionRef:root.invocationAdmissionRef,implementationSetRef:root.rootImplementationSetRef,rawInputValue:root.rawInputValue}}]:[]}});
  const assembly=await link(resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),{'./execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:()=>owner},
    './stdo_environment.js':{projectRunEnvironmentRoleEvidenceAtPrefix:()=>stdo},'./semantic_job.js':{...ancestry}});
  const rooted=rawInputValue=>{root={...execution,basisRef:'basis:root-bound',parentExecutionBasisRef:null,rawInputValue};};
  rooted(task);const unbounded=assembly.constructWorksiteNativeInstructionAssembly(assemblyBasis,task);
  assert.equal(unbounded?.kind,'native_instruction_assembly','a Run whose root declares no prompt bound assembles');
  assert.equal(unbounded.plan.role,role);
  const bytes=unbounded.manifest.promptByteCount;assert.equal(bytes,Buffer.byteLength(unbounded.request.prompt));
  rooted(product.constructGovernanceWorkState({...state.original,maxPromptBytes:bytes}));
  assert.deepEqual(assembly.requireWorksiteNativeInstructionAssembly(assemblyBasis,task),unbounded,'a prompt at the declared bound assembles unchanged');
  rooted(product.constructGovernanceWorkState({...state.original,maxPromptBytes:bytes-1}));
  assert.equal(assembly.constructWorksiteNativeInstructionAssembly(assemblyBasis,task),null);
  assert.throws(()=>assembly.requireWorksiteNativeInstructionAssembly(assemblyBasis,task),error=>{
    assert.deepEqual(JSON.parse(error.message),{kind:'native_instruction_assembly_refusal',cause:'declared_bound_overflow',policy:null,role,unresolvedRefs:['maxPromptBytes']});return true;});
}
test('worksite command-executor assembly is bounded by the Run declared prompt bound: a fitting prompt assembles, an overflowing one refuses',
  async t=>worksiteRoleBoundCase(t,'command_executor'));
test('worksite constructor assembly is bounded by the Run declared prompt bound: a fitting prompt assembles, an overflowing one refuses',
  async t=>worksiteRoleBoundCase(t,'constructor'));
test('selector planning fits captured eighteen and realistic fifty-one complete owned assemblies',
  {skip:!process.env.ABI5_PLANNING_PROJECTION_CAPTURE&&'ABI5_PLANNING_PROJECTION_CAPTURE unset; requires the captured planning-projection fixture'},async t=>{
    const fixture=JSON.parse(await readFile(process.env.ABI5_PLANNING_PROJECTION_CAPTURE,'utf8')),metrics=[];
    const load=async pin=>{const bytes=await readFile(pin.path);assert.equal(product.sha256Bytes(bytes),'sha256:'+pin.sha256);return JSON.parse(bytes);};
    const captured=await load(fixture.captured),controlled=await load(fixture.controlled);
    assert.equal(product.sha256Bytes(await readFile(fixture.oldProjector.path)),'sha256:'+fixture.oldProjector.sha256);
    assert.equal(captured.state.observations.length,18);assert.equal(controlled.state.observations.length,51);
    assert.deepEqual(controlled.state.observations.slice(0,18),captured.state.observations);assert.deepEqual(controlled.state.original,captured.state.original);
    for(const[name,task]of [['captured',captured],['controlled16',controlled]]){
      const before=product.sha256Canonical(task),view=product.projectFramedSynthesisPromptTask(task);planningFactCorrespondence(task,view);
      let knownNameLines=0;
      for(const[i,o]of task.state.observations.entries())if(o.purpose==='testing')for(const[j,c]of o.value.commandResults.entries()){
        const names=(c.stdout.text??'').split('\n').filter(line=>line.includes('*** FAILED ***')),shown=view.observations[i].observed.commandResults[j].stdout;
        knownNameLines+=names.length;for(const name of names)assert.ok(shown.excerpts.some(e=>e.text.includes(name)),name);
      }
      if(name==='captured')assert.equal(knownNameLines,31);
      const old=await planningAssemblyFor(task,{oldProjectorSource:fixture.oldProjector.path});assert.equal(old.cause,'declared_bound_overflow');
      const assembly=await planningAssemblyFor(task);assert.equal(assembly.kind,'native_instruction_assembly',JSON.stringify(assembly));
      assert.ok(Buffer.byteLength(assembly.request.prompt)<=task.state.original.maxPromptBytes);assert.equal(product.sha256Canonical(task),before);
      metrics.push({name,observations:task.state.observations.length,completePromptBytes:Buffer.byteLength(assembly.request.prompt),projectionBytes:Buffer.byteLength(product.canonicalJson(view)),knownNameLines});
    }
    const fd=await import('node:fs/promises'),handle=await fd.open(fixture.eventStore.path,'r');
    try{for(const coordinate of fixture.owners){
      const bytes=Buffer.alloc(coordinate.byteLength);await handle.read(bytes,0,bytes.length,coordinate.offset);assert.equal(product.sha256Bytes(bytes),'sha256:'+coordinate.sha256);
      const event=JSON.parse(bytes),owner=event.payload.value;assert.equal(event.payload.resultRef,coordinate.resultRef);
      assert.equal(product.sha256Canonical(owner),event.payload.valueDigest);
      const {resultRef,resultDigest,...resultBody}=event.payload;
      assert.equal(product.sha256Canonical(resultBody),resultDigest);
      assert.equal(resultDigest,coordinate.resultDigest);assert.equal(resultRef,'result://abiogenesis/'+resultDigest.slice(7));
      const retained=captured.state.observations.find(o=>o.resultRef===coordinate.resultRef);assert.equal(retained.resultDigest,coordinate.resultDigest);
      assert.equal(event.payload.cCallRef,retained.cCallRef);assert.equal(event.aggregateId,retained.cCallRef);
      const displayed=product.projectFramedSynthesisPromptTask(captured).observations[captured.state.observations.indexOf(retained)].observed;
      for(const[j,row]of retained.value.commandResults.entries())for(const lane of ['stdout','stderr']){
        const ref=displayed.commandResults[j][lane].rawBody,stream=ref.fieldPath.reduce((v,k)=>v[k],owner),decoded=Buffer.from(stream.payload,'base64');
        assert.equal(product.sha256Bytes(decoded),stream.digest);assert.equal(decoded.length,stream.byteLength);
        assert.equal(stream.digest,row[lane].digest);assert.equal(stream.byteLength,row[lane].byteLength);
        assert.equal(decoded.toString(),row[lane].text);
      }
      for(const[j,p]of retained.value.predicateObservations.entries())assert.deepEqual(
        displayed.predicateObservations[j].evidenceBody.fieldPath.reduce((v,k)=>v[k],owner),p.evidence);
    }}finally{await handle.close();}
    t.diagnostic(JSON.stringify({metrics,authenticOwningResults:fixture.owners.length,controlled:'synthetic; not native mutant detection'}));
  });

test('native observation facts preserve captured history through preparation admission and complete assembly',
  {skip:!process.env.ABI5_NATIVE_OBSERVATION_CAPTURE&&'ABI5_NATIVE_OBSERVATION_CAPTURE unset; requires the captured native observation fixture'},async t=>{
    const fixture=JSON.parse(await readFile(process.env.ABI5_NATIVE_OBSERVATION_CAPTURE,'utf8'));
    const pinned=async pin=>{const bytes=await readFile(pin.path);assert.equal(product.sha256Bytes(bytes),'sha256:'+pin.sha256);assert.equal(bytes.length,pin.bytes);return bytes;};
    const events=Object.fromEntries(await Promise.all(Object.entries(fixture.events).map(async([key,pin])=>[key,JSON.parse(await pinned(pin))])));
    for(const key of ['206160','206200']){
      const {resultRef,resultDigest,...body}=events[key].payload;
      assert.equal(product.sha256Canonical(body),resultDigest);assert.equal(resultRef,'result://abiogenesis/'+resultDigest.slice(7));
      assert.equal(product.sha256Canonical(body.value),body.valueDigest);
    }
    const selected=events['206160'].payload,previous=events['206200'].payload.value,recorded=events['206223'].payload.instructionAssembly;
    const state={...selected.value.state,synthesis:{resultRef:selected.resultRef,resultDigest:selected.resultDigest,basis:selected.value.basis,judgment:selected.value.judgment}};
    assert.equal(state.observations.length,34);assert.equal(product.isGovernanceWorkState(state),true);
    assert.deepEqual(recorded.envelope.task,previous);assert.equal(product.sha256Canonical(previous),recorded.request.inputDigest);
    assert.equal(recorded.request.prompt,(await pinned(fixture.recordedPrompt)).toString());
    const controlled=JSON.parse(await pinned(fixture.controlled));assert.equal(controlled.state.observations.length,51);
    const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),construction=library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']==='construction');
    const nativeBasis=recorded.envelope.nativeBasis,program=nativeBasis.publication.programs.find(p=>p.programRef===nativeBasis.executionBasis.programRef);
    const environment={kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:previous.workspaceAuthorityBasis,workspaceBinding:previous.workspaceBinding,productInstalls:[]};
    const execution={...nativeBasis.executionBasis,rootImplementationSetRef:'set:controlled-context'};
    const invocation={invocationRef:'invocation:controlled-context',invocationAdmissionRef:execution.invocationAdmissionRef,capabilityGrants:[previous.capabilityGrant],
      sourceResultBasis:{sourceResultContractRef:product.governanceContract('state'),sourceResultValueDigest:product.sha256Canonical(state)},rawInputDigest:product.sha256Canonical(state)};
    const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:execution.parentExecutionBasisRef??execution.basisRef,invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:state}};
    const owned={program,prefix:{},execution,environment,call:{runId:'run:controlled-context',implementationRef:product.governanceRef('implementation','prepare-native')},inputRef:'input:controlled-context',inputValue:state,inputOrigin:{}};
    const {default:ts}=await import('typescript');
    const module=async(file,replacements={},source)=>{
      const bytes=source?ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText:await readFile(file,'utf8');
      const m=new SourceTextModule(bytes,{identifier:file});await m.link(async s=>{
        const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href),values={...actual,...(replacements[s]??{})};
        return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();return m.namespace;
    };
    // Captured values are authentic retained evidence. Occurrence/index, role
    // acquisition and current-context delivery below are controlled lower
    // premises, not new admission, physical reads or actor execution.
    const replacements={'./execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>owned,authenticateOwnedNativeInstructionAssemblyBasis:()=>owned},
      './invocation_execution_truth.js':{projectExactInvocationAdmissionAtPrefix:()=>invocation},
      './event_prefix.js':{indexedRuntimeEvents:()=>[root]},'../product/worksite_operations.js':{observeWorksiteContext:async()=>previous.context}};
    replacements['./semantic_job.js']=await rootProjection(()=>[root],rootBasis(root,execution));
    const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),current=await module(file,replacements),old=await module(file,replacements,(await pinned(fixture.oldAbg)).toString());
    const oldProduct=await module(resolve(packageRoot,'build/code/src/product/default_library.js'),{},(await pinned(fixture.oldProduct)).toString());
    let assemblyOwner;
    const assembly=await module(resolve(packageRoot,'build/code/src/abg/instruction_assembly.js'),{
      './execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:()=>assemblyOwner},
      './stdo_environment.js':{projectRunEnvironmentRoleEvidenceAtPrefix:()=>recorded.plan.role}});
    const fullAssembly=task=>{
      assemblyOwner={events:[],call:nativeBasis.cCall,execution:nativeBasis.executionBasis,program,environment,inputValue:task,inputDigest:product.sha256Canonical(task),inputRef:recorded.envelope.inputRef};
      const output=assembly.constructWorksiteNativeInstructionAssembly(nativeBasis,task);assert.ok(output);return output;
    };
    const oldActual=await old.projectGovernanceNativeTask({graphFunction:construction},state);assert.deepEqual(oldActual,previous);
    assert.equal(fullAssembly(oldActual).request.prompt,recorded.request.prompt,'pre-fix owned assembly reproduces the refused prompt');
    const metrics=[];
    for(const[name,input]of [['actual34',state],['controlled51',{...state,observations:controlled.state.observations}]]){
      const before=product.sha256Canonical(input);root.payload.rawInputValue=input;owned.inputValue=input;invocation.rawInputDigest=invocation.sourceResultBasis.sourceResultValueDigest=before;
      const framed={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:input,context:previous.context};
      assert.deepEqual(product.projectFramedSynthesisPromptTask(framed),oldProduct.projectFramedSynthesisPromptTask(framed),'selector presentation stays equivalent');
      const facts=product.projectGovernanceObservationFacts(input,previous.context);planningFactCorrespondence(framed,{...product.projectFramedSynthesisPromptTask(framed),observations:facts});
      const task=await current.projectGovernanceNativeTask({graphFunction:construction},input),prior=await old.projectGovernanceNativeTask({graphFunction:construction},input);
      assert.ok(product.isNativeWorkspaceWorkTask(task));assert.deepEqual({...task,instructions:[]},{...prior,instructions:[]});
      assert.equal(task.outcome,input.synthesis.judgment.contributions.find(c=>c.graphFunctionRef===construction.name).contribution);
      assert.equal(current.governanceResultMatches({graphFunction:construction},input,task),true);
      assert.equal(current.governanceResultMatches({graphFunction:construction},input,prior),false,'old raw-history adaptation cannot satisfy the new exact preparation');
      const shown=JSON.parse(task.instructions.find(i=>i.startsWith('Actual admitted observations: ')).slice('Actual admitted observations: '.length));assert.deepEqual(shown,facts);
      assert.ok(task.instructions.includes('Conserved original task: '+input.original.task));
      const altered=structuredClone(task);altered.instructions[altered.instructions.findIndex(i=>i.startsWith('Actual admitted observations: '))]='Actual admitted observations: []';
      assert.equal(current.governanceResultMatches({graphFunction:construction},input,altered),false,'facts cannot be silently removed');
      let namedLines=0;for(const[i,o]of input.observations.entries())if(o.purpose==='testing')for(const[j,c]of o.value.commandResults.entries()){
        const lines=(c.stdout.text??'').split('\n').filter(line=>line.includes('*** FAILED ***'));namedLines+=lines.length;
        for(const line of lines)assert.ok(facts[i].observed.commandResults[j].stdout.excerpts.some(e=>e.text.includes(line)),line);
      }
      const next=fullAssembly(task),priorAssembly=fullAssembly(prior);assert.deepEqual(next.request.responseJsonSchema,priorAssembly.request.responseJsonSchema);
      assert.deepEqual(next.plan,priorAssembly.plan);assert.equal(next.envelope.inputDigest,product.sha256Canonical(task));assert.equal(Object.hasOwn(next.envelope,'task'),false,'the envelope binds the admitted task by input digest, not a second whole copy');
      assert.ok(Buffer.byteLength(next.request.prompt)<Buffer.byteLength(priorAssembly.request.prompt));assert.equal(product.sha256Canonical(input),before);
      metrics.push({name,observations:input.observations.length,oldCompletePromptBytes:Buffer.byteLength(priorAssembly.request.prompt),newCompletePromptBytes:Buffer.byteLength(next.request.prompt),factsBytes:Buffer.byteLength(JSON.stringify(facts)),namedFailureLines:namedLines});
    }
    assert.equal(product.sha256Canonical(state.original),product.sha256Canonical(selected.value.state.original));
    t.diagnostic(JSON.stringify({metrics,controlled51:'distinct synthetic observation fixture; no authenticated producer or mutant credit',scope:'pure owners under disclosed lower premises; no provider/token-limit or UAT guarantee'}));
  });

test('fold and assessment consume actual native, C2 and assessment carriers with exact retained origin',async t=>{
  const nativeOwner=await import('../../build/code/src/product/native_workspace_work.js');
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  const suppliedState=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  // Valid upper UAT input may omit its explicitly selected candidate from the
  // caller's read-first list. This is the observed G08 adapter counterexample.
  const originalState=product.constructGovernanceWorkState({...suppliedState.original,workOrders:{...suppliedState.original.workOrders,
    uat:{...suppliedState.original.workOrders.uat,readFirst:suppliedState.original.workOrders.uat.readFirst.filter(p=>p!==suppliedState.original.assessment.candidatePath)}}});
  assert.ok(product.isGovernanceWorkState(originalState));assert.ok(!originalState.original.workOrders.uat.readFirst.includes(originalState.original.assessment.candidatePath));
  const context=await physical.observeWorksiteContext({...f,readRoots:originalState.original.readRoots,maxFiles:originalState.original.maxContextFiles,maxBytes:originalState.original.maxContextBytes});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),rows=[],invocation={invocationRef:'invocation:test',invocationAdmissionRef:'invocation-admission:test',capabilityGrants:[f.capabilityGrant]};
  const execution={basisRef:'basis:wrapper',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:test',workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:originalState}};
  const owned={program:library.programs[0],prefix:{},events:rows,execution,environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},call:{runId:'run:test'},inputValue:null,inputRef:'input:test',inputOrigin:{}};
  let sourceBasis={...execution},invalidated=false;
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId);
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  // Controlled admitted occurrence/index premises; all native/C2/assessment
  // values and worksite observations are their actual typed owner constructors.
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>sourceBasis}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?await rootProjection(index,rootBasis(root,execution)):specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:()=>invalidated,projectNativeWorkspaceWorkSourceAtPrefix:()=>({sourceBasis})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const synth=(state,purpose,subjectEvidenceRef=null)=>({...state,synthesis:{resultRef:'result:synthesis:'+purpose,resultDigest:product.sha256Canonical(purpose),basis:{inputRef:'input:synthesis',inputDigest:product.sha256Canonical(state),taskRef:state.original.taskRef,environmentRef:'environment:test',environmentDigest:product.sha256Canonical('environment'),frameEvidenceDigest:product.sha256Canonical('frame'),frameRefs:['frame:test'],contextRef:context.observationRef,previousResultRef:state.synthesis?.resultRef??null},judgment:{interpretation:'Supplied work',contributions:[{graphFunctionRef:product.governanceRef('graph-function',purpose),contribution:'Selected work',reason:'Actual evidence',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],gaps:[],nextGraphFunctionRef:product.governanceRef('graph-function',purpose),nextReason:'Chosen work',nextEvidenceRefs:[],subjectEvidenceRef,revisionReason:'Current evidence',revisionEvidenceRefs:[]}}});
  const at=(purpose,operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);return {graphFunction:library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']===purpose)};};
  const provenance={cCallRef:'call:native',executionAuthorityRef:'authority:test',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:native',transportBindingRef:'transport:test',transportBindingDigest:product.sha256Canonical('transport'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')};
  const fold=(state,purpose,value)=>{const input=product.constructRetainedGraphInput(state,value),b=at(purpose,'fold',input),event={kind:'c_call_result_admitted',runId:'run:test',basisId:'basis:child',aggregateId:'call:actual:'+purpose+':'+rows.length,admissionOrdinal:rows.length+10,payload:{resultRef:'result:actual:'+purpose+':'+rows.length,resultDigest:product.sha256Canonical(value),resultClass:'success',value}};
    rows.push(event);owned.inputOrigin={retainedProjection:{entryBasis:execution,input:{admissionRef:owned.inputRef,value:input},sourceResult:event}};
    const folded=m.namespace.projectGovernanceFold(b,input);assert.ok(folded,purpose);assert.equal(folded.observations.at(-1).cCallRef,event.aggregateId);assert.equal(folded.observations.at(-1).actorInvocationRef,value.provenance.actorInvocationRef);assert.equal(folded.observations.at(-1).synthesisResultRef,state.synthesis.resultRef);
    const retained=owned.inputOrigin.retainedProjection;owned.inputOrigin={};assert.equal(m.namespace.projectGovernanceFold(b,input),null);owned.inputOrigin={retainedProjection:{...retained,entryBasis:{basisRef:'basis:foreign'}}};assert.equal(m.namespace.projectGovernanceFold(b,input),null);owned.inputOrigin={retainedProjection:retained};return folded;};
  const selectedReads=async(state,producer)=>{
    const order=state.original.workOrders.uat,selected=state.original.assessment,b=at('uat','prepare-native',state);
    const task=await m.namespace.projectGovernanceNativeTask(b,state);assert.ok(nativeOwner.isNativeWorkspaceWorkTask(task));
    const contribution=state.synthesis.judgment.contributions.find(c=>c.graphFunctionRef===b.graphFunction.name);
    assert.notEqual(contribution.contribution,order.outcome);assert.equal(task.outcome,order.outcome,'UAT keeps its original declared outcome over a competing planner contribution');
    const advisory=task.instructions.filter(i=>i.includes(contribution.contribution));assert.ok(advisory.length>0);
    assert.ok(advisory.every(i=>i.startsWith('Advisory planner selection (non-governing context;')),'planner text is carried only as separately labelled advisory context');
    assert.ok(task.instructions.some(i=>i.includes('The advisory planner selection adds no governing criterion')));
    assert.ok(task.instructions.includes('Governing full-original assessment outcome: '+order.outcome));
    assert.ok(task.instructions.includes('Conserved original task: '+state.original.task));
    assert.ok(task.instructions.some(i=>i.includes('all current criteria govern this independent assessment')&&i.includes('preserving every unmet or indeterminate criterion')));
    assert.equal(task.instructions.some(i=>i.includes('return a truthful partial report')||i.startsWith('Supplied purpose outcome (parent context):')),false,'UAT cannot inherit author completion guidance');
    const response=nativeOwner.nativeWorkspaceWorkResponseSchema(task),rendered=nativeOwner.renderNativeWorkspaceWorkOrder(task);
    assert.deepEqual(response,JSON.parse(Buffer.from(state.original.assessment.schemaAsset.bytesBase64,'base64').toString('utf8')));
    assert.equal(response.properties.summary,undefined);assert.equal(response.properties.gaps,undefined);
    assert.ok(rendered.includes('Reacquire full source, actual candidate and rubric independently.'));
    assert.ok(rendered.includes('Return one JSON object matching the exact declared schema'));
    assert.deepEqual(task.readFirst,[...order.readFirst,selected.candidatePath]);assert.deepEqual(task.writeRoots,[]);
    assert.equal(task.assessment.producer.cCallRef,producer.cCallRef);assert.equal(task.assessment.producer.actorInvocationRef,producer.actorInvocationRef);
    assert.equal(m.namespace.governanceResultMatches(b,state,task),true);
    assert.equal(m.namespace.governanceResultMatches(b,state,{...task,readFirst:order.readFirst}),false,'admission rejects omitted selected material');
    const rootInput=root.payload.rawInputValue;
    const variant=readFirst=>({...state,original:{...state.original,workOrders:{...state.original.workOrders,uat:{...order,readFirst}}}});
    // Each variation has its own controlled immutable ingress. These are
    // actual owner projections under index/occurrence premises, not Run proof.
    const presentReads=[selected.candidatePath,...order.readFirst],present=variant(presentReads);
    root.payload.rawInputValue=product.constructGovernanceWorkState(present.original);
    assert.deepEqual((await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',present),present)).readFirst,presentReads,'already-present paths keep their original positions');
    const selectedOnly=variant([]);root.payload.rawInputValue=product.constructGovernanceWorkState(selectedOnly.original);
    assert.deepEqual((await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',selectedOnly),selectedOnly)).readFirst,[...selected.sources,selected.candidatePath,selected.rubricPath],'only explicit assessment selections supply missing reads');
    const duplicate=variant([...order.readFirst,order.readFirst[0]]);root.payload.rawInputValue=product.constructGovernanceWorkState(duplicate.original);
    assert.ok(product.isGovernanceWorkState(duplicate));
    await assert.rejects(()=>m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',duplicate),duplicate),/native workspace task requires one bound worksite, context and declared scope/);
    assert.equal(m.namespace.governanceResultMatches(at('uat','prepare-native',duplicate),duplicate,task),false,'original duplicate refusal is retained');
    root.payload.rawInputValue=rootInput;return task;
  };
  // Any actual native capability may supply evidence: construction label is not required.
  const nativeState=synth(originalState,'design');
  nativeState.original={...originalState.original,workOrders:{...originalState.original.workOrders,design:originalState.original.workOrders.construction}};
  // Conserve original definition at this controlled root; do not change live witness.
  root.payload.rawInputValue=product.constructGovernanceWorkState(nativeState.original);
  const task=await m.namespace.projectGovernanceNativeTask(at('design','prepare-native',nativeState),nativeState);assert.ok(task);
  const native=nativeOwner.constructNativeWorkspaceWorkObservation(task,context,{summary:'Existing candidate inspected',gaps:['Parent testing and independent acceptance remain unresolved.']},provenance);
  const nativeFold=fold(nativeState,'design',native),uatFromNative=synth(nativeFold,'uat',nativeFold.observations.at(-1).resultRef);
  assert.deepEqual(nativeFold.original,nativeState.original);assert.deepEqual(nativeFold.unresolvedSupportRefs,nativeState.unresolvedSupportRefs);
  assert.equal(nativeFold.terminal,false);assert.deepEqual(nativeFold.observations.at(-1).value.report,native.report,'truthful partial report is retained without parent satisfaction');
  const nativeAssessmentTask=await selectedReads(uatFromNative,nativeFold.observations.at(-1));
  const nativeAssessment=nativeOwner.constructNativeWorkspaceWorkObservation(nativeAssessmentTask,context,null,{...provenance,cCallRef:'call:native-assessment',actorInvocationRef:'actor:native-assessor'},{kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Controlled native subject judgment',unresolvedCriteria:['behavior']});
  assert.equal(fold(uatFromNative,'uat',nativeAssessment).observations.at(-1).value.disposition,'unmet');
  root.payload.rawInputValue=originalState;
  const testing=synth(originalState,'testing'),commandTask=await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',testing),testing);assert.ok(commandTask?.sourceObservedInput);
  const c2=await import('../../build/code/src/product/worksite_command_execution.js'),plan=c2.worksiteCommandExecutionHelperPlan(commandTask,'attempt:test');
  const empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
  const literal='\uFEFF[error] exact Ω😀 diagnostic\n*** '+ 'Ω😀'.repeat(2400)+'\n',literalBytes=Buffer.from(literal);
  const bomStream={...empty,payload:literalBytes.toString('base64'),byteLength:literalBytes.length,digest:product.sha256Bytes(literalBytes)};
  const commandResults=commandTask.commands.map(({kind,schemaVersion,expectedReports,...command})=>{const body={...command,exitStatus:7,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:bomStream,stderr:empty,reports:[],reportCount:0},digest=product.sha256Canonical(body);return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};});
  const members=commandTask.protectedObservations.map(row=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:row.ordinal,sourceMemberRef:row.sourceMemberRef,sourceObservationRef:row.observation.observationRef,sourceObservationDigest:row.observation.observationDigest,relativePath:row.subject.relativePath,byteLength:row.observation.byteLength,digest:row.observation.fileDigest})),snapshotDigest=product.sha256Canonical(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task:commandTask,disposition:'success',commandResults,predicateObservations:[],worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:commandTask.protectedObservations.map(r=>r.observation),protectedAfter:commandTask.protectedObservations.map(r=>r.observation)});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:commandTask.taskRef,taskDigest:commandTask.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  const actor={actorRef:commandTask.workerActorRef,workerBindingRef:commandTask.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:product.sha256Canonical(commandTask),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:test',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:test',...provenance,actorInvocationRef:'actor:measurement'};
  const observed=c2.constructWorksiteExecutionObservation(commandTask,acknowledgment,actor,artifact,plan);assert.equal(observed.provenance.cCallRef,undefined,'C2 does not expose invented cCall provenance');
  const measured=fold(testing,'testing',observed);assert.equal(measured.terminal,false);assert.equal(measured.observations.at(-1).value.commandResults[0].exitStatus,7);
  const foldedStream=measured.observations.at(-1).value.commandResults[0].stdout;
  assert.equal(foldedStream.text,literal);assert.equal(Buffer.from(foldedStream.text).equals(literalBytes),true);
  assert.equal(foldedStream.digest,bomStream.digest);assert.equal(foldedStream.byteLength,bomStream.byteLength);
  const planningTask={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:measured,context};
  planningFactCorrespondence(planningTask,product.projectFramedSynthesisPromptTask(planningTask));
  const author=synth(measured,'construction'),authorTask=await m.namespace.projectGovernanceNativeTask(at('construction','prepare-native',author),author);
  const literalContext=JSON.parse(authorTask.instructions.find(i=>i.startsWith('Actual admitted observations: ')).slice('Actual admitted observations: '.length));
  assert.deepEqual(literalContext,product.projectGovernanceObservationFacts(author,authorTask.context));
  const displayedNativeStream=literalContext.at(-1).observed.commandResults[0].stdout;
  assert.equal(displayedNativeStream.digest,bomStream.digest);
  assert.equal(displayedNativeStream.byteLength,literalBytes.length);
  assert.ok(displayedNativeStream.omittedCandidates>0,'the long literal diagnostic consumes the existing display bound');
  for(const excerpt of displayedNativeStream.excerpts)assert.equal(
    literalBytes.subarray(excerpt.startByte,excerpt.endByte).toString(),excerpt.text);
  const uat=synth(measured,'uat',measured.observations.at(-1).resultRef),b=at('uat','prepare-native',uat);
  const assessmentTask=await selectedReads(uat,measured.observations.at(-1));assert.equal(assessmentTask.assessment.producer.actorInvocationRef,'actor:measurement');
  at('uat','prepare-native',uat);
  const admitted=m.namespace.governanceResultMatches(b,uat,assessmentTask);assert.equal(admitted,true);
  sourceBasis={...execution,invocationAdmissionRef:'invocation:crossed'};assert.equal(await m.namespace.projectGovernanceNativeTask(b,uat),null);sourceBasis={...execution};
  invalidated=true;assert.equal(await m.namespace.projectGovernanceNativeTask(b,uat),null);invalidated=false;
  const missing=synth(measured,'uat','result:missing');assert.equal(await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',missing),missing),null);
  const selectedBadTesting=synth(measured,'testing','result:missing');assert.equal(await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',selectedBadTesting),selectedBadTesting),null);assert.equal(observedGovernanceTaskMatches(selectedBadTesting,commandTask),false);
  const assessment=nativeOwner.constructNativeWorkspaceWorkObservation(assessmentTask,context,null,{...provenance,cCallRef:'call:assessment',actorInvocationRef:'actor:assessor'},{kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Observed failures',unresolvedCriteria:['behavior']});
  assert.ok(nativeOwner.isNativeWorkspaceWorkObservation(assessment));const assessed=fold(uat,'uat',assessment);assert.equal(assessed.observations.at(-1).value.disposition,'unmet');assert.equal(assessed.terminal,false);
  assert.equal(nativeOwner.isNativeWorkspaceWorkObservation(nativeOwner.constructNativeWorkspaceWorkObservation(assessmentTask,context,null,{...provenance,actorInvocationRef:'actor:measurement'},assessment.assessment)),false,'measurement actor cannot assess itself');

  // One actual folded population exercises schema -> raw binder -> admitted
  // choice -> native/C2 preparation. Occurrence/index authenticity above is a
  // controlled premise; there is no provider, native Run or UAT success claim.
  const population={...assessed,observations:[...nativeFold.observations,...assessed.observations],synthesis:null};
  const framed={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:population,context};assert.ok(product.isFramedSynthesisTask(framed));
  const targets=library.graphFunctions.filter(g=>g.declarations['abg.default_library_purpose']).map(g=>({graphFunctionRef:g.name,definitionDigest:product.sha256Canonical(g),purpose:g.declarations['abg.default_library_purpose']}));
  const bindBasis=synth(population,'testing').synthesis.basis;
  const {default:Ajv2020}=await import('ajv/dist/2020.js'),validate=new Ajv2020({strict:false}).compile(product.framedSynthesisResponseSchema(framed,targets));
  const nativeRef=nativeFold.observations.at(-1).resultRef,c2Ref=measured.observations.at(-1).resultRef,assessmentRef=assessed.observations.at(-1).resultRef;
  const expected={testing:[nativeRef,null],uat:[nativeRef,c2Ref]};
  assert.deepEqual(product.governanceSubjectEvidenceRefs(population,'testing'),expected.testing);
  assert.deepEqual(product.governanceSubjectEvidenceRefs(population,'uat'),expected.uat);
  const executive=library.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','executive-step'));
  const selectNode=executive.template.nodes.find(n=>n.nodeRef===executive.declarations['abg.framed_synthesis_locus']);
  const projectNode=executive.template.nodes.find(n=>n.nodeRef===executive.declarations['abg.framed_synthesis_projection']);
  owned.graph={template:executive.template};execution.registeredSelectionDefinitionDigests=Object.fromEntries(targets.map(row=>[row.graphFunctionRef,row.definitionDigest]));
  owned.call.graphCallId='graph-call:typed-source';owned.call.outputContractRef=product.governanceContract('choice');
  const projectionBasis={graphFunction:executive,cursor:{currentNodeRef:projectNode.nodeRef,termPath:gtl.rootCSourcePath(projectNode.nodeRef)}};
  const choose=bound=>{
    const event={kind:'c_call_result_admitted',runId:owned.call.runId,basisId:execution.basisRef,graphCallId:owned.call.graphCallId,aggregateId:'call:source-choice',payload:{resultClass:'success',resultRef:'result:source-choice',resultDigest:product.sha256Canonical(bound)}};
    rows.push({kind:'c_call_opened',runId:owned.call.runId,basisId:execution.basisRef,aggregateId:event.aggregateId,payload:{programLocusRef:selectNode.nodeRef}});
    owned.inputValue=bound;owned.inputRef=event.payload.resultRef;owned.inputOrigin={event};owned.call.implementationRef=product.governanceRef('implementation','project-choice');
    const choice=m.namespace.projectGovernanceChoice(projectionBasis,bound);assert.ok(choice);rows.pop();
    assert.deepEqual(choice.input.value.original,population.original);assert.deepEqual(choice.input.value.observations,population.observations);return choice.input.value;
  };
  for(const purpose of ['testing','uat'])for(const subject of [null,nativeRef,c2Ref,assessmentRef,'result:unknown']){
    const raw=synth(population,purpose,subject).synthesis.judgment,eligible=expected[purpose].includes(subject);
    assert.equal(validate(raw),eligible,purpose+' schema '+subject);
    const bound=product.bindFramedSynthesisResult(framed,targets,bindBasis,raw);assert.equal(bound!==null,eligible,purpose+' raw binder '+subject);
    if(!bound)continue;
    const selected=choose(bound),selectedBasis=at(purpose,purpose==='testing'?'prepare-testing':'prepare-native',selected);
    const prepared=purpose==='testing'?await m.namespace.projectGovernanceTestingTask(selectedBasis,selected):await m.namespace.projectGovernanceNativeTask(selectedBasis,selected);
    assert.ok(prepared,purpose+' actual owner preparation '+subject);assert.equal(m.namespace.governanceResultMatches(selectedBasis,selected,prepared),true);
    if(purpose==='testing'){
      assert.equal(prepared.sourceObservedInput!==undefined,subject===null);assert.equal(prepared.sourceNativeWork!==undefined,subject!==null);
      assert.deepEqual(prepared.commands.map(c=>c.commandId),population.original.testing.commands.map(c=>c.commandId));
    }else assert.equal(prepared.assessment.producer.resultRef,subject);
  }
  const incompatible=synth(population,'testing',c2Ref);
  assert.equal(await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',incompatible),incompatible),null,'prep shares the same typed-source refusal');
  assert.deepEqual(product.governanceSubjectEvidenceRefs({...population,observations:[...population.observations,nativeFold.observations.at(-1)]},'testing'),[null],'duplicate source identities are never offered');
  assert.deepEqual(product.governanceSubjectEvidenceRefs({...population,observations:[{...nativeFold.observations.at(-1),value:{report:{summary:'malformed'},changedPaths:[]}}]},'testing'),[null]);
});

test('UAT preparation carries its full authenticated producer: whole streams in both presentations and whole predicate observations',async t=>{
  const PRODUCER="This independent assessment consumes its full authenticated producer, the admitted Testing Result cited here: its command streams complete, each as UTF-8 text when its admitted bytes decode as strict UTF-8, else the admitted base64 payload, each with its admitted byte length and digest, and its predicate observations complete. Field paths are relative to the cited admitted Result's value and confer no additional access or authority. The parent-context view above stays bounded; this producer is carried whole, nothing withheld, and the declared prompt bound refuses a prompt that overflows it. Reacquire all mandatory selected source and assessment material through the declared reads.";
  const scenarios=await import('../uat/scenarios.mjs'),consumer=await import('../uat/consumer.mjs');
  const fixtures=await scenarios.loadScenarios(join(packageRoot,'test_env/fixtures/sandbox-uat'));
  const acquired=await scenarios.acquireScenario(fixtures.root,fixtures.rows.find(r=>r.key==='rust-cli'));
  const initial=scenarios.constructWorkloadInput(product,acquired,consumer.assessmentSelection,{cargo:{executable:'/unit/cargo',environment:{}},node:{executable:'/unit/node',environment:{}}});
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const put=async(path,bytes)=>{await mkdir(dirname(join(f.canonicalRoot,path)),{recursive:true});await writeFile(join(f.canonicalRoot,path),bytes);};
  for(const source of acquired.sources)await put(source.path,source.bytes);
  // The original rust-cli sources and command/predicate plan are acquired. The
  // other selected files and every measured row are controlled unit premises:
  // no cargo, node:test, provider, Run or UAT verdict.
  for(const path of initial.original.testing.selectedPaths)if(!initial.original.sources.some(s=>s.path===path))await put(path,'controlled command input: '+path+'\n');
  const context=await physical.observeWorksiteContext({...f,readRoots:initial.original.readRoots,maxFiles:initial.original.maxContextFiles,maxBytes:initial.original.maxContextBytes});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),rows=[];
  const invocation={invocationRef:'invocation:full-producer',invocationAdmissionRef:'invocation-admission:full-producer',capabilityGrants:[f.capabilityGrant]};
  const execution={basisRef:'basis:wrapper',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:test',workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:initial}};
  const owned={program:library.programs[0],prefix:{},events:rows,execution,environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},call:{runId:'run:full-producer'},inputValue:null,inputRef:'input:test',inputOrigin:{}};
  let sourceBasis={...execution},invalidated=false,checkedPaths=[];
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId);
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  // Only occurrence authentication, indexing and invalidation are controlled;
  // physical contexts and typed task/artifact/observation/fold owners are real.
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>sourceBasis}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?await rootProjection(index,rootBasis(root,execution)):specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:(_p,_at,_root,paths)=>{checkedPaths=paths;return invalidated;},projectNativeWorkspaceWorkSourceAtPrefix:()=>({sourceBasis})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const synth=(state,purpose,subjectEvidenceRef=null)=>({...state,synthesis:{resultRef:'result:synthesis:'+purpose,resultDigest:product.sha256Canonical(purpose),basis:{inputRef:'input:synthesis',inputDigest:product.sha256Canonical(state),taskRef:state.original.taskRef,environmentRef:'environment:test',environmentDigest:product.sha256Canonical('environment'),frameEvidenceDigest:product.sha256Canonical('frame'),frameRefs:['frame:test'],contextRef:context.observationRef,previousResultRef:state.synthesis?.resultRef??null},judgment:{interpretation:'Original rust-cli work',contributions:[{graphFunctionRef:product.governanceRef('graph-function',purpose),contribution:'Independently assess the full original against its measured producer',reason:'Current measurement support',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],gaps:[],nextGraphFunctionRef:product.governanceRef('graph-function',purpose),nextReason:'Declared independent assessment',nextEvidenceRefs:[],subjectEvidenceRef,revisionReason:'Current context',revisionEvidenceRefs:[]}}});
  const at=(purpose,operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);return {graphFunction:library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']===purpose)};};
  const fold=(state,purpose,value)=>{const input=product.constructRetainedGraphInput(state,value),b=at(purpose,'fold',input);
    const event={kind:'c_call_result_admitted',runId:owned.call.runId,basisId:'basis:child',aggregateId:'call:controlled:'+rows.length,admissionOrdinal:rows.length+10,payload:{resultRef:'result:controlled:'+rows.length,resultDigest:product.sha256Canonical(value),resultClass:'success',value}};
    rows.push(event);owned.inputOrigin={retainedProjection:{entryBasis:execution,input:{admissionRef:owned.inputRef,value:input},sourceResult:event}};
    const stateAfter=m.namespace.projectGovernanceFold(b,input);assert.ok(stateAfter);return {state:stateAfter,event};};
  const nativeOwner=await import('../../build/code/src/product/native_workspace_work.js');
  const provenance={cCallRef:'call:native',executionAuthorityRef:'authority:test',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:native',transportBindingRef:'transport:test',transportBindingDigest:product.sha256Canonical('transport'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')};
  const testing=synth(initial,'testing'),task=await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',testing),testing);
  assert.ok(task?.sourceObservedInput);assert.equal(task.commands.length,2);
  assert.deepEqual(task.outcomePredicates.map(p=>p.predicateKind),['process_exit','process_exit','test_pass_count','stdout_exact']);
  const c2=await import('../../build/code/src/product/worksite_command_execution.js'),plan=c2.worksiteCommandExecutionHelperPlan(task,'attempt:measurement');
  const stream=bytes=>({kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:bytes.toString('base64'),byteLength:bytes.length,digest:product.sha256Bytes(bytes)});
  const strict=bytes=>{try{new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);return true;}catch{return false;}};
  // The cli stdout is not strict UTF-8. The node:test stdout has the failed
  // rust-cli run's shape: a short strict stream, so the planning view carries
  // it whole, `ℹ fail 0` among its middle lines. The stderr keeps a leading BOM.
  const cliOut=Buffer.concat([Buffer.from('Hello, world!\n'),Buffer.from([0xff,0xfe,0x80,0x0a])]);
  const testOut=Buffer.from(['✔ component: cargo run --quiet exits 0 and prints exactly Hello, world! with one newline (398.074917ms)',
    '✔ component: src/main.rs defines main() (0.204542ms)','✔ uat: user runs cargo run --quiet and sees exactly Hello, world! (136.536791ms)',
    'ℹ tests 3','ℹ suites 0','ℹ pass 3','ℹ fail 0','ℹ cancelled 0','ℹ skipped 0','ℹ todo 0','ℹ duration_ms 499.442334',''].join('\n'));
  const bomErr=Buffer.from('\uFEFFwarning: Ω controlled diagnostic\n');
  assert.equal(strict(cliOut),false);assert.equal(strict(testOut),true);assert.equal(strict(bomErr),true);
  const measuredStreams=[{stdout:stream(cliOut),stderr:stream(Buffer.alloc(0))},{stdout:stream(testOut),stderr:stream(bomErr)}];
  const commandResults=task.commands.map(({kind,schemaVersion,expectedReports,...command})=>{
    const body={...command,exitStatus:0,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,...measuredStreams[command.ordinal],reports:[],reportCount:0},observationDigest=product.sha256Canonical(body);
    return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+observationDigest.slice(7),observationDigest};});
  const observedValue={process_exit:0,test_pass_count:3,stdout_exact:false};
  const predicateObservations=task.outcomePredicates.map(p=>{const row=commandResults.find(r=>r.commandId===p.declaration.validationCommandId);
    return {kind:'worksite_predicate_observation',schemaVersion:'5.0.0',ordinal:p.ordinal,predicateId:p.predicateId,predicateKind:p.predicateKind,observedValue:observedValue[p.predicateKind],
      evidence:[{kind:'worksite_command_observation_coordinate',ref:row.observationRef,digest:row.observationDigest,stdoutDigest:row.stdout.digest}],evidenceRefs:[row.observationRef]};});
  const members=task.protectedObservations.map(p=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:p.ordinal,sourceMemberRef:p.sourceMemberRef,sourceObservationRef:p.observation.observationRef,sourceObservationDigest:p.observation.observationDigest,relativePath:p.subject.relativePath,byteLength:p.observation.byteLength,digest:p.observation.fileDigest})),snapshotDigest=product.sha256Canonical(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task,disposition:'success',commandResults,predicateObservations,worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:task.protectedObservations.map(p=>p.observation),protectedAfter:task.protectedObservations.map(p=>p.observation)});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:task.taskRef,taskDigest:task.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  const actor={actorRef:task.workerActorRef,workerBindingRef:task.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:product.sha256Canonical(task),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:test',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:test',...provenance,actorInvocationRef:'actor:measurement'};
  const observed=c2.constructWorksiteExecutionObservation(task,acknowledgment,actor,artifact,plan),measured=fold(testing,'testing',observed),producer=measured.event;
  const uat=synth(measured.state,'uat',producer.payload.resultRef),b=at('uat','prepare-native',uat);
  const prepared=await m.namespace.projectGovernanceNativeTask(b,uat);assert.ok(nativeOwner.isNativeWorkspaceWorkTask(prepared));
  at('uat','prepare-native',uat);assert.equal(m.namespace.governanceResultMatches(b,uat,prepared),true);
  assert.deepEqual(prepared.assessment.producer,{resultRef:producer.payload.resultRef,resultDigest:producer.payload.resultDigest,cCallRef:producer.aggregateId,actorInvocationRef:'actor:measurement'});
  // Exactly one producer instruction, citing the producer the task's assessment binds.
  const carried=prepared.instructions.filter(i=>i.startsWith(PRODUCER));assert.equal(carried.length,1);
  const whole=JSON.parse(carried[0].slice(PRODUCER.length+1));
  assert.deepEqual(Object.keys(whole),['resultRef','resultDigest','cCallRef','actorInvocationRef','commandResults','predicateObservations']);
  assert.equal(whole.resultRef,producer.payload.resultRef);assert.equal(whole.resultDigest,producer.payload.resultDigest);
  assert.equal(whole.cCallRef,producer.aggregateId);assert.equal(whole.actorInvocationRef,observed.provenance.actorInvocationRef);
  // Every stream whole, byte-equal to the admitted Testing Result's stream, its digest and length.
  const admitted=producer.payload.value,presentations=[];assert.equal(whole.commandResults.length,admitted.commandResults.length);
  for(const[j,row]of admitted.commandResults.entries()){
    const carriedRow=whole.commandResults[j];
    assert.deepEqual(Object.keys(carriedRow),['commandId','ordinal','observationRef','observationDigest','exitStatus','stdout','stderr']);
    for(const key of ['commandId','ordinal','observationRef','observationDigest','exitStatus'])assert.equal(carriedRow[key],row[key]);
    for(const lane of ['stdout','stderr']){
      const shown=carriedRow[lane],bytes=Buffer.from(row[lane].payload,'base64');
      const carriedBytes=shown.encoding==='utf8'?Buffer.from(shown.text,'utf8'):Buffer.from(shown.payload,'base64');
      assert.ok(carriedBytes.equals(bytes),lane+' '+j+' bytes');assert.equal(product.sha256Bytes(carriedBytes),row[lane].digest);
      assert.equal(shown.byteLength,row[lane].byteLength);assert.equal(shown.digest,row[lane].digest);
      if(strict(bytes))assert.deepEqual(Object.keys(shown),['byteLength','digest','encoding','text']);
      else assert.deepEqual(shown,row[lane],'a stream that is not strict UTF-8 is the admitted base64 row as it is');
      presentations.push(shown.encoding);
    }
  }
  assert.deepEqual([...new Set(presentations)].sort(),['base64','utf8'],'both presentations are exercised');
  assert.equal(whole.commandResults[1].stderr.text.codePointAt(0),0xFEFF,'a leading BOM is kept');
  assert.ok(whole.commandResults[1].stdout.text.includes('ℹ fail 0\n'));
  assert.deepEqual(whole.predicateObservations,admitted.predicateObservations);
  assert.equal(whole.predicateObservations.length,4);assert.ok(whole.predicateObservations.every(p=>p.evidence.length>0));
  // The shared bounded view is the unchanged Product projection: whole short strict streams, explicit omission otherwise.
  const facts=product.projectGovernanceObservationFacts(uat,prepared.context);
  assert.deepEqual(prepared.instructions.filter(i=>i.startsWith('Actual admitted observations: ')),['Actual admitted observations: '+JSON.stringify(facts)]);
  const bounded=facts.find(row=>row.resultRef===producer.payload.resultRef).observed;
  assert.equal(bounded.commandResults[1].stdout.complete,true);assert.deepEqual(bounded.commandResults[1].stdout.excerpts,[{startByte:0,endByte:testOut.length,text:testOut.toString()}],'a short strict stream is whole, middle lines included');
  assert.equal(bounded.commandResults[1].stderr.excerpts[0].text.codePointAt(0),0xFEFF);assert.ok(Buffer.from(bounded.commandResults[1].stderr.excerpts[0].text).equals(bomErr));
  assert.equal(bounded.commandResults[0].stdout.displayUnavailable,'not_utf8');assert.equal(bounded.commandResults[0].stdout.complete,false);
  assert.equal(bounded.commandResults[0].stdout.omittedByteCount,cliOut.length);assert.equal(bounded.commandResults[0].stdout.rawBody.omittedFromPlanningView,true);
  assert.ok(bounded.predicateObservations.every(p=>!Object.hasOwn(p,'evidence')&&p.evidenceBody.omittedFromPlanningView===true));
  // Falsifiers: the producer removed, or the planning view substituted for its streams or predicate evidence.
  const replaced=value=>({...prepared,instructions:prepared.instructions.map(i=>i===carried[0]?PRODUCER+' '+JSON.stringify(value):i)});
  assert.equal(m.namespace.governanceResultMatches(b,uat,replaced(whole)),true,'the re-rendered producer is the prepared one');
  assert.equal(m.namespace.governanceResultMatches(b,uat,{...prepared,instructions:prepared.instructions.filter(i=>i!==carried[0])}),false,'a task without its producer is refused');
  assert.equal(m.namespace.governanceResultMatches(b,uat,replaced({...whole,commandResults:whole.commandResults.map((row,j)=>
    ({...row,stdout:bounded.commandResults[j].stdout,stderr:bounded.commandResults[j].stderr}))})),false,'the planning view substituted for the producer streams is refused');
  assert.equal(m.namespace.governanceResultMatches(b,uat,replaced({...whole,predicateObservations:bounded.predicateObservations})),false,'the planning view substituted for the predicate evidence is refused');
  // A native producer gets no producer instruction: the bounded view carries its report whole.
  const nativeState=synth(initial,'construction'),nativeTask=await m.namespace.projectGovernanceNativeTask(at('construction','prepare-native',nativeState),nativeState);
  const native=nativeOwner.constructNativeWorkspaceWorkObservation(nativeTask,context,{summary:'Controlled partial native observation',gaps:['Independent assessment unresolved']},provenance);
  const nativeFold=fold(nativeState,'construction',native),nativeUat=synth(nativeFold.state,'uat',nativeFold.event.payload.resultRef);
  const nativeAssessmentTask=await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',nativeUat),nativeUat);
  assert.ok(nativeOwner.isNativeWorkspaceWorkTask(nativeAssessmentTask));assert.equal(nativeAssessmentTask.instructions.some(i=>i.startsWith(PRODUCER)),false);
});

test('C2 assessment binds a separate current DataMapper dossier without changing its twenty-six measured sources',async t=>{
  const scenarios=await import('../uat/scenarios.mjs'),consumer=await import('../uat/consumer.mjs');
  const fixtures=await scenarios.loadScenarios(join(packageRoot,'test_env/fixtures/sandbox-uat'));
  const acquired=await scenarios.acquireScenario(fixtures.root,fixtures.rows.find(r=>r.key==='data-mapper-full'));
  const initial=scenarios.constructWorkloadInput(product,acquired,consumer.assessmentSelection,{sbt:{executable:'/unit/sbt',environment:{}}});
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const put=async(path,bytes)=>{await mkdir(dirname(join(f.canonicalRoot,path)),{recursive:true});await writeFile(join(f.canonicalRoot,path),bytes);};
  for(const source of acquired.sources)await put(source.path,source.bytes);
  // Original source bytes and the full original command/report/predicate plan
  // are acquired. The other selected files and negative helper measurements
  // are controlled unit premises, not compiled Scala, runtime admission or UAT.
  for(const path of initial.original.testing.selectedPaths)if(!initial.original.sources.some(s=>s.path===path))await put(path,'controlled command input: '+path+'\n');
  const context=await physical.observeWorksiteContext({...f,readRoots:initial.original.readRoots,maxFiles:initial.original.maxContextFiles,maxBytes:initial.original.maxContextBytes});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),rows=[];
  const invocation={invocationRef:'invocation:separate-dossier',invocationAdmissionRef:'invocation-admission:separate-dossier',capabilityGrants:[f.capabilityGrant]};
  const execution={basisRef:'basis:wrapper',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:test',workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:initial}};
  const owned={program:library.programs[0],prefix:{},events:rows,execution,environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},call:{runId:'run:separate-dossier'},inputValue:null,inputRef:'input:test',inputOrigin:{}};
  let sourceBasis={...execution},invalidated=false,checkedPaths=[];
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId);
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  // Only occurrence authentication, indexing and invalidation are controlled;
  // physical contexts and typed task/artifact/observation/fold owners are real.
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>sourceBasis}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?await rootProjection(index,rootBasis(root,execution)):specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:(_p,_at,_root,paths)=>{checkedPaths=paths;return invalidated;},projectNativeWorkspaceWorkSourceAtPrefix:()=>({sourceBasis})}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const synth=(state,purpose,subjectEvidenceRef=null)=>({...state,synthesis:{resultRef:'result:synthesis:'+purpose,resultDigest:product.sha256Canonical(purpose),basis:{inputRef:'input:synthesis',inputDigest:product.sha256Canonical(state),taskRef:state.original.taskRef,environmentRef:'environment:test',environmentDigest:product.sha256Canonical('environment'),frameEvidenceDigest:product.sha256Canonical('frame'),frameRefs:['frame:test'],contextRef:context.observationRef,previousResultRef:state.synthesis?.resultRef??null},judgment:{interpretation:'Original DataMapper work',contributions:[{graphFunctionRef:product.governanceRef('graph-function',purpose),contribution:'Independently assess the current declared dossier',reason:'Current measurement support',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],gaps:[],nextGraphFunctionRef:product.governanceRef('graph-function',purpose),nextReason:'Declared independent assessment',nextEvidenceRefs:[],subjectEvidenceRef,revisionReason:'Current context',revisionEvidenceRefs:[]}}});
  const at=(purpose,operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);return {graphFunction:library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']===purpose)};};
  const fold=(state,purpose,value)=>{const input=product.constructRetainedGraphInput(state,value),b=at(purpose,'fold',input);
    const event={kind:'c_call_result_admitted',runId:owned.call.runId,basisId:'basis:child',aggregateId:'call:controlled:'+rows.length,admissionOrdinal:rows.length+10,payload:{resultRef:'result:controlled:'+rows.length,resultDigest:product.sha256Canonical(value),resultClass:'success',value}};
    rows.push(event);owned.inputOrigin={retainedProjection:{entryBasis:execution,input:{admissionRef:owned.inputRef,value:input},sourceResult:event}};
    const stateAfter=m.namespace.projectGovernanceFold(b,input);assert.ok(stateAfter);return {state:stateAfter,event};};
  const nativeOwner=await import('../../build/code/src/product/native_workspace_work.js');
  const provenance={cCallRef:'call:native',executionAuthorityRef:'authority:test',executionAuthorityDigest:product.sha256Canonical('authority'),actorInvocationRef:'actor:native',transportBindingRef:'transport:test',transportBindingDigest:product.sha256Canonical('transport'),promptDigest:product.sha256Canonical('prompt'),transportDigest:product.sha256Canonical('transport')};
  const nativeState=synth(initial,'construction'),nativeTask=await m.namespace.projectGovernanceNativeTask(at('construction','prepare-native',nativeState),nativeState);
  const native=nativeOwner.constructNativeWorkspaceWorkObservation(nativeTask,context,{summary:'Controlled partial native observation',gaps:['Independent assessment unresolved']},provenance);
  const nativeFold=fold(nativeState,'construction',native);
  const testing=synth(initial,'testing'),task=await m.namespace.projectGovernanceTestingTask(at('testing','prepare-testing',testing),testing);
  assert.equal(task.protectedObservations.length,26);assert.deepEqual(task.protectedObservations.map(p=>p.subject.relativePath),initial.original.testing.selectedPaths);
  assert.deepEqual(task.commands[0].args,['test']);assert.equal(task.commands[0].expectedReports.length,8);assert.equal(task.outcomePredicates.length,9);
  assert.deepEqual(task.outcomePredicates.map(p=>p.declaration),initial.original.testing.outcomePredicates.map(p=>p.declaration));
  const candidatePath=initial.original.assessment.candidatePath;
  assert.equal(candidatePath,'release/release-preparation.md');assert.equal(task.protectedObservations.some(p=>p.subject.relativePath===candidatePath),false);
  const c2=await import('../../build/code/src/product/worksite_command_execution.js'),plan=c2.worksiteCommandExecutionHelperPlan(task,'attempt:measurement');
  const empty={kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:'',byteLength:0,digest:product.sha256Bytes(Buffer.alloc(0))};
  const commandResults=task.commands.map(({kind,schemaVersion,expectedReports,...command})=>{
    const reports=expectedReports.map((report,ordinal)=>{const observationDigest=product.sha256Canonical({commandOrdinal:command.ordinal,commandId:command.commandId,expectedReportIdentity:report.reportIdentity,reportOrdinal:ordinal,relativePath:report.relativePath,state:'absent',byteLength:null,digest:null});
      return {kind:'worksite_report_observation',schemaVersion:'5.0.0',ordinal,commandOrdinal:command.ordinal,commandId:command.commandId,expectedReportIdentity:report.reportIdentity,relativePath:report.relativePath,state:'absent',byteLength:null,digest:null,observationRef:'worksite-report-observation://abiogenesis/'+observationDigest.slice(7),observationDigest};});
    const body={...command,exitStatus:7,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,stdout:empty,stderr:empty,reports,reportCount:0},observationDigest=product.sha256Canonical(body);
    return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+observationDigest.slice(7),observationDigest};});
  const predicateObservations=task.outcomePredicates.map(p=>({kind:'worksite_predicate_observation',schemaVersion:'5.0.0',ordinal:p.ordinal,predicateId:p.predicateId,predicateKind:p.predicateKind,observedValue:false,evidence:[],evidenceRefs:[]}));
  const members=task.protectedObservations.map(p=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:p.ordinal,sourceMemberRef:p.sourceMemberRef,sourceObservationRef:p.observation.observationRef,sourceObservationDigest:p.observation.observationDigest,relativePath:p.subject.relativePath,byteLength:p.observation.byteLength,digest:p.observation.fileDigest})),snapshotDigest=product.sha256Canonical(members);
  const artifact=c2.constructWorksiteExecutionHelperArtifact({task,disposition:'success',commandResults,predicateObservations,worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:task.protectedObservations.map(p=>p.observation),protectedAfter:task.protectedObservations.map(p=>p.observation)});
  const acknowledgment={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:task.taskRef,taskDigest:task.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
  const actor={actorRef:task.workerActorRef,workerBindingRef:task.workerBindingRef,implementationRef:product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:product.sha256Canonical(task),transportLane:'worker_executes',disposition:'success',toolCallCount:1,toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool:test',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],processRef:'process:test',...provenance,actorInvocationRef:'actor:measurement'};
  const observed=c2.constructWorksiteExecutionObservation(task,acknowledgment,actor,artifact,plan),measured=fold(testing,'testing',observed);
  assert.deepEqual(measured.state.original,initial.original);assert.equal(measured.state.terminal,false);assert.equal(measured.state.observations.at(-1).value.commandResults[0].exitStatus,7);
  const dossier=Buffer.from('Controlled current assessment dossier; measurement did not author this file.\n');await put(candidatePath,dossier);
  const uat=synth(measured.state,'uat',measured.event.payload.resultRef),b=at('uat','prepare-native',uat);
  const prepared=await m.namespace.projectGovernanceNativeTask(b,uat);assert.ok(prepared,'a separate current dossier must not be mistaken for a measured source');
  assert.equal(m.namespace.governanceResultMatches(b,uat,prepared),true);assert.ok(nativeOwner.isNativeWorkspaceWorkTask(prepared));
  assert.deepEqual(prepared.assessment.candidate,{path:candidatePath,digest:product.sha256Bytes(dossier)});
  assert.deepEqual(prepared.assessment.producer,{resultRef:measured.event.payload.resultRef,resultDigest:measured.event.payload.resultDigest,cCallRef:measured.event.aggregateId,actorInvocationRef:'actor:measurement'});
  assert.deepEqual(prepared.readFirst,[...uat.original.workOrders.uat.readFirst,candidatePath]);assert.deepEqual(prepared.writeRoots,[]);
  assert.deepEqual(checkedPaths,initial.original.testing.selectedPaths,'all twenty-six measurement dependencies still undergo write invalidation');
  assert.deepEqual(prepared.assessment.sources.map(s=>s.path),initial.original.assessment.sources);assert.equal(prepared.assessment.rubric.path,initial.original.assessment.rubricPath);
  assert.deepEqual(prepared.assessment.schemaAsset,initial.original.assessment.schemaAsset);assert.ok(prepared.instructions.includes('Conserved original task: '+initial.original.task));
  assert.equal(observed.task.protectedObservations.length,26);assert.equal(observed.task.protectedObservations.some(p=>p.subject.relativePath===candidatePath),false,'no retroactive measurement enrichment');
  const assessment=nativeOwner.constructNativeWorkspaceWorkObservation(prepared,prepared.context,null,{...provenance,cCallRef:'call:independent-assessment',actorInvocationRef:'actor:independent-assessor'},
    {kind:consumer.ASSESSMENT.valueKind,disposition:'unmet',reason:'Controlled negative measurement remains unmet',unresolvedCriteria:['original full criteria']});
  const assessed=fold(uat,'uat',assessment);assert.equal(assessed.state.observations.at(-1).value.disposition,'unmet');assert.equal(assessed.state.terminal,false);
  const prepare=()=>m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',uat),uat);
  for(const change of [{invocationAdmissionRef:'invocation:crossed'},{rootImplementationSetRef:'set:crossed'},{workspaceBindingId:'binding:crossed'},{workspaceBindingDigest:product.sha256Canonical('crossed')}]){
    sourceBasis={...execution,...change};assert.equal(await prepare(),null);sourceBasis={...execution};
  }
  invalidated=true;assert.equal(await prepare(),null);invalidated=false;
  const selectedObservation=uat.observations.at(-1);
  for(const change of [{resultDigest:product.sha256Canonical('crossed')},{cCallRef:'call:crossed'},{actorInvocationRef:'actor:crossed'}]){
    const crossed={...uat,observations:uat.observations.map(o=>o===selectedObservation?{...o,...change}:o)};
    assert.equal(await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',crossed),crossed),null);
  }
  const missing=synth(measured.state,'uat','result:missing');assert.equal(await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',missing),missing),null);
  const stalePath=initial.original.testing.selectedPaths.find(p=>!initial.original.sources.some(s=>s.path===p)),priorBytes=await readFile(join(f.canonicalRoot,stalePath));
  await put(stalePath,'changed measured source');assert.equal(await prepare(),null);await put(stalePath,priorBytes);
  await rm(join(f.canonicalRoot,candidatePath));assert.equal(await prepare(),null);await put(candidatePath,dossier);
  at('uat','prepare-native',uat);
  assert.equal(m.namespace.governanceResultMatches(b,uat,{...prepared,assessment:{...prepared.assessment,candidate:{...prepared.assessment.candidate,digest:product.sha256Canonical('crossed')}}}),false);
  assert.equal(m.namespace.governanceResultMatches(b,{...uat,original:{...uat.original,task:'crossed input'}},prepared),false);
  const nativeUat=synth(nativeFold.state,'uat',nativeFold.event.payload.resultRef);
  assert.equal(await m.namespace.projectGovernanceNativeTask(at('uat','prepare-native',nativeUat),nativeUat),null,'native producer membership still refuses a candidate absent from its after-observation');
});

test('parent conservation joins the pre-Run root basis through exact invocation and root implementation set',async()=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const invocation={invocationRef:'invocation:root',invocationAdmissionRef:'invocation-admission:root',capabilityGrants:[{}]},root={kind:'basis_admitted',runId:null,payload:{basisClass:'root',basisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:'set:root',rawInputValue:state}},roots=[root];
  const owned={program:{policies:{}},inputValue:state,call:{runId:'run:later-created',implementationRef:product.governanceRef('implementation','evaluate-parent')},execution:{basisRef:'basis:later-created',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:root'},environment:{kind:'exact_prefix_workspace_environment'},prefix:{}};
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?roots:[],projection=await rootProjection(index,rootBasis(root,owned.execution));
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?projection:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  assert.deepEqual(m.namespace.projectGovernanceParent({},state),state,'root basis has no Run coordinate yet');
  root.payload.implementationSetRef='set:foreign';assert.equal(m.namespace.projectGovernanceParent({},state),null);root.payload.implementationSetRef='set:root';
  root.payload.invocationAdmissionRef='invocation-admission:foreign';assert.equal(m.namespace.projectGovernanceParent({},state),null);root.payload.invocationAdmissionRef=invocation.invocationAdmissionRef;
  roots.push(root);assert.equal(m.namespace.projectGovernanceParent({},state),null);
});

test('one governance-root projection: the ancestry owner and the governance owner refuse two indexed roots and an ancestry that misses the indexed root',async()=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const invocation={invocationRef:'invocation:projection',invocationAdmissionRef:'invocation-admission:projection',capabilityGrants:[{}]};
  const execution={basisRef:'basis:projection-child',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:projection-root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:projection'};
  const admitted=basisRef=>({kind:'basis_admitted',runId:null,payload:{basisClass:'root',basisRef,invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:state}});
  let roots=[admitted('basis:projection-root')];
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?roots:[];
  const rehydrate=(_p,ref)=>ref===execution.parentExecutionBasisRef?{...execution,basisRef:ref,parentExecutionBasisRef:null,rawInputValue:state}:null;
  // Both owners read the one projection as built over the same supplied log.
  const projection=await rootProjection(index,rehydrate);
  const owned={program:{policies:{}},inputValue:state,call:{runId:'run:projection',implementationRef:product.governanceRef('implementation','evaluate-parent')},execution,environment:{kind:'exact_prefix_workspace_environment'},prefix:{}};
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?projection:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  // Consistent log: the one indexed root is the root the ancestry reaches.
  assert.equal(projection.semanticJobRootAtPrefix({},execution)?.basisRef,'basis:projection-root');
  assert.deepEqual(projection.invocationRootAtPrefix({},execution),projection.semanticJobRootAtPrefix({},execution));
  assert.deepEqual(m.namespace.projectGovernanceParent({},state),state);
  // Two indexed roots of the same invocation admission and implementation set.
  roots=[admitted('basis:projection-root'),admitted('basis:projection-second')];
  assert.equal(projection.semanticJobRootAtPrefix({},execution),null,'an index with two roots refuses');
  assert.equal(m.namespace.projectGovernanceParent({},state),null,'the governance owner refuses two indexed roots');
  // One indexed root that the ancestry walk does not reach.
  roots=[admitted('basis:projection-other')];
  assert.equal(projection.semanticJobRootAtPrefix({},execution),null,'an ancestry that misses the indexed root refuses');
  assert.equal(m.namespace.projectGovernanceParent({},state),null,'the governance owner refuses an ancestry that misses the indexed root');
  roots=[admitted('basis:projection-root')];
  assert.deepEqual(m.namespace.projectGovernanceParent({},state),state);
});
test('DataMapper caller separates author territories and baseline inputs from future final proof',async()=>{
  const scenarios=await import('../uat/scenarios.mjs'),consumer=await import('../uat/consumer.mjs');
  const {root,rows}=await scenarios.loadScenarios(join(packageRoot,'test_env/fixtures/sandbox-uat'));
  const selected=await scenarios.acquireScenario(root,rows.find(r=>r.key==='data-mapper-full'));
  // Actual acquisition and strict governance owner; the toolchain coordinate
  // is a unit input and no SBT, Scala, actor or application work runs here.
  const state=scenarios.constructWorkloadInput(product,selected,consumer.assessmentSelection,{sbt:{executable:'/unit/sbt',environment:{}}});
  assert.ok(product.isGovernanceWorkState(state));assert.equal(state.terminal,false);
  assert.equal(state.original.task,selected.request.task);assert.deepEqual(state.unresolvedSupportRefs,selected.request.requiredSupportRefs);
  const orders=state.original.workOrders,baseline=state.original.testing.selectedPaths;
  assert.deepEqual(orders.induction.writeRoots,['specification/intent.md']);
  assert.ok(orders.specification.writeRoots.every(p=>p.startsWith('specification/')));
  assert.ok(orders.design.writeRoots.every(p=>p.startsWith('design/')||p==='repair/component-repair-schedule.md'));
  assert.ok(orders.construction.writeRoots.every(p=>!p.startsWith('specification/')&&!p.startsWith('design/')));
  // The original request also reads the separate execution-result projection;
  // that path is not one of its original author-granted artifacts.
  assert.ok(selected.request.readRoots.includes('test-execution-result.json'));
  const finalPaths=selected.request.readRoots.filter(p=>!p.startsWith('source/')&&p!=='test-execution-result.json');
  assert.equal(finalPaths.length,44);assert.deepEqual([...new Set(['induction','specification','design','construction'].flatMap(p=>orders[p].writeRoots))].sort(),[...finalPaths].sort());
  for(const source of state.original.sources)assert.ok(baseline.includes(source.path),'original source remains snapshotted');
  for(const fragment of ['/build.sbt','/project/plugins.sbt','/project/build.properties'])assert.equal(baseline.filter(p=>p.endsWith(fragment)).length,1);
  assert.equal(baseline.filter(p=>p.includes('/src/main/scala/')).length,11);
  assert.equal(baseline.filter(p=>p.includes('/src/test/scala/')).length,8);
  assert.equal(baseline.length,26);
  for(const path of ['depth-proof-map.json','mutation-outcomes.json','release/release-preparation.md','proof/repaired-component-test-execution-qualification.md']){
    assert.ok(finalPaths.includes(path),'future proof remains a final obligation');assert.equal(baseline.includes(path),false,'future output is not an initial command input');
  }
  assert.deepEqual(state.original.testing.commands[0].args,['test']);assert.equal(state.original.testing.commands[0].expectedReports.length,8);
  assert.equal(state.original.testing.outcomePredicates.find(p=>p.predicateKind==='test_pass_count').declaration.greaterThanOrEqual,20);
  assert.deepEqual(state.original.testing.outcomePredicates,selected.request.testing.outcomePredicates);
  assert.deepEqual(state.original.assessment.sources,selected.request.assessment.sources);
  assert.equal(state.original.assessment.candidatePath,'release/release-preparation.md');
});

test('consumer-authored source and scope remain exact application data; no solution is in library',async()=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),input=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  assert.ok(product.isGovernanceWorkState(input));assert.equal(input.terminal,false);assert.deepEqual(input.unresolvedSupportRefs,input.original.requiredSupportRefs);
  assert.deepEqual(input.observations,[]);assert.ok(!input.original.task.includes(selection.prospectiveCounterexample.expectedObservedMismatch));
  const library=await readFile(new URL('../../code/src/product/default_library.ts',import.meta.url),'utf8');assert.ok(!library.includes('Hello'));
  const bad=structuredClone(input);bad.original.sources[0].digest='wrong';assert.equal(product.isGovernanceWorkState(bad),false);
  bad.original.sources=input.original.sources;bad.unresolvedSupportRefs=[];assert.equal(product.isGovernanceWorkState(bad),false);
});

test('observed child provenance joins the current preparation and rejects crossed or missing causal facts',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const observedFiles=[];
  for(const relativePath of state.original.testing.selectedPaths){const subject=physical.constructWorksiteSubject({...f,relativePath,subjectUri:pathToFileURL(join(f.canonicalRoot,relativePath)).href});
    observedFiles.push({subject,observation:await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject)});}
  const task=product.constructObservedWorksiteCommandExecutionTask({...f,observedFiles,...product.governanceTestingConfiguration(state)});
  assert.equal(observedGovernanceTaskMatches(state,task),true);
  const parent={basisRef:'basis:testing',graphFunctionRef:product.governanceRef('graph-function','testing'),invocationAdmissionRef:'invocation:testing',
    rawInputValue:state,rawInputAdmissionRef:'raw:testing',rawInputDigest:product.sha256Canonical(state),workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const rows=[];let currentnessArgs=null;
  const scope={scopeClass:'run',runId:'run:testing',basisId:parent.basisRef,graphCallId:'call:testing',frameId:'frame:testing',graphFunctionRef:parent.graphFunctionRef};
  const append=(kind,payload,aggregateId,causes=[],extra={})=>{const event={kind,payload,eventTime:'2026-09-29T00:00:00.000Z',aggregateType:'c_call',aggregateId,parentAggregateId:null,causationEventRefs:causes,correlationId:'correlation:testing',workflowVersion:'5.0.0',...scope,...extra,eventId:'event:'+rows.length,admissionOrdinal:rows.length};rows.push(event);return event;};
  // Controlled admitted-event/index, invocation and currentness premises.
  // This is source-owner correspondence proof, not installed execution. The
  // unchanged currentness owner has separate real-file/refusal checks below.
  const file=resolve(packageRoot,'build/code/src/abg/worksite_input_provenance.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:(_p,r)=>r===parent.invocationAdmissionRef?{capabilityGrants:[f.capabilityGrant]}:null}:specifier==='./event_prefix.js'?{indexedRuntimeEvents:(_p,key)=>rows.filter(e=>key==='basis:'+e.basisId)}:specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:(...args)=>{currentnessArgs=args;return false;}}:{};const values={...actual,...replacements};
    return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const check=(patch={})=>m.namespace.projectObservedWorksiteCommandChildAtPrefix({rows},{parentBasis:parent,parentCCallRef:'call:c2',runId:scope.runId,task,...patch});
  assert.equal(check(),null);
  append('c_call_result_admitted',{resultRef:'result:old',resultDigest:product.sha256Canonical(task),resultClass:'success',value:task},'call:old',[],{runId:'run:old',basisId:'basis:old'});
  const entered=append('traversal_cursor_entered',{cursorRef:'cursor:prepare',cursorDigest:product.sha256Canonical('prepare'),inputRef:parent.rawInputAdmissionRef,inputDigest:parent.rawInputDigest},'frame:testing');
  const opened=append('c_call_opened',{cursorRef:'cursor:prepare',cursorDigest:product.sha256Canonical('prepare'),callClass:'leaf'},'call:prepare',[entered.eventId]);
  const fibre=append('c_call_fibre_selected',{regime:'F_D',implementationRef:product.governanceRef('implementation','prepare-testing'),implementationBindingRef:product.governanceRef('binding','prepare-testing')},'call:prepare',[opened.eventId]);
  const result=append('c_call_result_admitted',{resultRef:'result:prepare',resultDigest:product.sha256Canonical(task),resultClass:'success',contractRef:product.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,value:task,valueDigest:product.sha256Canonical(task)},'call:prepare',[fibre.eventId]);
  const judgment=append('c_call_judged',{resultRef:'result:prepare',resultDigest:product.sha256Canonical(task),judgment:'advance',judgmentRef:'judgment:prepare'},'call:prepare',[result.eventId]);
  const route=append('traversal_route_admitted',{routeKind:'advance',cCallRef:'call:prepare',judgmentRef:'judgment:prepare',targetCursorRef:'cursor:c2',targetCursorDigest:product.sha256Canonical('c2')},'frame:testing',[judgment.eventId]);
  append('c_call_opened',{callClass:'workflow',childGraphFunctionRef:product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,cursorRef:'cursor:c2',cursorDigest:product.sha256Canonical('c2')},'call:c2',[route.eventId]);
  assert.ok(check());assert.equal(check().preparationResult.eventId,result.eventId);assert.equal(check().acquisitionEvent.eventId,fibre.eventId);assert.equal(currentnessArgs[1],fibre.admissionOrdinal);assert.deepEqual(currentnessArgs[3],state.original.testing.selectedPaths);
  assert.equal(check({runId:'run:old'}),null);assert.equal(check({parentCCallRef:'call:other'}),null);
  assert.equal(check({task:{...task,sourceNativeWork:{}}}),null);
  const crossed=structuredClone(state);crossed.original.testing.commands[0].args=['--version'];assert.equal(observedGovernanceTaskMatches(crossed,task),false);
  const original=parent.rawInputDigest;parent.rawInputDigest=product.sha256Canonical('crossed');assert.equal(check(),null);parent.rawInputDigest=original;
  append('c_call_judged',{resultRef:'result:prepare',resultDigest:product.sha256Canonical(task),judgment:'advance',judgmentRef:'judgment:duplicate'},'call:prepare',[result.eventId]);assert.equal(check(),null,'ambiguous applicable provenance refuses');
});

test('observed command correspondence conserves explicit input across empty and different process environments',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8')),state=structuredClone(await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}));
  state.original.testing.commands[0].environment={PATH_PREFIX:'/selected/bin',DECLARED:'fixed'};
  state.original.testing.commands[1].environment={PATH:'/explicit/bin',LANG:'C'};
  const observedFiles=[];for(const path of state.original.testing.selectedPaths){const subject=physical.constructWorksiteSubject({...f,relativePath:path,subjectUri:pathToFileURL(join(f.canonicalRoot,path)).href});observedFiles.push({subject,observation:await physical.observeWorksiteSubject(f.workspaceAuthorityBasis,f.workspaceBinding,subject)});}
  const command=await import('../../build/code/src/product/worksite_command_execution.js');
  const task=command.constructObservedWorksiteCommandExecutionTask({...f,observedFiles,...product.governanceTestingConfiguration(state)});
  assert.equal(observedGovernanceTaskMatches(state,task),true);
  const child=`import assert from 'node:assert/strict';import {observedGovernanceTaskMatches} from ${JSON.stringify(pathToFileURL(resolve(packageRoot,'build/code/src/abg/default_library.js')).href)};const [state,task]=JSON.parse(process.argv[1]);assert.equal(observedGovernanceTaskMatches(state,task),true);`;
  for(const environment of [{},{PATH:'/different/bin',HOME:'/different-home',LANG:'different',LC_ALL:'different',TMPDIR:'/different-tmp'}])await promisify(execFile)(process.execPath,['--input-type=module','--eval',child,JSON.stringify([state,task])],{env:environment});
  const changed=mutate=>{const value=structuredClone(state);mutate(value.original.testing);assert.equal(observedGovernanceTaskMatches(value,task),false);};
  for(const [key,value]of Object.entries({commandId:'changed',executable:'other',args:['--version'],relativeCwd:'test',timeoutMs:19000,terminationGraceMs:1000,expectedReports:[{reportIdentity:'changed',relativePath:'evidence/report'}]}))changed(t=>t.commands[0][key]=value);
  changed(t=>t.commands[0].environment.DECLARED='changed');changed(t=>t.commands[0].environment.PATH_PREFIX='/other/bin');changed(t=>t.commands[1].environment.PATH='/other/bin');changed(t=>t.commands[1].environment.LANG='changed');changed(t=>t.allowedWriteTerritories[0].relativePath='other-evidence');
  assert.equal(observedGovernanceTaskMatches(state,{...task,taskDigest:product.sha256Canonical('changed')}),false);
  const configuration={workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,...product.governanceTestingConfiguration(state),protectedSubjects:observedFiles.map(r=>r.subject)};
  // The same owner also captures HTTP launch defaults; replay must not reacquire them.
  configuration.outcomePredicates=[{predicateId:'predicate:http',predicateKind:'http_response_exact',declaration:{validationCommandId:state.original.testing.commands[0].commandId,status:200,body:'ok',launch:{executable:'node',args:[product.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],relativeCwd:'.',environment:{PATH_PREFIX:'/http/bin',MODE:'fixed'},portFile:{relativePath:'execution-evidence/port'},timeoutMs:1000,terminationGraceMs:100},request:{hostname:'127.0.0.1',method:'GET',path:'/',timeoutMs:500}}}];
  const bound=command.constructWorksiteCommandConfiguration(configuration);assert.equal(command.worksiteCommandConfigurationMatches(configuration,bound),true);
  const wrong=structuredClone(configuration);wrong.outcomePredicates[0].declaration.launch.environment.MODE='changed';assert.equal(command.worksiteCommandConfigurationMatches(wrong,bound),false);
  const predicateChild=`import assert from 'node:assert/strict';import {worksiteCommandConfigurationMatches} from ${JSON.stringify(pathToFileURL(resolve(packageRoot,'build/code/src/product/worksite_command_execution.js')).href)};const [input,bound]=JSON.parse(process.argv[1]);assert.equal(worksiteCommandConfigurationMatches(input,bound),true);`;
  await promisify(execFile)(process.execPath,['--input-type=module','--eval',predicateChild,JSON.stringify([configuration,bound])],{env:{}});
});

test('one installed Public default-library invocation reuses observed files, corrects actual work and independently closes',{skip:process.env.ABI5_DEFAULT_LIBRARY_LIVE!=='1'&&"ABI5_DEFAULT_LIBRARY_LIVE is not '1'; selects the installed Public default-library invocation"},async()=>{
  const evidence=process.env.ABI5_DEFAULT_LIBRARY_EVIDENCE_ROOT??await mkdtemp(join(tmpdir(),'abi5-default-library-'));
  await mkdir(evidence,{recursive:true});const save=(n,v)=>writeFile(join(evidence,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
  const selectionPath=join(witnessRoot,'selection.json'),selection=JSON.parse(await readFile(selectionPath,'utf8'));
  assert.equal(await product.sha256File(selectionPath),'sha256:ca439cb9aa144477a6aa1d5956d51a5a2c29c084283e2b028a5b94af74c55dbc');
  const provider=JSON.parse(await readFile(process.env.ABI5_NATIVE_SELECTION_PROVIDER,'utf8'));
  assert.equal(provider.requestedModel,'claude-opus-5-5');assert.equal(provider.requestedEffort,'xhigh');assert.equal(await product.sha256File(provider.executable),provider.sha256);
  await save('provider.json',provider);await save('selection.json',selection);
  const companion=process.env.ABI5_DEFAULT_LIBRARY_SUPPLIED_VALID==='1';
  const frozenArtifact=process.env.ABI5_DEFAULT_LIBRARY_FROZEN_ARTIFACT?JSON.parse(await readFile(process.env.ABI5_DEFAULT_LIBRARY_FROZEN_ARTIFACT,'utf8')):null;
  if(companion)assert.ok(process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE&&process.env.ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS,'companion requires exact observed candidate bytes and their retained source event');
  const accounting={wallMs:{}};let selectedEnvironment;
  const env=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting:accounting,...(frozenArtifact?{frozenArtifact}:{}),
    additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const archive=setup.abiPackageArchivePath;
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:archive,declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration,companion?{purposes:['testing','uat']}:{}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  const installHost=join(evidence,'frozen-host');await mkdir(join(installHost,'node_modules/@abiogenesis'),{recursive:true});await symlink(env.installedRoot,join(installHost,'node_modules/@abiogenesis/typescript-tenant'));
  await save('frozen-artifact.json',{artifactPath:env.artifactPath,installHost,artifactSha256:await product.sha256File(env.artifactPath)});
  await save('setup.json',{scratch:env.scratch,installedRoots:env.installedRoots,artifactPaths:env.artifactPaths,accounting});
  await save('archive.json',{core:{path:env.artifactPath,sha256:await product.sha256File(env.artifactPath)},consumer:env.additionalProducts[0].basis});
  await copyFile(env.artifactPath,join(evidence,'core.tgz'));await copyFile(env.additionalProducts[0].artifactPath,join(evidence,'consumer.tgz'));
  await save('run-environment.json',selectedEnvironment.declaration);await save('publication.json',env.additionalPublications[0]);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  const copyStarted=performance.now();await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  for(const [path,row] of Object.entries(selection.seedFiles))assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+row.sha256);
  await save('seed-copy.json',{wallMs:performance.now()-copyStarted,bytes:Object.values(selection.seedFiles).reduce((n,r)=>n+r.bytes,0),files:selection.seedFiles});
  const caseSelection=structuredClone(selection);
  if(companion){
    const candidate=await readFile(process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE),sourceEvents=JSON.parse(await readFile(process.env.ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS,'utf8'));
    const source=sourceEvents.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.payload.resultClass==='success').find(e=>e.payload.value?.after?.entries.some(row=>row.relativePath==='generated/hello-world.mjs'&&row.digest===product.sha256Bytes(candidate)));
    assert.ok(source,'candidate must equal actual observed native output');const member=source.payload.value.after.entries.find(row=>row.relativePath==='generated/hello-world.mjs');
    assert.equal(member.byteLength,candidate.length);assert.deepEqual(Buffer.from(member.bytes,'base64'),candidate);
    await copyFile(process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE,join(worksite,'generated/hello-world.mjs'));
    const contract=join(witnessRoot,'supplied-work-contract.md');await copyFile(contract,join(worksite,'source/witness-contract.md'));
    caseSelection.applicationWriteRoots=[];
    for(const path of ['generated/hello-world.mjs','source/witness-contract.md']){const bytes=await readFile(join(worksite,path));caseSelection.seedFiles[path]={bytes:bytes.length,sha256:product.sha256Bytes(bytes).slice(7)};}
    await save('supplied-candidate.json',{source:process.env.ABI5_DEFAULT_LIBRARY_VALID_CANDIDATE,digest:member.digest,byteLength:member.byteLength,sourceEventsSha256:await product.sha256File(process.env.ABI5_DEFAULT_LIBRARY_CANDIDATE_EVENTS),sourceEvent:source.eventId,sourceResult:source.payload.resultRef,contract,contractDigest:await product.sha256File(contract),runtimeImport:false});
  }
  await save('case-input-files.json',caseSelection.seedFiles);
  const input=await witnessInput({product,selection:caseSelection,seedRoot:worksite});await save('input.json',input);
  const refs=env.additionalPublications[0].programs[0].callableMembership;
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,refs);assert.equal(env.catalogView.kind,'graph_function_catalog_view',JSON.stringify(env.catalogView));
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'default-library',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const closure=env.product.resolveProgramDeclarationClosure(env.catalog,env.catalogView,start.resolution.program.programRef);
  assert.equal(closure.kind,'resolved_program_declaration_closure',JSON.stringify(closure));
  const selectedRefs=['state','selection-task','synthesis','choice','native-response'].map(product.governanceContract);
  for(const ref of selectedRefs){const owners=closure.contractOwners.filter(o=>o.declarationRef===ref);assert.equal(owners.length,1);assert.equal(owners[0].moduleRef,product.governanceRef('module','default'));}
  // Unadmitted duplicate-owner probe; never install or dispatch this mutation.
  const duplicate=structuredClone(env.catalog),consumer=duplicate.boundPublications.find(p=>p.moduleRef===witnessRef('module','witness'));
  consumer.contracts.push(structuredClone(duplicate.boundPublications.find(p=>p.moduleRef===product.governanceRef('module','default')).contracts.find(c=>c.contractRef===product.governanceContract('state'))));
  const changedDigest=env.product.modulePublicationSemanticDigest(consumer);
  for(const entry of duplicate.entries.filter(e=>e.owningProductId===consumer.owningProductId)){entry.publicationDigest=changedDigest;const {entryDigest,...body}=entry;entry.entryDigest=product.sha256Canonical(body);}
  duplicate.byHandle=Object.fromEntries(duplicate.entries.map(e=>[e.handle,e]));
  const duplicateView=env.product.narrowGraphFunctionCatalog(duplicate,env.catalogView.allowlist),refusal=env.product.resolveProgramDeclarationClosure(duplicate,duplicateView,start.resolution.program.programRef);
  await save('imported-contract-owners.json',{owners:closure.contractOwners.filter(o=>selectedRefs.includes(o.declarationRef)),duplicateProbe:refusal});
  assert.equal(refusal.kind,'execution_declaration_closure_refusal');assert.equal(refusal.code,'ambiguous');assert.match(refusal.message,/Contract .*state.*one exact compatible publication owner/);
  const physical=await load('product/worksite_operations'),observedInput={workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding:env.workspaceBinding,capabilityGrant:start.capabilityBasis.capabilityGrants[0],protectedInstallRoots:env.installedRoots,readRoots:input.original.readRoots,maxFiles:input.original.maxContextFiles,maxBytes:input.original.maxContextBytes};
  const context=await physical.observeWorksiteContext(observedInput),protectedScope=await physical.observeWorksiteContext({...observedInput,readRoots:['.']});
  await save('context-readiness.json',{context,protectedScope});assert.equal(context.kind,'worksite_context_observation',JSON.stringify(context));assert.equal(context.entries.length,10);
  assert.ok(input.original.sources.every(s=>context.entries.some(e=>e.relativePath===s.path&&e.digest===s.digest)));
  for(const path of [...input.original.testing.selectedPaths,...Object.values(input.original.workOrders).flatMap(o=>[...o.readFirst,...o.writeRoots]),input.original.assessment.candidatePath,input.original.assessment.rubricPath])assert.ok(context.entries.some(e=>e.relativePath===path));
  assert.notEqual(protectedScope.kind,'worksite_context_observation');assert.ok(!input.original.assessment.sources.includes(input.original.assessment.rubricPath));
  await save('mechanical-readiness.json',{companion,selectionSha256:await product.sha256File(selectionPath),providerSha256:provider.sha256,inputDigest:product.sha256Canonical(input),callableMembership:refs,ready:true});
  const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'default-library',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,
    environment:{...process.env,ABG_TS_CLAUDE_COMMAND:provider.executable,ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(provider.appendArgs)}});
  await save('execution.json',execution);const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution.output));
  handoff=receipt.resources.eventResource.closeHandoff;await save('handoff.json',handoff);
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before);await save('events.json',events);
  await writeFile(join(evidence,'events.jsonl'),await readFile(new URL(handoff.prefix.eventLogRef)),{flag:'wx'});
  const bindings=events.filter(e=>e.kind==='actor_transport_binding_admitted');const timings=[];
  for(const [i,binding] of bindings.entries()){
    await save(`assembly-${i+1}.json`,binding.payload.instructionAssembly);
    for(const [name,path] of Object.entries(binding.payload.paths))if(typeof path==='string')try{await copyFile(path,join(evidence,`actor-${i+1}-${name}-${basename(path)}`));}catch(e){if(e.code!=='ENOENT')throw e;}
    const started=events.find(e=>e.kind==='actor_invocation_started'&&e.parentAggregateId===binding.parentAggregateId),closed=events.find(e=>['actor_invocation_closed','actor_invocation_failed'].includes(e.kind)&&e.parentAggregateId===binding.parentAggregateId);
    const stdout=await readFile(binding.payload.paths.stdoutPath??binding.payload.paths.stdout,'utf8');
    const rows=stdout.trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
    const reportedModels=[...new Set(rows.flatMap(row=>[row.model,row.message?.model,...Object.keys(row.modelUsage??{})]).filter(Boolean))];
    timings.push({actor:i+1,command:binding.payload.command,args:binding.payload.args,reportedModels,nativeIntervalMs:started&&closed?Date.parse(closed.eventTime)-Date.parse(started.eventTime):null,promptBytes:Buffer.byteLength(binding.payload.instructionAssembly.request.prompt)});
  }
  await save('timing.json',{setup:accounting,executionMs:execution.wallMs,native:timings,frameworkOutsideNativeIntervalsMs:execution.wallMs-timings.reduce((n,t)=>n+(t.nativeIntervalMs??0),0),publicRequestBytes:(await readFile(execution.requestPath)).length,eventCount:events.length});
  await cp(worksite,join(evidence,'worksite-result'),{recursive:true,filter:path=>!path.includes('/.ai-workspace')});
  for(const row of timings){assert.equal(row.command,provider.executable);assert.equal(row.args[row.args.indexOf('--model')+1],'claude-opus-5-5');assert.equal(row.args[row.args.indexOf('--effort')+1],'xhigh');assert.ok(!row.args.includes('--fallback-model'));assert.ok(row.reportedModels.length>0&&row.reportedModels.every(m=>m==='claude-opus-5-5'));}
  assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
  const results=events.filter(e=>e.kind==='c_call_result_admitted'),choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice');
  const commands=results.filter(e=>e.payload.value?.kind==='worksite_command_execution_observation'&&e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
  assert.ok(commands.length>=(companion?1:2));assert.ok(commands[0].payload.value.task.sourceObservedInput);
  const author=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);
  if(companion)assert.equal(author,undefined,'supplied valid work reaches UAT without an author');
  else{assert.ok(commands[0].payload.value.commandResults.some(r=>r.exitStatus!==0));assert.ok(author&&author.admissionOrdinal>commands[0].admissionOrdinal);}
  assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.admissionOrdinal<commands[0].admissionOrdinal).length,0);
  assert.ok(new Set(choices.map(e=>e.payload.value.graphFunctionRef)).size>=(companion?2:3));
  const selectedTasks=results.filter(e=>e.payload.value?.kind==='framed_synthesis_task');
  assert.ok(selectedTasks.some(e=>e.admissionOrdinal>commands[0].admissionOrdinal&&JSON.stringify(e.payload.value).includes(commands[0].payload.resultRef)));
  const assessment=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef);assert.ok(assessment);assert.equal(assessment.payload.value.assessment.disposition,'satisfied');
  assert.notEqual(assessment.payload.value.provenance.actorInvocationRef,(author??commands[0]).payload.value.provenance.actorInvocationRef);
  if(companion){assert.ok(commands.some(e=>assessment.payload.value.task.assessment.producer.resultRef===e.payload.resultRef));assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef).length,0);}
  const parent=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive'));assert.equal(parent.at(-1).payload.value.terminal,true);assert.ok(parent.slice(0,-1).every(e=>!e.payload.value.terminal));
  assert.ok(parent.at(-1).admissionOrdinal>assessment.admissionOrdinal);assert.equal(events.filter(e=>e.kind==='run_closed').length,1);
  for(const event of parent){assert.deepEqual(event.payload.value.original,input.original);if(!event.payload.value.terminal)assert.deepEqual(event.payload.value.unresolvedSupportRefs,input.unresolvedSupportRefs);}
  for(const path of [...selection.protectedSeedPaths,...(companion?['generated/hello-world.mjs']:[])])assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+caseSelection.seedFiles[path].sha256);
  const final=commands.at(-1).payload.value;assert.ok(final.commandResults.every(r=>r.exitStatus===0));
  assert.equal(Buffer.from(final.commandResults[0].stdout.payload,'base64').toString('utf8'),'Hello, world!\n');
  const testOutput=Buffer.from(final.commandResults[1].stdout.payload,'base64').toString('utf8');assert.match(testOutput,/pass 2/);assert.match(testOutput,/fail 0/);
  const syntheses=results.filter(e=>e.payload.value?.kind==='framed_synthesis_result');assert.equal(syntheses.length,choices.length);
  const correspondence=syntheses.map((e,i)=>{const value=e.payload.value,choice=choices[i],folded=results.find(r=>r.payload.value?.kind==='governance_work_state'&&r.payload.value.observations.at(-1)?.synthesisResultRef===e.payload.resultRef);
    assert.deepEqual(choice.payload.value.reason,value.judgment.nextReason);assert.equal(choice.payload.value.graphFunctionRef,value.judgment.nextGraphFunctionRef);assert.equal(choice.payload.value.input.value.synthesis.resultRef,e.payload.resultRef);assert.deepEqual(choice.payload.value.input.value.synthesis.judgment,value.judgment);
    assert.equal(value.basis.previousResultRef,i===0?null:syntheses[i-1].payload.resultRef);assert.deepEqual(value.state.original,input.original);assert.ok(folded);
    const observation=folded.payload.value.observations.at(-1),child=results.find(r=>r.payload.resultRef===observation.resultRef&&r.aggregateId===observation.cCallRef);assert.ok(child);
    return {synthesisEvent:e.eventId,synthesisOrdinal:e.admissionOrdinal,resultRef:e.payload.resultRef,basis:value.basis,judgment:value.judgment,choiceEvent:choice.eventId,choiceOrdinal:choice.admissionOrdinal,childResultEvent:child.eventId,childResultOrdinal:child.admissionOrdinal,childGraphFunction:child.graphFunctionRef,foldEvent:folded.eventId,foldOrdinal:folded.admissionOrdinal,parentEvent:parent.find(p=>p.admissionOrdinal>folded.admissionOrdinal)?.eventId};});
  await save('synthesis-correspondence.json',correspondence);
  await save('asserted-outcome.json',{companion,choiceRefs:choices.map(e=>e.payload.value.graphFunctionRef),commandResultRefs:commands.map(e=>e.payload.resultRef),assessmentRef:assessment.payload.resultRef,parentRef:parent.at(-1).payload.resultRef});
  for(const memberKey of ['run_result','run_replay']){
    const call=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource(),identity:`default-library-${memberKey}`});
    const read=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:`default-library-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:call.call,expectedExitCode:0});await save(`read-${memberKey}.json`,read);
    assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
  }
});

// Model-free stand-in for the native provider process. ABG transport, actor,
// admission, selection binding, worksite observation and C2 owners are genuine;
// only the model's answer is scripted. The role is read from the supplied
// response schema: the selector chooses Construction, then Testing over the
// actual native-work Result (production subjectEvidence), then UAT over the
// actual C2 measurement; the native worker repairs the candidate; the assessor
// reports satisfaction. ABI5_SCRIPTED_ACTOR_PHASE=gap-after-construction makes
// the selector report a gap once a native Result exists; the prompt directory,
// when supplied, receives each selector prompt as delivered.
// ABI5_SCRIPTED_ACTOR_W_OUTSIDE_R, when supplied, names one worksite-relative
// file the native worker also writes in its granted W outside observed R.
const SCRIPTED_ACTOR=`
import {readFileSync,writeFileSync,existsSync,appendFileSync,mkdirSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {dirname} from 'node:path';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8');
// C2 executor: its owner prompt carries the one exact helper command; run it through one Bash tool use.
const tasks=prompt.split('\\n\\n').filter(x=>x.startsWith('## task\\n'));let c2=null;
if(tasks.length===1)try{const owner=JSON.parse(tasks[0].slice('## task\\n'.length)).ownerPrompt,input=JSON.parse(owner.split('\\n\\n')[1]);if(Object.keys(input).length===1&&typeof input.command==='string')c2=input;}catch{}
if(c2){console.log(JSON.stringify({type:'system',subtype:'init'}));console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_scripted_c2',name:'Bash',input:c2}]}}));
 const helper=spawnSync('/bin/sh',['-c',c2.command],{encoding:'utf8',maxBuffer:64*1024*1024});if(helper.status!==0){process.stderr.write(String(helper.stderr));process.exit(1);}
 appendFileSync(process.env.ABI5_SCRIPTED_ACTOR_LOG,JSON.stringify({role:'c2',pid:process.pid})+'\\n');
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(helper.stdout)}));process.exit(0);}
const schema=at<0?{}:JSON.parse(args[at+1]),props=schema.properties??{},log=process.env.ABI5_SCRIPTED_ACTOR_LOG;let role,output,extra={};
if('interpretation' in props){
 // The transport presents flattened domains; ordering comes from this actor's own prior answers.
 const prior=existsSync(log)?readFileSync(log,'utf8').trim().split('\\n').filter(Boolean).map(l=>JSON.parse(l)).filter(r=>r.role.startsWith('select:')):[];
 const graphs=[...new Set([...(props.nextGraphFunctionRef.enum??[]),...(props.contributions.items.properties.graphFunctionRef.enum??[])].filter(g=>typeof g==='string'))];
 const find=p=>graphs.find(g=>g.includes('/'+p+'@')),testing=find('testing'),uat=find('uat'),construction=find('construction'),immediate=props.nextGraphFunctionRef.enum??[];
 const domain=(props.subjectEvidenceRef.enum??[]).filter(r=>typeof r==='string'),seen=prior.flatMap(r=>r.domain??[]),fresh=domain.filter(r=>!seen.includes(r));
 const tested=prior.some(r=>r.role==='select:'+testing),gap=process.env.ABI5_SCRIPTED_ACTOR_PHASE==='gap-after-construction'&&domain.length>0;
 const [next,subject]=gap?[null,null]:!tested&&domain.length&&immediate.includes(testing)?[testing,domain.at(-1)]:tested&&fresh.length&&uat?[uat,fresh.at(-1)]:[construction,null];
 const items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[];
 // Optional capture of the exact selector prompt the transport delivered.
 const prompts=process.env.ABI5_SCRIPTED_ACTOR_PROMPTS,promptFile=prompts?prompts+'/select-'+process.pid+'.txt':null;if(promptFile)writeFileSync(promptFile,prompt);
 role='select:'+next;extra={domain,...(promptFile?{promptFile}:{})};output={interpretation:'Scripted model-free selector.',contributions:[{graphFunctionRef:next??construction,contribution:'Scripted contribution.',reason:'Scripted ordered policy.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
  gaps:gap?[{supportRefs:support.slice(0,1),reason:'Scripted gap: stop after Construction.',evidenceRefs:[]}]:[],nextGraphFunctionRef:next,nextReason:'Scripted ordered policy.',nextEvidenceRefs:[],subjectEvidenceRef:subject,revisionReason:'Scripted.',revisionEvidenceRefs:[]};
}else if('summary' in props&&'gaps' in props){
 if(!existsSync('generated/hello-world.mjs')){process.stderr.write('scripted worker expects the worksite cwd\\n');process.exit(1);}
 writeFileSync('generated/hello-world.mjs','console.log("Hello, world!");\\n');role='native';output={summary:'Scripted construction repaired the candidate.',gaps:[]};
 const outside=process.env.ABI5_SCRIPTED_ACTOR_W_OUTSIDE_R;if(outside){mkdirSync(dirname(outside),{recursive:true});writeFileSync(outside,'scripted disposable tooling\\n');extra={wOutsideR:outside};}
}else{role='assess';extra={schemaKeys:Object.keys(props),schema:at>=0};output={kind:props.kind?.const??'consumer_outcome_assessment',disposition:'satisfied',reason:'Scripted assessment.',unresolvedCriteria:[]};}
appendFileSync(log,JSON.stringify({role,pid:process.pid,...extra})+'\\n');
console.log(JSON.stringify({type:'system',subtype:'init'}));
console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));
`;
// Test-only host: the actual installed Public CLI runs the start request; after
// each native fsync the owner decoder reads the durable log, and the first
// durable Testing-wrapper cursor entry stops the process by SIGKILL. No runtime
// byte is patched and no event is authored here.
const INTERRUPTING_HOST=`
import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';import {join} from 'node:path';import {pathToFileURL} from 'node:url';
const input=JSON.parse(fs.readFileSync(process.env.ABI5_PENDING_TESTING_HOST,'utf8')),save=(n,v)=>fs.writeFileSync(join(input.proof,n),JSON.stringify(v,null,2)+'\\n');
const eventOwner=await import(pathToFileURL(join(input.installedRoot,'build/code/src/abg/event_store.js')).href),nativeFsync=fs.fsyncSync;let seen=0;
fs.fsyncSync=function(fd){nativeFsync(fd);let stop=false;
 try{const bytes=fs.readFileSync(input.eventLogPath),fresh=bytes.subarray(seen).toString('utf8');seen=bytes.length;
  if(fresh.includes('traversal_cursor_entered')){const rows=eventOwner.validateHistoricalEvents(bytes,input.profileDigest);
   const entered=rows.filter(r=>r.kind==='traversal_cursor_entered'&&r.payload.graphFunctionRef===input.testingGraphFunctionRef);
   if(entered.length>0){fs.writeFileSync(join(input.proof,'interrupted-prefix.jsonl'),bytes);
    save('interruption.json',{hook:'test-only native fsync -> owner historical decode -> first durable Testing-wrapper cursor entry',processId:process.pid,signal:'SIGKILL',eventCount:rows.length,
     entered:entered.map(e=>({eventId:e.eventId,cursorRef:e.payload.cursorRef})),openedAtInterruption:rows.filter(r=>r.kind==='c_call_opened'&&entered.some(e=>e.payload.cursorRef===r.payload.cursorRef)).length});stop=true;}}}
 catch(error){try{save('observer-failure.json',{message:String(error&&error.stack||error)});}finally{stop=true;}}
 if(stop)process.kill(process.pid,'SIGKILL');};
syncBuiltinESMExports();save('recovery-origin.json',{lastCloseHandoff:input.closeHandoff,ownerPid:process.pid});
const cliPath=join(input.installedRoot,'build/code/src/public/cli.js');process.argv=[process.execPath,cliPath,'--jsonl',input.requestPath];
await import(pathToFileURL(cliPath).href);fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('unexpected-completion.json',{exitCode:process.exitCode??0});
`;
// The current-binding section of each admitted framed-synthesis selector
// assembly, read from its delivered prompt and checked against its manifest.
const selectorBindings=rows=>rows.filter(e=>e.kind==='actor_transport_binding_admitted'&&e.payload?.instructionAssembly?.plan?.variant==='framed-synthesis').map(e=>{
  const a=e.payload.instructionAssembly,section=a.request.prompt.split('\n\n').find(x=>x.startsWith('## binding\n'));assert.ok(section,'the selector prompt presents its current binding');
  const binding=JSON.parse(section.slice('## binding\n'.length));assert.equal(product.sha256Canonical(binding),a.manifest.bindingDigest,'prompt and manifest bind the same facts');return binding;});
test('default-library Run interrupted at the durable entered Testing cursor resumes once in the same Run through the cold Public pending_execution arm',async t=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));let selectedEnvironment;
  // The consumer Program is validated over its Product-resolved declaration
  // closure at Public start; the helper validates the core root publication.
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  // Disposable installation and worksite stay in env.scratch (context-owned); an
  // explicit evidence root, when supplied, keeps compact receipts outside it.
  const proof=join(env.scratch,'pending-testing');await mkdir(proof);
  const evidence=process.env.ABI5_PENDING_TESTING_EVIDENCE_ROOT??null;if(evidence)await mkdir(evidence,{recursive:true});
  const keep=async(n,v)=>{if(evidence)await writeFile(join(evidence,n),JSON.stringify(v,null,2)+'\n');};
  const actor=join(proof,'scripted-actor.mjs'),actorLog=join(proof,'scripted-actor.jsonl');
  await writeFile(actor,'#!'+process.execPath+'\n'+SCRIPTED_ACTOR);await chmod(actor,0o755);await writeFile(join(proof,'host.mjs'),INTERRUPTING_HOST);
  // W outside R: Construction is also granted one disposable root beyond the observed seed files.
  const outsideRoot='native-tools',outsideFile=outsideRoot+'/scratch.txt';selection.applicationWriteRoots=[...selection.applicationWriteRoots,outsideRoot];
  const actorEnvironment={...process.env,ABG_TS_CLAUDE_COMMAND:actor,ABI5_SCRIPTED_ACTOR_LOG:actorLog,ABI5_SCRIPTED_ACTOR_W_OUTSIDE_R:outsideFile};
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  for(const [path,row] of Object.entries(selection.seedFiles))assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+row.sha256);
  const input=await witnessInput({product,selection,seedRoot:worksite});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts'),storeOwner=await load('abg/event_store'),cc=await load('abg/construction_continuation');
  const installed=await load('product/index'),effectful=await load('abg/effectful_invocation_truth'),fh=await load('abg/fh_continuation_projection');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'pending-testing',runEnvironmentResourceFactory:selectedEnvironment.resources});
  // 1. Original Public start, interrupted after the durable Testing entry cursor.
  const requestPath=join(proof,'start-request.jsonl'),eventLogPath=fileURLToPath(handoff.prefix.eventLogRef),testingRef=product.governanceRef('graph-function','testing');
  await writeFile(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:handoff},invocation:start.call})+'\n');
  await writeFile(join(proof,'host-input.json'),JSON.stringify({installedRoot:env.installedRoot,requestPath,eventLogPath,proof,closeHandoff:handoff,
    profileDigest:handoff.prefix.storeIdentity.eventContractDigest,testingGraphFunctionRef:testingRef}));
  const hostStarted=performance.now(),host=spawn(process.execPath,['--experimental-vm-modules',join(proof,'host.mjs')],{cwd:env.scratch,env:{...actorEnvironment,ABI5_PENDING_TESTING_HOST:join(proof,'host-input.json')}});
  let hostOut='',hostErr='';host.stdout.on('data',b=>hostOut+=b);host.stderr.on('data',b=>hostErr+=b);
  const exit=await new Promise((resolve,reject)=>{host.once('error',reject);host.once('exit',(code,signal)=>resolve({code,signal}));});
  const observerFailure=await readFile(join(proof,'observer-failure.json'),'utf8').catch(error=>error.code==='ENOENT'?null:Promise.reject(error));
  if(exit.signal!=='SIGKILL'){const rows=storeOwner.validateHistoricalEvents(await readFile(eventLogPath)).slice(before);
    await keep('unexpected-host-completion.json',{exit,hostOut,hostErr,events:rows.map(e=>({kind:e.kind,graphFunctionRef:e.graphFunctionRef,resultClass:e.payload?.resultClass,valueKind:e.payload?.value?.kind,
      choice:e.payload?.value?.graphFunctionRef,cursor:e.payload?.graphFunctionRef,diagnosticRef:e.payload?.diagnosticRef??e.payload?.value?.diagnosticRef,
      actor:e.kind.startsWith('actor_')&&e.kind!=='actor_transport_binding_admitted'?e.payload:undefined})),
      actorLog:await readFile(actorLog,'utf8').catch(()=>null)});}
  assert.equal(observerFailure,null,observerFailure??'');assert.equal(exit.signal,'SIGKILL',JSON.stringify({exit,hostOut:hostOut.slice(-4000),hostErr:hostErr.slice(-4000)}));
  const interruption=JSON.parse(await readFile(join(proof,'interruption.json'),'utf8'));
  assert.equal(interruption.entered.length,1);assert.equal(interruption.openedAtInterruption,0,'interruption precedes prepare-testing call opening');
  // 2. Exclusive acquisition of the interrupted nonterminal store.
  const bytes=await readFile(eventLogPath);assert.deepEqual(bytes,await readFile(join(proof,'interrupted-prefix.jsonl')));
  const origin=JSON.parse(await readFile(join(proof,'recovery-origin.json'),'utf8')),physical=handoff.reopenAuthority;
  const lockPath=join(tmpdir(),'abiogenesis-event-store-locks-v5',`${physical.device}-${physical.inode}.lock`),lock=await stat(lockPath),lockBytes=await readFile(lockPath);
  const recovered=storeOwner.recoverInterruptedEventStore({...origin,expectedCurrent:{byteLength:bytes.length,digest:product.sha256Bytes(bytes)},
    abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:product.sha256Bytes(lockBytes)}});
  assert.equal(recovered.kind,'recovered',JSON.stringify(recovered));handoff=recovered.closeHandoff;
  const interrupted=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),prefix=env.abg.selectValidatedRuntimeEventPrefix(interrupted),run0=interrupted.slice(before);
  const runIds=[...new Set(run0.filter(e=>e.kind==='run_segment_opened').map(e=>e.runId))];assert.equal(runIds.length,1);const [runId]=runIds,runAt=rows=>rows.filter(e=>e.runId===runId);
  assert.equal(runAt(run0).some(e=>['run_closed','runtime_failure_observed','run_stopped'].includes(e.kind)),false,'interruption admits no terminal or failure truth');
  const results=rows=>rows.filter(e=>e.kind==='c_call_result_admitted'),nativeRef=product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef;
  const choiceRefs=rows=>results(rows).filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>e.payload.value.graphFunctionRef);
  const constructionResults=results(run0).filter(e=>e.graphFunctionRef===nativeRef);
  assert.equal(constructionResults.length,1,'completed native Construction');assert.equal(constructionResults[0].payload.resultClass,'success');
  assert.deepEqual(choiceRefs(run0),[product.governanceRef('graph-function','construction'),testingRef],'admitted Construction then Testing selection');
  const testingChoice=results(run0).filter(e=>e.payload.value?.kind==='registered_graph_choice').at(-1);
  assert.equal(testingChoice.payload.value.input.value.synthesis.judgment.subjectEvidenceRef,constructionResults[0].payload.resultRef,'Testing subjectEvidence is the actual native-work Result');
  // W outside R through the installed protected-root preflight: actor, physical effect, unobserved Result and shared currentness.
  const nativeValue=constructionResults[0].payload.value,nativeRows=(await readFile(actorLog,'utf8')).trim().split('\n').map(l=>JSON.parse(l)).filter(r=>r.role==='native');
  assert.deepEqual(nativeRows.map(r=>r.wOutsideR),[outsideFile],'the one scripted native actor wrote in W\\R');
  assert.equal(await readFile(join(worksite,outsideFile),'utf8'),'scripted disposable tooling\n','the W\\R effect is physical');
  assert.ok(nativeValue.task.writeRoots.includes(outsideRoot),'the admitted task grants the root');
  assert.equal(nativeValue.task.context.readRoots.some(r=>r==='.'||outsideFile===r||outsideFile.startsWith(r+'/')),false,'the root lies outside observed R');
  assert.deepEqual(nativeValue.changedPaths,['generated/hello-world.mjs'],'W\\R writes are unobserved, never changedPaths');
  assert.equal(nativeValue.after.entries.some(e=>e.relativePath.startsWith(outsideRoot+'/')),false);
  const effectOwner=await load('abg/native_work_effect'),currentness=await load('abg/native_worksite_execution');
  const impact=effectOwner.nativeWorkImpact(nativeValue.task,nativeValue.changedPaths),unchangedR='source/witness-contract.md';
  assert.deepEqual([outsideFile,outsideRoot,'generated/hello-world.mjs',unchangedR].map(path=>effectOwner.nativeWorkImpactOverlaps(impact,path)),[true,true,true,false]);
  assert.deepEqual([[outsideFile],['generated/hello-world.mjs'],[unchangedR]].map(paths=>currentness.worksiteCommandSourcesInvalidatedAfter(prefix,constructionResults[0].admissionOrdinal-1,
    nativeValue.task.workspaceAuthorityBasis.canonicalRoot,paths)),[true,true,false],'currentness retires W\\R and the changed candidate, never unchanged R');
  // 3. Cold pending-execution projection over the interrupted Run.
  const [p,...extra]=cc.projectPendingExecutionContinuations(prefix,runId);
  assert.equal(extra.length,0);assert.ok(p,'one pending execution');assert.deepEqual(p.chain.map(c=>c.relation),['root','recursion','workflow']);
  assert.equal(p.phase,'undispatched');assert.equal(p.status,'open');assert.equal(p.pendingCCallRef,null);
  assert.equal(p.pendingCursorRef,interruption.entered[0].cursorRef,'the entered Testing cursor is the pending position');
  const testingBasis=run0.find(e=>e.kind==='basis_admitted'&&e.payload.basisRef===p.chain[2].basisRef);assert.equal(testingBasis?.graphFunctionRef,testingRef);
  assert.notEqual(p.progressedInputRef,start.call.invocation?.input?.valueRef??null);
  const rootBasis=run0.find(e=>e.kind==='basis_admitted'&&e.payload.basisRef===p.chain[0].basisRef);assert.notEqual(p.progressedInputRef,rootBasis.payload.rawInputAdmissionRef,'progressed input is not graph-entry input');
  const zero='sha256:'+'0'.repeat(64);
  const request=await pendingExecutionUseRequest({environment:env,prefix,runId,pending:p});
  // 4. Cold Public run.continue current_intent pending_execution arm, through the shared support assembly.
  const pending=await constructInstalledPendingCall({environment:env,publicApi,continuation:cc,prefix,request,expectedAuthority:start.workAuthority,
    runEnvironmentResources:start.call.resources.runEnvironmentResources,eventResource:resource,
    identityScope:'pending-testing',eventTime:'2026-11-02T00:01:00.000Z',provenanceRef:'provenance://default-library-witness/pending-testing@5'});
  assert.equal(pending.use.source.continuationRef,p.continuationRef);
  const cli=async(identity,call)=>{
    const execution=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:actorEnvironment});
    const receipt=execution.output?.receipt;assert.ok(receipt,JSON.stringify(execution).slice(0,4000));assert.equal(receipt.failure,null,JSON.stringify(receipt).slice(0,4000));
    if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;return {receipt,wallMs:execution.wallMs};
  };
  const read=()=>storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const crossed=(await cli('crossed',pending.replay('crossed',{pendingCursor:{ref:p.pendingCursorRef,digest:zero}}))).receipt;
  assert.equal(crossed.ownerOutput.outcomeKind,'refusal');assert.equal(crossed.ownerOutput.value.code,'response_mismatch');assert.deepEqual(crossed.ownerOutput.value.issuePaths,['/pendingCursor']);
  assert.equal(read().length,interrupted.length,'a crossed request admits nothing');
  // The pending execution is Run-scoped: a Run that does not hold it, or its Run under another digest, is refused.
  for(const [name,run,code,path] of [['wrong-run',{ref:`${runId}/absent`,digest:zero},'missing_continuation','/continuation'],['wrong-run-digest',{ref:runId,digest:zero},'basis_mismatch','/run']]){
    const out=(await cli(name,pending.replay(name,{run}))).receipt;
    assert.equal(out.ownerOutput.outcomeKind,'refusal',name);assert.equal(out.ownerOutput.value.code,code,name);assert.deepEqual(out.ownerOutput.value.issuePaths,[path],name);
    assert.equal(read().length,interrupted.length,`${name} admits nothing`);
  }
  // Populated at the pre-continue handoff, executed after the use: the superseded prefix is refused at acquisition.
  const staleHandoff=handoff,staleCall=await pending.call('stale-prefix');
  const resumedAt=performance.now(),continued=await cli('continue',await pending.call('continue'));
  assert.equal(continued.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(continued.receipt.ownerOutput).slice(0,4000));
  const value=continued.receipt.ownerOutput.value;assert.equal(value.continuationKind,'pending_execution');assert.equal(value.admittedIntent,null);
  if(value.disposition!=='completed')await keep('resumed-trace.json',read().slice(interrupted.length).map(e=>({kind:e.kind,graphFunctionRef:e.graphFunctionRef,resultClass:e.payload?.resultClass,valueKind:e.payload?.value?.kind,
    cursor:e.payload?.cursorRef,locus:e.payload?.programLocusRef,diagnosticRef:e.payload?.diagnosticRef??e.payload?.value?.diagnosticRef,actorFailure:e.kind==='actor_invocation_failed'?e.payload.failureClass:undefined})));
  assert.equal(value.disposition,'completed',JSON.stringify(value).slice(0,4000));assert.equal(value.run.ref,runId,'same Run');
  const afterContinue=read().length,second=(await cli('second-use',pending.replay('second-use'))).receipt;
  assert.equal(second.ownerOutput.outcomeKind,'refusal');assert.equal(second.ownerOutput.value.code,'resolved_continuation');assert.deepEqual(second.ownerOutput.value.issuePaths,['/continuation'],'one use');
  assert.equal(read().length,afterContinue,'second use admits nothing');
  const staleExecution=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:'stale-prefix',acquisition:{kind:'reopen',closeHandoff:staleHandoff},call:staleCall,expectedExitCode:null,environment:actorEnvironment});
  const staleFault=staleExecution.output.receipt?.failure?.fault;
  assert.deepEqual([staleFault?.stage,staleFault?.code],['resource_acquisition','acquisition_refused'],JSON.stringify(staleExecution.output).slice(0,4000));
  assert.equal(read().length,afterContinue,'a stale prefix admits nothing');
  // 5. Conservation over the completed same Run.
  const all=read(),final=runAt(all.slice(before)),finalPrefix=env.abg.selectValidatedRuntimeEventPrefix(all);
  const interruptedCalls=new Set(runAt(run0).filter(e=>e.kind==='c_call_opened').map(e=>e.payload.cursorRef));
  assert.equal(final.filter(e=>e.kind==='c_call_opened'&&interruptedCalls.has(e.payload.cursorRef)).length,interruptedCalls.size,'no completed position reopened');
  const resumed=final.filter(e=>e.kind==='c_call_opened'&&!interruptedCalls.has(e.payload.cursorRef));
  assert.equal(resumed[0].payload.cursorRef,p.pendingCursorRef,'the first resumed call is prepare-testing at the pending cursor');
  assert.equal(final.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===nativeRef).length,1,'Construction is not repeated');
  assert.deepEqual(choiceRefs(final),[product.governanceRef('graph-function','construction'),testingRef,product.governanceRef('graph-function','uat')],'the Testing selector is not repeated');
  assert.deepEqual(results(final).find(e=>e.payload.resultRef===constructionResults[0].payload.resultRef),constructionResults[0],'producer Result unchanged');
  assert.deepEqual(final.find(e=>e.eventId===testingChoice.eventId),testingChoice,'selection judgment unchanged');
  const prepared=results(final).find(e=>e.aggregateId===resumed[0].aggregateId);assert.equal(prepared?.payload.resultClass,'success',JSON.stringify(prepared?.payload).slice(0,4000));
  const commands=results(final).filter(e=>e.payload.value?.kind==='worksite_command_execution_observation'&&e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
  assert.equal(commands.length,1,'one native C2 measurement');assert.ok(commands[0].payload.value.commandResults.every(c=>c.exitStatus===0),'repaired candidate passes C2');
  assert.deepEqual(prepared.payload.value.sourceNativeWork,constructionResults[0].payload.value,'Testing task retains its exact native-work producer lineage');
  const assessment=results(final).find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef);assert.equal(assessment?.payload.value.assessment.disposition,'satisfied');
  const parent=results(final).filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive'));assert.equal(parent.at(-1).payload.value.terminal,true);
  assert.equal(final.filter(e=>e.kind==='run_closed').length,1);assert.equal(final.some(e=>e.kind==='runtime_failure_observed'),false);
  assert.equal(new Set(final.map(e=>e.runId)).size,1,'one Run identity');
  // Each selector, before and after the resumption, presents this Run, its root admission and the declared bound; no predecessor.
  const bindings=selectorBindings(final),stepRef=witnessRef('graph-function','executive-step');assert.equal(bindings.length,3,'three selector assemblies');
  for(const b of bindings){assert.deepEqual([b.runId,b.predecessor,b.invocation.invocationAdmissionRef,b.root.basisRef,b.root.graphFunctionRef],
    [runId,null,rootBasis.payload.invocationAdmissionRef,p.chain[0].basisRef,witnessRef('graph-function','executive')]);
    assert.deepEqual([b.executing.graphFunctionRef,b.declaredRecursion?.graphFunctionRef,b.declaredRecursion?.bound],[stepRef,stepRef,8]);assert.equal(b.start?.rootMode,'direct');}
  assert.deepEqual(cc.projectPendingExecutionContinuations(finalPrefix,runId),[],'no pending execution remains');
  const operations=all.filter(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='pending_execution');assert.equal(operations.length,1,'one consumed use');
  assert.ok(cc.projectPendingExecutionOperation(finalPrefix,operations[0]),'cold operation correspondence');
  assert.deepEqual(fh.projectFhEffectfulPublicInvocationFacts(finalPrefix),{disposition:'valid',facts:[]},'pending_execution is not an F_H arm');
  assert.equal(effectful.projectEffectfulPublicInvocationTruthAtPrefix(finalPrefix,operations[0].payload.invocationRef).disposition,'duplicate','combined Public invocation truth');
  const actorRoles=(await readFile(actorLog,'utf8')).trim().split('\n').map(l=>JSON.parse(l).role);
  assert.deepEqual(actorRoles.map(r=>r.split(':')[0]),['select','native','select','c2','select','assess'],'no repeated native actor across the interruption');
  const reads={};
  for(const memberKey of ['run_result','run_replay']){
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:continued.receipt.resources.run,eventResource:resource(),identity:`pending-testing-${memberKey}`});
    const out=(await cli(`pending-testing-${memberKey}`,call)).receipt;assert.equal(out.ownerOutput.outcomeKind,'result');reads[memberKey]=out.ownerOutput.value;
  }
  const terminal=reads.run_result.projection.terminalResult,closing=parent.at(-1).payload;
  assert.deepEqual([terminal?.producer.runRef,terminal?.producer.graphCallRef,terminal?.result],[value.run.ref,value.graphCall.ref,{ref:closing.resultRef,digest:closing.resultDigest}],'cold run_result agrees with the continued Run and its admitted terminal Result');
  assert.deepEqual(reads.run_replay.projection.replay,value.replay,`cold replay agrees: ${JSON.stringify(reads.run_replay.projection.replay)?.slice(0,600)}`);
  const summary={runId,continuationRef:p.continuationRef,chain:p.chain.map(c=>c.relation),pendingCursorRef:p.pendingCursorRef,progressedInputRef:p.progressedInputRef,wOutsideR:{root:outsideRoot,file:outsideFile,changedPaths:nativeValue.changedPaths},
    constructionResultRef:constructionResults[0].payload.resultRef,choices:choiceRefs(final),actorRoles,interruption,eventsInterrupted:interrupted.length,eventsFinal:all.length,
    interruptedPrefixSha256:product.sha256Bytes(bytes),finalLogSha256:product.sha256Bytes(await readFile(eventLogPath)),resumeWallMs:performance.now()-resumedAt,hostWallMs:resumedAt-hostStarted,
    proofLimit:'Actual installed default-library topology, Public start and run.continue CLI, ABG/HoG/C2/worksite owners and SIGKILL interruption; the model is a scripted stand-in process. Same-Run only: no predecessor-Run R2 recovery, no live provider, no Root installed witness.'};
  await keep('summary.json',summary);t.diagnostic(JSON.stringify(summary));
});
// Retained-source integration over actual installed owners. A is an ordinary
// Public start that completes Construction and stops on a scripted selector
// gap; B is a separately authorized Public start over A's eligible retained
// state. B is killed at its durable Testing entry and continued cold through
// the unchanged pending_execution arm. B's post-Testing selector reads the
// declared source bodies A holds only as A's selected native Result's task
// context declares them. The model is the scripted stand-in above.
test('retained-source B continued cold after its Testing entry reads A-held declared source bodies only through its admitted source use',async t=>{
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));let selectedEnvironment;
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  const proof=join(env.scratch,'retained-source'),prompts=join(proof,'prompts');await mkdir(prompts,{recursive:true});
  const evidence=process.env.ABI5_RETAINED_SOURCE_EVIDENCE_ROOT??null;if(evidence)await mkdir(evidence,{recursive:true});
  const keep=async(n,v)=>{if(evidence)await writeFile(join(evidence,n),JSON.stringify(v,null,2)+'\n');};
  const actor=join(proof,'scripted-actor.mjs'),logA=join(proof,'actor-a.jsonl'),logB=join(proof,'actor-b.jsonl');
  await writeFile(actor,'#!'+process.execPath+'\n'+SCRIPTED_ACTOR);await chmod(actor,0o755);await writeFile(join(proof,'host.mjs'),INTERRUPTING_HOST);
  const {ABI5_SCRIPTED_ACTOR_PHASE:_phase,...inherited}=process.env;
  const actorEnvironment=(log,phase)=>({...inherited,ABG_TS_CLAUDE_COMMAND:actor,ABI5_SCRIPTED_ACTOR_LOG:log,ABI5_SCRIPTED_ACTOR_PROMPTS:prompts,...(phase===undefined?{}:{ABI5_SCRIPTED_ACTOR_PHASE:phase})});
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  for(const [path,row] of Object.entries(selection.seedFiles))assert.equal(await product.sha256File(join(worksite,path)),'sha256:'+row.sha256);
  const input=await witnessInput({product,selection,seedRoot:worksite});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts'),storeOwner=await load('abg/event_store'),cc=await load('abg/construction_continuation');
  const installed=await load('product/index'),effectful=await load('abg/effectful_invocation_truth'),fh=await load('abg/fh_continuation_projection');
  const bodies=await load('abg/event_prefix'),truth=await load('abg/invocation_execution_truth'),admissions=await load('abg/invocation_admission');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const cli=async(identity,call,environment)=>{
    const execution=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment});
    const receipt=execution.output?.receipt;assert.ok(receipt,JSON.stringify(execution).slice(0,4000));assert.equal(receipt.failure,null,JSON.stringify(receipt).slice(0,4000));
    if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;return {receipt,wallMs:execution.wallMs};
  };
  const read=()=>storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),results=rows=>rows.filter(e=>e.kind==='c_call_result_admitted');
  const nativeRef=product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,testingRef=product.governanceRef('graph-function','testing'),constructionRef=product.governanceRef('graph-function','construction');
  const choiceRefs=rows=>results(rows).filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>e.payload.value.graphFunctionRef??null);
  const runOf=rows=>{const ids=[...new Set(rows.filter(e=>e.kind==='run_segment_opened').map(e=>e.runId))];assert.equal(ids.length,1,JSON.stringify(ids));return ids[0];};
  const trace=rows=>rows.map(e=>({kind:e.kind,runId:e.runId,graphFunctionRef:e.graphFunctionRef,resultClass:e.payload?.resultClass,valueKind:e.payload?.value?.kind,
    choice:e.payload?.value?.graphFunctionRef,disposition:e.payload?.disposition??e.payload?.value?.disposition,diagnosticRef:e.payload?.diagnosticRef??e.payload?.value?.diagnosticRef}));
  const roles=async log=>(await readFile(log,'utf8')).trim().split('\n').map(l=>JSON.parse(l));
  // 1. A: an ordinary Public start; Construction completes and the selector then reports a gap.
  const startA=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'retained-a',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const a=await cli('retained-a',startA.call,actorEnvironment(logA,'gap-after-construction'));
  const rowsA=read().slice(before),A=runOf(rowsA),prefixA=env.abg.selectValidatedRuntimeEventPrefix(read());await keep('a-trace.json',{ownerOutput:a.receipt.ownerOutput,trace:trace(rowsA)});
  const [N,...moreNative]=results(rowsA).filter(e=>e.graphFunctionRef===nativeRef);
  assert.equal(moreNative.length,0);assert.equal(N?.payload.resultClass,'success');assert.equal(N.payload.value.kind,'native_workspace_work_observation');
  assert.deepEqual(choiceRefs(rowsA).filter(Boolean),[constructionRef],'A selects Construction only');
  assert.equal(rowsA.some(e=>e.kind==='traversal_cursor_entered'&&e.payload.graphFunctionRef===testingRef),false,'A never enters Testing');
  assert.deepEqual((await roles(logA)).map(r=>r.role.split(':')[0]),['select','native','select']);
  // A's eligible retained state: the latest admitted governance state, derived by the source owner.
  const rootA=rowsA.find(e=>e.kind==='basis_admitted'&&e.payload.basisClass==='root'),admissionA=admissions.rehydrateInvocationAdmissionAtPrefix(prefixA,rootA.payload.invocationAdmissionRef);
  const stateA=results(rowsA).filter(e=>e.runId===A&&e.payload.resultClass==='success'&&e.payload.value?.kind==='governance_work_state').at(-1);
  const S=admissions.deriveInvocationSourceResultBasisAtPrefix(prefixA,{publicAuthorityDigest:startA.call.invocation.invocationDigest,runtimeInvocationRef:admissionA.invocationRef,
    invocationAdmissionRef:admissionA.invocationAdmissionRef,runId:A,resultRef:stateA.payload.resultRef});
  assert.ok(S,JSON.stringify({ownerOutput:a.receipt.ownerOutput,trace:trace(rowsA).slice(-24)}).slice(0,6000));
  const row=S.sourceResultValue.observations.find(o=>o.resultRef===N.payload.resultRef);
  assert.deepEqual(row&&[row.purpose,row.resultDigest,row.cCallRef],['construction',N.payload.resultDigest,N.aggregateId],'the retained state names A\'s native Result');
  const inputB=installed.retainedGovernanceWorkInput(S.sourceResultValue);assert.ok(inputB);
  // 2. B: a separately authorized Public start over A's retained state, killed at its durable Testing entry.
  // The shared start support assembles B: same Program, A's admitted source result, B's own resource and identity.
  const A0=startA.call.invocation;
  // A start whose historical source Result the log does not hold is refused at source observation and admits nothing.
  const missingSource=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input:inputB,identity:'retained-b-missing-source',
    sourceResult:{basis:{...S,sourceResultRef:`${S.sourceResultRef}/absent`},projectionAuthority:{ref:A0.invocationRef,digest:S.publicAuthorityDigest}}});
  const beforeMissing=read().length,missing=(await cli('retained-b-missing-source',missingSource.call,actorEnvironment(logB))).receipt;
  assert.equal(missing.ownerOutput.outcomeKind,'refusal',JSON.stringify(missing.ownerOutput).slice(0,4000));assert.equal(missing.ownerOutput.value.code,'invalid_input');
  assert.equal(read().length,beforeMissing,'a missing historical source admits nothing');
  const startB=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input:inputB,identity:'retained-b',runEnvironmentResourceFactory:selectedEnvironment.resources,
    sourceResult:{basis:S,projectionAuthority:{ref:A0.invocationRef,digest:S.publicAuthorityDigest}}});
  const B0=startB.call.invocation;
  assert.deepEqual([B0.request.program,B0.request.target,B0.request.input.contract,B0.request.input.value],[A0.request.program,A0.request.target,A0.request.input.contract,inputB],'B keeps A\'s Program and start over the retained input');
  assert.deepEqual(B0.request.sourceBasis,{kind:'admitted_source_result',projectionAuthority:{ref:A0.invocationRef,digest:S.publicAuthorityDigest},sourceResult:{ref:S.sourceResultRef,digest:S.sourceResultDigest}});
  assert.deepEqual(startB.call.resources.source,{kind:'admitted_source_result',basis:S});
  const requestPath=join(proof,'start-request.jsonl'),eventLogPath=fileURLToPath(handoff.prefix.eventLogRef);
  await writeFile(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:handoff},invocation:startB.call})+'\n');
  await writeFile(join(proof,'host-input.json'),JSON.stringify({installedRoot:env.installedRoot,requestPath,eventLogPath,proof,closeHandoff:handoff,
    profileDigest:handoff.prefix.storeIdentity.eventContractDigest,testingGraphFunctionRef:testingRef}));
  const hostStarted=performance.now(),host=spawn(process.execPath,['--experimental-vm-modules',join(proof,'host.mjs')],{cwd:env.scratch,env:{...actorEnvironment(logB),ABI5_PENDING_TESTING_HOST:join(proof,'host-input.json')}});
  let hostOut='',hostErr='';host.stdout.on('data',b=>hostOut+=b);host.stderr.on('data',b=>hostErr+=b);
  const exit=await new Promise((resolve,reject)=>{host.once('error',reject);host.once('exit',(code,signal)=>resolve({code,signal}));});
  const observerFailure=await readFile(join(proof,'observer-failure.json'),'utf8').catch(error=>error.code==='ENOENT'?null:Promise.reject(error));
  if(exit.signal!=='SIGKILL')await keep('unexpected-host-completion.json',{exit,hostOut,hostErr,trace:trace(storeOwner.validateHistoricalEvents(await readFile(eventLogPath)).slice(before+rowsA.length))});
  assert.equal(observerFailure,null,observerFailure??'');assert.equal(exit.signal,'SIGKILL',JSON.stringify({exit,hostOut:hostOut.slice(-4000),hostErr:hostErr.slice(-4000)}));
  const interruption=JSON.parse(await readFile(join(proof,'interruption.json'),'utf8'));
  assert.equal(interruption.entered.length,1);assert.equal(interruption.openedAtInterruption,0,'interruption precedes prepare-testing call opening');
  const bytes=await readFile(eventLogPath);assert.deepEqual(bytes,await readFile(join(proof,'interrupted-prefix.jsonl')));
  const origin=JSON.parse(await readFile(join(proof,'recovery-origin.json'),'utf8')),physical=handoff.reopenAuthority;
  const lockPath=join(tmpdir(),'abiogenesis-event-store-locks-v5',`${physical.device}-${physical.inode}.lock`),lock=await stat(lockPath),lockBytes=await readFile(lockPath);
  const recovered=storeOwner.recoverInterruptedEventStore({...origin,expectedCurrent:{byteLength:bytes.length,digest:product.sha256Bytes(bytes)},
    abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:product.sha256Bytes(lockBytes)}});
  assert.equal(recovered.kind,'recovered',JSON.stringify(recovered));handoff=recovered.closeHandoff;
  const interrupted=read(),prefix=env.abg.selectValidatedRuntimeEventPrefix(interrupted),rowsB=interrupted.slice(before+rowsA.length),B=runOf(rowsB);
  assert.notEqual(B,A);assert.equal(rowsB.some(e=>e.runId===A),false,'B admits nothing in A');
  assert.deepEqual(choiceRefs(rowsB),[testingRef],'B selects Testing over A\'s retained work');
  const testingChoice=results(rowsB).find(e=>e.payload.value?.kind==='registered_graph_choice');
  assert.equal(testingChoice.payload.value.input.value.synthesis.judgment.subjectEvidenceRef,N.payload.resultRef,'B\'s Testing subject is A\'s native Result');
  const rootB=rowsB.find(e=>e.kind==='basis_admitted'&&e.payload.basisClass==='root');
  // 3. Cold pending execution over B, with an earlier uncertain-effect cut refused.
  const [p,...extra]=cc.projectPendingExecutionContinuations(prefix,B);
  assert.equal(extra.length,0);assert.ok(p,'one pending execution');assert.equal(p.phase,'undispatched');assert.equal(p.pendingCursorRef,interruption.entered[0].cursorRef);
  assert.equal(p.chain[0].basisRef,rootB.payload.basisRef);
  const requestFor=o=>pendingExecutionUseRequest({environment:env,prefix,runId:B,pending:o});
  const lastSelected=rowsB.filter(e=>e.kind==='c_call_fibre_selected').at(-1),lines=bytes.toString('utf8').split('\n'),cut=lines.findIndex(l=>l.includes('"eventId":"'+lastSelected.eventId+'"'));
  const early=env.abg.selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(Buffer.from(lines.slice(0,cut+1).join('\n')+'\n')));
  const [unknown]=cc.projectPendingExecutionContinuations(early,B);assert.equal(unknown?.phase,'effect_unknown','a dispatched call without its Result has an unknown effect');
  assert.deepEqual(cc.selectPendingExecutionUse(early,await requestFor(unknown)),{kind:'refused',code:'replay_mismatch',path:'/continuation/effect'});
  // 4. Cold Public run.continue current_intent pending_execution arm through the shared support assembly; source none:
  // B's admission already carries the use. B's root admission names A's start authority (same root, separately admitted).
  const pending=await constructInstalledPendingCall({environment:env,publicApi,continuation:cc,prefix,request:await requestFor(p),expectedAuthority:startA.workAuthority,
    runEnvironmentResources:startA.call.resources.runEnvironmentResources,eventResource:resource,
    identityScope:'retained-source',eventTime:'2026-11-02T00:03:00.000Z',provenanceRef:'provenance://default-library-witness/retained-source@5'});
  assert.equal(pending.use.invocation.invocationAdmissionRef,rootB.payload.invocationAdmissionRef,'the use resumes B\'s own admission');
  const resumedAt=performance.now(),continued=await cli('continue',await pending.call('continue'),actorEnvironment(logB));
  assert.equal(continued.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(continued.receipt.ownerOutput).slice(0,4000));
  const value=continued.receipt.ownerOutput.value;assert.equal(value.continuationKind,'pending_execution');assert.equal(value.admittedIntent,null);
  if(value.disposition!=='completed')await keep('resumed-trace.json',trace(read().slice(interrupted.length)));
  assert.equal(value.disposition,'completed',JSON.stringify(value).slice(0,4000));assert.equal(value.run.ref,B,'same B Run');
  const afterContinue=read().length,second=(await cli('second-use',pending.replay('second-use'),actorEnvironment(logB))).receipt;
  assert.equal(second.ownerOutput.outcomeKind,'refusal');assert.equal(second.ownerOutput.value.code,'resolved_continuation');assert.equal(read().length,afterContinue,'second use admits nothing');
  // 5. Conservation: no reacquisition or reinvocation of A, no replacement Run, B's Testing and selector are not repeated.
  const all=read(),finalPrefix=env.abg.selectValidatedRuntimeEventPrefix(all),finalB=all.slice(before+rowsA.length).filter(e=>e.runId===B);
  assert.equal(all.filter(e=>e.runId===A).length,rowsA.filter(e=>e.runId===A).length,'A admits nothing after it stopped');
  assert.deepEqual([...new Set(all.slice(before+rowsA.length).filter(e=>e.kind==='run_segment_opened').map(e=>e.runId))],[B],'no replacement Run');
  assert.equal(finalB.some(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===nativeRef),false,'B performs no Construction');
  assert.deepEqual(choiceRefs(finalB),[testingRef,product.governanceRef('graph-function','uat')],'the Testing selector is not repeated');
  assert.equal(finalB.filter(e=>e.kind==='run_closed').length,1);assert.equal(finalB.some(e=>e.kind==='runtime_failure_observed'),false);
  assert.deepEqual(cc.projectPendingExecutionContinuations(finalPrefix,B),[],'no pending execution remains');
  const operations=all.filter(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='pending_execution');assert.equal(operations.length,1,'one consumed use');
  assert.ok(cc.projectPendingExecutionOperation(finalPrefix,operations[0]));
  assert.deepEqual(fh.projectFhEffectfulPublicInvocationFacts(finalPrefix),{disposition:'valid',facts:[]},'pending_execution is not an F_H arm');
  assert.equal(effectful.projectEffectfulPublicInvocationTruthAtPrefix(finalPrefix,operations[0].payload.invocationRef).disposition,'duplicate');
  const commands=results(finalB).filter(e=>e.payload.value?.kind==='worksite_command_execution_observation'&&e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
  assert.equal(commands.length,1,'one native C2 measurement');assert.ok(commands[0].payload.value.commandResults.every(c=>c.exitStatus===0));
  const prepared=results(finalB).find(e=>e.payload.value?.kind!==undefined&&Object.hasOwn(e.payload.value,'sourceNativeWork'));
  assert.deepEqual(prepared?.payload.value.sourceNativeWork,N.payload.value,'B\'s Testing task retains A\'s exact native producer');
  assert.deepEqual((await roles(logB)).map(r=>r.role.split(':')[0]),['select','c2','select','assess'],'B never reinvokes native work');
  // 6. Lineage: B admission -> A's retained state -> A's native Result -> its task context -> A holder.
  const admissionB=truth.projectExactInvocationAdmissionAtPrefix(finalPrefix,rootB.payload.invocationAdmissionRef);
  assert.deepEqual(admissionB.sourceResultBasis,S,'B\'s immutable admission carries A\'s retained state');
  // B's selectors present B's Run, root and admission; A appears only as the separate retained predecessor.
  const bindingsA=selectorBindings(rowsA.filter(e=>e.runId===A)),bindingsB=selectorBindings(finalB);
  assert.equal(bindingsA.length,2);assert.equal(bindingsB.length,2);
  for(const b of bindingsA)assert.deepEqual([b.runId,b.predecessor,b.invocation.invocationAdmissionRef],[A,null,admissionA.invocationAdmissionRef]);
  for(const b of bindingsB){assert.deepEqual([b.runId,b.root.basisRef,b.invocation.invocationAdmissionRef,b.declaredRecursion?.bound],[B,rootB.payload.basisRef,rootB.payload.invocationAdmissionRef,8]);
    assert.notEqual(b.invocation.invocationAdmissionRef,admissionA.invocationAdmissionRef,'the current admission is not A\'s');
    assert.deepEqual(b.predecessor,{sourceRunId:S.sourceRunId,sourceInvocationAdmissionRef:S.sourceInvocationAdmissionRef,sourceInvocationRef:S.sourceInvocationRef,
      sourceGraphFunctionRef:S.sourceGraphFunctionRef,sourceResultRef:S.sourceResultRef,sourceResultDigest:S.sourceResultDigest});assert.equal(b.predecessor.sourceRunId,A);}
  const useB=truth.governanceContextBodyUse(admissionB,B);
  assert.ok(useB.sourceResults.some(x=>x.resultRef===N.payload.resultRef&&x.resultDigest===N.payload.resultDigest&&x.cCallRef===N.aggregateId));
  const postTesting=results(finalB).filter(e=>e.payload.value?.kind==='framed_synthesis_task'&&e.admissionOrdinal>commands[0].admissionOrdinal);
  assert.equal(postTesting.length,1,'one post-Testing selector preparation');
  const ctx=postTesting[0].payload.value.context,taskContext=N.payload.value.task.context,declared=inputB.original.sources.map(x=>x.path);
  const declaredBy=e=>{const i=taskContext.entries.findIndex(x=>x.state==='file'&&x.relativePath===e.relativePath&&x.digest===e.digest&&x.byteLength===e.byteLength);
    return i<0?null:taskContext.entries[i].encoding==='base64'?{resultRef:N.payload.resultRef,resultDigest:N.payload.resultDigest,path:['task','context','entries',i]}:taskContext.entries[i].member;};
  const holderOf=e=>all.find(x=>x.kind==='c_call_result_admitted'&&x.payload.resultRef===e.member.resultRef);
  const heldInA=ctx.entries.filter(e=>e.state==='file'&&e.encoding==='admitted_member'&&holderOf(e)?.runId===A);
  for(const e of heldInA)assert.deepEqual(e.member,declaredBy(e),`${e.relativePath}: an A holder is carried only as A's native task context declares it`);
  const lineage=[];
  for(const path of declared){
    const e=ctx.entries.find(x=>x.relativePath===path);assert.equal(e?.encoding,'admitted_member',path);assert.equal(holderOf(e).runId,A,`${path} is held in A`);
    const body=bodies.resolveWorksiteContextBodyAtPrefix(finalPrefix,ctx,path,useB);assert.equal(body.kind,'worksite_context_body',JSON.stringify(body));
    assert.deepEqual(body.bytes,await readFile(join(witnessRoot,'seed',path)),`${path}: the authenticated A body is the seed byte stream`);assert.equal(body.holder.eventRef,holderOf(e).eventId);
    lineage.push({path,digest:e.digest,holderEvent:body.holder.eventRef,holderResult:body.holder.resultRef,holderRun:A,memberPath:e.member.path});
  }
  // The selector received exactly the admitted prompt, and it presents those bodies.
  const selectsB=(await roles(logB)).filter(x=>x.role.startsWith('select:'));assert.equal(selectsB.length,2);
  const prompt=await readFile(selectsB[1].promptFile,'utf8'),started=finalB.filter(e=>e.kind==='actor_invocation_started'&&e.payload.promptDigest===product.sha256Canonical(prompt));
  assert.equal(started.length,1,'the delivered post-Testing selector prompt is the admitted assembly');assert.ok(started[0].admissionOrdinal>postTesting[0].admissionOrdinal);
  const view=JSON.parse(prompt.split('\n\n').find(x=>x.startsWith('## task\n')).slice('## task\n'.length));
  for(const path of declared){
    const f=view.worksite.files.find(x=>x.path===path),text=(await readFile(join(witnessRoot,'seed',path))).toString('utf8');assert.equal(f?.contentRole,'declared_source',path);
    if(f.encoding==='utf8')assert.equal(f.content,text,path);else assert.equal(view.originalTask.slice(f.startCharacter,f.endCharacter),text,path);
  }
  // The repaired candidate is held only by A's native after context, which no task context declares: B births it.
  const afterHeld=ctx.entries.filter(e=>e.state==='file'&&N.payload.value.after.entries.some(x=>x.relativePath===e.relativePath&&x.digest===e.digest&&x.encoding==='base64'));
  assert.ok(afterHeld.length>0);for(const e of afterHeld)assert.equal(holderOf(e).runId,B,`${e.relativePath} is born in B`);
  // Real-prefix refusals: every guard remains, and no other A Result widens the use.
  const path0=declared[0],holder0=holderOf(ctx.entries.find(x=>x.relativePath===path0));assert.notEqual(holder0.payload.resultRef,N.payload.resultRef);
  const withEntry=(path,change)=>({...ctx,entries:ctx.entries.map(e=>e.relativePath===path?change(structuredClone(e)):e)}),causes=new Set();
  const refuse=(c,path,code,u=useB,at=finalPrefix)=>{const x=bodies.resolveWorksiteContextBodyAtPrefix(at,c,path,u);assert.equal(x.kind,'worksite_context_body_refusal',`${code} ${path}`);assert.equal(x.code,code,x.reason);causes.add(code);};
  refuse(ctx,path0,'foreign',{runId:B});
  refuse(ctx,path0,'foreign',{runId:B,sourceResults:[{resultRef:holder0.payload.resultRef,resultDigest:holder0.payload.resultDigest,cCallRef:holder0.aggregateId}]});
  const ai=N.payload.value.after.entries.findIndex(x=>x.relativePath===afterHeld[0].relativePath&&x.digest===afterHeld[0].digest);
  refuse(withEntry(afterHeld[0].relativePath,e=>({...e,member:{resultRef:N.payload.resultRef,resultDigest:N.payload.resultDigest,path:['after','entries',ai]}})),afterHeld[0].relativePath,'foreign');
  refuse(withEntry(path0,e=>({...e,member:{...e.member,resultDigest:'sha256:'+'f'.repeat(64)}})),path0,'tampered');
  refuse(withEntry(path0,e=>({...e,digest:'sha256:'+'e'.repeat(64)})),path0,'stale');
  refuse(ctx,path0,'denied',{...useB,readable:x=>x!==path0});
  refuse({...ctx,entries:ctx.entries.filter(e=>e.relativePath!==path0)},path0,'missing');
  refuse(ctx,path0,'pending',useB,bodies.validatedRuntimeEventPrefixBeforeEvent(finalPrefix,holder0.eventId));
  assert.deepEqual([...causes].sort(),['denied','foreign','missing','pending','stale','tampered']);
  // 7. Cold reads agree with the continued B Run.
  const reads={};
  for(const memberKey of ['run_result','run_replay']){
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},source:continued.receipt.resources.run,eventResource:resource(),identity:`retained-source-${memberKey}`});
    const out=(await cli(`retained-source-${memberKey}`,call,actorEnvironment(logB))).receipt;assert.equal(out.ownerOutput.outcomeKind,'result');reads[memberKey]=out.ownerOutput.value;
  }
  const parent=results(finalB).filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive')),closing=parent.at(-1).payload,terminal=reads.run_result.projection.terminalResult;
  assert.equal(closing.value.terminal,true);
  assert.deepEqual([terminal?.producer.runRef,terminal?.producer.graphCallRef,terminal?.result],[value.run.ref,value.graphCall.ref,{ref:closing.resultRef,digest:closing.resultDigest}]);
  assert.deepEqual(reads.run_replay.projection.replay,value.replay);
  const summary={runA:A,runB:B,sourceBasisRef:S.basisRef,sourceResultRef:S.sourceResultRef,nativeResultRef:N.payload.resultRef,pendingCursorRef:p.pendingCursorRef,choicesB:choiceRefs(finalB),
    actorRolesA:(await roles(logA)).map(x=>x.role),actorRolesB:(await roles(logB)).map(x=>x.role),interruption,lineage,bornInB:afterHeld.map(e=>e.relativePath),promptDigest:started[0].payload.promptDigest,
    eventsA:rowsA.length,eventsInterrupted:interrupted.length,eventsFinal:all.length,finalLogSha256:product.sha256Bytes(await readFile(eventLogPath)),resumeWallMs:performance.now()-resumedAt,hostWallMs:resumedAt-hostStarted,
    proofLimit:'Actual installed default-library topology, Public start and run.continue CLI, ABG/HoG/C2/worksite owners and SIGKILL interruption; the model is a scripted stand-in process. Not a live provider and not Root\'s installed witness.'};
  await keep('summary.json',summary);t.diagnostic(JSON.stringify(summary));
});
