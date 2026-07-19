// Implements: T-280; REQ-R-ABG3-FP-CONSCIOUSNESS-002A..007, 011E.
// The four semantic meanings remain distinct. Their execution authority stays
// in the admitted GTL, traversal-result, and complete-C carriers.

import {
  constructConstructionActionCatalogProjection,
  constructConstructionActionRow,
  deriveObservationToActionBindingProjection,
  type ConstructionActionCatalogProjection,
  type ConstructionActionRow
} from "./construction_action_catalog.js";
import type { ConstructionActionKind } from "./construction_action_kinds.js";
import type { ConstructionIntentCandidate } from "./construction_intent.js";
import type {
  AllowedConsequenceTraversalCatalog,
  AllowedConsequenceTraversalRow
} from "./allowed_consequence_traversal_catalog.js";
import type { AdmittedOutputAuthorityProjection } from "./payload_ledger.js";
import type {
  ConstructionObservationSnapshot,
  ObservationPressureRow
} from "./construction_observation.js";
import {
  deriveConstructionPriorityProjection,
  type AffectPriorityPolicy,
  type ConstructionPriorityProjection,
  type ConstructionPriorityScheme
} from "./construction_priority.js";
import {
  deriveRegistrySessionView,
  type AdmittedRuntimeCatalogBasis,
  type RegistrySessionView
} from "./runtime_catalog.js";
import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  assertCurrentObservationBasisProjection,
  type CurrentObservationBasisProjection
} from "./current_observation.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger
} from "./runtime_support.js";
import {
  assertOneSurfaceAuthorityProgramBinding,
  type OneSurfaceAuthorityProgramBinding
} from "./one_surface_program_compiler.js";
import {
  admitOneSurfaceResultValue,
  constructOneSurfaceTypedRefusal,
  isOneSurfaceTypedRefusal,
  type OneSurfaceTypedRefusal,
  type OneSurfaceResultValueByKind
} from "./one_surface_contract_family.js";

export const ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES = Object.freeze([
  "synthesize_model",
  "eval_gap",
  "evaluate_next",
  "evaluate_action"
] as const);

export type OneSurfaceAuthorityFunctionKind =
  (typeof ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES)[number];

function sameStringRefs(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return stableSha256Digest([...left].sort()) ===
    stableSha256Digest([...right].sort());
}

export interface OneSurfaceRefDigest {
  readonly ref: string;
  readonly digest: string;
}

export interface OneSurfaceAuthorityInputBasis<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly kind: "one_surface_authority_input_basis";
  readonly functionKind: K;
  readonly inputRefs: readonly string[];
  readonly inputDigest: `sha256:${string}`;
}

export interface AdmittedOneSurfaceAuthorityResult<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly kind: "admitted_one_surface_authority_result";
  readonly functionKind: K;
  readonly resultRef: string;
  readonly resultDigest: `sha256:${string}`;
  readonly stageAuthorityRef: string;
  readonly stageAuthorityDigest: string;
  readonly replayBindingRef: string;
  readonly replayBindingDigest: `sha256:${string}`;
  readonly cCallRef: string;
  readonly authoritySnapshotRef: string;
  readonly inputDigest: string;
  readonly admittedOutput: AdmittedOutputAuthorityProjection;
  readonly targetCarrierValidationRef: string;
  readonly decodedValueDigest: `sha256:${string}`;
  readonly decodedValue: unknown;
}

function authorityResultBasis(
  result: Omit<
    AdmittedOneSurfaceAuthorityResult,
    "kind" | "resultRef" | "resultDigest" | "decodedValue"
  >
) {
  return Object.freeze({
    functionKind: result.functionKind,
    stageAuthorityRef: result.stageAuthorityRef,
    stageAuthorityDigest: result.stageAuthorityDigest,
    replayBindingRef: result.replayBindingRef,
    replayBindingDigest: result.replayBindingDigest,
    cCallRef: result.cCallRef,
    authoritySnapshotRef: result.authoritySnapshotRef,
    inputDigest: result.inputDigest,
    admittedOutputProjectionRef: result.admittedOutput.projectionRef,
    payloadRef: result.admittedOutput.payloadRef,
    payloadDigest: result.admittedOutput.payloadDigest,
    targetCarrierContractRef: result.admittedOutput.targetCarrierContractRef,
    targetCarrierContractDigest:
      result.admittedOutput.targetCarrierContractDigest,
    targetCarrierValidationRef: result.targetCarrierValidationRef,
    decodedValueDigest: result.decodedValueDigest
  });
}

export function constructAdmittedOneSurfaceAuthorityResult<
  K extends OneSurfaceAuthorityFunctionKind
>(input: Omit<
  AdmittedOneSurfaceAuthorityResult<K>,
  "kind" | "resultRef" | "resultDigest"
>): AdmittedOneSurfaceAuthorityResult<K> {
  const resultDigest = stableSha256Digest(authorityResultBasis(input));
  const result: AdmittedOneSurfaceAuthorityResult<K> = Object.freeze({
    kind: "admitted_one_surface_authority_result" as const,
    ...input,
    resultRef:
      `abg://one-surface/result/${input.functionKind}/` +
      resultDigest.slice("sha256:".length),
    resultDigest
  });
  assertAdmittedOneSurfaceAuthorityResult(result);
  return result;
}

export function assertAdmittedOneSurfaceAuthorityResult(
  result: AdmittedOneSurfaceAuthorityResult
): void {
  assertNonEmptyString(
    result.authoritySnapshotRef,
    "AdmittedOneSurfaceAuthorityResult.authoritySnapshotRef"
  );
  const resultDigest = stableSha256Digest(authorityResultBasis(result));
  if (
    result.kind !== "admitted_one_surface_authority_result" ||
    result.admittedOutput.status !== "admitted" ||
    result.admittedOutput.authorityRef !== result.authoritySnapshotRef ||
    result.admittedOutput.inputDigest !== result.inputDigest ||
    stableSha256Digest(result.decodedValue) !== result.decodedValueDigest ||
    result.resultDigest !== resultDigest ||
    result.resultRef !==
      `abg://one-surface/result/${result.functionKind}/` +
        resultDigest.slice("sha256:".length)
  ) {
    throw new TypeError("One Surface authority result seal differs");
  }
}

function uniqueNonEmpty(values: readonly string[], label: string): readonly string[] {
  const result = [...new Set(values)].sort();
  if (result.length !== values.length) {
    throw new TypeError(`${label} must not contain duplicate values`);
  }
  result.forEach((value, index) =>
    assertNonEmptyString(value, `${label}[${String(index)}]`)
  );
  return Object.freeze(result);
}

export function constructOneSurfaceAuthorityInputBasis<
  K extends OneSurfaceAuthorityFunctionKind
>(input: {
  readonly functionKind: K;
  readonly inputRefs: readonly string[];
  readonly inputValue: unknown;
}): OneSurfaceAuthorityInputBasis<K> {
  input.inputRefs.forEach((value, index) =>
    assertNonEmptyString(value, `${input.functionKind}.inputRefs[${String(index)}]`)
  );
  const inputRefs = Object.freeze([...new Set(input.inputRefs)].sort());
  if (inputRefs.length !== input.inputRefs.length) {
    throw new TypeError(`${input.functionKind}.inputRefs must not contain duplicates`);
  }
  if (inputRefs.length === 0) {
    throw new TypeError(`${input.functionKind} requires an exact input basis`);
  }
  return Object.freeze({
    kind: "one_surface_authority_input_basis",
    functionKind: input.functionKind,
    inputRefs,
    inputDigest: stableSha256Digest({
      functionKind: input.functionKind,
      inputRefs,
      inputValue: input.inputValue
    })
  });
}

