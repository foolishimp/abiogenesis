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
import { admitJson, hasExactKeys, isRecord } from "../shared/admit/index.js";
import { renderDiagnosticText } from "../shared/diagnostic_text.js";
import {
  admitRuntimeContract,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import {
  acquireAbgEventResource,
  abandonAbgEventResource,
  closeAbgEventResource,
  completeAbgEventResource,
  validateAbgEventResourceOutcome,
  validateAbgEventResourceReceipt,
  validateReopenedAbgEventResourceInput,
  type AbgEventResourceCompletion,
  type AbgEventResourceReceipt,
  type AcquiredAbgEventResource,
  type ReopenedAbgEventResourceInput,
} from "./definition_event_resource.js";
import {
  projectExactPrefixWorkspaceEnvironment,
  projectWorkspaceEnvironmentFromArtifactTruth,
  type ExactPrefixWorkspaceEnvironment,
} from "./environment_admission.js";
import { projectOwnedPrefixArtifactTruth } from "./artifact_truth.js";
import type { DurablePrefixCoordinate } from "./event_store.js";
import { withOperationBodies } from "./event_prefix.js";
import { ABG_PROJECT_READ_CONTRACTS, ABG_RUN_STOP_READING_SCHEMA } from "./project_read_operation_contracts.js";
import { ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA, isAbgTypedTerminalResult, type AbgHistoricalDeclarationProof } from "./terminal_result_contracts.js";
import {
  ABG_PROJECT_READ_OWNER_PORTS,
  prepareRunReadAtDurablePrefix,
  type AbgProjectReadMemberKey,
  type AbgProjectReadProjection,
  type AbgProjectReadRefusal,
  type AbgProjectReadResult,
} from "./project_read_ports.js";
import {
  constructCapabilityGrant,
  validateCapabilityGrantForProductBasis,
} from "../product/invocation.js";
import { productInstallCoordinate } from "../product/environment.js";
import { projectProductManifestOperationCoordinate } from "../product/verify_product.js";
import { readExecutingToolchainIdentity } from "../product/declaration_exports.js";
import {
  bindExactPrefixRead,
} from "./exact_prefix_bindings.js";
import { canonicalEquals } from "../shared/value/index.js";

type ReopenAbgEventResourceReceipt = AbgEventResourceReceipt & Readonly<{
  readonly acquisitionKind: "reopen";
}>;

/** Run reads admit a reopened cold entry or a current held selection; the
 * legacy reads stay reopen-only (§10.9 R-B). */
export interface AbgProjectReadResourceAssertion {
  readonly kind: "abg_project_read_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenedAbgEventResourceInput;
  readonly declarationProof?: AbgHistoricalDeclarationProof;
}

export interface AbgProjectReadResourceReceipt {
  readonly kind: "abg_project_read_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenAbgEventResourceReceipt | AbgEventResourceCompletion;
}

type AnyReadPacket = (typeof ABG_PROJECT_READ_CONTRACTS)[AbgProjectReadMemberKey];
type AnyReadCallable = ExactDefinitionCallable<
  AnyReadPacket,
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceReceipt
>;
type ExactReadCallable<TPacket extends AnyReadPacket> = ExactDefinitionCallable<
  TPacket,
  AbgProjectReadResourceAssertion,
  AbgProjectReadResourceReceipt
>;
type ExactReadBindings<K extends AbgProjectReadMemberKey> = {
  readonly [M in K]: ExactReadCallable<(typeof ABG_PROJECT_READ_CONTRACTS)[M]>;
};

/** Each read callable is constructed over its own packet and projects only
 * that packet's owner output; the shared body is typed over the packet set. */
function exactReadCallable<TPacket extends AnyReadPacket>(
  callable: AnyReadCallable,
): ExactReadCallable<TPacket> {
  return callable as unknown as ExactReadCallable<TPacket>;
}

type RunReadMemberKey = "run_status" | "run_result" | "run_replay" | "graph_call_result" | "graph_call_replay";

const RUN_READ_MEMBER_KEYS = Object.freeze([
  "run_status",
  "run_result",
  "run_replay",
  "graph_call_result",
  "graph_call_replay",
] as const);

const EVENT_RESOURCE_ASSERTION_SCHEMA = v.custom<
  ReopenedAbgEventResourceInput
>(
  (value) => validateReopenedAbgEventResourceInput(value),
  "reopened_or_held_abg_event_resource_input",
);

const EVENT_RESOURCE_RECEIPT_SCHEMA = v.custom<
  ReopenAbgEventResourceReceipt | AbgEventResourceCompletion
>(
  (value) => validateAbgEventResourceOutcome(value) &&
    (value.kind === "abg_event_resource_completion" ||
      (validateAbgEventResourceReceipt(value) && value.acquisitionKind === "reopen")),
  "reopened_abg_event_resource_receipt_or_held_completion",
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

const GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA = v.strictObject({
  kind: v.literal("abg_project_read_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: EVENT_RESOURCE_ASSERTION_SCHEMA,
  declarationProof: v.optional(ABG_HISTORICAL_DECLARATION_PROOF_SCHEMA),
}) as v.GenericSchema<AbgProjectReadResourceAssertion, AbgProjectReadResourceAssertion>;

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
    message: renderDiagnosticText(message),
    evidence: {},
  });
}

