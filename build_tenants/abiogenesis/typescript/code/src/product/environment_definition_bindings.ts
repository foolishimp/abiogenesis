import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  AbgEventResourceCloseFailure,
  abandonAbgEventResource,
  acquireAbgEventResource,
  closeAbgEventResource,
  validateAbgEventResourceAssertion,
  validateAbgEventResourceReceipt,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "../abg/definition_event_resource.js";
import {
  ArtifactAdmissionPostAppendFailure,
  admitWorkspaceBinding,
  projectAdmittedWorkspaceBinding,
  type ArtifactAdmissionBasis,
} from "../abg/environment_admission.js";
import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  admitDefinitionExecutionFault,
  DefinitionPostAppendCause,
  postAppendDefinitionFault,
  preDefinitionFault,
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
  type PreDefinitionExecutionFault,
} from "../shared/effect_definition.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import {
  admitRuntimeContract,
  digestSchema,
  refDigestSchema,
  type OwnerRefusalOf,
  type OwnerRequestOf,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  bindExactPrefixTransition,
  bindStaticOwner,
} from "../shared/static_definition_bindings.js";
import type { VerifiedProductArtifact } from "./contracts.js";
import {
  isProductInstall,
  isResolvedProductLock,
  isWorkspaceAuthorityBasis,
  productInstallCoordinate,
  type EnvironmentRefusal,
  type ProductInstall,
  type ResolvedProductLock,
  type WorkspaceAuthorityBasis,
  type WorkspaceBinding,
  type WorkspaceBindingCandidate,
  type WorkspaceDeclaredRoots,
} from "./environment.js";
import {
  admitResolvedNativeContractClosure,
  PRODUCT_ENVIRONMENT_CONTRACTS,
  resolvedNativeContractClosureSchema,
  type ResolvedNativeContractClosure,
} from "./environment_operation_contracts.js";
import {
  ProductEnvironmentPort,
  type ProductResolutionPacket,
  type WorkspaceBindingPacket,
} from "./environment_operations.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "./verification_operation_contracts.js";
import { isVerifiedProductArtifact } from "./verify_product.js";

type ResolvePacket = typeof PRODUCT_ENVIRONMENT_CONTRACTS.resolve;
type BindPacket = typeof PRODUCT_ENVIRONMENT_CONTRACTS.bind;
type ResolveRequest = OwnerRequestOf<ResolvePacket>;
type BindRequest = OwnerRequestOf<BindPacket>;
type VerificationPacket = typeof PRODUCT_VERIFICATION_CONTRACTS.verify;
type SuccessfulVerificationOutput = Extract<
  OwnerSemanticOutput<VerificationPacket>,
  { readonly outcomeKind: "result" }
>;

export interface ProductResolutionVerifiedPreimage {
  readonly verification: ResolveRequest["verifiedCandidates"][number];
  readonly verifiedArtifact: VerifiedProductArtifact;
  readonly verificationOutput: SuccessfulVerificationOutput;
}

export interface ProductResolutionResourceAssertion {
  readonly kind: "product_resolution_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly verifiedPreimages: readonly ProductResolutionVerifiedPreimage[];
  readonly nativeContractClosure: ResolvedNativeContractClosure;
}

export interface ProductResolutionResourceReceipt {
  readonly kind: "product_resolution_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "read_only_unchanged";
  readonly verifiedArtifacts: readonly ReferenceDigest<"VerifiedProductArtifact">[];
  readonly resolvedLock: ReferenceDigest<"ResolvedProductLock"> | null;
  readonly nativeContractClosureDigest: string;
}

export interface ProductWorkspaceBindingResourceAssertion {
  readonly kind: "product_workspace_binding_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
  readonly workspaceAuthority: WorkspaceAuthorityBasis;
  readonly admittedInstalls: readonly ProductInstall[];
  readonly resolvedLock: ResolvedProductLock;
  readonly declaredRoots: WorkspaceDeclaredRoots;
}

export interface ProductWorkspaceBindingResourceReceipt {
  readonly kind: "product_workspace_binding_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
  readonly workspaceAuthority: ReferenceDigest<"WorkspaceAuthority">;
  readonly admittedInstalls: readonly ReferenceDigest<"InstalledProduct">[];
  readonly resolvedLock: ReferenceDigest<"ResolvedProductLock">;
  readonly binding: ReferenceDigest<"WorkspaceBinding"> | null;
}

