import { ADMISSION_AUTHORITY_RESOURCE_SCHEMA,admissionAuthorityScope,admissionAuthoritySlots } from "../product/admission_authority.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile,writeFile,mkdir,readdir,realpath,lstat } from "node:fs/promises";
import { resolve,relative,isAbsolute,basename,join,dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { canonicalJson,type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes,sha256Canonical } from "../shared/digests.js";
import { qualificationIdentityDigest, QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA, type ExactCandidateQualification } from "../validator/qualification_contracts.js";
import { releaseAcceptanceRequest, releaseOwnerRulingCoordinate, resolveReleaseOwnerRuling, type ReleaseOwnerRuling } from "../product/release_acceptance.js";
import { RELEASE_OPERATION_ARTIFACT_SCHEMA, RELEASE_OPERATION_CONTRACTS, RELEASE_IDENTITY_SCHEMA, releaseAuthorityScope, releaseAcceptanceScope, releaseArtifactCoordinate,
 type PublishedRcSnapshotRequest,type ReleasePublicationGrant,type ReleasePhysicalObservation,type ReleaseOperationArtifact, type PublishedReleaseOperationArtifact, type TappedReleaseSnapshotRequest, type ReleaseAcceptanceGrant, type TappedReleaseOperationArtifact } from "../product/release_snapshot_operations.js";
import * as v from "valibot";
import { readFileSync } from "node:fs";
import { admitExactDefinitionCall } from "../shared/definition_binding_mechanics.js";
import { isCapabilityGrant,type CapabilityGrant } from "../product/invocation.js";
import { isExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { isRecord } from "../shared/admission_predicates.js";
import { projectQualificationVerdict } from "../abg/qualification_proof.js";
import { assertDurableRuntimePrefixBytes,type DurablePrefixCoordinate } from "../abg/event_store.js";
import { QUALIFICATION_PROOF_RESOURCE_SCHEMA,type QualificationProofResource,type QualificationEvidenceSelection } from "../validator/qualification_contracts.js";
import { isQualificationBasisReady } from "../validator/qualification.js";
import { refDigestSchema,admitRuntimeContract } from "../shared/public_function_contracts.js";
const exec=promisify(execFile);
const same=(a:unknown,b:unknown)=>canonicalJson(a as JsonValue)===canonicalJson(b as JsonValue);
/** Output-only field selection shared by the physical snapshot and its bounded
 * copy check. It does not authenticate or reevaluate qualification. */
export function releaseVerificationSnapshotFields(qualification: ExactCandidateQualification<"verdict">) {
 const material=qualification.selfConformance.verification;
 if(!v.is(QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA,material)||material.disposition!=="passed"||
   !same(material.subjectBasis,qualification.subjectBasis)||!same(material.lawBasis,qualification.lawBasis))
   throw new TypeError("release snapshot requires selected same-subject verification material");
 return {verificationFacts:qualification,verificationMaterial:material,assessmentCitation:qualification.selfConformance};
}
function requireRelation(value:unknown,message:string):asserts value{if(!value)throw new TypeError(message);}
function inside(root:string,path:string){const rel=relative(root,path);return rel!==""&&!isAbsolute(rel)&&rel!==".."&&!rel.startsWith("../");}
function safeRelative(path:string){return path!==""&&!isAbsolute(path)&&!path.split(/[\\/]/).some(p=>p===".."||p===".")&&!path.includes("\0");}
async function git(root:string,args:string[],input?:string){
 if(input===undefined)return (await exec("git",["-C",root,...args],{encoding:"utf8",maxBuffer:4*1024*1024})).stdout.trim();
 return await new Promise<string>((ok,fail)=>{const child=execFile("git",["-C",root,...args],{encoding:"utf8",maxBuffer:4*1024*1024},(error,stdout)=>error?fail(error):ok(stdout.trim()));child.stdin!.end(input);});
}
function rows(text:string){return text===""?[]:text.split("\n").map(line=>{const [object,ref]=line.split(/\s+/);return {ref:ref!,object:object!};}).sort((a,b)=>a.ref.localeCompare(b.ref));}
const relevant=(ref:string,grant:ReleasePublicationGrant)=>ref.startsWith("refs/tags/v5.0.0")||/\/v5\.0\.0(?:-rc\.[^/]*)?$/.test(ref)||grant.carrierRefs.some(r=>r.ref===ref);
async function refs(grant:ReleasePublicationGrant,remote:boolean){const text=remote?await git(grant.sourceRoot,["ls-remote","--refs",grant.remote]):await git(grant.sourceRoot,["for-each-ref","--format=%(objectname) %(refname)"]);return rows(text).filter(r=>relevant(r.ref,grant));}
async function emptyTarget(path:string){try{requireRelation((await lstat(path)).isDirectory()&&!(await lstat(path)).isSymbolicLink(),"snapshot target must be a plain directory");requireRelation((await readdir(path)).length===0,"snapshot target must be empty");}catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;}}
async function plainAncestors(path:string){let current=resolve(path);while(true){try{requireRelation(!(await lstat(current)).isSymbolicLink(),"effect path must not traverse symlinks");}catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;}const parent=dirname(current);if(parent===current)break;current=parent;}}
/** Physical owner only. Caller supplies an exact authorized, qualification-bound
 * selection. This function never evaluates gates, admits events or accepts an RC. */
