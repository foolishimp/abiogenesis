import * as Effect from "effect/Effect";
import * as v from "valibot";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  admitDefinitionExecutionFault,
  preDefinitionFault,
  type DefinitionCall,
  type DefinitionReturn,
  type ExactDefinitionCallable,
  type PreDefinitionExecutionFault,
} from "../shared/effect_definition.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admitRuntimeContract,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  closeAbgEventResource,
  validateAbgEventResourceReceipt,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "./definition_event_resource.js";
import { ABG_PROJECT_READ_CONTRACTS } from "./project_read_operation_contracts.js";
import {
  ABG_PROJECT_READ_OWNER_PORTS,
  type AbgProjectReadMemberKey,
  type AbgProjectReadProjection,
  type AbgProjectReadRefusal,
  type AbgProjectReadResult,
} from "./project_read_ports.js";

export interface AbgProjectReadResourceAssertion {
  readonly kind: "abg_project_read_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
}

export interface AbgProjectReadResourceReceipt {
  readonly kind: "abg_project_read_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
}

const ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("abg_project_read_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceReceipt>(
    validateAbgEventResourceReceipt,
    "abg_event_resource_receipt",
  ),
}) as v.GenericSchema<
  AbgProjectReadResourceReceipt,
  AbgProjectReadResourceReceipt
>;

type AnyReadPacket = (typeof ABG_PROJECT_READ_CONTRACTS)[keyof typeof ABG_PROJECT_READ_CONTRACTS];
type AnyReadCallable = ExactDefinitionCallable<
  AnyReadPacket,
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceReceipt
>;

function fault(
  call: DefinitionCall<AnyReadPacket, AbgProjectReadResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): PreDefinitionExecutionFault<AnyReadPacket["definitionKey"]> {
  return preDefinitionFault(
    call.invocation.definitionKey,
    stage,
    code,
    message,
  );
}

function asRecord(value: unknown): Readonly<Record<string, JsonValue>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, JsonValue>>
    : null;
}

function stringValue(
  value: Readonly<Record<string, JsonValue>>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] as string : null;
}

function digestValue(
  value: Readonly<Record<string, JsonValue>>,
  key: string,
): Sha256Digest | null {
  const candidate = value[key];
  return typeof candidate === "string" && /^sha256:[0-9a-f]{64}$/u.test(candidate)
    ? candidate as Sha256Digest
    : null;
}

function reference(ref: string, digest: Sha256Digest) {
  return { ref, digest } as const;
}

function coordinateFrom(
  value: unknown,
  refKeys: readonly string[],
  digestKeys: readonly string[],
): Readonly<{ readonly ref: string; readonly digest: Sha256Digest }> | null {
  const record = asRecord(value);
  if (record === null) return null;
  const ref = refKeys.map((key) => stringValue(record, key)).find((row) => row !== null);
  const digest = digestKeys.map((key) => digestValue(record, key)).find((row) => row !== null);
  return ref === undefined || ref === null || digest === undefined || digest === null
    ? null
    : reference(ref, digest);
}

function coordinateSet(
  values: unknown,
  refKeys: readonly string[],
  digestKeys: readonly string[],
): readonly Readonly<{ readonly ref: string; readonly digest: Sha256Digest }>[] {
  if (!Array.isArray(values)) return Object.freeze([]);
  return Object.freeze(values.flatMap((value) => {
    const coordinate = coordinateFrom(value, refKeys, digestKeys);
    return coordinate === null ? [] : [coordinate];
  }));
}

function replayCoordinate(
  value: Readonly<Record<string, JsonValue>>,
): Readonly<{ readonly ref: string; readonly digest: Sha256Digest }> | null {
  return coordinateFrom(value, ["replayRef"], ["replayDigest"]);
}

function sourceCoordinate(request: Readonly<Record<string, JsonValue>>) {
  const source = asRecord(request.source)!;
  return reference(
    source.sourceRef as string,
    source.sourceDigest as Sha256Digest,
  );
}

function basisCoordinate(request: Readonly<Record<string, JsonValue>>) {
  const basis = asRecord(request.projectionBasis)!;
  return reference(
    basis.projectionBasisRef as string,
    basis.projectionBasisDigest as Sha256Digest,
  );
}

function statusProjection(
  memberKey: "run_status" | "graph_call_status",
  request: Readonly<Record<string, JsonValue>>,
  value: Readonly<Record<string, JsonValue>>,
): JsonValue {
  const replay = replayCoordinate(value);
  if (replay === null) throw new TypeError("status projection lacks replay identity");
  const status = stringValue(value, "runtimeStatus") ?? stringValue(value, "status");
  if (status === null) throw new TypeError("status projection lacks status");
  const active = Array.isArray(value.holdsAt)
    ? value.holdsAt
    : Array.isArray(value.activeFluents)
    ? value.activeFluents
    : [];
  return {
    kind: memberKey === "run_status"
      ? "run_status_projection"
      : "graph_call_status_projection",
    subject: sourceCoordinate(request),
    status,
    replay,
    activeFluents: active.map((row) => {
      const digest = sha256Canonical(row as JsonValue);
      return reference(
        `runtime-fluent://abiogenesis/${digest.slice("sha256:".length)}`,
        digest,
      );
    }),
  };
}

