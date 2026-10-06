// Complete external F11 data authorer. Imports and construction have no Runtime effects.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {deriveResourcePacket} from './prepare-resources.mjs';
import {normalizeQualificationScopeAssertion} from './scope-authoring.mjs';
const report=dirname(dirname(fileURLToPath(import.meta.url))),read=async p=>JSON.parse(await readFile(p,'utf8'));
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const coord=x=>({ref:x.ref,digest:x.digest}),source=m=>({ref:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount});
const unique=xs=>[...new Set(xs)];
async function pinned(row){const b=await readFile(row.path);assert.equal(b.length,row.bytes);assert.equal(digest(b),'sha256:'+row.sha256);return b;}
async function currentInputs(){
 const selected=await read(join(report,'candidate-binding.json'));
 assert.equal(selected.kind,'current_accepted_C06_preparation_binding');
 await pinned(selected.acceptance);await pinned(selected.constructionFreeze);await pinned(selected.sourceFreeze);
 const [inventory,origins,authorship,historicalPin,law,catalog,coverageCatalog,productManifest,aliases,aliasContextBytes]=await Promise.all([
  read(join(report,'qualification-inventory.json')),read(join(report,'inventory-origin-correspondence.json')),
  read(join(report,'f11/source-authorship-records.json')),read(join(report,'f11/historical-partition-preimage-pin.json')),
  pinned(selected.law).then(b=>JSON.parse(b)),pinned(selected.catalog).then(b=>JSON.parse(b)),
  pinned(selected.coverage).then(b=>JSON.parse(b)),pinned(selected.productManifest).then(b=>JSON.parse(b)),
  read(join(report,'f11/member-alias-trace.json')),readFile(join(report,'f11/member-alias-context.json'))]);
 const expanded=gunzipSync(await readFile(join(report,'f11/historical-partition-preimage.json.gz')));
 assert.equal(expanded.length,historicalPin.expandedBytes);assert.equal(digest(expanded),historicalPin.expandedSHA256);
 return {selected,inventory,origins,authorship,historical:JSON.parse(expanded),law,catalog,coverageCatalog,productManifest,aliases,aliasContextBytes};
}
export function assertMaterialRoleAliases(aliases,inventory,catalog){
 assert.equal(aliases.aliasCount,95,'material_member_alias_bijection_incomplete');
 assert.equal(aliases.bijection.length,95,'material_member_alias_bijection_incomplete');
 const physical=new Map(inventory.members.map(m=>[m.ref,m])),governing=new Map(catalog.sources.map(s=>[s.ref,s]));
 assert.equal(new Set(aliases.bijection.map(x=>x.originalRef)).size,95,'material_member_alias_bijection_incomplete');
 assert.equal(new Set(aliases.bijection.map(x=>x.qualifiedMemberRef)).size,95,'material_member_alias_bijection_incomplete');
 for(const row of aliases.bijection){
  const member=physical.get(row.qualifiedMemberRef),authority=governing.get(row.originalRef);
  assert.ok(member&&authority&&!physical.has(row.originalRef),'material_member_alias_bijection_incomplete');
  assert.deepEqual(source(member),{...source(row.physicalMember),ref:row.qualifiedMemberRef},'physical_member_tuple_changed');
  assert.deepEqual(authority,row.canonicalGoverningSource,'governing_material_tuple_changed');
  assert.equal(member.digest,authority.digest);assert.equal(member.byteCount,authority.byteCount);
  assert.notEqual(member.path,authority.path,'physical_and_governing_path_roles_conflated');
 }
 return new Map(aliases.bijection.map(x=>[x.originalRef,x.qualifiedMemberRef]));
}
/** Preserve retained ordered declaration partitions; append current additions explicitly.
 * Changed/new groups are ordinary declared assertion data with unknown adequacy. */
