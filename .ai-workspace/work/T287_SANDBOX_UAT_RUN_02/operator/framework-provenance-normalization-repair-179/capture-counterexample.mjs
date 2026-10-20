import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

const phase=path.dirname(new URL(import.meta.url).pathname);
const campaign=path.resolve(phase,'../..');
const stopped=path.join(campaign,'operator/installed-current-source-preparation-176');
const ledger=JSON.parse(fs.readFileSync(path.join(stopped,'freeze.json'),'utf8')).files;
const read=name=>{
  const file=path.join(stopped,name),bytes=fs.readFileSync(file),pin=ledger.find(row=>row.path===file);
  assert.ok(pin,`frozen176 member ${name}`);
  assert.equal(bytes.length,pin.byteCount);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pin.sha256);
  return JSON.parse(bytes);
};
const setup=read('current-setup.json'),historical=read('historical-source-discriminator.json');
const selectorFile=path.join(campaign,'operator/framework-repairs-successor-153/host-preparation/exacthost-identity.json');
const selector=JSON.parse(fs.readFileSync(selectorFile,'utf8'));
const root=path.join(selector.installedRoot,'build/code/src');
const closure=await import(pathToFileURL(path.join(root,'product/declaration_closure.js')));
const semantics=await import(pathToFileURL(path.join(root,'product/semantics.js')));
const shared=await import(pathToFileURL(path.join(root,'shared/canonical_json.js')));
const digest=await import(pathToFileURL(path.join(root,'shared/digests.js')));
const proof=historical.resource.declarationProof;
const old=closure.resolveProgramDeclarationClosure(proof.catalog,proof.catalogView,setup.program.programRef);
const current=closure.resolveProgramDeclarationClosure(setup.catalog,setup.catalogView,setup.program.programRef);
assert.equal(old.kind,'resolved_program_declaration_closure');
assert.equal(current.kind,'resolved_program_declaration_closure');
assert.equal(old.publications.length,4);assert.equal(current.publications.length,4);
assert.equal(semantics.compareGovernanceDeclarationPublications(old.publications,current.publications),null);
const normalize=(p,other)=>{
  const {artifactDigest,productContentDigest,productManifestDigest,descriptorRef,contributionManifestRef,contributions,...meaning}=p;
  const identityRef=(ref,opposite)=>{
    if(ref===opposite)return ref??null;if(ref===undefined)return null;
    const suffix=productContentDigest.slice(7);assert.ok(ref.endsWith(suffix));return ref.slice(0,-suffix.length);
  };
  return {...meaning,descriptorOwner:identityRef(descriptorRef,other.descriptorRef),contributionOwner:identityRef(contributionManifestRef,other.contributionManifestRef),
    contributions:contributions.map(row=>({...row,provenanceRefs:row.provenanceRefs.map(ref=>ref===artifactDigest?'publication:artifact':ref===productManifestDigest?'publication:manifest':ref)}))};
};
const differences=(a,b,at='')=>{
  if(shared.canonicalJson(a)===shared.canonicalJson(b))return [];
  if(a&&b&&typeof a==='object'&&typeof b==='object'){
    const keys=new Set([...Object.keys(a),...Object.keys(b)]);
    return [...keys].flatMap(k=>differences(a[k]??null,b[k]??null,at+'/'+k));
  }
  return [{path:at,historical:a,current:b}];
};
const perPublication=old.publications.map(p=>{
  const next=current.publications.find(q=>q.moduleRef===p.moduleRef&&q.owningProductId===p.owningProductId);assert.ok(next);
  const a=normalize(p,next),b=normalize(next,p),diff=differences(a,b);
  assert.ok(diff.every(d=>/^\/contributions\/\d+\/provenanceRefs\/\d+$/.test(d.path)));
  for(const v of [a,b])for(const c of v.contributions)c.provenanceRefs.sort(shared.compareUnicodeCodeUnits);
  assert.equal(shared.canonicalJson(a),shared.canonicalJson(b));
  return {moduleRef:p.moduleRef,historicalPublicationDigest:digest.sha256Canonical(p),currentPublicationDigest:digest.sha256Canonical(next),differences:diff};
});
assert.equal(perPublication.reduce((n,p)=>n+p.differences.length,0),24);
const fixture={kind:'frozen_selected_declaration_pair',programRef:setup.program.programRef,
  historical:old.publications,current:current.publications,
  sourceCoordinates:ledger.filter(r=>['current-setup.json','historical-source-discriminator.json'].includes(path.basename(r.path)))};
fs.writeFileSync(path.join(phase,'inputs/actual176-selected-publications.json'),JSON.stringify(fixture,null,2)+'\n',{flag:'wx'});
const result={preimageComparatorResult:null,selectedPublications:4,orderOnlyCoordinates:24,perPublication,
  unchangedMeaningAfterOnlyRoleInventoryOrdering:true,
  completeProjectorFirstInnerRefusal:'unobserved; this is an independently reproduced sufficient blocker',
  authenticCatalogueReconstructionOrInvocationAdmissionClaim:false,actualCampaignEventResourceRead:false};
fs.writeFileSync(path.join(phase,'counterexample-before.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({preimageComparatorResult:null,selectedPublications:4,orderOnlyCoordinates:24,
  pairBytes:fs.statSync(path.join(phase,'inputs/actual176-selected-publications.json')).size,
  scope:'unchanged canonical closure/comparator owners on frozen176 captured declarations only'}));