/** D3: a plain JSON record, or null; no cast. */
function asRecord(value: JsonValue | undefined): Readonly<Record<string, JsonValue>> | null {
  return isRecord(value) ? value : null;
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
  value: JsonValue | undefined,
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

function closeReadEventResource(
  resource: AcquiredAbgEventResource,
): ReopenAbgEventResourceReceipt {
  const receipt = closeAbgEventResource(resource, resource.entryPrefix);
  if (receipt.acquisitionKind !== "reopen") {
    throw new TypeError("project reads must close one reopened ABG resource");
  }
  return receipt as ReopenAbgEventResourceReceipt;
}

/** A run read completes at its unchanged entry prefix: a reopened resource
 * closes; a borrowed held one returns its completion and keeps its owner. */
function completeRunReadEventResource(
  resource: AcquiredAbgEventResource,
): ReopenAbgEventResourceReceipt | AbgEventResourceCompletion {
  const outcome = completeAbgEventResource(resource, resource.entryPrefix);
  if (outcome.kind === "abg_event_resource_completion") return outcome;
  if (outcome.acquisitionKind !== "reopen") {
    throw new TypeError("project reads must close one reopened ABG resource");
  }
  return outcome as ReopenAbgEventResourceReceipt;
}

function finishRunRead(
  resource: AcquiredAbgEventResource,
  ownerOutput: OwnerSemanticOutput<AnyReadPacket>,
): DefinitionReturn<AnyReadPacket, AbgProjectReadResourceReceipt> {
  return deepFreeze({
    ownerOutput,
    resources: {
      kind: "abg_project_read_resource_receipt" as const,
      schemaVersion: "5.0.0" as const,
      eventResource: completeRunReadEventResource(resource),
    },
  });
}

function refusalOutput(
  packet: AnyReadPacket,
  code:
    | "unknown_source"
    | "source_digest_mismatch"
    | "range_invalid"
    | "cursor_invalid"
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

function nativeLivenessFields(value: Readonly<Record<string, JsonValue>>): Readonly<Record<string, JsonValue>> {
  if (value.nativeLiveness === undefined) return {};
  if (!isRuntimeLivenessReadProjection(value.nativeLiveness)) throw new TypeError("read owner returned an invalid native liveness carrier");
  return { nativeLiveness: value.nativeLiveness };
}

function runStopFields(value: Readonly<Record<string, JsonValue>>): Readonly<Record<string, JsonValue>> {
  if (value.stop === undefined) return {};
  if (!v.is(ABG_RUN_STOP_READING_SCHEMA, value.stop)) throw new TypeError("read owner returned an invalid Run stop reading");
  return { stop: value.stop };
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
  const executionBasis = memberKey === "run_status"
    ? coordinateFrom(value.executionBasis, ["ref"], ["digest"]) : null;
  if (memberKey === "run_status" && executionBasis === null) {
    throw new TypeError("Run status lacks its admitted execution-basis identity");
  }
  const active = Array.isArray(value.holdsAt)
    ? value.holdsAt
    : Array.isArray(value.activeFluents)
    ? value.activeFluents
    : [];
  return {
    ...nativeLivenessFields(value),
    kind: memberKey === "run_status"
      ? "run_status_projection"
      : "graph_call_status_projection",
    subject: sourceCoordinate(request),
    ...(executionBasis === null ? {} : { executionBasis }),
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
      const admittedRow = admitJson(row);
      if (admittedRow.kind !== "ok") throw new TypeError("status projection fluent is not admitted JSON");
      const digest = sha256Canonical(admittedRow.value);
      return reference(fluentRef, digest);
    }),
    ...(memberKey === "run_status" ? runStopFields(value) : {}),
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
  const terminalResult = value.terminalResult;
  if (replay === null || terminalRoute === null || result === null ||
      !isAbgTypedTerminalResult(terminalResult) || !canonicalEquals(result, terminalResult.result) ||
      !canonicalEquals(terminalRoute, terminalResult.producer.terminalRoute)) {
    throw new TypeError("result projection lacks terminal owner coordinates");
  }
  return {
    kind: memberKey === "run_result"
      ? "run_result_projection"
      : "graph_call_result_projection",
    subject: sourceCoordinate(request),
    result,
    terminalResult: terminalResult,
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
    ["atomRef"],
    ["semanticPayloadDigest"],
  );
  const evidence = Array.isArray(value.evidenceRefs)
    ? (value.evidenceRefs as JsonValue[]).flatMap((row) => {
        if (typeof row !== "string") return [];
        const digest = sha256Canonical({ evidenceRef: row });
        return [reference(row, digest)];
      })
    : [];
  if (memberKey === "run_evidence" && Array.isArray(value.runtimeFailures)) {
    for (const failure of value.runtimeFailures) {
      evidence.push(reference(
        "data:application/json;charset=utf-8," + encodeURIComponent(canonicalJson(failure)),
        sha256Canonical(failure),
      ));
    }
  }
  return {
    ...nativeLivenessFields(value),
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
  replay = replayCoordinate(value),
): JsonValue {
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
    ...(memberKey === "run_replay" || memberKey === "graph_call_replay"
      ? { status: value.runtimeStatus!, terminalResult: value.terminalResult! } : {}),
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
    case "workspace_replay": {
      // This workspace collection has the existing read owner's exact
      // member/subject/prefix/value identity, rather than one Run's replay id.
      const digest = sha256Canonical({ memberKey: native.memberKey, targetRef: native.targetRef,
        prefixCoordinateDigest: native.prefixCoordinateDigest, value: native.value });
      if (native.memberKey !== memberKey || native.targetRef !== sourceCoordinate(request).ref ||
          value.workspaceRef !== native.targetRef || native.prefixCoordinateDigest !== basisCoordinate(request).digest ||
          native.projectionDigest !== digest || native.projectionRef !== `project-read://abiogenesis/${digest.slice(7)}`) {
        throw new TypeError("workspace replay differs from its exact owner projection identity");
      }
      return replayProjection(memberKey, request, value, reference(native.projectionRef, native.projectionDigest));
    }
    case "run_replay":
    case "graph_call_replay":
    case "interaction_replay":
    case "continuation_replay":
    case "c_call_replay":
      return replayProjection(memberKey, request, value);
  }
}

function nativeRefusalCode(
  result: AbgProjectReadRefusal,
): "projection_basis_mismatch" | "not_found" | "not_ready" {
  return result.code === "target_absent"
    ? "not_found"
    : result.code === "target_not_ready" ? "not_ready"
    : "projection_basis_mismatch";
}

export function projectAbgReadOutput(
  packet: AnyReadPacket,
  request: Readonly<Record<string, JsonValue>>,
  memberKey: AbgProjectReadMemberKey,
  native: AbgProjectReadResult,
): OwnerSemanticOutput<AnyReadPacket> {
  return projectReadOutput(packet, request, memberKey, native, false);
}

/**
 * The exact read output of one native projection. A Run read reaches the
 * common output gate through its exact-prefix binder and is not gated twice.
 * A legacy read is a direct output join (`directJoin`): no common gate follows
 * it, so its output is admitted as I-JSON before the recursive contract check.
 * Either way the original output returns.
 */
function projectReadOutput(
  packet: AnyReadPacket,
  request: Readonly<Record<string, JsonValue>>,
  memberKey: AbgProjectReadMemberKey,
  native: AbgProjectReadResult,
  directJoin: boolean,
): OwnerSemanticOutput<AnyReadPacket> {
  if (native.kind === "abg_project_read_projection" &&
      (memberKey === "run_replay" || memberKey === "graph_call_replay")) {
    const selector = asRecord(request.selector)!;
    const value = asRecord(native.value)!;
    const offset = selector.fromOrdinal as number, limit = selector.limit as number;
    if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 ||
        !Number.isSafeInteger(offset + limit)) return refusalOutput(packet, "range_invalid", "/selector");
    if (!Array.isArray(value.eventAtoms)) throw new TypeError("replay lacks the selected scope population");
    if (offset > value.eventAtoms.length) return refusalOutput(packet, "cursor_invalid", "/selector/fromOrdinal");
  }
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
  if ((directJoin && admitJson(output).kind !== "ok") ||
      admitRuntimeContract(schema, output.value).disposition !== "admitted") {
    throw new TypeError(`ABG ${memberKey} output differs from its exact owner contract`);
  }
  return output as unknown as OwnerSemanticOutput<AnyReadPacket>;
}

