// Future same-C04/Q05 input construction. No effects occur on import.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {deriveResourcePacket} from './prepare-resources.mjs';
import {normalizeQualificationScopeAssertion} from './scope-authoring.mjs';
const report=dirname(dirname(fileURLToPath(import.meta.url)));
const read=async p=>JSON.parse(await readFile(p,'utf8'));
export async function constructCurrentResourcePacket(b,{product,validator}){
 const inventory=await read(join(report,'qualification-inventory.json'));
 const selected=await read(join(report,'candidate-binding.json'));
 const law=await read(selected.law.path),coverage=await read(selected.coverage.path);
 assert.equal(b.subjectStatus,'accepted_actual_successor');assert.equal(b.semanticClaim,'mechanical_carrier_only');
 assert.equal(b.candidateConstructionFreezeSHA256,selected.constructionFreeze.sha256);
 assert.deepEqual(b.basis.sourceInventory,{ref:inventory.inventoryRef,digest:inventory.inventoryDigest});
 assert.deepEqual(b.embeddedAssessment.task.scope.inventory,inventory);
 assert.deepEqual(b.law,law);assert.deepEqual(b.coverageCatalog,coverage);
 assert.deepEqual(b.basis.lawBasis,{ref:law.lawBasisRef,digest:law.lawBasisDigest});
 assert.equal(b.basis.productContentDigest,selected.productContentDigest);
 assert.ok(b.actualRuntimeBindings,'actual A/W/install/catalog/actor and source-authentication bindings required');
 assert.ok(b.declarationProofs.length,'actual current declarations required');
 assert.ok(b.contextSelection,'actual justified role/material selections required');
 assert.equal(b.contextSelection.appliesToCompleteInventory,true);
 assert.notEqual(b.contextSelection.applicability,'all_automatically_applicable');
 // Root selected this concrete external section-2 authorer. It receives only
 // the published identity constructor, and never imports the private normalizer.
 const identity=validator.constructQualificationIdentity;
 assert.equal(typeof identity,'function');
 return deriveResourcePacket(b,{hash:product.sha256Canonical,identity,
  normalizeQualificationScope:scope=>normalizeQualificationScopeAssertion(scope,validator)});
}
