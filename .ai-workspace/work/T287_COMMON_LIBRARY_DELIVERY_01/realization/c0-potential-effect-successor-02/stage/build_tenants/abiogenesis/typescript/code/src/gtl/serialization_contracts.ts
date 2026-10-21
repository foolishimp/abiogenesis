import * as v from "valibot";
import type { JsonValue } from "../shared/canonical_json.js";
import { nonblankSchema, digestSchema } from "../shared/public_function_contracts.js";
import type { CProgramNode } from "./c_algebra.js";
import { REQUIREMENT_HANDOFF_DECLARATION_SCHEMA, type GtlRequirementHandoffDeclaration } from "./requirement_handoff.js";
import { SEMANTIC_LIFECYCLE_SCHEMA, type SemanticLifecycleDeclaration } from "./semantic_stage.js";
import { SEMANTIC_JOB_LIFECYCLE_SCHEMA, type SemanticJobLifecycleDeclaration } from "./semantic_job.js";
import { STDO_RUN_ENVIRONMENT_SCHEMA, RUN_ENVIRONMENT_SCHEMA,
  type StdoRunEnvironmentDeclaration, type RunEnvironmentDeclaration } from "./stdo_run_environment.js";

// These private type references break recursive inference only. The lazy runtime
// schemas below always delegate to the complete syntax/JSON definition. They do
// not accept a reference-shaped value or add metadata to an authored carrier.
declare const recursiveReference: unique symbol;
interface SyntaxReference { readonly [recursiveReference]: "c_program_syntax"; }
interface JsonReference { readonly [recursiveReference]: "json_value"; }
interface ExistingContractReference<Value> { readonly [recursiveReference]: readonly ["existing_contract", Value]; }

export type StructuralValue<T> = T extends SyntaxReference ? CProgramNode
  : T extends JsonReference ? JsonValue
  : T extends ExistingContractReference<infer Value> ? Value
  : T extends string | number | boolean | null | undefined ? T
  : { readonly [K in keyof T]: StructuralValue<{} extends Pick<T, K> ? Exclude<T[K], undefined> : T[K]> };
export type ContractValue<Schema extends v.GenericSchema> = StructuralValue<v.InferOutput<Schema>>;

const ref = nonblankSchema;
const refs = v.array(ref);
const strings = v.array(v.string());
const version = v.literal("5.0.0");
const nonNegativeInteger = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(Number.MAX_SAFE_INTEGER));
const positiveInteger = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(Number.MAX_SAFE_INTEGER));
const digest = digestSchema;
const jsonReference = v.lazy(() => jsonValueSchema) as unknown as v.GenericSchema<unknown, JsonReference>;
const jsonValueSchema = v.union([
  v.null(), v.boolean(), v.string(), v.pipe(v.number(), v.finite()),
  v.array(jsonReference), v.record(v.string(), jsonReference),
]);
const syntaxReference = v.lazy(() => C_PROGRAM_SYNTAX_SCHEMA) as unknown as v.GenericSchema<unknown, SyntaxReference>;

