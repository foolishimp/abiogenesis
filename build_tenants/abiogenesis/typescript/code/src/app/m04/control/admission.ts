// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import {
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { admitPublicStartRequest } from "../admission/public_start.js";
import { constructPublicControlLoopRequest } from "./constructors.js";
import type { PublicControlLoopRequest } from "./carriers.js";

function assertNoOutcomeInjection(
  input: ReturnType<typeof parsePlainObject>,
  label: string
): void {
  for (const forbiddenField of ["outcome", "prior_outcome", "public_start_outcome"]) {
    if (Object.hasOwn(input, forbiddenField)) {
      throw new TypeError(
        `${label}: ${forbiddenField} is not lawful control-loop authority`
      );
    }
  }
}

export function admitPublicControlLoopRequest(
  input: unknown,
  label = "PublicControlLoopRequest"
): PublicControlLoopRequest {
  const requestObject = parsePlainObject(input, label);
  assertNoOutcomeInjection(requestObject, label);
  const startRequestInput = parseOptionalField(requestObject, "start_request");
  if (startRequestInput === undefined) {
    throw new TypeError(`${label}.start_request: expected completed public-start request`);
  }
  const startRequest = admitPublicStartRequest(
    startRequestInput,
    `${label}.start_request`
  );
  return constructPublicControlLoopRequest(startRequest);
}
