import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const repo='/Users/jim/src/apps/abiogenesis',tenant=repo+'/build_tenants/abiogenesis/typescript',work=repo+'/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const candidate=work+'/candidate-16',phase=work+'/operator/candidate16-publication-36',packaged=candidate+'/scratch/successor/package';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const pin=async path=>{const status=await lstat(path);assert(status.isFile()&&!status.isSymbolicLink(),path);const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};
const record=async(path,value)=>writeFile(path,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const manifest=await json(packaged+'/product-toolchain-manifest.json');
const product=await import(pathToFileURL(packaged+'/build/code/src/product/index.js').href);
const activation=await json(phase+'/activation.json'),mechanical=await json(phase+'/mechanical-result.json');
const comparison=await json(candidate+'/member-delta.json'),verification=await json(candidate+'/owner-verification.json');
const archive=mechanical.archive;
const ownerJoins={productContentDigest:manifest.productContentDigest,canonicalManifestDigest:product.sha256Canonical(manifest),manifestByteSha256:(await pin(packaged+'/product-toolchain-manifest.json')).sha256,capabilityGraphDigest:manifest.capabilityDefinitionGraph.graphDigest,capabilityAssetDigest:manifest.capabilityDefinitionGraph.assetLocator.digest,publicContractCatalogDigest:manifest.publicContractCatalog.catalogDigest,contributionManifestDigest:manifest.contributionManifestDigest,publicationBindingCount:manifest.contributionManifest.publicationBindings.length,contributionRowCount:manifest.contributionManifest.rows.length,payloadCount:verification.projection.checkedPayloadFiles,publicContractCount:manifest.publicContractCatalog.rows.length,canonicalPackagedOwnerVerified:verification.projection.disposition==='verified'};
assert.equal(ownerJoins.canonicalManifestDigest,verification.projection.manifestDigest);
const meanings={
 'package/build/code/src/abg/event_body_encoding.d.ts':'accepted35 declaration for provenance-preserving detached live capture',
 'package/build/code/src/abg/event_body_encoding.js':'accepted35 exact earlier committed body reuse and unchanged durable codec',
 'package/build/code/src/abg/event_store.js':'accepted35 current-prefix source membership, capture owner handoff',
 'package/build/code/src/shared/canonical_json.d.ts':'accepted35 declaration of shared canonical traversal sink',
 'package/build/code/src/shared/canonical_json.js':'accepted35 one traversal for text and digest views',
 'package/build/code/src/shared/digests.js':'accepted35 incremental canonical byte SHA256',
 'package/contracts/capabilities/capability-definition-graph.json':'normal content-addressed identity consequences, exact35 frozen graph',
 'package/product-toolchain-manifest.json':'normal content/graph/catalog/contribution identity consequences, exact35 frozen manifest'
};
assert.deepEqual(comparison.exactFrozen35Delta.map(v=>v.path).sort(),Object.keys(meanings).sort());
const expectedFixtures=['package/node_modules/json-schema-traverse/spec/fixtures/schema.js','package/node_modules/fast-uri/test/fixtures/uri-js-parse.json','package/node_modules/fast-uri/test/fixtures/uri-js-serialize.json'];
assert.deepEqual(comparison.fixtureMembers.sort(),expectedFixtures.sort());
const identity={archive,baselineArchive:activation.fixedPins.find(v=>v.path.endsWith('/candidate-15/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz')),sourceCommit:'0b1187c40cca619b26b56b24b72cf8beb4841310',acceptedSource35:{return:activation.fixedPins[1],readiness:activation.fixedPins[2],freeze:activation.fixedPins[3],rootClosedSourceAndProofGO:true},all947SelectedInputsFreshlyConserved:mechanical.all947SelectedPinsStillExact,sourcePostimages:mechanical.sourcePins,generatedDelta:mechanical.generatedDelta,memberComparison:await pin(candidate+'/member-delta.json'),packagedDeltaMeanings:meanings,archiveMemberCount:comparison.memberCount,sameMemberPathsTypesModes:true,unchangedMemberCount:comparison.unchangedMemberCount,metadataDependenciesExportsAndPublicMeaningConserved:true,publicCatalogExact74Consequences:await pin(candidate+'/catalog-owner-derivation.json'),publicCatalogNonDigestChanges:0,externalTestCampaignFixturesExcluded:true,allowedDependencyFixtureMembers:expectedFixtures,ownerJoins,ownerVerification:await pin(candidate+'/owner-verification.json'),packCount:1,buildCount:0,nativeCredit:false,scope:'Unreleased immutable candidate; installed/native/UAT/recovery/whole-memory closure and release remain unearned.'};
await record(candidate+'/identity.json',identity);
const pack=mechanical.commandScalars.find(v=>v.label==='pack'),owner=mechanical.commandScalars.find(v=>v.label==='packaged-owner');
const summary=`Writer36 candidate16 FROZEN: one unreleased successor from accepted/built Writer35; source/generated inputs conserved; no rebuild/install/actor/Run.\nArchive ${archive.sha256} /${archive.byteCount}B; content ${ownerJoins.productContentDigest}; canonical manifest ${ownerJoins.canonicalManifestDigest}.\nAll5265 members compared against immutable15: same paths/types/modes; exactly8 accepted35 generated byte changes,5257 unchanged.\nMetadata/deps/exports/Public75/10bindings/47contributions/roles/instruction metadata conserved; external ABG/campaign fixtures excluded, only3 identical dependency fixtures.\nAll74 Public catalog consequences canonically recomputed:50 canonical_json.d.ts declaration digests+23 contract digests+1 catalog digest; no other Public field change or arbitrary digest omission.\nOne pack exit0/${pack.wallMs}ms; actual packaged verifyProduct verified/${verification.wallMs}ms (outer ${owner.wallMs}ms),5263 payload files; no timeout/truncation.\nAll947 selected current35/predecessor/method pins fresh before and after publication. SHA sourceCommit0b1187c4 is provenance; exact dirty successor is bound by content/manifest/archive.\nRoot conjoined35 bounded17/18 readiness; t288line59 is retained unchanged historical expectation outside trusted-desktop claims, no18green/tamper claim. Authentic memory lane remains bounded only.\nPrior8 genuine detections/8restores and Accounting active/unexecuted remain oldRun evidence only; candidate16 earns no native/UAT/recovery/application-completion/qualification/release credit.\nAll publication effects stopped; Root owns independent review and subsequent activation.\n`;
await record(candidate+'/return.md',summary);
const readiness={role:'Writer36 Candidate Publication',status:'FROZEN_READY_FOR_INDEPENDENT_REVIEW',candidateIdentity:await pin(candidate+'/identity.json'),candidateReturn:await pin(candidate+'/return.md'),source35:identity.acceptedSource35,ownerJoins,memberCount:5265,exactFrozenGeneratedDeltaCount:8,publicCatalogExactConsequences:comparison.exactSupportedCatalogChanges,all947InputsConserved:true,commandScalars:mechanical.commandScalars,sourceAndGeneratedEdits:0,buildCount:0,packCount:1,nativeCredit:false,remaining:'Independent publication review/Executive acceptance; no execution or installed-memory closure claimed.',claimLimits:identity.scope};
await record(phase+'/readiness.json',readiness);
await record(phase+'/return.md',summary+`Exact candidate identity ${readiness.candidateIdentity.sha256}; accepted35 freeze ${identity.acceptedSource35.freeze.sha256}.\n`);
const ledger=[];
for(const root of [candidate,phase])for(const name of await readdir(root)){
 const path=root+'/'+name,status=await lstat(path);
 if(status.isFile())ledger.push(await pin(path));
}
for(const name of await readdir(candidate+'/commands'))ledger.push(await pin(candidate+'/commands/'+name));
for(const row of [...activation.fixedPins,...mechanical.sourcePins,...mechanical.generatedDelta.map(v=>v.postimage)]){
 assert.deepEqual(await pin(row.path),row);ledger.push(row);
}
const unique=[...new Map(ledger.map(v=>[v.path,v])).values()].sort((a,b)=>a.path.localeCompare(b.path));
const at=new Date().toISOString();
await record(candidate+'/freeze.json',{role:'Writer36 publication',status:'FROZEN',at,archive,identity:readiness.candidateIdentity,return:readiness.candidateReturn,ownerJoins,ledger:unique,sourceFreeze:identity.acceptedSource35.freeze,packCount:1,buildCount:0,nativeCredit:false,stopped:true});
await record(phase+'/freeze.json',{role:'Writer36 publication',status:'FROZEN_STOP',at,return:await pin(phase+'/return.md'),readiness:await pin(phase+'/readiness.json'),candidateFreeze:await pin(candidate+'/freeze.json'),candidateIdentity:readiness.candidateIdentity,ledger:unique,packCount:1,buildCount:0,noNativeCredit:true,stopped:true});
console.log(JSON.stringify({status:'FROZEN_STOP',archive,ownerJoins,candidateIdentity:readiness.candidateIdentity,candidateFreeze:await pin(candidate+'/freeze.json'),return:await pin(phase+'/return.md'),readiness:await pin(phase+'/readiness.json'),freeze:await pin(phase+'/freeze.json'),ledgerRows:unique.length}));
