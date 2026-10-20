import { materializeGraph } from "../gtl/materialize.js";
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { REQUIREMENT_HANDOFF_IDS, validRequirementHandoffPublication } from "../gtl/requirement_handoff.js";
import type { ExecutionBasis } from "./execution_basis.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";
import type { CCall } from "./c_call.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix } from "./c_call.js";
import type { DurablePrefixCoordinate } from "./event_store.js";
import { readRuntimeEventsAtDurablePrefix } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { deriveRequirementHandoffCandidate, isRequirementHandoffInput } from "../product/requirement_handoff.js";
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
export interface RequirementHandoffDeclarationBasis {
  readonly publication: Readonly<ModulePublication>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly executionBasis: Readonly<ExecutionBasis>;
  readonly cCall: Readonly<CCall>;
  readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
/** Reconstructs the read-only basis from exact durable ABG facts, not a local brand. */
export function authenticateRequirementHandoffBasis(basis: RequirementHandoffDeclarationBasis) {
  try {
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix);
    const prefix = selectValidatedRuntimeEventPrefix(events);
    const execution = rehydrateExecutionBasisAtPrefix(prefix, basis.executionBasis.basisRef);
    if (execution === null || execution.basisClass !== "root" ||
      hash(basis.graphFunction) !== execution.graphFunctionDigest) return null;
    const graph = materializeGraph(basis.graphFunction, {
      invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
      admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue,
    });
    if (hash(basis.graph) !== hash(graph) || graph.materializationRef !== execution.graphRef ||
      graph.materializationDigest !== execution.graphDigest) return null;
    const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCall.cCallRef);
    if (call === null || hash(execution) !== hash(basis.executionBasis) || hash(call) !== hash(basis.cCall) ||
      call.basisId !== execution.basisRef || call.regime !== "F_D" || call.callClass !== "leaf" ||
      call.graphFunctionRef !== execution.graphFunctionRef || call.inputContractRef !== REQUIREMENT_HANDOFF_IDS.inputContractRef ||
      call.outputContractRef !== REQUIREMENT_HANDOFF_IDS.outputContractRef ||
      projectCCallCarrierPhaseAtPrefix(prefix, call)?.phase !== "selected_no_evidence") return null;
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.implementationSetRef);
    const rootSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.rootImplementationSetRef);
    if (set === null || rootSet === null || set.implementationSetDigest !== execution.implementationSetDigest ||
      rootSet.implementationSetDigest !== execution.rootImplementationSetDigest ||
      hash(basis.publication) !== rootSet.publicationDigest || !validRequirementHandoffPublication(basis.publication) ||
      hash(basis.graphFunction) !== execution.graphFunctionDigest ||
      basis.graphFunction.name !== execution.graphFunctionRef ||
      basis.publication.programs.filter(p => p.programRef === execution.programRef && hash(p) === execution.programDigest).length !== 1 ||
      basis.publication.graphFunctions.filter(g => hash(g) === execution.graphFunctionDigest).length !== 1) return null;
    const rows = set.rows.filter(row => row.graphFunctionRef === call.graphFunctionRef && row.programLocusRef === call.programLocusRef &&
      row.implementationBindingRef === REQUIREMENT_HANDOFF_IDS.implementationBindingRef &&
      row.implementationRef === REQUIREMENT_HANDOFF_IDS.implementationRef && row.computeRegime === "F_D" &&
      row.inputContractRef === call.inputContractRef && row.outputContractRef === call.outputContractRef);
    if (rows.length !== 1) return null;
    const selected = basis.publication.requirementHandoffs?.filter(d =>
      d.declarationRef === basis.graphFunction.declarations["abg.requirement_handoff"] && d.graphFunctionRef === call.graphFunctionRef);
    if (selected?.length !== 1) return null;
    return deepFreeze({ declaration: selected[0]!, coordinate: {
      publicationDigest: rootSet.publicationDigest, declarationDigest: hash(selected[0]),
      executionBasisRef: execution.basisRef, executionBasisDigest: execution.basisDigest,
      programRef: execution.programRef, programDigest: execution.programDigest,
      graphFunctionRef: execution.graphFunctionRef, graphFunctionDigest: execution.graphFunctionDigest,
      cCallRef: call.cCallRef, cCallDigest: call.cCallDigest,
      implementationResolutionRef: rows[0]!.leafResolutionCandidateRef,
      implementationResolutionDigest: rows[0]!.leafResolutionCandidateDigest,
      predecessorPrefixDigest: hash(events), predecessorEventCount: events.length,
      inputDigest: execution.rawInputDigest,
    } });
  } catch { return null; }
}
export function constructRequirementHandoffDeclarationBasis(basis: RequirementHandoffDeclarationBasis): Readonly<RequirementHandoffDeclarationBasis> | null {
  return authenticateRequirementHandoffBasis(basis) === null ? null : deepFreeze(basis);
}
export function projectRequirementHandoffCandidate(basis: RequirementHandoffDeclarationBasis, input: unknown) {
  const authenticated = authenticateRequirementHandoffBasis(basis);
  if (authenticated === null || !isRequirementHandoffInput(input)) return null;
  return deriveRequirementHandoffCandidate(input, authenticated.declaration, authenticated.coordinate);
}
/** ABG alone compares against its current admitted source, never output-owned declarations. */
export function requirementHandoffResultMatches(basis: RequirementHandoffDeclarationBasis, input: unknown, value: unknown): boolean {
  const expected = projectRequirementHandoffCandidate(basis, input);
  return expected !== null && hash(value) === hash(expected);
}
