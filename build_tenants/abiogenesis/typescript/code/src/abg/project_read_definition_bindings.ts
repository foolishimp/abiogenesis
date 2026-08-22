import * as Effect from "effect/Effect";
import * as v from "valibot";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
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
  validateAbgEventResourceAssertion,
  validateAbgEventResourceReceipt,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
  type AcquiredAbgEventResource,
} from "./definition_event_resource.js";
import { projectExactPrefixWorkspaceEnvironment } from
  "./environment_admission.js";
import { ABG_PROJECT_READ_CONTRACTS } from "./project_read_operation_contracts.js";
import {
  ABG_PROJECT_READ_OWNER_PORTS,
  projectRunTruthAtDurablePrefix,
  RunProjectionPort,
  type AbgProjectReadMemberKey,
  type AbgProjectReadPacket,
  type AbgProjectReadProjection,
  type AbgProjectReadRefusal,
  type AbgProjectReadResult,
} from "./project_read_ports.js";
import {
  constructCapabilityGrant,
  validateCapabilityGrantForProductBasis,
} from "../product/invocation.js";
import {
  bindExactPrefixRead,
} from "../shared/static_definition_bindings.js";

type ReopenAbgEventResourceAssertion = Extract<
  AbgEventResourceAssertion,
  { readonly kind: "reopen_abg_event_resource" }
>;

type ReopenAbgEventResourceReceipt = AbgEventResourceReceipt & Readonly<{
  readonly acquisitionKind: "reopen";
}>;

export interface AbgProjectReadResourceAssertion {
  readonly kind: "abg_project_read_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenAbgEventResourceAssertion;
}

export interface AbgProjectReadResourceReceipt {
  readonly kind: "abg_project_read_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenAbgEventResourceReceipt;
}

type AnyReadPacket = (typeof ABG_PROJECT_READ_CONTRACTS)[keyof typeof ABG_PROJECT_READ_CONTRACTS];
type AnyReadCallable = ExactDefinitionCallable<
  AnyReadPacket,
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceReceipt
>;

type RunReadMemberKey = "run_status" | "run_result" | "run_replay";
type RunReadPort = (
  input: AbgProjectReadPacket<RunReadMemberKey>,
) => AbgProjectReadResult<RunReadMemberKey>;

const RUN_READ_MEMBER_KEYS = Object.freeze([
  "run_status",
  "run_result",
  "run_replay",
] as const);

const EVENT_RESOURCE_ASSERTION_SCHEMA = v.custom<
  ReopenAbgEventResourceAssertion
>(
  (value) => validateAbgEventResourceAssertion(value) &&
    value.kind === "reopen_abg_event_resource",
  "reopened_abg_event_resource_assertion",
);

const EVENT_RESOURCE_RECEIPT_SCHEMA = v.custom<
  ReopenAbgEventResourceReceipt
>(
  (value) => validateAbgEventResourceReceipt(value) &&
    value.acquisitionKind === "reopen",
  "reopened_abg_event_resource_receipt",
);

const PROJECT_READ_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
  kind: v.literal("abg_project_read_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
}) as v.GenericSchema<
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceAssertion
>;

const PROJECT_READ_RESOURCE_RECEIPT_SCHEMA = v.strictObject({
  kind: v.literal("abg_project_read_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_RECEIPT_SCHEMA,
}) as v.GenericSchema<
  AbgProjectReadResourceReceipt,
  AbgProjectReadResourceReceipt
>;

function fault(
  call: DefinitionCall<AnyReadPacket, AbgProjectReadResourceAssertion>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<AnyReadPacket["definitionKey"]> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    stage,
    code,
    message,
    evidence: {},
  });
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
  return coordinateFrom(value, ["replayRef"], ["replayDigest"]) ??
    coordinateFrom(
      value.physicalCoordinates,
      ["scopedReplayRef"],
      ["scopedReplayDigest"],
    );
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

function sameJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function closeReadEventResource(
  resource: AcquiredAbgEventResource,
): ReopenAbgEventResourceReceipt {
  const receipt = closeAbgEventResource(resource, resource.entryPrefix);
  if (receipt.acquisitionKind !== "reopen") {
    throw new TypeError("project reads must close one reopened ABG resource");
  }
  return receipt as ReopenAbgEventResourceReceipt;
}

