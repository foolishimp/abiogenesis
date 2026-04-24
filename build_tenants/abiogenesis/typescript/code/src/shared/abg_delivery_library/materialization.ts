import {
  constructDeliveryVerification
} from "./constructors.js";
import type {
  DeliveryPlan,
  DeliveryVerification,
  DeliveryVerificationItem,
  DeliveryWriter
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

export async function materializeDeliveryPlan(
  rootPath: string,
  plan: DeliveryPlan,
  writer: DeliveryWriter
): Promise<void> {
  await writer.ensureDirectory(rootPath);
  for (const directory of plan.directories) {
    await writer.ensureDirectory(joinPath(rootPath, directory.relativePath));
  }
  for (const file of plan.files) {
    await writer.writeTextFile(joinPath(rootPath, file.relativePath), file.content);
  }
}

export async function verifyDeliveryPlan(
  rootPath: string,
  plan: DeliveryPlan,
  writer: DeliveryWriter
): Promise<DeliveryVerification> {
  const items: DeliveryVerificationItem[] = [];
  for (const directory of plan.directories) {
    items.push({
      relativePath: directory.relativePath,
      kind: "directory",
      verified: await writer.isDirectory(joinPath(rootPath, directory.relativePath))
    });
  }
  for (const file of plan.files) {
    items.push({
      relativePath: file.relativePath,
      kind: "file",
      verified:
        (await writer.readTextFile(joinPath(rootPath, file.relativePath))) ===
        file.content
    });
  }
  return constructDeliveryVerification(items);
}

export function deliveryVerificationPassed(
  verification: DeliveryVerification
): boolean {
  return verification.items.every((entry) => entry.verified);
}
