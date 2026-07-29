import type { JsonValue, Sha256Digest } from "../product/index.js";

type PublicPayloadFieldDefinition =
  | Readonly<{ readonly kind: "digest" }>
  | Readonly<{ readonly kind: "enum"; readonly values: readonly string[] }>
  | Readonly<{ readonly kind: "nonblank_string" }>
  | Readonly<{ readonly kind: "record" }>
  | Readonly<{
    readonly kind: "string_array";
    readonly minItems: number;
    readonly uniqueItems: boolean;
  }>;

interface PublicPayloadDefinition {
  readonly fields: Readonly<Record<string, PublicPayloadFieldDefinition>>;
  readonly required: readonly string[];
  readonly allOrNone?: readonly (readonly string[])[];
  readonly exactlyOne?: readonly (readonly string[])[];
  readonly successfulResultSchemaRef?: string;
}

const FIELD = {
  digest: { kind: "digest" },
  record: { kind: "record" },
  ref: { kind: "nonblank_string" },
  refs: { kind: "string_array", minItems: 0, uniqueItems: true },
  refsNonempty: {
    kind: "string_array",
    minItems: 1,
    uniqueItems: true,
  },
} as const satisfies Readonly<Record<string, PublicPayloadFieldDefinition>>;

export const ROOT_PUBLIC_OPERATION_DEFINITIONS = {
  "abg.operation.product.verify": {
    artifact: {
      fields: {
        artifactPath: FIELD.ref,
        artifactRef: FIELD.ref,
        expectedArtifactDigest: FIELD.digest,
        expectedManifestDigest: FIELD.digest,
        expectedPackageName: FIELD.ref,
        expectedPackageVersion: FIELD.ref,
        expectedProductContentDigest: FIELD.digest,
        expectedProductId: FIELD.ref,
      },
      required: [
        "artifactPath",
        "artifactRef",
        "expectedArtifactDigest",
        "expectedManifestDigest",
        "expectedPackageName",
        "expectedPackageVersion",
        "expectedProductContentDigest",
        "expectedProductId",
      ],
    },
  },
  "abg.operation.product.resolve": {
    verified_product_set: {
      fields: {
        verifiedInvocationRefs: FIELD.refsNonempty,
      },
      required: ["verifiedInvocationRefs"],
      successfulResultSchemaRef: "#/$defs/ResolvedProductLockProjection",
    },
  },
  "abg.operation.product.install": {
    verified_artifact: {
      fields: {
        artifactPath: FIELD.ref,
        resolvedLockInvocationRef: FIELD.ref,
        targetRoot: FIELD.ref,
        verifiedInvocationRef: FIELD.ref,
      },
      required: [
        "artifactPath",
        "resolvedLockInvocationRef",
        "targetRoot",
        "verifiedInvocationRef",
      ],
    },
  },
  "abg.operation.workspace.bind": {
    exact_product_set: {
      fields: {
        authorityManifestRef: FIELD.ref,
        authorizedActorRef: FIELD.ref,
        canonicalRoot: FIELD.ref,
        installInvocationRef: FIELD.ref,
        installInvocationRefs: FIELD.refsNonempty,
        roots: FIELD.record,
        workspaceId: FIELD.ref,
      },
      required: [
        "authorityManifestRef",
        "authorizedActorRef",
        "canonicalRoot",
        "roots",
        "workspaceId",
      ],
      exactlyOne: [["installInvocationRef"], ["installInvocationRefs"]],
    },
  },
  "abg.operation.catalog.admit": {
    module_publication: {
      fields: {
        publication: FIELD.record,
        verifiedInvocationRef: FIELD.ref,
        workspaceBindingInvocationRef: FIELD.ref,
      },
      required: [
        "publication",
        "verifiedInvocationRef",
        "workspaceBindingInvocationRef",
      ],
    },
  },
  "abg.operation.catalog.apply": {
    node_type: {
      fields: {
        catalogViewInvocationRef: FIELD.ref,
        contributorRef: FIELD.ref,
        handle: FIELD.ref,
        productInstallInvocationRef: FIELD.ref,
        target: FIELD.record,
        value: FIELD.record,
      },
      required: [
        "catalogViewInvocationRef",
        "contributorRef",
        "handle",
        "productInstallInvocationRef",
        "target",
        "value",
      ],
    },
    overlay: {
      fields: {
        catalogViewInvocationRef: FIELD.ref,
        contributorRef: FIELD.ref,
        handle: FIELD.ref,
        productInstallInvocationRef: FIELD.ref,
        value: FIELD.record,
      },
      required: [
        "catalogViewInvocationRef",
        "contributorRef",
        "handle",
        "productInstallInvocationRef",
        "value",
      ],
    },
  },
  "abg.operation.catalog.view": {
    allowlist: {
      fields: {
        allowlist: FIELD.refs,
        catalogInvocationRef: FIELD.ref,
      },
      required: ["allowlist", "catalogInvocationRef"],
    },
  },
  "abg.operation.project.read": {
    gaps: {
      fields: {
        gapAuthority: FIELD.record,
        gapRef: FIELD.ref,
      },
      required: ["gapAuthority", "gapRef"],
    },
    "lawful-actions": {
      fields: {
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
      },
      required: ["continuationRef"],
    },
    replay: {
      fields: {
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
        projectionAuthority: FIELD.record,
        targetRef: FIELD.ref,
      },
      required: [],
      exactlyOne: [
        ["continuationRef"],
        ["projectionAuthority", "targetRef"],
      ],
    },
    result: {
      fields: {
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
        projectionAuthority: FIELD.record,
        targetRef: FIELD.ref,
      },
      required: [],
      exactlyOne: [
        ["continuationRef"],
        ["projectionAuthority", "targetRef"],
      ],
    },
    status: {
      fields: {
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
        projectionAuthority: FIELD.record,
        targetRef: FIELD.ref,
      },
      required: [],
      exactlyOne: [
        ["continuationRef"],
        ["projectionAuthority", "targetRef"],
      ],
    },
    "ticket.consensus": {
      fields: {
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
        projectionAuthority: FIELD.record,
        targetRef: FIELD.ref,
      },
      required: [],
      exactlyOne: [
        ["continuationRef"],
        ["projectionAuthority", "targetRef"],
      ],
    },
  },
  "abg.operation.interaction.respond": {
    answer_escalation: {
      fields: {
        actorRef: FIELD.ref,
        capabilityRef: FIELD.ref,
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
        response: FIELD.record,
      },
      required: [
        "actorRef",
        "capabilityRef",
        "continuationRef",
        "response",
      ],
    },
    approve: {
      fields: {
        actorRef: FIELD.ref,
        capabilityRef: FIELD.ref,
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
        response: FIELD.record,
      },
      required: [
        "actorRef",
        "capabilityRef",
        "continuationRef",
        "response",
      ],
    },
  },
  "abg.operation.run.continue": {
    current_intent: {
      fields: {
        actorRef: FIELD.ref,
        capabilityRef: FIELD.ref,
        continuationAuthority: FIELD.record,
        continuationRef: FIELD.ref,
      },
      required: [
        "actorRef",
        "capabilityRef",
        "continuationRef",
      ],
    },
  },
  "abg.operation.run.invoke": {
    direct: {
      fields: {
        actorRef: FIELD.ref,
        catalogApplicationInvocationRefs: FIELD.refs,
        catalogViewInvocationRef: FIELD.ref,
        eventLogPath: FIELD.ref,
        graphFunctionRef: FIELD.ref,
        input: FIELD.record,
        installInvocationRef: FIELD.ref,
        programRef: FIELD.ref,
        sourceProjectionAuthority: FIELD.record,
        sourceResultRef: FIELD.ref,
        workspaceBindingInvocationRef: FIELD.ref,
      },
      required: [
        "actorRef",
        "catalogViewInvocationRef",
        "eventLogPath",
        "graphFunctionRef",
        "input",
        "installInvocationRef",
        "programRef",
        "workspaceBindingInvocationRef",
      ],
      allOrNone: [["sourceProjectionAuthority", "sourceResultRef"]],
    },
    start: {
      fields: {
        actorRef: FIELD.ref,
        catalogApplicationInvocationRefs: FIELD.refs,
        catalogViewInvocationRef: FIELD.ref,
        eventLogPath: FIELD.ref,
        input: FIELD.record,
        installInvocationRef: FIELD.ref,
        programRef: FIELD.ref,
        reentryAuthority: FIELD.record,
        rootMode: {
          kind: "enum",
          values: ["direct", "supervised"],
        },
        scope: { kind: "enum", values: ["program"] },
        sourceProjectionAuthority: FIELD.record,
        sourceResultRef: FIELD.ref,
        startRef: FIELD.ref,
        target: FIELD.ref,
        until: { kind: "enum", values: ["converged"] },
        workspaceBindingInvocationRef: FIELD.ref,
      },
      required: [
        "actorRef",
        "catalogViewInvocationRef",
        "eventLogPath",
        "input",
        "installInvocationRef",
        "programRef",
        "rootMode",
        "scope",
        "target",
        "until",
        "workspaceBindingInvocationRef",
      ],
      allOrNone: [["sourceProjectionAuthority", "sourceResultRef"]],
    },
  },
} as const satisfies Readonly<
  Record<string, Readonly<Record<string, PublicPayloadDefinition>>>
