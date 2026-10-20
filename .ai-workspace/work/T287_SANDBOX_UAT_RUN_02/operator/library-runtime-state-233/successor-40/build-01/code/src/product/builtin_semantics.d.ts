import type { NativeJudgmentProofOperations } from "../implementation/contracts.js";
import { resolveConsensusJudgmentRelation } from "../gtl/consensus.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { ProductSemanticsProvider } from "./semantics.js";
declare function admitInput(contractRef: string, value: unknown): Readonly<Record<string, JsonValue>> | null;
export declare const ABI5_PRODUCT_SEMANTICS: Readonly<{
    kind: "product_semantics_provider";
    schemaVersion: "5.0.0";
    bindingRef: "product-semantics://abiogenesis/conformance@5";
    packageName: "@abiogenesis/typescript-tenant";
    packageVersion: "5.0.0-rc.1";
    admitInput: typeof admitInput;
    evaluateInteractionResponse(basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0], responseCandidate: unknown): Readonly<Record<string, JsonValue>> | null;
    validateContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>>;
    resolveJudgmentRelation: (predicateRef: string) => Readonly<{
        readonly predicateRef: string;
        readonly advanceReasonRef: string;
        readonly rejectionReasonRef: string;
        readonly evaluate: (input: unknown, output: unknown) => boolean;
    }> | Readonly<{
        predicateRef: "predicate://abiogenesis/worksite/native-command-reacquisition@5";
        advanceReasonRef: "reason://abiogenesis/worksite/native-reacquisition/current@5";
        rejectionReasonRef: "reason://abiogenesis/worksite/native-reacquisition/unjoined@5";
        evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: import("../abg/event_store.js").DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations, historicalSource?: import("../abg/terminal_result_contracts.js").AbgHistoricalGraphCallSourceResource) => boolean;
    }> | null;
    resolveProbabilisticWorkerContracts(basis: Readonly<{
        inputContractRef: string;
        outputContractRef: string;
        input: Readonly<Record<string, JsonValue>>;
    }>): Readonly<{
        instructionContractRef: string;
        resultContractRef: string;
    }>;
    validateInvocationBasis(basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]): boolean;
}>;
/**
 * C2 publishes independently from the retained C1 module, so its declaration
 * closure needs a distinct semantics coordinate even though both resolve the
 * same ABI-owned contract laws.
 */
