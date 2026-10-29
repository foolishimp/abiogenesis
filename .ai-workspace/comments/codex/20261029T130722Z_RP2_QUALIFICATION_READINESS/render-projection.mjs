// Structural sizing only: current frozen source/law and actual renderer, retained
// RP-1 basis/declarations and the exact D5-c measured C2 stand-in entries.
// No current candidate claim, semantic judgment, native dispatch, or qualification.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const tenant=resolve(fileURLToPath(new URL('../../../../build_tenants/abiogenesis/typescript/',import.meta.url)));
const b=await import(join(tenant,'test_env/qualification/build-resources.mjs'));
const a=await import(join(tenant,'test_env/qualification/assessment-plan.mjs'));
const p=await import(join(tenant,'test_env/qualification/provenance.mjs'));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const [savedPath,outputPath]=process.argv.slice(2), saved=await read(savedPath),started=performance.now();
const q=await b.installedExports(tenant), hash=q.product.sha256Canonical;
assert.equal(hash(saved.input),saved.inputDigest);
const declaration=await b.classification(),inventory=await b.constructInventory(q,declaration),law=await b.lawAndCoverage(q);
const basis=await read(join(saved.sourceArchive,'resources/basis.json'));
const manifest=await read(join(saved.sourceArchive,'resources/tenant-manifest.json'));
const {scope,errors}=b.constructScope(q,declaration,{inventory,catalog:law.catalog,catalogDigest:law.catalogDigest,subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:law.lawBasis});
assert.deepEqual(errors,[]);
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:tenant}).toString().trim();
const chains=p.constructChains(p.chainCommits(head),q.preparation.QUALIFICATION_ROLE_POLICY.authorityRef);
const provenance=p.constructProvenance(q.product,{inventory,...chains});
const materials=saved.invoking.manifests.flatMap(m=>m.entries.filter(e=>e.entryKind==='material').map(e=>e.value));
const executionMaterial=materials.find(m=>m.ref.startsWith('result://abiogenesis/t287/d5c/measured-stand-in/'));
const verificationMaterial=materials.find(m=>m.ref.startsWith('qualification-verification-material://'));
assert.ok(executionMaterial&&verificationMaterial);
const catalog=await read(join(saved.sourceArchive,'resources/catalog.json')),programs=await read(join(saved.sourceArchive,'qualification-programs.json'));
const catalogView=q.product.narrowGraphFunctionCatalog(catalog,programs.allowlist);
assert.equal(hash(catalog),programs.catalogDigest);assert.equal(hash(catalogView),programs.viewDigest);
const declarationProof={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog,catalogView};
assert.equal(hash(declarationProof),saved.invoking.manifests[0].declarationSelections[0].proofDigest);
const base=await a.constructAssessmentMaterial(q,{declaration,inventory,law,tenant:manifest,basis,scope,provenance,declarationProof,executionMaterial,verificationMaterial});
const selection=await a.materialSelection(),specified=a.constructSlotSpecifications(q,base,selection),built=a.acquireAssessmentResources(q,base,specified);
const ownerActorRef='actor://abiogenesis/product-owner',calibration=a.packRuleRole(q,built,specified,selection,{ownerActorRef});
const projection=a.projectAssessment(q,built,specified,selection,{ownerActorRef,onSlot:(n)=>{if(n%50===0)console.log('rendered',n);}});
const all=[...projection.admitted,...projection.irreducible],criteria=all.flatMap(x=>x.slot.coverage);
assert.equal(new Set(criteria.map(c=>c.criterionRef)).size,criteria.length);
const result={kind:'rp2_structural_projection',qualification:false,providerCalls:0,head,elapsedMs:performance.now()-started,
 limits:['Actual rendered bytes over current frozen source and law; retained RP-1 basis coordinate/declarations and tenant manifest are measurement context only.','C2 entries are exact retained D5-c measured stand-ins; no current recipe execution or native proof claimed.','Attribution is a mechanical projection over supplied established-attribution inputs, not J; Q23 contributor/identity and assessor arrangement remain open.','O2 and D5-d-prep must regenerate exact candidate resources, full native proof and current cost/time projection.'],
 retainedInput:{path:savedPath,digest:saved.inputDigest,sourceArchive:saved.sourceArchive},inventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest,members:inventory.members.length},law:law.lawBasis,
 sourceRefs:scope.surfaceGroups.map(g=>({groupRef:g.groupRef,members:g.memberRefs.length,sourceRefs:g.sourceRefs})),calibration,
 slots:all.length,criteria:criteria.length,sharedCoverage:'disjoint',unsplitCriteria:true,irreducible:projection.irreducible.map(x=>({key:x.slot.key,bytes:x.total})),
 byRole:projection.byRole,promptBytes:projection.promptBytes,inputTokens:projection.inputTokens,outputTokens:projection.outputTokens,modelUsd:projection.usd,rows:projection.rows};
await writeFile(outputPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({outputPath,slots:result.slots,criteria:result.criteria,irreducible:result.irreducible,modelUsd:result.modelUsd,elapsedMs:result.elapsedMs}));
