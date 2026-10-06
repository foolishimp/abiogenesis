// Component composition: consumer admission is supplied by nativeJoinFixture;
// the finite copied producer history, reader, artifact/environment/declaration
// and CCall owners are real. This neither acquires original history nor runs F11.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks,stripTypeScriptTypes,syncBuiltinESMExports} from 'node:module';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {nativeJoinFixture,coverage,hash,identity} from '../support/malformed-gtl-native-fixture.mjs';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {SELF_CONFORMANCE_IDS as self} from '../../build/code/src/gtl/self_conformance.js';
import {QUALIFICATION_ROLE_POLICY as policy} from '../../build/code/src/validator/qualification_contracts.js';
import {isSelfConformanceResult} from '../../build/code/src/validator/self_conformance_contracts.js';
const root=resolve(import.meta.dirname,'../..'), c=(ref,digest=hash(ref))=>({ref,digest});
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const evidence=process.env.ABI5_PRODUCER_HISTORY_FIXTURE,contextPath=process.env.ABI5_PRODUCER_CONTEXT_FIXTURE;
const ownerFixture=process.env.ABI5_PRODUCER_OWNER_FIXTURE,ownerSourceFixture=process.env.ABI5_PRODUCER_OWNER_SOURCE_FIXTURE;
assert(evidence&&contextPath&&ownerFixture&&ownerSourceFixture,'explicit finite copied-history, retained context and exact historical owner fixtures required');
const allBytes=fs.readFileSync(evidence);
assert.equal(digest(allBytes),'sha256:e8147dd35d207590170bea4f4f2018935c6a5c7fc9893cc3f56585e332692667');
const contextBytes=fs.readFileSync(contextPath);assert.equal(digest(contextBytes),'sha256:831889537928213cf34909ae2e7d500d4fcbb521b790fa7b0d018e2b7f874058');
const context=JSON.parse(contextBytes),bytes=allBytes.subarray(0,context.prefixLength);
const ownerPins=JSON.parse(fs.readFileSync(ownerFixture)),sourcePins=JSON.parse(fs.readFileSync(ownerSourceFixture));
assert.equal(ownerPins.ownerRoot,context.install.installedRoot);
for(const pin of [...ownerPins.readOnlySources,sourcePins.source,sourcePins.freeze]){
 const body=fs.readFileSync(pin.path);assert.equal(body.length,pin.bytes);assert.equal(digest(body),'sha256:'+pin.sha256);
}
assert.equal(sourcePins.source.sha256,'ca7b451a4f0ff231434ef985e53c2a5d215e2fac23161591cbf4e3f2bb9884bf');
assert.equal(sourcePins.freeze.sha256,'4b47285b95656c83dd07f0d6cbcf794738b8328404aacc35cb9e0111e62559a3');
// Plain physical rows select a fixture target only; the tested reader must
// independently authenticate and decode them before they supply proof.
const rows=bytes.toString('utf8').trim().split('\n').map(JSON.parse);
const opened=rows.find(e=>e.kind==='c_call_opened'&&e.payload.callClass==='leaf');
const basisRow=rows.find(e=>e.kind==='basis_admitted'&&e.payload.basisRef===opened.basisId).payload;
const result=rows.find(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===opened.aggregateId).payload;
const modules={},historicalEventStoreUrl=pathToFileURL(join(ownerPins.ownerRoot,'build/code/src/abg/event_store.js')).href;
// The original accepted component used this exact source owner for currentness.
// Its one module URL preserves the historical package's ordinary import identity;
// the consumer and realization below continue to load the current copied tenant.
const historicalSource=fs.readFileSync(sourcePins.source.path,'utf8');
const sourceHook=registerHooks({load(url,context,next){return url===historicalEventStoreUrl
 ?{format:'module',source:stripTypeScriptTypes(historicalSource,{mode:'transform',sourceUrl:url}),shortCircuit:true}:next(url,context);}});
try{
 for(const name of ['abg/event_store','abg/event_prefix','abg/artifact_truth','abg/environment_admission','abg/invocation_execution_truth','abg/execution_basis','abg/c_call','product/declaration_closure'])
  modules[name+'.js']={...await import(pathToFileURL(join(ownerPins.ownerRoot,'build/code/src',name+'.js')))};
}finally{sourceHook.deregister();}
const events=modules['abg/event_store.js'],prefixes=modules['abg/event_prefix.js'],artifact=modules['abg/artifact_truth.js'];
assert.equal(events.ROOT_EVENT_CONTRACT_DIGEST,'sha256:4196aaeb231aaf98b5d3da74c9d7eddaff17140cab0e6af5cfd94e3bd17590f0');
const historicalMaterializerPath=join(ownerPins.ownerRoot,'build/code/src/gtl/materialize.js');
assert.equal(digest(fs.readFileSync(historicalMaterializerPath)),'sha256:82e4abcb65d7cb92d28683173916348331da995f5cda11d8a4af22f7528550ea');
const historicalMaterializer=await import(pathToFileURL(historicalMaterializerPath));
const catalog=JSON.parse(fs.readFileSync(join(root,'contracts/qualification/rule-catalog.json'),'utf8'));
const law=JSON.parse(fs.readFileSync(join(root,'contracts/qualification/law-basis.json'),'utf8'));
const role={roleRef:policy.roleRefs[0],authorityRef:policy.authorityRef,sourceBindings:policy.authoritySourceRefs.map(ref=>catalog.sources.find(s=>s.ref===ref)),
 actorRef:policy.actorRefs[0],workerBindingRef:policy.workerBindingRef,rendererRef:policy.rendererRef,materializationPlanRef:policy.materializationPlanRef,independence:'author_distinct'};
