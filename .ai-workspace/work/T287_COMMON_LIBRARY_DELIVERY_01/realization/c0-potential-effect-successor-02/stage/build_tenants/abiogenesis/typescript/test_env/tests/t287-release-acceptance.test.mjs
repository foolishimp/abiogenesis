// Component proof. Original human/source approval, native qualification and
// admitted publication rows are labelled lower-owner premises, not real O/J.
// Only disposable local Git and file effects below are actual physical proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import * as Effect from 'effect/Effect';
import * as p from '../../build/code/src/product/index.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
import {constructQualificationIdentity as identify} from '../../build/code/src/validator/qualification_contracts.js';
import {releaseArtifactCoordinate} from '../../build/code/src/product/release_snapshot_operations.js';
import {releaseAcceptanceRequest,releaseOwnerRulingCoordinate,resolveReleaseOwnerRuling} from '../../build/code/src/product/release_acceptance.js';
import {publishReleaseSnapshot,recordReleaseAcceptance,releaseRulingDecision,releaseAcceptancePublicationMatches} from '../../build/code/src/implementation/release_publication.js';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {admitRuntimeContract} from '../../build/code/src/shared/public_function_contracts.js';
import {nativeJoinFixture} from '../support/malformed-gtl-native-fixture.mjs';
const exec=promisify(execFile),hash=p.sha256Canonical,bytesHash=p.sha256Bytes,clone=structuredClone;
const proofRoot=process.env.ABI5_F16_PROOF_ROOT;
assert(proofRoot,'explicit disposable F16 proof territory required');await fs.mkdir(proofRoot,{recursive:true});
const coord=(ref,value=ref)=>({ref,digest:hash(value)});
const raw=(ref,text)=>{const bytes=Buffer.from(text);return {ref,digest:bytesHash(bytes),byteCount:bytes.length,contentBase64:bytes.toString('base64')};};
const git=async(root,args)=>(await exec('git',['-C',root,'-c','core.hooksPath=/dev/null',...args],{env:{...process.env,GIT_CONFIG_NOSYSTEM:'1'},maxBuffer:4*1024*1024})).stdout.trim();
function selectRuling(f,choice='accept'){
 const request=releaseAcceptanceRequest(f.request,f.publication,f.grant.humanAuthority,f.grant.requiredEvidence);
 const ruling={kind:'external_release_owner_ruling',schemaVersion:'5.0.0',owner:f.grant.humanAuthority,channel:coord('fixture://human-controlled-source'),request:request.coordinate,
  presentation:raw('fixture://original-presented-request',request.presentation),response:raw('fixture://original-human-response',`${choice} ${request.coordinate.digest}`),inReplyTo:'fixture://original-presented-request'};
 const attribution={kind:'trusted_operator_ruling_source',schemaVersion:'5.0.0',authority:f.grant.sourceAuthority,owner:ruling.owner,channel:ruling.channel,request:request.coordinate,
  ruling:releaseOwnerRulingCoordinate(ruling),presentation:{ref:ruling.presentation.ref,digest:ruling.presentation.digest},response:{ref:ruling.response.ref,digest:ruling.response.digest}};
 f.request.acceptance=releaseOwnerRulingCoordinate(ruling);f.grant.sourceApproval=attribution;f.ruling=ruling;return request;
}
async function fixture(t,name){
 const root=await fs.mkdtemp(join(proofRoot,name+'-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const sourceRoot=join(root,'source'),remote=join(root,'remote.git');await fs.mkdir(sourceRoot);await git(sourceRoot,['init','-b','fixture']);await git(sourceRoot,['init','--bare',remote]);
 const source=Buffer.from('F16 disposable physical fixture; no actual release\n');await fs.writeFile(join(sourceRoot,'subject.txt'),source);await git(sourceRoot,['add','subject.txt']);
 await git(sourceRoot,['-c','user.name=F16 fixture','-c','user.email=fixture@example.invalid','commit','-m','conditional fixture']);
 const sourceCommit=await git(sourceRoot,['rev-parse','HEAD']),sourceTree=await git(sourceRoot,['rev-parse','HEAD^{tree}']);
 const inventory=identify({kind:'qualification_subject_inventory',coverage:'complete_claim',selectedRoots:['.'],members:[{ref:'fixture://source',path:'subject.txt',digest:bytesHash(source),byteCount:source.length,surfaceRoles:['code'],classificationEvidenceRefs:[]}]},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 const archive=Buffer.from('physical archive premise, not ABI installable bytes'),claim=Buffer.from('conditional F16 fixture');
 const productId='product://fixture/f16@5.0.0-rc.1',productContentDigest=hash(name),manifest={productId,packageName:'@fixture/f16',packageVersion:'5.0.0-rc.1',productContentDigest};
 const artifactPath=join(root,'input.tgz'),manifestPath=join(root,'manifest.json'),claimPath=join(root,'claim');
 await fs.writeFile(artifactPath,archive);await fs.writeFile(manifestPath,JSON.stringify(manifest));await fs.writeFile(claimPath,claim);
 const identity={productId,namespace:'abiogenesis',profile:'one_project_unqualified',projectSubtree:'.',versionLine:'5.0.0',ordinal:1,version:'5.0.0-rc.1',releaseClaim:{ref:'fixture://claim',digest:bytesHash(claim)}};
 const makeBasis=subjectKind=>identify({kind:'exact_candidate_qualification',projection:'basis',schemaVersion:'5.0.0',subjectKind,productId,productVersion:identity.version,
  sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest},artifact:{ref:'fixture://archive',digest:bytesHash(archive)},productManifest:{ref:'fixture://manifest',digest:hash(manifest)},productContentDigest,
  toolchain:coord('fixture://toolchain'),installedProduct:coord('fixture://install/'+subjectKind),workspaceBinding:coord('fixture://W'),prospectiveRelease:identity,tenantManifest:coord('fixture://tenant'),coverageCatalog:coord('fixture://coverage'),lawBasis:coord('fixture://law')},'basisRef','basisDigest','qualification-basis://abiogenesis/');
 const basis=makeBasis('pre_rc_candidate'),verdict=coord('fixture://pre-verdict'),qualification={verdictRef:verdict.ref,verdictDigest:verdict.digest,subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:basis.lawBasis,disposition:'green',bypassRefs:[],selfConformance:{assessment:coord('fixture://assessment')}};
 qualification.selfConformance.verification={subjectBasis:qualification.subjectBasis,lawBasis:basis.lawBasis,recipe:coord('fixture://recipe'),executionSelectionRef:'fixture://execution',execution:coord('fixture://execution'),cCall:coord('fixture://call'),observation:coord('fixture://observation'),commandOutcomes:[],predicateOutcomes:[],lintOutcome:null,testSummaries:[],disposition:'passed',diagnostics:[]};
 const pubRequest={qualificationBasis:basis,lawBasis:basis.lawBasis,verdict,requestedIdentity:identity};
 const pubGrant={kind:'release_publication_grant',sourceRoot,sourceCommit,sourceTree,sourceInventory:inventory,artifact:{path:artifactPath,...basis.artifact,snapshotName:'fixture.tgz',packageName:manifest.packageName},manifestPath,releaseClaimPath:claimPath,remote,pushMode:'atomic',expectedLocalRefs:[],expectedRemoteRefs:[],carrierRefs:[],snapshotRoot:join(root,identity.version),artifactOutputRoot:join(root,'publication-observations'),tagger:{name:'F16 fixture',email:'fixture@example.invalid',date:'1789984800 +0000'},tagMessage:'conditional fixture',buildCommand:'not run',packCommand:'not run'};
 const observation=await publishReleaseSnapshot(pubRequest,pubGrant,qualification);assert.equal(observation.disposition,'complete',JSON.stringify(observation));
 // The native publication envelope/row is a lower-owner premise. Its physical
 // observation above is real. No synthetic native history is admitted.
 const publication={kind:'release_operation_observation',schemaVersion:'5.0.0',memberKey:'published_rc',scope:coord('fixture://publication-scope'),request:pubRequest,effectGrant:pubGrant,observation};
 const installed=makeBasis('installed_rc'),installedVerdict=coord('fixture://installed-verdict');
 const request={qualificationBasis:installed,lawBasis:installed.lawBasis,verdict:installedVerdict,requestedIdentity:identity,acceptedRc:releaseArtifactCoordinate(publication),acceptance:null,predecessor:null};
 const grant={kind:'release_acceptance_grant',humanAuthority:coord('fixture://actual-human-premise'),sourceAuthority:coord('fixture://external-source-authority'),sourceApproval:null,
  requiredEvidence:[installedVerdict,request.acceptedRc,qualification.selfConformance.assessment],addendumRoot:join(root,'addenda'),artifactOutputRoot:join(root,'acceptance-observations')};
 const row={operationId:'abg.operation.release.snapshot',memberKey:'published_rc',artifactRef:request.acceptedRc.ref,artifactDigest:request.acceptedRc.digest,artifact:publication,admissionEventRef:'fixture://publication-event',admissionEventDigest:hash('publication-event')};
 const f={root,sourceRoot,remote,request,grant,publication,rows:[row],qualification:{...qualification,subjectKind:'installed_rc',verdictRef:installedVerdict.ref,verdictDigest:installedVerdict.digest,subjectBasis:{ref:installed.basisRef,digest:installed.basisDigest}}};selectRuling(f);return f;
}
test('original O/source correspondence rejects generated-only, missing, altered, foreign and conditional decisions',async t=>{
 const f=await fixture(t,'source'),request=selectRuling(f);assert.equal(resolveReleaseOwnerRuling(request,f.ruling,f.grant.sourceApproval),'accept');
 for(const [name,edit]of Object.entries({missing:x=>x.ruling=null,generated:x=>x.ruling={decision:'accept',actor:'human'},no_attribution:x=>x.grant.sourceApproval=null,
  owner:x=>x.ruling.owner=coord('fixture://agent'),channel:x=>x.ruling.channel=coord('fixture://other-channel'),source_authority:x=>x.grant.sourceAuthority=coord('fixture://other-authority'),
  changed_source:x=>x.ruling.response.contentBase64=Buffer.from('fabricated acceptance').toString('base64'),foreign_request:x=>x.ruling.request=coord('fixture://other-request'),
  foreign_context:x=>x.ruling.inReplyTo='fixture://other-presentation',foreign_rc:x=>x.request.requestedIdentity.ordinal=2,
  conditional:x=>{x.ruling.response=raw(x.ruling.response.ref,`accept ${request.coordinate.digest} if tests eventually pass`);x.request.acceptance=releaseOwnerRulingCoordinate(x.ruling);x.grant.sourceApproval.ruling=x.request.acceptance;x.grant.sourceApproval.response={ref:x.ruling.response.ref,digest:x.ruling.response.digest};}})){
  const x=clone(f);edit(x);assert.equal(releaseRulingDecision(x.request,x.publication,x.ruling,x.grant),null,name);
 }
 selectRuling(f,'withhold');assert.equal(releaseRulingDecision(f.request,f.publication,f.ruling,f.grant),'withhold');
});
test('release join requires installed green non-bypassed qualification and exact admitted publication/current ruling',async t=>{
 const f=await fixture(t,'join'),native=await nativeJoinFixture();let q=f.qualification;
 const owner=await privateOwner('implementation/release_publication.js',[],{'../abg/qualification_proof.js':{projectQualificationVerdict:input=>canonicalJson(input.subjectBasis)===canonicalJson(q.subjectBasis)&&canonicalJson(input.lawBasis)===canonicalJson(q.lawBasis)?q:null},'../abg/event_store.js':{assertDurableRuntimePrefixBytes:()=>{}}});
 const proof=native.proof(),prefix=proof.prefix,selection={kind:'verdict_selection',selectionRef:'fixture://selected-verdict',slotRef:'fixture://slot',programRef:'fixture://program',invocationAdmissionRef:'fixture://invocation',result:f.request.verdict};
 const run=(x=f)=>owner.projectReleaseAcceptance(x.request,proof,selection,x.publication,x.ruling,x.grant,prefix,x.rows);
 assert.equal(run().decision,'accept');
 for(const change of [{disposition:'red'},{disposition:'blocked'},{bypassRefs:['fixture://bypass']},{subjectKind:'pre_rc_candidate'}]){q={...f.qualification,...change};assert.equal(run(),null,JSON.stringify(change));}q=f.qualification;
 for(const mutate of [x=>x.request.qualificationBasis.subjectKind='pre_rc_candidate',x=>x.request.lawBasis=coord('fixture://foreign-law'),x=>x.rows=[],x=>x.rows.push(x.rows[0]),x=>x.publication.observation.disposition='incomplete_effect',x=>x.request.acceptedRc=coord('fixture://foreign-RC')]){const x=clone(f);mutate(x);assert.equal(run(x),null);}
 const prior={operationId:'abg.operation.release.snapshot',memberKey:'tapped_release',artifactRef:'fixture://prior-withhold',artifactDigest:hash('prior'),artifact:{request:{acceptedRc:f.request.acceptedRc},observation:{disposition:'complete'}}};
 assert.equal(releaseAcceptancePublicationMatches(f.request,f.publication,[...f.rows,prior]),false);
 f.request.predecessor={ref:prior.artifactRef,digest:prior.artifactDigest};assert.equal(releaseAcceptancePublicationMatches(f.request,f.publication,[...f.rows,prior]),true);
 assert.equal(releaseRulingDecision(f.request,f.publication,f.ruling,f.grant),null,'old O does not authorize a new predecessor');
 prior.artifact.observation.disposition='incomplete_effect';assert.equal(releaseAcceptancePublicationMatches(f.request,f.publication,[...f.rows,prior]),false);
});
test('physical accept and withhold addenda preserve immutable RC refs/package/snapshot and retain partial effects',async t=>{
 const f=await fixture(t,'physical'),refsBefore=await git(f.sourceRoot,['show-ref']),remoteBefore=await git(f.sourceRoot,['ls-remote',f.remote]);
 const snapshot=async()=>Promise.all(f.publication.observation.snapshotFiles.map(async row=>({path:row.path,digest:bytesHash(await fs.readFile(join(f.publication.effectGrant.snapshotRoot,row.path)))})));
 const before=await snapshot();let result=await recordReleaseAcceptance(f.request,f.publication,f.ruling,f.grant,'accept');assert.equal(result.observation.disposition,'complete',JSON.stringify(result));
 const body=JSON.parse(await fs.readFile(new URL(result.addendum.ref)));assert.deepEqual(body.ruling,f.ruling);assert.equal(body.decision,'accept');
 selectRuling(f,'withhold');result=await recordReleaseAcceptance(f.request,f.publication,f.ruling,f.grant,'withhold');assert.equal(result.observation.disposition,'complete');assert.equal(JSON.parse(await fs.readFile(new URL(result.addendum.ref))).decision,'withhold');
 const repeated=await recordReleaseAcceptance(f.request,f.publication,f.ruling,f.grant,'withhold');assert.equal(repeated.observation.disposition,'incomplete_effect','create-only existing target is never rewritten');
 const bad=clone(f);bad.grant.sourceApproval=null;result=await recordReleaseAcceptance(bad.request,bad.publication,bad.ruling,bad.grant,'withhold');assert.equal(result.observation.disposition,'refused');assert.equal(result.observation.effects.length,0);
 const partial=clone(f);partial.grant.addendumRoot=join(f.root,'readback-fault');const failing=await privateOwner('implementation/release_publication.js',[],{'node:fs/promises':{readFile:async(path,...args)=>{if(String(path).startsWith(partial.grant.addendumRoot))throw Error('injected post-write readback fault');return fs.readFile(path,...args);}}});
 result=await failing.recordReleaseAcceptance(partial.request,partial.publication,partial.ruling,partial.grant,'withhold');assert.equal(result.observation.disposition,'incomplete_effect');assert.equal(result.observation.effects[0].kind,'owner_ruling_addendum');assert(result.addendum);
 assert.equal(await git(f.sourceRoot,['show-ref']),refsBefore);assert.equal(await git(f.sourceRoot,['ls-remote',f.remote]),remoteBefore);assert.deepEqual(await snapshot(),before);
 await fs.writeFile(join(f.publication.effectGrant.snapshotRoot,'release-claim'),'altered immutable claim');result=await recordReleaseAcceptance(f.request,f.publication,f.ruling,f.grant,'withhold');assert.equal(result.observation.disposition,'refused');assert.equal(result.observation.effects.length,0);
});
test('shared artifact commit preserves write/admission/close facts without manufacturing success',async t=>{
 const f=await fixture(t,'commit'),value={...f.publication,memberKey:'tapped_release',invocation:{definitionDigest:hash('definition'),invocationRef:'fixture://invocation',invocationPayloadDigest:hash('request')},scope:coord('fixture://acceptance-scope')};
 for(const failure of ['append','close']){
  const owner=await privateOwner('product/release_snapshot_definition_bindings.js',['commitReleaseArtifact'],{'../abg/environment_admission.js':{admitArtifact:()=>{if(failure==='append')throw Error('injected append failure');return {disposition:'admitted',admissionEventRef:'fixture://actual-append-premise',successorPrefix:{fixture:true}};}},'../abg/definition_event_resource.js':{closeAbgEventResource:()=>{throw Error('injected close failure');}}});
  await assert.rejects(owner.commitReleaseArtifact({store:{},entryPrefix:{fixture:true}},value,'fixture://correlation','2026-09-23T00:00:00Z','fixture://W-event',join(f.root,failure)),error=>{
   assert.equal(error.evidence.phase,failure==='append'?'artifact_admission':'resource_close');assert.equal(error.evidence.admissionEventRef,failure==='append'?null:'fixture://actual-append-premise');assert(error.evidence.artifactPath);return true;
  });
 }
});
test('tapped owner returns the declared result or withholding refusal through one artifact/close consequence',async t=>{
 // Explicit premises: trusted external admission, native qualification, verified
 // package, workspace and artifact/event-resource owners. The selected release
 // owner, source comparison, local physical addendum and output contracts run.
 for(const decision of ['accept','withhold']){
  const f=await fixture(t,'owner-'+decision);selectRuling(f,decision);const native=await nativeJoinFixture(),proof=native.proof(),prefix=proof.prefix;
  const leaf=await privateOwner('implementation/release_publication.js',[],{'../abg/qualification_proof.js':{projectQualificationVerdict:()=>f.qualification},'../abg/event_store.js':{assertDurableRuntimePrefixBytes:()=>{}}});
  const selection={kind:'verdict_selection',selectionRef:'fixture://verdict-selection',slotRef:'fixture://slot',programRef:'fixture://program',invocationAdmissionRef:'fixture://invocation',result:f.request.verdict};
  const binding=coord('fixture://W'),lock=coord('fixture://lock'),environment={kind:'exact_prefix_workspace_environment',productInstalls:[],workspaceBinding:{admissionEventRef:'fixture://W-event'},resolvedProductLock:{lockId:lock.ref,lockDigest:lock.digest}};
  const successor={fixture:'actual-successor-premise'},seen=[];
  const module=await privateOwner('product/release_snapshot_definition_bindings.js',['tappedOwner'],{
   '../abg/environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>environment,admitArtifact:(_store,basis,_operation,ref,digest,metadata)=>{seen.push({basis,ref,digest,value:metadata.artifact});return {disposition:'admitted',admissionEventRef:'fixture://admitted',successorPrefix:successor};}},
   '../abg/artifact_truth.js':{projectExactPrefixArtifactTruth:()=>({kind:'exact_prefix_artifact_truth_projection',rows:f.rows})},
   '../abg/effectful_invocation_truth.js':{projectEffectfulPublicInvocationTruthAtPrefix:()=>({disposition:'available'})},
   '../product/verify_product.js':{verifyProduct:async()=>({kind:'verified_product_artifact'})},
   './verify_product.js':{verifyProduct:async()=>({kind:'verified_product_artifact'})},
   '../implementation/release_publication.js':{projectReleaseAcceptance:leaf.projectReleaseAcceptance},
   '../abg/definition_event_resource.js':{closeAbgEventResource:(_resource,next)=>({fixture:'issued-close-premise',prefix:next})},
  });
  const resources={kind:'release_acceptance_resources',schemaVersion:'5.0.0',eventResource:{fixture:true},proof,selection,effectGrant:f.grant,publication:f.publication,ruling:f.ruling};
  const invocation={definitionKey:{operationId:'abg.operation.release.snapshot',memberKey:'tapped_release'},definitionDigest:hash('definition'),invocationRef:'fixture://tap/'+decision,requestDigest:hash(f.request),request:f.request,correlationRef:'fixture://correlation',eventTime:'2026-09-23T00:00:00.000Z',invocationAuthority:{slots:{workspace_binding:binding,product_set:[],dependency_lock:lock,actor:{actor:coord('fixture://lawful-proxy')},capability_grants:{fixture:true}}}};
  const result=await Effect.runPromise(module.tappedOwner({invocation,resources},{grants:[]},{entryPrefix:prefix,store:{fixture:true}}));
  assert.equal(seen.length,1);assert.equal(seen[0].basis.memberKey,'tapped_release');assert.deepEqual(seen[0].value.ruling,f.ruling);assert.equal(seen[0].value.decision,decision);
  assert.deepEqual(result.resources.eventResource.prefix,successor);assert.equal(result.resources.admissionEventRef,'fixture://admitted');
  assert.equal(result.ownerOutput.outcomeKind,decision==='accept'?'result':'refusal');
  if(decision==='withhold')assert.equal(result.ownerOutput.value.code,'acceptance_withheld');
  const packet=p.RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release;
  assert.equal(admitRuntimeContract(decision==='accept'?packet.resultSchema:packet.refusalSchema,result.ownerOutput.value).disposition,'admitted');
 }
});
test('fresh-process release projection conserves original O and distinguishes accepted, withheld and incomplete',async t=>{
 const f=await fixture(t,'projection'),sourceModule=pathToFileURL(resolve(import.meta.dirname,'../support/r10-private-owner-harness.mjs')).href;
 for(const decision of ['accept','withhold']){
  selectRuling(f,decision);const effect=await recordReleaseAcceptance(f.request,f.publication,f.ruling,f.grant,decision);assert.equal(effect.observation.disposition,'complete');
  for(const incomplete of [false,true]){
   const a={...f.publication,memberKey:'tapped_release',request:f.request,ruling:f.ruling,effectGrant:f.grant,publication:f.publication,decision,addendum:effect.addendum,observation:{...effect.observation,disposition:incomplete?'incomplete_effect':'complete'}};
   const coordinate=releaseArtifactCoordinate(a),prefix={fixture:'admitted-prefix'},row={operationId:'abg.operation.release.snapshot',memberKey:'tapped_release',artifactRef:coordinate.ref,artifactDigest:coordinate.digest,artifact:a,admissionEventRef:'fixture://admitted',admissionEventDigest:hash('admitted')};
   const packet={kind:'product_project_read_packet',schemaVersion:'5.0.0',memberKey:'release_evidence',sourceRef:a.scope.ref,sourceDigest:a.scope.digest,projectionBasis:{basisRef:'fixture://prefix',basisDigest:hash(prefix),value:prefix},prefix,artifact:coordinate,artifactPath:'fixture://retained-artifact',selector:{kind:'release_operation_observation',artifact:coordinate}};
   const input=join(f.root,decision+'-'+incomplete+'.json');await fs.writeFile(input,JSON.stringify({a,row,packet,rows:[...f.rows,row]}));
   const code=`import fs from 'node:fs';import {privateOwner} from ${JSON.stringify(sourceModule)};const x=JSON.parse(fs.readFileSync(process.argv[1]));const m=await privateOwner('product/project_read_ports.js',[],{'../abg/artifact_truth.js':{projectExactPrefixArtifactTruth:()=>({kind:'exact_prefix_artifact_truth_projection',rows:x.rows})},'../implementation/release_publication.js':{readReleaseArtifactBytes:()=>x.a,projectReleaseAcceptance:()=>({decision:x.a.decision})}});console.log(JSON.stringify(m.projectReleaseEvidence(x.packet)));`;
   const result=JSON.parse((await exec(process.execPath,['--experimental-vm-modules','--input-type=module','-e',code,input])).stdout);
   assert.deepEqual(result.projection.originalRuling,f.ruling);assert.equal(result.projection.disposition,incomplete?'incomplete_effect':decision==='accept'?'accepted':'qualified_unaccepted');
   assert.equal(result.projection.acceptance,decision==='withhold'?'withheld':incomplete?'incomplete':'accepted');
  }
 }
});
