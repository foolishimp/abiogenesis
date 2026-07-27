import type {
  BoundedRecursionState,
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  RootModuleArtifactBasis,
  RuleDeclaration,
} from "./contracts.js";
import { C, cCarrier } from "./c_algebra.js";
import {
  catalogContribution,
  closureContract,
  contractDeclaration,
  evaluatorDeclaration,
  implementationBinding as declareImplementationBinding,
  ruleDeclaration,
} from "./declarations.js";
import { recurseApplication } from "./graph_applications.js";
import { deepFreeze } from "../shared/immutable.js";

export const RECURSION_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/bounded-recursion@5",
  graphFunctionRef:
    "graph-function://abiogenesis/conformance/bounded-recursion@5",
  childGraphFunctionRef:
    "graph-function://abiogenesis/conformance/bounded-recursion-step@5",
  graphRef: "graph://abiogenesis/conformance/bounded-recursion@5",
  childGraphRef:
    "graph://abiogenesis/conformance/bounded-recursion-step@5",
  nodeRef: "node://abiogenesis/conformance/bounded-recursion/evaluate@5",
  childNodeRef:
    "node://abiogenesis/conformance/bounded-recursion/step@5",
  inputContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-input@5",
  outputContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-output@5",
  failureContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-failure@5",
  refusalContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-refusal@5",
  evidenceContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-evidence@5",
  judgmentContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-judgment@5",
  transitionContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-transition@5",
  closureContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-closure@5",
  childClosureContractRef:
    "contract://abiogenesis/conformance/bounded-recursion-step-closure@5",
  evaluatorImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/bounded-recursion-evaluate@5",
  evaluatorImplementationRef:
    "implementation://abiogenesis/conformance/bounded-recursion-evaluate@5",
  childImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/bounded-recursion-step@5",
  childImplementationRef:
    "implementation://abiogenesis/conformance/bounded-recursion-step@5",
  evaluatorArmId:
    "arm://abiogenesis/conformance/bounded-recursion/evaluate@5",
  childArmId:
    "arm://abiogenesis/conformance/bounded-recursion/step@5",
  evaluatorRef:
    "evaluator://abiogenesis/conformance/bounded-recursion-terminal@5",
  terminationRuleRef:
    "rule://abiogenesis/conformance/bounded-recursion-terminal@5",
  evaluatorJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/bounded-recursion-evaluation@5",
  childJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/bounded-recursion-step@5",
  bound: 4,
});

export interface RecursionPublicationParts {
  readonly contracts: readonly ContractDeclaration[];
  readonly evaluators: readonly EvaluatorDeclaration[];
  readonly rules: readonly RuleDeclaration[];
  readonly implementationBindings: readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}

export function isBoundedRecursionState(
  value: unknown,
): value is Readonly<BoundedRecursionState> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Readonly<Record<string, unknown>>;
  return Object.keys(record).sort().join("\0") ===
      [
        "blockedChildRemaining",
        "kind",
        "remaining",
        "schemaVersion",
        "terminal",
        "trace",
      ].join("\0") &&
    record.kind === "bounded_recursion_state" &&
    record.schemaVersion === "5.0.0" &&
    (
      record.blockedChildRemaining === null ||
      (
        Number.isSafeInteger(record.blockedChildRemaining) &&
        (record.blockedChildRemaining as number) > 0
      )
    ) &&
    Number.isSafeInteger(record.remaining) &&
    (record.remaining as number) >= 0 &&
    typeof record.terminal === "boolean" &&
    Array.isArray(record.trace) &&
    record.trace.every(
      (entry) => Number.isSafeInteger(entry) && (entry as number) >= 0,
    );
}

export function evaluateRecursionTermination(
  input: Readonly<BoundedRecursionState>,
  output: Readonly<BoundedRecursionState>,
): boolean {
  return output.remaining === input.remaining &&
    output.blockedChildRemaining === input.blockedChildRemaining &&
    output.terminal === (input.remaining === 0) &&
    output.trace.join("\0") === input.trace.join("\0");
}

export function evaluateRecursionStep(
  input: Readonly<BoundedRecursionState>,
  output: Readonly<BoundedRecursionState>,
): boolean {
  return input.remaining > 0 &&
    input.blockedChildRemaining !== input.remaining &&
    output.remaining === input.remaining - 1 &&
    output.blockedChildRemaining === input.blockedChildRemaining &&
    output.terminal === false &&
    output.trace.join("\0") === [...input.trace, input.remaining - 1].join("\0");
}

