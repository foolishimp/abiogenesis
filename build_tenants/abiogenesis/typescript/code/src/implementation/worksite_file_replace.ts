import { lstat, readFile, readdir, readlink, realpath } from "node:fs/promises";
import { resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectCCallCarrierPhaseAtPrefix } from "../abg/c_call.js";
import {
  constructWorksiteObservationCurrentFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "../abg/event_calculus.js";
import {
  rehydrateAdmittedImplementationSetAtPrefix,
  rehydrateExecutionBasisAtPrefix,
} from "../abg/execution_basis.js";
import { projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import {
  readRuntimeEventsAtDurablePrefix,
  validateDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import {
  constructWorksiteEffectAuthorization,
  isWorksiteFileReplaceRequest,
  observeWorksiteSubject,
  replaceWorksiteFile,
} from "../product/index.js";
import type {
  FileWorksiteObservation,
  WorksiteFileReplaceReceipt,
} from "../product/worksite_effect.js";
import {
  WORKSITE_FILE_REPLACE_EFFECT_URI,
  WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
  WORKSITE_FILE_REPLACE_HANDLER_REF,
} from "../product/worksite_effect.js";
import type {
  LeafExecutionOccurrence,
  LeafInvocationResolution,
  LeafRealizationCandidate,
} from "./contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import {
  isWorksiteFileReplaceOutput,
  WORKSITE_C0_IDS,
} from "../gtl/worksite_c0.js";
import { isLeafExecutionAuthority } from "./leaf_execution_authority.js";

export const WORKSITE_C0_IMPLEMENTATION = Object.freeze({
  implementationRef: "implementation://abiogenesis/worksite/file-replace-fd@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/worksite/file-replace-fd@5",
  inputContractRef: "contract://abiogenesis/worksite/file-replace-input@5",
  outputContractRef: "contract://abiogenesis/worksite/file-replace-output@5",
  failureContractRef: "contract://abiogenesis/worksite/file-replace-failure@5",
  refusalContractRef: "contract://abiogenesis/worksite/file-replace-refusal@5",
});

const descriptorBody = {
  implementationRef: WORKSITE_C0_IMPLEMENTATION.implementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/worksite_file_replace.js",
  namedSymbol: "realizeWorksiteFileReplace",
  computeRegime: "F_D" as const,
  inputContractRef: WORKSITE_C0_IMPLEMENTATION.inputContractRef,
  outputContractRef: WORKSITE_C0_IMPLEMENTATION.outputContractRef,
  failureContractRef: WORKSITE_C0_IMPLEMENTATION.failureContractRef,
  refusalContractRef: WORKSITE_C0_IMPLEMENTATION.refusalContractRef,
};

export const WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
}) as PackagedLeafImplementationDescriptor;

export interface UnadmittedPhysicalCommit {
  readonly kind: "unadmitted_physical_commit";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "unadmitted_physical_commit";
  readonly cCallRef: string;
  readonly receipt: Readonly<WorksiteFileReplaceReceipt>;
  readonly receiptRef: string;
  readonly receiptDigest: `sha256:${string}`;
  readonly successorObservation: Readonly<FileWorksiteObservation>;
  readonly successorObservationRef: string;
  readonly successorObservationDigest: `sha256:${string}`;
  readonly refusedExpectedPrefix: Readonly<DurablePrefixCoordinate>;
  readonly diagnosticRef: string;
}

export function unadmittedPhysicalCommit(
  cCallRef: string,
  value: unknown,
  refusedExpectedPrefix: unknown,
): Readonly<UnadmittedPhysicalCommit> | null {
  if (
    !isWorksiteFileReplaceOutput(value) ||
    !validateDurablePrefixCoordinate(refusedExpectedPrefix)
  ) return null;
  const output = value as Readonly<{
    receipt: Readonly<WorksiteFileReplaceReceipt>;
    successorObservation: Readonly<FileWorksiteObservation>;
  }>;
  return deepFreeze({
    kind: "unadmitted_physical_commit" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "unadmitted_physical_commit" as const,
    cCallRef,
    receipt: output.receipt,
    receiptRef: output.receipt.receiptRef,
    receiptDigest: output.receipt.receiptDigest,
    successorObservation: output.successorObservation,
    successorObservationRef: output.successorObservation.observationRef,
    successorObservationDigest: output.successorObservation.observationDigest,
    refusedExpectedPrefix,
    diagnosticRef: "diagnostic://abiogenesis/worksite/unadmitted-physical-commit@5",
  });
}

