// External assertion authorer for accepted F11 resource HOW section 2.
// This constructs data; the actual installed owner decides correspondence.
import assert from 'node:assert/strict';
export function normalizeQualificationScopeAssertion(scope,validator){
 const identity=validator.constructQualificationIdentity;
 assert.equal(typeof identity,'function');
 const inventory={ref:scope.inventory.inventoryRef,digest:scope.inventory.inventoryDigest};
 const ordinals=new Map(scope.inventory.members.map((m,n)=>[m.ref,n]));
 assert.equal(ordinals.size,scope.inventory.members.length);
 const sets=new Map();
 const set=(elementKind,values)=>{
  assert.ok(Array.isArray(values)&&values.length>0,'nonempty exact ordered reference set required');
  assert.equal(new Set(values).size,values.length);
  const body=elementKind==='memberRefs'
   ? {kind:'qualification_reference_set',schemaVersion:'1',elementKind,encoding:'member_ordinals',inventory,
      values:values.map(ref=>{const ordinal=ordinals.get(ref);assert.notEqual(ordinal,undefined,'member ref must bind the exact inventory');return ordinal;})}
   : {kind:'qualification_reference_set',schemaVersion:'1',elementKind,encoding:'refs',values:[...values]};
  const authored=identity(body,'setRef','setDigest','qualification-set://abiogenesis/');
  const existing=sets.get(authored.setRef);
  if(existing)assert.deepEqual(existing,authored,'intern only identical complete bodies');else sets.set(authored.setRef,authored);
  return {ref:authored.setRef,digest:authored.setDigest};
 };
 const groups=rows=>rows.map(g=>({groupRef:g.groupRef,memberSet:set('memberRefs',g.memberRefs),
  rootSet:set('rootRefs',g.rootRefs),roleSet:set('surfaceRoles',g.surfaceRoles),
  ownerSet:set('ownerRefs',g.ownerRefs),sourceSet:set('sourceRefs',g.sourceRefs)}));
 const surfaceGroups=groups(scope.surfaceGroups);
 const domains=scope.applicationDomains===undefined?undefined:scope.applicationDomains.map(d=>({ruleGroupRef:d.ruleGroupRef,surfaceGroups:groups(d.surfaceGroups)}));
 if(domains!==undefined){
  assert.equal(domains.length,scope.ruleGroups.length,'no sparse override or fallback');
  assert.equal(new Set(domains.map(d=>d.ruleGroupRef)).size,domains.length);
  assert.deepEqual(domains.map(d=>d.ruleGroupRef).slice().sort(),scope.ruleGroups.map(g=>g.groupRef).slice().sort());
 }
 return identity({kind:'qualification_scope_interned',schemaVersion:'1',subjectBasis:scope.subjectBasis,
  lawBasis:scope.lawBasis,catalog:scope.catalog,inventory,ruleGroups:scope.ruleGroups,surfaceGroups,
  referenceSets:[...sets.values()].sort((a,b)=>a.setRef<b.setRef?-1:a.setRef>b.setRef?1:0),
  ...(domains===undefined?{domainMode:'global'}:{domainMode:'per_rule',applicationDomains:domains})},
  'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
}
