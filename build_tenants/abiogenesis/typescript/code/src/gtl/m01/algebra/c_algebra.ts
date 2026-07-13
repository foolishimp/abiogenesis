// Implements the native TypeScript binding for the ratified M01 C algebra in
// ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN section 10. The values produced here
// are authored GTL data. ABG owns admission into executable runtime truth.

import {
  GTL_GRAPH_VECTOR_ADMISSION,
  isAdmittedGraphFunction,
  nodeContractKey,
  type GraphFunction,
  type GraphVector,
  type Node
} from "../contracts/carriers.js";
import { admitNode } from "../admission/carriers.js";
import {
  assertTypedInterface,
  deriveNodeInterfaceContractRef,
  type NonEmptyTypedNodeTuple,
  type TypedInterface,
  type TypedNode
} from "./native_node_witness.js";

export const C_ALGEBRA_SYNTAX_VERSION = "gtl-c-algebra/1" as const;

export const C_ALGEBRA_REGIME_VALUES = Object.freeze([
  "F_D",
  "F_P",
  "F_H"
] as const);

export type CAlgebraRegime = (typeof C_ALGEBRA_REGIME_VALUES)[number];

export type CAlgebraResultCardinality = "zero" | "one" | "many" | "unknown";

export const C_ALGEBRA_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "gtl-c-invalid-json",
  "gtl-c-invalid-syntax",
  "gtl-c-unknown-field",
  "gtl-c-empty-ref",
  "gtl-c-invalid-regime",
  "gtl-c-carrier-mismatch",
  "gtl-c-edge-role-mismatch",
  "gtl-c-empty-batch",
  "gtl-c-batch-cardinality-mismatch",
  "gtl-c-invalid-retry-budget",
  "gtl-c-empty-executable-program",
  "gtl-c-no-result-bearing-stage",
  "gtl-c-multiple-result-bearing-stages",
  "gtl-c-duplicate-stage-role",
  "gtl-c-unrealized-workflow-lift",
  "gtl-c-unrealized-batch",
  "gtl-c-unrealized-retry",
  "gtl-c-hog-admission-failed"
] as const);

export type CAlgebraDiagnosticId =
  (typeof C_ALGEBRA_DIAGNOSTIC_ID_VALUES)[number];

export type CAlgebraRepairAffordance =
  | "fix_declaration_shape"
  | "remove_unknown_field"
  | "supply_non_empty_ref"
  | "select_declared_regime"
  | "bind_matching_carrier"
  | "bind_canonical_edge_role"
  | "supply_non_empty_batch"
  | "bind_matching_result_cardinality"
  | "supply_positive_retry_budget"
  | "declare_executable_leaf"
  | "declare_exactly_one_result_stage"
  | "rename_duplicate_stage_role"
  | "use_flat_composition"
  | "await_runtime_realization";

export interface CAlgebraDiagnostic {
  readonly kind: "c_algebra_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: CAlgebraDiagnosticId;
  readonly path: string;
  readonly message: string;
  readonly axiomRef: string;
  readonly requirementRef: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly repairAffordances: readonly CAlgebraRepairAffordance[];
}

export const C_CARRIER_TYPE: unique symbol = Symbol("gtl.c.carrier.type");
export const C_TERM_TYPE: unique symbol = Symbol("gtl.c.term.type");
export const C_PROGRAM_TYPE: unique symbol = Symbol("gtl.c.program.type");
const C_PROGRAM_ADMISSION: unique symbol = Symbol("gtl.c.program.admission");
const C_GRAPH_FUNCTION_REF_TYPE: unique symbol = Symbol(
  "gtl.c.graph_function_ref.type"
);
const C_INTERFACE_AUTHORITY: unique symbol = Symbol(
  "gtl.c.interface.authority"
);
const NODE_BACKED_C_AUTHORITY: unique symbol = Symbol(
  "gtl.c.node_backed.authority"
);
const NODE_BACKED_C_REF_AUTHORITY: unique symbol = Symbol(
  "gtl.c.node_backed.graph_function_ref.authority"
);
const NODE_BACKED_C_BINDING_AUTHORITY: unique symbol = Symbol(
  "gtl.c.node_backed.graph_vector_binding.authority"
);

export interface CCarrier<Type> {
  readonly kind: "c_carrier";
  readonly ref: string;
  readonly [C_CARRIER_TYPE]: (value: Type) => Type;
}

export interface CInterfaceCarrier<
  Value,
  Nodes extends NonEmptyTypedNodeTuple
> extends CCarrier<Value> {
  readonly interface: TypedInterface<Value, Nodes>;
  readonly [C_INTERFACE_AUTHORITY]: true;
}

export interface CGraphFunctionRef<Input, Output> {
  readonly kind: "c_graph_function_ref";
  readonly ref: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly [C_GRAPH_FUNCTION_REF_TYPE]: {
    readonly input: (value: Input) => Input;
    readonly output: (value: Output) => Output;
  };
}

export interface NodeBackedCGraphFunctionRef<
  Input,
  Output,
  InputNodes extends NonEmptyTypedNodeTuple,
  OutputNodes extends NonEmptyTypedNodeTuple
> extends CGraphFunctionRef<Input, Output> {
  readonly [NODE_BACKED_C_REF_AUTHORITY]: {
    readonly input: CInterfaceCarrier<Input, InputNodes>;
    readonly output: CInterfaceCarrier<Output, OutputNodes>;
  };
}

export interface CTermWitness<Input, Output, Roles extends string, Cardinality> {
  readonly input: (value: Input) => Input;
  readonly output: (value: Output) => Output;
  readonly roles: (value: Roles) => Roles;
  readonly resultCardinality: (value: Cardinality) => Cardinality;
}

export interface COfNode {
  readonly kind: "c_of";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly stageRole: string;
  readonly fibre: CAlgebraRegime;
  readonly armId: string;
  readonly resultBearing: boolean;
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}

export interface CIdentityNode {
  readonly kind: "c_identity";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
}

export interface CComposeNode {
  readonly kind: "c_compose";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly left: CProgramNode;
  readonly right: CProgramNode;
}

export interface CEdgeNode {
  readonly kind: "c_edge";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly transform: CProgramNode;
  readonly evaluate: CProgramNode;
  readonly consequence: CProgramNode;
}

export interface CWorkflowNode {
  readonly kind: "c_workflow";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly graphFunctionRef: string;
}

export interface CBatchNode {
  readonly kind: "c_batch";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly batchRef: string;
  readonly tasks: readonly CProgramNode[];
}

export interface CRetryNode {
  readonly kind: "c_retry";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly budget: number;
  readonly term: CProgramNode;
}

export type CProgramNode =
  | COfNode
  | CIdentityNode
  | CComposeNode
  | CEdgeNode
  | CWorkflowNode
  | CBatchNode
  | CRetryNode;

type NativeCProgramTerm<
  Input,
  Output,
  Roles extends string = string,
  Cardinality extends CAlgebraResultCardinality = CAlgebraResultCardinality
> = CProgramNode & {
  readonly [C_TERM_TYPE]: CTermWitness<Input, Output, Roles, Cardinality>;
};

export type CProgramTerm<
  Input,
  Output,
  Roles extends string = string,
  Cardinality extends CAlgebraResultCardinality = CAlgebraResultCardinality
> = NativeCProgramTerm<Input, Output, Roles, Cardinality> & {
  readonly nativeMode: "ordinary";
};

export type NodeBackedCProgramTerm<
  Input,
  Output,
  InputNodes extends NonEmptyTypedNodeTuple,
  OutputNodes extends NonEmptyTypedNodeTuple,
  Roles extends string = string,
  Cardinality extends CAlgebraResultCardinality = CAlgebraResultCardinality
> = NativeCProgramTerm<Input, Output, Roles, Cardinality> & {
  readonly [NODE_BACKED_C_AUTHORITY]: {
    readonly input: CInterfaceCarrier<Input, InputNodes>;
    readonly output: CInterfaceCarrier<Output, OutputNodes>;
  };
  readonly nativeMode: "node_backed";
};

export interface NodeBackedCProgramBinding<
  Input,
  Output,
  SourceNodes extends NonEmptyTypedNodeTuple,
  TargetNode extends TypedNode<Output>,
  Roles extends string = string,
  Cardinality extends CAlgebraResultCardinality = CAlgebraResultCardinality
> {
  readonly kind: "node_backed_c_program_binding";
  readonly graphVector: GraphVector;
  readonly graphVectorRef: string;
  readonly source: TypedInterface<Input, SourceNodes>;
  readonly target: TypedInterface<Output, readonly [TargetNode]>;
  readonly program: NodeBackedCProgramTerm<
    Input,
    Output,
    SourceNodes,
    readonly [TargetNode],
    Roles,
    Cardinality
  >;
  readonly [NODE_BACKED_C_BINDING_AUTHORITY]: true;
}

export type COfTerm<
  Input,
  Output,
  Role extends string,
  Fibre extends CAlgebraRegime,
  Cardinality extends "zero" | "one"
> = COfNode & CProgramTerm<Input, Output, Role, Cardinality> & {
  readonly fibre: Fibre;
};

type UnbrandedCOfTerm<
  Input,
  Output,
  Role extends string,
  Fibre extends CAlgebraRegime,
  Cardinality extends "zero" | "one"
> = COfNode & NativeCProgramTerm<Input, Output, Role, Cardinality> & {
  readonly fibre: Fibre;
};

export type NodeBackedCOfTerm<
  Input,
  Output,
  InputNodes extends NonEmptyTypedNodeTuple,
  OutputNodes extends NonEmptyTypedNodeTuple,
  Role extends string,
  Fibre extends CAlgebraRegime,
  Cardinality extends "zero" | "one"
