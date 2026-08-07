import { deepFreeze } from "../shared/immutable.js";
import { requireRef } from "../shared/references.js";

export const COMPUTE_REGIME_VALUES = ["F_D", "F_P", "F_H"] as const;
export type ComputeRegime = (typeof COMPUTE_REGIME_VALUES)[number];

export const C_TERM_KIND_VALUES = [
  "c_of",
  "c_identity",
  "c_compose",
  "c_edge",
  "c_workflow",
  "c_batch",
  "c_retry",
] as const;

export type CTermKind = (typeof C_TERM_KIND_VALUES)[number];
export type CResultCardinality = "zero" | "one" | "many";

export interface ExecutableLeafRequirement {
  readonly kind: "executable_leaf_requirement";
  readonly implementationBindingRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly evidenceContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly judgmentContractRef: string;
}

export interface InteractionLeafRequirement {
  readonly kind: "interaction_leaf_requirement";
  readonly interactionKind: string;
  readonly actorCapabilityRef: string;
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly continuationContractRef: string;
}

export type CLeafRequirement =
  | ExecutableLeafRequirement
  | InteractionLeafRequirement;

export interface COfNode {
  readonly kind: "c_of";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly programLocusRef: string;
  readonly stageRole: string;
  readonly fibre: ComputeRegime;
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly vectorIndex: number;
  readonly judgmentPredicateRef: string;
  readonly resultBearing: boolean;
  readonly requirement: CLeafRequirement;
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
  readonly terms: readonly CProgramNode[];
}

