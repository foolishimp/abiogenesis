// Implements: T-175

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type SdlcFileStoreEffectKind = "read_text_file" | "write_text_file";

export interface SdlcReadTextFilePlan {
  readonly kind: "sdlc_file_store_effect_plan";
  readonly effectKind: "read_text_file";
  readonly absolutePath: string;
  readonly encoding: BufferEncoding;
}

export interface SdlcWriteTextFilePlan {
  readonly kind: "sdlc_file_store_effect_plan";
  readonly effectKind: "write_text_file";
  readonly absolutePath: string;
  readonly content: string;
  readonly encoding: BufferEncoding;
  readonly createParentDirectories: boolean;
}

export type SdlcFileStoreEffectPlan =
  | SdlcReadTextFilePlan
  | SdlcWriteTextFilePlan;

export interface SdlcFileStoreEffectResult {
  readonly kind: "sdlc_file_store_effect_result";
  readonly effectKind: SdlcFileStoreEffectKind;
  readonly absolutePath: string;
  readonly content: string | null;
}

export function constructSdlcReadTextFilePlan(input: {
  readonly absolutePath: string;
  readonly encoding?: BufferEncoding | undefined;
}): SdlcReadTextFilePlan {
  return Object.freeze({
    kind: "sdlc_file_store_effect_plan" as const,
    effectKind: "read_text_file" as const,
    absolutePath: input.absolutePath,
    encoding: input.encoding ?? "utf8"
  });
}

export function constructSdlcWriteTextFilePlan(input: {
  readonly absolutePath: string;
  readonly content: string;
  readonly encoding?: BufferEncoding | undefined;
  readonly createParentDirectories?: boolean | undefined;
}): SdlcWriteTextFilePlan {
  return Object.freeze({
    kind: "sdlc_file_store_effect_plan" as const,
    effectKind: "write_text_file" as const,
    absolutePath: input.absolutePath,
    content: input.content,
    encoding: input.encoding ?? "utf8",
    createParentDirectories: input.createParentDirectories ?? true
  });
}

export function executeSdlcFileStoreEffectPlan(
  plan: SdlcFileStoreEffectPlan
): SdlcFileStoreEffectResult {
  if (plan.effectKind === "read_text_file") {
    return Object.freeze({
      kind: "sdlc_file_store_effect_result" as const,
      effectKind: plan.effectKind,
      absolutePath: plan.absolutePath,
      content: readFileSync(plan.absolutePath, plan.encoding)
    });
  }
  if (plan.createParentDirectories) {
    mkdirSync(dirname(plan.absolutePath), { recursive: true });
  }
  writeFileSync(plan.absolutePath, plan.content, plan.encoding);
  return Object.freeze({
    kind: "sdlc_file_store_effect_result" as const,
    effectKind: plan.effectKind,
    absolutePath: plan.absolutePath,
    content: null
  });
}
