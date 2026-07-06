// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import { PUBLIC_TERMINAL_KIND_VALUES, type PublicTerminalKind } from "../../../abg/m03/contracts/carriers.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import { admitPublicStartRequest } from "../admission/public_start.js";
import { admitPublicControlLoopRequest } from "../control/admission.js";
import { admitPublicResultAssessmentRequest } from "../result_assessment/admission.js";
import {
  constructPublicLiveStatusRequest
} from "./constructors.js";
import type {
  PublicLiveStatusRequest
} from "./carriers.js";
import type {
  PublicRuntimeIdentityProjection,
  PublicKernelTraceRef,
  PublicStopDetail,
  PublicStartOutcome,
  PublicStartRejected,
  PublicStartConverged,
  PublicStartAdvanced,
  PublicStartBlocked,
  PublicStartYielded
} from "../contracts/carriers.js";
import type {
  PublicControlLoopTraceRef,
  PublicControlLoopStopDetail,
  HumanProxyApprovalHint,
  PublicControlLoopOutcome
} from "../control/carriers.js";
import type {
  AssessmentTraceRef,
  PublicResultAssessmentOutcome
} from "../result_assessment/carriers.js";
import type {
  TerminalKind
} from "../../../abg/m03/index.js";
import {
  parseRuntimeEventKind,
  parseRuntimeFailureClass,
  parseTerminalKind
} from "../../../abg/m03/index.js";

const START_OUTCOME_KINDS = Object.freeze([
  "advanced",
  "blocked",
  "yielded",
  "converged",
  "rejected"
] as const);

