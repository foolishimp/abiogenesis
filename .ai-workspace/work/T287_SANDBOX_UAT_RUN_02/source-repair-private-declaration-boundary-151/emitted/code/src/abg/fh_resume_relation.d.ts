import type { ClosureContract } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type ExecutionBasis } from "./execution_basis.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
export interface FhResumeSuccessorInput {
    readonly kind: "fh_resume_successor_input";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly inputValue: Readonly<Record<string, JsonValue>>;
    readonly inputContractRef: string | null;
    readonly inputValueKind: string | null;
}
export interface FhResumeSuccessorCarrier {
    readonly inputContractRef: string | null;
    readonly inputValueKind: string | null;
}
export interface FhResumeContinuationBasis {
    readonly continuationRef: string;
    readonly status: "abandoned" | "open" | "responded" | "resolved" | "superseded";
    readonly responseContractRef: string;
    readonly constructionIntentRef: string | null;
    readonly constructionIntentDigest: Sha256Digest | null;
    readonly responseRef: string | null;
    readonly responseDigest: Sha256Digest | null;
    readonly responseValue: JsonValue | null;
    readonly openedEventRef: string;
    readonly respondedEventRef: string | null;
    readonly respondedPublicOperationEventRef: string | null;
}
export interface FhResumeOperationBasis {
    readonly admissionEventRef: string;
}
export declare function deriveFhResumeSuccessorInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, continuation: FhResumeContinuationBasis, operation: FhResumeOperationBasis, executionBasis: ExecutionBasis, closureContract: Readonly<ClosureContract>, successorCarrier: FhResumeSuccessorCarrier): FhResumeSuccessorInput;
