// Native TypeScript projections over canonical GTL Nodes. These witnesses are
// authoring-time proof only; their private brands and decoders never serialize.

import { admitNode } from "../admission/carriers.js";
import {
  interfaceContract,
  nodeContractKey,
  type Node
} from "../contracts/carriers.js";
import { admitHofVectorMemberSchema } from "../contracts/hof_application.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

const TYPED_NODE_AUTHORITY: unique symbol = Symbol(
  "gtl.native.typed_node.authority"
);
const TYPED_INTERFACE_AUTHORITY: unique symbol = Symbol(
  "gtl.native.typed_interface.authority"
);

export type TrustedNativeDecoder<Value> = (raw: unknown) => Value;

type IsAny<Value> = 0 extends 1 & Value ? true : false;
type IsNever<Value> = [Value] extends [never] ? true : false;
type IsUnknown<Value> = IsAny<Value> extends true
  ? false
  : unknown extends Value
    ? [keyof Value] extends [never]
      ? true
      : false
    : false;

export type ConcreteDecoded<Value> = IsAny<Value> extends true
  ? never
  : IsNever<Value> extends true
    ? never
    : IsUnknown<Value> extends true
      ? never
      : Value;

type ExactType<Left, Right> = [Left] extends [Right]
  ? [Right] extends [Left]
    ? unknown
    : never
  : never;

interface TypedNodeAuthority<Value> {
  readonly decode: TrustedNativeDecoder<Value>;
  readonly invariant: (value: Value) => Value;
}

export interface TypedNodeBase {
  readonly kind: "typed_node" | "typed_vector_node";
  readonly node: Node;
  readonly nodeRef: string;
  readonly nodeContractKey: string;
  readonly nodeContractDigest: `sha256:${string}`;
  readonly [TYPED_NODE_AUTHORITY]: object;
}

export interface TypedNode<Value> extends TypedNodeBase {
  readonly [TYPED_NODE_AUTHORITY]: TypedNodeAuthority<Value>;
}

export interface TypedScalarNode<Value> extends TypedNode<Value> {
  readonly kind: "typed_node";
}

export interface TypedVectorNode<Item> extends TypedNode<readonly Item[]> {
  readonly kind: "typed_vector_node";
  readonly member: TypedScalarNode<Item>;
}

export type NonEmptyTypedNodeTuple = readonly [
  TypedNodeBase,
  ...TypedNodeBase[]
];

export type ValueOf<Witness extends TypedNodeBase> =
  Witness extends TypedNode<infer Value> ? Value : never;

export type InterfaceValue<Nodes extends NonEmptyTypedNodeTuple> =
  Nodes extends readonly [infer Only extends TypedNodeBase]
    ? ValueOf<Only>
    : { readonly [Index in keyof Nodes]: ValueOf<Nodes[Index]> };

export type NodeValues<Nodes extends NonEmptyTypedNodeTuple> = {
  readonly [Index in keyof Nodes]: Nodes[Index]["node"];
};

export type TupleNodeRefs<Nodes extends NonEmptyTypedNodeTuple> = {
  readonly [Index in keyof Nodes]: Nodes[Index]["nodeRef"];
};

export type TupleNodeContractKeys<Nodes extends NonEmptyTypedNodeTuple> = {
  readonly [Index in keyof Nodes]: Nodes[Index]["nodeContractKey"];
};

interface TypedInterfaceAuthority<
  Value,
  Nodes extends NonEmptyTypedNodeTuple
> {
  readonly value: (value: Value) => Value;
  readonly typedNodes: (nodes: Nodes) => Nodes;
  readonly witnesses: Nodes;
}

export interface TypedInterface<
  Value,
  Nodes extends NonEmptyTypedNodeTuple
> {
  readonly kind: "typed_interface";
  readonly nodes: NodeValues<Nodes>;
  readonly orderedNodeRefs: TupleNodeRefs<Nodes>;
  readonly orderedNodeContractKeys: TupleNodeContractKeys<Nodes>;
  readonly cardinality: Nodes["length"];
  readonly interfaceRef: string;
  readonly [TYPED_INTERFACE_AUTHORITY]: TypedInterfaceAuthority<Value, Nodes>;
}

