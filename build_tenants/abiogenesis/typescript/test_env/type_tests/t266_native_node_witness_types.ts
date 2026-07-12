// Native type-law proof for exact Node-backed C and HOF authoring.

import {
  C,
  bindGraphVectorCProgram,
  cCarrier,
  cGraphFunctionRef,
  cInterfaceCarrier,
  fan_in,
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector,
  typedInterface,
  typedNode,
  typedVectorNode,
  workflow,
  type NodeBackedCProgramTerm,
  type NonEmptyTypedNodeTuple,
  type TypedInterface
} from "../../code/src/gtl/m01/algebra/index.js";
import type {
  GraphFunction,
  GraphVector,
  Node
} from "../../code/src/gtl/m01/contracts/carriers.js";

interface LabObservation {
  readonly sample: string;
}

interface NormalizedObservation {
  readonly normalized: string;
}

interface LabPolicy {
  readonly policy: string;
}

interface LabEvidence {
  readonly evidence: string;
}

interface LabFinding {
  readonly finding: string;
}

interface ForeignObservation {
  readonly foreign: true;
}

declare const observationNode: Node;
declare const normalizedNode: Node;
declare const policyNode: Node;
declare const evidenceNode: Node;
declare const findingNode: Node;
declare const foreignNode: Node;
declare const observationVectorNode: Node;
declare const normalizedVectorNode: Node;
declare const foreignVectorNode: Node;
declare const normalizeGraphFunction: GraphFunction;
declare const vectorNormalizeGraphFunction: GraphFunction;
declare const reduceGraphFunction: GraphFunction;
declare const graphVector: GraphVector;

const decodeObservation = (_raw: unknown): LabObservation => ({ sample: "" });
const decodeNormalized = (_raw: unknown): NormalizedObservation => ({
  normalized: ""
});
const decodePolicy = (_raw: unknown): LabPolicy => ({ policy: "" });
const decodeEvidence = (_raw: unknown): LabEvidence => ({ evidence: "" });
const decodeFinding = (_raw: unknown): LabFinding => ({ finding: "" });
const decodeForeign = (_raw: unknown): ForeignObservation => ({ foreign: true });

const observation = typedNode({ node: observationNode, decode: decodeObservation });
const normalized = typedNode({ node: normalizedNode, decode: decodeNormalized });
const policy = typedNode({ node: policyNode, decode: decodePolicy });
const evidence = typedNode({ node: evidenceNode, decode: decodeEvidence });
const finding = typedNode({ node: findingNode, decode: decodeFinding });
const foreign = typedNode({ node: foreignNode, decode: decodeForeign });
const wronglyProjectedObservation = typedNode({
  node: observationNode,
  decode: decodeForeign
});

const observationVector = typedVectorNode({
  node: observationVectorNode,
  member: observation,
  decode: (_raw: unknown): readonly LabObservation[] => []
});
const normalizedVector = typedVectorNode({
  node: normalizedVectorNode,
  member: normalized,
  decode: (_raw: unknown): readonly NormalizedObservation[] => []
});
const foreignVector = typedVectorNode({
  node: foreignVectorNode,
  member: foreign,
  decode: (_raw: unknown): readonly ForeignObservation[] => []
});

const observationInterface = typedInterface(observation);
const normalizedInterface = typedInterface(normalized);
const findingInterface = typedInterface(finding);
const exactThreeSource = typedInterface(normalizedVector, policy, evidence);
// @ts-expect-error TypedInterface requires a non-empty Node tuple.
typedInterface();
declare const preWidenedThreeSource: TypedInterface<
  readonly [readonly NormalizedObservation[], LabPolicy, LabEvidence],
  NonEmptyTypedNodeTuple
>;

export const scalarInference: TypedInterface<
  LabObservation,
  readonly [typeof observation]
> = observationInterface;

export const tupleInference: TypedInterface<
  readonly [readonly NormalizedObservation[], LabPolicy, LabEvidence],
  readonly [typeof normalizedVector, typeof policy, typeof evidence]
> = exactThreeSource;

declare const decodeAny: (raw: unknown) => any;
declare const decodeUnknown: (raw: unknown) => unknown;
declare const decodeNever: (raw: unknown) => never;

