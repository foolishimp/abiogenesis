export interface DeliveryDirectoryRef {
  readonly kind: string;
  readonly relativePath: string;
}

export interface DeliveryFileRef {
  readonly kind: string;
  readonly relativePath: string;
  readonly content: string;
}

export interface DeliveryPlan {
  readonly directories: readonly DeliveryDirectoryRef[];
  readonly files: readonly DeliveryFileRef[];
}

export interface DeliveryVerificationItem {
  readonly relativePath: string;
  readonly kind: "file" | "directory";
  readonly verified: boolean;
}

export interface DeliveryVerification {
  readonly items: readonly DeliveryVerificationItem[];
}

export interface DeliveryWriter {
  readonly ensureDirectory: (path: string) => Promise<void>;
  readonly writeTextFile: (path: string, content: string) => Promise<void>;
  readonly readTextFile: (path: string) => Promise<string | null>;
  readonly isDirectory: (path: string) => Promise<boolean>;
  readonly isFile: (path: string) => Promise<boolean>;
}

export interface InjectionMarkers {
  readonly startMarker: string;
  readonly endMarker: string;
}

export interface InstructionFileRef {
  readonly relativePath: string;
}

export interface InstructionInjectionContract {
  readonly markers: InjectionMarkers;
  readonly targetFile: InstructionFileRef;
  readonly sectionContent: string;
}

export interface InstructionInjectionUpdated {
  readonly kind: "updated";
  readonly content: string;
}

export interface InstructionInjectionUnchanged {
  readonly kind: "unchanged";
  readonly content: string;
}

export type InstructionInjectionResult =
  | InstructionInjectionUpdated
  | InstructionInjectionUnchanged;