/** One authority/currentness relation shared by the Run reads and their two
 * typed GraphCall companions. Declaration evidence reaches the native owner. */
/** The exact run-read authority one admitted prefix environment determines:
 * the source binding, its ProductSet and lock, and the read grants over the
 * workspace authority basis. The run-read kernel compares supplied slots with
 * these values; installed construction populates them. */
export function expectedRunReadAuthority<TPacket extends AnyReadPacket>(
  packet: TPacket,
  environment: ExactPrefixWorkspaceEnvironment,
) {
  const grantBasis = {
    admittedInstalls: environment.productInstalls,
    workspaceBinding: environment.workspaceBinding,
    fixedPacket: packet,
  } as const;
  // The installs are the recorded installs of the source binding; the read
  // asks the recorded question of their graphs.
  const grants = packet.metadata.capabilityRefs.map(
    (capabilityRef) => constructCapabilityGrant(
      environment.workspaceAuthorityBasis,
      environment.workspaceBinding.authorizedActorRef,
      packet.definitionKey.operationId,
      capabilityRef,
      grantBasis,
      "recorded",
    ),
  );
  return Object.freeze({
    grantBasis,
    grants: Object.freeze(grants),
    slots: Object.freeze({
      workspace_binding: Object.freeze({
        ref: environment.workspaceBinding.bindingId,
        digest: environment.workspaceBinding.bindingDigest,
      }),
      product_set: Object.freeze(environment.productInstalls.map(productInstallCoordinate)),
      dependency_lock: Object.freeze({
        ref: environment.resolvedProductLock.lockId,
        digest: environment.resolvedProductLock.lockDigest,
      }),
      catalog_scope: null,
      execution_program: null,
      graph_function: null,
      input_contract: null,
      session_policy: null,
      capability_grants: Object.freeze({
        requiredCapabilityRefs: Object.freeze([...packet.metadata.capabilityRefs]),
        grants: Object.freeze(grants.map((grant) => Object.freeze({
          ref: grant.grantRef,
          digest: grant.grantDigest,
        }))),
      }),
      actor: null,
      transport_steering: null,
      verification_references: null,
      execution_basis: null,
    }),
  });
}

