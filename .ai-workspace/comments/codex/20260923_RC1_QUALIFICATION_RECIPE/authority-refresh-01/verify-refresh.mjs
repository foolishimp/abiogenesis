// Mechanical correspondence only: no generation, test commands, owner effects or native runtime.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';
const D=import.meta.dirname,R='/Users/jim/src/apps/abiogenesis',T=path.join(R,'build_tenants/abiogenesis/typescript');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const rec=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const save=(n,x)=>fs.writeFileSync(path.join(D,n),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const start=performance.now();
try{
const q=await import(pathToFileURL(path.join(T,'build/code/src/validator/qualification_contracts.js')).href);
const product=await import(pathToFileURL(path.join(T,'build/code/src/product/index.js')).href);
const {parseProductManifest}=await import(pathToFileURL(path.join(T,'build/code/src/product/verify_product.js')).href);
const v=createRequire(path.join(T,'package.json'))('valibot');
const before=read(path.join(D,'preimages.json')),originals=read(path.join(D,'original-source-bindings.json')),core=before.candidate;
const input=read(path.join(T,'contracts/qualification/authority-inputs.json')),catalog=read(path.join(T,'contracts/qualification/rule-catalog.json')),law=read(path.join(T,'contracts/qualification/law-basis.json')),coverage=read(path.join(T,'contracts/qualification/coverage.json'));
const oldCoverage=read(path.join(core.packageRoot,'contracts/qualification/coverage.json'));
assert.deepEqual(coverage.claims,oldCoverage.claims);assert.equal(coverage.claims.length,16);assert.equal(coverage.claims.reduce((n,x)=>n+x.behaviors.length,0),66);
const frozenSources=new Map();
for(const s of input.sources){const raw=fs.readFileSync(path.join(T,s.path));assert.equal('sha256:'+sha(raw),s.digest);assert.equal(raw.length,s.byteCount);
 const origin=s.ref.startsWith('repo://abiogenesis/')?path.join(R,s.ref.slice('repo://abiogenesis/'.length)):path.join('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1',s.ref.slice('stdo://releases/v2.5.1-rc.1/'.length));
 assert.equal(rec(origin).sha256,sha(raw),'original source mismatch '+s.ref);frozenSources.set(s.ref,raw);
}
for(const s of originals.sources)assert.equal(rec(s.path).sha256,s.sha256,'source changed during generation '+s.path);
assert.equal(rec(originals.exactStdoManifest.path).sha256,originals.exactStdoManifest.sha256);
assert.deepEqual(catalog.sources,input.sources);assert.deepEqual(law.sources,input.sources);
assert.deepEqual(catalog.method,input.method);
v.parse(q.QUALIFICATION_RULE_CATALOG_SCHEMA,catalog);v.parse(q.QUALIFICATION_LAW_BASIS_SCHEMA,law);v.parse(q.QUALIFICATION_COVERAGE_CATALOG_SCHEMA,coverage);
assert.ok(q.qualificationIdentity(law,'lawBasisRef','lawBasisDigest','qualification-law://abiogenesis/'));
assert.ok(q.qualificationIdentity(coverage,'catalogRef','catalogDigest','qualification-coverage://abiogenesis/'));
assert.equal(law.catalog.digest,'sha256:'+rec(path.join(T,law.catalog.assetPath)).sha256);
assert.deepEqual(coverage.lawBasis,{ref:law.lawBasisRef,digest:law.lawBasisDigest});
for(const rule of catalog.rules){const raw=frozenSources.get(rule.sourceRef);assert.ok(raw);assert.equal(rule.sourceDigest,'sha256:'+sha(raw));assert.ok(rule.startByte>=0&&rule.endByte<=raw.length&&rule.endByte>rule.startByte);assert.equal(rule.spanDigest,'sha256:'+sha(raw.subarray(rule.startByte,rule.endByte)));assert.equal(rule.applicability,'requires_admitted_judgment');}
for(const s of coverage.authoritySources)assert.ok(input.sources.some(x=>JSON.stringify(x)===JSON.stringify(s)));
const stage=read(path.join(D,'stage-authorities.stdout'));
for(const output of stage.outputs){const actual=rec(path.join(T,output.path));assert.equal('sha256:'+actual.sha256,output.sha256);assert.equal(actual.bytes,output.bytes);}
const manifest=read(path.join(T,'product-toolchain-manifest.json'));assert.ok(parseProductManifest(manifest));
const inventory=manifest.productRelativeLocators.map(p=>({path:p,sha256:'sha256:'+rec(path.join(T,p)).sha256}));
assert.equal(product.payloadInventoryDigest(inventory),manifest.productContentDigest);
assert.equal(product.sha256Canonical(manifest.contributionManifest),manifest.contributionManifestDigest);
const graphPath=manifest.capabilityDefinitionGraph.assetLocator.path;assert.equal('sha256:'+rec(path.join(T,graphPath)).sha256,manifest.capabilityDefinitionGraph.assetLocator.contentDigest);
const oldManifest=read(path.join(core.packageRoot,'product-toolchain-manifest.json'));
assert.equal(product.sha256Canonical(oldManifest),core.basis.manifestDigest);
assert.deepEqual(manifest.productRelativeLocators,oldManifest.productRelativeLocators,'package member population changed');
const preserved=read(path.join(D,'preservation-before.json')).members;
for(const row of preserved){const now=rec(path.join(T,row.path));assert.equal(now.sha256,row.sha256,'runtime/design changed '+row.path);assert.equal(now.bytes,row.bytes);}
const paths=[];function files(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())files(f);else{assert.ok(e.isFile(),'non-file generated member');paths.push(path.relative(T,f));}}}
files(path.join(T,'contracts'));files(path.join(T,'build/toolchain'));paths.push('product-toolchain-manifest.json');
assert.deepEqual(paths.sort(),before.members.map(x=>x.path).sort(),'generated member population changed');
const changed=[],unchanged=[];
for(const row of before.members){const actual=rec(path.join(T,row.path));const origin=rec(row.preimage);assert.equal(origin.sha256,row.sha256,'core44 changed '+row.path);assert.equal(origin.bytes,row.bytes);if(actual.sha256!==row.sha256)changed.push({path:row.path,before:{sha256:row.sha256,bytes:row.bytes,origin:row.preimage},after:{sha256:actual.sha256,bytes:actual.bytes}});else unchanged.push(row.path);}
assert.equal('sha256:'+rec(core.artifactPath).sha256,core.basis.artifactDigest);
const previous=path.join(R,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/core44-preparation-01');const previousFreeze=read(path.join(previous,'freeze.json'));
for(const row of previousFreeze.files){const r=rec(path.join(previous,row.path));assert.equal(r.sha256,row.sha256);assert.equal(r.bytes,row.bytes);}
const allowed=new Set(['contracts/qualification/authority-inputs.json','contracts/qualification/rule-catalog.json','contracts/qualification/law-basis.json','contracts/qualification/coverage.json','contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json',...originals.sources.filter(x=>x.changedFromFrozen).map(x=>x.frozenCopy)]);
assert.deepEqual(changed.map(x=>x.path).sort(),[...allowed].sort(),'unexpected owner delta');
save('delta.json',{status:'EXACT_DERIVED_BINDING_DELTA',changed,unchangedCount:unchanged.length,added:[],removed:[],runtimeSourceAndEmissionUnchanged:true});
save('successor-identity.json',{status:'SOURCE_GENERATION_SUCCESSOR_NO_ARCHIVE',sourceBaseCommit:originals.sourceCommit,delta:rec(path.join(D,'delta.json')),productContentDigest:manifest.productContentDigest,manifestDigest:product.sha256Canonical(manifest),manifestFile:rec(path.join(T,'product-toolchain-manifest.json')),lawBasis:{ref:law.lawBasisRef,digest:law.lawBasisDigest},coverageCatalog:{ref:coverage.catalogRef,digest:coverage.catalogDigest},artifact:null,installedProduct:null,qualificationBasis:null,predecessorArchive:core.basis.artifactDigest});
const checks={status:'PASSED_BOUNDED_AUTHORITY_REFRESH',sourceBindings:input.sources.length,repoOriginalBindings:originals.sources.length,stdoBindings:input.sources.length-originals.sources.length,currentSourceCopies:true,ruleSpansChecked:catalog.rules.length,ruleCatalogSchema:true,lawBasisSchemaAndIdentity:true,coverageSchemaAndIdentity:true,coverageClaims:16,coverageBehaviors:66,coverageClaimsByteEquivalent:true,stageAndManifestQualificationOutputsIdentical:true,selfConformanceSchemaUnchanged:unchanged.includes('contracts/schemas/self-conformance.schema.json'),manifestParser:true,manifestPayloadMembersChecked:inventory.length,manifestPopulationUnchanged:true,generatedMembers:before.members.length,generatedChanged:changed.length,generatedUnchanged:unchanged.length,generatedAdded:0,generatedRemoved:0,runtimeSourceMembers:preserved.filter(x=>x.path.startsWith('code/')).length,runtimeEmissionMembers:preserved.filter(x=>x.path.startsWith('build/code/')).length,designMembers:preserved.filter(x=>x.path.startsWith('design/')).length,preservedMembers:preserved.length,core44ArchiveAndPreimageInstallUnchanged:true,priorFrozenPreparationMembersUnchanged:previousFreeze.files.length,originalSourceBytesUnchanged:true,qualificationGatesPassed:0,testCommandsRun:0,nativeActors:0,archivesCreated:0,installs:0,elapsedMs:performance.now()-start};save('checks.json',checks);console.log(JSON.stringify(checks));
}catch(error){save('verification-recheck-failure.json',{message:String(error?.message??error),stack:String(error?.stack??'')});console.error(error);process.exitCode=1;}
