// Two-request construction discriminator only. No full projection, provider, native Run or semantic judgment.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
const record=fileURLToPath(new URL('.',import.meta.url));
const repo=resolve(record,'../../../..'),tenant=join(repo,'build_tenants/abiogenesis/typescript');
const b=await import(pathToFileURL(join(tenant,'test_env/qualification/build-resources.mjs')));
const a=await import(pathToFileURL(join(tenant,'test_env/qualification/assessment-plan.mjs')));
const p=await import(pathToFileURL(join(tenant,'test_env/qualification/provenance.mjs')));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const git=(...args)=>execFileSync('git',args,{cwd:repo,maxBuffer:20*1024*1024}).toString();
assert.equal(git('diff','--name-only','HEAD','--','build_tenants/abiogenesis/typescript').trim(),'','freeze implementation first');
const head=git('rev-parse','HEAD').trim(),baseline='082c5807e31bd2f0f79111bd6e88558246dfa61d';
const prior=await read(join(repo,'.ai-workspace/comments/codex/20261029T130722Z_RP2_QUALIFICATION_READINESS/projection.json'));
const saved=await read(prior.retainedInput.path),q=await b.installedExports(tenant),hash=q.product.sha256Canonical;
assert.equal(hash(saved.input),saved.inputDigest);
const declaration=await b.classification(),inventory=await b.constructInventory(q,declaration),law=await b.lawAndCoverage(q);
const basis=await read(join(saved.sourceArchive,'resources/basis.json')),manifest=await read(join(saved.sourceArchive,'resources/tenant-manifest.json'));
const coordinates={inventory,catalog:law.catalog,catalogDigest:law.catalogDigest,subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:law.lawBasis};
const {scope,errors}=b.constructScope(q,declaration,coordinates);assert.deepEqual(errors,[]);
const oldDeclaration=JSON.parse(git('show',baseline+':build_tenants/abiogenesis/typescript/test_env/qualification/classification.json'));
const beforeScope=b.constructScope(q,oldDeclaration,coordinates);assert.deepEqual(beforeScope.errors,[]);
const chains=p.constructChains(p.chainCommits(head),q.preparation.QUALIFICATION_ROLE_POLICY.authorityRef);
const provenance=p.constructProvenance(q.product,{inventory,...chains});
const materials=saved.invoking.manifests.flatMap(m=>m.entries.filter(e=>e.entryKind==='material').map(e=>e.value));
const executionMaterial=materials.find(m=>m.ref.startsWith('result://abiogenesis/t287/d5c/measured-stand-in/'));
const verificationMaterial=materials.find(m=>m.ref.startsWith('qualification-verification-material://'));
const catalog=await read(join(saved.sourceArchive,'resources/catalog.json')),programs=await read(join(saved.sourceArchive,'qualification-programs.json'));
const catalogView=q.product.narrowGraphFunctionCatalog(catalog,programs.allowlist),declarationProof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView};
assert.equal(hash(catalog),programs.catalogDigest);assert.equal(hash(catalogView),programs.viewDigest);
const base=await a.constructAssessmentMaterial(q,{declaration,inventory,law,tenant:manifest,basis,scope,provenance,declarationProof,executionMaterial,verificationMaterial});
const selection=await a.materialSelection(),specified=a.constructSlotSpecifications(q,base,selection);
// Execute the exact old specification/packing algorithm with retained calibration lengths; no old prompt renders.
const scratch=await mkdtemp(join(tmpdir(),'t287-material-allocation-'));
const oldSource=git('show',baseline+':build_tenants/abiogenesis/typescript/test_env/qualification/assessment-plan.mjs')
 .replaceAll("'./build-resources.mjs'",JSON.stringify(pathToFileURL(join(tenant,'test_env/qualification/build-resources.mjs')).href))
 .replaceAll("'./provenance.mjs'",JSON.stringify(pathToFileURL(join(tenant,'test_env/qualification/provenance.mjs')).href));
const oldPath=join(scratch,'assessment-before.mjs');await writeFile(oldPath,oldSource);const old=await import(pathToFileURL(oldPath));
const oldBase={...base,declaration:oldDeclaration,scope:beforeScope.scope,
 domains:b.constructApplicationDomains(oldDeclaration,{inventory,ruleGroups:beforeScope.scope.ruleGroups,surfaceGroups:beforeScope.scope.surfaceGroups})};