/** The run-read members the exact-prefix kernel serves. */
export const ABG_RUN_READ_MEMBER_KEYS = RUN_READ_MEMBER_KEYS;
export type AbgRunReadMemberKey = RunReadMemberKey;

/**
 * Populate one exact run-read request, authority slots and source coordinate
 * at the supplied durable prefix through the existing owners: authenticated
 * artifact truth, the source workspace environment, the read port's source
 * preparation and the shared expected read authority. Typed refusal keeps the
 * owner cause; construction admits nothing and appends nothing.
 */
export function populateRunReadAtDurablePrefix<K extends RunReadMemberKey>(input: Readonly<{
  memberKey: K;
  prefix: DurablePrefixCoordinate;
  workspaceBinding: Readonly<{ ref: string; digest: Sha256Digest }>;
  sourceRef: string;
  selector: JsonValue;
}>):
  | Readonly<{
      kind: "populated_run_read";
      memberKey: K;
      packet: (typeof ABG_PROJECT_READ_CONTRACTS)[K];
      request: Readonly<Record<string, JsonValue>>;
      slots: ReturnType<typeof expectedRunReadAuthority>["slots"];
      grants: ReturnType<typeof expectedRunReadAuthority>["grants"];
      source: Readonly<{ ref: string; digest: Sha256Digest }>;
    }>
  | Readonly<{
      kind: "run_read_population_refusal";
      code: "artifact_truth_invalid" | "projection_basis_mismatch" | "unknown_source";
      issuePath: string;
    }> {
  const packet = ABG_PROJECT_READ_CONTRACTS[input.memberKey];
  const refusal = (code: "artifact_truth_invalid" | "projection_basis_mismatch" | "unknown_source", issuePath: string) =>
    Object.freeze({ kind: "run_read_population_refusal" as const, code, issuePath });
  const artifactTruth = projectOwnedPrefixArtifactTruth(input.prefix);
  if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection") {
    return refusal("artifact_truth_invalid", "/projectionBasis");
  }
  // Recorded: the run read reads recorded history and admits nothing.
  const environment = projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth, input.workspaceBinding, "recorded");
  if (environment.kind !== "exact_prefix_workspace_environment") {
    return refusal("projection_basis_mismatch", "/invocationAuthority/slots/workspace_binding");
  }
  // Preparation reads the coordinate this owner just acquired, so it borrows
  // the artifact truth's owned prefix; the raw input would be captured and
  // decoded a second time at the same unchanged prefix.
  const truth = prepareRunReadAtDurablePrefix(environment.artifactTruth.prefix, input.memberKey, input.sourceRef,
    environment.artifactTruth);
  if (truth === null) return refusal("unknown_source", "/source/sourceRef");
  const expected = expectedRunReadAuthority(packet, environment);
  return Object.freeze({
    kind: "populated_run_read" as const,
    memberKey: input.memberKey,
    packet,
    request: Object.freeze({
      caseKey: input.memberKey,
      source: Object.freeze({
        // The member's own contract closes its source kind.
        sourceKind: packet.metadata.closedDomains.sourceKind![0]!,
        sourceRef: truth.source.ref,
        sourceDigest: truth.source.digest,
      }),
      projectionBasis: Object.freeze({
        projectionBasisRef: input.prefix.eventLogRef,
        projectionBasisDigest: input.prefix.coordinateDigest,
      }),
      selector: input.selector,
    }),
    slots: expected.slots,
    grants: expected.grants,
    source: Object.freeze({ ref: truth.source.ref, digest: truth.source.digest }),
  });
}

