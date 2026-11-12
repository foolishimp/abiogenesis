import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { types } from "node:util";
import { isRecord } from "../shared/admit/index.js";
import { constructRuntimeFailureDiagnosticRef, readRuntimeFailureDiagnosticSubject } from "./runtime_failure.js";

/** L: the legacy table, pinned. It is the base every stamped table (RC6, S2
 * and the current W) extends, and every stamped descriptor names it as
 * `legacyProfileDigest`. L rows carry no stamp. */
export const LEGACY_ROOT_EVENT_CONTRACT_DIGEST =
  "sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c" as const;
/** The profile ref the retained RC6 and S2 descriptors carry. */
export const ROOT_RUN_ENVIRONMENT_EVENT_PROFILE_REF =
  "abg.event-contract.root/p5-run-environment-role-context@1" as const;
export const ROOT_EVENT_PROFILE_DECLARATION_REF =
  "declaration://abiogenesis/runtime/root-event-contract-profile@1" as const;
export const ROOT_EVENT_PROFILE_UPGRADE_REASON =
  "admit-current-native-event-contract-profile" as const;
/** Exact retained stamped profiles, hard-pinned at their original cuts. */
export const INSTALLED_RC6_EVENT_CONTRACT_DIGEST =
  "sha256:5b35ab536188aea5b822c4cdf8e962bbaf0fb609fc6da9e6b554187e8a7e0537" as const;
export const FROZEN_S2_EVENT_CONTRACT_DIGEST =
  "sha256:3bcc8488bcfb9396cbc53c85b944df6973bf99200ab93728949853df62cecac0" as const;
/** The profile ref of the current profile W: S2 plus the explicit durable stdout window witness. */
export const ROOT_WINDOW_EVENT_PROFILE_REF =
  "abg.event-contract.root/p6-stdout-window-witness@1" as const;

export type RootEventContractProfileName = "legacy" | "installed_rc6" | "frozen_s2" | "window";
/** Independent semantics of one exact table. A digest selects exactly one
 * profile or none; no digest falls back to L or to the latest profile. */
export type RootEventContractProfileCapabilities = Readonly<{
  name: RootEventContractProfileName;
  digest: Sha256Digest;
  /** Rows carry `eventContractDigest`; L rows carry none. */
  stamped: boolean;
  /** The profile ref a witnessed L-to-profile boundary names, or null for L. */
  profileRef: string | null;
  /** Actor artifacts and transport evidence carry the lifecycle copies. */
  lifecycleCopies: boolean;
  /** Native liveness declarations, probes and threshold observations. */
  nativeLiveness: boolean;
  /** Stdout rows carry one archive window witness validated at cold adoption. */
  stdoutWindowWitness: boolean;
  /** New stores and new native truth use this profile. */
  current: boolean;
}>;
export type RootEventContractProfileTable<T> = Readonly<{ digest: Sha256Digest; contracts: T }>;
export type RootEventContractProfiles<T> = Readonly<{
  current: RootEventContractProfileCapabilities;
  /** The exact table and capabilities a digest selects, or null. */
  select(digest: unknown): Readonly<{ capabilities: RootEventContractProfileCapabilities; contracts: T }> | null;
}>;
/** The one exact-table and capability classifier. The three retained digests
 * are pins: a table that no longer reproduces its pin refuses at load. */
