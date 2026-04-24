import {
  constructInstructionInjectionResult,
  constructUnchangedInstructionInjectionResult,
  constructUpdatedInstructionInjectionResult
} from "./constructors.js";
import type {
  InstructionInjectionContract,
  InstructionInjectionResult
} from "./carriers.js";

export function injectMarkedSection(
  existingContent: string | null,
  contract: InstructionInjectionContract
): InstructionInjectionResult {
  const section = `${contract.markers.startMarker}\n${contract.sectionContent}\n${contract.markers.endMarker}`;
  if (existingContent === null || existingContent.length === 0) {
    return constructInstructionInjectionResult(
      constructUpdatedInstructionInjectionResult(`${section}\n`)
    );
  }

  const hasStart = existingContent.includes(contract.markers.startMarker);
  const hasEnd = existingContent.includes(contract.markers.endMarker);
  if (hasStart !== hasEnd) {
    throw new TypeError(
      `${contract.targetFile.relativePath}: instruction markers must appear together`
    );
  }

  if (!hasStart) {
    return constructInstructionInjectionResult(
      constructUpdatedInstructionInjectionResult(
        `${existingContent.replace(/\s+$/, "")}\n\n${section}\n`
      )
    );
  }

  const startIndex = existingContent.indexOf(contract.markers.startMarker);
  const endIndex = existingContent.indexOf(contract.markers.endMarker);
  const afterEnd = endIndex + contract.markers.endMarker.length;
  const updated =
    `${existingContent.slice(0, startIndex)}${section}${existingContent.slice(afterEnd)}`;
  if (updated === existingContent) {
    return constructInstructionInjectionResult(
      constructUnchangedInstructionInjectionResult(existingContent)
    );
  }
  return constructInstructionInjectionResult(
    constructUpdatedInstructionInjectionResult(updated)
  );
}
