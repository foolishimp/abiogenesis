// Implements: REQ-L-GTL3-HOF-001/-002/-005/-006.

import { admitNode } from "../admission/carriers.js";
import type {
  GraphFunction,
  Node
} from "../contracts/carriers.js";
import {
  isAdmittedGraphFunction,
  nodeContractKey
} from "../contracts/carriers.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructTemplateRef
} from "../contracts/constructors.js";
import {
  emptyGraphVectorDeclarations,
  graphFunctionDeclarations,
  type GraphFunctionDeclarations
} from "../contracts/declaration_law.js";
import {
  constructHofApplicationDeclaration,
  constructHofApplicationDeclarationEntry
} from "../contracts/hof_application.js";
import { constructFanInGraphFunction } from "./core.js";
import {
  assertTypedNode,
  type TypedNodeBase,
  type TypedScalarNode,
  type TypedVectorNode
} from "./native_node_witness.js";

const HOF_BOUNDARY_TYPE: unique symbol = Symbol("gtl.hof.boundary.type");
const HOF_UNARY_TYPE: unique symbol = Symbol("gtl.hof.unary.type");

export interface HofBoundaryBase {
  readonly kind: "hof_contract" | "hof_vector";
  readonly witness: TypedNodeBase;
  readonly node: Node;
  readonly nodeRef: string;
  readonly nodeContractKey: string;
  readonly [HOF_BOUNDARY_TYPE]: object;
}

export interface HofBoundary<Type> extends HofBoundaryBase {
  readonly [HOF_BOUNDARY_TYPE]: (value: Type) => Type;
}

export interface HofContract<Type> extends HofBoundary<Type> {
  readonly kind: "hof_contract";
  readonly witness: TypedScalarNode<Type>;
}

export interface HofVector<Item> extends HofBoundary<readonly Item[]> {
  readonly kind: "hof_vector";
  readonly witness: TypedVectorNode<Item>;
  readonly member: HofContract<Item>;
}

export type HofValueOf<Boundary extends HofBoundaryBase> =
  Boundary extends HofBoundary<infer Value> ? Value : never;

export interface HofUnaryRef<
  Input,
  Output,
  InputBoundary extends HofBoundaryBase = HofBoundary<Input>,
  OutputBoundary extends HofBoundaryBase = HofBoundary<Output>
> {
  readonly kind: "hof_unary_ref";
  readonly graphFunction: GraphFunction;
  readonly graphFunctionRef: string;
  readonly input: InputBoundary;
  readonly output: OutputBoundary;
  readonly [HOF_UNARY_TYPE]: {
    readonly input: (value: Input) => Input;
    readonly output: (value: Output) => Output;
  };
}

function freezeBoundary<Boundary extends HofBoundaryBase>(
  boundary: Boundary
): Boundary {
  Object.defineProperty(boundary, HOF_BOUNDARY_TYPE, { enumerable: false });
  return Object.freeze(boundary);
}

function assertNativeBoundary(
  boundary: HofBoundaryBase,
  label: string
): void {
  if (
    typeof boundary !== "object" ||
    boundary === null ||
    !Object.hasOwn(boundary, HOF_BOUNDARY_TYPE)
  ) {
    throw new TypeError(`${label}: expected a constructor-owned HOF boundary`);
  }
  assertTypedNode(boundary.witness, `${label}.witness`);
  const normalized = admitNode(boundary.node, `${label}.node`);
  if (
    normalized.id !== boundary.nodeRef ||
    nodeContractKey(normalized) !== boundary.nodeContractKey ||
    boundary.witness.nodeRef !== boundary.nodeRef ||
    boundary.witness.nodeContractKey !== boundary.nodeContractKey
  ) {
    throw new TypeError(
      `${label}: Node ref or contract key does not match its witness`
    );
  }
}

function sameBoundary(left: HofBoundaryBase, right: HofBoundaryBase): boolean {
  return (
    left.nodeRef === right.nodeRef &&
    left.nodeContractKey === right.nodeContractKey
  );
}

function stableBoundaryNodes(
  over: HofBoundaryBase,
  into: HofBoundaryBase
): readonly Node[] {
  return Object.freeze(
    sameBoundary(over, into)
      ? [over.node]
      : [over.node, into.node]
  );
}

