import type * as structure from "./serialization_contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type { ComputeRegime } from "./c_algebra.js";

export type { ComputeRegime } from "./c_algebra.js";

export interface ContractDeclaration extends structure.ContractValue<typeof structure.CONTRACT_DECLARATION_SCHEMA> {}

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

export interface BoundedRecursionState {
  readonly kind: "bounded_recursion_state";
  readonly schemaVersion: "5.0.0";
  readonly blockedChildRemaining: number | null;
  readonly remaining: number;
  readonly terminal: boolean;
  readonly trace: readonly number[];
}

export interface FanOutHelloMemberInput {
  readonly kind: "fan_out_hello_member_input";
  readonly schemaVersion: "5.0.0";
  readonly block: boolean;
  readonly subject: string;
}

export interface FanOutHelloMemberOutput {
  readonly kind: "fan_out_hello_member_output";
  readonly schemaVersion: "5.0.0";
  readonly message: string;
  readonly subject: string;
}

export interface FanOutHelloInputMember {
  readonly ordinal: number;
  readonly memberRef: string;
  readonly value: FanOutHelloMemberInput;
}

export interface FanOutHelloVectorInput {
  readonly kind: "fan_out_hello_vector_input";
  readonly schemaVersion: "5.0.0";
  readonly members: readonly FanOutHelloInputMember[];
}

export interface FanOutHelloOutputMember {
  readonly ordinal: number;
  readonly inputMemberRef: string;
  readonly outputMemberRef: string;
  readonly value: FanOutHelloMemberOutput;
}

export interface FanOutHelloVectorOutput {
  readonly kind: "gtl_fan_out_vector";
  readonly schemaVersion: "5.0.0";
  readonly applicationRef: string;
  readonly members: readonly FanOutHelloOutputMember[];
}

