import type { ComputeRegime, GtlProgram } from "../gtl/contracts.js";
import { type RawAdmittedValue } from "../validator/raw_admission.js";
import { type JsonValue } from "../shared/canonical_json.js";
import type { AdmittedPublicInvocation } from "../shared/public_invocation.js";
import { type DeclarationApplication, type GraphFunctionCatalogEntry, type GraphFunctionCatalogView } from "./catalog.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ProductInstall, type WorkspaceAuthorityBasis, type WorkspaceBinding } from "./environment.js";
import { type OwnerContractSourceDeclaration } from "../shared/public_function_contracts.js";
export declare const DIRECT_INVOKE_CAPABILITY = "abg.capability.catalog.invoke-graph-function@5";
import type { PublicContractCoordinate, PublicDefinitionKeyLike } from "../shared/public_invocation.js";
import { type AdmissionCapabilityGrantConstructionBasis, type AdmissionCapabilityData, type ResolvedAdmissionAuthority } from "./admission_authority.js";
export type RunInvocationVariant = "direct" | "start";
export type CapabilityOperationId = PublicDefinitionKeyLike["operationId"];
export interface InvocationInteractionCapability {
    readonly requirementKey: string;
    readonly requirementKeyDigest: Sha256Digest;
    readonly actorCapabilityRef: string;
}
export interface InvocationPolicyBasis {
    readonly kind: "invocation_policy_basis";
    readonly schemaVersion: "5.0.0";
    readonly policyRef: string;
    readonly policyDigest: Sha256Digest;
    readonly authorityMode: "trusted_developer";
    readonly authorityBasisId: string;
    readonly authorityBasisDigest: Sha256Digest;
    readonly authorizedActorRef: string;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly allowedComputeRegimes: readonly ComputeRegime[];
    readonly interactionCapabilities: readonly InvocationInteractionCapability[];
    readonly catalogApplicationRefs: readonly string[];
    readonly catalogApplicationDigests: readonly Sha256Digest[];
    readonly graphMaterialization: "after_invocation_admission";
}
export interface CapabilityGrant {
    readonly kind: "capability_grant";
    readonly schemaVersion: "5.0.0";
    readonly grantRef: string;
    readonly grantDigest: Sha256Digest;
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly definitionRef: string;
    readonly definitionDigest: Sha256Digest;
    readonly capabilityDefinition: CapabilityDefinitionCoordinate;
    readonly operationContract: PublicContractCoordinate;
    readonly operationId: CapabilityOperationId;
    readonly capabilityRef: string;
    readonly actorRef: string;
    readonly approvalRef: string;
    readonly approvalDigest: Sha256Digest;
    readonly policyRef: string;
    readonly policyDigest: Sha256Digest;
    readonly scopeRef: string;
    readonly scopeDigest: Sha256Digest;
    readonly authorityBasisRef: string;
    readonly authorityBasisDigest: Sha256Digest;
}
export interface CapabilityDefinitionCoordinate {
    readonly graphId: string;
    readonly graphVersion: "5.0.0";
    readonly graphDigest: Sha256Digest;
    readonly capabilityId: string;
    readonly capabilityDefinitionRef: string;
    readonly capabilityDefinitionDigest: Sha256Digest;
}
export interface CapabilityGrantConstructionBasis {
    readonly admittedInstalls: readonly ProductInstall[];
    readonly workspaceBinding: WorkspaceBinding;
    readonly fixedPacket: OwnerContractSourceDeclaration;
}
export interface InvocationAuthority {
    readonly kind: "invocation_authority";
    readonly schemaVersion: "5.0.0";
    readonly authorityRef: string;
    readonly authorityDigest: Sha256Digest;
    readonly actorRef: string;
    readonly operationId: "abg.operation.run.invoke";
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly catalogBasisDigest: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly programRef: string;
    readonly catalogHandle: string;
    readonly selectedDefinitionRef: string;
    readonly selectedDefinitionDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly policyRef: string;
    readonly policyDigest: Sha256Digest;
    readonly capabilityGrantRefs: readonly string[];
}
export interface PublicInvocationCandidate {
    readonly kind: "public_invocation_candidate";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "candidate";
    readonly operationId: "abg.operation.run.invoke";
    readonly variant: RunInvocationVariant;
    readonly invocationRef: string;
    readonly invocationDigest: Sha256Digest;
    readonly publicFunctionDefinitionRef: string;
    readonly publicFunctionDefinitionDigest: Sha256Digest;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly catalogBasisDigest: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly catalogHandle: string;
    readonly selectedDefinitionRef: string;
    readonly selectedDefinitionDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly rawInputAdmissionRef: string;
    readonly rawInputDigest: Sha256Digest;
    readonly publicRequestAdmissionRef: string;
    readonly publicRequestDigest: Sha256Digest;
    readonly publicRequestInvocationRef: string;
    readonly sessionPolicyRef: string;
    readonly sessionPolicyDigest: Sha256Digest;
    readonly capabilityGrantRefs: readonly string[];
    readonly capabilityGrantDigests: readonly Sha256Digest[];
    readonly invocationAuthorityRef: string;
    readonly invocationAuthorityDigest: Sha256Digest;
    readonly actorAttributionRef: string;
}
export interface InvocationConstructionRefusal {
    readonly kind: "invocation_construction_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "authority_mismatch" | "capability_mismatch" | "contract_mismatch";
    readonly message: string;
}
export interface ExactDirectRunInvocationRequest extends Readonly<Record<string, JsonValue>> {
    readonly program: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }>;
    readonly catalogHandle: string;
    readonly inputContract: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }>;
    readonly input: JsonValue;
    readonly catalogView: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }>;
    readonly allowlist: readonly string[];
    readonly sourceBasis: Readonly<Record<string, JsonValue>>;
}
export type ExactDirectRunInvocation = AdmittedPublicInvocation<Readonly<{
    readonly operationId: "abg.operation.run.invoke";
    readonly memberKey: "invoke";
}>, ExactDirectRunInvocationRequest>;
export interface ExactStartRunInvocationRequest extends Readonly<Record<string, JsonValue>> {
    readonly program: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }>;
    readonly scope: "program";
    readonly target: Readonly<Record<string, JsonValue>>;
    readonly until: "converged";
    readonly catalogView: Readonly<{
        readonly ref: string;
        readonly digest: Sha256Digest;
    }>;
    readonly allowlist: readonly string[];
    readonly input: Readonly<{
        readonly contract: Readonly<{
            readonly ref: string;
            readonly digest: Sha256Digest;
        }>;
        readonly valueRef: string;
        readonly valueDigest: Sha256Digest;
        readonly value: JsonValue;
    }>;
    readonly fhMode: "direct" | "human-proxy";
    readonly rootMode: "direct" | "supervised";
    readonly sourceBasis: Readonly<Record<string, JsonValue>>;
}
export type ExactStartRunInvocation = AdmittedPublicInvocation<Readonly<{
    readonly operationId: "abg.operation.run.invoke";
    readonly memberKey: "start";
}>, ExactStartRunInvocationRequest>;
export declare function isInvocationPolicyBasis(value: unknown): value is InvocationPolicyBasis;
export declare function isCapabilityGrant(value: unknown): value is CapabilityGrant;
export declare function isInvocationAuthority(value: unknown): value is InvocationAuthority;
export declare function isPublicInvocationCandidate(value: unknown): value is PublicInvocationCandidate;
export declare function constructRootInvocationPolicy(workspaceBinding: WorkspaceBinding, program: Readonly<GtlProgram>, interactionCapabilities: readonly InvocationInteractionCapability[], allowedComputeRegimes?: readonly ComputeRegime[], catalogApplications?: readonly DeclarationApplication[]): InvocationPolicyBasis;
export declare function isCapabilityGrantValue(value: unknown): value is CapabilityGrant;
export declare function constructCapabilityGrant(policy: ResolvedAdmissionAuthority, actorRef: string, operationId: CapabilityOperationId, capabilityRef: string, basis: AdmissionCapabilityGrantConstructionBasis): Promise<CapabilityGrant>;
export declare function constructCapabilityGrant(policy: InvocationPolicyBasis | WorkspaceAuthorityBasis, actorRef: string, operationId?: CapabilityOperationId, capabilityRef?: string, basis?: CapabilityGrantConstructionBasis): CapabilityGrant;
/** One fixed definition call validates its shared basis once for all capabilities. */
export declare function constructAdmissionCapabilityGrants(policy: ResolvedAdmissionAuthority, actorRef: string, basis: AdmissionCapabilityGrantConstructionBasis, resource: import("../abg/definition_event_resource.js").AcquiredAbgEventResource | null): Promise<Readonly<{
    grants: readonly CapabilityGrant[];
    data: AdmissionCapabilityData;
    boundEnvironment: import("../abg/environment_admission.js").ExactPrefixWorkspaceEnvironment | null;
}>>;
export declare function validateCapabilityGrantForProductBasis(grant: unknown, policy: InvocationPolicyBasis | WorkspaceAuthorityBasis, actorRef: string, capabilityRef: string, basis: CapabilityGrantConstructionBasis): grant is CapabilityGrant;
export declare function constructInvocationAuthority(actorRef: string, workspaceBinding: WorkspaceBinding, catalogView: GraphFunctionCatalogView, programRef: string, selectedRow: GraphFunctionCatalogEntry, policy: InvocationPolicyBasis, capabilityGrants: readonly CapabilityGrant[], capabilityGrantBasis?: CapabilityGrantConstructionBasis): InvocationAuthority | InvocationConstructionRefusal;
export declare function constructDirectInvocation(workspaceBinding: WorkspaceBinding, catalogView: GraphFunctionCatalogView, program: Readonly<GtlProgram>, selectedRow: GraphFunctionCatalogEntry, rawRequest: RawAdmittedValue<unknown>, rawInput: RawAdmittedValue<unknown>, policy: InvocationPolicyBasis, capabilityGrants: readonly CapabilityGrant[], authority: InvocationAuthority): PublicInvocationCandidate | InvocationConstructionRefusal;
export declare function constructStartInvocation(workspaceBinding: WorkspaceBinding, catalogView: GraphFunctionCatalogView, program: Readonly<GtlProgram>, selectedRow: GraphFunctionCatalogEntry, rawRequest: RawAdmittedValue<unknown>, rawInput: RawAdmittedValue<unknown>, policy: InvocationPolicyBasis, capabilityGrants: readonly CapabilityGrant[], authority: InvocationAuthority): PublicInvocationCandidate | InvocationConstructionRefusal;
/**
 * Native exact-family construction. This consumes the admitted definition
 * invocation directly and shares only Product's semantic construction atom;
 * it does not manufacture or translate a legacy Public request carrier.
 */
export declare function constructExactDirectInvocation(publicInvocation: ExactDirectRunInvocation, workspaceBinding: WorkspaceBinding, catalogView: GraphFunctionCatalogView, program: Readonly<GtlProgram>, selectedRow: GraphFunctionCatalogEntry, rawInput: RawAdmittedValue<unknown>, policy: InvocationPolicyBasis, capabilityGrants: readonly CapabilityGrant[], authority: InvocationAuthority): PublicInvocationCandidate | InvocationConstructionRefusal;
/** Native exact-family start construction; no legacy request is manufactured. */
export declare function constructExactStartInvocation(publicInvocation: ExactStartRunInvocation, workspaceBinding: WorkspaceBinding, catalogView: GraphFunctionCatalogView, program: Readonly<GtlProgram>, selectedRow: GraphFunctionCatalogEntry, rawInput: RawAdmittedValue<unknown>, policy: InvocationPolicyBasis, capabilityGrants: readonly CapabilityGrant[], authority: InvocationAuthority): PublicInvocationCandidate | InvocationConstructionRefusal;
