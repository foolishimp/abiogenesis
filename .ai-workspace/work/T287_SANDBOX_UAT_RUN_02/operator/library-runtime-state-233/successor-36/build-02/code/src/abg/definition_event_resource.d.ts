import * as v from "valibot";
import type { VerifiedProductArtifact } from "../product/contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type InterruptedEventStoreSelection, type InterruptedEventStoreRecovery, type AbgEventStore, type DurablePrefixCoordinate, type EventStoreCloseHandoff } from "./event_store.js";
export type AbgEventResourceAssertion = Readonly<{
    readonly kind: "new_abg_event_resource";
    readonly schemaVersion: "5.0.0";
    readonly eventLogPath: string;
    readonly locatorDigest: Sha256Digest;
}> | Readonly<{
    readonly kind: "reopen_abg_event_resource";
    readonly schemaVersion: "5.0.0";
    readonly closeHandoff: EventStoreCloseHandoff;
    readonly handoffDigest: Sha256Digest;
}>;
export interface AbgEventResourceReceipt {
    readonly kind: "abg_event_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly acquisitionKind: "new" | "reopen";
    readonly entryPrefix: DurablePrefixCoordinate;
    readonly closeHandoff: EventStoreCloseHandoff;
    readonly receiptDigest: Sha256Digest;
}
export interface AcquiredAbgEventResource {
    readonly acquisitionKind: "new" | "reopen";
    readonly store: AbgEventStore;
    readonly entryPrefix: DurablePrefixCoordinate;
}
/** Native physical correspondence, issued only from an actual acquisition.
 * Its explicit prefix selects one operation entry; a copied value is not held. */
