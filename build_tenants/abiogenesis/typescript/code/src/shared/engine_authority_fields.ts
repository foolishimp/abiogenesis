export const ENGINE_AUTHORITY_FIELD_KEYS = Object.freeze([
  "runtimeEvents",
  "events",
  "ledger",
  "ledgers",
  "projection",
  "runtimeProjection",
  "graphCall",
  "graphCallId",
  "frame",
  "frameId",
  "intent",
  "selectedIntentRef",
  "actorInvocationEvent",
  "actorInvocationId",
  "actorInvocationRef",
  "vectorIndex",
  "closureDecision",
  "closureKind",
  "decision",
  "terminalKind",
  "terminalReason",
  "transition",
  "transitionKind",
  "nextVectorIndex",
  "closedVectorIndexes",
  "mayCloseTraversal",
  "mayEmitRuntimeEvents",
  "mayOwnIterationLoop",
  "mayWriteLedgers",
  "maySelectTraversal",
  "mayWriteProjection",
  "mayWriteLedger",
  "maySelectNextVector"
] as const);

export type EngineAuthorityFieldKey =
  (typeof ENGINE_AUTHORITY_FIELD_KEYS)[number];

const ENGINE_AUTHORITY_FIELD_KEY_SET: ReadonlySet<string> = new Set(
  ENGINE_AUTHORITY_FIELD_KEYS
);

export function isEngineAuthorityFieldKey(
  field: string
): field is EngineAuthorityFieldKey {
  return ENGINE_AUTHORITY_FIELD_KEY_SET.has(field);
}

export function assertNoEngineAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string,
  ownerDescription: string
): void {
  for (const field of ENGINE_AUTHORITY_FIELD_KEYS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(`${label}.${field}: ${ownerDescription}`);
    }
  }
}
