import { deepFreeze } from "../shared/immutable.js";
import {
  C,
  cCarrier,
  cGraphFunctionRef,
  workflow,
  type CCarrier,
} from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  FanOutHelloMemberInput,
  FanOutHelloMemberOutput,
  FanOutHelloSummary,
  FanOutHelloVectorInput,
  FanOutHelloVectorOutput,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  RootModuleArtifactBasis,
} from "./contracts.js";
import {
  catalogContribution,
  closureContract,
  contractDeclaration,
  implementationBinding,
} from "./declarations.js";
import {
  fanInApplication,
  fanOutApplication,
} from "./graph_applications.js";

export const FAN_OUT_HELLO_IDS = Object.freeze({
  programRef: "program://abiogenesis/conformance/fan-out-hello@5",
  graphFunctionRef: "graph-function://abiogenesis/conformance/fan-out-hello@5",
  elementGraphFunctionRef:
    "graph-function://abiogenesis/conformance/fan-out-hello-element@5",
  reducerGraphFunctionRef:
    "graph-function://abiogenesis/conformance/fan-out-hello-reducer@5",
  graphRef: "graph://abiogenesis/conformance/fan-out-hello@5",
  elementGraphRef: "graph://abiogenesis/conformance/fan-out-hello-element@5",
  reducerGraphRef: "graph://abiogenesis/conformance/fan-out-hello-reducer@5",
  nodeRef: "node://abiogenesis/conformance/fan-out-hello/root@5",
  elementNodeRef: "node://abiogenesis/conformance/fan-out-hello/element@5",
  reducerNodeRef: "node://abiogenesis/conformance/fan-out-hello/reducer@5",
  batchRef: "batch://abiogenesis/conformance/fan-out-hello@5",
  inputVectorRef: "contract://abiogenesis/conformance/fan-out-hello-input@5",
  outputVectorRef:
    "contract://abiogenesis/conformance/fan-out-hello-output-vector@5",
  inputMemberContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-member-input@5",
  outputMemberContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-member-output@5",
  summaryContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-summary@5",
  failureContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-failure@5",
  refusalContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-refusal@5",
  evidenceContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-evidence@5",
  judgmentContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-judgment@5",
  transitionContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-transition@5",
  closureContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-closure@5",
  elementClosureContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-element-closure@5",
  reducerClosureContractRef:
    "contract://abiogenesis/conformance/fan-out-hello-reducer-closure@5",
  elementImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/fan-out-hello-element@5",
  elementImplementationRef:
    "implementation://abiogenesis/conformance/fan-out-hello-element@5",
  reducerImplementationBindingRef:
    "implementation-binding://abiogenesis/conformance/fan-out-hello-reducer@5",
  reducerImplementationRef:
    "implementation://abiogenesis/conformance/fan-out-hello-reducer@5",
  elementArmId: "arm://abiogenesis/conformance/fan-out-hello-element@5",
  reducerArmId: "arm://abiogenesis/conformance/fan-out-hello-reducer@5",
  rootJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/fan-out-hello-root@5",
  elementJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/fan-out-hello-element@5",
  reducerJudgmentPredicateRef:
    "predicate://abiogenesis/conformance/fan-out-hello-reducer@5",
});

export interface FanOutPublicationParts {
  readonly contracts: readonly ContractDeclaration[];
  readonly implementationBindings: readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}

function exactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFanOutHelloMemberInput(
  value: unknown,
): value is Readonly<FanOutHelloMemberInput> {
  return isRecord(value) &&
    exactKeys(value, ["block", "kind", "schemaVersion", "subject"]) &&
    value.kind === "fan_out_hello_member_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.block === "boolean" &&
    typeof value.subject === "string" &&
    value.subject.length > 0;
}

export function isFanOutHelloMemberOutput(
  value: unknown,
): value is Readonly<FanOutHelloMemberOutput> {
  return isRecord(value) &&
    exactKeys(value, ["kind", "message", "schemaVersion", "subject"]) &&
    value.kind === "fan_out_hello_member_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.message === "string" &&
    value.message.length > 0 &&
    typeof value.subject === "string" &&
    value.subject.length > 0;
}