function runReadKernel<TPacket extends AnyReadPacket>(
  packet: TPacket,
): ExactReadCallable<TPacket> {
  return exactReadCallable<TPacket>((call) => Effect.try({
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
      // The read owns the bodies it selects until it returns.
      return withOperationBodies(resource.entryPrefix, () => { try {
        const request = call.invocation.request;
        const source = sourceCoordinate(request);
        const basis = basisCoordinate(request);
        const slots = call.invocation.invocationAuthority.slots;
        const workspaceBinding = slots.workspace_binding;
        if (
          workspaceBinding === null ||
          basis.ref !== resource.entryPrefix.eventLogRef ||
          basis.digest !== resource.entryPrefix.coordinateDigest
        ) {
          return finishRunRead(
            resource,
            refusalOutput(packet, "projection_basis_mismatch", "/projectionBasis"),
          );
        }
        // Recorded: the run read reads recorded history and admits nothing.
        const environment = projectExactPrefixWorkspaceEnvironment(
          resource.entryPrefix,
          workspaceBinding,
          "recorded",
        );
        if (environment.kind !== "exact_prefix_workspace_environment") {
          return finishRunRead(
            resource,
            refusalOutput(
              packet,
              "projection_basis_mismatch",
              "/invocationAuthority/slots/workspace_binding",
            ),
          );
        }
        const expected = expectedRunReadAuthority(packet, environment);
        const grantBasis = expected.grantBasis;
        const expectedGrants = expected.grants;
        // The loaded reader owns its current contract. Historical grants below
        // remain permission over the source binding, not the reader's Product.
        const executingContract = projectProductManifestOperationCoordinate(
          readExecutingToolchainIdentity().manifest,
          packet.definitionKey.operationId,
        );
        if (executingContract === null) throw new TypeError("executing read owner has invalid Product operation metadata");
        if (!canonicalEquals(executingContract.contractCatalog, call.invocation.contractCatalog) ||
            !canonicalEquals(executingContract.flatRow, call.invocation.requestContract.flatRow)) {
          return finishRunRead(
            resource,
            refusalOutput(packet, "projection_basis_mismatch", "/contractCatalog"),
          );
        }
        const expectedAuthority = expected.slots;
        if (
          slots.actor !== null ||
          !canonicalEquals(slots.workspace_binding, expectedAuthority.workspace_binding) ||
          !canonicalEquals(slots.product_set, expectedAuthority.product_set) ||
          !canonicalEquals(slots.dependency_lock, expectedAuthority.dependency_lock) ||
          !canonicalEquals(
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
              "recorded",
            )
          )
        ) {
          return finishRunRead(
            resource,
            refusalOutput(
              packet,
              "projection_basis_mismatch",
              "/invocationAuthority",
            ),
          );
        }
        const graphRead = packet.definitionKey.memberKey === "graph_call_result" || packet.definitionKey.memberKey === "graph_call_replay";
        // The environment above materialized the acquired prefix; the
        // preparation and the GraphCall projection read that one prefix.
        const truth = prepareRunReadAtDurablePrefix(
          resource.entryPrefix, packet.definitionKey.memberKey as RunReadMemberKey, source.ref,
          environment.artifactTruth,
        );
        if (truth === null) {
          return finishRunRead(
            resource,
            refusalOutput(packet, "unknown_source", "/source/sourceRef"),
          );
        }
        if (source.ref !== truth.source.ref || source.digest !== truth.source.digest) {
          return finishRunRead(
            resource,
            refusalOutput(packet, "source_digest_mismatch", "/source/sourceDigest"),
          );
        }
        if (
          truth.workspaceBinding.ref !== environment.workspaceBinding.bindingId ||
          truth.workspaceBinding.digest !==
            environment.workspaceBinding.bindingDigest
        ) {
          return finishRunRead(
            resource,
            refusalOutput(
              packet,
              "projection_basis_mismatch",
              "/invocationAuthority/slots/workspace_binding",
            ),
          );
        }
        const native = truth.project(graphRead ? call.resources.declarationProof : undefined);
        return finishRunRead(
          resource,
          projectAbgReadOutput(packet, request, packet.definitionKey.memberKey, native),
        );
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      } });
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
  }));
}