export interface AcquiredAbgEventResourceSelection {
    readonly kind: "acquired_abg_event_resource_selection";
    readonly schemaVersion: "5.0.0";
    readonly prefix: DurablePrefixCoordinate;
}
export type AbgEventResourceInput = AbgEventResourceAssertion | AcquiredAbgEventResourceSelection;
export type ReopenedAbgEventResourceInput = Extract<AbgEventResourceAssertion, {
    kind: "reopen_abg_event_resource";
}> | AcquiredAbgEventResourceSelection;
/** Operation completion is not physical release and contains no close handoff. */
export interface AbgEventResourceCompletion {
    readonly kind: "abg_event_resource_completion";
    readonly schemaVersion: "5.0.0";
    readonly acquisitionKind: "new" | "reopen";
    readonly entryPrefix: DurablePrefixCoordinate;
    readonly successor: AcquiredAbgEventResourceSelection;
    readonly receiptDigest: Sha256Digest;
}
export type AbgEventResourceOutcome = AbgEventResourceReceipt | AbgEventResourceCompletion;
export declare function selectAcquiredAbgEventResource(resource: AcquiredAbgEventResource, prefix: DurablePrefixCoordinate): AcquiredAbgEventResourceSelection;
export declare function isAcquiredAbgEventResourceSelection(value: unknown): value is AcquiredAbgEventResourceSelection;
export declare function assertAcquiredAbgEventResourceSelectionCurrent(selection: AcquiredAbgEventResourceSelection): void;
export declare function validateAbgEventResourceInput(value: unknown): value is AbgEventResourceInput;
export declare function validateReopenedAbgEventResourceInput(value: unknown): value is ReopenedAbgEventResourceInput;
export declare function abgEventResourceInputPrefix(input: ReopenedAbgEventResourceInput): DurablePrefixCoordinate;
export declare function abgEventResourceOutcomePrefix(outcome: AbgEventResourceOutcome): DurablePrefixCoordinate;
/** Physical owner relation for native completion at the live return boundary. */
export declare function acquiredAbgEventResourceCompletionCorresponds(entry: AcquiredAbgEventResourceSelection, completion: AbgEventResourceCompletion): boolean;
export declare function validateAbgEventResourceOutcome(value: unknown): value is AbgEventResourceOutcome;
/** Only a borrowed operation completes without releasing its enclosing owner. */
export declare function completeAbgEventResource(resource: AcquiredAbgEventResource, finalPrefix: DurablePrefixCoordinate): AbgEventResourceOutcome;
export type AbgEventResourceAdmission = Readonly<{
    readonly kind: "acquired_abg_event_resource";
    readonly resource: AcquiredAbgEventResource;
}> | Readonly<{
    readonly kind: "abg_event_resource_refusal";
    readonly code: "invalid_resource_assertion" | "invalid_locator" | "invalid_handoff" | "acquisition_refused" | "prefix_mismatch";
    readonly message: string;
}>;
export declare function abgEventLocatorDigest(eventLogPath: string): Sha256Digest;
export declare function abgEventHandoffDigest(handoff: EventStoreCloseHandoff): Sha256Digest;
/** Pure structural admission for an ABG event-resource assertion. */
export declare function validateAbgEventResourceAssertion(value: unknown): value is AbgEventResourceAssertion;
/** Pure structural admission for an owner-issued ABG resource receipt. */
export declare function validateAbgEventResourceReceipt(value: unknown): value is AbgEventResourceReceipt;
export declare function acquireAbgEventResource(assertion: AbgEventResourceInput): AbgEventResourceAdmission;
export declare function closeAbgEventResource(resource: AcquiredAbgEventResource, finalPrefix: DurablePrefixCoordinate): AbgEventResourceReceipt;
export declare function abandonAbgEventResource(resource: AcquiredAbgEventResource): void;
declare const recoveryRequestSchema: v.UnionSchema<[v.StrictObjectSchema<{
    readonly abandonedLock: v.StrictObjectSchema<{
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly bytesBase64: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly lastCloseHandoff: v.CustomSchema<EventStoreCloseHandoff, undefined>;
    readonly kind: v.LiteralSchema<"abg_interrupted_event_resource_recovery", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly expectedCurrent: v.StrictObjectSchema<{
        readonly byteLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly interruption: v.StrictObjectSchema<{
        readonly ownerPid: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly evidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly quiescenceEvidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly exclusiveMaintenance: v.LiteralSchema<true, undefined>;
    }, undefined>;
    readonly ownerArtifact: v.StrictObjectSchema<{
        readonly request: v.LazySchema<v.StrictObjectSchema<{
            readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>>;
        readonly verified: v.CustomSchema<VerifiedProductArtifact, undefined>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly recoveryCase: v.LiteralSchema<"lock_absent", undefined>;
    readonly lockPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
    readonly lastCloseHandoff: v.CustomSchema<EventStoreCloseHandoff, undefined>;
    readonly kind: v.LiteralSchema<"abg_interrupted_event_resource_recovery", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly expectedCurrent: v.StrictObjectSchema<{
        readonly byteLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly interruption: v.StrictObjectSchema<{
        readonly ownerPid: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly evidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly quiescenceEvidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly exclusiveMaintenance: v.LiteralSchema<true, undefined>;
    }, undefined>;
    readonly ownerArtifact: v.StrictObjectSchema<{
        readonly request: v.LazySchema<v.StrictObjectSchema<{
            readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>>;
        readonly verified: v.CustomSchema<VerifiedProductArtifact, undefined>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly abandonedLock: v.StrictObjectSchema<{
        readonly path: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly bytesBase64: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly initialOrigin: v.StrictObjectSchema<{
        readonly newResourceRequest: v.CustomSchema<Readonly<{
            readonly kind: "new_abg_event_resource";
            readonly schemaVersion: "5.0.0";
            readonly eventLogPath: string;
            readonly locatorDigest: Sha256Digest;
        }>, undefined>;
        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly evidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>;
    readonly kind: v.LiteralSchema<"abg_interrupted_event_resource_recovery", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly expectedCurrent: v.StrictObjectSchema<{
        readonly byteLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly interruption: v.StrictObjectSchema<{
        readonly ownerPid: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly evidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly quiescenceEvidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly exclusiveMaintenance: v.LiteralSchema<true, undefined>;
    }, undefined>;
    readonly ownerArtifact: v.StrictObjectSchema<{
        readonly request: v.LazySchema<v.StrictObjectSchema<{
            readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>>;
        readonly verified: v.CustomSchema<VerifiedProductArtifact, undefined>;
    }, undefined>;
}, undefined>, v.StrictObjectSchema<{
    readonly recoveryCase: v.LiteralSchema<"lock_absent", undefined>;
    readonly lockPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
    readonly initialOrigin: v.StrictObjectSchema<{
        readonly newResourceRequest: v.CustomSchema<Readonly<{
            readonly kind: "new_abg_event_resource";
            readonly schemaVersion: "5.0.0";
            readonly eventLogPath: string;
            readonly locatorDigest: Sha256Digest;
        }>, undefined>;
        readonly device: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly inode: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly evidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
    }, undefined>;
    readonly kind: v.LiteralSchema<"abg_interrupted_event_resource_recovery", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly expectedCurrent: v.StrictObjectSchema<{
        readonly byteLength: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
    }, undefined>;
    readonly interruption: v.StrictObjectSchema<{
        readonly ownerPid: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.SafeIntegerAction<number, undefined>, v.MinValueAction<number, 1, undefined>]>;
        readonly evidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly quiescenceEvidence: v.StrictObjectSchema<{
            readonly ref: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly digest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
        }, undefined>;
        readonly exclusiveMaintenance: v.LiteralSchema<true, undefined>;
    }, undefined>;
    readonly ownerArtifact: v.StrictObjectSchema<{
        readonly request: v.LazySchema<v.StrictObjectSchema<{
            readonly artifactPath: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "absolute_path">]>;
            readonly artifactRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedArtifactDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductContentDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedManifestDigest: v.GenericSchema<`sha256:${string}`, `sha256:${string}`>;
            readonly expectedProductId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageName: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
            readonly expectedPackageVersion: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, "nonblank_string">]>;
        }, undefined>>;
        readonly verified: v.CustomSchema<VerifiedProductArtifact, undefined>;
    }, undefined>;
}, undefined>], undefined>;
export type AbgInterruptedEventResourceRecoveryRequest = v.InferOutput<typeof recoveryRequestSchema>;
export declare const ABG_EVENT_RESOURCE_RECOVERY: Readonly<{
    readonly definitionRef: "native-maintenance://abiogenesis/event-resource/recover@5";
    readonly packageExport: "./abg";
    readonly namedSymbol: "recoverInterruptedAbgEventResource";
    readonly effects: readonly ["open_selected_log_and_lock_descriptors", "adopt_selected_abandoned_lock_or_acquire_selected_absent_lock", "close_selected_owner_and_release_exact_lock"];
}>;
export declare const ABG_EVENT_RESOURCE_RECOVERY_DIGEST: `sha256:${string}`;
/** Scope for externally resolved approval; computing it confers no permission. */
export declare function abgEventRecoveryScope(request: AbgInterruptedEventResourceRecoveryRequest): Readonly<{
    ref: string;
    digest: `sha256:${string}`;
}>;
export type AbgEventResourceRecoveryResult = Readonly<{
    kind: "abg_event_resource_recovery_refusal";
    code: "invalid_request" | "approval_mismatch" | "installed_owner_mismatch";
    message: string;
}> | Readonly<{
    kind: "abg_event_resource_recovery_receipt";
    schemaVersion: "5.0.0";
    requestDigest: Sha256Digest;
    actorRef: string;
    authorityRef: string;
    authorityDigest: Sha256Digest;
    approvalRef: string;
    approvalDigest: Sha256Digest;
    scopeDigest: Sha256Digest;
    executingOwner: Readonly<{
        artifactRef: string;
        artifactDigest: Sha256Digest;
        manifestDigest: Sha256Digest;
        packageExport: "./abg";
        namedSymbol: "recoverInterruptedAbgEventResource";
    }>;
    selection: InterruptedEventStoreSelection;
    outcome: InterruptedEventStoreRecovery;
    receiptDigest: Sha256Digest;
}>;
/** Actual verified installed owner, resolved external approval, then the finite physical owner.
 * Product verification and the resolved authority schema are the existing owners;
 * this native-only entry does not create a Public capability or authentication system. */
export declare function recoverInterruptedAbgEventResource(requestInput: unknown, authorityInput: unknown): Promise<AbgEventResourceRecoveryResult>;
export {};
