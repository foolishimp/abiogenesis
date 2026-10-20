import type { GraphFunction, GtlProgram, ModulePublication } from "../gtl/contracts.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import { type CTraversalCoordinate } from "../gtl/source_path.js";
import { type CapabilityGrant, type DeclarationApplication, type GraphFunctionCatalogView, type InvocationAuthority, type InvocationPolicyBasis, type ProductInvocationSourceResultBasis, type ProductExecutionResolution, type ProductInstall, type ExecutionDeclarationOwnerCoordinate, type PublicInvocationCandidate, type RunInvocationVariant, type WorkspaceBinding } from "../product/index.js";
import type { ExactDirectRunInvocation, ExactStartRunInvocation } from "../product/invocation.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type ProgramValidation } from "../validator/validation.js";
import { type RawAdmittedValue } from "../validator/raw_admission.js";
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import { type EffectfulPublicInvocationPriorAdmission, type EffectfulPublicInvocationTruth } from "./effectful_invocation_truth.js";
import { type AbgAdmissionRefusal, type PublicOperationAdmissionBasis } from "./environment_admission.js";
import { AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type RunEnvironmentEvidence } from "./stdo_environment.js";
export interface InvocationAdmissionInput {
    readonly runEnvironment?: RunEnvironmentEvidence;
    readonly invocation: PublicInvocationCandidate;
    readonly rawRequest: RawAdmittedValue<unknown>;
    readonly rawInput: RawAdmittedValue<unknown>;
    readonly programPublication: Readonly<ModulePublication>;
    readonly executionResolution: ProductExecutionResolution;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly programValidation: ProgramValidation;
    readonly workspaceBinding: WorkspaceBinding;
    readonly artifactTruth: ExactPrefixArtifactTruthProjection;
    readonly catalogView: GraphFunctionCatalogView;
    readonly catalogApplications?: readonly DeclarationApplication[];
    readonly catalogApplicationResources?: readonly CatalogApplicationResources[];
    readonly policy: InvocationPolicyBasis;
    readonly capabilityGrants: readonly CapabilityGrant[];
    readonly authority: InvocationAuthority;
    readonly reentryBasis?: InvocationReentryBasis;
    readonly sourceResultBasis?: ProductInvocationSourceResultBasis;
}
export interface ExactInvocationAdmissionInput extends Omit<InvocationAdmissionInput, "rawRequest"> {
    readonly publicInvocation: ExactDirectRunInvocation | ExactStartRunInvocation;
}
export interface InvocationReentryBasis {
    readonly kind: "invocation_reentry_basis";
    readonly schemaVersion: "5.0.0";
    readonly publicAuthorityDigest: Sha256Digest;
    readonly sourceInvocationAdmissionRef: string;
    readonly sourceRunId: string;
    readonly sourceRouteRef: string;
    readonly sourceRouteDigest: Sha256Digest;
    readonly sourceRouteEventRef: string;
    readonly sourceRunStoppedEventRef: string;
    readonly gapRef: string;
    readonly nextActionProjectionRef: string;
    readonly nextActionProjectionDigest: Sha256Digest;
    readonly productSetId: string;
    readonly productSetDigest: Sha256Digest;
    readonly lockId: string;
    readonly lockDigest: Sha256Digest;
    readonly sourceStart: PublicStartAdmissionIdentity;
}
export interface PublicStartAdmissionIdentity {
    readonly kind: "public_start_identity";
    readonly schemaVersion: "5.0.0";
    readonly programRef: string;
    readonly graphFunctionRef: string;
    readonly startRef: string;
    readonly scope: "program";
    readonly target: string;
    readonly until: "converged";
    readonly rootMode: "direct" | "supervised";
}
export interface InvocationAdmission {
    readonly kind: "invocation_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly invocationAdmissionRef: string;
    readonly invocationAdmissionDigest: Sha256Digest;
    readonly invocationRef: string;
    readonly invocationDigest: Sha256Digest;
    readonly invocationVariant: RunInvocationVariant;
    readonly rawInputAdmissionRef: string;
    readonly rawInputDigest: Sha256Digest;
    readonly publicRequestAdmissionRef: string;
    readonly publicRequestDigest: Sha256Digest;
    readonly publicRequestInvocationRef: string;
    readonly workspaceId: string;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly catalogBasisRef: string;
    readonly catalogBasisDigest: Sha256Digest;
    readonly catalogViewId: string;
    readonly catalogViewDigest: Sha256Digest;
    readonly catalogApplicationRefs: readonly string[];
    readonly catalogApplicationDigests: readonly Sha256Digest[];
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly catalogHandle: string;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly selectedDefinitionRef: string;
    readonly selectedDefinitionDigest: Sha256Digest;
    readonly gtlEntryCoordinate: CTraversalCoordinate;
    readonly gtlEntryTerm: Readonly<CProgramNode>;
    readonly inputContractRef: string;
    readonly inputContractDigest: Sha256Digest;
    readonly inputContractOwner: ExecutionDeclarationOwnerCoordinate;
    readonly outputContractRef: string;
    readonly outputContractDigest: Sha256Digest;
    readonly outputContractOwner: ExecutionDeclarationOwnerCoordinate;
    readonly productExecutionResolutionRef: string;
    readonly productExecutionResolutionDigest: Sha256Digest;
    readonly programValidationRef: string;
    readonly programValidationDigest: Sha256Digest;
    readonly policyRef: string;
    readonly policyDigest: Sha256Digest;
    readonly capabilityGrants: readonly CapabilityGrant[];
    readonly capabilityGrantRefs: readonly string[];
    readonly authorityRef: string;
    readonly authorityDigest: Sha256Digest;
    readonly actorRef: string;
    readonly publicStart: PublicStartAdmissionIdentity | null;
    readonly reentryBasis: InvocationReentryBasis | null;
    readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
    readonly runEnvironment?: RunEnvironmentEvidence;
    readonly publicOperationEventRef: string;
    readonly admissionEventRef: string;
}
export interface InvocationAdmissionReceipt {
    readonly kind: "invocation_admission_receipt";
    readonly schemaVersion: "5.0.0";
    readonly admission: InvocationAdmission;
    readonly successorPrefix: DurablePrefixCoordinate;
}
type InvocationAdmissionSemanticRefusalCode = "authority_mismatch" | "basis_fork_detected" | "capability_mismatch" | "catalog_view_not_admitted" | "contract_mismatch" | "invocation_not_constructed" | "selection_mismatch" | "validation_mismatch" | "workspace_not_admitted";
interface InvocationAdmissionSemanticRefusal {
    readonly kind: "invocation_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: InvocationAdmissionSemanticRefusalCode;
    readonly message: string;
}
export interface DuplicateInvocationAdmissionRefusal {
    readonly kind: "invocation_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "duplicate_invocation";
    readonly message: string;
    readonly priorAdmission: EffectfulPublicInvocationPriorAdmission;
}
export type InvocationAdmissionRefusal = InvocationAdmissionSemanticRefusal | DuplicateInvocationAdmissionRefusal;
export type InvocationAdmissionResult = InvocationAdmissionReceipt | InvocationAdmissionRefusal | AbgAdmissionRefusal | Extract<EffectfulPublicInvocationTruth, {
    readonly disposition: "invalid_history";
}>;
export interface InvocationSourceResultDerivationInput {
    readonly publicAuthorityDigest: Sha256Digest;
    readonly runtimeInvocationRef: string;
    readonly invocationAdmissionRef: string;
    readonly runId: string;
    readonly resultRef: string;
}
export declare function isInvocationSourceResultBasis(value: object): value is ProductInvocationSourceResultBasis;
export declare function deriveInvocationSourceResultBasisAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: InvocationSourceResultDerivationInput): ProductInvocationSourceResultBasis | null;
/** Reopens no authority: it reidentifies one asserted source basis in-place. */
export declare function rehydrateInvocationSourceResultBasisAtDurablePrefix(prefix: DurablePrefixCoordinate, asserted: ProductInvocationSourceResultBasis): ProductInvocationSourceResultBasis | null;
export declare function validateInvocationCapabilityBasis(input: Readonly<{
    actorRef: string;
    capabilityGrants: readonly CapabilityGrant[];
    catalogApplications?: readonly DeclarationApplication[];
    memberKey: "invoke" | "start";
    policy: InvocationPolicyBasis;
    productInstalls: readonly ProductInstall[];
    program: Readonly<GtlProgram>;
    programValidation: ProgramValidation;
    workspaceBinding: WorkspaceBinding;
}>): InvocationAdmissionRefusal | null;
export declare function hasAdmittedInvocation(store: AbgEventStore, admission: InvocationAdmission): boolean;
export declare function hasAdmittedInvocationAtPrefix(prefix: ValidatedRuntimeEventPrefix, admission: InvocationAdmission): boolean;
export declare function hasInvocationRunBindingAtPrefix(prefix: ValidatedRuntimeEventPrefix, admission: InvocationAdmission, runId: string): boolean;
export declare function rehydrateInvocationAdmissionAtPrefix(prefix: ValidatedRuntimeEventPrefix, invocationAdmissionRef: string): InvocationAdmission | null;
export declare function admitInvocation(store: AbgEventStore, input: InvocationAdmissionInput, basis: PublicOperationAdmissionBasis): InvocationAdmissionResult;
/**
 * ABG admission for the exact Public family. It consumes the admitted
 * invocation directly; no old Public request is synthesized or parsed.
 */
export declare function admitExactInvocation(store: AbgEventStore, input: ExactInvocationAdmissionInput, basis: PublicOperationAdmissionBasis): InvocationAdmissionResult;
import { type CatalogApplicationResources } from "../product/declaration_application.js";
export {};