export const EXECUTABLE_LEAF_REQUIREMENT_SCHEMA = v.strictObject({
  kind: v.literal("executable_leaf_requirement"), implementationBindingRef: ref,
  inputContractRef: ref, outputContractRef: ref, evidenceContractRef: ref,
  failureContractRef: ref, refusalContractRef: ref, judgmentContractRef: ref,
});
export const INTERACTION_LEAF_REQUIREMENT_SCHEMA = v.strictObject({
  kind: v.literal("interaction_leaf_requirement"), interactionKind: ref,
  actorCapabilityRef: ref, requestContractRef: ref, responseContractRef: ref, continuationContractRef: ref,
});
export const C_LEAF_REQUIREMENT_SCHEMA = v.variant("kind", [
  EXECUTABLE_LEAF_REQUIREMENT_SCHEMA, INTERACTION_LEAF_REQUIREMENT_SCHEMA,
]);
const carrierPair = { inputCarrierRef: ref, outputCarrierRef: ref };
export const C_OF_SCHEMA = v.strictObject({
  kind: v.literal("c_of"), ...carrierPair, programLocusRef: ref, stageRole: ref,
  fibre: v.picklist(["F_D", "F_P", "F_H"]), armId: ref, compositionRef: v.nullable(ref),
  vectorIndex: nonNegativeInteger, judgmentPredicateRef: ref, resultBearing: v.boolean(),
  requirement: C_LEAF_REQUIREMENT_SCHEMA,
});
export const C_IDENTITY_SCHEMA = v.strictObject({ kind: v.literal("c_identity"), ...carrierPair });
export const C_COMPOSE_SCHEMA = v.strictObject({
  kind: v.literal("c_compose"), ...carrierPair, terms: v.pipe(v.array(syntaxReference), v.minLength(2)),
});
export const C_EDGE_SCHEMA = v.strictObject({
  kind: v.literal("c_edge"), ...carrierPair,
  transform: C_OF_SCHEMA, evaluate: C_OF_SCHEMA, consequence: C_OF_SCHEMA,
});
export const C_WORKFLOW_SCHEMA = v.strictObject({ kind: v.literal("c_workflow"), ...carrierPair, graphFunctionRef: ref });
export const C_BATCH_SCHEMA = v.strictObject({
  kind: v.literal("c_batch"), ...carrierPair, taskInputCarrierRef: ref, taskOutputCarrierRef: ref,
  batchRef: ref, tasks: v.pipe(v.array(syntaxReference), v.minLength(1)),
});
export const C_RETRY_SCHEMA = v.strictObject({
  kind: v.literal("c_retry"), ...carrierPair, budget: positiveInteger, term: syntaxReference,
});
export const C_PROGRAM_SYNTAX_SCHEMA = v.variant("kind", [
  C_OF_SCHEMA, C_IDENTITY_SCHEMA, C_COMPOSE_SCHEMA, C_EDGE_SCHEMA, C_WORKFLOW_SCHEMA, C_BATCH_SCHEMA, C_RETRY_SCHEMA,
]);

