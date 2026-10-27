import * as Effect from "effect/Effect";
import * as v from "valibot";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  absolutePathSchema, digestSchema, jsonValueSchema, nonblankSchema,
  publicDefinitionKeySchema, refDigestSchema,
  admitRuntimeContract,
  type OwnerContractSourceDeclaration,
} from "../shared/public_function_contracts.js";
import {
  admitExactDefinitionCall, definitionFault, isDefinitionFault, isRecord, sameJson,
} from "../public/binding/definition_binding_mechanics.js";
import { admitJson } from "../shared/admit/index.js";
import { ok, type Outcome, type StructuralRefusal } from "../shared/refusal.js";
import type { DefinitionCall, ExactDefinitionCallable } from "../shared/effect_definition.js";
import {
  projectWorkspaceEnvironmentFromArtifactTruth,
  type ExactPrefixWorkspaceEnvironment,
} from "../abg/environment_admission.js";
import { projectOwnedPrefixArtifactTruth } from "../abg/artifact_truth.js";
import { assertDurableRuntimePrefixCurrent, assertHeldEventStoreAtDurablePrefix, captureDurablePrefixCoordinate, validateDurablePrefixCoordinate, type DurablePrefixCoordinate } from "../abg/event_store.js";
import { isVerifiedProductArtifact, selectOwnedProductVerification, verifyProduct } from "./verify_product.js";
import { constructAdmissionCapabilityGrants, type CapabilityGrant } from "./invocation.js";
import { productInstallCoordinate } from "./environment.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import { readExecutingToolchainIdentity } from "./declaration_exports.js";

import {
  acquireAbgEventResource, abandonAbgEventResource, validateAbgEventResourceInput, isAcquiredAbgEventResourceSelection,
  type AcquiredAbgEventResource,
} from "../abg/definition_event_resource.js";

const definitionCoordinateSchema = v.strictObject({
  definitionKey: publicDefinitionKeySchema,
  definitionRef: nonblankSchema,
  definitionDigest: digestSchema,
  owner: refDigestSchema,
});
const authorityValueSchema = v.strictObject({
  actorRef: nonblankSchema,
  authorityMode: v.literal("trusted_developer"),
});
const approvalValueSchema = v.strictObject({
  decision: v.literal("allow"),
  actorRef: nonblankSchema,
  definitionRef: nonblankSchema,
  definitionDigest: digestSchema,
  requestDigest: digestSchema,
  scopeDigest: digestSchema,
});
export const RESOLVED_ADMISSION_AUTHORITY_SCHEMA = v.strictObject({
  kind: v.literal("resolved_admission_authority"),
  schemaVersion: v.literal("5.0.0"),
  actorRef: nonblankSchema,
  authorityMode: v.literal("trusted_developer"),
  authority: v.strictObject({ ref: nonblankSchema, digest: digestSchema, value: authorityValueSchema }),
  approval: v.strictObject({ ref: nonblankSchema, digest: digestSchema, value: approvalValueSchema }),
});
export type ResolvedAdmissionAuthority = v.InferOutput<typeof RESOLVED_ADMISSION_AUTHORITY_SCHEMA>;

const verificationRequestSchema = v.strictObject({
  artifactPath: absolutePathSchema,
  artifactRef: nonblankSchema,
  expectedArtifactDigest: digestSchema,
  expectedProductContentDigest: digestSchema,
  expectedManifestDigest: digestSchema,
  expectedProductId: nonblankSchema,
  expectedPackageName: nonblankSchema,
  expectedPackageVersion: nonblankSchema,
});
const admissionEnvironmentSelectionSchema = v.strictObject({
  kind: v.literal("admission_environment_selection"),
  schemaVersion: v.literal("5.0.0"),
  prefix: v.custom<DurablePrefixCoordinate>(validateDurablePrefixCoordinate, "exact durable prefix coordinate"),
  workspaceBinding: refDigestSchema,
});
export type AdmissionEnvironmentSelection = v.InferOutput<typeof admissionEnvironmentSelectionSchema>;