const SUCCESSFUL_VERIFICATION_REFERENCE_SCHEMA = v.strictObject({
  invocation: refDigestSchema,
  outcome: refDigestSchema,
});

const PRODUCT_RESOLUTION_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("product_resolution_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  disposition: v.literal("read_only_unchanged"),
  verifiedArtifacts: v.array(refDigestSchema),
  resolvedLock: v.nullable(refDigestSchema),
  nativeContractClosureDigest: digestSchema,
}) as v.GenericSchema<
  ProductResolutionResourceReceipt,
  ProductResolutionResourceReceipt
>;

const PRODUCT_WORKSPACE_BINDING_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("product_workspace_binding_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceReceipt>(
    validateAbgEventResourceReceipt,
  ),
  workspaceAuthority: refDigestSchema,
  admittedInstalls: v.array(refDigestSchema),
  resolvedLock: refDigestSchema,
  binding: v.nullable(refDigestSchema),
}) as v.GenericSchema<
  ProductWorkspaceBindingResourceReceipt,
  ProductWorkspaceBindingResourceReceipt
>;

type ResolveRefusalCode = OwnerRefusalOf<ResolvePacket>["code"];
type BindRefusalCode = OwnerRefusalOf<BindPacket>["code"];

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
    [...keys].sort(compareUnicodeCodeUnits).join("\0");
}

function sameJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function sameCoordinate(left: ReferenceDigest, right: ReferenceDigest): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

function fault<K extends ResolvePacket["definitionKey"] | BindPacket["definitionKey"]>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
): PreDefinitionExecutionFault<K> {
  return preDefinitionFault(
    definitionKey,
    stage,
    code,
    message,
  );
}

function admittedEnvironmentFault<
  K extends ResolvePacket["definitionKey"] | BindPacket["definitionKey"],
  TResourceReceipt,
>(
  candidate: unknown,
  expectedDefinitionKey: K,
  resourceReceiptSchema: v.GenericSchema<TResourceReceipt, TResourceReceipt>,
): DefinitionExecutionFault<K, TResourceReceipt> | null {
  return admitDefinitionExecutionFault(
    candidate,
    expectedDefinitionKey,
    (receiptCandidate) => v.is(resourceReceiptSchema, receiptCandidate)
      ? { resourceReceipt: receiptCandidate }
      : null,
  );
}

function verifiedArtifactCoordinate(
  artifact: VerifiedProductArtifact,
): ReferenceDigest<"VerifiedProductArtifact"> {
  return deepFreeze({
    ref: artifact.artifactRef,
    digest: artifact.artifactDigest,
  });
}

function resolvedLockCoordinate(
  lock: ResolvedProductLock,
): ReferenceDigest<"ResolvedProductLock"> {
  return deepFreeze({ ref: lock.lockId, digest: lock.lockDigest });
}

function workspaceAuthorityCoordinate(
  authority: WorkspaceAuthorityBasis,
): ReferenceDigest<"WorkspaceAuthority"> {
  return deepFreeze({
    ref: authority.authorityBasisId,
    digest: authority.authorityBasisDigest,
  });
}

function workspaceBindingCoordinate(
  binding: Pick<WorkspaceBinding, "bindingId" | "bindingDigest">,
): ReferenceDigest<"WorkspaceBinding"> {
  return deepFreeze({ ref: binding.bindingId, digest: binding.bindingDigest });
}

function uniqueCoordinates(values: readonly ReferenceDigest[]): readonly ReferenceDigest[] {
  return deepFreeze([...new Map(
    values.map((value) => [`${value.ref}\0${value.digest}`, value] as const),
  ).values()].sort((left, right) =>
    compareUnicodeCodeUnits(left.ref, right.ref) ||
    compareUnicodeCodeUnits(left.digest, right.digest)
  ));
}

function resolveFault(
  call: DefinitionCall<ResolvePacket, ProductResolutionResourceAssertion>,
  code: string,
  message: string,
): PreDefinitionExecutionFault<ResolvePacket["definitionKey"]> {
  return fault(call.invocation.definitionKey, "resource_admission", code, message);
}