export function isFanOutHelloVectorInput(
  value: unknown,
): value is Readonly<FanOutHelloVectorInput> {
  if (
    !isRecord(value) ||
    !exactKeys(value, ["kind", "members", "schemaVersion"]) ||
    value.kind !== "fan_out_hello_vector_input" ||
    value.schemaVersion !== "5.0.0" ||
    !Array.isArray(value.members) ||
    value.members.length === 0
  ) return false;
  return value.members.every((row, ordinal) =>
    isRecord(row) &&
    exactKeys(row, ["memberRef", "ordinal", "value"]) &&
    row.ordinal === ordinal &&
    typeof row.memberRef === "string" &&
    row.memberRef.length > 0 &&
    isFanOutHelloMemberInput(row.value));
}

export function isFanOutHelloVectorOutput(
  value: unknown,
): value is Readonly<FanOutHelloVectorOutput> {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      "applicationRef",
      "kind",
      "members",
      "schemaVersion",
    ]) ||
    value.kind !== "gtl_fan_out_vector" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.applicationRef !== "string" ||
    value.applicationRef.length === 0 ||
    !Array.isArray(value.members) ||
    value.members.length === 0
  ) return false;
  return value.members.every((row, ordinal) =>
    isRecord(row) &&
    exactKeys(row, [
      "inputMemberRef",
      "ordinal",
      "outputMemberRef",
      "value",
    ]) &&
    row.ordinal === ordinal &&
    typeof row.inputMemberRef === "string" &&
    row.inputMemberRef.length > 0 &&
    typeof row.outputMemberRef === "string" &&
    row.outputMemberRef.length > 0 &&
    isFanOutHelloMemberOutput(row.value));
}

export function isFanOutHelloSummary(
  value: unknown,
): value is Readonly<FanOutHelloSummary> {
  return isRecord(value) &&
    exactKeys(value, ["count", "kind", "messages", "schemaVersion"]) &&
    value.kind === "fan_out_hello_summary" &&
    value.schemaVersion === "5.0.0" &&
    Number.isSafeInteger(value.count) &&
    (value.count as number) > 0 &&
    Array.isArray(value.messages) &&
    value.messages.length === value.count &&
    value.messages.every((message) =>
      typeof message === "string" && message.length > 0);
}

export function constructFanOutHelloInput(
  subjects: readonly string[],
  blockedOrdinal: number | null = null,
): Readonly<FanOutHelloVectorInput> {
  if (
    subjects.length === 0 ||
    subjects.some((subject) => subject.trim().length === 0) ||
    (
      blockedOrdinal !== null &&
      (
        !Number.isSafeInteger(blockedOrdinal) ||
        blockedOrdinal < 0 ||
        blockedOrdinal >= subjects.length
      )
    )
  ) {
    throw new TypeError(
      "fan-out input requires non-empty subjects and an optional in-range blocked ordinal",
    );
  }
  return deepFreeze({
    kind: "fan_out_hello_vector_input",
    schemaVersion: "5.0.0",
    members: subjects.map((subject, ordinal) => ({
      ordinal,
      memberRef:
        `fan-out-member://abiogenesis/conformance/${ordinal}/${encodeURIComponent(subject)}`,
      value: {
        kind: "fan_out_hello_member_input",
        schemaVersion: "5.0.0",
        block: ordinal === blockedOrdinal,
        subject,
      },
    })),
  });
}

function evaluateElement(
  input: Readonly<FanOutHelloMemberInput>,
  output: Readonly<FanOutHelloMemberOutput>,
): boolean {
  return input.block === false &&
    output.subject === input.subject &&
    output.message === `Hello ${input.subject}`;
}