export function hofContract<Value>(
  witness: TypedScalarNode<Value>
): HofContract<Value> {
  assertTypedNode(witness, "hofContract.witness");
  if (witness.kind !== "typed_node") {
    throw new TypeError("hofContract.witness: expected a scalar TypedNode");
  }
  return freezeBoundary({
    kind: "hof_contract",
    witness,
    node: witness.node,
    nodeRef: witness.nodeRef,
    nodeContractKey: witness.nodeContractKey,
    [HOF_BOUNDARY_TYPE]: (value: Value): Value => value
  });
}

export function hofVector<Item>(
  witness: TypedVectorNode<Item>
): HofVector<Item> {
  assertTypedNode(witness, "hofVector.witness");
  if (witness.kind !== "typed_vector_node") {
    throw new TypeError("hofVector.witness: expected a TypedVectorNode");
  }
  const member = hofContract(witness.member);
  return freezeBoundary({
    kind: "hof_vector",
    witness,
    node: witness.node,
    nodeRef: witness.nodeRef,
    nodeContractKey: witness.nodeContractKey,
    member,
    [HOF_BOUNDARY_TYPE]: (
      value: readonly Item[]
    ): readonly Item[] => value
  });
}

function freezeUnaryRef<
  Input,
  Output,
  InputBoundary extends HofBoundaryBase,
  OutputBoundary extends HofBoundaryBase
>(
  reference: HofUnaryRef<Input, Output, InputBoundary, OutputBoundary>
): HofUnaryRef<Input, Output, InputBoundary, OutputBoundary> {
  Object.defineProperty(reference, HOF_UNARY_TYPE, { enumerable: false });
  return Object.freeze(reference);
}

function assertNativeUnaryRef<
  Input,
  Output,
  InputBoundary extends HofBoundaryBase,
  OutputBoundary extends HofBoundaryBase
>(
  reference: HofUnaryRef<Input, Output, InputBoundary, OutputBoundary>,
  label: string
): void {
  if (!Object.hasOwn(reference, HOF_UNARY_TYPE)) {
    throw new TypeError(`${label}: expected a constructor-owned HOF unary ref`);
  }
  if (
    !isAdmittedGraphFunction(reference.graphFunction) ||
    reference.graphFunction.id !== reference.graphFunctionRef
  ) {
    throw new TypeError(`${label}: GraphFunction ref is not constructor-admitted`);
  }
  assertNativeBoundary(reference.input, `${label}.input`);
  assertNativeBoundary(reference.output, `${label}.output`);
  if (
    reference.graphFunction.inputs.length !== 1 ||
    reference.graphFunction.outputs.length !== 1 ||
    reference.graphFunction.inputs[0]!.id !== reference.input.nodeRef ||
    reference.graphFunction.outputs[0]!.id !== reference.output.nodeRef ||
    nodeContractKey(reference.graphFunction.inputs[0]!) !==
      reference.input.nodeContractKey ||
    nodeContractKey(reference.graphFunction.outputs[0]!) !==
      reference.output.nodeContractKey
  ) {
    throw new TypeError(`${label}: GraphFunction is not the witnessed unary relation`);
  }
}

export function hofUnaryRef<
  const InputBoundary extends HofBoundaryBase,
  const OutputBoundary extends HofBoundaryBase
>(input: {
  readonly graphFunction: GraphFunction;
  readonly input: InputBoundary;
  readonly output: OutputBoundary;
}): HofUnaryRef<
  HofValueOf<InputBoundary>,
  HofValueOf<OutputBoundary>,
  InputBoundary,
  OutputBoundary
> {
  if (!isAdmittedGraphFunction(input.graphFunction)) {
    throw new TypeError(
      "hofUnaryRef.graphFunction: expected a constructor-admitted GraphFunction"
    );
  }
  assertNativeBoundary(input.input, "hofUnaryRef.input");
  assertNativeBoundary(input.output, "hofUnaryRef.output");
  if (
    input.graphFunction.inputs.length !== 1 ||
    input.graphFunction.outputs.length !== 1 ||
    input.graphFunction.inputs[0]!.id !== input.input.nodeRef ||
    input.graphFunction.outputs[0]!.id !== input.output.nodeRef ||
    nodeContractKey(input.graphFunction.inputs[0]!) !==
      input.input.nodeContractKey ||
    nodeContractKey(input.graphFunction.outputs[0]!) !==
      input.output.nodeContractKey
  ) {
    throw new TypeError(
      "hofUnaryRef.graphFunction: expected one exact witnessed input and output"
    );
  }
  return freezeUnaryRef({
    kind: "hof_unary_ref",
    graphFunction: input.graphFunction,
    graphFunctionRef: input.graphFunction.id,
    input: input.input,
    output: input.output,
    [HOF_UNARY_TYPE]: Object.freeze({
      input: (
        value: HofValueOf<InputBoundary>
      ): HofValueOf<InputBoundary> => value,
      output: (
        value: HofValueOf<OutputBoundary>
      ): HofValueOf<OutputBoundary> => value
    })
  });
}