export interface ProductAssetModel {
  readonly kind: "product_asset_model";
  readonly modelRef: string;
  readonly modelDigest: `sha256:${string}`;
  readonly version: number;
  readonly basisDigest: string;
  readonly intentLineageRef: string;
  readonly priorModelRef: string | null;
  readonly admittedProgram: OneSurfaceRefDigest;
  readonly authorityResult: OneSurfaceRefDigest;
  readonly admittedProductTruthRefs: readonly string[];
  readonly desiredAssetRefs: readonly string[];
  readonly knownAssetRefs: readonly string[];
}

export function constructProductAssetModel(input: {
  readonly intentLineageRef: string;
  readonly priorModel: ProductAssetModel | null;
  readonly admittedProgram: OneSurfaceRefDigest;
  readonly authorityResult: OneSurfaceRefDigest;
  readonly admittedProductTruthRefs: readonly string[];
  readonly desiredAssetRefs: readonly string[];
  readonly knownAssetRefs: readonly string[];
}): ProductAssetModel {
  assertNonEmptyString(input.intentLineageRef, "ProductAssetModel.intentLineageRef");
  if (input.priorModel !== null) {
    assertProductAssetModel(input.priorModel);
    if (input.priorModel.intentLineageRef !== input.intentLineageRef) {
      throw new TypeError("ProductAssetModel prior lineage differs");
    }
  }
  [
    input.admittedProgram.ref,
    input.admittedProgram.digest,
    input.authorityResult.ref,
    input.authorityResult.digest
  ].forEach((value, index) =>
    assertNonEmptyString(value, `ProductAssetModel.authority[${String(index)}]`)
  );
  const admittedProductTruthRefs = uniqueNonEmpty(
    input.admittedProductTruthRefs,
    "ProductAssetModel.admittedProductTruthRefs"
  );
  if (admittedProductTruthRefs.length === 0) {
    throw new TypeError("ProductAssetModel requires admitted product truth");
  }
  const desiredAssetRefs = uniqueNonEmpty(
    input.desiredAssetRefs,
    "ProductAssetModel.desiredAssetRefs"
  );
  const knownAssetRefs = uniqueNonEmpty(
    input.knownAssetRefs,
    "ProductAssetModel.knownAssetRefs"
  );
  const version = (input.priorModel?.version ?? -1) + 1;
  const basis = Object.freeze({
    intentLineageRef: input.intentLineageRef,
    priorModelRef: input.priorModel?.modelRef ?? null,
    admittedProgram: input.admittedProgram,
    authorityResult: input.authorityResult,
    admittedProductTruthRefs
  });
  const basisDigest = stableSha256Digest(basis);
  const modelBasis = Object.freeze({
    basisDigest,
    version,
    desiredAssetRefs,
    knownAssetRefs
  });
  const modelDigest = stableSha256Digest(modelBasis);
  return Object.freeze({
    kind: "product_asset_model",
    modelRef: `abg://one-surface/model/${modelDigest.slice("sha256:".length)}`,
    modelDigest,
    version,
    basisDigest,
    intentLineageRef: input.intentLineageRef,
    priorModelRef: input.priorModel?.modelRef ?? null,
    admittedProgram: input.admittedProgram,
    authorityResult: input.authorityResult,
    admittedProductTruthRefs,
    desiredAssetRefs,
    knownAssetRefs
  });
}

export type OneSurfaceObservationSnapshot = ConstructionObservationSnapshot;
export type GapPressureRow = ObservationPressureRow;
export type ActionCatalog = ConstructionActionCatalogProjection;
export type PriorityProjection = ConstructionPriorityProjection;

export interface OneSurfaceProgramGraphFunctionMember {
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
}

export interface OneSurfaceProgramMemberProjection {
  readonly kind: "one_surface_program_member_projection";
  readonly projectionRef: string;
  readonly projectionDigest: `sha256:${string}`;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly graphFunctions: readonly OneSurfaceProgramGraphFunctionMember[];
}

function oneSurfaceProgramMemberProjectionBasis(input: {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly graphFunctions: readonly OneSurfaceProgramGraphFunctionMember[];
}) {
  return Object.freeze({
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    graphFunctions: input.graphFunctions
  });
}

export function constructOneSurfaceProgramMemberProjection(input: {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly graphFunctions: readonly OneSurfaceProgramGraphFunctionMember[];
}): OneSurfaceProgramMemberProjection {
  assertNonEmptyString(input.admittedProgramRef, "program member admittedProgramRef");
  assertNonEmptyString(
    input.admittedProgramDigest,
    "program member admittedProgramDigest"
  );
  if (!/^sha256:[0-9a-f]{64}$/u.test(input.admittedProgramDigest)) {
    throw new TypeError("program member admittedProgramDigest must be sha256");
  }
  const refs = uniqueNonEmpty(
    input.graphFunctions.map((row) => row.graphFunctionRef),
    "program member graphFunctionRefs"
  );
  if (refs.length === 0) {
    throw new TypeError("program member projection requires one GraphFunction");
  }
  const byRef = new Map(
    input.graphFunctions.map((row) => [row.graphFunctionRef, row])
  );
  const graphFunctions = Object.freeze(refs.map((graphFunctionRef) => {
    const row = byRef.get(graphFunctionRef)!;
    assertNonEmptyString(
      row.graphFunctionDigest,
      `program member ${graphFunctionRef} digest`
    );
    if (!/^sha256:[0-9a-f]{64}$/u.test(row.graphFunctionDigest)) {
      throw new TypeError(
        `program member ${graphFunctionRef} digest must be sha256`
      );
    }
    return Object.freeze({
      graphFunctionRef,
      graphFunctionDigest: row.graphFunctionDigest
    });
  }));
  const basis = oneSurfaceProgramMemberProjectionBasis({
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    graphFunctions
  });
  const projectionDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "one_surface_program_member_projection",
    projectionRef:
      `abg://one-surface/program-members/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
    ...basis
  });
}

export function assertOneSurfaceProgramMemberProjection(
  projection: OneSurfaceProgramMemberProjection
): void {
  const reconstructed = constructOneSurfaceProgramMemberProjection({
    admittedProgramRef: projection.admittedProgramRef,
    admittedProgramDigest: projection.admittedProgramDigest,
    graphFunctions: projection.graphFunctions
  });
  if (
    projection.kind !== reconstructed.kind ||
    projection.projectionRef !== reconstructed.projectionRef ||
    projection.projectionDigest !== reconstructed.projectionDigest
  ) {
    throw new TypeError("One Surface program member projection seal differs");
  }
}

export function deriveOneSurfaceTargetOutcomeRef(input: {
  readonly allowedRowRef: string;
  readonly actionKind: ConstructionActionKind;
}): string {
  assertNonEmptyString(input.allowedRowRef, "One Surface allowed row ref");
  return `abg://one-surface/outcome/${input.allowedRowRef}/${input.actionKind}`;
}