function invalidVerifiedPreimage(
  preimage: ProductResolutionVerifiedPreimage,
): boolean {
  const record = preimage as unknown;
  if (
    !isRecord(record) ||
    !hasExactKeys(record, [
      "verification",
      "verificationOutput",
      "verifiedArtifact",
    ]) ||
    !isVerifiedProductArtifact(preimage.verifiedArtifact)
  ) return true;
  const output = preimage.verificationOutput;
  if (!isSuccessfulVerificationOutput(output)) return true;
  return output.value.disposition !== "locally_verified" ||
    !sameCoordinate(
      output.value.verifiedArtifact,
      verifiedArtifactCoordinate(preimage.verifiedArtifact),
    );
}

function isSuccessfulVerificationOutput(
  value: unknown,
): value is SuccessfulVerificationOutput {
  return isRecord(value) &&
    hasExactKeys(value, ["outcomeKind", "value"]) &&
    value.outcomeKind === "result" &&
    admitRuntimeContract(
        PRODUCT_VERIFICATION_CONTRACTS.verify.resultSchema,
        value.value,
      ).disposition === "admitted" &&
    isRecord(value.value) &&
    value.value.targetKind === "packed_artifact";
}

const PRODUCT_RESOLUTION_VERIFIED_PREIMAGE_SCHEMA = v.pipe(
  v.strictObject({
    verification: SUCCESSFUL_VERIFICATION_REFERENCE_SCHEMA,
    verifiedArtifact: v.custom<VerifiedProductArtifact>(
      isVerifiedProductArtifact,
      "verified_product_artifact",
    ),
    verificationOutput: v.custom<SuccessfulVerificationOutput>(
      isSuccessfulVerificationOutput,
      "successful_verification_output",
    ),
  }),
  v.check(
    (candidate) => !invalidVerifiedPreimage(candidate),
    "successful_verified_product_preimage",
  ),
);

const PRODUCT_RESOLUTION_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
  kind: v.literal("product_resolution_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  verifiedPreimages: v.pipe(
    v.array(PRODUCT_RESOLUTION_VERIFIED_PREIMAGE_SCHEMA),
    v.minLength(1),
  ),
  nativeContractClosure: resolvedNativeContractClosureSchema,
}) as v.GenericSchema<
  ProductResolutionResourceAssertion,
  ProductResolutionResourceAssertion
>;

function validateResolveResources(
  call: DefinitionCall<ResolvePacket, ProductResolutionResourceAssertion>,
): PreDefinitionExecutionFault<ResolvePacket["definitionKey"]> | null {
  const resources = call.resources;
  if (
    !isRecord(resources) ||
    !hasExactKeys(resources, [
      "kind",
      "nativeContractClosure",
      "schemaVersion",
      "verifiedPreimages",
    ]) ||
    resources.kind !== "product_resolution_resource_assertion" ||
    resources.schemaVersion !== "5.0.0" ||
    !Array.isArray(resources.verifiedPreimages) ||
    resources.verifiedPreimages.length === 0 ||
    !sameJson(resources, resources)
  ) {
    return resolveFault(
      call,
      "invalid_resource_assertion",
      "Product resolution requires one exact I-JSON verified-preimage assertion",
    );
  }
  const request = call.invocation.request;
  if (
    resources.verifiedPreimages.length !== request.verifiedCandidates.length ||
    resources.verifiedPreimages.some(invalidVerifiedPreimage) ||
    !sameJson(
      resources.verifiedPreimages.map(({ verification }) => verification),
      request.verifiedCandidates,
    )
  ) {
    return resolveFault(
      call,
      "verified_preimage_mismatch",
      "verified Product preimages differ from the admitted successful verification set",
    );
  }
  return null;
}

function resolveRefusalCode(refusal: EnvironmentRefusal): ResolveRefusalCode {
  switch (refusal.code) {
    case "empty_product_set":
    case "invalid_dependency":
      return "invalid";
    case "lock_mismatch":
      return "unverified";
    case "unresolved_dependency":
      return "unresolved";
    case "incompatible_dependency":
      return "incompatible";
    case "ambiguous_dependency":
    case "duplicate_install":
      return "ambiguous";
    case "cyclic_dependency":
      return "cyclic";
    case "invalid_workspace_authority":
    case "invalid_declared_root":
      throw new TypeError(`resolution returned impossible refusal ${refusal.code}`);
  }
}

