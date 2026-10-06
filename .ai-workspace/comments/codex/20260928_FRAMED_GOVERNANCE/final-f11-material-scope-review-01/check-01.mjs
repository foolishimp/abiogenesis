import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
const D=path.dirname(fileURLToPath(import.meta.url)), G=path.dirname(D), R=path.resolve(G,'../../../..');
const S=path.join(G,'final-f11-scope-inputs-01'), C=path.join(G,'final-candidate-construction-01'), C2=path.join(G,'final-candidate-construction-02'), Q2=path.join(G,'final-qualification-inputs-02');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')), sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const ensure=(ok,msg)=>{if(!ok)throw new Error(msg);};
const subjectExpected={
 'final-f11-material-scope-review-controls-01/request.txt':'312bd739c6066c9c6beb81f45190ad29a3f1e878cc2123933cf2c5f62d7ca8ef',
 'final-f11-scope-inputs-01/return.md':'c8e8493cdf143d432b92839b0d9638644cd6fb912d9e0b2b746f0d05e378c50e',
 'final-f11-scope-inputs-01/freeze.json':'e6ef1710c98f26da61bde1111ec71af5739e829e2dbee25c5de1b6c2977f5545',
 'final-candidate-construction-01/freeze.json':'f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f',
 'final-qualification-inputs-01/freeze.json':'0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe',
 'final-candidate-construction-02/freeze.json':'7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469',
 'final-qualification-inputs-02/freeze.json':'a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'
};
const exactSubjects=Object.entries(subjectExpected).map(([p,h])=>{const b=fs.readFileSync(path.join(G,p));ensure(sha(b)===h,'subject hash '+p);return {path:p,bytes:b.length,sha256:h};});
const freeze=read(path.join(S,'freeze.json'));let frozenBytes=0;
for(const m of freeze.records){const p=path.resolve(S,m.path);ensure(p.startsWith(S+'/'),'outside scope freeze');const b=fs.readFileSync(p);ensure(b.length===m.bytes&&sha(b)===m.sha256,'frozen record '+m.path);frozenBytes+=b.length;}
ensure(freeze.records.length===4900&&frozenBytes===634234882,'frozen population');
const definition=fs.readFileSync(path.join(R,'stdo_abiogenesis.json'));ensure(sha(definition)==='2c13b1fd28f3aaa624d941537a858f67ca8784f0710f490522147f57964c4051','selected definition');
const installed=path.join(C,'install/node_modules/@abiogenesis/typescript-tenant'), installed2=path.join(C2,'install/node_modules/@abiogenesis/typescript-tenant');
const ownerMembers=['build/code/src/validator/qualification.js','build/code/src/validator/qualification_contracts.js','build/code/src/validator/self_conformance.js','build/code/src/shared/digests.js','build/code/src/shared/canonical_json.js','contracts/qualification/rule-catalog.json','contracts/qualification/coverage.json'];
const ownerConservation=ownerMembers.map(p=>{const a=fs.readFileSync(path.join(installed,p)),b=fs.readFileSync(path.join(installed2,p));ensure(a.equals(b),'changed qualification owner '+p);return {path:p,bytes:a.length,sha256:sha(a),sameC02:true};});
const scope=read(path.join(S,'scope-body.json')), preview=read(path.join(S,'structural-preview.json')), cat=read(path.join(installed,'contracts/qualification/rule-catalog.json'));
const helper=await import(pathToFileURL(path.join(S,'bind-assessment-input.mjs')));
const scopePreview=preview.scope??preview;
const ownerDiagnostics=helper.owner.qualificationScopeCorrespondence(scopePreview,cat,scope.catalog.digest);
ensure(ownerDiagnostics.length===0,'scope correspondence '+JSON.stringify(ownerDiagnostics));
const index=read(path.join(S,'body-input-index.json'));
const labels=[...new Set(['rule-154-0','rule-155-0','inventory-0',...Object.keys(index.byRole).flatMap(role=>{const p=index.packets.filter(p=>p.role===role);return [p.reduce((a,b)=>a.providedBodyBytes<b.providedBodyBytes?a:b).label,p.reduce((a,b)=>a.providedBodyBytes>b.providedBodyBytes?a:b).label];})])];
const metrics=[];
function measure(selected){const x=helper.loadBodyInputs(selected);let raw=0,sourceSegment=0;const sources=[];for(const m of x.material){const b=Buffer.from(m.contentBase64,'base64');const segment='SOURCE DATA '+m.ref+' '+m.digest+'\n'+JSON.stringify(b.toString('utf8'));raw+=b.length;sourceSegment+=Buffer.byteLength(segment);sources.push({ref:m.ref,path:m.path,bytes:b.length,renderedSourceSegmentBytes:Buffer.byteLength(segment),digest:m.digest});}sourceSegment+=Math.max(0,x.material.length-1)*2;return {labels:selected,role:x.roleName,criteria:x.coverage.length,assessedMembers:x.subjectMembers.length,providedBodies:x.material.length,rawBytes:raw,exactSourceSegmentBytes:sourceSegment,contextJsonBytes:Buffer.byteLength(JSON.stringify(x.context)),unprovidedAssessedMemberRefs:x.subjectMembers.filter(m=>!x.material.some(n=>n.ref===m.ref)).map(m=>m.ref),largestSources:sources.sort((a,b)=>b.bytes-a.bytes).slice(0,12),measurement:'Exact owner line532 SOURCE DATA segment rendering only; lower bound, not a complete valid qualificationWorkerRequest or provider capacity claim.'};}
for(const label of labels){const m=measure([label]), row=index.packets.find(p=>p.label===label);ensure(m.rawBytes===row.providedBodyBytes,'selected raw size '+label);metrics.push(m);}
const union=measure(['rule-154-0','rule-155-0']);
const classification=read(path.join(S,'member-classification.json')), byRef=new Map(classification.records.map(m=>[m.ref,m]));
const domain=scope.applicationDomains[154].surfaceGroups[0];
const cohortCounts={};for(const ref of domain.memberRefs){const c=byRef.get(ref).cohort;cohortCounts[c]=(cohortCounts[c]??0)+1;}
const rule154=cat.rules.find(r=>scope.ruleGroups[154].ruleRefs.includes(r.ruleRef));
const population=read(path.join(Q2,'qualification-member-correspondence.json'));const changed=population.members.filter(m=>!m.byteIdentityPreserved), rebound=population.members.filter(m=>!m.logicalPathPreserved);
ensure(population.members.length===1950&&changed.length===16&&rebound.length===19,'successor population');
for(const m of population.members){const b=fs.readFileSync(m.successorPhysicalOrigin);ensure(b.length===m.successor.byteCount&&'sha256:'+sha(b)===m.successor.digest,'successor body '+m.successor.ref);}
const observations={claim:'bounded independent deterministic correspondence and selected presentation measurements; no native-ready model',exactSubjects,frozenScope:{records:freeze.records.length,bytes:frozenBytes},ownerConservation,scope:{rules:cat.rules.length,sources:cat.sources.length,members:scope.inventory.members.length,ruleGroups:scope.ruleGroups.length,surfaceGroups:scope.surfaceGroups.length,domainPartitions:scope.applicationDomains.reduce((n,d)=>n+d.surfaceGroups.length,0),ownerDiagnostics},bodySelections:index.byRole,metrics,sameRoleUnion:union,counterexample:{label:'rule-154-0',rule:rule154,cohortCounts},successor:{population:population.members.length,changed:changed.map(m=>({kind:m.kind,original:m.original,successor:m.successor})),rebound:rebound.map(m=>({kind:m.kind,oldPath:m.original.path,newPath:m.successor.path,byteIdentityPreserved:m.byteIdentityPreserved})),allSuccessorBodiesVerified:true},limits:['No binding.basis/task/plan/author/declaration fabricated','qualificationWorkerRequest not invoked without real completed basis/provenance/plan','No moving Q02 review or native03/04 accessed','No semantic catalog or all-rule verdict','No candidate, native, provider or package effects']};
fs.writeFileSync(path.join(D,'observations-01.json'),JSON.stringify(observations,null,2)+'\n');
console.log(JSON.stringify({frozenScope:observations.frozenScope,scope:observations.scope,metrics:metrics.map(({largestSources,unprovidedAssessedMemberRefs,...m})=>({...m,unprovidedMembers:unprovidedAssessedMemberRefs.length})),union:{rawBytes:union.rawBytes,sourceSegmentBytes:union.exactSourceSegmentBytes,bodies:union.providedBodies,criteria:union.criteria},counterexample:observations.counterexample,successor:{members:population.members.length,changed:changed.length,rebound:rebound.length}},null,2));
