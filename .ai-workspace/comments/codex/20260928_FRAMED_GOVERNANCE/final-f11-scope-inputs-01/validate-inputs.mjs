/** Granted pure constructor/schema/set/byte checks; no native assessment. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {contracts as q,owner,bindTask,bindScope,loadBodyInputs,bindingLimits} from './bind-assessment-input.mjs';
const D=path.dirname(fileURLToPath(import.meta.url));
const C=path.join(D,'../final-candidate-construction-01');
const Q=path.join(D,'../final-qualification-inputs-01');
const I=path.join(C,'install/node_modules/@abiogenesis/typescript-tenant');
const require=createRequire(path.join(I,'package.json')),v=require('valibot');
const {sha256Bytes,sha256Canonical}=await import(pathToFileURL(path.join(I,'build/code/src/shared/digests.js')));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,value)=>{
 const p=path.join(D,name),bytes=JSON.stringify(value,null,2)+'\n';
 if(fs.existsSync(p)){assert.equal(fs.readFileSync(p,'utf8'),bytes);return;}
 fs.writeFileSync(p,bytes,{flag:'wx'});
};
const body=read(path.join(D,'scope-body.json')),template=read(path.join(Q,'basis-template.json')).body;
const catalog=read(path.join(I,'contracts/qualification/rule-catalog.json'));
const previewBasis=q.constructQualificationIdentity(template,'basisRef','basisDigest','qualification-basis://abiogenesis/');
const scope=q.constructQualificationIdentity({...body,subjectBasis:{ref:previewBasis.basisRef,digest:previewBasis.basisDigest}},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
v.parse(q.QUALIFICATION_SCOPE_SCHEMA,scope);
assert.deepEqual(owner.qualificationScopeCorrespondence(scope,catalog,body.catalog.digest),[]);
write('structural-preview.json',{status:'STRUCTURAL PREVIEW ONLY; native basis fields null; not final subject identity, task, grant or native proof',basis:previewBasis,scope});
const identity=s=>{const {scopeRef,scopeDigest,...b}=s;return q.constructQualificationIdentity(b,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');};
const negatives=[];
for(const [name,mutate,diagnostic] of [
 ['omitted current rule',s=>s.ruleGroups[0].ruleRefs.pop(),'scope_rule_partition_incomplete'],
 ['omitted global member',s=>s.surfaceGroups[0].memberRefs.pop(),'scope_surface_partition_incomplete'],
 ['omitted per-rule domain member',s=>s.applicationDomains[0].surfaceGroups[0].memberRefs.pop(),'scope_application_member_domain_incomplete'],
 ['duplicated per-rule domain member',s=>s.applicationDomains[0].surfaceGroups[0].memberRefs.push(s.applicationDomains[0].surfaceGroups[1].memberRefs[0]),'scope_application_member_domain_incomplete'],
 ['omitted current rule-group domain',s=>s.applicationDomains.pop(),'scope_application_rule_domain_incomplete']
]) {const s=structuredClone(scope);mutate(s);assert(owner.qualificationScopeCorrespondence(identity(s),catalog,body.catalog.digest).includes(diagnostic));negatives.push({name,diagnostic});}
assert.throws(()=>bindTask(['catalog-0']),/genuine binding input required/);
assert.throws(()=>bindScope(),/genuine completed qualification basis required/);
assert.throws(()=>bindScope(previewBasis),/still unbound/);
const index=read(path.join(D,'body-input-index.json'));
let contextChecks=0,memberChecks=0,coverageChecks=0;
for(const row of index.packets){
 const b=read(path.join(D,row.file));
 v.parse(q.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries.subjectMembers,b.subjectMembers);
 if(b.coverage.length>0)v.parse(q.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries.coverage,b.coverage);
 else assert(b.roleName==='tenant'&&b.coverageBindingRequired!==undefined);
 const context={contextRef:'qualification-context://abiogenesis/'+sha256Canonical(b.contextMembers).slice(7),sourceLocator:pathToFileURL(D+'/').href,inventoryDigest:sha256Canonical(b.contextMembers),members:b.contextMembers};
 v.parse(q.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries.context,context);
 assert.equal(new Set(b.contextMembers.map(m=>m.path)).size,b.contextMembers.length);
 assert.equal(new Set(b.materialRefs).size,b.materialRefs.length);
 assert.equal(b.materialRefs.length,b.contextMembers.length);
 contextChecks++;memberChecks+=b.subjectMembers.length;coverageChecks+=b.coverage.length;
 // Check required source unions using the installed owner's exact routing law,
 // while task-level provenance/basis correspondence remains unavailable.
 const requiredMembers=new Set(),requiredSources=new Set(q.QUALIFICATION_ROLE_POLICY.authoritySourceRefs);
 for(const c of b.coverage){
   if(b.roleName==='rule'){
     const g=body.ruleGroups.find(x=>x.groupRef===c.ruleRef);assert(g);
     const s=owner.qualificationRuleSurfaces(scope,c.ruleRef).find(x=>x.groupRef===c.surfaceRef);assert(s);
     s.memberRefs.forEach(r=>requiredMembers.add(r));s.sourceRefs.forEach(r=>requiredSources.add(r));g.sourceRefs.forEach(r=>requiredSources.add(r));
   }else if(b.roleName==='inventory'){
     const s=body.surfaceGroups.find(x=>x.groupRef===c.surfaceRef);assert(s);assert.equal(c.ruleRef,body.inventory.inventoryRef);
     s.memberRefs.forEach(r=>requiredMembers.add(r));s.sourceRefs.forEach(r=>requiredSources.add(r));
   }else if(b.roleName==='catalog'){
     const g=body.ruleGroups.find(x=>x.groupRef===c.ruleRef);assert(g);g.sourceRefs.forEach(r=>requiredSources.add(r));
   }
 }
 assert([...requiredSources].every(r=>b.materialRefs.includes(r)));
 if(['rule','inventory'].includes(b.roleName))assert.deepEqual([...requiredMembers].sort(),b.subjectMembers.map(m=>m.ref).sort());
}
const bank=read(path.join(D,'material-index.json'));let bytes=0;
for(const row of [...bank.materials,...bank.authorityMaterials]){
 const m=read(path.join(D,row.file));v.parse(q.QUALIFICATION_MATERIAL_SCHEMA,m);
 const b=Buffer.from(m.contentBase64,'base64');assert.equal(b.toString('base64'),m.contentBase64);assert.equal(b.length,m.byteCount);assert.equal(sha256Bytes(b),m.digest);bytes+=b.length;
}
// Existing renderer is not called with fabricated basis/provenance. Exercise
// the bounded same-role body union and the unchanged schema/byte carriers.
const merged=loadBodyInputs(['catalog-0','catalog-1']);
assert.equal(new Set(merged.material.map(m=>m.ref)).size,merged.material.length);
assert.equal(merged.coverage.length,2);
const externalRecords=read(path.join(Q,'external-construction-context.json'));
write('owner-checks-final.json',{status:'PASS bounded pure input structure and correspondence; no independent semantic assessment',
  scopePreview:{ref:scope.scopeRef,digest:scope.scopeDigest,finalSubject:false},
  inventory:{ref:body.inventory.inventoryRef,digest:body.inventory.inventoryDigest,members:body.inventory.members.length},
  catalog:{ref:body.catalog.ref,digest:body.catalog.digest,rules:catalog.rules.length,sources:catalog.sources.length},
  completeDisjointRulePartition:true,completeDisjointGlobalMemberPartition:true,
  completeDisjointPerRuleMemberPartitions:body.applicationDomains.length,domainPartitions:body.applicationDomains.reduce((n,d)=>n+d.surfaceGroups.length,0),
  existingOwnerDiagnostics:[],negativeDiscriminators:negatives,contextChecks,subjectMemberDeclarationsChecked:memberChecks,criteriaChecked:coverageChecks,
  materialRecordsChecked:bank.materials.length+bank.authorityMaterials.length,materialOriginalBytesChecked:bytes,
  sameRoleUnion:{labels:['catalog-0','catalog-1'],uniqueBodies:merged.material.length,criteria:merged.coverage.length},
  binderMissingInputRefusals:['absent binding','absent final basis','nullable structural preview'],
  tenantCoverage:'Deferred actual manifest ref; no placeholder criterion',coverageBehaviorCriteria:66,
  qualificationWorkerRequest:'existing owner retained as sole renderer; deliberately uninvoked until real basis/provenance/declarations/plan arrive',
  routedExternalConstructionActivations:externalRecords.chains.map(x=>x.ownerActivation),
  bindingLimits,rolePolicy:q.QUALIFICATION_ROLE_POLICY,
  limits:['Full task/plan/request and construction-attribution correspondence not asserted.','Body/schema/set correspondence does not close applicability, common scope, context adequacy, attribution or independence.','No native execution or selected provider call count.']});
console.log(JSON.stringify({scopeCorrespondence:[],ruleGroups:body.ruleGroups.length,classificationGroups:body.surfaceGroups.length,
  completeDomains:body.applicationDomains.length,bodyInputs:contextChecks,negativeDiscriminators:negatives.length,materialRecords:bank.materials.length+bank.authorityMaterials.length},null,2));