function resign(value){const {coordinateDigest,...body}=value;return {...body,coordinateDigest:hash(body)};}
function sourceBasis(f){const {basisRef,basisDigest,...body}=f.input.basis,i=context.install;return identity({...body,
 productId:i.productId,productVersion:i.packageVersion,productContentDigest:i.productContentDigest,artifact:c('artifact://retained',i.artifactDigest),
 productManifest:c('manifest://retained',i.manifestDigest),toolchain:c('toolchain://retained',i.manifestDigest),installedProduct:c(i.installId,hash(i)),workspaceBinding:context.binding},'basisRef','basisDigest','qualification-basis://abiogenesis/');}
async function fixture(t){
 const scratch=mkdtempSync(join(tmpdir(),'f11-source-reuse-')),path=join(scratch,'events.jsonl');fs.writeFileSync(path,bytes);
 t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));const stat=fs.statSync(path);
 const coordinate=resign({kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:pathToFileURL(path).href,prefixLength:bytes.length,
 prefixDigest:digest(bytes),storeIdentity:{device:stat.dev,inode:stat.ino,eventContractDigest:events.ROOT_EVENT_CONTRACT_DIGEST}});
 const acquisitions=[],representations=new Set(),environments=[];let currentness=0;
 const nativeModules={...modules,
  'abg/c_call.js':{...modules['abg/c_call.js'],projectOpenedCCallCarrierAtPrefix(prefix,graph,...args){
    // This fixture composes two actual package owners. The historical CCall
    // projector requires its own strict materialization receipt; equal JSON
    // from the current materializer does not confer that nominal ownership.
    const owned=historicalMaterializer.rehydrateMaterializedGtlGraph(graph);assert(owned,'exact historical materialization');
    assert.deepEqual(owned,graph);assert.equal(owned.materializationDigest,graph.materializationDigest);
    return modules['abg/c_call.js'].projectOpenedCCallCarrierAtPrefix(prefix,owned,...args);}},
  'abg/artifact_truth.js':{...artifact,projectExactPrefixArtifactTruth(p){const a=artifact.projectExactPrefixArtifactTruth(p);acquisitions.push(a);return a;},
    runtimePrefixFromArtifactTruth(a){const p=artifact.runtimePrefixFromArtifactTruth(a);if(p)representations.add(prefixes.runtimeEventsFromValidatedPrefix(p));return p;}},
  'abg/event_store.js':{...events,assertDurableRuntimePrefixCurrent(p){currentness++;return events.assertDurableRuntimePrefixCurrent(p);}},
  'abg/environment_admission.js':{...modules['abg/environment_admission.js'],projectWorkspaceEnvironmentFromArtifactTruth(a,w){
    const e=modules['abg/environment_admission.js'].projectWorkspaceEnvironmentFromArtifactTruth(a,w);environments.push(e);
    if(e.kind==='exact_prefix_workspace_environment')assert.strictEqual(e.artifactTruth,a);return e;}},
 };
 const owns=p=>p?.eventLogRef?.startsWith(pathToFileURL(scratch).href)||p?.prefix?.eventLogRef?.startsWith(pathToFileURL(scratch).href)||
  (Array.isArray(p)?p[0]?.eventId:p?.events?.[0]?.eventId)?.startsWith('event://abiogenesis/')||
  p?.basisDigest===context.declarations[0].catalog.basisDigest||p?.catalog?.basisDigest===context.declarations[0].catalog.basisDigest||
  p?.programPublication?.programs?.some(program=>program.programRef===basisRow.programRef);
 const consumer=await nativeJoinFixture({origin:'real-source-consumer',sameRealm:true,nativeSourceOwners:[{owns,modules:nativeModules}]});
 // Actual installed catalog bytes, while this consumer's admitted installation
 // and declarations remain explicit synthetic lower-owner premises.
 Object.assign(consumer.environment.productInstalls[0],{installedRoot:root,publicContracts:[{contractId:'abg.asset.qualification.rule-catalog',assetLocator:{path:'contracts/qualification/rule-catalog.json',contentDigest:digest(fs.readFileSync(join(root,'contracts/qualification/rule-catalog.json')))}}]});
 const selectedBasis=sourceBasis(consumer),selection={kind:'execution_selection',selectionRef:'selection://retained-source',slotRef:opened.payload.programLocusRef,
 programRef:basisRow.programRef,invocationAdmissionRef:basisRow.invocationAdmissionRef,result:c(result.resultRef,result.resultDigest),source:{sourceRef:'source://retained-copy',
 cCall:c(opened.payload.cCallRef,opened.payload.cCallDigest),executionBasis:c(basisRow.basisRef,basisRow.basisDigest),graphFunction:c(basisRow.graphFunctionRef,basisRow.graphFunctionDigest)}};
 function prepare(prefix=coordinate){
  const proof={...consumer.proof(),executionSources:[{sourceRef:'source://retained-copy',basis:selectedBasis,prefix:JSON.parse(JSON.stringify(prefix)),declarations:context.declarations}],selections:[selection]};
  const plan=identity({kind:'qualification_assessment_plan',subjectBasis:c(selectedBasis.basisRef,selectedBasis.basisDigest),lawBasis:selectedBasis.lawBasis,
   slots:[{slotRef:'slot://unassessed',task:c('task://unassessed'),taskOrdinal:0,graphFunctionRef:self.graphFunctionRef,programLocusRef:'locus://unassessed',role,coverage:[]}],coverage:[],sharedCoverage:'disjoint',ownerAuthorityRef:policy.authorityRef,ownerActorRef:'actor://unassessed'},'planRef','planDigest','qualification-plan://abiogenesis/');
  const input={kind:'self_conformance_input',schemaVersion:'5.0.0',basis:selectedBasis,law,inventory:null,tenantManifest:null,authorityMembers:[],applications:[],evidenceCitations:[],qualification:{plan,proof,coverageCatalog:coverage,sourceMembers:[]}};
  const call=consumer.open(self.graphFunctionRef,input,'consumer-'+consumer.events.length);
  return {proof,input,call};
 }
 const prepared=prepare();
 const resolver=await privateOwner('validator/self_conformance_basis.js',[],{'../abg/qualification_proof.js':consumer.owner});
 const evaluationMaterials=[];
 const evaluator=await privateOwner('validator/self_conformance.js',[],{'../abg/qualification_proof.js':{
  ...consumer.owner,resolveQualificationExecutionMaterial(...args){const material=consumer.owner.resolveQualificationExecutionMaterial(...args);evaluationMaterials.push(material);return material;}}});
 const port=await privateOwner('implementation/leaf_invocation_port.js',['nativeLeafProofOperations'],{
  '../validator/self_conformance_basis.js':resolver,'../validator/self_conformance.js':evaluator});
 // A separate loaded realization keeps its ordinary imports. Its own resolver
 // cannot authenticate the supplied consumer; only the invoking owner's exact
 // operation can conserve this admitted component relation across that seam.
 const realization=await import(pathToFileURL(join(root,'build/code/src/implementation/self_conformance.js')).href+'?separate-f11-realization');
 // Execute the exact ordinary dispatch expression, retaining the actual owner
 // resolver; the unrelated dispatch/loading shell is outside this component.
 const dispatchSource=fs.readFileSync(join(root,'build/code/src/implementation/leaf_invocation_port.js'),'utf8');
 const expression=dispatchSource.match(/resolveSelfConformanceOwner\(qualificationOwnerBasis, call\.input, true, authority\.qualificationResources\)/g);assert.equal(expression.length,1);
 const dispatch=Function('resolveSelfConformanceOwner','qualificationOwnerBasis','call','authority','return '+expression[0]);
 const check=p=>dispatch(resolver.resolveSelfConformanceOwner,p.call.basis,{input:p.input},{qualificationResources:undefined});
 const occurrence=p=>({...p.call.call,executionAuthority:null,qualificationOwnerBasis:p.call.basis});
 const realize=(p,o=occurrence(p))=>port.invokeLeafOwnerBoundary({resolution:{implementationRef:self.implementationRef,computeRegime:'F_D',inputContractRef:self.inputContractRef,outputContractRef:self.outputContractRef},
  value:p.input,inputDigest:hash(p.input),occurrence:o,failureValueKind:'self_conformance_failure',verifyAuthority:()=>true,
  validateSuccess:isSelfConformanceResult,resolveWorkerContracts:()=>null,loadImplementation:async()=>realization.realizeSelfConformance});
 const material=p=>consumer.owner.resolveQualificationExecutionMaterial(p.proof,p.input.basis,p.call.basis);
 return {scratch,path,coordinate,consumer,prepare,prepared,check,realize,material,acquisitions,representations,environments,evaluationMaterials,occurrence,port,realization,get currentness(){return currentness;}};
}
async function countPhysicalReads(path,operation){
 const prior={open:fs.openSync,read:fs.readSync,close:fs.closeSync},descriptors=new Set();let calls=0,readBytes=0;
 fs.openSync=function(p,...args){const fd=prior.open.call(this,p,...args);if(String(p)===path)descriptors.add(fd);return fd;};
 fs.readSync=function(fd,...args){const n=prior.read.call(this,fd,...args);if(descriptors.has(fd)){calls++;readBytes+=n;}return n;};
 fs.closeSync=function(fd){descriptors.delete(fd);return prior.close.call(this,fd);};syncBuiltinESMExports();
 try{return {value:await operation(),calls,readBytes};}finally{fs.openSync=prior.open;fs.readSync=prior.read;fs.closeSync=prior.close;syncBuiltinESMExports();}
}

