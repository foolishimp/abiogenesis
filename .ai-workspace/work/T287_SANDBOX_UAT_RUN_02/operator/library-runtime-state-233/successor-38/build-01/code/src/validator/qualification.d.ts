import { type QualificationResources, type ResolvedQualificationAssessment } from "./qualification_resources.js";
import type { ProbabilisticWorkerRequest } from "../implementation/contracts.js";
import { type ObservedWorksiteCommandExecutionObservation, type WorksiteCommandResult } from "../product/worksite_command_execution.js";
import { type QualificationVerificationSelection, type QualificationVerificationMaterial, type QualificationTestSummary, type QualificationSubjectInventory, type QualificationCoordinate, type QualificationScope, type QualificationRuleCatalog, type NativeRuntimeAssessmentInput, type NativeRuntimeAssessment, type MalformedGtlAssessmentInput, type MalformedGtlAssessment, type QualificationAssessmentInput, type QualificationEmbeddedTask, type QualificationInternedScope, type QualificationAssessmentPlan, type QualificationJudgment, type QualificationNativeBasis, type QualificationRawJudgment, type QualificationConstructionProvenance, type QualificationCoverageCatalog, type QualificationVerdictInput, type ExactCandidateQualification, type QualificationOwnerRuling } from "./qualification_contracts.js";
/** Parse only this frozen reporter protocol. Native admission remains at the
 * proof owner. Incomplete framing never supplies a zero-failure pass. */
export declare function parseQualificationTestReport(command: WorksiteCommandResult, files: readonly string[]): QualificationTestSummary;
/** Pure material construction from an already resolved producer. Callers cannot
 * supply this output to F11; its native join reconstructs it from the Result. */
export declare function constructQualificationVerificationMaterial(input: {
    basis: ExactCandidateQualification<"basis">;
    inventory: QualificationSubjectInventory;
    selection: QualificationVerificationSelection;
    execution: QualificationCoordinate;
    cCall: QualificationCoordinate;
    observation: ObservedWorksiteCommandExecutionObservation;
}): QualificationVerificationMaterial | null;
export declare function isMalformedGtlAssessmentInput(value: unknown): value is MalformedGtlAssessmentInput;
/** Computable case outcomes only; case-set adequacy remains its owning policy. */
export declare function evaluateMalformedGtlAssessment(input: MalformedGtlAssessmentInput, nativeBasis: QualificationNativeBasis): Readonly<MalformedGtlAssessment>;
export declare function isMalformedGtlAssessment(value: unknown): value is MalformedGtlAssessment;
export declare function isNativeRuntimeAssessmentInput(value: unknown): value is NativeRuntimeAssessmentInput;
/** The native owner supplies computed cases; this constructor grants no native truth. */
export declare function constructNativeRuntimeAssessment(input: NativeRuntimeAssessmentInput, nativeBasis: QualificationNativeBasis, cases: NativeRuntimeAssessment["cases"]): Readonly<NativeRuntimeAssessment>;
export declare function isNativeRuntimeAssessment(value: unknown): value is NativeRuntimeAssessment;
/** C over declared sets only. Completeness of the candidate selection and the
 * semantic justification for grouping remain independent scoped J. */
export declare function qualificationScopeCorrespondence(scope: QualificationScope, catalog: QualificationRuleCatalog, catalogDigest: string, normalized?: QualificationInternedScope): readonly string[];
/** Exact declared rule domain; no applicability is inferred by this lookup. */
export declare function qualificationRuleSurfaces(scope: QualificationScope, ruleGroupRef: string): QualificationScope["surfaceGroups"];
export declare function qualificationMaterialMatches(task: QualificationEmbeddedTask, normalized?: QualificationInternedScope): boolean;
/** Completeness is only over explicitly admitted, finite slots; it is not semantic sufficiency. */
export declare function qualificationPlanMatches(plan: QualificationAssessmentPlan): boolean;
export declare function isQualificationAssessmentInput(value: unknown): value is QualificationAssessmentInput;
export declare function establishQualificationAssessment(input: QualificationAssessmentInput, resources?: QualificationResources): ResolvedQualificationAssessment;
export declare function qualificationRawMatches(input: QualificationAssessmentInput, raw: unknown, view?: ResolvedQualificationAssessment): raw is QualificationRawJudgment;
/** Domain rendering is shared at preparation and replay. Required source bytes
 * are quoted data; no caller prompt or desired disposition is interpolated. */
export declare function qualificationWorkerRequest(input: QualificationAssessmentInput, view?: ResolvedQualificationAssessment): Readonly<ProbabilisticWorkerRequest>;
export declare function constructQualificationJudgment(input: QualificationAssessmentInput, raw: unknown, nativeBasis: QualificationNativeBasis, source: QualificationJudgment["source"], view?: ResolvedQualificationAssessment): Readonly<QualificationJudgment>;
/** One native preparation operation borrows the resolved dependency throughout completion and admission. */
export interface PreparedQualificationAssessment {
    readonly input: QualificationAssessmentInput;
    readonly view: ResolvedQualificationAssessment;
    readonly request: Readonly<ProbabilisticWorkerRequest>;
    readonly complete: (raw: unknown, basis: QualificationNativeBasis, source: QualificationJudgment["source"]) => Readonly<QualificationJudgment>;
    readonly matches: (input: unknown, output: unknown) => boolean;
}
export declare function prepareQualificationAssessment(input: QualificationAssessmentInput, resources?: QualificationResources): PreparedQualificationAssessment;
/** F_H candidate relation; actual authority and response admission stay native. */
export declare function qualificationRulingMatches(request: unknown, response: unknown, actingActorRef: string): response is QualificationOwnerRuling;
export declare function isQualificationCoverageCatalog(value: unknown): value is QualificationCoverageCatalog;
/** Exact published coverage data. A caller subset cannot remove obligations. */
export declare function qualificationCoverageIsPublished(value: QualificationCoverageCatalog): boolean;
export declare function isQualificationBasisReady(basis: ExactCandidateQualification<"basis">): boolean;
export declare function isQualificationVerdictInput(value: unknown): value is QualificationVerdictInput;
/** AF22 alone computes qualification from its authenticated whole F11 result.
 * A computable assessment's green value never supplies semantic coverage. */
export declare function reduceExactCandidateQualification(input: QualificationVerdictInput, nativeBasis: QualificationNativeBasis): Readonly<ExactCandidateQualification<"verdict">>;
export declare function projectExternalConstructionAttribution(judgment: QualificationJudgment, plan: QualificationAssessmentPlan, resolvedProvenance?: QualificationConstructionProvenance): Readonly<{
    status: "grounded" | "insufficient" | "invalid";
    authors: readonly string[];
}>;