/** Pure input selection, not an admitted environment or permission. */
export function admissionEnvironmentSelection(
  prefix: DurablePrefixCoordinate,
  workspaceBinding: AdmissionEnvironmentSelection["workspaceBinding"],
): AdmissionEnvironmentSelection {
  return deepFreeze(v.parse(admissionEnvironmentSelectionSchema, {
    kind: "admission_environment_selection", schemaVersion: "5.0.0",
    prefix: captureDurablePrefixCoordinate(prefix), workspaceBinding,
  }));
}

const admissionCapabilityDataStructure = v.strictObject({
  kind: v.literal("admission_capability_data"),
  schemaVersion: v.literal("5.0.0"),
  definition: definitionCoordinateSchema,
  ownerArtifact: v.strictObject({
    request: verificationRequestSchema,
    // Structural ingress only. Exact immutable bytes and all semantic fields
    // are checked once by validateAdmissionCapabilityBasis before consumption.
    verified: v.custom<VerifiedProductArtifact>(value => isRecord(value) &&
      value.kind === "verified_product_artifact", "verified Product artifact preimage"),
  }),
  request: jsonValueSchema,
  resourceScope: v.strictObject({
    resourcesDigest: digestSchema,
    authoritySlots: jsonValueSchema,
  }),
  boundEnvironment: v.nullable(admissionEnvironmentSelectionSchema),
});
/** Closed serialized data shape. Environment meaning is established by the
 * admission owner below, never by parsing or a caller-supplied derived body. */
export const ADMISSION_CAPABILITY_DATA_SCHEMA = v.strictObject({
  ...admissionCapabilityDataStructure.entries,
  ownerArtifact: v.strictObject({ request: verificationRequestSchema,
    verified: v.custom<VerifiedProductArtifact>(isVerifiedProductArtifact, "verified Product artifact") }),
});
export type AdmissionCapabilityData = v.InferOutput<typeof ADMISSION_CAPABILITY_DATA_SCHEMA>;
export interface AdmissionCapabilityGrantConstructionBasis {
  readonly kind: "admission_capability_grant_construction_basis";
  /** Native-only: never serialized or reconstructed from coordinate fields. */
  readonly fixedPacket: OwnerContractSourceDeclaration;
  readonly data: AdmissionCapabilityData;
}
export const ADMISSION_AUTHORITY_RESOURCE_SCHEMA = v.strictObject({
  basis: ADMISSION_CAPABILITY_DATA_SCHEMA,
  authority: RESOLVED_ADMISSION_AUTHORITY_SCHEMA,
  grants: v.array(jsonValueSchema),
});
/** Internal fixed-owner ingress; not a public semantic assertion. */
export const admissionAuthorityResourceStructure = v.strictObject({
  basis: admissionCapabilityDataStructure,
  authority: RESOLVED_ADMISSION_AUTHORITY_SCHEMA,
  grants: v.array(jsonValueSchema),
});
export type AdmissionAuthorityResource = {
  readonly basis: AdmissionCapabilityData;
  readonly authority: ResolvedAdmissionAuthority;
  readonly grants: readonly CapabilityGrant[];
};
export type AdmissionAuthorizedResources<R> = R & {
  readonly admissionAuthority: AdmissionAuthorityResource;
};

function digest(value: JsonValue) {
  return sha256Canonical(value);
}

/** Exact request/resource scope. Grant coordinates are the output, not an input. */
export function admissionAuthorityScope(data: AdmissionCapabilityData) {
  const body = {
    definition: data.definition,
    requestDigest: digest(data.request),
    ownerArtifact: {
      artifactRef: data.ownerArtifact.verified.artifactRef,
      artifactDigest: data.ownerArtifact.verified.artifactDigest,
      manifestDigest: data.ownerArtifact.verified.manifestDigest,
      capabilityGraphDigest: data.ownerArtifact.verified.capabilityDefinitionGraph.graphDigest,
    },
    resourceScope: data.resourceScope,
    ...(data.boundEnvironment === null ? { boundEnvironmentDigest: null } : {
      boundEnvironmentSelection: v.parse(admissionEnvironmentSelectionSchema, data.boundEnvironment),
    }),
  };
  const scopeDigest = digest(body);
  return deepFreeze({ ref: `admission-scope://abiogenesis/${scopeDigest}`, digest: scopeDigest });
}

