import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type { CompleteDefinitionContractCoordinateMap } from "../shared/public_function_contracts.js";
import type { IntrinsicPublicFunctionFamily, IntrinsicPublicOperationContractProjection } from "../shared/public_function_family.js";
import type { PublicProjectionPayloads } from "../shared/public_function_projections.js";
import type { InvocationAuthorityCandidateSlots, PublicContractCatalogCoordinate, PublicContractCoordinate } from "../shared/public_invocation.js";
/** Explicit installed inputs for pure construction; no input is admitted here. */
export interface InstalledPublicDefinitionCallInput<TRequest extends Readonly<Record<string, JsonValue>>, TResources> {
    readonly product: Readonly<{
        canonicalJson: (value: JsonValue) => string;
        sha256Canonical: (value: JsonValue) => Sha256Digest;
    }>;
    readonly installedPublic: Readonly<{
        PUBLIC_FUNCTION_DEFINITION_FAMILY: IntrinsicPublicFunctionFamily;
        PUBLIC_OPERATION_CONTRACT_PROJECTIONS: readonly IntrinsicPublicOperationContractProjection[];
        PUBLIC_PROJECTION_PAYLOADS: PublicProjectionPayloads;
    }>;
    readonly definitionContractCoordinates: CompleteDefinitionContractCoordinateMap | null;
    readonly contractCatalog: PublicContractCatalogCoordinate;
    readonly operationId: string;
    readonly memberKey: string;
    readonly request: TRequest;
    readonly slots: InvocationAuthorityCandidateSlots;
    readonly resources: TResources;
    readonly requestRef: string;
    readonly correlationRef: string;
    readonly eventTime: string;
    readonly provenanceRefs: readonly string[];
}
/**
 * Construct the exact installed Public invocation envelope and resource assertion.
 * Coordinates must come from Product verification. This function selects and
 * hashes declared values only; the installed transport and owners still admit
 * the invocation, authority, request and resources before any execution.
 */
export declare function constructInstalledPublicDefinitionCall<TRequest extends Readonly<Record<string, JsonValue>>, TResources>({ product, installedPublic, definitionContractCoordinates, contractCatalog, operationId, memberKey, request, slots, resources, requestRef, correlationRef, eventTime, provenanceRefs, }: InstalledPublicDefinitionCallInput<TRequest, TResources>): Readonly<{
    invocation: Readonly<{
        invocationRef: `invocation://abiogenesis/${string}`;
        invocationDigest: `sha256:${string}`;
        kind: "public_invocation";
        schemaVersion: "5.0.0";
        invocationContract: Readonly<{
            contractCatalog: PublicContractCatalogCoordinate;
            flatRow: Readonly<{
                contractId: "abg.schema.public-operation-invocation";
                contractVersion: "5.0.0";
                contractDigest: `sha256:${string}`;
            }>;
            nestedSelector: Readonly<{
                selectorKind: "schema_definition";
                definitionKey: null;
                slot: null;
                definitionRef: "#/$defs/PublicInvocation";
            }>;
        }>;
        definitionRef: string;
        definitionVersion: "5.0.0";
        definitionDigest: `sha256:${string}`;
        definitionKey: import("../shared/public_invocation.js").PublicDefinitionKeyLike;
        contractCatalog: PublicContractCatalogCoordinate;
        invocationAuthority: Readonly<{
            authorityDigest: `sha256:${string}`;
            kind: "invocation_authority";
            definitionKey: import("../shared/public_invocation.js").PublicDefinitionKeyLike;
            slots: Readonly<{
                workspace_binding: import("../shared/public_invocation.js").ReferenceDigest<"WorkspaceBinding"> | null;
                product_set: import("../shared/public_invocation.js").NonEmptyReferenceDigestSet<"InstalledProduct"> | null;
                dependency_lock: import("../shared/public_invocation.js").ReferenceDigest<"ResolvedProductLock"> | null;
                catalog_scope: import("../shared/public_invocation.js").CatalogScopeAuthority | null;
                execution_program: import("../shared/public_invocation.js").ReferenceDigest<"GtlProgram"> | null;
                graph_function: import("../shared/public_invocation.js").GraphFunctionAuthority | null;
                input_contract: import("../shared/public_invocation.js").ContractBoundValue | null;
                session_policy: import("../shared/public_invocation.js").ReferenceDigest<"InvocationPolicy"> | null;
                capability_grants: import("../shared/public_invocation.js").CapabilityGrantAuthority;
                actor: import("../shared/public_invocation.js").ActorAuthority | null;
                transport_steering: import("../shared/public_invocation.js").ReferenceDigest<"TransportSteering"> | null;
                verification_references: readonly [import("../shared/public_invocation.js").SuccessfulPackedVerificationReference, ...import("../shared/public_invocation.js").SuccessfulPackedVerificationReference[]] | null;
                execution_basis: import("../shared/public_invocation.js").ReferenceDigest<"ExecutionBasis"> | null;
            }>;
        }>;
        requestContract: PublicContractCoordinate<import("../shared/public_invocation.js").PublicDefinitionKeyLike>;
        requestRef: string;
        requestDigest: `sha256:${string}`;
        request: TRequest;
        expectedResultContract: PublicContractCoordinate<import("../shared/public_invocation.js").PublicDefinitionKeyLike>;
        expectedRefusalContract: PublicContractCoordinate<import("../shared/public_invocation.js").PublicDefinitionKeyLike>;
        expectedNonTerminalContract: PublicContractCoordinate<import("../shared/public_invocation.js").PublicDefinitionKeyLike> | null;
        correlationRef: string;
        eventTime: string;
        provenanceRefs: readonly string[];
    }>;
    resources: TResources;
}>;