function parseNullableString(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseNullableTerminalKind(
  input: unknown,
  label: string
): TerminalKind | null {
  const terminalKind = parseNullableString(input, label);
  if (terminalKind === null) {
    return null;
  }
  return parseTerminalKind(terminalKind, label);
}

function parseNullableDerived<T>(
  input: unknown,
  label: string,
  admit: (value: unknown, innerLabel: string) => T
): T | null {
  if (input === undefined || input === null) {
    return null;
  }
  return admit(input, label);
}

function parseOneOf<T extends string>(
  input: unknown,
  label: string,
  allowed: readonly T[]
): T {
  const value = parseNonEmptyString(input, label);
  for (const option of allowed) {
    if (value === option) {
      return option;
    }
  }
  throw new TypeError(
    `${label}: expected one of ${allowed.map((entry) => JSON.stringify(entry)).join(", ")}`
  );
}

function parseOneOfArray<T extends string>(
  input: unknown,
  label: string,
  allowed: readonly T[]
): readonly T[] {
  return Object.freeze(
    parseStringArray(input, label).map((entry, index) =>
      parseOneOf(entry, `${label}[${index}]`, allowed)
    )
  );
}

function parseRuntimeEventKindArray(
  input: unknown,
  label: string
): readonly ReturnType<typeof parseRuntimeEventKind>[] {
  return Object.freeze(
    parseStringArray(input, label).map((entry, index) =>
      parseRuntimeEventKind(entry, `${label}[${index}]`)
    )
  );
}

function admitRuntimeIdentityProjection(
  input: unknown,
  label: string
): PublicRuntimeIdentityProjection {
  const runtimeIdentity = parsePlainObject(input, label);
  return Object.freeze({
    workerId: parseNonEmptyString(runtimeIdentity["workerId"], `${label}.workerId`),
    backendId: parseNonEmptyString(
      runtimeIdentity["backendId"],
      `${label}.backendId`
    ),
    buildId: parseNonEmptyString(runtimeIdentity["buildId"], `${label}.buildId`),
    resolvedRuntimeRef: parseNonEmptyString(
      runtimeIdentity["resolvedRuntimeRef"],
      `${label}.resolvedRuntimeRef`
    )
  });
}

function admitStartTrace(input: unknown, label: string) {
  const trace = parsePlainObject(input, label);
  return Object.freeze({
    basisId: parseNonEmptyString(trace["basisId"], `${label}.basisId`),
    runId: parseNullableString(trace["runId"], `${label}.runId`),
    workKey: parseNullableString(trace["workKey"], `${label}.workKey`),
    frameId: parseNullableString(trace["frameId"], `${label}.frameId`),
    frameLineageId: parseNullableString(
      trace["frameLineageId"],
      `${label}.frameLineageId`
    ),
    eventKinds: parseRuntimeEventKindArray(
      trace["eventKinds"],
      `${label}.eventKinds`
    )
  }) satisfies PublicKernelTraceRef;
}

function admitStartStopDetail(input: unknown, label: string) {
  const detail = parsePlainObject(input, label);
  const admittedTerminalKind = parseNullableTerminalKind(
    parseOptionalField(detail, "terminalKind"),
    `${label}.terminalKind`
  );
  return Object.freeze({
    terminalKind: admittedTerminalKind,
    gateReason: parseNullableString(
      parseOptionalField(detail, "gateReason"),
      `${label}.gateReason`
    ),
    dispatchRef: parseNullableString(
      parseOptionalField(detail, "dispatchRef"),
      `${label}.dispatchRef`
    ),
    approvalSubjectRef: parseNullableString(
      parseOptionalField(detail, "approvalSubjectRef"),
      `${label}.approvalSubjectRef`
    )
  }) satisfies PublicStopDetail;
}

function admitPublicStartOutcome(
  input: unknown,
  label: string
): PublicStartOutcome {
  const outcome = parsePlainObject(input, label);
  const kind = parseNonEmptyString(outcome["kind"], `${label}.kind`);

  switch (kind) {
    case "advanced":
      return Object.freeze({
        kind,
        runtimeIdentity: admitRuntimeIdentityProjection(
          outcome["runtimeIdentity"],
          `${label}.runtimeIdentity`
        ),
        trace: admitStartTrace(outcome["trace"], `${label}.trace`)
      }) satisfies PublicStartAdvanced;
    case "blocked": {
      const stopPredicate = parseNonEmptyString(
        outcome["stopPredicate"],
        `${label}.stopPredicate`
      );
      if (
        stopPredicate !== "dispatch_required" &&
        stopPredicate !== "human_gate_required" &&
        stopPredicate !== "gap_stop"
      ) {
        throw new TypeError(`${label}.stopPredicate: unsupported stop predicate`);
      }
      return Object.freeze({
        kind,
        stopPredicate,
        runtimeIdentity: admitRuntimeIdentityProjection(
          outcome["runtimeIdentity"],
          `${label}.runtimeIdentity`
        ),
        trace: admitStartTrace(outcome["trace"], `${label}.trace`),
        stopDetail: admitStartStopDetail(
          outcome["stopDetail"],
          `${label}.stopDetail`
        )
      }) satisfies PublicStartBlocked;
    }
    case "yielded":
      return Object.freeze({
        kind,
        runtimeIdentity: admitRuntimeIdentityProjection(
          outcome["runtimeIdentity"],
          `${label}.runtimeIdentity`
        ),
        trace: admitStartTrace(outcome["trace"], `${label}.trace`),
        stopDetail: admitStartStopDetail(
          outcome["stopDetail"],
          `${label}.stopDetail`
        )
      }) satisfies PublicStartYielded;
    case "converged": {
      const terminalKind = parseNonEmptyString(
        outcome["terminalKind"],
        `${label}.terminalKind`
      );
      if (!(PUBLIC_TERMINAL_KIND_VALUES as readonly string[]).includes(terminalKind)) {
        throw new TypeError(`${label}.terminalKind: unsupported converged value`);
      }
      return Object.freeze({
        kind,
        terminalKind: terminalKind as PublicTerminalKind,
        runtimeIdentity: admitRuntimeIdentityProjection(
          outcome["runtimeIdentity"],
          `${label}.runtimeIdentity`
        ),
        trace: admitStartTrace(outcome["trace"], `${label}.trace`)
      }) satisfies PublicStartConverged;
    }
    case "rejected":
      return Object.freeze({
        kind,
        reason: parseNonEmptyString(outcome["reason"], `${label}.reason`),
        runtimeIdentity: parseNullableDerived(
          parseOptionalField(outcome, "runtimeIdentity"),
          `${label}.runtimeIdentity`,
          admitRuntimeIdentityProjection
        )
      }) satisfies PublicStartRejected;
    default:
      throw new TypeError(`${label}.kind: unsupported value ${JSON.stringify(kind)}`);
  }
}

function admitControlTrace(input: unknown, label: string) {
  const trace = parsePlainObject(input, label);
  return Object.freeze({
    stepKinds: parseOneOfArray(
      trace["stepKinds"],
      `${label}.stepKinds`,
      START_OUTCOME_KINDS
    ),
    basisIds: parseStringArray(trace["basisIds"], `${label}.basisIds`),
    eventKinds: parseStringArray(trace["eventKinds"], `${label}.eventKinds`)
  }) satisfies PublicControlLoopTraceRef;
}

function admitControlStopDetail(input: unknown, label: string) {
  const detail = parsePlainObject(input, label);
  const kind = parseNonEmptyString(detail["kind"], `${label}.kind`);
  if (
    kind !== "yielded" &&
    kind !== "dispatch_required" &&
    kind !== "human_gate_required" &&
    kind !== "gap_stop" &&
    kind !== "advanced_reentry_required"
  ) {
    throw new TypeError(`${label}.kind: unsupported value ${JSON.stringify(kind)}`);
  }
  const terminalKind = parseNullableTerminalKind(
    parseOptionalField(detail, "terminalKind"),
    `${label}.terminalKind`
  );
  return Object.freeze({
    kind,
    terminalKind,
    gateReason: parseNullableString(
      parseOptionalField(detail, "gateReason"),
      `${label}.gateReason`
    ),
    dispatchRef: parseNullableString(
      parseOptionalField(detail, "dispatchRef"),
      `${label}.dispatchRef`
    ),
    approvalSubjectRef: parseNullableString(
      parseOptionalField(detail, "approvalSubjectRef"),
      `${label}.approvalSubjectRef`
    )
  }) satisfies PublicControlLoopStopDetail;
}

function admitPublicControlLoopOutcome(
  input: unknown,
  label: string
): PublicControlLoopOutcome {
  const outcome = parsePlainObject(input, label);
  const kind = parseNonEmptyString(outcome["kind"], `${label}.kind`);
  const runtimeIdentity = parseNullableDerived(
    parseOptionalField(outcome, "runtimeIdentity"),
    `${label}.runtimeIdentity`,
    admitRuntimeIdentityProjection
  );
  const trace = admitControlTrace(outcome["trace"], `${label}.trace`);

  switch (kind) {
    case "converged": {
      const terminalKind = parseNonEmptyString(
        outcome["terminalKind"],
        `${label}.terminalKind`
      );
      if (runtimeIdentity === null) {
        throw new TypeError(`${label}.runtimeIdentity: required`);
      }
      if (terminalKind !== "converged" && terminalKind !== "nothing_to_do") {
        throw new TypeError(`${label}.terminalKind: unsupported converged value`);
      }
      return Object.freeze({
        kind,
        terminalKind,
        runtimeIdentity,
        trace
      });
    }
    case "yielded":
      if (runtimeIdentity === null) {
        throw new TypeError(`${label}.runtimeIdentity: required`);
      }
      return Object.freeze({
        kind: "yielded",
        runtimeIdentity,
        trace,
        stopDetail: admitControlStopDetail(
          outcome["stopDetail"],
          `${label}.stopDetail`
        )
      });
    case "dispatch_required":
      if (runtimeIdentity === null) {
        throw new TypeError(`${label}.runtimeIdentity: required`);
      }
      return Object.freeze({
        kind: "dispatch_required",
        runtimeIdentity,
        trace,
        stopDetail: admitControlStopDetail(
          outcome["stopDetail"],
          `${label}.stopDetail`
        )
      });
    case "human_gate_required": {
      if (runtimeIdentity === null) {
        throw new TypeError(`${label}.runtimeIdentity: required`);
      }
      const approvalHint = parseNullableDerived(
        parseOptionalField(outcome, "approvalHint"),
        `${label}.approvalHint`,
        (value, innerLabel) => {
          const hint = parsePlainObject(value, innerLabel);
          const actor = parseNonEmptyString(
            hint["actor"],
            `${innerLabel}.actor`
          );
          if (actor !== "human-proxy") {
            throw new TypeError(`${innerLabel}.actor: expected "human-proxy"`);
          }
          return Object.freeze({
            actor,
            approvalSubjectRef: parseNonEmptyString(
              hint["approvalSubjectRef"],
              `${innerLabel}.approvalSubjectRef`
            )
          }) satisfies HumanProxyApprovalHint;
        }
      );
      return Object.freeze({
        kind: "human_gate_required",
        runtimeIdentity,
        trace,
        stopDetail: admitControlStopDetail(
          outcome["stopDetail"],
          `${label}.stopDetail`
        ),
        approvalHint
      });
    }
    case "blocked":
      if (runtimeIdentity === null) {
        throw new TypeError(`${label}.runtimeIdentity: required`);
      }
      return Object.freeze({
        kind: "blocked",
        runtimeIdentity,
        trace,
        stopDetail: admitControlStopDetail(
          outcome["stopDetail"],
          `${label}.stopDetail`
        )
      });
    case "rejected":
      return Object.freeze({
        kind,
        reason: parseNonEmptyString(outcome["reason"], `${label}.reason`),
        runtimeIdentity,
        trace,
        stopDetail: parseNullableDerived(
          parseOptionalField(outcome, "stopDetail"),
          `${label}.stopDetail`,
          admitControlStopDetail
        )
      });
    default:
      throw new TypeError(`${label}.kind: unsupported value ${JSON.stringify(kind)}`);
  }
}

function admitResultAssessmentTrace(input: unknown, label: string) {
  const trace = parsePlainObject(input, label);
  return Object.freeze({
    workflowVersion: parseNonEmptyString(
      trace["workflowVersion"],
      `${label}.workflowVersion`
    ),
    runId: parseNullableString(trace["runId"], `${label}.runId`),
    workKey: parseNullableString(trace["workKey"], `${label}.workKey`),
    emittedKinds: parseRuntimeEventKindArray(
      trace["emittedKinds"],
      `${label}.emittedKinds`
    )
  }) satisfies AssessmentTraceRef;
}

function admitPublicResultAssessmentOutcome(
  input: unknown,
  label: string
): PublicResultAssessmentOutcome {
  const outcome = parsePlainObject(input, label);
  const kind = parseNonEmptyString(outcome["kind"], `${label}.kind`);

  switch (kind) {
    case "accepted":
      return Object.freeze({
        kind,
        assessedCount:
          typeof outcome["assessedCount"] === "number"
            ? outcome["assessedCount"]
            : (() => {
                throw new TypeError(`${label}.assessedCount: required`);
              })(),
        trace: admitResultAssessmentTrace(outcome["trace"], `${label}.trace`)
      });
    case "rejected": {
      const ingestKind = parseNonEmptyString(
        outcome["ingestKind"],
        `${label}.ingestKind`
      );
      if (ingestKind !== "rejected" && ingestKind !== "runtime_failure") {
        throw new TypeError(`${label}.ingestKind: unsupported value`);
      }
      const failureClass =
        ingestKind === "runtime_failure"
          ? parseRuntimeFailureClass(
              outcome["failureClass"],
              `${label}.failureClass`
            )
          : null;
      return Object.freeze({
        kind,
        ingestKind,
        failureClass,
        reason: parseNonEmptyString(outcome["reason"], `${label}.reason`),
        trace: parseNullableDerived(
          parseOptionalField(outcome, "trace"),
          `${label}.trace`,
          admitResultAssessmentTrace
        )
      });
    }
    default:
      throw new TypeError(`${label}.kind: unsupported value ${JSON.stringify(kind)}`);
  }
}

export function admitPublicLiveStatusRequest(
  input: unknown,
  label = "PublicLiveStatusRequest"
): PublicLiveStatusRequest {
  const request = parsePlainObject(input, label);
  const startRequest = parseNullableDerived(
    parseOptionalField(request, "start_request"),
    `${label}.start_request`,
    admitPublicStartRequest
  );
  const startOutcome = parseNullableDerived(
    parseOptionalField(request, "start_outcome"),
    `${label}.start_outcome`,
    admitPublicStartOutcome
  );
  const controlRequest = parseNullableDerived(
    parseOptionalField(request, "control_request"),
    `${label}.control_request`,
    admitPublicControlLoopRequest
  );
  const controlOutcome = parseNullableDerived(
    parseOptionalField(request, "control_outcome"),
    `${label}.control_outcome`,
    admitPublicControlLoopOutcome
  );
  const resultAssessmentRequest = parseNullableDerived(
    parseOptionalField(request, "result_assessment_request"),
    `${label}.result_assessment_request`,
    admitPublicResultAssessmentRequest
  );
  const resultAssessmentOutcome = parseNullableDerived(
    parseOptionalField(request, "result_assessment_outcome"),
    `${label}.result_assessment_outcome`,
    admitPublicResultAssessmentOutcome
  );

  if (startOutcome !== null && startRequest === null) {
    throw new TypeError(`${label}.start_request: required when start_outcome is present`);
  }
  if (controlOutcome !== null && controlRequest === null) {
    throw new TypeError(
      `${label}.control_request: required when control_outcome is present`
    );
  }
  if (resultAssessmentOutcome !== null && resultAssessmentRequest === null) {
    throw new TypeError(
      `${label}.result_assessment_request: required when result_assessment_outcome is present`
    );
  }

  return constructPublicLiveStatusRequest({
    startRequest,
    startOutcome,
    controlRequest,
    controlOutcome,
    resultAssessmentRequest,
    resultAssessmentOutcome
  });
}
