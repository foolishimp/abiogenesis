// Implements: REQ-L-GTL3-ATTRS
// Implements: REQ-L-GTL3-CONTEXT
// Implements: REQ-L-GTL3-GRAPH
// Implements: REQ-L-GTL3-NODE
// Implements: REQ-L-GTL3-GRAPHVECTOR
// Implements: REQ-L-GTL3-GRAPHFUNCTION
// Implements: REQ-L-GTL3-OPERATOR
// Implements: REQ-L-GTL3-EVALUATOR
// Implements: REQ-L-GTL3-RULE
// Implements: REQ-L-GTL3-IDENTITY

export type SerializedScalar = string | number | boolean | null;

export type SerializedJsonValue =
  | SerializedScalar
  | {
      readonly kind: "array";
      readonly items: readonly SerializedJsonValue[];
    }
  | {
      readonly kind: "object";
      readonly entries: readonly {
        readonly key: string;
        readonly value: SerializedJsonValue;
      }[];
    };

export interface HookRef {
  readonly ref: string;
  readonly config: SerializedAttrs;
}

export type SerializedAttrValue =
  | {
      readonly kind: "scalar";
      readonly value: SerializedScalar;
    }
  | {
      readonly kind: "string_list";
      readonly value: readonly string[];
    }
  | {
      readonly kind: "hook_ref";
      readonly value: HookRef;
    }
  | {
      readonly kind: "json_blob";
      readonly value: SerializedJsonValue;
    };

export interface SerializedAttrEntry {
  readonly key: string;
  readonly value: SerializedAttrValue;
}

export interface SerializedAttrs {
  readonly entries: readonly SerializedAttrEntry[];
}

export interface Context {
  readonly name: string;
  readonly locator: string;
  readonly digest: string;
}

export type SchemaRef =
  | {
      readonly kind: "symbolic";
      readonly ref: string;
    }
  | {
      readonly kind: "runtime_ref";
      readonly ref: string;
    };

export interface AssetSurface {
  readonly kind: string;
  readonly requiredContexts: readonly string[];
  readonly standardsRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
}

export interface Node {
  readonly name: string;
  readonly schema: SchemaRef;
  readonly markov: readonly string[];
  readonly assetSurface: AssetSurface;
  readonly tags: readonly string[];
  readonly id: string;
}

export type Regime = "F_D" | "F_P" | "F_H";

export interface Operator {
  readonly name: string;
  readonly regime: Regime;
  readonly binding: string;
  readonly tags: readonly string[];
}

export interface Evaluator {
  readonly name: string;
  readonly regime: Regime;
  readonly description: string;
  readonly binding: string;
  readonly tags: readonly string[];
}

export interface Rule {
  readonly name: string;
  readonly kind: string;
  readonly config: SerializedAttrs;
  readonly tags: readonly string[];
}

export interface GraphVector {
  readonly name: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly operators: readonly Operator[];
  readonly evaluators: readonly Evaluator[];
  readonly contexts: readonly Context[];
  readonly rule: Rule | null;
  readonly allowsSubwork: boolean;
  readonly declarations: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}

export interface Graph {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly nodes: readonly Node[];
  readonly vectors: readonly GraphVector[];
  readonly contexts: readonly Context[];
  readonly rules: readonly Rule[];
  readonly effects: readonly string[];
  readonly tags: readonly string[];
  readonly id: string;
}

export interface EnvRef {
  readonly requires: readonly Node[];
  readonly provides: readonly Node[];
  readonly carries: readonly Node[];
}

export type TemplateRef =
  | {
      readonly kind: "inline_graph";
      readonly ref: string;
      readonly graph: Graph;
      readonly version: null;
    }
  | {
      readonly kind: "symbolic";
      readonly ref: string;
      readonly graph: null;
      readonly version: string | null;
    };

export interface GraphFunction {
  readonly name: string;
  readonly environment: EnvRef;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly template: TemplateRef;
  readonly effects: readonly string[];
  readonly declarations: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id: string;
}

export function nodeContractKey(node: Node): string {
  return JSON.stringify({
    name: node.name,
    schema: node.schema,
    markov: node.markov,
    assetSurface: node.assetSurface
  });
}

export function interfaceContract(nodes: readonly Node[]): readonly string[] {
  return Object.freeze(nodes.map(nodeContractKey));
}

function sameOrderedContract(
  left: readonly Node[],
  right: readonly Node[]
): boolean {
  return JSON.stringify(interfaceContract(left)) === JSON.stringify(interfaceContract(right));
}

export function materializeTemplateRef(template: TemplateRef): Graph {
  if (template.kind === "inline_graph") {
    return template.graph;
  }
  throw new TypeError(
    `TemplateRef ${JSON.stringify(template.ref)} is symbolic and not directly materializable`
  );
}

export function materializeGraphFunction(graphFunction: GraphFunction): Graph {
  const graph = materializeTemplateRef(graphFunction.template);

  if (!sameOrderedContract(graph.inputs, graphFunction.inputs)) {
    throw new TypeError(
      `GraphFunction(${JSON.stringify(graphFunction.name)}) inline graph inputs do not preserve outer contract`
    );
  }
  if (!sameOrderedContract(graph.outputs, graphFunction.outputs)) {
    throw new TypeError(
      `GraphFunction(${JSON.stringify(graphFunction.name)}) inline graph outputs do not preserve outer contract`
    );
  }

  return graph;
}