/** One refusal of capability admission in the admit family. `evidence.reason`
 * is the message the operation surfaces for it. */
function admissionRefusal(code: string, path: readonly string[], reason: string): StructuralRefusal {
  return deepFreeze({ kind: "structural_refusal" as const, stage: "validate" as const, code, path: [...path], evidence: { reason } });
}
const AUTHORITY_SLOTS_UNDECLARED = admissionRefusal("authority_slots_undeclared", ["invocationAuthority", "slots"],
  "admission authority requires the declared authority slots");
const DATA_BASIS_INVALID = admissionRefusal("data_basis_invalid", ["admissionAuthority"],
  "admission grant requires valid external authority and closed data basis");
const ACQUIRED_PREFIX_MISMATCH = admissionRefusal("acquired_prefix_mismatch", ["boundEnvironment", "prefix"],
  "admission environment differs from the acquired current prefix");
const ARTIFACT_TRUTH_UNAUTHENTICATED = admissionRefusal("artifact_truth_unauthenticated", ["boundEnvironment", "prefix"],
  "admission requires authenticated exact-prefix artifact truth");
const ENVIRONMENT_UNADMITTED = admissionRefusal("environment_unadmitted", ["boundEnvironment", "workspaceBinding"],
  "admission requires the exact admitted prefix environment");
const APPROVAL_MISMATCH = admissionRefusal("approval_mismatch", ["authority", "approval"],
  "admission grant requires exact external approval, actor, request and owner scope");
const ACTOR_MISMATCH = admissionRefusal("actor_mismatch", ["resourceScope", "authoritySlots", "actor"],
  "admission actor differs from the declared invocation actor");
const WORKSPACE_BINDING_FORBIDDEN = admissionRefusal("workspace_binding_forbidden", ["boundEnvironment"],
  "pre-binding definition forbids a WorkspaceBinding");
const ENVIRONMENT_SCOPE_MISMATCH = admissionRefusal("environment_scope_mismatch", ["resourceScope", "authoritySlots"],
  "admission grant requires the exact admitted workspace, Product set and lock");
const OWNER_ARTIFACT_MISMATCH = admissionRefusal("owner_artifact_mismatch", ["ownerArtifact", "verified"],
  "admission capability owner differs from the verified executing artifact");
const DEFINITION_CALL_MISMATCH = admissionRefusal("definition_call_mismatch", ["invocation"],
  "definition call differs from its fixed owner");
const RESOURCE_SCOPE_MISMATCH = admissionRefusal("resource_scope_mismatch", ["resources"],
  "admission resources differ from the approved request and authority scope");
const EVENT_RESOURCE_INVALID = admissionRefusal("event_resource_invalid", ["resources", "eventResource"],
  "invalid event resource assertion");
const GRANTS_MISMATCH = admissionRefusal("grants_mismatch", ["invocationAuthority", "slots", "capability_grants"],
  "admission grants differ from exact owner reconstruction");

/** The one mapping from an admission refusal to the TypeError the exported
 * admission functions throw; its string is the surfaced message. */
function admissionRefusalError(refusal: StructuralRefusal): TypeError {
  return new TypeError(String(refusal.evidence.reason));
}

/** Deterministic check: the declared authority slots without the grants slot. */
function admitAuthoritySlots(slots: unknown): Outcome<JsonValue> {
  if (!isRecord(slots) || !("capability_grants" in slots)) return AUTHORITY_SLOTS_UNDECLARED;
  const { capability_grants: _grants, ...remaining } = slots;
  return ok(v.parse(jsonValueSchema, remaining));
}

export function admissionAuthoritySlots(slots: unknown): JsonValue {
  const admitted = admitAuthoritySlots(slots);
  if (admitted.kind !== "ok") throw admissionRefusalError(admitted);
  return admitted.value;
}

const ADMISSION_OPERATIONS = new Set([
  "abg.operation.workspace.create", "abg.operation.workspace.open",
  "abg.operation.product.verify", "abg.operation.product.resolve",
  "abg.operation.product.install", "abg.operation.workspace.bind",
  "abg.operation.catalog.admit", "abg.operation.catalog.view",
  "abg.operation.catalog.apply", "abg.operation.conformance.evaluate",
  "abg.operation.result.assess",
  "abg.operation.product.materialize",
]);

