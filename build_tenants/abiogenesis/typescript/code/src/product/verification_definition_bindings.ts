import { join } from "node:path";
import * as Effect from "effect/Effect";
import * as v from "valibot";

import type { ExactPrefixWorkspaceEnvironment } from
  "../abg/environment_admission.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type {
  DefinitionCall, DefinitionExecutionFault, DefinitionReturn,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  absolutePathSchema, admitRuntimeContract, digestSchema, nonblankSchema,
  refDigestSchema, type OwnerRefusalOf, type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type {
  InstalledProductVerificationResources, PackedProductVerificationResources,
  ProductVerificationArtifactResource, ProductVerificationOperationResult,
  ProductVerificationRefusalCode, ProductVerificationResourceDisposition,
  ProductVerificationResourceReceipt,
} from "./contracts.js";
import {
  isProductInstall, productInstallCoordinate, verifiedArtifactMatchesResolvedLock,
} from "./environment.js";
import {
  ProductVerificationPort, type ProductVerificationPacket,
} from "./verification_operation.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "./verification_operation_contracts.js";
import { constructProductVerificationEvidence } from "./verification_evidence.js";
import { admitPrebindingDevelopmentProductDefinitionCall } from "./invocation.js";

type VerifyPacket = typeof PRODUCT_VERIFICATION_CONTRACTS.verify;
type PublicVerifyRefusalCode = OwnerRefusalOf<VerifyPacket>["code"];
const artifactResourceSchema = v.strictObject({
  kind: v.literal("product_verification_artifact_resource"),
  schemaVersion: v.literal("5.0.0"),
  artifactPath: absolutePathSchema,
  artifact: refDigestSchema,
  productContent: refDigestSchema,
  descriptor: refDigestSchema,
  contributionManifest: refDigestSchema,
  manifestDigest: digestSchema,
  productId: nonblankSchema,
  packageName: nonblankSchema,
  packageVersion: nonblankSchema,
});

const installManifestResourceSchema = v.strictObject({
  kind: v.literal("product_verification_install_manifest_resource"),
  schemaVersion: v.literal("5.0.0"),
  manifestPath: absolutePathSchema,
  manifest: refDigestSchema,
});
const packedResourcesSchema = v.strictObject({
  kind: v.literal("product_verification_resources"),
  schemaVersion: v.literal("5.0.0"),
  targetKind: v.literal("packed_artifact"),
  packedArtifact: artifactResourceSchema,
  predecessorEnvironment: v.unknown(),
});
const installedResourcesSchema = v.strictObject({
  kind: v.literal("product_verification_resources"),
  schemaVersion: v.literal("5.0.0"),
  targetKind: v.literal("installed_artifact"),
  installedArtifact: artifactResourceSchema,
  resolvedLock: v.unknown(),
  installedProduct: v.unknown(),
  installManifest: installManifestResourceSchema,
  predecessorEnvironment: v.unknown(),
});

export type ProductVerificationDefinitionResources =
  | (PackedProductVerificationResources & Readonly<{
      predecessorEnvironment: ExactPrefixWorkspaceEnvironment;
    }>)
  | (InstalledProductVerificationResources & Readonly<{
      predecessorEnvironment: ExactPrefixWorkspaceEnvironment;
    }>);

type AdmittedResources = Readonly<{
  resources: ProductVerificationDefinitionResources;
  installedProductCoordinate: ReferenceDigest<"InstalledProduct"> | null;
}>;

function fault(
  call: DefinitionCall<VerifyPacket, ProductVerificationDefinitionResources>,
  stage: string, code: string, message: string,
): DefinitionExecutionFault<VerifyPacket["definitionKey"]> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    stage,
    code,
    message,
    evidence: {},
  });
}

function sameCoordinate(left: ReferenceDigest, right: ReferenceDigest): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

function artifactMatchesRequest(
  artifact: ProductVerificationArtifactResource,
  call: DefinitionCall<VerifyPacket, ProductVerificationDefinitionResources>,
): boolean {
  const request = call.invocation.request;
  return sameCoordinate(artifact.artifact, request.artifact) &&
    sameCoordinate(artifact.productContent, request.productContent) &&
    sameCoordinate(artifact.descriptor, request.descriptor) &&
    sameCoordinate(artifact.contributionManifest, request.contributionManifest);
}