export declare const ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS: Readonly<{
    bindingRef: "product-semantics://abiogenesis/worksite/command-execution@5";
    kind: "product_semantics_provider";
    schemaVersion: "5.0.0";
    packageName: "@abiogenesis/typescript-tenant";
    packageVersion: "5.0.0-rc.1";
    admitInput: typeof admitInput;
    evaluateInteractionResponse: (basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0], responseCandidate: unknown) => Readonly<Record<string, JsonValue>> | null;
    validateContractValue: (valueKind: string, value: unknown) => value is Readonly<Record<string, JsonValue>>;
    resolveJudgmentRelation: (predicateRef: string) => Readonly<{
        readonly predicateRef: string;
        readonly advanceReasonRef: string;
        readonly rejectionReasonRef: string;
        readonly evaluate: (input: unknown, output: unknown) => boolean;
    }> | Readonly<{
        predicateRef: "predicate://abiogenesis/worksite/native-command-reacquisition@5";
        advanceReasonRef: "reason://abiogenesis/worksite/native-reacquisition/current@5";
        rejectionReasonRef: "reason://abiogenesis/worksite/native-reacquisition/unjoined@5";
        evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: import("../abg/event_store.js").DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations, historicalSource?: import("../abg/terminal_result_contracts.js").AbgHistoricalGraphCallSourceResource) => boolean;
    }> | null;
    resolveProbabilisticWorkerContracts: (basis: Readonly<{
        inputContractRef: string;
        outputContractRef: string;
        input: Readonly<Record<string, JsonValue>>;
    }>) => Readonly<{
        instructionContractRef: string;
        resultContractRef: string;
    }>;
    validateInvocationBasis: (basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]) => boolean;
}>;
export declare const ABI5_WORKSITE_COMMAND_FORWARD_PRODUCT_SEMANTICS: Readonly<{
    bindingRef: "product-semantics://abiogenesis/worksite/command-forward@5";
    kind: "product_semantics_provider";
    schemaVersion: "5.0.0";
    packageName: "@abiogenesis/typescript-tenant";
    packageVersion: "5.0.0-rc.1";
    admitInput: typeof admitInput;
    evaluateInteractionResponse: (basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0], responseCandidate: unknown) => Readonly<Record<string, JsonValue>> | null;
    validateContractValue: (valueKind: string, value: unknown) => value is Readonly<Record<string, JsonValue>>;
    resolveJudgmentRelation: (predicateRef: string) => Readonly<{
        readonly predicateRef: string;
        readonly advanceReasonRef: string;
        readonly rejectionReasonRef: string;
        readonly evaluate: (input: unknown, output: unknown) => boolean;
    }> | Readonly<{
        predicateRef: "predicate://abiogenesis/worksite/native-command-reacquisition@5";
        advanceReasonRef: "reason://abiogenesis/worksite/native-reacquisition/current@5";
        rejectionReasonRef: "reason://abiogenesis/worksite/native-reacquisition/unjoined@5";
        evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: import("../abg/event_store.js").DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations, historicalSource?: import("../abg/terminal_result_contracts.js").AbgHistoricalGraphCallSourceResource) => boolean;
    }> | null;
    resolveProbabilisticWorkerContracts: (basis: Readonly<{
        inputContractRef: string;
        outputContractRef: string;
        input: Readonly<Record<string, JsonValue>>;
    }>) => Readonly<{
        instructionContractRef: string;
        resultContractRef: string;
    }>;
    validateInvocationBasis: (basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]) => boolean;
}>;
export declare const ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS: Readonly<{
    bindingRef: "product-semantics://abiogenesis/worksite/native-work@5";
    validateResultEvidenceLineage(basis: Parameters<NonNullable<ProductSemanticsProvider["validateResultEvidenceLineage"]>>[0]): boolean;
    kind: "product_semantics_provider";
    schemaVersion: "5.0.0";
    packageName: "@abiogenesis/typescript-tenant";
    packageVersion: "5.0.0-rc.1";
    admitInput: typeof admitInput;
    evaluateInteractionResponse: (basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0], responseCandidate: unknown) => Readonly<Record<string, JsonValue>> | null;
    validateContractValue: (valueKind: string, value: unknown) => value is Readonly<Record<string, JsonValue>>;
    resolveJudgmentRelation: (predicateRef: string) => Readonly<{
        readonly predicateRef: string;
        readonly advanceReasonRef: string;
        readonly rejectionReasonRef: string;
        readonly evaluate: (input: unknown, output: unknown) => boolean;
    }> | Readonly<{
        predicateRef: "predicate://abiogenesis/worksite/native-command-reacquisition@5";
        advanceReasonRef: "reason://abiogenesis/worksite/native-reacquisition/current@5";
        rejectionReasonRef: "reason://abiogenesis/worksite/native-reacquisition/unjoined@5";
        evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: import("../abg/event_store.js").DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations, historicalSource?: import("../abg/terminal_result_contracts.js").AbgHistoricalGraphCallSourceResource) => boolean;
    }> | null;
    resolveProbabilisticWorkerContracts: (basis: Readonly<{
        inputContractRef: string;
        outputContractRef: string;
        input: Readonly<Record<string, JsonValue>>;
    }>) => Readonly<{
        instructionContractRef: string;
        resultContractRef: string;
    }>;
    validateInvocationBasis: (basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]) => boolean;
}>;
declare function admitSystemInput(contractRef: string, value: unknown): Readonly<Record<string, JsonValue>> | null;
declare function validateSystemContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>>;
declare function resolveSystemCatalogApplicationValue(basis: Readonly<{
    contractRef: string;
    value: Readonly<Record<string, JsonValue>>;
}>): Readonly<{
    valueRef: string;
    programMembershipRefs: readonly string[];
}> | null;
declare function validateSystemResultEvidenceLineage(basis: Parameters<NonNullable<ProductSemanticsProvider["validateResultEvidenceLineage"]>>[0]): boolean;
export declare const ABI5_SYSTEM_PRODUCT_SEMANTICS: Readonly<{
    kind: "product_semantics_provider";
    schemaVersion: "5.0.0";
    bindingRef: "product-semantics://abiogenesis/system@5";
    packageName: "@abiogenesis/typescript-tenant";
    packageVersion: "5.0.0-rc.1";
    publicResultProjectionKinds: readonly ["result", "ticket.consensus"];
    admitInput: typeof admitSystemInput;
    evaluateInteractionResponse(basis: Parameters<ProductSemanticsProvider["evaluateInteractionResponse"]>[0], responseCandidate: unknown): Readonly<Record<string, JsonValue>> | null;
    validateContractValue: typeof validateSystemContractValue;
    resolveCatalogApplicationValue: typeof resolveSystemCatalogApplicationValue;
    resolveJudgmentRelation: typeof resolveConsensusJudgmentRelation;
    validateResultEvidenceLineage: typeof validateSystemResultEvidenceLineage;
    resolveProbabilisticWorkerContracts(basis: Readonly<{
        inputContractRef: string;
        outputContractRef: string;
        input: Readonly<Record<string, JsonValue>>;
    }>): Readonly<{
        instructionContractRef: string;
        resultContractRef: string;
    }>;
    validateInvocationBasis(basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]): boolean;
    projectPublicResult(basis: Readonly<{
        value: JsonValue;
        admittedResultRef: string;
        admittedResultContractRef: string;
        replayRef: string;
        projectionKind: string;
    }>): {
        kind: "product_public_result_projection";
        schemaVersion: "5.0.0";
        contractRef: string;
        value: JsonValue;
    } | null;
}>;
export declare const ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS: ProductSemanticsProvider;
export declare const ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS: ProductSemanticsProvider;
/** Distinct D2 contract interpretation; existing D1 owner remains singular. */
export declare const ABI5_SEMANTIC_REVISION_PRODUCT_SEMANTICS: ProductSemanticsProvider;
export declare const ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS: ProductSemanticsProvider;
export {};
