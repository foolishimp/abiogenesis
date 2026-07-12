// Native type-law proof for the typed HOF vector relation.

import {
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector
} from "../../code/src/gtl/m01/algebra/hof.js";
import type {
  HofContract,
  HofUnaryRef
} from "../../code/src/gtl/m01/algebra/hof.js";
import {
  typedNode,
  typedVectorNode
} from "../../code/src/gtl/m01/algebra/native_node_witness.js";
import type {
  GraphFunction,
  Node
} from "../../code/src/gtl/m01/contracts/carriers.js";

interface LabObservation {
  readonly sample: string;
}

interface NormalizedObservation {
  readonly normalized: string;
}

interface UnrelatedObservation {
  readonly unrelated: true;
}

declare const inputNode: Node;
declare const outputNode: Node;
declare const unrelatedNode: Node;
declare const inputVectorNode: Node;
declare const outputVectorNode: Node;
declare const unrelatedVectorNode: Node;
declare const childGraphFunction: GraphFunction;
declare const identityGraphFunction: GraphFunction;

const inputWitness = typedNode({
  node: inputNode,
  decode: (_raw: unknown): LabObservation => ({ sample: "" })
});
const outputWitness = typedNode({
  node: outputNode,
  decode: (_raw: unknown): NormalizedObservation => ({ normalized: "" })
});
const unrelatedWitness = typedNode({
  node: unrelatedNode,
  decode: (_raw: unknown): UnrelatedObservation => ({ unrelated: true })
});
const inputContract = hofContract(inputWitness);
const outputContract = hofContract(outputWitness);
const inputVectorWitness = typedVectorNode({
  node: inputVectorNode,
  member: inputWitness,
  decode: (_raw: unknown): readonly LabObservation[] => []
});
const outputVectorWitness = typedVectorNode({
  node: outputVectorNode,
  member: outputWitness,
  decode: (_raw: unknown): readonly NormalizedObservation[] => []
});
const unrelatedVectorWitness = typedVectorNode({
  node: unrelatedVectorNode,
  member: unrelatedWitness,
  decode: (_raw: unknown): readonly UnrelatedObservation[] => []
});
const inputVector = hofVector(inputVectorWitness);
const outputVector = hofVector(outputVectorWitness);
const unrelatedVector = hofVector(unrelatedVectorWitness);
const child = hofUnaryRef({
  graphFunction: childGraphFunction,
  input: inputContract,
  output: outputContract
});

export const lawfulFanOut = fan_out(child, {
  over: inputVector,
  into: outputVector
});

export const exactResultType: HofUnaryRef<
  readonly LabObservation[],
  readonly NormalizedObservation[]
> = lawfulFanOut;

export const mismatchedInputVector = fan_out<
  LabObservation,
  NormalizedObservation
>(child, {
  // @ts-expect-error fan_out input vector member must match the child input.
  over: unrelatedVector,
  into: outputVector
});

export const inferredMismatchedInputVector = fan_out(child, {
  // @ts-expect-error generic inference cannot widen away an invariant member mismatch.
  over: unrelatedVector,
  into: outputVector
});

export const mismatchedOutputVector = fan_out<
  LabObservation,
  NormalizedObservation
>(child, {
  over: inputVector,
  // @ts-expect-error fan_out output vector member must match the child output.
  into: unrelatedVector
});

// @ts-expect-error fan_out requires an explicit output vector boundary.
export const missingOutputVector = fan_out(child, { over: inputVector });

typedVectorNode({
  node: inputVectorNode,
  member: outputWitness,
  // @ts-expect-error the decoder cannot contradict the explicit member witness.
  decode: (_raw: unknown): readonly LabObservation[] => []
});

// @ts-expect-error HOF contracts are constructor-owned and carry a private invariant brand.
export const forgedContract: HofContract<LabObservation> = {
  kind: "hof_contract",
  witness: inputWitness,
  node: inputNode,
  nodeRef: "node://forged",
  nodeContractKey: "forged"
};

// @ts-expect-error HOF unary refs are constructor-owned and carry a private invariant brand.
export const forgedUnaryRef: HofUnaryRef<
  LabObservation,
  NormalizedObservation
> = {
  kind: "hof_unary_ref",
  graphFunction: childGraphFunction,
  graphFunctionRef: "graph-function://forged",
  input: inputContract,
  output: outputContract
};

const identityChild = hofUnaryRef({
  graphFunction: identityGraphFunction,
  input: inputContract,
  output: inputContract
});

export const explicitSameTypeRelation = fan_out(identityChild, {
  over: inputVector,
  into: inputVector
});
