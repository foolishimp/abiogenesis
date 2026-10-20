import * as Effect from "effect/Effect";
import * as v from "valibot";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  absolutePathSchema, digestSchema, jsonValueSchema, nonblankSchema,
  publicDefinitionKeySchema, refDigestSchema,
  admitRuntimeContract,
  type OwnerContractSourceDeclaration,
} from "../shared/public_function_contracts.js";
import {
  admitExactDefinitionCall, definitionFault, isRecord, sameJson,
} from "../shared/definition_binding_mechanics.js";
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
export interface AdmissionAuthorityResource {
  readonly basis: AdmissionCapabilityData;
  readonly authority: ResolvedAdmissionAuthority;
  readonly grants: readonly CapabilityGrant[];
}
export type AdmissionAuthorizedResources<R> = R & {
  readonly admissionAuthority: AdmissionAuthorityResource;
};

function digest(value: unknown) {
  return sha256Canonical(value as JsonValue);
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

export function admissionAuthoritySlots(slots: unknown): JsonValue {
  if (!isRecord(slots) || !("capability_grants" in slots)) {
    throw new TypeError("admission authority requires the declared authority slots");
  }
  const { capability_grants: _grants, ...remaining } = slots;
  return v.parse(jsonValueSchema, remaining);
}

const ADMISSION_OPERATIONS = new Set([
  "abg.operation.workspace.create", "abg.operation.workspace.open",
  "abg.operation.product.verify", "abg.operation.product.resolve",
  "abg.operation.product.install", "abg.operation.workspace.bind",
  "abg.operation.catalog.admit", "abg.operation.catalog.view",
  "abg.operation.catalog.apply", "abg.operation.conformance.evaluate",
]);

/** Existing environment owner over one exact selection. Historical release
 * observations authenticate their entry cut; live admission also requires the
 * current extent. Retained acquired coordinates reuse only real owner proof. */
export function admitCapabilityEnvironment(
  value: unknown,
  acquiredResource: AcquiredAbgEventResource | null = null,
  requireCurrent = true,
): ExactPrefixWorkspaceEnvironment {
  const selection = v.parse(admissionEnvironmentSelectionSchema, value);
  let prefix = selection.prefix;
  if (acquiredResource !== null) {
    assertHeldEventStoreAtDurablePrefix(acquiredResource.store, acquiredResource.entryPrefix);
    if (!sameJson(prefix, acquiredResource.entryPrefix))
      throw new TypeError("admission environment differs from the acquired current prefix");
    prefix = acquiredResource.entryPrefix;
  }
  const artifactTruth = projectOwnedPrefixArtifactTruth(prefix);
  if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection")
    throw new TypeError("admission requires authenticated exact-prefix artifact truth");
  const environment = projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth, selection.workspaceBinding);
  if (environment.kind !== "exact_prefix_workspace_environment")
    throw new TypeError("admission requires the exact admitted prefix environment");
  if (requireCurrent) assertDurableRuntimePrefixCurrent(environment.prefix);
  return environment;
}

// The actual Product result is also bound once to this executing immutable
// install. This disposable relation conveys neither approval nor ABG currentness.
const executingOwnerArtifacts = new WeakSet<VerifiedProductArtifact>();

