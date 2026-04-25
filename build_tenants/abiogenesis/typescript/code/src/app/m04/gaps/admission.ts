// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-016
// Implements: REQ-P-POLICY-017

import {
  parseNonEmptyString,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import { constructPublicGapsRequest } from "./constructors.js";
import type { PublicGapsRequest } from "./carriers.js";

export function admitPublicGapsRequest(
  input: unknown,
  label = "PublicGapsRequest"
): PublicGapsRequest {
  const request = parsePlainObject(input, label);
  const scope = parsePlainObject(request["scope"], `${label}.scope`);
  const kind = parseNonEmptyString(scope["kind"], `${label}.scope.kind`);
  if (kind !== "workspace") {
    throw new TypeError(
      `${label}.scope.kind: expected "workspace", got ${JSON.stringify(kind)}`
    );
  }
  return constructPublicGapsRequest(
    Object.freeze({
      kind: "workspace",
      workspaceRoot: parseNonEmptyString(
        scope["workspaceRoot"],
        `${label}.scope.workspaceRoot`
      ),
      moduleName: parseNonEmptyString(
        scope["moduleName"],
        `${label}.scope.moduleName`
      )
    })
  );
}
