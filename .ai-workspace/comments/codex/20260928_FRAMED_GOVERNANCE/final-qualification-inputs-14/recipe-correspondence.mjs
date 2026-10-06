// Exact current input/body/configuration correspondence. Native qualification
// observation, source authentication and semantic assessment remain owners' work.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const bodyDigest=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
export function assertPreparationCorrespondence({product,task,selectedFiles,inventory,protectedPopulation,recipeBytes}){
 assert.equal(product.isObservedWorksiteCommandExecutionTask(task),true);
 const {inventoryRef,inventoryDigest,...inventoryBody}=inventory;
 assert.equal(product.sha256Canonical(inventoryBody),inventoryDigest);
 assert.equal(inventoryRef,'qualification-inventory://abiogenesis/'+inventoryDigest.slice(7));
 const members=new Map(inventory.members.map(m=>[m.ref,m]));
 assert.equal(members.size,inventory.members.length);
 const declared=new Map(protectedPopulation.members.map(r=>[r.target,r]));
 const selected=new Map(selectedFiles.map(r=>[r.target,r]));
 const observed=new Map(task.protectedObservations.map(r=>[r.subject.relativePath,r]));
 assert.equal(declared.size,protectedPopulation.members.length);
 assert.equal(selected.size,selectedFiles.length);assert.equal(observed.size,task.protectedObservations.length);
 assert.equal(selected.size,declared.size);assert.equal(selected.size,observed.size);
 for(const [path,row]of selected){
  const d=declared.get(path),o=observed.get(path),m=members.get(row.memberRef);
  assert.ok(d&&o&&m,'every actual selected body must join current descriptor, owner observation and inventory');
  assert.equal(d.memberRef,row.memberRef);assert.equal(d.sha256,row.sha256);assert.equal(d.bytes,row.bytes);
  assert.equal(o.observation.state,'file');assert.equal(o.observation.fileDigest,'sha256:'+row.sha256);
  assert.equal(o.observation.byteLength,row.bytes);assert.equal(m.digest,'sha256:'+row.sha256);assert.equal(m.byteCount,row.bytes);
 }
 const recipe=JSON.parse(recipeBytes);
 const self=selected.get('recipe/verification-recipe.json');assert.ok(self);
 assert.equal(bodyDigest(recipeBytes),'sha256:'+self.sha256);assert.equal(recipeBytes.length,self.bytes);
 const paths=[];
 for(const input of recipe.sourceInputs){
  const row=selected.get(input.relativePath),m=members.get(input.memberRef);assert.ok(row&&m);
  assert.equal(row.memberRef,input.memberRef);assert.equal(m.digest,'sha256:'+row.sha256);assert.equal(m.byteCount,row.bytes);paths.push(input.relativePath);
 }
 for(const input of recipe.auxiliaryInputs){
  const row=selected.get(input.relativePath);assert.ok(row);
  assert.equal(input.digest,'sha256:'+row.sha256);assert.equal(input.byteCount,row.bytes);paths.push(input.relativePath);
 }
 assert.equal(new Set(paths).size,paths.length);assert.equal(paths.includes('recipe/verification-recipe.json'),false);
 assert.equal(paths.length+1,selected.size);
 const digests={commandConfigurationDigest:product.sha256Canonical(task.commands),
  predicateConfigurationDigest:product.sha256Canonical(task.outcomePredicates),
  writeTerritoriesDigest:product.sha256Canonical(task.allowedWriteTerritories)};
 for(const key of Object.keys(digests))assert.equal(recipe[key],digests[key],key);
 assert.deepEqual(recipe.commands.map(c=>c.commandId),task.commands.map(c=>c.commandId));
 return {kind:'actual_complete_preparation_correspondence',inventory:{ref:inventoryRef,digest:inventoryDigest},
  protectedFiles:selected.size,sourceInputs:recipe.sourceInputs.length,auxiliaryInputs:recipe.auxiliaryInputs.length,
  recipeSelfObservedOnce:true,recipeBodyDigest:bodyDigest(recipeBytes),actualTaskDigests:digests,
  currentInventoryBodyCorrespondence:true,configurationCorrespondence:true,qualificationMaterialProduced:false,RuntimeAdmission:false};
}