function validateResolveOutput(
  output: OwnerSemanticOutput<ResolvePacket>,
): OwnerSemanticOutput<ResolvePacket> {
  const schema = output.outcomeKind === "result"
    ? PRODUCT_ENVIRONMENT_CONTRACTS.resolve.resultSchema
    : PRODUCT_ENVIRONMENT_CONTRACTS.resolve.refusalSchema;
  if (admitRuntimeContract(schema, output.value).disposition !== "admitted") {
    throw new TypeError("Product resolution output differs from its exact contract");
  }
  return output;
}

function resolveReceipt(
  resources: ProductResolutionResourceAssertion,
  lock: ResolvedProductLock | null,
): ProductResolutionResourceReceipt {
  return deepFreeze({
    kind: "product_resolution_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "read_only_unchanged" as const,
    verifiedArtifacts: resources.verifiedPreimages.map(({ verifiedArtifact }) =>
      verifiedArtifactCoordinate(verifiedArtifact)
    ),
    resolvedLock: lock === null ? null : resolvedLockCoordinate(lock),
    nativeContractClosureDigest: sha256Canonical(
      resources.nativeContractClosure as unknown as JsonValue,
    ),
  });
}

function projectResolutionSuccess(
  call: DefinitionCall<ResolvePacket, ProductResolutionResourceAssertion>,
  lock: ResolvedProductLock,
): OwnerSemanticOutput<ResolvePacket> {
  const resources = call.resources;
  const request = call.invocation.request;
  for (const requirement of request.requirements) {
    const productMatches = resources.verifiedPreimages.filter(({ verifiedArtifact }) =>
      verifiedArtifact.productId === requirement.productId
    );
    if (productMatches.length === 0) {
      return validateResolveOutput({
        outcomeKind: "refusal",
        value: {
          code: "unresolved",
          issuePaths: ["/requirements"],
          evidenceRefs: [],
        },
      } as OwnerSemanticOutput<ResolvePacket>);
    }
    const versionMatches = productMatches.filter(({ verifiedArtifact }) =>
      verifiedArtifact.packageVersion === requirement.packageVersion
    );
    if (versionMatches.length !== 1) {
      return validateResolveOutput({
        outcomeKind: "refusal",
        value: {
          code: versionMatches.length === 0 ? "incompatible" : "ambiguous",
          issuePaths: ["/requirements"],
          evidenceRefs: productMatches.map(({ verifiedArtifact }) =>
            verifiedArtifact.artifactRef
          ),
        },
      } as OwnerSemanticOutput<ResolvePacket>);
    }
    const artifact = versionMatches[0]!.verifiedArtifact;
    if (
      requirement.requiredContractRefs.some((ref) =>
        !artifact.publicContractRefs.includes(ref)
      ) ||
      requirement.requiredCapabilityRefs.some((ref) =>
        !artifact.publicCapabilityRefs.includes(ref)
      )
    ) {
      return validateResolveOutput({
        outcomeKind: "refusal",
        value: {
          code: "incompatible",
          issuePaths: ["/requirements"],
          evidenceRefs: [artifact.artifactRef],
        },
      } as OwnerSemanticOutput<ResolvePacket>);
    }
  }
  const selectedProductIds = new Set(request.requirements.map(({ productId }) => productId));
  const unselected = resources.verifiedPreimages.filter(({ verifiedArtifact }) =>
    !selectedProductIds.has(verifiedArtifact.productId)
  );
  if (unselected.length !== 0) {
    return validateResolveOutput({
      outcomeKind: "refusal",
      value: {
        code: "invalid",
        issuePaths: ["/verifiedCandidates"],
        evidenceRefs: unselected.map(({ verifiedArtifact }) =>
          verifiedArtifact.artifactRef
        ),
      },
    } as OwnerSemanticOutput<ResolvePacket>);
  }
  const selectorRefs = resources.verifiedPreimages.flatMap(({ verificationOutput }) =>
    verificationOutput.value.targetKind === "packed_artifact"
      ? verificationOutput.value.pendingExternalSelectors.map(
          ({ selectorRef }) => selectorRef,
        )
      : []
  );
  const closure = admitResolvedNativeContractClosure(
    selectorRefs,
    resources.nativeContractClosure,
  );
  if (
    closure.disposition !== "admitted" ||
    lock.nativeContractClosureDigest !==
      sha256Canonical(closure.value as unknown as JsonValue)
  ) {
    throw new TypeError("resolved native closure differs from the verified Product preimages");
  }
  const selections = request.requirements.map((requirement) => {
    const preimage = resources.verifiedPreimages.find(({ verifiedArtifact }) =>
      verifiedArtifact.productId === requirement.productId &&
      verifiedArtifact.packageVersion === requirement.packageVersion
    )!;
    return {
      requirement,
      product: {
        ref: preimage.verifiedArtifact.productId,
        digest: preimage.verifiedArtifact.productContentDigest,
      },
      verification: preimage.verification,
    };
  });
  const provenance = uniqueCoordinates(
    resources.verifiedPreimages.flatMap(({ verificationOutput }) =>
      verificationOutput.value.provenance
    ),
  );
  return validateResolveOutput({
    outcomeKind: "result",
    value: {
      resolvedLock: resolvedLockCoordinate(lock),
      selections,
      dependencyEdges: lock.dependencyEdges,
      selectorDispositions: closure.value.selectorDispositions,
      occurrences: closure.value.occurrences,
      nativeBindings: closure.value.nativeBindings,
      residuals: [],
      provenance,
    },
  } as unknown as OwnerSemanticOutput<ResolvePacket>);
}

