import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,mkdtemp,readFile,writeFile,rm,chmod} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import test from 'node:test';
import * as Effect from 'effect/Effect';
import * as product from '../../build/code/src/product/index.js';
import * as abg from '../../build/code/src/abg/index.js';
import * as events from '../../build/code/src/abg/event_store.js';
import * as env from '../../build/code/src/abg/environment_admission.js';
import * as artifact from '../../build/code/src/abg/artifact_truth.js';
import {constructExactOperationInvocationCoordinate} from '../../build/code/src/shared/operation_definition_coordinate.js';
import {constructQualificationIdentity} from '../../build/code/src/validator/qualification_contracts.js';
import {publishReleaseSnapshot,projectReleaseQualification} from '../../build/code/src/implementation/release_publication.js';
import {projectReleaseEvidence} from '../../build/code/src/product/project_read_ports.js';
const exec=promisify(execFile),h=product.sha256Canonical,bytesHash=product.sha256Bytes;
const proofRoot=process.env.ABI5_RELEASE_PROOF_ROOT;
assert.ok(proofRoot,'explicit disposable release-fixture territory required');
await mkdir(proofRoot,{recursive:true});
const git=async(root,args)=>(await exec('git',['-C',root,'-c','core.hooksPath=/dev/null',...args],{env:{...process.env,GIT_CONFIG_NOSYSTEM:'1'},maxBuffer:4*1024*1024})).stdout.trim();
const save=async(name,data)=>writeFile(join(proofRoot,name+'.json'),JSON.stringify(data,null,2)+'\n');
async function fixture(t,name){
 const root=await mkdtemp(join(proofRoot,name+'-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const sourceRoot=join(root,'source'),remote=join(root,'remote.git');await mkdir(sourceRoot);
 await git(sourceRoot,['init','-b','fixture']);await git(sourceRoot,['init','--bare',remote]);
 const body=Buffer.from('Disposable exact release source\n');await writeFile(join(sourceRoot,'subject.txt'),body);
 await git(sourceRoot,['add','subject.txt']);await git(sourceRoot,['-c','user.name=Bounded fixture','-c','user.email=fixture@example.invalid','commit','-m','fixture source']);
 const sourceCommit=await git(sourceRoot,['rev-parse','HEAD']),sourceTree=await git(sourceRoot,['rev-parse','HEAD^{tree}']);
 const inventory=constructQualificationIdentity({kind:'qualification_subject_inventory',coverage:'complete_claim',selectedRoots:['.'],members:[{ref:'fixture://subject',path:'subject.txt',digest:bytesHash(body),byteCount:body.length,surfaceRoles:['code'],classificationEvidenceRefs:['fixture://conditional']} ]},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 const artifactBytes=Buffer.from('Conditional physical-owner artifact; not a qualified ABI package\n'),claim=Buffer.from('Conditional fixture only; no release acceptance\n');
 const productContentDigest=h({fixture:name}),productId='product://fixture/release@5.0.0-rc.1';
 const manifest={productId,packageName:'@fixture/release',packageVersion:'5.0.0-rc.1',productContentDigest};
 const artifactPath=join(root,'input.tgz'),manifestPath=join(root,'manifest.json'),releaseClaimPath=join(root,'claim.md');
 await writeFile(artifactPath,artifactBytes);await writeFile(manifestPath,JSON.stringify(manifest));await writeFile(releaseClaimPath,claim);
 const identity={productId,namespace:'abiogenesis',profile:'one_project_unqualified',projectSubtree:'.',versionLine:'5.0.0',ordinal:1,version:'5.0.0-rc.1',releaseClaim:{ref:'fixture://claim',digest:bytesHash(claim)}};
 const basis={basisRef:'fixture://qualification-basis',basisDigest:h({fixture:name}),artifact:{ref:'fixture://artifact',digest:bytesHash(artifactBytes)},sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest},productManifest:{ref:'fixture://manifest',digest:h(manifest)},productContentDigest};
 const lawBasis={ref:'fixture://law',digest:h({fixture:'law'})},verdict={ref:'fixture://conditional-verdict',digest:h({fixture:'not-native'})};
 // This conditional premise exercises the physical leaf only. It cannot enter projectReleaseQualification or ABG as D5 evidence.
 const qualification={verdictRef:verdict.ref,verdictDigest:verdict.digest,subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis,disposition:'green',bypassRefs:[],selfConformance:{assessment:{ref:'fixture://conditional-physical-premise',digest:h({conditional:true})},disposition:'green'}};
 const request={qualificationBasis:basis,lawBasis,verdict,requestedIdentity:identity};
 const grant={kind:'release_publication_grant',sourceRoot,sourceCommit,sourceTree,sourceInventory:inventory,artifact:{path:artifactPath,...basis.artifact,snapshotName:'fixture.tgz',packageName:manifest.packageName},manifestPath,releaseClaimPath,remote,pushMode:'atomic',expectedLocalRefs:[],expectedRemoteRefs:[],carrierRefs:[{ref:'refs/heads/published-fixture',expectedObject:null}],snapshotRoot:join(root,identity.version),artifactOutputRoot:join(root,'observations'),tagger:{name:'Bounded fixture',email:'fixture@example.invalid',date:'1789984800 +0000'},tagMessage:'Conditional local physical-owner probe',buildCommand:'fixture: already built',packCommand:'fixture: bytes supplied; no pack executed'};
 await save(name+'-grant',{claim:'Disposable local Git/physical mechanics only; conditional qualification, no native D5 or release acceptance',request,grant,qualification});
 return {root,request,grant,qualification,sourceRoot,remote};
}
test('physical owner publishes exact conditional bytes and fresh process reacquires refs/checksums',async t=>{
 const f=await fixture(t,'physical-positive');const observed=await publishReleaseSnapshot(f.request,f.grant,f.qualification);
 assert.equal(observed.disposition,'complete',JSON.stringify(observed));assert.equal(observed.unknownEffects.length,0);
 const manifest=JSON.parse(await readFile(join(f.grant.snapshotRoot,'release-snapshot.json'),'utf8'));
 assert.deepEqual(manifest.verificationFacts,f.qualification);assert.deepEqual(manifest.assessmentCitation,f.qualification.selfConformance);
 assert.deepEqual(await readFile(join(f.grant.snapshotRoot,'fixture.tgz')),await readFile(f.grant.artifact.path));
 const script=`import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';const root=process.argv[1];const sums=(await readFile(root+'/SHA256SUMS','utf8')).trim().split('\\n');for(const line of sums){const [digest,name]=line.split('  ');if(createHash('sha256').update(await readFile(root+'/'+name)).digest('hex')!==digest)throw Error(name);}console.log(JSON.stringify({pid:process.pid,checksums:sums.length}));`;
 const cold=JSON.parse((await exec(process.execPath,['--input-type=module','-e',script,f.grant.snapshotRoot])).stdout);
 assert.notEqual(cold.pid,process.pid);assert.equal(cold.checksums,3);
 const remote=await git(f.sourceRoot,['ls-remote',f.remote]);for(const ref of ['refs/tags/v5.0.0-rc.1','refs/tags/v5.0.0'])assert.ok(remote.includes(f.grant.sourceCommit+'\t'+ref+'^{}'));
 await save('physical-positive-result',{observed,cold,remote,claim:'Physical owner only; integrated D5/native artifact/publication positive is not established'});
});
test('physical preflight refuses dirty, hidden uncommitted bytes, stale refs, alias remote and nonempty snapshot before effects',async t=>{
 const outcomes=[];
 for(const kind of ['dirty','committed-mismatch','stale-refs','alias','nonempty']){
  const f=await fixture(t,'negative-'+kind);
  if(kind==='dirty')await writeFile(join(f.sourceRoot,'untracked'),'changed');
  if(kind==='committed-mismatch'){
   await git(f.sourceRoot,['update-index','--assume-unchanged','subject.txt']);const b=Buffer.from('Changed hidden worktree bytes\n');await writeFile(join(f.sourceRoot,'subject.txt'),b);
   const {inventoryRef,inventoryDigest,...body}=structuredClone(f.grant.sourceInventory);body.members[0].digest=bytesHash(b);body.members[0].byteCount=b.length;
   f.grant.sourceInventory=constructQualificationIdentity(body,'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');f.request.qualificationBasis.sourceInventory={ref:f.grant.sourceInventory.inventoryRef,digest:f.grant.sourceInventory.inventoryDigest};
  }
  if(kind==='stale-refs')f.grant.expectedRemoteRefs=[{ref:'refs/heads/published-fixture',object:'1'.repeat(40)}];
  if(kind==='alias')f.grant.remote='origin';
  if(kind==='nonempty'){await mkdir(f.grant.snapshotRoot);await writeFile(join(f.grant.snapshotRoot,'held'),'preserved');}
  const observed=await publishReleaseSnapshot(f.request,f.grant,f.qualification);
  assert.equal(observed.disposition,'refused',kind+JSON.stringify(observed));assert.deepEqual(observed.effects,[]);assert.deepEqual(observed.unknownEffects,[]);
  outcomes.push({kind,observed});
 }
 await save('preflight-negatives',outcomes);
});
test('push refusal preserves local tags/snapshot and marks possible remote effect incomplete',async t=>{
 const f=await fixture(t,'push-failure');const hook=join(f.remote,'hooks/pre-receive');await writeFile(hook,'#!/bin/sh\nexit 1\n');await chmod(hook,0o755);
 const observed=await publishReleaseSnapshot(f.request,f.grant,f.qualification);
 assert.equal(observed.disposition,'incomplete_effect');assert.equal(observed.phase,'remote_push');assert.ok(observed.effects.some(e=>e.kind==='local_ref'));assert.ok(observed.effects.some(e=>e.kind==='snapshot_file'));assert.deepEqual(observed.unknownEffects,['atomic remote ref publication']);
 await save('push-failure-result',observed);
});
test('Public owner refuses invented qualification and tapped acceptance; release read cannot infer admitted truth from bytes',async t=>{
 const f=await fixture(t,'no-native-proof');assert.equal(projectReleaseQualification(f.request,{}, {},{}),null);
 await assert.rejects(Effect.runPromise(product.RELEASE_SNAPSHOT_DEFINITION_BINDINGS.snapshot.published_rc({invocation:{definitionKey:{operationId:'abg.operation.release.snapshot',memberKey:'published_rc'},request:f.request},resources:null})));
 const tapped=await Effect.runPromise(product.RELEASE_SNAPSHOT_DEFINITION_BINDINGS.snapshot.tapped_release({invocation:{request:{}},resources:null}));
 assert.equal(tapped.ownerOutput.value.code,'not_implemented');assert.equal(tapped.ownerOutput.outcomeKind,'refusal');
 assert.equal(projectReleaseEvidence({}).kind,'product_project_read_refusal');
 assert.equal(await git(f.sourceRoot,['for-each-ref','refs/tags']), '');
});
test('changed generic artifact ingress refuses malformed release and wrong member without append',async t=>{
 const root=await mkdtemp(join(proofRoot,'artifact-negatives-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const acquired=events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(root,'events.jsonl')});assert.ok(acquired.store);
 const {store,prefix}=acquired;
 try{
  for(const memberKey of ['published_rc','tapped_release']){
   const coordinate=constructExactOperationInvocationCoordinate({operationId:'abg.operation.release.snapshot',memberKey,definitionDigest:h({definition:memberKey})},'fixture://invocation/'+memberKey,h({request:memberKey}));
   const result=env.admitArtifact(store,{...coordinate,operationId:'abg.operation.release.snapshot',authorityScopeRef:'fixture://release-scope',authorityScopeDigest:h({scope:true}),predecessorPrefix:prefix,correlationId:'fixture://correlation',eventTime:'2026-09-22T00:00:00.000Z',causationEventRefs:[]},'abg.operation.release.snapshot','fixture://artifact',h({forged:true}),{artifact:{kind:'release_operation_observation'}});
   assert.equal(result.disposition,'refused',JSON.stringify(result));assert.equal(store.readAll().length,0);
  }
  assert.deepEqual(await readFile(join(root,'events.jsonl')),Buffer.alloc(0));
  assert.equal(artifact.projectExactPrefixArtifactTruth(prefix).kind,'exact_prefix_artifact_truth_projection');
 }finally{store.projectReopenAuthorityAndClose();}
});
test('retained installed archive remains verified under its owner; successor refuses its older Public catalog',async()=>{
 const coordinatePath=process.env.ABI5_RELEASE_RETAINED_INSTALL_COORDINATE;assert.ok(coordinatePath,'exact retained installed-coordinate selection required');
 const c=JSON.parse(await readFile(coordinatePath,'utf8'));
 const installedPackage=JSON.parse(await readFile(join(c.installedRoot,'package.json'),'utf8'));
 const retainedProduct=await import(pathToFileURL(join(c.installedRoot,installedPackage.exports['./product'].import)).href);
 const request={artifactPath:c.artifactPath,artifactRef:pathToFileURL(c.artifactPath).href,expectedArtifactDigest:c.artifactDigest,expectedProductContentDigest:c.productContentDigest,expectedManifestDigest:c.manifestDigest,expectedProductId:c.productId,expectedPackageName:c.packageName,expectedPackageVersion:c.packageVersion};
 const verified=await retainedProduct.verifyProduct(request);assert.equal(verified.kind,'verified_product_artifact',JSON.stringify(verified));
 const lock=product.constructResolvedProductLock([verified]);assert.equal(lock.kind,'environment_refusal');assert.equal(lock.code,'incompatible_dependency');
 const current=await product.verifyProduct(request);assert.equal(current.kind,'product_verification_refusal');assert.equal(current.code,'catalog_mismatch');
 await save('retained-catalog-boundary',{retainedCoordinate:coordinatePath,artifactDigest:c.artifactDigest,verified:{kind:verified.kind,verificationRef:verified.verificationRef,verificationDigest:verified.verificationDigest},lock,current,claim:'No install operation. A positive changed-catalog install/bind check requires a later archive of this successor; the prior archive is not relabeled as compatible.'});
});