/** Observation under the operation's effect contract: the held store at its
 * acquired current prefix coordinate. A store failure propagates as the
 * operation's effect failure. */
function observeAcquiredPrefix(acquiredResource: AcquiredAbgEventResource | null): DurablePrefixCoordinate | null {
  if (acquiredResource === null) return null;
  assertHeldEventStoreAtDurablePrefix(acquiredResource.store, acquiredResource.entryPrefix);
  return acquiredResource.entryPrefix;
}

/** Deterministic check: the selection names the acquired current prefix. */
function checkAcquiredPrefix(
  selection: AdmissionEnvironmentSelection,
  acquiredPrefix: DurablePrefixCoordinate | null,
): Outcome<DurablePrefixCoordinate> {
  if (acquiredPrefix === null) return ok(selection.prefix);
  return sameJson(selection.prefix, acquiredPrefix) ? ok(acquiredPrefix) : ACQUIRED_PREFIX_MISMATCH;
}

/** Observation at one prefix: its artifact truth, the environment projected
 * from that truth, and, for live admission, the currentness of the projected
 * environment's prefix. A store or log failure propagates as the operation's
 * effect failure. */
function observePrefixEnvironment(
  prefix: DurablePrefixCoordinate,
  workspaceBinding: AdmissionEnvironmentSelection["workspaceBinding"],
  requireCurrent: boolean,
) {
  const artifactTruth = projectOwnedPrefixArtifactTruth(prefix);
  const environment = artifactTruth.kind === "exact_prefix_artifact_truth_projection"
    ? projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth, workspaceBinding)
    : null;
  if (requireCurrent && environment?.kind === "exact_prefix_workspace_environment") {
    assertDurableRuntimePrefixCurrent(environment.prefix);
  }
  return { artifactTruth, environment };
}

/** Deterministic check over the prefix observation. */
function checkPrefixEnvironment(
  observed: ReturnType<typeof observePrefixEnvironment>,
): Outcome<ExactPrefixWorkspaceEnvironment> {
  if (observed.artifactTruth.kind !== "exact_prefix_artifact_truth_projection") return ARTIFACT_TRUTH_UNAUTHENTICATED;
  if (observed.environment?.kind !== "exact_prefix_workspace_environment") return ENVIRONMENT_UNADMITTED;
  return ok(observed.environment);
}

/** Environment admission over one exact selection: each observation, then its
 * deterministic check, in that order. */
function admitCapabilityEnvironmentOutcome(
  value: unknown,
  acquiredResource: AcquiredAbgEventResource | null,
  requireCurrent: boolean,
): Outcome<ExactPrefixWorkspaceEnvironment> {
  const selection = v.parse(admissionEnvironmentSelectionSchema, value);
  const located = checkAcquiredPrefix(selection, observeAcquiredPrefix(acquiredResource));
  if (located.kind !== "ok") return located;
  return checkPrefixEnvironment(observePrefixEnvironment(located.value, selection.workspaceBinding, requireCurrent));
}

/** Existing environment owner over one exact selection. Historical release
 * observations authenticate their entry cut; live admission also requires the
 * current extent. Retained acquired coordinates reuse only real owner proof. */
export function admitCapabilityEnvironment(
  value: unknown,
  acquiredResource: AcquiredAbgEventResource | null = null,
  requireCurrent = true,
): ExactPrefixWorkspaceEnvironment {
  // A refusal is thrown as its TypeError.
  const admitted = admitCapabilityEnvironmentOutcome(value, acquiredResource, requireCurrent);
  if (admitted.kind !== "ok") throw admissionRefusalError(admitted);
  return admitted.value;
}

type AdmittedCapabilityBasis = Awaited<ReturnType<typeof validateAdmissionCapabilityBasis>>;

/** Deterministic check: the external authority and the closed data basis. */
function admitCapabilityBasisInput(
  authorityInput: ResolvedAdmissionAuthority,
  basis: AdmissionCapabilityGrantConstructionBasis,
): Outcome<Readonly<{ authority: ResolvedAdmissionAuthority; data: AdmissionCapabilityData }>> {
  try {
    return ok({
      authority: v.parse(RESOLVED_ADMISSION_AUTHORITY_SCHEMA, authorityInput),
      data: v.parse(admissionCapabilityDataStructure, basis.data),
    });
  } catch {
    return DATA_BASIS_INVALID;
  }
}

