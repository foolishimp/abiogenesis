import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type RuntimeEventCalculusProjection } from "./event_calculus.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type RuntimeEvent } from "./event_store.js";
export interface ReplayContinuationState {
    readonly continuationRef: string;
    readonly continuationDigest: Sha256Digest;
    readonly continuationKind: "fh_interaction";
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly actorCapabilityRef: string;
    readonly requestContractRef: string;
    readonly responseContractRef: string;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly heldCursorRef: string;
    readonly heldCursorDigest: Sha256Digest;
    readonly constructionIntentRef: string | null;
    readonly constructionIntentDigest: Sha256Digest | null;
    readonly responseRef: string | null;
    readonly responseDigest: Sha256Digest | null;
    readonly responseValue: JsonValue | null;
    readonly successorInputRef: string | null;
    readonly successorInputDigest: Sha256Digest | null;
    readonly successorInputValue: JsonValue | null;
    readonly successorInputContractRef: string | null;
    readonly successorInputValueKind: string | null;
    readonly successorCursorRef: string | null;
    readonly successorCursorDigest: Sha256Digest | null;
    readonly openedEventRef: string;
    readonly respondedEventRef: string | null;
    readonly respondedPublicOperationEventRef: string | null;
    readonly resumedEventRef: string | null;
    readonly resumedPublicOperationEventRef: string | null;
    readonly terminalEventRef: string | null;
    readonly status: "abandoned" | "open" | "responded" | "resolved" | "superseded";
}
export interface FhEffectfulPublicInvocationFact {
    readonly operationId: "abg.operation.interaction.respond" | "abg.operation.run.continue";
    readonly publicInvocationRef: string;
    readonly ownerInvocationRef: string;
    readonly ownerInvocationDigest: Sha256Digest;
    readonly publicOperationEventRef: string;
    readonly admissionEventRef: string;
}
export type FhEffectfulPublicInvocationFactProjection = Readonly<{
    readonly disposition: "valid";
    readonly facts: readonly FhEffectfulPublicInvocationFact[];
}> | Readonly<{
    readonly disposition: "invalid_history";
    readonly eventRefs: readonly string[];
}>;
export declare function validateExactFhResumeOwnerRelationAtPrefix(authorityPrefix: ValidatedRuntimeEventPrefix, resumeEvent: RuntimeEvent): boolean;
export declare function projectFhContinuations(prefix: ValidatedRuntimeEventPrefix, eventCalculus: RuntimeEventCalculusProjection, authorityPrefix?: ValidatedRuntimeEventPrefix): readonly ReplayContinuationState[];
export declare function projectFhEffectfulPublicInvocationFacts(prefix: ValidatedRuntimeEventPrefix): FhEffectfulPublicInvocationFactProjection;