export async function publishReleaseSnapshot(request:PublishedRcSnapshotRequest,grant:ReleasePublicationGrant,qualification:ExactCandidateQualification<"verdict">):Promise<ReleasePhysicalObservation>{
 const effects:ReleasePhysicalObservation["effects"]=[],unknownEffects:string[]=[];let phase="preflight",sourceCommit:string|null=null,sourceTree:string|null=null;
 const observedRefs:ReleasePhysicalObservation["refs"]=[],snapshotFiles:ReleasePhysicalObservation["snapshotFiles"]=[];let snapshotManifest:ReleasePhysicalObservation["snapshotManifest"]=null;
 const result=(disposition:ReleasePhysicalObservation["disposition"],message:string)=>({disposition,phase,message,effects,unknownEffects,sourceCommit,sourceTree,refs:observedRefs,snapshotManifest,snapshotFiles});
 try{
  const identity=request.requestedIdentity,basis=request.qualificationBasis,rcRef=`refs/tags/v${identity.version}`,selectorRef=`refs/tags/v${identity.versionLine}`;
  requireRelation(same({ref:qualification.verdictRef,digest:qualification.verdictDigest},request.verdict)&&qualification.disposition==="green"&&qualification.bypassRefs.length===0&&same(qualification.subjectBasis,{ref:basis.basisRef,digest:basis.basisDigest})&&same(qualification.lawBasis,request.lawBasis),"physical owner requires the selected D5 projection");
  const verificationFields=releaseVerificationSnapshotFields(qualification);
  requireRelation(isAbsolute(grant.remote)||/^(?:https|ssh|file):\/\//.test(grant.remote),"remote must be an explicit path or URL, never an ambient alias");
  requireRelation(identity.version===`5.0.0-rc.${identity.ordinal}`&&identity.namespace==="abiogenesis"&&identity.profile==="one_project_unqualified"&&identity.projectSubtree==="."&&grant.pushMode==="atomic","release namespace/profile/version mismatch");
  requireRelation(await realpath(grant.sourceRoot)===resolve(grant.sourceRoot)&&await git(grant.sourceRoot,["rev-parse","--show-toplevel"])===resolve(grant.sourceRoot),"explicit source must be its actual Git root");
  requireRelation(await git(grant.sourceRoot,["status","--porcelain","--untracked-files=all"])==="","source carrier is dirty");
  sourceCommit=await git(grant.sourceRoot,["rev-parse","HEAD"]);sourceTree=await git(grant.sourceRoot,["rev-parse","HEAD^{tree}"]);
  requireRelation(sourceCommit===grant.sourceCommit&&sourceTree===grant.sourceTree,"source commit/tree differs from effect grant");
  requireRelation(grant.sourceInventory.inventoryDigest===qualificationIdentityDigest(grant.sourceInventory,"inventoryRef","inventoryDigest")&&grant.sourceInventory.coverage==="complete_claim"&&
   same({ref:grant.sourceInventory.inventoryRef,digest:grant.sourceInventory.inventoryDigest},basis.sourceInventory),"source inventory differs from qualified subject");
  for(const member of grant.sourceInventory.members){requireRelation(safeRelative(member.path),"source member must be a confined relative path");const path=join(grant.sourceRoot,member.path);requireRelation(inside(grant.sourceRoot,await realpath(path))&&(await lstat(path)).isFile(),"source member is not a confined regular file");const bytes=await readFile(path);requireRelation(bytes.length===member.byteCount&&sha256Bytes(bytes)===member.digest,"qualifying source member changed");await git(grant.sourceRoot,["ls-files","--error-unmatch","--",member.path]);
   const committed=(await exec("git",["-C",grant.sourceRoot,"cat-file","blob",`${sourceCommit}:${member.path}`],{encoding:"buffer",maxBuffer:Math.max(member.byteCount+1024,4*1024*1024)})).stdout;
   requireRelation(committed.length===member.byteCount&&sha256Bytes(committed)===member.digest,"qualified member differs from committed release carrier");}
  requireRelation(safeRelative(grant.artifact.snapshotName)&&basename(grant.artifact.snapshotName)===grant.artifact.snapshotName&&!["release-snapshot.json","SHA256SUMS","release-claim"].includes(grant.artifact.snapshotName),"snapshot artifact name is invalid");
  requireRelation(same({ref:grant.artifact.ref,digest:grant.artifact.digest},basis.artifact),"artifact differs from qualified subject");
  const artifact=await readFile(grant.artifact.path),claim=await readFile(grant.releaseClaimPath),manifest=JSON.parse(await readFile(grant.manifestPath,"utf8"));
  requireRelation(sha256Bytes(artifact)===basis.artifact.digest&&sha256Bytes(claim)===identity.releaseClaim.digest,"artifact or release-claim bytes changed");
  requireRelation(sha256Bytes(Buffer.from(canonicalJson(manifest)))===basis.productManifest.digest&&manifest.productContentDigest===basis.productContentDigest&&manifest.packageVersion===identity.version&&manifest.productId===identity.productId&&manifest.packageName===grant.artifact.packageName,"package/manifest release identity differs from qualified subject");
  for(const path of [grant.snapshotRoot,grant.artifactOutputRoot]){await plainAncestors(path);requireRelation(!inside(grant.sourceRoot,resolve(path))&&resolve(path)!==resolve(grant.sourceRoot),"release outputs must be outside source/claim inventory");}
  for(const sourcePath of [grant.artifact.path,grant.releaseClaimPath,grant.manifestPath]){
   await plainAncestors(sourcePath);requireRelation((await lstat(sourcePath)).isFile(),"artifact inputs must be regular files");
   requireRelation(!inside(resolve(grant.snapshotRoot),resolve(sourcePath))&&!inside(resolve(grant.artifactOutputRoot),resolve(sourcePath)),"effect territories may not contain qualified inputs");
  }
  requireRelation(basename(grant.snapshotRoot)===identity.version,"snapshot target must name the exact qualified version");
  requireRelation(!inside(resolve(grant.snapshotRoot),resolve(grant.artifactOutputRoot))&&!inside(resolve(grant.artifactOutputRoot),resolve(grant.snapshotRoot))&&resolve(grant.snapshotRoot)!==resolve(grant.artifactOutputRoot),"observation and snapshot territories must be separate");
  await emptyTarget(grant.snapshotRoot);
  requireRelation(grant.carrierRefs.every(r=>/^refs\/heads\/[^\s~^:?*\[\\]+$/.test(r.ref))&&new Set(grant.carrierRefs.map(r=>r.ref)).size===grant.carrierRefs.length,"carrier refs must be unique explicit branches");
  const local=await refs(grant,false),remote=await refs(grant,true);
  requireRelation(same(local,[...grant.expectedLocalRefs].sort((a,b)=>a.ref.localeCompare(b.ref)))&&same(remote,[...grant.expectedRemoteRefs].sort((a,b)=>a.ref.localeCompare(b.ref))),"local or remote ref objects changed");
  for(const row of [...local,...remote]){
   requireRelation(!/^refs\/tags\/.+\/v5\.0\.0(?:-rc\.[^/]*)?$/.test(row.ref),"historical project-qualified release profile conflicts");
   if(row.ref.startsWith("refs/tags/v5.0.0-rc.")){const match=/^refs\/tags\/v5\.0\.0-rc\.([1-9][0-9]*)$/.exec(row.ref);requireRelation(match!==null&&Number(match[1])<identity.ordinal,"RC ordinal must exceed every preserved RC");}
  }
  const remotePeels=rows(await git(grant.sourceRoot,["ls-remote",grant.remote]));
  for(const [remoteSide,held] of [[false,local],[true,remote]] as const){
   const candidates=held.filter(r=>/^refs\/tags\/v5\.0\.0-rc\.[1-9][0-9]*$/.test(r.ref)).sort((a,b)=>Number(b.ref.split("-rc.")[1])-Number(a.ref.split("-rc.")[1]));
   const latest=candidates[0],selector=held.find(r=>r.ref===selectorRef);
   requireRelation((latest===undefined)===(selector===undefined),"published RC and selector must exist together");
   const peel=async(ref:string)=>remoteSide?remotePeels.find(r=>r.ref===ref+"^{}")?.object:await git(grant.sourceRoot,["rev-parse",ref+"^{}"]);
   for(const row of [...candidates,...(selector?[selector]:[])])requireRelation(remoteSide?remotePeels.some(r=>r.ref===row.ref+"^{}"):await git(grant.sourceRoot,["cat-file","-t",row.ref])==="tag","existing release refs must be annotated");
   if(latest&&selector)requireRelation(await peel(latest.ref)===await peel(selector.ref),"existing selector must identify the greatest published RC");
  }
  for(const row of local.filter(r=>/^refs\/tags\/v5\.0\.0-rc\./.test(r.ref))){const peer=remote.find(r=>r.ref===row.ref);requireRelation(peer===undefined||peer.object===row.object,"immutable local/remote RC identities disagree");}
  requireRelation(!local.some(r=>r.ref===rcRef)&&!remote.some(r=>r.ref===rcRef),"immutable RC ref already exists");
  for(const branch of grant.carrierRefs)requireRelation((remote.find(r=>r.ref===branch.ref)?.object??null)===branch.expectedObject,"carrier expected remote object differs from grant");
  requireRelation(!/[\r\n<>\0]/.test(grant.tagger.name+grant.tagger.email)&&/^\d+ [+-]\d{4}$/.test(grant.tagger.date)&&!grant.tagMessage.includes("\0"),"annotated tagger coordinates must be explicit and well formed");
  phase="local_tag_objects";
  const tag=async(ref:string)=>{unknownEffects.push(`tag object for ${ref}`);const object=await git(grant.sourceRoot,["mktag"],`object ${sourceCommit}\ntype commit\ntag ${ref.slice(10)}\ntagger ${grant.tagger.name} <${grant.tagger.email}> ${grant.tagger.date}\n\n${grant.tagMessage}\n`);unknownEffects.pop();effects.push({kind:"local_tag_object",ref,digest:object});return object;};
  const rcObject=await tag(rcRef),selectorObject=await tag(selectorRef);
  phase="local_refs";const updates=[{ref:rcRef,object:rcObject},{ref:selectorRef,object:selectorObject},...grant.carrierRefs.map(b=>({ref:b.ref,object:sourceCommit!}))];
  const transaction=["start",...updates.map(row=>{const old=local.find(r=>r.ref===row.ref)?.object;return old===undefined?`create ${row.ref} ${row.object}`:`update ${row.ref} ${row.object} ${old}`;}),"prepare","commit",""];
  unknownEffects.push("local ref transaction");await git(grant.sourceRoot,["update-ref","--stdin"],transaction.join("\n"));unknownEffects.pop();for(const row of updates)effects.push({kind:"local_ref",ref:row.ref,digest:row.object});
  phase="snapshot";unknownEffects.push(grant.snapshotRoot);await mkdir(grant.snapshotRoot,{recursive:true});
  const copy=async(name:string,bytes:Uint8Array)=>{const path=join(grant.snapshotRoot,name);await writeFile(path,bytes,{flag:"wx"});const digest=sha256Bytes(await readFile(path));snapshotFiles.push({path:name,digest});effects.push({kind:"snapshot_file",ref:pathToFileURL(path).href,digest});};
  await copy(grant.artifact.snapshotName,artifact);await copy("release-claim",claim);
  const snapshot={kind:"release_snapshot_manifest",schemaVersion:"5.0.0",identity,sourceCommit,sourceTree,projectSubtree:".",artifact:basis.artifact,productManifest:basis.productManifest,productContentDigest:basis.productContentDigest,
   qualificationBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:request.lawBasis,verdict:request.verdict,...verificationFields,packageIdentity:{productId:identity.productId,packageName:grant.artifact.packageName,version:identity.version},sourceRef:rcRef,predecessorRefs:remote,buildCommand:grant.buildCommand,packCommand:grant.packCommand,files:[...snapshotFiles]};
  const manifestBytes=Buffer.from(canonicalJson(snapshot as unknown as JsonValue)+"\n");await copy("release-snapshot.json",manifestBytes);snapshotManifest={ref:pathToFileURL(join(grant.snapshotRoot,"release-snapshot.json")).href,digest:sha256Bytes(manifestBytes)};
  await copy("SHA256SUMS",Buffer.from(snapshotFiles.map(f=>`${f.digest.slice(7)}  ${f.path}\n`).join("")));unknownEffects.pop();
  phase="remote_push";unknownEffects.push("atomic remote ref publication");
  await git(grant.sourceRoot,["push","--atomic","--porcelain",...updates.map(row=>`--force-with-lease=${row.ref}:${remote.find(r=>r.ref===row.ref)?.object??""}`),grant.remote,...updates.map(row=>`${row.ref}:${row.ref}`)]);
  unknownEffects.pop();for(const row of updates)effects.push({kind:"remote_ref",ref:row.ref,digest:row.object});
  phase="readback";const observed=rows(await git(grant.sourceRoot,["ls-remote",grant.remote]));
  for(const row of updates){requireRelation(observed.find(r=>r.ref===row.ref)?.object===row.object,"remote ref readback mismatch");const peeled=row.ref.startsWith("refs/tags/")?observed.find(r=>r.ref===row.ref+"^{}")?.object:row.object;requireRelation(peeled===sourceCommit,"remote annotated object/peeled commit mismatch");observedRefs.push({...row,peeled});}
  const latest=await refs(grant,true);requireRelation(!latest.some(r=>{const m=/^refs\/tags\/v5\.0\.0-rc\.(\d+)$/.exec(r.ref);return m!==null&&Number(m[1])>identity.ordinal;}),"higher RC published during readback");
  for(const file of snapshotFiles)requireRelation(sha256Bytes(await readFile(join(grant.snapshotRoot,file.path)))===file.digest,"snapshot readback bytes changed");
  requireRelation(await git(grant.sourceRoot,["rev-parse",`${sourceCommit}^{tree}`])===sourceTree,"readback source tree mismatch");
  phase="complete";return result("complete","exact qualified RC bytes, annotated refs, snapshot and highest-ordinal selector reacquired");
 }catch(error){return result(effects.length===0&&unknownEffects.length===0?"refused":"incomplete_effect",String(error));}
}

/** One release-domain join. D5 alone authenticates/reduces native qualification. */
export function projectReleaseQualification(request:PublishedRcSnapshotRequest,proof:QualificationProofResource,selection:QualificationEvidenceSelection,current:DurablePrefixCoordinate,member:"published_rc"|"tapped_release"="published_rc"){
 try{
  if(admitRuntimeContract(RELEASE_OPERATION_CONTRACTS.snapshot[member].requestSchema,request).disposition!=="admitted"||!v.is(QUALIFICATION_PROOF_RESOURCE_SCHEMA,proof)||selection.kind!=="verdict_selection")return null;
  const basis=request.qualificationBasis;
  const subjectKind=member==="published_rc"?"pre_rc_candidate":"installed_rc";
  if(basis.subjectKind!==subjectKind||!isQualificationBasisReady(basis)||!same(basis.prospectiveRelease,request.requestedIdentity)||!same(basis.lawBasis,request.lawBasis))return null;
  const q=proof.prefix as DurablePrefixCoordinate;if(q.eventLogRef!==current.eventLogRef||!same(q.storeIdentity,current.storeIdentity)||q.prefixLength>current.prefixLength)return null;
  assertDurableRuntimePrefixBytes(q);assertDurableRuntimePrefixBytes(current);
  const verdict=projectQualificationVerdict({proof,selection,subjectBasis:{ref:basis.basisRef,digest:basis.basisDigest},lawBasis:request.lawBasis});
  return verdict!==null&&verdict.subjectKind===subjectKind&&verdict.disposition==="green"&&verdict.bypassRefs.length===0&&
   same({ref:verdict.verdictRef,digest:verdict.verdictDigest},request.verdict)?verdict:null;
 }catch{return null;}
}
/** Closed observation validity, not an assertion that publication is complete. */
export function isReleaseOperationArtifact(value:unknown):value is ReleaseOperationArtifact{
 if(!v.is(RELEASE_OPERATION_ARTIFACT_SCHEMA,value))return false;
 const a=value,p=a.publicInvocation,packet=RELEASE_OPERATION_CONTRACTS.snapshot[a.memberKey];
 if(admitExactDefinitionCall({invocation:p,resources:null},packet)===null||!isRecord(p)||!isRecord(p.invocationAuthority)||!isRecord(p.invocationAuthority.slots))return false;
 const slots=p.invocationAuthority.slots;
 if(!a.grants.every(isCapabilityGrant))return false;
 const grants=a.grants as unknown as CapabilityGrant[];
 const parsed=v.safeParse(ADMISSION_AUTHORITY_RESOURCE_SCHEMA,a.admissionAuthority);
 if(!parsed.success)return false;
 const approved=parsed.output,scope=admissionAuthorityScope(approved.basis),authority=approved.authority;
 if(!same(approved.grants,grants)||!same(approved.basis.request,a.request)||approved.basis.resourceScope.resourcesDigest!==a.resourceDigest||
    !same(approved.basis.resourceScope.authoritySlots,admissionAuthoritySlots(slots))||approved.basis.definition.definitionDigest!==a.invocation.definitionDigest||
    approved.basis.boundEnvironment?.workspaceAuthorityBasis.authorizedActorRef!==a.actorRef||!same(approved.basis.boundEnvironment?.prefix,a.entryPrefix)||
    authority.actorRef!==a.actorRef||authority.authority.value.actorRef!==a.actorRef||authority.approval.value.actorRef!==a.actorRef||
    authority.authority.digest!==sha256Canonical(authority.authority.value)||authority.approval.digest!==sha256Canonical(authority.approval.value)||
    authority.approval.value.definitionDigest!==a.invocation.definitionDigest||authority.approval.value.requestDigest!==a.invocation.invocationPayloadDigest||authority.approval.value.scopeDigest!==scope.digest||
    a.resourceDigest!==sha256Canonical(releaseArtifactResources(a) as unknown as JsonValue)||
    grants.some(g=>g.scopeRef!==scope.ref||g.scopeDigest!==scope.digest||g.approvalRef!==authority.approval.ref||g.approvalDigest!==authority.approval.digest||g.authorityBasisRef!==authority.authority.ref||g.authorityBasisDigest!==authority.authority.digest))return false;
 if(!same(slots.capability_grants,{requiredCapabilityRefs:packet.metadata.capabilityRefs,grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))})||grants.some(g=>g.actorRef!==a.actorRef||g.definitionDigest!==a.invocation.definitionDigest||!same(g.definitionKey,p.definitionKey)))return false;
 return isExactOperationInvocationCoordinate(a.invocation)&&same(a.scope,a.memberKey==="published_rc"?releaseAuthorityScope(a.request,a.proof,a.selection,a.effectGrant):releaseAcceptanceScope(a.request,a.proof,a.selection,a.effectGrant))&&
  (a.memberKey==="published_rc"||releaseRulingDecision(a.request,a.publication,a.ruling,a.effectGrant)===a.decision&&
    (a.observation.disposition!=="complete"||a.addendum!==null))&&
  isRecord(p)&&p.invocationRef===a.invocation.invocationRef&&p.definitionDigest===a.invocation.definitionDigest&&p.requestDigest===a.invocation.invocationPayloadDigest&&
  same(p.request,a.request)&&isRecord(p.invocationAuthority)&&isRecord(p.invocationAuthority.slots)&&
  same(p.invocationAuthority.slots.workspace_binding,a.workspaceBinding)&&same(p.invocationAuthority.slots.product_set,a.productSet)&&
  same(p.invocationAuthority.slots.dependency_lock,a.dependencyLock)&&same(p.invocationAuthority.slots.capability_grants,a.capabilityGrants)&&
  isRecord(p.invocationAuthority.slots.actor)&&isRecord(p.invocationAuthority.slots.actor.actor)&&p.invocationAuthority.slots.actor.actor.ref===a.actorRef;
}
export function readReleaseArtifactBytes(path:string,coordinate:ReferenceDigest):ReleaseOperationArtifact|null{
 try{const bytes=readFileSync(path),value:unknown=JSON.parse(bytes.toString("utf8"));return isReleaseOperationArtifact(value)&&same(releaseArtifactCoordinate(value),coordinate)&&bytes.toString("utf8")===canonicalJson(value as unknown as JsonValue)?value:null;}catch{return null;}
}

