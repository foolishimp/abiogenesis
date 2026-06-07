// Implements: REQ-P-POLICY

import {
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { admitPublicStartRequest } from "../admission/public_start.js";
import { constructPublicCallableStartRequest } from "./constructors.js";
import type { PublicCallableStartRequest } from "./carriers.js";
import {
  resolveM04RequestDefaults,
  type AbgLeverOverridesBundle
} from "../../../shared/lever_registry/overrides.js";

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
  label = "PublicCallableStartRequest",
  requestDefaults: AbgLeverOverridesBundle | null = null
): PublicCallableStartRequest {
  const requestObject = parsePlainObject(input, label);
  assertNoAuthorityInjection(requestObject, label);
  const requestUntil = parseOptionalField(requestObject, "until");
  const requestFhMode = parseOptionalField(requestObject, "fh_mode");
  const resolvedDefaults = resolveM04RequestDefaults({
    requestUntil: typeof requestUntil === "string" ? requestUntil : undefined,
    requestFhMode: typeof requestFhMode === "string" ? requestFhMode : undefined,
    bundle: requestDefaults
  });
  const startRequestInput = {
    ...requestObject,
    until: resolvedDefaults.until,
    fh_mode: resolvedDefaults.fhMode,
    root_mode:
      parseOptionalField(requestObject, "root_mode") ??
      (resolvedDefaults.until === "converged" ? "supervised" : "direct")
  };
  return constructPublicCallableStartRequest(
    admitPublicStartRequest(startRequestInput, `${label}.start_request`)
  );
}
