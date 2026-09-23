import { SEMANTIC_STAGE_IDS, SEMANTIC_IMPLEMENTATION_REFS } from "./semantic_stage_identity.js";
export { SEMANTIC_STAGE_IDS, SEMANTIC_IMPLEMENTATION_REFS } from "./semantic_stage_identity.js";
import * as v from "valibot";
import type { ContractDeclaration, GtlProgram, ModulePublication } from "./contracts.js";
import { REQUIREMENT_TERM_SCHEMA, type RequirementTerm } from "./requirement_handoff.js";
import { deepFreeze } from "../shared/immutable.js";
import { sha256Canonical } from "../shared/digests.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { validSemanticJobLifecyclePublication, validSemanticJobProgramOwners } from "./semantic_job.js";

const ref = v.pipe(v.string(), v.minLength(1));
const refs = v.array(ref);
const strings = v.array(v.string());
const sourceBindings = REQUIREMENT_TERM_SCHEMA.entries.sourceBindings;

export interface SemanticProofPolicy {
  readonly policyRef: string;
  readonly sourceRequirementRef: string;
  readonly sourceBindings: RequirementTerm["sourceBindings"];
  readonly scope: string;
  readonly realizationMeaning: readonly string[];
  readonly proofMeaning: readonly string[];
  readonly unprovedScope: readonly string[];
  readonly closureRule: string;
  readonly obligationRef: string;
}
export interface SemanticProofShape {
  readonly proofShapeRef: string;
  readonly requiredEvidenceRoles: readonly ("realization" | "verifier_artifact" | "verifier_execution" | "semantic_assessment")[];
  readonly sharedBasis: readonly string[];
  readonly requiredContent: readonly string[];
  readonly nativeCarrierBoundary: string;
  readonly requirementRef: string;
  readonly obligationRef: string;
  readonly roleContractRefs: { readonly realization: string; readonly proof: string };
}
export interface SemanticAssetSurface {
  readonly kind: string;
  readonly requiredContexts: readonly string[];
  readonly standardsRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly constructorRef: string;
  readonly rendererRef: string;
  readonly proofObligationRefs: readonly string[];
  readonly authoritySlots: readonly { readonly authorityKindRef: string; readonly disposition: "normal" | "bounded_fallback" | "forbidden_routine"; readonly fallbackPreconditionRefs: readonly string[] }[];
}
export type SemanticWorksiteContentPolicy = "not_required" | "current_inventory";
export type SemanticStageAssembly = {
  readonly ruleRef: string;
  readonly graphFunctionRef: string;
  readonly sectionOrder: readonly ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"];
  readonly proportionalityPolicy: "declared_semantic_assessment";
  readonly maxPromptBytes: number;
} & ({
  readonly contentPolicy: "full_source_and_predecessors";
} | {
  readonly contentPolicy: "role_scoped_worksite";
  readonly worksiteContentByRole: { readonly author: SemanticWorksiteContentPolicy; readonly assessor: SemanticWorksiteContentPolicy };
});
export interface SemanticStageDeclaration {
  readonly declarationRef: string;
  readonly graphFunctionRef: string;
  readonly authorLocusRef: string;
  readonly assessorLocusRef: string;
  readonly predecessorStageRefs: readonly string[];
  readonly assetSurface: SemanticAssetSurface;
  readonly purpose: string;
  readonly requiredContent: readonly string[];
  readonly rubric: readonly { readonly criterionRef: string; readonly instruction: string }[];
  readonly bodyCapabilities: readonly ("requirement_refinement" | "worksite_design" | "application_assessment")[];
  readonly assembly: SemanticStageAssembly;
}
export interface SemanticLifecycleDeclaration {
  readonly declarationRef: string;
  readonly sourceDeclarationRef: string;
  readonly taskDataDigest: `sha256:${string}`;
  readonly evaluationDataDigest: `sha256:${string}`;
  readonly proofPolicies: readonly SemanticProofPolicy[];
  readonly proofShapes: readonly SemanticProofShape[];
  readonly stages: readonly SemanticStageDeclaration[];
}

const POLICY_SCHEMA = v.strictObject({ policyRef: ref, sourceRequirementRef: ref, sourceBindings,
  scope: ref, realizationMeaning: strings, proofMeaning: strings, unprovedScope: strings,
  closureRule: ref, obligationRef: ref });