export function fan_out<Input, Output>(
  child: HofUnaryRef<
    Input,
    Output,
    HofContract<Input>,
    HofContract<Output>
  >,
  boundaries: {
    readonly over: HofVector<Input>;
    readonly into: HofVector<Output>;
  }
): HofUnaryRef<
  readonly Input[],
  readonly Output[],
  HofVector<Input>,
  HofVector<Output>
> {
  assertNativeUnaryRef(child, "fan_out.child");
  assertNativeBoundary(boundaries.over, "fan_out.over");
  assertNativeBoundary(boundaries.into, "fan_out.into");
  if (
    child.input.kind !== "hof_contract" ||
    child.output.kind !== "hof_contract"
  ) {
    throw new TypeError("fan_out.child: expected an element GraphFunction relation");
  }
  if (
    !sameBoundary(child.input, boundaries.over.member) ||
    !sameBoundary(child.output, boundaries.into.member)
  ) {
    throw new TypeError(
      "fan_out: child element contracts do not match the input and output vector members"
    );
  }

  const name = `fan_out(${child.graphFunction.name})`;
  const tags = Object.freeze(["gtl:hof_application", "operator:fan_out"]);
  const wrapper = constructGraphVector({
    name: `${name}:wrapper`,
    source: [boundaries.over.node],
    target: boundaries.into.node,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: emptyGraphVectorDeclarations(),
    tags
  });
  const declaration = constructHofApplicationDeclaration({
    wrapperGraphVectorRef: wrapper.id,
    childGraphFunctionRef: child.graphFunctionRef,
    inputMemberNodeRef: boundaries.over.member.nodeRef,
    inputMemberContractKey: boundaries.over.member.nodeContractKey,
    outputMemberNodeRef: boundaries.into.member.nodeRef,
    outputMemberContractKey: boundaries.into.member.nodeContractKey,
    inputVectorNodeRef: boundaries.over.nodeRef,
    inputVectorContractKey: boundaries.over.nodeContractKey,
    outputVectorNodeRef: boundaries.into.nodeRef,
    outputVectorContractKey: boundaries.into.nodeContractKey
  });
  const graph = constructGraph({
    name: `${name}:graph`,
    inputs: [boundaries.over.node],
    outputs: [boundaries.into.node],
    nodes: stableBoundaryNodes(boundaries.over, boundaries.into),
    vectors: [wrapper],
    contexts: [],
    rules: [],
    effects: child.graphFunction.effects,
    tags
  });
  const graphFunction = constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: [boundaries.over.node],
      provides: [boundaries.into.node],
      carries: stableBoundaryNodes(boundaries.over, boundaries.into)
    }),
    inputs: [boundaries.over.node],
    outputs: [boundaries.into.node],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `inline:${name}`,
      graph,
      version: null
    }),
    effects: child.graphFunction.effects,
    declarations: graphFunctionDeclarations([
      constructHofApplicationDeclarationEntry(declaration)
    ]),
    tags
  });
  return hofUnaryRef({
    graphFunction,
    input: boundaries.over,
    output: boundaries.into
  });
}

export function fan_in<Item, Output>(
  reducer: HofUnaryRef<
    readonly Item[],
    Output,
    HofVector<Item>,
    HofContract<Output>
  >,
  over: HofVector<Item>,
  options?: { readonly declarations?: GraphFunctionDeclarations | undefined }
): GraphFunction {
  assertNativeUnaryRef(reducer, "fan_in.reducer");
  assertNativeBoundary(over, "fan_in.over");
  if (
    reducer.input.kind !== "hof_vector" ||
    reducer.output.kind !== "hof_contract" ||
    !sameBoundary(reducer.input, over) ||
    !sameBoundary(reducer.input.member, over.member)
  ) {
    throw new TypeError(
      "fan_in.reducer must consume the exact witnessed vector boundary"
    );
  }
  return constructFanInGraphFunction(
    reducer.graphFunction,
    over.node,
    options
  );
}
