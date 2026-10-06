import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as binder from './bind-assessment-input.mjs';
const O=path.dirname(fileURLToPath(import.meta.url)),G=path.dirname(O),D=path.join(G,'final-f11-scope-inputs-01');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const save=(name,value)=>fs.writeFileSync(path.join(O,name),JSON.stringify(value,null,2)+'\n');
const body=binder.loadScopeBody(),selected=binder.loadBodyInput(),c=binder.contracts;
const preview=c.constructQualificationIdentity(binder.basisTemplate,'basisRef','basisDigest','qualification-basis://abiogenesis/');
assert.equal(preview.installedProduct,null);assert.equal(preview.workspaceBinding,null);assert.equal(preview.tenantManifest,null);
const scope=c.constructQualificationIdentity({...body,subjectBasis:{ref:preview.basisRef,digest:preview.basisDigest}},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
const errors=binder.owner.qualificationScopeCorrespondence(scope,binder.catalog,scope.catalog.digest);assert.deepEqual(errors,[]);
assert.equal(body.inventory.members.length,1950);assert.equal(body.ruleGroups.flatMap(g=>g.ruleRefs).length,2137);
const old=read(path.join(D,'scope-body.json'));
assert.deepEqual(body.ruleGroups.map(g=>g.ruleRefs),old.ruleGroups.map(g=>g.ruleRefs));
assert.equal(body.applicationDomains.length,old.applicationDomains.length);
const changed=body.applicationDomains.filter(d=>d.ruleGroupRef===read(path.join(O,'scope-transform.json')).replaceRuleGroupRef);
assert.equal(changed.length,1);assert.equal(changed[0].surfaceGroups.flatMap(g=>g.memberRefs).length,1950);
const criterion=selected.coverage[0],domain=changed[0].surfaceGroups.find(g=>g.groupRef===criterion.surfaceRef),rule=body.ruleGroups.find(g=>g.groupRef===criterion.ruleRef);
assert.deepEqual(selected.subjectMembers.map(m=>m.ref),domain.memberRefs);
const supplied=new Set(selected.material.map(m=>m.ref));
for(const ref of [...domain.sourceRefs,...rule.sourceRefs,...c.QUALIFICATION_ROLE_POLICY.authoritySourceRefs])assert.ok(supplied.has(ref),ref);
assert.equal(selected.material.length,39);assert.equal(selected.subjectMembers.length,10);
const catalogSource=binder.catalog.sources.find(s=>s.ref===rule.sourceRefs[0]),governing=selected.material.find(m=>m.ref===catalogSource.ref);
const raw=Buffer.from(governing.contentBase64,'base64');assert.equal(hash(raw),catalogSource.digest);
const row=binder.catalog.rules.find(r=>r.ruleRef===rule.ruleRefs[0]);assert.equal(hash(raw.subarray(row.startByte,row.endByte)),row.spanDigest);
const contextSource=selected.material.find(m=>m.ref.endsWith('/REQ-L-GTL3-CONTEXT.md'));
for(const n of ['009','010','011','012'])assert.ok(Buffer.from(contextSource.contentBase64,'base64').toString().includes('REQ-L-GTL3-CONTEXT-'+n));
const contribution=materials=>Buffer.byteLength(materials.map(m=>'SOURCE DATA '+m.ref+' '+m.digest+'\n'+JSON.stringify(Buffer.from(m.contentBase64,'base64').toString('utf8'))).join('\n\n'));
const oldIndex=read(path.join(D,'material-index.json')),oldLookup=new Map([...oldIndex.materials,...oldIndex.authorityMaterials].map(m=>[m.ref,m]));
const oldPacket=read(path.join(D,'body-inputs/rule-154-0.json'));
const oldMaterial=oldPacket.materialRefs.map(ref=>{const x=oldLookup.get(ref);const m=read(path.join(D,x.file)),b=Buffer.from(m.contentBase64,'base64');assert.equal(hash(b),m.digest);assert.equal(b.length,m.byteCount);return m;});
const before={assessedMembers:669,bodies:oldMaterial.length,rawBytes:oldMaterial.reduce((n,m)=>n+m.byteCount,0),ownerSourceSegmentBytes:contribution(oldMaterial)};
assert.equal(before.bodies,686);assert.equal(before.rawBytes,65964603);assert.equal(before.ownerSourceSegmentBytes,69110115);
const after={assessedMembers:10,bodies:selected.material.length,rawBytes:selected.material.reduce((n,m)=>n+m.byteCount,0),ownerSourceSegmentBytes:contribution(selected.material)};
const absent=binder.bindingReadiness(),actualPreparation=binder.bindingReadiness({basis:preview});
assert.equal(absent.ready,false);assert.equal(actualPreparation.ready,false);
assert.throws(()=>binder.bindTask(undefined),/genuine binding incomplete/);
assert.throws(()=>binder.bindScope(preview),/native install\/workspace\/tenant basis remains incomplete/);
assert.throws(()=>binder.materializeWorkerRequest(undefined,undefined),/actual selected finite plan required/);
assert.equal('executionSelectionRef' in c.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries,false);
assert.equal('executionSelectionRef' in c.QUALIFICATION_ASSESSMENT_INPUT_SCHEMA.entries,false);
assert.ok('executionSelectionRef' in c.QUALIFICATION_VERIFICATION_SELECTION_SCHEMA.entries);
assert.equal(selected.material.some(m=>m.ref.includes('/node_modules/typescript/')||m.ref.endsWith('/abi5-root-r10.json')),false);
save('owner-checks.json',{status:'passed',scopeCorrespondenceErrors:errors,ruleRosterConserved:2137,catalogSourcePopulation:95,inventoryUnion:1950,
 selectedResponsibilityCount:1,selectedCriterion:criterion,scopePreview:{ref:scope.scopeRef,digest:scope.scopeDigest,meaning:'Pure set-correspondence preview over actual Q02 null preparation basis; no complete native basis/task/plan/request is fabricated.'},
 allRequiredRoleRuleAndDomainSourcesSupplied:true,all015BPartsAndContext009Through012Retained:true,before,after,
 exactMetric:'Existing qualification.ts SOURCE DATA expression including internal segment separators. Source contribution only: excludes role/scope/attribution/plan/other sections, never a rendered assessment or model capacity claim.',
 missingBinding:actualPreparation,missingPlan:'Actual selected finite owner plan and genuine role/declaration correspondence remain unavailable.',
 originalUnconditionalGuard:'Not present in rule task/input owner schemas or material/input match conditions; removed only from this external rule binder.',
 downstreamVerificationSelectionPreserved:true,genuinelyBoundRequest:false,fullRequestRendered:false,nativeCalls:0,providerCalls:0,
 unassessedResponsibilities:changed[0].surfaceGroups.filter(g=>g.groupRef!==criterion.surfaceRef).map(g=>({groupRef:g.groupRef,memberCount:g.memberRefs.length,status:'unknown; no J performed'}))});
console.log(JSON.stringify({status:'passed',before,after,scopeErrors:errors,missing:actualPreparation.missing,genuinelyBoundRequest:false},null,2));
