import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type { CProgramNode, ComputeRegime } from "./c_algebra.js";

export type { ComputeRegime } from "./c_algebra.js";

export interface ContractDeclaration {
  readonly contractRef: string;
  readonly contractVersion: "5.0.0";
  readonly contractKind:
    | "closure"
    | "evidence"
    | "failure"
    | "input"
    | "judgment"
    | "output"
    | "refusal"
    | "transition";
  readonly valueKind: string;
}

export interface HelloWorldInput {
  readonly kind: "hello_world_input";
  readonly schemaVersion: "5.0.0";
  readonly subject: string;
}

export interface HelloWorldOutput {
  readonly kind: "hello_world_output";
  readonly schemaVersion: "5.0.0";
  readonly message: string;
}

export interface NormalizedHelloInput {
  readonly kind: "normalized_hello_input";
  readonly schemaVersion: "5.0.0";
  readonly subject: string;
}

export interface FpHelloInstruction {
  readonly kind: "fp_hello_instruction";
  readonly schemaVersion: "5.0.0";
  readonly materializationPlanRef: string;
  readonly rendererRef: string;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly workerActorRef: string;
  readonly workerBindingRef: string;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly subject: string;
  readonly instruction: string;
}

export interface FpHelloOutput {
  readonly kind: "fp_hello_output";
  readonly schemaVersion: "5.0.0";
  readonly resultContractRef: string;
  readonly actorRef: string;
  readonly message: string;
}

export interface GtlEnvironment {
  readonly requires: readonly string[];
  readonly provides: readonly string[];
  readonly carries: readonly string[];
}

export interface EvaluatorDeclaration {
  readonly name: string;
  readonly regime: ComputeRegime;
  readonly description: string;
  readonly binding: string;
  readonly consumedFieldRefs: readonly string[];
  readonly tags: readonly string[];
}

export interface RuleDeclaration {
  readonly name: string;
  readonly kind: string;
  readonly config: Readonly<Record<string, JsonValue>>;
  readonly tags: readonly string[];
}

export interface GtlNode {
  readonly nodeRef: string;
  readonly nodeKind: "c_locus";
  readonly term: CProgramNode;
}

export interface GtlEdge {
  readonly edgeRef: string;
  readonly fromNodeRef: string;
  readonly toNodeRef: string;
}

interface GraphFunctionApplicationBase {
  readonly kind: "graph_function_application";
  readonly applicationRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
}

export interface ComposeApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "compose";
  readonly leftGraphFunctionRef: string;
  readonly rightGraphFunctionRef: string;
}

export interface SubstituteApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "substitute";
  readonly outerGraphFunctionRef: string;
  readonly targetVectorRef: string;
  readonly innerGraphFunctionRef: string;
}

export interface FoldbackDeclaration {
  readonly mode: "rebind";
  readonly binding: string;
  readonly requiresParentEvaluation: true;
}

export interface RecurseApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "recurse";
  readonly graphFunctionRef: string;
  readonly terminationRuleRef: string;
  readonly terminationEvaluatorRefs: readonly string[];
  readonly foldbackRef: string;
  readonly foldback: FoldbackDeclaration;
  readonly bound: number;
}

export interface FanOutApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "fan_out";
  readonly elementGraphFunctionRef: string;
  readonly inputVectorRef: string;
  readonly outputVectorRef: string;
  readonly inputMemberContractRef: string;
  readonly outputMemberContractRef: string;
}

export interface FanInApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "fan_in";
  readonly reducerGraphFunctionRef: string;
  readonly inputVectorRef: string;
}

export interface GateApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "gate";
  readonly targetRef: string;
  readonly ruleRef: string;
  readonly evaluatorRefs: readonly string[];
}

export interface PromoteApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "promote";
  readonly sourceRef: string;
  readonly targetRef: string;
}

export interface IdentityApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "identity";
  readonly targetRef: string;
}

export interface SameObjectApplication extends GraphFunctionApplicationBase {
  readonly relationKind: "same_object";
  readonly leftRef: string;
  readonly rightRef: string;
  readonly witnessRef: string;
}

export type GraphFunctionApplication =
  | ComposeApplication
  | SubstituteApplication
  | RecurseApplication
  | FanOutApplication
  | FanInApplication
  | GateApplication
  | PromoteApplication
  | IdentityApplication
  | SameObjectApplication;

export interface GraphTemplate {
  readonly kind: "inline_graph";
  readonly graphRef: string;
  readonly startNodeRef: string;
  readonly terminalNodeRefs: readonly string[];
  readonly nodes: readonly GtlNode[];
  readonly edges: readonly GtlEdge[];
  readonly applications: readonly GraphFunctionApplication[];
}

export interface GraphMaterializationBasis {
  readonly invocationAdmissionRef: string;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
}

export interface GtlGraph {
  readonly kind: "gtl_graph";
  readonly schemaVersion: "5.0.0";
  readonly materializationRef: string;
  readonly materializationDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
  readonly template: GraphTemplate;
}

export interface GraphFunction {
  readonly kind: "graph_function";
  readonly name: string;
  readonly version: "5.0.0";
  readonly environment: GtlEnvironment;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly template: GraphTemplate;
  readonly effects: readonly string[];
  readonly declarations: Readonly<Record<string, string>>;
  readonly tags: readonly string[];
}

export interface ImplementationBinding {
  readonly kind: "implementation_binding";
  readonly bindingRef: string;
  readonly implementationRef: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly modulePath: string;
  readonly namedSymbol: string;
  readonly computeRegime: Exclude<ComputeRegime, "F_H">;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
}

export interface ClosureContract {
  readonly kind: "closure_contract";
  readonly closureContractRef: string;
  readonly predicateRef: string;
  readonly evidenceContractRef: string;
  readonly resultContractRef: string;
  readonly refusalContractRef: string;
  readonly refusalValueKind: string;
  readonly judgmentContractRef: string;
  readonly rejectionContractRef: string;
  readonly transitionContractRef: string;
  readonly replayProjectionRef: string;
  readonly terminalKind: "completed";
  readonly eventKindRefs: readonly [
    "terminal_reached",
    "frame_closed",
    "graph_call_closed",
    "run_closed",
  ];
}

export interface ProgramStart {
  readonly startRef: string;
  readonly graphFunctionRef: string;
}

export interface GtlProgram {
  readonly kind: "gtl_program";
  readonly programRef: string;
  readonly version: "5.0.0";
  readonly moduleRef: string;
  readonly starts: readonly ProgramStart[];
  readonly callableMembership: readonly string[];
  readonly closureContractRef: string;
  readonly policies: Readonly<Record<string, string>>;
}

export type CatalogContributionKind = "graph_function" | "node_type" | "overlay";

export interface CatalogContribution {
  readonly handle: string;
  readonly kind: CatalogContributionKind;
  readonly declarationOrContractRef: string;
  readonly owningProductId: string;
  readonly programMembershipRefs: readonly string[];
  readonly compatibilityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface ModulePublication {
  readonly kind: "module_publication";
  readonly moduleRef: string;
  readonly moduleVersion: "5.0.0";
  readonly owningProductId: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly productManifestDigest: Sha256Digest;
  readonly descriptorRef: string;
  readonly contributionManifestRef: string;
  readonly contracts: readonly ContractDeclaration[];
  readonly evaluators: readonly EvaluatorDeclaration[];
  readonly rules: readonly RuleDeclaration[];
  readonly implementationBindings: readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}

export interface RootModuleArtifactBasis {
  readonly productId: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly productManifestDigest: Sha256Digest;
  readonly packageName: string;
  readonly packageVersion: string;
}