function requireNodeBrand(value: TypedNodeBase, label: string): void {
  if (
    typeof value !== "object" ||
    value === null ||
    !Object.hasOwn(value, TYPED_NODE_AUTHORITY)
  ) {
    throw new TypeError(`${label}: expected a constructor-owned TypedNode`);
  }
}

export function assertTypedNode(
  value: TypedNodeBase,
  label: string
): void {
  requireNodeBrand(value, label);
  const normalized = admitNode(value.node, `${label}.node`);
  const contractKey = nodeContractKey(normalized);
  const contractDigest = stableSha256Digest({ nodeContractKey: contractKey });
  if (
    normalized.id !== value.nodeRef ||
    contractKey !== value.nodeContractKey ||
    contractDigest !== value.nodeContractDigest
  ) {
    throw new TypeError(
      `${label}: Node ref, contract key, or digest does not match its witness`
    );
  }
}

function freezeTypedNode<Witness extends object>(witness: Witness): Witness {
  Object.defineProperty(witness, TYPED_NODE_AUTHORITY, { enumerable: false });
  return Object.freeze(witness);
}

export function typedNode<
  const Decode extends TrustedNativeDecoder<unknown>
>(input: {
  readonly node: Node;
  readonly decode: Decode;
} & ([ConcreteDecoded<ReturnType<Decode>>] extends [never]
  ? never
  : unknown)): TypedScalarNode<ConcreteDecoded<ReturnType<Decode>>>;
export function typedNode(input: {
  readonly node: Node;
  readonly decode: TrustedNativeDecoder<unknown>;
}): object {
  const normalized = admitNode(input.node, "typedNode.node");
  const contractKey = nodeContractKey(normalized);
  return freezeTypedNode({
    kind: "typed_node",
    node: normalized,
    nodeRef: normalized.id,
    nodeContractKey: contractKey,
    nodeContractDigest: stableSha256Digest({ nodeContractKey: contractKey }),
    [TYPED_NODE_AUTHORITY]: Object.freeze({
      decode: input.decode,
      invariant: (value: unknown): unknown => value
    })
  });
}

export function typedVectorNode<
  Item,
  const Decode extends TrustedNativeDecoder<readonly NoInfer<Item>[]>
>(input: {
  readonly node: Node;
  readonly member: TypedScalarNode<Item>;
  readonly decode: Decode;
} & (ExactType<ReturnType<Decode>, readonly Item[]> extends never
  ? never
  : [ConcreteDecoded<ReturnType<Decode>>] extends [never]
    ? never
    : unknown)): TypedVectorNode<Item>;
export function typedVectorNode(input: {
  readonly node: Node;
  readonly member: TypedScalarNode<unknown>;
  readonly decode: TrustedNativeDecoder<readonly unknown[]>;
}): object {
  assertTypedNode(input.member, "typedVectorNode.member");
  if (input.member.kind !== "typed_node") {
    throw new TypeError(
      "typedVectorNode.member: expected a scalar TypedNode witness"
    );
  }
  const normalized = admitNode(input.node, "typedVectorNode.node");
  admitHofVectorMemberSchema(
    normalized,
    input.member.node,
    "typedVectorNode"
  );
  const contractKey = nodeContractKey(normalized);
  return freezeTypedNode({
    kind: "typed_vector_node",
    node: normalized,
    nodeRef: normalized.id,
    nodeContractKey: contractKey,
    nodeContractDigest: stableSha256Digest({ nodeContractKey: contractKey }),
    member: input.member,
    [TYPED_NODE_AUTHORITY]: Object.freeze({
      decode: input.decode,
      invariant: (value: readonly unknown[]): readonly unknown[] => value
    })
  });
}

export function typedInterface<
  const Nodes extends NonEmptyTypedNodeTuple