function admitResources(
  call: DefinitionCall<VerifyPacket, ProductVerificationDefinitionResources>,
): DefinitionExecutionFault<VerifyPacket["definitionKey"]> | AdmittedResources {
  const request = call.invocation.request;
  const schema = request.targetKind === "packed_artifact"
    ? packedResourcesSchema
    : installedResourcesSchema;
  if (admitRuntimeContract(schema, call.resources).disposition !== "admitted") {
    return fault(call, "resource_admission", "invalid_resource_assertion", "verification requires the exact selected E22 resource carrier");
  }
  const resources = call.resources as ProductVerificationDefinitionResources;
  if (admitPrebindingDevelopmentProductDefinitionCall(
    call,
    PRODUCT_VERIFICATION_CONTRACTS.verify,
    resources.predecessorEnvironment,
  ) === null) {
    return fault(call, "authority_admission", "call_authority_mismatch", "verification requires the exact predecessor-authorized DefinitionCall");
  }

  if (request.targetKind === "packed_artifact") {
    const packed = resources as ProductVerificationDefinitionResources &
      PackedProductVerificationResources;
    return artifactMatchesRequest(packed.packedArtifact, call)
      ? { resources: packed, installedProductCoordinate: null }
      : fault(call, "resource_admission", "resource_relation_mismatch", "the E22 artifact preimage differs from the admitted request");
  }

  const installed = resources as ProductVerificationDefinitionResources &
    InstalledProductVerificationResources;
  if (!isProductInstall(installed.installedProduct, installed.resolvedLock)) {
    return fault(call, "resource_admission", "invalid_resource_assertion", "installed verification requires admitted Product lock and install carriers");
  }
  const installedProductCoordinate = productInstallCoordinate(installed.installedProduct);
  const artifact = installed.installedArtifact;
  const install = installed.installedProduct;
  const manifest = installed.installManifest;
  const authorityLock = call.invocation.invocationAuthority.slots.dependency_lock;
  const compatibilityInputs = install.compatibilityRefs.map((compatibilityRef) => ({
    compatibilityRef,
    subjectRef: artifact.productContent.ref,
  }));
  if (
    !artifactMatchesRequest(artifact, call) ||
    authorityLock === null ||
    !sameCoordinate(authorityLock, request.resolvedLock) ||
    request.resolvedLock.ref !== installed.resolvedLock.lockId ||
    request.resolvedLock.digest !== installed.resolvedLock.lockDigest ||
    !sameCoordinate(request.installedProduct, installedProductCoordinate) ||
    !sameCoordinate(request.installManifest, manifest.manifest) ||
    manifest.manifest.digest !== install.manifestDigest ||
    manifest.manifestPath !== join(install.installedRoot, "product-toolchain-manifest.json") ||
    artifact.artifact.digest !== install.artifactDigest ||
    artifact.productContent.digest !== install.productContentDigest ||
    artifact.descriptor.ref !== install.descriptorRef ||
    artifact.contributionManifest.ref !== install.contributionManifestRef ||
    artifact.contributionManifest.digest !== install.contributionManifestDigest ||
    artifact.manifestDigest !== install.manifestDigest ||
    artifact.productId !== install.productId ||
    artifact.packageName !== install.packageName ||
    artifact.packageVersion !== install.packageVersion ||
    canonicalJson(request.declaredDependencies as unknown as JsonValue) !==
      canonicalJson(install.declaredDependencies as unknown as JsonValue) ||
    canonicalJson(request.compatibilityInputs as unknown as JsonValue) !==
      canonicalJson(compatibilityInputs as unknown as JsonValue)
  ) {
    return fault(call, "resource_admission", "resource_relation_mismatch", "the installed E22 request and supplied preimages disagree");
  }
  return { resources: installed, installedProductCoordinate };
}

function nativePacket(resources: ProductVerificationDefinitionResources): ProductVerificationPacket {
  const artifact = resources.targetKind === "packed_artifact"
    ? resources.packedArtifact
    : resources.installedArtifact;
  const packet = {
    kind: "product_verification_packet",
    schemaVersion: "5.0.0",
    memberKey: "verify",
    request: {
      artifactPath: artifact.artifactPath,
      artifactRef: artifact.artifact.ref,
      expectedArtifactDigest: artifact.artifact.digest,
      expectedProductContentDigest: artifact.productContent.digest,
      expectedManifestDigest: artifact.manifestDigest,
      expectedProductId: artifact.productId,
      expectedPackageName: artifact.packageName,
      expectedPackageVersion: artifact.packageVersion,
    },
  } as const;
  return resources.targetKind === "packed_artifact"
    ? { ...packet, targetKind: "packed_artifact" }
    : {
        ...packet,
        targetKind: "installed_artifact",
        installedProduct: resources.installedProduct,
      };
}

