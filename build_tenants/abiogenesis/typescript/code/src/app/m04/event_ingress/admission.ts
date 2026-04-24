// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import {
  constructApprovedCommandPayload,
  constructApprovedEventIngressRequest,
  constructEventCommandProvenance,
  constructResetCommandPayload,
  constructResetEventIngressRequest,
  constructRevokedCommandPayload,
  constructRevokedEventIngressRequest
} from "./constructors.js";
import type {
  ApprovedCommandPayload,
  PublicEventIngressRequest,
  ResetCommandPayload,
  RevokedCommandPayload
} from "./carriers.js";

function parseCommandKind(
  input: unknown,
  label: string
): PublicEventIngressRequest["kind"] {
  const kind = parseNonEmptyString(input, label);
  if (kind === "approved" || kind === "revoked" || kind === "reset") {
    return kind;
  }
  throw new TypeError(
    `${label}: expected "approved", "revoked", or "reset", got ${JSON.stringify(kind)}`
  );
}

function parseApprovalKind(
  input: unknown,
  label: string
): ApprovedCommandPayload["approvalKind"] {
  const approvalKind = parseNonEmptyString(input, label);
  if (approvalKind === "fh_review" || approvalKind === "fh_intent") {
    return approvalKind;
  }
  throw new TypeError(
    `${label}: expected "fh_review" or "fh_intent", got ${JSON.stringify(approvalKind)}`
  );
}

function parseRevocationKind(
  input: unknown,
  label: string
): RevokedCommandPayload["approvalKind"] {
  const approvalKind = parseNonEmptyString(input, label);
  if (approvalKind === "fh_approval") {
    return approvalKind;
  }
  throw new TypeError(
    `${label}: expected "fh_approval", got ${JSON.stringify(approvalKind)}`
  );
}

function parseApprovalActor(
  input: unknown,
  label: string
): ApprovedCommandPayload["actor"] {
  const actor = parseNonEmptyString(input, label);
  if (actor === "human" || actor === "human-proxy") {
    return actor;
  }
  throw new TypeError(
    `${label}: expected "human" or "human-proxy", got ${JSON.stringify(actor)}`
  );
}

function parseResetScope(
  input: unknown,
  label: string
): ResetCommandPayload["scope"] {
  const scope = parseNonEmptyString(input, label);
  if (scope === "workspace" || scope === "work_key" || scope === "edge") {
    return scope;
  }
  throw new TypeError(
    `${label}: expected "workspace", "work_key", or "edge", got ${JSON.stringify(scope)}`
  );
}

function parseNullableString(input: unknown, label: string): string | null {
  if (input === null || input === undefined) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function admitEventCommandProvenance(
  requestObject: Record<string, unknown>,
  label: string
) {
  return constructEventCommandProvenance(
    parseNonEmptyString(requestObject["workflow_version"], `${label}.workflow_version`),
    parseNullableString(parseOptionalField(requestObject, "run_id"), `${label}.run_id`),
    parseNullableString(parseOptionalField(requestObject, "work_key"), `${label}.work_key`)
  );
}

export function admitPublicEventIngressRequest(
  input: unknown,
  label = "PublicEventIngressRequest"
): PublicEventIngressRequest {
  const requestObject = parsePlainObject(input, label);
  const kind = parseCommandKind(requestObject["kind"], `${label}.kind`);
  const provenance = admitEventCommandProvenance(requestObject, label);

  switch (kind) {
    case "approved":
      return constructApprovedEventIngressRequest({
        payload: constructApprovedCommandPayload(
          parseApprovalKind(
            requestObject["approval_kind"],
            `${label}.approval_kind`
          ),
          parseNonEmptyString(requestObject["edge"], `${label}.edge`),
          parseApprovalActor(requestObject["actor"], `${label}.actor`)
        ),
        provenance
      });
    case "revoked":
      return constructRevokedEventIngressRequest({
        payload: constructRevokedCommandPayload(
          parseRevocationKind(
            requestObject["approval_kind"],
            `${label}.approval_kind`
          ),
          parseNonEmptyString(requestObject["edge"], `${label}.edge`),
          parseNonEmptyString(requestObject["actor"], `${label}.actor`),
          parseNonEmptyString(requestObject["reason"], `${label}.reason`)
        ),
        provenance
      });
    case "reset": {
      const scope = parseResetScope(requestObject["scope"], `${label}.scope`);
      const workKey = parseNullableString(
        parseOptionalField(requestObject, "work_key"),
        `${label}.work_key`
      );
      const edge = parseNullableString(
        parseOptionalField(requestObject, "edge"),
        `${label}.edge`
      );
      if ((scope === "work_key" || scope === "edge") && workKey === null) {
        throw new TypeError(
          `${label}.work_key: scope ${JSON.stringify(scope)} requires work_key`
        );
      }
      if (scope === "edge" && edge === null) {
        throw new TypeError(`${label}.edge: scope "edge" requires edge`);
      }
      return constructResetEventIngressRequest({
        payload: constructResetCommandPayload(
          scope,
          parseNonEmptyString(requestObject["actor"], `${label}.actor`),
          parseNonEmptyString(requestObject["reason"], `${label}.reason`),
          workKey,
          edge
        ),
        provenance
      });
    }
    default: {
      const exhaustive: never = kind;
      throw new TypeError(
        `${label}.kind: unsupported value ${JSON.stringify(exhaustive)}`
      );
    }
  }
}