>(...nodes: Nodes): TypedInterface<InterfaceValue<Nodes>, Nodes>;
export function typedInterface(...nodes: readonly TypedNodeBase[]): object {
  if (nodes.length === 0) {
    throw new TypeError("typedInterface requires at least one TypedNode");
  }
  nodes.forEach((node, index) => {
    assertTypedNode(node, `typedInterface.nodes[${String(index)}]`);
  });
  const ordinaryNodes = Object.freeze(nodes.map((node) => node.node));
  const orderedNodeRefs = Object.freeze(nodes.map((node) => node.nodeRef));
  const orderedNodeContractKeys = Object.freeze(
    nodes.map((node) => node.nodeContractKey)
  );
  const boundary = {
    kind: "typed_interface" as const,
    nodes: ordinaryNodes,
    orderedNodeRefs,
    orderedNodeContractKeys,
    cardinality: nodes.length,
    interfaceRef: deriveNodeInterfaceContractRef(ordinaryNodes),
    [TYPED_INTERFACE_AUTHORITY]: Object.freeze({
      value: (value: unknown): unknown => value,
      typedNodes: (value: readonly TypedNodeBase[]): readonly TypedNodeBase[] =>
        value,
      witnesses: Object.freeze([...nodes])
    })
  };
  Object.defineProperty(boundary, TYPED_INTERFACE_AUTHORITY, {
    enumerable: false
  });
  return Object.freeze(boundary);
}

export function deriveNodeInterfaceContractRef(
  nodes: readonly Node[],
  label = "Node interface"
): string {
  if (nodes.length === 0) {
    throw new TypeError(`${label} requires at least one Node`);
  }
  const admittedNodes = Object.freeze(
    nodes.map((node, index) =>
      admitNode(node, `${label}.nodes[${String(index)}]`)
    )
  );
  return `gtl.c.interface-contract:${stableSha256Digest({
    orderedNodeContractKeys: interfaceContract(admittedNodes)
  })}`;
}

export function assertTypedInterface<
  Value,
  Nodes extends NonEmptyTypedNodeTuple
>(boundary: TypedInterface<Value, Nodes>, label: string): void {
  if (
    typeof boundary !== "object" ||
    boundary === null ||
    !Object.hasOwn(boundary, TYPED_INTERFACE_AUTHORITY)
  ) {
    throw new TypeError(
      `${label}: expected a constructor-owned TypedInterface`
    );
  }
  const authority = boundary[TYPED_INTERFACE_AUTHORITY];
  if (boundary.nodes.length === 0) {
    throw new TypeError(`${label}: interface must remain non-empty`);
  }
  boundary.nodes.forEach((node, index) => {
    const witness = authority.witnesses[index];
    if (witness === undefined) {
      throw new TypeError(`${label}: typed Node tuple cardinality does not match`);
    }
    assertTypedNode(witness, `${label}.typedNodes[${String(index)}]`);
    const normalized = admitNode(node, `${label}.nodes[${String(index)}]`);
    if (
      normalized.id !== boundary.orderedNodeRefs[index] ||
      nodeContractKey(normalized) !== boundary.orderedNodeContractKeys[index] ||
      witness.nodeRef !== boundary.orderedNodeRefs[index] ||
      witness.nodeContractKey !== boundary.orderedNodeContractKeys[index]
    ) {
      throw new TypeError(
        `${label}: ordered Node refs or contract keys do not match`
      );
    }
  });
  if (
    authority.witnesses.length !== boundary.nodes.length ||
    boundary.cardinality !== boundary.nodes.length ||
    boundary.interfaceRef !== deriveNodeInterfaceContractRef(boundary.nodes)
  ) {
    throw new TypeError(`${label}: cardinality or interface ref does not match`);
  }
}

export function typedInterfaceNodes<
  Value,
  Nodes extends NonEmptyTypedNodeTuple
>(boundary: TypedInterface<Value, Nodes>): Nodes {
  assertTypedInterface(boundary, "typedInterfaceNodes.boundary");
  const authority = boundary[TYPED_INTERFACE_AUTHORITY];
  return authority.witnesses;
}
