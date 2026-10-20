// Component owner joins under nativeJoinFixture's explicit lower-native premise.
// No semantic qualification, installed Run or release evidence is manufactured.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nativeJoinFixture, coverage, ids, hash, identity, publication } from '../support/malformed-gtl-native-fixture.mjs';
import { SELF_CONFORMANCE_IDS as self } from '../../build/code/src/gtl/self_conformance.js';
import { evaluateSelfConformance, readSelfConformanceCatalog } from '../../build/code/src/validator/self_conformance.js';
import { isQualificationVerdictInput, reduceExactCandidateQualification } from '../../build/code/src/validator/qualification.js';
import { isSelfConformanceResult } from '../../build/code/src/validator/self_conformance_contracts.js';
import { isQualificationContractValue } from '../../build/code/src/validator/self_conformance_semantics.js';
import { privateOwner } from '../support/r10-private-owner-harness.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
const c=(ref,digest=hash(ref))=>({ref,digest});
const law=JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/law-basis.json',import.meta.url)));
function partial(f){return {kind:'self_conformance_input',schemaVersion:'5.0.0',basis:f.input.basis,law,
 inventory:null,tenantManifest:null,authorityMembers:[],applications:[],evidenceCitations:[]};}
function owner(f,opened){const install=f.environment.productInstalls[0],{catalog,bytes}=readSelfConformanceCatalog();return {
 installId:install.installId,installDigest:hash(install),artifactDigest:install.artifactDigest,productId:install.productId,
 productVersion:install.packageVersion,productContentDigest:install.productContentDigest,manifestDigest:install.manifestDigest,
 publicationDigest:hash(publication),workspaceBinding:f.input.basis.workspaceBinding,executionBasis:c(opened.execution.basisRef,opened.execution.basisDigest),
 cCallDigest:opened.call.cCallDigest,nativeBasis:opened.basis,catalogDigest:law.catalog.digest,catalogRef:catalog.catalogRef,
 catalogVersion:catalog.catalogVersion,catalogAssetPath:law.catalog.assetPath};}
function selection(kind,opened,result){return {kind,selectionRef:'selection://'+kind,slotRef:opened.call.programLocusRef,
 programRef:opened.execution.programRef,invocationAdmissionRef:opened.execution.invocationAdmissionRef,result:c(result.resultRef,result.resultDigest)};}
async function assessed(){const f=await nativeJoinFixture(),a=f.open(ids.malformedAssessGraph,f.input,'computed'),out=f.implementation.realizeMalformedGtlAssessment(f.input,{cCallRef:a.call.cCallRef,qualificationOwnerBasis:a.basis});
 assert.equal(out.disposition,'success');const result=f.complete(a,out.resultCandidate);return {...f,a,assessment:out.resultCandidate,result};}

test('actual execution evidence is authenticated once, with foreign, substituted, aliased and ambiguous producers refused',async()=>{
 const f=await assessed(),input=partial(f),next=f.open(self.graphFunctionRef,input,'F11');
 const proof={...f.proof(),selections:[selection('execution_selection',f.a,f.result)]};
 const material=f.owner.resolveQualificationExecutionEvidence(proof,input.basis,{...next.basis,predecessorPrefix:proof.prefix});
 assert.equal(material.length,1);assert.equal(JSON.parse(Buffer.from(material[0].contentBase64,'base64')).result.value.disposition,'green');
 const altered=plain(proof);altered.selections[0].result.digest=hash('wrong');assert.equal(f.owner.resolveQualificationExecutionEvidence(altered,input.basis,{...next.basis,predecessorPrefix:proof.prefix}),null);
 const foreign=plain(input.basis);foreign.artifact.digest=hash('foreign');assert.equal(f.owner.resolveQualificationExecutionEvidence(proof,foreign,{...next.basis,predecessorPrefix:proof.prefix}),null);
 const duplicate=plain(proof);duplicate.selections.push({...duplicate.selections[0],selectionRef:'selection://duplicate'});assert.equal(f.owner.resolveQualificationExecutionEvidence(duplicate,input.basis,{...next.basis,predecessorPrefix:proof.prefix}),null);
 const peer=f.open(ids.malformedAssessGraph,f.input,'peer'),computed=f.implementation.realizeMalformedGtlAssessment(f.input,{cCallRef:peer.call.cCallRef,qualificationOwnerBasis:peer.basis});f.complete(peer,computed.resultCandidate);
 assert.equal(f.owner.resolveQualificationExecutionEvidence({...f.proof(),selections:proof.selections},input.basis,{...next.basis,predecessorPrefix:f.proof().prefix}),null);
});

