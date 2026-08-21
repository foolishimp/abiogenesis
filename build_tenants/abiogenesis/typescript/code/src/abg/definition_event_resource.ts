import { isAbsolute, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  createNewEmptyAppendSink,
  EventStoreCloseFailure,
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

/** Exact close failure carrying the already owner-issued ABG receipt. */
export class AbgEventResourceCloseFailure extends TypeError {
  readonly resourceReceipt: AbgEventResourceReceipt;
  readonly failureMessage: string;

  constructor(
    resourceReceipt: AbgEventResourceReceipt,
    cause: EventStoreCloseFailure,
  ) {
    super(`ABG event resource close failed: ${cause.failureMessage}`);
    this.name = "AbgEventResourceCloseFailure";
    this.resourceReceipt = resourceReceipt;
    this.failureMessage = cause.failureMessage;
  }
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

function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function eventResourceReceipt(
  resource: AcquiredAbgEventResource,
  closeHandoff: EventStoreCloseHandoff,
): AbgEventResourceReceipt {
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

export function closeAbgEventResource(
  resource: AcquiredAbgEventResource,
  finalPrefix: DurablePrefixCoordinate,
): AbgEventResourceReceipt {
  let closeHandoff: EventStoreCloseHandoff;
  let closeFailure: EventStoreCloseFailure | null = null;
  try {
    closeHandoff = resource.store.projectReopenAuthorityAndClose(finalPrefix);
  } catch (cause) {
    if (!(cause instanceof EventStoreCloseFailure)) throw cause;
    closeHandoff = cause.closeHandoff;
    closeFailure = cause;
  }
  const receipt = eventResourceReceipt(resource, closeHandoff);
  if (closeFailure !== null) {
    throw new AbgEventResourceCloseFailure(receipt, closeFailure);
  }
  return receipt;
}

export function abandonAbgEventResource(resource: AcquiredAbgEventResource): void {
  resource.store.closeDurableLog();
}