function binding<TPacket extends AnyReadPacket>(
  packet: TPacket,
  memberKey: AbgProjectReadMemberKey,
): ExactReadCallable<TPacket> {
  return exactReadCallable<TPacket>((call) => Effect.try({
    try: (): DefinitionReturn<AnyReadPacket, AbgProjectReadResourceReceipt> => {
      if (
        !hasExactKeys(call.resources, ["eventResource", "kind", "schemaVersion"]) ||
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
      // The read owns the bodies it selects until it returns.
      return withOperationBodies(resource.entryPrefix, () => { try {
        const request = call.invocation.request;
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
        const ownerOutput = projectReadOutput(packet, request, memberKey, native, true);
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
      } });
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
  }));
}

const legacyBindings = Object.fromEntries(
  Object.keys(ABG_PROJECT_READ_CONTRACTS).flatMap((memberKey) =>
    RUN_READ_MEMBER_KEYS.includes(memberKey as RunReadMemberKey) ||
      memberKey === "run_gaps" || memberKey === "workspace_gaps" ||
      memberKey === "run_lawful_actions"
      ? []
      : [[
          memberKey,
          binding(ABG_PROJECT_READ_CONTRACTS[memberKey as AbgProjectReadMemberKey], memberKey as AbgProjectReadMemberKey),
        ]]
  ),
) as ExactReadBindings<Exclude<AbgProjectReadMemberKey, RunReadMemberKey>>;

const RUN_READ_DEFINITION_BINDINGS = Object.freeze({
  run_status: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.run_status,
    runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_status),
    PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
    PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
  run_result: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.run_result,
    runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_result),
    PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
    PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
  run_replay: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.run_replay,
    runReadKernel(ABG_PROJECT_READ_CONTRACTS.run_replay),
    PROJECT_READ_RESOURCE_ASSERTION_SCHEMA,
    PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
  graph_call_result: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.graph_call_result,
    runReadKernel(ABG_PROJECT_READ_CONTRACTS.graph_call_result),
    GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
  graph_call_replay: bindExactPrefixRead(
    ABG_PROJECT_READ_CONTRACTS.graph_call_replay,
    runReadKernel(ABG_PROJECT_READ_CONTRACTS.graph_call_replay),
    GRAPH_CALL_TERMINAL_RESOURCE_ASSERTION_SCHEMA, PROJECT_READ_RESOURCE_RECEIPT_SCHEMA,
  ),
});

export const ABG_PROJECT_READ_DEFINITION_BINDINGS = Object.freeze({
  ...legacyBindings,
  ...RUN_READ_DEFINITION_BINDINGS,
});
import { isRuntimeLivenessReadProjection } from "./runtime_liveness_contracts.js";