// @ts-expect-error A decoder returning any cannot mint a TypedNode.
typedNode({ node: observationNode, decode: decodeAny });
// @ts-expect-error A decoder returning unknown cannot mint a TypedNode.
typedNode({ node: observationNode, decode: decodeUnknown });
// @ts-expect-error A decoder returning never cannot mint a TypedNode.
typedNode({ node: observationNode, decode: decodeNever });

typedVectorNode({
  node: observationVectorNode,
  member: observation,
  // @ts-expect-error Vector decoder output must exactly match the member type.
  decode: (_raw: unknown): readonly NormalizedObservation[] => []
});

// @ts-expect-error An exact three-source interface cannot widen its Node tuple.
const widenedThreeSource: TypedInterface<
  readonly [readonly NormalizedObservation[], LabPolicy, LabEvidence],
  NonEmptyTypedNodeTuple
> = exactThreeSource;
void widenedThreeSource;

// @ts-expect-error A widened interface cannot enter a nominal C interface carrier.
cInterfaceCarrier(preWidenedThreeSource);

const observationCarrier = cInterfaceCarrier(observationInterface);
const normalizedCarrier = cInterfaceCarrier(normalizedInterface);
const findingCarrier = cInterfaceCarrier(findingInterface);
const threeSourceCarrier = cInterfaceCarrier(exactThreeSource);

const transform = C.of({
  input: observationCarrier,
  output: normalizedCarrier,
  stageRole: "transform",
  fibre: "F_P",
  armId: "arm://scenario-09/normalize",
  resultBearing: true
});
const evaluate = C.of({
  input: normalizedCarrier,
  output: findingCarrier,
  stageRole: "evaluate",
  fibre: "F_D",
  armId: "arm://scenario-09/evaluate",
  resultBearing: false
});
const consequence = C.of({
  input: findingCarrier,
  output: findingCarrier,
  stageRole: "consequence",
  fibre: "F_D",
  armId: "arm://scenario-09/project",
  resultBearing: false
});
const threeSourceTerm = C.of({
  input: threeSourceCarrier,
  output: findingCarrier,
  stageRole: "evaluate",
  fibre: "F_D",
  armId: "arm://scenario-09/multi-source",
  resultBearing: true
});

export const nodeBackedIdentity = C.id(observationCarrier);
export const nodeBackedCompose = C.compose(transform, evaluate);
export const nodeBackedEdge = C.edge({ transform, evaluate, consequence });
export const nodeBackedRetry = C.retry(transform, 2);
export const nodeBackedBatch = C.batch(
  [transform, nodeBackedRetry] as const,
  "batch://scenario-09/normalize"
);

const normalizeRef = cGraphFunctionRef({
  graphFunction: normalizeGraphFunction,
  input: observationInterface,
  output: normalizedInterface
});
export const nodeBackedWorkflow = workflow.C(normalizeRef);

export const exactBinding = bindGraphVectorCProgram({
  graphVector,
  source: observationInterface,
  target: normalizedInterface,
  program: transform
});

// @ts-expect-error Wrong concrete domain witness cannot replace LabObservation.
const wrongObservationInterface: typeof observationInterface = typedInterface(foreign);
void wrongObservationInterface;

// @ts-expect-error The same ordinary Node projected with a foreign decoder remains foreign.
const wrongDecoderInterface: typeof observationInterface = typedInterface(
  wronglyProjectedObservation
);
void wrongDecoderInterface;

// @ts-expect-error Node-backed composition requires the exact middle interface.
C.compose(transform, consequence);

cGraphFunctionRef({
  graphFunction: normalizeGraphFunction,
  // @ts-expect-error cGraphFunctionRef consumes TypedInterfaces, not generic carriers.
  input: cCarrier<LabObservation>(observationInterface.interfaceRef),
  output: normalizedInterface
});

const ordinaryMatchingTerm = C.of({
  input: cCarrier<LabObservation>(observationInterface.interfaceRef),
  output: cCarrier<NormalizedObservation>(normalizedInterface.interfaceRef),
  stageRole: "transform",
  fibre: "F_P",
  armId: "arm://scenario-09/ordinary",
  resultBearing: true
});