function resultProjection(
  memberKey: "run_result" | "graph_call_result",
  request: Readonly<Record<string, JsonValue>>,
  value: Readonly<Record<string, JsonValue>>,
): JsonValue {
  const replay = replayCoordinate(value);
  const terminalRoute = coordinateFrom(
    value.terminalRoute,
    ["routeRef"],
    ["routeDigest"],
  );
  const result = coordinateFrom(
    value.admittedResult,
    ["resultRef"],
    ["resultDigest"],
  );
  if (replay === null || terminalRoute === null || result === null) {
    throw new TypeError("result projection lacks terminal owner coordinates");
  }
  return {
    kind: memberKey === "run_result"
      ? "run_result_projection"
      : "graph_call_result_projection",
    subject: sourceCoordinate(request),
    result,
    terminalRoute,
    replay,
  };
}

function evidenceProjection(
  memberKey: AbgProjectReadMemberKey,
  request: Readonly<Record<string, JsonValue>>,
  value: Readonly<Record<string, JsonValue>>,
): JsonValue {
  const replay = replayCoordinate(value);
  if (replay === null) throw new TypeError("evidence projection lacks replay identity");
  const eventAtoms = coordinateSet(
    value.eventAtoms,
    ["atomRef", "eventId"],
    ["atomDigest", "eventDigest"],
  );
  const evidence = Array.isArray(value.evidenceRefs)
    ? (value.evidenceRefs as JsonValue[]).flatMap((row) => {
        if (typeof row !== "string") return [];
        const digest = sha256Canonical({ evidenceRef: row });
        return [reference(row, digest)];
      })
    : [];
  return {
    kind: `${memberKey}_projection`,
    subject: sourceCoordinate(request),
    evidence,
    eventAtoms,
    replay,
  };
}

function replayProjection(
  memberKey: AbgProjectReadMemberKey,
  request: Readonly<Record<string, JsonValue>>,
  value: Readonly<Record<string, JsonValue>>,
): JsonValue {
  const replay = replayCoordinate(value);
  const selector = asRecord(request.selector)!;
  if (replay === null) throw new TypeError("replay projection lacks replay identity");
  if (
    typeof selector.fromOrdinal !== "number" ||
    typeof selector.limit !== "number"
  ) throw new TypeError("replay projection lacks its exact ordinal page");
  return {
    kind: `${memberKey}_projection`,
    subject: sourceCoordinate(request),
    replay,
    fromOrdinal: selector.fromOrdinal,
    limit: selector.limit,
  };
}

function gapProjection(
  memberKey: "workspace_gaps" | "run_gaps",
  request: Readonly<Record<string, JsonValue>>,
  value: Readonly<Record<string, JsonValue>>,
): JsonValue {
  const replay = replayCoordinate(value) ?? reference(
    basisCoordinate(request).ref,
    basisCoordinate(request).digest,
  );
  const gaps = coordinateSet(
    value.gaps,
    ["gapRef", "routeRef"],
    ["gapDigest", "routeDigest"],
  );
  return {
    kind: memberKey === "workspace_gaps"
      ? "workspace_gap_projection"
      : "run_gap_projection",
    subject: sourceCoordinate(request),
    gaps,
    replay,
  };
}

function lawfulActionProjection(
  request: Readonly<Record<string, JsonValue>>,
  value: Readonly<Record<string, JsonValue>>,
): JsonValue {
  const replay = replayCoordinate(value);
  if (replay === null) throw new TypeError("lawful-action projection lacks replay identity");
  return {
    kind: "run_lawful_action_projection",
    run: sourceCoordinate(request),
    actions: coordinateSet(
      value.lawfulActions,
      ["projectionRef", "routeRef"],
      ["projectionDigest", "routeDigest"],
    ),
    replay,
  };
}

function projectValue(
  memberKey: AbgProjectReadMemberKey,
  request: Readonly<Record<string, JsonValue>>,
  native: AbgProjectReadProjection,
): JsonValue {
  const value = asRecord(native.value);
  if (value === null) throw new TypeError("ABG projection owner returned a non-object value");
  switch (memberKey) {
    case "run_status":
    case "graph_call_status":
      return statusProjection(memberKey, request, value);
    case "run_result":
    case "graph_call_result":
      return resultProjection(memberKey, request, value);
    case "run_evidence":
    case "graph_call_evidence":
    case "result_evidence":
    case "assessment_evidence":
    case "witness_evidence":
      return evidenceProjection(memberKey, request, value);
    case "workspace_replay":
    case "run_replay":
    case "graph_call_replay":
    case "interaction_replay":
    case "continuation_replay":
    case "c_call_replay":
      return replayProjection(memberKey, request, value);
    case "workspace_gaps":
    case "run_gaps":
      return gapProjection(memberKey, request, value);
    case "run_lawful_actions":
      return lawfulActionProjection(request, value);
  }
}

