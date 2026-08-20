import { join } from "node:path";
import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  abandonAbgEventResource,
  acquireAbgEventResource,
  closeAbgEventResource,
  validateAbgEventResourceReceipt,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "../abg/definition_event_resource.js";
import {
  admitProductInstall,
  projectAdmittedProductInstall,
  type ArtifactAdmissionBasis,
} from "../abg/environment_admission.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import {
  definitionFault,
  hasExactKeys,
  isDefinitionFault,
  isRecord,
  reference,
  sameCoordinate,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import {
  admitDefinitionExecutionFault,
  postAppendDefinitionFault,
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import type {
  OwnerRefusalOf,
  OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import {
  absolutePathSchema,
  refDigestSchema,
} from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type {
  ProductInstallCandidate,
  ProductInstallRefusal,
  ProductVerificationArtifactResource,
  VerifiedProductArtifact,
} from "./contracts.js";
import {
  isResolvedProductLock,
  productInstallCoordinate,
  type ProductInstall,
  type ResolvedProductLock,
} from "./environment.js";
import {
  PRODUCT_INSTALL_CONTRACTS,
} from "./install_operation_contracts.js";
import {
  ProductInstallPort,
  type ProductInstallPacket,
} from "./install_operation.js";
import {
  isVerifiedProductArtifact,
  productVerificationCoordinates,
} from "./verify_product.js";

type InstallPacket = typeof PRODUCT_INSTALL_CONTRACTS.install;
type InstallRefusalCode = OwnerRefusalOf<InstallPacket>["code"];

/*
 * This is an invariant boundary, not a fourth definition-fault carrier. The
 * ABG owner catches every refusal before append; a throw from that owner can
 * therefore only mean that it appended but failed to return its successor.
 */
class PostInstallCommitInvariantDefect extends TypeError {}

export interface ProductInstallResourceAssertion {
  readonly kind: "product_install_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
  readonly packedArtifact: ProductVerificationArtifactResource;
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly resolvedLock: ResolvedProductLock;
}

export interface ProductInstallResourceReceipt {
  readonly kind: "product_install_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
  readonly packedArtifact: ReferenceDigest<"PackedProductArtifact">;
  readonly resolvedLock: ReferenceDigest<"ResolvedProductLock">;
  readonly targetRoot: string;
  readonly installCandidate: ReferenceDigest<"ProductInstallCandidate"> | null;
  readonly installedProduct: ReferenceDigest<"InstalledProduct"> | null;
  readonly installManifest: ReferenceDigest<"InstallManifest"> | null;
  readonly installerManifest: ReferenceDigest<"InstallerManifest"> | null;
}

const PRODUCT_INSTALL_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("product_install_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceReceipt>(
    validateAbgEventResourceReceipt,
  ),
  packedArtifact: refDigestSchema,
  resolvedLock: refDigestSchema,
  targetRoot: absolutePathSchema,
  installCandidate: v.nullable(refDigestSchema),
  installedProduct: v.nullable(refDigestSchema),
  installManifest: v.nullable(refDigestSchema),
  installerManifest: v.nullable(refDigestSchema),
}) as v.GenericSchema<
  ProductInstallResourceReceipt,
  ProductInstallResourceReceipt
>;

function admittedInstallFault(
  candidate: unknown,
  expectedDefinitionKey: InstallPacket["definitionKey"],
): DefinitionExecutionFault<
  InstallPacket["definitionKey"],
  ProductInstallResourceReceipt
> | null {
  return admitDefinitionExecutionFault(
    candidate,
    expectedDefinitionKey,
    (receiptCandidate) =>
      v.is(PRODUCT_INSTALL_RESOURCE_RECEIPT_SCHEMA, receiptCandidate)
        ? { resourceReceipt: receiptCandidate }
        : null,
  );
}

