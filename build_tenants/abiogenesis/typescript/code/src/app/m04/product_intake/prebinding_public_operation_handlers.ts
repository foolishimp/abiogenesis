import { dirname, join } from "node:path";

import * as v from "valibot";

import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type {
  CatalogResolveRequest,
  CatalogVerifyRequest,
  InstallProductRequest,
  ProductIntakeContext,
  ProductRequirement
} from "../public_sdk/carriers.js";
import type {
  PrivateOwnerHandlerOutcome
} from "../public_contracts/private_public_operation_handler_bindings.js";
import {
  admitP1OwnerValue,
  assertExactPrivateOperationFamily,
  assertPrivateOwnerEventAdmission,
  emitPrivateOwnerArtifactBoundary,
  privateOwnerRefusal,
  privateOwnerResult,
  type PrivateOwnerArtifactBoundaryContext
} from "../public_contracts/private_public_operation_handler_bindings.js";
import {
  assertAdmittedPrivateP1PublicOperationPacket,
  type AdmittedPrivateP1PublicOperationPacket
} from "../public_contracts/private_public_operation_ingress.js";
import type {
  PrivatePublicOperationDefinitionFamily
} from "../public_contracts/public_operation_definition_family.js";
import { catalogResolve } from "./resolve.js";
import { catalogVerify } from "./verify.js";
import {
  installProduct,
  type InstallProductAttribution
} from "./install.js";
import { PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES } from "./operation_contracts.js";

type SourceOutput<S extends { readonly schema: v.GenericSchema }> =
  v.InferOutput<S["schema"]>;
type ProductVerifyDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.product.verify"]["verify"];
type ProductResolveDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.product.resolve"]["resolve"];
type ProductInstallDefinition =
  PrivatePublicOperationDefinitionFamily["abg.operation.product.install"]["install"];
type ProductVerifySources =
  typeof PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify;
type ProductResolveSources =
  typeof PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve;
type ProductInstallSources =
  typeof PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install;
type ProductVerifyResult = SourceOutput<ProductVerifySources["result"]>;
type ProductVerifyRefusal = SourceOutput<ProductVerifySources["refusal"]>;
type ProductResolveResult = SourceOutput<ProductResolveSources["result"]>;
type ProductResolveRefusal = SourceOutput<ProductResolveSources["refusal"]>;
type ProductInstallResult = SourceOutput<ProductInstallSources["result"]>;
type ProductInstallRefusal = SourceOutput<ProductInstallSources["refusal"]>;

function verifyRefusal(
  definition: ProductVerifyDefinition,
  code: ProductVerifyRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): ProductVerifyRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify.refusal.schema,
    { code, message, residualRefs }
  );
}

function resolveRefusal(
  definition: ProductResolveDefinition,
  code: ProductResolveRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): ProductResolveRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve.refusal.schema,
    { code, message, residualRefs }
  );
}

function installRefusal(
  definition: ProductInstallDefinition,
  code: ProductInstallRefusal["code"],
  message: string,
  residualRefs: readonly string[] = Object.freeze([])
): ProductInstallRefusal {
  return admitP1OwnerValue(
    definition.refusalContract.contract.schema,
    PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install.refusal.schema,
    { code, message, residualRefs }
  );
}

function sortedNativeSet(values: readonly unknown[]): readonly unknown[] {
  return Object.freeze(
    [...values].sort((left, right) => {
      const leftDigest = stableSha256Digest(left);
      const rightDigest = stableSha256Digest(right);
      return leftDigest < rightDigest ? -1 : leftDigest > rightDigest ? 1 : 0;
    })
  );
}

