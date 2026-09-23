import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

/** Exact retained profile. New native truth must never be stamped with L. */
export const LEGACY_ROOT_EVENT_CONTRACT_DIGEST =
  "sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c" as const;
export const ROOT_CURRENT_EVENT_PROFILE_REF =
  "abg.event-contract.root/p5-run-environment-role-context@1" as const;
export const ROOT_EVENT_PROFILE_DECLARATION_REF =
  "declaration://abiogenesis/runtime/root-event-contract-profile@1" as const;
export const ROOT_EVENT_PROFILE_UPGRADE_REASON =
  "admit-current-native-event-contract-profile" as const;

export const UNDISPATCHED_OWNER_STAGE_VALUES = Object.freeze([
  "authority_verification", "worker_contract_resolution",
  "implementation_load", "preparation",
] as const);
export const UNDISPATCHED_OWNER_REASON_VALUES = Object.freeze([
  "refused", "missing_contracts", "missing_export", "thrown", "malformed_preparation",
] as const);
export type UndispatchedOwnerStage = typeof UNDISPATCHED_OWNER_STAGE_VALUES[number];
export type UndispatchedOwnerReason = typeof UNDISPATCHED_OWNER_REASON_VALUES[number];

export interface UndispatchedOwnerObservation {
  readonly kind: "undispatched_owner_observation";
  readonly schemaVersion: "5.0.0";
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly programLocusRef: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly implementationRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly inputDigest: Sha256Digest;
  readonly stage: UndispatchedOwnerStage;
  readonly reason: UndispatchedOwnerReason;
  readonly errorClass: string | null;
  readonly errorCode: string | null;
  readonly diagnosticRef: string;
}
const SAFE_ERROR_CLASSES = Object.freeze(["Error", "TypeError", "RangeError", "SyntaxError"]);
const SAFE_ERROR_CODES = Object.freeze(["ENOENT", "EACCES", "EPERM", "ENOTDIR", "EISDIR", "ERR_MODULE_NOT_FOUND", "ERR_PACKAGE_PATH_NOT_EXPORTED"]);
const OBSERVATION_KEYS = Object.freeze([
  "kind", "schemaVersion", "cCallRef", "runId", "graphCallId", "frameId",
  "programLocusRef", "taskOrdinal", "attempt", "implementationRef",
  "inputContractRef", "outputContractRef", "inputDigest", "stage", "reason",
  "errorClass", "errorCode", "diagnosticRef",
]);
export function undispatchedOwnerDiagnosticRef(stage: UndispatchedOwnerStage, reason: UndispatchedOwnerReason): string {
  return `diagnostic://abiogenesis/implementation/undispatched/${stage}/${reason}@5`;
}
/** Deliberately never reads, records or hashes message, stack, prompt or paths. */
export function sanitizeUndispatchedOwnerError(error: unknown): Readonly<{ errorClass: string | null; errorCode: string | null }> {
  let errorClass: string | null = null, errorCode: string | null = null;
  try {
    const prototype = typeof error === "object" && error !== null ? Object.getPrototypeOf(error) : null;
    const prototypes = [Error.prototype, TypeError.prototype, RangeError.prototype, SyntaxError.prototype];
    const index = prototypes.indexOf(prototype);
    if (index >= 0) errorClass = SAFE_ERROR_CLASSES[index]!;
    if (typeof error === "object" && error !== null) {
      const descriptor = Object.getOwnPropertyDescriptor(error, "code");
      if (descriptor !== undefined && "value" in descriptor && typeof descriptor.value === "string" && SAFE_ERROR_CODES.includes(descriptor.value)) errorCode = descriptor.value;
    }
  } catch { /* Keep a stage-qualified unknown; do not inspect arbitrary getters. */ }
  return Object.freeze({ errorClass, errorCode });
}
export function isUndispatchedOwnerObservation(value: unknown): value is UndispatchedOwnerObservation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const x = value as Record<string, unknown>;
  if (Reflect.ownKeys(x).length !== OBSERVATION_KEYS.length ||
    !OBSERVATION_KEYS.every(key => {
      const d = Object.getOwnPropertyDescriptor(x, key);
      return d !== undefined && "value" in d && d.enumerable === true;
    })) return false;
  const stage = x.stage as UndispatchedOwnerStage, reason = x.reason as UndispatchedOwnerReason;
  return x.kind === "undispatched_owner_observation" && x.schemaVersion === "5.0.0" &&
    ["cCallRef", "runId", "graphCallId", "frameId", "programLocusRef", "implementationRef", "inputContractRef", "outputContractRef"].every(key => typeof x[key] === "string" && x[key].length > 0) &&
    typeof x.inputDigest === "string" && /^sha256:[a-f0-9]{64}$/u.test(x.inputDigest) &&
    Number.isSafeInteger(x.attempt) && Number(x.attempt) >= 0 &&
    (x.taskOrdinal === null || Number.isSafeInteger(x.taskOrdinal) && Number(x.taskOrdinal) >= 0) &&
    UNDISPATCHED_OWNER_STAGE_VALUES.includes(stage) && UNDISPATCHED_OWNER_REASON_VALUES.includes(reason) &&
    (reason === "thrown" || stage === "authority_verification" && reason === "refused" ||
      stage === "worker_contract_resolution" && reason === "missing_contracts" ||
      stage === "implementation_load" && reason === "missing_export" ||
      stage === "preparation" && reason === "malformed_preparation") &&
    (x.errorClass === null || typeof x.errorClass === "string" && SAFE_ERROR_CLASSES.includes(x.errorClass)) &&
    (x.errorCode === null || typeof x.errorCode === "string" && SAFE_ERROR_CODES.includes(x.errorCode)) &&
    (reason === "thrown" || x.errorClass === null && x.errorCode === null) &&
    x.diagnosticRef === undispatchedOwnerDiagnosticRef(stage, reason);
}
export function constructRootCurrentEventContractDescriptor(input: Readonly<{
  aggregateTypes: readonly string[];
  eventKinds: readonly string[];
  eventContracts: JsonValue;
}>): Readonly<{ descriptor: JsonValue; digest: Sha256Digest }> {
  const descriptor = deepFreeze({
    kind: "root_event_contract_profile",
    schemaVersion: "5.0.0",
    profileRef: ROOT_CURRENT_EVENT_PROFILE_REF,
    legacyProfileDigest: LEGACY_ROOT_EVENT_CONTRACT_DIGEST,
    aggregateTypes: input.aggregateTypes,
    eventKinds: input.eventKinds,
    eventContracts: input.eventContracts,
    envelopeStamp: { key: "eventContractDigest", type: "sha256", owner: "native_store", identityParticipation: true },
  }) as unknown as JsonValue;
  return Object.freeze({ descriptor, digest: sha256Canonical(descriptor) });
}