function evaluateReducer(
  input: Readonly<FanOutHelloVectorOutput>,
  output: Readonly<FanOutHelloSummary>,
): boolean {
  return output.count === input.members.length &&
    output.messages.join("\0") ===
      input.members.map((member) => member.value.message).join("\0");
}

export function resolveFanOutJudgmentRelation(
  predicateRef: string,
): Readonly<{
  readonly predicateRef: string;
  readonly advanceReasonRef: string;
  readonly rejectionReasonRef: string;
  readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null {
  if (
    predicateRef !== FAN_OUT_HELLO_IDS.rootJudgmentPredicateRef &&
    predicateRef !== FAN_OUT_HELLO_IDS.elementJudgmentPredicateRef &&
    predicateRef !== FAN_OUT_HELLO_IDS.reducerJudgmentPredicateRef
  ) return null;
  return Object.freeze({
    predicateRef,
    advanceReasonRef:
      "reason://abiogenesis/conformance/fan-out-hello-admitted@5",
    rejectionReasonRef:
      "reason://abiogenesis/conformance/fan-out-hello-rejected@5",
    evaluate: (input: unknown, output: unknown) =>
      (
        isFanOutHelloMemberInput(input) &&
        isFanOutHelloMemberOutput(output) &&
        evaluateElement(input, output)
      ) ||
      (
        isFanOutHelloVectorOutput(input) &&
        isFanOutHelloSummary(output) &&
        evaluateReducer(input, output)
      ),
  });
}

export function constructFanOutPublicationParts(
  artifact: RootModuleArtifactBasis,
  moduleRef: string,
): Readonly<FanOutPublicationParts> {
  const vectorInput = cCarrier<FanOutHelloVectorInput>(
    FAN_OUT_HELLO_IDS.inputVectorRef,
  );
  const memberInput = cCarrier<FanOutHelloMemberInput>(
    FAN_OUT_HELLO_IDS.inputMemberContractRef,
  );
  const memberOutput = cCarrier<FanOutHelloMemberOutput>(
    FAN_OUT_HELLO_IDS.outputMemberContractRef,
  );
  const vectorOutput = cCarrier<FanOutHelloVectorOutput>(
    FAN_OUT_HELLO_IDS.outputVectorRef,
  );
  const summary = cCarrier<FanOutHelloSummary>(
    FAN_OUT_HELLO_IDS.summaryContractRef,
  );
  const elementRef = cGraphFunctionRef({
    graphFunctionRef: FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
    input: memberInput,
    output: memberOutput,
  });
  const reducerRef = cGraphFunctionRef({
    graphFunctionRef: FAN_OUT_HELLO_IDS.reducerGraphFunctionRef,
    input: vectorOutput,
    output: summary,
  });
  const fanOut = fanOutApplication({
    inputContractRef: FAN_OUT_HELLO_IDS.inputVectorRef,
    outputContractRef: FAN_OUT_HELLO_IDS.outputVectorRef,
    batchRef: FAN_OUT_HELLO_IDS.batchRef,
    elementGraphFunctionRef: FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
    inputVectorRef: FAN_OUT_HELLO_IDS.inputVectorRef,
    outputVectorRef: FAN_OUT_HELLO_IDS.outputVectorRef,
    inputMemberContractRef: FAN_OUT_HELLO_IDS.inputMemberContractRef,
    outputMemberContractRef: FAN_OUT_HELLO_IDS.outputMemberContractRef,
  });
  const fanIn = fanInApplication({
    inputContractRef: FAN_OUT_HELLO_IDS.outputVectorRef,
    outputContractRef: FAN_OUT_HELLO_IDS.summaryContractRef,
    reducerGraphFunctionRef: FAN_OUT_HELLO_IDS.reducerGraphFunctionRef,
    inputVectorRef: FAN_OUT_HELLO_IDS.outputVectorRef,
  });
  const rootGraphFunction: GraphFunction = {
    kind: "graph_function",
    id: FAN_OUT_HELLO_IDS.graphFunctionRef,
    name: "Fan-out hello",
    version: "5.0.0",
    environment: {
      requires: [FAN_OUT_HELLO_IDS.inputVectorRef],
      provides: [FAN_OUT_HELLO_IDS.summaryContractRef],
      carries: [
        FAN_OUT_HELLO_IDS.inputMemberContractRef,
        FAN_OUT_HELLO_IDS.outputMemberContractRef,
        FAN_OUT_HELLO_IDS.outputVectorRef,
      ],
    },
    inputs: [FAN_OUT_HELLO_IDS.inputVectorRef],
    outputs: [FAN_OUT_HELLO_IDS.summaryContractRef],
    template: {
      kind: "inline_graph",
      graphRef: FAN_OUT_HELLO_IDS.graphRef,
      startNodeRef: FAN_OUT_HELLO_IDS.nodeRef,
      terminalNodeRefs: [FAN_OUT_HELLO_IDS.nodeRef],
      nodes: [{
        nodeRef: FAN_OUT_HELLO_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.batch(
            [workflow.C(elementRef)],
            FAN_OUT_HELLO_IDS.batchRef,
            { input: vectorInput, output: vectorOutput },
          ),
          workflow.C(reducerRef),
        ),
      }],
      edges: [],
      applications: [fanOut, fanIn],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": FAN_OUT_HELLO_IDS.closureContractRef,
      "abg.evidence_contract": FAN_OUT_HELLO_IDS.evidenceContractRef,
      "abg.judgment_contract": FAN_OUT_HELLO_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        FAN_OUT_HELLO_IDS.rootJudgmentPredicateRef,
      "abg.transition_contract": FAN_OUT_HELLO_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "conformance", "fan-out", "fan-in", "all-fd"],
  };
  const executableRequirement = (
    implementationBindingRef: string,
    inputContractRef: string,
    outputContractRef: string,
  ) => ({
    kind: "executable_leaf_requirement" as const,
    implementationBindingRef,
    inputContractRef,
    outputContractRef,
    evidenceContractRef: FAN_OUT_HELLO_IDS.evidenceContractRef,
    failureContractRef: FAN_OUT_HELLO_IDS.failureContractRef,
    refusalContractRef: FAN_OUT_HELLO_IDS.refusalContractRef,
    judgmentContractRef: FAN_OUT_HELLO_IDS.judgmentContractRef,
  });
  const leafGraphFunction = <Input, Output>(
    graphFunctionId: string,
    graphFunctionName: string,
    graphRef: string,
    nodeRef: string,
    inputContractRef: string,
    outputContractRef: string,
    implementationBindingRef: string,
    armId: string,
    predicateRef: string,
    stageRole: string,
    inputCarrier: CCarrier<Input>,
    outputCarrier: CCarrier<Output>,
    childClosureContractRef: string,
  ): GraphFunction => {
    return {
      kind: "graph_function",
      id: graphFunctionId,
      name: graphFunctionName,
      version: "5.0.0",
      environment: {
        requires: [inputContractRef],
        provides: [outputContractRef],
        carries: [inputContractRef, outputContractRef],
      },
      inputs: [inputContractRef],
      outputs: [outputContractRef],
      template: {
        kind: "inline_graph",
        graphRef,
        startNodeRef: nodeRef,
        terminalNodeRefs: [nodeRef],
        nodes: [{
          nodeRef,
          nodeKind: "c_locus",
          term: C.of({
            input: inputCarrier,
            output: outputCarrier,
            programLocusRef: nodeRef,
            stageRole,
            fibre: "F_D",
            armId,
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef: predicateRef,
            resultBearing: true,
            requirement: executableRequirement(
              implementationBindingRef,
              inputContractRef,
              outputContractRef,
            ),
          }),
        }],
        edges: [],
        applications: [],
      },
      effects: [],
      declarations: {
        "abg.compute_regime": "F_D",
        "abg.closure_contract": childClosureContractRef,
        "abg.child_closure_contract": childClosureContractRef,
        "abg.evidence_contract": FAN_OUT_HELLO_IDS.evidenceContractRef,
        "abg.judgment_contract": FAN_OUT_HELLO_IDS.judgmentContractRef,
        "abg.judgment_predicate": predicateRef,
        "abg.transition_contract": FAN_OUT_HELLO_IDS.transitionContractRef,
      },
      tags: ["abiogenesis", "conformance", stageRole, "all-fd"],
    };
  };
  const elementGraphFunction = leafGraphFunction(
    FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
    "Fan-out hello element",
    FAN_OUT_HELLO_IDS.elementGraphRef,
    FAN_OUT_HELLO_IDS.elementNodeRef,
    FAN_OUT_HELLO_IDS.inputMemberContractRef,
    FAN_OUT_HELLO_IDS.outputMemberContractRef,
    FAN_OUT_HELLO_IDS.elementImplementationBindingRef,
    FAN_OUT_HELLO_IDS.elementArmId,
    FAN_OUT_HELLO_IDS.elementJudgmentPredicateRef,
    "fan_out_element",
    memberInput,
    memberOutput,
    FAN_OUT_HELLO_IDS.elementClosureContractRef,
  );
  const reducerGraphFunction = leafGraphFunction(
    FAN_OUT_HELLO_IDS.reducerGraphFunctionRef,
    "Fan-in hello reducer",
    FAN_OUT_HELLO_IDS.reducerGraphRef,
    FAN_OUT_HELLO_IDS.reducerNodeRef,
    FAN_OUT_HELLO_IDS.outputVectorRef,
    FAN_OUT_HELLO_IDS.summaryContractRef,
    FAN_OUT_HELLO_IDS.reducerImplementationBindingRef,
    FAN_OUT_HELLO_IDS.reducerArmId,
    FAN_OUT_HELLO_IDS.reducerJudgmentPredicateRef,
    "fan_in_reducer",
    vectorOutput,
    summary,
    FAN_OUT_HELLO_IDS.reducerClosureContractRef,
  );
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: FAN_OUT_HELLO_IDS.programRef,
    version: "5.0.0",
    moduleRef,
    starts: [{
      startRef: "start://abiogenesis/conformance/fan-out-hello@5",
      graphFunctionRef: FAN_OUT_HELLO_IDS.graphFunctionRef,
    }],
    callableMembership: [
      FAN_OUT_HELLO_IDS.graphFunctionRef,
      FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
      FAN_OUT_HELLO_IDS.reducerGraphFunctionRef,
    ],
    closureContractRef: FAN_OUT_HELLO_IDS.closureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "F_D",
    },
  };
  const contracts: readonly ContractDeclaration[] = [
    [FAN_OUT_HELLO_IDS.inputVectorRef, "input", "fan_out_hello_vector_input"],
    [
      FAN_OUT_HELLO_IDS.inputMemberContractRef,
      "input",
      "fan_out_hello_member_input",
    ],
    [
      FAN_OUT_HELLO_IDS.outputMemberContractRef,
      "output",
      "fan_out_hello_member_output",
    ],
    [
      FAN_OUT_HELLO_IDS.outputVectorRef,
      "output",
      "fan_out_hello_vector_output",
    ],
    [FAN_OUT_HELLO_IDS.summaryContractRef, "output", "fan_out_hello_summary"],
    [FAN_OUT_HELLO_IDS.failureContractRef, "failure", "fan_out_hello_failure"],
    [FAN_OUT_HELLO_IDS.refusalContractRef, "refusal", "fan_out_hello_refusal"],
    [
      FAN_OUT_HELLO_IDS.evidenceContractRef,
      "evidence",
      "deterministic_evidence_candidate",
    ],
    [
      FAN_OUT_HELLO_IDS.judgmentContractRef,
      "judgment",
      "fan_out_hello_judgment",
    ],
    [
      FAN_OUT_HELLO_IDS.transitionContractRef,
      "transition",
      "fan_out_hello_transition",
    ],
  ].map(([contractRef, contractKind, valueKind]) =>
    contractDeclaration({
      contractRef,
      contractVersion: "5.0.0",
      contractKind,
      valueKind,
    } as ContractDeclaration)
  );
  const closure = (
    closureContractRef: string,
    closureScope: ClosureContract["closureScope"],
    resultContractRef: string,
  ): ClosureContract => {
    const common = {
      kind: "closure_contract",
      closureContractRef,
      predicateRef:
        "predicate://abiogenesis/conformance/fan-out-hello-terminal@5",
      evidenceContractRef: FAN_OUT_HELLO_IDS.evidenceContractRef,
      resultContractRef,
      refusalContractRef: FAN_OUT_HELLO_IDS.refusalContractRef,
      refusalValueKind: "fan_out_hello_refusal",
      judgmentContractRef: FAN_OUT_HELLO_IDS.judgmentContractRef,
      rejectionContractRef: FAN_OUT_HELLO_IDS.refusalContractRef,
      transitionContractRef: FAN_OUT_HELLO_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://abiogenesis/conformance/fan-out-hello-replay@5",
      terminalKind: "completed",
    } as const;
    return closureContract(
      closureScope === "run"
        ? {
        ...common,
        closureScope,
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
          "run_closed",
        ],
        }
        : {
        ...common,
        closureScope,
        eventKindRefs: [
          "terminal_reached",
          "frame_closed",
          "graph_call_closed",
        ],
        },
    );
  };
  const binding = (
    bindingRef: string,
    implementationRef: string,
    namedSymbol: string,
    inputContractRef: string,
    outputContractRef: string,
  ): ImplementationBinding => implementationBinding({
    kind: "implementation_binding",
    bindingRef,
    implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/fan_out.js",
    namedSymbol,
    computeRegime: "F_D",
    inputContractRef,
    outputContractRef,
    failureContractRef: FAN_OUT_HELLO_IDS.failureContractRef,
    refusalContractRef: FAN_OUT_HELLO_IDS.refusalContractRef,
  });
  const contribution = (graphFunctionRef: string): CatalogContribution =>
    catalogContribution({
    handle: graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [FAN_OUT_HELLO_IDS.programRef],
    readinessPrerequisiteRefs: [FAN_OUT_HELLO_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
    });
  return deepFreeze({
    contracts,
    implementationBindings: [
      binding(
        FAN_OUT_HELLO_IDS.elementImplementationBindingRef,
        FAN_OUT_HELLO_IDS.elementImplementationRef,
        "realizeFanOutHelloMember",
        FAN_OUT_HELLO_IDS.inputMemberContractRef,
        FAN_OUT_HELLO_IDS.outputMemberContractRef,
      ),
      binding(
        FAN_OUT_HELLO_IDS.reducerImplementationBindingRef,
        FAN_OUT_HELLO_IDS.reducerImplementationRef,
        "reduceFanOutHelloVector",
        FAN_OUT_HELLO_IDS.outputVectorRef,
        FAN_OUT_HELLO_IDS.summaryContractRef,
      ),
    ],
    closureContracts: [
      closure(
        FAN_OUT_HELLO_IDS.closureContractRef,
        "run",
        FAN_OUT_HELLO_IDS.summaryContractRef,
      ),
      closure(
        FAN_OUT_HELLO_IDS.elementClosureContractRef,
        "graph_call",
        FAN_OUT_HELLO_IDS.outputMemberContractRef,
      ),
      closure(
        FAN_OUT_HELLO_IDS.reducerClosureContractRef,
        "graph_call",
        FAN_OUT_HELLO_IDS.summaryContractRef,
      ),
    ],
    programs: [program],
    graphFunctions: [
      rootGraphFunction,
      elementGraphFunction,
      reducerGraphFunction,
    ],
    contributions: [
      contribution(FAN_OUT_HELLO_IDS.graphFunctionRef),
      contribution(FAN_OUT_HELLO_IDS.elementGraphFunctionRef),
      contribution(FAN_OUT_HELLO_IDS.reducerGraphFunctionRef),
    ],
  });
}
