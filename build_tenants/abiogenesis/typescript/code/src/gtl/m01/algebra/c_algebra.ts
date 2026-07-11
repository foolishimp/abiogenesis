// Implements the native TypeScript binding for the ratified M01 C algebra in
// ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN section 10. The values produced here
// are authored GTL data. ABG owns admission into executable runtime truth.

import {
  isAdmittedGraphFunction,
  type GraphFunction
} from "../contracts/carriers.js";

export const C_ALGEBRA_SYNTAX_VERSION = "gtl-c-algebra/1" as const;

export const C_ALGEBRA_REGIME_VALUES = Object.freeze([
  "F_D",
  "F_P",
  "F_H"
] as const);

export type CAlgebraRegime = (typeof C_ALGEBRA_REGIME_VALUES)[number];

export type CAlgebraResultCardinality = "zero" | "one" | "many" | "unknown";

export type CAlgebraDiagnosticId =
  | "gtl-c-invalid-json"
  | "gtl-c-invalid-syntax"
  | "gtl-c-unknown-field"
  | "gtl-c-empty-ref"
  | "gtl-c-invalid-regime"
  | "gtl-c-carrier-mismatch"
  | "gtl-c-edge-role-mismatch"
  | "gtl-c-empty-batch"
  | "gtl-c-batch-cardinality-mismatch"
  | "gtl-c-invalid-retry-budget"
  | "gtl-c-empty-executable-program"
  | "gtl-c-no-result-bearing-stage"
  | "gtl-c-multiple-result-bearing-stages"
  | "gtl-c-duplicate-stage-role"
  | "gtl-c-unrealized-workflow-lift"
  | "gtl-c-unrealized-batch"
  | "gtl-c-unrealized-retry"
  | "gtl-c-hog-admission-failed";

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

