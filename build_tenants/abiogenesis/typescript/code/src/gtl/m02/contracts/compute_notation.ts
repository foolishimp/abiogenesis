// Implements: REQ-L-GTL3-GRAPHFUNCTION
// Implements: REQ-L-GTL3-JOB
// Implements: REQ-L-GTL3-COMPUTE-NOTATION
// Implements: REQ-R-ABG3-FN-COMPOSITION

import type {
  GraphFunction,
  GraphVector,
  Regime
} from "../../m01/contracts/carriers.js";
import type { Job } from "./carriers.js";

export type GtlComputeMeans = Regime;

export type GtlCompositionHostSurfaceKind =
  | "graph_function"
  | "graph_vector"
  | "operator"
  | "evaluator"
  | "rule";

export type GtlCompositionDeclarationSourceKind =
  | "graph_vector_declaration"
  | "graph_function_declaration"
  | "operator_declaration"
  | "evaluator_declaration"
  | "rule_declaration"
  | "job_policy_hook"
  | "role_policy_hook"
  | "module_policy_hook"
  | "visible_defaults"
  | "published_template";

export interface GtlCompositionDeclarationSource {
  readonly kind: GtlCompositionDeclarationSourceKind;
  readonly sourceRef: string;
  readonly precedenceRank: number;
}

export interface GtlCompositionHostBinding {
  readonly surfaceKind: GtlCompositionHostSurfaceKind;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string | null;
  readonly sourceNodeRef: string | null;
  readonly targetNodeRef: string | null;
  readonly targetSchemaRef: string | null;
  readonly owningDeclarationRef: string | null;
}

export type GtlCompositionRegimeRole =
  | "construct"
  | "observe"
  | "validate"
  | "gate"
  | "diagnose"
  | "repair"
  | "rank"
  | "escalate"
  | "close"
  | "absentia";

export type GtlCompositionRegimeAuthority =
  | "candidate"
  | "evidence"
  | "judgment"
  | "closure";

export type GtlNonClosureCompositionRegimeAuthority = Exclude<
  GtlCompositionRegimeAuthority,
  "closure"
>;

export type GtlNonClosureCompositionRegimeRole = Exclude<
  GtlCompositionRegimeRole,
  "close"
>;

interface GtlCompositionRegimeBindingBase {
  readonly role: GtlCompositionRegimeRole;
  readonly order: number;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface GtlFdCompositionRegimeBinding
  extends GtlCompositionRegimeBindingBase {
  readonly regime: "F_D";
  readonly authority: GtlCompositionRegimeAuthority;
}

export interface GtlNonFdCompositionRegimeBinding
  extends Omit<GtlCompositionRegimeBindingBase, "role"> {
  readonly regime: "F_P" | "F_H";
  readonly role: GtlNonClosureCompositionRegimeRole;
  readonly authority: GtlNonClosureCompositionRegimeAuthority;
}

export type GtlCompositionRegimeBinding =
  | GtlFdCompositionRegimeBinding
  | GtlNonFdCompositionRegimeBinding;

export interface GtlSelectedCompositionNotation {
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly hostBinding: GtlCompositionHostBinding;
  readonly declarationSource: GtlCompositionDeclarationSource;
  readonly orderedRegimeBindings: readonly GtlCompositionRegimeBinding[];
  readonly standardsContextRefs: readonly string[];
  readonly policyContextRefs: readonly string[];
  readonly carrierContextRefs: readonly string[];
  readonly assuranceContextRefs: readonly string[];
  readonly closureContractRef: string;
  readonly optimizationContractRef: string | null;
}

export interface GtlFunctionCompositionNotation<A, B> {
  readonly graphFunction: GraphFunction;
  readonly job: Job;
  readonly graphVector: GraphVector | null;
  readonly composition: GtlSelectedCompositionNotation;
  readonly inputType?: A;
  readonly outputType?: B;
}

export type GtlStageRole = "transform" | "evaluate" | "consequence";

export interface GtlCandidate<B> {
  readonly kind: "gtl_candidate";
  readonly value: B;
  readonly candidateRef: string;
  readonly evidenceRefs: readonly string[];
  readonly producedByRef: string;
}

export type GtlEvaluationCloseDispositionKind =
  | "close_proposed"
  | "retry_proposed"
  | "reprice_proposed"
  | "block_proposed"
  | "qualified_defer_proposed"
  | "human_required"
  | "no_close";

export interface GtlEvaluationFindingRef {
  readonly kind: "gtl_evaluation_finding_ref";
  readonly findingRef: string;
  readonly evaluatorRef: string;
  readonly hookActionRef: string | null;
  readonly gainReportRef: string | null;
  readonly metricsRef: string | null;
  readonly closeDisposition: GtlEvaluationCloseDispositionKind;
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly diagnosticRefs: readonly string[];
}

export interface GtlEvaluation {
  readonly kind: "gtl_evaluation";
  readonly subjectRef: string;
  readonly candidateRef: string;
  readonly evaluationRef: string;
  readonly findings: readonly GtlEvaluationFindingRef[];
  readonly diagnosticRefs: readonly string[];
}

export interface GtlAdmittedStateRef {
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly eventRefs: readonly string[];
  readonly ledgerRefs: readonly string[];
  readonly projectionRefs: readonly string[];
}

export interface GtlConsequenceProjectionRef {
  readonly consequenceRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly assuranceDecisionRef: string | null;
  readonly traversalTransitionRef: string | null;
  readonly domainReadModelRefs: readonly string[];
}

export type GtlTransformStage<A, B> = (
  subject: GtlFunctionCompositionNotation<A, B>,
  input: A
) => GtlCandidate<B>;

export type GtlEvaluateStage<A, B> = (
  subject: GtlFunctionCompositionNotation<A, B>,
  input: A,
  candidate: GtlCandidate<B>,
  evidenceRefs: readonly string[]
) => readonly GtlEvaluation[];

export type GtlConsequenceStage<A, B> = (
  subject: GtlFunctionCompositionNotation<A, B>,
  admitted: GtlAdmittedStateRef
) => GtlConsequenceProjectionRef;

export interface GtlEpistemicStageSet<A, B> {
  readonly subject: GtlFunctionCompositionNotation<A, B>;
  readonly transform: GtlTransformStage<A, B>;
  readonly evaluate: GtlEvaluateStage<A, B>;
  readonly consequence: GtlConsequenceStage<A, B>;
}