async function installedProductInventory(rootValue: string): Promise<JsonValue> {
  const root = resolve(rootValue);
  const rootStatus = await lstat(root);
  if (root !== rootValue || rootStatus.isSymbolicLink() ||
    !rootStatus.isDirectory() || await realpath(root) !== root) {
    throw new TypeError("installed Product root must be one canonical concrete directory");
  }
  const rows: JsonValue[] = [];
  const visit = async (directory: string, relativeDirectory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relativePath = relativeDirectory.length === 0
        ? entry.name
        : `${relativeDirectory}/${entry.name}`;
      const path = resolve(directory, entry.name);
      const status = await lstat(path);
      if (status.isSymbolicLink()) {
        const target = await readlink(path);
        rows.push({
          relativePath,
          nodeKind: "symlink",
          symlinkTarget: target,
          byteLength: null,
          digest: sha256Bytes(Buffer.from(target, "utf8")),
          fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
        });
      } else if (status.isDirectory()) {
        rows.push({
          relativePath,
          nodeKind: "directory",
          symlinkTarget: null,
          byteLength: null,
          digest: sha256Bytes(Buffer.from("directory", "utf8")),
          fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
        });
        await visit(path, relativePath);
      } else if (status.isFile()) {
        const bytes = await readFile(path);
        rows.push({
          relativePath,
          nodeKind: "file",
          symlinkTarget: null,
          byteLength: bytes.byteLength,
          digest: sha256Bytes(bytes),
          fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
        });
      } else {
        throw new TypeError("installed Product inventory encountered a special node");
      }
    }
  };
  await visit(root, "");
  return rows;
}

function productConservationFailure(
  resolution: Readonly<LeafInvocationResolution>,
  inputDigest: `sha256:${string}`,
): Readonly<LeafRealizationCandidate> {
  const resultCandidate = deepFreeze({
    kind: "worksite_effect_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code: "filesystem_refused" as const,
    message: "installed Product changed during worksite replacement",
    lastObservation: null,
    substrateCode: null,
    diagnosticRef:
      "diagnostic://abiogenesis/worksite/installed-product-delta@5",
  }) as unknown as Readonly<Record<string, JsonValue>>;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: resolution.implementationRef,
      inputDigest,
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
    diagnosticRef: resultCandidate.diagnosticRef as string,
  });
}

/**
 * The selected packaged F_D leaf.  It has no ambient filesystem authority:
 * the Product owner receives only the exact values carried by the HoG-built
 * LeafExecutionAuthority.
 */