const OWNER_REFUSAL_PROJECTION = {
  artifact_unreadable: ["artifact_mismatch", "/artifact"],
  artifact_digest_mismatch: ["artifact_mismatch", "/artifact"],
  payload_inventory_mismatch: ["content_mismatch", "/productContent"],
  payload_unreadable: ["content_mismatch", "/productContent"],
  product_content_mismatch: ["content_mismatch", "/productContent"],
  identity_mismatch: ["identity_mismatch", "/artifact"],
  manifest_unreadable: ["identity_mismatch", "/artifact"],
  manifest_malformed: ["identity_mismatch", "/artifact"],
  manifest_digest_mismatch: ["identity_mismatch", "/artifact"],
  contribution_mismatch: ["contribution_mismatch", "/contributionManifest"],
  unsafe_locator: ["unsupported_contract", "/artifact"],
  catalog_mismatch: ["unsupported_contract", "/artifact"],
  contract_asset_mismatch: ["unsupported_contract", "/artifact"],
} as const satisfies Readonly<Record<ProductVerificationRefusalCode,
  readonly [PublicVerifyRefusalCode, string]>>;

function refusalOutput(
  result: Extract<ProductVerificationOperationResult, { readonly kind: "product_verification_refusal" }>,
): OwnerSemanticOutput<VerifyPacket> {
  const [code, issuePath] = OWNER_REFUSAL_PROJECTION[result.code];
  return {
    outcomeKind: "refusal",
    value: { code, issuePaths: [issuePath], evidenceRefs: [result.artifactRef] },
  };
}

function mismatchOutput(
  code: PublicVerifyRefusalCode, issuePath: string, evidenceRef: string,
): OwnerSemanticOutput<VerifyPacket> {
  return {
    outcomeKind: "refusal",
    value: { code, issuePaths: [issuePath], evidenceRefs: [evidenceRef] },
  };
}

function projectOwnerOutput(
  call: DefinitionCall<VerifyPacket, ProductVerificationDefinitionResources>,
  admitted: AdmittedResources, result: ProductVerificationOperationResult,
): OwnerSemanticOutput<VerifyPacket> {
  if (result.kind === "product_verification_installed_state_refusal") {
    return mismatchOutput(
      result.code,
      "/installedProduct",
      result.installedProductRef,
    );
  }
  if (result.kind === "product_verification_refusal") return refusalOutput(result);

  const resource = admitted.resources.targetKind === "packed_artifact"
    ? admitted.resources.packedArtifact
    : admitted.resources.installedArtifact;
  const artifact = result.verifiedArtifact;
  const coordinates = result.coordinates;
  const request = call.invocation.request;
  if (
    artifact.artifactRef !== request.artifact.ref ||
    artifact.artifactDigest !== request.artifact.digest
  ) return mismatchOutput("artifact_mismatch", "/artifact", coordinates.verifiedArtifact.ref);
  if (artifact.productContentDigest !== request.productContent.digest) {
    return mismatchOutput("content_mismatch", "/productContent", coordinates.verifiedArtifact.ref);
  }
  if (
    artifact.productId !== resource.productId ||
    artifact.packageName !== resource.packageName ||
    artifact.packageVersion !== resource.packageVersion ||
    artifact.manifestDigest !== resource.manifestDigest
  ) return mismatchOutput("identity_mismatch", "/artifact", coordinates.verifiedArtifact.ref);
  if (!sameCoordinate(coordinates.descriptor, request.descriptor)) {
    return mismatchOutput("descriptor_mismatch", "/descriptor", coordinates.verifiedArtifact.ref);
  }
  if (
    artifact.contributionManifestRef !== request.contributionManifest.ref ||
    artifact.contributionManifestDigest !== request.contributionManifest.digest
  ) return mismatchOutput("contribution_mismatch", "/contributionManifest", coordinates.verifiedArtifact.ref);
  const compatibilityInputs = artifact.compatibilityRefs.map((compatibilityRef) => ({
    compatibilityRef,
    subjectRef: request.productContent.ref,
  }));
  if (
    canonicalJson(artifact.declaredDependencies as unknown as JsonValue) !==
      canonicalJson(request.declaredDependencies as unknown as JsonValue) ||
    canonicalJson(compatibilityInputs as unknown as JsonValue) !==
      canonicalJson(request.compatibilityInputs as unknown as JsonValue)
  ) return mismatchOutput("invalid_declared_dependency", "/declaredDependencies", coordinates.verifiedArtifact.ref);

  if (admitted.resources.targetKind === "packed_artifact") {
    return {
      outcomeKind: "result",
      value: {
        targetKind: "packed_artifact",
        disposition: "locally_verified",
        verifiedArtifact: coordinates.verifiedArtifact,
        localNativeEvidence: coordinates.localNativeEvidence,
        pendingExternalSelectors: result.pendingExternalSelectors,
        definitionContractCoordinates: result.definitionContractCoordinates,
        residuals: [],
        provenance: [coordinates.provenance],
      },
    } as unknown as OwnerSemanticOutput<VerifyPacket>;
  }
  if (!verifiedArtifactMatchesResolvedLock(artifact, admitted.resources.resolvedLock)) {
    return mismatchOutput("lock_mismatch", "/resolvedLock", coordinates.verifiedArtifact.ref);
  }
  return {
    outcomeKind: "result",
    value: {
      targetKind: "installed_artifact",
      disposition: "installed_verified",
      verifiedArtifact: coordinates.verifiedArtifact,
      resolvedLock: {
        ref: admitted.resources.resolvedLock.lockId,
        digest: admitted.resources.resolvedLock.lockDigest,
      },
      installedProduct: admitted.installedProductCoordinate!,
      definitionContractCoordinates: result.definitionContractCoordinates,
      residuals: [],
      provenance: [coordinates.provenance],
    },
  } as OwnerSemanticOutput<VerifyPacket>;
}

