import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RootModuleArtifactBasis,
  FpHelloInstruction,
  FpHelloOutput,
  HelloWorldInput,
  HelloWorldOutput,
  NormalizedHelloInput,
} from "./contracts.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import { graphEdge } from "./graph_applications.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";

export const HELLO_WORLD_IDS = Object.freeze({
  moduleRef: "module://abiogenesis/conformance/hello-world@5",
  programRef: "program://abiogenesis/conformance/hello-world@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/hello-world@5",
  graphRef: "graph://abiogenesis/conformance/hello-world@5",
  nodeRef: "node://abiogenesis/conformance/hello-world/fd-leaf@5",
  inputContractRef: "contract://abiogenesis/conformance/hello-input@5",
  outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
  failureContractRef: "contract://abiogenesis/conformance/hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/hello-refusal@5",
  evidenceContractRef: "contract://abiogenesis/conformance/hello-evidence@5",
  judgmentContractRef: "contract://abiogenesis/conformance/hello-judgment@5",
  transitionContractRef: "contract://abiogenesis/conformance/hello-transition@5",
  closureContractRef: "contract://abiogenesis/conformance/hello-closure@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-world-fd@5",
  implementationRef: "implementation://abiogenesis/conformance/hello-world-fd@5",
  armId: "arm://abiogenesis/conformance/hello-world/fd@5",
  judgmentPredicateRef: "predicate://abiogenesis/conformance/hello-world-result@5",
});

export const COMPOSED_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/hello-compose@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/hello-compose@5",
  graphRef: "graph://abiogenesis/conformance/hello-compose@5",
  nodeRef: "node://abiogenesis/conformance/hello-compose@5",
  normalizeLocusRef: "locus://abiogenesis/conformance/hello-compose/normalize@5",
  batchFirstLocusRef:
    "locus://abiogenesis/conformance/hello-compose/batch-first@5",
  batchSecondLocusRef:
    "locus://abiogenesis/conformance/hello-compose/batch-second@5",
  batchRef: "batch://abiogenesis/conformance/hello-compose/checks@5",
  edgeTransformLocusRef:
    "locus://abiogenesis/conformance/hello-compose/edge-transform@5",
  edgeEvaluateLocusRef:
    "locus://abiogenesis/conformance/hello-compose/edge-evaluate@5",
  renderLocusRef: "locus://abiogenesis/conformance/hello-compose/render@5",
  normalizedInputContractRef:
    "contract://abiogenesis/conformance/normalized-hello-input@5",
  normalizeImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-normalize-fd@5",
  normalizeImplementationRef:
    "implementation://abiogenesis/conformance/hello-normalize-fd@5",
  passNormalizedImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-normalized-pass-fd@5",
  passNormalizedImplementationRef:
    "implementation://abiogenesis/conformance/hello-normalized-pass-fd@5",
  renderImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/hello-render-fd@5",
  renderImplementationRef:
    "implementation://abiogenesis/conformance/hello-render-fd@5",
  normalizeArmId: "arm://abiogenesis/conformance/hello-compose/normalize-fd@5",
  passNormalizedArmId:
    "arm://abiogenesis/conformance/hello-compose/normalized-pass-fd@5",
  renderArmId: "arm://abiogenesis/conformance/hello-compose/render-fd@5",
  compositionRef: "composition://abiogenesis/conformance/hello-compose@5",
  normalizeJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/hello-normalized@5",
  normalizedIdentityJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/hello-normalized-identity@5",
  renderJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/hello-compose-result@5",
});

export const GRAPH_EDGE_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/hello-graph-edge@5",
  graphFunctionRef:
    "graph-function://abiogenesis/conformance/hello-graph-edge@5",
  graphRef: "graph://abiogenesis/conformance/hello-graph-edge@5",
  normalizeNodeRef:
    "node://abiogenesis/conformance/hello-graph-edge/normalize@5",
  renderNodeRef:
    "node://abiogenesis/conformance/hello-graph-edge/render@5",
  normalizeLocusRef:
    "locus://abiogenesis/conformance/hello-graph-edge/normalize@5",
  renderLocusRef:
    "locus://abiogenesis/conformance/hello-graph-edge/render@5",
});

export const WORKFLOW_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/hello-workflow@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/hello-workflow@5",
  graphRef: "graph://abiogenesis/conformance/hello-workflow@5",
  nodeRef: "node://abiogenesis/conformance/hello-workflow@5",
  evidenceContractRef:
    "contract://abiogenesis/conformance/hello-sub-traversal-evidence@5",
  closureContractRef:
    "contract://abiogenesis/conformance/hello-workflow-closure@5",
  judgmentPredicateRef:
    "predicate://abiogenesis/conformance/hello-world-result@5",
});

export const FP_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/fp-hello@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/fp-hello@5",
  graphRef: "graph://abiogenesis/conformance/fp-hello@5",
  nodeRef: "node://abiogenesis/conformance/fp-hello/fp-leaf@5",
  inputContractRef: "contract://abiogenesis/conformance/fp-hello-instruction@5",
  outputContractRef: "contract://abiogenesis/conformance/fp-hello-output@5",
  failureContractRef: "contract://abiogenesis/conformance/fp-hello-failure@5",
  refusalContractRef: "contract://abiogenesis/conformance/fp-hello-refusal@5",
  evidenceContractRef: "contract://abiogenesis/conformance/fp-hello-evidence@5",
  judgmentContractRef: "contract://abiogenesis/conformance/fp-hello-judgment@5",
  transitionContractRef: "contract://abiogenesis/conformance/fp-hello-transition@5",
  closureContractRef: "contract://abiogenesis/conformance/fp-hello-closure@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/conformance/fp-hello@5",
  implementationRef: "implementation://abiogenesis/conformance/fp-hello@5",
  armId: "arm://abiogenesis/conformance/fp-hello@5",
  judgmentPredicateRef: "predicate://abiogenesis/conformance/fp-hello-result@5",
  materializationPlanRef:
    "prompt-plan://abiogenesis/conformance/fp-hello@5",
  rendererRef: "renderer://abiogenesis/conformance/fp-hello@5",
  workerActorRef: "actor://abiogenesis/conformance/claude-worker@5",
  workerBindingRef: "worker-binding://abiogenesis/conformance/claude-worker@5",
});

