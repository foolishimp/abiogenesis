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
import { bindExactPrefixRead } from
  "../shared/static_definition_bindings.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  closeAbgEventResource,
  validateAbgEventResourceAssertion,
  validateAbgEventResourceReceipt,
  type AcquiredAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "./definition_event_resource.js";
import { ABG_PROJECT_READ_CONTRACTS } from "./project_read_operation_contracts.js";
import {
  ABG_PROJECT_READ_OWNER_PORTS,
  type AbgProjectReadMemberKey,
  type AbgProjectReadPacket,
  type AbgProjectReadProjection,
  type AbgProjectReadRefusal,
  type AbgProjectReadResult,
} from "./project_read_ports.js";

export interface AbgProjectReadResourceAssertion {
  readonly kind: "abg_project_read_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: Extract<
    AbgEventResourceAssertion,
    { readonly kind: "reopen_abg_event_resource" }
  >;
}

export interface AbgProjectReadResourceReceipt {
  readonly kind: "abg_project_read_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt & Readonly<{
    readonly acquisitionKind: "reopen";
  }>;
}

const ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
  kind: v.literal("abg_project_read_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgProjectReadResourceAssertion["eventResource"]>(
    (candidate) => validateAbgEventResourceAssertion(candidate) &&
      candidate.kind === "reopen_abg_event_resource",
    "abg_event_resource_assertion",
  ),
}) as v.GenericSchema<
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceAssertion
>;

const ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("abg_project_read_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgProjectReadResourceReceipt["eventResource"]>(
    (candidate) => validateAbgEventResourceReceipt(candidate) &&
      candidate.acquisitionKind === "reopen",
    "abg_event_resource_receipt",
  ),
}) as v.GenericSchema<
  AbgProjectReadResourceReceipt,
  AbgProjectReadResourceReceipt
>;

type AnyReadPacket = (typeof ABG_PROJECT_READ_CONTRACTS)[keyof typeof ABG_PROJECT_READ_CONTRACTS];
function fault<TPacket extends AnyReadPacket>(
  call: DefinitionCall<TPacket, AbgProjectReadResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): PreDefinitionExecutionFault<TPacket["definitionKey"]> {
  return preDefinitionFault(
    call.invocation.definitionKey,
    stage,
    code,
    message,
  );
}

function closeReadEventResource(
  resource: AcquiredAbgEventResource,
): AbgProjectReadResourceReceipt["eventResource"] {
  const receipt = closeAbgEventResource(resource, resource.entryPrefix);
  if (!isReadEventResourceReceipt(receipt)) {
    throw new TypeError("ABG project read closed a non-reopened event resource");
  }
  return receipt;
}