const resolveOwner: ExactDefinitionCallable<
  ResolvePacket,
  ProductResolutionResourceAssertion,
  ProductResolutionResourceReceipt
> = (call) => {
  const resourceFault = validateResolveResources(call);
  if (resourceFault !== null) return Effect.fail(resourceFault);
  return Effect.try({
    try: (): DefinitionReturn<ResolvePacket, ProductResolutionResourceReceipt> => {
      const nativePacket: ProductResolutionPacket = {
        kind: "product_resolution_packet",
        schemaVersion: "5.0.0",
        memberKey: "resolve",
        verifiedArtifacts: call.resources.verifiedPreimages.map(
          ({ verifiedArtifact }) => verifiedArtifact,
        ),
      };
      const native = ProductEnvironmentPort.resolve(nativePacket);
      if (native.kind === "environment_refusal") {
        return deepFreeze({
          ownerOutput: validateResolveOutput({
            outcomeKind: "refusal",
            value: {
              code: resolveRefusalCode(native),
              issuePaths: [],
              evidenceRefs: [],
            },
          } as OwnerSemanticOutput<ResolvePacket>),
          resources: resolveReceipt(call.resources, null),
        });
      }
      return deepFreeze({
        ownerOutput: projectResolutionSuccess(call, native),
        resources: resolveReceipt(call.resources, native),
      });
    },
    catch: (cause) => {
      const admittedFault = admittedEnvironmentFault(
        cause,
        call.invocation.definitionKey,
        PRODUCT_RESOLUTION_RESOURCE_RECEIPT_SCHEMA,
      );
      if (admittedFault !== null) return admittedFault;
      throw cause;
    },
  });
};

const resolve = bindStaticOwner(
  PRODUCT_ENVIRONMENT_CONTRACTS.resolve,
  resolveOwner,
  PRODUCT_RESOLUTION_RESOURCE_ASSERTION_SCHEMA,
  PRODUCT_RESOLUTION_RESOURCE_RECEIPT_SCHEMA,
);

const ROOT_FIELDS = Object.freeze([
  ["toolchain", "toolchainRoot"],
  ["product", "productRoot"],
  ["event_log", "eventLogRoot"],
  ["runtime_state", "runtimeStateRoot"],
  ["projection", "projectionRoot"],
  ["archive", "archiveRoot"],
] as const);

function declaredRootRows(roots: WorkspaceDeclaredRoots) {
  return ROOT_FIELDS.map(([rootKind, field]) => ({ rootKind, path: roots[field] }));
}

function bindFault(
  call: DefinitionCall<BindPacket, ProductWorkspaceBindingResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): PreDefinitionExecutionFault<BindPacket["definitionKey"]> {
  return fault(call.invocation.definitionKey, stage, code, message);
}

function validWorkspaceDeclaredRoots(
  value: unknown,
): value is WorkspaceDeclaredRoots {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "archiveRoot",
      "eventLogRoot",
      "productRoot",
      "projectionRoot",
      "runtimeStateRoot",
      "toolchainRoot",
    ])
  ) return false;
  return Object.values(value).every((root) =>
    typeof root === "string" && root.trim().length > 0
  );
}

