// The empty imports below keep this module's load order as it was; the
// worksite leaf gate, now in ./leaf_execution_authority.js, uses these modules.
import {} from "../abg/invocation_admission.js";

import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {} from "../abg/c_call.js";
import {} from "../abg/event_calculus.js";
import {} from "../abg/execution_basis.js";
import {} from "../abg/environment_admission.js";
import {} from "../abg/event_prefix.js";
import {
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
} from "../product/index.js";
import { walkTree } from "../product/tree_inventory.js";
import type {
  FileWorksiteObservation,
  WorksiteFileReplaceReceipt,
  WorksitePostPublicationFailure,
  WorksiteEffectAuthorization,
  WorksitePostPublicationDiagnostic,
  WorksiteObservation,
  CompletedWorksiteOwner,
} from "../product/worksite_effect.js";
import {
  isWorksitePostPublicationFailure,
  postPublicationWorksiteFailure,
  worksiteFailureAuthorization,
  worksiteRefusal,
  constructWorksiteFileParentsAuthorization,
  isWorksiteFileParentsRequest,
  isWorksiteFileParentsSuccess,
  isWorksiteFileParentsFailure,
  worksiteFileParentsFailure,
  type WorksiteFileParentsFailure,
  type WorksiteFileParentsSuccess,
  type WorksiteFileParentsResult,
} from "../product/worksite_effect.js";
import type { WorksiteFileReplaceResult } from "../product/worksite_operations.js";
import { replaceWorksiteFile, createWorksiteFileParents } from "../product/worksite_operations.js";
import type {
  LeafExecutionOccurrence,
  LeafInvocationResolution,
  LeafRealizationCandidate,
} from "./contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import {
  isWorksiteFileReplaceOutput,
  WORKSITE_C0_IDS,
  WORKSITE_FILE_PARENTS_IDS,
} from "../gtl/worksite_c0.js";
import { isLeafExecutionAuthority, openWorksiteLeafGate, type WorksiteLeafHold } from "./leaf_execution_authority.js";
import { canonicalEquals } from "../shared/value/index.js";

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

