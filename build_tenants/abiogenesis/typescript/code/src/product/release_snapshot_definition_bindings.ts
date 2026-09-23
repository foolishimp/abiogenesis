import * as Effect from "effect/Effect";
import * as v from "valibot";
import { mkdir,writeFile } from "node:fs/promises";
import { join,resolve,relative,isAbsolute } from "node:path";
import { acquireAbgEventResource,closeAbgEventResource,abandonAbgEventResource,validateAbgEventResourceAssertion,validateAbgEventResourceReceipt,
 type AbgEventResourceAssertion,type AbgEventResourceReceipt,type AcquiredAbgEventResource } from "../abg/definition_event_resource.js";
import { admitArtifact,projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { projectEffectfulPublicInvocationTruthAtPrefix } from "../abg/effectful_invocation_truth.js";
import { projectExactPrefixArtifactTruth } from "../abg/artifact_truth.js";
import type { Sha256Digest } from "../shared/digests.js";
import { canonicalJson,type JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { bindExactPrefixTransition } from "../shared/static_definition_bindings.js";
import { definitionFault,isDefinitionFault,sameJson } from "../shared/definition_binding_mechanics.js";
import { nonblankSchema,refDigestSchema,type OwnerSemanticOutput } from "../shared/public_function_contracts.js";
import type { ExactDefinitionCallable,DefinitionExecutionFault } from "../shared/effect_definition.js";
import { QUALIFICATION_PROOF_RESOURCE_SCHEMA,QUALIFICATION_SELECTION_SCHEMA } from "../validator/qualification_contracts.js";
import { publishReleaseSnapshot,projectReleaseQualification } from "../implementation/release_publication.js";
import { withAdmissionAuthority, type AdmissionAuthorityResource, type AdmissionAuthorizedResources } from "./admission_authority.js";
import { verifyProduct } from "./verify_product.js";
import { productInstallCoordinate } from "./environment.js";
import { RELEASE_OPERATION_CONTRACTS,RELEASE_PUBLICATION_GRANT_SCHEMA,releaseRefusal,releaseAuthorityScope,
 releaseArtifactCoordinate,releaseHash,snapshotTappedRelease,type ReleaseOperationArtifact,type ReleasePhysicalObservation } from "./release_snapshot_operations.js";

export const RELEASE_PUBLICATION_RESOURCE_SCHEMA=v.strictObject({kind:v.literal("release_publication_resources"),schemaVersion:v.literal("5.0.0"),
 eventResource:v.custom<AbgEventResourceAssertion>(validateAbgEventResourceAssertion,"ABG event resource"),
 proof:QUALIFICATION_PROOF_RESOURCE_SCHEMA,selection:QUALIFICATION_SELECTION_SCHEMA,effectGrant:RELEASE_PUBLICATION_GRANT_SCHEMA});
export type ReleasePublicationResources=v.InferOutput<typeof RELEASE_PUBLICATION_RESOURCE_SCHEMA>;
export const RELEASE_PUBLICATION_RECEIPT_SCHEMA=v.strictObject({kind:v.literal("release_publication_receipt"),schemaVersion:v.literal("5.0.0"),
 eventResource:v.custom<AbgEventResourceReceipt>(validateAbgEventResourceReceipt,"ABG event receipt"),
 artifact:v.nullable(refDigestSchema),artifactPath:v.nullable(nonblankSchema),admissionEventRef:v.nullable(nonblankSchema)});
export type ReleasePublicationReceipt=v.InferOutput<typeof RELEASE_PUBLICATION_RECEIPT_SCHEMA>;
type Packet=typeof RELEASE_OPERATION_CONTRACTS.snapshot.published_rc;
const within=(root:string,path:string)=>{const rel=relative(resolve(root),resolve(path));return rel===""||(!isAbsolute(rel)&&rel!==".."&&!rel.startsWith("../"));};
const owner=(call:Parameters<ExactDefinitionCallable<Packet,ReleasePublicationResources,ReleasePublicationReceipt>>[0],approved:AdmissionAuthorityResource,heldResource:AcquiredAbgEventResource|null):ReturnType<ExactDefinitionCallable<Packet,ReleasePublicationResources,ReleasePublicationReceipt>>=>Effect.tryPromise({try:async()=>{
 let acquired:AcquiredAbgEventResource|undefined,observation:ReleasePhysicalObservation|null=null,artifact:ReturnType<typeof releaseArtifactCoordinate>|null=null,artifactPath:string|null=null,admissionEventRef:string|null=null,phase="resource_acquisition";
 try{
  const resources=call.resources,request=call.invocation.request,slots=call.invocation.invocationAuthority.slots;
  const result=heldResource===null?acquireAbgEventResource(resources.eventResource):{kind:"acquired_abg_event_resource" as const,resource:heldResource};
  if(result.kind!=="acquired_abg_event_resource")throw definitionFault(call.invocation.definitionKey,phase,result.code,result.message);
  acquired=result.resource;
  const refuse=(code:Parameters<typeof releaseRefusal>[1],message:string)=>deepFreeze({ownerOutput:{outcomeKind:"refusal" as const,value:releaseRefusal("published_rc",code,message)},resources:{kind:"release_publication_receipt" as const,schemaVersion:"5.0.0" as const,eventResource:closeAbgEventResource(acquired!,acquired!.entryPrefix),artifact:null,artifactPath:null,admissionEventRef:null}});
  phase="qualification_join";
  const qualification=projectReleaseQualification(request,resources.proof,resources.selection,acquired.entryPrefix);
  if(qualification===null)return refuse("basis_mismatch","one exact native same-subject green non-bypassed D5 verdict is required");
  const binding=slots.workspace_binding;
  if(binding===null)return refuse("identity_mismatch","release requires its current admitted workspace");
  const environment=projectExactPrefixWorkspaceEnvironment(acquired.entryPrefix,binding);
  if(environment.kind!=="exact_prefix_workspace_environment"||!sameJson(slots.product_set,environment.productInstalls.map(productInstallCoordinate))||
    !sameJson(slots.dependency_lock,{ref:environment.resolvedProductLock.lockId,digest:environment.resolvedProductLock.lockDigest}))return refuse("identity_mismatch","release Product set/lock differs from current native environment");
  if(environment.productInstalls.some(i=>[resources.effectGrant.snapshotRoot,resources.effectGrant.artifactOutputRoot,resources.effectGrant.sourceRoot].some(p=>within(i.installedRoot,p))))return refuse("identity_mismatch","release effects may not target an installed Product");
  const scope=releaseAuthorityScope(request,resources.proof,resources.selection,resources.effectGrant),truth=projectExactPrefixArtifactTruth(acquired.entryPrefix);
  const prior=projectEffectfulPublicInvocationTruthAtPrefix(acquired.entryPrefix,call.invocation.invocationRef);
  if(prior.disposition!=="available")return refuse("duplicate_invocation","invocation must be fresh in valid native history");
  if(truth.kind!=="exact_prefix_artifact_truth_projection"||truth.rows.some(row=>row.authorityScopeRef===scope.ref))return refuse("artifact_conflict","release scope already has native truth or history is invalid");
  phase="qualified_artifact_verification";const grant=resources.effectGrant,basis=request.qualificationBasis;
  const verified=await verifyProduct({artifactPath:grant.artifact.path,artifactRef:grant.artifact.ref,expectedArtifactDigest:basis.artifact.digest as Sha256Digest,
   expectedProductContentDigest:basis.productContentDigest as Sha256Digest,expectedManifestDigest:basis.productManifest.digest as Sha256Digest,expectedProductId:basis.productId,expectedPackageName:grant.artifact.packageName,expectedPackageVersion:basis.productVersion});
  if(verified.kind!=="verified_product_artifact")return refuse("identity_mismatch","qualified release archive failed existing Product verification");
  phase="physical_publication";observation=await publishReleaseSnapshot(request,grant,qualification);
  if(observation.disposition==="refused")return deepFreeze({ownerOutput:{outcomeKind:"refusal" as const,value:releaseRefusal("published_rc","publication_failure",observation.message,observation)},resources:{kind:"release_publication_receipt" as const,schemaVersion:"5.0.0" as const,eventResource:closeAbgEventResource(acquired,acquired.entryPrefix),artifact:null,artifactPath:null,admissionEventRef:null}});
  const invocation=constructExactOperationInvocationCoordinate({operationId:"abg.operation.release.snapshot",memberKey:"published_rc",definitionDigest:call.invocation.definitionDigest},call.invocation.invocationRef,call.invocation.requestDigest);
  const value:ReleaseOperationArtifact={kind:"release_operation_observation",schemaVersion:"5.0.0",memberKey:"published_rc",scope,invocation:{...invocation,operationId:"abg.operation.release.snapshot",memberKey:"published_rc"},
   entryPrefix:acquired.entryPrefix,admissionAuthority:approved as unknown as JsonValue,eventResource:resources.eventResource as unknown as JsonValue,grants:[...approved.grants] as unknown as JsonValue[],publicInvocation:call.invocation as unknown as JsonValue,resourceDigest:releaseHash(resources),actorRef:slots.actor!.actor.ref,
   capabilityGrants:slots.capability_grants as unknown as JsonValue,workspaceBinding:binding,productSet:slots.product_set as unknown as JsonValue,dependencyLock:slots.dependency_lock!,request,
   proof:resources.proof,selection:resources.selection,effectGrant:grant,observation};
  artifact=releaseArtifactCoordinate(value);artifactPath=join(grant.artifactOutputRoot,artifact.digest.slice(7)+".json");phase="artifact_write";
  await mkdir(grant.artifactOutputRoot,{recursive:true});await writeFile(artifactPath,canonicalJson(value as unknown as JsonValue),{flag:"wx"});
  phase="artifact_admission";const admitted=admitArtifact(acquired.store,{...invocation,operationId:"abg.operation.release.snapshot",authorityScopeRef:scope.ref,authorityScopeDigest:scope.digest,
   correlationId:call.invocation.correlationRef,eventTime:call.invocation.eventTime,causationEventRefs:[environment.workspaceBinding.admissionEventRef],predecessorPrefix:acquired.entryPrefix},"abg.operation.release.snapshot",artifact.ref,artifact.digest,{artifact:value as unknown as JsonValue});
  if(admitted.disposition!=="admitted"&&admitted.disposition!=="idempotent")throw new TypeError(`release artifact admission refused: ${JSON.stringify(admitted)}`);
  admissionEventRef=admitted.admissionEventRef;phase="resource_close";const eventResource=closeAbgEventResource(acquired,admitted.successorPrefix);
  const ownerOutput:OwnerSemanticOutput<Packet>=observation.disposition==="complete"?{outcomeKind:"result",value:{kind:"release_snapshot_result",schemaVersion:"5.0.0",memberKey:"published_rc",disposition:"complete",identity:request.requestedIdentity,artifact,observation}}:
   {outcomeKind:"refusal",value:releaseRefusal("published_rc","publication_failure",observation.message,observation,artifact)};
  return deepFreeze({ownerOutput,resources:{kind:"release_publication_receipt" as const,schemaVersion:"5.0.0" as const,eventResource,artifact,artifactPath,admissionEventRef}});
 }catch(error){
  if(acquired!==undefined){try{abandonAbgEventResource(acquired);}catch{/* Keep original failure and known/unknown effects. */}}
  const fault=isDefinitionFault(error)?error:definitionFault(call.invocation.definitionKey,phase,"release_publication_failure",String(error));
  throw {...fault,evidence:{phase,observation,artifact,artifactPath,admissionEventRef}};
 }
},catch:error=>error as DefinitionExecutionFault<Packet["definitionKey"]>});
const authorizedOwner:ExactDefinitionCallable<Packet,AdmissionAuthorizedResources<ReleasePublicationResources>,ReleasePublicationReceipt>=call=>
 withAdmissionAuthority<Packet,ReleasePublicationResources,ReleasePublicationReceipt>(RELEASE_OPERATION_CONTRACTS.snapshot.published_rc,
  (authorized,_environment,resource)=>bindExactPrefixTransition(RELEASE_OPERATION_CONTRACTS.snapshot.published_rc,
   admitted=>owner(admitted,call.resources.admissionAuthority,resource),RELEASE_PUBLICATION_RESOURCE_SCHEMA,RELEASE_PUBLICATION_RECEIPT_SCHEMA)(authorized))(call);
const published_rc=authorizedOwner;
const tapped_release:ExactDefinitionCallable<typeof RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release,null,null>=call=>Effect.succeed({ownerOutput:{outcomeKind:"refusal" as const,value:snapshotTappedRelease(call.invocation.request)},resources:null});
export const RELEASE_SNAPSHOT_DEFINITION_BINDINGS=Object.freeze({snapshot:Object.freeze({published_rc,tapped_release})});
