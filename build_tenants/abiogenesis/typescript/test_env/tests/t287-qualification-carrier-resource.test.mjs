// Mechanical carrier proof over the retained complete fixture. No actor,
// admitted event, semantic qualification or release verdict is manufactured.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {qualificationHash as hash, constructQualificationIdentity as identity, isQualificationJudgment} from '../../build/code/src/validator/qualification_contracts.js';
import {acquireQualificationResources, normalizeQualificationScope, resolveQualificationAssessment, resolveSelfConformanceInput} from '../../build/code/src/validator/qualification_resources.js';
import {isQualificationAssessmentInput, establishQualificationAssessment, qualificationScopeCorrespondence, qualificationRuleSurfaces, qualificationWorkerRequest, prepareQualificationAssessment} from '../../build/code/src/validator/qualification.js';
import {isSelfConformanceInput,isSelfConformanceResult} from '../../build/code/src/validator/self_conformance_contracts.js';
import {evaluateSelfConformance} from '../../build/code/src/validator/self_conformance.js';
import {ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS as semantics} from '../../build/code/src/validator/self_conformance_semantics.js';
import {prepareRunQualificationResources} from '../../build/code/src/product/run_invocation_operation.js';
import {projectExactCandidateQualification,projectQualificationJudgment,projectQualificationConsumer} from '../../build/code/src/abg/qualification_proof.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
const clone=x=>structuredClone(x),c=(ref,digest)=>({ref,digest}),bytes=x=>Buffer.byteLength(canonicalJson(x)),sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const resign=(x,r,d,p)=>identity(x,r,d,p);
const fixturePath=process.env.ABI5_F11_CARRIER_FULL_FIXTURE, output=process.env.ABI5_F11_CARRIER_REPORT;
let full;
function fixture(){
 if(full)return full;
 assert(fixturePath,'full retained fixture path is required');const raw=fs.readFileSync(fixturePath);
 assert.equal(sha(raw),'sha256:10ebbf15a389ca5d15c7d84ed4feb1cafe63dc2b5be1c3f717229c65c5a29901');
 const embedded=JSON.parse(raw),task=embedded.task,t0=performance.now(),normalized=normalizeQualificationScope(task.scope),entries=[];
 const add=(entryKind,coordinate,value)=>{const old=entries.find(e=>e.entryKind===entryKind&&e.coordinate.ref===coordinate.ref);if(old){assert.deepEqual(old,{entryKind,coordinate,value});return;}entries.push({entryKind,coordinate,value});};
 add('inventory',task.inventory,task.scope.inventory);add('scope',c(normalized.scopeRef,normalized.scopeDigest),normalized);
 for(const m of [...task.material,...task.provenance.records])add('material',c(m.ref,m.digest),m);
 const provenance={...task.provenance,records:task.provenance.records.map(m=>({entryKind:'material',entry:c(m.ref,m.digest)}))},pd=hash(provenance);
 add('provenance',c('qualification-provenance://abiogenesis/'+pd.slice(7),pd),provenance);
 const declarationSelections=task.declarations.map(p=>({catalogBasisDigest:p.catalog.basisDigest,readinessBasisDigest:p.catalog.readinessBasisDigest,viewDigest:p.catalogView.viewDigest,proofDigest:hash(p)}));
 const manifest=identity({kind:'qualification_resource_manifest',schemaVersion:'1',subjectBasis:task.subjectBasis,lawBasis:task.lawBasis,catalog:task.catalog,inventory:task.inventory,entries,declarationSelections},'resourceRef','resourceDigest','qualification-resource://abiogenesis/');
 const assertion={kind:'qualification_resource_assertion',schemaVersion:'1',manifests:[manifest],declarationProofs:task.declarations};
 const input=compact(embedded,manifest),resources=acquireQualificationResources(assertion),view=establishQualificationAssessment(input,resources);
 full={embedded,normalized,manifest,assertion,input,resources,view,normalizationMs:performance.now()-t0};return full;
}
function selection(m,entryKind,entry){return {kind:'qualification_resource_selection',schemaVersion:'1',resource:c(m.resourceRef,m.resourceDigest),entryKind,entry};}
function compact(embedded,m){const old=embedded.task,scope=m.entries.find(e=>e.entryKind==='scope'),provenance=m.entries.find(e=>e.entryKind==='provenance');
 const task=identity({...old,representation:'resource_refs_v1',resource:c(m.resourceRef,m.resourceDigest),scope:selection(m,'scope',scope.coordinate),declarations:m.declarationSelections,
 material:old.material.map(x=>selection(m,'material',c(x.ref,x.digest))),provenance:selection(m,'provenance',provenance.coordinate)},'taskRef','taskDigest','qualification-task://abiogenesis/');
 const plan=identity({...embedded.plan,slots:embedded.plan.slots.map(s=>({...s,task:s.slotRef===task.slotRef?c(task.taskRef,task.taskDigest):s.task}))},'planRef','planDigest','qualification-plan://abiogenesis/');
 return {kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
}
function alteredScope(mutate){const f=fixture(),scope=clone(f.normalized);mutate(scope);const n=resign(scope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
 const m=resign({...f.manifest,entries:f.manifest.entries.map(e=>e.entryKind==='scope'?{...e,coordinate:c(n.scopeRef,n.scopeDigest),value:n}:e)},'resourceRef','resourceDigest','qualification-resource://abiogenesis/');
 return {input:compact(f.embedded,m),assertion:{...f.assertion,manifests:[m]}};
}
function replaceMemberSet(scope,group,mutate){const old=scope.referenceSets.find(s=>s.setRef===group.memberSet.ref),body=clone(old);mutate(body.values);
 const set=resign(body,'setRef','setDigest','qualification-set://abiogenesis/');if(!scope.referenceSets.some(s=>s.setRef===set.setRef))scope.referenceSets.push(set);group.memberSet=c(set.setRef,set.setDigest);
}
const skip=!fixturePath;
test('closed resource forms retain nonempty group arrays and actual old embedded identities',{skip},t=>{
 const f=fixture();assert.equal(f.embedded.task.taskDigest,'sha256:acf5b524e60a6b391109215c4a403bfa13b4b175f9547204fbd86aad0248dd85');
 assert.equal(f.embedded.plan.planDigest,'sha256:c97523f6a25977187211cf35060642c2a57b4949a2e3705345c0ef0eb4444e98');
 assert.equal(hash(f.embedded),'sha256:a1bdf000af5f0857a1facc3f4d434a8452b0e094b0266ab81fb656eb94c19a7b');
 assert(isQualificationAssessmentInput(f.input));assert.notEqual(f.input.task.taskDigest,f.embedded.task.taskDigest);assert.notEqual(f.input.plan.planDigest,f.embedded.plan.planDigest);
 assert.equal(f.view.task.scope.inventory.members.length,1950);assert.equal(f.view.task.scope.ruleGroups.flatMap(g=>g.ruleRefs).length,2137);
 assert.equal(f.view.task.scope.applicationDomains.length,187);assert.equal(f.view.task.scope.applicationDomains.flatMap(d=>d.surfaceGroups).length,777);
 const expected={...f.embedded.task.scope,scopeRef:f.normalized.scopeRef,scopeDigest:f.normalized.scopeDigest};assert.deepEqual(f.view.task.scope,expected);
 for(const domain of f.view.task.scope.applicationDomains)assert.deepEqual(qualificationRuleSurfaces(f.view.task.scope,domain.ruleGroupRef),domain.surfaceGroups);
 const partitions=new Set(f.view.task.scope.applicationDomains.map(d=>hash(d.surfaceGroups.map(({groupRef,...g})=>g))));assert(partitions.size>1);
 const first=f.view.task.scope.applicationDomains[0].surfaceGroups[0];assert(first.memberRefs.length&&first.rootRefs.length&&first.surfaceRoles.length&&first.ownerRefs.length&&first.sourceRefs.length);
 assert.throws(()=>normalizeQualificationScope({...f.embedded.task.scope,surfaceGroups:[{...f.embedded.task.scope.surfaceGroups[0],rootRefs:[]}]}),/empty_relation/);
 assert.strictEqual(resolveQualificationAssessment(f.input,f.resources).task.scope,f.view.task.scope,'one acquired set view is borrowed');
 t.diagnostic(JSON.stringify({members:1950,rules:2137,domains:187,domainGroups:777,distinctPartitions:partitions.size,referenceSets:f.normalized.referenceSets.length}));
});
test('full omission overlap and missing-domain negatives reach complete correspondence after every identity is repaired',{skip},()=>{
 for(const [name,mutate] of [
 ['omit member',s=>replaceMemberSet(s,s.applicationDomains[0].surfaceGroups[0],v=>v.pop())],
 ['overlap',s=>{const d=s.applicationDomains.find(d=>d.surfaceGroups.length>1),other=s.referenceSets.find(x=>x.setRef===d.surfaceGroups[1].memberSet.ref);replaceMemberSet(s,d.surfaceGroups[0],v=>v.push(other.values[0]));}],
 ['missing domain',s=>s.applicationDomains.pop()],
 ]){const a=alteredScope(mutate),resources=acquireQualificationResources(a.assertion),view=resolveQualificationAssessment(a.input,resources),catalog=JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/rule-catalog.json',import.meta.url)));
 assert(qualificationScopeCorrespondence(view.task.scope,catalog,a.input.task.catalog.digest,view.normalizedScope).some(x=>x.includes('incomplete')),name);
 assert.throws(()=>establishQualificationAssessment(a.input,resources),/correspondence/,name);assert(isQualificationAssessmentInput(a.input),name+' repaired compact raw form');}
});
function changeSet(scope, old, mutate){const oldRef=old.setRef;mutate(old);const set=resign(old,'setRef','setDigest','qualification-set://abiogenesis/');Object.assign(old,set);
 for(const g of [...scope.surfaceGroups,...scope.applicationDomains.flatMap(d=>d.surfaceGroups)])for(const field of ['memberSet','rootSet','roleSet','ownerSet','sourceSet'])if(g[field].ref===oldRef)g[field]=c(set.setRef,set.setDigest);
}
test('missing crossed ambiguous inventory sets bodies and declaration dependencies refuse before material can be used',{skip},()=>{
 const f=fixture();assert.throws(()=>establishQualificationAssessment(f.input),/dependency_missing/);
 for(const [name,mutate,guard]of[
 ['crossed inventory',s=>{const x=s.referenceSets.find(x=>x.encoding==='member_ordinals');changeSet(s,x,x=>{x.inventory={...x.inventory,digest:hash('crossed')};});},/inventory_or_ordinal/],
 ['ordinal range',s=>{const x=s.referenceSets.find(x=>x.encoding==='member_ordinals');changeSet(s,x,x=>{x.values=[1950];});},/inventory_or_ordinal/],
 ['duplicate ordinal',s=>{const x=s.referenceSets.find(x=>x.encoding==='member_ordinals');changeSet(s,x,x=>{x.values=[x.values[0],x.values[0]];});},/identity_or_ambiguity/],
 ['crossed set',s=>{s.applicationDomains[0].surfaceGroups[0].rootSet=s.applicationDomains[0].surfaceGroups[0].memberSet;},/set_missing_or_crossed/],
 ]){const a=alteredScope(mutate);assert.throws(()=>acquireQualificationResources(a.assertion),guard,name);}
 assert.throws(()=>acquireQualificationResources({...f.assertion,declarationProofs:[]}).declarations(f.input.task.resource,f.input.task.declarations),/preimage_missing_or_crossed/);
 const wrong=clone(f.input);wrong.task.resource.digest=hash('crossed');wrong.task=resign(wrong.task,'taskRef','taskDigest','qualification-task://abiogenesis/');assert.throws(()=>resolveQualificationAssessment(wrong,f.resources),/missing_or_crossed/);
 const assertion={...f.assertion,manifests:[f.manifest,f.manifest]};assert.throws(()=>acquireQualificationResources(assertion),/identity_or_duplicate/);
 const body=f.manifest.entries.find(e=>e.entryKind==='material'),missing=resign({...f.manifest,entries:f.manifest.entries.filter(e=>e!==body)},'resourceRef','resourceDigest','qualification-resource://abiogenesis/');
 const a={...f.assertion,manifests:[missing]};assert.throws(()=>establishQualificationAssessment(compact(f.embedded,missing),acquireQualificationResources(a)),/entry_missing_or_crossed/);
 const wrongView=clone(f.assertion);wrongView.declarationProofs[0].catalogView.viewDigest=hash('crossed');assert.throws(()=>establishQualificationAssessment(f.input,acquireQualificationResources(wrongView)),/preimage_missing_or_crossed/);
});
test('Run pre-effect acquisition borrows only the exact invoking proof and rejects redundant dependencies',{skip},()=>{
 const f=fixture(),p=f.embedded.task.declarations[0],base={catalog:p.catalog,catalogView:p.catalogView,applications:[],source:{kind:'none'}};
 const borrowed=prepareRunQualificationResources({...base,qualificationResources:{...f.assertion,declarationProofs:[]}},f.input);assert(borrowed);
 assert.throws(()=>prepareRunQualificationResources({...base,qualificationResources:f.assertion},f.input),/declaration_ambiguous/);
 assert.throws(()=>prepareRunQualificationResources(base,f.input),/dependency_missing/);
});
test('selected full prompt preserves source bodies rubric ordering and attribution apart from explicit normalized coordinates',{skip},t=>{
 const f=fixture(),t0=performance.now(),old=qualificationWorkerRequest(f.embedded),baselineMs=performance.now()-t0,t1=performance.now(),prepared=prepareQualificationAssessment(f.input,f.resources),request=prepared.request,preparedMs=performance.now()-t1;
 const lines=request.prompt.split('\n\n'),original=old.prompt.split('\n\n');assert.equal(lines.length,original.length);
 let differences=0;for(let n=0;n<lines.length;n++){if(lines[n]===original[n])continue;assert(lines[n].startsWith('SCOPE AND COMPUTED CORRESPONDENCE'));const label='SCOPE AND COMPUTED CORRESPONDENCE (C, not semantic satisfaction): ';
 const a=JSON.parse(original[n].slice(label.length)),b=JSON.parse(lines[n].slice(label.length));assert.deepEqual(b.scope,c(f.normalized.scopeRef,f.normalized.scopeDigest));delete a.scope;delete b.scope;assert.deepEqual(a,b);differences++;}assert.equal(differences,1);
 assert.equal(sha(Buffer.from(old.prompt)),'sha256:35d718313300c7feb1ebc64d699c373c58dd9de868bc68c9c14a83e7d7ee4264');assert.deepEqual(request.responseJsonSchema,old.responseJsonSchema);assert.equal(request.inputDigest,hash(f.input));
 const raw={kind:'qualification_raw_judgment',schemaVersion:'5.0.0',criteria:f.input.task.coverage.map(c=>({...c,disposition:'indeterminate',applicability:'unknown',grouping:'unknown',reason:'Controlled carrier fixture retains all semantic obligations.',sourceRefs:[f.view.task.material[0].ref],evidenceRefs:[],residuals:['residual://semantic-assessment-open']})),residuals:['residual://full-F11-open'],attributions:[]};
 const predecessorPrefix={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///not-an-authored-runtime-store',prefixLength:0,prefixDigest:hash('prefix'),storeIdentity:{device:1,inode:1,eventContractDigest:hash('contract')},coordinateDigest:hash('coordinate')},nativeBasis={cCallRef:'c-call://controlled-pure-fixture',predecessorPrefix};
 const source={cCallRef:nativeBasis.cCallRef,inputDigest:hash(f.input),actorRef:request.actorRef,workerBindingRef:request.workerBindingRef,actorInvocationRef:'actor-invocation://controlled-fixture',transportBindingRef:'transport://controlled-fixture',transportBindingDigest:hash('binding'),requestDigest:hash(request),observationDigest:hash('observation'),promptDigest:hash(request.prompt),rawValueDigest:hash(raw)};
 const judgment=prepared.complete(raw,nativeBasis,source);assert(isQualificationJudgment(judgment));assert(prepared.matches(f.input,judgment));assert(!prepared.matches(clone(f.input),judgment));assert(!prepared.matches(f.input,{...judgment,source:{...source,promptDigest:hash('crossed')}}));
 const encoded=canonicalJson(judgment);assert(!encoded.includes('contentBase64'));assert(!encoded.includes('qualification_scope_interned'));assert(!encoded.includes('abg_historical_declaration_proof'));assert.equal(judgment.source.inputDigest,hash(f.input));
 const evidence={evidenceClass:'probabilistic_transport',...source,transportDisposition:'success',transportFailureClass:null,outputDigest:hash(judgment)};
 assert(!semantics.validateResultEvidenceLineage({outputContractRef:'contract://abiogenesis/qualification/judgment@5',value:judgment,admittedEvidence:[evidence]}));
 assert(semantics.validateResultEvidenceLineage({outputContractRef:'contract://abiogenesis/qualification/judgment@5',value:judgment,admittedEvidence:[evidence],nativeProof:{qualificationRequest:()=>prepared.request}}));
 assert(!semantics.validateResultEvidenceLineage({outputContractRef:'contract://abiogenesis/qualification/judgment@5',value:judgment,admittedEvidence:[{...evidence,requestDigest:hash('crossed')}],nativeProof:{qualificationRequest:()=>prepared.request}}));
 const accounting={semanticInputBytes:bytes(f.input),oldInputBytes:bytes(f.embedded),assertionBytes:bytes(f.assertion),normalizedScopeBytes:bytes(f.normalized),inventoryBytes:bytes(f.view.task.scope.inventory),promptBytes:Buffer.byteLength(request.prompt),judgmentBytes:bytes(judgment),baselineMs,preparedMs,normalizationAcquisitionMs:f.normalizationMs,measurement:'pure fixture process only; no installed admission, memory or speed claim',semanticQualification:'open'};
 assert(accounting.semanticInputBytes<150000);assert(accounting.judgmentBytes<160000);t.diagnostic(JSON.stringify(accounting));
 if(output){fs.mkdirSync(output,{recursive:true});for(const[name,value]of Object.entries({'compact-input.json':f.input,'resource-assertion.json':f.assertion,'compact-judgment.json':judgment,'accounting.json':accounting}))fs.writeFileSync(path.join(output,name),canonicalJson(value)+'\n');}
 full.prepared=prepared;full.judgment=judgment;full.nativeBasis=nativeBasis;
});
test('fresh explicit acquisition agrees; warmed and fresh missing resources refuse at actual cold consumer entrypoints',{skip},()=>{
 const f=fixture(),proof={kind:'qualification_proof_resource',schemaVersion:'5.0.0',representation:'resource_refs_v1',resource:f.input.task.resource,prefix:f.nativeBasis.predecessorPrefix,declarations:f.input.task.declarations,selections:[]};
 const selection={kind:'judgment_selection',selectionRef:'selection://fixture',slotRef:f.input.task.slotRef,task:c(f.input.task.taskRef,f.input.task.taskDigest),programRef:'program://fixture',invocationAdmissionRef:'invocation://fixture',result:c('result://fixture',hash(f.judgment))};
 assert.equal(projectQualificationJudgment(proof,f.input.plan,selection,f.resources),null,'before Result/J has no admitted fact');assert.equal(projectQualificationJudgment(proof,f.input.plan,selection),null,'warm helper cannot supply resources');
 assert.equal(projectQualificationConsumer(f.nativeBasis,f.input,false,f.resources),null,'no fabricated native owner');assert.equal(projectQualificationConsumer(f.nativeBasis,f.input),null);
 assert.equal(projectExactCandidateQualification(f.nativeBasis,{proof}),null,'missing resources precede warmed verdict fast path');
 if(output){const script=`import fs from 'node:fs';import assert from 'node:assert/strict';import {acquireQualificationResources,resolveQualificationAssessment} from ${JSON.stringify(new URL('../../build/code/src/validator/qualification_resources.js',import.meta.url).href)};import {projectQualificationJudgment} from ${JSON.stringify(new URL('../../build/code/src/abg/qualification_proof.js',import.meta.url).href)};const i=JSON.parse(fs.readFileSync(process.argv[1]+'/compact-input.json'));const a=JSON.parse(fs.readFileSync(process.argv[1]+'/resource-assertion.json'));const r=acquireQualificationResources(a);assert.equal(resolveQualificationAssessment(i,r).task.scope.inventory.members.length,1950);assert.throws(()=>resolveQualificationAssessment(i),/dependency_missing/);const proof=${JSON.stringify(proof)},selection=${JSON.stringify(selection)};assert.equal(projectQualificationJudgment(proof,i.plan,selection),null);assert.equal(projectQualificationJudgment(proof,i.plan,selection,r),null);console.log(JSON.stringify({members:1950,coldAcquisition:true,missingResourceRefused:true,beforeResultJRefused:true}));`;
 const result=execFileSync(process.execPath,['--input-type=module','-e',script,output],{encoding:'utf8'});fs.writeFileSync(path.join(output,'fresh-process.json'),result);}
});

test('full F11 input and scope output keep compact identities and whole-scope blocked findings',{skip},t=>{
 const f=fixture(),basis=JSON.parse(fs.readFileSync(path.join(path.dirname(fixturePath),'basis.json'))),law=JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/law-basis.json',import.meta.url))),tenant=JSON.parse(fs.readFileSync(path.join(path.dirname(fixturePath),'tenant-manifest.json')));
 const entries=[...f.manifest.entries,{entryKind:'law',coordinate:c(law.lawBasisRef,law.lawBasisDigest),value:law},{entryKind:'tenant_manifest',coordinate:c(tenant.manifestRef,tenant.manifestDigest),value:tenant}],manifest=resign({...f.manifest,entries},'resourceRef','resourceDigest','qualification-resource://abiogenesis/');
 const resources=acquireQualificationResources({...f.assertion,manifests:[manifest]}),applications=f.normalized.applicationDomains.flatMap(d=>d.surfaceGroups.map(g=>({ruleRef:d.ruleGroupRef,surfaceRef:g.groupRef,applicability:'unknown',premiseEvidenceRefs:[],evaluationEvidenceRefs:[],rulingEvidenceRefs:[]})));
 const input={kind:'self_conformance_input',schemaVersion:'5.0.0',representation:'resource_refs_v1',resource:c(manifest.resourceRef,manifest.resourceDigest),basis,law:selection(manifest,'law',c(law.lawBasisRef,law.lawBasisDigest)),inventory:selection(manifest,'inventory',basis.sourceInventory),tenantManifest:selection(manifest,'tenant_manifest',c(tenant.manifestRef,tenant.manifestDigest)),scope:selection(manifest,'scope',c(f.normalized.scopeRef,f.normalized.scopeDigest)),authorityMembers:f.view.task.material.filter(m=>law.sources.some(s=>s.ref===m.ref)).map(m=>selection(manifest,'material',c(m.ref,m.digest))),applications,evidenceCitations:[]};
 assert(isSelfConformanceInput(input));assert.equal(resolveSelfConformanceInput(input,resources).input.scope.inventory.members.length,1950);assert.throws(()=>resolveSelfConformanceInput(input),/dependency_missing/);
 const owner={installId:'install://pure-component',installDigest:hash('install'),artifactDigest:basis.artifact.digest,productId:basis.productId,productVersion:basis.productVersion,productContentDigest:basis.productContentDigest,manifestDigest:basis.productManifest.digest,publicationDigest:hash('publication'),workspaceBinding:basis.workspaceBinding,executionBasis:c('basis://pure-component',hash('basis')),cCallDigest:hash('c-call'),nativeBasis:f.nativeBasis,catalogDigest:law.catalog.digest,catalogRef:law.catalog.ref,catalogVersion:law.catalog.version,catalogAssetPath:law.catalog.assetPath};
 const result=evaluateSelfConformance(input,owner,resources);assert(isSelfConformanceResult(result));assert.deepEqual(result.scope,input.scope);assert.equal(result.inputDigest,hash(input));assert.equal(result.ruleApplications.length,777);assert.notEqual(result.disposition,'passed');assert.equal(result.qualificationVerdict,false);assert(result.findings.some(x=>x.diagnostic==='semantic_assessment_required'));
 const encoded=canonicalJson(result);assert(!encoded.includes('contentBase64'));assert(!encoded.includes('qualification_scope_interned'));assert(!encoded.includes('abg_historical_declaration_proof'));assert.equal(bytes(result.scope),bytes(input.scope));
 t.diagnostic(JSON.stringify({selfConformanceInputBytes:bytes(input),selfConformanceResultBytes:bytes(result),scopeOutputBytes:bytes(result.scope),applications:result.ruleApplications.length,disposition:result.disposition,claim:'pure complete C plus truthful unresolved J; no native/F11 qualification'}));
 if(output){fs.writeFileSync(path.join(output,'compact-f11-input.json'),canonicalJson(input)+'\n');fs.writeFileSync(path.join(output,'compact-f11-result.json'),encoded+'\n');}
});
