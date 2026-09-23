import * as v from "valibot";
import { readFile } from "node:fs/promises";
import { absolutePathSchema, digestSchema, nonblankSchema, refDigestSchema } from "../shared/public_function_contracts.js";
import { ADMISSION_CAPABILITY_DATA_SCHEMA, RESOLVED_ADMISSION_AUTHORITY_SCHEMA, type ResolvedAdmissionAuthority } from "../product/admission_authority.js";
import { verifyProduct, isVerifiedProductArtifact } from "../product/verify_product.js";
import type { VerifiedProductArtifact } from "../product/contracts.js";
import { isRecord } from "../shared/admission_predicates.js";
import { isAbsolute, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  recoverInterruptedEventStore,
  type InterruptedEventStoreSelection,
  type InterruptedEventStoreRecovery,
  closeHeldEventStoreAtDurablePrefix,
  createNewEmptyAppendSink,
  reopenEventStore,
  validateDurablePrefixCoordinate,
  validateEventStoreCloseHandoff,
  type AbgEventStore,
  type DurablePrefixCoordinate,
  type EventStoreCloseHandoff,
} from "./event_store.js";

export type AbgEventResourceAssertion =
  | Readonly<{
    readonly kind: "new_abg_event_resource";
    readonly schemaVersion: "5.0.0";
    readonly eventLogPath: string;
    readonly locatorDigest: Sha256Digest;
  }>
  | Readonly<{
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

export type AbgEventResourceAdmission =
  | Readonly<{
    readonly kind: "acquired_abg_event_resource";
    readonly resource: AcquiredAbgEventResource;
  }>
  | Readonly<{
    readonly kind: "abg_event_resource_refusal";
    readonly code:
      | "invalid_resource_assertion"
      | "invalid_locator"
      | "invalid_handoff"
      | "acquisition_refused"
      | "prefix_mismatch";
    readonly message: string;
  }>;

export function abgEventLocatorDigest(eventLogPath: string): Sha256Digest {
  return sha256Canonical({
    kind: "abg_event_log_locator",
    eventLogPath: resolve(eventLogPath),
  });
}

export function abgEventHandoffDigest(
  handoff: EventStoreCloseHandoff,
): Sha256Digest {
  return sha256Canonical(handoff as unknown as JsonValue);
}

function refusal(
  code: Extract<AbgEventResourceAdmission, { kind: "abg_event_resource_refusal" }>["code"],
  message: string,
): AbgEventResourceAdmission {
  return deepFreeze({
    kind: "abg_event_resource_refusal" as const,
    code,
    message,
  });
}

function exactIJson(value: unknown): boolean {
  try {
    canonicalJson(value as JsonValue);
    return true;
  } catch {
    return false;
  }
}

/** Pure structural admission for an ABG event-resource assertion. */
export function validateAbgEventResourceAssertion(
  value: unknown,
): value is AbgEventResourceAssertion {
  if (!isRecord(value) || !exactIJson(value)) return false;
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
export function validateAbgEventResourceReceipt(
  value: unknown,
): value is AbgEventResourceReceipt {
  if (
    !isRecord(value) ||
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
    !validateEventStoreCloseHandoff(value.closeHandoff)
  ) return false;
  const body = {
    kind: value.kind,
    schemaVersion: value.schemaVersion,
    acquisitionKind: value.acquisitionKind,
    entryPrefix: value.entryPrefix,
    closeHandoff: value.closeHandoff,
  };
  return value.receiptDigest === sha256Canonical(body as unknown as JsonValue);
}

export function acquireAbgEventResource(
  assertion: AbgEventResourceAssertion,
): AbgEventResourceAdmission {
  if (!exactIJson(assertion)) {
    return refusal(
      "invalid_resource_assertion",
      "ABG event resources require one exact I-JSON assertion",
    );
  }
  if (assertion.kind === "new_abg_event_resource") {
    if (
      assertion.schemaVersion !== "5.0.0" ||
      Object.keys(assertion).sort().join("\0") !==
        ["eventLogPath", "kind", "locatorDigest", "schemaVersion"].sort().join("\0") ||
      !isAbsolute(assertion.eventLogPath) ||
      assertion.locatorDigest !== abgEventLocatorDigest(assertion.eventLogPath)
    ) {
      return refusal(
        "invalid_locator",
        "new ABG event resources require one exact absolute locator and digest",
      );
    }
    const acquired = createNewEmptyAppendSink({
      kind: "new_empty_append_sink_request",
      schemaVersion: "5.0.0",
      eventLogPath: assertion.eventLogPath,
    });
    if (!("store" in acquired)) {
      return refusal(
        "acquisition_refused",
        `${acquired.code}: ${acquired.message}`,
      );
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
  if (
    assertion.kind !== "reopen_abg_event_resource" ||
    assertion.schemaVersion !== "5.0.0" ||
    Object.keys(assertion).sort().join("\0") !==
      ["closeHandoff", "handoffDigest", "kind", "schemaVersion"].sort().join("\0") ||
    !validateEventStoreCloseHandoff(assertion.closeHandoff) ||
    assertion.handoffDigest !== abgEventHandoffDigest(assertion.closeHandoff)
  ) {
    return refusal(
      "invalid_handoff",
      "reopened ABG event resources require one exact owner-issued handoff",
    );
  }
  const reopened = reopenEventStore(assertion.closeHandoff.reopenAuthority);
  if (reopened.kind !== "reopened_event_store_context") {
    return refusal("acquisition_refused", `${reopened.code}: ${reopened.message}`);
  }
  if (
    sha256Canonical(reopened.prefix as unknown as JsonValue) !==
      sha256Canonical(assertion.closeHandoff.prefix as unknown as JsonValue)
  ) {
    reopened.store.closeDurableLog();
    return refusal(
      "prefix_mismatch",
      "reopened ABG event resource differs from its owner-issued prefix",
    );
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

export function closeAbgEventResource(
  resource: AcquiredAbgEventResource,
  finalPrefix: DurablePrefixCoordinate,
): AbgEventResourceReceipt {
  const closeHandoff = closeHeldEventStoreAtDurablePrefix(resource.store, finalPrefix);
  const body = {
    kind: "abg_event_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    acquisitionKind: resource.acquisitionKind,
    entryPrefix: resource.entryPrefix,
    closeHandoff,
  };
  return deepFreeze({
    ...body,
    receiptDigest: sha256Canonical(body as unknown as JsonValue),
  });
}

export function abandonAbgEventResource(resource: AcquiredAbgEventResource): void {
  resource.store.closeDurableLog();
}

/** Closed native maintenance data; it does not extend Public new/reopen or grant Run authority. */
const recoveryRequestEntries = {
  kind: v.literal("abg_interrupted_event_resource_recovery"), schemaVersion: v.literal("5.0.0"),
  expectedCurrent: v.strictObject({ byteLength: v.pipe(v.number(), v.safeInteger(), v.minValue(0)), digest: digestSchema }),
  interruption: v.strictObject({ ownerPid: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
    evidence: refDigestSchema, quiescenceEvidence: refDigestSchema, exclusiveMaintenance: v.literal(true) }),
  ownerArtifact: v.strictObject({ request: v.lazy(() => ADMISSION_CAPABILITY_DATA_SCHEMA.entries.ownerArtifact.entries.request),
    verified: v.custom<VerifiedProductArtifact>(isVerifiedProductArtifact) }),
};
const priorRecoveryOrigin = { lastCloseHandoff: v.custom<EventStoreCloseHandoff>(validateEventStoreCloseHandoff) };
const initialRecoveryOrigin = { initialOrigin: v.strictObject({
  newResourceRequest: v.custom<Extract<AbgEventResourceAssertion, { kind: "new_abg_event_resource" }>>(
    value => validateAbgEventResourceAssertion(value) && value.kind === "new_abg_event_resource"),
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
export type AbgInterruptedEventResourceRecoveryRequest = v.InferOutput<typeof recoveryRequestSchema>;
export const ABG_EVENT_RESOURCE_RECOVERY = deepFreeze({
  definitionRef: "native-maintenance://abiogenesis/event-resource/recover@5",
  packageExport: "./abg", namedSymbol: "recoverInterruptedAbgEventResource",
  effects: ["open_selected_log_and_lock_descriptors", "adopt_selected_abandoned_lock_or_acquire_selected_absent_lock", "close_selected_owner_and_release_exact_lock"],
} as const);
export const ABG_EVENT_RESOURCE_RECOVERY_DIGEST = sha256Canonical(ABG_EVENT_RESOURCE_RECOVERY);

/** Scope for externally resolved approval; computing it confers no permission. */
export function abgEventRecoveryScope(request: AbgInterruptedEventResourceRecoveryRequest) {
  const selected = v.parse(recoveryRequestSchema, request);
  const digest = sha256Canonical({ definition: ABG_EVENT_RESOURCE_RECOVERY,
    requestDigest: sha256Canonical(selected as unknown as JsonValue) });
  return deepFreeze({ ref: `native-maintenance-scope://abiogenesis/${digest}`, digest });
}
export type AbgEventResourceRecoveryResult =
  | Readonly<{ kind: "abg_event_resource_recovery_refusal"; code: "invalid_request" | "approval_mismatch" | "installed_owner_mismatch"; message: string }>
  | Readonly<{ kind: "abg_event_resource_recovery_receipt"; schemaVersion: "5.0.0";
      requestDigest: Sha256Digest; actorRef: string; authorityRef: string; authorityDigest: Sha256Digest;
      approvalRef: string; approvalDigest: Sha256Digest; scopeDigest: Sha256Digest;
      executingOwner: Readonly<{ artifactRef: string; artifactDigest: Sha256Digest; manifestDigest: Sha256Digest;
        packageExport: "./abg"; namedSymbol: "recoverInterruptedAbgEventResource" }>;
      selection: InterruptedEventStoreSelection; outcome: InterruptedEventStoreRecovery; receiptDigest: Sha256Digest }>;

/** Actual verified installed owner, resolved external approval, then the finite physical owner.
 * Product verification and the resolved authority schema are the existing owners;
 * this native-only entry does not create a Public capability or authentication system. */
export async function recoverInterruptedAbgEventResource(requestInput: unknown, authorityInput: unknown): Promise<AbgEventResourceRecoveryResult> {
  const refuse = (code: "invalid_request" | "approval_mismatch" | "installed_owner_mismatch", message: string) =>
    deepFreeze({ kind: "abg_event_resource_recovery_refusal" as const, code, message });
  let request: AbgInterruptedEventResourceRecoveryRequest;
  try { request = v.parse(recoveryRequestSchema, requestInput); canonicalJson(request as unknown as JsonValue); }
  catch (error) { return refuse("invalid_request", String(error)); }
  let authority: ResolvedAdmissionAuthority;
  const requestDigest = sha256Canonical(request as unknown as JsonValue), scope = abgEventRecoveryScope(request);
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
  } catch (error) { return refuse("approval_mismatch", String(error)); }
  let verified: VerifiedProductArtifact;
  try {
    const observed = await verifyProduct(request.ownerArtifact.request);
    const manifest = JSON.parse(await readFile(new URL("../../../../product-toolchain-manifest.json", import.meta.url), "utf8"));
    const pkg = JSON.parse(await readFile(new URL("../../../../package.json", import.meta.url), "utf8"));
    if (observed.kind !== "verified_product_artifact" ||
        canonicalJson(observed as unknown as JsonValue) !== canonicalJson(request.ownerArtifact.verified as unknown as JsonValue) ||
        sha256Canonical(manifest) !== observed.manifestDigest || pkg.name !== observed.packageName || pkg.version !== observed.packageVersion ||
        pkg.exports?.[ABG_EVENT_RESOURCE_RECOVERY.packageExport]?.import !== "./build/code/src/abg/index.js") {
      throw new TypeError("native maintenance owner differs from the verified executing artifact/export");
    }
    verified = observed;
  } catch (error) { return refuse("installed_owner_mismatch", String(error)); }
  const selection: InterruptedEventStoreSelection = {
    ...("lastCloseHandoff" in request ? { lastCloseHandoff: request.lastCloseHandoff } : { initialOrigin: {
      newResourceRequest: { kind: "new_empty_append_sink_request" as const, schemaVersion: "5.0.0" as const,
        eventLogPath: request.initialOrigin.newResourceRequest.eventLogPath },
      device: request.initialOrigin.device, inode: request.initialOrigin.inode,
    } }),
    expectedCurrent: request.expectedCurrent, ownerPid: request.interruption.ownerPid,
    ...("abandonedLock" in request ? { abandonedLock: request.abandonedLock } :
      { recoveryCase: request.recoveryCase, lockPath: request.lockPath }) };
  const outcome = recoverInterruptedEventStore(selection);
  const body = { kind: "abg_event_resource_recovery_receipt" as const, schemaVersion: "5.0.0" as const,
    requestDigest, actorRef: authority.actorRef, authorityRef: authority.authority.ref, authorityDigest: authority.authority.digest,
    approvalRef: authority.approval.ref, approvalDigest: authority.approval.digest, scopeDigest: scope.digest,
    executingOwner: { artifactRef: verified.artifactRef, artifactDigest: verified.artifactDigest, manifestDigest: verified.manifestDigest,
      packageExport: ABG_EVENT_RESOURCE_RECOVERY.packageExport, namedSymbol: ABG_EVENT_RESOURCE_RECOVERY.namedSymbol }, selection, outcome };
  return deepFreeze({ ...body, receiptDigest: sha256Canonical(body as unknown as JsonValue) });
}