interface UnadmittedCompletedWorksiteCommit {
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

export type UnadmittedPhysicalCommit = UnadmittedCompletedWorksiteCommit | Readonly<{
  kind: "unadmitted_physical_commit";
  schemaVersion: "5.0.0";
  disposition: "unadmitted_physical_commit";
  cCallRef: string;
  ownerOutcome: WorksitePostPublicationFailure;
  refusedExpectedPrefix: Readonly<DurablePrefixCoordinate>;
  diagnosticRef: string;
}> | Readonly<{
  kind: "unadmitted_physical_commit";
  schemaVersion: "5.0.0";
  disposition: "unadmitted_physical_commit";
  cCallRef: string;
  ownerOutcome: WorksiteFileParentsSuccess | WorksiteFileParentsFailure;
  refusedExpectedPrefix: Readonly<DurablePrefixCoordinate>;
  diagnosticRef: string;
}>;

export function unadmittedPhysicalCommit(
  cCallRef: string,
  value: unknown,
  refusedExpectedPrefix: unknown,
): Readonly<UnadmittedPhysicalCommit> | null {
  if (isWorksiteFileParentsSuccess(value) || isWorksiteFileParentsFailure(value)) {
    const authorization = value.kind === "worksite_file_parents_result" ? value.authorization : value.physicalOutcome.authorization;
    const outcomes = value.kind === "worksite_file_parents_result" ? value.receipt.outcomes : value.physicalOutcome.outcomes;
    if (authorization.cCallRef !== cCallRef || !outcomes.some(outcome => outcome.disposition === "created") ||
      !validateDurablePrefixCoordinate(refusedExpectedPrefix)) return null;
    return deepFreeze({ kind: "unadmitted_physical_commit", schemaVersion: "5.0.0", disposition: "unadmitted_physical_commit",
      cCallRef, ownerOutcome: value, refusedExpectedPrefix, diagnosticRef: "diagnostic://abiogenesis/worksite/unadmitted-file-parents@5" });
  }
  if (isWorksitePostPublicationFailure(value) &&
    worksiteFailureAuthorization(value).cCallRef === cCallRef &&
    validateDurablePrefixCoordinate(refusedExpectedPrefix)) {
    return deepFreeze({
      kind: "unadmitted_physical_commit" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "unadmitted_physical_commit" as const,
      cCallRef, ownerOutcome: value, refusedExpectedPrefix,
      diagnosticRef: "diagnostic://abiogenesis/worksite/unadmitted-physical-commit@5",
    });
  }
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
  return walkTree(rootValue, {
    rootRefusal: "installed Product root must be one canonical concrete directory",
    specialNodeRefusal: "installed Product inventory encountered a special node",
  });
}

function productConservationFailure(
  resolution: Readonly<LeafInvocationResolution>,
  inputDigest: `sha256:${string}`,
  retained?: Readonly<{
    outcome: WorksiteFileReplaceResult;
    authorization: WorksiteEffectAuthorization;
    completedOwner: CompletedWorksiteOwner | null;
    stage: "product_inventory" | "owner_reobservation";
    message: string;
    substrateCode: string | null;
    observation: WorksiteObservation | null;
  }>,
): Readonly<LeafRealizationCandidate> {
  const failure = worksiteRefusal("filesystem_refused",
    retained?.message ?? "installed Product conservation could not be verified before worksite replacement",
    retained?.observation ?? null, retained?.substrateCode ?? null);
  const diagnostic: WorksitePostPublicationDiagnostic = {
    stage: retained?.stage ?? "product_inventory", code: failure.code,
    message: failure.message, substrateCode: failure.substrateCode,
  };
  const outcome = retained?.outcome;
  const preserved = isWorksitePostPublicationFailure(outcome)
    ? postPublicationWorksiteFailure(outcome, {
        ...outcome.physicalOutcome,
        postPublicationObservation: retained?.observation ?? outcome.physicalOutcome.postPublicationObservation,
        diagnostics: [...outcome.physicalOutcome.diagnostics, diagnostic],
      })
    : retained?.completedOwner !== null && retained?.completedOwner !== undefined
      ? postPublicationWorksiteFailure(failure, {
          kind: "owner_completed",
          completedOwner: retained.completedOwner,
          postPublicationObservation: retained.observation,
          diagnostics: [diagnostic],
        })
      : outcome?.kind === "worksite_effect_refusal" ? outcome : failure;
  const resultCandidate = deepFreeze({
    ...preserved,
    diagnosticRef:
      `diagnostic://abiogenesis/worksite/${preserved.code}@5`,
  });
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
  // Both digests are taken before the reads, so a throw from either leaves here.
  const digests = { request: sha256Canonical(value), resolution: sha256Canonical(resolution) };
  const gate = openWorksiteLeafGate({ effect: "file_replace", authority, request: value, occurrence, resolution, inputDigest, digests,
    realizer: { graphFunctionRef: WORKSITE_C0_IDS.graphFunctionRef,
      implementationBindingRef: WORKSITE_C0_IMPLEMENTATION.implementationBindingRef,
      descriptor: WORKSITE_FILE_REPLACE_IMPLEMENTATION_DESCRIPTOR } });
  let hold: WorksiteLeafHold | null;
  try {
    hold = gate.current();
  } catch {
    hold = null;
  }
  if (hold === null || !gate.coordinates() || !gate.remaining()) return null;
  const { executionBasis: localExecutionBasis, implementationSet: localImplementationSet,
    conservationRoots, protectedInstallRoots } = hold;
  let productInventoryBefore: JsonValue;
  try {
    productInventoryBefore = await Promise.all(conservationRoots.map(async (root) => ({ root, inventory: await installedProductInventory(root) })));
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
    });
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
    protectedInstallRoots,
  });
  const completedOwner = outcome.kind === "worksite_file_replace_result"
    ? deepFreeze({ authorization, receipt: outcome.receipt, successorObservation: outcome.successorObservation })
    : null;
  let productInventoryAfter: JsonValue;
  try {
    productInventoryAfter = await Promise.all(conservationRoots.map(async (root) => ({ root, inventory: await installedProductInventory(root) })));
  } catch (error) {
    return productConservationFailure(resolution, inputDigest, {
      outcome, authorization, completedOwner, stage: "product_inventory",
      message: `post-publication installed Product conservation unverified: ${String(error)}`,
      substrateCode: typeof (error as NodeJS.ErrnoException)?.code === "string" ? (error as NodeJS.ErrnoException).code! : null,
      observation: null,
    });
  }
  if (!canonicalEquals(
    productInventoryBefore,
    productInventoryAfter,
  )) {
    return productConservationFailure(resolution, inputDigest, {
      outcome, authorization, completedOwner, stage: "product_inventory",
      message: "post-publication installed Product inventories did not match",
      substrateCode: null, observation: null,
    });
  }
  if (outcome.kind === "worksite_effect_refusal") {
    const resultCandidate = deepFreeze({
      ...outcome,
      diagnosticRef: `diagnostic://abiogenesis/worksite/${outcome.code}@5`,
    });
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
  let successor;
  try {
    successor = await observeWorksiteSubject(
      value.workspaceAuthorityBasis, authority.workspaceBinding, value.subject,
    );
  } catch (error) {
    return productConservationFailure(resolution, inputDigest, {
      outcome, authorization, completedOwner, stage: "owner_reobservation",
      message: `completed owner re-observation failed: ${String(error)}`,
      substrateCode: typeof (error as NodeJS.ErrnoException)?.code === "string" ? (error as NodeJS.ErrnoException).code! : null,
      observation: null,
    });
  }
  if (successor.kind !== "worksite_observation" ||
    !canonicalEquals(
      successor,
      outcome.successorObservation,
    )) {
    return productConservationFailure(resolution, inputDigest, {
      outcome, authorization, completedOwner, stage: "owner_reobservation",
      message: successor.kind === "worksite_effect_refusal"
        ? successor.message : "completed owner re-observation did not match its retained successor",
      substrateCode: successor.kind === "worksite_effect_refusal" ? successor.substrateCode : null,
      observation: successor.kind === "worksite_observation" ? successor : null,
    });
  }
  const resultCandidate = deepFreeze({
    kind: "worksite_file_replace_output" as const,
    schemaVersion: "5.0.0" as const,
    ...completedOwner!,
  });
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

export const WORKSITE_FILE_PARENTS_IMPLEMENTATION = Object.freeze({
  implementationRef: "implementation://abiogenesis/worksite/file-parents-fd@5",
  implementationBindingRef: "implementation-binding://abiogenesis/worksite/file-parents-fd@5",
  inputContractRef: WORKSITE_FILE_PARENTS_IDS.inputContractRef,
  outputContractRef: WORKSITE_FILE_PARENTS_IDS.outputContractRef,
  failureContractRef: WORKSITE_FILE_PARENTS_IDS.failureContractRef,
  refusalContractRef: WORKSITE_FILE_PARENTS_IDS.refusalContractRef,
});
const fileParentsDescriptorBody = {
  implementationRef: WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationRef,
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/worksite_file_replace.js", namedSymbol: "realizeWorksiteFileParents", computeRegime: "F_D" as const,
  inputContractRef: WORKSITE_FILE_PARENTS_IDS.inputContractRef, outputContractRef: WORKSITE_FILE_PARENTS_IDS.outputContractRef,
  failureContractRef: WORKSITE_FILE_PARENTS_IDS.failureContractRef, refusalContractRef: WORKSITE_FILE_PARENTS_IDS.refusalContractRef,
};
export const WORKSITE_FILE_PARENTS_IMPLEMENTATION_DESCRIPTOR: PackagedLeafImplementationDescriptor = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", descriptorDigest: sha256Canonical(fileParentsDescriptorBody), ...fileParentsDescriptorBody,
});

