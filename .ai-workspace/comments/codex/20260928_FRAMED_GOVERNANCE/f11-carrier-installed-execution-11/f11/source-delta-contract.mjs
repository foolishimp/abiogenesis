// Cut-specific external preparation assertions under HOW4.1; no framework API.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
function normalized(v){
 if(v===null||typeof v!=='object')return v;
 if(Array.isArray(v))return v.map(normalized);
 return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalized(v[k])]));
}
export function assertSelectedSourceDelta(changes,contract){
 assert.equal(contract.kind,'derived_selected_current_source_delta');
 const {deltaRef,deltaDigest,...body}=contract;
 const calculated='sha256:'+createHash('sha256').update(JSON.stringify(normalized(body))).digest('hex');
 assert.equal(deltaDigest,calculated,'selected_delta_identity');
 assert.equal(deltaRef,'qualification-derivation://abiogenesis/q07/current-source-delta/'+calculated.slice(7));
 assert.ok(Array.isArray(changes)&&changes.length>0,'actual carrier/authority deltas are explicit');
 assert.equal(changes.length,contract.changeCount,'selected_delta_complete');
 assert.equal(contract.replacementCount+contract.additionCount,contract.changeCount);
 const expected=new Map(contract.sourceChanges.map(row=>[row.path,row]));
 assert.equal(expected.size,contract.changeCount,'selected_delta_unique');
 assert.equal(new Set(changes.map(row=>row.path)).size,changes.length,'selected_delta_unique');
 for(const row of changes){
  const selected=expected.get(row.path);assert.ok(selected,'unselected_or_inherited_source_delta');
  assert.deepEqual(row.selectedCut,contract.selectedCut,'selected_delta_cut');
  assert.deepEqual(row,selected,'selected_delta_source_postimage_author_row_and_copy_roles');
  if(row.changeKind==='addition'){
   assert.equal(row.preimage,'ABSENT');
   assert.deepEqual(row.copyRoles.selectedOrigin.fields,{},'addition_historical_copy_absence');
  }else assert.equal(row.changeKind,'replacement');
  assert.deepEqual(row.copyRoles.selectedOrigin.producer,row.selectedProducerRow,'historical_copy_producer_anchor');
  assert.deepEqual(row.copyRoles.currentSupplier.producer,row.currentSupplierRow,'current_copy_producer_anchor');
 }
 return true;
}
export function assertDeltaFlatViews(contract,origins,supplier){
 assertSelectedSourceDelta(contract.sourceChanges,contract);
 const sourceFields=['path','origin','sha256','bytes','mode','sourceAuthor','originalSource','originalAuthorship','selectedRelation'];
 const copyFields=['copyBuildAuthor','copyOrigin'];
 const origin=new Map(origins.map(row=>[row.path,row])),current=new Map(supplier.rows.map(row=>[row.path,row]));
 for(const row of contract.sourceChanges){
  for(const [flat,role]of [[origin.get(row.path),'selectedOrigin'],[current.get(row.path),'currentSupplier']]){
   assert.ok(flat);
   for(const field of sourceFields){
    assert.equal(Object.hasOwn(flat,field),Object.hasOwn(row,field));
    if(Object.hasOwn(row,field))assert.deepEqual(flat[field],row[field]);
   }
   const copy=Object.fromEntries(copyFields.filter(field=>Object.hasOwn(flat,field)).map(field=>[field,flat[field]]));
   assert.deepEqual(copy,row.copyRoles[role].fields,'copy_role_own_producer_correspondence');
   const anchor=role==='selectedOrigin'?row.projectedOriginRow:row.projectedSupplierRow;
   assert.deepEqual(flat.frozenRow,anchor,'accessible_original_row_correspondence');
  }
 }
 return true;
}