/** The resource body is conserved once across live admission and historical reads. */
export function releaseArtifactResources(a:ReleaseOperationArtifact){
 return a.memberKey==="published_rc"
  ? {kind:"release_publication_resources",schemaVersion:"5.0.0",eventResource:a.eventResource,proof:a.proof,selection:a.selection,effectGrant:a.effectGrant}
  : {kind:"release_acceptance_resources",schemaVersion:"5.0.0",eventResource:a.eventResource,proof:a.proof,selection:a.selection,effectGrant:a.effectGrant,publication:a.publication,ruling:a.ruling};
}
export function releaseRulingDecision(request:TappedReleaseSnapshotRequest,publication:PublishedReleaseOperationArtifact,ruling:ReleaseOwnerRuling|null,grant:ReleaseAcceptanceGrant){
 if(ruling===null||grant.sourceApproval===null||!same(request.acceptance,releaseOwnerRulingCoordinate(ruling))||
    !same(grant.sourceAuthority,grant.sourceApproval.authority)||!same(grant.humanAuthority,ruling.owner))return null;
 return resolveReleaseOwnerRuling(releaseAcceptanceRequest(request,publication,grant.humanAuthority,grant.requiredEvidence),ruling,grant.sourceApproval);
}
export interface ReleaseArtifactPremise {readonly operationId:string;readonly memberKey:string;readonly artifactRef:string;readonly artifactDigest:string;readonly artifact:JsonValue;}
/** Existing native artifact owner supplies ordered admitted rows. No extra
 * prefix/history interpreter and no claimed publication packet supplies truth. */