/** Establish/reuse immutable owner bytes; external approval is consumed here. */
export async function validateAdmissionCapabilityBasis(
  authorityInput: ResolvedAdmissionAuthority,
  actorRef: string,
  capabilityRef: string,
  basis: AdmissionCapabilityGrantConstructionBasis,
  acquiredResource: AcquiredAbgEventResource | null = null,
): Promise<Readonly<{ data: AdmissionCapabilityData; authority: ResolvedAdmissionAuthority;
  scope: ReturnType<typeof admissionAuthorityScope>; boundEnvironment: ExactPrefixWorkspaceEnvironment | null }>> {
  let authority: ResolvedAdmissionAuthority;
  let data: AdmissionCapabilityData;
  try {
    authority = v.parse(RESOLVED_ADMISSION_AUTHORITY_SCHEMA, authorityInput);
    data = v.parse(admissionCapabilityDataStructure, basis.data);
  } catch (cause) {
    throw new TypeError("admission grant requires valid external authority and closed data basis", { cause });
  }
  const boundEnvironment = data.boundEnvironment === null ? null :
    admitCapabilityEnvironment(data.boundEnvironment, acquiredResource);
  const scope = admissionAuthorityScope(data);
  const packet = basis.fixedPacket;
  const admissionOperation = ADMISSION_OPERATIONS.has(packet.definitionKey.operationId) ||
    (packet.definitionKey.operationId === "abg.operation.release.snapshot" && (packet.definitionKey.memberKey === "published_rc" || packet.definitionKey.memberKey === "tapped_release")) ||
    (packet.definitionKey.operationId === "abg.operation.witness.admit" &&
      packet.definitionKey.memberKey === "reprice");
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
    throw new TypeError("admission grant requires exact external approval, actor, request and owner scope");
  }
  const slots = data.resourceScope.authoritySlots;
  if (!isRecord(slots) || (packet.metadata.actorRequirement === "required" &&
      (!isRecord(slots.actor) || !isRecord(slots.actor.actor) || slots.actor.actor.ref !== actorRef))) {
    throw new TypeError("admission actor differs from the declared invocation actor");
  }
  if (packet.metadata.workspaceBindingRequirement === "forbidden") {
    if (data.boundEnvironment !== null || slots.workspace_binding !== null) {
      throw new TypeError("pre-binding definition forbids a WorkspaceBinding");
    }
  } else {
    const env = boundEnvironment;
    if (env === null || env.workspaceAuthorityBasis.authorizedActorRef !== actorRef ||
        !sameJson(slots.workspace_binding, { ref: env.workspaceBinding.bindingId, digest: env.workspaceBinding.bindingDigest }) ||
        !sameJson(slots.dependency_lock, { ref: env.resolvedProductLock.lockId, digest: env.resolvedProductLock.lockDigest }) ||
        !sameJson(slots.product_set, env.productInstalls.map(productInstallCoordinate))) {
      throw new TypeError("admission grant requires the exact admitted workspace, Product set and lock");
    }
  }
  const owned = selectOwnedProductVerification(data.ownerArtifact.request, data.ownerArtifact.verified);
  const verified = owned ?? await verifyProduct(data.ownerArtifact.request);
  if (verified.kind !== "verified_product_artifact" ||
      (owned === null && !sameJson(verified, data.ownerArtifact.verified))) {
    throw new TypeError("admission capability owner differs from the verified executing artifact");
  }
  if (!executingOwnerArtifacts.has(verified)) {
    const installedManifest = await readFile(fileURLToPath(new URL("../../../../product-toolchain-manifest.json", import.meta.url)));
    if (digest(JSON.parse(installedManifest.toString("utf8"))) !== verified.manifestDigest)
      throw new TypeError("admission capability owner differs from the verified executing artifact");
    executingOwnerArtifacts.add(verified);
  }
  // Share only owner-built immutable bodies; caller wrappers are not retained.
  return { data: deepFreeze({ ...data, ownerArtifact: { ...data.ownerArtifact, verified } }),
    authority: deepFreeze(authority), scope, boundEnvironment };
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
  return (call) => Effect.suspend(() => {
    let acquiredResource: AcquiredAbgEventResource | null = null;
    return Effect.tryPromise({
      try: async () => {
        if (admitExactDefinitionCall(call, packet) === null || !isRecord(call.resources)) {
          throw new TypeError("definition call differs from its fixed owner");
        }
        const parsed = v.parse(admissionAuthorityResourceStructure, call.resources.admissionAuthority);
        const { admissionAuthority: _authority, ...resources } = call.resources;
        if (!sameJson(parsed.basis.request, call.invocation.request) ||
            parsed.basis.resourceScope.resourcesDigest !== digest(resources) ||
            !sameJson(parsed.basis.resourceScope.authoritySlots, admissionAuthoritySlots(call.invocation.invocationAuthority.slots))) {
          throw new TypeError("admission resources differ from the approved request and authority scope");
        }
        // Bound reopened effects acquire once, before semantic reconstruction.
        // A new resource is still created only by its authorized effect owner.
        const assertion = (resources as Record<string, unknown>).eventResource;
        if (isAcquiredAbgEventResourceSelection(assertion) ||
            (parsed.basis.boundEnvironment !== null && isRecord(assertion) && assertion.kind === "reopen_abg_event_resource")) {
          if (!validateAbgEventResourceInput(assertion)) throw new TypeError("invalid event resource assertion");
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
        )) throw new TypeError("admission grants differ from exact owner reconstruction");
        return { call: { ...call, resources: resources as R }, boundEnvironment };
      },
      catch: (cause) => definitionFault(packet.definitionKey, "resource_admission", "resource_relation_mismatch", String(cause)),
    }).pipe(
      Effect.flatMap(({ call, boundEnvironment }) => owner(call, boundEnvironment, acquiredResource)),
      // An owner may refuse before entering its effect scope. Release the same
      // acquisition in every outcome; ordinary owner close still issues truth.
      Effect.ensuring(Effect.sync(() => { if (acquiredResource !== null) abandonAbgEventResource(acquiredResource); })),
    );
  });
}
