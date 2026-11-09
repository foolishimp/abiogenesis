import { materializeGraph } from "../gtl/materialize.js";
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { REQUIREMENT_HANDOFF_IDS, validRequirementHandoffPublication } from "../gtl/requirement_handoff.js";
import type { ExecutionBasis } from "./execution_basis.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix } from "./execution_basis.js";
import type { CCall } from "./c_call.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix } from "./c_call.js";
import type { DurablePrefixCoordinate } from "./event_store.js";
import { readOwnedRuntimeEventPrefixAtDurablePrefix, runtimeEventPrefixDigest, runtimeEventPrefixExtent } from "./event_prefix.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { admitJson } from "../shared/admit/index.js";
import { deepFreeze } from "../shared/immutable.js";
import { deriveRequirementHandoffCandidate, isRequirementHandoffInput } from "../product/requirement_handoff.js";
import { canonicalEquals } from "../shared/value/index.js";
const hash = (value: JsonValue) => sha256Canonical(value);
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
    // The active owner is borrowed; any other coordinate authenticates cold.
    const prefix = readOwnedRuntimeEventPrefixAtDurablePrefix(basis.predecessorPrefix);
    const execution = rehydrateExecutionBasisAtPrefix(prefix, basis.executionBasis.basisRef);
    if (execution === null || execution.basisClass !== "root" ||
      hash(basis.graphFunction) !== execution.graphFunctionDigest) return null;
    const graph = materializeGraph(basis.graphFunction, {
      invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
      admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue,
    });
    if (!canonicalEquals(basis.graph, graph) || graph.materializationRef !== execution.graphRef ||
      graph.materializationDigest !== execution.graphDigest) return null;
    const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCall.cCallRef);
    if (call === null || !canonicalEquals(execution, basis.executionBasis) || !canonicalEquals(call, basis.cCall) ||
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
    const declaration = selected?.length === 1 ? selected[0] : undefined;
    if (declaration === undefined) return null;
    return deepFreeze({ declaration, coordinate: {
      publicationDigest: rootSet.publicationDigest, declarationDigest: hash(declaration),
      executionBasisRef: execution.basisRef, executionBasisDigest: execution.basisDigest,
      programRef: execution.programRef, programDigest: execution.programDigest,
      graphFunctionRef: execution.graphFunctionRef, graphFunctionDigest: execution.graphFunctionDigest,
      cCallRef: call.cCallRef, cCallDigest: call.cCallDigest,
      implementationResolutionRef: rows[0]!.leafResolutionCandidateRef,
      implementationResolutionDigest: rows[0]!.leafResolutionCandidateDigest,
      predecessorPrefixDigest: runtimeEventPrefixDigest(prefix), predecessorEventCount: runtimeEventPrefixExtent(prefix).count,
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
  if (expected === null) return false;
  const admittedValue = admitJson(value);
  return admittedValue.kind === "ok" && canonicalEquals(admittedValue.value, expected);
}
