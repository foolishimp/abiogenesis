import { parseNativeWorkspaceAssessmentResult } from "../product/native_workspace_assessment.js";
import { NATIVE_WORKSPACE_WORK_IDS as ids, isNativeWorkspaceWorkTask, nativeWorkspaceWorkAuthorityMatches,
  nativeWorkspaceWorkResponseSchema, nativeWorkspaceWorkResultContractRef, parseNativeWorkspaceWorkReport, nativeWorkspaceScopeViolations,
  nativeWorkspaceWorkProvenance, constructNativeWorkspaceWorkObservation, constructNativeWorkspaceWorkFailure,
  type NativeWorkspaceWorkTask } from "../product/native_workspace_work.js";
import { checkWorksiteWriteRoots, observeWorksiteContext } from "../product/worksite_operations.js";
import { projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { carryWorksiteContextBodies, isWorksiteContextObservation, sameWorksiteContextIdentity } from "../product/worksite_effect.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { isLeafExecutionAuthority } from "./leaf_execution_authority.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { NativeInstructionAssembly } from "../abg/instruction_assembly.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";
import { canonicalEquals } from "../shared/value/index.js";

const descriptor = { implementationRef: ids.implementationRef, packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/native_workspace_work.js", namedSymbol: "realizeNativeWorkspaceWork", computeRegime: "F_P" as const,
  inputContractRef: ids.taskContractRef, outputContractRef: ids.observationContractRef,
  failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
export const NATIVE_WORKSPACE_WORK_IMPLEMENTATION_DESCRIPTOR = deepFreeze({ kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const, descriptorDigest: sha256Canonical(descriptor), ...descriptor });

/** Native tools own the internal work. This selected owner observes the declared
 * worksite boundary and returns candidates; it never writes an ABG event. */
export async function realizeNativeWorkspaceWork(input: Readonly<NativeWorkspaceWorkTask>, occurrence: Readonly<LeafExecutionOccurrence>,
  prepareAssembly?: () => Readonly<NativeInstructionAssembly>): Promise<Readonly<PreparedProbabilisticLeafInvocation<Readonly<LeafRealizationCandidate>>>> {
  const authority = occurrence.executionAuthority;
  if (!isNativeWorkspaceWorkTask(input) || !isLeafExecutionAuthority(authority) ||
    !nativeWorkspaceWorkAuthorityMatches(input, authority) || prepareAssembly === undefined)
    throw new TypeError("native workspace work requires its exact admitted effect authority and assembly");
  // Protected roots: the exact-prefix environment names the install roots; the
  // worksite owner refuses any W overlapping them or the binding roots.
  const environment = projectExactPrefixWorkspaceEnvironment(authority.predecessorPrefix,
    { ref: authority.workspaceBindingIdentity, digest: authority.workspaceBindingDigest });
  if (environment.kind !== "exact_prefix_workspace_environment" || !canonicalEquals(environment.workspaceBinding, input.workspaceBinding) ||
    !canonicalEquals(environment.workspaceAuthorityBasis, input.workspaceAuthorityBasis))
    throw new TypeError("native workspace work requires its exact admitted workspace environment");
  const protectedWrite = await checkWorksiteWriteRoots({ workspaceAuthorityBasis: input.workspaceAuthorityBasis,
    workspaceBinding: input.workspaceBinding, protectedInstallRoots: environment.productInstalls.map(install => install.installedRoot),
    writeRoots: input.writeRoots });
  if (protectedWrite !== null)
    throw new TypeError(`native workspace write roots refuse before dispatch: ${protectedWrite.code}: ${protectedWrite.message}`);
  const observationInput = { workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding,
    readRoots: input.context.readRoots, maxFiles: input.context.maxFiles, maxBytes: input.context.maxBytes };
  // Fresh physical currentness; the admitted task keeps its own body carriage.
  const current = await observeWorksiteContext(observationInput);
  if (!isWorksiteContextObservation(current) || !sameWorksiteContextIdentity(current, input.context))
    throw new TypeError("native workspace input context is unavailable or stale before dispatch");
  const before = input.context;
  const workerRequest = prepareAssembly().request;
  if (workerRequest.implementationRef !== ids.implementationRef || workerRequest.inputDigest !== sha256Canonical(input) ||
    workerRequest.transportLane !== "worker_executes" || workerRequest.resultContractRef !== nativeWorkspaceWorkResultContractRef(input) ||
    !canonicalEquals(workerRequest.responseJsonSchema, nativeWorkspaceWorkResponseSchema(input)) ||
    workerRequest.responsePresentation !== (input.assessment === undefined ? undefined : "result_text"))
    throw new TypeError("native workspace assembly differs from its owner contract");
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation" as const, schemaVersion: "5.0.0" as const, workerRequest,
    async complete(exchange) {
      // Observe even after timeout, nonzero exit, absent/malformed report or
      // an exchange-identity failure. Authorized partial work is not rollback.
      // Unchanged after bodies reference their admitted holder: the task's own
      // member, or the inline task-context body of this CCall's admitted basis
      // input (the task is that basis's raw input). Changed bytes are born
      // inline once in this Result.
      const observed = await observeWorksiteContext(observationInput);
      const after = isWorksiteContextObservation(observed) ? carryWorksiteContextBodies(observed, before,
        { basisRef: authority.executionBasis.basisRef, basisDigest: authority.executionBasis.basisDigest }) : null;
      const report = input.assessment === undefined ? parseNativeWorkspaceWorkReport(exchange.observation.finalOutput) : null;
      const assessment = input.assessment === undefined ? null : parseNativeWorkspaceAssessmentResult(nativeWorkspaceWorkResponseSchema(input), exchange.observation.finalOutput);
      const sameExchange = canonicalEquals(exchange.request, workerRequest);
      const failureClass = !sameExchange ? "transport_identity_mismatch" : exchange.observation.disposition !== "success"
        ? exchange.observation.failureClass ?? "transport_failure" : after === null ? "post_work_observation_failed"
        : nativeWorkspaceScopeViolations(input, after).length !== 0 ? "write_scope_violation" : (input.assessment === undefined ? report === null : assessment === null) ? "result_contract_failure"
        : input.assessment !== undefined && (input.assessment.producer.cCallRef === occurrence.cCallRef || input.assessment.producer.actorInvocationRef === exchange.observation.actorInvocationRef) ? "assessment_independence_mismatch" : null;
      const provenance = nativeWorkspaceWorkProvenance(authority, exchange);
      if (failureClass !== null || after === null || (input.assessment === undefined ? report === null : assessment === null)) {
        const diagnosticRef = `diagnostic://abiogenesis/worksite/native-work/${failureClass ?? "incomplete"}@5`;
        const value = constructNativeWorkspaceWorkFailure(input, failureClass ?? "incomplete", diagnosticRef, after,
          observed.kind === "worksite_effect_refusal" ? observed : null, report, provenance);
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", evidenceCandidates: [],
          resultCandidate: value as unknown as Readonly<Record<string, JsonValue>>, diagnosticRef });
      }
      return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success", evidenceCandidates: [],
        resultCandidate: constructNativeWorkspaceWorkObservation(input, after, report, provenance, assessment ?? undefined) });
    },
  });
}
