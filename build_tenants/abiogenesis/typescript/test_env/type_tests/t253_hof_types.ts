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

const inputContract = hofContract<LabObservation>(inputNode);
const outputContract = hofContract<NormalizedObservation>(outputNode);
const unrelatedContract = hofContract<UnrelatedObservation>(unrelatedNode);
const inputVector = hofVector(inputVectorNode, inputContract);
const outputVector = hofVector(outputVectorNode, outputContract);
const unrelatedVector = hofVector(unrelatedVectorNode, unrelatedContract);
const child = hofUnaryRef(
  childGraphFunction,
  inputContract,
  outputContract
);

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

export const mismatchedVectorMember = hofVector<LabObservation>(
  inputVectorNode,
  // @ts-expect-error an output contract cannot witness the input vector member.
  outputContract
);

// @ts-expect-error HOF contracts are constructor-owned and carry a private invariant brand.
export const forgedContract: HofContract<LabObservation> = {
  kind: "hof_contract",
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

const identityChild = hofUnaryRef(
  identityGraphFunction,
  inputContract,
  inputContract
);

export const explicitSameTypeRelation = fan_out(identityChild, {
  over: inputVector,
  into: inputVector
});
