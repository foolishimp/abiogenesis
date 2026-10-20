import { type Sha256Digest } from "../shared/digests.js";
import type { ExecutionBasis } from "./execution_basis.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { InvocationAdmission } from "./invocation_admission.js";
import type { RuntimeEvent } from "./event_store.js";
import { type AbgHistoricalDeclarationReference } from "./terminal_result_contracts.js";
/** Selector only: the historical resource/closed-child owner authenticates the
 * complete matching Catalog. Catalog admission equates basis/readiness digests. */
export declare function governanceHistoricalDeclarationReferenceAtPrefix(prefix: ValidatedRuntimeEventPrefix, invocation: InvocationAdmission, sourceBasis: ExecutionBasis): AbgHistoricalDeclarationReference | null;
/** Current consumer applicability derives from existing admitted coordinates.
 * Complete declaration meaning was validated before invocation admission;
 * current source membership, ancestry and per-observation cover remain exact. */
export declare function hasAdmittedGovernanceCoveredSourceUse(prefix: ValidatedRuntimeEventPrefix, invocation: InvocationAdmission, sourceBasis?: ExecutionBasis): boolean;
/** The invocation/source admission already checked this immutable relation.
 * Internal consumers transport exact Result identity, without cold derivation
 * or a new grant. This does not establish mutable currentness/independence. */
export declare function hasAdmittedGovernanceSourceUse(invocation: InvocationAdmission, event: RuntimeEvent): boolean;
export declare function projectExactInvocationAdmissionAtPrefix(prefix: ValidatedRuntimeEventPrefix, invocationAdmissionRef: string): InvocationAdmission | null;
export interface ExactRunInvocationFact {
    readonly operationId: "abg.operation.run.invoke";
    readonly publicInvocationRef: string;
    readonly ownerInvocationRef: string;
    readonly ownerInvocationDigest: Sha256Digest;
    readonly publicOperationEventRef: string;
    readonly admissionEventRef: string;
}
export type ExactRunInvocationFacts = Readonly<{
    disposition: "valid";
    facts: readonly ExactRunInvocationFact[];
}> | Readonly<{
    disposition: "invalid_history";
    eventRefs: readonly string[];
}>;
export declare function projectExactRunInvocationFactsAtPrefix(prefix: ValidatedRuntimeEventPrefix): ExactRunInvocationFacts;
export declare function hasExactInvocationAdmissionAtPrefix(prefix: ValidatedRuntimeEventPrefix, admission: InvocationAdmission): boolean;
export declare function hasExactInvocationRunBindingAtPrefix(prefix: ValidatedRuntimeEventPrefix, admission: InvocationAdmission, runId: string): boolean;
export declare function projectExactExecutionBasisAtPrefix(prefix: ValidatedRuntimeEventPrefix, basisRef: string): ExecutionBasis | null;
