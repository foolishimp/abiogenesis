import type * as structure from "./serialization_contracts.js";
export declare const COMPUTE_REGIME_VALUES: readonly ["F_D", "F_P", "F_H"];
export type ComputeRegime = (typeof COMPUTE_REGIME_VALUES)[number];
export declare const C_TERM_KIND_VALUES: readonly ["c_of", "c_identity", "c_compose", "c_edge", "c_workflow", "c_batch", "c_retry"];
export type CTermKind = (typeof C_TERM_KIND_VALUES)[number];
export type CResultCardinality = "zero" | "one" | "many";
export interface ExecutableLeafRequirement extends structure.ContractValue<typeof structure.EXECUTABLE_LEAF_REQUIREMENT_SCHEMA> {
}
export interface InteractionLeafRequirement extends structure.ContractValue<typeof structure.INTERACTION_LEAF_REQUIREMENT_SCHEMA> {
}
export type CLeafRequirement = ExecutableLeafRequirement | InteractionLeafRequirement;
export interface COfNode extends structure.ContractValue<typeof structure.C_OF_SCHEMA> {
}
export interface CIdentityNode extends structure.ContractValue<typeof structure.C_IDENTITY_SCHEMA> {
}
export interface CComposeNode extends structure.ContractValue<typeof structure.C_COMPOSE_SCHEMA> {
}
export interface CEdgeNode extends structure.ContractValue<typeof structure.C_EDGE_SCHEMA> {
}
export interface CWorkflowNode extends structure.ContractValue<typeof structure.C_WORKFLOW_SCHEMA> {
}
export interface CBatchNode extends structure.ContractValue<typeof structure.C_BATCH_SCHEMA> {
}
export interface CRetryNode extends structure.ContractValue<typeof structure.C_RETRY_SCHEMA> {
}
export type CProgramNode = COfNode | CIdentityNode | CComposeNode | CEdgeNode | CWorkflowNode | CBatchNode | CRetryNode;
declare const C_CARRIER_TYPE: unique symbol;
declare const C_TERM_TYPE: unique symbol;
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
export type CProgramTerm<Input, Output, Role extends string = string, Cardinality extends CResultCardinality = CResultCardinality> = CProgramNode & {
    readonly [C_TERM_TYPE]: CTermWitness<Input, Output, Role, Cardinality>;
};
export type COfTerm<Input, Output, Role extends string, Fibre extends ComputeRegime, Cardinality extends "zero" | "one"> = COfNode & CProgramTerm<Input, Output, Role, Cardinality> & {
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
type CInputOf<Term> = Term extends CProgramTerm<infer Input, unknown, string, CResultCardinality> ? Input : never;
type COutputOf<Term> = Term extends CProgramTerm<unknown, infer Output, string, CResultCardinality> ? Output : never;
type CRoleOf<Term> = Term extends CProgramTerm<unknown, unknown, infer Role, CResultCardinality> ? Role : never;
type CCardinalityOf<Term> = Term extends CProgramTerm<unknown, unknown, string, infer Cardinality> ? Cardinality : never;
type ExecutableLeafInput = {
    readonly fibre: "F_D" | "F_P";
    readonly requirement: ExecutableLeafRequirement;
};
type InteractionLeafInput = {
    readonly fibre: "F_H";
    readonly requirement: InteractionLeafRequirement;
};
type CLeafInput<Input, Output, Role extends string, ResultBearing extends boolean> = {
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
export declare function cTermResultCardinality(term: CProgramNode): CResultCardinality;
export declare function cLeafTerms(term: CProgramNode): readonly COfNode[];
export declare function isExecutableCLeaf(term: CProgramNode): term is COfNode & {
    readonly fibre: "F_D" | "F_P";
    readonly requirement: ExecutableLeafRequirement;
};
export declare function isInteractionCLeaf(term: CProgramNode): term is COfNode & {
    readonly fibre: "F_H";
    readonly requirement: InteractionLeafRequirement;
};
export declare function isNativeCProgramTerm(term: object): boolean;
/** Constructor-local laws shared by native construction and erased syntax.
 * Declaration membership and Program result obligations belong to validateProgram. */
export declare function assertCProgramLocalRelations(term: CProgramNode, path?: string): void;
/** Erase only this owner's verified non-data term witness. Preserve every other
 * descriptor so I-JSON admission can refuse unknown symbols/accessors/metadata. */
export declare function eraseNativeCProofMetadata(value: unknown): unknown;
export declare function cCarrier<Value>(ref: string): Readonly<CCarrier<Value>>;
export declare function cGraphFunctionRef<Input, Output>(input: {
    readonly graphFunctionRef: string;
    readonly input: CCarrier<Input>;
    readonly output: CCarrier<Output>;
}): Readonly<CGraphFunctionRef<Input, Output>>;
export declare function cOf<Input, Output, const Role extends string, const ResultBearing extends boolean>(input: CLeafInput<Input, Output, Role, ResultBearing>): COfTerm<Input, Output, Role, typeof input.fibre, ResultBearing extends true ? "one" : "zero">;
export declare function cIdentity<Value>(carrier: CCarrier<Value>): CProgramTerm<Value, Value, never, "zero">;
export declare function cCompose<Input, Middle, Output>(left: CProgramTerm<Input, Middle>, right: CProgramTerm<Middle, Output>): CProgramTerm<Input, Output>;
export declare function cEdge<Input, Candidate, Assessment, Output, Transform extends COfTerm<Input, Candidate, "transform", ComputeRegime, "zero" | "one">, Evaluate extends COfTerm<Candidate, Assessment, "evaluate", ComputeRegime, "zero" | "one">, Consequence extends COfTerm<Assessment, Output, "consequence", ComputeRegime, "zero" | "one">>(input: {
    readonly transform: Transform;
    readonly evaluate: Evaluate;
    readonly consequence: Consequence;
}): CProgramTerm<Input, Output, "transform" | "evaluate" | "consequence", CResultCardinality>;
export declare function cWorkflow<Input, Output>(graphFunction: CGraphFunctionRef<Input, Output>): CProgramTerm<Input, Output, never, "one">;
export declare function cBatch<TaskInput, TaskOutput, First extends CProgramTerm<TaskInput, TaskOutput>, Rest extends readonly CProgramTerm<TaskInput, TaskOutput>[], Input = TaskInput, Output = TaskOutput>(tasks: readonly [First, ...Rest], batchRef: string, outerCarriers?: Readonly<{
    readonly input: CCarrier<Input>;
    readonly output: CCarrier<Output>;
}>): CProgramTerm<Input, Output, CRoleOf<First | Rest[number]>, CCardinalityOf<First>>;
export declare function cRetry<Term extends SomeTerm>(term: Term, budget: number): CProgramTerm<CInputOf<Term>, COutputOf<Term>, CRoleOf<Term>, CCardinalityOf<Term>>;
export declare const C: Readonly<{
    of: typeof cOf;
    id: typeof cIdentity;
    compose: typeof cCompose;
    edge: typeof cEdge;
    batch: typeof cBatch;
    retry: typeof cRetry;
}>;
export declare const workflow: Readonly<{
    C: typeof cWorkflow;
}>;
export {};
