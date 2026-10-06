/** Pure external construction through unchanged exact C02 owners. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const D=path.dirname(fileURLToPath(import.meta.url)),G=path.dirname(D);
const C=path.join(G,'final-candidate-construction-02'),I=path.join(C,'install/node_modules/@abiogenesis/typescript-tenant');
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(name,value)=>fs.writeFileSync(path.join(D,name),JSON.stringify(value,null,2)+'\n');
const must=(ok,why)=>{if(!ok)throw new TypeError(why);};
const acquired=[];
function exact(p,bytes,sha){const b=fs.readFileSync(p);must(b.length===bytes&&digest(b)==='sha256:'+sha,'consumed frozen record differs: '+p);acquired.push({path:p,bytes:b.length,sha256:sha});return JSON.parse(b);}
const declarations=exact(path.join(G,'final-f11-native-assessment-01/assessment-declarations.json'),24097396,'082d375da305a51c0da70fe4c5d1a925d43b9aab1446d6cf72125da982576276');
exact(path.join(G,'final-f11-native-assessment-01/assessment-view.json'),9990,'a5a84a347de403636ca140e7547190a57d5a24ddd7879d6f0256f8491cf77404');
exact(path.join(G,'final-f11-native-assessment-01/assessment-program.json'),67129,'71f653b8cc07ca35889ae0514569fda4490f29507e2b86ac9a186d177b0d0ace');
const cf=read(path.join(C,'freeze.json'));
for(const name of ['validator/qualification.js','validator/qualification_contracts.js','shared/digests.js','shared/canonical_json.js','gtl/self_conformance.js']){
 const rel='install/node_modules/@abiogenesis/typescript-tenant/build/code/src/'+name,row=cf.records.find(r=>r.path===rel),b=fs.readFileSync(path.join(C,rel));
 must(row!==undefined&&b.length===row.bytes&&digest(b)==='sha256:'+row.sha256,'exact C02 owner differs');acquired.push({path:path.join(C,rel),bytes:b.length,sha256:row.sha256});
}
const binder=await import(pathToFileURL(path.join(G,'final-f11-material-selection-02/bind-assessment-input.mjs')));
const {contracts,owner,catalog,basisTemplate}=binder;
const require=createRequire(path.join(I,'package.json')),v=require('valibot');
const dg=await import(pathToFileURL(path.join(I,'build/code/src/shared/digests.js')));
const {QUALIFICATION_IDS:q}=await import(pathToFileURL(path.join(I,'build/code/src/gtl/self_conformance.js')));
const hash=dg.sha256Canonical,same=(a,b)=>hash(a)===hash(b),coord=(ref,digest)=>({ref,digest});
const runtime=read(path.join(D,'runtime-facts.json'));
v.parse(contracts.QUALIFICATION_PREFIX_SCHEMA,runtime.prefix);
const handoff=read(path.join(G,'final-observed-c2-01/final-handoff.json'));
must(same(handoff.prefix,runtime.prefix),'full typed retained handoff differs');
must(runtime.prefix.coordinateDigest==='sha256:81cefea619af712a416d8680efa40fc2bed1f3248460022e4e625eef0ed46c0c'&&runtime.prefix.prefixDigest==='sha256:e2bb5df3f58b91a49f7324a487e9e79b93d05b03c368c339c82a6edc9d359ec0','coordinate/prefix digest roles differ');
const tenant=contracts.constructQualificationIdentity(read(path.join(D,'tenant-body.json')),'manifestRef','manifestDigest','tenant-conformance://abiogenesis/');
v.parse(contracts.TENANT_CONFORMANCE_MANIFEST_SCHEMA,tenant);
must(tenant.claims.length>0&&new Set(tenant.claims.map(c=>c.claimRef)).size===tenant.claims.length,'tenant claim declarations differ');
for(const c of tenant.claims){const row=runtime.install.capabilityDefinitionGraph.rows.find(r=>r.capabilityId===c.capabilityRef);must(row!==undefined,'tenant declared capability not owned');
 for(const ref of c.publicContractRefs)must(runtime.install.publicContracts.filter(p=>p.contractId===ref&&p.owningProduct===runtime.install.productId&&p.capabilityIdentities.includes(row.capabilityId)).length===1,'tenant Public ownership differs');
 must(c.evidenceRefs.length>0,'tenant declaration needs actual published evidence refs');}
must(same(tenant.capabilityDefinitionGraph,coord(runtime.install.capabilityDefinitionGraph.graphId,runtime.install.capabilityDefinitionGraph.graphDigest))&&same(tenant.publicContractCatalog,coord(runtime.install.catalogId,runtime.install.catalogDigest)),'tenant installed coordinates differ');
save('tenant-manifest.json',tenant);
const basis=contracts.constructQualificationIdentity({...basisTemplate,
 installedProduct:coord(runtime.install.installId,hash(runtime.install)),workspaceBinding:coord(runtime.workspaceBinding.bindingId,runtime.workspaceBinding.bindingDigest),
 tenantManifest:coord(tenant.manifestRef,tenant.manifestDigest)},'basisRef','basisDigest','qualification-basis://abiogenesis/');
v.parse(contracts.EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,basis);
must(contracts.qualificationIdentity(basis,'basisRef','basisDigest','qualification-basis://abiogenesis/'),'actual basis identity differs');
must(basis.productId===runtime.install.productId&&basis.productContentDigest===runtime.install.productContentDigest&&basis.artifact.digest===runtime.install.artifactDigest&&basis.productManifest.digest===runtime.install.manifestDigest,'actual native installed subject differs');
save('basis.json',basis);
const pb=read(path.join(D,'provenance-body.json'));
const provenance={...pb,recordSet:coord('external-record-set://abiogenesis/'+hash(pb.records).slice(7),hash(pb.records))};
v.parse(contracts.QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA,provenance);
save('provenance.json',provenance);
const policy=contracts.QUALIFICATION_ROLE_POLICY;
const role={roleRef:'qualification-role://abiogenesis/rule@5',authorityRef:policy.authorityRef,
 sourceBindings:policy.authoritySourceRefs.map(ref=>{const s=catalog.sources.find(s=>s.ref===ref);must(s!==undefined,'published authority source absent');return s;}),
 actorRef:policy.actorRefs[0],workerBindingRef:policy.workerBindingRef,rendererRef:policy.rendererRef,
 materializationPlanRef:policy.materializationPlanRef,independence:'author_distinct'};
save('role.json',role);
const sourceBodies=binder.loadBodyInput();
const ruleSourceRef=claim=>{const rows=catalog.rules.filter(r=>r.governedClaim===claim);must(rows.length===1,'published proof/source relation differs: '+claim);return rows[0].sourceRef+'#'+rows[0].governedClaim;};
const constructorRelative='build_tenants/abiogenesis/typescript/code/src/validator/qualification.ts';
const constructorRecord=cf.records.find(r=>r.path==='staged-repo/'+constructorRelative);
must(constructorRecord!==undefined,'exact constructor source is absent');
const constructorBytes=fs.readFileSync(path.join(C,constructorRecord.path));
must(constructorBytes.length===constructorRecord.bytes&&digest(constructorBytes)==='sha256:'+constructorRecord.sha256,'exact constructor source differs');
must(typeof owner.constructQualificationJudgment==='function'&&constructorBytes.toString('utf8').includes('export function '+owner.constructQualificationJudgment.name+'('),'actual exported constructor/source relation differs');
acquired.push({path:path.join(C,constructorRecord.path),bytes:constructorRecord.bytes,sha256:constructorRecord.sha256});
const constructorRef='repo://abiogenesis/'+constructorRelative+'#'+owner.constructQualificationJudgment.name;
const outputContractRefs=[q.assessmentRaw,q.judgment];
const publishedContracts=declarations.flatMap(d=>d.catalog.boundPublications.filter(p=>p.owningProductId===basis.productId).flatMap(p=>p.contracts));
for(const ref of outputContractRefs)must(publishedContracts.some(c=>c.contractRef===ref),'actual AssetSurface output publication is absent: '+ref);
const proofObligationRefs=['REQ-P-SELF-CONFORMANCE-008','REQ-P-QUAL-064A'].map(ruleSourceRef);
const assetSurface={kind:'qualification_assessment',requiredContexts:[sourceBodies.context.contextRef],
 standardsRefs:[ruleSourceRef('REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL-015B')],
 outputContractRefs,constructorRef,
 rendererRef:policy.rendererRef,proofObligationRefs,
 authoritySlots:[{authorityKindRef:role.authorityRef,disposition:'normal',fallbackPreconditionRefs:[]}]};
save('asset-surface-owner-relations.json',{constructorRef,constructorSource:acquired.at(-1),rendererRef:policy.rendererRef,
 outputContractRefs,outputPublicationOwner:'QUALIFICATION_IDS + retained native catalog.boundPublications.contracts',
 proofObligationRefs,proofSourceOwner:'exact immutable C02 rule catalog governedClaim/sourceRef',standardsRefs:assetSurface.standardsRefs});
const residuals=[
 'residual://abiogenesis/final-f11-bound-assessment-01/inherited-semantic-authorship-unestablished',
 'residual://abiogenesis/final-f11-bound-assessment-01/historical-author-grant-capability-correspondence-unassessed',
 'residual://abiogenesis/final-f11-bound-assessment-01/actual-native-assessor-independence-unadmitted',
 'residual://abiogenesis/final-f11-bound-assessment-01/tenant-realization-adequacy-unassessed',
 'residual://abiogenesis/final-f11-bound-assessment-01/eight-other-015B-responsibilities-unassessed',
 'residual://abiogenesis/final-f11-bound-assessment-01/no-current-successful-C2-or-full-F11-AF22'];
// These are actual peer-constructed published declaration proofs; no fabricated
// event, observed J, response, native grant or already-green outcome is added.
const task=binder.bindTask({basis,provenance,role,assetSurface,declarations,
 slotRef:'qualification-slot://abiogenesis/final-f11-bound-assessment-01/015B-composition-frame-hosts',taskOrdinal:0,
 priorEvidenceRefs:[],residuals});
const plan=contracts.constructQualificationIdentity({kind:'qualification_assessment_plan',subjectBasis:coord(basis.basisRef,basis.basisDigest),lawBasis:basis.lawBasis,
 slots:[{slotRef:task.slotRef,task:coord(task.taskRef,task.taskDigest),taskOrdinal:task.taskOrdinal,
 graphFunctionRef:q.assessGraph,programLocusRef:'node://abiogenesis/qualification/assess@5',role,coverage:task.coverage}],
 coverage:task.coverage,sharedCoverage:'disjoint',ownerAuthorityRef:role.authorityRef,ownerActorRef:runtime.workspaceBinding.authorizedActorRef},
 'planRef','planDigest','qualification-plan://abiogenesis/');
v.parse(contracts.QUALIFICATION_ASSESSMENT_PLAN_SCHEMA,plan);
must(owner.qualificationPlanMatches(plan),'actual finite plan correspondence differs');
const input={kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
must(owner.isQualificationAssessmentInput(input),'actual input fails unchanged owner');
save('task.json',task);save('plan.json',plan);save('assessment-input.json',input);
const request=binder.materializeWorkerRequest(task,plan);
save('worker-request.json',request);fs.writeFileSync(path.join(D,'prompt.txt'),request.prompt);
save('response-schema.json',request.responseJsonSchema);
const sections=request.prompt.split('\n\n');
const measurements={actualOwner:'qualificationWorkerRequest',task:coord(task.taskRef,task.taskDigest),plan:coord(plan.planRef,plan.planDigest),
 requestDigest:hash(request),promptDigest:hash(request.prompt),promptByteSHA256:digest(Buffer.from(request.prompt)),
 promptUTF8Bytes:Buffer.byteLength(request.prompt),responseSchemaCanonicalDigest:hash(request.responseJsonSchema),
 requestCanonicalDigest:hash(request),providedSourceBodies:task.material.length,providedHosts:task.subjectMembers.length,
 unprovidedAssessedMemberRefs:task.subjectMembers.filter(m=>!task.material.some(s=>s.ref===m.ref)).map(m=>m.ref),
 sections:sections.map((s,n)=>({ordinal:n,kind:s.startsWith('SOURCE DATA ')?'SOURCE DATA':s.split(':')[0].slice(0,150),utf8Bytes:Buffer.byteLength(s)})),
 sectionsTotalWithSeparators:sections.reduce((n,s)=>n+Buffer.byteLength(s),0)+2*(sections.length-1),
 attributionRecords:provenance.records.length,attributionRawBytes:provenance.records.reduce((n,r)=>n+r.byteCount,0),
 limits:'This is a complete actual owner render, not a provider/model capacity acceptance or independent semantic assessment.'};
must(measurements.sectionsTotalWithSeparators===measurements.promptUTF8Bytes,'complete section measurement differs');
save('prompt-measurement.json',measurements);
let crossed='';
const crossedBasis=contracts.constructQualificationIdentity({...basis,productContentDigest:'sha256:'+'0'.repeat(64)},'basisRef','basisDigest','qualification-basis://abiogenesis/');
try{binder.bindScope(crossedBasis);}catch(e){crossed=String(e.message);}
must(crossed.includes('basis differs from C02/Q02: productContentDigest'),'crossed genuine Product basis was not refused at expected owner');
// Pure finite provenance discriminator. This is explicitly not a constructed
// native judgment or an attribution assertion. Empty assertions must remain
// insufficient once exact byte/chain coverage is structurally valid.
const attributionDiagnostic=owner.projectExternalConstructionAttribution({task,raw:{attributions:[]}},plan);
save('structural-attribution-diagnostic.json',{kind:'pure_structural_diagnostic_not_native_J',actual:attributionDiagnostic,
 rawAttributionAssertions:0,wholeJudgmentConstructed:false,expected:'insufficient',limits:'No attribution sufficiency, source authority or native independence is supplied by this diagnostic.'});
must(attributionDiagnostic.status==='insufficient','truthful provenance representation fails existing finite owner: '+attributionDiagnostic.status);
save('owner-checks.json',{status:'passed',basisShapeIdentityAndExactInstalledCorrespondence:true,tenantExactOwnedCoordinates:true,
 roleMaterialScopeAssetCorrespondence:true,actualTaskPlanInput:true,fullTypedRetainedHandoff:true,
 actualAssetOutputPublicationRelation:true,actualConstructorSourceRelation:true,actualPublishedProofSourceRelations:true,
 exactCoordinateDigest:runtime.prefix.coordinateDigest,exactPrefixDigest:runtime.prefix.prefixDigest,
 crossedBasis:{refused:true,boundary:crossed},structuralAttribution:attributionDiagnostic.status,
 independentAttributionAssessment:false,nativeCalls:0,providerCalls:0});
save('native-dependency-inputs.json',{records:acquired});
console.log(JSON.stringify({status:'candidate_ready',basis:basis.basisRef,task:task.taskRef,plan:plan.planRef,promptUTF8Bytes:measurements.promptUTF8Bytes,
 suppliedWholeBodies:task.material.length,selectedHosts:task.subjectMembers.length,structuralAttribution:attributionDiagnostic.status,
 nativeCalls:0,independentJudgment:false}));