export async function realizeWorksiteFileReplace(
  value: Readonly<Record<string, JsonValue>>,
  occurrence: Readonly<LeafExecutionOccurrence>,
  resolution: Readonly<LeafInvocationResolution>,
  inputDigest: `sha256:${string}`,
): Promise<Readonly<LeafRealizationCandidate> | null> {
  const authority = occurrence.executionAuthority;
  if (
    !isLeafExecutionAuthority(authority) ||
    !isWorksiteFileReplaceRequest(value)
  ) return null;
  const selected = authority.implementationResolution;
  const exactInputDigest = sha256Canonical(value as unknown as JsonValue);
  const exactResolutionDigest = sha256Canonical(
    resolution as unknown as JsonValue,
  );
  let currentAuthority = false;
  let localExecutionBasis: ReturnType<
    typeof rehydrateExecutionBasisAtPrefix
  > = null;
  let localImplementationSet: ReturnType<
    typeof rehydrateAdmittedImplementationSetAtPrefix
  > = null;
  let installedProductRoot: string | null = null;
  try {
    const events = readRuntimeEventsAtDurablePrefix(
      authority.predecessorPrefix,
      { requireCurrent: true },
    );
    const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
    const runtimePrefix = selectValidatedRuntimeEventPrefix(events, {
      runId: authority.cCall.runId,
    });
    const projectedExecutionBasis = rehydrateExecutionBasisAtPrefix(
      authorityPrefix,
      authority.executionBasisRef,
    );
    const projectedImplementationSet =
      rehydrateAdmittedImplementationSetAtPrefix(
        authorityPrefix,
        authority.implementationSetRef,
      );
    const environment = projectExactPrefixWorkspaceEnvironment(
      authority.predecessorPrefix,
      {
        ref: authority.workspaceBindingIdentity,
        digest: authority.workspaceBindingDigest,
      },
    );
    const executionBasisHeld = projectedExecutionBasis !== null &&
      sha256Canonical(projectedExecutionBasis as unknown as JsonValue) ===
        sha256Canonical(authority.executionBasis as unknown as JsonValue);
    const implementationSetHeld = projectedImplementationSet !== null &&
      sha256Canonical(projectedImplementationSet as unknown as JsonValue) ===
        sha256Canonical(authority.implementationSet as unknown as JsonValue);
    const phase = projectCCallCarrierPhaseAtPrefix(
      runtimePrefix,
      authority.cCall,
    )?.phase ?? null;
    const observationHeld = holdsAt(
        deriveRuntimeEventCalculusProjection(runtimePrefix),
        constructWorksiteObservationCurrentFluent(
          value.predecessorObservation.observationRef,
        ),
      );
    localExecutionBasis = executionBasisHeld ? projectedExecutionBasis : null;
    localImplementationSet = implementationSetHeld
      ? projectedImplementationSet
      : null;
    const ownerInstalls = environment.kind ===
        "exact_prefix_workspace_environment" &&
        selected.graphFunctionOwnerProductId ===
          selected.implementationOwnerProductId
      ? environment.productInstalls.filter((install) => {
          const graphFunctionRows = install.contributionManifest.rows.filter(
            (row) =>
              row.kind === "graph_function" &&
              row.declarationOrContractRef === selected.graphFunctionRef &&
              row.owningProductId === selected.graphFunctionOwnerProductId &&
              row.programMembershipRefs.filter((ref) =>
                ref === authority.programRef
              ).length === 1,
          );
          return install.productId === selected.graphFunctionOwnerProductId &&
            install.packageName === selected.packageName &&
            install.packageVersion === selected.packageVersion &&
            install.installedRoot ===
              environment.workspaceBinding.roots.productRoot &&
            install.contributionManifest.productId === install.productId &&
            install.contributionManifest.productVersion ===
              install.packageVersion &&
            graphFunctionRows.length === 1 &&
            install.contributionManifest.publicationBindings.filter((binding) =>
              binding.moduleRef === graphFunctionRows[0]!.moduleRef &&
              binding.publicationDigest ===
                selected.graphFunctionPublicationDigest
            ).length === 1 &&
            install.contributionManifest.publicationBindings.filter((binding) =>
              binding.publicationDigest ===
                selected.implementationPublicationDigest
            ).length === 1;
        })
      : [];
    const environmentHeld = environment.kind ===
        "exact_prefix_workspace_environment" &&
      canonicalJson(environment.workspaceAuthorityBasis as unknown as JsonValue) ===
        canonicalJson(value.workspaceAuthorityBasis as unknown as JsonValue) &&
      canonicalJson(environment.workspaceBinding as unknown as JsonValue) ===
        canonicalJson(authority.workspaceBinding as unknown as JsonValue) &&
      ownerInstalls.length === 1;
    installedProductRoot = environmentHeld
      ? ownerInstalls[0]!.installedRoot
      : null;
    currentAuthority = executionBasisHeld && implementationSetHeld &&
      environmentHeld && phase === "selected_no_evidence" && observationHeld;
  } catch {
    currentAuthority = false;
  }
  if (
    !currentAuthority ||
    localExecutionBasis === null ||
    localImplementationSet === null ||
    installedProductRoot === null ||
    exactInputDigest !== inputDigest ||
    exactInputDigest !== authority.executionBasis.rawInputDigest ||
    sha256Canonical(
      authority.executionBasis.rawInputValue as unknown as JsonValue,
    ) !== inputDigest ||
    exactResolutionDigest !== authority.implementationResolutionDigest ||
    authority.cCallRef !== occurrence.cCallRef ||
    authority.cCall.runId !== occurrence.runId ||
    authority.cCall.graphCallId !== occurrence.graphCallId ||
    authority.cCall.frameId !== occurrence.frameId ||
    authority.cCall.programLocusRef !== occurrence.programLocusRef ||
    authority.cCall.taskOrdinal !== occurrence.taskOrdinal ||
    authority.cCall.attempt !== occurrence.attempt ||
    authority.cCall.callClass !== "leaf" ||
    authority.cCall.regime !== "F_D" ||
    authority.cCall.basisId !== authority.executionBasisRef ||
    authority.cCall.graphFunctionRef !== authority.graphFunctionRef ||
    authority.cCall.implementationSetRef !== authority.implementationSetRef ||
    authority.cCall.programLocusRef !== selected.programLocusRef ||
    authority.cCall.implementationRequirementKey !== selected.requirementKey ||
    authority.cCall.implementationBindingRef !==
      selected.implementationBindingRef ||
    authority.cCall.implementationRef !== selected.implementationRef ||
    authority.cCall.inputContractRef !== selected.inputContractRef ||
    authority.cCall.outputContractRef !== selected.outputContractRef ||
    authority.cCall.failureContractRef !== selected.failureContractRef ||
    authority.cCall.refusalContractRef !== selected.refusalContractRef ||
    authority.graphFunctionRef !== WORKSITE_C0_IDS.graphFunctionRef ||
    authority.graphFunctionRef !== selected.graphFunctionRef ||
    authority.graphFunctionDigest !== selected.graphFunctionDigest ||
    authority.programRef !== authority.executionBasis.programRef ||
    authority.programDigest !== authority.executionBasis.programDigest ||
    authority.graphFunctionRef !== authority.executionBasis.graphFunctionRef ||
    authority.graphFunctionDigest !==
      authority.executionBasis.graphFunctionDigest ||
    authority.implementationSetRef !==
      authority.executionBasis.implementationSetRef ||
    authority.implementationSetDigest !==
      authority.executionBasis.implementationSetDigest ||
    authority.implementationBindingRef !==
      WORKSITE_C0_IMPLEMENTATION.implementationBindingRef ||
    selected.implementationBindingRef !==
      WORKSITE_C0_IMPLEMENTATION.implementationBindingRef ||
    authority.implementationRef !== WORKSITE_C0_IMPLEMENTATION.implementationRef ||
    selected.implementationRef !== WORKSITE_C0_IMPLEMENTATION.implementationRef ||
    selected.implementationDescriptorDigest !==
      WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.descriptorDigest ||
    selected.packageName !== WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.packageName ||
    selected.packageVersion !==
      WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.packageVersion ||
    selected.modulePath !== WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.modulePath ||
    selected.namedSymbol !== WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.namedSymbol ||
    selected.computeRegime !== WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR.computeRegime ||
    selected.inputContractRef !== WORKSITE_C0_IMPLEMENTATION.inputContractRef ||
    selected.outputContractRef !== WORKSITE_C0_IMPLEMENTATION.outputContractRef ||
    selected.failureContractRef !== WORKSITE_C0_IMPLEMENTATION.failureContractRef ||
    selected.refusalContractRef !== WORKSITE_C0_IMPLEMENTATION.refusalContractRef ||
    value.workspaceBindingIdentity !== authority.workspaceBindingIdentity ||
    value.workspaceBindingDigest !== authority.workspaceBindingDigest ||
    value.capabilityGrant.actorRef !== authority.actorRef ||
    value.capabilityGrant.grantRef !== authority.capabilityGrantRef ||
    value.capabilityGrant.grantDigest !== authority.capabilityGrantDigest ||
    value.capabilityGrant.scopeRef !== authority.workspaceBindingIdentity ||
    value.capabilityGrant.scopeDigest !== authority.workspaceBindingDigest ||
    authority.executionBasis.actorRef !== authority.actorRef ||
    authority.actorRef !== authority.workspaceBinding.authorizedActorRef ||
    authority.workspaceBinding.bindingId !== authority.workspaceBindingIdentity ||
    authority.workspaceBinding.bindingDigest !== authority.workspaceBindingDigest ||
    authority.effectUri !== WORKSITE_FILE_REPLACE_EFFECT_URI ||
    authority.handlerRef !== WORKSITE_FILE_REPLACE_HANDLER_REF ||
    authority.handlerDigest !== WORKSITE_FILE_REPLACE_HANDLER_DIGEST
  ) return null;
  let productInventoryBefore: JsonValue;
  try {
    productInventoryBefore = await installedProductInventory(installedProductRoot);
  } catch {
    return productConservationFailure(resolution, inputDigest);
  }
  const authorization = constructWorksiteEffectAuthorization({
    workspaceBinding: authority.workspaceBinding,
    request: value,
    executionBasis: localExecutionBasis,
    cCall: authority.cCall,
    implementationSet: localImplementationSet,
  });
  if (authorization.kind === "worksite_effect_refusal") {
    const resultCandidate = deepFreeze({
      ...authorization,
      diagnosticRef: `diagnostic://abiogenesis/worksite/${authorization.code}@5`,
    }) as unknown as Readonly<Record<string, JsonValue>>;
    return deepFreeze({
      kind: "leaf_realization_candidate" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "failure" as const,
      evidenceCandidates: [
        {
          kind: "deterministic_evidence_candidate" as const,
          schemaVersion: "5.0.0" as const,
          implementationRef: resolution.implementationRef,
          inputDigest,
          outputDigest: sha256Canonical(resultCandidate),
        },
      ],
      resultCandidate,
      diagnosticRef: resultCandidate.diagnosticRef as string,
    });
  }
  const outcome = await replaceWorksiteFile({
    workspaceAuthorityBasis: value.workspaceAuthorityBasis,
    workspaceBinding: authority.workspaceBinding,
    request: value,
    executionBasis: localExecutionBasis,
    cCall: authority.cCall,
    implementationSet: localImplementationSet,
    authorization,
  });
  let productInventoryAfter: JsonValue;
  try {
    productInventoryAfter = await installedProductInventory(installedProductRoot);
  } catch {
    return productConservationFailure(resolution, inputDigest);
  }
  if (canonicalJson(productInventoryBefore) !==
    canonicalJson(productInventoryAfter)) {
    return productConservationFailure(resolution, inputDigest);
  }
  if (outcome.kind === "worksite_effect_refusal") {
    const resultCandidate = deepFreeze({
      ...outcome,
      diagnosticRef: `diagnostic://abiogenesis/worksite/${outcome.code}@5`,
    }) as unknown as Readonly<Record<string, JsonValue>>;
    return deepFreeze({
      kind: "leaf_realization_candidate" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "failure" as const,
      evidenceCandidates: [
        {
          kind: "deterministic_evidence_candidate" as const,
          schemaVersion: "5.0.0" as const,
          implementationRef: resolution.implementationRef,
          inputDigest,
          outputDigest: sha256Canonical(resultCandidate),
        },
      ],
      resultCandidate,
      diagnosticRef: resultCandidate.diagnosticRef as string,
    });
  }
  const successor = await observeWorksiteSubject(
    value.workspaceAuthorityBasis,
    authority.workspaceBinding,
    value.subject,
  );
  if (successor.kind !== "worksite_observation" ||
    canonicalJson(successor as unknown as JsonValue) !==
      canonicalJson(outcome.successorObservation as unknown as JsonValue)) {
    return productConservationFailure(resolution, inputDigest);
  }
  const resultCandidate = deepFreeze({
    kind: "worksite_file_replace_output" as const,
    schemaVersion: "5.0.0" as const,
    authorization,
    receipt: outcome.receipt,
    successorObservation: outcome.successorObservation,
  }) as unknown as Readonly<Record<string, JsonValue>>;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [
      {
        kind: "deterministic_evidence_candidate" as const,
        schemaVersion: "5.0.0" as const,
        implementationRef: resolution.implementationRef,
        inputDigest,
        outputDigest: sha256Canonical(resultCandidate),
      },
    ],
    resultCandidate,
  });
}