function verifyRequestMatchesOwnerFacts(
  request: SourceOutput<ProductVerifySources["request"]>,
  ownerRequest: CatalogVerifyRequest
): boolean {
  return request.artifactRef === ownerRequest.artifact.artifactPath &&
    request.artifactDigest === ownerRequest.artifact.expectedArtifactDigest &&
    request.productContentDigest ===
      ownerRequest.artifact.expectedProductContentDigest &&
    request.descriptorRef === ownerRequest.descriptor.descriptorId &&
    request.descriptorDigest === ownerRequest.descriptor.descriptorDigest &&
    request.contributionManifestRef ===
      ownerRequest.contributionManifest.contributionId &&
    request.contributionManifestDigest ===
      ownerRequest.contributionManifest.contributionDigest &&
    request.resolvedLockRef === ownerRequest.resolvedLock.lockId &&
    request.resolvedLockDigest === ownerRequest.resolvedLock.lockDigest &&
    stableJsonEquals(
      [...request.expectedContractRefs].sort(),
      [...ownerRequest.descriptor.contractRefs].sort()
    );
}

function verifyRefusalCode(
  code: "content_mismatch" | "identity_mismatch" | "descriptor_mismatch" |
    "contribution_mismatch" | "lock_mismatch" | "incompatible" |
    "unsupported_contract" | "unsafe_archive"
): ProductVerifyRefusal["code"] {
  if (code === "unsafe_archive") {
    return "artifact_invalid";
  }
  if (code === "incompatible") {
    return "incompatible_dependency";
  }
  return code;
}

/** @internal */
export function bindPrivateProductVerifyHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.product.verify"].verify;
  const sources = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        ProductVerifyDefinition
      >;
      readonly ownerRequest: CatalogVerifyRequest;
      readonly context: ProductIntakeContext;
    }): Promise<PrivateOwnerHandlerOutcome<ProductVerifyResult, ProductVerifyRefusal>> {
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      if (!verifyRequestMatchesOwnerFacts(request, input.ownerRequest)) {
        return privateOwnerRefusal(
          verifyRefusal(
            definition,
            "identity_mismatch",
            "product.verify request differs from its admitted owner facts"
          )
        );
      }
      const ownerOutcome = await catalogVerify(input.ownerRequest, input.context);
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(
          verifyRefusal(
            definition,
            verifyRefusalCode(ownerOutcome.code),
            ownerOutcome.message,
            ownerOutcome.residualRefs
          )
        );
      }
      const verified = ownerOutcome.value;
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        sources.result.schema,
        {
          verifiedArtifactRef: request.artifactRef,
          verifiedArtifactDigest: stableSha256Digest(verified),
          verifiedArtifact: verified,
          productContentDigest: verified.artifact.expectedProductContentDigest,
          descriptorRef: verified.descriptor.descriptorId,
          descriptorDigest: verified.descriptor.descriptorDigest,
          contributionManifestRef: verified.contributionManifest.contributionId,
          contributionManifestDigest:
            verified.contributionManifest.contributionDigest,
          resolvedLockRef: verified.resolvedLock.lockId,
          resolvedLockDigest: verified.resolvedLock.lockDigest,
          checkedContractRefs: request.expectedContractRefs,
          verificationDisposition: "verified",
          residualRefs: [],
          provenanceRefs: ownerOutcome.provenanceRefs
        }
      );
      return privateOwnerResult(result);
    }
  });
}

function resolveRequestMatchesOwnerFacts(
  request: SourceOutput<ProductResolveSources["request"]>,
  ownerRequest: CatalogResolveRequest
): boolean {
  const ownerCoordinates = ownerRequest.candidateDescriptors.map(
    (descriptor) => Object.freeze({
      productId: descriptor.productId,
      version: descriptor.version,
      contractRefs: descriptor.contractRefs,
      capabilityRefs: descriptor.capabilityRefs
    })
  );
  return stableJsonEquals(
    sortedNativeSet(request.requirements),
    sortedNativeSet(ownerRequest.requirements)
  ) && stableJsonEquals(
    sortedNativeSet(request.candidates),
    sortedNativeSet(ownerCoordinates)
  );
}

function resolveRefusalCode(
  code: "unresolved" | "incompatible" | "ambiguous" |
    "dependency_cycle" | "malformed_candidate"
): ProductResolveRefusal["code"] {
  if (code === "dependency_cycle") {
    return "cyclic";
  }
  if (code === "malformed_candidate") {
    return "invalid_requirement";
  }
  return code;
}