function isReadEventResourceReceipt(
  receipt: AbgEventResourceReceipt,
): receipt is AbgProjectReadResourceReceipt["eventResource"] {
  return receipt.acquisitionKind === "reopen";
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

function outputFor<TPacket extends AnyReadPacket>(
  packet: TPacket,
  request: Readonly<Record<string, JsonValue>>,
  memberKey: AbgProjectReadMemberKey,
  native: AbgProjectReadResult,
): OwnerSemanticOutput<TPacket> {
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
  return output as unknown as OwnerSemanticOutput<TPacket>;
}

function projectRead<
  TPacket extends AnyReadPacket,
  TMemberKey extends AbgProjectReadMemberKey,
>(
  packet: TPacket,
  memberKey: TMemberKey,
  project: (
    input: AbgProjectReadPacket<TMemberKey>,
  ) => AbgProjectReadResult<TMemberKey>,
  call: DefinitionCall<TPacket, AbgProjectReadResourceAssertion>,
): ReturnType<ExactDefinitionCallable<
  TPacket,
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceReceipt
>> {
  return Effect.try({
    try: (): DefinitionReturn<TPacket, AbgProjectReadResourceReceipt> => {
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      if (
        acquired.kind !== "acquired_abg_event_resource" ||
        acquired.resource.acquisitionKind !== "reopen"
      ) {
        throw fault(
          call,
          "resource_acquisition",
          acquired.kind === "abg_event_resource_refusal"
            ? acquired.code
            : "invalid_resource_assertion",
          acquired.kind === "abg_event_resource_refusal"
            ? acquired.message
            : "ABG project reads require a reopened event resource",
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
          const ownerOutput = {
            outcomeKind: "refusal",
            value: {
              code: "projection_basis_mismatch",
              issuePaths: ["/projectionBasis"],
              evidenceRefs: [],
            },
          } as OwnerSemanticOutput<TPacket>;
          return deepFreeze({
            ownerOutput,
            resources: {
              kind: "abg_project_read_resource_receipt",
              schemaVersion: "5.0.0",
              eventResource: closeReadEventResource(resource),
            },
          });
        }
        const native = project({
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
            eventResource: closeReadEventResource(resource),
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
      throw cause;
    },
  });
}

const run_status = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.run_status,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.run_status,
    "run_status",
    ABG_PROJECT_READ_OWNER_PORTS.run_status.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const graph_call_status = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.graph_call_status,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.graph_call_status,
    "graph_call_status",
    ABG_PROJECT_READ_OWNER_PORTS.graph_call_status.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const run_result = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.run_result,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.run_result,
    "run_result",
    ABG_PROJECT_READ_OWNER_PORTS.run_result.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const graph_call_result = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.graph_call_result,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.graph_call_result,
    "graph_call_result",
    ABG_PROJECT_READ_OWNER_PORTS.graph_call_result.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const run_evidence = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.run_evidence,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.run_evidence,
    "run_evidence",
    ABG_PROJECT_READ_OWNER_PORTS.run_evidence.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const graph_call_evidence = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.graph_call_evidence,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.graph_call_evidence,
    "graph_call_evidence",
    ABG_PROJECT_READ_OWNER_PORTS.graph_call_evidence.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const result_evidence = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.result_evidence,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.result_evidence,
    "result_evidence",
    ABG_PROJECT_READ_OWNER_PORTS.result_evidence.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const assessment_evidence = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.assessment_evidence,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.assessment_evidence,
    "assessment_evidence",
    ABG_PROJECT_READ_OWNER_PORTS.assessment_evidence.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const witness_evidence = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.witness_evidence,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.witness_evidence,
    "witness_evidence",
    ABG_PROJECT_READ_OWNER_PORTS.witness_evidence.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const workspace_replay = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.workspace_replay,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.workspace_replay,
    "workspace_replay",
    ABG_PROJECT_READ_OWNER_PORTS.workspace_replay.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const run_replay = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.run_replay,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.run_replay,
    "run_replay",
    ABG_PROJECT_READ_OWNER_PORTS.run_replay.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const graph_call_replay = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.graph_call_replay,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.graph_call_replay,
    "graph_call_replay",
    ABG_PROJECT_READ_OWNER_PORTS.graph_call_replay.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const interaction_replay = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.interaction_replay,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.interaction_replay,
    "interaction_replay",
    ABG_PROJECT_READ_OWNER_PORTS.interaction_replay.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const continuation_replay = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.continuation_replay,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.continuation_replay,
    "continuation_replay",
    ABG_PROJECT_READ_OWNER_PORTS.continuation_replay.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const c_call_replay = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.c_call_replay,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.c_call_replay,
    "c_call_replay",
    ABG_PROJECT_READ_OWNER_PORTS.c_call_replay.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const workspace_gaps = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.workspace_gaps,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.workspace_gaps,
    "workspace_gaps",
    ABG_PROJECT_READ_OWNER_PORTS.workspace_gaps.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const run_gaps = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.run_gaps,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.run_gaps,
    "run_gaps",
    ABG_PROJECT_READ_OWNER_PORTS.run_gaps.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);
const run_lawful_actions = bindExactPrefixRead(
  ABG_PROJECT_READ_CONTRACTS.run_lawful_actions,
  (call) => projectRead(
    ABG_PROJECT_READ_CONTRACTS.run_lawful_actions,
    "run_lawful_actions",
    ABG_PROJECT_READ_OWNER_PORTS.run_lawful_actions.project,
    call,
  ),
  ABG_PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
  ABG_PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
);

export const ABG_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze({
  run_status,
  graph_call_status,
  run_result,
  graph_call_result,
  run_evidence,
  graph_call_evidence,
  result_evidence,
  assessment_evidence,
  witness_evidence,
  workspace_replay,
  run_replay,
  graph_call_replay,
  interaction_replay,
  continuation_replay,
  c_call_replay,
  workspace_gaps,
  run_gaps,
  run_lawful_actions,
});
