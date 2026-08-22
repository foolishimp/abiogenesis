import { join } from "node:path";
import * as Effect from "effect/Effect";

import {
  abandonAbgEventResource,
  acquireAbgEventResource,
  closeAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "../abg/definition_event_resource.js";
import {
  admitProductInstall,
  projectAdmittedProductInstall,
  type ExactPrefixWorkspaceEnvironment,
  type ArtifactAdmissionBasis,
} from "../abg/environment_admission.js";
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
import type {
  DefinitionCall,
  DefinitionExecutionFault,
  DefinitionReturn,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import type {
  OwnerRefusalOf,
  OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import type {
  ReferenceDigest,
  SuccessfulPackedVerificationReference,
} from "../shared/public_invocation.js";
import type { IndexedPublicOutcome } from "../public/indexed_outcome.js";
import type {
  ProductInstallCandidate,
  ProductInstallRefusal,
  ProductVerificationArtifactResource,
  ProductVerificationResources,
} from "./contracts.js";
import {
  isResolvedProductLock,
  productInstallCoordinate,
  verifiedArtifactMatchesResolvedLock,
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
  admitSuccessfulPackedVerificationEvidence,
  type ProductVerificationEvidence,
  type SuccessfulPackedVerificationAdmission,
} from "./verification_evidence.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "./verification_operation_contracts.js";
import { admitPrebindingDevelopmentProductDefinitionCall } from "./invocation.js";

type InstallPacket = typeof PRODUCT_INSTALL_CONTRACTS.install;
type InstallRefusalCode = OwnerRefusalOf<InstallPacket>["code"];
type VerifyPacket = typeof PRODUCT_VERIFICATION_CONTRACTS.verify;
type VerifyInvocation = DefinitionCall<
  VerifyPacket,
  ProductVerificationResources
>["invocation"];
type VerifyOutcome = IndexedPublicOutcome<VerifyPacket["definitionKey"]>;

export interface ProductInstallResourceAssertion {
  readonly kind: "product_install_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
  readonly packedArtifact: ProductVerificationArtifactResource;
  readonly verification: SuccessfulPackedVerificationReference;
  readonly verificationInvocation: VerifyInvocation;
  readonly verificationOwnerOutput: OwnerSemanticOutput<VerifyPacket>;
  readonly verificationOutcome: VerifyOutcome;
  readonly verificationEvidence: ProductVerificationEvidence;
  readonly resolvedLock: ResolvedProductLock;
  readonly predecessorEnvironment: ExactPrefixWorkspaceEnvironment;
  readonly targetRoot: string;
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

function installFault(
  call: DefinitionCall<InstallPacket, ProductInstallResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<InstallPacket["definitionKey"]> {
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

function admittedPackedVerification(
  resources: ProductInstallResourceAssertion,
): SuccessfulPackedVerificationAdmission | null {
  const admitted = admitSuccessfulPackedVerificationEvidence(
    resources.verificationInvocation,
    resources.verificationOwnerOutput,
    resources.verificationOutcome,
    resources.verificationEvidence,
  );
  return admitted !== null && sameJson(resources.verification, admitted.reference)
    ? admitted
    : null;
}

function validateResources(
  call: DefinitionCall<InstallPacket, ProductInstallResourceAssertion>,
): DefinitionExecutionFault<InstallPacket["definitionKey"]> | null {
  const resources = call.resources;
  if (
    !isRecord(resources) ||
    !hasExactKeys(resources, [
      "eventResource",
      "kind",
      "packedArtifact",
      "predecessorEnvironment",
      "resolvedLock",
      "schemaVersion",
      "verification",
      "verificationEvidence",
      "verificationInvocation",
      "verificationOutcome",
      "verificationOwnerOutput",
      "targetRoot",
    ]) ||
    resources.kind !== "product_install_resource_assertion" ||
    resources.schemaVersion !== "5.0.0" ||
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
  if (admitPrebindingDevelopmentProductDefinitionCall(
    call,
    PRODUCT_INSTALL_CONTRACTS.install,
    resources.predecessorEnvironment,
  ) === null) {
    return installFault(
      call,
      "authority_admission",
      "call_authority_mismatch",
      "Product installation requires the exact predecessor-authorized DefinitionCall",
    );
  }
  const admission = admittedPackedVerification(resources);
  if (admission === null) {
    return installFault(
      call,
      "resource_admission",
      "verification_evidence_mismatch",
      "Product installation requires the exact admitted packed verification completion",
    );
  }
  const artifact = admission.verifiedArtifact;
  const packed = resources.packedArtifact;
  const coordinates = admission.verification.coordinates;
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
    !verifiedArtifactMatchesResolvedLock(artifact, resources.resolvedLock) ||
    packed.artifact.ref !== artifact.artifactRef ||
    packed.artifact.digest !== artifact.artifactDigest ||
    packed.productContent.digest !== artifact.productContentDigest ||
    !sameCoordinate(packed.descriptor, request.descriptor) ||
    !sameCoordinate(packed.contributionManifest, request.contributionManifest) ||
    packed.manifestDigest !== artifact.manifestDigest ||
    packed.productId !== artifact.productId ||
    packed.packageName !== artifact.packageName ||
    packed.packageVersion !== artifact.packageVersion ||
    resources.targetRoot !== request.targetRoot
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
    targetRoot: call.resources.targetRoot,
    installCandidate: candidate === null ? null : candidateCoordinate(candidate),
    installedProduct: install === null ? null : productInstallCoordinate(install),
    installManifest: install === null ? null : installManifestCoordinate(install),
    installerManifest,
  });
}

const install: ExactDefinitionCallable<
  InstallPacket,
  ProductInstallResourceAssertion,
  ProductInstallResourceReceipt
> = (call) => {
  const resourceFault = validateResources(call);
  if (resourceFault !== null) return Effect.fail(resourceFault);
  const verification = admittedPackedVerification(call.resources);
  if (verification === null) {
    return Effect.fail(installFault(
      call,
      "resource_admission",
      "verification_evidence_mismatch",
      "Product installation requires the exact admitted packed verification completion",
    ));
  }

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
      try {
        const nativePacket: ProductInstallPacket = {
          kind: "product_install_packet",
          schemaVersion: "5.0.0",
          memberKey: "install",
          request: {
            artifactPath: call.resources.packedArtifact.artifactPath,
            targetRoot: call.resources.targetRoot,
            verifiedArtifact: verification.verifiedArtifact,
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
        const admitted = admitProductInstall(
          resource.store,
          candidate,
          basis,
          call.resources.resolvedLock,
        );
        if (admitted.kind === "artifact_owner_coordinate_refusal") {
          throw installFault(
            call,
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
            throw installFault(
              call,
              "abg_admission",
              "product_install_admission_relation_failure",
              admitted.refusal.message,
            );
          }
          return deepFreeze({
            ownerOutput: refusalOutput(code, "/targetRoot"),
            resources: receipt(
              call,
              closeAbgEventResource(resource, admitted.successorPrefix),
              candidate,
              null,
              null,
            ),
          });
        }

        const projected = projectAdmittedProductInstall(
          admitted.artifactTruth,
          candidate,
          call.invocation.invocationRef,
        );
        if (projected === null || !sameJson(projected, admitted.value)) {
          throw installFault(
            call,
            "abg_projection",
            "product_install_projection_mismatch",
            "admitted ProductInstall differs from exact-prefix ABG projection truth",
          );
        }
        const installerManifest = reference<"InstallerManifest">(
          admitted.artifactTruth.projectionRef,
          admitted.artifactTruth.projectionDigest,
        );
        const ownerOutput = validatedOwnerOutput(
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
        return deepFreeze({
          ownerOutput,
          resources: receipt(
            call,
            closeAbgEventResource(resource, admitted.successorPrefix),
            candidate,
            projected,
            installerManifest,
          ),
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<InstallPacket["definitionKey"]>
      : installFault(
          call,
          "owner_execution",
          "product_install_execution_failure",
          String(cause),
        ),
  });
};

export const PRODUCT_INSTALL_DEFINITION_BINDINGS = Object.freeze({ install });