/** Selected native C0 entry, never a host directory-creation convenience. */
export async function realizeWorksiteFileParents(
  value: Readonly<Record<string, JsonValue>>,
  occurrence: Readonly<LeafExecutionOccurrence>,
  resolution: Readonly<LeafInvocationResolution>,
  inputDigest: `sha256:${string}`,
): Promise<Readonly<LeafRealizationCandidate> | null> {
  const authority = occurrence.executionAuthority;
  if (!isLeafExecutionAuthority(authority) || !isWorksiteFileParentsRequest(value)) return null;
  const gate = openWorksiteLeafGate({ effect: "file_parents", authority, request: value, occurrence, resolution, inputDigest,
    realizer: { graphFunctionRef: WORKSITE_FILE_PARENTS_IDS.graphFunctionRef,
      implementationBindingRef: WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationBindingRef,
      descriptor: WORKSITE_FILE_PARENTS_IMPLEMENTATION_DESCRIPTOR } });
  if (!gate.coordinates()) return null;
  const selected = authority.implementationResolution;
  let hold: WorksiteLeafHold | null;
  try {
    // abg/semantic_job.js imports this module, so its plan check is loaded here.
    const { validateWorksiteFileParentsPlanAtPrefix } = await import("../abg/semantic_job.js");
    hold = gate.current(validateWorksiteFileParentsPlanAtPrefix);
  } catch { return null; }
  if (hold === null) return null;
  const { executionBasis: localBasis, implementationSet: localSet, protectedInstallRoots } = hold;
  const authorization = constructWorksiteFileParentsAuthorization({ workspaceBinding: authority.workspaceBinding, request: value,
    executionBasis: localBasis, cCall: authority.cCall, implementationSet: localSet });
  if (authorization.kind !== "worksite_file_parents_authorization" ||
    Object.entries(authorization).some(([key, field]) => key in authority && key !== "kind" && key !== "schemaVersion" &&
      key !== "authorizationRef" && key !== "authorizationDigest" && field !== (authority as unknown as Record<string, unknown>)[key]) ||
    authorization.leafResolutionCandidateRef !== selected.leafResolutionCandidateRef || authorization.leafResolutionCandidateDigest !== selected.leafResolutionCandidateDigest) return null;
  const outcome = await createWorksiteFileParents({ workspaceAuthorityBasis: value.workspaceAuthorityBasis, workspaceBinding: authority.workspaceBinding,
    request: value, executionBasis: localBasis, cCall: authority.cCall, implementationSet: localSet, authorization, protectedInstallRoots });
  try { return fileParentsRealizationCandidate(outcome, resolution.implementationRef, inputDigest); }
  catch (error) {
    const failure = worksiteRefusal("filesystem_refused", `file-parent result construction failed: ${String(error)}`);
    const retained = isWorksiteFileParentsFailure(outcome)
      ? worksiteFileParentsFailure(value, authorization, outcome.physicalOutcome.outcomes,
        worksiteRefusal(outcome.code, outcome.message, null, outcome.substrateCode), [...outcome.physicalOutcome.diagnostics, failure])
      : isWorksiteFileParentsSuccess(outcome) ? worksiteFileParentsFailure(value, authorization, outcome.receipt.outcomes, failure) : outcome;
    return fileParentsRealizationCandidate(retained, resolution.implementationRef, inputDigest);
  }
}

function fileParentsRealizationCandidate(outcome: WorksiteFileParentsResult, implementationRef: string, inputDigest: `sha256:${string}`): Readonly<LeafRealizationCandidate> {
  const resultCandidate = outcome;
  const common = { kind: "leaf_realization_candidate" as const, schemaVersion: "5.0.0" as const,
    evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef,
      inputDigest, outputDigest: sha256Canonical(resultCandidate) } as const], resultCandidate };
  return outcome.kind === "worksite_file_parents_result"
    ? deepFreeze({ ...common, disposition: "success" as const })
    : deepFreeze({ ...common, disposition: "failure" as const, diagnosticRef: `diagnostic://abiogenesis/worksite/file-parents/${outcome.code}@5` });
}
