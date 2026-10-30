import test from 'node:test';
import assert from 'node:assert/strict';
import { classification, representativeSources, constructApplicationDomains } from '../qualification/build-resources.mjs';
import { slotPromptBound, PROMPT_BOUND_BYTES, PROOF_COMPLEMENT_BOUND_BYTES } from '../qualification/assessment-plan.mjs';
import { CONSTRUCTION_IDENTITIES } from '../qualification/provenance.mjs';
test('declared representative sources are actual members while every domain conserves full coverage',async()=>{
  const declaration=await classification();
  const members=new Map([['a',{ref:'a',byteCount:10,surfaceRoles:['code']}],['large',{ref:'large',byteCount:200000,surfaceRoles:['code']}],['z',{ref:'z',byteCount:20,surfaceRoles:['code']}],['proof',{ref:'proof',byteCount:20,surfaceRoles:['proof']}]]);
  assert.deepEqual(representativeSources(declaration,['a','large','z'],members),['a','z']);
  assert.deepEqual(representativeSources(declaration,['large'],members),['large'],'an oversized sole member is explicit, never silently omitted');
  assert.throws(()=>representativeSources(declaration,['missing'],members),/absent/);
  const root=declaration.surfaceGroups.rootRefs, owner=declaration.surfaceGroups.ownerRefs;
  const groups=[{groupRef:'qualification-surface-group://abiogenesis/typescript-tenant/code/code',memberRefs:['a','large','z'],rootRefs:root,ownerRefs:owner,surfaceRoles:['code'],sourceRefs:['a','z']},
    {groupRef:'qualification-surface-group://abiogenesis/typescript-tenant/proof/test_env',memberRefs:['proof'],rootRefs:root,ownerRefs:owner,surfaceRoles:['proof'],sourceRefs:['proof']}];
  const domains=constructApplicationDomains(declaration,{inventory:{members:[...members.values()]},ruleGroups:[{groupRef:'rule/0',sourceRefs:['repo://abiogenesis/specification/PRODUCT.md']}],surfaceGroups:groups});
  assert.deepEqual(domains[0].surfaceGroups.flatMap(g=>g.memberRefs).sort(),[...members.keys()].sort());
  for(const group of domains[0].surfaceGroups)assert.ok(group.sourceRefs.every(ref=>group.memberRefs.includes(ref)));
});
test('proof complement alone receives the approved rendered-byte bound and Codex attribution is explicit',()=>{
  assert.equal(slotPromptBound({role:'rule',key:'rule/complement/proof/0'}),PROOF_COMPLEMENT_BOUND_BYTES);
  assert.equal(PROOF_COMPLEMENT_BOUND_BYTES,1300000);
  for(const slot of [{role:'rule',key:'rule/complement/code/0'},{role:'inventory',key:'rule/complement/proof/0'},{role:'rule',key:'rule/proof/test_env/0'}])assert.equal(slotPromptBound(slot),PROMPT_BOUND_BYTES);
  assert.equal(CONSTRUCTION_IDENTITIES['Codex gpt-6-astra'].actorIdentityRef,'actor-identity://openai/gpt-6-astra');
  assert.equal(CONSTRUCTION_IDENTITIES['Claude Opus 5.5'].actorIdentityRef,'actor-identity://anthropic/claude-opus-5.5');
});
test('diagnosed derivation selections bind nonempty actual evidence without changing another rule family',async()=>{
  const declaration=await classification(),row=declaration.evidenceSelections[0],subject=row.subjectMemberRefs;
  const members=new Map([...subject,...row.sourceRefs].map(ref=>[ref,{ref,byteCount:ref===subject[0]?3273847:100}]));
  const context={ruleSourceRef:row.ruleSourceRefs[0]};
  assert.deepEqual(representativeSources(declaration,subject,members,context),row.sourceRefs);
  assert(row.sourceRefs.every(ref=>members.has(ref)));assert(row.sourceRefs.some(ref=>!subject.includes(ref)));
  assert.deepEqual(representativeSources(declaration,subject,members,{ruleSourceRef:'source://another-family'}),subject);
  assert.deepEqual(representativeSources(declaration,['another-member'],new Map([['another-member',{byteCount:200000}]]),context),['another-member']);
  const missing=new Map(members);missing.delete(row.sourceRefs[0]);
  assert.throws(()=>representativeSources(declaration,subject,missing,context),/evidence absent or unbound/);
  const unsupported=structuredClone(declaration);unsupported.evidenceSelections[0].argument='';
  assert.throws(()=>representativeSources(unsupported,subject,members,context),/evidence absent or unbound/);
  const crossed=structuredClone(declaration);crossed.evidenceSelections[0].sourceRefs=['repo://unbound/generator'];
  assert.throws(()=>representativeSources(crossed,subject,members,context),/evidence absent or unbound/);
});
