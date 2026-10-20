import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type RequirementHandoffOutput } from "./requirement_handoff.js";
import type { RequirementTerm, GtlContractFulfillmentBinding } from "../gtl/requirement_handoff.js";
import type { SemanticLifecycleDeclaration, SemanticStageDeclaration } from "../gtl/semantic_stage.js";
import type { WorkspaceAuthorityBasis, WorkspaceBinding } from "./environment.js";
import type { CapabilityGrant } from "./invocation.js";
import { type WorksiteConstructionTarget } from "./worksite_construction.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import { type WorksiteCommandPreparationInput } from "./worksite_preparation.js";
export interface SemanticSourceQuote {
    readonly memberRef: string;
    readonly quote: string;
}
export interface SemanticStatementCandidate {
    readonly statementRef: string;
    readonly text: string;
    readonly modality: "normative" | "supporting" | "speculative" | "conflicting";
    readonly sourceQuotes: readonly SemanticSourceQuote[];
    readonly requirementRefs: readonly string[];
    readonly obligationRefs: readonly string[];
    /** Select only statements in authenticated incoming envelope.assets, never
     * statements introduced by this response or historical-only revision context. */
    readonly predecessorStatementRefs: readonly string[];
}
export interface SemanticRequirementCandidate {
    readonly candidateRef: string;
    readonly meaning: string;
    readonly parentRequirementRefs: readonly string[];
    readonly sourceQuotes: readonly SemanticSourceQuote[];
}
export interface SemanticPressure {
    readonly pressureRef: string;
    readonly text: string;
    readonly requirementRefs: readonly string[];
    readonly disposition: "pending" | "conflicting" | "unassessed";
}
export interface SemanticWorksiteDesign {
    readonly targets: readonly {
        readonly targetRef: string;
        readonly role: "implementation" | "verifier" | "configuration";
        readonly obligationRefs: readonly string[];
        readonly changeInstruction: string;
    }[];
    readonly commandRefs: readonly string[];
    readonly dependencyTargetRefs: readonly string[];
    readonly dependencyDisposition: "sufficient" | "unknown";
}
export interface SemanticAssetCandidate {
    readonly kind: "semantic_stage_asset_candidate";
    readonly schemaVersion: "5.0.0";
    readonly statements: readonly SemanticStatementCandidate[];
    readonly requirementCandidates: readonly SemanticRequirementCandidate[];
    readonly worksiteDesign: SemanticWorksiteDesign | null;
    readonly pressure: readonly SemanticPressure[];
}
export interface SemanticAssessmentCandidate {
    readonly kind: "semantic_stage_assessment_candidate";
    readonly schemaVersion: "5.0.0";
    readonly criteria: readonly {
        readonly criterionRef: string;
        readonly disposition: "satisfied" | "falsified" | "indeterminate";
        readonly explanation: string;
        readonly sourceQuotes: readonly SemanticSourceQuote[];
        readonly statementRefs: readonly string[];
    }[];
    readonly pressure: readonly SemanticPressure[];
}
export interface SemanticWorksiteBasis {
    readonly workspaceAuthorityBasis: WorkspaceAuthorityBasis;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly targets: readonly {
        readonly target: WorksiteConstructionTarget;
        readonly base64: string;
        readonly role: "implementation" | "verifier" | "configuration";
    }[];
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
}
export interface SemanticActorSource {
    readonly cCallRef: string;
    readonly inputDigest: Sha256Digest;
    readonly actorInvocationRef: string;
    readonly promptDigest: Sha256Digest;
    readonly transportDigest: Sha256Digest;
    /** Native actor identity remains above; this is the separate admitted F_D
     * projection and its exact observed workspace asset, never an actor alias. */
    readonly nativeWork?: {
        readonly adapterCCallRef: string;
        readonly adapterInputDigest: Sha256Digest;
        readonly observationRef: string;
        readonly observationDigest: Sha256Digest;
        readonly assetPath: string;
        readonly assetDigest: Sha256Digest;
    };
}
export interface SemanticAsset {
    readonly assetRef: string;
    readonly assetDigest: Sha256Digest;
    readonly stageRef: string;
    readonly candidate: SemanticAssetCandidate;
    readonly groundedTerms: readonly RequirementTerm[];
    readonly discoveredBindings: readonly GtlContractFulfillmentBinding[];
    readonly source: SemanticActorSource;
    readonly assessment: {
        readonly candidate: SemanticAssessmentCandidate;
        readonly source: SemanticActorSource;
        readonly disposition: "satisfied" | "falsified" | "indeterminate";
    } | null;
}
export interface SemanticEvidenceInput {
    readonly kind: "semantic_worksite_evidence";
    readonly constructionResultRef: string;
    readonly constructionResultDigest: Sha256Digest;
    readonly executionResultRef: string;
    readonly executionResultDigest: Sha256Digest;
    readonly constructionResult: Readonly<Record<string, JsonValue>>;
    readonly executionObservation: Readonly<Record<string, JsonValue>>;
    readonly artifacts: readonly {
        readonly subjectRef: string;
        readonly observationRef: string;
        readonly base64: string;
        readonly role: "realization" | "verifier_artifact";
    }[];
}
export interface SemanticStageEnvelope {
    readonly kind: "semantic_stage_envelope";
    readonly schemaVersion: "5.0.0";
    readonly sourceHandoff: RequirementHandoffOutput;
    readonly lifecycle: SemanticLifecycleDeclaration;
    readonly taskData: Readonly<Record<string, JsonValue>>;
    readonly evaluationData: Readonly<Record<string, JsonValue>>;
    readonly worksite: SemanticWorksiteBasis | null;
    readonly assets: readonly SemanticAsset[];
    readonly evidence: SemanticEvidenceInput | null;
    readonly applicationCoverage: "non_closing";
    readonly remainingGaps: readonly string[];
}
export declare function isSemanticAssetCandidate(value: unknown): value is SemanticAssetCandidate;
export declare function isSemanticAssessmentCandidate(value: unknown): value is SemanticAssessmentCandidate;
/** Quote selection is semantic; byte/span identity is computed over the fixed source. */
export declare function groundSemanticSourceQuote(handoff: RequirementHandoffOutput, selected: SemanticSourceQuote): RequirementTerm["sourceBindings"][number] | null;
export declare function semanticSourceText(handoff: RequirementHandoffOutput): readonly {
    readonly memberRef: string;
    readonly path: string;
    readonly text: string;
}[];
export declare function isSemanticWorksiteBasis(value: unknown): value is SemanticWorksiteBasis;
export declare const SEMANTIC_REMAINING_GAPS: readonly string[];
export declare function isSemanticStageEnvelope(value: unknown): value is SemanticStageEnvelope;
/** Current operating coordinates are derived by ABG from admission. This pure
 * relation only reconstructs target identities; it grants no effects or freshness. */