function currentScope({inventory,catalog,historical,origins,aliases},basis,identity,hash){
 const members=new Map(inventory.members.map(m=>[m.ref,m])),currentRules=new Map(catalog.rules.map(r=>[r.ruleRef,r])),origin=new Map(origins.map(x=>[x.ref,x]));
 const translated=new Map(aliases.bijection.map(x=>[x.originalRef,x.qualifiedMemberRef])),physicalRef=ref=>translated.get(ref)??ref;
 const base='scope-group://abiogenesis/q07/';
 const group=(rows,name,prior)=>{
  assert.ok(rows.length);const refs=rows.map(m=>m.ref),validSources=new Set([...members.keys(),...catalog.sources.map(s=>s.ref)]);
  const roots=inventory.selectedRoots.filter(root=>refs.some(ref=>ref.startsWith(root)));
  const roleRefs=unique(rows.flatMap(m=>m.surfaceRoles));
  const owners=prior?.ownerRefs?.length?prior.ownerRefs:unique(rows.map(m=>origin.get(m.ref)?.sourceAuthor??'source-author://abiogenesis/unresolved'));
  const sources=prior?.sourceRefs?.map(physicalRef).filter(ref=>validSources.has(ref))??[];
  return {groupRef:base+name,memberRefs:refs,rootRefs:roots,surfaceRoles:roleRefs,ownerRefs:owners,sourceRefs:sources.length?sources:[refs[0]]};
 };
 const adapt=(prior,name)=>{
  const retained=prior.map((g,n)=>{const translatedRefs=g.memberRefs.map(physicalRef),rows=translatedRefs.flatMap(ref=>members.has(ref)?[members.get(ref)]:[]);return rows.length?group(rows,name+'/retained/'+n,g):null;}).filter(Boolean);
  const used=new Set(retained.flatMap(g=>g.memberRefs)),additions=new Map();
  for(const m of inventory.members)if(!used.has(m.ref)){const key=m.surfaceRoles.join('|');if(!additions.has(key))additions.set(key,[]);additions.get(key).push(m);}
  for(const [key,rows]of additions)retained.push(group(rows,name+'/new/'+hash(key).slice(7)));
  assert.equal(retained.reduce((n,g)=>n+g.memberRefs.length,0),inventory.members.length);return retained;
 };
 const surfaceGroups=adapt(historical.surfaceGroups,'global'),assigned=new Set(),ruleGroups=[],applicationDomains=[];
 for(let n=0;n<historical.ruleGroups.length;n++){
  const previous=historical.ruleGroups[n],rules=previous.ruleRefs.filter(ref=>currentRules.has(ref));if(!rules.length)continue;
  for(const ref of rules){assert.equal(assigned.has(ref),false);assigned.add(ref);}
  const rg={groupRef:base+'rule/retained/'+n,ruleRefs:rules,sourceRefs:unique(rules.map(ref=>currentRules.get(ref).sourceRef))};ruleGroups.push(rg);
  const domain=historical.applicationDomains.find(d=>d.ruleGroupRef===previous.groupRef);assert.ok(domain);
  applicationDomains.push({ruleGroupRef:rg.groupRef,surfaceGroups:adapt(domain.surfaceGroups,'domain/retained/'+n)});
 }
 for(let n=0;n<catalog.sources.length;n++){
  const s=catalog.sources[n],rules=catalog.rules.filter(r=>r.sourceRef===s.ref&&!assigned.has(r.ruleRef));if(!rules.length)continue;
  for(const r of rules)assigned.add(r.ruleRef);
  const rg={groupRef:base+'rule/current-source/'+n,ruleRefs:rules.map(r=>r.ruleRef),sourceRefs:[s.ref]};ruleGroups.push(rg);
  applicationDomains.push({ruleGroupRef:rg.groupRef,surfaceGroups:surfaceGroups.map((g,i)=>({...g,groupRef:base+'domain/current-source/'+n+'/'+i}))});
 }
 assert.equal(assigned.size,catalog.rules.length);
 return identity({kind:'qualification_scope',subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:basis.lawBasis,
  catalog:catalogCoordinate(catalog),inventory,ruleGroups,surfaceGroups,applicationDomains},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
}
function catalogCoordinate(catalog){return {ref:catalog.catalogRef,digest:catalog.__bodyDigest};}
function tenantManifestFor(productManifest,identity){
 const rows=productManifest.publicContractCatalog.rows;
 return identity({kind:'tenant_conformance_manifest',schemaVersion:'5.0.0',productId:productManifest.productId,
  capabilityDefinitionGraph:{ref:productManifest.capabilityDefinitionGraph.graphId,digest:productManifest.capabilityDefinitionGraph.graphDigest},
  publicContractCatalog:{ref:productManifest.publicContractCatalog.catalogId,digest:productManifest.publicContractCatalog.catalogDigest},
  claims:productManifest.declaredCapabilityRefs.map(capabilityRef=>({claimRef:'tenant-claim://abiogenesis/q07/'+encodeURIComponent(capabilityRef),capabilityRef,
   publicContractRefs:unique(rows.filter(r=>r.capabilityIdentities.includes(capabilityRef)).map(r=>r.contractId)),
   evidenceRefs:['repo://abiogenesis/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json']}))},
  'manifestRef','manifestDigest','tenant-conformance://abiogenesis/');
}
/** Required real Runtime coordinates are supplied by the actual setup, never inferred from physical copies. */
export async function constructRuntimeBoundInputs(parameters){
 assert.equal(parameters.coordinateStatus,'actual_admitted');
 const {workspaceAuthorityBasis:A,workspaceBinding:W,installedProduct,currentRootActorRef,catalog,catalogView,declarationProofs}=parameters;
 assert.ok(A&&W&&installedProduct&&catalog&&catalogView&&declarationProofs?.length,'complete actual A/W/install/catalog/View/proofs required');
 assert.equal(A.authorizedActorRef,currentRootActorRef);assert.equal(W.authorizedActorRef,currentRootActorRef);
 assert.equal(W.authorityBasisId,A.authorityBasisId);assert.equal(W.authorityBasisDigest,A.authorityBasisDigest);
 const proof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView};
 assert.ok(declarationProofs.some(x=>parameters.product.sha256Canonical(x)===parameters.product.sha256Canonical(proof)),'actual current declaration View is retained');
 return construct(parameters,false);
}
/** Explicit unit-only opaque coordinates; this exercises current owners without admission claims. */
export async function constructUnitReadinessInputs(parameters){
 assert.equal(parameters.coordinateStatus,'unit_only');assert.equal(parameters.runtimeAdmission,false);
 return construct({...parameters,declarationProofs:[]},true);
}
async function construct(parameters,unitOnly){
 const {product,validator,gtl,workspaceAuthorityBasis:A,workspaceBinding:W,installedProduct,currentRootActorRef}=parameters;
 assert.ok(A&&W&&installedProduct&&currentRootActorRef);const identity=validator.constructQualificationIdentity,hash=product.sha256Canonical;
 const data=await currentInputs(),{selected,inventory,origins,law,catalog,coverageCatalog,productManifest,authorship,aliases,aliasContextBytes}=data;
 const aliasesByRef=assertMaterialRoleAliases(aliases,inventory,catalog);
 assert.equal(installedProduct.productContentDigest,selected.productContentDigest);assert.equal(installedProduct.productId,selected.productId);
 catalog.__bodyDigest='sha256:'+selected.catalog.sha256;
 const tenantManifest=tenantManifestFor(productManifest,identity);
 assert.ok(tenantManifest.claims.every(c=>c.publicContractRefs.length),'every actual declared capability has current owned Public contracts');
 const basis=identity({kind:'exact_candidate_qualification',projection:'basis',schemaVersion:'5.0.0',subjectKind:'pre_rc_candidate',
  productId:selected.productId,productVersion:selected.packageVersion,sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest},
  artifact:{ref:pathToFileURL(selected.artifact.path).href,digest:selected.artifactDigest},
  productManifest:{ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json',digest:selected.manifestDigest},
  productContentDigest:selected.productContentDigest,toolchain:{ref:'repo://abiogenesis/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json',digest:selected.manifestDigest},
  installedProduct:{ref:installedProduct.installId,digest:installedProduct.installDigest},workspaceBinding:{ref:W.bindingId,digest:W.bindingDigest},
  prospectiveRelease:null,tenantManifest:{ref:tenantManifest.manifestRef,digest:tenantManifest.manifestDigest},
  coverageCatalog:{ref:coverageCatalog.catalogRef,digest:coverageCatalog.catalogDigest},lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest}},
  'basisRef','basisDigest','qualification-basis://abiogenesis/');
 const scope=currentScope(data,basis,identity,hash),errors=validator.qualificationScopeCorrespondence(scope,catalog,'sha256:'+selected.catalog.sha256);
 assert.deepEqual(errors,[],'full current declared partitions pass the published correspondence owner');
 const originByRef=new Map(origins.map(m=>[m.ref,m])),rawBytes=inventory.members.reduce((n,m)=>n+m.byteCount,0),base64Bytes=inventory.members.reduce((n,m)=>n+4*Math.ceil(m.byteCount/3),0);
 assert.ok(base64Bytes<500_000_000,'finite full resource byte budget must be satisfied before body materialization');
 const sourceMembers=[];
 for(const m of inventory.members){const o=originByRef.get(m.ref);assert.ok(o,'every complete inventory member has exact retained origin');
  const b=await readFile(o.origin);assert.equal(b.length,m.byteCount);assert.equal(digest(b),m.digest);
  sourceMembers.push({...source(m),contentBase64:b.toString('base64')});}
 const authorityMembers=[];
 for(const s of catalog.sources){const b=await readFile(join(dirname(selected.catalog.path),'../../',s.path));assert.equal(b.length,s.byteCount);assert.equal(digest(b),s.digest);authorityMembers.push({...s,contentBase64:b.toString('base64')});}
 const definition=catalog.sources.find(s=>s.ref==='repo://abiogenesis/stdo_abiogenesis.json');assert.ok(definition,'exact current Definition row is required');
 const ruleGroup=scope.ruleGroups.find(g=>g.sourceRefs.length===1&&g.sourceRefs[0]===definition.ref&&g.ruleRefs.length===catalog.rules.filter(r=>r.sourceRef===definition.ref).length);assert.ok(ruleGroup);
 const policy=validator.QUALIFICATION_ROLE_POLICY,role={roleRef:policy.roleRefs[0],authorityRef:policy.authorityRef,
  sourceBindings:policy.authoritySourceRefs.map(ref=>{const s=catalog.sources.find(s=>s.ref===ref);assert.ok(s);return s;}),actorRef:policy.actorRefs[0],
  workerBindingRef:policy.workerBindingRef,rendererRef:policy.rendererRef,materializationPlanRef:policy.materializationPlanRef,independence:'author_distinct'};
 const selectedRefs=[definition.ref,...policy.authoritySourceRefs],governingMaterial=selectedRefs.map(ref=>authorityMembers.find(m=>m.ref===ref));assert.ok(governingMaterial.every(Boolean));
 const aliasContext=JSON.parse(aliasContextBytes);assert.equal(aliasContext.traceSHA256,digest(await readFile(join(report,'f11/member-alias-trace.json'))));
 const derivationMaterial={ref:'qualification-derivation://abiogenesis/q07/material-role-alias-context',path:'.qualification-material/derivation/member-alias-context.json',digest:digest(aliasContextBytes),byteCount:aliasContextBytes.length,contentBase64:aliasContextBytes.toString('base64')};
 const material=[...governingMaterial,derivationMaterial];
 const contextMembers=material.map(m=>({memberRef:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount})),contextDigest=hash(contextMembers),context={contextRef:'qualification-context://abiogenesis/'+contextDigest.slice(7),sourceLocator:'current-exact-Definition-and-role-authority',inventoryDigest:contextDigest,members:contextMembers};
 const traceBytes=await readFile(join(report,'f11/member-alias-trace.json')),traceRecord={ref:'qualification-derivation://abiogenesis/q07/material-role-alias-trace',path:'.qualification-material/derivation/member-alias-trace.json',digest:digest(traceBytes),byteCount:traceBytes.length,contentBase64:traceBytes.toString('base64')};
 // The extra record is current derivation data. Original record bytes and all eight chains/spans are unchanged.
 const records=[...authorship.records,traceRecord],recordSetDigest=hash(records),provenance={kind:'external_construction',subjectInventory:basis.sourceInventory,
  recordSet:{ref:'external-record-set://abiogenesis/'+recordSetDigest.slice(7),digest:recordSetDigest},records,chains:authorship.chains,acknowledgmentSelectionRef:authorship.acknowledgmentSelectionRef};
 const coverage=[{criterionRef:'criterion://abiogenesis/q07/current-definition-catalog-fidelity',ruleRef:ruleGroup.groupRef,surfaceRef:catalog.catalogRef,evidenceRole:'catalog_fidelity'}];
 const task=identity({kind:'qualification_assessment_task',schemaVersion:'5.0.0',slotRef:'qualification-slot://abiogenesis/q07/current-definition-catalog-fidelity',taskOrdinal:0,
  subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:basis.lawBasis,catalog:scope.catalog,inventory:basis.sourceInventory,scope,role,context,
  declarations:parameters.declarationProofs,assetSurface:{kind:'qualification_assessment',requiredContexts:[context.contextRef],standardsRefs:[definition.ref],
   outputContractRefs:[gtl.QUALIFICATION_IDS.assessmentRaw,gtl.QUALIFICATION_IDS.judgment],constructorRef:'repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/validator/qualification.ts#constructQualificationJudgment',rendererRef:role.rendererRef,
   proofObligationRefs:['repo://abiogenesis/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md#REQ-P-SELF-CONFORMANCE-008','repo://abiogenesis/specification/requirements/product/REQ-P-QUAL.md#REQ-P-QUAL-064A'],
   authoritySlots:[{authorityKindRef:role.authorityRef,disposition:'normal',fallbackPreconditionRefs:[]}]},material,
  subjectMembers:[source(inventory.members.find(m=>m.ref===aliasesByRef.get(definition.ref)))],coverage,provenance,priorEvidenceRefs:[],
  residuals:['residual://complete-F11-open','residual://independent-semantic-assessment-open','residual://source-authorship-and-independence-unresolved','residual://unprovided-other-criterion-context']},'taskRef','taskDigest','qualification-task://abiogenesis/');
 const plan=identity({kind:'qualification_assessment_plan',subjectBasis:task.subjectBasis,lawBasis:task.lawBasis,
  slots:[{slotRef:task.slotRef,task:{ref:task.taskRef,digest:task.taskDigest},taskOrdinal:0,graphFunctionRef:gtl.QUALIFICATION_IDS.assessGraph,programLocusRef:'node://abiogenesis/qualification/assess@5',role,coverage}],
  coverage,sharedCoverage:'disjoint',ownerAuthorityRef:role.authorityRef,ownerActorRef:currentRootActorRef},'planRef','planDigest','qualification-plan://abiogenesis/');
 const embeddedAssessment={kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
 assert.equal(validator.isQualificationAssessmentInput(embeddedAssessment),true,'actual published assessment owner accepts the complete current embedded packet');
 const request=validator.qualificationWorkerRequest(embeddedAssessment),b={subjectStatus:'accepted_actual_successor',semanticClaim:'mechanical_carrier_only',
  candidateConstructionFreezeSHA256:selected.constructionFreeze.sha256,basis,law,tenantManifest,coverageCatalog,embeddedAssessment,
  sourceMembers,extraMaterials:authorityMembers,authorityMembers,declarationProofs:parameters.declarationProofs,currentSTDO:law.releaseRef,currentRootActorRef,
  lawfulSuccessorChanges:{sourceChanges:authorship.sourceOrigins.filter(m=>['accepted_one_file_installer_policy_increment','accepted_one_argument_FP_increment','accepted_actual_dispatcher_regression','exact_current_tracking_only'].includes(m.selectedRelation)),catalogSourceBindingsReconstructed:true,inventoryMembersReconstructed:true},
  historicalComparison:{Q05:'C04-only',unitOnly},actualRuntimeBindings:{coordinateStatus:parameters.coordinateStatus,A,W,installedProduct,RootActor:currentRootActorRef},
  contextSelection:{appliesToCompleteInventory:true,applicability:'unknown',sourceRefs:selectedRefs,reason:'complete Definition catalog population and actual published role authorities; no inferred whole-inventory applicability',otherBodiesProvidedToModel:false}};
 const packet=deriveResourcePacket(b,{hash,identity,normalizeQualificationScope:s=>normalizeQualificationScopeAssertion(s,validator)});
 packet.raw.attributions=provenance.chains.map(ch=>({activationRef:ch.activationRef,authorRef:ch.authorRef,actorIdentityRef:ch.actorIdentityRef,authorityRef:ch.authorityRef,scopeRefs:ch.scopeRefs,disposition:'insufficient',sourceRefs:unique(ch.attributionSources.map(s=>s.sourceRef)),reason:'Retained exact record/span correspondence does not establish actual authorship sufficiency or independence.'}));
 assert.equal(validator.isQualificationAssessmentInput(packet.assessmentInput),true);
 const resource=packet.assertion.manifests[0],resourceCoordinate={ref:resource.resourceRef,digest:resource.resourceDigest};
 assert.equal(packet.sourceMemberSelections.length,inventory.members.length);
 const ready={coordinateStatus:parameters.coordinateStatus,actualBindingsAlreadyAdmitted:!unitOnly,runtimeAdmission:false,newTaskOrRunAdmission:false,firstCriterion:coverage[0],subjectInventory:basis.sourceInventory,
  inventoryMembers:inventory.members.length,inventoryBodyBytes:rawBytes,inventoryBase64Bytes:base64Bytes,effectiveSourceMembers:(await read(join(report,'source-inventory.json'))).length,
  ruleGroups:scope.ruleGroups.length,perRuleDomains:scope.applicationDomains.length,globalSurfaceGroups:scope.surfaceGroups.length,referenceSets:packet.normalized.referenceSets.length,
  retainedHistoricalRules:scope.ruleGroups.filter(g=>g.groupRef.includes('/retained/')).reduce((n,g)=>n+g.ruleRefs.length,0),
  newOrChangedRules:scope.ruleGroups.filter(g=>g.groupRef.includes('/current-source/')).reduce((n,g)=>n+g.ruleRefs.length,0),
  authorityBodies:authorityMembers.length,resourceEntries:resource.entries.length,resource:resourceCoordinate,
  physicalMemberAliases:aliasesByRef.size,physicalMemberCensusDelta:0,sourceAuthPostimageRefsAffected:0,originalSourceAuthRecords:authorship.records.length,derivationRecords:1,
  governingModelBodies:governingMaterial.map(source),derivationContextBytes:aliasContextBytes.length,originalChainsAndSpansUnchanged:true,
  sourceAuthRecords:provenance.records.length,sourceAuthRecordBytes:provenance.records.reduce((n,m)=>n+m.byteCount,0),sourceAuthChains:provenance.chains.length,
  attributionSpanBytes:provenance.chains.reduce((n,c)=>n+c.attributionSources.reduce((n,s)=>n+s.endByte-s.startByte,0),0),
  promptBytes:Buffer.byteLength(request.prompt),promptSHA256:digest(Buffer.from(request.prompt)),selectedModelBodies:material.map(source),
  ownerEmbeddedGuard:true,ownerReferenceGuard:true,actualPublishedRenderer:true,semanticClaims:'unknown',qualification:false};
 return {b,packet,request,ready,embeddedAssessment};
}
