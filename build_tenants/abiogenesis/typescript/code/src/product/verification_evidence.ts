import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitExactDefinitionCall, hasExactKeys } from
  "../shared/definition_binding_mechanics.js";
import type { OwnerSemanticOutput } from "../shared/public_function_contracts.js";
import type {
  AdmittedPublicInvocation,
  ReferenceDigest,
  SuccessfulPackedVerificationReference,
} from "../shared/public_invocation.js";
import {
  projectPublicOutcome,
  type IndexedPublicOutcome,
} from "../public/indexed_outcome.js";
import type {
  ProductVerificationResourceDisposition,
  ProductVerificationSuccess,
  VerifiedProductArtifact,
} from "./contracts.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "./verification_operation_contracts.js";
import {
  isVerifiedProductArtifact,
  productVerificationCoordinates,
} from "./verify_product.js";

/**
 * Product-owned evidence retained by the verification binding.  Public projects
 * the indexed outcome, but does not own or carry this complete artifact proof.
 */
export interface ProductVerificationEvidence {
  readonly kind: "product_verification_evidence";
  readonly schemaVersion: "5.0.0";
  readonly targetKind: "packed_artifact" | "installed_artifact";
  readonly verification: ProductVerificationSuccess;
  readonly resourceDisposition: ProductVerificationResourceDisposition;
  readonly evidenceRef: string;
  readonly evidenceDigest: Sha256Digest;
}

export interface SuccessfulPackedVerificationAdmission {
  readonly reference: SuccessfulPackedVerificationReference;
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly verification: ProductVerificationSuccess;
}

type EvidenceBody = Omit<
  ProductVerificationEvidence,
  "evidenceRef" | "evidenceDigest"
>;

type VerifyPacket = typeof PRODUCT_VERIFICATION_CONTRACTS.verify;
type VerifyInvocation = AdmittedPublicInvocation<
  VerifyPacket["definitionKey"],
  Readonly<Record<string, JsonValue>>
>;
type VerifyOutcome = IndexedPublicOutcome<VerifyPacket["definitionKey"]>;
type VerifyOutput = OwnerSemanticOutput<VerifyPacket>;

function evidenceBody(
  verification: ProductVerificationSuccess,
  resourceDisposition: ProductVerificationResourceDisposition,
): EvidenceBody {
  return {
    kind: "product_verification_evidence",
    schemaVersion: "5.0.0",
    targetKind: resourceDisposition.targetKind,
    verification,
    resourceDisposition,
  };
}

function evidenceCoordinate(
  body: EvidenceBody,
): ReferenceDigest<"ProductVerificationEvidence"> {
  const digest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ref: `product-verification-evidence://abiogenesis/${digest.slice("sha256:".length)}`,
    digest,
  });
}

function sameCoordinate(left: ReferenceDigest, right: ReferenceDigest): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

function isCanonicalEvidence(
  value: unknown,
): value is ProductVerificationEvidence {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "evidenceDigest",
      "evidenceRef",
      "kind",
      "resourceDisposition",
      "schemaVersion",
      "targetKind",
      "verification",
    ]) ||
    !isRecord(value.verification) ||
    !hasExactKeys(value.verification, [
      "coordinates",
      "definitionContractCoordinates",
      "disposition",
      "kind",
      "pendingExternalSelectors",
      "schemaVersion",
      "verifiedArtifact",
    ]) ||
    !isRecord(value.resourceDisposition) ||
    !hasExactKeys(value.resourceDisposition, [
      "disposition",
      "kind",
      "packedArtifact",
      "schemaVersion",
      "targetKind",
    ])
  ) return false;
  const candidate = value as unknown as ProductVerificationEvidence;
  const body = evidenceBody(
    candidate.verification,
    candidate.resourceDisposition,
  );
  const coordinate = evidenceCoordinate(body);
  return candidate.targetKind === candidate.resourceDisposition.targetKind &&
    candidate.evidenceRef === coordinate.ref &&
    candidate.evidenceDigest === coordinate.digest;
}

/** Constructs the one complete Product evidence carrier on verification success. */
export function constructProductVerificationEvidence(
  verification: ProductVerificationSuccess,
  resourceDisposition: ProductVerificationResourceDisposition,
): ProductVerificationEvidence {
  const body = evidenceBody(verification, resourceDisposition);
  const coordinate = evidenceCoordinate(body);
  return deepFreeze({ ...body, evidenceRef: coordinate.ref, evidenceDigest: coordinate.digest });
}

/**
 * The shared Product relation used by resolve and install.  Its callers supply
 * the transport-carried verify invocation, owner completion, and PFC-F06
 * outcome; this relation deliberately admits only their exact packed success.
 */