export function releaseAcceptancePublicationMatches(request:TappedReleaseSnapshotRequest,publication:PublishedReleaseOperationArtifact,
 rows:readonly ReleaseArtifactPremise[]):boolean{
 const selected=rows.filter(r=>r.operationId==="abg.operation.release.snapshot"&&r.memberKey==="published_rc"&&
  same({ref:r.artifactRef,digest:r.artifactDigest},request.acceptedRc));
 const basis=request.qualificationBasis,published=publication.request.qualificationBasis;
 if(selected.length!==1||!same(selected[0]!.artifact,publication)||publication.observation.disposition!=="complete"||
    publication.observation.snapshotManifest===null||!same(releaseArtifactCoordinate(publication),request.acceptedRc)||
    !same(request.requestedIdentity,publication.request.requestedIdentity)||basis.subjectKind!=="installed_rc"||
    !["artifact","productManifest","productContentDigest","productId","productVersion"].every(key=>same(basis[key as keyof typeof basis],published[key as keyof typeof published])))return false;
 const prior=rows.filter(r=>r.operationId==="abg.operation.release.snapshot"&&r.memberKey==="tapped_release"&&
  isRecord(r.artifact)&&isRecord(r.artifact.request)&&same(r.artifact.request.acceptedRc,request.acceptedRc)).at(-1);
 return prior===undefined?request.predecessor===null:same(request.predecessor,{ref:prior.artifactRef,digest:prior.artifactDigest})&&
  isRecord(prior.artifact)&&isRecord(prior.artifact.observation)&&prior.artifact.observation.disposition==="complete";
}
export function projectReleaseAcceptance(request:TappedReleaseSnapshotRequest,proof:QualificationProofResource,selection:QualificationEvidenceSelection,
 publication:PublishedReleaseOperationArtifact,ruling:ReleaseOwnerRuling|null,grant:ReleaseAcceptanceGrant,current:DurablePrefixCoordinate,rows:readonly ReleaseArtifactPremise[]){
 const qualification=projectReleaseQualification(request,proof,selection,current,"tapped_release");
 if(qualification===null||!releaseAcceptancePublicationMatches(request,publication,rows)||
    new Set(grant.requiredEvidence.map(e=>e.ref)).size!==grant.requiredEvidence.length||
    ![request.verdict,request.acceptedRc,qualification.selfConformance.assessment].every(e=>grant.requiredEvidence.some(s=>same(s,e))))return null;
 const decision=releaseRulingDecision(request,publication,ruling,grant);
 return decision===null?null:{qualification,decision};
}
/** Physical consequence only. The binding supplies authenticated publication,
 * installed qualification and original O/source; this leaf cannot mint them. */
