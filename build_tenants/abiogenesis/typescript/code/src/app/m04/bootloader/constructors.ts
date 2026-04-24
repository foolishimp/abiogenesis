import {
  constructDeliveryPlan
} from "../../../shared/abg_delivery_library/index.js";
import type { DeliveryPlan } from "../../../shared/abg_delivery_library/index.js";
import type {
  BootloaderDocumentContract,
  BootloaderInstructionVerification,
  BootloaderMarkers,
  BootloaderTargetRoot,
  BootloaderVerification,
  InstructionTargetRef,
  PublicBootloaderInstalled,
  PublicBootloaderOutcome,
  PublicBootloaderRejected,
  PublicBootloaderRequest
} from "./carriers.js";

function freezeStringArray<T>(values: readonly T[]): readonly T[] {
  return Object.freeze([...values]);
}

export function constructBootloaderTargetRoot(
  rootPath: string
): BootloaderTargetRoot {
  return Object.freeze({ rootPath });
}

export function constructBootloaderMarkers(
  input: BootloaderMarkers
): BootloaderMarkers {
  return Object.freeze({
    startMarker: input.startMarker,
    endMarker: input.endMarker
  });
}

export function constructBootloaderDocumentContract(input: {
  readonly relativePath: string;
  readonly content: string;
  readonly markers: BootloaderMarkers;
}): BootloaderDocumentContract {
  return Object.freeze({
    relativePath: input.relativePath,
    content: input.content,
    markers: constructBootloaderMarkers(input.markers)
  });
}

export function constructInstructionTargetRef(
  input: InstructionTargetRef
): InstructionTargetRef {
  return Object.freeze({
    relativePath: input.relativePath
  });
}

export function constructPublicBootloaderRequest(input: {
  readonly targetRoot: BootloaderTargetRoot;
  readonly bootloaderDocument: BootloaderDocumentContract;
  readonly instructionTargets: readonly InstructionTargetRef[];
}): PublicBootloaderRequest {
  return Object.freeze({
    targetRoot: input.targetRoot,
    bootloaderDocument: input.bootloaderDocument,
    instructionTargets: freezeStringArray(
      input.instructionTargets.map((entry) => constructInstructionTargetRef(entry))
    )
  });
}

export function constructBootloaderPlan(input: {
  readonly relativePath: string;
  readonly content: string;
}): DeliveryPlan {
  const directoryPath =
    input.relativePath.includes("/") ?
      input.relativePath.slice(0, input.relativePath.lastIndexOf("/")) :
      "";
  return constructDeliveryPlan({
    directories:
      directoryPath.length === 0 ? [] : [{ kind: "bootloader_docs", relativePath: directoryPath }],
    files: [{ kind: "bootloader_document", relativePath: input.relativePath, content: input.content }]
  });
}

export function constructBootloaderInstructionVerification(
  input: BootloaderInstructionVerification
): BootloaderInstructionVerification {
  return Object.freeze({
    relativePath: input.relativePath,
    verified: input.verified
  });
}

export function constructBootloaderVerification(input: {
  readonly bootloaderDocument: boolean;
  readonly instructionTargets: readonly BootloaderInstructionVerification[];
}): BootloaderVerification {
  return Object.freeze({
    bootloaderDocument: input.bootloaderDocument,
    instructionTargets: freezeStringArray(
      input.instructionTargets.map((entry) =>
        constructBootloaderInstructionVerification(entry)
      )
    )
  });
}

export function constructInstalledPublicBootloaderOutcome(input: {
  readonly targetRoot: BootloaderTargetRoot;
  readonly plan: DeliveryPlan;
  readonly verification: BootloaderVerification;
}): PublicBootloaderInstalled {
  return Object.freeze({
    kind: "installed",
    targetRoot: input.targetRoot,
    plan: input.plan,
    verification: input.verification
  });
}

export function constructRejectedPublicBootloaderOutcome(input: {
  readonly targetRoot: BootloaderTargetRoot;
  readonly reason: string;
}): PublicBootloaderRejected {
  return Object.freeze({
    kind: "rejected",
    targetRoot: input.targetRoot,
    reason: input.reason
  });
}

export function constructPublicBootloaderOutcome(
  outcome: PublicBootloaderOutcome
): PublicBootloaderOutcome {
  return outcome;
}
