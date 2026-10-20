import type { AbgHistoricalDeclarationProof } from "../abg/terminal_result_contracts.js";
import { type QualificationResourceAssertion, type QualificationResourceManifest, type QualificationResourceSelection, type QualificationDeclarationSelection, type QualificationInternedScope, type QualificationCoordinate, type QualificationScope, type QualificationAssessmentInput, type QualificationEmbeddedTask, type QualificationProofResource, type QualificationEmbeddedProofResource, type QualificationConstructionProvenance } from "./qualification_contracts.js";
import { type SelfConformanceInput, type SelfConformanceEmbeddedInput } from "./self_conformance_contracts.js";
export declare function isQualificationReferenceForm(value: unknown): value is {
    representation: "resource_refs_v1";
};
/** Immutable operation dependency, acquired once at raw/cold ingress. Its maps
 * are private; neither this object nor a selected body supplies ABG authority. */
export declare class QualificationResources {
    readonly assertion: QualificationResourceAssertion;
    private readonly manifests;
    private readonly tables;
    private readonly scopeViews;
    private readonly assessmentViews;
    private readonly provenanceViews;
    private readonly proofs;
    private readonly proofDigests;
    constructor(assertion: unknown, additionalProofs?: readonly AbgHistoricalDeclarationProof[]);
    private validateEntry;
    /** Complete views belong only to this explicit immutable acquisition. Raw
     * identity is rechecked by the calling owner; full dependencies are borrowed
     * across preparation/completion, never inferred from another invocation. */
    assessment(input: QualificationAssessmentInput, validate: (view: ResolvedQualificationAssessment) => void): ResolvedQualificationAssessment;
    selection(m: QualificationResourceManifest, entryKind: QualificationResourceSelection["entryKind"], entry: QualificationCoordinate): QualificationResourceSelection;
    manifest(c: QualificationCoordinate): QualificationResourceManifest;
    value<T>(selection: QualificationResourceSelection, kind: QualificationResourceSelection["entryKind"]): T;
    declarations(resource: QualificationCoordinate, selections: readonly QualificationDeclarationSelection[]): readonly AbgHistoricalDeclarationProof[];
    scope(selection: QualificationResourceSelection): {
        scope: QualificationScope;
        normalized: QualificationInternedScope;
    };
    provenance(selection: QualificationResourceSelection): QualificationConstructionProvenance;
}
export declare function acquireQualificationResources(assertion: unknown, additionalProofs?: readonly AbgHistoricalDeclarationProof[]): QualificationResources;
export declare function resolveQualificationProof(proof: QualificationProofResource, resources?: QualificationResources): QualificationEmbeddedProofResource;
export type ResolvedQualificationAssessment = {
    input: QualificationAssessmentInput;
    task: QualificationEmbeddedTask;
    normalizedScope?: QualificationInternedScope;
};
export declare function resolveQualificationAssessment(input: QualificationAssessmentInput, resources?: QualificationResources): ResolvedQualificationAssessment;
export declare function resolveSelfConformanceInput(raw: SelfConformanceInput, resources?: QualificationResources): {
    input: SelfConformanceEmbeddedInput;
    normalizedScope?: QualificationInternedScope;
};
/** Deterministic authoring helpers; new identities cover normalized bytes. */
export declare function normalizeQualificationScope(scope: QualificationScope): QualificationInternedScope;
