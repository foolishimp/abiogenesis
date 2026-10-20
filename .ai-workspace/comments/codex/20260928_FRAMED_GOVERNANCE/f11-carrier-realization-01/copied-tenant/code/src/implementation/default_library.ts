import { isDeepStrictEqual as same } from "node:util";
import { defaultLibraryImplementationBindings } from "../gtl/default_library.js";
import { governanceRef as ref, GOVERNANCE_OPERATIONS } from "../product/default_library.js";
import { bindFramedSynthesisResult, isFramedSynthesisTask, type FramedSynthesisTarget, type FramedSynthesisBasis } from "../product/default_library.js";
import { admitIJsonText } from "../shared/i_json.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation } from "./contracts.js";
import type { NativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { projectGovernanceSelection, projectGovernanceNativeTask, projectGovernanceTestingTask, projectGovernanceFold, projectGovernanceParent, projectGovernanceChoice as projectChoice } from "../abg/default_library.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
const hash = (x: unknown) => sha256Canonical(x as JsonValue);
const descriptors = defaultLibraryImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION })
  .map(({ kind: _kind, bindingRef: _bindingRef, ...body }) => deepFreeze({ kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...body, descriptorDigest: hash(body) }) as PackagedLeafImplementationDescriptor);
export const GOVERNANCE_SELECTION_TASK_DESCRIPTOR = descriptors[0]!;
export const GOVERNANCE_SELECTOR_DESCRIPTOR = descriptors[1]!;
export const GOVERNANCE_PARENT_DESCRIPTOR = descriptors[2]!;
export const GOVERNANCE_NATIVE_TASK_DESCRIPTOR = descriptors[3]!;
export const GOVERNANCE_TESTING_TASK_DESCRIPTOR = descriptors[4]!;
export const GOVERNANCE_FOLD_DESCRIPTOR = descriptors[5]!;
export const GOVERNANCE_CHOICE_DESCRIPTOR = descriptors[6]!;
function realized(operation: typeof GOVERNANCE_OPERATIONS[number], input: unknown, output: unknown): LeafRealizationCandidate {
  const diagnosticRef = ref("diagnostic", "missing-owned-" + operation), success = output !== null;
  const resultCandidate = (output ?? { kind: "governance_failure", schemaVersion: "5.0.0", diagnosticRef }) as Readonly<Record<string, JsonValue>>;
  const evidenceCandidates = operation === "select" ? [] : [{ kind: "deterministic_evidence_candidate" as const, schemaVersion: "5.0.0" as const,
    implementationRef: ref("implementation", operation), inputDigest: hash(input), outputDigest: hash(resultCandidate) }];
  return success ? { kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success", resultCandidate, evidenceCandidates }
    : { kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", resultCandidate, evidenceCandidates, diagnosticRef };
}
export async function prepareGovernanceSelection(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence) {
  return realized("prepare-selection", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceSelection(occurrence.nativeInstructionAssemblyBasis, input));
}
export async function prepareGovernanceNativeTask(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence) {
  return realized("prepare-native", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceNativeTask(occurrence.nativeInstructionAssemblyBasis, input));
}
export async function prepareObservedTestingTask(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence) {
  return realized("prepare-testing", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceTestingTask(occurrence.nativeInstructionAssemblyBasis, input));
}
export function foldGovernanceWork(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence) {
  return realized("fold", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectGovernanceFold(occurrence.nativeInstructionAssemblyBasis, input));
}
export function evaluateGovernanceParent(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence) {
  return realized("evaluate-parent", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectGovernanceParent(occurrence.nativeInstructionAssemblyBasis, input));
}
export function projectGovernanceChoice(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence) {
  return realized("project-choice", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectChoice(occurrence.nativeInstructionAssemblyBasis, input));
}
export function selectGovernanceWork(input: Readonly<Record<string, JsonValue>>, _occurrence: LeafExecutionOccurrence,
  prepareAssembly: () => NativeInstructionAssembly): PreparedProbabilisticLeafInvocation<LeafRealizationCandidate> {
  if (!isFramedSynthesisTask(input)) throw new TypeError("framed synthesis task required");
  const assembly = prepareAssembly();
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
    complete(exchange) {
      const o = exchange.observation;
      if (!same(exchange.request, assembly.request) || o.disposition !== "success" || o.toolCallCount !== 0 ||
        o.promptDigest !== assembly.manifest.promptDigest || o.inputDigest !== hash(input) || o.implementationRef !== ref("implementation", "select")) throw new TypeError("native selector exchange mismatch");
      const output = bindFramedSynthesisResult(input, assembly.envelope.targetBindings as unknown as FramedSynthesisTarget[],
        assembly.envelope.boundBasis as unknown as FramedSynthesisBasis, admitIJsonText(o.finalOutput, "framed synthesis raw result"));
      if (output === null) throw new TypeError("native selector choice binding refused");
      return realized("select", input, output);
    } });
}
