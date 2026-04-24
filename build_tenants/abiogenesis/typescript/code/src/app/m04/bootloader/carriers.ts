// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type {
  DeliveryPlan,
  DeliveryWriter
} from "../../../shared/abg_delivery_library/index.js";

export interface BootloaderTargetRoot {
  readonly rootPath: string;
}

export interface BootloaderMarkers {
  readonly startMarker: string;
  readonly endMarker: string;
}

export interface BootloaderDocumentContract {
  readonly relativePath: string;
  readonly content: string;
  readonly markers: BootloaderMarkers;
}

export interface InstructionTargetRef {
  readonly relativePath: string;
}

export interface PublicBootloaderRequest {
  readonly targetRoot: BootloaderTargetRoot;
  readonly bootloaderDocument: BootloaderDocumentContract;
  readonly instructionTargets: readonly InstructionTargetRef[];
}

export interface BootloaderInstructionVerification {
  readonly relativePath: string;
  readonly verified: boolean;
}

export interface BootloaderVerification {
  readonly bootloaderDocument: boolean;
  readonly instructionTargets: readonly BootloaderInstructionVerification[];
}

export interface PublicBootloaderInstalled {
  readonly kind: "installed";
  readonly targetRoot: BootloaderTargetRoot;
  readonly plan: DeliveryPlan;
  readonly verification: BootloaderVerification;
}

export interface PublicBootloaderRejected {
  readonly kind: "rejected";
  readonly targetRoot: BootloaderTargetRoot;
  readonly reason: string;
}

export type PublicBootloaderOutcome =
  | PublicBootloaderInstalled
  | PublicBootloaderRejected;

export type BootloaderWriter = DeliveryWriter;
