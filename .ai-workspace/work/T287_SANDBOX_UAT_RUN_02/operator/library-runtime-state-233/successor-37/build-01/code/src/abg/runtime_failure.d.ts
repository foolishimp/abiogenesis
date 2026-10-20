import { type JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { AbgEventStore, type DurablePrefixCoordinate } from "./event_store.js";
import { type OpenedTraversalScope } from "./open_call.js";
import { type ReplayState } from "./replay.js";
export interface RuntimeFailureAdmission {
    readonly kind: "runtime_failure_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "failed";
    readonly failureRef: string;
    readonly failureDigest: Sha256Digest;
    readonly basisId: string;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly stage: "c_call_open" | "hog_traversal" | "implementation_load" | "operation_application" | "output_contract" | "route";
    readonly subjectDigest: Sha256Digest;
    readonly diagnosticRef: string;
    readonly admissionEventRef: string;
}
export interface RuntimeFailureAdmissionReceipt {
    readonly kind: "runtime_failure_admission_receipt";
    readonly schemaVersion: "5.0.0";
    readonly admission: RuntimeFailureAdmission;
    readonly replayState: ReplayState;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface AdmitRuntimeFailureInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly scope: OpenedTraversalScope;
    readonly stage: RuntimeFailureAdmission["stage"];
    readonly subject: JsonValue;
    readonly diagnosticRef: string;
    readonly basis: RuntimeAdmissionBasis;
}
/** Only the caught exception's small diagnostic subject uses inline retention. */
export declare function constructRuntimeFailureDiagnosticRef(subject: JsonValue): string;
/** The existing opaque diagnostic locator also serves nonterminal owner evidence. */
export declare function readRuntimeFailureDiagnosticSubject(diagnosticRef: string): JsonValue | null;
/** Diagnostic prose is evidence only; the admitted event owns failed truth. */
export declare function projectRuntimeFailureEvidenceAtPrefix(prefix: ValidatedRuntimeEventPrefix): readonly JsonValue[];
export declare function admitRuntimeFailure(input: Readonly<AdmitRuntimeFailureInput>): RuntimeFailureAdmissionReceipt;