/** Deterministic check: approval, actor, request and owner scope, and the
 * workspace relation the definition declares. */
function checkAdmissionScope(
  authority: ResolvedAdmissionAuthority,
  data: AdmissionCapabilityData,
  scope: ReturnType<typeof admissionAuthorityScope>,
  boundEnvironment: ExactPrefixWorkspaceEnvironment | null,
  packet: OwnerContractSourceDeclaration,
  actorRef: string,
  capabilityRef: string,
): Outcome<null> {
  const admissionOperation = ADMISSION_OPERATIONS.has(packet.definitionKey.operationId) ||
    (packet.definitionKey.operationId === "abg.operation.release.snapshot" && (packet.definitionKey.memberKey === "published_rc" || packet.definitionKey.memberKey === "tapped_release")) ||
    (packet.definitionKey.operationId === "abg.operation.witness.admit" &&
      (packet.definitionKey.memberKey === "reprice" || packet.definitionKey.memberKey === "run-stopped"));
  if (!admissionOperation ||
      !sameJson(data.definition.definitionKey, packet.definitionKey) ||
      !sameJson(data.definition.owner, { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest }) ||
      !packet.metadata.capabilityRefs.includes(capabilityRef) ||
      authority.actorRef !== actorRef || authority.authority.value.actorRef !== actorRef ||
      authority.approval.value.actorRef !== actorRef ||
      authority.authority.digest !== digest(authority.authority.value) ||
      authority.approval.digest !== digest(authority.approval.value) ||
      authority.approval.value.definitionRef !== data.definition.definitionRef ||
      authority.approval.value.definitionDigest !== data.definition.definitionDigest ||
      authority.approval.value.requestDigest !== digest(data.request) ||
      authority.approval.value.scopeDigest !== scope.digest ||
      admitRuntimeContract(packet.requestSchema, data.request).disposition !== "admitted") {
    return APPROVAL_MISMATCH;
  }
  const slots = data.resourceScope.authoritySlots;
  if (!isRecord(slots) || (packet.metadata.actorRequirement === "required" &&
      (!isRecord(slots.actor) || !isRecord(slots.actor.actor) || slots.actor.actor.ref !== actorRef))) {
    return ACTOR_MISMATCH;
  }
  if (packet.metadata.workspaceBindingRequirement === "forbidden") {
    if (data.boundEnvironment !== null || slots.workspace_binding !== null) {
      return WORKSPACE_BINDING_FORBIDDEN;
    }
  } else {
    const env = boundEnvironment;
    if (env === null || env.workspaceAuthorityBasis.authorizedActorRef !== actorRef ||
        !sameJson(slots.workspace_binding, { ref: env.workspaceBinding.bindingId, digest: env.workspaceBinding.bindingDigest }) ||
        !sameJson(slots.dependency_lock, { ref: env.resolvedProductLock.lockId, digest: env.resolvedProductLock.lockDigest }) ||
        !sameJson(slots.product_set, env.productInstalls.map(productInstallCoordinate))) {
      return ENVIRONMENT_SCOPE_MISMATCH;
    }
  }
  return ok(null);
}

/** Observation under the operation's effect contract: the owner artifact as
 * this owner verified it, or physical verification of the requested bytes. */
async function observeOwnerArtifact(ownerArtifact: AdmissionCapabilityData["ownerArtifact"]) {
  const owned = selectOwnedProductVerification(ownerArtifact.request, ownerArtifact.verified);
  return { owned, verified: owned ?? await verifyProduct(ownerArtifact.request) };
}

/** Deterministic check: the observed artifact is the verified owner the data names. */
function checkOwnerArtifact(
  ownerArtifact: AdmissionCapabilityData["ownerArtifact"],
  observed: Awaited<ReturnType<typeof observeOwnerArtifact>>,
): Outcome<VerifiedProductArtifact> {
  const { owned, verified } = observed;
  return verified.kind !== "verified_product_artifact" || (owned === null && !sameJson(verified, ownerArtifact.verified))
    ? OWNER_ARTIFACT_MISMATCH
    : ok(verified);
}

