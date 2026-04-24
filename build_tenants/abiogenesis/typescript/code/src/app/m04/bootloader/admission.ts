// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  parseNonEmptyString,
  parsePlainObject,
  parseUnknownArray
} from "../../../shared/validation/primitives.js";
import {
  constructBootloaderDocumentContract,
  constructBootloaderMarkers,
  constructBootloaderTargetRoot,
  constructInstructionTargetRef,
  constructPublicBootloaderRequest
} from "./constructors.js";
import type { PublicBootloaderRequest } from "./carriers.js";

function admitBootloaderTargetRoot(input: unknown, label: string) {
  const root = parsePlainObject(input, label);
  const rootPath = parseNonEmptyString(root["rootPath"], `${label}.rootPath`);
  if (!rootPath.startsWith("/")) {
    throw new TypeError(`${label}.rootPath: expected an absolute path`);
  }
  return constructBootloaderTargetRoot(rootPath);
}

function admitBootloaderMarkers(input: unknown, label: string) {
  const markers = parsePlainObject(input, label);
  const startMarker = parseNonEmptyString(
    markers["startMarker"],
    `${label}.startMarker`
  );
  const endMarker = parseNonEmptyString(markers["endMarker"], `${label}.endMarker`);
  if (startMarker === endMarker) {
    throw new TypeError(`${label}: startMarker and endMarker must differ`);
  }
  return constructBootloaderMarkers({
    startMarker,
    endMarker
  });
}

function admitBootloaderDocumentContract(input: unknown, label: string) {
  const contract = parsePlainObject(input, label);
  return constructBootloaderDocumentContract({
    relativePath: parseNonEmptyString(
      contract["relativePath"],
      `${label}.relativePath`
    ),
    content: parseNonEmptyString(contract["content"], `${label}.content`),
    markers: admitBootloaderMarkers(contract["markers"], `${label}.markers`)
  });
}

function admitInstructionTargets(input: unknown, label: string) {
  const entries = parseUnknownArray(input, label);
  if (entries.length === 0) {
    throw new TypeError(`${label}: expected at least one instruction target`);
  }
  return Object.freeze(
    entries.map((entry, index) => {
      const target = parsePlainObject(entry, `${label}[${index}]`);
      return constructInstructionTargetRef({
        relativePath: parseNonEmptyString(
          target["relativePath"],
          `${label}[${index}].relativePath`
        )
      });
    })
  );
}

export function admitPublicBootloaderRequest(
  input: unknown,
  label = "publicBootloaderRequest"
): PublicBootloaderRequest {
  const request = parsePlainObject(input, label);
  return constructPublicBootloaderRequest({
    targetRoot: admitBootloaderTargetRoot(
      request["targetRoot"],
      `${label}.targetRoot`
    ),
    bootloaderDocument: admitBootloaderDocumentContract(
      request["bootloaderDocument"],
      `${label}.bootloaderDocument`
    ),
    instructionTargets: admitInstructionTargets(
      request["instructionTargets"],
      `${label}.instructionTargets`
    )
  });
}