function validBindResourceStructure(
  resources: unknown,
): resources is ProductWorkspaceBindingResourceAssertion {
  if (
    !isRecord(resources) ||
    !hasExactKeys(resources, [
      "admittedInstalls",
      "declaredRoots",
      "eventResource",
      "kind",
      "resolvedLock",
      "schemaVersion",
      "workspaceAuthority",
    ]) ||
    resources.kind !== "product_workspace_binding_resource_assertion" ||
    resources.schemaVersion !== "5.0.0" ||
    !validateAbgEventResourceAssertion(resources.eventResource) ||
    resources.eventResource.kind !== "reopen_abg_event_resource" ||
    !sameJson(resources, resources) ||
    !isResolvedProductLock(resources.resolvedLock) ||
    !isWorkspaceAuthorityBasis(resources.workspaceAuthority) ||
    !validWorkspaceDeclaredRoots(resources.declaredRoots) ||
    !Array.isArray(resources.admittedInstalls) ||
    resources.admittedInstalls.length === 0
  ) return false;
  const resolvedLock = resources.resolvedLock;
  return resources.admittedInstalls.every((install) =>
    isProductInstall(install, resolvedLock)
  );
}

const PRODUCT_WORKSPACE_BINDING_RESOURCE_ASSERTION_SCHEMA = v.custom<
  ProductWorkspaceBindingResourceAssertion
>(validBindResourceStructure, "product_workspace_binding_resource_assertion");

function validateBindResources(
  call: DefinitionCall<BindPacket, ProductWorkspaceBindingResourceAssertion>,
): PreDefinitionExecutionFault<BindPacket["definitionKey"]> | null {
  const resources = call.resources;
  if (!validBindResourceStructure(resources)) {
    return bindFault(
      call,
      "resource_admission",
      "invalid_resource_assertion",
      "workspace binding requires exact authority, admitted installs, lock, roots, and ABG prefix",
    );
  }
  const request = call.invocation.request;
  const installCoordinates = resources.admittedInstalls.map(productInstallCoordinate);
  if (
    !sameCoordinate(
      request.workspaceAuthority,
      workspaceAuthorityCoordinate(resources.workspaceAuthority),
    ) ||
    !sameJson(request.installedSet, installCoordinates) ||
    !sameCoordinate(request.resolvedLock, resolvedLockCoordinate(resources.resolvedLock)) ||
    !sameJson(
      [...request.declaredRoots].sort((left, right) =>
        compareUnicodeCodeUnits(left.rootKind, right.rootKind)
      ),
      declaredRootRows(resources.declaredRoots).sort((left, right) =>
        compareUnicodeCodeUnits(left.rootKind, right.rootKind)
      ),
    )
  ) {
    return bindFault(
      call,
      "resource_admission",
      "resource_relation_mismatch",
      "workspace binding resources differ from the admitted request or invocation basis",
    );
  }
  return null;
}

function bindRefusalCode(refusal: EnvironmentRefusal): BindRefusalCode {
  switch (refusal.code) {
    case "empty_product_set":
    case "duplicate_install":
      return "product_mismatch";
    case "lock_mismatch":
      return "lock_mismatch";
    case "invalid_workspace_authority":
      return "workspace_mismatch";
    case "invalid_declared_root":
      return "root_mismatch";
    case "incompatible_dependency":
      return "incompatible";
    case "invalid_dependency":
    case "unresolved_dependency":
    case "ambiguous_dependency":
    case "cyclic_dependency":
      throw new TypeError(`workspace binding returned impossible refusal ${refusal.code}`);
  }
}

function bindingRefusal(
  code: BindRefusalCode,
  issuePath: string,
  evidenceRefs: readonly string[] = [],
): OwnerSemanticOutput<BindPacket> {
  return {
    outcomeKind: "refusal",
    value: { code, issuePaths: [issuePath], evidenceRefs },
  } as OwnerSemanticOutput<BindPacket>;
}

function bindReceipt(
  resources: ProductWorkspaceBindingResourceAssertion,
  eventResource: AbgEventResourceReceipt,
  binding: WorkspaceBinding | WorkspaceBindingCandidate | null,
): ProductWorkspaceBindingResourceReceipt {
  return deepFreeze({
    kind: "product_workspace_binding_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    eventResource,
    workspaceAuthority: workspaceAuthorityCoordinate(resources.workspaceAuthority),
    admittedInstalls: resources.admittedInstalls.map(productInstallCoordinate),
    resolvedLock: resolvedLockCoordinate(resources.resolvedLock),
    binding: binding === null ? null : workspaceBindingCoordinate(binding),
  });
}