>;

type RootPublicOperationDefinitions =
  typeof ROOT_PUBLIC_OPERATION_DEFINITIONS;

export type RootPublicOperationId =
  Extract<keyof RootPublicOperationDefinitions, string>;

type RootPublicVariant<
  O extends RootPublicOperationId,
> = Extract<keyof RootPublicOperationDefinitions[O], string>;

type FieldValue<D> =
  D extends Readonly<{ readonly kind: "digest" }> ? Sha256Digest
    : D extends Readonly<{
      readonly kind: "enum";
      readonly values: readonly (infer V extends string)[];
    }> ? V
    : D extends Readonly<{ readonly kind: "nonblank_string" }> ? string
    : D extends Readonly<{ readonly kind: "record" }>
      ? Readonly<Record<string, JsonValue>>
    : D extends Readonly<{ readonly kind: "string_array" }>
      ? readonly string[]
    : never;

type PayloadFields<D> =
  D extends Readonly<{
    readonly fields: infer F extends Readonly<
      Record<string, PublicPayloadFieldDefinition>
    >;
  }> ? F
    : never;

type RequiredPayloadKeys<D> =
  D extends Readonly<{ readonly required: readonly (infer K extends string)[] }>
    ? Extract<K, keyof PayloadFields<D>>
    : never;

