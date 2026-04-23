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
  constructConfiguredRuntimeSelector,
  constructPublicControlModes,
  constructPublicStartRequest
} from "../contracts/constructors.js";
import type {
  ConfiguredRuntimeSelector,
  FhMode,
  PublicControlModes,
  PublicStartRequest,
  RootMode
} from "../contracts/carriers.js";

function parseFhMode(input: unknown, label: string): FhMode {
  const mode = parseNonEmptyString(input, label);
  if (mode === "direct" || mode === "human-proxy") {
    return mode;
  }
  throw new TypeError(
    `${label}: expected "direct" or "human-proxy", got ${JSON.stringify(mode)}`
  );
}

function parseRootMode(input: unknown, label: string): RootMode {
  const mode = parseNonEmptyString(input, label);
  if (mode === "direct" || mode === "supervised") {
    return mode;
  }
  throw new TypeError(
    `${label}: expected "direct" or "supervised", got ${JSON.stringify(mode)}`
  );
}

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
  const startIntent = admitStartIntent(
    {
      scope: requestObject["scope"],
      target: requestObject["target"],
      until: requestObject["until"]
    },
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