export interface CEdgeNode {
  readonly kind: "c_edge";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly transform: COfNode;
  readonly evaluate: COfNode;
  readonly consequence: COfNode;
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
  readonly taskInputCarrierRef: string;
  readonly taskOutputCarrierRef: string;
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

const C_CARRIER_TYPE: unique symbol = Symbol("abiogenesis.gtl.c.carrier");
const C_TERM_TYPE: unique symbol = Symbol("abiogenesis.gtl.c.term");

export interface CCarrier<Value> {
  readonly kind: "c_carrier";
  readonly ref: string;
  readonly [C_CARRIER_TYPE]: (value: Value) => Value;
}

interface CTermWitness<Input, Output, Role extends string, Cardinality> {
  readonly input: Input;
  readonly output: Output;
  readonly role: Role;
  readonly cardinality: Cardinality;
}

export type CProgramTerm<
  Input,
  Output,
  Role extends string = string,
  Cardinality extends CResultCardinality = CResultCardinality,
> = CProgramNode & {
  readonly [C_TERM_TYPE]: CTermWitness<Input, Output, Role, Cardinality>;
};

export type COfTerm<
  Input,
  Output,
  Role extends string,
  Fibre extends ComputeRegime,
  Cardinality extends "zero" | "one",
> = COfNode &
  CProgramTerm<Input, Output, Role, Cardinality> & {
    readonly fibre: Fibre;
  };

export interface CGraphFunctionRef<Input, Output> {
  readonly kind: "c_graph_function_ref";
  readonly graphFunctionRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly input: CCarrier<Input>;
  readonly output: CCarrier<Output>;
}

type SomeTerm = CProgramTerm<unknown, unknown, string, CResultCardinality>;

type CInputOf<Term> = Term extends CProgramTerm<infer Input, unknown, string, CResultCardinality>
  ? Input
  : never;

type COutputOf<Term> = Term extends CProgramTerm<unknown, infer Output, string, CResultCardinality>
  ? Output
  : never;

type CRoleOf<Term> = Term extends CProgramTerm<unknown, unknown, infer Role, CResultCardinality>
  ? Role
  : never;

type CCardinalityOf<Term> = Term extends CProgramTerm<unknown, unknown, string, infer Cardinality>
  ? Cardinality
  : never;

type ExecutableLeafInput = {
  readonly fibre: "F_D" | "F_P";
  readonly requirement: ExecutableLeafRequirement;
};

type InteractionLeafInput = {
  readonly fibre: "F_H";
  readonly requirement: InteractionLeafRequirement;
};

type CLeafInput<
  Input,
  Output,
  Role extends string,
  ResultBearing extends boolean,
> = {
  readonly input: CCarrier<Input>;
  readonly output: CCarrier<Output>;
  readonly programLocusRef: string;
  readonly stageRole: Role;
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly vectorIndex: number;
  readonly judgmentPredicateRef: string;
  readonly resultBearing: ResultBearing;
} & (ExecutableLeafInput | InteractionLeafInput);

const nativeTerms = new WeakSet<object>();

function assertCarrier(value: object, label: string): void {
  if (!Object.hasOwn(value, C_CARRIER_TYPE)) {
    throw new TypeError(`${label} must be created by cCarrier`);
  }
}

function assertTerm(value: object, label: string): asserts value is SomeTerm {
  if (!nativeTerms.has(value)) {
    throw new TypeError(`${label} must be created by a C constructor`);
  }
}

function witness<Input, Output, Role extends string, Cardinality>(): CTermWitness<
  Input,
  Output,
  Role,
  Cardinality
> {
  return Object.freeze({}) as CTermWitness<Input, Output, Role, Cardinality>;
}

function freezeTerm<Term extends CProgramNode, Input, Output, Role extends string, Cardinality extends CResultCardinality>(
  term: Term,
  _termWitness: CTermWitness<Input, Output, Role, Cardinality>,
): Readonly<Term> & CProgramTerm<Input, Output, Role, Cardinality> {
  const frozen = deepFreeze(term) as Readonly<Term> & CProgramTerm<Input, Output, Role, Cardinality>;
  nativeTerms.add(frozen);
  return frozen;
}

// Admission calls this only after the complete C carrier has passed the exact
// structural parser. The witness therefore records the same authority as a
// native constructor without making serialized carrier provenance authoritative.
export function witnessAdmittedCProgramTerm(
  term: Readonly<CProgramNode>,
): Readonly<CProgramNode> {
  const clone: CProgramNode = (() => {
    switch (term.kind) {
      case "c_of":
        return {
          ...term,
          requirement: { ...term.requirement },
        };
      case "c_identity":
        return { ...term };
      case "c_compose":
        return {
          ...term,
          terms: term.terms.map(witnessAdmittedCProgramTerm),
        };
      case "c_edge":
        return {
          ...term,
          transform: witnessAdmittedCProgramTerm(term.transform) as Readonly<COfNode>,
          evaluate: witnessAdmittedCProgramTerm(term.evaluate) as Readonly<COfNode>,
          consequence: witnessAdmittedCProgramTerm(term.consequence) as Readonly<COfNode>,
        };
      case "c_workflow":
        return { ...term };
      case "c_batch":
        return {
          ...term,
          tasks: term.tasks.map(witnessAdmittedCProgramTerm),
        };
      case "c_retry":
        return {
          ...term,
          term: witnessAdmittedCProgramTerm(term.term),
        };
    }
  })();
  return freezeTerm(
    clone,
    witness<unknown, unknown, string, CResultCardinality>(),
  );
}

function combineCardinality(
  left: CResultCardinality,
  right: CResultCardinality,
): CResultCardinality {
  if (left === "many" || right === "many") return "many";
  if (left === "zero") return right;
  if (right === "zero") return left;
  return "many";
}

export function cTermResultCardinality(term: CProgramNode): CResultCardinality {
  switch (term.kind) {
    case "c_of":
      return term.resultBearing ? "one" : "zero";
    case "c_identity":
      return "zero";
    case "c_compose":
      return term.terms.reduce<CResultCardinality>(
        (cardinality, child) => combineCardinality(cardinality, cTermResultCardinality(child)),
        "zero",
      );
    case "c_edge":
      return [term.transform, term.evaluate, term.consequence].reduce<CResultCardinality>(
        (cardinality, child) => combineCardinality(cardinality, cTermResultCardinality(child)),
        "zero",
      );
    case "c_workflow":
      return "one";
    case "c_batch":
      if (
        term.inputCarrierRef !== term.taskInputCarrierRef ||
        term.outputCarrierRef !== term.taskOutputCarrierRef
      ) {
        return "zero";
      }
      return term.tasks[0] === undefined ? "zero" : cTermResultCardinality(term.tasks[0]);
    case "c_retry":
      return cTermResultCardinality(term.term);
  }
}

export function cLeafTerms(term: CProgramNode): readonly COfNode[] {
  switch (term.kind) {
    case "c_of":
      return [term];
    case "c_identity":
    case "c_workflow":
      return [];
    case "c_compose":
      return term.terms.flatMap((child) => cLeafTerms(child));
    case "c_edge":
      return [term.transform, term.evaluate, term.consequence];
    case "c_batch":
      return term.tasks.flatMap((child) => cLeafTerms(child));
    case "c_retry":
      return cLeafTerms(term.term);
  }
}

export function isExecutableCLeaf(term: CProgramNode): term is COfNode & {
  readonly fibre: "F_D" | "F_P";
  readonly requirement: ExecutableLeafRequirement;
} {
  return term.kind === "c_of" &&
    term.fibre !== "F_H" &&
    term.requirement.kind === "executable_leaf_requirement";
}

export function isInteractionCLeaf(term: CProgramNode): term is COfNode & {
  readonly fibre: "F_H";
  readonly requirement: InteractionLeafRequirement;
} {
  return term.kind === "c_of" &&
    term.fibre === "F_H" &&
    term.requirement.kind === "interaction_leaf_requirement";
}

export function isNativeCProgramTerm(term: object): boolean {
  return nativeTerms.has(term);
}

export function cCarrier<Value>(ref: string): Readonly<CCarrier<Value>> {
  const carrier: CCarrier<Value> = {
    kind: "c_carrier",
    ref: requireRef(ref, "C carrier ref"),
    [C_CARRIER_TYPE]: (value: Value): Value => value,
  };
  Object.defineProperty(carrier, C_CARRIER_TYPE, { enumerable: false });
  return Object.freeze(carrier);
}

export function cGraphFunctionRef<Input, Output>(input: {
  readonly graphFunctionRef: string;
  readonly input: CCarrier<Input>;
  readonly output: CCarrier<Output>;
}): Readonly<CGraphFunctionRef<Input, Output>> {
  assertCarrier(input.input, "GraphFunction input carrier");
  assertCarrier(input.output, "GraphFunction output carrier");
  return Object.freeze({
    kind: "c_graph_function_ref" as const,
    graphFunctionRef: requireRef(input.graphFunctionRef, "GraphFunction ref"),
    inputCarrierRef: input.input.ref,
    outputCarrierRef: input.output.ref,
    input: input.input,
    output: input.output,
  });
}

export function cOf<
  Input,
  Output,
  const Role extends string,
  const ResultBearing extends boolean,
>(input: CLeafInput<Input, Output, Role, ResultBearing>): COfTerm<
  Input,
  Output,
  Role,
  typeof input.fibre,
  ResultBearing extends true ? "one" : "zero"
> {
  assertCarrier(input.input, "C.of input");
  assertCarrier(input.output, "C.of output");
  if (!COMPUTE_REGIME_VALUES.includes(input.fibre)) {
    throw new TypeError(`C.of fibre must be one of ${COMPUTE_REGIME_VALUES.join(", ")}`);
  }
  if (
    (input.fibre === "F_H" && input.requirement.kind !== "interaction_leaf_requirement") ||
    (input.fibre !== "F_H" && input.requirement.kind !== "executable_leaf_requirement")
  ) {
    throw new TypeError("C.of requirement kind must match its compute regime");
  }
  if (!Number.isSafeInteger(input.vectorIndex) || input.vectorIndex < 0) {
    throw new TypeError("C.of vectorIndex must be a non-negative safe integer");
  }
  const node: COfNode = {
    kind: "c_of",
    inputCarrierRef: input.input.ref,
    outputCarrierRef: input.output.ref,
    programLocusRef: requireRef(input.programLocusRef, "C.of programLocusRef"),
    stageRole: requireRef(input.stageRole, "C.of stageRole"),
    fibre: input.fibre,
    armId: requireRef(input.armId, "C.of armId"),
    compositionRef: input.compositionRef === null
      ? null
      : requireRef(input.compositionRef, "C.of compositionRef"),
    vectorIndex: input.vectorIndex,
    judgmentPredicateRef: requireRef(input.judgmentPredicateRef, "C.of judgmentPredicateRef"),
    resultBearing: input.resultBearing,
    requirement: input.requirement,
  };
  return freezeTerm(
    node,
    witness<Input, Output, Role, ResultBearing extends true ? "one" : "zero">(),
  ) as COfTerm<
    Input,
    Output,
    Role,
    typeof input.fibre,
    ResultBearing extends true ? "one" : "zero"
  >;
}

export function cIdentity<Value>(
  carrier: CCarrier<Value>,
): CProgramTerm<Value, Value, never, "zero"> {
  assertCarrier(carrier, "C.id carrier");
  return freezeTerm(
    {
      kind: "c_identity",
      inputCarrierRef: carrier.ref,
      outputCarrierRef: carrier.ref,
    },
    witness<Value, Value, never, "zero">(),
  );
}

function flattenedComposition(term: CProgramNode): readonly CProgramNode[] {
  if (term.kind === "c_identity") return [];
  if (term.kind === "c_compose") return term.terms;
  return [term];
}

export function cCompose<Input, Middle, Output>(
  left: CProgramTerm<Input, Middle>,
  right: CProgramTerm<Middle, Output>,
): CProgramTerm<Input, Output> {
  assertTerm(left, "C.compose left");
  assertTerm(right, "C.compose right");
  if (left.outputCarrierRef !== right.inputCarrierRef) {
    throw new TypeError(
      `C.compose carrier mismatch: ${left.outputCarrierRef} != ${right.inputCarrierRef}`,
    );
  }
  const terms = [...flattenedComposition(left), ...flattenedComposition(right)];
  if (terms.length === 0) {
    return cIdentity(cCarrier<Input>(left.inputCarrierRef)) as unknown as CProgramTerm<
      Input,
      Output
    >;
  }
  if (terms.length === 1) {
    return terms[0] as CProgramTerm<Input, Output>;
  }
  return freezeTerm(
    {
      kind: "c_compose",
      inputCarrierRef: left.inputCarrierRef,
      outputCarrierRef: right.outputCarrierRef,
      terms,
    },
    witness<Input, Output, CRoleOf<typeof left> | CRoleOf<typeof right>, CResultCardinality>(),
  ) as CProgramTerm<Input, Output>;
}

export function cEdge<
  Input,
  Candidate,
  Assessment,
  Output,
  Transform extends COfTerm<Input, Candidate, "transform", ComputeRegime, "zero" | "one">,
  Evaluate extends COfTerm<Candidate, Assessment, "evaluate", ComputeRegime, "zero" | "one">,
  Consequence extends COfTerm<Assessment, Output, "consequence", ComputeRegime, "zero" | "one">,
>(input: {
  readonly transform: Transform;
  readonly evaluate: Evaluate;
  readonly consequence: Consequence;
}): CProgramTerm<
  Input,
  Output,
  "transform" | "evaluate" | "consequence",
  CResultCardinality
> {
  for (const [role, term] of Object.entries(input)) {
    assertTerm(term, `C.edge ${role}`);
    if (term.kind !== "c_of" || term.stageRole !== role) {
      throw new TypeError(`C.edge ${role} must be one C.of leaf with stageRole ${role}`);
    }
  }
  if (input.transform.outputCarrierRef !== input.evaluate.inputCarrierRef) {
    throw new TypeError("C.edge transform output must match evaluate input");
  }
  if (input.evaluate.outputCarrierRef !== input.consequence.inputCarrierRef) {
    throw new TypeError("C.edge evaluate output must match consequence input");
  }
  return freezeTerm(
    {
      kind: "c_edge",
      inputCarrierRef: input.transform.inputCarrierRef,
      outputCarrierRef: input.consequence.outputCarrierRef,
      transform: input.transform,
      evaluate: input.evaluate,
      consequence: input.consequence,
    },
    witness<Input, Output, "transform" | "evaluate" | "consequence", CResultCardinality>(),
  );
}

export function cWorkflow<Input, Output>(
  graphFunction: CGraphFunctionRef<Input, Output>,
): CProgramTerm<Input, Output, never, "one"> {
  assertCarrier(graphFunction.input, "workflow.C input carrier");
  assertCarrier(graphFunction.output, "workflow.C output carrier");
  return freezeTerm(
    {
      kind: "c_workflow",
      inputCarrierRef: graphFunction.inputCarrierRef,
      outputCarrierRef: graphFunction.outputCarrierRef,
      graphFunctionRef: requireRef(graphFunction.graphFunctionRef, "workflow.C GraphFunction ref"),
    },
    witness<Input, Output, never, "one">(),
  );
}

export function cBatch<
  TaskInput,
  TaskOutput,
  First extends CProgramTerm<TaskInput, TaskOutput>,
  Rest extends readonly CProgramTerm<TaskInput, TaskOutput>[],
  Input = TaskInput,
  Output = TaskOutput,
>(
  tasks: readonly [First, ...Rest],
  batchRef: string,
  outerCarriers?: Readonly<{
    readonly input: CCarrier<Input>;
    readonly output: CCarrier<Output>;
  }>,
): CProgramTerm<Input, Output, CRoleOf<First | Rest[number]>, CCardinalityOf<First>> {
  if (tasks.length === 0) throw new TypeError("C.batch tasks must be non-empty");
  const head = tasks[0];
  assertTerm(head, "C.batch tasks[0]");
  if (outerCarriers !== undefined) {
    assertCarrier(outerCarriers.input, "C.batch outer input carrier");
    assertCarrier(outerCarriers.output, "C.batch outer output carrier");
  }
  const headCardinality = cTermResultCardinality(head);
  for (const [index, task] of tasks.entries()) {
    assertTerm(task, `C.batch tasks[${index}]`);
    if (
      task.inputCarrierRef !== head.inputCarrierRef ||
      task.outputCarrierRef !== head.outputCarrierRef
    ) {
      throw new TypeError(`C.batch tasks[${index}] has a different carrier pair`);
    }
    if (cTermResultCardinality(task) !== headCardinality) {
      throw new TypeError(`C.batch tasks[${index}] has a different result cardinality`);
    }
  }
  return freezeTerm(
    {
      kind: "c_batch",
      inputCarrierRef: outerCarriers?.input.ref ?? head.inputCarrierRef,
      outputCarrierRef: outerCarriers?.output.ref ?? head.outputCarrierRef,
      taskInputCarrierRef: head.inputCarrierRef,
      taskOutputCarrierRef: head.outputCarrierRef,
      batchRef: requireRef(batchRef, "C.batch batchRef"),
      tasks: [...tasks],
    },
    witness<Input, Output, CRoleOf<First | Rest[number]>, CCardinalityOf<First>>(),
  ) as CProgramTerm<Input, Output, CRoleOf<First | Rest[number]>, CCardinalityOf<First>>;
}

export function cRetry<Term extends SomeTerm>(
  term: Term,
  budget: number,
): CProgramTerm<CInputOf<Term>, COutputOf<Term>, CRoleOf<Term>, CCardinalityOf<Term>> {
  assertTerm(term, "C.retry term");
  if (!Number.isSafeInteger(budget) || budget < 1) {
    throw new TypeError("C.retry budget must be a positive safe integer");
  }
  return freezeTerm(
    {
      kind: "c_retry",
      inputCarrierRef: term.inputCarrierRef,
      outputCarrierRef: term.outputCarrierRef,
      budget,
      term,
    },
    witness<CInputOf<Term>, COutputOf<Term>, CRoleOf<Term>, CCardinalityOf<Term>>(),
  );
}

export const C = Object.freeze({
  of: cOf,
  id: cIdentity,
  compose: cCompose,
  edge: cEdge,
  batch: cBatch,
  retry: cRetry,
});

export const workflow = Object.freeze({ C: cWorkflow });
