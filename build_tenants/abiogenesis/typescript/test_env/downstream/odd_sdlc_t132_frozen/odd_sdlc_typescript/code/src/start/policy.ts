// Implements: REQ-F-ODDSDLC-003
// Implements: REQ-F-ODDSDLC-021

import type { SdlcPublicStartTargetKind } from "./public_start.js";

export type SdlcPublicStartTargetResolver =
  | "published_start_targets"
  | "named_graph_function"
  | "asset_published_action"
  | "overlay_catalog_binding";

export interface SdlcPublicStartTargetPolicyEntry {
  readonly kind: "sdlc_public_start_target_policy_entry";
  readonly targetKind: SdlcPublicStartTargetKind;
  readonly resolver: SdlcPublicStartTargetResolver;
}

export const SDLC_PUBLIC_START_TARGET_POLICY = Object.freeze([
  Object.freeze({
    kind: "sdlc_public_start_target_policy_entry",
    targetKind: "next",
    resolver: "published_start_targets"
  }),
  Object.freeze({
    kind: "sdlc_public_start_target_policy_entry",
    targetKind: "graph_function",
    resolver: "named_graph_function"
  }),
  Object.freeze({
    kind: "sdlc_public_start_target_policy_entry",
    targetKind: "asset",
    resolver: "asset_published_action"
  }),
  Object.freeze({
    kind: "sdlc_public_start_target_policy_entry",
    targetKind: "overlay",
    resolver: "overlay_catalog_binding"
  })
] as const satisfies readonly SdlcPublicStartTargetPolicyEntry[]);

export function publicStartTargetPolicyFor(
  targetKind: SdlcPublicStartTargetKind
): SdlcPublicStartTargetPolicyEntry {
  const matched = SDLC_PUBLIC_START_TARGET_POLICY.find(
    (entry) => entry.targetKind === targetKind
  );
  if (matched === undefined) {
    throw new TypeError(`SdlcPublicStartPolicy: missing policy for ${targetKind}`);
  }
  return matched;
}
