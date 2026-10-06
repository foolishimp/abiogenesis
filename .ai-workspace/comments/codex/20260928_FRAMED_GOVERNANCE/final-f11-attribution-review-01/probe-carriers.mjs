/** Pure branch discriminators on exact retained bytes. NOT qualified tasks,
 * judgments, authors, grants or launch inputs. The partial record has no raw
 * attribution assertions; null identity/authority deliberately remain null.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const D=path.dirname(fileURLToPath(import.meta.url)),G=path.dirname(D),R=path.resolve(G,'../../../..');
const C=path.join(G,'final-candidate-construction-01'),A=path.join(G,'final-f11-attribution-inputs-01');
const I=path.join(C,'install/node_modules/@abiogenesis/typescript-tenant');
const {projectExternalConstructionAttribution:project}=await import(pathToFileURL(path.join(I,'build/code/src/validator/qualification.js')));
const {sha256Bytes:sha,sha256Canonical:hash}=await import(pathToFileURL(path.join(I,'build/code/src/shared/digests.js')));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const inputs=[];
function bytes(p){const b=fs.readFileSync(p);inputs.push({path:path.relative(R,p),bytes:b.length,sha256:sha(b).slice(7)});return b;}
function record(ref,p,b=bytes(p)){return {ref,path:path.relative(R,p),digest:sha(b),byteCount:b.length,contentBase64:b.toString('base64')};}
function derived(label,value){const b=Buffer.from(typeof value==='string'?value:JSON.stringify(value));return {ref:'diagnostic-derived://attribution-review/'+label,path:'diagnostic-derived/'+label,digest:sha(b),byteCount:b.length,contentBase64:b.toString('base64')};}
const material=read(path.join(A,'external-record-materials.json'));
const fragments=read(path.join(A,'source-chain-inputs.json')).chains;
for(const m of material.records){const b=Buffer.from(m.contentBase64,'base64');assert.equal(b.length,m.byteCount);assert.equal(sha(b),m.digest);}
function span(r){return {sourceRef:r.ref,startByte:0,endByte:r.byteCount,spanDigest:r.digest};}
function probe(chains,records,members){
 const provenance={kind:'external_construction',subjectInventory:material.recordSet,
  recordSet:{ref:'diagnostic-record-set://attribution-review/'+hash(records).slice(7),digest:hash(records)},records,chains,acknowledgmentSelectionRef:null};
 // Authority equality is held constant at the original missing null field to
 // isolate byte/record branches. Full provenance/plan schemas are NOT claimed.
 return project({task:{provenance,subjectMembers:members,material:[]},raw:{attributions:[]}}, {ownerAuthorityRef:null});
}
const results=[];const derivedRecords=[];
for(const f of fragments){
 const chain=structuredClone(f.candidateChain),records=structuredClone(material.records);
 const before=probe([chain],records,chain.postimageMembers);assert.equal(before.status,'invalid');
 if(f.sourceActivation==='T287_S03_PUBLIC_HANDOFF_REPAIR_01'){
  const original=records.find(r=>r.ref===chain.closureRef),value=JSON.parse(Buffer.from(original.contentBase64,'base64'));
  const normalized=value.sources.map(s=>({...s,path:path.relative(R,s.path)}));
  const adapted=derived('handoff-closure-path-view.json',{kind:'derived_original_record_path_view',
   original:{ref:original.ref,digest:original.digest},rule:'absolute source path within exact declared repository root -> corresponding repository-relative candidate path',
   repositoryRoot:R,members:normalized,limit:'Identity-preserving representation only; this is not the original closure or new author evidence.'});
  records.push(adapted);derivedRecords.push(adapted);chain.closureRef=adapted.ref;chain.attributionSources.push(span(adapted));
 }else{
  const original=records.find(r=>r.ref===chain.deltaRef),text=Buffer.from(original.contentBase64,'base64').toString('utf8');
  const converted=text.replace(/^--- before\//gm,'--- a/').replace(/^\+\+\+ after\//gm,'+++ b/');
  assert.equal(text.split('\n').filter(l=>!l.startsWith('--- ')&&!l.startsWith('+++ ')).join('\n'),converted.split('\n').filter(l=>!l.startsWith('--- ')&&!l.startsWith('+++ ')).join('\n'));
  const adapted=derived('selected-action-header-view.patch',converted);
  const relation=derived('selected-action-header-relation.json',{kind:'derived_original_delta_representation',original:{ref:original.ref,digest:original.digest},derived:{ref:adapted.ref,digest:adapted.digest},rule:'Only --- before/ and +++ after/ header prefixes become a/ and b/; original hunks and byte transitions conserved.',limit:'Not a newly performed patch or substitute original grant/author.'});
  records.push(adapted,relation);derivedRecords.push(adapted,relation);chain.deltaRef=adapted.ref;chain.attributionSources.push(span(relation));
 }
 const after=probe([chain],records,chain.postimageMembers);assert.equal(after.status,'insufficient');
 const omitted=probe([chain],records,[...chain.postimageMembers,{ref:'diagnostic://not-covered-member'}]);assert.equal(omitted.status,'invalid');
 results.push({case:f.sourceActivation,actualCurrentMembers:chain.postimageMembers,original:before,sourcePreservingRepresentation:after,missingMember:omitted,
  meaning:'All actual transitions reach attribution-insufficient after the stated representational change. No actor/authority correspondence or semantic J is established.'});
}

// Text transition representations for actual C preservation/generation. The
// resulting delta is newly derived from authentic endpoints and operation
// records; it is never called an original historical authored edit.
function fullDelta(p,before,after){
 const a=before.toString('utf8'),b=after.toString('utf8');assert(Buffer.from(a).equals(before)&&Buffer.from(b).equals(after));
 const split=s=>s.endsWith('\n')?s.slice(0,-1).split('\n'):s.split('\n');
 const aa=split(a),bb=split(b);
 const lines=['--- a/'+p,'+++ b/'+p,`@@ -1,${aa.length} +1,${bb.length} @@`];
 if(a===b)aa.forEach((l,n)=>{lines.push(' '+l);if(n===aa.length-1&&!a.endsWith('\n'))lines.push('\\ No newline at end of file');});
 else {aa.forEach((l,n)=>{lines.push('-'+l);if(n===aa.length-1&&!a.endsWith('\n'))lines.push('\\ No newline at end of file');});bb.forEach((l,n)=>{lines.push('+'+l);if(n===bb.length-1&&!b.endsWith('\n'))lines.push('\\ No newline at end of file');});}
 return lines.join('\n')+'\n';
}
const inventory=read(path.join(G,'final-qualification-inputs-01/qualification-inventory.json'));
const blob=read(path.join(A,'git-blob-correspondence.json')).records;
const actualCActivation=record('original://C/activation',path.join(C,'activation.json'));
const actualCClosure=record('original://C/freeze',path.join(C,'freeze.json'));
const actualPreparation=record('original://C/prepare',path.join(C,'prepare.py'));
const actualBuild=record('original://C/build',path.join(C,'build.json'));
const sourceManifest=record('original://C/source-members',path.join(C,'source-members.json'));
const generatedBefore=record('original://C/generated-before',path.join(C,'generated-before.json'));
const generatedAfter=record('original://C/generated-after',path.join(C,'generated-after.json'));
const t='build_tenants/abiogenesis/typescript/';
for(const [label,p,priorPath,postPath,operation] of [
 ['inherited-README-preservation','README.md',path.join(C,'source-freeze/repo/README.md'),path.join(C,'staged-repo/README.md'),'C.prepare.py actual copy/sha conservation; README exact frozen-head blob membership'],
 ['generated-unchanged',t+'build/code/src/abg/actor_process.js',path.join(C,'source-freeze/generated-preimages/build/code/src/abg/actor_process.js'),path.join(C,'staged-repo/'+t+'build/code/src/abg/actor_process.js'),'C build receipt plus exact generated preimage/postimage inventories'],
 ['generated-changed',t+'build/code/src/abg/project_read_definition_bindings.js',path.join(C,'source-freeze/generated-preimages/build/code/src/abg/project_read_definition_bindings.js'),path.join(C,'staged-repo/'+t+'build/code/src/abg/project_read_definition_bindings.js'),'C build receipt plus exact generated preimage/postimage inventories']
]){
 const m=inventory.members.find(m=>m.path===p),pre=record('original://'+label+'/preimage',priorPath),post=record('original://'+label+'/postimage',postPath);
 assert.equal(post.digest,m.digest);assert.equal(post.byteCount,m.byteCount);
 if(label.startsWith('inherited')){const original=blob.find(x=>x.path===p);assert.equal(original.currentDigest,m.digest);assert.equal(original.blobBytes.sha256,pre.digest.slice(7));assert.equal(original.sameBytesAtHead,true);}
 const preView=derived(label+'-preimage-view.json',{kind:'derived_record_member_view',operation,originalRefs:[sourceManifest.ref,generatedBefore.ref],members:[{path:p,digest:pre.digest}],limit:'Exact byte preservation/generation basis; no semantic authorship inferred.'});
 const closureView=derived(label+'-closure-view.json',{kind:'derived_record_member_view',operation,originalClosure:{ref:actualCClosure.ref,digest:actualCClosure.digest},originalPostimageManifests:[sourceManifest.ref,generatedAfter.ref],members:[{path:p,digest:post.digest}],limit:'Not an original closure; exact source/member representation only.'});
 const patch=derived(label+'-derived-transition.patch',fullDelta(p,Buffer.from(pre.contentBase64,'base64'),Buffer.from(post.contentBase64,'base64')));
 const provenanceMeaning=derived(label+'-meaning.json',{kind:'diagnostic_derived_transition',operation,preimage:{ref:pre.ref,digest:pre.digest},postimage:{ref:post.ref,digest:post.digest},derivedDelta:{ref:patch.ref,digest:patch.digest},
  actualConstructionRecords:[actualCActivation.ref,actualPreparation.ref,actualBuild.ref,actualCClosure.ref],
  attribution:'No author claim. Original semantic authors, relevant construction/import actor and assessor independence remain source-grounded J or present scoped acknowledgment where permitted.',
  preservation:pre.digest===post.digest,limit:'This text hunk represents actual preserved/generated bytes, not proof of an original editing event.'});
 const records=[actualCActivation,actualCClosure,actualPreparation,actualBuild,sourceManifest,generatedBefore,generatedAfter,pre,post,preView,closureView,patch,provenanceMeaning];
 const chain={activationRef:actualCActivation.ref,preimageRef:preView.ref,deltaRef:patch.ref,closureRef:closureView.ref,
  authorRef:JSON.parse(Buffer.from(actualCActivation.contentBase64,'base64')).worker,actorIdentityRef:null,authorityRef:null,
  scopeRefs:[m.ref],postimageMembers:[{ref:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount}],
  changes:[{memberRef:m.ref,patchPath:p,preimageMemberRef:pre.ref,postimageMemberRef:post.ref}],
  attributionSources:[span(actualCActivation),span(closureView),span(provenanceMeaning)]};
 const result=probe([chain],records,chain.postimageMembers);assert.equal(result.status,'insufficient');
 derivedRecords.push(preView,closureView,patch,provenanceMeaning);
 results.push({case:label,member:chain.postimageMembers[0],preimageDigest:pre.digest,postimageDigest:post.digest,result,
  identicalEndpoints:pre.digest===post.digest,operation,meaning:'Representable structural relation only. No original edit, actor or semantic authorship is inferred.'});
}
const output={status:'pure_partial_record_branch_discriminators_NOT_assurance',
 fullQualificationSchemasSatisfied:false,actualJudgments:0,nativeEffects:0,
 controlledVariables:'Original missing actorIdentityRef and authorityRef stay null; plan.ownerAuthorityRef is also null only to isolate byte/representation branches. All raw attribution arrays remain empty. No complete plan/task/J is constructed.',
 originalRecordSet:material.recordSet,results,
 conclusion:'Exact retained changed, preserved and generated text can reach insufficient without a qualification-owner edit. This proves representability, not attribution sufficiency, operation authority, semantic scope, independence or final qualification.',
 sourceInputs:inputs};
fs.writeFileSync(path.join(D,'carrier-probe-results.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(D,'diagnostic-derived-records.json'),JSON.stringify({status:'derived diagnostic data; NOT original construction records or ready provenance',records:derivedRecords},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:results.map(r=>({case:r.case,status:r.sourcePreservingRepresentation?.status??r.result.status})),nativeEffects:0,actualJudgments:0},null,2));