function requirementRef(requirement: ProductRequirement): string {
  return `requirement:${stableSha256Digest(requirement)}`;
}

/** @internal */
export function bindPrivateProductResolveHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.product.resolve"].resolve;
  const sources = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        ProductResolveDefinition
      >;
      readonly ownerRequest: CatalogResolveRequest;
      readonly context: ProductIntakeContext;
    }): PrivateOwnerHandlerOutcome<ProductResolveResult, ProductResolveRefusal> {
      assertAdmittedPrivateP1PublicOperationPacket(input.packet, definition);
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      if (!resolveRequestMatchesOwnerFacts(request, input.ownerRequest)) {
        return privateOwnerRefusal(
          resolveRefusal(
            definition,
            "invalid_requirement",
            "product.resolve request differs from its admitted owner facts"
          )
        );
      }
      const ownerOutcome = catalogResolve(input.ownerRequest, input.context);
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(
          resolveRefusal(
            definition,
            resolveRefusalCode(ownerOutcome.code),
            ownerOutcome.message,
            ownerOutcome.residualRefs
          )
        );
      }
      const lock = ownerOutcome.value;
      const selectedProducts = lock.products.map((selected) => {
        const coordinate = request.candidates.find(
          (candidate) => candidate.productId === selected.productId &&
            candidate.version === selected.version
        );
        if (coordinate === undefined) {
          throw new TypeError(
            `product.resolve selected undeclared coordinate ${selected.productId}@${selected.version}`
          );
        }
        const satisfied = [
          ...lock.requirements.filter(
            (requirement) => requirement.productId === selected.productId
          ),
          ...lock.dependencyEdges
            .filter((edge) => edge.targetProductId === selected.productId)
            .map((edge) => edge.requirement)
        ];
        const satisfiedRequirementRefs = Object.freeze([
          ...new Set(satisfied.map(requirementRef))
        ]);
        if (satisfiedRequirementRefs.length === 0) {
          throw new TypeError(
            `product.resolve selected ${selected.productId} without a requirement`
          );
        }
        return Object.freeze({
          productIdentity: selected.productId,
          selectedCoordinate: coordinate,
          satisfiedRequirementRefs
        });
      });
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        sources.result.schema,
        {
          resolvedLockRef: lock.lockId,
          resolvedLockDigest: lock.lockDigest,
          resolvedLock: lock,
          selectedProducts,
          selectedDependencyGraph: lock.dependencyEdges,
          residualRefs: [],
          provenanceRefs: ownerOutcome.provenanceRefs
        }
      );
      return privateOwnerResult(result);
    }
  });
}

function installRequestMatchesOwnerFacts(
  request: SourceOutput<ProductInstallSources["request"]>,
  ownerRequest: InstallProductRequest
): boolean {
  const verified = ownerRequest.verifiedArtifact;
  const expectedTarget = ownerRequest.toolchainRoot === null
    ? null
    : join(
        ownerRequest.toolchainRoot,
        "products",
        verified.descriptor.productId,
        verified.descriptor.version
      );
  return ownerRequest.workspaceBindingRef === null &&
    expectedTarget === request.targetRoot &&
    request.verifiedArtifactRef === verified.artifact.artifactPath &&
    request.verifiedArtifactDigest === stableSha256Digest(verified) &&
    request.productContentDigest === verified.artifact.expectedProductContentDigest &&
    request.productDescriptorRef === verified.descriptor.descriptorId &&
    request.productDescriptorDigest === verified.descriptor.descriptorDigest &&
    request.contributionManifestRef === verified.contributionManifest.contributionId &&
    request.contributionManifestDigest === verified.contributionManifest.contributionDigest &&
    request.resolvedLockRef === verified.resolvedLock.lockId &&
    request.resolvedLockDigest === verified.resolvedLock.lockDigest;
}