export interface FanOutHelloSummary {
  readonly kind: "fan_out_hello_summary";
  readonly schemaVersion: "5.0.0";
  readonly count: number;
  readonly messages: readonly string[];
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

export interface GtlEnvironment extends structure.ContractValue<typeof structure.ENVIRONMENT_SCHEMA> {}

export interface EvaluatorDeclaration extends structure.ContractValue<typeof structure.EVALUATOR_DECLARATION_SCHEMA> {}

export interface RuleDeclaration extends structure.ContractValue<typeof structure.RULE_DECLARATION_SCHEMA> {}

export interface GtlNode extends structure.ContractValue<typeof structure.NODE_SCHEMA> {}

export interface GtlEdgeInputBinding extends structure.ContractValue<typeof structure.EDGE_INPUT_BINDING_SCHEMA> {}

export interface GtlEdge extends structure.ContractValue<typeof structure.EDGE_SCHEMA> {}

export interface ComposeApplication extends structure.ContractValue<typeof structure.COMPOSE_APPLICATION_SCHEMA> {}

export interface SubstituteApplication extends structure.ContractValue<typeof structure.SUBSTITUTE_APPLICATION_SCHEMA> {}

export interface FoldbackDeclaration extends structure.ContractValue<typeof structure.FOLDBACK_DECLARATION_SCHEMA> {}

export interface RecurseApplication extends structure.ContractValue<typeof structure.RECURSE_APPLICATION_SCHEMA> {}

export interface FanOutApplication extends structure.ContractValue<typeof structure.FAN_OUT_APPLICATION_SCHEMA> {}

export interface FanInApplication extends structure.ContractValue<typeof structure.FAN_IN_APPLICATION_SCHEMA> {}

export interface GateApplication extends structure.ContractValue<typeof structure.GATE_APPLICATION_SCHEMA> {}

export interface RegisteredSelectionApplication extends structure.ContractValue<typeof structure.REGISTERED_SELECTION_APPLICATION_SCHEMA> {}

export interface ReenterApplication extends structure.ContractValue<typeof structure.REENTER_APPLICATION_SCHEMA> {}

export interface PromoteApplication extends structure.ContractValue<typeof structure.PROMOTE_APPLICATION_SCHEMA> {}

export interface IdentityApplication extends structure.ContractValue<typeof structure.IDENTITY_APPLICATION_SCHEMA> {}

export interface SameObjectApplication extends structure.ContractValue<typeof structure.SAME_OBJECT_APPLICATION_SCHEMA> {}

export type GraphFunctionApplication =
  | ComposeApplication
  | SubstituteApplication
  | RecurseApplication
  | FanOutApplication
  | FanInApplication
  | GateApplication
  | RegisteredSelectionApplication
  | ReenterApplication
  | PromoteApplication
  | IdentityApplication
  | SameObjectApplication;

export interface GraphTemplate extends structure.ContractValue<typeof structure.GRAPH_TEMPLATE_SCHEMA> {}

export interface GraphMaterializationBasis {
  readonly invocationAdmissionRef: string;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
  readonly admittedInput: Readonly<Record<string, JsonValue>>;
}

export interface FanOutMaterializedMember {
  readonly ordinal: number;
  readonly memberRef: string;
  readonly memberDigest: Sha256Digest;
  readonly value: Readonly<Record<string, JsonValue>>;
}

export interface FanOutMaterialization {
  readonly applicationRef: string;
  readonly batchRef: string;
  readonly inputVectorRef: string;
  readonly outputVectorRef: string;
  readonly inputMemberContractRef: string;
  readonly outputMemberContractRef: string;
  readonly members: readonly FanOutMaterializedMember[];
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
  readonly fanOutMaterializations: readonly FanOutMaterialization[];
  readonly template: GraphTemplate;
}

export interface GraphFunction extends structure.ContractValue<typeof structure.GRAPH_FUNCTION_SCHEMA> {}

export interface ImplementationBinding extends structure.ContractValue<typeof structure.IMPLEMENTATION_BINDING_SCHEMA> {}

export interface ProductSemanticsBinding extends structure.ContractValue<typeof structure.PRODUCT_SEMANTICS_BINDING_SCHEMA> {}

export type ClosureContract = structure.ContractValue<typeof structure.CLOSURE_CONTRACT_SCHEMA>;

export interface ProgramStart extends structure.ContractValue<typeof structure.PROGRAM_START_SCHEMA> {}

export interface ProgramPublicAssetTarget extends structure.ContractValue<typeof structure.PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA> {}

export interface GtlActionCatalogRow extends structure.ContractValue<typeof structure.ACTION_CATALOG_ROW_SCHEMA> {}

export interface GtlActionCatalog extends structure.ContractValue<typeof structure.ACTION_CATALOG_SCHEMA> {}

export type GtlConstructionSemanticAuthority = GtlConstructionAuthorityBinding["semanticAuthority"];

export interface GtlConstructionAuthorityBinding extends structure.ContractValue<typeof structure.CONSTRUCTION_AUTHORITY_BINDING_SCHEMA> {}

export interface GtlConstructionPolicy extends structure.ContractValue<typeof structure.CONSTRUCTION_POLICY_SCHEMA> {}

export interface GtlConstructionComposition extends structure.ContractValue<typeof structure.CONSTRUCTION_COMPOSITION_SCHEMA> {}

export interface GtlProgram extends structure.ContractValue<typeof structure.GTL_PROGRAM_SCHEMA> {}

export type CatalogContributionKind = CatalogContribution["kind"];

export interface CatalogContribution extends structure.ContractValue<typeof structure.CATALOG_CONTRIBUTION_SCHEMA> {}

export interface ModulePublication extends structure.ContractValue<typeof structure.MODULE_PUBLICATION_SCHEMA> {}

export interface RootModuleArtifactBasis {
  readonly productId: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly productManifestDigest: Sha256Digest;
  readonly packageName: string;
  readonly packageVersion: string;
}
