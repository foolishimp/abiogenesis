import { type Sha256Digest } from "../shared/digests.js";
import { type AbgEventStore, type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type ExecutionBasis } from "../abg/execution_basis.js";
import { type AdmittedCCallResult } from "../abg/c_call.js";
import type { ProductPublicContract } from "./contracts.js";
export declare const RESULT_ASSESS_CAPABILITY: "abg.capability.runtime.admit-fp-result@5";
export interface RefDigest<T = unknown> {
    readonly ref: string;
    readonly digest: Sha256Digest;
}
export type RuntimeResult = AdmittedCCallResult;
export type ResultAssessmentDisposition = "admitted" | "blocked" | "rejected" | "retry";
export interface ResultAssessmentResidual {
    readonly kind: "typed_residual";
    readonly code: string;
    readonly subjectRef: string;
    readonly message: string;
}
export interface DeclaredResultAssessmentValue {
    readonly kind: "result_assessment_value";
    readonly schemaVersion: "5.0.0";
    readonly expectedResult: RefDigest<RuntimeResult>;
    readonly disposition: ResultAssessmentDisposition;
    readonly closureEligible: boolean;
    readonly residuals: readonly ResultAssessmentResidual[];
}
export interface ContractAdmittedAssessmentValue {
    readonly kind: "contract_admitted_assessment_value";
    readonly schemaVersion: "5.0.0";
    readonly contract: RefDigest<ProductPublicContract>;
    readonly valueRef: string;
    readonly valueDigest: Sha256Digest;
    readonly value: DeclaredResultAssessmentValue;
}
export interface ResultAssessPacket {
    readonly kind: "result_assess_packet";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "assess";
    readonly expectedResult: RefDigest<RuntimeResult>;
    readonly assessmentContract: RefDigest<ProductPublicContract>;
    readonly assessment: ContractAdmittedAssessmentValue;
    readonly evidence: readonly RefDigest[];
    readonly currentBasis: RefDigest<ExecutionBasis>;
}
export interface ResultAssessmentCapabilityGrant {
    readonly kind: "result_assessment_capability_grant";
    readonly schemaVersion: "5.0.0";
    readonly grantRef: string;
    readonly grantDigest: Sha256Digest;
    readonly actorRef: string;
    readonly operationId: "abg.operation.result.assess";
    readonly capabilityRef: typeof RESULT_ASSESS_CAPABILITY;
}
export interface ResultAssessmentInvocationAuthority {
    readonly kind: "result_assessment_invocation_authority";
    readonly schemaVersion: "5.0.0";
    readonly authorityRef: string;
    readonly authorityDigest: Sha256Digest;
    readonly invocationRef: string;
    readonly invocationDigest: Sha256Digest;
    readonly actor: RefDigest;
    readonly capabilityGrant: ResultAssessmentCapabilityGrant;
    readonly currentBasis: RefDigest<ExecutionBasis>;
}
export interface ResultAssessmentOperationContext {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly assessmentContract: ProductPublicContract;
    readonly invocationAuthority: ResultAssessmentInvocationAuthority;
    readonly eventTime: string;
    readonly correlationId: string;
    readonly causationEventRefs: readonly string[];
}
export interface ResultAssessmentTruth {
    readonly expectedResult: RefDigest<RuntimeResult>;
    readonly assessmentContract: RefDigest<ProductPublicContract>;
    readonly assessmentValue: RefDigest<DeclaredResultAssessmentValue>;
    readonly disposition: ResultAssessmentDisposition;
    readonly closureEligible: boolean;
    readonly residuals: readonly ResultAssessmentResidual[];
    readonly evidence: readonly RefDigest[];
    readonly currentBasis: RefDigest<ExecutionBasis>;
    readonly actor: RefDigest;
    readonly capabilityGrant: RefDigest<ResultAssessmentCapabilityGrant>;
    readonly invocation: RefDigest;
}
export interface ResultAssessResult {
    readonly kind: "result_assess_result";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "assess";
    readonly assessment: RefDigest<ResultAssessmentTruth>;
    readonly disposition: "admitted" | "rejected";
    readonly closureEligible: boolean;
    readonly residuals: readonly ResultAssessmentResidual[];
    readonly evidence: readonly RefDigest[];
}
export interface ResultAssessNonTerminal {
    readonly kind: "result_assess_non_terminal";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: "assess";
    readonly assessment: RefDigest<ResultAssessmentTruth>;
    readonly disposition: "blocked" | "retry";
    readonly closureEligible: false;
    readonly residuals: readonly ResultAssessmentResidual[];
    readonly evidence: readonly RefDigest[];
}
export type ResultAssessmentRefusalCode = "basis_mismatch" | "capability_mismatch" | "contract_mismatch" | "digest_mismatch" | "evidence_mismatch" | "result_mismatch" | "value_mismatch";
export interface ResultAssessmentRefusal {
    readonly kind: "result_assessment_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly memberKey: "assess";
    readonly code: ResultAssessmentRefusalCode;
    readonly message: string;
    readonly issuePaths: readonly string[];
    readonly evidenceRefs: readonly string[];
}
export type ResultAssessmentOperationResult = ResultAssessResult | ResultAssessNonTerminal | ResultAssessmentRefusal;
export declare function assessResult(supplied: ResultAssessPacket, suppliedContext?: ResultAssessmentOperationContext): ResultAssessmentOperationResult;
export declare const ResultAssessmentPort: Readonly<{
    assess: typeof assessResult;
}>;
export declare const RESULT_OPERATION_CONTRACTS: Readonly<{
    assess: typeof assessResult;
}>;