export const CONTRACT_DECLARATION_SCHEMA = v.strictObject({
  contractRef: ref, contractVersion: version,
  contractKind: v.picklist(["closure", "evidence", "failure", "input", "judgment", "output", "refusal", "transition"]),
  valueKind: ref,
});
export const ENVIRONMENT_SCHEMA = v.strictObject({ requires: refs, provides: refs, carries: refs });
export const EVALUATOR_DECLARATION_SCHEMA = v.strictObject({
  name: ref, regime: v.picklist(["F_D", "F_P", "F_H"]), description: v.string(),
  binding: ref, consumedFieldRefs: refs, tags: refs,
});
export const RULE_DECLARATION_SCHEMA = v.strictObject({ name: ref, kind: ref, config: v.record(v.string(), jsonReference), tags: refs });
export const NODE_SCHEMA = v.strictObject({ nodeRef: ref, nodeKind: v.literal("c_locus"), term: syntaxReference });
export const EDGE_INPUT_BINDING_SCHEMA = v.strictObject({
  kind: v.literal("retain_graph_input"), entryContractRef: ref, sourceContractRef: ref, targetContractRef: ref,
});
export const EDGE_SCHEMA = v.strictObject({
  edgeRef: ref, fromNodeRef: ref, toNodeRef: ref, inputBinding: v.optional(EDGE_INPUT_BINDING_SCHEMA),
});
const applicationBase = {
  kind: v.literal("graph_function_application"), applicationRef: ref, inputContractRef: ref, outputContractRef: ref,
};
export const FOLDBACK_DECLARATION_SCHEMA = v.strictObject({
  mode: v.literal("rebind"), binding: ref, requiresParentEvaluation: v.literal(true),
});
export const COMPOSE_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("compose"), leftGraphFunctionRef: ref, rightGraphFunctionRef: ref,
});
export const SUBSTITUTE_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("substitute"), outerGraphFunctionRef: ref, targetVectorRef: ref, innerGraphFunctionRef: ref,
});
export const RECURSE_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("recurse"), graphFunctionRef: ref, terminationRuleRef: ref,
  terminationEvaluatorRefs: refs, terminationFieldRef: ref, foldbackRef: ref, foldback: FOLDBACK_DECLARATION_SCHEMA, bound: positiveInteger,
});
export const FAN_OUT_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("fan_out"), batchRef: ref, elementGraphFunctionRef: ref,
  inputVectorRef: ref, outputVectorRef: ref, inputMemberContractRef: ref, outputMemberContractRef: ref,
});
export const FAN_IN_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("fan_in"), reducerGraphFunctionRef: ref, inputVectorRef: ref,
});
export const GATE_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("gate"), targetRef: ref, ruleRef: ref, evaluatorRefs: refs,
});
export const REGISTERED_SELECTION_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("registered_selection"), sourceProgramLocusRef: ref, evaluatorRef: ref, ruleRef: ref,
});
export const REENTER_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("re_enter"), graphFunctionRef: ref,
  sourceProgramLocusRef: ref, targetProgramLocusRef: ref, maxApplications: positiveInteger,
});
export const PROMOTE_APPLICATION_SCHEMA = v.strictObject({ ...applicationBase, relationKind: v.literal("promote"), sourceRef: ref, targetRef: ref });
export const IDENTITY_APPLICATION_SCHEMA = v.strictObject({ ...applicationBase, relationKind: v.literal("identity"), targetRef: ref });
export const SAME_OBJECT_APPLICATION_SCHEMA = v.strictObject({
  ...applicationBase, relationKind: v.literal("same_object"), leftRef: ref, rightRef: ref, witnessRef: ref,
});
export const GRAPH_APPLICATION_SCHEMA = v.variant("relationKind", [
  COMPOSE_APPLICATION_SCHEMA, SUBSTITUTE_APPLICATION_SCHEMA, RECURSE_APPLICATION_SCHEMA,
  FAN_OUT_APPLICATION_SCHEMA, FAN_IN_APPLICATION_SCHEMA, GATE_APPLICATION_SCHEMA, REGISTERED_SELECTION_APPLICATION_SCHEMA,
  REENTER_APPLICATION_SCHEMA, PROMOTE_APPLICATION_SCHEMA, IDENTITY_APPLICATION_SCHEMA, SAME_OBJECT_APPLICATION_SCHEMA,
]);
export const GRAPH_TEMPLATE_SCHEMA = v.strictObject({
  kind: v.literal("inline_graph"), graphRef: ref, startNodeRef: ref, terminalNodeRefs: refs,
  nodes: v.array(NODE_SCHEMA), edges: v.array(EDGE_SCHEMA), applications: v.array(GRAPH_APPLICATION_SCHEMA),
});
export const GRAPH_FUNCTION_SCHEMA = v.strictObject({
  kind: v.literal("graph_function"), name: ref, version, environment: ENVIRONMENT_SCHEMA,
  inputs: refs, outputs: refs, template: GRAPH_TEMPLATE_SCHEMA, effects: refs,
  declarations: v.record(v.string(), v.string()), tags: refs,
});
export const IMPLEMENTATION_BINDING_SCHEMA = v.strictObject({
  kind: v.literal("implementation_binding"), bindingRef: ref, implementationRef: ref,
  packageName: ref, packageVersion: ref, modulePath: ref, namedSymbol: ref, computeRegime: v.picklist(["F_D", "F_P"]),
  inputContractRef: ref, outputContractRef: ref, failureContractRef: ref, refusalContractRef: ref,
});
export const PRODUCT_SEMANTICS_BINDING_SCHEMA = v.strictObject({
  kind: v.literal("product_semantics_binding"), bindingRef: ref,
  packageName: ref, packageVersion: ref, modulePath: ref, namedSymbol: ref,
});
const closureBasis = {
  kind: v.literal("closure_contract"), closureContractRef: ref, predicateRef: ref, evidenceContractRef: ref,
  resultContractRef: ref, refusalContractRef: ref, refusalValueKind: ref, judgmentContractRef: ref,
  rejectionContractRef: ref, transitionContractRef: ref, replayProjectionRef: ref, terminalKind: v.literal("completed"),
};
export const CLOSURE_CONTRACT_SCHEMA = v.variant("closureScope", [
  v.strictObject({ ...closureBasis, closureScope: v.literal("run"),
    eventKindRefs: v.strictTuple([v.literal("terminal_reached"), v.literal("frame_closed"), v.literal("graph_call_closed"), v.literal("run_closed")]) }),
  v.strictObject({ ...closureBasis, closureScope: v.literal("graph_call"),
    eventKindRefs: v.strictTuple([v.literal("terminal_reached"), v.literal("frame_closed"), v.literal("graph_call_closed")]) }),
]);
export const PROGRAM_START_SCHEMA = v.strictObject({ startRef: ref, graphFunctionRef: ref });
export const PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA = v.strictObject({
  kind: v.literal("program_public_asset_target"), handle: ref, assetRef: ref, startRef: ref,
});
export const ACTION_CATALOG_ROW_SCHEMA = v.strictObject({
  kind: v.literal("action_catalog_row"), actionRef: ref, actionKind: ref, programRef: ref, graphFunctionRef: ref,
  targetProgramLocusRef: ref, targetObligationRefs: refs, inputAssetRefs: refs, outputAssetRefs: refs,
  expectedDeltaRef: ref, progressConditionRef: ref, stopConditionRef: ref,
});
export const ACTION_CATALOG_SCHEMA = v.strictObject({
  kind: v.literal("action_catalog"), schemaVersion: version, catalogRef: ref, catalogDigest: digest, rows: v.array(ACTION_CATALOG_ROW_SCHEMA),
});
export const CONSTRUCTION_AUTHORITY_BINDING_SCHEMA = v.strictObject({
  kind: v.literal("construction_authority_binding"),
  semanticAuthority: v.picklist(["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"]),
  authorityRef: ref, initialProgramLocusRef: ref, refreshProgramLocusRef: v.nullable(ref),
});
export const CONSTRUCTION_POLICY_SCHEMA = v.strictObject({
  kind: v.literal("construction_policy"), policyRef: ref, requireCompleteEvidence: v.boolean(), requirePostEvidenceRefresh: v.boolean(),
});
export const CONSTRUCTION_COMPOSITION_SCHEMA = v.strictObject({
  kind: v.literal("construction_composition"), schemaVersion: version, compositionRef: ref, compositionDigest: digest,
  graphFunctionRef: ref, authorities: v.strictTuple(Array.from({ length: 4 }, () => CONSTRUCTION_AUTHORITY_BINDING_SCHEMA) as [
    typeof CONSTRUCTION_AUTHORITY_BINDING_SCHEMA, typeof CONSTRUCTION_AUTHORITY_BINDING_SCHEMA,
    typeof CONSTRUCTION_AUTHORITY_BINDING_SCHEMA, typeof CONSTRUCTION_AUTHORITY_BINDING_SCHEMA,
  ]), interactionProgramLocusRef: ref, closurePolicy: CONSTRUCTION_POLICY_SCHEMA,
});
export const GTL_PROGRAM_SCHEMA = v.strictObject({
  kind: v.literal("gtl_program"), programRef: ref, version, moduleRef: ref,
  starts: v.array(PROGRAM_START_SCHEMA), callableMembership: refs, closureContractRef: ref, policies: v.record(v.string(), v.string()),
  publicAssetTargets: v.optional(v.array(PROGRAM_PUBLIC_ASSET_TARGET_SCHEMA)),
  actionCatalog: v.optional(ACTION_CATALOG_SCHEMA), constructionComposition: v.optional(CONSTRUCTION_COMPOSITION_SCHEMA),
});
export const CATALOG_CONTRIBUTION_SCHEMA = v.strictObject({
  handle: ref, kind: v.picklist(["graph_function", "node_type", "overlay"]), declarationOrContractRef: ref,
  owningProductId: ref, programMembershipRefs: refs, readinessPrerequisiteRefs: refs, compatibilityRefs: refs, provenanceRefs: refs,
});
// The job owner uses a custom stage predicate. Its actual structural stage
// definition is already in the lifecycle owner: reuse that definition rather
// than publishing an untyped custom predicate or copying a stage schema.
const semanticJobSchema = v.strictObject({
  ...SEMANTIC_JOB_LIFECYCLE_SCHEMA.entries, stages: SEMANTIC_LIFECYCLE_SCHEMA.entries.stages,
});
// Preserve the already owned native declarations (including their exact shallow
// readonly/optional contract) while using their actual structural schemas.
function existingContractSchema<Value>(schema: v.GenericSchema): v.GenericSchema<unknown, ExistingContractReference<Value>> {
  return schema as v.GenericSchema<unknown, ExistingContractReference<Value>>;
}
export const MODULE_PUBLICATION_SCHEMA = v.strictObject({
  stdoRunEnvironments: v.optional(v.array(existingContractSchema<Readonly<StdoRunEnvironmentDeclaration>>(STDO_RUN_ENVIRONMENT_SCHEMA))),
  runEnvironments: v.optional(v.array(existingContractSchema<Readonly<RunEnvironmentDeclaration>>(RUN_ENVIRONMENT_SCHEMA))),
  semanticLifecycle: v.optional(existingContractSchema<Readonly<SemanticLifecycleDeclaration>>(SEMANTIC_LIFECYCLE_SCHEMA)),
  semanticJobLifecycle: v.optional(existingContractSchema<Readonly<SemanticJobLifecycleDeclaration>>(semanticJobSchema)),
  requirementHandoffs: v.optional(v.array(existingContractSchema<Readonly<GtlRequirementHandoffDeclaration>>(REQUIREMENT_HANDOFF_DECLARATION_SCHEMA))),
  kind: v.literal("module_publication"), moduleRef: ref, moduleVersion: version, owningProductId: ref,
  artifactDigest: digest, productContentDigest: digest, productManifestDigest: digest, descriptorRef: ref, contributionManifestRef: ref,
  productSemanticsBinding: PRODUCT_SEMANTICS_BINDING_SCHEMA, contracts: v.array(CONTRACT_DECLARATION_SCHEMA),
  evaluators: v.array(EVALUATOR_DECLARATION_SCHEMA), rules: v.array(RULE_DECLARATION_SCHEMA),
  implementationBindings: v.array(IMPLEMENTATION_BINDING_SCHEMA), closureContracts: v.array(CLOSURE_CONTRACT_SCHEMA),
  programs: v.array(GTL_PROGRAM_SCHEMA), graphFunctions: v.array(GRAPH_FUNCTION_SCHEMA), contributions: v.array(CATALOG_CONTRIBUTION_SCHEMA),
});
export const GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA = v.strictObject({
  kind: v.literal("conformance_evaluate_packet"), schemaVersion: version, memberKey: v.literal("gtl_program"),
  publication: MODULE_PUBLICATION_SCHEMA, program: GTL_PROGRAM_SCHEMA,
});