function actionRowsForAllowedConsequence(
  row: AllowedConsequenceTraversalRow,
  programMembers: OneSurfaceProgramMemberProjection
): readonly ConstructionActionRow[] | null {
  const rows: ConstructionActionRow[] = [];
  for (const actionKind of row.allowedActionKinds) {
    if (actionKind === "non_admit") {
      return null;
    }
    const graphFunctionRefs = actionKind === "invoke_graph_function" ||
        actionKind === "continue_graph_call" ||
        actionKind === "repair_same_edge" ||
        actionKind === "reenter_graph_span"
      ? (row.allowedGraphFunctionRefs.length === 0
          ? programMembers.graphFunctions.map((member) => member.graphFunctionRef)
          : row.allowedGraphFunctionRefs.filter((graphFunctionRef) =>
              programMembers.graphFunctions.some(
                (member) => member.graphFunctionRef === graphFunctionRef
              )
            ))
      : actionKind === "invoke_prior_vector" ||
          actionKind === "invoke_later_vector"
        ? [row.graphFunctionRef]
      : [null];
    const traversalTargetRefs = actionKind === "reenter_graph_span" ||
        actionKind === "invoke_prior_vector" ||
        actionKind === "invoke_later_vector"
      ? row.allowedTraversalTargetRefs.length === 0
        ? []
        : row.allowedTraversalTargetRefs
      : [null];
    if (traversalTargetRefs.length === 0) {
      return null;
    }
    for (const graphFunctionRef of graphFunctionRefs) {
      for (const traversalTargetRef of traversalTargetRefs) {
        const basis = Object.freeze({
          rowRef: row.rowRef,
          actionKind,
          graphFunctionRef,
          traversalTargetRef,
          inputAssetRefs: row.inputAssetRefs,
          expectedOutputAssetRefs: row.expectedOutputAssetRefs
        });
        const actionDigest = stableSha256Digest(basis);
        rows.push(constructConstructionActionRow({
          actionRef:
            `abg://one-surface/action/${actionDigest.slice("sha256:".length)}`,
          actionKind,
          graphFunctionRef,
          graphVectorRef:
            actionKind === "reenter_graph_span" ||
            actionKind === "invoke_prior_vector" ||
            actionKind === "invoke_later_vector"
              ? row.graphVectorRef
              : null,
          publishedTraversalTargetRef: traversalTargetRef,
          targetOutcomeRef: deriveOneSurfaceTargetOutcomeRef({
            allowedRowRef: row.rowRef,
            actionKind
          }),
          inputAssetRefs: row.inputAssetRefs,
          expectedOutputAssetRefs: row.expectedOutputAssetRefs,
          requiredAuthorityRefs: [
            ...row.requiredAuthorityRefs,
            ...row.declarationSourceRefs,
            programMembers.projectionRef,
            programMembers.projectionDigest
          ],
          eligibleReasonRefs: [row.rowRef],
          hookSourceRefs: row.declarationSourceRefs,
          defaultPolicyRefs: row.proportionalityBasisRefs
        }));
      }
    }
  }
  return Object.freeze(rows);
}

export function deriveProgramActionCatalog(input: {
  readonly episodeId: string;
  readonly allowedCatalog: AllowedConsequenceTraversalCatalog;
  readonly catalogView: RegistrySessionView;
  readonly programMembers: OneSurfaceProgramMemberProjection;
}): ConstructionActionCatalogProjection | OneSurfaceTypedRefusal<"evaluate_next"> {
  assertOneSurfaceProgramMemberProjection(input.programMembers);
  const rows: ConstructionActionRow[] = [];
  for (const allowedRow of input.allowedCatalog.rows) {
    const projected = actionRowsForAllowedConsequence(
      allowedRow,
      input.programMembers
    );
    if (projected === null) {
      return constructOneSurfaceTypedRefusal({
        functionKind: "evaluate_next",
        judgment: "blocked",
        reasonRefs: [
          `one_surface_semantic_not_realized:action_catalog:${allowedRow.rowRef}`
        ]
      });
    }
    rows.push(...projected);
  }
  const visibleGraphFunctionRefs = new Set(
    input.catalogView.entries.flatMap((entry) =>
      entry.kind === "registry_session_graph_function_entry"
        ? [entry.entryRef, entry.declarationRef, entry.graphFunctionRef]
        : []
    )
  );
  const visibleRows = rows.filter((row) =>
    row.graphFunctionRef === null ||
    visibleGraphFunctionRefs.has(row.graphFunctionRef)
  );
  const defaultPolicyRefs = [...new Set(
    visibleRows.flatMap((row) => row.defaultPolicyRefs)
  )].sort();
  const catalogConfigDigest = stableSha256Digest({
    allowedCatalogRef: input.allowedCatalog.catalogRef,
    programMemberProjectionRef: input.programMembers.projectionRef,
    programMemberProjectionDigest: input.programMembers.projectionDigest,
    defaultPolicyRefs
  });
  const catalogDigest = stableSha256Digest({
    allowedCatalogRef: input.allowedCatalog.catalogRef,
    programMemberProjectionRef: input.programMembers.projectionRef,
    programMemberProjectionDigest: input.programMembers.projectionDigest,
    catalogViewRef: input.catalogView.sessionViewRef,
    catalogProjectionRef: input.catalogView.catalogProjectionRef,
    actionRefs: visibleRows.map((row) => row.actionRef)
  });
  return constructConstructionActionCatalogProjection({
    catalogRef:
      `abg://one-surface/action-catalog/${catalogDigest.slice("sha256:".length)}`,
    episodeId: input.episodeId,
    hookResolutionRef: input.allowedCatalog.catalogRef,
    fallbackConfigDigest: catalogConfigDigest,
    rows: visibleRows
  });
}

export interface TargetObligationBinding {
  readonly kind: "target_obligation_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly snapshotRef: string;
  readonly snapshotDigest: `sha256:${string}`;
  readonly sourceBindingRef: string;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly obligationRefs: readonly string[];
  readonly requiredEvidenceAuthorityRefs: readonly string[];
}

function targetObligationBindingBasis(input: Omit<
  TargetObligationBinding,
  "kind" | "bindingRef" | "bindingDigest"
>) {
  return Object.freeze({
    snapshotRef: input.snapshotRef,
    snapshotDigest: input.snapshotDigest,
    sourceBindingRef: input.sourceBindingRef,
    pressureRef: input.pressureRef,
    actionRef: input.actionRef,
    targetOutcomeRef: input.targetOutcomeRef,
    obligationRefs: input.obligationRefs,
    requiredEvidenceAuthorityRefs: input.requiredEvidenceAuthorityRefs
  });
}

