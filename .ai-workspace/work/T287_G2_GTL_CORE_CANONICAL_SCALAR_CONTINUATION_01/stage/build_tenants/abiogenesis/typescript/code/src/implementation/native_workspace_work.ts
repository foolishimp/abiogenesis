import { parseNativeWorkspaceAssessmentResult } from "../product/native_workspace_assessment.js";
import { NATIVE_WORKSPACE_WORK_IDS as ids, isNativeWorkspaceWorkTask, nativeWorkspaceWorkAuthorityMatches,
  nativeWorkspaceWorkResponseSchema, nativeWorkspaceWorkResultContractRef, parseNativeWorkspaceWorkReport, nativeWorkspaceScopeViolations,
  nativeWorkspaceChangedPaths, nativeWorkspaceWorkProvenance, constructNativeWorkspaceWorkObservation,
  type NativeWorkspaceWorkTask, type NativeWorkspaceWorkFailure } from "../product/native_workspace_work.js";
import { observeWorksiteContext } from "../product/worksite_operations.js";
import { isWorksiteContextObservation } from "../product/worksite_effect.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { isLeafExecutionAuthority } from "./leaf_execution_authority.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { NativeInstructionAssembly } from "../abg/instruction_assembly.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";

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
  const observationInput = { workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding,
    readRoots: input.context.readRoots, maxFiles: input.context.maxFiles, maxBytes: input.context.maxBytes };
  const before = await observeWorksiteContext(observationInput);
  if (!isWorksiteContextObservation(before) || canonicalJson(before as unknown as JsonValue) !== canonicalJson(input.context as unknown as JsonValue))
    throw new TypeError("native workspace input context is unavailable or stale before dispatch");
  const workerRequest = prepareAssembly().request;
  if (workerRequest.implementationRef !== ids.implementationRef || workerRequest.inputDigest !== sha256Canonical(input as unknown as JsonValue) ||
    workerRequest.transportLane !== "worker_executes" || workerRequest.resultContractRef !== nativeWorkspaceWorkResultContractRef(input) ||
    canonicalJson(workerRequest.responseJsonSchema) !== canonicalJson(nativeWorkspaceWorkResponseSchema(input)))
    throw new TypeError("native workspace assembly differs from its owner contract");
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation" as const, schemaVersion: "5.0.0" as const, workerRequest,
    async complete(exchange) {
      // Observe even after timeout, nonzero exit, absent/malformed report or
      // an exchange-identity failure. Authorized partial work is not rollback.
      const observed = await observeWorksiteContext(observationInput);
      const after = isWorksiteContextObservation(observed) ? observed : null;
      const report = input.assessment === undefined ? parseNativeWorkspaceWorkReport(exchange.observation.finalOutput) : null;
      const assessment = input.assessment === undefined ? null : parseNativeWorkspaceAssessmentResult(nativeWorkspaceWorkResponseSchema(input), exchange.observation.finalOutput);
      const sameExchange = canonicalJson(exchange.request as unknown as JsonValue) === canonicalJson(workerRequest as unknown as JsonValue);
      const failureClass = !sameExchange ? "transport_identity_mismatch" : exchange.observation.disposition !== "success"
        ? exchange.observation.failureClass ?? "transport_failure" : after === null ? "post_work_observation_failed"
        : nativeWorkspaceScopeViolations(input, after).length !== 0 ? "write_scope_violation" : (input.assessment === undefined ? report === null : assessment === null) ? "result_contract_failure"
        : input.assessment !== undefined && (input.assessment.producer.cCallRef === occurrence.cCallRef || input.assessment.producer.actorInvocationRef === exchange.observation.actorInvocationRef) ? "assessment_independence_mismatch" : null;
      const provenance = nativeWorkspaceWorkProvenance(authority, exchange);
      if (failureClass !== null || after === null || (input.assessment === undefined ? report === null : assessment === null)) {
        const diagnosticRef = `diagnostic://abiogenesis/worksite/native-work/${failureClass ?? "incomplete"}@5`;
        const value: NativeWorkspaceWorkFailure = { kind: "native_workspace_work_failure", schemaVersion: "5.0.0",
          failureClass: failureClass ?? "incomplete", diagnosticRef, task: input, before, after,
          changedPaths: after === null ? null : nativeWorkspaceChangedPaths(before, after),
          observationFailure: observed.kind === "worksite_effect_refusal" ? observed : null, report, provenance };
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", evidenceCandidates: [],
          resultCandidate: value as unknown as Readonly<Record<string, JsonValue>>, diagnosticRef });
      }
      return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success", evidenceCandidates: [],
        resultCandidate: constructNativeWorkspaceWorkObservation(input, after, report, provenance, assessment ?? undefined) as unknown as Readonly<Record<string, JsonValue>> });
    },
  });
}
