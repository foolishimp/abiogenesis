// Pure external input-construction draft. No runtime owner, store or installed private import.
// `tools` are separately pinned frozen construction helpers; their output is ordinary assertion data.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const c=(ref,digest)=>({ref,digest});
const equal=(a,b)=>assert.deepEqual(a,b);
const selection=(m,entryKind,entry)=>({kind:'qualification_resource_selection',schemaVersion:'1',resource:c(m.resourceRef,m.resourceDigest),entryKind,entry});
export function deriveResourcePacket(b,tools){
 const {hash,identity,normalizeQualificationScope}=tools;
 assert.equal(b.subjectStatus,'accepted_actual_successor');
 assert.equal(b.semanticClaim,'mechanical_carrier_only');
 const {basis,law,tenantManifest,coverageCatalog,embeddedAssessment}=b,old=embeddedAssessment.task;
 assert.equal(old.representation,undefined,'the externally selected complete scope is normalized once');
 equal(old.subjectBasis,c(basis.basisRef,basis.basisDigest));equal(old.lawBasis,basis.lawBasis);
 equal(old.inventory,basis.sourceInventory);equal(old.scope.subjectBasis,old.subjectBasis);
 equal(old.scope.lawBasis,old.lawBasis);equal(old.scope.catalog,old.catalog);
 equal(old.scope.inventory.inventoryDigest,basis.sourceInventory.digest);
 equal(old.catalog,c(law.catalog.ref,law.catalog.digest));
 assert.equal(b.currentSTDO,'stdo://releases/v2.5.1-rc.2/');
 assert.equal(law.releaseRef,b.currentSTDO);
 equal(coverageCatalog.lawBasis,basis.lawBasis);
 assert.ok(b.lawfulSuccessorChanges?.sourceChanges?.length>0,'actual carrier/authority deltas are explicit');
 assert.ok(b.lawfulSuccessorChanges.catalogSourceBindingsReconstructed);
 assert.ok(b.lawfulSuccessorChanges.inventoryMembersReconstructed);
 const normalized=normalizeQualificationScope(old.scope),entries=[];
 const add=(entryKind,coordinate,value)=>{
  const prior=entries.find(x=>x.entryKind===entryKind&&x.coordinate.ref===coordinate.ref);
  if(prior){equal(prior,{entryKind,coordinate,value});return;}
  entries.push({entryKind,coordinate,value});
 };
 add('inventory',old.inventory,old.scope.inventory);
 add('scope',c(normalized.scopeRef,normalized.scopeDigest),normalized);
 for(const material of [...old.material,...old.provenance.records,...b.sourceMembers,...b.extraMaterials]){
  const bytes=Buffer.from(material.contentBase64,'base64');
  assert.equal(bytes.length,material.byteCount);
  assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),material.digest);
  add('material',c(material.ref,material.digest),material);
 }
 const provenance={...old.provenance,records:old.provenance.records.map(x=>({entryKind:'material',entry:c(x.ref,x.digest)}))},pd=hash(provenance);
 add('provenance',c('qualification-provenance://abiogenesis/'+pd.slice(7),pd),provenance);
 add('law',c(law.lawBasisRef,law.lawBasisDigest),law);
 add('tenant_manifest',c(tenantManifest.manifestRef,tenantManifest.manifestDigest),tenantManifest);
 add('coverage_catalog',c(coverageCatalog.catalogRef,coverageCatalog.catalogDigest),coverageCatalog);
 const declarations=b.declarationProofs.map(proof=>({catalogBasisDigest:proof.catalog.basisDigest,readinessBasisDigest:proof.catalog.readinessBasisDigest,viewDigest:proof.catalogView.viewDigest,proofDigest:hash(proof)}));
 assert.equal(new Set(declarations.map(x=>x.proofDigest)).size,declarations.length,'each exact proof is supplied once');
 const manifest=identity({kind:'qualification_resource_manifest',schemaVersion:'1',subjectBasis:old.subjectBasis,lawBasis:old.lawBasis,catalog:old.catalog,inventory:old.inventory,entries,declarationSelections:declarations},'resourceRef','resourceDigest','qualification-resource://abiogenesis/');
 const taskDeclarations=old.declarations.map(proof=>{
  const selected=declarations.filter(x=>x.proofDigest===hash(proof));assert.equal(selected.length,1);return selected[0];
 });
 const task=identity({...old,representation:'resource_refs_v1',resource:c(manifest.resourceRef,manifest.resourceDigest),scope:selection(manifest,'scope',c(normalized.scopeRef,normalized.scopeDigest)),declarations:taskDeclarations,material:old.material.map(x=>selection(manifest,'material',c(x.ref,x.digest))),provenance:selection(manifest,'provenance',c('qualification-provenance://abiogenesis/'+pd.slice(7),pd))},'taskRef','taskDigest','qualification-task://abiogenesis/');
 const plan=identity({...embeddedAssessment.plan,slots:embeddedAssessment.plan.slots.map(slot=>({...slot,task:slot.slotRef===task.slotRef?c(task.taskRef,task.taskDigest):slot.task}))},'planRef','planDigest','qualification-plan://abiogenesis/');
 equal(plan.subjectBasis,old.subjectBasis);equal(plan.lawBasis,old.lawBasis);
 assert.equal(plan.ownerActorRef,b.currentRootActorRef);
 const assessmentInput={kind:'qualification_assessment_input',schemaVersion:'5.0.0',task,plan};
 const assertion={kind:'qualification_resource_assertion',schemaVersion:'1',manifests:[manifest],declarationProofs:b.declarationProofs};
 const groups=normalized.domainMode==='per_rule'?normalized.applicationDomains.flatMap(domain=>domain.surfaceGroups.map(group=>({ruleRef:domain.ruleGroupRef,surfaceRef:group.groupRef}))):normalized.ruleGroups.flatMap(domain=>normalized.surfaceGroups.map(group=>({ruleRef:domain.groupRef,surfaceRef:group.groupRef})));
 const applications=groups.map(x=>({...x,applicability:'unknown',premiseEvidenceRefs:[],evaluationEvidenceRefs:[],rulingEvidenceRefs:[]}));
 const selfConformanceBase={kind:'self_conformance_input',schemaVersion:'5.0.0',representation:'resource_refs_v1',resource:task.resource,basis,law:selection(manifest,'law',c(law.lawBasisRef,law.lawBasisDigest)),inventory:selection(manifest,'inventory',basis.sourceInventory),tenantManifest:selection(manifest,'tenant_manifest',c(tenantManifest.manifestRef,tenantManifest.manifestDigest)),scope:task.scope,authorityMembers:b.authorityMembers.map(x=>selection(manifest,'material',c(x.ref,x.digest))),applications,evidenceCitations:[]};
 const raw={kind:'qualification_raw_judgment',schemaVersion:'5.0.0',criteria:task.coverage.map(x=>({...x,disposition:'indeterminate',applicability:'unknown',grouping:'unknown',reason:'Controlled transport fixture preserves unresolved semantic obligations.',sourceRefs:[old.material[0].ref],evidenceRefs:[],residuals:['residual://independent-semantic-assessment-open']})),residuals:['residual://independent-semantic-assessment-open','residual://complete-F11-open'],attributions:[]};
 return {assessmentInput,assertion,selfConformanceBase,coverageCatalog,normalized,raw,sourceMemberSelections:b.sourceMembers.map(x=>selection(manifest,'material',c(x.ref,x.digest))),historicalComparison:b.historicalComparison,lawfulSuccessorChanges:b.lawfulSuccessorChanges,claim:'Derived immutable input assertion only; no runtime facts, qualification or closure'};
}
export function assertionForInvokingView(assertion,catalog,catalogView,hash){
 const current={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView};
 const digest=hash(current);
 // Exact current proof may be borrowed by the existing owner. Archive retains its preimage.
 return {...assertion,declarationProofs:assertion.declarationProofs.filter(x=>hash(x)!==digest)};
}
export function selfConformanceWithActualProof(packet,proof){
 assert.equal(proof.representation,'resource_refs_v1');
 equal(proof.resource,packet.assessmentInput.task.resource);
 return {...packet.selfConformanceBase,qualification:{plan:packet.assessmentInput.plan,proof,sourceMembers:packet.sourceMemberSelections,coverageCatalog:selection(packet.assertion.manifests[0],'coverage_catalog',c(packet.coverageCatalog.catalogRef,packet.coverageCatalog.catalogDigest))}};
}
