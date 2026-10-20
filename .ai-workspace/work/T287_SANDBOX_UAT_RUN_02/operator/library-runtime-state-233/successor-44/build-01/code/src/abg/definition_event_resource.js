import * as v from "valibot";
import { readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { absolutePathSchema, digestSchema, nonblankSchema, refDigestSchema } from "../shared/public_function_contracts.js";
import { ADMISSION_CAPABILITY_DATA_SCHEMA, RESOLVED_ADMISSION_AUTHORITY_SCHEMA } from "../product/admission_authority.js";
import { verifyProduct, isVerifiedProductArtifact } from "../product/verify_product.js";
import { isRecord } from "../shared/admission_predicates.js";
import { isAbsolute, resolve } from "node:path";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { recoverInterruptedEventStore, closeHeldEventStoreAtDurablePrefix, assertHeldEventStoreAtDurablePrefix, selectHeldEventStoreDurablePrefix, createNewEmptyAppendSink, reopenEventStore, validateDurablePrefixCoordinate, validateEventStoreCloseHandoff, } from "./event_store.js";
const acquiredSelections = new WeakMap();
const borrowedResources = new WeakSet();
/** The store owns descriptor liveness and its committed cut. This operation
 * boundary also observes ordinary pathname replacement or extent loss without
 * rereading historical bytes. Same-inode outside content edits are unsupported. */
function assertAcquiredResourceCurrent(resource, prefix) {
    assertHeldEventStoreAtDurablePrefix(resource.store, prefix);
    const status = statSync(fileURLToPath(prefix.eventLogRef));
    if (!status.isFile() || status.dev !== prefix.storeIdentity.device || status.ino !== prefix.storeIdentity.inode ||
        status.size !== prefix.prefixLength)
        throw new TypeError("acquired ABG event source identity or extent differs from its selected prefix");
}
export function selectAcquiredAbgEventResource(resource, prefix) {
    assertAcquiredResourceCurrent(resource, prefix);
    const ownedPrefix = selectHeldEventStoreDurablePrefix(resource.store);
    const selection = deepFreeze({ kind: "acquired_abg_event_resource_selection",
        schemaVersion: "5.0.0", prefix: ownedPrefix });
    acquiredSelections.set(selection, { acquisitionKind: resource.acquisitionKind,
        store: resource.store, entryPrefix: ownedPrefix });
    return selection;
}
export function isAcquiredAbgEventResourceSelection(value) {
    return isRecord(value) && acquiredSelections.has(value);
}
export function assertAcquiredAbgEventResourceSelectionCurrent(selection) {
    const resource = acquiredSelections.get(selection);
    if (resource === undefined)
        throw new TypeError("native selection has no acquired owner");
    assertAcquiredResourceCurrent(resource, selection.prefix);
}
export function validateAbgEventResourceInput(value) {
    return isAcquiredAbgEventResourceSelection(value) || validateAbgEventResourceAssertion(value);
}
export function validateReopenedAbgEventResourceInput(value) {
    return isAcquiredAbgEventResourceSelection(value) ||
        (validateAbgEventResourceAssertion(value) && value.kind === "reopen_abg_event_resource");
}
export function abgEventResourceInputPrefix(input) {
    return input.kind === "acquired_abg_event_resource_selection" ? input.prefix : input.closeHandoff.prefix;
}
export function abgEventResourceOutcomePrefix(outcome) {
    return outcome.kind === "abg_event_resource_completion" ? outcome.successor.prefix : outcome.closeHandoff.prefix;
}
/** Physical owner relation for native completion at the live return boundary. */
export function acquiredAbgEventResourceCompletionCorresponds(entry, completion) {
    const before = acquiredSelections.get(entry), after = acquiredSelections.get(completion.successor);
    if (before === undefined || after === undefined || before.store !== after.store ||
        completion.entryPrefix.coordinateDigest !== entry.prefix.coordinateDigest)
        return false;
    try {
        assertAcquiredResourceCurrent(after, completion.successor.prefix);
        return true;
    }
    catch {
        return false;
    }
}
export function validateAbgEventResourceOutcome(value) {
    if (validateAbgEventResourceReceipt(value))
        return true;
    if (!isRecord(value) || value.kind !== "abg_event_resource_completion" || value.schemaVersion !== "5.0.0" ||
        Object.keys(value).sort().join("\0") !== ["kind", "schemaVersion", "acquisitionKind", "entryPrefix", "successor", "receiptDigest"].sort().join("\0") ||
        (value.acquisitionKind !== "new" && value.acquisitionKind !== "reopen") ||
        !validateDurablePrefixCoordinate(value.entryPrefix) || !isAcquiredAbgEventResourceSelection(value.successor))
        return false;
    const { receiptDigest, ...body } = value;
    return receiptDigest === sha256Canonical(body);
}
/** Only a borrowed operation completes without releasing its enclosing owner. */
export function completeAbgEventResource(resource, finalPrefix) {
    if (!borrowedResources.has(resource))
        return closeAbgEventResource(resource, finalPrefix);
    const body = { kind: "abg_event_resource_completion", schemaVersion: "5.0.0",
        acquisitionKind: resource.acquisitionKind, entryPrefix: resource.entryPrefix,
        successor: selectAcquiredAbgEventResource(resource, finalPrefix) };
    return deepFreeze({ ...body, receiptDigest: sha256Canonical(body) });
}
export function abgEventLocatorDigest(eventLogPath) {
    return sha256Canonical({
        kind: "abg_event_log_locator",
        eventLogPath: resolve(eventLogPath),
    });
}
export function abgEventHandoffDigest(handoff) {
    return sha256Canonical(handoff);
}
function refusal(code, message) {
    return deepFreeze({
        kind: "abg_event_resource_refusal",
        code,
        message,
    });
}
function exactIJson(value) {
    try {
        canonicalJson(value);
        return true;
    }
    catch {
        return false;
    }
}
/** Pure structural admission for an ABG event-resource assertion. */
export function validateAbgEventResourceAssertion(value) {
    if (!isRecord(value) || !exactIJson(value))
        return false;
    if (value.kind === "new_abg_event_resource") {
        return value.schemaVersion === "5.0.0" &&
            Object.keys(value).sort().join("\0") ===
                ["eventLogPath", "kind", "locatorDigest", "schemaVersion"].sort()
                    .join("\0") &&
            typeof value.eventLogPath === "string" &&
            isAbsolute(value.eventLogPath) &&
            value.locatorDigest === abgEventLocatorDigest(value.eventLogPath);
    }
    return value.kind === "reopen_abg_event_resource" &&
        value.schemaVersion === "5.0.0" &&
        Object.keys(value).sort().join("\0") ===
            ["closeHandoff", "handoffDigest", "kind", "schemaVersion"].sort()
                .join("\0") &&
        validateEventStoreCloseHandoff(value.closeHandoff) &&
        value.handoffDigest === abgEventHandoffDigest(value.closeHandoff);
}
/** Pure structural admission for an owner-issued ABG resource receipt. */
export function validateAbgEventResourceReceipt(value) {
    if (!isRecord(value) ||
        !exactIJson(value) ||
        Object.keys(value).sort().join("\0") !==
            [
                "acquisitionKind",
                "closeHandoff",
                "entryPrefix",
                "kind",
                "receiptDigest",
                "schemaVersion",
            ].sort().join("\0") ||
        value.kind !== "abg_event_resource_receipt" ||
        value.schemaVersion !== "5.0.0" ||
        (value.acquisitionKind !== "new" && value.acquisitionKind !== "reopen") ||
        !validateDurablePrefixCoordinate(value.entryPrefix) ||
        !validateEventStoreCloseHandoff(value.closeHandoff))
        return false;
    const body = {
        kind: value.kind,
        schemaVersion: value.schemaVersion,
        acquisitionKind: value.acquisitionKind,
        entryPrefix: value.entryPrefix,
        closeHandoff: value.closeHandoff,
    };
    return value.receiptDigest === sha256Canonical(body);
}
export function acquireAbgEventResource(assertion) {
    if (assertion.kind === "acquired_abg_event_resource_selection") {
        const selected = acquiredSelections.get(assertion);
        if (selected === undefined)
            return refusal("invalid_resource_assertion", "native selection has no acquired owner");
        try {
            assertAcquiredResourceCurrent(selected, assertion.prefix);
            const resource = { ...selected };
            borrowedResources.add(resource);
            return { kind: "acquired_abg_event_resource", resource };
        }
        catch (cause) {
            return refusal("acquisition_refused", String(cause));
        }
    }
    if (!exactIJson(assertion)) {
        return refusal("invalid_resource_assertion", "ABG event resources require one exact I-JSON assertion");
    }
    if (assertion.kind === "new_abg_event_resource") {
        if (assertion.schemaVersion !== "5.0.0" ||
            Object.keys(assertion).sort().join("\0") !==
                ["eventLogPath", "kind", "locatorDigest", "schemaVersion"].sort().join("\0") ||
            !isAbsolute(assertion.eventLogPath) ||
            assertion.locatorDigest !== abgEventLocatorDigest(assertion.eventLogPath)) {
            return refusal("invalid_locator", "new ABG event resources require one exact absolute locator and digest");
        }
        const acquired = createNewEmptyAppendSink({
            kind: "new_empty_append_sink_request",
            schemaVersion: "5.0.0",
            eventLogPath: assertion.eventLogPath,
        });
        if (!("store" in acquired)) {
            return refusal("acquisition_refused", `${acquired.code}: ${acquired.message}`);
        }
        return {
            kind: "acquired_abg_event_resource",
            resource: {
                acquisitionKind: "new",
                store: acquired.store,
                entryPrefix: acquired.prefix,
            },
        };
    }
    if (assertion.kind !== "reopen_abg_event_resource" ||
        assertion.schemaVersion !== "5.0.0" ||
        Object.keys(assertion).sort().join("\0") !==
            ["closeHandoff", "handoffDigest", "kind", "schemaVersion"].sort().join("\0") ||
        !validateEventStoreCloseHandoff(assertion.closeHandoff) ||
        assertion.handoffDigest !== abgEventHandoffDigest(assertion.closeHandoff)) {
        return refusal("invalid_handoff", "reopened ABG event resources require one exact owner-issued handoff");
    }
    const reopened = reopenEventStore(assertion.closeHandoff.reopenAuthority);
    if (reopened.kind !== "reopened_event_store_context") {
        return refusal("acquisition_refused", `${reopened.code}: ${reopened.message}`);
    }
    if (sha256Canonical(reopened.prefix) !==
        sha256Canonical(assertion.closeHandoff.prefix)) {
        reopened.store.closeDurableLog();
        return refusal("prefix_mismatch", "reopened ABG event resource differs from its owner-issued prefix");
    }
    return {
        kind: "acquired_abg_event_resource",
        resource: {
            acquisitionKind: "reopen",
            store: reopened.store,
            entryPrefix: reopened.prefix,
        },
    };
}
export function closeAbgEventResource(resource, finalPrefix) {
    assertAcquiredResourceCurrent(resource, finalPrefix);
    const closeHandoff = closeHeldEventStoreAtDurablePrefix(resource.store, finalPrefix);
    const body = {
        kind: "abg_event_resource_receipt",
        schemaVersion: "5.0.0",
        acquisitionKind: resource.acquisitionKind,
        entryPrefix: resource.entryPrefix,
        closeHandoff,
    };
    return deepFreeze({
        ...body,
        receiptDigest: sha256Canonical(body),
    });
}
export function abandonAbgEventResource(resource) {
    if (!borrowedResources.has(resource))
        resource.store.closeDurableLog();
}
/** Closed native maintenance data; it does not extend Public new/reopen or grant Run authority. */
const recoveryRequestEntries = {
    kind: v.literal("abg_interrupted_event_resource_recovery"), schemaVersion: v.literal("5.0.0"),
    expectedCurrent: v.strictObject({ byteLength: v.pipe(v.number(), v.safeInteger(), v.minValue(0)), digest: digestSchema }),
    interruption: v.strictObject({ ownerPid: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
        evidence: refDigestSchema, quiescenceEvidence: refDigestSchema, exclusiveMaintenance: v.literal(true) }),
    ownerArtifact: v.strictObject({ request: v.lazy(() => ADMISSION_CAPABILITY_DATA_SCHEMA.entries.ownerArtifact.entries.request),
        verified: v.custom(isVerifiedProductArtifact) }),
};
const priorRecoveryOrigin = { lastCloseHandoff: v.custom(validateEventStoreCloseHandoff) };
const initialRecoveryOrigin = { initialOrigin: v.strictObject({
        newResourceRequest: v.custom(value => validateAbgEventResourceAssertion(value) && value.kind === "new_abg_event_resource"),
        device: v.pipe(v.number(), v.safeInteger(), v.minValue(0)), inode: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
        evidence: refDigestSchema,
    }) };
const abandonedRecoveryOwnership = {
    abandonedLock: v.strictObject({ path: absolutePathSchema, device: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
        inode: v.pipe(v.number(), v.safeInteger(), v.minValue(0)), bytesBase64: nonblankSchema, digest: digestSchema }),
};
const unheldRecoveryOwnership = { recoveryCase: v.literal("lock_absent"), lockPath: absolutePathSchema };
const recoveryRequestSchema = v.union([
    v.strictObject({ ...recoveryRequestEntries, ...priorRecoveryOrigin, ...abandonedRecoveryOwnership }),
    v.strictObject({ ...recoveryRequestEntries, ...priorRecoveryOrigin, ...unheldRecoveryOwnership }),
    v.strictObject({ ...recoveryRequestEntries, ...initialRecoveryOrigin, ...abandonedRecoveryOwnership }),
    v.strictObject({ ...recoveryRequestEntries, ...initialRecoveryOrigin, ...unheldRecoveryOwnership }),
]);
export const ABG_EVENT_RESOURCE_RECOVERY = deepFreeze({
    definitionRef: "native-maintenance://abiogenesis/event-resource/recover@5",
    packageExport: "./abg", namedSymbol: "recoverInterruptedAbgEventResource",
    effects: ["open_selected_log_and_lock_descriptors", "adopt_selected_abandoned_lock_or_acquire_selected_absent_lock", "close_selected_owner_and_release_exact_lock"],
});
export const ABG_EVENT_RESOURCE_RECOVERY_DIGEST = sha256Canonical(ABG_EVENT_RESOURCE_RECOVERY);
/** Scope for externally resolved approval; computing it confers no permission. */
export function abgEventRecoveryScope(request) {
    const selected = v.parse(recoveryRequestSchema, request);
    const digest = sha256Canonical({ definition: ABG_EVENT_RESOURCE_RECOVERY,
        requestDigest: sha256Canonical(selected) });
    return deepFreeze({ ref: `native-maintenance-scope://abiogenesis/${digest}`, digest });
}
/** Actual verified installed owner, resolved external approval, then the finite physical owner.
 * Product verification and the resolved authority schema are the existing owners;
 * this native-only entry does not create a Public capability or authentication system. */
export async function recoverInterruptedAbgEventResource(requestInput, authorityInput) {
    const refuse = (code, message) => deepFreeze({ kind: "abg_event_resource_recovery_refusal", code, message });
    let request;
    try {
        request = v.parse(recoveryRequestSchema, requestInput);
        canonicalJson(request);
    }
    catch (error) {
        return refuse("invalid_request", String(error));
    }
    let authority;
    const requestDigest = sha256Canonical(request), scope = abgEventRecoveryScope(request);
    try {
        authority = v.parse(RESOLVED_ADMISSION_AUTHORITY_SCHEMA, authorityInput);
        const actor = authority.actorRef, approval = authority.approval.value;
        if (authority.authority.value.actorRef !== actor || approval.actorRef !== actor ||
            authority.authority.digest !== sha256Canonical(authority.authority.value) ||
            authority.approval.digest !== sha256Canonical(approval) ||
            approval.definitionRef !== ABG_EVENT_RESOURCE_RECOVERY.definitionRef ||
            approval.definitionDigest !== ABG_EVENT_RESOURCE_RECOVERY_DIGEST ||
            approval.requestDigest !== requestDigest || approval.scopeDigest !== scope.digest) {
            throw new TypeError("maintenance requires exact externally resolved actor, request, owner and effect approval");
        }
    }
    catch (error) {
        return refuse("approval_mismatch", String(error));
    }
    let verified;
    try {
        const observed = await verifyProduct(request.ownerArtifact.request);
        const manifest = JSON.parse(await readFile(new URL("../../../../product-toolchain-manifest.json", import.meta.url), "utf8"));
        const pkg = JSON.parse(await readFile(new URL("../../../../package.json", import.meta.url), "utf8"));
        if (observed.kind !== "verified_product_artifact" ||
            canonicalJson(observed) !== canonicalJson(request.ownerArtifact.verified) ||
            sha256Canonical(manifest) !== observed.manifestDigest || pkg.name !== observed.packageName || pkg.version !== observed.packageVersion ||
            pkg.exports?.[ABG_EVENT_RESOURCE_RECOVERY.packageExport]?.import !== "./build/code/src/abg/index.js") {
            throw new TypeError("native maintenance owner differs from the verified executing artifact/export");
        }
        verified = observed;
    }
    catch (error) {
        return refuse("installed_owner_mismatch", String(error));
    }
    const selection = {
        ...("lastCloseHandoff" in request ? { lastCloseHandoff: request.lastCloseHandoff } : { initialOrigin: {
                newResourceRequest: { kind: "new_empty_append_sink_request", schemaVersion: "5.0.0",
                    eventLogPath: request.initialOrigin.newResourceRequest.eventLogPath },
                device: request.initialOrigin.device, inode: request.initialOrigin.inode,
            } }),
        expectedCurrent: request.expectedCurrent, ownerPid: request.interruption.ownerPid,
        ...("abandonedLock" in request ? { abandonedLock: request.abandonedLock } :
            { recoveryCase: request.recoveryCase, lockPath: request.lockPath })
    };
    const outcome = recoverInterruptedEventStore(selection);
    const body = { kind: "abg_event_resource_recovery_receipt", schemaVersion: "5.0.0",
        requestDigest, actorRef: authority.actorRef, authorityRef: authority.authority.ref, authorityDigest: authority.authority.digest,
        approvalRef: authority.approval.ref, approvalDigest: authority.approval.digest, scopeDigest: scope.digest,
        executingOwner: { artifactRef: verified.artifactRef, artifactDigest: verified.artifactDigest, manifestDigest: verified.manifestDigest,
            packageExport: ABG_EVENT_RESOURCE_RECOVERY.packageExport, namedSymbol: ABG_EVENT_RESOURCE_RECOVERY.namedSymbol }, selection, outcome };
    return deepFreeze({ ...body, receiptDigest: sha256Canonical(body) });
}