function validatedOutput(output: OwnerSemanticOutput<VerifyPacket>): OwnerSemanticOutput<VerifyPacket> {
  const schema = output.outcomeKind === "result"
    ? PRODUCT_VERIFICATION_CONTRACTS.verify.resultSchema
    : PRODUCT_VERIFICATION_CONTRACTS.verify.refusalSchema;
  if (admitRuntimeContract(schema, output.value).disposition !== "admitted") {
    throw new TypeError("Product verification output differs from its exact contract");
  }
  return output;
}

function resourceDisposition(admitted: AdmittedResources): ProductVerificationResourceDisposition {
  if (admitted.resources.targetKind === "packed_artifact") {
    return deepFreeze({
      kind: "product_verification_resource_disposition" as const,
      schemaVersion: "5.0.0" as const,
      targetKind: "packed_artifact" as const,
      disposition: "read_only_unchanged" as const,
      packedArtifact: { ...admitted.resources.packedArtifact.artifact },
    });
  }
  return deepFreeze({
    kind: "product_verification_resource_disposition" as const,
    schemaVersion: "5.0.0" as const,
    targetKind: "installed_artifact" as const,
    disposition: "read_only_unchanged" as const,
    installedArtifact: { ...admitted.resources.installedArtifact.artifact },
    resolvedLock: {
      ref: admitted.resources.resolvedLock.lockId,
      digest: admitted.resources.resolvedLock.lockDigest,
    },
    installedProduct: admitted.installedProductCoordinate!,
    installManifest: { ...admitted.resources.installManifest.manifest },
  });
}

function resourceReceipt(
  admitted: AdmittedResources,
  result: ProductVerificationOperationResult,
): ProductVerificationResourceReceipt {
  const disposition = resourceDisposition(admitted);
  return deepFreeze({
    kind: "product_verification_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "read_only_unchanged" as const,
    resourceDisposition: disposition,
    evidence: result.kind === "product_verification_success"
      ? constructProductVerificationEvidence(result, disposition)
      : null,
  });
}

const verify: ExactDefinitionCallable<VerifyPacket, ProductVerificationDefinitionResources,
  ProductVerificationResourceReceipt> = (call) => {
  const admitted = admitResources(call);
  if ("kind" in admitted) return Effect.fail(admitted);
  return Effect.tryPromise({
    try: () => ProductVerificationPort.verify(nativePacket(admitted.resources)),
    catch: (cause) => fault(call, "owner_execution", "product_verification_execution_failure", String(cause)),
  }).pipe(Effect.flatMap((ownerResult) => Effect.try({
    try: (): DefinitionReturn<VerifyPacket, ProductVerificationResourceReceipt> => deepFreeze({
      ownerOutput: validatedOutput(projectOwnerOutput(call, admitted, ownerResult)),
      resources: resourceReceipt(admitted, ownerResult),
    }),
    catch: (cause) => fault(call, "owner_projection", "invalid_product_verification_owner_output", String(cause)),
  })));
};

export const PRODUCT_VERIFICATION_DEFINITION_BINDINGS = Object.freeze({ verify });
