import { isDeepStrictEqual as same, types } from "node:util";
import { defaultLibraryImplementationBindings } from "../gtl/default_library.js";
import { governanceRef as ref, GOVERNANCE_OPERATIONS, GOVERNANCE_SELECTION_REFUSALS } from "../product/default_library.js";
import { bindFramedSynthesisResult, isFramedSynthesisTask, governanceTargetPermission, type FramedSynthesisTarget, type FramedSynthesisBasis } from "../product/default_library.js";
import { admitIJsonText } from "../shared/i_json.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import type { LeafExecutionOccurrence, LeafRealizationCandidate, PreparedProbabilisticLeafInvocation, NativeLeafProofOperations } from "./contracts.js";
import type { NativeInstructionAssembly } from "../abg/instruction_assembly.js";
import { projectGovernanceSelection, projectGovernanceNativeTask, projectGovernanceTestingTask, projectGovernanceFold, projectGovernanceParent, projectGovernanceChoice as projectChoice } from "../abg/default_library.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructRuntimeFailureDiagnosticRef } from "../abg/runtime_failure.js";
import { sanitizeUndispatchedOwnerError } from "../abg/event_contract_profiles.js";
import type { GovernanceTestingRefusal } from "../abg/native_work_reacquisition.js";
const hash = (x: JsonValue) => sha256Canonical(x);
const descriptors = defaultLibraryImplementationBindings({ packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION })
  .map(({ kind: _kind, bindingRef: _bindingRef, ...body }) => deepFreeze({ kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0", ...body, descriptorDigest: hash(body) }) as PackagedLeafImplementationDescriptor);
export const GOVERNANCE_SELECTION_TASK_DESCRIPTOR = descriptors[0]!;
export const GOVERNANCE_SELECTOR_DESCRIPTOR = descriptors[1]!;
export const GOVERNANCE_PARENT_DESCRIPTOR = descriptors[2]!;
export const GOVERNANCE_NATIVE_TASK_DESCRIPTOR = descriptors[3]!;
export const GOVERNANCE_TESTING_TASK_DESCRIPTOR = descriptors[4]!;
export const GOVERNANCE_FOLD_DESCRIPTOR = descriptors[5]!;
export const GOVERNANCE_CHOICE_DESCRIPTOR = descriptors[6]!;
/** `inputDigest` is the F_D port's checked digest of this exact input (the
 * fourth argument of its call contract); a caller outside that port computes it. */
function realized(operation: typeof GOVERNANCE_OPERATIONS[number], input: JsonValue, output: Readonly<Record<string, JsonValue>> | null,
  refusalDiagnosticRef?: string, inputDigest?: Sha256Digest): LeafRealizationCandidate {
  const diagnosticRef = refusalDiagnosticRef ?? ref("diagnostic", "missing-owned-" + operation), success = output !== null;
  const resultCandidate: Readonly<Record<string, JsonValue>> = output ?? { kind: "governance_failure", schemaVersion: "5.0.0", diagnosticRef };
  const evidenceCandidates = operation === "select" ? [] : [{ kind: "deterministic_evidence_candidate" as const, schemaVersion: "5.0.0" as const,
    implementationRef: ref("implementation", operation), inputDigest: inputDigest ?? hash(input), outputDigest: hash(resultCandidate) }];
  return success ? { kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success", resultCandidate, evidenceCandidates }
    : { kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "failure", resultCandidate, evidenceCandidates, diagnosticRef };
}
/** The first owner refusal of one construction, retained as its runtime-failure diagnostic.
 * `computeRegime` is the refusing leaf's regime: F_D for a construction, F_P for the selector. */
function refusalReport(operation: typeof GOVERNANCE_OPERATIONS[number], occurrence: LeafExecutionOccurrence, inputDigest: Sha256Digest,
  computeRegime: "F_D" | "F_P" = "F_D") {
  let diagnosticRef: string | undefined;
  const refusal: GovernanceTestingRefusal = (stage, relation, selectors = {}, error) => {
    if (diagnosticRef !== undefined) return;
    const caught = relation === "caught" && !types.isProxy(error) ? error : null;
    diagnosticRef = constructRuntimeFailureDiagnosticRef({
      diagnosticClassRef: ref("diagnostic", "missing-owned-" + operation), computeRegime,
      implementationRef: ref("implementation", operation), inputDigest,
      occurrence: { cCallRef: occurrence.cCallRef, runId: occurrence.runId ?? null, graphCallId: occurrence.graphCallId ?? null,
        frameId: occurrence.frameId ?? null, programLocusRef: occurrence.programLocusRef ?? null,
        taskOrdinal: occurrence.taskOrdinal ?? null, attempt: occurrence.attempt ?? null },
      stage, relation, selectors, cause: relation === "caught" ? sanitizeUndispatchedOwnerError(caught) : null,
    });
  };
  return { refusal, diagnosticRef: () => diagnosticRef };
}
/**
 * The three governance preparation leaves each run one worksite observation
 * effect, admitted by its owner before any construction reads it
 * (`observeGovernanceWorksite`), then one pure task construction over the
 * declared input, the admitted prefix and that admitted observation. The F_D
 * claim is the construction's: it terminates from code, its dependencies are the
 * declared input, the prefix and the observation the result carries, and it has
 * one typed outcome per input. The deterministic evidence binds the carried
 * observation through the output digest.
 */
export async function prepareGovernanceSelection(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest) {
  const checkedInputDigest = inputDigest ?? hash(input), report = refusalReport("prepare-selection", occurrence, checkedInputDigest);
  const output = occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceSelection(occurrence.nativeInstructionAssemblyBasis, input, report.refusal);
  return realized("prepare-selection", input, output, output === null ? report.diagnosticRef() : undefined, checkedInputDigest);
}
export async function prepareGovernanceNativeTask(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest) {
  return realized("prepare-native", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : await projectGovernanceNativeTask(occurrence.nativeInstructionAssemblyBasis, input), undefined, inputDigest);
}
export async function prepareObservedTestingTask(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest, proof?: NativeLeafProofOperations) {
  const checkedInputDigest = inputDigest ?? hash(input), { refusal, diagnosticRef } = refusalReport("prepare-testing", occurrence, checkedInputDigest);
  const basis = occurrence.nativeInstructionAssemblyBasis;
  if (basis === undefined) refusal("testing_basis", "assembly_basis_absent");
  const output = basis === undefined ? null : await projectGovernanceTestingTask(basis, input,
    proof?.governanceTestingReacquisition === undefined ? undefined :
      (context, report) => proof.governanceTestingReacquisition!(input, occurrence, context, report), refusal,
    occurrence.commandAmbientEnvironment);
  return realized("prepare-testing", input, output, output === null ? diagnosticRef() : undefined, checkedInputDigest);
}
export function foldGovernanceWork(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest) {
  return realized("fold", input, occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectGovernanceFold(occurrence.nativeInstructionAssemblyBasis, input), undefined, inputDigest);
}
export function evaluateGovernanceParent(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest) {
  const checkedInputDigest = inputDigest ?? hash(input), report = refusalReport("evaluate-parent", occurrence, checkedInputDigest);
  const output = occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectGovernanceParent(occurrence.nativeInstructionAssemblyBasis, input, report.refusal);
  return realized("evaluate-parent", input, output, output === null ? report.diagnosticRef() : undefined, checkedInputDigest);
}
export function projectGovernanceChoice(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  _resolution?: unknown, inputDigest?: Sha256Digest) {
  const checkedInputDigest = inputDigest ?? hash(input), report = refusalReport("project-choice", occurrence, checkedInputDigest);
  const output = occurrence.nativeInstructionAssemblyBasis === undefined ? null : projectChoice(occurrence.nativeInstructionAssemblyBasis, input, report.refusal);
  return realized("project-choice", input, output, output === null ? report.diagnosticRef() : undefined, checkedInputDigest);
}
/** The selector's completion. An exchange whose identity differs from the
 * prepared request is an integrity failure and throws. Every other outcome that
 * binds no choice is a typed refusal of class `missing-owned-select`, relation
 * one of `GOVERNANCE_SELECTION_REFUSALS`: the selector's process ended without
 * success, its response was refused, or it chose a target that is not permitted. */
export function selectGovernanceWork(input: Readonly<Record<string, JsonValue>>, occurrence: LeafExecutionOccurrence,
  prepareAssembly: () => NativeInstructionAssembly): PreparedProbabilisticLeafInvocation<LeafRealizationCandidate> {
  if (!isFramedSynthesisTask(input)) throw new TypeError("framed synthesis task required");
  const assembly = prepareAssembly();
  return deepFreeze({ kind: "prepared_probabilistic_leaf_invocation", schemaVersion: "5.0.0", workerRequest: assembly.request,
    complete(exchange) {
      const o = exchange.observation, inputDigest = hash(input);
      if (!same(exchange.request, assembly.request) || o.promptDigest !== assembly.manifest.promptDigest || o.inputDigest !== inputDigest ||
        o.implementationRef !== ref("implementation", "select")) throw new TypeError("native selector exchange mismatch");
      const { refusal, diagnosticRef } = refusalReport("select", occurrence, inputDigest, "F_P");
      const refused = (relation: typeof GOVERNANCE_SELECTION_REFUSALS[number], selectors: Readonly<Record<string, string | number | boolean | null>>) => {
        refusal("selector_completion", relation, selectors); return realized("select", input, null, diagnosticRef());
      };
      if (o.disposition !== "success")
        return refused("selector_process_ended", { actorInvocationRef: o.actorInvocationRef, failureClass: o.failureClass, timeoutClass: o.timeoutClass });
      const targets = assembly.envelope.targetBindings as unknown as FramedSynthesisTarget[];
      let raw: unknown = null;
      if (o.toolCallCount === 0) try { raw = admitIJsonText(o.finalOutput, "framed synthesis raw result"); } catch { raw = null; }
      const proposed = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw as { readonly nextGraphFunctionRef?: unknown; readonly reviewRef?: unknown } : {};
      const next = targets.find(t => t.graphFunctionRef === proposed.nextGraphFunctionRef);
      const choice = { graphFunctionRef: next?.graphFunctionRef ?? null, reviewRef: typeof proposed.reviewRef === "string" ? proposed.reviewRef : null };
      const output = o.toolCallCount === 0 && raw !== null ? bindFramedSynthesisResult(input, targets, assembly.envelope.boundBasis as unknown as FramedSynthesisBasis, raw) : null;
      if (output !== null) return realized("select", input, output);
      const permission = next === undefined ? null : governanceTargetPermission(input, next);
      const join = (refs: readonly string[]) => refs.length === 0 ? null : refs.join(" ");
      // A chosen target whose declared prerequisites do not hold names its missing and stale reviews.
      return permission !== null && permission.offered && !permission.permitted ? refused("target_not_permitted", { ...choice,
        missingReviews: join(permission.missingReviews.filter(m => !m.satisfied).map(m => m.reviewRef)),
        staleReviews: join(permission.missingReviews.filter(m => m.satisfied).map(m => m.reviewRef)),
        missingSelectedPaths: join(permission.missingSelectedPaths) }) : refused("response_refused", choice);
    } });
}