export function constructTargetObligationBinding(input: {
  readonly snapshotRef: string;
  readonly snapshotDigest: `sha256:${string}`;
  readonly sourceBindingRef: string;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly obligationRefs: readonly string[];
  readonly requiredEvidenceAuthorityRefs: readonly string[];
}): TargetObligationBinding {
  const basis = targetObligationBindingBasis({
    snapshotRef: input.snapshotRef,
    snapshotDigest: input.snapshotDigest,
    sourceBindingRef: input.sourceBindingRef,
    pressureRef: input.pressureRef,
    actionRef: input.actionRef,
    targetOutcomeRef: input.targetOutcomeRef,
    obligationRefs: uniqueNonEmpty(input.obligationRefs, "obligationRefs"),
    requiredEvidenceAuthorityRefs: uniqueNonEmpty(
      input.requiredEvidenceAuthorityRefs,
      "requiredEvidenceAuthorityRefs"
    )
  });
  assertNonEmptyString(basis.snapshotRef, "snapshotRef");
  assertNonEmptyString(basis.snapshotDigest, "snapshotDigest");
  assertNonEmptyString(basis.sourceBindingRef, "sourceBindingRef");
  assertNonEmptyString(basis.pressureRef, "pressureRef");
  assertNonEmptyString(basis.actionRef, "actionRef");
  assertNonEmptyString(basis.targetOutcomeRef, "targetOutcomeRef");
  if (
    basis.obligationRefs.length === 0 ||
    basis.requiredEvidenceAuthorityRefs.length === 0
  ) {
    throw new TypeError("target obligation binding is incomplete");
  }
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "target_obligation_binding",
    bindingRef:
      `abg://one-surface/target-binding/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest,
    ...basis
  });
}

export function assertTargetObligationBinding(
  binding: TargetObligationBinding
): void {
  const expected = constructTargetObligationBinding(binding);
  if (
    binding.kind !== "target_obligation_binding" ||
    binding.bindingRef !== expected.bindingRef ||
    binding.bindingDigest !== expected.bindingDigest
  ) {
    throw new TypeError("TargetObligationBinding seal differs");
  }
}

export const NEXT_ACTION_BASIS_KIND_VALUES = Object.freeze([
  "initial_selection",
  "post_yield_resume",
  "post_close_graph_continuation",
  "post_retry",
  "post_repair",
  "post_reenter",
  "post_reprice",
  "post_block"
] as const);

export type NextActionBasisKind = (typeof NEXT_ACTION_BASIS_KIND_VALUES)[number];

export interface NextActionBasis {
  readonly kind: "next_action_basis";
  readonly basisKind: NextActionBasisKind;
  readonly causalRefs: readonly string[];
  readonly basisDigest: `sha256:${string}`;
}

export function constructNextActionBasis(input: {
  readonly basisKind: NextActionBasisKind;
  readonly causalRefs: readonly string[];
}): NextActionBasis {
  if (!NEXT_ACTION_BASIS_KIND_VALUES.includes(input.basisKind)) {
    throw new TypeError("unsupported next-action basis");
  }
  const causalRefs = uniqueNonEmpty(input.causalRefs, "causalRefs");
  if (causalRefs.length === 0) {
    throw new TypeError("next-action basis requires causal refs");
  }
  const basis = Object.freeze({ basisKind: input.basisKind, causalRefs });
  return Object.freeze({
    kind: "next_action_basis",
    ...basis,
    basisDigest: stableSha256Digest(basis)
  });
}

export function assertNextActionBasis(basis: NextActionBasis): void {
  const expected = constructNextActionBasis(basis);
  if (
    basis.kind !== "next_action_basis" ||
    basis.basisDigest !== expected.basisDigest
  ) {
    throw new TypeError("NextActionBasis seal differs");
  }
}

export type AF14SelectionDisposition =
  | {
      readonly variant:
        | "callable_member_action"
        | "internal_vector_action"
        | "refinement_reentry_action";
      readonly actionKind: ConstructionActionKind;
      readonly actionRef: string;
      readonly targetRef: string;
    }
  | {
      readonly variant: "repair_action";
      readonly actionKind: "repair_same_edge";
      readonly actionRef: string;
      readonly targetRef: null;
    }
  | {
      readonly variant:
        | "continue_current_intent"
        | "fh_outcome"
        | "ticket_outcome"
        | "reprice_outcome"
        | "terminal_outcome";
      readonly actionKind: ConstructionActionKind;
      readonly actionRef: string;
      readonly targetRef: null;
    }
  | {
      readonly variant: "no_action";
      readonly actionKind: null;
      readonly actionRef: null;
      readonly targetRef: null;
    };

export interface NextActionProjection {
  readonly kind: "next_action_projection";
  readonly projectionRef: string;
  readonly projectionDigest: `sha256:${string}`;
  readonly nextBasis: NextActionBasis;
  readonly admittedProgram: OneSurfaceRefDigest;
  readonly authorityResult: OneSurfaceRefDigest;
  readonly catalogView: OneSurfaceRefDigest;
  readonly observationRef: string;
  readonly currentObservationRef: string;
  readonly currentObservationDigest: `sha256:${string}`;
  readonly actionCatalogRef: string;
  readonly bindingProjectionRef: string;
  readonly priorityProjectionRef: string;
  readonly selectedBindingRef: string | null;
  readonly selectedOutcomeRef: string | null;
  readonly intentCandidate: ConstructionIntentCandidate | null;
  readonly targetBindings: readonly TargetObligationBinding[];
  readonly disposition: AF14SelectionDisposition;
}

function nextActionProjectionBasis(input: Omit<
  NextActionProjection,
  "kind" | "projectionRef" | "projectionDigest" | "targetBindings"
> & { readonly targetBindingDigests: readonly string[] }
) {
  return Object.freeze({
    nextBasis: input.nextBasis,
    admittedProgramRef: input.admittedProgram.ref,
    admittedProgramDigest: input.admittedProgram.digest,
    authorityResultRef: input.authorityResult.ref,
    authorityResultDigest: input.authorityResult.digest,
    catalogView: input.catalogView,
    observationRef: input.observationRef,
    currentObservationRef: input.currentObservationRef,
    currentObservationDigest: input.currentObservationDigest,
    actionCatalogRef: input.actionCatalogRef,
    bindingProjectionRef: input.bindingProjectionRef,
    priorityProjectionRef: input.priorityProjectionRef,
    selectedBindingRef: input.selectedBindingRef,
    selectedOutcomeRef: input.selectedOutcomeRef,
    intentCandidate: input.intentCandidate,
    targetBindingDigests: input.targetBindingDigests,
    disposition: input.disposition
  });
}

export function assertNextActionProjection(
  projection: NextActionProjection
): void {
  assertNextActionBasis(projection.nextBasis);
  projection.targetBindings.forEach(assertTargetObligationBinding);
  const sourceBindingRefs = projection.targetBindings.map(
    (binding) => binding.sourceBindingRef
  );
  if (new Set(sourceBindingRefs).size !== sourceBindingRefs.length) {
    throw new TypeError("NextActionProjection target binding authority is ambiguous");
  }
  if (
    projection.targetBindings.some(
      (binding) => binding.snapshotRef !== projection.observationRef
    ) ||
    new Set(
      projection.targetBindings.map((binding) => binding.snapshotDigest)
    ).size > 1
  ) {
    throw new TypeError("NextActionProjection observation authority differs");
  }
  [
    projection.admittedProgram.ref,
    projection.admittedProgram.digest,
    projection.authorityResult.ref,
    projection.authorityResult.digest,
    projection.catalogView.ref,
    projection.catalogView.digest,
    projection.observationRef,
    projection.currentObservationRef,
    projection.currentObservationDigest,
    projection.actionCatalogRef,
    projection.bindingProjectionRef,
    projection.priorityProjectionRef
  ].forEach((value, index) =>
    assertNonEmptyString(value, `NextActionProjection.authority[${String(index)}]`)
  );
  const noSelection = projection.selectedBindingRef === null;
  if (
    noSelection !== (projection.selectedOutcomeRef === null) ||
    noSelection !== (projection.disposition.actionRef === null) ||
    (projection.intentCandidate !== null &&
      (projection.disposition.actionRef !==
        projection.intentCandidate.selectedActionRef ||
        projection.selectedBindingRef !==
          projection.intentCandidate.selectedBindingRef ||
        projection.selectedOutcomeRef !==
          projection.intentCandidate.selectedOutcomeRef))
  ) {
    throw new TypeError("NextActionProjection selection relation differs");
  }
  if (
    projection.selectedBindingRef !== null &&
    projection.targetBindings.filter(
      (binding) => binding.sourceBindingRef === projection.selectedBindingRef
    ).length !== 1
  ) {
    throw new TypeError("NextActionProjection selected target binding differs");
  }
  const digest = stableSha256Digest(nextActionProjectionBasis({
    ...projection,
    targetBindingDigests: projection.targetBindings.map(
      (binding) => binding.bindingDigest
    )
  }));
  if (
    projection.kind !== "next_action_projection" ||
    projection.projectionDigest !== digest ||
    projection.projectionRef !==
      `abg://one-surface/next/${digest.slice("sha256:".length)}`
  ) {
    throw new TypeError("NextActionProjection seal differs");
  }
}

