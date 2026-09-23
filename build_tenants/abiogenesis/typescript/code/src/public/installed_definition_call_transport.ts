import { isRecord, hasExactKeys } from "../shared/admission_predicates.js";
import * as abg from "../abg/index.js";
import * as product from "../product/index.js";
import {
  runExactDefinition,
  type DefinitionCall,
  type DefinitionHostReceipt,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import {
  OWNER_CONTRACT_SOURCES,
} from "../shared/owner_contract_source_set.js";
import type {
  OwnerContractSourceDeclaration,
} from "../shared/public_function_contracts.js";
import { admitExactDefinitionCall } from "../shared/definition_binding_mechanics.js";
import type { JsonValue } from "../shared/canonical_json.js";
import * as validator from "../validator/index.js";

export type InstalledDefinitionCallAcquisition =
  | Readonly<{ readonly kind: "eventless" }>
  | Readonly<{
    readonly kind: "new";
    readonly eventLogPath: string;
  }>
  | Readonly<{
    readonly kind: "reopen";
    readonly closeHandoff: JsonValue;
  }>;

export interface InstalledDefinitionCallTransportRefusal {
  readonly kind: "installed_definition_call_transport_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "invalid_definition_call"
    | "unknown_definition"
    | "installed_binding_unavailable"
    | "acquisition_mismatch";
  readonly message: string;
}

export interface InstalledDefinitionCallTransportResult {
  readonly kind: "installed_definition_call_transport_result";
  readonly schemaVersion: "5.0.0";
  readonly acquisitionKind: "eventless" | "new" | "reopen" | "acquired";
  readonly receipt: DefinitionHostReceipt;
}

export type InstalledDefinitionCallTransportOutcome =
  | InstalledDefinitionCallTransportResult
  | InstalledDefinitionCallTransportRefusal;

type InstalledModulePath = "./product" | "./abg" | "./validator";
type InstalledModule = Readonly<Record<string, unknown>>;
type AnyDefinitionCall = DefinitionCall<OwnerContractSourceDeclaration, unknown>;
type AnyDefinitionCallable = ExactDefinitionCallable<
  OwnerContractSourceDeclaration,
  unknown,
  unknown
>;

const INSTALLED_OWNER_MODULES: Readonly<
  Record<InstalledModulePath, InstalledModule>
> = Object.freeze({
  "./product": product as InstalledModule,
  "./abg": abg as InstalledModule,
  "./validator": validator as InstalledModule,
});

function hasOwnDataProperty(
  value: Readonly<Record<string, unknown>>,
  property: string,
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(value, property);
  return descriptor !== undefined && Object.hasOwn(descriptor, "value");
}

function isInstalledDefinitionCallAcquisition(
  value: unknown,
): value is InstalledDefinitionCallAcquisition {
  if (
    !isRecord(value) ||
    !hasOwnDataProperty(value, "kind")
  ) {
    return false;
  }
  if (value.kind === "eventless") return hasExactKeys(value, ["kind"]);
  if (value.kind === "new") {
    return hasExactKeys(value, ["kind", "eventLogPath"]) &&
      hasOwnDataProperty(value, "eventLogPath") &&
      typeof value.eventLogPath === "string";
  }
  return value.kind === "reopen" &&
    hasExactKeys(value, ["kind", "closeHandoff"]) &&
    hasOwnDataProperty(value, "closeHandoff") &&
    isRecord(value.closeHandoff);
}

export function isInstalledDefinitionCallCandidate(
  value: unknown,
): value is AnyDefinitionCall {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["invocation", "resources"]) ||
    !hasOwnDataProperty(value, "invocation") ||
    !hasOwnDataProperty(value, "resources")
  ) {
    return false;
  }
  const invocation = value.invocation;
  const resources = value.resources;
  if (
    !isRecord(invocation) ||
    !hasOwnDataProperty(invocation, "kind") ||
    !hasOwnDataProperty(invocation, "definitionKey") ||
    !isRecord(resources)
  ) {
    return false;
  }
  const definitionKey = invocation.definitionKey;
  return isRecord(definitionKey) &&
    hasOwnDataProperty(definitionKey, "operationId") &&
    hasOwnDataProperty(definitionKey, "memberKey") &&
    invocation.kind === "public_invocation" &&
    typeof definitionKey.operationId === "string" &&
    typeof definitionKey.memberKey === "string";
}