test('serialized producer uses one real acquisition and retained representation through environment, dispatch and realization',async t=>{
 const f=await fixture(t),p=f.prepared;
 const measured=await countPhysicalReads(f.path,async()=>{
  assert(f.check(p),'ordinary dispatch owner check');
  const material=f.material(p);assert(material);assert.equal(material.evidence.length,1);
  const receipt=await f.realize(p),output=receipt.candidate;assert.equal(output.disposition,'success',JSON.stringify(receipt));assert.notEqual(output.resultCandidate.disposition,'passed','unassessed consumer remains non-green');
  assert.deepEqual(f.material(p),material);return material;
 });
 assert.equal(measured.readBytes,bytes.length);assert.equal(f.acquisitions.length,1);assert.equal(f.representations.size,1);assert.equal(f.environments.length,1);
 assert.equal(f.currentness,2,'both current checks execute');
 assert.deepEqual(f.evaluationMaterials,[measured.value],'the actual existing evaluation consumes that authenticated material');
 const occurrence=f.occurrence(p),operations=f.port.nativeLeafProofOperations(self.implementationRef,p.input,occurrence);
 assert.throws(()=>operations.qualificationSelfConformance({...p.input},occurrence),/exact admitted input/);
 assert.throws(()=>operations.qualificationSelfConformance(p.input,{...occurrence}),/exact admitted input/);
 assert.throws(()=>f.realization.realizeSelfConformance(p.input,occurrence),/current admitted owner/,'standalone fallback cannot borrow an unowned consumer');
 t.diagnostic(JSON.stringify({physicalReadCalls:measured.calls,physicalReadBytes:measured.readBytes,decodedRepresentations:f.representations.size,
  artifactAcquisitions:f.acquisitions.length,realWorkspaceProjections:f.environments.length,currentnessChecks:f.currentness,materialBytes:measured.value.evidence[0].byteCount,
  premise:'finite copied source with real reader/environment/declaration/CCall owners; supplied consumer admission; no installed qualification'}));
});