function finishRead(
  resource: AcquiredAbgEventResource,
  ownerOutput: OwnerSemanticOutput<AnyReadPacket>,
): DefinitionReturn<AnyReadPacket, AbgProjectReadResourceReceipt> {
  return deepFreeze({
    ownerOutput,
    resources: {
      kind: "abg_project_read_resource_receipt" as const,
      schemaVersion: "5.0.0" as const,
      eventResource: closeReadEventResource(resource),
    },
  });
}

function refusalOutput(
  packet: AnyReadPacket,
  code:
    | "unknown_source"
    | "source_digest_mismatch"
    | "projection_basis_mismatch",
  issuePath: string,
): OwnerSemanticOutput<AnyReadPacket> {
  const output = {
    outcomeKind: "refusal" as const,
    value: {
      code,
      issuePaths: [issuePath],
      evidenceRefs: [],
    },
  };
  if (admitRuntimeContract(packet.refusalSchema, output.value).disposition !== "admitted") {
    throw new TypeError("ABG run-read refusal differs from its exact owner contract");
  }
  return deepFreeze(output) as OwnerSemanticOutput<AnyReadPacket>;
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
      const fluent = asRecord(row);
      const fluentRef = fluent === null
        ? null
        : stringValue(fluent, "fluentRef");
      if (fluentRef === null) {
        throw new TypeError("status projection lacks owner fluent identity");
      }
      const digest = sha256Canonical(row as JsonValue);
      return reference(fluentRef, digest);
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

/** One authority/currentness relation shared by the three fixed Run reads. */
function runReadKernel(
  packet: AnyReadPacket,
  port: RunReadPort,
): AnyReadCallable {
  return (call) => Effect.try({
    try: () => {
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
        const request = call.invocation.request as Readonly<
          Record<string, JsonValue>
        >;
        const source = sourceCoordinate(request);
        const basis = basisCoordinate(request);
        const slots = call.invocation.invocationAuthority.slots;
        const workspaceBinding = slots.workspace_binding;
        if (
          workspaceBinding === null ||
          basis.ref !== resource.entryPrefix.eventLogRef ||
          basis.digest !== resource.entryPrefix.coordinateDigest
        ) {
          return finishRead(
            resource,
            refusalOutput(packet, "projection_basis_mismatch", "/projectionBasis"),
          );
        }
        const environment = projectExactPrefixWorkspaceEnvironment(
          resource.entryPrefix,
          workspaceBinding,
        );
        if (environment.kind !== "exact_prefix_workspace_environment") {
          return finishRead(
            resource,
            refusalOutput(
              packet,
              "projection_basis_mismatch",
              "/invocationAuthority/slots/workspace_binding",
            ),
          );
        }
        const grantBasis = {
          admittedInstalls: environment.productInstalls,
          workspaceBinding: environment.workspaceBinding,
          definitionKey: packet.definitionKey,
        } as const;
        const expectedGrants = packet.metadata.capabilityRefs.map(
          (capabilityRef) => constructCapabilityGrant(
            environment.workspaceAuthorityBasis,
            environment.workspaceBinding.authorizedActorRef,
            packet.definitionKey.operationId,
            capabilityRef,
            grantBasis,
          ),
        );
        if (expectedGrants.some((grant) =>
          !sameJson(
            grant.operationContract.contractCatalog,
            call.invocation.contractCatalog,
          )
        )) {
          return finishRead(
            resource,
            refusalOutput(packet, "projection_basis_mismatch", "/contractCatalog"),
          );
        }
        const expectedAuthority = {
          workspace_binding: {
            ref: environment.workspaceBinding.bindingId,
            digest: environment.workspaceBinding.bindingDigest,
          },
          product_set: environment.productInstalls.map((install) => ({
            ref: install.installId,
            digest: install.productContentDigest,
          })),
          dependency_lock: {
            ref: environment.resolvedProductLock.lockId,
            digest: environment.resolvedProductLock.lockDigest,
          },
          capability_grants: {
            requiredCapabilityRefs: packet.metadata.capabilityRefs,
            grants: expectedGrants.map((grant) => ({
              ref: grant.grantRef,
              digest: grant.grantDigest,
            })),
          },
        } as const;
        if (
          slots.actor !== null ||
          !sameJson(slots.workspace_binding, expectedAuthority.workspace_binding) ||
          !sameJson(slots.product_set, expectedAuthority.product_set) ||
          !sameJson(slots.dependency_lock, expectedAuthority.dependency_lock) ||
          !sameJson(
            slots.capability_grants,
            expectedAuthority.capability_grants,
          ) ||
          expectedGrants.some((grant, index) =>
            !validateCapabilityGrantForProductBasis(
              grant,
              environment.workspaceAuthorityBasis,
              environment.workspaceBinding.authorizedActorRef,
              packet.metadata.capabilityRefs[index]!,
              grantBasis,
            )
          )
        ) {
          return finishRead(
            resource,
            refusalOutput(
              packet,
              "projection_basis_mismatch",
              "/invocationAuthority",
            ),
          );
        }
        const truth = projectRunTruthAtDurablePrefix(
          resource.entryPrefix,
          source.ref,
        );
        if (truth.kind !== "abg_run_truth_projection") {
          return finishRead(
            resource,
            refusalOutput(packet, "unknown_source", "/source/sourceRef"),
          );
        }
        if (source.ref !== truth.run.ref || source.digest !== truth.run.digest) {
          return finishRead(
            resource,
            refusalOutput(packet, "source_digest_mismatch", "/source/sourceDigest"),
          );
        }
        if (
          truth.workspaceBinding.ref !== environment.workspaceBinding.bindingId ||
          truth.workspaceBinding.digest !==
            environment.workspaceBinding.bindingDigest
        ) {
          return finishRead(
            resource,
            refusalOutput(
              packet,
              "projection_basis_mismatch",
              "/invocationAuthority/slots/workspace_binding",
            ),
          );
        }
        const native = port({
          kind: "abg_project_read_packet",
          schemaVersion: "5.0.0",
          memberKey: packet.definitionKey.memberKey,
          prefix: resource.entryPrefix,
          targetRef: source.ref,
        } as AbgProjectReadPacket<RunReadMemberKey>);
        return finishRead(
          resource,
          outputFor(packet, request, packet.definitionKey.memberKey, native),
        );
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => {
      if (
        typeof cause === "object" && cause !== null &&
        (cause as { kind?: unknown }).kind === "definition_execution_fault"
      ) {
        return cause as DefinitionExecutionFault<AnyReadPacket["definitionKey"]>;
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
              eventResource: closeReadEventResource(resource),
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
            eventResource: closeReadEventResource(resource),
          },
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => {
      if (
        typeof cause === "object" && cause !== null &&
        (cause as { kind?: unknown }).kind === "definition_execution_fault"
      ) return cause as DefinitionExecutionFault<AnyReadPacket["definitionKey"]>;
      return fault(
        call,
        "owner_projection",
        "projection_failure",
        String(cause),
      );
    },
  });
}

const legacyBindings = Object.fromEntries(
  Object.entries(ABG_PROJECT_READ_CONTRACTS).flatMap(([memberKey, packet]) =>
    RUN_READ_MEMBER_KEYS.includes(memberKey as RunReadMemberKey)
      ? []
      : [[
          memberKey,
          binding(packet, memberKey as AbgProjectReadMemberKey),
        ]]
  ),
) as Readonly<Partial<Record<AbgProjectReadMemberKey, AnyReadCallable>>>;

const RUN_READ_DEFINITION_BINDINGS = Object.freeze({
  run_status: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.run_status,
    runReadKernel(
      ABG_PROJECT_READ_CONTRACTS.run_status,
      RunProjectionPort.run_status as RunReadPort,
    ),
    PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
    PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
  run_result: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.run_result,
    runReadKernel(
      ABG_PROJECT_READ_CONTRACTS.run_result,
      RunProjectionPort.run_result as RunReadPort,
    ),
    PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
    PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
  run_replay: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.run_replay,
    runReadKernel(
      ABG_PROJECT_READ_CONTRACTS.run_replay,
      RunProjectionPort.run_replay as RunReadPort,
    ),
    PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
    PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
});

export const ABG_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze({
  ...legacyBindings,
  ...RUN_READ_DEFINITION_BINDINGS,
});
