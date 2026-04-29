import type {
  DeliveryDirectoryRef,
  DeliveryFileRef,
  DeliveryPlan,
  DeliveryVerification,
  DeliveryVerificationItem,
  InjectionMarkers,
  InstructionFileRef,
  InstructionInjectionContract,
  InstructionInjectionResult,
  InstructionInjectionUnchanged,
  InstructionInjectionUpdated
} from "./carriers.js";

export function constructDeliveryDirectoryRef(
  input: DeliveryDirectoryRef
): DeliveryDirectoryRef {
  return Object.freeze({
    kind: input.kind,
    relativePath: input.relativePath
  });
}

export function constructDeliveryFileRef(
  input: DeliveryFileRef
): DeliveryFileRef {
  return Object.freeze({
    kind: input.kind,
    relativePath: input.relativePath,
    content: input.content,
    ...(input.writeMode === undefined ? {} : { writeMode: input.writeMode })
  });
}

export function constructDeliveryPlan(input: {
  readonly directories: readonly DeliveryDirectoryRef[];
  readonly files: readonly DeliveryFileRef[];
}): DeliveryPlan {
  return Object.freeze({
    directories: Object.freeze(
      input.directories.map((entry) => constructDeliveryDirectoryRef(entry))
    ),
    files: Object.freeze(input.files.map((entry) => constructDeliveryFileRef(entry)))
  });
}

export function constructDeliveryVerificationItem(
  input: DeliveryVerificationItem
): DeliveryVerificationItem {
  return Object.freeze({
    relativePath: input.relativePath,
    kind: input.kind,
    verified: input.verified
  });
}

export function constructDeliveryVerification(
  input: DeliveryVerificationItem[]
): DeliveryVerification {
  return Object.freeze({
    items: Object.freeze(
      input.map((entry) => constructDeliveryVerificationItem(entry))
    )
  });
}

export function constructInjectionMarkers(
  input: InjectionMarkers
): InjectionMarkers {
  return Object.freeze({
    startMarker: input.startMarker,
    endMarker: input.endMarker
  });
}

export function constructInstructionFileRef(
  input: InstructionFileRef
): InstructionFileRef {
  return Object.freeze({
    relativePath: input.relativePath
  });
}

export function constructInstructionInjectionContract(input: {
  readonly markers: InjectionMarkers;
  readonly targetFile: InstructionFileRef;
  readonly sectionContent: string;
}): InstructionInjectionContract {
  return Object.freeze({
    markers: constructInjectionMarkers(input.markers),
    targetFile: constructInstructionFileRef(input.targetFile),
    sectionContent: input.sectionContent
  });
}

export function constructUpdatedInstructionInjectionResult(
  content: string
): InstructionInjectionUpdated {
  return Object.freeze({
    kind: "updated",
    content
  });
}

export function constructUnchangedInstructionInjectionResult(
  content: string
): InstructionInjectionUnchanged {
  return Object.freeze({
    kind: "unchanged",
    content
  });
}

export function constructInstructionInjectionResult(
  result: InstructionInjectionResult
): InstructionInjectionResult {
  return result;
}