export const FIBRE_SUBSTITUTION_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/fd-fp-hello@5",
  graphFunctionRef:
    "graph-function://abiogenesis/conformance/fd-fp-hello@5",
  graphRef: "graph://abiogenesis/conformance/fd-fp-hello@5",
  evidenceContractRef:
    "contract://abiogenesis/conformance/fd-fp-hello-evidence@5",
  closureContractRef:
    "contract://abiogenesis/conformance/fd-fp-hello-closure@5",
  implementationBindingRef:
    "implementation-binding://abiogenesis/conformance/fd-fp-hello@5",
  implementationRef:
    "implementation://abiogenesis/conformance/fd-fp-hello@5",
  armId: "arm://abiogenesis/conformance/fd-fp-hello@5",
});

export interface ConformanceJudgmentRelation {
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: unknown, output: unknown) => boolean;
}

export function isHelloWorldInput(value: unknown): value is Readonly<HelloWorldInput> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Readonly<Record<string, unknown>>).kind === "hello_world_input" &&
    (value as Readonly<Record<string, unknown>>).schemaVersion === "5.0.0" &&
    typeof (value as Readonly<Record<string, unknown>>).subject === "string";
}

export function isNormalizedHelloInput(
  value: unknown,
): value is Readonly<NormalizedHelloInput> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Readonly<Record<string, unknown>>).kind === "normalized_hello_input" &&
    (value as Readonly<Record<string, unknown>>).schemaVersion === "5.0.0" &&
    typeof (value as Readonly<Record<string, unknown>>).subject === "string";
}

export function evaluateHelloWorldResult(
  input: Readonly<HelloWorldInput>,
  output: Readonly<HelloWorldOutput>,
): boolean {
  return output.kind === "hello_world_output" &&
    output.schemaVersion === "5.0.0" &&
    output.message === `Hello ${input.subject}`;
}

export function evaluateNormalizedHelloResult(
  input: Readonly<HelloWorldInput>,
  output: Readonly<NormalizedHelloInput>,
): boolean {
  return output.kind === "normalized_hello_input" &&
    output.schemaVersion === "5.0.0" &&
    output.subject === input.subject.trim() &&
    output.subject.length > 0;
}

export function evaluateComposedHelloResult(
  input: Readonly<NormalizedHelloInput>,
  output: Readonly<HelloWorldOutput>,
): boolean {
  return output.kind === "hello_world_output" &&
    output.schemaVersion === "5.0.0" &&
    output.message === `Hello ${input.subject}`;
}

export function evaluateNormalizedIdentityResult(
  input: Readonly<NormalizedHelloInput>,
  output: Readonly<NormalizedHelloInput>,
): boolean {
  return output.kind === "normalized_hello_input" &&
    output.schemaVersion === "5.0.0" &&
    output.subject === input.subject;
}

export function resolveConformanceJudgmentRelation(
  predicateRef: string,
): Readonly<ConformanceJudgmentRelation> | null {
  switch (predicateRef) {
    case HELLO_WORLD_IDS.judgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-world-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-world-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isHelloWorldInput(input) &&
          isHelloWorldOutput(output) &&
          evaluateHelloWorldResult(input, output),
      });
    case COMPOSED_HELLO_IDS.normalizeJudgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-normalized@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-normalization-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isHelloWorldInput(input) &&
          isNormalizedHelloInput(output) &&
          evaluateNormalizedHelloResult(input, output),
      });
    case COMPOSED_HELLO_IDS.renderJudgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-compose-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-compose-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isNormalizedHelloInput(input) &&
          isHelloWorldOutput(output) &&
          evaluateComposedHelloResult(input, output),
      });
    case COMPOSED_HELLO_IDS.normalizedIdentityJudgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-normalized-preserved@5",
        rejectionReasonRef:
          "reason://abiogenesis/conformance/hello-normalized-identity-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isNormalizedHelloInput(input) &&
          isNormalizedHelloInput(output) &&
          evaluateNormalizedIdentityResult(input, output),
      });
    case FP_HELLO_IDS.judgmentPredicateRef:
      return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/fp-hello-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/fp-hello-rejected@5",
        evaluate: (input: unknown, output: unknown) =>
          isFpHelloInstruction(input) &&
          isFpHelloOutput(output) &&
          evaluateFpHelloResult(input, output),
      });
    default:
      return null;
  }
}

export function isHelloWorldOutput(value: unknown): value is Readonly<HelloWorldOutput> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Readonly<Record<string, unknown>>).kind === "hello_world_output" &&
    (value as Readonly<Record<string, unknown>>).schemaVersion === "5.0.0" &&
    typeof (value as Readonly<Record<string, unknown>>).message === "string";
}