> = COfNode &
  NodeBackedCProgramTerm<
    Input,
    Output,
    InputNodes,
    OutputNodes,
    Role,
    Cardinality
  > & {
    readonly fibre: Fibre;
  };

type UnbrandedCProgramTerm = CProgramNode & {
  readonly [C_TERM_TYPE]: object;
};

type SomeNodeBackedCProgramTerm = UnbrandedCProgramTerm & {
  readonly [NODE_BACKED_C_AUTHORITY]: object;
  readonly nativeMode: "node_backed";
};

type OrdinaryCProgramTerm = UnbrandedCProgramTerm & {
  readonly nativeMode: "ordinary";
  readonly [NODE_BACKED_C_AUTHORITY]?: never;
};

type SomeCProgramTerm = OrdinaryCProgramTerm | SomeNodeBackedCProgramTerm;

type NonNodeCCarrier<Type> = CCarrier<Type> & {
  readonly [C_INTERFACE_AUTHORITY]?: never;
};

type ExactTypedNodeTuple<Nodes extends NonEmptyTypedNodeTuple> =
  number extends Nodes["length"] ? never : unknown;

type SomeCOfTerm = COfNode & SomeCProgramTerm;

type SomeNodeBackedCOfTerm = COfNode & SomeNodeBackedCProgramTerm;

export type CInputOf<Term> = Term extends {
  readonly [C_TERM_TYPE]: {
    readonly input: (value: infer Input) => unknown;
  };
}
  ? Input
  : never;

export type COutputOf<Term> = Term extends {
  readonly [C_TERM_TYPE]: {
    readonly output: (value: infer Output) => unknown;
  };
}
  ? Output
  : never;

export type CRolesOf<Term> = Term extends {
  readonly [C_TERM_TYPE]: {
    readonly roles: (value: infer Roles) => unknown;
  };
}
  ? Extract<Roles, string>
  : never;

export type CResultCardinalityOf<Term> = Term extends {
  readonly [C_TERM_TYPE]: {
    readonly resultCardinality: (value: infer Cardinality) => unknown;
  };
}
  ? Extract<Cardinality, CAlgebraResultCardinality>
  : never;

export type CInputNodesOf<Term> = Term extends {
  readonly [NODE_BACKED_C_AUTHORITY]: {
    readonly input: CInterfaceCarrier<infer Value, infer Nodes>;
  };
}
  ? [Value] extends [unknown]
    ? Nodes
    : never
  : never;

export type COutputNodesOf<Term> = Term extends {
  readonly [NODE_BACKED_C_AUTHORITY]: {
    readonly output: CInterfaceCarrier<infer Value, infer Nodes>;
  };
}
  ? [Value] extends [unknown]
    ? Nodes
    : never
  : never;

type NonEmptyLiteral<Value extends string> = string extends Value
  ? Value
  : Value extends ""
    ? never
    : Value;

type ExactType<Left, Right> = [Left] extends [Right]
  ? [Right] extends [Left]
    ? unknown
    : never
  : never;

type ExactRole<Term, Role extends string> = ExactType<CRolesOf<Term>, Role>;

type CombineResultCardinality<
  Left extends CAlgebraResultCardinality,
  Right extends CAlgebraResultCardinality
> = Left extends "unknown"
  ? "unknown"
  : Right extends "unknown"
    ? "unknown"
    : Left extends "zero"
      ? Right
      : Right extends "zero"
        ? Left
        : "many";

export interface CProgramDeclarationNode {
  readonly kind: "c_program_declaration";
  readonly syntaxVersion: typeof C_ALGEBRA_SYNTAX_VERSION;
  readonly programRef: string;
  readonly term: CProgramNode;
  readonly proportionalityClass: string | null;
}

export interface AdmittedCProgramDeclarationNode
  extends CProgramDeclarationNode {
  readonly [C_PROGRAM_ADMISSION]: true;
}

export type CProgramDeclaration<
  Input,
  Output,
  Term extends SomeCProgramTerm
> = CProgramDeclarationNode & {
  readonly [C_PROGRAM_TYPE]: {
    readonly input: (value: Input) => Input;
    readonly output: (value: Output) => Output;
    readonly term: Term;
  };
};

export interface CProgramAdmission {
  readonly accepted: boolean;
  readonly program: AdmittedCProgramDeclarationNode | null;
  readonly diagnostics: readonly CAlgebraDiagnostic[];
}

function diagnostic(
  diagnosticId: CAlgebraDiagnosticId,
  path: string,
  message: string,
  repairAffordances: readonly CAlgebraRepairAffordance[]
): CAlgebraDiagnostic {
  const classification = diagnosticId.startsWith("gtl-c-unrealized-")
    ? "semantic_not_realized"
    : "invalid_program";
  return Object.freeze({
    kind: "c_algebra_diagnostic" as const,
    classification,
    diagnosticId,
    path,
    message,
    axiomRef: diagnosticAxiomRef(diagnosticId),
    requirementRef: diagnosticRequirementRef(diagnosticId),
    expectedRelation: diagnosticExpectedRelation(diagnosticId),
    actualRelation: message,
    evidenceRefs: Object.freeze([`c-algebra:${diagnosticId}:${path}`]),
    repairAffordances: Object.freeze([...repairAffordances])
  });
}

function diagnosticAxiomRef(diagnosticId: CAlgebraDiagnosticId): string {
  if (diagnosticId === "gtl-c-invalid-regime") {
    return "AX-T220-04";
  }
  if (diagnosticId.startsWith("gtl-c-unrealized-")) {
    return "AX-T220-09";
  }
  return "AX-T220-03";
}

function diagnosticRequirementRef(
  diagnosticId: CAlgebraDiagnosticId
): string {
  if (diagnosticId === "gtl-c-unrealized-workflow-lift") {
    return "REQ-L-GTL3-C-ALGEBRA-006";
  }
  if (
    diagnosticId === "gtl-c-unrealized-batch" ||
    diagnosticId === "gtl-c-empty-batch" ||
    diagnosticId === "gtl-c-batch-cardinality-mismatch"
  ) {
    return "REQ-L-GTL3-C-ALGEBRA-007";
  }
  if (
    diagnosticId === "gtl-c-unrealized-retry" ||
    diagnosticId === "gtl-c-invalid-retry-budget"
  ) {
    return "REQ-L-GTL3-C-ALGEBRA-008";
  }
  if (diagnosticId === "gtl-c-edge-role-mismatch") {
    return "REQ-L-GTL3-C-ALGEBRA-005";
  }
  if (diagnosticId === "gtl-c-invalid-regime") {
    return "REQ-L-GTL3-C-ALGEBRA-009";
  }
  return "REQ-L-GTL3-C-ALGEBRA-013";
}

function diagnosticExpectedRelation(
  diagnosticId: CAlgebraDiagnosticId
): string {
  switch (diagnosticId) {
    case "gtl-c-carrier-mismatch":
      return "adjacent C output and input carrier refs are equal";
    case "gtl-c-edge-role-mismatch":
      return "C.edge fields are direct C.of leaves with their named roles";
    case "gtl-c-empty-executable-program":
    case "gtl-c-no-result-bearing-stage":
      return "program has exactly one result-bearing executable term";
    case "gtl-c-multiple-result-bearing-stages":
      return "program has exactly one result-bearing executable term";
    case "gtl-c-batch-cardinality-mismatch":
      return "all batch tasks have equal result cardinality";
    case "gtl-c-unrealized-workflow-lift":
    case "gtl-c-unrealized-batch":
    case "gtl-c-unrealized-retry":
      return "selected build tenant realizes the admitted C constructor";
    case "gtl-c-invalid-json":
    case "gtl-c-invalid-syntax":
    case "gtl-c-unknown-field":
    case "gtl-c-empty-ref":
    case "gtl-c-invalid-regime":
    case "gtl-c-empty-batch":
    case "gtl-c-invalid-retry-budget":
    case "gtl-c-duplicate-stage-role":
    case "gtl-c-hog-admission-failed":
      return "authored value satisfies the closed C algebra relation";
  }
}

export function constructCAlgebraDiagnostic(input: {
  readonly diagnosticId: CAlgebraDiagnosticId;
  readonly path: string;
  readonly message: string;
  readonly repairAffordances: readonly CAlgebraRepairAffordance[];
}): CAlgebraDiagnostic {
  return diagnostic(
    input.diagnosticId,
    input.path,
    input.message,
    input.repairAffordances
  );
}