export function resolveRecursionJudgmentRelation(
  predicateRef: string,
): Readonly<{
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null {
  if (predicateRef === RECURSION_HELLO_IDS.evaluatorJudgmentPredicateRef) {
    return Object.freeze({
      predicateRef,
      advanceReasonRef:
        "reason://abiogenesis/conformance/bounded-recursion-evaluated@5",
      rejectionReasonRef:
        "reason://abiogenesis/conformance/bounded-recursion-evaluation-rejected@5",
      evaluate: (input: unknown, output: unknown) =>
        isBoundedRecursionState(input) &&
        isBoundedRecursionState(output) &&
        evaluateRecursionTermination(input, output),
    });
  }
  if (predicateRef === RECURSION_HELLO_IDS.childJudgmentPredicateRef) {
    return Object.freeze({
      predicateRef,
      advanceReasonRef:
        "reason://abiogenesis/conformance/bounded-recursion-step-admitted@5",
      rejectionReasonRef:
        "reason://abiogenesis/conformance/bounded-recursion-step-rejected@5",
      evaluate: (input: unknown, output: unknown) =>
        isBoundedRecursionState(input) &&
        isBoundedRecursionState(output) &&
        evaluateRecursionStep(input, output),
    });
  }
  return null;
}

export function constructBoundedRecursionState(
  remaining: number,
  blockedChildRemaining: number | null = null,
): Readonly<BoundedRecursionState> {
  if (
    !Number.isSafeInteger(remaining) ||
    remaining < 0 ||
    (
      blockedChildRemaining !== null &&
      (
        !Number.isSafeInteger(blockedChildRemaining) ||
        blockedChildRemaining < 1
      )
    )
  ) {
    throw new TypeError(
      "bounded recursion requires a non-negative bound and optional positive child-stop point",
    );
  }
  return deepFreeze({
    kind: "bounded_recursion_state",
    schemaVersion: "5.0.0",
    blockedChildRemaining,
    remaining,
    terminal: remaining === 0,
    trace: [],
  });
}

export function constructRecursionPublicationParts(
  artifact: RootModuleArtifactBasis,
  moduleRef: string,
): Readonly<RecursionPublicationParts> {
  const inputState = cCarrier<BoundedRecursionState>(
    RECURSION_HELLO_IDS.inputContractRef,
  );
  const outputState = cCarrier<BoundedRecursionState>(
    RECURSION_HELLO_IDS.outputContractRef,
  );
  const evaluator = evaluatorDeclaration({
    name: RECURSION_HELLO_IDS.evaluatorRef,
    regime: "F_D",
    description: "Evaluates the declared bounded-recursion terminal field.",
    binding: RECURSION_HELLO_IDS.evaluatorImplementationRef,
    consumedFieldRefs: ["$.terminal"],
    tags: ["bounded", "recursion", "termination"],
  });
  const rule = ruleDeclaration({
    name: RECURSION_HELLO_IDS.terminationRuleRef,
    kind: "boolean_field_termination",
    config: {
      fieldRef: "$.terminal",
      terminalValue: true,
    },
    tags: ["bounded", "recursion", "termination"],
  });
  const application = recurseApplication({
    inputContractRef: RECURSION_HELLO_IDS.inputContractRef,
    outputContractRef: RECURSION_HELLO_IDS.outputContractRef,
    graphFunctionRef: RECURSION_HELLO_IDS.childGraphFunctionRef,
    terminationRuleRef: rule.name,
    terminationEvaluatorRefs: [evaluator.name],
    terminationFieldRef: "$.terminal",
    foldback: {
      mode: "rebind",
      binding: "$",
      requiresParentEvaluation: true,
    },
    bound: RECURSION_HELLO_IDS.bound,
  });
  const executableRequirement = (
    implementationBindingRef: string,
    inputContractRef: string,
  ) => ({
    kind: "executable_leaf_requirement" as const,
    implementationBindingRef,
    inputContractRef,
    outputContractRef: RECURSION_HELLO_IDS.outputContractRef,
    evidenceContractRef: RECURSION_HELLO_IDS.evidenceContractRef,
    failureContractRef: RECURSION_HELLO_IDS.failureContractRef,
    refusalContractRef: RECURSION_HELLO_IDS.refusalContractRef,
    judgmentContractRef: RECURSION_HELLO_IDS.judgmentContractRef,
  });
  const graphFunction: GraphFunction = {
    kind: "graph_function",
    name: RECURSION_HELLO_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [RECURSION_HELLO_IDS.inputContractRef],
      provides: [RECURSION_HELLO_IDS.outputContractRef],
      carries: [
        RECURSION_HELLO_IDS.inputContractRef,
        RECURSION_HELLO_IDS.outputContractRef,
      ],
    },
    inputs: [RECURSION_HELLO_IDS.inputContractRef],
    outputs: [RECURSION_HELLO_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: RECURSION_HELLO_IDS.graphRef,
      startNodeRef: RECURSION_HELLO_IDS.nodeRef,
      terminalNodeRefs: [RECURSION_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: RECURSION_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: inputState,
          output: outputState,
          programLocusRef: RECURSION_HELLO_IDS.nodeRef,
          stageRole: "termination",
          fibre: "F_D",
          armId: RECURSION_HELLO_IDS.evaluatorArmId,
          compositionRef: application.applicationRef,
          vectorIndex: 0,
          judgmentPredicateRef:
            RECURSION_HELLO_IDS.evaluatorJudgmentPredicateRef,
          resultBearing: true,
          requirement: executableRequirement(
            RECURSION_HELLO_IDS.evaluatorImplementationBindingRef,
            RECURSION_HELLO_IDS.inputContractRef,
          ),
        }),
      }],
      edges: [],
      applications: [application],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": RECURSION_HELLO_IDS.closureContractRef,
      "abg.evidence_contract": RECURSION_HELLO_IDS.evidenceContractRef,
      "abg.judgment_contract": RECURSION_HELLO_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        RECURSION_HELLO_IDS.evaluatorJudgmentPredicateRef,
      "abg.transition_contract": RECURSION_HELLO_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "bounded-recursion", "all-fd"],
  };
  const childGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: RECURSION_HELLO_IDS.childGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [RECURSION_HELLO_IDS.inputContractRef],
      provides: [RECURSION_HELLO_IDS.outputContractRef],
      carries: [
        RECURSION_HELLO_IDS.inputContractRef,
        RECURSION_HELLO_IDS.outputContractRef,
      ],
    },
    inputs: [RECURSION_HELLO_IDS.inputContractRef],
    outputs: [RECURSION_HELLO_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: RECURSION_HELLO_IDS.childGraphRef,
      startNodeRef: RECURSION_HELLO_IDS.childNodeRef,
      terminalNodeRefs: [RECURSION_HELLO_IDS.childNodeRef],
      nodes: [{
        nodeRef: RECURSION_HELLO_IDS.childNodeRef,
        nodeKind: "c_locus",
        term: C.of({
          input: inputState,
          output: outputState,
          programLocusRef: RECURSION_HELLO_IDS.childNodeRef,
          stageRole: "recursion_step",
          fibre: "F_D",
          armId: RECURSION_HELLO_IDS.childArmId,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            RECURSION_HELLO_IDS.childJudgmentPredicateRef,
          resultBearing: true,
          requirement: executableRequirement(
            RECURSION_HELLO_IDS.childImplementationBindingRef,
            RECURSION_HELLO_IDS.inputContractRef,
          ),
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract":
        RECURSION_HELLO_IDS.childClosureContractRef,
      "abg.child_closure_contract":
        RECURSION_HELLO_IDS.childClosureContractRef,
      "abg.evidence_contract": RECURSION_HELLO_IDS.evidenceContractRef,
      "abg.judgment_contract": RECURSION_HELLO_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        RECURSION_HELLO_IDS.childJudgmentPredicateRef,
      "abg.transition_contract": RECURSION_HELLO_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "bounded-recursion-step", "all-fd"],
  };
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: RECURSION_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/bounded-recursion@5",
      graphFunctionRef: RECURSION_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [
      RECURSION_HELLO_IDS.graphFunctionRef,
      RECURSION_HELLO_IDS.childGraphFunctionRef,
    ],
    closureContractRef: RECURSION_HELLO_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const contracts = [
    {
      contractRef: RECURSION_HELLO_IDS.inputContractRef,
      contractVersion: "5.0.0",
      contractKind: "input",
      valueKind: "bounded_recursion_state",
    },
    {
      contractRef: RECURSION_HELLO_IDS.outputContractRef,
      contractVersion: "5.0.0",
      contractKind: "output",
      valueKind: "bounded_recursion_state",
    },
    {
      contractRef: RECURSION_HELLO_IDS.failureContractRef,
      contractVersion: "5.0.0",
      contractKind: "failure",
      valueKind: "bounded_recursion_failure",
    },
    {
      contractRef: RECURSION_HELLO_IDS.refusalContractRef,
      contractVersion: "5.0.0",
      contractKind: "refusal",
      valueKind: "bounded_recursion_refusal",
    },
    {
      contractRef: RECURSION_HELLO_IDS.evidenceContractRef,
      contractVersion: "5.0.0",
      contractKind: "evidence",
      valueKind: "deterministic_evidence_candidate",
    },
    {
      contractRef: RECURSION_HELLO_IDS.judgmentContractRef,
      contractVersion: "5.0.0",
      contractKind: "judgment",
      valueKind: "bounded_recursion_judgment",
    },
    {
      contractRef: RECURSION_HELLO_IDS.transitionContractRef,
      contractVersion: "5.0.0",
      contractKind: "transition",
      valueKind: "bounded_recursion_transition",
    },
  ].map((contract) =>
    contractDeclaration(contract as ContractDeclaration)
  );
  const closure = (
    closureContractRef: string,
    closureScope: ClosureContract["closureScope"],
  ): ClosureContract => {
    const basis = {
      kind: "closure_contract",
      closureContractRef,
      predicateRef:
        "predicate://abiogenesis/conformance/bounded-recursion-terminal@5",
      evidenceContractRef: RECURSION_HELLO_IDS.evidenceContractRef,
      resultContractRef: RECURSION_HELLO_IDS.outputContractRef,
      refusalContractRef: RECURSION_HELLO_IDS.refusalContractRef,
      refusalValueKind: "bounded_recursion_refusal",
      judgmentContractRef: RECURSION_HELLO_IDS.judgmentContractRef,
      rejectionContractRef: RECURSION_HELLO_IDS.refusalContractRef,
      transitionContractRef: RECURSION_HELLO_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://abiogenesis/conformance/bounded-recursion-replay@5",
      terminalKind: "completed",
    } as const;
    return closureContract(
      closureScope === "run"
        ? {
        ...basis,
        closureScope,
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
          "run_closed",
        ],
        }
        : {
        ...basis,
        closureScope,
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
        ],
        },
    );
  };
  const implementationBinding = (
    bindingRef: string,
    implementationRef: string,
    namedSymbol: string,
    inputContractRef: string,
  ): ImplementationBinding => declareImplementationBinding({
    kind: "implementation_binding",
    bindingRef,
    implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/recursion.js",
    namedSymbol,
    computeRegime: "F_D",
    inputContractRef,
    outputContractRef: RECURSION_HELLO_IDS.outputContractRef,
    failureContractRef: RECURSION_HELLO_IDS.failureContractRef,
    refusalContractRef: RECURSION_HELLO_IDS.refusalContractRef,
  });
  const contribution = (
    graphFunctionRef: string,
  ): CatalogContribution => catalogContribution({
    handle: graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [RECURSION_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  });
  return deepFreeze({
    contracts,
    evaluators: [evaluator],
    rules: [rule],
    implementationBindings: [
      implementationBinding(
        RECURSION_HELLO_IDS.evaluatorImplementationBindingRef,
        RECURSION_HELLO_IDS.evaluatorImplementationRef,
        "evaluateBoundedRecursion",
        RECURSION_HELLO_IDS.inputContractRef,
      ),
      implementationBinding(
        RECURSION_HELLO_IDS.childImplementationBindingRef,
        RECURSION_HELLO_IDS.childImplementationRef,
        "stepBoundedRecursion",
        RECURSION_HELLO_IDS.inputContractRef,
      ),
    ],
    closureContracts: [
      closure(RECURSION_HELLO_IDS.closureContractRef, "run"),
      closure(RECURSION_HELLO_IDS.childClosureContractRef, "graph_call"),
    ],
    programs: [program],
    graphFunctions: [graphFunction, childGraphFunction],
    contributions: [
      contribution(RECURSION_HELLO_IDS.graphFunctionRef),
      contribution(RECURSION_HELLO_IDS.childGraphFunctionRef),
    ],
  });
}