// @ts-expect-error Node-backed and generic carriers cannot mix in one C leaf.
C.of({
  input: observationCarrier,
  output: cCarrier<NormalizedObservation>(normalizedInterface.interfaceRef),
  stageRole: "transform",
  fibre: "F_P",
  armId: "arm://scenario-09/mixed-carriers",
  resultBearing: true
});

bindGraphVectorCProgram({
  graphVector,
  source: observationInterface,
  target: normalizedInterface,
  // @ts-expect-error Matching string refs do not make an ordinary term Node-backed.
  program: ordinaryMatchingTerm
});

const shortenedSource = typedInterface(normalizedVector, policy);
// @ts-expect-error Fixed three-source binding cannot accept a shortened tuple.
const wrongThreeSource: typeof exactThreeSource = shortenedSource;
void wrongThreeSource;
const reorderedSource = typedInterface(policy, normalizedVector, evidence);
// @ts-expect-error Source tuple order is invariant.
const wrongOrder: typeof exactThreeSource = reorderedSource;
void wrongOrder;
const lengthenedSource = typedInterface(
  normalizedVector,
  policy,
  evidence,
  finding
);
// @ts-expect-error Source tuple cardinality is invariant.
const wrongLength: typeof exactThreeSource = lengthenedSource;
void wrongLength;

bindGraphVectorCProgram({
  graphVector,
  // @ts-expect-error A pre-widened source cannot enter GraphVector binding.
  source: preWidenedThreeSource,
  target: findingInterface,
  // @ts-expect-error Exact term authority cannot widen to the source declaration.
  program: threeSourceTerm
});

bindGraphVectorCProgram({
  graphVector,
  source: observationInterface,
  // @ts-expect-error GraphVector target must be a singleton typed interface.
  target: typedInterface(normalized, finding),
  // @ts-expect-error A scalar-output term cannot target a two-Node tuple.
  program: transform
});

// @ts-expect-error An ordinary Node cannot enter a typed HOF constructor.
hofContract(observationNode);
// @ts-expect-error A structural object cannot impersonate a TypedNode.
hofContract({
  kind: "typed_node",
  node: observationNode,
  nodeRef: observationNode.id,
  nodeContractKey: "forged",
  nodeContractDigest: "sha256:forged"
});

// @ts-expect-error A structural interface literal lacks private constructor authority.
const forgedInterface: typeof observationInterface = {
  kind: "typed_interface",
  nodes: [observationNode],
  orderedNodeRefs: [observationNode.id],
  orderedNodeContractKeys: ["forged"],
  cardinality: 1,
  interfaceRef: "gtl.c.interface-contract:sha256:forged"
};
void forgedInterface;

const observationContract = hofContract(observation);
const normalizedContract = hofContract(normalized);
const findingContract = hofContract(finding);
const observationVectorBoundary = hofVector(observationVector);
const normalizedVectorBoundary = hofVector(normalizedVector);
const foreignVectorBoundary = hofVector(foreignVector);

const elementRef = hofUnaryRef({
  graphFunction: normalizeGraphFunction,
  input: observationContract,
  output: normalizedContract
});
export const vectorMap = fan_out(elementRef, {
  over: observationVectorBoundary,
  into: normalizedVectorBoundary
});

const reducerRef = hofUnaryRef({
  graphFunction: reduceGraphFunction,
  input: normalizedVectorBoundary,
  output: findingContract
});
export const reduced = fan_in(reducerRef, normalizedVectorBoundary);

fan_out(elementRef, {
  // @ts-expect-error Fan-out members must preserve the child input relation.
  over: foreignVectorBoundary,
  into: normalizedVectorBoundary
});

// @ts-expect-error Fan-in must consume the reducer's exact vector boundary.
fan_in(reducerRef, foreignVectorBoundary);

type ExpectedNodeBackedTerm = NodeBackedCProgramTerm<
  LabObservation,
  NormalizedObservation,
  readonly [typeof observation],
  readonly [typeof normalized],
  "transform",
  "one"
>;
// @ts-expect-error An ordinary term cannot mint the private Node-backed brand.
const forgedNodeBacked: ExpectedNodeBackedTerm = ordinaryMatchingTerm;
void forgedNodeBacked;

void vectorNormalizeGraphFunction;