export type SemanticWorksiteOperatingBasis = Pick<SemanticWorksiteBasis, "workspaceAuthorityBasis" | "workspaceBinding" | "capabilityGrant">;
export declare function projectSemanticWorksiteCoordinates(historical: SemanticWorksiteBasis, current: SemanticWorksiteOperatingBasis): Readonly<SemanticWorksiteBasis> | null;
/** Native Design projection: the author selects declared targets and commands;
 * the owner preserves their observations, bounds, source and exact prompt bytes. */
export interface SemanticWorksiteRevisionProjection {
    readonly historicalWorksite: SemanticWorksiteBasis;
    readonly retainedBindings: readonly GtlContractFulfillmentBinding[];
    readonly feedback: JsonValue;
    readonly selectedTargetRefs?: readonly string[];
}
export declare function deriveSemanticWorksiteConstructionConfiguration(envelope: SemanticStageEnvelope, operatingBasis?: SemanticWorksiteOperatingBasis, revision?: SemanticWorksiteRevisionProjection): Readonly<Omit<WorksiteCommandPreparationInput, "kind" | "schemaVersion">> | null;
export declare function deriveSemanticWorksitePreparation(envelope: SemanticStageEnvelope, operatingBasis?: SemanticWorksiteOperatingBasis, revision?: SemanticWorksiteRevisionProjection): Readonly<WorksiteCommandPreparationInput> | null;
export declare function constructSemanticStageEnvelope(input: {
    readonly sourceHandoff: RequirementHandoffOutput;
    readonly lifecycle: SemanticLifecycleDeclaration;
    readonly taskData: Readonly<Record<string, JsonValue>>;
    readonly evaluationData: Readonly<Record<string, JsonValue>>;
    readonly worksite: SemanticWorksiteBasis | null;
}): Readonly<SemanticStageEnvelope>;
/** Pure field-domain projection. ABG authenticates the incoming assets; this
 * projection neither admits them nor selects only declared predecessor stages. */
export declare function semanticPredecessorStatementRefs(envelope: SemanticStageEnvelope): readonly string[];
/** The assessor's reference field names only the current candidate. Earlier
 * assets remain evidence, not members of this field domain. Authentication and
 * stage/independence checks remain with their existing owners. */
export declare function semanticAssessmentStatementDomain(envelope: SemanticStageEnvelope): Readonly<{
    assetRef: string;
    statementRefs: readonly string[];
}> | null;
export declare function deriveSemanticAsset(envelope: SemanticStageEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource, retained?: {
    readonly terms: readonly RequirementTerm[];
    readonly bindings: readonly GtlContractFulfillmentBinding[];
}): Readonly<SemanticStageEnvelope> | null;
export declare function deriveSemanticAssessment(envelope: SemanticStageEnvelope, stageRef: string, raw: unknown, source: SemanticActorSource): Readonly<SemanticStageEnvelope> | null;
export declare function semanticWorkerResultSchema(role: "author" | "assessor", bodyCapabilities: SemanticStageDeclaration["bodyCapabilities"]): Readonly<Record<string, JsonValue>>;