function requireNonEmpty(value: string, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function cTermWitness<Input, Output, Roles extends string, Cardinality>(): CTermWitness<
  Input,
  Output,
  Roles,
  Cardinality
> {
  return Object.freeze({
    input: (value: Input): Input => value,
    output: (value: Output): Output => value,
    roles: (value: Roles): Roles => value,
    resultCardinality: (value: Cardinality): Cardinality => value
  });
}

function assertNativeCCarrier(value: object, label: string): void {
  if (!Object.hasOwn(value, C_CARRIER_TYPE)) {
    throw new TypeError(`${label} must be created by cCarrier`);
  }
}

function isCInterfaceCarrier(value: object): boolean {
  return Object.hasOwn(value, C_INTERFACE_AUTHORITY);
}

function assertCInterfaceCarrier<
  Value,
  Nodes extends NonEmptyTypedNodeTuple
>(
  value: CInterfaceCarrier<Value, Nodes>,
  label: string
): void {
  assertNativeCCarrier(value, label);
  if (!isCInterfaceCarrier(value)) {
    throw new TypeError(
      `${label} must be created from a constructor-owned TypedInterface`
    );
  }
  assertTypedInterface(value.interface, `${label}.interface`);
  if (value.ref !== value.interface.interfaceRef) {
    throw new TypeError(`${label} ref does not match its typed interface`);
  }
}

function sameTypedInterface(
  left: {
    readonly interfaceRef: string;
    readonly orderedNodeRefs: readonly string[];
    readonly orderedNodeContractKeys: readonly string[];
  },
  right: {
    readonly interfaceRef: string;
    readonly orderedNodeRefs: readonly string[];
    readonly orderedNodeContractKeys: readonly string[];
  }
): boolean {
  return (
    left.interfaceRef === right.interfaceRef &&
    JSON.stringify(left.orderedNodeRefs) ===
      JSON.stringify(right.orderedNodeRefs) &&
    JSON.stringify(left.orderedNodeContractKeys) ===
      JSON.stringify(right.orderedNodeContractKeys)
  );
}

function exactInterfaceNodes(
  nodes: readonly Node[],
  boundary: {
    readonly orderedNodeRefs: readonly string[];
    readonly orderedNodeContractKeys: readonly string[];
  }
): boolean {
  return (
    nodes.length === boundary.orderedNodeRefs.length &&
    nodes.every(
      (node, index) =>
        node.id === boundary.orderedNodeRefs[index] &&
        nodeContractKey(admitNode(node, "C exact interface Node")) ===
          boundary.orderedNodeContractKeys[index]
    )
  );
}

function assertNativeCTerm(value: object, label: string): void {
  const nodeBacked = Object.hasOwn(value, NODE_BACKED_C_AUTHORITY);
  const mode: unknown = Object.getOwnPropertyDescriptor(
    value,
    "nativeMode"
  )?.value;
  if (
    !Object.hasOwn(value, C_TERM_TYPE) ||
    (mode !== "ordinary" && mode !== "node_backed") ||
    (mode === "node_backed") !== nodeBacked
  ) {
    throw new TypeError(`${label} must be created by a C constructor`);
  }
}

function isNodeBackedCTerm(value: object): boolean {
  return Object.hasOwn(value, NODE_BACKED_C_AUTHORITY);
}

function assertNodeBackedCTerm<
  Input,
  Output,
  InputNodes extends NonEmptyTypedNodeTuple,
  OutputNodes extends NonEmptyTypedNodeTuple,
  Roles extends string,
  Cardinality extends CAlgebraResultCardinality
>(
  value: NodeBackedCProgramTerm<
    Input,
    Output,
    InputNodes,
    OutputNodes,
    Roles,
    Cardinality
  >,
  label: string
): void {
  assertNativeCTerm(value, label);
  if (!isNodeBackedCTerm(value)) {
    throw new TypeError(
      `${label} must be created by a Node-backed C constructor`
    );
  }
  const authority = value[NODE_BACKED_C_AUTHORITY];
  assertCInterfaceCarrier(authority.input, `${label}.input`);
  assertCInterfaceCarrier(authority.output, `${label}.output`);
  if (
    value.inputCarrierRef !== authority.input.ref ||
    value.outputCarrierRef !== authority.output.ref
  ) {
    throw new TypeError(`${label} carrier refs do not match its Node witnesses`);
  }
}

function assertMatchingNodeBackedMode(
  values: readonly object[],
  label: string
): boolean {
  const modes = values.map(isNodeBackedCTerm);
  if (modes.some(Boolean) && !modes.every(Boolean)) {
    throw new TypeError(
      `${label} cannot mix ordinary and Node-backed C terms`
    );
  }
  return modes.every(Boolean);
}

interface RuntimeNodeBackedAuthority {
  readonly input: object;
  readonly output: object;
}

interface RuntimeTypedInterfaceIdentity {
  readonly interfaceRef: string;
  readonly orderedNodeRefs: readonly string[];
  readonly orderedNodeContractKeys: readonly string[];
}

function interfaceIdentityFromCarrier(
  carrier: object,
  label: string
): RuntimeTypedInterfaceIdentity {
  if (!isCInterfaceCarrier(carrier)) {
    throw new TypeError(`${label} is not a C interface carrier`);
  }
  const descriptor = Object.getOwnPropertyDescriptor(carrier, "interface");
  const boundary: unknown = descriptor?.value;
  if (!isPlainRecord(boundary)) {
    throw new TypeError(`${label} has no typed interface`);
  }
  const interfaceRef = boundary["interfaceRef"];
  const orderedNodeRefs = boundary["orderedNodeRefs"];
  const orderedNodeContractKeys = boundary["orderedNodeContractKeys"];
  if (
    typeof interfaceRef !== "string" ||
    !Array.isArray(orderedNodeRefs) ||
    !orderedNodeRefs.every((value) => typeof value === "string") ||
    !Array.isArray(orderedNodeContractKeys) ||
    !orderedNodeContractKeys.every((value) => typeof value === "string")
  ) {
    throw new TypeError(`${label} has an invalid typed interface identity`);
  }
  return Object.freeze({
    interfaceRef,
    orderedNodeRefs: Object.freeze([...orderedNodeRefs]),
    orderedNodeContractKeys: Object.freeze([...orderedNodeContractKeys])
  });
}

function nodeBackedAuthority(
  value: object,
  label: string
): RuntimeNodeBackedAuthority {
  if (!isNodeBackedCTerm(value)) {
    throw new TypeError(`${label} is not a Node-backed C term`);
  }
  const descriptor = Object.getOwnPropertyDescriptor(
    value,
    NODE_BACKED_C_AUTHORITY
  );
  const candidate: unknown = descriptor?.value;
  if (!isPlainRecord(candidate)) {
    throw new TypeError(`${label} has invalid Node-backed authority`);
  }
  const input = candidate["input"];
  const output = candidate["output"];
  if (
    typeof input !== "object" ||
    input === null ||
    typeof output !== "object" ||
    output === null
  ) {
    throw new TypeError(`${label} has invalid Node-backed interfaces`);
  }
  return Object.freeze({ input, output });
}

function freezeOrdinaryCTerm<Term extends UnbrandedCProgramTerm>(
  term: Term
): Term & { readonly nativeMode: "ordinary" } {
  const branded: Term & {
    readonly nativeMode: "ordinary";
  } = { ...term, nativeMode: "ordinary" };
  Object.defineProperty(branded, C_TERM_TYPE, { enumerable: false });
  Object.defineProperty(branded, "nativeMode", { enumerable: false });
  return Object.freeze(branded);
}

function freezeNodeBackedCTerm<Term extends UnbrandedCProgramTerm>(
  term: Term,
  nodeAuthority: {
    readonly input: object;
    readonly output: object;
  }
): Term & {
  readonly nativeMode: "node_backed";
  readonly [NODE_BACKED_C_AUTHORITY]: {
    readonly input: object;
    readonly output: object;
  };
} {
  const branded: Term & {
    readonly nativeMode: "node_backed";
    readonly [NODE_BACKED_C_AUTHORITY]: {
      readonly input: object;
      readonly output: object;
    };
  } = {
    ...term,
    nativeMode: "node_backed",
    [NODE_BACKED_C_AUTHORITY]: Object.freeze(nodeAuthority)
  };
  Object.defineProperty(branded, C_TERM_TYPE, { enumerable: false });
  Object.defineProperty(branded, "nativeMode", { enumerable: false });
  Object.defineProperty(branded, NODE_BACKED_C_AUTHORITY, {
    enumerable: false
  });
  return Object.freeze(branded);
}

function freezeAdmittedCProgram<Program extends CProgramDeclarationNode>(
  program: Program & AdmittedCProgramDeclarationNode
): Program & AdmittedCProgramDeclarationNode {
  Object.defineProperty(program, C_PROGRAM_ADMISSION, {
    value: true,
    enumerable: false
  });
  return Object.freeze(program);
}

export function isAdmittedCProgramDeclaration(
  program: CProgramDeclarationNode
): program is AdmittedCProgramDeclarationNode {
  return Object.hasOwn(program, C_PROGRAM_ADMISSION);
}

function freezeNonEmptyStrings(
  value: readonly string[] | undefined,
  label: string
): readonly string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array of non-empty strings`);
  }
  const entries: readonly unknown[] = value;
  const admitted: string[] = [];
  for (const entry of entries) {
    if (typeof entry !== "string" || entry.length === 0) {
      throw new TypeError(`${label} must be an array of non-empty strings`);
    }
    admitted.push(entry);
  }
  return Object.freeze(admitted);
}

export function cCarrier<Type>(ref: string): CCarrier<Type> {
  const carrier: CCarrier<Type> = {
    kind: "c_carrier",
    ref: requireNonEmpty(ref, "C carrier ref"),
    [C_CARRIER_TYPE]: (value: Type): Type => value
  };
  Object.defineProperty(carrier, C_CARRIER_TYPE, { enumerable: false });
  return Object.freeze(carrier);
}

export function cInterfaceContractRef(nodes: readonly Node[]): string {
  return deriveNodeInterfaceContractRef(nodes, "C interface carrier");
}

export function cInterfaceCarrier<
  Value,
  const Nodes extends NonEmptyTypedNodeTuple
>(
  boundary: TypedInterface<Value, Nodes> & ExactTypedNodeTuple<Nodes>
): CInterfaceCarrier<Value, Nodes> {
  assertTypedInterface(boundary, "cInterfaceCarrier.boundary");
  const carrier: CInterfaceCarrier<Value, Nodes> = {
    kind: "c_carrier",
    ref: boundary.interfaceRef,
    interface: boundary,
    [C_CARRIER_TYPE]: (value: Value): Value => value,
    [C_INTERFACE_AUTHORITY]: true
  };
  Object.defineProperty(carrier, C_CARRIER_TYPE, { enumerable: false });
  Object.defineProperty(carrier, C_INTERFACE_AUTHORITY, { enumerable: false });
  return Object.freeze(carrier);
}

export function cGraphFunctionRef<
  Input,
  Output,
  const InputNodes extends NonEmptyTypedNodeTuple,
  const OutputNodes extends NonEmptyTypedNodeTuple
>(input: {
  readonly graphFunction: GraphFunction;
  readonly input: TypedInterface<Input, InputNodes> &
    ExactTypedNodeTuple<InputNodes>;
  readonly output: TypedInterface<Output, OutputNodes> &
    ExactTypedNodeTuple<OutputNodes>;
}): NodeBackedCGraphFunctionRef<
  Input,
  Output,
  InputNodes,
  OutputNodes
> {
  if (!isAdmittedGraphFunction(input.graphFunction)) {
    throw new TypeError(
      "C graph-function ref requires a constructor-admitted GraphFunction"
    );
  }
  assertTypedInterface(input.input, "C graph-function ref input");
  assertTypedInterface(input.output, "C graph-function ref output");
  if (
    !exactInterfaceNodes(input.graphFunction.inputs, input.input) ||
    !exactInterfaceNodes(input.graphFunction.outputs, input.output)
  ) {
    throw new TypeError(
      "C graph-function ref requires exact ordered input and output Node witnesses"
    );
  }
  const inputCarrier = cInterfaceCarrier(input.input);
  const outputCarrier = cInterfaceCarrier(input.output);
  const reference: NodeBackedCGraphFunctionRef<
    Input,
    Output,
    InputNodes,
    OutputNodes
  > = {
    kind: "c_graph_function_ref",
    ref: input.graphFunction.id,
    inputCarrierRef: inputCarrier.ref,
    outputCarrierRef: outputCarrier.ref,
    [C_GRAPH_FUNCTION_REF_TYPE]: Object.freeze({
      input: (value: Input): Input => value,
      output: (value: Output): Output => value
    }),
    [NODE_BACKED_C_REF_AUTHORITY]: Object.freeze({
      input: inputCarrier,
      output: outputCarrier
    })
  };
  Object.defineProperty(reference, C_GRAPH_FUNCTION_REF_TYPE, {
    enumerable: false
  });
  Object.defineProperty(reference, NODE_BACKED_C_REF_AUTHORITY, {
    enumerable: false
  });
  return Object.freeze(reference);
}

export function cOf<
  Input,
  Output,
  const InputNodes extends NonEmptyTypedNodeTuple,
  const OutputNodes extends NonEmptyTypedNodeTuple,
  const Role extends string,
  const Fibre extends CAlgebraRegime,
  const ResultBearing extends boolean
>(input: {
  readonly input: CInterfaceCarrier<Input, InputNodes>;
  readonly output: CInterfaceCarrier<Output, OutputNodes>;
  readonly stageRole: NonEmptyLiteral<Role>;
  readonly fibre: Fibre;
  readonly armId: string;
  readonly resultBearing: ResultBearing;
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}): NodeBackedCOfTerm<
  Input,
  Output,
  InputNodes,
  OutputNodes,
  Role,
  Fibre,
  ResultBearing extends true ? "one" : "zero"
>;
export function cOf<
  Input,
  Output,
  const Role extends string,
  const Fibre extends CAlgebraRegime,
  const ResultBearing extends boolean
>(input: {
  readonly input: NonNodeCCarrier<Input>;
  readonly output: NonNodeCCarrier<Output>;
  readonly stageRole: NonEmptyLiteral<Role>;
  readonly fibre: Fibre;
  readonly armId: string;
  readonly resultBearing: ResultBearing;
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}): COfTerm<
  Input,
  Output,
  Role,
  Fibre,
  ResultBearing extends true ? "one" : "zero"
>;
export function cOf<
  Input,
  Output,
  const Role extends string,
  const Fibre extends CAlgebraRegime,
  const ResultBearing extends boolean
>(input: {
  readonly input: CCarrier<Input>;
  readonly output: CCarrier<Output>;
  readonly stageRole: NonEmptyLiteral<Role>;
  readonly fibre: Fibre;
  readonly armId: string;
  readonly resultBearing: ResultBearing;
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}): COfTerm<
  Input,
  Output,
  Role,
  Fibre,
  ResultBearing extends true ? "one" : "zero"
> | SomeNodeBackedCOfTerm {
  assertNativeCCarrier(input.input, "C.of input");
  assertNativeCCarrier(input.output, "C.of output");
  const inputIsNodeBacked = isCInterfaceCarrier(input.input);
  const outputIsNodeBacked = isCInterfaceCarrier(input.output);
  if (inputIsNodeBacked !== outputIsNodeBacked) {
    throw new TypeError(
      "C.of cannot mix ordinary and Node-backed interface carriers"
    );
  }
  const stageRole = requireNonEmpty(input.stageRole, "C.of stageRole");
  const armId = requireNonEmpty(input.armId, "C.of armId");
  if (!C_ALGEBRA_REGIME_VALUES.includes(input.fibre)) {
    throw new TypeError(
      `C.of fibre must be one of ${JSON.stringify(C_ALGEBRA_REGIME_VALUES)}`
    );
  }
  const instructionCategoryRefs = freezeNonEmptyStrings(
    input.instructionCategoryRefs,
    "C.of instructionCategoryRefs"
  );
  const term: UnbrandedCOfTerm<
    Input,
    Output,
    Role,
    Fibre,
    ResultBearing extends true ? "one" : "zero"
  > = {
    kind: "c_of",
    inputCarrierRef: input.input.ref,
    outputCarrierRef: input.output.ref,
    stageRole,
    fibre: input.fibre,
    armId,
    resultBearing: input.resultBearing,
    ...(instructionCategoryRefs === undefined
      ? {}
      : {
          instructionCategoryRefs
        }),
    [C_TERM_TYPE]: cTermWitness<
      Input,
      Output,
      Role,
      ResultBearing extends true ? "one" : "zero"
    >()
  };
  return inputIsNodeBacked
    ? freezeNodeBackedCTerm(term, {
        input: input.input,
        output: input.output
      })
    : freezeOrdinaryCTerm(term);
}

export function cIdentity<
  Type,
  const Nodes extends NonEmptyTypedNodeTuple
>(
  carrier: CInterfaceCarrier<Type, Nodes>
): NodeBackedCProgramTerm<Type, Type, Nodes, Nodes, never, "zero">;
export function cIdentity<Type>(
  carrier: NonNodeCCarrier<Type>
): CProgramTerm<Type, Type, never, "zero">;
export function cIdentity<Type>(
  carrier: CCarrier<Type>
): SomeCProgramTerm {
  assertNativeCCarrier(carrier, "C.id carrier");
  const term: NativeCProgramTerm<Type, Type, never, "zero"> = {
    kind: "c_identity",
    inputCarrierRef: carrier.ref,
    outputCarrierRef: carrier.ref,
    [C_TERM_TYPE]: cTermWitness<Type, Type, never, "zero">()
  };
  return isCInterfaceCarrier(carrier)
    ? freezeNodeBackedCTerm(term, { input: carrier, output: carrier })
    : freezeOrdinaryCTerm(term);
}

export function cCompose<
  Left extends SomeNodeBackedCProgramTerm,
  Right extends SomeNodeBackedCProgramTerm
>(
  left: Left,
  right: Right &
    ExactType<COutputOf<Left>, CInputOf<Right>> &
    ExactType<COutputNodesOf<Left>, CInputNodesOf<Right>>
): NodeBackedCProgramTerm<
  CInputOf<Left>,
  COutputOf<Right>,
  CInputNodesOf<Left>,
  COutputNodesOf<Right>,
  CRolesOf<Left> | CRolesOf<Right>,
  CombineResultCardinality<
    CResultCardinalityOf<Left>,
    CResultCardinalityOf<Right>
  >
>;
export function cCompose<
  Left extends OrdinaryCProgramTerm,
  Right extends OrdinaryCProgramTerm
>(
  left: Left,
  right: Right & ExactType<COutputOf<Left>, CInputOf<Right>>
): CProgramTerm<
  CInputOf<Left>,
  COutputOf<Right>,
  CRolesOf<Left> | CRolesOf<Right>,
  CombineResultCardinality<
    CResultCardinalityOf<Left>,
    CResultCardinalityOf<Right>
  >
>;
export function cCompose<
  Left extends SomeCProgramTerm,
  Right extends SomeCProgramTerm
>(
  left: Left,
  right: Right & ExactType<COutputOf<Left>, CInputOf<Right>>
): SomeCProgramTerm {
  assertNativeCTerm(left, "C.compose left");
  assertNativeCTerm(right, "C.compose right");
  const nodeBacked = assertMatchingNodeBackedMode(
    [left, right],
    "C.compose"
  );
  if (left.outputCarrierRef !== right.inputCarrierRef) {
    throw new TypeError(
      `C.compose carrier mismatch: ${left.outputCarrierRef} != ${right.inputCarrierRef}`
    );
  }
  const term: NativeCProgramTerm<
    CInputOf<Left>,
    COutputOf<Right>,
    CRolesOf<Left> | CRolesOf<Right>,
    CombineResultCardinality<
      CResultCardinalityOf<Left>,
      CResultCardinalityOf<Right>
    >
  > = {
    kind: "c_compose",
    inputCarrierRef: left.inputCarrierRef,
    outputCarrierRef: right.outputCarrierRef,
    left,
    right,
    [C_TERM_TYPE]: cTermWitness<
      CInputOf<Left>,
      COutputOf<Right>,
      CRolesOf<Left> | CRolesOf<Right>,
      CombineResultCardinality<
        CResultCardinalityOf<Left>,
        CResultCardinalityOf<Right>
      >
    >()
  };
  if (!nodeBacked) {
    return freezeOrdinaryCTerm(term);
  }
  const leftAuthority = nodeBackedAuthority(left, "C.compose left");
  const rightAuthority = nodeBackedAuthority(right, "C.compose right");
  if (
    !sameTypedInterface(
      interfaceIdentityFromCarrier(
        leftAuthority.output,
        "C.compose left output"
      ),
      interfaceIdentityFromCarrier(
        rightAuthority.input,
        "C.compose right input"
      )
    )
  ) {
    throw new TypeError("C.compose typed middle interfaces do not match");
  }
  return freezeNodeBackedCTerm(term, {
    input: leftAuthority.input,
    output: rightAuthority.output
  });
}

export function cEdge<
  Transform extends SomeNodeBackedCOfTerm,
  Evaluate extends SomeNodeBackedCOfTerm,
  Consequence extends SomeNodeBackedCOfTerm
>(input: {
  readonly transform: Transform & ExactRole<Transform, "transform">;
  readonly evaluate: Evaluate &
    ExactRole<Evaluate, "evaluate"> &
    ExactType<COutputOf<Transform>, CInputOf<Evaluate>> &
    ExactType<COutputNodesOf<Transform>, CInputNodesOf<Evaluate>>;
  readonly consequence: Consequence &
    ExactRole<Consequence, "consequence"> &
    ExactType<COutputOf<Evaluate>, CInputOf<Consequence>> &
    ExactType<COutputNodesOf<Evaluate>, CInputNodesOf<Consequence>>;
}): NodeBackedCProgramTerm<
  CInputOf<Transform>,
  COutputOf<Consequence>,
  CInputNodesOf<Transform>,
  COutputNodesOf<Consequence>,
  "transform" | "evaluate" | "consequence",
  CombineResultCardinality<
    CombineResultCardinality<
      CResultCardinalityOf<Transform>,
      CResultCardinalityOf<Evaluate>
    >,
    CResultCardinalityOf<Consequence>
  >
>;
export function cEdge<
  Transform extends SomeCOfTerm & OrdinaryCProgramTerm,
  Evaluate extends SomeCOfTerm & OrdinaryCProgramTerm,
  Consequence extends SomeCOfTerm & OrdinaryCProgramTerm
>(input: {
  readonly transform: Transform & ExactRole<Transform, "transform">;
  readonly evaluate: Evaluate &
    ExactRole<Evaluate, "evaluate"> &
    ExactType<COutputOf<Transform>, CInputOf<Evaluate>>;
  readonly consequence: Consequence &
    ExactRole<Consequence, "consequence"> &
    ExactType<COutputOf<Evaluate>, CInputOf<Consequence>>;
}): CProgramTerm<
  CInputOf<Transform>,
  COutputOf<Consequence>,
  "transform" | "evaluate" | "consequence",
  CombineResultCardinality<
    CombineResultCardinality<
      CResultCardinalityOf<Transform>,
      CResultCardinalityOf<Evaluate>
    >,
    CResultCardinalityOf<Consequence>
  >
>;
export function cEdge<
  Transform extends SomeCOfTerm,
  Evaluate extends SomeCOfTerm,
  Consequence extends SomeCOfTerm
>(input: {
  readonly transform: Transform & ExactRole<Transform, "transform">;
  readonly evaluate: Evaluate &
    ExactRole<Evaluate, "evaluate"> &
    ExactType<COutputOf<Transform>, CInputOf<Evaluate>>;
  readonly consequence: Consequence &
    ExactRole<Consequence, "consequence"> &
    ExactType<COutputOf<Evaluate>, CInputOf<Consequence>>;
}): SomeCProgramTerm {
  const roleTerms = [
    ["transform", input.transform],
    ["evaluate", input.evaluate],
    ["consequence", input.consequence]
  ] as const;
  const nodeBacked = assertMatchingNodeBackedMode(
    roleTerms.map(([, term]) => term),
    "C.edge"
  );
  for (const [role, term] of roleTerms) {
    assertNativeCTerm(term, `C.edge ${role}`);
    if (term.stageRole !== role) {
      throw new TypeError(
        `C.edge ${role} must be one C.of leaf carrying stageRole ${role}`
      );
    }
  }
  if (input.transform.outputCarrierRef !== input.evaluate.inputCarrierRef) {
    throw new TypeError("C.edge transform output does not match evaluate input");
  }
  if (input.evaluate.outputCarrierRef !== input.consequence.inputCarrierRef) {
    throw new TypeError("C.edge evaluate output does not match consequence input");
  }
  const term: NativeCProgramTerm<
    CInputOf<Transform>,
    COutputOf<Consequence>,
    "transform" | "evaluate" | "consequence",
    CombineResultCardinality<
      CombineResultCardinality<
        CResultCardinalityOf<Transform>,
        CResultCardinalityOf<Evaluate>
      >,
      CResultCardinalityOf<Consequence>
    >
  > = {
    kind: "c_edge",
    inputCarrierRef: input.transform.inputCarrierRef,
    outputCarrierRef: input.consequence.outputCarrierRef,
    transform: input.transform,
    evaluate: input.evaluate,
    consequence: input.consequence,
    [C_TERM_TYPE]: cTermWitness<
      CInputOf<Transform>,
      COutputOf<Consequence>,
      "transform" | "evaluate" | "consequence",
      CombineResultCardinality<
        CombineResultCardinality<
          CResultCardinalityOf<Transform>,
          CResultCardinalityOf<Evaluate>
        >,
        CResultCardinalityOf<Consequence>
      >
    >()
  };
  if (!nodeBacked) {
    return freezeOrdinaryCTerm(term);
  }
  const transformAuthority = nodeBackedAuthority(
    input.transform,
    "C.edge transform"
  );
  const evaluateAuthority = nodeBackedAuthority(
    input.evaluate,
    "C.edge evaluate"
  );
  const consequenceAuthority = nodeBackedAuthority(
    input.consequence,
    "C.edge consequence"
  );
  if (
    !sameTypedInterface(
      interfaceIdentityFromCarrier(transformAuthority.output, "C.edge transform output"),
      interfaceIdentityFromCarrier(evaluateAuthority.input, "C.edge evaluate input")
    ) ||
    !sameTypedInterface(
      interfaceIdentityFromCarrier(evaluateAuthority.output, "C.edge evaluate output"),
      interfaceIdentityFromCarrier(consequenceAuthority.input, "C.edge consequence input")
    )
  ) {
    throw new TypeError("C.edge adjacent typed interfaces do not match");
  }
  return freezeNodeBackedCTerm(term, {
    input: transformAuthority.input,
    output: consequenceAuthority.output
  });
}

export function cWorkflow<
  Input,
  Output,
  const InputNodes extends NonEmptyTypedNodeTuple,
  const OutputNodes extends NonEmptyTypedNodeTuple
>(
  graphFunction: NodeBackedCGraphFunctionRef<
    Input,
    Output,
    InputNodes,
    OutputNodes
  >
): NodeBackedCProgramTerm<
  Input,
  Output,
  InputNodes,
  OutputNodes,
  never,
  "unknown"
>;
export function cWorkflow<
  Input,
  Output,
  const InputNodes extends NonEmptyTypedNodeTuple,
  const OutputNodes extends NonEmptyTypedNodeTuple
>(
  graphFunction: NodeBackedCGraphFunctionRef<
    Input,
    Output,
    InputNodes,
    OutputNodes
  >
): SomeNodeBackedCProgramTerm {
  if (
    !Object.hasOwn(graphFunction, C_GRAPH_FUNCTION_REF_TYPE) ||
    !Object.hasOwn(graphFunction, NODE_BACKED_C_REF_AUTHORITY)
  ) {
    throw new TypeError(
      "workflow.C requires a Node-backed ref created by cGraphFunctionRef"
    );
  }
  const authority = graphFunction[NODE_BACKED_C_REF_AUTHORITY];
  assertCInterfaceCarrier(authority.input, "workflow.C input");
  assertCInterfaceCarrier(authority.output, "workflow.C output");
  const term: NativeCProgramTerm<Input, Output, never, "unknown"> = {
    kind: "c_workflow",
    inputCarrierRef: graphFunction.inputCarrierRef,
    outputCarrierRef: graphFunction.outputCarrierRef,
    graphFunctionRef: requireNonEmpty(graphFunction.ref, "workflow.C ref"),
    [C_TERM_TYPE]: cTermWitness<Input, Output, never, "unknown">()
  };
  return freezeNodeBackedCTerm(term, authority);
}

type CompatibleBatchRest<
  First extends SomeCProgramTerm,
  Rest extends readonly SomeCProgramTerm[]
> = {
  readonly [Index in keyof Rest]: Rest[Index] &
    ExactType<CInputOf<First>, CInputOf<Rest[Index]>> &
    ExactType<COutputOf<First>, COutputOf<Rest[Index]>> &
    ExactType<
      CResultCardinalityOf<First>,
      CResultCardinalityOf<Rest[Index]>
    >;
};

type CompatibleNodeBackedBatchRest<
  First extends SomeNodeBackedCProgramTerm,
  Rest extends readonly SomeNodeBackedCProgramTerm[]
> = {
  readonly [Index in keyof Rest]: Rest[Index] &
    ExactType<CInputOf<First>, CInputOf<Rest[Index]>> &
    ExactType<COutputOf<First>, COutputOf<Rest[Index]>> &
    ExactType<CInputNodesOf<First>, CInputNodesOf<Rest[Index]>> &
    ExactType<COutputNodesOf<First>, COutputNodesOf<Rest[Index]>> &
    ExactType<
      CResultCardinalityOf<First>,
      CResultCardinalityOf<Rest[Index]>
    >;
};

type BatchRoles<
  First extends SomeCProgramTerm,
  Rest extends readonly SomeCProgramTerm[]
> = CRolesOf<First> | CRolesOf<Rest[number]>;

export function cBatch<
  First extends SomeNodeBackedCProgramTerm,
  const Rest extends readonly SomeNodeBackedCProgramTerm[]
>(
  tasks: readonly [First, ...Rest] &
    readonly [First, ...CompatibleNodeBackedBatchRest<First, Rest>],
  batchRef: string
): NodeBackedCProgramTerm<
  CInputOf<First>,
  COutputOf<First>,
  CInputNodesOf<First>,
  COutputNodesOf<First>,
  BatchRoles<First, Rest>,
  CResultCardinalityOf<First>
>;
export function cBatch<
  First extends OrdinaryCProgramTerm,
  const Rest extends readonly OrdinaryCProgramTerm[]
>(
  tasks: readonly [First, ...Rest] &
    readonly [First, ...CompatibleBatchRest<First, Rest>],
  batchRef: string
): CProgramTerm<
  CInputOf<First>,
  COutputOf<First>,
  BatchRoles<First, Rest>,
  CResultCardinalityOf<First>
>;
export function cBatch<
  First extends SomeCProgramTerm,
  const Rest extends readonly SomeCProgramTerm[]
>(
  tasks: readonly [First, ...Rest] &
    readonly [First, ...CompatibleBatchRest<First, Rest>],
  batchRef: string
): SomeCProgramTerm {
  if (tasks.length === 0) {
    throw new TypeError("C.batch tasks must be non-empty");
  }
  const nodeBacked = assertMatchingNodeBackedMode(tasks, "C.batch");
  const head = tasks[0];
  for (const [index, task] of tasks.entries()) {
    assertNativeCTerm(task, `C.batch tasks[${index}]`);
    if (
      task.inputCarrierRef !== head.inputCarrierRef ||
      task.outputCarrierRef !== head.outputCarrierRef
    ) {
      throw new TypeError(
        `C.batch tasks[${index}] carrier pair does not match tasks[0]`
      );
    }
  }
  const headCardinality = termResultCardinality(head);
  for (const [index, task] of tasks.entries()) {
    const taskCardinality = termResultCardinality(task);
    if (taskCardinality !== headCardinality) {
      throw new TypeError(
        `C.batch tasks[${index}] result cardinality ${taskCardinality} does not match tasks[0] ${headCardinality}`
      );
    }
  }
  const term: NativeCProgramTerm<
    CInputOf<First>,
    COutputOf<First>,
    BatchRoles<First, Rest>,
    CResultCardinalityOf<First>
  > = {
    kind: "c_batch",
    inputCarrierRef: head.inputCarrierRef,
    outputCarrierRef: head.outputCarrierRef,
    batchRef: requireNonEmpty(batchRef, "C.batch batchRef"),
    tasks: Object.freeze([...tasks]),
    [C_TERM_TYPE]: cTermWitness<
      CInputOf<First>,
      COutputOf<First>,
      BatchRoles<First, Rest>,
      CResultCardinalityOf<First>
    >()
  };
  if (!nodeBacked) {
    return freezeOrdinaryCTerm(term);
  }
  const headAuthority = nodeBackedAuthority(head, "C.batch tasks[0]");
  const inputIdentity = interfaceIdentityFromCarrier(
    headAuthority.input,
    "C.batch tasks[0] input"
  );
  const outputIdentity = interfaceIdentityFromCarrier(
    headAuthority.output,
    "C.batch tasks[0] output"
  );
  for (const [index, task] of tasks.entries()) {
    const authority = nodeBackedAuthority(
      task,
      `C.batch tasks[${String(index)}]`
    );
    if (
      !sameTypedInterface(
        inputIdentity,
        interfaceIdentityFromCarrier(
          authority.input,
          `C.batch tasks[${String(index)}] input`
        )
      ) ||
      !sameTypedInterface(
        outputIdentity,
        interfaceIdentityFromCarrier(
          authority.output,
          `C.batch tasks[${String(index)}] output`
        )
      )
    ) {
      throw new TypeError(
        `C.batch tasks[${String(index)}] typed interfaces do not match tasks[0]`
      );
    }
  }
  return freezeNodeBackedCTerm(term, headAuthority);
}

export function cRetry<Term extends SomeCProgramTerm>(
  term: Term,
  budget: number
): Term extends SomeNodeBackedCProgramTerm
  ? NodeBackedCProgramTerm<
      CInputOf<Term>,
      COutputOf<Term>,
      CInputNodesOf<Term>,
      COutputNodesOf<Term>,
      CRolesOf<Term>,
      CResultCardinalityOf<Term>
    >
  : Term extends OrdinaryCProgramTerm
    ? CProgramTerm<
        CInputOf<Term>,
        COutputOf<Term>,
        CRolesOf<Term>,
        CResultCardinalityOf<Term>
      >
    : never;
export function cRetry<Term extends SomeCProgramTerm>(
  term: Term,
  budget: number
): SomeCProgramTerm {
  assertNativeCTerm(term, "C.retry term");
  if (!Number.isInteger(budget) || budget < 1) {
    throw new TypeError("C.retry budget must be a positive integer");
  }
  const result: NativeCProgramTerm<
    CInputOf<Term>,
    COutputOf<Term>,
    CRolesOf<Term>,
    CResultCardinalityOf<Term>
  > = {
    kind: "c_retry",
    inputCarrierRef: term.inputCarrierRef,
    outputCarrierRef: term.outputCarrierRef,
    budget,
    term,
    [C_TERM_TYPE]: cTermWitness<
      CInputOf<Term>,
      COutputOf<Term>,
      CRolesOf<Term>,
      CResultCardinalityOf<Term>
    >()
  };
  return term.nativeMode === "node_backed"
    ? freezeNodeBackedCTerm(
        result,
        nodeBackedAuthority(term, "C.retry term")
      )
    : freezeOrdinaryCTerm(result);
}

type AdmissibleProgramTerm<Term extends SomeCProgramTerm> =
  CResultCardinalityOf<Term> extends "zero" | "many" ? never : Term;

export function declareCProgram<Term extends SomeCProgramTerm>(input: {
  readonly programRef: string;
  readonly term: AdmissibleProgramTerm<Term>;
  readonly proportionalityClass?: string | null | undefined;
}): CProgramDeclaration<CInputOf<Term>, COutputOf<Term>, Term> &
  AdmittedCProgramDeclarationNode {
  assertNativeCTerm(input.term, "C program term");
  const cardinality = termResultCardinality(input.term);
  if (cardinality === "zero" || cardinality === "many") {
    throw new TypeError(
      `C program term must have one or unresolved result cardinality, received ${cardinality}`
    );
  }
  const proportionalityClass = input.proportionalityClass ?? null;
  if (proportionalityClass !== null) {
    requireNonEmpty(proportionalityClass, "C program proportionalityClass");
  }
  const program: CProgramDeclaration<
    CInputOf<Term>,
    COutputOf<Term>,
    Term
  > & AdmittedCProgramDeclarationNode = {
    kind: "c_program_declaration",
    syntaxVersion: C_ALGEBRA_SYNTAX_VERSION,
    programRef: requireNonEmpty(input.programRef, "C program programRef"),
    term: input.term,
    proportionalityClass,
    [C_PROGRAM_TYPE]: Object.freeze({
      input: (value: CInputOf<Term>): CInputOf<Term> => value,
      output: (value: COutputOf<Term>): COutputOf<Term> => value,
      term: input.term
    }),
    [C_PROGRAM_ADMISSION]: true
  };
  Object.defineProperty(program, C_PROGRAM_TYPE, { enumerable: false });
  return freezeAdmittedCProgram(program);
}

export function bindGraphVectorCProgram<
  Input,
  Output,
  const SourceNodes extends NonEmptyTypedNodeTuple,
  TargetNode extends TypedNode<Output>,
  Roles extends string,
  Cardinality extends CAlgebraResultCardinality
>(input: {
  readonly graphVector: GraphVector;
  readonly source: TypedInterface<Input, SourceNodes> &
    ExactTypedNodeTuple<SourceNodes>;
  readonly target: TypedInterface<Output, readonly [TargetNode]>;
  readonly program: NodeBackedCProgramTerm<
    Input,
    Output,
    SourceNodes,
    readonly [TargetNode],
    Roles,
    Cardinality
  >;
}): NodeBackedCProgramBinding<
  Input,
  Output,
  SourceNodes,
  TargetNode,
  Roles,
  Cardinality
> {
  if (!Object.hasOwn(input.graphVector, GTL_GRAPH_VECTOR_ADMISSION)) {
    throw new TypeError(
      "bindGraphVectorCProgram.graphVector must be constructor-admitted"
    );
  }
  assertTypedInterface(input.source, "bindGraphVectorCProgram.source");
  assertTypedInterface(input.target, "bindGraphVectorCProgram.target");
  if (input.target.cardinality !== 1) {
    throw new TypeError(
      "bindGraphVectorCProgram.target must contain exactly one TypedNode"
    );
  }
  assertNodeBackedCTerm(input.program, "bindGraphVectorCProgram.program");
  if (
    !exactInterfaceNodes(input.graphVector.source, input.source) ||
    !exactInterfaceNodes([input.graphVector.target], input.target)
  ) {
    throw new TypeError(
      "bindGraphVectorCProgram GraphVector Nodes do not match the witnessed source and target"
    );
  }
  const authority = input.program[NODE_BACKED_C_AUTHORITY];
  if (
    !sameTypedInterface(authority.input.interface, input.source) ||
    !sameTypedInterface(authority.output.interface, input.target) ||
    input.program.inputCarrierRef !== input.source.interfaceRef ||
    input.program.outputCarrierRef !== input.target.interfaceRef
  ) {
    throw new TypeError(
      "bindGraphVectorCProgram program interfaces do not match the GraphVector boundary"
    );
  }
  const binding: NodeBackedCProgramBinding<
    Input,
    Output,
    SourceNodes,
    TargetNode,
    Roles,
    Cardinality
  > = {
    kind: "node_backed_c_program_binding",
    graphVector: input.graphVector,
    graphVectorRef: input.graphVector.id,
    source: input.source,
    target: input.target,
    program: input.program,
    [NODE_BACKED_C_BINDING_AUTHORITY]: true
  };
  Object.defineProperty(binding, NODE_BACKED_C_BINDING_AUTHORITY, {
    enumerable: false
  });
  return Object.freeze(binding);
}

export const C = Object.freeze({
  of: cOf,
  id: cIdentity,
  compose: cCompose,
  edge: cEdge,
  batch: cBatch,
  retry: cRetry
});

export const workflow = Object.freeze({ C: cWorkflow });

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isCAlgebraRegime(value: unknown): value is CAlgebraRegime {
  return C_ALGEBRA_REGIME_VALUES.some((candidate) => candidate === value);
}

function hasOnlyKeys(
  record: Readonly<Record<string, unknown>>,
  keys: readonly string[],
  path: string,
  diagnostics: CAlgebraDiagnostic[]
): void {
  for (const key of Object.keys(record)) {
    if (!keys.includes(key)) {
      diagnostics.push(
        diagnostic(
          "gtl-c-unknown-field",
          `${path}.${key}`,
          `unknown field ${JSON.stringify(key)}`,
          ["remove_unknown_field"]
        )
      );
    }
  }
}

function admittedString(
  value: unknown,
  path: string,
  diagnostics: CAlgebraDiagnostic[]
): string | null {
  if (typeof value !== "string" || value.length === 0) {
    diagnostics.push(
      diagnostic(
        "gtl-c-empty-ref",
        path,
        `${path} must be a non-empty string`,
        ["supply_non_empty_ref"]
      )
    );
    return null;
  }
  return value;
}

function admittedCarrierPair(
  record: Readonly<Record<string, unknown>>,
  path: string,
  diagnostics: CAlgebraDiagnostic[]
): { readonly inputCarrierRef: string; readonly outputCarrierRef: string } | null {
  const inputCarrierRef = admittedString(
    record["inputCarrierRef"],
    `${path}.inputCarrierRef`,
    diagnostics
  );
  const outputCarrierRef = admittedString(
    record["outputCarrierRef"],
    `${path}.outputCarrierRef`,
    diagnostics
  );
  return inputCarrierRef === null || outputCarrierRef === null
    ? null
    : Object.freeze({ inputCarrierRef, outputCarrierRef });
}

function admittedInstructionCategoryRefs(
  value: unknown,
  path: string,
  diagnostics: CAlgebraDiagnostic[]
): readonly string[] | undefined {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    !value.every((entry) => typeof entry === "string" && entry.length > 0)
  ) {
    diagnostics.push(
      diagnostic(
        "gtl-c-invalid-syntax",
        path,
        `${path} must be an array of non-empty strings`,
        ["fix_declaration_shape"]
      )
    );
    return undefined;
  }
  const refs: readonly string[] = value;
  return Object.freeze([...refs]);
}

function admitTerm(
  value: unknown,
  path: string,
  diagnostics: CAlgebraDiagnostic[]
): CProgramNode | null {
  if (!isPlainRecord(value) || typeof value["kind"] !== "string") {
    diagnostics.push(
      diagnostic(
        "gtl-c-invalid-syntax",
        path,
        `${path} must be a discriminated C term`,
        ["fix_declaration_shape"]
      )
    );
    return null;
  }
  const record = value;
  const carrierPair = admittedCarrierPair(record, path, diagnostics);
  switch (record["kind"]) {
    case "c_of": {
      hasOnlyKeys(
        record,
        [
          "kind",
          "inputCarrierRef",
          "outputCarrierRef",
          "stageRole",
          "fibre",
          "armId",
          "resultBearing",
          "instructionCategoryRefs"
        ],
        path,
        diagnostics
      );
      const stageRole = admittedString(
        record["stageRole"],
        `${path}.stageRole`,
        diagnostics
      );
      const armId = admittedString(
        record["armId"],
        `${path}.armId`,
        diagnostics
      );
      const fibre = record["fibre"];
      if (!isCAlgebraRegime(fibre)) {
        diagnostics.push(
          diagnostic(
            "gtl-c-invalid-regime",
            `${path}.fibre`,
            `${path}.fibre must be one of ${JSON.stringify(C_ALGEBRA_REGIME_VALUES)}`,
            ["select_declared_regime"]
          )
        );
      }
      const resultBearing = record["resultBearing"];
      if (typeof resultBearing !== "boolean") {
        diagnostics.push(
          diagnostic(
            "gtl-c-invalid-syntax",
            `${path}.resultBearing`,
            `${path}.resultBearing must be a boolean`,
            ["fix_declaration_shape"]
          )
        );
      }
      const instructionCategoryRefs = admittedInstructionCategoryRefs(
        record["instructionCategoryRefs"],
        `${path}.instructionCategoryRefs`,
        diagnostics
      );
      if (
        carrierPair === null ||
        stageRole === null ||
        armId === null ||
        typeof resultBearing !== "boolean" ||
        !isCAlgebraRegime(fibre)
      ) {
        return null;
      }
      return Object.freeze({
        kind: "c_of" as const,
        ...carrierPair,
        stageRole,
        fibre,
        armId,
        resultBearing,
        ...(instructionCategoryRefs === undefined
          ? {}
          : { instructionCategoryRefs })
      });
    }
    case "c_identity": {
      hasOnlyKeys(
        record,
        ["kind", "inputCarrierRef", "outputCarrierRef"],
        path,
        diagnostics
      );
      if (
        carrierPair !== null &&
        carrierPair.inputCarrierRef !== carrierPair.outputCarrierRef
      ) {
        diagnostics.push(
          diagnostic(
            "gtl-c-carrier-mismatch",
            path,
            "C.id input and output carrier refs must match",
            ["bind_matching_carrier"]
          )
        );
        return null;
      }
      return carrierPair === null
        ? null
        : Object.freeze({ kind: "c_identity" as const, ...carrierPair });
    }
    case "c_compose": {
      hasOnlyKeys(
        record,
        ["kind", "inputCarrierRef", "outputCarrierRef", "left", "right"],
        path,
        diagnostics
      );
      const left = admitTerm(record["left"], `${path}.left`, diagnostics);
      const right = admitTerm(record["right"], `${path}.right`, diagnostics);
      if (
        carrierPair === null ||
        left === null ||
        right === null
      ) {
        return null;
      }
      if (
        left.outputCarrierRef !== right.inputCarrierRef ||
        carrierPair.inputCarrierRef !== left.inputCarrierRef ||
        carrierPair.outputCarrierRef !== right.outputCarrierRef
      ) {
        diagnostics.push(
          diagnostic(
            "gtl-c-carrier-mismatch",
            path,
            "C.compose carrier refs do not form one continuous typed chain",
            ["bind_matching_carrier"]
          )
        );
        return null;
      }
      return Object.freeze({
        kind: "c_compose" as const,
        ...carrierPair,
        left,
        right
      });
    }
    case "c_edge": {
      hasOnlyKeys(
        record,
        [
          "kind",
          "inputCarrierRef",
          "outputCarrierRef",
          "transform",
          "evaluate",
          "consequence"
        ],
        path,
        diagnostics
      );
      const transform = admitTerm(
        record["transform"],
        `${path}.transform`,
        diagnostics
      );
      const evaluate = admitTerm(
        record["evaluate"],
        `${path}.evaluate`,
        diagnostics
      );
      const consequence = admitTerm(
        record["consequence"],
        `${path}.consequence`,
        diagnostics
      );
      if (
        carrierPair === null ||
        transform === null ||
        evaluate === null ||
        consequence === null
      ) {
        return null;
      }
      const edgeTerms = [
        ["transform", transform],
        ["evaluate", evaluate],
        ["consequence", consequence]
      ] as const;
      for (const [role, term] of edgeTerms) {
        if (term.kind !== "c_of" || term.stageRole !== role) {
          diagnostics.push(
            diagnostic(
              "gtl-c-edge-role-mismatch",
              `${path}.${role}`,
              `C.edge ${role} must be one C.of leaf carrying stageRole ${role}`,
              ["bind_canonical_edge_role"]
            )
          );
        }
      }
      if (
        transform.outputCarrierRef !== evaluate.inputCarrierRef ||
        evaluate.outputCarrierRef !== consequence.inputCarrierRef ||
        carrierPair.inputCarrierRef !== transform.inputCarrierRef ||
        carrierPair.outputCarrierRef !== consequence.outputCarrierRef
      ) {
        diagnostics.push(
          diagnostic(
            "gtl-c-carrier-mismatch",
            path,
            "C.edge carriers do not form transform >=> evaluate >=> consequence",
            ["bind_matching_carrier"]
          )
        );
        return null;
      }
      return Object.freeze({
        kind: "c_edge" as const,
        ...carrierPair,
        transform,
        evaluate,
        consequence
      });
    }
    case "c_workflow": {
      hasOnlyKeys(
        record,
        ["kind", "inputCarrierRef", "outputCarrierRef", "graphFunctionRef"],
        path,
        diagnostics
      );
      const graphFunctionRef = admittedString(
        record["graphFunctionRef"],
        `${path}.graphFunctionRef`,
        diagnostics
      );
      return carrierPair === null || graphFunctionRef === null
        ? null
        : Object.freeze({
            kind: "c_workflow" as const,
            ...carrierPair,
            graphFunctionRef
          });
    }
    case "c_batch": {
      hasOnlyKeys(
        record,
        ["kind", "inputCarrierRef", "outputCarrierRef", "batchRef", "tasks"],
        path,
        diagnostics
      );
      const batchRef = admittedString(
        record["batchRef"],
        `${path}.batchRef`,
        diagnostics
      );
      if (!Array.isArray(record["tasks"]) || record["tasks"].length === 0) {
        diagnostics.push(
          diagnostic(
            "gtl-c-empty-batch",
            `${path}.tasks`,
            "C.batch tasks must be a non-empty array",
            ["supply_non_empty_batch"]
          )
        );
        return null;
      }
      const taskValues: readonly unknown[] = record["tasks"];
      const tasks = taskValues.map((task, index) =>
        admitTerm(task, `${path}.tasks[${index}]`, diagnostics)
      );
      if (
        carrierPair === null ||
        batchRef === null ||
        tasks.some((task) => task === null)
      ) {
        return null;
      }
      const admittedTasks = tasks.filter(
        (task): task is CProgramNode => task !== null
      );
      if (
        admittedTasks.some(
          (task) =>
            task.inputCarrierRef !== carrierPair.inputCarrierRef ||
            task.outputCarrierRef !== carrierPair.outputCarrierRef
        )
      ) {
        diagnostics.push(
          diagnostic(
            "gtl-c-carrier-mismatch",
            path,
            "every C.batch task must share the batch input/output carrier pair",
            ["bind_matching_carrier"]
          )
        );
        return null;
      }
      const taskCardinalities = admittedTasks.map(termResultCardinality);
      if (
        taskCardinalities.some(
          (cardinality) => cardinality !== taskCardinalities[0]
        )
      ) {
        diagnostics.push(
          diagnostic(
            "gtl-c-batch-cardinality-mismatch",
            path,
            "every C.batch task must preserve the same result cardinality",
            ["bind_matching_result_cardinality"]
          )
        );
        return null;
      }
      return Object.freeze({
        kind: "c_batch" as const,
        ...carrierPair,
        batchRef,
        tasks: Object.freeze(admittedTasks)
      });
    }
    case "c_retry": {
      hasOnlyKeys(
        record,
        ["kind", "inputCarrierRef", "outputCarrierRef", "budget", "term"],
        path,
        diagnostics
      );
      const budget = record["budget"];
      if (typeof budget !== "number" || !Number.isInteger(budget) || budget < 1) {
        diagnostics.push(
          diagnostic(
            "gtl-c-invalid-retry-budget",
            `${path}.budget`,
            "C.retry budget must be a positive integer",
            ["supply_positive_retry_budget"]
          )
        );
      }
      const term = admitTerm(record["term"], `${path}.term`, diagnostics);
      if (
        carrierPair === null ||
        term === null ||
        typeof budget !== "number" ||
        !Number.isInteger(budget) ||
        budget < 1
      ) {
        return null;
      }
      if (
        carrierPair.inputCarrierRef !== term.inputCarrierRef ||
        carrierPair.outputCarrierRef !== term.outputCarrierRef
      ) {
        diagnostics.push(
          diagnostic(
            "gtl-c-carrier-mismatch",
            path,
            "C.retry must preserve the wrapped term carrier pair",
            ["bind_matching_carrier"]
          )
        );
        return null;
      }
      return Object.freeze({
        kind: "c_retry" as const,
        ...carrierPair,
        budget,
        term
      });
    }
    default:
      diagnostics.push(
        diagnostic(
          "gtl-c-invalid-syntax",
          `${path}.kind`,
          `unknown C term kind ${JSON.stringify(record["kind"])}`,
          ["fix_declaration_shape"]
        )
      );
      return null;
  }
}

function combineCardinality(
  left: CAlgebraResultCardinality,
  right: CAlgebraResultCardinality
): CAlgebraResultCardinality {
  if (left === "unknown" || right === "unknown") return "unknown";
  if (left === "many" || right === "many") return "many";
  if (left === "zero") return right;
  if (right === "zero") return left;
  return "many";
}

function termResultCardinality(
  term: CProgramNode
): CAlgebraResultCardinality {
  switch (term.kind) {
    case "c_of":
      return term.resultBearing ? "one" : "zero";
    case "c_identity":
      return "zero";
    case "c_compose":
      return combineCardinality(
        termResultCardinality(term.left),
        termResultCardinality(term.right)
      );
    case "c_edge":
      return combineCardinality(
        combineCardinality(
          termResultCardinality(term.transform),
          termResultCardinality(term.evaluate)
        ),
        termResultCardinality(term.consequence)
      );
    case "c_workflow":
      return "unknown";
    case "c_batch":
      return term.tasks[0] === undefined
        ? "zero"
        : termResultCardinality(term.tasks[0]);
    case "c_retry":
      return termResultCardinality(term.term);
  }
}

export function admitCProgramSyntax(input: unknown): CProgramAdmission {
  let raw = input;
  if (typeof input === "string") {
    try {
      const parsed: unknown = JSON.parse(input);
      raw = parsed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Object.freeze({
        accepted: false,
        program: null,
        diagnostics: Object.freeze([
          diagnostic(
            "gtl-c-invalid-json",
            "$",
            `C program JSON is invalid: ${message}`,
            ["fix_declaration_shape"]
          )
        ])
      });
    }
  }
  const diagnostics: CAlgebraDiagnostic[] = [];
  if (!isPlainRecord(raw)) {
    return Object.freeze({
      accepted: false,
      program: null,
      diagnostics: Object.freeze([
        diagnostic(
          "gtl-c-invalid-syntax",
          "$",
          "C program declaration must be an object",
          ["fix_declaration_shape"]
        )
      ])
    });
  }
  hasOnlyKeys(
    raw,
    ["kind", "syntaxVersion", "programRef", "term", "proportionalityClass"],
    "$",
    diagnostics
  );
  if (raw["kind"] !== "c_program_declaration") {
    diagnostics.push(
      diagnostic(
        "gtl-c-invalid-syntax",
        "$.kind",
        "kind must be c_program_declaration",
        ["fix_declaration_shape"]
      )
    );
  }
  if (raw["syntaxVersion"] !== C_ALGEBRA_SYNTAX_VERSION) {
    diagnostics.push(
      diagnostic(
        "gtl-c-invalid-syntax",
        "$.syntaxVersion",
        `syntaxVersion must be ${C_ALGEBRA_SYNTAX_VERSION}`,
        ["fix_declaration_shape"]
      )
    );
  }
  const programRef = admittedString(raw["programRef"], "$.programRef", diagnostics);
  const term = admitTerm(raw["term"], "$.term", diagnostics);
  if (term !== null) {
    const cardinality = termResultCardinality(term);
    if (cardinality === "zero") {
      diagnostics.push(
        diagnostic(
          "gtl-c-empty-executable-program",
          "$.term",
          "the C program contains no result-bearing executable term",
          ["declare_executable_leaf"]
        )
      );
    } else if (cardinality === "many") {
      diagnostics.push(
        diagnostic(
          "gtl-c-multiple-result-bearing-stages",
          "$.term",
          "the C program contains more than one result-bearing term",
          ["declare_exactly_one_result_stage"]
        )
      );
    }
  }
  const proportionalityClass = raw["proportionalityClass"];
  if (
    proportionalityClass !== null &&
    (typeof proportionalityClass !== "string" || proportionalityClass.length === 0)
  ) {
    diagnostics.push(
      diagnostic(
        "gtl-c-invalid-syntax",
        "$.proportionalityClass",
        "proportionalityClass must be null or a non-empty string",
        ["fix_declaration_shape"]
      )
    );
  }
  if (
    diagnostics.length > 0 ||
    programRef === null ||
    term === null ||
    (proportionalityClass !== null && typeof proportionalityClass !== "string")
  ) {
    return Object.freeze({
      accepted: false,
      program: null,
      diagnostics: Object.freeze(diagnostics)
    });
  }
  const admittedProgram: AdmittedCProgramDeclarationNode = {
    kind: "c_program_declaration",
    syntaxVersion: C_ALGEBRA_SYNTAX_VERSION,
    programRef,
    term,
    proportionalityClass,
    [C_PROGRAM_ADMISSION]: true
  };
  const program = freezeAdmittedCProgram(admittedProgram);
  return Object.freeze({
    accepted: true,
    program,
    diagnostics: Object.freeze([])
  });
}

type CanonicalJson =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalJson[]
  | Readonly<{ [key: string]: CanonicalJson }>;

function canonicalize(value: unknown): CanonicalJson {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => canonicalize(entry)));
  }
  if (!isPlainRecord(value)) {
    throw new TypeError("C program canonical serialization accepts data only");
  }
  const result: { [key: string]: CanonicalJson } = {};
  for (const key of Object.keys(value).sort()) {
    const entry = value[key];
    if (entry !== undefined) {
      result[key] = canonicalize(entry);
    }
  }
  return Object.freeze(result);
}

export function serializeCProgramCanonical(
  program: CProgramDeclarationNode
): string {
  return JSON.stringify(canonicalize(program));
}
