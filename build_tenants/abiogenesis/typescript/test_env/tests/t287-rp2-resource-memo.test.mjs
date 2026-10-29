import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { qualificationHash as hash, constructQualificationIdentity as identity } from '../../build/code/src/validator/qualification_contracts.js';
import { acquireQualificationResources } from '../../build/code/src/validator/qualification_resources.js';
const coord = ref => ({ref, digest: hash(ref)});
const material = (text, ref = 'record://one', path = 'record/one') => {
  const bytes = Buffer.from(text);
  return {ref, path, digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), byteCount: bytes.length, contentBase64: bytes.toString('base64')};
};
function assertion(records, recordSetDigest = hash(records)) {
  const provenance = {kind: 'external_construction', subjectInventory: coord('inventory://test'),
    recordSet: {ref: 'record-set://test', digest: recordSetDigest},
    records: records.map(r => ({entryKind: 'material', entry: {ref: r.ref, digest: r.digest}})),
    chains: [{activationRef: records[0].ref, preimageRef: records[0].ref, deltaRef: records[0].ref, closureRef: records[0].ref,
      authorRef: 'actor://test', actorIdentityRef: 'actor-identity://test', authorityRef: 'authority://test', scopeRefs: ['member://test'],
      postimageMembers: [{ref: 'member://test',path: 'member',digest: hash('member'),byteCount: 6}],
      changes: [{memberRef:'member://test',patchPath:'member',preimageMemberRef:null,postimageMemberRef:'member://test'}],
      attributionSources:[{sourceRef:records[0].ref,startByte:0,endByte:1,spanDigest:hash('span')}]}], acknowledgmentSelectionRef:null};
  const pd = hash(provenance);
  const manifest = identity({kind:'qualification_resource_manifest',schemaVersion:'1',subjectBasis:coord('subject://test'),
    lawBasis:coord('law://test'),catalog:coord('catalog://test'),inventory:coord('inventory://test'),declarationSelections:[],
    entries:[...records.map(value=>({entryKind:'material',coordinate:{ref:value.ref,digest:value.digest},value})),
      {entryKind:'provenance',coordinate:{ref:'qualification-provenance://abiogenesis/'+pd.slice(7),digest:pd},value:provenance}]},
    'resourceRef','resourceDigest','qualification-resource://abiogenesis/');
  return {kind:'qualification_resource_assertion',schemaVersion:'1',manifests:[manifest],declarationProofs:[]};
}
test('verified record-set reuse still authenticates changed bytes and complete ordered material identity', () => {
  const one=material('ABCD'), two=material('EFGH','record://two','record/two'), records=[one,two];
  const original=structuredClone(assertion(records)), acquired=acquireQualificationResources(original);
  assert.doesNotThrow(()=>acquireQualificationResources(structuredClone(original)), 'same bytes may reuse the derived hash');
  original.manifests[0].entries[0].value.contentBase64=Buffer.from('WXYZ').toString('base64');
  assert.equal(acquired.assertion.manifests[0].entries[0].value.contentBase64,Buffer.from('ABCD').toString('base64'));
  assert.throws(()=>acquireQualificationResources(assertion([{...material('ABCD'),contentBase64:Buffer.from('WXYZ').toString('base64')},two],hash([material('ABCD'),two]))),/material_bytes/, 'same ref/path/digest/length with changed bytes is refused');
  const valid=[material('ABCD'),two], digest=hash(valid);
  assert.throws(()=>acquireQualificationResources(assertion(valid,hash('wrong'))),/provenance_record_set/);
  assert.throws(()=>acquireQualificationResources(assertion([...valid].reverse(),digest)),/provenance_record_set/, 'order contributes to the set hash');
  assert.throws(()=>acquireQualificationResources(assertion([{...valid[0],path:'other'},two],digest)),/provenance_record_set/);
  assert.throws(()=>acquireQualificationResources(assertion([material('WXYZ'),two],digest)),/provenance_record_set/, 'new valid bytes require a new record-set digest');
  assert.doesNotThrow(()=>acquireQualificationResources(assertion([material('WXYZ'),two])));
});
