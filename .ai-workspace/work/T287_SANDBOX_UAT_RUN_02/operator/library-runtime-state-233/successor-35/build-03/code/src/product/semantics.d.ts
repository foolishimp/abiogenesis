import type { NativeJudgmentProofOperations } from "../implementation/contracts.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ResultEvidenceLineage } from "../abg/result_evidence_lineage_contracts.js";
import type { ModulePublication, ProductSemanticsBinding } from "../gtl/contracts.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ProductInstall } from "./environment.js";
import { type InstalledProductModulePreparation } from "./installed_module.js";
import type { DeclarationApplication, GraphFunctionCatalogView } from "./catalog.js";
export interface ProductInvocationSourceResultBasis {
    readonly kind: "invocation_source_result_basis";
    readonly schemaVersion: "5.0.0";
    readonly basisRef: string;
    readonly basisDigest: Sha256Digest;
    readonly publicAuthorityDigest: Sha256Digest;
    readonly sourceInvocationAdmissionRef: string;
    readonly sourceInvocationRef: string;
    readonly sourceRunId: string;
    readonly sourceGraphCallId: string;
    readonly sourceGraphFunctionRef: string;
    readonly sourceCCallRef: string;
    readonly sourceResultAdmissionEventRef: string;
    readonly sourceResultJudgmentEventRef: string;
    readonly sourceResultRef: string;
    readonly sourceResultDigest: Sha256Digest;
    readonly sourceResultValueDigest: Sha256Digest;
    readonly sourceResultContractRef: string;
    readonly sourceResultValue: JsonValue;
    readonly sourceReplayRef: string;
    readonly sourceReplayDigest: Sha256Digest;
    readonly sourceWorkspaceId: string;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
}
export interface ProductPublicResultProjection {
    readonly kind: "product_public_result_projection";
    readonly schemaVersion: "5.0.0";
    readonly contractRef: string;
    readonly value: JsonValue;
}
export interface ProductSemanticsProvider {
    readonly kind: "product_semantics_provider";
    readonly schemaVersion: "5.0.0";
    readonly bindingRef: string;
    readonly packageName: string;
    readonly packageVersion: string;
    readonly publicResultProjectionKinds?: readonly string[];
    readonly admitInput: (contractRef: string, value: unknown) => Readonly<Record<string, JsonValue>> | null;
    readonly evaluateInteractionResponse: (basis: Readonly<{
        readonly requestContractRef: string;
        readonly responseContractRef: string;
        readonly requestValue: Readonly<Record<string, JsonValue>>;
        readonly actingActorRef: string;
        readonly constructionIntent: Readonly<Record<string, JsonValue>> | null;
        readonly nextActionBasis: Readonly<Record<string, JsonValue>> | null;
    }>, responseCandidate: unknown) => Readonly<Record<string, JsonValue>> | null;
    readonly validateContractValue: (valueKind: string, value: unknown) => value is Readonly<Record<string, JsonValue>>;
    readonly resolveJudgmentRelation: (predicateRef: string) => Readonly<{
        readonly predicateRef: string;
        readonly advanceReasonRef: string;
        readonly rejectionReasonRef: string;
        readonly evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations) => boolean;
    }> | null;
    readonly resolveCatalogApplicationValue?: (basis: Readonly<{
        readonly contractRef: string;
        readonly value: Readonly<Record<string, JsonValue>>;
    }>) => Readonly<{
        readonly valueRef: string;
        readonly programMembershipRefs: readonly string[];
        readonly productContributorAttestation?: Readonly<{
            readonly contributorRef: string;
            readonly attestationRef: string;
        }>;
    }> | null;
    readonly validateResultEvidenceLineage?: (basis: Readonly<{
        readonly outputContractRef: string;
        readonly value: Readonly<Record<string, JsonValue>>;
        readonly nativeProof?: import("../implementation/contracts.js").NativeJudgmentProofOperations;
        readonly admittedEvidence: readonly ResultEvidenceLineage[];
    }>) => boolean;
    readonly resolveProbabilisticWorkerContracts?: (basis: Readonly<{
        readonly inputContractRef: string;
        readonly outputContractRef: string;
        readonly input: Readonly<Record<string, JsonValue>>;
    }>) => Readonly<{
        readonly instructionContractRef: string;
        readonly resultContractRef: string;
    }> | null;
    readonly validateInvocationBasis?: (basis: Readonly<{
        readonly input: Readonly<Record<string, JsonValue>>;
        readonly workspaceBindingId: string;
        readonly workspaceBindingDigest: Sha256Digest;
        readonly workspaceId: string;
        readonly actionCatalog: JsonValue | null;
        readonly catalogView: GraphFunctionCatalogView;
        readonly catalogApplications: readonly DeclarationApplication[];
        readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
    }>) => boolean;
    readonly projectPublicResult?: (basis: Readonly<{
        readonly value: JsonValue;
        readonly admittedResultRef: string;
        readonly admittedResultContractRef: string;
        readonly replayRef: string;
        readonly projectionKind: string;
    }>) => ProductPublicResultProjection | null;
}
interface InstalledProductSemanticsBasisCommon {
    readonly install: ProductInstall;
    readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
}
export type InstalledProductSemanticsBasis = InstalledProductSemanticsBasisCommon & ({
    readonly publication: Readonly<ModulePublication>;
} | {
    readonly publicationDigest: Sha256Digest;
    readonly productSemanticsBinding: Readonly<ProductSemanticsBinding>;
});
export interface InstalledLeafSemanticsProjection {
    readonly kind: "installed_leaf_semantics_projection";
    readonly schemaVersion: "5.0.0";
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly installId: string;
    readonly productContentDigest: Sha256Digest;
    readonly manifestDigest: Sha256Digest;
    readonly publicationDigest: Sha256Digest;
    readonly bindingRef: string;
    readonly packageName: string;
    readonly packageVersion: string;
}
interface InstalledLeafSemanticsRuntime {
    readonly verifyInstalledContent: () => Promise<boolean>;
    readonly validateContractValue: (valueKind: string, value: unknown) => value is Readonly<Record<string, JsonValue>>;
    readonly resolveJudgmentRelation: (predicateRef: string) => Readonly<{
        readonly predicateRef: string;
        readonly advanceReasonRef: string;
        readonly rejectionReasonRef: string;
        readonly evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations) => boolean;
    }> | null;
    readonly validateResultEvidenceLineage: (basis: Readonly<{
        readonly outputContractRef: string;
        readonly value: Readonly<Record<string, JsonValue>>;
        readonly nativeProof?: NativeJudgmentProofOperations;
        readonly admittedEvidence: readonly ResultEvidenceLineage[];
    }>) => boolean;
    readonly resolveProbabilisticWorkerContracts: (basis: Readonly<{
        readonly inputContractRef: string;
        readonly outputContractRef: string;
        readonly input: Readonly<Record<string, JsonValue>>;
    }>) => Readonly<{
        readonly instructionContractRef: string;
        readonly resultContractRef: string;
    }> | null;
}
export declare function inspectProductLeafSemanticsProjection(value: unknown): Readonly<{
    projection: InstalledLeafSemanticsProjection;
    runtime: InstalledLeafSemanticsRuntime;
}> | null;
export declare function loadInstalledProductSemantics(basis: InstalledProductSemanticsBasis): Promise<ProductSemanticsProvider>;
/** Same-owner composition; the caller supplies this resolution's physical result. */
export declare function productSemanticsFromModules(basis: InstalledProductSemanticsBasis, prepared: InstalledProductModulePreparation): Promise<ProductSemanticsProvider>;
export declare function admitInstalledProductInput(semantics: ProductSemanticsProvider, contractRef: string, value: unknown): Readonly<Record<string, JsonValue>> | null;
export declare function evaluateInstalledInteractionResponse(semantics: ProductSemanticsProvider, basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0], responseCandidate: unknown): Readonly<Record<string, JsonValue>> | null;
export declare function validateInstalledInvocationBasis(semantics: ProductSemanticsProvider, basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]): boolean;
export declare function hasInstalledPublicResultProjection(semantics: ProductSemanticsProvider): boolean;
export declare function supportsInstalledPublicResultProjection(semantics: ProductSemanticsProvider, projectionKind: string): boolean;
export declare function projectInstalledPublicResult(semantics: ProductSemanticsProvider, basis: Parameters<NonNullable<ProductSemanticsProvider["projectPublicResult"]>>[0]): ProductPublicResultProjection | null;
export declare function projectInstalledLeafSemantics(semantics: ProductSemanticsProvider): InstalledLeafSemanticsProjection;
export {};