test('green execution cannot replace independent coverage judgment; shared evidence must actually be in each selected task',async()=>{
 const f=await assessed(),input=partial(f);input.qualification={coverageCatalog:coverage,proof:f.proof(),plan:{subjectBasis:c(input.basis.basisRef,input.basis.basisDigest),lawBasis:input.basis.lawBasis},sourceMembers:[]};
 const opened=f.open(self.graphFunctionRef,input,'coverage'),o=owner(f,opened);
 const material={ref:f.result.resultRef,path:f.result.resultRef,digest:hash('native fixture material'),byteCount:1,contentBase64:'eA=='};
 const mod=await privateOwner('validator/self_conformance.js',[],{'../abg/qualification_proof.js':{
 resolveQualificationAssessments:()=>[],resolveQualificationExecutionMaterial:()=>({evidence:[material],verification:null})}});
 const result=mod.evaluateSelfConformance(input,o);
 assert.equal(result.disposition,'blocked_incomplete');
 const findings=result.findings.filter(x=>x.diagnostic==='behavioral_coverage_assessment_required');
 assert.equal(findings.length,coverage.claims.flatMap(c=>c.behaviors).length);
 assert(findings.every(f=>f.disposition==='blocked_incomplete'&&f.provenance==='J_required'));
});

test('whole native F11 assessment feeds sole AF22 directly; development/foreign/missing/duplicate evidence remains non-green',async()=>{
 const f=await nativeJoinFixture(),input=partial(f),opened=f.open(self.graphFunctionRef,input,'whole-subject');
 const value=evaluateSelfConformance(input,owner(f,opened));assert(isSelfConformanceResult(value));assert.equal(value.disposition,'blocked_incomplete');
 const result=f.complete(opened,value),selected=selection('self_conformance_selection',opened,result),proof={...f.proof(),selections:[selected]};
 const summary=f.owner.projectQualificationSelfConformance(proof,selected,input.basis);assert(summary);assert.equal(summary.disposition,'blocked');
 const verdictInput={kind:'qualification_verdict_input',schemaVersion:'5.0.0',slotRef:publication.graphFunctions.find(g=>g.name===ids.verdictGraph).template.startNodeRef,
 basis:input.basis,coverage,selectionRef:selected.selectionRef,selfConformance:summary,proof};
 assert(isQualificationVerdictInput(verdictInput));const consumer=f.open(ids.verdictGraph,verdictInput,'AF22');
 assert(f.owner.qualificationHasNativeSelfConformance(verdictInput,consumer.basis));
 const actualVerdict=reduceExactCandidateQualification(verdictInput,consumer.basis);assert.equal(actualVerdict.disposition,'blocked');
 const verdictContract=publication.contracts.find(c=>c.contractRef===ids.verdict);assert(verdictContract);
 assert.equal(verdictContract.valueKind,actualVerdict.kind,'declared output kind must match the exact payload at CCall admission');
 assert(isQualificationContractValue(verdictContract.valueKind,actualVerdict));
 const forged=plain(verdictInput);forged.selfConformance.disposition='green';assert.equal(f.owner.qualificationHasNativeSelfConformance(forged,consumer.basis),false);
 const missing=plain(verdictInput);missing.proof.selections=[];assert.equal(f.owner.qualificationHasNativeSelfConformance(missing,consumer.basis),false);
 const subset=plain(verdictInput);subset.coverage.claims.pop();assert(!isQualificationVerdictInput(subset));
 const foreign=plain(verdictInput);foreign.selfConformance.lawBasis=c('law://foreign');assert(!isQualificationVerdictInput(foreign));
 const peer=f.open(self.graphFunctionRef,input,'whole-subject-peer');f.complete(peer,value);
 assert.equal(f.owner.projectQualificationSelfConformance({...f.proof(),selections:[selected]},selected,input.basis),null);
});

