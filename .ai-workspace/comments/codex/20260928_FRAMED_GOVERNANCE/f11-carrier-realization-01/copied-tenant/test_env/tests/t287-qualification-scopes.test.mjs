// Component premises: the small published catalog, native execution evidence,
// admitted independent J and tenant lookup below are supplied explicitly. No
// native store, provider, source qualification or release is manufactured.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {qualificationHash as hash, constructQualificationIdentity as identity, QUALIFICATION_ROLE_POLICY as policy} from '../../build/code/src/validator/qualification_contracts.js';
import {isSelfConformanceResult} from '../../build/code/src/validator/self_conformance_contracts.js';
import {projectExternalConstructionAttribution} from '../../build/code/src/validator/qualification.js';
const clone=x=>structuredClone(x),coord=(ref,digest=hash(ref))=>({ref,digest}),digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const plainSource=m=>({ref:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount});
const material=(ref,text,path=ref)=>{const b=Buffer.from(text);return {ref,path,digest:digest(b),byteCount:b.length,contentBase64:b.toString('base64')};};
const typed=(ref,value)=>material(ref,JSON.stringify(value,Object.keys(value).sort()));
function canon(value){if(Array.isArray(value))return value.map(canon);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canon(value[k])]));return value;}
const mat=(ref,value,path=ref)=>material(ref,JSON.stringify(canon(value)),path);
const installedCatalog=JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/rule-catalog.json',import.meta.url)));
const roleSources=policy.authoritySourceRefs.map(ref=>installedCatalog.sources.find(s=>s.ref===ref));
const authority=roleSources.map(s=>({...s,contentBase64:fs.readFileSync(new URL('../../'+s.path,import.meta.url)).toString('base64')}));
const prefix={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///synthetic-no-resource',prefixLength:0,prefixDigest:hash('prefix'),storeIdentity:{device:1,inode:2,eventContractDigest:hash('event')},coordinateDigest:hash('coordinate')};
function bodyIdentity(value,refKey,digestKey,prefix){const {[refKey]:_r,[digestKey]:_d,...body}=value;return identity(body,refKey,digestKey,prefix);}
function fixture(size=3,ruleCount=2,configureCatalog=()=>{}){
 const source=Array.from({length:size},(_,i)=>({...material('source://member/'+i,'export const value'+i+' = '+i+';\nUNPROVIDED_'+i+'\n','member-'+i+'.mjs'),surfaceRoles:[i===0?'code':i===1?'public_contract':'proof'],classificationEvidenceRefs:['classification://premise']}));
 const inventory=identity({kind:'qualification_subject_inventory',selectedRoots:['root://candidate'],coverage:'complete_claim',members:source.map(({contentBase64,...m})=>m)},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 const rules=Array.from({length:ruleCount},(_,i)=>({ruleRef:'rule://scoped/'+i,version:'1',sourceRef:authority[i%2].ref,sourceDigest:authority[i%2].digest,startByte:0,endByte:authority[i%2].byteCount,spanDigest:authority[i%2].digest,governedClaim:'scoped-component-law-'+i,applicability:'requires_admitted_judgment',requiredEvidenceRoles:['semantic_assessment'],computableRelation:'source_span_integrity',diagnostic:'semantic_assessment_required'}));
 const catalog={kind:'qualification_rule_catalog',schemaVersion:'5.0.0',catalogRef:'catalog://small-component',catalogVersion:'1',ownerRef:'owner://component',method:installedCatalog.method,sources:roleSources,rules,coverageClaim:'finite_candidate_unassessed',requiredCatalogEvidenceRoles:['catalog_fidelity']};
 configureCatalog(catalog);
 const catalogBytes=Buffer.from(JSON.stringify(catalog)),catalogDigest=digest(catalogBytes);
 const law=identity({kind:'qualification_law_basis',...catalog.method,catalog:{ref:catalog.catalogRef,digest:catalogDigest,ownerRef:catalog.ownerRef,version:catalog.catalogVersion,assetPath:'contracts/qualification/rule-catalog.json'},sources:catalog.sources},'lawBasisRef','lawBasisDigest','qualification-law://abiogenesis/');
 const tenant=identity({kind:'tenant_conformance_manifest',schemaVersion:'5.0.0',productId:'product://component',capabilityDefinitionGraph:coord('capability://component'),publicContractCatalog:coord('public://component'),claims:[{claimRef:'claim://component',capabilityRef:'capability://one',publicContractRefs:['contract://one'],evidenceRefs:['evidence://one']}]},'manifestRef','manifestDigest','tenant-manifest://abiogenesis/');
 const coverage={kind:'qualification_coverage_catalog',schemaVersion:'5.0.0',catalogRef:'coverage://component',catalogDigest:hash('coverage'),catalogVersion:'1',lawBasis:coord(law.lawBasisRef,law.lawBasisDigest),claims:[{coverageRef:'coverage://one',behaviors:['behavior://one'],requirementRefs:[authority[1].ref+'#REQ'],evidenceRoles:['behavioral_coverage']}]};
 const basis=identity({kind:'exact_candidate_qualification',projection:'basis',schemaVersion:'5.0.0',subjectKind:'installed_rc',productId:tenant.productId,productVersion:'5.0.0-rc.1',sourceInventory:coord(inventory.inventoryRef,inventory.inventoryDigest),artifact:coord('artifact://component'),productManifest:coord('manifest://component'),productContentDigest:hash('content'),toolchain:coord('manifest://component'),installedProduct:coord('install://component'),workspaceBinding:coord('workspace://component'),prospectiveRelease:{productId:tenant.productId,namespace:'abiogenesis',profile:'one_project_unqualified',projectSubtree:'.',versionLine:'5.0.0',ordinal:1,version:'5.0.0-rc.1',releaseClaim:coord('release-claim://component')},tenantManifest:coord(tenant.manifestRef,tenant.manifestDigest),coverageCatalog:coord(coverage.catalogRef,coverage.catalogDigest),lawBasis:coverage.lawBasis},'basisRef','basisDigest','qualification-basis://abiogenesis/');
 const scope=identity({kind:'qualification_scope',subjectBasis:coord(basis.basisRef,basis.basisDigest),lawBasis:basis.lawBasis,catalog:coord(catalog.catalogRef,catalogDigest),inventory,ruleGroups:[{groupRef:'group://rules',ruleRefs:rules.map(r=>r.ruleRef),sourceRefs:roleSources.map(s=>s.ref)}],surfaceGroups:[{groupRef:'group://surfaces',memberRefs:source.map(s=>s.ref),rootRefs:inventory.selectedRoots,surfaceRoles:[...new Set(source.flatMap(s=>s.surfaceRoles))],ownerRefs:['owner://component'],sourceRefs:[source[0].ref]}]},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
 const execution=mat('execution://actual-premise',{kind:'component_native_execution_premise'}),verification={subjectBasis:scope.subjectBasis,lawBasis:basis.lawBasis,recipe:coord('recipe://premise'),executionSelectionRef:'selection://execution',execution:coord(execution.ref,execution.digest),cCall:coord('c-call://executed-premise'),observation:coord('observation://premise'),commandOutcomes:[],lintOutcome:null,predicateOutcomes:[],testSummaries:[],disposition:'passed',diagnostics:[]};
 const owner={installId:basis.installedProduct.ref,installDigest:basis.installedProduct.digest,artifactDigest:basis.artifact.digest,productId:basis.productId,productVersion:basis.productVersion,productContentDigest:basis.productContentDigest,manifestDigest:basis.productManifest.digest,publicationDigest:hash('publication'),workspaceBinding:basis.workspaceBinding,executionBasis:coord('execution-basis://component'),cCallDigest:hash('call'),nativeBasis:{cCallRef:'c-call://F11',predecessorPrefix:prefix},catalogDigest,catalogRef:catalog.catalogRef,catalogVersion:catalog.catalogVersion,catalogAssetPath:law.catalog.assetPath};
 const sourceMembers=source.map(({surfaceRoles,classificationEvidenceRefs,...m})=>m),input={kind:'self_conformance_input',schemaVersion:'5.0.0',basis,law,inventory,tenantManifest:tenant,scope,authorityMembers:authority,applications:[{ruleRef:'group://rules',surfaceRef:'group://surfaces',applicability:'applicable',premiseEvidenceRefs:[],evaluationEvidenceRefs:[],rulingEvidenceRefs:[]}],evidenceCitations:[],qualification:{plan:{subjectBasis:scope.subjectBasis,lawBasis:basis.lawBasis},proof:{selections:[]},sourceMembers,coverageCatalog:coverage}};
 const declarations=[material(catalog.catalogRef,catalogBytes,law.catalog.assetPath),mat(inventory.inventoryRef,inventory),mat(tenant.manifestRef,tenant),mat(law.lawBasisRef,law),mat(coverage.catalogRef,coverage)];
 let judgments=[];
 function judgment(role,evidenceRole,ruleRef,surfaceRef,selected=sourceMembers,grouped=true){
  const index=judgments.length,c={criterionRef:'criterion://'+index,ruleRef,surfaceRef,evidenceRole,disposition:'satisfied',applicability:'applicable',...(grouped?{grouping:'justified'}:{}),reason:'Supplied independent common-scope and adequacy component premise',sourceRefs:[selected[0].ref],evidenceRefs:role==='coverage'?[execution.ref]:[],residuals:[]};
  const j={task:{inventory:basis.sourceInventory,catalog:scope.catalog,...(grouped?{scope:input.scope}:{}),subjectMembers:selected.map(plainSource),material:[...declarations,...authority,...sourceMembers,execution],role:{roleRef:'qualification-role://abiogenesis/'+role+'@5'},coverage:[c],slotRef:'slot://'+index,provenance:{kind:'native_construction'}},raw:{criteria:[c],residuals:[]},source:{actorRef:policy.actorRefs[0]}};judgments.push(j);input.qualification.proof.selections.push({kind:'judgment_selection',slotRef:j.task.slotRef,result:coord('judgment://'+index)});return j;
 }
 function populate(grouped=true){judgments=[];input.qualification.proof.selections=[];
  if(grouped){judgment('catalog','catalog_fidelity','group://rules',catalog.catalogRef);judgment('inventory','inventory_coverage',inventory.inventoryRef,'group://surfaces');judgment('inventory','inventory_classification',inventory.inventoryRef,'group://surfaces');judgment('rule','semantic_assessment','group://rules','group://surfaces');}
  else {delete input.scope;for(const rule of rules)for(const member of sourceMembers)judgment('rule','semantic_assessment',rule.ruleRef,member.ref,[member],false);judgment('catalog','catalog_fidelity','catalog-fidelity',catalog.catalogRef,sourceMembers,false);judgment('inventory','inventory_coverage','inventory',inventory.selectedRoots[0],sourceMembers,false);for(const member of sourceMembers)judgment('inventory','inventory_classification','classification',member.ref,[member],false);input.applications=rules.flatMap(r=>sourceMembers.map(m=>({ruleRef:r.ruleRef,surfaceRef:m.ref,applicability:'applicable',premiseEvidenceRefs:[],evaluationEvidenceRefs:[],rulingEvidenceRefs:[]})));}
  judgment('tenant','tenant_realization','tenant',tenant.manifestRef,sourceMembers,grouped);judgment('coverage','behavioral_coverage',coverage.claims[0].coverageRef,coverage.claims[0].behaviors[0],sourceMembers,grouped);
 }
 populate();
 async function ownerModule(){return privateOwner('validator/self_conformance.js',[],{'node:fs':{readFileSync:(p,...args)=>String(p).endsWith('/qualification/rule-catalog.json')?catalogBytes:fs.readFileSync(p,...args)},'./qualification.js':{qualificationCoverageIsPublished:()=>true},'../abg/qualification_proof.js':{resolveQualificationAssessments:()=>judgments,resolveQualificationExecutionMaterial:()=>({evidence:[execution],verification}),qualificationTenantClaimsMatch:()=>true}});}
 async function assessmentModule(){return privateOwner('validator/qualification.js',[],{'node:fs':{readFileSync:(p,...args)=>String(p).endsWith('/qualification/rule-catalog.json')?catalogBytes:fs.readFileSync(p,...args)}});}
 return {input,owner,catalog,catalogBytes,catalogDigest,scope,sourceMembers,authority,execution,verification,ownerModule,assessmentModule,populate,judgment,get judgments(){return judgments;}};
}

test('small whole subject grouped and singleton semantics agree under explicit independent/native premises',async()=>{
 const f=fixture(),m=await f.ownerModule(),grouped=m.evaluateSelfConformance(f.input,f.owner);
 assert.equal(grouped.disposition,'passed',JSON.stringify(grouped.findings.filter(x=>x.disposition!=='passed')));assert(isSelfConformanceResult(grouped));assert.deepEqual(grouped.scope,f.scope);assert.equal(grouped.ruleApplications.length,1);
 f.populate(false);const flat=m.evaluateSelfConformance(f.input,f.owner);assert.equal(flat.disposition,grouped.disposition);assert.equal(flat.ruleApplications.length,6);assert.equal(flat.scope,undefined);
});

test('required group/member/root/domain omissions, duplicate and crossed basis never receive a complete assessment',async()=>{
 for(const [name,mutate,diagnostic] of [
  ['member',f=>{f.input.scope.surfaceGroups[0].memberRefs.pop();},'scope_surface_partition_incomplete'],
  ['rule',f=>{f.input.scope.ruleGroups[0].ruleRefs.pop();},'scope_rule_partition_incomplete'],
  ['root',f=>{f.input.scope.surfaceGroups[0].rootRefs=['root://foreign'];},'scope_root_coverage_incomplete'],
  ['application',f=>{f.input.applications=[];},'rule_surface_classification_missing'],
  ['duplicate',f=>{f.input.applications.push(clone(f.input.applications[0]));},'duplicate_rule_application'],
  ['foreign subject',f=>{f.input.scope.subjectBasis.digest=hash('foreign');},'scope_subject_basis_mismatch'],
  ['false role group',f=>{f.input.scope.surfaceGroups[0].surfaceRoles=['code'];},'scope_surface_role_mismatch'],
 ]){const f=fixture();f.input=clone(f.input);mutate(f);f.input.scope=bodyIdentity(f.input.scope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');const out=(await f.ownerModule()).evaluateSelfConformance(f.input,f.owner);assert.notEqual(out.disposition,'passed',name);assert(out.findings.some(x=>x.diagnostic===diagnostic),name);}
});

test('unknown and falsified grouping/applicability are conserved; incomplete context and foreign J cannot discharge scope',async()=>{
 for(const [name,mutate,expected]of [
  ['unknown grouping',f=>{Object.assign(f.judgments[3].raw.criteria[0],{grouping:'unknown',disposition:'indeterminate'});},'blocked_incomplete'],
  ['false semantic group',f=>{Object.assign(f.judgments[3].raw.criteria[0],{grouping:'falsified',disposition:'falsified'});},'failed'],
  ['unknown applicability',f=>{f.input.applications[0].applicability='unknown';},'blocked_incomplete'],
  ['contradictory applicability',f=>{f.judgments[3].raw.criteria[0].applicability='inapplicable';},'failed'],
  ['missing actual source',f=>{f.judgments[3].task.material=f.judgments[3].task.material.filter(m=>m.ref!==f.sourceMembers[0].ref);},'blocked_incomplete'],
  ['foreign J scope',f=>{f.judgments[3].task.scope={...f.scope,scopeDigest:hash('foreign')};},'blocked_incomplete'],
  ['missing whole source bytes',f=>{f.input.qualification.sourceMembers.pop();},'failed'],
  ['verification failure',f=>{f.verification.disposition='failed';},'failed'],
 ]){const f=fixture();mutate(f);const out=(await f.ownerModule()).evaluateSelfConformance(f.input,f.owner);assert.equal(out.disposition,expected,name);}
});

test('grouped representation grows by explicit members/rules, not Cartesian semantic rows or findings',async t=>{
 const rows=[];for(const size of [3,100]){const f=fixture(size,size),out=(await f.ownerModule()).evaluateSelfConformance(f.input,f.owner);assert.equal(out.disposition,'passed');assert.equal(out.ruleApplications.length,1);assert.equal(out.findings.filter(x=>x.diagnostic==='semantic_assessment_required').length,1);rows.push({members:size,rules:size,applications:out.ruleApplications.length,findings:out.findings.length,serializedBytes:Buffer.byteLength(JSON.stringify(out)),avoidedCartesianRows:size*size});}
 assert(rows[1].serializedBytes<rows[0].serializedBytes*100/3);t.diagnostic(JSON.stringify({representation:rows,claim:'component representation only; independent/native facts supplied'}));
});

function assessment(f,{scoped=true}={}){
 const records=[material('record://activation','Actual synthetic test author constructed the selected files.\n'),mat('record://preimage',{members:[]}),
  material('record://delta',f.sourceMembers.map(m=>{const text=Buffer.from(m.contentBase64,'base64').toString('utf8'),lines=text.trimEnd().split('\n');return '--- /dev/null\n+++ '+m.path+'\n@@ -0,0 +1,'+lines.length+' @@\n'+lines.map(l=>'+'+l).join('\n')+'\n';}).join('')),
  mat('record://closure',{actor:'author://component',members:f.sourceMembers.map(plainSource)}),
  ...f.sourceMembers.map(m=>({...m,ref:'record://postimage/'+m.ref}))];
 const sources=records.slice(0,4),chain={activationRef:sources[0].ref,preimageRef:sources[1].ref,deltaRef:sources[2].ref,closureRef:sources[3].ref,authorRef:'author://component',actorIdentityRef:'actor://external-author',authorityRef:policy.authorityRef,scopeRefs:f.sourceMembers.map(m=>m.ref),postimageMembers:f.sourceMembers.map(plainSource),changes:f.sourceMembers.map(m=>({memberRef:m.ref,patchPath:m.path,preimageMemberRef:null,postimageMemberRef:'record://postimage/'+m.ref})),attributionSources:[sources[0],sources[3]].map(m=>({sourceRef:m.ref,startByte:0,endByte:m.byteCount,spanDigest:m.digest}))};
 const provenance={kind:'external_construction',subjectInventory:f.input.basis.sourceInventory,recordSet:coord('record-set://component',hash(records)),records,chains:[chain],acknowledgmentSelectionRef:null};
 const selected=scoped?[...authority,f.sourceMembers[0]]:[...authority,...f.sourceMembers];
 const members=selected.map(m=>({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount}));
 const role={roleRef:policy.roleRefs[3],authorityRef:policy.authorityRef,sourceBindings:roleSources,actorRef:policy.actorRefs[0],workerBindingRef:policy.workerBindingRef,rendererRef:policy.rendererRef,materializationPlanRef:policy.materializationPlanRef,independence:'author_distinct'};
 const coverage=[{criterionRef:'criterion://source-group',ruleRef:scoped?'group://rules':f.catalog.rules[0].ruleRef,surfaceRef:scoped?'group://surfaces':f.sourceMembers[0].ref,evidenceRole:'semantic_assessment'}];
 const task=identity({kind:'qualification_assessment_task',schemaVersion:'5.0.0',slotRef:'slot://assessment',taskOrdinal:0,subjectBasis:f.scope.subjectBasis,lawBasis:f.scope.lawBasis,catalog:f.scope.catalog,inventory:f.input.basis.sourceInventory,...(scoped?{scope:f.scope}:{}),role,context:{contextRef:'context://assessment',sourceLocator:'retained://selected-material',inventoryDigest:hash(members),members},declarations:[],assetSurface:{kind:'qualification_assessment',requiredContexts:['context://assessment'],standardsRefs:policy.authoritySourceRefs,outputContractRefs:['contract://abiogenesis/qualification/assessment-raw@5'],constructorRef:'constructor://assessment',rendererRef:policy.rendererRef,proofObligationRefs:['proof://scope'],authoritySlots:[{authorityKindRef:policy.authorityRef,disposition:'normal',fallbackPreconditionRefs:[]}]},material:selected,subjectMembers:f.sourceMembers.map(plainSource),coverage,provenance,priorEvidenceRefs:[],residuals:[]},'taskRef','taskDigest','qualification-task://abiogenesis/');
 const plan=identity({kind:'qualification_assessment_plan',subjectBasis:task.subjectBasis,lawBasis:task.lawBasis,slots:[{slotRef:task.slotRef,task:coord(task.taskRef,task.taskDigest),taskOrdinal:0,graphFunctionRef:'graph-function://assessment',programLocusRef:'locus://assessment',role,coverage}],coverage,sharedCoverage:'disjoint',ownerAuthorityRef:policy.authorityRef,ownerActorRef:'actor://owner'},'planRef','planDigest','qualification-plan://abiogenesis/');
 const input={kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
 const raw={kind:'qualification_raw_judgment',schemaVersion:'5.0.0',criteria:coverage.map(c=>({...c,disposition:'satisfied',applicability:'applicable',...(scoped?{grouping:'justified'}:{}),reason:'Explicit component J premise over whole declared scope; not qualification.',sourceRefs:[f.sourceMembers[0].ref],evidenceRefs:[],residuals:[]})),residuals:[],attributions:[{activationRef:chain.activationRef,authorRef:chain.authorRef,actorIdentityRef:chain.actorIdentityRef,authorityRef:chain.authorityRef,scopeRefs:chain.scopeRefs,disposition:'established',sourceRefs:sources.map(m=>m.ref),reason:'Synthetic independent attribution premise; exact original fixture text retained.'}]};
 return {input,raw};
}
function resign(a){a.input.task=bodyIdentity(a.input.task,'taskRef','taskDigest','qualification-task://abiogenesis/');a.input.plan.slots[0].task=coord(a.input.task.taskRef,a.input.task.taskDigest);a.input.plan.slots[0].role=a.input.task.role;a.input.plan=bodyIdentity(a.input.plan,'planRef','planDigest','qualification-plan://abiogenesis/');return a;}

test('actual renderer states supplied scope/material and original attribution spans without quoting unprovided source or base64 records',async t=>{
 const f=fixture(),q=await f.assessmentModule(),grouped=assessment(f),flat=assessment(f,{scoped:false});assert(q.isQualificationAssessmentInput(grouped.input));assert(q.isQualificationAssessmentInput(flat.input));
 const request=q.qualificationWorkerRequest(grouped.input),old=q.qualificationWorkerRequest(flat.input);
 assert(request.prompt.includes('UNPROVIDED_0'));assert(!request.prompt.includes('UNPROVIDED_1'));assert(!request.prompt.includes('UNPROVIDED_2'));
 assert(request.prompt.includes('providedAttributionSpans'));assert(request.prompt.includes('Actual synthetic test author'));assert(!request.prompt.includes('contentBase64'));
 assert(request.prompt.includes('unprovidedAssessedMemberRefs'));assert(request.responseJsonSchema.properties.criteria.items.required.includes('grouping'));
 assert(q.qualificationRawMatches(grouped.input,grouped.raw));assert(q.qualificationRawMatches(flat.input,flat.raw));
 const noGrouping=clone(grouped.raw);delete noGrouping.criteria[0].grouping;assert(!q.qualificationRawMatches(grouped.input,noGrouping));
 assert.equal(projectExternalConstructionAttribution({task:grouped.input.task,raw:grouped.raw},grouped.input.plan).status,'grounded');
 const unsupported=clone(grouped.raw);unsupported.attributions[0].disposition='insufficient';assert.equal(projectExternalConstructionAttribution({task:grouped.input.task,raw:unsupported},grouped.input.plan).status,'insufficient');
 t.diagnostic(JSON.stringify({scopedPromptBytes:Buffer.byteLength(request.prompt),singletonWholeMaterialPromptBytes:Buffer.byteLength(old.prompt),providedBodies:grouped.input.task.material.length,assessedMembers:grouped.input.task.subjectMembers.length,attributionSpans:2,retainedRecordBodies:grouped.input.task.provenance.records.length,rawSchemaBytes:Buffer.byteLength(JSON.stringify(request.responseJsonSchema)),claim:'actual constructor/renderer sizes on finite synthetic scope; no token quota or semantic sufficiency inference'}));
});

test('scoped constructor refuses missing material, changed byte/span, foreign basis and waived independence',async()=>{
 const f=fixture(),q=await f.assessmentModule();
 for(const [name,mutate]of [
  ['missing required source',a=>{a.input.task.material=a.input.task.material.filter(m=>m.ref!==f.sourceMembers[0].ref);a.input.task.context.members=a.input.task.context.members.filter(m=>m.memberRef!==f.sourceMembers[0].ref);a.input.task.context.inventoryDigest=hash(a.input.task.context.members);} ],
  ['changed source bytes',a=>{a.input.task.material[2].contentBase64=Buffer.from('changed').toString('base64');}],
  ['foreign catalog',a=>{a.input.task.catalog.digest=hash('foreign');}],
  ['foreign subject',a=>{a.input.task.scope={...a.input.task.scope,subjectBasis:{...a.input.task.scope.subjectBasis,digest:hash('foreign')}};a.input.task.scope=bodyIdentity(a.input.task.scope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');}],
  ['not required independence',a=>{a.input.task.role.independence='not_required';}],
  ['altered attribution span',a=>{a.input.task.provenance.chains[0].attributionSources[0].spanDigest=hash('foreign');}],
  ['omitted assessed group member',a=>{a.input.task.subjectMembers.pop();}],
 ]){const a=clone(assessment(f));mutate(a);resign(a);assert(!q.isQualificationAssessmentInput(a.input),name);}
 const independent=clone(assessment(f));independent.input.plan.sharedCoverage='declared_independent_peers';independent.input.plan=bodyIdentity(independent.input.plan,'planRef','planDigest','qualification-plan://abiogenesis/');assert(!q.isQualificationAssessmentInput(independent.input),'one actor cannot satisfy declared independent peers');
});

test('fresh process conserves grouped result identities and refuses changed grouped bytes',async t=>{
 const {mkdtemp,writeFile,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path'),{execFileSync}=await import('node:child_process');
 const f=fixture(),result=(await f.ownerModule()).evaluateSelfConformance(f.input,f.owner),dir=await mkdtemp(join(tmpdir(),'abg-scope-readback-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const file=join(dir,'result.json');await writeFile(file,JSON.stringify(result));
 const url=new URL('../../build/code/src/validator/self_conformance_contracts.js',import.meta.url).href;
 const script=`import fs from 'node:fs';import assert from 'node:assert/strict';import {isSelfConformanceResult} from ${JSON.stringify(url)};const r=JSON.parse(fs.readFileSync(process.argv[1]));assert(isSelfConformanceResult(r));const id=r.resultDigest;assert.equal(r.ruleApplications.length,1);r.scope.surfaceGroups[0].memberRefs.pop();assert(!isSelfConformanceResult(r));console.log(JSON.stringify({originalDigest:id,changedRefused:true}));`;
 const output=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script,file],{encoding:'utf8'}));assert.equal(output.originalDigest,result.resultDigest);assert(output.changedRefused);
});

test('explicit justified inapplicability conserves singleton meaning and cannot erase a falsified obligation',async()=>{
 const f=fixture(),owner=await f.ownerModule();f.input.applications[0].applicability='inapplicable';f.judgments[3].raw.criteria[0].applicability='inapplicable';
 const result=owner.evaluateSelfConformance(f.input,f.owner);assert.equal(result.disposition,'passed');assert(result.findings.some(x=>x.diagnostic==='semantic_assessment_required'&&x.disposition==='inapplicable_with_reason'));
 f.judgments[3].raw.criteria[0].disposition='falsified';assert.equal(owner.evaluateSelfConformance(f.input,f.owner).disposition,'failed');
});

function roleAssessment(f,role){
 const a=clone(assessment(f)),c={criterionRef:'criterion://'+role,ruleRef:role==='catalog'?'group://rules':f.input.inventory.inventoryRef,surfaceRef:role==='catalog'?f.catalog.catalogRef:'group://surfaces',evidenceRole:role==='catalog'?'catalog_fidelity':'inventory_classification'};
 a.input.task.role.roleRef='qualification-role://abiogenesis/'+role+'@5';a.input.task.coverage=[c];a.input.plan.coverage=[c];a.input.plan.slots[0].coverage=[c];
 a.raw.criteria=[{...a.raw.criteria[0],...c}];return resign(a);
}
function promptScope(request){const label='SCOPE AND COMPUTED CORRESPONDENCE (C, not semantic satisfaction): ';return JSON.parse(request.prompt.split('\n\n').find(x=>x.startsWith(label)).slice(label.length));}
function reidentifyScope(a){a.input.task.scope=bodyIdentity(a.input.task.scope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');return resign(a);}

test('catalog renderer supplies complete selected-source rows across groups without repeating unrelated catalog declarations',async t=>{
 const f=fixture(3,3),q=await f.assessmentModule(),a=clone(roleAssessment(f,'catalog')),rows=f.catalog.rules;
 a.input.task.scope.ruleGroups=rows.map((r,i)=>({groupRef:'group://law/'+i,ruleRefs:[r.ruleRef],sourceRefs:[r.sourceRef]}));
 a.input.task.coverage[0].ruleRef='group://law/0';a.input.task.subjectMembers=[plainSource(f.sourceMembers[0])];reidentifyScope(a);
 assert(q.isQualificationAssessmentInput(a.input));const request=q.qualificationWorkerRequest(a.input),context=promptScope(request),selected=context.selectedSubject;
 const completeRows=rows.filter(r=>r.sourceRef===rows[0].sourceRef);
 assert.deepEqual(selected.catalogRows,completeRows);assert.equal(completeRows.length,2);
 assert.deepEqual(selected.catalogSourcePopulations,[{source:f.catalog.sources[0],ruleRefs:completeRows.map(r=>r.ruleRef)}]);
 assert.equal(context.ruleGroups.length,1);assert.equal(context.ruleGroups[0].ruleRefs.length,1,'one criterion group does not conceal its governing source other extraction');
 assert(request.prompt.includes(rows[2].governedClaim));assert(!request.prompt.includes(rows[1].governedClaim));
 assert(!a.input.task.material.some(m=>m.ref===f.catalog.catalogRef));assert(!request.prompt.includes('qualification_rule_catalog'));
 assert.deepEqual(selected.inventoryMembers,[f.input.inventory.members[0]]);
 for(const [name,change]of [
  ['foreign rule group',x=>{x.input.task.coverage[0].ruleRef='group://foreign';}],
  ['omitted published row from partition',x=>{x.input.task.scope.ruleGroups.pop();}],
  ['foreign source selection',x=>{x.input.task.scope.ruleGroups[0].sourceRefs=['source://foreign'];}],
 ]){const bad=clone(a);change(bad);reidentifyScope(bad);assert(!q.isQualificationAssessmentInput(bad.input),name);assert.throws(()=>q.qualificationWorkerRequest(bad.input),/invalid qualification assessment input/,name);}
 t.diagnostic(JSON.stringify({catalogTaskPromptBytes:Buffer.byteLength(request.prompt),selectedCriterionRules:1,providedCatalogRows:2,totalCatalogRows:3,fullCatalogBodies:0,scope:'actual renderer; source-completeness union under explicit catalog component premise'}));
});

test('catalog and rule prompts expose changed governed claims, evidence duties and source-span mappings; stale catalog refuses',async()=>{
 const original=fixture(),changed=fixture(3,2,c=>{const r=c.rules[0],source=authority.find(s=>s.ref===r.sourceRef),b=Buffer.from(source.contentBase64,'base64');r.governedClaim='visible changed duty';r.startByte=1;r.spanDigest=digest(b.subarray(1));r.requiredEvidenceRoles=['changed-duty-evidence'];});
 const oldOwner=await original.assessmentModule(),newOwner=await changed.assessmentModule();
 for(const role of ['catalog','rule']){
  const a=role==='rule'?assessment(original):roleAssessment(original,role),b=role==='rule'?assessment(changed):roleAssessment(changed,role);
  const oldRows=promptScope(oldOwner.qualificationWorkerRequest(a.input)).selectedSubject.catalogRows,newRequest=newOwner.qualificationWorkerRequest(b.input),newRows=promptScope(newRequest).selectedSubject.catalogRows;
  assert.equal(oldRows[0].governedClaim,'scoped-component-law-0');assert.equal(newRows[0].governedClaim,'visible changed duty');assert.equal(oldRows[0].startByte,0);assert.equal(newRows[0].startByte,1);assert.deepEqual(newRows[0].requiredEvidenceRoles,['changed-duty-evidence']);assert(newRequest.prompt.includes('visible changed duty'));
  assert(!newOwner.isQualificationAssessmentInput(a.input),'a task bound to old catalog cannot reuse changed owner rows');
 }
});

test('inventory renderer exposes per-member role and classification-evidence swaps despite identical bytes and group-role union',async()=>{
 const f=fixture(),q=await f.assessmentModule(),a=roleAssessment(f,'inventory'),b=clone(a),inventory=b.input.task.scope.inventory;
 [inventory.members[0].surfaceRoles,inventory.members[2].surfaceRoles]=[inventory.members[2].surfaceRoles,inventory.members[0].surfaceRoles];inventory.members[0].classificationEvidenceRefs=['classification://changed-original-source'];
 b.input.task.scope.inventory=bodyIdentity(inventory,'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 b.input.task.inventory=coord(b.input.task.scope.inventory.inventoryRef,b.input.task.scope.inventory.inventoryDigest);b.input.task.provenance.subjectInventory=b.input.task.inventory;b.input.task.coverage[0].ruleRef=b.input.task.inventory.ref;
 reidentifyScope(b);assert(q.isQualificationAssessmentInput(a.input));assert(q.isQualificationAssessmentInput(b.input));
 const old=promptScope(q.qualificationWorkerRequest(a.input)),changed=promptScope(q.qualificationWorkerRequest(b.input));
 assert.deepEqual(old.surfaceGroups,changed.surfaceGroups);assert.deepEqual(old.assessedMembers,changed.assessedMembers);
 assert.deepEqual(old.selectedSubject.inventoryMembers,f.input.inventory.members);assert.deepEqual(changed.selectedSubject.inventoryMembers,b.input.task.scope.inventory.members);
 assert.deepEqual(old.selectedSubject.inventoryMembers[0].surfaceRoles,['code']);assert.deepEqual(changed.selectedSubject.inventoryMembers[0].surfaceRoles,['proof']);assert.deepEqual(changed.selectedSubject.inventoryMembers[0].classificationEvidenceRefs,['classification://changed-original-source']);
 const bad=clone(b);bad.input.task.subjectMembers[0].ref='source://foreign';resign(bad);assert(!q.isQualificationAssessmentInput(bad.input));assert.throws(()=>q.qualificationWorkerRequest(bad.input),/invalid qualification assessment input/);
});


// Independent J and native evidence remain the labelled fixture premises above.
function domainFixture(split=2,size=4,refined=false){
 const f=fixture(size,2),scope=clone(f.input.scope);
 scope.ruleGroups=f.catalog.rules.map((r,i)=>({groupRef:'group://rule/'+i,ruleRefs:[r.ruleRef],sourceRefs:[r.sourceRef]}));
 const group=(ref,members)=>({groupRef:ref,memberRefs:members.map(m=>m.ref),rootRefs:scope.inventory.selectedRoots,
   surfaceRoles:[...new Set(members.flatMap(m=>m.surfaceRoles))],ownerRefs:['owner://component'],sourceRefs:[f.sourceMembers[0].ref]});
 const members=scope.inventory.members;
 scope.applicationDomains=[{ruleGroupRef:'group://rule/0',surfaceGroups:[...members.slice(0,split-1).map((m,i)=>group('domain://a/'+i,[m])),group('domain://a/rest',members.slice(split-1))]},
  {ruleGroupRef:'group://rule/1',surfaceGroups:[group('domain://b/all',members)]}];
 if(size===6){
  scope.surfaceGroups=(refined?[[0],[1],[2,3],[4,5]]:[[0,1],[2,3],[4,5]]).map((indices,i)=>group('classification://'+i,indices.map(j=>members[j])));
  scope.applicationDomains[0].surfaceGroups=[group('domain://a/first',members.slice(0,2)),group('domain://a/rest',members.slice(2))];
  scope.applicationDomains[1].surfaceGroups=[group('domain://b/first',members.slice(0,4)),group('domain://b/rest',members.slice(4))];
 }
 f.input.scope=bodyIdentity(scope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');f.scope=f.input.scope;
 f.judgments.length=0;f.input.qualification.proof.selections=[];f.input.applications=[];
 for(const r of scope.ruleGroups)f.judgment('catalog','catalog_fidelity',r.groupRef,f.catalog.catalogRef);
 for(const g of scope.surfaceGroups){
  const selected=f.sourceMembers.filter(m=>g.memberRefs.includes(m.ref));
  f.judgment('inventory','inventory_coverage',f.input.inventory.inventoryRef,g.groupRef,selected);
  f.judgment('inventory','inventory_classification',f.input.inventory.inventoryRef,g.groupRef,selected);
 }
 for(const d of scope.applicationDomains)for(const g of d.surfaceGroups){
  f.input.applications.push({ruleRef:d.ruleGroupRef,surfaceRef:g.groupRef,applicability:'applicable',premiseEvidenceRefs:[],evaluationEvidenceRefs:[],rulingEvidenceRefs:[]});
  f.judgment('rule','semantic_assessment',d.ruleGroupRef,g.groupRef,f.sourceMembers.filter(m=>g.memberRefs.includes(m.ref)));
 }
 f.judgment('tenant','tenant_realization','tenant',f.input.tenantManifest.manifestRef);
 f.judgment('coverage','behavioral_coverage','coverage://one','behavior://one');
 return f;
}
test('per-rule complete member domains preserve flat semantics and do not split unrelated rule work',async t=>{
 const measurements=[];
 for(const splits of [2,3]){
  const f=domainFixture(splits),q=await f.assessmentModule(),owner=await f.ownerModule(),out=owner.evaluateSelfConformance(f.input,f.owner);
  assert.equal(out.disposition,'passed',JSON.stringify(out.findings.filter(x=>x.disposition!=='passed')));
  assert.equal(out.ruleApplications.length,splits+1);assert.equal(out.ruleApplications.filter(a=>a.ruleRef==='group://rule/1').length,1);
  const a=clone(assessment(f)),c={...a.input.task.coverage[0],ruleRef:'group://rule/1',surfaceRef:'domain://b/all'};
  a.input.task.coverage=[c];a.input.plan.coverage=[c];a.input.plan.slots[0].coverage=[c];resign(a);
  assert(q.isQualificationAssessmentInput(a.input));const request=q.qualificationWorkerRequest(a.input),context=promptScope(request);
  assert.equal(context.surfaceGroups.length,1);assert.equal(context.surfaceGroups[0].ruleGroupRef,'group://rule/1');
  assert.deepEqual(context.selectedSubject.inventoryMembers,f.input.inventory.members);
  assert(!request.prompt.includes('domain://a/'));assert.equal(context.selectedSubject.catalogRows.length,1);
  measurements.push({splits,criteria:out.ruleApplications.length,promptBytes:Buffer.byteLength(request.prompt),memberBodies:a.input.task.material.length,assessedMembers:a.input.task.subjectMembers.length});
  f.populate(false);assert.equal(owner.evaluateSelfConformance(f.input,f.owner).disposition,out.disposition);
 }
 assert.equal(measurements[0].promptBytes,measurements[1].promptBytes);t.diagnostic(JSON.stringify({perRuleDomains:measurements,globalSplitRows:[4,6],claim:'actual owner/renderer; J/native premises supplied'}));
});
test('domain omission overlap foreign members and incomplete rule domains refuse; scoped J uncertainty survives',async()=>{
 for(const [name,mutate]of [
  ['missing domain',f=>f.input.scope.applicationDomains.pop()],
  ['missing member',f=>f.input.scope.applicationDomains[0].surfaceGroups[1].memberRefs.pop()],
  ['overlap',f=>f.input.scope.applicationDomains[0].surfaceGroups[1].memberRefs.push(f.sourceMembers[0].ref)],
  ['foreign',f=>f.input.scope.applicationDomains[0].surfaceGroups[1].memberRefs.push('source://foreign')],
  ['foreign role',f=>f.input.scope.applicationDomains[0].surfaceGroups[0].surfaceRoles=['proof']],
  ['foreign rule',f=>f.input.scope.applicationDomains[1].ruleGroupRef='rule://foreign'],
 ]){const f=domainFixture();f.input=clone(f.input);mutate(f);f.input.scope=bodyIdentity(f.input.scope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/');const out=(await f.ownerModule()).evaluateSelfConformance(f.input,f.owner);assert.notEqual(out.disposition,'passed',name);}
 for(const [grouping,disposition,expected] of [['unknown','indeterminate','blocked_incomplete'],['falsified','falsified','failed']]){
  const f=domainFixture(),j=f.judgments.find(j=>j.task.role.roleRef.endsWith('/rule@5'));Object.assign(j.raw.criteria[0],{grouping,disposition});
  assert.equal((await f.ownerModule()).evaluateSelfConformance(f.input,f.owner).disposition,expected);
 }
});

test('six-member discriminator keeps four rule domains when unrelated classification refinement would grow six global pairs to eight',async t=>{
 const measurements=[];
 for(const refined of [false,true]){
  const f=domainFixture(2,6,refined),owner=await f.ownerModule(),q=await f.assessmentModule(),result=owner.evaluateSelfConformance(f.input,f.owner);
  assert.equal(result.disposition,'passed');assert.equal(result.ruleApplications.length,4);
  for(const d of f.scope.applicationDomains)assert.deepEqual(d.surfaceGroups.flatMap(g=>g.memberRefs).sort(),f.sourceMembers.map(m=>m.ref).sort());
  const a=clone(assessment(f)),c={...a.input.task.coverage[0],ruleRef:'group://rule/0',surfaceRef:'domain://a/first'};
  a.input.task.subjectMembers=f.sourceMembers.slice(0,2).map(plainSource);a.input.task.coverage=[c];a.input.plan.coverage=[c];a.input.plan.slots[0].coverage=[c];resign(a);
  const request=q.qualificationWorkerRequest(a.input),context=promptScope(request);
  assert.equal(context.selectedSubject.inventoryMembers.length,2);assert.equal(context.surfaceGroups.length,1);
  measurements.push({globalClassifications:f.scope.surfaceGroups.length,globalPairs:f.scope.surfaceGroups.length*2,actualRuleCriteria:result.ruleApplications.length,coveredMemberRelations:12,selectedPromptBytes:Buffer.byteLength(request.prompt)});
 }
 assert.equal(measurements[0].selectedPromptBytes,measurements[1].selectedPromptBytes);t.diagnostic(JSON.stringify({actualOwnerDiscriminator:measurements,claim:'C conservation and representation; supplied J/native premises'}));
});