function refusal(
  code: InstalledDefinitionCallTransportRefusal["code"],
  message: string,
): InstalledDefinitionCallTransportRefusal {
  return Object.freeze({
    kind: "installed_definition_call_transport_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

function sameStructure(left: unknown, right: unknown): boolean {
  try {
    return product.canonicalJson(left as JsonValue) ===
      product.canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function acquisitionMatches(
  acquisition: InstalledDefinitionCallAcquisition,
  call: AnyDefinitionCall,
): boolean {
  const resources = call.resources;
  if (!isRecord(resources)) {
    return false;
  }
  if (acquisition.kind === "eventless") {
    return !Object.hasOwn(resources, "eventResource");
  }
  const eventResource = resources.eventResource;
  if (!isRecord(eventResource)) return false;
  return acquisition.kind === "new"
    ? eventResource.kind === "new_abg_event_resource" &&
      eventResource.eventLogPath === acquisition.eventLogPath
    : eventResource.kind === "reopen_abg_event_resource" &&
      sameStructure(eventResource.closeHandoff, acquisition.closeHandoff);
}

function selectedCallable(
  call: AnyDefinitionCall,
): AnyDefinitionCallable | InstalledDefinitionCallTransportRefusal {
  const matches = OWNER_CONTRACT_SOURCES.filter(({ packet }) =>
    packet.definitionKey.operationId ===
      call.invocation.definitionKey.operationId &&
    packet.definitionKey.memberKey === call.invocation.definitionKey.memberKey
  );
  if (matches.length !== 1) {
    return refusal(
      matches.length === 0 ? "unknown_definition" : "invalid_definition_call",
      "DefinitionCall must select one exact installed owner contract source",
    );
  }
  const packet = matches[0]!.packet;
  if (admitExactDefinitionCall(call, matches[0]!.declaration) === null) {
    return refusal(
      "invalid_definition_call",
      "DefinitionCall differs from its exact installed invocation contract",
    );
  }
  const locator = packet.executionBindingSpecification.callable;
  if (!Object.hasOwn(INSTALLED_OWNER_MODULES, locator.packageExportPath)) {
    return refusal(
      "installed_binding_unavailable",
      "manifest-bound installed definition module is unavailable",
    );
  }
  const installedModule = INSTALLED_OWNER_MODULES[
    locator.packageExportPath as InstalledModulePath
  ];
  if (!Object.hasOwn(installedModule, locator.namedExport)) {
    return refusal(
      "installed_binding_unavailable",
      "manifest-bound installed definition export is unavailable",
    );
  }
  let selected: unknown = installedModule[locator.namedExport];
  for (const member of locator.memberPath) {
    if (!isRecord(selected) || !Object.hasOwn(selected, member)) {
      return refusal(
        "installed_binding_unavailable",
        "manifest-bound installed definition member is unavailable",
      );
    }
    selected = selected[member];
  }
  return typeof selected === "function"
    ? selected as AnyDefinitionCallable
    : refusal(
      "installed_binding_unavailable",
      "manifest-bound installed definition callable is unavailable",
    );
}

/** Detachment does not invalidate an actual immutable Product owner result.
 * JSON copies retain no such provenance; the selected owner still validates
 * every request/resource relation before consuming either value. */
function preserveOwnedProductValues(
  original: AnyDefinitionCall,
  detached: AnyDefinitionCall,
): void {
  const resources = original.resources as Readonly<Record<string, unknown>>;
  const copied = detached.resources as Record<string, unknown>;
  const authority = resources.admissionAuthority;
  const basis = isRecord(authority) ? authority.basis : null;
  const ownerArtifact = isRecord(basis) && isRecord(basis.ownerArtifact) ? basis.ownerArtifact : null;
  const owner = ownerArtifact === null ? null : product.selectOwnedProductVerification(
    ownerArtifact.request, ownerArtifact.verified,
  );
  if (owner !== null) {
    const copiedAuthority = copied.admissionAuthority as Record<string, unknown>;
    const copiedBasis = copiedAuthority.basis as Record<string, unknown>;
    (copiedBasis.ownerArtifact as Record<string, unknown>).verified = owner;
  }
  const artifact = resources.kind === "product_verification_resources" &&
      resources.targetKind === "installed_artifact"
    ? resources.installedArtifact : resources.packedArtifact;
  if (!isRecord(artifact) || !isRecord(artifact.artifact) || !isRecord(artifact.productContent)) return;
  const verified = product.selectOwnedProductVerification({
    artifactPath: artifact.artifactPath,
    artifactRef: artifact.artifact.ref,
    expectedArtifactDigest: artifact.artifact.digest,
    expectedProductContentDigest: artifact.productContent.digest,
    expectedManifestDigest: artifact.manifestDigest,
    expectedProductId: artifact.productId,
    expectedPackageName: artifact.packageName,
    expectedPackageVersion: artifact.packageVersion,
  }, resources.verifiedArtifact);
  if (verified !== null) copied.verifiedArtifact = verified;
}

export async function runInstalledDefinitionCallTransport(
  acquisition: InstalledDefinitionCallAcquisition,
  candidate: unknown,
): Promise<InstalledDefinitionCallTransportOutcome> {
  let detachedEnvelope: unknown;
  try {
    detachedEnvelope = structuredClone({ acquisition, candidate });
  } catch {
    return refusal(
      "invalid_definition_call",
      "transport input is not one canonical DefinitionCall",
    );
  }
  const {
    acquisition: detachedAcquisition,
    candidate: detachedCandidate,
  } = detachedEnvelope as Readonly<Record<string, unknown>>;
  if (!isInstalledDefinitionCallAcquisition(detachedAcquisition)) {
    return refusal(
      "acquisition_mismatch",
      "top-level acquisition differs from the DefinitionCall event resource",
    );
  }
  if (!isInstalledDefinitionCallCandidate(detachedCandidate)) {
    return refusal(
      "invalid_definition_call",
      "transport input is not one canonical DefinitionCall",
    );
  }
  if (!acquisitionMatches(detachedAcquisition, detachedCandidate)) {
    return refusal(
      "acquisition_mismatch",
      "top-level acquisition differs from the DefinitionCall event resource",
    );
  }
  if (isInstalledDefinitionCallCandidate(candidate)) {
    preserveOwnedProductValues(candidate, detachedCandidate);
  }
  return invokeInstalledDefinitionCall(detachedAcquisition.kind, detachedCandidate);
}

/** Thin native carrier: semantic data is detached, while the exact owner-issued
 * physical selection survives. The same installed callable admits and executes it. */
export async function runInstalledDefinitionCallWithResource(
  resource: abg.AcquiredAbgEventResourceSelection,
  candidate: unknown,
): Promise<InstalledDefinitionCallTransportOutcome> {
  if (!abg.isAcquiredAbgEventResourceSelection(resource) ||
      !isInstalledDefinitionCallCandidate(candidate) || !isRecord(candidate.resources)) {
    return refusal("acquisition_mismatch", "native call requires its actual owner-issued event-resource selection");
  }
  const authority = candidate.resources.admissionAuthority;
  const basis = isRecord(authority) ? authority.basis : null;
  const environment = isRecord(basis) ? basis.boundEnvironment : null;
  const boundToSelection = isRecord(environment) && sameStructure(environment.prefix, resource.prefix);
  const hasEventResource = Object.hasOwn(candidate.resources, "eventResource");
  if (hasEventResource ? candidate.resources.eventResource !== resource : !boundToSelection) {
    return refusal("acquisition_mismatch", "native call resources differ from the explicit acquired prefix");
  }
  try { abg.assertAcquiredAbgEventResourceSelectionCurrent(resource); }
  catch (cause) { return refusal("acquisition_mismatch", String(cause)); }
  let detached: AnyDefinitionCall;
  try {
    const { eventResource: _resource, ...resources } = candidate.resources;
    const data = structuredClone({ invocation: candidate.invocation, resources });
    // An eventless bound operation carries the same explicit entry selection in
    // its existing admission basis. Preserve physical prefix correspondence,
    // never a caller-derived environment body or a semantic default.
    if (boundToSelection) {
      const detachedAuthority = data.resources.admissionAuthority as Record<string, unknown>;
      const detachedBasis = detachedAuthority.basis as Record<string, unknown>;
      const detachedEnvironment = detachedBasis.boundEnvironment as Record<string, unknown>;
      detachedEnvironment.prefix = resource.prefix;
    }
    detached = { invocation: data.invocation,
      resources: hasEventResource ? { ...data.resources, eventResource: resource } : data.resources };
    preserveOwnedProductValues(candidate, detached);
  } catch { return refusal("invalid_definition_call", "native call semantic data is not one canonical DefinitionCall"); }
  return invokeInstalledDefinitionCall("acquired", detached);
}

async function invokeInstalledDefinitionCall(
  acquisitionKind: InstalledDefinitionCallTransportResult["acquisitionKind"],
  call: AnyDefinitionCall,
): Promise<InstalledDefinitionCallTransportOutcome> {
  const callable = selectedCallable(call);
  if (typeof callable !== "function") return callable;
  const receipt = await runExactDefinition(
    call,
    callable(call),
  );
  return Object.freeze({
    kind: "installed_definition_call_transport_result" as const,
    schemaVersion: "5.0.0" as const,
    acquisitionKind,
    receipt,
  });
}
