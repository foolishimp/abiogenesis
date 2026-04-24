// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  constructInstructionInjectionContract,
  deliveryVerificationPassed,
  injectMarkedSection,
  materializeDeliveryPlan,
  verifyDeliveryPlan
} from "../../../shared/abg_delivery_library/index.js";
import { admitPublicBootloaderRequest } from "./admission.js";
import {
  constructBootloaderPlan,
  constructBootloaderVerification,
  constructInstalledPublicBootloaderOutcome,
  constructPublicBootloaderOutcome,
  constructRejectedPublicBootloaderOutcome
} from "./constructors.js";
import type {
  BootloaderWriter,
  PublicBootloaderOutcome,
  PublicBootloaderRequest
} from "./carriers.js";

function joinPath(root: string, relativePath: string): string {
  if (relativePath.length === 0) {
    return root;
  }
  if (root.endsWith("/")) {
    return `${root}${relativePath}`;
  }
  return `${root}/${relativePath}`;
}

function deriveBootloaderPlan(
  request: PublicBootloaderRequest
) {
  return constructBootloaderPlan({
    relativePath: request.bootloaderDocument.relativePath,
    content: request.bootloaderDocument.content
  });
}

async function injectInstructionTargets(
  request: PublicBootloaderRequest,
  writer: BootloaderWriter
): Promise<readonly { relativePath: string; verified: boolean }[]> {
  const results = [];
  for (const target of request.instructionTargets) {
    const contract = constructInstructionInjectionContract({
      markers: request.bootloaderDocument.markers,
      targetFile: {
        relativePath: target.relativePath
      },
      sectionContent: request.bootloaderDocument.content
    });
    const existingContent = await writer.readTextFile(
      joinPath(request.targetRoot.rootPath, target.relativePath)
    );
    const result = injectMarkedSection(existingContent, contract);
    await writer.writeTextFile(
      joinPath(request.targetRoot.rootPath, target.relativePath),
      result.content
    );
    const written = await writer.readTextFile(
      joinPath(request.targetRoot.rootPath, target.relativePath)
    );
    results.push({
      relativePath: target.relativePath,
      verified:
        written !== null &&
        written.includes(request.bootloaderDocument.markers.startMarker) &&
        written.includes(request.bootloaderDocument.markers.endMarker) &&
        written.includes(request.bootloaderDocument.content)
    });
  }
  return Object.freeze(results);
}

export async function deliverBootloader(
  input: unknown,
  writer: BootloaderWriter
): Promise<PublicBootloaderOutcome> {
  const request = admitPublicBootloaderRequest(input);
  const plan = deriveBootloaderPlan(request);
  await materializeDeliveryPlan(request.targetRoot.rootPath, plan, writer);
  const deliveryVerification = await verifyDeliveryPlan(
    request.targetRoot.rootPath,
    plan,
    writer
  );
  if (!deliveryVerificationPassed(deliveryVerification)) {
    return constructPublicBootloaderOutcome(
      constructRejectedPublicBootloaderOutcome({
        targetRoot: request.targetRoot,
        reason: "bootloader document delivery failed verification"
      })
    );
  }
  try {
    const instructionTargets = await injectInstructionTargets(request, writer);
    const verification = constructBootloaderVerification({
      bootloaderDocument: true,
      instructionTargets
    });
    if (!verification.instructionTargets.every((entry) => entry.verified)) {
      return constructPublicBootloaderOutcome(
        constructRejectedPublicBootloaderOutcome({
          targetRoot: request.targetRoot,
          reason: "bootloader instruction-file injection failed verification"
        })
      );
    }
    return constructPublicBootloaderOutcome(
      constructInstalledPublicBootloaderOutcome({
        targetRoot: request.targetRoot,
        plan,
        verification
      })
    );
  } catch (error) {
    return constructPublicBootloaderOutcome(
      constructRejectedPublicBootloaderOutcome({
        targetRoot: request.targetRoot,
        reason:
          error instanceof Error ? error.message : "bootloader delivery failed"
      })
    );
  }
}