const SHAPE_SCHEMA = v.strictObject({ proofShapeRef: ref,
  requiredEvidenceRoles: v.array(v.picklist(["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"])),
  sharedBasis: strings, requiredContent: strings, nativeCarrierBoundary: ref, requirementRef: ref, obligationRef: ref,
  roleContractRefs: v.strictObject({ realization: ref, proof: ref }) });
const SURFACE_SCHEMA = v.strictObject({ kind: ref, requiredContexts: refs, standardsRefs: refs,
  outputContractRefs: refs, constructorRef: ref, rendererRef: ref, proofObligationRefs: refs,
  authoritySlots: v.array(v.strictObject({ authorityKindRef: ref,
    disposition: v.picklist(["normal", "bounded_fallback", "forbidden_routine"]), fallbackPreconditionRefs: refs })) });
const assemblyFields = { ruleRef: ref, graphFunctionRef: ref,
  sectionOrder: v.tuple([v.literal("role"), v.literal("source"), v.literal("obligations"), v.literal("predecessors"),
    v.literal("worksite"), v.literal("evidence"), v.literal("task"), v.literal("response")]),
  proportionalityPolicy: v.literal("declared_semantic_assessment"),
  maxPromptBytes: v.pipe(v.number(), v.integer(), v.minValue(1)) };
const ASSEMBLY_SCHEMA = v.variant("contentPolicy", [
  v.strictObject({ ...assemblyFields, contentPolicy: v.literal("full_source_and_predecessors") }),
  v.strictObject({ ...assemblyFields, contentPolicy: v.literal("role_scoped_worksite"),
    worksiteContentByRole: v.strictObject({ author: v.picklist(["not_required", "current_inventory"]),
      assessor: v.picklist(["not_required", "current_inventory"]) }) }),
]);
const STAGE_SCHEMA = v.strictObject({ declarationRef: ref, graphFunctionRef: ref, authorLocusRef: ref, assessorLocusRef: ref,
  predecessorStageRefs: refs, assetSurface: SURFACE_SCHEMA, purpose: ref, requiredContent: strings,
  rubric: v.pipe(v.array(v.strictObject({ criterionRef: ref, instruction: ref })), v.minLength(1)),
  bodyCapabilities: v.array(v.picklist(["requirement_refinement", "worksite_design", "application_assessment"])),
  assembly: ASSEMBLY_SCHEMA });
export const SEMANTIC_LIFECYCLE_SCHEMA = v.strictObject({ declarationRef: ref, sourceDeclarationRef: ref,
  taskDataDigest: v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/)),
  evaluationDataDigest: v.pipe(v.string(), v.regex(/^sha256:[0-9a-f]{64}$/)),
  proofPolicies: v.array(POLICY_SCHEMA), proofShapes: v.array(SHAPE_SCHEMA), stages: v.pipe(v.array(STAGE_SCHEMA), v.minLength(1)) });
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
export function isSemanticStageDeclaration(value: unknown): value is SemanticStageDeclaration {
  return v.is(STAGE_SCHEMA, value) && value.assembly.graphFunctionRef === value.graphFunctionRef &&
    unique(value.rubric.map(x => x.criterionRef)) && unique(value.predecessorStageRefs) &&
    (!value.bodyCapabilities.includes("worksite_design") || value.assembly.contentPolicy !== "role_scoped_worksite" ||
      (value.assembly.worksiteContentByRole.author === "current_inventory" &&
        value.assembly.worksiteContentByRole.assessor === "current_inventory"));
}
export function isSemanticLifecycleDeclaration(value: unknown): value is SemanticLifecycleDeclaration {
  if (!v.is(SEMANTIC_LIFECYCLE_SCHEMA, value)) return false;
  return unique(value.stages.map(x => x.declarationRef)) && unique(value.stages.map(x => x.graphFunctionRef)) &&
    unique(value.proofPolicies.map(x => x.policyRef)) && unique(value.proofShapes.map(x => x.proofShapeRef)) &&
    value.stages.every((stage, ordinal) => isSemanticStageDeclaration(stage) &&
      unique(stage.rubric.map(x => x.criterionRef)) && unique(stage.predecessorStageRefs) &&
      stage.predecessorStageRefs.every(p => value.stages.slice(0, ordinal).some(s => s.declarationRef === p)) &&
      stage.assetSurface.authoritySlots.every(slot => slot.disposition !== "bounded_fallback" || slot.fallbackPreconditionRefs.length > 0));
}
export function constructSemanticLifecycleDeclaration(value: SemanticLifecycleDeclaration): Readonly<SemanticLifecycleDeclaration> {
  if (!isSemanticLifecycleDeclaration(value)) throw new TypeError("invalid semantic lifecycle declaration");
  return deepFreeze(value);
}