export interface OneSurfaceTargetObligationInput {
  readonly targetOutcomeRef: string;
  readonly obligationRefs: readonly string[];
  readonly requiredEvidenceAuthorityRefs: readonly string[];
}

interface NormalizedEvaluateNextInputs {
  readonly allowedEntryRefs: readonly string[] | undefined;
  readonly availableInputRefs: readonly string[] | undefined;
  readonly affectPolicies: readonly AffectPriorityPolicy[] | undefined;
  readonly targetObligations: readonly OneSurfaceTargetObligationInput[];
}

function normalizeEvaluateNextInputs(input: {
  readonly allowedEntryRefs?: readonly string[];
  readonly availableInputRefs?: readonly string[];
  readonly affectPolicies?: readonly AffectPriorityPolicy[];
  readonly targetObligations: readonly OneSurfaceTargetObligationInput[];
}): NormalizedEvaluateNextInputs {
  const allowedEntryRefs = input.allowedEntryRefs === undefined
    ? undefined
    : uniqueNonEmpty(input.allowedEntryRefs, "evaluate_next.allowedEntryRefs");
  const availableInputRefs = input.availableInputRefs === undefined
    ? undefined
    : uniqueNonEmpty(input.availableInputRefs, "evaluate_next.availableInputRefs");
  const affectPolicies = input.affectPolicies === undefined
    ? undefined
    : Object.freeze([...input.affectPolicies]);
  uniqueNonEmpty(
    input.targetObligations.map((row) => row.targetOutcomeRef),
    "evaluate_next.targetOutcomeRefs"
  );
  const targetObligations = Object.freeze(input.targetObligations
    .map((row) => Object.freeze({
      targetOutcomeRef: row.targetOutcomeRef,
      obligationRefs: uniqueNonEmpty(
        row.obligationRefs,
        `evaluate_next.targetObligations.${row.targetOutcomeRef}.obligationRefs`
      ),
      requiredEvidenceAuthorityRefs: uniqueNonEmpty(
        row.requiredEvidenceAuthorityRefs,
        `evaluate_next.targetObligations.${row.targetOutcomeRef}.requiredEvidenceAuthorityRefs`
      )
    }))
    .sort((left, right) =>
      left.targetOutcomeRef.localeCompare(right.targetOutcomeRef)
    ));
  return Object.freeze({
    allowedEntryRefs,
    availableInputRefs,
    affectPolicies,
    targetObligations
  });
}

function assertEvaluateNextCurrentObservation(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly observation: ConstructionObservationSnapshot;
  readonly currentObservation: CurrentObservationBasisProjection;
}): void {
  assertCurrentObservationBasisProjection(input.currentObservation);
  if (
    input.currentObservation.admittedProgramRef !==
      input.application.admittedProgramRef ||
    input.currentObservation.admittedProgramDigest !==
      input.application.admittedProgramDigest ||
    input.currentObservation.observationId !== input.observation.observationId ||
    input.currentObservation.snapshotDigest !== input.observation.snapshotDigest ||
    input.currentObservation.workspaceBindingRef !== input.observation.basisRef
  ) {
    throw new TypeError("evaluate_next current observation authority differs");
  }
}

export function oneSurfaceEvaluateNextInputBasis(input: {
  readonly nextBasis: NextActionBasis;
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly programMembers: OneSurfaceProgramMemberProjection;
  readonly invocationAuthority: OneSurfaceRefDigest;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly allowedEntryRefs?: readonly string[];
  readonly observation: ConstructionObservationSnapshot;
  readonly currentObservation: CurrentObservationBasisProjection;
  readonly availableInputRefs?: readonly string[];
  readonly priorityScheme: ConstructionPriorityScheme;
  readonly affectPolicies?: readonly AffectPriorityPolicy[];
  readonly targetObligations: readonly OneSurfaceTargetObligationInput[];
}): OneSurfaceAuthorityInputBasis<"evaluate_next"> {
  assertNextActionBasis(input.nextBasis);
  assertOneSurfaceAuthorityProgramBinding(input.application);
  assertOneSurfaceProgramMemberProjection(input.programMembers);
  if (
    input.programMembers.admittedProgramRef !==
      input.application.admittedProgramRef ||
    input.programMembers.admittedProgramDigest !==
      input.application.admittedProgramDigest
  ) {
    throw new TypeError("evaluate_next program member authority differs");
  }
  assertEvaluateNextCurrentObservation(input);
  const {
    allowedEntryRefs,
    availableInputRefs,
    affectPolicies,
    targetObligations
  } = normalizeEvaluateNextInputs(input);
  return constructOneSurfaceAuthorityInputBasis({
    functionKind: "evaluate_next",
    inputRefs: [
      input.application.bindingRef,
      input.application.bindingDigest,
      input.programMembers.projectionRef,
      input.programMembers.projectionDigest,
      input.nextBasis.basisDigest,
      input.invocationAuthority.ref,
      input.invocationAuthority.digest,
      input.catalogBasis.basisRef,
      input.catalogBasis.runtimeCatalogProjectionRef,
      input.catalogBasis.runtimeRegistryProjectionRef,
      input.observation.observationId,
      input.observation.snapshotDigest,
      input.currentObservation.projectionRef,
      input.currentObservation.projectionDigest,
      input.priorityScheme.schemeRef,
      input.priorityScheme.sourcePolicyRef,
      ...(affectPolicies ?? []).flatMap((policy) => [
        policy.policyRef,
        policy.sourcePolicyRef
      ]),
      ...targetObligations.flatMap((row) => [
        row.targetOutcomeRef,
        ...row.obligationRefs,
        ...row.requiredEvidenceAuthorityRefs
      ])
    ],
    inputValue: Object.freeze({
      nextBasis: input.nextBasis,
      programMembers: input.programMembers,
      invocationAuthority: input.invocationAuthority,
      catalogBasis: Object.freeze({
        basisRef: input.catalogBasis.basisRef,
        workspaceId: input.catalogBasis.workspaceId,
        bindingId: input.catalogBasis.bindingId,
        catalogId: input.catalogBasis.catalogId,
        resolvedLockRef: input.catalogBasis.resolvedLockRef,
        runtimeCatalogProjectionRef: input.catalogBasis.runtimeCatalogProjectionRef,
        runtimeRegistryProjectionRef: input.catalogBasis.runtimeRegistryProjectionRef,
        admissionEventRefs: input.catalogBasis.admissionEventRefs
      }),
      allowedEntryRefs: allowedEntryRefs ?? null,
      observationRef: input.observation.observationId,
      observationSnapshotDigest: input.observation.snapshotDigest,
      currentObservationRef: input.currentObservation.projectionRef,
      currentObservationDigest: input.currentObservation.projectionDigest,
      availableInputRefs: availableInputRefs ?? null,
      priorityScheme: input.priorityScheme,
      affectPolicies: affectPolicies ?? [],
      targetObligations
    })
  });
}