/** Observation under the operation's effect contract: the executing
 * toolchain's identity, read once per admission through the one reader of the
 * executing manifest (`readExecutingToolchainIdentity`). A read or parse
 * failure propagates as the operation's effect failure. */
async function observeExecutingToolchainIdentity(): Promise<Readonly<{ manifestDigest: string; productContentDigest: unknown }>> {
  const { manifestDigest, productContentDigest } = readExecutingToolchainIdentity();
  return { manifestDigest, productContentDigest };
}

/** Deterministic check: the verified artifact is the executing install, by
 * both its manifest digest and its product content digest. */
function checkExecutingOwner(
  verified: VerifiedProductArtifact,
  executing: Awaited<ReturnType<typeof observeExecutingToolchainIdentity>>,
): Outcome<VerifiedProductArtifact> {
  return executing.manifestDigest === verified.manifestDigest &&
      executing.productContentDigest === verified.productContentDigest
    ? ok(verified)
    : OWNER_ARTIFACT_MISMATCH;
}

/** Capability admission: each observation, then its deterministic check, in
 * the order the operation surfaces them. */
async function admitAdmissionCapabilityBasis(
  authorityInput: ResolvedAdmissionAuthority,
  actorRef: string,
  capabilityRef: string,
  basis: AdmissionCapabilityGrantConstructionBasis,
  acquiredResource: AcquiredAbgEventResource | null,
): Promise<Outcome<AdmittedCapabilityBasis>> {
  const input = admitCapabilityBasisInput(authorityInput, basis);
  if (input.kind !== "ok") return input;
  const { authority, data } = input.value;
  const boundEnvironment = data.boundEnvironment === null ? ok(null) :
    admitCapabilityEnvironmentOutcome(data.boundEnvironment, acquiredResource, true);
  if (boundEnvironment.kind !== "ok") return boundEnvironment;
  const scope = admissionAuthorityScope(data);
  const scoped = checkAdmissionScope(authority, data, scope, boundEnvironment.value, basis.fixedPacket, actorRef, capabilityRef);
  if (scoped.kind !== "ok") return scoped;
  const owner = checkOwnerArtifact(data.ownerArtifact, await observeOwnerArtifact(data.ownerArtifact));
  if (owner.kind !== "ok") return owner;
  const executing = checkExecutingOwner(owner.value, await observeExecutingToolchainIdentity());
  if (executing.kind !== "ok") return executing;
  const verified = executing.value;
  // Share only owner-built immutable bodies; caller wrappers are not retained.
  return ok({ data: deepFreeze({ ...data, ownerArtifact: { ...data.ownerArtifact, verified } }),
    authority: deepFreeze(authority), scope, boundEnvironment: boundEnvironment.value });
}

/** Establish/reuse immutable owner bytes; external approval is consumed here. */
export async function validateAdmissionCapabilityBasis(
  authorityInput: ResolvedAdmissionAuthority,
  actorRef: string,
  capabilityRef: string,
  basis: AdmissionCapabilityGrantConstructionBasis,
  acquiredResource: AcquiredAbgEventResource | null = null,
): Promise<Readonly<{ data: AdmissionCapabilityData; authority: ResolvedAdmissionAuthority;
  scope: ReturnType<typeof admissionAuthorityScope>; boundEnvironment: ExactPrefixWorkspaceEnvironment | null }>> {
  // A refusal rejects as its TypeError.
  const admitted = await admitAdmissionCapabilityBasis(authorityInput, actorRef, capabilityRef, basis, acquiredResource);
  if (admitted.kind !== "ok") throw admissionRefusalError(admitted);
  return admitted.value;
}

/** Native call-local handoff; never serialized or supplied as authority data. */
export type AdmissionDefinitionOwner<P extends OwnerContractSourceDeclaration, R, O> = (
  call: DefinitionCall<P, R>,
  boundEnvironment: ExactPrefixWorkspaceEnvironment | null,
  acquiredResource: AcquiredAbgEventResource | null,
) => ReturnType<ExactDefinitionCallable<P, R, O>>;