function nativeRefusalCode(
  result: AbgProjectReadRefusal,
): "projection_basis_mismatch" | "not_found" {
  return result.code === "target_absent"
    ? "not_found"
    : "projection_basis_mismatch";
}

function outputFor(
  packet: AnyReadPacket,
  request: Readonly<Record<string, JsonValue>>,
  memberKey: AbgProjectReadMemberKey,
  native: AbgProjectReadResult,
): OwnerSemanticOutput<AnyReadPacket> {
  const output = native.kind ===
      "abg_project_read_refusal"
    ? {
        outcomeKind: "refusal",
        value: {
          code: nativeRefusalCode(native),
          issuePaths: [],
          evidenceRefs: [],
        },
      }
    : {
        outcomeKind: "result",
        value: {
          caseKey: memberKey,
          source: sourceCoordinate(request),
          projectionBasis: basisCoordinate(request),
          projection: projectValue(memberKey, request, native),
        },
      } as const;
  const schema = output.outcomeKind === "result"
    ? packet.resultSchema
    : packet.refusalSchema;
  if (admitRuntimeContract(schema, output.value).disposition !== "admitted") {
    throw new TypeError(`ABG ${memberKey} output differs from its exact owner contract`);
  }
  return output as unknown as OwnerSemanticOutput<AnyReadPacket>;
}

function binding(
  packet: AnyReadPacket,
  memberKey: AbgProjectReadMemberKey,
): AnyReadCallable {
  return (call) => Effect.try({
    try: (): DefinitionReturn<AnyReadPacket, AbgProjectReadResourceReceipt> => {
      if (
        Object.keys(call.resources).sort().join("\0") !==
          ["eventResource", "kind", "schemaVersion"].sort().join("\0") ||
        call.resources.kind !== "abg_project_read_resource_assertion" ||
        call.resources.schemaVersion !== "5.0.0" ||
        call.resources.eventResource.kind !== "reopen_abg_event_resource"
      ) {
        throw fault(
          call,
          "resource_admission",
          "invalid_resource_assertion",
          "ABG reads require one exact reopened event-resource assertion",
        );
      }
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      if (acquired.kind !== "acquired_abg_event_resource") {
        throw fault(
          call,
          "resource_acquisition",
          acquired.code,
          acquired.message,
        );
      }
      const resource = acquired.resource;
      try {
        const request = call.invocation.request as Readonly<Record<string, JsonValue>>;
        const basis = basisCoordinate(request);
        if (
          basis.ref !== resource.entryPrefix.eventLogRef ||
          basis.digest !== resource.entryPrefix.coordinateDigest
        ) {
          const ownerOutput: OwnerSemanticOutput<AnyReadPacket> = {
            outcomeKind: "refusal",
            value: {
              code: "projection_basis_mismatch",
              issuePaths: ["/projectionBasis"],
              evidenceRefs: [],
            },
          };
          return deepFreeze({
            ownerOutput,
            resources: {
              kind: "abg_project_read_resource_receipt",
              schemaVersion: "5.0.0",
              eventResource: closeAbgEventResource(
                resource,
                resource.entryPrefix,
              ),
            },
          });
        }
        const port = ABG_PROJECT_READ_OWNER_PORTS[memberKey].project as (
          input: Readonly<{
            kind: "abg_project_read_packet";
            schemaVersion: "5.0.0";
            memberKey: AbgProjectReadMemberKey;
            prefix: typeof resource.entryPrefix;
            targetRef: string;
          }>,
        ) => AbgProjectReadResult;
        const native = port({
          kind: "abg_project_read_packet",
          schemaVersion: "5.0.0",
          memberKey,
          prefix: resource.entryPrefix,
          targetRef: sourceCoordinate(request).ref,
        });
        const ownerOutput = outputFor(packet, request, memberKey, native);
        return deepFreeze({
          ownerOutput,
          resources: {
            kind: "abg_project_read_resource_receipt",
            schemaVersion: "5.0.0",
            eventResource: closeAbgEventResource(
              resource,
              resource.entryPrefix,
            ),
          },
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => {
      const admittedFault = admitDefinitionExecutionFault(
        cause,
        call.invocation.definitionKey,
        (candidate) => v.is(ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA, candidate)
          ? { resourceReceipt: candidate }
          : null,
      );
      if (admittedFault !== null) return admittedFault;
      if (
        typeof cause === "object" && cause !== null &&
        (cause as { kind?: unknown }).kind === "definition_execution_fault"
      ) {
        throw new TypeError(
          "ABG project-read owner emitted a malformed execution fault",
        );
      }
      return fault(
        call,
        "owner_projection",
        "projection_failure",
        String(cause),
      );
    },
  });
}

const bindings = Object.fromEntries(
  Object.entries(ABG_PROJECT_READ_CONTRACTS).map(([memberKey, packet]) => [
    memberKey,
    binding(packet, memberKey as AbgProjectReadMemberKey),
  ]),
) as Readonly<Record<AbgProjectReadMemberKey, AnyReadCallable>>;

export const ABG_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze(bindings);
