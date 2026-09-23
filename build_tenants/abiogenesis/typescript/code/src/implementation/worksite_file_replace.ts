import { rehydrateInvocationAdmissionAtPrefix } from "../abg/invocation_admission.js";
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
  exactProgramOwnerInstall,
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
} from "../product/index.js";
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
  WORKSITE_FILE_REPLACE_EFFECT_URI,
  WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
  WORKSITE_FILE_REPLACE_HANDLER_REF,
  constructWorksiteFileParentsAuthorization,
  isWorksiteFileParentsRequest,
  isWorksiteFileParentsSuccess,
  isWorksiteFileParentsFailure,
  WORKSITE_FILE_PARENTS_EFFECT_URI,
  WORKSITE_FILE_PARENTS_HANDLER_REF,
  WORKSITE_FILE_PARENTS_HANDLER_DIGEST,
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
  let conservationRoots: readonly string[] = [];
  let protectedInstallRoots: readonly string[] = [];
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
    let rootBasis = projectedExecutionBasis;
    const seen = new Set<string>();
    while (rootBasis !== null && rootBasis.parentExecutionBasisRef !== null) {
      if (seen.has(rootBasis.basisRef)) { rootBasis = null; break; }
      seen.add(rootBasis.basisRef);
      rootBasis = rehydrateExecutionBasisAtPrefix(authorityPrefix, rootBasis.parentExecutionBasisRef);
    }
    const installs = environment.kind === "exact_prefix_workspace_environment" ? environment.productInstalls : [];
    const programOwner = rootBasis === null || projectedImplementationSet === null ||
      environment.kind !== "exact_prefix_workspace_environment" ? null
      : exactProgramOwnerInstall(environment, projectedImplementationSet.rows,
          rootBasis.graphFunctionRef, authority.programPublication.moduleRef,
          rootBasis.programRef, selected.publicationDigest, rootBasis.programDigest,
          authority.programPublication);
    const programOwners = programOwner === null ? [] : [programOwner];
    const graphOwners = installs.filter((install) => install.productId === selected.graphFunctionOwnerProductId &&
      install.contributionManifest.rows.filter((row) => row.kind === "graph_function" &&
        row.declarationOrContractRef === selected.graphFunctionRef && row.owningProductId === install.productId &&
        install.contributionManifest.publicationBindings.filter((binding) => binding.moduleRef === row.moduleRef &&
          binding.publicationDigest === selected.graphFunctionPublicationDigest).length === 1).length === 1);
    const implementationOwners = installs.filter((install) => install.productId === selected.implementationOwnerProductId &&
      install.packageName === selected.packageName && install.packageVersion === selected.packageVersion &&
      install.contributionManifest.publicationBindings.filter((binding) => binding.publicationDigest === selected.implementationPublicationDigest).length === 1);
    const rootInvocation = rootBasis === null ? null : rehydrateInvocationAdmissionAtPrefix(authorityPrefix, rootBasis.invocationAdmissionRef);
    const ownersHeld = rootInvocation !== null && rootInvocation.capabilityGrants.length === 1 &&
      canonicalJson(rootInvocation.capabilityGrants[0] as unknown as JsonValue) === canonicalJson(value.capabilityGrant as unknown as JsonValue) &&
      value.capabilityGrant.definitionKey.memberKey === (rootInvocation.invocationVariant === "direct" ? "invoke" : rootInvocation.invocationVariant) &&
      rootBasis !== null && rootBasis.programRef === authority.programRef &&
      rootBasis.programDigest === authority.programDigest && rootBasis.invocationAdmissionRef === authority.executionBasis.invocationAdmissionRef &&
      programOwners.length === 1 && graphOwners.length === 1 && implementationOwners.length === 1;
    conservationRoots = ownersHeld ? [...new Set([...programOwners, ...graphOwners, ...implementationOwners].map((install) => install.installedRoot))].sort() : [];
    protectedInstallRoots = installs.map((install) => install.installedRoot);
    const environmentHeld = environment.kind ===
        "exact_prefix_workspace_environment" &&
      canonicalJson(environment.workspaceAuthorityBasis as unknown as JsonValue) ===
        canonicalJson(value.workspaceAuthorityBasis as unknown as JsonValue) &&
      canonicalJson(environment.workspaceBinding as unknown as JsonValue) ===
        canonicalJson(authority.workspaceBinding as unknown as JsonValue) &&
      ownersHeld;
    installedProductRoot = environmentHeld
      ? programOwners[0]!.installedRoot
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
  if (canonicalJson(productInventoryBefore) !==
    canonicalJson(productInventoryAfter)) {
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
    canonicalJson(successor as unknown as JsonValue) !==
      canonicalJson(outcome.successorObservation as unknown as JsonValue)) {
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
  if (!isLeafExecutionAuthority(authority) || !isWorksiteFileParentsRequest(value) ||
    sha256Canonical(value as unknown as JsonValue) !== inputDigest ||
    inputDigest !== authority.executionBasis.rawInputDigest ||
    sha256Canonical(authority.executionBasis.rawInputValue as unknown as JsonValue) !== inputDigest ||
    sha256Canonical(resolution as unknown as JsonValue) !== authority.implementationResolutionDigest ||
    authority.effectUri !== WORKSITE_FILE_PARENTS_EFFECT_URI || authority.handlerRef !== WORKSITE_FILE_PARENTS_HANDLER_REF ||
    authority.handlerDigest !== WORKSITE_FILE_PARENTS_HANDLER_DIGEST ||
    authority.cCallRef !== occurrence.cCallRef || authority.cCall.runId !== occurrence.runId ||
    authority.cCall.graphCallId !== occurrence.graphCallId || authority.cCall.frameId !== occurrence.frameId ||
    authority.cCall.programLocusRef !== occurrence.programLocusRef || authority.cCall.taskOrdinal !== occurrence.taskOrdinal ||
    authority.cCall.attempt !== occurrence.attempt || authority.cCall.callClass !== "leaf" || authority.cCall.regime !== "F_D" ||
    authority.graphFunctionRef !== WORKSITE_FILE_PARENTS_IDS.graphFunctionRef) return null;
  const selected = authority.implementationResolution;
  if (selected.implementationRef !== WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationRef ||
    selected.implementationBindingRef !== WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationBindingRef ||
    selected.packageName !== ABI5_PACKAGE_NAME || selected.packageVersion !== ABI5_PACKAGE_VERSION ||
    selected.modulePath !== fileParentsDescriptorBody.modulePath || selected.namedSymbol !== fileParentsDescriptorBody.namedSymbol ||
    selected.implementationDescriptorDigest !== WORKSITE_FILE_PARENTS_IMPLEMENTATION_DESCRIPTOR.descriptorDigest ||
    selected.computeRegime !== "F_D" || selected.inputContractRef !== fileParentsDescriptorBody.inputContractRef ||
    selected.outputContractRef !== fileParentsDescriptorBody.outputContractRef || selected.failureContractRef !== fileParentsDescriptorBody.failureContractRef ||
    selected.refusalContractRef !== fileParentsDescriptorBody.refusalContractRef) return null;
  let protectedInstallRoots: readonly string[];
  let localBasis;
  let localSet;
  try {
    const { validateWorksiteFileParentsPlanAtPrefix } = await import("../abg/semantic_job.js");
    const events = readRuntimeEventsAtDurablePrefix(authority.predecessorPrefix, { requireCurrent: true });
    const prefix = selectValidatedRuntimeEventPrefix(events);
    const runtimePrefix = selectValidatedRuntimeEventPrefix(events, { runId: authority.cCall.runId });
    localBasis = rehydrateExecutionBasisAtPrefix(prefix, authority.executionBasisRef);
    localSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, authority.implementationSetRef);
    const environment = projectExactPrefixWorkspaceEnvironment(authority.predecessorPrefix, { ref: authority.workspaceBindingIdentity, digest: authority.workspaceBindingDigest });
    if (localBasis === null || localSet === null || environment.kind !== "exact_prefix_workspace_environment" ||
      canonicalJson(localBasis as unknown as JsonValue) !== canonicalJson(authority.executionBasis as unknown as JsonValue) ||
      canonicalJson(localSet as unknown as JsonValue) !== canonicalJson(authority.implementationSet as unknown as JsonValue) ||
      canonicalJson(environment.workspaceBinding as unknown as JsonValue) !== canonicalJson(authority.workspaceBinding as unknown as JsonValue) ||
      canonicalJson(environment.workspaceAuthorityBasis as unknown as JsonValue) !== canonicalJson(value.workspaceAuthorityBasis as unknown as JsonValue) ||
      projectCCallCarrierPhaseAtPrefix(runtimePrefix, authority.cCall)?.phase !== "selected_no_evidence" ||
      !validateWorksiteFileParentsPlanAtPrefix(prefix, value, authority.programPublication)) return null;
    let rootBasis: typeof localBasis | null = localBasis;
    const seen = new Set<string>();
    while (rootBasis !== null && rootBasis.parentExecutionBasisRef !== null) {
      if (seen.has(rootBasis.basisRef)) return null;
      seen.add(rootBasis.basisRef);
      rootBasis = rehydrateExecutionBasisAtPrefix(prefix, rootBasis.parentExecutionBasisRef);
    }
    if (rootBasis === null || rootBasis.programRef !== authority.programRef || rootBasis.programDigest !== authority.programDigest ||
      rootBasis.invocationAdmissionRef !== localBasis.invocationAdmissionRef) return null;
    const invocation = rehydrateInvocationAdmissionAtPrefix(prefix, rootBasis.invocationAdmissionRef);
    const programOwner = exactProgramOwnerInstall(environment, localSet.rows, rootBasis.graphFunctionRef, authority.programPublication.moduleRef,
      rootBasis.programRef, selected.publicationDigest, rootBasis.programDigest, authority.programPublication);
    const implementations = environment.productInstalls.filter(install => install.productId === selected.implementationOwnerProductId &&
      install.packageName === selected.packageName && install.packageVersion === selected.packageVersion &&
      install.contributionManifest.publicationBindings.filter(binding => binding.publicationDigest === selected.implementationPublicationDigest).length === 1);
    const graphOwners = environment.productInstalls.filter(install => install.productId === selected.graphFunctionOwnerProductId &&
      install.contributionManifest.rows.filter(row => row.kind === "graph_function" && row.declarationOrContractRef === selected.graphFunctionRef &&
        row.owningProductId === install.productId && install.contributionManifest.publicationBindings.filter(binding => binding.moduleRef === row.moduleRef &&
          binding.publicationDigest === selected.graphFunctionPublicationDigest).length === 1).length === 1);
    if (invocation === null || invocation.capabilityGrants.length !== 1 || programOwner === null || implementations.length !== 1 || graphOwners.length !== 1 ||
      canonicalJson(invocation.capabilityGrants[0] as unknown as JsonValue) !== canonicalJson(value.capabilityGrant as unknown as JsonValue) ||
      value.capabilityGrant.definitionKey.memberKey !== (invocation.invocationVariant === "direct" ? "invoke" : invocation.invocationVariant)) return null;
    protectedInstallRoots = environment.productInstalls.map(install => install.installedRoot);
  } catch { return null; }
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
  const resultCandidate = outcome as unknown as Readonly<Record<string, JsonValue>>;
  const common = { kind: "leaf_realization_candidate" as const, schemaVersion: "5.0.0" as const,
    evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0", implementationRef,
      inputDigest, outputDigest: sha256Canonical(resultCandidate) } as const], resultCandidate };
  return outcome.kind === "worksite_file_parents_result"
    ? deepFreeze({ ...common, disposition: "success" as const })
    : deepFreeze({ ...common, disposition: "failure" as const, diagnosticRef: `diagnostic://abiogenesis/worksite/file-parents/${outcome.code}@5` });
}