export function admitSuccessfulPackedVerificationEvidence(
  invocation: unknown,
  ownerOutput: unknown,
  outcome: unknown,
  evidence: unknown,
): SuccessfulPackedVerificationAdmission | null {
  let admittedInvocation;
  try {
    admittedInvocation = admitExactDefinitionCall(
      { invocation },
      PRODUCT_VERIFICATION_CONTRACTS.verify,
    );
  } catch {
    return null;
  }
  if (!isCanonicalEvidence(evidence) ||
    admittedInvocation === null ||
    evidence.targetKind !== "packed_artifact" ||
    evidence.verification.kind !== "product_verification_success" ||
    evidence.verification.disposition !== "verified" ||
    evidence.resourceDisposition.targetKind !== "packed_artifact" ||
    evidence.resourceDisposition.disposition !== "read_only_unchanged" ||
    !isVerifiedProductArtifact(evidence.verification.verifiedArtifact)) {
    return null;
  }
  const exactInvocation = admittedInvocation as unknown as VerifyInvocation;

  const artifact = evidence.verification.verifiedArtifact;
  const coordinates = productVerificationCoordinates(artifact);
  if (
    admittedInvocation.request.targetKind !== "packed_artifact" ||
    !isVerifyOutput(ownerOutput) ||
    !isVerifyOutcome(outcome) ||
    ownerOutput.outcomeKind !== "result" ||
    outcome.outcomeKind !== "result" ||
    !sameJson(
      projectPublicOutcome<VerifyPacket>(exactInvocation, ownerOutput),
      outcome,
    )
  ) return null;

  const outputValue = ownerOutput.value as Readonly<Record<string, unknown>>;
  if (
    outputValue === null || typeof outputValue !== "object" ||
    outputValue.targetKind !== "packed_artifact" ||
    outputValue.disposition !== "locally_verified" ||
    !sameCoordinate(
      outputValue.verifiedArtifact as ReferenceDigest,
      coordinates.verifiedArtifact,
    ) ||
    !sameCoordinate(
      outputValue.localNativeEvidence as ReferenceDigest,
      coordinates.localNativeEvidence,
    ) ||
    !sameJson(
      outputValue.pendingExternalSelectors,
      evidence.verification.pendingExternalSelectors,
    ) ||
    !sameJson(
      outputValue.definitionContractCoordinates,
      evidence.verification.definitionContractCoordinates,
    ) ||
    !sameJson(outputValue.residuals, []) ||
    !sameJson(outputValue.provenance, [coordinates.provenance]) ||
    !sameJson(evidence.verification.coordinates, coordinates) ||
    !matchesVerifyInvocation(exactInvocation, artifact, coordinates) ||
    !sameCoordinate(
      evidence.resourceDisposition.packedArtifact,
      { ref: artifact.artifactRef, digest: artifact.artifactDigest },
    )
  ) return null;

  const reference: SuccessfulPackedVerificationReference = deepFreeze({
    invocation: {
      ref: exactInvocation.invocationRef,
      digest: exactInvocation.invocationDigest,
    },
    outcome: {
      ref: outcome.outcomeRef,
      digest: outcome.outcomeDigest,
    },
  });
  return deepFreeze({ reference, verifiedArtifact: artifact, verification: evidence.verification });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isVerifyOutput(value: unknown): value is VerifyOutput {
  return isRecord(value) &&
    (value.outcomeKind === "result" || value.outcomeKind === "refusal" ||
      value.outcomeKind === "nonterminal") &&
    Object.hasOwn(value, "value");
}

function isVerifyOutcome(value: unknown): value is VerifyOutcome {
  return isRecord(value) &&
    value.outcomeKind === "result" &&
    typeof value.outcomeRef === "string" &&
    typeof value.outcomeDigest === "string";
}

function matchesVerifyInvocation(
  invocation: VerifyInvocation,
  artifact: VerifiedProductArtifact,
  coordinates: ProductVerificationSuccess["coordinates"],
): boolean {
  const request = invocation.request as Readonly<Record<string, unknown>>;
  const productContent = request.productContent;
  return sameUnknownCoordinate(
    request.artifact,
    { ref: artifact.artifactRef, digest: artifact.artifactDigest },
  ) &&
    sameUnknownCoordinate(
      request.descriptor,
      coordinates.descriptor,
    ) &&
    sameUnknownCoordinate(
      request.contributionManifest,
      { ref: artifact.contributionManifestRef, digest: artifact.contributionManifestDigest },
    ) &&
    isRecord(productContent) &&
    productContent.digest === artifact.productContentDigest &&
    request.targetKind === "packed_artifact" &&
    sameJson(request.declaredDependencies, artifact.declaredDependencies) &&
    sameJson(
      request.compatibilityInputs,
      artifact.compatibilityRefs.map((compatibilityRef) => ({
        compatibilityRef,
        subjectRef: productContent.ref,
      })),
    );
}

function sameUnknownCoordinate(
  value: unknown,
  expected: ReferenceDigest,
): boolean {
  return isRecord(value) && value.ref === expected.ref && value.digest === expected.digest;
}

function sameJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}