export function deriveNextActionProjection(input: {
  readonly nextBasis: NextActionBasis;
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly programMembers: OneSurfaceProgramMemberProjection;
  readonly authorityResult: AdmittedOneSurfaceAuthorityResult<"evaluate_next">;
  readonly invocationAuthority: OneSurfaceRefDigest;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly allowedEntryRefs?: readonly string[];
  readonly observation: ConstructionObservationSnapshot;
  readonly currentObservation: CurrentObservationBasisProjection;
  readonly availableInputRefs?: readonly string[];
  readonly priorityScheme: ConstructionPriorityScheme;
  readonly affectPolicies?: readonly AffectPriorityPolicy[];
  readonly targetObligations: readonly OneSurfaceTargetObligationInput[];
}): NextActionProjection | OneSurfaceTypedRefusal<"evaluate_next"> {
  let stage: OneSurfaceAuthorityProgramBinding["stages"][2];
  let decoded: OneSurfaceResultValueByKind["evaluate_next"];
  try {
    assertOneSurfaceAuthorityProgramBinding(input.application);
    assertOneSurfaceProgramMemberProjection(input.programMembers);
    if (
      input.programMembers.admittedProgramRef !==
        input.application.admittedProgramRef ||
      input.programMembers.admittedProgramDigest !==
        input.application.admittedProgramDigest
    ) {
      throw new TypeError("evaluate_next program member authority differs");
    }
    stage = input.application.stages[2];
    assertNextActionBasis(input.nextBasis);
    assertAdmittedOneSurfaceAuthorityResult(input.authorityResult);
    assertNonEmptyString(
      input.invocationAuthority.ref,
      "evaluate_next.invocationAuthority.ref"
    );
    assertNonEmptyString(
      input.invocationAuthority.digest,
      "evaluate_next.invocationAuthority.digest"
    );
    decoded = admitOneSurfaceResultValue(
      "evaluate_next",
      input.authorityResult.decodedValue
    );
  } catch {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["evaluate_next_result_outside_admitted_program"]
    });
  }
  if (isOneSurfaceTypedRefusal(decoded)) {
    return decoded;
  }
  let normalized: NormalizedEvaluateNextInputs;
  try {
    normalized = normalizeEvaluateNextInputs(input);
  } catch {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["evaluate_next_selector_authority_invalid"]
    });
  }
  try {
    assertEvaluateNextCurrentObservation(input);
  } catch {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["evaluate_next_current_observation_invalid"]
    });
  }
  const inputBasis = oneSurfaceEvaluateNextInputBasis({
    nextBasis: input.nextBasis,
    application: input.application,
    programMembers: input.programMembers,
    invocationAuthority: input.invocationAuthority,
    catalogBasis: input.catalogBasis,
    ...(normalized.allowedEntryRefs === undefined
      ? {}
      : { allowedEntryRefs: normalized.allowedEntryRefs }),
    observation: input.observation,
    currentObservation: input.currentObservation,
    ...(normalized.availableInputRefs === undefined
      ? {}
      : { availableInputRefs: normalized.availableInputRefs }),
    priorityScheme: input.priorityScheme,
    ...(normalized.affectPolicies === undefined
      ? {}
      : { affectPolicies: normalized.affectPolicies }),
    targetObligations: normalized.targetObligations
  });
  const selectedActionRef = decoded.selectedActionRef;
  if (
    input.authorityResult.stageAuthorityRef !== stage.authorityRef ||
    input.authorityResult.stageAuthorityDigest !== stage.authorityDigest ||
    input.authorityResult.functionKind !== "evaluate_next" ||
    input.authorityResult.inputDigest !== inputBasis.inputDigest ||
    !input.nextBasis.causalRefs.includes(input.application.bindingRef) ||
    !input.nextBasis.causalRefs.includes(input.application.bindingDigest) ||
    !input.nextBasis.causalRefs.includes(input.invocationAuthority.ref) ||
    !input.nextBasis.causalRefs.includes(input.invocationAuthority.digest) ||
    !input.nextBasis.causalRefs.includes(
      input.currentObservation.workspaceBindingRef
    ) ||
    !input.nextBasis.causalRefs.includes(
      input.currentObservation.workspaceBindingDigest
    )
  ) {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["evaluate_next_result_outside_admitted_program"]
    });
  }
  const viewResult = deriveRegistrySessionView({
    basis: input.catalogBasis,
    ...(normalized.allowedEntryRefs === undefined
      ? {}
      : { allowedEntryRefs: normalized.allowedEntryRefs })
  });
  if (!viewResult.accepted || viewResult.view === null) {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: viewResult.residuals.map(
        (row) => `catalog_view:${row.reason}:${row.entryRef}`
      )
    });
  }
  const actionCatalog = deriveProgramActionCatalog({
    episodeId: input.observation.episodeId,
    allowedCatalog: stage.allowedConsequenceCatalog,
    catalogView: viewResult.view,
    programMembers: input.programMembers
  });
  if (actionCatalog.kind === "one_surface_typed_refusal") {
    return actionCatalog;
  }
  if (
    input.observation.episodeId !== actionCatalog.episodeId ||
    input.observation.actionCatalogRef !== stage.allowedConsequenceCatalog.catalogRef
  ) {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["action_catalog_basis_outside_admitted_program"]
    });
  }
  const bindingProjection = deriveObservationToActionBindingProjection({
    observation: input.observation,
    actionCatalog,
    ...(normalized.availableInputRefs === undefined
      ? {}
      : { availableInputRefs: normalized.availableInputRefs })
  });
  const obligationByOutcome = new Map(
    normalized.targetObligations.map((row) => [row.targetOutcomeRef, row])
  );
  const targetBindings: TargetObligationBinding[] = [];
  for (const binding of bindingProjection.rows) {
    const obligation = obligationByOutcome.get(binding.targetOutcomeRef);
    if (obligation === undefined) {
      return constructOneSurfaceTypedRefusal({
        functionKind: "evaluate_next",
        judgment: "blocked",
        reasonRefs: [`target_obligation_missing:${binding.targetOutcomeRef}`]
      });
    }
    targetBindings.push(constructTargetObligationBinding({
      snapshotRef: input.observation.observationId,
      snapshotDigest: input.observation.snapshotDigest,
      sourceBindingRef: binding.bindingRef,
      pressureRef: binding.pressureRef,
      actionRef: binding.actionRef,
      targetOutcomeRef: binding.targetOutcomeRef,
      obligationRefs: obligation.obligationRefs,
      requiredEvidenceAuthorityRefs: obligation.requiredEvidenceAuthorityRefs
    }));
  }
  const boundOutcomeRefs = [...new Set(
    bindingProjection.rows.map((row) => row.targetOutcomeRef)
  )].sort();
  const declaredOutcomeRefs = [...obligationByOutcome.keys()].sort();
  if (
    stableSha256Digest(boundOutcomeRefs) !==
      stableSha256Digest(declaredOutcomeRefs)
  ) {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["target_obligation_set_mismatch"]
    });
  }
  const priorityProjection = deriveConstructionPriorityProjection({
    observation: input.observation,
    actionCatalog,
    bindingProjection,
    priorityScheme: input.priorityScheme,
    ...(normalized.affectPolicies === undefined
      ? {}
      : { affectPolicies: normalized.affectPolicies })
  });
  const bindingByRef = new Map(
    bindingProjection.rows.map((row) => [row.bindingRef, row])
  );
  const actionByRef = new Map(actionCatalog.rows.map((row) => [row.actionRef, row]));
  const selectedPriority = priorityProjection.rows.find((row) => {
    const binding = bindingByRef.get(row.bindingRef);
    const action = actionByRef.get(row.actionRef);
    return binding !== undefined && action !== undefined &&
      binding.ineligibleReasonRefs.length === 0 &&
      action.ineligibleReasonRefs.length === 0;
  }) ?? null;
  if (
    (selectedPriority?.actionRef ?? null) !==
      selectedActionRef
  ) {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["evaluate_next_selection_differs_from_total_priority"]
    });
  }
  const selectedAction = selectedPriority === null
    ? null
    : actionByRef.get(selectedPriority.actionRef) ?? null;
  const selectedBinding = selectedPriority === null
    ? null
    : bindingByRef.get(selectedPriority.bindingRef) ?? null;
  const disposition = actionDisposition(selectedAction);
  const intentCandidate = decoded.intentCandidate;
  const effectIntentSelected =
    disposition.variant === "callable_member_action" ||
    disposition.variant === "internal_vector_action" ||
    disposition.variant === "refinement_reentry_action" ||
    disposition.variant === "repair_action";
  if (
    (effectIntentSelected && intentCandidate === null) ||
    (!effectIntentSelected && intentCandidate !== null) ||
    (intentCandidate !== null &&
      (intentCandidate.episodeId !== input.observation.episodeId ||
        intentCandidate.selectedActionRef !== selectedActionRef ||
        intentCandidate.selectedBindingRef !== selectedPriority?.bindingRef ||
        intentCandidate.selectedOutcomeRef !== selectedPriority?.targetOutcomeRef ||
        intentCandidate.rank !== selectedPriority?.rankOrdinal ||
        intentCandidate.valueScore !== selectedPriority?.finalScore ||
        intentCandidate.priorityScore !== selectedPriority?.priorityScore ||
        !sameStringRefs(
          intentCandidate.affectAdjustmentRefs,
          selectedPriority?.affectAdjustmentRefs ?? []
        ) ||
        !sameStringRefs(
          intentCandidate.inputAssetRefs,
          selectedAction?.inputAssetRefs ?? []
        ) ||
        !sameStringRefs(
          intentCandidate.inputAssetRefs,
          selectedBinding?.requiredInputRefs ?? []
        ) ||
        !sameStringRefs(
          intentCandidate.expectedOutputAssetRefs,
          selectedAction?.expectedOutputAssetRefs ?? []
        ) ||
        !sameStringRefs(
          intentCandidate.expectedOutputAssetRefs,
          selectedBinding?.providedOutputRefs ?? []
        )))
  ) {
    return constructOneSurfaceTypedRefusal({
      functionKind: "evaluate_next",
      judgment: "blocked",
      reasonRefs: ["evaluate_next_intent_candidate_differs_from_selection"]
    });
  }
  const catalogView = Object.freeze({
    ref: viewResult.view.sessionViewRef,
    digest: stableSha256Digest(viewResult.view)
  });
  const admittedProgram = Object.freeze({
    ref: input.application.admittedProgramRef,
    digest: input.application.admittedProgramDigest
  });
  const authorityResult = Object.freeze({
    ref: input.authorityResult.resultRef,
    digest: input.authorityResult.resultDigest
  });
  const basis = nextActionProjectionBasis({
    nextBasis: input.nextBasis,
    admittedProgram,
    authorityResult,
    catalogView,
    observationRef: input.observation.observationId,
    currentObservationRef: input.currentObservation.projectionRef,
    currentObservationDigest: input.currentObservation.projectionDigest,
    actionCatalogRef: actionCatalog.catalogRef,
    bindingProjectionRef: bindingProjection.projectionRef,
    priorityProjectionRef: priorityProjection.projectionRef,
    selectedBindingRef: selectedPriority?.bindingRef ?? null,
    selectedOutcomeRef: selectedPriority?.targetOutcomeRef ?? null,
    intentCandidate,
    targetBindingDigests: targetBindings.map((row) => row.bindingDigest),
    disposition
  });
  const projectionDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "next_action_projection",
    projectionRef:
      `abg://one-surface/next/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
    nextBasis: input.nextBasis,
    admittedProgram,
    authorityResult,
    catalogView,
    observationRef: input.observation.observationId,
    currentObservationRef: input.currentObservation.projectionRef,
    currentObservationDigest: input.currentObservation.projectionDigest,
    actionCatalogRef: actionCatalog.catalogRef,
    bindingProjectionRef: bindingProjection.projectionRef,
    priorityProjectionRef: priorityProjection.projectionRef,
    selectedBindingRef: selectedPriority?.bindingRef ?? null,
    selectedOutcomeRef: selectedPriority?.targetOutcomeRef ?? null,
    intentCandidate,
    targetBindings: Object.freeze(targetBindings),
    disposition
  });
}

function actionDisposition(
  action: ConstructionActionRow | null
): AF14SelectionDisposition {
  if (action === null) {
    return Object.freeze({
      variant: "no_action",
      actionKind: null,
      actionRef: null,
      targetRef: null
    });
  }
  switch (action.actionKind) {
    case "invoke_graph_function":
      return Object.freeze({
        variant: "callable_member_action",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: action.graphFunctionRef!
      });
    case "invoke_prior_vector":
    case "invoke_later_vector":
      return Object.freeze({
        variant: "internal_vector_action",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: action.graphVectorRef!
      });
    case "reenter_graph_span":
      return Object.freeze({
        variant: "refinement_reentry_action",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: action.publishedTraversalTargetRef!
      });
    case "repair_same_edge":
      return Object.freeze({
        variant: "repair_action",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: null
      });
    case "continue_graph_call":
      return Object.freeze({
        variant: "continue_current_intent",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: null
      });
    case "open_fh_gate":
      return Object.freeze({
        variant: "fh_outcome",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: null
      });
    case "create_ticket":
      return Object.freeze({
        variant: "ticket_outcome",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: null
      });
    case "propose_reprice":
      return Object.freeze({
        variant: "reprice_outcome",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: null
      });
    case "yield_progress":
    case "close_episode":
    case "block_episode":
      return Object.freeze({
        variant: "terminal_outcome",
        actionKind: action.actionKind,
        actionRef: action.actionRef,
        targetRef: null
      });
  }
}

export const EDGE_CLOSURE_DISPOSITION_VALUES = Object.freeze([
  "close",
  "yield",
  "retry",
  "repair",
  "re-enter",
  "reprice",
  "block"
] as const);

export type EdgeClosureDisposition =
  (typeof EDGE_CLOSURE_DISPOSITION_VALUES)[number];

export interface CompleteAdmittedEvidenceView {
  readonly kind: "complete_admitted_evidence_view";
  readonly viewRef: string;
  readonly viewDigest: `sha256:${string}`;
  readonly intentRef: string;
  readonly invocationEventRef: string;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly executionScope: Readonly<{
    readonly basisId: string;
    readonly graphFunctionId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly vectorIndex: number;
    readonly edge: string;
  }>;
  readonly assuranceSelectionRef: string;
  readonly assuranceContractDigest: string;
  readonly assuranceProjectionRef: string;
  readonly admittedEvidenceProjectionRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly orderedEvidenceDigest: `sha256:${string}`;
}

export interface EdgeFulfillmentLedger {
  readonly kind: "edge_fulfillment_ledger";
  readonly ledgerRef: string;
  readonly ledgerDigest: `sha256:${string}`;
  readonly version: number;
  readonly intentRef: string;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly admittedProgram: OneSurfaceRefDigest;
  readonly authorityResult: OneSurfaceRefDigest;
  readonly closureContractRef: string;
  readonly evidenceViewRef: string;
  readonly evidenceViewDigest: `sha256:${string}`;
  readonly assuranceSelectionRef: string;
  readonly assuranceProjectionRef: string;
  readonly evidenceRefs: readonly string[];
}

export interface EdgeClosureDecision {
  readonly kind: "edge_closure_decision";
  readonly decisionRef: string;
  readonly decisionDigest: `sha256:${string}`;
  readonly ledgerRef: string;
  readonly ledgerDigest: `sha256:${string}`;
  readonly closureContractRef: string;
  readonly assuranceDecisionDigest: `sha256:${string}`;
  readonly disposition: EdgeClosureDisposition;
  readonly reasonRefs: readonly string[];
}

export interface OneSurfaceActionEvaluation {
  readonly kind: "one_surface_action_evaluation";
  readonly evidenceView: CompleteAdmittedEvidenceView;
  readonly ledger: EdgeFulfillmentLedger;
  readonly decision: EdgeClosureDecision;
}

function edgeFulfillmentLedgerBasis(
  ledger: Omit<EdgeFulfillmentLedger, "kind" | "ledgerRef" | "ledgerDigest">
) {
  return Object.freeze({
    version: ledger.version,
    intentRef: ledger.intentRef,
    workspaceBinding: ledger.workspaceBinding,
    admittedProgram: ledger.admittedProgram,
    authorityResult: ledger.authorityResult,
    closureContractRef: ledger.closureContractRef,
    evidenceViewRef: ledger.evidenceViewRef,
    evidenceViewDigest: ledger.evidenceViewDigest,
    assuranceSelectionRef: ledger.assuranceSelectionRef,
    assuranceProjectionRef: ledger.assuranceProjectionRef,
    evidenceRefs: ledger.evidenceRefs
  });
}

export function constructEdgeFulfillmentLedger(input: Omit<
  EdgeFulfillmentLedger,
  "kind" | "ledgerRef" | "ledgerDigest"
>): EdgeFulfillmentLedger {
  assertNonNegativeInteger(input.version, "EdgeFulfillmentLedger.version");
  [
    input.intentRef,
    input.workspaceBinding.ref,
    input.workspaceBinding.digest,
    input.admittedProgram.ref,
    input.admittedProgram.digest,
    input.authorityResult.ref,
    input.authorityResult.digest,
    input.closureContractRef,
    input.evidenceViewRef,
    input.evidenceViewDigest,
    input.assuranceSelectionRef,
    input.assuranceProjectionRef
  ].forEach((value, index) =>
    assertNonEmptyString(value, `EdgeFulfillmentLedger.authority[${String(index)}]`)
  );
  if (new Set(input.evidenceRefs).size !== input.evidenceRefs.length) {
    throw new TypeError("EdgeFulfillmentLedger evidence refs must be unique");
  }
  const evidenceRefs = uniqueNonEmpty(
    input.evidenceRefs,
    "EdgeFulfillmentLedger.evidenceRefs"
  );
  if (evidenceRefs.length === 0) {
    throw new TypeError("EdgeFulfillmentLedger requires admitted evidence");
  }
  const basis = edgeFulfillmentLedgerBasis({ ...input, evidenceRefs });
  const ledgerDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "edge_fulfillment_ledger",
    ledgerRef:
      `abg://one-surface/edge-ledger/${ledgerDigest.slice("sha256:".length)}`,
    ledgerDigest,
    ...basis
  });
}

