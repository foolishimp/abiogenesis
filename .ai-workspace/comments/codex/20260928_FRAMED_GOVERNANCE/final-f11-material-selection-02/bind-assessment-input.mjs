/** External, pure, one-responsibility preparation. Existing Product owners
 * retain schema, scope, material, plan and rendering. No dispatch API exists.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const D=path.dirname(fileURLToPath(import.meta.url)),G=path.dirname(D);
const C=path.join(G,'final-candidate-construction-02'),Q=path.join(G,'final-qualification-inputs-02');
const I=path.join(C,'install/node_modules/@abiogenesis/typescript-tenant');
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const must=(ok,why)=>{if(!ok)throw new TypeError(why);};
export function readExact(record){const b=fs.readFileSync(record.path);must(b.length===record.bytes&&digest(b)==='sha256:'+record.sha256,'frozen bytes differ: '+record.path);return b;}
const cf=JSON.parse(readExact({path:path.join(C,'freeze.json'),bytes:fs.statSync(path.join(C,'freeze.json')).size,sha256:'7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'}));
const qf=JSON.parse(readExact({path:path.join(Q,'freeze.json'),bytes:fs.statSync(path.join(Q,'freeze.json')).size,sha256:'a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'}));
const frozen=(root,freeze,relative)=>{const r=freeze.records.find(r=>r.path===relative);must(r!==undefined,'frozen member absent');return readExact({...r,path:path.join(root,relative)});};
for(const n of ['validator/qualification.js','validator/qualification_contracts.js','shared/digests.js','shared/canonical_json.js'])frozen(C,cf,'install/node_modules/@abiogenesis/typescript-tenant/build/code/src/'+n);
export const contracts=await import(pathToFileURL(path.join(I,'build/code/src/validator/qualification_contracts.js')));
export const owner=await import(pathToFileURL(path.join(I,'build/code/src/validator/qualification.js')));
const dg=await import(pathToFileURL(path.join(I,'build/code/src/shared/digests.js')));
const require=createRequire(path.join(I,'package.json')),v=require('valibot');
const hash=dg.sha256Canonical,same=(a,b)=>hash(a)===hash(b),coord=(ref,digest)=>({ref,digest});
export const catalog=JSON.parse(frozen(C,cf,'install/node_modules/@abiogenesis/typescript-tenant/contracts/qualification/rule-catalog.json'));
export const basisTemplate=JSON.parse(frozen(Q,qf,'basis-template.json')).body;

export function loadScopeBody(){
 const t=read(path.join(D,'scope-transform.json'));
 const rewrite=x=>typeof x==='string'?(t.memberRefRebindings[x]??x).replace(t.groupNamespace.from,t.groupNamespace.to):Array.isArray(x)?x.map(rewrite):x!==null&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,rewrite(v)])):x;
 const body=rewrite(JSON.parse(readExact(t.preimage)));
 body.inventory=JSON.parse(readExact(t.currentInventory));
 const at=body.applicationDomains.findIndex(d=>d.ruleGroupRef===t.replaceRuleGroupRef);must(at>=0,'selected rule domain absent');
 body.applicationDomains[at]=t.replacementApplicationDomain;
 must(hash(body)===t.postimageBodyCanonicalDigest,'scope transform differs');
 return body;
}
export function loadBodyInput(){
 const selection=read(path.join(D,'selection.json'));
 must(selection.roleName==='rule'&&selection.coverage.length===1,'only selected one rule responsibility is supported');
 const material=selection.materialSelection.map(row=>{
  const m=row.member,b=fs.readFileSync(row.physicalOrigin);
  must(b.length===m.byteCount&&digest(b)===m.digest,'whole selected body differs: '+m.ref);
  const result={...m,contentBase64:b.toString('base64')};v.parse(contracts.QUALIFICATION_MATERIAL_SCHEMA,result);return result;
 });
 const members=material.map(m=>({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount}));
 must(new Set(members.map(m=>m.path)).size===members.length,'ambiguous context path');
 const context={contextRef:'qualification-context://abiogenesis/'+hash(members).slice(7),sourceLocator:pathToFileURL(D+'/').href,inventoryDigest:hash(members),members};
 for(const [key,value] of Object.entries({context,material,subjectMembers:selection.subjectMembers,coverage:selection.coverage}))v.parse(contracts.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries[key],value);
 return {roleName:'rule',material,context,subjectMembers:selection.subjectMembers,coverage:selection.coverage};
}

/** Current exact pre-RC native basis is a separate actual input. Q02's null
 * preparation fields are preserved, never filled by this helper. */