test('retained source currentness refuses advance truncation replacement and preserves historical material',async t=>{
 const f=await fixture(t),p=f.prepared;assert(f.check(p));const before=f.material(p);assert(before);
 fs.appendFileSync(f.path,'later');assert.equal(f.check(p),null);assert.equal((await f.realize(p)).candidate.disposition,'failure');assert.deepEqual(f.material(p),before);
 fs.truncateSync(f.path,1);assert.equal(f.check(p),null);fs.writeFileSync(f.path,bytes);assert(f.check(p));
 fs.renameSync(f.path,join(f.scratch,'prior.jsonl'));fs.writeFileSync(f.path,bytes);assert.equal(f.check(p),null);assert.deepEqual(f.material(p),before);
});

test('copied and foreign ingress cannot supply the retained acquisition or skip cold authentication',async t=>{
 const f=await fixture(t);assert(f.check(f.prepared));
 const bad=resign({...f.coordinate,prefixDigest:hash('wrong source bytes')});assert.equal(f.check(f.prepare(bad)),null);
 const copy=join(f.scratch,'copy.jsonl');fs.writeFileSync(copy,bytes);
 const foreign=resign({...f.coordinate,eventLogRef:pathToFileURL(copy).href});assert.equal(f.check(f.prepare(foreign)),null,'copied bytes do not retain original physical identity');
 const copiedStat=fs.statSync(copy),copied=resign({...foreign,storeIdentity:{...foreign.storeIdentity,inode:copiedStat.ino,device:copiedStat.dev}});
 const cold=await countPhysicalReads(copy,()=>f.check(f.prepare(copied)));assert(cold.value);assert.equal(cold.readBytes,bytes.length,'new actual resource authenticates independently');
 fs.writeFileSync(copy,Buffer.alloc(bytes.length,32));assert.equal(f.check(f.prepare(copied)),null,'new consumer/cold relation cannot reuse a raw copied coordinate');
});
