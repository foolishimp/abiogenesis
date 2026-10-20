import * as v from "valibot";
import { type IntrinsicPublicFunctionFamilyCoordinate } from "../shared/public_function_family.js";
import { type PublicProjectionPayloads } from "../shared/public_function_projections.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { PublicContractCatalogCoordinate, PublicContractCoordinate } from "../shared/public_invocation.js";
import { type ProductAssetLocator, type ProductNativeTypedLocator, type ProductPublicContract, type ProductPublicContractCatalog } from "./contracts.js";
import type { NativeDeclarationClosure } from "./declaration_exports.js";
export declare const PUBLIC_CATALOG_BINDING_FAILURE_CLASSES: readonly ["forbidden_operation_identity", "duplicate_contract_identity", "missing_projected_identity", "unexpected_projected_identity", "retained_row_changed", "owning_product_mismatch", "unresolved_locator", "content_digest_mismatch"];
export type PublicCatalogBindingFailureClass = (typeof PUBLIC_CATALOG_BINDING_FAILURE_CLASSES)[number];
export declare const MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS: readonly ["abg.schema.product-toolchain-manifest", "abg.schema.public-contract-catalog", "abg.schema.public-operation-contract", "abg.schema.public-operation-invocation", "abg.schema.public-operation-outcome", "abg.schema.native-contract-inventory", "abg.schema.capability-contract", "abg.schema.closed-vocabulary", "abg.schema.gtl-graph-function", "abg.schema.gtl-module", "abg.schema.gtl-c-program", "abg.schema.gtl-program-conformance-input", "abg.schema.catalog-product-descriptor", "abg.schema.catalog-contribution-manifest", "abg.schema.resolved-product-lock", "abg.schema.workspace-binding", "abg.schema.install-manifest", "abg.schema.installer-manifest", "abg.schema.catalog-admission", "abg.schema.host-invocation", "abg.schema.runtime-event", "abg.schema.runtime-result", "abg.schema.runtime-replay", "abg.schema.fh-interaction", "abg.schema.tenant-conformance-manifest", "abg.schema.self-conformance-result", "abg.schema.exact-candidate-qualification", "abg.schema.consensus-subject", "abg.schema.consensus-panel", "abg.schema.consensus-reviewer-profile", "abg.schema.review-findings", "abg.schema.review-rulings", "abg.schema.consensus-round-policy", "abg.schema.consensus-round-outcome", "abg.schema.consensus-result", "abg.schema.ticket-consensus-projection", "abg.schema.release-snapshot", "abg.schema.a5-r1-release-manifest", "abg.vocabulary.runtime-event-kind", "abg.vocabulary.gtl-program-diagnostic-id", "abg.vocabulary.gtl-program-repair-edit-class", "abg.vocabulary.review-ruling-kind", "abg.vocabulary.consensus-round-outcome", "abg.asset.gtl.language-conformance-corpus"];
export declare const S06_REPLACEMENT_CONTRACT_IDS: readonly string[];
export type PublicContractCatalogRowProposal = ProductPublicContract & Readonly<{
    readonly contractVersion: "5.0.0";
    readonly contractKind: "serialized_native_contract";
    readonly nativeTypedLocator: ProductNativeTypedLocator;
    readonly assetLocator: ProductAssetLocator;
}>;
export interface PublicCatalogProposalSet {
    readonly family: IntrinsicPublicFunctionFamilyCoordinate;
    readonly proposals: readonly PublicContractCatalogRowProposal[];
    readonly proposalSetRef: string;
    readonly proposalSetDigest: Sha256Digest;
}
export declare function publicProposalSetDigest(proposals: readonly PublicContractCatalogRowProposal[]): Sha256Digest;
/** PFC-F07 Product-row projection over the closed family payloads. */
export declare function derivePublicCatalogRowProposals(productId: string, packageName: string, closure: NativeDeclarationClosure, payloads?: PublicProjectionPayloads): PublicCatalogProposalSet;
export interface PublicCatalogBindingAttempt {
    readonly schemaVersion: "5.0.0";
    readonly extantCatalog: PublicContractCatalogCoordinate;
    readonly family: IntrinsicPublicFunctionFamilyCoordinate;
    readonly proposalSetRef: string;
    readonly proposalSetDigest: Sha256Digest;
    readonly productId: string;
    readonly productContentDigest: Sha256Digest;
    readonly attemptRef: string;
    readonly attemptDigest: Sha256Digest;
}
export interface ExactPublicCatalogBindingNativeSource {
    readonly abstractModule: "Product.PublicContractPublication";
    readonly exportName: "PUBLIC_CATALOG_BINDING_CONTRACTS";
    readonly memberPath: readonly ["refusal"];
    readonly sourceModuleDigest: Sha256Digest;
    readonly memberDigest: Sha256Digest;
}
export interface PublicCatalogBindingRefusal {
    readonly kind: "public_catalog_binding_refusal";
    readonly schemaVersion: "5.0.0";
    readonly refusalContract: PublicContractCoordinate;
    readonly nativeContractSource: ExactPublicCatalogBindingNativeSource;
    readonly attempt: PublicCatalogBindingAttempt;
    readonly refusalRef: string;
    readonly refusalDigest: Sha256Digest;
    readonly failureClass: PublicCatalogBindingFailureClass;
    readonly issuePaths: readonly [string, ...string[]];
}
export interface MandatorySchemaVocabularyCorpusGapSet {
    readonly kind: "mandatory_schema_vocabulary_corpus_gap_set";
    readonly schemaVersion: "5.0.0";
    readonly requirementAuthorityRef: "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-006A";
    readonly catalogId: string;
    readonly catalogDigest: Sha256Digest;
    readonly mandatoryIdentityCount: 44;
    readonly missingContractIds: readonly string[];
    readonly diagnosticDigest: Sha256Digest;
}
export interface S06PublicCatalogBindingSuccess {
    readonly kind: "s06_public_contract_catalog_binding";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "bound";
    readonly attempt: PublicCatalogBindingAttempt;
    readonly catalog: ProductPublicContractCatalog;
    readonly mandatorySchemaVocabularyCorpusGapSet: MandatorySchemaVocabularyCorpusGapSet;
}
export type S06PublicCatalogBindingResult = S06PublicCatalogBindingSuccess | PublicCatalogBindingRefusal;
export interface BindS06PublicFunctionCatalogInput {
    readonly extantCatalog: ProductPublicContractCatalog;
    readonly extantCatalogCoordinate: PublicContractCatalogCoordinate;
    readonly productId: string;
    readonly productContentDigest: Sha256Digest;
    readonly proposalSequence: readonly PublicContractCatalogRowProposal[];
    readonly publicPackageName: string;
    readonly publicDeclarationClosure: NativeDeclarationClosure;
    readonly projectionPayloads?: PublicProjectionPayloads;
}
export declare const PUBLIC_CATALOG_BINDING_CONTRACTS: Readonly<{
    attempt: v.StrictObjectSchema<{
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly extantCatalog: v.StrictObjectSchema<{
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly catalogId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly catalogVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly family: v.StrictObjectSchema<{
            readonly requirementAuthorityRefs: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>, v.MinLengthAction<string[], 1, undefined>]>;
            readonly familyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly familyVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly familyDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly proposalSetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly proposalSetDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly attemptRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly attemptDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    refusal: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"public_catalog_binding_refusal", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly refusalContract: v.StrictObjectSchema<{
            readonly contractCatalog: v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly catalogId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly flatRow: v.StrictObjectSchema<{
                readonly contractId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly contractVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly contractDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly nestedSelector: v.UnionSchema<[v.StrictObjectSchema<{
                readonly selectorKind: v.LiteralSchema<"flat_contract", undefined>;
                readonly definitionKey: v.NullSchema<undefined>;
                readonly slot: v.NullSchema<undefined>;
                readonly definitionRef: v.NullSchema<undefined>;
            }, undefined>, v.StrictObjectSchema<{
                readonly selectorKind: v.LiteralSchema<"operation_definition_slot", undefined>;
                readonly definitionKey: v.StrictObjectSchema<{
                    readonly operationId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                    readonly memberKey: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                }, undefined>;
                readonly slot: v.PicklistSchema<["request", "result", "refusal", "non_terminal"], undefined>;
                readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer_fragment">]>;
            }, undefined>, v.StrictObjectSchema<{
                readonly selectorKind: v.LiteralSchema<"schema_definition", undefined>;
                readonly definitionKey: v.NullSchema<undefined>;
                readonly slot: v.NullSchema<undefined>;
                readonly definitionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer_fragment">]>;
            }, undefined>], undefined>;
        }, undefined>;
        readonly nativeContractSource: v.StrictObjectSchema<{
            readonly abstractModule: v.LiteralSchema<"Product.PublicContractPublication", undefined>;
            readonly exportName: v.LiteralSchema<"PUBLIC_CATALOG_BINDING_CONTRACTS", undefined>;
            readonly memberPath: v.TupleSchema<[v.LiteralSchema<"refusal", undefined>], undefined>;
            readonly sourceModuleDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly memberDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly attempt: v.StrictObjectSchema<{
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly extantCatalog: v.StrictObjectSchema<{
                readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
                readonly catalogId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly catalogVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly catalogDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly family: v.StrictObjectSchema<{
                readonly requirementAuthorityRefs: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>, undefined>, v.CheckAction<string[], "unique_items">]>, v.MinLengthAction<string[], 1, undefined>]>;
                readonly familyRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
                readonly familyVersion: v.LiteralSchema<"5.0.0", undefined>;
                readonly familyDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            }, undefined>;
            readonly proposalSetRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly proposalSetDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly productId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly productContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly attemptRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly attemptDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly refusalRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly refusalDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        readonly failureClass: v.PicklistSchema<readonly ["forbidden_operation_identity", "duplicate_contract_identity", "missing_projected_identity", "unexpected_projected_identity", "retained_row_changed", "owning_product_mismatch", "unresolved_locator", "content_digest_mismatch"], undefined>;
        readonly issuePaths: v.SchemaWithPipe<readonly [v.SchemaWithPipe<readonly [v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "json_pointer">]>, undefined>, v.CheckAction<string[], "unique_items">]>, v.MinLengthAction<string[], 1, undefined>]>;
    }, undefined>;
    refusalNativeSource: ExactPublicCatalogBindingNativeSource;
}>;
export declare function productPublicContractCatalogDigest(catalog: ProductPublicContractCatalog): Sha256Digest;
/** PFC-F08. Pure, eventless binding into the extant flat catalog carrier. */
export declare function bindS06PublicFunctionCatalog(input: BindS06PublicFunctionCatalogInput): S06PublicCatalogBindingResult;
export { constructSelfConformanceAssetRows } from "../validator/self_conformance_publication.js";