type PublicPayload<D> =
  Readonly<{
    [K in RequiredPayloadKeys<D>]: FieldValue<PayloadFields<D>[K]>;
  }> &
  Readonly<{
    [K in Exclude<
      keyof PayloadFields<D>,
      RequiredPayloadKeys<D>
    >]?: FieldValue<PayloadFields<D>[K]>;
  }>;

type RootPublicInvocationFor<
  O extends RootPublicOperationId,
  V extends RootPublicVariant<O>,
> = Readonly<{
  readonly kind: "public_invocation";
  readonly schemaVersion: "5.0.0";
  readonly operationId: O;
  readonly variant: V;
  readonly invocationRef: string;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly payload: PublicPayload<RootPublicOperationDefinitions[O][V]>;
}>;

export type RootPublicInvocation = {
  [O in RootPublicOperationId]: {
    [V in RootPublicVariant<O>]: RootPublicInvocationFor<O, V>;
  }[RootPublicVariant<O>];
}[RootPublicOperationId];

export const ROOT_PUBLIC_OPERATION_IDS = Object.freeze(
  Object.keys(ROOT_PUBLIC_OPERATION_DEFINITIONS) as RootPublicOperationId[],
);

interface PublicOutcomeCommon {
  readonly kind: "public_outcome";
  readonly schemaVersion: "5.0.0";
  readonly invocationRef: string;
  readonly runtimeInvocationRef: string | null;
  readonly disposition:
    | "blocked"
    | "failed"
    | "gap_stop"
    | "held"
    | "inspect_runtime_archive"
    | "repair"
    | "reprice"
    | "reprice_required"
    | "escalate"
    | "refused"
    | "succeeded";
  readonly outcomeDigest: Sha256Digest;
  readonly result: JsonValue;
  readonly diagnosticRef: string | null;
  readonly runId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly outputContractRef: string | null;
  readonly admittedResultContractRef: string | null;
  readonly replayRef: string | null;
  readonly replayDigest: Sha256Digest | null;
  readonly replayAgreement: boolean | null;
  readonly eventLogPath: string | null;
  readonly eventLogDigest: Sha256Digest | null;
  readonly eventLogByteLength: number | null;
  readonly durableEventCount: number | null;
  readonly continuationRef: string | null;
  readonly continuationStatus: "open" | "responded" | "resolved" | null;
  readonly continuationAuthority?: JsonValue;
  readonly projectionAuthority?: JsonValue;
}

export type PublicOutcome = {
  [O in RootPublicOperationId]: {
    [V in RootPublicVariant<O>]: PublicOutcomeCommon & Readonly<{
      readonly operationId: O;
      readonly variant: V;
    }>;
  }[RootPublicVariant<O>];
}[RootPublicOperationId];

export interface PublicInvocationRefusal {
  readonly kind: "public_invocation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "duplicate_invocation"
    | "invalid_request"
    | "missing_prerequisite"
    | "owner_refusal"
    | "target_mismatch";
  readonly message: string;
}

export type PublicInvocationResult = PublicOutcome | PublicInvocationRefusal;

const RFC3339_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/u;

function isRfc3339DateTime(value: string): boolean {
  const match = RFC3339_DATE_TIME.exec(value);
  if (match === null) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[7] === undefined ? 0 : Number(match[7]);
  const offsetMinute = match[8] === undefined ? 0 : Number(match[8]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    hour > 23 ||
    minute > 59 ||
    second > 60 ||
    offsetHour > 23 ||
    offsetMinute > 59
  ) {
    return false;
  }
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1]!;
  return day <= daysInMonth;
}