export function isFpHelloInstruction(
  value: unknown,
): value is Readonly<FpHelloInstruction> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Readonly<Record<string, unknown>>;
  return record.kind === "fp_hello_instruction" &&
    record.schemaVersion === "5.0.0" &&
    record.materializationPlanRef === FP_HELLO_IDS.materializationPlanRef &&
    record.rendererRef === FP_HELLO_IDS.rendererRef &&
    record.instructionContractRef === FP_HELLO_IDS.inputContractRef &&
    record.resultContractRef === FP_HELLO_IDS.outputContractRef &&
    record.workerActorRef === FP_HELLO_IDS.workerActorRef &&
    record.workerBindingRef === FP_HELLO_IDS.workerBindingRef &&
    (record.transportLane === "closed_prompt_proof" ||
      record.transportLane === "worker_executes") &&
    typeof record.subject === "string" && record.subject.length > 0 &&
    typeof record.instruction === "string" && record.instruction.length > 0;
}

export function isFpHelloOutput(value: unknown): value is Readonly<FpHelloOutput> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Readonly<Record<string, unknown>>;
  return Object.keys(record).sort().join("\0") ===
      ["actorRef", "kind", "message", "resultContractRef", "schemaVersion"].join("\0") &&
    record.kind === "fp_hello_output" &&
    record.schemaVersion === "5.0.0" &&
    record.resultContractRef === FP_HELLO_IDS.outputContractRef &&
    record.actorRef === FP_HELLO_IDS.workerActorRef &&
    typeof record.message === "string" && record.message.length > 0;
}

export function isDeclaredConformanceValue(
  value: unknown,
  valueKind: string,
): value is Readonly<Record<string, JsonValue>> {
  switch (valueKind) {
    case "hello_world_output":
      return isHelloWorldOutput(value);
    case "normalized_hello_input":
      return isNormalizedHelloInput(value);
    case "fp_hello_output":
      return isFpHelloOutput(value);
    default:
      return false;
  }
}

export function evaluateFpHelloResult(
  input: Readonly<FpHelloInstruction>,
  output: Readonly<FpHelloOutput>,
): boolean {
  return output.resultContractRef === input.resultContractRef &&
    output.actorRef === input.workerActorRef &&
    output.message === `Hello ${input.subject}`;
}

export function constructHelloWorldInput(subject: string): Readonly<HelloWorldInput> {
  if (subject.length === 0) {
    throw new TypeError("Hello World input requires one non-empty subject");
  }
  return deepFreeze({
    kind: "hello_world_input",
    schemaVersion: "5.0.0",
    subject,
  });
}

export function constructFpHelloInstruction(
  subject: string,
  instruction: string,
  transportLane: FpHelloInstruction["transportLane"] = "closed_prompt_proof",
): Readonly<FpHelloInstruction> {
  if (subject.length === 0 || instruction.length === 0) {
    throw new TypeError("F_P Hello input requires one subject and instruction");
  }
  return deepFreeze({
    kind: "fp_hello_instruction" as const,
    schemaVersion: "5.0.0" as const,
    materializationPlanRef: FP_HELLO_IDS.materializationPlanRef,
    rendererRef: FP_HELLO_IDS.rendererRef,
    instructionContractRef: FP_HELLO_IDS.inputContractRef,
    resultContractRef: FP_HELLO_IDS.outputContractRef,
    workerActorRef: FP_HELLO_IDS.workerActorRef,
    workerBindingRef: FP_HELLO_IDS.workerBindingRef,
    transportLane,
    subject,
    instruction,
  });
}