export function assertEdgeFulfillmentLedger(ledger: EdgeFulfillmentLedger): void {
  const expected = constructEdgeFulfillmentLedger(ledger);
  if (
    ledger.kind !== "edge_fulfillment_ledger" ||
    ledger.ledgerRef !== expected.ledgerRef ||
    ledger.ledgerDigest !== expected.ledgerDigest
  ) {
    throw new TypeError("EdgeFulfillmentLedger seal differs");
  }
}

function edgeClosureDecisionBasis(
  decision: Omit<EdgeClosureDecision, "kind" | "decisionRef" | "decisionDigest">
) {
  return Object.freeze({
    ledgerRef: decision.ledgerRef,
    ledgerDigest: decision.ledgerDigest,
    closureContractRef: decision.closureContractRef,
    assuranceDecisionDigest: decision.assuranceDecisionDigest,
    disposition: decision.disposition,
    reasonRefs: decision.reasonRefs
  });
}

export function constructEdgeClosureDecision(input: Omit<
  EdgeClosureDecision,
  "kind" | "decisionRef" | "decisionDigest"
>): EdgeClosureDecision {
  [
    input.ledgerRef,
    input.ledgerDigest,
    input.closureContractRef,
    input.assuranceDecisionDigest
  ].forEach((value, index) =>
    assertNonEmptyString(value, `EdgeClosureDecision.authority[${String(index)}]`)
  );
  if (!EDGE_CLOSURE_DISPOSITION_VALUES.includes(input.disposition)) {
    throw new TypeError("EdgeClosureDecision disposition differs");
  }
  if (new Set(input.reasonRefs).size !== input.reasonRefs.length) {
    throw new TypeError("EdgeClosureDecision reason refs must be unique");
  }
  const reasonRefs = uniqueNonEmpty(
    input.reasonRefs,
    "EdgeClosureDecision.reasonRefs"
  );
  const basis = edgeClosureDecisionBasis({ ...input, reasonRefs });
  const decisionDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "edge_closure_decision",
    decisionRef:
      `abg://one-surface/edge-decision/${decisionDigest.slice("sha256:".length)}`,
    decisionDigest,
    ...basis
  });
}

