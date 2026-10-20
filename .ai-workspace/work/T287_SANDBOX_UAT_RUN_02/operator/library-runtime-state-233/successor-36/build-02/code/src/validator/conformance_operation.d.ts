import type { ReadyGraphFunctionCatalog, GraphFunctionCatalogView } from "../product/catalog.js";
import type { ResolvedProgramDeclarationClosure } from "../product/declaration_closure.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA, type ContractValue } from "../gtl/serialization_contracts.js";
import { type RawAdmissionResult, type RawAdmittedValue } from "./raw_admission.js";
import { type GtlProgramDiagnosticId, type ProgramValidation } from "./validation.js";
export interface ConformanceDeclarationBasis {
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogView: GraphFunctionCatalogView;
    readonly declarationClosure: ResolvedProgramDeclarationClosure;
}
export interface GtlProgramConformanceInput extends ContractValue<typeof GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA> {
}
export type ConformanceEvaluatePacket = GtlProgramConformanceInput;
export declare function admitGtlProgramConformanceInput(value: unknown): RawAdmissionResult<GtlProgramConformanceInput>;
export interface GtlProgramConformanceResult {
    readonly kind: "gtl_program_conformance_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "passed";
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly evidenceRef: string;
    readonly evidenceDigest: Sha256Digest;
    readonly validation: ProgramValidation;
    readonly diagnostics: readonly [];
    readonly violatedContractRefs: readonly [];
    readonly repairAffordances: readonly [];
}
export interface GtlProgramConformanceRefusal {
    readonly kind: "gtl_program_conformance_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "failed";
    readonly programRef: string | null;
    readonly programDigest: Sha256Digest | null;
    readonly code: "invalid_packet" | "raw_admission_refused" | "validation_failed";
    readonly diagnosticRef: string;
    readonly diagnostics: readonly Readonly<{
        readonly code: GtlProgramDiagnosticId;
        readonly path: string;
        readonly message: string;
    }>[];
    readonly violatedContractRefs: readonly string[];
    readonly evidenceRefs: readonly string[];
    readonly repairAffordances: readonly [];
}
export type GtlProgramConformanceOperationResult = GtlProgramConformanceResult | GtlProgramConformanceRefusal;
export declare function evaluateGtlProgramConformance(supplied: ConformanceEvaluatePacket, declarationBasis?: ConformanceDeclarationBasis): GtlProgramConformanceOperationResult;
export declare function typecheckGtlProgram(admittedInput: RawAdmittedValue<GtlProgramConformanceInput>, declarationBasis?: ConformanceDeclarationBasis): GtlProgramConformanceOperationResult;
export declare const GTL_PROGRAM_CONFORMANCE_INPUT_API: Readonly<{
    schemaDefinition: "GtlProgramConformanceInput";
    schema: import("valibot").GenericSchema<unknown, {
        readonly kind: "conformance_evaluate_packet";
        readonly schemaVersion: "5.0.0";
        readonly memberKey: "gtl_program";
        readonly publication: {
            readonly stdoRunEnvironments?: readonly Readonly<{
                kind: "stdo_run_environment_declaration";
                schemaVersion: "5.0.0";
                declarationRef: string;
                source: {
                    releaseUri: string;
                    manifestDigest: string;
                };
                representation: {
                    program: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    map: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    productRef: string;
                    releaseRef: string;
                    tagObject: string;
                    recordUri: string;
                    recordDigest: string;
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                };
                axiom: {
                    executablePath: string;
                    outputContractPath: string;
                    outputContractVersion: "axiom-indexer.frame-projection@1";
                    pythonExecutableDigest: string;
                    productRef: string;
                    releaseRef: string;
                    tagObject: string;
                    recordUri: string;
                    recordDigest: string;
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                };
                contexts: {
                    contextRef: string;
                    sourceLocator: string;
                    inventoryDigest: string;
                    members: {
                        memberRef: string;
                        path: string;
                        byteCount: number;
                        digest: string;
                    }[];
                }[];
                accesses: {
                    accessRef: string;
                    operation: "project";
                    mode: "materialized";
                    frameIndexRefs: string[];
                    maxOutputBytes: number;
                    timeoutMs: number;
                }[];
                roles: {
                    graphFunctionRef: string;
                    programLocusRef: string;
                    role: "author" | "assessor" | "constructor" | "command_executor";
                    frameRefs: string[];
                    policy: {
                        policyRef: string;
                        text: string;
                        digest: string;
                    };
                    accessRefs: string[];
                    sourceBindings: {
                        contextRef: string;
                        memberRef: string;
                        memberDigest: string;
                        startByte: number;
                        endByte: number;
                        spanDigest: string;
                    }[];
                }[];
            }>[];
            readonly runEnvironments?: readonly Readonly<{
                kind: "run_environment_declaration";
                schemaVersion: "5.0.0";
                declarationRef: string;
                dependencies: {
                    dependencyRef: string;
                    basisRef: string;
                    recordRef: string;
                    recordDigest: string;
                    recordFormat: "member_inventory@1" | "stdo_source_manifest@1" | "release_record@1";
                    inventoryDigest: string;
                    members: {
                        path: string;
                        type: "file" | "symlink";
                        digest: string;
                        target: string | null;
                    }[];
                }[];
                contexts: {
                    contextRef: string;
                    sourceLocator: string;
                    inventoryDigest: string;
                    members: {
                        memberRef: string;
                        path: string;
                        byteCount: number;
                        digest: string;
                    }[];
                }[];
                corpusAccess: {
                    kind: "axiom_indexer";
                    sourceDependencyRef: string;
                    representationDependencyRef: string;
                    axiomDependencyRef: string;
                    program: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    map: {
                        path: string;
                        uri: string;
                        byteDigest: string;
                        canonicalDigest: string;
                    };
                    executablePath: string;
                    outputContractPath: string;
                    pythonExecutableDigest: string;
                    pythonVersion: string;
                } | null;
                accesses: {
                    accessRef: string;
                    operation: "project" | "validate";
                    mode: "validation" | "materialized";
                    frameIndexRefs: string[];
                    maxOutputBytes: number;
                    timeoutMs: number;
                }[];
                roles: {
                    role: "author" | "assessor" | "constructor" | "command_executor" | "selector";
                    accessRefs: string[];
                    contextPolicy: {
                        policyRef: string;
                        selectors: ("full_source" | "declared_predecessor_semantics" | "active_binding_semantics" | "current_candidate" | "current_worksite" | "admitted_execution_evidence" | "assessor_evaluation_data" | "not_required")[];
                    };
                    graphFunctionRef: string;
                    programLocusRef: string;
                    frameRefs: string[];
                    policy: {
                        policyRef: string;
                        text: string;
                        digest: string;
                    };
                    sourceBindings: {
                        contextRef: string;
                        memberRef: string;
                        memberDigest: string;
                        startByte: number;
                        endByte: number;
                        spanDigest: string;
                    }[];
                }[];
            }>[];
            readonly semanticLifecycle?: Readonly<import("../index.js").SemanticLifecycleDeclaration>;
            readonly semanticJobLifecycle?: Readonly<import("../index.js").SemanticJobLifecycleDeclaration>;
            readonly requirementHandoffs?: readonly Readonly<import("../index.js").GtlRequirementHandoffDeclaration>[];
            readonly kind: "module_publication";
            readonly moduleRef: string;
            readonly moduleVersion: "5.0.0";
            readonly owningProductId: string;
            readonly artifactDigest: `sha256:${string}`;
            readonly productContentDigest: `sha256:${string}`;
            readonly productManifestDigest: `sha256:${string}`;
            readonly descriptorRef: string;
            readonly contributionManifestRef: string;
            readonly productSemanticsBinding: {
                readonly kind: "product_semantics_binding";
                readonly bindingRef: string;
                readonly packageName: string;
                readonly packageVersion: string;
                readonly modulePath: string;
                readonly namedSymbol: string;
            };
            readonly contracts: readonly {
                readonly contractRef: string;
                readonly contractVersion: "5.0.0";
                readonly contractKind: "refusal" | "input" | "output" | "evidence" | "closure" | "failure" | "judgment" | "transition";
                readonly valueKind: string;
            }[];
            readonly evaluators: readonly {
                readonly name: string;
                readonly regime: "F_D" | "F_P" | "F_H";
                readonly description: string;
                readonly binding: string;
                readonly consumedFieldRefs: readonly string[];
                readonly tags: readonly string[];
            }[];
            readonly rules: readonly {
                readonly name: string;
                readonly kind: string;
                readonly config: {
                    readonly [x: string]: JsonValue;
                };
                readonly tags: readonly string[];
            }[];
            readonly implementationBindings: readonly {
                readonly kind: "implementation_binding";
                readonly bindingRef: string;
                readonly implementationRef: string;
                readonly packageName: string;
                readonly packageVersion: string;
                readonly modulePath: string;
                readonly namedSymbol: string;
                readonly computeRegime: "F_D" | "F_P";
                readonly inputContractRef: string;
                readonly outputContractRef: string;
                readonly failureContractRef: string;
                readonly refusalContractRef: string;
            }[];
            readonly closureContracts: readonly ({
                readonly closureScope: "run";
                readonly eventKindRefs: readonly ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"];
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
            } | {
                readonly closureScope: "graph_call";
                readonly eventKindRefs: readonly ["terminal_reached", "frame_closed", "graph_call_closed"];
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
            })[];
            readonly programs: readonly {
                readonly kind: "gtl_program";
                readonly programRef: string;
                readonly version: "5.0.0";
                readonly moduleRef: string;
                readonly starts: readonly {
                    readonly startRef: string;
                    readonly graphFunctionRef: string;
                }[];
                readonly callableMembership: readonly string[];
                readonly closureContractRef: string;
                readonly policies: {
                    readonly [x: string]: string;
                };
                readonly publicAssetTargets?: readonly {
                    readonly kind: "program_public_asset_target";
                    readonly handle: string;
                    readonly assetRef: string;
                    readonly startRef: string;
                }[];
                readonly actionCatalog?: {
                    readonly kind: "action_catalog";
                    readonly schemaVersion: "5.0.0";
                    readonly catalogRef: string;
                    readonly catalogDigest: `sha256:${string}`;
                    readonly rows: readonly {
                        readonly kind: "action_catalog_row";
                        readonly actionRef: string;
                        readonly actionKind: string;
                        readonly programRef: string;
                        readonly graphFunctionRef: string;
                        readonly targetProgramLocusRef: string;
                        readonly targetObligationRefs: readonly string[];
                        readonly inputAssetRefs: readonly string[];
                        readonly outputAssetRefs: readonly string[];
                        readonly expectedDeltaRef: string;
                        readonly progressConditionRef: string;
                        readonly stopConditionRef: string;
                    }[];
                };
                readonly constructionComposition?: {
                    readonly kind: "construction_composition";
                    readonly schemaVersion: "5.0.0";
                    readonly compositionRef: string;
                    readonly compositionDigest: `sha256:${string}`;
                    readonly graphFunctionRef: string;
                    readonly authorities: readonly [{
                        readonly kind: "construction_authority_binding";
                        readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        readonly authorityRef: string;
                        readonly initialProgramLocusRef: string;
                        readonly refreshProgramLocusRef: string | null;
                    }, {
                        readonly kind: "construction_authority_binding";
                        readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        readonly authorityRef: string;
                        readonly initialProgramLocusRef: string;
                        readonly refreshProgramLocusRef: string | null;
                    }, {
                        readonly kind: "construction_authority_binding";
                        readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        readonly authorityRef: string;
                        readonly initialProgramLocusRef: string;
                        readonly refreshProgramLocusRef: string | null;
                    }, {
                        readonly kind: "construction_authority_binding";
                        readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                        readonly authorityRef: string;
                        readonly initialProgramLocusRef: string;
                        readonly refreshProgramLocusRef: string | null;
                    }];
                    readonly interactionProgramLocusRef: string;
                    readonly closurePolicy: {
                        readonly kind: "construction_policy";
                        readonly policyRef: string;
                        readonly requireCompleteEvidence: boolean;
                        readonly requirePostEvidenceRefresh: boolean;
                    };
                };
            }[];
            readonly graphFunctions: readonly {
                readonly kind: "graph_function";
                readonly name: string;
                readonly version: "5.0.0";
                readonly environment: {
                    readonly requires: readonly string[];
                    readonly provides: readonly string[];
                    readonly carries: readonly string[];
                };
                readonly inputs: readonly string[];
                readonly outputs: readonly string[];
                readonly template: {
                    readonly kind: "inline_graph";
                    readonly graphRef: string;
                    readonly startNodeRef: string;
                    readonly terminalNodeRefs: readonly string[];
                    readonly nodes: readonly {
                        readonly nodeRef: string;
                        readonly nodeKind: "c_locus";
                        readonly term: import("../index.js").CProgramNode;
                    }[];
                    readonly edges: readonly {
                        readonly edgeRef: string;
                        readonly fromNodeRef: string;
                        readonly toNodeRef: string;
                        readonly inputBinding?: {
                            readonly kind: "retain_graph_input";
                            readonly entryContractRef: string;
                            readonly sourceContractRef: string;
                            readonly targetContractRef: string;
                        };
                    }[];
                    readonly applications: readonly ({
                        readonly relationKind: "compose";
                        readonly leftGraphFunctionRef: string;
                        readonly rightGraphFunctionRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "substitute";
                        readonly outerGraphFunctionRef: string;
                        readonly targetVectorRef: string;
                        readonly innerGraphFunctionRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "recurse";
                        readonly graphFunctionRef: string;
                        readonly terminationRuleRef: string;
                        readonly terminationEvaluatorRefs: readonly string[];
                        readonly terminationFieldRef: string;
                        readonly foldbackRef: string;
                        readonly foldback: {
                            readonly mode: "rebind";
                            readonly binding: string;
                            readonly requiresParentEvaluation: true;
                        };
                        readonly bound: number;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "fan_out";
                        readonly batchRef: string;
                        readonly elementGraphFunctionRef: string;
                        readonly inputVectorRef: string;
                        readonly outputVectorRef: string;
                        readonly inputMemberContractRef: string;
                        readonly outputMemberContractRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "fan_in";
                        readonly reducerGraphFunctionRef: string;
                        readonly inputVectorRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "gate";
                        readonly targetRef: string;
                        readonly ruleRef: string;
                        readonly evaluatorRefs: readonly string[];
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "registered_selection";
                        readonly sourceProgramLocusRef: string;
                        readonly evaluatorRef: string;
                        readonly ruleRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "re_enter";
                        readonly graphFunctionRef: string;
                        readonly sourceProgramLocusRef: string;
                        readonly targetProgramLocusRef: string;
                        readonly maxApplications: number;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "promote";
                        readonly sourceRef: string;
                        readonly targetRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "identity";
                        readonly targetRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    } | {
                        readonly relationKind: "same_object";
                        readonly leftRef: string;
                        readonly rightRef: string;
                        readonly witnessRef: string;
                        readonly kind: "graph_function_application";
                        readonly applicationRef: string;
                        readonly inputContractRef: string;
                        readonly outputContractRef: string;
                    })[];
                };
                readonly effects: readonly string[];
                readonly declarations: {
                    readonly [x: string]: string;
                };
                readonly tags: readonly string[];
            }[];
            readonly contributions: readonly {
                readonly handle: string;
                readonly kind: "graph_function" | "node_type" | "overlay";
                readonly declarationOrContractRef: string;
                readonly owningProductId: string;
                readonly programMembershipRefs: readonly string[];
                readonly readinessPrerequisiteRefs: readonly string[];
                readonly compatibilityRefs: readonly string[];
                readonly provenanceRefs: readonly string[];
            }[];
        };
        readonly program: {
            readonly kind: "gtl_program";
            readonly programRef: string;
            readonly version: "5.0.0";
            readonly moduleRef: string;
            readonly starts: readonly {
                readonly startRef: string;
                readonly graphFunctionRef: string;
            }[];
            readonly callableMembership: readonly string[];
            readonly closureContractRef: string;
            readonly policies: {
                readonly [x: string]: string;
            };
            readonly publicAssetTargets?: readonly {
                readonly kind: "program_public_asset_target";
                readonly handle: string;
                readonly assetRef: string;
                readonly startRef: string;
            }[];
            readonly actionCatalog?: {
                readonly kind: "action_catalog";
                readonly schemaVersion: "5.0.0";
                readonly catalogRef: string;
                readonly catalogDigest: `sha256:${string}`;
                readonly rows: readonly {
                    readonly kind: "action_catalog_row";
                    readonly actionRef: string;
                    readonly actionKind: string;
                    readonly programRef: string;
                    readonly graphFunctionRef: string;
                    readonly targetProgramLocusRef: string;
                    readonly targetObligationRefs: readonly string[];
                    readonly inputAssetRefs: readonly string[];
                    readonly outputAssetRefs: readonly string[];
                    readonly expectedDeltaRef: string;
                    readonly progressConditionRef: string;
                    readonly stopConditionRef: string;
                }[];
            };
            readonly constructionComposition?: {
                readonly kind: "construction_composition";
                readonly schemaVersion: "5.0.0";
                readonly compositionRef: string;
                readonly compositionDigest: `sha256:${string}`;
                readonly graphFunctionRef: string;
                readonly authorities: readonly [{
                    readonly kind: "construction_authority_binding";
                    readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                    readonly authorityRef: string;
                    readonly initialProgramLocusRef: string;
                    readonly refreshProgramLocusRef: string | null;
                }, {
                    readonly kind: "construction_authority_binding";
                    readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                    readonly authorityRef: string;
                    readonly initialProgramLocusRef: string;
                    readonly refreshProgramLocusRef: string | null;
                }, {
                    readonly kind: "construction_authority_binding";
                    readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                    readonly authorityRef: string;
                    readonly initialProgramLocusRef: string;
                    readonly refreshProgramLocusRef: string | null;
                }, {
                    readonly kind: "construction_authority_binding";
                    readonly semanticAuthority: "synthesizeModel" | "evalGap" | "evaluateNext" | "evaluateAction";
                    readonly authorityRef: string;
                    readonly initialProgramLocusRef: string;
                    readonly refreshProgramLocusRef: string | null;
                }];
                readonly interactionProgramLocusRef: string;
                readonly closurePolicy: {
                    readonly kind: "construction_policy";
                    readonly policyRef: string;
                    readonly requireCompleteEvidence: boolean;
                    readonly requirePostEvidenceRefresh: boolean;
                };
            };
        };
    }>;
    admitGtlProgramConformanceInput: typeof admitGtlProgramConformanceInput;
    typecheckGtlProgram: typeof typecheckGtlProgram;
}>;
/** Internal continuation after this conformance owner resolves the exact
 * declaration closure. This is not exposed on the raw ConformancePort. */
export declare function evaluateGtlProgramConformanceFromResolvedClosure(supplied: ConformanceEvaluatePacket, declarationClosure: ResolvedProgramDeclarationClosure): GtlProgramConformanceOperationResult;
export declare const ConformancePort: Readonly<{
    evaluateGtlProgram: typeof evaluateGtlProgramConformance;
}>;
export declare const CONFORMANCE_CONTRACTS: Readonly<{
    gtl_program: typeof evaluateGtlProgramConformance;
}>;