export function constructHelloWorldModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const inputCarrier = cCarrier<HelloWorldInput>(HELLO_WORLD_IDS.inputContractRef);
  const outputCarrier = cCarrier<HelloWorldOutput>(HELLO_WORLD_IDS.outputContractRef);
  const normalizedInputCarrier = cCarrier<NormalizedHelloInput>(
    COMPOSED_HELLO_IDS.normalizedInputContractRef,
  );
  const fpInputCarrier = cCarrier<FpHelloInstruction>(FP_HELLO_IDS.inputContractRef);
  const fpOutputCarrier = cCarrier<FpHelloOutput>(FP_HELLO_IDS.outputContractRef);
  const contracts: readonly ContractDeclaration[] = [
    { contractRef: HELLO_WORLD_IDS.inputContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: "hello_world_input" },
    { contractRef: HELLO_WORLD_IDS.outputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "hello_world_output" },
    { contractRef: HELLO_WORLD_IDS.failureContractRef, contractVersion: "5.0.0", contractKind: "failure", valueKind: "hello_world_failure" },
    { contractRef: HELLO_WORLD_IDS.refusalContractRef, contractVersion: "5.0.0", contractKind: "refusal", valueKind: "hello_world_refusal" },
    { contractRef: HELLO_WORLD_IDS.evidenceContractRef, contractVersion: "5.0.0", contractKind: "evidence", valueKind: "deterministic_evidence_candidate" },
    { contractRef: HELLO_WORLD_IDS.judgmentContractRef, contractVersion: "5.0.0", contractKind: "judgment", valueKind: "hello_world_judgment" },
    { contractRef: HELLO_WORLD_IDS.transitionContractRef, contractVersion: "5.0.0", contractKind: "transition", valueKind: "hello_world_transition" },
    { contractRef: HELLO_WORLD_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "hello_world_closure" },
    { contractRef: WORKFLOW_HELLO_IDS.evidenceContractRef, contractVersion: "5.0.0", contractKind: "evidence", valueKind: "sub_traversal_evidence_candidate" },
    { contractRef: WORKFLOW_HELLO_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "hello_workflow_closure" },
    { contractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "normalized_hello_input" },
    { contractRef: FP_HELLO_IDS.inputContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: "fp_hello_instruction" },
    { contractRef: FP_HELLO_IDS.outputContractRef, contractVersion: "5.0.0", contractKind: "output", valueKind: "fp_hello_output" },
    { contractRef: FP_HELLO_IDS.failureContractRef, contractVersion: "5.0.0", contractKind: "failure", valueKind: "fp_hello_failure" },
    { contractRef: FP_HELLO_IDS.refusalContractRef, contractVersion: "5.0.0", contractKind: "refusal", valueKind: "fp_hello_refusal" },
    { contractRef: FP_HELLO_IDS.evidenceContractRef, contractVersion: "5.0.0", contractKind: "evidence", valueKind: "probabilistic_transport_evidence_candidate" },
    { contractRef: FP_HELLO_IDS.judgmentContractRef, contractVersion: "5.0.0", contractKind: "judgment", valueKind: "fp_hello_judgment" },
    { contractRef: FP_HELLO_IDS.transitionContractRef, contractVersion: "5.0.0", contractKind: "transition", valueKind: "fp_hello_transition" },
    { contractRef: FP_HELLO_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "fp_hello_closure" },
    { contractRef: FIBRE_SUBSTITUTION_HELLO_IDS.evidenceContractRef, contractVersion: "5.0.0", contractKind: "evidence", valueKind: "deterministic_evidence_candidate" },
    { contractRef: FIBRE_SUBSTITUTION_HELLO_IDS.closureContractRef, contractVersion: "5.0.0", contractKind: "closure", valueKind: "fp_hello_closure" },
  ];
  const implementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: HELLO_WORLD_IDS.implementationBindingRef,
    implementationRef: HELLO_WORLD_IDS.implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_world.js",
    namedSymbol: "realizeHelloWorld",
    computeRegime: "F_D",
    inputContractRef: HELLO_WORLD_IDS.inputContractRef,
    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const normalizeImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: COMPOSED_HELLO_IDS.normalizeImplementationBindingRef,
    implementationRef: COMPOSED_HELLO_IDS.normalizeImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "normalizeHelloInput",
    computeRegime: "F_D",
    inputContractRef: HELLO_WORLD_IDS.inputContractRef,
    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const passNormalizedImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: COMPOSED_HELLO_IDS.passNormalizedImplementationBindingRef,
    implementationRef: COMPOSED_HELLO_IDS.passNormalizedImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "passNormalizedHello",
    computeRegime: "F_D",
    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const renderImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: COMPOSED_HELLO_IDS.renderImplementationBindingRef,
    implementationRef: COMPOSED_HELLO_IDS.renderImplementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/hello_compose.js",
    namedSymbol: "renderNormalizedHello",
    computeRegime: "F_D",
    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
  };
  const fpImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: FP_HELLO_IDS.implementationBindingRef,
    implementationRef: FP_HELLO_IDS.implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/fp_hello.js",
    namedSymbol: "realizeFpHello",
    computeRegime: "F_P",
    inputContractRef: FP_HELLO_IDS.inputContractRef,
    outputContractRef: FP_HELLO_IDS.outputContractRef,
    failureContractRef: FP_HELLO_IDS.failureContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
  };
  const deterministicFpImplementationBinding: ImplementationBinding = {
    kind: "implementation_binding",
    bindingRef: FIBRE_SUBSTITUTION_HELLO_IDS.implementationBindingRef,
    implementationRef: FIBRE_SUBSTITUTION_HELLO_IDS.implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/fp_hello.js",
    namedSymbol: "realizeDeterministicFpHello",
    computeRegime: "F_D",
    inputContractRef: FP_HELLO_IDS.inputContractRef,
    outputContractRef: FP_HELLO_IDS.outputContractRef,
    failureContractRef: FP_HELLO_IDS.failureContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
  };
  const closureContract: ClosureContract = {
    kind: "closure_contract",
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    predicateRef: "predicate://abiogenesis/conformance/hello-world-terminal@5",
    evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
    resultContractRef: HELLO_WORLD_IDS.outputContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
    refusalValueKind: "hello_world_refusal",
    judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
    rejectionContractRef: HELLO_WORLD_IDS.refusalContractRef,
    transitionContractRef: HELLO_WORLD_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/conformance/hello-world-replay@5",
    terminalKind: "completed",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  };
  const fpClosureContract: ClosureContract = {
    kind: "closure_contract",
    closureContractRef: FP_HELLO_IDS.closureContractRef,
    predicateRef: "predicate://abiogenesis/conformance/fp-hello-terminal@5",
    evidenceContractRef: FP_HELLO_IDS.evidenceContractRef,
    resultContractRef: FP_HELLO_IDS.outputContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
    refusalValueKind: "fp_hello_refusal",
    judgmentContractRef: FP_HELLO_IDS.judgmentContractRef,
    rejectionContractRef: FP_HELLO_IDS.refusalContractRef,
    transitionContractRef: FP_HELLO_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/conformance/fp-hello-replay@5",
    terminalKind: "completed",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  };
  const deterministicFpClosureContract: ClosureContract = {
    kind: "closure_contract",
    closureContractRef: FIBRE_SUBSTITUTION_HELLO_IDS.closureContractRef,
    predicateRef: "predicate://abiogenesis/conformance/fd-fp-hello-terminal@5",
    evidenceContractRef: FIBRE_SUBSTITUTION_HELLO_IDS.evidenceContractRef,
    resultContractRef: FP_HELLO_IDS.outputContractRef,
    refusalContractRef: FP_HELLO_IDS.refusalContractRef,
    refusalValueKind: "fp_hello_refusal",
    judgmentContractRef: FP_HELLO_IDS.judgmentContractRef,
    rejectionContractRef: FP_HELLO_IDS.refusalContractRef,
    transitionContractRef: FP_HELLO_IDS.transitionContractRef,
    replayProjectionRef:
      "projection://abiogenesis/conformance/fd-fp-hello-replay@5",
    terminalKind: "completed",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  };
  const workflowClosureContract: ClosureContract = {
    kind: "closure_contract",
    closureContractRef: WORKFLOW_HELLO_IDS.closureContractRef,
    predicateRef: "predicate://abiogenesis/conformance/hello-world-terminal@5",
    evidenceContractRef: WORKFLOW_HELLO_IDS.evidenceContractRef,
    resultContractRef: HELLO_WORLD_IDS.outputContractRef,
    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
    refusalValueKind: "hello_world_refusal",
    judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
    rejectionContractRef: HELLO_WORLD_IDS.refusalContractRef,
    transitionContractRef: HELLO_WORLD_IDS.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/conformance/hello-workflow-replay@5",
    terminalKind: "completed",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  };
  const graphFunction: GraphFunction = {
    kind: "graph_function",
    name: HELLO_WORLD_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [HELLO_WORLD_IDS.inputContractRef],
      provides: [HELLO_WORLD_IDS.outputContractRef],
      carries: [HELLO_WORLD_IDS.inputContractRef, HELLO_WORLD_IDS.outputContractRef],
    },
    inputs: [HELLO_WORLD_IDS.inputContractRef],
    outputs: [HELLO_WORLD_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: HELLO_WORLD_IDS.graphRef,
      startNodeRef: HELLO_WORLD_IDS.nodeRef,
      terminalNodeRefs: [HELLO_WORLD_IDS.nodeRef],
      nodes: [
        {
          nodeRef: HELLO_WORLD_IDS.nodeRef,
          nodeKind: "c_locus",
          term: C.of({
            input: inputCarrier,
            output: outputCarrier,
            programLocusRef: HELLO_WORLD_IDS.nodeRef,
            stageRole: "result",
            fibre: "F_D",
            armId: HELLO_WORLD_IDS.armId,
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef: HELLO_WORLD_IDS.judgmentPredicateRef,
            resultBearing: true,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef: HELLO_WORLD_IDS.implementationBindingRef,
              inputContractRef: HELLO_WORLD_IDS.inputContractRef,
              outputContractRef: HELLO_WORLD_IDS.outputContractRef,
              evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
              failureContractRef: HELLO_WORLD_IDS.failureContractRef,
              refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
              judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
            },
          }),
        },
      ],
      edges: [],
      applications: [],
    },
    effects: ["effect://abiogenesis/conformance/emit-hello-output@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": HELLO_WORLD_IDS.closureContractRef,
      "abg.evidence_contract": HELLO_WORLD_IDS.evidenceContractRef,
      "abg.judgment_contract": HELLO_WORLD_IDS.judgmentContractRef,
      "abg.judgment_predicate": HELLO_WORLD_IDS.judgmentPredicateRef,
      "abg.transition_contract": HELLO_WORLD_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "hello-world", "all-fd"],
  };
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: HELLO_WORLD_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [
      {
        startRef: "start://abiogenesis/conformance/hello-world@5",
        graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
      },
    ],
    callableMembership: [HELLO_WORLD_IDS.graphFunctionRef],
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const workflowGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: WORKFLOW_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [HELLO_WORLD_IDS.inputContractRef],
      provides: [HELLO_WORLD_IDS.outputContractRef],
      carries: [HELLO_WORLD_IDS.inputContractRef, HELLO_WORLD_IDS.outputContractRef],
    },
    inputs: [HELLO_WORLD_IDS.inputContractRef],
    outputs: [HELLO_WORLD_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: WORKFLOW_HELLO_IDS.graphRef,
      startNodeRef: WORKFLOW_HELLO_IDS.nodeRef,
      terminalNodeRefs: [WORKFLOW_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: WORKFLOW_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: workflow.C(cGraphFunctionRef({
          graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
          input: inputCarrier,
          output: outputCarrier,
        })),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": WORKFLOW_HELLO_IDS.closureContractRef,
      "abg.evidence_contract": WORKFLOW_HELLO_IDS.evidenceContractRef,
      "abg.judgment_contract": HELLO_WORLD_IDS.judgmentContractRef,
      "abg.judgment_predicate": WORKFLOW_HELLO_IDS.judgmentPredicateRef,
      "abg.transition_contract": HELLO_WORLD_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "hello-world", "workflow"],
  };
  const workflowProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: WORKFLOW_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/hello-workflow@5",
      graphFunctionRef: WORKFLOW_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [
      WORKFLOW_HELLO_IDS.graphFunctionRef,
      HELLO_WORLD_IDS.graphFunctionRef,
    ],
    closureContractRef: WORKFLOW_HELLO_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const composedGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: COMPOSED_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [HELLO_WORLD_IDS.inputContractRef],
      provides: [HELLO_WORLD_IDS.outputContractRef],
      carries: [
        HELLO_WORLD_IDS.inputContractRef,
        COMPOSED_HELLO_IDS.normalizedInputContractRef,
        HELLO_WORLD_IDS.outputContractRef,
      ],
    },
    inputs: [HELLO_WORLD_IDS.inputContractRef],
    outputs: [HELLO_WORLD_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: COMPOSED_HELLO_IDS.graphRef,
      startNodeRef: COMPOSED_HELLO_IDS.nodeRef,
      terminalNodeRefs: [COMPOSED_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: COMPOSED_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.of({
            input: inputCarrier,
            output: normalizedInputCarrier,
            programLocusRef: COMPOSED_HELLO_IDS.normalizeLocusRef,
            stageRole: "transform",
            fibre: "F_D",
            armId: COMPOSED_HELLO_IDS.normalizeArmId,
            compositionRef: COMPOSED_HELLO_IDS.compositionRef,
            vectorIndex: 0,
            judgmentPredicateRef: COMPOSED_HELLO_IDS.normalizeJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                COMPOSED_HELLO_IDS.normalizeImplementationBindingRef,
              inputContractRef: HELLO_WORLD_IDS.inputContractRef,
              outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
              evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
              failureContractRef: HELLO_WORLD_IDS.failureContractRef,
              refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
              judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
            },
          }),
          C.compose(
            C.batch([
              C.of({
                input: normalizedInputCarrier,
                output: normalizedInputCarrier,
                programLocusRef: COMPOSED_HELLO_IDS.batchFirstLocusRef,
                stageRole: "batch_check",
                fibre: "F_D",
                armId: COMPOSED_HELLO_IDS.passNormalizedArmId,
                compositionRef: COMPOSED_HELLO_IDS.compositionRef,
                vectorIndex: 1,
                judgmentPredicateRef:
                  COMPOSED_HELLO_IDS.normalizedIdentityJudgmentPredicateRef,
                resultBearing: false,
                requirement: {
                  kind: "executable_leaf_requirement",
                  implementationBindingRef:
                    COMPOSED_HELLO_IDS.passNormalizedImplementationBindingRef,
                  inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                  outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                  evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
                  failureContractRef: HELLO_WORLD_IDS.failureContractRef,
                  refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
                  judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
                },
              }),
              C.of({
                input: normalizedInputCarrier,
                output: normalizedInputCarrier,
                programLocusRef: COMPOSED_HELLO_IDS.batchSecondLocusRef,
                stageRole: "batch_check",
                fibre: "F_D",
                armId: COMPOSED_HELLO_IDS.passNormalizedArmId,
                compositionRef: COMPOSED_HELLO_IDS.compositionRef,
                vectorIndex: 2,
                judgmentPredicateRef:
                  COMPOSED_HELLO_IDS.normalizedIdentityJudgmentPredicateRef,
                resultBearing: false,
                requirement: {
                  kind: "executable_leaf_requirement",
                  implementationBindingRef:
                    COMPOSED_HELLO_IDS.passNormalizedImplementationBindingRef,
                  inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                  outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                  evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
                  failureContractRef: HELLO_WORLD_IDS.failureContractRef,
                  refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
                  judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
                },
              }),
            ], COMPOSED_HELLO_IDS.batchRef),
            C.retry(
              C.edge({
                transform: C.of({
                  input: normalizedInputCarrier,
                  output: normalizedInputCarrier,
                  programLocusRef: COMPOSED_HELLO_IDS.edgeTransformLocusRef,
                  stageRole: "transform",
                  fibre: "F_D",
                  armId: COMPOSED_HELLO_IDS.passNormalizedArmId,
                  compositionRef: COMPOSED_HELLO_IDS.compositionRef,
                  vectorIndex: 3,
                  judgmentPredicateRef:
                    COMPOSED_HELLO_IDS.normalizedIdentityJudgmentPredicateRef,
                  resultBearing: false,
                  requirement: {
                    kind: "executable_leaf_requirement",
                    implementationBindingRef:
                      COMPOSED_HELLO_IDS.passNormalizedImplementationBindingRef,
                    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                    evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
                    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
                    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
                    judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
                  },
                }),
                evaluate: C.of({
                  input: normalizedInputCarrier,
                  output: normalizedInputCarrier,
                  programLocusRef: COMPOSED_HELLO_IDS.edgeEvaluateLocusRef,
                  stageRole: "evaluate",
                  fibre: "F_D",
                  armId: COMPOSED_HELLO_IDS.passNormalizedArmId,
                  compositionRef: COMPOSED_HELLO_IDS.compositionRef,
                  vectorIndex: 4,
                  judgmentPredicateRef:
                    COMPOSED_HELLO_IDS.normalizedIdentityJudgmentPredicateRef,
                  resultBearing: false,
                  requirement: {
                    kind: "executable_leaf_requirement",
                    implementationBindingRef:
                      COMPOSED_HELLO_IDS.passNormalizedImplementationBindingRef,
                    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                    outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                    evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
                    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
                    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
                    judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
                  },
                }),
                consequence: C.of({
                  input: normalizedInputCarrier,
                  output: outputCarrier,
                  programLocusRef: COMPOSED_HELLO_IDS.renderLocusRef,
                  stageRole: "consequence",
                  fibre: "F_D",
                  armId: COMPOSED_HELLO_IDS.renderArmId,
                  compositionRef: COMPOSED_HELLO_IDS.compositionRef,
                  vectorIndex: 5,
                  judgmentPredicateRef: COMPOSED_HELLO_IDS.renderJudgmentPredicateRef,
                  resultBearing: true,
                  requirement: {
                    kind: "executable_leaf_requirement",
                    implementationBindingRef:
                      COMPOSED_HELLO_IDS.renderImplementationBindingRef,
                    inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
                    outputContractRef: HELLO_WORLD_IDS.outputContractRef,
                    evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
                    failureContractRef: HELLO_WORLD_IDS.failureContractRef,
                    refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
                    judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
                  },
                }),
              }),
              2,
            ),
          ),
        ),
      }],
      edges: [],
      applications: [],
    },
    effects: [
      "effect://abiogenesis/conformance/normalize-hello-input@5",
      "effect://abiogenesis/conformance/emit-hello-output@5",
    ],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": HELLO_WORLD_IDS.closureContractRef,
      "abg.evidence_contract": HELLO_WORLD_IDS.evidenceContractRef,
      "abg.transition_contract": HELLO_WORLD_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "hello-compose", "all-fd"],
  };
  const composedProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: COMPOSED_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/hello-compose@5",
      graphFunctionRef: COMPOSED_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [COMPOSED_HELLO_IDS.graphFunctionRef],
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const graphEdgeRelation = graphEdge({
    fromNodeRef: GRAPH_EDGE_HELLO_IDS.normalizeNodeRef,
    toNodeRef: GRAPH_EDGE_HELLO_IDS.renderNodeRef,
  });
  const graphEdgeGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [HELLO_WORLD_IDS.inputContractRef],
      provides: [HELLO_WORLD_IDS.outputContractRef],
      carries: [
        HELLO_WORLD_IDS.inputContractRef,
        COMPOSED_HELLO_IDS.normalizedInputContractRef,
        HELLO_WORLD_IDS.outputContractRef,
      ],
    },
    inputs: [HELLO_WORLD_IDS.inputContractRef],
    outputs: [HELLO_WORLD_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: GRAPH_EDGE_HELLO_IDS.graphRef,
      startNodeRef: GRAPH_EDGE_HELLO_IDS.normalizeNodeRef,
      terminalNodeRefs: [GRAPH_EDGE_HELLO_IDS.renderNodeRef],
      nodes: [{
        nodeRef: GRAPH_EDGE_HELLO_IDS.normalizeNodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: inputCarrier,
          output: normalizedInputCarrier,
          programLocusRef: GRAPH_EDGE_HELLO_IDS.normalizeLocusRef,
          stageRole: "transform",
          fibre: "F_D",
          armId: COMPOSED_HELLO_IDS.normalizeArmId,
          compositionRef: graphEdgeRelation.edgeRef,
          vectorIndex: 0,
          judgmentPredicateRef: COMPOSED_HELLO_IDS.normalizeJudgmentPredicateRef,
          resultBearing: false,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              COMPOSED_HELLO_IDS.normalizeImplementationBindingRef,
            inputContractRef: HELLO_WORLD_IDS.inputContractRef,
            outputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
            evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
            failureContractRef: HELLO_WORLD_IDS.failureContractRef,
            refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
            judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
          },
        }),
      }, {
        nodeRef: GRAPH_EDGE_HELLO_IDS.renderNodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: normalizedInputCarrier,
          output: outputCarrier,
          programLocusRef: GRAPH_EDGE_HELLO_IDS.renderLocusRef,
          stageRole: "consequence",
          fibre: "F_D",
          armId: COMPOSED_HELLO_IDS.renderArmId,
          compositionRef: graphEdgeRelation.edgeRef,
          vectorIndex: 1,
          judgmentPredicateRef: COMPOSED_HELLO_IDS.renderJudgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              COMPOSED_HELLO_IDS.renderImplementationBindingRef,
            inputContractRef: COMPOSED_HELLO_IDS.normalizedInputContractRef,
            outputContractRef: HELLO_WORLD_IDS.outputContractRef,
            evidenceContractRef: HELLO_WORLD_IDS.evidenceContractRef,
            failureContractRef: HELLO_WORLD_IDS.failureContractRef,
            refusalContractRef: HELLO_WORLD_IDS.refusalContractRef,
            judgmentContractRef: HELLO_WORLD_IDS.judgmentContractRef,
          },
        }),
      }],
      edges: [graphEdgeRelation],
      applications: [],
    },
    effects: [
      "effect://abiogenesis/conformance/normalize-hello-input@5",
      "effect://abiogenesis/conformance/emit-hello-output@5",
    ],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": HELLO_WORLD_IDS.closureContractRef,
      "abg.evidence_contract": HELLO_WORLD_IDS.evidenceContractRef,
      "abg.transition_contract": HELLO_WORLD_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "hello-world", "graph-edge"],
  };
  const graphEdgeProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: GRAPH_EDGE_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/hello-graph-edge@5",
      graphFunctionRef: GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [GRAPH_EDGE_HELLO_IDS.graphFunctionRef],
    closureContractRef: HELLO_WORLD_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const fpGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: FP_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [FP_HELLO_IDS.inputContractRef],
      provides: [FP_HELLO_IDS.outputContractRef],
      carries: [FP_HELLO_IDS.inputContractRef, FP_HELLO_IDS.outputContractRef],
    },
    inputs: [FP_HELLO_IDS.inputContractRef],
    outputs: [FP_HELLO_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: FP_HELLO_IDS.graphRef,
      startNodeRef: FP_HELLO_IDS.nodeRef,
      terminalNodeRefs: [FP_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: FP_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: fpInputCarrier,
          output: fpOutputCarrier,
          programLocusRef: FP_HELLO_IDS.nodeRef,
          stageRole: "result",
          fibre: "F_P",
          armId: FP_HELLO_IDS.armId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: FP_HELLO_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef: FP_HELLO_IDS.implementationBindingRef,
            inputContractRef: FP_HELLO_IDS.inputContractRef,
            outputContractRef: FP_HELLO_IDS.outputContractRef,
            evidenceContractRef: FP_HELLO_IDS.evidenceContractRef,
            failureContractRef: FP_HELLO_IDS.failureContractRef,
            refusalContractRef: FP_HELLO_IDS.refusalContractRef,
            judgmentContractRef: FP_HELLO_IDS.judgmentContractRef,
          },
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://abiogenesis/conformance/emit-fp-hello-output@5"],
    declarations: {
      "abg.compute_regime": "F_P",
      "abg.closure_contract": FP_HELLO_IDS.closureContractRef,
      "abg.evidence_contract": FP_HELLO_IDS.evidenceContractRef,
      "abg.instruction_plan": FP_HELLO_IDS.materializationPlanRef,
      "abg.judgment_contract": FP_HELLO_IDS.judgmentContractRef,
      "abg.judgment_predicate": FP_HELLO_IDS.judgmentPredicateRef,
      "abg.renderer": FP_HELLO_IDS.rendererRef,
      "abg.transition_contract": FP_HELLO_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "fp-hello", "fp"],
  };
  const fpProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: FP_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/fp-hello@5",
      graphFunctionRef: FP_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [FP_HELLO_IDS.graphFunctionRef],
    closureContractRef: FP_HELLO_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_P",
      "abg.instruction_plan": FP_HELLO_IDS.materializationPlanRef,
    },
  };
  const deterministicFpGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: FIBRE_SUBSTITUTION_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [FP_HELLO_IDS.inputContractRef],
      provides: [FP_HELLO_IDS.outputContractRef],
      carries: [FP_HELLO_IDS.inputContractRef, FP_HELLO_IDS.outputContractRef],
    },
    inputs: [FP_HELLO_IDS.inputContractRef],
    outputs: [FP_HELLO_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: FIBRE_SUBSTITUTION_HELLO_IDS.graphRef,
      startNodeRef: FP_HELLO_IDS.nodeRef,
      terminalNodeRefs: [FP_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: FP_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: fpInputCarrier,
          output: fpOutputCarrier,
          programLocusRef: FP_HELLO_IDS.nodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId: FIBRE_SUBSTITUTION_HELLO_IDS.armId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: FP_HELLO_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              FIBRE_SUBSTITUTION_HELLO_IDS.implementationBindingRef,
            inputContractRef: FP_HELLO_IDS.inputContractRef,
            outputContractRef: FP_HELLO_IDS.outputContractRef,
            evidenceContractRef:
              FIBRE_SUBSTITUTION_HELLO_IDS.evidenceContractRef,
            failureContractRef: FP_HELLO_IDS.failureContractRef,
            refusalContractRef: FP_HELLO_IDS.refusalContractRef,
            judgmentContractRef: FP_HELLO_IDS.judgmentContractRef,
          },
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://abiogenesis/conformance/emit-fp-hello-output@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract":
        FIBRE_SUBSTITUTION_HELLO_IDS.closureContractRef,
      "abg.evidence_contract":
        FIBRE_SUBSTITUTION_HELLO_IDS.evidenceContractRef,
      "abg.judgment_contract": FP_HELLO_IDS.judgmentContractRef,
      "abg.judgment_predicate": FP_HELLO_IDS.judgmentPredicateRef,
      "abg.transition_contract": FP_HELLO_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "fp-hello", "fibre-substitution", "fd"],
  };
  const deterministicFpProgram: GtlProgram = {
    kind: "gtl_program",
    programRef: FIBRE_SUBSTITUTION_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/fd-fp-hello@5",
      graphFunctionRef: FIBRE_SUBSTITUTION_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [FIBRE_SUBSTITUTION_HELLO_IDS.graphFunctionRef],
    closureContractRef: FIBRE_SUBSTITUTION_HELLO_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const contribution: CatalogContribution = {
    handle: HELLO_WORLD_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: HELLO_WORLD_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [
      HELLO_WORLD_IDS.programRef,
      WORKFLOW_HELLO_IDS.programRef,
    ],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const workflowContribution: CatalogContribution = {
    handle: WORKFLOW_HELLO_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: WORKFLOW_HELLO_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [WORKFLOW_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const composedContribution: CatalogContribution = {
    handle: COMPOSED_HELLO_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: COMPOSED_HELLO_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [COMPOSED_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const graphEdgeContribution: CatalogContribution = {
    handle: GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [GRAPH_EDGE_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const fpContribution: CatalogContribution = {
    handle: FP_HELLO_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: FP_HELLO_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [FP_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const deterministicFpContribution: CatalogContribution = {
    handle: FIBRE_SUBSTITUTION_HELLO_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef:
      FIBRE_SUBSTITUTION_HELLO_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [FIBRE_SUBSTITUTION_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  };
  const publicationBody = {
    kind: "module_publication" as const,
    moduleRef: HELLO_WORLD_IDS.moduleRef,
    moduleVersion: "5.0.0" as const,
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice("sha256:".length)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice("sha256:".length)}`,
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [
      implementationBinding,
      normalizeImplementationBinding,
      passNormalizedImplementationBinding,
      renderImplementationBinding,
      fpImplementationBinding,
      deterministicFpImplementationBinding,
    ],
    closureContracts: [
      closureContract,
      workflowClosureContract,
      fpClosureContract,
      deterministicFpClosureContract,
    ],
    programs: [
      program,
      workflowProgram,
      composedProgram,
      graphEdgeProgram,
      fpProgram,
      deterministicFpProgram,
    ],
    graphFunctions: [
      graphFunction,
      workflowGraphFunction,
      composedGraphFunction,
      graphEdgeGraphFunction,
      fpGraphFunction,
      deterministicFpGraphFunction,
    ],
    contributions: [
      contribution,
      workflowContribution,
      composedContribution,
      graphEdgeContribution,
      fpContribution,
      deterministicFpContribution,
    ],
  };
  return deepFreeze(publicationBody) as Readonly<ModulePublication>;
}
