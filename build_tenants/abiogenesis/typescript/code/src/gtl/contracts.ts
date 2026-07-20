import type { Sha256Digest, VerifiedProductArtifact } from "../product/index.js";

export type ComputeRegime = "F_D" | "F_H" | "F_P";

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

export interface GtlEnvironment {
  readonly requires: readonly string[];
  readonly provides: readonly string[];
  readonly carries: readonly string[];
}

export interface GtlNode {
  readonly nodeRef: string;
  readonly nodeKind: "c_locus";
  readonly computeRegime: ComputeRegime;
  readonly stageRole: string;
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly vectorIndex: number;
  readonly judgmentPredicateRef: string;
  readonly implementationBindingRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
}

export interface GtlEdge {
  readonly edgeRef: string;
  readonly fromNodeRef: string;
  readonly toNodeRef: string;
}

export interface GraphTemplate {
  readonly kind: "inline_graph";
  readonly graphRef: string;
  readonly startNodeRef: string;
  readonly terminalNodeRefs: readonly string[];
  readonly nodes: readonly GtlNode[];
  readonly edges: readonly GtlEdge[];
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
  readonly computeRegime: ComputeRegime;
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
  readonly implementationBindings: readonly ImplementationBinding[];
  readonly closureContracts: readonly ClosureContract[];
  readonly programs: readonly GtlProgram[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly contributions: readonly CatalogContribution[];
}

export interface RootModuleArtifactBasis {
  readonly productId: VerifiedProductArtifact["productId"];
  readonly artifactDigest: VerifiedProductArtifact["artifactDigest"];
  readonly productContentDigest: VerifiedProductArtifact["productContentDigest"];
  readonly productManifestDigest: VerifiedProductArtifact["manifestDigest"];
  readonly packageName: VerifiedProductArtifact["packageName"];
  readonly packageVersion: VerifiedProductArtifact["packageVersion"];
}