const original=old.constructSlotSpecifications(q,oldBase,selection);let calibrationIndex=0;
// Historical calibration tasks are never admitted or rendered: only allocation order is compared.
oldBase.resource={ref:'qualification-resource://allocation-only',digest:hash('allocation-only')};
oldBase.provenanceEntries=new Map(original.ruleKeys.map(k=>[a.subjectKey(k.memberRefs),
 {coordinate:{ref:'qualification-provenance://allocation-only',digest:hash('allocation-only')}}]));
const cachedQ={...q,preparation:{...q.preparation,prepareQualificationAssessment:()=>({request:{prompt:' '.repeat(prior.calibration[calibrationIndex++].probeBytes)}})}};
old.packRuleRole(cachedQ,oldBase,original,selection,{ownerActorRef:'actor://abiogenesis/product-owner'});
assert.equal(calibrationIndex,prior.calibration.length);
const criteria=s=>[...s.criteria.values()].flat().sort((x,y)=>x.criterionRef.localeCompare(y.criterionRef));
const beforeCriteria=criteria(original),afterCriteria=criteria(specified);assert.deepEqual(afterCriteria,beforeCriteria);assert.equal(afterCriteria.length,5831);
const domains=scope=>scope.applicationDomains.map(d=>({...d,surfaceGroups:d.surfaceGroups.map(({sourceRefs,...g})=>g)}));
assert.deepEqual(domains(scope),domains(beforeScope.scope));assert.deepEqual(scope.surfaceGroups,beforeScope.scope.surfaceGroups);
const beforeApplications=b.constructApplications(oldDeclaration,oldBase.domains),afterApplications=b.constructApplications(declaration,base.domains);
assert.deepEqual(afterApplications,beforeApplications);
const pairs=[
 {beforeKey:'rule/complement/design/43',key:'complement/design/evidence/diagnosed-design-complement-argument'},
 {beforeKey:'rule/manifest/product-toolchain-manifest.json/0',key:'manifest/product-toolchain-manifest.json/evidence/diagnosed-generated-toolchain-manifest-definition'},
];
specified.specs.splice(0);specified.ruleKeys=specified.ruleKeys.filter(k=>pairs.some(x=>x.key===k.key));assert.equal(specified.ruleKeys.length,2);
const built=a.acquireAssessmentResources(q,base,specified);
const calibration=a.packRuleRole(q,built,specified,selection,{ownerActorRef:'actor://abiogenesis/product-owner'});
assert.equal(calibration.length,2);assert.equal(specified.specs.length,2);
const preparedPlan=a.constructPlan(q,built,specified.specs,'actor://abiogenesis/product-owner'),rows=[];
const expand=(value,context)=>{
 if(Array.isArray(value))return value.map(v=>expand(v,context));
 if(value===null||typeof value!=='object')return value;
 if(value.memberTable==='selectedSubject.inventoryMembers')return value.ordinals.map(n=>{const m=context.selectedSubject.inventoryMembers[n];assert(m);return value.projection==='ref'?m.ref:{ref:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount};});
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,expand(v,context)]));
};
const reidentify=input=>{const {taskRef,taskDigest,...body}=input.task;input.task=q.preparation.constructQualificationIdentity(body,'taskRef','taskDigest','qualification-task://abiogenesis/');
 const {planRef,planDigest,...plan}=input.plan;plan.slots=plan.slots.map(s=>s.slotRef===input.task.slotRef?{...s,task:{ref:input.task.taskRef,digest:input.task.taskDigest}}:s);
 input.plan=q.preparation.constructQualificationIdentity(plan,'planRef','planDigest','qualification-plan://abiogenesis/');return input;};