function installFault(
  call: DefinitionCall<InstallPacket, ProductInstallResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<
  InstallPacket["definitionKey"],
  ProductInstallResourceReceipt
> {
  return definitionFault(call.invocation.definitionKey, stage, code, message);
}

function resolvedLockCoordinate(
  lock: ResolvedProductLock,
): ReferenceDigest<"ResolvedProductLock"> {
  return reference(lock.lockId, lock.lockDigest);
}

function candidateCoordinate(
  candidate: ProductInstallCandidate,
): ReferenceDigest<"ProductInstallCandidate"> {
  return reference(
    candidate.installId,
    sha256Canonical(candidate as unknown as JsonValue),
  );
}

function installManifestCoordinate(
  install: ProductInstall,
): ReferenceDigest<"InstallManifest"> {
  return reference(
    join(install.installedRoot, "product-toolchain-manifest.json"),
    install.manifestDigest,
  );
}

function validateResources(
  call: DefinitionCall<InstallPacket, ProductInstallResourceAssertion>,
): DefinitionExecutionFault<
  InstallPacket["definitionKey"],
  ProductInstallResourceReceipt
> | null {
  const resources = call.resources;
  if (
    !isRecord(resources) ||
    !hasExactKeys(resources, [
      "eventResource",
      "kind",
      "packedArtifact",
      "resolvedLock",
      "schemaVersion",
      "verifiedArtifact",
    ]) ||
    resources.kind !== "product_install_resource_assertion" ||
    resources.schemaVersion !== "5.0.0" ||
    !sameJson(resources, resources) ||
    !isVerifiedProductArtifact(resources.verifiedArtifact) ||
    !isResolvedProductLock(resources.resolvedLock)
  ) {
    return installFault(
      call,
      "resource_admission",
      "invalid_resource_assertion",
      "Product installation requires exact packed, verified, lock, target, and ABG-prefix resources",
    );
  }

  const request = call.invocation.request;
  const artifact = resources.verifiedArtifact;
  const packed = resources.packedArtifact;
  const coordinates = productVerificationCoordinates(artifact);
  const authorityLock = call.invocation.invocationAuthority.slots.dependency_lock;
  if (
    !isRecord(packed) ||
    packed.kind !== "product_verification_artifact_resource" ||
    packed.schemaVersion !== "5.0.0" ||
    !sameCoordinate(request.verifiedArtifact, coordinates.verifiedArtifact) ||
    !sameCoordinate(request.descriptor, coordinates.descriptor) ||
    request.contributionManifest.ref !== artifact.contributionManifestRef ||
    request.contributionManifest.digest !== artifact.contributionManifestDigest ||
    !sameCoordinate(request.resolvedLock, resolvedLockCoordinate(resources.resolvedLock)) ||
    authorityLock === null ||
    !sameCoordinate(authorityLock, request.resolvedLock) ||
    packed.artifact.ref !== artifact.artifactRef ||
    packed.artifact.digest !== artifact.artifactDigest ||
    packed.productContent.digest !== artifact.productContentDigest ||
    !sameCoordinate(packed.descriptor, request.descriptor) ||
    !sameCoordinate(packed.contributionManifest, request.contributionManifest) ||
    packed.manifestDigest !== artifact.manifestDigest ||
    packed.productId !== artifact.productId ||
    packed.packageName !== artifact.packageName ||
    packed.packageVersion !== artifact.packageVersion
  ) {
    return installFault(
      call,
      "resource_admission",
      "resource_relation_mismatch",
      "Product installation resources differ from the admitted request or invocation authority",
    );
  }
  return null;
}

const REFUSAL_PROJECTION = {
  target_not_empty: ["target_failure", "/targetRoot"],
  artifact_mismatch: ["verification_failure", "/verifiedArtifact"],
  dependency_lock_mismatch: ["lock_mismatch", "/resolvedLock"],
  install_failed: ["filesystem_failure", "/targetRoot"],
  installed_identity_mismatch: ["identity_mismatch", "/verifiedArtifact"],
  installed_manifest_mismatch: ["content_mismatch", "/verifiedArtifact"],
  unexpected_source_surface: ["contract_mismatch", "/verifiedArtifact"],
} as const satisfies Readonly<Record<
  ProductInstallRefusal["code"],
  readonly [InstallRefusalCode, string]
>>;

function refusalOutput(
  code: InstallRefusalCode,
  issuePath: string,
  evidenceRefs: readonly string[] = [],
): OwnerSemanticOutput<InstallPacket> {
  return validatedOwnerOutput(PRODUCT_INSTALL_CONTRACTS.install, {
    outcomeKind: "refusal",
    value: { code, issuePaths: [issuePath], evidenceRefs },
  } as OwnerSemanticOutput<InstallPacket>, "Product installation");
}

function nativeRefusalOutput(
  refusal: ProductInstallRefusal,
): OwnerSemanticOutput<InstallPacket> {
  const [code, issuePath] = REFUSAL_PROJECTION[refusal.code];
  return refusalOutput(code, issuePath);
}

function receipt(
  call: DefinitionCall<InstallPacket, ProductInstallResourceAssertion>,
  eventResource: AbgEventResourceReceipt,
  candidate: ProductInstallCandidate | null,
  install: ProductInstall | null,
  installerManifest: ReferenceDigest<"InstallerManifest"> | null,
): ProductInstallResourceReceipt {
  return deepFreeze({
    kind: "product_install_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    eventResource,
    packedArtifact: { ...call.resources.packedArtifact.artifact },
    resolvedLock: resolvedLockCoordinate(call.resources.resolvedLock),
    targetRoot: call.invocation.request.targetRoot,
    installCandidate: candidate === null ? null : candidateCoordinate(candidate),
    installedProduct: install === null ? null : productInstallCoordinate(install),
    installManifest: install === null ? null : installManifestCoordinate(install),
    installerManifest,
  });
}

function postInstallCommitFault(
  call: DefinitionCall<InstallPacket, ProductInstallResourceAssertion>,
  resource: Parameters<typeof closeAbgEventResource>[0],
  finalPrefix: DurablePrefixCoordinate,
  candidate: ProductInstallCandidate,
  install: ProductInstall | null,
  installerManifest: ReferenceDigest<"InstallerManifest"> | null,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<
  InstallPacket["definitionKey"],
  ProductInstallResourceReceipt
> {
  let eventResource: AbgEventResourceReceipt;
  try {
    eventResource = closeAbgEventResource(resource, finalPrefix);
  } catch (cause) {
    throw new PostInstallCommitInvariantDefect(
      `post-install commit could not issue its exact ABG receipt: ${String(cause)}`,
    );
  }
  return postAppendDefinitionFault(
    call.invocation.definitionKey,
    stage,
    code,
    message,
    receipt(call, eventResource, candidate, install, installerManifest),
  );
}

const install: ExactDefinitionCallable<
  InstallPacket,
  ProductInstallResourceAssertion,
  ProductInstallResourceReceipt
> = (call) => {
  const resourceFault = validateResources(call);
  if (resourceFault !== null) return Effect.fail(resourceFault);

  return Effect.tryPromise({
    try: async (): Promise<DefinitionReturn<
      InstallPacket,
      ProductInstallResourceReceipt
    >> => {
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      if (acquired.kind !== "acquired_abg_event_resource") {
        throw installFault(
          call,
          "resource_acquisition",
          acquired.code,
          acquired.message,
        );
      }
      const resource = acquired.resource;
      let committedCandidate: ProductInstallCandidate | null = null;
      let committedInstall: ProductInstall | null = null;
      let committedInstallerManifest:
        ReferenceDigest<"InstallerManifest"> | null = null;
      let latestPrefix = resource.entryPrefix;
      let issuedEventResource: AbgEventResourceReceipt | null = null;
      try {
        const nativePacket: ProductInstallPacket = {
          kind: "product_install_packet",
          schemaVersion: "5.0.0",
          memberKey: "install",
          request: {
            artifactPath: call.resources.packedArtifact.artifactPath,
            targetRoot: call.invocation.request.targetRoot,
            verifiedArtifact: call.resources.verifiedArtifact,
            resolvedLock: call.resources.resolvedLock,
          },
        };
        const candidate = await ProductInstallPort.install(nativePacket);
        if (candidate.kind === "product_install_refusal") {
          return deepFreeze({
            ownerOutput: nativeRefusalOutput(candidate),
            resources: receipt(
              call,
              closeAbgEventResource(resource, resource.entryPrefix),
              null,
              null,
              null,
            ),
          });
        }
        committedCandidate = candidate;

        const invocationCoordinate = constructExactOperationInvocationCoordinate(
          {
            operationId: "abg.operation.product.install",
            memberKey: "install",
            definitionDigest: call.invocation.definitionDigest,
          },
          call.invocation.invocationRef,
          call.invocation.requestDigest,
        );
        const basis: ArtifactAdmissionBasis = deepFreeze({
          ...invocationCoordinate,
          operationId: "abg.operation.product.install" as const,
          memberKey: "install" as const,
          authorityScopeRef: candidate.installId,
          authorityScopeDigest: candidate.productContentDigest,
          correlationId: call.invocation.correlationRef,
          eventTime: call.invocation.eventTime,
          causationEventRefs: [],
          predecessorPrefix: resource.entryPrefix,
        });
        let admitted: ReturnType<typeof admitProductInstall>;
        try {
          admitted = admitProductInstall(
            resource.store,
            candidate,
            basis,
            call.resources.resolvedLock,
          );
        } catch (cause) {
          throw new PostInstallCommitInvariantDefect(
            `Product install admission appended without returning its successor: ${String(cause)}`,
          );
        }
        if (admitted.kind === "artifact_owner_coordinate_refusal") {
          throw postInstallCommitFault(
            call,
            resource,
            resource.entryPrefix,
            candidate,
            null,
            null,
            "abg_admission",
            "product_install_coordinate_refusal",
            JSON.stringify(admitted.refusal),
          );
        }
        if (admitted.kind === "artifact_owner_refusal") {
          const code = admitted.refusal.code === "scope_mismatch"
            ? "identity_mismatch"
            : admitted.refusal.code === "artifact_truth_conflict" ||
                admitted.refusal.code === "duplicate_invocation"
            ? "target_failure"
            : null;
          if (code === null) {
            throw postInstallCommitFault(
              call,
              resource,
              admitted.successorPrefix,
              candidate,
              null,
              null,
              "abg_admission",
              "product_install_admission_relation_failure",
              admitted.refusal.message,
            );
          }
          issuedEventResource = closeAbgEventResource(
            resource,
            admitted.successorPrefix,
          );
          return deepFreeze({
            ownerOutput: refusalOutput(code, "/targetRoot"),
            resources: receipt(
              call,
              issuedEventResource,
              candidate,
              null,
              null,
            ),
          });
        }
        latestPrefix = admitted.successorPrefix;
        committedInstall = admitted.value;

        let projected: ProductInstall | null;
        try {
          projected = projectAdmittedProductInstall(
            admitted.artifactTruth,
            candidate,
            call.invocation.invocationRef,
          );
        } catch (cause) {
          throw postInstallCommitFault(
            call,
            resource,
            admitted.successorPrefix,
            candidate,
            admitted.value,
            null,
            "abg_projection",
            "product_install_projection_failure",
            String(cause),
          );
        }
        if (projected === null || !sameJson(projected, admitted.value)) {
          throw postInstallCommitFault(
            call,
            resource,
            admitted.successorPrefix,
            candidate,
            admitted.value,
            null,
            "abg_projection",
            "product_install_projection_mismatch",
            "admitted ProductInstall differs from exact-prefix ABG projection truth",
          );
        }
        const installerManifest = reference<"InstallerManifest">(
          admitted.artifactTruth.projectionRef,
          admitted.artifactTruth.projectionDigest,
        );
        committedInstallerManifest = installerManifest;
        let ownerOutput: OwnerSemanticOutput<InstallPacket>;
        try {
          ownerOutput = validatedOwnerOutput(
            PRODUCT_INSTALL_CONTRACTS.install,
            {
              outcomeKind: "result",
              value: {
                disposition: admitted.disposition === "idempotent"
                  ? "idempotent"
                  : "materialized",
                installedProduct: productInstallCoordinate(projected),
                installManifest: installManifestCoordinate(projected),
                installerManifest,
                resolvedLock: resolvedLockCoordinate(call.resources.resolvedLock),
                provenance: [installerManifest],
              },
            } as OwnerSemanticOutput<InstallPacket>,
            "Product installation",
          );
        } catch (cause) {
          throw postInstallCommitFault(
            call,
            resource,
            admitted.successorPrefix,
            candidate,
            projected,
            installerManifest,
            "owner_projection",
            "invalid_product_install_owner_output",
            String(cause),
          );
        }
        let eventResource: AbgEventResourceReceipt;
        try {
          eventResource = closeAbgEventResource(
            resource,
            admitted.successorPrefix,
          );
          issuedEventResource = eventResource;
        } catch (cause) {
          throw new PostInstallCommitInvariantDefect(
            `post-install append could not issue its exact ABG receipt: ${String(cause)}`,
          );
        }
        return deepFreeze({
          ownerOutput,
          resources: receipt(
            call,
            eventResource,
            candidate,
            projected,
            installerManifest,
          ),
        });
      } catch (cause) {
        const admittedFault = admittedInstallFault(
          cause,
          call.invocation.definitionKey,
        );
        if (
          admittedFault !== null &&
          admittedFault.faultBoundary !== "pre_acquisition_or_pre_append"
        ) {
          throw admittedFault;
        }
        if (cause instanceof PostInstallCommitInvariantDefect) {
          abandonAbgEventResource(resource);
          throw cause;
        }
        if (isDefinitionFault(cause) && admittedFault === null) {
          abandonAbgEventResource(resource);
          throw new PostInstallCommitInvariantDefect(
            "Product install owner emitted a malformed definition fault",
          );
        }
        if (committedCandidate !== null) {
          if (issuedEventResource !== null) {
            throw postAppendDefinitionFault(
              call.invocation.definitionKey,
              "owner_execution",
              "product_install_execution_failure",
              String(cause),
              receipt(
                call,
                issuedEventResource,
                committedCandidate,
                committedInstall,
                committedInstallerManifest,
              ),
            );
          }
          throw postInstallCommitFault(
            call,
            resource,
            latestPrefix,
            committedCandidate,
            committedInstall,
            committedInstallerManifest,
            "owner_execution",
            "product_install_execution_failure",
            String(cause),
          );
        }
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => {
      if (cause instanceof PostInstallCommitInvariantDefect) throw cause;
      const admittedFault = admittedInstallFault(
        cause,
        call.invocation.definitionKey,
      );
      if (admittedFault !== null) return admittedFault;
      if (isDefinitionFault(cause)) {
        throw new PostInstallCommitInvariantDefect(
          "Product install owner emitted a malformed definition fault",
        );
      }
      return installFault(
        call,
        "owner_execution",
        "product_install_execution_failure",
        String(cause),
      );
    },
  });
};

export const PRODUCT_INSTALL_DEFINITION_BINDINGS = Object.freeze({ install });
