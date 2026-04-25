// Implements: REQ-P-POLICY

import {
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { admitPublicStartRequest } from "../admission/public_start.js";
import { constructPublicCallableStartRequest } from "./constructors.js";
import type { PublicCallableStartRequest } from "./carriers.js";

function assertNoAuthorityInjection(
  input: ReturnType<typeof parsePlainObject>,
  label: string
): void {
  for (const forbiddenField of [
    "start_request",
    "control_request",
    "control_outcome",
    "public_start_outcome",
    "live_status",
    "stop_class",
    "outcome"
  ]) {
    if (Object.hasOwn(input, forbiddenField)) {
      throw new TypeError(
        `${label}: ${forbiddenField} is not lawful callable-start authority`
      );
    }
  }
}

export function admitPublicCallableStartRequest(
  input: unknown,
  label = "PublicCallableStartRequest"
): PublicCallableStartRequest {
  const requestObject = parsePlainObject(input, label);
  assertNoAuthorityInjection(requestObject, label);
  const until = parseOptionalField(requestObject, "until") ?? "converged";
  const startRequestInput = {
    ...requestObject,
    until,
    fh_mode: parseOptionalField(requestObject, "fh_mode") ?? "direct",
    root_mode:
      parseOptionalField(requestObject, "root_mode") ??
      (until === "converged" ? "supervised" : "direct")
  };
  return constructPublicCallableStartRequest(
    admitPublicStartRequest(startRequestInput, `${label}.start_request`)
  );
}
