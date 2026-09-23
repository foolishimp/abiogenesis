// Component proof only: original-store acquisition, admitted execution states,
// installs and declarations are the explicit lower-native fixture premises.
// Actual qualification owner correspondence is exercised; no store or actor runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeJoinFixture,ids,hash,identity} from '../support/malformed-gtl-native-fixture.mjs';
import {SELF_CONFORMANCE_IDS as self} from '../../build/code/src/gtl/self_conformance.js';
const clone=x=>JSON.parse(JSON.stringify(x)),c=(ref,digest=hash(ref))=>({ref,digest});
function reidentify(b){const {basisRef,basisDigest,...body}=b;return identity(body,'basisRef','basisDigest','qualification-basis://abiogenesis/');}
async function prepared(){
 const source=await nativeJoinFixture({origin:'original'}),opened=source.open(ids.malformedAssessGraph,source.input,'original-producer');
 const computed=source.implementation.realizeMalformedGtlAssessment(source.input,{cCallRef:opened.call.cCallRef,qualificationOwnerBasis:opened.basis});assert.equal(computed.disposition,'success');
 const result=source.complete(opened,computed.resultCandidate),consumer=await nativeJoinFixture({origin:'qualification',sourceFixtures:[source]});
 const selection={kind:'execution_selection',selectionRef:'selection://original',slotRef:opened.call.programLocusRef,programRef:opened.execution.programRef,
  invocationAdmissionRef:opened.execution.invocationAdmissionRef,result:c(result.resultRef,result.resultDigest),source:{sourceRef:'source://original',
   cCall:c(opened.call.cCallRef,opened.call.cCallDigest),executionBasis:c(opened.execution.basisRef,opened.execution.basisDigest),graphFunction:c(opened.execution.graphFunctionRef,opened.execution.graphFunctionDigest)}};
 const proof={...consumer.proof(),executionSources:[{sourceRef:'source://original',basis:source.input.basis,prefix:source.proof().prefix,declarations:source.proof().declarations}],selections:[selection]};
 const input={kind:'self_conformance_input',schemaVersion:'5.0.0',basis:consumer.input.basis,qualification:{proof}},call=consumer.open(self.graphFunctionRef,input,'consumer');
 const resolve=(p=proof,b=input.basis)=>consumer.owner.resolveQualificationExecutionMaterial(p,b,call.basis);
 return {source,opened,result,consumer,proof,input,call,resolve};
}
test('same candidate in distinct original install/workspace/resource authenticates and conserves original producer material',async t=>{
 const f=await prepared(),before={...f.source.counts},actual=f.resolve();assert(actual);assert.equal(actual.evidence.length,1);
 const value=JSON.parse(Buffer.from(actual.evidence[0].contentBase64,'base64'));
 assert.notEqual(f.source.input.basis.installedProduct.ref,f.input.basis.installedProduct.ref);assert.notEqual(f.source.input.basis.workspaceBinding.ref,f.input.basis.workspaceBinding.ref);
 assert.deepEqual(value.origin.sourceBasis,f.source.input.basis);assert.deepEqual(value.origin.subjectBasis,c(f.input.basis.basisRef,f.input.basis.basisDigest));
 assert.deepEqual(value.origin.prefix,f.source.proof().prefix);assert.deepEqual(value.origin.input,f.source.input);assert.deepEqual(value.result.value,f.result.value);assert.equal(value.judgment.judgment,'advance');
 const reads=f.source.counts.sourceRead-before.sourceRead,environments=f.source.counts.environment-before.environment;
 assert.deepEqual(f.resolve(),actual);assert.equal(f.source.acquisitions.filter(p=>p.prefixDigest===f.proof.executionSources[0].prefix.prefixDigest).length,1,'selected original source frontier authenticated once; original assessment preparation frontier remains separately owned');
 assert(environments<=1);assert.equal(actual.verification,null,'general execution is not QUAL056 root C2');
 t.diagnostic(JSON.stringify({sourceAcquisitions:reads,workspaceProjections:environments,materialBytes:actual.evidence[0].byteCount,scope:'explicit lower admission premises; actual owner relation'}));
});
test('candidate law source and genuine runtime coordinates cannot be crossed or replaced by a read wrapper',async()=>{
 for(const [name,mutate]of [
  ['artifact',p=>{p.executionSources[0].basis.artifact.digest=hash('foreign');}],
  ['law',p=>{p.executionSources[0].basis.lawBasis.digest=hash('foreign');}],
  ['source inventory',p=>{p.executionSources[0].basis.sourceInventory.digest=hash('foreign');}],
  ['toolchain',p=>{p.executionSources[0].basis.toolchain.digest=hash('foreign');}],
  ['install',p=>{p.executionSources[0].basis.installedProduct.digest=hash('foreign');}],
  ['workspace',p=>{p.executionSources[0].basis.workspaceBinding.digest=hash('foreign');}],
  ['resource',p=>{p.executionSources[0].prefix.eventLogRef='file:///foreign';}],
  ['physical store',p=>{p.executionSources[0].prefix.storeIdentity.inode=999;}],
  ['source bytes',p=>{p.executionSources[0].prefix.prefixDigest=hash('foreign');}],
  ['producer CCall',p=>{p.selections[0].source.cCall.digest=hash('foreign');}],
  ['execution basis',p=>{p.selections[0].source.executionBasis.digest=hash('foreign');}],
  ['graph function',p=>{p.selections[0].source.graphFunction.digest=hash('foreign');}],
  ['declaration',p=>{p.executionSources[0].declarations[0].catalog.basisDigest=hash('foreign');}],
  ['missing source',p=>{p.executionSources=[];}],
  ['unused source',p=>{p.executionSources.push({...clone(p.executionSources[0]),sourceRef:'source://unused'});}],
  ['foreign local prefix',p=>{p.prefix=p.executionSources[0].prefix;}],
 ]){const f=await prepared(),p=clone(f.proof);mutate(p);if(p.executionSources[0])p.executionSources[0].basis=reidentify(p.executionSources[0].basis);assert.equal(f.resolve(p),null,name);}
 const f=await prepared(),wrapper=f.source.open(self.graphFunctionRef,{kind:'read_projection_wrapper',originalResult:f.result},'read-wrapper'),result=f.source.complete(wrapper,f.result.value);
 const p=clone(f.proof);p.executionSources[0].prefix=f.source.proof().prefix;p.selections[0].result=c(result.resultRef,result.resultDigest);
 assert.equal(f.resolve(p),null,'a wrapper result cannot substitute for the original execution CCall');
});
test('original source currentness is rechecked at dispatch while historical authenticated prefix remains replayable',async()=>{
 const f=await prepared();assert(f.consumer.owner.projectQualificationConsumer(f.call.basis,f.input,true));assert(f.resolve());
 f.source.event('fixture_later_event','later');assert.equal(f.consumer.owner.projectQualificationConsumer(f.call.basis,f.input,true),null,'cached prior currentness cannot hide source advance');
 assert(f.resolve(),'unchanged admitted historical input remains reproducible');
});
test('duplicate aliases and competing successful producers remain refused in their original context',async()=>{
 const f=await prepared(),duplicate=clone(f.proof);duplicate.selections.push({...clone(duplicate.selections[0]),selectionRef:'selection://alias'});assert.equal(f.resolve(duplicate),null);
 const peer=f.source.open(ids.malformedAssessGraph,f.source.input,'competing'),computed=f.source.implementation.realizeMalformedGtlAssessment(f.source.input,{cCallRef:peer.call.cCallRef,qualificationOwnerBasis:peer.basis});assert.equal(computed.disposition,'success');f.source.complete(peer,computed.resultCandidate);
 const competing=clone(f.proof);competing.executionSources[0].prefix=f.source.proof().prefix;assert.equal(f.resolve(competing),null);
});