export function constructRootEventContractProfiles<T>(tables: Readonly<Record<RootEventContractProfileName, RootEventContractProfileTable<T>>>): RootEventContractProfiles<T> {
  const pins: Readonly<Record<Exclude<RootEventContractProfileName, "window">, Sha256Digest>> = {
    legacy: LEGACY_ROOT_EVENT_CONTRACT_DIGEST, installed_rc6: INSTALLED_RC6_EVENT_CONTRACT_DIGEST, frozen_s2: FROZEN_S2_EVENT_CONTRACT_DIGEST };
  for (const [name, digest] of Object.entries(pins)) {
    if (tables[name as RootEventContractProfileName].digest !== digest) throw new TypeError(`the immutable ${name} event-contract table changed`);
  }
  if (Object.values(pins).includes(tables.window.digest)) throw new TypeError("the window event-contract profile must have its own identity");
  const capabilities = (name: RootEventContractProfileName): RootEventContractProfileCapabilities => Object.freeze({
    name, digest: tables[name].digest, stamped: name !== "legacy",
    profileRef: name === "legacy" ? null : name === "window" ? ROOT_WINDOW_EVENT_PROFILE_REF : ROOT_RUN_ENVIRONMENT_EVENT_PROFILE_REF,
    lifecycleCopies: name === "legacy" || name === "installed_rc6", nativeLiveness: name !== "legacy",
    stdoutWindowWitness: name === "window", current: name === "window" });
  const entries = new Map((["legacy", "installed_rc6", "frozen_s2", "window"] as const).map(name =>
    [tables[name].digest as string, Object.freeze({ capabilities: capabilities(name), contracts: tables[name].contracts })]));
  return Object.freeze({ current: entries.get(tables.window.digest)!.capabilities,
    select: (digest: unknown) => typeof digest === "string" ? entries.get(digest) ?? null : null });
}

export const UNDISPATCHED_OWNER_STAGE_VALUES = Object.freeze([
  "authority_verification", "worker_contract_resolution",
  "implementation_load", "preparation",
] as const);
export const UNDISPATCHED_OWNER_REASON_VALUES = Object.freeze([
  "refused", "missing_contracts", "missing_export", "thrown", "malformed_preparation",
] as const);
export type UndispatchedOwnerStage = typeof UNDISPATCHED_OWNER_STAGE_VALUES[number];
export type UndispatchedOwnerReason = typeof UNDISPATCHED_OWNER_REASON_VALUES[number];

export type UndispatchedOwnerObservation = {
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
};
const SAFE_ERROR_CLASSES = Object.freeze(["Error", "TypeError", "RangeError", "SyntaxError"]);
const SAFE_ERROR_CODES = Object.freeze(["ENOENT", "EACCES", "EPERM", "ENOTDIR", "EISDIR", "ERR_MODULE_NOT_FOUND", "ERR_PACKAGE_PATH_NOT_EXPORTED"]);
const OBSERVATION_KEYS = Object.freeze([
  "kind", "schemaVersion", "cCallRef", "runId", "graphCallId", "frameId",
  "programLocusRef", "taskOrdinal", "attempt", "implementationRef",
  "inputContractRef", "outputContractRef", "inputDigest", "stage", "reason",
  "errorClass", "errorCode", "diagnosticRef",
]);
const NATIVE_STACK_GETTER = Object.getOwnPropertyDescriptor(new Error(), "stack")?.get;
const DIAGNOSTIC_MESSAGE_LIMIT = 8192, DIAGNOSTIC_STACK_LIMIT = 32768;
export function undispatchedOwnerDiagnosticRef(stage: UndispatchedOwnerStage, reason: UndispatchedOwnerReason, error?: unknown): string {
  const diagnosticClassRef = `diagnostic://abiogenesis/implementation/undispatched/${stage}/${reason}@5`;
  const safe = sanitizeUndispatchedOwnerError(error);
  if (reason !== "thrown" || safe.errorClass === null || !types.isNativeError(error)) return diagnosticClassRef;
  try {
    // Read only native Error data and its built-in lazy stack accessor. An
    // arbitrary thrown value/getter never becomes retained diagnostic content.
    const message = Object.getOwnPropertyDescriptor(error, "message");
    const name = Object.getOwnPropertyDescriptor(error, "name");
    const stack = Object.getOwnPropertyDescriptor(error, "stack");
    if (message !== undefined && !("value" in message && typeof message.value === "string") ||
        name !== undefined && !("value" in name && typeof name.value === "string")) return diagnosticClassRef;
    const messageText = message?.value ?? "";
    const stackText = stack !== undefined && "value" in stack ? stack.value
      : stack?.get !== undefined && stack.get === NATIVE_STACK_GETTER ? stack.get.call(error) : null;
    if (typeof stackText !== "string") return diagnosticClassRef;
    return constructRuntimeFailureDiagnosticRef({ diagnosticClassRef, stage, reason, ...safe,
      message: messageText.slice(0, DIAGNOSTIC_MESSAGE_LIMIT), stack: stackText.slice(0, DIAGNOSTIC_STACK_LIMIT),
      messageTruncated: messageText.length > DIAGNOSTIC_MESSAGE_LIMIT, stackTruncated: stackText.length > DIAGNOSTIC_STACK_LIMIT });
  } catch { return diagnosticClassRef; }
}
/** Class/code classification never evaluates arbitrary thrown-object getters. */
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
/** @internal A caught cause as the F_D boundary, the F_P completion and the
 * retry frontier's replay exit retain it: class and code as sanitized above,
 * and a native error's own data `message`, bounded with its truncation
 * flagged. A Proxy is not inspected and no getter runs. */