function installRefusalCode(
  code: "unverified" | "toolchain_unresolved" |
    "installed_identity_conflict" | "materialization_failure"
): ProductInstallRefusal["code"] {
  switch (code) {
    case "unverified":
      return "verification_failed";
    case "toolchain_unresolved":
      return "invalid_target";
    case "installed_identity_conflict":
      return "identity_conflict";
    case "materialization_failure":
      return "filesystem_failure";
  }
}

function assertInstallActor(
  boundary: PrivateOwnerArtifactBoundaryContext,
  attribution: InstallProductAttribution
): void {
  if (boundary.admission.event.actorRef !== attribution.actorRef) {
    throw new TypeError(
      "product.install actor differs from its admitted invocation"
    );
  }
}

/** @internal */
export function bindPrivateProductInstallHandler(
  family: PrivatePublicOperationDefinitionFamily
) {
  assertExactPrivateOperationFamily(family);
  const definition = family["abg.operation.product.install"].install;
  const sources = PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install;
  return Object.freeze({
    kind: "private_public_operation_handler_binding" as const,
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    async execute(input: {
      readonly packet: AdmittedPrivateP1PublicOperationPacket<
        ProductInstallDefinition
      >;
      readonly ownerRequest: InstallProductRequest;
      readonly context: ProductIntakeContext;
      readonly attribution: InstallProductAttribution;
      readonly artifactBoundary: PrivateOwnerArtifactBoundaryContext;
    }): Promise<PrivateOwnerHandlerOutcome<ProductInstallResult, ProductInstallRefusal>> {
      assertPrivateOwnerEventAdmission({
        definition,
        packet: input.packet,
        admission: input.artifactBoundary.admission
      });
      const request = admitP1OwnerValue(
        definition.requestContract.contract.schema,
        sources.request.schema,
        input.packet.invocation.request
      );
      assertInstallActor(input.artifactBoundary, input.attribution);
      if (!installRequestMatchesOwnerFacts(request, input.ownerRequest)) {
        return privateOwnerRefusal(
          installRefusal(
            definition,
            "verification_failed",
            "product.install request differs from its admitted verified artifact"
          )
        );
      }
      const ownerOutcome = await installProduct(
        input.ownerRequest,
        input.context,
        input.attribution
      );
      if (ownerOutcome.kind === "refused") {
        return privateOwnerRefusal(
          installRefusal(
            definition,
            installRefusalCode(ownerOutcome.code),
            ownerOutcome.message,
            ownerOutcome.residualRefs
          )
        );
      }
      const installed = ownerOutcome.value;
      const installerManifestRef = join(
        dirname(installed.descriptorRecordPath),
        "verification-result.json"
      );
      const installerManifest = await input.context.effects.readRecord(
        installerManifestRef
      );
      if (installerManifest === null) {
        return privateOwnerRefusal(
          installRefusal(
            definition,
            "filesystem_failure",
            "product.install owner did not persist its verification result",
            [installerManifestRef]
          )
        );
      }
      const installedDigest = stableSha256Digest(installed);
      const result = admitP1OwnerValue(
        definition.resultContract.contract.schema,
        sources.result.schema,
        {
          installedProductRef: installed.installedProductId,
          installedProductDigest: installedDigest,
          installManifestRef: installed.manifestPath,
          installManifestDigest: installed.manifestDigest,
          installerManifestRef,
          installerManifestDigest: stableSha256Digest(installerManifest),
          verificationDisposition: "verified",
          materializationDisposition: ownerOutcome.disposition === "installed"
            ? "materialized"
            : "idempotent",
          selectedDependencyGraph:
            input.ownerRequest.verifiedArtifact.resolvedLock.dependencyEdges,
          provenanceRefs: ownerOutcome.provenanceRefs
        }
      );
      const events = emitPrivateOwnerArtifactBoundary({
        definition,
        packet: input.packet,
        boundary: input.artifactBoundary,
        scopeRef: installed.installedProductId,
        scopeDigest: installedDigest,
        disposition: ownerOutcome.disposition,
        artifactRef: installed.installedProductId,
        artifactDigest: installedDigest
      });
      return privateOwnerResult(result, events);
    }
  });
}