/** Called by one fixed owner. Structural parsing establishes no environment truth. */
export function withAdmissionAuthority<P extends OwnerContractSourceDeclaration, R, O>(
  packet: P,
  owner: AdmissionDefinitionOwner<P, R, O>,
): ExactDefinitionCallable<P, AdmissionAuthorizedResources<R>, O> {
  // One surface for both: a thrown observation failure and a typed refusal
  // each become the resource_admission fault whose message is the string of
  // the cause (for a refusal, of its TypeError). A definition fault thrown
  // inside (the resource_acquisition fault) rides in the message as its inline
  // subject: its stage, code and message.
  const fault = (cause: unknown) =>
    definitionFault(packet.definitionKey, "resource_admission", "resource_relation_mismatch",
      isDefinitionFault(cause) ? canonicalJson({ stage: cause.stage, code: cause.code, message: cause.message }) : String(cause));
  return (call) => Effect.suspend(() => {
    let acquiredResource: AcquiredAbgEventResource | null = null;
    return Effect.tryPromise({
      try: async (): Promise<Outcome<Readonly<{ call: DefinitionCall<P, R>; boundEnvironment: ExactPrefixWorkspaceEnvironment | null }>>> => {
        if (admitExactDefinitionCall(call, packet) === null || !isRecord(call.resources)) {
          return DEFINITION_CALL_MISMATCH;
        }
        const parsed = v.parse(admissionAuthorityResourceStructure, call.resources.admissionAuthority);
        const { admissionAuthority: _authority, ...resources } = call.resources;
        // The resource scope digest is taken over the admitted I-JSON resources;
        // resources that are not I-JSON differ from the approved scope.
        const admittedResources = admitJson(resources);
        if (admittedResources.kind !== "ok" || !sameJson(parsed.basis.request, call.invocation.request) ||
            parsed.basis.resourceScope.resourcesDigest !== digest(admittedResources.value)) {
          return RESOURCE_SCOPE_MISMATCH;
        }
        const slots = admitAuthoritySlots(call.invocation.invocationAuthority.slots);
        if (slots.kind !== "ok") return slots;
        if (!sameJson(parsed.basis.resourceScope.authoritySlots, slots.value)) return RESOURCE_SCOPE_MISMATCH;
        // Bound reopened effects acquire once, before semantic reconstruction.
        // A new resource is still created only by its authorized effect owner.
        const assertion = (resources as Record<string, unknown>).eventResource;
        if (isAcquiredAbgEventResourceSelection(assertion) ||
            (parsed.basis.boundEnvironment !== null && isRecord(assertion) && assertion.kind === "reopen_abg_event_resource")) {
          if (!validateAbgEventResourceInput(assertion)) return EVENT_RESOURCE_INVALID;
          const acquired = acquireAbgEventResource(assertion);
          if (acquired.kind !== "acquired_abg_event_resource") throw definitionFault(
            packet.definitionKey, "resource_acquisition", acquired.code, acquired.message);
          acquiredResource = acquired.resource;
        }
        const { grants, boundEnvironment } = await constructAdmissionCapabilityGrants(
          parsed.authority, parsed.authority.actorRef,
          { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data: parsed.basis },
          acquiredResource,
        );
        if (!sameJson(parsed.grants, grants) || !sameJson(
          call.invocation.invocationAuthority.slots.capability_grants,
          { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: grants.map((grant) => ({ ref: grant.grantRef, digest: grant.grantDigest })) },
        )) return GRANTS_MISMATCH;
        return ok({ call: { ...call, resources: resources as R }, boundEnvironment });
      },
      catch: fault,
    }).pipe(
      Effect.flatMap((admitted) => admitted.kind === "ok"
        ? owner(admitted.value.call, admitted.value.boundEnvironment, acquiredResource)
        : Effect.fail(fault(admissionRefusalError(admitted)))),
      // An owner may refuse before entering its effect scope. Release the same
      // acquisition in every outcome; ordinary owner close still issues truth.
      Effect.ensuring(Effect.sync(() => { if (acquiredResource !== null) abandonAbgEventResource(acquiredResource); })),
    );
  });
}