for(const [n,slot]of specified.specs.entries()){
 const pair=pairs.find(x=>slot.key==='rule/'+x.key+'/0');assert(pair,slot.key);
 const previous=original.specs.find(s=>s.key===pair.beforeKey);assert(previous);assert.deepEqual(slot.coverage,previous.coverage);
 const input=preparedPlan.inputs[n],prepared=q.preparation.prepareQualificationAssessment(input,built.acquired),view=q.deep.qualificationResources.resolveQualificationAssessment(input,built.acquired);
 const prompt=prepared.request.prompt,paragraphs=prompt.split('\n\n'),parse=label=>JSON.parse(paragraphs.find(x=>x.startsWith(label)).slice(label.length));
 const context=parse('SCOPE AND COMPUTED CORRESPONDENCE (C, not semantic satisfaction): '),expanded=expand(context,context);
 assert.deepEqual(expanded.assessedMembers,view.task.subjectMembers);
 assert.deepEqual(context.selectedSubject.inventoryMembers,inventory.members.filter(m=>slot.subjectRefs.includes(m.ref)));
 const construction=expand(parse('CONSTRUCTION ATTRIBUTION (assess; do not blindly trust): '),context);
 assert.deepEqual(construction.chains,view.task.provenance.chains);
 assert.deepEqual(construction.records,view.task.provenance.records.map(({contentBase64,...m})=>m));
 for(const span of construction.providedAttributionSpans){const m=view.task.provenance.records.find(m=>m.ref===span.sourceRef);assert.equal(span.text,Buffer.from(m.contentBase64,'base64').subarray(span.startByte,span.endByte).toString('utf8'));}
 const selected=declaration.evidenceSelections.find(e=>slot.key.includes('/evidence/'+e.id+'/')),evidence=selected.sourceRefs[0];assert(view.task.material.some(m=>m.ref===evidence));
 const missing=structuredClone(input);missing.task.material=missing.task.material.filter(m=>m.entry.ref!==evidence);missing.task.context.members=missing.task.context.members.filter(m=>m.memberRef!==evidence);missing.task.context.inventoryDigest=hash(missing.task.context.members);
 let missingDiagnostic,crossedDiagnostic;
 assert.throws(()=>q.preparation.prepareQualificationAssessment(reidentify(missing),built.acquired),error=>{missingDiagnostic=error.message;return true;});
 const crossed=structuredClone(input);crossed.task.material.find(m=>m.entry.ref===evidence).entry.digest=hash('crossed-evidence');
 assert.throws(()=>q.preparation.prepareQualificationAssessment(reidentify(crossed),built.acquired),error=>{crossedDiagnostic=error.message;return true;});
 const bytes=Buffer.byteLength(prompt),bound=a.slotPromptBound(slot);assert(bytes<=bound,slot.key+' over bound');
 const priorRow=prior.rows.find(r=>r.slotRef.endsWith('/'+pair.beforeKey));
 rows.push({beforeKey:pair.beforeKey,key:slot.key,before:{bytes:priorRow.promptBytes,promptDigest:priorRow.promptDigest},after:{bytes,promptDigest:b.sha256(Buffer.from(prompt)),inputDigest:hash(input),taskDigest:input.task.taskDigest},bound,
 criteria:slot.coverage,subjectMembers:slot.subjectRefs.length,sourceRefs:slot.materialRefs,fullDeclarationsReconstructed:true,attributionChainsReconstructed:true,originalSpansPreserved:true,missingDiagnostic,crossedDiagnostic,
 scopeBytes:Buffer.byteLength(paragraphs.find(x=>x.startsWith('SCOPE AND COMPUTED CORRESPONDENCE'))),attributionBytes:Buffer.byteLength(paragraphs.find(x=>x.startsWith('CONSTRUCTION ATTRIBUTION'))),responseSchemaBytes:Buffer.byteLength(q.product.canonicalJson(prepared.request.responseJsonSchema))});
}
const result={kind:'t287_two_request_material_discriminator',head,baseline,qualification:false,providerCalls:0,nativeRuns:0,fullProjection:false,
 basis:'stdo://releases/v3.0.2/',manifestSha256:'f7f3f824ee1ac3e048d1b1ea86ce3aae84866e2e9d5010fe5eda2e38e12f4477',
 invariants:{criteria:afterCriteria.length,criterionDigest:hash(afterCriteria),beforeCriterionDigest:hash(beforeCriteria),exactCriterionIdentities:true,exactMemberRoleRootDomains:true,exactApplicabilityDeclarations:true,globalSurfaceGroupsUnchanged:true,ruleApplications:afterApplications.length},rows,
 limits:['Retained RP-1 basis/declaration/tenant coordinates and D5-c measured C2 stand-ins are structural measurement context only.','Two diagnosed requests only; all other slots and semantic sufficiency remain unverified.','Attribution/contributor semantics unchanged; no independence qualification or contributor-union closure.','Prompt bytes exclude separate schema, host and transport context; no actual token count or cost claim.','Generator evidence and a derivation argument do not establish semantic compliance or authenticated output reproduction.']};
await writeFile(join(record,'measurements.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