export interface CCarrier<Type> {
  readonly kind: "c_carrier";
  readonly ref: string;
  readonly [C_CARRIER_TYPE]: (value: Type) => Type;
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

export type CProgramTerm<
  Input,
  Output,
  Roles extends string = string,
  Cardinality extends CAlgebraResultCardinality = CAlgebraResultCardinality
> = CProgramNode & {
  readonly [C_TERM_TYPE]: CTermWitness<Input, Output, Roles, Cardinality>;
};

export type COfTerm<
  Input,
  Output,
  Role extends string,
  Fibre extends CAlgebraRegime,
  Cardinality extends "zero" | "one"
> = COfNode & CProgramTerm<Input, Output, Role, Cardinality> & {
  readonly fibre: Fibre;
};

type SomeCProgramTerm = CProgramNode & {
  readonly [C_TERM_TYPE]: object;
};

type SomeCOfTerm = COfNode & SomeCProgramTerm;

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

function assertNativeCTerm(value: object, label: string): void {
  if (!Object.hasOwn(value, C_TERM_TYPE)) {
    throw new TypeError(`${label} must be created by a C constructor`);
  }
}

function freezeNativeCTerm<Term extends SomeCProgramTerm>(term: Term): Term {
  Object.defineProperty(term, C_TERM_TYPE, { enumerable: false });
  return Object.freeze(term);
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

export function cGraphFunctionRef<Input, Output>(input: {
  readonly graphFunction: GraphFunction;
  readonly input: CCarrier<Input>;
  readonly output: CCarrier<Output>;
}): CGraphFunctionRef<Input, Output> {
  if (!isAdmittedGraphFunction(input.graphFunction)) {
    throw new TypeError(
      "C graph-function ref requires a constructor-admitted GraphFunction"
    );
  }
  assertNativeCCarrier(input.input, "C graph-function ref input");
  assertNativeCCarrier(input.output, "C graph-function ref output");
  const reference: CGraphFunctionRef<Input, Output> = {
    kind: "c_graph_function_ref",
    ref: input.graphFunction.id,
    inputCarrierRef: input.input.ref,
    outputCarrierRef: input.output.ref,
    [C_GRAPH_FUNCTION_REF_TYPE]: Object.freeze({
      input: (value: Input): Input => value,
      output: (value: Output): Output => value
    })
  };
  Object.defineProperty(reference, C_GRAPH_FUNCTION_REF_TYPE, {
    enumerable: false
  });
  return Object.freeze(reference);
}

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
> {
  assertNativeCCarrier(input.input, "C.of input");
  assertNativeCCarrier(input.output, "C.of output");
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
  const term: COfTerm<
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
  return freezeNativeCTerm(term);
}

export function cIdentity<Type>(
  carrier: CCarrier<Type>
): CProgramTerm<Type, Type, never, "zero"> {
  assertNativeCCarrier(carrier, "C.id carrier");
  const term: CProgramTerm<Type, Type, never, "zero"> = {
    kind: "c_identity",
    inputCarrierRef: carrier.ref,
    outputCarrierRef: carrier.ref,
    [C_TERM_TYPE]: cTermWitness<Type, Type, never, "zero">()
  };
  return freezeNativeCTerm(term);
}

export function cCompose<
  Left extends SomeCProgramTerm,
  Right extends SomeCProgramTerm
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
> {
  assertNativeCTerm(left, "C.compose left");
  assertNativeCTerm(right, "C.compose right");
  if (left.outputCarrierRef !== right.inputCarrierRef) {
    throw new TypeError(
      `C.compose carrier mismatch: ${left.outputCarrierRef} != ${right.inputCarrierRef}`
    );
  }
  const term: CProgramTerm<
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
  return freezeNativeCTerm(term);
}

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
> {
  const roleTerms = [
    ["transform", input.transform],
    ["evaluate", input.evaluate],
    ["consequence", input.consequence]
  ] as const;
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
  const term: CProgramTerm<
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
  return freezeNativeCTerm(term);
}

export function cWorkflow<Input, Output>(
  graphFunction: CGraphFunctionRef<Input, Output>
): CProgramTerm<Input, Output, never, "unknown"> {
  if (!Object.hasOwn(graphFunction, C_GRAPH_FUNCTION_REF_TYPE)) {
    throw new TypeError(
      "workflow.C requires a ref created by cGraphFunctionRef"
    );
  }
  const term: CProgramTerm<Input, Output, never, "unknown"> = {
    kind: "c_workflow",
    inputCarrierRef: graphFunction.inputCarrierRef,
    outputCarrierRef: graphFunction.outputCarrierRef,
    graphFunctionRef: requireNonEmpty(graphFunction.ref, "workflow.C ref"),
    [C_TERM_TYPE]: cTermWitness<Input, Output, never, "unknown">()
  };
  return freezeNativeCTerm(term);
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

type BatchRoles<
  First extends SomeCProgramTerm,
  Rest extends readonly SomeCProgramTerm[]
> = CRolesOf<First> | CRolesOf<Rest[number]>;

export function cBatch<
  First extends SomeCProgramTerm,
  const Rest extends readonly SomeCProgramTerm[]
>(
  tasks: readonly [First, ...Rest] &
    readonly [First, ...CompatibleBatchRest<First, Rest>],
  batchRef: string
): CProgramTerm<
  CInputOf<First>,
  COutputOf<First>,
  BatchRoles<First, Rest>,
  CResultCardinalityOf<First>
> {
  if (tasks.length === 0) {
    throw new TypeError("C.batch tasks must be non-empty");
  }
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
  const term: CProgramTerm<
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
  return freezeNativeCTerm(term);
}

export function cRetry<Term extends SomeCProgramTerm>(
  term: Term,
  budget: number
): CProgramTerm<
  CInputOf<Term>,
  COutputOf<Term>,
  CRolesOf<Term>,
  CResultCardinalityOf<Term>
> {
  assertNativeCTerm(term, "C.retry term");
  if (!Number.isInteger(budget) || budget < 1) {
    throw new TypeError("C.retry budget must be a positive integer");
  }
  const result: CProgramTerm<
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
  return freezeNativeCTerm(result);
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
