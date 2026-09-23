import * as v from "valibot";
import type { ModulePublication, GtlProgram, ContractDeclaration } from "./contracts.js";
import { isSemanticStageDeclaration, type SemanticStageDeclaration, type SemanticProofShape } from "./semantic_stage.js";
import { SEMANTIC_STAGE_IDS } from "./semantic_stage_identity.js";
import { deepFreeze } from "../shared/immutable.js";

/** Installed, job-independent constraints. Instances remain admitted values. */
export interface SemanticJobProofTemplate {
  readonly templateRef: string;
  readonly realizationContractRef: string;
  readonly proofContractRef: string;
  readonly requiredEvidenceRoles: SemanticProofShape["requiredEvidenceRoles"];
  readonly sharedBasis: readonly string[];
  readonly requiredContent: readonly string[];
}
export interface SemanticJobLifecycleDeclaration {
  readonly kind: "semantic_job_lifecycle_declaration";
  readonly schemaVersion: "5.0.0";
  readonly declarationRef: string;
  readonly intakeGraphFunctionRef: string;
  readonly sourceRoleRef: string;
  readonly bounds: { readonly maxSourceMembers: number; readonly maxSourceBytes: number;
    readonly maxContextFiles: number; readonly maxContextBytes: number; readonly maxTargets: number; readonly maxCommands: number };
  readonly proofTemplates: readonly SemanticJobProofTemplate[];
  readonly stages: readonly SemanticStageDeclaration[];
}
const ref = v.pipe(v.string(), v.minLength(1));
const positive = v.pipe(v.number(), v.integer(), v.minValue(1));
const refs = v.array(ref);
const template = v.strictObject({ templateRef: ref, realizationContractRef: ref, proofContractRef: ref,
  requiredEvidenceRoles: v.pipe(v.array(v.picklist(["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"])), v.minLength(1)),
  sharedBasis: refs, requiredContent: refs });
export const SEMANTIC_JOB_LIFECYCLE_SCHEMA = v.strictObject({ kind: v.literal("semantic_job_lifecycle_declaration"),
  schemaVersion: v.literal("5.0.0"), declarationRef: ref, intakeGraphFunctionRef: ref, sourceRoleRef: ref,
  bounds: v.strictObject({ maxSourceMembers: positive, maxSourceBytes: positive, maxContextFiles: positive,
    maxContextBytes: positive, maxTargets: positive, maxCommands: positive }),
  proofTemplates: v.pipe(v.array(template), v.minLength(1)),
  stages: v.pipe(v.array(v.custom<SemanticStageDeclaration>(value => isSemanticStageDeclaration(value))), v.minLength(1)) });
const unique = (xs: readonly string[]) => new Set(xs).size === xs.length;
export function isSemanticJobLifecycleDeclaration(value: unknown): value is SemanticJobLifecycleDeclaration {
  return v.is(SEMANTIC_JOB_LIFECYCLE_SCHEMA, value) && unique(value.proofTemplates.map(t => t.templateRef)) &&
    value.proofTemplates.every(t => unique(t.requiredEvidenceRoles) && t.requiredEvidenceRoles.includes("realization") &&
      t.requiredEvidenceRoles.includes("verifier_artifact") && t.requiredEvidenceRoles.includes("verifier_execution") &&
      t.requiredEvidenceRoles.includes("semantic_assessment")) &&
    unique(value.stages.map(s => s.declarationRef)) && unique(value.stages.map(s => s.graphFunctionRef)) &&
    value.stages.every((stage, index) => stage.predecessorStageRefs.every(ref => value.stages.slice(0, index).some(s => s.declarationRef === ref)) &&
      stage.assetSurface.proofObligationRefs.length === 0 && stage.assetSurface.requiredContexts.includes(SEMANTIC_STAGE_IDS.jobSourceContextRoleRef));
}
export function constructSemanticJobLifecycleDeclaration(value: SemanticJobLifecycleDeclaration): Readonly<SemanticJobLifecycleDeclaration> {
  if (!isSemanticJobLifecycleDeclaration(value)) throw new TypeError("invalid generic semantic job lifecycle declaration");
  return deepFreeze(value);
}
export function validSemanticJobLifecyclePublication(publication: Readonly<ModulePublication>,
  contracts?: readonly ContractDeclaration[]): boolean {
  const declaration = publication.semanticJobLifecycle;
  if (declaration === undefined) return !publication.graphFunctions.some(g => g.declarations["abg.semantic_job_intake"] !== undefined);
  if (publication.semanticLifecycle !== undefined || publication.requirementHandoffs !== undefined ||
    !isSemanticJobLifecycleDeclaration(declaration)) return false;
  if (contracts !== undefined && !declaration.proofTemplates.every(t =>
    contracts.filter(c => c.contractRef === t.realizationContractRef && c.contractKind === "output" && c.valueKind === "worksite_construction_result").length === 1 &&
    contracts.filter(c => c.contractRef === t.proofContractRef && c.contractKind === "output" && c.valueKind === "worksite_command_execution_observation").length === 1)) return false;
  const intake = publication.graphFunctions.filter(g => g.name === declaration.intakeGraphFunctionRef &&
    g.declarations["abg.semantic_job_intake"] === declaration.declarationRef && g.inputs.length === 1 &&
    g.inputs[0] === SEMANTIC_STAGE_IDS.jobInputContractRef && g.outputs.length === 1 &&
    g.outputs[0] === SEMANTIC_STAGE_IDS.envelopeContractRef && g.effects.length === 0);
  return intake.length === 1 && declaration.stages.every(stage => publication.graphFunctions.filter(g =>
    g.name === stage.graphFunctionRef && g.declarations["abg.semantic_stage"] === stage.declarationRef &&
    g.inputs.length === 1 && g.inputs[0] === SEMANTIC_STAGE_IDS.envelopeContractRef &&
    g.outputs.length === 1 && g.outputs[0] === SEMANTIC_STAGE_IDS.envelopeContractRef && g.effects.length === 0).length === 1);
}
export function validSemanticJobProgramOwners(publication: Readonly<ModulePublication>, program: Readonly<GtlProgram>,
  owner: Readonly<ModulePublication>, contracts?: readonly ContractDeclaration[]): boolean {
  return owner.semanticJobLifecycle !== undefined &&
    (program.policies["abg.semantic_lifecycle"] ?? publication.semanticJobLifecycle?.declarationRef) === owner.semanticJobLifecycle.declarationRef &&
    validSemanticJobLifecyclePublication(owner, contracts);
}