export async function recordReleaseAcceptance(request:TappedReleaseSnapshotRequest,publication:PublishedReleaseOperationArtifact,
 ruling:ReleaseOwnerRuling,grant:ReleaseAcceptanceGrant,decision:"accept"|"withhold"):
 Promise<{observation:ReleasePhysicalObservation;addendum:ReferenceDigest|null}>{
 const effects:ReleasePhysicalObservation["effects"]=[],unknownEffects:string[]=[];
 let phase="acceptance_preflight",addendum:ReferenceDigest|null=null;
 const result=(disposition:ReleasePhysicalObservation["disposition"],message:string)=>({addendum,observation:{disposition,phase,message,effects,unknownEffects,
  sourceCommit:publication.observation.sourceCommit,sourceTree:publication.observation.sourceTree,refs:publication.observation.refs,
  snapshotManifest:publication.observation.snapshotManifest,snapshotFiles:publication.observation.snapshotFiles}});
 try{
  requireRelation(releaseRulingDecision(request,publication,ruling,grant)===decision,"original owner ruling/source differs from its exact request or external attribution");
  const original=publication.effectGrant,identity=request.requestedIdentity,rcRef=`refs/tags/v${identity.version}`;
  requireRelation(publication.observation.disposition==="complete"&&same(identity,publication.request.requestedIdentity),"complete exact published RC is required");
  requireRelation(isAbsolute(original.remote)||/^(?:https|ssh|file):\/\//.test(original.remote),"publication remote is not explicit");
  const retained=publication.observation.refs.filter(r=>r.ref===rcRef);
  requireRelation(retained.length===1,"publication requires one immutable annotated RC identity");
  const rc=retained[0]!,remote=rows(await git(original.sourceRoot,["ls-remote",original.remote,rcRef,rcRef+"^{}"]));
  requireRelation(await git(original.sourceRoot,["cat-file","-t",rcRef])==="tag"&&await git(original.sourceRoot,["rev-parse",rcRef])===rc.object&&
   await git(original.sourceRoot,["rev-parse",rcRef+"^{}"] )===rc.peeled&&remote.find(r=>r.ref===rcRef)?.object===rc.object&&remote.find(r=>r.ref===rcRef+"^{}")?.object===rc.peeled&&
   await git(original.sourceRoot,["rev-parse",rcRef+"^{tree}"])===publication.observation.sourceTree,"immutable RC object/commit/tree changed");
  for(const file of publication.observation.snapshotFiles){requireRelation(safeRelative(file.path),"snapshot member path invalid");const filePath=join(original.snapshotRoot,file.path);
   requireRelation(inside(original.snapshotRoot,await realpath(filePath))&&(await lstat(filePath)).isFile()&&sha256Bytes(await readFile(filePath))===file.digest,"published snapshot member changed");}
  requireRelation(publication.observation.snapshotFiles.some(f=>f.path===original.artifact.snapshotName&&f.digest===request.qualificationBasis.artifact.digest)&&
   publication.observation.snapshotFiles.some(f=>f.path==="release-claim"&&f.digest===identity.releaseClaim.digest),"published artifact/claim differ from installed qualification");
  for(const output of [grant.addendumRoot,grant.artifactOutputRoot]){
   await plainAncestors(output);requireRelation(![original.sourceRoot,original.snapshotRoot].some(root=>resolve(root)===resolve(output)||inside(root,output)),"acceptance outputs must be outside Product/source/snapshot/claims");
  }
  requireRelation(resolve(grant.addendumRoot)!==resolve(grant.artifactOutputRoot)&&!inside(grant.addendumRoot,grant.artifactOutputRoot)&&!inside(grant.artifactOutputRoot,grant.addendumRoot),"addendum and observation territories overlap");
  const body={kind:"same_rc_owner_ruling_addendum",schemaVersion:"5.0.0",request:releaseAcceptanceRequest(request,publication,grant.humanAuthority,grant.requiredEvidence),
   ruling,sourceApproval:grant.sourceApproval,decision,publication:request.acceptedRc,qualification:request.verdict,predecessor:request.predecessor};
  const bytes=Buffer.from(canonicalJson(body as unknown as JsonValue)),digest=sha256Bytes(bytes),file=join(grant.addendumRoot,digest.slice(7)+".json");
  phase="addendum_write";unknownEffects.push(file);await mkdir(grant.addendumRoot,{recursive:true});await writeFile(file,bytes,{flag:"wx"});
  unknownEffects.pop();addendum={ref:pathToFileURL(file).href,digest};effects.push({kind:"owner_ruling_addendum",ref:addendum.ref,digest});
  phase="addendum_readback";requireRelation(sha256Bytes(await readFile(file))===digest,"written addendum differs from original ruling");
  phase="complete";return result("complete",decision==="accept"?"actual same-RC owner acceptance recorded":"actual same-RC owner withholding recorded; no acceptance");
 }catch(error){return result(effects.length===0&&unknownEffects.length===0?"refused":"incomplete_effect",String(error));}
}