const bindOwner: ExactDefinitionCallable<
  BindPacket,
  ProductWorkspaceBindingResourceAssertion,
  ProductWorkspaceBindingResourceReceipt
> = (call) => {
  const resourceFault = validateBindResources(call);
  if (resourceFault !== null) return Effect.fail(resourceFault);
  return Effect.try({
    try: (): DefinitionReturn<BindPacket, ProductWorkspaceBindingResourceReceipt> => {
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      if (acquired.kind !== "acquired_abg_event_resource") {
        throw bindFault(
          call,
          "resource_acquisition",
          acquired.code,
          acquired.message,
        );
      }
      const resource = acquired.resource;
      let admissionCandidate: WorkspaceBindingCandidate | null = null;
      let admittedBinding: WorkspaceBinding | null = null;
      let latestPrefix = resource.entryPrefix;
      let issuedEventResource: AbgEventResourceReceipt | null = null;
      let closeAttempted = false;
      const markCloseAttempt = (): void => {
        closeAttempted = true;
      };
      try {
        const nativePacket: WorkspaceBindingPacket = {
          kind: "workspace_binding_packet",
          schemaVersion: "5.0.0",
          memberKey: "bind",
          admittedInstalls: call.resources.admittedInstalls,
          resolvedLock: call.resources.resolvedLock,
          authority: {
            workspaceId: call.resources.workspaceAuthority.workspaceId,
            canonicalRoot: call.resources.workspaceAuthority.canonicalRoot,
            authorityMode: call.resources.workspaceAuthority.authorityMode,
            authorizedActorRef: call.resources.workspaceAuthority.authorizedActorRef,
            authorityManifestRef: call.resources.workspaceAuthority.authorityManifestRef,
            authorityManifestDigest:
              call.resources.workspaceAuthority.authorityManifestDigest,
          },
          roots: call.resources.declaredRoots,
        };
        const candidate = ProductEnvironmentPort.bindWorkspace(nativePacket);
        if (candidate.kind === "environment_refusal") {
          const ownerOutput = bindingRefusal(
            bindRefusalCode(candidate),
            "/request",
          );
          markCloseAttempt();
          const eventResource = closeAbgEventResource(
            resource,
            resource.entryPrefix,
          );
          issuedEventResource = eventResource;
          return deepFreeze({
            ownerOutput,
            resources: bindReceipt(
              call.resources,
              eventResource,
              null,
            ),
          });
        }
        admissionCandidate = candidate;
        const invocationCoordinate = constructExactOperationInvocationCoordinate(
          {
            operationId: "abg.operation.workspace.bind",
            memberKey: "bind",
            definitionDigest: call.invocation.definitionDigest,
          },
          call.invocation.invocationRef,
          call.invocation.requestDigest,
        );
        const admissionBasis: ArtifactAdmissionBasis = deepFreeze({
          ...invocationCoordinate,
          operationId: "abg.operation.workspace.bind" as const,
          memberKey: "bind" as const,
          authorityScopeRef: candidate.bindingId,
          authorityScopeDigest: candidate.bindingDigest,
          correlationId: call.invocation.correlationRef,
          eventTime: call.invocation.eventTime,
          causationEventRefs: call.resources.admittedInstalls.map(
            ({ admissionEventRef }) => admissionEventRef,
          ),
          predecessorPrefix: resource.entryPrefix,
        });
        const admitted = admitWorkspaceBinding(
          resource.store,
          candidate,
          admissionBasis,
          call.resources.workspaceAuthority,
        );
        if (admitted.kind === "artifact_owner_coordinate_refusal") {
          throw bindFault(
            call,
            "abg_admission",
            "workspace_binding_coordinate_refusal",
            canonicalJson(admitted.refusal as unknown as JsonValue),
          );
        }
        if (admitted.kind === "artifact_owner_refusal") {
          const code = admitted.refusal.code === "artifact_truth_conflict" ||
              admitted.refusal.code === "duplicate_invocation"
            ? "binding_conflict" as const
            : admitted.refusal.code === "scope_mismatch"
            ? "product_mismatch" as const
            : null;
          if (code === null) {
            throw bindFault(
              call,
              "abg_admission",
              "workspace_binding_admission_relation_failure",
              admitted.refusal.message,
            );
          }
          const ownerOutput = bindingRefusal(
            code,
            code === "binding_conflict" ? "/binding" : "/installedSet",
          );
          markCloseAttempt();
          const eventResource = closeAbgEventResource(
            resource,
            admitted.successorPrefix,
          );
          issuedEventResource = eventResource;
          return deepFreeze({
            ownerOutput,
            resources: bindReceipt(
              call.resources,
              eventResource,
              null,
            ),
          });
        }
        admittedBinding = admitted.value;
        latestPrefix = admitted.successorPrefix;
        const binding = projectAdmittedWorkspaceBinding(
          admitted.artifactTruth,
          candidate,
          call.invocation.invocationRef,
        );
        if (
          binding === null ||
          canonicalJson(binding as unknown as JsonValue) !==
            canonicalJson(admitted.value as unknown as JsonValue)
        ) {
          throw new TypeError(
            "admitted workspace binding differs from exact-prefix ABG projection truth",
          );
        }
        const ownerOutput = {
          outcomeKind: "result",
          value: {
            binding: workspaceBindingCoordinate(binding),
            installedSet: call.invocation.request.installedSet,
            resolvedLock: call.invocation.request.resolvedLock,
            declaredRoots: call.invocation.request.declaredRoots,
            provenance: [{
              ref: admitted.artifactTruth.projectionRef,
              digest: admitted.artifactTruth.projectionDigest,
            }],
          },
        } as OwnerSemanticOutput<BindPacket>;
        markCloseAttempt();
        const eventResource = closeAbgEventResource(
          resource,
          admitted.successorPrefix,
        );
        issuedEventResource = eventResource;
        return deepFreeze({
          ownerOutput,
          resources: bindReceipt(
            call.resources,
            eventResource,
            binding,
          ),
        });
      } catch (cause) {
        const admittedFault = admittedEnvironmentFault(
          cause,
          call.invocation.definitionKey,
          PRODUCT_WORKSPACE_BINDING_RESOURCE_RECEIPT_SCHEMA,
        );
        if (
          admittedFault !== null &&
          admittedFault.faultBoundary !== "pre_acquisition_or_pre_append"
        ) {
          throw admittedFault;
        }
        if (cause instanceof AbgEventResourceCloseFailure) {
          throw postAppendDefinitionFault(
            call.invocation.definitionKey,
            "resource_close",
            "workspace_binding_resource_close_failure",
            cause.failureMessage,
            bindReceipt(
              call.resources,
              cause.resourceReceipt,
              admittedBinding,
            ),
          );
        }
        if (closeAttempted || issuedEventResource !== null) throw cause;
        if (
          admittedBinding !== null ||
          (cause instanceof ArtifactAdmissionPostAppendFailure &&
            admissionCandidate !== null)
        ) {
          markCloseAttempt();
          let eventResource: AbgEventResourceReceipt;
          let outwardCause = cause;
          try {
            eventResource = closeAbgEventResource(
              resource,
              cause instanceof ArtifactAdmissionPostAppendFailure
                ? cause.successorPrefix
                : latestPrefix,
            );
          } catch (closeCause) {
            if (!(closeCause instanceof AbgEventResourceCloseFailure)) {
              throw new AggregateError(
                [cause, closeCause],
                "Workspace binding Cause and ABG cleanup close both failed",
              );
            }
            eventResource = closeCause.resourceReceipt;
            outwardCause = new AggregateError(
              [cause, closeCause],
              "Workspace binding Cause and ABG cleanup close both failed",
            );
          }
          throw new DefinitionPostAppendCause(
            outwardCause,
            bindReceipt(
              call.resources,
              eventResource,
              admittedBinding ?? admissionCandidate,
            ),
          );
        }
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => {
      const admittedFault = admittedEnvironmentFault(
        cause,
        call.invocation.definitionKey,
        PRODUCT_WORKSPACE_BINDING_RESOURCE_RECEIPT_SCHEMA,
      );
      if (admittedFault !== null) return admittedFault;
      throw cause;
    },
  });
};

const bind = bindExactPrefixTransition(
  PRODUCT_ENVIRONMENT_CONTRACTS.bind,
  bindOwner,
  PRODUCT_WORKSPACE_BINDING_RESOURCE_ASSERTION_SCHEMA,
  PRODUCT_WORKSPACE_BINDING_RESOURCE_RECEIPT_SCHEMA,
);

export const PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS = Object.freeze({
  resolve,
  bind,
});