export type RetainedCaughtCause = Readonly<{
  errorClass: string | null;
  errorCode: string | null;
  message: string | null;
  messageTruncated: boolean;
}>;
/** @internal */
export function retainCaughtCause(error: unknown): RetainedCaughtCause {
  const caught = types.isProxy(error) ? null : error;
  const safe = sanitizeUndispatchedOwnerError(caught);
  let message: string | null = null;
  let messageTruncated = false;
  if (types.isNativeError(caught)) {
    const descriptor = Object.getOwnPropertyDescriptor(caught, "message");
    if (descriptor !== undefined && "value" in descriptor &&
        typeof descriptor.value === "string") {
      message = descriptor.value.slice(0, DIAGNOSTIC_MESSAGE_LIMIT);
      messageTruncated = descriptor.value.length > DIAGNOSTIC_MESSAGE_LIMIT;
    }
  }
  return Object.freeze({ ...safe, message, messageTruncated });
}
function undispatchedDiagnosticMatches(x: Record<string, unknown>, stage: UndispatchedOwnerStage, reason: UndispatchedOwnerReason): boolean {
  if (x.diagnosticRef === undispatchedOwnerDiagnosticRef(stage, reason)) return true;
  if (reason !== "thrown" || x.errorClass === null || typeof x.diagnosticRef !== "string") return false;
  try {
    const value = readRuntimeFailureDiagnosticSubject(x.diagnosticRef);
    if (!isRecord(value)) return false;
    const subject = value;
    const keys = ["diagnosticClassRef", "stage", "reason", "errorClass", "errorCode", "message", "stack", "messageTruncated", "stackTruncated"];
    return Object.keys(subject).length === keys.length && keys.every(key => Object.hasOwn(subject, key)) &&
      subject.diagnosticClassRef === undispatchedOwnerDiagnosticRef(stage, reason) && subject.stage === stage && subject.reason === reason &&
      subject.errorClass === x.errorClass && subject.errorCode === x.errorCode &&
      typeof subject.message === "string" && subject.message.length <= DIAGNOSTIC_MESSAGE_LIMIT &&
      typeof subject.stack === "string" && subject.stack.length <= DIAGNOSTIC_STACK_LIMIT &&
      typeof subject.messageTruncated === "boolean" && typeof subject.stackTruncated === "boolean";
  } catch { return false; }
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
    undispatchedDiagnosticMatches(x, stage, reason);
}
/** The descriptor, and its digest, of one stamped profile (RC6, S2 or W). */
export function constructRootStampedEventContractDescriptor(input: Readonly<{
  aggregateTypes: readonly string[];
  eventKinds: readonly string[];
  eventContracts: JsonValue;
  profileRef: string;
}>): Readonly<{ descriptor: JsonValue; digest: Sha256Digest }> {
  const descriptor = deepFreeze({
    kind: "root_event_contract_profile",
    schemaVersion: "5.0.0",
    profileRef: input.profileRef,
    legacyProfileDigest: LEGACY_ROOT_EVENT_CONTRACT_DIGEST,
    aggregateTypes: input.aggregateTypes,
    eventKinds: input.eventKinds,
    eventContracts: input.eventContracts,
    envelopeStamp: { key: "eventContractDigest", type: "sha256", owner: "native_store", identityParticipation: true },
  });
  return Object.freeze({ descriptor, digest: sha256Canonical(descriptor) });
}