export function bindScope(basis){
 must(basis!==undefined&&basis!==null,'genuine current basis required');
 v.parse(contracts.EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,basis);
 must(contracts.qualificationIdentity(basis,'basisRef','basisDigest','qualification-basis://abiogenesis/'),'basis identity differs');
 for(const [key,value] of Object.entries(basisTemplate))if(!['installedProduct','workspaceBinding','tenantManifest'].includes(key))must(same(basis[key],value),'basis differs from C02/Q02: '+key);
 must(['installedProduct','workspaceBinding','tenantManifest'].every(k=>basis[k]!==null),'pre-RC native install/workspace/tenant basis remains incomplete');
 const scope=contracts.constructQualificationIdentity({...loadScopeBody(),subjectBasis:coord(basis.basisRef,basis.basisDigest)},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
 v.parse(contracts.QUALIFICATION_SCOPE_SCHEMA,scope);
 must(owner.qualificationScopeCorrespondence(scope,catalog,scope.catalog.digest).length===0,'scope correspondence differs');
 return scope;
}

export function bindingReadiness(binding){
 const b=binding??{},missing=[];
 if(b.basis===undefined||b.basis===null)missing.push('basis: genuine completed exact C02/Q02 basis');
 else for(const k of ['installedProduct','workspaceBinding','tenantManifest'])if(b.basis[k]===undefined||b.basis[k]===null)missing.push('basis.'+k);
 for(const k of ['provenance','role','assetSurface','slotRef','taskOrdinal'])if(b[k]===undefined||b[k]===null)missing.push(k);
 if(!Array.isArray(b.declarations)||b.declarations.length===0)missing.push('declarations: actual owner/actor grants and historical declarations');
 return {ready:missing.length===0,missing,role:'qualification-role://abiogenesis/rule@5',
  notAUniversalRuleTaskPrerequisite:['executionSelectionRef','QUAL-056 verification material'],
  limits:'Presence/schema checks do not authenticate grants, actors or native authority. Claim-specific execution evidence remains required wherever the selected rule judgment needs it. Full QUAL-056/F11/AF22 dependencies remain unchanged.'};
}
export function bindTask(binding){
 const r=bindingReadiness(binding);must(r.ready,'genuine binding incomplete: '+r.missing.join('; '));
 const scope=bindScope(binding.basis),bodies=loadBodyInput();
 v.parse(contracts.QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA,binding.provenance);
 v.parse(contracts.QUALIFICATION_ROLE_SCHEMA,binding.role);
 must(binding.role.roleRef==='qualification-role://abiogenesis/rule@5','binding selects another role');
 must(same(binding.provenance.subjectInventory,coord(scope.inventory.inventoryRef,scope.inventory.inventoryDigest)),'author Context belongs to another inventory');
 const provided=binding.additionalMaterial??[];v.parse(contracts.QUALIFICATION_ASSESSMENT_TASK_SCHEMA.entries.material,provided);
 for(const m of provided){const old=bodies.material.find(x=>x.ref===m.ref);must(old===undefined||same(old,m),'additional material cannot replace selected whole bytes');if(old===undefined)bodies.material.push(m);}
 const supplemental=bodies.material.filter(m=>m.ref.startsWith('material://abiogenesis/final-f11-material-selection-02/'));
 must(binding.provenance.kind==='external_construction'&&supplemental.every(m=>binding.provenance.records.some(r=>same(r,m))),'new actual selection derivation must join original construction records');
 const members=bodies.material.map(m=>({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount}));
 bodies.context={contextRef:'qualification-context://abiogenesis/'+hash(members).slice(7),sourceLocator:pathToFileURL(D+'/').href,inventoryDigest:hash(members),members};
 const task=contracts.constructQualificationIdentity({kind:'qualification_assessment_task',schemaVersion:'5.0.0',slotRef:binding.slotRef,taskOrdinal:binding.taskOrdinal,
  subjectBasis:scope.subjectBasis,lawBasis:scope.lawBasis,catalog:scope.catalog,inventory:coord(scope.inventory.inventoryRef,scope.inventory.inventoryDigest),scope,
  role:binding.role,context:bodies.context,declarations:binding.declarations,assetSurface:binding.assetSurface,material:bodies.material,subjectMembers:bodies.subjectMembers,
  coverage:bodies.coverage,provenance:binding.provenance,priorEvidenceRefs:binding.priorEvidenceRefs??[],residuals:binding.residuals??[]},'taskRef','taskDigest','qualification-task://abiogenesis/');
 must(contracts.isQualificationAssessmentTask(task)&&owner.qualificationMaterialMatches(task),'existing owner rejects task/material/role correspondence');
 return task;
}
export function materializeWorkerRequest(task,plan){
 must(plan!==undefined&&plan!==null,'actual selected finite plan required');
 const input={kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
 must(owner.isQualificationAssessmentInput(input),'existing owner rejects actual task/plan relation');
 return owner.qualificationWorkerRequest(input);
}
export const bindingLimits=Object.freeze({nativeCalls:false,dispatch:false,independentJudgment:false,
 executionSelection:'Removed old unconditional caller guard only for selected rule role; no verification/coverage/tenant/F11 requirement is removed.',
 authority:'Actual role including authorityRef is a required caller binding. Published slot names are not author/owner/grant correspondence. Product native owners still authenticate every dependent runtime relation.'});