test('AF22 shares its exact owner through separate installed realization, success validation and cloned judgment; cold and changed bases stay checked',async t=>{
 const {isolatedCompiledCopy}=await import('../support/isolated-compiled-copy.mjs');
 const copied=isolatedCompiledCopy(t),implementation=await copied.load('implementation/qualification.js'),semantics=await copied.load('validator/self_conformance_semantics.js');
 const f=await nativeJoinFixture({sameRealm:true,rootGraphFunctionRef:ids.verdictGraph}),input=partial(f),opened=f.open(self.graphFunctionRef,input,'self');
 const value=evaluateSelfConformance(input,owner(f,opened)),result=f.complete(opened,value),selected=selection('self_conformance_selection',opened,result);
 // This producer has the same locus/implementation/value but another admitted
 // invocation; it cannot affect this selection. Lower admission is supplied.
 const irrelevant=f.open(self.graphFunctionRef,input,'other-invocation');irrelevant.execution.invocationAdmissionRef='invocation://other';f.complete(irrelevant,value);
 const proof={...f.proof(),selections:[selected]},summary=f.owner.projectQualificationSelfConformance(proof,selected,input.basis);assert(summary);
 const verdictInput={kind:'qualification_verdict_input',schemaVersion:'5.0.0',slotRef:publication.graphFunctions.find(g=>g.name===ids.verdictGraph).template.startNodeRef,
  basis:input.basis,coverage,selectionRef:selected.selectionRef,selfConformance:summary,proof};
 const consumer=f.open(ids.verdictGraph,verdictInput,'verdict'),occurrence={...consumer.call,executionAuthority:null,qualificationOwnerBasis:consumer.basis};
 const port=await privateOwner('implementation/leaf_invocation_port.js',['nativeLeafProofOperations','nativeJudgmentProofOperations'],{
  '../abg/qualification_proof.js':f.owner,
  '../abg/event_store.js':{reidentifyHistoricalDurablePrefixCoordinate:(current,historical)=>{
   assert.deepEqual(current,f.proof().prefix);assert.deepEqual(historical,f.coordinate(historical.prefixLength));return historical;}}
 });
 assert.equal(implementation.realizeExactCandidateQualification(verdictInput,occurrence).disposition,'failure');
 const check=output=>semantics.qualificationResultRelation(ids.verdictPredicate,verdictInput,output,f.proof().prefix,
  port.nativeJudgmentProofOperations(ids.verdictPredicate,verdictInput,output,f.proof().prefix));
 const receipt=await port.invokeLeafOwnerBoundary({resolution:{implementationRef:ids.verdictImplementation,computeRegime:'F_D',inputContractRef:ids.verdictInput,outputContractRef:ids.verdict},
  value:verdictInput,inputDigest:hash(verdictInput),occurrence,failureValueKind:'self_conformance_failure',verifyAuthority:()=>true,
  validateSuccess:check,resolveWorkerContracts:()=>null,loadImplementation:async()=>implementation.realizeExactCandidateQualification});
 assert.equal(receipt.candidate.disposition,'success',JSON.stringify(receipt));const actual=receipt.candidate.resultCandidate;
 assert.equal(actual.disposition,'blocked');assert.equal(f.counts.verdict,1);
 const operation=port.nativeLeafProofOperations(ids.verdictImplementation,verdictInput,occurrence).qualificationVerdict;
 assert.throws(()=>operation(plain(verdictInput),occurrence),/exact admitted/);assert.throws(()=>operation(verdictInput,{...occurrence}),/exact admitted/);
 f.complete(consumer,actual);f.event('activity_observed','unrelated');const before={...f.counts};
 assert(check(plain(actual)));assert.equal(f.counts.verdict,1);assert.equal(f.counts.catalog,before.catalog);
 const changed=plain(verdictInput);changed.selfConformance.disposition='green';
 assert.equal(f.owner.projectExactCandidateQualification(consumer.basis,changed),null);
 assert.equal(f.owner.projectExactCandidateQualification({...consumer.basis,cCallRef:'c-call://wrong'},verdictInput),null);
 assert.equal(f.owner.projectExactCandidateQualification(consumer.basis,verdictInput,true),null,'stale dispatch remains refused even with a retained value');
 const wrong=plain(actual);wrong.nativeBasis.predecessorPrefix.prefixDigest=hash('wrong');assert.equal(check(wrong),false);
 const warm={...f.counts};f.cold();assert(check(plain(actual)));assert.equal(f.counts.verdict,warm.verdict+1);assert(f.counts.catalog>warm.catalog);
 const knownState=f.counts.state;assert(f.owner.projectQualificationSelfConformance({...f.proof(),selections:[selected]},selected,input.basis));
 assert.equal(f.counts.state,knownState,'impossible invocation peer never reconstructs a Result');
 const peer=f.open(self.graphFunctionRef,input,'eligible-peer');f.complete(peer,value);
 assert.equal(f.owner.projectQualificationSelfConformance({...f.proof(),selections:[selected]},selected,input.basis),null);
 t.diagnostic(JSON.stringify({warm,cold:f.counts,premises:'Existing nativeJoinFixture supplies lower admission/environment facts; invoking boundary, separate installed URLs, raw Result clone and proof construction are real. Genuine cold ownership is covered by held-prefix tests and the installed composition.'}));
});