const corpusPath = v.array(v.union([v.string(), nonNegativeInteger]));
const corpusMutationSchema = v.strictObject({
  caseId: ref, target: v.picklist(["program_and_published_program", "publication"]), path: corpusPath,
  operation: v.picklist(["replace", "append", "append_first"]), value: v.optional(jsonReference), expectedDiagnosticIds: refs,
});
export const GTL_LANGUAGE_CONFORMANCE_CORPUS_SCHEMA = v.strictObject({
  kind: v.literal("gtl_language_conformance_corpus"), schemaVersion: version, corpusVersion: ref,
  diagnosticVocabularyContractRef: v.literal("abg.vocabulary.gtl-program-diagnostic-id"),
  schema: v.strictObject({ path: v.literal("contracts/schemas/gtl-serialization.schema.json"), contentDigest: digest,
    definitionRef: v.literal("#/$defs/GtlLanguageConformanceCorpus") }),
  premises: v.strictObject({ scope: ref, originalOwner: ref, originalOwnerDigest: digest, declarationBasis: ref, constructorExamples: ref }),
  programs: v.pipe(v.array(v.strictObject({
    caseId: ref, packet: GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA, expectedDisposition: v.literal("passed"),
    expectedDiagnosticIds: refs, mutations: v.array(corpusMutationSchema),
  })), v.minLength(1)),
  constructors: v.array(v.strictObject({ kind: v.picklist(["c_of", "c_identity", "c_compose", "c_edge", "c_workflow", "c_batch", "c_retry"]),
    syntax: syntaxReference, expectedDisposition: v.literal("admitted") })),
  interactionSyntax: C_OF_SCHEMA,
  localNegatives: v.array(v.strictObject({ caseId: ref, constructorKind: v.picklist(["c_of", "c_identity", "c_compose", "c_edge", "c_workflow", "c_batch", "c_retry"]),
    operation: v.picklist(["remove", "replace"]), path: corpusPath, value: v.optional(jsonReference),
    expectedCode: v.literal("invalid_kind"), expectedPath: ref })),
});

/** Runtime schema and native projection share the same checked definition. */
export function nativeStructuralSchema<Schema extends v.GenericSchema>(schema: Schema): v.GenericSchema<unknown, ContractValue<Schema>> {
  return schema as v.GenericSchema<unknown, ContractValue<Schema>>;
}

export const GTL_SERIALIZATION_SCHEMA_DEFINITIONS = Object.freeze({
  GraphFunction: GRAPH_FUNCTION_SCHEMA,
  ModulePublication: MODULE_PUBLICATION_SCHEMA,
  CProgramSyntax: C_PROGRAM_SYNTAX_SCHEMA,
  GtlProgramConformanceInput: GTL_PROGRAM_CONFORMANCE_INPUT_SCHEMA,
});
export const GTL_SERIALIZATION_SCHEMA_FAMILY = v.strictObject(GTL_SERIALIZATION_SCHEMA_DEFINITIONS);