export function assertEdgeClosureDecision(decision: EdgeClosureDecision): void {
  const expected = constructEdgeClosureDecision(decision);
  if (
    decision.kind !== "edge_closure_decision" ||
    decision.decisionRef !== expected.decisionRef ||
    decision.decisionDigest !== expected.decisionDigest
  ) {
    throw new TypeError("EdgeClosureDecision seal differs");
  }
}

export function assertProductAssetModel(model: ProductAssetModel): void {
  assertNonNegativeInteger(model.version, "ProductAssetModel.version");
  assertNonEmptyString(model.modelRef, "ProductAssetModel.modelRef");
  assertNonEmptyString(model.modelDigest, "ProductAssetModel.modelDigest");
  assertNonEmptyString(
    model.intentLineageRef,
    "ProductAssetModel.intentLineageRef"
  );
  if (model.priorModelRef !== null) {
    assertNonEmptyString(model.priorModelRef, "ProductAssetModel.priorModelRef");
  }
  [
    model.admittedProgram.ref,
    model.admittedProgram.digest,
    model.authorityResult.ref,
    model.authorityResult.digest
  ].forEach((value, index) =>
    assertNonEmptyString(value, `ProductAssetModel.authority[${String(index)}]`)
  );
  uniqueNonEmpty(
    model.admittedProductTruthRefs,
    "ProductAssetModel.admittedProductTruthRefs"
  );
  if (model.admittedProductTruthRefs.length === 0) {
    throw new TypeError("ProductAssetModel requires admitted product truth");
  }
  uniqueNonEmpty(model.desiredAssetRefs, "ProductAssetModel.desiredAssetRefs");
  uniqueNonEmpty(model.knownAssetRefs, "ProductAssetModel.knownAssetRefs");
  const expectedBasisDigest = stableSha256Digest({
    intentLineageRef: model.intentLineageRef,
    priorModelRef: model.priorModelRef,
    admittedProgram: model.admittedProgram,
    authorityResult: model.authorityResult,
    admittedProductTruthRefs: model.admittedProductTruthRefs
  });
  const expectedModelDigest = stableSha256Digest({
    basisDigest: expectedBasisDigest,
    version: model.version,
    desiredAssetRefs: model.desiredAssetRefs,
    knownAssetRefs: model.knownAssetRefs
  });
  if (
    model.basisDigest !== expectedBasisDigest ||
    model.modelDigest !== expectedModelDigest ||
    model.modelRef !==
      `abg://one-surface/model/${expectedModelDigest.slice("sha256:".length)}`
  ) {
    throw new TypeError("ProductAssetModel seal differs");
  }
}