function isJsonValue(value: unknown, seen = new WeakSet<object>()): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) {
    const valid = value.every((entry) => isJsonValue(entry, seen));
    seen.delete(value);
    return valid;
  }
  const prototype = Object.getPrototypeOf(value);
  const valid = (
    (prototype === Object.prototype || prototype === null) &&
    Object.values(value).every((entry) => isJsonValue(entry, seen))
  );
  seen.delete(value);
  return valid;
}

function isRecord(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    isJsonValue(value)
  );
}

function hasExactInvocationKeys(
  value: Readonly<Record<string, JsonValue>>,
): boolean {
  return Object.keys(value).sort().join("\0") === [
    "correlationId",
    "eventTime",
    "invocationRef",
    "kind",
    "operationId",
    "payload",
    "schemaVersion",
    "variant",
  ].join("\0");
}

function isPayloadField(
  value: JsonValue,
  definition: PublicPayloadFieldDefinition,
): boolean {
  switch (definition.kind) {
    case "digest":
      return typeof value === "string" &&
        /^sha256:[0-9a-f]{64}$/u.test(value);
    case "enum":
      return typeof value === "string" &&
        definition.values.includes(value);
    case "nonblank_string":
      return typeof value === "string" && value.trim().length > 0;
    case "record":
      return isRecord(value);
    case "string_array":
      return Array.isArray(value) &&
        value.length >= definition.minItems &&
        value.every(
          (entry) =>
            typeof entry === "string" && entry.trim().length > 0,
        ) &&
        (
          !definition.uniqueItems ||
          new Set(value).size === value.length
        );
  }
}

function containsCompleteGroup(
  payload: Readonly<Record<string, JsonValue>>,
  group: readonly string[],
): boolean | null {
  const present = group.filter((key) => payload[key] !== undefined).length;
  return present === 0 ? false : present === group.length ? true : null;
}

function isDefinedPayload(
  payload: Readonly<Record<string, JsonValue>>,
  definition: PublicPayloadDefinition,
): boolean {
  const suppliedKeys = Object.keys(payload);
  const declaredKeys = new Set(Object.keys(definition.fields));
  if (
    suppliedKeys.some((key) => !declaredKeys.has(key)) ||
    definition.required.some((key) => payload[key] === undefined)
  ) {
    return false;
  }
  for (const [key, value] of Object.entries(payload)) {
    const field = definition.fields[key];
    if (field === undefined || !isPayloadField(value, field)) return false;
  }
  if (
    definition.allOrNone?.some(
      (group) => containsCompleteGroup(payload, group) === null,
    ) === true
  ) {
    return false;
  }
  if (definition.exactlyOne !== undefined) {
    const groups = definition.exactlyOne.map((group) =>
      containsCompleteGroup(payload, group)
    );
    if (
      groups.some((complete) => complete === null) ||
      groups.filter((complete) => complete === true).length !== 1
    ) {
      return false;
    }
  }
  return true;
}

export function parseRootPublicInvocation(
  value: unknown,
): RootPublicInvocation | PublicInvocationRefusal {
  if (
    !isRecord(value) ||
    !hasExactInvocationKeys(value) ||
    value.kind !== "public_invocation" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.operationId !== "string" ||
    !ROOT_PUBLIC_OPERATION_IDS.includes(value.operationId as RootPublicOperationId) ||
    typeof value.variant !== "string" ||
    typeof value.invocationRef !== "string" ||
    value.invocationRef.trim().length === 0 ||
    typeof value.eventTime !== "string" ||
    !isRfc3339DateTime(value.eventTime) ||
    typeof value.correlationId !== "string" ||
    value.correlationId.trim().length === 0 ||
    !isRecord(value.payload)
  ) {
    return {
      kind: "public_invocation_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_request",
      message: "public invocation requires exact operation, identity, time, correlation, and payload fields",
    };
  }
  const operation = (
    ROOT_PUBLIC_OPERATION_DEFINITIONS as Readonly<
      Record<string, Readonly<Record<string, PublicPayloadDefinition>>>
    >
  )[value.operationId];
  if (operation === undefined) {
    return {
      kind: "public_invocation_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_request",
      message: "public invocation operation is absent",
    };
  }
  const definition = (
    operation as Readonly<Record<string, PublicPayloadDefinition>>
  )[value.variant];
  if (
    definition === undefined ||
    !isDefinedPayload(value.payload, definition)
  ) {
    return {
      kind: "public_invocation_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_request",
      message:
        "public invocation operation, variant, and payload do not match one closed public definition",
    };
  }
  return value as unknown as RootPublicInvocation;
}
