// Implements: REQ-L-GTL3-HOF-001/-005/-006.

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
  graphFunctionDeclarations
} from "../contracts/declaration_law.js";
import {
  admitHofVectorMemberSchema,
  constructHofApplicationDeclaration,
  constructHofApplicationDeclarationEntry
} from "../contracts/hof_application.js";

const HOF_BOUNDARY_TYPE: unique symbol = Symbol("gtl.hof.boundary.type");
const HOF_UNARY_TYPE: unique symbol = Symbol("gtl.hof.unary.type");

export interface HofBoundary<Type> {
  readonly kind: "hof_contract" | "hof_vector";
  readonly node: Node;
  readonly nodeRef: string;
  readonly nodeContractKey: string;
  readonly [HOF_BOUNDARY_TYPE]: (value: Type) => Type;
}

export interface HofContract<Type> extends HofBoundary<Type> {
  readonly kind: "hof_contract";
}

export interface HofVector<Item> extends HofBoundary<readonly Item[]> {
  readonly kind: "hof_vector";
  readonly member: HofContract<Item>;
}

export interface HofUnaryRef<Input, Output> {
  readonly kind: "hof_unary_ref";
  readonly graphFunction: GraphFunction;
  readonly graphFunctionRef: string;
  readonly input: HofBoundary<Input>;
  readonly output: HofBoundary<Output>;
  readonly [HOF_UNARY_TYPE]: {
    readonly input: (value: Input) => Input;
    readonly output: (value: Output) => Output;
  };
}

function freezeBoundary<Type, Boundary extends HofBoundary<Type>>(
  boundary: Boundary
): Boundary {
  Object.defineProperty(boundary, HOF_BOUNDARY_TYPE, { enumerable: false });
  return Object.freeze(boundary);
}

function assertNativeBoundary<Type>(
  boundary: HofBoundary<Type>,
  label: string
): void {
  if (!Object.hasOwn(boundary, HOF_BOUNDARY_TYPE)) {
    throw new TypeError(`${label}: expected a constructor-owned HOF boundary`);
  }
  const normalized = admitNode(boundary.node, `${label}.node`);
  if (
    normalized.id !== boundary.nodeRef ||
    nodeContractKey(normalized) !== boundary.nodeContractKey
  ) {
    throw new TypeError(`${label}: node ref or contract key does not match its witness`);
  }
}

function sameBoundary<Left, Right>(
  left: HofBoundary<Left>,
  right: HofBoundary<Right>
): boolean {
  return (
    left.nodeRef === right.nodeRef &&
    left.nodeContractKey === right.nodeContractKey
  );
}

function stableBoundaryNodes<Over, Into>(
  over: HofBoundary<Over>,
  into: HofBoundary<Into>
): readonly Node[] {
  return Object.freeze(
    sameBoundary(over, into)
      ? [over.node]
      : [over.node, into.node]
  );
}

export function hofContract<Type>(node: Node): HofContract<Type> {
  const normalized = admitNode(node, "hofContract.node");
  return freezeBoundary<Type, HofContract<Type>>({
    kind: "hof_contract",
    node: normalized,
    nodeRef: normalized.id,
    nodeContractKey: nodeContractKey(normalized),
    [HOF_BOUNDARY_TYPE]: (value: Type): Type => value
  });
}

export function hofVector<Item>(
  node: Node,
  member: HofContract<Item>
): HofVector<Item> {
  assertNativeBoundary(member, "hofVector.member");
  if (member.kind !== "hof_contract") {
    throw new TypeError("hofVector.member: expected a scalar HOF contract");
  }
  const normalized = admitNode(node, "hofVector.node");
  admitHofVectorMemberSchema(normalized, member.node, "hofVector");
  return freezeBoundary<readonly Item[], HofVector<Item>>({
    kind: "hof_vector",
    node: normalized,
    nodeRef: normalized.id,
    nodeContractKey: nodeContractKey(normalized),
    member,
    [HOF_BOUNDARY_TYPE]: (value: readonly Item[]): readonly Item[] => value
  });
}

function freezeUnaryRef<Input, Output>(
  reference: HofUnaryRef<Input, Output>
): HofUnaryRef<Input, Output> {
  Object.defineProperty(reference, HOF_UNARY_TYPE, { enumerable: false });
  return Object.freeze(reference);
}

function assertNativeUnaryRef<Input, Output>(
  reference: HofUnaryRef<Input, Output>,
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

export function hofUnaryRef<Input, Output>(
  graphFunction: GraphFunction,
  input: HofBoundary<Input>,
  output: HofBoundary<Output>
): HofUnaryRef<Input, Output> {
  if (!isAdmittedGraphFunction(graphFunction)) {
    throw new TypeError(
      "hofUnaryRef.graphFunction: expected a constructor-admitted GraphFunction"
    );
  }
  assertNativeBoundary(input, "hofUnaryRef.input");
  assertNativeBoundary(output, "hofUnaryRef.output");
  if (
    graphFunction.inputs.length !== 1 ||
    graphFunction.outputs.length !== 1 ||
    graphFunction.inputs[0]!.id !== input.nodeRef ||
    graphFunction.outputs[0]!.id !== output.nodeRef ||
    nodeContractKey(graphFunction.inputs[0]!) !== input.nodeContractKey ||
    nodeContractKey(graphFunction.outputs[0]!) !== output.nodeContractKey
  ) {
    throw new TypeError(
      "hofUnaryRef.graphFunction: expected one exact witnessed input and output"
    );
  }
  return freezeUnaryRef({
    kind: "hof_unary_ref",
    graphFunction,
    graphFunctionRef: graphFunction.id,
    input,
    output,
    [HOF_UNARY_TYPE]: Object.freeze({
      input: (value: Input): Input => value,
      output: (value: Output): Output => value
    })
  });
}

export function fan_out<Input, Output>(
  child: HofUnaryRef<Input, Output>,
  boundaries: {
    readonly over: HofVector<Input>;
    readonly into: HofVector<Output>;
  }
): HofUnaryRef<readonly Input[], readonly Output[]> {
  assertNativeUnaryRef(child, "fan_out.child");
  assertNativeBoundary(boundaries.over, "fan_out.over");
  assertNativeBoundary(boundaries.into, "fan_out.into");
  if (child.input.kind !== "hof_contract" || child.output.kind !== "hof_contract") {
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
  return hofUnaryRef<readonly Input[], readonly Output[]>(
    graphFunction,
    boundaries.over,
    boundaries.into
  );
}
