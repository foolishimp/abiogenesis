// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import { admitStartIntent } from "../../../abg/m03/admission/index.js";
import type { StartIntent } from "../../../abg/m03/contracts/carriers.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject
} from "../../../shared/validation/primitives.js";
import {
  parseFhMode,
  parseRootMode
} from "../../../shared/validation/governed_enums.js";
import {
  constructConfiguredRuntimeSelector,
  constructPublicControlModes,
  constructPublicStartRequest
} from "../contracts/constructors.js";
import type {
  ConfiguredRuntimeSelector,
  PublicControlModes,
  PublicStartRequest
} from "../contracts/carriers.js";

function admitPublicControlModes(
  input: unknown,
  until: StartIntent["until"],
  label: string
): PublicControlModes {
  const requestObject = parsePlainObject(input, label);
  const fhModeInput = parseOptionalField(requestObject, "fh_mode");
  const rootModeInput = parseOptionalField(requestObject, "root_mode");
  const fhMode =
    fhModeInput === undefined
      ? "direct"
      : parseFhMode(fhModeInput, `${label}.fh_mode`);
  const rootMode =
    rootModeInput === undefined
      ? "direct"
      : parseRootMode(rootModeInput, `${label}.root_mode`);

  if (until !== "converged" && fhMode !== "direct") {
    throw new TypeError(
      `${label}.fh_mode: non-default fh_mode is lawful only when until = "converged"`
    );
  }
  if (until !== "converged" && rootMode !== "direct") {
    throw new TypeError(
      `${label}.root_mode: non-default root_mode is lawful only when until = "converged"`
    );
  }

  return constructPublicControlModes(fhMode, rootMode);
}

export function admitConfiguredRuntimeSelector(
  input: unknown,
  label = "ConfiguredRuntimeSelector"
): ConfiguredRuntimeSelector {
  const selectorObject = parsePlainObject(input, label);
  const workerRefInput = parseOptionalField(selectorObject, "worker_ref");
  const runtimeRefInput = parseOptionalField(selectorObject, "runtime_ref");
  const workerRef =
    workerRefInput === undefined || workerRefInput === null
      ? null
      : parseNonEmptyString(workerRefInput, `${label}.worker_ref`);
  const runtimeRef =
    runtimeRefInput === undefined || runtimeRefInput === null
      ? null
      : parseNonEmptyString(runtimeRefInput, `${label}.runtime_ref`);

  if (workerRef === null && runtimeRef === null) {
    throw new TypeError(
      `${label}: expected worker_ref or runtime_ref when runtime selector is supplied`
    );
  }

  return constructConfiguredRuntimeSelector(workerRef, runtimeRef);
}

export function admitPublicStartRequest(
  input: unknown,
  label = "PublicStartRequest"
): PublicStartRequest {
  const requestObject = parsePlainObject(input, label);
  const startIntentInput: Record<string, unknown> = {
    scope: requestObject["scope"],
    target: requestObject["target"],
    until: requestObject["until"]
  };
  for (const field of [
    "inputBindings",
    "input_bindings",
    "requestedOutputs",
    "requested_outputs"
  ]) {
    if (Object.hasOwn(requestObject, field)) {
      startIntentInput[field] = requestObject[field];
    }
  }
  const startIntent = admitStartIntent(
    startIntentInput,
    `${label}.startIntent`
  );
  const controlModes = admitPublicControlModes(
    requestObject,
    startIntent.until,
    label
  );
  const runtimeSelectorInput = parseOptionalField(requestObject, "runtime_selector");
  const runtimeSelector =
    runtimeSelectorInput === undefined
      ? null
      : admitConfiguredRuntimeSelector(
          runtimeSelectorInput,
          `${label}.runtime_selector`
        );

  return constructPublicStartRequest({
    startIntent,
    controlModes,
    runtimeSelector
  });
}