/** A borrowed lifecycle is a declaration dependency, never callable membership. */
export function semanticLifecycleRefForProgram(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>): string | undefined {
  return program.policies["abg.semantic_lifecycle"] ?? publication.semanticLifecycle?.declarationRef ?? publication.semanticJobLifecycle?.declarationRef;
}

export function validSemanticProgramOwners(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>,
  lifecyclePublication: Readonly<ModulePublication>, sourcePublication: Readonly<ModulePublication>): boolean {
  if (lifecyclePublication.semanticJobLifecycle !== undefined)
    return sha256Canonical(sourcePublication as unknown as JsonValue) === sha256Canonical(lifecyclePublication as unknown as JsonValue) &&
      validSemanticJobProgramOwners(publication, program, lifecyclePublication);
  const ref = semanticLifecycleRefForProgram(publication, program);
  return ref !== undefined && lifecyclePublication.semanticLifecycle?.declarationRef === ref &&
    (publication.semanticLifecycle === undefined || publication.semanticLifecycle.declarationRef === ref) &&
    validSemanticLifecyclePublication(lifecyclePublication, sourcePublication);
}


export function validSemanticLifecyclePublication(publication: Readonly<ModulePublication>, sourcePublication?: Readonly<ModulePublication>): boolean {
  if (publication.semanticJobLifecycle !== undefined) return validSemanticJobLifecyclePublication(publication);
  const d = publication.semanticLifecycle;
  if (d === undefined) return !publication.graphFunctions.some(g => g.declarations["abg.semantic_stage"] !== undefined);
  if (!isSemanticLifecycleDeclaration(d)) return false;
  const owner = sourcePublication ?? publication;
  const sources = owner.requirementHandoffs?.filter(x => x.declarationRef === d.sourceDeclarationRef);
  // Publication-local admission checks the stage declarations. An external
  // source is mandatory at the exact Program declaration-closure boundary.
  if (sourcePublication !== undefined && sources?.length !== 1) return false;
  if (sources !== undefined && sources.length !== 1) return false;
  const source = sources?.[0];
  const contracts = new Map<string, ContractDeclaration>(owner.contracts.map(c => [c.contractRef, c]));
  if (source !== undefined && !source.fulfillmentBindings.every(binding => {
    const policy = d.proofPolicies.filter(p => p.policyRef === binding.proofPolicyRef);
    const shape = d.proofShapes.filter(p => p.proofShapeRef === binding.proofShapeRef);
    return binding.realizationContractRef !== null && binding.proofContractRef !== null && policy.length === 1 && shape.length === 1 &&
      policy[0]!.sourceRequirementRef === binding.requirementRef && policy[0]!.obligationRef === binding.obligationRef &&
      shape[0]!.requirementRef === binding.requirementRef && shape[0]!.obligationRef === binding.obligationRef &&
      shape[0]!.roleContractRefs.realization === binding.realizationContractRef && shape[0]!.roleContractRefs.proof === binding.proofContractRef &&
      contracts.get(binding.realizationContractRef)?.contractKind === "output" &&
      contracts.get(binding.realizationContractRef)?.valueKind === "worksite_construction_result" &&
      contracts.get(binding.proofContractRef)?.contractKind === "output" &&
      contracts.get(binding.proofContractRef)?.valueKind === "worksite_command_execution_observation";
  })) return false;
  return d.stages.every(stage => {
    const gs = publication.graphFunctions.filter(g => g.name === stage.graphFunctionRef && g.declarations["abg.semantic_stage"] === stage.declarationRef);
    return gs.length === 1 && gs[0]!.inputs[0] === SEMANTIC_STAGE_IDS.envelopeContractRef &&
      gs[0]!.outputs[0] === SEMANTIC_STAGE_IDS.envelopeContractRef && gs[0]!.effects.length === 0 &&
      (source === undefined || stage.assetSurface.requiredContexts.includes(source.context.contextRef)) &&
      stage.assetSurface.outputContractRefs.length === 1 && stage.assetSurface.outputContractRefs[0] === SEMANTIC_STAGE_IDS.workerContractRef &&
      stage.assetSurface.rendererRef === SEMANTIC_STAGE_IDS.rendererRef && stage.assetSurface.constructorRef === SEMANTIC_STAGE_IDS.constructorRef &&
      (source === undefined || source.fulfillmentBindings.every(b => stage.assetSurface.proofObligationRefs.includes(b.obligationRef)));
  });
}
